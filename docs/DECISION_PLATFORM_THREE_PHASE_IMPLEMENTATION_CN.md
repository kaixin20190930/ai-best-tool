# AI 工具决策平台三阶段实施方案

创建日期：2026-09-02

状态：最终方案已 Review，等待按任务实施

上位计划：[收录与搜索质量主计划](./MASTER_OPTIMIZATION_TRACKER_CN.md)

SEO 护栏：[SEO 信息架构与不可回退规则](./SEO_INFORMATION_ARCHITECTURE_GUARDRAILS_CN.md)

自动验收：[决策平台自动化测试与发布验收](./DECISION_PLATFORM_AUTOMATED_ACCEPTANCE_CN.md)

## 一、目标与范围

在不改变 `AI tools directory / AI 工具目录` 搜索主题、不扩大可索引 URL 数量的前提下，把已有目录升级为三个连续能力：

1. **阶段一：Task & Constraint Finder + Decision Card 2.0**，回答“我的任务和限制下，先看哪三个工具”。
2. **阶段二：AI Stack Audit + 7-Day Trial Scorecard**，回答“我已经订阅的工具该保留、替换、删除还是补齐”。
3. **阶段三：Verified Usage Signals + Pricing / Change Watch**，回答“真实用户是否留下、为什么离开，以及关键事实是否发生
   变化”。

这三个阶段不是新增三类 SEO 页面。Finder、Stack Audit、Trial 和 Watch 均属于登录后或交互式工作区，统一 `noindex,follow`；
只有经过审核、达到隐私阈值的聚合信号回流到现有工具详情、分类和 Guide。

## 二、不可改变的产品原则

- Evidence Ledger 是价格、功能、隐私、限制和来源事实的唯一真相源，不建立第二套事实库。
- 推荐结果不输出不透明的综合分。先执行确定性排除规则，再用 `best_fit / lower_cost / privacy_control` 三个角色解释排序。
- AI 只用于候选抽取、摘要草稿和异常提示；不能自行把 candidate 证据升级为 verified，也不能决定公开推荐。
- `unknown` 是合法状态。缺少隐私、导出或价格证据时必须显示未知，禁止 AI 猜测。
- 用户私有订阅、预算、敏感度、试用结果不进入公开页面；公开聚合必须满足审核、去身份化和最小人数阈值。
- 不为筛选条件、保存结果、用户任务或工具组合创建可索引 URL。

## 三、总体技术架构

### 数据流

```text
官方/独立/owner/用户来源
  -> product_intelligence_sources
  -> product_intelligence_claims (candidate -> verified)
  -> Decision Profile / Task Fit 派生读取
  -> Finder 的可解释推荐
  -> 私有 Stack / Trial 工作区
  -> 经审核的 Usage Report
  -> 满足阈值的公开聚合
  -> 现有 Tool Detail / Category / Guide
```

### 复用现有表

| 现有表                                 | 继续承担的职责                                   |
| -------------------------------------- | ------------------------------------------------ |
| `tools`                                | 工具实体、公开状态、分类、基础内容和索引发布状态 |
| `product_intelligence_profiles`        | 每个真实工具的情报档案                           |
| `product_intelligence_sources`         | 来源 URL、类型、抓取与核验时间                   |
| `product_intelligence_claims`          | claim 级事实、状态、冲突、适用范围和失效边界     |
| `product_intelligence_timeline_events` | 经人工确认的真实变化与无变化复核                 |
| `ratings` / `comments`                 | 原有星级和讨论；不直接等同于验证使用信号         |

### 新表命名与共同规范

- 主键统一 `UUID DEFAULT gen_random_uuid()`。
- 时间统一 `TIMESTAMPTZ`，金额使用 `NUMERIC(12,2)`，货币使用 ISO 4217 三位码。
- 枚举先用 `VARCHAR + CHECK`，避免 PostgreSQL enum 难以演进。
- 多语言编辑内容用 `JSONB`，内部状态和机器键使用英文标识。
- 用户私有表必须启用 RLS；匿名读取只允许来自安全聚合视图。
- 所有派生判断保存 `rules_version` 和引用的 `evidence_claim_ids`，保证可复现。
- 新迁移必须幂等，约束、索引和 policy 均使用存在性检查或先 drop 再 create。
- `tools`、`categories` 位于 Neon，决策表位于 Supabase；对应 UUID 只做逻辑引用，禁止伪造跨库 FK。服务端编辑写入前校验
  Neon 实体存在，claim 关联触发器同时校验证据所属工具。

## 四、阶段一：Task & Constraint Finder + Decision Card 2.0

### 用户流程

