'use server';

import { requireAdmin } from '@/lib/auth/middleware';
import { BASE_URL } from '@/lib/env';
import { sendTransactionalEmail } from '@/lib/services/mailer';
import { query } from '@/db/neon/client';

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function sendTestEmail(input: {
  to: string;
}): Promise<{ success: boolean; error?: string; skipped?: boolean }> {
  try {
    await requireAdmin();

    const to = input.to.trim();
    if (!isValidEmail(to)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    const result = await sendTransactionalEmail({
      to,
      subject: '[AI Best Tool] Test email',
      text: 'This is a test email from AI Best Tool admin console.',
      html: `
        <p>This is a test email from AI Best Tool admin console.</p>
        <p>If you received this email, your mailer config is working.</p>
        <p><a href="${BASE_URL}">${BASE_URL}</a></p>
      `,
    });

    await ensureEmailTestLogTable();
    await query(
      `
        INSERT INTO email_test_logs (to_email, success, skipped, error_message, created_at)
        VALUES ($1, $2, $3, $4, NOW())
      `,
      [to, result.success, Boolean(result.skipped), result.error || null]
    );

    if (!result.success) {
      return { success: false, error: result.error, skipped: result.skipped };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send test email.',
    };
  }
}

export async function getEmailTestLogs(
  limit = 20,
  status: 'all' | 'success' | 'failed' | 'skipped' = 'all',
  recentHours?: number
): Promise<
  Array<{
    id: string;
    toEmail: string;
    success: boolean;
    skipped: boolean;
    errorMessage: string | null;
    createdAt: string;
  }>
> {
  await requireAdmin();
  await ensureEmailTestLogTable();

  const whereClauses: string[] = [];
  if (status === 'success') {
    whereClauses.push('success = true');
  } else if (status === 'failed') {
    whereClauses.push('success = false AND skipped = false');
  } else if (status === 'skipped') {
    whereClauses.push('skipped = true');
  }
  if (recentHours && recentHours > 0) {
    whereClauses.push(`created_at >= NOW() - INTERVAL '${Math.floor(recentHours)} hours'`);
  }
  const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const result = await query(
    `
      SELECT
        id::text AS id,
        to_email AS "toEmail",
        success,
        skipped,
        error_message AS "errorMessage",
        created_at AS "createdAt"
      FROM email_test_logs
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $1
    `,
    [Math.max(1, Math.min(limit, 100))]
  );

  return result.rows;
}

async function ensureEmailTestLogTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS email_test_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      to_email TEXT NOT NULL,
      success BOOLEAN NOT NULL DEFAULT FALSE,
      skipped BOOLEAN NOT NULL DEFAULT FALSE,
      error_message TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await query(
    'CREATE INDEX IF NOT EXISTS idx_email_test_logs_created_at ON email_test_logs(created_at DESC)'
  );

  await query('ALTER TABLE email_test_logs ENABLE ROW LEVEL SECURITY');
}
