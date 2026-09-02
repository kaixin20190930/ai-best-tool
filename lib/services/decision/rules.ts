import {
  getSupportingDecisionEvidence,
  type DecisionEvidenceBundle,
  type DecisionEvidenceReference,
  type DerivedToolDecisionProfile,
  type DerivedToolTaskFit,
} from './evidence';

export const DECISION_RULES_VERSION = 'decision-v1';

export interface DecisionFinderConstraints {
  roleKey?: string | null;
  teamSizeBand?: 'solo' | '2_10' | '11_50' | '51_plus' | 'unknown';
  budgetMax?: number | null;
  budgetPeriod?: 'month' | 'year' | 'one_time' | null;
  currency?: string;
  integrationKeys?: string[];
  dataSensitivity?: 'low' | 'medium' | 'high' | 'regulated';
  selfHostRequired?: boolean;
  exportRequired?: boolean;
}

export interface DecisionCandidateInput {
  toolId: string;
  toolName: string;
  profile: DerivedToolDecisionProfile;
  fit: DerivedToolTaskFit;
}

export type DecisionRecommendationRole = 'best_fit' | 'lower_cost' | 'privacy_control';
export type DecisionEvaluationState = 'eligible' | 'excluded' | 'needs_verification';

export interface NormalizedCost {
  amount: number;
  currency: string;
  period: 'month' | 'year' | 'one_time';
  monthlyEquivalent: number | null;
  originalText: string | null;
  claimId: string;
}

export interface DecisionCandidateEvaluation {
  toolId: string;
  toolName: string;
  state: DecisionEvaluationState;
  fitLevel: DerivedToolTaskFit['fitLevel'];
  matchedConditions: string[];
  unresolvedUnknowns: string[];
  disqualifiers: string[];
  disqualifiersChecked: string[];
  evidenceClaimIds: string[];
  normalizedCost: NormalizedCost | null;
  privacyControl: {
    dataTrainingUse: DerivedToolDecisionProfile['dataTrainingUse'] | 'unverified';
    selfHostLevel: DerivedToolDecisionProfile['selfHostLevel'] | 'unverified';
    exportLevel: DerivedToolDecisionProfile['exportLevel'] | 'unverified';
  };
  setupMinutesHigh: number | null;
}

export interface DecisionRecommendation {
  role: DecisionRecommendationRole;
  rankOrder: number;
  toolId: string;
  toolName: string;
  matchedConditions: string[];
  unresolvedUnknowns: string[];
  disqualifiersChecked: string[];
  evidenceClaimIds: string[];
  normalizedCost: NormalizedCost | null;
}

export interface DecisionRuleResult {
  rulesVersion: typeof DECISION_RULES_VERSION;
  taskId: string;
  recommendations: DecisionRecommendation[];
  evaluations: DecisionCandidateEvaluation[];
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean))).sort();
}

function normalizedString(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function parseAmount(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) return value;
  if (typeof value !== 'string') return null;
  const match = value.replace(/,/g, '').match(/(?:^|[^\d])(\d+(?:\.\d+)?)/);
  if (!match) return null;
  const amount = Number(match[1]);
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
}

function parsePeriod(value: unknown, text: string): NormalizedCost['period'] | null {
  const normalized = `${normalizedString(value)} ${text.toLowerCase()}`;
  if (/one[_ -]?time|lifetime/.test(normalized)) return 'one_time';
  if (/year|annual|\/yr|\/y\b/.test(normalized)) return 'year';
  if (/month|monthly|\/mo|\/m\b/.test(normalized)) return 'month';
  return null;
}

function parseCurrency(value: unknown, text: string): string {
  const normalized = normalizedString(value).toUpperCase();
  if (/^[A-Z]{3}$/.test(normalized)) return normalized;
  if (text.includes('€')) return 'EUR';
  if (text.includes('£')) return 'GBP';
  return 'USD';
}

