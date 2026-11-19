import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

import { getPool } from '@/db/neon/client';
import { isAdminUser } from '@/lib/auth/admin';
import { createAdminClient } from '@/lib/supabase/admin';

export type ToolPricing = 'free' | 'freemium' | 'paid';

/** Explicit null means unconfirmed; omission means leave the existing value alone. */
export function parseToolPricingPatch(value: unknown): ToolPricing | null | undefined {
  if (value === undefined || value === null) return value;
  if (value !== 'free' && value !== 'freemium' && value !== 'paid') {
    throw new Error('Invalid pricing value');
  }
  return value;
}

export const toolPricingSnapshotHash = (row: unknown) =>
  createHash('sha256').update(JSON.stringify(row)).digest('hex');

/** Shared Admin/controlled-job edit, draft-only; never publishes or changes evidence. */
export async function updateDraftToolPricing(input: {
  toolId: string;
  reviewerId: string;
  expectedHash: string;
  pricing: ToolPricing | null;
  mode: 'rollback' | 'commit';
}) {
  assert.match(input.toolId, /^[0-9a-f-]{36}$/i);
  assert.match(input.reviewerId, /^[0-9a-f-]{36}$/i);
  assert.match(input.expectedHash, /^[a-f0-9]{64}$/);
  assert.ok(input.mode === 'rollback' || input.mode === 'commit');
  const pricing = parseToolPricingPatch(input.pricing);
  assert.notEqual(pricing, undefined, 'An explicit pricing value is required');
  const { data, error } = await createAdminClient().auth.admin.getUserById(input.reviewerId);
  assert.ok(!error && isAdminUser(data.user), 'Reviewer is not an approved administrator');
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    await client.query("SET LOCAL lock_timeout='5s'");
    await client.query("SET LOCAL statement_timeout='30s'");
    const found = await client.query('SELECT to_jsonb(t) AS row FROM tools t WHERE id=$1 FOR UPDATE', [input.toolId]);
    assert.equal(found.rowCount, 1, 'Tool not found');
    const before = found.rows[0].row;
    assert.equal(before.status, 'draft', 'Pricing-only preparation is draft-only');
    assert.equal(toolPricingSnapshotHash(before), input.expectedHash, 'Draft pricing preimage changed');
    if (before.pricing === pricing) {
      await client.query('ROLLBACK');
      return { alreadyApplied: true, productionWrites: 0, before, after: before };
    }
    const result = await client.query(`UPDATE tools t SET pricing=$2, updated_at=NOW()
      WHERE id=$1 AND status='draft' AND pricing IS NOT DISTINCT FROM $3
      RETURNING to_jsonb(t) AS row`, [input.toolId, pricing, before.pricing]);
    assert.equal(result.rowCount, 1, 'Draft pricing update rejected');
    const after = result.rows[0].row;
    assert.equal(after.pricing, pricing);
    for (const key of Object.keys(before).filter((key) => key !== 'pricing' && key !== 'updated_at')) {
      assert.deepEqual(after[key], before[key], `Protected pricing edit field: ${key}`);
    }
    await client.query(input.mode === 'commit' ? 'COMMIT' : 'ROLLBACK');
    return { alreadyApplied: false, productionWrites: input.mode === 'commit' ? 1 : 0, before, after };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
