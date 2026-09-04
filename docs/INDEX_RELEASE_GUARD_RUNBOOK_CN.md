# 索引批准保护运行说明

日期：2026-09-04。归属：[主计划](./MASTER_OPTIMIZATION_TRACKER_CN.md)、[索引节奏政策](./TOOL_INDEX_RELEASE_POLICY_CN.md)。

## 范围与边界

- 权威数据源为 Neon `public.tools`，不是历史 Supabase 工具副本。
- 数据库触发器统一覆盖后台、直接 SQL、迁移脚本和批量任务。新增 `published + continue_index` 批准消耗额度；草稿转发布同样检查。
- Asia/Shanghai 自然日最多 1 次，周一开始的自然周最多 5 次。撤销批准不返还额度，重新批准重新检查。额度不是 Google 限制，也不是 Google 实际收录数量。
- 已批准工具的普通编辑、以 `monitor` 公开工具不被阻止。质量分和 sitemap 的现有判断不变；本保护不替代质量/市场验证，也不自动批准任何工具。
- 新策略默认暂停。历史基线不伪造批准日期；本周历史未核对前，不因账面只有两次已知记录而推断剩余额度。
- 数据库所有者仍能修改或移除触发器，不声称能防止特权管理员绕过。公开收录每日 1–2 个仍是独立执行规则，本触发器只限制索引批准。

## 数据结构

- `tool_index_release_policy`：单行策略，`paused`、`daily_limit`、`weekly_limit`、`pause_reason`、`updated_at`。行锁及版本更新防止并发超额；可降低周限额，不可超过既定 1/5 上限。
- `tool_index_release_log`：`tool_id`、`tool_slug`、`entry_type`、`release_day`、`event_key`、`recorded_at`、`database_actor`、`source`。数据库角色不等于后台操作人的身份。
- `baseline` 日期为空，表示旧批准时间未知；`historical_observed` 是有依据的历史日期；`approval` 是触发器记录的新批准。删除工具不删除历史账本。
- 两表启用 RLS，PUBLIC 与存在的 anon/authenticated 角色无直接权限；触发器使用固定 search_path 的内部函数。

## 验证与应用

```sh
pnpm run test:index-release-guard
pnpm run index-release:guard
pnpm run build
pnpm run index-release:guard -- --commit
pnpm run index-release:guard -- --status
```

第一条在随机隔离 schema 中测试并清理，不修改公开工具。第二条默认事务回滚；只有 `--commit` 应用迁移。`--status` 只读。连接沿用 `.env.local` 与项目连接优先级，不需要新增密钥。

迁移短暂锁定工具写入，锁等待上限 5 秒，单条语句上限 30 秒；失败事务回滚，不反复重试覆盖业务写入。应用前后比较全部工具行哈希，要求无任何工具数据变化。重复迁移不会重置暂停策略或清空账本。

自动测试覆盖：暂停保护、monitor 公开、旧批准编辑、迁移幂等、日/周额度、历史计数、撤销重批、批量失败回滚、冲突忽略插入、草稿发布、READ COMMITTED 与 REPEATABLE READ 并发。

## 后台遇到限制时

- `INDEX_RELEASE_PAUSED`：等待本周批准历史核对，保持 `monitor`，不是保存系统损坏。
- `INDEX_RELEASE_DAILY_LIMIT` / `INDEX_RELEASE_WEEKLY_LIMIT`：本期额度耗尽，保持 `monitor`。不能改日期、清日志或换脚本重试绕过。
- 并发出现序列化失败：刷新数据后检查剩余额度，不盲目自动重试批准。

## 恢复与维护

1. 核对本周 Git、迁移和数据库审计证据；不能用创建日期代替批准日期。
2. 有确凿日期的历史补记使用唯一 `event_key`，没有日期的保留未知基线。
3. 明确历史已核对、剩余额度及审批责任后，由数据库维护者显式解除 `paused`，保留核对记录。脚本不会自动解除暂停。
4. 每次新增批准检查账本和线上 robots/sitemap；Google 收录结果另用 GSC 观察。

紧急时优先设置 `paused=true` 阻止新增批准，不删除日志、不批量切换现有索引状态。
