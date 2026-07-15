# SEO 页面质量盘点表

更新时间：2026-07-15

这份表由 `pnpm exec tsx scripts/seo-quality-inventory.ts` 生成，用来辅助判断页面是否应该继续索引、保持内部流量，或进入 noindex / 合并候选。

## 汇总

- 总页面数：157
- 可进 sitemap：27
- 内部流量页：3
- noindex / 合并候选：127

## 处理原则

- P1 页面先补真实数据、验证日期、选择理由、评论或 owner 信号。
- P2 内部流量页不急着推给 Google，先观察站内点击和用户价值。
- comparison 页默认不进 sitemap，当前先保持 noindex。
- 同义 guide 如果长期无曝光、无点击、无转化，后续优先合并到主 guide。

## 页面清单

| URL | 类型 | 当前状态 | 优先级 | 处理动作 | 原因 |
| --- | --- | --- | --- | --- | --- |
| / | Core | 可进 sitemap | P1 | 增强站点定位、精选入口和最近更新信号 | 全站主题锚点，应该帮助 Google 快速理解站点价值。 |
| /ai/chatgpt | Tool | 可进 sitemap | P1 | 补最近验证日期、价格/免费限制、适合人群、真实评论或 owner 信号 | 代表性详情页，需要承担站点可信度和长尾搜索入口。 |
| /ai/claude | Tool | 可进 sitemap | P1 | 补最近验证日期、价格/免费限制、适合人群、真实评论或 owner 信号 | 代表性详情页，需要承担站点可信度和长尾搜索入口。 |
| /ai/cursor | Tool | 可进 sitemap | P1 | 补最近验证日期、价格/免费限制、适合人群、真实评论或 owner 信号 | 代表性详情页，需要承担站点可信度和长尾搜索入口。 |
| /ai/defillama | Tool | 可进 sitemap | P1 | 补最近验证日期、价格/免费限制、适合人群、真实评论或 owner 信号 | 代表性详情页，需要承担站点可信度和长尾搜索入口。 |
| /ai/notta | Tool | 可进 sitemap | P1 | 补最近验证日期、价格/免费限制、适合人群、真实评论或 owner 信号 | 代表性详情页，需要承担站点可信度和长尾搜索入口。 |
| /ai/runway | Tool | 可进 sitemap | P1 | 补最近验证日期、价格/免费限制、适合人群、真实评论或 owner 信号 | 代表性详情页，需要承担站点可信度和长尾搜索入口。 |
| /best-ai-tools | Core | 可进 sitemap | P1 | 补排名方法、更新时间和选择标准 | 承接高意图榜单搜索，必须避免变成普通列表页。 |
| /explore | Core | 可进 sitemap | P1 | 补充目录筛选说明、热门分类和质量规则 | 目录主入口，适合作为工具页的索引与内链枢纽。 |
| /guides/ai-coding-tools | Guide | 可进 sitemap | P1 | 补真实数据、选择标准、最近验证日期和内部链接 | 核心指南页，适合优先做真实内容增强。 |
| /guides/ai-note-taking-tools | Guide | 可进 sitemap | P1 | 补真实数据、选择标准、最近验证日期和内部链接 | 核心指南页，适合优先做真实内容增强。 |
| /guides/ai-seo-tools | Guide | 可进 sitemap | P1 | 补真实数据、选择标准、最近验证日期和内部链接 | 核心指南页，适合优先做真实内容增强。 |
| /guides/ai-tools-for-web3 | Guide | 可进 sitemap | P1 | 补真实数据、选择标准、最近验证日期和内部链接 | 核心指南页，适合优先做真实内容增强。 |
| /guides/ai-writing-tools | Guide | 可进 sitemap | P1 | 补真实数据、选择标准、最近验证日期和内部链接 | 核心指南页，适合优先做真实内容增强。 |
| /guides/free-ai-tools | Guide | 可进 sitemap | P1 | 补真实数据、选择标准、最近验证日期和内部链接 | 核心指南页，适合优先做真实内容增强。 |
| /guides/how-to-choose-ai-tools | Guide | 可进 sitemap | P1 | 补真实数据、选择标准、最近验证日期和内部链接 | 核心指南页，适合优先做真实内容增强。 |
| /developer/listing | Conversion | 内部流量页 | P2 | 保持 noindex, follow；继续引导 owner 认领 | 认领页是商业验证入口，不作为独立 SEO 目标页。 |
| /guides/adobe-alternatives-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/agent-tools | Guide | noindex / 合并候选 | P2 | 通过 X-Robots-Tag 保持 noindex, follow；检查是否与主 guide 同义，必要时合并 | 该 guide 不是当前 sitemap 主力页面，先保留用户访问和内链价值，但不参与索引竞争。 |
| /guides/ai-agent-tools | Guide | noindex / 合并候选 | P2 | 通过 X-Robots-Tag 保持 noindex, follow；检查是否与主 guide 同义，必要时合并 | 该 guide 不是当前 sitemap 主力页面，先保留用户访问和内链价值，但不参与索引竞争。 |
| /guides/ai-agent-tools-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/ai-api-observability-tools | Guide | noindex / 合并候选 | P2 | 通过 X-Robots-Tag 保持 noindex, follow；检查是否与主 guide 同义，必要时合并 | 该 guide 不是当前 sitemap 主力页面，先保留用户访问和内链价值，但不参与索引竞争。 |
| /guides/ai-api-observability-tools-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/ai-automation-tools | Guide | noindex / 合并候选 | P2 | 通过 X-Robots-Tag 保持 noindex, follow；检查是否与主 guide 同义，必要时合并 | 该 guide 不是当前 sitemap 主力页面，先保留用户访问和内链价值，但不参与索引竞争。 |
| /guides/ai-automation-tools-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/ai-chatbot-tools | Guide | 可进 sitemap | P2 | 保留 sitemap；每周检查是否需要增强或降级 | 主力指南页，但不是本轮 20 个最高优先级页面。 |
| /guides/ai-chatbot-tools-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/ai-code-review-tools | Guide | noindex / 合并候选 | P2 | 通过 X-Robots-Tag 保持 noindex, follow；检查是否与主 guide 同义，必要时合并 | 该 guide 不是当前 sitemap 主力页面，先保留用户访问和内链价值，但不参与索引竞争。 |
| /guides/ai-code-review-tools-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/ai-coding-tools-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/ai-evals-tools | Guide | noindex / 合并候选 | P2 | 通过 X-Robots-Tag 保持 noindex, follow；检查是否与主 guide 同义，必要时合并 | 该 guide 不是当前 sitemap 主力页面，先保留用户访问和内链价值，但不参与索引竞争。 |
| /guides/ai-evals-tools-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/ai-image-tools | Guide | 可进 sitemap | P2 | 保留 sitemap；每周检查是否需要增强或降级 | 主力指南页，但不是本轮 20 个最高优先级页面。 |
| /guides/ai-image-tools-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/ai-marketing-tools | Guide | noindex / 合并候选 | P2 | 通过 X-Robots-Tag 保持 noindex, follow；检查是否与主 guide 同义，必要时合并 | 该 guide 不是当前 sitemap 主力页面，先保留用户访问和内链价值，但不参与索引竞争。 |
| /guides/ai-marketing-tools-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/ai-model-routing-tools | Guide | noindex / 合并候选 | P2 | 通过 X-Robots-Tag 保持 noindex, follow；检查是否与主 guide 同义，必要时合并 | 该 guide 不是当前 sitemap 主力页面，先保留用户访问和内链价值，但不参与索引竞争。 |
| /guides/ai-model-routing-tools-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/ai-note-taking-tools-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/ai-productivity-tools | Guide | 可进 sitemap | P2 | 保留 sitemap；每周检查是否需要增强或降级 | 主力指南页，但不是本轮 20 个最高优先级页面。 |
| /guides/ai-productivity-tools-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/ai-research-tools | Guide | noindex / 合并候选 | P2 | 通过 X-Robots-Tag 保持 noindex, follow；检查是否与主 guide 同义，必要时合并 | 该 guide 不是当前 sitemap 主力页面，先保留用户访问和内链价值，但不参与索引竞争。 |
| /guides/ai-research-tools-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/ai-sales-tools | Guide | noindex / 合并候选 | P2 | 通过 X-Robots-Tag 保持 noindex, follow；检查是否与主 guide 同义，必要时合并 | 该 guide 不是当前 sitemap 主力页面，先保留用户访问和内链价值，但不参与索引竞争。 |
| /guides/ai-sales-tools-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/ai-seo-tools-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/ai-tools-for-agencies | Guide | noindex / 合并候选 | P2 | 通过 X-Robots-Tag 保持 noindex, follow；检查是否与主 guide 同义，必要时合并 | 该 guide 不是当前 sitemap 主力页面，先保留用户访问和内链价值，但不参与索引竞争。 |
| /guides/ai-tools-for-agencies-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/ai-tools-for-agents | Guide | noindex / 合并候选 | P2 | 通过 X-Robots-Tag 保持 noindex, follow；检查是否与主 guide 同义，必要时合并 | 该 guide 不是当前 sitemap 主力页面，先保留用户访问和内链价值，但不参与索引竞争。 |
| /guides/ai-tools-for-agents-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/ai-tools-for-api-observability | Guide | noindex / 合并候选 | P2 | 通过 X-Robots-Tag 保持 noindex, follow；检查是否与主 guide 同义，必要时合并 | 该 guide 不是当前 sitemap 主力页面，先保留用户访问和内链价值，但不参与索引竞争。 |
| /guides/ai-tools-for-api-observability-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/ai-tools-for-automation | Guide | 可进 sitemap | P2 | 保留 sitemap；每周检查是否需要增强或降级 | 主力指南页，但不是本轮 20 个最高优先级页面。 |
| /guides/ai-tools-for-automation-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/ai-tools-for-code-review | Guide | noindex / 合并候选 | P2 | 通过 X-Robots-Tag 保持 noindex, follow；检查是否与主 guide 同义，必要时合并 | 该 guide 不是当前 sitemap 主力页面，先保留用户访问和内链价值，但不参与索引竞争。 |
| /guides/ai-tools-for-code-review-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/ai-tools-for-content-creation | Guide | noindex / 合并候选 | P2 | 通过 X-Robots-Tag 保持 noindex, follow；检查是否与主 guide 同义，必要时合并 | 该 guide 不是当前 sitemap 主力页面，先保留用户访问和内链价值，但不参与索引竞争。 |
| /guides/ai-tools-for-content-creation-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/ai-tools-for-creators | Guide | noindex / 合并候选 | P2 | 通过 X-Robots-Tag 保持 noindex, follow；检查是否与主 guide 同义，必要时合并 | 该 guide 不是当前 sitemap 主力页面，先保留用户访问和内链价值，但不参与索引竞争。 |
| /guides/ai-tools-for-creators-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/ai-tools-for-crypto-portfolio-tracking | Guide | noindex / 合并候选 | P2 | 通过 X-Robots-Tag 保持 noindex, follow；检查是否与主 guide 同义，必要时合并 | 该 guide 不是当前 sitemap 主力页面，先保留用户访问和内链价值，但不参与索引竞争。 |
| /guides/ai-tools-for-crypto-portfolio-tracking-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/ai-tools-for-crypto-research | Guide | noindex / 合并候选 | P2 | 通过 X-Robots-Tag 保持 noindex, follow；检查是否与主 guide 同义，必要时合并 | 该 guide 不是当前 sitemap 主力页面，先保留用户访问和内链价值，但不参与索引竞争。 |
| /guides/ai-tools-for-crypto-research-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/ai-tools-for-customer-support | Guide | noindex / 合并候选 | P2 | 通过 X-Robots-Tag 保持 noindex, follow；检查是否与主 guide 同义，必要时合并 | 该 guide 不是当前 sitemap 主力页面，先保留用户访问和内链价值，但不参与索引竞争。 |
| /guides/ai-tools-for-customer-support-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/ai-tools-for-defi-analytics | Guide | noindex / 合并候选 | P2 | 通过 X-Robots-Tag 保持 noindex, follow；检查是否与主 guide 同义，必要时合并 | 该 guide 不是当前 sitemap 主力页面，先保留用户访问和内链价值，但不参与索引竞争。 |
| /guides/ai-tools-for-defi-analytics-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/ai-tools-for-designers | Guide | noindex / 合并候选 | P2 | 通过 X-Robots-Tag 保持 noindex, follow；检查是否与主 guide 同义，必要时合并 | 该 guide 不是当前 sitemap 主力页面，先保留用户访问和内链价值，但不参与索引竞争。 |
| /guides/ai-tools-for-designers-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/ai-tools-for-developers | Guide | 可进 sitemap | P2 | 保留 sitemap；每周检查是否需要增强或降级 | 主力指南页，但不是本轮 20 个最高优先级页面。 |
| /guides/ai-tools-for-developers-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/ai-tools-for-dex-analytics | Guide | noindex / 合并候选 | P2 | 通过 X-Robots-Tag 保持 noindex, follow；检查是否与主 guide 同义，必要时合并 | 该 guide 不是当前 sitemap 主力页面，先保留用户访问和内链价值，但不参与索引竞争。 |
| /guides/ai-tools-for-dex-analytics-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/ai-tools-for-ecommerce | Guide | noindex / 合并候选 | P2 | 通过 X-Robots-Tag 保持 noindex, follow；检查是否与主 guide 同义，必要时合并 | 该 guide 不是当前 sitemap 主力页面，先保留用户访问和内链价值，但不参与索引竞争。 |
| /guides/ai-tools-for-ecommerce-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/ai-tools-for-evals | Guide | noindex / 合并候选 | P2 | 通过 X-Robots-Tag 保持 noindex, follow；检查是否与主 guide 同义，必要时合并 | 该 guide 不是当前 sitemap 主力页面，先保留用户访问和内链价值，但不参与索引竞争。 |
| /guides/ai-tools-for-evals-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/ai-tools-for-lead-generation | Guide | noindex / 合并候选 | P2 | 通过 X-Robots-Tag 保持 noindex, follow；检查是否与主 guide 同义，必要时合并 | 该 guide 不是当前 sitemap 主力页面，先保留用户访问和内链价值，但不参与索引竞争。 |
| /guides/ai-tools-for-lead-generation-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/ai-tools-for-marketing | Guide | 可进 sitemap | P2 | 保留 sitemap；每周检查是否需要增强或降级 | 主力指南页，但不是本轮 20 个最高优先级页面。 |
| /guides/ai-tools-for-marketing-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/ai-tools-for-meeting-notes | Guide | noindex / 合并候选 | P2 | 通过 X-Robots-Tag 保持 noindex, follow；检查是否与主 guide 同义，必要时合并 | 该 guide 不是当前 sitemap 主力页面，先保留用户访问和内链价值，但不参与索引竞争。 |
| /guides/ai-tools-for-meeting-notes-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/ai-tools-for-model-routing | Guide | noindex / 合并候选 | P2 | 通过 X-Robots-Tag 保持 noindex, follow；检查是否与主 guide 同义，必要时合并 | 该 guide 不是当前 sitemap 主力页面，先保留用户访问和内链价值，但不参与索引竞争。 |
| /guides/ai-tools-for-model-routing-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/ai-tools-for-on-chain-analysis | Guide | noindex / 合并候选 | P2 | 通过 X-Robots-Tag 保持 noindex, follow；检查是否与主 guide 同义，必要时合并 | 该 guide 不是当前 sitemap 主力页面，先保留用户访问和内链价值，但不参与索引竞争。 |
| /guides/ai-tools-for-on-chain-analysis-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/ai-tools-for-prompt-testing | Guide | noindex / 合并候选 | P2 | 通过 X-Robots-Tag 保持 noindex, follow；检查是否与主 guide 同义，必要时合并 | 该 guide 不是当前 sitemap 主力页面，先保留用户访问和内链价值，但不参与索引竞争。 |
| /guides/ai-tools-for-prompt-testing-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/ai-tools-for-protocol-analytics | Guide | noindex / 合并候选 | P2 | 通过 X-Robots-Tag 保持 noindex, follow；检查是否与主 guide 同义，必要时合并 | 该 guide 不是当前 sitemap 主力页面，先保留用户访问和内链价值，但不参与索引竞争。 |
| /guides/ai-tools-for-protocol-analytics-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/ai-tools-for-research | Guide | 可进 sitemap | P2 | 保留 sitemap；每周检查是否需要增强或降级 | 主力指南页，但不是本轮 20 个最高优先级页面。 |
| /guides/ai-tools-for-research-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/ai-tools-for-sales | Guide | 可进 sitemap | P2 | 保留 sitemap；每周检查是否需要增强或降级 | 主力指南页，但不是本轮 20 个最高优先级页面。 |
| /guides/ai-tools-for-sales-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/ai-tools-for-sales-prospecting | Guide | noindex / 合并候选 | P2 | 通过 X-Robots-Tag 保持 noindex, follow；检查是否与主 guide 同义，必要时合并 | 该 guide 不是当前 sitemap 主力页面，先保留用户访问和内链价值，但不参与索引竞争。 |
| /guides/ai-tools-for-sales-prospecting-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/ai-tools-for-small-business | Guide | noindex / 合并候选 | P2 | 通过 X-Robots-Tag 保持 noindex, follow；检查是否与主 guide 同义，必要时合并 | 该 guide 不是当前 sitemap 主力页面，先保留用户访问和内链价值，但不参与索引竞争。 |
| /guides/ai-tools-for-small-business-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/ai-tools-for-students | Guide | noindex / 合并候选 | P2 | 通过 X-Robots-Tag 保持 noindex, follow；检查是否与主 guide 同义，必要时合并 | 该 guide 不是当前 sitemap 主力页面，先保留用户访问和内链价值，但不参与索引竞争。 |
| /guides/ai-tools-for-students-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/ai-tools-for-token-research | Guide | noindex / 合并候选 | P2 | 通过 X-Robots-Tag 保持 noindex, follow；检查是否与主 guide 同义，必要时合并 | 该 guide 不是当前 sitemap 主力页面，先保留用户访问和内链价值，但不参与索引竞争。 |
| /guides/ai-tools-for-token-research-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/ai-tools-for-voice | Guide | 可进 sitemap | P2 | 保留 sitemap；每周检查是否需要增强或降级 | 主力指南页，但不是本轮 20 个最高优先级页面。 |
| /guides/ai-tools-for-voice-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/ai-tools-for-wallet-monitoring | Guide | noindex / 合并候选 | P2 | 通过 X-Robots-Tag 保持 noindex, follow；检查是否与主 guide 同义，必要时合并 | 该 guide 不是当前 sitemap 主力页面，先保留用户访问和内链价值，但不参与索引竞争。 |
| /guides/ai-tools-for-wallet-monitoring-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/ai-tools-for-wallet-research | Guide | noindex / 合并候选 | P2 | 通过 X-Robots-Tag 保持 noindex, follow；检查是否与主 guide 同义，必要时合并 | 该 guide 不是当前 sitemap 主力页面，先保留用户访问和内链价值，但不参与索引竞争。 |
| /guides/ai-tools-for-wallet-research-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/ai-tools-for-web3-analysis | Guide | noindex / 合并候选 | P2 | 通过 X-Robots-Tag 保持 noindex, follow；检查是否与主 guide 同义，必要时合并 | 该 guide 不是当前 sitemap 主力页面，先保留用户访问和内链价值，但不参与索引竞争。 |
| /guides/ai-tools-for-web3-analysis-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/ai-tools-for-web3-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/ai-video-tools | Guide | 可进 sitemap | P2 | 保留 sitemap；每周检查是否需要增强或降级 | 主力指南页，但不是本轮 20 个最高优先级页面。 |
| /guides/ai-video-tools-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/ai-web3-tools | Guide | noindex / 合并候选 | P2 | 通过 X-Robots-Tag 保持 noindex, follow；检查是否与主 guide 同义，必要时合并 | 该 guide 不是当前 sitemap 主力页面，先保留用户访问和内链价值，但不参与索引竞争。 |
| /guides/ai-web3-tools-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/ai-writing-tools-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/automation-tools | Guide | noindex / 合并候选 | P2 | 通过 X-Robots-Tag 保持 noindex, follow；检查是否与主 guide 同义，必要时合并 | 该 guide 不是当前 sitemap 主力页面，先保留用户访问和内链价值，但不参与索引竞争。 |
| /guides/best-free-ai-tools | Guide | 可进 sitemap | P2 | 保留 sitemap；每周检查是否需要增强或降级 | 主力指南页，但不是本轮 20 个最高优先级页面。 |
| /guides/best-free-ai-tools-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/character-ai-alternatives-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/chatbot-tools | Guide | noindex / 合并候选 | P2 | 通过 X-Robots-Tag 保持 noindex, follow；检查是否与主 guide 同义，必要时合并 | 该 guide 不是当前 sitemap 主力页面，先保留用户访问和内链价值，但不参与索引竞争。 |
| /guides/chatgpt-alternatives-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/claude-alternatives-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/copy-ai-alternatives-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/cursor-alternatives-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/descript-alternatives-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/developer-tools | Guide | noindex / 合并候选 | P2 | 通过 X-Robots-Tag 保持 noindex, follow；检查是否与主 guide 同义，必要时合并 | 该 guide 不是当前 sitemap 主力页面，先保留用户访问和内链价值，但不参与索引竞争。 |
| /guides/elevenlabs-alternatives-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/gemini-alternatives-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/grammarly-alternatives-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/hubspot-alternatives-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/image-tools | Guide | noindex / 合并候选 | P2 | 通过 X-Robots-Tag 保持 noindex, follow；检查是否与主 guide 同义，必要时合并 | 该 guide 不是当前 sitemap 主力页面，先保留用户访问和内链价值，但不参与索引竞争。 |
| /guides/jasper-alternatives-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/mailchimp-alternatives-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/make-alternatives-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/marketing-tools | Guide | noindex / 合并候选 | P2 | 通过 X-Robots-Tag 保持 noindex, follow；检查是否与主 guide 同义，必要时合并 | 该 guide 不是当前 sitemap 主力页面，先保留用户访问和内链价值，但不参与索引竞争。 |
| /guides/n8n-alternatives-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/note-taking-tools | Guide | noindex / 合并候选 | P2 | 通过 X-Robots-Tag 保持 noindex, follow；检查是否与主 guide 同义，必要时合并 | 该 guide 不是当前 sitemap 主力页面，先保留用户访问和内链价值，但不参与索引竞争。 |
| /guides/notion-alternatives-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/notta-alternatives-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/perplexity-alternatives-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/poe-alternatives-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/productivity-tools | Guide | noindex / 合并候选 | P2 | 通过 X-Robots-Tag 保持 noindex, follow；检查是否与主 guide 同义，必要时合并 | 该 guide 不是当前 sitemap 主力页面，先保留用户访问和内链价值，但不参与索引竞争。 |
| /guides/research-tools | Guide | noindex / 合并候选 | P2 | 通过 X-Robots-Tag 保持 noindex, follow；检查是否与主 guide 同义，必要时合并 | 该 guide 不是当前 sitemap 主力页面，先保留用户访问和内链价值，但不参与索引竞争。 |
| /guides/sales-tools | Guide | noindex / 合并候选 | P2 | 通过 X-Robots-Tag 保持 noindex, follow；检查是否与主 guide 同义，必要时合并 | 该 guide 不是当前 sitemap 主力页面，先保留用户访问和内链价值，但不参与索引竞争。 |
| /guides/salesforce-einstein-alternatives-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/seo-tools | Guide | noindex / 合并候选 | P2 | 通过 X-Robots-Tag 保持 noindex, follow；检查是否与主 guide 同义，必要时合并 | 该 guide 不是当前 sitemap 主力页面，先保留用户访问和内链价值，但不参与索引竞争。 |
| /guides/sora-alternatives-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/suno-alternatives-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /guides/video-tools | Guide | noindex / 合并候选 | P2 | 通过 X-Robots-Tag 保持 noindex, follow；检查是否与主 guide 同义，必要时合并 | 该 guide 不是当前 sitemap 主力页面，先保留用户访问和内链价值，但不参与索引竞争。 |
| /guides/voice-tools | Guide | noindex / 合并候选 | P2 | 通过 X-Robots-Tag 保持 noindex, follow；检查是否与主 guide 同义，必要时合并 | 该 guide 不是当前 sitemap 主力页面，先保留用户访问和内链价值，但不参与索引竞争。 |
| /guides/writing-tools | Guide | noindex / 合并候选 | P2 | 通过 X-Robots-Tag 保持 noindex, follow；检查是否与主 guide 同义，必要时合并 | 该 guide 不是当前 sitemap 主力页面，先保留用户访问和内链价值，但不参与索引竞争。 |
| /guides/zapier-alternatives-comparison | Comparison | noindex / 合并候选 | P2 | 保持 noindex；只给用户做内部决策导流，后续按表现决定是否合并 | comparison 页面结构相似，当前不适合大规模进入索引面。 |
| /pricing | Conversion | 内部流量页 | P2 | 保持 noindex, follow；只服务转化 | 交易页不应和内容页争夺索引预算。 |
| /submit | Conversion | 内部流量页 | P2 | 保持 noindex, follow；继续强化提交前教育 | 表单页主要服务操作，不是搜索入口。 |
