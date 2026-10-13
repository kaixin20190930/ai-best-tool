# AI Best Tool 自动运营 V2 全面执行方案

生效日期：2026-10-12

状态：执行中

上位战略：[Evidence-backed AI Tool Decision Platform 执行基线](./EVIDENCE_BACKED_DECISION_PLATFORM_EXECUTION_2026-10-12_CN.md)

## 1. 本次修正解决什么

当前系统已经具备 `collection_candidates → draft tool → Admin 编辑 → published + monitor/noindex` 的通用数据路径，但实际自动运营仍大量采用“每个工具单独建立 release JSON、guard、专项测试和 Git 提交”的项目制路径。仓库已有约 42 个候选/发布数据文件和 32 个专项发布脚本。这种方式适合历史脏数据、复杂别名、重定向、受保护旧行或高风险边界，不适合成熟工具日常收录。

本方案完成三个修正：

1. 成熟高需求工具进入 `monitor/noindex` 不再等待固定观察期或完整独立采用研究。
2. 日常收录默认走数据库和 Admin 通用路径，不再为每个工具改运行时代码。
3. 把 Catalog、Freshness、Decision Cluster、Market Feedback 转为一个有日期、产能、完成定义和失败边界的统一执行表。

## 2. 发布数量与对象

- 当前正式目标：正常运营日**至少发布 1 个、最多 2 个**成熟工具。
- 第 2 个工具只有在同样通过实体门禁，且能填补当前或下一 Decision Cluster 的明确角色时才发布。
- 没有合格对象时不制造页面；当日必须推进一个具体证据缺口，使候选更接近 READY。
- Freshness 独立运行，每日处理 5-10 条低风险变化 Claim，不占新工具名额。
- 每周交付至少 2 个用户可见 Decision 单元。

公开不等于索引。新工具默认 `published + monitor/noindex`，索引和 sitemap 继续独立审批。

## 3. 成熟高需求快车道

### 允许直接进入 monitor/noindex

满足以下实体级条件即可发布，不再要求先完成完整项目制审批：

- 产品身份、官方域名和唯一 canonical 清楚。
- 不是重复实体、模型名、单一功能表面或传统产品的轻量 AI 标签。
- 核心 AI 能力由官方来源直接支持。
- 至少两个互补官方来源覆盖产品范围和关键限制。
- 三语言基础页面完整，包含 Best for、Not ideal、限制、比较路径和核验日期。
- 素材非占位、来源或站内所有权清楚。
- 页面没有精确但无法证明的价格、额度、隐私、商用或账户权益断言。
- 明确 Cluster 角色和维护周期。

高流量、品牌成熟度和持续运营信号用于提高队列优先级，不代替上述实体真实性门禁。

### 不再阻塞整个页面的事项

以下不确定性只 HOLD 对应 Claim：

- 实时结账价、地区税费和促销。
- 免费账户、付费账户或企业账户的精确额度。
- 商用、导出、删除、训练、隐私和账户级权益。
- 未完成本站 hands-on 或真实账户核验。

公开页面省略精确值或标记 `conditional / unknown / not tested`，并给出来源和复查日。它们不会阻止成熟工具进入 monitor/noindex，也不会自动获得推荐强度或索引资格。

### 仍需高风险流程

只有以下情形使用工具专属 release 脚本、完整 rollback 和专项代码：

- 重复实体合并、别名或 301/308 重定向。
- 修改 canonical、index、sitemap 或 URL 架构。
- 历史行保护、跨库身份迁移或数据前像复杂。
- 素材法律、安全、支付、RLS 或基础数据库迁移。
- 通用发布器无法表达的新数据结构。

## 4. 默认无代码收录路径

日常成熟工具应使用以下单一事实流：

