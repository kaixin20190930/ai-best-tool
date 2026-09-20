# MEASURE-02：决策数据治理与 Pilot 边界

日期：2026-09-20

状态：`MIGRATED / PREFLIGHT_BLOCKED / DISABLED`（两份生产迁移与最小权限验证已完成；业务数据和运行门禁未满足，未接 UI、未开启生产采集、未启动 Pilot）

上位契
约：[MEASURE-01 决策事件隐私基础层](./MEASURE_01_DECISION_EVENT_FOUNDATION_CN.md)、[PH0-01 产品假设与指标审计](./PH0_01_PRODUCT_HYPOTHESES_METRICS_AUDIT_CN.md)。
本单元不新增 URL，不修改页面、metadata、canonical、hreflang、robots、schema 或 sitemap。

## 1. 已确定的保留期

| 数据层              | 保留期 | 原因                                | 到期动作                                                             |
| ------------------- | -----: | ----------------------------------- | -------------------------------------------------------------------- |
| 原始 allowlist 事件 |  35 天 | 覆盖完整 28 天判断窗和 7 天审计缓冲 | 先形成无访客标识的日级聚合，再删除原始行；每日执行，最大延迟 24 小时 |
| 日级聚合            | 400 天 | 支持同周期、季节性和 GSC 长周期对照 | 到期删除；不含 flow hash、用户 ID、URL、UA、IP、referrer 或自由文本  |
| 操作审计            |  90 天 | 核对清理是否按期运行                | 只保存执行时间、窗口、状态代码和行数；不保存错误文本或用户数据       |

`20260920_decision_metric_governance.sql` 只提供受控 rollup/清理函数与汇总读取函数，已于 2026-09-20 在生产执行。生产调度必须每天运
行；上次成功清理超过 48 小时即停止 Pilot 并告警，不能继续采集后假装保留期有效。

## 2. 权限矩阵

| 主体            | 原始事件     | 日级聚合     | 操作审计     | 允许动作                                        |
| --------------- | ------------ | ------------ | ------------ | ----------------------------------------------- |
| `anon` / 浏览器 | 无           | 无           | 无           | 不得直接读写                                    |
| `authenticated` | 无           | 无           | 无           | 登录本身不授予分析数据权限                      |
| 生产事件接收层  | 仅 insert    | 无           | 无           | 通过既有 server action 和 service role 最小写入 |
| 保留期作业      | 无直接表权限 | 无直接表权限 | 无直接表权限 | 仅调用 `maintain_decision_metric_events`        |
| 后台汇总读取    | 无原始行读取 | 仅受控汇总   | 无           | 仅调用 `read_decision_metric_daily_summary`     |

汇总只统计 `traffic_quality=human`。单个日/事件/locale/surface 少于 20 个唯一 human flow 时只返回 `insufficient_data`，
计数和比例均不返回。当前不提供原始行后台页面或临时“方便调试”授权；如未来确需 break-glass，必须另立限时审批和审计，不能复
用本迁移扩大权限。

## 3. 内部流量规则

1. preview、localhost/test、health/monitor 和已知 bot 继续在写入前丢弃。
2. 后台/员工登录身份只可在请求时瞬时判断并排除，不写入用户 ID、邮箱或角色。
3. 非后台人工测试使用随机短期 token；服务端只配置 SHA-256 哈希。token 每 30 天轮换，旧 token 与新 token 最多重叠 24 小
   时。
4. 禁止 IP allowlist、设备指纹、持久 session ID 或分析 cookie 作为内部流量规则。
5. `unknown` 可以保留用于质量诊断，但不得进入主指标、成功结论或百分比。

本单元不新增 token 签发 endpoint。Pilot 激活前由 Owner 在受控渠道签发、保存和轮换；token 原值不得进入仓库或日志。

## 4. Pilot 页面

首个受控任务簇定为“会议记录与会后行动”，Pilot ID 为 `meeting-follow-up-v1`，任务 slug 候选为 `meeting-notes`。这是一
项**操作选择**，不是声称评分模型已得到完整生产数据证明。

