import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { getToolIndexDecision } from '../lib/seo/toolIndexing';

const audit = JSON.parse(fs.readFileSync('data/collection/descript-preaudit-2026-09-20.json', 'utf8'));
const buffer = JSON.parse(fs.readFileSync('data/collection/mature-candidate-buffer-2026-09-20.json', 'utf8'));
const payload = JSON.parse(fs.readFileSync('data/collection/descript-release.json', 'utf8'));

assert.equal(audit.slug, 'descript');
assert.equal(audit.existingRoute, '/ai/descript');
assert.equal(audit.action, 'migrate_existing_fallback');
assert.equal(audit.status, 'ready_for_next_slot');
assert.equal(audit.reviewedAt, '2026-09-20');
assert.equal(audit.publishNotBefore, '2026-09-23');
assert.equal(audit.productionWriteApproved, false);
assert.equal(audit.sitemapChangeApproved, false);
assert.equal(audit.releaseIndexState, 'monitor');
assert.equal(audit.routeAudit.productionEntityMatches, 0);
assert.equal(audit.routeAudit.sitemapMatches, 0);
assert.equal(audit.identityDecision.canonicalProduct, 'Descript');
assert(audit.decisionAngles.length >= 8);
assert(audit.limitations.length >= 12);
assert(audit.policyBoundaries.length >= 4);
assert(audit.sources.official.length >= 7);
assert(audit.sources.independent.length >= 2);
assert(audit.nextSlotChecklist.length >= 7);
assert.equal(audit.marketValidation.verdict, 'validated');
assert(audit.marketValidation.score >= 90);

const candidate = buffer.candidates.find((item: { slug: string }) => item.slug === 'descript');
assert(candidate);
assert.equal(candidate.status, 'ready_for_next_slot');
assert.equal(candidate.publicReleaseApproved, false);
assert.equal(candidate.indexReleaseApproved, false);

const facts = JSON.stringify(audit);
for (const pattern of [
  /one media hour per month and 100 AI credits granted one time/,
  /USD 16 per person per month billed annually or USD 24 monthly/,
  /USD 24 per person per month billed annually or USD 35 monthly/,
  /USD 50 per person per month billed annually or USD 65 monthly/,
  /Unused media minutes do not roll over/,
  /speaker's authorization/,
  /Share Data with Descript/,
  /published \+ monitor\/noindex/,
]) assert.match(facts, pattern);

assert(!/unlimited AI|guaranteed commercial rights|never uses customer data/i.test(facts));
assert.equal(payload.slug, 'descript');
assert.equal(payload.categorySlug, audit.category.storageSlug);
assert.equal(payload.features.release.scheduledSlot, audit.publishNotBefore);
assert.equal(payload.features.release.indexState, 'monitor');
for (const locale of ['en', 'zh', 'cn']) {
  assert(payload.title[locale].length > 10);
  assert(payload.content[locale].length > 40);
  assert(payload.detail[locale].length > 900);
  assert(payload.features.decision.limitations[locale].length >= 12);
}
for (const media of payload.features.media.assets) {
  assert.equal(media.type, 'editorial_identifier');
  assert.equal(media.isProductScreenshot, false);
  assert.equal(createHash('sha256').update(fs.readFileSync(path.join('public', media.path.slice(1)))).digest('hex'), media.sha256);
}
const decision = getToolIndexDecision({status: 'published', pageQualityStatus: 'monitor', categoryId: 'reviewed-category', imageUrl: payload.imageUrl, thumbnailUrl: payload.thumbnailUrl, content: payload.content, detail: payload.detail, pricing: payload.pricing, tags: payload.tags});
assert.equal(decision.indexable, false);
const earlyRelease = spawnSync('tsx', ['scripts/candidate-release-pipeline.ts', '--candidate=descript', '--phase=release', '--as-of=2026-09-22'], {cwd: process.cwd(), encoding: 'utf8', env: {...process.env, POSTGRES_URL: 'postgres://invalid:invalid@127.0.0.1:1/invalid'}});
assert.equal(earlyRelease.status, 1);
assert.match(earlyRelease.stderr, /release window opens 2026-09-23/);
console.log('PASS Descript release: identity, pricing, usage meters, consent, rights, media and noindex date gates');
