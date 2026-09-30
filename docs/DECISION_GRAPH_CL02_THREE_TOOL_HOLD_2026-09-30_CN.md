# CL-02 · research-with-citations 三工具只读盘点与 HOLD

状态：**HOLD_EVIDENCE_AND_IDENTITY**。2026-09-30T05:33:01Z 生产只读回读。此文件是编辑研究记录，不是可执行 manifest、关系事务或 Task Page 发布批准。只复用 `research-with-citations`、`research-discovery`、`citation-traceability` 和三个既有工具实体；没有创建 Task、Capability、工具页、profile、claim 或关系。

## 1. 生产查重与关系基线

以 `node scripts/pub-03-readonly-run.mjs pnpm exec tsx scripts/verify-decision-cl02-three-tool-readonly.ts` 回读。Neon 事务 `BEGIN READ ONLY`，包装器限制 Supabase 为 GET/HEAD 并设置 PostgreSQL 会话只读。按工具名和官方域名查重，只命中以下三条 published 工具；无同名/同域第二实体。

| 既有实体 | 固定 ID；目录 URL | 当前 Decision 关系与证据 |
| --- | --- | --- |
| Consensus | `f15873ae-c6ef-4f0a-b811-b40c2aba76ab`；`https://consensus.app/` | ready profile `b72150af-7c8e-40dc-81f7-b41375afa6f4`；7 source、8 claim，其中 6 条 CL-02 verified/current；已发布 `research-discovery` Tool Capability `5e6f6ba6-8587-4c59-977a-ed74672dee5c` 与 Fit `d52cc53b-6e5f-4b0b-809b-140076d4d7d2`，7+6 条同 owner evidence link。 |
| NotebookLM | `cec78907-e2a1-4eb7-853a-a58334026280`；`https://notebooklm.google.com/` | 无 profile、source、claim、这两条 Capability 的 Tool Capability、此 Task 的 Fit 或 link。Google 2026-07-16 官方宣布 **NotebookLM 更名为 Gemini Notebook**；旧域名当前 301 至 `https://notebook.google.com/`。实体可沿用同一产品 ID，但名称/URL/产品内容需要另案 Owner 核准和修正；本任务禁止修改工具内容。 |
| Perplexity | `3d018623-85f9-4df4-bd55-9a4a0e7a2d93`；`https://www.perplexity.ai/` | 无 profile、source、claim、这两条 Capability 的 Tool Capability、此 Task 的 Fit 或 link。 |

Task `527fe8b7-c171-4c50-ab1f-9404d7536e7c` 为 active；两条 required Task Capability 均 published、到期 `2026-12-23T03:00:04.892Z`。当前 **1 条真实 published Fit**，尚缺两条；这不是可用虚构关系填补的计数。`/cn/tasks/research-with-citations` 于 2026-09-30 返回 404。另见[既有 Consensus 编辑包](./DECISION_GRAPH_CL02_RESEARCH_EDITORIAL_PACKET_2026-09-25_CN.md)。

## 2. 三种可辨别的任务角色和来源边界

