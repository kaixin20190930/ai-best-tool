'use server';

import { getDecisionEvidenceBundle } from '@/lib/services/decision/evidence';
import {
  getActiveDecisionTasks,
  getDecisionToolIdentities,
  getPublishedDecisionCandidateToolIds,
  type DecisionTaskOption,
} from '@/lib/services/decision/repository';
import {
  buildDecisionCandidates,
  runDecisionRules,
  type DecisionFinderConstraints,
  type DecisionRecommendationRole,
} from '@/lib/services/decision/rules';

export type DecisionFinderActionResult =
  | {
      success: true;
      data: {
        rulesVersion: string;
        taskId: string;
        recommendations: Array<{
          role: DecisionRecommendationRole;
          rankOrder: number;
          toolId: string;
          toolName: string;
          toolSlug: string;
          matchedConditions: string[];
          unresolvedUnknowns: string[];
          evidenceClaimIds: string[];
          monthlyCost: number | null;
          currency: string | null;
        }>;
        needsVerification: number;
        excluded: number;
      };
    }
  | { success: false; code: string; message: string; retryable: boolean };

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function normalizeConstraints(input: DecisionFinderConstraints, task: DecisionTaskOption): DecisionFinderConstraints {
  const configuredFields = Array.isArray(task.constraintSchema.fields)
    ? task.constraintSchema.fields.filter((field): field is string => typeof field === 'string')
    : [];
  const enabled = (field: string) => configuredFields.length === 0 || configuredFields.includes(field);
  const budgetMax =
    enabled('budget') && typeof input.budgetMax === 'number' && Number.isFinite(input.budgetMax) && input.budgetMax >= 0
      ? Math.min(input.budgetMax, 1_000_000)
      : null;
  return {
    roleKey: enabled('role') && typeof input.roleKey === 'string' ? input.roleKey.trim().slice(0, 60) || null : null,
    teamSizeBand: enabled('team_size') ? input.teamSizeBand || 'unknown' : 'unknown',
    budgetMax,
    budgetPeriod: input.budgetPeriod || 'month',
    currency: /^[A-Z]{3}$/.test(input.currency || '') ? input.currency : 'USD',
    integrationKeys: enabled('integrations')
      ? Array.from(
          new Set((input.integrationKeys || []).map((value) => value.trim().toLowerCase()).filter(Boolean)),
        ).slice(0, 20)
      : [],
    dataSensitivity: enabled('data_sensitivity') ? input.dataSensitivity || 'low' : 'low',
    selfHostRequired: enabled('self_host') && Boolean(input.selfHostRequired),
    exportRequired: enabled('export') && Boolean(input.exportRequired),
  };
}

export async function runDecisionFinderAction(input: {
  taskId: string;
  locale: string;
  constraints: DecisionFinderConstraints;
}): Promise<DecisionFinderActionResult> {
  if (!uuidPattern.test(input.taskId)) {
    return { success: false, code: 'INVALID_TASK', message: 'Choose a valid task.', retryable: false };
  }

  try {
    const activeTasks = await getActiveDecisionTasks();
    const activeTask = activeTasks.find((task) => task.id === input.taskId);
    if (!activeTask) {
      return { success: false, code: 'TASK_NOT_ACTIVE', message: 'This task is not available.', retryable: false };
    }

    const toolIds = await getPublishedDecisionCandidateToolIds(input.taskId);
    if (toolIds.length === 0) {
      return {
        success: true,
        data: {
          rulesVersion: 'decision-v1',
          taskId: input.taskId,
          recommendations: [],
          needsVerification: 0,
          excluded: 0,
        },
      };
    }

    const [evidenceBundle, tools] = await Promise.all([
      getDecisionEvidenceBundle(toolIds),
      getDecisionToolIdentities(toolIds, input.locale),
    ]);
    if (!evidenceBundle.available) {
      return {
        success: false,
        code: evidenceBundle.code,
        message: evidenceBundle.message,
        retryable: true,
      };
    }

    const toolsById = new Map(tools.map((tool) => [tool.id, tool]));
    const candidates = buildDecisionCandidates(
      evidenceBundle,
      input.taskId,
      Object.fromEntries(tools.map((tool) => [tool.id, tool.title])),
    ).filter((candidate) => toolsById.has(candidate.toolId));
    const result = runDecisionRules({
      taskId: input.taskId,
      candidates,
      constraints: normalizeConstraints(input.constraints, activeTask),
    });

    return {
      success: true,
      data: {
        rulesVersion: result.rulesVersion,
        taskId: result.taskId,
        recommendations: result.recommendations.map((recommendation) => ({
          role: recommendation.role,
          rankOrder: recommendation.rankOrder,
          toolId: recommendation.toolId,
          toolName: recommendation.toolName,
          toolSlug: toolsById.get(recommendation.toolId)?.slug || '',
          matchedConditions: recommendation.matchedConditions,
          unresolvedUnknowns: recommendation.unresolvedUnknowns,
          evidenceClaimIds: recommendation.evidenceClaimIds,
          monthlyCost: recommendation.normalizedCost?.monthlyEquivalent ?? null,
          currency: recommendation.normalizedCost?.currency ?? null,
        })),
        needsVerification: result.evaluations.filter((evaluation) => evaluation.state === 'needs_verification').length,
        excluded: result.evaluations.filter((evaluation) => evaluation.state === 'excluded').length,
      },
    };
  } catch {
    return {
      success: false,
      code: 'FINDER_UNAVAILABLE',
      message: 'The decision finder is temporarily unavailable.',
      retryable: true,
    };
  }
}
