# 产品分发模块方案

更新时间：2026-07-19

产品定价、Stripe、权限和实施顺序已统一到：

- [平台产品、定价与 Stripe 实施总方案](./PLATFORM_PRODUCT_PRICING_AND_STRIPE_ROADMAP_CN.md)

## 目标

把“外链建设”升级为可收费的产品分发工作台，同时服务 aibesttool 自身。模块只解决一个问题：**每天知道该推广哪里、怎么准备、目前做到哪一步、结果是否真实有效。**

它不是自动发帖器，也不承诺批量制造 dofollow 外链。所有社区、Reddit、GitHub 和目录提交都由用户人工完成，系统负责策略、任务、证据和复查。

## 用户价值

客户可以为每个产品建立一个项目，按渠道生成和维护：

- 今日待办：优先级、渠道、截止日期和下一步动作
- 渠道 playbook：目录、Alternative、Startup、Community、Newsletter、Blog、GitHub、Reddit
- 提交记录：目标站、提交时间、提交状态、被拒原因
- 上线结果：live URL、链接属性、是否被移除、复查日期
- 团队复盘：哪些渠道产生访问、注册、认领或真实反馈

## 收费边界

| 方案 | 适用对象 | 建议能力 |
| --- | --- | --- |
| Pilot | 单个产品早期验证 | 1 个 workspace、1 个项目、基础任务和结果记录 |
| Pro | 独立产品和小团队 | 多个项目、渠道 playbook、跟进队列、结果复查 |
| Agency | 多产品团队 | 多 workspace、成员协作、客户报告、渠道模板 |

当前代码先落地独立 `distribution_entitlements` 权益表。Stripe 订阅价格和 webhook 需要在套餐金额、计费周期和退款规则确定后再接入，不能把现有一次性入驻付款误当成订阅权益。

## MVP 数据模型

- `distribution_entitlements`：用户的分发权益、套餐和到期时间
- `distribution_workspaces`：工作区，可区分自有项目和客户项目
- `distribution_projects`：产品、官网和项目状态
- `distribution_channels`：标准渠道目录和人工操作规则
- `distribution_tasks`：研究、准备、提交、发布、跟进和测量任务
- `distribution_results`：提交后的 live URL、链接状态、复查和备注

## 当前已实现

- `/[locale]/distribution` 受登录保护
- 管理员可直接进入，普通用户需要有效分发权益
- 默认渠道目录已包含 8 类渠道
- 可新增任务、设置 P0/P1/P2、截止日期和准备说明
- 可更新任务状态：planned、in progress、submitted、live、follow-up、done、skipped
- 可记录上线 URL、链接属性、拒绝/移除状态和复查备注
- 可按项目和渠道生成 UTM 链接，并保留链接历史
- UTM 链接会写入 `abt_dist_link`，访问会建立分发会话，并在 30 天面板中汇总访问、注册、提交、认领、checkout 和付款
- 渠道模板已提供标题、描述、必要字段和人工操作提示
- 页面明确禁止自动发帖、重复内容和无关链接
- aibesttool 自身可作为工作区中的自有项目使用
- 多项目切换与创建，Pro / Agency 项目数量限制已接入
- 独立分发订阅 checkout 路径和 Stripe webhook 处理器已加入，只有配置价格 ID 后才展示购买按钮
- 管理员可在 `/[locale]/admin/distribution` 查看所有项目、权益、任务、live 结果、异常结果和 30 天归因汇总

## 计费与验收状态

1. 数据库迁移：已完成。
2. 项目级 UTM、访问、注册、提交、认领、checkout、付款归因和 30 天快照：代码已完成，待真实链路验收。
3. Stripe Price 创建前的定价配置、Pilot、幂等、独立 webhook secret 和月付/年付改造：未开始，列为计费 P0。
4. 分发 webhook 将使用独立 `STRIPE_DISTRIBUTION_WEBHOOK_SECRET`，不与一次性入驻付款共用 endpoint secret。

## 仍需上线验证

1. 重新执行完整迁移文件 `20260719_product_distribution_module.sql`，确认归因表和策略已落库。
2. 用工作台生成一个 UTM 链接，使用新会话打开并完成一次注册或认领，确认归因数字增加。
3. 在 Stripe 测试模式完成一次分发套餐 checkout，确认 webhook 写入 `payment` 事件且不重复计数。
4. 增加渠道模板、批量生成“准备任务”，但不自动发布。
5. Admin 视图：已完成，待真实数据验证。
6. 增加周报导出，服务客户复盘和 aibesttool 自身的外链建设。

## 成功指标

- 用户每周完成的有效分发任务数
- 提交到 live 的转化率
- live URL 30 天保留率
- 分发渠道带来的访问、注册、认领和付费
- 重复/被拒提交率下降
- 客户每周打开并完成待办的比例
