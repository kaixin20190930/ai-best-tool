# 第四批到期 Claim 交付（2026-10-08）

顺序固定为[第三批后生产只读审计](./FRESHNESS_BACKLOG_AFTER_BATCH3_2026-10-08.json)的 `selected`：Codex、Dune、GitHub Copilot、Runway、Luma AI。该审计文件 SHA-256 为 `c1a80678e7103e8ac0a335e93024c461991ad6c59181de12632d98a6336c519f`。本轮只复核到期的公开可变 Claim；既有实体、canonical、页面与索引 PASS 作为基线继承，不重新评估。`checkedAt=2026-10-08`，五项 `nextReviewDate=2026-10-22`。Luma AI 原排期早于 2026-09-25 有来源的编辑复核，故同时修复排期。

| 工具 | 结果与精确字段 patch | 官方一手来源与限制 |
| --- | --- | --- |
| Codex | `no-change`；只新增 `features.maintenanceReview` 并更新 `next_review_date`。原正文已把套餐、模型、限额、客户端和账号差异写为条件。 | [OpenAI 官方定价与限额](https://learn.chatgpt.com/docs/pricing)、[Cloud](https://learn.chatgpt.com/docs/cloud)、[审批与安全](https://learn.chatgpt.com/docs/agent-approvals-security)。实际套餐、地区、模型、工作区策略和剩余额度为 `conditional`，须查看目标账号。 |
| Dune | `no-change`；只新增维护复核与下次日期。Data Hub 计算 credits、Datashare 独立订阅及数据刷新区间仍一致。 | [产品对比](https://docs.dune.com/docs/product-comparison)、[Data Hub](https://docs.dune.com/web-app/overview)。具体部署新鲜度、查询 credit 消耗与合同条款为 `conditional`。 |
| GitHub Copilot | `changed`；仅三语 `detail.en/zh/cn` 的旧套餐段落作精确前像替换，再写维护复核与下次日期。新增官网 Max 每月 $100；保留 Free 2,000 次补全、Pro $10、Pro+ $39 及付费版不限量补全的已有边界，更新 AI Credits 表述。 | [官方套餐](https://github.com/features/copilot/plans)、[内容排除](https://docs.github.com/en/copilot/concepts/context/content-exclusion)。地区结账、组织策略、模型消耗和余额为 `conditional`；未改 `pricing` 枚举或独立市场证据日期。 |
| Runway | `no-change`；只新增维护复核与下次日期。Free/Standard/Pro/Max credits、Gen-4.5 每秒 12 credits、结转与旧 Unlimited 的 11 月迁移仍由官方支持。 | [定价](https://runway.com/pricing)、[credits](https://help.runwayml.com/hc/en-us/articles/15124877443219-How-do-credits-work)、[套餐说明](https://help.runwayml.com/hc/en-us/articles/21664961171475-Which-plan-is-right-for-me)。模型权限、实际生成成本和旧订阅迁移为 `conditional`。 |
| Luma AI | `no-change` + `schedule_sync`；只新增维护复核与下次日期。Plus/Pro/Ultra App 套餐和独立按用量的 API 口径一致。 | [Luma 官方信息](https://lumalabs.ai/llm-info)、[API](https://lumalabs.ai/api)。所选 App 权益、API 费率、地区和余额为 `conditional`。 |

候选 `publishNotBefore=2026-10-10`。Owner 已授权按批次顺序执行而不等待自然日；本批专属 `ownerTimeOverride.effectiveReleaseDate=2026-10-08`，仅覆盖日期门禁，不覆盖独立 QA、前像、PASS、后像、保护字段或索引门禁。开发阶段未执行生产 `--commit`，后由总控在独立 QA 后执行受控提交。

[生产只读 preflight](./FRESHNESS_FOURTH_BATCH_PREFLIGHT_2026-10-08.json)五项均 `ready`，锁定完整行 SHA-256、PASS 来源 SHA-256、正文后像 SHA-256、来源、限制和预期字段。[事务回滚演练](./FRESHNESS_FOURTH_BATCH_ROLLBACK_2026-10-08.json)五项均 `rolled_back`，持久 `productionWrites=0`。演练进程完成并关闭连接后，[独立只读回验](./FRESHNESS_FOURTH_BATCH_POST_ROLLBACK_2026-10-08.json)用新连接和 `BEGIN READ ONLY` 逐项重新读取生产行；五项完整行 SHA-256 均与原 preflight 精确一致，`productionWrites=0`。专项测试使用篡改的独立回读行和缺失回读行作负例，防止把事务内 before hash 冒充回验。运行时 `view_count`、`updated_at` 属于审计漂移，不能视为业务 Claim 差异；任何提交前漂移仍需重做 preflight，不能忽略哈希门禁。

生产提交只允许 `detail`（仅 GitHub Copilot）、`features.maintenanceReview` 和 `next_review_date` 改动。脚本逐行检查 `status`、`page_quality_status`、`name`、`url`、`title`、`id`、`pricing` 等保护字段及所有其他列，并要求提交 manifest 与候选后像一致。既有 `features.editorial`、`marketValidation`、canonical 和索引状态保持原值。专项测试覆盖顺序、批次日期覆盖隔离、PASS、精确替换、manifest 篡改、后像篡改与已应用重放零写入；TypeScript 与第三批回归通过。

独立 QA 已完成，随后总控按锁定 preflight 执行五项生产受控提交，`productionWrites=5`。[生产只读 postcheck](./FRESHNESS_FOURTH_BATCH_POSTCHECK_2026-10-08.json)逐项返回 `already_applied`、`changedFields=[]`、`productionWrites=0`，确认已应用后像可重复核验且没有再次写入。第四批未改变工具 `status`、`page_quality_status`、URL/canonical、索引放行状态或 sitemap；也未改渲染与路由代码。[第四批后生产只读积压审计](./FRESHNESS_BACKLOG_AFTER_BATCH4_2026-10-08.json)为 75 个工具、57 个 published、14 个 published 到期项：`schedule_sync=0`、`claim_due=2`、`entity_due=5`、`manual_archive_review=7`。下一组确定性选择为 Pipedream、Cursor、ChatGPT Mac、GPT-4o、OpenAI；此处只记录队列，不预先进行下一批审查。
