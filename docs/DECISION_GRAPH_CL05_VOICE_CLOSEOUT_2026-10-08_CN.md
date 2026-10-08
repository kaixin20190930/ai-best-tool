# CL-05 Voice 最小收口 · 2026-10-08

状态：**编辑候选保留；生产关系与 Task Page HOLD**。Owner 取消日历等待，不改变证据、关系、回滚、独立 QA 或 SEO 门禁。本次开发没有生产写入、迁移、部署或工具目录变更。既有[字段级编辑包](./DECISION_GRAPH_CL05_VOICE_EDITORIAL_PACKET_2026-09-27_CN.md)与[证据候选](./DECISION_GRAPH_CL05_VOICE_EVIDENCE_CANDIDATE_2026-09-28_CN.json)保留为历史候选，不能作为已审核 claim 或发布 manifest。

## 只读生产前像

2026-10-08T15:34:19Z 执行 `pnpm exec tsx scripts/verify-decision-cl05-voice-readonly.ts`。Neon 使用 `BEGIN READ ONLY` 后 `ROLLBACK`，Supabase 仅 SELECT；持久写入与 rollback 写入均为 **0**。

| 对象 | 精确身份与当前状态 |
| --- | --- |
| Task | `bb49bd6b-a968-4231-a505-5a79b5ffe8ad`，`ai-voiceover` / active；`output=voiceover`，consent/export review 均为 true。 |
| TTS Task Capability | `9c70a590-5848-443b-88cc-203a8f446e18`，required / reviewed；`updated_at=2026-09-23T06:06:52.904308+00:00`，`review_due_at=2026-12-22T06:06:52.904308+00:00`。 |
| Consent/export Task Capability | `87457bc5-6c9e-4aee-b051-0d85fcb8baf9`，preferred / reviewed；同一 `updated_at` 和 `review_due_at`。 |
| ElevenLabs | `d7b63bf2-63c8-4015-b59d-2f627450813f`，工具目录 published；本工具 intelligence profile 0。 |
| Descript | `a8c41d20-6b48-4f75-9f17-7e34c84619d2`，工具目录 published；本工具 intelligence profile 0。 |
| 关系与证据 | 两工具 × 两个目标 Capability 的 Tool Capability 0；本 Task Fit 0；两工具同 owner profile/source/claim/link 0。 |
| 页面 | 生产 `/cn/tasks/ai-voiceover` HTTP 404、`X-Robots-Tag: noindex, follow`；sitemap 精确路径匹配 0。 |

无 profile 意味着这里没有可用的同 owner source/claim/link；不能从已发布工具页或旧工具发布报告继承 Decision Graph 的 verified claim。两个工具目录维持原有 published + monitor/noindex 状态。

## READY / HOLD 矩阵

| 关系或页面 | 判断 | 最小下一动作与阻断项 |
| --- | --- | --- |
| 两条 Task Capability 的双语 rationale | **READY for independent editorial QA** | 沿用编辑包第 3 节的 EN/CN 文案，核对实际任务、consent/export 必审语义，指定真实 reviewer 与 review window。当前生产旧理由过泛，仍为 reviewed；不把候选文案视作已写入。 |
| ElevenLabs → 基础 TTS | **条件适配；证据 intake 待 QA；发布 HOLD** | 官方 TTS 功能与 Free 可用性支持窄范围的 `strong/all_plans` 候选；须按工具 owner 建 profile、官方 source、逐条 verified/current claim 与 `support/availability/plan/limitation` link，并确认模型/套餐/额度。当前 0 条关系、0 条证据对象。 |
| Descript → 基础 TTS | **条件适配；证据 intake 待 QA；发布 HOLD** | 官方编辑器 TTS 与 Free 有限额支持窄范围的 `strong/all_plans` 候选；须同样完成同 owner 证据链、双语字段、reviewer/window，核对目标语言、声音与 Drive 额度。当前 0 条关系、0 条证据对象。 |
| 两工具 → consent/export | **HOLD / `availability=unknown`** | 克隆同意、商用许可、音频导出和 API 是不同路径；没有直接证据证明整个复合能力在 `all_plans` 或 `paid_only` 完整成立。不能写成 reviewed/published，也不能借基础 TTS claim 补全。 |
| ElevenLabs / Descript → Task Fit | **conditional / HOLD** | 候选 rationale、required conditions 与 disqualifiers 已有双语编辑方向；仍需每工具自身 `fit/limitation` 官方 verified/current link、目标工作流及账号核验。没有可发布 Fit。 |
| Voice Task Page | **HOLD** | 现有 0 个 Fit，距至少 3 个不同真实 published/current Fit 的硬门槛至少差 3；两条 Task Capability 尚未 published，证据与独立页面批准也缺。保持 404/noindex/sitemap 0，不增加第三工具凑数。 |

