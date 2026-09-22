# Index Review Run 实施与运行说明

更新时间：2026-09-21  
状态：生产迁移、首条真实记录与读取契约验证完成

## 2026-09-21 生产验证

生产表和 RLS 验证通过。Grammarly 首次真实资格复核已写入：内容、素材、市场验证、官方来源、独立采用信号、Decision Card、日期、canonical、意图与自动 SEO 检查全部通过。收到 2026-09-21 GSC 后，同日幂等记录已更新为最新快照；结果仍为 `hold_monitor`，阻塞项是站点搜索健康为 `blocked`，且索引策略保持暂停。此次记录没有修改 `page_quality_status` 或 sitemap。

## 目标与安全边界

`Index Review Run` 保存每次索引资格复核的输入、逐项检查、阻塞原因、GSC 基线日期、执行人和结论。它只负责形成可审计结论，
不直接更新 `tools.page_quality_status`，也不直接修改 sitemap。

真实索引批准仍必须单独执行，并继续受 `tool_index_release_guard` 的暂停状态、每日 1 个和每周 5 个数据库硬门禁保护。这样自
动复核可以每天或每周运行，但错误判断不会自动扩大索引面。

## 数据结构

迁移文件：[20260921_tool_index_review_runs.sql](../db/neon/20260921_tool_index_review_runs.sql)

核心字段：

- `tool_id` / `tool_slug`：唯一工具对象。
- `review_stage`：资格评审或索引后第 7、14、28 天复盘。
- `decision`：五种固定结论之一。
- `gsc_snapshot_date` / `gsc_snapshot_age_days`：站点级 GSC 基线及新鲜度。
- `site_search_health`：全站搜索健康状态。
- `checks` / `blockers`：逐项结果和明确阻塞原因。
- `input_snapshot`：当次策略、质量分、额度和运行参数快照。
- `reviewed_by` / `event_key`：责任人与同日幂等键。

表已启用 RLS，并撤销匿名和普通登录角色权限。`approve_continue_index` 记录还有数据库约束：不得包含 blocker，站点健康必须
为 healthy，GSC 快照不得超过 14 天。

## 启用与验证

1. 在生产 Neon 执行 `db/neon/20260921_tool_index_review_runs.sql`。
2. 执行 `pnpm run verify:tool-index-review-migration`。
3. 打开 `/cn/admin/index-reviews`，确认策略、队列和空账本正常显示。

迁移执行前，该后台页只显示安全提示，不会因缺表导致 Server Components 崩溃。

## 运行方式

先 dry-run：

```bash
pnpm run tools:index-review -- \
  --slug=grammarly \
  --as-of=2026-09-21 \
  --gsc-snapshot-date=2026-09-21 \
  --site-health=healthy \
  --observation-complete \
  --canonical-unique \
  --intent-unique \
  --seo-passed
```

成熟高需求工具在发布、页面门禁和生产查重全部通过后，可使用 `--release-track=mature_high_demand` 进行同日评审，不需要再传入 `--observation-complete`。普通、快速增长或边界不稳定工具继续使用默认 `standard`，并保留观察期。快速通道不会绕过 GSC 新鲜度、站点健康、策略暂停、额度、canonical、独立意图或证据门槛。

确认输出后增加 `--commit` 才写入账本。相同工具、阶段和日期使用同一个 `event_key`，重复运行会更新原记录而不是制造重复记
录。

## 判定边界

- 页面质量、素材、市场验证、官方来源、独立采用信号、Decision Card、编辑日期、canonical、搜索意图或 SEO 自动测试不合
  格：`repair_monitor`。
- 观察期未结束、GSC 缺失/超过 14 天、站点健康异常、策略暂停或额度不足：`hold_monitor`。
- 重复实体或不值得维持：`merge_or_archive`。
- 有站内价值但没有独立搜索意图：`permanent_noindex`。
- 只有全部门槛通过：`approve_continue_index`，但这仍只是批准建议，不是状态写入。

`monitor/noindex` 页面不要求不存在的页面级 GSC 展示或点击。其索引前门槛使用站点级 GSC 健康基线；单页 GSC 只在真正放开索
引后的第 7、14、28 天复盘。
