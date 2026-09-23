import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const workspace = process.cwd();
const planner = fs.readFileSync(path.join(workspace, 'scripts/plan-decision-graph-seed.ts'), 'utf8');
const sql = fs.readFileSync(
  path.join(workspace, 'db/supabase/manual/20260923_seed_decision_graph_first_batch.sql'),
  'utf8',
);

// Production had three pre-existing, published meeting-note fits. They have
// exactly the mapped task and fit level, so the retry must preserve them rather
// than treating the identity match alone as an overwrite conflict.
for (const toolId of [
  '7ae4bbb2-847f-45cc-9294-e96663fa02a3', // Fathom, strong
  'b8d6a9bd-d9cd-4690-b801-15b1c1fe0a49', // Otter.ai, strong
  '57b270b9-78cf-41f8-8b74-dec46400cd65', // Fireflies, conditional
]) {
  assert.match(sql, new RegExp(`${toolId}'::uuid, 'meeting-notes'`));
}

assert.match(sql, /WHERE fit\.status = 'published'\n  FOR UPDATE OF fit/);
assert.match(sql, /fit\.fit_level <> seed\.fit_level/);
assert.match(sql, /tool_capability\.support_level NOT IN \('strong', 'partial'\)/);
assert.match(sql, /AND task_capability\.importance <> seed\.importance/);
assert.match(sql, /claim_link\.fit_id = fit\.id\n          AND claim_link\.claim_id = seed\.claim_id/);
assert.match(sql, /claim_link\.tool_capability_id = tool_capability\.id\n          AND claim_link\.claim_id = seed\.claim_id/);
assert.match(sql, /fit\.status <> 'published'\nON CONFLICT DO NOTHING/);
assert.match(sql, /tool_capability\.status <> 'published'\nON CONFLICT DO NOTHING/);
assert.match(sql, /status IN \('reviewed', 'published'\)/);
assert.doesNotMatch(sql, /SET[\s\S]{0,280}status = 'published'/, 'the retry must never publish new data.');

assert.match(planner, /existingFit\.rows\[0\]\.fit_level !== relation\.fit \|\| existingClaimLink\.rowCount !== 1/);
assert.match(planner, /!\['strong', 'partial'\]\.includes\(existingToolCapability\.rows\[0\]\.support_level\) \|\| existingClaimLink\.rowCount !== 1/);
assert.match(planner, /existingTaskCapability\.rows\[0\]\.importance !== relation\.importance/);

console.log(
  JSON.stringify(
    {
      success: true,
      productionConflictRegression: 'three compatible published meeting fits are preserved',
      incompatiblePublishedRelationsFail: true,
      publishedEvidenceLinksUntouched: true,
    },
    null,
    2,
  ),
);
