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
import CL01_TASK_SLUGS from '@/lib/services/decision/cl01Scope';
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
const fitEvidencePurposes = [
  'fit',
  'cost',
  'setup',
  'privacy',
  'export',
  'replacement',
  'limitation',
  'other',
] as const;
const fitLevels = ['strong', 'conditional', 'weak', 'not_fit'] as const;

export type CapabilityActionResult = { success: true; id?: string } | { success: false; error: string };
export type ClusterManifestEntry = { id: string; updated_at: string; status: 'reviewed' | 'published' };
export type ClusterManifest = {
  taskId: string;
  taskCapabilities: ClusterManifestEntry[];
  toolCapabilities: ClusterManifestEntry[];
  fits: ClusterManifestEntry[];
  operation: 'publish' | 'withdraw';
  qaReference: string;
};

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
      last_edited_by: user.id,
      ...reviewFields(user.id, input.status),
    };
    const supabase = createAdminClient();
    if (input.id) {
      const { data: existing } = await supabase
        .from('tool_capabilities')
        .select('status, tool_id, capability_id')
        .eq('id', input.id)
        .maybeSingle();
      if (!existing || !['draft', 'reviewed'].includes(existing.status)) {
        return { success: false, error: 'Published or stale capabilities use controlled transitions.' };
      }
      if (existing.tool_id !== input.toolId || existing.capability_id !== input.capabilityId) {
        return { success: false, error: 'Tool Capability identity is immutable.' };
      }
    }
    const result = input.id
      ? await supabase
          .from('tool_capabilities')
          .update(payload)
          .eq('id', input.id)
          .in('status', ['draft', 'reviewed'])
          .select('id')
          .maybeSingle()
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
    const supabase = createAdminClient();
    const { data: existing } = await supabase
      .from('task_capabilities')
      .select('status')
      .eq('task_id', input.taskId)
      .eq('capability_id', input.capabilityId)
      .maybeSingle();
    if (existing && !['draft', 'reviewed'].includes(existing.status)) {
      return { success: false, error: 'Published or stale capabilities use controlled transitions.' };
    }
    const payload = {
      task_id: input.taskId,
      capability_id: input.capabilityId,
      importance: input.importance,
      rationale,
      status: input.status,
      last_edited_by: user.id,
      ...reviewFields(user.id, input.status),
    };
    const result = existing
      ? await supabase
          .from('task_capabilities')
          .update(payload)
          .eq('task_id', input.taskId)
          .eq('capability_id', input.capabilityId)
          .in('status', ['draft', 'reviewed'])
          .select('task_id')
          .maybeSingle()
      : await supabase.from('task_capabilities').insert(payload).select('task_id').maybeSingle();
    if (result.error || !result.data) return stableCapabilityError(result.error, 'Unable to save task capability.');
    revalidatePath('/[locale]/admin/decision', 'page');
    return { success: true };
  } catch (error) {
    return stableCapabilityError(error, 'Unable to save task capability.');
  }
}

export async function rereviewDecisionCapability(input: {
  entity: 'task' | 'tool';
  taskId?: string;
  id: string;
}): Promise<CapabilityActionResult> {
  try {
    const user = await requireAdmin();
    if (!isUuid(input.id) || (input.entity === 'task' && !isUuid(input.taskId || ''))) {
      return { success: false, error: 'Invalid capability ID.' };
    }
    const reviewedAt = new Date();
    const payload = {
      status: 'reviewed',
      reviewed_at: reviewedAt.toISOString(),
      review_due_at: new Date(reviewedAt.getTime() + 90 * 86400000).toISOString(),
      reviewed_by: user.id,
      last_edited_by: user.id,
    };
    const supabase = createAdminClient();
    const query =
      input.entity === 'task'
        ? supabase.from('task_capabilities').update(payload).eq('task_id', input.taskId!).eq('capability_id', input.id)
        : supabase.from('tool_capabilities').update(payload).eq('id', input.id);
    const { data, error } = await query.eq('status', 'stale').select('status').maybeSingle();
    if (error || !data) return { success: false, error: 'Only a stale capability can be re-reviewed.' };
    revalidatePath('/[locale]/admin/decision', 'page');
    return { success: true };
  } catch (error) {
    return stableCapabilityError(error, 'Unable to re-review capability.');
  }
}

function validateManifest(input: ClusterManifest): string | null {
  if (!isUuid(input.taskId) || !['publish', 'withdraw'].includes(input.operation)) return 'Invalid Task or operation.';
  const lists = [input.taskCapabilities, input.toolCapabilities, input.fits];
  if (lists.some((entries) => !Array.isArray(entries) || entries.length < 1 || entries.length > 50)) {
    return 'Each exact manifest list must have 1–50 rows.';
  }
  if (lists.some((entries) => new Set(entries.map((entry) => entry.id)).size !== entries.length)) {
    return 'Duplicate manifest ID.';
  }
  const expected = input.operation === 'publish' ? 'reviewed' : 'published';
  if (
    lists.some((entries) =>
      entries.some(
        (entry) => !isUuid(entry.id) || Number.isNaN(Date.parse(entry.updated_at)) || entry.status !== expected,
      ),
    )
  ) {
    return 'Invalid manifest row or expected status.';
  }
  return null;
}