现行 `admin_publish_reviewed_task_tool_group` 还将 Task slug 限于 `research-with-citations`，要求已有 published/current Task Capability 和非空 reviewed Tool Capability + Fit 精确清单。CL-01 原子发布函数同样要求三类关系清单非空。因此当前**不存在**可由现行合约执行的 Voice 单组发布 manifest；不预分配关系、证据或审核 ID，不用手工 SQL 越过合约。Task rationale 可先独立编辑 QA，后续确有可发布完整组时再针对 Voice 明确审定发布入口。

## 2026-10-08 官方差异复核

- [ElevenLabs TTS](https://elevenlabs.io/docs/overview/capabilities/text-to-speech)现列 Eleven v4/v4 Turbo、v3、Multilingual v2、Flash v2.5 等；旧候选的模型例子不完整，语言与字符限制必须按所选模型核对。[价格页](https://elevenlabs.io/pricing)仍列 Free TTS、Starter 商用许可/IVC、Creator PVC，但包含限时促销；不把促销或 credits 换算成稳定权利、额度或成品时长。
- [ElevenLabs API endpoint](https://elevenlabs.io/docs/api-reference/text-to-speech/convert)写 192 kbps MP3 为 Creator+；[总价格页](https://elevenlabs.io/pricing)的 Pro 权益也列 192 kbps 音质。两页面关于目标 API entitlement 的表述差异仍未消除；目标账号、渠道与格式核验前不录入确定 claim。UI 音频下载与克隆声音模型可移植性仍分别判断。
- [Descript TTS](https://help.descript.com/ai-speech/tts)列 Multilingual v2、v3、v4，切换 v4 后会影响后续生成；所列支持语言不能推广到任意声音。[自定义声音](https://help.descript.com/ai-speech/custom-speaker)仍要求说话人录制授权。[本地音频导出](https://help.descript.com/export-and-share/audio)支持 MP3/WAV/M4A；[API](https://help.descript.com/api-and-mcp/api)仍要求先发布 web link 才能取得渲染文件 URL，不能用 UI 导出证明直接 API 下载。
- [Descript Terms](https://www.descript.com/terms)与[stock voice 帮助](https://help.descript.com/ai-speech/stock-voices)没有给出当前 stock/custom voice 的逐类商用许可矩阵。旧工具发布文档引用的重定向帮助页/摘要不足以替代当前直接证据；相关商用 claim 继续 HOLD。

## 将来可执行单组的条件与回滚

独立内容 QA 须记录每条官方 URL 的当日摘录、具体产品表面、EN/CN 字段、reviewer、有效窗口及未解决冲突。开发可按已审核字段进行同 owner profile/source/claim intake 和 reviewed 关系准备；没有完整 `support/availability/plan/limitation` 与 `fit/limitation` purpose 覆盖的工具维持 HOLD。对目标账户的声音许可、商用范围、克隆同意、额度、语言、UI/API 导出格式分别实测或取得直接授权依据。

若将来形成完整组，先以只读 SELECT 回读 Task、两条 Task Capability、目标工具及全部关系/证据 ID、status、`updated_at`、owner、review window、link purpose 与非目标行；任一漂移即停止。经独立内容/技术 QA 和 Owner 管理员批准后，才使用明确覆盖 Voice 的受控事务入口按精确前像单组发布，验证幂等重放及全部 postconditions。失败由事务整体回滚；已提交后的撤回用该 Task/工具精确清单原子置 stale 并回读目标及非目标行。不能通过隐藏页面代替关系撤回。现阶段无发布组，故无生产执行动作，也无待执行的 rollback 写入。

QA 检查点：两条 Task rationale 的任务特异性和双语一致性；每工具的官方同 owner claim/link、过期与冲突；两条 consent/export 的 `unknown` 保持阻断；Fit 的条件和排除条件；Voice 404/noindex/sitemap 0；ElevenLabs/Descript 目录状态与其他 cluster 不变。Owner 后续仅需在独立 QA 可通过且完整清单存在时指定审核/批准生产动作；当前无需为日历等待或关系发布采取动作。
