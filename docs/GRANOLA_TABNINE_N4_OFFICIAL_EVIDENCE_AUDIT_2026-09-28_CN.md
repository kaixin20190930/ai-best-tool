# N4 候选深审：Granola 与 Tabnine 官方证据审计

核查日：2026-09-28。两项结论均为 `HOLD_EVIDENCE`。本包只记录官方一手资料与编辑候选判断；未登录账户、实际录会/运行 IDE agent、结账或验证独立产品级市场采用。官方能力、质量和采用宣传均不作实测结果。未来发布 preflight 须重核价格、权益、数据条款和身份。本轮不授权生产实体、Decision Graph、页面或索引写入。

## 生产身份、别名与 URL 只读检查

以 `.env.local` 生产连接在 `BEGIN READ ONLY` 事务中查询 `tools`，随后 `ROLLBACK`：共 **67** 条；`name/title/url` 对 `granola|tabnine|codota` 匹配 **0**，宽泛对照命中既有 Cursor、Fathom、Fireflies.ai、Otter.ai。`lib/config/toolRouteAliases.ts` 无这三项别名；候选 JSON 中的 slug 只属预审快照，不是生产实体。Tabnine 历史 Codota 名称尤其需要在发布日重查，不能把代码助手合并到 Cursor。

线上 `/ai/granola`、`/cn/ai/granola`、`/ai/granola-ai`、`/cn/ai/granola-ai`、`/ai/tabnine`、`/cn/ai/tabnine`、`/ai/codota`、`/cn/ai/codota` 均为 `200 + self-canonical + noindex, follow`，H1 是 “This tool page is temporarily unavailable”；sitemap 中 `granola|tabnine|codota` 匹配 **0**。这是动态不可用壳，不是已发布实体或多个 slug 的占用许可。正式 preflight 须再查生产 name/slug/域名、alias、Guide/Comparison 意图和唯一 canonical；若已有同产品实体，改为事实更新/合并，禁止新建。

## Granola：`HOLD_EVIDENCE`

