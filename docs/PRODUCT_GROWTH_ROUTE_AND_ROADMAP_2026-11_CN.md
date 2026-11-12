# AI Best Tool 产品增长路线与执行 Roadmap（2026-11）

生效日期：2026-11-04
状态：**已批准，作为产品、内容、SEO、自动运营和周复盘的当前上位路线**

2026-11-12 执行纠偏：R1–R5 的顺序约束索引分发决策，不代表支持工具的证据维护、查重、对比与有条件站内推荐也必须停等。n8n/comparison 的内容冷却只作用于对应页面的非必要改写。日常交付与 D+ 观察并行，单工具 HOLD 不阻断其他合格项；生产/独立 QA/索引门禁不变。当前推进状态以发布清单 delivery 和[执行手册](./PRODUCT_GROWTH_OPERATIONS_RUNBOOK_CN.md)为准。

关联文档：

- [SEO 产品架构 V3](./SEO_PRODUCT_ARCHITECTURE_V3_2026-10-26_CN.md)
- [收录与搜索质量主计划](./MASTER_OPTIMIZATION_TRACKER_CN.md)
- [工具页索引发布政策](./TOOL_INDEX_RELEASE_POLICY_CN.md)
- [公开内容边界与页面简化方案](./PUBLIC_CONTENT_BOUNDARY_AND_PAGE_SIMPLIFICATION_PLAN_CN.md)
- [SEO 自动化基础收口](./SEO_AUTOMATION_FOUNDATION_CLOSEOUT_2026-10-29_CN.md)

本文不放宽实体、证据、canonical、robots、sitemap、索引、数据库安全和不可逆操作门禁。它取代旧文档中与下列原则冲突的内容：以工具数、资产数、每日发布数、候选池大小、处理数量或 `high-confidence` 候选作为产品进展；把所有 comparison 永久视为 noindex；把 Evidence Ledger、Decision Card 或 Change Timeline 的存在本身称为差异化；按计划凑满索引额度。

## 一、路线决策

AI Best Tool 当前不是通过发明竞品没有的页面形式取胜。正确路线是：

> 学习市场已验证的目录、pricing、alternatives、vs、best-for 和 comparison 页面结构，在价格准确度、限制边界、适用/不适用判断和复核透明度上做得更可靠，再让这些页面真正进入搜索反馈循环。

产品身份继续是 **Evidence-backed AI Tool Decision Platform**，对搜索和普通访客使用清楚的 `AI tools / compare / pricing / limits` 语言，不用抽象平台术语替代用户正在搜索的问题。

### 关键定义

- **基础同等能力不是差异化**：pricing、alternatives、vs、comparison 和 shortlist 是目录站必须具备的 BOFU 承接形式。
- **真正的产品优势是决策可靠性**：数字来自哪里、何时核查、适用哪个套餐、什么限制会改变选择、什么时候不该选。
- **证据系统是底层能力，不是前台术语**：Evidence Ledger、Decision Card 和 Change Timeline 必须服务用户选择；不能把内部流程名直接当页面主内容。
- **完成页面不等于发布页面**：只有通过内容、意图和索引门禁并进入 sitemap，页面才进入搜索分发；只有出现相关 query/impression，才进入市场反馈。
- **规模来自反馈循环，不来自库存**：先释放小批已准备页面，观察 3/7/14/28 天，再决定下一批。

## 二、当前基线与已确认问题

截至 2026-11-03/04 的代码、生产和最近私有 GSC 快照：