1. 用户从首页、Explore、分类页或工具页点击“按任务找工具”。
2. 选择任务、角色、团队规模、预算、必要集成、数据敏感度、是否要求自托管或可导出。
3. 系统先排除违反硬约束的工具，再返回最多三个：最适合、成本更低、隐私/控制更强。
4. 每项结果展示证据、已知限制、未知项和下一步比较，不只显示“推荐理由”。
5. 未登录用户结果只保存在浏览器会话；登录并主动保存后才写数据库。

### 表 1：`decision_tasks`

任务分类必须由编辑维护，首期只开放 6-8 个已有证据覆盖的任务。

| 字段                | 类型         | 约束 / 默认值           | 用途                             |
| ------------------- | ------------ | ----------------------- | -------------------------------- |
| `id`                | UUID         | PK                      | 任务 ID                          |
| `slug`              | VARCHAR(120) | UNIQUE NOT NULL         | 稳定机器键，不直接生成新 SEO URL |
| `name`              | JSONB        | NOT NULL                | `{en, cn}` 名称                  |
| `description`       | JSONB        | NOT NULL DEFAULT `{}`   | 用户可理解的任务定义             |
| `category_id`       | UUID         | nullable，Neon 逻辑引用 | 与现有分类的主关联               |
| `status`            | VARCHAR(20)  | `draft/active/archived` | 是否可用于 Finder                |
| `display_order`     | INTEGER      | DEFAULT 0               | 展示顺序                         |
| `constraint_schema` | JSONB        | DEFAULT `{}`            | 此任务需要显示的限制项配置       |
| `created_at`        | TIMESTAMPTZ  | DEFAULT NOW             | 创建时间                         |
| `updated_at`        | TIMESTAMPTZ  | DEFAULT NOW             | 更新时间                         |

索引：`UNIQUE(slug)`、`(status, display_order)`。

### 表 2：`tool_decision_profiles`

只保存编辑判断和证据派生摘要，不复制完整价格/隐私事实。

| 字段                 | 类型        | 约束 / 默认值                    | 用途                           |
| -------------------- | ----------- | -------------------------------- | ------------------------------ |
| `tool_id`            | UUID        | PK，Neon 逻辑引用                | 一工具一份决策档案             |
| `profile_version`    | INTEGER     | NOT NULL DEFAULT 1               | 数据结构版本                   |
| `setup_complexity`   | VARCHAR(20) | `low/medium/high/unknown`        | 上手复杂度                     |
| `setup_minutes_low`  | INTEGER     | nullable, >=0                    | 预计最短设置时间               |
| `setup_minutes_high` | INTEGER     | nullable, >= low                 | 预计最长设置时间               |
| `data_training_use`  | VARCHAR(20) | `no/opt_in/opt_out/yes/unknown`  | 用户数据是否训练模型           |
| `self_host_level`    | VARCHAR(20) | `full/partial/no/unknown`        | 自托管能力                     |
| `export_level`       | VARCHAR(20) | `full/limited/no/unknown`        | 数据可迁移能力                 |
| `decision_summary`   | JSONB       | NOT NULL DEFAULT `{}`            | 中英文简短判断                 |
| `watch_outs`         | JSONB       | NOT NULL DEFAULT `[]`            | 会影响选择的限制，不放通用文案 |
| `editorial_status`   | VARCHAR(20) | `draft/reviewed/published/stale` | 公开使用资格                   |
| `reviewed_at`        | TIMESTAMPTZ | nullable                         | 最近人工审核                   |
| `review_due_at`      | TIMESTAMPTZ | nullable                         | 下次复核                       |
| `reviewed_by`        | UUID        | nullable                         | 审核管理员                     |
| `created_at`         | TIMESTAMPTZ | DEFAULT NOW                      | 创建时间                       |
| `updated_at`         | TIMESTAMPTZ | DEFAULT NOW                      | 更新时间                       |

约束：`setup_minutes_high >= setup_minutes_low`；`published` 必须至少有一个 verified claim 引用并有 `reviewed_at`。

### 表 3：`tool_task_fits`

