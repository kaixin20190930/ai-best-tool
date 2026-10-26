# CATALOG-WELLSAID-2026-10-26 固定审计

日期：2026-10-26（Asia/Shanghai）  
范围：完成 WellSaid Studio 的只读实体核对、当前官方证据、完整 EN/CN/TW 编辑输入、Cluster 角色、比较上下文、自有素材和通用 OPS2 selection。selection 是既有已发布 Tool 的维护快照，不创建第二个 WellSaid/API 实体。

## 结论与边界

- WellSaid Studio 已于 2026-10-16 通过通用流程公开为 `published + monitor/noindex`，Tool ID `749640cc-a293-488f-a55e-4d9ff0c3e441`。因此本单只补齐当前 Claim/编辑证据；不重复 enqueue、draft 或 publish，不改状态、canonical、索引或 sitemap。
- 10-25 官方 API PASS 复用：API 是 WellSaid 同品牌开发接口；试用 Key 为 14 天/最多 50 次请求；公开默认限制为 3 req/s、1,000 字符/请求；正式 API 方案按需定制。来源未变化；本轮再次打开官方说明确认链接可读，未实测账户或调用 API。
- 10-26 Studio 页面读到 Free、Starter、Pro、Business、Enterprise 档位，以及月付/年付和成品下载分钟的不同计量。金额只作为日期化公开页面快照，标为 conditional，不代表账户结账或可用额度。API 生产价格/额度保持 unknown。语言信息在首页与套餐 FAQ 间存在范围差异，Claim 标为 conflict 并限定为按套餐和具体声音核实。
- 身份/核心能力通过官方主页、产品页、API 文档和法律页确立。隐私政策最后更新 2024-07-19；文案明确区分其目的/法律需要保留原则与 FAQ 对取消后项目最长五年存储的描述，不声称通用删除期限。素材与使用权不把付费输出许可延伸到用户输入素材或真实人物声音仿制。
- Cluster：`ai-voiceover` 的 `gap_filler`，区别是脚本审核、发音一致性及团队修订，而非增加泛音色数量。比较对象至少为 ElevenLabs（Anchor）与 Murf（Alternative），比较同一已审核脚本的修正成本、成品下载分钟/成本、API/套餐范围、协作和导出权利。
- 下游消费位置为现有 WellSaid Tool Intelligence 条目；`ai-voiceover` 是规划中的决策集群消费位置。既有检查记录该 Task 页面为 404、没有 Tool Fit；本单不创建 Task、Capability、Fit 或关系，也不声称已公开页面消费。
- 已复用平台自有素材 `/images/tool-media/wellsaid-editorial-cover.svg`，SHA-256 `95bf4058e049c2d0b10e087de8d2ad8c9edf6aaf36be5efaf41cbabe1d1d020a`。非供应商 UI/Logo/截图，无第三方素材许可依赖。

## 生产查重状态

只读范围固定为精确 WellSaid Tool ID、规范 URL/hostname 与名称别名，以及 `collection_candidates` 中同身份候选。结果为一个既有 `published + monitor` Tool（`749640cc-a293-488f-a55e-4d9ff0c3e441`），以及一个状态为 `imported` 且 `tool_id` 正确指向该 Tool 的历史候选（`dc5b66bb-e69b-472e-8566-3e4a6608ea04`）；没有额外匹配实体。此为预期既有实体，不是新重复项。OPS2 enqueue preflight 不适用于本次：它会将预期存在的已发布同名 Tool 判为重复，并且此单没有 enqueue 操作。只读查询未写生产，`productionWrites=0`。

此前执行记录已将 `/cn/tasks/ai-voiceover` 记为 404 且没有 Task Fit；生产查询环境的 `decision_tasks` relation 不存在，故本轮不宣称 Task 活跃或生产 Fit 清单已核验。按 Catalog-only selection 保留 `gap_filler` 角色，不绑定任务、不创建关系。任何非预期第二实体、身份/canonical 冲突或真实法律/素材风险均为实体硬 HOLD；本轮没有发现这些硬阻塞。

## 不变量与交付文件

- 权威固定 selection：[`CATALOG_WELLSAID_2026-10-26_SELECTION.json`](./CATALOG_WELLSAID_2026-10-26_SELECTION.json)。包括完整三语言编辑输入、来源/Claim 状态、素材哈希、Cluster/比较对象与消费位置。
- 历史成熟候选 overlay 曾陈旧地将 WellSaid 留在未发布队列。返工仅在共享 overlay 的 `released` 中登记 `wellsaid`，证据指向 2026-10-16 的实际发布记录；未改历史 snapshot、selector/runtime 或候选 selection。通用 selector 回读已确认 WellSaid 从未发布队列移除，其余候选及顺序不变。
- 本单不创建 QA（按 Owner 明确禁止），不提交、不部署、不写生产；不改两个受保护 SQL 或 `docs/FRESHNESS_CLAIM_DUE_BATCH_2026-10-15.json`。不跑 TypeScript、build、smoke 或专属测试；仅做研究、结构、来源、素材和重复意图审计。
- 公开状态继续使用历史已验收的 `published + monitor/noindex`。未知/条件账户 Claim 仅限制精确表述；不构成实体级 HOLD。没有 index/sitemap 或关系批准。

OPS2 通用 parser 接受固定选择，EN/CN/TW 均齐全，15 项 Claim 均有可回溯来源；通用素材校验确认 SVG SHA-256 与选择包一致。`selectionHash=856b2b91e1502d0c7b6d3d878a122d51008c4862289d27d3d585a63cf30d08df`。`git diff --check` 通过。按 R 级边界未运行 TypeScript/build/smoke 或专属测试。
