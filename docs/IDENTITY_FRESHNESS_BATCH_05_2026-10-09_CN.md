# IDENTITY-FRESHNESS-BATCH-05：行动矩阵与生产只读审计

日期：2026-10-09（上海）。选择顺序锁定为 [第四批后 backlog](./FRESHNESS_BACKLOG_AFTER_BATCH4_2026-10-08.json) 的 `selected`：Pipedream、Cursor、ChatGPT Mac、GPT-4o、OpenAI。原文件 SHA-256：`86b65d3ef19ff7933014d7475b2563df4f924e560b3e38c6cd1df7a787d2d2cc`。`claim_due` 与 `entity_due` 分开处理；本批没有生产提交。

## 五项 action matrix

| 对象 | 本批分类与动作 | 可执行候选 | 边界 |
| --- | --- | --- | --- |
| `pipedream` | Connect 继续支持，Workflows/String 将停止；`KEEP`，`claim_due`、`fact_updated` | Freshness 精确替换 Pipedream 三语 `detail` 段落，新增 `features.maintenanceReview`、`next_review_date=2026-10-23` | [官方停止服务公告](https://pipedream.com/docs/workflows)明确 Workflows 与 String 于 2027-03-31 停止，Connect 不受影响。[计费文档](https://pipedream.com/docs/pricing)将 Workflows segment 计算 credits 与 Connect 使用 credits、外部用户计费分开。既有账号迁移、退款和导出安排应逐项核对，不在本补丁推断。 |
| `cursor` | 独立代码编辑器及 Agent；`KEEP`，`claim_due`、`reviewed_no_change` | Freshness 仅新增 `features.maintenanceReview`、`next_review_date=2026-10-23` | [套餐帮助](https://prod.cursor.com/help/account-and-billing/pricing)支持现有公开价格，[隐私说明](https://cursor.com/data-use)保留滥用调查和非 ZDR 例外；[Cursor 收购公告](https://cursor.com/blog/joining-spacex)及 [OpenAI 官方声明](https://openai.com/index/our-decision-on-cursor-following-its-acquisition-by-spacex/)支持既有“拟定 11 月 12 日”表述，最终停用日期和账号实际可用模型仍未确定。 |
| `chatgpt-mac` | ChatGPT 桌面客户端入口；`MERGE_REDIRECT` **身份候选** | 单独批次：先建立并核准真实 ChatGPT 主记录，再更新站内链接及历史身份说明，核验流量与 canonical 后决定是否 301 到主记录 | [OpenAI Docs 的桌面应用说明](https://learn.chatgpt.com/docs/app)将桌面 app 列为 ChatGPT 的入口，不支持当成独立工具。当前生产无 `chatgpt` 工具行，故本批不得执行重定向。 |
| `gpt_4o` | 当前仍列于 OpenAI API 的模型名称；`ARCHIVE` **目录身份候选** | 单独批次：从工具比较关系及推荐入口移出，保留带 API 来源的 noindex 历史/模型说明或迁入模型目录；无一对一工具重定向 | [官方模型页](https://developers.openai.com/api/docs/models/gpt-4o)仍提供 API 模型信息。不能把模型重定向成 ChatGPT 或 Codex；API 可用性和账户权限单独核验。 |
| `openai` | 公司/品牌及产品家族页；`ARCHIVE` **目录身份候选** | 单独批次：改作品牌导航或历史说明，撤出工具推荐与比较关系，按具体产品分流；不做单一产品 301 | [OpenAI 官方产品/开发者入口](https://developers.openai.com/chatgpt)与 [ChatGPT 文档](https://learn.chatgpt.com/docs/app)显示产品和入口分层；不存在统一功能、统一价格的“OpenAI 工具”。 |

`MERGE_REDIRECT` 与 `ARCHIVE` 是身份候选，不是本批生产动作。它们需要迁移评估：目标页真实性、已有外链与站内链接、locale 路由、历史查询意图、canonical、索引及 sitemap。尤其 GPT-4o 仍有 API 用途，不能把“非独立工具”误作“已停止的模型”。

## 生产只读身份矩阵

2026-10-09 用新 Postgres 连接 `BEGIN READ ONLY` 读取 `public.tools`，并核对线上 `/ai/` 页及 `/sitemap.xml`。行 SHA-256 使用与 freshness runner 相同的 `JSON.stringify(to_jsonb(t) - 'search_vector')`。三条 `status=published`、`page_quality_status=monitor`、`next_review_date=2026-10-06`；`monitor` 由 `getToolIndexDecision` 产生 `indexing_paused`。线上均为 200、自指 canonical、`noindex, follow`、sitemap 缺席。

| slug / ID | 生产 title(en) / 官方 URL | 完整行 SHA-256 | canonical / alias 与内部链接、意图重叠 |
| --- | --- | --- | --- |
| `chatgpt-mac` / `22561562-5b7e-4e32-b629-ea8626abeeda` | “ChatGPT desktop app for macOS” / `https://chatgpt.com/download/` | `1d68dc48bbbd3fae65231941316fdefbb10d4752b9cfcd8603413040e729fa23` | `/ai/chatgpt-mac` 自指；无 route alias。`reviewedToolRelationships` 与 Gemini、Claude、GPT-4o 互链；客服指南把它列作工具。与 ChatGPT 桌面使用意图重叠。线上 `/ai/chatgpt` 有 200/noindex，但生产查询无 `chatgpt` 行，不能视为已就绪的主实体。 |
| `gpt_4o` / `73a3ca28-707c-4460-b769-50ee47ba5e69` | “GPT-4o API model” / `https://developers.openai.com/api/docs/models/gpt-4o` | `7639c4de3fbf9ba8de857ea3d810b053ca212b58a58dd0d28b33078fb8a209c1` | `/ai/gpt_4o` 自指；无 route alias。比较关系将它与 Claude/Gemini 列为 alternative，与 ChatGPT Mac 列为 complement，混合了模型、产品和客户端层级；API 模型查询意图与通用助手选型不同。 |
| `openai` / `1ac05946-fab2-48bf-9c5d-6188124db8fb` | “OpenAI (company record)” / `https://openai.com/` | `eda1d65396baeb17efba9c1a43aff46289d7de297ad147abb7354ba20d3a569c` | `/ai/openai` 自指；无 route alias。`lib/data.ts` 仍有静态旧品牌素材；生产页面为隔离文案。意图与 ChatGPT、Codex、API 模型均交叉，但没有唯一可替代产品。 |

`codex` 对照行存在（`35b7a4ae-1200-41f2-94c5-d5ba4dc98704`，`published/monitor`，`https://chatgpt.com/codex`）；它是单独编程智能体，不能承接上述全部品牌或模型意图。生产与线上没有为三条旧 slug 配置到 ChatGPT/Codex 的 alias/301；路由 canonical 仍各自指向旧 slug。实际站内路径在 `lib/config/reviewedToolRelationships.ts`、客服指南和 `lib/data.ts` 可见，身份迁移前必须逐项清理。

## Freshness 候选与 QA

两条均沿用 2026-09-01 的 dated editorial 实体 PASS，validThrough 为 2026-11-30；其来源仅作实体基线，不能当作本次 Claim 证据。官方资料在 2026-10-09 单独复核。Pipedream `detail` 三语后像 SHA-256 为 `90dd935294b5348370e34ca7a910aa39bb3c60ed0681a6c60bacf893c6cc8b61`；Cursor 正文后像不变。允许字段只有 Pipedream 的 `detail`、两项的 `features.maintenanceReview` 和 `next_review_date`；`status`、`page_quality_status`、`id`、`name`、`title`、`url`、`pricing` 及其他列必须相等，index/sitemap 由原门禁维持。

- [生产只读 preflight](./FRESHNESS_FIFTH_BATCH_PREFLIGHT_2026-10-09.json)：两项 `ready`，锁完整行前像、PASS、详情后像、来源和允许字段；`productionWrites=0`。
- [事务 rollback 演练](./FRESHNESS_FIFTH_BATCH_ROLLBACK_2026-10-09.json)：两项 `rolled_back`，持久 `productionWrites=0`。
- [独立只读回验](./FRESHNESS_FIFTH_BATCH_POST_ROLLBACK_2026-10-09.json)：演练进程退出后新连接逐行读取，完整行 hash 与 preflight 相同；`productionWrites=0`。
- `scripts/test-freshness-fifth-batch.ts` 覆盖顺序、PASS、Pipedream Workflows/String 与 Connect 区分、过度泛化禁例、精确替换、manifest 来源/后像篡改、独立回读篡改与缺行、后像重放零写入及详情、日期、来源 tamper；TypeScript `tsc --noEmit` 通过。

发布前总控仍需独立 QA，并在提交时重新锁生产前像；若 `view_count`、`updated_at` 等运行时列漂移，也应重新 preflight。生产提交后要做新的只读 postcheck。本开发任务不执行 `--commit`、push 或身份路由/索引变更。
