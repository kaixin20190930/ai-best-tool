# OPS2 无浏览器发布桥

状态：代码候选，未执行生产 commit，尚未授予定时任务生产写入权限。

## 范围

`pnpm run ops2:publish-bridge -- --kind=<candidate|tool|relation> --mode=<preflight|rollback|commit|postcheck> --id=<UUID>`

- `candidate` 只调用现有 `importCollectionCandidateToDraft`，结果最多为 draft，不会公开。
- `tool` 复用 Admin 的 evidence-ready SQL、媒体/付款门禁和原子批量发布 SQL；成功后固定 `published + monitor/noindex`，不改变 index/sitemap 决策。
- `relation` 仅调用现有 Research reviewed-group RPC，要求精确的两条 Tool Capability 和一条 Fit 前像，不涉及 Task Page、工具索引或 sitemap。
- 不为 SciSpace、v0 或任何普通工具添加专属代码、发布 JSON 或 SQL。

四个模式都输出结构化 JSON 与 `productionWrites`。`preflight`、`postcheck` 默认只读。`rollback` 对 Neon 目标在单一事务内执行通用服务后回滚；Research 关系回滚需要 `SUPABASE_DB_URL`，在事务内调用同一 RPC 后回滚。`commit` 要求当前哈希与 preflight 相同，并且有精确 `OPS2_PUBLISH_AUTHORIZATION=<kind>:<id>:<hash>`、`OPS2_ROLLBACK_HASH=<hash>`、`OPS2_REVIEWER_ID=<真实管理员 UUID>` 和 `OPS2_QA_REFERENCE=codex-thread:<独立 QA UUID>`。候选、工具、关系彼此不得复用授权。重复 commit 只有与原始 QA/前像审计匹配才报告 `productionWrites=0`。

## 执行顺序

1. 对数据库中已有候选运行 `--kind=candidate --mode=preflight`，保存输出哈希。使用同一哈希运行 `rollback`，通过后取得独立 QA，再提供四个窄授权环境变量运行 `commit` 和 `postcheck`。该步骤只生成 draft。
2. 在通用数据/Admin 编辑路径补齐真实官方来源、非占位媒体、三语言内容、Claim 边界和市场证据；不得把导入器生成的占位稿直接公开。
3. 对 draft 的工具 UUID 运行 `--kind=tool` 同样的四步。`preflight` 会返回通用发布 blocker；只有空 blocker、rollback、独立 QA 均通过才可 commit。`postcheck` 回读 `published + monitor`、`noindex` 推导及发布审计。
4. Research 使用 Gemini Notebook `cec78907-e2a1-4eb7-853a-a58334026280` 和 Perplexity `3d018623-85f9-4df4-bd55-9a4a0e7a2d93` 两次独立 `--kind=relation` 四步，不共享哈希或授权。RPC 再核对全部精确前像、官方证据与关系数量。

这些环境变量应由总控在单次作业中设置，不能把宽泛或长期 `commit` 授权写入 `.env`。使用 service-role 只用于调用现有 RPC/审核身份；不会替代独立 QA 或放宽数据库门禁。

## 2026-10-12 试运行发现

- 桥的 Gemini Notebook `relation/preflight` 已从无浏览器 CLI 抵达生产 RPC，但 RPC 返回 `operator does not exist: text[] <@ character varying[]`，`productionWrites=0`。现行数据库函数中 `ARRAY['support',...]::text[] <@ ARRAY(SELECT l.purpose ...)` 的右侧为 `varchar[]`；Fit 的同类表达式亦然。必须作为一次性、受审查的数据库函数修复，不能改为客户端直接更新关系、不能通过 routine SQL 绕过。修复前 Research `rollback/commit` 保持 HOLD。
- SciSpace/v0 目前只有候选缓冲记录，不能把缓冲 JSON 当成已进入生产 `collection_candidates`。只有数据库中出现真实候选 UUID 后才能跑 `candidate`；导入 draft 后仍须逐项完成通用门禁。不能承诺本次试运行已发布它们。
- 本次没有执行任何生产 commit、索引批准、sitemap 更新或工具专属发布代码。

## 已知边界

- 候选导入、工具公开和关系发布是三个分开的对象授权；没有把它们伪装为跨 Neon/Supabase 的原子事务。
- `candidate` preflight 只验证现有候选和 URL；最终官方身份与重复实体由事务内导入后的唯一身份检查及工具发布前门禁再次检查。候选仍可能因外部元数据变化而在 rollback/commit 间触发前像或 QA 重审。
- 单项不超过 60 分钟；生产 RPC、权限、事实冲突或重复实体异常立即停止，不自动扩张范围。
