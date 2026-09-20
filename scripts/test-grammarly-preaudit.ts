import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { getCanonicalToolSlug } from '../lib/config/toolRouteAliases';
import { getToolIndexDecision } from '../lib/seo/toolIndexing';

const audit = JSON.parse(fs.readFileSync('data/collection/grammarly-preaudit-2026-09-20.json', 'utf8'));
const payload = JSON.parse(fs.readFileSync('data/collection/grammarly-release.json', 'utf8'));
const detailPage = fs.readFileSync('app/[locale]/(with-footer)/ai/[websiteName]/page.tsx', 'utf8');
const pipeline = fs.readFileSync('scripts/candidate-release-pipeline.ts', 'utf8');

assert.equal(audit.slug, 'grammarly');
assert.equal(audit.existingRoute, '/ai/grammarly');
assert.equal(audit.action, 'migrate_existing_fallback');
assert.equal(audit.status, 'ready_for_next_slot');
assert.equal(audit.reviewedAt, '2026-09-20');
assert.equal(audit.publishNotBefore, '2026-09-21');
assert.equal(audit.productionWriteApproved, false);
assert.equal(audit.sitemapChangeApproved, false);
assert.equal(audit.releaseIndexState, 'monitor');
assert.equal(audit.routeAudit.productionEntityMatches, 0);
assert.equal(audit.routeAudit.sitemapMatches, 0);
assert.equal(audit.identityDecision.canonicalProduct, 'Grammarly');
assert.equal(audit.identityDecision.company, 'Superhuman Platform Inc.');
assert(audit.decisionAngles.length >= 6);
assert(audit.limitations.length >= 10);
assert(audit.policyBoundaries.length >= 3);
assert(audit.sources.official.length >= 7);
assert(audit.sources.independent.length >= 3);
assert(audit.nextSlotChecklist.length >= 7);
assert.equal(audit.marketValidation.verdict, 'validated');
assert(audit.marketValidation.score >= 90);

const facts = JSON.stringify(audit);
for (const pattern of [
  /100 AI prompts per month/,
  /2,000 AI prompts per member per month/,
  /USD 30 monthly/,
  /training defaults vary by account type/i,
  /40 million extension users/,
  /published \+ monitor\/noindex/,
]) assert.match(facts, pattern);

assert.equal(getCanonicalToolSlug('grammarly'), 'grammarly');
assert(pipeline.includes("slug: 'grammarly'"));
assert.equal(payload.slug, 'grammarly');
assert.equal(payload.categorySlug, audit.category.storageSlug);
assert.equal(payload.reviewedAt, '2026-09-20');
assert.equal(payload.nextReviewDate, '2026-10-20');
assert.equal(payload.features.release.scheduledSlot, audit.publishNotBefore);
assert.equal(payload.features.release.indexState, 'monitor');
assert.equal(payload.features.release.sitemapChangeApproved, false);
assert.equal(payload.features.marketValidation.verdict, 'validated');
assert(payload.features.evidence.official.length >= 7);
assert(payload.features.evidence.independent.length >= 3);
for (const locale of ['en', 'zh', 'cn']) {
  assert(payload.title[locale].length > 10);
  assert(payload.content[locale].length > 40);
  assert(payload.detail[locale].length > 900);
  assert(payload.features.audience.bestFit[locale].length >= 3);
  assert(payload.features.audience.notIdealFor[locale].length >= 3);
  assert(payload.features.decision.compareAxes[locale].length >= 6);
  assert(payload.features.decision.limitations[locale].length >= 8);
}
for (const media of payload.features.media.assets) {
  assert.equal(media.type, 'editorial_identifier');
  assert.equal(media.isProductScreenshot, false);
  assert.equal(
    createHash('sha256').update(fs.readFileSync(path.join('public', media.path.slice(1)))).digest('hex'),
    media.sha256,
  );
}
const releaseCopy = payload.detail.en + '\n' + payload.detail.zh;
for (const pattern of [
  /USD 30 monthly.*USD 60 quarterly.*USD 144 annually/i,
  /100 AI prompts per month/i,
  /2,000 prompts per member per month/i,
  /enabled by default for individual accounts/i,
  /40 million users/i,
  /不是权威证明/,
]) assert.match(releaseCopy, pattern);
assert(!/best writing assistant|guarantees? accuracy|never uses customer content/i.test(releaseCopy));
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
const earlyRelease = spawnSync(
  'tsx',
  ['scripts/candidate-release-pipeline.ts', '--candidate=grammarly', '--phase=release', '--as-of=2026-09-20'],
  { cwd: process.cwd(), encoding: 'utf8', env: { ...process.env, POSTGRES_URL: 'postgres://invalid:invalid@127.0.0.1:1/invalid' } },
);
assert.equal(earlyRelease.status, 1);
assert.match(earlyRelease.stderr, /release window opens 2026-09-21/);
assert.match(detailPage, /checkedAt: '2026-09-20'/);
assert.doesNotMatch(detailPage, /17776038294285-Error-message-You-re-out-of-prompts/);
assert.match(detailPage, /if \(key === 'grammarly'\)/);

console.log('PASS Grammarly preaudit: identity, plans, privacy, adoption and noindex release boundary');
