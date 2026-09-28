# N5 候选深审：Scite 与 Copy.ai 官方证据审计

核查日：2026-09-28。两项结论均为 `HOLD_EVIDENCE`。本包只记录厂商当前官方页面、官方条款与编辑候选判断；未登录产品账户、购买套餐、运行真实工作流或完成独立产品级市场验证。Scite 官方页经网页检索可读，但命令行直连返回 `403`，故其页面内容是当日可读官方网页快照，未做账户内回验；Copy.ai 核心官方链接命令行均返回 `200`。厂商覆盖量、用户数、质量和效率宣传不作实测或市场采用证据。发布 preflight 必须重新核价格、权益、身份和数据边界。本轮不授权生产实体、Decision Graph、页面或索引写入。

## 生产身份、别名与 URL 只读检查

用 `.env.local` 的生产连接在 `BEGIN READ ONLY` 事务中查询 `tools.name/title/url`，随后 `ROLLBACK`：生产共 **67** 条；`scite|copy[. -]?ai|copywriter|copyai` 与两项官网域名匹配 **0**。广义对照仅命中 Consensus、Jasper、Grammarly，不能把同类工具当同一产品。`lib/config/toolRouteAliases.ts` 无 Scite、Copy.ai、`copy-ai` 或 `copyai` 别名。候选 JSON 的 slug 是预审快照，不是生产实体。

线上 `/ai/scite`、`/cn/ai/scite`、`/ai/scite-ai`、`/cn/ai/scite-ai`、`/ai/copy-ai`、`/cn/ai/copy-ai`、`/ai/copyai`、`/cn/ai/copyai` 均为 `200 + self-canonical + noindex, follow`，H1 为 “This tool page is temporarily unavailable”；sitemap 中 `scite|copy-ai|copyai` 匹配 **0**。这些是动态不可用壳，不表示已有产品页，也不赋予多个 slug 的发布权。现有 `/guides/copy-ai-alternatives-comparison` 及中文路径均为 `200 + noindex, follow` 的 Guide；`ai-writing-tools` 还有 `copy-ai` 比较内链，`ai-tools-for-research` 提及 Scite。它们构成**现有搜索意图和内链冲突检查项**，不等于 Copy.ai 生产实体。发布前必须重查生产 name/slug/域名、alias、Guide/Comparison 意图及唯一 canonical；若届时已有 Copy.ai 实体或别名，改为事实更新/合并候选，禁止新建重复实体。

## Scite：`HOLD_EVIDENCE`

