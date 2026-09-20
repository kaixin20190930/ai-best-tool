# PH0-01 产品假设、能力与指标审计

日期：2026-09-19

状态：`DEV_READY`（PH0-01 仅审计与指标契约已完成；未写生产数据、未启动 Pilot）

上位计划：[收录与搜索质量主计划](./MASTER_OPTIMIZATION_TRACKER_CN.md)
关联规格：[三阶段实施方案](./DECISION_PLATFORM_THREE_PHASE_IMPLEMENTATION_CN.md)、[自动验收](./DECISION_PLATFORM_AUTOMATED_ACCEPTANCE_CN.md)、[SEO 护栏](./SEO_INFORMATION_ARCHITECTURE_GUARDRAILS_CN.md)

## 1. 审计边界与证据规则

本文件的“已有”只表示仓库中存在可定位的代码、迁移或测试；**不**表示生产已有足够样本、已合规或可用于本轮产品决策。未执行生产查询，不把代码路径推断为真实数据量。

- 审计范围：Finder、Decision Card、Guide、comparison、Evidence Ledger、Change Timeline、Stack/Trial 与 analytics 的实现和数据库迁移。
- 冻结：不新增 URL，不修改 metadata、canonical、hreflang、robots、schema、sitemap，不实施 PUB-04，不写数据库，不新增 cookie 或真实分析事件。
- 隐私底线：本 PH0 的新事件只允许受控枚举和聚合计数；不得传输 PII、自由文本、预算、角色自由输入、任务备注、完整 URL query、证据摘录、user ID、IP、UA、referrer 或稳定跨站标识。

## 2. 六个产品假设与当前能力审计

| 假设 | 可计算的判定 | 结论 | 仓库证据 | 缺口 / 下一步 |
| --- | --- | --- | --- | --- |
| H1 访客愿意从“任务”开始而非只浏览目录 | `task_start / find_tools_view`；同一匿名会话或登录日内的唯一启动率 | **Partially Exists** | `app/[locale]/(with-footer)/find-tools/page.tsx` 与 `components/decision/DecisionFinder.tsx` 已提供任务入口和本地状态；`decision_tasks` 在 `20260902_decision_finder_foundation.sql` 定义 | 没有 `find_tools_view` 或 `task_start` 事件，不能计算。 |
| H2 明确限制能帮助系统给出可解释结果 | `task_results_shown / task_start`，并按是否至少选择一项结构化限制分层；`task_zero_result / task_start` | **Partially Exists** | `DecisionFinder.tsx` 收集限制、调用 `runDecisionFinderAction`；`app/actions/decision.ts` 调用确定性 `runDecisionRules`；`scripts/test-decision-finder-rules.ts` 是规则测试 | 结果和零结果没有埋点；当前 `roleKey` 是自由输入，绝不能进入新事件。 |
| H3 返回的 shortlist 足以推动下一步核查 | `tool_detail_open / task_results_shown`，同一次结果展示后 30 分钟内、同一 `result_id` 去重 | **Partially Exists** | Finder 每次最多 3 个结果；工具详情页已嵌入 `DecisionCardV2`；`PageViewTracker.tsx` 对工具详情可写 `page_view` | 现有 page view 未携带 Finder 结果关联，且并非只由 shortlist 导致；需新事件才可归因。 |
| H4 证据与并排比较能降低不确定性 | `evidence_open / tool_detail_open`、`comparison_open / tool_detail_open`；只衡量打开，不把它解释成满意度 | **Partially Exists** | `EvidenceLedgerPanel.tsx` 与 `ChangeTimelinePanel.tsx` 只渲染已核验/公开数据；`TrackableCompareLink.tsx` 写 legacy `compare_click` | Evidence 的 `<details>` 展开没有事件；legacy `compare_click` 是点击，不等于 comparison 页面成功打开，也没有来源页面/实验字段。 |
| H5 用户会保存或进入私有决策工作区 | `decision_saved / task_results_shown`；仅计已登录、显式成功保存的唯一决策 | **Missing** | 迁移中有 `decision_sessions` / `decision_recommendations`；Stack/Trial 有 `user_tool_stack_items`、`stack_audit_runs`、`trial_scorecards` | 当前 Finder 只写 localStorage，`runDecisionFinderAction` 不创建 session；没有“保存决定”的 UI/事件，不能拿表存在冒充转化。 |
| H6 核验后会走向官方下一步 | `official_site_click / tool_detail_open`；每工具、会话、30 分钟去重 | **Needs Refactor** | `TrackableLink.tsx` 写 legacy `tool_click`；工具详情调用该组件；`TrackableCtaLink.tsx` 有 CTA 的 href 元数据 | `tool_click` 没有 destination / `is_official` / 来源页面；CTA 不保证是官网，不能复用为官方跳转指标。 |

