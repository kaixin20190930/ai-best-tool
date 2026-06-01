import { getPool } from '@/db/neon/client';
import { createAdminClient } from '@/lib/supabase/admin';

import { getToolQuality } from '@/lib/services/toolQuality';

export interface SiteMetrics {
  totalViews: number;
  uniqueVisitors: number;
  totalTools: number;
  totalUsers: number;
  totalComments: number;
  totalRatings: number;
}

export interface ToolMetric {
  id: string;
  name: string;
  title: any;
  views: number;
  clicks: number;
  rating: number;
  ratingCount: number;
}

export interface SearchMetric {
  query: string;
  count: number;
  results: number;
}

export interface TrafficSource {
  source: string;
  visits: number;
  percentage: number;
}

export interface FeedbackSignal {
  type: string;
  count: number;
  percentage: number;
}

export interface CategoryMetric {
  id: string;
  slug: string;
  name: Record<string, string>;
  toolCount: number;
  views: number;
  clicks: number;
  shares: number;
  favorites: number;
  comments: number;
  ratings: number;
  averageRating: number;
  opportunityScore: number;
}

export interface ToolComplianceIssue {
  id: string;
  name: string;
  title: any;
  status: string;
  qualityScore: number;
  issues: string[];
  updatedAt: string;
  categoryName: Record<string, string> | null;
}

export interface DateRangeMetrics {
  date: string;
  views: number;
  clicks: number;
  searches: number;
}

/**
 * Get overall site metrics
 */
export async function getSiteMetrics(startDate?: Date, endDate?: Date): Promise<SiteMetrics> {
  try {
    const pool = getPool();
    const supabase = createAdminClient();

    // Get total tools
    const toolsResult = await pool.query("SELECT COUNT(*) as count FROM tools WHERE status = 'published'");

    // Get total users from Supabase Auth
    const perPage = 1000;
    let page = 1;
    let usersCount = 0;

    while (true) {
      const { data, error } = await supabase.auth.admin.listUsers({
        page,
        perPage,
      });

      if (error) {
        throw error;
      }

      const users = data.users ?? [];
      usersCount += users.length;

      if (users.length < perPage) {
        break;
      }

      page += 1;
    }

    // Get total views and unique visitors from analytics
    let analyticsQuery = `
      SELECT 
        COUNT(*) FILTER (WHERE event_type = 'page_view') as total_views,
        COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'page_view') as unique_visitors
      FROM analytics
    `;

    const params: any[] = [];
    if (startDate && endDate) {
      analyticsQuery += ' WHERE timestamp >= $1 AND timestamp <= $2';
      params.push(startDate, endDate);
    }

    const analyticsResult = await pool.query(analyticsQuery, params);

    // Get total comments
    const commentsResult = await pool.query('SELECT COUNT(*) as count FROM comments');

    // Get total ratings
    const ratingsResult = await pool.query('SELECT COUNT(*) as count FROM ratings');

    return {
      totalViews: Number.parseInt(analyticsResult.rows[0]?.total_views || '0', 10),
      uniqueVisitors: Number.parseInt(analyticsResult.rows[0]?.unique_visitors || '0', 10),
      totalTools: Number.parseInt(toolsResult.rows[0]?.count || '0', 10),
      totalUsers: usersCount,
      totalComments: Number.parseInt(commentsResult.rows[0]?.count || '0', 10),
      totalRatings: Number.parseInt(ratingsResult.rows[0]?.count || '0', 10),
    };
  } catch (error) {
    console.error('Error fetching site metrics:', error);
    return {
      totalViews: 0,
      uniqueVisitors: 0,
      totalTools: 0,
      totalUsers: 0,
      totalComments: 0,
      totalRatings: 0,
    };
  }
}

/**
 * Get top tools by various metrics
 */
