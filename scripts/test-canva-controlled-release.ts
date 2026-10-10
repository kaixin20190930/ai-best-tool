import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

import { getCanonicalToolSlug, getLocalizedToolPath, isLegacyToolSlug } from '../lib/config/toolRouteAliases';
import {
  assertCanvaAsset,
  assertCanvaEmptyPreimage,
  assertCanvaProtectedRowsUnchanged,
  assertCanvaReleasePayload,
  CANVA_EDITORIAL_ASSET,
  CANVA_RELEASE_ID,
  isCanvaIdentityFieldMatch,
} from './canva-release-guard';
import { evaluatePublicationPolicy } from './claim-publication-policy';

const candidate = JSON.parse(fs.readFileSync('data/collection/canva-evidence-candidate-2026-10-10.json', 'utf8'));
const manifest = JSON.parse(fs.readFileSync('data/collection/canva-release.json', 'utf8'));
const audit = JSON.parse(fs.readFileSync('data/collection/canva-controlled-release-preaudit-2026-10-10.json', 'utf8'));
const policy = evaluatePublicationPolicy(audit.publicationPolicy);

assert.equal(candidate.candidateStatus, 'ready_monitor_local_only');
assert.equal(manifest.id, CANVA_RELEASE_ID);
assert.equal(manifest.canonical, '/ai/canva');
assert.equal(manifest.release.productionWriteApproved, false);
assert.equal(manifest.release.indexApproved, false);
assert.equal(manifest.release.sitemapEligible, false);
assert.equal(manifest.release.taskCapabilityFitCreationApproved, false);
assert.equal(audit.productionWriteApproved, false);
assert.equal(audit.sitemapChangeApproved, false);
assert.equal(policy.releaseState, 'READY_MONITOR');
assert.equal(policy.indexReleaseApproved, false);
assert.equal(policy.continueIndexApproved, false);
assert.deepEqual(policy.claimLevelHolds, audit.claimLevelHolds);
assert.equal(
  audit.publicationPolicy.claims.filter((claim: { status: string }) => claim.status === 'unknown').length,
  0,
);
assert(audit.publicationPolicy.claims.some((claim: { status: string }) => claim.status === 'conditional'));
assert.equal(candidate.identity.productionToolsExactMatches, 0);
assert.equal(candidate.identity.decisionGraphProfiles, 0);
assert.equal(candidate.identity.decisionGraphSourcesExactMatches, 0);
assert.equal(candidate.identity.decisionGraphClaimsExactMatches, 0);

const copy = candidate.candidateCopy;
const appendCorrection = {
  en: 'Correction and owner updates: Owners can claim this listing and request updates; users can submit corrections for editorial review.',
  zh: '纠错与 Owner 更新：产品所有者可认领条目并申请更新；用户可提交资料纠错，由编辑审核。',
  cn: '更正與 Owner 更新：產品所有者可認領條目並申請更新；使用者可提交資料更正，由編輯審核。',
};
const payload = {
  id: manifest.id,
  slug: manifest.slug,
  officialUrl: manifest.officialUrl,
  reviewedAt: manifest.reviewedAt,
  nextReviewDate: manifest.nextReviewDate,
  title: copy.title,
  content: copy.content,
  detail: Object.fromEntries(
    Object.entries(copy.detail).map(([locale, detail]) => [
      locale,
      `${detail}\n\n${appendCorrection[locale as keyof typeof appendCorrection]}`,
    ]),
  ),
  imageUrl: manifest.media.asset,
  thumbnailUrl: manifest.media.asset,
  features: {
    media: manifest.media,
    release: {
      target: 'published_monitor_noindex',
      sitemapEligible: false,
      indexApproved: false,
      relationshipCreationApproved: false,
    },
    editorial: { nextReviewDate: manifest.nextReviewDate },
  },
};
assertCanvaReleasePayload(payload);
assertCanvaAsset(payload, audit.assetSha256);
assert.throws(
  () => assertCanvaAsset({ ...payload, id: '00000000-0000-4000-8000-000000000000' }, audit.assetSha256),
  /fixed ID/,
);
assert.throws(() => assertCanvaAsset(payload, { [CANVA_EDITORIAL_ASSET]: '0'.repeat(64) }), /asset hash mismatch/);

assertCanvaEmptyPreimage([], []);
assert.throws(() => assertCanvaEmptyPreimage([{ id: 'other' }], []), /identity match/);
assert.throws(() => assertCanvaEmptyPreimage([], [{ id: CANVA_RELEASE_ID }]), /fixed ID is occupied/);
assertCanvaProtectedRowsUnchanged(
  [{ id: 'protected', status: 'published' }],
  [{ id: 'protected', status: 'published' }],
);
assert.throws(
  () =>
    assertCanvaProtectedRowsUnchanged(
      [{ id: 'protected', status: 'published' }],
      [{ id: 'protected', status: 'draft' }],
    ),
  /protected existing tool rows changed/,
);
assert(isCanvaIdentityFieldMatch({ name: 'Magic Studio' }));
assert(isCanvaIdentityFieldMatch({ title: 'Canva: Magic Studio' }));
assert(
  !isCanvaIdentityFieldMatch({ name: 'Vector Sketch', title: 'Draw on an SVG canvas', url: 'https://vector.example' }),
);

assert.equal(getCanonicalToolSlug('canva-magic-studio'), 'canva');
assert.equal(getLocalizedToolPath('canva-magic-studio', 'en'), '/ai/canva');
assert.equal(getLocalizedToolPath('canva-magic-studio', 'cn'), '/cn/ai/canva');
assert.equal(getLocalizedToolPath('canva-magic-studio', 'tw'), '/tw/ai/canva');
assert(isLegacyToolSlug('canva-magic-studio'));
assert(!isLegacyToolSlug('canva'));
const middleware = fs.readFileSync('middleware.ts', 'utf8');
assert(middleware.includes("redirectUrl.pathname = getLocalizedToolPath(toolSlug, locale || 'en')"));
assert(
  middleware.includes('const redirectUrl = request.nextUrl.clone()'),
  'Alias redirect must preserve query parameters.',
);
assert(middleware.includes('NextResponse.redirect(redirectUrl, 308)'), 'Alias redirect must be permanent.');

const validation = spawnSync(
  process.execPath,
  [
    '--import',
    'tsx',
    'scripts/candidate-release-pipeline.ts',
    '--candidate=canva',
    '--phase=validate',
    '--as-of=2026-10-10',
  ],
  { encoding: 'utf8' },
);
assert.equal(validation.status, 0, validation.stderr || validation.stdout);
console.log(
  'PASS Canva fixed identity, candidate copy, claim boundaries, neutral media, localized alias, and no-index release gates',
);
