# 收录与搜索质量主计划

更新时间：2026-10-09

2026-10-09 **CHATGPT-CANONICAL-TOOL-01 受控发布完成**：建立唯一 ChatGPT 主工具实体 `c6a77a90-0bce-4f37-a124-7600e81475a1`，三语言 Tool Intelligence 与 Claim 边界按官方来源回读；状态为 `published + monitor/noindex`，sitemap 0，Task/Capability/Fit 0。原开发与验收任务完成内容候选、固定 ID/重复身份/受保护旧行/素材 hash 负例和独立 QA；总控完成线上 preflight、事务 rollback、显式 commit 与最终在线 verify。发布中发现并修复只读 fetch 的 Undici 超时恢复和非默认端口边界，以及页面实际优先渲染 `thumbnailUrl` 时的素材误判；两项均增量 QA_PASS。Mac alias/redirect、GPT-4o 模型归档、OpenAI 品牌化和 ChatGPT 索引批准继续分案 HOLD。详见[交付记录](./CHATGPT_CANONICAL_TOOL_CANDIDATE_2026-10-09_CN.md)。

2026-10-09 **IDENTITY-FRESHNESS-BATCH-05 生产提交与收口完成**：按第四批后队列处理 Pipedream、Cursor 两项到期 Claim，并对 ChatGPT Mac、GPT-4o、OpenAI 完成身份只读审计。Pipedream 三语正文补明 Workflows/String 将于 2027-03-31 停止、Connect 继续支持及各自计费边界；Cursor 公开 Claim 无正文变化。总控在独立 QA 后完成 fresh preflight、rollback 与独立只读回验（均 `productionWrites=0`），受控提交仅两项 freshness patch（`productionWrites=2`）；[只读 postcheck](./FRESHNESS_FIFTH_BATCH_POSTCHECK_2026-10-09.json)两项均 `already_applied`、`changedFields=[]`、`productionWrites=0`。三个身份项的 MERGE_REDIRECT/ARCHIVE 仍是单独候选，未执行；工具 status、page_quality_status、pricing、URL/canonical、index 和 sitemap 均未改变。[第五批后 backlog](./FRESHNESS_BACKLOG_AFTER_BATCH5_2026-10-09.json)为 75 个工具、57 个 published、13 个 published 到期项（`schedule_sync=0`、`claim_due=1`、`entity_due=5`、`manual_archive_review=7`），下一选择为 Replit、ChatGPT Mac、GPT-4o、OpenAI、Adobe。详见[第五批交付审计](./IDENTITY_FRESHNESS_BATCH_05_2026-10-09_CN.md)。

2026-10-08 **PIKA-CLAIM-GATED-RELEASE-01 已受控发布**：继承 prerelease `QA_PASS`，按实体/Claim 两层门禁保留套餐、credits、商用、水印、导出、重试成本、商品保真及当前视频隐私八条 Claim HOLD；三语公开稿省略无法证明的精确断言，封面为本站自有中性 SVG。总控在独立 QA 后完成资产 200/hash、fresh preflight online、事务 rollback 与显式 commit；唯一实体 `23d1e226-15f1-568a-9906-57726d982780` 为 `published + monitor/noindex`。发布后 `verify --online` PASS：三语 canonical/noindex 正确、sitemap Pika 0、Task/Capability/Fit 0。未批准 `continue_index` 或 sitemap；本地文档收口未再次写生产、未 push。详见[受控发布记录](./PIKA_CONTROLLED_RELEASE_CANDIDATE_2026-10-08_CN.md)。

2026-10-08 **FRESHNESS-BATCH-04 生产提交与独立 QA 完成**：按第三批后审计顺序处理 Codex、Dune、GitHub Copilot、Runway、Luma AI。GitHub Copilot 的公开个人套餐段落加入 Max $100/月；其余四项公开 Claim 无正文变化，Luma AI 同步过期排期。Owner 授权本批专属日期覆盖，不放宽证据、前像、回滚、QA 或索引门禁。preflight、回滚及回滚后独立只读回验均为 `productionWrites=0`、五项哈希一致；总控生产受控提交 `productionWrites=5`。只读 postcheck 五项均 `already_applied`、`changedFields=[]`、`productionWrites=0`。第四批后只读审计为 75 个工具、57 个 published、**14** 个 published 到期项（`claim_due=2`、`schedule_sync=0`）；工具状态、canonical、index 和 sitemap 均未改变。详见[第四批交付记录](./FRESHNESS_FOURTH_BATCH_2026-10-08_CN.md)、[只读 postcheck](./FRESHNESS_FOURTH_BATCH_POSTCHECK_2026-10-08.json)与[提交后积压审计](./FRESHNESS_BACKLOG_AFTER_BATCH4_2026-10-08.json)。

2026-10-08 **FRESHNESS-BATCH-03 生产提交与独立 QA 完成**：Owner 明确授权按顺序执行，不再等待原计划 `publishNotBefore=2026-10-09`；该时间覆盖被固定为第三批专属元数据，first/second 批次在连接数据库前拒绝复用，证据、前像、回滚、QA 与索引门禁均未放宽。Claude、DeepL、Emdash、Fathom、The Graph 共 5 项完成受控更新；生产 commit `productionWrites=5`，修复已应用记录重复重放前像补丁后，只读 postcheck 全部为 `already_applied`、`changedFields=[]`、`productionWrites=0`。Fathom 的前像漂移被证明仅来自一次页面访问引起的 `view_count/updated_at` 变化，业务事实未变。published 到期数从 24 降至 **19**，`claim_due` 从 11 降至 **6**；工具状态、canonical、index 和 sitemap 均未改变。详见[第三批交付记录](./FRESHNESS_THIRD_BATCH_2026-10-08_CN.md)与[提交后积压审计](./FRESHNESS_BACKLOG_AFTER_BATCH3_2026-10-08.json)。

2026-10-08 **FRESHNESS-BACKLOG-RESET-01 首批生产提交与幂等 postcheck 完成**：总控已按原始 preflight 提交 Consensus、Gamma、Perplexity、Make、Synthesia 共 5 条；只读全量审计的 published 到期数从 34 降至 **29**（排期同步 1、Claim 到期 16、实体核查 5、人工归档评估 7）。提交后旧 PASS 校验器一度将已应用的新 `maintenanceReview` 误判为快照错配；现已改为严格区分提交前与已应用记录，后者必须精确匹配候选维护记录和下次日期，并保留原始 preflight manifest 与来源哈希的追溯。5 条只读 postcheck 全为 `already_applied`、`changedFields=[]`、`productionWrites=0`；修复过程未再次写生产、未 push。详见[交付与 postcheck](./FRESHNESS_BACKLOG_RESET_2026-10-08_CN.md)。

2026-10-08 **FRESHNESS-BACKLOG-RESET-01 postcheck 正文后像补强**：五条候选固定已核验 `detail` 后像 SHA-256；提交前候选和提交后 `already_applied` 均校验该摘要。已应用路径还核完整维护记录、Synthesia 价格快照与下次日期，正文篡改负例会失败。真实生产只读 postcheck 再次返回 5 条 `already_applied`、零变更、`productionWrites=0`；无再次生产写入或 push。详见[交付记录](./FRESHNESS_BACKLOG_RESET_2026-10-08_CN.md)。

2026-10-08 **FRESHNESS-BATCH-02 生产提交与独立 QA 完成**：确定性处理 Gemini、Notion、n8n、OpenRouter、Poe。Gemini/Poe 为公开 Claim 无变化，Notion/n8n/OpenRouter 仅更新发生变化的商业 Claim；账户、地区、实际额度和 Enterprise 报价继续保持 `conditional/unknown`，没有升级为实体 HOLD。QA 要求补齐第二批 `already_applied` 后像与篡改负例，原开发任务最小返工后最终 `QA_PASS`。生产只修改 `detail`、`maintenanceReview` 和 `next_review_date`；postcheck 五项均为 `already_applied`、零变更、`productionWrites=0`。published 到期数从 29 降至 **24**，`claim_due` 从 16 降至 **11**；状态、canonical、index 和 sitemap 均未改变。详见[第二批交付记录](./FRESHNESS_SECOND_BATCH_2026-10-08_CN.md)。

2026-10-08 **CLAIM-GATED-PUBLICATION-POLICY-01 规则与运行时契约完成**：发布门禁拆分为实体/页面批准和单条 Claim holds。实体身份、唯一 canonical、重复意图、核心能力真实性、素材权利/法律安全、明显误导及内容不足仍触发全局 HOLD；未验证价格、账号权益、配额、隐私/删除/导出/商用边界可留在 claimLevelHolds，不妨碍实体在边界与复查信息完整时进入 `READY_MONITOR` / `published + monitor/noindex`。新 manifest 字段可选，旧 manifest 兼容；价格/账号/隐私权利/核心能力/身份的首复与常规频率已固化。策略专项、candidate-release 回归、`tsc --noEmit`、`git diff --check` 均通过；`pnpm run build` 编译通过但静态生成因缺少 `SUPABASE_SECRET_KEY` / `SUPABASE_SERVICE_ROLE_KEY` 在 `/api/monitor/trial-reminders` 失败。**此实现不批准任何候选，不写生产，不批准 `continue_index` 或 sitemap，不含迁移或部署。**

2026-10-08 **MURF-STUDIO-IDENTITY-MATERIAL-01 身份与别名收口已部署，工具发布仍 HOLD**：唯一候选实体明确为 Murf Studio（vendor Murf），不把 Murf API、Dub 或 Agents 建成额外工具。历史 `murf-ai` 三语路径已在生产 308 至 `/murf` 对应 canonical；新路径保持 self-canonical、`noindex, follow`，sitemap 匹配 0。平台自有中性封面与 Murf Academy 官方 Studio 教学 embed 通过独立 QA；价格/账号权益及终止后的删除与音频取回范围仍有真实证据缺口，因此未创建生产实体、未批准索引或关系，`productionWrites=0`。提交 `df3f7873` 已部署，完整 build 与生产 SEO smoke 通过。详见[收口记录](./MURF_STUDIO_IDENTITY_MATERIAL_CLOSEOUT_2026-10-08_CN.md)。

2026-10-08 **MURF-CLAIM-GATED-RELEASE-01 受控发布完成**：依据新的两层门禁继承 Murf Studio 身份、别名、平台自有封面和官方预览 PASS，不重复整页审核。价格、账户权益、项目/VGT 额度、删除期限、既有音频取回和普通 Studio 训练范围共六项不确定性保留为 Claim-level `unknown/conditional/conflict`，公开稿省略冲突精确价格与额度并保留来源和复查日；不再错误升级为实体 HOLD。独立 QA 对 `dd556d07` 返回 `QA_PASS`；生产创建唯一 `murf` 实体 `8f2d4b5e-7481-4bb8-9f21-8d2de1c0f631`，状态 `published + monitor/noindex`。未批准 index/sitemap，未创建 Task/Capability/Fit。详见[受控发布记录](./MURF_STUDIO_CONTROLLED_RELEASE_CANDIDATE_2026-10-08_CN.md)。

2026-10-08 **ELICIT-MATERIAL-DISPLAY-01 已发布并完成独立 QA**：未复制、自托管或热链 Elicit 官方 logo/截图；工具身份图与封面采用 AI Best Tool 自有中性编辑素材，真实展示采用 Elicit 官方频道可嵌入的 Research Agent 视频。统一发布器补齐 `video_url` fail-closed 与读回；`cn` 已按简体 locale 契约修正。生产 preflight、素材 hash、事务 rollback 和显式 commit 均通过，唯一实体 `c2e3a5f4-cf8e-4564-8563-093053962ed1` 为 `published + monitor/noindex`，下次复核 `2026-10-14`；不进入 sitemap，不创建 Task/Capability/Fit 关系。详见[交付记录](./ELICIT_MATERIAL_DISPLAY_2026-10-07_CN.md)。

2026-10-07 **交付与验收流程改为增量风险分级**：每个候选/功能只保留一份权威证据快照，既有 PASS 仅在来源变化、复查到期、相关代码变化或生产异常时失效。任务先列 change set，再按 R/C/H 三级执行；纯研究不跑 TypeScript/build/smoke，运行时代码只跑受影响专项与必要 build，高风险数据库/安全/支付/SEO 边界才跑完整门禁。同一命令不再由开发、QA、总控重复执行，QA PASS 后无新差分不得再次复核。详细规则已写入[自动化测试与发布验收方案](./DECISION_PLATFORM_AUTOMATED_ACCEPTANCE_CN.md)，并同步到总控任务锁和每日自动化。后续 Elicit 只处理素材授权、真实展示和新上线纠错入口三个差分，不重验其已通过的七项准入。

2026-10-07 **PIKA-PRERELEASE-01 本地候选交付，待独立 QA**：Pika 八门禁 **6 PASS / 2 HOLD（official、content）**。新旧套
餐/credits/水印/商用与迁移范围冲突保留；当前导出、失败成本、商品保真及视频隐私范围仍有 unknown。EN/CN/TW Tool
Intelligence / Decision Card 已写入[候选包](../data/collection/pika-prerelease-2026-10-07.json)，素材权利、真实预览、独
立内容/视觉 QA 和本站纠错/owner 入口验收继续 HOLD。生产只读实体/profile/上下文匹配 0，sitemap 126 / Pika 0；唯一下一发布
候选仍 Elicit。仅本地提交、不 push，productionWrites=0，无工具/关系/Task Page、metadata/index/sitemap 改动。详
见[专项审计](./PIKA_PRERELEASE_2026-10-07_CN.md)。

