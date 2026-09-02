import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const migrationPath = path.join(process.cwd(), 'db/supabase/migrations/20260902_decision_finder_foundation.sql');
const sql = fs.readFileSync(migrationPath, 'utf8');

const tables = [
  'decision_tasks',
  'tool_decision_profiles',
  'tool_task_fits',
  'tool_relationships',
  'decision_sessions',
  'decision_recommendations',
  'tool_decision_profile_claims',
  'tool_task_fit_claims',
  'tool_relationship_claims',
  'decision_recommendation_claims',
];

for (const table of tables) {
  assert.match(sql, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}\\b`));
  assert.match(sql, new RegExp(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`));
}

assert.doesNotMatch(sql, /REFERENCES\s+(?:public\.)?tools\s*\(/i);
assert.doesNotMatch(sql, /REFERENCES\s+(?:public\.)?categories\s*\(/i);
assert.match(sql, /REFERENCES product_intelligence_claims\(id\)/);
assert.match(sql, /assert_active_verified_decision_claim/);
assert.match(sql, /verification_status = 'verified'/);
assert.match(sql, /claim\.invalidated_at IS NULL/);
assert.match(sql, /claim\.conflict_status = 'none'/);
assert.match(sql, /profile\.owner_id IN \(primary_tool_id/);
assert.match(sql, /claim\.review_due_at IS NULL OR claim\.review_due_at > NOW\(\)/);
assert.match(sql, /assert_decision_editorial_publishable/);
assert.match(sql, /auth\.uid\(\) = user_id/);
assert.match(sql, /Public can view active decision tasks/);
assert.match(sql, /Public can view published decision profiles/);
assert.match(sql, /Users can manage own decision sessions/);
assert.match(sql, /Users can view own recommendation evidence/);
assert.doesNotMatch(sql, /Users can create own decision recommendations/);
assert.doesNotMatch(sql, /Users can create own recommendation evidence/);
assert.match(sql, /DROP POLICY IF EXISTS/g);
assert.match(sql, /CREATE INDEX IF NOT EXISTS/g);

console.log(
  JSON.stringify(
    {
      success: true,
      tablesChecked: tables.length,
      crossStoreForeignKeys: false,
      rlsEnabled: true,
      verifiedEvidenceGate: true,
    },
    null,
    2,
  ),
);
