# AI Best Tool 差异化基础能力一周实施计划

更新时间：2026-09-22

状态：执行中

## 1. 本轮目标

在不改变“AI 工具目录”主题、不扩大低质量索引面的前提下，把现有 Evidence Ledger、Decision Finder、Decision Card 和关系表升
级为可复用的 Decision Graph。用户最终应能从“我要完成什么任务”出发，看到符合约束的候选、能力差异、限制、证据与核验日期，
而不是继续浏览同质化工具列表。

本周交付的是差异化基础能力，不是完整 AI 助手。自然语言 Decision Assistant 只有在关系数据覆盖门槛通过后才启动。

## 2. 现状与复用边界

以下能力已经存在，禁止重复建设：

- `decision_tasks`：Task 实体与约束结构。
- `tool_decision_profiles`：Best for、Not ideal、风险和比较维度。
- `tool_task_fits`：Tool 与 Task 的适配关系。
- Product Intelligence 与 claim links：可核验来源、冲突、失效和复查日期。
- Decision Finder：基于规则和已核验证据的候选筛选。
- Tool Decision Card、Evidence Ledger、后台审核与变化时间线。

本轮真实缺口：

- 缺少规范化 `Capability` 实体。
- 缺少 Tool ↔ Capability 与 Task ↔ Capability 关系。
- Task Page 尚未成为独立且受质量门禁保护的用户入口。
- Tool Intelligence 与 Comparison 尚未完全读取同一份 Decision Graph。
- 首批 20 个成熟工具 × 6 个 Task 的真实关系覆盖不足。

## 3. 两条并行主线

### INTAKE：成熟工具持续收录

- 发现 10-20 个候选，深审 4-6 个。
- 目标每天公开 1 个成熟工具，上限 2 个；仍按统一发布流水线执行。
- 新实体先 `published + monitor/noindex`；成熟高需求工具可同日进行独立索引评审，但不得绕过质量、证据、SEO 和周额度门禁。
- 事实更新与新工具发布分开：既有工具每天可维护 5-10 个，不占新实体配额。
- INTAKE 不直接修改 Capability taxonomy、Task Page 或 Comparison 组件，避免与 DIFF 冲突。

### DIFF：差异化基础能力

- 本周工程产能优先级：DIFF 60%，INTAKE 25%，SEO/QA/稳定性 15%。
- DIFF 的所有公开内容必须来自已核验关系数据，不允许 AI 自动生成后直接发布。
- Task Page、Tool Intelligence、Comparison 共享同一读模型；不分别维护事实副本。

## 4. 第一批范围

### 6 个 Task

1. 将产品图片制作成短视频。
2. 转录并总结会议。
3. 在品牌约束下生成营销内容。
4. 使用 AI 构建应用。
5. 基于引用研究论文和资料。
6. 创建 AI 配音。

### 20 个成熟工具

ChatGPT、Claude、Gemini、Fathom、Gamma、Consensus、Runway、Luma AI、Pipedream、Cursor、The
Graph、n8n、OpenRouter、Grammarly、Jasper、ElevenLabs、Midjourney、Otter.ai、Fireflies.ai、Descript。

名单是首批关系数据范围，不等于 20 个工具都立即新增 URL 或批准索引。实施前按生产 `tool_id` 查重；缺少独立实体、证据或产品
身份的对象保持草稿，不为满足数量制造页面。

## 5. 数据模型

### `decision_capabilities`

| 字段                        | 类型        | 说明                                                                         |
| --------------------------- | ----------- | ---------------------------------------------------------------------------- |
| `id`                        | uuid        | 主键                                                                         |
| `slug`                      | text unique | 稳定机器标识                                                                 |
| `name`                      | jsonb       | 多语言名称，至少 `en`                                                        |
| `description`               | jsonb       | 面向用户的能力边界                                                           |
| `capability_group`          | text        | creation/editing/analysis/automation/collaboration/governance/delivery/other |
| `status`                    | text        | draft/active/archived                                                        |
| `display_order`             | integer     | 同组排序                                                                     |
| `created_at` / `updated_at` | timestamptz | 审计时间                                                                     |

### `tool_capabilities`

