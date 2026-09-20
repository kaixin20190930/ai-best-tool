import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { getCanonicalToolSlug } from '../lib/config/toolRouteAliases';
import { getToolIndexDecision } from '../lib/seo/toolIndexing';

const slug = 'fireflies';
const payload = JSON.parse(fs.readFileSync(`data/collection/${slug}-release.json`, 'utf8'));
const audit = JSON.parse(fs.readFileSync('data/collection/fireflies-ai-preaudit-2026-09-09.json', 'utf8'));
const pipeline = fs.readFileSync('scripts/candidate-release-pipeline.ts', 'utf8');
const releaseAudit = fs.readFileSync('scripts/audit-delayed-candidate-release.ts', 'utf8');
const legacyMigration = fs.readFileSync('scripts/migrate-fireflies-tool.ts', 'utf8');

assert.equal(getCanonicalToolSlug('fireflies-ai'), slug);
assert.equal(getCanonicalToolSlug(slug), slug);
assert(pipeline.includes("slug: 'fireflies'"));
assert(pipeline.includes('existingEntityExpected: true'));
assert(releaseAudit.includes("fireflies: ['fireflies'"));
assert.match(legacyMigration, /one-off migration is retired/);
assert.equal(audit.slug, slug);
assert.equal(audit.action, 'refresh_existing_entity');
assert.equal(audit.reviewedAt, '2026-09-09');
assert.equal(audit.publishNotBefore, '2026-09-16');
assert.equal(payload.id, '57b270b9-78cf-41f8-8b74-dec46400cd65');
assert.equal(payload.reviewedAt, '2026-09-20');
assert.equal(payload.nextReviewDate, '2026-10-20');
assert.equal(payload.categorySlug, audit.category.storageSlug);
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
  assert(payload.features.decision.compareAxes[locale]?.length >= 6);
  assert(payload.features.decision.limitations[locale]?.length >= 8);
  for (const source of [...payload.features.evidence.official, ...payload.features.evidence.independent]) {
    assert.equal(source.checkedAt, payload.reviewedAt);
    assert(payload.detail[locale].includes(source.url), `${locale}: evidence URL must be visible: ${source.url}`);
  }
}

const factText = `${payload.detail.en}\n${payload.detail.zh}`;
for (const fact of [
  /Pro is \$10.*annual.*\$18.*monthly/i,
  /Business is \$19.*annual.*\$29.*monthly/i,
  /Enterprise is \$39.*annual/i,
  /AI-credit trial converts after seven days/i,
  /Auto-Upgrade is enabled by default/i,
  /3,000 minutes per source per month/i,
  /不会自动满足所有司法辖区的同意要求/,
  /输出可能存在重大不准确/,
]) assert.match(factText, fact);

assert(!/guarantees? accuracy|guarantees? compliance|best meeting assistant/i.test(factText));

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
    ['scripts/candidate-release-pipeline.ts', '--candidate=fireflies', '--phase=release', '--as-of=2026-09-20'],
    { cwd: process.cwd(), encoding: 'utf8', env: { ...process.env, POSTGRES_URL: 'postgres://invalid:invalid@127.0.0.1:1/invalid' } },
  );
  assert.equal(duplicateRelease.status, 1);
  assert.match(duplicateRelease.stderr, /candidate is already released/);
}

console.log('PASS Fireflies: canonical identity, pricing, credits, consent, privacy and noindex gates');
