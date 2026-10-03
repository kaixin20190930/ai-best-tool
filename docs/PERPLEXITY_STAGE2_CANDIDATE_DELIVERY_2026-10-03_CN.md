# Perplexity · CL-02 Stage 2 候选交付

状态：**候选待 Owner 执行 / 待人工审核**。本次没有生产写入、关系发布、Task Page、工具页、索引或 sitemap 修改。基线为 `main 49d92497`。唯一可供 Owner 在 Supabase SQL Editor 执行的文件为 [20261003_perplexity_stage2_candidate.sql](../db/supabase/manual/20261003_perplexity_stage2_candidate.sql)；仓库没有为本批提供审核提升或发布 SQL。

## 范围与依据

- 只复用已存在的 Perplexity 工具 `3d018623-85f9-4df4-bd55-9a4a0e7a2d93`、Task `527fe8b7-c171-4c50-ab1f-9404d7536e7c` 及 `research-discovery` / `citation-traceability` Capability；不新建工具或 Task。
- [字段级官方事实审计](./PERPLEXITY_STAGE2_OFFICIAL_FACT_AUDIT_2026-10-03_CN.md)涵盖开放网页多次检索/综合、直接来源链接、原文核读、搜索焦点、套餐与 API 分离、消费者与 Enterprise 数据使用及来源标签限制。Free Pro Search 精确额度因官方页面冲突为 `unknown`；候选不固化 3 或 5 的任何数值。
- 候选仅包含 Perplexity owner 下 1 个 `pending` profile、5 个 `official/pending` source、7 个 `candidate` claim、1 个 `draft` Decision、2 个 `draft` Tool Capability 和 1 个 `draft/conditional` Fit。Decision、Capability、Fit 的 evidence link 全为 **0**；没有验证、review、出版或索引授权。
- Consensus 已有 published Tool Capability / Fit 与 7+6 link；Gemini Notebook Stage 2 已有 ready profile、7 source、10 verified claim、reviewed Decision/2 Capability/conditional Fit、5/9/6 link。旧 `verify-decision-cl02-three-tool-readonly.ts` 的单 profile/fit 断言已失效，现转入[三工具只读 verifier](../scripts/verify-perplexity-stage2-readonly.ts)。

## Owner 执行边界

1. 先在只读环境运行 `node scripts/pub-03-readonly-run.mjs pnpm exec tsx scripts/verify-perplexity-stage2-readonly.ts --baseline`；必须完成包括公开 Task 404/noindex 与 sitemap 的全部检查。若任何断言或网络检查失败，保持 HOLD。
2. 在 Supabase SQL Editor 原样执行唯一 candidate SQL。文件最后一行固定为 `SELECT * FROM pg_temp.perplexity_stage2_candidate('ROLLBACK');`，返回一行 `mode=preflight`、`profiles/sources/claims/decision/capabilities/fit/links=1/5/7/1/2/1/0` 和 `post_md5`；内部子事务回滚，不留候选写入。RLS、固定 ID、Task/Capability 身份、重复实体、跨 owner 固定 ID、旧 link 与字段漂移有 fail-closed 检查。结果与基线不符即停止。
3. Owner 认可预检后，在新 SQL Editor 会话只把最后一行模式改为 `'COMMIT'`，其余内容不变；保存该次返回的 `post_md5` 至私有审计记录，并运行同一只读 verifier 的 `--candidate`。此步只提交候选，不执行人工审核。重复执行应返回同一 postimage；任何漂移会拒绝。
4. 独立审核人逐条打开五个官方 URL，核对七个 claim 的原文、套餐/模式/地区范围与来源上下文；还须核对实际引用路径。随后另案通过现有受控审核流程决定 verified/reviewed 和 link，不得由本包自动提升。公开关系、Task Page、index/sitemap 必须分别审批；当前页面 404/noindex、Gemini Notebook noindex/sitemap 排除继续保持。

## 验证与限制

本地临时 PostgreSQL 专项测试覆盖默认预检无残留、提交、幂等、九表 RLS、跨 owner 固定 source ID 冲突、重复官方域名、claim 漂移、完整 postimage hash 与零 link；测试已通过。`pnpm exec tsc --noEmit`、完整 `pnpm run build`、`git diff --check` 均通过。本地构建后的 Task URL 返回 `404` 和 `x-robots-tag: noindex, follow`；本地 sitemap 因未配置 Postgres URL 返回 500，不作为生产 sitemap 结论。

生产只读状态：开发隔离环境访问 `https://aibesttool.com` 时曾出现 `fetch failed`，但后续独立 QA 已用只读包装器完整通过 `--baseline`：Consensus 保持 published 关系，Gemini Notebook 保持 reviewed 5/9/6，Perplexity 仍为空基线；公开 Task 为 404/noindex，sitemap 排除相关路径。该结果解除的是候选包的代码验收门禁，不等于授权生产候选写入。当前代码没有自动生产写入路径，Owner 仍须按上方 ROLLBACK 预检、显式 COMMIT 和 `--candidate` 回读三步执行。