export async function transitionDecisionCluster(
  input: ClusterManifest & { preflight: boolean },
): Promise<{ success: boolean; error?: string; summary?: string }> {
  try {
    const user = await requireAdmin();
    const problem = validateManifest(input);
    if (problem) return { success: false, error: problem };
    if (!input.preflight && input.operation === 'publish' && input.qaReference.trim().length < 8) {
      return { success: false, error: 'Enter the independent QA report reference before publication.' };
    }
    const { data, error } = await createAdminClient().rpc('decision_cluster_transition', {
      p_task_id: input.taskId,
      p_task_capabilities: input.taskCapabilities,
      p_tool_capabilities: input.toolCapabilities,
      p_fits: input.fits,
      p_operation: input.operation,
      p_reviewer: user.id,
      p_qa_reference: input.qaReference.trim(),
      p_preflight: input.preflight,
    });
    if (error) return { success: false, error: error.message };
    if (!input.preflight) {
      revalidatePath('/[locale]/admin/decision', 'page');
      revalidatePath('/[locale]/find-tools', 'page');
      revalidatePath('/[locale]/ai/[websiteName]', 'page');
    }
    return { success: true, summary: JSON.stringify(data) };
  } catch (error) {
    return stableCapabilityError(error, 'Unable to transition Task cluster.');
  }
}

export async function intakeOfficialDecisionEvidence(input: {
  profileId: string;
  url: string;
  label: string;
  claimType: string;
  claimKey: string;
  claimValue: string;
  excerpt: string;
  validityScope: string;
  reviewDueAt: string;
}): Promise<CapabilityActionResult> {
  try {
    const user = await requireAdmin();
    if (!isUuid(input.profileId)) return { success: false, error: 'Invalid tool profile ID.' };
    let url: URL;
    try {
      url = new URL(input.url);
    } catch {
      return { success: false, error: 'Invalid official URL.' };
    }
    if (url.protocol !== 'https:' || url.username || url.password || !url.hostname) {
      return { success: false, error: 'A public HTTPS official URL is required.' };
    }
    const scope = parseObject(input.validityScope);
    const due = new Date(input.reviewDueAt);
    if (
      !scope ||
      Object.keys(scope).length === 0 ||
      Number.isNaN(due.getTime()) ||
      due.getTime() <= Date.now() ||
      due.getTime() > Date.now() + 90 * 86400000 ||
      input.excerpt.trim().length < 12 ||
      input.claimValue.trim().length < 3 ||
      input.label.trim().length < 3 ||
      input.claimKey.trim().length < 3 ||
      input.claimType.trim().length < 2
    ) {
      return { success: false, error: 'Complete the direct fact, scope, and current review window.' };
    }
    const supabase = createAdminClient();
    const { data: profile, error: profileError } = await supabase
      .from('product_intelligence_profiles')
      .select('id, owner_type, owner_id, canonical_domain, profile_status')
      .eq('id', input.profileId)
      .maybeSingle();
    if (profileError || !profile || profile.owner_type !== 'tool' || profile.profile_status !== 'ready') {
      return { success: false, error: 'A ready tool profile is required.' };
    }
    const domain = String(profile.canonical_domain)
      .toLowerCase()
      .replace(/^www\./, '');
    const host = url.hostname.toLowerCase();
    if (!(host === domain || host === `www.${domain}` || host.endsWith(`.${domain}`))) {
      return { success: false, error: 'Source host differs from the profile canonical domain.' };
    }
    const identities = await getDecisionToolIdentities([String(profile.owner_id)], 'en');
    if (identities.length !== 1) return { success: false, error: 'Profile owner is not a directory tool.' };
    const { data, error } = await supabase.rpc('decision_official_evidence_intake', {
      p_profile_id: input.profileId,
      p_url: url.toString(),
      p_label: input.label.trim(),
      p_claim_type: input.claimType.trim().toLowerCase(),
      p_claim_key: input.claimKey.trim().toLowerCase(),
      p_claim_value: input.claimValue.trim(),
      p_excerpt: input.excerpt.trim(),
      p_validity_scope: scope,
      p_review_due_at: due.toISOString(),
      p_reviewer: user.id,
    });
    if (error) return { success: false, error: error.message };
    revalidatePath('/[locale]/admin/decision', 'page');
    return { success: true, id: String(data) };
  } catch (error) {
    return stableCapabilityError(error, 'Unable to save official evidence.');
  }
}

