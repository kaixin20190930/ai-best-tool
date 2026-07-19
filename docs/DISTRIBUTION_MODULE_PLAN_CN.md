# 产品分发模块方案

更新时间：2026-07-19

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
- 渠道模板已提供标题、描述、必要字段和人工操作提示
- 页面明确禁止自动发帖、重复内容和无关链接
- aibesttool 自身可作为工作区中的自有项目使用
- 多项目切换与创建，Pro / Agency 项目数量限制已接入
- 独立分发订阅 checkout 路径和 Stripe webhook 处理器已加入，只有配置价格 ID 后才展示购买按钮

## 下一阶段

1. 在 Stripe 创建 Pro / Agency recurring price，并配置 `STRIPE_DISTRIBUTION_PRICE_ID_PRO`、`STRIPE_DISTRIBUTION_PRICE_ID_AGENCY`
2. 在 Stripe webhook 中增加 `https://aibesttool.com/api/stripe/distribution-webhook`，复用 `STRIPE_WEBHOOK_SECRET`
3. 重新执行 `20260719_product_distribution_module.sql`，使已存在的 `distribution_entitlements` 增加 Stripe 订阅字段
4. 增加项目级 UTM、来源访问、注册/认领转化关联
5. 增加渠道模板、批量生成“准备任务”，但不自动发布
6. 增加 admin 视图，查看所有客户工作区、活跃任务、被拒原因和失效链接
7. 增加周报导出，服务客户复盘和 aibesttool 自身的外链建设

## 成功指标

- 用户每周完成的有效分发任务数
- 提交到 live 的转化率
- live URL 30 天保留率
- 分发渠道带来的访问、注册、认领和付费
- 重复/被拒提交率下降
- 客户每周打开并完成待办的比例
