# CL-04 · `build-app-with-ai` 资格审查与字段候选包

状态：**本地资格审查完成；n8n 与 OpenRouter 在当前 Task 下的 Fit 结论均为 `withdraw`；生产关系 HOLD、未发布**（2026-09-27）。2026-09-28 已另备精确 Fit 撤回 manifest 与本地事务实现，生产仍为 `reviewed`，未写入。本文的资格结论不代替独立 QA 或管理员批准。

## 1. 判断口径与生产只读基线

`build-app-with-ai` 现有 `constraint_schema.output=application`，并要求代码及集成审核。`ai-assisted-app-development` 的定义是生成或修改应用代码，且为 required；`developer-workflow-integration` 仅连接开发工作与工具/服务/自动化，为 preferred。因此 Task 的交付物应是**可运行应用或可部署的应用代码**；工作流、Webhook、模型调用、API 路由可以是组成部分，单独不能满足 required 能力。Task 定义需编辑修订以消除“接入基础设施即完成应用”的歧义，但不应改成“构建工作流或接入模型”来迁就既有工具。结论词仅使用 `publishable` / `conditional` / `contextual` / `withdraw`。

两条 `withdraw` 是依据上述 Task 定义与官方产品范围作出的**编辑资格推断**，不是官方对竞品适配性的声明，也不是对产品全部功能的否定。

2026-09-27T08:56:38Z 运行 `scripts/verify-decision-cl04-app-build-readonly.ts`，Neon 使用 `BEGIN READ ONLY`，Supabase 只执行 select，生产写入 0。精确范围如下：

| 实体 | 生产 ID / 当前状态 | 审查发现 |
| --- | --- | --- |
| Task | `10ffdf04-6885-4a28-949d-0723038c6954` / active | 描述笼统；output 已明确为 application。 |
| required Task Capability | `460f946b-9cfb-48fc-8cc5-28328e1b396e` / reviewed | `ai-assisted-app-development`，理由仅为“请求的输出是应用”。 |
| preferred Task Capability | `136ae3d3-9468-4445-a01d-8f2aaef53b97` / reviewed | `developer-workflow-integration`，理由仅为“实现必须适配交付工作流”。 |
| n8n | Neon `23bb3601-a5ac-42c3-bff3-64b06a063959` / published；profile `78427cbc-30df-43f4-99f1-ecbc2ae76c10` / ready | Tool Capability `4ebad72c-d03e-4a54-9a2c-f5024f7da9ac` reviewed/partial/unknown；Fit `692f9115-2d1d-487b-b02b-392fa55d2d34` reviewed/strong。 |
| OpenRouter | Neon `f77fb817-e8dc-4c22-b7cd-8edc2e5b0a5e` / published；profile `2c4881f1-edf8-4b6a-9280-0ab88a006057` / ready | Tool Capability `ac4c1009-feaf-4544-bbaf-086e56089bdc` reviewed/partial/unknown；Fit `bb6bb5aa-df5e-4113-bb76-8d4910911b28` reviewed/conditional。 |

两条 Tool Capability 的 `plan_requirement={}`、`limitations=[]`；两条 Fit 的理由都只是“关联 claim 经编辑映射”，`required_conditions=[]`、`disqualifiers=[]`。两工具各自只有一条旧首页 `one_line_positioning` claim 同时作为 Tool `support` 和 Fit `fit`：n8n claim `806bedca-c1e4-4fd1-ae57-e4db06567e47`，OpenRouter claim `76cf5413-ce8c-424d-9a6b-21584758cf72`。缺 `availability/plan/limitation` 和 Fit `limitation` 的直接证据目的；旧 claim `source_id=null`、`verified_by=null`，不能凭 verified 状态推断适合此 Task。两 profile 的复查日均为 2026-10-05；后续使用前须重新核对当前来源及 owner。上述 ID/时间仅作候选版本锚，不授权按旧快照写入。

## 2. 逐工具资格结论与官方证据