export async function getTopTools(
  metric: 'views' | 'clicks' | 'rating' = 'views',
  limit: number = 10,
): Promise<ToolMetric[]> {
  try {
    const pool = getPool();

    let orderBy = 'view_count DESC';
    if (metric === 'clicks') {
      orderBy = 'click_count DESC';
    } else if (metric === 'rating') {
      orderBy = 'average_rating DESC, rating_count DESC';
    }

    const result = await pool.query(
      `
      SELECT 
        id,
        name,
        title,
        view_count as views,
        click_count as clicks,
        average_rating as rating,
        rating_count
      FROM tools
      WHERE status = 'published'
      ORDER BY ${orderBy}
      LIMIT $1
    `,
      [limit],
    );

    return result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      title: row.title,
      views: row.views,
      clicks: row.clicks,
      rating: parseFloat(row.rating),
      ratingCount: row.rating_count,
    }));
  } catch (error) {
    console.error('Error fetching top tools:', error);
    return [];
  }
}

/**
 * Get top categories by engagement and tool supply
 */
export async function getTopCategories(limit: number = 10): Promise<CategoryMetric[]> {
  try {
    const pool = getPool();

    const result = await pool.query(
      `
        WITH category_base AS (
          SELECT
            c.id,
            c.slug,
            c.name,
            COUNT(DISTINCT t.id)::int as "toolCount",
            COALESCE(SUM(COALESCE(t.view_count, 0)), 0)::int as views,
            COALESCE(SUM(COALESCE(t.click_count, 0)), 0)::int as clicks,
            COALESCE(SUM(COALESCE(t.share_count, 0)), 0)::int as shares,
            COALESCE(SUM(COALESCE(t.rating_count, 0)), 0)::int as ratings,
            ROUND(COALESCE(AVG(NULLIF(t.average_rating, 0)), 0)::numeric, 2)::float8 as "averageRating"
          FROM categories c
          LEFT JOIN tools t
            ON t.category_id = c.id
           AND t.status = 'published'
          GROUP BY c.id
        ),
        category_engagement AS (
          SELECT
            c.id,
            COUNT(DISTINCT f.user_id)::int as favorites,
            COUNT(DISTINCT cm.id) FILTER (WHERE COALESCE(cm.is_hidden, false) = false)::int as comments
          FROM categories c
          LEFT JOIN tools t
            ON t.category_id = c.id
           AND t.status = 'published'
          LEFT JOIN favorites f ON f.tool_id = t.id
          LEFT JOIN comments cm ON cm.tool_id = t.id
          GROUP BY c.id
        )
        SELECT
          b.id,
          b.slug,
          b.name,
          b."toolCount",
          b.views,
          b.clicks,
          b.shares,
          COALESCE(e.favorites, 0)::int as favorites,
          COALESCE(e.comments, 0)::int as comments,
          b.ratings,
          b."averageRating",
          (
            b.views
            + b.clicks * 2
            + COALESCE(e.favorites, 0) * 4
            + COALESCE(e.comments, 0) * 5
            + b.ratings * 2
          )::int as "opportunityScore"
        FROM category_base b
        LEFT JOIN category_engagement e ON e.id = b.id
        ORDER BY "opportunityScore" DESC, b.views DESC, b."toolCount" DESC
        LIMIT $1
      `,
      [limit],
    );

    return result.rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      toolCount: Number(row.toolCount ?? 0),
      views: Number(row.views ?? 0),
      clicks: Number(row.clicks ?? 0),
      shares: Number(row.shares ?? 0),
      favorites: Number(row.favorites ?? 0),
      comments: Number(row.comments ?? 0),
      ratings: Number(row.ratings ?? 0),
      averageRating: Number(row.averageRating ?? 0),
      opportunityScore: Number(row.opportunityScore ?? 0),
    }));
  } catch (error) {
    console.error('Error fetching top categories:', error);
    return [];
  }
}

/**
 * Get published tools that still violate intake standards
 */
