# 核心页面真实信号审计

更新时间：2026-08-31

审计地址：`https://aibesttool.com`

这份报告只读取公开页面 HTML，不修改数据库，也不把模板文案当作真实用户证据。

## 汇总

- 核心页面：33
- HTTP 正常：33
- canonical：33/33
- meta description：28/33
- evidence / freshness 信号：14/33
- 评论 / 认领 / 官网 / 比较动作信号：33/33
- 指定机会页官方来源块：2/16

## 页面明细

| 页面 | HTTP | canonical | description | evidence / freshness | action signal | 官方来源块 | 错误 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| / | 200 | 是 | 是 | 是 | 是 | 不要求 | - |
| /explore | 200 | 是 | 是 | 是 | 是 | 不要求 | - |
| /best-ai-tools | 200 | 是 | 是 | 是 | 是 | 不要求 | - |
| /categories/productivity | 200 | 是 | 是 | 是 | 是 | 不要求 | - |
| /categories/research | 200 | 是 | 否 | 否 | 是 | 不要求 | - |
| /categories/voice | 200 | 是 | 否 | 否 | 是 | 不要求 | - |
| /categories/automation | 200 | 是 | 否 | 否 | 是 | 不要求 | - |
| /categories/web3 | 200 | 是 | 否 | 否 | 是 | 不要求 | - |
| /categories/developer-tools | 200 | 是 | 否 | 否 | 是 | 不要求 | - |
| /categories/chatbot | 200 | 是 | 是 | 是 | 是 | 不要求 | - |
| /guides/how-to-choose-ai-tools | 200 | 是 | 是 | 是 | 是 | 不要求 | - |
| /guides/free-ai-tools | 200 | 是 | 是 | 是 | 是 | 不要求 | - |
| /guides/ai-writing-tools | 200 | 是 | 是 | 是 | 是 | 不要求 | - |
| /guides/ai-seo-tools | 200 | 是 | 是 | 是 | 是 | 不要求 | - |
| /guides/ai-coding-tools | 200 | 是 | 是 | 是 | 是 | 不要求 | - |
| /guides/ai-tools-for-web3 | 200 | 是 | 是 | 是 | 是 | 不要求 | - |
| /guides/ai-note-taking-tools | 200 | 是 | 是 | 是 | 是 | 不要求 | - |
| /ai/chatgpt | 200 | 是 | 是 | 否 | 是 | 否 | - |
| /ai/claude | 200 | 是 | 是 | 否 | 是 | 否 | - |
| /ai/cursor | 200 | 是 | 是 | 否 | 是 | 否 | - |
| /ai/lindy | 200 | 是 | 是 | 否 | 是 | 否 | - |
| /ai/fathom | 200 | 是 | 是 | 是 | 是 | 是 | - |
| /ai/pipedream | 200 | 是 | 是 | 是 | 是 | 是 | - |
| /ai/the-graph | 200 | 是 | 是 | 否 | 是 | 否 | - |
| /ai/dune | 200 | 是 | 是 | 否 | 是 | 否 | - |
| /ai/runway | 200 | 是 | 是 | 否 | 是 | 否 | - |
| /ai/defillama | 200 | 是 | 是 | 否 | 是 | 否 | - |
| /ai/notta | 200 | 是 | 是 | 否 | 是 | 否 | - |
| /ai/perplexity | 200 | 是 | 是 | 否 | 是 | 否 | - |
| /ai/n8n | 200 | 是 | 是 | 否 | 是 | 否 | - |
| /ai/make | 200 | 是 | 是 | 否 | 是 | 否 | - |
| /ai/openrouter | 200 | 是 | 是 | 否 | 是 | 否 | - |
| /ai/grammarly | 200 | 是 | 是 | 否 | 是 | 否 | - |

## 解读规则

- HTTP、canonical、description 是技术底线；失败时优先修复。
- evidence / freshness 只代表页面展示了验证口径，不代表已经有真实人工复核。
- action signal 只代表页面提供评论、认领、官网或比较入口，不代表已有真实互动。
- Lindy、Fathom、The Graph、Dune、Notta、Runway、DefiLlama、ChatGPT、Claude、Cursor、Pipedream、Perplexity、n8n、Make、OpenRouter 与 Grammarly 属于当前 GSC 机会页，必须显示带核查日期和官方链接的事实快照。
- 真实评论、收藏、owner 认领和 editorial 复核仍需人工或用户产生，不能由脚本补齐。

## 生产版本说明

本次审计中缺失的 14 个证据块不是没有对应内容：ChatGPT 等页面在分类或标签辅助查询异常后，被最外层错误处理降级为“暂时不可用”页面。修复已将两类辅助查询隔离为可失败增强项；部署当前 `main` 后，必须重新运行 `pnpm run seo:priority-page-signals -- --strict`，确认 16 个机会工具都能完整渲染。
