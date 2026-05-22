# Neon 数据库迁移指南

## ✅ 迁移已完成！

恭喜！你的数据已经成功迁移到 Neon 数据库。

## 📊 迁移结果

- ✅ **6 个分类** (Productivity, Design & Art, Chatbot, Life Assistant, Text & Writing, Other)
- ✅ **11 个标签** (包括 Free, Freemium, Paid, Website, LLM 等)
- ✅ **23 个工具** (所有来自 lib/data.ts 的工具)
- ✅ 所有数据都包含多语言字段 (en, zh)
- ✅ 所有关联关系都正确

## 🔧 可用命令

| 命令 | 说明 |
|------|------|
| `pnpm apply-schema:neon` | 应用数据库架构到 Neon |
| `pnpm migrate:neon` | 运行数据迁移 (可重复运行) |
| `pnpm verify:neon` | 验证迁移结果 |

## 📝 环境变量

你的 `.env.local` 已配置:

```bash
DATABASE_URL='postgresql://neondb_owner:npg_ZAYsbN2IWL3l@ep-curly-resonance-adehiucf-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
```

## 🔍 查看数据

### 方法 1: Neon Dashboard

1. 访问 [Neon Console](https://console.neon.tech/)
2. 选择你的项目
3. 进入 **SQL Editor**
4. 运行查询查看数据:

```sql
-- 查看所有分类
SELECT * FROM categories ORDER BY order_index;

-- 查看所有标签
SELECT * FROM tags ORDER BY slug;

-- 查看所有工具
SELECT name, title->>'en' as title, status, pricing 
FROM tools 
ORDER BY created_at DESC;

-- 查看工具及其分类
SELECT 
  t.name,
  t.title->>'en' as title,
  c.name->>'en' as category,
  t.tags
FROM tools t
LEFT JOIN categories c ON t.category_id = c.id
ORDER BY t.name;
```

### 方法 2: 使用 psql

```bash
# 连接到数据库
psql "postgresql://neondb_owner:npg_ZAYsbN2IWL3l@ep-curly-resonance-adehiucf-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"

# 查看表
\dt

# 查看数据
SELECT * FROM tools LIMIT 5;
```

## 🚀 下一步

### 1. 创建数据库客户端

创建 `db/neon/client.ts`:

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export default pool;
```

### 2. 更新应用代码

**之前 (使用硬编码数据):**

```typescript
import { dataList } from '@/lib/data';

export default function Page() {
  const tools = dataList;
  // ...
}
```

**之后 (使用 Neon 数据库):**

```typescript
import pool from '@/db/neon/client';

export default async function Page() {
  const result = await pool.query(`
    SELECT * FROM tools 
    WHERE status = 'published' 
    ORDER BY created_at DESC
  `);
  const tools = result.rows;
  // ...
}
```

### 3. 创建数据服务层

创建 `lib/services/tools.ts`:

```typescript
import pool from '@/db/neon/client';

export async function getPublishedTools() {
  const result = await pool.query(`
    SELECT 
      t.*,
      c.name as category_name,
      c.slug as category_slug
    FROM tools t
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE t.status = 'published'
    ORDER BY t.created_at DESC
  `);
  return result.rows;
}

export async function getToolByName(name: string) {
  const result = await pool.query(
    'SELECT * FROM tools WHERE name = $1 AND status = $published',
    [name, 'published']
  );
  return result.rows[0];
}

export async function getToolsByCategory(categorySlug: string) {
  const result = await pool.query(`
    SELECT t.*
    FROM tools t
    JOIN categories c ON t.category_id = c.id
    WHERE c.slug = $1 AND t.status = 'published'
    ORDER BY t.created_at DESC
  `, [categorySlug]);
  return result.rows;
}

export async function searchTools(query: string) {
  const result = await pool.query(`
    SELECT * FROM tools
    WHERE status = 'published'
    AND (
      title->>'en' ILIKE $1 OR
      title->>'zh' ILIKE $1 OR
      content->>'en' ILIKE $1 OR
      content->>'zh' ILIKE $1
    )
    ORDER BY created_at DESC
  `, [`%${query}%`]);
  return result.rows;
}
```

### 4. 使用多语言数据

```typescript
// 获取当前语言的文本
function getLocalizedText(jsonbField: any, locale: string) {
  return jsonbField?.[locale] || jsonbField?.en || '';
}

// 使用示例
const tool = await getToolByName('openai');
const title = getLocalizedText(tool.title, 'zh'); // 获取中文标题
const content = getLocalizedText(tool.content, 'en'); // 获取英文内容
```

## 🔄 重新迁移

如果需要重新迁移数据:

```bash
# 1. 清空表 (在 Neon SQL Editor 中执行)
TRUNCATE TABLE tools CASCADE;
TRUNCATE TABLE categories CASCADE;
TRUNCATE TABLE tags CASCADE;

# 2. 重新运行迁移
pnpm migrate:neon

# 3. 验证
pnpm verify:neon
```

## 📚 数据结构

### Categories 表

```typescript
{
  id: UUID,
  name: { en: string, zh: string },
  slug: string,
  description: { en: string, zh: string },
  icon: string | null,
  order_index: number,
  created_at: timestamp,
  updated_at: timestamp
}
```

### Tags 表

```typescript
{
  id: UUID,
  name: { en: string, zh: string },
  slug: string,
  count: number,
  created_at: timestamp
}
```

### Tools 表

```typescript
{
  id: UUID,
  name: string,
  title: { en: string, zh: string },
  content: { en: string, zh: string },
  detail: { en: string, zh: string },
  url: string,
  image_url: string | null,
  thumbnail_url: string | null,
  category_id: UUID | null,
  tags: string[],
  pricing: 'free' | 'freemium' | 'paid',
  features: JSONB | null,
  use_cases: JSONB | null,
  screenshots: string[] | null,
  video_url: string | null,
  status: 'draft' | 'pending' | 'published' | 'rejected',
  submitted_by: UUID | null,
  created_at: timestamp,
  updated_at: timestamp,
  view_count: number,
  click_count: number,
  share_count: number,
  average_rating: decimal,
  rating_count: number,
  search_vector: tsvector
}
```

## ⚠️ 注意事项

1. **连接池**: 在生产环境中，确保正确管理数据库连接池
2. **错误处理**: 添加适当的错误处理和重试逻辑
3. **性能**: 考虑添加缓存层 (如 Redis)
4. **安全**: 不要在客户端代码中暴露 DATABASE_URL
5. **备份**: 定期备份数据库

## 🎯 性能优化建议

1. **使用索引**: 数据库架构已包含必要的索引
2. **连接池**: 使用 pg 的连接池功能
3. **查询优化**: 只查询需要的字段
4. **缓存**: 对频繁访问的数据使用缓存

```typescript
// 示例: 只查询需要的字段
const result = await pool.query(`
  SELECT id, name, title, url, image_url, pricing
  FROM tools
  WHERE status = 'published'
  LIMIT 20
`);
```

## 📞 获取帮助

- [Neon 文档](https://neon.tech/docs)
- [PostgreSQL 文档](https://www.postgresql.org/docs/)
- [node-postgres 文档](https://node-postgres.com/)

## ✅ 检查清单

- [x] 数据库架构已应用
- [x] 数据迁移成功 (23 个工具)
- [x] 数据验证通过
- [ ] 创建数据库客户端
- [ ] 更新应用代码使用数据库
- [ ] 测试应用功能
- [ ] 配置生产环境

恭喜！你已经成功完成数据迁移！🎉