| 项目 | 当前事实 | 产品含义 |
| --- | --- | --- |
| sitemap | 152 个 URL | 是审批结果，不是页面库存总数 |
| 页面资产账本 | 330 项：68 KEEP_INDEX、3 IMPROVE、178 INTERNAL_NOINDEX、53 MERGE_CANDIDATE、28 ARCHIVE_CANDIDATE | 资产状态是治理输入，不是增长成绩 |
| 工具生产矩阵 | 135 Tool IDs；89 published；28 continue_index、59 monitor、2 archive | 主要问题是索引资格与消费位置，不是“缺 64 页” |
| GSC 28 天 | 4 clicks / 3,192 impressions / CTR 0.13% / position 15.21 | 真正缺口是点击和分散到更多有效页面 |
| `/ai/n8n` | 约 2,274 impressions、1 click、position 约 10.4 | 已有需求，应先 Harvest，不应先扩库存 |
| Automation comparison | 200、完整 verified comparison、当前 noindex、未进 sitemap | 已做但未进入分发，是首个 comparison 发布候选 |
| Productivity comparison | `content.kind=unavailable` | 空壳，不具备索引资格 |
| Meeting Notes comparison | unavailable，且 canonical 指向主 Guide | 不是独立索引页 |
| Make / Lindy | published + monitor/noindex | 不是 sitemap 漏项；需走 Tool 索引门禁 |
| 英语内部链接 | 生产仍输出 `/en/...`，访问后 307 到无前缀 URL | 全站技术 P0，先修再扩大索引 |

补充口径：`/cn/` 是简体中文路由，不是越南语。越南国家流量不能用来判断 `/cn/` 页面是否空转。中文索引面的去留应使用中文 query、国家/地区、页面和转化数据单独判断；在没有对应数据前，不批量删除中文 URL，也不因双语机制机械扩张。

## 三、四层产品演进路线

四层必须顺序推进。可以维护既有系统，但不得用后一层的工程工作替代前一层的用户结果。

### 第一层：市场同等能力与事实准确度

目标：用户搜索一个工具的 pricing、cost、limits、alternatives 或 self-hosting 时，页面能直接、准确地回答。

完成标准：

1. 价格、额度、并发、保留期、许可和托管模式有来源与核查日期。
2. 区分公开价格、账户/地区差异、年付折算和待询价项。
3. 明确 `Best for / Not ideal for / Watch outs`，不只列功能。
4. 易变数字由 Claim 新鲜度控制；过期时降级精确断言，不伪装成当前报价。
5. 页面回答“什么时候不该选它”。

本层首个样板：`/ai/n8n`。

### 第二层：BOFU 对比与搜索分发

目标：对比页承接用户已经进入评估期的 `vs / alternatives / compare / best for` 需求，并能被搜索引擎发现。

完成标准：

1. 至少两个真实候选和可验证差异。
2. 页面有一屏结论、比较矩阵、限制、证据、核查日期和唯一下一步。
3. 与 Guide、Best 和 Tool 页的主意图不重复。
4. self-canonical、index、sitemap 和主要内链同时一致。
5. 通过发布后 3/7/14/28 天观察进入反馈循环。

Comparison 不再“全部永久 noindex”，但仍默认 fail-closed：完整且有独立意图的页面可以单项申请索引；空壳、重复意图或跨页 canonical 页面继续 noindex。

### 第三层：面向用户的决策体验

目标：页面在 60 秒内让用户理解选择，不像内部审计记录。

完成标准：

1. 首屏说明任务、关键取舍和下一步。
2. 内部术语改成用户问题：
   - `Decision Card` 前台标题改为“是否适合你的工作流”等任务语言；
   - `Evidence Ledger` 改为“来源与核查”；
   - `Review & Change Timeline` 改为“价格和产品变化”。
3. 详细证据渐进披露，不挤占主决策路径。
4. 删除 baseline、内部评分、SEO 处置、编辑 TODO、裸脚注和重复 CTA。
5. 页面行为可观察：比较入口、证据展开、官网点击和下一步路径。

底层 Evidence/Decision/Timeline 数据继续保留；优化对象是信息层级和公开语言，不是删除可信数据能力。

### 第四层：小批索引与反馈驱动扩张

目标：以当前索引面为基数逐批释放，而不是先铺满页面再分类。