2026-10-07 **MTN-UX-01 已部署、owner SQL 已应用、最终 QA_PASS**：基于 `origin/main ca9867d0` 的会议页整改已完成生产交付；生产只读 verifier 确认三条 Fit 均为 `candidate_applied`。英中页面均 200、各三候选 / 6 unique sources、`noindex, follow` / self-canonical；sitemap **126 URL / 0 Task URL**。双语差异化理由、真实条件与限制、证据支持的具体约束、来源用途/去重及单一同语言下一步已完成最终 QA；工具索引与其余 Task cluster 保持不变。**完整 360/390px 视觉仍为 N/A，未宣称视觉通过。** 本次仅更新两份交付状态文档，不新增生产写入。详见 [MTN-UX-01 实施与验收记录](./MEETING_NOTES_USER_VALUE_AUDIT_2026-10-06_CN.md)。

2026-10-06 CL02-PUBLISH-GATE-REMEDIATION **已 QA_PASS、已部署、迁移已应用；生产验证 HOLD（仅三个 availability unknown）**：集成提交 `e938d1c6` 已推送 main，Vercel 部署成功，owner 已应用双语门禁迁移。总控已完成技术/生产收口；本轮 `2026-10-06T06:24:31.396Z` 只读预检确认 `productionWrites=0`、合约 `20261006-bilingual-publication-gate`、Gemini links **5/10/6**、Perplexity **6/10/7**。剩余仅 Gemini research-discovery 与 Perplexity 两项 Capability 的 `availability=unknown`；组级内容 blocker 是三字段的汇总。Task 仍 404/noindex，两个工具 indexing_paused、sitemap excluded；Perplexity `3/day` 文字仍为未应用编辑候选，不解除 availability。无需重复迁移或继续增加基础设施。当前执行状态和回读见[运营重启台账](./OPS_RESET_CANDIDATE_BUFFER_2026-10-06_CN.md)；[门禁修复审计](./CL02_PUBLISH_GATE_REMEDIATION_2026-10-06_CN.md)保留开发时历史原文。

2026-10-06 OPS-RESET-01 **开发/编辑交付，待独立 QA**：生产只读回读 69 total、54 published（17 continue_index / 35 monitor / 2 archive）、9 draft、6 rejected；sitemap **126 URL / 0 Task URL**。新的[15 项成熟产品研究缓冲与七运营日排期](./OPS_RESET_CANDIDATE_BUFFER_2026-10-06_CN.md)覆盖六 Task，市场门槛通过 3 项，但整体 **15 HOLD / 0 ready**；Top 5 为 **Elicit、Murf Studio、Pika、Canva、Bolt**，唯一下一发布候选 **Elicit（素材/内容 HOLD）**。Lovable/Replit 等已存在实体不计新增；meeting-notes 仅保留 Avoma 储备，不安排本期新发布。[会议 Task 用户价值审计](./MEETING_NOTES_USER_VALUE_AUDIT_2026-10-06_CN.md)确认双语 200/noindex 与 Task-first 基础，但三卡具体限制缺失、中文理由英文、空泛约束及重复来源需最小整改；移动端视觉 N/A。本轮仅文档/候选 JSON，生产写入 0，未改页面、数据库、索引或 sitemap；独立 worktree 本地提交、不 push。

2026-10-04 通用 Task Page 语义修正：能力门禁统一为至少一条 required、preferred 可为 0..n；所有展示中的 required/preferred 关系仍须 published/current、定义 active 且有理由。CL-02 两条真实 Task Capability 继续均为 required，移除缺 preferred blocker 后 research-with-citations 仍因 Gemini Notebook 与 Perplexity Fit 未发布、Gemini 双语角色理由不清而为 **1/3，HOLD**。Task Page 专项、Capability read model 与 Decision review gate 测试通过，`tsc --noEmit` 通过；确认 `.env.local` 被忽略后用本机配置软链接重跑，完整 build 通过。`test:meeting-notes-remediation` 另有旧断言要求页面注册表为空，与现有 meeting-notes 审批状态不符；测试未改，留待独立 QA 作 baseline 归因。无生产写入、页面放行、push 或 deploy，Task Page 仍 404/noindex 且 sitemap excluded。该通用语义修正不是 Task Page 批准；交付提交后等待独立 QA。详见[Task Page 编辑预检审计](./DECISION_GRAPH_CL02_TASK_PAGE_EDITORIAL_GATE_2026-10-04_CN.md)。

2026-10-04 CL02 Task Page 编辑预检经 QA 补正并于 `2026-10-04T12:28:15.024Z` 完成 Supabase/Neon 只读回读：claim 的现有 `source_type` 必须为 `official` 才能满足 Fit 证据门槛；Consensus Fit `published`，Gemini Notebook 与 Perplexity Fit `reviewed`，合格仍为 **1/3，HOLD**。当时报告的 Task Capability preferred 缺口现已确认为通用读模型门槛误设，不再要求改变两条真实 required 关系。专项模拟测试、tsc、完整 build 通过；无生产写入、页面放行、push 或 deploy，Task Page 仍 404/noindex 且 sitemap excluded。详见[Task Page 编辑预检审计](./DECISION_GRAPH_CL02_TASK_PAGE_EDITORIAL_GATE_2026-10-04_CN.md)。

2026-10-04 Perplexity CL-02 Stage 2 **关系审核与生产只读回验均通过**。`--relation-reviewed` 于 `2026-10-04T10:36:43.616Z` 输出 `productionWrites=0`：profile 1、source 5、claim 7、Capability 2、Fit 1、Decision/Capability/Fit links `[6,10,7]`，`status=relation-reviewed`，`stateMd5=c26a02ce57093a9d33cdfd68a3c46469`。Task 仍 `404 + noindex`，`sitemapEligible=false`；Perplexity canonical 工具页也未进入 sitemap。Consensus/Gemini 基线保持。关系审核没有授权发布 Task 或工具索引。见[候选交付](./PERPLEXITY_STAGE2_CANDIDATE_DELIVERY_2026-10-03_CN.md)、[官方字段审计](./PERPLEXITY_STAGE2_OFFICIAL_FACT_AUDIT_2026-10-03_CN.md)。

2026-10-03 Gemini Notebook Stage 2 已完成生产审核与关系收口。第一阶段 Neon 身份迁移继续保持固定 ID/`notebooklm` slug、现名与官网、`published/monitor`、`noindex, follow` 及 sitemap 排除。Admin Evidence Review Queue 基础设施已部署，10 条 Google 官方 claim 已逐条审核为 verified；受控 RPC 已将既有草稿收口为 1 个 ready profile、7 个 official source、1 个 reviewed Decision、2 个 reviewed Tool Capability、1 个 reviewed conditional Fit，并建立精确的 5 条 Decision、9 条 Capability、6 条 Fit 同 owner evidence link。编辑责任缺失由提交 `0b8eeec4` 修复，专项测试、TypeScript 与完整 build 通过。2026-10-03T07:59:17.966Z 最终只读 verifier 输出 `stateMd5=486def34a4e7bae92811a42ed882804a`、`productionWrites=0`；`/cn/tasks/research-with-citations` 仍为 `404 + noindex`，Gemini Notebook 仍因 `indexing_paused` 不可索引，Task/工具均未进入 sitemap。Stage 2 状态为**已审核、关系已建立、公开发布门禁仍 HOLD**。详见[Stage 2 交付记录](./GEMINI_NOTEBOOK_STAGE2_SUPABASE_DELIVERY_2026-10-01_CN.md)与[身份专项记录](./GEMINI_NOTEBOOK_IDENTITY_RESEARCH_CANDIDATE_2026-09-30_CN.md)。

2026-09-30 CL-02 `research-with-citations` 三工具只读盘点：Consensus、NotebookLM、Perplexity 三个既有 published 实体查重通过；目前仅 Consensus 的 1 条 Tool Capability/1 条 Fit 已 published，并有同 owner 的 7+6 evidence links。NotebookLM 与 Perplexity 均无 Decision profile/source/claim/关系；Google 官方已将 NotebookLM 更名 Gemini Notebook，旧目录 URL 301 至新域名。三种角色分别是学术论文检索与证据摘要、用户选定资料的溯源综合、开放网页检索与引用回答；来源链接不等于结论正确。结论 **HOLD_EVIDENCE_AND_IDENTITY**，不生成关系 SQL/manifest、不创建新 Task/工具页，不放开第二个 Task Page；当前 `/cn/tasks/research-with-citations` 为 404。详见[专项盘点](./DECISION_GRAPH_CL02_THREE_TOOL_HOLD_2026-09-30_CN.md)。生产写入 0，无 push/deploy。

2026-09-30 Elicit 发布门禁再次收口：Neon `BEGIN READ ONLY` 的 `tools` 多字段匹配 0、Supabase profile 匹配 0；三语言预留壳均为 `200 + self-canonical + noindex`，sitemap 126 URL 且 Elicit 0。官方套餐、综述、API、语料、导出、隐私与限制重新回读，UNSW/LSHTM 双独立实际使用继续满足市场门槛；真实 EN/CN/TW Decision Card 已写为**未发布编辑稿**。官方 logo 与真实产品媒体缺本站可复用权利依据，内容门槛仍 HOLD，整体 `HOLD_EVIDENCE`。未生成 QA 发布候选、未注册发布器或准备数据库事务；无生产写入、页面/SEO/索引/sitemap 改动、push、deploy。详见[09-30 专项包](./ELICIT_RELEASE_GATE_RECHECK_2026-09-30_CN.md)。

2026-09-29 Elicit 剩余发布门禁复核：生产只读查重为 0，双语预留页仍 `200 + self-canonical + noindex`，sitemap 无 Elicit；两项独立机构实际使用满足市场门槛，专用综述流程与 Consensus 引用问答的 Task 差异可说明。但官方价格页多组金额/额度未消歧，精确值维持 unknown；现有 Elicit 素材为占位图、缺可复用官方 logo/真实产品媒体及完成审校的三语言内容，八项中“内容真实完整” HOLD，整体维持 `HOLD_EVIDENCE`。无金额的 freemium/plan-gated 文案可作后续候选，不形成发布授权。详见[专项证据包](./ELICIT_RELEASE_GATE_RECHECK_2026-09-29_CN.md)；没有生产写入、页面/SEO/index/sitemap 修改、push 或 deploy。

2026-09-29 N6/N7 SAFE 事实更新已在生产提交并完成候选验证。仅覆盖 Grammarly、Jasper、Descript 的审计候选；Canva/HOLD/NO_CHANGE 不进入计划。执行时间 2026-09-29 08:02（Asia/Shanghai）：只读状态与默认 dry-run 回读均为 `alreadyApplied=true`、`changedPaths=[]`，目标哈希分别为 Grammarly `0c3cb98119b9b836fbd700f4160e6dd46d7f8693035b8abcf0257c7a2be9eb96`、Jasper `ece814dd76b32e4e65da4aad8b3cc6433892cf4c779babb7f4cd33c014386abd`、Descript `8cbbf70731fdb2ef827e5e3cf6a91026a2cb9301de2cccf211a50e85749842a3`；dry-run 事务已 `ROLLBACK`。身份、状态、复查日期及保护字段断言通过，索引状态未变：Grammarly/Jasper `continue_index`、Descript `monitor`；线上双语页面、canonical、robots 与 sitemap 符合当前状态。Canva 仍为 `HOLD-CONFLICT` 且无生产实体；CL-05/06 的 Tool Capability/Fit 关系未发布，账户权益等既有 HOLD 继续。执行步骤与回读详见[专项运行与回滚文档](./N6_N7_SAFE_FACT_UPDATE_RUNBOOK_2026-09-29_CN.md)。

执行状态：进行中；索引保护及本周可证实历史补账完成，本周至少 12 次放行、剩余额度 0，新增索引批准保持暂停。

当前范围：SEO 收录、搜索可见性、核心页面质量与真实编辑信号。产品分发/外链工作台暂不作为本轮执行目标，保留代码与数据，并
已隐藏公开导航、价格页和后台侧栏入口；相关历史方案已移至 `docs/archive/`。

2026-09-22 主线升级：平台在保持 AI 工具目录主题和受控收录的同时，正式并行建设 AI Tool Decision & Discovery 差异化基础。
现有 Task、Evidence Ledger、Decision Finder、Decision Card、关系表和变化时间线全部复用，不另建第二套事实系统；本周新增
Capability、Tool Capability、Task Capability 数据层，并依次交付首批 20 个成熟工具 × 6 个 Task 真实关系、独立 Task Page、
统一 Tool Intelligence 和 Structured Comparison。自然语言 Decision Assistant 只有在覆盖率与证据门槛通过后才启动。唯一实
施依据见 [差异化基础能力一周实施计划](./DECISION_GRAPH_DIFFERENTIATION_ONE_WEEK_PLAN_CN.md)。

2026-09-22 DIFF-00/01 本地交付完成：差异化计划已收敛为唯一实施依据；新增的 Supabase migration 仅建立
`decision_capabilities`、`tool_capabilities`、`task_capabilities` 及其 claim links，继续把 Neon `tool_id` 作为逻辑引用，未写入
工具数据、未改变 URL、sitemap 或索引策略。发布门禁要求 active Capability/Task、人工 reviewer、当前 review window 与同 owner 的
verified、未失效、未冲突 claim；事务末会阻止删除、修改、错配 claim 或重分配其 owner profile 后仍保留 `published`。时间自然到期
时公开 RLS 按实时有效性和 active 状态立即过滤，raw claim links 不对浏览器开放。状态为“待生产迁移与只读回读”，不得在迁移前
启动 DIFF-02。

