import { query } from '@/db/neon/client';

import {
  getReviewedToolRelationshipDefinitions,
  type ReviewedToolRelationshipType,
} from '@/lib/config/reviewedToolRelationships';
import { getToolIndexDecision } from '@/lib/seo/toolIndexing';
import { getLocalizedField, type Tool } from '@/lib/services/tools';

export interface ReviewedToolRelationship {
  rationale: string;
  relationshipType: ReviewedToolRelationshipType;
  reviewedAt: string;
  reviewDueAt: string;
  tool: Tool;
}

export async function getReviewedToolRelationships(
  toolSlug: string,
  locale = 'en',
  limit = 4,
): Promise<ReviewedToolRelationship[]> {
  const definitions = getReviewedToolRelationshipDefinitions(toolSlug).slice(0, Math.max(0, Math.min(limit, 4)));
  if (definitions.length === 0) return [];

  try {
    const targetSlugs = definitions.map((definition) => definition.relatedToolSlug);
    const result = await query<Tool>(
      `SELECT
        id, name, title, content, detail, url, image_url AS "imageUrl",
        thumbnail_url AS "thumbnailUrl", category_id AS "categoryId", tags,
        pricing, features, use_cases AS "useCases", screenshots, video_url AS "videoUrl",
        status, page_quality_status AS "pageQualityStatus", next_review_date AS "nextReviewDate",
        submitted_by AS "submittedBy", created_at AS "createdAt", updated_at AS "updatedAt",
        view_count AS "viewCount", click_count AS "clickCount", share_count AS "shareCount",
        average_rating AS "averageRating", rating_count AS "ratingCount"
      FROM tools
      WHERE name = ANY($1::text[])
        AND status = 'published'`,
      [targetSlugs],
    );
    const toolsBySlug = new Map(result.rows.map((tool) => [tool.name.toLowerCase(), tool]));

    return definitions.flatMap((definition) => {
      const tool = toolsBySlug.get(definition.relatedToolSlug.toLowerCase());
      if (!tool || !getToolIndexDecision(tool).indexable) return [];

      const rationale = getLocalizedField(definition.rationale, locale, locale === 'cn' ? 'cn' : 'en').trim();
      if (!rationale) return [];

      return [{ ...definition, rationale, tool }];
    });
  } catch (error) {
    console.error('Reviewed tool relationship lookup failed:', { toolSlug, error });
    return [];
  }
}
