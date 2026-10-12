# Research Relation Readiness（2026-10-12）

状态：**生产只读诊断完成；关系发布 HOLD；无代码、迁移或生产数据变更。** 本单元只处理既有 `research-with-citations` 关系的发布准备，不批准 Task Page、索引、canonical 或 sitemap。

## 当前生产快照

2026-10-12 13:33–13:36（上海时间）经 `pub-03-readonly-run.mjs` 回读，三个命令/查询均为 `productionWrites=0`：`preflight-cl02-reviewed-relations.ts`、`verify-perplexity-stage2-readonly.ts --relation-reviewed`，以及针对三工具 Decision/Capability/Fit、links、claim、source 的只读 GET。页面 `/cn/tasks/research-with-citations` 仍为 404/noindex，Task URL 与 Notebook/Perplexity 工具 URL 均未进入 sitemap。下列日期为 UTC 原值。

| 工具 | Decision | Tool Capability | 本 Task Fit | 复核期限与阻断 |
| --- | --- | --- | --- | --- |
| Consensus `f15873ae-c6ef-4f0a-b811-b40c2aba76ab` | 无 `tool_decision_profiles` 行 | `5e6f6ba6-8587-4c59-977a-ed74672dee5c`，`research-discovery`，`published`，strong / all_plans；7 links | `d52cc53b-6e5f-4b0b-809b-140076d4d7d2`，`published`，strong；6 links | Capability、Fit、claim 和 profile 期限均为 `2026-12-23T03:00:04.892Z`。7 条关联 source 的 `fetch_status=pending`，虽有 verified claim 和历史 published 状态，**不能把它当作当前新发布合约的 `success` 来源**。不在本单元改动。 |
| Gemini Notebook `cec78907-e2a1-4eb7-853a-a58334026280` | `reviewed`；到期 `2026-12-02T07:55:45.619972Z`；5 links | `...201` research-discovery：partial / **unknown**；`...202` citation-traceability：strong / all_plans；均 `reviewed`，到期 `2026-12-02T07:55:45.619972Z`；合计 10 links | `...301`，`reviewed`，conditional；6 links；到期 `2027-01-04T03:41:42.906104Z` | profile/linked claims 到期 `2026-11-02T00:00:00Z`。唯一内容阻断为 discovery Capability 的 `AVAILABILITY_UNKNOWN`。 |
| Perplexity `3d018623-85f9-4df4-bd55-9a4a0e7a2d93` | `reviewed`；到期 `2026-11-02T00:00:00Z`；6 links | `...201` research-discovery：strong / **unknown**；`...202` citation-traceability：partial / **unknown**；均 `reviewed`，到期 `2026-11-02T00:00:00Z`；合计 10 links | `...301`，`reviewed`，conditional；7 links；到期 `2026-11-02T00:00:00Z` | profile/linked claims 同于 `2026-11-02T00:00:00Z`。两条 Capability 均被 `AVAILABILITY_UNKNOWN` 阻断。 |

Notebook 和 Perplexity 的现行只读 preflight 确认：profile ready、reviewer/期限有效，Decision/Capability/Fit 理由存在，计划与限制为双语结构，所需 `support/availability/plan/limitation` 和 `fit/limitation` 链接齐全；当前链接的 verified claim、official source、同 owner、`fetch_status=success` 与到期检查均通过。`readyForIndependentQa=false` **只因上述三处 unknown**，不能把“存在 availability-purpose 证据链接”等同于“可以确定 availability 枚举”。

### 角色理由与证据

