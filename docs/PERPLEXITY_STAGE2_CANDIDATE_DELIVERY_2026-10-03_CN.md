# Perplexity · CL-02 Stage 2 候选交付

状态：**7/7 官方 claim 已完成生产审核；Decision、Capability、Fit 仍为 draft 且 evidence links 为 0，关系发布继续 HOLD**。套餐 claim 已经受控修正并通过后台 Evidence Review RPC 标记为 verified；Task Page、工具页索引和 sitemap 均未改变。原始候选与单条修正 SQL 仅保留为历史审计，不再是日常执行步骤。

## 范围与依据

- 只复用已存在的 Perplexity 工具 `3d018623-85f9-4df4-bd55-9a4a0e7a2d93`、Task `527fe8b7-c171-4c50-ab1f-9404d7536e7c` 及 `research-discovery` / `citation-traceability` Capability；不新建工具或 Task。
- [字段级官方事实审计](./PERPLEXITY_STAGE2_OFFICIAL_FACT_AUDIT_2026-10-03_CN.md)涵盖开放网页多次检索/综合、直接来源链接、原文核读、搜索焦点、套餐与 API 分离、消费者与 Enterprise 数据使用及来源标签限制。现行官方比较表明确 Free Pro Searches 为 `3/day`；待修正 claim 继续保持 candidate/HOLD。
- 候选仅包含 Perplexity owner 下 1 个 `pending` profile、5 个 `official/pending` source、7 个 `candidate` claim、1 个 `draft` Decision、2 个 `draft` Tool Capability 和 1 个 `draft/conditional` Fit。Decision、Capability、Fit 的 evidence link 全为 **0**；没有验证、review、出版或索引授权。
- Consensus 已有 published Tool Capability / Fit 与 7+6 link；Gemini Notebook Stage 2 已有 ready profile、7 source、10 verified claim、reviewed Decision/2 Capability/conditional Fit、5/9/6 link。旧 `verify-decision-cl02-three-tool-readonly.ts` 的单 profile/fit 断言已失效，现转入[三工具只读 verifier](../scripts/verify-perplexity-stage2-readonly.ts)。

## 已完成的 Owner 与审核边界

1. Owner 已完成单 claim 修正的 ROLLBACK 预检与显式 COMMIT；修正只改变套餐 claim 的 `claim_value` 与 `validity_scope`，其余六条 verified claim、草稿关系对象和零 links 均保持。
2. 独立审核于 2026-10-04 重开官方套餐页，确认比较表仍列出 Free Pro Searches `3/day`，并通过现有 Admin Evidence Review RPC 执行 PASS；复核截止日为 2026-11-02。
3. 日常 PASS/HOLD 后续只走后台 Evidence Review，不再要求 Owner 执行 routine SQL。Task Page、关系发布与 index/sitemap 仍须分别审批；当前 Task 404/noindex 和 sitemap 排除继续保持。

## 验证与限制

本次专项 PostgreSQL 测试使用临时本机数据库，验证 reviewer 缺失/非管理员/与最新 HOLD 不匹配、HOLD 超过 14 天、默认 ROLLBACK、只改两个允许字段、六条 verified 与受保护对象不变、零 links、pre/post hash 和旧前像重放拒绝；测试通过。`pnpm exec tsc --noEmit` 与 `git diff --check` 通过。完整 build 通过，并将 Supabase URL/key 覆盖为不可连接的本地占位值，避免构建过程触达生产；AdSense prebuild 校验通过。本地 sitemap 因未配置 Postgres URL 返回 500，不作为生产 sitemap 结论。生产 `--candidate` 回验须在 Owner 修正后执行；本次没有连接或写入生产。

生产只读状态：独立 QA 已通过 `--baseline`；Owner 完成候选与套餐 claim 的受控 ROLLBACK/COMMIT。2026-10-04T06:48:16.596Z 的 `--reviewed` 回验确认 Consensus 保持 published 7/6、Gemini Notebook 保持 reviewed 5/9/6，Perplexity 为 1 profile、5 source、7 verified claim、1 draft Decision、2 draft Capability、1 draft conditional Fit，links=0，`stateMd5=48932b056eb7b4c74ca3729d83432e7d`。公开 Task 为 404 且 noindex，生产 sitemap 继续排除。下一门禁仅为 Decision/Capability/Fit 的证据链接和编辑关系独立评审；不得因 7/7 claim verified 自动发布关系、Task Page 或索引。
