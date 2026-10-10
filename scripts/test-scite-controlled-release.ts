import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

import { evaluatePublicationPolicy } from './claim-publication-policy';
import {
  assertSciteAsset,
  assertSciteEmptyPreimage,
  assertSciteProtectedRowsUnchanged,
  SCITE_RELEASE_ID,
} from './scite-release-guard';

const audit = JSON.parse(fs.readFileSync('data/collection/scite-controlled-release-preaudit-2026-10-10.json', 'utf8'));
const payload = JSON.parse(fs.readFileSync('data/collection/scite-release.json', 'utf8'));
assert.equal(payload.id, SCITE_RELEASE_ID);
assert.equal(audit.status, 'ready_for_next_slot');
assert.equal(audit.productionWriteApproved, false);
assert.equal(audit.sitemapChangeApproved, false);
assert.equal(payload.features.release.sitemapEligible, false);
assert.equal(payload.features.release.relationshipCreationApproved, false);
assert.equal(payload.officialUrl, 'https://scite.ai/');
assert.deepEqual(evaluatePublicationPolicy(audit.publicationPolicy).claimLevelHolds, audit.claimLevelHolds);
assert.equal(evaluatePublicationPolicy(audit.publicationPolicy).releaseState, 'READY_MONITOR');
for (const gate of Object.keys(audit.publicationPolicy.entityGates)) {
  const changed = structuredClone(audit.publicationPolicy);
  changed.entityGates[gate] = 'fail';
  assert.equal(evaluatePublicationPolicy(changed).releaseState, 'HOLD', gate);
}
for (const claim of audit.publicationPolicy.claims) {
  assert.equal(claim.exposure, 'boundary');
  assert(claim.publicLimitation.length > 30);
  const changed = structuredClone(audit.publicationPolicy);
  changed.claims.find((item: { id: string }) => item.id === claim.id).exposure = 'exact';
  assert.throws(() => evaluatePublicationPolicy(changed), /unresolved claim/);
}
const labels = {
  en: ['Best for', 'Not ideal for', 'Correction and owner update'],
  zh: ['适合', '不适合', '纠错与 Owner 更新'],
  cn: ['適合', '不適合', '更正與 Owner 更新'],
};
for (const locale of ['en', 'zh', 'cn'] as const) {
  const detail = payload.detail[locale] as string;
  assert(detail.includes(audit.sources.official[1]));
  assert(detail.includes('2026-10-10'));
  assert(detail.includes('2026-10-17'));
  assert(detail.includes('2026-10-24'));
  assert(detail.includes('2026-11-09'));
  for (const label of labels[locale]) assert(detail.includes(label));
  assert(!/\$\d+|\b(?:250|2500|317M|300M|1\.6B)\b/.test(detail), 'precise commercial or coverage assertion leaked');
}
assertSciteAsset(payload, audit.assetSha256);
assert.throws(
  () => assertSciteAsset({ ...payload, id: '00000000-0000-4000-8000-000000000000' }, audit.assetSha256),
  /fixed ID/,
);
assert.throws(() => assertSciteAsset(payload, { [payload.imageUrl]: '0'.repeat(64) }), /asset hash mismatch/);
assertSciteEmptyPreimage([], []);
assert.throws(() => assertSciteEmptyPreimage([{ id: 'other' }], []), /duplicate identity/);
assert.throws(() => assertSciteEmptyPreimage([], [{ id: SCITE_RELEASE_ID }]), /fixed ID is occupied/);
assertSciteProtectedRowsUnchanged([{ id: 'old', status: 'published' }], [{ id: 'old', status: 'published' }]);
assert.throws(
  () => assertSciteProtectedRowsUnchanged([{ id: 'old', status: 'published' }], [{ id: 'old', status: 'draft' }]),
  /protected existing tool rows/,
);
const run = spawnSync(
  process.execPath,
  [
    '--import',
    'tsx',
    'scripts/candidate-release-pipeline.ts',
    '--candidate=scite',
    '--phase=validate',
    '--as-of=2026-10-10',
  ],
  { encoding: 'utf8' },
);
assert.equal(run.status, 0, run.stderr || run.stdout);
console.log('PASS Scite fixed identity, media, content and two-layer release gates');
