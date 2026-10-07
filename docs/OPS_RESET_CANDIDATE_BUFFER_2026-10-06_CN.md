# 运营重启：成熟候选缓冲与七个运营日排期

> 2026-10-08 状态更新：Elicit 已解除素材/内容门禁并按受控流程发布为 `published + monitor/noindex`；不进入 sitemap，关系仍未批准。其余候选状态沿用本文，下一候选转为 Murf Studio。

核查日：2026-10-06（Asia/Shanghai）。单元：`OPS-RESET-01-CANDIDATE-BUFFER-AND-TASK-AUDIT`。基
线：`main@e938d1c61d0ddb8d9ebfcbafdb5768781f300060`。

**结论：15 项研究缓冲、6 个 primary Task，15 项 `HOLD_EVIDENCE`、0 项可立即发布。Top 5 为 Elicit、Murf
Studio、Pika、Canva、Bolt。唯一下一发布候选为 Elicit，先解除素材与内容门禁，再独立预审。** “成熟候选”指优先研究已有持续
产品和采用线索，不表示这 15 项已全部通过市场验证。10-07 深审后市场门槛通过 4 项：Elicit、Murf、Pika、Scite；其余缺项照实
HOLD。没有为了达到每日数量制造合格状态。

本文件与[机器候选清单](../data/collection/mature-candidate-buffer-2026-10-06.json)共同构成当前运营实例台账；旧
[09-20 候选池](./MATURE_CANDIDATE_BUFFER_2026-09-20_CN.md)及专项包保持历史原文，不覆盖其当时结论。治理只引
用[收录宪法与唯一 Cluster 组合规则](./BEST_DIRECTORY_POSITIONING_AND_INTAKE_CN.md)、[索引政策](./TOOL_INDEX_RELEASE_POLICY_CN.md)及[主追踪](./MASTER_OPTIMIZATION_TRACKER_CN.md)，
不增加第二套准入规则。产品身份继续是 AI 工具目录，用户价值是可核验的任务差异、限制和变化，
见[产品路线图](./EVIDENCE_DECISION_PLATFORM_ROADMAP_CN.md)。

## 1. 生产基线与 CL-02 当前状态

Neon 于 `2026-10-06T06:06:06.408Z`（14:06）执行
`BEGIN READ ONLY → SELECT id,name,title,url,status,page_quality_status FROM tools → ROLLBACK`。全量 69 行身份/域名审阅，
不写数据；15 个候选均无本轮 Neon 实体匹配，仓库 `toolRouteAliases.ts` 无对应 alias。跨库 profile、tags/features、全部历
史别名及发布日 canonical 仍属后续完整 preflight，不能把本次初筛写成最终查重 PASS。

| 口径                       | 回读 |
| -------------------------- | ---: |
| 总记录                     |   69 |
| published                  |   54 |
| published / continue_index |   17 |
| published / monitor        |   35 |
| published / archive        |    2 |
| draft / monitor            |    9 |
| rejected / monitor         |    6 |
| sitemap URL                |  126 |
| sitemap Task URL           |    0 |

`35 monitor` 仅指 published 子集；全表 monitor 另含 9 draft 和 6 rejected，不能混用。`continue_index` 是已存状态，不自动
等于每个 URL 当下允许索引。

CL02-PUBLISH-GATE-REMEDIATION **已独立 QA_PASS、main 已集成并推送、Vercel 已部署成功、owner 已应用迁移；生产发布验证为预
期 HOLD**。以上 QA/部署/迁移执行记录来自总控已完成单元：开发 chat `01a10f6c-6fde-7283-a37f-b48850b69da9`、QA chat
`01a10f7c-f31b-72a2-868f-e130682d8671`、总控 chat `019eed3b-d824-7d93-b7b9-75b818052348`，集成提交 `e938d1c6`。这不是本
轮重新部署，也不把本地静态合约标记当作服务器函数安装证明。

本轮只读预检
`2026-10-06T06:24:31.396Z`（14:24）：`validationContract=20261006-bilingual-publication-gate`、`productionWrites=0`；Gemini
links **5/10/6**、Perplexity **6/10/7**；Task **404 + noindex**，两个工具 **indexing_paused**、`sitemapEligible=false`。
字段级阻塞仅三项：

- Gemini research-discovery：`c7890701-0000-4000-8000-000000000201:AVAILABILITY_UNKNOWN`。
- Perplexity research-discovery：`d0186230-0000-4000-8000-000000000201:AVAILABILITY_UNKNOWN`。
- Perplexity citation-traceability：`d0186230-0000-4000-8000-000000000202:AVAILABILITY_UNKNOWN`。

预检另输出两个组级 `TOOL_CAPABILITY_CONTENT` 摘要，均由上述三字段产生，不是额外 blocker。`readyForIndependentQa=false`
指关系内容仍不可交发布 QA，不否定门禁代码已 QA_PASS。Perplexity `3/day` 文字候选仍未应用；这项事实维护不解除
availability。历史[修复审计](./CL02_PUBLISH_GATE_REMEDIATION_2026-10-06_CN.md)中的“未部署”只描述开发交付时刻，当前状态以
本节为准。无需再执行迁移或继续为此建设基础设施。

## 2. 组合价值、首批顺序与唯一下一候选

| 顺位 | 候选 / primary Task                         | 角色                | 相对既有工具的价值                                                       | 发布前最短闭环                                                               |
| ---- | ------------------------------------------- | ------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| 1    | Elicit / research-with-citations            | Gap-filler          | 文献筛选、结构化提取，补 Consensus 的发现/问答与 Notebook 的选定资料综合 | 继承 09-30 未完成素材权利/展示形式；重审三语言稿与真实账号范围，完成最终查重 |
| 2    | Murf Studio / ai-voiceover                  | Alternative         | 课程旁白项目与视频同步，与 ElevenLabs/Descript 的工作方式不同            | 素材授权/独立 QA、历史 murf-ai 引用与 canonical 收口                         |
| 3    | Pika / product-image-to-short-video         | Alternative         | 参考图与编辑工作流；有真实失败记录，可形成条件式选择                     | 当前模型/套餐的图生视频范围、商品文字/包装保真、商用/水印、素材              |
| 4    | Canva / brand-constrained-marketing-content | Anchor + Gap-filler | 将品牌语气与视觉模板连接，区别 Jasper 起草、Grammarly 改写               | AI/Brand Kit 强采用、套餐/角色边界、素材；只建一个 Canva 身份                |
| 5    | Bolt / build-app-with-ai                    | Alternative         | 浏览器应用到代码/GitHub/部署路线，补已入库 Lovable/Replit                | 完整应用交付与成本边界、直接采用全文与第二信号、素材                         |

排序依据是五个任务的缺口、可说明的差异、证据接近程度及风险；无新 GSC 数据，不虚构搜索量或流量分。Top 5 的 primary Task/
厂商各不重复。Pika 因官方产品/定价可直接回读而排在仅有迁移应用壳的 Kling 前。

