# OPENAI-FAMILY-IDENTITY-GOVERNANCE-01：身份与 URL 设计门禁

日期：2026-10-09（上海）。本单元只做设计与生产只读审计；没有生产写入、代码路由、索引或重定向变更。机器快照见[只读审计](./OPENAI_FAMILY_IDENTITY_AUDIT_2026-10-09.json)。第五批调查见[上一轮记录](./IDENTITY_FRESHNESS_BATCH_05_2026-10-09_CN.md)。ChatGPT 主工具于同日稍后受控发布，权威记录为[ChatGPT 主工具发布记录](./CHATGPT_CANONICAL_TOOL_CANDIDATE_2026-10-09_CN.md)；本次重新读取数据库与线上页面后，已将旧的“生产无 ChatGPT 行”基线替换为现状。任务输入指定的 `CHATGPT_CONTROLLED_RELEASE_2026-10-09_CN.md` 在工作树中不存在，不另建重复发布计划。

## 官方身份依据与决策

- [ChatGPT 官方 FAQ](https://help.openai.com/en/articles/12677804-what-is-chatgpt-faq)把 ChatGPT 定义为助手产品；[下载与迁移说明](https://help.openai.com/en/articles/20001276-moving-to-the-new-chatgpt-desktop-app)（2026-09 更新）说明新版桌面应用在 macOS/Windows 提供 Chat、Work 和 Codex 视图，旧桌面应用继续以 ChatGPT Classic 受支持，Codex 工作流与历史仍独立。因此生产 `chatgpt` 是主产品实体；`chatgpt-mac` 是有独立安装/兼容/Classic 意图的桌面历史入口，不能仅凭同品牌自动视为可重定向。
- [GPT-4o 官方 API 模型页](https://developers.openai.com/api/docs/models/gpt-4o)仍列出模型、API 接口与 token 价格；它是 API 模型，不是可独立注册的助手产品。现有范围修正文案记载它于 2026-02-13 退出 ChatGPT；这个 ChatGPT 侧历史事件与 API 仍可用须分别叙述。价格、API 权限及模型生命周期每次公开时须重新查官方资料，不从旧工具行继承。
- [OpenAI 开发者入口](https://developers.openai.com/)分别列出 API 平台、Codex 等产品线；`openai` 是公司/品牌及产品家族，不具有单一功能、价格或登录入口。`codex` 是独立编程智能体工具实体，应与 ChatGPT 产品页保持清晰的任务边界。

| 实体/现有 slug | 最终分类 | 搜索意图与用户价值 | 当前门禁 |
| --- | --- | --- | --- |
| ChatGPT / `chatgpt` | **KEEP_TOOL**：主产品行已存在 | 通用助手选择、功能、限制与官方入口；承接网页和客户端的产品级比较 | **现状**：唯一固定 ID `c6a77a90-0bce-4f37-a124-7600e81475a1`，`published/monitor`、noindex；可作为后续同意图客户端迁移目标，当前不批准索引 |
| ChatGPT macOS / `chatgpt-mac` | **MERGE_REDIRECT 候选，当前不执行** | Mac 安装意图与 ChatGPT 主产品相关；官方现已区分新版 ChatGPT 桌面应用、ChatGPT Classic 和 Codex 视图，目标页须解释安装迁移、系统要求和 Classic 支持边界 | **HOLD**：技术上可设计同 locale 单跳 308；当前主页仅给下载入口，未说明 2026 桌面产品迁移与 Classic，尚不足以接住 Mac 专属意图。保留原 200/noindex 页面 |
| GPT-4o / `gpt_4o` | **ARCHIVE_NO_REDIRECT**，退出工具候选 | 官方模型页仍把它列作 API 模型；应保留来源说明供历史/开发者查询，不作为独立助手、工具替代或推荐对象 | **HOLD**：本次不改行状态/URL；从工具关系、推荐和指南中移除。该项目没有 `archived` 工具状态，不能擅自写无效枚举或造成 404。绝不重定向到 ChatGPT、OpenAI 或 Codex |
| OpenAI / `openai` | **CONVERT_BRAND_OR_PLATFORM** | OpenAI 官方将自身定义为 AI 研究与部署公司；品牌导航应分别呈现 ChatGPT、Codex、API 平台等入口 | **HOLD**：仓库尚无品牌路由。先建独立 `/brands/openai` 内容/路由，再单独评估 `/ai/openai` 到同 locale 品牌页的一跳迁移；绝不导向 ChatGPT |
| Codex / `codex` | **KEEP_TOOL** | 代码仓库、工程代理、审查与开发工作流；不是三条旧 slug 的默认接收页 | 维持现有 `monitor/noindex`，索引批准另走工具门禁 |

`MERGE_REDIRECT` 是目标身份确定后的最终 URL 策略，不是当前操作。`CONVERT_BRAND_OR_PLATFORM` 可在 `/brands/openai` 建成并有独立品牌内容后，再单独评估同意图的旧品牌 URL 是否一跳迁移；本设计不批准 `/ai/openai -> /ai/chatgpt`。`gpt_4o` 的 API 模型价值要求保留可读的 noindex 来源页，不能因不适合工具目录就声称模型已不可用。

## 生产只读实体与 URL 图

读取方法：新 Postgres 连接执行 `BEGIN READ ONLY`、参数化 `SELECT to_jsonb(t)-'search_vector'`、`ROLLBACK`；没有写事务。完整行 SHA-256 与第五批记录一致。浏览器外部 GET 核对线上 HTML、`/robots.txt` 和 `/sitemap.xml`。本次选择的五个 slug 中，生产 `public.tools` 有四行，`chatgpt` 为零行。

| slug | 行 ID / 当前状态 | 英文 URL | 英文和中文页面 |
| --- | --- | --- | --- |
| `chatgpt` | `c6a77a90-0bce-4f37-a124-7600e81475a1`；`published/monitor`；复查日 2026-10-16；行 SHA-256 `1e35aec09c0d36a556e9ac53ad6d582ec182fb32bd99524ed4b577b576c1cdde` | `https://chatgpt.com/` | 英/中 GET、HEAD 均 200；自指 canonical、`noindex, follow`；sitemap 0 |
| `chatgpt-mac` | `22561562-5b7e-4e32-b629-ea8626abeeda`；`published/monitor`；复查日 2026-10-06（已过期）；行 SHA-256 `23670082f01ce8bc0dfde94cc656cf696cf0f9d5670977cc2342206eb438b5dd` | `https://chatgpt.com/download/` | 英/中 GET、HEAD 均 200；自指 canonical、`noindex, follow`；sitemap 0 |
| `gpt_4o` | `73a3ca28-707c-4460-b769-50ee47ba5e69`；`published/monitor`；复查日 2026-10-06（已过期）；行 SHA-256 `f65d8a9890b370e57931bd6a2199e65b31d2179f859f42f5c0fd848b6dfe5436` | `https://developers.openai.com/api/docs/models/gpt-4o` | 英/中 GET、HEAD 均 200；自指 canonical、`noindex, follow`；sitemap 0 |
| `openai` | `1ac05946-fab2-48bf-9c5d-6188124db8fb`；`published/monitor`；复查日 2026-10-06（已过期）；行 SHA-256 `01c4835c872b8eb2c8af4edab7d45d0c0664b9e70f53033402b6f83d1764e00b` | `https://openai.com/` | 英/中 GET、HEAD 均 200；自指 canonical、`noindex, follow`；sitemap 0 |
| `codex` | `35b7a4ae-1200-41f2-94c5-d5ba4dc98704`；`published/monitor`；复查日 2026-10-22；行 SHA-256 `b898a7072769c136a8ebda183686959b92945db40c0cbec3baa6bf8e1f051797` | `https://chatgpt.com/codex` | 英/中 GET、HEAD 均 200；自指 canonical、`noindex, follow`；sitemap 0 |

数据库本次以 `BEGIN READ ONLY`、参数化查询五行和行哈希、关系表 SELECT 后 `ROLLBACK`；ChatGPT 受控发布记录另确认其 Task、Capability、Fit、索引账本/审查和受保护的四条旧行。生产关系只读查询本次返回五个实体均无 Product Intelligence Profile/Source/Claim、Tool Capability、Fit、Task、Tool Relationship 或 Claim link。行哈希为 `SHA-256((to_jsonb(tool)-'search_vector')::text)`，是本次后像指纹；不能直接与上一份审计用的序列化方式不同的旧 hash 比较。英、中页面的 GET/HEAD 是新鲜生产请求；`robots.txt` 为全局 Allow，所有五条页面保持 noindex，sitemap 匹配数为零。

`robots.txt` 对 `User-agent: *` 为 `Allow: /` 并指向 sitemap；上述不索引由页面 meta robots 控制。`/sitemap.xml` 对这五个 slug 均无 `/ai/` 条目。`lib/seo/toolIndexing.ts` 规定只有 `published + continue_index + quality >= 80` 才能进入索引，`app/sitemap.ts` 重用此决策。目前这些页面不发 indexable hreflang。生产 `tool_index_release_log` 对三条旧行各有一条 `baseline`，日期未知；`tool_index_review_runs` 对五个 slug 无事件。baseline 不等于当前索引批准。

路由图：`lib/config/toolRouteAliases.ts` 当前没有三条旧 slug 到 ChatGPT/Codex 的 alias。`middleware.ts` 在 locale 重写前处理 alias 为真实 HTTP 308；详情页还用 `permanentRedirect` 兜底。英文 canonical 为 `/ai/{slug}`，中文为 `/cn/ai/{slug}`。`i18n.ts` 还允许 `jp/de/es/fr/pt/ru/tw` 路径；这些语言受 `lib/seo/indexing.ts` 约束为 noindex，例如 `/jp/ai/chatgpt` 当前 200、自指 canonical、noindex。迁移必须在每个已接受 locale 中保持同 locale，不把 `/cn` 导向英文，也不让 `/en` 归一和 alias 形成两跳。

站内边：`lib/config/reviewedToolRelationships.ts` 仍把 `gpt_4o` 与 Claude、Gemini 互列 alternative，将 `chatgpt-mac` 与 Gemini、Claude 比较，并把模型与 Mac 客户端互列 complement；这些跨层边会继续把旧实体送进工具决策。客服指南 `app/[locale]/(with-footer)/guides/ai-tools-for-customer-support/page.tsx` 仍使用 `chatgpt-mac`；Chatbot 和 Code Review 指南分别链接 ChatGPT 主实体。`lib/data/topicToolSources.ts` 将 Codex 留在 coding/agent 主题，符合其独立工具边界。静态遗留数据在 `lib/data.ts`（含重复旧对象和 Mac App Store URL）、范围说明 `lib/config/legacyToolScopeReviews.ts`、页面范围 `lib/content/publicToolScope.ts`；ChatGPT 页面和 fallback 位于 `app/[locale]/(with-footer)/ai/[websiteName]/page.tsx` 与 `lib/config/priorityToolFallbacks.ts`。`/brands/openai` 路由当前不存在。`chatgpt-alternatives-comparison` 是 unavailable 模板，不能作为主产品承接页。

## 顺序、拥有者与回滚点

1. **已完成：ChatGPT 主行发布**。保留固定 ID `c6a77a90-0bce-4f37-a124-7600e81475a1` 与当前审计行 hash，`published/monitor`、sitemap 0、无 Task/Capability/Fit。不能重放 insert 或把 monitor 改为索引批准。若明确要撤回，按 ChatGPT 发布记录的回滚器先预演；只有同一固定 ID 的候选正文仍相等且外键/依赖为空，才可单独删除该新行。此回滚不包含四条旧实体。
2. **关系与静态身份清理**（首个实施候选）：客服指南将 `chatgpt-mac` 切换到 ChatGPT 主实体；移除 `gpt_4o` 与 Claude/Gemini 的工具替代边以及它与 Mac 的 complement 边；Mac/Claude/Gemini 也不再作为同层 alternative。为 ChatGPT 建立只比较同层助手产品的审核关系。更新 `lib/data.ts` 两处重复的 `chatgpt-mac/gpt_4o/openai` 对象、Mac App Store URL、`legacyToolScopeReviews.ts`、`publicToolScope.ts` 和 `reviewedToolRelationships.ts`。不动 `codex` 的独立指南/topic/tool identity。失败时回退单一代码提交；不触碰数据库行、URL、索引和 sitemap。
3. **Mac 承接页与意图复核**：先更新 ChatGPT EN/ZH 页面及官方证据，把 macOS 当前新应用下载、最低系统要求、ChatGPT Classic 的持续支持/旧功能边界、Codex 是独立 view 且 workflow/history 独立讲清。核对 Mac URL 的 Search Console query/外链/流量后判断旧页的查询能否由主页完整满足。现在这步尚未满足，故 308 不适合立刻启用。通过后，在 `/ai`、`/en/ai`、`/cn/ai`、`/jp`、`/de`、`/es`、`/fr`、`/pt`、`/ru`、`/tw` 做 GET/HEAD 单跳 308 到同 locale ChatGPT 200、自指 canonical；检查无循环/两跳。使用本次旧行 hash 作 preimage；异常即撤销 alias，旧页恢复 200/noindex。若意图仍不匹配，保留 200/noindex，不转向通用助手页。
4. **OpenAI 品牌页**：新增独立 `/brands/openai` 路由与多语言导航，清晰分开 ChatGPT、Codex、API 平台及公司信息。当前没有 brands route；必须先验证页面内容、canonical/noindex 和站内品牌入口，之后才可另行启用 `/ai/openai` 到同 locale `/brands/openai` 的一跳 308。不得重定向 ChatGPT。记录现有 OpenAI 行 hash `01c4835c…`；改动失败时回退品牌路由/alias，保留 `/ai/openai` 200/noindex。
5. **GPT-4o 工具目录归档**：先清理推荐、关系和站内工具候选，保留 `/ai/gpt_4o` 作为带官方 API 模型来源的 noindex 历史说明。现有 `tools.status` 仅有 draft/pending/published/rejected，无 archived 值；不写入不存在的状态。不得将其 308 到 ChatGPT/OpenAI/Codex。若后续模型目录 `/models/gpt-4o` 单独立项，须先核对意图并证明目标后才能评估专属迁移；回滚只恢复被删的代码边，不动该模型行和原 URL。
6. **索引与状态单独最后审**：每条工具实体分别使用索引审查账本；ChatGPT、Mac、GPT-4o、OpenAI、Codex 当前全部 `monitor/noindex`，baseline ledger 对三条旧行的 `release_day=null` 且不代表批准。任何 redirect/品牌落地/关系清理均不构成 `continue_index` 授权。索引仅由 `tool_index_review_runs` 和 `tool_index_release_log` 的受控流程决定；发布后观察 7/14/28 天抓取、canonical、soft 404、目标查询与跳出，异常时撤回对应 alias 或退回 monitor。

精确影响面：若按上述后续方案实施，可能改动 `app/[locale]/(with-footer)/guides/ai-tools-for-customer-support/page.tsx`、`lib/config/reviewedToolRelationships.ts`、`lib/data.ts`、`lib/config/legacyToolScopeReviews.ts`、`lib/content/publicToolScope.ts`、`app/[locale]/(with-footer)/ai/[websiteName]/page.tsx` 中 ChatGPT 多语言文案/官方链接、`lib/config/toolRouteAliases.ts` 与 `middleware.ts` 的 Mac/品牌 alias；OpenAI 品牌落地需新增 app 品牌路由/内容。目标尚不批准任何数据库变更。若将来单独改变状态/索引，触及 `public.tools` 中确切五个 ID 及 `tool_index_review_runs` / `tool_index_release_log` / `tool_index_release_policy`；当前关系、Profile/Source/Claim 与关系 Claim-link 查询均为零。机器审计记录了五条 `tools` 前像 SHA-256。任何数据库变更必须与路由提交分开预演、复核 hash，且具备独立回滚；不得通过只改 canonical 假装迁移，不得同时留下会误导搜索的双重 index 信号。

## 自动测试规格（下一实施单元，不在本门禁改变行为）

1. **静态实体图**：从代码候选抽取 alias、关系、guide/toolName、topic 与旧静态记录；断言一个 slug 一个实体类型；旧模型/品牌不进入工具推荐；所有 alias 目标存在；有向 alias 图无环，最大深度 1；Mac 只指 ChatGPT、模型绝不指品牌/ChatGPT/Codex。
2. **数据门禁**：只读事务核 `chatgpt` 恰好一行且内容/图片/日期/官方来源完整，`chatgpt-mac/gpt_4o/openai/codex` ID 与前像锁定；目标缺行、重复、`monitor` 意外变化或 ledger 异常即失败。模拟事务回滚与新连接回读，不以本地 fallback 假充 DB 就绪。
3. **locale 与 HTTP**：覆盖 `/ai`、`/en/ai`、`/cn/ai` 和其余已支持 locale；客户端源只允许单跳 308 到同 locale 200，目标自指 canonical；品牌和模型 URL 不跳到任意工具；noindex/hreflang/sitemap 由状态共同一致，robots.txt 不意外封锁目标。GET 与 HEAD 均检查真实响应头，不只看页面 body。
4. **内容与搜索意图**：主产品页必须解答 Mac 安装入口并明确平台条件；模型页必须指向 API 官方模型文档，品牌页必须分别导航 ChatGPT/Codex/API；逐条人工复核 GSC 查询、外链及可能的 Mac 专属意图，再准许 redirect。静态资料核对日期和 URL 归属进入审计输出。
5. **范围约束**：本门禁仅运行文档检查、只读 SQL/HTTP、静态图验证；若实施单元新增 TypeScript，只运行 `tsc --noEmit` 及与该图/路由有关的定向测试，不运行 build。

未决风险：Mac 旧页的流量/查询意图尚无本次 Search Console 分层；官方桌面产品刚在 2026-07 发生 ChatGPT/Classic/Codex 入口变化，现有主页文案没有完整解释；OpenAI 品牌页和 GPT-4o 模型目录均未建；Mac/GPT-4o/OpenAI 的 next review date 已过，Codex 自身复查日为 2026-10-22；`published/monitor` 仍可能被不检查 page quality 的部分工具选择器取到。以上是身份路由或目录清理的放行条件，不授权立即重定向、状态变更或索引。
