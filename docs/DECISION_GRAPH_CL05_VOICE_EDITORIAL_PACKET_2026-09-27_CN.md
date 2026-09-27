# CL-05 · `ai-voiceover` 字段级编辑候选与 HOLD

状态：**两条 Task rationale 可供独立编辑 QA；ElevenLabs 与 Descript 均为 `conditional` 候选；生产关系 HOLD，未创建或发布**（2026-09-27）。本文不是生产 manifest、evidence intake、管理员批准或 Task Page 审批。`publishable` / `conditional` / `contextual` / `withdraw` 是编辑判断，不是数据库状态枚举。

## 1. 任务定义与生产只读基线

`ai-voiceover` 的输出是 `voiceover`，`constraint_schema` 同时要求 consent 与 export review。`text-to-speech-voice-generation` 为 `required`；`voice-consent-and-export` 为 `preferred`。后者的 `preferred` 只表示现有能力权重，**不免除**实际使用第三方声音、克隆声音和分发成品所需的权利/同意审查；不能把平台的自我声明或验证机制当成用户已获许可。

2026-09-27T09:26:35Z 运行 `scripts/verify-decision-cl05-voice-readonly.ts`。Neon 查询位于 `BEGIN READ ONLY` 事务，Supabase 仅 select，生产写入为 0：

| 实体 | 精确 ID / 状态 | 基线 |
| --- | --- | --- |
| Task | `bb49bd6b-a968-4231-a505-5a79b5ffe8ad` / active | `output=voiceover`，需要 consent/export review；description 仍泛化。 |
| required Task Capability | `9c70a590-5848-443b-88cc-203a8f446e18` / reviewed | 原理由仅“输出是生成的配音”。 |
| preferred Task Capability | `87457bc5-6c9e-4aee-b051-0d85fcb8baf9` / reviewed | 原理由仅“同意和交付限制需要审核”。 |
| ElevenLabs | Neon `d7b63bf2-63c8-4015-b59d-2f627450813f` / published | URL `elevenlabs.io`；本工具无 intelligence profile。 |
| Descript | Neon `a8c41d20-6b48-4f75-9f17-7e34c84619d2` / published | URL `descript.com`；本工具无 intelligence profile。 |

此 Task 的 Fit 数为 0；两工具对上述两条 Capability 的 Tool Capability 数为 0；两者的 intelligence profile/source/claim 数均为 0，所以也不存在同 owner、verified/current 的 `support/availability/plan/limitation` 或 `fit/limitation` link。不能凭成熟工具页的文案代替 Decision Graph 证据对象。线上 `/cn/tasks/ai-voiceover` 为 404，sitemap 中该 Task URL 匹配为 0。

## 2. 当前官方证据与逐工具判断

