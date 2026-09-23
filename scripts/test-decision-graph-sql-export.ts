import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const workspace = process.cwd();
const planner = fs.readFileSync(path.join(workspace, 'scripts/plan-decision-graph-seed.ts'), 'utf8');
const sqlPath = path.join(workspace, 'db/supabase/manual/20260923_seed_decision_graph_first_batch.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

assert.match(planner, /--emit-sql=<path>/);
assert.match(planner, /--emit-sql requires a real --reviewer-id auth UUID/);
assert.match(planner, /--commit and --emit-sql cannot be used together/);
assert.match(planner, /fs\.writeFileSync\(resolvedPath, emitSeedSql\(plan, reviewerId\), 'utf8'\)/);
assert.match(planner, /mode: 'dry-run-no-write'/, 'default execution must remain read-only.');

assert.match(sql, /^-- DIFF-03 decision graph first batch[\s\S]*^BEGIN;$/m);
assert.match(sql, /\nCOMMIT;\n$/);
assert.match(sql, /FROM auth\.users WHERE id = '2b8177ac-70b3-4475-a1ee-509ff8b4b622'::uuid/);
assert.match(sql, /'public\.decision_capabilities'/);
assert.match(sql, /'public\.tool_capabilities'/);
assert.match(sql, /'public\.task_capabilities'/);
assert.match(sql, /'public\.tool_capability_claims'/);
assert.match(sql, /'public\.tool_task_fits'/);
assert.match(sql, /'public\.tool_task_fit_claims'/);
assert.match(sql, /profile\.owner_type = 'tool'/);
assert.match(sql, /profile\.owner_id = relation\.tool_id/);
assert.match(sql, /claim\.verification_status = 'verified'/);
assert.match(sql, /claim\.conflict_status = 'none'/);
assert.match(sql, /claim\.invalidated_at IS NULL/);
assert.match(sql, /claim\.expires_at IS NULL OR claim\.expires_at > NOW\(\)/);
assert.match(sql, /claim\.review_due_at IS NULL OR claim\.review_due_at > NOW\(\)/);
assert.match(sql, /FOR SHARE OF claim, profile/);
assert.match(sql, /FOR UPDATE OF task_capability/);
assert.match(sql, /FOR UPDATE OF tool_capability/);
assert.match(sql, /FOR UPDATE OF fit/);
assert.match(sql, /Published Task Capability requires a manual editorial change/);
assert.match(sql, /Published Tool Capability requires a manual editorial change/);
assert.match(sql, /Published Tool Task Fit requires a manual editorial change/);
assert.match(sql, /Seed Task Capability resolution was not completely reviewed/);
assert.match(sql, /Seed Tool Capability resolution was not completely reviewed/);
assert.match(sql, /Seed Tool Task Fit resolution was not completely reviewed/);
assert.match(sql, /ON CONFLICT \(slug\) DO NOTHING/, 'meeting-notes must be reused by its unique slug.');
assert.match(sql, /'active', 0, '\{"needsInputImage":true/);
assert.match(sql, /'creation', 'active', 0\)/);
assert.match(sql, /status = 'reviewed'/);
assert.doesNotMatch(sql, /VALUES[\s\S]{0,500}'published'/, 'the artifact must not create published relations.');
assert.doesNotMatch(sql, /SUPABASE|DATABASE_URL|postgres(?:ql)?:\/\//i, 'the artifact must not contain a connection secret.');
assert.doesNotMatch(sql, /INSERT INTO (?:public\.)?tools|UPDATE (?:public\.)?tools|sitemap|page_quality_status/i);

const expectedClaims = [
  'fddb0da1-3fb5-4bad-9ad5-df543171985f',
  'e54d8004-86ef-476d-addc-cb5215e94a5f',
  '32e5934f-bc33-415c-9d98-e88529155855',
  '4cf9edb2-8b6d-49dd-bc36-ccbc32f7a939',
  '363978e2-46d0-40fb-a344-42b61e19325c',
  '806bedca-c1e4-4fd1-ae57-e4db06567e47',
  '76cf5413-ce8c-424d-9a6b-21584758cf72',
];
for (const claimId of expectedClaims) {
  assert.match(sql, new RegExp(`${claimId}'::uuid`));
}

console.log(
  JSON.stringify(
    {
      success: true,
      artifact: path.relative(workspace, sqlPath),
      reviewedRelations: 7,
      transactionGuards: true,
      connectionSecretAbsent: true,
      executionRequired: 'user-managed SQL execution only',
    },
    null,
    2,
  ),
);
