# BUILD-APP-COMPARISON-INTENT-01：搜索意图与信息架构决策

日期：2026-10-13（Asia/Shanghai）  
结论：`PRESERVE_CODING_URL; DISTINCT_APP_BUILDER_URL_LATER; NOINDEX_FIRST`  
范围：只读 SEO/IA 研究与决策；不批准页面实现、Task 关系、索引或 sitemap 变更。

## 决策

保留 `/guides/ai-coding-tools-comparison` 作为“AI 编程助手/编码工具”比较意图，不把它改造成 Bolt、Lovable、Replit、v0 等
prompt-to-app 产品比较页。当前没有找到能忠实承接应用构建器比较的主 Guide：`/guides/ai-tools-for-developers` 涵盖编码、模
型/API、调试、自动化和基础设施，范围过宽。若后续证据与内容准备度达标，必须先建立并批准一个聚焦应用构建器任务的主 Guide，
再确定 comparison 路由和其对应 canonical 目标。Comparison 初始仍按站点规则 `noindex, follow`、排除 sitemap，默认
canonical 指向已批准的对应主 Guide；若要独立索引或改变 canonical，须另行通过 SEO IA 门禁。此决策不批准现在创建新页或新
Guide，也不改变当前索引策略。

## 依据

### 搜索结果呈现的意图差异

本次以代表性英中查询检查搜索结果标题、摘要和落地页主题；这用于识别结果意图模式，不代表关键词量、排名机会或流量预测。

| 查询主题                                                               | 结果页主要对象与任务                                                                                                  | 用户需要解决的问题                              |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `AI coding tools comparison` / `AI 编程助手 对比`                      | Cursor、Claude Code、GitHub Copilot 等 IDE、终端 Agent、编辑器插件；常见维度为代码补全、仓库/编辑器工作流、调试、重构 | 在既有开发环境中选择编码助手或 Agent            |
| `AI app builder comparison` / `AI 应用构建器 对比`、`AI 建站工具 对比` | Lovable、Bolt、Replit、v0 等 prompt-to-app/应用构建平台；常见维度为生成产物、前后端/托管、部署、代码交接与维护        | 从想法生成网站/应用，并判断如何运行、交付和维护 |