export function normalizeVerifiedCost(evidence: DecisionEvidenceReference[]): NormalizedCost | null {
  const candidates = getSupportingDecisionEvidence(evidence, 'cost').flatMap((reference) => {
    const value = reference.claimValue;
    const record =
      value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
    const text = [record.priceText, record.price_text, record.display, typeof value === 'string' ? value : '']
      .filter((part): part is string => typeof part === 'string')
      .join(' ');
    const amount = parseAmount(record.price ?? record.amount ?? record.value ?? (text || value));
    const period = parsePeriod(record.interval ?? record.period ?? record.billingPeriod, text);
    if (amount === null || !period) return [];
    const currency = parseCurrency(record.currency, text);
    return [
      {
        amount,
        currency,
        period,
        monthlyEquivalent: period === 'month' ? amount : period === 'year' ? amount / 12 : null,
        originalText: text || null,
        claimId: reference.claimId,
      } satisfies NormalizedCost,
    ];
  });

  return (
    candidates.sort((left, right) => {
      const leftComparable = left.monthlyEquivalent ?? Number.POSITIVE_INFINITY;
      const rightComparable = right.monthlyEquivalent ?? Number.POSITIVE_INFINITY;
      return leftComparable - rightComparable || left.claimId.localeCompare(right.claimId);
    })[0] || null
  );
}

function monthlyBudget(constraints: DecisionFinderConstraints): number | null {
  if (constraints.budgetMax === null || constraints.budgetMax === undefined) return null;
  if (!Number.isFinite(constraints.budgetMax) || constraints.budgetMax < 0) return null;
  if (constraints.budgetPeriod === 'year') return constraints.budgetMax / 12;
  if (!constraints.budgetPeriod || constraints.budgetPeriod === 'month') return constraints.budgetMax;
  return null;
}

function verifiedProfileValue<T>(
  profile: DerivedToolDecisionProfile,
  purpose: 'privacy' | 'export' | 'setup',
  value: T,
): T | 'unverified' {
  return getSupportingDecisionEvidence(profile.evidence, purpose).length > 0 ? value : 'unverified';
}

function integrationValues(profile: DerivedToolDecisionProfile): string[] {
  return getSupportingDecisionEvidence(profile.evidence, 'fit')
    .filter((reference) => reference.claimType === 'integration')
    .flatMap((reference) => {
      const value = reference.claimValue;
      if (typeof value === 'string') return [normalizedString(value)];
      if (Array.isArray(value)) return value.map(normalizedString).filter(Boolean);
      if (value && typeof value === 'object') {
        const record = value as Record<string, unknown>;
        return [normalizedString(record.name || record.integration || record.key)].filter(Boolean);
      }
      return [];
    });
}

type StructuredConditionResult = { field: string; matched: boolean | null };

function evaluateStructuredCondition(
  value: unknown,
  constraints: DecisionFinderConstraints,
): StructuredConditionResult | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const condition = value as Record<string, unknown>;
  const field = normalizedString(condition.field || condition.key);
  if (!field) return null;
  const operator = normalizedString(condition.operator || 'eq');
  const expected = condition.value;

  const actualByField: Record<string, unknown> = {
    role_key: constraints.roleKey,
    team_size_band: constraints.teamSizeBand,
    data_sensitivity: constraints.dataSensitivity,
    self_host_required: constraints.selfHostRequired,
    export_required: constraints.exportRequired,
    integration_keys: constraints.integrationKeys,
  };
  const actual = actualByField[field];
  if (actual === null || actual === undefined || actual === 'unknown') return { field, matched: null };

  const normalizedActual = typeof actual === 'string' ? normalizedString(actual) : actual;
  const normalizedExpected = typeof expected === 'string' ? normalizedString(expected) : expected;
  const expectedList = Array.isArray(expected)
    ? expected.map((item) => (typeof item === 'string' ? normalizedString(item) : item))
    : [normalizedExpected];

  if (operator === 'eq') return { field, matched: normalizedActual === normalizedExpected };
  if (operator === 'neq') return { field, matched: normalizedActual !== normalizedExpected };
  if (operator === 'in') return { field, matched: expectedList.includes(normalizedActual) };
  if (operator === 'not_in') return { field, matched: !expectedList.includes(normalizedActual) };
  if (operator === 'includes') {
    const actualList = Array.isArray(actual)
      ? actual.map((item) => (typeof item === 'string' ? normalizedString(item) : item))
      : [];
    return { field, matched: expectedList.every((item) => actualList.includes(item)) };
  }

  return { field, matched: null };
}

