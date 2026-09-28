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
| 5 | Zapier Agents | 成熟高需求 | Agent 与 Zap、activity 计费、可靠性 | 待深审 |
| 6 | Microsoft Copilot Studio | 成熟高需求 | 消息包、按量计费、Power Platform 依赖 | 待深审 |
| 7 | Tabnine | 成熟高需求 | 私有部署、编码助手与 Agent、收购后连续性 | 待深审 |
| 8 | Elicit | 成熟高需求 | 检索与系统综述、语料和导出限制 | 待深审 |
| 9 | Avoma | 成熟高需求 | 录制席位、免费协作者、CRM 工作流 | 待深审 |
| 10 | Copy.ai | 成熟高需求 | Copywriter 到 GTM 平台的身份变化 | 待深审 |
| 11 | Read AI | 快速增长 | 会议额度、回放、工作区和保留策略 | 待深审 |
| 12 | Granola | 快速增长 | Botless 会议记录、用户笔记与 AI 增强 | 待深审 |
| 13 | Ideogram | 快速增长 | 订阅/API、credits、隐私和授权 | 待深审 |
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
| 5 [Zapier Agents](https://zapier.com/agents) | 研究缓冲 `screened_for_deep_review`；`READY_FOR_DEEP_REVIEW` | 编辑 Cluster：业务 Agent 工作流（未注册 Task）；secondary：开发工作流集成（不等于构建完整应用）；Anchor | —；Agents/Zaps/Chatbots 产品边界、activity 计费、连接应用权限及可靠性**待核验** | 相对现有 n8n 的编排路径可能有托管 Agent 与计费差异；现在审的是具体 Agents 产品，不能借 Zapier 母产品采用信号。先消费 Tool Intelligence 与未来同任务 Comparison。 |
| 6 [Microsoft Copilot Studio](https://www.microsoft.com/en-us/microsoft-copilot/microsoft-copilot-studio) | 研究缓冲；`READY_FOR_DEEP_REVIEW` | 编辑 Cluster：业务 Agent 工作流（未注册 Task）；secondary：企业知识/部署（未注册）；Alternative | —；消息包与按量计费、Power Platform 与 Microsoft 365 Copilot 权益边界、部署渠道**待核验** | 与 Zapier Agents 比较企业治理、渠道和计费，不能以 Microsoft 品牌代替产品级独立采用。现在可补同任务企业选项；先消费 Tool Intelligence、后续 Comparison。 |
| 7 [Tabnine](https://www.tabnine.com/) | 研究缓冲；`HOLD_EVIDENCE` | `build-app-with-ai`；secondary：开发助手（未注册）；Alternative（暂定） | `ai-assisted-app-development`；私有部署/Agent 与 headless 套餐、收购后产品连续性和完整应用交付适配**待核验** | 相对既有 Cursor 可能以部署/隐私补位，但 IDE 辅助不能自动等于完成应用；先核实产品身份、当前官方范围与独立采用，再决定能否进入本 Task。先消费 Tool Intelligence。 |
| 8 [Elicit](https://elicit.com/) | 研究缓冲；`READY_FOR_DEEP_REVIEW` | `research-with-citations`；secondary：系统综述（未注册）；Alternative | `research-discovery`、`citation-traceability`（后者仅研究问题，非关系承诺）；语料、全文、筛选、导出与套餐限制**待核验** | 对已发布 Consensus 研究关系，拟比较系统综述/筛选流程与引用回查；当前 Cluster 仅一条已发布 Fit，因此现在值得深审。先消费 Tool Intelligence，再评估 Task Page / Comparison。 |
| 9 [Avoma](https://www.avoma.com/) | 研究缓冲；`READY_FOR_DEEP_REVIEW` | `meeting-notes`；secondary：销售会话/CRM（未注册）；Gap-filler | `meeting-transcription`、`meeting-summary-and-actions`；录制席位/免费协作者、附加模块、同意与留存**待核验** | 对 Fathom、Otter.ai、Fireflies.ai 的拟议差异是录制席位和 CRM 后续工作流；现在补既有会议组合的约束维度。先消费 Tool Intelligence，后续 Comparison。 |
| 10 [Copy.ai](https://www.copy.ai/) | 研究缓冲；`HOLD_EVIDENCE` | 编辑 Cluster：GTM 工作流（未注册 Task）；secondary：`brand-constrained-marketing-content` 仅待资格审查；Gap-filler（暂定） | —；当前 GTM 产品与旧 copywriter 评论的身份连续性、工作流 credits、独立产品级采用**待核验** | 与 Jasper 的品牌营销起草不是同一已证任务；现在先确定是否有可比较的 GTM 工作流对象与非旧版独立证据，避免重复营销文案意图。先消费 Tool Intelligence 身份审计。 |
| 11 [Read AI](https://www.read.ai/) | 研究缓冲；`READY_FOR_DEEP_REVIEW` | `meeting-notes`；secondary：跨会议资料检索（未注册）；Alternative | `meeting-transcription`、`meeting-summary-and-actions`；免费会议额度、回放、工作区权限、留存及同意**待核验** | 对现有三项会议工具，拟检验跨会议/消息查找是否带来不同决策路径；现在研究这一增量而非因增长标签发布。先消费 Tool Intelligence，再比较。 |
| 12 [Granola](https://www.granola.ai/) | 研究缓冲；`READY_FOR_DEEP_REVIEW` | `meeting-notes`；secondary：个人笔记增强（未注册）；Gap-filler | `meeting-transcription`、`meeting-summary-and-actions`；botless 采集边界、原始音频/笔记保留、团队共享与同意**待核验** | 与 Fathom/Otter.ai/Fireflies.ai 以及 Read AI 的拟议区别是用户笔记与无会议 bot 的流程；现在验证这一约束补位，不能把“botless”推断为隐私保证。先消费 Tool Intelligence。 |
| 13 [Ideogram](https://ideogram.ai/) | 研究缓冲；`READY_FOR_DEEP_REVIEW` | 编辑 Cluster：AI 图片与文字排版（未注册 Task）；secondary：AI 辅助视觉设计（未注册）；Gap-filler | —；订阅/API credits、作品隐私、商用许可与文字质量**待核验** | 相对现有 Canva 的设计工作区，拟检验图片生成/文字呈现这一不同输出；现在是填视觉生成缺口，不能借 Canva Task 强行建立 Fit。先消费 Tool Intelligence，后续同任务 Comparison。 |
| 14 [Scite](https://scite.ai/) | 研究缓冲；`HOLD_EVIDENCE` | `research-with-citations`；secondary：引文上下文核验（未注册）；Gap-filler | `citation-traceability`；Smart Citation 覆盖、语境解释、套餐与独立采用**待核验** | 相对 Consensus 与 Elicit 拟补引文语境，而不是重复学术搜索；先确认当前产品范围与可追溯的独立采用，再排完整深审。先消费 Tool Intelligence 证据范围。 |

`HOLD_DUPLICATE_INTENT` 的 4 项不是被拒产品：Grammarly、Jasper、Descript 已有公开实体，Canva 只增强既有 canonical。现阶段 `READY_FOR_DEEP_REVIEW=7`、`HOLD_EVIDENCE=3`、`HOLD_DUPLICATE_INTENT=4`、`REJECT=0`。研究候选仍为 14 项，但**可考虑新增实体的仅 10 项，其中 3 项先补证据**。上述角色是组合研究标签，不是对产品能力或生产关系的已核实断言。

## 七、按 Task Cluster 的组合检查与缺口

| Primary Cluster | 本池候选与现有对照 | Anchor / Alternative / Gap-filler 目标检查；缺口 |
| --- | --- | --- |
| `meeting-notes` | 既有 Fathom、Otter.ai、Fireflies.ai；新研究 Avoma / Read AI / Granola | 既有成熟锚点可供复核，三项新候选分别拟补 CRM、跨会议检索、个人笔记流程；真实 Alternative/Gap-filler 仍须深审证实。防止三项同质会议摘要重复。 |
| `research-with-citations` | 既有 Consensus；新研究 Elicit / Scite | Consensus 可作现有锚点；Elicit 拟作替代，Scite 拟补引文语境。Scite 证据 HOLD；三种路线不能互称同等引用能力。 |
| `brand-constrained-marketing-content` | 既有 Jasper、Grammarly；Copy.ai 仅 secondary 待资格审查 | Jasper/Grammarly 为既有锚点/替代研究对象，但 CL-06 关系均 HOLD；**缺已核实的新 Gap-filler 与可发布 Task Fit**，不能以 Copy.ai 强补。 |
| `ai-voiceover` | 既有 Descript、ElevenLabs | 生成与编辑交付可能互补；**缺第三项有证据的不同选择及已发布关系**。本池不增第 15 项。 |
| `build-app-with-ai` | 既有 Cursor；Tabnine 仍 HOLD | Cursor 可作既有锚点；**缺已证完整应用场景的 Alternative 与 Gap-filler**。Tabnine 不得因编码助手身份自动取得 Fit；CL-04 的 n8n/OpenRouter Fit 已撤回。 |
| `product-image-to-short-video` | 本池无 primary；既有 Luma/Runway 属另线 | **本池空位**；不能把 Descript、Canva 或 Ideogram 的不同输出硬归类。CL-03 关系继续 HOLD。 |
| 编辑 Cluster：业务 Agent 工作流（未注册 Task） | Zapier Agents / Microsoft Copilot Studio | 两项拟形成 Anchor + Alternative；**缺经证据确认的 Gap-filler 与第三项**。不借 `build-app-with-ai` 解锁 Task Page。 |
| 编辑 Cluster：AI 辅助视觉设计 / AI 图片与文字排版（均未注册 Task） | Canva 既有 canonical / Ideogram 新研究 | 可研究工作区与图片生成差异；两个 primary Cluster 不应为凑 3–5 项强行合并，**各自缺完整三角色组合与 Task 定义**。 |
| 编辑 Cluster：GTM 工作流（未注册 Task） | Copy.ai 单项 HOLD | **Anchor、Alternative 和已证 Gap-filler 均缺**；先做对象与独立证据审查。 |

本表不把 secondary 计作另一 Cluster 的有效 Fit；“已有工具”只作对照，不代表其当前 Decision Graph 关系已发布。组合目标是每组 3–5 项且覆盖三个角色，但证据不足时保留空位。后续若用户体验或 GSC 提出真实新任务，应另案治理 Task taxonomy；本次没有新增候选或 Task。

## 八、未来 7 个正常运营日：候选研究队列与条件发布顺序

以 N1–N7 表示**实际发生的下七个正常运营日**，跳过休息/停工日；每日最多 2 个候选研究工作项。这里是深审和补证据排程，不是公开或索引承诺。每项先复查生产实体/alias，再核对两条互补官方来源、产品级独立采用、套餐/限制和真实素材；`HOLD_EVIDENCE` 项先解决列明阻塞才进入完整深审。

| 运营日 | 候选深审或补证据（最多 2） | 当日退出条件 |
| --- | --- | --- |
| N1 | Elicit；Avoma | 分别验证研究语料/引用与会议席位/CRM 的独立差异；不足即 HOLD。 |
| N2 | Zapier Agents；Ideogram | 分别核清独立产品/计费与图片版权/额度；不沿用母产品采用信号。 |
| N3 | Microsoft Copilot Studio；Read AI | 核清企业授权/渠道与会议工作区/留存；查重和权限限制。 |
| N4 | Granola；Tabnine（先补证据） | 会议采集与同意边界；Tabnine 的身份/生命周期/应用构建适配不明则仍 HOLD。 |
| N5 | Scite（先补证据）；Copy.ai（先补证据） | 核引文覆盖与独立采用、当前 GTM 对象与旧评论区别；不得以弱来源转 READY。 |
| N6 | Canva 既有 canonical 身份/AI 模块复核；Grammarly 既有 CL-06 证据复核 | 只做现有工具事实与关系候选复核，不占新工具发布槽。 |
| N7 | Jasper 既有 CL-06 权益冲突复核；Descript 既有 CL-05 权利复核 | 消解官方冲突或保持 HOLD；不重复创建实体。 |

**允许发布顺序与研究顺序分开：**只有完成当次官方证据深审、八项准入、独立市场验证、身份/意图去重、编辑决策内容、素材和发布器门禁后，才按 `Elicit → Avoma → Zapier Agents → Ideogram → Microsoft Copilot Studio → Read AI → Granola` 逐项考虑**候选发布槽**；这是条件排序，不是日期或批准。Tabnine、Scite、Copy.ai 在证据 HOLD 解除前没有发布顺位；四项既有 canonical 没有新增实体顺位。任一前项失败可跳过并记录原因，后项仍需自己的门禁。最近 5 个拟发布项同主 Task 最多 2、同厂商最多 1，且不出现连续 3 项同 Task/厂商/能力方向；实际批次须每周重算。正常运营日仍仅可公开 1–2 个全部达标的新工具，质量 blocker 时记录为 0 并补池；新页默认 `monitor/noindex`，索引独立执行[索引政策](./TOOL_INDEX_RELEASE_POLICY_CN.md)的日 1、周目标 4 / 硬上限 5 与站点健康门禁。

## 九、去重、集中风险与下游门禁

- **实体/意图去重：**发布前重查生产 name、slug、域名、alias、canonical 与现有 Guide/Comparison 意图。Grammarly、Jasper、Descript 不再占新工具槽；Canva Magic Studio 只能作为 Canva 能力。Zapier Agents 与 Zapier 核心自动化、Microsoft Copilot Studio 与 Microsoft 365 Copilot、Copy.ai 旧文案产品与现 GTM 平台，必须按具体产品范围重新查重。2026-09-20 的 63 条生产只读查重是历史基线，不代替发布前再查。
- **同质化：**Avoma/Read AI/Granola 同属会议，但差异仅为待证假设；Elicit/Scite 不能重复解释为 Consensus 的换名搜索；Jasper/Grammarly/Copy.ai 不能以“营销 AI”泛词共享同一 Task Fit。缺少直接官方证据或独立采用就保持 HOLD。
- **同厂商与同 Task 集中：**本池官方域名各异；Canva 与 Magic Studio 是唯一明确同厂商重复身份，已收口。研究日最多 2 项，并交错会议、研究、Agent、视觉。发布时按[唯一组合规则](./BEST_DIRECTORY_POSITIONING_AND_INTAKE_CN.md#容量反同质化与每周验收)审最近 5 个新工具与最近 5 个索引批准：同主 Task 或同厂商不得超过 3 个，连续 3 个不能同 Task、厂商或能力方向。研究排序本身不消耗发布/索引额度。
- **消费边界：**Tool Intelligence 只能写已核实且有核查日期的事实；Task Page 需要真实 published Fit、required/preferred 能力及独立注册审批，目前不能由本表启动；Structured Comparison 只能比较同一任务中已证实的差异；Decision Assistant 仍受 [DIFF-08 启动门槛](./DECISION_GRAPH_DIFFERENTIATION_ONE_WEEK_PLAN_CN.md)阻断。`unknown/待核验` 不得在任一层自动补全或暗示产品具有能力。
