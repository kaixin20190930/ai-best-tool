# 测试和质量保证

## 回归测试策略

为确保新功能不会破坏已有功能，项目配置了自动化回归测试系统。

## 测试脚本

### 综合回归测试
```bash
pnpm test:regression
```

运行所有关键功能的验证测试，包括：
- SEO 功能（元数据、结构化数据、hreflang）
- 认证流程
- 数据访问
- 筛选系统
- 页面渲染

测试结果会保存到 `.kiro/regression-test-report.json`

### 快速检查
```bash
pnpm lint && pnpm seo:health-check
```

提交前的快速检查，验证代码质量和 SEO 基础功能。

### 单项测试

```bash
# SEO 相关
pnpm seo:health-check      # SEO 健康检查
pnpm seo:validate          # 完整 SEO 验证
pnpm seo:audit             # SEO 审计

# 性能相关
pnpm perf:audit            # 性能审计
pnpm perf:vitals           # Core Web Vitals

# 功能测试
npx tsx scripts/test-auth-flow.ts           # 认证流程
npx tsx scripts/test-data-access.ts         # 数据访问
npx tsx scripts/test-filter-system.ts       # 筛选系统
```

## Agent Hooks

项目配置了以下 agent hooks，可通过 Kiro 的 Agent Hooks 面板或命令面板访问：

### 1. 回归测试检查
- **触发方式**: 手动
- **用途**: 在完成功能开发后，运行完整的回归测试
- **命令**: `pnpm test:regression`

### 2. 提交前快速检查
- **触发方式**: 手动
- **用途**: 提交代码前的快速验证
- **命令**: `pnpm lint && pnpm seo:health-check`

### 3. AI 代码审查
- **触发方式**: 手动
- **用途**: 让 AI 审查代码变更，检查潜在的破坏性改动
- **行为**: 发送消息给 AI，要求审查 git diff

## 测试覆盖的关键功能

### 关键测试（必须通过）
- SEO 健康检查
- SEO 元数据验证
- Hreflang 标签验证
- 结构化数据验证
- 面包屑导航验证
- 认证流程测试
- 数据访问测试
- 筛选系统测试
- 首页元数据验证
- 工具详情页验证
- 列表页元数据验证

### 非关键测试（建议通过）
- 图片优化验证
- 懒加载验证

## 开发工作流

### 添加新功能时
1. 开发新功能
2. 运行 `pnpm lint:fix` 修复代码格式
3. 运行 `pnpm seo:health-check` 快速检查
4. 运行 `pnpm test:regression` 完整回归测试
5. 如果关键测试失败，修复后重新测试
6. 提交代码

### 修改现有功能时
1. 修改代码
2. 使用 AI 代码审查 hook 检查影响范围
3. 运行相关的单项测试
4. 运行完整回归测试
5. 确认所有关键测试通过后提交

### 重构代码时
1. 重构前运行回归测试，记录基准结果
2. 进行重构
3. 再次运行回归测试
4. 对比结果，确保没有功能退化
5. 提交代码

## 测试报告

回归测试会生成 JSON 格式的详细报告：
- 位置: `.kiro/regression-test-report.json`
- 包含: 每个测试的通过/失败状态、耗时、错误信息
- 用途: 追踪测试历史，分析失败原因

## 持续改进

### 添加新测试
当添加重要功能时，应该：
1. 创建对应的验证脚本（参考 `scripts/verify-*.ts`）
2. 将测试添加到 `scripts/regression-test.ts` 的 `tests` 数组
3. 标记是否为关键测试（`critical: true/false`）

### 更新测试
当功能变更时，记得更新相关的测试脚本，确保测试反映最新的预期行为。

## 注意事项

- 关键测试失败会导致回归测试脚本返回错误码 1
- 非关键测试失败只会给出警告，不会阻止流程
- 所有测试都有 60 秒超时限制
- 测试按顺序执行，避免并发问题
