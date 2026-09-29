# N6/N7 安全事实更新器：执行与回滚

范围仅为 Grammarly、Jasper、Descript 的已审计 SAFE 段落及列表增量。Canva 无生产实体且为 HOLD，不进入计划。身份、价格、分类、内容、媒体、日历、索引状态、canonical、关系及历史发布快照保持不变。

执行前先复核两份 2026-09-28 官方来源、目标账号/页面与本地候选文本。运行 `pnpm run tools:apply-n6-n7-safe-facts -- --status` 只读核对状态。运行 `pnpm run tools:apply-n6-n7-safe-facts` 会在事务中锁定三行、模拟更新并完整断言，最后 `ROLLBACK`。只有完成审核后显式运行 `pnpm run tools:apply-n6-n7-safe-facts -- --commit` 才会提交。脚本要求固定 manifest 哈希、工具 ID/slug/URL、状态、复查日期及 `detail+features` 旧值哈希；任一变化都停止并要求重新审计。已完整应用时幂等返回 `alreadyApplied`。每项输出 `changedPaths` 和索引判定。

任何 `--status`、dry-run、baseline、hash、guard 或 `--commit` 执行失败，都必须立即停止。禁止绕过更新器重试手工 SQL、Supabase SQL Editor `UPDATE` 或其他直接数据库写入。先重新审计生产源与目标行，更新获批候选和固定基线，再重新验收后执行；不得在失败后继续提交。

如需撤回已提交的事实增量，不直接用旧快照覆盖当前行。先只读核对目标行及修改后的哈希，再制作经审核的反向补丁，限定这次新增的段落/列表项，在事务中断言所有保护字段及索引状态，预演回滚后才执行提交。若目标行已有新编辑，停止并重新审计。

## 2026-09-29 执行回读

执行时间：2026-09-29 08:02（Asia/Shanghai）。生产只读 `--status` 与默认 dry-run 均确认三个实体完整匹配目标哈希，`alreadyApplied=true`、`changedPaths=[]`；dry-run 事务执行 `ROLLBACK`。生产目标哈希：Grammarly `0c3cb98119b9b836fbd700f4160e6dd46d7f8693035b8abcf0257c7a2be9eb96`；Jasper `ece814dd76b32e4e65da4aad8b3cc6433892cf4c779babb7f4cd33c014386abd`；Descript `8cbbf70731fdb2ef827e5e3cf6a91026a2cb9301de2cccf211a50e85749842a3`。身份、官方 URL、`published` 状态、`page_quality_status`、`next_review_date` 与保护字段通过固定断言。

线上双语页面均为 200 且 self-canonical；Grammarly/Jasper 无 noindex 指令、可索引且各有两条 sitemap URL；Descript 为 `noindex, follow` 且 sitemap 0 条。六个页面 HTML 均能确认对应新增事实文本。因此数据库提交和页面部署均已观察到，不存在待刷新缓存的未决状态；本次未改变任何索引状态。验证执行：专项 SAFE 更新测试、Grammarly/Jasper/Descript 三项预审、CL-05/06 只读 verifier、TypeScript 与 `git diff --check` 均通过；生产无额外写入。Canva 仍为 `HOLD-CONFLICT`、没有生产实体；CL-05/06 Tool Capability/Fit 关系仍未发布，Jasper IQ/账户权限及 Descript 账户/合同权益等 HOLD 保持待核。未 push 或 deploy。
