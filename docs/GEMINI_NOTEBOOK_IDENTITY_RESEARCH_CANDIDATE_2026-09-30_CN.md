# Gemini Notebook 身份迁移与 research-with-citations 候选包

状态：**Neon 第一阶段身份迁移已由 Owner 在生产提交并独立只读回验；Supabase Decision 与 Task Page 仍为候选/HOLD**。目录实体在 Neon，Decision 与证据在 Supabase，两个数据库没有跨库原子事务。[Neon 前向 SQL](../db/neon/20261001_owner_gemini_notebook_identity.sql) 与 [精确回滚 SQL](../db/neon/20261001_owner_gemini_notebook_identity_rollback.sql) 均保留默认 `ROLLBACK`、私有快照及 Owner 闸门；快照未写入仓库或公开备份表。Stage 2 已提供[Supabase 候选/审核/回滚 SQL 与只读 verifier](./GEMINI_NOTEBOOK_STAGE2_SUPABASE_DELIVERY_2026-10-01_CN.md)，**尚未生产执行**；2026-10-01 只读基线仍为 profile、claim、关系 0。没有独立人工审核时，证据 link 受 verified claim trigger 阻挡，候选事务只保留 pending/candidate/draft。

**第一阶段生产回执（2026-10-01）：**固定 ID `cec78907-e2a1-4eb7-853a-a58334026280` 提交后 `updated_at=2026-10-01 01:20:38.963207+00`，全行 `rowMd5=e46e55730afa5269df9d30c569507dee`，受管字段 `ownedMd5=6ad598a3691906ee6ca9e75d4500188a`。`--identity` 独立只读回验通过：唯一实体、旧 `notebooklm` slug、现名/官网、`published/monitor`、`next_review_date=2026-12-15`、`sitemapEligible=false`；`productionWrites=0` 指回验命令。生产 SEO smoke 通过，sitemap 为 126 条。EN/CN 生产页正文均显示 Gemini Notebook 及原 NotebookLM 语境，保持 `/ai/notebooklm` 自指 canonical、`noindex, follow` 且 sitemap 不收录。仓库中的静态证据卡片与指南标签已跟进现名；部署前生产卡片可能仍显示旧文案。

## 1. 生产基线与身份决策

`node scripts/pub-03-readonly-run.mjs pnpm exec tsx scripts/verify-gemini-notebook-identity-readonly.ts --baseline` 于 2026-09-30T06:05:51Z 通过；以下左栏为**迁移前基线**，右栏为**第一阶段已应用值**。Neon 回验事务为 `BEGIN READ ONLY`，Supabase 请求限 GET/HEAD。按旧/新名字、旧/新 Google 域名和固定 ID 查重只命中一条。

| 字段 | 迁移前基线 | 第一阶段已应用值 |
| --- | --- | --- |
| `tools.id` | `cec78907-e2a1-4eb7-853a-a58334026280` | **保持** |
| `tools.name` / 站内 slug | `notebooklm` / `/ai/notebooklm` | **保持**；所有语言的历史路径及页面 canonical 保持 |
| `tools.title.en` | `NotebookLM Source-Grounded Research` | `Gemini Notebook Source-Grounded Research` |
| `tools.title.cn`, `.zh` | `NotebookLM 资料锚定研究` | `Gemini Notebook 资料锚定研究` |
| `tools.title.tw` | `NotebookLM 资料锚定研究` | `Gemini Notebook 資料錨定研究` |
| `tools.url`，产品官网 | `https://notebooklm.google.com/` | `https://notebook.google.com/` |
| `tools.features.identity` | 不存在 | `{"currentName":"Gemini Notebook","formerName":"NotebookLM","aliases":["NotebookLM"],"identityChangedAt":"2026-07-16","sourceUrl":"https://blog.google/innovation-and-ai/products/gemini-notebook/notebooklm-gemini-notebook/","legacyOfficialUrl":"https://notebooklm.google.com/"}` |
| `tools.features.editorial` | `reviewedAt=2026-09-06`，旧 Help URL | `reviewedAt=2026-09-30`，`sourceUrl=https://support.google.com/gemininotebook/answer/16164461?hl=en`；保留“本站未做受控引文准确性实测”的 trust note |
| `tools.next_review_date` | `2026-09-20`，已过期 | `2026-12-15` |
| `status`, `page_quality_status` | `published`, `monitor` | **保持**；不改索引门禁或 sitemap |

