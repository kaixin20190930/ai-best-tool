import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';

import { buildFreshnessNext, freshnessProductionWrites, inspectFreshnessState } from './freshness-batch-state';
import FIFTH_BATCH from './freshness-fifth-batch';
import verifyFifthPostRollbackReadback from './freshness-fifth-post-rollback-state';
import { assertFourthBatchReviewedResult } from './freshness-fourth-batch';

const read = (path: string) => JSON.parse(fs.readFileSync(path, 'utf8'));
const hash = (value: unknown) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const audit = read('docs/FRESHNESS_BACKLOG_AFTER_BATCH4_2026-10-08.json');
const preflight = read('docs/FRESHNESS_FIFTH_BATCH_PREFLIGHT_2026-10-09.json');
const rollback = read('docs/FRESHNESS_FIFTH_BATCH_ROLLBACK_2026-10-09.json');
const readback = read('docs/FRESHNESS_FIFTH_BATCH_POST_ROLLBACK_2026-10-09.json');

assert.deepEqual(
  FIFTH_BATCH.map((row) => row.slug),
  audit.selected.slice(0, 2),
);
assert.deepEqual(
  preflight.results.map((row: any) => row.slug),
  FIFTH_BATCH.map((row) => row.slug),
);
assert.equal(preflight.productionWrites, 0);
assert.equal(rollback.productionWrites, 0);
assert.equal(readback.productionWrites, 0);
assert.equal(readback.readIsolation, 'new_connection_read_only_transaction');
for (const [index, candidate] of FIFTH_BATCH.entries()) {
  const approved = preflight.results[index];
  const trial = rollback.results[index];
  const independent = readback.results[index];
  assert.equal(audit.items.find((item: any) => item.slug === candidate.slug)?.classification, 'claim_due');
  assert.equal(approved.status, 'ready');
  assert.equal(trial.status, 'rolled_back');
  assert.equal(approved.preimageSha256, trial.preimageSha256);
  assert.equal(approved.preimageSha256, independent.readbackSha256);
  assert.deepEqual(approved.changedFields, ['features', 'next_review_date']);
  assertFourthBatchReviewedResult(candidate, approved, ['features', 'next_review_date']);
  assert.throws(
    () => assertFourthBatchReviewedResult(candidate, { ...approved, sources: [] }, approved.changedFields),
    /reviewed manifest candidate mismatch/,
  );
  assert.throws(
    () =>
      assertFourthBatchReviewedResult(
        candidate,
        { ...approved, expectedDetailSha256: '0'.repeat(64) },
        approved.changedFields,
      ),
    /reviewed manifest candidate mismatch/,
  );
}

const rows = FIFTH_BATCH.map((candidate) => ({ id: candidate.id, name: candidate.slug, view_count: 0 }));
const syntheticPreflight = {
  ...preflight,
  results: preflight.results.map((r: any, i: number) => ({ ...r, preimageSha256: hash(rows[i]) })),
};
const syntheticRollback = {
  ...rollback,
  results: rollback.results.map((r: any, i: number) => ({ ...r, preimageSha256: hash(rows[i]) })),
};
assert(
  verifyFifthPostRollbackReadback(syntheticPreflight, syntheticRollback, rows).results.every(
    (r) => r.status === 'matched',
  ),
);
assert.throws(
  () =>
    verifyFifthPostRollbackReadback(syntheticPreflight, syntheticRollback, [{ ...rows[0], view_count: 1 }, rows[1]]),
  /independent post-rollback readback drift/,
);
assert.throws(
  () => verifyFifthPostRollbackReadback(syntheticPreflight, syntheticRollback, []),
  /Independent readback must return two rows/,
);

for (const candidate of FIFTH_BATCH) {
  const detail = { en: 'reviewed', zh: '已复核', cn: '已复核' };
  const replayCandidate = { ...candidate, expectedDetailSha256: hash(detail) };
  const after = {
    id: candidate.id,
    name: candidate.slug,
    status: 'published',
    page_quality_status: 'monitor',
    url: candidate.expectedUrl,
    pricing: 'freemium',
    next_review_date: candidate.nextReviewDate,
    detail,
    features: {
      editorial: {
        reviewedAt: candidate.passSnapshot.reviewedAt,
        sourceUrl: audit.items.find((item: any) => item.slug === candidate.slug).sourceUrl,
      },
      maintenanceReview: {
        checkedAt: candidate.checkedAt,
        nextReviewDate: candidate.nextReviewDate,
        outcome: candidate.outcome,
        changeSummary: candidate.changeSummary,
        scope: candidate.scope,
        sources: candidate.sources,
        unresolved: candidate.unresolved,
        claims: candidate.claims || [],
      },
    },
  };
  assert.equal(inspectFreshnessState(replayCandidate, after, '2026-10-09').alreadyApplied, true);
  assert.deepEqual(buildFreshnessNext(replayCandidate, after, true), after);
  assert.equal(freshnessProductionWrites('commit', [{ status: 'already_applied' }]), 0);
  assert.throws(
    () => inspectFreshnessState(replayCandidate, { ...after, detail: { ...detail, en: 'tampered' } }, '2026-10-09'),
    /applied maintenance snapshot mismatch/,
  );
  assert.throws(
    () => inspectFreshnessState(replayCandidate, { ...after, next_review_date: '2026-10-24' }, '2026-10-09'),
    /applied maintenance snapshot mismatch/,
  );
  assert.throws(
    () =>
      inspectFreshnessState(
        replayCandidate,
        {
          ...after,
          features: { ...after.features, maintenanceReview: { ...after.features.maintenanceReview, sources: [] } },
        },
        '2026-10-09',
      ),
    /applied maintenance snapshot mismatch/,
  );
}

const invalid = spawnSync(
  './node_modules/.bin/tsx',
  [
    'scripts/run-freshness-first-batch.ts',
    '--batch=fifth',
    '--commit',
    '--manifest=docs/FRESHNESS_FOURTH_BATCH_PREFLIGHT_2026-10-08.json',
  ],
  { encoding: 'utf8' },
);
assert.equal(invalid.status, 1);
assert.match(invalid.stderr, /Owner time override cannot be used with a different batch/);
console.log('PASS fifth freshness batch: order, PASS, preimage, independent rollback, replay, postimage and tamper');
