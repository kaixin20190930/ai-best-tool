# CL-07 · 剩余 Task cluster 生产只读收口

状态：**历史只读审计完成；本文件另记录 CL-04 后续受控撤回**。本文件的五组生产回读及同日页面、SEO 与本地代码验证时点为 2026-09-27T13:07:48Z；其 CL-04 reviewed 数值是该时点历史快照。2026-09-28T00:35:17.31865Z 两条 CL-04 Fit 后续已受控转为 `stale`。此更新不改写历史审计数。CL-07 不启动 DIFF-08。

## 1. 范围与核验方式

运行 `node scripts/pub-03-readonly-run.mjs pnpm exec tsx scripts/verify-decision-cl07-closeout-readonly.ts`：Neon 工具目录使用 `BEGIN READ ONLY`；包装器将 PostgreSQL 会话设为只读，阻断 Supabase/其他 HTTP 写请求及 RPC；脚本仅调用 select 和 GET。逐组断言 Task 身份与 active 状态、两条 Task Capability、Tool Capability/Fit 数量与状态、工具 owner、profile/source/claim/link 的精确边界。对已发布 CL-02 额外断言关系 reviewer/复查窗口、同 owner verified/current 官方 claim 与四类 Tool、两类 Fit evidence purpose。输出不含 secret、claim value 或 source excerpt。

本次五组共 10 条 Task Capability、4 条 Tool Capability、4 条 Fit，涉及 5 个 profile、26 个 source、33 个 claim、10 条 Tool link、9 条 Fit link；这些 source/claim 总数包含既有未发布、旧资料和 Claude 通用资料，**不能当作五组均具备可发布证据**。全图 `verify:decision-graph-seed` 另回读 6 Task、12 Capability、12 Task Capability、7 Tool Capability、7 Fit、12 条 published 关系；12 = meeting-notes 的 8 条 + CL-02 的 4 条，未出现新发布。

## 2. 分组结论

| 组 | 生产关系与证据回读 | 编辑结论与写入边界 |
| --- | --- | --- |
| CL-02 Research | 两条 Task Capability、Consensus Tool Capability 与 Fit 均 `published`；profile `ready`，7 source/8 claim（含旧记录），当前目标有 Tool 7 + Fit 6 条 link，目的分别覆盖 `support/availability/plan/limitation`、`fit/limitation`；13 条 link 的 claim 同 owner、verified/current、官方来源与 reviewer 窗口通过。 | 已发布并通过独立生产 QA；仅此组发布，不等于 Task Page 获批。旧 claim 留档，不作为本次新证据。 |
| CL-03 Image-video | 两条 Task Capability、Luma Tool Capability/Fit 均 `reviewed`；Tool `availability=unknown`；ready profile 仍为 4 source/2 旧 claim，仅旧 `support` 与 `fit` 各 1 link。 | Ray3.2 候选独立 QA_PASS 可保留，身份/内容/timeline 修复已回读；缺能直接映射 `availability` 的证据，关系 HOLD、未发布。旧 link 不可充当 Ray3.2 全字段证据。 |
| CL-04 App-build | 两条 Task Capability、n8n/OpenRouter 各一条 Tool Capability/Fit 均 `reviewed`；两 Tool `availability=unknown`；2 ready profile 合计 12 source/7 claim，仅各 1 条旧 `support` 与 `fit` link。 | 两条 Fit 的 **withdraw 是编辑建议，尚未执行生产撤回**；两条 developer-workflow Tool Capability 仅 contextual/HOLD 线索，不保留可写字段候选，不发布。 |
| CL-05 Voice | 两条 Task Capability `reviewed`；ElevenLabs/Descript 的本组 Tool Capability 与 Fit 均为 0，profile/source/claim/link 均为 0。 | 两条 Task rationale 是编辑候选；两工具 `conditional`/HOLD，尚未创建关系。权利、复合能力 availability、导出和同 owner 证据仍需独立审核。 |
| CL-06 Brand | 两条 Task Capability `reviewed`；Jasper/Grammarly/Claude 的本组 Tool Capability/Fit 与 link 均为 0。Jasper/Grammarly 无 profile；Claude 只有 1 个 `conflict` 旧 profile、3 个通用 source/16 个通用 claim。 | 两条 Task rationale 是编辑候选；Jasper/Grammarly `conditional`，Claude `contextual`/HOLD。Claude 旧事实及冲突 profile 不能证明品牌功能或替代新证据。 |

未发布关系的现有旧 link 只用于审计来源边界；没有把 `reviewed` 或候选 `QA_PASS` 写成上线。各组后续编辑应以当时官方资料重新核验，使用当前版本与精确行清单，经独立 QA、管理员单 Task 原子门禁后再生产回读。CL-04 的 withdraw 如获后续批准，需走独立受控处置，不能由 CL-07 代办。

## 3. 页面与 SEO 门禁

五个 `/cn/tasks/<slug>` 生产请求全部返回 **404**；robots.txt 与 sitemap.xml 返回 200，robots 有 canonical sitemap 指令，sitemap 为 **126 URL、0 Task URL**。`test:decision-task-page` 确认 Task Page 批准注册表为空，服务端资格失败关闭；页面即使未来获批，首版仍按独立门禁 `noindex, follow`，索引另案评审。本次 404 是关闭状态，**不是页面上线**。生产 SEO smoke 对现有核心页 canonical/hreflang、面包屑、noindex、重定向、robots/sitemap 均 PASS；未更改 URL、metadata、sitemap、`continue_index` 或工具索引。

## 4. DIFF-08 仍 blocked

