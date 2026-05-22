# 数据迁移脚本使用指南

本目录包含将现有硬编码数据迁移到 Supabase 数据库的脚本。

## 📚 文档导航

- **[QUICK_START.md](./QUICK_START.md)** - 快速开始指南 (推荐首次使用)
- **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - 完整迁移指南 (详细步骤和故障排除)
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - 技术实现总结
- **[README.md](./README.md)** - 本文件 (脚本说明)

## 前置条件

1. **Supabase 项目**: 确保你有一个可用的 Supabase 项目
2. **环境变量**: 在 `.env.local` 文件中配置以下变量:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## 迁移步骤

### 1. 设置数据库架构

首先，你需要在 Supabase 中创建数据库表结构。

**方法 A: 使用 Supabase Dashboard (推荐)**

1. 打开 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 **SQL Editor**
4. 打开 `db/supabase/schema.sql` 文件
5. 复制全部内容并粘贴到 SQL Editor
6. 点击 **Run** 执行 SQL

**方法 B: 使用 Supabase CLI**

```bash
# 安装 Supabase CLI (如果还没安装)
npm install -g supabase

# 登录
supabase login

# 链接到你的项目
supabase link --project-ref your-project-ref

# 应用架构
supabase db push
```

### 2. 验证数据库连接

运行以下命令检查数据库连接是否正常:

```bash
pnpm setup-db
```

如果连接成功，你会看到 "✅ 数据库连接成功，表已存在"。

### 3. 运行数据迁移

一旦数据库架构就绪，运行迁移脚本:

```bash
pnpm migrate
```

这个脚本会:
- 迁移所有分类 (categories)
- 迁移所有标签 (tags)
- 迁移所有工具数据 (tools)
- 合并 `dataList` 和 `detailList` 的数据
- 处理多语言字段的 JSONB 转换

### 4. 验证迁移结果

运行验证脚本检查数据完整性:

```bash
pnpm verify-migration
```

这个脚本会:
- 检查迁移的数据数量
- 验证数据关联关系
- 测试多语言字段
- 生成详细的验证报告

## 脚本说明

### `migrate-data.ts`

主要的数据迁移脚本，负责:
- 从 `lib/data.ts` 读取现有数据
- 将数据转换为数据库格式
- 插入或更新数据库记录
- 处理多语言 JSONB 字段

### `verify-migration.ts`

验证脚本，用于:
- 检查迁移的数据完整性
- 验证数据关联关系
- 测试多语言字段是否正确
- 生成验证报告

### `setup-database.ts`

数据库设置脚本，用于:
- 检查数据库连接
- 验证表是否存在
- 提供设置指导

### `test-connection.ts`

简单的连接测试脚本，用于调试连接问题。

## 数据映射

### 分类映射

| 原始分类 | 英文 | 中文 | Slug |
|---------|------|------|------|
| Productivity | Productivity | 生产力 | productivity |
| Design&Art | Design & Art | 设计与艺术 | design-art |
| Chatbot | Chatbot | 聊天机器人 | chatbot |
| Life Assistant | Life Assistant | 生活助手 | life-assistant |
| Text&Writing | Text & Writing | 文本与写作 | text-writing |
| Other | Other | 其他 | other |

### 标签映射

| 原始标签 | 英文 | 中文 | Slug |
|---------|------|------|------|
| Free | Free | 免费 | free |
| Freemium | Freemium | 免费增值 | freemium |
| Paid | Paid | 付费 | paid |
| Website | Website | 网站 | website |
| Large Language Models (LLMs) | LLM | 大语言模型 | llm |

## 故障排除

### 连接失败

如果遇到 "TypeError: fetch failed" 错误:

1. 检查 `.env.local` 文件中的环境变量是否正确
2. 确认 Supabase 项目是否处于活动状态
3. 检查网络连接
4. 验证 Supabase URL 和 API Key 是否有效

### 表不存在

如果遇到 "relation does not exist" 错误:

1. 确认已经执行了 `db/supabase/schema.sql`
2. 在 Supabase Dashboard 中检查表是否已创建
3. 重新运行 `pnpm setup-db` 检查状态

### 数据冲突

如果遇到唯一约束冲突:

- 脚本使用 `upsert` 操作，会自动更新现有记录
- 如果需要完全重新迁移，可以先清空表数据

## 注意事项

1. **备份**: 在运行迁移前，建议备份现有数据
2. **幂等性**: 迁移脚本可以安全地多次运行
3. **RLS**: 初始架构中 RLS (Row Level Security) 是禁用的，需要在配置 Auth 后手动启用
4. **性能**: 迁移大量数据时可能需要一些时间，请耐心等待

## 下一步

迁移完成后:

1. 在 Supabase Dashboard 中检查数据
2. 更新应用代码以使用数据库而非硬编码数据
3. 配置 Row Level Security (RLS) 策略
4. 设置 Supabase Auth (如果需要用户认证功能)

## 支持

如果遇到问题，请检查:
- Supabase 项目状态
- 环境变量配置
- 网络连接
- 数据库日志 (在 Supabase Dashboard 中)