Google [2026-07-16 更名公告](https://blog.google/innovation-and-ai/products/gemini-notebook/notebooklm-gemini-notebook/)明确称这是同一独立产品；旧官网在 2026-09-30 返回 301 到 `https://notebook.google.com/`。`tools.name` 是数据库唯一键兼路由 slug，不能把它直接改成 `gemini-notebook`。站内 canonical 仍为现有 `/ai/notebooklm` 路径，产品官网 URL 是另一字段。不要创建第二条工具、删除旧路径、加新 slug 重定向或改变 sitemap/index。

### 第一阶段文案边界

- 指南中的可见操作标签现已在仓库改为 **Gemini Notebook（原 NotebookLM）**，链接仍指向 `/ai/notebooklm`。研究比较页当前使用未接入的 `quickStarts` 变量，不能把那里的字符串变更当成上线展示；生产页面已按实际渲染回验。
- `tools.content` 四语言当前未含旧名，可保留描述语义；Owner 检查可见摘要后再调整。`tools.detail` 四语言都含旧名，应把作为当前品牌的用法改为“Gemini Notebook（原 NotebookLM）”，首次出现之后用“Gemini Notebook”。不要全局替换历史更名事实。
- 旧 detail 的“不是开放网页搜索引擎 / 不能发现网页”一类绝对表述须改成“可发现 Web/Drive 来源，用户选择导入；回答围绕当前 notebook 已选来源”。Deep Research 也能发现并导入资料，因此不能声称完全没有网页发现能力。[来源与发现说明](https://support.google.com/gemininotebook/answer/16215270?hl=en)
- 套餐数字须以 [现行套餐页](https://support.google.com/gemininotebook/answer/16213268?hl=en) 为准：每 notebook 来源上限 Standard 50、Plus 100、Pro 300、Ultra 20 TB 500、Ultra 30 TB 600；另有 [2026-09 起的计算量用量限制](https://support.google.com/gemininotebook/answer/17670842?hl=en)，不能把每日 chat 数误写成唯一限制。保留地区、年龄、账户和 Workspace 管理员开放条件。[产品帮助](https://support.google.com/gemininotebook/answer/16164461?hl=en)
- `features.trialTemplate.targetOutcome` 四语言中的当前产品名改为 Gemini Notebook；`features.marketValidation.evidenceUrls` 中旧 Help URL 换成现行 Help URL 并加入更名公告。其他评分与市场结论不因更名自动提高。
- 更新 `features.editorial.summary` 四语言以覆盖更名、来源范围、引文、套餐与隐私边界；用户可见 detail 保留“引用可回查仍需人工核对、资料集可能不完整、本站未实测”的限定。

## 2. 官方证据与窄范围结论

| 主题 | 可核对的结论 | 官方来源 |
| --- | --- | --- |
| 同一产品、现名 | NotebookLM 于 2026-07-16 更名 Gemini Notebook，仍是独立产品 | [Google 更名公告](https://blog.google/innovation-and-ai/products/gemini-notebook/notebooklm-gemini-notebook/) |
| 引文 | 聊天以 notebook 的来源为依据，提供行内引用；引用是检查路径，不保证结论或原资料质量 | [产品帮助](https://support.google.com/gemininotebook/answer/16164461?hl=en)、[Workspace 产品页](https://workspace.google.com/intl/en/products/gemini-notebook/) |
| 来源/发现 | PDF、Google Docs/Slides/Sheets、Word/文本/Markdown/CSV/PPTX/ePub、图片、音频、网页、公开带字幕 YouTube 等；可搜索 Web/Drive 并选择导入，Deep Research 可生成候选来源 | [来源与发现说明](https://support.google.com/gemininotebook/answer/16215270?hl=en) |
| 导入损失 | 网页仅提取 HTML 文本，不导入嵌入媒体、嵌套页或付费页；YouTube 使用字幕；Google 文件脚注/评论不导入；音频导入转录文本 | [来源与发现说明](https://support.google.com/gemininotebook/answer/16215270?hl=en) |
| 资料边界 | 不同 notebook 不能同时互读；回答有 AI 失误风险 | [创建 notebook](https://support.google.com/gemininotebook/answer/16206563?hl=en)、[产品帮助](https://support.google.com/gemininotebook/answer/16164461?hl=en) |
| 分享/导出 | 可按 Viewer/Editor 分享；报告可导出 Docs，数据表可导出 Sheets；导出文件不继承 notebook 权限；Chat View 不真正撤销资料访问 | [创建 notebook](https://support.google.com/gemininotebook/answer/16206563?hl=en) |
| 套餐/可用性 | Standard 可免费使用；Plus/Pro/Ultra 与合格 Workspace/Cloud 方案额度不同；地区、年龄、平台与账号可能限制功能 | [升级说明](https://support.google.com/gemininotebook/answer/16213268?hl=en)、[产品帮助](https://support.google.com/gemininotebook/answer/16164461?hl=en) |
| 隐私 | 一般 Notebook 内容不会**直接**用于训练基础模型，主动反馈有内容审阅与改进边界；合格 Workspace/Education 的上传、提问和回答不供人工审阅或模型训练；同步到 Gemini 等服务的数据受其服务通知约束 | [产品帮助](https://support.google.com/gemininotebook/answer/16164461?hl=en)、[隐私与条款](https://support.google.com/gemininotebook/answer/17004255?hl=en) |

## 3. Decision 证据候选（仅 Notebook owner）

目前生产 `product_intelligence_profiles`、`tool_decision_profiles`、`product_intelligence_sources`、`product_intelligence_claims`、两条 Tool Capability、`research-with-citations` Fit 及其 links 均为 **0**。既有 Task ID `527fe8b7-c171-4c50-ab1f-9404d7536e7c` 和 `research-discovery`、`citation-traceability` Capability 只复用，不新增。

Owner 在 Supabase 先建一个 `product_intelligence_profiles`：`owner_type='tool'`、`owner_id=cec78907-e2a1-4eb7-853a-a58334026280`、`canonical_domain='notebook.google.com'`、`product_name='Gemini Notebook'`；`profile_status` 在逐条核验前保持 `pending`。其 `metadata.identity` 镜像上述 formerName/alias/change source。来源行只用上表 Google 官方 HTTPS URL，`source_type='official'`，真实抓取成功后才将 `fetch_status='success'` 并记录 `last_verified_at`。Reviewer 必须是实际 `auth.users.id`；审核期限建议不晚于 `2026-12-15`，并符合 `decision_official_evidence_intake` 的 90 天上限。

以下 claim key 与文字为候选，按一条官方来源、一个可验证主张分别录入。`verification_status` 默认为 `candidate`；人工对原文、账户/地区范围及冲突完成复核后方可改 `verified`，必须有 `source_id`, `source_url`, `source_excerpt`, `verified_by`, `verified_at`, `review_due_at`, `validity_scope`。不要借用其他工具的 claim。

| 候选 claim key | 主张与 validity scope | 来源 |
| --- | --- | --- |
| `gemini-notebook:research:identity-2026-09` | 同一独立产品于 2026-07-16 更名；scope: 产品身份 | 更名公告 |
| `gemini-notebook:research:source-grounding-2026-09` | 回答依据已选 notebook 来源并给行内引文；scope: Gemini Notebook chat，非 Gemini App 普通对话 | 产品帮助 |
| `gemini-notebook:research:source-discovery-2026-09` | 可发现 Web/Drive 并选择导入；scope: 支持的 Web/账号/地区 | 来源与发现说明 |
| `gemini-notebook:research:import-limits-2026-09` | 网页/视频/Google 文件导入有文本与权限损失；scope: 相应来源类型 | 来源与发现说明 |
| `gemini-notebook:research:notebook-scope-2026-09` | notebook 相互独立，不能一次跨 notebook 检索；scope: Notebook chat | 创建 notebook |
| `gemini-notebook:research:sharing-export-2026-09` | Viewer/Editor 分享及 Docs/Sheets 导出，权限不继承；scope: Web、账号权限 | 创建 notebook |
| `gemini-notebook:research:plan-availability-2026-09` | Standard/Plus/Pro/Ultra 分层，地区、年龄、管理员条件；scope: 当前套餐/地区/账号 | 升级说明与产品帮助，若需两来源拆两 claim |
| `gemini-notebook:research:compute-limits-2026-09` | 另有按计算量的五小时/每周限额；scope: 2026-09 后 Gemini Notebook | 用量限制说明 |
| `gemini-notebook:research:data-handling-2026-09` | 一般内容不直接训练基础模型，反馈与跨服务有额外边界；Workspace/Education 更严；scope: 按账户类型分拆核验 | 产品帮助与隐私条款，建议拆为两 claim |

`tool_decision_profiles` 候选：`tool_id` 固定；`setup_complexity='unknown'`（尚无本站受控试用）、`data_training_use='unknown'`（按个人/Workspace/跨服务不同）、`self_host_level='no'`、`export_level='limited'`、`editorial_status='draft'`。摘要：**适于在已选资料集内做可回查综合；发现/导入不等于系统性检索；关键引文需打开原文检查。** `watch_outs` 明列导入丢失、套餐/计算限额、分享权限、账号隐私边界。至少链接 grounding、import limitation、plan/privacy 的同 owner verified claims，人工复核后转 `reviewed`，不要直接发布。

两条 `tool_capabilities` 候选均以固定工具 ID 配现有 Capability ID，初始 `status='draft'`：

1. `research-discovery`：`support_level='partial'`；`availability='unknown'`，直到具体 Web/Deep Research 账号验证；plan_requirement 写明功能与地区/年龄分层；limitations 写明用户选择导入、覆盖不可视为穷尽。链接 discovery `support`、plan/compute `availability`/`plan`、import/scope `limitation`。
2. `citation-traceability`：`support_level='strong'` 仅限 notebook 已选来源中的行内引用；`availability='all_plans'` 仅针对基础聊天引文，不能扩展到所有生成物或 Gemini App 回答；limitations 写明原文导入损失、引文与结论仍需核查。链接 grounding `support`、plan `availability`、import/scope `limitation`。

`tool_task_fits` 候选：`tool_id` 固定、`task_id` 固定、`fit_level='conditional'`、`status='draft'`。适用条件：用户已有或愿意选定资料集，能逐条核引文，接受 Google 托管与账户/地区限制。排除条件：要求完整可复现文献检索、跨 notebook 同时覆盖或未经核验的高风险结论。链接 grounding/discovery 为 `fit`、import/scope/privacy 为 `limitation`。Reviewer/期限与所有 link 的 claim owner 必须一致；独立内容 QA 后才转 `reviewed`。本包不触及其他工具，也不发布 Task Page。

## 4. 第一阶段执行记录与保留的回滚步骤

以下第 1–3 项记录已完成的提交与回读门禁，供审计核对；第 4 项是需要时才执行的回滚流程。不要对已迁移的生产行重新运行 `--baseline` 或前向提交。

1. **预检与私有备份：**运行 `--baseline`，记录输出的 `updatedAtUtc` 和 `rowMd5`。在 Neon 私有 SQL 会话原样运行前向 SQL，保持三行 `SET LOCAL` 注释与结尾 `ROLLBACK`；预期 `private_rollback_snapshot` 为一条 JSON，通知为 `PRECHECK PASS; no write`。将完整 JSON、执行时间、审阅人和变更票据保存在 Owner 的私有审计位置。不得新建无 RLS 的公开备份表，也不要把快照提交到仓库。若预检或基线失败即 HOLD。
2. **Neon 手工提交：**Owner 在新鲜 `--baseline` 后复制前向 SQL，填写三项 `SET LOCAL`：精确 `updatedAtUtc`、全行 `rowMd5`、文件内完整的 Owner gate 句；仅在审阅私有快照与目标文案后将最后一行改为 `COMMIT`，以单事务运行。SQL 固定 ID、旧 URL/标题、状态、review date、完整四语言 detail 与四个受管 features 子树的指纹、时间戳及全行哈希；行数必须等于 1，任一差异抛错中止。重复执行还须匹配完整目标受管字段指纹和目标全行时间戳/哈希，部分迁移会 HOLD。保存通知中的 post timestamp/hash。不要改 `name`、路由、canonical 或 sitemap。
3. **回读：**立即运行 `--identity`，核对只有一个实体、旧 slug、四语言现名/官网、identity/editorial/trialTemplate/marketValidation、`monitor` 导致的 noindex/sitemap 排除；`updatedAtUtc` 和 `rowMd5` 必须与步骤 2 的 post notice 一致。本阶段不运行 `--current` 作为通过门禁，因 Supabase Decision 尚未建立。
4. **精确回滚：**仅在本阶段没有建立 Decision links 时，Owner 将步骤 1 的完整私有 JSON 粘贴到回滚 SQL 的 `set_config`、填写步骤 2 **原始 post notice** 的时间戳/哈希和完整 rollback gate；新鲜 `--identity` 回读必须再次匹配该 post notice，不能用发生漂移后的新哈希代替。先原样运行默认 `ROLLBACK` 预检，再在审阅后仅将结尾改成 `COMMIT`。SQL 要求当前目标值、时间戳及全行哈希完全相符，恢复原 `title/url/detail/features/next_review_date/updated_at`，并再次对比原全行哈希；任一不符即 HOLD。回滚后 `--baseline` 应通过。若后续另行建立了 Supabase 证据/关系，须先按独立审核计划处理跨库依赖，不能假装存在跨库原子回滚。

专项本地事务测试：`pnpm exec tsx scripts/test-gemini-notebook-identity-sql.ts`（临时 PostgreSQL 集群，不连接生产）。

只读命令：

```sh
node scripts/pub-03-readonly-run.mjs pnpm exec tsx scripts/verify-gemini-notebook-identity-readonly.ts --baseline
node scripts/pub-03-readonly-run.mjs pnpm exec tsx scripts/verify-gemini-notebook-identity-readonly.ts --identity
node scripts/pub-03-readonly-run.mjs pnpm exec tsx scripts/verify-gemini-notebook-identity-readonly.ts --current
```
