'use server';

import { revalidatePath } from 'next/cache';

import { getDecisionEvidenceBundle } from '@/lib/services/decision/evidence';
import {
  getDecisionToolIdentities,
  getPublishedDecisionCandidateToolIds,
} from '@/lib/services/decision/repository';
import {
  buildStackAuditFindings,
  STACK_AUDIT_RULES_VERSION,
  type StackAuditItemInput,
} from '@/lib/services/stack/audit';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type RunStackAuditResult =
  | { success: true; auditId: string; reused: boolean; findingCount: number }
  | { success: false; code: string; message: string };

async function runStackAuditInternal(input: {
  locale: string;
  targetTaskIds: string[];
  idempotencyKey: string;
}): Promise<RunStackAuditResult> {
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return { success: false, code: 'AUTH_REQUIRED', message: 'Log in to run a Stack audit.' };

  const targetTaskIds = Array.from(new Set(input.targetTaskIds.filter((id) => uuidPattern.test(id)))).slice(0, 12);
  if (targetTaskIds.length === 0) {
    return { success: false, code: 'AUDIT_TASK_REQUIRED', message: 'Choose at least one task to audit.' };
  }
  const idempotencyKey = input.idempotencyKey.trim().slice(0, 100);
  if (!idempotencyKey) {
    return { success: false, code: 'AUDIT_KEY_REQUIRED', message: 'Refresh the page and retry the audit.' };
  }

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from('stack_audit_runs')
    .select('id, status, summary')
    .eq('user_id', user.id)
    .eq('idempotency_key', idempotencyKey)
    .maybeSingle();
  if (existing) {
    const summary = (existing.summary || {}) as Record<string, unknown>;
    return {
      success: true,
      auditId: String(existing.id),
      reused: true,
      findingCount: Number(summary.findingCount || 0),
    };
  }

  const [itemsResult, tasksResult] = await Promise.all([
    admin.from('user_tool_stack_items').select('*').eq('user_id', user.id),
    admin.from('decision_tasks').select('id').in('id', targetTaskIds).eq('status', 'active'),
  ]);
  if (itemsResult.error || tasksResult.error) {
    return { success: false, code: 'AUDIT_INPUT_UNAVAILABLE', message: 'Unable to read your Stack safely.' };
  }
  if (!itemsResult.data?.length) {
    return { success: false, code: 'STACK_EMPTY', message: 'Add at least one tool before running an audit.' };
  }
  const activeTaskIds = new Set((tasksResult.data || []).map((task) => String(task.id)));
  if (activeTaskIds.size !== targetTaskIds.length) {
    return { success: false, code: 'AUDIT_TASK_INACTIVE', message: 'One selected task is no longer available.' };
  }

  const stackItemIds = itemsResult.data.map((item) => String(item.id));
  const linksResult = await admin
    .from('user_tool_stack_item_tasks')
    .select('stack_item_id, task_id')
    .in('stack_item_id', stackItemIds)
    .eq('is_primary', true);
  if (linksResult.error) {
    return { success: false, code: 'AUDIT_INPUT_UNAVAILABLE', message: 'Unable to read your Stack tasks safely.' };
  }
  const taskByItem = new Map((linksResult.data || []).map((link) => [String(link.stack_item_id), String(link.task_id)]));
  const currentToolIds = (itemsResult.data || []).map((item) => item.tool_id && String(item.tool_id)).filter(Boolean) as string[];
  const candidateGroups = await Promise.all(targetTaskIds.map((taskId) => getPublishedDecisionCandidateToolIds(taskId)));
  const evidenceToolIds = Array.from(new Set([...currentToolIds, ...candidateGroups.flat()])).slice(0, 50);
  const [evidence, identities] = await Promise.all([
    getDecisionEvidenceBundle(evidenceToolIds),
    getDecisionToolIdentities(evidenceToolIds, input.locale),
  ]);
  if (!evidence.available) {
    return { success: false, code: evidence.code, message: evidence.message };
  }
  const toolNames = Object.fromEntries(identities.map((tool) => [tool.id, tool.title]));
  const stackItems: StackAuditItemInput[] = (itemsResult.data || []).map((item) => ({
    id: String(item.id),
    toolId: item.tool_id ? String(item.tool_id) : null,
    title: item.tool_id ? toolNames[String(item.tool_id)] || String(item.tool_id) : String(item.custom_tool_name),
    subscriptionStatus: item.subscription_status as StackAuditItemInput['subscriptionStatus'],
    monthlyCost: item.monthly_cost === null ? null : Number(item.monthly_cost),
    currency: String(item.currency),
    usageFrequency: item.usage_frequency as StackAuditItemInput['usageFrequency'],
    dataSensitivity: (item.data_sensitivity || null) as StackAuditItemInput['dataSensitivity'],
    taskId: taskByItem.get(String(item.id)) || null,
  }));
  const inputSnapshot = {
    capturedAt: new Date().toISOString(),
    targetTaskIds,
    items: stackItems.map((item) => ({
      id: item.id,
      toolId: item.toolId,
      title: item.title,
      subscriptionStatus: item.subscriptionStatus,
      monthlyCost: item.monthlyCost,
      currency: item.currency,
      usageFrequency: item.usageFrequency,
      dataSensitivity: item.dataSensitivity,
      taskId: item.taskId,
    })),
  };
  const { data: audit, error: auditError } = await admin
    .from('stack_audit_runs')
    .insert({
      user_id: user.id,
      status: 'running',
      input_snapshot: inputSnapshot,
      rules_version: STACK_AUDIT_RULES_VERSION,
      idempotency_key: idempotencyKey,
    })
    .select('id')
    .single();
  if (auditError || !audit) {
    return { success: false, code: 'AUDIT_CREATE_FAILED', message: 'Unable to start this audit.' };
  }

  const auditId = String(audit.id);
  try {
    const findings = buildStackAuditFindings({ items: stackItems, targetTaskIds, evidence, toolNames });
    if (findings.length) {
      const { data: savedFindings, error: findingsError } = await admin
        .from('stack_audit_findings')
        .insert(
          findings.map((finding) => ({
            audit_id: auditId,
            stack_item_id: finding.stackItemId,
            finding_type: finding.findingType,
            related_tool_id: finding.relatedToolId,
            rationale: finding.rationale,
            estimated_monthly_savings: finding.estimatedMonthlySavings,
            currency: finding.currency,
            confidence_state: finding.confidenceState,
          })),
        )
        .select('id');
      if (findingsError || !savedFindings) throw new Error('FINDINGS_WRITE_FAILED');

      const claimRows = savedFindings.flatMap((saved, index) =>
        findings[index].evidence.map((reference) => ({
          finding_id: saved.id,
          claim_id: reference.claimId,
          purpose: reference.purpose,
          claim_snapshot: {
            claimType: reference.claimType,
            claimValue: reference.claimValue,
            sourceUrl: reference.sourceUrl,
            sourceExcerpt: reference.sourceExcerpt,
            observedAt: reference.observedAt,
            verifiedAt: reference.verifiedAt,
          },
        })),
      );
      if (claimRows.length) {
        const { error: claimsError } = await admin.from('stack_audit_finding_claims').insert(claimRows);
        if (claimsError) throw new Error('FINDING_EVIDENCE_WRITE_FAILED');
      }
    }

    const counts = findings.reduce<Record<string, number>>((result, finding) => {
      result[finding.findingType] = (result[finding.findingType] || 0) + 1;
      return result;
    }, {});
    const { error: completeError } = await admin
      .from('stack_audit_runs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        summary: { findingCount: findings.length, counts, targetTaskCount: targetTaskIds.length },
        failure_code: null,
      })
      .eq('id', auditId)
      .eq('user_id', user.id);
    if (completeError) throw new Error('AUDIT_COMPLETE_FAILED');

    revalidatePath(`/${input.locale}/profile/stack`);
    return { success: true, auditId, reused: false, findingCount: findings.length };
  } catch (error) {
    const failureCode = error instanceof Error ? error.message.slice(0, 80) : 'AUDIT_FAILED';
    await admin
      .from('stack_audit_runs')
      .update({ status: 'failed', failure_code: failureCode })
      .eq('id', auditId)
      .eq('user_id', user.id);
    return { success: false, code: failureCode, message: 'The audit could not finish. Your Stack was not changed.' };
  }
}

export async function runStackAudit(input: {
  locale: string;
  targetTaskIds: string[];
  idempotencyKey: string;
}): Promise<RunStackAuditResult> {
  try {
    return await runStackAuditInternal(input);
  } catch {
    return { success: false, code: 'AUDIT_UNAVAILABLE', message: 'Stack Audit is temporarily unavailable.' };
  }
}