function evaluateCandidate(
  candidate: DecisionCandidateInput,
  taskId: string,
  constraints: DecisionFinderConstraints,
): DecisionCandidateEvaluation {
  const matchedConditions: string[] = [];
  const unresolvedUnknowns: string[] = [];
  const disqualifiers: string[] = [];
  const disqualifiersChecked: string[] = ['task_fit'];
  const evidenceClaimIds = candidate.fit.evidence.map((reference) => reference.claimId);
  const normalizedCost = normalizeVerifiedCost(candidate.profile.evidence);
  const dataTrainingUse = verifiedProfileValue(candidate.profile, 'privacy', candidate.profile.dataTrainingUse);
  const selfHostLevel = verifiedProfileValue(candidate.profile, 'privacy', candidate.profile.selfHostLevel);
  const exportLevel = verifiedProfileValue(candidate.profile, 'export', candidate.profile.exportLevel);
  const setupMinutesHigh =
    verifiedProfileValue(candidate.profile, 'setup', candidate.profile.setupMinutesHigh) === 'unverified'
      ? null
      : candidate.profile.setupMinutesHigh;

  evidenceClaimIds.push(...candidate.profile.evidence.map((reference) => reference.claimId));

  if (candidate.fit.taskId !== taskId) disqualifiers.push('task_fit_mismatch');
  if (candidate.profile.evidenceState !== 'supported') unresolvedUnknowns.push('decision_profile_needs_review');
  if (candidate.fit.evidenceState !== 'supported') unresolvedUnknowns.push('task_fit_needs_review');
  if (candidate.fit.fitLevel === 'not_fit') disqualifiers.push('task_marked_not_fit');
  else matchedConditions.push(`task_fit:${candidate.fit.fitLevel}`);

  if (constraints.selfHostRequired) {
    disqualifiersChecked.push('self_host_required');
    if (selfHostLevel === 'unverified' || selfHostLevel === 'unknown') {
      unresolvedUnknowns.push('self_hosting_unknown');
    } else if (selfHostLevel !== 'full') {
      disqualifiers.push('self_hosting_requirement_not_met');
    } else {
      matchedConditions.push('self_hosting_verified');
    }
  }

  if (constraints.exportRequired) {
    disqualifiersChecked.push('export_required');
    if (exportLevel === 'unverified' || exportLevel === 'unknown') {
      unresolvedUnknowns.push('export_capability_unknown');
    } else if (exportLevel !== 'full') {
      disqualifiers.push('export_requirement_not_met');
    } else {
      matchedConditions.push('full_export_verified');
    }
  }

  if (constraints.dataSensitivity === 'high' || constraints.dataSensitivity === 'regulated') {
    disqualifiersChecked.push('sensitive_data_training');
    if (dataTrainingUse === 'unverified' || dataTrainingUse === 'unknown') {
      unresolvedUnknowns.push('data_training_policy_unknown');
    } else if (dataTrainingUse === 'yes') {
      disqualifiers.push('data_training_conflicts_with_sensitivity');
    } else if (dataTrainingUse === 'opt_out') {
      unresolvedUnknowns.push('data_training_requires_opt_out');
    } else {
      matchedConditions.push('data_training_policy_compatible');
    }
  }

  const requiredIntegrations = unique((constraints.integrationKeys || []).map(normalizedString));
  if (requiredIntegrations.length > 0) {
    disqualifiersChecked.push('required_integrations');
    const integrations = new Set(integrationValues(candidate.profile));
    const missing = requiredIntegrations.filter((integration) => !integrations.has(integration));
    if (missing.length > 0)
      unresolvedUnknowns.push(...missing.map((integration) => `integration_unknown:${integration}`));
    else matchedConditions.push('required_integrations_verified');
  }

  const budget = monthlyBudget(constraints);
  if (constraints.budgetMax !== null && constraints.budgetMax !== undefined) {
    disqualifiersChecked.push('budget');
    const expectedCurrency = (constraints.currency || 'USD').toUpperCase();
    if (constraints.budgetPeriod === 'one_time') {
      if (normalizedCost?.period !== 'one_time') unresolvedUnknowns.push('one_time_cost_unknown');
      else if (normalizedCost.currency !== expectedCurrency) unresolvedUnknowns.push('currency_conversion_required');
      else if (normalizedCost.amount > constraints.budgetMax) disqualifiers.push('over_budget');
      else matchedConditions.push('within_budget');
    } else if (normalizedCost?.monthlyEquivalent === null || normalizedCost === null || budget === null) {
      unresolvedUnknowns.push('monthly_cost_unknown');
    } else if (normalizedCost.currency !== expectedCurrency) {
      unresolvedUnknowns.push('currency_conversion_required');
    } else if (normalizedCost.monthlyEquivalent > budget) {
      disqualifiers.push('over_budget');
    } else {
      matchedConditions.push('within_budget');
    }
  }

  for (const condition of candidate.fit.requiredConditions) {
    const result = evaluateStructuredCondition(condition, constraints);
    if (!result) continue;
    disqualifiersChecked.push(`required_condition:${result.field}`);
    if (result.matched === true) matchedConditions.push(`required_condition_met:${result.field}`);
    else if (result.matched === false) disqualifiers.push(`required_condition_not_met:${result.field}`);
    else unresolvedUnknowns.push(`required_condition_unknown:${result.field}`);
  }

  for (const condition of candidate.fit.disqualifiers) {
    const result = evaluateStructuredCondition(condition, constraints);
    if (!result) continue;
    disqualifiersChecked.push(`disqualifier:${result.field}`);
    if (result.matched === true) disqualifiers.push(`disqualifier_matched:${result.field}`);
    else if (result.matched === null) unresolvedUnknowns.push(`disqualifier_unknown:${result.field}`);
  }

  let state: DecisionEvaluationState = 'eligible';
  if (disqualifiers.length > 0) state = 'excluded';
  else if (unresolvedUnknowns.length > 0) state = 'needs_verification';

  return {
    toolId: candidate.toolId,
    toolName: candidate.toolName,
    state,
    fitLevel: candidate.fit.fitLevel,
    matchedConditions: unique(matchedConditions),
    unresolvedUnknowns: unique(unresolvedUnknowns),
    disqualifiers: unique(disqualifiers),
    disqualifiersChecked: unique(disqualifiersChecked),
    evidenceClaimIds: unique(evidenceClaimIds),
    normalizedCost,
    privacyControl: { dataTrainingUse, selfHostLevel, exportLevel },
    setupMinutesHigh,
  };
}

