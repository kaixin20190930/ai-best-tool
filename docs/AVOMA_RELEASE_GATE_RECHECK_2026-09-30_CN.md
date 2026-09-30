# Avoma 剩余发布门禁复核与证据包

核查日：2026-09-30（Asia/Shanghai）；基线 `2dcea72b12406db674704306a3da94cee68da73f`；复核者：Codex。结论：**`HOLD_EVIDENCE`**，不是 `READY_FOR_RELEASE_PREFLIGHT`。本包只记录可复查的候选事实，不授权公开、索引、生产写入或关系发布；`publicReleaseApproved=false`、`indexReleaseApproved=false`。机器清单为 [`avoma-release-gate-2026-09-30.json`](../data/collection/avoma-release-gate-2026-09-30.json)。按 [收录宪法](./BEST_DIRECTORY_POSITIONING_AND_INTAKE_CN.md)、[N1 审计](./ELICIT_AVOMA_N1_OFFICIAL_EVIDENCE_AUDIT_2026-09-28_CN.md)、[统一发布流水线](./CANDIDATE_RELEASE_AND_INDEX_AUDIT_PLAN_CN.md)及[索引政策](./TOOL_INDEX_RELEASE_POLICY_CN.md)判定。

## 1. 生产只读身份、alias 与搜索意图

