# 分发工作台 UI 重构最终方案与实施任务表

更新时间：2026-08-10

状态：活跃执行文档

适用范围：用户端 `/{locale}/distribution` 及目标站任务详情；不重构管理员目标站情报后台。

关联文档：

- [优化总控任务表](./MASTER_OPTIMIZATION_TRACKER_CN.md)
- [分发工作台完整收口方案](./DISTRIBUTION_WORKSPACE_CLOSURE_PLAN_CN.md)
- [分发真实验收指南](./DISTRIBUTION_PRODUCT_ACCEPTANCE_GUIDE_CN.md)

本文档是分发用户端 UI、信息架构和交互反馈的唯一执行依据。原 `DC-*` 任务继续表示底层业务能力；本文件的 `DUI-*` 任务表示这些能力是否已经形成清晰、稳定、可验收的用户体验。

---

## 一、对初版方案的审计结论

初版“Admin 风格固定左侧导航 + 右侧功能区”的方向正确，保留以下原则：

- 导航位置固定，切换任务时不丢失产品和上下文。
- 首页只回答“今天做什么”。
- 产品、机会、执行、跟进、结果拆成不同工作空间。
- 每个页面只有一个主要动作。
- 所有写操作必须展示处理中、成功和失败状态。

但原方案不能原样实施，必须修正：

1. `blocked` 不是固定的业务阶段。付款、账号、素材可以在提交前阻塞，审核补件和链接失效可以在提交后阻塞，因此它应是覆盖在原阶段上的异常状态，而不是全部归入“审核与监控”。
2. 页面拆分不等于让用户在多个独立页面来回跳。所有分发路由必须共享同一个 Layout、产品上下文和侧边栏；任务详情使用同壳层的列表/详情模式。
3. 首次用户需要线性 onboarding，日常用户需要 Today 队列。两者不能用同一个长页面兼顾。
4. `project_target`、`task`、`result` 和 `reminder` 各自有职责，但页面状态必须由一个 presentation-state selector 派生，不能让多个组件分别解释数据库字段。
5. 普通保存与长时间抓取不能使用同一种 loading。短操作即时更新；抓取、导入和复杂生成超过阈值时才进入后台任务和全局 Action Center。
6. 素材属于产品事实，UTM 属于目标任务，目标站规则属于管理员情报库；它们不应都成为左侧一级导航。

---

## 二、最终设计目标

用户在任一页面都应立即知道：

- 当前操作的是哪个产品。
- 当前位于分发生命周期哪个阶段。
- 现在唯一需要执行的动作是什么。
- 操作是否正在处理、是否成功、失败后如何恢复。
- 下一次检查时间和最终结果保存在哪里。

成功指标：

- 首次用户从产品确认到接受第一个目标站，不超过 5 个明确步骤。
- 日常用户进入工作台后 10 秒内找到今天的首要任务。
- 从打开任务到进入目标站不超过 2 次站内点击。
- 任意写操作点击后 100ms 内出现视觉反馈。
- 同一任务只拥有一份规范状态；其他页面只显示派生摘要。
- 用户连续 7 天不需要 Excel、Notion、外部日历或额外 UTM 工具。

非目标：

- 不自动绕过登录、验证码、付款或人工审核。
- 不在本轮重构管理员 `/admin/targets` 情报管理 UI。
- 不为了新 UI 删除已有任务、结果、材料包或提醒数据。
- 不在 P0 承诺所有 AI/抓取操作都已后台化。

---

## 三、最终信息架构

### 1. 桌面端壳层

左侧固定 248px，右侧为当前功能。侧边栏顶部固定产品选择器；切换产品只更新右侧数据，不整页刷新。

```text
Distribution Workspace
产品：MOXION.AI                 [切换]

工作
  今天                          3

流程
  产品资料                      92%
  目标机会                      4
  执行任务                      2
  跟进与监控                    3

洞察
  结果报告

底部
  套餐与设置
  返回 AI Best Tool
```

一级导航严格控制为六项：

1. 今天
2. 产品资料
3. 目标机会
4. 执行任务
5. 跟进与监控
6. 结果报告

素材库放在“产品资料”内；UTM 和目标站材料放在任务内；高级设置放在侧边栏底部，不增加一级入口。

### 2. 移动端

- 顶部固定产品选择器和当前页面标题。
- 左侧导航变为抽屉，不复制一套底部导航。
- 任务主要 CTA 固定在安全区域底部。
- 表格在移动端改为状态分组卡片，不横向塞入全部列。

### 3. 路由

