# CL-06 · `brand-constrained-marketing-content` 字段级编辑候选与 HOLD

状态：**两条 Task rationale 为 `publishable` 编辑候选；Jasper 与 Grammarly 为 `conditional`，Claude 为 `contextual`；生产关系 HOLD、未创建或发布**（2026-09-27）。这些词是逐项编辑判断，不是数据库枚举或发布批准。本文不是生产 manifest、evidence intake、管理员批准或 Task Page 审批。

## 1. Task 定义与生产只读基线

现有 Task 的交付物是 `marketing_draft`，`constraint_schema` 要求品牌指引和人工审核。`brand-guided-content-generation` 是 `required`，指基于**有权使用的、明确提供的**品牌资料起草营销文案；`brand-controls-and-style-guidance` 是 `preferred`，指对语气、术语、政策和审批要求提供可检查的指导。`preferred` 是现有能力权重，**不取消** Task 的 `requiresReview=true`；发布前的品牌/事实/权利审批仍由团队承担。营销内容生成、模板和任意提示词本身不能证明品牌治理。

2026-09-27T12:49:36Z 运行 `scripts/verify-decision-cl06-brand-readonly.ts`。Neon 在 `BEGIN READ ONLY` 事务中查询，Supabase 仅 select，生产写入为 0。

| 实体 | 精确 ID / 状态 | 基线 |
| --- | --- | --- |
| Task | `532b3a97-a6ec-40f7-a906-0d200ff11ffb` / active | 描述只提人工审核；`output=marketing_draft`、`needsBrandGuidance=true`、`requiresReview=true`。 |
| required Task Capability | `41276fad-9e3e-4c06-acea-de5b182aca9f` / reviewed | 原理由为“任务从品牌引导的内容起草开始”，缺可判断的输入/交付标准。 |
| preferred Task Capability | `aa39a14e-ed51-4934-bb58-39621c290875` / reviewed | 原理由仅说约束需要编辑审核，未说明产品可辅助检查的部分与人审边界。 |
| Jasper | Neon `5a0c7e91-9a5c-4f84-923a-d8345edaa918` / published | 无 intelligence profile。 |
| Grammarly | Neon `4d0bbf38-6b7e-4c44-8e25-9fe73f60bb18` / published | 无 intelligence profile。 |
| Claude | Neon `149cf3e0-5f5c-4bdf-ac02-80ec5064fb92` / published | 旧 profile `41fc0131-208b-4f21-aa2e-2fde160b1232` 为 `conflict`；3 条通用 source、16 条通用/价格 claim，非本 Task 证据。目录 URL `claude.ai`，profile canonical domain 为 `anthropic.com`，正式 intake 前须解决身份/域映射。 |

此 Task 的 Fit 数为 0；三工具对两条 Brand Capability 的 Tool Capability 数为 0。因而不存在本组 Tool `support/availability/plan/limitation` 或 Fit `fit/limitation` claim links。Claude 的旧 verified 产品名称 claim 不能抵消 profile conflict，也不能证明品牌功能。线上 Task Page 与 sitemap 的只读门禁见第 5 节。

## 2. 当前官方直接证据与逐工具资格

### Jasper — `conditional`

