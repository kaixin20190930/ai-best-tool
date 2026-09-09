export type EditorialReviewKey = 'explore' | 'best-index' | 'best-topic-template';

type EditorialReviewRecord = {
  reviewedAt: `${number}-${number}-${number}`;
  scope: string;
  evidence: string;
};

// These dates move only after a real editorial review. Never derive them from build or request time.
export const EDITORIAL_REVIEW_RECORDS: Record<EditorialReviewKey, EditorialReviewRecord> = {
  explore: {
    reviewedAt: '2026-09-09',
    scope: 'Explore filters, task entry points, directory counts, indexing language, and next-step navigation.',
    evidence: 'CTR-DIFF-05 core-entry review recorded in docs/CTR_DIFFERENTIATION_REVIEW_2026-09-09_CN.md.',
  },
  'best-index': {
    reviewedAt: '2026-09-09',
    scope: 'Best hub topic inventory, decision path, user-facing labels, and links to narrower comparison surfaces.',
    evidence: 'CTR-DIFF-05 core-entry review recorded in docs/CTR_DIFFERENTIATION_REVIEW_2026-09-09_CN.md.',
  },
  'best-topic-template': {
    reviewedAt: '2026-09-09',
    scope: 'Shared Best topic template, ranking explanation, tool eligibility, decision path, and user-facing copy.',
    evidence: 'CTR-DIFF-05 template review; this date does not claim that every listed tool fact was reverified.',
  },
};

export function getEditorialReviewRecord(key: EditorialReviewKey): EditorialReviewRecord {
  return EDITORIAL_REVIEW_RECORDS[key];
}
