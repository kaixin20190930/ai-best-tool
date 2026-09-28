# 成熟高需求工具候选缓冲池

日期：2026-09-20  
状态：14 项候选映射完成（2026-09-28）；仍是研究与深审台账，不授予发布或索引资格
数据文件：`data/collection/mature-candidate-buffer-2026-09-20.json`（原始预审快照与机器门禁；下文为后续状态/映射台账）

队列组合治理以[收录准入规范的 Task Cluster 组合规则](./BEST_DIRECTORY_POSITIONING_AND_INTAKE_CN.md#task-cluster-组合队列规范事实源)为准；本文件和 JSON 是候选实例清单，不是第二套政策事实源。

## 一、这一步做了什么

先对生产 63 条工具记录做只读查重，再建立 14 条候选缓冲。候选入池只表示“值得进行完整核验”，不会创建公开页面，也不会批准索引。

当前组合：

- 成熟高需求工具 10 条；
- 快速增长且已有证据基础的工具 3 条；
- 有明确决策差异的专业工具 1 条。

候选覆盖写作、设计、自动化、开发、研究、会议和企业 Agent。排序优先考虑用户是否存在真实选择困难、官方边界是否可验证、是否能与现有工具形成有意义的比较，而不是只按新品或品牌流量排序。

**队列就绪说明（2026-09-28）：**下文第六至九节是这 14 项的唯一执行映射台账；JSON 保留原始身份、来源线索和发布布尔值，不增设数据库字段。`READY_FOR_DEEP_REVIEW` 只允许开始完整官方证据深审，绝非 `ready-to-publish`；既有发布项仍按真实公开状态记账。所有拟议 Task / Capability / 组合角色只是编辑研究假设，不生成 Tool Capability、Fit、Task Page 或推荐关系。现有 Task 未覆盖时以“编辑 Cluster（未注册 Task）”明记空位，不强行归类。

## 二、候选顺序

| 顺序 | 工具 | 类型 | 主要决策价值 | 当前状态 |
| ---: | --- | --- | --- | --- |
| 1 | Grammarly | 成熟高需求 | 免费/付费、通用 AI 替代、Superhuman Go 迁移 | 09-21 受控公开；09-22 独立批准进入索引面 |
| 2 | Jasper | 成熟高需求 | 席位费、credits、品牌治理 | 09-21 提前授权受控公开；09-22 独立批准进入索引面 |
| 3 | Descript | 成熟高需求 | 文本式剪辑、媒体时长、AI credits | 已于 2026-09-27 受控发布，monitor/noindex |
| 4 | Canva（含 Magic Studio） | 成熟高需求 | AI 套件范围、套餐限制、商业使用 | 合并到唯一 Canva canonical，不新建 Magic Studio 页面 |
| 5 | Zapier Agents | 成熟高需求 | 独立 Agents 迁入 AI by Zapier 的身份、activity/task 计费与权限 | N2 官方深审完成；`HOLD_EVIDENCE` |
| 6 | Microsoft Copilot Studio | 成熟高需求 | Copilot Credits、租户授权、Power Platform 环境与外部渠道 | N3 官方深审完成；`HOLD_EVIDENCE` |
| 7 | Tabnine | 成熟高需求 | 私有部署、编码助手与 Agent、收购后连续性 | N4 官方深审完成；`HOLD_EVIDENCE` |
| 8 | Elicit | 成熟高需求 | 检索与系统综述、语料和导出限制 | N1 官方深审完成；`HOLD_EVIDENCE` |
| 9 | Avoma | 成熟高需求 | 录制席位、免费协作者、CRM 工作流 | N1 官方深审完成；`HOLD_EVIDENCE` |
| 10 | Copy.ai | 成熟高需求 | Copywriter 到 GTM 平台的身份变化 | 待深审 |
| 11 | Read AI | 快速增长 | 会议额度、跨来源检索、回放、工作区与留存 | N3 官方深审完成；`HOLD_EVIDENCE` |
| 12 | Granola | 快速增长 | Botless 会议记录、用户笔记与 AI 增强 | N4 官方深审完成；`HOLD_EVIDENCE` |
| 13 | Ideogram | 快速增长 | 订阅/API 分账、免费资格、公开作品与授权 | N2 官方深审完成；`HOLD_EVIDENCE` |
| 14 | Scite | 专业差异化 | Smart Citation、检索与证据判断 | 待深审 |

## 三、明确排除的对象

- `Sourcegraph Cody`：Free/Pro 已停止，不能沿用历史热度制作面向普通用户的页面；如未来处理，只能先重新定义 Enterprise 范围。
- `Amazon Q Developer IDE plugins`：官方已有 2027-04-30 停止支持通知并引导至 Kiro；必须先解决产品生命周期和 canonical 范围，不能直接排期。

这两项说明候选池不是热门词清单。产品生命周期不稳定时，即使知名也应先退出发布队列。

## 四、下一步执行方式

每次只处理一条候选：

1. 再次查询生产实体、域名、alias 和搜索意图，确保无重复。
2. 核验至少两条互补官方来源，不把同一价格页的不同段落当作多来源。
3. 核验至少一条强独立信号和另一条强信号或支持信号。
4. 写清价格、免费额度、限制、隐私、适合与不适合人群、比较维度和素材使用依据。
5. 自动测试通过后，统一发布器先生成 `published + monitor/noindex` 页面。
6. `mature_high_demand` 可在同日紧接着运行独立索引质量门禁；其他类型保留观察期。无论哪条路径，策略暂停、站点健康、额度或任一质量门槛不通过时都保持 monitor。

首个对象 Grammarly 已于 `2026-09-21` 完成受控公开，当时状态为 `published + monitor/noindex`；09-22 经独立门禁批准进入索引面，不能继续以 09-21 状态描述当前资格。身份、价格、提示额度、训练控制、隐私、独立市场信号和 Decision Card 已按当次发布核验；Grammarly 保持写作产品 canonical，Superhuman 是母品牌与套件，Go 是相关但不同范围的助手。详见 `data/collection/grammarly-preaudit-2026-09-20.json`、`data/collection/grammarly-release.json` 和[索引政策的 09-22 执行记录](./TOOL_INDEX_RELEASE_POLICY_CN.md)。

第二个对象 Jasper 已于 2026-09-21 经 Owner 候选限定授权提前完成受控公开，当时为 `published + monitor/noindex`；09-22 经独立门禁批准进入索引面。发布事实、价格、credits、品牌治理、数据处理和人工编辑边界已按当次公开回读；CL-06 品牌关系仍因官方权益冲突保持 HOLD，不能用工具索引资格替代关系证据。

Canva 身份已收口：候选 slug 固定为 `canva`，Magic Studio 是 Canva 的 AI 能力集合，不是第二个独立产品。后续只能增强唯一 `/ai/canva` 页面，禁止创建 `/ai/canva-magic-studio` 或竞争同一意图的页面。

第三个对象 Descript 已于 `2026-09-27` 完成单项受控发布。生产唯一实体为 `published + monitor/noindex`；`/ai/descript` 与 `/cn/ai/descript` 均为 `200 + self-canonical + noindex`，带 Decision Card，sitemap 匹配为 0。身份范围固定为一个文本式音视频编辑工作区，Underlord、AI Speakers、voice clone、avatar 与 dubbing 均为能力，不拆成重复页面。三语言内容分别呈现 media hours 与 AI credits、逐席位价格、团队共享池、额度不结转、语音同意、训练开关、人工访问和输出权利边界。旧版固定 avatar credit 示例已删除；现行官方文档说明实际消耗随模型及任务变化。原定最早发布槽 `2026-09-23` 保留为历史门禁；本次没有索引批准。

## 五、验收结论

原始 JSON 的自动验收检查：候选总数 14-21、slug 与官网域名唯一、分类配比一致、每项至少 2 条官方来源和 1 条独立来源、至少 4 个决策维度和 2 个风险。后续三项受控公开使 `publicReleaseApproved=true`；JSON 的 `indexReleaseApproved=false` 是候选预审字段/历史快照，**不能**覆盖 09-22 Grammarly/Jasper 的独立索引批准事实或用于推断当前生产索引状态；真实索引门禁和批准记录以[索引政策](./TOOL_INDEX_RELEASE_POLICY_CN.md)及当次生产回读为准。

2026-09-20 原始候选建池没有写生产数据库、没有新增页面、没有修改 sitemap，也没有消耗索引额度；本次 09-28 映射也只更新文档。两者之间的受控公开与索引批准按各自执行记录记账。

## 六、逐项候选卡与术语边界（2026-09-28）

下表中的 `Capability` 只复用 [Decision Graph 种子定义](../scripts/plan-decision-graph-seed.ts)的现有 slug；`—` 表示现有 12 个 Capability 中没有精确对应项，不能借相似词创建关系。`Constraint` 的“待核验”是深审问题而不是已验证产品事实。官方 URL 是身份入口；原 JSON 的官方/独立 URL 是待复核线索，不代表本轮重新访问或通过八项准入。所有条目的消费位置均按 **Tool Intelligence 事实 → Task Page 资格复核 → Structured Comparison 差异验证 → Decision Assistant 另行门禁** 顺序理解；下表只指明各项最先有价值的位置，不授权上线。

| # / 工具与官方 URL | 当前状态 / readiness | 唯一 primary Task Cluster；secondary；角色 | 现有 Capability 候选；关键 Constraint / Evidence gap | 与既有工具的决策差异、why now、最先消费位置 |
| --- | --- | --- | --- | --- |
| 1 [Grammarly](https://www.grammarly.com/) | 已公开且 09-22 进入索引面；`HOLD_DUPLICATE_INTENT`（新工具队列） | `brand-constrained-marketing-content`；secondary：通用写作（未注册）；Alternative | `brand-controls-and-style-guidance`；组织规则对 AI 初稿是否自动生效**待核验**，现有 CL-06 关系仍 HOLD | 对 Jasper 的品牌起草侧重已有草稿的规则审阅；已有唯一页面，当前应补 [CL-06 证据](./DECISION_GRAPH_CL06_BRAND_EDITORIAL_PACKET_2026-09-27_CN.md)，不再次收录。先消费 Tool Intelligence 事实修订。 |
| 2 [Jasper](https://www.jasper.ai/) | 已公开且 09-22 进入索引面；`HOLD_DUPLICATE_INTENT`（新工具队列） | `brand-constrained-marketing-content`；secondary：通用写作（未注册）；Anchor | `brand-guided-content-generation`、`brand-controls-and-style-guidance`；Jasper IQ 总览与单功能页 Pro/Business 权益冲突，`availability=unknown` | 对 Grammarly 的差异是假设性品牌资料起草与团队治理；既有唯一页面，先消解 [CL-06 官方证据冲突](./DECISION_GRAPH_CL06_BRAND_EVIDENCE_CANDIDATE_2026-09-28_CN.json)，不占新工具槽。先消费 Tool Intelligence。 |
| 3 [Descript](https://www.descript.com/) | 已公开 `monitor/noindex`；`HOLD_DUPLICATE_INTENT`（新工具队列） | `ai-voiceover`；secondary：音视频文本式编辑（未注册）；Gap-filler | `text-to-speech-voice-generation`、`voice-consent-and-export`；当前声音商用许可矩阵、复合能力套餐 `availability` **待核验** | 对 ElevenLabs 的潜在差异是编辑工作流与交付，而非单一声音生成；[CL-05](./DECISION_GRAPH_CL05_VOICE_EDITORIAL_PACKET_2026-09-27_CN.md) 仍为 conditional/HOLD。已有唯一页面；先消费 Tool Intelligence 权利与套餐复核。 |
| 4 [Canva（含 Magic Studio）](https://www.canva.com/) | 现有 Canva canonical 待增强；`HOLD_DUPLICATE_INTENT`（新工具队列） | 编辑 Cluster：AI 辅助视觉设计（未注册 Task）；secondary：品牌营销素材（非现有 `marketing_draft` Task）；Anchor | —；Magic Studio 能力边界、套餐/地区额度及商业使用条件**待核验** | 与 Ideogram 的差异拟为设计工作区与品牌团队流程，不能将 Magic Studio 拆成产品。现在只做现有 `/ai/canva` 身份与事实更新；先消费 Tool Intelligence。 |
| 5 [Zapier Agents](https://zapier.com/agents) | N2 官方深审完成；`HOLD_EVIDENCE` | 编辑 Cluster：业务 Agent 工作流（未注册 Task）；secondary：开发工作流集成（不等于构建完整应用）；Anchor（暂定，迁移后重评） | —；独立 Agents 400/1,500 activities 与迁入 AI by Zapier 的 task 倍率、免费资格、逐工具人审/Enterprise 策略分属不同路径；**迁移后 canonical、账户实际权益和 Agents 产品级独立采用待核** | 相对 n8n 的托管 Agent 差异仍是候选假设；[N2 审计](./ZAPIER_AGENTS_IDEOGRAM_N2_OFFICIAL_EVIDENCE_AUDIT_2026-09-28_CN.md)确认官方正迁入 Zap 编辑器，不能借 Zapier 母产品采用或 Zaps 能力。先消歧身份与计费，再消费 Tool Intelligence。 |
| 6 [Microsoft Copilot Studio](https://www.microsoft.com/en-us/microsoft-copilot/microsoft-copilot-studio) | N3 官方深审完成；`HOLD_EVIDENCE` | 编辑 Cluster：业务 Agent 工作流（未注册 Task）；secondary：企业知识/部署（未注册）；Alternative | —；已证 Credits 包/预购/按量、渠道与 Power Platform 管理边界；**实际租户费率、M365 内含条件、Bing 数据边界和 Studio 产品级独立采用待核** | 相对 Zapier Agents，环境/Dataverse、DLP 与分项 Credit 是候选差异；[N3 审计](./COPILOT_STUDIO_READ_AI_N3_OFFICIAL_EVIDENCE_AUDIT_2026-09-28_CN.md)限定 Studio 与 M365/Azure 的关系。先补账户/合同及独立信号，再消费 Tool Intelligence。 |
| 7 [Tabnine](https://www.tabnine.com/) | N4 官方深审完成；`HOLD_EVIDENCE` | `build-app-with-ai` **资格待定**；secondary：开发助手（未注册）；Alternative（暂定） | `ai-assisted-app-development` **Fit 待定**；官方文档可证 Agent/CLI/Review、IDE 矩阵及 SaaS/VPC/on-prem 选择；**定价页实时跳转，现行 SKU/价格/试用、模型与 CI 费用、实际数据路径、完整应用交付和独立采用待核** | 相对 Cursor，保留现有 IDE、部署与组织权限是候选差异；[N4 审计](./GRANOLA_TABNINE_N4_OFFICIAL_EVIDENCE_AUDIT_2026-09-28_CN.md)禁止借旧套餐或将编码助手自动算入完整应用 Task。先消费 Tool Intelligence。 |
| 8 [Elicit](https://elicit.com/) | N1 官方深审完成；`HOLD_EVIDENCE` | `research-with-citations`；secondary：系统综述（未注册）；Alternative | `research-discovery`；`citation-traceability` 仅作有来源回查的候选。已证语料、筛选/提取、分层导出；**定价页多组金额、实际月度额度和独立采用未核清** | 相对 Consensus，专用综述的筛选/抽取/导出链是候选差异；不泛化为所有研究任务。先补 [N1 审计](./ELICIT_AVOMA_N1_OFFICIAL_EVIDENCE_AUDIT_2026-09-28_CN.md) 缺口，再进发布 preflight。 |
| 9 [Avoma](https://www.avoma.com/) | N1 官方深审完成；`HOLD_EVIDENCE` | `meeting-notes`；secondary：销售会话/CRM（未注册）；Gap-filler | `meeting-transcription`、`meeting-summary-and-actions`；已证 Recorder/免费只读协作者及附加模块分层；**Organization 价与 CRM 套餐资格冲突，留存/同意套餐边界和独立采用待核** | 相对 Fathom/Otter.ai/Fireflies.ai，分席位采购、CRM 配置和可选全局洞察是候选差异；不采信销售 ROI 数字。先补 [N1 审计](./ELICIT_AVOMA_N1_OFFICIAL_EVIDENCE_AUDIT_2026-09-28_CN.md) 缺口，再进发布 preflight。 |
| 10 [Copy.ai](https://www.copy.ai/) | 研究缓冲；`HOLD_EVIDENCE` | 编辑 Cluster：GTM 工作流（未注册 Task）；secondary：`brand-constrained-marketing-content` 仅待资格审查；Gap-filler（暂定） | —；当前 GTM 产品与旧 copywriter 评论的身份连续性、工作流 credits、独立产品级采用**待核验** | 与 Jasper 的品牌营销起草不是同一已证任务；现在先确定是否有可比较的 GTM 工作流对象与非旧版独立证据，避免重复营销文案意图。先消费 Tool Intelligence 身份审计。 |
| 11 [Read AI](https://www.read.ai/) | N3 官方深审完成；`HOLD_EVIDENCE` | `meeting-notes`；secondary：跨会议资料检索（未注册）；Alternative | `meeting-transcription`、`meeting-summary-and-actions`；已证 Free 5 次/月、Ask Read 权限、回放分层和 API beta；**上传 credit、实际导出/留存、同意与产品级独立采用待核** | 相对 Fathom/Otter.ai/Fireflies.ai，个人可访问会议与已连接邮件/消息检索是候选差异；[N3 审计](./COPILOT_STUDIO_READ_AI_N3_OFFICIAL_EVIDENCE_AUDIT_2026-09-28_CN.md)限定高级连接、工作区权限及数据边界。先消费 Tool Intelligence，再比较。 |
| 12 [Granola](https://www.granola.ai/) | N4 官方深审完成；`HOLD_EVIDENCE` | `meeting-notes`；secondary：个人笔记增强（未注册）；Gap-filler | `meeting-transcription`、`meeting-summary-and-actions` 仅候选；已证用户启动的无 bot 设备采集、手写笔记增强、Basic 30 天可见历史与 Business API；**实际告知/同意、音频缓存/转录与笔记留存、账户权益及独立采用待核** | 相对既有会议工具及 Read AI，主动设备采集与用户笔记引导是候选差异；[N4 审计](./GRANOLA_TABNINE_N4_OFFICIAL_EVIDENCE_AUDIT_2026-09-28_CN.md)限定共享范围，不能把无 bot 写成全本地或零保留。先消费 Tool Intelligence。 |
| 13 [Ideogram](https://ideogram.ai/) | N2 官方深审完成；`HOLD_EVIDENCE` | 编辑 Cluster：AI 图片与文字排版（未注册 Task）；secondary：AI 辅助视觉设计（未注册）；Gap-filler（暂定） | —；已证网页/API 分账、公开默认与商业输出条款；**免费周额度资格、编辑 slow/priority 冲突、下载/水印矩阵、独立采用和文字质量待核** | 相对 Canva 的工作区，生成含文字图像和局部编辑是可研究差异；[N2 审计](./ZAPIER_AGENTS_IDEOGRAM_N2_OFFICIAL_EVIDENCE_AUDIT_2026-09-28_CN.md)限定能力/版权边界。不能借 Canva Task 建 Fit，先消费 Tool Intelligence。 |
| 14 [Scite](https://scite.ai/) | 研究缓冲；`HOLD_EVIDENCE` | `research-with-citations`；secondary：引文上下文核验（未注册）；Gap-filler | `citation-traceability`；Smart Citation 覆盖、语境解释、套餐与独立采用**待核验** | 相对 Consensus 与 Elicit 拟补引文语境，而不是重复学术搜索；先确认当前产品范围与可追溯的独立采用，再排完整深审。先消费 Tool Intelligence 证据范围。 |

`HOLD_DUPLICATE_INTENT` 的 4 项不是被拒产品：Grammarly、Jasper、Descript 已有公开实体，Canva 只增强既有 canonical。N4 后 `READY_FOR_DEEP_REVIEW=0`、`HOLD_EVIDENCE=10`（其中 Elicit、Avoma、Zapier Agents、Ideogram、Microsoft Copilot Studio、Read AI、Granola、Tabnine 已完成官方深审）、`HOLD_DUPLICATE_INTENT=4`、`REJECT=0`。研究候选仍为 14 项，但**可考虑新增实体的仅 10 项，全部先补证据**；Zapier Agents 最终能否保持独立 canonical、Tabnine 能否纳入完整应用 Task 仍待消歧。上述角色是组合研究标签，不是对产品能力或生产关系的已核实断言。

## 七、按 Task Cluster 的组合检查与缺口

| Primary Cluster | 本池候选与现有对照 | Anchor / Alternative / Gap-filler 目标检查；缺口 |
| --- | --- | --- |
| `meeting-notes` | 既有 Fathom、Otter.ai、Fireflies.ai；新研究 Avoma / Read AI / Granola | 既有成熟锚点可供复核；N1/N3/N4 分别确认 Avoma 的分席位 CRM、Read AI 的权限内跨来源搜索、Granola 的主动设备采集/用户笔记引导三种候选路线。三项均缺独立采用；不能据此发布 Fit 或视作等价摘要工具。 |
| `research-with-citations` | 既有 Consensus；新研究 Elicit / Scite | Consensus 可作现有锚点；Elicit 拟作替代，Scite 拟补引文语境。Scite 证据 HOLD；三种路线不能互称同等引用能力。 |
| `brand-constrained-marketing-content` | 既有 Jasper、Grammarly；Copy.ai 仅 secondary 待资格审查 | Jasper/Grammarly 为既有锚点/替代研究对象，但 CL-06 关系均 HOLD；**缺已核实的新 Gap-filler 与可发布 Task Fit**，不能以 Copy.ai 强补。 |
| `ai-voiceover` | 既有 Descript、ElevenLabs | 生成与编辑交付可能互补；**缺第三项有证据的不同选择及已发布关系**。本池不增第 15 项。 |
| `build-app-with-ai` | 既有 Cursor；Tabnine 仍 HOLD | Cursor 可作既有锚点；**缺已证完整应用场景的 Alternative 与 Gap-filler**。N4 已证 Tabnine 当前编码/Agent/私有部署范围，但未证完整应用交付，不得自动取得 Fit；CL-04 的 n8n/OpenRouter Fit 已撤回。 |
| `product-image-to-short-video` | 本池无 primary；既有 Luma/Runway 属另线 | **本池空位**；不能把 Descript、Canva 或 Ideogram 的不同输出硬归类。CL-03 关系继续 HOLD。 |
| 编辑 Cluster：业务 Agent 工作流（未注册 Task） | Zapier Agents / Microsoft Copilot Studio | N2/N3 已界定两种不同身份、渠道、治理与计量路径；Zapier Agents 正迁入 AI by Zapier，Studio 租户权益待按合同核，且两项独立采用均缺。**Gap-filler 与第三项仍缺**，不借 `build-app-with-ai` 解锁 Task Page。 |
| 编辑 Cluster：AI 辅助视觉设计 / AI 图片与文字排版（均未注册 Task） | Canva 既有 canonical / Ideogram 新研究 | 可研究工作区与图片生成差异；两个 primary Cluster 不应为凑 3–5 项强行合并，**各自缺完整三角色组合与 Task 定义**。 |
| 编辑 Cluster：GTM 工作流（未注册 Task） | Copy.ai 单项 HOLD | **Anchor、Alternative 和已证 Gap-filler 均缺**；先做对象与独立证据审查。 |

本表不把 secondary 计作另一 Cluster 的有效 Fit；“已有工具”只作对照，不代表其当前 Decision Graph 关系已发布。组合目标是每组 3–5 项且覆盖三个角色，但证据不足时保留空位。后续若用户体验或 GSC 提出真实新任务，应另案治理 Task taxonomy；本次没有新增候选或 Task。

## 八、未来 7 个正常运营日：候选研究队列与条件发布顺序

以 N1–N7 表示**实际发生的下七个正常运营日**，跳过休息/停工日；每日最多 2 个候选研究工作项。这里是深审和补证据排程，不是公开或索引承诺。每项先复查生产实体/alias，再核对两条互补官方来源、产品级独立采用、套餐/限制和真实素材；`HOLD_EVIDENCE` 项先解决列明阻塞才进入完整深审。

| 运营日 | 候选深审或补证据（最多 2） | 当日退出条件 |
| --- | --- | --- |
| N1 | Elicit；Avoma | 2026-09-28 官方深审完成，均 `HOLD_EVIDENCE`；见 [N1 审计](./ELICIT_AVOMA_N1_OFFICIAL_EVIDENCE_AUDIT_2026-09-28_CN.md)。独立市场验证及官方权益冲突待消解，未进 preflight。 |
| N2 | Zapier Agents；Ideogram | 2026-09-28 官方深审完成，均 `HOLD_EVIDENCE`；见 [N2 审计](./ZAPIER_AGENTS_IDEOGRAM_N2_OFFICIAL_EVIDENCE_AUDIT_2026-09-28_CN.md)。Zapier 独立版迁移与新旧计费冲突、Ideogram 免费/编辑/导出权益及两者产品级独立采用待核，未进 preflight。 |
| N3 | Microsoft Copilot Studio；Read AI | 2026-09-28 官方深审完成，均 `HOLD_EVIDENCE`；见 [N3 审计](./COPILOT_STUDIO_READ_AI_N3_OFFICIAL_EVIDENCE_AUDIT_2026-09-28_CN.md)。实际租户授权/成本、账户留存/同意与两项独立市场验证待补，未进 preflight。 |
| N4 | Granola；Tabnine（先补证据） | 2026-09-28 官方深审完成，均 `HOLD_EVIDENCE`；见 [N4 审计](./GRANOLA_TABNINE_N4_OFFICIAL_EVIDENCE_AUDIT_2026-09-28_CN.md)。Granola 的实际同意/留存、Tabnine 收购后的 SKU/数据路径及完整应用适配、两项独立采用待核，未进 preflight。 |
| N5 | Scite（先补证据）；Copy.ai（先补证据） | 核引文覆盖与独立采用、当前 GTM 对象与旧评论区别；不得以弱来源转 READY。 |
| N6 | Canva 既有 canonical 身份/AI 模块复核；Grammarly 既有 CL-06 证据复核 | 只做现有工具事实与关系候选复核，不占新工具发布槽。 |
| N7 | Jasper 既有 CL-06 权益冲突复核；Descript 既有 CL-05 权利复核 | 消解官方冲突或保持 HOLD；不重复创建实体。 |

**允许发布顺序与研究顺序分开：**只有完成当次官方证据深审、八项准入、独立市场验证、身份/意图去重、编辑决策内容、素材和发布器门禁后，才按 `Elicit → Avoma → Zapier Agents → Ideogram → Microsoft Copilot Studio → Read AI → Granola` 逐项考虑**候选发布槽**；这是条件排序，不是日期或批准。Tabnine、Scite、Copy.ai 在证据 HOLD 解除前没有发布顺位；四项既有 canonical 没有新增实体顺位。任一前项失败可跳过并记录原因，后项仍需自己的门禁。最近 5 个拟发布项同主 Task 最多 2、同厂商最多 1，且不出现连续 3 项同 Task/厂商/能力方向；实际批次须每周重算。正常运营日仍仅可公开 1–2 个全部达标的新工具，质量 blocker 时记录为 0 并补池；新页默认 `monitor/noindex`，索引独立执行[索引政策](./TOOL_INDEX_RELEASE_POLICY_CN.md)的日 1、周目标 4 / 硬上限 5 与站点健康门禁。

## 九、去重、集中风险与下游门禁

- **实体/意图去重：**发布前重查生产 name、slug、域名、alias、canonical 与现有 Guide/Comparison 意图。Grammarly、Jasper、Descript 不再占新工具槽；Canva Magic Studio 只能作为 Canva 能力。Zapier Agents 与 Zapier 核心自动化、Microsoft Copilot Studio 与 Microsoft 365 Copilot、Copy.ai 旧文案产品与现 GTM 平台，必须按具体产品范围重新查重。2026-09-20 的 63 条生产只读查重是历史基线，不代替发布前再查。
- **同质化：**Avoma/Read AI/Granola 同属会议，但差异仅为待证假设；Elicit/Scite 不能重复解释为 Consensus 的换名搜索；Jasper/Grammarly/Copy.ai 不能以“营销 AI”泛词共享同一 Task Fit。缺少直接官方证据或独立采用就保持 HOLD。
- **同厂商与同 Task 集中：**本池官方域名各异；Canva 与 Magic Studio 是唯一明确同厂商重复身份，已收口。研究日最多 2 项，并交错会议、研究、Agent、视觉。发布时按[唯一组合规则](./BEST_DIRECTORY_POSITIONING_AND_INTAKE_CN.md#容量反同质化与每周验收)审最近 5 个新工具与最近 5 个索引批准：同主 Task 或同厂商不得超过 3 个，连续 3 个不能同 Task、厂商或能力方向。研究排序本身不消耗发布/索引额度。
- **消费边界：**Tool Intelligence 只能写已核实且有核查日期的事实；Task Page 需要真实 published Fit、required/preferred 能力及独立注册审批，目前不能由本表启动；Structured Comparison 只能比较同一任务中已证实的差异；Decision Assistant 仍受 [DIFF-08 启动门槛](./DECISION_GRAPH_DIFFERENTIATION_ONE_WEEK_PLAN_CN.md)阻断。`unknown/待核验` 不得在任一层自动补全或暗示产品具有能力。
