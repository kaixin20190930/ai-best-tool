# OPENAI-FAMILY-IDENTITY-GOVERNANCE-01：身份与 URL 设计门禁

日期：2026-10-09（上海）。本审计的生产快照时间为 22:57 CST，发生在同日较早完成的 ChatGPT 主工具受控发布之后；前序发布记录见[ChatGPT 主工具发布记录](./CHATGPT_CANONICAL_TOOL_CANDIDATE_2026-10-09_CN.md)。本次审计只读生产数据和页面，**本审计生产写入数为 0**；ChatGPT 行属于前序发布，不是本次审计写入。机器快照见[只读审计](./OPENAI_FAMILY_IDENTITY_AUDIT_2026-10-09.json)。此前第五批快照早于 ChatGPT 发布，故其中“生产无 ChatGPT 行”已过时。任务输入指定的 `CHATGPT_CONTROLLED_RELEASE_2026-10-09_CN.md` 在工作树中不存在，不另建重复发布计划。

阶段进度（2026-10-09，已发布并通过独立 QA）：commit `be16f469` 新增 locale-aware `/brands/openai` 独立公司/平台目标页，已推送。九个正式 locale 均提供同 locale 产品导航，分别指向 ChatGPT、Codex、API 文档和公司介绍；页面复用统一 metadata 与面包屑。专项路由/身份/metadata/sitemap 测试、TypeScript 与完整 build 已通过。生产 `/brands/openai` 与 `/cn/brands/openai` 均返回 200、自指 canonical、`noindex, follow`，sitemap 中该品牌路径匹配 0；其他 locale 未在本阶段逐一做生产 HTTP 验证。此阶段仅建立目标页，不改变下述审计时点的生产快照及旧 `/ai/openai`、Mac、GPT-4o、Codex 的状态、alias、索引或数据库；旧路由迁移仍需独立门禁。

## 官方身份依据与决策

