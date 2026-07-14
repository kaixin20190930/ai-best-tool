import { getPool } from '@/db/neon/client';

import { getMediaIssueLabels, isPlaceholderMediaUrl } from '@/lib/services/mediaReview';
import { getToolQuality } from '@/lib/services/toolQuality';
import { createAdminClient } from '@/lib/supabase/admin';

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

export interface PageAccessSummary {
  pageType: string;
  label: string;
  views: number;
  uniqueVisitors: number;
  percentage: number;
}

export interface PageAccessPage {
  pagePath: string;
  pageType: string;
  label: string;
  views: number;
  uniqueVisitors: number;
}

export interface PageAccessFamily {
  pageType: string;
  label: string;
  views: number;
  uniqueVisitors: number;
  percentage: number;
  topPages: PageAccessPage[];
}

export interface PageAccessReport {
  summary: PageAccessSummary[];
  topPages: PageAccessPage[];
  familyBreakdown: PageAccessFamily[];
  totalViews: number;
  totalUniqueVisitors: number;
}

export interface PageAccessTrendItem {
  pageType: string;
  label: string;
  currentViews: number;
  previousViews: number;
  changePercent: number;
}

export interface PageAccessTrend {
  items: PageAccessTrendItem[];
  currentViews: number;
  previousViews: number;
  currentUniqueVisitors: number;
  previousUniqueVisitors: number;
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

export interface MediaQueueItem {
  id: string;
  name: string;
  title: any;
  categorySlug: string | null;
  categoryName: Record<string, string> | null;
  views: number;
  clicks: number;
  qualityScore: number;
  mediaIssues: string[];
  mediaReason: string | null;
  hasDecisionGuide: boolean;
  priorityScore: number;
  updatedAt: string;
}

function hasDecisionGuideSnapshot(features: Record<string, unknown>): boolean {
  const decision =
    features.decision && typeof features.decision === 'object' ? (features.decision as Record<string, unknown>) : null;

  if (!decision) {
    return false;
  }

  const compareAxes =
    decision.compareAxes && typeof decision.compareAxes === 'object'
      ? (decision.compareAxes as Record<string, unknown>)
      : null;

  const compareAxesEn = Array.isArray(compareAxes?.en) ? compareAxes.en : [];
  const compareAxesZh = Array.isArray(compareAxes?.zh) ? compareAxes.zh : [];

  const localizedFields = ['officialSummary', 'freshnessSummary', 'pricingSummary', 'mediaSummary', 'communitySummary'];

  if (compareAxesEn.length === 0 || compareAxesZh.length === 0) {
    return false;
  }

  return localizedFields.every((field) => {
    const value = decision[field];
    if (!value || typeof value !== 'object') {
      return false;
    }

    const localized = value as Record<string, unknown>;
    return (
      typeof localized.en === 'string' &&
      localized.en.trim().length > 0 &&
      typeof localized.zh === 'string' &&
      localized.zh.trim().length > 0
    );
  });
}

export interface DateRangeMetrics {
  date: string;
  views: number;
  clicks: number;
  searches: number;
}

export interface ConversionSnapshot {
  pageViews: number;
  toolClicks: number;
  ctaClicks: number;
  searches: number;
  favorites: number;
  shares: number;
  claimLeads: number;
  freshClaimLeads: number;
  overdueClaimLeads: number;
  submissions: number;
  publishedSubmissions: number;
  paidSubmissions: number;
  pageToClickRate: number;
  pageToCtaRate: number;
  submissionPublishRate: number;
  paidSubmissionRate: number;
}

export interface CtaClickSummary {
  pageType: string;
  label: string;
  clicks: number;
  uniqueVisitors: number;
  percentage: number;
}

export interface CtaClickItem {
  ctaId: string;
  ctaLabel: string;
  pageType: string;
  pageLabel: string;
  href: string | null;
  clicks: number;
  uniqueVisitors: number;
  percentage: number;
}

export interface CtaClickReport {
  summary: CtaClickSummary[];
  topCtas: CtaClickItem[];
  totalClicks: number;
  totalUniqueVisitors: number;
}

export interface CtaClickTrendItem {
  ctaId: string;
  ctaLabel: string;
  pageType: string;
  pageLabel: string;
  href: string | null;
  currentClicks: number;
  previousClicks: number;
  changePercent: number;
}

export interface CtaClickTrend {
  items: CtaClickTrendItem[];
  currentClicks: number;
  previousClicks: number;
  currentUniqueVisitors: number;
  previousUniqueVisitors: number;
}

export interface CommercialIntentSource {
  sourcePath: string;
  pageType: string;
  pageLabel: string;
  pageViews: number;
  uniqueVisitors: number;
  pricingViews: number;
  submitViews: number;
  submitClicks: number;
  claimClicks: number;
  claimSubmissions: number;
  checkoutStarts: number;
  totalIntentActions: number;
}

export interface CommercialIntentReport {
  sources: CommercialIntentSource[];
  totalPricingViews: number;
  totalSubmitViews: number;
  totalSubmitClicks: number;
  totalClaimClicks: number;
  totalClaimSubmissions: number;
  totalCheckoutStarts: number;
}

export interface AgentJourneySource {
  sourcePath: string;
  label: string;
  pageViews: number;
  uniqueVisitors: number;
  comparisonClicks: number;
  rankingClicks: number;
  submitClicks: number;
  claimClicks: number;
  claimSubmissions: number;
  checkoutStarts: number;
  totalIntentActions: number;
}

export interface AgentJourneyReport {
  sources: AgentJourneySource[];
  totalPageViews: number;
  totalComparisonClicks: number;
  totalRankingClicks: number;
  totalSubmitClicks: number;
  totalClaimClicks: number;
  totalClaimSubmissions: number;
  totalCheckoutStarts: number;
}

type CommercialIntentCounts = {
  pageViews: number;
  uniqueVisitors: number;
  pricingViews: number;
  submitViews: number;
  submitClicks: number;
  claimClicks: number;
  claimSubmissions: number;
  checkoutStarts: number;
};

type AgentJourneyCounts = {
  label: string;
  pageViews: number;
  uniqueVisitors: number;
  comparisonClicks: number;
  rankingClicks: number;
  submitClicks: number;
  claimClicks: number;
  claimSubmissions: number;
  checkoutStarts: number;
};

const agentJourneyPages = [
  {
    sourcePath: '/guides/ai-tools-for-agents',
    label: 'Agent guide',
  },
  {
    sourcePath: '/guides/ai-tools-for-agents-comparison',
    label: 'Agent comparison',
  },
  {
    sourcePath: '/best-ai-tools/ai-agent-tools',
    label: 'Agent top list',
  },
] as const;

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