```text
/{locale}/distribution                         今天
/{locale}/distribution/products                产品列表与当前产品资料
/{locale}/distribution/opportunities           目标机会
/{locale}/distribution/tasks                   执行任务
/{locale}/distribution/tasks/{taskId}          同壳层任务详情
/{locale}/distribution/monitoring              跟进与监控
/{locale}/distribution/reports                 结果报告
/{locale}/distribution/settings                套餐与设置
```

旧查询参数和任务 URL 保留兼容跳转，书签和已有邮件链接不能失效。

---

## 四、规范状态模型

### 1. 数据职责

| 数据 | 唯一职责 | 不允许承担的职责 |
| --- | --- | --- |
| `distribution_projects` / assets | 产品事实、目标、预算、素材准备度 | 任务执行状态 |
| `distribution_project_targets` | 推荐决策：推荐、接受、稍后、跳过 | 重复保存完整任务生命周期 |
| `distribution_tasks` | 执行生命周期的规范状态 | 目标站长期规则和结果历史 |
| `distribution_results` | 提交、审核、上线和链接结果证据 | 当前操作按钮状态 |
| `distribution_reminders` | 下一次复查时间和投递状态 | 任务规范状态 |
| `distribution_task_events` | 审计时间线和阻塞前状态 | 页面单独维护的状态副本 |

### 2. 展示状态

新增统一 `deriveDistributionPresentationState()`，所有页面只消费它：

```text
phase: onboarding | opportunity | execution | monitoring | completed
status: preparing | ready | submitted | waiting | live | done | skipped
blocked: true | false
blockedPhase: opportunity | execution | monitoring | null
blockerType: payment | account | captcha | assets | editorial | link | other
primaryAction: 一个可执行动作
nextReviewAt: 下一次复查时间
```

阻塞是覆盖层：

- `execution + blocked(payment)`：仍归属执行任务，但在 Today 和阻塞收件箱提醒。
- `monitoring + blocked(editorial)`：归属跟进与监控。
- `monitoring + blocked(link)`：归属链接异常。

这样 Futurepedia 不会同时在推荐卡显示 `accepted`、在任务列表显示 `blocked`。

### 3. 页面归属

| 规范阶段 | 主要页面 | 允许出现的摘要位置 |
| --- | --- | --- |
| onboarding | 产品资料 | 今天的唯一下一步 |
| recommended / later | 目标机会 | 今天建议摘要 |
| accepted / preparing / needs assets / ready | 执行任务 | 今天、阻塞收件箱 |
| submitted / waiting review / live / follow-up | 跟进与监控 | 今天、周报 |
| done / skipped | 结果报告或历史 | 周报摘要 |

同一条记录可以出现在 Today 摘要里，但只在主要页面编辑。

---

## 五、各页面最终设计

### 1. 今天

右侧只显示：

- 最高优先级 1–3 项任务。
- 阻塞收件箱摘要。
- 今日到期复查。
- 本周进度和一个下周建议。

不显示完整产品表单、全部目标卡、UTM、归因表、渠道手册和完整任务历史。

每个任务卡回答：产品、目标站、推荐原因、耗时、费用、当前状态、唯一 CTA。

### 2. 产品资料

内部标签：

- 概览：名称、官网、定位、目标、市场、预算。
- 素材：Logo、截图、视频、品牌介绍。
- 事实与来源：owner 确认内容、证据更新时间、冲突提示。

页面顶部显示准备度和精确缺项。已完成内容默认摘要，不反复展开大表单。

### 3. 目标机会

内部标签：推荐、已选择、稍后、已跳过。

卡片只展示目标站决策信息；接受后创建/进入任务，并从默认推荐列表移动到“已选择”。状态和 CTA 必须唯一。

### 4. 执行任务

列表状态：准备中、缺素材、可提交、提交前阻塞。

桌面端采用列表 + 详情；移动端进入详情页，但保留 Distribution 壳层。

任务详情按状态渐进展示：

- 准备中：缺项和生成材料包。
- 可提交：字段复制、素材下载、目标站入口。
- 阻塞：原因、是否付费、恢复、稍后或跳过。
- 提交完成：记录结果后自动进入监控。

底部 sticky action bar 始终只保留一个主动作和最多两个次动作。

### 5. 跟进与监控

内部标签：待审核、待复查、已上线、链接异常。

- 自动聚合 3/7/30/90 天节点。
- 上线任务显示公共 URL、最后检测、rel/noindex 和下次检测。
- 登录墙、验证码和不可自动确认项进入人工复核，不无限重试。

### 6. 结果报告

- 周/月提交数、上线数、审核通过率。
- 目标站费用和耗时。
- 链接保留率。
- 访问、注册、认领、付款归因。
- 主要阻塞/拒绝原因。
- 继续、降低或停止投入的渠道建议。

