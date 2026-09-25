# CL-02 · `research-with-citations` 编辑证据包

状态：**内容冲突已修正；待独立 QA 与生产执行**。本文件是 2026-09-25 的候选编辑清单，不是录入、复核、发布或 Task Page 批准。范围仅限两条既有 Task Capability、Consensus 的一条既有 Tool Capability 和一条既有 Fit。生产核对均为只读；本文件不包含现有 claim 原文、密钥或用户数据。

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

**数字口径待内容 QA 明确。** Help 的 220M+ 指产品所述“同行评审论文”检索库；夏季文章的 400M+ 指范围更广的“学术来源”。两者并非同一计量对象，且同站部分页脚仍保留 220M+ 文案。候选关系文案只写“在 Consensus 收录的学术文献中检索”，不写具体总量或“覆盖全部论文”。若 QA 需要公开数字，须先让官方资料给出一致的对象、日期和范围。

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

## 3. 官方 source / claim 录入草案

以下为拟通过 CL-01 Admin 手工核验并录入的**新 claim 草案**，不是现有生产 claim 的导出。`source_type=official`；每条均需填人工核验者、来源的短证据片段、真实 `observed_at/verified_at` 和不超过 Admin 允许窗口的 `review_due_at`。示例 `claim_value` 与 `validity_scope` 是结构草案，录入前按页面现状复查；不要复制旧 claim 的复核时间或用首页替代具体页。取相同 key 时先查重，同 key 异来源/冲突须停下协调。

| 拟用 `claim_key` / `claim_type` | 直接官方 source | `claim_value` 草案；`validity_scope` 草案 | 证据目的 |
| --- | --- | --- | --- |
| `consensus:research:paper-search-2026-09` / `feature` | [Research Database](https://help.consensus.app/en/articles/10055108-consensus-research-database)、[How Consensus Works](https://help.consensus.app/en/articles/9922673-how-consensus-works)；**单条 claim 只选一页作直接 source** | `{"feature":"scholarly_paper_search","methods":["semantic","keyword"],"dataset":"Consensus All"}`；`{"product":"Consensus web app","dataset":"All","asOf":"2026-09-25"}` | Tool `support`；Fit `fit` |
| `consensus:research:citation-grounding-2026-09` / `feature` | [夏季更新](https://consensus.app/home/blog/what-has-changed-in-consensus-summer-26/) | `{"feature":"citation_grounding","evidence":"quote_from_paper_full_text_or_abstract","pdf_highlight":"when_available"}`；`{"product":"Consensus web app","output":"AI summaries","asOf":"2026-09-25"}` | Fit `fit`；Task 理由的编辑核验 |
| `consensus:research:fulltext-conditions-2026-09` / `limitation` | [Research Database](https://help.consensus.app/en/articles/10055108-consensus-research-database) | `{"full_text":"paper_dependent","paywalled_view_download":"user_access_required","fallback":"abstract_or_metadata"}`；`{"product":"Consensus web app","paperAccess":"varies","asOf":"2026-09-25"}` | Tool `support`/`limitation`；Fit `limitation` |
| `consensus:research:papers-plan-2026-09` / `plan` | [Subscription Plans](https://help.consensus.app/en/articles/10087865-subscription-plans) | `{"papers_search":"unlimited_on_listed_tiers","free_pro_messages":"limited"}`；`{"plans":["Free","Pro","Deep"],"asOf":"2026-09-25"}`。不固化 Free Pro message 数字；独立 QA 按官方套餐页核对直接片段。 | Tool `availability`/`plan`；Fit `fit`（额度条件） |
| `consensus:research:fulltext-chat-mode-2026-09` / `plan` | [How to Chat With Full Text](https://help.consensus.app/en/articles/10068241-how-to-chat-with-full-text) | `{"feature":"chat_with_full_text_across_papers_collections_library","requiredMode":"Pro_or_Deep_search"}`；`{"product":"Consensus web app","feature":"full_text_chat","asOf":"2026-09-25"}` | Tool `plan`/`limitation`；Fit `limitation` |
| `consensus:research:manual-review-2026-09` / `limitation` | [Responsible AI & Limitations](https://help.consensus.app/en/articles/10046838-responsible-ai-limitations) | `{"risk":"AI_can_misread_real_paper","response":"human_source_review","coverage":"not_exhaustive"}`；`{"product":"Consensus web app","output":"AI analysis","asOf":"2026-09-25"}` | Tool `limitation`；Fit `limitation` |

源页的“引用可见原句”与“有 PDF 时高亮”须分开，不承诺每篇论文都能打开 PDF。来源/claim owner 必须为上文核对的 Consensus tool profile，且每条用于发布的 claim 为 `verified`、无冲突、未失效、在复核窗口内。Tool Capability links 覆盖 `support`、`availability`、`plan`、`limitation`；Fit links 覆盖 `fit`、`limitation`。单条 claim 可在事实范围恰当时映射多个目的，不能用一个泛化首页 claim 填满所有目的。

## 4. 生产只读身份快照与预检版本

快照时间：2026-09-25；下列 UUID 是操作定位符，不是发布授权。管理员在任何编辑、QA 或发布前重新只读回查 `status` 和 `updated_at`，变动则废弃此清单并重新审定。两条 Task Capability 用复合主键定位；Tool Capability 和 Fit 用其行 ID 定位。

| 对象 | 精确 ID / 复合键 | 当前状态与 `updated_at`（UTC） | 本包预期 |
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

只读查重观察：该 profile 现有 **1 条 official source（首页）**、2 条 claim（1 candidate、1 verified）；Tool Capability 仅有 `support` link，Fit 仅有 `fit` link。本包不复用或输出其 claim 内容。此快照仍须在每次编辑和发布前重新读取；总控已另行只读确认 CL-01 migration 的 `editorial_history` 与两个 RPC 进入生产 schema cache，本包不代替独立技术 QA。

## 5. 发布、hold、撤回判定

- **Publish 候选：** CL-01 migration 已完成生产独立技术 QA；本次内容修正另经独立 QA 逐页核对官方事实、套餐时点、双语字符串、claim owner/current 状态和所有目的链接；管理员用最新精确 ID/`updated_at` 做单 Task 原子预检并批准；事务发布后只读回查目标和非目标行。此条件成立也只表示关系可发布。
- **Hold：** 全文可用性、引用片段对应、套餐额度或 220M/400M 口径不能按范围表达；任一必要目的缺少直接官方 claim；owner、版本、复核窗口或独立 QA 不通过。保持 `reviewed`，记录问题和下次核验来源。
- **Withdraw：** 后续发现官方证据否定已发布能力、产品身份错误、关键 claim 失效或 AI 引用不能满足可核查任务定义，管理员按 CL-01 单 Task 撤回受影响关系为 `stale` 并回读；不重写历史核验日期掩盖问题。

此组只有一个既有 Fit；**Task Page 继续关闭**，不改审批注册表、URL、sitemap 或索引策略。CL-02 只有在独立内容 QA 与生产关系验收或明确 hold/撤回结论完成后才可标完成；本证据包本身不满足该退出条件。执行顺序和共同门禁见[剩余 cluster 整改计划](./DECISION_GRAPH_REMAINING_CLUSTER_REMEDIATION_PLAN_CN.md)。
