# CL-03 · `product-image-to-short-video` 编辑证据包

状态：**Luma 公开内容、工具/profile 身份及两条公开 timeline 事件已在生产修复并回读通过；CL-03 evidence 与关系工作未完成**（2026-09-25）。本包不是生产写入、发布清单或管理员批准。只涉及既有 Task、两条 Task Capability、Luma 的一条 Tool Capability 和一条 Fit；不创建实体、不进入 CL-04，也不触及 Task Page。

## 1. 修复前生产只读身份与版本快照（历史基线）

下表保留修复前状态作审计，不代表当前生产值。只读读取 Supabase 关系及 Neon 工具；未读取、记录或转述旧 claim 的 `claim_value`、`source_excerpt`。所有时间为 UTC，发布或编辑前须重新回读 `updated_at` 与复核字段。

| 对象 | 精确 ID / 键 | 当前状态、版本与 reviewer |
| --- | --- | --- |
| Task `product-image-to-short-video` | `241ae23f-50b8-4cad-b93a-3eda29dc3dfe` | `active`；`updated_at=2026-09-23T06:06:52.904308+00:00` |
| Capability `image-to-video-generation` | `8affb0cf-5d2c-4837-89f9-abfba146dc66` | `active`；同上 |
| Task Capability：图片转视频 | Task ID + Capability ID | `required`、`reviewed`；`updated_at/reviewed_at=2026-09-23T06:06:52.904308+00:00`；`review_due_at=2026-12-22T06:06:52.904308+00:00`；`reviewed_by=2b8177ac-70b3-4475-a1ee-509ff8b4b622` |
| Capability `video-editing-and-export` | `22061fe3-e424-4d74-862a-3392deb1a84e` | `active`；同上 |
| Task Capability：编辑与导出 | Task ID + Capability ID | `preferred`、`reviewed`；时间和 reviewer 同上 |
| Neon 工具 `luma-ai` | `711df152-fdcf-4a19-930c-ab866b67605f` | `published`；`updated_at=2026-09-02T03:08:27.579Z`；URL 仍为 `https://dream-machine.lumalabs.ai/` |
| Tool profile | `4501f2f9-4579-4675-9a16-0ef800fe8385` | owner 为上述 tool，`ready`；`updated_at=2026-09-05T15:04:15.138465+00:00`；`canonical_domain=dream-machine.lumalabs.ai` |
| Tool Capability：图片转视频 | `3fd95416-f1a7-4c43-8614-b5e6dd8051d3` | `partial`、`availability=unknown`、plan `{}`、limitations `[]`、`reviewed`；`updated_at/reviewed_at=2026-09-23T06:06:52.904308+00:00`；reviewer 同上 |
| Luma Fit | `2e5a0e13-ce68-4216-b315-0c6aa3e39937` | `conditional`、`reviewed`；空 conditions/disqualifiers；`updated_at/reviewed_at=2026-09-23T06:06:52.904308+00:00`；reviewer 同上 |