| 页面                                 | 角色                     | 激活前要求                                         |
| ------------------------------------ | ------------------------ | -------------------------------------------------- |
| `/find-tools`                        | 漏斗入口和分母           | 路由可访问；数据库存在 active `meeting-notes` 任务 |
| `/ai/fathom`                         | 已有曝光与 Evidence 样本 | published 实体；至少一条有效 verified evidence     |
| `/ai/otter-ai`                       | 同任务簇成熟工具         | published 实体；至少一条有效 verified evidence     |
| `/ai/fireflies`                      | 同任务簇对照工具         | published 实体；至少一条有效 verified evidence     |
| `/guides/ai-tools-for-meeting-notes` | 已有任务型引导页         | 路由可访问；至少一条可验证决策证据                 |

注册表只是 allowlist，不改变页面索引状态。任一页面不存在、实体未发布或 verified evidence 不足时，preflight 必须返回具体
blocker；不得降级为“先采集再补证据”，也不得用新增页面绕过。

## 5. Pilot 启动门禁

以下条件必须同时满足，缺一项继续关闭：

1. MEASURE-01 与 MEASURE-02 两份迁移已由 Owner 在 Supabase 执行并完成只读验证。
2. 每日保留期作业、失败告警和服务端聚合读取已配置，且无浏览器直连。
3. 内部流量 token 已签发，轮换责任人与日期已登记；bot 规则完成当日复核。
4. `meeting-notes` active task、页面实体和 verified evidence 通过生产只读 preflight。
5. 事件 UI 接入另行开发并通过独立 QA；当前代码没有接入。
6. 环境变量显式配置 35 天保留期并开启前，再做一次隐私、SEO 与 production smoke。

在上述条件完成前，`DECISION_EVENT_COLLECTION_ENABLED` 必须保持关闭。迁移存在、页面存在或测试通过都不等于 Pilot 已启动。

## 6. 自动验收

- `pnpm run test:measure-02-governance`：保留期常量、20-flow 阈值、Pilot allowlist、缺实体/证据 blocker、SQL RLS/授权与
  敏感字段边界。
- `pnpm run test:decision-events`：继承 MEASURE-01 的 payload、PII、流量分类、HMAC 和默认关闭测试。
- `pnpm run typecheck:decision-events`、目标 lint、`test:seo-architecture`、`test:plan-consistency` 和完整 build。

## 7. 仍需 Owner 执行的生产动作

1. 配置每日保留期作业和 48 小时陈旧告警。
2. 配置 service-role 接收/维护/汇总运行环境及内部 token 哈希；不得提交 token 原值。
3. 创建或发布 active `meeting-notes` 任务，并补齐 Fathom、Otter.ai、Fireflies 和会议指南的 verified decision evidence；Fireflies 还缺生产 published 实体。
4. 等后续 UI 接入和独立验收完成后，才决定是否开启采集。

## 8. 验收记录

- 开发提交：`04d81ecf`；QA 定点修复：`74c93549`。
- 首轮独立 QA 发现完整自然日覆盖、调用者可控清理时钟、失败路径审计清理和缺失证据 fail-open 四项 P1；均已修复。
- 同一 QA 复验结论：`QA_PASS`，P0/P1 均为 0。
- 目标 ESLint、MEASURE-01/02 专项测试、冻结测试、专项与全仓 TypeScript、SEO 架构、计划一致性和完整 build 全部通过；build 完成 43/43 静态页面。
- 2026-09-20 两份 SQL 已在生产项目 `qqpbdzvidcgkmtbleqnl` 按顺序执行；原始事件、日聚合和操作审计三张表均拒绝 service-role 直接读取，受控汇总 RPC 可调用且返回 0 行。
- 同日生产只读 preflight 确认 5 个 allowlist 路由均为 200，Fathom 与 Otter.ai 为 published 实体；但 `meeting-notes` active task、三个工具的 verified decision evidence、会议指南证据和 Fireflies published 实体缺失。每日清理调度与内部流量 token 也未配置，故状态为 `PREFLIGHT_BLOCKED / DISABLED`，不能开启采集或声称 Pilot 已启动。
