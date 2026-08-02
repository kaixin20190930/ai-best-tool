# 核心页面真实信号审计

更新时间：2026-08-03

审计地址：`https://aibesttool.com`

这份报告只读取公开页面 HTML，不修改数据库，也不把模板文案当作真实用户证据。

## 汇总

- 核心页面：27
- HTTP 正常：27
- canonical：27/27
- meta description：27/27
- evidence / freshness 信号：27/27
- 评论 / 认领 / 官网 / 比较动作信号：27/27
- 指定机会页官方来源块：4/4

## 页面明细

| 页面 | HTTP | canonical | description | evidence / freshness | action signal | 官方来源块 | 错误 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| / | 200 | 是 | 是 | 是 | 是 | 不要求 | - |
| /explore | 200 | 是 | 是 | 是 | 是 | 不要求 | - |
| /best-ai-tools | 200 | 是 | 是 | 是 | 是 | 不要求 | - |
| /categories/productivity | 200 | 是 | 是 | 是 | 是 | 不要求 | - |
| /categories/research | 200 | 是 | 是 | 是 | 是 | 不要求 | - |
| /categories/voice | 200 | 是 | 是 | 是 | 是 | 不要求 | - |
| /categories/automation | 200 | 是 | 是 | 是 | 是 | 不要求 | - |
| /categories/web3 | 200 | 是 | 是 | 是 | 是 | 不要求 | - |
| /categories/developer-tools | 200 | 是 | 是 | 是 | 是 | 不要求 | - |
| /categories/chatbot | 200 | 是 | 是 | 是 | 是 | 不要求 | - |
| /guides/how-to-choose-ai-tools | 200 | 是 | 是 | 是 | 是 | 不要求 | - |
| /guides/free-ai-tools | 200 | 是 | 是 | 是 | 是 | 不要求 | - |
| /guides/ai-writing-tools | 200 | 是 | 是 | 是 | 是 | 不要求 | - |
| /guides/ai-seo-tools | 200 | 是 | 是 | 是 | 是 | 不要求 | - |
| /guides/ai-coding-tools | 200 | 是 | 是 | 是 | 是 | 不要求 | - |
| /guides/ai-tools-for-web3 | 200 | 是 | 是 | 是 | 是 | 不要求 | - |
| /guides/ai-note-taking-tools | 200 | 是 | 是 | 是 | 是 | 不要求 | - |
| /ai/chatgpt | 200 | 是 | 是 | 是 | 是 | 不要求 | - |
| /ai/claude | 200 | 是 | 是 | 是 | 是 | 不要求 | - |
| /ai/cursor | 200 | 是 | 是 | 是 | 是 | 不要求 | - |
| /ai/lindy | 200 | 是 | 是 | 是 | 是 | 是 | - |
| /ai/fathom | 200 | 是 | 是 | 是 | 是 | 是 | - |
| /ai/the-graph | 200 | 是 | 是 | 是 | 是 | 是 | - |
| /ai/dune | 200 | 是 | 是 | 是 | 是 | 是 | - |
| /ai/runway | 200 | 是 | 是 | 是 | 是 | 不要求 | - |
| /ai/defillama | 200 | 是 | 是 | 是 | 是 | 不要求 | - |
| /ai/notta | 200 | 是 | 是 | 是 | 是 | 不要求 | - |

## 解读规则

- HTTP、canonical、description 是技术底线；失败时优先修复。
- evidence / freshness 只代表页面展示了验证口径，不代表已经有真实人工复核。
- action signal 只代表页面提供评论、认领、官网或比较入口，不代表已有真实互动。
- Lindy、Fathom、The Graph 与 Dune 属于当前 GSC 机会页，必须显示带核查日期和官方链接的事实快照。
- 真实评论、收藏、owner 认领和 editorial 复核仍需人工或用户产生，不能由脚本补齐。
