/**
 * Tags Service
 *
 * 提供标签数据的查询功能，支持多语言
 */

import { query } from '@/db/neon/client';

/**
 * 标签数据类型
 */
export interface Tag {
  id: string;
  name: Record<string, string>; // JSONB: { en: string, zh: string }
  slug: string;
  count: number;
  createdAt: Date;
}

export function humanizeTagSlug(slug: string): string {
  const normalized = slug
    .trim()
    .replace(/[_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!normalized) {
    return '';
  }

  return normalized
    .split('-')
    .filter(Boolean)
    .map((part) => {
      const first = part.charAt(0).toUpperCase();
      return `${first}${part.slice(1)}`;
    })
    .join(' ');
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
  fallback: string = 'en',
): string {
  if (!jsonbField) return '';
  return jsonbField[locale] || jsonbField[fallback] || Object.values(jsonbField)[0] || '';
}

/**
 * 获取所有标签
 *
 * @param sortBy 排序方式：'name' | 'count' | 'latest'
 * @returns 标签列表
 */
export async function getAllTags(sortBy: 'name' | 'count' | 'latest' = 'count'): Promise<Tag[]> {
  let orderBy = 'ORDER BY count DESC';

  if (sortBy === 'name') {
    orderBy = "ORDER BY name->>'en' ASC";
  } else if (sortBy === 'latest') {
    orderBy = 'ORDER BY created_at DESC';
  }

  const sql = `
    SELECT 
      id,
      name,
      slug,
      count,
      created_at as "createdAt"
    FROM tags
    ${orderBy}
  `;

  const result = await query<Tag>(sql);
  return result.rows;
}

/**
 * 根据 slug 获取标签
 *
 * @param slug 标签 slug
 * @returns 标签信息
 */
export async function getTagBySlug(slug: string): Promise<Tag | null> {
  const sql = `
    SELECT 
      id,
      name,
      slug,
      count,
      created_at as "createdAt"
    FROM tags
    WHERE slug = $1
  `;

  const result = await query<Tag>(sql, [slug]);
  return result.rows[0] || null;
}

/**
 * 根据 ID 获取标签
 *
 * @param id 标签 ID
 * @returns 标签信息
 */
export async function getTagById(id: string): Promise<Tag | null> {
  const sql = `
    SELECT 
      id,
      name,
      slug,
      count,
      created_at as "createdAt"
    FROM tags
    WHERE id = $1
  `;

  const result = await query<Tag>(sql, [id]);
  return result.rows[0] || null;
}

/**
 * 根据多个 slugs 获取标签
 *
 * @param slugs 标签 slug 数组
 * @returns 标签列表
 */
export async function getTagsBySlugs(slugs: string[]): Promise<Tag[]> {
  if (slugs.length === 0) {
    return [];
  }

  const sql = `
    SELECT 
      id,
      name,
      slug,
      count,
      created_at as "createdAt"
    FROM tags
    WHERE slug = ANY($1)
  `;

  const result = await query<Tag>(sql, [slugs]);
  return result.rows;
}

/**
 * 创建新标签
 *
 * @param tagData 标签数据
 * @returns 创建的标签
 */
export async function createTag(tagData: Omit<Tag, 'id' | 'count' | 'createdAt'>): Promise<Tag> {
  const sql = `
    INSERT INTO tags (name, slug)
    VALUES ($1, $2)
    RETURNING 
      id,
      name,
      slug,
      count,
      created_at as "createdAt"
  `;

  const values = [JSON.stringify(tagData.name), tagData.slug];

  const result = await query<Tag>(sql, values);
  return result.rows[0];
}

/**
 * Ensure tags exist for a set of slugs.
 * Missing tags are created with humanized English/Chinese names so they can render immediately.
 */
export async function ensureTagsExist(slugs: string[]): Promise<void> {
  const uniqueSlugs = Array.from(new Set(slugs.map((slug) => slug.trim()).filter(Boolean)));

  if (uniqueSlugs.length === 0) {
    return;
  }

  const values: unknown[] = [];
  const placeholders: string[] = [];

  uniqueSlugs.forEach((slug, index) => {
    const position = index * 2 + 1;
    placeholders.push(`($${position}, $${position + 1})`);
    values.push(
      JSON.stringify({
        en: humanizeTagSlug(slug),
        zh: humanizeTagSlug(slug),
      }),
      slug,
    );
  });

  await query(
    `
      INSERT INTO tags (name, slug)
      VALUES ${placeholders.join(', ')}
      ON CONFLICT (slug) DO NOTHING
    `,
    values,
  );
}

/**
 * 更新标签
 *
 * @param id 标签 ID
 * @param tagData 更新的数据
 * @returns 更新后的标签
 */
export async function updateTag(
  id: string,
  tagData: Partial<Omit<Tag, 'id' | 'count' | 'createdAt'>>,
): Promise<Tag | null> {
  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (tagData.name !== undefined) {
    updates.push(`name = $${paramIndex}`);
    values.push(JSON.stringify(tagData.name));
    paramIndex += 1;
  }
  if (tagData.slug !== undefined) {
    updates.push(`slug = $${paramIndex}`);
    values.push(tagData.slug);
    paramIndex += 1;
  }

  if (updates.length === 0) {
    return getTagById(id);
  }

  values.push(id);

  const sql = `
    UPDATE tags
    SET ${updates.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING 
      id,
      name,
      slug,
      count,
      created_at as "createdAt"
  `;

  const result = await query<Tag>(sql, values);
  return result.rows[0] || null;
}

/**
 * 删除标签
 *
 * @param id 标签 ID
 * @returns 是否删除成功
 */
export async function deleteTag(id: string): Promise<boolean> {
  const sql = 'DELETE FROM tags WHERE id = $1 RETURNING id';
  const result = await query(sql, [id]);
  return result.rowCount !== null && result.rowCount > 0;
}

/**
 * 更新标签的使用计数
 * 这个函数应该在工具的标签发生变化时调用
 *
 * @param slug 标签 slug
 * @returns 更新后的计数
 */
export async function updateTagCount(slug: string): Promise<number> {
  const sql = `
    UPDATE tags
    SET count = (
      SELECT COUNT(*)
      FROM tools
      WHERE $1 = ANY(tags) AND status = 'published'
    )
    WHERE slug = $1
    RETURNING count
  `;

  const result = await query<{ count: number }>(sql, [slug]);
  return result.rows[0]?.count || 0;
}

/**
 * 批量更新所有标签的使用计数
 */
export async function updateAllTagCounts(): Promise<void> {
  const sql = `
    UPDATE tags
    SET count = (
      SELECT COUNT(*)
      FROM tools
      WHERE tags.slug = ANY(tools.tags) AND tools.status = 'published'
    )
  `;

  await query(sql);
}

/**
 * 获取热门标签
 *
 * @param limit 返回数量限制
 * @param minCount 最小使用次数
 * @returns 标签列表
 */
export async function getPopularTags(limit: number = 20, minCount: number = 1): Promise<Tag[]> {
  const sql = `
    SELECT 
      id,
      name,
      slug,
      count,
      created_at as "createdAt"
    FROM tags
    WHERE count >= $1
    ORDER BY count DESC
    LIMIT $2
  `;

  const result = await query<Tag>(sql, [minCount, limit]);
  return result.rows;
}

/**
 * 搜索标签
 *
 * @param searchQuery 搜索关键词
 * @param limit 返回数量限制
 * @returns 标签列表
 */
export async function searchTags(searchQuery: string, limit: number = 10): Promise<Tag[]> {
  const sql = `
    SELECT 
      id,
      name,
      slug,
      count,
      created_at as "createdAt"
    FROM tags
    WHERE 
      name::text ILIKE $1
      OR slug ILIKE $1
    ORDER BY count DESC
    LIMIT $2
  `;

  const result = await query<Tag>(sql, [`%${searchQuery}%`, limit]);
  return result.rows;
}

/**
 * 获取工具的标签列表
 *
 * @param toolId 工具 ID
 * @returns 标签列表
 */
export async function getToolTags(toolId: string): Promise<Tag[]> {
  const sql = `
    SELECT 
      t.id,
      t.name,
      t.slug,
      t.count,
      t.created_at as "createdAt"
    FROM tags t
    WHERE t.slug = ANY(
      SELECT unnest(tags) FROM tools WHERE id = $1
    )
    ORDER BY t.count DESC
  `;

  const result = await query<Tag>(sql, [toolId]);
  return result.rows;
}
