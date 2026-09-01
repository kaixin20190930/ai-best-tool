import { buildContentQualityResult } from './qualityConfig';
import type {
  ContentQualityDimension,
  ContentQualityResult,
  ProductIntelligenceAsset,
  ProductIntelligenceClaim,
  ProductIntelligenceProfile,
  ProductIntelligenceSource,
} from './types';
import isVerifiedIntelligenceClaim from './claimVerification';

export interface ContentQualityAssessment extends ContentQualityResult {
  recommendations: string[];
  signals: Record<ContentQualityDimension, string[]>;
}

function clampScore(value: number, maximum: number) {
  return Math.max(0, Math.min(maximum, Math.round(value)));
}

function hasClaim(claims: ProductIntelligenceClaim[], ...types: ProductIntelligenceClaim['claimType'][]) {
  return claims.some((claim) => types.includes(claim.claimType) && Boolean(claim.claimValue));
}

function daysSince(value: string | null) {
  if (!value) return Number.POSITIVE_INFINITY;
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return Number.POSITIVE_INFINITY;
  return Math.max(0, (Date.now() - timestamp) / (24 * 60 * 60 * 1000));
}

function scoreFreshness(latestFetch: string | null) {
  const age = daysSince(latestFetch);
  if (age <= 7) return 10;
  if (age <= 30) return 8;
  if (age <= 60) return 6;
  if (age <= 90) return 3;
  return 0;
}

export function assessContentQuality(input: {
  profile: ProductIntelligenceProfile;
  sources: ProductIntelligenceSource[];
  claims: ProductIntelligenceClaim[];
  assets: ProductIntelligenceAsset[];
}): ContentQualityAssessment {
  const successfulSources = input.sources.filter((source) => source.fetchStatus === 'success');
  const verifiedClaims = input.claims.filter(isVerifiedIntelligenceClaim);
  const conflictedClaims = input.claims.filter((claim) => claim.conflictStatus !== 'none');
  const claimsWithExcerpt = verifiedClaims.filter((claim) => Boolean(claim.sourceExcerpt));
  const sourceTypes = new Set(successfulSources.map((source) => source.pageType));
  const distinctClaimValues = new Set(
    verifiedClaims.map((claim) => JSON.stringify(claim.claimValue).toLowerCase()).filter(Boolean),
  );
  const latestFetch =
    successfulSources
      .map((source) => source.fetchedAt)
      .filter((value): value is string => Boolean(value))
      .sort((left, right) => right.localeCompare(left))[0] || null;

  const evidence = clampScore(
    Math.min(8, successfulSources.length * 2) +
      Math.min(8, verifiedClaims.length) +
      (verifiedClaims.length > 0 ? (claimsWithExcerpt.length / verifiedClaims.length) * 4 : 0),
    20,
  );

  const conflictPenalty = conflictedClaims.reduce(
    (total, claim) => total + (claim.conflictStatus === 'confirmed' ? 6 : 3),
    0,
  );
  const factualConsistency = clampScore(verifiedClaims.length > 0 ? 20 - conflictPenalty : 0, 20);

  const decisionValue = clampScore(
    (hasClaim(verifiedClaims, 'one_line_positioning') ? 3 : 0) +
      (hasClaim(verifiedClaims, 'pricing_model') ? 3 : 0) +
      (hasClaim(verifiedClaims, 'pricing_plan') ? 3 : 0) +
      (hasClaim(verifiedClaims, 'feature') ? 3 : 0) +
      (hasClaim(verifiedClaims, 'use_case') ? 2 : 0) +
      (hasClaim(verifiedClaims, 'target_audience') ? 2 : 0) +
      (hasClaim(verifiedClaims, 'limitation') ? 2 : 0) +
      (hasClaim(verifiedClaims, 'integration', 'supported_platform') ? 1 : 0) +
      (hasClaim(verifiedClaims, 'security_claim', 'free_limit', 'export_limit', 'license_limit') ? 1 : 0),
    20,
  );

  // QC-013 will replace this evidence-diversity proxy with a corpus-level duplicate-content check.
  const uniqueness = clampScore(
    Math.min(7, distinctClaimValues.size) + Math.min(5, sourceTypes.size) + (successfulSources.length >= 2 ? 3 : 0),
    15,
  );

  const searchAndCategoryFit = clampScore(
    (hasClaim(verifiedClaims, 'product_name') ? 3 : 0) +
      (hasClaim(verifiedClaims, 'one_line_positioning') ? 3 : 0) +
      (hasClaim(verifiedClaims, 'target_audience', 'use_case') ? 2 : 0) +
      (hasClaim(verifiedClaims, 'feature') ? 2 : 0),
    10,
  );

  const freshness = scoreFreshness(latestFetch);
  const usableAssets = input.assets.filter((asset) => !asset.isPlaceholder && asset.evidenceStatus !== 'rejected');
  const mediaIntegrity =
    (usableAssets.some((asset) => asset.assetType === 'logo') ? 3 : 0) +
    (usableAssets.some((asset) => asset.assetType === 'screenshot') ? 2 : 0);

  const blockers: string[] = [];
  if (successfulSources.length === 0) blockers.push('No successful official source');
  if (verifiedClaims.length === 0) blockers.push('No verified evidence claims');
  if (conflictedClaims.some((claim) => claim.conflictStatus === 'confirmed')) {
    blockers.push('Confirmed evidence conflict');
  }

  const result = buildContentQualityResult(
    {
      evidence,
      factualConsistency,
      decisionValue,
      uniqueness,
      searchAndCategoryFit,
      freshness,
      mediaIntegrity,
    },
    blockers,
  );

  const recommendations: string[] = [];
  if (!hasClaim(verifiedClaims, 'one_line_positioning'))
    recommendations.push('Add a sourced one-line positioning claim.');
  if (!hasClaim(verifiedClaims, 'use_case', 'target_audience')) {
    recommendations.push('Add sourced audience or use-case evidence.');
  }
  if (!hasClaim(verifiedClaims, 'limitation')) recommendations.push('Document at least one verified limitation.');
  if (!hasClaim(verifiedClaims, 'pricing_model', 'pricing_plan')) {
    recommendations.push('Verify pricing model or plan evidence.');
  }
  if (!usableAssets.some((asset) => asset.assetType === 'logo')) recommendations.push('Verify a non-placeholder logo.');
  if (!usableAssets.some((asset) => asset.assetType === 'screenshot')) {
    recommendations.push('Verify a current product screenshot.');
  }
  if (freshness < 8) recommendations.push('Refresh official sources before publishing.');
  if (uniqueness < 15)
    recommendations.push('Run the QC-013 corpus-level uniqueness check before publish-ready status.');

  return {
    ...result,
    recommendations,
    signals: {
      evidence: [`${successfulSources.length} successful sources`, `${verifiedClaims.length} verified claims`],
      factualConsistency: [`${conflictedClaims.length} conflict flags`],
      decisionValue: [`${sourceTypes.size} official page types represented`],
      uniqueness: [`${distinctClaimValues.size} distinct claim values`, 'Evidence-diversity proxy until QC-013'],
      searchAndCategoryFit: [
        hasClaim(verifiedClaims, 'one_line_positioning') ? 'Positioning present' : 'Positioning missing',
      ],
      freshness: [latestFetch ? `Latest fetch ${latestFetch}` : 'No successful fetch date'],
      mediaIntegrity: [`${usableAssets.length} usable assets`],
    },
  };
}
