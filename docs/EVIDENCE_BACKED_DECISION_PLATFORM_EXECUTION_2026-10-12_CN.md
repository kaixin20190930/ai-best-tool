# Evidence-backed AI Tool Decision Platform 执行基线

生效日期：2026-10-12

状态：主线执行中

上位追踪：[收录与搜索质量主计划](./MASTER_OPTIMIZATION_TRACKER_CN.md)
本文件取代“Task-first 本身足以形成差异化”以及“每日收录数量代表主线进展”的旧解释；不取代既有 SEO、索引、证据和发布安全门禁。

## 1. 产品定位

AI Best Tool 的搜索主题继续是 AI 工具目录和 AI 工具比较，产品价值收敛为：

> 面向需要为真实工作选择 1-3 个付费 AI 工具的个人专业人士、创始人和 2-50 人小团队，在具体任务、预算、隐私、集成和使用成本约束下，用可追溯证据、实际体验和持续更新的数据缩小选择范围。

产品不是以“收录最多”为目标，也不以 Task-first 单项能力作为护城河。差异化由六层组合构成：

1. **Task Fit**：能否完成具体任务。
2. **Constraint Fit**：预算、团队规模、数据敏感度、平台、集成、自托管、导出和商用权利。
3. **Claim-level Evidence**：关键结论分别记录来源、状态、适用范围、核验日和复查日。
4. **Workflow Impact**：替代什么、增加什么步骤、需要多少人工复核、上手难度和产生价值的时间。
5. **Freshness and Change**：说明价格、能力和限制具体发生了什么变化，而不是只刷新日期。
6. **Real-use Proof**：Official、Account verified、Editorial hands-on 和 User-reported 分层展示，不把资料核验冒充亲手试用。

## 2. 当前进展复盘

| 阶段 | 目标 | 2026-10-12 状态 | 结论 |
| --- | --- | --- | --- |
| Phase 1 信任与测量 | Evidence、限制、日期、事件基础、GSC 读取 | **大部分完成** | Evidence Ledger、Change Timeline、Decision Card/Finder、只读 GSC 自动化和事件基础已存在；目标漏斗事件仍需逐项确认生产可读性，不能把代码存在等同于已获得有效数据。 |
| Phase 2 单一完整 Decision Cluster | `research-with-citations` 形成 Task → Constraint → Candidate → Compare → Evidence → Next step | **约完成一半** | 研究 Guide、三候选 comparison、Consensus 已发布关系、Gemini Notebook/Perplexity reviewed 关系及工具情报已具备；Task Page 仍关闭，部分关系未发布，Finder 未完成定向联动，Workflow Impact/Evidence Type 未系统展示，两项真实试用未完成。 |
| Phase 3 三个可复用 Cluster | research、app building、brand-safe marketing | **只有基础数据和候选包** | meeting-notes 有 noindex Task Page；app building 和 brand-safe marketing 尚未形成相同闭环。 |
| Phase 4 Decision Assistant | 用结构化关系和证据驱动自然语言决策 | **刻意未开始** | 在 Cluster 数据覆盖和真实选择反馈不足前不得升级为通用聊天包装。 |
| Catalog 与 Freshness | 稳定收录和事实维护 | **运行稳定但占用产能偏高** | 已能持续发布 monitor/noindex 工具并批量维护变化；后续作为供给管线服务 Decision Cluster，不再独立决定产品方向。 |
| Market Feedback | 用 GSC 和站内行为决定下一对象 | **部分完成** | GSC API 已可只读；每周报告存在，但尚未把搜索需求、页面行为和 Cluster 缺口自动写回优先队列。 |

## 3. 当前唯一差异化主交付

在 `research-with-citations` 达到以下完成定义前，不得用随机新增高流量工具替代该主交付：

