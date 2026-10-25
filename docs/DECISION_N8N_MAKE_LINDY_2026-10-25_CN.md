# DECISION-N8N-MAKE-LINDY-2026-10-25 固定审计

日期：2026-10-25（Asia/Shanghai）。本单元一次性交付 n8n、Make、Lindy 的用户可见选择路径；截至本记录，仅本地代码与构建验收完成，未部署、未写生产数据库、未提交 index/sitemap 授权。

## 选择入口与边界

- 使用既有 `/guides/ai-tools-for-automation-comparison` 作为唯一三工具 Structured Comparison；EN/CN/TW 主路由均为 `200`、自指 canonical、`noindex, follow`，sitemap 不含该路径。
- n8n、Make、Lindy 工具页 Decision Card 中接入同语言对比 CTA；自动化指南 Task Path 改为三者及真实适用条件。n8n 的既有 allowlist metadata 聚焦价格、自托管和 Make 对比。未创建新的工具实体、Task/Fit/Capability 关系、评分服务、专属表或专属发布器。
- 旧 `n8n-alternatives-comparison`、`make-alternatives-comparison`、`ai-automation-tools-comparison` 同义路径通过 middleware 对 GET/HEAD 做同语言 HTTP 308，保留 query；指南清单不再推荐这些别名。页面 fallback 也指向主路由。
- `n8n` 现有 continue_index 状态未重审；新 comparison 保持 noindex 和 sitemap excluded。GSC 凭据不可用，最近有效快照仍截至 2026-10-14；本单元没有实时流量、Coverage 或新收录结论。近期复盘中 n8n 7 天页面头部行为 705 impressions / 1 click，仅用作优先级依据，不能归因全部查询。

## 内容证据与判断

所有官方来源在 2026-10-25 读取；八条可见 evidence 在 `lib/content/automationDecisionComparison.ts` 记录 `checkedAt`、具体 Claim 与决策影响。

| 工具 | 官方证据 | 用户选择边界 |
| --- | --- | --- |
| n8n | [定价](https://n8n.io/pricing/)、[版本对照](https://docs.n8n.io/deploy/host-n8n/community-edition-features/)、[许可问答](https://support.n8n.io/article/can-i-use-your-license-for-my-use-case) | Cloud 以完整 execution 计费；Community 可自托管，但运维与部分治理自负，外部客户配置工作流等用途应先核许可。 |
| Make | [Credits](https://help.make.com/credits)、[运行级用量记录](https://help.make.com/introducing-credit-usage-history)、[组织与数据区](https://help.make.com/organizations) | 确定的跨 SaaS scenario 与业务团队快速配置；AI credits 和自有模型商费用分开估，组织数据区创建后不可改。 |
| Lindy | [定价](https://www.lindy.ai/pricing)、[用量与暂停](https://docs.lindy.ai/account-billing/usage) | 开放式跨工具委派；活跃用户按席位计费，credits 入团队共享池，重任务会暂停确认；仍须审核结果与目标工作区权限。 |

页面提供部署/责任、工作模型、计费单位、人工确认与治理四项差异、逐工具 Best for/Not ideal、关键限制、FAQ 和进一步查看工具卡/指南的路径。没有账户级试用、结账、稳定性、权限或每任务成本实测。官方公开能力不等于当前账号已启用。

## 增量验收

- `pnpm run test:structured-comparison` PASS；三工具候选、四维度、八来源通过既有 `validateVerifiedComparison` 合约；`pnpm run test:guide-decision-paths` PASS；`pnpm exec tsc --noEmit` PASS；`git diff --check` PASS。
- 路由与渲染改变触发完整 build。首轮 `pnpm run build` PASS；随后本地 HTTP 检查发现页面级旧别名跳转会流式返回 200，遂用仓库现有 middleware 308 模式修复并补做第二次 build，PASS。这是针对实际发现的路由缺陷的修复验证，不是重复一般 QA。
- 第二轮构建后的本地回读：EN/CN/TW 主路由 `200 + verified`、自指 canonical、`noindex, follow`；CN 旧 n8n 别名 `308` 到同语主路径并保留 `?from=tool`；本地 sitemap 中主路径与三个别名均为 0 条。此为本地回读，非部署后生产 smoke。
- 既有 Tool/Freshness PASS 未重验；没有生产数据库写入。两条受保护 SQL 和 `docs/FRESHNESS_CLAIM_DUE_BATCH_2026-10-15.json` 为进入任务前已有工作区改动，本单元未编辑或纳入交付。

## 交付状态

本地实现与固定审计完成。建议仅提交本单元的 comparison 数据、页面、指南、metadata、middleware 与此审计文档；受保护文件保持排除。总控可按既有发布流程审阅与部署；部署后仅做一次针对主路径、别名 308、canonical/robots/sitemap 和工具入口的生产 smoke。没有本单元需要的数据库迁移或新索引申请。
