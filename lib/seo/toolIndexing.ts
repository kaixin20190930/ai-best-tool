import { getToolQuality } from '@/lib/services/toolQuality';

export const TOOL_INDEXABLE_STATUS = 'continue_index' as const;

export type ToolPageQualityStatus =
  | typeof TOOL_INDEXABLE_STATUS
  | 'monitor'
  | 'noindex'
  | 'merge_candidate'
  | 'archive';

interface ToolIndexingInput {
  status?: string | null;
  pageQualityStatus?: string | null;
  categoryId?: string | null;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  content?: unknown;
  detail?: unknown;
  pricing?: string | null;
  tags?: string[] | null;
  features?: unknown;
}

export interface ToolIndexDecision {
  indexable: boolean;
  qualityScore: number;
  reason: 'published_and_approved' | 'not_published' | 'indexing_paused' | 'quality_below_threshold' | 'market_not_validated';
}

export function isMarketValidatedForIndex(value: unknown): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const market = value as Record<string, unknown>;
  const hasText = (item: unknown) => typeof item === 'string' && item.trim().length > 0;
  const hasItems = (items: unknown) => Array.isArray(items) && items.some(hasText);
  const score = typeof market.score === 'number' ? market.score : Number.NaN;
  return market.verdict === 'validated'
    && hasText(market.reviewedAt)
    && hasItems(market.evidenceUrls)
    && hasItems(market.strongSignals)
    && Number.isFinite(score)
    && score >= 75;
}

export function getToolIndexDecision(tool: ToolIndexingInput): ToolIndexDecision {
  const quality = getToolQuality({
    category_id: tool.categoryId,
    image_url: tool.imageUrl,
    thumbnail_url: tool.thumbnailUrl,
    content: tool.content,
    detail: tool.detail,
    pricing: tool.pricing,
    tags: tool.tags,
  });

  if (tool.status !== 'published') {
    return { indexable: false, qualityScore: quality.score, reason: 'not_published' };
  }

  if (tool.pageQualityStatus !== TOOL_INDEXABLE_STATUS) {
    return { indexable: false, qualityScore: quality.score, reason: 'indexing_paused' };
  }

  if (quality.score < 80) {
    return { indexable: false, qualityScore: quality.score, reason: 'quality_below_threshold' };
  }

  const features = tool.features && typeof tool.features === 'object' && !Array.isArray(tool.features)
    ? tool.features as Record<string, unknown> : {};
  if (Object.hasOwn(features, 'collection')) {
    if (!isMarketValidatedForIndex(features.marketValidation)) {
      return { indexable: false, qualityScore: quality.score, reason: 'market_not_validated' };
    }
  }

  return { indexable: true, qualityScore: quality.score, reason: 'published_and_approved' };
}
