# Elicit 发布门禁复核：HOLD_EVIDENCE

核查日：2026-09-30（Asia/Shanghai）；代码基线 `238b291e75335061024d93c1391d41d43770709c`。复用 [09-29 门禁包](./ELICIT_RELEASE_GATE_RECHECK_2026-09-29_CN.md)、[候选池](./MATURE_CANDIDATE_BUFFER_2026-09-20_CN.md)与现有 `candidate-release-pipeline.ts`。本次没有生成 `elicit-release.json`、注册发布器或准备数据库事务，因为第七项硬门槛仍未通过。机器结论见 [`elicit-release-gate-2026-09-30.json`](../data/collection/elicit-release-gate-2026-09-30.json)。

## 1. 身份、别名、搜索意图和在线状态

- 使用现有生产连接在 Neon `BEGIN READ ONLY` 中对 `tools.name/title/url/features/tags` 搜索 `elicit` / `elicit.com`，匹配 **0**，并 `ROLLBACK`；Supabase `product_intelligence_profiles.product_name/canonical_domain` 只读匹配 **0**。`toolRouteAliases.ts` 没有 Elicit alias。这是当日快照，未来发布日必须再查。
- 线上 [`/ai/elicit`](https://aibesttool.com/ai/elicit)、[`/cn/ai/elicit`](https://aibesttool.com/cn/ai/elicit)、[`/tw/ai/elicit`](https://aibesttool.com/tw/ai/elicit) 均为 HTTP 200、自指 canonical、`noindex, follow`，H1 为 “This tool page is temporarily unavailable”。它们是无实体的占位壳。`sitemap.xml` 当日 HTTP 200、126 个 `<loc>`、Elicit 匹配 0。
- 唯一建议产品详情路径是各语言的 `/ai/elicit`；既有研究 Guide/Category 的链接与 `ai-tools-for-research-comparison` 比较意图不构成第二个产品。相对现有 Consensus 的论文发现、带来源答案，Elicit 候选差异聚焦 **专用综述的 Gather → 筛选 → 提取表 → 分层导出**。不新建同义产品页、Task Page 或未经门禁的 Tool Capability/Fit。

## 2. 当日事实与使用边界

| 范围 | 当日核查与可用表述 |
| --- | --- |
| 产品与免费层 | [官方定价](https://elicit.com/pricing)显示 Basic 免费；论文搜索、摘要可用，Research Agent/Reports 用量有限。Plus 是较低付费层；专用系统综述在 Pro/Scale/Enterprise，API 需合格付费订阅并 opt in。[API 条款](https://elicit.com/operations/api-terms)还列 Teams，但当前面向个人的定价表不能据此承诺 Teams 的购买资格。定价页抓取同时暴露多组账期/价格和相对额度，故精确金额、月度额度与倍率继续 `unknown`，不写入编辑稿。 |
| 综述与用量 | [系统综述指南](https://support.elicit.com/en/articles/14759154-systematic-reviews-in-elicit)支持收集、摘要筛选、可选全文筛选、提取、报告。全文筛选须先有摘要筛选；Pro/Scale/Enterprise 每项 review 可加入 5,000/20,000/40,000 篇，但最终报告默认仅纳入评分最高的 80 篇，可随套餐升至 135/200。图形提取限 Scale/Enterprise 且须开启 Premium PDF parsing，增加消耗。[用量指南](https://support.elicit.com/en/articles/15646622-usage-limits-in-elicit)说明 Agent、Report、综述共用月度池，复杂度影响用量；Pro/Scale 可设置额外付费用量。不能承诺固定月度综述次数或自动完成方法学。 |
| 语料与全文 | [官方语料指南](https://support.elicit.com/en/articles/14758040-elicit-s-source-for-papers)称约 1.38 亿去重论文记录，来自 Semantic Scholar、OpenAlex、PubMed；主要检索流程按周更新。收录不等于可读全文；全文需要开放获取或用户已有访问权限。灰色文献、临床试验报告及区域覆盖可能有缺口；非英语检索/提取质量不保证，英语优先见[语言说明](https://support.elicit.com/en/articles/14758084-languages-other-than-english)。 |
| 筛选、提取、人工审阅 | [综述指南](https://support.elicit.com/en/articles/14759154-systematic-reviews-in-elicit)允许编辑准则、人工覆盖决定及查看来源引文；提取单元格需点击原文引文核对。[官方限制](https://support.elicit.com/en/articles/14757928-elicit-s-limitations)承认可能误读数字/遗漏语境，不能可靠评判研究方法质量。来源片段是核对入口，不是正确性保证。 |
| 导出 | [官方导出指南](https://support.elicit.com/en/articles/14758189-export-your-data-from-elicit)称 Research Report PDF/Word 各套餐可用；Find Papers/Paper Chat 表格 Plus 以上，综述筛选/提取表 Pro 以上；表格 CSV/Excel，部分来源 RIS/BIB，Library 可 RIS。RIS/BIB 是参考文献管理格式，不保证引文论断正确。 |
| 隐私与训练 | [上传论文说明](https://support.elicit.com/en/articles/14758043-privacy-for-uploaded-papers)称上传 PDF 加密、仅账户可见、不进公共语料，直到用户选择删除；备份或删除完成时限未明确。[API 条款](https://elicit.com/operations/api-terms)禁止向 API 提交个人数据；API 输入默认不用于训练，除非另行 opt in；API 输出仍受第三方论文许可制约。这些是 **API 范围**。普通网页工作区的跨套餐训练承诺未证；[定价页](https://elicit.com/pricing)的“默认不训练”仅见 Enterprise，不扩大到 Basic/Plus/Pro/Scale。 |

独立采用：UNSW 研究者的[已发表可行性研究](https://www.cambridge.org/core/journals/research-synthesis-methods/article/using-elicit-ai-research-assistant-for-data-extraction-in-systematic-reviews-a-feasibility-study-across-environmental-and-life-sciences/C97DAEC70C3173A260F0B12E729E7250)实际在七项系统综述中使用 Elicit 抽取并与人工数据比对；其结论支持辅助核查，不能替代人工提取。[LSHTM FEED 最终报告](https://researchonline.lshtm.ac.uk/id/eprint/4673679/22/Final_Report_Evidence_Collections_for_Climate_and%20Health.pdf)另记载用 Elicit 抽取干预/结果，对 13 项人工抽取子集核对；属于 2024 年历史项目。这是两个机构、两个项目的产品实际使用，不推成 2026 付费用户规模或通用准确率。[Chrome Web Store 扩展](https://chromewebstore.google.com/detail/elicit-ai-for-scientific/fdkcnfflaanlpehcmeekdjeknnokkhno?hl=en-US)仍列 30,000 users、10 ratings，仅作辅助，不能代表主产品活跃用户。

## 3. 素材与发布阻塞

官方[综述指南](https://support.elicit.com/en/articles/14759154-systematic-reviews-in-elicit)展示真实界面截图，官网也显示品牌图像，但页面公开展示不等于授予本站复制、托管、裁切或翻译再分发权。未找到明确允许该用途的官方 media/brand kit 或书面许可。[平台条款的知识产权节](https://elicit.com/operations/terms)保留服务图片、视频与设计权利；[API 条款](https://elicit.com/operations/api-terms)对 API 用户还限制未经书面同意使用品牌资产，该条不能被扩大解释为一般网站使用许可。仓库 `public/icons/tool-logos/elicit.svg` 只是自制 “El” 占位，`public/images/tool-media/elicit-cover.svg` 是通用编辑封面，均不能冒充官方 logo/真实产品截图。素材的源 URL、权利依据、允许操作、归属/署名与本地化展示方式仍为空。

**退出条件：**取得可核验的官方 logo 与真实产品媒体的复用/嵌入权限，逐项记载资产 URL、权利主体、许可范围、署名和展示形式；然后复查下方编辑稿与生产身份，才可生成统一流水线的 QA 候选。精确金额可以继续省略，不单独阻塞。若打算声称普通工作区“不训练”，必须取得覆盖相关套餐的官方依据；否则始终省略。当前 `publicReleaseApproved=false`、`indexReleaseApproved=false`，不发布、不进入 sitemap。

## 4. 三语言 Decision Card 编辑稿（不可直接发布）

以下是真实产品决策文案；事实来源为本包第 2 节，尚需素材、独立内容 QA 与发布日回读。它不构成 `elicit-release.json` 或公开发布授权。

### English

**What it is.** Elicit helps researchers find papers and run a structured review: gather records, screen against editable criteria, extract data into columns, then inspect the supporting passage for each answer. Its dedicated Systematic Review workflow is a Pro, Scale or Enterprise feature. The report includes a limited selection of screened papers rather than every record in the review.

**Best for.** A researcher or team with a defined question, a screening protocol and time to check each included study against the original paper. Start with Basic to test search and summaries. Before paying for a review, confirm your plan's current monthly usage pool, full-text access and required table exports. A larger or more complex review, thorough screening or premium PDF parsing uses more of that pool.

**Not ideal.** A project that needs exhaustive grey literature or non-English coverage from one search, full-text extraction without document rights, or automatic judgments about study quality. Elicit can miss nuance or misread numbers. Keep human screening, extraction checks and supplementary databases in the protocol. Do not send personal data to its API.

**Decision against Consensus.** Choose Elicit when the work requires an auditable sequence of screening decisions and extraction columns. Choose a source-backed answer/search workflow when you mainly need to discover and read papers; do not treat either tool's answer or citation as a verified conclusion. Elicit's Basic is free, while dedicated reviews and API access require eligible paid plans. Exact prices and monthly allowances are intentionally omitted because the current billing view was not unambiguously verified. Report PDF/Word export is available across plans; table exports depend on plan and workflow. Uploaded PDFs are described as private to the account and outside the public paper corpus; do not infer a general no-training guarantee for every workspace plan.

### 简体中文

**它做什么。** Elicit 面向论文检索和结构化综述：收集题录，按可编辑的准则筛选，把数据提取到列中，再打开每个答案对应的原文片段核对。专用系统综述流程属于 Pro、Scale 或 Enterprise。最终报告只纳入筛选后的一部分论文，并非把 review 中所有记录全部写入报告。

**适合谁。** 已有明确研究问题和筛选方案，且能逐篇检查原文的研究者或团队。可先用免费的 Basic 试论文搜索和摘要；采购综述能力前，核对当前套餐的月度用量池、全文访问权及所需表格导出权限。综述越大、筛选越深入，或启用高级 PDF 解析，用量消耗越高。

**不适合谁。** 希望一次检索穷尽灰色或非英语文献、没有全文访问却要做全文提取、或想让工具自动判断研究质量的团队。Elicit 可能漏掉细节、误读数字；筛选与提取仍需人工核原文，并按课题补充专业数据库。API 不得提交个人数据。

**与 Consensus 怎么选。** 若核心工作是保留筛选决定、抽取列和复核路径，重点评估 Elicit；若主要是发现论文并阅读带来源的答案，可评估 Consensus。两者的答案或引用都不能直接当作已验证结论。Elicit Basic 免费，专用综述及 API 需合格付费套餐；目前无法无歧义核准账期视图，因此不列具体价格或月度额度。报告 PDF/Word 可跨套餐导出，表格导出按工作流和套餐分层。官方称上传 PDF 仅账户可见且不进入公共论文语料，但不能据此声称所有网页套餐默认不用于训练。

### 繁體中文

**它做什麼。** Elicit 用於論文搜尋與結構化綜述：收集文獻紀錄，依可編輯的準則篩選，將資料擷取至欄位，再開啟每個答案所依據的原文片段核對。專用系統綜述流程屬於 Pro、Scale 或 Enterprise。最終報告只納入篩選後的部分論文，並非將 review 中的每筆紀錄全部寫進報告。

**適合誰。** 已有明確研究問題與篩選方案，並能逐篇查核原文的研究者或團隊。可以先用免費 Basic 試用論文搜尋和摘要；採購綜述功能前，確認現行方案的每月用量、全文存取權及所需表格匯出權限。綜述規模、深入篩選及進階 PDF 解析都會影響用量。

**不適合誰。** 期待單次搜尋涵蓋所有灰色或非英語文獻、沒有全文權限卻需要全文擷取，或希望系統自動判斷研究品質的團隊。Elicit 可能遺漏語境或誤讀數字；篩選與擷取仍需人工核對原文，並依主題補查專業資料庫。不可向 API 提交個人資料。

**與 Consensus 怎麼選。** 若工作重點是保留篩選決策、擷取欄位與查核路徑，評估 Elicit；若主要需要找到論文並閱讀附來源的回答，可評估 Consensus。兩者的回答及引文都不等於已驗證的結論。Elicit Basic 免費，專用綜述及 API 須符合付費方案資格；目前無法確認唯一的帳期價格視圖，所以不列確切金額或每月額度。報告 PDF/Word 可跨方案匯出，表格匯出則依流程與方案而異。官方稱上傳 PDF 僅帳戶可見、不納入公開論文語料；這不代表所有網頁方案均有預設不訓練承諾。

## 5. 八項門檻與驗收

| 門檻 | 結論 | 理由 |
| --- | --- | --- |
| 對象明確 | PASS | 官方產品身份、唯一 slug 與生產查重一致。 |
| AI 價值明確 | PASS | 語義發現、準則篩選及資料擷取有直接官方說明。 |
| 實際可用 | PASS | Basic 可用，付費綜述/API 有可證資格邊界。 |
| 官方證據完整 | PASS | 套餐、語料、流程、用量、導出、限制、隱私及 API 均重新核查；精確金額和普通工作區訓練承諾不主張。 |
| 獨立市場依據 | PASS | UNSW 與 LSHTM 兩個獨立項目的實際使用。 |
| 決策價值 | PASS | 與 Consensus 的任務差異、適合/不適合與採購約束具體可說明。 |
| 內容真實完整 | HOLD | 三語編輯稿已完成，但官方 logo 與真實產品媒體的可復用權限未證，亦未經獨立 QA。 |
| 不重複且可維護 | PASS | 生產無實體/alias 衝突，三語唯一路徑可定期回查。 |

只要一項 HOLD，整體即 `HOLD_EVIDENCE`。下次建議在素材權限到齊時復核，最遲 2026-10-05；發布日必須重做生產與三語 SEO 查重。當日無資料庫寫入、公開頁、索引、sitemap、Task/Decision 關係、push 或 deploy。

驗收：`test:candidate-release`、`test:mature-candidate-buffer`、`test:seo-architecture`、`seo:production-smoke`、`tsc --noEmit`、`git diff --check` 均通過；當日三語 Elicit shell 與 sitemap 另作直接只讀核查。第一次候選池測試因把歷史快照的 `status` 改成門禁狀態而失敗；已恢復快照狀態，將當次 `HOLD_EVIDENCE` 只放在專項 manifest/台帳，復跑通過。無運行時或發布器變更，依測試預算不跑完整 build。