**唯一下一发布候选：Elicit，状态 HOLD_EVIDENCE。** 新证据沿
用[09-30 Elicit 门禁包](./ELICIT_RELEASE_GATE_RECHECK_2026-09-30_CN.md)的未解项，不覆盖历史。素材与本地化未通过前，不生
成可执行发布包、不创建实体、不占用索引额度。若该缺口持续，记录当日发布槽 0，并把 Murf/Pika 深审推进到可比较阶段；不能自
动把第二名宣布为另一“唯一下一候选”。变更顺位须按同一台账单次决策、重新核对全部门槛。

## 3. 六个 Task 的组合盘点

每行的 3–5 是未来 shortlist 建议，**不是本轮已发布 Fit 计数**。池内 research/video/brand/build 各 3 项、voice 2
项、meeting 1 项；已有工具不计新池数量。角色均是编辑研究假设。

| primary Task                        | 既有对照与角色研究                                                 | 本期新候选                                                               | 3–5 项 shortlist 的取舍 / 缺口                                                                                                                   |
| ----------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| research-with-citations             | Consensus（Anchor）、Gemini Notebook / Perplexity（不同研究范围）  | Elicit（Gap-filler）、Scite（Gap-filler）、SciSpace（Alternative）       | 先比较 Consensus/Notebook/Perplexity/Elicit；Scite 与 SciSpace 竞争第五位，避免把全部六项强行推荐。Gemini/Perplexity 三 availability 继续 HOLD。 |
| ai-voiceover                        | ElevenLabs（Anchor）、Descript（Alternative）                      | Murf（Alternative）、WellSaid（Gap-filler）                              | 研究四项即可覆盖生成、媒体编辑、课程项目和团队发音修订；每项套餐/商用和同意范围须独立证据。                                                      |
| product-image-to-short-video        | Runway（Anchor）、Luma（Alternative）                              | Pika（Alternative）、Kling（Anchor）、Hailuo（Gap-filler）               | 五项候选上限；商品参考保持与文字/标识失真是关键，不能以电影样片代替任务证据。Luma 原 availability HOLD 不变。                                    |
| brand-constrained-marketing-content | Jasper（Anchor）、Grammarly（Alternative）                         | Canva（Anchor/Gap-filler）、Anyword（Alternative）、WRITER（Gap-filler） | 五项研究覆盖起草、审阅、视觉模板、变体选择、企业规则；不可将普通写作能力直接当品牌治理。                                                         |
| build-app-with-ai                   | Lovable（Anchor）、Replit（Alternative），本轮 Neon 已存在         | Bolt（Alternative）、v0（Gap-filler）、Bubble（Alternative）             | 五项比较交付物、代码/可视化维护与托管约束；n8n/OpenRouter 保持 CL-04 不适合完整应用的既有结论，不为凑关系重新纳入。                              |
| meeting-notes                       | Fathom（Anchor）、Otter.ai（Alternative）、Fireflies（Gap-filler） | Avoma（销售/CRM 储备）                                                   | 既有三项图谱结构已完成；用户层仍有最小整改，见[页面审计](./MEETING_NOTES_USER_VALUE_AUDIT_2026-10-06_CN.md)。本期七天不排会议新发布。            |

排除新收录：Lovable/Replit、Grammarly/Jasper/Descript/ElevenLabs 已有实体；Copy.ai 当前 primary 是未注册 GTM 工作流，不
强塞品牌 Task；Resemble AI 本轮主页/定价侧重深伪检测，配音产品边界待消歧。旧 Granola/Read AI 等会议候选保留历史研究，不
靠堆会议类填满新池。

## 4. 候选卡与证据阅读口径

下面逐项内容由机器台账展开；所有来源都记录本轮读取状态。`direct_read` 为公开页面/PDF直接回读，仍不是账号内试
用；`search_snapshot_only`、`unconfirmed_lead`、失败/应用壳都不能当准入通过。第三方上手只说明其作者实际使用，本站没有做
准确性/商品保真测试。官方客户数、融资、母公司声誉、stars 与厂商自报 ROI 均不替代独立采用。

每项预期 index 轨道相同：**HOLD/draft → 全部准入与独立审批后 monitor/noindex → 按现行政策另行索引评审**。公开、索引、关
系发布批准均 false；Role 与 Capability 为编辑假设，不生成生产关系。价格/地区/套餐须在发布当天复核，素材和本地化须形成完
整记录。身份查重仅限第 1 节范围。

### 1. Elicit — `HOLD_EVIDENCE`

**身份与组合：**elicit.com 的研究应用；非模型、非通用聊天工具。唯一拟用 `/ai/elicit`；primary
`research-with-citations`；角色 Gap-filler。在 Consensus 发现论文、Gemini Notebook 选定资料综合、Perplexity 网页搜索之
外，补筛选与结构化提取流程。

**成熟度 / 市场门槛 PASS：**成熟研究应用；两项独立实际使用研究，本轮重新读取。Cambridge 论文发表于 2026-05-29；研究实施
或数据采集年份须另行核对，不能以发表年份代替；不外推当前付费规模。

**Capability / Constraint：**文献筛选、提取表、逐项引文回查；真实素材复用依据及 EN/CN/TW 完成稿仍未通过；继承 09-30
HOLD。

**官方证据：**

