<!-- growth-observation:start -->
# 产品发布后观察

核查时间：2026-11-12T02:14:38.878Z
生产写入：0。技术异常：0。Google 发现/抓取/收录与搜索效果未由 HTTP 验收代替。

| 页面 | HTTP | canonical | robots | sitemap |
| --- | ---: | --- | --- | --- |
| /ai/n8n | 200 | self | index | included |
| /cn/ai/n8n | 200 | self | index | included |
| /guides/ai-tools-for-automation-comparison | 200 | self | index | included |
| /cn/guides/ai-tools-for-automation-comparison | 200 | self | index | included |
| /ai/lindy | 200 | self | noindex | excluded |
| /cn/ai/lindy | 200 | self | noindex | excluded |
| /ai/make | 200 | self | noindex | excluded |
| /cn/ai/make | 200 | self | noindex | excluded |

| 对象 | 节点 | 到期日（上海） | 状态 |
| --- | --- | --- | --- |
| n8n-pricing | D+3 | 2026-11-08 | observed_partial_waiting_d7 |
| n8n-pricing | D+7 | 2026-11-12 | observed_indexed_old_crawl_waiting_recrawl |
| n8n-pricing | D+14 | 2026-11-19 | not_due |
| n8n-pricing | D+28 | 2026-12-03 | not_due |
| automation-comparison | D+3 | 2026-11-08 | waiting_data |
| automation-comparison | D+7 | 2026-11-12 | observed_old_noindex_waiting_recrawl |
| automation-comparison | D+14 | 2026-11-19 | not_due |
| automation-comparison | D+28 | 2026-12-03 | not_due |

未落账到期节点：0。已观察的 waiting_data/等待重抓不计成功，也不每日重复到期；后续在下一节点复查。账本位于 .local/gsc/operations/product-growth-milestone-*.json。
D+3 记录发现/技术，D+7 记录抓取，D+14/28 使用同窗最终查询与页面数据。内容冷却只约束对应已发布页面，不暂停其他工具的证据、去重、对比及有条件推荐准备。
<!-- growth-observation:end -->

## D+7 Google 证据（2026-11-12）

- GSC 最新完整日为 2026-11-09，7 天窗口为 11-03 至 11-09（Pacific Time）。英文 n8n 返回 3 条可见决策查询的页面×查询证据，共 5 impressions、0 clicks；裸品牌导航另有 34 impressions，不计 qualified outcome。中文 n8n 没有匹配行。具体查询行保留在私有 D+7 账本，不进入仓库汇总。
- URL Inspection 显示英文 n8n 为 `PASS / Submitted and indexed`，但最近抓取为 2026-11-03，早于 11-05 发布，因此只能证明旧版本已收录，不能证明当前版本已经重抓。中文 n8n 为 `URL is unknown to Google`。
- 英文 Automation comparison 仍返回旧抓取状态：最近抓取 2026-08-19、`Excluded by noindex`、旧 user canonical 指向 `/en/guides/ai-tools-for-automation`。当前生产页面实际已是 `index + self-canonical + sitemap included`，说明 Google 尚未重抓当前版本。中文 comparison 为未知 URL；两种语言均无匹配页面×查询行。
- D+7 已完成观察，但抓取结论为等待重抓，不改页面、索引或 sitemap。下一节点为 2026-11-19 D+14。
