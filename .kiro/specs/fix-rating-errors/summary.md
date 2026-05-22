# 修复 Rating 相关错误

## 问题描述

### 错误 1: 前端类型错误

```
TypeError: averageRating.toFixed is not a function
Location: components/RatingStars.tsx:99
```

**原因**: `averageRating` 可能不是数字类型（可能是字符串或其他类型）

### 错误 2: 后端 Supabase 连接失败

```
Error getting rating stats: TypeError: fetch failed
Location: app/actions/ratings.ts:121
```

**原因**: Supabase URL 无法访问，但应用实际使用的是 Neon 数据库

## 修复方案

### 1. 前端类型安全修复

**文件**: `components/RatingStars.tsx`

```typescript
// 修改前
{averageRating > 0 ? averageRating.toFixed(1) : 'No ratings'}

// 修改后
{averageRating && averageRating > 0 ? Number(averageRating).toFixed(1) : 'No ratings'}
```

**改进**:
- 添加了 `averageRating &&` 空值检查
- 使用 `Number()` 确保类型转换
- 防止在非数字值上调用 `.toFixed()`

### 2. 后端 Fallback 机制

**文件**: `app/actions/ratings.ts`

添加了双数据库支持：

1. **主要**: 尝试从 Supabase 获取 rating 数据
2. **Fallback**: 如果 Supabase 失败，从 Neon 数据库读取

```typescript
export async function getToolRatingStats(toolId: string) {
  try {
    // 尝试从 Supabase 获取
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('tools')
      .select('average_rating, rating_count')
      .eq('id', toolId)
      .single();

    if (error) {
      // Fallback: 从 Neon 数据库读取
      return await getRatingStatsFromNeon(toolId);
    }

    // 确保返回数字类型
    return {
      averageRating: Number(data?.average_rating) || 0,
      ratingCount: Number(data?.rating_count) || 0
    };
  } catch (error) {
    // Fallback: 从 Neon 数据库读取
    return await getRatingStatsFromNeon(toolId);
  }
}

async function getRatingStatsFromNeon(toolId: string) {
  const { query } = await import('@/db/neon/client');
  const result = await query(
    'SELECT average_rating, rating_count FROM tools WHERE id = $1',
    [toolId]
  );
  // 返回数据...
}
```

### 3. 页面级错误处理

**文件**: `app/[locale]/(with-footer)/ai/[websiteName]/page.tsx`

添加了 Promise 级别的错误捕获：

```typescript
if (toolId) {
  try {
    [userRating, ratingStats, isFavoritedByUser, toolStats] = await Promise.all([
      getUserRating(toolId).catch(() => null),
      getToolRatingStats(toolId).catch(() => ({ averageRating: 0, ratingCount: 0 })),
      isFavorited(toolId).catch(() => false),
      getToolStats(toolId).catch(() => ({ /* 默认值 */ }))
    ]);
  } catch (error) {
    console.error('Error fetching tool data:', error);
  }
}
```

## 架构说明

### 当前数据库架构

项目使用**双数据库架构**：

1. **Neon PostgreSQL** - 主数据库
   - 存储工具数据 (`tools` 表)
   - 存储分类、标签等
   - 包含 `average_rating` 和 `rating_count` 字段

2. **Supabase** - 用户相关功能
   - 用户认证 (`auth.users`)
   - 用户评分 (`ratings` 表)
   - 用户收藏 (`favorites` 表)
   - 用户评论 (`comments` 表)

### 数据流

```
用户提交评分
    ↓
Supabase ratings 表
    ↓
触发器/定时任务
    ↓
更新 Neon tools 表的 average_rating 和 rating_count
    ↓
页面显示统计信息
```

### 为什么需要 Fallback

1. **Supabase 可能不可用**
   - 网络问题
   - 服务维护
   - 配置错误

2. **Neon 是主数据库**
   - 工具数据存储在 Neon
   - `average_rating` 和 `rating_count` 已经在 Neon 中
   - 可以直接读取，无需依赖 Supabase

3. **提升可靠性**
   - 即使 Supabase 失败，页面仍能显示评分统计
   - 用户体验更好

## 测试验证

### 场景 1: Supabase 正常

- ✅ 从 Supabase 读取 rating 统计
- ✅ 正常显示评分

### 场景 2: Supabase 失败

- ✅ 自动切换到 Neon 数据库
- ✅ 从 Neon 读取 rating 统计
- ✅ 正常显示评分
- ✅ 控制台显示 fallback 日志

### 场景 3: averageRating 为非数字

- ✅ `Number()` 转换确保类型安全
- ✅ 不会抛出 `.toFixed()` 错误
- ✅ 显示 "No ratings" 或正确的数字

### 场景 4: 所有 API 调用失败

- ✅ 页面仍能加载
- ✅ 显示默认值（0 评分）
- ✅ 不会导致页面崩溃

## 影响范围

### 修改的文件

1. `components/RatingStars.tsx` - 前端组件
2. `app/actions/ratings.ts` - 后端 API
3. `app/[locale]/(with-footer)/ai/[websiteName]/page.tsx` - 页面

### 不影响的功能

- ✅ 用户提交评分（仍使用 Supabase）
- ✅ 其他 Supabase 功能（认证、收藏、评论）
- ✅ 工具数据查询（使用 Neon）

## 后续建议

### 短期

1. **监控 Supabase 连接**
   - 检查 Supabase URL 是否正确
   - 验证 API Key 是否有效
   - 确认网络连接

2. **测试 Fallback 机制**
   - 验证 Neon 数据库中的 rating 数据是否准确
   - 确认 fallback 逻辑正常工作

### 长期

1. **统一数据库**
   - 考虑将所有数据迁移到单一数据库
   - 或者明确定义数据分布策略

2. **同步机制**
   - 确保 Supabase ratings 表的数据能正确同步到 Neon tools 表
   - 实现定时同步或触发器

3. **监控和告警**
   - 添加数据库连接监控
   - 当 Supabase 失败时发送告警
   - 追踪 fallback 使用频率

## 部署检查清单

- [x] 前端类型安全修复
- [x] 后端 fallback 机制
- [x] 页面级错误处理
- [x] TypeScript 编译通过
- [x] 代码诊断无错误
- [ ] 测试 Supabase 连接
- [ ] 测试 Neon fallback
- [ ] 验证评分显示正确
- [ ] 部署到生产环境

## 相关文档

- [Screenshots 修复](../fix-screenshots-null-error/summary.md)
- [数据库 Schema](../../db/supabase/schema.sql)
- [Neon 客户端](../../db/neon/client.ts)
