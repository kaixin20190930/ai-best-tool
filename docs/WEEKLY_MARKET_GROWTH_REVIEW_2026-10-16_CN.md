# AI Best Tool 每周市场反馈与增长复盘

日期：2026-10-16（Asia/Shanghai）  
数据截止：GSC 最新完整日 2026-10-13；站内事件 unavailable。  
口径：页面/查询行是 GSC top rows，不是全量搜索量；缺失不按零处理。

## 一、本周结果

- GSC 最近 7 天：3 clicks / 956 impressions，CTR 0.31%，平均排名 13.42。
- GSC 最近 28 天：7 clicks / 1,813 impressions，CTR 0.39%，平均排名 14.40。
- Catalog：v0、SciSpace、WRITER、Everygen、Meta Muse Wonder、ArtCraft、Melty、Cloudflare Clef、WellSaid Studio 已按通用链路公开为 `published + monitor/noindex`；没有自动批准 index/sitemap。
- Decision：app-builder 主 Guide 与 EN/CN `build-app-with-ai` Task Page 两个用户可见单元完成；Task Page 保持 noindex、自指 canonical、sitemap excluded。
- Freshness：Murf、Pika、Synthesia、ChatGPT、Elicit、Lovable、Replit 完成统一更新或无变化复核；后四项最终 postcheck 均为 `alreadyApplied=true`、重复写入 0。
- 历史库存：96 个正式 Tool ID 已统一盘点；55 个 published `monitor/noindex`、17 个 `continue_index`、24 个未发布。剩余 12 项身份/实体核查和 2 项 Owner-only 处置候选；历史清单仍是一次性收敛，不形成长期第三条流程。

## 二、Market / Harvest 队列

| 优先级 | 页面 | 可观察信号 | 下周结果动作 |
| --- | --- | --- | --- |
| H1 | `/ai/n8n` | 7 天 679 impressions / 1 click / CTR 0.15% / position 9.27；28 天 933 impressions | 围绕 pricing、AI workflow、n8n vs Make/Zapier 的真实查询重写 Title/摘要与 Compare next，并加强自动化 Cluster 内链；不重做实体审核。 |
| H2 | `/ai/lindy` | 7 天 116 impressions / 0 click / position 27.18；生产库存无正式 Tool ID | 先解决页面信号与实体缺失的身份/canonical 边界，再进入新工具通用收录；不得把搜索壳当已收录工具。 |
| H3 | `/ai/poe` | 7 天 66 impressions / 0 click / position 24.24 | 聚焦 limits、subscription、适合/不适合场景的决策摘要；保持现有已索引实体，不重复索引审批。 |
| H4 | `/ai/deepl` | 28 天 82 impressions / 0 click / position 14.68 | 对齐 pricing/API cost/translation decision intent，检查标题、摘要和相关比较入口；不改已通过的实体门禁。 |
| H5 | `/ai/woy-ai` | 7 天 53 impressions / 0 click / position 9.75；库存为 `monitor/noindex + entity_due` | 作为技术/身份异常处理：核对实际 robots、canonical、来源和产品身份；在问题解释前不做 CTR 文案扩张，也不提出索引批准。 |

`/ai/n8n` 是唯一具备显著曝光且接近首页的强 Harvest 对象。下周先优化这一个高信号页面，不把五项都拆成代码任务。

## 三、Catalog 队列

以下为下周机会初评分，不是搜索量，也不是发布批准。共同需求依据来自 n8n/Lindy/automation 查询簇；每项发布前仍需官方身份、去重、两项互补来源、三语言内容和合法媒体。

| 候选 | 分数 | Cluster 角色 | 至少两个比较对象 | 下游消费位置 |
| --- | ---: | --- | --- | --- |
| Lindy | 88 | AI workflow / agent Anchor | n8n、Make | 自动化 Task/Comparison；先消除现有搜索壳与 Tool ID 缺口 |
| Zapier | 84 | Automation Anchor | n8n、Make | n8n 决策页、自动化 Task Page |
| Activepieces | 82 | Open-source Alternative | n8n、Zapier | 自托管/开源约束筛选与比较 |
| Gumloop | 80 | AI-native Alternative | Lindy、n8n | AI workflow 比较与 Best for |
| Relay.app | 78 | Human-in-the-loop Alternative | Zapier、Make | 审批/人工确认约束场景 |
| Bardeen | 76 | Browser-workflow Gap-filler | Lindy、Zapier | 浏览器自动化场景比较 |
| Dify | 75 | App-builder / LLM workflow Gap-filler | v0、Replit | 现有 app-builder Guide/Task 的开发者流程扩展 |