- **品牌资料与生成：** [Brand Voice](https://help.jasper.ai/hc/en-us/articles/18618693085339-Brand-Voice)支持从写作样本建立语气并在 Chat、编辑器和 Agents 使用；[Knowledge Base](https://help.jasper.ai/hc/en-us/articles/18618707176347-Knowledge-Base)保存品牌/产品资料，但 Chat/Agent 单次最多可附五项知识或来源资料，URL 知识可使用最多两天的缓存。Brand Voice 的 workspace 默认可由用户改选，不能解释为强制锁定。[Product IQ](https://help.jasper.ai/hc/en-us/articles/54277698302875-Product-IQ)可存产品规格、获批措辞及免责声明，仍须核查生成结果。
- **规则与范围：** [Style Guide](https://help.jasper.ai/hc/en-us/articles/25925092890011-Style-Guide)直接说明 Business 的具体术语/大小写/标点规则在生成时应用于 Chat、Apps、Canvas 和 Public API，单次仅一个活动 guide，可设 workspace 或 Canvas project 默认。自动抽取品牌文档处于 beta，官方要求人工复核抽取结果。[Permission Settings](https://help.jasper.ai/hc/en-us/articles/34717759798683-Permission-Settings)允许 Business 管理员限制谁能编辑 Brand Voice、Knowledge、Style Guide；[Groups](https://help.jasper.ai/hc/en-us/articles/28271057112859-Groups)提供 Business 私有组范围。这是配置治理，不等于营销稿存在不可绕过的发布审批门。
- **套餐/API/导出：** Brand Voice 页写 Pro 两个声音、Business 无限；Knowledge 页写 Pro 五项、Business 无限，Product IQ 页写 Pro 最多 25 个产品、Business 无限；但 [Jasper IQ 总览](https://help.jasper.ai/hc/en-us/articles/18618654325787-Jasper-IQ)又写 IQ 仅 Business，**官方套餐表述有冲突**。Style Guide 和 [Public API](https://help.jasper.ai/hc/en-us/articles/18618701173659-Jasper-s-API)明确为 Business；[Credits-Based Pricing](https://help.jasper.ai/hc/en-us/articles/46644376016923-Credits-Based-Pricing)说明 API、Grid 等消耗共享 credits。[Export Content](https://help.jasper.ai/hc/en-us/articles/18618604425883-Export-Content)支持本地 `.docx/.pdf/.txt/.md`，外部集成须管理员启用。不要把导出能力推断成审批通过。
- **审批边界：** [Grid](https://help.jasper.ai/hc/en-us/articles/46746641765787-Jasper-Grid)有内容单元审阅、品牌检查及导出，并使用“简化审批流程”措辞，但该页没有证明所有营销稿都须经过不可跳过的审批状态或阻断发布。Grid 属 Business、按申请开放且部分运行耗 credits。正式 claim 只能写其明确的 review/配置功能，不能写“强制审批”。
- **保留：** [删除与恢复资产](https://help.jasper.ai/hc/en-us/articles/30673027481499-Deleting-and-Restoring-Assets)说明已删除 Project/Asset 在回收区 30 天后永久删除；[Data Deletion](https://help.jasper.ai/hc/en-us/articles/40166990052379-Data-Deletion)说明整个 workspace 删除须由 Admin 请求。此信息不足以推断未删除品牌知识/生成稿的统一自动保留期限；敏感品牌资料的合同/工作区策略须另核。

Jasper 在已配置正确品牌资料、Business Style Guide 且人工品牌审稿的文本营销稿上适配较强，仍为 `conditional`。独立内容 QA 需先解决 Pro/Business IQ 范围冲突和具体账号权限；不得将生成时 style rule 描述扩大为所有政策均被强制执行。

### Grammarly — `conditional`

- **可核对的品牌指导：** [Brand tones](https://support.grammarly.com/hc/en-us/articles/4403544890253-Set-brand-tones)可按组织/组设置 on-brand、off-brand 语气并给写作者实时反馈；[Create style rules](https://support.grammarly.com/hc/en-us/articles/360043832652-Create-style-rules)可针对品牌术语、拼写与格式建立规则，按组或全组织分配并跟踪 viewed/accepted/dismissed。后者明示 Pro 一个规则集、Business 最多 50 个；Enterprise 可用自定义管理角色。用户审阅建议时可接受或忽略（[Editor guide](https://support.grammarly.com/hc/en-us/articles/360003474732-Grammarly-Editor-user-guide)）。所以这是**可检查的提示**，并非自动强制执行品牌政策或审批。
- **起草、作用面与交付：** [Business Style Guide](https://www.grammarly.com/business/styleguide)说生成式 AI 可起草文本，也展示 brand tones/style guide；这并未直接证明 AI 初稿自动附上组织规则。个人 [voice profile](https://support.grammarly.com/hc/en-us/articles/23153676821773-View-and-customize-your-voice-profile)只在用户主动选“Rewrite in my voice”时应用，不能当作组织品牌语调。Style guide 在浏览器扩展/桌面使用，不支持移动端；[Editor 下载说明](https://support.grammarly.com/hc/en-us/articles/115000091352-Create-upload-and-download-your-documents)支持本地文档下载，但格式随原上传文件变化，不能推断 CMS 发布/API 工作流。
- **数据边界：** [Product Improvement and Training Control](https://support.grammarly.com/hc/en-us/articles/25555503115277-Product-Improvement-and-Training-Control)说明 Enterprise 和经 Sales 购买的 Pro/Business 默认关闭内容训练用途；其他账号必须核对设置，不能笼统声称“所有方案都不用于训练”。[Privacy FAQs](https://support.grammarly.com/hc/en-us/articles/20916119474829-Privacy-and-security-FAQs)说明 Editor 文档保留至用户删除或合同终止/到期后请求删除；不能将此推广为所有文本均采用同一保留期限。

Grammarly 对**人工起草/编辑中的品牌规则提示**是 `conditional`，对“初稿自动由组织品牌资料约束”没有足够直接证据。不能用其泛化生成能力填满 required Capability；若无法证实该工作流，相关 Tool Capability 不建。没有官方证据表明它提供跨渠道、不可绕过的营销内容审批门。

### Claude — `contextual`

[Projects](https://support.claude.com/en/articles/9519177-how-can-i-create-and-manage-projects)允许上传品牌资料和设 project instructions，作用于该 project 的聊天；Free 最多五个 project，Team/Enterprise 可分享并授予 view/edit 权限。[Organization instructions](https://support.claude.com/en/articles/14546867-set-organization-instructions)仅 Team/Enterprise 的 Owner/Primary Owner 可设置，作用于组织对话且优先于用户指令，但官方明确为**prompt 层优先级**，冲突时可能变化，须测试，变更也可能一小时后生效。它不是专用的品牌规则集、品牌审核记录或发布阻断。Claude 的 [Artifacts](https://support.claude.com/en/articles/17153992-what-are-artifacts-and-how-do-i-use-them)可导出 Docs 为 Word/PDF/Markdown/Google Docs；模板和导出不能证明品牌遵循。[Claude 订阅/API 说明](https://support.claude.com/en/articles/9876003-i-have-a-paid-claude-subscription-pro-max-team-or-enterprise-plans-why-do-i-have-to-pay-separately-to-use-the-claude-api-and-console)明确订阅不含 Console API。[Enterprise retention](https://support.claude.com/en/articles/10440198-configure-custom-data-retention-controls-for-enterprise-plans)可设保留期，但 project 默认可无限期保留，品牌资料上传前需按组织策略核对。

这些资料证明它可在指定 project 里**参考**品牌资料起草文本。就本 Task 的品牌治理适配，Claude 为 `contextual`，不提 Tool Capability/Fit 可写候选；现有 profile conflict 也是独立阻断项。不能把“project instructions”、“组织提示优先级”或新的设计模板推断成强制品牌政策执行。

## 3. 字段级编辑候选（均未写生产）

| 既有字段 | 候选值 / 判断 | 处置 |
| --- | --- | --- |
| Task `description.en` / `.cn` | `Draft marketing copy from authorized brand guidance, then check tone, terminology, factual claims, and required approvals before use.` / `依据有权使用的品牌指引起草营销文案，并在使用前核对语气、术语、事实陈述及所需审批。` | 保持 `constraint_schema` 不变；仅候选。 |
| required Task Capability `rationale.en` / `.cn` | `The draft must use the supplied brand voice, product facts, and approved messaging as inputs so an editor can compare it with the brand brief before delivery.` / `草稿须以提供的品牌语调、产品事实和获批信息为输入，使编辑能在交付前对照品牌简报核查。` | `publishable` 编辑候选；`importance=required`、`status=reviewed` 暂保持。理由不宣称模型保证一致。 |
| preferred Task Capability `rationale.en` / `.cn` | `Style and terminology guidance helps reviewers find deviations from the brand brief; policy claims and approval decisions still require an authorized human review before release.` / `风格和术语指引帮助审稿人发现与品牌简报的偏差；政策性陈述及批准决定仍须在发布前由授权人员审核。` | `publishable` 编辑候选；`importance=preferred`、`status=reviewed` 暂保持。 |

下表是未来关系的**字段语义候选**，不是可执行行清单。新行 ID、reviewer、review window、profile/source/claim/link 尚未齐备，不生成 manifest。`unknown / HOLD` 表示不得靠默认值创建 reviewed 关系后发布。

| 工具 → Capability | `support_level` 候选 | `availability` 候选 | `plan_requirement` 候选 | `limitations` 候选 |
| --- | --- | --- | --- | --- |
| Jasper → `brand-guided-content-generation` | `strong` | `unknown / HOLD` | EN/CN：须确认当前合同中的 Brand Voice、Knowledge/Product IQ、可见范围及额度；Pro/Business 官方 IQ 文档冲突先消解。 | EN/CN：品牌资料需要维护；Chat/Agent 单次知识源最多五项，URL 源可能最多两天缓存；默认 Voice 可被用户改选；输出须核对产品事实。 |
| Jasper → `brand-controls-and-style-guidance` | `partial` | `paid_only`（Business 工作流，仍 HOLD） | EN/CN：Business Style Guide；若用 Public API 或 Grid，分别确认 Business 访问、Grid 开通及 credits；管理员设置 workspace/project 范围与编辑权限。 | EN/CN：一次仅一个 guide；文档自动抽取处于 beta 且须复核；生成时应用规则不是不可绕过的政策/发布审批。 |
| Grammarly → `brand-guided-content-generation` | `partial` | `unknown / HOLD` | EN/CN：确认目标订阅、AI 起草入口与组织 brand tones/style rules 是否共同作用于该入口；不能由个人 voice profile 代替。 | EN/CN：组织规则对 AI 初稿的自动应用尚无直接证据；仅提示词或模板不足以达到此 Task 的 required 品牌引导。 |
| Grammarly → `brand-controls-and-style-guidance` | `partial` | `paid_only`（Pro/Plus/Business/Enterprise，仍 HOLD） | EN/CN：Pro 一个 style rule set；Business 最多 50 个；Plus/Enterprise 与团队管理权限按实际合同核对；确认成员组分配、启用状态与使用的桌面/浏览器表面。 | EN/CN：规则和语调给可接受/忽略的建议；不覆盖移动端，部分网站可被排除；不保证政策合规或强制审批。 |
| Claude → 两条 Brand Capability | 无可写值；`contextual` | 无可写值 | 仅保留 project/organization instructions 的研究线索。 | 现有 profile `conflict`，并缺专用品牌规则/审批的直接证据；不得创建关系。 |

| 候选 Fit 字段 | Jasper (`conditional`) | Grammarly (`conditional`) | Claude (`contextual`) |
| --- | --- | --- | --- |
| `fit_level` | `conditional` | `conditional` | 不提可写值。 |
| `rationale.en` / `.cn` | `Use Jasper for marketing drafts when the workspace has the relevant Brand Voice, approved product knowledge, and Business Style Guide configured, with a human reviewing brand and factual claims before release.` / `工作区已配置相关 Brand Voice、获批产品知识及 Business Style Guide，且有人在发布前审查品牌与事实陈述时，可用 Jasper 起草营销文案。` | `Use Grammarly to review and revise marketing copy against assigned brand tones and style rules while an editor makes the final brand and approval decisions.` / `编辑依据已分配的品牌语调和风格规则审查、修改营销文案，并负责最终品牌判断及审批时，可用 Grammarly 辅助。` | 不提可写值。 |
| `required_conditions` | 有权上传品牌资料；核对实际合同/IQ、选中正确 workspace/project、声音/guide 与知识可见性；确认 credits、导出目标；授权审稿人核事实与品牌并批准。 | 有权处理品牌文案；确认所选付费档功能、规则集与组/网站分配；在支持的桌面/浏览器表面逐条审阅建议；由授权人员批准成稿。 | 不建 Fit。 |
| `disqualifiers` | 要求不可绕过的自动政策/审批门；品牌资料不能上传；需同时强制多个 guide；套餐/合同无相应 IQ 或 Grid/API 功能。 | 要求 AI 初稿自动遵循组织品牌规则但无法验证；要求自动强制政策/批准；仅移动端或规则不可用；不能接受人审。 | 不建 Fit。 |

Grammarly 的 Fit 候选只适用于**已有草稿的品牌审阅/修改**。若独立 QA 认定 Task 的 required 起草能力必须由同一工具直接完成并受品牌资料约束，Grammarly 在本 Task 下应从候选撤出，不能靠 Fit 条件掩盖 required 缺口。Jasper 的 Business Style Guide 是生成时指导，亦不能替代人工批准。上述适配均是依据官方功能与 Task 定义作出的编辑推断，非厂商对特定成稿的保证。

## 4. Evidence 目的、缺口与发布建议

正式 intake 前，Jasper/Grammarly 须各有本工具 owner 的 profile 和官方功能、套餐、限制 source；Claude 须先解决 `conflict` 和域/身份映射，不能复用通用首页 claim。每条 Tool Capability 分别要有 current、verified、同 owner 的 `support`（具体品牌功能）、`availability`（该功能的产品表面和方案）、`plan`（限额/合同/API）、`limitation`（可绕过、覆盖、缓存或审阅边界）link。Fit 另要 `fit`（实际营销流程）与 `limitation` link。官方网页可以支持明确 claim，但不能自动成为已核验的生产 evidence。需要记录核验人、复查窗口和字段映射；套餐矛盾需官方当前合同或明确功能矩阵消解，不得以泛化价格页补齐。

**HOLD：** 两条 Task rationale 可进入独立编辑 QA，但生产仍为 reviewed。Jasper/Grammarly 仅保留 conditional 字段候选，Claude 只保留 contextual 研究线索；不创建 Tool Capability/Fit，不发布 CL-01 事务，不生成生产 manifest。Jasper IQ 套餐冲突、Grammarly 组织规则与生成入口的关联、不可绕过审批证据缺失，以及所有候选的同 owner verified/current claim/link 缺口均需先处理。只有两条 conditional Fit 且尚未创建，Task Page 的至少三条真实 published fit 门槛未满足；继续 404，不改 sitemap、metadata 或索引。

**只读回读：** `pnpm exec tsx scripts/verify-decision-cl06-brand-readonly.ts` 固定 Task/Capability/工具 ID 与 reviewed/零关系基线，并断言 Claude 旧 profile conflict。若数据变化，应先审计差异，再维护 verifier，不静默放宽。未来若误发布，用 CL-01 精确 Task 清单撤回目标关系并回查非目标行；页面隐藏不能代替数据撤回。

## 5. 本地验证记录

- 2026-09-27 只读生产 verifier 与 CL-06 专项测试通过。`test:decision-capability-foundation`、`test:decision-capability-read-model`、`test:decision-capability-admin`、`test:decision-review-gate`、`test:decision-task-page`、`test:decision-evidence`、`test:decision-graph-seed`、`test:decision-seo-release` 全部通过；`tsc --noEmit` 与完整 `pnpm run build` 通过。Build 在主 checkout 读取 `.env.local` 与 `.env.production`，未打印 secret；仅有已有 Browserslist 数据过期提示。
- 生产 `/cn/tasks/brand-constrained-marketing-content` 返回 404，sitemap 中该 Task 精确 URL 匹配为 0。本包未执行生产写入、关系创建、发布或部署。

## 6. 官方证据增量与当前候选（2026-09-28）

[字段级官方证据候选 JSON](./DECISION_GRAPH_CL06_BRAND_EVIDENCE_CANDIDATE_2026-09-28_CN.json)记录逐条 URL、产品表面、核验日期、字段用途、限制与冲突。它是独立 QA 的输入，不是已 verified 的生产 source/claim，也不是可执行 manifest。

2026-09-28T08:36:10.113Z 再次运行只读 verifier：Task active、两条 Task Capability reviewed；Jasper、Grammarly、Claude 目录均 published；本 Task 的 Tool Capability 与 Fit 仍各为 0。Jasper/Grammarly 各无 profile、source、claim；Claude 唯一 profile 仍为 conflict，附有 3 条通用 source、16 条通用 claim。本组 profile、Tool Capability、Fit claim links 各为 0。Neon 使用 `BEGIN READ ONLY`；Supabase 仅 select；生产写入 0。以上为当前快照，不覆盖第 1、5 节的历史时点。

官方复核维持两条 Task rationale 的 `publishable` 编辑候选。Jasper 仍为 `conditional`，但 required 起草关系的 `availability` 保留 `unknown`：其 [Brand Voice](https://help.jasper.ai/hc/en-us/articles/18618693085339-Brand-Voice)和 [Knowledge Base](https://help.jasper.ai/hc/en-us/articles/18618707176347-Knowledge-Base)页列出 Pro 限额，而 2026-09-17 更新的 [Jasper IQ 总览](https://help.jasper.ai/hc/en-us/articles/18618654325787-Jasper-IQ)称 IQ 仅 Business。现有合同/目标账号资格未核实，不择一解释。Business [Style Guide](https://help.jasper.ai/hc/en-us/articles/25925092890011-Style-Guide)的生成时规则、单活动 guide、beta 抽取有直接证据；但其“仅 Admin/Manager 可编辑”与 [Permission Settings](https://help.jasper.ai/hc/en-us/articles/34717759798683-Permission-Settings)所述关闭限制后“任何人可编辑”的官方表述有差异，实际工作区权限须核。配置治理仍不证明不可绕过的发布审批。

Grammarly 仍为 `conditional` 的**已有草稿审阅**候选。官方 [brand tones](https://support.grammarly.com/hc/en-us/articles/4403544890253-Set-brand-tones)和 [style rules](https://support.grammarly.com/hc/en-us/articles/360043832652-Create-style-rules)直接支持组织/组规则与实时建议；可接受/忽略、网站作用域和移动端缺口须写进限制。[营销页](https://www.grammarly.com/business/styleguide)同时提 AI 初稿与品牌指导，但没有直接证明该初稿自动受所分配组织规则约束，因此 required 起草关系的 `support_level` 在新候选包中改为无可写值、`availability=unknown`。若独立 QA 要求同一工具直接完成品牌资料约束的初稿，应撤掉 Grammarly Fit 候选。

Claude 保持 `contextual`/HOLD。[Projects](https://support.claude.com/en/articles/9519177-how-can-i-create-and-manage-projects)可跨同一项目会话复用资料和指令，[组织指令](https://support.claude.com/en/articles/14546867-set-organization-instructions)仅是可能出现冲突变化的 prompt 层优先级，[Artifacts](https://support.claude.com/en/articles/17153992-what-are-artifacts-and-how-do-i-use-them)可导出模板文档。这些通用能力不能自动证明专用 Brand Voice、不可绕过的政策/审批或相关套餐 entitlement；既有 profile conflict 与 `claude.ai`/`anthropic.com` 身份映射仍须先解决。

**专项 QA 重点：** 核实 Jasper 的实际 Business/Pro IQ 权限与授权素材范围；实测 Grammarly 生成入口是否继承组织 brand tones/style rules，且不把营销案例当 entitlement；核实所有建议可被忽略或覆盖的边界；逐项建立同 owner、当前 verified、覆盖 `support/availability/plan/limitation` 与 Fit `fit/limitation` 的 claim links，并设置真实 reviewer/review window。此轮只补候选和验证，关系、Task Page、sitemap 与生产发布仍 HOLD。
