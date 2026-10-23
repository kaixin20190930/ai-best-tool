# AI Best Tool 每周市场反馈与增长复盘

日期：2026-10-23（Asia/Shanghai）

复盘窗口：2026-10-17 至 2026-10-23

数据边界：GSC 最新完整快照仍停在 2026-10-14；OAuth refresh 返回 HTTP 400。以下 GSC 数字只用于历史信号，不代表本周实时表现。Coverage、URL Inspection 和站内事件均 unavailable，缺失不按零处理。

## 一、本周结果

- Catalog：Lindy、Grok Voice 3.0、Anthropic OSS Scanner、CADCraft、MOSS-Image、OmniRoute、Kling AI、Hailuo AI 共 **8 个**新工具经通用链路发布为 `published + monitor/noindex`。这是 Owner 临时批次与正常日节奏叠加后的结果，超过常规每周 5-7 个目标；下周恢复 5-7 个结果型组合，不把数量当 KPI。
- Index：Descript、HeyGen、Lovable、Fireflies、Glean、SciSpace、v0、WRITER、Replit、Otter AI 共 **10 个**工具进入 `continue_index`。周额度使用 10/25，未使用 15；额度是上限，不用 B/C 级工具补齐。
- Freshness：完成低风险已收录工具更新与多轮只读 selector。OpenRouter 已发现当前免费模型速率限制差分，但共享 writer 只接受 `monitor`，该工具为 `continue_index`，因此保持零写并形成唯一共享执行器缺口。
- Decision：本窗口没有新增用户可见 Decision 单元，低于每周 2 个目标。Catalog 与索引工作占用了端到端槽位，但不构成继续延期的理由；下周两个 Decision 单元必须作为结果交付，不能再拆为阶段任务。
- Discover：MOSS-Image 与 OmniRoute 已从趋势候选毕业为公开工具。Freebuff 的已知外部趋势为回落且权益不完整，不进入本周产能。

## 二、生产交叉矩阵

| lifecycle `status` | `page_quality_status` | 数量 |
| --- | --- | ---: |
| draft | monitor | 9 |
| pending | monitor | 13 |
| published | archive | 2 |
| published | continue_index | 28 |
| published | monitor | 51 |
| rejected | monitor | 11 |

- Tool ID 总数：**114**；published：**81**。
- page quality：`continue_index=28`、`monitor=84`、`archive=2`。这些是同一批 Tool ID 的正交状态，不能相加为工具总数。
- sitemap：**148 URLs**。

## 三、Market / Harvest

GSC 历史快照（2026-10-08 至 2026-10-14）为 2 clicks / 996 impressions，CTR 0.20%，平均排名 13.60；28 天为 7 / 1,881，CTR 0.37%，平均排名 14.32。由于凭据失效，本周变化、索引获批页面的第 3/7 天表现和 Coverage/URL Inspection 均 unavailable。

| 顺序 | 页面 | 最近可用历史信号 | 下周结果动作 |
| --- | --- | --- | --- |
| H1 | `/ai/n8n` | 705 impressions / 1 click / CTR 0.14% / position 9.12；查询 `n8n` 445 impressions / position 6.64 | 聚焦 pricing、AI workflow、n8n vs Make/Lindy 的标题、首屏与 Compare next；复用既有实体，不重做索引审核。 |
| H2 | `/ai/lindy` | 107 / 0 / position 29.76；存在 workflow evaluation 查询 | 把新发布实体的摘要与 n8n/Make 决策边界对齐，补自动化 Cluster 内链。 |
| H3 | `/ai/poe` | 71 / 0 / position 24.79；已有 `does poe ai have a limit` 查询 | 强化 limits、subscription 和适合/不适合场景，不重做实体审核。 |
| H4 | `/ai/woy-ai` | 70 / 0 / position 9.21；查询 `woy ai` 有明显历史展示 | 先核身份/查询匹配和现有页面意图，再决定摘要调整；不能在身份不清时扩写。 |
| H5 | `/ai/deepl` | 28 天 78 / 0 / position 15.23 | 对齐 pricing、API cost 与 alternatives 决策意图，补比较入口。 |

唯一优先 Harvest 是 **n8n 页面 + n8n/Make/Lindy Decision 单元**。其他四项排在同一队列中，不拆成五个并行开发任务。

## 四、Index / Sitemap 审计

### 本周批准

| 日期 | 工具 |
| --- | --- |
| 2026-10-19 | Descript、HeyGen、Lovable |
| 2026-10-20 | Fireflies、Glean、SciSpace、v0、WRITER |
| 2026-10-22 | Replit、Otter AI |

- 批准数：**10/25**；未使用额度：**15**。
- 2026-10-23 selector 扫描 50 个 `published + monitor`，A 级结果为 0，因此没有为额度补数。
- 主要拒绝/缺口集中在：唯一搜索意图、观察或显式 fast-track 证据、站点搜索健康、独立耐久信号、官方来源、市场验证、Decision 内容和复核日期。媒体缺口不是主要矛盾。
- GSC refresh 失效后，新的 index/sitemap 审批暂停。既有 10 项保持 `continue_index`，不会因短期无展示自动退回 noindex。
- 普通工具页不使用 Google Indexing API。恢复 GSC 后，仅提交一次 sitemap，并按第 3、7、14、28 天观察。