完成标准：

1. 每批只包含同一 Cluster 中内容就绪、意图唯一的页面。
2. 当前数据库 `5/25` 是安全硬上限，不是产量目标；正常批次建议 1-3 个独立页面对象。
3. 每个对象记录释放前 URL set、robots、canonical、主查询和内容版本。
4. 第 3 天检查技术发现，第 7 天检查抓取，第 14/28 天检查相关曝光、query 和价值。
5. 新增页大量未收录、软 404、重复意图或非品牌表现恶化时暂停下一批。

## 四、统一页面生命周期

今后文档、Dashboard 和周报统一使用以下状态，禁止再把“代码存在、200、published、进 sitemap、已收录”混为一谈：

| 状态 | 定义 | 允许的结论 |
| --- | --- | --- |
| Candidate | 只有需求或实体候选 | 不称为页面 |
| Public monitor | 200，可供站内用户使用，noindex，不进 sitemap | 已公开，未进入搜索分发 |
| Content ready | 内容、证据、意图和技术通过 | 可申请索引，不代表已批准 |
| Distribution approved | index + self-canonical + sitemap + 主要内链一致 | 已进入搜索分发 |
| Discovered/crawled | 搜索引擎已发现或抓取 | 不代表已收录 |
| Indexed/exposed | Coverage 或相关 query/impression 证明进入搜索 | 开始获得市场反馈 |
| Improved/held/disposition | 28 天后增强、保持、退回或进入合并/归档授权 | 基于结果做下一动作 |

Roadmap 的交付必须写明目标状态。例如“发布 Automation comparison”指从 `Public monitor` 进入 `Distribution approved`，不是新建文件，也不承诺 Google 在一周内收录。

## 五、指标体系

### 北极星

**每周产生有效决策行为的自然搜索访问。**

有效决策行为包括进入对比/自托管等下一步、展开关键证据、打开官网或进入可归因的 Tool 决策路径。事件暂不可用时，不把缺失当作 0，使用以下 GSC 代理指标：

1. 获得 qualified non-brand impressions 的页面数；
2. 进入 Top 20 的决策查询簇数；
3. qualified query 的 clicks、CTR 和 position；
4. 曝光是否从单一 n8n 页扩散到第二、第三个有效页面。

### 周增长记分板

| 层级 | 指标 | 用途 |
| --- | --- | --- |
| Outcome | qualified non-brand clicks / CTR | 判断是否真正获得用户 |
| Distribution | 新获得相关曝光的页面和查询簇 | 判断页面是否进入反馈循环 |
| Conversion proxy | Compare next、Evidence、outbound 等事件 | 判断页面是否帮助选择 |
| Quality guardrail | canonical/robots/sitemap 一致性、未收录、软 404、重复意图 | 防止扩张伤害站点 |
| Freshness guardrail | 影响决策的到期 Claim 数和过期公开断言数 | 保护准确度 |
| Operations health | 资产数、处理数、候选数、任务 PASS | 只用于排障和容量，不计产品增长 |

“本周有几个页面拿到新曝光”是重要领先指标，但不能单独成为目标；必须同时检查 query 是否相关、页面是否唯一、CTR 是否合理，防止靠低质量长尾制造曝光。

### 停用的主 KPI

- 资产总数、工具总数和页面总数；
- 每日必须发布 1-2 个工具；
- 每周必须索引 4 个或用满 5/25；
- `high-confidence` 候选是否每天出现；
- Freshness 处理条数和 QA/PASS 次数；
- sitemap 固定总数。

这些可以做运营健康数据，但不能代表产品路线完成。

## 六、五个目标 URL 的正式处置

