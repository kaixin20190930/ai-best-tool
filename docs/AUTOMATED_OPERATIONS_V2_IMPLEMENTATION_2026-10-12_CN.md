# AI Best Tool 自动运营 V2 全面执行方案

生效日期：2026-10-12

状态：执行中

上位战略：[Evidence-backed AI Tool Decision Platform 执行基线](./EVIDENCE_BACKED_DECISION_PLATFORM_EXECUTION_2026-10-12_CN.md)

当前产品与 SEO 架构：[AI Best Tool SEO 产品架构 V3](./SEO_PRODUCT_ARCHITECTURE_V3_2026-10-26_CN.md)。页面职责、Cluster 排期、关键词优先级、证据等级和流程预算以 V3 为准。

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
- OPS2 新候选 selection 必须显式填写 `entityProfile`：`entityKind`、`canonicalProductKey`、可选的 `parentProductKey`、路由，以及四项可回溯的独立实体信号（官方独立身份、用户入口/工作流、产品生命周期、独立搜索/决策意图）。只有独立 `product/platform/service/framework/template/skill` 且四项均有官方证据，才可路由 `new_tool` 并入队。`model/version/feature/api_surface/brand_variant` 必须绑定父产品键，走 `existing_tool_update` 或 `hold`；不因单独名称、网址或热度生成 Tool。缺画像或证据的未来 enqueue fail closed，历史已落地 selection 仍可读取和回验。画像保存在 candidate `raw_payload`，不新增表或专属发布器。
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

普通成熟工具从入队到 draft 是 **Catalog internal preparation**：只需真实管理员 reviewer、精确选择包/候选前像、rollback hash 和绑定对象的一次性内部授权；内部审计标记 `internal_preparation`，不冒称 QA。两个准备动作在同一端到端交付单元内自动完成，不建立阶段 SHA、阶段 QA 或阶段用户回传。工具最终公开前才做一次独立 QA，然后通过原 `published + monitor/noindex` 门禁。单独的 market validation、关系发布、索引与 sitemap 仍按原独立审核/Owner 权限执行，不能使用内部授权。一个日报和一个最终审计记录本单实际结果；旧 QA 审计不迁移。

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

## 9A. 流量优先的收录与页面资产规则（2026-10-17 生效）

### 目标修正

工具“可以安全公开”只代表通过实体门禁，不代表值得优先投入，也不代表能够获得 Google 点击。自动运营必须同时优化用户决策价值和可验证流量机会，不再以每日新增数量代替增长结果。

候选选择顺序统一为：

`已有搜索机会 → Decision Cluster 缺口 → 决策意图 → 证据成熟度 → 维护成本`

流量、品牌知名度和趋势只能提高优先级，不能绕过身份、重复意图、核心能力、素材权利或明显误导等实体硬门槛。

### 候选机会评分

每个新候选在进入当周执行队列前形成一份轻量机会记录，满分 100，风险可额外扣 0-20 分：

| 维度 | 分值 | 最少记录内容 |
| --- | ---: | --- |
| 搜索需求 | 30 | 品牌、pricing、review、alternatives、vs、best-for 查询信号；没有可靠数据时标记 unavailable，不猜测搜索量 |
| 决策意图 | 25 | 用户是否存在价格、能力、权利、工作流或适用场景的真实选择困难 |
| Cluster 杠杆 | 20 | 是否补齐 Anchor / Alternative / Gap-filler，能否被 Task、Comparison 或 Finder 消费 |
| 证据成熟度 | 15 | 官方身份、互补来源、三语言、媒体和 Claim 边界是否可在一个交付单元完成 |
| 时效机会 | 10 | 新发布、显著升级、需求增长或竞争结果薄弱 |
| 风险扣分 | 0 至 -20 | 重复意图、身份不稳、法律/安全、事实高波动或高维护成本 |

- `>=75`：进入本周快速队列；通过实体门禁后可发布为 `published + monitor/noindex`。
- `60-74`：进入缓冲池，只补一个最高价值缺口，不占正常发布槽。
- `<60`：不投入当周产能。
- 实体硬风险优先于分数；高分不能覆盖 `HOLD_ENTITY / MERGE / REJECT`。

现有 `relevance_score >= 50`、`quality_score >= 80` 继续作为 draft 数据完整度门槛，不作为最终选品排序。市场验证不足可以限制推荐和索引，但不因账户级可变 Claim 未知而阻止成熟实体进入 monitor/noindex。

