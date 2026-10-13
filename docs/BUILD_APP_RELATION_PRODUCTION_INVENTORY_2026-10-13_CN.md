# BUILD-APP-RELATION-PRODUCTION-INVENTORY-01：生产关系只读盘点

核验时间：`2026-10-13T08:34:51.528Z`（UTC；QA 窄修复后的唯一重跑）  
结果：**读取成功；四工具生产 Decision Graph 关系均为 0；零生产写入。**  
机器快照：[build-app-production-inventory-2026-10-13.json](../data/decision-graph/build-app-production-inventory-2026-10-13.json)  
只读 verifier：[verify-build-app-production-inventory-readonly.ts](../scripts/verify-build-app-production-inventory-readonly.ts)

## 结论

生产 Neon 目录库唯一读到 Bolt、Lovable、Replit、v0-by-Vercel 四个实体，状态全部为 `published`。Supabase Decision Graph 对 Task、Capability taxonomy、Task Capability、Tool Capability、Fit、profile、source、claim、evidence-link 的查询均成功；空数组是成功 GET 后的实际零行，不是因权限错误而不可见。

| 目标 | 目录工具 | Tool profile | Sources | Claims | Tool Capability | Fit（任何 Task） | Evidence links |
|---|---|---:|---:|---:|---:|---:|---:|
| Bolt | `04570837-c50d-4aa2-b8aa-a11738046fe5` / published | 0 | 0 | 0 | 0 | 0 | 0 |
| Lovable | `8fee5c8b-f284-41d4-b691-c099e5bb230b` / published | 0 | 0 | 0 | 0 | 0 | 0 |
| Replit | `b14c8fe0-3dc5-47ed-8dd8-9d16c9892f85` / published | 0 | 0 | 0 | 0 | 0 | 0 |
| v0 by Vercel | `2d598569-ba06-4f65-966b-dde8df1161cc` / published | 0 | 0 | 0 | 0 | 0 | 0 |

Task `build-app-with-ai`：ID `10ffdf04-6885-4a28-949d-0723038c6954`，`active`，输出 `application`；当前描述要求实现及集成审核。两条关系均存在且 `reviewed`：`ai-assisted-app-development` = `required`，`developer-workflow-integration` = `preferred`，各自 review due `2026-12-22T06:06:52.904308+00:00`。本轮未修改 Task 或其关系。

Profile 数为 0，故四工具的 profile version、profile review date、profile source/claim 版本均为**不适用（无 profile 行）**，不是字段不可读取。四工具没有 Tool Capability/Fit 行，所以这些行的 status、`updated_at`、review dates 与 evidence links 均不适用；不得用编辑性 Guide 或离线 Claim 包替代生产关系。

## 与先前资料差分

- 对比 2026-10-13 readiness 清单：清单原标记四工具生产关系 `unknown_until_read_only_inventory`。本次把“未知”收敛为明确事实：四工具各 0 profile、0 source、0 claim、0 Tool Capability、0 Fit、0 evidence link；Task Capability 两条维持 `reviewed`。这与离线收集的 24 条版本化 Claim 不冲突，它们尚未写入生产 Intelligence profile。
- 对比 2026-09-28 CL-04 历史回读：该快照对象是 n8n/OpenRouter，不是本次四工具。历史记录中两条 Task Capability 为 `reviewed`；n8n/OpenRouter 各有一条 Tool Capability、Fit、一个 Tool support link 和一个 Fit link，合计 12 sources / 7 claims。2026-09-28 两条旧 Fit 随后被受控撤回至 `stale`，Tool Capability 保持 `reviewed`。它们不属于本次盘点对象，不能据此推断 Bolt/Lovable/Replit/v0 有关系。

## 只读与零写证明

- Neon：仅 `BEGIN READ ONLY`、参数化 `SELECT`、`ROLLBACK`；没有执行 SQL 写语句。
- Supabase：verifier 为所有请求强制 HTTP `GET`，任何非 GET 在发出网络请求前抛错；未调用 RPC。
- verifier 成功输出 `productionWrites: 0`、`databaseMethods: ["SELECT"]`、`supabaseHttpMethods: ["GET"]`、`rpcCalls: 0`。
- QA 窄修复：候选发现的官方域名正则加入 `v0.app` 并保留 `v0.dev`，host 精确到完整域名边界；身份解析必须同时匹配明确允许的名称别名和对应官方 host。单边命中、名称/域名交叉、重复 key 都 fail closed，并在错误中列出候选。
- 生成本地 JSON 快照不是生产写入。未触碰数据库、公开页面、Guide、Comparison、Task Page、SEO、索引、sitemap；未提交、推送或部署。
- 两份受保护用户 SQL 文件保持原样，未纳入本交付。

## 后续

本单仅完成生产状态盘点，不批准关系发布。下一步应由独立 QA 核对快照与本审计。QA 通过后，针对四工具逐个补充直接官方核心应用生成能力、可用范围/计划限制和 Task Fit 证据；未完成证据及关系审核前继续保持生产关系为 0，不创建 Task Page 或 Comparison。
