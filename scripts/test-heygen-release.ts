import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { getCanonicalToolSlug } from '../lib/config/toolRouteAliases';
import { getToolIndexDecision } from '../lib/seo/toolIndexing';

const slug = 'heygen';
const payload = JSON.parse(fs.readFileSync(`data/collection/${slug}-release.json`, 'utf8'));
const audit = JSON.parse(fs.readFileSync(`data/collection/${slug}-preaudit-2026-09-09.json`, 'utf8'));
const pipeline = fs.readFileSync('scripts/candidate-release-pipeline.ts', 'utf8');
const releaseAudit = fs.readFileSync('scripts/audit-delayed-candidate-release.ts', 'utf8');

assert.equal(getCanonicalToolSlug(slug), slug);
assert(pipeline.includes("slug: 'heygen'"));
assert(releaseAudit.includes("'heygen'"));
assert.equal(audit.reviewedAt, '2026-09-09');
assert.equal(audit.publishNotBefore, '2026-09-14');
assert.equal(payload.reviewedAt, '2026-09-20');
assert.equal(payload.nextReviewDate, '2026-10-20');
assert.equal(payload.categorySlug, audit.category.storageSlug);
assert.match(audit.category.releaseCorrection, /no video storage category/);
assert.equal(payload.features.release.indexState, 'monitor');
assert.equal(payload.features.release.sitemapChangeApproved, false);
assert.equal(payload.features.editorial.reviewedAt, payload.reviewedAt);
assert.equal(payload.features.pricingSnapshot.checkedAt, payload.reviewedAt);
assert(payload.features.evidence.official.length >= 8);
assert(payload.features.evidence.independent.length >= 3);

for (const locale of ['en', 'zh', 'cn']) {
  assert(payload.title[locale]?.length > 10);
  assert(payload.content[locale]?.length > 40);
  assert(payload.detail[locale]?.length > 900);
  assert(payload.useCases[locale]?.length >= 2);
  assert(payload.features.audience.bestFit[locale]?.length >= 3);
  assert(payload.features.audience.notIdealFor[locale]?.length >= 3);
  assert(payload.features.decision.compareAxes[locale]?.length >= 5);
  assert(payload.features.decision.limitations[locale]?.length >= 8);
  for (const source of [...payload.features.evidence.official, ...payload.features.evidence.independent]) {
    assert.equal(source.checkedAt, payload.reviewedAt);
    assert(payload.detail[locale].includes(source.url), `${locale}: evidence URL must be visible: ${source.url}`);
  }
}

const factText = `${payload.detail.en}\n${payload.detail.zh}`;
for (const fact of [
  /Free is \$0 with three videos per month/,
  /Creator is \$29 monthly with 600 credits/,
  /Pro starts at \$49 monthly with 1,000 credits/,
  /Business is \$149 monthly with 1,500 credits/,
  /additional seats at \$20 per seat per month/,
  /10 concurrent workflows for pay-as-you-go/,
  /20 for Enterprise/,
  /照片或提示词数字人没有相同 API 同意步骤/,
  /非 Enterprise 客户数据可能用于模型改进/,
  /Free 输出仅限个人、非商业及内部评估/,
]) assert.match(factText, fact);

assert(!/guaranteed quality|best AI video|search volume|monthly organic traffic/i.test(factText));

for (const media of payload.features.media.assets) {
  assert.equal(media.checkedAt, payload.reviewedAt);
  assert.equal(media.type, 'editorial_identifier');
  assert.equal(media.isProductScreenshot, false);
  assert(media.usageBasis.length > 80);
  assert.equal(
    createHash('sha256').update(fs.readFileSync(path.join('public', media.path.slice(1)))).digest('hex'),
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
assert.equal(decision.indexable, false);

if (audit.status === 'released') {
  assert.equal(audit.productionWriteApproved, true);
  assert.equal(audit.releaseIndexState, 'monitor');
  assert.equal(audit.sitemapChangeApproved, false);
  assert.equal(audit.releasedAt, '2026-09-20');
  const duplicateRelease = spawnSync(
    'tsx',
    ['scripts/candidate-release-pipeline.ts', '--candidate=heygen', '--phase=release', '--as-of=2026-09-20'],
    { cwd: process.cwd(), encoding: 'utf8', env: { ...process.env, POSTGRES_URL: 'postgres://invalid:invalid@127.0.0.1:1/invalid' } },
  );
  assert.equal(duplicateRelease.status, 1);
  assert.match(duplicateRelease.stderr, /candidate is already released/);
}

console.log('PASS HeyGen: bilingual content with zh/cn compatibility, pricing, consent, privacy, API and noindex gates');