const fitOrder: Record<DerivedToolTaskFit['fitLevel'], number> = {
  strong: 0,
  conditional: 1,
  weak: 2,
  not_fit: 3,
};

function compareBestFit(left: DecisionCandidateEvaluation, right: DecisionCandidateEvaluation): number {
  return (
    fitOrder[left.fitLevel] - fitOrder[right.fitLevel] ||
    left.unresolvedUnknowns.length - right.unresolvedUnknowns.length ||
    (left.setupMinutesHigh ?? Number.POSITIVE_INFINITY) - (right.setupMinutesHigh ?? Number.POSITIVE_INFINITY) ||
    left.toolId.localeCompare(right.toolId)
  );
}

function privacyOrder(value: DecisionCandidateEvaluation): [number, number, number, string] {
  const selfHost = { full: 0, partial: 1, no: 2, unknown: 3, unverified: 4 }[value.privacyControl.selfHostLevel];
  const training = { no: 0, opt_in: 1, opt_out: 2, yes: 3, unknown: 4, unverified: 5 }[
    value.privacyControl.dataTrainingUse
  ];
  const exportRank = { full: 0, limited: 1, no: 2, unknown: 3, unverified: 4 }[value.privacyControl.exportLevel];
  return [selfHost, training, exportRank, value.toolId];
}