2026-09-23 DIFF-02 本地交付完成：`/[locale]/admin/decision` 新增最小 Capability 管理模块，可维护 Capability、draft/reviewed
Tool Capability、Task Capability 和经 UUID 验证的 evidence association；所有写入均经管理员 server action，含输入校验与
loading/success/error 状态。统一服务端读模型只返回 active/current 关系及来源 URL、核验/复查日期摘要，过滤错误 owner、候选、冲突、
失效和过期 claim，且不把 raw claim/link/claim ID 下发给浏览器。状态为“待 DIFF-01/02 生产迁移与只读回读”，不构成 seed 或公开页面授权。

2026-09-23 DIFF-03 已完成并通过生产只读 verifier 与 QA。生产当前完整回读为 6 Task（复用已有 `meeting-notes`）、12 Capability、
12 Task Capability、7 Tool Capability、7 Tool Task Fit，以及 Tool Capability 与 Tool Task Fit 两类各 7 条 claim links。Fathom、
Otter.ai、Fireflies 的 3 条既有 published meeting fit 保持原 status、语义与证据链接；本批其余关系均为 reviewed。

执行过程中，旧 SQL Editor 导出跨顶层语句提交，导致 `ON COMMIT DROP` 临时表在后续语句中不可见并报 `42P01`。修复版将 guard、
写入、claim links、postcondition 和临时表清理合并为单条原子 `DO` 语句；修复提交 `1ae1b431` 与完整导出晚期失败回滚测试提交
`55308042` 已进入 main。生产完整回读和 QA 已确认数据正确，无需再次执行 SQL。DIFF-03 状态为“已完成”，下一项为 DIFF-04 Task Page。
本阶段未改工具目录记录、URL、sitemap 或索引策略。

2026-09-23 DIFF-04 代码完成，发布注册表为空，待首个 Task 编辑批准：新增 `/<locale>/tasks/<slug>` 独立 Task Page，限首批 6 Task。静态注册表先拦截未批准 slug 并返回硬 404；获批准的页面仍由服务端读模型复核 active Task、完整的当前 published required/preferred Task Capability、至少 3 个不同的已发布 Neon 工具及其当前 published、同 owner claim-backed fit。数据临时失效时页面继续 `notFound` + `noindex`。页面提供任务定义、约束、能力、3 个候选的适配/限制、证据来源与日期，以及已有 Finder/工具详情入口，不向浏览器输出 raw claim。页面始终 `noindex, follow`，沿用 canonical 规则，未加入 sitemap。注册表须随 freshness 监控或发布撤回同步移除 slug；当前注册表为空，所有 Task Page 均为硬 404。生产 12 条 Task Capability 仍为 reviewed，不构成编辑批准。

2026-09-23 DIFF-05 代码完成、待独立编辑批准：现有 Tool Decision 扩展为 Tool Intelligence / Decision Card，复用安全 Capability 读模型与已加载的 Evidence Ledger。只有 active/current/published、同 owner verified claim 支撑的 Tool Capability 才显示支持程度、可用范围、套餐要求、限制与安全来源日期；Evidence Ledger 只向判断卡传递计数及真实 claim 的最近核验/下次复查日期，不复制原始账本条目。辅助数据读取失败时工具页继续打开。当前生产 7 条 Tool Capability 均为 reviewed，所以 Capability 区域暂不公开；这不是内容已上线或关系获发布授权。

2026-09-23 DIFF-06 代码与独立 QA 完成、待 Tool Capability 编辑批准：仅在既有受控 verified comparison 页面，为 2-4 个候选追加结构化 Capability 差异矩阵；数据复用 DIFF-05 的安全读模型，只呈现当前 published、active、同 owner verified、无冲突且未过期的关系与来源摘要。缺少关系明确显示“未知”，不推断“不支持”；无合格关系或辅助读取失败时不显示矩阵，原有选择结论、限制、静态官方证据及 CTA 保持可用。页面继续 noindex，不新增组合 URL 或 sitemap 条目，也不下发 raw claim/profile/link/capability ID、值或摘录。当前生产 Tool Capability 仍全为 reviewed，矩阵尚未公开，关系发布仍需独立编辑批准。

2026-09-23 DIFF-07 只读收口与独立 QA 完成，未自动发布关系：生产回读为 6 Task、12 Capability、12 Task Capability、7 Tool Capability、7 Tool Task Fit，其中 3 条 fit 为既有 published。技术专项、TypeScript 及已完成的 DIFF-06 build/生产 SEO smoke 通过，但内容 QA 仅将 5 条 Task Capability 留作逐条编辑候选；其余 7 条 Tool Capability 与 4 条 reviewed fit 因支持范围、套餐限制或适配理由不足全部 hold。3 条既有 meeting-notes fit 的 `reviewed_by` 为 NULL，需核实历史编辑复核；现有门禁并未因此判为失效。所有 Task Page 继续关闭。下一步优先修复 meeting-notes 组，重新核对临近到期的官方来源，再做独立内容 QA 与编辑批准；不得为覆盖率制造关系。详见 [DIFF-07 发布审计](./DECISION_GRAPH_DIFF07_RELEASE_AUDIT_2026-09-23_CN.md)。DIFF-08 Decision Assistant 仍为条件阻塞。

2026-09-25 DIFF-07 meeting-notes 整改已在生产执行并通过总控独立只读验收：2/2 Task Capability、3/3 Tool Capability 为 published/current，3/3 既有 fit 为 published/current 且有 reviewer；6/6 官方 source 为 current，6/6 claim 为 verified/current，Capability 证据覆盖 support/availability/plan/limitation，fit 证据覆盖 fit/limitation。Decision foundation 与 graph seed verifier 均 PASS（后者回读 8 条 published 关系），生产 SEO smoke PASS，sitemap 共 126 个 URL。`/cn/tasks/meeting-notes` 仍为 404，sitemap Task URL 为 0；Task Page 注册表继续关闭，未放开 URL、`continue_index` 或工具索引。**仅 meeting-notes 组完成本次整改**；DIFF-07 其余 cluster 转入编辑整改与独立验收，DIFF-08 Decision Assistant 继续 blocked。详见 [DIFF-07 发布审计](./DECISION_GRAPH_DIFF07_RELEASE_AUDIT_2026-09-23_CN.md)。

2026-09-30 meeting-notes 首个 Task Page 最终门禁与生产验证完成：Owner 已执行受控 SQL，`meeting-summary-and-actions=required`、`meeting-transcription=preferred`，二者均 published/current/reviewer-backed；三条 Fit 均 published/current，9/9 evidence link 为同 owner verified/current。批准提交 `97c4f400` 已进入 main；生产 `/tasks/meeting-notes` 与 `/cn/tasks/meeting-notes` 均为 200、自指 canonical、`noindex, follow`，页面可见 Fathom、Otter.ai、Fireflies 及其官方来源、核验/复查日期。其余五个首批 Task 仍为 404；sitemap 共 126 URL、Task URL 为 0；production SEO smoke PASS。未改 sitemap 生成器、工具索引或 Decision Assistant；freshness 失效或审批撤回时必须同步移除注册表 slug。详见 [DIFF-07 发布审计](./DECISION_GRAPH_DIFF07_RELEASE_AUDIT_2026-09-23_CN.md)。

2026-09-25 剩余五个 Task cluster 的编辑整改方案已通过 CL-00 独立 review（QA_PASS）；下一步为 CL-01 Admin closure。执行顺序、Admin 常规编辑闭环、逐组原子发布和 Task Page 独立门禁见 [剩余 cluster 整改计划](./DECISION_GRAPH_REMAINING_CLUSTER_REMEDIATION_PLAN_CN.md)。本条仅链接计划，不代表任何新增关系获批或发布。

2026-09-27 CL-03 Ray3.2 evidence/关系候选获独立 QA_PASS，允许保留候选包；`availability` 直接证据仍缺，生产关系继续 HOLD、未发布。CL-04 对既有 `build-app-with-ai`、n8n、OpenRouter 完成资格审查与字段级本地候选，两条现有 Task Fit 均建议 withdraw；没有生产关系写入或 Task Page、索引放行。详见[CL-04 资格审查](./DECISION_GRAPH_CL04_APP_BUILD_ELIGIBILITY_2026-09-27_CN.md)。

2026-09-27 CL-07 剩余五组生产只读 closeout 完成：[汇总审计](./DECISION_GRAPH_CL07_PRODUCTION_CLOSEOUT_2026-09-27_CN.md)确认 CL-02 的 2 Task Capability + 1 Consensus Tool Capability + 1 Fit 仍为 published/current、13 条目标 evidence link 通过 owner/source/claim 门禁；CL-03 Ray3.2 候选 QA_PASS 但 availability 缺口继续 HOLD；CL-04 n8n/OpenRouter 两条 Fit 仅建议 withdraw、生产仍 reviewed，Tool Capability contextual/HOLD；CL-05 Voice 两条 Task rationale 候选、ElevenLabs/Descript conditional/HOLD；CL-06 Brand 两条 Task rationale 候选、Jasper/Grammarly conditional 与 Claude contextual/HOLD。CL-05/06 Tool Capability/Fit 均未创建。五个 Task URL 仍为 404，robots/sitemap 正常，sitemap 126 URL、0 Task URL；Decision 专项、tsc、完整 build 和生产 SEO smoke 通过。没有生产写入、发布、部署或索引改动。DIFF-08 的每 Task 至少 3 条真实 published Fit 等硬条件未达，继续 blocked；后续按各编辑包补证据、独立 QA 与受控单组审批。

差异化开发执行规则：先定义用户价值和风险，默认最小实现；dormant/noindex 功能不新增网络服务。默认验证为专项测试、`tsc`、完整 build 与一次生产模式 smoke；单项超过 60 分钟或连续两次 QA FAIL，交总控重新选方案。仅安全、支付、数据一致性 P0 可扩大测试范围。

2026-09-20 规模化口径更新：生产基线为 63 条工具记录、50 条已公开、13 条获准索引；技术和 SEO 护栏稳定，当前增长瓶颈转为高
质量工具库存和差异化覆盖。成熟工具正常运营日每天至少公开 1 个、最多 2 个；通过提前维护 Task Cluster 候选缓冲保证大多数日期达标。仅证据冲突、重复实体、生产/构建故障、权限阻塞或缓冲确实没有合格对象时可为 0，记录 blocker 并优先补充候选包。索引仍逐页审批，每天最多 1 个、
目标每周 4 个且硬上限 5 个。完整阶段目标、维护频率和暂停门禁见
[高质量工具规模化与分层维护路线图](./CONTENT_SCALE_AND_MAINTENANCE_ROADMAP_2026-09-20_CN.md)。

四周实施排期见 [证据驱动目录优化计划](./FOUR_WEEK_EVIDENCE_LED_DIRECTORY_PLAN_CN.md)。

项目迭代统一遵循 [AI Best Tool 总控协作协议](./AI_PM_ORCHESTRATION_PROTOCOL_CN.md)：用户只向总控下达目标；每个交付单元固
定创建一个开发任务和一个独立验收任务；开发不得直推 `main`，QA PASS、本地完整 build 与生产验证完成后才允许关闭，完成任务
随后归档。2026-09-10 Best 页面与 SEO 边界修复是该协议下的首个正式闭环交付单元：首次独立验收为 FAIL，同一开发任务完成修复
并由同一 QA 复验；总控完成主分支回归、完整 build、部署和线上 smoke，最终 `main` 为 `ede3fec7`，状态为
`PROD_VERIFIED / CLOSED`。

当前收尾执行见 [质量收尾与状态校正子方案](./QUALITY_CLOSEOUT_IMPLEMENTATION_2026-09-04_CN.md)，不是新主线。四周一级任务
10/13完成（76.9%）；持续运营、内容覆盖、生产验收与效果验证分别统计。

2026-09-06 RC-07 第一组完成 4/17：OpenAI 家族历史记录已按公司、API 模型、桌面入口和停服产品分别纠偏，移除非官方安装包及
无依据旧声明，统一官方入口并设为 `monitor`。数据库回读与缺排期 19 -> 15 已确认，专项测试、类型检查、完整 build 及中英文
生产 smoke 通过，部署提交 `b0dac6aa`。详见 [专项记录](./OPENAI_FAMILY_LEGACY_SCOPE_CLOSEOUT_2026-09-06_CN.md)。

RC-07 第二组完成后进度 8/17：Character.AI、Shutterstock GenAI、Suno、Viggle 已完成官方事实范围、双语决策正文、静态
fallback 和数据库同步，均保留原索引批准并于 2026-09-20 复查；没有伪造独立实测或市场评分。数据库回读确认缺排期 15 ->
11；Suno 大小写 slug 已安全归一为 `suno_ai`，专项测试、类型检查和完整 build 通过，代码待提交部署。

RC-07 第三组完成后进度 14/17：ArtiverseHub AI、FastImage、HoneyDo、Shop、Tattoo AI Design、Woy.ai 已纠正对象/旧文案并转
`monitor`，缺排期 11 -> 5；只剩3条安全/合规对象，Adobe/Salesforce 2条另属RC-05C。完整 build 与数据库幂等回读通过。