### 三个流量队列

1. **Harvest**：已有 GSC 曝光、排名或站内消费的页面。优先处理高曝光低 CTR、排名 5-30、查询与标题/落地页错配，以及已经出现 pricing/vs/alternatives 意图的页面。
2. **Expand**：围绕已验证 Task Cluster 补互补工具和决策维度。新工具必须声明 Cluster 角色、至少两个比较对象和一个下游消费位置。
3. **Discover**：新产品、新模型或新需求实验。只占少量产能，默认 monitor/noindex；没有可靠需求数据时不得冒称“高需求”。

自动选择优先级为 `Harvest > Expand > Discover`。Catalog 仍可每日发布 1 个、最多 2 个成熟工具，但第二个必须与当前 Cluster 或页面资产包共享真实决策价值，不能只是独立目录条目。

### 页面资产包

候选进入快速队列前，必须说明其最小资产包：

- 一个 Tool Intelligence 页面；
- 一个现有或计划中的 Task Cluster 角色；
- 至少两个真实比较对象；
- 一个 comparison path；
- 一个现有 Task Page、Structured Comparison、Finder 或高曝光页面的消费位置；
- 一组可在 GSC 或站内事件中观察的目标查询/行为。

这不是要求同日批量创建所有页面。工具公开、关系、Decision 页面与索引仍是独立管线；资产包只用于证明该工具不会成为孤立库存。禁止为每个候选创建专属代码、专属测试、同义 comparison URL 或内部规划型公开页面。

### 周产能组合

正常周按以下结果目标分配，不因某条线无合格对象而制造页面：

- Harvest：优化 5 个已有曝光或明确需求页面，约 30% 产能。
- Catalog：发布 5-7 个通过门禁的成熟工具，约 30% 产能。
- Decision：完成 2 个用户可见 Task/Comparison/Tool Intelligence 单元，约 30% 产能。
- Discover：推进 1-2 个趋势候选，约 10% 产能。
- Freshness 为必要维护工作，继续按变更/到期 Claim 增量执行，不以刷新日期制造工作。

Catalog 数量是上限和正常目标，不是牺牲质量的硬 KPI。若 Harvest 存在可立即改善的真实点击机会，应优先于发布一个没有下游消费位置的普通工具。

### 索引分层和 Owner 授权

- A 级：成熟、有明确品牌/决策需求、唯一意图且内容完整。一次最终 QA 同时给出公开结论和索引资格结论；发布当天即可进入 Owner 授权包，不强制等待固定观察期。
- B 级：实体成熟但只有一个明确的需求、内容、证据或技术缺口。保持 `published + monitor/noindex`，3-7 天内只修该缺口；修复后直接进入 A 级评审，不重复已通过门禁。
- C 级：身份、核心能力、素材、独立意图或页面价值不完整。保持 candidate/draft 或 noindex，进入合并、归档或内容重构，不为取得反馈而公开薄页面。

**2026-10-17 Owner 更新**：对已公开且真实通过全部 A 级硬门槛的工具，长期授权通用流水线每天最多批准 5 个、上海时区 ISO 周最多 25 个，无需逐工具重复询问。首次生产额度迁移和索引提交仍需同一交付单元独立 QA PASS；后续按相同通用门禁自主执行。额度是上限，不是 KPI；零合格则批准零项，不以品牌或质量分代替市场、证据、意图和 SEO 检查。GSC 快照超过 14 天、站点健康 blocked/unknown、policy paused 或任何硬门槛失败时继续 noindex。成熟高需求对象不强制等待观察期，普通对象仍须满足原观察门禁。

**2026-10-18 快速资格口径**：`measured_search_demand` 保持不变；成熟品牌可用 `brand_decision_signals`，要求 established 品牌、至少两种不同的受控决策意图（API、价格、对比、替代、评测、场景适配、集成或商用），及至少两个不同非官方域名的真实独立信号。信号类型限独立 benchmark、独立编辑/买方覆盖、公开采用/应用商店市场信号；不强制 API+价格、benchmark、两家媒体或三域名，但单纯品牌知名度、官方宣传、转载或仅上架不能通过。完整类型值、来源记录与不变的通用 A 级硬门槛见 [工具页索引政策](./TOOL_INDEX_RELEASE_POLICY_CN.md)。本修订不自动写生产数据或批准任何单页索引。

