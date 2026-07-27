import { requireAdmin } from '@/lib/auth/middleware';
import type {
  IntelligenceProfileStatus,
  ProductIntelligenceAsset,
  ProductIntelligenceClaim,
  ProductIntelligenceProfile,
  ProductIntelligenceSource,
} from '@/lib/services/intelligence/types';
import { createAdminClient } from '@/lib/supabase/admin';

type IntelligenceOwnerFilter = ProductIntelligenceProfile['ownerType'] | 'all';

export interface AdminIntelligenceProfileItem {
  id: string;
  ownerType: ProductIntelligenceProfile['ownerType'];
  ownerId: string;
  canonicalDomain: string;
  productName: string;
  status: IntelligenceProfileStatus;
  version: number;
  lastCrawledAt: string | null;
  lastVerifiedAt: string | null;
  nextReviewAt: string | null;
  sourceCount: number;
  claimCount: number;
  assetCount: number;
  conflictCount: number;
  verifiedClaimCount: number;
  updatedAt: string;
}

export interface AdminIntelligenceProfileDetail extends AdminIntelligenceProfileItem {
  metadata: Record<string, unknown>;
  sources: ProductIntelligenceSource[];
  claims: ProductIntelligenceClaim[];
  assets: ProductIntelligenceAsset[];
}

export interface AdminIntelligenceOverview {
  totals: {
    profiles: number;
    ready: number;
    pending: number;
    conflict: number;
    stale: number;
    verifiedClaims: number;
    conflicts: number;
  };
  profiles: AdminIntelligenceProfileItem[];
  selectedProfile: AdminIntelligenceProfileDetail | null;
}

function normalizeDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function mapProfileRow(
  row: Record<string, unknown>,
  counts: {
    sourceCount: number;
    claimCount: number;
    assetCount: number;
    conflictCount: number;
    verifiedClaimCount: number;
  },
): AdminIntelligenceProfileItem {
  return {
    id: String(row.id),
    ownerType: row.owner_type as ProductIntelligenceProfile['ownerType'],
    ownerId: String(row.owner_id),
    canonicalDomain: String(row.canonical_domain || ''),
    productName: String(row.product_name || ''),
    status: row.profile_status as IntelligenceProfileStatus,
    version: Number(row.profile_version || 1),
    lastCrawledAt: normalizeDate(row.last_crawled_at as string | null | undefined),
    lastVerifiedAt: normalizeDate(row.last_verified_at as string | null | undefined),
    nextReviewAt: normalizeDate(row.next_review_at as string | null | undefined),
    sourceCount: counts.sourceCount,
    claimCount: counts.claimCount,
    assetCount: counts.assetCount,
    conflictCount: counts.conflictCount,
    verifiedClaimCount: counts.verifiedClaimCount,
    updatedAt: normalizeDate(row.updated_at as string | null | undefined) || String(row.updated_at || ''),
  };
}

function mapSourceRow(row: Record<string, unknown>): ProductIntelligenceSource {
  return {
    id: String(row.id),
    profileId: String(row.profile_id),
    url: String(row.url),
    pageType: row.page_type as ProductIntelligenceSource['pageType'],
    httpStatus: row.http_status === null || row.http_status === undefined ? null : Number(row.http_status),
    canonicalUrl: (row.canonical_url as string | null | undefined) || null,
    contentHash: (row.content_hash as string | null | undefined) || null,
    contentType: (row.content_type as string | null | undefined) || null,
    fetchedAt: normalizeDate(row.fetched_at as string | null | undefined),
    fetchStatus: row.fetch_status as ProductIntelligenceSource['fetchStatus'],
    metadata: (row.metadata as Record<string, unknown>) || {},
  };
}

function mapClaimRow(row: Record<string, unknown>): ProductIntelligenceClaim {
  return {
    id: String(row.id),
    profileId: String(row.profile_id),
    claimType: row.claim_type as ProductIntelligenceClaim['claimType'],
    claimKey: String(row.claim_key),
    claimValue: row.claim_value,
    sourceUrl: String(row.source_url),
    sourceExcerpt: (row.source_excerpt as string | null | undefined) || null,
    observedAt: normalizeDate(row.observed_at as string | null | undefined) || new Date().toISOString(),
    confidence: Number(row.confidence || 0),
    conflictStatus: row.conflict_status as ProductIntelligenceClaim['conflictStatus'],
    expiresAt: normalizeDate(row.expires_at as string | null | undefined),
  };
}

function mapAssetRow(row: Record<string, unknown>): ProductIntelligenceAsset {
  return {
    id: String(row.id),
    profileId: String(row.profile_id),
    assetType: row.asset_type as ProductIntelligenceAsset['assetType'],
    sourceUrl: String(row.source_url),
    storedUrl: (row.stored_url as string | null | undefined) || null,
    width: row.width === null || row.width === undefined ? null : Number(row.width),
    height: row.height === null || row.height === undefined ? null : Number(row.height),
    isPlaceholder: Boolean(row.is_placeholder),
    evidenceStatus: row.evidence_status as ProductIntelligenceAsset['evidenceStatus'],
  };
}

