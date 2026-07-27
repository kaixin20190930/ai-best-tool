import { createAdminClient } from '@/lib/supabase/admin';

import { buildProductIntelligenceSnapshot, type ProductIntelligenceProfileSnapshot } from './productProfile';
import type {
  ExtractedIntelligenceAsset,
  ExtractedIntelligenceClaim,
  IntelligenceFetchStatus,
  IntelligenceOwnerType,
  IntelligencePageType,
  ProductIntelligenceAsset,
  ProductIntelligenceClaim,
  ProductIntelligenceProfile,
  ProductIntelligenceSource,
} from './types';

export interface PersistedIntelligenceSourceInput {
  url: string;
  pageType: IntelligencePageType;
  fetchStatus?: IntelligenceFetchStatus;
  httpStatus?: number | null;
  canonicalUrl?: string | null;
  contentHash?: string | null;
  contentType?: string | null;
  fetchedAt?: string | null;
  metadata?: Record<string, unknown>;
  claims?: ExtractedIntelligenceClaim[];
  assets?: ExtractedIntelligenceAsset[];
}

export interface PersistProductIntelligenceInput {
  ownerType: IntelligenceOwnerType;
  ownerId: string;
  canonicalDomain: string;
  productName?: string;
  observedAt?: string;
  lastCrawledAt?: string | null;
  nextReviewAt?: string | null;
  profileMetadata?: Record<string, unknown>;
  sources: PersistedIntelligenceSourceInput[];
}

export interface PersistProductIntelligenceResult {
  snapshot: ProductIntelligenceProfileSnapshot;
  profileId: string;
  profileStatus: ProductIntelligenceProfile['status'];
  versionChanged: boolean;
  dryRun: boolean;
}

function normalizeText(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed || null;
}

function buildClaimMetadata(source: PersistedIntelligenceSourceInput, claim: ExtractedIntelligenceClaim) {
  return {
    pageType: source.pageType,
    sourceKind: 'official',
    observedAt: claim.observedAt,
  };
}

function buildAssetMetadata(source: PersistedIntelligenceSourceInput) {
  return {
    pageType: source.pageType,
    sourceKind: 'official',
    fetchedAt: source.fetchedAt || null,
  };
}