批准后，现有 `continue_index` 契约负责输出 index/robots 并进入现有 sitemap；不创建第二套 sitemap，也不向普通工具页调用 Google Indexing API。每次批次必须有精确前像、统一额度锁、事务 rollback、最终独立 QA、审批账本和幂等 postcheck。用户授权不能绕过公开证据与索引资格，也不能使 Google 保证收录。

Google 普通页面的发现和编入索引通常需要数天；自动化只能保证授权后立即输出 `index,follow`、唯一 canonical、sitemap 和可抓取内链，不能保证 Google 当天收录。禁止对普通工具页使用仅适用于招聘和直播页面的 Google Indexing API。

### 测量与停止规则

- 每周按页面和查询维度读取 GSC，区分 7 天与 28 天，记录数据截止日；站点汇总不能替代页面诊断。
- 有曝光、排名 5-20、CTR 低：优先调整标题、摘要和首屏决策答案，不创建同义页面。
- 排名 20-50 且曝光增长：补独特内容、证据和相关内链。
- 索引 28 天仍无曝光且无站内消费：停止追加内容，评估保持、合并意图或退回 noindex；删除/合并仍需 Owner 授权。
- 页面有站内消费但无搜索曝光：保留产品价值，重新评估查询和索引，不以“零需求”定性。
- 多页竞争同一查询：先做意图/canonical 审计，禁止继续增加同义 URL。

### 防止过度设计、开发和测试

- 本规则首先改变选择与排期，不新建评分微服务、工作流引擎或每工具脚本；现阶段用现有候选字段、GSC 快照、文档和通用发布器执行。
- 一个普通 Catalog 批次只有一份机会/证据快照、一个端到端开发槽、一次最终独立 QA、一份日报记录和一份最终审计。
- R 级选品和文案只验证来源、结构、重复意图与格式；不运行 TypeScript、build 或 production smoke。
- 只有运行时代码/路由变化才做专项测试和 TypeScript；只有渲染、构建或发布路径变化才做一次 build 和一次部署后 smoke。
- 已有 PASS 没有来源变化、到期、受影响代码变化或生产异常时不得重跑。
- 自动化不得为了实现本节而拆出 scoring service、dashboard、专属数据库表或连续 gate 任务；需要这些能力时，必须先用两周数据证明现有字段无法满足。
- 单项超过 60 分钟、同类流程连续失败两次或验证成本高于用户变化时立即缩小范围，并在日报中记录 `PROCESS_BUDGET_EXCEEDED`。

### V3 Cluster 执行补充（2026-10-26 生效）

- 一个真实决策问题和一个 canonical 主页面构成当周生产中心；工具是 Cluster 供给，不是孤立页面 KPI。
- 每个候选必须记录 `clusterRole`、至少两个 `comparisonTargets`、`downstreamConsumer`、`indexIntent` 和 Claim 级证据状态。没有下游消费位置的对象只进候选池。
- 页面、工具、测试和 QA 数量都不是完成标准；正常单元只有一份快照、一个端到端开发槽、一次最终独立 QA 和一份最终审计。
- E0 官方、E1 账户、E2 受控实测、E3 可复现基准属于单条 Claim；没有 E2/E3 时禁止把资料核验写成“真实测试”。
- 新主页面只从新鲜 GSC、站内行为或明确独立需求中产生。GSC unavailable 时允许维护和已批准差分，不允许凭计划数量扩张。
- 当前 Coding、Automation、DeepL 的页面职责、关键词和 12 周顺序以 [SEO 产品架构 V3](./SEO_PRODUCT_ARCHITECTURE_V3_2026-10-26_CN.md) 为唯一解释，不另建阶段任务、评分服务或 Dashboard。

## 9B. 免费与付费收录的商业化预留（暂不实施）

### 保留原则

当前阶段不扩建付费收录系统，但所有 Catalog、Decision、索引和排序设计必须为未来商业化保留清晰边界。免费与付费可以有不同的服务标准、交付时效、资料完整度和曝光权益，但不得有不同的事实真实性、安全、重复意图、canonical、法律或用户价值底线。

付款可以购买：

- 更快得到接受、拒绝或补件结论的审核 SLA；
- Vendor identity / Claim 所有权核验、资料整理和限定次数的更新服务；
- 明确标注为 Sponsored / Featured 的固定时间曝光；
- 发布后的透明交付报告，例如展示位置、站内点击和 outbound click；
- 合同约定的内容制作或研究服务，但必须与自然编辑结论分开。