**Keep As-Is：** Evidence Ledger 的 verified-only 展示、Change Timeline 的 public/editorially-confirmed 展示、Finder 的匿名 localStorage 以及 Stack/Trial 的私有 RLS 路线，均符合现行产品与隐私边界。
**Already Exists：** 没有一个目标命名事件可标为 Already Exists；这是审计结论，不是实现建议。

## 3. 现有埋点复用矩阵（事实与限制）

| 当前事件 / 数据 | 写入证据 | 可复用的事实 | 不能声称 / 处理结论 |
| --- | --- | --- | --- |
| `page_view` | `components/analytics/PageViewTracker.tsx` -> `app/api/analytics/page-view/route.ts` | 页面路径、页面类型、可选 `tool_id`；同一路径/工具在组件生命周期内避免重复发送 | 路由会设置 `abt_session_id`，并写 UA/referrer；无 bot 或内部流量过滤。不可直接作为无 cookie 的新漏斗分母；只能作历史流量诊断。 |
| `tool_click` | `components/TrackableLink.tsx` -> `trackToolClick` | 部分外链工具点击可写 `tool_id` | 没有 destination、官方性、来源页面、去重或 bot/internal 排除；不能等同 `official_site_click`。 |
| `compare_click` | `components/TrackableCompareLink.tsx` -> `trackComparisonClick` | 部分 comparison 链接可写 `tool_id` 和 `compareHref` | 是 click 而非 destination page open；缺少来源 page、会话口径和去重；不能直接作为 `comparison_open`。 |
| `cta_click` | `components/analytics/TrackableCtaLink.tsx` -> `trackCtaClick` | 带 `cta_id`、label、页面类型、href、来源路径/locale 的 CTA 点击 | 使用范围主要在商业/提交等页面；href 可能是站内或非官网，且无 bot/internal 过滤；不得混作产品决策指标。 |
| `analytics` 表定义 | `db/supabase/schema.sql`；实际写路径导入 `db/neon/client` | 定义含 event、tool、metadata、时间、session、UA/referrer 字段 | 表定义与运行时连接位置不一致；未做只读生产回查，物理部署、保留期、RLS 与历史可用性均为 **unknown**。 |

## 4. PH0 事件契约（审计冻结；基础层由 MEASURE-01 独立实现）

MEASURE-01 已按本节建立默认关闭的强类型接收、内存 flow、服务端幂等、流量排除与未执行迁移候选，详见[决策事件隐私基础层](./MEASURE_01_DECISION_EVENT_FOUNDATION_CN.md)。该状态不改变 PH0-01 的审计结论：页面尚未接入事件，迁移未执行，生产采集关闭，没有真实样本或 Pilot 结果。

共同规则：事件名固定小写；仅接受 allowlist 字段；客户端先生成 30 分钟滚动的内存 `flow_instance_id`（刷新即失效，不持久化、不写 cookie）；服务端按 `event_name + flow_instance_id + object_id + 30 分钟 bucket` 幂等。事件接收端在入库前丢弃已知 bot UA、预览/本地/health 请求和内部 allowlist 流量；对无法可靠识别的自动流量标为 `traffic_quality=unknown` 并排除主指标。主指标分母只含 `traffic_quality=human`。保留期、访问权和聚合阈值须由 Privacy Owner 在实施前确认。

