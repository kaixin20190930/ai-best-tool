# 核心页面真实信号审计

更新时间：2026-07-18

审计地址：`https://aibesttool.com`

这份报告只读取公开页面 HTML，不修改数据库，也不把模板文案当作真实用户证据。

## 汇总

- 核心页面：20
- HTTP 正常：20
- canonical：4/20
- meta description：17/20
- evidence / freshness 信号：13/20
- 评论 / 认领 / 官网 / 比较动作信号：20/20

## 页面明细

| 页面 | HTTP | canonical | description | evidence / freshness | action signal | 错误 |
| --- | --- | --- | --- | --- | --- | --- |
| / | 200 | 是 | 是 | 是 | 是 | - |
| /explore | 200 | 是 | 是 | 是 | 是 | - |
| /best-ai-tools | 200 | 否 | 是 | 是 | 是 | - |
| /categories/productivity | 200 | 否 | 否 | 否 | 是 | - |
| /categories/web3 | 200 | 否 | 否 | 否 | 是 | - |
| /categories/developer-tools | 200 | 否 | 否 | 否 | 是 | - |
| /categories/chatbot | 200 | 否 | 是 | 是 | 是 | - |
| /guides/how-to-choose-ai-tools | 200 | 否 | 是 | 是 | 是 | - |
| /guides/free-ai-tools | 200 | 否 | 是 | 是 | 是 | - |
| /guides/ai-writing-tools | 200 | 否 | 是 | 是 | 是 | - |
| /guides/ai-seo-tools | 200 | 否 | 是 | 是 | 是 | - |
| /guides/ai-coding-tools | 200 | 否 | 是 | 是 | 是 | - |
| /guides/ai-tools-for-web3 | 200 | 否 | 是 | 是 | 是 | - |
| /guides/ai-note-taking-tools | 200 | 否 | 是 | 是 | 是 | - |
| /ai/chatgpt | 200 | 否 | 是 | 否 | 是 | - |
| /ai/claude | 200 | 否 | 是 | 否 | 是 | - |
| /ai/cursor | 200 | 否 | 是 | 否 | 是 | - |
| /ai/runway | 200 | 是 | 是 | 是 | 是 | - |
| /ai/defillama | 200 | 是 | 是 | 是 | 是 | - |
| /ai/notta | 200 | 否 | 是 | 否 | 是 | - |

## 解读规则

- HTTP、canonical、description 是技术底线；失败时优先修复。
- evidence / freshness 只代表页面展示了验证口径，不代表已经有真实人工复核。
- action signal 只代表页面提供评论、认领、官网或比较入口，不代表已有真实互动。
- 真实评论、收藏、owner 认领和 editorial 复核仍需人工或用户产生，不能由脚本补齐。