| 字段                            | 类型        | 说明                                               |
| ------------------------------- | ----------- | -------------------------------------------------- |
| `id`                            | uuid        | 主键                                               |
| `tool_id`                       | uuid        | Neon 工具 ID 的逻辑引用，不建跨库外键              |
| `capability_id`                 | uuid        | Capability 外键                                    |
| `support_level`                 | text        | strong/partial/limited/not_supported/unknown       |
| `availability`                  | text        | all_plans/paid_only/enterprise_only/add_on/unknown |
| `plan_requirement`              | jsonb       | 套餐、额度或地区要求                               |
| `limitations`                   | jsonb       | 用户决策所需真实限制数组                           |
| `status`                        | text        | draft/reviewed/published/stale                     |
| `reviewed_at` / `review_due_at` | timestamptz | 新鲜度门禁                                         |
| `reviewed_by`                   | uuid        | 编辑审核人                                         |

### `task_capabilities`

| 字段                            | 类型        | 说明                           |
| ------------------------------- | ----------- | ------------------------------ |
| `task_id`                       | uuid        | 既有 Task 外键                 |
| `capability_id`                 | uuid        | Capability 外键                |
| `importance`                    | text        | required/preferred/contextual  |
| `rationale`                     | jsonb       | 多语言选择理由                 |
| `status`                        | text        | draft/reviewed/published/stale |
| `reviewed_at` / `review_due_at` | timestamptz | 编辑与新鲜度状态               |
| `reviewed_by`                   | uuid        | 编辑审核人                     |

### `tool_capability_claims`

每条公开 Tool Capability 至少连接一条有效、已核验、未冲突、未失效且属于同一工具的 Product Intelligence claim。用途分为
`support`、`availability`、`plan`、`limitation`、`other`。

## 6. 一周排期

| 日期       | ID      | 交付                                                        | 验收                                                                   | 状态     |
| ---------- | ------- | ----------------------------------------------------------- | ---------------------------------------------------------------------- | -------- |
| 09-22      | DIFF-00 | 战略、范围、双线产能和门禁写入唯一计划                      | 与现有 DCF/EVD 不重复，风险 review 完成                                | 已完成   |
| 09-22      | DIFF-01 | Capability、Tool Capability、Task Capability 与 claim links | RLS、跨库边界、证据和发布门禁测试通过；待生产迁移与只读回读             | 本地完成 |
| 09-23      | DIFF-02 | 后台编辑与统一服务读模型                                    | 不允许客户端读/写 raw claim；保存有 loading/success/error；待生产迁移回读 | 本地完成 |
| 09-24      | DIFF-03 | 6 Task + 20 工具首批真实关系数据                            | 生产完整回读、published 保留、SQL Editor 原子执行修复与 QA 验收通过    | 已完成   |
| 09-25      | DIFF-04 | 独立 Task Page                                              | 至少 3 个 published fit 才可公开；默认 noindex；无薄页扩张             | 未开始   |
| 09-26      | DIFF-05 | 统一 Tool Intelligence                                      | Best for、Not ideal、Capability、Pricing、Evidence、Last verified 同源 | 未开始   |
| 09-27      | DIFF-06 | Structured Comparison                                       | 同图谱比较 2-4 个工具；unknown 明示；默认 noindex                      | 未开始   |
| 09-28      | DIFF-07 | 全链路自动验收与生产收口                                    | migration、tsc、build、SEO、页面、RLS、证据门禁全部通过                | 未开始   |
| 覆盖达标后 | DIFF-08 | 自然语言 Decision Assistant                                 | 满足第 8 节门槛后才能开始                                              | 条件阻塞 |

INTAKE 与上述排期并行：09-23 Descript 到期发布槽继续执行；其余成熟工具按队列每日一个，不因 DIFF 暂停，也不允许为追赶数量
绕过现有门禁。

## 7. 页面与 SEO 边界

- Task Page 是用户决策入口，不是自动生成关键词页面。
- 首版 Task Page 只覆盖本计划 6 个 Task；每页至少 3 个已发布 Tool Fit、required/preferred Capability、明确限制、证据日期
  和可比较候选。
- 新 Task Page 默认 `noindex, follow` 且不进入 sitemap。只有内容完整、意图独立、内部链接合理、站点级 GSC 健康和独立索引
  审批全部通过后才能放行。
- Tool Intelligence 复用现有 canonical Tool Page，不新增第二套工具 URL。
- Structured Comparison 首版是用户选择后的动态视图或受控页面，默认 noindex；禁止把工具排列组合批量写入 sitemap。
- metadata 继续遵守既有 SEO 架构冻结规则，不因差异化改写站点主题。

## 8. Decision Assistant 启动门槛

全部满足后，DIFF-08 才从 `条件阻塞` 转为 `可开发`：

