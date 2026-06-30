import { query } from '@/db/neon/client';

import { requireAdmin } from '@/lib/auth/middleware';

export const EMAIL_OPS_LOG_TABLES = {
  claimInvites: 'claim_invite_reminder_logs',
  featuredRenewals: 'featured_renewal_reminder_logs',
} as const;

async function ensureClaimInviteReminderLogTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS ${EMAIL_OPS_LOG_TABLES.claimInvites} (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tool_id UUID NOT NULL,
      reminder_type TEXT NOT NULL,
      recipient_email TEXT NOT NULL,
      sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await query(`
    CREATE UNIQUE INDEX IF NOT EXISTS uq_claim_invite_reminder_logs
    ON ${EMAIL_OPS_LOG_TABLES.claimInvites}(tool_id, reminder_type)
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_claim_invite_reminder_logs_sent_at
    ON ${EMAIL_OPS_LOG_TABLES.claimInvites}(sent_at DESC)
  `);
}

async function ensureFeaturedRenewalReminderLogTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS ${EMAIL_OPS_LOG_TABLES.featuredRenewals} (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tool_id UUID NOT NULL,
      reminder_type TEXT NOT NULL,
      featured_until TIMESTAMPTZ NOT NULL,
      recipient_email TEXT NOT NULL,
      sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await query(`
    CREATE UNIQUE INDEX IF NOT EXISTS uq_featured_renewal_reminder_logs
    ON ${EMAIL_OPS_LOG_TABLES.featuredRenewals}(tool_id, reminder_type, featured_until)
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_featured_renewal_reminder_logs_sent_at
    ON ${EMAIL_OPS_LOG_TABLES.featuredRenewals}(sent_at DESC)
  `);
}

export async function getEmailOpsSummaryBySystem(): Promise<{
  success: boolean;
  claimInvitesSent24h: number;
  claimInvitesLastSentAt: string | null;
  featuredRenewalsSent24h: number;
  featuredRenewalsLastSentAt: string | null;
  error?: string;
}> {
  try {
    await requireAdmin();
    await Promise.all([ensureClaimInviteReminderLogTable(), ensureFeaturedRenewalReminderLogTable()]);

    const [claimInviteResult, featuredRenewalResult] = await Promise.all([
      query(
        `
          SELECT
            COUNT(*) FILTER (WHERE sent_at >= NOW() - INTERVAL '24 hours')::int AS sent_24h,
            MAX(sent_at) AS last_sent_at
          FROM ${EMAIL_OPS_LOG_TABLES.claimInvites}
        `,
      ),
      query(
        `
          SELECT
            COUNT(*) FILTER (WHERE sent_at >= NOW() - INTERVAL '24 hours')::int AS sent_24h,
            MAX(sent_at) AS last_sent_at
          FROM ${EMAIL_OPS_LOG_TABLES.featuredRenewals}
        `,
      ),
    ]);

    return {
      success: true,
      claimInvitesSent24h: Number(claimInviteResult.rows[0]?.sent_24h || 0),
      claimInvitesLastSentAt: claimInviteResult.rows[0]?.last_sent_at || null,
      featuredRenewalsSent24h: Number(featuredRenewalResult.rows[0]?.sent_24h || 0),
      featuredRenewalsLastSentAt: featuredRenewalResult.rows[0]?.last_sent_at || null,
    };
  } catch (error) {
    console.error('Error loading email ops summary:', error);
    return {
      success: false,
      claimInvitesSent24h: 0,
      claimInvitesLastSentAt: null,
      featuredRenewalsSent24h: 0,
      featuredRenewalsLastSentAt: null,
      error: error instanceof Error ? error.message : 'Failed to load email ops summary',
    };
  }
}