付款不得购买：

- 自动通过、降低实体/Claim 门禁或删除真实限制；
- `continue_index`、sitemap、Google 收录或排名保证；
- 自然 Decision Ranking、Best、Editor's Pick、推荐强度或比较结论；
- 虚构用户评价、实测、市场采用、价格权益或独立证据；
- 未标注广告、永久前排、dofollow SEO 效果或流量/销售保证。

免费提交继续承担覆盖长尾、发现新产品和用户贡献的作用；付费提交承担确定时效、Vendor 服务和可测曝光。相同工具无论来源于自动抓取、普通用户、Vendor 或付费订单，最终实体身份只能有一个，必须查重并归入同一 canonical。

### 可借鉴但不照搬的市场模式

- Future Tools 保留免费人工提交，同时把 Featured、Banner 和 Newsletter Sponsorship 作为独立且明确标注的广告库存；其自然 Top 20、Review 和编辑推荐不出售。
- Futurepedia 将一次性加速发布、Verified/Enhanced Listing 与企业营销包分层，同时声明所有提交仍受编辑审批；拒绝时退款。
- Toolify 采用一次性付费快速上线和 Featured 曝光，适合目录流量销售，但其永久链接、快速上线和 SEO 价值承诺不适合直接成为本产品的 Evidence-backed 标准。

本产品只借鉴“免费入口 + 付费时效/服务 + 独立广告库存 + 清楚披露”的流程，不采用“付款即收录”“买自然排名”或“卖 Google 索引”。

### 未来产品结构

未来启用时，将商业产品简化为四类，避免当前小额 SKU 和 3/7/14 天组合过碎：

1. **Free Editorial Submission**：免费、best effort 队列，不承诺审核时间、收录、索引或曝光。
2. **Priority Editorial Review**：购买响应 SLA 和一次结构化补件机会，不购买通过；只有自动资格预检通过后才展示付款入口。
3. **Verified Vendor Profile**：仅表示 Vendor 身份/域名/Claim 管理权已核验，包含约定次数的资料更新；不得解释为产品质量背书。
4. **Sponsored Launch / Featured Window**：独立广告位，固定周期、明确 Sponsored 标签、与自然排序和 Decision Card 分离，并提供可验证的交付报告。

Claim、Update、Sponsored 和自然 Listing 使用同一个 Tool ID，但商业订单、广告窗口和编辑证据分别记录；广告到期只撤下付费展示，不删除自然工具页或改变自然评价。

### 暂定价格架构，仅供未来验证

当前自然流量和 qualified outbound click 尚不足以支持高价流量承诺，因此价格先按人工交付成本和可验证服务设计，不按竞品流量报价照抄：

| 产品 | Beta 建议价 | 可交付结果 |
| --- | ---: | --- |
| Free Editorial Submission | `$0` | best effort 队列，状态可查 |
| Priority Editorial Review | `$29` 一次性 | 2 个工作日内给出接受/拒绝/补件结论；不保证发布 |
| Verified Vendor Profile | `$99/年` | 身份/域名/Claim 权限核验及每年 2 次受控资料更新；不影响自然排序 |
| Sponsored Featured | `$39/7天` Beta | 独立 Sponsored 位置和基础交付数据；不保证点击 |
| Launch Bundle | `$79` Beta | Priority Review + 14 天 Sponsored + 一份交付报告 |

这些数字不是生产价格决定。正式启用前必须用最近 28 天的 qualified impressions、outbound clicks、人工审核时间、支付/退款成本和至少 5 个 Vendor 访谈重新定价。达到稳定流量后，可按真实库存和中位点击价值提升 Sponsored 价格；不得用无法交付的访问量承诺支撑高价。

现有生产价格 `$9` Priority、`+$9/$19/$29` 三档 Featured 和 `$39` Bundle 暂不因本节自动修改。未来重构应优先减少 SKU、提高审核服务价值、取消 3 天碎片窗口，并把“付费审核”和“Sponsored 曝光”从概念和结算上彻底分开。

### 启用条件与最小实现边界

只有满足以下条件才启动开发：

