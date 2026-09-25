# Decision Graph 剩余 Task cluster 编辑整改方案

状态：**CL-02 已于 2026-09-25 完成生产关系发布与独立生产 QA_PASS；CL-03 内容/身份/timeline 生产修复与回读已完成，Ray3.2 evidence 和关系整改仍待独立 QA、未发布**。这是编辑与开发执行计划，不授权后续 cluster 或 Task Page 发布；不设强制发布日期。`meeting-notes` 已在生产完成整改和只读验收，本计划不重复执行该组。

## 1. 目标、边界与现状缺口

目标是在真实官方证据和逐条编辑判断下，修复规划时剩余五个 Task cluster 的理由、适用边界、套餐及证据链；让日常编辑通过既有 Admin
完成，而非每组交给用户执行手工 SQL。每组独立验收，保留数据库 trigger 的最终约束。

本轮不建立第二套事实系统、不做通用爬虫或新增网络服务、不批量自动发布、不为数量制造工具关系、不改变 Task Page 审批注册
表、URL、sitemap、`continue_index` 或工具索引。Schema 变化才走迁移；一次性 SQL 仅用于历史修复或紧急恢复。

规划基线：`meeting-notes` 的 2 条 Task Capability、3 条 Tool Capability、3 条既有 fit 已 published/current 且通过
生产只读验收；页面仍为 404。当时其余五组沿用 DIFF-07 的 hold/候选结论。以下 P0 缺口描述保留为实施前基线：Capability Manager 当时只允许 Task/Tool Capability
保存为 `draft` 或 `reviewed`，能关联已有 claim UUID，但没有受控的 `published`/`stale` 操作；Fit 的
`reviewed → published → stale` 已有 review board。当前 Admin action 未见安全创建/刷新官方 source/claim 的入口，不能把手
工 SQL 当作常规录入流程。P0 已进入生产 schema cache，CL-02 的受控发布路径已实际使用；当前状态见第 6 节。

## 2. 严格顺序

| 顺位 | 单元                                  | 原因与退出条件                                                                                    |
| ---- | ------------------------------------- | ------------------------------------------------------------------------------------------------- |
| P0   | Admin editorial closure               | 先补安全录入、复核与原子发布；否则每组继续依赖手工 SQL。独立 QA 验收后才进入内容批次。            |
| P1   | `research-with-citations`             | 两条 Task Capability 理由相对具体，先用最小的 Consensus 整改验证流程；不因此假定 Task Page 达标。 |
| P2   | `product-image-to-short-video`        | Luma 旧 Dream Machine/Ray2 身份会污染判断；先换成当前 Ray3.2 的直接证据，再审定适配。             |
| P3   | `build-app-with-ai`                   | 先判定 n8n/OpenRouter 是否只是工作流或模型路由基础设施，资格不成立就停止关系发布。                |
| P4   | `ai-voiceover`                        | 两条 Task 理由须重写，当前没有 Tool Capability/Fit；候选先验证再建关系。                          |
| P5   | `brand-constrained-marketing-content` | 两条 Task 理由须重写，当前没有 Tool Capability/Fit；品牌控制必须有产品级、套餐级证据。            |

不得跨越顺序并行发布。任何组可因证据不足留在 hold，不以日历或覆盖率推动下一状态。

## 3. P0：最小 Admin 编辑闭环

1. **编辑与复核。** 在现有 Capability Manager 增加 Task/Tool Capability 的
   `reviewed → published`、`published → stale`、`stale → reviewed` 受控入口；保留编辑身份、真实
   `reviewed_at/review_due_at` 和理由变化记录。禁止直接把未审核的 `draft` 发布。Task Capability 发布前核对 active
   Task/Capability、具体 rationale 和 current reviewer；Tool Capability 还须有明确的 `support_level`、`availability`、非
   空且可读的 `plan_requirement/limitations`，以及同工具 owner、verified/current、无冲突的 claim。`unknown` 或空限制不得
   以默认值悄悄发布。前端提示不是门禁，服务端预检和现有 DB trigger 均必须执行。
2. **官方证据录入。** 若复核后仍无安全入口，增加一个仅管理员可用的最小 server-side evidence intake/action：针对已确认的
   工具 profile，人工填报官方 URL、来源标签、直接事实/适用范围、核验人和复查窗口，写入现有
   `product_intelligence_sources/claims`；校验 URL/官方域、profile owner、重复 claim key、来源/claim 一致性及过期状态，
   并留审计记录。可刷新具体 claim，但不得无证据延长有效期。然后沿用现有 claim-link action 关联
   `support/availability/plan/limitation`；不抓取网页、不建新事实库。若既有后台已有同等安全能力，只复用并补缺口。