[DIFF-08 启动门槛](./DECISION_GRAPH_DIFFERENTIATION_ONE_WEEK_PLAN_CN.md)要求同时达到：6 个 active Task **各至少 3 个**真实 published Fit；20 个目标工具的核心 Capability 覆盖率 ≥80%；所有 published Tool Capability/Fit 具备 current claim、`reviewed_at` 与 `review_due_at`；每个 Task 的 required/preferred 定义完整；Structured Comparison 不借生成式 AI 补事实仍可比较至少 3 个候选；公共读模型 unknown ≤20%；migration、RLS、规则、UI、SEO、TypeScript 与 build 门禁通过。

目前全图仅 7 条 Fit，五个本组 Task 的 Fit 分别为 **1/1/2/0/0**，其中只有 CL-02 的 1 条为 published；另有 meeting-notes 3 条 published。故 6 Task 各 3 条的硬条件明显未达。20 工具覆盖、unknown 比例和 Comparison 3 候选能力也尚无新的全量合格审计，不可推定达标。真实关系与证据缺口必须逐项补齐并独立验收，不能按数量填充或因 CL-07 完成而启动 DIFF-08。

## 5. 验证与后续

- CL-07 只读 verifier 与状态回归专项 PASS；Decision Task Page、SEO release、graph seed、evidence contract、Capability foundation/read-model/admin、review gate 相关测试 PASS。
- `pnpm exec tsc --noEmit` 与完整 `pnpm run build` PASS；build 从本地 `.env.local`/`.env.production` 读取所需配置，未打印 secret。仅有既有 Browserslist 数据过期提示。
- `node scripts/pub-03-readonly-run.mjs pnpm run seo:production-smoke` PASS；生产没有写入、部署或新发布。

下一阶段按各编辑包补直接官方证据及独立内容 QA。CL-03 优先补 Ray3.2 availability；CL-04 先审定 withdraw 处置；CL-05/06 先处理 profile、权利/品牌治理及同 owner claim/link 缺口。每组若获批准，再单独创建精确 manifest 和管理员事务，发布后回读目标与非目标行。Task Page 与 DIFF-08 分别走独立门禁。

### CL-04 后续撤回准备附记（2026-09-28）

CL-04 两条 `withdraw` 仍只是编辑结论。2026-09-27T23:41:55Z 生产只读回读确认目标 Fit 均仍为 `reviewed`，两条 Task Capability 与两条 Tool Capability 均仍为 `reviewed`，n8n/OpenRouter 在其他 Task 没有 Fit；生产写入 0。CL-01 原事务要求完整三类已发布关系，不能在保留 Capability 的前提下撤回这两条 reviewed Fit。专用 [CL-04 Fit-only 实施包](./DECISION_GRAPH_CL04_APP_BUILD_ELIGIBILITY_2026-09-27_CN.md#5-cl-04-fit-only-撤回实施附记2026-09-28)已完成本地事务回滚测试，但 migration/action 未部署，独立 QA reference 未填写；生产撤回尚未执行。此附记不改写上文 CL-07 的历史收口基线，也不启动页面或 DIFF-08。

### CL-04 生产撤回完成附记（2026-09-28）

更新：2026-09-28T00:35:17.31865Z，reviewer `2b8177ac-70b3-4475-a1ee-509ff8b4b622` 已将 n8n Fit `692f9115-2d1d-487b-b02b-392fa55d2d34` 与 OpenRouter Fit `bb6bb5aa-df5e-4113-bb76-8d4910911b28` 从 `reviewed` 原子撤回为 `stale`。结果为 `fitUpdates=2/taskCapabilityUpdates=0/toolCapabilityUpdates=0`；旧 evidence links 保留，`otherFits` 为空。自动 verifier 00:35:26Z 与总控独立 verifier 00:37:59Z 均通过（只读验证，`productionWrites=0`）。Task Page `/cn/tasks/build-app-with-ai` 仍为 404，sitemap Task URL 为 0。这里的零写入是 verifier 的写入计数，不代表 Fit 撤回没有执行。上方 CL-07 审计表与 23:41:55Z 准备附记均保留其历史时点；当前 CL-04 为**完成/已受控撤回**，两条 Tool Capability 仍 `reviewed`。DIFF-08 仍 **blocked**。

### CL-03 专项补查附记（2026-09-27）

本节是上述 13:07:48Z 生产基线之后的 **CL-03 编辑证据增量**，不改写该时点五组审计数。Luma 官方 [App 页](https://lumalabs.ai/app) 的 “Try Ray3.2” 直接连到 `app.lumalabs.ai`；[Ray 产品页](https://lumalabs.ai/ray)把 “Try in Luma” 与 “Build with API”分成两个入口；[定价页](https://lumalabs.ai/pricing)在 Ray3.2 的图片转视频行列出 Draft SDR 5/10 秒 credit 费率。这些来源证明公开 App 入口与计费表，不给出 Ray3.2 的 Plus/Pro/Ultra/免费试用逐档权限，不能把 `availability` 改为 `all_plans` 或 `paid_only`。详见 [CL-03 编辑包专项表](./DECISION_GRAPH_CL03_LUMA_EDITORIAL_PACKET_2026-09-25_CN.md)和 [operator candidate](./DECISION_GRAPH_CL03_LUMA_OPERATOR_CANDIDATE_2026-09-25_CN.json)。新增两条本地 intake 候选待独立 QA；CL-03 专用只读 verifier 于 13:44:25Z 确认生产仍为 reviewed/unknown、4 source/2 claim/2 旧 link、Task Page 404。运行方式为 `node scripts/pub-03-readonly-run.mjs pnpm exec tsx scripts/verify-decision-cl03-luma-readonly.ts`。同日 CL-03/CL-07 候选回归、Decision evidence/review gate、tsc 与完整 build 均通过；无 source/claim/link 写入、manifest、发布或页面/索引改动。