| 字段                            | 类型        | 约束 / 默认值                     | 用途                             |
| ------------------------------- | ----------- | --------------------------------- | -------------------------------- |
| `id`                            | UUID        | PK                                | 记录 ID                          |
| `tool_id`                       | UUID        | Neon 逻辑引用                     | 工具                             |
| `task_id`                       | UUID        | FK `decision_tasks(id)` CASCADE   | 任务                             |
| `fit_level`                     | VARCHAR(20) | `strong/conditional/weak/not_fit` | 任务适配等级                     |
| `rationale`                     | JSONB       | NOT NULL                          | 中英文适配理由                   |
| `required_conditions`           | JSONB       | DEFAULT `[]`                      | 成立条件，如团队规模、计划、平台 |
| `disqualifiers`                 | JSONB       | DEFAULT `[]`                      | 硬性不适合条件                   |
| `status`                        | VARCHAR(20) | `draft/reviewed/published/stale`  | 编辑状态                         |
| `reviewed_at` / `review_due_at` | TIMESTAMPTZ | nullable                          | 复核生命周期                     |
| `reviewed_by`                   | UUID        | nullable                          | 审核管理员                       |
| `created_at` / `updated_at`     | TIMESTAMPTZ | DEFAULT NOW                       | 时间戳                           |

唯一约束：`UNIQUE(tool_id, task_id)`。索引：`(task_id, status, fit_level)`。

### 表 4：`tool_relationships`

| 字段                            | 类型        | 约束 / 默认值                               | 用途             |
| ------------------------------- | ----------- | ------------------------------------------- | ---------------- |
| `id`                            | UUID        | PK                                          | 关系 ID          |
| `tool_id`                       | UUID        | Neon 逻辑引用                               | 当前工具         |
| `related_tool_id`               | UUID        | Neon 逻辑引用                               | 关联工具         |
| `relationship_type`             | VARCHAR(20) | `replaces/complements/overlaps/alternative` | 关系类型         |
| `rationale`                     | JSONB       | NOT NULL                                    | 为什么替代或配合 |
| `status`                        | VARCHAR(20) | `draft/reviewed/published/stale`            | 公开状态         |
| `reviewed_at` / `review_due_at` | TIMESTAMPTZ | nullable                                    | 复核时间         |
| `created_at` / `updated_at`     | TIMESTAMPTZ | DEFAULT NOW                                 | 时间戳           |

约束：`tool_id <> related_tool_id`；唯一键 `(tool_id, related_tool_id, relationship_type)`。互为替代不自动创建反向记录，
必须分别审核，避免理由不对称时产生假数据。

### 表 5：`decision_sessions`

只保存已登录且明确点击“保存”的 Finder 会话。

| 字段                        | 类型          | 约束 / 默认值                     | 用途                          |
| --------------------------- | ------------- | --------------------------------- | ----------------------------- |
| `id`                        | UUID          | PK                                | 会话 ID                       |
| `user_id`                   | UUID          | NOT NULL                          | 所有者，RLS 使用 `auth.uid()` |
| `task_id`                   | UUID          | FK decision_tasks                 | 任务                          |
| `role_key`                  | VARCHAR(60)   | nullable                          | 角色                          |
| `team_size_band`            | VARCHAR(20)   | `solo/2_10/11_50/51_plus/unknown` | 团队规模                      |
| `budget_min` / `budget_max` | NUMERIC(12,2) | nullable                          | 预算区间                      |
| `currency`                  | CHAR(3)       | DEFAULT `USD`                     | 预算货币                      |
| `budget_period`             | VARCHAR(20)   | `month/year/one_time`             | 预算周期                      |
| `integration_keys`          | TEXT[]        | DEFAULT `{}`                      | 必要集成                      |
| `data_sensitivity`          | VARCHAR(20)   | `low/medium/high/regulated`       | 数据敏感度                    |
| `self_host_required`        | BOOLEAN       | DEFAULT FALSE                     | 是否硬性自托管                |
| `export_required`           | BOOLEAN       | DEFAULT FALSE                     | 是否硬性导出                  |
| `status`                    | VARCHAR(20)   | `active/saved/archived`           | 生命周期                      |
| `rules_version`             | VARCHAR(40)   | NOT NULL                          | 推荐规则版本                  |
| `expires_at`                | TIMESTAMPTZ   | nullable                          | 私有数据保留边界              |
| `created_at` / `updated_at` | TIMESTAMPTZ   | DEFAULT NOW                       | 时间戳                        |

### 表 6：`decision_recommendations`

| 字段                    | 类型        | 约束 / 默认值                         | 用途                     |
| ----------------------- | ----------- | ------------------------------------- | ------------------------ |
| `id`                    | UUID        | PK                                    | 推荐 ID                  |
| `session_id`            | UUID        | FK decision_sessions CASCADE          | 所属会话                 |
| `tool_id`               | UUID        | Neon 逻辑引用                         | 被推荐工具               |
| `recommendation_role`   | VARCHAR(30) | `best_fit/lower_cost/privacy_control` | 三个可解释位置           |
| `rank_order`            | SMALLINT    | 1-3                                   | 固定最多 3 个            |
| `matched_conditions`    | JSONB       | DEFAULT `[]`                          | 满足条件                 |
| `unresolved_unknowns`   | JSONB       | DEFAULT `[]`                          | 未知信息                 |
| `disqualifiers_checked` | JSONB       | DEFAULT `[]`                          | 已执行的排除规则         |
| `input_snapshot`        | JSONB       | NOT NULL                              | 生成时输入快照，便于复现 |
| `rules_version`         | VARCHAR(40) | NOT NULL                              | 规则版本                 |
| `created_at`            | TIMESTAMPTZ | DEFAULT NOW                           | 生成时间                 |