**身份与维护。** Granola 是用户在设备上启动的无入会 bot AI 会议记事工具，不是自动加入、录制并回放所有会议的机器人或完整销售智能平台。[转录说明](https://docs.granola.ai/help-center/taking-notes/transcription)和[产品入门](https://docs.granola.ai/help-center/getting-started/granola-101)界定设备音频、个人笔记、团队空间与会后 Chat；[当前定价页](https://www.granola.ai/pricing)和已更新的 [API 文档](https://docs.granola.ai/help-center/sharing/integrations/granola-api)构成官方维护信号，不证明产品效果或独立采用。

| 核查项 | 官方可证事实与边界 |
| --- | --- |
| 采集与音频路径 | [转录说明](https://docs.granola.ai/help-center/taking-notes/transcription)要求用户打开会议 note 或新 note；macOS/Windows 桌面与 iOS/Android 移动应用可转录，网页仅看/编辑既有 note。桌面抓系统与麦克风的**混合音频**，送给转录服务商；不能按应用隔离，可能收进无关音频，ad-hoc 会后应手动停止。桌面实时转录，手机会暂存音频后转录；[安全页](https://www.granola.ai/security)及[数据 FAQ](https://docs.granola.ai/help-center/consent-security-privacy/security-privacy-data-faqs)称不保留音频录制，但保留转录/笔记。不能写成“全部本地处理”或“无云端数据”；不支持上传既有 MP3 来转录，也无可供回放的录音。 |
| 会议告知与同意 | [数据 FAQ](https://docs.granola.ai/help-center/consent-security-privacy/security-privacy-data-faqs)要求使用者在需要时取得与会者同意；无 bot 意味其他人不会看到新与会者。[透明功能](https://docs.granola.ai/help-center/consent-security-privacy/transparency-solutions/introduction)提供会议聊天提示和视频水印，可由个人开启，Enterprise 可由管理员统一执行；具体平台/设置适用性要按真实会议测试。提示不等于已经取得同意。 |
| 笔记、跨会议与协作 | [自写笔记](https://docs.granola.ai/help-center/taking-notes/taking-notes-in-granola)可引导 AI 增强，也可留空由转录生成；[增强说明](https://docs.granola.ai/help-center/taking-notes/ai-enhanced-notes)列转录、手写内容与日历作输入。[Chat 文档](https://docs.granola.ai/help-center/getting-more-from-your-notes/chatting-with-your-meetings)允许在本人可访问的单会、所选会议、文件夹或历史中提问，Basic 只覆盖最近 30 天，Business/Enterprise 覆盖完整历史。[分享 FAQ](https://docs.granola.ai/help-center/consent-security-privacy/security-privacy-data-faqs)称笔记默认私有，Team space/共享文件夹才扩大可见范围；不能推成默认跨全组织检索。 |
| 免费与付费 | [现行定价页](https://www.granola.ai/pricing)列 Basic `$0`、不限制会议笔记数量但应用内历史仅 30 天，含跨会议 Chat 的 Auto 模式及共享文件夹；Business `$14/用户/月`，完整历史、高级模型选择、Attio/Notion/HubSpot/Affinity/Zapier、MCP/API；Enterprise `$35/用户/月`，SSO、统一管理、使用分析、组织级提示与留存/训练控制。旧[厂商价格博客](https://www.granola.ai/blog/granola-pricing-plans-features-roi)曾称 API 需 Enterprise，与现行定价及[现行 API 文档](https://docs.granola.ai/help-center/sharing/integrations/granola-api)的 Business/Enterprise 不一致；以实时专项文档记候选事实，真实账户仍须核。页面未清楚说明税费、地区/实际结账账期，均为 `unknown`。 |
| 集成、API 与导出 | [集成目录](https://www.granola.ai/integrations)区分原生与经 Zapier 的第三方流转；不能把 Zapier 可到达的应用当作原生连接。[API 文档](https://docs.granola.ai/help-center/sharing/integrations/granola-api)要求 Business/Enterprise key，有个人/公共 note scope；工作区 key 只读明确公开或允许 API 的空间，不可读未分享的私人 note，25 次 burst、持续 5 次/秒，无 sandbox；webhook 同属付费。[CSV 导出](https://docs.granola.ai/help-center/sharing/exporting-notes)包括本人拥有且有摘要的历史 note/转录，Basic 中超过 30 天但 UI 不可见的 note 也可导出；已删除/无摘要 note 不在内，24 小时内只能生成一次。 |
| 训练、保留与企业控制 | [模型训练](https://docs.granola.ai/help-center/consent-security-privacy/model-training)称第三方模型服务商不得用用户数据训练；Basic/Business 默认可能用匿名化数据改进 Granola，自行 opt-out，Enterprise 默认 opt-out 且可组织管控；历史使用不能倒推撤回。[数据 FAQ](https://docs.granola.ai/help-center/consent-security-privacy/security-privacy-data-faqs)称无策略时转录和 note 可无限期保留。[自动删除](https://docs.granola.ai/help-center/consent-security-privacy/transcript-auto-deletion)允许个人选择 1 天至 1 年，Enterprise 组织策略需联系厂商；**只删转录，笔记仍留**，且会限制重生成与 Chat。特定租户实际保存地、合同删除 SLA 与各模型例外为 `unknown`，不把“无音频保留”推广为“零数据保留”。 |

**Best for：**愿意主动开启并告知会议转录、边听边写个人笔记、希望把笔记与转录合成摘要，并在自己可访问的会议/团队文件夹里回查的小团队。**Not ideal：**必须让服务自动以 bot 入会、需要录音回放或导入历史音频、要求所有处理都在本地、不能取得必要同意，或需要默认搜索全公司私人会议的组织。

**Cluster 决策差异与映射建议：**在 `meeting-notes` 内，Granola 的候选 Gap-filler 是**设备侧主动采集 + 用户写的笔记引导增强 + 无 bot**。它与既有 Fathom/Otter.ai/Fireflies.ai 及 Read AI 的录会、回放或跨连接源搜索应按实际权限和保留分别比较；与 Avoma 的销售 CRM/洞察套餐不同。现有 `meeting-transcription`、`meeting-summary-and-actions` 仅作候选 Capability，质量与适用性未实测。Constraint 应拆成同意/透明模式、混合设备音频与手动停止、无录音回放/上传、Basic 30 天可见/Chat 历史、共享范围、API scope/费率、匿名化训练 opt-out、转录/笔记不同留存；Evidence claim 每条附对应来源、套餐和核查日期。

**进入下一门禁尚缺：**① 真实 macOS/Windows/移动会议验证提示、收音与误采集/停止，核账号导出、API scope 和账单；② 合同核具体服务商/地域、音频缓存删除、转录与笔记留存及 org 策略；③ 两条相互独立的 **Granola 产品级**市场信号，至少一条强采用（原池独立 URL 仍只是线索）；④ 代表性摘要质量、素材授权、三语言内容、八项准入和发布日查重。当前 `HOLD_EVIDENCE`。

## Tabnine：`HOLD_EVIDENCE`

**身份与维护。** [Tricentis 2026-07-30 收购公告](https://www.tricentis.com/news/tricentis-acquires-tabnine)确认收购 Tabnine 并整合其 Context Engine；这不等于当前 Tabnine IDE 产品已停止或未来合同/路线确定。[2026-09-28 发布说明](https://docs.tabnine.com/main/administering-tabnine/release-notes)仍更新 CLI、IDE agent 和插件，是维护信号。**重要页面迁移：**本日直访 `tabnine.com/pricing/` 与 `/headless-agent-pricing/` 均跳转 Tricentis 联系页，旧收购博客跳转 Tricentis Learn；搜索缓存中仍有旧页面内容，不能据此声明现行价格/权益。收购后长期 SKU、品牌、支持与报价均为 `unknown`，不能沿用 2024 年 Basic/Pro 套餐。

| 核查项 | 官方可证事实与边界 |
| --- | --- |
| 当前能力 | [官方 Agent 指南](https://docs.tabnine.com/main/getting-started/tabnine-agent/how-to-use-tabnine-agent)列读/改文件、运行命令及 `/code-review` 等工作流；[Git 集成](https://docs.tabnine.com/main/getting-started/tabnine-cli/git-integrations)列 PR/MR 的 headless 审查、测试/文档任务；[发布说明](https://docs.tabnine.com/main/administering-tabnine/release-notes)继续记录 IDE/CLI 插件。旧定价页缓存将 Code Assistant 定义为补全和 Chat、Agentic 为另一个层级，但**实时页面已跳转**，当前 SKU 权益须重核。功能存在不等于能独立完成、测试并部署完整应用，或各 IDE/套餐都具同样 agent/review 权益。 |
| IDE 与语言 | [当前 IDE 矩阵](https://docs.tabnine.com/main/welcome/readme/supported-ides)列 VS Code、JetBrains 家族、Eclipse、Visual Studio 2022/2026 及最低版本；具体 OS/版本必须按表核。[语言说明](https://docs.tabnine.com/main/welcome/readme/supported-languages)称第三方 LLM 覆盖 600+ 语言/库/框架，**不是每种语言的每项能力相同**；私有安装可连/微调自己的模型。旧博客所列 NeoVim 或历史插件不应替代当前矩阵。 |
| 套餐与额外成本 | 搜索缓存里的[旧 Code Assistant/Agentic 定价 URL](https://www.tabnine.com/pricing/)仍展示年订阅 `$39/$59/用户/月`、自备模型与 Tabnine 提供模型的不同成本；[旧 Headless 定价 URL](https://www.tabnine.com/headless-agent-pricing/)缓存显示 `$1,200/$5,000/月` 的容量层级。但 2026-09-28 实时直访两页均跳转到 Tricentis 联系页，**这些数字不是可确认的现行报价**。当前价格、免费层、试用时长、最低席位、模型附加费、CI 许可、处理容量/超额与税费全部 `unknown`；不得引用 2024 年 `$12 Pro`、90 天试用或免费 Basic 作为当前权益。 |
| 私有代码与部署 | [隐私文档](https://docs.tabnine.com/main/welcome/readme/privacy)说明推理请求会发送周边代码、相关文件/错误与 Chat 历史作 context，声称 no-train/no-retain，推理后删除代码；Repo/RAG 个性化需要服务端处理索引，运维指标/客户端遥测仍有保留。[部署选项](https://docs.tabnine.com/main/welcome/readme/architecture/deployment-options)列 SaaS、VPC、on-prem、可 air-gap；实际部署硬件、模型路由、第三方模型处理协议、日志与代码来源证明须按配置/合同核，不能概括为“全部代码从不离开设备”。 |
| 权限、API 与导出 | [团队管理](https://docs.tabnine.com/main/administering-tabnine/private-installation/managing-your-team/tabnine-teams)可按团队控制 Agent 与 Code Review；[PAT 文档](https://docs.tabnine.com/main/administering-tabnine/managing-your-team/settings/access-tokens)支持脚本、内部 API 与 CLI 非交互认证；[Git 集成](https://docs.tabnine.com/main/getting-started/tabnine-cli/git-integrations)的 CI 使用需 Agent 权益，部分集成文档要求另联系销售确认席位许可证。没有证据支持把 PAT 说成面向任意外部开发者的通用代码生成 API。源码产物可留在开发者仓库；可移植的组织 Context Engine 索引/审计日志完整导出格式、统一 SLA 为 `unknown`。 |

**Best for：**已有 IDE、仓库与安全治理流程，需要代码补全/Chat/Agent、按组织管理模型和代码上下文，并评估私有云或本地部署的开发团队。**Not ideal：**只想免费个人补全、要求已证明的端到端应用交付、无法采购企业席位/模型容量，或需零云端/零遥测但尚未核合同与部署配置的团队。

**Cluster 决策差异与映射建议：**Tabnine 对既有 Cursor 的候选差异在**保留原 IDE 的插件工作流、部署选择与企业权限**，不是“能生成完整应用”的已证替代。`build-app-with-ai` 主要输出仍是完整应用；Tabnine 是否符合该 primary Task 与 `ai-assisted-app-development` Capability 均为 `unknown`，暂不建立 Fit，优先把 secondary 开发助手作为未注册编辑 Cluster。Constraint 拆为 IDE/版本、Code Assistant 对 Agentic/Headless 权益、模型额外费、VPC/on-prem 硬件和数据路径、团队权限/CI 许可证、收购后的支持连续性；Evidence claim 按当前套餐、官方文档、隐私/部署、发布说明逐项限定。

**进入下一门禁尚缺：**① 官方/销售确认收购后 SKU、试用、席位与 CI/headless 许可证、模型费及支持路线；② 用目标 IDE/语言/部署实测 agent/review 和完整应用任务，取得代码数据路径、RAG/遥测/第三方模型合同；③ 两条相互独立的 **Tabnine 当前产品级**市场信号，至少一条强采用，不能沿用旧版用户量或借 Tricentis 品牌；④ 定位是否可纳入 `build-app-with-ai`，连同素材、三语言内容、八项准入和发布日查重。当前 `HOLD_EVIDENCE`。

## N4 治理结论

Granola 已能界定无 bot 采集、笔记/团队空间、跨会议 Chat 与免费/付费边界，但真实同意流程、服务商/留存配置和独立采用未核；Tabnine 当前能力与维护可证，但定价页实时跳转使现行价格/权益为 `unknown`，收购后的商业连续性、私有部署数据路径和完整应用 Task 适配也未核。两项均不能凭官方证据替代独立市场验证，因此保持 `HOLD_EVIDENCE`，未进入 `READY_FOR_RELEASE_PREFLIGHT`。建议 2026-10-05 或关键合同/市场证据到齐时复核。没有新实体发布或关系、页面、sitemap、index、数据库、自动化、push、deploy 写入。
