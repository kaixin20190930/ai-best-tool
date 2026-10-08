import assert from 'node:assert/strict';
import fs from 'node:fs';

import { validateVideoUrl } from './candidate-release-video';
import { evaluatePublicationPolicy, validateOptionalPublicationPolicy } from './claim-publication-policy';
import { assertMurfEmptyPreimage, assertMurfSingleInsert } from './murf-release-guard';

const audit = JSON.parse(fs.readFileSync('data/collection/murf-controlled-release-preaudit-2026-10-08.json', 'utf8'));
const payload = JSON.parse(fs.readFileSync('data/collection/murf-release.json', 'utf8'));
const source = fs.readFileSync('scripts/candidate-release-pipeline.ts', 'utf8');

assert.equal(audit.slug, 'murf');
assert.equal(payload.slug, 'murf');
assert.equal(payload.id, '8f2d4b5e-7481-4bb8-9f21-8d2de1c0f631');
assert.equal(payload.features.release.vendor, 'Murf');
assert.equal(payload.features.release.product, 'Murf Studio');
assert.equal(payload.features.release.indexState, 'monitor');
assert.equal(payload.features.release.sitemapChangeApproved, false);
assert.equal(payload.features.release.relationshipCreationApproved, false);
assert.equal(audit.status, 'released');
assert.equal(audit.productionWriteApproved, true);
assert.equal(audit.releasedAt, '2026-10-08');
assert.equal(audit.releaseIndexState, 'monitor');
assert.equal(audit.sitemapChangeApproved, false);
assert.equal(payload.nextReviewDate, '2026-10-15');
assert.deepEqual(validateOptionalPublicationPolicy(audit)?.claimLevelHolds, audit.claimLevelHolds);
assert.equal(evaluatePublicationPolicy(audit.publicationPolicy).releaseState, 'READY_MONITOR');
assert.equal(audit.publicationPolicy.entityGates.uniqueCanonical, 'pass');
assert.equal(audit.publicationPolicy.entityGates.assetRightsAndLegalSafety, 'pass');
assert.equal(audit.publicationPolicy.claims.length, 6);
for (const claim of audit.publicationPolicy.claims) {
  assert.notEqual(claim.exposure, 'exact');
  assert.equal(claim.preciseRecommendation, false);
  assert(claim.sources.length > 0);
  assert(claim.nextReviewDate > '2026-10-08');
}
for (const locale of ['en', 'zh', 'cn']) {
  assert(payload.detail[locale].includes('https://murf.ai/pricing'));
  assert(payload.detail[locale].includes('https://murf.ai/security'));
  assert(!/\$\s?\d+/.test(payload.detail[locale]));
  assert(!/100 projects|500 projects|100 项目|500 项目|100 專案|500 專案/.test(payload.detail[locale]));
  assert(payload.detail[locale].length > (locale === 'en' ? 900 : 450));
}
assert.equal(payload.imageUrl, '/images/tool-media/murf-studio-editorial-cover.svg');
assert.equal(payload.thumbnailUrl, payload.imageUrl);
assert(fs.existsSync(`public${payload.imageUrl}`));
validateVideoUrl('murf', payload.videoUrl);
assert.equal(payload.videoUrl, 'https://www.youtube-nocookie.com/embed/M2-5OhbVwaE');
assert(source.includes("slug: 'murf'"));
assert(source.includes('WHERE $16::boolean = false'));
assert(source.includes('assertMurfSingleInsert(insert.rowCount)'));
assert(source.includes("if (options.phase === 'preflight') await client.query('BEGIN READ ONLY')"));

const id = payload.id;
assert.doesNotThrow(() => assertMurfEmptyPreimage([], [], id));
assert.throws(() => assertMurfEmptyPreimage([{ id: 'other', name: 'murf' }], [], id), /duplicate slug/);
assert.throws(() => assertMurfEmptyPreimage([], [{ id, name: 'unrelated' }], id), /protected existing ID/);
assert.doesNotThrow(() => assertMurfSingleInsert(1));
assert.throws(() => assertMurfSingleInsert(0), /protected row was not overwritten/);
assert.throws(() => assertMurfSingleInsert(2), /exactly one entity/);

for (const gate of Object.keys(audit.publicationPolicy.entityGates)) {
  const bad = structuredClone(audit.publicationPolicy);
  bad.entityGates[gate] = 'fail';
  assert.equal(evaluatePublicationPolicy(bad).releaseState, 'HOLD');
}
for (const change of [
  (x: any) => {
    x.claims[2].publicLimitation = '';
  },
  (x: any) => {
    x.claims[2].sources = [];
  },
  (x: any) => {
    x.claims[2].nextReviewDate = undefined;
  },
  (x: any) => {
    x.claims[2].exposure = 'exact';
  },
]) {
  const bad = structuredClone(audit.publicationPolicy);
  change(bad);
  assert.throws(() => evaluatePublicationPolicy(bad));
}
console.log(
  'PASS Murf controlled release: two-layer gates, localized copy, source boundaries, media, duplicate and protected-row negatives',
);
