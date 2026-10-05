'use server';

import { revalidatePath } from 'next/cache';

import { requireAdmin } from '@/lib/auth/middleware';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  GEMINI_NOTEBOOK_APPROVED_FIT_RATIONALE,
  fitConditionalUpdateSucceeded,
  validateGeminiNotebookFitRationaleSnapshot,
} from '@/lib/services/admin/geminiNotebookFitRationale';

type Result = { success: boolean; error?: string; message?: string };

const GEMINI_NOTEBOOK_FIT = {
  id: 'c7890701-0000-4000-8000-000000000301',
  taskId: '527fe8b7-c171-4c50-ab1f-9404d7536e7c',
  toolId: 'cec78907-e2a1-4eb7-853a-a58334026280',
  rationale: GEMINI_NOTEBOOK_APPROVED_FIT_RATIONALE,
} as const;

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

export async function completeGeminiNotebookPlanPurposeLink(): Promise<Result> {
  try {
    const reviewer = await requireAdmin();
    const { data, error } = await createAdminClient().rpc('admin_complete_gemini_notebook_plan_link', {
      p_reviewer: reviewer.id,
    });
    if (error) return { success: false, error: error.message };
    revalidatePath('/[locale]/admin/intelligence/review', 'page');
    revalidatePath('/[locale]/admin/decision', 'page');
    const result = data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
    return { success: true, message: `Gemini Notebook evidence link ${String(result.status || 'checked')}.` };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Gemini evidence-link repair failed.' };
  }
}

export async function applyGeminiNotebookFitRationale(): Promise<Result> {
  try {
    const reviewer = await requireAdmin();
    const db = createAdminClient();
    const capabilityIds = [
      'c7890701-0000-4000-8000-000000000201',
      'c7890701-0000-4000-8000-000000000202',
    ];
    const [fitResult, fitsResult, profileResult, decisionResult, capabilityResult, claimResult, sourceResult,
      decisionLinkResult, capabilityLinkResult, fitLinkResult] = await Promise.all([
      db.from('tool_task_fits').select('*').eq('id', GEMINI_NOTEBOOK_FIT.id).maybeSingle(),
      db.from('tool_task_fits').select('id').eq('tool_id', GEMINI_NOTEBOOK_FIT.toolId),
      db.from('product_intelligence_profiles').select('*').eq('id', 'c7890701-0000-4000-8000-000000000001').maybeSingle(),
      db.from('tool_decision_profiles').select('*').eq('tool_id', GEMINI_NOTEBOOK_FIT.toolId),
      db.from('tool_capabilities').select('*').eq('tool_id', GEMINI_NOTEBOOK_FIT.toolId),
      db.from('product_intelligence_claims').select('*').eq('profile_id', 'c7890701-0000-4000-8000-000000000001'),
      db.from('product_intelligence_sources').select('*').eq('profile_id', 'c7890701-0000-4000-8000-000000000001'),
      db.from('tool_decision_profile_claims').select('*').eq('tool_id', GEMINI_NOTEBOOK_FIT.toolId),
      db.from('tool_capability_claims').select('*').in('tool_capability_id', capabilityIds),
      db.from('tool_task_fit_claims').select('*').eq('fit_id', GEMINI_NOTEBOOK_FIT.id),
    ]);
    const queryError = [fitResult, fitsResult, profileResult, decisionResult, capabilityResult, claimResult,
      sourceResult, decisionLinkResult, capabilityLinkResult, fitLinkResult].find((result) => result.error)?.error;
    if (queryError) return { success: false, error: queryError.message };

    const fit = fitResult.data;
    const gateError = validateGeminiNotebookFitRationaleSnapshot(
      {
        fit,
        fitsForTool: fitsResult.data || [],
        profile: profileResult.data,
        decisions: decisionResult.data || [],
        capabilities: capabilityResult.data || [],
        claims: claimResult.data || [],
        sources: sourceResult.data || [],
        decisionLinks: decisionLinkResult.data || [],
        capabilityLinks: capabilityLinkResult.data || [],
        fitLinks: fitLinkResult.data || [],
      },
      Date.now(),
    );
    if (gateError) return { success: false, error: gateError };
    if (!fit) return { success: false, error: 'Gemini Notebook Fit is missing; no changes were made.' };

    const rationale = fit.rationale && typeof fit.rationale === 'object' && !Array.isArray(fit.rationale)
      ? (fit.rationale as Record<string, unknown>)
      : {};
    if (
      fit.status === 'reviewed' &&
      rationale.en === GEMINI_NOTEBOOK_FIT.rationale.en &&
      rationale.cn === GEMINI_NOTEBOOK_FIT.rationale.cn
    ) {
      return { success: true, message: 'Gemini Notebook Fit rationale is already current; unchanged.' };
    }

    const reviewedAt = new Date();
    const reviewDueAt = new Date(reviewedAt.getTime() + 90 * 24 * 60 * 60 * 1000);
    const { data: updated, error: updateError } = await db
      .from('tool_task_fits')
      .update({
        rationale: GEMINI_NOTEBOOK_FIT.rationale,
        reviewed_at: reviewedAt.toISOString(),
        review_due_at: reviewDueAt.toISOString(),
        reviewed_by: reviewer.id,
        last_edited_by: reviewer.id,
      })
      .eq('id', GEMINI_NOTEBOOK_FIT.id)
      .eq('task_id', GEMINI_NOTEBOOK_FIT.taskId)
      .eq('tool_id', GEMINI_NOTEBOOK_FIT.toolId)
      .in('status', ['draft', 'reviewed'])
      .eq('updated_at', fit.updated_at)
      .select('id')
      .maybeSingle();
    if (updateError) return { success: false, error: updateError.message };
    if (!fitConditionalUpdateSucceeded(updated))
      return { success: false, error: 'Gemini Notebook Fit changed during review; reload and retry.' };

    revalidatePath('/[locale]/admin/intelligence/review', 'page');
    revalidatePath('/[locale]/admin/decision', 'page');
    return { success: true, message: 'Gemini Notebook Fit rationale updated and review dates refreshed.' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Gemini Notebook Fit update failed.' };
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
