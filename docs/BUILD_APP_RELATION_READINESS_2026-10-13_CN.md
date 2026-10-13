# BUILD-APP-RELATION-READINESS-01：应用构建 Task 关系就绪审计

日期：2026-10-13（Asia/Shanghai）  
状态：开发研究完成，等待本单独立 QA；不构成生产关系发布或 Task Page 批准。  
范围：仓库内的 `build-app-with-ai` Task/Capability 契约、四工具版本化证据快照，以及 CL-04 历史关系审计。  
方法：R 级只读审计；未连接或写入生产数据库。

机器可读关系清单：[build-app-relation-readiness-2026-10-13.json](../data/decision-graph/build-app-relation-readiness-2026-10-13.json)。

## 一、结论

1. 可复用的 Task/Capability taxonomy 已存在，不需要新增近义 Capability：`ai-assisted-app-development` 是 required，`developer-workflow-integration` 是 preferred。Task 的目标是可运行应用或可部署应用代码，不是单独的工作流、模型 API 或连接器。
2. Bolt、Lovable、Replit、v0 各有六条版本化官方 Claim，覆盖 Git/源码交接、托管/部署、数据与后端可移植性、集成、费用/用量、维护责任；这些快照没有一条专门证明其核心 AI 应用生成/修改能力及该能力的可用范围。故它们不能单独支撑 required Tool Capability 或 Task Fit。
3. 四工具的 Guide 文案只是一项编辑产物，不是 Decision Graph 关系证据；本审计不将 Guide 中的 Best for、Not ideal 或比较判断映射到数据库字段。
4. 目前可安全复用的是限制、成本/计划边界、Git/部署和迁移边界等 Claim，作为未来 Tool Capability 的 `plan` / `limitation`、Fit 的 `limitation` 候选来源。它们不能代替 `support`、`availability` 或 Fit 的 `fit` 证据。
5. 当前基础发布包严格为每个工具 2 条关系：1 条 `ai-assisted-app-development` Tool Capability + 1 条对应 `build-app-with-ai` Fit。`developer-workflow-integration` 明确排除在本包之外；若未来有独立、可验证的需求，只能作为单独候选另案评估，不能把当前包上限扩成 3 条。现阶段四组均为 `HOLD_EVIDENCE`，不提交 Admin、不写生产。

## 二、证据边界与现状

四工具输入快照：

| 工具 | 权威快照 | 六维 Claim 状态 | 可以证明的范围 |
|---|---|---:|---|
| Bolt | [`build-app-bolt-lovable-evidence-2026-10-13.json`](../data/collection/build-app-bolt-lovable-evidence-2026-10-13.json) | 2 `verified_public`、4 `conditional` | GitHub 交接、Bolt Hosting/Netlify 路径、数据库选择边界、集成类别、核验日费用展示、安全检查责任边界。 |
| Lovable | 同上 | 2 `verified_public`、4 `conditional` | Git 提交/代码下载、Lovable Hosting、Cloud 数据导出与迁移边界、connector/API 类型、credits、应用安全责任边界。 |
| v0 | [`build-app-v0-replit-evidence-2026-10-13.json`](../data/collection/build-app-v0-replit-evidence-2026-10-13.json) | 3 `verified_public`、2 `conditional`、1 `unknown` | GitHub 分支/PR、Vercel 发布、数据库和 API 集成、费用展示、权限及客户运维边界；完整数据迁移为 `unknown`。 |
| Replit | 同上 | 2 `verified_public`、4 `conditional` | Git/version control、部署类型、特定数据库迁移路径、集成/Agent 计费、共享责任边界。 |

总计 24 条 Claim：9 `verified_public`、14 `conditional`、1 `unknown`。这些数量只描述快照中的六个非核心维度，不代表整个工具质量、Task Fit 或账户实测。`conditional` / `unknown` 不推导为工具不支持；也不能因产品公开页面存在就推导关系已发布。

### 已知关系事实与未知项

