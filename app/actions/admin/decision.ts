'use server';

import { revalidatePath } from 'next/cache';

import { requireAdmin } from '@/lib/auth/middleware';
import {
  getDecisionTransitionError,
  type DecisionReviewEntity,
  type DecisionReviewStatus,
} from '@/lib/services/admin/decision';
import type {
  CapabilityAvailability,
  CapabilityGroup,
  CapabilitySupportLevel,
  TaskCapabilityImportance,
} from '@/lib/services/decision/capabilityReadModel';
import { getDecisionToolIdentities } from '@/lib/services/decision/repository';
import { createAdminClient } from '@/lib/supabase/admin';

const capabilityGroups: CapabilityGroup[] = [
  'creation',
  'editing',
  'analysis',
  'automation',
  'collaboration',
  'governance',
  'delivery',
  'other',
];
const capabilityLifecycleStatuses = ['draft', 'active', 'archived'] as const;
const capabilityEditorialStatuses = ['draft', 'reviewed'] as const;
const supportLevels: CapabilitySupportLevel[] = ['strong', 'partial', 'limited', 'not_supported', 'unknown'];
const availabilityLevels: CapabilityAvailability[] = ['all_plans', 'paid_only', 'enterprise_only', 'add_on', 'unknown'];
const taskImportanceLevels: TaskCapabilityImportance[] = ['required', 'preferred', 'contextual'];
const evidencePurposes = ['support', 'availability', 'plan', 'limitation', 'other'] as const;

export type CapabilityActionResult = { success: true; id?: string } | { success: false; error: string };

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function allowed<T extends string>(value: string, values: readonly T[]): value is T {
  return values.includes(value as T);
}

