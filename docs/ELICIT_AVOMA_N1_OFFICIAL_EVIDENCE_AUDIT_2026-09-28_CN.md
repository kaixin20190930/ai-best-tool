# N1 候选深审：Elicit 与 Avoma 官方证据审计

核查日：2026-09-28。范围：候选事实、证据缺口和下次门禁；未登录产品账户、未做实际准确率/结账测试，也未完成独立市场验证。两项结论均为 `HOLD_EVIDENCE`。本文件是候选发布包，不是公开内容、已验证 Evidence Ledger claim 或发布授权。来源均为产品方一手资料；价格、权益、隐私在发布 preflight 时必须再核。

## 生产身份与 URL 只读检查

以 `.env.local` 中生产连接对 `tools` 执行 `BEGIN READ ONLY`，匹配 `name/title` 中 `elicit|avoma` 及 `url` 中 `elicit.com|avoma.com`，随后 `ROLLBACK`：两项均 **0 条**。仓库内只有 Elicit 的 Guide/Category 指向 `/ai/elicit`，没有发现这两项工具实体或产品 alias。线上 `/ai/elicit`、`/cn/ai/elicit`、`/ai/avoma`、`/cn/ai/avoma` 均返回 200、自 canonical、`noindex, follow`，但 H1 都是 “This tool page is temporarily unavailable”；sitemap 中两项匹配为 0。它们是预留的不可用壳，**不是已发布工具**。下次 preflight 仍须重新查生产实体/别名/搜索意图，发现实体即改为更新或合并，禁止新建。

## Elicit：`HOLD_EVIDENCE`

