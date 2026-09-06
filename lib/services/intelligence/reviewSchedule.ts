export type IntelligenceReviewType = 'fact' | 'decision';
export type IntelligenceReviewState = 'overdue' | 'due_soon' | 'scheduled' | 'unscheduled';

export function isIntelligenceReviewApplicable(reviewType: IntelligenceReviewType, ownerType: string): boolean {
  // Site and distribution profiles retain factual evidence, but they are not tool Decision Cards.
  return reviewType === 'fact' || ownerType === 'tool';
}

export interface IntelligenceReviewScheduleItem {
  reviewType: IntelligenceReviewType;
  cadenceDays: 30 | 90;
  basisAt: string | null;
  dueAt: string | null;
  daysUntilDue: number | null;
  state: IntelligenceReviewState;
}

export interface IntelligenceTimelineReviewBasis {
  reviewScope: 'fact' | 'decision' | 'full';
  occurredAt: string;
  verifiedAt?: string | null;
}

function validDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function getLatestTimelineReviewAt(
  events: IntelligenceTimelineReviewBasis[],
  reviewType: IntelligenceReviewType,
): string | null {
  const eligibleScopes = reviewType === 'fact' ? new Set(['fact', 'full']) : new Set(['decision', 'full']);
  const dates = events
    .filter((event) => eligibleScopes.has(event.reviewScope))
    .map((event) => validDate(event.occurredAt) || validDate(event.verifiedAt))
    .filter((date): date is Date => Boolean(date))
    .sort((left, right) => right.getTime() - left.getTime());

  return dates[0]?.toISOString() || null;
}

export function getLatestReviewAt(...values: Array<string | null | undefined>): string | null {
  const dates = values
    .map((value) => validDate(value))
    .filter((date): date is Date => Boolean(date))
    .sort((left, right) => right.getTime() - left.getTime());

  return dates[0]?.toISOString() || null;
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function buildItem(
  reviewType: IntelligenceReviewType,
  cadenceDays: 30 | 90,
  basisValue: string | null | undefined,
  explicitDueValue: string | null | undefined,
  now: Date,
): IntelligenceReviewScheduleItem {
  const basis = validDate(basisValue);
  const explicitDue = validDate(explicitDueValue);
  const due = explicitDue || (basis ? addDays(basis, cadenceDays) : null);
  const daysUntilDue = due ? Math.ceil((due.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)) : null;
  const state: IntelligenceReviewState =
    daysUntilDue === null
      ? 'unscheduled'
      : daysUntilDue <= 0
        ? 'overdue'
        : daysUntilDue <= 7
          ? 'due_soon'
          : 'scheduled';

  return {
    reviewType,
    cadenceDays,
    basisAt: basis?.toISOString() || null,
    dueAt: due?.toISOString() || null,
    daysUntilDue,
    state,
  };
}

export function buildIntelligenceReviewSchedule(input: {
  lastVerifiedAt: string | null;
  nextFactReviewAt?: string | null;
  lastDecisionReviewedAt?: string | null;
  nextDecisionReviewAt?: string | null;
  now?: Date;
}): IntelligenceReviewScheduleItem[] {
  const now = input.now || new Date();
  return [
    buildItem('fact', 30, input.lastVerifiedAt, input.nextFactReviewAt, now),
    buildItem('decision', 90, input.lastDecisionReviewedAt, input.nextDecisionReviewAt, now),
  ];
}