- [官方来源](https://elicit.com/pricing)（`direct_read`）：Basic/付费综述与提取边界；页面多组价格不固化。
- [官方来源](https://support.elicit.com/en/articles/14757928-elicit-s-limitations)（`direct_read`）：提取误差、语境与人
  工核验。

**独立采用：**

- [采用来源](https://www.cambridge.org/core/journals/research-synthesis-methods/article/using-elicit-ai-research-assistant-for-data-extraction-in-systematic-reviews-a-feasibility-study-across-environmental-and-life-sciences/C97DAEC70C3173A260F0B12E729E7250)（`direct_read`
  / `strong`）：研究团队实际使用 Elicit 提取并与人工结果比较；不是工具广告。
- [采用来源](https://shura.shu.ac.uk/34504/1/Wolstenholme_2024_Student_experiences_of_using_Elicit.pdf)（`direct_read` /
  `strong`）：独立学生研究记录 Elicit 文献综述使用经验；不作为引文准确性保证。

**关键缺口：**真实素材复用依据及 EN/CN/TW 完成稿仍未通过；继承 09-30 HOLD；精确金额和配额多组展示；必须按目标套餐/账期复
核，可省略未消歧数字；普通工作区训练/留存范围未知，不继承 Enterprise 或 API 保证。

**重复意图：**Neon 本轮无匹配；沿用 /ai/elicit；研究 Guide 比较意图与产品详情分离；不得新建同义 URL。

**素材：**官方帮助含真实界面；现有 elicit.svg/cover 是占位，不能当官方素材；授权/署名及最终稿 HOLD。

**消费 / 下一步：**Tool Intelligence；Task Page / Structured Comparison 仅在关系门禁另行通过后消费。完成逐项缺口、八项准
入、三语言内容与真实素材审核，发布日重查实体/alias/意图；独立 QA 后再审批。预期 index 轨道和禁止提前批准均按本节共用口
径，未建实体或关系。

### 2. Murf Studio — `HOLD_EVIDENCE`

**10-07 MURF-PRERELEASE-01 更新：5 PASS / 3 HOLD，待独立 QA，不进入发布 preflight。** 完整 EN/CN/TW 字段、Decision
Card、来源日期和研究假设见[候选包](../data/collection/murf-prerelease-2026-10-07.json)；
[专项审计](./MURF_PRERELEASE_2026-10-07_CN.md)记录套餐冲突、权益和查重结果。

**身份与组合：**仅 Studio 浏览器旁白工作区，排除 API/Agent/Dub；primary `ai-voiceover`、Alternative，未创建关系。

**市场门槛 PASS：**新增直接回读的
[IJDL 课程设计案例](https://scholarworks.iu.edu/journals/index.php/ijdl/article/view/42061) （2025-12-17 发表，具体制作
日未知）记录 Murf Gen 2 音频实际制作，为强采用；
[2024 匿名课程讨论](https://www.reddit.com/r/instructionaldesign/comments/1fonqvp/murf_is_not_being_truthful_about_their_pricing/)
为不同作者/项目的辅助使用和摩擦信号，不证明现价、质量或市场规模。NewTubers 旧链接仍 fetch_failed，不计数。

**QA 返工 / 官方证据 HOLD：**原提交 `afa68524` QA_FAIL。已分开取消订阅、终止账户、删除请求和备份删除：隐私政策称终止后
30 天及例外；安全页称无请求时 90 天自动删除，请求删除含备份、复杂情况最长 90 天。取消帮助的账期末下载截止与安全页协议结
束后最长 90 天取回既有音频，适用范围及取回方式冲突待核。三语不作无条件承诺，待独立复核。

**当前权益：**浏览器直接读取 Studio 月/年付卡片；免费一次性 10 分钟 VGT，无下载/商用；付费商用不等于广播许可，当前广播为
Enterprise 加购。普通套餐单编辑者；邀请协作与不训练声明属于 Enterprise。项目槽位不按月重送，改稿可能再耗 VGT。帮助中心与
卡片的项目数/用量、语言/声音总数存在冲突，三语稿不承诺金额、精确额度或自然度；普通 Studio 训练范围 unknown。

**重复意图 HOLD：**Neon 产品匹配 0、Supabase profile 0；扩展 features 查询发现 ElevenLabs alternatives 引用 `murf-ai`。
`/ai/murf` 与 `/ai/murf-ai` 均 200/self-canonical/noindex 壳页，不能再称只有一个意图入口。需另案统一历史引用与
alias/canonical，本轮不生产修复、不创建第二实体。sitemap 126 URL、Murf 0。

**素材/内容 HOLD：**官方 logo URL 与帮助页预览出处可追溯，但本站复用、处理、署名依据未取得；不下载。现有占位文件排除。三
语草稿齐全，但独立 QA、真实素材展示和纠错/owner 入口验收仍缺。下次复查 2026-10-14 或新依据到齐时；发布日重查。

**消费 / 下一步：**仅 Tool Intelligence 编辑研究；Task Page / Structured Comparison 各自另行门禁。唯一下一候选仍为
Elicit，公开/索引/关系批准均 false；无可执行发布包或 SQL。

### 3. Pika — `HOLD_EVIDENCE`

**10-07 PIKA-PRERELEASE-01 更新：6 PASS / 2 HOLD（official、content），待独立 QA，不进入发布 preflight。**
[候选包](../data/collection/pika-prerelease-2026-10-07.json)与[专项审计](./PIKA_PRERELEASE_2026-10-07_CN.md)已记录
EN/CN/TW Tool Intelligence / Decision Card。新 Create 与旧 FAQ/迁移公告的套餐、credits 到期、商用、水印路径冲突保
留；Pika 2.5 文档范围已核，商品文字保真、实际导出及失败成本仍未知。普通内容可能用于模型改进，不能套用 AI Self/企业例外；
当前视频隐私范围待核。本轮跨库实体/profile/上下文匹配 0；pika/pika-ai/pika-labs 三语均为无实体自 canonical/noindex 壳，
未批准别名；sitemap 126 / Pika 0。官方素材复用/处理/署名、当前真实预览、独立内容/视觉 QA 和纠错/owner 展示验收仍缺；下次
复核 2026-10-14，发布日重查。唯一下一候选仍 Elicit；Pika 未获公开、索引或关系批准，productionWrites=0。下列初筛保留原核
查范围，以专项包更新事实为准。

**身份与组合：**pika.art 应用及其 Video Studio；单个模型/第三方模型不是独立工具。唯一拟用 `/ai/pika`；primary
`product-image-to-short-video`；角色 Alternative。给 Runway/Luma 补参考图驱动短片与编辑选择；商品标识稳定性须验证。

**成熟度 / 市场门槛 PASS：**两家独立媒体实际输入/输出测试已直接回读，成熟应用采用门槛通过；不是本站实测，也不代表当前模
型权益或商品保真通过。

**Capability / Constraint：**参考图生成短片与受限编辑；目标套餐的输入图、长度、分辨率、credits、水印/商用完整链待核。

**官方证据：**

- [官方来源](https://pika.art/)（`direct_read`）：当前应用/Video Studio 与参考素材入口。
- [官方来源](https://pika.art/pricing)（`direct_read`）：套餐和 credits；具体商品流程需映射。

**独立采用：**

- [采用来源](https://www.tomsguide.com/ai/ai-image-video/i-just-pika-2-to-the-test-and-its-the-best-ai-video-generator-yet-and-better-than-sora)（`direct_read`
  / `strong`）：作者实际测试参考图/ingredients 并报告失败；2024 历史使用，不外推当前套餐或商品一致性。
- [采用来源](https://mspoweruser.com/pika-ai-review/)（`direct_read` / `strong`）：另一作者用图/文生成与修改短片并展示失
  败结果；独立上手来源，有媒体商业偏差，不采用评分/购买结论。

**关键缺口：**目标套餐的输入图、长度、分辨率、credits、水印/商用完整链待核；历史产品采用已确认；当前多模型平台完整商品工
作流仍需官方证据，不能以旧评测放行当前关系；logo/文字/包装一致性、生成失败成本与素材授权待核。

**重复意图：**Neon 无匹配；Pika 模型版本、Pikaffects 等能力不拆新实体；与视频 Guide 分开。

**素材：**官网有真实输出与界面线索；不把社区样片当本站可复用产品媒体；HOLD。

**消费 / 下一步：**Tool Intelligence；Task Page / Structured Comparison 仅在关系门禁另行通过后消费。完成逐项缺口、八项准
入、三语言内容与真实素材审核，发布日重查实体/alias/意图；独立 QA 后再审批。预期 index 轨道和禁止提前批准均按本节共用口
径，未建实体或关系。

### 4. Canva — `HOLD_EVIDENCE`

**身份与组合：**Canva 主产品含 AI 与 Brand Kit；Magic Studio/Magic Write/Canva AI 不拆实体。唯一拟用
`/ai/canva`；primary `brand-constrained-marketing-content`；角色 Anchor / Gap-filler。品牌文字与视觉模板约束，可与
Jasper 起草、Grammarly 审阅构成不同选择。

**成熟度 / 市场门槛 HOLD：**成熟主产品；AI 工作流有独立教育机构演示；当前品牌控制采用仍待第二信号及套餐验证。

**Capability / Constraint：**品牌语气、颜色/字体和模板约束；Brand Kit、Brand Controls、Brand Voice 的套餐/角色分界须逐项
确认。

**官方证据：**

- [官方来源](https://www.canva.com/help/brand-kit/)（`direct_read`）：Brand Kit、模板与 AI 品牌上下文。
- [官方来源](https://www.canva.com/help/brand-voice/)（`direct_read`）：品牌语气与角色/套餐边界。

**独立采用：**

- [采用来源](https://bccampus.ca/wp-content/uploads/2024/07/2024-11-06-EdTech-Sandbox-Canva-AI-Slides.pdf)（`direct_read`
  / `auxiliary`）：独立机构 AI 工作坊含实际工具教学；不是企业品牌治理成效证明。
- [采用来源](https://www.g2.com/products/canva/reviews)（`unconfirmed_lead` / `unconfirmed`）：需抽取 AI/Brand Kit 产品
  使用评价；不可沿用通用设计评分。

**关键缺口：**Brand Kit、Brand Controls、Brand Voice 的套餐/角色分界须逐项确认；独立 AI/品牌工作流强采用证据不足；新实体
流程与旧 N6 “既有页增强”冲突已由 Neon 无实体澄清，但全层发布查重仍必需。

**重复意图：**Neon 无 Canva 实体；只保留 /ai/canva，不建 canva-magic-studio；已有 Guide 内链须复核。

**素材：**帮助页含第一方界面；授权资产/本地化处理尚未登记；HOLD。

**消费 / 下一步：**Tool Intelligence；Task Page / Structured Comparison 仅在关系门禁另行通过后消费。完成逐项缺口、八项准
入、三语言内容与真实素材审核，发布日重查实体/alias/意图；独立 QA 后再审批。预期 index 轨道和禁止提前批准均按本节共用口
径，未建实体或关系。

### 5. Bolt — `HOLD_EVIDENCE`

**身份与组合：**bolt.new 应用；不把 StackBlitz 公司或 bolt.diy 社区分叉合并。唯一拟用 `/ai/bolt`；primary
`build-app-with-ai`；角色 Alternative。现有 Lovable/Replit 已入库，补浏览器应用构建、代码与 GitHub 交付路径；避开
n8n/OpenRouter 不满足完整应用的问题。

**成熟度 / 市场门槛 HOLD：**官方当前应用/托管文档可读；2026 独立上手报道已检索，直接文章回读失败，市场 HOLD。

**Capability / Constraint：**可运行应用、代码交付与部署；目标应用是否完整可运行，数据库/认证/集成/代码审查责任需逐项验
证。

**官方证据：**

- [官方来源](https://bolt.new/)（`direct_read`）：AI 应用生成、代码/云服务入口。
- [官方来源](https://support.bolt.new/)（`direct_read`）：应用、版本控制、发布、集成文档索引。

**独立采用：**

- [采用来源](https://www.techradar.com/pro/software-services/bolt-no-code-review)（`search_snapshot_only` /
  `strong_candidate`）：搜索快照记录作者实际生成 Web app；直接回读失败，不算完整通过。
- [采用来源](https://github.com/stackblitz/bolt.new)（`unconfirmed_lead` / `auxiliary_pending`）：官方仓库可查持续性，外
  部 issue/贡献尚未核；不能单靠 stars 过市场门槛。

**关键缺口：**目标应用是否完整可运行，数据库/认证/集成/代码审查责任需逐项验证；tokens 与 hosting/database 费用及导出可迁
移性需直接套餐文档；独立实用全文、第二信号和授权素材未闭环。

**重复意图：**Neon 无 Bolt；/ai/bolt 仅产品详情；不重复现有 Lovable/Replit，也不把 bolt.diy 作为同一 SaaS。

**素材：**官方帮助含产品流程线索；可复用截图/品牌文件未登记；HOLD。

**消费 / 下一步：**Tool Intelligence；Task Page / Structured Comparison 仅在关系门禁另行通过后消费。完成逐项缺口、八项准
入、三语言内容与真实素材审核，发布日重查实体/alias/意图；独立 QA 后再审批。预期 index 轨道和禁止提前批准均按本节共用口
径，未建实体或关系。

### 6. Scite — `HOLD_EVIDENCE`

**身份与组合：**scite.ai 研究应用；Assistant/Smart Citations 属同产品。唯一拟用 `/ai/scite`；primary
`research-with-citations`；角色 Gap-filler。用引文语境和支持/对照线索补引文回查，而非再加一个通用答案工具。

**成熟度 / 市场门槛 PASS：**成熟研究产品；本轮直接确认 PolyU 与 CUNI MFF 两个客户侧订阅，不以厂商声称人数代替采用。

**Capability / Constraint：**引文语境、支持/反驳线索与参考文献警示；引文分类误差、目标学科覆盖/全文权限及导出待核。

**官方证据：**

- [官方来源](https://scite.ai/)（`direct_read`）：Assistant/Smart Citations 与索引范围。
- [官方来源](https://scite.ai/pricing)（`direct_read`）：套餐选择；不把索引规模当质量。

**独立采用：**

- [采用来源](https://www.lib.polyu.edu.hk/databases/scite)（`direct_read` / `strong`）：PolyU 图书馆确认订阅 premium 并
  提供身份访问流程，是客户侧采用；不证明当前所有产品功能。
- [采用来源](https://www.mff.cuni.cz/en/library/news/permanent-access-to-scite)（`direct_read` / `strong`）：CUNI MFF
  2026-04-01 公告说明机构网络和邮箱访问，当前订阅至 2027-03-30；独立第二机构采用。

**2026-10-07 prerelease 更新：**完成 [SCITE-PRERELEASE-01](./SCITE_PRERELEASE_2026-10-07_CN.md)，八门禁 **6 PASS / 2
HOLD**。两项独立机构采用信号复读；新增 2023 同行评审分类评估，并限定为药学系统综述中的撤稿论文引用样本，不外推当前模型表
现。10-07 定价页改为 Basic/Pro/Team/Enterprise 页面观察；旧 09-28 促销价只保留历史范围。条款明确 Customer Data（含
query/usage）不用于 AI 训练，隐私政策又允许分析服务使用以改进服务；账户关闭后保留期限最多十年，备份删除未知。具体计划
/Checkout、目标学科当前覆盖/分类、API/导出及机构合同仍 HOLD。

**关键缺口：**独立内容/视觉 QA、媒体复用权利、本站公开纠错入口展示验收未完成；official 与 content 门禁 HOLD。生产只读回
读当前匹配为 0，九个三语 Scite/scite-ai/sciteai 壳页均 noindex/self-canonical，sitemap Scite 匹配 0；发布日仍需查重。

**重复意图：**Neon 无匹配；研究 Guide 提及不等于实体；保持 /ai/scite。

**素材：**官网可见示例，不代表复制许可；三语言与素材 HOLD。

**消费 / 下一步：**Tool Intelligence；Task Page / Structured Comparison 仅在关系门禁另行通过后消费。完成逐项缺口、八项准
入、三语言内容与真实素材审核，发布日重查实体/alias/意图；独立 QA 后再审批。预期 index 轨道和禁止提前批准均按本节共用口
径，未建实体或关系。

### 7. WellSaid Studio — `HOLD_EVIDENCE`

**身份与组合：**wellsaid.io Studio 应用；API 不独立计数，WellSaid Labs 是历史品牌线索。唯一拟用 `/ai/wellsaid`；primary
`ai-voiceover`；角色 Gap-filler。企业课程旁白、发音与团队协作补位，不重复追求泛音色数量。

**成熟度 / 市场门槛 HOLD：**有多年教学设计用户讨论和 G2 产品评论线索；独立全文与当前套餐需深审。

**Capability / Constraint：**课程旁白的发音和团队修订约束；发音库、下载/商用、席位协作与语言/套餐的完整范围待核。

**官方证据：**

- [官方来源](https://www.wellsaid.io/)（`direct_read`）：企业语音制作入口。
- [官方来源](https://www.wellsaid.io/ai-voice-pricing)（`direct_read`）：原 /pricing 重定向到当前 Studio 定价。

**独立采用：**

- [采用来源](https://www.g2.com/products/wellsaid-studio/reviews)（`search_snapshot_only` / `strong_candidate`）：产品评
  论页可检索，未核具体评论身份/独立性。
- [采用来源](https://www.reddit.com/r/instructionaldesign/comments/11m3w5z)（`search_snapshot_only` /
  `strong_candidate`）：用户描述历史工作中使用 WellSaid；需直接复核。

**关键缺口：**发音库、下载/商用、席位协作与语言/套餐的完整范围待核；补直接采用全文及第二信号判断；受控脚本复核与媒体权利
未完成。

**重复意图：**Neon 无匹配；wellsaid/wellsaid-labs 同产品待 alias 终查。

**素材：**第一方界面/音频有线索；不能下载示例音频冒充授权资产；HOLD。

**消费 / 下一步：**Tool Intelligence；Task Page / Structured Comparison 仅在关系门禁另行通过后消费。完成逐项缺口、八项准
入、三语言内容与真实素材审核，发布日重查实体/alias/意图；独立 QA 后再审批。预期 index 轨道和禁止提前批准均按本节共用口
径，未建实体或关系。

### 8. Kling AI — `HOLD_EVIDENCE`

**身份与组合：**Kling AI 应用；app.klingai.com/global 当前跳转 kling.ai/app；非单个 Kling 模型或第三方 API。唯一拟用
`/ai/kling-ai`；primary `product-image-to-short-video`；角色 Anchor。成熟视频选择线索，但官方可读性较差，排在 Pika 后补
研究。

**成熟度 / 市场门槛 HOLD：**2025 独立图生视频上手线索；当前应用迁移/套餐证据不足。

**Capability / Constraint：**产品参考图生成与元素保持（研究假设）；唯一 canonical 官网迁移与当前应用/地区/账号可用范围需
确认。

**官方证据：**

- [官方来源](https://app.klingai.com/global/)（`redirect_shell`）：跳转 https://kling.ai/app/，仅 9 行可读正文。
- [官方来源](https://klingai.com/)（`fetch_failed`）：旧域本轮无法直接确认。

**独立采用：**

- [采用来源](https://www.tomsguide.com/ai/how-to-use-kling-ai-2)（`search_snapshot_only` / `strong_candidate`）：2025 上
  手文记录输入图/编辑；不是当前版本权益证据。

**关键缺口：**唯一 canonical 官网迁移与当前应用/地区/账号可用范围需确认；缺第二互补可读官方来源及当前套餐/输出许可；独立
第二采用、商品保真与素材权利待核。

**重复意图：**Neon 无 Kling 匹配；kling/kling-ai 与模型页禁止重复；slug 仅提案。

**素材：**可读应用壳不足以取得真实产品媒体；HOLD。

**消费 / 下一步：**Tool Intelligence；Task Page / Structured Comparison 仅在关系门禁另行通过后消费。完成逐项缺口、八项准
入、三语言内容与真实素材审核，发布日重查实体/alias/意图；独立 QA 后再审批。预期 index 轨道和禁止提前批准均按本节共用口
径，未建实体或关系。

### 9. Anyword — `HOLD_EVIDENCE`

**身份与组合：**anyword.com 营销写作应用；不把营销效果预测写成已证转化。唯一拟用 `/ai/anyword`；primary
`brand-constrained-marketing-content`；角色 Alternative。补品牌文案变体与预测评分选择；与 Jasper/Grammarly 比较实际约
束。

**成熟度 / 市场门槛 HOLD：**有多年产品评论线索；聚合评分不当作品牌 AI 工作流成效。

**Capability / Constraint：**品牌文案约束与多版本选择；目标套餐品牌规则、预测分数适用条件与连接数据范围待核。

**官方证据：**

- [官方来源](https://www.anyword.com/)（`direct_read`）：品牌/营销内容产品范围。
- [官方来源](https://www.anyword.com/pricing)（`direct_read`）：当前规范域定价正文可读；旧域路径失败不推定整个产品不可
  用，目标套餐仍待核。

**独立采用：**

- [采用来源](https://www.g2.com/sellers/anyword)（`search_snapshot_only` / `strong_candidate`）：独立产品评论集合可检
  索；需具体使用评价与第二信号。
- [采用来源](https://www.trustpilot.com/review/anyword.com)（`search_snapshot_only` / `auxiliary_pending`）：用户写作经
  历线索，未完成去重和激励评价审查。

**关键缺口：**目标套餐品牌规则、预测分数适用条件与连接数据范围待核；厂商 76% 等成效宣传不采用；需目标营销工作流证据；市
场两信号/素材/本地化待审。

**重复意图：**Neon 无匹配；与写作 Guide 意图分离，仅 /ai/anyword。

**素材：**官网展示可作研究线索；资产与许可未登记；HOLD。

**消费 / 下一步：**Tool Intelligence；Task Page / Structured Comparison 仅在关系门禁另行通过后消费。完成逐项缺口、八项准
入、三语言内容与真实素材审核，发布日重查实体/alias/意图；独立 QA 后再审批。预期 index 轨道和禁止提前批准均按本节共用口
径，未建实体或关系。

### 10. v0 — `HOLD_EVIDENCE`

**身份与组合：**v0.app 应用；历史 v0.dev 域名不是第二工具，Vercel 托管非同一计费承诺。唯一拟用 `/ai/v0`；primary
`build-app-with-ai`；角色 Gap-filler。补设计到代码交接的开发者路线，与 Lovable/Replit/Bolt 的工作流约束比较。

**成熟度 / 市场门槛 HOLD：**现行官方 full-stack 文档和独立 2026 上手线索；不能借用 Vercel 母公司采用规模。

**Capability / Constraint：**应用代码交付、界面与后端集成；是否满足目标完整应用/持久化/认证与集成需按文档验证。

**官方证据：**

- [官方来源](https://v0.app/)（`direct_read`）：当前应用身份/入口。
- [官方来源](https://v0.app/docs)（`direct_read`）：应用构建、集成与交付文档。

**独立采用：**

- [采用来源](https://www.techradar.com/pro/software-services/vercel-v0-no-code-review)（`search_snapshot_only` /
  `strong_candidate`）：作者 Web app 测试线索；完整原文与第二独立信号未完成。

**关键缺口：**是否满足目标完整应用/持久化/认证与集成需按文档验证；模型 credits 与 Vercel 部署资源费用分离；导出、自托管
及访问治理范围/市场/素材待核。

**重复意图：**Neon 无匹配；/ai/v0 唯一身份，不建 v0-dev 或 vercel-ai 平行页。

**素材：**官方文档界面存在；可再分发素材与三语言稿待审核；HOLD。

**消费 / 下一步：**Tool Intelligence；Task Page / Structured Comparison 仅在关系门禁另行通过后消费。完成逐项缺口、八项准
入、三语言内容与真实素材审核，发布日重查实体/alias/意图；独立 QA 后再审批。预期 index 轨道和禁止提前批准均按本节共用口
径，未建实体或关系。

### 11. SciSpace — `HOLD_EVIDENCE`

**身份与组合：**scispace.com 研究应用；typeset.io 历史身份需核，不把所有论文托管页计为产品。唯一拟用
`/ai/scispace`；primary `research-with-citations`；角色 Alternative。补论文阅读/解释入口；只有能说明与 Gemini
Notebook/Consensus 差异才进入 shortlist。

**成熟度 / 市场门槛 HOLD：**有机构用户指南与持续产品/定价页；采用强度仍不足以过市场门槛。

**Capability / Constraint：**阅读论文、解释与来源回查；学科/语种与全文权限、引用定位和输出准确性待核。

**官方证据：**

- [官方来源](https://scispace.com/)（`direct_read`）：研究应用范围。
- [官方来源](https://scispace.com/pricing)（`direct_read`）：产品套餐，具体额度待核。

**独立采用：**

- [采用来源](https://iimidr.ac.in/wp-content/uploads/2025/10/User-Guide-SciSpace-1.pdf)（`search_snapshot_only` /
  `auxiliary_pending`）：机构托管指南；不能仅凭托管推断机构采购/实际采用。

**关键缺口：**学科/语种与全文权限、引用定位和输出准确性待核；独立实际采用强信号与第二信号缺失；typeset 历史身份、现行 AI
产品范围与素材需审。

**重复意图：**Neon 无 SciSpace/typeset 匹配；历史域名和论文内容 URL 不新建多个工具。

**素材：**官方产品入口可读；真实媒体/权利与本地化未完成；HOLD。

**消费 / 下一步：**Tool Intelligence；Task Page / Structured Comparison 仅在关系门禁另行通过后消费。完成逐项缺口、八项准
入、三语言内容与真实素材审核，发布日重查实体/alias/意图；独立 QA 后再审批。预期 index 轨道和禁止提前批准均按本节共用口
径，未建实体或关系。

### 12. Hailuo AI — `HOLD_EVIDENCE`

**身份与组合：**hailuoai.video 视频应用；不等同 MiniMax 公司或语音 API，H3 等模型不拆实体。唯一拟用
`/ai/hailuo-ai`；primary `product-image-to-short-video`；角色 Gap-filler。参考图与多素材约束研究备选；不把中国/全球站权
益合并。

**成熟度 / 市场门槛 HOLD：**持续产品入口与独立上手待核线索；当前 H3 套餐不能用旧模型评测推定。

**Capability / Constraint：**商品参考图、多素材约束（研究假设）；缺应用级互补套餐/条款来源与区域、credits/输出水印边界。

**官方证据：**

- [官方来源](https://hailuoai.video/)（`direct_read`）：当前 Hailuo 视频应用/参考素材入口。
- [官方来源](https://www.minimax.io/)（`direct_read`）：厂商与产品关联；非互补套餐证据。

**独立采用：**

- [采用来源](https://www.tomsguide.com/ai/this-ai-video-generator-is-going-viral-and-its-completely-free-to-use)（`direct_read`
  / `strong_candidate`）：作者实际上手 Hailuo/MiniMax 视频；历史免费叙事不可当当前价格，尚缺第二独立信号。

**关键缺口：**缺应用级互补套餐/条款来源与区域、credits/输出水印边界；商品图参考保持/文字失真未测试；两项独立采用与授权素
材未通过。

**重复意图：**Neon 无匹配；Hailuo/MiniMax 视频模型不重复计数，不收 MiniMax 品牌替代应用。

**素材：**应用入口与官方演示可见；真实截图/输出素材权利待核；HOLD。

**消费 / 下一步：**Tool Intelligence；Task Page / Structured Comparison 仅在关系门禁另行通过后消费。完成逐项缺口、八项准
入、三语言内容与真实素材审核，发布日重查实体/alias/意图；独立 QA 后再审批。预期 index 轨道和禁止提前批准均按本节共用口
径，未建实体或关系。

### 13. WRITER — `HOLD_EVIDENCE`

**身份与组合：**writer.com 企业平台，限定品牌内容工作流；Agent/Style Checker 不拆产品。唯一拟用 `/ai/writer`；primary
`brand-constrained-marketing-content`；角色 Gap-filler。补企业术语、风格与角色治理，不按公司名望推定适配。

**成熟度 / 市场门槛 HOLD：**多年品牌功能文档与现行企业产品；平台已扩到 Agent，旧写作评价不能整体复用。

**Capability / Constraint：**企业品牌风格/术语控制与人工审核；品牌工作流的购买/演示路径、套餐和角色约束需直接核对。

**官方证据：**

- [官方来源](https://writer.com/)（`direct_read`）：当前企业 Agent 平台范围。
- [官方来源](https://writer.com/brand/)（`direct_read`）：品牌语气、术语与规则；须直接复核套餐覆盖。
- [官方来源](https://support.writer.com/articles/5831006655-understanding-roles-and-permissions-in-writer)（`search_snapshot_only`）：
  角色/权限的文档线索。

**独立采用：**

- [采用来源](https://www.g2.com/products/writer/reviews)（`search_snapshot_only` / `strong_candidate`）：独立评论检索可
  见；需品牌场景和当前产品的实际使用。

**关键缺口：**品牌工作流的购买/演示路径、套餐和角色约束需直接核对；当前平台强采用与第二信号未完成；不借旧写作模块声誉；
生成规则一致性/留存/集成与素材未核。

**重复意图：**Neon 无 WRITER/writer.com 匹配；非泛称 AI writer，新详情不占写作 Guide 意图。

**素材：**官网有工作流图；产品截图与品牌媒体复用依据未登记；HOLD。

**消费 / 下一步：**Tool Intelligence；Task Page / Structured Comparison 仅在关系门禁另行通过后消费。完成逐项缺口、八项准
入、三语言内容与真实素材审核，发布日重查实体/alias/意图；独立 QA 后再审批。预期 index 轨道和禁止提前批准均按本节共用口
径，未建实体或关系。

### 14. Bubble — `HOLD_EVIDENCE`

**身份与组合：**bubble.io 主产品含 AI App Builder；不把接入 AI API 的 Bubble 应用当作 AI 构建能力证明。唯一拟用
`/ai/bubble`；primary `build-app-with-ai`；角色 Alternative。补可视化应用编辑路线；与代码导出型 builder 的维护/迁移约束
不同。

**成熟度 / 市场门槛 HOLD：**成熟可视化平台，但 AI 构建能力的年龄/实际完整交付仍需独立证明，不继承母产品全部成熟度。

**Capability / Constraint：**可运行可视化应用与工作流人工修订；AI 工作流能生成的数据库/逻辑范围与人工补全责任待核。

**官方证据：**

- [官方来源](https://bubble.io/ai-app-builder)（`direct_read`）：AI 应用构建入口，/ai 已重定向。
- [官方来源](https://bubble.io/pricing)（`direct_read`）：应用/工作负载套餐，未核具体目标配置。

**独立采用：**

- [采用来源](https://www.reddit.com/r/Bubbleio/comments/1r7tmog/bubble_ai_just_started_generating_workflows_heres/)（`search_snapshot_only`
  / `strong_candidate`）：用户自述修复 AI 生成应用的经历；需直接回读并核身份/利益关系。

**关键缺口：**AI 工作流能生成的数据库/逻辑范围与人工补全责任待核；迁移/导出、workload 计费、发布/隐私规则须核；AI 子能力
市场采用、第二信号、素材未通过。

**重复意图：**Neon 无匹配；Bubble AI 仅能力，不另建 bubble-ai 实体。

**素材：**官方应用介绍存在；授权截图和本地化未审；HOLD。

**消费 / 下一步：**Tool Intelligence；Task Page / Structured Comparison 仅在关系门禁另行通过后消费。完成逐项缺口、八项准
入、三语言内容与真实素材审核，发布日重查实体/alias/意图；独立 QA 后再审批。预期 index 轨道和禁止提前批准均按本节共用口
径，未建实体或关系。

### 15. Avoma — `HOLD_EVIDENCE`

**身份与组合：**avoma.com 应用；AI Meeting Assistant 与 CI/RI 附加模块不拆实体。唯一拟用 `/ai/avoma`；primary
`meeting-notes`；角色 Gap-filler。仅保留销售会议/CRM 差异储备；meeting-notes 现有三工具不缺数量，本周不抢发布槽。

**成熟度 / 市场门槛 HOLD：**09-30 独立用户评价和持续产品已有审计；本轮未重新完成所有市场/权益核验。

**Capability / Constraint：**CRM/销售会议复用，限定附加模块与治理条件；延续 09-30 Organization/Enterprise 报价与 CRM 权
益冲突。

**官方证据：**

- [官方来源](https://www.avoma.com/)（`direct_read`）：会议/CRM 与附加模块。
- [官方来源](https://www.avoma.com/pricing)（`direct_read`）：当前多组席位/附加模块价格，未据此解除旧冲突。

**独立采用：**

- [采用来源](https://www.g2.com/sellers/avoma)（`search_snapshot_only` / `strong_candidate`）：独立产品评论集合可检
  索，09-30 有已核实际用户；不刷新旧审核日期。
- [采用来源](https://www.infotech.com/software-reviews/products/avoma?c_id=254)（`search_snapshot_only` /
  `auxiliary_pending`）：第二评价平台线索，具体用户内容待审。

**关键缺口：**延续 09-30 Organization/Enterprise 报价与 CRM 权益冲突；同意、默认留存/删除与导出/角色边界待核；授权素材与
三语言稿未完成。

**重复意图：**Neon 无匹配；销售会议详情与 meeting-notes/Guide 不重复；不得借补位连续发布会议类。

**素材：**09-30 无可用本地素材，官网展示不等于复用许可；HOLD。

**消费 / 下一步：**Tool Intelligence；Task Page / Structured Comparison 仅在关系门禁另行通过后消费。完成逐项缺口、八项准
入、三语言内容与真实素材审核，发布日重查实体/alias/意图；独立 QA 后再审批。预期 index 轨道和禁止提前批准均按本节共用口
径，未建实体或关系。

## 5. 未来七个正常运营日

按下一正常运营日为 D1，连续七个实际运营日，**不预设中国法定节假日或团队休假日，不把 10 月 7 日机械当 D1**。本表是研究/门
禁容量与条件发布槽，不是七个发布承诺；没有创建提醒或定时任务。日常政策仍为合格时每天 1–2 个公开，事实维护 5–10 项另计；
本交付自身公开数/维护写入数/索引批准数均为 0。

| 运营日 | 研究与补证槽（主审 / 交错备选）                                                 | 条件发布槽（最多 1 主槽 + 1 已合格备槽）   | 退出条件与当前 blocker                                                                                |
| ------ | ------------------------------------------------------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| D1     | Elicit 素材/展示许可和三语言稿；Murf Studio 当前商用/导出权益                   | 仅 Elicit 可申请主槽；备槽空               | 八项逐一 PASS + 当日查重 + 独立 QA 才能发布；当前素材/内容 HOLD，因此现阶段可承诺发布数 0             |
| D2     | Murf 素材/历史别名收口、账户权益复核；Pika 商品参考流程                         | 主槽保留；Murf 只是研究优先对象            | Elicit 未完成不自动改唯一候选；任何补位必须先审核成品包。Murf 内容/别名意图 HOLD；市场已于 10-07 通过 |
| D3     | Pika 当前定价/输出权和商品失真边界；Canva AI 强采用                             | 主槽保留；Pika 需门禁通过后再提议          | 历史采用 PASS 不能替代当前 Task/套餐及素材；仍 HOLD                                                   |
| D4     | Canva Brand Kit/Controls/Voice 权限；Bolt 完整应用与 hosting 成本               | 主槽保留；Canva 需身份/市场/内容通过       | 无 Canva 生产实体不等于已具备发布稿；不拆 Magic Studio                                                |
| D5     | Bolt 独立上手全文、第二采用和代码交付；Scite 目标学科/套餐                      | 主槽保留；Bolt 需证据闭环后再提议          | 不把集成/原型截图当可运行应用；市场/内容 HOLD                                                         |
| D6     | Scite 套餐/媒体；WellSaid 发音/商用；复读旧素材缺口                             | 主槽保留；按已合格包与最近五次实际发布确定 | 任一不合格则空槽；不要为补前几日数量连发研究/同厂商                                                   |
| D7     | 复盘15项 verdict、freshness、独立证据；深审 Anyword/v0 的差异；Avoma 仅冲突复查 | 主槽保留；无合格包则 0 并登记原因          | 核对实际公开/更新/索引数量及最近五次集中度；未完成研究不写“发布完成”                                  |

每日开始检查合格成品池；目前成品池确为 0，是政策允许的 blocker，必须优先解除缺口而非常态化零发布。研究产物按具体事实/约
束/来源/日期/差异更新台账，不能靠给现有内容统一刷新日期充数。若 D1/D2 仍无任何合格成品，D3 先复盘素材取得方式与编辑瓶
颈，再使用其他候选的研究槽，不能继续把同一 HOLD 反复命名为发布任务。

实际发布前检查最近 5 个新工具和最近 5 个索引批准（不是此研究表）：同主 Task/厂商最多 3 个；连续 3 个不能同 Task、厂商或
能力方向。新工具日上限 2；索引日上限 1、周目标 4/硬上限 5，且须检查是否仍暂停扩张。本轮未取得新的 GSC/索引放行依据，**索
引槽不预分配**。每次产生真实发布才记数，空槽不累计。

## 6. 验收与交付边界

| 检查                                    | 本轮结果                                                                                                                                                                                                                                                                                                                                         |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 新池静态验证                            | PASS：15 个唯一身份/canonical，rank 连续，6 primary Cluster，Top 5 五 Task/厂商不同，meeting 仅 Avoma；必填证据/缺口/媒体/轨道完整；15 HOLD、0 公开/索引/关系批准；10-06 原验收市场 PASS 仅 3 项且各有两条直接读取强信号（10-07 Murf 深审后当前为 4 项，见专项测试）；D1–D7 齐全。临时只读断言 `/tmp/ops-reset-01/validate.py`，不进入产品代码。 |
| 文档链接/结构                           | PASS：4 份涉及文档共 108 个本地目标存在，代码围栏配对、无冲突标记；外部链接按逐项读取状态记账，未宣称失败/搜索线索全为有效证据。                                                                                                                                                                                                                 |
| 新增文档与 JSON Prettier                | PASS；仅格式化本期新增文件，未批量重排历史主追踪。仓库旧 `jsxBracketSameLine` / `eslintIntegration` 配置警告不影响结果。                                                                                                                                                                                                                         |
| `pnpm run test:mature-candidate-buffer` | PASS；这是 **09-20 历史池** 的既有回归，不能冒充新15项验证；新池另见首行。                                                                                                                                                                                                                                                                       |
| `pnpm run test:collection-admission`    | PASS                                                                                                                                                                                                                                                                                                                                             |
| `pnpm run test:collection-planning`     | PASS                                                                                                                                                                                                                                                                                                                                             |
| `pnpm run test:plan-consistency`        | PASS；已知 active-plan 合约，不替代本轮人工语义检查。                                                                                                                                                                                                                                                                                            |
| `pnpm run seo:production-smoke`         | PASS；126 sitemap URL，canonical、robots 与公开路径正常；HTTP GET 只读。                                                                                                                                                                                                                                                                         |
| meeting-notes 双语 HTML / 源码审计      | HTTP/SEO 边界 PASS；用户价值需五项整改；移动端视觉 **N/A**，不虚报截图验收。                                                                                                                                                                                                                                                                     |
| CL-02 只读 preflight                    | 首次 `fetch failed`，不计通过；随后重跑得到 **预期 exit 1 / HOLD**（14:24），仅三 availability unknown，productionWrites=0、5/10/6 与 6/10/7 保持。另行 Supabase GET 回读三字段均 unknown。                                                                                                                                                      |
| `git diff --check`                      | PASS                                                                                                                                                                                                                                                                                                                                             |

未运行 build/tsc：本次只有文档与 JSON，不改应用代码或构建输入；与代码修复单元已完成的 build/QA 结果分开记账。

仅新增/修改文档与候选 JSON，未改页面、组件、数据库、迁移、索引、sitemap 或 metadata。主工作区两份本地 SQL 未读取内容、未
修改、未暂存。当前 worktree 仅本地 commit，不 push；后续独立 QA 对本提交验收。该单元没有获得任何候选的生产发布授权。

## 2026-10-07 Elicit 独立候选包交接

`ELICIT-PRERELEASE-01` 已完成本轮官方重新读取、跨库只读查重、三语言完整草稿和候选测试。详见
[发布前深审](./ELICIT_PRERELEASE_2026-10-07_CN.md)及 [候选包](../data/collection/elicit-prerelease-2026-10-07.json)。七
项 PASS，内容素材门禁 HOLD；未取得官方 logo/预览素材复用依据，独立内容 QA 未完成。唯一下一候选及 15 项 HOLD/0 可发布统计
保持不变。新增事实：9 月 30 日独立检索/提取/论文聊天已并入 Research Agent；历史会话只读、导出或逐一迁移。Cambridge 2026
发表研究的高准确度复测在 2025，学生报告采集在 2024；均不推成当前规模/准确率。下次复查 2026-10-14 或素材到齐时（较早
者），实际发布日再查；未生成可执行发布包、生产关系或索引批准。

独立 QA 收口：`QA_PASS_HOLD_WITH_EXACT_GAPS` 允许合并 HOLD 研究包，不代表公开批准。英文不适用场景已明确为需要有清楚依
据、覆盖所有套餐的不训练保证的团队。`liveSignal` 明确列为发布阻塞项：公开前必须连接真实纠错／owner 更新入口，并通过展示
验收；本候选未证明入口已实现。八项门禁结论、证据日期、来源与候选顺位保持不变。
