# Perplexity · CL-02 Stage 2 候选交付

状态：**7/7 官方 claim 已完成生产审核；后台关系审核已成功将现有 Decision、Capability、Fit 标记为 reviewed 并建立精确 links**。套餐 claim 已经受控修正并通过后台 Evidence Review RPC 标记为 verified；Task Page、工具页索引和 sitemap 均未改变。原始候选与单条修正 SQL 仅保留为历史审计，不再是日常执行步骤。

## 范围与依据

- 只复用已存在的 Perplexity 工具 `3d018623-85f9-4df4-bd55-9a4a0e7a2d93`、Task `527fe8b7-c171-4c50-ab1f-9404d7536e7c` 及 `research-discovery` / `citation-traceability` Capability；不新建工具或 Task。
- [字段级官方事实审计](./PERPLEXITY_STAGE2_OFFICIAL_FACT_AUDIT_2026-10-03_CN.md)涵盖开放网页多次检索/综合、直接来源链接、原文核读、搜索焦点、套餐与 API 分离、消费者与 Enterprise 数据使用及来源标签限制。初始候选阶段的套餐 claim 曾为 candidate/HOLD；现行官方比较表明确 Free Pro Searches 为 `3/day`，该 claim 后经后台 PASS 并处于 verified 状态。
- **初始候选快照（审核前历史状态）：** Perplexity owner 下有 1 个 `pending` profile、5 个 `official/pending` source、7 个 `candidate` claim、1 个 `draft` Decision、2 个 `draft` Tool Capability 和 1 个 `draft/conditional` Fit；当时 evidence links 为 **0**。这些是候选生成时的历史状态，最终关系审核结果见下方 `--relation-reviewed` 回验。
- Consensus 已有 published Tool Capability / Fit 与 7+6 link；Gemini Notebook Stage 2 已有 ready profile、7 source、10 verified claim、reviewed Decision/2 Capability/conditional Fit、5/9/6 link。旧 `verify-decision-cl02-three-tool-readonly.ts` 的单 profile/fit 断言已失效，现转入[三工具只读 verifier](../scripts/verify-perplexity-stage2-readonly.ts)。

## 已完成的 Owner 与审核边界

1. Owner 已完成单 claim 修正的 ROLLBACK 预检与显式 COMMIT；在当时的候选修正阶段，修正只改变套餐 claim 的 `claim_value` 与 `validity_scope`，其余六条 verified claim、草稿关系对象和零 links 均保持。
2. 独立审核于 2026-10-04 重开官方套餐页，确认比较表仍列出 Free Pro Searches `3/day`，并通过现有 Admin Evidence Review RPC 执行 PASS；复核截止日为 2026-11-02。
3. 日常 PASS/HOLD 后续只走后台 Evidence Review，不再要求 Owner 执行 routine SQL。Task Page、关系发布与 index/sitemap 仍须分别审批；当前 Task 404/noindex 和 sitemap 排除继续保持。

## 后台关系审核与链接路径（2026-10-04）

Evidence Review Queue 现为 Perplexity profile 提供专用 **Review and link** 操作。它调用一次性 migration `20261004_admin_perplexity_stage2_review.sql` 安装的 service-role RPC；Server Action 先要求真实后台 reviewer，RPC 再核实 service role、reviewer 用户、10 张相关表全部开启 RLS、profile/tool owner、5 个固定官方 URL、7 个固定 claim ID/key/source、claim 均为 verified/current 且来源成功核验，以及固定 Decision、两项 Capability 与 conditional Fit 的关系和状态。已有关系只能为 0 或完整 manifest；部分/额外关系会整体拒绝。成功时把 profile 从 pending 收口到 ready（若尚未 ready），只把三个草稿对象设为 reviewed，写入精确 evidence link 并追加审计。重复执行返回 unchanged，不重复审计。published 状态、Task、工具目录记录、SEO/index/sitemap 均不在 RPC 写范围。