| 维度 | ElevenLabs | Descript |
| --- | --- | --- |
| 生成与语言 | [TTS 功能文档](https://elevenlabs.io/docs/overview/capabilities/text-to-speech)列具体模型、语言和格式；v3、Multilingual v2、Flash v2.5 的语言/单请求字符限制不同，长文应分段且人工试听。 | [TTS 操作页](https://help.descript.com/ai-speech/tts)明确脚本、stock/custom voice、多说话人分段和所选模型；[stock voice 页](https://help.descript.com/ai-speech/stock-voices)要求声音语言与脚本匹配，且社区声音可能撤下。不要把某个模型或配音/翻译的语言数推广到所有 AI Speakers。 |
| 克隆、同意与商用 | [声音管理](https://elevenlabs.io/docs/help-center/product/voices/my-voices/what-is-my-voices)明确 IVC 从 Starter 起、PVC 从 Creator 起，IVC 须有克隆许可；[克隆说明](https://elevenlabs.io/docs/eleven-api/concepts/voice-cloning)说明验证不能保证录音属于申请者。合格付费输出有商业使用权，Free 仅非商用并需署名；底层脚本、声音等权利仍由用户负责（[Billing](https://elevenlabs.io/docs/overview/administration/billing)、[Terms](https://elevenlabs.io/terms-of-use)）。旧营销文章中“Free 可 IVC”的说法与当前定价/文档冲突，不沿用。 | [自定义声音操作页](https://help.descript.com/ai-speech/custom-speaker)要求本人或第三方录制授权声明，明确排除未同意者、已故者、无法录制声明者与合成音源；授权声明须用英语录制。[Terms](https://www.descript.com/terms)要求取得说话人许可、审查生成结果，并只在可受法律保护的范围内确认用户对输入/输出的权利。旧 AI Speakers 帮助页搜索摘要声称可商用，但该 URL 现重定向至不含此声明的通用 Speakers 页；**当前缺直接、可复核的 stock/custom voice 商用许可矩阵**，不得把旧摘要做 current claim。 |
| 成品导出与 API | [TTS 产品操作页](https://elevenlabs.io/docs/eleven-creative/playground/text-to-speech)说明 UI 历史记录可下载 MP3/WAV/M4A/FLAC；[API 格式说明](https://elevenlabs.io/docs/api-reference/text-to-speech/convert)给 MP3 默认格式，192 kbps MP3 需 Creator+，44.1 kHz PCM/WAV 需 Pro+；[PVC 指南](https://elevenlabs.io/docs/eleven-creative/voices/voice-cloning/professional-voice-cloning)明确**克隆声音模型本身不能导出为独立文件**。音频文件下载与声音模型可移植性不能混为一谈。 | [音频导出页](https://help.descript.com/export-and-share/audio)明确本地 MP3/WAV/M4A、选择片段/scene/整稿、采样率和码率；[当前 API 帮助](https://help.descript.com/api-and-mcp/api)说明 API 可先发布 Descript web link 再取得音频签名 URL，但**不发布就直接下载渲染音频文件**尚不支持；UI 本地导出与 API 发布后下载是不同工作流。 |
| 套餐与额度 | [当前 Pricing](https://elevenlabs.io/pricing)显示 Free 10k、Starter 30k、Creator 121k credits/月；Starter 包含商业许可及 IVC，Creator 包含 PVC，Pro 包含较高 API 音质。credits 为产品共享池，TTS 消耗随模型/UI/API 变化；不能把额度换算成保证通过验收的成品分钟。 | [当前 Pricing](https://www.descript.com/pricing)显示 Free 的 TTS/clone 是 limited，Hobbyist 400、Creator 800、Business 1500 AI credits/月；另有 media minutes。[用量帮助](https://help.descript.com/hc/en-us/articles/27841674958221-Track-and-understand-your-Media-minutes-and-AI-Credits)说明两池分开、Drive 共享、未用额度不结转，TTS 约 5 credits/分钟只是默认模型的估算，实际消耗随模型/任务而变。 |

**结论：** ElevenLabs `conditional`：适合需要独立音频交付、可选 API、明确模型/格式选择的旁白；商业与克隆路径必须选对套餐、记录授权并试听。Descript `conditional`：适合在音视频编辑项目中生成、校正、导出旁白；stock voice、custom clone、导出与 API 是不同路径，商用声音许可需取得当前直接来源后才可写 claim。两工具的上述适配判断是从官方产品资料和 Task 定义作出的编辑推断，官方并未保证具体用户的声音权利或成品质量。没有证据表明应 `withdraw` 任一候选；也不把两者判断为无条件 `publishable`。

## 3. 字段级候选（仅供 QA，未写生产）

| 字段 | 候选值 / 编辑判断 | 发布边界 |
| --- | --- | --- |
| Task `description.en` / `.cn` | `Create a voiceover from supplied text, then review voice permissions, audio quality, and the required delivery format before use.` / `根据提供的文本生成配音，并在使用前审核声音许可、音频质量和所需交付格式。` | 保持 `constraint_schema` 原值。 |
| required Task Capability `rationale.en` / `.cn` | `The deliverable must contain intelligible spoken narration generated from the supplied script; the team should listen for pronunciation, pacing, and missing text before delivery.` / `交付物须包含根据给定脚本生成、可听清的旁白；交付前应试听发音、节奏及遗漏内容。` | **`publishable` 编辑候选**；`importance=required`、`status=reviewed` 暂保持。 |
| preferred Task Capability `rationale.en` / `.cn` | `When a real or cloned voice is used, the team must confirm permission for that voice and the intended distribution; the chosen audio export must meet the recipient's format requirements.` / `使用真人或克隆声音时，团队须确认该声音及预定分发方式已获许可；所选音频导出还须满足接收方的格式要求。` | **`publishable` 编辑候选**；`importance=preferred` 暂保持，consent/export review 仍由 Task 约束要求。不得声称平台替用户完成法律审核。 |

下表是候选**字段语义**，不是可立即写入的行；新行 ID、reviewer、review window、profile/source/claim/link 尚不存在，不生成 manifest。

| 工具 → Capability | `support_level` | `availability` | `plan_requirement` 候选 | `limitations` 候选 |
| --- | --- | --- | --- | --- |
| ElevenLabs → `text-to-speech-voice-generation` | `strong` | `all_plans`（基础 TTS） | EN/CN：Free 可试非商用 TTS；商用须 Starter+；IVC Starter+、PVC Creator+；按模型/渠道核 credits 和输出音质。 | EN/CN：语言、单请求字符和音质随模型/套餐变化；长脚本分段；生成有变异，须人工试听；克隆不是基础 TTS 的默认权利。 |
| ElevenLabs → `voice-consent-and-export` | `partial` | **`unknown` / HOLD** | EN/CN：选择 UI 下载或 API 格式并核对应付费档；记录声音/脚本授权及分发范围。 | EN/CN：验证不证明真实权利；Free 不含商业使用；克隆模型本身不可独立导出；API 44.1 kHz PCM/WAV 需 Pro+。复合能力跨基础声音/克隆/商用，不能用单一 `all_plans` 掩盖。 |
| Descript → `text-to-speech-voice-generation` | `strong` | `all_plans`（Free 有限额） | EN/CN：在有 Editor 资格及 AI credits 的 Drive 使用；Free 的 TTS/clone 有限，付费额度和 media minutes 分开核算。 | EN/CN：stock voice 语言及持续可用性不同；生成模型、段落和声音可能有不连续；精剪前须转为普通 audio layer。 |
| Descript → `voice-consent-and-export` | `partial` | **`unknown` / HOLD** | EN/CN：自定义 clone 需说话人授权录音；按当前套餐/Drive 额度确认自定义声音及本地导出；商用声音许可须补当前直接来源。 | EN/CN：录音所有权不能替代说话人同意；无法为未同意/已故/无法录制声明者克隆；API 下载渲染文件须先发布为 web link；不发布直接下载尚不支持。 |

两条治理/交付 Capability 的 `unknown` 是**明确的发布阻断值**，不应创建 reviewed 行后靠默认值通过门禁。若编辑者决定将此复合能力按所选工作流映射为 `paid_only` 或 `all_plans`，须先建立能证明该完整映射的官方、同 owner、current claims 并独立审定；必要时另案审视能力拆分，不能在 CL-05 偷改全局模型。

| 候选 Fit 字段 | ElevenLabs | Descript |
| --- | --- | --- |
| `fit_level` | `conditional` | `conditional` |
| `rationale.en` / `.cn` | `Use ElevenLabs for script-to-audio narration when the selected model, voice license, credit budget, and required download or API format are verified for the delivery.` / `在所选模型、声音许可、credit 预算和所需下载或 API 格式均已核实时，可用 ElevenLabs 生成脚本旁白。` | `Use Descript when the voiceover is created or revised inside an audio/video edit and the selected AI Speaker can be exported in the required audio format.` / `旁白需要在音视频编辑项目中生成或修改，且所选 AI Speaker 可按所需音频格式导出时，可用 Descript。` |
| `required_conditions` | 有权使用脚本与声音；克隆有明确许可；商用选合格付费档；确认目标语言/模型、额度、导出格式；人工试听。 | 有权使用脚本/声音；custom clone 有本人授权录音；确认声音语言、Drive 额度和 UI 导出；人工试听。 |
| `disqualifiers` | 无法取得声音许可；要求导出克隆模型独立文件；要求套餐不支持的格式/音质或保证固定长度成品。 | 无法取得说话人授权；要求对已故/不愿录制授权者克隆；必须通过 API 下载但不允许先发布 web link；目标语言/声音或额度不满足。 |
| 处置 | `conditional` / HOLD，未创建 Fit。 | `conditional` / HOLD，未创建 Fit。 |

## 4. Evidence link 目的、缺口与发布建议

正式 intake 前须为每个**工具自身**建立 profile 和官方 source；每条事实使用具体功能、定价、条款或格式页，不能用工具营销首页或另一工具的资料替代。每条 Tool Capability 至少需要 `support`（TTS/克隆或导出功能）、`availability`（具体产品表面与套餐）、`plan`（credits/付费要求）、`limitation`（语言/格式/授权边界）的 verified/current claim link；Fit 另需 `fit` 与 `limitation`。同一个来源可支持多条明确 claim，但每条 link 的 purpose、profile owner、review window 和内容范围要逐个 QA。账号级额度、实际可选声音及目标导出工作流仍需实测，不能以网页表格保证。

**HOLD：** 两条 Task rationale 可以先进入独立编辑 QA，生产仍保持 reviewed。两工具虽有官方可核查的功能、权利、导出与套餐资料，当前均缺 profile/source/claim/link；Descript 商用声音许可还缺当前直接来源；治理/交付复合 Capability 的 `availability` 不能安全简化。不创建 Tool Capability/Fit，不进行 CL-01 单组发布，不生成生产 manifest。另需独立内容/技术 QA、当前官方再核验、reviewer 和 review window、精确行清单后才可考虑管理员事务。只有两个候选 Fit，Task Page 的至少三个真实 published fit 门槛也未满足；继续 404，不改 sitemap、metadata 或索引。

**只读复核：** `pnpm exec tsx scripts/verify-decision-cl05-voice-readonly.ts` 必须保留当前 Task/工具身份、两条 reviewed Task Capability、两工具无 profile 和本 Task 无关系等断言；数据变化后应先审计差异，再维护 verifier，不能静默放宽。`pnpm exec tsx scripts/test-decision-cl05-voice-editorial.ts` 核对候选包与只读边界。未来如误发布，用 CL-01 精确 Task 清单撤回受影响关系并核对非目标行，不能靠隐藏页面代替数据撤回。

## 5. 本地验证记录

- 只读生产 verifier、CL-05 专项测试、Decision Capability foundation/read-model/admin、review gate、Task Page、evidence contract 与 graph seed 测试通过；`tsc --noEmit` 与完整 `pnpm run build` 通过。Build 从主 checkout 的 `.env.local` 安全加载环境，未打印 secret。
- `test:decision-seo-release` 在既有 `scripts/test-decision-seo-release.ts:27` 失败：它要求工具详情页源文件包含字面 `decisionCardV2 ?`。当前详情页把 `model={decisionCardV2}` 传给 `PublicToolDecision`，后者以 `{model && <DecisionCardV2 ... />}` 渲染；测试仍检查旧源码形态。本包仅改 CL-05 文档和只读/专项脚本，不改工具详情页、metadata、sitemap 或索引；该测试需要在对应 SEO 维护范围更新，不能算本次整套测试全绿。
- 生产页面只读回读：`/cn/tasks/ai-voiceover` 返回 404，sitemap 精确路径匹配为 0。本地无生产写入、无关系创建、无发布或部署。
