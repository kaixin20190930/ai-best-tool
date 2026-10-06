# CL02-PUBLISH-GATE-REMEDIATION · 本地候选审计

状态：**代码修复候选；内容与发布 HOLD；未部署、未写生产、未 publish。** 基线 `origin/main@647bcc65`。只新增 superseding migration，不改 20261004 及更早迁移，不改 Task Page、index、sitemap、metadata；主工作区既有两个未提交 SQL 不属于本交付。

## 2026-10-06 官方来源复核

| 对象 | 一手证据与实际范围 | 本次判断 |
|---|---|---|
| Gemini Notebook research-discovery | [来源发现帮助](https://support.google.com/gemininotebook/answer/16215270)描述网页/Drive 查找、选择并导入 notebook，以及移动端限制；不是所有来源自动纳入回答。[升级说明](https://support.google.com/gemininotebook/answer/16213268?hl=en)按套餐列出权限与额度；[新版用量说明](https://support.google.com/gemininotebook/answer/17670842?hl=en)另说明 2026-09-02 起的算力额度与可用性限制。[工作/学校账号说明](https://support.google.com/gemininotebook/answer/16337734)明确权益取决于许可证。 | 尚无目标账号、年龄、地区、管理员开关与 Web/Drive/Deep Research 完整流程的直接核验。**保留 `partial / unknown`，HOLD。** 不用一个 Deep Research 额度推导整个 research-discovery 为 all_plans，也不把 Gemini Apps notebooks 的账号条件替代独立 Notebook 的条件。 |
| Perplexity Free Pro Search | [现行套餐比较](https://www.perplexity.ai/help-center/en/articles/11187416-which-perplexity-subscription-plan-is-right-for-you)，页面标注最后修改 2026-10-02，Free 行仍为 `3/day`。Free 基础搜索、Pro Search 配额与高级模型权益有别；Web/app 与 API 权益分开。 | 更正“精确额度未知/未消歧”的旧文案。**额度事实已明确，不代表两个完整 Capability 的可用性已经核验。** |
| Perplexity research-discovery | [Pro Search 帮助](https://www.perplexity.ai/help-center/en/articles/10352903-what-is-pro-search)，标注最后修改 2026-09-03，说明多次网页搜索、综合与不同焦点。 | 支持开放网页发现这一角色；焦点/模型/账号与套餐改变具体范围，不代表穷尽文献检索、所有焦点可用或 Research 模式权益。候选保留 `strong / unknown`，待目标范围与账号核验。 |
| Perplexity citation-traceability | 同一 Pro Search 帮助说明回到原始来源的直接链接，并要求验证原文。 | 支持来源回查入口，不保证逐条主张准确、证据完整或可复现。候选保留 `partial / unknown`，不由 3/day 推成全套餐保证。 |

以上是官方文档复核，没有目标账号内功能测试，也没有本站引文准确性实测。官方文档中的限额不是本站实测结果。

## 门禁改动

- 新增 `20261006_admin_publish_reviewed_task_tool_group_bilingual_gate.sql`，以 `CREATE OR REPLACE FUNCTION` 替换同签名函数，仅替换 Tool Capability 内容门禁。
- `availability` 为 SQL NULL 或 `unknown` 时拒绝；已有 `support_level` unknown 门槛保留并拒绝 SQL NULL。
- `plan_requirement` 必须为对象，`en/cn` 必须为字符串，去除 ASCII 空白后各至少 3 个 Unicode 字符；额外键也保留旧要求（字符串、至少 3 字符）。
- `limitations` 必须为非空 JSON 数组，每项必须为对象，`en/cn` 均为字符串，去除 ASCII 空白后各至少 8 个 Unicode 字符。SQL NULL、JSON null、单语、空/短文及错误类型均拒绝。
- **不兼容历史 string 数组。** 历史字符串缺少独立双语，不能在发布时推断翻译或降低完整性；先经后台补齐、重审后再预检。旧数据不会由迁移自动转换。
- `preflight-cl02-reviewed-relations.ts` 使用对应纯校验器，输出 `Capability UUID:字段原因`、内容前像和 `20261006-bilingual-publication-gate` 合约标识。仍是只读本地判断，不能据此声称生产 RPC 已安装新版。
- 权限、事务、乐观并发前像、证据锁、exact manifest、same-owner/current/official evidence、幂等审计、Task scope、Gemini/Perplexity Fit 角色门槛保持原实现；静态测试比较新旧函数去掉内容门禁后的全文相等。

## Perplexity 后台编辑候选

机器可读字段前像/候选见 [Perplexity 候选 JSON](./CL02_PERPLEXITY_EDITORIAL_CANDIDATE_2026-10-06.json)。**该文件是审核包，不是执行脚本；本次未保存、未重审任何生产内容。**

1. 在 `/{locale}/admin/decision` 的 Tool Capability 表单，按 JSON 的 `id/toolId/capabilityId/supportLevel/availability/planRequirement/limitations` 逐项填写已有记录。两个 JSON 字段以对象/数组序列化；ID 不得留空。保存草稿，独立内容核验后才重审。不得点击 publish；`availability=unknown` 仍会挡住发布。
2. Decision 的候选只替换 `watch_outs`，`decision_summary` 与所有其他字段保持。当前 `DecisionReviewBoard / transitionDecisionReview` 仅支持状态转换，**没有 `watch_outs` 内容编辑入口**。因此该部分是受控后台编辑候选，需有字段白名单、最新 `updated_at` 与旧值校验、管理员鉴权、编辑责任与审核失效处理的后台写入口后才能应用；不可拿状态按钮或 SQL 直接改内容来代替。此交付没有新增写入口，也不假称现有 Admin 能保存 Decision 文案。
3. 执行前重新读取各行的状态、`updated_at` 与待改字段；任一前像不符停止。JSON 中的时间来自本次只读快照，不能用于覆盖之后编辑。保留 Decision/Capability/Fit links **6/10/7**，不重放历史 Stage 2 seed/review SQL。
4. 新额度文案只更正 3/day 事实；它不解除任何 availability unknown、目标账号核验或独立 QA 条件。Gemini **5/10/6** 保持；两组发布均继续 HOLD。

## 只读回验与验证

2026-10-06T04:27:06.894Z（北京时间 12:27）本次生产 preflight 回读：Gemini links **5/10/6**；Perplexity **6/10/7**。Gemini Fit 已满足候选角色文案，plan purpose 缺口已补齐；2026-10-04 文档的 5/9/6 与旧 rationale 只作历史前像。当前明确 blocker 为 Gemini `…0201` 与 Perplexity `…0201/…0202` 的 `AVAILABILITY_UNKNOWN`，`readyForIndependentQa=false`。生产 limitations 均为完整双语对象，不能误报为字符串缺口；旧 RPC 不接受该形态的问题由待部署迁移解决。

Task URL 返回 **404 + noindex**；两个工具索引均 `indexing_paused`；Task 和两个工具 URL 不在 sitemap；`productionWrites=0`。没有运行生产发布 RPC 或把候选 migration 应用到生产。

隔离 PostgreSQL 覆盖两组真实数量边界、合法双语、错误类型/空/单语/短文/空白、unknown、预检与发布双路径拒绝、审计写入失败后的原子回滚、ACL/角色、前像漂移和 evidence replay，以及发布/撤回不改 Task/Decision/links。初次 initdb 遇宿主机 SHMMNI 资源耗尽；通过显式 `--local-server` 在 `/tmp:5432` 创建随机独立数据库，复用已有角色、结束后删除数据库，不改共享角色及原有数据库。未降低断言。专项 fixture 的第二个证据 profile 原先错误复用同一 owner，导致一次发布生成两条审计；现改为独立 owner，符合生产唯一 owner 约束，并继续验证错配来源拒绝。

| 验证 | 结果 |
|---|---|
| `pnpm run test:decision-cl02-reviewed-group -- --local-server` | PASS；真实 PostgreSQL 14.20，Gemini 5/10/6 与 Perplexity 6/10/7 各完整执行，临时数据库已清理 |
| `pnpm run test:decision-cl02-reviewed-group-static` | PASS；包含新旧非内容逻辑全文一致、内容边界、只生成候选不提升 availability |
| `pnpm run test:decision-task-page` | PASS；既有资格、noindex、sitemap 排除断言 |
| `pnpm run test:decision-capability-admin` | PASS；管理员鉴权与输入校验 |
| `pnpm run test:decision-review-gate` | PASS |
| `pnpm run test:decision-seo-release` | PASS；SEO 范围不变 |
| `pnpm exec tsc --noEmit` | PASS |
| `pnpm run build` | PASS；完整 Next.js production build（既有 Browserslist 数据过期提示，不影响完成） |
| `git diff --check` | PASS |
| `pnpm run decision:cl02-reviewed-relations-preflight` | 预期 exit 1 / HOLD；上列三个明确 availability blocker，生产写入 0 |

主工作区未提交的 `db/supabase/manual/20261003_perplexity_plans_claim_correction.sql` 与 `db/supabase/migrations/20261005_admin_gemini_fit_rationale_recovery.sql` 未编辑、未纳入交付。独立 QA 仍需核验本修复与候选内容；代码测试通过不代表内容完成重审或获得发布授权。
