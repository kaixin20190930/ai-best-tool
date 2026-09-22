import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const migrationPath = path.join(process.cwd(), 'db/supabase/migrations/20260922_decision_capability_foundation.sql');
const sql = fs.readFileSync(migrationPath, 'utf8');

const tables = ['decision_capabilities', 'tool_capabilities', 'task_capabilities', 'tool_capability_claims'];

for (const table of tables) {
  assert.match(sql, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}\\b`));
  assert.match(sql, new RegExp(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`));
}

assert.doesNotMatch(sql, /REFERENCES\s+(?:public\.)?tools\s*\(/i);
assert.match(sql, /logical references to the Neon directory database/i);
assert.match(sql, /REFERENCES decision_tasks\(id\)/);
assert.match(sql, /REFERENCES decision_capabilities\(id\)/);
assert.match(sql, /REFERENCES product_intelligence_claims\(id\)/);
assert.match(sql, /reviewed_by UUID REFERENCES auth\.users\(id\) ON DELETE SET NULL/);
assert.match(sql, /UNIQUE \(tool_id, capability_id\)/);
assert.match(sql, /PRIMARY KEY \(task_id, capability_id\)/);

assert.match(sql, /assert_active_verified_tool_capability_claim/);
assert.match(sql, /profile\.owner_type = 'tool'/);
assert.match(sql, /profile\.owner_id = referenced_tool_id/);
assert.match(sql, /claim\.verification_status = 'verified'/);
assert.match(sql, /claim\.invalidated_at IS NULL/);
assert.match(sql, /claim\.review_due_at IS NULL OR claim\.review_due_at > NOW\(\)/);
assert.match(sql, /claim\.conflict_status = 'none'/);

assert.match(sql, /CREATE CONSTRAINT TRIGGER tool_capability_must_be_publishable/);
assert.match(sql, /DEFERRABLE INITIALLY DEFERRED/);
assert.match(sql, /Published tool capabilities require a current review window/);
assert.match(sql, /Published tool capabilities require an active capability/);
assert.match(sql, /Published tool capabilities require verified evidence/);
assert.match(sql, /Published task capabilities require a current review window/);
assert.match(sql, /Published task capabilities require active task and capability records/);
assert.match(sql, /CREATE CONSTRAINT TRIGGER tool_capability_link_must_keep_capability_publishable/);
assert.match(sql, /AFTER INSERT OR UPDATE OR DELETE ON tool_capability_claims/);
assert.match(sql, /CREATE CONSTRAINT TRIGGER claim_change_must_keep_tool_capabilities_publishable/);
assert.match(
  sql,
  /AFTER UPDATE OF profile_id, verification_status, invalidated_at, expires_at, review_due_at, conflict_status/,
);
assert.match(sql, /CREATE OR REPLACE FUNCTION tool_capability_has_current_verified_claim/);
assert.match(sql, /SECURITY DEFINER/);
assert.match(sql, /tool_capability_has_current_verified_claim\(tool_capabilities\.id, tool_capabilities\.tool_id\)/);

assert.match(sql, /Public can view active decision capabilities/);
assert.match(sql, /Public can view published tool capabilities/);
assert.match(sql, /Public can view published task capabilities/);
assert.match(sql, /profile\.owner_id = target_tool_id/);
assert.match(sql, /task\.status = 'active'/);
assert.doesNotMatch(sql, /Public can view tool capability claims/);

console.log(
  JSON.stringify(
    {
      success: true,
      tablesChecked: tables.length,
      crossStoreForeignKeys: false,
      verifiedEvidenceGate: true,
      editorialReviewGate: true,
      publicClaimLinksExposed: false,
    },
    null,
    2,
  ),
);