- 6 个 active Task 均有至少 3 个 published Tool Fit。
- 20 个目标工具的核心 Capability 覆盖率至少 80%。
- 所有 published Tool Capability 和 Tool Fit 均有有效 claim、`reviewed_at` 与 `review_due_at`。
- 每个 Task 均定义 required 和 preferred Capability。
- Structured Comparison 可在不调用生成式 AI 补事实的情况下比较至少 3 个候选。
- 公共读模型中 unknown 字段比例不高于 20%。
- 自动 migration、RLS、规则、UI、SEO、TypeScript 和完整 build 门禁通过。

达到门槛后，自然语言只负责把用户输入解析为 Task、Constraint 和偏好；候选、排序、限制和证据仍来自结构化图谱。无法映射或证
据不足时必须显式返回“不足以判断”，禁止模型猜测。

## 9. 自动验收矩阵

- Schema：表、约束、唯一键、索引、RLS 和跨数据库无外键。
- Evidence：错误 owner、候选 claim、已失效、已过复查期和冲突 claim 均被拒绝。
- Editorial：无 `reviewed_at` 或有效 claim 的 published 关系被拒绝。
- Read model：公开层只返回 active/published 且未过期的数据。
- Task Page：候选不足、关系过期或数据不完整时保持 noindex 或 404，不输出薄页。
- Tool Intelligence：同一 Capability、价格和限制在 Tool、Task、Comparison 三处一致。
- Comparison：未知值不转成否定值，不使用 AI 推断填空。
- Regression：现有 Tool URL、canonical、sitemap、Decision Finder、Evidence Ledger、Admin 和 Stripe 不回退。
- Release：专项测试、TypeScript、完整 build、生产只读 preflight、部署后 SEO smoke。

## 10. Review 结论与风险处置

本计划 review 已修正以下风险：

1. 不重建 Task/Evidence/Finder，避免双套事实和状态漂移。
2. `tool_id` 仅作为 Neon ID 的逻辑引用，Supabase 不建立不存在的跨库外键。
3. Capability 关系只有经过人工审核且绑定有效 claim 才能发布，AI 抽取只能进入 draft。
4. Task Page 和 Comparison 默认 noindex，避免 programmatic SEO 再次膨胀。
5. 20×6 不是强制填满 120 个关系；没有真实适配或证据时明确缺失，避免伪造覆盖率。
6. Decision Assistant 按覆盖率门槛启动，不按日历硬上线，避免成为 ChatGPT wrapper。
7. INTAKE 与 DIFF 按文件、数据库对象和发布门禁隔离，日常收录不阻塞平台升级。
8. DIFF-01 发布约束在事务提交时复核：删除或更新唯一 claim、将 claim 移至错误 owner、重分类/重分配其 owner profile、失效或冲突
   都不能让 `published` Tool Capability 保留无有效证据状态；时间自然到期时公开 RLS 立即停止返回该关系。Capability 或 Task 被
   归档时公开 RLS 也立即停止返回相应关系。公开层不暴露 raw claim
   links，DIFF-02 必须以服务端安全读模型组合证据。
9. DIFF-02 的公共读模型只输出 active Capability、当前 published Tool/Task Capability 和来源 URL、核验/复查日期摘要；不输出
   claim ID、claim value、excerpt 或 raw link。后台操作仅经管理员 server action，输入先校验；Tool Capability 证据链接只能在
   draft/reviewed 状态按 UUID 增删，published 记录仍由数据库门禁保护。
10. DIFF-03 于 2026-09-23 完成。旧 SQL Editor 导出将多条顶层语句分段提交，导致 `ON COMMIT DROP` 临时表在后续语句中不可见；
    修复版把所有 guard、upsert、claim links 与 postcondition 放入一条原子 `DO` 语句。生产只读 verifier 与 QA 已确认完整数据：
    6 Task（复用既有 `meeting-notes`）、12 Capability、12 Task Capability、7 Tool Capability、7 Tool Task Fit，以及两类各 7 条
    claim links。3 条既有 published meeting fit 保持原状态及证据链接；其余本批关系为 reviewed。生产完整回读与 SQL Editor 修复均已
    验收，无需再次执行 SQL。未改 URL、工具目录、sitemap 或索引策略。

## 11. 完成定义

一周基础能力只有在 DIFF-00 至 DIFF-07 全部通过、生产回读正常、文档状态同步后才算完成。DIFF-08 属于下一阶段条件任务，不计
入一周基础能力完成率；在它启动前，两条主线仍按 INTAKE + DIFF 并行推进。
