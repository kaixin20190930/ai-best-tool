import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';

import { freshnessProductionWrites, freshnessResultStatus, inspectFreshnessState } from './freshness-batch-state';
import { applyCandidateDetail } from './freshness-first-batch';
import SECOND_BATCH from './freshness-second-batch';
import { verifyFreshnessPassSnapshot } from './verify-freshness-pass-snapshot';

const audit = JSON.parse(fs.readFileSync('docs/FRESHNESS_BACKLOG_POSTCOMMIT_2026-10-08.json', 'utf8'));
const preflight = JSON.parse(fs.readFileSync('docs/FRESHNESS_SECOND_BATCH_PREFLIGHT_2026-10-08.json', 'utf8'));
const rollback = JSON.parse(fs.readFileSync('docs/FRESHNESS_SECOND_BATCH_ROLLBACK_2026-10-08.json', 'utf8'));
assert.deepEqual(
  audit.selected,
  SECOND_BATCH.map((row) => row.slug),
);
assert.deepEqual(
  SECOND_BATCH.map((row) => row.slug),
  ['gemini', 'notion', 'n8n', 'openrouter', 'poe'],
);
assert.equal(preflight.mode, 'preflight');
assert.equal(rollback.mode, 'rollback');
assert.equal(preflight.productionWrites, 0);
assert.equal(rollback.productionWrites, 0);
assert.equal(preflight.results.length, 5);
assert.equal(rollback.results.length, 5);
for (const candidate of SECOND_BATCH) {
  assert.equal(candidate.checkedAt, '2026-10-08');
  assert.equal(candidate.nextReviewDate, candidate.slug === 'openrouter' ? '2026-10-15' : '2026-10-22');
  assert(candidate.sources.every((url) => /^https:\/\//.test(url)));
  assert(candidate.claims?.every((claim) => ['conditional', 'conflict', 'unknown'].includes(claim.status)));
  assert(!candidate.replacements?.some((patch) => patch.field !== 'detail'));
  const item = audit.items.find((row: any) => row.slug === candidate.slug);
  assert.equal(item.classification, 'claim_due');
  const stub = {
    id: candidate.id,
    name: candidate.slug,
    status: 'published',
    url: candidate.expectedUrl,
    next_review_date: candidate.passSnapshot.claimDueAt,
    features: {
      editorial: { reviewedAt: candidate.passSnapshot.reviewedAt, sourceUrl: item.sourceUrl },
      maintenanceReview: item.basisDates.maintenanceCheckedAt
        ? { checkedAt: item.basisDates.maintenanceCheckedAt }
        : undefined,
    },
  };
  assert.equal(verifyFreshnessPassSnapshot(candidate, stub, '2026-10-08').id, candidate.passSnapshot.id);
  assert.throws(
    () => verifyFreshnessPassSnapshot({ ...candidate, expectedUrl: 'https://wrong.example/' }, stub, '2026-10-08'),
    /URL does not match/,
  );
  if (item.basisDates.maintenanceCheckedAt) {
    assert.throws(
      () =>
        verifyFreshnessPassSnapshot(
          { ...candidate },
          { ...stub, features: { ...stub.features, maintenanceReview: { checkedAt: '2026-09-03' } } },
          '2026-10-08',
        ),
      /maintenance date mismatch/,
    );
  }
  const manifestRow = preflight.results.find((row: any) => row.slug === candidate.slug);
  const rollbackRow = rollback.results.find((row: any) => row.slug === candidate.slug);
  assert.equal(manifestRow.status, 'ready');
  assert.equal(rollbackRow.status, 'rolled_back');
  assert.equal(manifestRow.preimageSha256, rollbackRow.preimageSha256);
  assert.equal(manifestRow.expectedDetailSha256, candidate.expectedDetailSha256);
  assert.deepEqual(manifestRow.changedFields, ['detail', 'features', 'next_review_date']);
  assert.match(candidate.expectedDetailSha256, /^[0-9a-f]{64}$/);
}
assert.throws(
  () =>
    verifyFreshnessPassSnapshot(
      SECOND_BATCH[0],
      {
        id: SECOND_BATCH[0].id,
        name: 'gemini',
        status: 'published',
        url: SECOND_BATCH[0].expectedUrl,
        next_review_date: '2026-09-18',
        features: {
          editorial: { reviewedAt: '2026-09-04', sourceUrl: 'https://wrong.example' },
          maintenanceReview: { checkedAt: '2026-09-04' },
        },
      },
      '2026-10-08',
    ),
  /PASS editorial snapshot mismatch/,
);
const gemini = SECOND_BATCH[0];
const geminiAudit = audit.items.find((row: any) => row.slug === gemini.slug);
const postDetail = { en: 'checked English postimage', zh: '已核中文后像', cn: '已核中文后像' };
const postCandidate = {
  ...gemini,
  expectedDetailSha256: crypto.createHash('sha256').update(JSON.stringify(postDetail)).digest('hex'),
};
const postRow = {
  id: gemini.id,
  name: gemini.slug,
  status: 'published',
  url: gemini.expectedUrl,
  detail: postDetail,
  next_review_date: gemini.nextReviewDate,
  features: {
    editorial: { reviewedAt: gemini.passSnapshot.reviewedAt, sourceUrl: geminiAudit.sourceUrl },
    maintenanceReview: {
      checkedAt: gemini.checkedAt,
      nextReviewDate: gemini.nextReviewDate,
      outcome: gemini.outcome,
      changeSummary: gemini.changeSummary,
      scope: gemini.scope,
      sources: gemini.sources,
      unresolved: gemini.unresolved,
      claims: gemini.claims || [],
    },
  },
};
const repeat = inspectFreshnessState(postCandidate, postRow, '2026-10-08');
assert.equal(repeat.alreadyApplied, true);
assert.equal(repeat.passSnapshot.id, gemini.passSnapshot.id);
const repeatedPreflight = {
  status: freshnessResultStatus('preflight', repeat.alreadyApplied),
  changedFields: repeat.alreadyApplied ? [] : ['detail', 'features', 'next_review_date'],
};
assert.deepEqual(repeatedPreflight, { status: 'already_applied', changedFields: [] });
assert.equal(freshnessProductionWrites('preflight', [repeatedPreflight]), 0);
assert.equal(freshnessResultStatus('commit', repeat.alreadyApplied), 'already_applied');
assert.equal(freshnessProductionWrites('commit', [{ status: 'already_applied' }]), 0);
assert.throws(
  () => inspectFreshnessState(postCandidate, { ...postRow, detail: { ...postDetail, en: 'tampered' } }, '2026-10-08'),
  /applied maintenance snapshot mismatch/,
);
assert.throws(
  () =>
    inspectFreshnessState(
      postCandidate,
      {
        ...postRow,
        features: {
          ...postRow.features,
          maintenanceReview: { ...postRow.features.maintenanceReview, nextReviewDate: '2026-10-23' },
        },
      },
      '2026-10-08',
    ),
  /applied maintenance snapshot mismatch/,
);
assert.throws(
  () => inspectFreshnessState(postCandidate, { ...postRow, next_review_date: '2026-10-23' }, '2026-10-08'),
  /applied maintenance snapshot mismatch/,
);
const openrouter = SECOND_BATCH.find((row) => row.slug === 'openrouter')!;
const old = {
  en: 'Pricing checked 2026-09-04: Pay-as-you-go has a 5.5% platform fee and no minimum spend. BYOK has no platform fee on the first $25,000 of list-price inference per month, then 5%; Enterprise has a separate $200,000 threshold.',
  zh: '2026-09-04 核验的 按量付费平台费为 5.5%，无最低消费。BYOK 每月前 $25,000 标价推理免平台费，之后为 5%；Enterprise 阈值为 $200,000。',
  cn: '2026-09-04 核验的 按量付费平台费为 5.5%，无最低消费。BYOK 每月前 $25,000 标价推理免平台费，之后为 5%；Enterprise 阈值为 $200,000。',
};
const updated = applyCandidateDetail(old, openrouter);
assert(updated.en.includes('Business lists 8%'));
assert(!updated.en.includes('$200,000'));
assert.throws(() => applyCandidateDetail({ ...old, en: 'drifted' }, openrouter), /missing exact preimage/);
assert.notEqual(
  crypto.createHash('sha256').update(JSON.stringify(old)).digest('hex'),
  crypto.createHash('sha256').update(JSON.stringify(updated)).digest('hex'),
);
console.log(
  'PASS second freshness batch selection, PASS lineage, scoped claims, exact patches, replay postimage, preflight and rollback',
);
