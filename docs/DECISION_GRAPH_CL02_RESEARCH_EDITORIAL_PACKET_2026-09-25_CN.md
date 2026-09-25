# CL-02 · `research-with-citations` 编辑证据包

状态：**生产关系已发布；独立生产 QA_PASS（2026-09-25）**。本文件保留编辑依据、最终 claim 范围和发布前快照，并记录发布后的只读验收。范围仅限两条既有 Task Capability、Consensus 的一条既有 Tool Capability 和一条既有 Fit；Task Page 仍未获批。

## 1. 产品身份与官方事实

生产只读核对中，Neon 工具 `consensus` 指向 `https://consensus.app/`，状态为 `published`；Supabase 的同一 tool UUID 关联 ready 的 `Consensus: AI for Research` profile，canonical domain 为 `consensus.app`。本次官方资料均来自 `consensus.app` 或其 `help.consensus.app` 子域。不得混入同名销售演示产品。

| 资料 | 直接可用事实与边界 | 用途 |
| --- | --- | --- |
| [Consensus Research Database](https://help.consensus.app/en/articles/10055108-consensus-research-database) | Help 将可搜索的 **All** 数据集描述为 220M+ 同行评审论文，数据来自 Semantic Scholar、OpenAlex、自有学术网页抓取及出版商合作；每周更新。全文因论文而异。对有合作授权但仍在付费墙后的论文，平台可分析全文，用户查看或下载原文仍取决于机构或个人权限；无全文时使用摘要、元数据和可索引信息。 | 检索支持、覆盖及全文限制 |
| [How Consensus Works](https://help.consensus.app/en/articles/9922673-how-consensus-works) | 支持自然语言、关键词等检索；结合语义和关键词搜索、质量信号与重排。AI 综合以检索到的论文为基础。 | `research-discovery` 支持、Fit |
| [2026 夏季更新](https://consensus.app/home/blog/what-has-changed-in-consensus-summer-26/) | 2026-09-09 文章另称 **400M+ scholarly sources**，并提到非期刊类型扩展；Citation Grounding 把 AI 摘要中的引用映射到论文原句，可显示出处章节，有 PDF 时可高亮。 | 引用追溯；口径差异 |
| [Full Text 功能页](https://consensus.app/home/features/full-text/) | 开放获取论文的 PDF 可在产品内查看并定位片段；Citation Graph 的论文页有摘要，PDF 仅在可用时提供。 | 原文跳转与可见性边界 |
| [Subscription Plans](https://help.consensus.app/en/articles/10087865-subscription-plans) | Free、Pro、Deep 均列出不限量 Papers 搜索；Free 的 Pro message 有额度限制，Pro/Deep 的高级能力与 Deep review 额度依套餐而定。该页未列出 Free Pro message 的具体数量；其他官方帮助页有不同数字，本包不固化该数量。录入时重新核对套餐与额度。 | 可用性、套餐 |
| [How to Chat With Full Text](https://help.consensus.app/en/articles/10068241-how-to-chat-with-full-text) | 对论文、Collection 或 Library 的全文聊天须使用 Pro 或 Deep search mode；单篇上传/聊天有单独入口。不得从“可检索全文”推断免费无限全文聊天。 | 套餐和功能边界 |
| [Responsible AI & Limitations](https://help.consensus.app/en/articles/10046838-responsible-ai-limitations) | 引用可点开查看全文或摘要中的支持片段；产品承认搜索库不涵盖全部研究，AI 仍可能误读真实论文，重要来源应人工审阅。 | 引用支持、人工复核限制 |

**数字口径边界。** Help 的 220M+ 指产品所述“同行评审论文”检索库；夏季文章的 400M+ 指范围更广的“学术来源”。两者并非同一计量对象，且同站部分页脚仍保留 220M+ 文案。已发布关系文案不承诺具体总量或“覆盖全部论文”；今后若需公开数字，仍须核对对象、日期和范围。

## 2. 候选字段（EN/CN）

| 既有关系 | 字段 | 候选值 |
| --- | --- | --- |
| Task → `research-discovery` | `importance` | 保持 `required` |
| Task → `research-discovery` | `rationale.en` | Find relevant research papers and inspect their source records before synthesizing an answer; a citation cannot be evaluated if its underlying study was not found. |
| Task → `research-discovery` | `rationale.cn` | 先找到与问题相关的研究论文并检查来源记录，才能综合答案；未找到原始研究时无法评估引用是否适切。 |
| Task → `citation-traceability` | `importance` | 保持 `required` |
| Task → `citation-traceability` | `rationale.en` | Preserve a path from each cited conclusion to the supporting paper and, when available, its quoted passage so a reader can verify the claim in context. |
| Task → `citation-traceability` | `rationale.cn` | 让每条被引用的结论都能追溯到支持它的论文，并在可用时定位原文片段，便于读者结合上下文核查。 |
| Consensus → `research-discovery` | `support_level` | 候选 `strong`：官方说明直接支持学术论文发现与相关性排序；强度仅适用于已收录资料，不代表穷尽性文献综述。独立 QA 可因检索覆盖或实际使用边界改为 `partial`。 |
| Consensus → `research-discovery` | `availability` | 候选 `all_plans`：Papers 搜索在 Free、Pro、Deep 均列为无限；AI 综合、Deep review 和全文聊天受模式及额度约束。 |
| Consensus → `research-discovery` | `plan_requirement.en` | Papers search is listed as unlimited on Free, Pro, and Deep. Free Pro messages are limited; advanced analysis and Deep reviews depend on the plan's current allowance. Full-text chat across papers, Collections, or Library requires Pro or Deep search mode. Check current allowances on the official plan page before use. |
| Consensus → `research-discovery` | `plan_requirement.cn` | Free、Pro、Deep 均列出不限量 Papers 搜索。Free 的 Pro message 有额度限制；高级分析和 Deep review 依套餐当前额度使用。跨论文、Collection 或 Library 的全文聊天需使用 Pro 或 Deep 搜索模式；使用前核对官方套餐页的当前额度。 |
| Consensus → `research-discovery` | `limitations` | 下方双语字符串数组；每个元素符合 CL-01 RPC 的字符串与长度约束。 |
| Consensus → Task Fit | `fit_level` | 候选保持 `strong`，限“在收录学术资料中发现、综合并人工核验带引用的研究”这一任务定义。 |
| Consensus → Task Fit | `rationale.en` | Consensus searches scholarly papers, grounds AI summaries in cited sources, and exposes supporting passages for citation review, making it a strong fit for source-based research within its indexed corpus. |
| Consensus → Task Fit | `rationale.cn` | Consensus 可检索学术论文、用来源支撑 AI 摘要，并展示引用依据片段；在其收录范围内，适合需要核查来源的研究任务。 |

`limitations` 候选数组（每项为一个 JSON 字符串，录入时组成数组）：

1. `"EN: The indexed corpus is not exhaustive; search results and summaries cover only available research. CN: 收录库并非全部研究；搜索结果与摘要只覆盖可检索资料的一部分。"`
2. `"EN: Full-text analysis varies by paper. Publisher access for analysis does not guarantee that the user can view or download a paywalled article; some evidence is abstract-based. CN: 全文分析依论文而异。平台可分析合作出版社内容，不等于用户可查看或下载付费论文；部分证据只来自摘要。"`
3. `"EN: AI may misread a real paper. Check the cited passage, methods, population, and conclusion in the source before relying on the synthesis. CN: AI 可能误读真实论文；采纳综合结论前，应核对引用片段、方法、研究对象及原文结论。"`

Fit `required_conditions` 候选数组：

1. `{"en":"The question falls within scholarly material indexed by Consensus; include relevant user-supplied papers when coverage is insufficient.","cn":"问题属于 Consensus 可检索的学术资料范围；覆盖不足时补充用户提供的论文。"}`
2. `{"en":"The user can inspect the available abstract or original paper and manually verify each material citation against its supporting passage and context.","cn":"用户能查看可用摘要或原文，并人工逐条核对关键引用的依据片段与上下文。"}`
3. `{"en":"The selected plan or search mode has sufficient allowance for the intended Pro, Deep, or full-text workflow.","cn":"所选套餐或搜索模式的 Pro、Deep 或全文工作流额度足以完成任务。"}`

Fit `disqualifiers` 候选数组：

1. `{"en":"The task requires a guaranteed exhaustive review of all research or sources outside the indexed corpus.","cn":"任务要求保证穷尽全部研究，或必须覆盖收录库之外的来源。"}`
2. `{"en":"The deliverable requires direct access to a paywalled full article that the user's access rights do not permit.","cn":"交付物必须直接查阅付费全文，但用户没有相应访问权限。"}`
3. `{"en":"The user needs an unreviewed AI conclusion or a claim whose cited passage and study context cannot be checked.","cn":"用户要求免于人工核对的 AI 结论，或关键主张无法核查引用片段及研究上下文。"}`

`research-discovery` 是本组**唯一既有 Consensus Tool Capability**；`citation-traceability` 是既有 Task Capability，引用追溯证据用于 Fit 和任务理由复核。本包不建议自动新建第二条 Tool Capability。

## 3. 已验收的官方 claim 范围

下表同步最终独立内容 QA 通过的六条收窄 claim 范围，与生产 verified key 一一对应；不是从生产导出的 claim 原文。每条均由具体官方页直接支持，未用首页替代。生产只读 QA 已核对六条 claim 均为 `verified`、无冲突、reviewer 与复核窗口有效。

| 已验证 `claim_key` / `claim_type` | 直接官方 source | 收窄的 `claim_value`；`validity_scope` | 证据目的 |
| --- | --- | --- | --- |
| `consensus:research:paper-search-2026-09` / `feature` | [How Consensus Works](https://help.consensus.app/en/articles/9922673-how-consensus-works) | `{"search_method":"semantic","query_support":"natural_language"}`；`{"product":"Consensus web app","function":"paper search","asOf":"2026-09-25"}` | Tool `support`；Fit `fit` |
| `consensus:research:citation-grounding-2026-09` / `feature` | [夏季更新](https://consensus.app/home/blog/what-has-changed-in-consensus-summer-26/) | `{"feature":"citation_grounding","evidence":"exact_quote_from_full_text_or_abstract"}`；`{"product":"Consensus web app","output":"AI summaries","asOf":"2026-09-25"}` | Fit `fit`；Task 理由的编辑核验 |
| `consensus:research:fulltext-conditions-2026-09` / `limitation` | [Research Database](https://help.consensus.app/en/articles/10055108-consensus-research-database) | `{"paywalled_view_download":"user_access_required"}`；`{"product":"Consensus web app","paperAccess":"varies","asOf":"2026-09-25"}` | Tool `limitation`；Fit `limitation` |
| `consensus:research:papers-plan-2026-09` / `plan` | [Subscription Plans](https://help.consensus.app/en/articles/10087865-subscription-plans) | `{"free_papers_search":"unlimited","free_pro_messages":"limited"}`；`{"plan":"Free","asOf":"2026-09-25"}`。不固化 Free Pro message 数字，也不把该 claim 扩展至其他档位。 | Tool `availability`/`plan`；Fit `fit` |
| `consensus:research:fulltext-chat-mode-2026-09` / `plan` | [How to Chat With Full Text](https://help.consensus.app/en/articles/10068241-how-to-chat-with-full-text) | `{"feature":"full_text_chat_across_papers_collections_library","requiredMode":"Pro_or_Deep_search"}`；`{"product":"Consensus web app","feature":"full_text_chat","asOf":"2026-09-25"}` | Tool `plan`/`limitation`；Fit `limitation` |
| `consensus:research:manual-review-2026-09` / `limitation` | [Responsible AI & Limitations](https://help.consensus.app/en/articles/10046838-responsible-ai-limitations) | `{"risk":"AI_can_misread_real_paper"}`；`{"product":"Consensus web app","output":"AI analysis","asOf":"2026-09-25"}` | Tool `limitation`；Fit `limitation` |

源页的“引用可见原句”与“有 PDF 时高亮”仍须分开，不承诺每篇论文都能打开 PDF。六条 claim 属于同一 ready Consensus tool profile，生产 QA 已核对同 owner、official source、verified/current 与复核窗口。Tool Capability links 覆盖 `support`、`availability`、`plan`、`limitation`；Fit links 覆盖 `fit`、`limitation`。

## 4. 发布前快照与生产只读验收

下表是 **2026-09-25 发布前的历史快照**，其中 `reviewed` 与 `updated_at` 不再代表当前生产状态。两条 Task Capability 用复合主键定位；Tool Capability 和 Fit 用其行 ID 定位。

| 对象 | 精确 ID / 复合键 | 发布前状态与 `updated_at`（UTC） | 历史预期 |
| --- | --- | --- | --- |
| Task `research-with-citations` | `527fe8b7-c171-4c50-ab1f-9404d7536e7c` | `active`; `2026-09-23T06:06:52.904308+00:00` | active 不变 |
| Capability `research-discovery` | `50288b6e-a968-4bcf-9e55-911df203e0c7` | `active`; `2026-09-23T06:06:52.904308+00:00` | active 不变 |
| Capability `citation-traceability` | `04930ae8-4c78-487f-a6c9-25680b8da681` | `active`; `2026-09-23T06:06:52.904308+00:00` | active 不变 |
| Task Capability：discovery | Task ID + `50288b6e-a968-4bcf-9e55-911df203e0c7` | `reviewed`; `2026-09-23T06:06:52.904308+00:00` | 编辑后仍 reviewed，QA 后才可申请组发布 |
| Task Capability：traceability | Task ID + `04930ae8-4c78-487f-a6c9-25680b8da681` | `reviewed`; `2026-09-23T06:06:52.904308+00:00` | 同上 |
| Neon tool `consensus` | `f15873ae-c6ef-4f0a-b811-b40c2aba76ab` | `published`; `2026-09-09T11:38:28.992Z` | URL `https://consensus.app/`，身份不变 |
| Tool profile | `b72150af-7c8e-40dc-81f7-b41375afa6f4` | `ready`; `2026-09-02T02:37:55.15233+00:00` | owner 为上述 tool；canonical domain `consensus.app` |
| Tool Capability：discovery | `5e6f6ba6-8587-4c59-977a-ed74672dee5c` | `reviewed`; `2026-09-23T06:06:52.904308+00:00` | 编辑、证据链与 QA 后才可申请组发布 |
| Consensus Fit | `d52cc53b-6e5f-4b0b-809b-140076d4d7d2` | `reviewed`; `2026-09-23T06:06:52.904308+00:00` | 编辑、证据链与 QA 后才可申请组发布 |

发布前只读查重观察：该 profile 当时有 **1 条 official source（首页）**、2 条 claim（1 candidate、1 verified）；Tool Capability 仅有 `support` link，Fit 仅有 `fit` link。该观察只用于解释本次变更，不是当前计数；本包不输出旧 claim 原文。

生产事务于 **2026-09-25T03:01:41.254Z** 完成；独立生产只读 QA 于 2026-09-25 给出 **QA_PASS**。目标两条 Task Capability、唯一 Consensus Tool Capability 和唯一 Fit 共 **2+1+1** 条关系均为 `published`，四条关系的 `updated_at` 均为 `2026-09-25T03:01:40.609866+00:00`，`review_due_at` 均为 `2026-12-23T03:00:04.892+00:00`。Task 仍 `active`，Consensus profile 仍 `ready`。

六条新 claim 均为 `verified`，无冲突、未失效且复核窗口有效。目标关系共有 **13 条 evidence links**：Tool Capability 的 `support=1`、`availability=1`、`plan=2`、`limitation=3`；Fit 的 `fit=3`、`limitation=3`。链接均通过同 owner、official source、current/verified 门禁。两条旧 link 已解除，旧 claim 保留；没有删改其内容。非目标 cluster 未随此次发布改变。

## 5. 发布后的边界与撤回判定

- **已发布：** 单 Task 原子事务和独立生产只读 QA 均通过；此结论仅覆盖上述四条数据关系。
- **持续复核：** 套餐、全文可用性、引用对应关系和 220M/400M 对象口径若变化，按当前官方来源重新审定，不能靠延长旧复核日期维持证据有效。
- **Withdraw：** 后续发现官方证据否定已发布能力、产品身份错误、关键 claim 失效或 AI 引用不能满足可核查任务定义，管理员按 CL-01 单 Task 撤回受影响关系为 `stale` 并回读。

此组只有一个 Fit；**Task Page 继续关闭**。独立生产 QA 核对支持的 `/en`、`/cn`、`/tw` Task URL 仍为 404，Task URL 不在 sitemap；不改审批注册表、URL 或索引策略。CL-02 关系整改与独立生产验收已完成，下一顺位为 CL-03；执行顺序见[剩余 cluster 整改计划](./DECISION_GRAPH_REMAINING_CLUSTER_REMEDIATION_PLAN_CN.md)。