可复核的结果样例：英文 app-builder 比较明确比较生成内容、后端、代码所有权、价格和适用边界
（[AppElixir](https://appelixir.com/articles/ai-app-builder-comparison-lovable-bolt-v0-replit/)）；中文结果以“AI 应用构
建器”命名，并围绕对话生成、浏览器内 IDE、完整开发环境划分
（[vibecoding.app](https://vibecoding.app/blog/zh/bolt-vs-lovable-vs-replit)、[奇连 AI](https://iqilian.com/learn/ai-jianzhan-gongju-duibi/)）。
编码助手结果则把 Cursor、Claude Code、Copilot 分别按 IDE、CLI、插件和工作流来比较
（[Easton 中文结果样例](https://eastondev.com/blog/zh/posts/ai/20260419-ai-coding-assistants-comparison/)）。这些样例证
明的是现有结果的表达模式，不证明市场规模或用户偏好强弱。

### 仓库中的路由与内链

- `/guides/ai-coding-tools` 是有明确编码任务内容的主 Guide，涵盖补全、重构、调试、脚手架、编辑器和仓库工作流，并链接到
  coding comparison。
- `/guides/ai-coding-tools-comparison` 当前是 `UnavailableComparisonPage` 占位，metadata 将页面命名为 AI coding tools
  comparison，带 `noindex`；页面返回到 coding Guide。它不是可直接重用的 app-builder 内容页。
- `/guides/ai-tools-for-developers` 是广义开发者 Guide，包含编码、模型/API、调试、自动化和基础设施入口；它不是应用构建器
  比较的忠实主 Guide，不能未经改造和批准就作为对应 canonical 目标。
- Coding comparison 入口还出现在 `lib/content/guides.ts`、`lib/data/topLists.ts`、Guides 根页、`ai-tools-for-developers`
  页面，以及 coding 类别的 Guide 映射中。现存上下文把该 URL 归入编码/开发工具路径。
- 相关文
  件：[`ai-coding-tools`](<../app/[locale]/(with-footer)/guides/ai-coding-tools/page.tsx>)、[`ai-coding-tools-comparison`](<../app/[locale]/(with-footer)/guides/ai-coding-tools-comparison/page.tsx>)、[`guides.ts`](../lib/content/guides.ts)、[`topLists.ts`](../lib/data/topLists.ts)、[SEO IA guardrails](./SEO_INFORMATION_ARCHITECTURE_GUARDRAILS_CN.md)。
- 当前 comparison route 直接使用 noindex metadata，文件内没有显式调用统一 localized metadata builder。实施前须检查最终响
  应中的 canonical/hreflang；本审计不推断其线上 head 值，也不在本轮修复。

### GSC 解释边界

最近本地 GSC 快照（`.local/gsc/a2847bc96613/search-analytics-2026-10-10.md`）截至 2026-10-10：7 天全站 633 impressions /
3 clicks，28 天 1362 impressions / 7 clicks。报告只列 top rows，未列 coding Guide/comparison 的完整逐页数据；因此不能据
此声称某页零需求或比较页表现失败。Comparison 当前 noindex，其页面级搜索展示本来就不适合作为需求验证。该快照位于 git 忽略
目录，不作为长期版本化证据。

## 选项评估

| 选项                                                           | 决定     | 原因                                                                                                                                             |
| -------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| 保留编码比较 URL，并为 app builders 另设一个清晰区分的候选 URL | **采用** | 尊重当前链接图和页面承诺；承接两个不同任务。新 URL 仅为未来候选，不在本交付创建。                                                                |
| 把现有 URL 扩宽成编码助手 + app builder 混合比较               | 拒绝     | 两种候选的起点、产物和决策维度不同；会把 coding Guide 的补全/重构入口引到 prompt-to-app 比较，弱化页面主题并增加内部竞争。                       |
| 暂时不保留 coding comparison URL，直到证据/意图达标            | 拒绝     | 当前 URL 已在多个内部入口中承担稳定的次级 coding 路径；页面 noindex 且内容 unavailable，更适合保留 URL、后续只补齐同一意图，而不是撤掉或改意图。 |

## 未来实施边界

仅在四工具证据、用户决策问题和内容差异已达到独立发布门槛后，另开单一实现交付单元：

1. 先建立并批准一个聚焦“从需求生成可运行应用时如何选择”的主 Guide，确认其内容、slug、页面类型与 metadata；随后才确定
   comparison 路由及对应 canonical 目标。不得在主 Guide 决策前预设或发明 URL，也不得复用 coding assistant 的页面标题或补
   全/重构承诺。
2. 再比较可证实的决策维度：生成产物/适用项目、源码与 Git 交接、托管与部署、数据/后端边界、集成、费用和维护责任。未知项明
   确为 unknown/conditional；不虚构账户实测、迁移成功率或总成本。
3. 采用站点统一 localized metadata/canonical 与 breadcrumb 模式；上线初始保持 `noindex, follow`、排除 sitemap，canonical
   按 SEO IA guardrails 指向获批的对应主 Guide。只有将来独立索引另行获批后，才重新评估 comparison 的 canonical；本决策不
   预先批准 self-canonical。
4. 新页的主要内链只从明确涉及 prompt-to-app/应用构建任务的 Guide、Task 或工具详情上下文增加；不把编码 Guide、coding Best
   topic、coding 类别的现有主链接改指向新页。可在用户确实面对相邻选择时添加措辞明确的次级交叉链接。
5. 保留 `/guides/ai-coding-tools-comparison` 的 coding intent，后续实现仍以 IDE/插件/CLI/编码 Agent、代码补全、编辑/仓库
   工作流、调试与重构为边界。应用构建器 comparison 不得以 coding Guide 充当 canonical primary，也不应让两种意图互相
   301/308。

## 风险、门槛与回滚

- **Cannibalization：** “AI coding tools”“AI app builders”“vibe coding”在搜索语言中会交叠。通过不同 H1/title、候选产品边
  界、首屏任务、比较维度和内链上下文隔离；若真实 SERP 后续融合，先重新评估而非机械保留双 URL。
- **面包屑：** 新页若实现，面包屑应为 Home > Guides > AI app builders comparison；可见面包屑与 JSON-LD 同源，使用
  localized URL helper。现有 coding 面包屑保持 coding 名称和层级。
- **Canonical/index：** 不能只凭目标词创建页。先确定并批准真实对应的主 Guide；新 comparison 初始 noindex、无 sitemap 条
  目，canonical 指向该主 Guide。若申请独立索引，须单独评估是否允许 self-canonical 并通过索引门禁；页面内
  容、metadata、Breadcrumb 和内部链接须同意图。任何 index/sitemap 改动必须单独授权/门禁。
- **实现范围：** 未来最小变更只新增独立 comparison 内容与少量相关内链，不改 coding URL、全站 metadata 模板、类别定义或关
  系数据库。若页面上线后发现意图重叠或数据不足，回滚新增路由及指向它的内链，保持 coding URL 不变；不得用重定向把两个意图
  合并。

## 本轮验证与 QA 焦点

- R 级：审阅 controller lock、先前 HOLD 审计、v0/Replit Claim 快照、现有 Guide/comparison 路由与内链、SEO IA/索引政策及
  截至 2026-10-10 的 GSC 摘要；检索英中代表性查询结果并核看样例页面的标题与主题。
- 文档链接与格式检查通过；未改路由、metadata、内部链接、数据库/关系、canonical/index/sitemap、build、生产或自动化；未提
  交或部署。
- 独立 QA 只需复核：结果样例是否支持“意图模式不同”而未被夸大成流量结论；内链归属与 noindex/GSC 边界是否准确；三种架构选
  项的决策是否遵守冻结的 SEO guardrails；未来 scope 与 rollback 是否未越权批准实际发布。
