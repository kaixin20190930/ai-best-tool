/**
 * Tools Service
 * 
 * 提供工具数据的 CRUD 操作、分页、排序、筛选和全文搜索功能
 */

import { query } from '@/db/neon/client';
import { cached, CacheTTL, invalidateCache } from '@/lib/cache';

/**
 * 工具数据类型
 */
export interface Tool {
  id: string;
  name: string;
  title: Record<string, string>; // JSONB: { en: string, zh: string }
  content: Record<string, string>;
  detail: Record<string, string>;
  url: string;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  categoryId: string | null;
  tags: string[];
  pricing: 'free' | 'freemium' | 'paid';
  features: Record<string, any> | null;
  useCases: Record<string, any> | null;
  screenshots: string[] | null;
  videoUrl: string | null;
  status: 'draft' | 'pending' | 'published' | 'rejected';
  submittedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
  clickCount: number;
  shareCount: number;
  averageRating: number;
  ratingCount: number;
}

/**
 * 工具筛选条件
 */
export interface ToolFilters {
  category?: string; // category slug
  tags?: string[]; // tag slugs
  search?: string; // 搜索关键词
  pricing?: 'free' | 'freemium' | 'paid';
  status?: 'draft' | 'pending' | 'published' | 'rejected';
  submittedBy?: string;
}

/**
 * 排序选项
 */
export type SortBy = 'latest' | 'popular' | 'rating' | 'views' | 'clicks';

/**
 * 分页配置
 */
export interface PaginationConfig {
  page: number;
  pageSize: number;
}

/**
 * 分页结果
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 获取多语言字段的值
 * 
 * @param jsonbField JSONB 字段
 * @param locale 语言代码
 * @param fallback 回退语言
 * @returns 翻译后的文本
 */
export function getLocalizedField(
  jsonbField: Record<string, string>,
  locale: string = 'en',
  fallback: string = 'en'
): string {
  return jsonbField[locale] || jsonbField[fallback] || Object.values(jsonbField)[0] || '';
}

/**
 * 构建工具查询的 WHERE 子句
 */
function buildWhereClause(filters: ToolFilters): { clause: string; params: any[] } {
  const conditions: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;
  
  // 分类筛选
  if (filters.category) {
    conditions.push(`category_id = (SELECT id FROM categories WHERE slug = $${paramIndex})`);
    params.push(filters.category);
    paramIndex++;
  }
  
  // 标签筛选（包含所有选中的标签）
  if (filters.tags && filters.tags.length > 0) {
    conditions.push(`tags @> $${paramIndex}::text[]`);
    params.push(filters.tags);
    paramIndex++;
  }
  
  // 定价筛选
  if (filters.pricing) {
    conditions.push(`pricing = $${paramIndex}`);
    params.push(filters.pricing);
    paramIndex++;
  }
  
  // 状态筛选
  if (filters.status) {
    conditions.push(`status = $${paramIndex}`);
    params.push(filters.status);
    paramIndex++;
  }
  
  // 提交者筛选
  if (filters.submittedBy) {
    conditions.push(`submitted_by = $${paramIndex}`);
    params.push(filters.submittedBy);
    paramIndex++;
  }
  
  // 全文搜索
  if (filters.search) {
    conditions.push(`(
      search_vector @@ plainto_tsquery('english', $${paramIndex})
      OR title::text ILIKE $${paramIndex + 1}
      OR content::text ILIKE $${paramIndex + 1}
    )`);
    params.push(filters.search, `%${filters.search}%`);
    paramIndex += 2;
  }
  
  const clause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  return { clause, params };
}

/**
 * 构建排序子句
 */
function buildOrderByClause(sortBy: SortBy): string {
  switch (sortBy) {
    case 'latest':
      return 'ORDER BY created_at DESC';
    case 'popular':
      return 'ORDER BY (view_count + click_count * 2) DESC';
    case 'rating':
      return 'ORDER BY average_rating DESC, rating_count DESC';
    case 'views':
      return 'ORDER BY view_count DESC';
    case 'clicks':
      return 'ORDER BY click_count DESC';
    default:
      return 'ORDER BY created_at DESC';
  }
}

