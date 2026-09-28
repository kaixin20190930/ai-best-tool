# N6/N7 安全事实更新器：执行与回滚

范围仅为 Grammarly、Jasper、Descript 的已审计 SAFE 段落及列表增量。Canva 无生产实体且为 HOLD，不进入计划。身份、价格、分类、内容、媒体、日历、索引状态、canonical、关系及历史发布快照保持不变。

执行前先复核两份 2026-09-28 官方来源、目标账号/页面与本地候选文本。运行 `pnpm run tools:apply-n6-n7-safe-facts -- --status` 只读核对状态。运行 `pnpm run tools:apply-n6-n7-safe-facts` 会在事务中锁定三行、模拟更新并完整断言，最后 `ROLLBACK`。只有完成审核后显式运行 `pnpm run tools:apply-n6-n7-safe-facts -- --commit` 才会提交。脚本要求固定 manifest 哈希、工具 ID/slug/URL、状态、复查日期及 `detail+features` 旧值哈希；任一变化都停止并要求重新审计。已完整应用时幂等返回 `alreadyApplied`。每项输出 `changedPaths` 和索引判定。

如需撤回已提交的事实增量，不直接用旧快照覆盖当前行。先只读核对目标行及修改后的哈希，再制作经审核的反向补丁，限定这次新增的段落/列表项，在事务中断言所有保护字段及索引状态，预演回滚后才执行提交。若目标行已有新编辑，停止并重新审计。
