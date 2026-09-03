import {
  buildDecisionCandidates,
  runDecisionRules,
  type DecisionCandidateEvaluation,
} from '@/lib/services/decision/rules';
import type { DecisionEvidenceBundle, DecisionEvidenceReference } from '@/lib/services/decision/evidence';

export const STACK_AUDIT_RULES_VERSION = 'stack-audit-v1';

export type StackAuditItemInput = {
  id: string;
  toolId: string | null;
  title: string;
  subscriptionStatus: 'trial' | 'free' | 'paid' | 'cancelled';
  monthlyCost: number | null;
  currency: string;
  usageFrequency: 'daily' | 'weekly' | 'monthly' | 'rarely' | 'never';
  dataSensitivity: 'low' | 'medium' | 'high' | 'regulated' | null;
  taskId: string | null;
};

export type StackAuditFindingDraft = {
  stackItemId: string | null;
  findingType: 'keep' | 'replace' | 'remove' | 'missing';
  relatedToolId: string | null;
  rationale: {
    rulesVersion: typeof STACK_AUDIT_RULES_VERSION;
    reasonCodes: string[];
    taskId: string | null;
    currentFit: string | null;
    currentToolTitle: string | null;
    relatedToolTitle: string | null;
    userSignals: string[];
    actionBoundary: 'recommendation_only';
  };
  estimatedMonthlySavings: number | null;
  currency: string | null;
  confidenceState: 'supported' | 'partial' | 'unknown';
  evidence: DecisionEvidenceReference[];
};

function uniqueEvidence(references: DecisionEvidenceReference[]): DecisionEvidenceReference[] {
  return Array.from(new Map(references.map((reference) => [reference.claimId, reference])).values());
}

function replacementForTask(
  taskId: string,
  currentToolId: string | null,
  dataSensitivity: StackAuditItemInput['dataSensitivity'],
  evidence: DecisionEvidenceBundle,
  toolNames: Record<string, string>,
): DecisionCandidateEvaluation | null {
  const candidates = buildDecisionCandidates(evidence, taskId, toolNames);
  const result = runDecisionRules({
    taskId,
    candidates,
    constraints: { dataSensitivity: dataSensitivity || 'low' },
  });
  return (
    result.evaluations
      .filter((candidate) => candidate.toolId !== currentToolId && candidate.state === 'eligible')
      .sort((left, right) => {
        const order = { strong: 0, conditional: 1, weak: 2, not_fit: 3 };
        return order[left.fitLevel] - order[right.fitLevel] || left.toolId.localeCompare(right.toolId);
      })[0] || null
  );
}

function evidenceForCandidate(
  toolId: string,
  taskId: string,
  evidence: DecisionEvidenceBundle,
): DecisionEvidenceReference[] {
  const profile = evidence.profiles.find((value) => value.toolId === toolId);
  const fit = evidence.taskFits.find((value) => value.toolId === toolId && value.taskId === taskId);
  return uniqueEvidence([...(profile?.evidence || []), ...(fit?.evidence || [])]);
}

function monthlySavings(item: StackAuditItemInput, candidate: DecisionCandidateEvaluation | null) {
  const candidateCost = candidate?.normalizedCost?.monthlyEquivalent;
  if (
    item.monthlyCost === null ||
    candidateCost === null ||
    candidateCost === undefined ||
    candidate?.normalizedCost?.currency !== item.currency
  ) {
    return null;
  }
  return Math.max(0, Math.round((item.monthlyCost - candidateCost) * 100) / 100);
}