报告不提供任务编辑表单，只提供钻取链接。

---

## 六、异步操作统一规范

### 1. 短操作

适用：保存、状态更新、接受机会、记录结果、创建 UTM。

```text
idle -> pending -> success | error
```

强制要求：

- 点击后 100ms 内 spinner + pending 文案。
- pending 时按钮禁用并防重复提交。
- 成功后局部更新数据并显示全局 toast；不依赖整页刷新才看见变化。
- 失败时保留输入、显示可理解错误和重试入口。
- 关键动作携带 idempotency key。

### 2. 中等操作

适用：导入目录资料、生成目标材料包、URL 复查。

- 显示 2–4 个真实阶段，不伪造百分比。
- 完成前保持当前页面可操作范围清晰。
- 页面离开前若任务不能恢复，给出明确提醒。

### 3. 长操作

适用：批量抓取、多目标站分析、复杂 AI 生成。

- P2 接入持久化 job；开始后可以离开页面。
- 侧边栏 Action Center 显示运行中、完成、失败。
- 刷新或重新登录后仍能恢复状态。
- 超时、重试次数和失败原因可观察。

### 4. 组件门禁

- 所有 Server Action 写操作必须使用统一 `DistributionActionProvider`。
- 禁止新增无 pending 状态的提交按钮。
- PR/构建检查扫描分发目录中的裸写操作和未提供 pending label 的按钮。
- 筛选和产品切换使用客户端 transition，不再用 `window.location.href` 整页跳转。

---

## 七、组件与数据查询拆分

```text
DistributionShell
  DistributionSidebar
  DistributionMobileHeader
  DistributionProjectSwitcher
  DistributionActionCenter

DistributionTodayPage
DistributionProductPage
DistributionOpportunityPage
DistributionTaskQueuePage
DistributionTaskWorkspace
DistributionMonitoringPage
DistributionReportsPage

DistributionActionProvider
DistributionAsyncButton
DistributionToastViewport
DistributionProgressPanel
```

原单体 Dashboard 按页面拆分，但共享 selector、状态徽标、任务卡和查询类型。服务端查询按页面最小化，避免每次导航都读取全部任务、全部报告和全部素材。

---

## 八、实施任务表

### 进度口径

- 本 UI 重构计划总权重 100。
- 当前完成 `DUI-001`、`DUI-010`、`DUI-011`、`DUI-012`、`DUI-013`、`DUI-014`、`DUI-020`、`DUI-021`、`DUI-022`、`DUI-023`、`DUI-024` 的核心地基与主链路能力。
- `DUI-025` 已完成，`DUI-026` 与 `DUI-030` 已完成收口，`DUI-031` 已完成落地，`DUI-032` 已完成，`DUI-033` 进行中，`DUI-034` 已完成，预估整体进度约 **94%**。已有分发业务能力属于复用基础，不虚报为本次 UI 重构完成度。发布收口采用 `test:distribution-release` 脚本并通过。
- `代码完成` 不等于 `已完成`；必须通过生产验收才计满权重。

### P0：状态与交互底座，35%，预计 3–4 个工作日

| ID | 权重 | 任务 | 负责人 | 依赖 | 状态 | 验收标准 |
| --- | ---: | --- | --- | --- | --- | --- |
| DUI-001 | 2 | 冻结最终方案和完成口径 | Codex | 无 | 已完成 | 本文档与总控表成为唯一 UI 执行依据 |
| DUI-010 | 5 | 统一 presentation-state selector | Codex | DUI-001 | 已完成 | Futurepedia、SaaSHub 在所有页面状态一致；blocked 保留原阶段 |
| DUI-011 | 8 | 全局 Action Provider、Toast、Async Button | Codex | DUI-001 | 已完成 | 所有标准写操作 100ms 内反馈，成功/失败全局可见 |
| DUI-012 | 8 | 迁移现有分发写按钮并增加静态门禁 | Codex | DUI-011 | 已完成 | 用户可见写按钮覆盖率 100%，无静默提交和重复点击 |
| DUI-013 | 4 | 导入、生成、检测的真实阶段反馈 | Codex | DUI-011 | 已完成 | 三类中等操作显示真实阶段、错误和重试 |
| DUI-014 | 8 | Distribution Layout、侧边栏和兼容路由 | Codex | DUI-010 | 已完成 | 所有分发页共享产品上下文；旧 URL 可访问；移动端有导航抽屉 |

P0 发布门槛：完整 build、分发闭环测试、生产 smoke 通过；Moxion 的保存、接受、生成、提交、阻塞和检测按钮均有可见生命周期。