1. `collection_candidates` 接收候选、官方 URL、Cluster 角色和需求信号。
2. 通用 enrich/score 只做发现和缺口标记，不自动生成已核验事实。
3. 研究包写入官方来源、实体结论、Decision 信息、Workflow Impact、Evidence Type 和 Claim 边界。
4. `importCollectionCandidateToDraft` 创建或更新 draft 工具。
5. Admin Tool Editor 完成三语言、媒体、市场与证据字段。
6. 通用实体 preflight 检查重复身份、canonical、官方来源、媒体和页面完整度。
7. Admin 通用发布动作将 draft 变为 `published + monitor/noindex`。
8. 通用 postcheck 回读唯一实体、三语言页面、robots、canonical 和 sitemap 排除。
9. Tool Capability、Fit、Task Page 和 index 分别进入后续独立管线，不能与工具公开捆绑。

代码只维护“通用发布系统”，不再为普通工具建立同名 guard/test/release 文件。候选事实、证据和状态保存在数据库；Git 只记录 schema、通用逻辑、政策和审计摘要。

## 5. 当前实现差距

| 能力 | 当前状态 | V2 动作 |
| --- | --- | --- |
| 候选采集、评分、enrich | 已有 | 保留，增加 Cluster 与 demand priority 输入 |
| 候选导入 draft | 已有 | 保留，修正三语言和 verified/unknown 语义 |
| Admin 编辑和 monitor 发布 | 已有 | 保留，统一实体级门禁与批量发布后像 |
| 市场验证 | 已有但过度阻塞 | 从实体硬门槛改为优先级/推荐强度信号；成熟高需求工具不因缺完整独立研究而阻塞 monitor/noindex |
| Workflow Impact / Evidence Type | 数据与 UI 不完整 | 补充通用字段、编辑器和工具页展示 |
| 通用 duplicate/canonical preflight | 分散在专项脚本 | 合并为通用只读检查 |
| 通用 rollback/postcheck | 分散在专项脚本 | 建立单一发布事务、审计和幂等回读 |
| 自动化调用 Admin 数据路径 | 未完整接通 | 增加受控服务端命令；复用 Admin action 规则，不绕过门禁 |
| 每工具专项文件 | 过多 | 仅保留历史审计；新普通工具禁止新增 |

## 6. 四周执行排期

### Week 1：2026-10-13 至 2026-10-19

目标：完成 Research Cluster 最小闭环，并让普通成熟工具默认走无代码路径。

**2026-10-13 进展**：`OPS2-01` 至 `OPS2-03` 的首个真实双工具闭环已完成。v0 与 SciSpace 均通过通用选择包入队、candidate→draft、独立市场验证、发布 preflight/rollback/commit/postcheck，最终为 `published + monitor/noindex`，未进入 sitemap。过程中修复了通用父品牌域与平台自有媒体契约、市场验证独立 QA/来源追溯、缺失 `mediaReview.needed` 的 SQL NULL 语义，以及 PostgreSQL `date` 的时区审计误差；这些修复适用于后续普通工具，不是工具专属发布脚本。当前生产共 84 个工具、65 个 published、17 个 continue_index、65 个 monitor，sitemap 仍为 126 条。Research relation 只读 preflight 已通过，但 rollback/commit 仍因缺少直接 `SUPABASE_DB_URL` 保持 HOLD，不影响 Catalog/Freshness。

- OPS2-01：统一成熟工具快车道的实体/Claim 门禁。
- OPS2-02：建立通用数据库发布 preflight、commit、postcheck 和审计记录。
- OPS2-03：自动化接入 candidate → draft → monitor/noindex，不为普通工具新增专项脚本。
- RES-01：发布 Gemini Notebook、Perplexity 已审核 Tool Capability/Fit。
- RES-02：上线 `research-with-citations` Task Page，保持 noindex。
- RES-03：补 Workflow Impact、Evidence Type 和 Finder 定向入口。
- Catalog：每天 1 个，具备第二个 READY 对象时最多 2 个。
- Freshness：每日 5-10 条低风险 Claim。
- 用户可见 Decision 单元：至少 2 个。

### Week 2：2026-10-20 至 2026-10-26

目标：让 Research Cluster 可以支持真实选择，而不只是展示数据。

- 完成 4-6 个角色互补候选的 Structured Comparison。
- 建立至少两项真实 Trial/hands-on 记录；需要登录或付费时请求用户授权。
- 打通 Task Page → Finder → comparison → Tool → outbound 的事件关联。
- 根据首周行为修正入口、候选顺序和 comparison 维度。
- 继续 Catalog 7-14 个、Freshness 25-50 条的周产能上限；只统计真正完成项。

