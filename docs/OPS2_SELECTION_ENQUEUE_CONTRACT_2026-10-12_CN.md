# OPS2 通用成熟候选入队契约

## 边界

- 控制器通过标准输入发送一个临时结构化选择包，运行 `pnpm run ops2:enqueue --mode=preflight`。`pnpm run` 后不得再插入额外的 `--`，否则参数会被错误透传。不维护每个工具的 JSON、guard、test 或运行时代码。
- 选择包必须包含稳定 UUID、官方 HTTPS canonical、名称、Cluster 角色、现有 Category、两个带 ID 且覆盖不同事实的官方 URL、三语言编辑内容和决策字段。普通 Catalog 可省略 `cluster.taskSlug`：只查工具实体身份、名称、标题、canonical/URL 的全局冲突，不读取 Task Fits，也不创建 Task/Capability/Fit 关系；此时 `duplicateIntent.checkedToolIds` 必须为空。有明确 Task 的旧路径必须提供活跃 `taskSlug`，`checkedToolIds` 与该 Task 下状态为 `reviewed` 或 `published` 的 Fit 工具 ID 去重排序后精确一致，数据库真实为空才允许 `[]`。`entityGate` 要逐项 PASS AI 核心能力、身份/canonical、重复意图；`claimGate` 每项要有状态、sourceIds、边界和复核日。
- 新选择包的 `localized` 固定为 `en/cn/tw`，`cn` 是简体、`tw` 是繁体；缺少 `tw` 必须拒绝。历史 `en/zh/cn` 选择包仅作输入兼容，显式以旧 `zh` 作为 `tw` 来源，不改历史存储行，也不允许与新 `tw` 混用。新导入工具字段写入 `en/cn/tw`，运行时 `zh` 仅复制 `cn` 作为简体兼容别名，不能承载繁体。
- 默认官方来源仍只能位于 canonical 产品域及其子域。产品由独立父品牌域持有时，可声明 `officialDomainGroup`：`canonicalProductDomain` 必须与 `officialUrl` 一致，`parentBrandDomains` 去重且不能重复 canonical，所有 source URL 必须属于组内域。`identitySourceIds` 必须指向实际参与 identity gate 的官方来源；声明父品牌域时，至少一条父品牌域来源同时标记 `identity` 与 `brand_relationship`，明确证明产品归属。不能把合作方、登录域、CDN 或任意 alias 加入组内绕过来源限制。
- 媒体分两种模式。`official_licensed` 继续要求官方素材、官方授权来源、PASS 状态和授权摘录。`platform_owned_editorial` 只允许 AI Best Tool 编辑团队自行制作的中性素材，必须记录 `/images/tool-media/` 下的 `assetPath`、文件 `sha256`、`creator=AI Best Tool editorial`、`createdAt` 和 `noVendorMarks=true`；不得包含厂商 Logo、截图、商标视觉、外链图片或脚本，也不要求厂商授权来源。工具专属中性素材属于内容资产，不得演变为工具专属发布器、guard 或测试流程。
- 账号权益只有存在账户级证据引用时才可标记 `verified_account`。冲突、未知、过期 Claim 不得被写成精确已验证断言；最终公开的独立 QA 必须核对三语言正文是否遵守边界。
- 入队不是导入、公开、索引或 Task Page 发布。旧 Product Hunt 候选不会被自动选中或覆盖。入队后的 `candidate -> draft -> monitor` 仍用既有 `ops2:publish-bridge`。
- 完整选择包、内部来源关系、Claim 审计和授权只保存在后台候选 `raw_payload`；工具草稿只映射现有公开 Tool Intelligence 所需内容。`tool.features` 不保存 `ops2Selection`。入队 QA PASS 不等于市场验证 PASS；现有 `marketValidation` 发布谓词不放宽，未完成通用审核的候选继续保持 draft。

## 执行门禁

1. `preflight` 只读：核对选择包、官方域关系、Category 和工具名称/标题/canonical 全局查重，返回 `preimageHash`。仅带 `taskSlug` 的选择包再核对活跃 Task 和该 Task 的 reviewed/published Fit 全集；Task 缺失、Fit 查询失败或关系集合不一致时 fail closed。普通 Catalog 不依赖 Task/ Fit 查询。平台自有媒体还会读取 `public` 下的实际文件并核对 SHA-256；自有 SVG 必须自包含且不得嵌入脚本、图片或外部引用。素材缺失或哈希漂移时 fail closed。
2. `rollback`：设置 `OPS2_REVIEWER_ID` 和 `--expected-hash` 后在同一事务尝试入队并回滚，结果必须为 `productionWrites: 0`。
3. `commit` 必须显式携带 `--expected-hash=<preimageHash>`，有两种互斥授权。既有独立 QA 模式完全保留：`OPS2_QA_REPORT`（JSON：`status=PASS`、`selectionHash`、owner `reviewer`、独立 `qaActor`、对应 `qaThread`、`checkedAt`、精确 `scope`）、`OPS2_QA_REFERENCE=<qaActor>`、`OPS2_ROLLBACK_HASH=<preimageHash>`、`OPS2_PUBLISH_AUTHORIZATION=enqueue:<candidateId>:<selectionHash>:<reviewer>:<qaActor>:<qaReportHash>`。另一种仅用于内部准备：真实管理员 `OPS2_REVIEWER_ID`、匹配的 `OPS2_ROLLBACK_HASH`，以及 `OPS2_INTERNAL_PREPARATION_AUTHORIZATION=enqueue:<candidateId>:<selectionHash>:<preimageHash>:<reviewerUUID>:<新随机UUID nonce>`。内部 token 精确绑定对象、选择包、前像和 reviewer；nonce 在候选审计中留哈希/标识，不可用于别的对象或阶段，已使用 nonce 不得再次产生写入。同一已应用对象用原 token 幂等重放只允许零写。内部模式不得同时提供 QA 报告、QA reference 或公开授权，审计记录 `reviewMode=internal_preparation`，不伪造 QA。
4. `commit` 返回 `postimageHash`。`postcheck` 必须同时传 `--expected-hash` 和 `--expected-post-hash`，确定性核对状态、标题、摘要、URL、canonical、评分、工具关联、完整候选负载与对应审计；旧 QA 审计仍按原契约读取，不迁移。重放必须保持原审核模式且零写入。内部准备只写候选，绝不批准 draft、公开或索引。

普通工具的 enqueue 与下一步 draft 是同一交付单元的内部阶段，不要求阶段 SHA、阶段 QA 或阶段用户回传；一个日报和一个最终公开审计汇总即可。最终 `published + monitor/noindex` 仍须独立 QA。

生产迁移 `20261012_research_relation_purpose_array_type.sql` 仅把 reviewed-group RPC 的两个 `varchar[]` 证据列表显式转为 `text[]`。先在独立数据库做两次应用、回滚、权限和发布测试；生产只执行一次经过审批的迁移。回滚文件仅在确认需要撤回且函数仍是精确 postimage 时使用。迁移不发布关系，也不改变 Task Page、index 或 sitemap。