RC-07 已于 2026-09-06 完成 17/17：最后三条安全/合规对象不做流量或转化增强。`aigirl-best` 与 `undressing_ai` 归
档，`anime-girl-studio` 纠正旧范围后转 `monitor`；三条统一绕过普通工具评分、推荐、CTA 和 `SoftwareApplication` schema，
并退出 sitemap。生产数据库固定记录保护、dry-run、正式事务、独立回读、专项测试、TypeScript 检查与完整 build 均通过。缺排
期 5 -> 2，余下仅 Adobe/Salesforce Einstein，转回 RC-05C 处理。该段记录 09-06 阶段快照；两条随后补齐排期，并已于 09-08
完成范围、证据与索引处置，当前状态以本页后文的 RC-05 完成记录为准。

RC-08 已完成分类事实边界和 MON 运行审计：分类页不再把框架复核日期表达成全分类工具事实核验，代表工具卡只承担导航理由；价
格、功能、限制、证据日期和判断状态统一回到工具详情页。生产 MON 审计确认事实日历 1 个到期、11 个已排期；Gamma 已用当前官
方文档建立首条证据型判断基线；Luma Dream Machine 随后根据官方授权、credits、订阅/API 分离与 Modify 文档完成同类基线；n8n
再依据官方执行计费、Community Edition、Sustainable Use License 与 queue mode 文档完成同类基线；OpenRouter 又依据官方路
由、供应商日志、ZDR 和定价页完成同类基线；Runway 再根据官方 credits、商业使用权、Creative/API 分离与 Studio 编辑文档完成
同类基线。Dune在修复Supabase情报档案与Neon目录孤立后，保持`monitor/noindex`并依据官方产品边界、SQL工作流、新鲜度与成本模
型完成判断基线；The Graph最后依据官方产品边界、网络支持、API key安全与查询计费完成同类基线。这些证据型记录均明确不是亲手
试用。工具判断范围现为10/10并已收口；站点和分发项目保留30天事实复核，但不适用工具专属的90天选型判断。后台默认Tools范围，
并保留Site evidence、Distribution history和All profiles历史入口，不删除证据。MON 被明确为页面加载时计算的人工编辑日历，
仓库没有自动情报同步 workflow，不能宣称自主抓取持续运行。历史 Stack/Trial 空表基线已由 2026-09-06 的首个真实 Codex Stack
与 7 天 Trial 打破；RC-08 已进入真实观察期，仍需完成全部检查项和最终决策后才能关闭。

2026-09-06 RC-08 真实 Trial 前置已完成：Codex 已按“AI 编码代理”而非 OpenAI 公司或单一模型建立受控目录记录，附官方来源、
双语边界和 5 项 7 天试用模板。该记录保持 `published + monitor + noindex`，不进入 sitemap，也不计作新的索引放行；Trial 页
面选择 Codex 后会自动载入可编辑的目标与检查项。生产事务写入、独立回读、专项测试、TypeScript 与完整 build 均通过。剩余动
作必须由真实登录用户开始并完成 7 天 Trial，记录实际检查结果及 Keep/Compare/Cancel 决策；真实 Trial 已于北京时间
2026-09-06 16:26 启动，预计 2026-09-13 16:26 到期，当前 5/5 检查项待观察。在最终决策写入前 RC-08 不标完成；其本身不改变
四周一级任务统计，后续 W2-02 首批 14 条收口完成后四周比例已更新为 10/13。

2026-09-06 真实验收发现 Trial 曾允许在观察期第 1 天提前写入 5/5 结果和 `keep`，因此该记录只能证明流程可用，不能作为完整
7 天使用证据，RC-08 继续保持观察中。完成动作现增加三层约束：服务端校验 `ends_at`、更新语句再次限定到期时间、页面在到期前
禁用最终决定并显示开放时间；检查项仍可在观察期内持续记录。专项边界测试覆盖到期前、精确到期和到期后三种情况。现有提前完成
记录不被静默改写，需单独校正后在 2026-09-13 16:26 或之后提交最终决定。

用户确认后，提前完成记录已恢复为 `active + undecided`，5 项 `pass` 结果完整保留。同期完成 LNK-01 全量收口：线上24个分类
代表工具入口均为200，现统一直达工具页 `#decision-card`；18个可索引Guide、8个人工关系源和分类易变事实禁复制规则通过自动验
收。这不会新增页面、修改 sitemap 或放开索引；RC-08 当前只等待9月13日到期后的真实最终决定。

RC-01至RC-04首轮治理已完成：状态校正、结构化内链测试与计划一致性守卫、生产只读19项缺排期回查均已执行；专项测试及完整
build通过。该段是首轮阶段快照，当时没有完成新的工具核验、四周比例不增加；其后 RC-05 已按事实纠偏并完成索引处置，不直接迁
移到不同产品身份。

2026-09-04 日常收录更新：W2-02B 累计处理 12/7-14，今日完成 OpenRouter 与 n8n 两条既有 fallback 的生产实体迁移，均保留原
canonical。两者线上验收均已通过；n8n 提交 `37ceb6d2` 已获 Vercel 部署成功确认，双语 index/canonical/新正文和 sitemap 生
产验收通过。今日达到 2 条上限，不再新增第 3 条。累计处理数不是每日公开数。

2026-09-06 日常收录更新：W2-02B 累计处理 13/7-14。四个开发者入口此前指向 `/ai/github-copilot`，但该路径只有自动
fallback，而既有 `copilot` 实体实际代表 Microsoft Copilot，形成产品身份冲突。现已将 GitHub Copilot 建为独立生产实体，补
齐当前套餐与 AI Credits、IDE/Agent 工作流、内容排除边界、Stack Overflow 调查和独立评价证据，市场验证为
`97/100 / Validated`。生产回读确认 `published + monitor + noindex`，下次复查 2026-09-20；本周索引额度仍为 0，不进入
sitemap。专项内容、身份链接、TypeScript、数据库 rollback/commit/status 与完整 build 均通过，提交 `33f831ca` 已部署并完成
双语生产验收。

2026-09-06 W2-02 首批收口完成：NotebookLM 作为第 14 条，将站内已有 `/ai/notebooklm` 空壳 fallback 转为独立生产实体。旧种
子的“完全免费”口径已纠正为 Standard 与 Google AI Plus/Pro/Ultra 并存的 freemium 边界；补齐来源额度、账号级数据处理、引用
准确性、资料质量和开放网页发现边界，市场验证为 `90/100 / Validated`。生产回读为 `published + monitor + noindex`，复查日
2026-09-20，不进入 sitemap。W2-02B 达到 14/14 并完成，四周一级任务更新为 10/13（76.9%）；后续候选处理转为持续运营。

差异化、证据账本、变化追踪与商业化触发条件见
[AI 工具决策平台差异化与商业化实施路线图](./EVIDENCE_DECISION_PLATFORM_ROADMAP_CN.md)。

### 当前维护优先级（更新至 2026-09-14）

2026-09-14 延期补发：Lovable（原 09-11）与 Midjourney（原 09-12）已分别独立 commit，实际发布日期均为
09-14，nextReviewDate=2026-10-14。总控部署完整 Card 修复后，两项生产全量审计均通过：唯一实体、完整 en/zh/cn 正文、全部
Card 条目、媒体与双语 200/self-canonical/noindex；全站 58 实体/46 published/13 indexable，sitemap 仍为 116 条/26 个工具
URL，无重复、遗漏或越界。两项保持 published/monitor，不增加索引额度。最终证据见
[延期补发交付](./DELAYED_LOVABLE_MIDJOURNEY_RELEASE_2026-09-14_CN.md)，提交总控复核归档；本次持续运营不提高四周一级进
度。

2026-09-07 持续收录准备：已建立 [下周成熟工具候选与发布节奏](./NEXT_WEEK_MATURE_TOOL_INTAKE_2026-09-07_CN.md)。候选顺序
为 Synthesia、Replit、Otter.ai、Lovable 与 Midjourney；五个候选均已完成结构化预审与生产查重。Synthesia 与 Replit 已分别
在 09-08、09-09 通过当日门禁并以 `monitor/noindex` 发布。下一槽为 Otter.ai，已完成查重、结构化预审和 alias 代码收口：旧
`/ai/otter` 及本地化路径统一 308 到唯一 `/ai/otter-ai` canonical，部署后双语路径、canonical、noindex 和 sitemap 排除均已
验收；09-09 又完成发布前材料包与自动日期门禁。2026-09-10 已完成当天官方复核并发布：标准月付与年付价格、首次订阅促销、地
区/教育折扣已隔离，分钟、导入、历史、并发、自动加入、共享、隐私和企业 API 边界均已回写。生产记录为
`published + monitor`，双语页面继续 noindex、sitemap 未扩张，下一次复核为 2026-10-10。当前 Lovable 的旧双余额冲突也已通
过实时官方文档解决：当前为 Build/Cloud/AI 统一 credits，旧口径仅作历史或过渡账户提示；其预审最早排在
2026-09-11。Midjourney 的价格、GPU 计费、Web/Discord、编辑、视频、默认公开、Stealth 与商业权利边界已补齐，最早排在
2026-09-12。当前没有配置 DataForSEO，因此不伪造搜索量；审核可以并行，但公开默认每天 1 个，全部先 `monitor / noindex`，索
引仍需单独批准。准备阶段没有写生产；后续 Synthesia/Replit 的独立发布也没有改变 sitemap，四周一级进度仍为
10/13（76.9%）。

2026-09-07 发布与索引防回退：已完成五候选统一发布流水线和首轮全站索引一致性审计。流水线将预审、生产查重、发布载荷、事务
回滚/提交和发布后页面验收统一，但首次发布固定为 `published + monitor`，不能自动批准索引；命令级测试确认日期和缺失载荷会
阻断。生产只读审计覆盖 52 条数据库记录、41 个 published 工具及其 82 个中英文页面：15 个允许索引工具与 sitemap 30 个工具
URL 完全一致，遗漏、越界、重复、canonical 和 robots 冲突均为 0；sitemap 总数仍为 138。本项不依赖 GSC、没有生产写入，四周
一级进度保持 10/13。

2026-09-08 持续收录执行：Synthesia 已完成发布日事实复核，价格更新为 Basic `$0/月`、Starter `$29/月`、Creator `$89/月`，
并补齐共享 credits、license 自动升级、数字人同意及 API 账号/限额边界。生产发布先通过事务 rollback 演练，再显式 commit 并
回读为 `published + monitor`；索引审批保持关闭，双语页面继续 noindex 且不进入 sitemap。统一流水线同时补齐
released/monitor 状态契约，避免数据库发布成功后验证器仍按未发布状态运行。该项属于 W2-02F 持续运营，不提高四周一级进度，
仍为 10/13（76.9%）。

2026-09-09 持续收录执行：Replit 已重新核对当天官方价格、Starter/Core/Pro 权益、effort-based Agent 计费、共享云 credits、
Starter 发布限制和用量延迟。生产查重、在线 fallback、事务 rollback、完整 build 和显式 commit 通过，固定实体发布为
`published + monitor`，复查日 2026-10-09；不批准索引、不进入 sitemap。09-08 的准备快照保留为发布前证据，不冒充发布日事
实。

2026-09-09 Otter.ai 发布前准备：alias 提交 `132e83b0` 已部署，英文和中文旧路径均 308 到 `/ai/otter-ai` 对应
locale；canonical 页为 200、自 canonical、`noindex, follow` 且不在 sitemap。新增独立准备快照，只固定产品边界、试用协议、
现有本地素材与 09-10 复核清单；官方价格页同一文档中的月付、年付、促销与地区值不得混写，正式价格和 `reviewedAt` 只能在
09-10 复核后写入。

RC-05 已完成：Adobe/Salesforce 的范围正文、列表/静态兜底、metadata、数据库原文及生产页面已统一，通用价格/评分/比较卡、单
软件 schema 和等价替代暗示均已撤下。2026-09-08 RC-05C 又确认两个 canonical 未进入最近 GSC Top Pages，但未把缺行写成 0 流
量；结合对象身份与独立证据，两条固定记录已从 `continue_index` 转为 `monitor/noindex`，复查日 2026-10-08。历史 URL 保留，
不错误重定向到 Firefly/Agentforce；comparison 继续 noindex。见
[本轮范围澄清](./LEGACY_PRODUCT_SCOPE_CLARIFICATION_2026-09-04_CN.md)，本项是质量子方案收口，四周一级比例仍为
10/13（76.9%）。

全站导航修复：已确认重复语言前缀不限于工具页，个人中心和提交表单同类入口也受影响；共享 Link、旧地址修复及安全登录回跳已
实现，77 个源码文件检查、182 页/5,406 处内部链接扫描、完整 build 和中文正文登录点击通过。实现提交 `4c3e01a1`；验收边界见
[全站导航审计](./LOCALIZED_NAVIGATION_AUDIT_2026-09-04_CN.md)，未修改生产数据或索引策略。

对象复核最终状态：Adobe/Salesforce 的数据库查重、静态引用、线上页面、GSC Top Pages 口径和独立证据均已复核；未建立
Firefly/Agentforce 独立 tools 记录，也未错误迁移身份。两条历史范围页现为 `monitor/noindex`，已退出 sitemap，2026-10-08
复查；完整决策见 [范围澄清实施](./LEGACY_PRODUCT_SCOPE_CLARIFICATION_2026-09-04_CN.md)。附带发现的重复语言前缀已由独立修
复 `373d2336` 部署及生产验收关闭，不再列作待修项。

