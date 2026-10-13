# APP-BUILDER-PRIMARY-GUIDE-IA-01：主入口与路由决策

日期：2026-10-13（Asia/Shanghai）  
决策：`B_DISTINCT_PRIMARY_GUIDE_TASK_DOWNSTREAM`  
级别：R（只读架构审计）；本文件不批准页面实现或索引。

## 决策摘要

**需要独立的 app-builder 主 Guide。** `Task Page` 的职责是由已发布、当前且有证据支持的 Task/Capability/Fit 关系生成结构
化候选决策界面；Guide 才承担稳定的编辑性搜索入口与比较内容 canonical 目标。两者服务相邻但不同的用户任务，不互相取代。

冻结以下目标 URL 模型，作为后续实现输入，不代表这些路由现已存在：

| 页面角色                          | 英文路径                             | 中文路径                                | SEO / canonical 边界                                                                                                                                                     |
| --------------------------------- | ------------------------------------ | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 主 Guide                          | `/guides/ai-app-builders`            | `/cn/guides/ai-app-builders`            | 完整双语内容上线并通过 Guide 内容/索引门禁后，分别 self-canonical；仅 EN/CN 等价页面输出 `en`、`zh-CN`、`x-default` hreflang。获得索引资格前保持 noindex、不进 sitemap。 |
| 结构化 Task                       | `/tasks/build-app-with-ai`           | `/cn/tasks/build-app-with-ai`           | Task 关系与编辑发布门禁通过后才开放；沿现有 Task 模板 self-canonical、`noindex, follow`、不进 sitemap，不输出搜索 hreflang。                                             |
| Structured Comparison（后续可选） | `/guides/ai-app-builders-comparison` | `/cn/guides/ai-app-builders-comparison` | 只有主 Guide 已上线且是有效的 canonical 目标后才可创建；首发 `noindex, follow`、不进 sitemap、canonical 指向同语言主 Guide；不预先批准 self-canonical 或独立索引。       |

英文 URL 不带 `/en`。中文必须提供完整、等价的简体内容才使用 `/cn` 并互列 hreflang。其他语言不加入此批路由的 hreflang 或
sitemap。

## 现状与证据

- 生产只读 GET：`/tasks/build-app-with-ai` 与 `/cn/tasks/build-app-with-ai` 当前均为 **404**；这与 middleware 关闭未批准
  Task 路由的规则一致，不是工具页下线。
- [`taskPageApproval.ts`](../lib/seo/taskPageApproval.ts) 当前仅批准 `meeting-notes`。Task route 在取数失败、无 Task、编
  辑门禁关闭时 fail-closed 为 404。
- [`taskPage.ts`](../lib/services/decision/taskPage.ts) 要求至少两条 Task Capability 和三条 published Fit，并联读当前身
  份、Fit Claim links、有效 Claim/profile；[`taskPageReadModel.ts`](../lib/services/decision/taskPageReadModel.ts) 再过
  滤过期、冲突、错误归属或无来源证据的关系，少于三个可用工具即返回 `null`。因此不能靠四个工具详情页 HTTP 200 推断 Task
  候选已就绪。
- [`ai-coding-tools-comparison`](<../app/[locale]/(with-footer)/guides/ai-coding-tools-comparison/page.tsx>) 是编码助手
  比较占位页，入口、标题和正文指向代码补全、IDE、调试与重构；不能改作 prompt-to-app 比较页。既有搜索意图审计见
  [`BUILD_APP_COMPARISON_INTENT_AUDIT_2026-10-13_CN.md`](./BUILD_APP_COMPARISON_INTENT_AUDIT_2026-10-13_CN.md)。
- [`ai-tools-for-developers`](<../app/[locale]/(with-footer)/guides/ai-tools-for-developers/page.tsx>) 范围包含编码、模
  型/API、自动化、调试及基础设施，过宽，不能作为应用构建器比较 canonical。
- 当前版本化逐 Claim 快照仅覆盖 **v0 与 Replit** 的 Git/源码、托管、数据/后端、集成、费用和维护维度，共 12 条 Claim：5
  条 `verified_public`、6 条 `conditional`、1 条 `unknown`。**Bolt 与 Lovable 不在此快照范围内**；在形成四工具 Guide 或
  Comparison 前，必须分别补齐并核验它们各自当前、可追溯的 Claim 证据。该快照不等价于 Task Fit，也不代表账户实测。见
  [`BUILD_APP_V0_REPLIT_EVIDENCE_2026-10-13_CN.md`](./BUILD_APP_V0_REPLIT_EVIDENCE_2026-10-13_CN.md)。
- 最近 GSC 本地完整快照截至 2026-10-10，页面/query 表只提供 top rows，不能读出 app-builder 单页或该查询簇的完整需
  求；Task 当前 404、比较页 noindex，也不能以自身展示缺失推断零需求。数据边界见当日
  [`GSC 报告`](../.local/gsc/a2847bc96613/search-analytics-2026-10-10.md)（该链接目标为本地忽略文件，仅作现状引用，不作
  为长期审计附件）。

## 页面职责与内链

- **主 Guide**：回答“我想从 prompt/需求生成并交付一个可运行网站或应用，该选哪类构建器、上线后由谁维护”。内容以生成产物、
  代码/Git 交接、托管/部署、数据与后端、集成、费用和维护责任为决策维度；逐项标明来源与
  `verified_public`、`conditional`、`unknown` 边界。不把所有工具排成未经证实的名次，不声称本站已做账户、迁移或成本实测。
