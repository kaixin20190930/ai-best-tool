# Elicit 剩余发布门禁复核与独立验收证据包

核查日：2026-09-29（Asia/Shanghai）；基线 `cced15666269982bbf544859d09836bb936fe1b6`。结论：**`HOLD_EVIDENCE`**。本包只评审 Elicit，不批准公开或索引，也不生成生产写入。机器可解析清单见 [`elicit-release-gate-2026-09-29.json`](../data/collection/elicit-release-gate-2026-09-29.json)。本轮严格使用 8 个核心来源页面（5 个 Elicit 官方、3 个相互独立的外部来源）；下列未重核项目沿用 [09-28 N1 审计](./ELICIT_AVOMA_N1_OFFICIAL_EVIDENCE_AUDIT_2026-09-28_CN.md)且继续限制公开文案。

## 1. 生产只读身份、意图和 URL

- 通过 `.env.local` 现有生产连接对 Neon `tools` 执行 `BEGIN READ ONLY`，以 `elicit` 查 `name`、`title`、`url`、`features`、`tags`，匹配 **0**；事务 `ROLLBACK`。Supabase `product_intelligence_profiles` 的 `product_name` / `canonical_domain` 只读查询也匹配 **0**。`tools` 没有独立 slug 字段，路由由 name/别名机制生成；仓库 `toolRouteAliases.ts` 无 `elicit` 条目。此为 09-29 当时快照，发布前必须再跑。
- 线上 [`/ai/elicit`](https://aibesttool.com/ai/elicit) 和 [`/cn/ai/elicit`](https://aibesttool.com/cn/ai/elicit) 均为 HTTP 200、自指 canonical、`noindex, follow`，H1 均是 “This tool page is temporarily unavailable”。这是无生产实体的预留壳，不算已公开 Elicit。建议唯一产品路径为各语言的 `/ai/elicit` 对应本地化路径；不另建“系统综述 Elicit”同义产品 URL。`/tw/ai/elicit` 未做线上回读，须在未来 preflight 核验。
- [`robots.txt`](https://aibesttool.com/robots.txt) 为 200、`Allow: /` 并声明 sitemap；[`sitemap.xml`](https://aibesttool.com/sitemap.xml) 为 200、126 个 `<loc>`，`elicit` 匹配 0。`robots.txt` 允许抓取不代表页面允许索引；页面 meta 为 noindex。
- 仓库现有研究 Guide 与 Category 已指向 `/ai/elicit`；`ai-tools-for-research-comparison` 是“研究工具比较”意图，另有 noindex 同义旧路径。Elicit 详情仅解释具体产品的综述工作流、采购与限制；不得把 Guide/Comparison 或 Consensus 的引用问答意图复制成第二个泛研究页面。无已知 Elicit 生产实体或别名冲突，现阶段去重通过。

## 2. 八页证据与可证事实

| 核心来源（09-29 回读） | 直接支持的事实；不能推断的范围 |
| --- | --- |
| [Elicit 定价](https://elicit.com/pricing) | Basic 免费，论文搜索和摘要列为不限量；Research Agent/Reports 的 Basic 用量有限。Pro、Scale、Enterprise 的综述/团队/管理能力分层。页面抓取文本在同一 `Industry / Monthly / Yearly` 标题下同时出现 Plus `$11` + Pro `$39` + Scale `$89` 与 Pro `$49` + Scale `$169` 等块，且 Pro/Scale 相对用量为 `5x/9x` 或 `standard/5x`。无法证明哪个金额和倍率属于用户最终所见月付/年付视图；精确价格和月度额度均 **unknown**。 |
| [系统综述指南](https://support.elicit.com/en/articles/14759154-systematic-reviews-in-elicit) | Pro/Scale/Enterprise 有专用综述，使用各自月度用量池；Gather、摘要筛选、可选全文筛选、提取、报告。单次 review 可加入 Pro 5,000、Scale 20,000、Enterprise 40,000 篇；最终报告默认 80、Pro 上限 135、Scale/Enterprise 200 篇。全文筛选须先做摘要筛选，缺全文可经扩展/人工上传；图形提取限 Scale/Enterprise、须开启 Premium PDF parsing，增加用量。不能把这些流程写成自动穷尽或准确性保证。 |
| [论文语料说明](https://support.elicit.com/en/articles/14758040-elicit-s-source-for-papers) | 官方称约 1.38 亿论文，来源 Semantic Scholar、OpenAlex、PubMed；Find Papers/Report/综述数据按周更新。开放全文或用户期刊订阅加扩展可用于全文分析，其他仅题名/摘要。语料规模是官方口径，不等于全学科/全部灰色文献完整覆盖，也不等于每篇可读全文。 |
| [导出指南](https://support.elicit.com/en/articles/14758189-export-your-data-from-elicit) | Research Report PDF/Word 为所有套餐；Find Papers/Paper Chat 表格 Plus 以上；系统综述筛选/提取表 Pro 以上；表格 CSV/Excel，部分来源 RIS/BIB，Library 可 RIS。RIS/BIB 只用于文献管理，不保证引用陈述正确。 |
| [API 条款](https://elicit.com/operations/api-terms) | API 禁提交个人数据、转售独立 API、重建 Elicit 语料或把 API 输出用于训练竞争模型；API 输入默认不用于模型训练，除非单独 opt in；下游输出受第三方论文许可制约。条款中对 API 使用者另列 Elicit 名称/logo/商标须事先书面同意；它不是所有网站素材使用的通用授权说明，也不能将 API 输入训练条款扩大到全部网页工作区。定价页仅支持 Pro 以上 API 入口。 |
| [UNSW 等研究者发表的实际实验](https://www.cambridge.org/core/services/aop-cambridge-core/content/view/C97DAEC70C3173A260F0B12E729E7250/S1759287926100805a.pdf/div-class-title-using-span-class-italic-elicit-span-ai-research-assistant-for-data-extraction-in-systematic-reviews-a-feasibility-study-across-environmental-and-life-sciences-div.pdf) | 研究者实际使用 Elicit Plus，对 **7** 项生命/环境科学系统综述的文献做数据抽取与复核；结论强调人工审阅，算法、提示词和账号变化影响重复性。产品方提供临时免费 Plus 访问，但论文声明未参与设计、未付费。此为独立团队的一项实测使用，不能推成普遍准确率、付费客户数或现行套餐性能。 |
| [LSHTM FEED 项目方法附录](https://researchonline.lshtm.ac.uk/4673671/3/Appendix_A_Methodology_for_FEED.pdf) | 伦敦卫生与热带医学院项目（2024-06）记录用 Elicit 实际抽取干预与结果，并与人工结果核对；出现一些遗漏和不一致。这是另一个机构、另一个项目的实际使用记录；历史项目，不证明 2026 新版本采用规模。 |
| [Chrome Web Store 的 Elicit 官方扩展](https://chromewebstore.google.com/detail/elicit-ai-for-scientific/fdkcnfflaanlpehcmeekdjeknnokkhno?hl=en-US) | 公开可见 **30,000 users、4.5/5、10 ratings**，扩展明确用于 Elicit 系统综述获取有权限的全文。商店由 Google 计数，独立于厂商自报；扩展安装/评分只是辅助信号，不能替代主产品的活跃/付费用户数，亦不能证明机构权限覆盖。 |

独立市场门槛由 UNSW 论文与 LSHTM 项目的**两个不同机构、不同研究项目中的实际产品使用**满足，至少前者属于有可追溯方法的产品级强使用；Chrome 商店作额外辅助。原候选 G2 链接本轮打开返回 Internal Error，**不计分**；Product Hunt 未核验，也不计分。未把融资、厂商自报用户数、产品发布或母品牌声誉计分。

上一轮 N1 已从官方 [语言说明](https://support.elicit.com/en/articles/14758084-languages-other-than-english)、[限制说明](https://support.elicit.com/en/articles/14757928-elicit-s-limitations) 与 [上传论文隐私说明](https://support.elicit.com/en/articles/14758043-privacy-for-uploaded-papers)记录：英语优化、非英语质量不保证；抽取可能误读数字或遗漏细节、不能可靠判断研究方法质量；上传 PDF 仅账户可见、未进入公共论文语料，保留期限 unknown。上述三页**没有占用本轮 8 页核心来源预算，也未在 09-29 直接重开**；本次仅沿用 09-28 的有日期历史证据，发布内容复核时须重查，不把它们包装为本日新核验。Enterprise 的“默认不训练”只在定价页该套餐范围可见。

## 3. Cluster 差异、可用表达和素材

`research-with-citations` 已有 Consensus 锚点与已发布的 `research-discovery` Tool Capability / Fit；`citation-traceability` 是 Task Capability，并不等于每个新工具自动取得对应 Tool Capability。Elicit 的可证增量是**专用综述的收集、准则筛选、抽取表和分层导出**，适合作为 Alternative 候选。Constraint 是全文许可、语料覆盖、英语优先、按复杂度消耗用量、套餐权益及逐篇人工复核；Evidence 应拆为语料、全文、筛选、抽取、导出、API/隐私和用量各条候选 claim。下游先考虑 Tool Intelligence，再由独立关系门禁判定 Fit/Comparison；不能凭本包发布关系或 Task Page。

**可安全编辑的购买表述：**“有免费 Basic；专用系统综述与 API 取决于付费套餐，操作消耗月度用量。选择前查看当前账期与账户可用额度。”这不要求精确价格。**不可发布的表述：**任何本日具体 Pro/Scale 月付或年付金额、固定月度任务数、全工作区零训练、无需全文权限的全文抽取、自动满足系统综述方法学、保证抽取准确。金额冲突本身不阻止无金额的 freemium/plan-gated 文案；它阻止精确金额及倍率主张。

**Best for（候选）：**有明确研究问题、需要筛选/抽取过程留痕、能逐篇核对原文的研究人员或团队。**Not ideal（候选）：**要求自动质量评价或穷尽灰色/非英语文献、无全文访问却需全文抽取、拟向 API 提交个人数据的工作流。这是来源支持的编辑适配判断，不是亲测效果。

仓库 [`elicit.svg`](../public/icons/tool-logos/elicit.svg) 仅为 “El” 字样的站内自制占位图，[`elicit-cover.svg`](../public/images/tool-media/elicit-cover.svg) 是通用编辑封面，不是已授权官方 logo 或真实产品截图。官网公开展示的媒体不自动授予本网站再分发权；本轮 8 页未取得可核验的复用许可。**素材硬门槛 HOLD**：须获得可记录授权范围的官方 logo，另有可用的真实产品媒体或官方允许嵌入/引用的演示素材，并记 URL、授权依据、归属及本地化展示方式；不得下载未经许可图像提交。

## 4. 八项硬门槛

| 门槛 | 结论 | 证据与剩余边界 |
| --- | --- | --- |
| 对象明确 | **PASS** | 官方站点与帮助中心均指 Elicit 研究应用；生产无同名实体。 |
| AI 价值明确 | **PASS** | AI 实际用于语义发现、筛选与数据提取，输出可回查论文/片段；不假定准确率。 |
| 实际可用 | **PASS** | Basic 免费入口，Pro 以上有专用综述/API；账期精确成本 unknown。 |
| 官方证据完整 | **PASS** | 5 个互补官方页面覆盖语料、工作流、计划、导出与 API；隐私/语言等旧证据须在内容定稿前再核。 |
| 独立市场依据 | **PASS** | UNSW 与 LSHTM 两项相互独立的实际使用，Chrome 扩展为辅助；G2 不计。 |
| 决策价值 | **PASS** | 与 Consensus 的筛选/抽取/导出差异、适合/不适合及六类约束可具体写出。 |
| 内容真实完整 | **HOLD** | 缺已授权官方 logo、真实非占位产品媒体、完成审校的 EN/CN/TW 内容；旧隐私/语言证据待发布时重查。 |
| 不重复且可维护 | **PASS** | 生产无 Elicit 实体/alias，唯一产品路径明确；Guide/Comparison 意图分离，后续复查建议 2026-10-05 或关键证据到齐时提前。 |

八项必须全 PASS，故保持 `HOLD_EVIDENCE`。`publicReleaseApproved=false`、`indexReleaseApproved=false`；线上不可用壳、robots、sitemap、Decision Graph 均不改变。

## 5. 可操作退出条件与验收

1. 取得 Elicit 官方 logo 与真实产品媒体的公开复用许可或书面许可，记录具体 URL/许可和展示条件，替换占位素材的计划先接受编辑复核。
2. 完成真正本地化的 EN/CN/TW 产品决策文案，逐项附来源、日期、套餐边界、Best for / Not ideal、人工复核与未知项；再次核对语言、上传文档隐私及非 API 工作区训练条款。无法核清的训练/留存主张省略或明确 unknown。
3. 若拟写精确金额或倍率，取得可复现的 Academic/Industry、月付/年付选中视图或结账证据；否则仅使用上述无金额表述即可，不以金额冲突单独阻塞。
4. 发布当日重跑生产 name/title/url/features/tags、路由别名、Guide/Comparison/canonical、三语言 shell 与 sitemap 查重；通过后才进入**另一个**非执行发布 preflight。索引须独立审核，默认 `monitor/noindex`。

本轮仅生成本地候选证据文件及台账结论，无生产 SQL、运行时代码、数据库写入、页面/SEO/sitemap 修改、push 或 deploy。
