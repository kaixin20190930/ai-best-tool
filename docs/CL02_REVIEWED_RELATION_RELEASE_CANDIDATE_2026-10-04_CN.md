# CL-02 · Gemini Notebook / Perplexity reviewed relation release candidate

> 2026-10-06 superseding 候选：见[CL02 发布门禁修复审计](./CL02_PUBLISH_GATE_REMEDIATION_2026-10-06_CN.md)。旧前像仅留作历史；最新只读数量为 Gemini 5/10/6、Perplexity 6/10/7。三条 availability unknown 继续 HOLD；新版 RPC 迁移和 3/day 文案仅本地候选，尚未部署/应用/发布。

状态：**受控候选已准备，生产仍只读；当前 preflight HOLD，待 Gemini 关系与文案修复后再交独立 QA。** 本文件不是生产执行回执，也不是 Task Page 或索引批准。

## 生产只读前镜像

`pnpm run decision:cl02-reviewed-relations-preflight` 于 `2026-10-04T14:47:29.385Z` 只读读取 Supabase / Neon，并检查生产 Task URL 与 sitemap；`productionWrites=0`。既有 verifier 同时通过：Gemini Stage 2 `--reviewed` 输出 `stateMd5=486def34a4e7bae92811a42ed882804a`；Perplexity `--relation-reviewed` 输出 `stateMd5=c26a02ce57093a9d33cdfd68a3c46469`。这些摘要只用于还原此次准确读到的状态。

共同 Task 为 `527fe8b7-c171-4c50-ab1f-9404d7536e7c` (`research-with-citations`, `active`)；两条 Task Capability 仍为 published/current。公开 Task 仍 `404 + noindex`、未获 `APPROVED_TASK_PAGE_SLUGS` 批准，sitemap 排除 Task 与两个工具 URL。Gemini 与 Perplexity 的当前运行时索引决策均为 `indexing_paused`。新 RPC 写入范围仅 Supabase Tool Capability、Fit 与内部 timeline audit，不触及 Task、Task Capability、Neon 工具实体、页面注册表、metadata、index 或 sitemap。

### 精确关系前像

下列所有 Tool Capability 与 Fit 均为 `reviewed`，审核人 `2b8177ac-70b3-4475-a1ee-509ff8b4b622`。这些 `updated_at` 是发布 preflight 的乐观并发前像；任一内容编辑、重审或关联变化后都必须重新读取，不可复制旧值继续执行。

| 工具 | Profile ID / updated_at / review due | Decision tool ID / updated_at / review due | Tool Capability ID → updated_at | Fit ID → updated_at / review due | 生产关系 links |
|---|---|---|---|---|---|
| Gemini Notebook `cec78907-e2a1-4eb7-853a-a58334026280` | `c7890701-0000-4000-8000-000000000001` / `2026-10-01T08:10:49.466388Z` / `2026-11-02T00:00:00Z` | `cec78907-e2a1-4eb7-853a-a58334026280` / `2026-10-03T07:55:45.576765Z` / `2026-12-02T07:55:45.619972Z` | `…0201` → `2026-10-03T07:55:45.576765Z`; `…0202` → `2026-10-03T07:55:45.576765Z` | `c7890701-0000-4000-8000-000000000301` → `2026-10-03T07:55:45.576765Z` / `2026-12-02T07:55:45.619972Z` | `5 / 9 / 6` |
| Perplexity `3d018623-85f9-4df4-bd55-9a4a0e7a2d93` | `d0186230-0000-4000-8000-000000000001` / `2026-10-03T13:45:17.392282Z` / `2026-11-02T00:00:00Z` | `3d018623-85f9-4df4-bd55-9a4a0e7a2d93` / `2026-10-04T08:00:20.416155Z` / `2026-11-02T00:00:00Z` | `…0201` → `2026-10-04T08:00:20.416155Z`; `…0202` → `2026-10-04T08:00:20.416155Z` | `d0186230-0000-4000-8000-000000000301` → `2026-10-04T08:00:20.416155Z` / `2026-11-02T00:00:00Z` | `6 / 10 / 7` |

每个工具的两个 Tool Capability 与一个 Fit 都有同一 reviewer、当前 review window。现存链接所达 claims 均为同 owner、verified、official、current、无冲突、未失效；对应来源为 official 且 fetch success。Perplexity 两个 Tool Capability 各具 `support / availability / plan / limitation`，Fit 具 `fit / limitation`。Gemini 的 Tool Capability `…0201` 具四类 purpose；`…0202` 当前只有 `support / availability / limitation`，缺 `plan`，因此不能通过发布门禁。不能把 `9` 条现有 Capability links 当成满足每条关系四类 purpose。

