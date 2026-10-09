# REPLIT-FRESHNESS-01：单项 Claim 复核与受控更新

日期：2026-10-09（上海）。状态：**生产提交、postcheck 与独立 QA 完成**。

## 选择与范围

生产只读 backlog selector 在 ChatGPT 发布后回读 77 个工具、58 个 published、13 个到期项；Replit 是唯一 `claim_due`，因此本单元只处理 `replit`，没有把 ChatGPT Mac、GPT-4o、OpenAI、Adobe 等身份复核项混入 Claim freshness。

本次只复核公开套餐能力、Agent/AI 用量计费、部署费用和消费控制。状态、`page_quality_status`、URL/canonical、pricing 枚举、索引、sitemap 及 Task/Capability/Fit 均保持不变。

## 事实变化

- [Replit pricing](https://replit.com/pricing) 与官方套餐文档支持 Starter/Core/Pro 的能力边界，但本次公开读取没有得到可复核的完整实时价格与包含 credits 表。因此撤回旧稿中的 Core/Pro 精确月付、年付和包含额度，改为要求在目标账号结账页核对套餐、付款周期、包含 credits、税费和最终金额。
- [Starter](https://docs.replit.com/billing/plans/starter-plan)、[Core](https://docs.replit.com/billing/plans/replit-core) 与 [Pro](https://docs.replit.com/billing/plans/replit-pro) 支持公开能力边界。Starter 的免费与限制、Core 的协作/后台任务/发布能力、Pro 的并行任务/支持/数据库恢复边界继续保留；Enterprise 仍为目标合同核对。
- [AI billing](https://docs.replit.com/billing/ai-billing)、[deployment pricing](https://docs.replit.com/billing/deployment-pricing) 与 [spend controls](https://docs.replit.com/billing/managing-spend) 支持 effort-based Agent 计费、部署和云服务消耗 credits，以及 usage limit、service shutdown limit、credit packs/自动充值之间的边界。真实 burn rate 与控制是否生效仍需代表性账号和工作负载验证。

价格/额度 Claim 的下次复核日为 `2026-10-16`；真实用量与账号控制 Claim 为 `2026-10-23`。

## 发布门禁与结果

- [preflight](./REPLIT_FRESHNESS_PREFLIGHT_2026-10-09.json)：固定生产前像、PASS snapshot、来源、后像摘要和允许字段，`productionWrites=0`。
- [rollback](./REPLIT_FRESHNESS_ROLLBACK_2026-10-09.json)：事务内完整应用后回滚，原始生产行哈希不变，`productionWrites=0`。
- 开发首轮提交 `ae795973`；QA 仅发现 Replit 专属 verifier 未完整证明 manifest 与已应用重放，事实内容本身通过。
- 返工提交 `5e4eb6c8` 补齐 preflight/rollback 完整字段、`already_applied`、空 change set、零写入和 maintenanceReview/detail/next date 篡改负例；独立 QA 最终 `QA_PASS`。
- [生产 commit](./REPLIT_FRESHNESS_COMMIT_2026-10-09.json)：仅一条 Replit 记录，`productionWrites=1`，允许字段为 `detail`、`features.maintenanceReview`/受控 Claim 元数据与 `next_review_date`。
- [只读 postcheck](./REPLIT_FRESHNESS_POSTCHECK_2026-10-09.json)：`status=already_applied`、`changedFields=[]`、`productionWrites=0`。
- [提交后 backlog](./FRESHNESS_BACKLOG_AFTER_REPLIT_2026-10-09.json)：77 个工具、58 个 published、12 个到期项；`claim_due=0`、`entity_due=5`、`manual_archive_review=7`。

本单元没有运行完整 build；没有运行时代码、路由、渲染、canonical 或索引变化。两份无关 SQL 修改未纳入提交。
