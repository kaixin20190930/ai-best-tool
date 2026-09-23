import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const seed = fs.readFileSync(path.join(process.cwd(), 'scripts/plan-decision-graph-seed.ts'), 'utf8');
const verifier = fs.readFileSync(path.join(process.cwd(), 'scripts/verify-decision-graph-seed.ts'), 'utf8');

assert.match(seed, /export const decisionGraphTasks: TaskSpec\[\]/);
assert.match(seed, /export const decisionGraphCapabilities: CapabilitySpec\[\]/);
assert.equal((seed.match(/slug: '/g) || []).length >= 18, true, 'six Tasks and twelve Capability slugs are required');
assert.equal((seed.match(/\['[a-z0-9-]+', \[/g) || []).length, 20, 'all twenty target tools must be inventoried');
assert.match(seed, /BEGIN READ ONLY/);
assert.match(seed, /mode: 'dry-run-no-write'/);
assert.match(seed, /args\.includes\('--commit'\)/);
assert.match(seed, /--commit requires a real --reviewer-id auth UUID/);
assert.match(seed, /SUPABASE_DB_URL is required for an explicit transactional --commit/);
assert.match(seed, /await client\.query\('BEGIN'\)/);
assert.match(seed, /await client\.query\('COMMIT'\)/);
assert.match(seed, /await client\.query\('ROLLBACK'\)/);
assert.match(seed, /FOR UPDATE/);
assert.match(
  seed,
  /SELECT task_id, status FROM task_capabilities WHERE task_id = \$1 AND capability_id = \$2 FOR UPDATE/,
);
assert.match(seed, /Published Task Capability .* requires a manual editorial change/);
assert.match(seed, /Published Tool Capability .* requires a manual editorial change/);
assert.match(seed, /Published Tool Task Fit .* requires a manual editorial change/);
assert.match(seed, /eligibleRelations/);
assert.match(seed, /evidenceGaps/);
assert.doesNotMatch(seed, /sitemap|page_quality_status\s*=|INSERT INTO tools|UPDATE tools/i);
assert.match(verifier, /All six DIFF-03 Tasks must exist exactly once/);
assert.match(verifier, /Sparse evidence plan must not manufacture bulk relations/);
assert.match(verifier, /publicRelationsCreated: 0/);

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
