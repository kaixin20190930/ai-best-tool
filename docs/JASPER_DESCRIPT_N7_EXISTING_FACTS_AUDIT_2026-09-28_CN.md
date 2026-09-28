# N7：Jasper 与 Descript 既有事实新鲜度复核

核查日：2026-09-28；候选事实下次复核：2026-10-05。两者是已发布工具的 `existing facts/evidence review`，不占新工具发布槽。本包只记录官方一手资料与生产只读观察，不是已核验的 Evidence Ledger claim，也不是生产更新授权。未登录付费 workspace、未购买 Drive 或 Enterprise 合同，未实测额度、输出质量或实际成本；厂商的营销效果数字不作为实测结果。分类只使用 `NO_CHANGE`、`SAFE_UPDATE_CANDIDATE`、`ACCOUNT_OR_PLAN_VALIDATION`、`HOLD_CONFLICT`。

## 身份与现状

遵循[收录宪法](./BEST_DIRECTORY_POSITIONING_AND_INTAKE_CN.md)、[索引政策](./TOOL_INDEX_RELEASE_POLICY_CN.md)、[N6 既有事实审计](./CANVA_GRAMMARLY_N6_EXISTING_FACTS_AUDIT_2026-09-28_CN.md)及[候选台账](./MATURE_CANDIDATE_BUFFER_2026-09-20_CN.md)。生产 Neon 经 `BEGIN READ ONLY → SELECT → ROLLBACK` 以名称或官网域名回读，恰有一个 Jasper 和一个 Descript；未写入。日期列以 Asia/Shanghai 业务日期表示，Neon 客户端返回的是前一日 16:00 UTC。

| 工具 | 唯一实体 ID | `status` / `page_quality_status` | `next_review_date` | 当前双语线上状态 |
| --- | --- | --- | --- | --- |
| Jasper | `5a0c7e91-9a5c-4f84-923a-d8345edaa918` | `published` / `continue_index` | 2026-10-20 | `/ai/jasper`、`/cn/ai/jasper` 均 200、自 canonical、无 noindex meta；sitemap 恰有两条 |
| Descript | `a8c41d20-6b48-4f75-9f17-7e34c84619d2` | `published` / `monitor` | 2026-10-27 | `/ai/descript`、`/cn/ai/descript` 均 200、自 canonical、`noindex, follow`；sitemap 0 条 |

`features.release.indexState=monitor` 是两者发布时的历史快照；Jasper 现行索引资格由 `page_quality_status=continue_index` 决定。保留唯一 Jasper/Descript 产品身份；Jasper IQ、Grid、Underlord、AI Speakers 不另建实体或 URL。[CL-06 品牌包](./DECISION_GRAPH_CL06_BRAND_EDITORIAL_PACKET_2026-09-27_CN.md)与[CL-05 语音包](./DECISION_GRAPH_CL05_VOICE_EDITORIAL_PACKET_2026-09-27_CN.md)中的 Task/Capability/Fit 是候选语义；不能当成已发布关系或 verified evidence。

## Jasper：生产字段与官方事实