最新准入口径：以 [唯一收录规范](./BEST_DIRECTORY_POSITIONING_AND_INTAKE_CN.md) 的对象类型及八项门槛为准，品牌/流量/付费/
完整度分数不能替代准入；公开、索引与推荐分开。Adobe、Salesforce Einstein 未通过独立产品身份准入，已按历史范围页隔离；未
来 Firefly/Agentforce 必须以独立实体重新走资料、市场和索引门禁，不能继承旧页批准或信号。

维护审计、数据库字段缺口和排期明细见 [本轮维护审计](./MAINTENANCE_AUDIT_2026-09-04_CN.md)。

Gamma 验收补充：`33e65beb` 部署成功后发现新简版提示被官方快照去重逻辑隐藏，随后已修复实际展示分支，复用统一文案并新增双
语实际 HTML 验收。官方事实复核与 CHG-02 基线均已完成；未做的仅是账户结账和导出实操，不能把该实操缺口表述为整页事实复核仍
在进行。具体说明见 [历史核对及维护记录](./INDEX_HISTORY_RECONCILIATION_2026-09-04_CN.md)。

- P0：统一数据库保护已应用生产，提交 `9fa46afc` 的 Vercel 部署已确认成功。已补记 9 月 1 日十次可证实迁移，与 9 月 4 日两
  次合计至少 12 次，本周剩余额度 0；完整旧历史仍有未知部分，不伪造日期、不自动恢复批准。补账幂等/事务回滚及工具行不变断
  言通过。详见
  [历史核对](./INDEX_HISTORY_RECONCILIATION_2026-09-04_CN.md)、[保护运行说明](./INDEX_RELEASE_GUARD_RUNBOOK_CN.md)。
- P0：本轮生产 SEO、health 和 ads.txt 只读审计通过；sitemap 162 URLs。另修复 SEO smoke 重定向请求无超时/未释放响应体的问
  题，重跑断言全部通过且退出 0。
- P1：Consensus、Gamma 到期复核已于 9 月 6 日提前完成。Consensus 当前套餐、语料、全文与 Deep Review 事实和生产正文一致，
  记录为 `reviewed_no_change`；Gamma 根据新版官方导出文档纠正 PPTX 字体归因，并补默认可编辑表格与圆角回退边界。两页继续
  `monitor/noindex`，下次事实复查为 10 月 6 日；独立论文验证码与 Gamma 实际结账金额缺口保留，不重置市场验证。详见
  [本轮维护](./CONSENSUS_GAMMA_MAINTENANCE_2026-09-04_CN.md)。
- P1：Emdash 已依既有 9 月 1 日核验 +30 天补齐生产复查日期 10 月 1 日；未改正文、验证日期或索引状态。缺排期从 23 降为 22
  是该阶段历史快照；后续对象复核与安全收口已将缺排期降至 0，未用补日期冒充事实核验。分类与完整执行记录见
  [历史工具排期审计](./LEGACY_TOOL_REVIEW_SCHEDULE_AUDIT_2026-09-04_CN.md)。MAINT-04 与 MAINT-05 均已完
  成；Adobe、Salesforce Einstein 的 URL/索引处置也已由 RC-05C 于 09-08 关闭，不再归入排期补齐任务。
- P1：CHG-02 已完成10/10。Fathom、Claude、Consensus、Gamma、Luma Dream Machine、n8n、OpenRouter、Runway、Dune、The Graph
  均有真实幂等`fact`基线；The Graph以官网产品名和定位完成最后一条。基线主锚点固定按产品名、官网定位、其他事实排序，同步
  脚本统一从Supabase验证工具owner，提取器限制站点身份只取首页并拦截假套餐。ElevenLabs/Descript/Perplexity/Make按robots停
  止，QuillBot证据为空、Poe证据过薄，均未用于凑数。
- P1：Gemini 既有页面官方事实维护完成，修正手机入口误导及中文复制英文，补访问/额度/隐私边界与来源；下次复查9月18日。当时
  缺排期22→21，本地与线上双语验收通过，sitemap仍162，无新增索引批准或市场评分。详见
  [Gemini维护](./GEMINI_MAINTENANCE_2026-09-04_CN.md)。其后的Notion、Poe维护也已完成，不再重复排入待办。
- P1 最新：Notion、Poe 本轮官方事实维护完成2/2，修复中文复制英文及Poe移动端/保密错误，补使用边界与试用检查；下次均为9月
  18日。四个语言页本地及生产验收通过，缺排期21→19，sitemap仍162；未新增索引批准或市场评分。详见
  [Notion/Poe维护](./NOTION_POE_MAINTENANCE_2026-09-04_CN.md)。这里的缺排期数字是当批历史快照；Adobe/Salesforce 后续范
  围、独立证据和索引决策均已在 RC-05C 关闭。
- P1 最新：Perplexity 与 Make 的到期前官方事实维护已完成本地核验。Perplexity 明确展示官方 Free Pro Search 3次/5次冲突，
  并补网页订阅、API 与 Computer credits 的独立边界；Make 的 credits、AI 双重成本、数据区域与 webhook 队列事实无变化。两
  条均保留 `monitor/noindex`，下次复查 10 月 6 日，不刷新市场验证或冒充实测。提交 `b75b1637` 已部署，8 个中英文维护页与
  全站 SEO smoke 均通过，sitemap 保持 138。执行记录见
  [Perplexity/Make维护](./PERPLEXITY_MAKE_MAINTENANCE_2026-09-06_CN.md)。
- 数据依赖：下一次同期 GSC 7 天、28 天与 Coverage；真实 owner/评论/Stack/Trial 信号需用户实际使用，不能由 AI 编造。

新决策能力的字段级实施、自动验收和 SEO 架构边界分别见：
[三阶段实施方案](./DECISION_PLATFORM_THREE_PHASE_IMPLEMENTATION_CN.md)、
[自动化测试与发布验收](./DECISION_PLATFORM_AUTOMATED_ACCEPTANCE_CN.md)、
[SEO 信息架构与不可回退规则](./SEO_INFORMATION_ARCHITECTURE_GUARDRAILS_CN.md)。

## 目标与边界

目标不是增加页面数量，而是在 6 周内验证以下链路：Google 能稳定理解 `AI Best Tool` 是一个可信的 AI 工具目录；目录意图从首
页逐步扩展到少量分类、指南和详情页；有展示的页面能获得更好的排名和点击。

以下行为在本轮冻结：

- 不批量新增同义 guide、comparison 或 alternatives URL。成熟候选保持 14-21 条 Task Cluster 缓冲；2026-10-08 起正常运营日最多公开 1 个通过实体门禁的成熟工具，并可同日推进 1 个最多 5 条的既有 freshness 批次。新工具默认 `monitor / noindex`，账号级未决 Claim 保留限定和复核日，不整体阻止发布。成熟工具在 48-72 小时技术观察后可进入独立索引评审；当前每天最多
  批准 1 个、目标每周 4 个且硬上限 5 个。只有同时通过资料完整度、独立市场验证和索引复核的条目才进入 sitemap；没有合格项
  时记录 SLA 异常并补池，不发布弱页凑数。详见 [工具页索引发布与节奏控制](./TOOL_INDEX_RELEASE_POLICY_CN.md)。
- 不为了“更新日期”批量改写内容；每次更新必须对应真实来源、编辑核查或用户反馈。
- 不把外链数量作为 SEO 成功指标；分发模块只保留维护，不继续扩功能或执行站外投放。

## 2026-08-31 GSC 基线

数据窗口：性能报告 2026-08-01 至 2026-08-28；Coverage 图表最新可见点为 2026-08-21。

| 指标                 |    当前值 |           相比 2026-08-03 | 解读                                             |
| -------------------- | --------: | ------------------------: | ------------------------------------------------ |
| 28 天展示            |     2,243 |              147 -> 2,243 | 明显恢复，但不能等同于全站恢复                   |
| 28 天点击            |        13 |                   0 -> 13 | 已出现真实点击                                   |
| CTR                  |     0.58% |               0% -> 0.58% | 仍偏低，优先做 snippet 与意图匹配                |
| 加权平均排名         |     32.07 |            62.59 -> 32.07 | 可见性质量显著改善                               |
| 最近 14 天展示       |     2,155 |                         - | 占 28 天约 96%，增长发生在窗口后半段             |
| 最近 7 天展示 / 点击 | 1,340 / 8 |                         - | 已不是纯观察阶段                                 |
| 已索引 URL           |       167 | 约 140（8 月中旬） -> 167 | 有回升，但仍需小规模、强质量索引面               |
| `noindex` 排除       |     1,115 |              603 -> 1,115 | 主要是主动收口；禁止因为该数值而批量取消 noindex |
| 已抓取未编入索引     |        24 |                  19 -> 24 | 小规模质量/重复排查对象                          |

核心判断：增长高度集中在首页。首页占 1,838 / 2,243 展示（约 82%）；主要 query 仍是
`ai tools directory`、`ai tool directory`、`ai top tools` 等目录意图。因此下一轮以“首页承接、站内分流、少数机会页做深”为
主，不扩张 URL 总量。

## 2026-09-21 GSC 复盘

新 28 天窗口为 2,837 展示、19 点击、0.67% CTR、平均排名 28.97，表面上高于 08-31；但最近 14 天只有 476 展示 / 2 点击，最
近 7 天只有 170 / 0。Coverage 已索引从 167 降至 140，已抓取未编入索引从 24 增至 45。生产索引一致性与 SEO smoke 全部通
过，因此当前保持索引策略暂停，优先取得 45 个 URL 的 drilldown 并逐条分类；成熟工具可以继续以 `monitor/noindex` 公开维
护，但不得扩大 sitemap。完整分析见 [2026-09-21 GSC 复盘](./GSC_REVIEW_2026-09-21_CN.md)。

2026-09-21 既有索引页维护：Character.AI 已完成受控维护与生产验收。专项脚本补齐 Reading Mode、c.ai+ 真实权益、训练数据地
区边界、Decision Card、Evidence Ledger、用例与市场验证，并保护原 canonical、媒体、分类和 `continue_index`；同时修复历史
事实兜底无条件覆盖数据库新内容的问题。中英文页面回读、索引一致性与 production SEO smoke 全部通过；该任务没有新增 URL 或
扩大 sitemap。完整验收见 [Character.AI 维护交付](./CHARACTER_AI_MAINTENANCE_2026-09-21_CN.md)。

2026-09-21 后续维护：Shutterstock GenAI 已完成当前许可、人工审核、赔偿保护、所有权和市场成熟度核验。受控脚本只更新
Evidence / Decision、用例、标签和下次复核日，并断言 canonical、正文、媒体、分类、价格及 `continue_index` 不变；不新增
URL 或 sitemap 条目。

2026-09-09 CTR 与差异化复核：战略定位“证据、限制、变化和可执行决策”继续成立，也不会改变 Google 对 AI 工具目录的基础理
解；当前问题是差异能力没有稳定进入搜索摘要和所有首屏。首页 metadata 已能表达目录与比较，但通用工具 metadata 仍可能退回
`<产品名> - <分类> AI Tool` 和产品简介；Best 总入口还混入“转化/付费升级”等站内运营语言；部分页面的核查日期陈旧，Evidence
Ledger 又只在 verified claim 存在时展示。下一轮不改 URL 架构，优先完成高展示页面 snippet、首屏决策摘要、证据覆盖标签和
CTR 实验台账。完整结论见 [CTR 与差异化复核](./CTR_DIFFERENTIATION_REVIEW_2026-09-09_CN.md)。

2026-09-09 成熟工具日更 SLA 历史基线：当时将公开与索引拆成两个速度，通过全部准入的成熟工具每天公开 1-2 个并先进入
`monitor/noindex`，索引上限为每天 1 个、每周 3 个。该产能口径已由 2026-09-20 的规模化路线图替代，但公开/索引分离原则继续
有效。现有五条队列已经发布 Synthesia 与 Replit 后原本只剩 Otter.ai、Lovable 和 Midjourney，低于至少 7 条的安全缓
冲。`INTAKE-BUF-01` 已在不改变 09-10 至 09-12 发布顺序的前提下，补充 ElevenLabs、HeyGen、Glean 和 Fireflies.ai，形成连续
7 天的成熟候选缓冲。四项均已通过机器预审，但不构成生产写入或 sitemap 授权；Windsurf 因正在更名为 Devin Desktop 暂缓，避
免实体身份冲突。

2026-09-20 ElevenLabs 延期补发完成：已重新核验价格、PAYG/legacy 计费边界、商业使用、隐私、ZRM 与 API 限制，并以唯一实体
`d7b63bf2-63c8-4015-b59d-2f627450813f` 完成生产事务发布。en/zh/cn 数据回读、双语言页面、Decision Card、比较维度、素材、
数据库契约、全站索引一致性和生产 SEO smoke 均通过；独立发布审计 0 个失败。当前严格保持 `published + monitor/noindex`，不
在 sitemap，2026-10-20 复核事实；最短 48–72 小时后才可进入独立索引评审。详见
[ElevenLabs 延期补发交付](./DELAYED_ELEVENLABS_RELEASE_2026-09-14_CN.md)。

2026-09-20 HeyGen 延期补发完成：网页套餐与共享 credits、网页/API 分账、并发和输入限制、Digital Twin 同意、非 Enterprise
训练退出、Free 输出权利与编辑素材性质均已复核；生产事务先 rollback 后 commit，唯一实体
`4f26ce1c-08fd-4f99-97c9-21864c35bf94` 回读为 `published + monitor`。英中双语及 `zh/cn` 兼容内容、Decision Card、媒
体、canonical、noindex、sitemap 和独立生产审计全部通过。生产基线为 62 条工具、49 条公开、13 条索引、36 条暂停索
引，sitemap 仍为 118 条；下次事实复核 2026-10-20，索引仍需独立审批。详见
[HeyGen 延期补发交付](./DELAYED_HEYGEN_RELEASE_2026-09-20_CN.md)。

