'use server';

/**
 * Search Actions
 *
 * Server actions for search functionality including:
 * - Tool search with full-text search
 * - Search history management
 * - Search suggestions
 */
import { query as dbQuery } from '@/db/neon/client';

import { getLocalizedToolValue } from '@/lib/services/toolPresenter';
import { getTools, PaginatedResult, searchTools, Tool } from '@/lib/services/tools';
import { createClient } from '@/lib/supabase/server';
import { trackSearch as trackSearchAnalytics } from '@/app/actions/analytics';

async function resolveSearchHistoryUserId(userId?: string): Promise<string | null> {
  if (userId) {
    return userId;
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return user?.id || null;
  } catch (error) {
    console.error('Failed to resolve search history user:', error);
    return null;
  }
}

export async function saveSearchHistory(
  userId: string | undefined,
  query: string,
  resultCount: number = 0,
): Promise<void> {
  try {
    const resolvedUserId = await resolveSearchHistoryUserId(userId);
    if (!resolvedUserId) {
      return;
    }

    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      return;
    }

    await dbQuery(
      `
        INSERT INTO analytics (event_type, user_id, metadata, timestamp)
        VALUES ($1, $2, $3, NOW())
      `,
      [
        'search_history',
        resolvedUserId,
        JSON.stringify({
          query: normalizedQuery,
          resultCount,
        }),
      ],
    );
  } catch (error) {
    console.error('Save search history error:', error);
  }
}

/**
 * Search tools by keyword
 *
 * @param query Search keyword
 * @param page Page number (default: 1)
 * @param pageSize Page size (default: 20)
 * @returns Paginated search results
 */
export async function searchToolsAction(
  query: string,
  page: number = 1,
  pageSize: number = 20,
): Promise<PaginatedResult<Tool>> {
  try {
    if (!query || query.trim().length === 0) {
      // Return all published tools if no search query
      return await getTools({ status: 'published' }, { page, pageSize }, 'popular');
    }

    const results = await searchTools(query.trim(), { page, pageSize });

    // Track search analytics
    trackSearchAnalytics(query.trim(), results.total).catch((err) => console.error('Failed to track search:', err));
    saveSearchHistory(undefined, query.trim(), results.total).catch((err) =>
      console.error('Failed to save search history:', err),
    );

    return results;
  } catch (error) {
    console.error('Search error:', error);
    throw new Error('搜索失败，请稍后重试');
  }
}

/**
 * Get search suggestions based on partial query
 *
 * @param partialQuery Partial search query
 * @param limit Maximum number of suggestions (default: 5)
 * @returns Array of suggested search terms
 */
export async function getSearchSuggestions(partialQuery: string, limit: number = 5): Promise<string[]> {
  try {
    if (!partialQuery || partialQuery.trim().length < 2) {
      return [];
    }

    // Search for tools matching the partial query
    const results = await searchTools(partialQuery.trim(), { page: 1, pageSize: limit });

    // Extract unique titles as suggestions
    const suggestions = results.data
      .map((tool) => getLocalizedToolValue(tool.title, 'en'))
      .filter((title, index, self) => self.indexOf(title) === index)
      .slice(0, limit);

    return suggestions;
  } catch (error) {
    console.error('Get suggestions error:', error);
    return [];
  }
}

/**
 * Get search history for a user
 * Note: This is a placeholder for future implementation with user authentication
 *
 * @param userId User ID
 * @param limit Maximum number of history items (default: 10)
 * @returns Array of recent search queries
 */
export async function getSearchHistory(userId?: string, limit: number = 10): Promise<string[]> {
  try {
    const resolvedUserId = await resolveSearchHistoryUserId(userId);
    if (!resolvedUserId) {
      return [];
    }

    const result = await dbQuery<{ query: string; timestamp: string }>(
      `
        SELECT
          COALESCE(NULLIF(metadata->>'query', ''), '') AS query,
          timestamp::text AS timestamp
        FROM analytics
        WHERE event_type = 'search_history'
          AND user_id = $1
          AND COALESCE(NULLIF(metadata->>'query', ''), '') <> ''
        ORDER BY timestamp DESC
        LIMIT $2
      `,
      [resolvedUserId, Math.max(limit, 1) * 3],
    );

    const seen = new Set<string>();
    return result.rows.reduce<string[]>((history, row) => {
      if (history.length >= limit) {
        return history;
      }

      const value = String(row.query || '').trim();
      if (!value) {
        return history;
      }

      const normalized = value.toLowerCase();
      if (seen.has(normalized)) {
        return history;
      }

      seen.add(normalized);
      history.push(value);
      return history;
    }, []);
  } catch (error) {
    console.error('Get search history error:', error);
    return [];
  }
}

/**
 * Clear search history for a user
 * Note: This is a placeholder for future implementation with user authentication
 *
 * @param userId User ID
 */
export async function clearSearchHistory(userId?: string): Promise<void> {
  try {
    const resolvedUserId = await resolveSearchHistoryUserId(userId);
    if (!resolvedUserId) {
      return;
    }

    await dbQuery(
      `
        DELETE FROM analytics
        WHERE event_type = 'search_history'
          AND user_id = $1
      `,
      [resolvedUserId],
    );
  } catch (error) {
    console.error('Clear search history error:', error);
  }
}
