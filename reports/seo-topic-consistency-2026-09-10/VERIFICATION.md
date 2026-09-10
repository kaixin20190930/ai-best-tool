# 验证结果

基线 `f29b7dc3`；分支 `codex/seo-topic-consistency-2026-09-10`。

所有最终检查退出码为 0：

| 命令 | 退出码 |
| --- | --- |
| `pnpm run test:topic-consistency` | 0 |
| `pnpm run test:hreflang` | 0 |
| `pnpm run test:seo-architecture` | 0 |
| `pnpm run test:seo-breadcrumbs` | 0 |
| `pnpm run test:localized-metadata` | 0 |
| `pnpm run test:editorial-review-dates` | 0 |
| `pnpm run test:virtual-category-hubs` | 0 |
| `pnpm run test:guide-link-boundaries` | 0 |
| `pnpm run test:guide-decision-paths` | 0 |
| `pnpm run test:tool-indexing` | 0 |
| `pnpm run test:index-consistency` | 0 |
| `pnpm run test:tool-route-aliases` | 0 |
| `pnpm run test:sitemap` | 0 |
| `./node_modules/.bin/tsc --noEmit` | 0 |
| `pnpm run build` | 0 |
| `pnpm run test:topic-consistency:live` | 0 |
| `scripts/verify-sitemap-xml.ts (node --import tsx; .env.local loaded)` | 0 |
| `git diff --check` | 0 |

完整构建已完成 prebuild AdSense 校验、编译、TypeScript 检查、页面生成和 trace 收集；sitemap 路由为动态渲染。
构建使用项目现有的 ignoreDuringBuilds lint 配置，不将构建通过描述为全仓 ESLint 通过。仅有既有 Browserslist 数据陈旧提示。

实际 HTTP 检查：56 个中英文 topic 的候选数、卡片数、robots、hreflang、中央日期、文案和 sitemap 成员关系全部一致；
另检验 jp/fr/tw 历史语言无 alternate，未知 topic noindex，sitemap XML 有效且重复读取 lastmod 稳定。
本次 sitemap 有 126 个 URL，其中 48 个为非空 topic。

策略风险：4 个没有真实已发布候选的主题暂时 noindex，并从 sitemap 减少 8 个语言 URL；完整理由见
[修复审计说明](../../docs/SEO_TOPIC_CONSISTENCY_2026-09-10_CN.md)。HTTP hreflang 由页面 metadata 单独声明，中间件不再另行声明。
宽数据库分类下的既有榜单相关性未在本次重编排；目录超过 10,000 条时会明确失败，需先实现完整分页。

开发过程中非零退出码均已解释并复核，未掩盖为首次通过：

| 检查 | 初次退出码 | 原因与处理 |
| --- | --- | --- |
| Standalone catalog probe | 1 | React 18 CLI runtime does not expose cache; added uncached CLI loader while retaining Next request memoization. |
| Initial tsc --noEmit | 2 | Safety slug tuple includes typing; changed to a type-safe equality predicate. |
| Initial virtual-category hub test | 1 | Existing test searched page-local metadata after baseline moved profiles to a central module; fixed the reference guard. |
| Expanded legacy hreflang helper test | 1 | Test passed an absolute canonical URL to a path-based legacy API; corrected the test argument. |
| Initial live HTTP probe | 1 | Unknown-topic notFound can stream HTTP 200 in Next; adjusted assertion to its noindex/error boundary. The 56 known topic pages already passed. |

查询均为只读；专项测试中的数据库失败为显式 fixture。没有部署、生产数据库修改或 main 推送。
本地原始日志保留在本目录，*.log 不提交；JSON 验证记录和逐页结果随分支提交。等待总控安排独立验收。