| 工具 | 此 Task 的资格结论 | 直接证据与边界 |
| --- | --- | --- |
| n8n | **`withdraw`**（现有 Fit） | [n8n 文档](https://docs.n8n.io/)把产品定义为工作流自动化；[Webhook 文档](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/)允许接收请求并返回工作流结果，可充当 API 端点；[官方 AI Workflow Builder 指南](https://blog.n8n.io/ai-workflow-builder-best-practices/)明确产物是工作流，且参数与凭据需人工补全。这些支持应用内部的自动化集成，不能证明它生成或托管完整应用。 |
| OpenRouter | **`withdraw`**（现有 Fit） | [Quickstart](https://openrouter.ai/docs/quickstart)提供统一模型 API、SDK 与 Agent SDK；[官方 Chat App 教程](https://openrouter.ai/docs/cookbook/get-started/quickstart)让开发者自行创建 Node 项目、编写会话循环并调用 SDK。它提供模型访问，不负责应用代码交付、前端、持久化或应用托管。教程标题中的“Build a Chat App”不能作为 OpenRouter 独立 app builder 的证据。 |

边界与成本： [n8n 当前定价](https://n8n.io/pricing/)按 workflow executions 计费，Cloud Starter/Pro 由 n8n 托管，Business 为自托管，Enterprise 可选择 Cloud/自托管；AI credits、并发、试用配额随档位不同。[官方自托管文档](https://github.com/n8n-io/n8n-docs/blob/main/docs/deploy/host-n8n/README.md)说明 Community/Business/Enterprise 安装与实例管理；自托管 n8n 实例不等于代管用户应用。具体外部服务费用与嵌入/OEM 授权须按所选用法单独核验。 [OpenRouter 定价](https://openrouter.ai/pricing)显示免费档可用 API 但限免费模型与请求配额，付费档按模型/平台计费；[官方限流说明](https://openrouter.zendesk.com/hc/en-us/articles/39501163636379-OpenRouter-Rate-Limits-What-You-Need-to-Know)还提示上游 provider 限流；[BYOK 文档](https://openrouter.ai/docs/guides/overview/auth/byok)说明自带 provider key 的费用与回退规则。开发者须自行负责应用运行与部署，模型/provider 选择、费用、速率及数据边界需按账号核对。本文不固化易变金额，也不把任一平台的服务托管表述成用户应用托管。

## 3. 字段级候选（均未写生产）

| 既有行与字段 | 编辑候选 | 依据/发布处置 |
| --- | --- | --- |
| Task `description.en` | `Build a runnable application or deployable app code with AI assistance; review the implementation, integrations, and application hosting before delivery.` | 明确应用交付物与责任。 |
| Task `description.cn` | `借助 AI 构建可运行应用或可部署的应用代码，并在交付前审核实现、集成和应用托管。` | 同上。 |
| Task `constraint_schema` | 保持 `output=application`、`requiresCodeReview=true`、`requiresIntegrationReview=true` | 不降格为 workflow/model integration。 |
| Task → `ai-assisted-app-development` `importance` | 保持 `required` | 无应用代码或等效可运行应用即不满足 Task。 |
| 同上 `rationale.en` / `.cn` | `The user needs a runnable application or deployable app code, with AI-generated or modified implementation reviewed before delivery.` / `用户需要可运行应用或可部署的应用代码，交付前须审核 AI 生成或修改的实现。` | 理由指向可判断的用户交付物。 |
| Task → `developer-workflow-integration` `importance` | 保持 `preferred` | 集成可改善交付流程，但不能代替 required 能力。 |
| 同上 `rationale.en` / `.cn` | `When the app depends on external services or automation, the team should connect and test those integrations in its development and deployment workflow.` / `应用依赖外部服务或自动化时，团队应在开发和部署流程中接入并测试这些集成。` | 明确依赖情形，不把集成当作应用。 |
| 两条 Task Capability `status` | 保持 `reviewed` | 文案须独立编辑 QA，未获发布批准。 |
| n8n → `developer-workflow-integration` Tool Capability | **`contextual` / HOLD**；`support_level`、`availability`、`plan_requirement`、`limitations` 均不提出写入值 | 工作流与 Webhook 只能作为应用集成线索；Cloud、自托管、执行额度、AI credits 与授权边界尚不能映射为本关系的字段证据。 |
| OpenRouter → `developer-workflow-integration` Tool Capability | **`contextual` / HOLD**；`support_level`、`availability`、`plan_requirement`、`limitations` 均不提出写入值 | 模型 API 接入只能作为应用集成线索；模型/provider、额度、BYOK 与数据边界尚不能映射为本关系的字段证据。 |
| n8n Fit `fit_level` / `status` | 建议从待发布候选撤出；当前 `reviewed` 不动 | 原 `strong` 与完整 app Task 冲突；不制作 publish manifest。若日后另案处理 status/`not_fit`，须按 CL-01 门禁审定，不能把 `not_fit` 当推荐。 |
| OpenRouter Fit `fit_level` / `status` | 建议从待发布候选撤出；当前 `reviewed` 不动 | 原 `conditional` 也不能弥补 required app 能力。 |
| 两条 Fit `rationale` / `required_conditions` / `disqualifiers` | 不为当前 Task 填充可发布字段；保持原 reviewed 数据直到独立编辑处置 | 给已判 `withdraw` 的 Fit 编写“看似充分”的条件会重新引入误推荐。若未来另有适配的集成 Task，必须单独审定，不在 CL-04 创建。 |

`contextual` 是编辑资格判断，不是 Tool Capability 数据库枚举或可写字段值。上述研究线索只说明两工具可作为**应用开发中的集成组件**，并不使任一 Tool Task Fit 在本 Task 重新取得资格。当前两条 Tool Capability 保持 reviewed/HOLD；若将来拟发布其通用能力，必须先建立当前官方、同 owner、verified 的 `support/availability/plan/limitation` claim links，独立 QA 后再走管理员门禁。现有两条 Fit 的旧 `fit` link 不得沿用作完整应用适配证据。

## 4. HOLD 与后续门禁

- **本轮明确建议：** 两条现有 `build-app-with-ai` Fit 均 `withdraw`，从 CL-04 发布候选清单排除；两条 Tool Capability 仅保留 `contextual`/HOLD 研究线索，不保留可写字段候选；Task 定义与两条 Task rationale 仍为修订候选。所有生产关系保持 reviewed，Task Page 继续 404，sitemap 不增加 Task URL。
- **证据差额：** 当前 Tool 每条仅 `support` 首页 claim，Fit 每条仅 `fit` 首页 claim；缺直接功能、可用性、套餐及限制 claim/link。不可刷新旧 claim 日期来补差。正式编辑动作前须读取最新版本、复查官方页面、确认 reviewer 与 owner，独立内容/技术 QA 后才可考虑字段写入或撤回操作。
- **只读验证：** `pnpm exec tsx scripts/verify-decision-cl04-app-build-readonly.ts` 输出精确 Task/Capability/Tool/Fit、source/claim/link 与版本；对身份、数量、reviewed 状态、owner/domain、旧 link 进行断言。该脚本不调用 mutation 或发布 RPC。
- **页面回读：** 2026-09-27 只读请求确认生产 `/cn/tasks/build-app-with-ai` 为 404，sitemap 中该 Task URL 为 0；这是当前门禁观察，不构成页面批准。
- **回滚边界：** 本轮无生产写入，无需数据回滚。若未来独立批次误发布，使用 CL-01 单 Task 精确清单撤回并只读回查目标及非目标行；不能通过 Task Page 或索引改动掩盖关系错误。

`CL-05/06`、成熟工具发布、索引或页面上线均不属于本包。

## 5. CL-04 Fit-only 撤回实施附记（2026-09-28）

**DEV_BLOCKED / 生产写入 0。** 2026-09-27T23:41:55Z 再次以只读包装器回读生产：Task、两条 Task Capability、两条 Tool Capability 和两条 Fit 的身份、状态、`updated_at` 与原包一致。两条 Fit 仍为 `reviewed`（n8n `strong`、OpenRouter `conditional`）；各自的旧首页 claim `fit` link 保留。两条 Tool Capability 仍为 `reviewed/partial/unknown`，各自仅有旧首页 `support` link。同两工具在其他 Task 的 Fit 为 0。生产没有新增 source/claim/link 或关系。GET 复查 `/cn/tasks/build-app-with-ai` 为 404，sitemap 中 `/tasks/` URL 为 0。

现有 CL-01 `decision_cluster_transition` 的撤回只接受三类非空清单且要求均为 `published`；用于本组会触及无撤回决定的 Capability，不能调用。新增 [Fit-only 事务](../db/supabase/migrations/20260928_decision_cl04_fit_withdrawal.sql) 与管理员 action `transitionCl04Fits`，仅接受两个固定 Fit ID、对应工具 ID、`reviewed` 状态及精确版本，单事务置为 `stale`。原 Fit 行、`fit_level`、旧 claim link 与 editorial history 保留；两工具各写一条内部 timeline 审计。预演返回 0 更新；提交若任一行、版本或触发器失败则整体回滚。成对 `restore` 仅回到 `reviewed`/HOLD，须另有 QA reference，不代表重新取得发布资格。

[精确撤回 manifest](./DECISION_GRAPH_CL04_FIT_WITHDRAWAL_MANIFEST_2026-09-28_CN.json)记录当前生产版本，`qaReference` 留空以避免伪造独立 QA。管理员须在独立 QA 确认后复读最新版本，填写真实报告引用，在部署事务函数和 action 后先调用 `preflight=true`，核对返回的两个 Fit ID、0 Capability 更新，再以相同 manifest 调用 `preflight=false`。若版本变化，停止并重审。生产写入后运行 `node scripts/pub-03-readonly-run.mjs pnpm exec tsx scripts/verify-decision-cl04-app-build-readonly.ts --after-withdrawal`，核对目标 Fit 为 `stale`、Capability 与非目标 Fit 不变、旧 link 仍在，并复查 Task Page 404、sitemap Task URL 0。

本地 `psql postgres -f scripts/test-decision-cl04-fit-transition-local.sql` 在空 public schema 的事务内通过权限、预演、错误版本、强制第二行失败的整体回滚、Fit-only 提交、审计及成对恢复，并最终 `ROLLBACK`。新 migration/action 尚未部署；本任务明确不 push、不部署，因此不能在生产运行新管理员通道，也不能改用手工 SQL 绕过。待独立 QA 与后续部署批准后执行。