唯一约束：`(session_id, recommendation_role)` 和 `(session_id, rank_order)`。

### 表组 6A：证据关联表

Review 后不使用 UUID 数组保存证据引用，因为数组无法建立外键，也无法可靠发现悬空 claim。改为以下结构一致的关联表：

| 表                               | 主体外键                                            | 其他字段                                                                           |
| -------------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `tool_decision_profile_claims`   | `tool_id -> tool_decision_profiles(tool_id)`        | `claim_id -> product_intelligence_claims(id)`、`purpose VARCHAR(40)`、`created_at` |
| `tool_task_fit_claims`           | `fit_id -> tool_task_fits(id)`                      | 同上                                                                               |
| `tool_relationship_claims`       | `relationship_id -> tool_relationships(id)`         | 同上                                                                               |
| `decision_recommendation_claims` | `recommendation_id -> decision_recommendations(id)` | `claim_id`、`claim_snapshot JSONB NOT NULL`、`created_at`                          |

每张表主键为 `(主体外键, claim_id, purpose)`，`purpose` 限制为
`fit/cost/setup/privacy/export/replacement/limitation/other`。前三张表只允许关联当前有效的 verified claim；推荐关联额外
保存生成时快照，用于解释历史推荐，但读取当前页面时仍需提示该 claim 后续是否 stale、superseded 或 invalidated。

### 阶段一页面与组件

- `/[locale]/find-tools`：Finder，`noindex,follow`，无 query 组合 canonical。
- `/[locale]/profile/decisions`：已保存结果，登录后，`noindex,follow`。
- `DecisionCardV2`：现有工具详情内嵌模块，不新增详情 URL。
- `ConstraintSummary`：明确匹配、未知和硬冲突。
- `EvidencePopover`：只读取 verified 且有效的 claim。
- 后台 `/admin/decision/tasks`、`/admin/tools/[id]/decision`：任务与适配审核。

### 阶段一任务表

| ID     | 优先级 | 任务                       |   预计 | 验收                                                         |
| ------ | ------ | -------------------------- | -----: | ------------------------------------------------------------ |
| DCF-01 | P0     | 新表、约束、索引、RLS 迁移 |   1 天 | 已完成；生产 10 表可读，跨用户 RLS 已启用                    |
| DCF-02 | P0     | Evidence Ledger 派生读取层 |   1 天 | 已完成；stale/冲突/未核验 claim 不参与判断且保留解释 trace   |
| DCF-03 | P0     | 确定性规则引擎与解释 trace |   1 天 | 已完成；相同输入和版本结果一致，硬约束优先且最多 3 项         |
| DCF-04 | P1     | Finder UI 与匿名本地状态   |   1 天 | 已完成；匿名仅存浏览器，任务字段、中间态、成功/错误态完整     |
| DCF-05 | P1     | Decision Card 2.0          |   1 天 | 已完成；七类判断逐字段绑定有效证据，无证据明确未知，未发布 profile 自动回退旧卡 |
| DCF-06 | P1     | 后台任务、fit、关系审核    |   1 天 | 已完成；统一审核队列、人工状态机、证据发布门禁与操作中间态已落地 |
| DCF-07 | P0     | SEO 与自动验收             | 0.5 天 | 无新增 sitemap URL；metadata/robots/build 通过               |

`DCF-05` 发布保护：新版卡片只消费 `DCF-02` 严格读取层中已核验、无冲突、未失效且未到期的 claim；
`cost/setup/privacy/export/limitation/replacement` 不得跨用途借用。工具尚无 published profile、profile 到期或证据服务不可用时，
详情页继续显示原有判断卡，不输出空洞的批量“未知”模块。专项契约测试、Finder 回归、TypeScript 和完整生产 build 均已通过。

`DCF-06` 后台入口为 `/[locale]/admin/decision`。任务与 profile/fit/relationship 分队列展示；后者只允许
`draft → reviewed → published → stale → reviewed` 的受控路径，禁止 `draft → published`。应用层发布前检查人工复核时间和
证据关联数量，数据库继续以 verified、无冲突、未失效、未到期 claim 触发器作为最终门禁。专项状态机测试、定向 lint、
TypeScript 和完整生产 build 均已通过。

