# AI Best Tool 每周增长与编辑复盘

日期：2026-10-30（Asia/Shanghai）

复盘窗口：2026-10-24 至 2026-10-30。GSC 最新完整日为 2026-10-27；站内事件仍为 `unavailable`，缺失不按零处理。2026-10-30 是新选择逻辑的第 1 个只读影子周期，普通页面、Catalog 和索引写入均暂停。

## 一、本周结论

- 下周唯一主 Cluster：**Automation / n8n 决策 Cluster**。
- 主页面：`/ai/n8n`。支撑 Tool：Make、Lindy；不额外扩工具数量。
- 选择依据不是泛品牌展示，而是稳定的决策查询：28 天 n8n pricing/cost/plans/requirements 查询簇 148 展示、0 点击；`/ai/n8n` 页面总计 2,013 展示、1 点击、平均排名 10.09。
- 本周先关闭 SEO automation foundation 并进入两天只读影子切换，没有为了周报再创建开发任务。10 月 31 日第二个影子周期通过后，11 月 1 日自动执行该组合。

## 二、下周主 Cluster 组合

| 组成 | 对象 | 范围与结果定义 |
| --- | --- | --- |
| 主页面 | `/ai/n8n` | 对齐 pricing、cost、plans、requirements 的搜索意图，改善首屏判断、限制披露和下一步比较入口；不把品牌词 `n8n` 当作购买决策信号。 |
| 支撑 Tool 1 | Make | 只作为云端自动化的比较边界；复用已有 Tool 和有效证据。 |
| 支撑 Tool 2 | Lindy | 只作为 AI/agent workflow 的比较边界；复用已有 Tool 和有效证据。 |
| 必要 Freshness | n8n / Make / Lindy 的价格、托管方式与执行计费 Claim | 仅核来源已变化、已到期或页面将引用的精确 Claim；没有真实差分则零写，不重验完整实体。 |
| E2 受控实测 | 本组合暂不安排 | 当前目标是搜索意图与公开边界，不需要登录真实账户或制造伪实测。若公开来源无法解释一个关键决策差异，再单独限定为最多一个 E2。 |
| 最终 QA | 一次差分 QA | 只审主页面差分、相关 Claim 边界、内链、canonical/robots 和关键负向用例；不重复 build/smoke。 |

页面完成修改后冷却 14 天；来源变化、到期或生产异常除外。既有 noindex comparison 不因本组合自动进入 sitemap。

## 三、GSC 与合格流量

| 窗口 | clicks | impressions | CTR | avg position |
| --- | ---: | ---: | ---: | ---: |
| 最近 7 天 | 0 | 873 | 0% | 15.13 |
| 最近 28 天 | 5 | 2,925 | 0.17% | 14.82 |

### n8n 信号拆分

- `/ai/n8n` 最近 7 天：0 点击 / 698 展示 / 平均排名 10.26。
- `/ai/n8n` 最近 28 天：1 点击 / 2,013 展示 / 平均排名 10.09。
- 28 天品牌导航簇：1 点击 / 1,391 展示。
- 28 天 qualified decision 簇：0 点击 / 148 展示。主要包括 `n8n pricing` 53、`n8n ai pricing` 29、`n8n ai agent pricing` 20，以及 cost/plans/subscription/requirements 等长尾。
- 站内事件 `unavailable`，因此不能报告官网点击、比较入口点击或转化为零。

## 四、每日候选选择审计

- 新契约启用后的可审计样本目前只有 2026-10-30 第 1 个影子周期：使用完整 28 天窗口，唯一 `defaultSelected` 为 n8n，`confidence=high`，理由与下游消费位置完整。
- 正确性：`1/1 explainable`。旧逻辑与新逻辑均选 n8n，没有不可解释分歧。
- 未使用单日排名波动；Poe 的 210 展示、平均排名 34.1 被保留为 low-confidence 观察项，没有成为默认项。
- 没有选择正在 14 天冷却中的页面，也没有重复创建任务。第二个影子样本将在 10 月 31 日产生，当前不把一个样本外推为长期准确率。

## 五、Entity Resolution 抽查

- 本窗口新增 5 条 `collection_candidates`：Hailuo AI、MossImage、Pixform、Codebase Memory MCP、DeepSeek Harness。
- 这 5 条全部检查：均绑定各自唯一 Tool ID，没有任何 `autoMerged=true` 记录；MossImage 继续与 OpenMOSS MOSS-Image 模型实体分离，Codebase Memory MCP 与 Graphify 分离，DeepSeek Harness 的版本/插件留在同一产品事实边界。
- 正式 `autoMerged` 样本数为 0，因此 auto-merge 准确率记为 `N/A`，不能伪报 100%。前四周的 20% 抽查规则继续；不足 5 条时全查。
- 另发现用户提交 `coda-one` / `coda-one-2` 具有相同官方 URL、UTM 和内容，已分类为 `DUPLICATE_INPUT_HOLD`，`autoMerged=false`。不为该单例写专属规则；后续使用通用 canonical/entity 去重处理。

## 六、页面资产变化

| 状态 | 2026-10-29 | 2026-10-30 | 变化 |
| --- | ---: | ---: | ---: |
| 总资产 | 312 | 315 | +3 |
| KEEP_INDEX | 68 | 68 | 0 |
| IMPROVE | 3 | 3 | 0 |
| INTERNAL_NOINDEX | 162 | 163 | +1 |
| MERGE_CANDIDATE | 53 | 53 | 0 |
| ARCHIVE_CANDIDATE | 26 | 28 | +2 |

- 三个 `IMPROVE` 仍是 `/ai/n8n`、`/ai/poe` 和首页；本周没有机械扩充 Improve 队列。
- 增量来自新的外部 pending/rejected 输入与派生资产分类，不是新增公开页面或索引批准。
- 53 个合并候选与 28 个归档候选没有自动执行。本周不生成新的 Owner 处置包，避免在影子切换期间混入不可逆动作。

## 七、索引、生产与流程预算

- 本周 A 级 index/sitemap 使用：0/25；未使用 25。没有用 B/C 页面补配额。
- 生产矩阵：135 Tool IDs；89 published，其中 `continue_index=28`、`monitor=59`、`archive=2`。sitemap 为 152 URLs。
- GSC OAuth 可用；首页、robots.txt、sitemap.xml 均返回 200。
- 本周完成 foundation closeout 和第一个只读影子周期。影子周期没有开发槽、QA 槽、TypeScript、build、部署或重复 smoke。
- 未记录 `PROCESS_BUDGET_EXCEEDED`。没有新增评分服务、Dashboard、专属表、工具专属发布代码或阶段任务。

## 八、下周默认组合与 Owner 事项

默认组合：**n8n 主页面 + Make/Lindy 支撑边界 + 精确 Freshness + 一次最终 QA**。10 月 31 日只完成第二个只读影子周期；健康时 11 月 1 日自动启动，不等待 Owner 说“继续”。

Owner 事项：无需操作。合并、重定向、归档或删除仍需未来集中授权，本周没有提交此类动作。
