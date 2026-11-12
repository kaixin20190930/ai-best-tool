# 新工具建立流程手动验收

日期：2026-11-12，上海时间。由用户手动触发 `ai-best-tool-cluster` 的执行流程；这不是调度器首次自动运行的证明。本次只建立一个 Activepieces 后台草稿，复用现有通用入队、导入和页面模板，不新增产品功能或工具专属发布器。

## 结论

**候选研究、通用入队、三语言草稿入库与内容 QA 已通过；完整公开发布尚未验收。**真实 Tool ID 为 `7d89de9d-8281-4b93-bff7-0d1bf299388e`，状态 `draft + monitor`，下一复核日 11-19。不能把数据库质量分 100、`ready=true` 或内容 QA 说成已公开、已进入搜索分发或获得增长。

[后台草稿编辑入口](https://aibesttool.com/cn/admin/tools/7d89de9d-8281-4b93-bff7-0d1bf299388e/edit)要求管理员登录。本轮浏览器未登录，已验证登录保护，未验证编辑器实际显示。真实数据库内容的本地审阅文件在 `.local/gsc/operations/activepieces-draft-review-2026-11-12.html`；它明确标注草稿，不是线上页面截图。

## 为什么选择这个对象

- 先读现行路线、任务提示、发布清单与已完成状态，未重复今天完成的观察和 Lindy 修复。
- 旧成熟候选 overlay 没有 ready 对象；不能把这个局部历史队列当作全站没有合格产品的证明。
- 实际只读查重覆盖 158 个 Tool 和 97 个 intake 的身份字段。Pipedream 已存在，不重复创建。Activepieces 的名称、空格/连字符变体和官方域没有命中。
- Relay.app 官方首页已公告 2026-09 停服，排除，未入队；未依据残留旧教程或其他同名产品建立页面。
- Activepieces 作为普通 Automation 相邻 Catalog 候选，提供社区自动化核心、托管方式、可视化/代码扩展和审批的选型边界。本次不占用新的主页面，不改变现有 n8n/Make/Lindy comparison，也不创建 Task/Capability/Fit 或推荐关系。

## 按要求逐步检查

| 阶段 | 要求 | 本次实际结果 |
| --- | --- | --- |
| 实体与查重 | 独立平台、官方 canonical，排除同名、版本和既有 Tool | Activepieces 独立平台；158/97 当前身份检查及通用 preflight 通过 |
| 官方事实 | 至少两个互补官方来源，区分能力、套餐、未实测项 | 5 个官方产品/文档来源，6 条 Claim 边界；2 条冲突保持 conflict |
| 决策内容 | 不只介绍功能；明确适合、不适合、限制、比较维度、费用边界 | 英、简中、繁中均完整；竞品只是编辑比较维度，无性能排名 |
| 素材 | 权利明确，不能把自制配图当厂商截图 | 平台原创中性 SVG；无厂商 Logo、外链、脚本；独立 QA 核对文件哈希 |
| 入队 | 通用契约、精确前像、回滚、显式内部准备授权 | rollback 0 持久写；commit 写候选 1 次；确定性 postcheck 0 写 |
| 导入草稿 | 只能生成 draft，完整负载留后台，不能借内部 token 公开 | rollback 0 持久写；commit 报 3 次写操作；postcheck 已 imported→draft |
| 内容 QA | 不自签，精确选择包与媒体哈希 | 唯一独立 QA 为 CONTENT_QA_PASS_DRAFT_ONLY；不是发布签署 |
| 数据回查 | 三语言字段与选择包一致，zh 仅为简中兼容 | 标题、摘要、正文、适合/不适合、限制、比较维度、费用摘要逐项相同；无 ops2Selection 泄入 Tool.features |
| 公开边界 | 草稿不得作为公开 Tool 展示或进 sitemap | 三条语言 URL 均返回流式 not-found 内容、noindex，不含草稿标题；sitemap 0 匹配 |
| 公开发布 | 独立最终发布身份/签署、素材上线、真实前台验收 | **未执行**；现有桥要求真实 codex-thread UUID，当前 QA 只有协作任务身份 |
| 搜索分发 | 公开之后另走观察、索引审批及 sitemap 门禁 | 未启动，未伪造 release 日期或 observationComplete |

通用数据 preflight 的 `blockers=[]` 只说明它检查的结构条件已满足；它不验证全部事实、QA 身份、素材实际部署或前台图片描述，不能作为完整验收。

HTTP 的一个重要实测细节：Next.js 三条流式 not-found 响应为 HTTP 200，正文含 not-found 标记与 noindex，且不含草稿内容；**不是公开页面，也不是硬 HTTP 404**。最初按必须 HTTP 404 的断言失败后检查了实际正文，已用内容屏蔽与 noindex 检查确认未泄露草稿，没有修改生产路由。

## 页面会建立成什么

一条真实 Tool 记录驱动现有工具详情模板，保存 `en/cn/tw` 内容；公开后计划使用 `/ai/activepieces`、`/cn/ai/activepieces`、`/tw/ai/activepieces`。不是为每种语言开发一份页面代码。当前 URL 仍不展示草稿。

页面内容顺序应围绕用户选择：是什么与适合谁 → 不适合谁 → 限制与费用边界 → 与其他工具的比较维度 → 官方来源与复核日期 → 官网或已审下一步。首次允许公开的目标是 `published + monitor/noindex`，不等于批准索引。

简中实际摘要：

> Activepieces 将可视化工作流与 AI 步骤、Agent 结合。适合需要应用自动化和明确人工审核点的团队；选型时应同时核对版本范围、模型费用与自托管运维责任。

影响选择的限制已写入三语言内容：社区版不等于全部付费 Agent/Chat/治理功能；免费积分刷新存在次日/月度冲突；API/MCP 资格表述冲突；自带密钥仍可能有平台费用及独立模型账单；自托管需要运维。没有宣称已完成账户、安全、可靠性或成功率实测。

## 尚未满足的公开条件

1. **真实独立 QA 身份适配**：当前协作 QA 只有 `/root/operations_qa`，没有可验证的独立 Codex 聊天 UUID。现有最终发布桥要求 `codex-thread:<UUID>`，不能捏造或冒用父聊天。应复用真实独立 QA 聊天，或对共享身份契约做独立审查后的兼容修复；不建立工具专属绕行脚本，不向用户重复索取笼统授权。
2. **媒体上线与前台表述**：素材已准备并经内容 QA，但本轮尚未确认生产可访问。代码审阅另发现现有详情模板统一把 hero alt 写成 `interface preview`，且可能用“查看界面”描述配图；原创示意图公开前应有准确标识。没有把源码审阅冒充真实新页面视觉验收。
3. **正式发布与前台验证**：取得有效签署并核对当前前像后，再走原有 tool rollback/commit/postcheck，验证实际内容、媒体、canonical、noindex、sitemap 和站内去向。本轮 `marketValidation` 为 null，未提交采用验证，不宣称市场验证或索引资格通过。

上述是具体技术/流程条件，不是再申请用户笼统授权。本轮内容和真实草稿已经可审阅，后续任务必须接着该 Tool ID 推进，不重新收录一份。

## 证据与测试范围

私有目录 `.local/gsc/operations/`：`manual-activepieces-selection-2026-11-12.json`、`manual-activepieces-internal-execution-2026-11-12.json`、`manual-activepieces-content-qa-2026-11-12.json`、`manual-activepieces-database-postimage-2026-11-12.json`、`manual-activepieces-final-verification-2026-11-12.json`。

选择包解析哈希：`7f6ada93a138ee1b95e5871aca4993072a434f291a2517d64f7475bf1a170cf9`。素材 SHA-256：`7c87e7fe783a0332dc26f708ac22b1936a9a041304872160b712b5dc665437bc`。内容审查、通用前像/回滚/幂等回查、三语言数据比对及 3 URL/sitemap 的针对性边界检查已执行；没有为内容准备运行 TypeScript、产品测试或完整构建。

官方来源：[Relay 停服公告](https://relay.app/)、[Activepieces 产品](https://www.activepieces.com/)、[Workflow Builder](https://www.activepieces.com/product/workflow-builder)、[AI Agent Builder](https://www.activepieces.com/product/ai-agent-builder)、[定价](https://www.activepieces.com/pricing)、[文档](https://www.activepieces.com/docs/getting-started/introduction)。G2/Product Hunt 只作独立采用资料候选，未转成已批准的 marketValidation。