**对象与存活信号。** Elicit 是面向论文检索、研究报告与系统综述的研究应用；[官方更新日志](https://support.elicit.com/en/articles/14823097-changelog)在 2026-09-17 仍记录 Library/Collection/Research Agent 更新，2026-09-01 记录协作能力更新。这证明产品方持续维护，**不能**替代产品级独立采用或结果准确率验证。其 Research Agent 的范围近来扩展到其他数据源，但本候选 `research-with-citations` 只评审文献发现、筛选、提取和引用回查，不泛化成“适用所有学术研究任务”。

| 核查项 | 官方可证事实与边界 |
| --- | --- |
| 论文发现 | [语料说明](https://support.elicit.com/en/articles/14758040-elicit-s-source-for-papers)：约 1.38 亿可检索论文，来源含 Semantic Scholar、OpenAlex、PubMed；Find Papers/Report/系统综述的源数据按周更新。收录记录不等于可读全文；无开放全文或机构权限时只能用题名/摘要。书籍、学位论文和非学术出版物不在其论文范围内，灰色文献及部分地区/学科可能漏检。 |
| 文献综述流程 | [系统综述指南](https://support.elicit.com/en/articles/14759154-systematic-reviews-in-elicit)：Gather → 题录/摘要筛选 → 可选全文筛选 → 数据提取 → 报告；支持语义和 Boolean 检索、导入 PDF/Library、准则人工编辑、逐篇理由和引文片段、人工覆盖。Pro/Scale/Enterprise 才有专用系统综述；Pro 每个 review 上限 5,000 篇，Scale 20,000，Enterprise 40,000。报告默认取筛入评分最高的 80 篇，Pro 可升至 135，Scale/Enterprise 200。不能称其自动穷尽某一领域或自动满足系统综述方法学。 |
| 全文与提取 | [全文筛选指南](https://support.elicit.com/en/articles/14759157-full-text-screening-in-elicit-systematic-reviews)说明缺全文时需浏览器扩展、机构访问或人工上传；[表格/图形提取说明](https://support.elicit.com/en/articles/14758168-extracting-data-from-a-table-or-figure-within-a-paper-in-column-answers)承认复杂表格可能失败。图形提取限 Scale/Enterprise，并需启用 Premium PDF parsing；后者增加用量。人工须复核单元格引用片段。 |
| 引用与导出 | [导出指南](https://support.elicit.com/en/articles/14758189-export-your-data-from-elicit)：Research Report 的 PDF/Word 导出适用于所有套餐；Find Papers/Paper Chat 表格导出为 Plus 及以上，系统综述的筛选/提取表导出为 Pro 及以上；表格可 CSV/Excel，部分来源可 RIS/BIB，Library 可 RIS。RIS/BIB 是供文献管理器生成引用格式，不证明引文内容准确。 |
| 免费/付费及 API | [定价页](https://elicit.com/pricing)证明 Basic 免费、搜索/摘要无数量限制，但 Agent/Report 使用量受限，专用系统综述和 API 在 Pro 及以上；Plus/Pro/Scale/Enterprise 权益不同。[用量说明](https://support.elicit.com/en/articles/15646622-usage-limits-in-elicit)改为跨 Agent、Report、系统综述共用月度用量池，工作复杂度影响消耗，Pro/Scale 可启用额外付费使用。定价页同一抓取文本含多组 Pro/Scale 金额及不同 billing 视图，**当前精确公开金额与各档月度额度为 `unknown`，不得选其中一组发布**。[API/MCP 指南](https://support.elicit.com/en/articles/14757404-use-elicit-via-mcp-server)列 Pro/Scale/Enterprise 可访问；[API 条款](https://elicit.com/operations/api-terms)要求不得提交个人数据、不得转售独立 API、不得用结果建立竞争语料库，API 用量与平台共享。 |
| 隐私/商业边界 | [上传论文隐私说明](https://support.elicit.com/en/articles/14758043-privacy-for-uploaded-papers)称上传 PDF 加密、仅账户可见、不进入公共论文语料；具体保留期限为 `unknown`。[API 条款](https://elicit.com/operations/api-terms)只在 API 范围声明输入默认不用于训练，允许在条款条件下将输出用于下游产品/商业目的，但底层第三方论文许可仍由使用方负责；**不得扩大成所有套餐/所有工作区的统一训练承诺**。 |
| 真实限制 | [官方限制说明](https://support.elicit.com/en/articles/14757928-elicit-s-limitations)承认摘要/提取可能误读数字或遗漏细节，也不能可靠判断研究方法质量；[语言说明](https://support.elicit.com/en/articles/14758084-languages-other-than-english)称英语优化，非英语质量不保证。 |

**Best for：**已有明确检索问题、需要可追踪筛选与抽取表、愿意逐篇核原文的研究团队。**Not ideal：**需要自动完成方法学质量判断、保证全量覆盖灰色/非英语文献、无权获取全文却要求全文提取，或要将含个人信息的材料送入 API 的工作流。

**Cluster 决策差异：**相对站内 Consensus 的“找论文并读带来源答案”锚点，Elicit 的可核实增量是专用综述的 Gather/筛选/抽取/导出审计链；这只是候选 Alternative 路线，不给两者同等系统综述或引文核验能力。现有 `research-discovery` 适合论文发现；`citation-traceability` 只可作为报告/单元格可回查的候选映射，不能自动写 Tool Capability/Fit。Constraint 应逐项记录全文许可、语料缺口、英语优先、按复杂度消耗的月度池、Pro 以上综述/API 与逐层导出权益。Evidence 应拆为语料/来源、筛选步骤、提取引用、套餐与导出、API 条款、隐私各条 candidate claim，附上述 URL、核查日和适用范围；冲突金额保持 `unknown`。

**进入下一门禁尚缺：**① 按 Academic/Industry、月付/年付实际可见视图核实金额与月度用量，并消除定价页重复文本歧义；② 两条可追溯且相互独立的产品级市场信号（至少一条强采用），原池 G2/Product Hunt URL 只是线索，本轮未核验；③ 真实素材授权、三语言编辑内容和八项准入逐项审核；④ 发布日再次查重与只读 preflight。只有这些完成后才可考虑 `READY_FOR_RELEASE_PREFLIGHT`，今天不发布。

## Avoma：`HOLD_EVIDENCE`

**对象与存活信号。** Avoma 是 AI Meeting Assistant 加可选 Conversation/Revenue Intelligence、Lead Router 的会议工作区。[2026 年 8 月官方产品更新](https://www.avoma.com/blog/avoma-insider-august-2026)记录跨数据源 Ask Avoma、CRM 回写等持续开发；这仅证明厂商活跃，不能把其“提高赢单率/配额”等营销数字写成验证结果。

| 核查项 | 官方可证事实与边界 |
| --- | --- |
| 记录与会议输出 | [定价/功能表](https://www.avoma.com/pricing)列自动录制、实时转录、AI 摘要、会议级 Ask Avoma 与后续邮件；支持 Zoom、Teams、Google Meet 等会议平台，机器人及本地无机器人录制路径均列出。官方功能存在不等于我们亲测转录质量。 |
| 跨会议检索/会话智能 | [Global Ask Avoma 指南](https://help.avoma.com/global-ask-avoma)说明跨会议、邮件、交易等问答须 Conversation Intelligence add-on；会议先被录制处理，邮件需单独同步，交易问题还需 CRM 与 Revenue Intelligence。基础套餐的单会议 Ask Avoma 不等于全局检索；会话评分、Smart Trackers、Revenue Intelligence 为不同附加模块。 |
| CRM 与工作流 | [Salesforce 设置指南](https://help.avoma.com/crm-sync-salesforce)、[HubSpot 设置指南](https://help.avoma.com/crm-sync-hubspot)证明可把笔记/字段映射到 CRM；需管理员授权、对象配置和对应 CRM 权限，Salesforce Enhanced Notes 是必要前置。[Salesforce 集成指南](https://help.avoma.com/integration-with-salesforce)说明私人会议笔记不自动同步，需手动触发。帮助页在“哪些套餐可连接 CRM”上存在旧 `Premium` 命名与当前 Startup/Organization 价目表冲突，**精确套餐资格为 `unknown`**；不能承诺所有席位即开即用。 |
| 席位与价格 | [席位指南](https://help.avoma.com/avoma-pricing-recorder-seats-free-users-add-ons)确认录制/转录本人会议需付费 Recorder seat；Viewers/Listeners/Collaborators 可免费读、评、分享但不能录制；所有录制席位同一基础套餐，附加模块按人分配且沿用基础套餐账期；14 天 Organization 试用无需信用卡。当前[定价页](https://www.avoma.com/pricing)显示 Startup `$19/录制席位/月`（年付）或 `$29`（月付），Conversation Intelligence 与 Revenue Intelligence 各 `$29`（年付）/`$35`（月付）每席位；Enterprise 显示 `$39` 年付且至少 10 个付费席位。Organization 定价页表格为 `$29` 年付/`$39` 月付，而[帮助页](https://help.avoma.com/what-do-i-get-in-the-organization-plan)写 `$39` 年付/`$49` 月付；**Organization 精确金额为 `unknown`，必须向可结账页面/厂商消歧**。试用后无付费席位转为 Viewer，不能继续录新会议。 |
| 权限、隐私、留存 | [会议隐私指南](https://help.avoma.com/meeting-privacy)列 Private/Primary Team/Organization/Public 四层；内部会议默认 Private、外部会议通常 Organization，Public 为持链接可见且非默认。基础价目表列一般隐私设置，Enterprise 列 team-specific controls、SSO、DPA 与 retention policies；可配置的具体留存期限、非 Enterprise 删除 SLA 为 `unknown`。[录制同意指南](https://help.avoma.com/recording-consent-compliance)列通知及同意设置，部分强制同意级别限特定套餐。[本地录制政策](https://help.avoma.com/consent-policy-for-local-recording-avoma-desktop-app)说明录音会加密传至 Avoma 服务器，使用者负责取得必需同意，Avoma 不代为核验；无机器人不等于本地不上传或免同意。[训练 FAQ](https://help.avoma.com/do-you-use-my-data-to-train-your-models)称不使用客户数据训练模型；合同级保障范围仍须采购时复核。 |
| 导出与平台 | [下载指南](https://help.avoma.com/downloading-a-meeting)列可下载视频/音频及 `.vtt`/`.txt` 字幕/转录，Host、Participant、Admin 或 Host 的 Manager 可操作；具体套餐限制为 `unknown`。定价页列日历与会议平台；[MCP 指南](https://help.avoma.com/getting-started-with-avoma-mcp-connector)表明有连接器及读写能力，具体套餐/权限需另核。 |

**Best for：**销售/客户成功或跨职能团队中，少数人录会、大量同事只读协作，且确需可配置隐私、CRM 笔记流和选购跨会议洞察的组织。**Not ideal：**只要个人免费录制、无需 CRM/附加洞察却要支付多人录制席位、不能确保与会者同意、或要求默认跨全部私人会议搜索的组织。

**Cluster 决策差异：**相对站内 Fathom、Otter.ai、Fireflies.ai 的会议摘要组合，Avoma 候选 Gap-filler 是“Recorder 与免费协作者分离 + CRM 管理员工作流 + 可选全局对话/收入洞察”的采购路径；不能把基础会议笔记宣称为完整 Revenue Intelligence，也不能把卖方 ROI 文案当比较结论。现有 `meeting-transcription` 与 `meeting-summary-and-actions` 可作候选 Capability；跨会议 Ask Avoma、CRM 字段回写只应记录为需附加模块/权限的 Constraint/Evidence，不借现有 Capability slug 强行注册。Evidence 候选 claim 应按录制入口、席位、附加模块、CRM 权限、会议隐私/默认值、同意责任、留存与下载拆开并标注套餐作用域。

**进入下一门禁尚缺：**① 消除 Organization 金额和 CRM 套餐资格的官方冲突，确认附加模块在实际结账中的总价；② 核实计划对应的保留/同意/导出设置，尤其 Enterprise 与基础套餐边界；③ 两条相互独立的产品级市场信号（至少一条强采用），原池 G2/Product Hunt URL 未在本轮核验；④ 素材授权、三语言决策内容和八项准入；⑤ 发布日重查生产实体与只读 preflight。完成前保持 `HOLD_EVIDENCE`，今天不发布。

## N1 治理结论

两项官方资料均足以界定差异化研究方向，且各有近期产品方维护信号；均缺独立市场验证，并有影响公开购买建议的官方权益/金额冲突。候选台账 readiness 改为 `HOLD_EVIDENCE`，仅为“官方深审完成、待补证据”，不写生产、不创建关系、不改现有页面/索引/自动化。下次复核建议 2026-10-05，或在厂商消歧及独立市场信号到齐时提前复核。
