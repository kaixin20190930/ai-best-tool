'use server';

/**
 * Analytics Actions
 *
 * 提供页面浏览、工具点击、比较点击等分析追踪功能
 */
import { headers } from 'next/headers';
import { query } from '@/db/neon/client';

/**
 * 分析事件类型
 */
export type AnalyticsEventType =
  | 'page_view'
  | 'tool_click'
  | 'compare_click'
  | 'search'
  | 'share'
  | 'feedback'
  | 'pricing_view'
  | 'submit_view'
  | 'checkout_create'
  | 'payment_success'
  | 'publish_success'
  | 'claim_submit';

async function getRequestContext() {
  const headersList = await headers();
  return {
    userAgent: headersList.get('user-agent') || '',
    referrer: headersList.get('referer') || '',
  };
}

async function insertAnalyticsEvent(
  eventType: AnalyticsEventType,
  input: {
    toolId?: string | null;
    userId?: string | null;
    metadata?: Record<string, unknown>;
  } = {},
): Promise<void> {
  const { userAgent, referrer } = await getRequestContext();

  await query(
    `INSERT INTO analytics (event_type, tool_id, user_id, metadata, user_agent, referrer, timestamp)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
    [
      eventType,
      input.toolId || null,
      input.userId || null,
      input.metadata ? JSON.stringify(input.metadata) : null,
      userAgent,
      referrer,
    ],
  );
}

export async function trackCommerceEvent(
  eventType: Exclude<
    AnalyticsEventType,
    'page_view' | 'tool_click' | 'compare_click' | 'search' | 'share' | 'feedback'
  >,
  metadata: Record<string, unknown> = {},
  toolId?: string | null,
  userId?: string | null,
): Promise<{ success: boolean; error?: string }> {
  try {
    await insertAnalyticsEvent(eventType, { toolId, userId, metadata });
    return { success: true };
  } catch (error) {
    console.error(`Error tracking ${eventType}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 追踪页面浏览
 *
 * @param toolId 工具 ID
 * @param userId 用户 ID（可选）
 * @returns 是否成功
 */
export async function trackPageView(toolId: string, userId?: string): Promise<{ success: boolean; error?: string }> {
  try {
    await insertAnalyticsEvent('page_view', { toolId, userId });

    // 增加工具的浏览量
    await query(
      `UPDATE tools 
       SET view_count = view_count + 1, updated_at = NOW()
       WHERE id = $1`,
      [toolId],
    );

    return { success: true };
  } catch (error) {
    console.error('Error tracking page view:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 追踪工具点击
 *
 * @param toolId 工具 ID
 * @param userId 用户 ID（可选）
 * @returns 是否成功
 */
export async function trackToolClick(toolId: string, userId?: string): Promise<{ success: boolean; error?: string }> {
  try {
    await insertAnalyticsEvent('tool_click', { toolId, userId });

    // 增加工具的点击量
    await query(
      `UPDATE tools 
       SET click_count = click_count + 1, updated_at = NOW()
       WHERE id = $1`,
      [toolId],
    );

    return { success: true };
  } catch (error) {
    console.error('Error tracking tool click:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 追踪比较入口点击
 *
 * @param toolId 工具 ID
 * @param compareHref 比较页路径
 * @param userId 用户 ID（可选）
 * @returns 是否成功
 */
export async function trackComparisonClick(
  toolId: string,
  compareHref: string,
  userId?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await insertAnalyticsEvent('compare_click', { toolId, userId, metadata: { compareHref } });

    return { success: true };
  } catch (error) {
    console.error('Error tracking comparison click:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 追踪搜索行为
 *
 * @param searchQuery 搜索关键词
 * @param resultCount 结果数量
 * @param userId 用户 ID（可选）
 * @returns 是否成功
 */
export async function trackSearch(
  searchQuery: string,
  resultCount: number,
  userId?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await insertAnalyticsEvent('search', {
      userId,
      metadata: { query: searchQuery, resultCount },
    });

    return { success: true };
  } catch (error) {
    console.error('Error tracking search:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 追踪分享行为
 *
 * @param toolId 工具 ID
 * @param platform 分享平台
 * @param userId 用户 ID（可选）
 * @returns 是否成功
 */
export async function trackShare(
  toolId: string,
  platform: string,
  userId?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await insertAnalyticsEvent('share', { toolId, userId, metadata: { platform } });

    // 增加工具的分享量
    await query(
      `UPDATE tools 
       SET share_count = share_count + 1, updated_at = NOW()
       WHERE id = $1`,
      [toolId],
    );

    return { success: true };
  } catch (error) {
    console.error('Error tracking share:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 追踪轻量反馈
 *
 * @param toolId 工具 ID
 * @param feedbackType 反馈类型
 * @param userId 用户 ID（可选）
 * @returns 是否成功
 */
export async function trackFeedback(
  toolId: string,
  feedbackType: 'helpful' | 'needs_update' | 'inaccurate',
  userId?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await insertAnalyticsEvent('feedback', { toolId, userId, metadata: { type: feedbackType } });

    return { success: true };
  } catch (error) {
    console.error('Error tracking feedback:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 获取工具的统计信息
 *
 * @param toolId 工具 ID
 * @returns 统计信息
 */
export async function getToolStats(toolId: string): Promise<{
  viewCount: number;
  clickCount: number;
  shareCount: number;
  favoriteCount: number;
  averageRating: number;
  ratingCount: number;
}> {
  try {
    // 获取工具基本统计
    const toolResult = await query(
      `SELECT 
        view_count as "viewCount",
        click_count as "clickCount",
        share_count as "shareCount",
        average_rating as "averageRating",
        rating_count as "ratingCount"
       FROM tools
       WHERE id = $1`,
      [toolId],
    );

    // 获取收藏数
    const favoriteResult = await query(
      `SELECT COUNT(*)::int as count
       FROM favorites
       WHERE tool_id = $1`,
      [toolId],
    );

    const toolStats = toolResult.rows[0] || {
      viewCount: 0,
      clickCount: 0,
      shareCount: 0,
      averageRating: 0,
      ratingCount: 0,
    };

    const favoriteCount = favoriteResult.rows[0]?.count || 0;

    return {
      ...toolStats,
      favoriteCount,
    };
  } catch (error) {
    console.error('Error fetching tool stats:', error);
    return {
      viewCount: 0,
      clickCount: 0,
      shareCount: 0,
      favoriteCount: 0,
      averageRating: 0,
      ratingCount: 0,
    };
  }
}
