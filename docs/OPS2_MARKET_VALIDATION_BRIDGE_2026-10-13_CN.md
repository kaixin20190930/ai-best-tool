# OPS2 Market Validation Bridge

范围：仅对已有 `draft` 工具补 `features.marketValidation`，不导入、不公开、不修改 index/sitemap。入队 QA 不能充当市场验证 QA。两个临时 pack 在 gitignored `.local/`，独立 QA 尚未签署，当前只可执行只读 preflight。

输入 JSON 至少包含 `toolId`、`developmentActor=codex-thread:<UUID>`、`verdict=validated`、`score`（75-100）、`reviewedAt`、`vendorDomains`、两个不同注册域且非厂商域的 HTTPS `evidenceUrls`、逐条 `sourceNotes`、`strongSignals`、`supportingSignals`、双语 `rationale.en/cn` 和 `qaReport`。评分为编辑判断，不等于平台评分或活跃用户数。`developmentActor` 进入 packHash；`qaReport` 必须由不同的独立 QA actor 对 packHash 和 toolId 出具 PASS，开发 actor 不得自我验收；保持 `null` 时不得 commit。

运行方式：`pnpm run ops2:market-validation --mode=preflight < .local/<pack>.json`。返回精确 `preimageHash` 和 `protectedHash`，零写。`rollback` 使用相同 pack、`--expected-hash=<preimageHash>` 与有效 owner reviewer，单事务更新后回滚，零持久写。`commit` 还要求 `OPS2_QA_REFERENCE=codex-thread:<QA UUID>`、pack 内有效 QA report、`OPS2_ROLLBACK_HASH=<preimageHash>` 和精确授权：

`OPS2_MARKET_AUTHORIZATION=market:<toolId>:<packHash>:<preimageHash>:<reviewerUUID>:<developmentActor>:<qaActor>:<qaReportHash>`

commit 只改 `features.marketValidation` 与 `updated_at`；其中逐条 `sourceNotes` 和 `developmentActor` 审计记录必须持久化。若已有市场验证，拒绝盲目覆盖。返回 `postimageHash` 后使用 `--mode=postcheck --expected-hash=<preimageHash> --expected-post-hash=<postimageHash>` 只读深比较 QA、全部市场字段（包括 sourceNotes）及所有非市场字段的 protectedHash。该流程不批准 published、monitor、index 或 sitemap；发布仍走既有独立门禁。

来源边界：Product Hunt 评论和 Reddit 讨论属于第三方用户信号，不是厂商事实来源。两者均有自选择偏差；争议内容只能支持限制说明，不应被当作定价、准确率或活跃用户总数。独立 QA 必须逐条打开并核验，若来源不可用或信号不支持评分，应 HOLD 而不是补造 PASS。
