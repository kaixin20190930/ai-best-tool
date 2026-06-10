# 重点工具详情补全说明

这一步的目标，不是“给所有工具都写很长的介绍”，而是先把最值得收录、最值得转化的重点工具页做成真正可决策的页面。

## 当前已补的第一批对象

- `chatgpt`
- `claude`
- `perplexity`
- `cursor`
- `notion-ai`
- `grammarly`
- `midjourney`
- `runway`
- `dune`
- `defillama`
- `the-graph`
- `n8n`
- `make`
- `openrouter`
- `sigoo`

## 这批补了什么

每个工具会补以下 5 类内容：

1. `content`
   - 更短、更清晰的一句话摘要
2. `detail`
   - 更像决策页的正文，不只是功能堆砌
3. `use_cases`
   - 明确适用场景，支持中英文
4. `features.localized`
   - 前台可直接展示的关键能力卡片，支持中英文
5. `features.editorial`
   - 编辑复核时间、复核摘要、可信度说明

## 前台会看到什么变化

工具详情页会新增或强化：

- 编辑复核
- 关键能力
- 适用场景
- 更清楚的“适合谁 / 不太适合谁”
- 更像真实比较页，而不是仅有简介和跳转按钮

## 如何继续补下一批

执行脚本：

```bash
pnpm exec tsx scripts/enrich-priority-tool-details.ts
```

如果要补新的工具：

1. 打开 [scripts/enrich-priority-tool-details.ts](/Users/liukai/web/ai-best-tool/scripts/enrich-priority-tool-details.ts)
2. 在 `PRIORITY_TOOLS` 里追加一个对象
3. 至少补齐：
   - `content.en / zh`
   - `detail.en / zh`
   - `useCases.en / zh`
   - `features.en / zh`
   - `editorialSummary.en / zh`
   - `trustNote.en / zh`
4. 重新运行脚本

## 下一批最建议补的对象

建议按这组优先级继续：

- `gemini`
- `grok`
- `copilot`
- `phind`
- `writesonic`
- `jasper`
- `gamma`
- `elevenlabs`
- `assemblyai`
- `alchemy`
- `nansen`
- `token-terminal`

## 运营上的使用标准

优先补这三类：

1. 搜索需求强的
   - 例如 ChatGPT、Claude、Perplexity、Cursor
2. 分类锚点强的
   - 例如 Dune、DefiLlama、The Graph、n8n
3. 有商业价值或你自己会重点运营的
   - 例如 Sigoo、自主提交且准备推广的工具

不建议一开始把 75 个工具全部补一遍。  
更好的方式是：每周补 5 到 10 个最重要的页面，持续把“少量高价值页面”做厚。