**身份与维护。** [现行功能页](https://scite.ai/features)界定 Scite 为学术文献发现与引文语境分析平台：Smart Citations、Search、Assistant、Collections、Reference Check；并非只看引文数的排行榜。[2026-09-01 发布说明](https://scite.ai/blog/august-2026-release-notes)记录 MCP 免费额度、Zotero 导入与套餐调整，是维护信号，不证明分类准确率或独立采用。品牌现归 Research Solutions；不能借母公司客户数作为 Scite 产品级采用。

| 核查项 | 官方可证事实与边界 |
| --- | --- |
| Smart Citations | [功能页](https://scite.ai/features)称以模型将**引文陈述**分为 supporting、contrasting、mentioning，并展示被引语境；[API 页](https://scite.ai/api)可按 DOI 返回计数及陈述。分类对象是所收录引用的语境，不是整篇论文、研究结论或被引 claim 的真值判决。可能有误分类、语义歧义及未收录引用；需回读原文、研究方法和具体 claim，不能把 supporting 多视为事实正确性保证。 |
| 检索、Assistant 与来源覆盖 | [功能页](https://scite.ai/features)和[API 页](https://scite.ai/api)列全文/引文陈述搜索、分类/章节/期刊筛选、引用链、来源链接、Assistant 回答与 Collections 警报、撤稿/编辑告示；[Reference Check](https://scite.ai/features)可传稿件 PDF 查参考文献警示。官方页面同时使用 `1.6B+ Smart Citations`、`317M+ Articles Indexed`、`49M+ Full-Text Sources`、`44+ Publisher Partners` 等不同口径；这些是厂商索引规模宣传，**不是所有学术文献或所有论文全文的完整覆盖率**，也不保证每个答案都准确。厂商[研究检索指南](https://scite.ai/blog/use-ai-to-find-research-papers)自己指出预印本、会议论文、非英文及最新论文可能未完整索引；系统综述仍需可复现的其他数据库检索。付费墙全文能否阅读取决于机构授权，[MCP 公告](https://scite.ai/blog/introducing-scite-mcp)明确不会开放无权访问的内容。 |
| 个人与机构套餐 | [当日定价页](https://scite.ai/pricing)显示截至 2026-09-30 的 **30% 限时促销**：Connect 免费、每月 25 MCP credits，**无站内 Assistant/Search**；Basic 页面显示年付折算 `$14/月`、250 MCP credits/月、Collections 最多 1,000 篇；Pro 显示年付折算 `$35/月`、2,500 MCP credits/月、Collections 最多 10,000 篇、API 与专利/临床试验/资助数据，`$60 API credit` 明标限时。页面还列 7 天试用，试用结束按所选套餐自动转订阅，须提前取消以免收费。[发布说明](https://scite.ai/blog/august-2026-release-notes)称 Team & Enterprise 分页与 Academic 选项已上线，但本次可读页面未给可靠机构价/席位矩阵；团队、机构、Academic 实际报价/权限、促销后价、月付金额、地区税费及 API 超额费为 `unknown`。免费 MCP 额度不能写成免费站内搜索。 |
| 集成、API 与导出 | [集成页](https://scite.ai/integrations)列网页、浏览器扩展、Zotero 插件/同步、MCP 和 API；[扩展页](https://scite.ai/extension-install)列网页选词向 Assistant 提问、论文页 widget 及 Scholar/PubMed badge；[2026-09 发布说明](https://scite.ai/blog/august-2026-release-notes)记录 Zotero 个人/群组库导入改进。[API 页](https://scite.ai/api)列 Search、Assistant、Smart Citation tallies、Reference Check 等 JSON 接口，Pro 标 API access，但调用上限、按量和机构合同需核。2025 [官方发布说明](https://scite.ai/blog/october-2025-release-notes)曾列 Assistant 参考文献 CSV/BibTeX/RIS 导出；当日各套餐对导出数量/格式的资格为 `unknown`，不得当作无限导出。 |
| 隐私与商用边界 | [2026 隐私政策](https://scite.ai/policy)和[服务条款](https://scite.ai/terms)称不以 Customer Data（含输入/输出/查询）训练或改进 AI；仍会处理账户、查询、使用分析和必要服务商数据。条款禁止超出研究合理需要的系统性批量获取、对第三方再分发/售卖文章或分类/AI 内容及其衍生数据，也禁止用这些内容训练或评估 AI 模型；API/MCP 同样受套餐及条款约束。特定机构 DPA、保存时长、地域与商业再许可权限为 `unknown`，不能把 API 可用写成数据转售许可。 |

**Best for：**研究者、编辑或图书馆团队已经找到关键论文，需查看后续论文**如何引用**它、追踪矛盾或撤稿警示，并愿意回读原文；也适合在可用账户权限内以检索、Assistant、Zotero/MCP 辅助文献探索。**Not ideal：**要求算法直接判定论文真伪、以单库完成穷尽的系统综述、免费使用站内 Search/Assistant、无权访问付费全文却必须取得全文，或要大规模转售引文数据/无限 API 的团队。

**Cluster 决策差异与映射建议：**`research-with-citations` 中，既有 Consensus 偏研究问题检索，Elicit 候选偏综述筛选/提取，Scite 的 Gap-filler 假设是**被引语境、支持/对比/提及陈述与参考文献警示**；三者的引用覆盖、语料、方法与套餐不可视为等价。`citation-traceability` 可作候选 Capability，但只针对可追踪引用陈述，不发布“证实结论” Fit。Constraint 拆为索引/全文授权与更新滞后、AI 分类与人审、免费 MCP 对站内功能边界、试用自动转订阅、促销/机构权益、API 计量、导出/再分发限制；Evidence claim 按功能、套餐、条款和核查日逐条限定。

**进入下一门禁尚缺：**① 用真实账户核定免费/Basic/Pro/机构权益、账期、API 与导出，以及目标学科的索引/分类误差和全文权限；② 两条独立的 **Scite 产品级**市场信号，至少一条强采用（原池 G2/Product Hunt URL 尚仅是线索），不能用官方 `2M users` 或索引规模替代；③ 授权素材、三语言编辑内容、八项准入与发布日身份/意图查重。当前 `HOLD_EVIDENCE`。

## Copy.ai：`HOLD_EVIDENCE`

**身份与维护。** [现行平台组件页](https://www.copy.ai/platform/platform-components)将 Copy.ai 定义为 GTM AI Platform，覆盖营销、销售和运营的 Workflows、Actions、Tables、Chat、Infobase 与 Brand Voice；[现行 Agents 页](https://www.copy.ai/agents)将 Content Agents 明确放在品牌内容生成路径。两者仍包含写作，但 **Copy.ai 品牌已从单次文案生成扩展为 GTM 工作流平台**；旧 Copywriter/模板评价只能证明历史写作体验，不能验证当前 Workflows、Agents、credits、集成或企业治理。[官方 Changelog](https://www.copy.ai/changelog)记录工作流、表格与连接更新，是维护线索，不证明现行方案的质量或独立采用。

| 核查项 | 官方可证事实与边界 |
| --- | --- |
| Workflows / Agents / Chat | [平台组件](https://www.copy.ai/platform/platform-components)列以 Actions、Tables、事件触发编排流程，以 Chat 做一次性任务；[Agents 页](https://www.copy.ai/agents)列上传示例/简报生成品牌内容的 Content Agents，并将 Workflows 定义为可复用的端到端内容流程。[价格页 FAQ](https://www.copy.ai/prices)举 account plan、SEO 文章等流程例。Agent 的输出质量、可自动发布范围及每套餐 Agents 权益本轮 `unknown`；页面的“无限 Agents”营销语不能自动推为任意套餐无限生成或零 credit。 |
| 现行价格与计量 | [实时价格页](https://www.copy.ai/prices)列 Chat `5 seats`、`$29/月` 月付或年付折算 `$24/月`（`$288/年`），无限 Chat words/projects；Growth `75 seats`、`20K Workflow Credits/月`、页面显示 `$1,000/月` 且 `$12,000/年`；Expansion `150 seats`、`45K credits/月`、`$2,000/月`；Scale `200 seats`、`75K credits/月`、`$3,000/月`。Enterprise 为销售洽谈；页面上 “All Advanced features” 是与现行展示层级不一致的遗留措辞，不能据此复原 Advanced 套餐。credits 根据步骤/内容/API 等复杂度变化，不是一 credit 一次 workflow；额外 credits 需联系团队估价。当前页面没有可确认的 Free/Starter/Advanced 金额或免费额度，[2026 定价博客](https://www.copy.ai/blog/copy-ai-pricing)却仍写 Free/Starter/Advanced/Enterprise，[官网自评旧页](https://www.copy.ai/go-to-market-tools/copy-ai-review)还写旧 `$49/$249` 及 GPT-3.5，因此旧博客/旧评论不得作为当前价格。地区税费、月付 Growth/Expansion/Scale、过额/席位变更和 Agents 使用计量为 `unknown`。 |
| 集成与 API | [平台组件页](https://www.copy.ai/platform/platform-components)区分直接 GTM/CRM 集成、经 Zapier 可达的 `2,000+` 应用和 API；不能把 Zapier 可达数当原生集成数。[价格页](https://www.copy.ai/prices)将 API access、bulk workflow runs、`20+` 技术集成列在 Enterprise 文案中，但具体自助层 API entitlement 和单个连接器资格没有清晰矩阵；[官方 Workflows 指南](https://www.copy.ai/blog/workflows-101)举 Tables 批量运行、CSV 导出和向 CRM/营销平台流转。实际连接器、速率、导出格式/量及合同权限均需账户核验。 |
| 数据与训练 | [安全页](https://www.copy.ai/security)称不以用户数据训练模型、不向其他客户共享 prompts、不售数据；[Chat FAQ](https://www.copy.ai/chat)也声称模型提供方遵守不用于其他客户训练的承诺。但 [2023 隐私声明](https://www.copy.ai/privacy-notice)明确**不适用于代企业客户处理的内容**，仍列 prompts/上传文件、分析、服务商和产品改进的数据处理；[条款](https://www.copy.ai/terms-of-service)授予平台为提供/运行/改进服务而处理用户内容的广泛许可。安全页的简述不能替代企业 DPA、模型提供方名单、保留/删除、地域与审计附件；这些及具体租户设置为 `unknown`。不能把 Content Agents “用示例训练”误读为平台用客户数据训练通用模型。 |
| 导出与商用 | [官方 Workflows 指南](https://www.copy.ai/blog/workflows-101)举 Tables CSV 输出及集成转送；是否各套餐可批量导出、格式和上限为 `unknown`。[服务条款](https://www.copy.ai/terms-of-service)在合规前提下授予 Generated Content 用于合法业务的使用、修改、销售和传播许可，同时保留平台/许可方权利，且不保证输出准确、真实、完整或不侵权；这不是对第三方资料/品牌素材清权或输出独占性保证。正式客户合同可能另有条款，须按实际账户核。 |

**Best for：**已有 CRM/营销系统、明确可重复 GTM 流程，愿意配置数据/连接器、按 seats 与 workflow credits 预算，把研究、内容草稿和后续动作连成可审核流程的团队。Content Agents 可作为其中的品牌内容起草模块。**Not ideal：**只需要低价个人文案模板、把旧免费计划当现行权益、要求固定每次流程成本或所有 2,000+ 连接都是原生、无权上传客户/潜客数据，或需未经人工审核即自动发布准确合规营销内容的团队。

**Cluster 决策差异与映射建议：**Copy.ai 的 primary 保持“GTM 工作流”（未注册 Task），候选 Gap-filler 是 **Chat/Agents 生成与跨 CRM/营销系统的可复用 Workflows/Tables 编排**；Jasper 在已注册 `brand-constrained-marketing-content` 中主要比较品牌素材起草与治理，Grammarly 是审阅/改写方向。Copy.ai 的 Content Agents 与 Jasper 有营销内容意图重叠，不能仅凭共用“品牌内容”词给 secondary Task Fit，也不能用现有 Guide 的旧 copywriter 叙事当现行事实。现有 12 个 Capability 无精确 GTM workflow slug，暂记 `—`。Constraint 拆为现行层级/席位、可变 workflow credit、Agents 权益、原生对 Zapier 集成、Enterprise API、客户数据与 DPA、CSV/商用输出边界；Evidence claim 按现行平台、价格、连接、数据与条款各自记录来源/适用套餐。

**进入下一门禁尚缺：**① 真实账户或销售报价确认 Chat/Growth/Expansion/Scale/Enterprise 层级、Agents/Workflow 权益、credit 消耗、API/连接器和导出；② 企业 DPA/子处理者、模型路由、留存/删除与输出许可的合同核查，并用代表性 GTM 流程测准确性、人工审批和成本；③ 两条独立的 **当前 GTM 平台产品级**市场信号，至少一条强采用，不能沿用旧文案工具评价或官方 `17M+` 人数；④ 现有 Copy.ai Guide 的搜索意图/内容是否更新或合并、唯一 canonical、授权素材、三语言编辑内容、八项准入和发布日再查重。当前生产无重复实体，故为 `HOLD_EVIDENCE`；若后续发现同产品实体/别名，应改 `HOLD_DUPLICATE` 并走事实更新/合并。

## N5 治理结论

Scite 的引文语境与参考文献警示提供可比较的研究差异，但分类不是正确性裁决，索引规模不是完整覆盖，促销/机构/API/导出权益与实际目标学科表现待核。Copy.ai 当前是含写作模块的 GTM 工作流平台，现行价格页与官方旧博客/自评页冲突，不能按历史免费/写作定价建候选事实；真实 credit 消耗、Agents/API 权益、企业数据合同和现有 Guide 意图仍待核。两项独立产品级市场验证均未完成，因此均为 `HOLD_EVIDENCE`，不进入 `READY_FOR_RELEASE_PREFLIGHT`。建议 2026-10-05 或关键账户/合同/独立市场证据到齐时复核。本轮仅修改候选文档；没有生产实体、关系、页面、sitemap、index、数据库、自动化、push 或 deploy 写入。