### Gemini rationale 修订候选

生产 Fit 当前仍是下列历史理由，尚未变更：

- EN: `Works for source-grounded synthesis when users select a bounded source set and inspect each important citation.`
- CN: `用户选定有限资料集并逐条核查重要引用时，适于资料锚定的综合。`

由管理员在现有 Decision Fit 编辑表单通过 `saveClusterFit` 修订并重审为：

- EN: `Use Gemini Notebook to synthesize sources the user selects or supplies and imports into a notebook; it can discover some Web or Drive sources for selection, but it is not open-web search.`
- CN: `用于综合用户选择/提供并导入 notebook 的资料；也可发现部分网页或云端硬盘来源供选择，不等同于开放网页检索。`

保留现有已审核的 conditions 与 disqualifiers：明确 Google 托管、账号/地区限制、检查导入来源和引用段落；不适用于要求穷尽可复现文献检索、跨 notebook 同时覆盖或未经复核高风险结论。候选理由明确区分 Notebook 内用户选定/提供并导入的资料，与 Perplexity 的开放网页发现，不声称 Gemini Notebook 只能接收上传文件。

Perplexity 的双语 rationale、conditions、disqualifiers 均通过机器门槛：理由限定开放网页发现与带来源回答；条件要求选定搜索焦点、确认套餐、检查原文与方法及隐私；排除穷尽可复现系统综述、保证引文准确或默认含 API 权益。

## 受控操作与回滚边界

`decision_cluster_transition` 为一个 Task 要求完整 Task Capability、Tool Capability、Fit manifest；CL-02 Task Capability 已 published，而两个目标 Tool Capability/Fit 为 reviewed，当前状态不适合用它分别验证并发布单一工具组。为此新增范围受限的 service-role-only 事务 RPC：

- [Gemini plan purpose 补链迁移](../db/supabase/migrations/20261004_admin_gemini_plan_link_repair.sql)：管理员 Evidence Review Queue 提供按钮，只在固定 Gemini claim 407（`plans-2026-10`）已 verified/current、同 owner 官方来源有效、父级 Decision/Capability/Fit current-reviewed、既有 `5/9/6` 链接完全匹配时，向 citation-traceability Capability 加 `plan` link。重放返回 unchanged；部分或漂移状态拒绝。此步骤不会发布关系。
- [单工具组发布迁移](../db/supabase/migrations/20261004_admin_publish_reviewed_task_tool_group.sql)：限定 `research-with-citations`，要求完整工具组 ID 与 `updated_at` 前像、reviewer/期限、同 owner ready profile、official/current verified 无冲突 claim；每个 Tool Capability 四类 purpose、Fit 两类 purpose，及双语 rationale/conditions/disqualifiers。Preflight 只读；发布在一个数据库事务内将该工具两条 Capability 与 Fit 发布并留内部审计，不改 Task/Task Capability/工具目录/index/sitemap。相同前像及 QA reference 的重放返回 unchanged；updated_at 漂移或部分/额外关系整组拒绝。
- [单工具组撤回迁移](../db/supabase/migrations/20261004_admin_withdraw_task_tool_group.sql)：用发布后新 `updated_at` 前像和撤回理由，事务性将该工具组退回 `stale` 并留 `decision_withdrawal` 审计，方便重新审核。失败时 PostgreSQL 原子回滚；撤回范围仍仅 Tool Capability/Fit，不改变 Task Page、Task Capabilities、工具目录或索引。

Admin 按钮和 server action 已分别接入 Evidence Review Queue 与 Decision 管理页，不要求日常 SQL。生产迁移尚未应用，本任务没有点击写入操作。Task Page 仍须单独执行现有 `decision:task-page-editorial-preflight`，并等待其独立 QA；本候选不会批准、创建或开放该页面。

## 当前 blocker 与下一步

生产 preflight 当前 `readyForIndependentQa=false`：Gemini citation-traceability 缺 `plan` purpose；Gemini rationale 尚未改成上面的双语候选。Perplexity 所有门槛目前通过。按顺序，在已部署 Admin 流程中完成 Gemini plan link 修复、保存并审核 Fit rationale，然后重新运行该 preflight 获取新前像；全部 PASS 后将新 manifest 交总控安排独立 QA。任何 reviewer/期限/来源或 `updated_at` 变化都必须重新 preflight。

专项自动测试覆盖单组 read-only preflight、service-role/RLS、精确 manifest、目的类别、evidence owner 与 current 状态、漂移拒绝、全组原子发布、发布幂等和 withdrawal 边界。当前交付没有生产写入、push、部署，也未改 `APPROVED_TASK_PAGE_SLUGS`、sitemap、工具 index 状态或工具实体。