async function loadProfileDetail(profileId: string, supabase: ReturnType<typeof createAdminClient>) {
  const [
    { data: profile, error: profileError },
    { data: sources, error: sourcesError },
    { data: claims, error: claimsError },
    { data: assets, error: assetsError },
  ] = await Promise.all([
    supabase.from('product_intelligence_profiles').select('*').eq('id', profileId).maybeSingle(),
    supabase
      .from('product_intelligence_sources')
      .select('*')
      .eq('profile_id', profileId)
      .order('fetched_at', { ascending: false }),
    supabase
      .from('product_intelligence_claims')
      .select('*')
      .eq('profile_id', profileId)
      .order('observed_at', { ascending: false }),
    supabase
      .from('product_intelligence_assets')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false }),
  ]);

  if (profileError) throw new Error(profileError.message);
  if (sourcesError) throw new Error(sourcesError.message);
  if (claimsError) throw new Error(claimsError.message);
  if (assetsError) throw new Error(assetsError.message);
  if (!profile) return null;

  const mappedSources = (sources || []).map((row) => mapSourceRow(row as Record<string, unknown>));
  const mappedClaims = (claims || []).map((row) => mapClaimRow(row as Record<string, unknown>));
  const mappedAssets = (assets || []).map((row) => mapAssetRow(row as Record<string, unknown>));
  const baseItem = mapProfileRow(profile as Record<string, unknown>, {
    sourceCount: mappedSources.length,
    claimCount: mappedClaims.length,
    assetCount: mappedAssets.length,
    conflictCount: mappedClaims.filter((claim) => claim.conflictStatus !== 'none').length,
    verifiedClaimCount: mappedClaims.filter((claim) => claim.conflictStatus === 'none').length,
  });

  return {
    ...baseItem,
    metadata: ((profile as Record<string, unknown>).metadata as Record<string, unknown>) || {},
    sources: mappedSources,
    claims: mappedClaims,
    assets: mappedAssets,
  };
}

export async function getAdminIntelligenceOverview(input?: {
  ownerType?: IntelligenceOwnerFilter;
  status?: IntelligenceProfileStatus | 'all';
  profileId?: string;
  limit?: number;
}): Promise<AdminIntelligenceOverview> {
  await requireAdmin();
  const supabase = createAdminClient();
  const limit = Math.max(1, Math.min(input?.limit || 25, 100));

  let query = supabase
    .from('product_intelligence_profiles')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (input?.ownerType && input.ownerType !== 'all') {
    query = query.eq('owner_type', input.ownerType);
  }
  if (input?.status && input.status !== 'all') {
    query = query.eq('profile_status', input.status);
  }

  const { data: profileRows, error: profileError } = await query;
  if (profileError) {
    throw new Error(profileError.message);
  }

  const profileIds = (profileRows || []).map((row) => String(row.id));
  const [sourcesResult, claimsResult, assetsResult] = await Promise.all([
    profileIds.length > 0
      ? supabase.from('product_intelligence_sources').select('profile_id').in('profile_id', profileIds)
      : Promise.resolve({ data: [] as Array<{ profile_id: string }>, error: null as null }),
    profileIds.length > 0
      ? supabase.from('product_intelligence_claims').select('profile_id, conflict_status').in('profile_id', profileIds)
      : Promise.resolve({ data: [] as Array<{ profile_id: string; conflict_status: string }>, error: null as null }),
    profileIds.length > 0
      ? supabase.from('product_intelligence_assets').select('profile_id').in('profile_id', profileIds)
      : Promise.resolve({ data: [] as Array<{ profile_id: string }>, error: null as null }),
  ]);

  if (sourcesResult.error) throw new Error(sourcesResult.error.message);
  if (claimsResult.error) throw new Error(claimsResult.error.message);
  if (assetsResult.error) throw new Error(assetsResult.error.message);

  const sourceCountByProfile = new Map<string, number>();
  for (const row of sourcesResult.data || []) {
    sourceCountByProfile.set(row.profile_id, (sourceCountByProfile.get(row.profile_id) || 0) + 1);
  }

  const assetCountByProfile = new Map<string, number>();
  for (const row of assetsResult.data || []) {
    assetCountByProfile.set(row.profile_id, (assetCountByProfile.get(row.profile_id) || 0) + 1);
  }

  const claimCountByProfile = new Map<string, number>();
  const conflictCountByProfile = new Map<string, number>();
  const verifiedCountByProfile = new Map<string, number>();
  for (const row of claimsResult.data || []) {
    claimCountByProfile.set(row.profile_id, (claimCountByProfile.get(row.profile_id) || 0) + 1);
    if (row.conflict_status && row.conflict_status !== 'none') {
      conflictCountByProfile.set(row.profile_id, (conflictCountByProfile.get(row.profile_id) || 0) + 1);
    } else {
      verifiedCountByProfile.set(row.profile_id, (verifiedCountByProfile.get(row.profile_id) || 0) + 1);
    }
  }

  const profiles = (profileRows || []).map((row) =>
    mapProfileRow(row as Record<string, unknown>, {
      sourceCount: sourceCountByProfile.get(String(row.id)) || 0,
      claimCount: claimCountByProfile.get(String(row.id)) || 0,
      assetCount: assetCountByProfile.get(String(row.id)) || 0,
      conflictCount: conflictCountByProfile.get(String(row.id)) || 0,
      verifiedClaimCount: verifiedCountByProfile.get(String(row.id)) || 0,
    }),
  );

  const totals = profiles.reduce(
    (acc, profile) => {
      acc.profiles += 1;
      acc.ready += profile.status === 'ready' ? 1 : 0;
      acc.pending += profile.status === 'pending' ? 1 : 0;
      acc.conflict += profile.status === 'conflict' ? 1 : 0;
      acc.stale += profile.status === 'stale' ? 1 : 0;
      acc.verifiedClaims += profile.verifiedClaimCount;
      acc.conflicts += profile.conflictCount;
      return acc;
    },
    { profiles: 0, ready: 0, pending: 0, conflict: 0, stale: 0, verifiedClaims: 0, conflicts: 0 },
  );

  const selectedId = input?.profileId || profiles[0]?.id || null;
  const selectedProfile = selectedId ? await loadProfileDetail(selectedId, supabase) : null;

  return {
    totals,
    profiles,
    selectedProfile,
  };
}
