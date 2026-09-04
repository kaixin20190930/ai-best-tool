# 本周索引批准历史核对

日期：2026-09-04；观察周：2026-08-31 至 2026-09-06，Asia/Shanghai。
归属：[主计划](./MASTER_OPTIMIZATION_TRACKER_CN.md)、[维护审计](./MAINTENANCE_AUDIT_2026-09-04_CN.md)。

## 结论与证据边界

本周可核实的放行至少 **12 次**，周额度剩余为 **0**。此前仅记账 9 月 4 日两次，遗漏 9 月 1 日已执行迁移；其中九个后来退回 monitor，不退还历史额度。

| 日期 | 工具 | 可核实次数 | 依据 |
| --- | --- | ---: | --- |
| 2026-09-01 | Fathom、Gamma、Consensus、Runway、Luma AI、Pipedream、Cursor、The Graph、Perplexity、Make | 10 | 十份固定 ID 的 INSERT 迁移、四周计划执行记录、9 月 2 日索引快照，以及生产 ID/slug/创建日期交叉校验 |
| 2026-09-04 | OpenRouter、n8n | 2 | 已有生产发布与独立回读记录，账本已有 observed 事件 |

对应 SQL 为 `db/supabase/migrations/20260901_migrate_*_tool.sql`，尽管目录名称含 supabase，权威工具实体在 Neon。迁移内容明确写入 published / continue_index；不能仅凭存在一个 SQL 文件就声称执行成功，因此同时核对已沉淀的执行记录与生产实体。

这不是“全历史只有 12 次”的声明。Emdash、Owlish 以及其他旧条目的完整状态转换日期还不具备同等级证据，不猜测追加。DeepL 内容更新、Claude 实体合并不直接计作全新批准。9 月 1 日事件发生在 9 月 2 日索引节奏政策落地前，不能追溯宣称全部违反后来规则；但本周观察不能把它们当作从未发生。

## 应用方式与自动验收

```sh
pnpm exec tsx scripts/reconcile-index-release-history.ts
pnpm exec tsx scripts/reconcile-index-release-history.ts --commit
pnpm run index-release:guard -- --status
```

- 默认事务回滚；只有 `--commit` 写入内部账本，不修改工具页。
- 固定十个 slug，校验迁移 ID、生产实体和日期；任何不匹配整体回滚。
- 批量写入缩短锁持有时间；同一事务重复插入必须影响 0 行，避免重跑重复计数。
- 全部工具行前后哈希必须一致，策略必须保持 paused=true。
- 已有基线保留未知日期，不覆盖成这次补账时间；已存在的同 key 事件若内容不符则失败，不静默覆盖。

## 维护状态

MAINT-01 技术保护与本周可证实记录补账分别验收；本周禁止新增批准的判断已明确。完整旧历史仍部分未知，暂停不会自动解除。下一周应重新检查新周账本与候选质量，并记录恢复决定，不能自动补偿错过的日配额。

## Consensus / Gamma 本轮局部复核

- Consensus：官方帮助中心仍列出 Pro $20/月或 $144/年、Deep $65/月或 $540/年，与现有迁移正文一致；本轮未据此调整价格或刷新整页核验日期。来源：[Subscription Plans](https://help.consensus.app/en/articles/10087865-subscription-plans)。直接 pricing 页未获取可读正文，使用官方帮助中心交叉核对。
- Gamma：官方导出说明明确 Google Slides 通过 PPTX 上传，可能替换嵌入字体，Word 导出仍不支持。已将此具体限制写入双语 priority evidence 卡，替代泛泛的视觉差异提示；卡片检查日期更新为本次实际核查日期，不等于整页审核日期。来源：[官方导出说明](https://help.gamma.app/en/articles/8022861-what-s-the-easiest-way-to-export-my-gamma)。
- Gamma 当前定价页可读取套餐能力，但本次文本未给出可可靠核对的价格数字，因此没有凭旧数值宣称新价格已验证。来源：[Pricing](https://gamma.app/pricing)。
- 两者仍维持 monitor；本轮未改数据库 next_review_date、市场验证结论或整页 reviewedAt。MAINT-03 仍进行中；剩余为完整来源、内容一致性与复查排期，Gamma 的 CHG-02 变化账本基线也未因此算完成。
