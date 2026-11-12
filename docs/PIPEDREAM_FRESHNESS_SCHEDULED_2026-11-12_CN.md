# Pipedream 到期维护：日常定时任务交付

2026-11-12，`ai-best-tool-cluster` 的 16:56（上海时间）heartbeat 实际执行。**独立 QA_PASS、生产提交及线上验收均已完
成**，不是手动回放或仅修改任务配置。原复核期限 10-23、上次维护 10-09；本轮如实补做，不回填过去的完成日期，下次复核
11-26，由原日常 owner 承接。

本轮先排除今天已完成的 Activepieces、Gumloop 收录及四条新条件比较、Make/Lindy 维护和 Coverage 诊断。优先维护当前
Automation 中实际逾期的 Pipedream，未为每日配额额外收录、建立比较页或补互链。

## 真实内容差分

10-09 已记录 Workflows/String 将于 2027-03-31 停服，本轮没有把它当成新发现。新增的是影响选择和迁移的边界：

- 按当前官方公告，Workflows 已进入维护模式，不接收新注册或订阅；适用人群收窄为现有用户盘点和迁移，不继续作为新长期项目选
  项。Connect 继续受支持，不能将部分停服写成整个产品停止服务。
- 修正工作流数据“保留到主动删除”的无限期暗示，明确公告的 2027-04-30 永久删除节点，包含相关凭证和 OAuth tokens；Connect
  设置和凭证不受影响。
- 补充逐项目 JSON/ZIP 结构导出、File Stores 套餐条件、500 个 workflow 或 256 MB 限制及 manifest 的截断/警告检查。结构导
  出不包含凭证、环境变量、历史及数据存储等完整迁移材料，须另行保存、重连和重建验证。
- 区分官方取消/退款安排与未实测的具体账号权益；Connect 开发访问、生产资格、使用 credits 与外部用户计费分别核对。不宣称已
  测试导出、完成迁移、收到退款或具有成本优势。

仅更新既有 `detail.en/cn/zh`、`features.maintenanceReview`、`next_review_date`。历史市场验证、G2/安全/目录证据及原日期保
留，本轮不续签这些证据。

## 发布和验收

同一位真实独立 `operations_qa` 实读四个官方来源，审查精确前像、三语言差分和保护字段。清单 JSON 指纹
`4375a514287e790ea026ec68731a62cc08e07c9b3eb1b1bec43aab67e48d8951`，独立 QA 文件指纹
`2d500bfde5095a993397059e50235234fb5cc6b0a6f9e8f020b4cd324d0bdd07`。

沿现有通用 Freshness 流程执行：fresh preflight 0 写、真实事务 rollback 0 持久写、17:04:30 正式 commit **1
行**、postcheck `alreadyApplied=true` 且 **0 写**。数据库整行与预期后像精确一致，未重复 Tool 入队、导入或公开发布。

17:04:56 的一次定向线上验收覆
盖[英文](https://aibesttool.com/ai/pipedream)、[简中](https://aibesttool.com/cn/ai/pipedream)、[繁中入口](https://aibesttool.com/tw/ai/pipedream)：
均 200，真实标题、四段新限制、复核日期、官网及四个官方来源可见，无流式 not-found；self-canonical/noindex 和 sitemap 排除
通过，sitemap 仍为 154 URL。繁中入口沿用现有英文正文回退，不冒称本轮新增繁体翻译。

验收首轮 PASS，指纹 `82ce8f0fadb253ed9f10592ab6c501ac0ff5c3a76c3f315fe2f89b43a4f61eb3`。本轮是既有数据发布路径，无运行时
代码或素材变化，因此无需代码部署；未运行本地 build、TypeScript、全量测试或重新采集 GSC。没有索引/Task/Fit/关系写入、新
release 或 D+ 时钟，也未创建自动化任务。此结果证明本次自动触发的维护交付完成，不等于已验证所有未来自动交付或获得增长。

`delivery` 新增 `pipedream-freshness-scheduled` 为 `production_verified`。11-26 实际复核上述官方证据，有真实变化再提前重
开；不每日重复本次维护。Coverage/原 D+14 的 11-19 节点及其他已完成对象沿各自日期接续。

私有前像、清单、独立 QA、事务执行、三语言 HTML 和验收位于 `.local/gsc/operations/pipedream-freshness-*2026-11-12.*`。公
开仅保存本汇总。

官方来
源：[停服与过渡公告](https://pipedream.com/docs/workflows)、[结构导出说明](https://pipedream.com/docs/workflows/export-workflows)、[计费文档](https://pipedream.com/docs/pricing)、[Connect 概览](https://pipedream.com/docs/connect)。
