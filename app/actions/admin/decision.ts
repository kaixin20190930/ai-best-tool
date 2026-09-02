'use server';

import { revalidatePath } from 'next/cache';

import { requireAdmin } from '@/lib/auth/middleware';
import {
  getDecisionTransitionError,
  type DecisionReviewEntity,
  type DecisionReviewStatus,
} from '@/lib/services/admin/decision';
import { createAdminClient } from '@/lib/supabase/admin';

// Named export keeps the server action call site explicit and leaves room for future editor actions.
// eslint-disable-next-line import/prefer-default-export
export async function transitionDecisionReview(input: {
  entity: DecisionReviewEntity;
  id: string;
  nextStatus: DecisionReviewStatus;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireAdmin();
    if (!/^[0-9a-f-]{36}$/i.test(input.id)) return { success: false, error: 'Invalid record ID.' };
    const supabase = createAdminClient();
    const config = {
      task: { table: 'decision_tasks', id: 'id', status: 'status', linkTable: null, linkId: null },
      profile: {
        table: 'tool_decision_profiles',
        id: 'tool_id',
        status: 'editorial_status',
        linkTable: 'tool_decision_profile_claims',
        linkId: 'tool_id',
      },
      fit: { table: 'tool_task_fits', id: 'id', status: 'status', linkTable: 'tool_task_fit_claims', linkId: 'fit_id' },
      relationship: {
        table: 'tool_relationships',
        id: 'id',
        status: 'status',
        linkTable: 'tool_relationship_claims',
        linkId: 'relationship_id',
      },
    }[input.entity];
    if (!config) return { success: false, error: 'Unsupported review entity.' };

    const { data: record, error: recordError } = await supabase
      .from(config.table)
      .select(input.entity === 'task' ? config.status : `${config.status}, reviewed_at`)
      .eq(config.id, input.id)
      .maybeSingle();
    if (recordError) throw new Error(recordError.message);
    if (!record) return { success: false, error: 'Review record not found.' };
    const reviewRecord = record as unknown as Record<string, unknown>;
    let evidenceCount = 0;
    if (config.linkTable && config.linkId) {
      const { count, error } = await supabase
        .from(config.linkTable)
        .select('*', { count: 'exact', head: true })
        .eq(config.linkId, input.id);
      if (error) throw new Error(error.message);
      evidenceCount = count || 0;
    }
    const current = reviewRecord[config.status] as DecisionReviewStatus;
    const transitionError = getDecisionTransitionError(
      input.entity,
      current,
      input.nextStatus,
      evidenceCount,
      (reviewRecord.reviewed_at as string | null) || null,
    );
    if (transitionError) return { success: false, error: transitionError };

    const update: Record<string, unknown> = { [config.status]: input.nextStatus };
    if (input.entity !== 'task' && input.nextStatus === 'reviewed') {
      const reviewedAt = new Date();
      update.reviewed_at = reviewedAt.toISOString();
      update.review_due_at = new Date(reviewedAt.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString();
      update.reviewed_by = user.id;
    }
    const { error: updateError } = await supabase.from(config.table).update(update).eq(config.id, input.id);
    if (updateError) throw new Error(updateError.message);

    revalidatePath('/[locale]/admin/decision', 'page');
    revalidatePath('/[locale]/find-tools', 'page');
    revalidatePath('/[locale]/ai/[websiteName]', 'page');
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unable to update decision review.' };
  }
}