2026-09-20 Glean 延期补发完成：企业搜索、275+ 连接器、源权限继承、开发能力、安全资料、定制报价缺失和公司自报采用信号均已
按发布日证据复核；生产事务先 rollback 后 commit，唯一实体 `fd861409-8228-4deb-9802-a9f807d66256` 回读为
`published + monitor`。英中双语及 `zh/cn` 兼容内容、Decision Card、编辑媒体、canonical、noindex、sitemap 和独立生产审计
全部通过。生产基线为 63 条工具、50 条公开、13 条索引、37 条暂停索引，sitemap 仍为 118 条；下次事实复核 2026-10-20，索引
仍需独立审批。详见 [Glean 延期补发交付](./DELAYED_GLEAN_RELEASE_2026-09-20_CN.md)。

2026-09-20 Fireflies 既有实体正规化完成：生产查重确认实体 `57b270b9-78cf-41f8-8b74-dec46400cd65` 已由会议笔记 Pilot 提前
建立，本轮没有增加工具数量。统一流水线已支持身份完全匹配的受控刷新，旧一次性迁移写入口退休；席位价格、AI credits 与默认
Auto-Upgrade、存储和上传限额、入会同意、隐私范围、输出复核及下游数据边界全部更新。rollback、commit、在线 verify、会议
Pilot 关系、独立生产审计、SEO smoke 和索引一致性均通过；基线保持 63/50/13/37，sitemap 保持 118。详见
[Fireflies 正规化交付](./FIREFLIES_REGULARIZATION_2026-09-20_CN.md)。

## 已完成能力

| 优先级 | 已完成项                                                   | 当前价值                                 |
| ------ | ---------------------------------------------------------- | ---------------------------------------- |
| P0     | robots、sitemap、canonical、www/http 重定向与 noindex 收口 | 搜索引擎只看到明确的公开 URL 集合        |
| P0     | comparison / alias 弱页批量收口                            | 减少重复与模板化索引噪音                 |
| P0     | 页面质量状态、下次复查、GSC 台账                           | 能追踪每个索引决策，不依赖记忆           |
| P1     | 首页、Explore、主要分类、Guide、核心详情页的任务与决策信息 | 从纯列表转为可帮助用户选择的入口         |
| P1     | 33 个核心页技术/真实信号审计，16 个机会工具官方证据块      | 页面可展示来源、核查日期、价格或限制边界 |
| P1     | 评论、认领、更新请求入口                                   | 为非 AI 增量内容留出入口                 |
| P2     | Pricing、Submit、Claim、漏斗埋点                           | 商业承接基础仍可用，但本轮不扩展         |

## 当前执行队列

### P0：保护索引面并修复异常（第 1-2 周）

| ID            | 任务                                            | 验收标准                                                                                                        | 状态                                   | 负责人       |
| ------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ------------ |
| IDX-01        | 更新 GSC 周度台账与基线                         | 已写入本次 28 天、7 天、Coverage 和结论                                                                         | 已完成                                 | Codex        |
| IDX-02        | 核对 24 个“已抓取未编入索引”URL                 | 已完成逐条分类，详见 [Coverage URL 审计](./COVERAGE_URL_AUDIT_2026-08-31_CN.md)；不做盲目 Request Indexing      | 已完成                                 | Codex        |
| IDX-03        | 核对 22 个软 404 与 4 个未指定 canonical 重复页 | `how-to-choose-ai-tools` 的英文 canonical 已统一；软 404 URL 明细尚未导出，收到后逐条决定 404、合并或补实质内容 | 进行中                                 | Codex        |
| IDX-04        | 每周生产 SEO smoke                              | 首页、Explore、核心详情、robots、sitemap、canonical 均通过                                                      | 持续                                   | Codex        |
| IDX-05        | 索引准入门槛持续执行                            | 所有新 URL 均通过 [SEO 内容准入清单](./SEO_CONTENT_CHECKLIST.md)                                                | 持续                                   | 共同         |
| IDX-06        | 高质量收录候选池与 "Best Decision Card"         | 首批 10 个成熟工具缺口全部完成实体迁移、合并或决策信号收口；未新增 canonical URL，下一批必须等待 W4 数据触发    | 已完成（成熟工具队列 10/10）           | Codex + 用户 |
| IDX-07        | 四周证据驱动目录计划                            | 第 1-3 周开发项已完成；W4 三期 GSC 决策报告已实现，等待同期数据验证后执行扩大或收口                             | 进行中（W4）                           | Codex + 用户 |
| IDX-08        | 工具页发布与索引解耦                            | `page_quality_status` 同时控制 robots 与 sitemap；新工具默认 monitor；每天最多放开 1 个、每周 5 个              | 已完成；首批逐日复核队列执行中         | Codex        |
| POS-01        | SEO 安全的差异化表达                            | 保留 AI 工具目录主题、索引与结构化数据；首页突出证据、限制和变化，商业入口不干扰编辑判断                        | 已完成；专项测试、tsc、完整 build 通过 | Codex        |
| INTAKE-BUF-01 | 补足成熟工具连续发布缓冲池                      | 队列含 Otter.ai、Lovable、Midjourney、ElevenLabs、HeyGen、Glean、Fireflies.ai；每项均有完整证据、边界和日期门禁 | 已完成（7/7，不写生产、不改 sitemap）  | Codex        |

### P1：让已获得展示的页面变成更可点击的答案（第 2-4 周）

| ID         | 任务                               | 优先页面 / 查询意图                                                                                       | 验收标准                                                                                                                                                                                                                                              | 状态                        | 负责人       |
| ---------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- | ------------ |
| CTR-01     | 首页标题、描述、首屏与 schema 复核 | `ai tools directory`、`ai tool directory`、`ai top tools`                                                 | 文案已与目录词和可见内容一致；英文 canonical 首页已补 WebSite/SearchAction schema                                                                                                                                                                     | 已完成                      | Codex        |
| CTR-02     | 首页 -> Explore -> 分类的分流审计  | 目录通用词                                                                                                | 14 个机会详情页已补证据驱动 fallback，5 个无数据库记录的分类入口已改为虚拟决策中心；生产严格审计 33/33、官方事实块 16/16 通过                                                                                                                         | 已完成                      | Codex        |
| CTR-03     | 强化已有展示的 Guide               | Web3、Automation、Research                                                                                | 三页均已补 3 条任务、适用边界、核验风险和直达工具 Decision Card 的路径；提交 `de1504e6`                                                                                                                                                               | 已完成                      | Codex        |
| CTR-04     | 强化已有展示的详情页               | Fathom、Anthropic、DeepL、Gamma、Lindy、Cursor、The Graph                                                 | 每页保留至少两个官方来源和一个真实选择限制；禁止通用 AI 改写                                                                                                                                                                                          | 已完成                      | Codex        |
| CTR-05     | 真实编辑/owner 信号回填            | 本轮先选 5 页                                                                                             | 每页至少一条有来源的更新、纠错、owner 补充或真实使用记录                                                                                                                                                                                              | 需要数据                    | 用户 + Codex |
| CTR-06     | 首批成熟工具内容缺口               | Claude/Anthropic、Fathom、Gamma、Consensus、DeepL、Runway、Luma AI、Pipedream、Cursor、The Graph          | 10 个既有 canonical URL 已完成合并、数据库迁移或决策内容增强，全程未新增 canonical URL                                                                                                                                                                | 已完成（10/10）             | Codex        |
| CTR-DIFF   | 搜索摘要与首屏差异信号收口         | 全站 metadata 清单、Best/Home 可信文案、4 个工具页试点、工具首屏判断摘要与可信复核日期来源                | CTR-DIFF-01~05 已完成；CTR-DIFF-06 四实体实验登记已启动且禁止观察期改写；134 个 sitemap URL 已盘点                                                                                                                                                    | 进行中；待 14/28 天同页数据 | Codex + 数据 |
| EVD-01     | Evidence Ledger 数据模型           | 所有 claim 统一来源类型、核查状态、复查日、冲突和失效边界；机器提取不自动成为已核验事实                   | 已完成；Supabase 迁移、只读验收、专项测试和 build 通过                                                                                                                                                                                                | Codex + 用户                |
| EVD-02     | 工具页 Evidence Ledger UI          | Decision Card 后可展开核对已验证 claim；候选证据不公开，不以单一分数代替解释                              | 已完成；有效工具身份产生 verified 数据后自动展示                                                                                                                                                                                                      | Codex                       |
| EVD-03     | 后台证据编辑与冲突处理             | 状态受控流转；冲突不自动覆盖；核验人、日期、复查、失效和适用范围可追踪；所有保存操作有中间态              | 已完成；首条真实人工核验已回读确认，专项测试、tsc、完整 build 通过                                                                                                                                                                                    | Codex                       |
| EVD-04     | 情报档案身份映射收口               | `tool` 类型 owner_id 必须对应目录真实工具；存量错误身份重新归类后再公开                                   | 已完成；site 迁移、3 个档案缓存重算、Fathom 真实 UUID -> verified -> 生产公开链路全部通过                                                                                                                                                             | Codex + 用户                |
| CHG-01     | Change Timeline 模型与读取         | 正式历史与机器待审差异分离；事实变化与“复核无变化”分开；公开只读数据仅来自真实 tool 和 public 事件        | 已完成；迁移可读，受控写入、后台/工具页读取、专项测试和类型检查均通过                                                                                                                                                                                 | Codex + 用户                |
| CHG-02     | 首批核心工具变化基线               | 10-20 个核心工具拥有真实基线复核；没有变化时只记录 `reviewed_no_change`，禁止伪造变化                     | 已完成（10/10）；Fathom、Claude、Consensus、Gamma、Luma Dream Machine、n8n、OpenRouter、Runway、Dune、The Graph 均完成真实基线                                                                                                                        | Codex + 用户                |
| SEO-IA     | SEO 信息架构统一与门禁             | 修复历史 canonical/hreflang，统一 Breadcrumb，并让工具关系内链只消费 reviewed 数据                        | SEO-IA-01~08 已完成；本地/生产 smoke、完整 build 和 reviewed 关系验收全部通过                                                                                                                                                                         | Codex                       |
| DCF        | Finder + Decision Card 2.0         | 10 个核心工具和 6-8 个任务形成证据可追溯、最多三项的可解释推荐                                            | DCF-01~07 已完成：数据、证据、规则、前台、后台审核、SEO 与自动发布门禁全部闭环                                                                                                                                                                        | Codex                       |
| STK        | Stack Audit + 7-Day Trial          | 私有工具栈、Keep/Replace/Remove/Missing 与试用到期决策闭环                                                | 已完成（6/6）；双用户真实 RLS、匿名边界、service-only 审计输出、私有路由 noindex/sitemap 排除、生产 smoke、持续监控、类型检查与完整 build 均通过                                                                                                      | Codex                       |
| SIG        | Verified Usage + Change Watch      | 审核后的结构化使用信号和已确认变化通知，不公开低样本或利益相关数据                                        | 等待阶段二真实使用门槛；SIG/WAT 未开始                                                                                                                                                                                                                | Codex + 用户                |
| PUB-UX     | 公开内容边界与页面简化             | 清除公开页面中的索引策略、编辑计划和转化目标；以真实判断、限制和证据替代内部说明                          | PUB-01 至 PUB-04 均已完成独立 QA、部署与生产验证并关闭；真实 Pilot 尚未启动，需单独满足数据和审批门槛                                                                                                                                                 | Codex                       |
| PH0-01     | 产品假设、能力与指标审计           | 六个假设、现有能力、严格事件契约、任务簇评分与 Pilot/Gate 依赖均有仓库证据；不新增事件、URL 或生产写入    | `CLOSED`；[审计与指标契约](./PH0_01_PRODUCT_HYPOTHESES_METRICS_AUDIT_CN.md)已完成，未声称真实数据或 Pilot 上线                                                                                                                                        | Codex + Owner               |
| MEASURE-01 | 决策事件隐私基础层                 | 固定事件/字段 allowlist、30 分钟易失 flow、服务端幂等、流量排除、默认关闭、最小权限迁移与 SEO 零差分      | `PROD_VERIFIED / CLOSED`；[专项文档](./MEASURE_01_DECISION_EVENT_FOUNDATION_CN.md)，独立 QA、主分支 build 与生产 smoke 通过；2026-09-20 迁移和原始表最小权限验证完成，生产采集仍关闭                                                                  | Codex + Owner               |
| MEASURE-02 | 数据治理与 Pilot 边界              | 原始 35 天、聚合 400 天、审计 90 天、20-flow 最小样本、最小权限、内部流量轮换和会议任务簇 Pilot allowlist | `MIGRATED / DATA_READY / RETENTION_READY / PREFLIGHT_BLOCKED / DISABLED`；[治理与 Pilot 文档](./MEASURE_02_DATA_GOVERNANCE_AND_PILOT_CN.md)，数据、路由、证据、每日维护和 48 小时 freshness 告警均通过；仅剩内部 token 哈希和采集/UI 开关，当前仍关闭 | Codex + Owner               |
| MEASURE-03 | Finder 事件最小接入                | 六类既有 allowlist 事件接入，未配置时零请求；敏感条件只发 `redacted`，不改变页面与 SEO                    | `PROD_VERIFIED / DORMANT / COLLECTION_DISABLED`；提交 `4abab03c` 已部署并通过生产 SEO smoke，Owner 决定暂不配置环境变量，代码保持休眠，详见 [MEASURE-03](./MEASURE_03_DORMANT_UI_INTEGRATION_CN.md)                                                   | Codex                       |