async function loadExistingProfile(
  supabase: ReturnType<typeof createAdminClient>,
  ownerType: IntelligenceOwnerType,
  ownerId: string,
) {
  const { data, error } = await supabase
    .from('product_intelligence_profiles')
    .select('*')
    .eq('owner_type', ownerType)
    .eq('owner_id', ownerId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as ProductIntelligenceProfile | null;
}

function inferProductName(input: PersistProductIntelligenceInput, sources: PersistedIntelligenceSourceInput[]): string {
  if (input.productName) {
    return input.productName.trim();
  }

  for (const source of sources) {
    const claim = source.claims?.find((entry) => entry.claimType === 'product_name');
    const value = normalizeText(typeof claim?.claimValue === 'string' ? claim.claimValue : null);
    if (value) {
      return value;
    }
  }

  return input.canonicalDomain;
}

function deriveNextReviewAt(
  snapshot: ProductIntelligenceProfileSnapshot,
  existing?: ProductIntelligenceProfile | null,
): string | null {
  if (snapshot.conflicts.length > 0) {
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  }

  if (existing?.nextReviewAt) {
    return existing.nextReviewAt;
  }

  if (snapshot.summary.claimCount === 0) {
    return new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
  }

  return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
}

function computeProfileStatus(snapshot: ProductIntelligenceProfileSnapshot): ProductIntelligenceProfile['status'] {
  if (snapshot.conflicts.length > 0) {
    return 'conflict';
  }

  if (snapshot.summary.claimCount === 0 || snapshot.summary.sourceCount === 0) {
    return 'pending';
  }

  return 'ready';
}

function computeMetadata(
  snapshot: ProductIntelligenceProfileSnapshot,
  existing?: ProductIntelligenceProfile | null,
  extra: Record<string, unknown> = {},
) {
  return {
    ...(existing?.metadata || {}),
    ...extra,
    snapshotHash: snapshot.snapshotHash,
    summary: snapshot.summary,
    facts: snapshot.facts,
    conflicts: snapshot.conflicts.slice(0, 50),
  };
}

export async function persistProductIntelligence(
  input: PersistProductIntelligenceInput,
): Promise<PersistProductIntelligenceResult> {
  const supabase = createAdminClient();
  const observedAt = input.observedAt || new Date().toISOString();
  const sourcesInput = input.sources.filter((source) => Boolean(source?.url));
  if (sourcesInput.length === 0) {
    throw new Error('At least one source is required to persist product intelligence.');
  }

  const existingProfile = await loadExistingProfile(supabase, input.ownerType, input.ownerId);
  const profileName = inferProductName(input, sourcesInput);

  let profileId = existingProfile?.id || '';
  if (!profileId) {
    const { data, error } = await supabase
      .from('product_intelligence_profiles')
      .insert({
        owner_type: input.ownerType,
        owner_id: input.ownerId,
        canonical_domain: input.canonicalDomain,
        product_name: profileName,
        profile_status: 'pending',
        profile_version: 1,
        last_crawled_at: input.lastCrawledAt || observedAt,
        last_verified_at: null,
        next_review_at: input.nextReviewAt || null,
        metadata: {},
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    profileId = String(data.id);
  }

  if (!profileId) {
    throw new Error('Unable to resolve product intelligence profile id.');
  }

  if (existingProfile) {
    const { error } = await supabase
      .from('product_intelligence_profiles')
      .update({
        canonical_domain: input.canonicalDomain,
        product_name: profileName,
        profile_status: existingProfile.status,
        profile_version: existingProfile.version,
        last_crawled_at: input.lastCrawledAt || observedAt,
        next_review_at: existingProfile.nextReviewAt,
      })
      .eq('id', profileId);

    if (error) {
      throw new Error(error.message);
    }
  }

  for (const source of sourcesInput) {
    const { error: sourceError } = await supabase.from('product_intelligence_sources').upsert(
      {
        profile_id: profileId,
        url: source.url,
        page_type: source.pageType,
        http_status: source.httpStatus ?? null,
        canonical_url: source.canonicalUrl ?? null,
        content_hash: source.contentHash ?? null,
        content_type: source.contentType ?? null,
        fetched_at: source.fetchedAt || observedAt,
        fetch_status: source.fetchStatus || 'success',
        metadata: source.metadata || {},
      },
      { onConflict: 'profile_id,url' },
    );

    if (sourceError) {
      throw new Error(sourceError.message);
    }

    const { error: deleteClaimsError } = await supabase
      .from('product_intelligence_claims')
      .delete()
      .eq('profile_id', profileId)
      .eq('source_url', source.url);

    if (deleteClaimsError) {
      throw new Error(deleteClaimsError.message);
    }

    const sourceClaims = source.claims || [];
    if (sourceClaims.length > 0) {
      const { error: insertClaimsError } = await supabase.from('product_intelligence_claims').insert(
        sourceClaims.map((claim) => ({
          profile_id: profileId,
          claim_type: claim.claimType,
          claim_key: claim.claimKey,
          claim_value: claim.claimValue,
          source_url: source.url,
          source_excerpt: claim.sourceExcerpt || null,
          observed_at: claim.observedAt || observedAt,
          confidence: claim.confidence,
          conflict_status: 'none',
          expires_at: claim.expiresAt || null,
          metadata: buildClaimMetadata(source, claim),
        })),
      );

      if (insertClaimsError) {
        throw new Error(insertClaimsError.message);
      }
    }

    const sourceAssets = source.assets || [];
    if (sourceAssets.length > 0) {
      const { error: insertAssetsError } = await supabase.from('product_intelligence_assets').upsert(
        sourceAssets.map((asset) => ({
          profile_id: profileId,
          asset_type: asset.assetType,
          source_url: asset.sourceUrl,
          stored_url: null,
          width: asset.width ?? null,
          height: asset.height ?? null,
          is_placeholder: asset.isPlaceholder,
          evidence_status: asset.evidenceStatus,
          metadata: buildAssetMetadata(source),
        })),
        { onConflict: 'profile_id,asset_type,source_url' },
      );

      if (insertAssetsError) {
        throw new Error(insertAssetsError.message);
      }
    }
  }

  const [
    { data: storedProfile, error: profileReadError },
    { data: storedSources, error: sourcesReadError },
    { data: storedClaims, error: claimsReadError },
    { data: storedAssets, error: assetsReadError },
  ] = await Promise.all([
    supabase.from('product_intelligence_profiles').select('*').eq('id', profileId).single(),
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

  if (profileReadError || sourcesReadError || claimsReadError || assetsReadError) {
    throw new Error(
      profileReadError?.message ||
        sourcesReadError?.message ||
        claimsReadError?.message ||
        assetsReadError?.message ||
        'Failed to reload product intelligence snapshot.',
    );
  }

  const snapshot = buildProductIntelligenceSnapshot({
    profile: storedProfile as ProductIntelligenceProfile,
    sources: (storedSources || []) as ProductIntelligenceSource[],
    claims: (storedClaims || []) as ProductIntelligenceClaim[],
    assets: (storedAssets || []) as ProductIntelligenceAsset[],
  });

  const metadata = computeMetadata(snapshot, existingProfile, input.profileMetadata || {});
  const nextReviewAt = input.nextReviewAt || deriveNextReviewAt(snapshot, existingProfile);
  const nextStatus = computeProfileStatus(snapshot);
  const versionChanged = !existingProfile || existingProfile.metadata?.snapshotHash !== snapshot.snapshotHash;

  const { error: updateError } = await supabase
    .from('product_intelligence_profiles')
    .update({
      owner_type: input.ownerType,
      owner_id: input.ownerId,
      canonical_domain: input.canonicalDomain,
      product_name: snapshot.facts.productName || profileName,
      profile_status: nextStatus,
      profile_version: versionChanged ? (existingProfile?.version || 1) + 1 : existingProfile?.version || 1,
      last_crawled_at: input.lastCrawledAt || observedAt,
      last_verified_at: nextStatus === 'ready' ? observedAt : existingProfile?.lastVerifiedAt || null,
      next_review_at: nextReviewAt,
      metadata,
    })
    .eq('id', profileId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  const finalSnapshot = buildProductIntelligenceSnapshot({
    profile: {
      ...(storedProfile as ProductIntelligenceProfile),
      ownerType: input.ownerType,
      ownerId: input.ownerId,
      canonicalDomain: input.canonicalDomain,
      productName: snapshot.facts.productName || profileName,
      status: nextStatus,
      version: versionChanged ? (existingProfile?.version || 1) + 1 : existingProfile?.version || 1,
      lastCrawledAt: input.lastCrawledAt || observedAt,
      lastVerifiedAt: nextStatus === 'ready' ? observedAt : existingProfile?.lastVerifiedAt || null,
      nextReviewAt,
      metadata,
    },
    sources: snapshot.sources,
    claims: snapshot.claims,
    assets: snapshot.assets,
  });

  return {
    snapshot: finalSnapshot,
    profileId,
    profileStatus: nextStatus,
    versionChanged,
    dryRun: false,
  };
}

export async function previewProductIntelligence(
  input: PersistProductIntelligenceInput,
): Promise<PersistProductIntelligenceResult> {
  const observedAt = input.observedAt || new Date().toISOString();
  const profile: ProductIntelligenceProfile = {
    id: 'preview',
    ownerType: input.ownerType,
    ownerId: input.ownerId,
    canonicalDomain: input.canonicalDomain,
    productName: input.productName?.trim() || input.canonicalDomain,
    status: 'pending',
    version: 1,
    lastCrawledAt: input.lastCrawledAt || observedAt,
    lastVerifiedAt: null,
    nextReviewAt: input.nextReviewAt || null,
    metadata: input.profileMetadata || {},
  };

  const sources: ProductIntelligenceSource[] = input.sources.map((source) => ({
    id: '',
    profileId: 'preview',
    url: source.url,
    pageType: source.pageType,
    httpStatus: source.httpStatus ?? null,
    canonicalUrl: source.canonicalUrl ?? null,
    contentHash: source.contentHash ?? null,
    contentType: source.contentType ?? null,
    fetchedAt: source.fetchedAt || observedAt,
    fetchStatus: source.fetchStatus || 'success',
    metadata: source.metadata || {},
  }));

  const claims: ProductIntelligenceClaim[] = input.sources.flatMap((source) =>
    (source.claims || []).map((claim) => ({
      id: '',
      profileId: 'preview',
      claimType: claim.claimType,
      claimKey: claim.claimKey,
      claimValue: claim.claimValue,
      sourceUrl: source.url,
      sourceExcerpt: claim.sourceExcerpt || null,
      observedAt: claim.observedAt || observedAt,
      confidence: claim.confidence,
      conflictStatus: 'none',
      expiresAt: claim.expiresAt || null,
    })),
  );

  const assets: ProductIntelligenceAsset[] = input.sources.flatMap((source) =>
    (source.assets || []).map((asset) => ({
      id: '',
      profileId: 'preview',
      assetType: asset.assetType,
      sourceUrl: asset.sourceUrl,
      storedUrl: null,
      width: asset.width ?? null,
      height: asset.height ?? null,
      isPlaceholder: asset.isPlaceholder,
      evidenceStatus: asset.evidenceStatus,
    })),
  );

  const snapshot = buildProductIntelligenceSnapshot({
    profile,
    sources,
    claims,
    assets,
  });
  const profileStatus: ProductIntelligenceProfile['status'] =
    snapshot.conflicts.length > 0
      ? 'conflict'
      : snapshot.summary.claimCount > 0 && sources.some((source) => source.fetchStatus === 'success')
        ? 'ready'
        : 'pending';

  return {
    snapshot,
    profileId: 'preview',
    profileStatus,
    versionChanged: true,
    dryRun: true,
  };
}
