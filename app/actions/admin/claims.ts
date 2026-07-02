'use server';

import { revalidatePath } from 'next/cache';
import { getPool } from '@/db/neon/client';

import { requireAdmin } from '@/lib/auth/middleware';
import { sendTransactionalEmail } from '@/lib/services/mailer';

const validClaimStatuses = ['unclaimed', 'pending', 'claimed', 'rejected'] as const;
const validClaimRecordStatuses = ['new', 'contacted', 'claimed', 'invalid'] as const;

type ClaimStatus = (typeof validClaimStatuses)[number];
type ClaimRecordStatus = (typeof validClaimRecordStatuses)[number];

export type AdminToolClaim = {
  id: string;
  toolId: string | null;
  toolName: string | null;
  toolStatus: string | null;
  listingName: string;
  email: string;
  company: string | null;
  website: string | null;
  claimReason: string | null;
  note: string | null;
  sourcePath: string | null;
  sourceLocale: string | null;
  status: ClaimRecordStatus;
  claimedAt: string | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminToolClaimsSummary = {
  total: number;
  newCount: number;
  contactedCount: number;
  claimedCount: number;
  invalidCount: number;
  linkedCount: number;
  overdueNewCount: number;
  freshNewCount: number;
  reasonCounts: {
    claimReason: string | null;
    total: number;
    newCount: number;
    contactedCount: number;
    claimedCount: number;
    invalidCount: number;
    overdueNewCount: number;
  }[];
  sourceCounts: {
    sourcePath: string | null;
    total: number;
    newCount: number;
    contactedCount: number;
    claimedCount: number;
    invalidCount: number;
    overdueNewCount: number;
  }[];
};

function normalizeNullableText(value: string | null | undefined): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeClaimStatus(value: string): ClaimStatus | null {
  return (validClaimStatuses as readonly string[]).includes(value) ? (value as ClaimStatus) : null;
}

function normalizeClaimedAt(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function normalizeClaimRecordStatus(value: string): ClaimRecordStatus | null {
  return (validClaimRecordStatuses as readonly string[]).includes(value) ? (value as ClaimRecordStatus) : null;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function notifyClaimStatusChange(input: {
  email: string;
  listingName: string;
  status: ClaimRecordStatus;
}): Promise<void> {
  const displayName = input.listingName.trim() || 'your listing';

  if (input.status === 'new') {
    return;
  }

  const bodyMap: Record<Exclude<ClaimRecordStatus, 'new'>, { subject: string; text: string; html: string }> = {
    contacted: {
      subject: `[AI Best Tool] We reviewed ${displayName}`,
      text: `${displayName} has been reviewed and we are reaching out. We will continue from here if we need anything else.`,
      html: `
        <p>${escapeHtml(displayName)} has been reviewed and we are reaching out.</p>
        <p>We will continue from here if we need anything else.</p>
      `,
    },
    claimed: {
      subject: `[AI Best Tool] ${displayName} was claimed`,
      text: `${displayName} has been marked as claimed. We have linked the owner details and will continue from there.`,
      html: `
        <p>${escapeHtml(displayName)} has been marked as claimed.</p>
        <p>We have linked the owner details and will continue from there.</p>
      `,
    },
    invalid: {
      subject: `[AI Best Tool] ${displayName} needs correction`,
      text: `${displayName} was marked invalid. Please reply if the listing details need to be corrected or if you want to provide updated ownership information.`,
      html: `
        <p>${escapeHtml(displayName)} was marked invalid.</p>
        <p>Please reply if the listing details need to be corrected or if you want to provide updated ownership information.</p>
      `,
    },
  };

  const message = bodyMap[input.status];

  await sendTransactionalEmail({
    to: input.email,
    subject: message.subject,
    text: message.text,
    html: message.html,
  });
}

function normalizeClaimReason(value: string): string | null {
  const allowed = ['ownership_update', 'profile_correction', 'duplicate_merge', 'agency_client', 'other'];
  return allowed.includes(value) ? value : null;
}

function buildClaimWhereClause(filters: { status?: string; search?: string; reason?: string }) {
  const clauses: string[] = [];
  const params: unknown[] = [];
  let index = 1;

  const status = filters.status ? normalizeClaimRecordStatus(filters.status) : null;
  if (status) {
    clauses.push(`tc.status = $${index}`);
    params.push(status);
    index += 1;
  }

  const search = filters.search?.trim();
  if (search) {
    clauses.push(`(
      tc.listing_name ILIKE $${index}
      OR tc.email ILIKE $${index}
      OR COALESCE(tc.company, '') ILIKE $${index}
      OR COALESCE(tc.website, '') ILIKE $${index}
      OR COALESCE(tc.claim_reason, '') ILIKE $${index}
      OR COALESCE(tc.source_path, '') ILIKE $${index}
      OR COALESCE(t.name, '') ILIKE $${index}
    )`);
    params.push(`%${search}%`);
    index += 1;
  }

  const reason = filters.reason ? normalizeClaimReason(filters.reason) : null;
  if (reason) {
    clauses.push(`COALESCE(tc.claim_reason, '') = $${index}`);
    params.push(reason);
    index += 1;
  }

  return { clauses, params, nextIndex: index };
}

export async function getAdminToolClaims(filters?: {
  status?: string;
  search?: string;
  reason?: string;
  limit?: number;
}): Promise<{ claims: AdminToolClaim[]; total: number }> {
  try {
    await requireAdmin();

    const pool = getPool();
    const limit = Math.max(Math.min(filters?.limit || 50, 200), 1);
    const { clauses, params, nextIndex } = buildClaimWhereClause({
      status: filters?.status,
      search: filters?.search,
      reason: filters?.reason,
    });
    const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';

    const countResult = await pool.query(
      `
        SELECT COUNT(*)::int AS count
        FROM tool_claims tc
        LEFT JOIN tools t ON t.id = tc.tool_id
        ${whereClause}
      `,
      params,
    );

    const result = await pool.query(
      `
        SELECT
          tc.id::text AS id,
          tc.tool_id::text AS "toolId",
          t.name AS "toolName",
          t.status AS "toolStatus",
          tc.listing_name AS "listingName",
          tc.email,
          tc.company,
          tc.website,
          tc.claim_reason AS "claimReason",
          tc.note,
          tc.source_path AS "sourcePath",
          tc.source_locale AS "sourceLocale",
          tc.status,
          tc.claimed_at AS "claimedAt",
          tc.reviewed_at AS "reviewedAt",
          tc.reviewed_by::text AS "reviewedBy",
          tc.created_at AS "createdAt",
          tc.updated_at AS "updatedAt"
        FROM tool_claims tc
        LEFT JOIN tools t ON t.id = tc.tool_id
        ${whereClause}
        ORDER BY tc.created_at DESC
        LIMIT $${nextIndex} OFFSET $${nextIndex + 1}
      `,
      [...params, limit, 0],
    );

    return {
      claims: result.rows as AdminToolClaim[],
      total: Number(countResult.rows[0]?.count || 0),
    };
  } catch (error) {
    console.error('Error fetching admin tool claims:', error);
    throw error;
  }
}

export async function getAdminToolClaimsSummary(): Promise<AdminToolClaimsSummary> {
  try {
    await requireAdmin();

    const pool = getPool();
    const [result, reasonResult, sourceResult] = await Promise.all([
      pool.query(
        `
          SELECT
            COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE status = 'new')::int AS "newCount",
            COUNT(*) FILTER (WHERE status = 'new' AND created_at <= NOW() - INTERVAL '48 hours')::int AS "overdueNewCount",
            COUNT(*) FILTER (WHERE status = 'new' AND created_at >= NOW() - INTERVAL '24 hours')::int AS "freshNewCount",
            COUNT(*) FILTER (WHERE status = 'contacted')::int AS "contactedCount",
            COUNT(*) FILTER (WHERE status = 'claimed')::int AS "claimedCount",
            COUNT(*) FILTER (WHERE status = 'invalid')::int AS "invalidCount",
            COUNT(*) FILTER (WHERE tool_id IS NOT NULL)::int AS "linkedCount"
          FROM tool_claims
        `,
      ),
      pool.query(
        `
          SELECT
            NULLIF(claim_reason, '') AS "claimReason",
            COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE status = 'new')::int AS "newCount",
            COUNT(*) FILTER (WHERE status = 'new' AND created_at <= NOW() - INTERVAL '48 hours')::int AS "overdueNewCount",
            COUNT(*) FILTER (WHERE status = 'contacted')::int AS "contactedCount",
            COUNT(*) FILTER (WHERE status = 'claimed')::int AS "claimedCount",
            COUNT(*) FILTER (WHERE status = 'invalid')::int AS "invalidCount"
          FROM tool_claims
          GROUP BY NULLIF(claim_reason, '')
          ORDER BY total DESC, "overdueNewCount" DESC, "claimReason" ASC NULLS LAST
        `,
      ),
      pool.query(
        `
          SELECT
            NULLIF(source_path, '') AS "sourcePath",
            COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE status = 'new')::int AS "newCount",
            COUNT(*) FILTER (WHERE status = 'new' AND created_at <= NOW() - INTERVAL '48 hours')::int AS "overdueNewCount",
            COUNT(*) FILTER (WHERE status = 'contacted')::int AS "contactedCount",
            COUNT(*) FILTER (WHERE status = 'claimed')::int AS "claimedCount",
            COUNT(*) FILTER (WHERE status = 'invalid')::int AS "invalidCount"
          FROM tool_claims
          GROUP BY NULLIF(source_path, '')
          ORDER BY total DESC, "overdueNewCount" DESC, "sourcePath" ASC NULLS LAST
        `,
      ),
    ]);

    const row = result.rows[0] || {};

    return {
      total: Number(row.total || 0),
      newCount: Number(row.newCount || 0),
      contactedCount: Number(row.contactedCount || 0),
      claimedCount: Number(row.claimedCount || 0),
      invalidCount: Number(row.invalidCount || 0),
      linkedCount: Number(row.linkedCount || 0),
      overdueNewCount: Number(row.overdueNewCount || 0),
      freshNewCount: Number(row.freshNewCount || 0),
      reasonCounts: reasonResult.rows.map((reasonRow) => ({
        claimReason:
          typeof reasonRow.claimReason === 'string' && reasonRow.claimReason.trim() ? reasonRow.claimReason : null,
        total: Number(reasonRow.total || 0),
        newCount: Number(reasonRow.newCount || 0),
        contactedCount: Number(reasonRow.contactedCount || 0),
        claimedCount: Number(reasonRow.claimedCount || 0),
        invalidCount: Number(reasonRow.invalidCount || 0),
        overdueNewCount: Number(reasonRow.overdueNewCount || 0),
      })),
      sourceCounts: sourceResult.rows.map((sourceRow) => ({
        sourcePath:
          typeof sourceRow.sourcePath === 'string' && sourceRow.sourcePath.trim() ? sourceRow.sourcePath : null,
        total: Number(sourceRow.total || 0),
        newCount: Number(sourceRow.newCount || 0),
        contactedCount: Number(sourceRow.contactedCount || 0),
        claimedCount: Number(sourceRow.claimedCount || 0),
        invalidCount: Number(sourceRow.invalidCount || 0),
        overdueNewCount: Number(sourceRow.overdueNewCount || 0),
      })),
    };
  } catch (error) {
    console.error('Error fetching admin tool claims summary:', error);
    throw error;
  }
}

export async function updateToolClaimInfo(input: {
  toolId: string;
  ownerEmail?: string | null;
  claimStatus?: string;
  claimedAt?: string | null;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const adminUser = await requireAdmin();

    const claimStatus = normalizeClaimStatus(input.claimStatus ?? 'unclaimed');

    if (!claimStatus) {
      return { success: false, error: 'Invalid claim status.' };
    }

    const ownerEmail = normalizeNullableText(input.ownerEmail);
    const claimedAtInput = normalizeClaimedAt(input.claimedAt ?? null);
    const claimedAt = claimStatus === 'claimed' ? claimedAtInput || new Date().toISOString() : claimedAtInput;
    const updatedByEmail = normalizeNullableText(adminUser.email || adminUser.id || undefined);

    const pool = getPool();
    const result = await pool.query(
      `
        UPDATE tools
        SET
          owner_email = $1,
          claim_status = $2,
          claimed_at = $3,
          features = CASE
            WHEN $2 = 'claimed' THEN jsonb_set(
              COALESCE(features, '{}'::jsonb),
              '{outreach}',
              COALESCE(features->'outreach', '{}'::jsonb)
                || jsonb_build_object(
                  'status', 'closed',
                  'updatedAt', NOW()::text,
                  'closedReason', 'claimed',
                  'updatedByEmail', $5::text
                ),
              true
            )
            ELSE COALESCE(features, '{}'::jsonb)
          END,
          updated_at = NOW()
        WHERE id = $4
        RETURNING name
      `,
      [ownerEmail, claimStatus, claimStatus === 'unclaimed' ? null : claimedAt, input.toolId, updatedByEmail],
    );

    if (result.rowCount === 0) {
      return { success: false, error: 'Tool not found.' };
    }

    revalidatePath('/admin/tools');
    revalidatePath('/admin/analytics');

    return { success: true };
  } catch (error) {
    console.error('Error updating tool claim info:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update tool claim info.',
    };
  }
}

export async function updateToolClaimStatus(input: {
  claimId: string;
  status: string;
  toolId?: string | null;
  ownerEmail?: string | null;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const adminUser = await requireAdmin();
    const status = normalizeClaimRecordStatus(input.status);

    if (!status) {
      return { success: false, error: 'Invalid claim status.' };
    }

    const pool = getPool();
    const current = await pool.query(
      `
        SELECT tc.tool_id, tc.email, tc.claimed_at, tc.status, tc.listing_name
        FROM tool_claims tc
        WHERE tc.id = $1
      `,
      [input.claimId],
    );

    if (current.rowCount === 0) {
      return { success: false, error: 'Claim not found.' };
    }

    const row = current.rows[0];
    const nextClaimedAt = status === 'claimed' ? row.claimed_at || new Date().toISOString() : row.claimed_at;
    const nextToolId = input.toolId || row.tool_id;
    const updatedByEmail = normalizeNullableText(adminUser.email || adminUser.id || undefined);

    await pool.query(
      `
        UPDATE tool_claims
        SET status = $1, claimed_at = $2, reviewed_at = NOW(), reviewed_by = $3, updated_at = NOW()
        WHERE id = $4
      `,
      [status, nextClaimedAt, adminUser.id, input.claimId],
    );

    if (status === 'claimed' && nextToolId) {
      await pool.query(
        `
          UPDATE tools
          SET
            owner_email = COALESCE($1, owner_email),
            claim_status = 'claimed',
            claimed_at = COALESCE(claimed_at, NOW()),
            features = jsonb_set(
              COALESCE(features, '{}'::jsonb),
              '{outreach}',
              COALESCE(features->'outreach', '{}'::jsonb)
                || jsonb_build_object(
                  'status', 'closed',
                  'updatedAt', NOW()::text,
                  'closedReason', 'claimed',
                  'updatedByEmail', $3::text
                ),
              true
            ),
            updated_at = NOW()
          WHERE id = $2
        `,
        [input.ownerEmail || row.email || null, nextToolId, updatedByEmail],
      );
    }

    await notifyClaimStatusChange({
      email: row.email,
      listingName: String(row.listing_name || ''),
      status,
    });

    revalidatePath('/admin/claims');
    revalidatePath('/admin/tools');
    revalidatePath('/admin/analytics');

    return { success: true };
  } catch (error) {
    console.error('Error updating claim status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update claim status.',
    };
  }
}