2026-09-14 新增公开内容边界治理：生产 Web3 comparison 暴露“保留索引、补真实证据”等内部编辑语言，且共享 Guide 模板将同类
内容扩散到大量页面。该问题不改变既有 SEO 架构结论，但会削弱用户体验、可信度和差异化表达。完整基线、页面契约、分四个交付
单元的实施计划、自动验收与反向评审见
[公开内容边界与页面简化实施方案](./PUBLIC_CONTENT_BOUNDARY_AND_PAGE_SIMPLIFICATION_PLAN_CN.md)。实施期间冻结
URL、metadata、canonical、hreflang、robots、schema 和 sitemap，先完成 PUB-01 门禁与 Web3 样板，生产通过后再扩到其他页
面。

2026-09-14 PUB-01 已关闭：候选 `4c262fe8be109bad1beffbd88cfd3cda2a463a64` 独立 QA PASS，main 提交 `834e1295` 已部署。生
产 Web3 中英文样板、公开内容边界、SEO smoke、索引一致性和 sitemap 验收通过；comparison 仍为 `noindex, follow`，sitemap
保持 116 条。开发视觉测试曾因既有 PageViewTracker 产生 6 条无 `tool_id` 的测试 page-view，已记录且不清理；后续本地视觉验
收必须拦截统计写请求并使用只读数据连接。

2026-09-14 PUB-02 已关闭：候选 `15e16ec34f081688420516149c0adc278db5f24b` 独立 QA PASS，main 提交 `f73fcef5` 已部署。18
个主 Guide、76 个 comparison 和 188 个双语生产页面通过验收；公开边界命中从 1502 降至 51，Guide/comparison 范围为
0。comparison 分类为 1 keep-noindex、10 merge-redirect 候选、65 repair；未执行 redirect 或索引放开。148 个无依据语言页已
撤下 FAQPage/ItemList，Web3 的 4 个真实 schema 保留；sitemap 继续为 116 条。剩余 51 条转入 PUB-03，65 个 repair 只能在补
足真实候选与证据后升级。

2026-09-15 PUB-03 已关闭：最终开发候选 `0fa51b21db3ed2c26000df7edc47a40287e533e7` 经 QA 返工后实现新增 lint 0，并以
`30d68533`、`92988f1a` 合入 main；生产 smoke 契约补丁 `8561e21d` 已部署并复验。Tool、Home、Explore、Best、Category 与商
业 CTA 的公开边界完成收口，源码命中 51→0；390 个生产页面 0 违规。索引审计为 58 条工具、46 条已发布、13 条可索引、46 个页
面 0 问题；sitemap 保持 116 条且无缺失、异常或重复 URL。仓库仍有 1572 条历史 lint 债务且 Next build 当前跳过全仓 lint，
本单元没有新增 lint；下一项只执行 PUB-04，不并行扩 URL 或修改 SEO 冻结项。

2026-09-20 PUB-04 已关闭：首轮候选 `fa1952a546680020fecf46c7cacc1f110f87a572` 因新增测试脚本两处 lint 被独立 QA 退回；原
开发任务定点修复后形成 `448d342f8e721bfcbf2111f14aaceb5b5490d87e`，同一 QA 复验 `QA_PASS`。main 提交
`4edcc369`、`c88c625d` 已推送，主分支目标 lint、13/13 注册测试、冻结测试、专项类型检查、SEO 架构、计划一致性和完整 build
全部通过；生产 smoke 验证 canonical、hreflang、Breadcrumb、noindex、robots 与 116 条 sitemap 正常。生产注册、Pilot 页面
和实验状态保持为空/关闭，未新增 URL、分析事件或 SEO 变更；真实任务簇、3–5 个既有 Pilot 页面及指标治理属于下一独立阶段，
不能冒充 PUB-04 已验证效果。

### P2：只在数据证明后扩展（第 4-6 周）

| ID     | 触发条件                                                         | 动作                                       | 状态     |
| ------ | ---------------------------------------------------------------- | ------------------------------------------ | -------- |
| EXP-01 | 非首页展示占比连续两周提升，且至少 3 个非首页页面各有 >= 20 展示 | 从同一意图簇增加 1 个高质量 hub 或深度页面 | 未触发   |
| EXP-02 | 既有页面连续两轮无展示，且审计确认无独立意图                     | 合并、canonical 或 noindex，不新增替代页面 | 条件触发 |
| EXP-03 | 有真实评论/owner 更新/产品事实且页面已出现 query 信号            | 将该页列入下一批证据增强，不超过 5 页      | 条件触发 |

## 每周复盘指标

每周同一时间导出 7 天和 28 天 GSC 数据，记录：总展示/点击/CTR/排名、首页与非首页展示占比、产生展示的页面数、Top 20
query、Top 20 page、已抓取未编入索引与软 404 数量。

成功不只看总展示。第一个阶段的合格信号是：非首页展示从约 18% 上升、至少 3 个非首页页各获得 20+ 展示、首页目录词 CTR 稳定
提升；第二阶段才看点击和转化。

## 历史方案

- 2026-08-10 及之前的总控、60 天商业、竞品研究、分发与产品证据方案均在 `docs/archive/` 保留，供追溯，不再作为本轮排期依
  据。
- 本轮唯一的执行依据是本文
  件、[四周证据驱动目录计划](./FOUR_WEEK_EVIDENCE_LED_DIRECTORY_PLAN_CN.md)、[GSC 周度观察台账](./GSC_WEEKLY_OBSERVATION_LOG_CN.md)、[Coverage URL 审计](./COVERAGE_URL_AUDIT_2026-08-31_CN.md)、[SEO 内容准入清单](./SEO_CONTENT_CHECKLIST.md)、[核心页面信号审计](./PRIORITY_PAGE_SIGNAL_AUDIT_CN.md)
  与 [重点工具详情说明](./PRIORITY_TOOL_DETAIL_PLAYBOOK_CN.md)。

## 2026-09-20 成熟候选缓冲池

- 状态：完成。
- 对生产 63 条工具记录完成只读去重，建立 14 条候选缓冲；候选只进入深审队列，不创建页面、不进入 sitemap、不批准索引。
- 组合：10 条成熟高需求、3 条快速增长且有证据基础、1 条专业差异化工具。
- 自动门禁覆盖数量、唯一性、来源、决策维度、风险披露及公开/索引批准关闭状态。
- 生命周期异常的 Sourcegraph Cody 和 Amazon Q Developer IDE plugins 已排除，避免以历史热度制造失效页面。
- 详情：[成熟高需求工具候选缓冲池](./MATURE_CANDIDATE_BUFFER_2026-09-20_CN.md)。下一项：Grammarly 受控发布。
- Grammarly 已于 2026-09-21 完成受控发布：官方价格和训练边界复核、生产只读 preflight、rollback、完整 build、commit 与三
  语言回读均通过。生产唯一实体为 `published + monitor/noindex`，保留现有 canonical，不进入 sitemap，也没有索引批准；下一
  次事实复核为 2026-10-20。
- Jasper 发布包已完成：生产无实体，现有 canonical 静态页维持 `noindex` 且不在 sitemap；三语言 Decision Card、本地编辑素
  材、候选流水线和日期门禁覆盖 Pro 单席位、Business 定制合同、credits、品牌上下文、数据处理和人工复核边界。当前没有生产
  写入或索引批准；最早于 2026-09-22 执行只读 preflight 与受控发布。
- 2026-09-21 Owner 对 Jasper 作出一次性、候选限定的提前执行授权：原 `2026-09-22` 门禁保留在预审记录中，统一发布器只在
  `2026-09-21` 对 `jasper` 认定有效，且仍要求生产身份 preflight、默认 rollback、显式
  `--commit`、`published + monitor/noindex`、sitemap 排除和独立索引审批。当天官方价格、credits、Brand
  Voice、EULA/DPA/sub-processors 与 ethics 复核无实质变化；详见
  [Jasper 受控发布交付](./JASPER_CONTROLLED_RELEASE_2026-09-21_CN.md)。
- Descript 已于 2026-09-27 完成单项受控发布：官方事实复核后移除过时的固定 avatar credit 示例；生产只读 preflight、
  rollback、专项测试、TypeScript、完整 build 和显式 commit 均通过。唯一实体为 `published + monitor/noindex`，英中页面保留
  self-canonical，不进入 sitemap，也没有索引批准；下次事实复核为 2026-10-27。详见
  [Descript 受控发布交付](./DESCRIPT_CONTROLLED_RELEASE_2026-09-27_CN.md)。

## 2026-09-22 成熟工具即时质量门禁

- 成熟高需求工具不再为“证明市场成熟”强制等待 48-72 小时：统一发布器仍先写 `published + monitor`，随后可在同一天运行独立
  索引评审。
- 快速通道只豁免时间，不豁免质量分、非占位素材、validated 市场证据、互补官方来源、真实限制、Decision Card、日期、唯一
  canonical、独立搜索意图、自动 SEO、最新站点级 GSC、搜索健康、策略状态和额度。
- 当前生产策略仍为 paused，09-21 GSC 健康为 blocked，因此规则部署不会自动把 Grammarly、Jasper 或其他 monitor 页面加入
  sitemap；恢复必须另行满足站点级门禁。
- Canva 候选已归并到唯一 `canva` 身份；Magic Studio 仅作为 Canva 页面能力模块，禁止生成第二个 canonical 页面。
- 2026-09-22 成熟工具索引首批已完成：Grammarly、Jasper、ElevenLabs、Midjourney 四项质量、素材、市场验证、来源、Decision
  Card、日期、canonical、意图与 SEO 门禁均通过，并通过固定 allowlist、事务 rollback 后正式提交。生产可索引工具由 13 增至
  17，sitemap 由 118 增至 126，仅增加 8 条英中 URL；重复、遗漏、越界和页面异常均为 0。Perplexity 因第二官方来源和
  Decision Card 缺口未纳入。策略已恢复每日 1、每周 5 的常态额度。

## 2026-09-28 Task Cluster 收录组合治理

- 状态：治理规则与现有 14 项候选映射完成；候选深审、公开发布和关系/索引批准均为后续独立门禁。
- 已将 Task Cluster 作为新工具候选组合的基本选择单位，明确候选必须声明 Task、Capability、Constraint、Evidence 缺口、组合角色、决策差异和后续消费位置；建议每个首批 Cluster 形成 3–5 项 Anchor / Alternative / Gap-filler 组合，证据不足时保持候选/HOLD。
- 已明确综合排序信号、新工具发布与既有工具更新分轨、成熟工具快速通道仍受质量门禁约束、公开与索引分离、最近 5 项队列的反同质化复盘及 Tool → Task/Capability/Constraint/Evidence → Task Page/Tool Intelligence/Structured Comparison → Decision Assistant 闭环。
- 唯一规范事实源为[高质量收录与 Best 定位执行规范](./BEST_DIRECTORY_POSITIONING_AND_INTAKE_CN.md)；[成熟候选缓冲池](./MATURE_CANDIDATE_BUFFER_2026-09-20_CN.md)现为 14 项唯一执行台账，逐项记录 primary Cluster、角色、现有 Capability 术语、待核验约束/证据、决策差异、消费位置和研究/发布分轨。`READY_FOR_DEEP_REVIEW=7`、`HOLD_EVIDENCE=3`、`HOLD_DUPLICATE_INTENT=4`、`REJECT=0`；后者包含三个已公开实体与一个只增强既有 Canva canonical 的对象。现有 14 项中可考虑新增实体的仅 10 项，低于 14–21 条可用新工具缓冲目标；本轮只记缺口，不擅增第 15 项。未来 7 个正常运营日每天最多 2 项候选深审/补证，不承诺发布。未注册 Task 与证据缺口保持 HOLD，不代表任何新生产关系、Task Page 或索引获批。索引每日 1、每周目标 4 / 硬上限 5 及成熟工具快速通道继续以[索引政策](./TOOL_INDEX_RELEASE_POLICY_CN.md)为准。
- 独立 QA 对提交 `b7d718d5` 给出 QA_FAIL，指出旧口径“每日目标 2、最多 3、允许 0”与用户最新明确要求冲突。本次按用户要求修正为成熟工具正常运营日每天至少公开 1 个、最多 2 个；只有证据冲突、重复实体、生产/构建故障、权限阻塞或候选缓冲确实没有合格对象时允许为 0，记录 blocker 并优先补候选包。通过提前维护 Task Cluster 候选缓冲保证大多数日期达标；已收录工具事实更新每日 5-10 个且不占新工具名额；索引仍每日最多 1 个、每周目标 4 个 / 硬上限 5 个，额外公开保持 monitor/noindex。此为独立验收后的文档政策修正。
- 本次仅修改治理文档；没有更改业务代码、数据库、页面、自动化、发布数据或索引状态。

## 2026-09-28 N1 候选官方深审

