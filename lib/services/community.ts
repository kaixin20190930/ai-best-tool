import { query } from '@/db/neon/client';

export interface CommunityHighlight {
  id: string;
  name: string;
  title: Record<string, string>;
  content: Record<string, string>;
  url: string;
  thumbnailUrl: string | null;
  favoriteCount: number;
  commentCount: number;
  shareCount: number;
}

export interface RecentDiscussion {
  id: string;
  toolName: string;
  toolTitle: Record<string, string>;
  commenterName: string;
  excerpt: string;
  createdAt: string;
  commentCount: number;
}

export async function getCommunityHighlights(limit = 3): Promise<CommunityHighlight[]> {
  try {
    const result = await query(
      `
        SELECT
          t.id,
          t.name,
          t.title,
          t.content,
          t.url,
          t.thumbnail_url as "thumbnailUrl",
          COUNT(DISTINCT f.user_id)::int as "favoriteCount",
          COUNT(DISTINCT c.id)::int as "commentCount",
          COALESCE(t.share_count, 0)::int as "shareCount"
        FROM tools t
        LEFT JOIN favorites f ON f.tool_id = t.id
        LEFT JOIN comments c ON c.tool_id = t.id AND COALESCE(c.is_hidden, false) = false
        WHERE t.status = 'published'
        GROUP BY t.id
        ORDER BY
          (COUNT(DISTINCT f.user_id) * 4 + COUNT(DISTINCT c.id) * 5 + COALESCE(t.share_count, 0) * 2 + COALESCE(t.view_count, 0) / 100) DESC,
          t.updated_at DESC
        LIMIT $1
      `,
      [Math.max(1, Math.min(limit, 12))]
    );

    return result.rows;
  } catch (error) {
    console.error('Error fetching community highlights:', error);
    return [];
  }
}

export async function getRisingTools(limit = 3): Promise<CommunityHighlight[]> {
  try {
    const result = await query(
      `
        SELECT
          t.id,
          t.name,
          t.title,
          t.content,
          t.url,
          t.thumbnail_url as "thumbnailUrl",
          COUNT(DISTINCT f.id) FILTER (WHERE f.created_at >= NOW() - INTERVAL '7 days')::int as "favoriteCount",
          COUNT(DISTINCT c.id) FILTER (WHERE c.created_at >= NOW() - INTERVAL '7 days' AND COALESCE(c.is_hidden, false) = false)::int as "commentCount",
          COALESCE(t.share_count, 0)::int as "shareCount"
        FROM tools t
        LEFT JOIN favorites f ON f.tool_id = t.id
        LEFT JOIN comments c ON c.tool_id = t.id
        WHERE t.status = 'published'
        GROUP BY t.id
        HAVING
          COUNT(DISTINCT f.id) FILTER (WHERE f.created_at >= NOW() - INTERVAL '7 days') > 0
          OR COUNT(DISTINCT c.id) FILTER (WHERE c.created_at >= NOW() - INTERVAL '7 days' AND COALESCE(c.is_hidden, false) = false) > 0
        ORDER BY
          (COUNT(DISTINCT f.id) FILTER (WHERE f.created_at >= NOW() - INTERVAL '7 days') * 4 +
           COUNT(DISTINCT c.id) FILTER (WHERE c.created_at >= NOW() - INTERVAL '7 days' AND COALESCE(c.is_hidden, false) = false) * 6 +
           COALESCE(t.share_count, 0)) DESC,
          t.updated_at DESC
        LIMIT $1
      `,
      [Math.max(1, Math.min(limit, 12))]
    );

    return result.rows;
  } catch (error) {
    console.error('Error fetching rising tools:', error);
    return [];
  }
}

export async function getRecentDiscussions(limit = 3): Promise<RecentDiscussion[]> {
  try {
    const result = await query(
      `
        WITH latest_comments AS (
          SELECT DISTINCT ON (c.tool_id)
            c.id,
            c.tool_id,
            c.content,
            c.created_at,
            COUNT(*) OVER (PARTITION BY c.tool_id)::int as comment_count
          FROM comments c
          WHERE COALESCE(c.is_hidden, false) = false
          ORDER BY c.tool_id, c.created_at DESC
        )
        SELECT
          lc.id,
          t.name as "toolName",
          t.title as "toolTitle",
          'Reader' as "commenterName",
          LEFT(lc.content, 140) as excerpt,
          lc.created_at as "createdAt",
          lc.comment_count as "commentCount"
        FROM latest_comments lc
        INNER JOIN tools t ON t.id = lc.tool_id AND t.status = 'published'
        ORDER BY lc.created_at DESC
        LIMIT $1
      `,
      [Math.max(1, Math.min(limit, 12))]
    );

    return result.rows;
  } catch (error) {
    console.error('Error fetching recent discussions:', error);
    return [];
  }
}
