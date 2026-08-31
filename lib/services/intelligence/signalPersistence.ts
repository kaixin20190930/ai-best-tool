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
      observedAt: String(claim.updated_at || claim.created_at || new Date().toISOString()),
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
      sourcePath: `/ai/${toolId}#comments`,
      observedAt: String(comment.updated_at || comment.created_at || new Date().toISOString()),
      metadata: { likes: Number(comment.likes || 0), userId: comment.user_id || null },
    });
  }

  return candidates;
}

export async function syncProductIntelligenceSignals() {
  const supabase = createAdminClient();
  const [profilesResult, claimsResult, commentsResult] = await Promise.all([
    supabase.from('product_intelligence_profiles').select('id,owner_id').eq('owner_type', 'tool'),
    supabase
      .from('tool_claims')
      .select('id,tool_id,listing_name,company,note,source_path,status,claim_reason,created_at,updated_at')
      .in('claim_reason', ['ownership_update', 'profile_correction'])
      .not('tool_id', 'is', null),
    supabase
      .from('comments')
      .select('id,tool_id,user_id,content,likes,is_hidden,created_at,updated_at')
      .eq('is_hidden', false),
  ]);

  if (profilesResult.error) throw new Error(profilesResult.error.message);
  if (claimsResult.error) throw new Error(claimsResult.error.message);
  if (commentsResult.error) throw new Error(commentsResult.error.message);

  const candidates = buildIntelligenceSignalCandidates({
    profiles: (profilesResult.data || []) as ProfileLink[],
    claims: (claimsResult.data || []) as Array<Record<string, unknown>>,
    comments: (commentsResult.data || []) as Array<Record<string, unknown>>,
  });

  if (candidates.length === 0) return { discovered: 0, queued: 0 };

  const { error } = await supabase.from('product_intelligence_signals').upsert(
    candidates.map((signal) => ({
      profile_id: signal.profileId,
      tool_id: signal.toolId,
      source_type: signal.sourceType,
      source_id: signal.sourceId,
      signal_type: signal.signalType,
      content: signal.content,
      source_path: signal.sourcePath,
      review_status: 'pending',
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

  return { discovered: candidates.length, queued: candidates.length };
}
