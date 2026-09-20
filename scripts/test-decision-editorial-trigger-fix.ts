import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const migrationPath = path.join(
  process.cwd(),
  'db/supabase/migrations/20260920_fix_decision_editorial_trigger.sql',
);
const sql = fs.readFileSync(migrationPath, 'utf8');

assert.match(sql, /CREATE OR REPLACE FUNCTION assert_decision_editorial_publishable/);

for (const table of ['tool_decision_profiles', 'tool_task_fits', 'tool_relationships']) {
  assert.match(sql, new RegExp(`IF TG_TABLE_NAME = '${table}' THEN`));
}

assert.doesNotMatch(sql, /TG_TABLE_NAME = 'tool_decision_profiles' AND NEW\.editorial_status/);
assert.doesNotMatch(sql, /TG_TABLE_NAME = 'tool_task_fits' AND NEW\.status/);
assert.doesNotMatch(sql, /TG_TABLE_NAME = 'tool_relationships' AND NEW\.status/);
assert.match(sql, /NEW\.editorial_status <> 'published'/);
assert.match(sql, /NEW\.status <> 'published'/);
assert.match(sql, /Published decision records require reviewed_at and verified evidence/);

console.log(JSON.stringify({ success: true, tableBranches: 3 }, null, 2));
