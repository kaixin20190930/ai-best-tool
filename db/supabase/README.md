# Supabase 数据库架构

## 📋 概述

这个目录包含 AI 工具导航站的完整数据库架构定义。

## 📁 文件说明

- `schema.sql` - 完整的数据库表结构定义
- `client.ts` - 客户端 Supabase 客户端（已存在）

## 🗄️ 数据库表结构

### 核心表
1. **categories** - 工具分类
2. **tags** - 工具标签
3. **tools** - AI 工具主表

### 用户相关表
4. **favorites** - 用户收藏
5. **ratings** - 用户评分
6. **comments** - 用户评论
7. **user_preferences** - 用户偏好设置

### 系统表
8. **analytics** - 分析追踪数据
9. **notifications** - 用户通知

## 🚀 如何使用

### 方法 1: 通过 Supabase Dashboard（推荐）

1. 登录到你的 Supabase 项目: https://supabase.com/dashboard
2. 进入 **SQL Editor**
3. 创建一个新查询
4. 复制 `schema.sql` 文件的全部内容
5. 粘贴到 SQL Editor
6. 点击 **Run** 执行

### 方法 2: 通过 Supabase CLI

```bash
# 确保已安装 Supabase CLI
npm install -g supabase

# 登录
supabase login

# 链接到你的项目
supabase link --project-ref your-project-ref

# 执行 SQL 文件
supabase db push
```

### 方法 3: 使用 psql

```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres" -f schema.sql
```

## ✅ 验证安装

执行 SQL 后，你应该能看到以下表：

```sql
-- 在 SQL Editor 中运行
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

预期结果应包含：
- analytics
- categories
- comments
- favorites
- notifications
- ratings
- tags
- tools
- user_preferences

## 🔐 Row Level Security (RLS)

所有表都已启用 RLS 策略，确保：
- ✅ 用户只能访问自己的数据（收藏、评分、评论、通知）
- ✅ 所有人可以查看已发布的工具
- ✅ 用户可以管理自己提交的工具
- ✅ 管理员可以管理所有内容（需要额外配置）

## 📊 初始数据

SQL 文件会自动插入：
- 6 个默认分类（生产力、设计与艺术、聊天机器人等）
- 10 个常用标签（免费、付费、API、开源等）

## 🔄 数据迁移

创建表结构后，运行数据迁移脚本将现有数据从 `lib/data.ts` 迁移到数据库：

```bash
# 下一步：执行任务 1.3 - 实现数据迁移脚本
```

## 🛠️ 维护

### 添加新字段

如果需要添加新字段，创建迁移文件：

```sql
-- 示例：添加新字段到 tools 表
ALTER TABLE tools ADD COLUMN new_field VARCHAR(255);
```

### 更新 RLS 策略

```sql
-- 示例：添加新的 RLS 策略
CREATE POLICY "policy_name"
  ON table_name FOR operation
  USING (condition);
```

## 📝 注意事项

1. **备份**: 在生产环境执行前，请先备份数据库
2. **测试**: 建议先在开发环境测试
3. **权限**: 确保你有足够的权限执行 DDL 语句
4. **依赖**: 某些表依赖 `auth.users` 表（Supabase Auth 自动创建）

## 🔗 相关文档

- [Supabase 文档](https://supabase.com/docs)
- [PostgreSQL 文档](https://www.postgresql.org/docs/)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## ❓ 常见问题

### Q: 如何重置数据库？
A: 在 Supabase Dashboard 的 Database 设置中可以重置数据库，但会删除所有数据。

### Q: 如何修改表结构？
A: 使用 ALTER TABLE 语句，或在 Supabase Dashboard 的 Table Editor 中修改。

### Q: RLS 策略不生效？
A: 确保表已启用 RLS (`ALTER TABLE table_name ENABLE ROW LEVEL SECURITY`)，并且策略正确配置。

### Q: 如何添加管理员权限？
A: 可以在 `auth.users` 表中添加自定义字段，或使用 Supabase 的 User Metadata。
