# Research Decision Cluster MVP (2026-10-12)

状态：本地开发完成，等待独立 QA；未提交、推送或部署。

## 生产只读基线

2026-10-12T04:59:44Z 通过 `pub-03-readonly-run.mjs` 执行 `preflight-cl02-reviewed-relations.ts`，返回 `productionWrites=0`。`research-with-citations` Task Page 返回 404，未进 sitemap；Gemini Notebook 与 Perplexity 工具页仍是 `monitor/noindex`。两者的 profile 为 ready，Decision、Tool Capability 和 Fit 均为 reviewed，关系证据的同 owner、数量与复查窗口检查通过，但 **不是 published**。此外，两个工具的部分 Capability `availability=unknown`，现行内容门禁返回 `readyForIndependentQa=false`。Consensus 有已发布 Fit；Scite 尚无本 Task 的已发布 Fit。不能据此开放 Task Page，也不能把 reviewed 候选当成公开能力关系。

同一只读包装器进一步按 slug 回读：`perplexity`、`consensus`、`scite`、`notebooklm` 四个固定 ID 均存在，且均为 `published`。这只确认工具实体可用于已有比较页，不代表四个工具都有已发布的 Decision Graph 关系。

## 本交付范围

- 保留可索引的现有研究指南为任务入口；只增加 Gemini Notebook 的“选定资料综合”任务角色与现有工具详情链接。
- 保留现有 `noindex` 比较页，不新增 URL。静态编辑比较覆盖 Perplexity 开放网页发现、Consensus 学术论文发现、Scite 引用语境核验、Gemini Notebook 选定资料综合。每个角色给出用途、限制、官方来源与核验日期。Google 的[产品说明](https://support.google.com/gemininotebook/answer/16164461?hl=en)和[来源导入规则](https://support.google.com/gemininotebook/answer/16215270?hl=en)于 2026-10-12 重新核对。资料发现不等于全网自动检索；带引用不等于准确率实测。
- 结构化 Capability 矩阵只展示至少两个候选均有已发布、当前、支持级别非 unknown 且可核验关系的同一维度。仅一个工具有数据时，显示证据覆盖不足的提示，不把其他工具的 Unknown 伪装成比较结论。静态角色比较与结构化关系保持明显区分。
- `research-with-citations` Task Page 继续关闭。未来只有三条真实 published Fit、当前同 owner 证据、现有页面读模型门禁和独立页面审批全部通过，才可另案开放为 `noindex`；本交付没有批准索引、sitemap、canonical 或关系写入。

## 后续真实缺口

1. Gemini Notebook 和 Perplexity 的 Tool Capability/Fit 需要独立 QA 解决 `availability=unknown` 与发布门禁，再决定是否发布关系；不能由页面代码补齐。
2. Scite 需要单独建立并审核本 Task 的真实 Fit 与证据。现有比较页的官方功能来源不是 Decision Graph Fit。
3. 三工具关系满足后，再只读核验 Task Page 的完整模型，单独审批 `noindex` 页面。不得因本次比较页更新自动改变索引或 sitemap。

## 开发验证与 QA 重点

- `test-research-comparison-consolidation.ts`：四工具契约、服务端渲染、Notebook 详情与官方来源链接、旧别名 308、索引边界通过。
- `test-structured-comparison.ts`：单边证据矩阵隐藏、unknown 不计入覆盖、双边证据矩阵显示通过。
- `test:decision-task-page`：Task Page fail-closed、noindex、sitemap 排除通过。
- TypeScript 与一次完整 `pnpm run build` 通过。末尾仅做测试和文案微调，专项测试与 TypeScript 已重跑；没有为无关差分重复 build。
- QA 应重点复核四个角色是否不越界、Notebook 官方来源是否仍直接支持具体措辞、四工具详情入口、单边证据矩阵隐藏、Task Page 继续关闭，以及两个用户已有 SQL 改动未被本单元触碰。
