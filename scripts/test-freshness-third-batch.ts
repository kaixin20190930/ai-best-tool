import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import THIRD_BATCH, { applyCandidateFeatures, THIRD_BATCH_PUBLISH_NOT_BEFORE } from './freshness-third-batch';
import { applyCandidateDetail } from './freshness-first-batch';
import { inspectFreshnessState, freshnessProductionWrites, freshnessResultStatus } from './freshness-batch-state';

const audit = JSON.parse(fs.readFileSync('docs/FRESHNESS_BACKLOG_AFTER_BATCH2_2026-10-08.json', 'utf8'));
const preflight = JSON.parse(fs.readFileSync('docs/FRESHNESS_THIRD_BATCH_PREFLIGHT_2026-10-08.json', 'utf8'));
const rollback = JSON.parse(fs.readFileSync('docs/FRESHNESS_THIRD_BATCH_ROLLBACK_2026-10-08.json', 'utf8'));
const hash = (value: unknown) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');

assert.equal(THIRD_BATCH_PUBLISH_NOT_BEFORE, '2026-10-09');
assert.deepEqual(THIRD_BATCH.map(row => row.slug), audit.selected);
for (const artifact of [preflight, rollback]) {
  assert.equal(artifact.productionWrites, 0);
  assert.equal(artifact.publishNotBefore, THIRD_BATCH_PUBLISH_NOT_BEFORE);
  assert.equal(artifact.results.length, 5);
}
assert.equal(preflight.mode, 'preflight');
assert.equal(rollback.mode, 'rollback');
for (const candidate of THIRD_BATCH) {
  const sourceItem = audit.items.find((row: any) => row.slug === candidate.slug);
  const before = preflight.results.find((row: any) => row.slug === candidate.slug);
  const trial = rollback.results.find((row: any) => row.slug === candidate.slug);
  assert.equal(sourceItem.classification, 'claim_due');
  assert.equal(candidate.checkedAt, '2026-10-08');
  assert.equal(candidate.nextReviewDate, '2026-10-22');
  assert(candidate.sources.every(url => /^https:\/\//.test(url)));
  assert(candidate.claims?.every(claim => ['conditional', 'conflict', 'unknown'].includes(claim.status)));
  assert.equal(before.status, 'ready');
  assert.equal(trial.status, 'rolled_back');
  assert.equal(before.preimageSha256, trial.preimageSha256);
  assert.deepEqual(before.passSnapshot, candidate.passSnapshot);
  assert.equal(before.expectedDetailSha256, candidate.expectedDetailSha256);
  assert.deepEqual(before.changedFields, candidate.replacements?.length ? ['detail', 'features', 'next_review_date'] : ['features', 'next_review_date']);
  assert.match(before.preimageSha256, /^[a-f0-9]{64}$/);

  const detail = { en: 'verified postimage', zh: '已核后像', cn: '已核后像' };
  const replay = { ...candidate, expectedDetailSha256: hash(detail) };
  const features: Record<string, any> = {
    editorial: { reviewedAt: candidate.passSnapshot.reviewedAt, sourceUrl: sourceItem.sourceUrl },
    maintenanceReview: {
      checkedAt: candidate.checkedAt, nextReviewDate: candidate.nextReviewDate,
      outcome: candidate.outcome, changeSummary: candidate.changeSummary,
      scope: candidate.scope, sources: candidate.sources, unresolved: candidate.unresolved,
      claims: candidate.claims || [],
    },
  };
  for (const patch of candidate.featureReplacements || []) {
    let parent = features;
    for (const key of patch.path.slice(0, -1)) parent = parent[key] ||= {};
    parent[patch.path.at(-1)!] = patch.to;
  }
  const row = {
    id: candidate.id, name: candidate.slug, status: 'published', url: candidate.expectedUrl,
    next_review_date: candidate.nextReviewDate, detail, features,
  };
  assert.equal(inspectFreshnessState(replay, row, '2026-10-08').alreadyApplied, true);
  assert.equal(freshnessResultStatus('preflight', true), 'already_applied');
  assert.equal(freshnessResultStatus('commit', true), 'already_applied');
  assert.equal(freshnessProductionWrites('commit', [{ status: 'already_applied' }]), 0);
  assert.throws(() => inspectFreshnessState(replay, { ...row, detail: { ...detail, en: 'tampered' } }, '2026-10-08'), /applied maintenance snapshot mismatch/);
  assert.throws(() => inspectFreshnessState(replay, { ...row, next_review_date: '2026-10-23' }, '2026-10-08'), /applied maintenance snapshot mismatch/);
  assert.throws(() => inspectFreshnessState(replay, { ...row, features: { ...features, maintenanceReview: { ...features.maintenanceReview, nextReviewDate: '2026-10-23' } } }, '2026-10-08'), /applied maintenance snapshot mismatch/);
  if (candidate.featureReplacements?.length) {
    const tampered = structuredClone(features);
    const patch = candidate.featureReplacements[0];
    const parent = patch.path.slice(0, -1).reduce((value: any, key) => value[key], tampered);
    parent[patch.path.at(-1)!] = 'tampered';
    assert.throws(() => inspectFreshnessState(replay, { ...row, features: tampered }, '2026-10-08'), /applied maintenance snapshot mismatch/);
    const preFeatures = structuredClone(features);
    const originalParent = patch.path.slice(0, -1).reduce((value: any, key) => value[key], preFeatures);
    originalParent[patch.path.at(-1)!] = patch.from;
    for (const other of candidate.featureReplacements.slice(1)) {
      const otherParent = other.path.slice(0, -1).reduce((value: any, key) => value[key], preFeatures);
      otherParent[other.path.at(-1)!] = other.from;
    }
    assert.equal(patch.path.reduce((value: any, key) => value[key], applyCandidateFeatures(preFeatures, candidate)), patch.to);
    assert.throws(() => applyCandidateFeatures(features, candidate), /missing exact feature preimage/);
  }
}
const fathom = THIRD_BATCH.find(row => row.slug === 'fathom')!;
const sourceDetail = {
  en: 'Chromebooks, Linux, mobile devices, webinars, breakout rooms, and calls without a standard meeting link are not supported in the standard workflow. Compare when you need native in-person capture, Linux or mobile support.',
  zh: '标准流程不支持 Chromebook、Linux、移动设备、Webinar、分组讨论室和没有标准会议链接的通话。比较原生线下录音、Linux 或移动端支持。',
  cn: '标准流程不支持 Chromebook、Linux、移动设备、Webinar、分组讨论室和没有标准会议链接的通话。比较原生线下录音、Linux 或移动端支持。',
};
const patched = applyCandidateDetail(sourceDetail, fathom);
assert(patched.en.includes('iOS app can record in-person conversations'));
assert(!patched.en.includes('mobile devices, webinars'));
assert.throws(() => applyCandidateDetail({ ...sourceDetail, en: 'tampered' }, fathom), /missing exact preimage/);
console.log('PASS third freshness batch: order, gate, exact patches, rollback, replay postimages, tamper negatives');
