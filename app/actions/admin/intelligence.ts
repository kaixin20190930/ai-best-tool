'use server';

import { revalidatePath } from 'next/cache';

import { requireAdmin } from '@/lib/auth/middleware';
import { prepareTimelineEventInsert } from '@/lib/services/intelligence/changeTimeline';
import { prepareEvidenceReviewUpdate } from '@/lib/services/intelligence/evidenceReview';
import type {
  IntelligenceConflictStatus,
  IntelligenceSourceType,
  IntelligenceTimelineEventType,
  IntelligenceTimelineReviewScope,
  IntelligenceTimelineVisibility,
  IntelligenceVerificationStatus,
} from '@/lib/services/intelligence/types';
import { createAdminClient } from '@/lib/supabase/admin';

export interface ReviewIntelligenceClaimInput {
  claimId: string;
  nextStatus: IntelligenceVerificationStatus;
  sourceType: IntelligenceSourceType;
  verificationNote?: string | null;
  reviewDueAt?: string | null;
  expiresAt?: string | null;
  invalidationReason?: string | null;
  validityScope?: string | null;
}

export interface CreateIntelligenceTimelineEventInput {
  profileId: string;
  eventType: IntelligenceTimelineEventType;
  reviewScope: IntelligenceTimelineReviewScope;
  claimId?: string | null;
  title: string;
  summary: string;
  oldValue?: string | null;
  newValue?: string | null;
  sourceUrl?: string | null;
  sourceExcerpt?: string | null;
  visibility: IntelligenceTimelineVisibility;
  occurredAt: string;
  reviewNote?: string | null;
}

export async function createIntelligenceTimelineEvent(
  input: CreateIntelligenceTimelineEventInput,
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireAdmin();
    if (!/^[0-9a-f-]{36}$/i.test(input.profileId)) {
      return { success: false, error: 'Invalid intelligence profile ID.' };
    }
    if (input.claimId && !/^[0-9a-f-]{36}$/i.test(input.claimId)) {
      return { success: false, error: 'Invalid evidence claim ID.' };
    }

    const supabase = createAdminClient();
    const { data: profile, error: profileError } = await supabase
      .from('product_intelligence_profiles')
      .select('id, owner_type')
      .eq('id', input.profileId)
      .maybeSingle();
    if (profileError) throw new Error(profileError.message);
    if (!profile) return { success: false, error: 'Intelligence profile not found.' };

    let claim = null;
    if (input.claimId) {
      const { data, error } = await supabase
        .from('product_intelligence_claims')
        .select('id, profile_id, claim_type, claim_key, verification_status, conflict_status, source_url')
        .eq('id', input.claimId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!data) return { success: false, error: 'Evidence claim not found.' };
      claim = {
        id: String(data.id),
        profileId: String(data.profile_id),
        claimType: data.claim_type,
        claimKey: String(data.claim_key),
        verificationStatus: data.verification_status || 'candidate',
        conflictStatus: data.conflict_status || 'none',
        sourceUrl: String(data.source_url || ''),
      };
    }

    const insert = prepareTimelineEventInsert(
      {
        ...input,
        profileOwnerType: profile.owner_type,
        claim,
      },
      user.id,
    );
    const { error: insertError } = await supabase.from('product_intelligence_timeline_events').insert(insert);
    if (insertError) throw new Error(insertError.message);

    revalidatePath('/[locale]/admin/intelligence', 'page');
    revalidatePath('/[locale]/ai/[websiteName]', 'page');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unable to save the timeline event.',
    };
  }
}

export async function reviewIntelligenceClaim(
  input: ReviewIntelligenceClaimInput,
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireAdmin();
    if (!/^[0-9a-f-]{36}$/i.test(input.claimId)) {
      return { success: false, error: 'Invalid evidence claim ID.' };
    }

    const supabase = createAdminClient();
    const { data: claim, error: claimError } = await supabase
      .from('product_intelligence_claims')
      .select('id, profile_id, source_url, conflict_status, verification_status')
      .eq('id', input.claimId)
      .maybeSingle();

    if (claimError) throw new Error(claimError.message);
    if (!claim) return { success: false, error: 'Evidence claim not found.' };

    const update = prepareEvidenceReviewUpdate(
      {
        currentStatus: (claim.verification_status || 'candidate') as IntelligenceVerificationStatus,
        nextStatus: input.nextStatus,
        conflictStatus: (claim.conflict_status || 'none') as IntelligenceConflictStatus,
        sourceUrl: String(claim.source_url || ''),
        sourceType: input.sourceType,
        verificationNote: input.verificationNote,
        reviewDueAt: input.reviewDueAt,
        expiresAt: input.expiresAt,
        invalidationReason: input.invalidationReason,
        validityScope: input.validityScope,
      },
      user.id,
    );

    const { error: updateError } = await supabase
      .from('product_intelligence_claims')
      .update(update)
      .eq('id', input.claimId);
    if (updateError) throw new Error(updateError.message);

    if (input.nextStatus === 'verified') {
      const { error: profileUpdateError } = await supabase
        .from('product_intelligence_profiles')
        .update({ last_verified_at: update.verified_at, next_review_at: update.review_due_at })
        .eq('id', claim.profile_id);
      if (profileUpdateError) throw new Error(profileUpdateError.message);
    }

    revalidatePath('/[locale]/admin/intelligence', 'page');
    revalidatePath('/[locale]/ai/[websiteName]', 'page');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unable to save the evidence review.',
    };
  }
}