- 一个独立、用户可见、默认 `noindex` 的 Task Page。
- 4-6 个身份稳定、角色不同的成熟候选；不得为了数量放入高度重复工具。
- 至少 3 个候选拥有 published、current、同 owner 且有 verified claim 支撑的 Fit。
- 统一比较 Task Fit、预算、来源类型、数据敏感度、导出、限制、Workflow Impact 和 Evidence Type。
- Structured Comparison 核心维度覆盖率至少 80%，每个工具至少两个互补官方来源，并给出明确的适用场景与取舍结论。
- Finder 可从该 Task Page 带入任务上下文，并能回到候选详情或 comparison。
- 至少两项真实 7-Day Trial 或等价 Editorial hands-on 记录；没有真实账户数据时明确标记 `not tested`，不得推断。
- 所有公开页面不展示内部状态、编辑规划、门禁语言或数据库术语。
- Task Page、comparison 和工具详情维持独立 canonical；索引和 sitemap 继续单独审批。

完成顺序：

1. 发布 Gemini Notebook 和 Perplexity 已审核关系，仅改变关系状态，不改变索引。
2. 通过 Task Page 独立编辑门禁并以 `noindex, follow` 上线。
3. 补齐第四至第六个互补候选，只选择能够填补研究工作流缺口的工具。
4. 统一 Workflow Impact、Evidence Type 和比较维度。
5. 完成 Finder 定向联动。
6. 建立两项真实试用；需要登录、付费或外部账户时才请求用户授权。

## 4. 四条自动化运营管线

每日无人值守运营必须同时检查四条管线，但按真实到期对象执行，不为填满配额制造工作。

### A. Catalog Pipeline

- 正常日发布 1 个合格成熟工具；只有第二个工具已 READY 且能填补当前 Cluster 明确角色时，才允许发布第 2 个。
- 选择分数由 Search/User demand、Cluster coverage gap、Decision value、Evidence readiness 和 Maintenance cost 共同决定，禁止随机追逐高流量。
- 新工具公开与索引分离；默认 `published + monitor/noindex`。
- 每个新工具必须说明它在当前或候选 Cluster 中的角色：Anchor、Gap-filler、Alternative 或 Watchlist。

### B. Freshness Pipeline

- 正常日处理 5-10 条同类低风险 Claim；只有变化或到期字段进入 change set。
- `updated_at` 不是事实证据。已有 PASS 没有来源变化、到期或受影响代码变化时不得重验。
- 价格、额度、隐私、导出、商用和账户权益按 Claim 门禁处理，不因单一未知事实阻塞整个成熟工具页面。

### C. Decision Cluster Pipeline

- 每周至少交付 2 个用户可见单元，优先级固定为当前 Cluster 缺口，而不是后台基础设施。
- 可见单元包括 Tool Intelligence、Task Page、Structured Comparison、Finder 联动和真实试用结论。
- `research-with-citations` 未完成前，默认不切换到第二个完整 Cluster；生产故障和明确数据阻塞除外。
- 每次新增或更新 Tool Intelligence 都必须评估 Workflow Impact 与 Evidence Type；信息未知时显示边界，不填充推断内容。

### D. Market Feedback Pipeline

- 每日读取最近一次成功的 GSC/站内事件快照，只用于优先级判断；数据过期时保留上一快照并标记缺口。
- 每周结合 query/page 表现、首页到任务入口、Finder 完成、comparison 使用、出站点击、证据展开和选择反馈重排 Catalog 与 Cluster 队列。
- 每月判断产品是否正从目录变成决策平台，并重新分配四条管线产能。
- 市场反馈可以调整队列和内容优先级，但不得自动批准 index/sitemap、批量归档、合并重定向、数据库基础迁移或付费外部动作。

## 5. 第一方验证指标

以下为当前产品假设目标，不是已经达成的数据：

