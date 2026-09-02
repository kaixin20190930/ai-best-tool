import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import type { DecisionEvidenceReference } from '@/lib/services/decision/evidence';
import {
  DECISION_RULES_VERSION,
  normalizeVerifiedCost,
  runDecisionRules,
  type DecisionCandidateInput,
} from '@/lib/services/decision/rules';

const evidence = (
  claimId: string,
  purpose: DecisionEvidenceReference['purpose'],
  claimType: string,
  claimValue: unknown,
): DecisionEvidenceReference => ({
  claimId,
  purpose,
  claimType,
  claimKey: `${claimType}:${claimId}`,
  claimValue,
  sourceUrl: `https://example.com/${claimId}`,
  sourceExcerpt: 'Verified fixture evidence.',
  observedAt: '2026-09-01T00:00:00.000Z',
  verifiedAt: '2026-09-01T01:00:00.000Z',
  reviewDueAt: '2026-10-01T00:00:00.000Z',
  expiresAt: null,
  validityScope: {},
  canSupportDecision: true,
  exclusionReason: null,
});

const candidate = (
  toolId: string,
  overrides: Partial<{
    fitLevel: DecisionCandidateInput['fit']['fitLevel'];
    selfHostLevel: DecisionCandidateInput['profile']['selfHostLevel'];
    exportLevel: DecisionCandidateInput['profile']['exportLevel'];
    dataTrainingUse: DecisionCandidateInput['profile']['dataTrainingUse'];
    profileState: DecisionCandidateInput['profile']['evidenceState'];
    fitState: DecisionCandidateInput['fit']['evidenceState'];
    cost: number;
    costPeriod: 'month' | 'year';
    privacyVerified: boolean;
  }> = {},
): DecisionCandidateInput => {
  const profileEvidence = [
    evidence(`cost-${toolId}`, 'cost', 'pricing_plan', {
      price: overrides.cost ?? 19,
      interval: overrides.costPeriod ?? 'month',
      currency: 'USD',
    }),
    evidence(`setup-${toolId}`, 'setup', 'feature', { setupMinutes: 15 }),
  ];
  if (overrides.privacyVerified !== false) {
    profileEvidence.push(evidence(`privacy-${toolId}`, 'privacy', 'security_claim', { reviewed: true }));
    profileEvidence.push(evidence(`export-${toolId}`, 'export', 'export_limit', { level: 'full' }));
  }

  return {
    toolId,
    toolName: `Tool ${toolId}`,
    profile: {
      toolId,
      profileVersion: 1,
      setupComplexity: 'low',
      setupMinutesLow: 5,
      setupMinutesHigh: 15,
      dataTrainingUse: overrides.dataTrainingUse ?? 'no',
      selfHostLevel: overrides.selfHostLevel ?? 'full',
      exportLevel: overrides.exportLevel ?? 'full',
      decisionSummary: {},
      watchOuts: [],
      reviewedAt: '2026-09-01T00:00:00.000Z',
      reviewDueAt: '2026-10-01T00:00:00.000Z',
      evidenceState: overrides.profileState ?? 'supported',
      evidence: profileEvidence,
      excludedEvidence: [],
    },
    fit: {
      id: `fit-${toolId}`,
      toolId,
      taskId: 'task-writing',
      fitLevel: overrides.fitLevel ?? 'strong',
      rationale: {},
      requiredConditions: [],
      disqualifiers: [],
      reviewedAt: '2026-09-01T00:00:00.000Z',
      reviewDueAt: '2026-10-01T00:00:00.000Z',
      evidenceState: overrides.fitState ?? 'supported',
      evidence: [evidence(`fit-${toolId}`, 'fit', 'use_case', 'Writing')],
      excludedEvidence: [],
    },
  };
};

const noSelfHost = runDecisionRules({
  taskId: 'task-writing',
  candidates: [candidate('a', { selfHostLevel: 'no' })],
  constraints: { selfHostRequired: true },
});
assert.equal(noSelfHost.recommendations.length, 0, 'RULE-01: verified no self-host must be excluded');
assert.deepEqual(noSelfHost.evaluations[0]?.disqualifiers, ['self_hosting_requirement_not_met']);

const unknownSelfHost = runDecisionRules({
  taskId: 'task-writing',
  candidates: [candidate('a', { privacyVerified: false, selfHostLevel: 'unknown' })],
  constraints: { selfHostRequired: true },
});
assert.equal(unknownSelfHost.recommendations.length, 0, 'RULE-02: unknown self-host must not be affirmative');
assert.equal(unknownSelfHost.evaluations[0]?.state, 'needs_verification');

const overBudget = runDecisionRules({
  taskId: 'task-writing',
  candidates: [candidate('a', { cost: 30 })],
  constraints: { budgetMax: 20, budgetPeriod: 'month', currency: 'USD' },
});
assert.equal(overBudget.recommendations.length, 0, 'RULE-03: verified over-budget tool must be excluded');
assert.deepEqual(overBudget.evaluations[0]?.disqualifiers, ['over_budget']);