| URL | 当前状态 | 2026-11 决策 | 进入分发前条件 |
| --- | --- | --- | --- |
| `/guides/ai-tools-for-automation-comparison` | 完整 verified comparison；noindex | **P1 发布候选** | `/en/` 修复、最终事实 QA、独立意图确认、en/cn self-canonical |
| `/guides/ai-productivity-tools-comparison` | unavailable 壳页 | **继续 noindex** | 先完成真实候选和矩阵，否则进入合并/重定向授权包 |
| `/guides/ai-tools-for-meeting-notes-comparison` | unavailable；canonical 指向主 Guide | **继续 noindex** | 只有重建独立内容并改 self-canonical 后才能申请 |
| `/ai/lindy` | published + monitor；已有独立曝光信号 | **第一 Tool 索引候选** | 独立意图、事实新鲜度、决策内容和索引 A 级门禁 |
| `/ai/make` | published + monitor；comparison 支撑 Tool | **第二候选/暂缓** | 先取得独立需求或用户行为，避免与 comparison 重复 |

禁止直接手改 sitemap XML。指南通过 `INDEXABLE_GUIDE_PATHS`/审批清单生成，工具通过 `page_quality_status` 与统一索引决策生成。每批准一个英中双语对象通常增加两条 URL，但验收使用 URL set diff，不把 `152 → 某个固定数字` 写成永久契约。

## 七、2026-11 串行 Roadmap

**2026-11-05 执行校正：R1、R2、R3 生产技术验收通过；R4 等待独立 QA。**R1 提交 `65e7830c` 已推送；本地生产模式扫描为 174 页、3,294 个站内链接，英语 `/en/` 链接为 0。第一次线上扫描在部署切换期间仍看到约 70 页的共享 `/en/explore`；第二次扫描已不再出现这些链接，唯一抓取失败的 `/submit` 单独验证为预期的 `307` 登录跳转（落点 `200`）。R2 的初版 `3ac20856` 在线上出现新标题与旧正文混合，根因为定价组件误嵌在条件证据链接内；修复 `7d050803` 推送后，生产英中页面、相关 Guide、canonical/index 和 sitemap 专项检查均通过。R3 的发布 `8eeec217` 与 hreflang 补丁 `7a769177` 已推送；生产英中页面均为 `200 + index + self-canonical + en/zh-CN/x-default`，生产 SEO smoke 通过，sitemap 为 154 条且仅新增 Automation 英中两条 comparison。R4 独立 QA 工具调用未能创建代理，没有 `QA_PASS`；生产证据与索引状态未写入。

**2026-11-05 R4 最新状态（覆盖上段历史状态）：证据 QA 已通过并提交；索引评审未通过。**独立报告 `INDEX_EVIDENCE_LINDY_2026-11-04_QA.json` 与清单内容哈希匹配。fresh preflight 写入 0；单对象 evidence commit 写入 1；postcheck 确认后像已应用且追加写入 0。随后对实际生产后像运行单对象索引 selector/preflight，结果均为 `repair_monitor`，正式评审已记录同一结论。阻塞是过期的 `next_review_date`（生产值为 2026-10-31，上海时间）、缺少可验证的 `indexIdentity` 独立意图快照，以及未记录真实完成的 `observationComplete`。此前基于拟议后像的 `approve_continue_index` 不能代替当前生产评审。未运行索引 rollback/commit；Lindy 保持 `published + monitor/noindex`，sitemap 无 Lindy。先真实复核日期、生产查重与观察证据，再生成新的索引批次及其独立 QA；不得把本次证据 QA 扩展为索引发布签署。

### R1：统一英语路径（P0，2026-11-04 至 11-06）

目标：消除站内英语 `/en/...` 重定向链，再扩大索引。

交付：

- navigation factory 和 Link 出口收敛为一套；
- 默认语言不传显式 `locale=en`；
- query、hash、登录回跳和语言切换保持；
- HTML 回归扫描所有 sitemap 页面。

验收：英语站内链接 `/en/` 为 0；中文 `/cn/` 保持；历史 `/en/...` 继续重定向；canonical、Breadcrumb 和内链一致。

