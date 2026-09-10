# QA 修订最终验证

起点 `68f9338d`；仅提交 `codex/seo-topic-consistency-2026-09-10`。

| 检查 | 原始最终退出码 |
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
| `pnpm run test:regression` | 0 |
| `./node_modules/.bin/tsc --noEmit` | 0 |
| `pnpm run build` | 0 |
| `pnpm run test:sitemap-pages` | 0 |
| `pnpm run test:topic-consistency:live` | 0 |
| `scripts/verify-sitemap-xml.ts (with local environment)` | 0 |
| `git diff --check` | 0 |

Regression 共 13 项，全部 exitCode=0，详见 regression-details.json；原 60 秒单项超时没有放宽，任何子项失败都导致总退出码 1。
完整构建完成 AdSense prebuild、编译、类型检查、页面生成和 trace 收集；采用项目已有的 build 跳过 ESLint 配置，未声称全仓 ESLint 通过。

全量 HTTP 验证：116/116 sitemap URL，通过 canonical、robots、HTTP 状态和完整 HTML en/zh-CN/x-default；包含所有 36 个允许索引的 Guide URL。
56 个 Best topic 页面另检查精确候选计数、卡片、正文工具链接、日期标签、运营文案、空榜索引和 sitemap 一致性；jp/fr/tw 历史语言仍无 alternate。
同进程完整 sitemap 重复生成深比较通过，包括缺时间戳的可索引工具和分类。

19 个主题达到至少两个真实候选的比较门槛，9 个主题保留 noindex 并退出 sitemap；精确名单与用途依据见
[QA 修订说明](../../../docs/SEO_TOPIC_QA_REVISION_2026-09-10_CN.md)和 topic-inventory.json。
未推 main、未部署、未修改数据库。

开发过程非零退出码：

| 命令 | 退出码 | 处理 |
| --- | --- | --- |
| pnpm run test:regression (68f9338d baseline) | 1 | 9/13 passed; old hreflang, raw-image/delegation/docs guard, SVG placeholder string guard, and cache timer keeping completed data-access process alive. |
| pnpm exec tsx scripts/verify-webp-support.ts (intermediate) | 1 | WebNavCard delegated to ToolCardMedia; added verification of the full renderer chain. |
| pnpm run test:sitemap-pages (first full scan) | 1 | 114/116 passed; root href with/without trailing slash is the same URL. Compare parsed URL href while preserving exact alternate counts, locales and paths. |
| HTTP runner (first scan + topic probe) | 1 | Full scan returned 1; all 56 topic probes returned 0. Final full scan returned 0. |

原始日志保留在本目录（*.log 不入库）。sitemap-pages-first-attempt.json 保留首轮全量扫描结果，最终结果为 sitemap-pages.json。