3. **Fit 与原子发布。** Fit 的内容复核、条件/排除条件及 claim links 仍用既有 review board。每个 cluster 在 Admin 中形成
   一张明确清单（Task Capability、Tool Capability、Fit 的精确 ID/预期版本、来源与证据目的）；独立 QA 通过后，由管理员触
   发仅该 Task 的一次数据库事务/RPC，锁定并复核清单，再把获批关系一起置为 published，执行 postcondition。任何一行失败整
   组回滚；不提供跨 cluster 批量按钮。保留并依赖现有数据库发布 trigger 终审。对已发布组的撤回同样按 Task 范围立即置
   stale，并让公开读模型按现有规则停止展示。

每组固定流程为 **开发准备 → 独立内容/技术 QA → 管理员原子发布 → 生产只读回读**。QA 报告应记录官方 URL、核验时间、字段差
异、精确 ID、通过/hold/撤回理由；开发预检不得代替管理员批准。发布后只读核对目标行、review window、source/claim/link
owner 与目的、非目标行不变，以及页面/索引门禁。

## 4. 各 cluster 字段级整改

**共同字段标准。** Task `rationale` 说明此能力为何是用户任务的 required/preferred/contextual，不能复述名称或内部审核过
程；Tool `support_level` 依据真实功能强度定级，`availability` 与 `plan_requirement` 指明可用套餐、配额或附加条
件，`limitations` 写清不适用环境和无法保证的输出。Fit `rationale` 写任务适配而非营销词，`required_conditions` 写成立前
提，`disqualifiers` 写明确排除场景。Tool Capability 的 claim links 分别覆盖
`support`、`availability`、`plan`、`limitation`，Fit links 至少覆盖 `fit` 与 `limitation`；每条 claim 要有直接官方页、正
确 owner、当前 verified 状态。Task Capability 按现有 schema 不强制 claim link，但理由须独立 QA。以下均为待核对项，不能直
接当作已批准事实录入。

### P1 · `research-with-citations`

**执行结果：** 2026-09-25，两条 Task Capability、Consensus 的一条 Tool Capability 和一条 Fit 已发布，独立生产 QA_PASS；六条 verified claim 与 13 条 evidence links 通过门禁，Task Page 仍关闭。以下条目保留为当时编辑核验标准。