function parseObject(value: string): Record<string, unknown> | null {
  try {
    const parsed: unknown = JSON.parse(value || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function parseArray(value: string): unknown[] | null {
  try {
    const parsed: unknown = JSON.parse(value || '[]');
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function reviewFields(userId: string, status: 'draft' | 'reviewed'): Record<string, string | null> {
  if (status === 'draft') return { reviewed_at: null, review_due_at: null, reviewed_by: null };
  const reviewedAt = new Date();
  return {
    reviewed_at: reviewedAt.toISOString(),
    review_due_at: new Date(reviewedAt.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    reviewed_by: userId,
  };
}

function stableCapabilityError(error: unknown, fallback: string): CapabilityActionResult {
  console.error(fallback, error);
  return { success: false, error: fallback };
}

export async function saveDecisionCapability(input: {
  id?: string;
  slug: string;
  name: string;
  description: string;
  group: string;
  status: string;
  displayOrder: number;
}): Promise<CapabilityActionResult> {
  try {
    await requireAdmin();
    const slug = input.slug.trim().toLowerCase();
    const name = input.name.trim();
    const description = input.description.trim();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !name || !allowed(input.group, capabilityGroups)) {
      return { success: false, error: 'Invalid capability details.' };
    }
    if (
      !allowed(input.status, capabilityLifecycleStatuses) ||
      !Number.isInteger(input.displayOrder) ||
      input.displayOrder < 0
    ) {
      return { success: false, error: 'Invalid capability status or display order.' };
    }
    if (input.id && !isUuid(input.id)) return { success: false, error: 'Invalid capability ID.' };
    const payload = {
      slug,
      name: { en: name },
      description: description ? { en: description } : {},
      capability_group: input.group,
      status: input.status,
      display_order: input.displayOrder,
    };
    const supabase = createAdminClient();
    const result = input.id
      ? await supabase.from('decision_capabilities').update(payload).eq('id', input.id).select('id').maybeSingle()
      : await supabase.from('decision_capabilities').insert(payload).select('id').single();
    if (result.error || !result.data) return stableCapabilityError(result.error, 'Unable to save capability.');
    revalidatePath('/[locale]/admin/decision', 'page');
    return { success: true, id: String(result.data.id) };
  } catch (error) {
    return stableCapabilityError(error, 'Unable to save capability.');
  }
}

export async function saveToolCapability(input: {
  id?: string;
  toolId: string;
  capabilityId: string;
  supportLevel: string;
  availability: string;
  planRequirement: string;
  limitations: string;
  status: string;
}): Promise<CapabilityActionResult> {
  try {
    const user = await requireAdmin();
    if ((input.id && !isUuid(input.id)) || !isUuid(input.toolId) || !isUuid(input.capabilityId)) {
      return { success: false, error: 'Invalid tool or capability ID.' };
    }
    if (
      !allowed(input.supportLevel, supportLevels) ||
      !allowed(input.availability, availabilityLevels) ||
      !allowed(input.status, capabilityEditorialStatuses)
    ) {
      return { success: false, error: 'Invalid tool capability state.' };
    }
    const tool = await getDecisionToolIdentities([input.toolId], 'en');
    if (tool.length !== 1) return { success: false, error: 'Directory tool not found.' };
    const planRequirement = parseObject(input.planRequirement);
    const limitations = parseArray(input.limitations);
    if (!planRequirement || !limitations)
      return { success: false, error: 'Plan requirements and limitations must be valid JSON.' };
    const payload = {
      tool_id: input.toolId,
      capability_id: input.capabilityId,
      support_level: input.supportLevel,
      availability: input.availability,
      plan_requirement: planRequirement,
      limitations,
      status: input.status,
      ...reviewFields(user.id, input.status),
    };
    const supabase = createAdminClient();
    const result = input.id
      ? await supabase.from('tool_capabilities').update(payload).eq('id', input.id).select('id').maybeSingle()
      : await supabase.from('tool_capabilities').insert(payload).select('id').single();
    if (result.error || !result.data) return stableCapabilityError(result.error, 'Unable to save tool capability.');
    revalidatePath('/[locale]/admin/decision', 'page');
    return { success: true, id: String(result.data.id) };
  } catch (error) {
    return stableCapabilityError(error, 'Unable to save tool capability.');
  }
}

export async function saveTaskCapability(input: {
  taskId: string;
  capabilityId: string;
  importance: string;
  rationale: string;
  status: string;
}): Promise<CapabilityActionResult> {
  try {
    const user = await requireAdmin();
    if (!isUuid(input.taskId) || !isUuid(input.capabilityId))
      return { success: false, error: 'Invalid task or capability ID.' };
    if (!allowed(input.importance, taskImportanceLevels) || !allowed(input.status, capabilityEditorialStatuses)) {
      return { success: false, error: 'Invalid task capability state.' };
    }
    const rationale = parseObject(input.rationale);
    if (!rationale) return { success: false, error: 'Rationale must be a JSON object.' };
    const { error } = await createAdminClient()
      .from('task_capabilities')
      .upsert(
        {
          task_id: input.taskId,
          capability_id: input.capabilityId,
          importance: input.importance,
          rationale,
          status: input.status,
          ...reviewFields(user.id, input.status),
        },
        { onConflict: 'task_id,capability_id' },
      );
    if (error) return stableCapabilityError(error, 'Unable to save task capability.');
    revalidatePath('/[locale]/admin/decision', 'page');
    return { success: true };
  } catch (error) {
    return stableCapabilityError(error, 'Unable to save task capability.');
  }
}

export async function addToolCapabilityEvidenceLink(input: {
  toolCapabilityId: string;
  claimId: string;
  purpose: string;
}): Promise<CapabilityActionResult> {
  try {
    await requireAdmin();
    if (!isUuid(input.toolCapabilityId) || !isUuid(input.claimId) || !allowed(input.purpose, evidencePurposes)) {
      return { success: false, error: 'Invalid evidence link.' };
    }
    const supabase = createAdminClient();
    const { data: capability, error: capabilityError } = await supabase
      .from('tool_capabilities')
      .select('status')
      .eq('id', input.toolCapabilityId)
      .maybeSingle();
    if (capabilityError || !capability) return { success: false, error: 'Tool capability not found.' };
    if (capability.status === 'published') {
      return { success: false, error: 'Published evidence links are locked; return the capability to reviewed first.' };
    }
    const { error } = await supabase.from('tool_capability_claims').insert({
      tool_capability_id: input.toolCapabilityId,
      claim_id: input.claimId,
      purpose: input.purpose,
    });
    if (error) return stableCapabilityError(error, 'Evidence link was rejected by the verification gate.');
    revalidatePath('/[locale]/admin/decision', 'page');
    return { success: true };
  } catch (error) {
    return stableCapabilityError(error, 'Unable to save evidence link.');
  }
}

export async function removeToolCapabilityEvidenceLink(input: {
  toolCapabilityId: string;
  claimId: string;
  purpose: string;
}): Promise<CapabilityActionResult> {
  try {
    await requireAdmin();
    if (!isUuid(input.toolCapabilityId) || !isUuid(input.claimId) || !allowed(input.purpose, evidencePurposes)) {
      return { success: false, error: 'Invalid evidence link.' };
    }
    const supabase = createAdminClient();
    const { data: capability, error: capabilityError } = await supabase
      .from('tool_capabilities')
      .select('status')
      .eq('id', input.toolCapabilityId)
      .maybeSingle();
    if (capabilityError || !capability) return { success: false, error: 'Tool capability not found.' };
    if (capability.status === 'published') {
      return { success: false, error: 'Published evidence links are locked; return the capability to reviewed first.' };
    }
    const { error } = await supabase
      .from('tool_capability_claims')
      .delete()
      .eq('tool_capability_id', input.toolCapabilityId)
      .eq('claim_id', input.claimId)
      .eq('purpose', input.purpose);
    if (error) return stableCapabilityError(error, 'Unable to remove evidence link.');
    revalidatePath('/[locale]/admin/decision', 'page');
    return { success: true };
  } catch (error) {
    return stableCapabilityError(error, 'Unable to remove evidence link.');
  }
}

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
