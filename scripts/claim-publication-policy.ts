export type EntityGateStatus = 'pass' | 'fail' | 'unknown';
export type ClaimStatus =
  | 'verified_public'
  | 'verified_account'
  | 'conditional'
  | 'conflict'
  | 'unknown'
  | 'stale';
export type ClaimCategory =
  | 'price'
  | 'account_rights'
  | 'privacy_rights'
  | 'core_capability'
  | 'identity_canonical';

export type ClaimReview = {
  id: string;
  category: ClaimCategory;
  status: ClaimStatus;
  scope?: 'public' | 'account';
  exposure: 'omitted' | 'boundary' | 'exact';
  preciseRecommendation: boolean;
  publicLimitation?: string;
  sources?: string[];
  nextReviewDate?: string;
};

export type PublicationPolicyManifest = {
  entityGates: {
    identity: EntityGateStatus;
    uniqueCanonical: EntityGateStatus;
    duplicateIntent: EntityGateStatus;
    coreFunction: EntityGateStatus;
    assetRightsAndLegalSafety: EntityGateStatus;
    misleadingClaims: EntityGateStatus;
    pageContentSufficiency: EntityGateStatus;
  };
  claims: ClaimReview[];
};

export type PublicationPolicyDecision = {
  entityReleaseApproved: boolean;
  releaseState: 'READY_MONITOR' | 'HOLD';
  entityHolds: string[];
  claimLevelHolds: string[];
  indexReleaseApproved: false;
  continueIndexApproved: false;
};

const entityGateKeys = [
  'identity',
  'uniqueCanonical',
  'duplicateIntent',
  'coreFunction',
  'assetRightsAndLegalSafety',
  'misleadingClaims',
  'pageContentSufficiency',
] as const;

const claimStatuses = new Set<ClaimStatus>([
  'verified_public',
  'verified_account',
  'conditional',
  'conflict',
  'unknown',
  'stale',
]);

export function evaluatePublicationPolicy(
  manifest: PublicationPolicyManifest,
): PublicationPolicyDecision {
  const entityHolds = entityGateKeys.filter((key) => manifest.entityGates[key] !== 'pass');
  const claimLevelHolds: string[] = [];

  for (const claim of manifest.claims) {
    if (!claim.id || !claimStatuses.has(claim.status)) {
      throw new Error('Each claim needs an id and a supported status');
    }
    if (
      claim.status === 'verified_account' &&
      (claim.scope !== 'account' || claim.exposure === 'exact')
    ) {
      throw new Error(`${claim.id}: verified_account must stay account-scoped and cannot be a public exact assertion`);
    }
    if (claim.status === 'conflict') {
      if (
        claim.exposure !== 'boundary' ||
        !claim.publicLimitation?.trim() ||
        !claim.nextReviewDate ||
        !/^\d{4}-\d{2}-\d{2}$/.test(claim.nextReviewDate) ||
        !claim.sources?.length
      ) {
        throw new Error(`${claim.id}: conflict requires a public limitation, source, and nextReviewDate`);
      }
    }

    const unresolved = ['conditional', 'conflict', 'unknown', 'stale'].includes(claim.status);
    if (unresolved) claimLevelHolds.push(claim.id);
    if (unresolved && (claim.exposure === 'exact' || claim.preciseRecommendation)) {
      throw new Error(`${claim.id}: unresolved claim cannot be stated exactly or drive a precise recommendation`);
    }
  }

  const entityReleaseApproved = entityHolds.length === 0;
  return {
    entityReleaseApproved,
    releaseState: entityReleaseApproved ? 'READY_MONITOR' : 'HOLD',
    entityHolds,
    claimLevelHolds,
    indexReleaseApproved: false,
    continueIndexApproved: false,
  };
}

export function claimReviewIntervalDays(
  category: ClaimCategory,
  cadence: 'first' | 'routine',
  consecutiveAccountFactFailures = 0,
): number {
  if (category === 'price') return cadence === 'first' ? 7 : 14;
  if (category === 'account_rights') {
    return consecutiveAccountFactFailures >= 2 ? 30 : cadence === 'first' ? 14 : 30;
  }
  if (category === 'privacy_rights') return cadence === 'first' ? 14 : 30;
  if (category === 'core_capability') return cadence === 'first' ? 30 : 60;
  return cadence === 'first' ? 30 : 90;
}

export function validateOptionalPublicationPolicy(preaudit: {
  status: string;
  entityReleaseApproved?: boolean;
  claimLevelHolds?: string[];
  publicationPolicy?: PublicationPolicyManifest;
}): PublicationPolicyDecision | null {
  if (!preaudit.publicationPolicy) return null; // Legacy manifests remain valid.
  const decision = evaluatePublicationPolicy(preaudit.publicationPolicy);
  if (preaudit.entityReleaseApproved !== decision.entityReleaseApproved) {
    throw new Error('entityReleaseApproved does not match entity-level gate results');
  }
  if (JSON.stringify(preaudit.claimLevelHolds || []) !== JSON.stringify(decision.claimLevelHolds)) {
    throw new Error('claimLevelHolds does not match claim-level results');
  }
  if (preaudit.status === 'ready_for_next_slot' && !decision.entityReleaseApproved) {
    throw new Error('Entity-level HOLD cannot enter ready_for_next_slot');
  }
  return decision;
}
