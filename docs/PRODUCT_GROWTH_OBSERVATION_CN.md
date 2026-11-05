# 产品发布后观察

核查时间：2026-11-05T09:24:15.608Z
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
| n8n-pricing | D+3 | 2026-11-08 | not_due |
| n8n-pricing | D+7 | 2026-11-12 | not_due |
| n8n-pricing | D+14 | 2026-11-19 | not_due |
| n8n-pricing | D+28 | 2026-12-03 | not_due |
| automation-comparison | D+3 | 2026-11-08 | not_due |
| automation-comparison | D+7 | 2026-11-12 | not_due |
| automation-comparison | D+14 | 2026-11-19 | not_due |
| automation-comparison | D+28 | 2026-12-03 | not_due |

到期只触发核查，不能自动标为完成。D+3 记录发现/技术，D+7 记录抓取，D+14/28 使用同窗最终查询与页面数据。
Lindy 尚未发布，不启动其 D+ 计时；Make 不提前进入索引。n8n 与 Automation 内容冷却至 2026-11-19，事实/技术错误除外。
