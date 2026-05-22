# Screenshots 空值修复 - 测试指南

## 修复内容回顾

修复了工具详情页在 `screenshots` 字段为 `null` 时的运行时错误。

### 修改的文件

1. **lib/services/tools.ts** - 更新类型定义
2. **app/[locale]/(with-footer)/ai/[websiteName]/page.tsx** - 添加空值检查

## 手动测试步骤

### 1. 启动开发服务器

```bash
# 清理缓存（如果遇到构建错误）
rm -rf .next node_modules/.cache

# 启动开发服务器
pnpm dev
```

服务器应该在 `http://localhost:3000` 或 `http://localhost:3001` 启动。

### 2. 测试场景

#### 场景 A: 工具有 screenshots 数据

访问一个有截图的工具页面：
```
http://localhost:3001/en/ai/[tool-with-screenshots]
```

**预期结果:**
- ✅ 页面正常加载
- ✅ 显示 "Screenshots & Videos" 部分
- ✅ 显示截图网格

#### 场景 B: 工具 screenshots 为 null

访问一个 screenshots 为 null 的工具页面：
```
http://localhost:3001/en/ai/[tool-without-screenshots]
```

**预期结果:**
- ✅ 页面正常加载（不报错）
- ✅ 不显示 "Screenshots & Videos" 部分
- ✅ 其他内容正常显示

#### 场景 C: 工具只有 videoUrl

访问一个只有视频链接的工具页面：
```
http://localhost:3001/en/ai/[tool-with-video-only]
```

**预期结果:**
- ✅ 页面正常加载
- ✅ 显示 "Screenshots & Videos" 部分
- ✅ 显示视频播放器

#### 场景 D: 工具既没有 screenshots 也没有 videoUrl

访问一个既没有截图也没有视频的工具页面：
```
http://localhost:3001/en/ai/[tool-without-media]
```

**预期结果:**
- ✅ 页面正常加载
- ✅ 不显示 "Screenshots & Videos" 部分
- ✅ 其他内容正常显示

### 3. 检查浏览器控制台

打开浏览器开发者工具（F12），检查：

- ❌ 不应该有 `Cannot read properties of null (reading 'length')` 错误
- ❌ 不应该有其他 JavaScript 错误
- ✅ 页面应该正常渲染

### 4. 检查服务器日志

在终端查看开发服务器输出：

```bash
# 如果使用 pnpm dev 直接运行
# 查看终端输出

# 如果使用后台进程
pnpm logs
```

**预期结果:**
- ❌ 不应该有运行时错误
- ✅ 只有正常的请求日志

## 自动化测试

### TypeScript 类型检查

```bash
pnpm tsc --noEmit
```

**预期结果:**
- ✅ 没有类型错误
- ✅ `screenshots: string[] | null` 类型正确

### ESLint 检查

```bash
npx eslint 'app/[locale]/(with-footer)/ai/[websiteName]/page.tsx' 'lib/services/tools.ts'
```

**预期结果:**
- ✅ 没有与修复相关的错误
- ⚠️ 可能有代码风格警告（不影响功能）

### 构建测试

```bash
pnpm build
```

**预期结果:**
- ✅ 构建成功
- ✅ 没有类型错误
- ✅ 没有运行时错误

## 回归测试

确保修复没有破坏其他功能：

```bash
# 运行完整回归测试
pnpm test:regression
```

**关键测试项:**
- ✅ 工具详情页渲染
- ✅ 工具列表页正常
- ✅ SEO 元数据正确
- ✅ 其他功能不受影响

## 数据库验证

### 检查数据库中的 screenshots 字段

```sql
-- 查看有多少工具的 screenshots 为 null
SELECT COUNT(*) as null_count
FROM tools
WHERE screenshots IS NULL;

-- 查看有多少工具有 screenshots
SELECT COUNT(*) as has_screenshots
FROM tools
WHERE screenshots IS NOT NULL AND array_length(screenshots, 1) > 0;

-- 查看示例数据
SELECT name, screenshots, video_url
FROM tools
LIMIT 10;
```

## 常见问题排查

### 问题 1: 构建缓存错误

**症状:**
```
Error: Cannot find module './vendor-chunks/tr46@0.0.3.js'
```

**解决方案:**
```bash
rm -rf .next node_modules/.cache
pnpm dev
```

### 问题 2: 页面仍然报错

**症状:**
```
Cannot read properties of null (reading 'length')
```

**排查步骤:**
1. 确认文件已保存
2. 清理缓存并重启服务器
3. 检查是否有其他地方也访问了 `screenshots.length`

**搜索命令:**
```bash
grep -r "screenshots\.length" app/ components/ lib/
```

### 问题 3: TypeScript 类型错误

**症状:**
```
Type 'null' is not assignable to type 'string[]'
```

**解决方案:**
确认 `lib/services/tools.ts` 中的类型定义已更新：
```typescript
screenshots: string[] | null;  // ✅ 正确
// 而不是
screenshots: string[];  // ❌ 错误
```

## 测试清单

在提交代码前，确保：

- [ ] 开发服务器能正常启动
- [ ] 访问工具详情页不报错
- [ ] screenshots 为 null 时页面正常
- [ ] screenshots 有数据时正常显示
- [ ] TypeScript 类型检查通过
- [ ] 构建成功
- [ ] 没有破坏其他功能
- [ ] 浏览器控制台无错误
- [ ] 服务器日志无错误

## 性能影响

此修复对性能的影响：

- ✅ **无负面影响** - 只是添加了空值检查
- ✅ **代码更安全** - 防御性编程
- ✅ **类型更准确** - TypeScript 类型与数据库一致

## 后续建议

1. **数据规范化**: 考虑在数据库查询后立即将 `null` 转换为空数组
2. **统一处理**: 为所有可能为 `null` 的数组字段添加类似的检查
3. **文档更新**: 更新 API 文档，明确哪些字段可能为 `null`
4. **监控**: 添加错误监控，及时发现类似问题

## 相关文档

- [修复总结](.kiro/specs/fix-screenshots-null-error/summary.md)
- [数据库 Schema](db/supabase/schema.sql)
- [工具服务](lib/services/tools.ts)
- [工具详情页](app/[locale]/(with-footer)/ai/[websiteName]/page.tsx)
