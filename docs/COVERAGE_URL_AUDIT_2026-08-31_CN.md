# Coverage URL 审计：已抓取但未编入索引

审计日期：2026-08-31  
数据源：`aibesttool.com-Coverage-Drilldown-2026-08-31.xlsx`  
范围：GSC“已抓取 - 尚未编入索引”的 24 个 URL。

## 结论

这 24 个 URL 不是同一种问题，不能统一点击“请求编入索引”。

- 13 条是已经输出 `noindex, follow` 的历史语言、比较或低价值变体；这是收口结果，保持不动。
- 1 条是 `favicon.ico`，不属于 HTML 索引页，不处理。
- 3 条是应当保留的核心入口：`/cn`、`/ai/claude`、`/ai/anthropic`。
- 1 条 Guide 存在 URL 与 canonical 口径不一致，需要技术修复。
- 6 条工具/分类页没有当前 GSC 机会信号，必须先通过页面质量和来源审计；未达标则 `noindex`，而不是继续保留空泛的可索引页。

## 逐条决策

| URL 或 URL 组 | 数量 | 生产状态 | 决策 | 后续动作 |
| --- | ---: | --- | --- | --- |
| `/fr/guides/ai-image-tools-comparison`、`/fr/guides/ai-video-tools-comparison`、`/ru/guides/ai-tools-for-crypto-research-comparison` | 3 | `noindex, follow` | 保持收口 | 不请求索引；GSC 分类滞后时等待下次抓取 |
| `/jp/guides/ai-tools-for-token-research`、`/pt/guides/ai-tools-for-automation` | 2 | `noindex, follow` | 保持收口 | 不新增同义 Guide |
| `/de/ai/langsmith`、`/pt/ai/elevenlabs-conversational-ai`、`/tw/ai/messari`、`/tw/ai/surfer` | 4 | `noindex, follow` | 保持收口 | 只有获得真实语言内容和来源时才重新评估 |
| `/de/ai/undressing_ai`、`/es/ai/undressing_ai`、`/tw/ai/undressing_ai`、`/de/ai/shop_your_ai_powered_Shopping_assistant` | 4 | `noindex, follow` | 保持收口 | 不在 sitemap、内链主路径或索引队列中恢复 |
| `/favicon.ico` | 1 | 静态资源，200 | 忽略 | 不影响 HTML 页面收录；不需要请求索引 |
| `/cn` | 1 | 200，self-canonical | 保留索引 | 作为中文目录首页，纳入每周 CTR/目录词监测 |
| `/ai/claude`、`/ai/anthropic` | 2 | 200，self-canonical | 保留并增强 | 补真实编辑/owner/官方事实信号；不新建同义页 |
| `/guides/how-to-choose-ai-tools` | 1 | 200，但 canonical 指向 `/en/guides/how-to-choose-ai-tools` | 技术修复 | 统一到站点的英文 canonical 规则；确认 sitemap 与内链只使用这一种 URL |
| `/ai/consensus`、`/ai/gumloop`、`/ai/salesloft`、`/cn/ai/luma-ai`、`/cn/categories/design-art`、`/ai/shop_your_ai_powered_Shopping_assistant` | 6 | 200，self-canonical 或正确重定向 | 质量审计后决定 | 先核对官方来源、独特选择信息、媒体与编辑复核；达标则增强，未达标则 `noindex` |

## 优先执行顺序

1. 修复 `how-to-choose-ai-tools` 的 canonical 口径。它是唯一明确的技术不一致项。
2. 对 6 个待决页面运行质量审计。优先检查 `shop_your_ai_powered_Shopping_assistant`，因为 URL、标题和内容可读性风险最高；其余页面不能仅因产品知名而保留索引。
3. 对 Claude、Anthropic 和中文首页做小幅、有来源的增强，分别承接工具选择和目录意图。
4. 等待下次 GSC 抓取，让已 `noindex` 的 13 条从“已抓取未编入索引”分类自然迁移；不做 Request Indexing。

## 复查标准

- 7 天后：GSC 中“已抓取未编入索引”总数不因无关 URL 新增而上升。
- 14 天后：`/cn`、Claude、Anthropic 至少有一个非首页页面出现新的展示或排名改善。
- 对待决页面：只有满足 [SEO 内容准入清单](./SEO_CONTENT_CHECKLIST.md) 的全部硬门槛，才能保留在 sitemap 和索引队列。