/**
 * 获取工具列表（带分页、筛选和排序）
 */
export async function getTools(
  filters: ToolFilters = {},
  pagination: PaginationConfig = { page: 1, pageSize: 20 },
  sortBy: SortBy = 'latest'
): Promise<PaginatedResult<Tool>> {
  const { clause, params } = buildWhereClause(filters);
  const orderBy = buildOrderByClause(sortBy);
  
  // 计算偏移量
  const offset = (pagination.page - 1) * pagination.pageSize;
  
  // 获取总数
  const countQuery = `SELECT COUNT(*) as total FROM tools ${clause}`;
  const countResult = await query<{ total: string }>(countQuery, params);
  const total = parseInt(countResult.rows[0].total, 10);
  
  // 获取数据
  const dataQuery = `
    SELECT 
      id, name, title, content, detail, url, image_url as "imageUrl",
      thumbnail_url as "thumbnailUrl", category_id as "categoryId", tags,
      pricing, features, use_cases as "useCases", screenshots, video_url as "videoUrl",
      status, submitted_by as "submittedBy", created_at as "createdAt",
      updated_at as "updatedAt", view_count as "viewCount", click_count as "clickCount",
      share_count as "shareCount", average_rating as "averageRating",
      rating_count as "ratingCount"
    FROM tools
    ${clause}
    ${orderBy}
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;
  
  const dataResult = await query<Tool>(dataQuery, [...params, pagination.pageSize, offset]);
  
  return {
    data: dataResult.rows,
    total,
    page: pagination.page,
    pageSize: pagination.pageSize,
    totalPages: Math.ceil(total / pagination.pageSize),
  };
}

/**
 * 根据 ID 获取工具详情
 */
export async function getToolById(id: string): Promise<Tool | null> {
  const sql = `
    SELECT 
      id, name, title, content, detail, url, image_url as "imageUrl",
      thumbnail_url as "thumbnailUrl", category_id as "categoryId", tags,
      pricing, features, use_cases as "useCases", screenshots, video_url as "videoUrl",
      status, submitted_by as "submittedBy", created_at as "createdAt",
      updated_at as "updatedAt", view_count as "viewCount", click_count as "clickCount",
      share_count as "shareCount", average_rating as "averageRating",
      rating_count as "ratingCount"
    FROM tools
    WHERE id = $1
  `;
  
  const result = await query<Tool>(sql, [id]);
  return result.rows[0] || null;
}

/**
 * 根据 name 获取工具详情
 */
export async function getToolByName(name: string): Promise<Tool | null> {
  const sql = `
    SELECT 
      id, name, title, content, detail, url, image_url as "imageUrl",
      thumbnail_url as "thumbnailUrl", category_id as "categoryId", tags,
      pricing, features, use_cases as "useCases", screenshots, video_url as "videoUrl",
      status, submitted_by as "submittedBy", created_at as "createdAt",
      updated_at as "updatedAt", view_count as "viewCount", click_count as "clickCount",
      share_count as "shareCount", average_rating as "averageRating",
      rating_count as "ratingCount"
    FROM tools
    WHERE name = $1
  `;
  
  const result = await query<Tool>(sql, [name]);
  return result.rows[0] || null;
}

/**
 * 创建新工具
 */
export async function createTool(
  toolData: Omit<Tool, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'clickCount' | 'shareCount' | 'averageRating' | 'ratingCount'>
): Promise<Tool> {
  const sql = `
    INSERT INTO tools (
      name, title, content, detail, url, image_url, thumbnail_url,
      category_id, tags, pricing, features, use_cases, screenshots,
      video_url, status, submitted_by
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    RETURNING 
      id, name, title, content, detail, url, image_url as "imageUrl",
      thumbnail_url as "thumbnailUrl", category_id as "categoryId", tags,
      pricing, features, use_cases as "useCases", screenshots, video_url as "videoUrl",
      status, submitted_by as "submittedBy", created_at as "createdAt",
      updated_at as "updatedAt", view_count as "viewCount", click_count as "clickCount",
      share_count as "shareCount", average_rating as "averageRating",
      rating_count as "ratingCount"
  `;
  
  const values = [
    toolData.name,
    JSON.stringify(toolData.title),
    JSON.stringify(toolData.content),
    JSON.stringify(toolData.detail),
    toolData.url,
    toolData.imageUrl,
    toolData.thumbnailUrl,
    toolData.categoryId,
    toolData.tags,
    toolData.pricing,
    toolData.features ? JSON.stringify(toolData.features) : null,
    toolData.useCases ? JSON.stringify(toolData.useCases) : null,
    toolData.screenshots,
    toolData.videoUrl,
    toolData.status,
    toolData.submittedBy,
  ];
  
  const result = await query<Tool>(sql, values);
  return result.rows[0];
}

/**
 * 更新工具
 */
export async function updateTool(
  id: string,
  toolData: Partial<Omit<Tool, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Tool | null> {
  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;
  
  // 动态构建 UPDATE 语句
  if (toolData.name !== undefined) {
    updates.push(`name = $${paramIndex++}`);
    values.push(toolData.name);
  }
  if (toolData.title !== undefined) {
    updates.push(`title = $${paramIndex++}`);
    values.push(JSON.stringify(toolData.title));
  }
  if (toolData.content !== undefined) {
    updates.push(`content = $${paramIndex++}`);
    values.push(JSON.stringify(toolData.content));
  }
  if (toolData.detail !== undefined) {
    updates.push(`detail = $${paramIndex++}`);
    values.push(JSON.stringify(toolData.detail));
  }
  if (toolData.url !== undefined) {
    updates.push(`url = $${paramIndex++}`);
    values.push(toolData.url);
  }
  if (toolData.imageUrl !== undefined) {
    updates.push(`image_url = $${paramIndex++}`);
    values.push(toolData.imageUrl);
  }
  if (toolData.thumbnailUrl !== undefined) {
    updates.push(`thumbnail_url = $${paramIndex++}`);
    values.push(toolData.thumbnailUrl);
  }
  if (toolData.categoryId !== undefined) {
    updates.push(`category_id = $${paramIndex++}`);
    values.push(toolData.categoryId);
  }
  if (toolData.tags !== undefined) {
    updates.push(`tags = $${paramIndex++}`);
    values.push(toolData.tags);
  }
  if (toolData.pricing !== undefined) {
    updates.push(`pricing = $${paramIndex++}`);
    values.push(toolData.pricing);
  }
  if (toolData.features !== undefined) {
    updates.push(`features = $${paramIndex++}`);
    values.push(toolData.features ? JSON.stringify(toolData.features) : null);
  }
  if (toolData.useCases !== undefined) {
    updates.push(`use_cases = $${paramIndex++}`);
    values.push(toolData.useCases ? JSON.stringify(toolData.useCases) : null);
  }
  if (toolData.screenshots !== undefined) {
    updates.push(`screenshots = $${paramIndex++}`);
    values.push(toolData.screenshots);
  }
  if (toolData.videoUrl !== undefined) {
    updates.push(`video_url = $${paramIndex++}`);
    values.push(toolData.videoUrl);
  }
  if (toolData.status !== undefined) {
    updates.push(`status = $${paramIndex++}`);
    values.push(toolData.status);
  }
  if (toolData.submittedBy !== undefined) {
    updates.push(`submitted_by = $${paramIndex++}`);
    values.push(toolData.submittedBy);
  }
  
  if (updates.length === 0) {
    return getToolById(id);
  }
  
  updates.push(`updated_at = NOW()`);
  values.push(id);
  
  const sql = `
    UPDATE tools
    SET ${updates.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING 
      id, name, title, content, detail, url, image_url as "imageUrl",
      thumbnail_url as "thumbnailUrl", category_id as "categoryId", tags,
      pricing, features, use_cases as "useCases", screenshots, video_url as "videoUrl",
      status, submitted_by as "submittedBy", created_at as "createdAt",
      updated_at as "updatedAt", view_count as "viewCount", click_count as "clickCount",
      share_count as "shareCount", average_rating as "averageRating",
      rating_count as "ratingCount"
  `;
  
  const result = await query<Tool>(sql, values);
  return result.rows[0] || null;
}

/**
 * 删除工具
 */
export async function deleteTool(id: string): Promise<boolean> {
  const sql = 'DELETE FROM tools WHERE id = $1 RETURNING id';
  const result = await query(sql, [id]);
  return result.rowCount !== null && result.rowCount > 0;
}

/**
 * 增加工具浏览量
 */
export async function incrementViewCount(id: string): Promise<void> {
  const sql = 'UPDATE tools SET view_count = view_count + 1 WHERE id = $1';
  await query(sql, [id]);
}

/**
 * 增加工具点击量
 */
export async function incrementClickCount(id: string): Promise<void> {
  const sql = 'UPDATE tools SET click_count = click_count + 1 WHERE id = $1';
  await query(sql, [id]);
}

/**
 * 增加工具分享量
 */
export async function incrementShareCount(id: string): Promise<void> {
  const sql = 'UPDATE tools SET share_count = share_count + 1 WHERE id = $1';
  await query(sql, [id]);
}

/**
 * 全文搜索工具
 */
export async function searchTools(
  searchQuery: string,
  pagination: PaginationConfig = { page: 1, pageSize: 20 }
): Promise<PaginatedResult<Tool>> {
  return getTools(
    { search: searchQuery, status: 'published' },
    pagination,
    'popular'
  );
}

/**
 * 获取热门工具（带缓存）
 */
export async function getPopularTools(limit: number = 10): Promise<Tool[]> {
  return cached(
    `popular-tools:${limit}`,
    async () => {
      const result = await getTools(
        { status: 'published' },
        { page: 1, pageSize: limit },
        'popular'
      );
      return result.data;
    },
    CacheTTL.MEDIUM // 5 minutes cache
  );
}

/**
 * 获取最新工具（带缓存）
 */
export async function getLatestTools(limit: number = 10): Promise<Tool[]> {
  return cached(
    `latest-tools:${limit}`,
    async () => {
      const result = await getTools(
        { status: 'published' },
        { page: 1, pageSize: limit },
        'latest'
      );
      return result.data;
    },
    CacheTTL.SHORT // 1 minute cache for latest
  );
}

/**
 * 获取评分最高的工具（带缓存）
 */
export async function getTopRatedTools(limit: number = 10): Promise<Tool[]> {
  return cached(
    `top-rated-tools:${limit}`,
    async () => {
      const result = await getTools(
        { status: 'published' },
        { page: 1, pageSize: limit },
        'rating'
      );
      return result.data;
    },
    CacheTTL.LONG // 30 minutes cache
  );
}

/**
 * 根据 name 获取工具详情（带缓存）
 */
export async function getToolByNameCached(name: string): Promise<Tool | null> {
  return cached(
    `tool:name:${name}`,
    async () => getToolByName(name),
    CacheTTL.HOUR // 1 hour cache
  );
}

/**
 * 根据 ID 获取工具详情（带缓存）
 */
export async function getToolByIdCached(id: string): Promise<Tool | null> {
  return cached(
    `tool:id:${id}`,
    async () => getToolById(id),
    CacheTTL.HOUR // 1 hour cache
  );
}

/**
 * 清除工具相关缓存
 */
export function clearToolCache(toolId?: string): void {
  if (toolId) {
    // Clear specific tool cache
    invalidateCache(`tool:id:${toolId}`);
    invalidateCache(`tool:name:*`);
  } else {
    // Clear all tool caches
    invalidateCache('tool:*');
    invalidateCache('popular-tools:*');
    invalidateCache('latest-tools:*');
    invalidateCache('top-rated-tools:*');
  }
}
