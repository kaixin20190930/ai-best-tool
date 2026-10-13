# BUILD-APP-EVIDENCE-SNAPSHOT-01：v0 与 Replit 六维证据

日期：2026-10-13（Asia/Shanghai）  
状态：开发完成，待独立 QA；本文件和 JSON 是研究快照，不是比较页发布批准。

机器可读逐 Claim 快
照：[build-app-v0-replit-evidence-2026-10-13.json](../data/collection/build-app-v0-replit-evidence-2026-10-13.json)。`sourceDate`
表示本次访问核验日；官方页面没有一致提供可核实的首次发布日期或最后更新日期，因此没有伪造发布日期。

## 结论

本次只覆盖源码/Git 交接、托管/部署、数据/后端可移植性、集成、费用/用量边界、维护/运维责任六类。每个工具每类一条 Claim，
共 12 条。状态只描述指定范围的公开证据，不等同于工具整体成熟度或生产关系审核。

| 维度              | v0                                                                                                 | Replit                                                                                               |
| ----------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 源码/Git 交接     | `verified_public`：GitHub 分支、自动推送与 PR 流程有文档支持；不包含其他资源的自动迁移承诺。       | `verified_public`：Git/GitHub 导入、修改、推送和分支流程有文档支持；代码同步不等于数据/密钥迁移。    |
| 托管/部署         | `verified_public`：官方路径部署到 Vercel；没有证明可原样转移到其他宿主。                           | `verified_public`：有 Autoscale、Static、Reserved VM、Scheduled 等部署类型；没有证明跨宿主等价迁移。 |
| 数据/后端可移植性 | `unknown`：能连接数据库供应商不等于文档证明完整导出、迁移、凭据与备份方案。                        | `conditional`：文档支持特定数据库数据导出/导入和 PostgreSQL dump/restore 场景；不是全资源一键迁移。  |
| 集成              | `verified_public`：官方列出数据库、AI、外部 API 与 Stripe 等入口；具体取决于服务和项目配置。       | `conditional`：分 managed、Connectors、外部集成及付费 Agent 服务；套餐、权限、密钥和第三方费用各异。 |
| 费用/用量         | `conditional`：记录 2026-10-13 官网显示的计划/用量边界；不代表目标账号最终价或 Vercel 全栈总成本。 | `conditional`：Agent 按 effort 计费，第三方 Agent 服务按供应商 API 费率，credits 也覆盖部分 Replit 云服务；没有适用于所有应用的统一月成本。 |
| 维护/运维责任     | `conditional`：公开材料说明 GitHub/Vercel 权限影响发布，但没有完整客户运维责任矩阵。               | `conditional`：有 shared-responsibility 文档；具体责任、人员、恢复目标和合同仍需逐账号确认。         |

## 官方来源

### v0

- [GitHub 工作流](https://v0.app/docs/github)：连接仓库、分支、PR、权限与源代码真相来源。
- [从 GitHub 导入](https://v0.app/docs/git-import)：导入已有仓库、Vercel 项目配置和预览路径。
- [部署](https://v0.app/docs/deployments)：Vercel 预览与生产发布。
- [数据库集成](https://v0.app/docs/databases)：数据库供应商、集成与环境变量。
- [Quickstart](https://v0.app/docs/quickstart)：数据库、AI、外部 API 与支付集成路径。
- [价格](https://v0.app/pricing)：核验日公开计划、额度和模型 token 计费展示。

### Replit

- [Version control](https://docs.replit.com/learn/projects-and-artifacts/version-control)：Git、GitHub、分支和代码同步。
- [Deployment types](https://docs.replit.com/features/publishing/deployment-types)：不同部署类型的运行和计费模式。
- [Work with your data](https://docs.replit.com/features/data-and-storage/work-with-your-data)：数据浏览、导出及 SQL 工
  具。
- [Shared-database migration guide](https://docs.replit.com/features/data-and-storage/shared-database-migration)：特定数
  据库迁移场景的 dump/restore 步骤及角色/策略限制。
- [Agent Integrations](https://docs.replit.com/features/integrations/overview)：集成分类、权限/计划边界及凭据要求。
- [Replit AI Billing](https://docs.replit.com/billing/ai-billing)：Agent、第三方服务、credits 与费用控制。
- [Publishing costs](https://docs.replit.com/billing/deployment-pricing)：部署模式与云用量成本边界。
- [Shared responsibility model](https://docs.replit.com/features/security/shared-responsibility-model)：平台和应用侧的安
  全责任划分。

## 尚未解决的 Claim

- v0：完整后端/数据导出与供应商迁移、连接服务账户及密钥的可移植性、Vercel 之外的等价部署、客户侧持续运维责任矩阵均没有被
  这组公开材料证明，保持 `unknown` 或限定为 `conditional`。
- Replit：从平台整体迁出代码、数据库、文件、密钥、域名、集成、任务和部署配置的端到端可重复迁移未被证明；目标账户实际套
  餐、费用、连接器授权和合同运维责任也未核实。
- 两者均未做真实账户结账、真实应用导出/恢复、跨平台部署或安全/运维实测；本快照不声称这些测试通过。

## 边界与验证

- 未修改公开路由、metadata、比较文案、运行时代码、数据库、Task/Capability/Fit、canonical、索引、sitemap 或自动化。
- 未触碰两份用户自有 SQL 文件；未提交、推送或部署。
- QA 仅需核对 JSON 与表格字段对应、12 条 claim 的 URL/日期/范围/状态/限制/复查日齐全、状态没有从证据缺口推导“不支持”，以
  及所有相对文档链接有效。无需 TypeScript、build 或 production smoke。
