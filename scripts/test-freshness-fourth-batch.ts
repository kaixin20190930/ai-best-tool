import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';

import { buildFreshnessNext, freshnessProductionWrites, inspectFreshnessState } from './freshness-batch-state';
import { applyCandidateDetail } from './freshness-first-batch';
import FOURTH_BATCH, {
  assertFourthBatchReleaseManifest,
  assertFourthBatchReviewedResult,
  FOURTH_BATCH_OWNER_TIME_OVERRIDE,
  FOURTH_BATCH_PUBLISH_NOT_BEFORE,
  fourthBatchReleaseAllowed,
} from './freshness-fourth-batch';

const audit = JSON.parse(fs.readFileSync('docs/FRESHNESS_BACKLOG_AFTER_BATCH3_2026-10-08.json', 'utf8'));
const preflight = JSON.parse(fs.readFileSync('docs/FRESHNESS_FOURTH_BATCH_PREFLIGHT_2026-10-08.json', 'utf8'));
const rollback = JSON.parse(fs.readFileSync('docs/FRESHNESS_FOURTH_BATCH_ROLLBACK_2026-10-08.json', 'utf8'));
const hash = (value: unknown) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');

assert.equal(FOURTH_BATCH_PUBLISH_NOT_BEFORE, '2026-10-10');
assert.equal(fourthBatchReleaseAllowed('2026-10-07'), false);
assert.equal(fourthBatchReleaseAllowed('2026-10-08'), true);
assert.equal(fourthBatchReleaseAllowed('invalid'), false);
assertFourthBatchReleaseManifest(preflight);
assert.throws(
  () =>
    assertFourthBatchReleaseManifest({
      ...preflight,
      ownerTimeOverride: { ...FOURTH_BATCH_OWNER_TIME_OVERRIDE, effectiveReleaseDate: '2026-10-07' },
    }),
  /owner time override mismatch/,
);
assert.throws(
  () => assertFourthBatchReleaseManifest({ ...preflight, publishNotBefore: '2026-10-08' }),
  /owner time override mismatch/,
);
for (const batchArgs of [[], ['--batch=second'], ['--batch=third']]) {
  const rejected = spawnSync(
    './node_modules/.bin/tsx',
    [
      'scripts/run-freshness-first-batch.ts',
      ...batchArgs,
      '--commit',
      '--manifest=docs/FRESHNESS_FOURTH_BATCH_PREFLIGHT_2026-10-08.json',
    ],
    { encoding: 'utf8' },
  );
  assert.equal(rejected.status, 1);
  assert.match(rejected.stderr, /Owner time override cannot be used with a different batch/);
  assert.doesNotMatch(rejected.stderr, /connect|database|ECONN/i);
}
assert.deepEqual(
  FOURTH_BATCH.map((row) => row.slug),
  audit.selected,
);
for (const artifact of [preflight, rollback]) {
  assert.equal(artifact.productionWrites, 0);
  assert.equal(artifact.publishNotBefore, FOURTH_BATCH_PUBLISH_NOT_BEFORE);
  assert.deepEqual(artifact.ownerTimeOverride, FOURTH_BATCH_OWNER_TIME_OVERRIDE);
  assert.equal(artifact.results.length, 5);
}
assert.equal(preflight.mode, 'preflight');
assert.equal(rollback.mode, 'rollback');
for (const candidate of FOURTH_BATCH) {
  const sourceItem = audit.items.find((row: any) => row.slug === candidate.slug);
  const before = preflight.results.find((row: any) => row.slug === candidate.slug);
  const trial = rollback.results.find((row: any) => row.slug === candidate.slug);
  assert(sourceItem && before && trial);
  assert(['claim_due', 'schedule_sync'].includes(sourceItem.classification));
  assert.match(before.preimageSha256, /^[a-f0-9]{64}$/);
  assert.equal(before.preimageSha256, trial.preimageSha256);
  assert.equal(before.status, 'ready');
  assert.equal(trial.status, 'rolled_back');
  assert.deepEqual(before.passSnapshot, candidate.passSnapshot);
  assert.equal(before.expectedDetailSha256, candidate.expectedDetailSha256);
  assert.deepEqual(
    before.changedFields,
    candidate.replacements?.length ? ['detail', 'features', 'next_review_date'] : ['features', 'next_review_date'],
  );
  assertFourthBatchReviewedResult(candidate, before, before.changedFields);
  assert.throws(
    () => assertFourthBatchReviewedResult(candidate, { ...before, changedFields: [] }, before.changedFields),
    /reviewed manifest candidate mismatch/,
  );
  assert.throws(
    () => assertFourthBatchReviewedResult(candidate, { ...before, sources: [] }, before.changedFields),
    /reviewed manifest candidate mismatch/,
  );
  assert(candidate.sources.every((url) => /^https:\/\//.test(url)));
  assert(candidate.claims?.every((claim) => ['conditional', 'unknown', 'conflict'].includes(claim.status)));
  const detail = { en: 'verified postimage', zh: '已核后像', cn: '已核后像' };
  const replayCandidate = { ...candidate, expectedDetailSha256: hash(detail) };
  const next = {
    id: candidate.id,
    name: candidate.slug,
    status: 'published',
    page_quality_status: 'monitor',
    url: candidate.expectedUrl,
    pricing: 'freemium',
    next_review_date: candidate.nextReviewDate,
    detail,
    features: {
      editorial: { reviewedAt: candidate.passSnapshot.reviewedAt, sourceUrl: sourceItem.sourceUrl },
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
  assert.equal(next.features.maintenanceReview.checkedAt, '2026-10-08');
  assert.equal(next.next_review_date, '2026-10-22');
  const replay = inspectFreshnessState(replayCandidate, next, '2026-10-08');
  assert.equal(replay.alreadyApplied, true);
  assert.deepEqual(buildFreshnessNext(replayCandidate, next, true), next);
  assert.equal(freshnessProductionWrites('commit', [{ status: 'already_applied' }]), 0);
  assert.throws(
    () => inspectFreshnessState(replayCandidate, { ...next, detail: { ...next.detail, en: 'tampered' } }, '2026-10-08'),
    /applied maintenance snapshot mismatch/,
  );
  assert.throws(
    () => inspectFreshnessState(replayCandidate, { ...next, next_review_date: '2026-10-23' }, '2026-10-08'),
    /applied maintenance snapshot mismatch/,
  );
  assert.throws(
    () =>
      inspectFreshnessState(
        replayCandidate,
        {
          ...next,
          features: { ...next.features, maintenanceReview: { ...next.features.maintenanceReview, sources: [] } },
        },
        '2026-10-08',
      ),
    /applied maintenance snapshot mismatch/,
  );
}
const github = FOURTH_BATCH.find((row) => row.slug === 'github-copilot')!;
const githubDetail = Object.fromEntries(github.replacements!.map((patch) => [patch.locale, patch.from]));
const patched = applyCandidateDetail(githubDetail, github);
assert(patched.en.includes('new Max tier at $100/month'));
assert.throws(() => applyCandidateDetail(patched, github), /missing exact preimage/);
console.log('PASS fourth freshness batch: order, PASS, preimage, protected fields, rollback, replay and tamper');
