import type {
  IntelligenceClaimType,
  IntelligenceConflictStatus,
  IntelligencePageType,
  IntelligenceProfileStatus,
  ProductIntelligenceClaim,
  ProductIntelligenceSource,
} from './types';

const trustedOfficialPageTypes = new Set<IntelligencePageType>([
  'homepage',
  'pricing',
  'features',
  'product',
  'use_case',
  'documentation',
  'changelog',
  'about',
  'security',
  'help',
]);

type ConflictingClaimType =
  | 'product_name'
  | 'one_line_positioning'
  | 'pricing_model'
  | 'free_trial'
  | 'official_repository';

interface ConflictEntry {
  claimType: IntelligenceClaimType;
  claimKey: string;
  severity: Exclude<IntelligenceConflictStatus, 'none'>;
  reason: string;
  sourceUrls: string[];
  values: unknown[];
}

export interface ResolvedClaim extends ProductIntelligenceClaim {
  conflictStatus: IntelligenceConflictStatus;
}

export interface ConflictResolutionResult {
  claims: ResolvedClaim[];
  conflicts: ConflictEntry[];
  profileStatus: IntelligenceProfileStatus;
}

function normalizedText(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim().replace(/\s+/g, ' ').toLowerCase();
  }

  if (value === null || value === undefined) {
    return '';
  }

  return JSON.stringify(value);
}

function getSourcePageType(sourceUrl: string, sources: ProductIntelligenceSource[]): IntelligencePageType | null {
  const source = sources.find((entry) => entry.url === sourceUrl);
  return source?.pageType || null;
}

function getConflictSeverity(
  sourceUrls: string[],
  sources: ProductIntelligenceSource[],
): Exclude<IntelligenceConflictStatus, 'none'> {
  const pageTypes = sourceUrls
    .map((sourceUrl) => getSourcePageType(sourceUrl, sources))
    .filter((value): value is IntelligencePageType => Boolean(value));

  const allTrusted = pageTypes.length > 0 && pageTypes.every((pageType) => trustedOfficialPageTypes.has(pageType));
  return allTrusted ? 'confirmed' : 'possible';
}

function resolveSingularClaimConflicts(
  claimType: ConflictingClaimType,
  claims: ProductIntelligenceClaim[],
  sources: ProductIntelligenceSource[],
): ConflictEntry[] {
  const groups = new Map<string, ProductIntelligenceClaim[]>();

  for (const claim of claims) {
    const valueKey = normalizedText(claim.claimValue);
    const current = groups.get(valueKey) || [];
    current.push(claim);
    groups.set(valueKey, current);
  }

  if (groups.size <= 1) {
    return [];
  }

  const sourceUrls: string[] = Array.from(new Set<string>(claims.map((claim) => claim.sourceUrl)));
  const severity = getConflictSeverity(sourceUrls, sources);
  return claims.map((claim) => ({
    claimType,
    claimKey: claim.claimKey,
    severity,
    reason: `${claimType} differs across official sources`,
    sourceUrls,
    values: Array.from(groups.keys()),
  }));
}

function resolvePricingPlanConflicts(
  claims: ProductIntelligenceClaim[],
  sources: ProductIntelligenceSource[],
): ConflictEntry[] {
  const claimsByPlanName = new Map<string, ProductIntelligenceClaim[]>();

  for (const claim of claims) {
    const value = claim.claimValue as { name?: unknown; priceText?: unknown } | null;
    const planName = normalizedText(value?.name);
    if (!planName) {
      continue;
    }

    const current = claimsByPlanName.get(planName) || [];
    current.push(claim);
    claimsByPlanName.set(planName, current);
  }

  const conflicts: ConflictEntry[] = [];
  for (const [planName, planClaims] of Array.from(claimsByPlanName.entries())) {
    const uniquePrices: Set<string> = new Set<string>(
      planClaims.map((claim) => normalizedText((claim.claimValue as { priceText?: unknown } | null)?.priceText)),
    );
    uniquePrices.delete('');

    if (uniquePrices.size <= 1) {
      continue;
    }

    const sourceUrls: string[] = Array.from(new Set<string>(planClaims.map((claim) => claim.sourceUrl)));
    const severity = getConflictSeverity(sourceUrls, sources);
    for (const claim of planClaims) {
      conflicts.push({
        claimType: 'pricing_plan',
        claimKey: claim.claimKey,
        severity,
        reason: `pricing plan "${planName}" has multiple price values`,
        sourceUrls,
        values: planClaims.map((entry) => entry.claimValue),
      });
    }
  }

  return conflicts;
}

export function resolveProductIntelligenceConflicts(input: {
  claims: ProductIntelligenceClaim[];
  sources: ProductIntelligenceSource[];
}): ConflictResolutionResult {
  const conflicts: ConflictEntry[] = [];
  const claimsByType = new Map<IntelligenceClaimType, ProductIntelligenceClaim[]>();

  for (const claim of input.claims) {
    const current = claimsByType.get(claim.claimType) || [];
    current.push(claim);
    claimsByType.set(claim.claimType, current);
  }

  for (const claimType of [
    'product_name',
    'one_line_positioning',
    'pricing_model',
    'free_trial',
    'official_repository',
  ] as const) {
    const typedClaims = claimsByType.get(claimType) || [];
    conflicts.push(...resolveSingularClaimConflicts(claimType, typedClaims, input.sources));
  }

  conflicts.push(...resolvePricingPlanConflicts(claimsByType.get('pricing_plan') || [], input.sources));

  const conflictingClaimKeys = new Set(conflicts.map((conflict) => conflict.claimKey));
  const resolvedClaims: ResolvedClaim[] = input.claims.map((claim) => ({
    ...claim,
    conflictStatus: conflictingClaimKeys.has(claim.claimKey)
      ? ((conflicts.find((entry) => entry.claimKey === claim.claimKey)?.severity ||
          'possible') as IntelligenceConflictStatus)
      : 'none',
  }));

  return {
    claims: resolvedClaims,
    conflicts,
    profileStatus: conflicts.length > 0 ? 'conflict' : 'ready',
  };
}
