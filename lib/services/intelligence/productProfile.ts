import { createHash } from 'node:crypto';

import { resolveProductIntelligenceConflicts, type ConflictResolutionResult } from './conflictResolver';
import isVerifiedIntelligenceClaim from './claimVerification';
import type {
  IntelligenceClaimType,
  ProductIntelligenceAsset,
  ProductIntelligenceClaim,
  ProductIntelligenceProfile,
  ProductIntelligenceSource,
} from './types';

type ClaimByType = Map<IntelligenceClaimType, ProductIntelligenceClaim[]>;

export interface ProductIntelligenceFacts {
  productName: string | null;
  oneLinePositioning: string | null;
  pricingModel: string | null;
  pricingPlans: Array<{ name: string; priceText: string }>;
  freeTrial: string | null;
  targetAudiences: string[];
  useCases: string[];
  features: string[];
  integrations: string[];
  supportedPlatforms: string[];
  freeLimits: string[];
  exportLimits: string[];
  licenseLimits: string[];
  securityClaims: string[];
  officialSocials: string[];
  officialRepositories: string[];
  changelogUpdates: string[];
  limitations: string[];
}

export interface ProductIntelligenceProfileSnapshot {
  profile: ProductIntelligenceProfile;
  facts: ProductIntelligenceFacts;
  sources: ProductIntelligenceSource[];
  claims: ProductIntelligenceClaim[];
  assets: ProductIntelligenceAsset[];
  conflicts: ConflictResolutionResult['conflicts'];
  summary: {
    sourceCount: number;
    claimCount: number;
    assetCount: number;
    conflictCount: number;
    verifiedClaimCount: number;
    candidateClaimCount: number;
    latestObservedAt: string | null;
  };
  snapshotHash: string;
}

function normalizedText(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim().replace(/\s+/g, ' ');
  }
  return '';
}

function buildClaimByType(claims: ProductIntelligenceClaim[]): ClaimByType {
  const grouped = new Map<IntelligenceClaimType, ProductIntelligenceClaim[]>();
  for (const claim of claims) {
    const current = grouped.get(claim.claimType) || [];
    current.push(claim);
    grouped.set(claim.claimType, current);
  }
  return grouped;
}

function sortClaims(claims: ProductIntelligenceClaim[]): ProductIntelligenceClaim[] {
  return [...claims].sort(
    (left, right) =>
      right.confidence - left.confidence ||
      right.observedAt.localeCompare(left.observedAt) ||
      left.claimKey.localeCompare(right.claimKey),
  );
}

function collectStringValues(claims: ProductIntelligenceClaim[] | undefined): string[] {
  if (!claims) return [];

  return Array.from(
    new Set(claims.map((claim) => normalizedText(claim.claimValue)).filter((value) => Boolean(value))),
  ).sort((left, right) => left.localeCompare(right));
}

function getBestClaim(claims: ProductIntelligenceClaim[] | undefined): ProductIntelligenceClaim | null {
  if (!claims || claims.length === 0) return null;
  return sortClaims(claims)[0] || null;
}

function getPricingPlans(claims: ProductIntelligenceClaim[] | undefined): Array<{ name: string; priceText: string }> {
  if (!claims) return [];

  const plans = new Map<string, { name: string; priceText: string }>();
  for (const claim of claims) {
    const value = claim.claimValue as { name?: unknown; priceText?: unknown } | null;
    const name = normalizedText(value?.name);
    const priceText = normalizedText(value?.priceText);
    if (!name || !priceText) continue;
    const key = `${name.toLowerCase()}::${priceText.toLowerCase()}`;
    if (!plans.has(key)) {
      plans.set(key, { name, priceText });
    }
  }
  return Array.from(plans.values()).sort((left, right) => left.name.localeCompare(right.name));
}

function getLatestObservedAt(claims: ProductIntelligenceClaim[]): string | null {
  const latest = claims
    .map((claim) => claim.observedAt)
    .filter(Boolean)
    .sort((left, right) => right.localeCompare(left))[0];
  return latest || null;
}

function buildSnapshotHash(snapshot: unknown): string {
  return createHash('sha256').update(JSON.stringify(snapshot)).digest('hex');
}

