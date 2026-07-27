import type { ContentPublishDecision, ContentQualityBreakdown, ContentQualityResult } from './types';

export const CONTENT_QUALITY_WEIGHTS = {
  evidence: 20,
  factualConsistency: 20,
  decisionValue: 20,
  uniqueness: 15,
  searchAndCategoryFit: 10,
  freshness: 10,
  mediaIntegrity: 5,
} as const satisfies ContentQualityBreakdown;

export const CONTENT_QUALITY_THRESHOLDS = {
  publishReady: 90,
  reviewRequired: 80,
  enrich: 70,
} as const;

export const DEFAULT_DAILY_NEW_PAGE_LIMIT = 3;

function clamp(value: number, maximum: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(maximum, Math.round(value)));
}

export function getContentPublishDecision(total: number, blockers: string[]): ContentPublishDecision {
  if (blockers.length > 0) return 'hold';
  if (total >= CONTENT_QUALITY_THRESHOLDS.publishReady) return 'publish_ready';
  if (total >= CONTENT_QUALITY_THRESHOLDS.reviewRequired) return 'review_required';
  if (total >= CONTENT_QUALITY_THRESHOLDS.enrich) return 'enrich';
  return 'hold';
}

export function buildContentQualityResult(
  input: Partial<ContentQualityBreakdown>,
  blockers: string[] = [],
): ContentQualityResult {
  const breakdown: ContentQualityBreakdown = {
    evidence: clamp(input.evidence || 0, CONTENT_QUALITY_WEIGHTS.evidence),
    factualConsistency: clamp(input.factualConsistency || 0, CONTENT_QUALITY_WEIGHTS.factualConsistency),
    decisionValue: clamp(input.decisionValue || 0, CONTENT_QUALITY_WEIGHTS.decisionValue),
    uniqueness: clamp(input.uniqueness || 0, CONTENT_QUALITY_WEIGHTS.uniqueness),
    searchAndCategoryFit: clamp(input.searchAndCategoryFit || 0, CONTENT_QUALITY_WEIGHTS.searchAndCategoryFit),
    freshness: clamp(input.freshness || 0, CONTENT_QUALITY_WEIGHTS.freshness),
    mediaIntegrity: clamp(input.mediaIntegrity || 0, CONTENT_QUALITY_WEIGHTS.mediaIntegrity),
  };
  const total = Object.values(breakdown).reduce((sum, score) => sum + score, 0);

  return {
    total,
    breakdown,
    blockers: Array.from(new Set(blockers.filter(Boolean))),
    decision: getContentPublishDecision(total, blockers),
  };
}
