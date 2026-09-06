# Perplexity 与 Make 官方事实维护

日期：2026-09-06。归属：[收录与搜索质量主计划](./MASTER_OPTIMIZATION_TRACKER_CN.md) 的既有页面持续维护。本轮不新增 URL、不批准索引，也不改变四周计划分母。

## 结论

| 工具 | 结果 | 可证实变化 | 保留缺口 | 下次复查 |
| --- | --- | --- | --- | --- |
| Perplexity | `fact_updated` | 显式记录官方 Free Pro Search 次数的 3 次/5 次冲突；补充网页订阅不含 API、Computer 使用独立 credits | 未做登录账户额度、准确性或付费实测 | 2026-10-06 |
| Make | `reviewed_no_change` | credits、AI 双重成本、US/EU 数据区和 webhook 队列边界与现有页面一致 | 未运行代表性生产 scenario，未核算真实失败恢复成本 | 2026-10-06 |

## Perplexity 事实边界

- 最新套餐对比页列 Free 每日 3 次 Pro Search、每月 1 次 Research；账号管理页仍列每日 5 次 Pro Search。本站不擅自选择一个数字冒充稳定承诺，前台明确要求以登录后的额度页为准。
- Free、Pro、Max 的 AI Data Retention 默认开启且可以关闭；退出只影响退出后的数据。Enterprise 数据边界不同，不能从消费者套餐外推。
- 网页套餐不包含 API，API 单独计费。Computer 另用 credits；Pro 当前没有固定月度 credits，Max 当前有月度 credits，任务成本随复杂度变化。
- 来源标签是域名级判断，不证明单篇文章或具体主张准确，重要结论仍需打开引用原文。

官方来源：

- https://www.perplexity.ai/help-center/en/articles/11187416-which-perplexity-subscription-plan-is-right-for-you
- https://www.perplexity.ai/help-center/en/articles/10352998-account-management-and-security
- https://www.perplexity.ai/help-center/en/articles/11564572-data-collection-at-perplexity
- https://www.perplexity.ai/help-center/en/articles/20260806-understanding-source-labels
- https://www.perplexity.ai/help-center/en/articles/13838041-how-credits-work-on-perplexity

## Make 事实边界

- Credits 已替代 operations 成为计费单位；大多数非 AI 模块默认每次 operation 消耗 1 credit。
- 使用自有 AI provider connection 时，Make credits 与模型商 token 费用分别产生；内置或自动连接可以按 tokens、operations 和其他因素动态计费。
- Organization 创建时选择 US 或 EU 数据区，之后不能修改。该选择不能被普通地区说明替代。
- Webhook 请求会进入各自队列，容量与月度 credits allowance 有关；队列已满会拒绝新请求。页面继续用真实运行记录而非静态套餐数字作为成本建议。

官方来源：

- https://help.make.com/credits
- https://help.make.com/how-features-use-credits
- https://help.make.com/organizations
- https://help.make.com/webhooks

## 写入与安全边界

- 固定生产 ID：Perplexity `3d018623-85f9-4df4-bd55-9a4a0e7a2d93`；Make `c0bb3aba-33be-4e14-903e-5f1d036eec4a`。
- 数据库只允许更新 `features.maintenanceReview`、`next_review_date` 和 `updated_at`；正文、status、page_quality_status、索引批准及其他业务字段必须保持不变。
- `editorial.reviewedAt` 与 `marketValidation.reviewedAt` 均保留 2026-09-01，不把本次来源核查冒充整页编辑复核或市场验证。
- 页面继续保持 `monitor / noindex` 并退出 sitemap；本轮不会消耗索引放行额度。

## 自动验收

1. `pnpm exec tsx scripts/test-tool-maintenance-reviews.ts`
2. `pnpm run test:priority-tool-evidence`
3. `pnpm exec tsx scripts/apply-tool-maintenance-reviews.ts`，默认事务回滚预演
4. `pnpm exec tsx scripts/apply-tool-maintenance-reviews.ts --commit`
5. `pnpm exec tsx scripts/apply-tool-maintenance-reviews.ts --status`
6. `pnpm run build`
7. 部署后使用 `SEO_BASE_URL=https://aibesttool.com pnpm exec tsx scripts/test-tool-maintenance-reviews.ts --pages`

回滚预演、正式写入及独立 `--status` 回读均已通过。Perplexity、Make 与配置中既有的 Consensus、Gamma 全部保持
`published + monitor`，下次复查为 2026-10-06；编辑与市场验证日期仍为 2026-09-01。生产页面结果在部署后补记。
