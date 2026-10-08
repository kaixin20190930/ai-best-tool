# FRESHNESS-BACKLOG-RESET-01

日期：2026-10-08。只读生产审计见 [机器报告](./FRESHNESS_BACKLOG_2026-10-08.json)：71 条工具、55 条 published、34 条到期。分类为 `schedule_sync=1`、`claim_due=21`、`entity_due=5`、`manual_archive_review=7`。此为分流队列，不表示 34 条事实全部失效。`updated_at` 仅供并发前像检查，不作为事实复核日期。

## 批次机制

- `pnpm exec tsx scripts/audit-freshness-backlog.ts --date=2026-10-08` 只读全量分类。可用 `--out=路径` 保存 JSON；默认 selector 依据索引风险、Task/Decision 依赖、逾期天数及官方来源是否存在排序，最多取 5 条。人工归档评估不自动下架。
- 每天最多并行推进 1 个成熟新工具及 1 个最多 5 条的 freshness 批次。新工具按实体门禁与 Claim 级限定发布到 monitor/noindex；账户级未决事实保留限定和复核日。索引另走独立审批。
- 首批指定 Consensus、Gamma、Perplexity、Make、Synthesia，来自既有 PASS 快照的增量核查；这不是 selector 自动前五。每条有独立官方来源、前像哈希、变更字段和回滚边界。原始 [preflight](./FRESHNESS_FIRST_BATCH_PREFLIGHT_2026-10-08.json) 与 [rollback](./FRESHNESS_FIRST_BATCH_ROLLBACK_2026-10-08.json) 在提交前完成。无迁移，无索引或 sitemap 改动。
- 继承的 PASS 仅覆盖实体身份基线，不延长旧 Claim 的有效期。四条 2026-09-06 维护 PASS 来自 `lib/config/toolMaintenanceReviews.ts`，Synthesia 2026-09-08 发布 PASS 来自 `data/collection/synthesia-release.json`；每条报告保存快照 ID、文件 SHA-256、原复核日、原 Claim 到期日及实体基线 `validThrough`。实体基线期限按身份/canonical 常规 90 天推导，分别为 2026-12-05 和 2026-12-07；四条旧 Claim 已于 10-06 到期，Synthesia 于 10-08 到期，正是本次增量官方核查的对象。preflight 校验来源文件、生产 ID/slug/URL、原维护或编辑日期与未过期实体基线，任何缺失、错配或过期都停止。

## 首批结论

| 工具 | 结论 | 增量与未决项 |
| --- | --- | --- |
| Consensus | `fact_updated` | 官方 Pro/Deep API/MCP 月额度从 250/1,000 变为 500/2,000；账户重置和独立准确率未实测。 |
| Gamma | `reviewed_no_change` | 现有关键决策边界与官方资料相符；精确结账和导出还原度仍需账户测试。 |
| Perplexity | `fact_updated` | 移除 Free Pro Search 的精确日次数断言；官方口径冲突继续标记 `conflict`。Computer 周度包含额度分批开放，账号权益为 `conditional`。 |
| Make | `reviewed_no_change` | 官方 credits、AI 成本分拆及不可更改的数据区边界一致；真实 scenario 成本仍未实测。 |
| Synthesia | `fact_updated` | 公共页套餐/credits 已大幅变化，候选只替换旧商业段落及结构化价格快照；API 权益和结账附加项继续 `conditional/unknown`。 |

官方核查范围：[Consensus 套餐](https://help.consensus.app/en/articles/10087865-subscription-plans)、[Gamma 套餐](https://help.gamma.app/en/articles/8077107-how-can-i-upgrade-my-gamma-subscription)、[Perplexity credits](https://www.perplexity.ai/help-center/en/articles/13838041-how-credits-work-on-perplexity)、[Make credits](https://help.make.com/credits)、[Synthesia 定价](https://www.synthesia.io/pricing)。各工具其余来源及下次日期见 JSON。

## 执行边界

`scripts/run-freshness-first-batch.ts` 默认 preflight；`--rollback` 逐工具执行事务内变更和完整字段断言后回滚。只有审阅 preflight manifest 后才可显式 `--commit --manifest=...`；执行器将逐项校验完整前像 SHA-256，发生并发变化则失败。允许字段仅为 `detail`、`features.maintenanceReview`、Synthesia 的 `features.pricingSnapshot`、`next_review_date` 和数据库自动时间戳。status、page_quality_status、URL/canonical、索引与 sitemap 字段不可变；实体 URL 异常时停止。提交后还须单独生产回读和页面 QA。

## 生产提交与 postcheck

总控随后已按原始 preflight manifest 执行生产 commit，5 条均写入成功；本任务没有重复执行该命令。提交后首次重跑 preflight 在 Consensus 报 `PASS maintenance snapshot mismatch`：旧校验器要求生产 `maintenanceReview` 仍保留 9 月 6 日日期，无法识别经受控提交后的新记录。修复后，未应用记录继续严格要求旧 PASS 与精确 preimage；已应用记录则校验当前 `maintenanceReview` 完全等于候选、`next_review_date` 正确，并通过原始 preflight manifest、来源文件哈希、ID/slug/URL 和实体基线期限追溯旧 PASS。字段或日期篡改会失败，不会被视作幂等成功。

[只读 postcheck](./FRESHNESS_FIRST_BATCH_POSTCHECK_2026-10-08.json) 返回 5 条 `already_applied`、`changedFields=[]`、`productionWrites=0`。[提交后全量审计](./FRESHNESS_BACKLOG_POSTCOMMIT_2026-10-08.json)为 71 tools、55 published、29 到期；余下 `schedule_sync=1`、`claim_due=16`、`entity_due=5`、`manual_archive_review=7`。本次修复仅改校验逻辑、测试和文档，没有再次写生产，也未 push。专项测试、TypeScript 与 diff check 通过；未改运行时或发布路径，未执行完整 build。