### P1：核心工作流页面，45%，预计 5–7 个工作日

| ID | 权重 | 任务 | 负责人 | 依赖 | 状态 | 验收标准 |
| --- | ---: | --- | --- | --- | --- | --- |
| DUI-020 | 8 | Today 指挥台 | Codex | DUI-010、014 | 已完成 | 默认只显示 1–3 项、阻塞摘要、到期复查和本周进度 |
| DUI-021 | 6 | 产品资料与素材页 | Codex | DUI-014 | 已完成 | 产品事实只维护一次，准备度和缺项明确 |
| DUI-022 | 7 | 目标机会页 | Codex | DUI-010、014 | 已完成 | 推荐/已选择/稍后/跳过分离，卡片只有一个状态和 CTA |
| DUI-023 | 8 | 执行任务列表与状态分组 | Codex | DUI-010、014 | 已完成 | 准备、可提交和提交前阻塞清晰分组，无重复编辑入口 |
| DUI-024 | 7 | 跟进与监控页 | Codex | DUI-010、014 | 已完成 | 待审核、复查、live、链接异常集中处理 |
| DUI-025 | 6 | 同壳层任务详情与 sticky action bar | Codex | DUI-011、023 | 已完成 | 任务切换不丢产品上下文；每个状态最多一个主 CTA |
| DUI-026 | 3 | 移动端与键盘/焦点体验 | Codex | DUI-020 至 025 | 已完成 | 手机可完成完整任务；loading、toast、dialog 可访问 |

P1 发布门槛：Moxion 在 SaaSHub、AlternativeTo、Futurepedia 三种结果下都能从 Today 进入正确主页面，状态只需修改一次。

### P2：报告、长任务和真实验收，20%，预计 3–5 个工作日

| ID | 权重 | 任务 | 负责人 | 依赖 | 状态 | 验收标准 |
| --- | ---: | --- | --- | --- | --- | --- |
| DUI-030 | 5 | 结果报告页 | Codex | DUI-020、024 | 已完成 | 结果、费用、保留、归因和渠道建议可钻取，不重复任务表单 |
| DUI-031 | 5 | 持久化后台任务与 Action Center | Codex | DUI-013、014 | 已完成 | 长操作有持久化展示与失败记录，可在同页与刷新后追踪 |
| DUI-032 | 4 | 路由/状态/按钮自动回归 | Codex | DUI-020 至 031 | 已完成 | 构建门禁覆盖 URL、状态映射、重复点击和错误反馈 |
| DUI-033 | 4 | 三产品真实 7 天验收 | 用户执行；Codex修复 | DUI-032 | 进行中 | 3 个产品各推进至少 3 个目标站，不使用额外管理工具 |
| DUI-034 | 2 | 性能、可访问性和生产发布收口 | Codex | DUI-032、033 | 已完成 | 已通过本地 build、`test:distribution-closure.ts`、`distribution:production-smoke`、`seo:production-smoke`，未发现 5xx；新增 `test:distribution-release` 用于持续收口 |

---

## 九、实施顺序与风险控制

1. 先做 `DUI-010`，统一展示状态，避免在新 UI 中复制旧的状态冲突。
2. 再做 `DUI-011/012/013`，先解决按钮静默和重复提交，这是当前最高风险。
3. 建立 Layout 后先迁移 Today 与任务详情，用户立刻获得稳定导航和执行路径。
4. 再拆产品、机会、执行、监控，期间旧 Dashboard 保持兼容，不一次性删除。
5. 报告和后台任务最后接入，避免阻塞核心人工分发闭环。
6. 每批独立 build、测试和部署；生产验证成功后才迁移下一批。

主要风险与控制：

- 路由迁移：保留旧 URL redirect 和 query 参数映射。
- 状态漂移：所有页面共享 presentation selector，不在组件内自行推导。
- 数据丢失：不删除旧表和任务；新 UI 先读兼容结构。
- 按钮重复写：禁用 pending、服务端 owner 校验、关键动作幂等。
- 页面变多：共享 Layout、产品选择和任务上下文，使用局部 transition。
- 长任务假进度：P0 只显示真实阶段；没有持久化 job 前不宣称可离页执行。

---

## 十、时间与完成判断

- 3–4 个工作日：P0，状态一致、按钮反馈、稳定壳层完成。
- 8–11 个工作日：P0 + P1，核心用户旅程完成。
- 11–16 个工作日：P0 + P1 + P2，完整 UI 重构和真实验收完成。

完成不是“页面已经拆开”，而是：用户进入 Today 能找到动作，任务状态只修改一次，按钮始终有反馈，离开/返回不丢上下文，结果能够进入复查和报告。