### R2：n8n 决策页 Harvest（P0，R1 生产通过后，预计 2-3 天）

目标：让已有曝光兑现 pricing/cost/self-hosting 意图。

交付：

- H1 对齐 pricing 与 Cloud vs self-hosted；
- 首屏结论、execution 解释、计划快照、TCO、许可/限制和 FAQ；
- 易变数字接入 Claim 新鲜度；
- 内部模块名改成用户语言，详细证据折叠；
- 双向链接到 self-hosted Guide 和 Automation comparison。

验收：页面任务可在 60 秒内理解；无内部 baseline/SEO TODO/裸脚注；事实有核查日期；pricing 查询簇按 14/28 天复盘。

### R3：Automation comparison 进入分发（P1，R2 生产通过后，预计 1 天）

目标：把已完成的 BOFU 资产从 `Public monitor` 推进到 `Distribution approved`。

交付：最终事实 QA、指南审批、en/cn index+self-canonical+sitemap、主 Guide/n8n/Make/Lindy 内链。

验收：精确新增两条 URL、robots/canonical/hreflang 一致；技术项于 2026-11-05 通过生产验收。后续按实际可得数据做 D+3/7/14/28 观察；Google 是否收录不是一周内强制交付。

### R4：Lindy 第一 Tool 释放实验（P1，R3 技术确认后）

目标：验证搜索反馈能否从 n8n 扩散到第二个工具页。

交付：完成 A 级索引评审；通过才切换 `continue_index`。

验收：精确新增 en/cn 两条；query 与内容相关；28 天后决定保持、增强或退回。

**2026-11-05 执行状态：A 级拟议后像已通过，但独立 QA 未创建成功；等待独立签署后才能生产提交。**

以下为证据提交前的历史快照；当前状态以上述“R4 最新状态”为准。

- 当前生产仍为 `published + monitor/noindex`，本轮没有改数据库、robots、sitemap 或索引状态。
- 已重新核验 3 条官方来源：产品主页、实时定价页、用量与重任务暂停文档。
- 已补齐 2 条不同域名、不同证据方法的独立信号：Cybernews 的真实工作流编辑实测，以及 Crunchbase 的主体持续运营/多轮融资资料。前者只支持实际采购相关性与复杂流程限制；后者只支持组织持续性，不作为功能、可靠性或采用规模证明。
- Cybernews 的历史价格表与当前官网不一致，明确排除，不写入价格事实。
- 单对象证据清单见 [`INDEX_EVIDENCE_LINDY_2026-11-04.json`](./INDEX_EVIDENCE_LINDY_2026-11-04.json)。通用执行器的生产前像、只读 preflight 和事务 rollback 演练均通过，生产写入为 0。
- 把清单合并到生产后送入同一评审器的只读拟议后像结果为：质量分 100、官方来源 3、独立信号 2、17 项门禁全部通过、`decision=approve_continue_index`；策略启用，额度为日 0/5、周 0/25。
- 证据提交器强制要求与作者分离的 `QA_PASS`，且 QA 报告必须绑定当前清单 SHA-256 `d1448244740a00c83894d88a2674c4b37e0ab2fabafd640d44f8dbcfa2213539`。在该签署缺失前禁止 evidence commit、index review commit 和 `continue_index` 切换。
- QA 通过后的唯一执行顺序：证据 commit → 零写 postcheck → 正式 Lindy index review 记录 → 单对象索引 rollback 演练 → `continue_index` commit → EN/CN metadata、self-canonical、sitemap 精确新增两条回验。任何一步失败即保留 `monitor/noindex`。

### R5：Make 与下一 Cluster 决策（P2，R4 至少取得 14 天信号后）

优先使用以下证据：Make 独立 query、Automation comparison 到 Make 的点击、页面内容独立度、相关市场需求。没有信号时保持 noindex，不为对称性放开。