- Task 与两个 Capability slug/importance 可由仓库种子和 CL-04 审计确认：`ai-assisted-app-development`（required）、`developer-workflow-integration`（preferred）。CL-04 提出的双语 Task rationale 仍是候选修订，不是本轮修改或生产当前值确认。
- CL-04 最近明确记录的历史生产状态（2026-09-28）：n8n 与 OpenRouter 两条 Fit 已撤回为 `stale`；它们的两条 `developer-workflow-integration` Tool Capability 仍为 `reviewed`。该历史记录不能代替 2026-10-13 当前生产查询。
- 本仓库未提供四个目标工具的当前生产 Tool Capability/Fit 行、ID、`status`、`updated_at`、profile/claim/link 计数或其完整生产 preimage。因此，本审计不声称四工具当前关系数为零，也不声称历史生产状态仍未变化。
- 下一次若进入写入准备，第一步必须用只读方式回读 `build-app-with-ai`、两个 Task Capability、四个目标 tool ID、对应 profile/claims、Tool Capability/Fit 与全部 evidence links；如发现已存在行，按实际行做差分，禁止重复创建。

## 三、Task 与契约映射

`build-app-with-ai` 现有契约是输出 application，并要求实现及集成审核。required Capability 表示工具必须能直接生成或修改应用代码/应用，而不是只提供模型、workflow、hosting 或 API。preferred Capability 表示确有助于开发交付的工作流集成，不是 required 的替代品。

当前发布门禁（按仓库 Admin reviewed-group contract）：

| 关系 | 最少字段/证据目的 | 本批处理原则 |
|---|---|---|
| Tool Capability | `support_level`、`availability`、`plan_requirement`、`limitations`；同 owner、当前且 verified 的 Claim links 覆盖 `support`、`availability`、`plan`、`limitation` | 核心生成能力必须有直接官方 Claim；计划访问和限制单独核，不从公开价格或 Guide 推断。若无法证明 availability，保留 unknown/HOLD。 |
| Fit | `fit_level`、双语 `rationale`、`required_conditions`、`disqualifiers`；同 owner、当前 Claim links 覆盖 `fit`、`limitation` | Fit 必须说明实际 app 交付场景与不适配边界；不能从“功能存在”自动推导 strong。 |
| Task Capability | Task 与现有 taxonomy 的 required/preferred 关系及双语 rationale | 本审计不修改。先保留既有 required/preferred 结构；Task rationale 是否仍需修订由单独编辑 QA 决定。 |

数据库枚举/字段不接受本文中的 `HOLD_EVIDENCE` 或“候选”作为可写值。任何未来候选必须经过 Admin、独立 QA、精确 preimage 与既有事务门禁；不允许客户端直写或用 SQL 绕过。

## 四、逐工具关系就绪差分

下表只列“可复用证据”和“关系建议”。建议不是既有关系，不代表可写状态；每个工具的核心支持证据仍缺。

| 工具 | 可复用证据（仅快照事实） | Tool Capability 候选 | Fit 候选 | 关键缺口 / 当前结论 |
|---|---|---|---|---|
| Bolt | `source_git_handoff`、`hosting_deployment`、`data_backend_portability`、`integrations`、`cost_usage_boundaries`、`maintenance_operational_ownership`。迁移/计划与托管均有明确条件。 | 候选关联既有 `ai-assisted-app-development`；现有六维证据仅可补 plan/limitation。support、availability 尚无关系级证据。`developer-workflow-integration` 不默认新增。 | 只有补齐核心生成、输出/部署边界及适用对象后再拟合；当前不定 fit_level，不写条件或 disqualifiers。 | 缺直接核心生成功能 Claim、账户/计划 availability 适用范围，以及 Task 特定 fit Claim；`HOLD_EVIDENCE`。 |
| Lovable | 同六个 stableKey；Cloud 导出不含 Storage 文件、Edge Function 代码和 secrets，迁移需重配服务。 | 同上；Git/hosting/connector 可作为限制上下文，不可冒充 app generation 的 support。 | 同上；必须把实际生成 app 与 Cloud/hosting 依赖分别陈述。 | 缺直接核心生成功能 Claim、plan availability 与任务适配 Claim；`HOLD_EVIDENCE`。 |
| Replit | 同六个 stableKey；特定 PostgreSQL dump/restore 仅覆盖特定迁移情形，不代表全平台资源可迁出。 | 同上；不能因 Agent、部署类型或数据库工具就预设 `strong`。 | 同上；需证实 Replit Agent 输出满足 Task 的 runnable/deployable application，而不是仅代码辅助。 | 缺当前 Agent/app-building 核心 Claim、适用账号/计划 availability、Task 特定 Fit Claim；迁移边界必须保留；`HOLD_EVIDENCE`。 |
| v0 | 同六个 stableKey；GitHub/Vercel 路径明确；数据/后端迁移为 `unknown`，不得推断支持或锁定。 | 同上；Vercel deployment 可补部署限制，不能单独支持核心能力。未知迁移只能进入 limitation，不可改写成已支持。 | 同上；需界定 UI/前端生成与完整应用交付的边界后再拟合。 | 缺直接核心生成/交付边界 Claim、availability 及 Fit Claim；迁移 Claim 保持 `unknown`；`HOLD_EVIDENCE`。 |