const costEvidence = evidence('cost-annual', 'cost', 'pricing_plan', {
  price: 120,
  interval: 'year',
  currency: 'USD',
});
assert.equal(normalizeVerifiedCost([costEvidence])?.monthlyEquivalent, 10, 'RULE-10: annual cost is divided by 12');
assert.equal(
  normalizeVerifiedCost([
    evidence('cost-text', 'cost', 'pricing_plan', { priceText: '$24/mo', currency: 'USD', interval: 'month' }),
  ])?.monthlyEquivalent,
  24,
  'RULE-10: published price text remains parseable when no numeric field is present',
);

const staleCostCandidate = candidate('stale-cost');
staleCostCandidate.profile.evidence = staleCostCandidate.profile.evidence.filter(
  (reference) => reference.purpose !== 'cost',
);
staleCostCandidate.profile.excludedEvidence = [
  { ...costEvidence, canSupportDecision: false, exclusionReason: 'expired' },
];
const staleCost = runDecisionRules({
  taskId: 'task-writing',
  candidates: [staleCostCandidate],
  constraints: { budgetMax: 20, budgetPeriod: 'month' },
});
assert.equal(staleCost.evaluations[0]?.state, 'needs_verification', 'RULE-04: stale price cannot drive budget');

const deterministicInput = {
  taskId: 'task-writing',
  candidates: [candidate('b', { cost: 10 }), candidate('a', { cost: 20 }), candidate('c', { cost: 30 })],
};
const first = runDecisionRules(deterministicInput);
const second = runDecisionRules({ ...deterministicInput, candidates: deterministicInput.candidates.slice().reverse() });
assert.deepEqual(first, second, 'RULE-05: input order must not affect the same rules version');
assert.equal(first.rulesVersion, DECISION_RULES_VERSION);
assert.ok(first.recommendations.length <= 3);
assert.equal(new Set(first.recommendations.map((item) => item.toolId)).size, first.recommendations.length);

const oneCandidate = runDecisionRules({ taskId: 'task-writing', candidates: [candidate('only')] });
assert.equal(oneCandidate.recommendations.length, 1, 'RULE-06: weak filler tools must not be invented');

const commercialNoise = candidate('paid');
const commercialBaseline = runDecisionRules({
  taskId: 'task-writing',
  candidates: [commercialNoise, candidate('organic')],
});
(commercialNoise as DecisionCandidateInput & { featured?: boolean }).featured = true;
assert.deepEqual(
  runDecisionRules({ taskId: 'task-writing', candidates: [commercialNoise, candidate('organic')] }),
  commercialBaseline,
  'RULE-07: unknown commercial fields cannot alter deterministic output',
);

const notFit = runDecisionRules({
  taskId: 'task-writing',
  candidates: [candidate('not-fit', { fitLevel: 'not_fit' })],
});
assert.equal(notFit.evaluations[0]?.state, 'excluded');

const staleFit = runDecisionRules({
  taskId: 'task-writing',
  candidates: [candidate('stale-fit', { fitState: 'review_due' })],
});
assert.equal(staleFit.recommendations.length, 0, 'RULE-09: stale fit must not generate an absolute recommendation');

const wrongTask = runDecisionRules({ taskId: 'task-research', candidates: [candidate('wrong-task')] });
assert.equal(wrongTask.recommendations.length, 0, 'a fit from another task must never enter recommendations');
assert.deepEqual(wrongTask.evaluations[0]?.disqualifiers, ['task_fit_mismatch']);

const conditioned = candidate('conditioned');
conditioned.fit.requiredConditions = [{ field: 'team_size_band', operator: 'in', value: ['2_10', '11_50'] }];
conditioned.fit.disqualifiers = [{ field: 'data_sensitivity', operator: 'eq', value: 'regulated' }];
const conditionsMet = runDecisionRules({
  taskId: 'task-writing',
  candidates: [conditioned],
  constraints: { teamSizeBand: '2_10', dataSensitivity: 'low' },
});
assert.equal(conditionsMet.recommendations.length, 1, 'structured required conditions should be evaluated');
const conditionBlocked = runDecisionRules({
  taskId: 'task-writing',
  candidates: [conditioned],
  constraints: { teamSizeBand: 'solo', dataSensitivity: 'regulated' },
});
assert.deepEqual(conditionBlocked.evaluations[0]?.disqualifiers, [
  'disqualifier_matched:data_sensitivity',
  'required_condition_not_met:team_size_band',
]);

const migration = readFileSync(
  resolve(process.cwd(), 'db/supabase/migrations/20260902_decision_finder_foundation.sql'),
  'utf8',
);
assert.equal(
  migration.includes('tool_relationships_different_tools CHECK (tool_id <> related_tool_id)'),
  true,
  'RULE-08: relationship self-loops must be rejected by the data layer',
);

console.log(
  JSON.stringify(
    {
      success: true,
      rulesVersion: DECISION_RULES_VERSION,
      deterministic: true,
      hardConstraintsFirst: true,
      unknownsNotAffirmed: true,
      maximumRecommendations: 3,
    },
    null,
    2,
  ),
);
