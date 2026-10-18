# 已收录工具 Freshness 单批审计：2026-10-18

状态：**已完成独立 QA、生产 commit 与幂等 postcheck。** 通用 executor 的 `preflight`、事务 `rollback`、回滚后只读 `preflight`、唯一 commit 与只读 postcheck 均通过。

## 结论

| 工具 | 官方来源与差分 | 拟维护结果 | 下次复核 |
| --- | --- | --- | --- |
| Anyword | [官方定价](https://www.anyword.com/pricing)仍列 Starter、Data-Driven、Business、Enterprise，与现有文案一致。页面有月付/年付显示；未登录账户核对结账价或试用权益。 | 不改公开 detail；仅写 `maintenanceReview`，保留价格/额度的条件边界。 | 2026-10-25（工具最早到期的账户/数据项）；价格 Claim 计划 2026-11-01 |
| Canva | [定价](https://www.canva.com/pricing/)、[AI 用量说明](https://www.canva.com/help/ai-access/)、[Canva AI 使用指南](https://www.canva.com/en_au/help/using-canva-ai/)与[发布公告](https://www.canva.com/newsroom/news/canva-create-2026-ai/)：官方公告最初将 Canva AI 2.0 描述为 research preview；当前帮助中心列出部分方案资格，具体开放因方案、工具与账户而异。 | EN/CN 保留发布公告的 research preview 时间语境，同时说明帮助中心当前列出的部分方案资格；不宣称 preview 标记已过时，也不推断所有流程已普遍开放。 | 2026-10-24（未复核的权利/隐私项）；AI 资格与额度 2026-11-01 |
| Scite | [官方定价](https://scite.ai/pricing)当前卡片列 Basic、Pro、Enterprise；同页 FAQ 仍称 API 属于 Pro 与 Team，官方页面内部口径冲突。 | EN/CN 不再把 Team 写成当前定价卡套餐；明确 API 资格冲突未解决，不承诺账户权益或精确价格。 | 2026-10-24（未复核的账户/隐私项）；计划卡与 API 冲突 2026-11-01 |

## 执行记录

- 唯一 manifest：[EXISTING_TOOLS_FRESHNESS_BATCH_2026-10-18.json](./EXISTING_TOOLS_FRESHNESS_BATCH_2026-10-18.json)
- Manifest 文件 SHA-256：`611d3d33540220eabe633d00a0d9cf222e2df2d40ab64a6ebf75ef304f5135be`
- Executor canonical manifest fingerprint（`SHA-256(JSON.parse(manifest))`）：`087f213b9207d3f90813feb7899d114a15c8f50fd5bc431e943696519a54601d`
- QA 最小返工：Canva EN/CN 改为保留“官方公告最初描述为 research preview”的时间语境，并写明帮助中心当前列出部分方案资格、可用性依方案/工具/账户变化；不再声称 research preview 已过时。
- 写入策略核对：`approvedWritablePaths` 白名单仅支持 `detail.en/zh/cn` 与 `features.decision.freshnessSummary.en/zh/cn`。执行器把 `features.maintenanceReview` 和 `next_review_date` 作为固定元数据副作用写入，二者不属于该白名单；本次不改 runtime，manifest 以独立 `declaredMetadataWrites` 声明三项各自的两个字段与复核日期。该声明用于审计，不是新增的执行器校验。
- 首次生产只读 `preflight`：3/3 前像与预期 detail 后像匹配，`productionWrites=0`。
- 通用事务 `rollback`：3/3 模拟写入并完成受保护字段/预期后像检查，整批 ROLLBACK，`productionWrites=0`。
- 回滚后只读 `preflight`：3/3 仍匹配原始前像，`alreadyApplied=false`，确认没有残留写入。
- Manifest 哈希随 Canva 文案和 `declaredMetadataWrites` 更新；以本次最终 SHA-256 为准。无 `publicationPolicy`、pricingSnapshot、身份、索引、sitemap、canonical、关系或 protected-field 写入。
- 独立 QA：`codex-thread:01a14c8e-6673-7172-9a3c-f521a9b9b8b0`，结果 `QA_PASS`；机器凭据见 [EXISTING_TOOLS_FRESHNESS_BATCH_QA_2026-10-18.json](./EXISTING_TOOLS_FRESHNESS_BATCH_QA_2026-10-18.json)。
- 唯一生产 commit：Anyword、Canva、Scite 各写 1 行，共 `productionWrites=3`。Anyword 仅更新维护快照和下次复核日；Canva、Scite 同时更新已核准 EN/CN 公开文案。
- 提交后只读 `postcheck`：3/3 `alreadyApplied=true`、`changedFields=[]`、`productionWrites=0`，确认幂等且没有待写差分。
- 未运行 TypeScript、build 或生产 smoke（R 级数据库内容维护，无运行时代码/页面路由变化）。
- 受保护的两份 SQL 和 `docs/FRESHNESS_CLAIM_DUE_BATCH_2026-10-15.json` 保持未触碰且未纳入本批。