export async function getToolComplianceIssues(limit: number = 10): Promise<ToolComplianceIssue[]> {
  try {
    const pool = getPool();

    const result = await pool.query(
      `
        WITH tool_audit AS (
          SELECT
            t.id,
            t.name,
            t.title,
            t.status,
            t.updated_at as "updatedAt",
            t.category_id as "categoryId",
            t.image_url as "imageUrl",
            t.thumbnail_url as "thumbnailUrl",
            t.content,
            t.detail,
            t.pricing,
            t.tags,
            c.name as "categoryName",
            (
              (
                CASE WHEN t.category_id IS NULL THEN 1 ELSE 0 END
                + CASE WHEN COALESCE(t.thumbnail_url, '') = '' THEN 1 ELSE 0 END
                + CASE WHEN COALESCE(t.image_url, '') = '' THEN 1 ELSE 0 END
                + CASE
                    WHEN LENGTH(COALESCE(t.content->>'en', t.content->>'zh', t.content::text, '')) < 80
                    THEN 1 ELSE 0
                  END
                + CASE
                    WHEN LENGTH(COALESCE(t.detail->>'en', t.detail->>'zh', t.detail::text, '')) < 160
                    THEN 1 ELSE 0
                  END
                + CASE WHEN COALESCE(t.pricing, '') = '' THEN 1 ELSE 0 END
                + CASE WHEN COALESCE(array_length(t.tags, 1), 0) = 0 THEN 1 ELSE 0 END
              )
            )::int as issue_count,
            ARRAY_REMOVE(ARRAY[
              CASE WHEN t.category_id IS NULL THEN 'Missing category' END,
              CASE WHEN COALESCE(t.thumbnail_url, '') = '' THEN 'Missing screenshot' END,
              CASE WHEN COALESCE(t.image_url, '') = '' THEN 'Missing logo' END,
              CASE
                WHEN LENGTH(COALESCE(t.content->>'en', t.content->>'zh', t.content::text, '')) < 80
                THEN 'Short description'
              END,
              CASE
                WHEN LENGTH(COALESCE(t.detail->>'en', t.detail->>'zh', t.detail::text, '')) < 160
                THEN 'Short detail'
              END,
              CASE WHEN COALESCE(t.pricing, '') = '' THEN 'Missing pricing' END,
              CASE WHEN COALESCE(array_length(t.tags, 1), 0) = 0 THEN 'Missing tags' END
            ], NULL)::text[] as issues
          FROM tools t
          LEFT JOIN categories c ON c.id = t.category_id
          WHERE t.status = 'published'
        )
        SELECT *
        FROM tool_audit
        WHERE issue_count > 0
        ORDER BY issue_count DESC, "updatedAt" DESC
        LIMIT $1
      `,
      [limit],
    );

    return result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      title: row.title,
      status: row.status,
      qualityScore: getToolQuality({
        category_id: row.categoryId,
        image_url: row.imageUrl,
        thumbnail_url: row.thumbnailUrl,
        content: row.content,
        detail: row.detail,
        pricing: row.pricing,
        tags: row.tags,
      }).score,
      issues: Array.isArray(row.issues) ? row.issues : [],
      updatedAt: row.updatedAt,
      categoryName: row.categoryName || null,
    }));
  } catch (error) {
    console.error('Error fetching tool compliance issues:', error);
    return [];
  }
}

/**
 * Get top search queries
 */
export async function getTopSearches(limit: number = 10): Promise<SearchMetric[]> {
  try {
    const pool = getPool();

    const result = await pool.query(
      `
      SELECT 
        metadata->>'query' as query,
        COUNT(*) as count,
        AVG((metadata->>'results')::int) as avg_results
      FROM analytics
      WHERE event_type = 'search'
        AND metadata->>'query' IS NOT NULL
      GROUP BY metadata->>'query'
      ORDER BY count DESC
      LIMIT $1
    `,
      [limit],
    );

    return result.rows.map((row) => ({
      query: row.query,
      count: Number.parseInt(String(row.count || '0'), 10),
      results: Math.round(Number.parseFloat(row.avg_results || '0')),
    }));
  } catch (error) {
    console.error('Error fetching top searches:', error);
    return [];
  }
}

