# 快速开始指南

## 🎯 目标

将 `lib/data.ts` 中的硬编码数据迁移到 Supabase 数据库。

## ⚡ 快速步骤

### 1. 准备 Supabase

```bash
# 1. 创建 Supabase 项目 (在 https://supabase.com)
# 2. 复制 Project URL 和 anon key 到 .env.local
# 3. 在 SQL Editor 中执行 db/supabase/schema.sql
```

### 2. 检查连接

```bash
pnpm setup-db
```

### 3. 运行迁移

```bash
pnpm migrate
```

### 4. 验证结果

```bash
pnpm verify-migration
```

## 📋 可用命令

| 命令 | 说明 |
|------|------|
| `pnpm setup-db` | 检查数据库连接和表结构 |
| `pnpm migrate` | 运行数据迁移 |
| `pnpm verify-migration` | 验证迁移结果 |

## 🔧 脚本文件

| 文件 | 说明 |
|------|------|
| `migrate-data.ts` | 主迁移脚本 |
| `verify-migration.ts` | 验证脚本 |
| `setup-database.ts` | 数据库设置检查 |
| `test-connection.ts` | 连接测试 |

## 📚 文档

- **MIGRATION_GUIDE.md** - 完整迁移指南
- **README.md** - 详细说明文档

## ⚠️ 注意事项

1. 确保 Supabase 项目已创建并激活
2. 确保 `.env.local` 中的环境变量正确
3. 确保已执行 `db/supabase/schema.sql`
4. 迁移脚本可以安全地多次运行 (使用 upsert)

## 🆘 遇到问题?

1. 检查 `MIGRATION_GUIDE.md` 的故障排除部分
2. 运行 `tsx scripts/test-connection.ts` 测试连接
3. 查看 Supabase Dashboard 的日志

## ✅ 成功标志

迁移成功后，你应该看到:

```
🎉 数据迁移全部完成!
✅ 所有验证检查都通过了!
```

在 Supabase Dashboard 中应该能看到:
- 6 个分类
- 5 个标签
- 23 个工具

## 🚀 下一步

1. 在 Supabase Dashboard 查看数据
2. 配置 Row Level Security (RLS)
3. 更新应用代码使用数据库
4. 测试应用功能
