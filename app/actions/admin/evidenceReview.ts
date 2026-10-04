'use server';

import { revalidatePath } from 'next/cache';

import { requireAdmin } from '@/lib/auth/middleware';
import { createAdminClient } from '@/lib/supabase/admin';

type Result = { success: boolean; error?: string; message?: string };

export async function submitEvidenceDecision(input: {
  claimId: string;
  decision: 'PASS' | 'HOLD';
  excerpt: string;
  note: string;
  scope: string;
  reviewDueAt: string;
}): Promise<Result> {
  try {
    const reviewer = await requireAdmin();
    if (!/^[0-9a-f-]{36}$/i.test(input.claimId) || !['PASS', 'HOLD'].includes(input.decision))
      return { success: false, error: 'Invalid claim or decision.' };
    let scope: unknown;
    try {
      scope = JSON.parse(input.scope);
    } catch {
      return { success: false, error: 'Scope must be valid JSON.' };
    }
    if (!scope || typeof scope !== 'object' || Array.isArray(scope))
      return { success: false, error: 'Scope must be a JSON object.' };
    const due = input.reviewDueAt ? new Date(input.reviewDueAt) : null;
    if (input.decision === 'PASS' && (!due || Number.isNaN(due.getTime())))
      return { success: false, error: 'Choose the next review date.' };
    const { error } = await createAdminClient().rpc('admin_review_evidence_claim', {
      p_claim_id: input.claimId,
      p_reviewer: reviewer.id,
      p_decision: input.decision,
      p_excerpt: input.excerpt.trim(),
      p_note: input.note.trim(),
      p_scope: scope,
      p_review_due_at: due?.toISOString() || null,
    });
    if (error) return { success: false, error: error.message };
    revalidatePath('/[locale]/admin/intelligence/review', 'page');
    revalidatePath('/[locale]/admin/intelligence', 'page');
    return { success: true, message: input.decision === 'PASS' ? 'Claim reviewed.' : 'Claim kept on HOLD.' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Review failed.' };
  }
}

export async function linkReviewedGeminiEvidence(): Promise<Result> {
  try {
    const reviewer = await requireAdmin();
    const { data, error } = await createAdminClient().rpc('admin_link_gemini_notebook_evidence', {
      p_reviewer: reviewer.id,
    });
    if (error) return { success: false, error: error.message };
    revalidatePath('/[locale]/admin/intelligence/review', 'page');
    revalidatePath('/[locale]/admin/decision', 'page');
    return { success: true, message: `Reviewed draft graph: ${JSON.stringify(data)}.` };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Link review failed.' };
  }
}

export async function linkReviewedPerplexityEvidence(): Promise<Result> {
  try {
    const reviewer = await requireAdmin();
    const { data, error } = await createAdminClient().rpc('admin_link_perplexity_stage2_evidence', {
      p_reviewer: reviewer.id,
    });
    if (error) return { success: false, error: error.message };
    revalidatePath('/[locale]/admin/intelligence/review', 'page');
    revalidatePath('/[locale]/admin/decision', 'page');
    return { success: true, message: `Reviewed draft graph: ${JSON.stringify(data)}.` };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Link review failed.' };
  }
}