## 五、阶段二：AI Stack Audit + 7-Day Trial Scorecard

### 用户流程

1. 用户建立自己的 AI Stack，可关联目录工具，也可暂存未收录工具名称。
2. 填写真实账单、主要任务、使用频率和续费日；平台不从公开标价推断用户账单。
3. 审计输出 `Keep / Replace / Remove / Missing`，每条都显示原因和证据，不自动替用户取消订阅。
4. 用户为候选工具开启 7 天试用，定义 3-5 个真实任务和通过标准。
5. 到期前提醒，用户记录结果并选择保留、取消、继续比较。

### 表 7：`user_tool_stack_items`

| 字段                        | 类型          | 约束 / 默认值                       | 用途               |
| --------------------------- | ------------- | ----------------------------------- | ------------------ |
| `id`                        | UUID          | PK                                  | 栈项目 ID          |
| `user_id`                   | UUID          | NOT NULL                            | RLS 所有者         |
| `tool_id`                   | UUID          | FK tools nullable                   | 已收录工具         |
| `custom_tool_name`          | VARCHAR(200)  | nullable                            | 未收录工具临时名   |
| `custom_tool_url`           | VARCHAR(1200) | nullable                            | 未收录工具官网     |
| `subscription_status`       | VARCHAR(20)   | `trial/free/paid/cancelled`         | 用户真实状态       |
| `monthly_cost`              | NUMERIC(12,2) | nullable                            | 用户折算后的月成本 |
| `currency`                  | CHAR(3)       | DEFAULT `USD`                       | 账单货币           |
| `billing_period`            | VARCHAR(20)   | `month/year/usage/one_time/unknown` | 原账单周期         |
| `usage_frequency`           | VARCHAR(20)   | `daily/weekly/monthly/rarely/never` | 使用频率           |
| `data_sensitivity`          | VARCHAR(20)   | nullable                            | 用户使用环境       |
| `started_at` / `renews_at`  | TIMESTAMPTZ   | nullable                            | 开始与续费         |
| `cancel_reminder_at`        | TIMESTAMPTZ   | nullable                            | 取消提醒           |
| `notes`                     | TEXT          | nullable                            | 私有备注           |
| `created_at` / `updated_at` | TIMESTAMPTZ   | DEFAULT NOW                         | 时间戳             |

约束：`tool_id` 与 `custom_tool_name` 至少一个非空；用户输入不得写回 `tools` 或 Evidence Ledger。

关联表 `user_tool_stack_item_tasks`：`stack_item_id` FK、`task_id`
FK、`is_primary BOOLEAN DEFAULT FALSE`、`created_at`，主键 `(stack_item_id, task_id)`。这样任务归档、合并和审计统计都有
数据库完整性，不使用 `primary_task_ids` 数组。

### 表 8：`stack_audit_runs`

| 字段                          | 类型        | 约束 / 默认值                      | 用途                 |
| ----------------------------- | ----------- | ---------------------------------- | -------------------- |
| `id`                          | UUID        | PK                                 | 审计 ID              |
| `user_id`                     | UUID        | NOT NULL                           | 所有者               |
| `status`                      | VARCHAR(20) | `pending/running/completed/failed` | 执行状态             |
| `input_snapshot`              | JSONB       | NOT NULL                           | 当时的 Stack 快照    |
| `summary`                     | JSONB       | DEFAULT `{}`                       | 成本、重叠和缺口摘要 |
| `rules_version`               | VARCHAR(40) | NOT NULL                           | 规则版本             |
| `failure_code`                | VARCHAR(80) | nullable                           | 可诊断错误码         |
| `created_at` / `completed_at` | TIMESTAMPTZ | nullable                           | 时间                 |

### 表 9：`stack_audit_findings`

| 字段                        | 类型          | 约束 / 默认值                     | 用途               |
| --------------------------- | ------------- | --------------------------------- | ------------------ |
| `id`                        | UUID          | PK                                | 发现 ID            |
| `audit_id`                  | UUID          | FK stack_audit_runs CASCADE       | 所属审计           |
| `stack_item_id`             | UUID          | FK user_tool_stack_items SET NULL | 当前订阅           |
| `finding_type`              | VARCHAR(20)   | `keep/replace/remove/missing`     | 建议类型           |
| `related_tool_id`           | UUID          | FK tools nullable                 | 替代或缺失候选     |
| `rationale`                 | JSONB         | NOT NULL                          | 可解释理由         |
| `estimated_monthly_savings` | NUMERIC(12,2) | nullable                          | 基于用户输入的估算 |
| `currency`                  | CHAR(3)       | nullable                          | 货币               |
| `confidence_state`          | VARCHAR(20)   | `supported/partial/unknown`       | 不是百分比分数     |
| `created_at`                | TIMESTAMPTZ   | DEFAULT NOW                       | 时间               |

