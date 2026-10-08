import assert from 'node:assert/strict';

import {
  claimReviewIntervalDays,
  evaluatePublicationPolicy,
  validateOptionalPublicationPolicy,
  type PublicationPolicyManifest,
} from './claim-publication-policy';

const passingEntityGates: PublicationPolicyManifest['entityGates'] = {
  identity: 'pass',
  uniqueCanonical: 'pass',
  duplicateIntent: 'pass',
  coreFunction: 'pass',
  assetRightsAndLegalSafety: 'pass',
  misleadingClaims: 'pass',
  pageContentSufficiency: 'pass',
};

const unknownAccountPrice = evaluatePublicationPolicy({
  entityGates: passingEntityGates,
  claims: [
    {
      id: 'account-price',
      category: 'price',
      status: 'unknown',
      exposure: 'omitted',
      preciseRecommendation: false,
    },
  ],
});
assert.equal(unknownAccountPrice.releaseState, 'READY_MONITOR');
assert.equal(unknownAccountPrice.entityReleaseApproved, true);
assert.deepEqual(unknownAccountPrice.claimLevelHolds, ['account-price']);
assert.equal(unknownAccountPrice.continueIndexApproved, false);
assert.equal(unknownAccountPrice.indexReleaseApproved, false);
const accountScopedFact = evaluatePublicationPolicy({
  entityGates: passingEntityGates,
  claims: [
    {
      id: 'my-plan-right',
      category: 'account_rights',
      status: 'verified_account',
      scope: 'account',
      exposure: 'boundary',
      preciseRecommendation: true,
    },
  ],
});
assert.deepEqual(accountScopedFact.claimLevelHolds, []);
assert.equal(accountScopedFact.releaseState, 'READY_MONITOR');
assert.throws(
  () =>
    evaluatePublicationPolicy({
      entityGates: passingEntityGates,
      claims: [
        {
          id: 'unscoped-account-fact',
          category: 'account_rights',
          status: 'verified_account',
          exposure: 'exact',
          preciseRecommendation: true,
        },
      ],
    }),
  /verified_account must stay account-scoped/,
);

for (const gate of ['identity', 'coreFunction'] as const) {
  const failed = evaluatePublicationPolicy({
    entityGates: { ...passingEntityGates, [gate]: 'fail' },
    claims: [],
  });
  assert.equal(failed.releaseState, 'HOLD', `${gate} failure must globally hold publication`);
}

const conflictClaim = {
  id: 'deletion-scope',
  category: 'privacy_rights' as const,
  status: 'conflict' as const,
  exposure: 'boundary' as const,
  preciseRecommendation: false,
  publicLimitation: 'Deletion and retained audio timing vary by request and account scope.',
  sources: ['https://example.com/privacy', 'https://example.com/security'],
  nextReviewDate: '2026-10-22',
};
const conflictDecision = evaluatePublicationPolicy({ entityGates: passingEntityGates, claims: [conflictClaim] });
assert.equal(conflictDecision.releaseState, 'READY_MONITOR');
assert.deepEqual(conflictDecision.claimLevelHolds, ['deletion-scope']);
assert.throws(
  () => evaluatePublicationPolicy({ entityGates: passingEntityGates, claims: [{ ...conflictClaim, nextReviewDate: undefined }] }),
  /conflict requires a public limitation, source, and nextReviewDate/,
);
assert.throws(
  () => evaluatePublicationPolicy({ entityGates: passingEntityGates, claims: [{ ...conflictClaim, exposure: 'exact' }] }),
  /conflict requires a public limitation, source, and nextReviewDate/,
);

// Murf-like case: the product entity can be monitor-ready while its account facts stay claim-held.
const murfLike = evaluatePublicationPolicy({
  entityGates: passingEntityGates,
  claims: [
    { id: 'price', category: 'price', status: 'unknown', exposure: 'omitted', preciseRecommendation: false },
    {
      id: 'account-rights',
      category: 'account_rights',
      status: 'conflict',
      exposure: 'boundary',
      preciseRecommendation: false,
      publicLimitation: 'Exact plan rights depend on account and checkout scope.',
      sources: ['https://example.com/plans'],
      nextReviewDate: '2026-10-22',
    },
  ],
});
assert.equal(murfLike.entityReleaseApproved, true);
assert.equal(murfLike.releaseState, 'READY_MONITOR');
assert.deepEqual(murfLike.claimLevelHolds, ['price', 'account-rights']);
assert.equal(murfLike.continueIndexApproved, false);

assert.equal(
  validateOptionalPublicationPolicy({ status: 'ready_for_next_slot' }),
  null,
  'Legacy manifest without policy fields must remain compatible',
);
assert.equal(
  claimReviewIntervalDays('price', 'first'),
  7,
);
assert.equal(claimReviewIntervalDays('price', 'routine'), 14);
assert.equal(claimReviewIntervalDays('account_rights', 'first'), 14);
assert.equal(claimReviewIntervalDays('account_rights', 'routine'), 30);
assert.equal(claimReviewIntervalDays('account_rights', 'first', 2), 30);
assert.equal(claimReviewIntervalDays('privacy_rights', 'first'), 14);
assert.equal(claimReviewIntervalDays('privacy_rights', 'routine'), 30);
assert.equal(claimReviewIntervalDays('core_capability', 'first'), 30);
assert.equal(claimReviewIntervalDays('core_capability', 'routine'), 60);
assert.equal(claimReviewIntervalDays('identity_canonical', 'first'), 30);
assert.equal(claimReviewIntervalDays('identity_canonical', 'routine'), 90);

console.log('✅ Claim publication policy contract passed.');
