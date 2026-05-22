import { getPool } from '@/db/neon/client';

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

export interface DateRangeMetrics {
  date: string;
  views: number;
  clicks: number;
  searches: number;
}

/**
 * Get overall site metrics
 */
export async function getSiteMetrics(
  startDate?: Date,
  endDate?: Date
): Promise<SiteMetrics> {
  try {
    const pool = getPool();

    // Get total tools
    const toolsResult = await pool.query(
      "SELECT COUNT(*) as count FROM tools WHERE status = 'published'"
    );

    // Get total users (from Supabase auth, we'll use a placeholder for now)
    // In production, this would query Supabase auth or a users table
    const usersCount = 0;

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
      totalViews: parseInt(analyticsResult.rows[0]?.total_views || '0'),
      uniqueVisitors: parseInt(analyticsResult.rows[0]?.unique_visitors || '0'),
      totalTools: parseInt(toolsResult.rows[0]?.count || '0'),
      totalUsers: usersCount,
      totalComments: parseInt(commentsResult.rows[0]?.count || '0'),
      totalRatings: parseInt(ratingsResult.rows[0]?.count || '0'),
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
  limit: number = 10
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
      [limit]
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
      [limit]
    );

    return result.rows.map((row) => ({
      query: row.query,
      count: parseInt(row.count),
      results: Math.round(parseFloat(row.avg_results || '0')),
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
      [limit]
    );

    const total = result.rows.reduce((sum, row) => sum + parseInt(row.visits), 0);

    return result.rows.map((row) => ({
      source: row.source,
      visits: parseInt(row.visits),
      percentage: total > 0 ? (parseInt(row.visits) / total) * 100 : 0,
    }));
  } catch (error) {
    console.error('Error fetching traffic sources:', error);
    return [];
  }
}

/**
 * Get metrics over time (for charts)
 */
export async function getMetricsOverTime(
  days: number = 30
): Promise<DateRangeMetrics[]> {
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
    `
    );

    return result.rows.map((row) => ({
      date: row.date,
      views: parseInt(row.views || '0'),
      clicks: parseInt(row.clicks || '0'),
      searches: parseInt(row.searches || '0'),
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
      [limit]
    );

    return result.rows;
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
}