**修复前阻塞项（现已解除）。** [Luma 官方身份页](https://lumalabs.ai/llm-info)把当前视频模型标为 Ray3.2，区分旧 Dream Machine/Ray2，并以 `lumalabs.ai` 为官方站；[当前产品页](https://lumalabs.ai/ray)和[发布说明](https://lumalabs.ai/news/introducing-ray-3-2)同样指向 Ray3.2。当时生产工具 URL 和 profile 域为旧 Dream Machine 子域。CL-01 intake 校验 source host 必须匹配 profile `canonical_domain` 或其下级域；`lumalabs.ai`、`docs.agents.lumalabs.ai` 均不匹配 `dream-machine.lumalabs.ai`。当时不得借旧域链接、新建第二个 profile/tool、改 claim 来源或跳过校验来录入当前证据；身份与跨库 owner 后经受控修复和回读，后续 evidence intake 仍须独立 QA。官方其他 FAQ 仍用 Dream Machine 称呼消费端，说明品牌用语也须单独核定；本包只把 Ray3.2 作为被审模型，不假定所有 App 工作流都采用同一 API 行为。

## 2. 旧证据查重与处置

该 profile 有 4 条旧 `dream-machine.lumalabs.ai` official source（首页、help、pricing、product），均无 `last_verified_at`；两条 claim：`4cf9edb2-8b6d-49dd-bc36-ccbc32f7a939` 为 verified、current window 至 `2026-10-05T00:00:00+00:00`，但 `source_id=null`、`verified_by=null`，只来自旧首页；`ba3f00b1-cb72-4383-827e-685b0c18d2d8` 为 rejected。前者同时链接 Tool Capability `support` 与 Fit `fit`；后者无目标 link。旧 key 分别为 `one_line_positioning:342f63fda46faaa7` 和 `product_name:76688799c6345607`，无本包候选 key 冲突。

**建议处置：** 保留旧 source/claim 的审计记录，不再作为 Ray3.2 当前证据；在身份问题解决、独立 QA 批准且关系仍处于可编辑状态后，解除两条旧 link，并按审核结果将旧 verified claim 失效或标记 superseded。不得仅因 `review_due_at` 尚未到期而沿用旧首页。若身份无法统一，保持 Tool Capability/Fit reviewed，不录入新 claim、不发布；如果后续发现旧链接会被误用于发布，先按 CL-01 受控路径撤回相关关系。

## 3. 当前官方事实与冲突边界

以下只用 Luma 自有站点与官方 API 文档。核验日 2026-09-25。每条事实限制在对应产品表面，不把营销示例当保真承诺。

| 主题 | 直接官方依据 | 编辑边界 |
| --- | --- | --- |
| 身份与输入 | [身份页](https://lumalabs.ai/llm-info)、[API 模型页](https://docs.agents.lumalabs.ai/guides/model)、[迁移指南](https://docs.agents.lumalabs.ai/guides/videos/migration/) | Ray3.2 API 用 `video.start_frame` / `video.end_frame` 图片锚生成视频；旧 Ray2 API 请求形状不能沿用。产品图作为输入成立，**像素级主体、包装文字、商标一致性不保证**。 |
| 产品一致性 | [Luma 产品/角色一致性指南](https://lumalabs.ai/learning-hub/keep-character-product-consistency-in-luma-reference-guide) | 官方指导以清洁、多视角参考和明确的不可变特征减少漂移，且承认产品可能细微变化。该指南介绍 Luma Agent 工作流，不能证明 Ray3.2 单图输入可锁定商品身份；重要产品细节必须人工逐帧核验。 |
| 时长、分辨率 | [Ray3.2 发布说明](https://lumalabs.ai/news/introducing-ray-3-2)、[API 模型页](https://docs.agents.lumalabs.ai/guides/model)、[API 创建参数](https://docs.agents.lumalabs.ai/api/resources/generations/methods/create) | 发布说明称最长 20 秒、1080p；当前 API 参数只列 `5s`/`10s`，并列 draft 360p、540p、720p、1080p。**20 秒原生生成与 API 参数存在口径冲突，hold；不承诺单次 20 秒或所有表面相同上限。** 可收窄为 API 列出的 5/10 秒、最高 1080p，且账号与操作限制另核。 |
| 编辑、导出 | [Ray 产品页](https://lumalabs.ai/ray)、[API 模型页](https://docs.agents.lumalabs.ai/guides/model)、[API 编辑指南](https://docs.agents.lumalabs.ai/guides/videos/editing/) | Ray3.2 有针对已有视频的 modify/edit、reframe；API 输出 MP4，HDR 可另导 EXR。证据不证明完整时间线剪辑、配乐、字幕或多镜头装配。`video-editing-and-export` 仅能按局部改片/改比例及文件交付描述，不能因生成能力推断为完整剪辑套件。 |
| 套餐与 credits | [Luma 定价](https://lumalabs.ai/pricing)、[API 定价](https://docs.agents.lumalabs.ai/guides/pricing)、[身份页](https://lumalabs.ai/llm-info) | App 个人档为 Plus/Pro/Ultra；定价表列 Ray3.2 图片转视频按时长、分辨率和 HDR/EXR 消耗 credits。API 是独立按量计费表面，不能把 App 套餐、credits 直接套用 API；额度、单价录入前重新核对。 |
| 商用权与表面 | [Luma 定价](https://lumalabs.ai/pricing)、[身份页](https://lumalabs.ai/llm-info)、[旧 API FAQ](https://docs.lumalabs.ai/docs/faq) | 当前 App Plus 页列 commercial use；旧 API FAQ 称 API 生成可商用，但属旧 API 文档。当前 Agents API 的商用条款未由同一当前文档直接确认，**API 商用权 hold**。付费套餐也不替用户解决输入产品图、标识和人物授权。 |

另有版本冲突：发布说明/产品页写最多 16 个 keyframe，当前 API 模型页写最多 64 anchors。此包不固化 keyframe 上限；QA 须先确认相同表面、模型版本和可用参数。旧 Learning Hub 套餐/credit 页含 Ray2 与不同档名，不作为 Ray3.2 当前套餐 claim。当前 App 页面可用性、实际导出流程和 API 权限需要独立 QA 实测或更直接官方说明；不以 API 能力自动覆盖 App。

## 4. 候选编辑字段（未写生产）

| 既有关系 | 候选字段 | 值与理由 |
| --- | --- | --- |
| Task → `image-to-video-generation` | `importance` | 保持 `required` |
| 同上 | `rationale.en` | Animate a user-supplied product image into a short video while checking that the product remains recognizable and its important visual details survive the generated motion. |
| 同上 | `rationale.cn` | 将用户提供的产品图生成短片，并核对运动后的主体是否仍可识别、重要外观细节是否保留。 |
| Task → `video-editing-and-export` | `importance` | 保持 `preferred`；这是交付需要，不自动表示 Luma 已有完整剪辑能力 |
| 同上 | `rationale.en` | Revise the generated shot when framing or visual details need correction, then export a reviewable video file in the required delivery format. |
| 同上 | `rationale.cn` | 构图或细节需要修正时调整生成片段，再以交付所需格式导出可审核的视频文件。 |
| Luma → `image-to-video-generation` | `support_level` | 候选 `partial`：图片锚生成有直接证据，但产品保真无保证；精确产品识别是本 Task 核心要求。 |
| 同上 | `availability` | 候选 `paid_only` **待 QA**：以需要商用交付的 App Plus/Pro/Ultra 流程为范围；若无证据证明 Ray3.2 具体 App 档可用，则保持 `unknown`/hold，不发布。 |
| 同上 | `plan_requirement.en` | For commercial App delivery, verify current Plus, Pro, or Ultra access and available credits before generating. Ray3.2 credit cost varies by duration, resolution, and HDR/EXR. API usage is billed separately; confirm API access and terms for that workflow. |
| 同上 | `plan_requirement.cn` | 商用 App 交付前核对当前 Plus、Pro 或 Ultra 访问权限与可用 credits。Ray3.2 消耗随时长、分辨率及 HDR/EXR 改变；API 单独计费，须另核 API 权限及条款。 |
| 同上 | `limitations` | 见下方双语数组。 |
| Luma Fit | `fit_level` | 候选 `conditional`；仅在可人工验收主体细节、且局部改片与导出足够时适用。 |
| 同上 | `rationale.en` | Ray3.2 can animate an input image and provide targeted video modification, reframing, and file output, so Luma can support a short product shot when the product's visual identity is checked by a human. |
| 同上 | `rationale.cn` | Ray3.2 可用图片生成视频，并提供局部改片、改比例及文件输出；产品外观经人工核验时，Luma 可用于短产品镜头。 |

Tool `limitations` 候选数组：

1. `"EN: A product image anchors generation but does not guarantee exact packaging, logo, text, color, or shape in every frame; inspect the output. CN: 产品图可作为生成锚点，但不能保证每帧包装、标识、文字、颜色或形状完全一致；须逐帧检查。"`
2. `"EN: API documentation lists 5s and 10s generation durations; a separate release announcement says up to 20s. Do not promise a single 20s image-to-video output until the surface is reconciled. CN: API 文档列出 5/10 秒，发布说明另称最长 20 秒；在表面差异核清前不得承诺单次 20 秒图片转视频。"`
3. `"EN: Modify and reframe are targeted video operations, not evidence of timeline editing, captions, audio mixing, or multi-shot assembly. CN: Modify 和 Reframe 只证明局部视频操作，不证明时间线剪辑、字幕、混音或多镜头装配。"`

Fit `required_conditions` 候选数组：

1. `{"en":"The user has rights to the source product images and any marks or people shown, and can provide a clear product reference.","cn":"用户有权使用源产品图及其中标识或人物，并能提供清晰产品参考。"}`
2. `{"en":"The team can review the resulting frames for product identity, text, color, and shape before delivery and regenerate or edit failures.","cn":"交付前可人工核查主体、文字、颜色和形状，发现偏差时重新生成或局部修订。"}`
3. `{"en":"The selected App plan or separately billed API workflow has the needed access, credits or budget, resolution, duration, and export path.","cn":"所选 App 套餐或单独计费的 API 工作流具有所需权限、额度或预算、分辨率、时长及导出路径。"}`

Fit `disqualifiers` 候选数组：

1. `{"en":"The deliverable requires guaranteed frame-perfect product packaging, logo, or small text without human verification.","cn":"交付要求每帧产品包装、标识或小字严格一致，且不允许人工核验。"}`
2. `{"en":"The workflow requires a full timeline editor, captions, music mixing, or multi-shot assembly inside Luma.","cn":"流程要求在 Luma 内完成完整时间线剪辑、字幕、配乐混音或多镜头装配。"}`
3. `{"en":"The required duration, resolution, commercial right, or API entitlement cannot be confirmed for the selected surface and account.","cn":"所选表面和账号的所需时长、分辨率、商用权或 API 权限无法确认。"}`

现有 Luma **没有** `video-editing-and-export` Tool Capability。独立 QA 可维持仅一条 `image-to-video-generation` Tool Capability 的 partial/conditional 结论；若要增加第二条关系，须另案证明其完整定义及四类 evidence，不能借本包生成能力推导后自动创建。

## 5. 最小官方 claim 草案与自检

下表仅供身份修复后的 intake/独立 QA 逐条审定。`source_excerpt` 是可在所列官方页面逐字定位的短片段；`claim_value` 只表达该片段直接支持的事实。候选 key 尚未入库；所有 scope 包含 `asOf=2026-09-25`。旧 claim 不重用、不刷新。

| 候选 `claim_key` / type | 官方 source；`source_excerpt` | `claim_value`；`validity_scope` | Tool / Fit purpose |
| --- | --- | --- | --- |
| `luma:ray32:identity-2026-09` / `feature` | [身份页](https://lumalabs.ai/llm-info)；“The current video model is Ray3.2” | `{"current_video_model":"Ray3.2"}`；`{"brand":"Luma","asOf":"2026-09-25"}` | Tool `support`；Fit `fit` |
| `luma:ray32:anchor-input-2026-09` / `feature` | [API 模型页](https://docs.agents.lumalabs.ai/guides/model)；“Image-to-video (`video.start_frame` / `video.end_frame`)” | `{"api_image_to_video":"start_or_end_frame"}`；`{"surface":"Luma Agents API","model":"ray-3.2","asOf":"2026-09-25"}` | Tool `support`；Fit `fit` |
| `luma:ray32:api-output-2026-09` / `feature` | [API 模型页](https://docs.agents.lumalabs.ai/guides/model)；“Resolutions: `540p`, `720p`, `1080p`. Durations: `5s`, `10s`.” | `{"api_duration":["5s","10s"],"api_resolution":["540p","720p","1080p"]}`；`{"surface":"Luma Agents API","type":"video","asOf":"2026-09-25"}` | Tool `availability`/`limitation`；Fit `limitation`；不概括 draft 或所有操作 |
| `luma:ray32:video-operations-2026-09` / `feature` | [迁移指南](https://docs.agents.lumalabs.ai/guides/videos/migration/)；“Restyle, refine, or transform a video” | `{"api_video_edit":"restyle_refine_transform"}`；`{"surface":"Luma Agents API","type":"video_edit","asOf":"2026-09-25"}` | Tool `limitation`；Fit `fit`；不作为完整剪辑证据 |
| `luma:ray32:api-mp4-2026-09` / `feature` | [API 模型页](https://docs.agents.lumalabs.ai/guides/model)；“Video output is delivered as MP4.” | `{"api_video_output":"MP4"}`；`{"surface":"Luma Agents API","asOf":"2026-09-25"}` | Tool `support`；Fit `fit`；不推断 App 导出选项 |
| `luma:ray32:app-commercial-2026-09` / `plan` | [当前定价](https://lumalabs.ai/pricing)；“Edit access for guest collaborators / Commercial use” | `{"app_plus_commercial_use":true}`；`{"surface":"Luma App","plan":"Plus","asOf":"2026-09-25"}` | Tool `plan`；Fit `fit`；不推断 API 商用 |
| `luma:ray32:app-credit-rate-2026-09` / `plan` | [当前定价](https://lumalabs.ai/pricing)；“20 credits / 5 sec 60 credits / 10 sec” | `{"ray32_draft_video_credits":{"5s":20,"10s":60}}`；`{"surface":"Luma App pricing table","model":"Ray3.2 SDR","action":"text_or_image_to_video","resolution":"Draft","asOf":"2026-09-25"}` | Tool `availability`/`plan`；Fit `fit`；仅 draft，其他费率另核 |
| `luma:product:consistency-risk-2026-09` / `limitation` | [产品一致性指南](https://lumalabs.ai/learning-hub/keep-character-product-consistency-in-luma-reference-guide)；“your character or product keeps subtly changing” | `{"product_consistency":"may_drift"}`；`{"surface":"Luma Agent reference workflow","asOf":"2026-09-25"}` | Tool `limitation`；Fit `limitation`；不能写成 Ray3.2 专属测试结论 |

**value–excerpt 自检：** 身份、图片锚、API 5/10 秒/分辨率、局部 edit、MP4、Plus 商用及产品漂移分别可由对应片段直接支持；credit claim 只陈述定价表的 Ray3.2 SDR Draft 5/10 秒数，不外推 540p/720p/1080p。QA 仍须在原页确认表格列与引文连续性，尤其商业套餐行；若不能直接定位则删掉该 key。`api-output` 与 `api-mp4` 同 source 的摘录可合并为一个 claim 以减少冗余，QA 须校对最终 purpose 覆盖。上述草案在域冲突解决前不能执行 intake；当前身份冲突已解除，但仍须独立内容 QA 和 fresh evidence preflight；`availability=paid_only` 和 App Ray3.2 权限仍须直接来源，故即使其他草案通过也暂不具备 Tool Capability 四目的完整发布证据。

## 6. QA 与继续执行的门禁

**身份修复已完成并通过生产回读，关系整改仍 hold。** 总控已验证：Neon tool `711df152-fdcf-4a19-930c-ab866b67605f` 为 `published`、`url=https://lumalabs.ai/`、`updated_at::text=2026-09-25 14:10:18.62758+00`，已验收内容字段保持；Supabase profile `4501f2f9-4579-4675-9a16-0ef800fe8385` 为 `ready`/version 2、`canonical_domain=lumalabs.ai`、`product_name=Luma AI`。decision event `0c92d051-bf36-4300-9585-79f8dc6c28ae` 与 fact event `2b07082c-5b63-470e-a096-6046b3d7446e` 已更正为 Luma AI 与当前官方来源，event type、scope、visibility、occurred_at 未变。完整 evidence projection 未变：4 sources、2 claims、1 Tool Capability link、1 Fit link。`/en`、`/cn`、`/jp` 的旧当前断言（Dream Machine/Photon/Ray3.14/Free-Lite/Unlimited）为 0，Ray3.2/UNI-1.1/Luma AI 可见，根域出站链接均存在。主分支已包含 `e84ad342`。这些验收只覆盖公开内容与身份，不代表 Ray3.2 evidence intake 或关系发布。

**下一项唯一范围：**对 Ray3.2 新 evidence intake、旧 claim/link 处置，以及 Tool Capability/Fit 的候选编辑与发布做独立 QA。不得以本次身份回读直接录入证据、失效/解绑旧 claim、改 reviewed 关系或发布 Task；Task Page、sitemap/index 保持不变。
### 公开内容来源与本次修复范围

线上 `/ai/luma-ai` 的旧事实来自运行时 Neon `tools.title/content/detail/features/use_cases/pricing/url`，历史来源是 `20260901_migrate_luma_ai_tool.sql`；页面另有 `page.tsx` 的双语官方事实快照和 metadata/决策要点，以及 `priorityToolEvidence.ts` 的限制文案。旧的用户可见断言包括 Dream Machine 作为当前产品范围、Photon 图片模型、Ray3.14 草稿、Lite/Unlimited 套餐与旧价格/credits、水印和商用权边界、月度 credits 不结转、旧 API 商用结论、Dream Machine 与 API 余额关系。这些旧当前断言已在 `/en`、`/cn`、`/jp` 的生产页面 QA 中消除；后续新 evidence 仍须逐条证实。历史 migration 和 collection 记录只作审计，不重新运行。`/cn` 与 `/en` 使用同一双语字段；其他 locale 的后备文案也须在回读时检查。

仓库双语快照、metadata 与优先限制文案已提交，Neon 内容经两次受控更正；工具 URL、profile 域/名称及两条公开 timeline 事件随后完成生产修复并回读通过。候选定位为广义 Luma 平台：App 与 API 分表面；Ray3.2 为当前视频模型，UNI-1.1 为当前图片模型；App 个人档为 Plus/Pro/Ultra；具体可用模型、credits、商用权及导出按账号/表面确认。API 参数不推断 App 能力，产品图不承诺包装或文字逐帧一致。官方依据：[身份页](https://lumalabs.ai/llm-info)、[当前定价](https://lumalabs.ai/pricing)、[产品一致性指南](https://lumalabs.ai/learning-hub/keep-character-product-consistency-in-luma-reference-guide)。

### 公开 timeline 身份补充门禁（2026-09-25）

页面 QA 曾发现旧品牌还来自 Supabase profile `product_name` 与两条公开 timeline 事件，而非 Neon features。修复前 profile `4501f2f9-4579-4675-9a16-0ef800fe8385` 为 `Luma Dream Machine`/旧域、`profile_version=2`；修复前 decision event `0c92d051-bf36-4300-9585-79f8dc6c28ae` 与 fact event `2b07082c-5b63-470e-a096-6046b3d7446e` 曾带旧表述。已执行的受控身份顺序为：fresh 双库与完整 evidence baseline → Neon URL 精确版本更新 → **单个 Supabase SQL 事务**同时更正 profile 域/名称和两条 event 的摘要、来源及 decision metadata → 页面与完整 evidence 回读。事务中任一守卫失配即整体回滚；若 Supabase 阶段失败，按最新 `updated_at` 精确守卫补偿 Neon URL；若提交后 QA 失败，先逆序回滚 Supabase 三行，再补偿 Neon URL。保持 event 类型、复核范围、可见性、发生时间及 claims/sources/links 不变。操作模板见 `/tmp/ai-best-tool-cl03-identity-operation.json`；本次文档收口不执行任何生产写入。
