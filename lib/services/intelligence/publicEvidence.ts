import { createAdminClient } from '@/lib/supabase/admin';

import { buildEvidenceLedger, type ProductEvidenceLedgerEntry } from './evidenceLedger';
import type { ProductIntelligenceClaim, ProductIntelligenceSource } from './types';

export interface PublicToolEvidenceLedger {
  profileId: string;
  entries: ProductEvidenceLedgerEntry[];
  summary: {
    verified: number;
    decisionReady: number;
    official: number;
    independent: number;
    reviewDue: number;
    conflicts: number;
    expiredOrInvalidated: number;
  };
}

function normalizeDate(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function mapSource(row: Record<string, unknown>): ProductIntelligenceSource {
  return {
    id: String(row.id),
    profileId: String(row.profile_id),
    url: String(row.url || ''),
    pageType: row.page_type as ProductIntelligenceSource['pageType'],
    httpStatus: row.http_status === null || row.http_status === undefined ? null : Number(row.http_status),
    canonicalUrl: typeof row.canonical_url === 'string' ? row.canonical_url : null,
    contentHash: typeof row.content_hash === 'string' ? row.content_hash : null,
    contentType: typeof row.content_type === 'string' ? row.content_type : null,
    fetchedAt: normalizeDate(row.fetched_at),
    fetchStatus: row.fetch_status as ProductIntelligenceSource['fetchStatus'],
    sourceType: (row.source_type as ProductIntelligenceSource['sourceType']) || 'official',
    sourceLabel: typeof row.source_label === 'string' ? row.source_label : null,
    publisherName: typeof row.publisher_name === 'string' ? row.publisher_name : null,
    lastVerifiedAt: normalizeDate(row.last_verified_at),
    metadata: (row.metadata as Record<string, unknown>) || {},
  };
}

function mapClaim(row: Record<string, unknown>): ProductIntelligenceClaim {
  return {
    id: String(row.id),
    profileId: String(row.profile_id),
    claimType: row.claim_type as ProductIntelligenceClaim['claimType'],
    claimKey: String(row.claim_key || ''),
    claimValue: row.claim_value,
    sourceId: typeof row.source_id === 'string' ? row.source_id : null,
    sourceUrl: String(row.source_url || ''),
    sourceExcerpt: typeof row.source_excerpt === 'string' ? row.source_excerpt : null,
    sourceType: (row.source_type as ProductIntelligenceClaim['sourceType']) || 'official',
    observedAt: normalizeDate(row.observed_at) || String(row.observed_at || ''),
    confidence: Number(row.confidence || 0),
    conflictStatus: row.conflict_status as ProductIntelligenceClaim['conflictStatus'],
    verificationStatus: (row.verification_status as ProductIntelligenceClaim['verificationStatus']) || 'candidate',
    verifiedAt: normalizeDate(row.verified_at),
    verificationNote: typeof row.verification_note === 'string' ? row.verification_note : null,
    reviewDueAt: normalizeDate(row.review_due_at),
    expiresAt: normalizeDate(row.expires_at),
    invalidatedAt: normalizeDate(row.invalidated_at),
    invalidationReason: typeof row.invalidation_reason === 'string' ? row.invalidation_reason : null,
    validityScope: (row.validity_scope as Record<string, unknown>) || {},
  };
}

export async function getPublicToolEvidenceLedger(toolId: string): Promise<PublicToolEvidenceLedger | null> {
  try {
    const supabase = createAdminClient();
    const { data: profile, error: profileError } = await supabase
      .from('product_intelligence_profiles')
      .select('id')
      .eq('owner_type', 'tool')
      .eq('owner_id', toolId)
      .maybeSingle();

    if (profileError || !profile?.id) return null;

    const profileId = String(profile.id);
    const [sourcesResult, claimsResult] = await Promise.all([
      supabase.from('product_intelligence_sources').select('*').eq('profile_id', profileId),
      supabase
        .from('product_intelligence_claims')
        .select('*')
        .eq('profile_id', profileId)
        .eq('verification_status', 'verified')
        .order('verified_at', { ascending: false, nullsFirst: false })
        .limit(24),
    ]);

    if (sourcesResult.error || claimsResult.error) return null;

    const sources = (sourcesResult.data || []).map((row) => mapSource(row as Record<string, unknown>));
    const claims = (claimsResult.data || []).map((row) => mapClaim(row as Record<string, unknown>));
    const entries = buildEvidenceLedger(claims, sources)
      .filter((entry) => /^https?:\/\//i.test(entry.sourceUrl))
      .sort((left, right) => {
        if (left.canSupportDecision !== right.canSupportDecision) return left.canSupportDecision ? -1 : 1;
        return (
          new Date(right.verifiedAt || right.observedAt).getTime() -
          new Date(left.verifiedAt || left.observedAt).getTime()
        );
      })
      .slice(0, 12);

    if (entries.length === 0) return null;

    return {
      profileId,
      entries,
      summary: {
        verified: entries.length,
        decisionReady: entries.filter((entry) => entry.canSupportDecision).length,
        official: entries.filter((entry) => entry.sourceType === 'official').length,
        independent: entries.filter((entry) => entry.sourceType === 'independent').length,
        reviewDue: entries.filter((entry) => entry.freshness === 'review_due').length,
        conflicts: entries.filter((entry) => entry.conflictStatus !== 'none').length,
        expiredOrInvalidated: entries.filter(
          (entry) => entry.freshness === 'expired' || entry.freshness === 'invalidated',
        ).length,
      },
    };
  } catch {
    // Evidence is additive; a supporting store outage must not take down the public tool page.
    return null;
  }
}
