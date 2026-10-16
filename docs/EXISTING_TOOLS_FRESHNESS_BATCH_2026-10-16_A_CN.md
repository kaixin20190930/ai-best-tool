# 已收录工具事实复核批次 2026-10-16 A

状态：开发候选完成，生产只读 preflight 与事务 rollback 通过；**独立 QA 未完成，生产 commit 未执行**。本批是一份四项 change set，不是四条工具发布线。

## 范围和结论

| 工具 | 到期 Claim 与官方核查 | 事实变化 | 拟下次复核 | 未决边界 |
| --- | --- | --- | --- | --- |
| ChatGPT | [官方套餐](https://chatgpt.com/pricing/)、[Free 说明](https://chatgpt.com/plans/free/)；页面已将套餐、模型和额度限定在账号/地区条件内 | 无；仅同步公开页过期的下次复核日期 | 2026-10-30 | 未登录目标账号，精确模型额度仍为 unknown |
| Elicit | [官方定价](https://elicit.com/pricing?redirected=true)；存在多个行业/账期展示块 | 无；保留价格 conflict，不发布通用精确价 | 2026-10-23 | 选择器状态与目标账号结账价未证实 |
| Lovable | [官方定价 FAQ](https://lovable.dev/pricing)、[套餐文档](https://docs.lovable.dev/introduction/subscription-plans)、[额度文档](https://docs.lovable.dev/introduction/credits-and-usage)；地区付费每日额度上限仍有口径差异，Cloud/AI/connector grant 为可变权益 | 无；仅同步过期的公开复核摘要 | 2026-10-30 | 地区/工作区额度未实测，不作精确推荐 |
| Replit | [官方套餐](https://replit.com/pricing)、[Agent 计费](https://docs.replit.com/billing/ai-billing)、[用量控制](https://docs.replit.com/billing/managing-spend)；公开页不能证明目标账号结账金额 | 无；价格 Claim 第二次无法做账号核验，按规则转 30 天；未到期的用量 Claim 保留 10 月 23 日 | 2026-10-23（最早到期 Claim）；价格 Claim 2026-11-15 | 不泛化账户价、credit burn 或消费上限 |

四项生产前像均为 `published + monitor/noindex`。本批不改变索引、sitemap、canonical、关系、schema/RLS、自然排序或工具身份。`reviewed_no_claim_change` 表示核查了已到期公开事实的表达边界，**不表示**账户级未知或冲突 Claim 已经 PASS。

## 执行和回滚

- Manifest：[四项唯一写集](./EXISTING_TOOLS_FRESHNESS_BATCH_2026-10-16_A.json)。每项有独立完整行前像哈希、受保护字段哈希、来源、边界、下次日期与回滚目标。
- 执行器：[统一已收录工具变更集入口](../scripts/run-existing-tools-freshness-change-set.ts)。`preflight` 使用只读事务；`rollback` 在同一事务模拟四项 UPDATE、逐行回读受保护字段后整批 ROLLBACK；`commit` 必须有匹配 manifest 哈希的独立 `QA_PASS` 报告；`postcheck` 验证最终拥有字段与受保护字段。前像漂移则整批停止。
- 实际运行：`preflight` PASS、`rollback` PASS；manifest SHA-256 为 `f776dff53afe357fe0cbd3aa6957173907a1a1f4ee4d9bab36ef7d541dc59be7`；两次均报告 `productionWrites: 0`。
- 预期写入仅限 `features.maintenanceReview`、`next_review_date`，以及 ChatGPT 的复核日期文字和 Lovable 的过期 `decision.freshnessSummary`。事实主张本身不改。
- 实际生产更新数 **0**；核查后事实零变化 **4**；工具实体 HOLD **0**；仍有精确 Claim 的 conflict/unknown/conditional 边界。生产回读前像不变。

## QA 和发布边界

独立 QA 只需核对四项官方来源、manifest 差分、前像/受保护字段、Replit 最早到期日期，以及执行器的负向边界。无需全量 build 或生产页面 smoke，因为本批没有运行时页面、路由和索引代码改动。QA PASS 后由总控在同一变更集上决定是否执行显式 commit；commit 后运行 `postcheck` 并更新本记录。若任何来源或前像发生变化，原 manifest 失效，不能按旧 PASS 强行提交。