function buildFacts(claims: ProductIntelligenceClaim[]): ProductIntelligenceFacts {
  const byType = buildClaimByType(claims);
  const productName = getBestClaim(byType.get('product_name'));
  const positioning = getBestClaim(byType.get('one_line_positioning'));
  const pricingModel = getBestClaim(byType.get('pricing_model'));
  const freeTrial = getBestClaim(byType.get('free_trial'));

  return {
    productName: productName ? normalizedText(productName.claimValue) || null : null,
    oneLinePositioning: positioning ? normalizedText(positioning.claimValue) || null : null,
    pricingModel: pricingModel ? normalizedText(pricingModel.claimValue) || null : null,
    pricingPlans: getPricingPlans(byType.get('pricing_plan')),
    freeTrial: freeTrial ? normalizedText(freeTrial.claimValue) || null : null,
    targetAudiences: collectStringValues(byType.get('target_audience')),
    useCases: collectStringValues(byType.get('use_case')),
    features: collectStringValues(byType.get('feature')),
    integrations: collectStringValues(byType.get('integration')),
    supportedPlatforms: collectStringValues(byType.get('supported_platform')),
    freeLimits: collectStringValues(byType.get('free_limit')),
    exportLimits: collectStringValues(byType.get('export_limit')),
    licenseLimits: collectStringValues(byType.get('license_limit')),
    securityClaims: collectStringValues(byType.get('security_claim')),
    officialSocials: collectStringValues(byType.get('official_social')),
    officialRepositories: collectStringValues(byType.get('official_repository')),
    changelogUpdates: collectStringValues(byType.get('changelog_update')),
    limitations: collectStringValues(byType.get('limitation')),
  };
}

export function buildProductIntelligenceSnapshot(input: {
  profile: ProductIntelligenceProfile;
  sources: ProductIntelligenceSource[];
  claims: ProductIntelligenceClaim[];
  assets: ProductIntelligenceAsset[];
}): ProductIntelligenceProfileSnapshot {
  const resolution = resolveProductIntelligenceConflicts({
    claims: input.claims,
    sources: input.sources,
  });
  const facts = buildFacts(resolution.claims);
  const summary = {
    sourceCount: input.sources.length,
    claimCount: resolution.claims.length,
    assetCount: input.assets.length,
    conflictCount: resolution.conflicts.length,
    verifiedClaimCount: resolution.claims.filter(isVerifiedIntelligenceClaim).length,
    candidateClaimCount: resolution.claims.filter(
      (claim) => !claim.verificationStatus || claim.verificationStatus === 'candidate',
    ).length,
    latestObservedAt: getLatestObservedAt(resolution.claims),
  };

  const normalizedSnapshot = {
    profile: {
      id: input.profile.id,
      ownerType: input.profile.ownerType,
      ownerId: input.profile.ownerId,
      canonicalDomain: input.profile.canonicalDomain,
      productName: input.profile.productName,
      status: input.profile.status,
      version: input.profile.version,
      lastCrawledAt: input.profile.lastCrawledAt,
      lastVerifiedAt: input.profile.lastVerifiedAt,
      nextReviewAt: input.profile.nextReviewAt,
      metadata: input.profile.metadata,
    },
    facts,
    conflicts: resolution.conflicts,
    sources: input.sources.map((source) => ({
      url: source.url,
      pageType: source.pageType,
      fetchStatus: source.fetchStatus,
      canonicalUrl: source.canonicalUrl,
      contentHash: source.contentHash,
      fetchedAt: source.fetchedAt,
    })),
    claims: resolution.claims.map((claim) => ({
      claimType: claim.claimType,
      claimKey: claim.claimKey,
      claimValue: claim.claimValue,
      sourceUrl: claim.sourceUrl,
      confidence: claim.confidence,
      conflictStatus: claim.conflictStatus,
      expiresAt: claim.expiresAt,
    })),
    assets: input.assets.map((asset) => ({
      assetType: asset.assetType,
      sourceUrl: asset.sourceUrl,
      storedUrl: asset.storedUrl,
      evidenceStatus: asset.evidenceStatus,
    })),
    summary,
  };

  return {
    profile: input.profile,
    facts,
    sources: input.sources,
    claims: resolution.claims,
    assets: input.assets,
    conflicts: resolution.conflicts,
    summary,
    snapshotHash: buildSnapshotHash(normalizedSnapshot),
  };
}
