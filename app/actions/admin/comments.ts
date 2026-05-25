'use server';

import { revalidatePath } from 'next/cache';
import { query } from '@/db/neon/client';
import { requireAdmin } from '@/lib/auth/middleware';
import { sendTransactionalEmail } from '@/lib/services/mailer';

export interface AdminCommentItem {
  id: string;
  toolId: string;
  toolName: string;
  userId: string;
  content: string;
  likes: number;
  reportCount: number;
  unresolvedReportCount: number;
  lastResolvedAt: string | null;
  isHidden: boolean;
  hiddenReason: string | null;
  createdAt: string;
}

export interface AdminCommentModerationSummary {
  unresolvedReportedComments: number;
  autoHiddenComments: number;
}

export interface AdminCommentModerationLogItem {
  id: string;
  action: string;
  targetCount: number;
  createdAt: string;
}

async function ensureCommentModerationColumns() {
  await query(`
    ALTER TABLE comments
    ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN NOT NULL DEFAULT FALSE
  `);
  await query(`
    ALTER TABLE comments
    ADD COLUMN IF NOT EXISTS hidden_reason TEXT
  `);
}

async function ensureCommentReportsTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS comment_reports (
      comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
      user_id UUID NOT NULL,
      reason TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (comment_id, user_id)
    )
  `);
  await query(`
    ALTER TABLE comment_reports
    ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ
  `);
  await query(`
    ALTER TABLE comment_reports
    ADD COLUMN IF NOT EXISTS resolved_by UUID
  `);
}

async function ensureCommentModerationLogsTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS comment_moderation_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      admin_user_id UUID,
      action TEXT NOT NULL,
      target_count INTEGER NOT NULL DEFAULT 1,
      metadata JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await query(`
    ALTER TABLE comment_moderation_logs
    ALTER COLUMN admin_user_id DROP NOT NULL
  `);
  await query(
    'CREATE INDEX IF NOT EXISTS idx_comment_moderation_logs_created_at ON comment_moderation_logs(created_at DESC)'
  );
}

async function addModerationLog(input: {
  adminUserId?: string | null;
  action: string;
  targetCount: number;
  metadata?: Record<string, unknown>;
}) {
  await ensureCommentModerationLogsTable();
  await query(
    `
      INSERT INTO comment_moderation_logs (admin_user_id, action, target_count, metadata, created_at)
      VALUES ($1, $2, $3, $4::jsonb, NOW())
    `,
    [input.adminUserId || null, input.action, input.targetCount, JSON.stringify(input.metadata || {})]
  );
}

export async function getAdminComments(input?: {
  status?: 'all' | 'visible' | 'hidden';
  reportState?: 'all' | 'unresolved';
  sort?: 'latest' | 'reports';
  limit?: number;
}): Promise<AdminCommentItem[]> {
  await requireAdmin();
  await ensureCommentModerationColumns();
  await ensureCommentReportsTable();

  const status = input?.status || 'all';
  const reportState = input?.reportState || 'all';
  const sort = input?.sort || 'reports';
  const limit = Math.max(1, Math.min(input?.limit || 100, 300));

  const whereClauses: string[] = [];
  if (status === 'visible') {
    whereClauses.push('c.is_hidden = FALSE');
  } else if (status === 'hidden') {
    whereClauses.push('c.is_hidden = TRUE');
  }
  if (reportState === 'unresolved') {
    whereClauses.push('COALESCE(cr.unresolved_report_count, 0) > 0');
  }
  const statusClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const orderClause =
    sort === 'latest'
      ? 'ORDER BY c.created_at DESC'
      : 'ORDER BY report_count DESC, c.created_at DESC';

  const result = await query<AdminCommentItem>(
    `
      SELECT
        c.id::text AS id,
        c.tool_id::text AS "toolId",
        COALESCE(t.name, 'Unknown tool') AS "toolName",
        c.user_id::text AS "userId",
        c.content,
        COALESCE(c.likes, 0) AS likes,
        COALESCE(cr.report_count, 0) AS "reportCount",
        COALESCE(cr.unresolved_report_count, 0) AS "unresolvedReportCount",
        cr.last_resolved_at AS "lastResolvedAt",
        c.is_hidden AS "isHidden",
        c.hidden_reason AS "hiddenReason",
        c.created_at AS "createdAt"
      FROM comments c
      LEFT JOIN tools t ON t.id = c.tool_id
      LEFT JOIN (
        SELECT
          comment_id,
          COUNT(*)::int AS report_count,
          COUNT(*) FILTER (WHERE resolved_at IS NULL)::int AS unresolved_report_count,
          MAX(resolved_at) AS last_resolved_at
        FROM comment_reports
        GROUP BY comment_id
      ) cr ON cr.comment_id = c.id
      ${statusClause}
      ${orderClause}
      LIMIT $1
    `,
    [limit]
  );

  return result.rows;
}

export async function setCommentReportsResolved(
  commentId: string,
  resolved: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const adminUser = await requireAdmin();
    await ensureCommentReportsTable();

    if (resolved) {
      await query(
        `
          UPDATE comment_reports
          SET resolved_at = NOW(), resolved_by = $2
          WHERE comment_id = $1 AND resolved_at IS NULL
        `,
        [commentId, adminUser.id]
      );
    } else {
      await query(
        `
          UPDATE comment_reports
          SET resolved_at = NULL, resolved_by = NULL
          WHERE comment_id = $1
        `,
        [commentId]
      );
    }

    await addModerationLog({
      adminUserId: adminUser.id,
      action: resolved ? 'resolve_reports' : 'reopen_reports',
      targetCount: 1,
      metadata: { commentId },
    });

    revalidatePath('/admin/comments');
    revalidatePath('/admin/analytics');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update report state.',
    };
  }
}

export async function setCommentHidden(
  commentId: string,
  hidden: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const adminUser = await requireAdmin();
    await ensureCommentModerationColumns();

    const result = await query(
      `
        UPDATE comments
        SET
          is_hidden = $1,
          hidden_reason = CASE WHEN $1 THEN COALESCE(hidden_reason, 'manual') ELSE NULL END,
          updated_at = NOW()
        WHERE id = $2
      `,
      [hidden, commentId]
    );

    if ((result.rowCount || 0) === 0) {
      return { success: false, error: 'Comment not found.' };
    }

    await addModerationLog({
      adminUserId: adminUser.id,
      action: hidden ? 'hide_comment' : 'show_comment',
      targetCount: 1,
      metadata: { commentId },
    });

    revalidatePath('/admin/comments');
    revalidatePath('/admin/analytics');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update comment visibility.',
    };
  }
}

export async function bulkSetCommentsHidden(
  commentIds: string[],
  hidden: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const adminUser = await requireAdmin();
    await ensureCommentModerationColumns();

    const ids = Array.from(new Set(commentIds.filter(Boolean)));
    if (ids.length === 0) {
      return { success: false, error: 'No comments selected.' };
    }

    await query(
      `
        UPDATE comments
        SET
          is_hidden = $1,
          hidden_reason = CASE WHEN $1 THEN COALESCE(hidden_reason, 'manual') ELSE NULL END,
          updated_at = NOW()
        WHERE id = ANY($2::uuid[])
      `,
      [hidden, ids]
    );

    await addModerationLog({
      adminUserId: adminUser.id,
      action: hidden ? 'bulk_hide_comments' : 'bulk_show_comments',
      targetCount: ids.length,
      metadata: { ids },
    });

    revalidatePath('/admin/comments');
    revalidatePath('/admin/analytics');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update comment visibility.',
    };
  }
}

export async function bulkSetReportsResolved(
  commentIds: string[],
  resolved: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const adminUser = await requireAdmin();
    await ensureCommentReportsTable();

    const ids = Array.from(new Set(commentIds.filter(Boolean)));
    if (ids.length === 0) {
      return { success: false, error: 'No comments selected.' };
    }

    if (resolved) {
      await query(
        `
          UPDATE comment_reports
          SET resolved_at = NOW(), resolved_by = $2
          WHERE comment_id = ANY($1::uuid[]) AND resolved_at IS NULL
        `,
        [ids, adminUser.id]
      );
    } else {
      await query(
        `
          UPDATE comment_reports
          SET resolved_at = NULL, resolved_by = NULL
          WHERE comment_id = ANY($1::uuid[])
        `,
        [ids]
      );
    }

    await addModerationLog({
      adminUserId: adminUser.id,
      action: resolved ? 'bulk_resolve_reports' : 'bulk_reopen_reports',
      targetCount: ids.length,
      metadata: { ids },
    });

    revalidatePath('/admin/comments');
    revalidatePath('/admin/analytics');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update report state.',
    };
  }
}

export async function getRecentCommentModerationLogs(input?: {
  limit?: number;
  action?: string;
}): Promise<AdminCommentModerationLogItem[]> {
  await requireAdmin();
  await ensureCommentModerationLogsTable();
  const limit = input?.limit ?? 20;
  const action = (input?.action || '').trim();

  const whereClause = action ? 'WHERE action = $2' : '';
  const params = action
    ? [Math.max(1, Math.min(limit, 1000)), action]
    : [Math.max(1, Math.min(limit, 1000))];

  const result = await query<AdminCommentModerationLogItem>(
    `
      SELECT
        id::text AS id,
        action,
        target_count AS "targetCount",
        created_at AS "createdAt"
      FROM comment_moderation_logs
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $1
    `,
    params
  );

  return result.rows;
}

export async function getCommentModerationSummary(): Promise<AdminCommentModerationSummary> {
  await requireAdmin();
  await ensureCommentModerationColumns();
  await ensureCommentReportsTable();

  const unresolvedResult = await query<{ count: string }>(
    `
      SELECT COUNT(DISTINCT comment_id)::text AS count
      FROM comment_reports
      WHERE resolved_at IS NULL
    `
  );
  const autoHiddenResult = await query<{ count: string }>(
    `
      SELECT COUNT(*)::text AS count
      FROM comments
      WHERE is_hidden = TRUE AND hidden_reason = 'auto_report_threshold'
    `
  );

  return {
    unresolvedReportedComments: parseInt(unresolvedResult.rows[0]?.count || '0', 10),
    autoHiddenComments: parseInt(autoHiddenResult.rows[0]?.count || '0', 10),
  };
}

export async function sendCommentModerationDailyReport(): Promise<{
  success: boolean;
  error?: string;
  skipped?: boolean;
}> {
  try {
    const adminUser = await requireAdmin();
    return sendCommentModerationDailyReportInternal(adminUser.id, 'manual');
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send report.',
    };
  }
}

export async function sendCommentModerationDailyReportBySystem(): Promise<{
  success: boolean;
  error?: string;
  skipped?: boolean;
}> {
  return sendCommentModerationDailyReportInternal(null, 'scheduled');
}

async function sendCommentModerationDailyReportInternal(
  actorUserId: string | null,
  trigger: 'manual' | 'scheduled'
) {
  try {
    const adminEmails = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((email) => email.trim())
      .filter(Boolean);

    if (adminEmails.length === 0) {
      return { success: false, error: 'ADMIN_EMAILS is not configured.' };
    }

    const summary = await getCommentModerationSummary();
    const recentLogs = await getRecentCommentModerationLogs({ limit: 10 });
    const now = new Date();

    const subject = `[AI Best Tool] Comment Moderation Daily Report - ${now.toISOString().slice(0, 10)}`;
    const logsHtml = recentLogs
      .map(
        (log) =>
          `<li><strong>${log.action}</strong> x${log.targetCount} <span style="color:#64748b">(${new Date(log.createdAt).toLocaleString()})</span></li>`
      )
      .join('');

    const html = `
      <h2>Comment Moderation Daily Report</h2>
      <p>Generated at: ${now.toLocaleString()}</p>
      <ul>
        <li>Unresolved reported comments: <strong>${summary.unresolvedReportedComments}</strong></li>
        <li>Auto-hidden comments: <strong>${summary.autoHiddenComments}</strong></li>
      </ul>
      <h3>Recent actions (last 10)</h3>
      <ul>${logsHtml || '<li>No actions</li>'}</ul>
    `;

    for (const email of adminEmails) {
      const result = await sendTransactionalEmail({
        to: email,
        subject,
        html,
        text: `Comment moderation report: unresolved=${summary.unresolvedReportedComments}, autoHidden=${summary.autoHiddenComments}`,
      });
      if (!result.success) {
        return { success: false, error: result.error, skipped: result.skipped };
      }
    }

    await addModerationLog({
      adminUserId: actorUserId,
      action: 'send_daily_report',
      targetCount: adminEmails.length,
      metadata: { recipients: adminEmails, trigger },
    });

    revalidatePath('/admin/comments');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send report.',
    };
  }
}
