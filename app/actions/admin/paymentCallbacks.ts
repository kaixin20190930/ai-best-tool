'use server';

import { query } from '@/db/neon/client';
import { requireAdmin } from '@/lib/auth/middleware';

export type PaymentCallbackLogStatus = 'success' | 'failed';

type InsertPaymentCallbackLogInput = {
  toolId: string | null;
  transactionId?: string | null;
  status: PaymentCallbackLogStatus;
  source?: string | null;
  errorMessage?: string | null;
  payload?: Record<string, unknown> | null;
};

export async function insertPaymentCallbackLog(input: InsertPaymentCallbackLogInput): Promise<void> {
  await ensurePaymentCallbackLogTable();
  await query(
    `
      INSERT INTO payment_callback_logs (
        tool_id,
        transaction_id,
        status,
        source,
        error_message,
        payload
      )
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
    [
      input.toolId,
      input.transactionId || null,
      input.status,
      input.source || null,
      input.errorMessage || null,
      input.payload ? JSON.stringify(input.payload) : null,
    ]
  );
}

export async function hasSuccessfulPaymentCallbackByTransactionId(
  transactionId: string
): Promise<boolean> {
  await ensurePaymentCallbackLogTable();
  const normalized = transactionId.trim();
  if (!normalized) return false;

  const result = await query(
    `
      SELECT 1
      FROM payment_callback_logs
      WHERE transaction_id = $1
        AND status = 'success'
      LIMIT 1
    `,
    [normalized]
  );

  return (result.rowCount || 0) > 0;
}

export async function getPaymentCallbackLogs(
  limit = 50,
  status: 'all' | 'success' | 'failed' = 'all',
  recentHours?: number
): Promise<
  Array<{
    id: string;
    toolId: string | null;
    transactionId: string | null;
    status: PaymentCallbackLogStatus;
    source: string | null;
    errorMessage: string | null;
    createdAt: string;
  }>
> {
  await requireAdmin();
  await ensurePaymentCallbackLogTable();

  const whereClauses: string[] = [];
  if (status === 'success' || status === 'failed') {
    whereClauses.push(`status = '${status}'`);
  }
  if (recentHours && recentHours > 0) {
    whereClauses.push(`created_at >= NOW() - INTERVAL '${Math.floor(recentHours)} hours'`);
  }
  const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const result = await query(
    `
      SELECT
        id::text AS id,
        tool_id::text AS "toolId",
        transaction_id AS "transactionId",
        status,
        source,
        error_message AS "errorMessage",
        created_at AS "createdAt"
      FROM payment_callback_logs
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $1
    `,
    [Math.max(1, Math.min(limit, 200))]
  );

  return result.rows;
}

async function ensurePaymentCallbackLogTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS payment_callback_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tool_id UUID,
      transaction_id TEXT,
      status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
      source TEXT,
      error_message TEXT,
      payload JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_payment_callback_logs_created_at
    ON payment_callback_logs(created_at DESC)
  `);
  await query(`
    CREATE INDEX IF NOT EXISTS idx_payment_callback_logs_status
    ON payment_callback_logs(status)
  `);
  await query(`
    CREATE INDEX IF NOT EXISTS idx_payment_callback_logs_tool_id
    ON payment_callback_logs(tool_id)
  `);
  await query(`
    CREATE UNIQUE INDEX IF NOT EXISTS uq_payment_callback_logs_success_tx
    ON payment_callback_logs(transaction_id)
    WHERE transaction_id IS NOT NULL AND status = 'success'
  `);
}
