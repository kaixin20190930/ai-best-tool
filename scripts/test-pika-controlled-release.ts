import assert from 'node:assert/strict';
import fs from 'node:fs';

import { evaluatePublicationPolicy, validateOptionalPublicationPolicy } from './claim-publication-policy';
import { assertPikaEmptyPreimage, assertPikaSingleInsert } from './pika-release-guard';

const audit = JSON.parse(fs.readFileSync('data/collection/pika-controlled-release-preaudit-2026-10-08.json', 'utf8'));
const payload = JSON.parse(fs.readFileSync('data/collection/pika-release.json', 'utf8'));
const pipeline = fs.readFileSync('scripts/candidate-release-pipeline.ts', 'utf8');

assert.equal(audit.status, 'ready_for_next_slot');
assert.equal(audit.productionWriteApproved, false);
assert.equal(audit.sitemapChangeApproved, false);
assert.equal(audit.releaseIndexState, 'monitor');
assert.deepEqual(validateOptionalPublicationPolicy(audit)?.claimLevelHolds, audit.claimLevelHolds);
assert.equal(evaluatePublicationPolicy(audit.publicationPolicy).releaseState, 'READY_MONITOR');
assert.equal(audit.publicationPolicy.claims.length, 8);
for (const claim of audit.publicationPolicy.claims) {
  assert.notEqual(claim.exposure, 'exact');
  assert.equal(claim.preciseRecommendation, false);
  assert(claim.publicLimitation && claim.sources.length && claim.nextReviewDate > '2026-10-08');
}
for (const gate of Object.keys(audit.publicationPolicy.entityGates)) {
  const bad = structuredClone(audit.publicationPolicy);
  bad.entityGates[gate] = 'fail';
  assert.equal(evaluatePublicationPolicy(bad).releaseState, 'HOLD');
}
for (const key of ['publicLimitation', 'sources', 'nextReviewDate']) {
  const bad = structuredClone(audit.publicationPolicy);
  bad.claims[0][key] = key === 'sources' ? [] : '';
  assert.throws(() => evaluatePublicationPolicy(bad));
}
assert.equal(payload.slug, 'pika');
assert.equal(payload.features.release.indexState, 'monitor');
assert.equal(payload.features.release.sitemapChangeApproved, false);
assert.equal(payload.features.release.relationshipCreationApproved, false);
assert.equal(payload.imageUrl, '/images/tool-media/pika-editorial-cover.svg');
assert.equal(payload.thumbnailUrl, payload.imageUrl);
assert(fs.existsSync(`public${payload.imageUrl}`));
assert.equal(payload.videoUrl, undefined);
for (const locale of ['en', 'zh', 'cn']) {
  assert(payload.detail[locale].includes('https://pika.art/pricing'));
  assert(payload.detail[locale].includes('https://pika.art/faq'));
  assert(payload.detail[locale].includes('2026-10-15'));
  assert(!/\$\s?\d+/.test(payload.detail[locale]));
  assert(payload.detail[locale].length > (locale === 'en' ? 900 : 450));
}
assert(pipeline.includes("slug: 'pika'"));
assert(pipeline.includes("candidate.slug === 'murf' || candidate.slug === 'pika'"));
assert(pipeline.includes("if (options.phase === 'preflight') await client.query('BEGIN READ ONLY')"));
assert.doesNotThrow(() => assertPikaEmptyPreimage([], [], payload.id));
assert.throws(() => assertPikaEmptyPreimage([{ id: 'other', name: 'pika' }], [], payload.id));
assert.throws(() => assertPikaEmptyPreimage([], [{ id: payload.id, name: 'other' }], payload.id));
assert.doesNotThrow(() => assertPikaSingleInsert(1));
assert.throws(() => assertPikaSingleInsert(0));
assert.throws(() => assertPikaSingleInsert(2));
console.log('PASS Pika controlled release: two-layer gates, localized boundary, media and protected-row negatives');