| 事件 | 触发条件与分子 / 分母 | 必要字段（均为枚举或 ID） | 来源页面 | 去重与验收 |
| --- | --- | --- | --- | --- |
| `task_start` | 用户在 Finder 选择有效 `task_id`；分子为唯一启动，分母为唯一 `find_tools_view`（需同批实现） | `event_version`, `flow_instance_id`, `task_id`, `locale`, `surface=find_tools`, `traffic_quality` | `/find-tools` | 同 flow/task/30 分钟一次；UI 测试验证选择一次只发一次，拒绝自由输入。 |
| `constraint_selected` | 已选任务后改变一个**枚举型**限制；分子为唯一 flow 的限制选择数，分母为 `task_start` | 共同字段 + `constraint_key`, `constraint_value_code` | `/find-tools` | 同 flow/key/value 一次；角色文本、预算数值、integration 自由文本只记 `redacted`，不得发送原值。 |
| `task_results_shown` | 规则引擎成功返回并实际渲染结果区；分子为有 >=1 推荐的 flow，分母为 `task_start` | 共同字段 + `task_id`, `rules_version`, `result_id`, `result_count` (0–3), `has_unknown` | `/find-tools` | 同 `result_id` 一次；验收要求网络失败和未渲染不发。 |
| `task_zero_result` | 同一成功结果实际渲染且 `result_count=0`；分子为零结果 flow，分母为 `task_start` | 共同字段 + `task_id`, `rules_version`, `result_id`, `zero_reason_code` | `/find-tools` | 与 `task_results_shown` 可同发但只计一次；`zero_reason_code` 仅允许 `no_published_fit/no_candidate_after_rules/evidence_unavailable`。 |
| `tool_detail_open` | 从带 `result_id` 的 shortlist 内部链接成功进入既有工具详情；分子为唯一工具打开，分母为 `task_results_shown` | 共同字段 + `result_id`, `tool_id`, `entry_point=finder_result` | 既有 `/ai/[websiteName]` | 同 flow/result/tool/30 分钟；验收用导航测试，直接访问不得带 `entry_point=finder_result`。 |
| `comparison_open` | 从允许的工具页/结果页链接进入已存在 comparison，页面完成初始渲染；分子为唯一打开，分母为对应来源 `tool_detail_open` 或 `task_results_shown`，必须分别报告 | 共同字段 + `comparison_key`, `entry_point`, `source_tool_id?`, `result_id?` | 既有 comparison 路由 | 同 flow/comparison/30 分钟；不新增 URL；404、redirect、未渲染不发。 |
| `evidence_open` | 用户展开 Evidence Ledger 的任一 claim，或 Decision Card 的 verified source 列表；分子为唯一 claim/区块打开，分母为 `tool_detail_open` | 共同字段 + `tool_id`, `evidence_surface=ledger/card_source`, `claim_type`（非 claim 内容） | 既有工具详情 | 同 flow/tool/surface/claim_type/30 分钟；不发送 source URL、摘录、claim 值。 |
| `decision_saved` | 登录用户明确点击保存且服务端事务已成功创建/更新一个 session；分子为唯一成功保存，分母为 `task_results_shown` | 共同字段 + `task_id`, `result_id`, `save_mode=create/update`, `rules_version` | `/find-tools` / 既有 profile 页面 | 服务端 idempotency key；失败/仅 localStorage 不发；不得发送 session UUID/user ID。 |
| `official_site_click` | 用户点击已服务器验证为当前工具官方域名的外链；分子为唯一工具官方跳转，分母为 `tool_detail_open` | 共同字段 + `tool_id`, `entry_point`, `official_domain_code` | 既有工具详情、已存在 Guide/Comparison | 同 flow/tool/domain/30 分钟；验收拒绝任意外链与未验证域名，绝不发送完整 URL query。 |

## 5. 首个任务簇评分模型：只定义，不擅自选簇

候选任务簇的总分为 `0.25*工具覆盖 + 0.20*搜索需求 + 0.15*差异度 + 0.20*决策困难 + 0.10*结构化能力 + 0.10*Evidence 可得性`。每项范围 0–100；任何一个输入无可信来源即为 `unknown`，总分也为 `unknown`，不以 0 或主观分补齐。

