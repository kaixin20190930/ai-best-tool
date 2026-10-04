# CL-02 · `research-with-citations` Task Page 编辑预检

状态：**HOLD**。本交付增加发布前只读预检，不批准 Task Page，不改变任何关系、工具目录或索引状态。

## 门槛

`pnpm run decision:task-page-editorial-preflight` 从现有 Decision/evidence 表读取状态并输出 JSON。通用 Task Page read model 与本预检统一要求至少一条 `required` Task Capability；`preferred` 可为 0..n。所有参与展示的 `required`/`preferred` 关系仍须 `published`、review window current、关联 Capability active 且有英文理由。只有 preferred、contextual 替代 required、未发布或过期关系均不能通过。CL-02 的两条既有 Task Capability（`research-discovery`、`citation-traceability`）继续都是真实的 `required`，不因门槛而改写。三个既有工具各自恰有一条本 Task Fit，状态 `published` 且 current，Fit 级别可用于推荐，并至少有一条同工具 profile 下 `verified`、`source_type=official`、无冲突、未失效、review window/expiry current 的已链接 claim。`source_type` 取自现有 `product_intelligence_claims` schema；`independent`、`owner`、`user`、`editorial` 均不能满足官方证据门槛。三个 Fit rationale 还须在中英文明确表达各自来源角色：

| 工具 | 必须表达的角色边界 |
| --- | --- |
| Consensus | 学术论文发现与证据摘要 |
| Gemini Notebook（既有 `notebooklm` 工具 ID） | 综合用户选择/提供的 notebook 资料 |
| Perplexity | 开放网页检索与引用回答 |

角色词检查只是一道最低限度的机器门槛；不替代编辑对官方证据、表达准确性和内容质量的独立 QA。预检不会生成或发布关系，也不会写数据库。状态不满足时返回 `HOLD`、具体 blocker code/detail 和下一步；状态满足时最多表示可进入独立 QA，不代表页面批准。

## 当前结论与下一步

2026-10-04T12:28:15.024Z 的历史只读回读为 1/3、HOLD。`TASK_PREFERRED_CAPABILITY_MISSING` 已通过通用读模型语义修正移除，不要求把 required 改为 preferred。2026-10-04T14:47:29.385Z 后续生产只读 preflight 确认 Task Capabilities 仍 published/current、Consensus Fit published，Gemini/Perplexity Fit reviewed；公开 Task 仍 404 + noindex 且 sitemap excluded。Gemini rationale 与部分发布 purpose 仍是明确 blocker：Gemini citation-traceability Tool Capability 缺少 `plan` purpose，双语 Fit 理由仍未限定用户选择/提供并导入的 notebook 资料集。Perplexity 的逐项 purpose 与来源角色检查通过。完整 ID、`updated_at`、reviewer/期限前像及受控 Admin 操作见[CL-02 reviewed relation 发布候选审计](./CL02_REVIEWED_RELATION_RELEASE_CANDIDATE_2026-10-04_CN.md)。上述预检代码、迁移及按钮不写生产，不批准 Task Page。

下一步：在已部署 Admin 流程里补齐 Gemini citation-traceability 的 verified `plan` evidence link，并通过现有 Fit 编辑动作保存、重审双语 rationale；重新运行 relation preflight 生成新 `updated_at` manifest，全部门槛通过后交总控安排独立 QA。页面发布继续另行 HOLD。不得为门槛补造 claim 或关系。

live 预检只执行数据库读取，在 Supabase 与 Neon 只读包装器下完成；没有写入或输出敏感字段或证据摘录。专项测试另以 Task Capability `published/current + required/required`、Fit `published / reviewed / reviewed` 复现上述 HOLD，并覆盖 `source_type=official` 可通过、`independent` 被拒、same-owner/current evidence、营销文案拒绝与页面未获批断言。

2026-10-04 通用 Task Page 能力语义修正：read model 改为至少一条 required、preferred 可为空，同时对每条参与展示的 required/preferred 关系继续 fail-closed 校验 published/current/active/理由；预检不再把缺 preferred 报为 blocker。专项测试覆盖 all-required、required+preferred、only-preferred 拒绝，以及 unpublished/expired 拒绝。该修正不改生产关系、注册表、公开页面或索引状态，不代表页面批准；research-with-citations 仍由上述 1/3 与 Gemini rationale blocker 保持 HOLD。

## 保护边界

- `research-with-citations` 未加入 `APPROVED_TASK_PAGE_SLUGS`；公开页面继续 404/noindex，sitemap excluded。
- 未改 `continue_index`、工具索引、metadata、sitemap、工具内容或关系状态；无生产写入、push 或 deploy。
- 预检读失败会以错误退出，不会把数据缺失当作 PASS。