关联表 `stack_audit_finding_claims`：`finding_id` FK、`claim_id`
FK、`claim_snapshot JSONB NOT NULL`、`purpose`、`created_at`，主键 `(finding_id, claim_id, purpose)`。审计快照保留当时依
据，当前 UI 同时显示证据是否已变化。

### 表 10：`trial_scorecards`

| 字段                        | 类型        | 约束 / 默认值                        | 用途       |
| --------------------------- | ----------- | ------------------------------------ | ---------- |
| `id`                        | UUID        | PK                                   | 试用 ID    |
| `user_id`                   | UUID        | NOT NULL                             | 所有者     |
| `tool_id`                   | UUID        | FK tools                             | 试用工具   |
| `decision_session_id`       | UUID        | FK decision_sessions nullable        | 来源决策   |
| `status`                    | VARCHAR(20) | `planned/active/completed/cancelled` | 生命周期   |
| `target_outcome`            | TEXT        | NOT NULL                             | 试用目标   |
| `started_at` / `ends_at`    | TIMESTAMPTZ | NOT NULL                             | 试用窗口   |
| `renewal_at`                | TIMESTAMPTZ | nullable                             | 续费风险点 |
| `final_decision`            | VARCHAR(20) | `undecided/keep/cancel/compare`      | 最终决定   |
| `private_notes`             | TEXT        | nullable                             | 私有备注   |
| `created_at` / `updated_at` | TIMESTAMPTZ | DEFAULT NOW                          | 时间戳     |

### 表 11：`trial_scorecard_checks`

| 字段                            | 类型        | 约束 / 默认值                       | 用途           |
| ------------------------------- | ----------- | ----------------------------------- | -------------- |
| `id`                            | UUID        | PK                                  | 检查项 ID      |
| `scorecard_id`                  | UUID        | FK trial_scorecards CASCADE         | 所属试用       |
| `sequence`                      | SMALLINT    | 1-20                                | 顺序           |
| `label`                         | TEXT        | NOT NULL                            | 真实任务或指标 |
| `metric_type`                   | VARCHAR(20) | `boolean/time/count/quality/manual` | 指标类型       |
| `target_value` / `actual_value` | JSONB       | nullable                            | 目标与实际     |
| `result`                        | VARCHAR(20) | `pending/pass/fail/skipped`         | 结果           |
| `completed_at`                  | TIMESTAMPTZ | nullable                            | 完成时间       |

唯一约束：`(scorecard_id, sequence)`。

### 阶段二页面与任务

- `/profile/stack`、`/profile/stack/audits/[id]`、`/profile/trials/[id]` 全部登录后且 noindex。
- 所有保存、运行、完成按钮必须有同步中/成功/失败三态，失败展示稳定错误码。
- 提醒首期复用站内 notification；邮件提醒只有在用户单独同意后启用。

| ID     | 优先级 | 任务                              |   预计 | 验收                                     |
| ------ | ------ | --------------------------------- | -----: | ---------------------------------------- |
| STK-01 | P1     | 私有 Stack、Audit、Trial 表与 RLS |   1 天 | 所有权测试通过                           |
| STK-02 | P1     | Stack 编辑与成本规范化            |   1 天 | 年/月/usage 原始周期可追溯               |
| STK-03 | P1     | Keep/Replace/Remove/Missing 规则  |   1 天 | 每项有 rationale 和 evidence state       |
| STK-04 | P1     | 7 日 Scorecard 与提醒             | 1.5 天 | 任务、目标、结果、续费提醒闭环           |
| STK-05 | P1     | 中间态、空态和失败恢复            | 0.5 天 | 重试不重复写入                           |
| STK-06 | P0     | 隐私、SEO 与发布验收              | 0.5 天 | 私有 URL 不在 sitemap，跨用户 403/空结果 |

## 六、阶段三：Verified Usage Signals + Pricing / Change Watch

### 表 12：`verified_usage_reports`

不复用 `ratings`，因为“使用多久、做什么任务、是否留下”与星级是不同信号。

