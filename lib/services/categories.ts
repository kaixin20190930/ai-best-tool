/**
 * Categories Service
 * 
 * 提供分类数据的查询功能，支持多语言
 */

import { query } from '@/db/neon/client';
import { cached, CacheTTL } from '@/lib/cache';

/**
 * 分类数据类型
 */
export interface Category {
  id: string;
  name: Record<string, string>; // JSONB: { en: string, zh: string }
  slug: string;
  description: Record<string, string> | null;
  icon: string | null;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 分类统计信息
 */
export interface CategoryWithCount extends Category {
  toolCount: number;
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
  jsonbField: Record<string, string> | null,
  locale: string = 'en',
  fallback: string = 'en'
): string {
  if (!jsonbField) return '';
  return jsonbField[locale] || jsonbField[fallback] || Object.values(jsonbField)[0] || '';
}

/**
 * 获取所有分类（带缓存）
 * 
 * @param includeToolCount 是否包含工具数量统计
 * @returns 分类列表
 */
export async function getAllCategories(
  includeToolCount: boolean = false
): Promise<Category[] | CategoryWithCount[]> {
  return cached(
    `categories:all:${includeToolCount}`,
    async () => {
      if (includeToolCount) {
        const sql = `
          SELECT 
            c.id,
            c.name,
            c.slug,
            c.description,
            c.icon,
            c.order_index as "orderIndex",
            c.created_at as "createdAt",
            c.updated_at as "updatedAt",
            COUNT(t.id)::int as "toolCount"
          FROM categories c
          LEFT JOIN tools t ON t.category_id = c.id AND t.status = 'published'
          GROUP BY c.id
          ORDER BY c.order_index ASC, c.created_at ASC
        `;
        
        const result = await query<CategoryWithCount>(sql);
        return result.rows;
      } else {
        const sql = `
          SELECT 
            id,
            name,
            slug,
            description,
            icon,
            order_index as "orderIndex",
            created_at as "createdAt",
            updated_at as "updatedAt"
          FROM categories
          ORDER BY order_index ASC, created_at ASC
        `;
        
        const result = await query<Category>(sql);
        return result.rows;
      }
    },
    CacheTTL.LONG // 30 minutes cache
  );
}

/**
 * 根据 slug 获取分类
 * 
 * @param slug 分类 slug
 * @param includeToolCount 是否包含工具数量统计
 * @returns 分类信息
 */
export async function getCategoryBySlug(
  slug: string,
  includeToolCount: boolean = false
): Promise<Category | CategoryWithCount | null> {
  if (includeToolCount) {
    const sql = `
      SELECT 
        c.id,
        c.name,
        c.slug,
        c.description,
        c.icon,
        c.order_index as "orderIndex",
        c.created_at as "createdAt",
        c.updated_at as "updatedAt",
        COUNT(t.id)::int as "toolCount"
      FROM categories c
      LEFT JOIN tools t ON t.category_id = c.id AND t.status = 'published'
      WHERE c.slug = $1
      GROUP BY c.id
    `;
    
    const result = await query<CategoryWithCount>(sql, [slug]);
    return result.rows[0] || null;
  } else {
    const sql = `
      SELECT 
        id,
        name,
        slug,
        description,
        icon,
        order_index as "orderIndex",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM categories
      WHERE slug = $1
    `;
    
    const result = await query<Category>(sql, [slug]);
    return result.rows[0] || null;
  }
}

/**
 * 根据 ID 获取分类
 * 
 * @param id 分类 ID
 * @returns 分类信息
 */
export async function getCategoryById(id: string): Promise<Category | null> {
  const sql = `
    SELECT 
      id,
      name,
      slug,
      description,
      icon,
      order_index as "orderIndex",
      created_at as "createdAt",
      updated_at as "updatedAt"
    FROM categories
    WHERE id = $1
  `;
  
  const result = await query<Category>(sql, [id]);
  return result.rows[0] || null;
}

/**
 * 创建新分类
 * 
 * @param categoryData 分类数据
 * @returns 创建的分类
 */
export async function createCategory(
  categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Category> {
  const sql = `
    INSERT INTO categories (name, slug, description, icon, order_index)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING 
      id,
      name,
      slug,
      description,
      icon,
      order_index as "orderIndex",
      created_at as "createdAt",
      updated_at as "updatedAt"
  `;
  
  const values = [
    JSON.stringify(categoryData.name),
    categoryData.slug,
    categoryData.description ? JSON.stringify(categoryData.description) : null,
    categoryData.icon,
    categoryData.orderIndex,
  ];
  
  const result = await query<Category>(sql, values);
  return result.rows[0];
}

/**
 * 更新分类
 * 
 * @param id 分类 ID
 * @param categoryData 更新的数据
 * @returns 更新后的分类
 */
export async function updateCategory(
  id: string,
  categoryData: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Category | null> {
  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;
  
  if (categoryData.name !== undefined) {
    updates.push(`name = $${paramIndex++}`);
    values.push(JSON.stringify(categoryData.name));
  }
  if (categoryData.slug !== undefined) {
    updates.push(`slug = $${paramIndex++}`);
    values.push(categoryData.slug);
  }
  if (categoryData.description !== undefined) {
    updates.push(`description = $${paramIndex++}`);
    values.push(categoryData.description ? JSON.stringify(categoryData.description) : null);
  }
  if (categoryData.icon !== undefined) {
    updates.push(`icon = $${paramIndex++}`);
    values.push(categoryData.icon);
  }
  if (categoryData.orderIndex !== undefined) {
    updates.push(`order_index = $${paramIndex++}`);
    values.push(categoryData.orderIndex);
  }
  
  if (updates.length === 0) {
    return getCategoryById(id);
  }
  
  updates.push(`updated_at = NOW()`);
  values.push(id);
  
  const sql = `
    UPDATE categories
    SET ${updates.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING 
      id,
      name,
      slug,
      description,
      icon,
      order_index as "orderIndex",
      created_at as "createdAt",
      updated_at as "updatedAt"
  `;
  
  const result = await query<Category>(sql, values);
  return result.rows[0] || null;
}

/**
 * 删除分类
 * 
 * @param id 分类 ID
 * @returns 是否删除成功
 */
export async function deleteCategory(id: string): Promise<boolean> {
  const sql = 'DELETE FROM categories WHERE id = $1 RETURNING id';
  const result = await query(sql, [id]);
  return result.rowCount !== null && result.rowCount > 0;
}

/**
 * 获取分类下的工具数量
 * 
 * @param categoryId 分类 ID
 * @param status 工具状态（可选）
 * @returns 工具数量
 */
export async function getCategoryToolCount(
  categoryId: string,
  status?: 'draft' | 'pending' | 'published' | 'rejected'
): Promise<number> {
  let sql = 'SELECT COUNT(*) as count FROM tools WHERE category_id = $1';
  const params: any[] = [categoryId];
  
  if (status) {
    sql += ' AND status = $2';
    params.push(status);
  }
  
  const result = await query<{ count: string }>(sql, params);
  return parseInt(result.rows[0].count, 10);
}

/**
 * 获取热门分类（按工具数量排序）
 * 
 * @param limit 返回数量限制
 * @returns 分类列表
 */
export async function getPopularCategories(limit: number = 10): Promise<CategoryWithCount[]> {
  const sql = `
    SELECT 
      c.id,
      c.name,
      c.slug,
      c.description,
      c.icon,
      c.order_index as "orderIndex",
      c.created_at as "createdAt",
      c.updated_at as "updatedAt",
      COUNT(t.id)::int as "toolCount"
    FROM categories c
    LEFT JOIN tools t ON t.category_id = c.id AND t.status = 'published'
    GROUP BY c.id
    HAVING COUNT(t.id) > 0
    ORDER BY "toolCount" DESC
    LIMIT $1
  `;
  
  const result = await query<CategoryWithCount>(sql, [limit]);
  return result.rows;
}