    /* eslint-disable no-await-in-loop */
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
    /* eslint-enable no-await-in-loop */

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

export async function getPriorityMediaQueue(limit: number = 12): Promise<MediaQueueItem[]> {
  try {
    const pool = getPool();

    const result = await pool.query(
      `
        SELECT
          t.id,
          t.name,
          t.title,
          t.view_count as views,
          t.click_count as clicks,
          t.average_rating as rating,
          t.rating_count as "ratingCount",
          t.image_url as "imageUrl",
          t.thumbnail_url as "thumbnailUrl",
          t.features,
          t.content,
          t.detail,
          t.pricing,
          t.tags,
          t.updated_at as "updatedAt",
          c.slug as "categorySlug",
          c.name as "categoryName"
        FROM tools t
        LEFT JOIN categories c ON c.id = t.category_id
        WHERE t.status = 'published'
          AND (
            COALESCE(t.image_url, '') = ''
            OR COALESCE(t.thumbnail_url, '') = ''
            OR t.image_url LIKE '%google.com/s2/favicons%'
            OR t.thumbnail_url LIKE '%google.com/s2/favicons%'
            OR t.features->'mediaReview'->>'needed' = 'true'
          )
      `,
    );

    const categoryWeight: Record<string, number> = {
      web3: 90,
      'text-writing': 80,
      chatbot: 70,
      productivity: 60,
      'design-art': 45,
      'life-assistant': 35,
      other: 15,
    };

    const rows = result.rows
      .map((row) => {
        const features =
          row.features && typeof row.features === 'object' ? (row.features as Record<string, unknown>) : {};
        const mediaReview =
          features.mediaReview && typeof features.mediaReview === 'object'
            ? (features.mediaReview as Record<string, unknown>)
            : {};
        const mediaReviewNeeded = mediaReview.needed === true;
        const mediaReason =
          typeof mediaReview.reason === 'string' && mediaReview.reason.trim().length > 0
            ? mediaReview.reason.trim()
            : null;
        const hasDecisionGuide = hasDecisionGuideSnapshot(features);
        const mediaIssues = getMediaIssueLabels({
          imageUrl: row.imageUrl,
          thumbnailUrl: row.thumbnailUrl,
          mediaReviewNeeded,
        });

        const categorySlug =
          typeof row.categorySlug === 'string' && row.categorySlug.length > 0 ? row.categorySlug : null;
        const views = Number(row.views ?? 0);
        const clicks = Number(row.clicks ?? 0);
        const placeholderCount = [row.imageUrl, row.thumbnailUrl].filter((url) =>
          isPlaceholderMediaUrl(typeof url === 'string' ? url : null),
        ).length;
        const missingCount = [row.imageUrl, row.thumbnailUrl].filter((url) => !url).length;
        const qualityScore = getToolQuality({
          category_id: categorySlug,
          image_url: row.imageUrl,
          thumbnail_url: row.thumbnailUrl,
          content: row.content,
          detail: row.detail,
          pricing: row.pricing,
          tags: row.tags,
        }).score;

        const priorityScore =
          views +
          clicks * 2 +
          (categorySlug ? categoryWeight[categorySlug] ?? 25 : 25) +
          missingCount * 35 +
          placeholderCount * 20 +
          (mediaReviewNeeded ? 20 : 0) +
          (hasDecisionGuide ? 55 : 0);

        return {
          id: row.id,
          name: row.name,
          title: row.title,
          categorySlug,
          categoryName: row.categoryName || null,
          views,
          clicks,
          qualityScore,
          mediaIssues,
          mediaReason,
          hasDecisionGuide,
          priorityScore,
          updatedAt: row.updatedAt,
        } satisfies MediaQueueItem;
      })
      .sort((a, b) => b.priorityScore - a.priorityScore || b.views - a.views || b.clicks - a.clicks)
      .slice(0, limit);

    return rows;
  } catch (error) {
    console.error('Error fetching priority media queue:', error);
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
      [limit],
    );

    const total = result.rows.reduce((sum, row) => sum + Number.parseInt(String(row.count || '0'), 10), 0);

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
 * Get a compact conversion snapshot for the dashboard.
 */
export async function getConversionSnapshot(range: '7d' | '30d' | 'all' = '30d'): Promise<ConversionSnapshot> {
  try {
    const pool = getPool();
    const getDateCondition = (column: 'timestamp' | 'created_at') => {
      if (range === '7d') {
        return `AND ${column} >= NOW() - INTERVAL '7 days'`;
      }

      if (range === '30d') {
        return `AND ${column} >= NOW() - INTERVAL '30 days'`;
      }

      return '';
    };

    const analyticsDateCondition = getDateCondition('timestamp');
    const createdAtDateCondition = getDateCondition('created_at');

    const analyticsResult = await pool.query(
      `
      SELECT
        COUNT(*) FILTER (WHERE event_type = 'page_view' ${analyticsDateCondition})::int AS page_views,
        COUNT(*) FILTER (WHERE event_type = 'tool_click' ${analyticsDateCondition})::int AS tool_clicks,
        COUNT(*) FILTER (WHERE event_type = 'cta_click' ${analyticsDateCondition})::int AS cta_clicks,
        COUNT(*) FILTER (WHERE event_type = 'search' ${analyticsDateCondition})::int AS searches,
        COUNT(*) FILTER (WHERE event_type = 'share' ${analyticsDateCondition})::int AS shares
      FROM analytics
    `,
    );

    const favoritesResult = await pool.query(
      `
      SELECT COUNT(*)::int AS favorites
      FROM favorites
      WHERE 1 = 1 ${createdAtDateCondition}
    `,
    );

    const claimsResult = await pool.query(
      `
      SELECT
        COUNT(*)::int AS claim_leads,
        COUNT(*) FILTER (WHERE status = 'new' AND created_at >= NOW() - INTERVAL '24 hours')::int AS fresh_claim_leads,
        COUNT(*) FILTER (WHERE status = 'new' AND created_at <= NOW() - INTERVAL '48 hours')::int AS overdue_claim_leads
      FROM tool_claims
      WHERE 1 = 1 ${createdAtDateCondition}
    `,
    );

    const submissionsResult = await pool.query(
      `
      SELECT
        COUNT(*) FILTER (WHERE submitted_by IS NOT NULL ${createdAtDateCondition})::int AS submissions,
        COUNT(*) FILTER (WHERE submitted_by IS NOT NULL AND status = 'published' ${createdAtDateCondition})::int AS published_submissions,
        COUNT(*) FILTER (
          WHERE submitted_by IS NOT NULL
            AND COALESCE(features->'submission'->'commercial'->>'plan', 'free') = 'standard_paid'
            ${createdAtDateCondition}
        )::int AS paid_submissions
      FROM tools
    `,
    );

    const row = analyticsResult.rows[0] || {};
    const favoriteRow = favoritesResult.rows[0] || {};
    const submissionRow = submissionsResult.rows[0] || {};

    const pageViews = Number.parseInt(String(row.page_views || '0'), 10);
    const toolClicks = Number.parseInt(String(row.tool_clicks || '0'), 10);
    const ctaClicks = Number.parseInt(String(row.cta_clicks || '0'), 10);
    const searches = Number.parseInt(String(row.searches || '0'), 10);
    const shares = Number.parseInt(String(row.shares || '0'), 10);
    const favorites = Number.parseInt(String(favoriteRow.favorites || '0'), 10);
    const claimLeads = Number.parseInt(String(claimsResult.rows[0]?.claim_leads || '0'), 10);
    const freshClaimLeads = Number.parseInt(String(claimsResult.rows[0]?.fresh_claim_leads || '0'), 10);
    const overdueClaimLeads = Number.parseInt(String(claimsResult.rows[0]?.overdue_claim_leads || '0'), 10);
    const submissions = Number.parseInt(String(submissionRow.submissions || '0'), 10);
    const publishedSubmissions = Number.parseInt(String(submissionRow.published_submissions || '0'), 10);
    const paidSubmissions = Number.parseInt(String(submissionRow.paid_submissions || '0'), 10);

    return {
      pageViews,
      toolClicks,
      ctaClicks,
      searches,
      favorites,
      shares,
      claimLeads,
      freshClaimLeads,
      overdueClaimLeads,
      submissions,
      publishedSubmissions,
      paidSubmissions,
      pageToClickRate: pageViews > 0 ? (toolClicks / pageViews) * 100 : 0,
      pageToCtaRate: pageViews > 0 ? (ctaClicks / pageViews) * 100 : 0,
      submissionPublishRate: submissions > 0 ? (publishedSubmissions / submissions) * 100 : 0,
      paidSubmissionRate: submissions > 0 ? (paidSubmissions / submissions) * 100 : 0,
    };
  } catch (error) {
    console.error('Error fetching conversion snapshot:', error);
    return {
      pageViews: 0,
      toolClicks: 0,
      ctaClicks: 0,
      searches: 0,
      favorites: 0,
      shares: 0,
      claimLeads: 0,
      freshClaimLeads: 0,
      overdueClaimLeads: 0,
      submissions: 0,
      publishedSubmissions: 0,
      paidSubmissions: 0,
      pageToClickRate: 0,
      pageToCtaRate: 0,
      submissionPublishRate: 0,
      paidSubmissionRate: 0,
    };
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

function getPageTypeLabel(pageType: string): string {
  if (pageType === 'home') return 'Home';
  if (pageType === 'tool_detail') return 'Tool detail';
  if (pageType === 'guide') return 'Guide';
  if (pageType === 'category') return 'Category';
  if (pageType === 'explore') return 'Explore';
  if (pageType === 'best_ai_tools') return 'Top lists';
  if (pageType === 'best_ai_tools_topic') return 'Top list topic';
  if (pageType === 'pricing') return 'Pricing';
  if (pageType === 'submit') return 'Submit';
  if (pageType === 'claim_listing') return 'Claim listing';
  if (pageType === 'profile') return 'Profile';
  if (pageType === 'profile_submissions') return 'Submissions';
  return 'Other';
}

function getCtaPageTypeLabel(pageType: string): string {
  if (pageType === 'best_ai_tools') return 'Top lists';
  if (pageType === 'best_ai_tools_topic') return 'Top list topic';
  if (pageType === 'pricing') return 'Pricing';
  if (pageType === 'submit') return 'Submit';
  if (pageType === 'claim_listing') return 'Claim listing';
  if (pageType === 'profile') return 'Profile';
  if (pageType === 'profile_submissions') return 'Submissions';
  if (pageType === 'home') return 'Home';
  if (pageType === 'tool_detail') return 'Tool detail';
  if (pageType === 'guide') return 'Guide';
  if (pageType === 'category') return 'Category';
  if (pageType === 'explore') return 'Explore';
  return 'Other';
}

function buildPageViewDateCondition(range: 'all' | '7d' | '30d'): string {
  if (range === '7d') {
    return "AND a.timestamp >= NOW() - INTERVAL '7 days'";
  }

  if (range === '30d') {
    return "AND a.timestamp >= NOW() - INTERVAL '30 days'";
  }

  return '';
}

function normalizeSourcePath(value: string | null | undefined): string {
  const trimmed = (value || '').trim();

  if (!trimmed) {
    return 'unknown';
  }

  const withoutOrigin = trimmed.replace(/^https?:\/\/[^/]+/i, '');
  const pathOnly = withoutOrigin.split('?')[0]?.split('#')[0] || '';
  const normalized = (pathOnly || '/').replace(/^\/(en|cn|jp|de|es|fr|pt|ru|tw)(?=\/|$)/, '') || '/';
  return normalized;
}

function inferPageTypeFromSourcePath(sourcePath: string): string {
  if (sourcePath === '/') return 'home';
  if (sourcePath.startsWith('/guides')) return 'guide';
  if (sourcePath.startsWith('/ai/')) return 'tool_detail';
  if (sourcePath.startsWith('/categories')) return 'category';
  if (sourcePath.startsWith('/explore')) return 'explore';
  if (sourcePath === '/best-ai-tools') return 'best_ai_tools';
  if (sourcePath.startsWith('/best-ai-tools/')) return 'best_ai_tools_topic';
  if (sourcePath.startsWith('/pricing')) return 'pricing';
  if (sourcePath.startsWith('/submit')) return 'submit';
  if (sourcePath.startsWith('/developer/listing')) return 'claim_listing';
  if (sourcePath.startsWith('/profile') && !sourcePath.startsWith('/profile/submissions')) return 'profile';
  if (sourcePath.startsWith('/profile/submissions')) return 'profile_submissions';
  return 'other';
}

function buildAnalyticsDateCondition(range: 'all' | '7d' | '30d', column: string): string {
  if (range === '7d') {
    return `AND ${column} >= NOW() - INTERVAL '7 days'`;
  }

  if (range === '30d') {
    return `AND ${column} >= NOW() - INTERVAL '30 days'`;
  }

  return '';
}

/**
 * Get page-level access report
 */
export async function getPageAccessReport(
  range: 'all' | '7d' | '30d' = 'all',
  limit: number = 10,
): Promise<PageAccessReport> {
  try {
    const pool = getPool();
    const dateCondition = buildPageViewDateCondition(range);

    const baseCte = `
      WITH page_views AS (
        SELECT
          a.session_id,
          COALESCE(
            NULLIF(a.metadata->>'page_type', ''),
            CASE WHEN a.tool_id IS NOT NULL THEN 'tool_detail' ELSE 'other' END
          ) AS raw_page_type,
          COALESCE(
            NULLIF(a.metadata->>'page_path', ''),
            CASE
              WHEN a.tool_id IS NOT NULL THEN CONCAT('/ai/', COALESCE(t.name, a.tool_id::text))
              ELSE 'unknown'
            END
          ) AS page_path
        FROM analytics a
        LEFT JOIN tools t ON a.tool_id = t.id
        WHERE a.event_type = 'page_view' ${dateCondition}
      ),
      normalized_page_views AS (
        SELECT
          session_id,
          CASE
            WHEN raw_page_type = 'developer_listing' THEN 'claim_listing'
            ELSE raw_page_type
          END AS page_type,
          page_path
        FROM page_views
      )
    `;

    const summaryResult = await pool.query(
      `
      ${baseCte}
      SELECT
        page_type,
        COUNT(*)::int AS views,
        COUNT(DISTINCT session_id)::int AS unique_visitors
      FROM normalized_page_views
      GROUP BY page_type
      ORDER BY views DESC
    `,
    );

    const topPagesResult = await pool.query(
      `
      ${baseCte}
      SELECT
        page_path,
        page_type,
        COUNT(*)::int AS views,
        COUNT(DISTINCT session_id)::int AS unique_visitors
      FROM normalized_page_views
      GROUP BY page_path, page_type
      ORDER BY views DESC
      LIMIT $1
      `,
      [limit],
    );

    const familyTopPagesResult = await pool.query(
      `
      ${baseCte}
      , page_page_views AS (
        SELECT
          page_path,
          page_type,
          COUNT(*)::int AS views,
          COUNT(DISTINCT session_id)::int AS unique_visitors
        FROM normalized_page_views
        GROUP BY page_path, page_type
      ),
      ranked_page_views AS (
        SELECT
          page_path,
          page_type,
          views,
          unique_visitors,
          ROW_NUMBER() OVER (PARTITION BY page_type ORDER BY views DESC, page_path ASC) AS page_rank
        FROM page_page_views
      )
      SELECT
        page_path,
        page_type,
        views,
        unique_visitors,
        page_rank
      FROM ranked_page_views
      ORDER BY page_type ASC, views DESC, page_path ASC
    `,
    );

    const totalsResult = await pool.query(
      `
      ${baseCte}
      SELECT
        COUNT(*)::int AS total_views,
        COUNT(DISTINCT session_id)::int AS total_unique_visitors
      FROM normalized_page_views
    `,
    );

    const totalViews = Number.parseInt(String(totalsResult.rows[0]?.total_views || '0'), 10);
    const familyTopPagesByType = new Map<string, PageAccessPage[]>();

    familyTopPagesResult.rows.forEach((row) => {
      const pageType = String(row.page_type || 'other');
      const pageRank = Number.parseInt(String(row.page_rank || '0'), 10);

      if (pageRank > 3) {
        return;
      }

      const existing = familyTopPagesByType.get(pageType) || [];
      existing.push({
        pagePath: row.page_path,
        pageType,
        label: getPageTypeLabel(pageType),
        views: Number.parseInt(String(row.views || '0'), 10),
        uniqueVisitors: Number.parseInt(String(row.unique_visitors || '0'), 10),
      });
      familyTopPagesByType.set(pageType, existing);
    });

    return {
      summary: summaryResult.rows.map((row) => {
        const views = Number.parseInt(String(row.views || '0'), 10);
        const uniqueVisitors = Number.parseInt(String(row.unique_visitors || '0'), 10);

        return {
          pageType: row.page_type,
          label: getPageTypeLabel(row.page_type),
          views,
          uniqueVisitors,
          percentage: totalViews > 0 ? (views / totalViews) * 100 : 0,
        };
      }),
      topPages: topPagesResult.rows.map((row) => ({
        pagePath: row.page_path,
        pageType: row.page_type,
        label: getPageTypeLabel(row.page_type),
        views: Number.parseInt(String(row.views || '0'), 10),
        uniqueVisitors: Number.parseInt(String(row.unique_visitors || '0'), 10),
      })),
      familyBreakdown: summaryResult.rows.map((row) => {
        const pageType = String(row.page_type || 'other');
        const views = Number.parseInt(String(row.views || '0'), 10);
        const uniqueVisitors = Number.parseInt(String(row.unique_visitors || '0'), 10);

        return {
          pageType,
          label: getPageTypeLabel(pageType),
          views,
          uniqueVisitors,
          percentage: totalViews > 0 ? (views / totalViews) * 100 : 0,
          topPages: familyTopPagesByType.get(pageType) || [],
        };
      }),
      totalViews,
      totalUniqueVisitors: Number.parseInt(String(totalsResult.rows[0]?.total_unique_visitors || '0'), 10),
    };
  } catch (error) {
    console.error('Error fetching page access report:', error);
    return {
      summary: [],
      topPages: [],
      familyBreakdown: [],
      totalViews: 0,
      totalUniqueVisitors: 0,
    };
  }
}

/**
 * Get a compact CTA click report.
 */
export async function getCtaClickReport(
  range: 'all' | '7d' | '30d' = '30d',
  limit: number = 8,
): Promise<CtaClickReport> {
  try {
    const pool = getPool();
    const dateCondition = buildPageViewDateCondition(range);

    const baseCte = `
      WITH cta_clicks AS (
        SELECT
          a.session_id,
          COALESCE(NULLIF(a.metadata->>'page_type', ''), 'other') AS page_type,
          COALESCE(NULLIF(a.metadata->>'cta_id', ''), 'unknown') AS cta_id,
          COALESCE(NULLIF(a.metadata->>'cta_label', ''), NULLIF(a.metadata->>'cta_id', ''), 'Unknown CTA') AS cta_label,
          NULLIF(a.metadata->>'href', '') AS href
        FROM analytics a
        WHERE a.event_type = 'cta_click' ${dateCondition}
      )
    `;

    const summaryResult = await pool.query(
      `
      ${baseCte}
      SELECT
        page_type,
        COUNT(*)::int AS clicks,
        COUNT(DISTINCT session_id)::int AS unique_visitors
      FROM cta_clicks
      GROUP BY page_type
      ORDER BY clicks DESC
    `,
    );

    const topCtasResult = await pool.query(
      `
      ${baseCte}
      SELECT
        cta_id,
        cta_label,
        page_type,
        href,
        COUNT(*)::int AS clicks,
        COUNT(DISTINCT session_id)::int AS unique_visitors
      FROM cta_clicks
      GROUP BY cta_id, cta_label, page_type, href
      ORDER BY clicks DESC, cta_label ASC
      LIMIT $1
      `,
      [limit],
    );

    const totalsResult = await pool.query(
      `
      ${baseCte}
      SELECT
        COUNT(*)::int AS total_clicks,
        COUNT(DISTINCT session_id)::int AS total_unique_visitors
      FROM cta_clicks
    `,
    );

    const totalClicks = Number.parseInt(String(totalsResult.rows[0]?.total_clicks || '0'), 10);

    return {
      summary: summaryResult.rows.map((row) => {
        const clicks = Number.parseInt(String(row.clicks || '0'), 10);

        return {
          pageType: String(row.page_type || 'other'),
          label: getCtaPageTypeLabel(String(row.page_type || 'other')),
          clicks,
          uniqueVisitors: Number.parseInt(String(row.unique_visitors || '0'), 10),
          percentage: totalClicks > 0 ? (clicks / totalClicks) * 100 : 0,
        };
      }),
      topCtas: topCtasResult.rows.map((row) => {
        const clicks = Number.parseInt(String(row.clicks || '0'), 10);

        return {
          ctaId: String(row.cta_id || 'unknown'),
          ctaLabel: String(row.cta_label || 'Unknown CTA'),
          pageType: String(row.page_type || 'other'),
          pageLabel: getCtaPageTypeLabel(String(row.page_type || 'other')),
          href: row.href ? String(row.href) : null,
          clicks,
          uniqueVisitors: Number.parseInt(String(row.unique_visitors || '0'), 10),
          percentage: totalClicks > 0 ? (clicks / totalClicks) * 100 : 0,
        };
      }),
      totalClicks,
      totalUniqueVisitors: Number.parseInt(String(totalsResult.rows[0]?.total_unique_visitors || '0'), 10),
    };
  } catch (error) {
    console.error('Error fetching CTA click report:', error);
    return {
      summary: [],
      topCtas: [],
      totalClicks: 0,
      totalUniqueVisitors: 0,
    };
  }
}

/**
 * Get CTA click trend comparing current vs previous period.
 */
export async function getCtaClickTrend(range: '7d' | '30d' = '7d'): Promise<CtaClickTrend> {
  try {
    const pool = getPool();
    const currentInterval = range === '30d' ? '30 days' : '7 days';
    const previousInterval = range === '30d' ? '30 days' : '7 days';

    const result = await pool.query(
      `
      WITH base AS (
        SELECT
          COALESCE(NULLIF(metadata->>'page_type', ''), 'other') AS page_type,
          COALESCE(NULLIF(metadata->>'cta_id', ''), 'unknown') AS cta_id,
          COALESCE(NULLIF(metadata->>'cta_label', ''), NULLIF(metadata->>'cta_id', ''), 'Unknown CTA') AS cta_label,
          NULLIF(metadata->>'href', '') AS href,
          session_id,
          timestamp
        FROM analytics
        WHERE event_type = 'cta_click'
      ),
      scoped AS (
        SELECT
          CASE
            WHEN timestamp >= NOW() - INTERVAL '${currentInterval}' THEN 'current'
            WHEN timestamp >= NOW() - INTERVAL '${currentInterval}' - INTERVAL '${previousInterval}' THEN 'previous'
            ELSE NULL
          END AS period,
          page_type,
          cta_id,
          cta_label,
          href,
          session_id
        FROM base
        WHERE timestamp >= NOW() - INTERVAL '${currentInterval}' - INTERVAL '${previousInterval}'
      ),
      aggregated AS (
        SELECT
          period,
          page_type,
          cta_id,
          cta_label,
          href,
          COUNT(*)::int AS clicks,
          COUNT(DISTINCT session_id)::int AS unique_visitors
        FROM scoped
        WHERE period IS NOT NULL
        GROUP BY period, page_type, cta_id, cta_label, href
      )
      SELECT * FROM aggregated
    `,
    );

    const countsByPeriod = new Map<string, Map<string, { clicks: number; uniqueVisitors: number }>>();
    const metaByKey = new Map<string, { ctaId: string; ctaLabel: string; pageType: string; href: string | null }>();
    let currentClicks = 0;
    let previousClicks = 0;
    let currentUniqueVisitors = 0;
    let previousUniqueVisitors = 0;

    result.rows.forEach((row) => {
      const period = String(row.period || 'current');
      const pageType = String(row.page_type || 'other');
      const ctaId = String(row.cta_id || 'unknown');
      const ctaLabel = String(row.cta_label || ctaId);
      const href = row.href ? String(row.href) : null;
      const clicks = Number.parseInt(String(row.clicks || '0'), 10);
      const uniqueVisitors = Number.parseInt(String(row.unique_visitors || '0'), 10);
      const key = `${pageType}:${ctaId}:${ctaLabel}:${href || ''}`;

      if (!countsByPeriod.has(period)) {
        countsByPeriod.set(period, new Map());
      }

      countsByPeriod.get(period)!.set(key, { clicks, uniqueVisitors });
      metaByKey.set(key, { ctaId, ctaLabel, pageType, href });

      if (period === 'current') {
        currentClicks += clicks;
        currentUniqueVisitors += uniqueVisitors;
      } else if (period === 'previous') {
        previousClicks += clicks;
        previousUniqueVisitors += uniqueVisitors;
      }
    });

    const items = Array.from(metaByKey.entries())
      .map(([key, meta]) => {
        const current = countsByPeriod.get('current')?.get(key)?.clicks || 0;
        const previous = countsByPeriod.get('previous')?.get(key)?.clicks || 0;
        let changePercent = 0;

        if (previous > 0) {
          changePercent = ((current - previous) / previous) * 100;
        } else if (current > 0) {
          changePercent = 100;
        }

        return {
          ctaId: meta.ctaId,
          ctaLabel: meta.ctaLabel,
          pageType: meta.pageType,
          pageLabel: getCtaPageTypeLabel(meta.pageType),
          href: meta.href,
          currentClicks: current,
          previousClicks: previous,
          changePercent,
        };
      })
      .sort((a, b) => b.currentClicks - a.currentClicks || b.changePercent - a.changePercent)
      .slice(0, 8);

    return {
      items,
      currentClicks,
      previousClicks,
      currentUniqueVisitors,
      previousUniqueVisitors,
    };
  } catch (error) {
    console.error('Error fetching CTA click trend:', error);
    return {
      items: [],
      currentClicks: 0,
      previousClicks: 0,
      currentUniqueVisitors: 0,
      previousUniqueVisitors: 0,
    };
  }
}

/**
 * Get the source pages that drive claim and payment intent.
 */
export async function getCommercialIntentReport(
  range: 'all' | '7d' | '30d' = '30d',
  limit: number = 10,
): Promise<CommercialIntentReport> {
  try {
    const pool = getPool();
    const dateCondition = buildAnalyticsDateCondition(range, 'timestamp');
    const rowsBySource = new Map<string, CommercialIntentCounts>();

    const addCount = (
      sourcePathRaw: string | null | undefined,
      key: 'pricingViews' | 'submitViews' | 'submitClicks' | 'claimClicks' | 'claimSubmissions' | 'checkoutStarts',
      countRaw: unknown,
    ) => {
      const sourcePath = normalizeSourcePath(sourcePathRaw);
      const count = Number.parseInt(String(countRaw || '0'), 10);

      if (count <= 0) {
        return;
      }

      const existing = rowsBySource.get(sourcePath) || {
        pageViews: 0,
        uniqueVisitors: 0,
        pricingViews: 0,
        submitViews: 0,
        submitClicks: 0,
        claimClicks: 0,
        claimSubmissions: 0,
        checkoutStarts: 0,
      };
      existing[key] += count;
      rowsBySource.set(sourcePath, existing);
    };

    const [pageViewResult, commerceViewResult, ctaResult, claimResult, checkoutResult] = await Promise.all([
      pool.query(
        `
        SELECT
          COALESCE(
            NULLIF(metadata->>'page_path', ''),
            CASE
              WHEN tool_id IS NOT NULL THEN CONCAT('/ai/', COALESCE(t.name, tool_id::text))
              ELSE NULL
            END
          ) AS source_path,
          COUNT(*)::int AS views,
          COUNT(DISTINCT session_id)::int AS unique_visitors
        FROM analytics a
        LEFT JOIN tools t ON a.tool_id = t.id
        WHERE event_type = 'page_view'
          ${dateCondition}
        GROUP BY 1
      `,
      ),
      pool.query(
        `
        SELECT
          COALESCE(
            NULLIF(metadata->>'page_path', ''),
            NULLIF(metadata->>'pagePath', ''),
            NULLIF(metadata->>'source_path', ''),
            NULLIF(regexp_replace(COALESCE(referrer, ''), '^https?://[^/]+', ''), '')
          ) AS source_path,
          CASE
            WHEN event_type = 'pricing_view' THEN 'pricing_view'
            WHEN event_type = 'submit_view' THEN 'submit_view'
            ELSE 'other'
          END AS view_type,
          COUNT(*)::int AS count
        FROM analytics
        WHERE event_type IN ('pricing_view', 'submit_view')
          ${dateCondition}
        GROUP BY 1, 2
      `,
      ),
      pool.query(
        `
        SELECT
          COALESCE(
            NULLIF(metadata->>'source_path', ''),
            NULLIF(regexp_replace(COALESCE(referrer, ''), '^https?://[^/]+', ''), '')
          ) AS source_path,
          CASE
            WHEN COALESCE(metadata->>'href', '') LIKE '%/submit%' THEN 'submit_click'
            WHEN COALESCE(metadata->>'href', '') LIKE '%/developer/listing%' THEN 'claim_click'
            ELSE 'other'
          END AS click_type,
          COUNT(*)::int AS count
        FROM analytics
        WHERE event_type = 'cta_click'
          ${dateCondition}
          AND (
            COALESCE(metadata->>'href', '') LIKE '%/submit%'
            OR COALESCE(metadata->>'href', '') LIKE '%/developer/listing%'
          )
        GROUP BY 1, 2
      `,
      ),
      pool.query(
        `
        SELECT
          COALESCE(
            NULLIF(metadata->>'sourcePath', ''),
            NULLIF(metadata->>'source_path', ''),
            NULLIF(regexp_replace(COALESCE(referrer, ''), '^https?://[^/]+', ''), '')
          ) AS source_path,
          COUNT(*)::int AS count
        FROM analytics
        WHERE event_type = 'claim_submit'
          ${dateCondition}
        GROUP BY 1
      `,
      ),
      pool.query(
        `
        SELECT
          COALESCE(
            NULLIF(metadata->>'sourcePath', ''),
            NULLIF(metadata->>'source_path', ''),
            NULLIF(regexp_replace(COALESCE(referrer, ''), '^https?://[^/]+', ''), '')
          ) AS source_path,
          COUNT(*)::int AS count
        FROM analytics
        WHERE event_type = 'checkout_create'
          ${dateCondition}
        GROUP BY 1
      `,
      ),
    ]);

    pageViewResult.rows.forEach((row) => {
      const sourcePath = normalizeSourcePath(row.source_path);
      const existing = rowsBySource.get(sourcePath) || {
        pageViews: 0,
        uniqueVisitors: 0,
        pricingViews: 0,
        submitViews: 0,
        submitClicks: 0,
        claimClicks: 0,
        claimSubmissions: 0,
        checkoutStarts: 0,
      };

      existing.pageViews += Number.parseInt(String(row.views || '0'), 10);
      existing.uniqueVisitors += Number.parseInt(String(row.unique_visitors || '0'), 10);
      rowsBySource.set(sourcePath, existing);
    });

    ctaResult.rows.forEach((row) => {
      const clickType = String(row.click_type || 'other');
      if (clickType === 'submit_click') {
        addCount(row.source_path, 'submitClicks', row.count);
      } else if (clickType === 'claim_click') {
        addCount(row.source_path, 'claimClicks', row.count);
      }
    });

    commerceViewResult.rows.forEach((row) => {
      const viewType = String(row.view_type || 'other');
      if (viewType === 'pricing_view') {
        addCount(row.source_path, 'pricingViews', row.count);
      } else if (viewType === 'submit_view') {
        addCount(row.source_path, 'submitViews', row.count);
      }
    });

    claimResult.rows.forEach((row) => {
      addCount(row.source_path, 'claimSubmissions', row.count);
    });

    checkoutResult.rows.forEach((row) => {
      addCount(row.source_path, 'checkoutStarts', row.count);
    });

    const rankedSources = Array.from(rowsBySource.entries())
      .map(([sourcePath, counts]) => {
        const pageType = inferPageTypeFromSourcePath(sourcePath);
        return {
          sourcePath,
          pageType,
          pageLabel: getPageTypeLabel(pageType),
          pageViews: counts.pageViews,
          uniqueVisitors: counts.uniqueVisitors,
          pricingViews: counts.pricingViews,
          submitViews: counts.submitViews,
          submitClicks: counts.submitClicks,
          claimClicks: counts.claimClicks,
          claimSubmissions: counts.claimSubmissions,
          checkoutStarts: counts.checkoutStarts,
          totalIntentActions:
            counts.submitClicks + counts.claimClicks + counts.claimSubmissions * 2 + counts.checkoutStarts * 2,
        };
      })
      .sort(
        (a, b) =>
          b.checkoutStarts - a.checkoutStarts ||
          b.claimSubmissions - a.claimSubmissions ||
          b.totalIntentActions - a.totalIntentActions ||
          a.sourcePath.localeCompare(b.sourcePath),
      );

    const sources = rankedSources.slice(0, limit);

    return {
      sources,
      totalPricingViews: rankedSources.reduce((sum, item) => sum + item.pricingViews, 0),
      totalSubmitViews: rankedSources.reduce((sum, item) => sum + item.submitViews, 0),
      totalSubmitClicks: rankedSources.reduce((sum, item) => sum + item.submitClicks, 0),
      totalClaimClicks: rankedSources.reduce((sum, item) => sum + item.claimClicks, 0),
      totalClaimSubmissions: rankedSources.reduce((sum, item) => sum + item.claimSubmissions, 0),
      totalCheckoutStarts: rankedSources.reduce((sum, item) => sum + item.checkoutStarts, 0),
    };
  } catch (error) {
    console.error('Error fetching commercial intent report:', error);
    return {
      sources: [],
      totalPricingViews: 0,
      totalSubmitViews: 0,
      totalSubmitClicks: 0,
      totalClaimClicks: 0,
      totalClaimSubmissions: 0,
      totalCheckoutStarts: 0,
    };
  }
}

export async function getAgentJourneyReport(range: 'all' | '7d' | '30d' = '30d'): Promise<AgentJourneyReport> {
  try {
    const pool = getPool();
    const dateCondition = buildAnalyticsDateCondition(range, 'timestamp');
    const rowsBySource = new Map<string, AgentJourneyCounts>(
      agentJourneyPages.map((item) => [
        item.sourcePath,
        {
          label: item.label,
          pageViews: 0,
          uniqueVisitors: 0,
          comparisonClicks: 0,
          rankingClicks: 0,
          submitClicks: 0,
          claimClicks: 0,
          claimSubmissions: 0,
          checkoutStarts: 0,
        },
      ]),
    );

    const agentSourcePaths = agentJourneyPages.map((item) => item.sourcePath);

    const [pageViewResult, ctaResult, claimResult, checkoutResult] = await Promise.all([
      pool.query(
        `
        SELECT
          COALESCE(
            NULLIF(metadata->>'page_path', ''),
            CASE
              WHEN tool_id IS NOT NULL THEN CONCAT('/ai/', COALESCE(t.name, tool_id::text))
              ELSE NULL
            END
          ) AS source_path,
          COUNT(*)::int AS views,
          COUNT(DISTINCT session_id)::int AS unique_visitors
        FROM analytics a
        LEFT JOIN tools t ON a.tool_id = t.id
        WHERE event_type = 'page_view'
          ${dateCondition}
          AND COALESCE(NULLIF(metadata->>'page_path', ''), '') = ANY($1)
        GROUP BY 1
      `,
        [agentSourcePaths],
      ),
      pool.query(
        `
        SELECT
          COALESCE(
            NULLIF(metadata->>'source_path', ''),
            NULLIF(regexp_replace(COALESCE(referrer, ''), '^https?://[^/]+', ''), '')
          ) AS source_path,
          CASE
            WHEN COALESCE(metadata->>'href', '') LIKE '%/guides/ai-tools-for-agents-comparison%' THEN 'comparison_click'
            WHEN COALESCE(metadata->>'href', '') LIKE '%/best-ai-tools/ai-agent-tools%' THEN 'ranking_click'
            WHEN COALESCE(metadata->>'href', '') LIKE '%/submit%' THEN 'submit_click'
            WHEN COALESCE(metadata->>'href', '') LIKE '%/developer/listing%' THEN 'claim_click'
            ELSE 'other'
          END AS click_type,
          COUNT(*)::int AS count
        FROM analytics
        WHERE event_type = 'cta_click'
          ${dateCondition}
          AND COALESCE(
            NULLIF(metadata->>'source_path', ''),
            NULLIF(regexp_replace(COALESCE(referrer, ''), '^https?://[^/]+', ''), '')
          ) = ANY($1)
        GROUP BY 1, 2
      `,
        [agentSourcePaths],
      ),
      pool.query(
        `
        SELECT
          COALESCE(
            NULLIF(metadata->>'sourcePath', ''),
            NULLIF(metadata->>'source_path', ''),
            NULLIF(regexp_replace(COALESCE(referrer, ''), '^https?://[^/]+', ''), '')
          ) AS source_path,
          COUNT(*)::int AS count
        FROM analytics
        WHERE event_type = 'claim_submit'
          ${dateCondition}
          AND COALESCE(
            NULLIF(metadata->>'sourcePath', ''),
            NULLIF(metadata->>'source_path', ''),
            NULLIF(regexp_replace(COALESCE(referrer, ''), '^https?://[^/]+', ''), '')
          ) = ANY($1)
        GROUP BY 1
      `,
        [agentSourcePaths],
      ),
      pool.query(
        `
        SELECT
          COALESCE(
            NULLIF(metadata->>'sourcePath', ''),
            NULLIF(metadata->>'source_path', ''),
            NULLIF(regexp_replace(COALESCE(referrer, ''), '^https?://[^/]+', ''), '')
          ) AS source_path,
          COUNT(*)::int AS count
        FROM analytics
        WHERE event_type = 'checkout_create'
          ${dateCondition}
          AND COALESCE(
            NULLIF(metadata->>'sourcePath', ''),
            NULLIF(metadata->>'source_path', ''),
            NULLIF(regexp_replace(COALESCE(referrer, ''), '^https?://[^/]+', ''), '')
          ) = ANY($1)
        GROUP BY 1
      `,
        [agentSourcePaths],
      ),
    ]);

    pageViewResult.rows.forEach((row) => {
      const sourcePath = normalizeSourcePath(row.source_path);
      const existing = rowsBySource.get(sourcePath);
      if (!existing) return;

      existing.pageViews += Number.parseInt(String(row.views || '0'), 10);
      existing.uniqueVisitors += Number.parseInt(String(row.unique_visitors || '0'), 10);
    });

    ctaResult.rows.forEach((row) => {
      const sourcePath = normalizeSourcePath(row.source_path);
      const existing = rowsBySource.get(sourcePath);
      if (!existing) return;

      const count = Number.parseInt(String(row.count || '0'), 10);
      const clickType = String(row.click_type || 'other');

      if (clickType === 'comparison_click') existing.comparisonClicks += count;
      if (clickType === 'ranking_click') existing.rankingClicks += count;
      if (clickType === 'submit_click') existing.submitClicks += count;
      if (clickType === 'claim_click') existing.claimClicks += count;
    });

    claimResult.rows.forEach((row) => {
      const sourcePath = normalizeSourcePath(row.source_path);
      const existing = rowsBySource.get(sourcePath);
      if (!existing) return;
      existing.claimSubmissions += Number.parseInt(String(row.count || '0'), 10);
    });

    checkoutResult.rows.forEach((row) => {
      const sourcePath = normalizeSourcePath(row.source_path);
      const existing = rowsBySource.get(sourcePath);
      if (!existing) return;
      existing.checkoutStarts += Number.parseInt(String(row.count || '0'), 10);
    });

    const sources = Array.from(rowsBySource.entries())
      .map(([sourcePath, counts]) => ({
        sourcePath,
        label: counts.label,
        pageViews: counts.pageViews,
        uniqueVisitors: counts.uniqueVisitors,
        comparisonClicks: counts.comparisonClicks,
        rankingClicks: counts.rankingClicks,
        submitClicks: counts.submitClicks,
        claimClicks: counts.claimClicks,
        claimSubmissions: counts.claimSubmissions,
        checkoutStarts: counts.checkoutStarts,
        totalIntentActions:
          counts.comparisonClicks +
          counts.rankingClicks +
          counts.submitClicks +
          counts.claimClicks +
          counts.claimSubmissions * 2 +
          counts.checkoutStarts * 2,
      }))
      .sort(
        (a, b) =>
          b.totalIntentActions - a.totalIntentActions ||
          b.pageViews - a.pageViews ||
          a.sourcePath.localeCompare(b.sourcePath),
      );

    return {
      sources,
      totalPageViews: sources.reduce((sum, item) => sum + item.pageViews, 0),
      totalComparisonClicks: sources.reduce((sum, item) => sum + item.comparisonClicks, 0),
      totalRankingClicks: sources.reduce((sum, item) => sum + item.rankingClicks, 0),
      totalSubmitClicks: sources.reduce((sum, item) => sum + item.submitClicks, 0),
      totalClaimClicks: sources.reduce((sum, item) => sum + item.claimClicks, 0),
      totalClaimSubmissions: sources.reduce((sum, item) => sum + item.claimSubmissions, 0),
      totalCheckoutStarts: sources.reduce((sum, item) => sum + item.checkoutStarts, 0),
    };
  } catch (error) {
    console.error('Error fetching agent journey report:', error);
    return {
      sources: [],
      totalPageViews: 0,
      totalComparisonClicks: 0,
      totalRankingClicks: 0,
      totalSubmitClicks: 0,
      totalClaimClicks: 0,
      totalClaimSubmissions: 0,
      totalCheckoutStarts: 0,
    };
  }
}

/**
 * Get page access trend comparing current vs previous period.
 */
export async function getPageAccessTrend(range: '7d' | '30d' = '7d'): Promise<PageAccessTrend> {
  try {
    const pool = getPool();
    const currentInterval = range === '30d' ? '30 days' : '7 days';
    const previousInterval = range === '30d' ? '30 days' : '7 days';

    const result = await pool.query(
      `
      WITH base AS (
        SELECT
          COALESCE(
            NULLIF(metadata->>'page_type', ''),
            CASE WHEN tool_id IS NOT NULL THEN 'tool_detail' ELSE 'other' END
          ) AS page_type,
          session_id,
          timestamp
        FROM analytics
        WHERE event_type = 'page_view'
      ),
      scoped AS (
        SELECT
          CASE
            WHEN timestamp >= NOW() - INTERVAL '${currentInterval}' THEN 'current'
            WHEN timestamp >= NOW() - INTERVAL '${currentInterval}' - INTERVAL '${previousInterval}' THEN 'previous'
            ELSE NULL
          END AS period,
          page_type,
          session_id
        FROM base
        WHERE timestamp >= NOW() - INTERVAL '${currentInterval}' - INTERVAL '${previousInterval}'
      ),
      aggregated AS (
        SELECT
          period,
          page_type,
          COUNT(*)::int AS views,
          COUNT(DISTINCT session_id)::int AS unique_visitors
        FROM scoped
        WHERE period IS NOT NULL
        GROUP BY period, page_type
      )
      SELECT * FROM aggregated
    `,
    );

    const countsByPeriod = new Map<string, Map<string, { views: number; uniqueVisitors: number }>>();
    let currentViews = 0;
    let previousViews = 0;
    let currentUniqueVisitors = 0;
    let previousUniqueVisitors = 0;

    result.rows.forEach((row) => {
      const period = String(row.period || 'current');
      const pageType = String(row.page_type || 'other');
      const views = Number.parseInt(String(row.views || '0'), 10);
      const uniqueVisitors = Number.parseInt(String(row.unique_visitors || '0'), 10);

      if (!countsByPeriod.has(period)) {
        countsByPeriod.set(period, new Map());
      }
      countsByPeriod.get(period)!.set(pageType, { views, uniqueVisitors });

      if (period === 'current') {
        currentViews += views;
        currentUniqueVisitors += uniqueVisitors;
      } else if (period === 'previous') {
        previousViews += views;
        previousUniqueVisitors += uniqueVisitors;
      }
    });

    const pageTypes = [
      'home',
      'tool_detail',
      'guide',
      'category',
      'explore',
      'best_ai_tools',
      'best_ai_tools_topic',
      'claim_listing',
      'profile',
      'profile_submissions',
      'other',
    ];
    const items = pageTypes.map((pageType) => {
      const current = countsByPeriod.get('current')?.get(pageType)?.views || 0;
      const previous = countsByPeriod.get('previous')?.get(pageType)?.views || 0;
      let changePercent = 0;

      if (previous > 0) {
        changePercent = ((current - previous) / previous) * 100;
      } else if (current > 0) {
        changePercent = 100;
      }

      return {
        pageType,
        label: getPageTypeLabel(pageType),
        currentViews: current,
        previousViews: previous,
        changePercent,
      };
    });

    return {
      items,
      currentViews,
      previousViews,
      currentUniqueVisitors,
      previousUniqueVisitors,
    };
  } catch (error) {
    console.error('Error fetching page access trend:', error);
    return {
      items: [],
      currentViews: 0,
      previousViews: 0,
      currentUniqueVisitors: 0,
      previousUniqueVisitors: 0,
    };
  }
}
