# CL-02 · `research-with-citations` Task Page 编辑预检

状态：**HOLD**。本交付增加发布前只读预检，不批准 Task Page，不改变任何关系、工具目录或索引状态。

## 门槛

`pnpm run decision:task-page-editorial-preflight` 从现有 Decision/evidence 表读取状态并输出 JSON。预检要求 Task 仍为既有 active 行；两条既有 Task Capability（`research-discovery`、`citation-traceability`）均为 `published`、review window current，且定义 active。Importance 必须同时满足现有公开读模型的 required 与 preferred 最低组合；其它 importance 需要 Task owner 明确复核。三个既有工具各自恰有一条本 Task Fit，状态 `published` 且 current，Fit 级别可用于推荐，并至少有一条同工具 profile 下 `verified`、`source_type=official`、无冲突、未失效、review window/expiry current 的已链接 claim。`source_type` 取自现有 `product_intelligence_claims` schema；`independent`、`owner`、`user`、`editorial` 均不能满足官方证据门槛。三个 Fit rationale 还须在中英文明确表达各自来源角色：

| 工具 | 必须表达的角色边界 |
| --- | --- |
| Consensus | 学术论文发现与证据摘要 |
| Gemini Notebook（既有 `notebooklm` 工具 ID） | 综合用户选择/提供的 notebook 资料 |
| Perplexity | 开放网页检索与引用回答 |

角色词检查只是一道最低限度的机器门槛；不替代编辑对官方证据、表达准确性和内容质量的独立 QA。预检不会生成或发布关系，也不会写数据库。状态不满足时返回 `HOLD`、具体 blocker code/detail 和下一步；状态满足时最多表示可进入独立 QA，不代表页面批准。

## 当前结论与下一步

2026-10-04T12:28:15.024Z 通过 `pub-03-readonly-run.mjs` 对当前生产状态做只读预检：Task Capabilities 当前已发布且有效；Consensus Fit `published`，Gemini Notebook 与 Perplexity Fit `reviewed`。三工具合格 Fit **1/3**，结果 **HOLD**。实际 blockers：`TASK_PREFERRED_CAPABILITY_MISSING`（两条现有 Task Capability 均为 required）；Gemini Notebook `FIT_NOT_PUBLISHED`、`ROLE_RATIONALE_NOT_DISTINCT`（当前双语理由未明确用户选择资料集这一边界）；Perplexity `FIT_NOT_PUBLISHED`。两项 reviewed Fit 均不计入门槛。官方证据校验从 claim 的现有 `source_type` 字段读取，非 official claim 不可计入；此次 live 输出未暴露证据原文、密钥，也未改变 1/3 结论。

下一步：Task owner 先判断是否应把两条既有 Task Capability 中的一条设为 preferred（不得为解锁页面擅改）；编辑修订 Gemini Notebook 现有 Fit 的双语 rationale，明确“用户选定 notebook 资料综合”，再由独立内容 QA 审核；管理员分别按现有关系审批流程完成 Gemini Notebook、Perplexity Fit QA 和受控发布。随后重新运行只读预检，再交 Task Page 独立 QA。任何缺失、过期或 owner 不匹配继续 HOLD。不得为门槛补造关系。

live 预检只执行数据库读取，在 Supabase 与 Neon 只读包装器下完成；没有写入或输出敏感字段或证据摘录。专项测试另以 Task Capability `published/current + required/required`、Fit `published / reviewed / reviewed` 复现上述 HOLD，并覆盖 `source_type=official` 可通过、`independent` 被拒、same-owner/current evidence、营销文案拒绝与页面未获批断言。

## 保护边界

- `research-with-citations` 未加入 `APPROVED_TASK_PAGE_SLUGS`；公开页面继续 404/noindex，sitemap excluded。
- 未改 `continue_index`、工具索引、metadata、sitemap、工具内容或关系状态；无生产写入、push 或 deploy。
- 预检读失败会以错误退出，不会把数据缺失当作 PASS。
