import type { ReviewedToolRelationshipDefinition } from '../config/reviewedToolRelationships';
import { getToolIndexDecision } from './toolIndexing';

export function isReviewedRelationshipEligible(
  definition: ReviewedToolRelationshipDefinition,
  tool: Parameters<typeof getToolIndexDecision>[0],
  today: string,
) {
  if (tool.status !== 'published' || !['monitor', 'continue_index'].includes(tool.pageQualityStatus || ''))
    return false;
  const features = tool.features as { marketValidation?: { verdict?: string } } | null | undefined;
  if (features?.marketValidation?.verdict === 'rejected') return false;
  if (
    ![definition.reviewedAt, definition.reviewDueAt].every(
      (date) => /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(Date.parse(date)),
    )
  )
    return false;
  if (
    definition.reviewedAt > today ||
    definition.reviewDueAt <= today ||
    definition.reviewDueAt <= definition.reviewedAt
  )
    return false;
  const decision = getToolIndexDecision(tool);
  // A reviewed public monitor page can help an on-site decision before search release.
  // Index approval and sitemap membership continue to use the separate indexing gate.
  return tool.pageQualityStatus === 'monitor' ? decision.qualityScore >= 80 : decision.indexable;
}
