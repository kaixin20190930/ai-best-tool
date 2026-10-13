# BUILD-APP-DECISION-CLOSEOUT-01 | 安全返工审计

## 当前状态

Bolt、Lovable、Replit、v0 均为**编辑候选 PASS**。12 条新增核心 Claim 已逐条回读官方一手页面，保存短 `sourceExcerpt`、`observedAt`、定位、scope 与复核日；同一来源累计引用不超过 25 个英文词。旧 24 条六维 Claim 的最终结果为：Bolt 5 PASS / 1 HOLD、Lovable 6 PASS / 0 HOLD、Replit 2 PASS / 4 HOLD、v0 5 PASS / 1 HOLD，合计 18 PASS / 6 HOLD。无法由当前官方页面直接支持的精确 Claim 均排除真实写集并保持 `HOLD_SOURCE_EXCERPT`，不阻塞其他 Claim 或工具。

当前生成的真实批次写集为 **3 工具、25 Claim**：Bolt 8 条、Lovable 9 条、v0 8 条。Replit 为 **HOLD_EVIDENCE、0 条进入真实写集**；其公开文档证明 Agent 可从自然语言构建应用，也只说明 Starter 保留既有限制，不能证明目标账号的具体 allowance、重置周期或模式权益，因此 Capability `availability=unknown`。本地 PG 合成 fixture 仍仅用于事务机制测试，不计入真实写集。

Replit 的公开页面不能独立证明目标 Starter 账号当前 Agent 额度或模式；[统一 manifest](../data/decision-graph/build-app-decision-closeout-2026-10-13.json)保留 `availability=unknown` 并保持 HOLD。Bolt、Lovable、v0 已完成 QA、生产 intake 和关系发布；本结论不扩展到 Replit。

## 固定差分

- [写集生成器](../scripts/build-app-decision-batch.ts)：工具必须 `writeEligibility=READY` 且新增三条核心 Claim 有真实摘录；旧六维 Claim 采用 Claim 粒度门禁，`HOLD_SOURCE_EXCERPT` 或 `unknown` 仅排除该条。递归规范化 JSON 使用 ASCII 排序键、UTF-8 字节长度前缀、数组原顺序及安全整数十进制，SHA-256 覆盖 Task、Capability、完整 Task 前像、工具完整 payload、reviewer 和 QA 引用。
- [服务端执行器](../scripts/execute-build-app-decision-batch.ts)：仅服务器 service-role；调用 RPC 期间对 Neon 目录行持有 `FOR SHARE` 并校验 `name/url/status/updated_at`，显式 commit/revert 另需真实 Admin reviewer、独立 QA 线程引用和等于当前完整 payload hash 的 Owner 授权环境值。真实写集为 3 工具 / 25 Claim；执行器在缺少任一授权条件时 fail closed。
- [唯一不可变基础迁移](../db/supabase/migrations/20261013_decision_manifest_batch_intake.sql)：一张仅服务角色可操作的批次记录表及 intake/revert/hash/后像函数，不改目录、Task 页面、索引或 sitemap。RPC 按相同规范重算完整 hash；旧 hash 搭配变化 payload 立即拒绝。锁定目标表和行，核对 Task Capability `status/updated_at/reviewed_at/review_due_at` 非空且有效，任何前像漂移拒绝。默认 intake/revert 在子事务完整演练后 rollback；显式 commit 才持久化。批次记录保存精确 Source、Claim、Timeline、三类关系及 links 的 ID/复合键和**完整行后像**；重放与撤销要求后像逐字段相等、Claim 未过期。撤销只按记录 ID 删除并检查每步行数，不按 profile 清空；新增行、缺行、并发写、已 published 或任何漂移都拒绝。
- [pgcrypto search path 修复](../db/supabase/migrations/20261013_decision_manifest_pgcrypto_search_path.sql)：生产预检发现原 RPC 的固定 `search_path` 无法解析安装在 `extensions` schema 的 `digest(bytea,text)`。修复迁移通过 `pg_depend` 验证函数确属 pgcrypto，再幂等调整该 RPC 的函数级 `search_path`；不修改函数体、权限、表数据或发布状态。修复已执行并通过独立差分 QA。
- [只读 manifest/生产预检](../scripts/preflight-build-app-decision-closeout.ts)与[本地 PG 专项](../scripts/test-build-app-decision-batch.ts)已对齐真实 HOLD 状态。PG 的合成 fixture 仅验证事务机制，加载项目现有官方证据函数与发布 RPC，并加入相关真实 FK/约束和证据关联触发器。它不能替代真实官方来源核验。

## 验证与安全限制

本单最终门禁为：本地 PG 专项、静态 manifest 预检、`tsc --noEmit`、`git diff --check`。PG 专项覆盖规范化 hash 一致性与篡改、缺 Task 前像字段、默认回滚、原子写入、零写重放、过期 Claim、额外 Source、并发阻塞、已发布后拒绝撤销、实际数据库角色 EXECUTE 权限、非目标哨兵与既有发布 RPC preflight。最终运行结果应以本轮命令输出为准；任何失败都留给同一单元 QA，不得写为通过。未改渲染或路由，不做无关完整 build。

生产执行已于 2026-10-13 完成。intake 批次哈希为 `6e42a944284e3f117fbe1ef567f69d6d9b5aed57a6aa71a16a37dd61c0f8d655`：预检事务回滚且 `productionWrites=0`，显式 commit 后幂等复放三工具均为 `unchanged/writes=0`。生产后像为 3 个 ready Profile、18 个 Source、25 个 verified 且无冲突的 Claim、3 个 reviewed Decision Profile，以及 21 条关系证据链接。

随后使用既有 `decision_cluster_transition` 独立门禁发布精确关系组，关系预检哈希为 `de01ba61c9cbd09060f1d0dabcf753142a698440a05ffd4dcbb534b04bc20730`，覆盖 2 条 Task Capability、3 条 Tool Capability、3 条 Fit 和 18 条门禁证据。提交后全部关系为 `published`，reviewer 一致，并产生 3 条 `decision_publication` 审计事件。Replit 未写入、未发布。

公开页面与索引仍独立：`/tasks/build-app-with-ai` 和 `/cn/tasks/build-app-with-ai` 当前均为 404，sitemap 匹配为 0。关系发布不自动开放 Task Page，不自动批准 index/sitemap。批次精确撤销只适用于 reviewed 后像；关系现已 published，如需撤回必须走既有撤回审查。

## 唯一 Owner 授权与下一步

本单已完成，无待执行 SQL 或生产写入。后续独立交付应从 Task Page 页面级批准开始，不得重跑本批次，也不得把 Replit 自动补入。Task Page、Guide/Comparison 和 index/sitemap 继续分别使用各自门禁。
