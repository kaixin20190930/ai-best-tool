# 第三批到期 Claim：2026-10-09 运营槽候选

本地准备日期：2026-10-08。原计划 `publishNotBefore=2026-10-09`（Asia/Shanghai）保留；Owner 于 2026-10-08 明确授权这批候选按顺序执行，不等待自然日，故本批专属 `ownerTimeOverride.effectiveReleaseDate=2026-10-08`，原因固定为 `Owner authorized sequential execution without calendar delay`。此覆盖仅改变第三批日期门禁，不是通用 CLI 绕过开关；生产提交仍须经独立 QA 与原有前像、PASS 来源、后像和受保护字段门禁。开发与回滚演练的持久 `productionWrites=0`。确定性顺序继承[第二批后生产只读审计](./FRESHNESS_BACKLOG_AFTER_BATCH2_2026-10-08.json)：Claude、DeepL、Emdash、Fathom、The Graph。该审计快照的 SHA-256 固定在[第三批候选](../scripts/freshness-third-batch.ts)。旧身份、页面与索引 PASS 仅用于基线继承，`updated_at` 不作事实证据。

| 工具 | 本轮公开 Claim 差分 | 限制与下次复核 |
| --- | --- | --- |
| Claude | `changed`：旧文笼统称订阅不含 API 用量。最新[官方 API credits 说明](https://support.claude.com/en/articles/17154008-monthly-api-credits-for-max-and-team-plans)显示符合资格的 Max/Team 订阅者可关联 Console 组织领取月度 credits，Pro 不包含；超额用量另计。个人公开价格见[官网](https://claude.com/pricing)。 | 账号资格、Console 关联、余额、地区结账与实际额度为 `conditional`；2026-10-22。 |
| DeepL | `no-change`：[Write 字符边界](https://support.deepl.com/hc/en-us/articles/6318834492700-About-DeepL-Write)与[API Developer 累计 100 万字符](https://support.deepl.com/hc/en-us/articles/360021200939-DeepL-API-plans)仍一致。 | 具体席位、文件格式上限、API key 与安全配置为 `conditional`；2026-10-22。 |
| Emdash | `changed`：旧“最新稳定版 v1.2.2”已过时；[官方发布列表](https://github.com/generalaction/emdash/releases)与[更新日志](https://emdash.com/changelog)显示 v1.2.7。仅修正 `features.decision.freshnessSummary`，保留独立市场证据的原日期。 | Agent provider 的安装、账号与计费为 `conditional`；2026-10-22。 |
| Fathom | `changed`：旧文笼统排除移动端与原生线下录音；[官方设备说明](https://help.fathom.video/en/articles/296576)现列 iOS 应用可录制线下对话。修正三语正文与 `audience.notIdealFor`，保留桌面线上会议、Mac 无机器人模式和平台限制。免费版每月 5 次高级摘要仍与[套餐帮助](https://help.fathom.video/en/articles/5290881)一致。 | iOS 实际开通、bot-free 分批可用性及录制同意为 `conditional`；2026-10-22。 |
| The Graph | `no-change`：[Subgraph Studio](https://thegraph.com/studio-pricing/)仍列每月前 100,000 查询免费，此后每 100,000 次 $2；[官方文档](https://thegraph.com/docs/en/gateways/subgraphs/consumer-side/pricing-payments/)继续区分查询与索引成本。 | 具体部署延迟、Indexer 支持与账号账单为 `conditional`；2026-10-22。 |

五项 `checkedAt=2026-10-08`。候选只改变到期的正文/功能 Claim、`features.maintenanceReview` 和 `next_review_date`；不更新 `features.editorial.reviewedAt`，也不重新判定实体、页面、canonical 或索引。Emdash 和 Fathom 的功能字段使用精确前像替换；Fathom 正文固定三语后像摘要。账户/部署事实保留为 Claim-level，不升级为实体 HOLD。

[生产只读 preflight](./FRESHNESS_THIRD_BATCH_PREFLIGHT_2026-10-08.json)五项均 `ready`，记录逐项前像 SHA-256、PASS 来源、正文后像 SHA-256、原计划日期及 Owner 覆盖记录；`productionWrites=0`。[事务回滚演练](./FRESHNESS_THIRD_BATCH_ROLLBACK_2026-10-08.json)五项均 `rolled_back`，对允许字段及受保护字段作事务内回读，持久 `productionWrites=0`。回滚后再次只读读取的五项前像 SHA-256 与原 preflight 完全相同。测试覆盖 `already_applied` 的幂等零写入，以及正文、维护记录、排期、功能 Claim 和 Owner 覆盖记录篡改负例。受保护的 `status`、`page_quality_status`、URL、pricing、身份字段不变；无迁移、push 或 sitemap 改动。

Owner 时间授权允许 2026-10-08 在独立 QA 后按新 preflight manifest 作受控提交；本轮开发不执行生产提交。两份无关 SQL 保留在工作区，排除于本候选提交。