- 最近 28 天具备稳定的页面曝光、站内 Featured 展示和 qualified outbound click 基线；
- 至少 5 个真实 Vendor 访谈或支付意向记录支持价格和交付内容；
- Sponsored 展示有独立组件、明确标签、起止时间和自动到期；
- 自然排序、Decision 结论、index/sitemap selector 明确忽略 payment status；
- 退款、拒绝、更新次数、素材责任和广告披露条款已形成可执行政策；
- 现有 Stripe 与 Submit/Claim 数据路径能复用，确认不能复用后才允许新增最小字段或迁移。

在上述条件满足前：不新增商业化子任务、不改现有价格、不扩建 Vendor Dashboard。自动运营只需确保 payment/sponsored 信号不进入机会评分、自然推荐、索引或 sitemap 决策。

## 9C. 历史库存一次性收敛与统一生命周期

### 临时治理的终点

现有 `monitor/noindex`、`continue_index-but-not-indexed`、重复、失效和历史不一致页面的统一盘点与批量处置，是一次性迁移工作，不是新的永久运营管线。不得在完成后继续保留“旧工具、较旧工具、历史工具、早期工具”之类按年龄分层的流程。

历史收敛完成定义：

- 所有已存在 Tool ID 都有唯一 canonical、当前公开状态和来源类型；
- 所有公开页面都归入 `monitor/noindex`、`continue_index` 或经 Owner 批准的 merge/archive 状态；
- `continue_index-but-not-indexed` 以 Coverage/URL Inspection 原因分类，不能用零展示代替索引判断；
- 重复、失效、改名、收购和孤立实体均形成已执行结果或唯一 Owner 授权项；
- 每个工具的维护只依赖 Claim 类型、来源变化、nextReviewDate、搜索/站内信号和实体事件，不依赖首次收录日期；
- 临时历史库存清单封存为审计快照，后续不再作为独立 selector 或任务来源。

### 稳态只保留两种工具流程

历史收敛关闭后，工具处理只有两条：

1. **新工具收录**：发现/提交 → 身份与重复检查 → 机会评分 → candidate → draft → 一次最终独立 QA → `published + monitor/noindex`；符合条件的 A 级页面进入最近一次 Owner 索引授权批次。
2. **已收录工具定期更新**：统一 selector 按变化或到期的 Claim、实体/canonical 事件、GSC/Coverage、站内消费和 Decision Cluster 需要生成批次；只核变化字段，执行 freshness、内容升级、索引状态、合并或归档建议。

自动抓取、普通用户提交、Vendor 认领、付费提交和历史编辑只保留为 provenance，不产生不同的自然审核、更新、索引或推荐流程。工具一旦拥有正式 Tool ID，就统一进入“已收录工具定期更新”；不得继续走候选收录流程或因来源不同复制实体。

2026-10-26 实体分类与生产查重样本见 [合并候选复核](./COLLECTION_ENTITY_GATE_AND_CANDIDATE_REVIEW_2026-10-26_CN.md)。样本中的 READY 只表示实体研究可进入后续 selection 准备，不是自动入队、公开或索引批准。

### 两条流程中的状态动作

- `monitor/noindex → continue_index` 是已收录工具的索引状态变更，需要 Owner 批次授权，不是第三条工具流程。
- `continue_index → monitor/noindex`、merge、archive、redirect 是已收录工具的维护动作；高风险动作继续请求 Owner，不建立 Legacy 专项系统。
- Task、Capability、Fit、Comparison 和 Decision 页面属于产品差异化内容消费，不定义另一套工具事实或工具年龄层级。
- Market/GSC 是选择和反馈输入，不定义工具处理流程。

### 统一调度

- 每日：新工具正常 1 个、最多 2 个；已收录工具处理一个最多 5-10 条同类低风险 change set。
- 每周：从统一已收录工具池生成 Harvest/内容升级、Coverage 技术恢复和最多 3-5 项 A 级索引授权候选；不再单列历史工具周。
- 每月：对统一工具池做一次增量对账，检查身份、状态、到期 Claim、索引反馈和维护成本；不重新进行全量人工复核。
- 工具年龄不是优先级。优先级只由用户需求、Decision Cluster、搜索/站内信号、事实风险、到期时间和维护成本决定。

### 防止旧流程复活

- 禁止新增 `legacy-tool-*`、`old-tool-*`、按收录年份划分的 selector、脚本、队列或 QA 标准。
- 禁止把一次性历史库存清单复制成长期数据库层级；稳态复用现有 Tool、Claim、maintenanceReview、nextReviewDate、index state 和审计字段。
- 历史收敛批次完成后，自动化必须移除该批次的专属待办和锁，只保留最终审计链接。
- 同一工具不得同时出现在新工具队列和已收录更新队列；生产 Tool ID 存在即以后者为准。
- 普通更新仍只允许一份 change set、一个开发槽、一次最终 QA；无运行时代码或路由变化不做 build/smoke。

