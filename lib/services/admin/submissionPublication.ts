import { getPaidListingPublishGate } from '@/lib/services/toolQuality';

export const DEFAULT_SUBMISSION_REVIEW_SLA_HOURS = 120;

export function getSubmissionReviewSlaHours(features: unknown): number {
  const record = features && typeof features === 'object' ? features as Record<string, unknown> : {};
  const submission = record.submission && typeof record.submission === 'object'
    ? record.submission as Record<string, unknown> : {};
  const commercial = submission.commercial && typeof submission.commercial === 'object'
    ? submission.commercial as Record<string, unknown> : {};
  const value = commercial.targetReviewSlaHours;
  const hours = typeof value === 'number' || (typeof value === 'string' && /^[0-9]{1,3}$/.test(value))
    ? Number(value) : NaN;
  return Number.isInteger(hours) && hours >= 1 && hours <= 720
    ? hours : DEFAULT_SUBMISSION_REVIEW_SLA_HOURS;
}

export function getSubmissionOwnershipLabel(submittedBy: string | null, claimStatus: string | null): string {
  if (claimStatus === 'claimed') return 'Owner claimed';
  return submittedBy ? 'Submitter linked · Ownership unverified' : 'Ownership unverified';
}

export const submissionReviewSlaHoursSql = `CASE
  WHEN COALESCE(features->'submission'->'commercial'->>'targetReviewSlaHours', '') ~ '^[0-9]{1,3}$'
  THEN CASE
    WHEN (features->'submission'->'commercial'->>'targetReviewSlaHours')::int BETWEEN 1 AND 720
    THEN (features->'submission'->'commercial'->>'targetReviewSlaHours')::int
    ELSE ${DEFAULT_SUBMISSION_REVIEW_SLA_HOURS}
  END
  ELSE ${DEFAULT_SUBMISSION_REVIEW_SLA_HOURS}
END`;

type PublicationTool = Parameters<typeof getPaidListingPublishGate>[0] & {
  url?: string | null;
  features?: unknown;
};

export function isMonitorPaymentEligible(commercial: Record<string, unknown>): boolean {
  return commercial.plan !== 'standard_paid' || commercial.paymentConfirmed === true;
}

export function getMonitorPublicationBlockers(tool: PublicationTool): string[] {
  const blockers = [...getPaidListingPublishGate(tool).blockers];
  if (tool.pricing && !['free', 'freemium', 'paid'].includes(tool.pricing)) blockers.push('Pricing');
  if (tool.tags?.length && !tool.tags.some((tag) => typeof tag === 'string' && tag.trim())) blockers.push('Tags');
  try {
    const url = new URL(tool.url || '');
    if (!['http:', 'https:'].includes(url.protocol) || !url.hostname.includes('.')) {
      blockers.unshift('Website URL');
    }
  } catch {
    blockers.unshift('Website URL');
  }
  const features = tool.features && typeof tool.features === 'object'
    ? tool.features as Record<string, unknown> : {};
  const submission = features.submission && typeof features.submission === 'object'
    ? features.submission as Record<string, unknown> : {};
  const commercial = submission.commercial && typeof submission.commercial === 'object'
    ? submission.commercial as Record<string, unknown> : {};
  if (!isMonitorPaymentEligible(commercial)) {
    blockers.push('Priority review payment');
  }
  return blockers;
}

export function buildReadyDraftMonitorPublishSql(evidenceReadyDraftSql: string): string {
  return `
    UPDATE tools
    SET status = 'published',
        page_quality_status = 'monitor',
        next_review_date = CASE
          WHEN next_review_date > CURRENT_DATE THEN next_review_date
          ELSE CURRENT_DATE + 30
        END,
        features = COALESCE(features, '{}'::jsonb) || jsonb_build_object(
          'submission',
          COALESCE(features->'submission', '{}'::jsonb) || jsonb_build_object(
            'review',
            COALESCE(features->'submission'->'review', '{}'::jsonb) || jsonb_build_object(
              'approvedAt', NOW()::text,
              'reviewer', $2::text,
              'publishMode', 'monitor_noindex'
            )
          )
        ),
        updated_at = NOW()
    WHERE id::text = ANY($1::text[])
      AND ${evidenceReadyDraftSql}
      AND (
        COALESCE(features->'submission'->'commercial'->>'plan', 'free') <> 'standard_paid'
        OR features #> '{submission,commercial,paymentConfirmed}' = 'true'::jsonb
      )
    RETURNING name
  `;
}

export function getMonitorReviewDate(existing: string | null | undefined, proposed?: string | null): string {
  const today = new Date();
  const future = [existing, proposed].find((value) => value && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && new Date(`${value}T00:00:00Z`).getTime() > today.getTime());
  if (future) return future;
  today.setUTCDate(today.getUTCDate() + 30);
  return today.toISOString().slice(0, 10);
}

export function withMonitorPublicationReview(features: Record<string, unknown>, reviewer: string): Record<string, unknown> {
  const submission = features.submission && typeof features.submission === 'object'
    ? features.submission as Record<string, unknown> : {};
  const review = submission.review && typeof submission.review === 'object'
    ? submission.review as Record<string, unknown> : {};
  return {
    ...features,
    submission: {
      ...submission,
      review: { ...review, approvedAt: new Date().toISOString(), reviewer, publishMode: 'monitor_noindex' },
    },
  };
}
