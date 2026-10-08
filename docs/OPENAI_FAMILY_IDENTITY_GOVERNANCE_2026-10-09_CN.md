# OPENAI-FAMILY-IDENTITY-GOVERNANCE-01：身份与 URL 设计门禁

日期：2026-10-09（上海）。本单元只做设计、生产只读审计和后续自动测试规格；没有生产写入、push、路由、索引或重定向变更。机器可读快照见 [只读审计](./OPENAI_FAMILY_IDENTITY_AUDIT_2026-10-09.json)。既有第五批身份调查见 [上一轮记录](./IDENTITY_FRESHNESS_BATCH_05_2026-10-09_CN.md)；本次重新读取数据库、页面、robots 和 sitemap，不能把上一轮结论当作实时状态。

## 官方身份依据与决策

- [ChatGPT 官方入门](https://learn.chatgpt.com/docs/quickstart)把 ChatGPT 列为产品，并把桌面、网页等列为使用入口；[桌面应用文档](https://learn.chatgpt.com/docs/app)明确其为 ChatGPT desktop app。因此 `chatgpt` 是应有的主产品工具实体，`chatgpt-mac` 是平台分发/客户端页面，不是另一款工具。此处说的是目录身份，不能推断各客户端功能或套餐完全一致。
- [GPT-4o 官方 API 模型页](https://developers.openai.com/api/docs/models/gpt-4o)仍列出模型、API 接口与 token 价格；它是 API 模型，不是可独立注册的助手产品。现有范围修正文案记载它于 2026-02-13 退出 ChatGPT；这个 ChatGPT 侧历史事件与 API 仍可用须分别叙述。价格、API 权限及模型生命周期每次公开时须重新查官方资料，不从旧工具行继承。
- [OpenAI 开发者入口](https://developers.openai.com/)分别列出 API 平台、Codex 等产品线；`openai` 是公司/品牌及产品家族，不具有单一功能、价格或登录入口。`codex` 是独立编程智能体工具实体，应与 ChatGPT 产品页保持清晰的任务边界。

| 实体/现有 slug | 最终分类 | 搜索意图与用户价值 | 当前门禁 |
| --- | --- | --- | --- |
| ChatGPT / `chatgpt` | **KEEP_TOOL**：建立主产品行 | 通用助手选择、功能、限制、官方入口；承接网页及客户端的产品级比较 | **HOLD**：生产无行，现有 200 页只是 fallback/noindex；不得作为重定向目标放行 |
| ChatGPT macOS / `chatgpt-mac` | **MERGE_REDIRECT** 到同 locale ChatGPT 主产品页 | 下载和 Mac 使用问题属于 ChatGPT 平台入口；主产品页需有醒目的 macOS 安装、要求、官方来源和与其他平台的差异入口 | **HOLD**：主产品内容及目标 URL 未达门禁前保留现有 noindex 历史页 |
| GPT-4o / `gpt_4o` | **ARCHIVE_NO_REDIRECT**，退出工具候选 | API 模型查询仍有开发者价值，但与 ChatGPT/Codex 工具选型并非一对一；保留带官方模型链接的 noindex 说明，模型目录是另一个立项 | **HOLD**：先清理工具关系、推荐与静态素材，绝不导向品牌或 ChatGPT |
| OpenAI / `openai` | **CONVERT_BRAND_OR_PLATFORM** | 品牌导航可解释公司旗下 ChatGPT、Codex、API 的不同入口；不能作为单一工具打分或报价 | **HOLD**：独立 `/brands/openai` 内容及路由未建好前保留 noindex 公司记录；不得导向单一产品 |
| Codex / `codex` | **KEEP_TOOL** | 代码仓库、工程代理、审查与开发工作流；不是三条旧 slug 的默认接收页 | 维持现有 `monitor/noindex`，索引批准另走工具门禁 |

`MERGE_REDIRECT` 是目标身份确定后的最终 URL 策略，不是当前操作。`CONVERT_BRAND_OR_PLATFORM` 可在 `/brands/openai` 建成并有独立品牌内容后，再单独评估同意图的旧品牌 URL 是否一跳迁移；本设计不批准 `/ai/openai -> /ai/chatgpt`。`gpt_4o` 的 API 模型价值要求保留可读的 noindex 来源页，不能因不适合工具目录就声称模型已不可用。

## 生产只读实体与 URL 图

读取方法：新 Postgres 连接执行 `BEGIN READ ONLY`、参数化 `SELECT to_jsonb(t)-'search_vector'`、`ROLLBACK`；没有写事务。完整行 SHA-256 与第五批记录一致。浏览器外部 GET 核对线上 HTML、`/robots.txt` 和 `/sitemap.xml`。本次选择的五个 slug 中，生产 `public.tools` 有四行，`chatgpt` 为零行。

| slug | 行 ID / 当前状态 | 英文 URL | 英文和中文页面 |
| --- | --- | --- | --- |
| `chatgpt` | **无生产行**；`lib/config/priorityToolFallbacks.ts` 与详情页内置 ChatGPT 内容提供 shell | fallback 指向 `https://chatgpt.com` | `/ai/chatgpt`、`/cn/ai/chatgpt` 200、自指 canonical、noindex；`/en/ai/chatgpt` 归一到裸英文路径 |
| `chatgpt-mac` | `22561562-5b7e-4e32-b629-ea8626abeeda`；`published/monitor`；复查日 2026-10-06 | `https://chatgpt.com/download/` | `/ai/chatgpt-mac`、`/cn/ai/chatgpt-mac` 200、自指 canonical、noindex |
| `gpt_4o` | `73a3ca28-707c-4460-b769-50ee47ba5e69`；`published/monitor`；复查日 2026-10-06 | `https://developers.openai.com/api/docs/models/gpt-4o` | `/ai/gpt_4o`、`/cn/ai/gpt_4o` 200、自指 canonical、noindex |
| `openai` | `1ac05946-fab2-48bf-9c5d-6188124db8fb`；`published/monitor`；复查日 2026-10-06 | `https://openai.com/` | `/ai/openai`、`/cn/ai/openai` 200、自指 canonical、noindex |
| `codex` | `35b7a4ae-1200-41f2-94c5-d5ba4dc98704`；`published/monitor`；复查日 2026-10-22 | `https://chatgpt.com/codex` | `/ai/codex`、`/cn/ai/codex` 200、自指 canonical、noindex |

`robots.txt` 对 `User-agent: *` 为 `Allow: /` 并指向 sitemap；上述不索引由页面 meta robots 控制。`/sitemap.xml` 对这五个 slug 均无 `/ai/` 条目。`lib/seo/toolIndexing.ts` 规定只有 `published + continue_index + quality >= 80` 才能进入索引，`app/sitemap.ts` 重用此决策。目前这些页面不发 indexable hreflang。生产 `tool_index_release_log` 对三条旧行各有一条 `baseline`，日期未知；`tool_index_review_runs` 对五个 slug 无事件。baseline 不等于当前索引批准。

路由图：`lib/config/toolRouteAliases.ts` 当前没有三条旧 slug 到 ChatGPT/Codex 的 alias。`middleware.ts` 在 locale 重写前处理 alias 为真实 HTTP 308；详情页还用 `permanentRedirect` 兜底。英文 canonical 为 `/ai/{slug}`，中文为 `/cn/ai/{slug}`。`i18n.ts` 还允许 `jp/de/es/fr/pt/ru/tw` 路径；这些语言受 `lib/seo/indexing.ts` 约束为 noindex，例如 `/jp/ai/chatgpt` 当前 200、自指 canonical、noindex。迁移必须在每个已接受 locale 中保持同 locale，不把 `/cn` 导向英文，也不让 `/en` 归一和 alias 形成两跳。

站内边：`lib/config/reviewedToolRelationships.ts` 把 `gpt_4o` 与 Claude、Gemini 互列为 alternative，把 `chatgpt-mac` 与 Gemini、Claude 比较，并将模型与客户端互列 complement；这些跨层关系会把旧记录继续引入工具决策。`app/[locale]/(with-footer)/guides/ai-tools-for-customer-support/page.tsx` 用 `chatgpt-mac` 作工具；`ai-chatbot-tools/page.tsx` 与 `ai-tools-for-code-review/page.tsx` 已链接 `chatgpt` fallback。`chatgpt-alternatives-comparison` 目前为 unavailable 模板，不可视作主工具内容。`lib/data.ts` 仍保存旧的客户端、模型与品牌素材；它不是本次生产 DB 行的事实来源，但以后若回退/导入会复活错误身份。`lib/data/topicToolSources.ts` 将 Codex 放在代码和 Agent 主题，不应替换成 ChatGPT。

## 顺序、拥有者与回滚点

1. **目标先存在**（下一实施单元，Owner 数据动作）：依据官方产品材料创建唯一 `chatgpt` 工具行，先用 `published/monitor`，完成英文和中文产品范围、平台分发、官方入口、套餐/权限条件、来源日期、图像、分类和用户决策内容。查重官方域名与现有 fallback，验证 `/ai/chatgpt`、`/cn/ai/chatgpt` 已由数据库而非 shell 渲染，保留 noindex。记录前像哈希与新行 ID；失败时删/回退新行且不动旧 URL。
2. **链接先更新**（代码候选）：将客服指南的客户端候选换成经过验证的 ChatGPT 主行；重写关系卡为同层产品比较，移除 GPT-4o 与助手/客户端互链；更新 `lib/data.ts` 静态遗留与相关 fallback/范围说明。复核所有 guide、comparison、topic、卡片入口在目标页 200、同 locale、没有链式跳转。失败时回退这一个代码提交；旧页继续 noindex。
3. **品牌与模型分层**（代码 + Owner 内容动作）：建立完整 `/brands/openai` 品牌导航后才考虑旧品牌 URL 的一跳迁移；`gpt_4o` 退出工具推荐、保持 noindex 历史/API 说明。若另建 `/models/gpt-4o`，需独立证明同一意图、内容完整和迁移收益，本门禁不授予自动重定向。失败时回退新路由/内容，旧页仍可访问。
4. **客户端合并**（代码候选，Owner 审核流量后上线）：主 ChatGPT 页有 macOS 具体落点且客服/关系/静态链接已切换，才加入 `chatgpt-mac -> chatgpt` 的 alias。对 `/ai`、`/en/ai`、`/cn/ai` 及其他已支持 locale 测试单次 308 到该 locale 的最终 URL；无循环、无跨 locale、无两跳。若 Mac 查询/外链指向安装问题而主页不能回答，继续 HOLD 而不 redirect。失败时撤销 alias，恢复旧 noindex 页。
5. **状态与索引最后动**（Owner 数据动作）：每个实体分别审查 `tools.status`、`page_quality_status`、目录发现资格、GSC/搜索意图与质量证据；ChatGPT 即使建成也不自动 `continue_index`。索引放行只经 `tool_index_review_runs` 和 `tool_index_release_log` 的现有受控门禁，sitemap 随最终状态自动变化。观察 7/14/28 天 URL 抓取、canonical、soft 404、查询和跳出；任一错误立即把相关索引状态退回 `monitor`，必要时撤回 alias。旧 baseline 不能复用。

受影响表/字段：`public.tools` 的 `id,name,title,content,detail,url,status,page_quality_status,category_id,image_url,thumbnail_url,tags,pricing,features,next_review_date,updated_at`；索引审查表 `tool_index_review_runs`、放行账本 `tool_index_release_log` 和策略表 `tool_index_release_policy`。路径与代码触点：`app/[locale]/(with-footer)/ai/[websiteName]/page.tsx`、`lib/config/priorityToolFallbacks.ts`、`lib/config/legacyToolScopeReviews.ts`、`lib/content/publicToolScope.ts`、`lib/config/reviewedToolRelationships.ts`、`lib/data.ts`、上述指南、`lib/config/toolRouteAliases.ts`、`middleware.ts`、`lib/seo/toolIndexing.ts`、`app/sitemap.ts`、`lib/seo/metadata.ts`。路由与数据库各有独立回滚点；不能以改 canonical 代替真实迁移，也不能让 noindex 旧页和 indexable 新页都保持自指索引信号。

## 自动测试规格（下一实施单元，不在本门禁改变行为）

1. **静态实体图**：从代码候选抽取 alias、关系、guide/toolName、topic 与旧静态记录；断言一个 slug 一个实体类型；旧模型/品牌不进入工具推荐；所有 alias 目标存在；有向 alias 图无环，最大深度 1；Mac 只指 ChatGPT、模型绝不指品牌/ChatGPT/Codex。
2. **数据门禁**：只读事务核 `chatgpt` 恰好一行且内容/图片/日期/官方来源完整，`chatgpt-mac/gpt_4o/openai/codex` ID 与前像锁定；目标缺行、重复、`monitor` 意外变化或 ledger 异常即失败。模拟事务回滚与新连接回读，不以本地 fallback 假充 DB 就绪。
3. **locale 与 HTTP**：覆盖 `/ai`、`/en/ai`、`/cn/ai` 和其余已支持 locale；客户端源只允许单跳 308 到同 locale 200，目标自指 canonical；品牌和模型 URL 不跳到任意工具；noindex/hreflang/sitemap 由状态共同一致，robots.txt 不意外封锁目标。GET 与 HEAD 均检查真实响应头，不只看页面 body。
4. **内容与搜索意图**：主产品页必须解答 Mac 安装入口并明确平台条件；模型页必须指向 API 官方模型文档，品牌页必须分别导航 ChatGPT/Codex/API；逐条人工复核 GSC 查询、外链及可能的 Mac 专属意图，再准许 redirect。静态资料核对日期和 URL 归属进入审计输出。
5. **范围约束**：本门禁仅运行文档检查、只读 SQL/HTTP、静态图验证；若实施单元新增 TypeScript，只运行 `tsc --noEmit` 及与该图/路由有关的定向测试，不运行 build。

未决风险：ChatGPT 主行没有生产数据，Mac 查询与外链样本尚未分层；品牌新路由与模型目录还未立项；旧记录的复查日已过；现有 `published/monitor` 在部分目录/关系候选选择器中仍可出现。以上四项是后续放行条件，不是让旧 slug 立即重定向或索引的理由。
