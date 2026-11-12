# 新工具建立流程手动验收

日期：2026-11-12，上海时间。由用户手动触发 `ai-best-tool-cluster` 的执行流程，并明确授权修复两处缺口、完成公开发布与线上验收；这不是调度器首次自动运行的证明。复用同一个 Activepieces 候选、Tool 与通用发布路径，不新增工具专属发布器。

## 结论

**两处缺口已修复，Activepieces 已公开，三语言线上验收通过。**真实 Tool ID 为 `7d89de9d-8281-4b93-bff7-0d1bf299388e`，最终状态 `published + monitor/noindex`，下一复核日 11-19。修复代码 `4b8f3fedca68b7ba34e9f2aa74c2b8ee6d4467fe` 已部署，Production Health Monitor / SEO Monitoring 均成功。

公开入口：[English](https://aibesttool.com/ai/activepieces)、[简体中文](https://aibesttool.com/cn/ai/activepieces)、[繁體中文](https://aibesttool.com/tw/ai/activepieces)。公开不等于 Google 收录、市场验证或增长成功；本次没有索引 release，不启动分发后 D+ 节点。

[后台编辑入口](https://aibesttool.com/cn/admin/tools/7d89de9d-8281-4b93-bff7-0d1bf299388e/edit)要求管理员登录。初次准备时验证了登录保护，未登录编辑器；随后使用共享受控发布桥完成正式提交，并用真实公开页面验收。原本地草稿审阅 HTML 只保留为历史证据。

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
| 内容及发布 QA | 不自签，精确选择包、媒体、实时前像及真实审核身份 | 同一独立 QA `/root/operations_qa` 先通过内容，再通过最终公开签署；真实管理员身份已回查 |
| 数据回查 | 三语言字段与选择包一致，zh 仅为简中兼容 | 标题、摘要、正文、适合/不适合、限制、比较维度、费用摘要逐项相同；无 ops2Selection 泄入 Tool.features |
| 草稿阶段边界 | 正式发布前不泄露草稿 | 当时三语言流式 not-found/noindex，sitemap 0；发布后才展示内容 |
| 公开发布 | 精确授权、实际事务回滚、原子提交、确定性回查 | preflight 0 写；rollback 0 持久写；commit 1 行；postcheck 0 写；幂等重放 0 写 |
| 线上验收 | 真实内容、配图描述、官方去向及 SEO 边界 | 三语言均 200、完整标题/摘要/限制，配图 alt 与可见标识正确，素材 200 且哈希一致；self-canonical/noindex、sitemap 0 |
| 搜索分发 | 公开之后另走观察、索引审批及 sitemap 门禁 | 未启动，marketValidation 仍空，未伪造索引 release 日期或 observationComplete |

通用数据 preflight 的 `blockers=[]` 只说明它检查的结构条件已满足；它不验证全部事实、QA 身份、素材实际部署或前台图片描述，不能作为完整验收。

HTTP 的历史实测细节：草稿阶段三条流式 not-found 响应为 HTTP 200，正文含 not-found 标记且无草稿内容。最终验收检查了真实标题、摘要、全部限制及 not-found 标记消失，未只凭 HTTP 200 判断公开。

## 页面会建立成什么

一条真实 Tool 记录驱动现有工具详情模板，保存 `en/cn/tw` 内容；三条语言 URL 已实际公开。不是为每种语言开发一份页面代码。

页面内容顺序应围绕用户选择：是什么与适合谁 → 不适合谁 → 限制与费用边界 → 与其他工具的比较维度 → 官方来源与复核日期 → 官网或已审下一步。首次允许公开的目标是 `published + monitor/noindex`，不等于批准索引。

简中实际摘要：

> Activepieces 将可视化工作流与 AI 步骤、Agent 结合。适合需要应用自动化和明确人工审核点的团队；选型时应同时核对版本范围、模型费用与自托管运维责任。

影响选择的限制已写入三语言内容：社区版不等于全部付费 Agent/Chat/治理功能；免费积分刷新存在次日/月度冲突；API/MCP 资格表述冲突；自带密钥仍可能有平台费用及独立模型账单；自托管需要运维。没有宣称已完成账户、安全、可靠性或成功率实测。

## 两处缺口的最终修复

1. **真实独立 QA 身份兼容**：共享桥接受真实 `collaboration-agent:/root/operations_qa`，原 `codex-thread` 契约保留。开发和 QA 身份必须不同；报告绑定当前 Tool、精确前像、真实管理员、时间和报告哈希，授权也绑定同一报告。报告审计随公开原子入库，postcheck/重放继续核对。只用于 Tool monitor，不扩大 candidate、relation、market 或 index 权限，没有虚构聊天 UUID。
2. **素材上线与准确表述**：生产 SVG 已按原哈希核验；共享模板给自有编辑配图明确的可见说明和 alt；封面不能单独证明界面、不能被摘要覆盖成产品预览。简中线上浏览器实际显示“编辑示意图，非产品截图”。

发布于 2026-11-12 13:21（上海时间）。当前前像为 `b21d46e91dff1653e744a67446c346cc4466229db36eff0af5dd3a8240f8ac85`；最终独立报告哈希为 `a385be2b0ef8bab12828a2b261e8d7e5d75900285f0b452c500fc456bb92d942`。三语言线上采样时间为 13:23；正文、Claim 冲突、复核日期与原内容保持一致，候选未改动。浏览器验收产生的浏览计数不作为真实用户增长。

现有前台来源折叠区展示主官方来源与复核记录；5 个互补官方来源全部保留在后台证据中。本轮未扩展来源展示功能。Next review 为 11-19，复用已有 daily owner，不新增重复定时任务。

后续沿同一 Tool ID 复核，不重复入队。市场采用验证、索引批准和新的推荐关系是后续独立门禁，本次未宣称通过。

## 证据与测试范围

私有目录 `.local/gsc/operations/`：`manual-activepieces-selection-2026-11-12.json`、`manual-activepieces-internal-execution-2026-11-12.json`、`manual-activepieces-content-qa-2026-11-12.json`、`manual-activepieces-database-postimage-2026-11-12.json`、`manual-activepieces-final-verification-2026-11-12.json`。

最终私有证据另包括 `activepieces-publication-qa-2026-11-12.json`、`activepieces-runtime-deploy-2026-11-12.json`、`activepieces-publication-execution-2026-11-12.json`、`activepieces-production-acceptance-2026-11-12.json` 及实际三语言 HTML。

选择包解析哈希：`7f6ada93a138ee1b95e5871aca4993072a434f291a2517d64f7475bf1a170cf9`。素材 SHA-256：`7c87e7fe783a0332dc26f708ac22b1936a9a041304872160b712b5dc665437bc`。仅因共享运行时代码改动执行行为负例、既有 monitor 发布检查、增量 TypeScript 和一次最终构建，均通过；本地 PostgreSQL 子项因未设置 TEST_DATABASE_URL 跳过，实际发布事务回滚已验证生产 SQL。线上只采集一次三语言/素材/sitemap 验收；校验脚本修正了草稿没有 submission 节点、浏览器计数变化和既有主来源展示的断言，复用采集结果，没有扩测或重复发布。

官方来源：[Relay 停服公告](https://relay.app/)、[Activepieces 产品](https://www.activepieces.com/)、[Workflow Builder](https://www.activepieces.com/product/workflow-builder)、[AI Agent Builder](https://www.activepieces.com/product/ai-agent-builder)、[定价](https://www.activepieces.com/pricing)、[文档](https://www.activepieces.com/docs/getting-started/introduction)。G2/Product Hunt 只作独立采用资料候选，未转成已批准的 marketValidation。
