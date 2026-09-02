import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const migrationPath = path.join(
  process.cwd(),
  'db/supabase/migrations/20260902_stack_audit_trial_foundation.sql',
);
const sql = fs.readFileSync(migrationPath, 'utf8');

const tables = [
  'user_tool_stack_items',
  'user_tool_stack_item_tasks',
  'stack_audit_runs',
  'stack_audit_findings',
  'stack_audit_finding_claims',
  'trial_scorecards',
  'trial_scorecard_checks',
];

for (const table of tables) {
  assert.match(sql, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}\\b`));
  assert.match(sql, new RegExp(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`));
}

assert.doesNotMatch(sql, /REFERENCES\s+(?:public\.)?tools\s*\(/i);
assert.match(sql, /billing_amount NUMERIC\(12,2\)/);
assert.match(sql, /cost_normalization JSONB/);
assert.match(sql, /idx_stack_audit_user_idempotency/);
assert.match(sql, /idx_trial_scorecard_user_idempotency/);
assert.match(sql, /assert_stack_audit_item_ownership/);
assert.match(sql, /assert_trial_session_ownership/);
assert.match(sql, /auth\.uid\(\) = user_id/);
assert.match(sql, /Users can manage own stack items/);
assert.match(sql, /Users can create own pending stack audits/);
assert.match(sql, /Users can view own stack audit findings/);
assert.match(sql, /Users can manage own trial scorecards/);
assert.match(sql, /Users can manage own trial checks/);
assert.doesNotMatch(sql, /Public can (?:view|manage).*stack/i);
assert.doesNotMatch(sql, /Public can (?:view|manage).*trial/i);
assert.doesNotMatch(sql, /Users can (?:create|update|manage) own stack audit findings/i);
assert.match(sql, /status = 'pending'/);
assert.match(sql, /INTERVAL '7 days'/);

console.log(
  JSON.stringify(
    {
      success: true,
      tablesChecked: tables.length,
      crossStoreForeignKeys: false,
      privateRlsBoundary: true,
      auditOutputsServerWriteOnly: true,
      idempotencyProtected: true,
    },
    null,
    2,
  ),
);