- `.env.local` 现有生产 PostgreSQL 连接执行 `BEGIN READ ONLY → SELECT → ROLLBACK`：`tools` 共 **68** 条、`published` **53** 条；`name`、JSON `title`、`url` 的 `avoma.com` 域名、`tags`、`features` 查得 Avoma **0** 条。`tools` 没有独立 slug 列，候选 `avoma` 是由名称和路由规则推导的拟用 slug，不把不可用页面当作已有实体。既有 Fathom、Fireflies、Otter.ai 各 1 条，分别在 `fathom`、`fireflies`、`otter-ai` 路径。仓库 `lib/config/toolRouteAliases.ts` 无 Avoma alias，候选 JSON 的来源 URL 也不是生产身份。
- 线上 [`/ai/avoma`](https://aibesttool.com/ai/avoma) 与 [`/cn/ai/avoma`](https://aibesttool.com/cn/ai/avoma) 均 200、自指 canonical、`noindex, follow`，H1 为 “This tool page is temporarily unavailable”。[`robots.txt`](https://aibesttool.com/robots.txt) 为 200、`Allow: /` 并声明 sitemap；[`sitemap.xml`](https://aibesttool.com/sitemap.xml) 为 200、126 个 `<loc>`、Avoma 匹配 0。允许抓取不等于允许索引。未回读 `/tw/ai/avoma`，发布日须另验。
- 现有 `ai-tools-for-meeting-notes` Guide 是会议记要选型意图；英中 comparison 同义路径为 noindex，均不是 Avoma 产品详情。候选唯一产品详情意图是 Avoma 自身的录制席位、协作者、CRM 与可选洞察采购边界；不能另建 “Avoma meeting notes” 或附加模块详情页来占 Guide、Comparison 意图。当前去重通过，发布当日仍须重跑。

## 2. 八个核心页面与事实边界

本轮只把下列 **8 个成功打开的核心页面**计入研究预算（6 个官方、2 个相互独立的第三方）。G2 `/products/avoma/reviews` 直链返回工具 `Internal Error`，改用成功打开的 G2 seller 页；失败直链不计证据。Product Hunt 仅搜索发现，未计入市场门槛。未列入的 09-28 N1 页面是有日期的历史证据，不能写成本日直接重核。

| 核心页面（本日回读） | 可证事实与限制 |
| --- | --- |
| [Avoma 定价及功能表](https://www.avoma.com/pricing) | Startup `$19` 年付折月／`$29` 月付每 Recorder；Organization 比较表 `$29`／`$39`，但页首还暴露 `$24` 文本；Enterprise 页面有 `$39` 年付且至少 10 席，同时旧版表列 “Let’s Talk”。CI 与 RI **各** `$29` 年付折月／`$35` 月付每 add-on 席位。录制、转写、摘要、会议级 Ask Avoma 在基础层；跨会议 Ask Avoma 要 CI，CRM Deal/Account Ask 和双向字段更新要 RI。页面列 bot 与 bot-less native recording、下载、`Recording Storage Duration: Unlimited`，却把自定义 retention policy 列为 Enterprise。并列渲染的旧/新表与帮助页冲突，不能选有利数字。 |
| [席位与 add-on 指南](https://help.avoma.com/avoma-pricing-recorder-seats-free-users-add-ons) | 录自己会议须付费 Recorder；Viewer/Listener/Collaborator 免费查看、评论及分享，不能录制。所有 Recorder 同一基础套餐，add-on 可按人分配且跟随基础账期；增席按剩余账期比例即时计费，减席下账期生效。14 天 Organization 试用含 add-on、无需信用卡；试用不等于长期免费录制。 |
| [Organization 官方帮助页](https://help.avoma.com/what-do-i-get-in-the-organization-plan) | 明列 `$39` 年付折月／`$49` 月付每 Recorder，与现行定价比较表 `$29`／`$39` 正面冲突；称 “more robust CRM integrations” 但未给具体 CRM/功能资格矩阵。Organization 精确成本 **unknown**，不能用任一组公开采购建议。 |
| [Salesforce 连接指南](https://help.avoma.com/integration-with-salesforce) | 要 Salesforce 管理员或授权外部应用权限、Avoma 付费 Recorder、Salesforce Enhanced Notes；需授权并配置对象/同步。非 private 会议笔记可自动同步；private 会议需手动触发。未证明 Startup、Organization、Enterprise 每项 CRM 权限；两向 CRM 字段更新在定价页另列 RI add-on。 |
| [本地录制同意政策](https://help.avoma.com/consent-policy-for-local-recording-avoma-desktop-app) | Bot-free 桌面录制抓取设备麦克风/系统音频，经加密连接上传 Avoma 服务器处理与保存，上传后音频不留设备。使用者必须取得所需同意，Avoma 不代核验；首次启动需承认责任。Bot-free 不等于不上传或免同意。 |
| [Avoma MCP 连接器](https://help.avoma.com/getting-started-with-avoma-mcp-connector) | 管理员先发布连接器，每位成员再连自己的 Avoma 账户；读会议、转录、笔记、scorecard、部分团队/CRM 阶段，且有修改会议结果、用途、隐私的**写**工具。具体套餐资格、各角色最小权限及跨第三方 AI 的数据边界未列，均为 **unknown**。 |
| [G2 Avoma seller／唯一产品页](https://www.g2.com/sellers/avoma) | 09-30 可见 Avoma 唯一产品 **1,365** 条评价、4.6/5；页面有 2026-09-16 与 08-31 标记 `Validated Reviewer`、`Verified Current User` 的使用评价。作为**强产品级采用**：独立平台上的可追溯实际用户评价。评论是自选样本，聚合不证明活跃/付费席位、客观效果或各 add-on 使用。 |
| [Chrome Web Store Avoma 扩展](https://chromewebstore.google.com/detail/avoma/llppmekagejbkddkfaccppnjgipglgne) | 09-30 可见 **3,000 users**、5.0/5、8 ratings，描述 Google Meet 控制、日程与部分 CRM 邮件功能。独立商店计数构成**辅助信号**，只覆盖扩展安装/使用，不能外推主产品活跃用户、团队数或录制效果。 |

两条市场信号来自 G2 和 Google 商店，平台及计数相互独立；达到“一强一辅”，但不采信厂商 ROI、声称客户数、融资、Product Hunt 上线或 G2 内容的厂商二次转述。

## 3. 采购、隐私与内容可用范围

**可写但尚不可发布的无金额候选表述：**“Avoma 以付费 Recorder 席位录制/转写；查看和协作席位可免费。跨会议 Conversation Intelligence 与 CRM 交易洞察需分别确认 add-on、人员分配和账期；CRM 同步还取决于管理员授权、CRM 权限及会议隐私。购买前核对实际 Organization 报价、目标 CRM 套餐资格和留存/同意策略。”这不解决全部购买判断，故不能靠省略争议金额绕过 HOLD。

**仍为 unknown / HOLD 的关键项：**Organization `$29/$39` 与 `$39/$49`、页首 `$24` 文本如何映射实际结账；Enterprise `Let’s Talk` 与 `$39` 的适用范围；Startup 的 CRM 自动保存与 Organization “more robust CRM” 对具体 Salesforce/HubSpot 权益的分界；严格同意级别在哪些套餐可用；`Unlimited` 存储与 Enterprise 自定义保留策略的实际默认期限、删除/导出 SLA；MCP 和下载在真实账户的套餐/角色限制。不能宣称“所有付费席位完整 CRM/同意/留存/MCP”，也不能把 CI/RI 当作基础套餐功能或把销售 ROI 当作实际效果。

09-28 [N1 审计](./ELICIT_AVOMA_N1_OFFICIAL_EVIDENCE_AUDIT_2026-09-28_CN.md)曾直接核验 [会议隐私](https://help.avoma.com/meeting-privacy)的 Private／Primary Team／Organization／Public 与内外会议默认、[录制同意](https://help.avoma.com/recording-consent-compliance)的部分套餐限制、[下载指南](https://help.avoma.com/downloading-a-meeting)的视频/音频及 `.vtt`/`.txt` 和 Host／Participant／Admin／Host Manager 角色，以及[训练 FAQ](https://help.avoma.com/do-you-use-my-data-to-train-your-models)的厂商“不使用客户数据训练模型”声明。09-30 搜索结果仍能找到这些官方文字，但**本轮未作为核心页面重新打开**：只保留带 09-28 日期的来源范围，合同、默认设置和实际账户行为仍 unknown。下载入口不等于每个套餐都有同样导出权限；“不训练”不等于不经服务商处理。

**Task Cluster：**主 `meeting-notes`，角色候选 Gap-filler。Fathom 与 Otter.ai、Fireflies.ai 已有各自产品详情；Avoma 的可讨论差异是 *付费录制者与免费协作者分离 + 管理员配置 CRM 同步 + 可选会话/收入洞察*，不是泛会议摘要更准确，也不是把每个附加能力默认给所有席位。`meeting-transcription`、`meeting-summary-and-actions` 仅为既有 Capability 候选；全局 Ask、CRM 双向字段与同意/留存须按套餐写 Constraint/Evidence，不创建 Tool Capability、Fit、Task Page 或 Comparison 关系。Best for 候选：少数录制者、大量只读协作者且需要 CRM 管理流程的销售/客户成功团队。Not ideal 候选：需永久免费录自己会议、无法获得必要与会者同意、或要求低层套餐具有企业保留/严格同意政策的团队。这是来源支持的适配判断，未经产品实测。

**素材及本地化：**仓库 `public/icons/tool-logos`、`public/images/tool-media` 无 Avoma 文件，候选 JSON 也无可用媒体路径；官方网页或商店展示 logo/截图不自动授予再分发许可。缺可核验授权的官方 logo 与真实非占位产品媒体，缺完成审校的 EN/CN/TW 决策正文、适用条件与来源展示。不能下载未获许可媒体或用通用封面充数。

## 4. 八项硬门槛

| 门槛 | 结果 | 本次判定 |
| --- | --- | --- |
| 对象明确 | **PASS** | 官方 Avoma AI Meeting Assistant 与可选 CI/RI 是同一产品体系；生产无同名/同域实体。 |
| AI 价值明确 | **PASS** | 录制后转写、摘要、会议问答与有条件跨会议/交易洞察均有实际 AI 工作与输出。 |
| 实际可用 | **PASS** | 14 天无需信用卡试用、Recorder 付费路径与 Enterprise demo 可见；实际报价待核。 |
| 官方证据完整 | **HOLD** | 六个互补官方核心页足以说明范围，但 Organization/Enterprise 报价、CRM 套餐资格、严格同意和保留政策仍影响购买判断。 |
| 独立市场依据 | **PASS** | G2 当前用户评价为强采用；Chrome 扩展商店计数为另一平台辅助。 |
| 决策价值 | **PASS** | 可具体写出团队适合/不适合、席位与 add-on、CRM/隐私约束及三个现有工具的比较方向。 |
| 内容真实完整 | **HOLD** | 无可核验复用许可的 Avoma 真实素材、无三语言完成稿；不可虚构体验。 |
| 不重复且可维护 | **PASS** | 只读查重 0，alias 无 Avoma，Guide/Comparison 意图可分；建议 2026-10-05 或证据到齐即提前复查。 |

**总结果：6 PASS / 2 HOLD。** 任一 HOLD 即保持 `HOLD_EVIDENCE`；候选无生产实体、页面发布、sitemap 或索引批准。若将来全部通过，才生成**非执行** `READY_FOR_RELEASE_PREFLIGHT` 包，公开与索引批准仍为 false，发布默认 `monitor/noindex`，索引另案。

## 5. 可操作退出条件

1. 从 Avoma 当前可复现的结账视图或厂商书面回复，消歧 Organization/Enterprise 报价、账期与实际 CI/RI 叠加费用；如完全省略金额，仍须解决 CRM 权益和隐私政策边界才可作采购判断。
2. 用目标 Startup/Organization/Enterprise 账户或当前官方资格矩阵，确认 Salesforce/HubSpot 连接、自动笔记、双向字段、MCP/下载和严格同意分别要求的套餐、管理员/CRM 权限；明确内外会议默认及用户可覆盖范围。
3. 确认基础层与 Enterprise 的实际留存配置、默认期限、删除 SLA、下载角色/格式及数据处理/训练合同范围；无法核实则以 unknown 留在候选，不写安全保证。
4. 取得记录 URL、复用范围和归属条件的 Avoma 官方 logo 与真实产品媒体；完成 EN/CN/TW 产品决策文案及人工审校，不借网页公开展示推定许可。
5. 未来发布日重跑生产身份/域名/别名、Guide/Comparison、三语言 shell、robots/sitemap 与统一发布器只读门禁，再独立决定是否可提交发布 preflight；本包不生成 SQL。

本轮只新增候选证据并更新台账；没有生产数据库、实体、关系、页面、SEO、索引、sitemap、push 或 deploy 写入。