当前保持 **未开始**。R4 尚未完成生产放行，且尚未形成至少 14 天的 Lindy/Automation 信号，因此不得提前评审或切换 Make。

Productivity 和 Meeting Notes comparison 本月不进入索引排期；先决定“重建真实比较”或“合并/重定向”，不可逆动作另行 Owner 授权。

## 八、自动运营调整

**2026-11-05 实施状态：**监控修复 1edbe12f 已推送，两项 GitHub 工作流真实运行均 Success。新周报、页面×查询只读采集与发布后观察脚本已实现并手动验证。增长周报 ai-best-tool、唯一 Cluster 复盘 ai-best-tool-cluster、发布后观察 ai-best-tool-2 已创建为 ACTIVE heartbeat，绑定当前实施聊天；首次自动运行待验收。GSC 最新最终日仍 10-30、实时 OAuth 400；获授权核查的 Moss 服务账号无 aibesttool 读取权限，发布后指标等待数据恢复。11-05 工具级 Freshness 队列 69 个到期公开工具，其中 Lindy/Make 到期，不能冒充 Claim 级计数。完整执行契约与运行记录见[自动运营手册](./PRODUCT_GROWTH_OPERATIONS_RUNBOOK_CN.md)、[新指标周报](./PRODUCT_GROWTH_WEEKLY_REPORT_CN.md)、[发布后观察](./PRODUCT_GROWTH_OBSERVATION_CN.md)。

自动化继续做实体查重、Freshness、资产账本和候选筛选，但角色从“证明系统每天有产出”改为“为当前 Cluster 提供输入和护栏”。

每周只允许一个主增长 Cluster，默认输出：

1. 一个主页面 Harvest 或一个已就绪页面释放；
2. 最多两个必要 Tool 支撑；
3. 只处理页面将引用或已过期的关键 Claim；
4. 一次最终 QA；
5. 一份 3/7/14/28 天观察记录。

候选评分优先级改为：

`已有真实搜索机会 > 当前 Cluster 缺口 > 明确 BOFU/决策意图 > 内容和证据准备度 > 维护成本`。

当周没有合格释放对象时允许为 0；应增强已有页或修共同技术问题，不得创建页面补数。328/330 项资产账本继续用于去重、合并和归档治理，但不占增长路线的主产能。

## 九、内容与产品文档治理

1. 本文是当前产品增长路线的上位决策。
2. `SEO_PRODUCT_ARCHITECTURE_V3` 保留 Cluster、证据、页面职责和工程预算，路线和顺序以本文为准。
3. `CONTENT_SCALE_AND_MAINTENANCE_ROADMAP_2026-09-20` 降为历史容量与维护参考；其中每日发布、每周索引和一年页面数量目标停止执行。
4. `EVIDENCE_DECISION_PLATFORM_ROADMAP` 保留底层数据能力与商业化历史；“三模块本身就是差异化”和旧发布配额停止作为当前产品路线。
5. `PUBLIC_CONTENT_BOUNDARY...` 的 comparison 结构和内容边界继续有效；“全部 comparison 保持 noindex”修订为默认 fail-closed、单项批准。
6. 周报首页固定输出本路线指标，不再用资产项数和候选运行状态作为第一结论。

## 十、完成定义

本月路线不是以“做完 5 个 URL”结束，而以以下结果结束：

- 英语站内主路径不再经过 `/en/` 重定向；
- n8n 页面从品牌实体介绍变成可用的 pricing/cost 决策页；
- 至少一个完整 comparison 真正进入分发；
- 至少一个第二工具页按门禁完成受控释放或给出有证据的继续 noindex 结论；
- 周报开始以 qualified exposure、CTR、Top 20 查询簇和决策行为记分；
- 旧数量型 roadmap 被明确降级，团队不再收到互相冲突的产量指令。

任何搜索增长目标都是观察目标，不是 Google 收录承诺。技术、内容和分发状态必须分别验收。