| 工具 | 当前 Fit rationale（中文摘录） | 关键当前关联官方来源 |
| --- | --- | --- |
| Consensus | 可检索学术论文、用来源支撑 AI 摘要并展示引用依据；适用范围限已收录资料，须人工核查。 | [检索原理](https://help.consensus.app/en/articles/9922673-how-consensus-works)、[学术数据库与全文边界](https://help.consensus.app/en/articles/10055108-consensus-research-database)、[套餐](https://help.consensus.app/en/articles/10087865-subscription-plans)、[全文聊天模式](https://help.consensus.app/en/articles/10068241-how-to-chat-with-full-text)、[AI 限制](https://help.consensus.app/en/articles/10046838-responsible-ai-limitations)。旧 source 行均为 pending。 |
| Gemini Notebook | 综合用户选定并导入 notebook 的来源，可发现部分 Web/Drive 来源供选择；不等于开放网页检索。 | [产品与引文](https://support.google.com/gemininotebook/answer/16164461)、[导入和发现范围](https://support.google.com/gemininotebook/answer/16215270?hl=en)、[套餐可用性](https://support.google.com/gemininotebook/answer/16213268?hl=en)、[计算量限制](https://support.google.com/gemininotebook/answer/17670842?hl=en)、[notebook 边界](https://support.google.com/gemininotebook/answer/16206563?hl=en)、[数据处理](https://support.google.com/gemininotebook/answer/17004255?hl=en)。 |
| Perplexity | 仅在逐条核读重要原文时，用于开放网页发现与带来源回答。 | [Pro Search/来源链接与 Focus](https://www.perplexity.ai/help-center/en/articles/10352903-what-is-pro-search)、[套餐](https://www.perplexity.ai/help-center/en/articles/11187416-which-perplexity-subscription-plan-is-right-for-you)、[来源标签限制](https://www.perplexity.ai/help-center/en/articles/20260806-understanding-source-labels)、[数据边界](https://www.perplexity.ai/help-center/en/articles/11564572-data-collection-at-perplexity)、[Web/API 权益边界](https://www.perplexity.ai/help-center/en/articles/10352986-enterprise-pricing-and-billing-frequently-asked-questions)。 |

## 根因与最小处理

类别是**关系数据的 availability 仍为 unknown**，并非缺少发布按钮、证据链接或 Fit 理由。`20261006_admin_publish_reviewed_task_tool_group_bilingual_gate.sql` 拒绝 unknown 是正确的保守发布门禁。现有 `/[locale]/admin/decision` 的 Tool Capability 编辑、同页 “CL-02 reviewed tool group release” 的只读 preflight 与精确组发布已经提供受控路径；本单元不修改代码或合约，不以 SQL 执行日常修订。

Admin 的 Tool Capability 表单是全字段保存，默认 JSON 为 `{}` / `[]`，**编辑既有行时必须先复制当前完整 preimage**，包括 tool/capability ID、support、plan requirement、limitations 和 status；只改变经审核的 availability，并保留其他值。保存会刷新 `reviewed_at`、`review_due_at`、`updated_at`，因此随后必须从页面重新取得发布清单，不能复用本快照的时间戳。此操作风险由人工逐字段比对和独立 QA 控制；若无法审出准确枚举，保持 unknown/HOLD。

## 精确 Admin 操作（待 Owner/独立内容 QA 决定）

1. 在 `/cn/admin/decision` 的 Tool Capability 编辑区定位既有三条 ID：Notebook discovery `c7890701-0000-4000-8000-000000000201`；Perplexity discovery `d0186230-0000-4000-8000-000000000201`；Perplexity citation-traceability `d0186230-0000-4000-8000-000000000202`。逐条核读上述官方来源、当前 claim 的适用产品/套餐/账号/地区范围及实际可用性；对每条分别写出审核结论和 QA 引用。`all_plans`、`paid_only`、`enterprise_only`、`add_on` 只有被相应窄范围证据支持时才选；套餐有差异或不确定时不得猜选以跨门禁。
2. 对可以确认的既有行，在 Admin 表单填入固定行 ID、tool ID、capability ID、原 support/双语 plan requirement/双语 limitations、`reviewed`，只将该行 availability 改为有依据的枚举。保存后重新打开核对所有字段、reviewer、期限与链接。若证据、claim 或来源需要更新，先按现有 Admin 证据审核流程完成并复核同 owner、verified/current、official/source success；不得新建关系。
3. 两条工具组各自先运行 “CL-02 reviewed tool group release → Read-only preflight”。Notebook 精确组为 Capability `c7890701-0000-4000-8000-000000000201/202` + Fit `c7890701-0000-4000-8000-000000000301`（预期 16 条关系证据链接）；Perplexity 为 `d0186230-0000-4000-8000-000000000201/202` + Fit `d0186230-0000-4000-8000-000000000301`（预期 17 条）。核对返回证据 URL、purpose、claim owner、review due 和精确 `updated_at`。任何门禁失败均 HOLD。
4. **本单元不执行 Publish。** 独立 QA 签署确切关系与证据后，由 Owner 决定是否在同一 Admin 面板填入独立 QA reference、点击 “Publish reviewed group”。RPC 再检查真实 reviewer、RLS、精确组/前像、当前证据与发布事务。两组分别操作，不包含 Consensus、Task Capability、Task Page 或索引动作。
5. 只读 postcheck：刷新同页 Admin overview，并用受限 GET 分别读取 `tool_capabilities` 中上述四个固定 ID（两组共四条）、`tool_task_fits` 中上述两个固定 ID及各自 `tool_capability_claims`/`tool_task_fit_claims`；核对六条目标关系为 `published`、三个原 unknown 已变为有依据的枚举、复核期仍当前、链接数量分别为 16/17 且 owner/source/claim 仍满足发布前清单。再只读核对 Consensus 关系未变，GET `/cn/tasks/research-with-citations` 仍为 404/noindex、Notebook/Perplexity 仍 monitor/noindex、sitemap 仍排除这些 URL。`preflight-cl02-reviewed-relations.ts` 和 `verify-perplexity-stage2-readonly.ts --relation-reviewed` 均预期目标仍为 reviewed，**不得作为发布后 PASS 命令**。

回滚边界：Admin 面板的 “Withdraw published group to stale” 是受控撤回入口，按精确 `updated_at` 和理由操作；**不会恢复原 reviewed 前像**，再次发布需重新审核。未发布时不需要回滚。不得用 routine SQL 修改关系，也不触碰用户自有的两份 dirty SQL。

## 后续与 QA 风险

- 独立 QA 逐项核查三个 availability 判断是否真正受来源支持，尤其 Notebook discovery 的账号/地区/套餐差异，Perplexity 基础搜索与 Pro Search 引文/额度区别；不能以链接数量代替语义核验。
- Admin 全字段编辑可能覆盖既有 plan/limitations；比较保存前后完整 JSON 与三个目标行之外的关系，确认 `reviewed_at` 刷新后使用新的 `updated_at`。
- Consensus 的 published 关系有历史 source pending 与缺失 Decision 行。这不自动撤销历史发布，但会影响按现行证据合约声称其“当前 ready”；另案核验，不能借此放宽 Notebook/Perplexity 门禁。
- 当前只有 Consensus 一条 published Fit。Scite 尚无本 Task 的已发布 Fit；即使两组后续发布使 Fit 数达到三，也仍须完整只读读模型核验和**另案页面审批**。Task Page 继续关闭。
