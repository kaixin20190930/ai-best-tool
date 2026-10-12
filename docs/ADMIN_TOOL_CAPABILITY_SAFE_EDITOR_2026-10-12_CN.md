# Tool Capability 安全编辑交付记录（2026-10-12）

`/cn/admin/decision` 的 Tool capabilities 列表现在从管理员服务端概览显示工具名称（仅显示 Neon 目录实际匹配的已发布工
具）、Capability slug/name、supportLevel、availability、status、planRequirement、limitations、证据数、复核日期、更新时间
及三个 UUID。无法匹配的工具明确标为 `Unresolved tool`，不猜测名称。`availability=unknown` 高亮，便于逐项定位 Gemini
Notebook 和 Perplexity 的三条 reviewed 关系；本次没有修改这些生产值。

点击关系行的 **Edit** 会将完整已存字段回填至顶部表单，并固定现有 relation ID、tool ID 和 capability ID。保存时提交
relation ID 与页面读取的 `updated_at`；服务端若发现行已变化，会拒绝过期保存，管理员须刷新后重新审核。Create/Edit 模
式、Cancel edit、保存中和成功/失败消息可见。Published/stale 行在此表单只读，仍由既有受控流程处理。

审核三项 availability：在列表按工具名称与 Capability 确认目标，点击 Edit；逐项核对 support、当前 unknown、plan
JSON、limitations JSON、状态和证据数，再根据独立核验结论调整 availability。保存后刷新列表并核对 relation UUID、全部字段
与更新时间；如出现并发变更提示，刷新并重新审核完整前像。此 UI 不代替证据核验或发布审批。

范围仅限 Admin 读取、编辑表单与保存的并发保护；没有更改发布合约、证据状态、schema/RLS、生产数据、Task Page 或 SEO 文件。
