import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path: string) => fs.readFileSync(path, 'utf8');
const action = read('app/actions/admin/decision.ts');
const ui = read('components/admin/DecisionClusterClosure.tsx');
const reviewBoard = read('components/admin/DecisionReviewBoard.tsx');
const sql = read('db/supabase/migrations/20260925_decision_cluster_editorial_closure.sql');

for (const name of [
  'rereviewDecisionCapability',
  'transitionDecisionCluster',
  'intakeOfficialDecisionEvidence',
  'saveClusterFit',
  'changeClusterFitEvidenceLink',
]) {
  const start = action.indexOf(`export async function ${name}`);
  assert(start >= 0, `${name} is missing`);
  assert.match(action.slice(start, start + 350), /await requireAdmin\(\)/, `${name} must require admin`);
}
assert.match(action, /\['draft', 'reviewed'\]/);
assert.match(action, /\.in\('status', \['draft', 'reviewed'\]\)/);
assert.match(action, /\.eq\('status', 'stale'\)/);
assert.match(action, /CL01_TASK_SLUGS\.has/);
assert.match(action, /p_reviewer: user\.id/);
assert.match(action, /p_preflight: input\.preflight/);
assert.match(ui, /busy\.current/);
assert.match(ui, /preflightKey !== key/);
assert.match(ui, /qaReference\.trim\(\)\.length < 8/);
assert.match(ui, /router\.refresh\(\)/);
assert.match(ui, /saveClusterFit\(/);
assert.match(ui, /changeClusterFitEvidenceLink\(/);
assert.match(ui, /Evidence bound to this exact manifest/);
assert.match(ui, /item\.sourceUrl/);
assert.match(ui, /item\.purpose/);
assert.match(ui, /item\.validityScope/);
for (const control of ui.matchAll(/<(input|select|textarea)\b[^>]*>/gs)) {
  assert.match(control[0], /aria-label=|id=/, `missing accessible name: ${control[0]}`);
}
assert.doesNotMatch(ui, /\.from\('/, 'client UI must not query raw Supabase data');
assert.doesNotMatch(ui, /claim_value|source_excerpt/, 'raw claim columns must stay server-side');
assert.match(reviewBoard, /item\.entity === 'fit' && item\.clusterScoped/);

for (const pattern of [
  /auth\.role\(\) IS DISTINCT FROM 'service_role'/,
  /FOR UPDATE/,
  /FOR SHARE OF link, claim, profile/,
  /v_tc\.updated_at <>/,
  /v_tool\.updated_at <>/,
  /v_fit\.updated_at <>/,
  /ARRAY\['support', 'availability', 'plan', 'limitation'\]/,
  /ARRAY\['fit', 'limitation'\]/,
  /GET DIAGNOSTICS v_count = ROW_COUNT/,
  /task_capability_editorial_history/,
  /cl01_fit_evidence_lock/,
  /v_existing_source\.canonical_url/,
  /FOR UPDATE/,
  /'evidence', v_evidence/,
  /decision_withdrawal/,
  /GRANT EXECUTE ON FUNCTION decision_cluster_transition[\s\S]*TO service_role/,
])
  assert.match(sql, pattern);

console.log('CL-01 admin, UI, and migration structure passed.');