| 工具/角色 | 当前官方产品证据 | 套餐、溯源、导出/分享、隐私和限制 |
| --- | --- | --- |
| **Consensus：学术论文检索与证据摘要** | [How Consensus Works](https://help.consensus.app/en/articles/9922673-how-consensus-works)、[Research Database](https://help.consensus.app/en/articles/10055108-consensus-research-database)和[Responsible AI & Limitations](https://help.consensus.app/en/articles/10046838-responsible-ai-limitations)支持先检索学术论文再综合；[Citation Grounding](https://consensus.app/home/blog/what-has-changed-in-consensus-summer-26/)可将 AI 摘要引用映射到摘要或全文原句，PDF 高亮以可用为前提。 | [套餐](https://help.consensus.app/en/articles/10087865-subscription-plans)列 Free/Pro/Deep 的 Papers 搜索不限量，Pro message、Deep review 等有分层额度；[全文聊天](https://help.consensus.app/en/articles/10068241-how-to-chat-with-full-text)依 Pro/Deep 模式。付费全文的用户查看/下载仍受权限限制。官方[资料库说明](https://help.consensus.app/en/articles/9922807-my-library-how-to-save-papers-and-searches)支持 Collection 分享、答案带引用复制和 RIS/CSV 论文元数据导出，不应说成原文 PDF 可普遍导出。[隐私政策](https://consensus.app/home/privacy-policy/)承诺用户内容不用于 AI 训练，同时说明提供服务时由第三方模型处理内容并可能按其条款短暂保留。真实论文仍可能被 AI 误读，覆盖也不穷尽。 |
| **NotebookLM / Gemini Notebook：对已选资料做溯源综合** | [Google 更名公告](https://blog.google/innovation-and-ai/products/gemini-notebook/notebooklm-gemini-notebook/)确认同一独立产品。[产品说明](https://support.google.com/gemininotebook/answer/16164461?hl=en)称用户加入 PDF、网站、视频、音频及 Google 文件，回答带 notebook 内来源引用；[来源说明](https://support.google.com/gemininotebook/answer/16215270?hl=en)还说明可从 Web/Drive 发现并选择导入来源。故角色是**经用户选择的 notebook 资料集**综合，不应写成绝无网页发现能力。 | [套餐](https://support.google.com/gemininotebook/answer/16213268?hl=en)列 Standard 免费、Google AI Plus/Pro/Ultra 和合格 Workspace/Cloud，来源数与生成用量分层；[2026-09 用量规则](https://support.google.com/gemininotebook/answer/17670842?hl=en)新增按计算量的五小时/每周额度，不能只沿用旧“每日 50 次 chat”。[创建/分享说明](https://support.google.com/gemininotebook/answer/16206563?hl=en)支持报告导出 Docs、数据表导出 Sheets，并可按 viewer/editor 或公开链接分享；导出文件权限不会继承 notebook，chat view 也不会撤销底层资料访问。[导入限制](https://support.google.com/gemininotebook/answer/16215270?hl=en)：网页只取 HTML 文本、不含嵌入内容或付费网页；Google 文件脚注/评论不导入；YouTube 只取可用字幕。[数据通知](https://support.google.com/gemininotebook/answer/16164461?hl=en)称一般数据除主动反馈外不用于训练，反馈可能供人工审阅；合格 Workspace/Education 上传、提问和回答不供人工审阅或训练。引用只证明与已导入资料存在可检查路径，不证明资料完整、原文被完整导入或结论正确。 |
| **Perplexity：开放网页检索与引用回答** | [Pro Search](https://www.perplexity.ai/help-center/en/articles/10352903-what-is-pro-search)说明网页多轮检索、综合及原站链接，并可选 Web、Academic、Finance、Files 等范围；[来源标签](https://www.perplexity.ai/help-center/en/articles/20260806-understanding-source-labels)按**域名**评级，标签不证明单篇文章或主张准确。 | [套餐](https://www.perplexity.ai/help-center/en/articles/11187416-which-perplexity-subscription-plan-is-right-for-you)列 Free 基本搜索、有限 Pro Search，Pro/Max 和 Enterprise 分层；Web 订阅不含另计费 API。Free Pro Search 次数在官方材料曾有不同口径，本包不固化数字。[企业查询演示](https://www.perplexity.ai/enterprise/videos/an-introduction-to-queries)显示来源链接、公开/组织分享与 PDF/Markdown/DOCX 导出，但这些演示不能推断每个消费套餐都具有相同导出权益。[数据收集说明](https://www.perplexity.ai/help-center/en/articles/11564572-data-collection-at-perplexity)称 Free/Pro/Max 默认开启 AI 数据保留，可主动退出且只影响退出后的数据；Enterprise 数据不用于 AI 训练。开放网页来源可能混杂新闻、论坛、论文；引用链接和域名标签都不能替代逐条原文与研究方法核验。 |

上述三种角色有真实差异，但 `citation-traceability` 是 **Task Capability**，不能凭产品展示引用就自动赋予每个工具同名 Tool Capability。Consensus 只保留已有的 `research-discovery` Tool Capability；Notebook 的候选映射必须限定资料集，Perplexity 的候选映射必须限定开放网页检索。两者是否各自达到 support/availability/plan/limitation 与 Fit/limitation 的同 owner 证据门禁，需独立内容 QA。

## 3. HOLD 条件与 Owner 下一步

1. **身份更新：** Google 现行名称和域名与站内既有 NotebookLM 实体不一致。Owner 先在允许修改工具内容的独立任务中核准保留旧 slug/ID、改展示名与 canonical URL 的处置，并确认现有页面三语言内容没有旧套餐或来源限制误导。本任务不触及该实体。
2. **证据缺口：** NotebookLM 与 Perplexity 各需在既有 schema 内建立本工具 owner 的 ready profile、逐条 official source、窄范围 verified/current claim、有效 reviewer/期限，并经独立 QA 检查同 owner evidence links。不能借 Consensus 的 13 条 link 或站内工具页文案作其证据。每条 claim 应将产品、适用套餐/模式、来源范围、引用可回查性、分享/导出、隐私训练边界与限制分别落到可验证来源；官方冲突保持 unknown。
3. **关系门禁：** 以上完成后重新只读回读 ID、status、`updated_at`、复核窗口、原有关系和非目标行。再为两个工具分别准备字段级 Tool Capability/Fit 编辑包、精确 manifest、Owner-only 幂等且 fail-closed 的单 Task 事务候选和本地 rollback 测试。任何预期行、证据或官方事实变化都应中止事务。当前不生成 SQL/manifest，避免缺证据的半成品被误执行。
4. **页面门禁：** 只有三条真实 published Fit、完整证据与独立页面审批均通过后，才另案评估第二个 Task Page；当前 404 不变，未改注册表、SEO、metadata、sitemap 或 Decision Assistant。

本轮生产写入 **0**，没有 push/deploy。HOLD 也不表示三个工具没有产品能力，只表示目前不能据此建立可发布的三工具 Decision 关系。
