# SEO Automation Foundation Closeout

日期：2026-10-29

交付单元：`SEO-AUTOMATION-FOUNDATION-CLOSEOUT`

## 1. 结果

本单元把 AI Best Tool 的增长运营从“每日四线都要产出”收敛为“每日一个最高价值结果单元，可附带一个低风险维护批次”。没有新增数据库表、Dashboard、评分服务、发布框架或工具专属代码。

完成内容：

- 首页、导航、Footer、FAQ 和默认 Schema 文案统一为 evidence-backed AI tool decision platform，不再以 Directory 作为产品定位。
- 现有 `seo:quality-inventory` 升级为统一页面资产账本生成器，数据来自路由注册、生产 Tool、生产 sitemap 和最近私有 GSC 快照。
- 每日、每周、每月三条既有 automation 原位更新，没有新增调度器。
- 每日选择采用“最多 5 个候选 + 唯一默认项 + Owner 可选覆盖”；Owner 不回复时继续执行 high-confidence 默认项。
- Entity Resolution 增加 high/medium/low 置信度和 `autoMerged` 审计；前四周周五抽查 20%，样本至少 5 条。
- n8n 确认为切换后的首个 Harvest 单元，但不追逐泛品牌词 `n8n`，只处理稳定的 pricing、requirements、self-hosting 等决策查询簇。

## 2. 统一页面资产账本

运行命令：

```bash
pnpm run seo:quality-inventory
```

本次生产只读结果：

- 页面资产：312
- 生产 sitemap URL：152
- GSC 最新完整日：2026-10-26
- `KEEP_INDEX`：68
- `IMPROVE`：3
- `INTERNAL_NOINDEX`：162
- `MERGE_CANDIDATE`：53
- `ARCHIVE_CANDIDATE`：26

完整逐页数据：`reports/seo/page-asset-ledger-2026-10-29.json`。

摘要：`docs/SEO_PAGE_ASSET_LEDGER_CN.md`。

以上分类不自动修改生产。合并、重定向、归档、删除必须集中生成 Owner 授权包。

## 3. 每日选择契约

候选排序：

`稳定 Harvest 查询簇 > 本周 Cluster 缺口 > 证据成熟 Catalog > 高风险或真实变化 Freshness > Discover`

每项候选必须记录 `reason`、`signalWindow`、`confidence`、`expectedOutcome`、`cooldownUntil`、`downstreamConsumer` 和 `defaultSelected`。

限制：

- 不用单日平均排名触发任务。
- 常规 GSC 判断使用最近 14 天对前 14 天或完整 28 天窗口。
- 低样本查询只进入观察池。
- 页面修改后冷却 14 天；来源变化、到期、生产或技术异常除外。
- 品牌导航词与 pricing、vs、alternatives、review、requirements、best 等决策词分开统计。
- `low-confidence` 不得成为默认项；没有合格项时零写入。

## 4. Entity Resolution 契约

必须分别判断是否创建新 Tool ID、是否更新现有 Tool 的事实，以及是否产生新的 Guide、Best、Compare 或 Task 内容事件。

模型版本、功能和套餐默认归入现有 Tool 更新，但重大产品形态或独立品牌、官网、账户入口不得强行合并。记录 `resolutionDecision`、`resolutionConfidence`、`resolvedParentToolId`、`resolutionReason`、`sourceUrls` 和 `autoMerged`。

`high` 可自动归并，`medium` 进入周五抽查，`low` 不得自动归并或创建 Tool。连续四周抽查准确率高于 95% 后，才可降为每月抽查；严重错误立即恢复每周。

## 5. 调度切换

- 2026-10-30 与 2026-10-31：只读影子运行。旧选择逻辑和新选择逻辑都只输出候选；暂停普通 Catalog、页面修改和新索引写入。健康检查、凭据失效和高风险事实异常继续运行。
- 2026-11-01：如果两个周期没有重复任务、没有不可解释选择且任务锁正常，自动启用新选择逻辑，不等待 Owner 再次触发。
- 每周五：选择一个主 Cluster 组合并执行 20% `autoMerged` 抽查。
- 每月第一天：做页面资产、合格决策流量、流程成本和授权候选治理。

## 6. 首个 Harvest 单元

对象：`/ai/n8n` 及其唯一意图支撑页面。

- 不把泛品牌词 `n8n` 的展示当作高价值点击机会。
- 分析 `n8n pricing`、`n8n ai pricing`、`n8n requirements`、`n8n self hosted requirements` 等稳定查询簇。
- `/ai/n8n` 保持产品实体和决策页职责。
- `/guides/n8n-self-hosted-requirements` 保持部署要求、责任和成本结构职责。
- 已有 comparison 继续 noindex，除非后续获得独立需求和唯一意图。
- 不重验已有 PASS 的产品事实，不改变当前 index/sitemap 状态。
- 完成后冷却 14 天，按第 3、7、14、28 天观察。

## 7. 验证预算

本单元只执行 JSON 解析、页面资产账本真实只读运行、Directory 定位专项检查、TypeScript 和一次最终差分审查。不运行无关完整测试集，不重复 build，不做数据库写入或索引变更。只有实际部署后才运行一次生产 smoke。

实际结果：消息 JSON 解析通过；生产只读资产账本生成通过；TypeScript `--noEmit` 通过；SEO architecture guardrails 通过；`git diff --check` 通过。未运行完整 build、全量测试或重复 production smoke。
