import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const artifact = JSON.parse(
  readFileSync('docs/DECISION_GRAPH_CL03_LUMA_OPERATOR_CANDIDATE_2026-09-25_CN.json', 'utf8'),
);

assert.equal(artifact.status, 'candidate_pending_independent_qa_hold');
assert.equal(artifact.productionWrites, 0);
assert.equal(artifact.scope.createEntities, false);
assert.equal(artifact.readOnlyBaseline.sourceCount, 4);
assert.equal(artifact.readOnlyBaseline.claimCount, 2);
assert.equal(artifact.readOnlyBaseline.oldLinks.length, 2);
assert.equal(artifact.readOnlyBaseline.toolCapability.status, 'reviewed');
assert.equal(artifact.readOnlyBaseline.fit.status, 'reviewed');
assert.equal(artifact.relationshipCandidates.toolCapability.availability, 'unknown');
assert.equal(artifact.relationshipCandidates.toolCapability.status, 'reviewed');
assert.equal(artifact.relationshipCandidates.fit.status, 'reviewed');
assert.equal(artifact.purposeCoverage.tool.availability, false);
assert.equal(artifact.purposeCoverage.tool.support, true);
assert.equal(artifact.purposeCoverage.tool.plan, true);
assert.equal(artifact.purposeCoverage.tool.limitation, true);
assert.equal(artifact.purposeCoverage.fit.fit, true);
assert.equal(artifact.purposeCoverage.fit.limitation, true);

const keys = new Set<string>();
const linkedPurposes = new Set<string>();
for (const candidate of artifact.evidenceIntakeCandidates) {
  assert.match(candidate.key, /^[a-z0-9][a-z0-9:_./-]{2,}$/);
  assert.equal(keys.has(candidate.key), false);
  keys.add(candidate.key);
  assert.ok(candidate.excerpt.length >= 12);
  assert.ok(Object.keys(candidate.value).length > 0);
  assert.equal(candidate.scope.asOf, '2026-09-25');
  const hostname = new URL(candidate.url).hostname;
  assert.ok(hostname === 'lumalabs.ai' || hostname.endsWith('.lumalabs.ai'));
  for (const purpose of candidate.candidateLinks) linkedPurposes.add(purpose);
}
for (const purpose of ['tool:support', 'tool:plan', 'tool:limitation', 'fit:fit', 'fit:limitation']) {
  assert.ok(linkedPurposes.has(purpose));
}
assert.equal(linkedPurposes.has('tool:availability'), false);
assert.ok(artifact.holdReasons.some((reason: string) => reason.includes('availability')));
assert.ok(artifact.operatorGuards.some((guard: string) => guard.includes('updated_at')));
assert.ok(artifact.rollbackPlan.some((step: string) => step.includes('withdrawal')));

console.log('PASS CL-03 Luma candidate hold and operator guards');
