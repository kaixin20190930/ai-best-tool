# RESEARCH-COMPARISON-CONSOLIDATION-01 · 研究类指南与对比收口

日期：2026-10-10。范围仅含三条既有 Guide URL、研究比较内容、共用比较模板中直接暴露的标签/面包屑与对应测试。没有创建新 URL、数据库写入、部署或推送。

## 现状审计与意图

| 路由 | 原有搜索意图与内容 | 原有索引/站点地图/导航 | 处置 |
| --- | --- | --- | --- |
| `/guides/ai-tools-for-research` | 研究工具选型方法：先区分发现、证据核对，再进入榜单或比较；含任务路径及 FAQ。 | 白名单可索引；`buildLocalizedPageMetadata` 自指 canonical 与 en/cn hreflang；在 sitemap；Guide root、首页、Explore、分类等有入口。 | 保留独立指南和原有 SEO 契约。 |
| `/guides/ai-tools-for-research-comparison` | 原为 unavailable 空壳；意图是多工具横向比较。Guide、榜单、工具 compare CTA 与 featured 列表均指向此路由。 | middleware `noindex, follow`；不在 sitemap；原 metadata 无显式 canonical/hreflang。 | 选为 primary；升级为三候选的 Verified Comparison，继续 noindex 和 sitemap 排除。 |
| `/guides/ai-research-tools-comparison` | 原代码直接复用上一条完整页面，仅额外设置 noindex，没有独立事实、候选或任务角度。 | noindex；不在 sitemap；Guide 注册表中重复列项，未见主要入口。 | 同一搜索意图的别名：GET/HEAD 308 至对应语言的 primary，移除重复 Guide 列项。 |

primary 由真实内链、既有页面复用关系、正文意图和索引位置共同决定，不由 slug 命名决定。指南回答“研究工作怎么选”，比较页回答“Perplexity、Consensus、Scite 之间的任务差异”；二者互相链接而不互相重定向。永久重定向仅用于内容完全相同的比较别名。英文目标无 `/en` 前缀；`cn/tw` 保留原语言前缀，query 保留。Guide 的 en/cn canonical、hreflang 和 sitemap 均不改；comparison 保持 `noindex, follow`，无新增 sitemap 资格。

## 内容与证据边界

新比较只分开放网页发现（Perplexity）、已收录学术论文发现（Consensus）、论文引用语境检查（Scite）。每个候选有 Best for、Not ideal、限制、决策卡入口；矩阵按资料起点和核对方式给出 trade-off；Evidence 区块给出一手来源与真实核验日期。来源复用 [CL-02 研究编辑包](./DECISION_GRAPH_CL02_RESEARCH_EDITORIAL_PACKET_2026-09-25_CN.md)、[Perplexity Stage 2 审计](./PERPLEXITY_STAGE2_OFFICIAL_FACT_AUDIT_2026-10-03_CN.md)、[Scite 发布核验](./SCITE_CONTROLLED_RELEASE_CANDIDATE_2026-10-10_CN.md)。未把尚未发布的 Capability/Task Fit 候选当作已发布关系；共用读模型只在真实 published/current 关系可用时补充能力矩阵。没有价格、额度、准确率或完整覆盖率承诺。

共用 Verified Comparison 的原 Web3 硬编码标题、错误的“两款”移动端提示和空 FAQ 区块已改为通用文案；空 FAQ 不生成 FAQ schema，ItemList 工具链接与可见面包屑/JSON-LD 均使用同一语言路径规则。比较页仍依现有设计系统以可横向滚动表格呈现矩阵。

## 验证、风险与回滚

变更集：primary 页面、研究 comparison 证据配置、middleware 精确别名规则、重复 Guide 注册项、共用 comparison 的路径/面包屑与通用标签、专项测试、本文和主追踪。两处用户自有 SQL 修改完全排除。

专项测试覆盖三语别名 308/query、primary/guide/index 白名单、候选和证据完整性、breadcrumb canonical helper、页面 noindex 契约与内部文案。`test-research-comparison-consolidation`、`test:public-content-boundary`、`test:seo-architecture`、`test:localized-metadata`、`test:guide-link-boundaries`、`test:notebooklm-pages`、`tsc --noEmit`、`git diff --check` 均 PASS；一次完整 `pnpm run build` PASS。NotebookLM 旧测试曾要求 primary 空壳直接提及它；新比较仅列证据完整的三个候选，该测试已保留对 NotebookLM 实际指南数据入口的检查。

本地 build 后实际响应：EN/CN/TW primary 均 `200 + noindex, follow`，渲染 verified 比较和三候选；同语别名均 308，query 保留；EN/CN 指南 200、自指 canonical、仅 en/zh-CN/x-default hreflang。比较页原本无显式 canonical/hreflang，现保持不变；未将 noindex 页纳入 sitemap。此后仅作 lint 规范化和 FAQ/ItemList 语言路径修正，专项测试与 TypeScript 再次通过；遵循本单元“一次完整 build”约束，没有重复 build。线上只读基线在 TLS 握手阶段超时，因此本交付不把线上状态称为已确认；部署后应由总控按独立 QA 结果核对真实 head、redirect、页面、sitemap 和 hreflang。

回滚：撤销本单元提交即可恢复两个 comparison 原页面及注册表；若上线后发现某候选事实不再成立，先将 primary 恢复为 noindex 的 fail-closed unavailable 内容，再修订证据；若别名 308 与真实独立意图冲突，移除 middleware 精确规则并重新审计，不能把它指向研究指南。