function comparePrivacy(left: DecisionCandidateEvaluation, right: DecisionCandidateEvaluation): number {
  const a = privacyOrder(left);
  const b = privacyOrder(right);
  return a[0] - b[0] || a[1] - b[1] || a[2] - b[2] || a[3].localeCompare(b[3]);
}

function toRecommendation(
  evaluation: DecisionCandidateEvaluation,
  role: DecisionRecommendationRole,
  rankOrder: number,
): DecisionRecommendation {
  return {
    role,
    rankOrder,
    toolId: evaluation.toolId,
    toolName: evaluation.toolName,
    matchedConditions: evaluation.matchedConditions,
    unresolvedUnknowns: evaluation.unresolvedUnknowns,
    disqualifiersChecked: evaluation.disqualifiersChecked,
    evidenceClaimIds: evaluation.evidenceClaimIds,
    normalizedCost: evaluation.normalizedCost,
  };
}

export function runDecisionRules(input: {
  taskId: string;
  candidates: DecisionCandidateInput[];
  constraints?: DecisionFinderConstraints;
}): DecisionRuleResult {
  const constraints = input.constraints || {};
  const evaluations = input.candidates
    .map((candidate) => evaluateCandidate(candidate, input.taskId, constraints))
    .sort((left, right) => left.toolId.localeCompare(right.toolId));
  const eligible = evaluations.filter((evaluation) => evaluation.state === 'eligible');
  const selected = new Set<string>();
  const recommendations: DecisionRecommendation[] = [];

  const bestFit = eligible.slice().sort(compareBestFit)[0];
  if (bestFit) {
    selected.add(bestFit.toolId);
    recommendations.push(toRecommendation(bestFit, 'best_fit', recommendations.length + 1));
  }

  const lowerCost = eligible
    .filter(
      (evaluation) =>
        !selected.has(evaluation.toolId) && typeof evaluation.normalizedCost?.monthlyEquivalent === 'number',
    )
    .sort((left, right) => {
      const costDifference =
        (left.normalizedCost?.monthlyEquivalent ?? Number.POSITIVE_INFINITY) -
        (right.normalizedCost?.monthlyEquivalent ?? Number.POSITIVE_INFINITY);
      return costDifference || compareBestFit(left, right);
    })[0];
  if (lowerCost) {
    selected.add(lowerCost.toolId);
    recommendations.push(toRecommendation(lowerCost, 'lower_cost', recommendations.length + 1));
  }

  const privacyControl = eligible
    .filter(
      (evaluation) =>
        !selected.has(evaluation.toolId) &&
        (evaluation.privacyControl.selfHostLevel !== 'unverified' ||
          evaluation.privacyControl.dataTrainingUse !== 'unverified'),
    )
    .sort(comparePrivacy)[0];
  if (privacyControl) {
    recommendations.push(toRecommendation(privacyControl, 'privacy_control', recommendations.length + 1));
  }

  return {
    rulesVersion: DECISION_RULES_VERSION,
    taskId: input.taskId,
    recommendations,
    evaluations,
  };
}

export function buildDecisionCandidates(
  bundle: DecisionEvidenceBundle,
  taskId: string,
  toolNames: Record<string, string>,
): DecisionCandidateInput[] {
  const profilesByTool = new Map(bundle.profiles.map((profile) => [profile.toolId, profile]));
  return bundle.taskFits.flatMap((fit) => {
    if (fit.taskId !== taskId) return [];
    const profile = profilesByTool.get(fit.toolId);
    if (!profile) return [];
    return [{ toolId: fit.toolId, toolName: toolNames[fit.toolId] || fit.toolId, profile, fit }];
  });
}