### Week 3：2026-10-27 至 2026-11-02

目标：复制到 `build-app-with-ai`，验证模型可复用而非只适用于研究工具。

- 使用 Lovable、Replit、Bolt、v0/Bubble 中证据充足的 3-5 项。
- 重点比较交付物、代码所有权、托管、数据、集成和维护成本。
- 上线 noindex Task Page 与 Structured Comparison。
- 不因复制 Cluster 批量增加同义 URL。

### Week 4：2026-11-03 至 2026-11-09

目标：复制到 `brand-constrained-marketing-content` 并完成月度复盘。

- 使用 Jasper、Grammarly、Canva、Anyword、Writer 中证据充足的 3-5 项。
- 重点比较品牌规则、审批、视觉/文字协作、变体和团队治理。
- 上线 noindex Task Page 与 Structured Comparison。
- 按 GSC、漏斗、维护成本和真实选择反馈决定下一月产能。
- Decision Assistant 只有在三个 Cluster 数据和行为样本达到门槛后才能排期。

## 7. 明日执行单（2026-10-13）

**执行结果**：Catalog 两项均已完成受控发布。SciSpace 为 `research-with-citations` Alternative，市场验证 77；v0 为 `build-app-with-ai` Gap-filler，市场验证 81。两者公开与索引分离，当前均为 monitor/noindex。以下原执行单保留为当日审计基线，不再作为待办重复执行。

### 主任务：Research 关系发布

- 重新运行 Gemini Notebook 和 Perplexity 精确组只读 preflight。
- 独立 QA 只核 availability 差分、关系完整性和关键负向用例。
- 全部通过后发布 reviewed Tool Capability/Fit；不改 index、sitemap 或 Task Page。
- 发布后再运行 Task Page read model，形成 RES-02 的确定性输入。

### Catalog

- 主候选：**SciSpace**，`research-with-citations` Alternative。
- 采用成熟高需求快车道复核身份、官方能力、媒体、三语言和 Claim 边界；独立采用不足只降低推荐/索引强度，不再单独阻止 monitor/noindex。
- 次候选：**v0**，`build-app-with-ai` Gap-filler。只有 SciSpace 已完成且 v0 同样通过实体门禁时才发布；否则只完成候选包，不为达到两个制造页面。
- 两项均不得新增工具专属运行时代码；优先使用 collection candidate → draft → Admin 通用路径。

### Freshness 与 Market Feedback

- 运行全量 selector；只处理新增 `claim_due`，现有 merge/archive/redirect 项不自动执行。
- 读取最近 GSC/站内事件快照，记录数据截至日并用于下一候选排序。

## 8. 完成定义与报告

每日必须报告：

- 新工具实际发布数、名称、Cluster 角色和 monitor/index 状态。
- 未发布候选的唯一 blocker；不能只写“等待复核”。
- Freshness 实际变化数和零变化继承数。
- 本周用户可见 Decision 单元完成数。
- GSC/行为数据截至日和由此产生的队列变化。
- 是否新增了工具专属代码；普通工具新增专属代码视为流程回退，必须解释。
- 仅列需要用户授权的 index/sitemap、合并删除、基础迁移、付费和外部账户动作。

## 9. Review 结论

- 大流量成熟工具不需要时间型审批，但需要最小实体真实性和页面完整度门禁；否则会把品牌词流量换成重复、错误或薄内容页面。
- 当前最大的效率问题不是门槛过高，而是把数据运营误做成逐工具软件发布项目。
- 现有 Admin 和 collection 数据层可复用，V2 不需要重建系统；重点是接通通用事务、审计、Workflow Impact/Evidence Type 和自动化调用。
- Catalog 速度可以稳定在每天 1-2 个，同时保持 noindex 安全边界；Decision Cluster 与 Freshness 继续并行，不再二选一。

Review 通过。本方案从 2026-10-13 起作为自动运营的唯一实施排期；旧的逐工具专项发布文件只作为历史审计，不再定义默认流程。
