export type CandidateIntakeDecision =
  | 'ready_for_draft'
  | 'needs_evidence'
  | 'duplicate'
  | 'rejected';

export type CandidateIntakePlan = {
  decision: CandidateIntakeDecision;
  decisionReason: string;
  evidenceUrls: string[];
  gaps: string[];
  officialUrl: string;
  plannedFor: string;
  reviewedAt: string;
};

export type CandidatePoolEntry = CandidateIntakePlan & {
  candidateUrl: string;
  categorySlug: string;
  compareAxes?: string[];
  detail?: string;
  imageUrl?: string;
  limitations?: string[];
  notIdealFor?: string[];
  pricingSnapshot?: string;
  summary: string;
  tags: string[];
  title: string;
  useCases: string[];
};

function recordValue(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? value.map(stringValue).filter(Boolean) : [];
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

export function getCandidateIntakePlan(
  payload: Record<string, unknown>
): CandidateIntakePlan | null {
  const plan = recordValue(payload.intakePlan);
  if (!plan) return null;

  const decision = stringValue(plan.decision) as CandidateIntakeDecision;
  const validDecisions: CandidateIntakeDecision[] = [
    'ready_for_draft',
    'needs_evidence',
    'duplicate',
    'rejected',
  ];

  if (!validDecisions.includes(decision)) return null;

  return {
    decision,
    decisionReason: stringValue(plan.decisionReason),
    evidenceUrls: stringList(plan.evidenceUrls),
    gaps: stringList(plan.gaps),
    officialUrl: stringValue(plan.officialUrl),
    plannedFor: stringValue(plan.plannedFor),
    reviewedAt: stringValue(plan.reviewedAt),
  };
}

export function isDifferentExistingTool(
  existingToolId: string | null | undefined,
  linkedToolId: string | null | undefined
): boolean {
  return Boolean(existingToolId && existingToolId !== linkedToolId);
}

export function validateThreeDayCandidatePool(entries: CandidatePoolEntry[]): string[] {
  const errors: string[] = [];

  if (entries.length < 3 || entries.length > 6) {
    errors.push('Candidate pool must contain between 3 and 6 entries.');
  }

  const candidateUrls = new Set<string>();
  const plannedDays = new Map<string, number>();

  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    const label = entry.title || `Entry ${index + 1}`;
    const day = entry.plannedFor.slice(0, 10);

    if (!entry.title.trim()) errors.push(`${label}: title is required.`);
    if (!isHttpUrl(entry.candidateUrl)) errors.push(`${label}: candidate URL is invalid.`);
    if (!isHttpUrl(entry.officialUrl)) errors.push(`${label}: official URL is invalid.`);
    if (!entry.decisionReason.trim()) errors.push(`${label}: decision reason is required.`);
    if (entry.evidenceUrls.length < 2 || entry.evidenceUrls.some((url) => !isHttpUrl(url))) {
      errors.push(`${label}: at least two valid evidence URLs are required.`);
    }
    if (entry.decision === 'needs_evidence' && entry.gaps.length === 0) {
      errors.push(`${label}: needs_evidence requires at least one explicit gap.`);
    }
    if (entry.decision === 'ready_for_draft') {
      if (!entry.imageUrl || !isHttpUrl(entry.imageUrl)) {
        errors.push(`${label}: ready_for_draft requires a valid image URL.`);
      }
      if (!entry.limitations?.length) {
        errors.push(`${label}: ready_for_draft requires explicit limitations.`);
      }
      if (!entry.notIdealFor?.length) {
        errors.push(`${label}: ready_for_draft requires explicit not-ideal evidence.`);
      }
      if (!entry.compareAxes?.length) {
        errors.push(`${label}: ready_for_draft requires comparison axes.`);
      }
      if (!entry.detail || entry.detail.trim().length < 160) {
        errors.push(`${label}: ready_for_draft requires at least 160 characters of verified detail.`);
      }
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
      errors.push(`${label}: plannedFor must begin with an ISO date.`);
    }

    const normalizedCandidateUrl = entry.candidateUrl.replace(/\/$/, '');
    if (candidateUrls.has(normalizedCandidateUrl)) {
      errors.push(`${label}: duplicate candidate URL.`);
    }
    candidateUrls.add(normalizedCandidateUrl);
    plannedDays.set(day, (plannedDays.get(day) || 0) + 1);
  }

  if (plannedDays.size !== 3) {
    errors.push('Candidate pool must cover exactly three planned days.');
  }

  for (const [day, count] of Array.from(plannedDays.entries())) {
    if (count < 1 || count > 2) {
      errors.push(`${day}: schedule must contain 1 or 2 candidates.`);
    }
  }

  return errors;
}
