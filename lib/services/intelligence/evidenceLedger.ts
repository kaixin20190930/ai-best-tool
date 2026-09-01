import type {
  IntelligenceConflictStatus,
  IntelligenceSourceType,
  IntelligenceVerificationStatus,
  ProductIntelligenceClaim,
  ProductIntelligenceSource,
} from './types';

export type EvidenceFreshness = 'fresh' | 'review_due' | 'expired' | 'invalidated';

export interface ProductEvidenceLedgerEntry {
  claimId: string;
  profileId: string;
  claimType: ProductIntelligenceClaim['claimType'];
  claimKey: string;
  claimValue: unknown;
  sourceId: string | null;
  sourceUrl: string;
  sourceLabel: string | null;
  publisherName: string | null;
  sourceType: IntelligenceSourceType;
  sourceExcerpt: string | null;
  observedAt: string;
  verifiedAt: string | null;
  verificationStatus: IntelligenceVerificationStatus;
  verificationNote: string | null;
  confidence: number;
  conflictStatus: IntelligenceConflictStatus;
  reviewDueAt: string | null;
  expiresAt: string | null;
  invalidatedAt: string | null;
  invalidationReason: string | null;
  validityScope: Record<string, unknown>;
  freshness: EvidenceFreshness;
  canSupportDecision: boolean;
}

function normalizeDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function inferSourceType(
  claim: ProductIntelligenceClaim,
  source?: ProductIntelligenceSource | null,
): IntelligenceSourceType {
  if (claim.sourceType) return claim.sourceType;
  if (source?.sourceType) return source.sourceType;

  const metadataType = source?.metadata?.sourceKind;
  if (
    metadataType === 'independent' ||
    metadataType === 'owner' ||
    metadataType === 'user' ||
    metadataType === 'editorial'
  ) {
    return metadataType;
  }

  return 'official';
}

export function resolveEvidenceFreshness(
  input: Pick<ProductIntelligenceClaim, 'expiresAt' | 'reviewDueAt' | 'invalidatedAt'>,
  now: Date = new Date(),
): EvidenceFreshness {
  if (normalizeDate(input.invalidatedAt)) return 'invalidated';

  const expiresAt = normalizeDate(input.expiresAt);
  if (expiresAt && new Date(expiresAt).getTime() <= now.getTime()) return 'expired';

  const reviewDueAt = normalizeDate(input.reviewDueAt);
  if (reviewDueAt && new Date(reviewDueAt).getTime() <= now.getTime()) return 'review_due';

  return 'fresh';
}

export function buildEvidenceLedgerEntry(
  claim: ProductIntelligenceClaim,
  source?: ProductIntelligenceSource | null,
  now: Date = new Date(),
): ProductEvidenceLedgerEntry {
  const verificationStatus = claim.verificationStatus || 'candidate';
  const freshness = resolveEvidenceFreshness(claim, now);
  const sourceUrl = source?.url || claim.sourceUrl;

  return {
    claimId: claim.id,
    profileId: claim.profileId,
    claimType: claim.claimType,
    claimKey: claim.claimKey,
    claimValue: claim.claimValue,
    sourceId: claim.sourceId || source?.id || null,
    sourceUrl,
    sourceLabel: source?.sourceLabel || null,
    publisherName: source?.publisherName || null,
    sourceType: inferSourceType(claim, source),
    sourceExcerpt: claim.sourceExcerpt,
    observedAt: normalizeDate(claim.observedAt) || claim.observedAt,
    verifiedAt: normalizeDate(claim.verifiedAt),
    verificationStatus,
    verificationNote: claim.verificationNote || null,
    confidence: claim.confidence,
    conflictStatus: claim.conflictStatus,
    reviewDueAt: normalizeDate(claim.reviewDueAt),
    expiresAt: normalizeDate(claim.expiresAt),
    invalidatedAt: normalizeDate(claim.invalidatedAt),
    invalidationReason: claim.invalidationReason || null,
    validityScope: claim.validityScope || {},
    freshness,
    canSupportDecision:
      verificationStatus === 'verified' &&
      claim.conflictStatus === 'none' &&
      freshness !== 'expired' &&
      freshness !== 'invalidated',
  };
}

export function buildEvidenceLedger(
  claims: ProductIntelligenceClaim[],
  sources: ProductIntelligenceSource[],
  now: Date = new Date(),
): ProductEvidenceLedgerEntry[] {
  const sourcesById = new Map(sources.map((source) => [source.id, source]));
  const sourcesByUrl = new Map(sources.map((source) => [source.url, source]));

  return claims.map((claim) =>
    buildEvidenceLedgerEntry(
      claim,
      (claim.sourceId ? sourcesById.get(claim.sourceId) : undefined) || sourcesByUrl.get(claim.sourceUrl),
      now,
    ),
  );
}