## 10. 管线隔离与非静默失败协议

### 新工具不继承 Decision 页面门禁

Catalog、Freshness、Decision Cluster 和 Market Feedback 是四条独立管线：

- 成熟工具进入 `published + monitor/noindex` 只需通过本文件第 3 节的实体级快速门禁。Structured Comparison 所需的逐格证据、Task/Capability/Fit 关系和 comparison 搜索意图不属于工具公开前置条件。
- 新兴、身份模糊、重复意图、核心 AI 能力不足、素材权利不清或页面内容不足的候选进入 `HOLD_ENTITY`；可变价格、额度、账户权益和未实测边界只进入 Claim 级 `conditional / unknown / conflict`，不得把整个 Catalog 管线冻结。
- Decision 单元缺证据时只 HOLD 当前 Decision 单元。Catalog 继续选择下一成熟组合候选，Freshness 和 Market Feedback 继续独立运行。
- 同一工具已经公开但尚不能进入比较页是允许状态，不得误报为工具发布失败。

### 每日计划偏差必须主动报告

每日运行结束必须产生并主动发送日报，不允许因“没有发布”“仍在 HOLD”或“任务正在等待”而静默：

1. 四条线分别列出 `planned / completed / partial / blocked / not_due`，不得只报整体健康。
2. 任一计划项未完成时，必须写明唯一直接原因、是否为系统故障、已采取的自动修复或替代动作，以及明确下一项和预计进入条件。
3. Catalog 当日未发布工具时，必须区分：候选池为空、候选实体 HOLD、通用系统故障、外部依赖异常。系统故障先修复；候选 HOLD 则自动切换下一候选或推进一个可解除缺口。
4. 一条线 HOLD 不得跳过其他线。只有共享生产基础设施故障、权限风险或数据一致性风险才能暂停多条线，并必须当天通知 Owner。
5. 当日目标与实际不一致即视为 `PLAN_DEVIATION`，无论是否需要 Owner 操作都必须通知；不得等用户询问后才说明。
6. 日报必须明确最后一行：`下一步：<唯一动作>`。若存在授权事项，另列 `需要 Owner：<事项>`；否则写 `无需 Owner 操作`。

### 防止重复验证

- 已发布工具的实体 PASS 不因 Decision 页面 HOLD 而重跑。
- Decision 只核缺失维度和变化 Claim；证据补齐后由一个开发任务形成固定 change set，再由一个独立 QA 做增量验收。
- 没有运行时代码、路由、索引或数据库变更时，不运行 TypeScript、完整 build 或 production smoke。

### Decision Cluster 端到端交付，禁止阶段任务膨胀

- 一个 Cluster 或同一批工具默认只有一个端到端交付单元。生产盘点、缺口分析、官方证据补齐、profile/source/claim 候选、Tool Capability/Fit 候选、独立 QA、只读 preflight、rollback 和可授权范围内的 commit 都是该单元的内部阶段，不得拆成连续多个需要 Owner 逐项确认的任务。
- 同一批次只创建一个开发槽和一个独立 QA 槽。开发必须一次性交付完整 change set；QA 只核差分和高风险边界。普通修正返回原开发与原 QA，不新建后缀任务。
- 批次中的单个工具证据不足时，只将该工具标记为精确 `HOLD_EVIDENCE`，继续完成其他工具；不得因一个对象 HOLD 而冻结整批或四条运营管线。
- 只有基础迁移/RLS、不可逆生产操作、真实外部账户、付费、index/sitemap、删除/归档/合并重定向需要中途请求 Owner。请求必须合并为一次授权，说明完整变更、回滚和未授权时的安全状态。
- 研究型中间产物默认并入最终交付文档，不单独作为“下一任务”。只有发现会改变产品架构、用户意图或 SEO 边界的真实冲突时，才允许独立停止并升级决策。
- 完成定义以用户结果为准，而不是内部文件数量：对关系型 Decision 单元，至少应形成可发布对象清单、每项 PASS/HOLD 原因、生产后像或明确授权阻塞，以及唯一下一步。单纯完成 inventory 或 evidence packet 不算独立业务交付。