| 维度 | 可计算口径 | 所需数据 / 当前状态 |
| --- | --- | --- |
| 工具覆盖 | 有 published、reviewed fit、且至少一条有效 verified claim 的唯一工具数 / 候选可支持工具目标数 | 需 Supabase/Neon 只读导出；当前 **unknown**。 |
| 搜索需求 | 近 28 天同任务簇 GSC 非品牌 query impressions 的归一化分位数 | 需 GSC query-page 导出和簇映射；当前 **unknown**。 |
| 差异度 | 至少一个可比较维度在候选工具间不同且有证据的工具对 / 可比较工具对 | 需 claim/fit 只读导出；当前 **unknown**。 |
| 决策困难 | 在同一 flow 中出现 >=2 个硬约束或未知的比例 | 依赖本文件事件上线后的聚合；当前 **unknown**。 |
| 结构化能力 | 有已审核 `decision_task`、constraint schema 与 fit 的必要字段完成率 | 需任务/fit 只读导出；当前 **unknown**。 |
| Evidence 可得性 | 可支撑 cost/setup/privacy/export/limitation 中至少三类的有效 verified claim 工具占比 | 需 Evidence Ledger 只读导出；当前 **unknown**。 |

因此首个簇结论为 **unknown / BLOCKED**；不能因项目存在 AI Coding 页面、Codex Trial 或历史候选而擅自选择“AI Coding”。

## 6. 依赖图、Pilot 与 14/28 天 Gate

```text
PH0-01 审计与 Owner 数据
  -> PUB-04 模块注册（experimentId、successMetrics、stopRule、rollback）
  -> 3–5 个既有页面 Pilot（不新增 URL；SEO 冻结不变）
  -> 14 天初判（仅继续/暂停/修复）
  -> 28 天完整 Gate（扩大 / 保持 / 回滚展示）
```

| 节点 | READY | BLOCKED |
| --- | --- | --- |
| PH0-01 | 本文件的每项能力和事件均有代码/表证据；无生产写入 | 历史数据量、物理 analytics 存储和保留期仍未知，不得发布结论性基线。 |
| PUB-04 | Owner 确认目标任务簇、事件数据治理与 3–5 个**既有**页面名单；Registry 包含 experiment、指标、停止与回滚 | 任一 requiredEvidence、指标字段或回滚路径缺失；不得以增加 URL 代替。 |
| Pilot | 新事件契约自动测试、bot/internal 排除测试、隐私字段 allowlist 测试通过；页面 SEO 冻结差分为零 | 没有可用簇分数、没有 verified evidence、或无法隔离内部/机器人流量。 |
| 14 天 | 每个试点有完整连续 14 天、同口径人类流量；无隐私/SEO 回归；只做方向性判断 | 流量不足、数据质量 unknown、事件缺失或实验中途改定义。 |
| 28 天 | 与 14 天同定义；比较每页的漏斗、GSC 同页 query/CTR/排名并记录外部变动 | 不可比窗口、样本不足、SEO 冻结触发变更，或停止规则命中。 |

Gate 不预设“增长”阈值：在 Owner 提供历史基线后，PUB-04 必须按每个试点的可观测分母预注册最小样本、成功阈值和停止规则；样本不足只能保持或延长观察，不能宣布成功。

## 7. 要求 Owner 提供的数据

1. analytics 的只读数据字典：实际库/表、RLS、保留期、现有 bot/internal 规则，以及可导出的聚合字段；不需要原始 UA、referrer、session 或 user 数据。
2. 最近连续 28 天与前一窗口的 GSC page/query 聚合，限定候选既有页面；含筛选条件、导出时间和匿名化/聚合方式。
3. `decision_tasks`、published fits 和 verified claims 的只读聚合，用于按第 5 节计算而非猜测首个任务簇。
4. Owner 对事件保留期、内部流量定义、机器人识别策略、匿名 `flow_instance_id` 的合规批准，以及 Pilot 的 3–5 个既有页面名单。

## 8. 本审计验收

- 文档/计划一致性：`pnpm run test:decision-seo-release`、`pnpm run test:seo-architecture`。
- 变更卫生：`git diff --check`。
- 本提交不改 TypeScript、迁移、路由或分析写入，因此不新增 lint、TypeScript 或运行时测试义务。
