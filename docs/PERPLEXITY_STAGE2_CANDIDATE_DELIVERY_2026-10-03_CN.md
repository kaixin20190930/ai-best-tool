# Perplexity · CL-02 Stage 2 候选交付

状态：**生产候选已写入 / 第一轮审核为 6 PASS + 1 HOLD；套餐 claim 的候选修正包已准备，待 Owner 执行**。本次修正仍只把该 claim 留在 candidate/HOLD，不改变关系、Task Page、工具页、索引或 sitemap。原始候选 SQL 保留为历史交付；单条修正 SQL 为 [20261003_perplexity_plans_claim_correction.sql](../db/supabase/manual/20261003_perplexity_plans_claim_correction.sql)，默认 `ROLLBACK`。

## 范围与依据

- 只复用已存在的 Perplexity 工具 `3d018623-85f9-4df4-bd55-9a4a0e7a2d93`、Task `527fe8b7-c171-4c50-ab1f-9404d7536e7c` 及 `research-discovery` / `citation-traceability` Capability；不新建工具或 Task。
- [字段级官方事实审计](./PERPLEXITY_STAGE2_OFFICIAL_FACT_AUDIT_2026-10-03_CN.md)涵盖开放网页多次检索/综合、直接来源链接、原文核读、搜索焦点、套餐与 API 分离、消费者与 Enterprise 数据使用及来源标签限制。现行官方比较表明确 Free Pro Searches 为 `3/day`；待修正 claim 继续保持 candidate/HOLD。
- 候选仅包含 Perplexity owner 下 1 个 `pending` profile、5 个 `official/pending` source、7 个 `candidate` claim、1 个 `draft` Decision、2 个 `draft` Tool Capability 和 1 个 `draft/conditional` Fit。Decision、Capability、Fit 的 evidence link 全为 **0**；没有验证、review、出版或索引授权。
- Consensus 已有 published Tool Capability / Fit 与 7+6 link；Gemini Notebook Stage 2 已有 ready profile、7 source、10 verified claim、reviewed Decision/2 Capability/conditional Fit、5/9/6 link。旧 `verify-decision-cl02-three-tool-readonly.ts` 的单 profile/fit 断言已失效，现转入[三工具只读 verifier](../scripts/verify-perplexity-stage2-readonly.ts)。

## Owner 执行边界

1. 基线候选、首轮审核与生产只读状态已记录于下文；修正 SQL 当前仅作为待执行的单 claim 包。
2. Owner 先只读查看 target claim 最新 HOLD audit 的 reviewer UUID/email，并确认该 `auth.users` 用户的 `raw_user_meta_data.role` 为 `admin` 或 `moderator`。在 [plans claim 修正 SQL](../db/supabase/manual/20261003_perplexity_plans_claim_correction.sql) 开头填入这组 reviewer 值和精确格式的 Owner approval：`APPROVE_PERPLEXITY_PLANS_CORRECTION:<reviewer UUID>:<lowercase email>:USER_METADATA_ROLE`。默认末行为 `ROLLBACK`，必须返回 `mode=preflight`、`corrected_claims/verified_claims/decision/capabilities/fit/links=1/6/1/2/1/0`、reviewer、HOLD 时间与 `pre_md5/post_md5`。HOLD 必须在过去 14 天内；任一 guard 不符即停止。
3. 核对预检结果后，在同一 SQL Editor 会话只把最后一行模式改为 `COMMIT` 并重跑；保存该次 reviewer、HOLD 时间及 `pre_md5/post_md5`，然后运行只读 verifier `--candidate`。修正只保留 candidate/HOLD，不构成人工审核、PASS 或 link。
4. 随后由独立审核人重开官方来源并通过现有 Admin Evidence Review RPC 再次审核该 claim。Task Page、关系发布、index/sitemap 仍需分别审批；当前 Task 404/noindex、Gemini Notebook noindex/sitemap 排除继续保持。

## 验证与限制

本次专项 PostgreSQL 测试使用临时本机数据库，验证 reviewer 缺失/非管理员/与最新 HOLD 不匹配、HOLD 超过 14 天、默认 ROLLBACK、只改两个允许字段、六条 verified 与受保护对象不变、零 links、pre/post hash 和旧前像重放拒绝；测试通过。`pnpm exec tsc --noEmit` 与 `git diff --check` 通过。完整 build 通过，并将 Supabase URL/key 覆盖为不可连接的本地占位值，避免构建过程触达生产；AdSense prebuild 校验通过。本地 sitemap 因未配置 Postgres URL 返回 500，不作为生产 sitemap 结论。生产 `--candidate` 回验须在 Owner 修正后执行；本次没有连接或写入生产。

生产只读状态：独立 QA 已通过 `--baseline`；Owner 随后完成 ROLLBACK 预检和显式 COMMIT。2026-10-03T13:47:13.777Z 的 `--candidate` 回验确认 Consensus 保持 published 7/6、Gemini Notebook 保持 reviewed 5/9/6，Perplexity 为 1/5/7/1/2/1 且 links=0，`stateMd5=25bb15aa49c43382cd59ee90527645d8`。公开 Task 为 404 且 `x-robots-tag: noindex, follow`，生产 sitemap 对 Task 与 Perplexity 匹配为 0。随后逐条复核五个官方来源：web synthesis、direct links、focus、API boundary、data boundary、source-label limitation 六条 PASS；plans claim 因官方比较表已明确 `3/day` 而 HOLD。最终回读为 6 verified + 1 candidate，7 条审核审计完整，links 仍为 0。修正 SQL 只改 `...0404` 的 claim_value 与 validity_scope，检查最新审计仍为 HOLD、六条 verified、固定来源及零 links；默认回滚，显式 COMMIT 后仍须 candidate/HOLD。Owner 下一动作：在 Supabase SQL Editor 运行专项 SQL，先核对 ROLLBACK 预检的一行回执，再仅将末行模式改为 COMMIT 重跑；随后独立审核人通过现有 Admin Evidence Review RPC 再作审核决定。修正包不含 PASS 或 link 操作，不得直接审核或发布 Decision/Capability/Fit。
