# BUILD-APP-BOLT-LOVABLE-EVIDENCE-01：Bolt 与 Lovable 六维证据

日期：2026-10-13（Asia/Shanghai）  
状态：开发候选已完成，待独立 QA；不构成页面、关系或索引发布批准。

机器可读快
照：[build-app-bolt-lovable-evidence-2026-10-13.json](../data/collection/build-app-bolt-lovable-evidence-2026-10-13.json)。
本次 `sourceDate` 与 `reviewedDate` 均表示 2026-10-13 直接复核官方页面，不把网页抓取日期冒充供应商发布日期。

## 结论

本快照补齐 Bolt 与 Lovable 各六条 Claim：源码/Git 交接、托管/部署、数据/后端可移植性、集成、费用/用量边界、维护/运维责
任。均指向 `bolt.new` 的 Bolt（StackBlitz 产品），不包括 `bolt.diy`；Lovable 使用其官方 `lovable.dev` 与
`docs.lovable.dev` 产品资料。

| 维度              | Bolt                                                                                                    | Lovable                                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| 源码/Git 交接     | `verified_public`：官方文档支持 GitHub 仓库连接与代码同步；不代表 Cloud 资源一并迁移。                  | `verified_public`：支持 GitHub/GitLab/Bitbucket 双向代码同步或代码下载；数据库内容、密钥等不在仓库中。           |
| 托管/部署         | `verified_public`：内置 Bolt Hosting，可发到 bolt.host；也有条件式 Netlify 路径。                       | `verified_public`：发布快照到 lovable.app，含 HTTPS；自定义域和品牌域受套餐条件约束。                            |
| 数据/后端可移植性 | `conditional`：可使用 Bolt Database 或符合条件时连接/认领 Supabase；切换有额外步骤。未做迁移实测。      | `conditional`：Cloud 数据库可导出；官方迁移指南将代码、后端恢复和服务重配列为分步工作。文件、函数、密钥等另行处理。 |
| 集成              | `conditional`：官方列有 Expo、Stripe、GitHub、Google SSO、MCP、Netlify、Supabase 等；权限和计划有差异。 | `conditional`：有 App、Chat、App-user、MCP、custom connector 与 API 路径；服务授权、费用和可用性依具体集成而异。 |
| 费用/用量         | `conditional`：记录核验日官网显示的计划和用量结构；token、托管、数据库及外部服务不可合并成固定总成本。  | `conditional`：credits 覆盖构建、Cloud、AI 等不同用途；额度授予、刷新、过期及工作区实际用量会影响成本。          |
| 维护/运维责任     | `conditional`：官方有安全检查，但部分连接服务问题仍需用户处理；不等于安全保证或完整运维合同。           | `conditional`：官方明确扫描不保证完全安全，应用方仍需按用途负责安全要求。                                        |

**状态分布：**Bolt 2 条 `verified_public`、4 条 `conditional`、0 条 `unknown`；Lovable 2 条 `verified_public`、4 条
`conditional`、0 条 `unknown`。12 条合计 4 条 `verified_public`、8 条 `conditional`、0 条 `unknown`。`conditional` 表示
该 Claim 只在明确范围内成立，不表示工具整体未通过收录。

## 官方来源

### Bolt（bolt.new / StackBlitz）

- [GitHub for version control](https://support.bolt.new/integrations/git)：代码同步、仓库及分支流程。
- [Hosting](https://support.bolt.new/cloud/hosting)：Bolt Hosting 与发布入口。
- [Supabase for databases](https://support.bolt.new/integrations/supabase)：Bolt Database、Supabase 及套餐/切换条件。
- [Intro to Bolt](https://support.bolt.new/get-started/intro-bolt)：Bolt 身份、官方集成与 Bolt Cloud 概览。
- [Plans & pricing](https://bolt.new/pricing)：核验日公开计划、token 与托管显示。
- [Check your project's security](https://support.bolt.new/building/security)：安全检查功能、发布前建议与用户后续事项。
- [Netlify for hosting](https://support.bolt.new/integrations/netlify)：外部部署路线及其前提，作为托管 Claim 的补充来
  源。

### Lovable

- [Git sync overview](https://docs.lovable.dev/integrations/git-sync-overview)：GitHub/GitLab/Bitbucket 双向代码同步、边
  界与仓库不含数据库数据。
- [How Lovable hosts your app](https://docs.lovable.dev/features/hosting)：发布快照、lovable.app、HTTPS 和域名边界。
- [Advanced settings](https://docs.lovable.dev/features/advanced-settings)：Cloud 数据导出范围、排除项和迁移步骤边界。
- [Deploying and hosting outside Lovable](https://docs.lovable.dev/tips-tricks/external-deployment-hosting)：官方站外部署、后端/数据迁移和验证步骤。
- [Lovable connectors](https://docs.lovable.dev/integrations/introduction)：Connector 类型与直接 API 集成方式。
- [Credits and usage](https://docs.lovable.dev/introduction/credits-and-usage)：usage grants、credits、用量和过期边界。
- [Security overview](https://docs.lovable.dev/features/security)：内置安全扫描及应用方责任限制。
- [Connect to Supabase](https://docs.lovable.dev/integrations/supabase)：自有 Supabase 与内置 Cloud 的差异、账单和切换非
  自动边界。

## 重要未决项

- 本次未登录任何 Bolt 或 Lovable 账户，没有检查实际结账、工作区余额、组织授权或账户迁移状态。
- 未实际创建应用、导出/恢复数据库、跨平台部署、验证密钥迁移或运行安全审计；不得把公开文档陈述写成本站实测。
- Bolt 的具体 Cloud 数据导出范围和不同账户/套餐下的 Supabase 转换效果仍需按实际项目确认；不可据此声称完整可移植或不可移
  植。
- Lovable Cloud 的数据库导出不含 Storage 文件、Edge Function 代码和 Secrets；端到端迁移仍要重新配置认证、API keys、环境
  变量和外部服务。
- 费用数据会变化。Bolt 数字仅为核验日公开页面展示；Lovable 按工作区计划、credits 授予规则和实际用量计费。两者均不应作
  固定总成本承诺。
- 维护 Claim 只说明官方公开的检查或责任边界，不代表实际应用安全、可用性、备份能力、人员配置或 SLA。

## 范围与验收

- 仅新增版本化 JSON 与本审计文档；没有改 Tool 页面、Task/Capability/Fit 关系、运行时、自动
  化、canonical、index/noindex、sitemap、生产数据或数据库。
- 未触碰两份用户自有 SQL 文件；未提交、推送或部署。
- R 级验证限于 JSON/schema 断言、格式、相对链接和 `git diff --check`。不运行 TypeScript、build、production smoke 或数据
  库操作。
- **独立 QA 焦点：**确认两工具各恰好六个稳定维度且 stableKey 一致；来源 URL 对应官方 Bolt/StackBlitz 与 Lovable 产品，而
  非 bolt.diy 或相似名称产品；每条 Claim 的来源、日期、scope、value、limitation 与 nextReviewDate 完整；额度/套餐
  /connector 条件未泛化；source handoff 未被写成完整资源迁移；所有未实测事项明确保留为未验证；JSON 表格和此处状态分布一
  致。无需重跑其他已通过门禁。
