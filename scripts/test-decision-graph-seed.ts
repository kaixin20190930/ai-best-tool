import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { assertSeedFitStatuses, type SeedFit, type WithdrawalAudit } from './decision-graph-seed-fit-guard';

const seed = fs.readFileSync(path.join(process.cwd(), 'scripts/plan-decision-graph-seed.ts'), 'utf8');
const verifier = fs.readFileSync(path.join(process.cwd(), 'scripts/verify-decision-graph-seed.ts'), 'utf8');

assert.match(seed, /export const decisionGraphTasks: TaskSpec\[\]/);
assert.match(seed, /export const decisionGraphCapabilities: CapabilitySpec\[\]/);
assert.equal((seed.match(/slug: '/g) || []).length >= 18, true, 'six Tasks and twelve Capability slugs are required');
assert.equal((seed.match(/\['[a-z0-9-]+', \[/g) || []).length, 20, 'all twenty target tools must be inventoried');
assert.match(seed, /BEGIN READ ONLY/);
assert.match(seed, /mode: 'dry-run-no-write'/);
assert.match(seed, /--emit-sql=<path>/);
assert.match(seed, /mode: 'emit-sql-read-only'/);
assert.match(seed, /function emitSeedSql/);
assert.match(seed, /args\.includes\('--commit'\)/);
assert.match(seed, /--commit requires a real --reviewer-id auth UUID/);
assert.match(seed, /SUPABASE_DB_URL is required for an explicit transactional --commit/);
assert.match(seed, /await client\.query\('BEGIN'\)/);
assert.match(seed, /await client\.query\('COMMIT'\)/);
assert.match(seed, /await client\.query\('ROLLBACK'\)/);
assert.match(seed, /FOR UPDATE/);
assert.match(
  seed,
  /SELECT task_id, status, importance FROM task_capabilities WHERE task_id = \$1 AND capability_id = \$2 FOR UPDATE/,
);
assert.match(seed, /Published Task Capability .* conflicts with the planned importance/);
assert.match(seed, /Published Tool Capability .* conflicts with the planned supported capability or mapped evidence/);
assert.match(seed, /Published Tool Task Fit .* conflicts with the planned fit level or mapped evidence/);
assert.match(seed, /fit_level <> seed\.fit_level/);
assert.match(seed, /support_level NOT IN \('strong', 'partial'\)/);
assert.match(seed, /claim_link\.claim_id = seed\.claim_id/);
assert.match(seed, /eligibleRelations/);
assert.match(seed, /evidenceGaps/);
assert.doesNotMatch(seed, /sitemap|page_quality_status\s*=|INSERT INTO tools|UPDATE tools/i);
assert.match(verifier, /All six DIFF-03 Tasks must exist exactly once/);
assert.match(verifier, /Sparse evidence plan must not manufacture bulk relations/);
assert.match(verifier, /compatible pre-existing published records/);
assert.match(verifier, /preservedPublishedRelations/);
assert.match(verifier, /publicRelationsCreated: 0/);

const manifest = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), 'docs/DECISION_GRAPH_CL04_FIT_WITHDRAWAL_MANIFEST_2026-09-28_CN.json'),
    'utf8',
  ),
);
const task = { id: manifest.taskId, slug: 'build-app-with-ai', status: 'active' };
const reviewer = '2b8177ac-70b3-4475-a1ee-509ff8b4b622';
const changedAt = '2026-09-28T00:35:17.31865Z';
const fitIds = manifest.fits.map((fit: { id: string }) => fit.id);
const toolIds = ['23bb3601-a5ac-42c3-bff3-64b06a063959', 'f77fb817-e8dc-4c22-b7cd-8edc2e5b0a5e'];
const claimIds = ['806bedca-c1e4-4fd1-ae57-e4db06567e47', '76cf5413-ce8c-424d-9a6b-21584758cf72'];
const fits: SeedFit[] = fitIds.map((id: string, index: number) => ({
  id,
  tool_id: toolIds[index],
  task_id: task.id,
  status: 'stale',
  last_edited_by: reviewer,
  updated_at: changedAt,
}));
const otherFits: SeedFit[] = Array.from({ length: 5 }, (_, index) => ({
  id: `other-fit-${index}`,
  tool_id: `other-tool-${index}`,
  task_id: `other-task-${index}`,
  status: 'reviewed',
  last_edited_by: reviewer,
  updated_at: changedAt,
}));
const seedFits = [...fits, ...otherFits];
const evidence = {
  profiles: toolIds.map((owner_id, index) => ({ id: `profile-${index}`, owner_type: 'tool', owner_id })),
  fitLinks: fitIds.map((fit_id: string, index: number) => ({ fit_id, claim_id: claimIds[index], purpose: 'fit' })),
  capabilities: [
    { id: 'app-capability', slug: 'ai-assisted-app-development' },
    { id: 'workflow-capability', slug: 'developer-workflow-integration' },
  ],
  taskCapabilities: ['app-capability', 'workflow-capability'].map((capability_id) => ({
    task_id: task.id,
    capability_id,
    status: 'reviewed',
  })),
  toolCapabilities: toolIds.map((tool_id, index) => ({
    id: ['4ebad72c-d03e-4a54-9a2c-f5024f7da9ac', 'ac4c1009-feaf-4544-bbaf-086e56089bdc'][index],
    tool_id,
    capability_id: 'workflow-capability',
    status: 'reviewed',
  })),
  audits: toolIds.map(
    (_, index): WithdrawalAudit => ({
      profile_id: `profile-${index}`,
      event_type: 'decision_withdrawal',
      review_scope: 'decision',
      claim_type: 'decision_cluster',
      claim_key: task.id,
      old_value: { status: 'reviewed' },
      new_value: { status: 'stale' },
      visibility: 'internal',
      occurred_at: changedAt,
      verified_at: changedAt,
      verified_by: reviewer,
      metadata: { taskId: task.id, operation: 'withdraw', qaReference: manifest.qaReference, fits: manifest.fits },
    }),
  ),
};
assert.doesNotThrow(() => assertSeedFitStatuses(seedFits, task, evidence));
assert.doesNotThrow(() =>
  assertSeedFitStatuses(
    seedFits.map((fit) => ({ ...fit, status: 'reviewed' })),
    task,
  ),
);
assert.throws(() => assertSeedFitStatuses(seedFits.slice(0, -1), task, evidence));
assert.throws(() =>
  assertSeedFitStatuses(
    seedFits.filter((fit) => fit.id !== fitIds[0]),
    task,
    evidence,
  ),
);
assert.throws(() =>
  assertSeedFitStatuses(
    seedFits.map((fit) => (fit.id === fitIds[0] ? { ...fit, id: 'unexpected' } : fit)),
    task,
    evidence,
  ),
);
assert.throws(() =>
  assertSeedFitStatuses(
    seedFits.map((fit) => (fit.id === otherFits[0].id ? { ...fit, status: 'stale' } : fit)),
    task,
    evidence,
  ),
);
assert.throws(() =>
  assertSeedFitStatuses(
    seedFits.map((fit) => (fit.id === otherFits[0].id ? { ...fit, status: 'draft' } : fit)),
    task,
    evidence,
  ),
);
assert.throws(() =>
  assertSeedFitStatuses(
    seedFits.map((fit) => (fit.id === fitIds[0] ? { ...fit, task_id: 'wrong-task' } : fit)),
    task,
    evidence,
  ),
);
assert.throws(() => assertSeedFitStatuses(seedFits, task));
assert.throws(() => assertSeedFitStatuses(seedFits, task, { ...evidence, fitLinks: evidence.fitLinks.slice(0, 1) }));
assert.throws(() => assertSeedFitStatuses(seedFits, task, { ...evidence, audits: evidence.audits.slice(0, 1) }));
assert.throws(() =>
  assertSeedFitStatuses(seedFits, task, {
    ...evidence,
    audits: evidence.audits.map((audit) => ({ ...audit, metadata: { ...audit.metadata, qaReference: 'wrong' } })),
  }),
);
assert.throws(() =>
  assertSeedFitStatuses(seedFits, task, {
    ...evidence,
    audits: evidence.audits.map((audit) => ({ ...audit, occurred_at: '2026-09-29T00:35:17Z' })),
  }),
);
assert.throws(() =>
  assertSeedFitStatuses(seedFits, task, { ...evidence, taskCapabilities: evidence.taskCapabilities.slice(0, 1) }),
);
assert.throws(() =>
  assertSeedFitStatuses(seedFits, task, { ...evidence, toolCapabilities: evidence.toolCapabilities.slice(0, 1) }),
);

console.log(
  JSON.stringify(
    {
      success: true,
      targetsInventoried: 20,
      dryRunDefault: true,
      transactionalCommitGuarded: true,
      noBulkFabrication: true,
    },
    null,
    2,
  ),
);
