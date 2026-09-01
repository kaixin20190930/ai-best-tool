'use server';

import { revalidatePath } from 'next/cache';

import { requireAdmin } from '@/lib/auth/middleware';
import { prepareEvidenceReviewUpdate } from '@/lib/services/intelligence/evidenceReview';
import type {
  IntelligenceConflictStatus,
  IntelligenceSourceType,
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
