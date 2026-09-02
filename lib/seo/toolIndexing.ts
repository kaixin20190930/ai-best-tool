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
}

export interface ToolIndexDecision {
  indexable: boolean;
  qualityScore: number;
  reason: 'published_and_approved' | 'not_published' | 'indexing_paused' | 'quality_below_threshold';
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

  return { indexable: true, qualityScore: quality.score, reason: 'published_and_approved' };
}
