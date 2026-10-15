# CATALOG-NEW-TOOLS-BATCH-2026-10-15 交付审计

本文件只记录同一个五工具端到端单元。权威逐项 selection、来源、Claim、媒体哈希及前后像见 `CATALOG_NEW_TOOLS_BATCH_2026-10-15.json`。不创建工具专属发布器，不批准 index/sitemap。

## 2026-10-15 生产状态

原独立 QA `codex-thread:01a13e77-0a6f-7c22-8488-ac53f599c50b` 对固定 SHA `df7c78c79312aa1fa018214d2d74a0b6ead6cea1` 返回 `QA_PASS_ENQUEUE_BATCH`，明确只批准五项 enqueue commit。以每项精确 selection/preimage、独立 QA actor、管理员 reviewer 和 rollback hash 执行通用 `ops2:enqueue`，五项各首次写入一条 `new` 候选；各自 postcheck 匹配完整后像，重放 commit 均为零写。

| 工具 | Candidate ID | Enqueue | Draft | 发布 |
| --- | --- | --- | --- | --- |
| Everygen | `ca68f6e6-1eea-43d7-8a23-21769b9fb3ac` | `new`，postcheck/replay PASS | 待独立 draft QA | 未执行 |
| Meta Muse Wonder | `638f9de2-0c60-424c-a58d-9e435a262da5` | `new`，postcheck/replay PASS | 待独立 draft QA | 未执行 |
| ArtCraft | `4ec268e5-74ba-4dc2-8d08-f3592eb95178` | `new`，postcheck/replay PASS | 待独立 draft QA | 未执行 |
| Melty | `a11602ea-b9fa-4960-bc87-ce3a9f2d80d9` | `new`，postcheck/replay PASS | 待独立 draft QA | 未执行 |
| Cloudflare Clef | `f949c9c1-c900-4aff-a796-347ca01ad7da` | `new`，postcheck/replay PASS | 待独立 draft QA | 未执行 |

生产只读事务逐项确认：每个 ID/官方 URL 仅有一条候选；存储的完整 selection 与已验收包相同，包含 `en/cn/tw`、自有媒体、Cluster 和逐 Claim 边界；当前同名/同 URL 工具实体为零。五项通用 `candidate` 桥 preflight 与事务 rollback 均 PASS，回滚后零持久写。具体 preimage、拟生成 Tool ID 和 enqueue postimage 记录在批次 JSON，不将 rollback 预览 ID 冒充已创建实体。

## 后续门禁

`QA_PASS_ENQUEUE_BATCH` 不包含 draft 导入。`ops2:publish-bridge --kind=candidate` 的 commit 需要自己的精确授权和独立 QA 引用；不得复用入队 QA 作为 draft 批准。原 QA 对本批五项的 draft preflight/rollback 做一次差分确认后，才能逐项执行通用 draft commit/postcheck。随后才能对实际 draft Tool ID 生成通用 `tool` 发布 change set，检查三语、self-canonical、noindex、素材、身份/意图和 sitemap 排除，执行 preflight/rollback 并交原 QA 做发布前增量验收。公开发布 commit、push、index/sitemap 均未授权也未执行。

两份受保护 SQL 与未跟踪 Freshness 文件均排除在本单元提交之外。
