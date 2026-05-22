# 数据迁移完整指南

本指南将帮助你完成从硬编码数据到 Supabase 数据库的完整迁移过程。

## 📋 概述

迁移过程包括以下步骤:
1. 设置 Supabase 项目
2. 应用数据库架构
3. 运行数据迁移脚本
4. 验证迁移结果

## 🚀 快速开始

### 步骤 1: 设置 Supabase 项目

如果你还没有 Supabase 项目:

1. 访问 [Supabase](https://supabase.com)
2. 注册/登录账号
3. 创建新项目
4. 等待项目初始化完成 (通常需要 1-2 分钟)

### 步骤 2: 配置环境变量

1. 在 Supabase Dashboard 中，进入 **Settings** > **API**
2. 复制以下信息:
   - **Project URL** (例如: `https://xxxxx.supabase.co`)
   - **anon public** key

3. 更新 `.env.local` 文件:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

### 步骤 3: 应用数据库架构

**方法 A: 使用 Supabase Dashboard (推荐新手)**

1. 在 Supabase Dashboard 中，点击左侧菜单的 **SQL Editor**
2. 点击 **New query** 创建新查询
3. 打开项目中的 `db/supabase/schema.sql` 文件
4. 复制全部内容 (约 400 行)
5. 粘贴到 SQL Editor 中
6. 点击 **Run** 或按 `Ctrl/Cmd + Enter` 执行
7. 等待执行完成，你应该看到 "Success. No rows returned"

**方法 B: 使用 Supabase CLI (推荐开发者)**

```bash
# 1. 安装 Supabase CLI
npm install -g supabase

# 2. 登录
supabase login

# 3. 链接到你的项目
supabase link --project-ref your-project-ref

# 4. 应用架构
supabase db push
```

### 步骤 4: 验证数据库设置

运行以下命令检查数据库是否正确设置:

```bash
pnpm setup-db
```

**预期输出:**
```
🚀 开始数据库设置...
🔌 检查数据库连接...
  ✅ 数据库连接成功，表已存在
✅ 数据库设置完成!
```

如果看到错误，请参考 [故障排除](#故障排除) 部分。

### 步骤 5: 运行数据迁移

```bash
pnpm migrate
```

**预期输出:**
```
🚀 开始数据迁移...

📊 数据统计:
  - 工具数量: 23
  - 详情数量: 24
  - 分类数量: 6
  - 标签数量: 5

📁 开始迁移分类数据...
  ✅ 分类已创建/更新: Productivity (生产力)
  ✅ 分类已创建/更新: Design & Art (设计与艺术)
  ...
✅ 分类迁移完成

🏷️  开始迁移标签数据...
  ✅ 标签已创建/更新: Free (免费)
  ...
✅ 标签迁移完成

🔧 开始迁移工具数据...
  ✅ 工具已迁移: openai
  ✅ 工具已迁移: chatgpt-mac
  ...
✅ 工具迁移完成: 23 成功, 0 失败

🎉 数据迁移全部完成!
```

### 步骤 6: 验证迁移结果

```bash
pnpm verify-migration
```

**预期输出:**
```
🚀 开始验证数据迁移...

📁 验证分类数据...
  ✅ 找到 6 个分类
  ✅ 所有分类都包含多语言字段 (en, zh)
  ...

🏷️  验证标签数据...
  ✅ 找到 5 个标签
  ...

🔧 验证工具数据...
  ✅ 找到 23 个工具
  ...

============================================================
📋 验证报告
============================================================

总计: 5 项检查
✅ 通过: 5
❌ 失败: 0

🎉 所有验证检查都通过了!
```

## 📊 迁移的数据

### 分类 (Categories)

迁移脚本会创建以下分类:

| 英文名称 | 中文名称 | Slug | 描述 |
|---------|---------|------|------|
| Productivity | 生产力 | productivity | 提升生产力的工具 |
| Design & Art | 设计与艺术 | design-art | 设计师和艺术家的创意工具 |
| Chatbot | 聊天机器人 | chatbot | AI 驱动的聊天机器人 |
| Life Assistant | 生活助手 | life-assistant | 帮助日常生活的工具 |
| Text & Writing | 文本与写作 | text-writing | 写作和文本处理工具 |
| Other | 其他 | other | 其他 AI 工具 |

### 标签 (Tags)

迁移脚本会创建以下标签:

| 英文名称 | 中文名称 | Slug |
|---------|---------|------|
| Free | 免费 | free |
| Freemium | 免费增值 | freemium |
| Paid | 付费 | paid |
| Website | 网站 | website |
| LLM | 大语言模型 | llm |

### 工具 (Tools)

迁移脚本会迁移 `lib/data.ts` 中的所有工具数据:
- 从 `dataList` 获取基本信息
- 从 `detailList` 获取详细信息
- 合并两个数据源
- 转换为多语言 JSONB 格式
- 设置状态为 `published`

## 🔍 验证检查项

验证脚本会执行以下检查:

1. **分类验证**
   - 检查分类数量
   - 验证多语言字段 (en, zh)
   - 确认 slug 唯一性

2. **标签验证**
   - 检查标签数量
   - 验证多语言字段
   - 确认 slug 唯一性

3. **工具验证**
   - 检查工具数量是否匹配原始数据
   - 验证多语言字段 (title, content, detail)
   - 检查必填字段 (name, url, status)
   - 统计状态和定价分布

4. **关联关系验证**
   - 验证工具的分类 ID 有效性
   - 检查标签关联
   - 统计标签使用情况

5. **示例工具验证**
   - 详细检查几个示例工具
   - 验证所有字段完整性

## 🛠️ 故障排除

### 问题 1: 连接失败

**错误信息:**
```
❌ 数据库连接失败: TypeError: fetch failed
```

**可能原因和解决方案:**

1. **Supabase 项目未激活**
   - 检查项目是否在 Supabase Dashboard 中显示为活动状态
   - 等待项目完全初始化 (新项目需要 1-2 分钟)

2. **环境变量错误**
   - 检查 `.env.local` 文件是否存在
   - 确认 URL 和 Key 是否正确复制
   - 确保没有多余的空格或引号

3. **网络问题**
   - 检查网络连接
   - 尝试在浏览器中访问 Supabase URL
   - 检查防火墙设置

4. **Supabase 服务中断**
   - 访问 [Supabase Status](https://status.supabase.com/) 检查服务状态

### 问题 2: 表不存在

**错误信息:**
```
relation "categories" does not exist
```

**解决方案:**

1. 确认已经执行了 `db/supabase/schema.sql`
2. 在 Supabase Dashboard 中检查:
   - 进入 **Table Editor**
   - 查看是否有 `categories`, `tags`, `tools` 等表
3. 如果表不存在，重新执行步骤 3 (应用数据库架构)

### 问题 3: 权限错误

**错误信息:**
```
permission denied for table categories
```

**解决方案:**

1. 确认使用的是 `anon` key 而不是 `service_role` key
2. 检查 RLS (Row Level Security) 策略
3. 在开发阶段，可以临时禁用 RLS:
   ```sql
   ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
   ALTER TABLE tags DISABLE ROW LEVEL SECURITY;
   ALTER TABLE tools DISABLE ROW LEVEL SECURITY;
   ```

### 问题 4: 数据冲突

**错误信息:**
```
duplicate key value violates unique constraint
```

**解决方案:**

迁移脚本使用 `upsert` 操作，应该自动处理冲突。如果仍然出现此错误:

1. 清空表数据重新迁移:
   ```sql
   TRUNCATE TABLE tools CASCADE;
   TRUNCATE TABLE categories CASCADE;
   TRUNCATE TABLE tags CASCADE;
   ```

2. 重新运行迁移: `pnpm migrate`

### 问题 5: 部分数据缺失

**症状:** 验证显示数据数量不匹配

**解决方案:**

1. 检查迁移日志中的错误信息
2. 查看 Supabase Dashboard 的日志:
   - 进入 **Logs** > **Database**
   - 查找错误信息
3. 针对失败的记录手动检查原因
4. 修复问题后重新运行迁移

## 📝 迁移后的任务

完成迁移后，你需要:

### 1. 在 Supabase Dashboard 中检查数据

1. 进入 **Table Editor**
2. 查看各个表的数据
3. 确认数据完整性和正确性

### 2. 配置 Row Level Security (RLS)

数据库架构中的 RLS 策略默认是注释掉的。在生产环境中，你应该:

1. 在 Supabase Dashboard 中进入 **Authentication** > **Policies**
2. 为每个表启用 RLS
3. 根据需求配置策略

示例策略 (在 SQL Editor 中执行):

```sql
-- 启用 RLS
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;

-- 允许所有人查看已发布的工具
CREATE POLICY "Anyone can view published tools"
  ON tools FOR SELECT
  USING (status = 'published');

-- 允许认证用户创建工具
CREATE POLICY "Authenticated users can insert tools"
  ON tools FOR INSERT
  WITH CHECK (auth.uid() = submitted_by);
```

### 3. 更新应用代码

将应用代码从使用硬编码数据改为使用数据库:

**之前 (lib/data.ts):**
```typescript
import { dataList } from '@/lib/data';

const tools = dataList;
```

**之后 (使用 Supabase):**
```typescript
import { createClient } from '@/db/supabase/client';

const supabase = createClient();
const { data: tools } = await supabase
  .from('tools')
  .select('*')
  .eq('status', 'published');
```

### 4. 测试应用功能

1. 启动开发服务器: `pnpm dev`
2. 测试各个页面是否正常显示数据
3. 测试搜索和筛选功能
4. 检查多语言切换是否正常

### 5. 设置备份

在 Supabase Dashboard 中:
1. 进入 **Settings** > **Database**
2. 配置自动备份
3. 手动创建一个备份点

## 🔄 重新迁移

如果需要重新迁移数据:

1. 清空表数据:
   ```sql
   TRUNCATE TABLE tools CASCADE;
   TRUNCATE TABLE categories CASCADE;
   TRUNCATE TABLE tags CASCADE;
   ```

2. 重新运行迁移:
   ```bash
   pnpm migrate
   ```

3. 验证结果:
   ```bash
   pnpm verify-migration
   ```

## 📚 相关文档

- [Supabase 文档](https://supabase.com/docs)
- [Supabase JavaScript 客户端](https://supabase.com/docs/reference/javascript/introduction)
- [PostgreSQL JSONB](https://www.postgresql.org/docs/current/datatype-json.html)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## 💡 最佳实践

1. **备份**: 在迁移前备份现有数据
2. **测试**: 先在开发环境测试迁移
3. **监控**: 迁移后监控应用性能
4. **文档**: 记录任何自定义修改
5. **版本控制**: 将架构变更纳入版本控制

## 🆘 获取帮助

如果遇到问题:

1. 检查本指南的故障排除部分
2. 查看 Supabase Dashboard 的日志
3. 参考 Supabase 官方文档
4. 在项目 Issues 中提问

## ✅ 检查清单

完成迁移后，确认以下项目:

- [ ] Supabase 项目已创建并激活
- [ ] 环境变量已正确配置
- [ ] 数据库架构已应用
- [ ] 数据迁移成功完成
- [ ] 验证脚本全部通过
- [ ] 在 Dashboard 中确认数据
- [ ] RLS 策略已配置 (生产环境)
- [ ] 应用代码已更新
- [ ] 功能测试通过
- [ ] 备份已设置

恭喜! 你已经成功完成数据迁移! 🎉