| 字段                            | 类型        | 约束 / 默认值                            | 用途                     |
| ------------------------------- | ----------- | ---------------------------------------- | ------------------------ |
| `id`                            | UUID        | PK                                       | 报告 ID                  |
| `user_id`                       | UUID        | NOT NULL                                 | 提交者，公开不暴露       |
| `tool_id`                       | UUID        | FK tools CASCADE                         | 工具                     |
| `task_id`                       | UUID        | FK decision_tasks                        | 使用任务                 |
| `usage_duration_band`           | VARCHAR(20) | `lt_7d/7_30d/1_3m/3_12m/gt_1y`           | 使用时长                 |
| `usage_frequency`               | VARCHAR(20) | `daily/weekly/monthly/rarely`            | 使用频率                 |
| `access_type`                   | VARCHAR(20) | `free/trial/paid/company`                | 使用方式                 |
| `outcome`                       | VARCHAR(20) | `kept/cancelled/replaced/evaluating`     | 是否留下                 |
| `reason_codes`                  | TEXT[]      | NOT NULL                                 | 结构化原因               |
| `replacement_tool_id`           | UUID        | FK tools nullable                        | 替换对象                 |
| `experience_note`               | TEXT        | nullable                                 | 限长的补充说明           |
| `affiliation`                   | VARCHAR(20) | `none/customer/owner/employee/affiliate` | 利益关系披露             |
| `verification_method`           | VARCHAR(30) | `account/history/manual/none`            | 验证方法，不暗示身份核验 |
| `moderation_status`             | VARCHAR(20) | `pending/approved/rejected/flagged`      | 审核状态                 |
| `moderated_by`                  | UUID        | nullable                                 | 审核人                   |
| `moderation_note`               | TEXT        | nullable                                 | 审核原因                 |
| `submitted_at` / `published_at` | TIMESTAMPTZ | nullable                                 | 时间                     |
| `updated_at`                    | TIMESTAMPTZ | DEFAULT NOW                              | 更新时间                 |

唯一约束：首期 `(user_id, tool_id, task_id)` 一条活动报告，允许更新而不是重复刷量。公开前过滤 owner/employee/affiliate
或单独展示披露，不与独立用户混算。

### 表 13：`tool_watch_subscriptions`

| 字段                        | 类型        | 约束 / 默认值                | 用途                                                |
| --------------------------- | ----------- | ---------------------------- | --------------------------------------------------- |
| `id`                        | UUID        | PK                           | 订阅 ID                                             |
| `user_id`                   | UUID        | NOT NULL                     | 所有者                                              |
| `tool_id`                   | UUID        | FK tools CASCADE             | 关注工具                                            |
| `event_types`               | TEXT[]      | 非空                         | `pricing/free_limit/api/privacy/status/export` 子集 |
| `channel`                   | VARCHAR(20) | `in_app/email`               | 通知渠道                                            |
| `status`                    | VARCHAR(20) | `active/paused/unsubscribed` | 状态                                                |
| `last_notified_at`          | TIMESTAMPTZ | nullable                     | 去重游标                                            |
| `created_at` / `updated_at` | TIMESTAMPTZ | DEFAULT NOW                  | 时间戳                                              |

唯一约束：`(user_id, tool_id, channel)`。

### 公开聚合视图：`tool_usage_signal_summary`

建议用普通 view 起步，数据量达到需要时再改 materialized view。

字
段：`tool_id`、`task_id`、`approved_distinct_users`、`kept_count`、`cancelled_count`、`replaced_count`、`top_reason_codes`、`latest_signal_at`。
只有 `approved_distinct_users >= 3` 才允许匿名公开读取；低于阈值时工具页显示“尚无足够信号”，不显示 1/1 之类可识别结果。

Change Watch 直接消费 `product_intelligence_timeline_events`，不创建重复的 change 表。只有 `visibility=public` 且事件类
型匹配订阅时才能通知。

### 阶段三任务表

| ID     | 优先级 | 任务                         |   预计 | 验收                             |
| ------ | ------ | ---------------------------- | -----: | -------------------------------- |
| SIG-01 | P1     | Usage Report 表、RLS、反滥用 |   1 天 | 一人一工具一任务；限流与审核有效 |
| SIG-02 | P1     | 结构化提交与利益披露 UI      |   1 天 | 不用通用五星替代真实使用信息     |
| SIG-03 | P1     | 审核与公开聚合               |   1 天 | 少于 3 人绝不公开比例            |
| WAT-01 | P1     | Watch 订阅与 timeline 消费   |   1 天 | 不因 candidate diff 发送通知     |
| WAT-02 | P1     | 站内/邮件去重和退订          |   1 天 | 同一事件不重复；一键暂停/退订    |
| SIG-04 | P0     | 安全、隐私、SEO 与自动验收   | 0.5 天 | 匿名只能读聚合；不新增索引 URL   |

