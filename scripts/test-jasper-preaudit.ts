import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { getCanonicalToolSlug } from '../lib/config/toolRouteAliases';
import { getToolIndexDecision } from '../lib/seo/toolIndexing';

const audit = JSON.parse(fs.readFileSync('data/collection/jasper-preaudit-2026-09-20.json', 'utf8'));
const buffer = JSON.parse(fs.readFileSync('data/collection/mature-candidate-buffer-2026-09-20.json', 'utf8'));
const payload = JSON.parse(fs.readFileSync('data/collection/jasper-release.json', 'utf8'));
const pipeline = fs.readFileSync('scripts/candidate-release-pipeline.ts', 'utf8');

assert.equal(audit.slug, 'jasper');
assert.equal(audit.existingRoute, '/ai/jasper');
assert.equal(audit.action, 'migrate_existing_fallback');
assert.equal(audit.status, 'ready_for_next_slot');
assert.equal(audit.reviewedAt, '2026-09-20');
assert.equal(audit.publishNotBefore, '2026-09-22');
assert.equal(audit.ownerEarlyReleaseOverride.candidate, 'jasper');
assert.equal(audit.ownerEarlyReleaseOverride.authorizedOn, '2026-09-21');
assert.equal(audit.ownerEarlyReleaseOverride.originalPublishNotBefore, '2026-09-22');
assert.equal(audit.ownerEarlyReleaseOverride.effectiveReleaseNotBefore, '2026-09-21');
assert.match(audit.ownerEarlyReleaseOverride.scope, /jasper controlled release only/);
assert(audit.ownerEarlyReleaseOverride.preservedGates.includes('published + monitor/noindex'));
assert(audit.ownerEarlyReleaseOverride.preservedGates.includes('sitemap excluded'));
assert(audit.ownerEarlyReleaseOverride.preservedGates.includes('explicit --commit required for production write'));
assert.equal(audit.productionWriteApproved, false);
assert.equal(audit.sitemapChangeApproved, false);
assert.equal(audit.releaseIndexState, 'monitor');
assert.equal(audit.routeAudit.productionEntityMatches, 0);
assert.equal(audit.routeAudit.sitemapMatches, 0);
assert.equal(audit.identityDecision.canonicalProduct, 'Jasper');
assert(audit.decisionAngles.length >= 7);
assert(audit.limitations.length >= 12);
assert(audit.policyBoundaries.length >= 4);
assert(audit.sources.official.length >= 8);
assert(audit.sources.independent.length >= 2);
assert(audit.nextSlotChecklist.length >= 7);
assert.equal(audit.marketValidation.verdict, 'validated');
assert(audit.marketValidation.score >= 90);
const candidate = buffer.candidates.find((item: { slug: string }) => item.slug === 'jasper');
assert(candidate);
assert.equal(candidate.status, 'ready_for_next_slot');
assert.equal(candidate.publicReleaseApproved, false);
assert.equal(candidate.indexReleaseApproved, false);
const facts = JSON.stringify(audit);
for (const pattern of [
  /USD 69 per month per seat/,
  /USD 59 per month per seat billed yearly/,
  /one included seat/,
  /two Brand Voices, five Knowledge assets and three Audiences/,
  /API\/MCP, Grid output rows/,
  /not currently recorded in the audit log/,
  /more than 4 thousand reviews/,
  /published \+ monitor\/noindex/,
]) assert.match(facts, pattern);
assert(!/guaranteed factual accuracy|Business usage is unlimited|best AI writer/i.test(facts));
assert.equal(getCanonicalToolSlug('jasper'), 'jasper');
assert(pipeline.includes("slug: 'jasper'"));
assert.equal(payload.slug, 'jasper');
assert.equal(payload.categorySlug, audit.category.storageSlug);
assert.equal(payload.reviewedAt, audit.reviewedAt);
assert.equal(payload.nextReviewDate, '2026-10-20');
assert.equal(payload.features.release.scheduledSlot, audit.publishNotBefore);
assert.equal(payload.features.release.executionType, 'owner_authorized_early_release');
assert.equal(payload.features.release.ownerEarlyReleaseOverride.effectiveReleaseNotBefore, '2026-09-21');
assert.equal(payload.features.release.releaseDayReview.checkedAt, '2026-09-21');
assert.equal(payload.features.release.indexState, 'monitor');
assert.equal(payload.features.release.sitemapChangeApproved, false);
assert.equal(payload.features.marketValidation.verdict, 'validated');
assert(payload.features.evidence.official.length >= 8);
assert(payload.features.evidence.independent.length >= 2);
for (const locale of ['en', 'zh', 'cn']) {
  assert(payload.title[locale].length > 10);
  assert(payload.content[locale].length > 40);
  assert(payload.detail[locale].length > 900);
  assert(payload.features.audience.bestFit[locale].length >= 3);
  assert(payload.features.audience.notIdealFor[locale].length >= 3);
  assert(payload.features.decision.compareAxes[locale].length >= 7);
  assert(payload.features.decision.limitations[locale].length >= 12);
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
  /USD 69 per month per seat/,
  /USD 59 per month per seat billed yearly/,
  /shared workspace credit pool/,
  /not currently captured in the audit log/,
  /Business lists unlimited voices and adds Style Guides/,
  /more than 4 thousand reviews/,
  /不是 Jasper 官方 Logo/,
]) assert.match(releaseCopy, pattern);
assert(!/guaranteed factual accuracy|Business usage is unlimited|best AI writer/i.test(releaseCopy));
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
  ['scripts/candidate-release-pipeline.ts', '--candidate=jasper', '--phase=release', '--as-of=2026-09-20'],
  { cwd: process.cwd(), encoding: 'utf8', env: { ...process.env, POSTGRES_URL: 'postgres://invalid:invalid@127.0.0.1:1/invalid' } },
);
assert.equal(earlyRelease.status, 1);
assert.match(earlyRelease.stderr, /release window opens 2026-09-21/);
assert(pipeline.includes('ownerEarlyReleaseOverride'), 'Pipeline must audit owner overrides explicitly');
assert(pipeline.includes('owner override cannot authorize another candidate'), 'Override must remain candidate-specific');
assert(pipeline.includes('explicit --commit required for production write'), 'Override must preserve explicit production writes');
console.log('PASS Jasper release: identity, pricing, credits, governance, media, owner override and noindex gates');
