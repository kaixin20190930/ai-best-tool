# Relevance AI 日常完整交付

## 2026-11-25 到期事实维护完成

实际复核六份当前官方来源：Free退役、付费Pro/Team与Enterprise营销范围、交接/人工审核、双用量维度及企业治理边界。补充Pro/Team的Vendor Credits持续订阅结转、基础Actions续期重置与购买Actions结转，Enterprise结转须向客户团队确认；没有推定账号精确额度、结账或审批强制性。

唯一独立QA绑定当前精确前像及清单后，原通用freshness执行preflight0/真实rollback0/commit1/postcheck0，完整保护后像匹配。只更新en/zh维护摘要、maintenanceReview和next_review_date，原正文、真实繁中、六限制、费用、公开审计及索引不变。一次EN/CN/TW线上验收通过完整新摘要与原内容/人群/限制/费用、官网、示意图标识alt、无流式404、canonical/noindex及sitemap154排除；TW维护摘要为原英文回退，不称新增翻译或素材采样。

下一实际事实复核12-02，原owner接续。生产写入1，无重复收录/Tool公开、运行时代码/素材/部署、本地build/TypeScript/全量测试/GSC/Inspection/Coverage/推荐或索引写入、新增任务。私有主记录 `.local/gsc/operations/relevanceai-facts-2026-11-25.json`。以下为初次交付历史。

2026-11-18（上海），原 `ai-best-tool-cluster` 于 `2026-11-18T08:55:31.487Z` 实际触发。
本轮新增 Relevance AI 一个真实 Tool，完成 EN/CN/TW 页面、原创素材、独立 QA、通用公开和线上验收，
最终 `published + monitor/noindex`、`production_verified`。不是只导入草稿，也不是 Google 收录或增长成功。

公开入口：[English](https://aibesttool.com/ai/relevance-ai)、[简体中文](https://aibesttool.com/cn/ai/relevance-ai)、[繁體中文](https://aibesttool.com/tw/ai/relevance-ai)。
一个 Tool 的三个语言入口不计为三个工具；真实 slug 为 `relevance-ai`。

## 选择与内容边界

先核对 delivery、最新验收和任务锁：八个已知 Automation 工具维护均未到期，有界未完成候选队列为空，既有交付已关闭。
对 Relevance AI 的名称、标题、空格/连字符变体、官网及子域、indexIdentity、候选 normalized URL 查重无匹配。
这不代表全市场无其他候选；本轮只补充多 Agent 专业分工与任务交接的具体选型缺口，不重收录旧工具、不改冷却中的主对比页。

实际读取六个互补官方来源，由原同一独立 QA 核对：
[产品](https://relevanceai.com/)、[平台介绍](https://relevanceai.com/docs/get-started/introduction)、
[Workforces](https://relevanceai.com/docs/get-started/core-concepts/workforces)、[Agents](https://relevanceai.com/docs/get-started/core-concepts/agents)、
[营销定价页](https://relevanceai.com/pricing)、[定价文档](https://relevanceai.com/docs/get-started/pricing)。

三语言实际保存标题、摘要、完整详情、适合/不适合、六条限制、比较维度及费用摘要，TW 为真实繁中内容，zh 仅作简中兼容。
内容区分 AI 判断交接与强制下一步：确定顺序不保证正确性或执行成功；人工输入/审批能力不证明具体配置已对每项操作强制审核。
营销定价页侧重 Enterprise 询价，文档另列付费 Pro/Team 并明确 Free 已退役；不沿用旧免费权益，不保证账号购买资格或结账价格。
Actions 与 Vendor Credits 分开核对，货币额度和点数表格不推定为已验证余额或整条流程总价；Enterprise 治理能力不扩称所有档位均有。
未实测账号、Agent、计费、审批强制性、数据驻留、自托管、准确率、安全审计或竞品间成本/可靠性。

## 真实执行与验收

原创中性 SVG 沿现有 editorial-cover/neutral-editorial 契约，非产品截图、无厂商标识；素材提交
`5eff13ab560337feb9468a770dfaadbca3f64fd7` 已确认 Vercel 部署成功，实际素材 200 且精确哈希匹配。
候选入队和草稿导入沿原通用 preflight/真实事务 rollback/commit/postcheck，随机 nonce、真实管理员及精确前像保留。
持久操作数分别为入队1、导入3、公开1，合计5，不是5个工具；回滚、回查及一次幂等确认均为0写。

原独立 QA `/root/operations_qa` 对本次完整对象重新签署，绑定真实 Tool、前像、管理员、开发/QA 身份、时间与当前文件哈希，未沿用旧对象报告。
素材部署后 fresh preflight 与签署前像一致，再实际回滚、正式公开、postcheck 和零写重放；公开状态为 published+monitor，质量门禁100，marketValidation仍空。
最初私有草稿回查误用无连字符 slug 导致只读断言失败，按真实 Tool ID 修正后通过；没有生产缺陷或重复导入/发布。

`2026-11-18T09:23:31Z`—`09:23:35Z` 一次实际 EN/CN/TW 验收全部通过：200、真实标题/摘要/完整详情、适合/不适合、六条限制、费用边界、
无流式 not-found，主官方来源折叠区及官网去向正确，示意图说明和 alt 可见，素材200/哈希一致，self-canonical/noindex及sitemap排除正确。
现有模板只展示主官方来源，六来源完整保存在后台证据，不宣称全部深链接都在前台展示。
数据库保护内容、候选及签署报告审计一致；验收浏览计数不计真实用户增长。sitemap仍154条，无本工具入口。

## 后续与范围

`nextReviewDate=2026-11-25`，原日常 owner 实际复核身份、当前付费权益/Free退役状态、双用量维度及交接/审批文档，证据变化可提前重开，不能只顺延日期。
11-19 原 Coverage/D+14及相关工具/推荐、11-20 Zapier、11-23 Bardeen、11-26其他工具、11-29 n8n节点均保留。
直接复用今天早间观察结论，GSC/Inspection/Coverage新增采集0；未改市场验证、索引、sitemap配置、Task/Fit或推荐关系，无索引 release/D+时钟。
没有运行时代码、新框架/发布器、新定时任务、本地build、TypeScript或全量测试。本次实际自动交付不代表未来所有运行或搜索增长。

公开仅此汇总及 delivery；真实对象、来源HTML、选择包、QA、执行与验收保存在私有 `.local/gsc/operations/daily-relevanceai-*2026-11-18.*`、
`relevanceai-*2026-11-18.*` 和 `ra-*-source-2026-11-18.html`。
