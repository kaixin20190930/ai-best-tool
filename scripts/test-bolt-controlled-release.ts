import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

import { getLocalizedToolValue } from '../lib/services/toolPresenter';
import { evaluatePublicationPolicy } from './claim-publication-policy';
import {
  BOLT_RELEASE_ID,
  assertBoltAsset,
  assertBoltControllerAuthorization,
  assertBoltEmptyPreimage,
  assertBoltProtectedRowsUnchanged,
} from './bolt-release-guard';

const audit = JSON.parse(fs.readFileSync('data/collection/bolt-controlled-release-preaudit-2026-10-12.json', 'utf8'));
const payload = JSON.parse(fs.readFileSync('data/collection/bolt-release.json', 'utf8'));

assert.equal(payload.id, BOLT_RELEASE_ID);
assert.equal(payload.officialUrl, 'https://bolt.new/');
assert.equal(audit.productionWriteApproved, true);
assert.equal(audit.sitemapChangeApproved, false);
assertBoltControllerAuthorization(audit.controllerWriteAuthorization);
assert.equal(audit.controllerWriteAuthorization.authorizedAt, '2026-10-12');
assert(audit.controllerWriteAuthorization.reason.includes('QA_PASS_CONTROLLER_RELEASE'));
assert.throws(() => assertBoltControllerAuthorization(undefined), /QA authorization/);
assert.throws(
  () => assertBoltControllerAuthorization({ ...audit.controllerWriteAuthorization, independentQaPass: false }),
  /independent QA PASS/,
);
assert.throws(
  () => assertBoltControllerAuthorization({ ...audit.controllerWriteAuthorization, candidateSlug: 'other' }),
  /authorization candidate mismatch/,
);
for (const [gate, error] of [
  ['indexApproved', /index approval is forbidden/],
  ['sitemapEligible', /sitemap approval is forbidden/],
  ['taskCapabilityFitCreationApproved', /relationship creation is forbidden/],
] as const) {
  const authorization = structuredClone(audit.controllerWriteAuthorization);
  authorization.preservedGates[gate] = true;
  assert.throws(() => assertBoltControllerAuthorization(authorization), error);
}
assert.equal(payload.features.release.sitemapEligible, false);
assert.equal(payload.features.release.relationshipCreationApproved, false);
assert.equal(evaluatePublicationPolicy(audit.publicationPolicy).releaseState, 'READY_MONITOR');
assert.deepEqual(evaluatePublicationPolicy(audit.publicationPolicy).claimLevelHolds, audit.claimLevelHolds);
assert.deepEqual(
  payload.features.publicationPolicy.claims.map((claim: { id: string; status: string }) => [claim.id, claim.status]),
  audit.publicationPolicy.claims.map((claim: { id: string; status: string }) => [claim.id, claim.status]),
);

for (const gate of Object.keys(audit.publicationPolicy.entityGates)) {
  const changed = structuredClone(audit.publicationPolicy);
  changed.entityGates[gate] = 'fail';
  assert.equal(evaluatePublicationPolicy(changed).releaseState, 'HOLD', gate);
}
for (const claim of audit.publicationPolicy.claims) {
  const changed = structuredClone(audit.publicationPolicy);
  changed.claims.find((item: { id: string }) => item.id === claim.id).exposure = 'exact';
  assert.throws(() => evaluatePublicationPolicy(changed), /unresolved claim/);
}

for (const field of [payload.title, payload.content, payload.detail, payload.useCases]) {
  assert.deepEqual(Object.keys(field).sort(), ['cn', 'en', 'tw', 'zh']);
}
for (const locale of ['en', 'cn', 'tw'] as const) {
  const detail = payload.detail[locale] as string;
  assert(detail.includes('https://bolt.new/pricing'));
  assert(detail.includes('https://allaboutcookies.org/bolt-new-review'));
  assert(detail.includes('https://www.g2.com/products/bolt-new/reviews'));
  for (const date of ['2026-10-12', '2026-10-19', '2026-10-26', '2026-11-11']) assert(detail.includes(date));
}
assert(getLocalizedToolValue(payload.title, 'cn').includes('浏览器内'));
assert(getLocalizedToolValue(payload.title, 'tw').includes('瀏覽器內'));
assert(payload.detail.cn.includes('比较路径'));
assert(payload.detail.tw.includes('比較路徑'));
assert(payload.detail.en.includes('Terms section 3.5(g)'));
assert(payload.detail.en.includes('conditional') === false, 'internal Claim state leaked into public copy');
assert(!/guaranteed|production-ready|unlimited tokens/i.test(payload.detail.en), 'unsupported exact promise leaked');

assertBoltAsset(payload, audit.assetSha256);
assert.throws(() => assertBoltAsset({ ...payload, id: '00000000-0000-4000-8000-000000000000' }, audit.assetSha256), /fixed ID/);
assert.throws(() => assertBoltAsset(payload, { [payload.imageUrl]: '0'.repeat(64) }), /asset hash mismatch/);
assertBoltEmptyPreimage([], []);
assert.throws(() => assertBoltEmptyPreimage([{ id: 'other' }], []), /duplicate identity/);
assert.throws(() => assertBoltEmptyPreimage([], [{ id: BOLT_RELEASE_ID }]), /fixed ID is occupied/);
assertBoltProtectedRowsUnchanged([{ id: 'old', row_md5: 'a' }], [{ id: 'old', row_md5: 'a' }]);
assert.throws(
  () => assertBoltProtectedRowsUnchanged([{ id: 'old', row_md5: 'a' }], [{ id: 'old', row_md5: 'b' }]),
  /protected existing tool rows/,
);
const validate = spawnSync(
  process.execPath,
  ['--import', 'tsx', 'scripts/candidate-release-pipeline.ts', '--candidate=bolt', '--phase=validate', '--as-of=2026-10-12'],
  { encoding: 'utf8' },
);
assert.equal(validate.status, 0, validate.stderr || validate.stdout);

console.log('PASS Bolt identity, media, locale, Claims, controller authorization, and fail-closed high-risk gates');