- Elicit 与 Avoma 的官方证据深审完成，结论均为 `HOLD_EVIDENCE`，**待补证据后才可进入发布 preflight**；这不是发布完成。Elicit 的专用综述筛选/提取/导出链与 Consensus 有候选差异，但定价页多组金额、月度用量与独立采用未核清；Avoma 的录制/协作席位、CRM 配置与附加洞察有候选差异，但 Organization 金额、CRM 套餐资格、隐私功能分层及独立采用未核清。
- 生产 `tools` 的只读姓名/URL/标题查重两项均为 0；两项英中预留 URL 均是 `200 + self-canonical + noindex` 的不可用壳，sitemap 匹配 0。下次发布前须重查别名/实体并复用唯一 canonical。
- [N1 官方证据审计与候选包](./ELICIT_AVOMA_N1_OFFICIAL_EVIDENCE_AUDIT_2026-09-28_CN.md)记录官方来源、真实限制、`unknown`、Capability/Constraint/Evidence 建议及后续门禁；[14 项候选台账](./MATURE_CANDIDATE_BUFFER_2026-09-20_CN.md)已更新 readiness。没有生产实体、Decision Graph 关系、页面、sitemap、index、数据库或自动化写入。

## 2026-09-30 Avoma 剩余发布门禁

- 唯一对象 Avoma 仍为 **`HOLD_EVIDENCE`，6 PASS / 2 HOLD**；[证据包与机器清单](./AVOMA_RELEASE_GATE_RECHECK_2026-09-30_CN.md)按 8 个核心页面复核。G2 的 Avoma 产品当前用户评论为强采用，Chrome 商店扩展计数为独立辅助，市场门槛已通过。Organization 定价比较表 `$29/$39` 与帮助页 `$39/$49` 冲突；Enterprise 页内旧/新报价并存，CRM 套餐资格、严格同意与留存细节仍影响购买判断。无金额文案不能解除这些权益阻塞；官方证据门槛 HOLD。仓库无可核验授权的 Avoma 真实媒体和三语言完成稿，内容门槛 HOLD。
- 生产只读 `tools` 共 68 条、Avoma name/title/domain/tags/features 命中 0；英中 `/ai/avoma` 均为 `200 + self-canonical + noindex` 的不可用壳；`robots.txt` 200，sitemap 126 URL、Avoma 0。`meeting-notes` Guide/Comparison 意图与候选产品详情分离。仅更新本地证据、候选台账与主追踪；未创建实体、关系、页面、SEO/sitemap/index 变更或生产写入。公开/索引批准均 false，未进入发布 preflight。

## 2026-09-28 N2 候选官方深审

- Zapier Agents 与 Ideogram 官方证据深审完成，结论均为 `HOLD_EVIDENCE`，没有进入发布 preflight。Zapier 官方 09-07 迁移指南将独立 Agents 导向 AI by Zapier，旧 activity 定价/Enterprise FAQ 与新 task 计费和人审控制同时存在，独立产品的长期 canonical 与账户实际权益待消歧；不能借 Zapier 母品牌、Zaps、Chatbots 或 AI Actions 的能力和采用信号。Ideogram 已可界定图像生成、文字版面、编辑/Canvas、批量及独立 API 的边界与商用输出条款，但免费周额度资格、编辑 credit 路径、导出/水印和实际文字质量仍需核实；不能把官方示例当成功率证明。
- 生产 `tools` 共 67 条，`BEGIN READ ONLY` 对两项 `name/title/url` 查重均为 0，随后 `ROLLBACK`；仓库工具 alias 无对应项。Zapier 宽泛路径与两项候选的英中线上 URL 均是 `200 + self-canonical + noindex` 的不可用壳，sitemap 匹配 0；已有宽泛 `/ai/zapier` 内链和 Zapier alternatives Guide 意图须在发布前复核。此只读检查不是完整发布 preflight。独立市场验证均未完成；[N2 官方证据审计与候选包](./ZAPIER_AGENTS_IDEOGRAM_N2_OFFICIAL_EVIDENCE_AUDIT_2026-09-28_CN.md)记录 Best for、Not ideal、真实限制、`unknown`、Capability/Constraint/Evidence 建议及来源。候选台账现为 `READY_FOR_DEEP_REVIEW=3`、`HOLD_EVIDENCE=7`、`HOLD_DUPLICATE_INTENT=4`、`REJECT=0`。本轮只改候选文档；没有生产工具、关系、页面、sitemap、index、数据库、自动化、push 或 deploy。

## 2026-09-28 N3 候选官方深审

- Microsoft Copilot Studio 与 Read AI 官方证据深审完成，结论均为 `HOLD_EVIDENCE`，没有进入发布 preflight。Studio 已按独立产品核清构建/渠道、Power Platform 环境、tenant/maker 授权及 Copilot Credits 包/预购/按量路径，并与 Microsoft 365 Copilot 内含权益、Azure 模型和 Bing 数据边界分开；实际租户成本/权益、数据合同与独立产品级采用仍待核。Read AI 已核 Free 5 次会议/月、跨已授权会议/邮件/消息的 Ask Read、付费 CRM 连接、回放与 Workspace 层级，以及开放 beta API、录制同意和保留差异；实际账户权限/导出、商用传播与独立产品级采用仍待核。两项厂商效率/质量宣传均未作为结果事实。
- 生产 `tools` 共 67 条，`BEGIN READ ONLY` 查 Microsoft Copilot Studio/Read AI 姓名、标题、URL 为 0，广义比较对象仅为 GitHub Copilot 与现有三项会议工具，随后 `ROLLBACK`。仓库无候选 alias；两项英中 slug 和宽泛 Copilot 路径是 `200 + self-canonical + noindex` 的不可用壳，sitemap 对两项为 0。下次必须重查 canonical/意图，已有实体则事实更新/合并。[N3 官方证据审计与候选包](./COPILOT_STUDIO_READ_AI_N3_OFFICIAL_EVIDENCE_AUDIT_2026-09-28_CN.md)记载来源、`unknown`、Best for/Not ideal、真实限制及 Capability/Constraint/Evidence 建议；[14 项候选台账](./MATURE_CANDIDATE_BUFFER_2026-09-20_CN.md)在 N3 后为 `READY_FOR_DEEP_REVIEW=1`、`HOLD_EVIDENCE=9`、`HOLD_DUPLICATE_INTENT=4`、`REJECT=0`。本轮仅候选文档，无生产实体、关系、页面、sitemap、index、数据库、自动化、push 或 deploy 写入。

## 2026-09-28 N4 候选官方深审

- Granola 与 Tabnine 官方证据深审完成，结论均为 `HOLD_EVIDENCE`，未进入发布 preflight。Granola 已确认主动无 bot 设备采集、用户笔记引导、权限内跨会议/团队文件夹 Chat、Basic 30 天可见历史、Business API 及音频不保留但转录/笔记另有留存；实际会议告知/同意、服务商/合同数据路径、账户导出和独立采用待核。Tabnine 官方文档可证 Agent/CLI/Review、主要 IDE 矩阵、SaaS/VPC/on-prem 选择，以及收购后 09-28 仍发布更新；旧定价页实时跳转 Tricentis 联系页，搜索缓存金额不能视为现行报价。当前 SKU/试用和采购、模型与 CI 成本、私有代码路径、收购后长期产品线及完整应用 Task 适配待核，旧版 Basic/Pro 价格和厂商采用宣传不能沿用。
- 生产 `tools` 共 67 条，`BEGIN READ ONLY` 查 Granola/Tabnine/Codota 的姓名、标题、URL 为 0，对照命中 Cursor 与既有三项会议工具，随后 `ROLLBACK`。仓库无对应 alias；两项候选英中 slug、Granola AI 与 Codota 宽泛路径均为 `200 + self-canonical + noindex` 的不可用壳，sitemap 匹配 0。正式 preflight 必须重查身份、Guide/Comparison 意图与唯一 canonical，已有实体只更新/合并。[N4 官方证据审计与候选包](./GRANOLA_TABNINE_N4_OFFICIAL_EVIDENCE_AUDIT_2026-09-28_CN.md)记录官方链接、来源边界、`unknown`、Best for/Not ideal、限制与 Capability/Constraint/Evidence 建议；[14 项候选台账](./MATURE_CANDIDATE_BUFFER_2026-09-20_CN.md)现为 `READY_FOR_DEEP_REVIEW=0`、`HOLD_EVIDENCE=10`、`HOLD_DUPLICATE_INTENT=4`、`REJECT=0`。两项独立产品级市场验证均未完成；本轮仅候选文档，无生产实体、关系、页面、sitemap、index、数据库、自动化、push 或 deploy 写入。

## 2026-09-28 N5 候选官方深审

- Scite 与 Copy.ai 的 09-28 官方证据审计当时均为 `HOLD_EVIDENCE`。10-07 Scite 完成独立 prerelease 深审：八门禁 6 PASS / 2 HOLD（official、content），两项大学图书馆机构采用信号、范围受限的 2023 独立分类评估、当前套餐页、训练/数据处理、导出/API/版权限制和三语 Decision Card 已整理；生产只读查重为零。分类不判断真伪，计数不代表覆盖完整；目标账号账单/API/导出及当前目标学科分类表现、媒体授权、独立内容 QA 与本站纠错入口仍 HOLD。详见 [SCITE-PRERELEASE-01](./SCITE_PRERELEASE_2026-10-07_CN.md)。Copy.ai 按现行 GTM AI Platform 的 Chat、Content Agents、Workflows/Tables 审核；实时价格页与官网旧 Free/Starter/Advanced 博客/自评冲突，不能沿用旧 Copywriter 定价或评价。实际 workflow credit 成本、Agents/API 权益、企业数据合同及当前 GTM 平台独立采用待核。
- 09-28 历史只读审计共 67 条；10-07 Scite 专项只读复核共 69 条，Scite 产品/上下文及 profile 匹配 0。九个 `/ai/scite`、`scite-ai`、`sciteai` 三语路由均为 `200 + self-canonical + noindex` 壳，sitemap 126 条、Scite 匹配 0；Guide 的 Scite 提及是上下文，不是产品实体。发布日仍需重查 alias、Guide/Comparison 意图与 canonical。Copy.ai alternatives Guide 与写作页内链保持旧审计范围。[N5 历史官方审计](./SCITE_COPY_AI_N5_OFFICIAL_EVIDENCE_AUDIT_2026-09-28_CN.md)保留 09-28 日期与事实，不被新 Scite 包覆盖；本单元未写生产实体、关系、页面、sitemap、index、数据库或自动化，也未 push/deploy。

## 2026-09-28 N6 既有事实复核候选

- [Canva/Grammarly 官方事实审计](./CANVA_GRAMMARLY_N6_EXISTING_FACTS_AUDIT_2026-09-28_CN.md)及[字段级候选 patch](./CANVA_GRAMMARLY_N6_CANDIDATE_PATCH_2026-09-28_CN.json)完成。两者继续列在 14 项台账的 `HOLD_DUPLICATE_INTENT` 研究轨道，不占新工具发布槽；该审计未批准新的 Tool Intelligence/Evidence Ledger claim、Task Fit，也未扩大已审计 SAFE patch 范围。
- 生产 `tools` 共 67 条，`BEGIN READ ONLY → SELECT → ROLLBACK` 仅有唯一 Grammarly 实体，状态 `published + continue_index`；其双语真实页和两条 sitemap URL 保持。**Canva 实体为 0**，双语 `/ai/canva` 是不可用 `noindex` 壳且 sitemap 为 0；此前“只增强既有 Canva canonical”的表述只是旧研究假设，现由 `HOLD-CONFLICT` 覆盖。Canva Magic Studio 仍不能另建页面；本任务不以缺失实体为由创建工具。
- Grammarly 现有价格、prompt、训练和隐私字段标 `NO_CHANGE`；组织品牌语调/风格规则对**已有草稿的建议式审阅**可作安全事实增量，旧 Business/Plus 权益待账户核验，AI 初稿自动继承组织规则仍 `unknown/HOLD`。Canva 的 AI 功能、权限、商用与数据处理已分层记入证据候选，但 Free Premium 资格存在官方同页冲突，实际套餐/地区额度、输出素材许可及预览功能可用性待核。下次事实复核 2026-10-05。N6/N7 候选已于 2026-09-29 提交生产；运行时页面已核到增量事实，双语页面与 sitemap 状态符合既有索引判定，未改变索引、canonical、robots、关系或自动化，也未 push/deploy。

## 2026-09-28 N7 既有事实复核候选

- [Jasper/Descript 官方事实审计](./JASPER_DESCRIPT_N7_EXISTING_FACTS_AUDIT_2026-09-28_CN.md)和[字段级候选 manifest](./JASPER_DESCRIPT_N7_CANDIDATE_PATCH_2026-09-28_CN.json)完成。生产只读事务核对两项唯一实体：Jasper 为 `published + continue_index`、双语页面可索引且 sitemap 两条；Descript 为 `published + monitor/noindex`、双语页面 noindex 且 sitemap 0 条。`features.release.indexState=monitor` 仅为 Jasper 受控发布历史，不覆盖当前资格。
- 既有正确的身份、价格/额度、隐私/训练、同意、商用及人审叙述均 `NO_CHANGE`。安全候选只补 Jasper Business Style Guide 的生成作用、单 guide 与 beta 人工复核，以及 Descript AI credits 不结转、Free 水印、本地导出与 API 发布路径；Jasper IQ 的 Pro/Business 表述冲突、实际工作区权限和 Descript 付费 Drive/Enterprise 权益保持 `unknown/HOLD`。N7 属既有工具事实维护，不占新工具发布槽；CL-05/06 关系继续未发布。下次候选事实复核 2026-10-05。以上 2026-09-28 N7 候选审计本身没有写入生产；其后 SAFE 事实更新的生产执行状态见本页主状态与运行回读。