- **原候选/现状：** 两条 Task Capability `research-discovery`、`citation-traceability` 的理由可进入编辑复核；Consensus 既
  有 Tool Capability 与 Fit 当时仍 hold。优先核对
  [官方搜索说明](https://help.consensus.app/en/articles/10073509-faqs)、[全文功能](https://consensus.app/home/features/full-text/)、[引用定位更新](https://consensus.app/home/blog/what-has-changed-in-consensus-summer-26/)及[套餐说明](https://help.consensus.app/en/articles/10087865-subscription-plans)：
  搜索覆盖与索引边界、全文或仅摘要的可用条件、引用与原文的对应方式、免费/付费额度。各页面可能更新，录入前按当时官方资料
  重新核对。
- **字段：** Task rationale 保留“发现来源”和“可追溯引用”两种不同用户价值；Consensus Tool Capability 按已核实的搜索/全文/
  引用能力定 `support_level`，按套餐填 `availability/plan_requirement`，在 `limitations` 写覆盖、全文访问、引用复核边
  界。Fit rationale 仅描述学术资料检索与可核查引用；required conditions 包括可访问原文/摘要并人工核引，disqualifiers 包
  括要求无来源的确定性结论或超出收录范围；链接四类 Capability 证据和 Fit 的 fit/limitation。
- **判定：** 官方直接证据、套餐与引用链一致且 QA 通过才发布；全文或引用条件不明则 hold；若任务承诺超出产品可证能力，撤回
  对应 Tool Capability/Fit。只有一个真实 fit 时 Task Page 仍关闭。

### P2 · `product-image-to-short-video`

- **候选/现状：** `image-to-video-generation` 的 Task rationale hold，`video-editing-and-export` 可考虑；Luma Tool
  Capability/Fit hold。旧 Dream Machine/Ray2 文案不得沿
  用。[Luma 官方身份说明](https://lumalabs.ai/llm-info)、[当前产品资料](https://lumalabs.ai/ray)与[Ray3.2 发布说明](https://lumalabs.ai/news/introducing-ray-3-2)指
  向 Ray3.2；需再核对[定价/额度](https://lumalabs.ai/pricing)、图片输入方式、输出时长/分辨率、编辑与导出、商用权及
  App/API 差异。不能用泛化首页替代功能页。旧 claim 应明确失效或不再作为当前证据。
- **字段：** 把 required rationale 改为“以用户提供的产品图保持主体并生成可交付短片”的可判断需要；preferred rationale 指
  向真实编辑/导出需求。Luma `support_level` 按当前图片转视频与后期功能分别判
  断；`availability/plan_requirement/limitations` 写明模型、套餐、额度、输出和编辑边界。Fit rationale、required
  conditions、disqualifiers 分别陈述适用的图像输入/输出流程、人工审核和不支持的交付要求；四类 Tool 证据及 Fit
  fit/limitation 均指向 Ray3.2 具体资料。
- **判定：** 产品/模型身份与所述功能一致且每个字段有来源才通过；编辑或导出无法证实则相应 Capability hold，不把生成能力推
  断为完整剪辑；身份或来源仍冲突时撤回旧关系。

### P3 · `build-app-with-ai`（先资格审查）

- **候选/现状：** `ai-assisted-app-development`、`developer-workflow-integration` 两条 Task rationale 太
  泛；n8n/OpenRouter 的 Capability/Fit 均 hold。[n8n 官方文档](https://docs.n8n.io/)定位工作流自动
  化，[OpenRouter 官方文档](https://openrouter.ai/docs/quickstart)定位模型 API/路由；这些是审查线索，不等于完整 app
  builder 资格。先界定 Task 是否要求生成可运行应用，以及两工具能否独立满足该输出。
- **字段：** Task rationale 具体区分“构建应用”与“接入工作流/模型”。若官方证据仅支持集成能力，相关 Task Capability 可改
  contextual，Tool `support_level`/Fit 降为 conditional，或改 Task 归属、保持 reviewed/撤回；不得给
  `ai-assisted-app-development` 编造强支持。核对官方集成能力、部署/运行责任、价格和 API 限额，写入
  availability、plan、limitations；Fit required conditions 指向已有开发环境与集成责任，disqualifiers 包括需要开箱即用的
  完整应用交付，证据目的按共同标准覆盖。
- **判定：** 只有产品确实满足 Task 定义且限制明确才发布；资格未定 hold；确认只是基础设施而 Task 仍是完整 app builder
  时，撤回该 Task 下不适配的 Fit/Capability。不得为 3-fit 门槛硬塞工具。

### P4 · `ai-voiceover`

- **候选/现状：** `text-to-speech-voice-generation`、`voice-consent-and-export` 两条 Task rationale 需重写；当前没有
  Tool Capability/Fit。ElevenLabs、Descript 仅为待验证候选，不自动建关系。
- **字段：** Task rationale 分开描述可听的配音生成和声音使用权/交付约束。逐个查官方 TTS/克隆或配音功能、授权与同意、语言
  /音色、导出格式、商用范围、配额和套餐；再决定 support、availability、plan、limitations。Fit rationale 写具体旁白场
  景，required conditions 包括有权使用声音和人工试听，disqualifiers 包括无法取得同意或所需导出不支持；新关系须按四类
  Capability 与 fit/limitation 证据目的建链。
- **判定：** 候选身份、权利与输出均证实且 QA 通过才新增关系；任何关键授权或套餐事实缺失就 hold；官方功能不满足任务则不建
  或撤回候选。不得把文字转语音自动等同于可商用声音克隆。

### P5 · `brand-constrained-marketing-content`

- **候选/现状：** `brand-guided-content-generation`、`brand-controls-and-style-guidance` 两条 Task rationale 需重写；当
  前没有 Tool Capability/Fit。Jasper、Grammarly、Claude 仅为待验证候选，不自动建关系。
- **字段：** Task rationale 分开“用品牌资料起草内容”和“使风格/政策约束可检查”，避免把人工审核写成产品能力。对每个候选核
  对官方品牌知识/风格指南/权限或审核功能、支持的内容类型、套餐和配额、数据保留与限制；分别填写
  support、availability、plan、limitations。Fit rationale 指定品牌素材输入与编辑流程；required conditions 包括有权使用品
  牌资料、人工品牌审稿，disqualifiers 包括必须由工具强制执行但实际仅能提示的政策；证据目的按共同标准建链。
- **判定：** 有直接官方功能与套餐证据、边界可复核才发布；“可提示模仿语气”不足以证明强制品牌控制，缺证据 hold；不适配的
  Tool Capability/Fit 不建或撤回。

## 5. 页面门禁、测试与回滚

**Task Page 单独评审。** 所有 Task Page 继续关闭。只有单独审批注册表变更时，才检查至少 3 个不同、真实且 current 的
published fits，required 与 preferred Task Capability 完整且 current，来源/claim 同 owner、verified/current，unknown 比
例可控且限制对读者清楚。满足数据门槛也仅先以 `noindex, follow` 评审，不自动加入 sitemap；任何缺口保持
404。`meeting-notes` 的关系验收不等于 Task Page 获批。

| 变更类型                          | 最小验证矩阵                                                                                                                                                                      |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 本计划或编辑文案草稿（docs-only） | Markdown 链接/标题人工检查、`git diff --check`；不重复 build。                                                                                                                    |
| P0 Admin action/UI/RPC 代码       | 针对状态转换、权限、owner/current 证据、事务回滚与重复点击的专项测试；`tsc --noEmit`；一次完整 build 与 Admin 生产模式 smoke。Schema migration 另做本地迁移验证和只读生产回读。   |
| 单 cluster 内容/数据录入          | 字段及官方来源专项审计、独立内容 QA、该 Task 的只读 verifier；管理员发布后做目标/非目标行回读与页面 404、sitemap Task URL 0 的轻量 production smoke。不改代码就不重复 tsc/build。 |
| Task Page 注册表单独变更（另案）  | 专项页面门禁/SEO 测试、`tsc`、build 与 production smoke；不得并入本计划的关系批次。                                                                                               |

风险包括来源或套餐变化、跨库工具身份错误、过期 claim、错误 owner、把基础设施包装成完整工具，以及多次独立写入造成部分发
布。发布事务必须校验精确清单与版本，任何失败回滚本组；已发布后发现错误，立即把该组受影响关系置 `stale`/撤下证据可见性，
保留审计记录，修复后重新 QA 与管理员批准。不能用改旧复核时间或手工补第三个 Fit 解锁页面。若源过期，公开读模型/DB trigger
的现有约束仍为安全底线，但管理员应主动撤回。

DIFF-08 Decision Assistant 继续 **blocked**。首批 20 工具核心 Capability 与 6 Task published fit 覆
盖、required/preferred 完整性和低 unknown 比例必须靠真实关系满足，不以计数目标伪造支持、不因某一组验收自动启动。

## 6. 可追踪任务与工作量（估算，不是发布日期）

| ID                          | 依赖                          | 交付                                                                   | 验收                                                           | 状态          | 估算            |
| --------------------------- | ----------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------- | ------------- | --------------- |
| CL-00 独立 review           | 无                            | 评审本计划、优先级、原子发布边界                                       | 范围/门禁/负责人确认，无默认发布授权                           | 已完成        | 0.5–1 人日      |
| CL-01 Admin closure         | CL-00                         | Capability transition、最小 evidence intake、单 Task 原子发布/撤回入口 | 权限/证据/DB trigger/回滚专项通过，管理员可无手工 SQL 完成一组 | 生产 schema cache 已生效；CL-02 路径已使用 | 3–5 人日        |
| CL-02 Research              | CL-01                         | [Consensus 与两条 Task Capability 编辑证据包](./DECISION_GRAPH_CL02_RESEARCH_EDITORIAL_PACKET_2026-09-25_CN.md) | 直接官方证据、字段与 QA 通过；单组发布和只读回读，或明确 hold | 已完成：生产关系发布，独立生产 QA_PASS（2026-09-25） | 1–2 人日 |
| CL-03 Image-video           | CL-02                         | [Ray3.2/Luma 编辑证据包](./DECISION_GRAPH_CL03_LUMA_EDITORIAL_PACKET_2026-09-25_CN.md)；身份/来源纠正和关系整改 | 旧事实撤回，输入/输出/套餐边界核实，单组验收或 hold | 内容/身份/timeline 已修复并回读；新 evidence、旧 claim/link 处置及 Tool Capability/Fit 仍待独立 QA；未发布 | 1–2 人日        |
| CL-04 App-build eligibility | CL-03                         | n8n/OpenRouter 资格结论与 Task 定义修订                                | 先给可发布/conditional/contextual/撤回结论，再决定是否发布     | 未开始        | 1–2 人日        |
| CL-05 Voice                 | CL-04                         | 两条 Task rationale 与经验证的候选工具提案                             | 权利/导出/套餐证据充分才新建关系并单组验收                     | 未开始        | 1.5–3 人日      |
| CL-06 Brand                 | CL-05                         | 两条 Task rationale 与经验证的候选工具提案                             | 品牌控制非营销推断，直接证据和单组验收                         | 未开始        | 1.5–3 人日      |
| CL-07 Production closeout   | 每组发布后；最终依赖 CL-02–06 | 每组独立只读回执与汇总审计                                             | 目标/非目标、页面/SEO 门禁、DIFF-08 状态完整记录               | 未开始        | 每组 0.5–1 人日 |

按五组均走完 closeout 粗估约 12–23 人日，取决于官方证据与候选资格；独立 QA 和管理员审批需另排人员时段。hold/撤回也是合格
结论，不以估算强制发布。

CL-01 编辑闭环与事务门禁已用于 CL-02 单 Task 生产发布并完成独立只读回读。此项验收不授权 CL-03 或后续 cluster 发布；它们仍须各自完成独立内容 QA、管理员批准和单 Task 生产回读。
