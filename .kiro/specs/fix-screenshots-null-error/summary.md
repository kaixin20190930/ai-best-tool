# 修复工具详情页 screenshots 字段空值错误

## 问题描述

当访问工具详情页时，如果数据库中的 `screenshots` 字段为 `null` 或 `undefined`，页面会抛出错误：

```
Cannot read properties of null (reading 'length')
```

错误位置：`app/[locale]/(with-footer)/ai/[websiteName]/page.tsx:483`

## 根本原因

1. 数据库 schema 中 `screenshots` 字段定义为 `TEXT[]`，允许为 `null`
2. TypeScript 接口定义为 `screenshots: string[]`，不允许 `null`
3. 代码直接访问 `dbTool.screenshots.length` 而没有进行空值检查

## 修复方案

### 1. 更新 TypeScript 类型定义

**文件**: `lib/services/tools.ts`

```typescript
// 修改前
screenshots: string[];

// 修改后
screenshots: string[] | null;
```

### 2. 添加空值检查

**文件**: `app/[locale]/(with-footer)/ai/[websiteName]/page.tsx`

```typescript
// 修改前
{dbTool && (dbTool.screenshots.length > 0 || dbTool.videoUrl) && (
  <MediaGallery 
    screenshots={dbTool.screenshots} 
    videoUrl={dbTool.videoUrl}
    title={data.title}
  />
)}

// 修改后
{dbTool && ((dbTool.screenshots && dbTool.screenshots.length > 0) || dbTool.videoUrl) && (
  <MediaGallery 
    screenshots={dbTool.screenshots || []} 
    videoUrl={dbTool.videoUrl}
    title={data.title}
  />
)}
```

## 测试结果

| 场景 | 旧逻辑 | 新逻辑 |
|------|--------|--------|
| screenshots 为 null | ❌ ERROR | ✅ HIDE |
| screenshots 为 undefined | ❌ ERROR | ✅ HIDE |
| screenshots 为空数组 | ✅ HIDE | ✅ HIDE |
| screenshots 有数据 | ✅ SHOW | ✅ SHOW |
| 只有 videoUrl | ❌ ERROR | ✅ SHOW |
| dbTool 为 null | ✅ HIDE | ✅ HIDE |

## 影响范围

- ✅ 修复了所有工具详情页的 screenshots 空值错误
- ✅ 保持了原有的显示逻辑（有截图或视频时才显示 MediaGallery）
- ✅ MediaGallery 组件已经能正确处理空数组
- ✅ 类型安全性提升，TypeScript 类型与数据库 schema 一致

## 相关文件

- `app/[locale]/(with-footer)/ai/[websiteName]/page.tsx` - 工具详情页
- `lib/services/tools.ts` - 工具数据类型定义
- `components/MediaGallery.tsx` - 媒体画廊组件
- `db/supabase/schema.sql` - 数据库 schema

## 建议

为了避免类似问题，建议：

1. 在数据库查询后立即进行数据规范化，将 `null` 转换为空数组
2. 使用 TypeScript 的严格空值检查 (`strictNullChecks`)
3. 在组件中始终进行防御性编程，检查可能为空的字段
