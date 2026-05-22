'use server';

/**
 * Search Actions
 * 
 * Server actions for search functionality including:
 * - Tool search with full-text search
 * - Search history management
 * - Search suggestions
 */

import { getTools, searchTools, Tool } from '@/lib/services/tools';
import { PaginatedResult } from '@/lib/services/tools';
import { getLocalizedToolValue } from '@/lib/services/toolPresenter';
import { trackSearch as trackSearchAnalytics } from '@/app/actions/analytics';

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
  pageSize: number = 20
): Promise<PaginatedResult<Tool>> {
  try {
    if (!query || query.trim().length === 0) {
      // Return all published tools if no search query
      return await getTools(
        { status: 'published' },
        { page, pageSize },
        'popular'
      );
    }

    const results = await searchTools(query.trim(), { page, pageSize });
    
    // Track search analytics
    trackSearchAnalytics(query.trim(), results.total).catch(err =>
      console.error('Failed to track search:', err)
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
export async function getSearchSuggestions(
  partialQuery: string,
  limit: number = 5
): Promise<string[]> {
  try {
    if (!partialQuery || partialQuery.trim().length < 2) {
      return [];
    }

    // Search for tools matching the partial query
    const results = await searchTools(partialQuery.trim(), { page: 1, pageSize: limit });
    
    // Extract unique titles as suggestions
    const suggestions = results.data
      .map(tool => {
        return getLocalizedToolValue(tool.title, 'en');
      })
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
export async function getSearchHistory(
  userId?: string,
  limit: number = 10
): Promise<string[]> {
  // TODO: Implement with user authentication and database storage
  // For now, return empty array
  return [];
}

/**
 * Save search query to history
 * Note: This is a placeholder for future implementation with user authentication
 * 
 * @param userId User ID
 * @param query Search query
 */
export async function saveSearchHistory(
  userId: string,
  query: string
): Promise<void> {
  // TODO: Implement with user authentication and database storage
  // This will be implemented when user authentication is added (task 5)
}

/**
 * Clear search history for a user
 * Note: This is a placeholder for future implementation with user authentication
 * 
 * @param userId User ID
 */
export async function clearSearchHistory(userId: string): Promise<void> {
  // TODO: Implement with user authentication and database storage
}