固定 manifest（关系 ID 使用候选包中的固定 ID）：

| Claim | Decision `3d018623-85f9-4df4-bd55-9a4a0e7a2d93` | Capability `...0201` research-discovery | Capability `...0202` citation-traceability | Fit `...0301` |
|---|---|---|---|
| `...0401` web-synthesis | fit | support | — | fit |
| `...0402` direct-links | fit | — | support | fit |
| `...0403` focus | — | support | availability | fit |
| `...0404` plans | limitation | availability + plan | plan | limitation |
| `...0405` api-boundary | limitation | — | — | limitation |
| `...0406` data-boundary | privacy | — | limitation | privacy |
| `...0407` labels-limitation | limitation | limitation | limitation | limitation |

总计 **6 Decision + 10 Capability + 7 Fit = 23 links**。Admin 页面在选中 Perplexity profile 后显示按钮、pending 文案及成功/错误状态。只读 verifier 的 `--relation-reviewed` 阶段检查 reviewed 对象、精确 6/10/7 links、review audit、Task 404/noindex 与 sitemap 排除；生产只读回验结果见下方。

专项本地测试在临时 PostgreSQL 中覆盖 service-role/reviewer 拒绝、RLS、精确关系集合、全量写入、幂等重放及不发布/不建 Task。部署需要**一次性**应用上述 migration；routine 审核无需 SQL Editor 操作。

### 生产关系审核回读修正（2026-10-04）

Owner 回报 migration 已应用，后台同一 RPC 成功返回 `reviewed`、Decision 6、Capability 10、Fit 7。首次只读 verifier 暴露两处断言缺口：已 PASS 的套餐 claim 在关系审核阶段仍应有 `verified_at`；sitemap 检查还须显式排除 Perplexity canonical 工具路由 `/ai/perplexity`。修正后 `--relation-reviewed` 于 `2026-10-04T10:36:43.616Z` **PASS**，输出 `productionWrites=0`、Perplexity profile/source/claim/Capability/Fit 数量 `1/5/7/2/1`、links `[6,10,7]`、`stateMd5=c26a02ce57093a9d33cdfd68a3c46469`。Task 为 `404 + noindex`、`sitemapEligible=false`，Consensus/Gemini 基线保持。此次只读回验没有生产写入。

## 验证与限制

**初始候选阶段的验证记录：** 专项 PostgreSQL 测试使用临时本机数据库，验证 reviewer 缺失/非管理员/与最新 HOLD 不匹配、HOLD 超过 14 天、默认 ROLLBACK、只改两个允许字段、六条 verified 与受保护对象不变、零 links、pre/post hash 和旧前像重放拒绝；测试通过。`pnpm exec tsc --noEmit` 与 `git diff --check` 通过。完整 build 通过，并将 Supabase URL/key 覆盖为不可连接的本地占位值，避免构建过程触达生产；AdSense prebuild 校验通过。本地 sitemap 因未配置 Postgres URL 返回 500，不作为生产 sitemap 结论。当时生产 `--candidate` 回验仍待 Owner 修正后执行，且该轮未连接或写入生产；后续 Owner 已完成修正及后台 PASS，最终生产状态以本节记录的 `--relation-reviewed` PASS 为准。

此前生产只读状态：独立 QA 已通过 `--baseline`；Owner 完成候选与套餐 claim 的受控 ROLLBACK/COMMIT。2026-10-04T06:48:16.596Z 的 `--reviewed` 回验确认 Consensus 保持 published 7/6、Gemini Notebook 保持 reviewed 5/9/6，Perplexity 为 1 profile、5 source、7 verified claim、1 draft Decision、2 draft Capability、1 draft conditional Fit，links=0，`stateMd5=48932b056eb7b4c74ca3729d83432e7d`。其后关系审核已完成，最终状态以上述 `--relation-reviewed` 回验为准。公开 Task 为 404 且 noindex，生产 sitemap 继续排除；不得因关系审核自动发布 Task Page 或索引。
