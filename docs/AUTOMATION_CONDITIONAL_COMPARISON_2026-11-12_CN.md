# Automation 有条件对比与推荐交付

日期：2026-11-12（上海）。本轮为用户明确要求的日常任务手动回放，优先补齐对比与有条件推荐；不重复工具收录、公开发布或已完成事实维护。

## 交付差分

主对象为既有 Activepieces 公开页面，支持对象仅 Make、Gumloop。通过现有人工复核关系清单新增两条方向性 `overlaps`，沿既有“接下来比较哪些工具”及 Decision Card 路径展示，不新增页面、关系引擎或数据库结构。

| 入口 | 用户如何选择 | 必须先核查 |
| --- | --- | --- |
| Activepieces → Make | 评估托管跨应用 scenario 与执行历史；必须自托管时核对 Activepieces 版本及运维责任 | 同一工作流的连接器、人工审核和实际费用；两者均有 AI，不承诺成本或可靠性优胜 |
| Activepieces → Gumloop | 对照 Agent 选择连接器工具与明确设置触发、分支、循环的流程方式 | 两者均有 Agent/审批；用同一任务核对账号权限、审批设置及用量，不作无人监督保证 |

关系复核日 11-12，到期日 **11-19**，由现有日常 owner 与 Activepieces/Gumloop 到期维护合并；原有到期隐藏逻辑不变。这是站内有条件比较，不是全局排名、实测推荐或索引批准。Make/Gumloop 的旧有推荐、n8n 及主 Automation comparison 冷却中的正文均不重做。

## 证据与门禁

本轮只读核对精确 3 个现有 Tool：均为 `published + monitor`，质量分 100，无 market rejected；Activepieces/Gumloop 的事实复核日为今日，Make 的今日维护后像已落账。它们继续 noindex 且不在 sitemap；不要求 monitor 工具先获得 Google 排名才能作为站内比较去向。

已读取的当前官方来源支持上述工作方式，选型取舍是编辑判断，不是测试结果：[Activepieces 工作流](https://www.activepieces.com/product/workflow-builder)、[Activepieces Agent 与审批](https://www.activepieces.com/product/ai-agent-builder)、[Gumloop Agent、连接器与审批](https://docs.gumloop.com/core-concepts/agents)、[Make 平台与执行历史](https://www.make.com/product)。不引用精确报价、集成数量或套餐承诺；既有今日来源与生产验收复用，未重做全库审计、GSC/Coverage 或事实提交。

## 发布与验收

状态：**独立 QA_PASS，待部署与线上验收**。原唯一 QA 已签署两条内容配置差分，指纹为 `de5691f41637d57535fbe95888fe4a578296eb109c33eb15b5a40f11ec5b2463`，无 blocker；当前不能用配置通过冒充线上可见，最终结果在本节回填。

校验预算为来源、两条关系的结构/日期/方向、当前目标资格和格式；仅编辑配置，无运行时逻辑或组件变化，不跑本地 build、TypeScript 或全量测试。沿原 Git 发布流程部署后一次定向验收主页面 EN/CN 的两条真实对比链接、条件理由和复核日期，并核对目标可用、self-canonical/noindex/sitemap 边界；不重复提交 Tool 数据。

原始生产状态、证据指纹、独立 QA 与验收保留 `.local/gsc/operations/automation-conditional-comparison-*`，公开只保存本汇总。站点搜索健康继续 warning，11-19 Coverage 与原 D+14 安排不变。
