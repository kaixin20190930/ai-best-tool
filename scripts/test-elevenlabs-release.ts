import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { getCanonicalToolSlug } from '../lib/config/toolRouteAliases';
import { getToolIndexDecision } from '../lib/seo/toolIndexing';

const slug = 'elevenlabs';
const payload = JSON.parse(fs.readFileSync(`data/collection/${slug}-release.json`, 'utf8'));
const audit = JSON.parse(fs.readFileSync(`data/collection/${slug}-preaudit-2026-09-09.json`, 'utf8'));
const pipeline = fs.readFileSync('scripts/candidate-release-pipeline.ts', 'utf8');
const releaseAudit = fs.readFileSync('scripts/audit-delayed-candidate-release.ts', 'utf8');

assert.equal(getCanonicalToolSlug(slug), slug);
assert(pipeline.includes("slug: 'elevenlabs'"), 'ElevenLabs must use the shared candidate release pipeline');
assert(releaseAudit.includes("'elevenlabs'"), 'Read-only release audit must accept ElevenLabs');
assert.equal(audit.reviewedAt, '2026-09-09', 'Keep the historical preaudit date');
assert.equal(audit.publishNotBefore, '2026-09-13');
assert.equal(audit.status, 'released');
assert.equal(audit.productionWriteApproved, true);
assert.equal(audit.releasedAt, '2026-09-20');
assert.equal(audit.actualPublishedAt, '2026-09-20');
assert.equal(audit.releaseIndexState, 'monitor');
assert.equal(audit.sitemapChangeApproved, false);
assert.equal(audit.category.discoverySlug, 'voice');
assert.equal(audit.category.storageSlug, 'chatbot');
assert.match(audit.category.releaseCorrection, /no text-to-speech category/);

assert.equal(payload.reviewedAt, '2026-09-20');
assert.equal(payload.nextReviewDate, '2026-10-20');
assert.equal(payload.categorySlug, audit.category.storageSlug);
assert.equal(payload.features.release.scheduledSlot, audit.publishNotBefore);
assert.equal(payload.features.release.executionType, 'delayed_makeup');
assert.equal(payload.features.release.indexState, 'monitor');
assert.equal(payload.features.release.sitemapChangeApproved, false);
assert.equal(payload.features.editorial.reviewedAt, payload.reviewedAt);
assert.equal(payload.features.pricingSnapshot.checkedAt, payload.reviewedAt);
assert(payload.features.evidence.official.length >= 8);
assert(payload.features.evidence.independent.length >= 3);

for (const locale of ['en', 'zh', 'cn']) {
  assert(payload.title[locale]?.length > 10, `${locale}: localized title is missing`);
  assert(payload.content[locale]?.length > 40, `${locale}: localized summary is missing`);
  assert(payload.detail[locale]?.length > 900, `${locale}: localized decision article is incomplete`);
  assert(payload.useCases[locale]?.length >= 2, `${locale}: use cases are incomplete`);
  assert(payload.features.audience.bestFit[locale]?.length >= 3, `${locale}: best-fit list is incomplete`);
  assert(payload.features.audience.notIdealFor[locale]?.length >= 3, `${locale}: exclusion list is incomplete`);
  assert(payload.features.decision.compareAxes[locale]?.length >= 5, `${locale}: comparison axes are incomplete`);
  assert(payload.features.decision.limitations[locale]?.length >= 7, `${locale}: limitations are incomplete`);
  for (const source of [...payload.features.evidence.official, ...payload.features.evidence.independent]) {
    assert.equal(source.checkedAt, payload.reviewedAt);
    assert(payload.detail[locale].includes(source.url), `${locale}: evidence URL must be visible: ${source.url}`);
  }
}

const factText = `${payload.detail.en}\n${payload.detail.zh}`;
for (const fact of [
  /Free is \$0 with 10,000 credits/,
  /Starter is \$6 with 30,000/,
  /Creator is \$22 with 121,000/,
  /first-month 50% promotion at \$11/,
  /Pro is \$99 with 600,000/,
  /Scale is \$299 with 1\.8 million/,
  /Business is \$990 with 6 million/,
  /roll over up to two months/,
  /Beta output is not cleared for commercial/,
  /verification cannot prove every recording/,
  /Default use is not zero retention/,
  /up to three years after the last interaction/,
  /concurrency number is not a promise/,
  /默认使用并不是零留存/,
  /声音衍生数据最长可保留至最后互动后三年/,
]) {
  assert.match(factText, fact);
}

assert(
  !/500 million|500m ARR|G2 maintains|search volume|monthly organic traffic/i.test(factText),
  'Do not migrate unverified scale, review-count or keyword claims into release copy',
);

for (const media of payload.features.media.assets) {
  assert.equal(media.checkedAt, payload.reviewedAt);
  assert.equal(media.sourcePage, 'https://elevenlabs.io/press');
  assert.equal(media.type, 'official_brand_asset');
  assert.equal(media.isProductScreenshot, false);
  assert(media.usageBasis.length > 80);
  assert.equal(
    createHash('sha256')
      .update(fs.readFileSync(path.join('public', media.path.slice(1))))
      .digest('hex'),
    media.sha256,
  );
}

const decision = getToolIndexDecision({
  status: 'published',
  pageQualityStatus: 'monitor',
  categoryId: 'reviewed-category',
  imageUrl: payload.imageUrl,
  thumbnailUrl: payload.thumbnailUrl,
  content: payload.content,
  detail: payload.detail,
  pricing: payload.pricing,
  tags: payload.tags,
});
assert.equal(decision.indexable, false, 'Complete ElevenLabs content must remain noindex');

const duplicateRelease = spawnSync(
  'tsx',
  ['scripts/candidate-release-pipeline.ts', '--candidate=elevenlabs', '--phase=release', '--as-of=2026-09-12'],
  {
    cwd: process.cwd(),
    encoding: 'utf8',
    env: { ...process.env, POSTGRES_URL: 'postgres://invalid:invalid@127.0.0.1:1/invalid' },
  },
);
assert.equal(duplicateRelease.status, 1);
assert.match(duplicateRelease.stderr, /candidate is already released/);

console.log('PASS ElevenLabs: dated en/zh/cn evidence, pricing, rights, cloning, privacy, API and noindex gates');
