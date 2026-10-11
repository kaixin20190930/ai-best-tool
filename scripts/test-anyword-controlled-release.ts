import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

import { evaluatePublicationPolicy } from './claim-publication-policy';
import { getLocalizedToolValue } from '../lib/services/toolPresenter';
import {
  ANYWORD_RELEASE_ID,
  assertAnywordAsset,
  assertAnywordControllerAuthorization,
  assertAnywordEmptyPreimage,
  assertAnywordProtectedRowsUnchanged,
} from './anyword-release-guard';

const audit = JSON.parse(fs.readFileSync('data/collection/anyword-controlled-release-preaudit-2026-10-11.json', 'utf8'));
const payload = JSON.parse(fs.readFileSync('data/collection/anyword-release.json', 'utf8'));
assert.equal(payload.id, ANYWORD_RELEASE_ID);
assert.equal(payload.categorySlug, 'text-writing');
assert.equal(payload.officialUrl, 'https://www.anyword.com/');
assert.equal(audit.productionWriteApproved, true);
assert.equal(audit.sitemapChangeApproved, false);
assertAnywordControllerAuthorization(audit.controllerWriteAuthorization);
assert.equal(audit.controllerWriteAuthorization.authorizedAt, '2026-10-11');
assert(audit.controllerWriteAuthorization.approver);
assert(audit.controllerWriteAuthorization.reason);
assert.throws(() => assertAnywordControllerAuthorization(undefined), /QA authorization/);
assert.throws(
  () => assertAnywordControllerAuthorization({ ...audit.controllerWriteAuthorization, independentQaPass: false }),
  /independent QA PASS/,
);
assert.throws(
  () => assertAnywordControllerAuthorization({ ...audit.controllerWriteAuthorization, candidateSlug: 'other' }),
  /authorization candidate mismatch/,
);
for (const [gate, error] of [
  ['indexApproved', /index approval is forbidden/],
  ['sitemapEligible', /sitemap approval is forbidden/],
  ['taskCapabilityFitCreationApproved', /relationship creation is forbidden/],
] as const) {
  const authorization = structuredClone(audit.controllerWriteAuthorization);
  authorization.preservedGates[gate] = true;
  assert.throws(() => assertAnywordControllerAuthorization(authorization), error);
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
const labels = {
  en: ['Best for', 'Not ideal for', 'Limitations', 'Comparison path', 'Correction and owner update'],
  cn: ['适合', '不适合', '限制', '比较路径', '纠错与 Owner 更新'],
  tw: ['適合', '不適合', '限制', '比較路徑', '更正與 Owner 更新'],
};
for (const field of [payload.title, payload.content, payload.detail, payload.useCases]) {
  assert.deepEqual(Object.keys(field).sort(), ['cn', 'en', 'tw']);
}
for (const field of [payload.features.audience.bestFit, payload.features.audience.notIdealFor, payload.features.editorial.trustNote]) {
  assert.deepEqual(Object.keys(field).sort(), ['cn', 'en', 'tw']);
}
for (const locale of ['en', 'cn', 'tw'] as const) {
  const detail = payload.detail[locale] as string;
  assert(detail.includes('https://www.anyword.com/pricing'));
  assert(detail.includes('https://www.g2.com/sellers/anyword'));
  for (const date of ['2026-10-11', '2026-10-18', '2026-10-25', '2026-11-10']) assert(detail.includes(date));
  for (const label of labels[locale]) assert(detail.includes(label));
  assert(!/76%|82%|\$39|\$49|\$79|\$99/.test(detail), 'unverified precise claim leaked');
}
assert(getLocalizedToolValue(payload.title, 'cn').includes('比较营销文案'));
assert(getLocalizedToolValue(payload.title, 'tw').includes('比較行銷文案'));
assert(getLocalizedToolValue(payload.content, 'cn').includes('营销团队'));
assert(getLocalizedToolValue(payload.content, 'tw').includes('行銷團隊'));
assert(getLocalizedToolValue(payload.detail, 'cn').includes('比较路径'));
assert(getLocalizedToolValue(payload.detail, 'tw').includes('比較路徑'));
assert(payload.useCases.cn[0].includes('营销文案'));
assert(payload.useCases.tw[0].includes('行銷文案'));
assertAnywordAsset(payload, audit.assetSha256);
assert.throws(() => assertAnywordAsset({ ...payload, id: '00000000-0000-4000-8000-000000000000' }, audit.assetSha256), /fixed ID/);
assert.throws(() => assertAnywordAsset(payload, { [payload.imageUrl]: '0'.repeat(64) }), /asset hash mismatch/);
assertAnywordEmptyPreimage([], []);
assert.throws(() => assertAnywordEmptyPreimage([{ id: 'other' }], []), /duplicate identity/);
assert.throws(() => assertAnywordEmptyPreimage([], [{ id: ANYWORD_RELEASE_ID }]), /fixed ID is occupied/);
assertAnywordProtectedRowsUnchanged([{ id: 'old', status: 'published' }], [{ id: 'old', status: 'published' }]);
assert.throws(() => assertAnywordProtectedRowsUnchanged([{ id: 'old', status: 'published' }], [{ id: 'old', status: 'draft' }]), /protected existing tool rows/);
const run = spawnSync(process.execPath, ['--import', 'tsx', 'scripts/candidate-release-pipeline.ts', '--candidate=anyword', '--phase=validate', '--as-of=2026-10-11'], { encoding: 'utf8' });
assert.equal(run.status, 0, run.stderr || run.stdout);
console.log('PASS Anyword fixed identity, original media, three-locale copy and two-layer release gate');
