# DIFF-07 只读收口与发布审计（2026-09-23）

状态：技术门禁与独立 QA 均 PASS；**未自动批准或发布任何关系**。这里的 PASS 表示只读验收完成，不表示内容可公开。生产快照
为 2026-09-23 15:42–15:46 UTC；发布前必须重新核对来源有效期并取得编辑批准。

## 技术与生产基线

- 生产只读校验：4 张 Capability 基础表可读；6 个 Task、12 个 Capability、12 条 Task Capability、7 条 Tool Capability、7
  条 Tool Task Fit，其中 3 条 fit 原已 published，本轮新增公开关系 0。
- 6 项专项测试、`tsc --noEmit` 与工作区 diff check 通过。复用 DIFF-06 已完成的一次完整 build 和部署后 SEO smoke：既有
  comparison 返回 200 且 noindex；sitemap 为 126 条、无 comparison URL。本次未重复 build/smoke。
- 23 条 reviewed 关系在检查时具备有效关系复核窗口；工具侧关联来源通过同 owner、verified、未冲突/失效与当前有效性检查。这
  只是技术候选池：开发侧的 `approve_candidate` 不等于编辑侧 `publish_ready`。

## 独立 QA 内容结论

| 范围                                 | 结论                         | 主要原因或待办                                                                                                                                                                                                                                                |
| ------------------------------------ | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 5 条 Task Capability                 | 可提交编辑逐条考虑，尚未批准 | `product-image-to-short-video / video-editing-and-export`；`meeting-notes / meeting-transcription`、`meeting-summary-and-actions`；`research-with-citations / research-discovery`、`citation-traceability`。Task Capability 按现有 schema 不要求 claim link。 |
| 其余 7 条 Task Capability            | hold                         | 理由重复任务/能力名称、过于笼统，或将内部审核流程误写成用户任务需要。先改成具体、可判断的任务理由，再复核。                                                                                                                                                   |
| 7 条 Tool Capability                 | 全部 hold                    | 均为 `partial`、可用范围 `unknown`，套餐要求与限制为空；当前字段未说明“部分支持”的边界。需补足有来源支撑的适用范围、套餐/限制。Luma 还须核对当前产品/模型身份并换用具体来源；部分其他关系也只有泛化首页来源。                                                 |
| 4 条 reviewed Tool Task Fit          | 全部 hold                    | Luma、Consensus、n8n、OpenRouter 的理由均为占位式编辑映射说明，适用条件与排除条件为空。须写出具体任务适配与限制，并重新核对来源。                                                                                                                             |
| 3 条既有 published meeting-notes fit | 保持现状；暂不作为新批准     | Fathom、Otter.ai、Fireflies 的当前证据与复核窗口有效，但 `reviewed_by` 为 NULL。现有 fit 发布触发器不要求该字段，因此不是技术失效；未来依赖这些 fit 开放 Task Page 前须确认历史编辑复核来源。                                                                 |

来源复核早于关系窗口：Fathom 的来源复查期限为 2026-10-01，Consensus 为 2026-10-02，Luma、n8n、OpenRouter 为
2026-10-05；Otter.ai、Fireflies 为 2026-10-20。编辑批准时须以当时的官方资料重新确认，不能仅看关系本身的 2026-12-22 期
限。审计不记录原始 claim 值、摘录、内部 ID 或密钥。

## 页面与下一步

所有 Task Page 继续关闭：静态编辑批准注册表为空，生产 Task Capability 均为 reviewed。`meeting-notes` 虽有 3 条既有
published fit，却只有 2 条 required、没有 preferred Task Capability；其他 Task 的 fit 数也不足 3。单条关系即使将来获批，
仍不能自动放开页面、加入 sitemap 或推断缺失关系。

优先修复 `meeting-notes` 组：先审阅两条可考虑的 Task Capability 理由；为 Fathom、Otter.ai、Fireflies 的 Tool Capability
补齐来源支撑的支持范围与套餐/限制；核实 3 条 legacy fit 的编辑 provenance。是否需要 preferred Capability 必须由真实任务
需求和编辑判断决定，禁止为凑页面门槛制造关系。修复后重新做独立内容 QA、来源时效检查和逐条编辑批准，另行评估 Task Page 注
册表放行。

DIFF-08 Decision Assistant 仍为**条件阻塞**：6 Task 的 published fit 覆盖、20 工具核心 Capability 覆
盖、required/preferred 完整性和低 unknown 比例等启动门槛均未由本次只读审计满足；不得因 DIFF-07 技术 PASS 提前启动。

## 2026-09-25 meeting-notes 整改准备（未执行）

手工脚本 `db/supabase/manual/20260925_remediate_meeting_notes_capabilities.sql` 已准备，**待生产执行与独立验收**。本节更新的是整改方案和开发侧来源核对，不改变上文 2026-09-23 的生产快照，也不表示关系已在生产发布。

- 范围严格限定为 `meeting-notes`、`meeting-transcription` / `meeting-summary-and-actions`，以及 Fathom、Otter.ai、Fireflies 的 3 条 Tool Capability 和原有 3 条 published fit。脚本以单条 `DO` 语句校验 reviewer、Task、Capability、tool/profile、原有 claim/link 身份和有效期；插入或刷新 6 条直接官方来源与 claim，补足 support、availability、plan、limitation 证据目的，最后做 postcondition。任一条件失败整段回滚；同一批次重跑不续写复核时间，过期须另起真实复核批次。
- 开发侧于 2026-09-25 核对 [Fathom Free/Premium](https://help.fathom.video/en/articles/5290881) 与[定价](https://fathom.video/pricing)：Free 有无限录制、存储及 38 种语言转录；高级摘要每月前 5 次，之后为 General/Enhanced；Premium 才有无限高级摘要、AI 行动项、跟进邮件和自定义摘要。
- 核对 [Otter Basic 限额](https://help.otter.ai/hc/en-us/articles/360047538094-Conversation-import-and-app-limits-on-the-Basic-free-plan) 与[会议摘要](https://help.otter.ai/hc/en-us/articles/9156381229079-Meeting-Summary-Overview)：Basic 每月 300 分钟、每次可访问 30 分钟转录、每账号累计 3 次导入、最近 25 场对话可见；会议摘要邮件有日历同步和共享条件。
- 核对 [Fireflies Free 指南](https://guide.fireflies.ai/articles/4027724828-learn-about-the-fireflies-free-plan) 与[定价](https://fireflies.ai/pricing)：Free 的无限转录依赖符合条件的 auto-join，普通默认 3 场；每席位 400 分钟存储，每月 20 个 AI 积分；上传和会议摘要消耗转录积分，下载转录及更多摘要能力受套餐限制。脚本保留这些条件，不将其写成无条件能力。
- 执行前，指定 reviewer 必须亲自复核以上页面与关系内容；脚本只在执行时记录当前 `reviewed_by/reviewed_at/review_due_at`，不回填或虚构 3 条 legacy fit 的历史 provenance。生产执行后仍须由独立验收回读精确行、证据链接、时间窗口及 Task Page 门禁。审批注册表、Task Page、URL、sitemap、`continue_index` 和工具索引状态均保持原状，DIFF-08 继续阻塞。