- [ChatGPT 官方 FAQ](https://help.openai.com/en/articles/12677804-what-is-chatgpt-faq)把 ChatGPT 定义为助手产品；[下载与迁移说明](https://help.openai.com/en/articles/20001276-moving-to-the-new-chatgpt-desktop-app)（2026-09 更新）说明新版桌面应用在 macOS/Windows 提供 Chat、Work 和 Codex 视图，旧桌面应用继续以 ChatGPT Classic 受支持，Codex 工作流与历史仍独立。因此生产 `chatgpt` 是主产品实体；`chatgpt-mac` 是有独立安装/兼容/Classic 意图的桌面历史入口，不能仅凭同品牌自动视为可重定向。
- **核查日期：2026-10-09。**[GPT-4o 官方 API 模型页](https://developers.openai.com/api/docs/models/gpt-4o)当日列出 GPT-4o 模型名称、API endpoints、版本快照、能力与价格信息；这直接支持“GPT-4o 是 API 模型而非目录中的独立助手工具”。它不证明每个账户/区域当前都有调用权限，也不把文档列出的价目转换成购买建议。ChatGPT 产品侧下线记录与 API 模型页身份分开表述。
- **核查日期：2026-10-09。**[OpenAI Codex 产品页](https://openai.com/codex/)与[使用 Codex 官方帮助](https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan)将 Codex 描述为编程智能体，并列出桌面 Codex mode、CLI、IDE extension 与 Web 等使用入口；[桌面迁移说明](https://help.openai.com/en/articles/20001276-moving-to-the-new-chatgpt-desktop-app)同时说明 Codex 在共享桌面应用中仍有独立视图和工作流/历史。因此目录保留 `codex` 独立工具实体；这项分类不声称它必须有独立账户或独立安装器。
- **核查日期：2026-10-09。**[OpenAI 公司介绍](https://openai.com/about/)将 OpenAI 描述为 AI research and deployment company；[API 文档入口](https://developers.openai.com/api/docs)把 API 建设路径与产品入口分开列出。`openai` 是公司/品牌和多产品平台身份，不具有单一工具的功能、价格或登录入口。

| 实体/现有 slug | 最终分类 | 搜索意图与用户价值 | 当前门禁 |
| --- | --- | --- | --- |
| ChatGPT / `chatgpt` | **KEEP_TOOL**：主产品行已存在 | 通用助手选择、功能、限制与官方入口；承接网页和客户端的产品级比较 | **现状**：唯一固定 ID `c6a77a90-0bce-4f37-a124-7600e81475a1`，`published/monitor`、noindex；可作为后续同意图客户端迁移目标，当前不批准索引 |
| ChatGPT macOS / `chatgpt-mac` | **MERGE_REDIRECT 候选，当前不执行** | Mac 安装意图与 ChatGPT 主产品相关；官方现已区分新版 ChatGPT 桌面应用、ChatGPT Classic 和 Codex 视图，目标页须解释安装迁移、系统要求和 Classic 支持边界 | **HOLD**：技术上可设计同 locale 单跳 308；当前主页仅给下载入口，未说明 2026 桌面产品迁移与 Classic，尚不足以接住 Mac 专属意图。保留原 200/noindex 页面 |
| GPT-4o / `gpt_4o` | **ARCHIVE_NO_REDIRECT**，退出工具候选 | 官方模型页仍把它列作 API 模型；应保留来源说明供历史/开发者查询，不作为独立助手、工具替代或推荐对象 | **HOLD**：本次不改行状态/URL；从工具关系、推荐和指南中移除。该项目没有 `archived` 工具状态，不能擅自写无效枚举或造成 404。绝不重定向到 ChatGPT、OpenAI 或 Codex |
| OpenAI / `openai` | **CONVERT_BRAND_OR_PLATFORM** | OpenAI 官方将自身定义为 AI 研究与部署公司；品牌导航分别呈现 ChatGPT、Codex、API 平台等入口 | **品牌目标页已发布；旧路由迁移 HOLD**：英/中品牌页已验证 200、自指 canonical、noindex 且 sitemap 0 匹配；`/ai/openai` 未启用重定向，后续单独评估同 locale 一跳迁移；绝不导向 ChatGPT |
| Codex / `codex` | **KEEP_TOOL** | 代码仓库、工程代理、审查与开发工作流；不是三条旧 slug 的默认接收页 | 维持现有 `monitor/noindex`，索引批准另走工具门禁 |

`MERGE_REDIRECT` 是目标身份确定后的最终 URL 策略，不是当前操作。`CONVERT_BRAND_OR_PLATFORM` 可在 `/brands/openai` 建成并有独立品牌内容后，再单独评估同意图的旧品牌 URL 是否一跳迁移；本设计不批准 `/ai/openai -> /ai/chatgpt`。`gpt_4o` 的 API 模型价值要求保留可读的 noindex 来源页，不能因不适合工具目录就声称模型已不可用。

## 生产只读实体与 URL 图

读取方法：新 Postgres 连接执行 `BEGIN READ ONLY`、参数化查询与行哈希、`ROLLBACK`；没有写事务。完整行 SHA-256 是本次新基线，不能与第五批的旧序列化 hash 作逐字比较。HTTP 抽样核对线上 HTML、`/robots.txt` 和 `/sitemap.xml`。本快照发生在前序 ChatGPT 发布后：五个 slug 均有生产行，`chatgpt` 不再是 fallback-only。

| slug | 行 ID / 当前状态 | 英文 URL | 英文和中文页面 |
| --- | --- | --- | --- |
| `chatgpt` | `c6a77a90-0bce-4f37-a124-7600e81475a1`；`published/monitor`；复查日 2026-10-16；行 SHA-256 `1e35aec09c0d36a556e9ac53ad6d582ec182fb32bd99524ed4b577b576c1cdde` | `https://chatgpt.com/` | 英/中 GET、HEAD 均 200；自指 canonical、`noindex, follow`；sitemap 0 |
| `chatgpt-mac` | `22561562-5b7e-4e32-b629-ea8626abeeda`；`published/monitor`；复查日 2026-10-06（已过期）；行 SHA-256 `23670082f01ce8bc0dfde94cc656cf696cf0f9d5670977cc2342206eb438b5dd` | `https://chatgpt.com/download/` | 英/中 GET、HEAD 均 200；自指 canonical、`noindex, follow`；sitemap 0 |
| `gpt_4o` | `73a3ca28-707c-4460-b769-50ee47ba5e69`；`published/monitor`；复查日 2026-10-06（已过期）；行 SHA-256 `f65d8a9890b370e57931bd6a2199e65b31d2179f859f42f5c0fd848b6dfe5436` | `https://developers.openai.com/api/docs/models/gpt-4o` | 英/中 GET、HEAD 均 200；自指 canonical、`noindex, follow`；sitemap 0 |
| `openai` | `1ac05946-fab2-48bf-9c5d-6188124db8fb`；`published/monitor`；复查日 2026-10-06（已过期）；行 SHA-256 `01c4835c872b8eb2c8af4edab7d45d0c0664b9e70f53033402b6f83d1764e00b` | `https://openai.com/` | 英/中 GET、HEAD 均 200；自指 canonical、`noindex, follow`；sitemap 0 |
| `codex` | `35b7a4ae-1200-41f2-94c5-d5ba4dc98704`；`published/monitor`；复查日 2026-10-22；行 SHA-256 `b898a7072769c136a8ebda183686959b92945db40c0cbec3baa6bf8e1f051797` | `https://chatgpt.com/codex` | 英/中 GET、HEAD 均 200；自指 canonical、`noindex, follow`；sitemap 0 |

数据库本次以 `BEGIN READ ONLY`、参数化查询五行和行哈希、关系表 SELECT 后 `ROLLBACK`；ChatGPT 受控发布记录另确认其固定 payload 与受保护旧行。关系查询的范围与限制见下文。行哈希为 `SHA-256((to_jsonb(tool)-'search_vector')::text)`，是本次后像指纹。英、中页面 GET/HEAD 是本次生产抽样；`robots.txt` 为全局 Allow，五条页面保持 noindex，sitemap 匹配数为零。

`robots.txt` 对 `User-agent: *` 为 `Allow: /` 并指向 sitemap；上述不索引由页面 meta robots 控制。`/sitemap.xml` 对这五个 slug 均无 `/ai/` 条目。`lib/seo/toolIndexing.ts` 规定只有 `published + continue_index + quality >= 80` 才能进入索引，`app/sitemap.ts` 重用此决策。目前这些页面不发 indexable hreflang。生产 `tool_index_release_log` 对三条旧行各有一条 `baseline`，日期未知；`tool_index_review_runs` 对五个 slug 无事件。baseline 不等于当前索引批准。

路由图：`lib/config/toolRouteAliases.ts` 当前没有三条旧 slug 到 ChatGPT/Codex 的 alias。`middleware.ts` 在 locale 重写前处理 alias 为真实 HTTP 308；详情页还用 `permanentRedirect` 兜底。英文 canonical 为 `/ai/{slug}`，中文为 `/cn/ai/{slug}`。`i18n.ts` 还允许 `jp/de/es/fr/pt/ru/tw` 路径；这些语言受 `lib/seo/indexing.ts` 约束为 noindex，例如 `/jp/ai/chatgpt` 当前 200、自指 canonical、noindex。迁移必须在每个已接受 locale 中保持同 locale，不把 `/cn` 导向英文，也不让 `/en` 归一和 alias 形成两跳。

站内边盘点范围：可复核命令为 `rg -n 'chatgpt-mac|gpt_4o|openai|codex|chatgpt' app lib data --glob '!**/*.test.*' --glob '!**/__tests__/**'`，再手动把运行时页面/配置命中与官方外链、样例/fixture、历史候选正文区分开。确认的运行时入口包括客服指南 `app/[locale]/(with-footer)/guides/ai-tools-for-customer-support/page.tsx` -> `chatgpt-mac`；Chatbot 和 Code Review 指南 -> `chatgpt`；`lib/config/reviewedToolRelationships.ts` 中 `gpt_4o` 对 Claude/Gemini 的 alternative、GPT-4o 与 Mac 页双向 complement、Mac 对 Claude/Gemini alternative；`lib/data/topicToolSources.ts` 将 Codex 放在 coding/agent 主题。身份/素材命中在 `lib/data.ts`（两组重复旧对象及 Mac App Store URL）、`lib/config/legacyToolScopeReviews.ts`、`lib/content/publicToolScope.ts`；ChatGPT 渲染/fallback 命中在 `app/[locale]/(with-footer)/ai/[websiteName]/page.tsx`、`lib/config/priorityToolFallbacks.ts`。这是 slug 字面量检索，不是解析 JSX/Next 路由的全仓链接图；动态拼接、数据库正文和所有外链未计作内部边。

Decision Graph 只读查询按五个生产 `tool_id` 查 `tool_capabilities`、`tool_task_fits`，按这些实体 ID 查 `tool_relationships` 的入边与出边；按五个 owner ID 查 Product Intelligence profiles，再以命中的 profile IDs 查 source/claim；以找到的 capability/fit IDs 查其 Claim link。另只按 `decision_tasks.slug='chatgpt'` 查同名 Task。结果均为零。此范围未扫描全库其他 task/capability 文案中的自然语言提及，不能解释成“所有语义上有关的 Decision Graph 节点均为零”。在本审计快照时 `/brands/openai` 路由尚不存在；其后已按上述阶段进度发布。

## 顺序、拥有者与回滚点

1. **已完成：ChatGPT 主行发布**。保留固定 ID `c6a77a90-0bce-4f37-a124-7600e81475a1` 与当前审计行 hash，`published/monitor`、sitemap 0、无 Task/Capability/Fit。不能重放 insert 或把 monitor 改为索引批准。若明确要撤回，按 ChatGPT 发布记录的回滚器先预演；只有同一固定 ID 的候选正文仍相等且外键/依赖为空，才可单独删除该新行。此回滚不包含四条旧实体。
2. **关系与静态身份清理**（首个实施候选）：客服指南将 `chatgpt-mac` 切换到 ChatGPT 主实体；移除 `gpt_4o` 与 Claude/Gemini 的工具替代边以及它与 Mac 的 complement 边；Mac/Claude/Gemini 也不再作为同层 alternative。为 ChatGPT 建立只比较同层助手产品的审核关系。更新 `lib/data.ts` 两处重复的 `chatgpt-mac/gpt_4o/openai` 对象、Mac App Store URL、`legacyToolScopeReviews.ts`、`publicToolScope.ts` 和 `reviewedToolRelationships.ts`。不动 `codex` 的独立指南/topic/tool identity。失败时回退单一代码提交；不触碰数据库行、URL、索引和 sitemap。
3. **Mac 承接页与意图复核**：先更新 ChatGPT EN/ZH 页面及官方证据，把 macOS 新应用下载、最低系统要求、ChatGPT Classic 的持续支持/旧功能边界、Codex 独立 view 与 workflow/history 讲清。核对 Mac URL 的 Search Console query/外链/流量后判断旧页查询能否由主页完整满足。现在尚未满足，故不启用 308。完整路由模板为 `/ai/{slug}`、`/en/ai/{slug}`（显式英文归一到裸英文路径）、`/cn/ai/{slug}`、`/jp/ai/{slug}`、`/de/ai/{slug}`、`/es/ai/{slug}`、`/fr/ai/{slug}`、`/pt/ai/{slug}`、`/ru/ai/{slug}`、`/tw/ai/{slug}`。本轮仅抽样 EN/CN GET/HEAD，未逐 locale 重跑。真正改 redirect 时执行 H 级门禁，覆盖全部上述 locale 的 GET/HEAD、同 locale 单跳 308、目标 200、自指 canonical、noindex/index 与 sitemap，并检查无环/无两跳。使用本次 Mac 行 hash 作 preimage；异常即撤销 alias，旧页恢复 200/noindex。若意图不匹配，继续保留旧页。
4. **OpenAI 品牌页（已发布、QA PASS）**：独立 `/brands/openai` 路由已提供九个 locale 的 ChatGPT、Codex、API 平台及公司入口；英/中生产页面已验证 200、自指 canonical、noindex 与 sitemap 排除。其他 locale 的实际 HTTP/HEAD 和额外站内入口扩展仍待后续单独复核。之后才可另行评估 `/ai/openai` 到同 locale `/brands/openai` 的一跳 308；本阶段未启用。不得重定向 ChatGPT。记录现有 OpenAI 行 hash `01c4835c…`；改动失败时回退品牌路由，保留 `/ai/openai` 200/noindex。
5. **GPT-4o 工具目录归档**：先清理推荐、关系和站内工具候选，保留 `/ai/gpt_4o` 作为带官方 API 模型来源的 noindex 历史说明。现有 `tools.status` 仅有 draft/pending/published/rejected，无 archived 值；不写入不存在的状态。不得将其 308 到 ChatGPT/OpenAI/Codex。若后续模型目录 `/models/gpt-4o` 单独立项，须先核对意图并证明目标后才能评估专属迁移；回滚只恢复被删的代码边，不动该模型行和原 URL。
6. **索引与状态单独最后审**：每条工具实体分别使用索引审查账本；ChatGPT、Mac、GPT-4o、OpenAI、Codex 当前全部 `monitor/noindex`，baseline ledger 对三条旧行的 `release_day=null` 且不代表批准。任何 redirect/品牌落地/关系清理均不构成 `continue_index` 授权。索引仅由 `tool_index_review_runs` 和 `tool_index_release_log` 的受控流程决定；发布后观察 7/14/28 天抓取、canonical、soft 404、目标查询与跳出，异常时撤回对应 alias 或退回 monitor。

精确影响面：若按上述后续方案实施，可能改动 `app/[locale]/(with-footer)/guides/ai-tools-for-customer-support/page.tsx`、`lib/config/reviewedToolRelationships.ts`、`lib/data.ts`、`lib/config/legacyToolScopeReviews.ts`、`lib/content/publicToolScope.ts`、`app/[locale]/(with-footer)/ai/[websiteName]/page.tsx` 中 ChatGPT 多语言文案/官方链接、`lib/config/toolRouteAliases.ts` 与 `middleware.ts` 的 Mac/品牌 alias；OpenAI 品牌落地需新增 app 品牌路由/内容。目标尚不批准任何数据库变更。若将来单独改变状态/索引，触及 `public.tools` 中确切五个 ID 及 `tool_index_review_runs` / `tool_index_release_log` / `tool_index_release_policy`；当前关系、Profile/Source/Claim 与关系 Claim-link 查询均为零。机器审计记录了五条 `tools` 前像 SHA-256。任何数据库变更必须与路由提交分开预演、复核 hash，且具备独立回滚；不得通过只改 canonical 假装迁移，不得同时留下会误导搜索的双重 index 信号。

## 自动测试规格（下一实施单元，不在本门禁改变行为）

1. **静态实体图**：从代码候选抽取 alias、关系、guide/toolName、topic 与旧静态记录；断言一个 slug 一个实体类型；旧模型/品牌不进入工具推荐；所有 alias 目标存在；有向 alias 图无环，最大深度 1；Mac 只指 ChatGPT、模型绝不指品牌/ChatGPT/Codex。
2. **数据门禁**：只读事务核 `chatgpt` 恰好一行且内容/图片/日期/官方来源完整，`chatgpt-mac/gpt_4o/openai/codex` ID 与前像锁定；目标缺行、重复、`monitor` 意外变化或 ledger 异常即失败。模拟事务回滚与新连接回读，不以本地 fallback 假充 DB 就绪。
3. **locale 与 HTTP**：覆盖 `/ai`、`/en/ai`、`/cn/ai` 和其余已支持 locale；客户端源只允许单跳 308 到同 locale 200，目标自指 canonical；品牌和模型 URL 不跳到任意工具；noindex/hreflang/sitemap 由状态共同一致，robots.txt 不意外封锁目标。GET 与 HEAD 均检查真实响应头，不只看页面 body。
4. **内容与搜索意图**：主产品页必须解答 Mac 安装入口并明确平台条件；模型页必须指向 API 官方模型文档，品牌页必须分别导航 ChatGPT/Codex/API；逐条人工复核 GSC 查询、外链及可能的 Mac 专属意图，再准许 redirect。静态资料核对日期和 URL 归属进入审计输出。
5. **范围约束**：本门禁仅运行文档检查、只读 SQL/HTTP、静态图验证；若实施单元新增 TypeScript，只运行 `tsc --noEmit` 及与该图/路由有关的定向测试，不运行 build。

未决风险：Mac 旧页的流量/查询意图尚无本次 Search Console 分层；官方桌面产品刚在 2026-07 发生 ChatGPT/Classic/Codex 入口变化，现有主页文案没有完整解释；OpenAI 品牌页虽已发布，其他 locale 的实际 HTTP/HEAD 和额外站内入口扩展尚未单独复核，GPT-4o 模型目录未建；Mac/GPT-4o/OpenAI 的 next review date 已过，Codex 自身复查日为 2026-10-22；`published/monitor` 仍可能被不检查 page quality 的部分工具选择器取到。以上是身份路由或目录清理的放行条件，不授权立即重定向、状态变更或索引。