| 指标 | 目标 | 数据不足时的处理 |
| --- | ---: | --- |
| 首页到 Task/Finder 启动率 | >= 15% | 标记 unavailable，不以页面浏览替代 |
| Finder 完成率 | >= 35% | 仅统计真实开始后的有效完成 |
| 加入 comparison 比例 | >= 20% | 必须关联同一 flow/result |
| 候选到官方站出站点击率 | >= 10% | 排除内部和自动流量 |
| Evidence 展开率 | >= 8% | 仅统计真实可见模块 |
| 正向选择反馈 | >= 60% | 没有反馈样本时不得宣称通过 |

这些指标连续两周低于目标时，优先修正入口、文案、候选质量和比较结构，不先增加页面数量。

## 6. 产能与优先级

常规周建议产能：

- 35%：Decision Cluster 用户可见能力。
- 25%：Catalog，优先补当前和下一 Cluster。
- 20%：Freshness。
- 15%：Market Feedback 与测量。
- 5%：生产故障和必要维护缓冲。

当研究 Cluster 未闭环时，Decision Cluster 可临时提高到 45%，Catalog 降为每日一个合格对象，不因数量目标挤占主线。

每日选择顺序：

1. P0 生产、安全、数据一致性故障。
2. 当前 Decision Cluster 的最近完成缺口。
3. 到期 freshness。
4. 能填补 Cluster 角色的成熟新工具。
5. 其他普通目录扩充。

## 7. 自动化和审批边界

- 自动完成：研究、候选包、低风险代码、增量测试、已审查 noindex 发布、push main、Vercel 自动部署、生产只读回验、队列重排和报告。
- 必须请求用户：index/sitemap 放行、删除/归档/合并重定向、基础数据库迁移/RLS、付费、登录真实外部账户以及无法逆转的高风险动作。
- 真实试用、账户权益和结账信息不能伪造；自动化只能准备试用清单和记录界面。
- 每个代码或发布交付单元只有一个开发和一个独立 QA；已有任务先回收，禁止因侧栏延迟重复创建。
- 已持久化 PASS 只在新差分、来源变化、复查到期或生产异常时重开。
- 同一 Cluster/工具批次采用一个端到端交付单元：盘点、补证据、关系候选、QA、preflight/rollback 与授权范围内发布属于内部阶段，不得逐阶段拆成连续任务。只在架构/SEO 冲突或必须由用户授权的高风险边界上暂停。
- 单个工具 HOLD 不阻塞批次内其他工具；最终一次性报告各工具 PASS/HOLD、生产结果和唯一剩余授权。

## 8. 本次方案 Review

| 风险 | Review 结论 | 控制 |
| --- | --- | --- |
| 定位变化影响 Google 对目录主题的理解 | 可控 | title、H1、工具库存、分类、canonical、schema 和 sitemap 继续保持 AI 工具目录语义；Decision Platform 是用户价值层。 |
| 主线再次被收录数量吞没 | 高风险，已修正 | 自动化将当前 Cluster 缺口置于普通 Catalog 之前，并要求日报分别汇报四条管线。 |
| 没有行为数据却假装市场验证 | 高风险，已修正 | 指标分为目标、可读数据和 unavailable；不使用代理指标冒充。 |
| Workflow Impact 变成模板化 AI 文案 | 中风险 | 只写有来源或真实试用支撑的内容；未知即标记未知。 |
| comparison 批量生成造成 SEO 风险 | 可控 | 默认 noindex，候选和维度门槛不满足就不发布；索引另案审批。 |
| 真实试用拖慢全部发布 | 可控 | 真实试用只限制 hands-on 标签和精确判断，不阻塞成熟工具 monitor/noindex 页面。 |
| 自动化无限扩张后台和测试 | 已控制 | 用户可见增量优先、增量验收、单项 60 分钟止损和一个开发/一个 QA。 |

Review 结论：方向成立，现有基础无需推倒；真正问题是战略没有进入自动化优先级与完成定义。本文件生效后，Catalog/Freshness 继续运行，但必须服务于 Decision Cluster 和 Market Feedback 闭环。