/**
 * Get traffic sources
 */
export async function getTrafficSources(limit: number = 10): Promise<TrafficSource[]> {
  try {
    const pool = getPool();

    const result = await pool.query(
      `
      SELECT 
        COALESCE(
          CASE 
            WHEN referrer IS NULL OR referrer = '' THEN 'Direct'
            WHEN referrer LIKE '%google%' THEN 'Google'
            WHEN referrer LIKE '%bing%' THEN 'Bing'
            WHEN referrer LIKE '%facebook%' THEN 'Facebook'
            WHEN referrer LIKE '%twitter%' OR referrer LIKE '%t.co%' THEN 'Twitter'
            WHEN referrer LIKE '%linkedin%' THEN 'LinkedIn'
            ELSE 'Other'
          END,
          'Direct'
        ) as source,
        COUNT(*) as visits
      FROM analytics
      WHERE event_type = 'page_view'
      GROUP BY source
      ORDER BY visits DESC
      LIMIT $1
    `,
      [limit],
    );

    const total = result.rows.reduce((sum, row) => sum + Number.parseInt(String(row.visits || '0'), 10), 0);

    return result.rows.map((row) => ({
      source: row.source,
      visits: Number.parseInt(String(row.visits || '0'), 10),
      percentage: total > 0 ? (Number.parseInt(String(row.visits || '0'), 10) / total) * 100 : 0,
    }));
  } catch (error) {
    console.error('Error fetching traffic sources:', error);
    return [];
  }
}

/**
 * Get top feedback signals
 */
export async function getTopFeedbackSignals(limit: number = 10): Promise<FeedbackSignal[]> {
  try {
    const pool = getPool();

    const result = await pool.query(
      `
      SELECT
        COALESCE(metadata->>'type', 'unknown') as type,
        COUNT(*) as count
      FROM analytics
      WHERE event_type = 'feedback'
      GROUP BY COALESCE(metadata->>'type', 'unknown')
      ORDER BY count DESC
      LIMIT $1
    `,
      [limit]
    );

    const total = result.rows.reduce(
      (sum, row) => sum + Number.parseInt(String(row.count || '0'), 10),
      0
    );

    return result.rows.map((row) => ({
      type: row.type,
      count: Number.parseInt(String(row.count || '0'), 10),
      percentage: total > 0 ? (Number.parseInt(String(row.count || '0'), 10) / total) * 100 : 0,
    }));
  } catch (error) {
    console.error('Error fetching feedback signals:', error);
    return [];
  }
}

/**
 * Get metrics over time (for charts)
 */
export async function getMetricsOverTime(days: number = 30): Promise<DateRangeMetrics[]> {
  try {
    const pool = getPool();

    const result = await pool.query(
      `
      SELECT 
        DATE(timestamp) as date,
        COUNT(*) FILTER (WHERE event_type = 'page_view') as views,
        COUNT(*) FILTER (WHERE event_type = 'tool_click') as clicks,
        COUNT(*) FILTER (WHERE event_type = 'search') as searches
      FROM analytics
      WHERE timestamp >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(timestamp)
      ORDER BY date ASC
    `,
    );

    return result.rows.map((row) => ({
      date: row.date,
      views: Number.parseInt(row.views || '0', 10),
      clicks: Number.parseInt(row.clicks || '0', 10),
      searches: Number.parseInt(row.searches || '0', 10),
    }));
  } catch (error) {
    console.error('Error fetching metrics over time:', error);
    return [];
  }
}

/**
 * Get recent activity
 */
export async function getRecentActivity(limit: number = 20) {
  try {
    const pool = getPool();

    const result = await pool.query(
      `
      SELECT 
        a.event_type,
        a.timestamp,
        a.metadata,
        t.name as tool_name,
        t.title as tool_title
      FROM analytics a
      LEFT JOIN tools t ON a.tool_id = t.id
      ORDER BY a.timestamp DESC
      LIMIT $1
    `,
      [limit],
    );

    return result.rows;
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
}
