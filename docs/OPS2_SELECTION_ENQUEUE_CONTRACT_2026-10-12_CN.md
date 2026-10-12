# OPS2 通用成熟候选入队契约

## 边界

- 控制器通过标准输入发送一个临时结构化选择包，运行 `pnpm ops2:enqueue -- --mode=preflight`。不维护每个工具的 JSON、guard、test 或运行时代码。
- 选择包必须包含稳定 UUID、官方 HTTPS canonical、名称、现有活跃 Task cluster 与角色、现有 Category、两个带 ID 且覆盖不同事实的官方 URL、三语言编辑内容和决策字段。`entityGate` 要逐项 PASS AI 核心能力、身份/canonical、重复意图；重复意图的 `checkedToolIds` 必须与目标 Task 下状态为 `reviewed` 或 `published` 的 Fit 工具 ID 去重排序后精确一致，数据库真实为空才允许 `[]`。`claimGate` 每项要有状态、sourceIds、边界和复核日。
- 默认官方来源仍只能位于 canonical 产品域及其子域。产品由独立父品牌域持有时，可声明 `officialDomainGroup`：`canonicalProductDomain` 必须与 `officialUrl` 一致，`parentBrandDomains` 去重且不能重复 canonical，所有 source URL 必须属于组内域。`identitySourceIds` 必须指向实际参与 identity gate 的官方来源；声明父品牌域时，至少一条父品牌域来源同时标记 `identity` 与 `brand_relationship`，明确证明产品归属。不能把合作方、登录域、CDN 或任意 alias 加入组内绕过来源限制。
- 媒体分两种模式。`official_licensed` 继续要求官方素材、官方授权来源、PASS 状态和授权摘录。`platform_owned_editorial` 只允许 AI Best Tool 编辑团队自行制作的中性素材，必须记录 `/images/tool-media/` 下的 `assetPath`、文件 `sha256`、`creator=AI Best Tool editorial`、`createdAt` 和 `noVendorMarks=true`；不得包含厂商 Logo、截图、商标视觉、外链图片或脚本，也不要求厂商授权来源。工具专属中性素材属于内容资产，不得演变为工具专属发布器、guard 或测试流程。
- 账号权益只有存在账户级证据引用时才可标记 `verified_account`。冲突、未知、过期 Claim 不得被写成精确已验证断言；独立 QA 必须核对三语言正文是否遵守边界。
- 入队不是导入、公开、索引或 Task Page 发布。旧 Product Hunt 候选不会被自动选中或覆盖。入队后的 `candidate -> draft -> monitor` 仍用既有 `ops2:publish-bridge`。
- 完整选择包、内部来源关系、Claim 审计和授权只保存在后台候选 `raw_payload`；工具草稿只映射现有公开 Tool Intelligence 所需内容。`tool.features` 不保存 `ops2Selection`。入队 QA PASS 不等于市场验证 PASS；现有 `marketValidation` 发布谓词不放宽，未完成通用审核的候选继续保持 draft。

## 执行门禁

1. `preflight` 只读：核对选择包、官方域关系、Category、活跃 Task、该 Task 的 reviewed/published Fit 工具全集，以及工具名称/标题/canonical 查重，返回 `preimageHash`。平台自有媒体还会读取 `public` 下的实际文件并核对 SHA-256；自有 SVG 必须自包含且不得嵌入脚本、图片或外部引用。Task 缺失、Fit 查询失败、关系集合不一致、素材缺失或哈希漂移时 fail closed。
2. `rollback`：设置 `OPS2_REVIEWER_ID` 和 `--expected-hash` 后在同一事务尝试入队并回滚，结果必须为 `productionWrites: 0`。
3. `commit`：另需 `OPS2_QA_REPORT`（JSON：`status=PASS`、`selectionHash`、owner `reviewer`、独立 `qaActor`、对应 `qaThread`、`checkedAt`、精确 `scope`）、`OPS2_QA_REFERENCE=<qaActor>`、`OPS2_ROLLBACK_HASH=<preimageHash>`、`OPS2_PUBLISH_AUTHORIZATION=enqueue:<candidateId>:<selectionHash>:<reviewer>:<qaActor>:<qaReportHash>`。`qaActor` 使用 QA 对话 UUID 或 `codex-thread:<UUID>`，不得与 owner reviewer 对应同一 UUID，也不要求 QA actor 是生产 Admin。QA 报告必须在 72 小时内、范围和审核人一致；审计只保存报告 hash，不复制报告到公开工具。
4. `commit` 返回 `postimageHash`。`postcheck` 必须同时传 `--expected-hash` 和 `--expected-post-hash`，确定性核对状态、标题、摘要、URL、canonical、评分、工具关联、完整候选负载与审计 hash；任一漂移拒绝。相同授权重放零写入。

生产迁移 `20261012_research_relation_purpose_array_type.sql` 仅把 reviewed-group RPC 的两个 `varchar[]` 证据列表显式转为 `text[]`。先在独立数据库做两次应用、回滚、权限和发布测试；生产只执行一次经过审批的迁移。回滚文件仅在确认需要撤回且函数仍是精确 postimage 时使用。迁移不发布关系，也不改变 Task Page、index 或 sitemap。