export async function saveClusterFit(input: {
  id?: string;
  taskId: string;
  toolId: string;
  fitLevel: string;
  rationale: string;
  requiredConditions: string;
  disqualifiers: string;
  status: string;
}): Promise<CapabilityActionResult> {
  try {
    const user = await requireAdmin();
    if (
      (input.id && !isUuid(input.id)) ||
      !isUuid(input.taskId) ||
      !isUuid(input.toolId) ||
      !allowed(input.fitLevel, fitLevels) ||
      !allowed(input.status, capabilityEditorialStatuses)
    ) {
      return { success: false, error: 'Invalid Fit identity or state.' };
    }
    const rationale = parseObject(input.rationale);
    const requiredConditions = parseArray(input.requiredConditions);
    const disqualifiers = parseArray(input.disqualifiers);
    if (!rationale || !requiredConditions || !disqualifiers) {
      return { success: false, error: 'Fit rationale, conditions, and disqualifiers require valid JSON.' };
    }
    const supabase = createAdminClient();
    const { data: task } = await supabase.from('decision_tasks').select('slug').eq('id', input.taskId).maybeSingle();
    if (!task || !CL01_TASK_SLUGS.has(String(task.slug)))
      return { success: false, error: 'Task is outside CL-01 scope.' };
    const tool = await getDecisionToolIdentities([input.toolId], 'en');
    if (tool.length !== 1) return { success: false, error: 'Directory tool not found.' };
    if (input.id) {
      const { data: existing } = await supabase
        .from('tool_task_fits')
        .select('task_id, tool_id, status')
        .eq('id', input.id)
        .maybeSingle();
      if (
        !existing ||
        existing.task_id !== input.taskId ||
        existing.tool_id !== input.toolId ||
        !['draft', 'reviewed'].includes(existing.status)
      ) {
        return {
          success: false,
          error: 'Fit identity is immutable; published and stale Fits use controlled transitions.',
        };
      }
    }
    const payload = {
      task_id: input.taskId,
      tool_id: input.toolId,
      fit_level: input.fitLevel,
      rationale,
      required_conditions: requiredConditions,
      disqualifiers,
      status: input.status,
      last_edited_by: user.id,
      ...reviewFields(user.id, input.status),
    };
    const result = input.id
      ? await supabase
          .from('tool_task_fits')
          .update(payload)
          .eq('id', input.id)
          .in('status', ['draft', 'reviewed'])
          .select('id')
          .maybeSingle()
      : await supabase.from('tool_task_fits').insert(payload).select('id').single();
    if (result.error || !result.data) return stableCapabilityError(result.error, 'Unable to save Fit.');
    revalidatePath('/[locale]/admin/decision', 'page');
    return { success: true, id: String(result.data.id) };
  } catch (error) {
    return stableCapabilityError(error, 'Unable to save Fit.');
  }
}

export async function changeClusterFitEvidenceLink(input: {
  fitId: string;
  claimId: string;
  purpose: string;
  mode: 'add' | 'remove';
}): Promise<CapabilityActionResult> {
  try {
    await requireAdmin();
    if (
      !isUuid(input.fitId) ||
      !isUuid(input.claimId) ||
      !allowed(input.purpose, fitEvidencePurposes) ||
      !['add', 'remove'].includes(input.mode)
    ) {
      return { success: false, error: 'Invalid Fit evidence link.' };
    }
    const supabase = createAdminClient();
    const { data: fit } = await supabase
      .from('tool_task_fits')
      .select('task_id, status')
      .eq('id', input.fitId)
      .maybeSingle();
    if (!fit || !['draft', 'reviewed', 'stale'].includes(fit.status)) {
      return { success: false, error: 'Published Fit evidence links are locked.' };
    }
    const { data: task } = await supabase.from('decision_tasks').select('slug').eq('id', fit.task_id).maybeSingle();
    if (!task || !CL01_TASK_SLUGS.has(String(task.slug)))
      return { success: false, error: 'Task is outside CL-01 scope.' };
    const query = supabase.from('tool_task_fit_claims');
    const { error } =
      input.mode === 'add'
        ? await query.insert({ fit_id: input.fitId, claim_id: input.claimId, purpose: input.purpose })
        : await query.delete().eq('fit_id', input.fitId).eq('claim_id', input.claimId).eq('purpose', input.purpose);
    if (error) return stableCapabilityError(error, 'Fit evidence link was rejected by the verification gate.');
    revalidatePath('/[locale]/admin/decision', 'page');
    return { success: true };
  } catch (error) {
    return stableCapabilityError(error, 'Unable to change Fit evidence link.');
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

    let selectColumns = input.entity === 'task' ? config.status : `${config.status}, reviewed_at`;
    if (input.entity === 'fit') selectColumns = `${config.status}, reviewed_at, task_id`;
    const { data: record, error: recordError } = await supabase
      .from(config.table)
      .select(selectColumns)
      .eq(config.id, input.id)
      .maybeSingle();
    if (recordError) throw new Error(recordError.message);
    if (!record) return { success: false, error: 'Review record not found.' };
    const reviewRecord = record as unknown as Record<string, unknown>;
    if (input.entity === 'fit' && ['published', 'stale'].includes(input.nextStatus)) {
      const { data: task, error: taskError } = await supabase
        .from('decision_tasks')
        .select('slug')
        .eq('id', String(reviewRecord.task_id))
        .maybeSingle();
      if (taskError) throw new Error(taskError.message);
      if (task && CL01_TASK_SLUGS.has(String(task.slug))) {
        return { success: false, error: 'This Task Fit publishes or withdraws only with its exact cluster manifest.' };
      }
    }
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
    if (input.entity === 'fit') update.last_edited_by = user.id;
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