export function buildStackAuditFindings(input: {
  items: StackAuditItemInput[];
  targetTaskIds: string[];
  evidence: DecisionEvidenceBundle;
  toolNames: Record<string, string>;
}): StackAuditFindingDraft[] {
  const findings: StackAuditFindingDraft[] = [];

  for (const item of input.items) {
    const userSignals = [`subscription:${item.subscriptionStatus}`, `usage:${item.usageFrequency}`];
    const currentFit = item.toolId && item.taskId
      ? input.evidence.taskFits.find((fit) => fit.toolId === item.toolId && fit.taskId === item.taskId)
      : null;
    const currentEvidence = currentFit && item.toolId
      ? evidenceForCandidate(item.toolId, currentFit.taskId, input.evidence)
      : [];

    if (item.subscriptionStatus === 'cancelled' || item.usageFrequency === 'never') {
      findings.push({
        stackItemId: item.id,
        findingType: 'remove',
        relatedToolId: null,
        rationale: {
          rulesVersion: STACK_AUDIT_RULES_VERSION,
          reasonCodes: [item.subscriptionStatus === 'cancelled' ? 'already_cancelled' : 'never_used'],
          taskId: item.taskId,
          currentFit: currentFit?.fitLevel || null,
          currentToolTitle: item.title,
          relatedToolTitle: null,
          userSignals,
          actionBoundary: 'recommendation_only',
        },
        estimatedMonthlySavings: item.monthlyCost,
        currency: item.monthlyCost === null ? null : item.currency,
        confidenceState: 'supported',
        evidence: currentEvidence,
      });
      continue;
    }

    const shouldReviewRemoval = item.subscriptionStatus === 'paid' && item.usageFrequency === 'rarely';
    const needsReplacement = currentFit?.fitLevel === 'weak' || currentFit?.fitLevel === 'not_fit';
    if ((shouldReviewRemoval || needsReplacement) && item.taskId) {
      const candidate = replacementForTask(
        item.taskId,
        item.toolId,
        item.dataSensitivity,
        input.evidence,
        input.toolNames,
      );
      if (candidate) {
        findings.push({
          stackItemId: item.id,
          findingType: 'replace',
          relatedToolId: candidate.toolId,
          rationale: {
            rulesVersion: STACK_AUDIT_RULES_VERSION,
            reasonCodes: [shouldReviewRemoval ? 'paid_but_rarely_used' : `current_fit_${currentFit?.fitLevel}`],
            taskId: item.taskId,
            currentFit: currentFit?.fitLevel || null,
            currentToolTitle: item.title,
            relatedToolTitle: input.toolNames[candidate.toolId] || candidate.toolName,
            userSignals,
            actionBoundary: 'recommendation_only',
          },
          estimatedMonthlySavings: monthlySavings(item, candidate),
          currency: item.monthlyCost === null ? null : item.currency,
          confidenceState: candidate.evidenceClaimIds.length > 0 ? 'supported' : 'partial',
          evidence: evidenceForCandidate(candidate.toolId, item.taskId, input.evidence),
        });
        continue;
      }
    }

    findings.push({
      stackItemId: item.id,
      findingType: shouldReviewRemoval ? 'remove' : 'keep',
      relatedToolId: null,
      rationale: {
        rulesVersion: STACK_AUDIT_RULES_VERSION,
        reasonCodes: shouldReviewRemoval
          ? ['paid_but_rarely_used', 'no_supported_replacement']
          : currentFit
            ? [`current_fit_${currentFit.fitLevel}`]
            : ['task_or_verified_fit_missing'],
        taskId: item.taskId,
        currentFit: currentFit?.fitLevel || null,
        currentToolTitle: item.title,
        relatedToolTitle: null,
        userSignals,
        actionBoundary: 'recommendation_only',
      },
      estimatedMonthlySavings: shouldReviewRemoval ? item.monthlyCost : null,
      currency: shouldReviewRemoval && item.monthlyCost !== null ? item.currency : null,
      confidenceState: shouldReviewRemoval ? 'partial' : currentFit?.evidenceState === 'supported' ? 'supported' : 'unknown',
      evidence: currentEvidence,
    });
  }

  const coveredTasks = new Set(
    input.items
      .filter((item) => item.subscriptionStatus !== 'cancelled' && item.usageFrequency !== 'never')
      .map((item) => item.taskId)
      .filter((taskId): taskId is string => Boolean(taskId)),
  );
  for (const taskId of Array.from(new Set(input.targetTaskIds)).sort()) {
    if (coveredTasks.has(taskId)) continue;
    const candidate = replacementForTask(taskId, null, 'low', input.evidence, input.toolNames);
    if (!candidate) continue;
    findings.push({
      stackItemId: null,
      findingType: 'missing',
      relatedToolId: candidate.toolId,
      rationale: {
        rulesVersion: STACK_AUDIT_RULES_VERSION,
        reasonCodes: ['selected_task_not_covered'],
        taskId,
        currentFit: null,
        currentToolTitle: null,
        relatedToolTitle: input.toolNames[candidate.toolId] || candidate.toolName,
        userSignals: [],
        actionBoundary: 'recommendation_only',
      },
      estimatedMonthlySavings: null,
      currency: null,
      confidenceState: candidate.evidenceClaimIds.length > 0 ? 'supported' : 'partial',
      evidence: evidenceForCandidate(candidate.toolId, taskId, input.evidence),
    });
  }

  return findings;
}