## 七、跨阶段状态机

### 编辑数据

```text
draft -> reviewed -> published -> stale
  ^          |           |          |
  +----------+-----------+----------+
```

- `published` 必须有人工审核时间和有效 evidence claim。
- 到 `review_due_at` 只进入 `stale`/待复核，不自动改写事实。
- stale 数据不能参与硬排除或绝对性结论，只能显示“需复核”。

### 用户报告

```text
pending -> approved -> flagged
   |          |
   +-> rejected
```

- 内容更新后重新回到 pending。
- owner/employee/affiliate 报告可以发布但必须披露，不能计入独立用户聚合。

### 审计运行

```text
pending -> running -> completed
                 -> failed -> running (显式重试)
```

- 使用 idempotency key 防止用户连续点击产生重复审计。
- failed 保存稳定 `failure_code`，不保存敏感堆栈到客户端。

## 八、权限与隐私

| 数据                                     | 匿名           | 登录用户                               | 管理员 / 服务端            |
| ---------------------------------------- | -------------- | -------------------------------------- | -------------------------- |
| 已 published 的任务/fit/relationship     | 只读           | 只读                                   | 审核与维护                 |
| decision session / stack / trial / watch | 禁止           | 仅本人 CRUD                            | 必要运维读取，记录审计日志 |
| usage report 原始记录                    | 禁止           | 仅本人读写自己的 pending/approved 内容 | 审核                       |
| usage 聚合                               | 达到阈值后只读 | 达到阈值后只读                         | 全量                       |
| candidate/冲突/stale evidence            | 禁止           | 禁止                                   | 后台审核                   |

隐私默认：不保存匿名 Finder 输入；私有工作区支持删除；日志不得记录预算、备注正文或完整 input snapshot；邮件通知必须单独
opt-in。

## 九、方案 Review 与修订记录

以下问题在初稿 Review 中被发现，并已反映到上述最终设计：

| 初稿问题                                | 风险                     | 最终修订                                                                     |
| --------------------------------------- | ------------------------ | ---------------------------------------------------------------------------- |
| Decision Profile 重复保存价格、隐私事实 | 两套事实漂移             | 只保存派生摘要并强制引用 verified claim IDs                                  |
| 用 UUID 数组保存 claim / task 关系      | 无法建立 FK，容易悬空    | 改为 5 张 claim 关联表和 1 张 Stack-Task 关联表；历史推荐保留 claim snapshot |
| 用综合 score 排名                       | 不透明且容易被商业化污染 | 改为硬约束过滤 + 三个解释角色，不公开总分                                    |
| 匿名 Finder 全量入库                    | 隐私和垃圾数据           | 匿名仅本地保存，登录且主动保存才落库                                         |
| 一次建立大量 task                       | 冷启动空数据、URL 膨胀   | 首期 6-8 个任务，全部不生成新索引 URL                                        |
| 用户报告直接公开                        | 刷量、诽谤、隐私         | 强制审核、利益披露、至少 3 名独立用户再聚合                                  |
| Change Watch 新建变化事实表             | 与 Timeline 冲突         | 直接消费现有已确认 timeline event                                            |
| 把标价当作用户真实成本                  | 年付、席位、用量误导     | 分开官方 claim 和用户账单；展示折算假设                                      |
| AI 自动生成并发布推荐                   | 幻觉和来源不可追踪       | AI 只写草稿；发布必须确定性规则和人工证据门槛                                |
| 新工作区可能成为 SEO 页面农场           | 稀释当前目录主题         | 全部 noindex、无 query canonical、无 sitemap 条目                            |
| 三阶段同时开工                          | 范围过大、难定位回归     | 必须按阶段 gate 发布，前一阶段通过生产验收再开下一阶段                       |

Review 结论：修订后方案与现有 Evidence Ledger、索引收口和目录定位兼容。最大剩余风险不是技术，而是冷启动证据覆盖；因此阶
段一先用 10 个已有核心工具和 6-8 个任务验证，不允许空数据时用 AI 文案填满界面。

## 十、最终执行顺序

1. 先完成 SEO 架构 P0 修复与门禁，避免在错误 canonical 基础上开发新模块。
2. 执行 DCF-01 至 DCF-07；生产观察不少于 7 天。
3. Finder 的完成率、结果点击和证据展开可读后，再执行 STK-01 至 STK-06。
4. Stack/Trial 至少有 10 个真实用户或 3 个内部真实产品完整使用后，再执行 SIG/WAT。
5. 每个任务完成后同时更新本文状态和 `MASTER_OPTIMIZATION_TRACKER_CN.md`，禁止只更新其中一份。