## 五、最小未来发布包

**阶段 0：先做生产只读 inventory（必要的下一步）。** 对四个工具一次性读取目标 Task、两条 Task Capability、工具 ID/slug、profile、现有 Tool Capability/Fit、source/claim 状态和 links，并保留每条目标行的 `id/status/updated_at`。若 inventory 与 CL-04 或本审计的已知历史不一致，以新鲜生产回读为准，先记录差分，不写入。

**阶段 1：补最小 Claim，不重做六维全审。** 每工具只补当前缺失字段：

1. 一条或多条官方核心能力 Claim：明确产品身份、用户输入、AI 生成/修改的具体应用产物，以及能否运行/部署；限定官方描述与实际可操作范围。
2. 一条 availability/plan Claim：适用产品面、套餐/账号限制和不确定项；公开资料不能证实时保留 `unknown`，禁止虚构账户级结论。
3. 复用现有六维快照中仍 current 的 Claim，按 source hash/review due 检查；分别用于 `plan`、Tool Capability `limitation` 或 Fit `limitation`。过期或来源变化才补核，不全量重审无关稳定事实。
4. 一条明确 Task 情境的 Fit Claim/编辑理由，说明从想法到可运行/可部署 app 的目标、必要人工审核/接入/部署条件和排除情形。该项不得以 Guide 句子作为来源。

**阶段 2：当前基础包固定两条关系草案。** 每工具仅准备 1 条 `ai-assisted-app-development` Tool Capability + 1 条 `build-app-with-ai` Fit；`developer-workflow-integration` 不属于当前基础包，也不计入当前包的发布上限。未来如有独立用户需求和直接证据，可另开候选与 QA，不得在本交付中追加第三条关系；不因 Task 存在 preferred Capability 就要求每工具建立该关系。

**阶段 3：逐工具 QA 与发布门禁。** 同 owner/verified/current、Purpose 完整、`support_level`/`availability` 非 unknown、限制与计划条件真实、Fit rationale 双语且不过度、负向条件可读、无重复行；随后用 Admin 单 Task closure 做 read-only preflight。仅当四工具均完成差分和独立 QA 后，才评估是否达到 Task Page 至少 3 条 current published Fit 的门槛。该门槛只允许另行申请 Task Page noindex 评审，不自动建页或进 sitemap。

不需要先新增 Capability taxonomy、改 Task output、创建 Comparison、增加新 Guide/公开内容或运行数据库 SQL。生产写入、关系发布和页面开放均是后续独立授权边界。

## 六、验证与交接

- 本轮只验证源文件/JSON 的字段结构、计数与文档引用；不运行 TypeScript、build、数据库或生产检查。
- 本文和 JSON 不包含可执行 SQL、写入 manifest 或拟造的生产 UUID。
- 独立 QA 请重点检查：Task 必需/偏好关系和 CL-04 契约是否准确；24 条 Claim 统计；`support/availability/plan/limitation/fit` 的证据用途是否区分；Guide 不被当作关系证据；四工具生产关系状态明确标记为“当前未知，须 inventory”；未来包是否保持最小范围。
- QA 前后均不触碰 `db/supabase/manual/20261003_perplexity_plans_claim_correction.sql` 和 `db/supabase/migrations/20261005_admin_gemini_fit_rationale_recovery.sql`；本轮不提交、不推送、不部署。

## 精确下一步

将本文与 JSON 交给独立 QA，仅审上述差分和文档一致性。QA PASS 后，下一交付单元应为 `BUILD-APP-RELATION-PRODUCTION-INVENTORY-01`：一次只读生产 inventory，确认四工具现有行和 Claim/link 版本；之后再按工具逐个补核心证据与候选关系，不能直接批量发布。
