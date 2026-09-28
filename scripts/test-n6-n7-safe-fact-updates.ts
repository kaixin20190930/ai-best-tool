import assert from 'node:assert/strict';
import fs from 'node:fs';

import { getToolIndexDecision } from '../lib/seo/toolIndexing';
import { applyCandidate, assessRow, hash, loadPlan } from './apply-n6-n7-safe-fact-updates';

const plan = loadPlan();
assert.deepEqual(
  plan.map((item) => item.slug),
  ['grammarly', 'jasper', 'descript'],
);
const n6 = JSON.parse(fs.readFileSync('docs/CANVA_GRAMMARLY_N6_CANDIDATE_PATCH_2026-09-28_CN.json', 'utf8'));
assert.equal(n6.canva.toolId, null);
assert.match(n6.canva.status, /^HOLD/);
assert.deepEqual(n6.canva.patch, []);
assert(!plan.some((item) => item.slug === 'canva'));

for (const candidate of plan) {
  const payload = JSON.parse(fs.readFileSync(`data/collection/${candidate.slug}-release.json`, 'utf8'));
  const row = {
    id: candidate.toolId,
    name: candidate.slug,
    url: candidate.expectedOfficialUrl,
    status: candidate.expectedStatus,
    page_quality_status: candidate.expectedPageQualityStatus,
    next_review_date_text: candidate.nextReviewDateNoChange,
    category_id: 'reviewed-category',
    image_url: payload.imageUrl,
    thumbnail_url: payload.thumbnailUrl,
    pricing: payload.pricing,
    tags: payload.tags,
    content: payload.content,
    detail: payload.detail,
    features: payload.features,
    title: payload.title,
    canonical_url: null,
    updated_at: 'old',
    search_vector: 'old',
  };
  const before = structuredClone(row);
  const first = applyCandidate(row, candidate);
  assert.deepEqual(row, before, `${candidate.slug}: pure update must not mutate source`);
  assert.deepEqual(
    first.changedPaths,
    candidate.candidatePatch.map((patch) => patch.path),
  );
  for (const locale of ['en', 'zh', 'cn']) {
    const text =
      candidate.candidatePatch.find((patch) => patch.path === `detail.${locale}`)?.value ??
      candidate.candidatePatch.find((patch) => patch.path === `detail.${locale}`)?.newValueCandidate;
    assert(typeof text === 'string' && first.detail[locale].endsWith(text));
    assert.equal(first.detail[locale].split(text).length - 1, 1);
  }
  const after = { ...row, detail: first.detail, features: first.features };
  const second = applyCandidate(after, candidate);
  assert.deepEqual(second.changedPaths, [], `${candidate.slug}: idempotence`);
  assert.deepEqual(second.detail, first.detail);
  assert.deepEqual(second.features, first.features);
  const indexInput = (value: typeof row) => ({
    status: value.status,
    pageQualityStatus: value.page_quality_status,
    categoryId: value.category_id,
    imageUrl: value.image_url,
    thumbnailUrl: value.thumbnail_url,
    content: value.content,
    detail: value.detail,
    pricing: value.pricing,
    tags: value.tags,
  });
  assert.equal(getToolIndexDecision(indexInput(row)).indexable, getToolIndexDecision(indexInput(after)).indexable);
  assert.equal(getToolIndexDecision(indexInput(after)).indexable, candidate.slug !== 'descript');
  const hashes = {
    baseline: hash({ detail: row.detail, features: row.features }),
    applied: hash({ detail: first.detail, features: first.features }),
  };
  assert.deepEqual(assessRow(row, candidate, hashes).changedPaths, first.changedPaths);
  assert.equal(assessRow(after, candidate, hashes).alreadyApplied, true);
  assert.throws(
    () => assessRow({ ...row, detail: { ...row.detail, en: `${row.detail.en} changed` } }, candidate, hashes),
    /source changed/,
  );
  assert.throws(() => assessRow({ ...row, status: 'draft' }, candidate, hashes));
  assert.throws(() => assessRow({ ...row, page_quality_status: 'noindex' }, candidate, hashes));
  assert.throws(() => assessRow({ ...row, url: 'https://wrong.example/' }, candidate, hashes));
  assert.throws(
    () =>
      applyCandidate(row, {
        ...candidate,
        candidatePatch: [
          { ...candidate.candidatePatch[0], classification: 'HOLD-conflict' },
          ...candidate.candidatePatch.slice(1),
        ],
      }),
    /non-SAFE/,
  );
  assert.throws(
    () =>
      applyCandidate(row, {
        ...candidate,
        candidatePatch: [
          { ...candidate.candidatePatch[0], operation: 'replace' },
          ...candidate.candidatePatch.slice(1),
        ],
      }),
    /unknown operation/,
  );
  assert.throws(
    () =>
      applyCandidate(row, {
        ...candidate,
        candidatePatch: [
          { ...candidate.candidatePatch[0], path: 'page_quality_status' },
          ...candidate.candidatePatch.slice(1),
        ],
      }),
    /non-allowlisted/,
  );
  if (candidate.slug === 'grammarly') {
    assert.equal(first.features.evidence.official.length, row.features.evidence.official.length + 2);
    const oneExisting = structuredClone(row);
    oneExisting.features.evidence.official.push(candidate.candidatePatch[3].items![0]);
    assert.equal(
      applyCandidate(oneExisting, candidate).features.evidence.official.length,
      oneExisting.features.evidence.official.length + 1,
    );
  }
  if (candidate.slug === 'descript') {
    for (const locale of ['en', 'zh', 'cn']) {
      assert.equal(
        first.features.decision.limitations[locale].length,
        row.features.decision.limitations[locale].length + 3,
      );
      assert.equal(
        new Set(first.features.decision.limitations[locale]).size,
        first.features.decision.limitations[locale].length,
      );
    }
  }
}
console.log(
  'PASS N6/N7 SAFE update allowlist, HOLD exclusion, locales, deduplication, idempotence, baseline and index invariants',
);
