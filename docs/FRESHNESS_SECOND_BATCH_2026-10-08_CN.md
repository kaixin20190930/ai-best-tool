# 第二批到期 Claim 复核候选（2026-10-08）

本交付只制作可精确验收的候选，**生产持久写入为 0，未 push**。[实时只读审计](./FRESHNESS_SECOND_BATCH_AUDIT_2026-10-08.json)仍为 71 条工具、55 条 published、29 条到期，其中 `claim_due=16`。确定性选择器前五依次为 Gemini、Notion、n8n、OpenRouter、Poe，与预期相同。`updated_at` 仅用于并发前像哈希，绝不作为事实证据。

## Claim 差分

| 工具 | 公开事实结论 | 边界与未决 Claim | 下次复核 |
| --- | --- | --- | --- |
| Gemini | `no-change`：个人账号计算量限额每 5 小时刷新，仍受周上限约束；关闭 Keep Activity 后的聊天仍保留 72 小时。只刷新核查日期。 | 工作/学校账号、地区资格和登录后的实际用量为 `conditional`，不延长实体身份核验。 | 2026-10-22 |
| Notion | `changed`：在原 Business/Enterprise、Free/Plus 有限试用及分档用量说明中补充：高级模型使用 Notion credits，须由工作区所有者或管理员开启。 | 实际开关、额度和数据留存功能属于工作区配置，保持 `conditional`；Enterprise 的默认零留存不可泛化到外部 Agent。 | 2026-10-22 |
| n8n | `changed`：原文把 AI Assistant credits 与工作流模型成本简单分开，现限定为 Cloud 套餐有 Assistant credits 和免 API key 模型；使用外部供应商 key 的成本另算。公开年付 Starter €20/2.5K、Pro €50/10K、Business €667/40K 与执行计费未变。 | 选定模型、套餐、账户额度和真实流程消耗为 `conditional`。 | 2026-10-22 |
| OpenRouter | `changed`：Standard 平台费 5.5%，Business 为 8%；Standard/Business BYOK 前 $25,000/月标价推理免平台费、之后 5%。删除旧 Enterprise 固定 $200,000 门槛，官方只列 custom。 | Enterprise 报价为 Claim 级 `unknown`；所选模型和供应商成本须以账户账单核对。 | 2026-10-15 |
| Poe | `no-change`：按 Bot 使用 compute points、订阅购买渠道和隐私盾牌边界仍与官方资料一致。只刷新核查日期。 | 地区结账价、账号点数、具体 Bot 成本与权限为 `conditional`。 | 2026-10-22 |

核查来源均为当日可读的官方页面：[Gemini 用量](https://support.google.com/gemini/answer/16275805?hl=en)、[Gemini Privacy Hub](https://support.google.com/gemini/answer/13594961?hl=en)、[Notion AI FAQ](https://www.notion.com/help/notion-ai-faqs)、[Notion AI 安全](https://www.notion.com/help/notion-ai-security-practices)、[n8n 定价](https://n8n.io/pricing/)、[OpenRouter 定价](https://openrouter.ai/pricing)、[Poe 购买 FAQ](https://help.poe.com/hc/en-us/articles/19945140063636-Poe-Purchases-FAQs)及[Poe 隐私中心](https://poe.com/pages/privacy-center)。完整来源、范围、Claim 状态、`checkedAt` 和 `nextReviewDate` 固定在 [`SECOND_BATCH`](../scripts/freshness-second-batch.ts)。无账户实测、结账或独立性能测试。

## 执行与验收边界

五项沿用首批通用执行器 [`run-freshness-first-batch.ts`](../scripts/run-freshness-first-batch.ts)，指定 `--batch=second`。实体基线继承 2026-09-04 的已发布编辑记录，身份资料固定在[首批 post-commit 审计](./FRESHNESS_BACKLOG_POSTCOMMIT_2026-10-08.json)的 SHA-256；有效至 2026-12-03，仅覆盖实体基线，旧 Claim 仍在 2026-09-18 到期。preflight 校验快照文件摘要、ID/slug、生产 URL、编辑来源与日期、到期日、正文精确替换及固定后像 SHA-256。实际生产写入如另行授权，必须用预检 manifest 的完整前像 SHA-256；提交后需只读核正文、维护记录、排期及受保护字段。当前没有执行 `--commit`。

- [只读 preflight](./FRESHNESS_SECOND_BATCH_PREFLIGHT_2026-10-08.json)：5 条 `ready`，每条前像哈希和后像摘要均固定，`productionWrites=0`。
- [逐项回滚演练](./FRESHNESS_SECOND_BATCH_ROLLBACK_2026-10-08.json)：5 条 `rolled_back`，事务内后像和受保护字段断言通过，持久写入为 0。
- 允许的候选字段只有 `detail`、`features.maintenanceReview` 和 `next_review_date`；状态、页面质量、URL/canonical、index 与 sitemap 均不改。无数据库迁移。两份无关本地 SQL 修改不在本交付范围。

验证命令：`pnpm exec tsx scripts/test-freshness-second-batch.ts`、`pnpm exec tsx scripts/test-freshness-backlog.ts`、`./node_modules/.bin/tsc --noEmit`、`git diff --check`。未改运行时/路由，因此不运行 build。

新增两份 TypeScript 文件的 `eslint --quiet` 已通过。对共用旧文件运行 `eslint --quiet --fix-dry-run` 后仍有 6 条历史规则报错：`run-freshness-first-batch.ts` 的 `no-nested-ternary`（3）和 `no-shadow`（1），`verify-freshness-pass-snapshot.ts` 的 `import/prefer-default-export`、`naming-convention`（各 1）；相同行可在本提交父版本找到。本批未重排旧流水线，提交时使用仓库既有 `HUSKY=0`，保留此 lint 债供独立处理。
