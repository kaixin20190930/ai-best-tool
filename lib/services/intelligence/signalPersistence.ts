import { query } from '@/db/neon/client';

import { createAdminClient } from '@/lib/supabase/admin';

export interface IntelligenceSignalCandidate {
  profileId: string;
  toolId: string;
  sourceType: 'owner_claim' | 'profile_correction' | 'comment';
  sourceId: string;
  signalType: 'owner_update' | 'correction' | 'user_experience';
  content: string;
  sourcePath: string | null;
  observedAt: string;
  metadata: Record<string, unknown>;
}

type ProfileLink = { id: string; owner_id: string };
type SourceRows = { available: boolean; error: string | null; rows: Array<Record<string, unknown>> };

function toIsoString(value: unknown): string {
  if (value instanceof Date && Number.isFinite(value.getTime())) return value.toISOString();
  if (typeof value === 'string' || typeof value === 'number') {
    const timestamp = new Date(value).getTime();
    if (Number.isFinite(timestamp)) return new Date(timestamp).toISOString();
  }
  return new Date().toISOString();
}

async function loadOptionalSourceRows(sql: string, params?: unknown[]): Promise<SourceRows> {
  try {
    const result = await query(sql, params);
    return { available: true, error: null, rows: result.rows as Array<Record<string, unknown>> };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/relation .* does not exist|column .* does not exist/i.test(message)) {
      return { available: false, error: message, rows: [] };
    }
    throw error;
  }
}

export function buildIntelligenceSignalCandidates(input: {
  profiles: ProfileLink[];
  claims: Array<Record<string, unknown>>;
  comments: Array<Record<string, unknown>>;
}): IntelligenceSignalCandidate[] {
  const profileByTool = new Map(input.profiles.map((profile) => [String(profile.owner_id), String(profile.id)]));
  const candidates: IntelligenceSignalCandidate[] = [];

  for (const claim of input.claims) {
    const toolId = String(claim.tool_id || '');
    const profileId = profileByTool.get(toolId);
    const sourceId = String(claim.id || '');
    const reason = String(claim.claim_reason || '');
    const content = String(claim.note || claim.listing_name || '').trim();
    if (!profileId || !sourceId || !content || !['ownership_update', 'profile_correction'].includes(reason)) continue;

    candidates.push({
      profileId,
      toolId,
      sourceType: reason === 'profile_correction' ? 'profile_correction' : 'owner_claim',
      sourceId,
      signalType: reason === 'profile_correction' ? 'correction' : 'owner_update',
      content,
      sourcePath: typeof claim.source_path === 'string' ? claim.source_path : null,
      observedAt: toIsoString(claim.updated_at || claim.created_at),
      metadata: { claimStatus: claim.status || null, company: claim.company || null },
    });
  }

  for (const comment of input.comments) {
    const toolId = String(comment.tool_id || '');
    const profileId = profileByTool.get(toolId);
    const sourceId = String(comment.id || '');
    const content = String(comment.content || '').trim();
    if (!profileId || !sourceId || content.length < 20 || Boolean(comment.is_hidden)) continue;

    candidates.push({
      profileId,
      toolId,
      sourceType: 'comment',
      sourceId,
      signalType: 'user_experience',
      content,
      sourcePath: `/ai/${String(comment.tool_name || toolId)}#comments`,
      observedAt: toIsoString(comment.updated_at || comment.created_at),
      metadata: { likes: Number(comment.likes || 0), userId: comment.user_id || null },
    });
  }

  return candidates;
}

export async function syncProductIntelligenceSignals() {
  const supabase = createAdminClient();
  const [profilesResult, claimsResult, commentsResult] = await Promise.all([
    supabase.from('product_intelligence_profiles').select('id,owner_id').eq('owner_type', 'tool'),
    loadOptionalSourceRows(
      `SELECT id, tool_id, listing_name, company, note, source_path, status,
              claim_reason, created_at, updated_at
       FROM tool_claims
       WHERE claim_reason = ANY($1::text[])
         AND tool_id IS NOT NULL`,
      [['ownership_update', 'profile_correction']],
    ),
    loadOptionalSourceRows(
      `SELECT c.id, c.tool_id, c.user_id, c.content, c.likes,
              COALESCE(c.is_hidden, false) AS is_hidden,
              c.created_at, c.updated_at, t.name AS tool_name
       FROM comments c
       LEFT JOIN tools t ON t.id = c.tool_id
       WHERE COALESCE(c.is_hidden, false) = false`,
    ),
  ]);

  if (profilesResult.error) throw new Error(profilesResult.error.message);

  const candidates = buildIntelligenceSignalCandidates({
    profiles: (profilesResult.data || []) as ProfileLink[],
    claims: claimsResult.rows,
    comments: commentsResult.rows,
  });

  if (candidates.length > 0) {
    const { error } = await supabase.from('product_intelligence_signals').upsert(
      candidates.map((signal) => ({
        profile_id: signal.profileId,
        tool_id: signal.toolId,
        source_type: signal.sourceType,
        source_id: signal.sourceId,
        signal_type: signal.signalType,
        content: signal.content,
        source_path: signal.sourcePath,
        observed_at: signal.observedAt,
        metadata: signal.metadata,
        updated_at: new Date().toISOString(),
      })),
      { onConflict: 'source_type,source_id' },
    );

    if (error) {
      throw new Error(
        error.message.includes('product_intelligence_signals')
          ? `Intelligence signal migration is required before sync: ${error.message}`
          : error.message,
      );
    }
  }

  const { count, error: countError } = await supabase
    .from('product_intelligence_signals')
    .select('id', { count: 'exact', head: true });
  if (countError) throw new Error(countError.message);

  return {
    discovered: candidates.length,
    synced: candidates.length,
    stored: count || 0,
    sources: {
      ownerClaims: { available: claimsResult.available, error: claimsResult.error },
      comments: { available: commentsResult.available, error: commentsResult.error },
    },
  };
}