| 范围与字段 | 分类 | 核验事实、限制和处置 |
| --- | --- | --- |
| `name`、`url`、`title.*`、`content.*`、`tags`、`use_cases.*`、`pricing=paid`、`status`、`page_quality_status` | `NO_CHANGE` | 单一营销 AI 工作区的身份与席位/治理决策定位仍成立。[当前价格](https://www.jasper.ai/pricing)将 Pro 列为月付每席 `$69`、年付折算 `$59`、一个席位、7 天试用；Business 为定制，API/自定义代理/治理等范围分层。不能将网站上的效率、准确或品牌效果措辞视为本站测试。 |
| `detail.*` 价格段、`features.pricingSnapshot`、`features.decision.pricingSummary` | `NO_CHANGE` + `ACCOUNT_OR_PLAN_VALIDATION` | 页面现有 Pro 的 2 个 Brand Voices、5 个 Knowledge assets、3 个 Audiences 与[价格页](https://www.jasper.ai/pricing)一致；[credits 说明](https://help.jasper.ai/hc/en-us/articles/46644376016923-Credits-Based-Pricing)仍区分平台费与共享 credits，部分 API/MCP、Grid 和 Agent 动作耗费 credits。Business 基础包量、实际 rate card、PAYG 和合同期须核真实账号/订单，不填固定数字。 |
| `detail.*` 品牌段 | `SAFE_UPDATE_CANDIDATE` | 现有“Style Guide 仅 Business、默认 Brand Voice 可改选、人审必需”正确。[Style Guide](https://help.jasper.ai/hc/en-us/articles/25925092890011-Style-Guide)又直接说明已选规则在 Chat/Apps/Canvas 和 Public API 生成时应用，一次只能启用一个；从品牌文档自动抽取是 Business open beta 且要人工校正。可只追加此缺失边界，不能写成强制发布审批或结果保证。 |
| Brand IQ/Knowledge/Product IQ 的 Pro/Business 权益和组织编辑权限 | `HOLD_CONFLICT` + `ACCOUNT_OR_PLAN_VALIDATION` | [价格页](https://www.jasper.ai/pricing)与[Brand Voice](https://help.jasper.ai/hc/en-us/articles/18618693085339-Brand-Voice)、[Knowledge Base](https://help.jasper.ai/hc/en-us/articles/55085018624411-Knowledge-Base)列出 Pro 数量；[Jasper IQ 总览](https://help.jasper.ai/hc/en-us/articles/18618654325787-Jasper-IQ)却称 IQ 仅 Business。Style Guide 页称 Admin/Manager 编辑，[Permission Settings](https://help.jasper.ai/hc/en-us/articles/34717759798683-Permission-Settings)又允许管理员关闭限制后让其他人编辑。不能据此给 CL-06 填确定 plan/availability；需目标租户验证。 |
| 营销工作流、API/集成和导出 | `NO_CHANGE` + `ACCOUNT_OR_PLAN_VALIDATION` | 已有页面把 Canvas、Chat、Agents、Studio、Grid 纳入同一产品。[Studio](https://help.jasper.ai/hc/en-us/articles/36783295610395-Jasper-Studio)说明可建立/发布 Agent 且发布权限可配置；[API](https://help.jasper.ai/hc/en-us/articles/18618701173659-Jasper-s-API)与价格页把 Public API 放在 Business 范围。[导出说明](https://help.jasper.ai/hc/en-us/articles/18618604425883-Export-Content)列本地内容格式，但不证明客户 CMS 集成、自动审批或所有账户有 API。具体开通、导出目标与权限按合同核。 |
| `detail.*` 隐私/训练/商用和人审段 | `NO_CHANGE` | [EULA](https://www.jasper.ai/legal/eula)明确 Customer Property 包含输入/输出，Jasper 及第三方不得用其训练服务 AI 模型；授权处理方仍可提供服务而处理。输出归属分配不保证独特性或可受版权保护，客户仍须核对输入权、事实与用途。[DPA](https://www.jasper.ai/legal/dpa)及子处理商/托管配置须合同验证；页面已提示。 |
| `category_id`、`image_url`、`thumbnail_url`、`screenshots`、`video_url`、`features.media`、`features.audience`、`features.decision.compareAxes/alternatives/limitations` | `NO_CHANGE` | 此轮无分类、素材、受众或替代路径变化；现有素材是本站自制编辑标识，非 Jasper 官方图或实测截图。 |
| `features.evidence`、`features.marketValidation`、`features.editorial`、`features.release` | `NO_CHANGE`（历史快照） | 既有来源/市场验证/编辑/发布记录不因 N7 浏览而刷新 `checkedAt` 或评论数字；`marketValidation` 中的旧 monitor/noindex 理由也是发布时评审文本，不覆盖当前 `page_quality_status`。独立市场证据此轮未重新核验。 |

## Descript：生产字段与官方事实

| 范围与字段 | 分类 | 核验事实、限制和处置 |
| --- | --- | --- |
| `name`、`url`、`title.*`、`content.*`、`tags`、`use_cases.*`、`pricing=freemium`、`status`、`page_quality_status` | `NO_CHANGE` | 唯一文本式音视频编辑工作区的身份与双计量决策定位仍正确。[定价页](https://www.descript.com/pricing)列 Free 1 media hour/月和一次性 100 AI credits；Hobbyist/Creator/Business 年付折算每人每月 `$16/$24/$50`，月付 `$24/$35/$65`，各为 10/30/40 media hours 和 400/800/1,500 月 credits；Enterprise 定制。 |
| `detail.*` 套餐段、`features.decision.pricingSummary` | `NO_CHANGE` + `ACCOUNT_OR_PLAN_VALIDATION` | 现有数字、逐席位和年付/月付区别成立。实际 Drive 的 Editor 数、共享池、legacy/sunset plan、top-up、Enterprise 额度及账单须按目标账号核对，不能按一个示例估算团队总成本。 |
| `detail.*` 双计量段、`features.decision.limitations.*` | `SAFE_UPDATE_CANDIDATE` | 现有 media minutes 不结转与任务/模型改变 credits 消耗的说法正确。[用量说明](https://help.descript.com/billing-payments-plans/track-and-understand-your-media-minutes-and-ai-credits)还明确月度 **AI credits 也不结转**，Editor 席位叠加共享 Drive 池，手动效果可随输入规模计费而 Underlord 消耗不确定。只补遗漏的 AI credit 结转边界；绝不恢复旧版固定 avatar credits。 |
| `detail.*` 转录、文本编辑、AI Speakers/voice consent | `NO_CHANGE` + `ACCOUNT_OR_PLAN_VALIDATION` | [定价页](https://www.descript.com/pricing)确认转录和文本式编辑；[TTS 帮助](https://help.descript.com/ai-speech/tts)及[自定义声音同意](https://help.descript.com/ai-speech/custom-speaker)把 stock、自定义说话人和授权分开。[服务条款](https://www.descript.com/terms)禁止未同意的克隆。现有页面已保留同意、人审和非唯一/不准确输出边界；具体 voice/model/套餐组合、第三方说话人商业授权仍要按账号及权利文件核。 |
| `detail.*` 导出/API、`features.decision.limitations.*` | `SAFE_UPDATE_CANDIDATE` | 现有页面未说明关键交付差异：[当前价格](https://www.descript.com/pricing)将 Hobbyist/Creator/Business 视频导出标成无水印，Free 有水印；[本地音频导出](https://help.descript.com/export-and-share/audio)支持 MP3/WAV/M4A。[API 文档](https://help.descript.com/api-and-mcp/api)区分 API 的转录文本导出与渲染文件：后者要先发布 Descript web link 才返回 signed URL，API 不支持未发布的直接文件下载；本地文件可在 app 内导出。实际成员角色/导出限制需账户确认。 |
| `detail.*` 隐私/训练/商用边界 | `NO_CHANGE` + `ACCOUNT_OR_PLAN_VALIDATION` | [隐私政策](https://www.descript.com/privacy)区分服务处理、关闭 Share Data with Descript 后的项目改进退出与 AI Speaker 训练音频的去标识研究/人工质检；[条款](https://www.descript.com/terms)规定输入权、说话人许可与输出审核。现有页面已明确这不是全面不处理或商用权保证；未实测付费 Drive、Enterprise 训练/留存合同。 |
| `category_id`、`image_url`、`thumbnail_url`、`screenshots`、`video_url`、`features.media`、`features.audience`、`features.decision.compareAxes` | `NO_CHANGE` | 此轮无分类、素材、受众或比较轴变化；现有素材为本站自制编辑标识，不是 Descript 官方图或实测截图。 |
| `features.evidence`、`features.marketValidation`、`features.editorial`、`features.release` | `NO_CHANGE`（历史快照） | 旧来源核查日、独立评论和发布快照不因 N7 浏览自动刷新；没有复跑独立市场验证，也没有付费 Drive/Enterprise 实测。 |

## 候选 patch 与后续门禁

[字段级候选 manifest](./JASPER_DESCRIPT_N7_CANDIDATE_PATCH_2026-09-28_CN.json)固定实体 ID、旧值摘要、增量候选文本、来源与日期。仅提 Jasper Style Guide 作用/限制和 Descript 的 AI credit 结转、导出/水印/API 差异；生产已有正确价格、同意、隐私、事实与索引字段不重复改写。所有候选都需独立编辑 QA 和写入前重新核对目标旧值及双语页面。Jasper IQ 方案矛盾、权限配置和 Descript 付费 Drive/Enterprise 权益仍保留 unknown/HOLD。

Tool Intelligence 的来源候选不自动成为 verified/current claim。CL-05/06 的 Tool Capability/Fit 均未发布，Task Page 发布资格仍按各自门禁判定。此轮不改数据库、关系、工具页、metadata、canonical、robots、sitemap 或索引，也不 push/deploy。

## 最小验证

- 生产只读身份与四个线上 URL、sitemap 已核；Neon 使用只读事务并回滚。
- `test:descript-preaudit` 与 `test:mature-candidate-buffer`：PASS。`test:jasper-preaudit`：既有测试基线失败，脚本仍断言候选 JSON 的 `status=ready_for_next_slot`，实际发布后值为 `released_monitor_noindex`；N7 范围不改测试/发布 JSON，保留此测试债务。
- CL-05 与 CL-06 生产只读 verifier：PASS、`productionWrites=0`；相关 Tool Capability/Fit 均为 0，Descript/Jasper 无本 Task 的 profile/source/claim/link。
- 候选 JSON 解析与实体 ID/状态/目标路径/来源结构核验：PASS；`git diff --check`：PASS。仅文档及不可执行候选，无完整 build。