本周不再使用旧 Product Hunt 高分记录补数量。优先顺序为 Lindy → Zapier → Activepieces → Gumloop → Relay.app；Bardeen 与 Dify 作为证据和维护成本允许时的后备。正常目标 5-7 个完成候选准备，实际公开仍以每天 1、最多 2 个成熟工具为上限。

## 四、Decision 队列

下周只规划两个端到端用户可见单元，不拆成 evidence/gate/page/SEO 连续任务：

1. **AI workflow automation 决策单元**：以 n8n、Make、Pipedream 的既有实体为基线，待 Zapier/Lindy 达到公开条件后形成任务筛选与比较入口；展示部署方式、技术门槛、AI/agent 深度、运行成本、人工审批和 Best for/Not ideal。
2. **App builder Structured Comparison**：复用已完成的 Bolt、Lovable、v0、Replit 证据与 Task Page，只补用户可见 trade-off 和 Compare 路径；不重验既有 25 Claims，不自动 index/sitemap。

如果 Catalog 工具未及时达到公开条件，第一单元使用已有 n8n/Make/Pipedream 完成最小真实版本，不用内部规划内容填充页面。

## 五、Freshness 与一次性收敛

- 正常已收录工具更新继续使用统一 change set；无变化时保存 PASS 快照和 nextReviewDate，不改事实主张。
- 下一批先处理 OpenAI 家族与企业品牌身份核查中的最多 5 项，作为一次性库存收敛；随后处理其余实体证据项。
- Midjourney/OpenRouter 因为是 `continue_index`，单独使用受保护的高风险更新批次；不得与普通 monitor 工具混写。
- Perplexity 暂不混入其他批次，因为工作区存在受保护的相关 SQL；先确认该本地变更的归属。
- `aigirl-best`、`undressing_ai` 两项合并/归档/重定向候选仅进入集中 Owner 授权包，未授权不执行。

## 六、索引授权

本周 **没有提交新的 index/sitemap Owner 授权项**：n8n、DeepL、Poe 已经是 `continue_index`；Woy AI 身份证据不足；Lindy 尚无正式 Tool ID；近期逐 URL Coverage/URL Inspection 数据 unavailable。不能把 GSC top rows 或零展示替代索引状态。

## 七、流程膨胀审计

- 本周普通 Catalog 已收敛到一个端到端开发槽和一次最终 QA，没有恢复阶段任务。
- 历史库存与四工具 freshness 各出现一次窄范围返工；freshness 执行器又暴露写集和 Node 导入问题，虽然均被 QA/postcheck 拦截，但说明首次通用执行器成本偏高。
- 下周 P0 是**复用已经通过的通用库存和 freshness 执行器**，不得为每个工具新增脚本、guard、manifest schema、build 或 smoke。没有运行时代码差分时仅做 R 级来源/结构检查。
- 本周未记录可比较的端到端分钟级时间戳，因此平均交付时间 unavailable；不得编造效率提升百分比。后续日报只记录开始/结束和 QA 次数，不建设 Dashboard。
- payment、paid submission、verified vendor、featured/sponsored 没有进入机会评分、自然排序、Decision、index 或 sitemap。

## 八、下周结果型组合

- Harvest：5 项队列，实际优先完成 n8n；其余按身份/意图边界推进。
- Catalog：5 个主候选 + 2 个后备；每天 1、最多 2 个公开实体。
- Decision：2 个用户可见端到端单元。
- Discover：最多 1-2 个趋势候选，仅做证据候选包，不抢占 Harvest。
- Freshness：每天一个最多 5-10 条同类低风险 change set；历史身份核查作为一次性收敛并在完成后退出。
- Owner：当前无 index/sitemap 新授权请求；2 项处置候选将在证据核清后集中提交。
