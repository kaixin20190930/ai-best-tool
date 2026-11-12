# Automation 有条件对比与推荐交付

日期：2026-11-12（上海）。本轮为用户明确要求的日常任务手动回放，优先补齐对比与有条件推荐；不重复工具收录、公开发布或已完成事实维护。

## 交付差分

主对象为既有 Activepieces 公开页面，支持对象仅 Make、Gumloop。通过现有人工复核关系清单新增两条方向性 `overlaps`，沿既有 Decision Card 的“接下来比较 / Compare next”区块展示，不新增页面、关系引擎或数据库结构。

| 入口 | 用户如何选择 | 必须先核查 |
| --- | --- | --- |
| Activepieces → Make | 评估托管跨应用 scenario 与执行历史；必须自托管时核对 Activepieces 版本及运维责任 | 同一工作流的连接器、人工审核和实际费用；两者均有 AI，不承诺成本或可靠性优胜 |
| Activepieces → Gumloop | 对照 Agent 选择连接器工具与明确设置触发、分支、循环的流程方式 | 两者均有 Agent/审批；用同一任务核对账号权限、审批设置及用量，不作无人监督保证 |

关系复核日 11-12，到期日 **11-19**，由现有日常 owner 与 Activepieces/Gumloop 到期维护合并；原有到期隐藏逻辑不变。这是站内有条件比较，不是全局排名、实测推荐或索引批准。Make/Gumloop 的旧有推荐、n8n 及主 Automation comparison 冷却中的正文均不重做。

## 证据与门禁

本轮只读核对精确 3 个现有 Tool：均为 `published + monitor`，质量分 100，无 market rejected；Activepieces/Gumloop 的事实复核日为今日，Make 的今日维护后像已落账。它们继续 noindex 且不在 sitemap；不要求 monitor 工具先获得 Google 排名才能作为站内比较去向。

已读取的当前官方来源支持上述工作方式，选型取舍是编辑判断，不是测试结果：[Activepieces 工作流](https://www.activepieces.com/product/workflow-builder)、[Activepieces Agent 与审批](https://www.activepieces.com/product/ai-agent-builder)、[Gumloop Agent、连接器与审批](https://docs.gumloop.com/core-concepts/agents)、[Make 平台与执行历史](https://www.make.com/product)。不引用精确报价、集成数量或套餐承诺；既有今日来源与生产验收复用，未重做全库审计、GSC/Coverage 或事实提交。

## 发布与验收

状态：**独立 QA_PASS，已部署并通过线上验收**。原唯一 QA 已签署两条内容配置差分，指纹为 `de5691f41637d57535fbe95888fe4a578296eb109c33eb15b5a40f11ec5b2463`，无 blocker。内容提交 `a6cbc3d9e4d9c1e3d2c28509635bd95a52dd9d6d` 已推送，Vercel 部署成功；本次是明确手动回放，不冒充首次定时自动执行。

11-12 15:09:42 上海的一次真实采样覆盖 Activepieces EN/CN/TW 三页：均 200、真实标题及内容存在，无流式 not-found；每页两条本地化 `#decision-card` 原生链接和完整条件理由可见，共 6 个入口。页面事实复核日期可见；每条关系自身的 11-12/11-19 日期保存在已审批配置、由既有资格服务执行，当前模板不另在每个链接旁显示。TW 关系理由沿既有英文 fallback，不声称新增繁中翻译。Make/Gumloop 六个语言目标页复用今日成功验收及其原始时间/HTML 指纹，离线确认锚点存在，不当作新抓取。

三工具 self-canonical、monitor/noindex 和 sitemap 排除保持一致，生产 sitemap 仍为 154 URL。数据库、候选、Tool 公开、索引和 Task/Fit 写入均 0；既有推荐不变，主 n8n/comparison 冷却正文未改，没有新增索引 release 或 D+ 时钟。

初始验收错误地要求旧组件的 `article` 卡片和逐链接日期，尽管真实新链接及理由已经可见。初始 FAIL 原样保留；按当前未变化的 `PublicToolDecision` 原生链接结构离线复核同一批 HTML 后通过，不重复 HTTP、数据库提交、构建或生产改动。页面事实日期与关系配置日期分开记录，没有通过放松应有内容/资格/索引检查掩盖缺陷。

原唯一 QA 又对这一具体更正完成独立离线复核并 PASS：逐页复算 HTML 指纹、核对真实原生链接及完整理由，确认初始失败本身已记录新增链接/理由存在，且没有换数据或改生产。验收文件指纹为 `ebc532dccf8962d6ebef62272fcfd8a19be4dcc12cd38de21119eb4365fe4602`，原始失败与独立报告一并私有保留。已将本项 `production_verified` 及 11-19 关系复核落入 delivery，现有日常任务直接续接，不新增任务。

校验限于来源、两条关系的结构/日期/方向、当前目标资格、到期边界和格式；仅编辑配置，无运行时逻辑或组件变化，未跑本地 build、TypeScript 或全量测试。Git 提交钩子执行了该配置文件原有格式/静态检查；线上只做上述一次针对性采样，不重复提交 Tool 数据。

原始生产状态、证据指纹、独立 QA 与验收保留 `.local/gsc/operations/automation-conditional-comparison-*`，公开只保存本汇总。站点搜索健康继续 warning，11-19 Coverage 与原 D+14 安排不变。