- **Task Page**：表达结构化的 Task → Required/Preferred Capability → 当前候选 Fit，解释条件、限制和证据。它是用户从编辑
  Guide 继续筛选的下游工具，不承担主 Guide 的长篇搜索意图，也不应在关系不齐时用静态工具卡片伪装已发布 Fit。
- **Comparison**：只有四工具对应决策维度有可核查内容时才实现。它必须是主 Guide 的次级、结构化比较，不复制 Guide 全文或争
  夺同一主标题/首屏意图。
- 内链方向：Guides root、确实讨论 prompt-to-app 的相邻 Guide 可链接主 Guide；主 Guide 在 Task 路由正式开放后，以明确的“
  按已审核能力筛选”CTA 链到 Task；Comparison（若创建）从主 Guide 作为次级入口链接。编码 Guide、编码榜单、coding 类别仍链
  接既有 coding 页面；不改其主要链接，不做两种意图间 301/308。
- 可见面包屑与 JSON-LD 同源：主 Guide 为 `Home > Guides > AI app builders`；Task 为
  `Home > Find tools > Build an app with AI`；Comparison 为 `Home > Guides > AI app builders comparison`。页面缺少本地化
  等价内容时，不构造虚假的 hreflang 对。

## 被拒选项

- **A：让 Task Page 作为主搜索页和 Comparison canonical**：拒绝。Task 页面依赖关系发布、最少候选数、实时证据有效期与单独
  编辑开放；当前生产 404。用它作唯一搜索入口会把关系系统未就绪变成用户/SEO 主入口停摆，也不符合 Task Page 的结构化决策职
  责。
- **C：目前完全不设公开主入口**：拒绝为目标架构，但当前发布门禁仍然关闭。v0 与 Replit 已有版本化 Claim；Bolt 与 Lovable
  仍须各自补齐当前证据。四工具证据与编辑内容门禁通过前，不创建路由、不承诺已上线。

## 实现前置条件与最小变更集

1. 编辑确认 Guide 的最终 H1/title、唯一主意图和正文边界；以 `/guides/ai-app-builders` 为目标 slug。确认 EN/CN 提供完整等
   价内容。不得将 `ai-tools-for-developers` 或 coding Guide 改名复用。
2. 基于四工具各自完整、当前的版本化 Claim 制作 Guide 正文，引用官方来源；目前先补齐 Bolt 与 Lovable 的证据，再与 v0、
   Replit 快照合并审阅；把 `conditional` 与 `unknown` 清晰展示。任何新变化先更新对应 Claim，不要求为无关稳定 Claim 全量
   重审。
3. Guide 实现时用统一 localized metadata、canonical、hreflang、可见 Breadcrumb/JSON-LD；按独立 Guide 内容门禁决定
   index/sitemap。未获准索引时 noindex、不进 sitemap。
4. Task Page 只有在 Task/Capability/Fit、有效 Claim links、关系编辑 QA 与 Task 页面编辑注册全部通过后开放；关系门禁未过
   时维持 404，不影响 Guide 上线。
5. Comparison 不属于本交付。将来仅在主 Guide 已返回 200 且符合站点 canonical 目标要求时另开交付，路径采用表中候选，首发
   canonical 同语言主 Guide、noindex、不进 sitemap。若主 Guide 不可索引/不存在，则不创建 comparison 路由，不指向无效或
   noindex primary。
6. 仅对新增页面与链接做增量验证：页面意图/内容、EN/CN canonical/hreflang、Breadcrumb、robots/sitemap 一致性及关键入
   链。Task 若启用，再验关系失效时 fail-closed。索引或 sitemap 准入仍须独立授权/审核。

## 风险、回滚与非批准

- `AI coding`、`vibe coding`、`AI app builder` 语义相邻；通过标题、H1、首屏任务、候选集合和链接上下文分离。若后续 SERP
  证据显示意图真实融合，重新审计，不靠多建页解决。
- 回滚仅撤销本次新增 Guide/Comparison 路由和指向这些路由的新增内链，保留 `/guides/ai-coding-tools-comparison` 原意图；不
  新增重定向，不影响工具 canonical。
- 本决策**不批准**：任何公开路由、Guide 正文发布、Task/Capability/Fit 写入或发布、comparison 创建、self-canonical 例
  外、`index`/`continue_index`、sitemap 准入、数据库变更、部署或 SEO 槽位消耗。

## 验收范围

- 开发自查：R 级文档格式、相对本地链接有效；生产只读状态记录为 `/tasks/build-app-with-ai` 和
  `/cn/tasks/build-app-with-ai` 404。
- 不运行 TypeScript、build、生产 smoke，不做 DB/RPC/账号操作，不 commit/push/deploy。
- **独立 QA 焦点**：核对选择 B 与 Task Page 的真实职责/404 和至少三条当前 Fit 门槛一致；路由是候选而非已创建；primary
  Guide 与 comparison canonical 关系符合 guardrails；hreflang 仅限完整 EN/CN；当前 404 Task 不被主 Guide 内链；没有把
  GSC top rows 或公开工具页当作需求/关系证据；非批准与回滚边界明确。
