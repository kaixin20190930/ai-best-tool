/**
 * Recommendations Service
 * 
 * 提供基于分类和标签的相似工具推荐功能
 */

import { query } from '@/db/neon/client';
import { Tool } from './tools';

/**
 * 获取相似工具推荐
 * 
 * 基于以下策略推荐工具：
 * 1. 相同分类的工具
 * 2. 共享标签的工具
 * 3. 按评分和浏览量排序
 * 
 * @param toolId 当前工具 ID
 * @param limit 返回数量限制
 * @returns 推荐的工具列表
 */
export async function getRecommendedTools(
  toolId: string,
  limit: number = 6
): Promise<Tool[]> {
  try {
    const sql = `
      WITH current_tool AS (
        SELECT category_id, tags
        FROM tools
        WHERE id = $1 AND status = 'published'
      ),
      scored_tools AS (
        SELECT 
          t.*,
          -- 计算相似度分数
          CASE 
            WHEN t.category_id = ct.category_id THEN 10 
            ELSE 0 
          END +
          -- 共享标签数量 * 5
          (
            SELECT COUNT(*)::int * 5
            FROM unnest(t.tags) AS tag
            WHERE tag = ANY(ct.tags)
          ) +
          -- 评分权重
          (t.average_rating * 2)::int +
          -- 浏览量权重（归一化）
          (LEAST(t.view_count / 100, 10))::int AS similarity_score
        FROM tools t
        CROSS JOIN current_tool ct
        WHERE t.id != $1 
          AND t.status = 'published'
      )
      SELECT 
        id,
        name,
        title,
        content,
        detail,
        url,
        image_url as "imageUrl",
        thumbnail_url as "thumbnailUrl",
        category_id as "categoryId",
        tags,
        pricing,
        features,
        use_cases as "useCases",
        screenshots,
        video_url as "videoUrl",
        status,
        submitted_by as "submittedBy",
        created_at as "createdAt",
        updated_at as "updatedAt",
        view_count as "viewCount",
        click_count as "clickCount",
        share_count as "shareCount",
        average_rating as "averageRating",
        rating_count as "ratingCount"
      FROM scored_tools
      WHERE similarity_score > 0
      ORDER BY similarity_score DESC, average_rating DESC, view_count DESC
      LIMIT $2
    `;

    const result = await query(sql, [toolId, limit]);
    return result.rows as Tool[];
  } catch (error) {
    console.error('Error fetching recommended tools:', error);
    return [];
  }
}

/**
 * 获取同分类的热门工具
 * 
 * @param categoryId 分类 ID
 * @param excludeToolId 要排除的工具 ID
 * @param limit 返回数量限制
 * @returns 热门工具列表
 */
export async function getPopularToolsByCategory(
  categoryId: string,
  excludeToolId?: string,
  limit: number = 6
): Promise<Tool[]> {
  try {
    const sql = `
      SELECT 
        id,
        name,
        title,
        content,
        detail,
        url,
        image_url as "imageUrl",
        thumbnail_url as "thumbnailUrl",
        category_id as "categoryId",
        tags,
        pricing,
        features,
        use_cases as "useCases",
        screenshots,
        video_url as "videoUrl",
        status,
        submitted_by as "submittedBy",
        created_at as "createdAt",
        updated_at as "updatedAt",
        view_count as "viewCount",
        click_count as "clickCount",
        share_count as "shareCount",
        average_rating as "averageRating",
        rating_count as "ratingCount"
      FROM tools
      WHERE category_id = $1
        AND status = 'published'
        ${excludeToolId ? 'AND id != $3' : ''}
      ORDER BY 
        (average_rating * rating_count) DESC,
        view_count DESC,
        created_at DESC
      LIMIT $2
    `;

    const params = excludeToolId 
      ? [categoryId, limit, excludeToolId]
      : [categoryId, limit];

    const result = await query(sql, params);
    return result.rows as Tool[];
  } catch (error) {
    console.error('Error fetching popular tools by category:', error);
    return [];
  }
}

/**
 * 获取具有相似标签的工具
 * 
 * @param tags 标签数组
 * @param excludeToolId 要排除的工具 ID
 * @param limit 返回数量限制
 * @returns 工具列表
 */
export async function getToolsBySimilarTags(
  tags: string[],
  excludeToolId?: string,
  limit: number = 6
): Promise<Tool[]> {
  try {
    if (tags.length === 0) return [];

    const sql = `
      SELECT 
        t.*,
        (
          SELECT COUNT(*)::int
          FROM unnest(t.tags) AS tag
          WHERE tag = ANY($1::text[])
        ) as matching_tags_count
      FROM (
        SELECT 
          id,
          name,
          title,
          content,
          detail,
          url,
          image_url as "imageUrl",
          thumbnail_url as "thumbnailUrl",
          category_id as "categoryId",
          tags,
          pricing,
          features,
          use_cases as "useCases",
          screenshots,
          video_url as "videoUrl",
          status,
          submitted_by as "submittedBy",
          created_at as "createdAt",
          updated_at as "updatedAt",
          view_count as "viewCount",
          click_count as "clickCount",
          share_count as "shareCount",
          average_rating as "averageRating",
          rating_count as "ratingCount"
        FROM tools
        WHERE tags && $1::text[]
          AND status = 'published'
          ${excludeToolId ? 'AND id != $3' : ''}
      ) t
      ORDER BY matching_tags_count DESC, average_rating DESC, view_count DESC
      LIMIT $2
    `;

    const params = excludeToolId 
      ? [tags, limit, excludeToolId]
      : [tags, limit];

    const result = await query(sql, params);
    return result.rows.map(row => {
      const { matching_tags_count, ...tool } = row;
      return tool as Tool;
    });
  } catch (error) {
    console.error('Error fetching tools by similar tags:', error);
    return [];
  }
}