## 五、下周 Catalog 机会队列

下表是机会优先级，不是搜索量，也不是发布批准。`搜索需求`分量只使用既有独立市场/品牌信号和历史审计，不冒充新鲜 GSC；GSC 失效期间没有候选进入 >=75 快速队列。每个 60-74 候选只允许补一个最高价值缺口。

| 候选 | 分数 | Cluster 角色 | 比较对象 | 下游消费位置 | 只补一个缺口 |
| --- | ---: | --- | --- | --- | --- |
| Bubble | 72 | `build-app-with-ai` Alternative | Bolt、Lovable、v0 | 现有 App Builder Task / Comparison | 核清 AI Builder 生成完整度与人工补全边界，并形成可复用媒体/三语言完成稿。 |
| Avoma | 65 | `meeting-notes` Gap-filler | Fathom、Fireflies、Otter AI | 会议记录 Task / 比较 | 消歧当前套餐、CRM 权益与隐私边界；冲突 Claim 可继续 HOLD，不阻断安全实体内容。 |
| Microsoft Copilot Studio | 64 | Agent builder Anchor | Dify、Replit | 企业 Agent 决策单元 | 核租户/许可证/credits 的当前购买边界，不外推 Microsoft 母品牌。 |
| Granola | 63 | `meeting-notes` Alternative | Fathom、Avoma | 无 bot 会议记录比较 | 核同意、导出与转录/笔记留存边界。 |
| Ideogram | 62 | Image generation Alternative | MOSS-Image、Canva | 文字渲染/版面控制比较 | 核当前 credits、导出/水印及网页/API 分账。 |
| Read AI | 60 | `meeting-notes` Alternative | Otter AI、Fireflies | 会议/跨来源搜索比较 | 核当前账户权限、导出、保留和同意边界。 |
| Tabnine | 57 | Coding assistant Alternative | Cursor、Replit | 开发工具比较 | 收购后 SKU/canonical/定价仍不稳定；本周不占产能。 |

Catalog 结果型目标为 **Bubble、Avoma、Copilot Studio、Granola、Ideogram、Read AI 中最多 5-7 个推进，正常公开 5-7 个/周**。没有对象通过实体门禁时，只补表中一个缺口，不用过期候选或低分对象替代。

当前运营 overlay 仍错误列出已发布的 WellSaid 与 WRITER。下周只做一次边界明确的数据清理，并从执行覆盖层移除；禁止为此新建 selector、表或 Dashboard。

## 六、Decision 与 Discover

下周两个用户可见端到端单元：

1. **n8n vs Make vs Lindy Structured Comparison**：使用真实 GSC 决策查询，比较部署方式、AI/agent 深度、执行计费、人工确认、技术门槛和 Best for/Not ideal；默认 noindex，除非独立 SEO 门禁通过。
2. **Product image to short video Decision 单元**：复用 Kling AI、Hailuo AI、Pika、Runway 的既有事实，比较参考图控制、编辑流程、credits、水印、权利和未实测边界；不重复核验已有 PASS。

Discover：当前没有可验证的新趋势输入。MOSS-Image/OmniRoute 已毕业，Freebuff 低于 60 且趋势回落，因此记录为 `not_due/unavailable`，不虚构 1-2 个候选。

## 七、Freshness 与流程膨胀

- 下周 P0 只修一个共享缺口：让现有 Freshness executor 在保持精确前像、受保护字段和幂等 postcheck 的前提下支持低风险 `continue_index` 行，然后完成 OpenRouter 已确认的单项差分。不得写工具专属 SQL。
- 普通批次维持一份机会/证据快照、一个开发槽、一次最终独立 QA、一份日报和一份最终审计。
- 本周每个已关闭交付单元只有一个开发与一个 QA；未发现重复侧栏任务或重复 full build/smoke。10 月 23 日 QA 有一次同线程语义澄清，没有创建第二个 QA。
- 端到端平均时长 unavailable，因为历史日报没有统一记录完整起止时间；不建设 Dashboard，也不编造效率指标。
- 本周没有记录 `PROCESS_BUDGET_EXCEEDED`。真实流程回退是候选 overlay 残留已发布工具，以及 `continue_index` writer 缺失；两项均按共享最小修复处理。
- payment、paid submission、verified vendor、featured/sponsored 未进入机会评分、自然排序、Decision、index 或 sitemap。

## 八、下周唯一优先队列

1. 恢复 GSC refresh token；恢复前停止新 index/sitemap 审批，但 Catalog、Freshness 和 Decision 继续。
2. 完成 n8n Harvest 与 `n8n vs Make vs Lindy` 用户可见 Decision 单元。
3. 用共享 writer 完成 OpenRouter 低风险 freshness 差分，并清理 WellSaid/WRITER 的陈旧 overlay。
4. 按 Catalog 表顺序处理 Bubble，再处理 Avoma；其余候选只有前项关闭后才进入同一端到端槽。
5. 完成 Product image to short video Decision 单元。

唯一 Owner 事项：替换可用的 `GSC_REFRESH_TOKEN`。其余无需 Owner 操作。
