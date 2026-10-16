# AI Best Tool 每日运营记录：2026-10-16

日期：2026-10-16（Asia/Shanghai）
状态：WellSaid 已经最终公开 QA 并受控发布；三项 freshness 已提交。通用内部准备流程简化已部署，公开发布仍经一次独立 QA。

## 四线账本

| 线 | 状态 | 本次实际结果 |
| --- | --- | --- |
| Catalog | completed | WellSaid Studio 唯一候选经通用桥入队、导入 draft，并在 `QA_PASS_TOOL_PUBLICATION` 后发布为 `published + monitor/noindex`。实际 Tool ID `749640cc-a293-488f-a55e-4d9ff0c3e441`；公开 commit 写入 1，postcheck 与幂等重放均零写。本线累计写入 5（入队 1、draft 导入 3、公开 1）。 |
| Freshness | completed | 全量只读 selector 原基线：95 total / 71 published / 22 due；分类 `schedule_sync=0 / claim_due=10 / entity_due=5 / manual_archive_review=7`。Murf、Pika、Synthesia 三项经独立 QA 后逐项提交，完整后像只读回验 PASS、幂等重放各 0 写；本线写入 3。 |
| Decision | not_due | 本周 2026-10-12 至 10-18 已有 2/2 个用户可见单元；本日不建页面或关系。 |
| Market | completed with limitation | 私有 GSC 只读快照相对标识 `.local/gsc/a2847bc96613/search-analytics-2026-10-13.json`，文件 SHA-256 `c290b9f76fac1ea0bbd1963300ce34e3d7850c11be48e10445f0b4be30d220bf`；`latestCompleteDate=2026-10-13`，7 天 3 clicks / 956 impressions，28 天 7 / 1,813。原始私有文件不提交。站内事件 unavailable，不把缺失记为零。 |

## Catalog：WellSaid

- 单一对象为 WellSaid Studio；API 只是单独核对权益的使用路径，不另建实体。`https://wellsaid.io/` 301 到 `https://www.wellsaid.io/`，选择包只使用后者。
- [官方首页](https://www.wellsaid.io/)与[AI 配音功能页](https://www.wellsaid.io/ai-voice-generator)支持脚本转语音、选音色、编辑和发音控制。[现行定价页](https://www.wellsaid.io/ai-voice-pricing)区分试用、付费下载分钟、商用范围和套餐权益。
- 试用不被描述为可商用；付费也不泛化成广播、API、多语言或任意账户的固定权益。本站没有登录、结账、音质测试或官方品牌素材授权，因此采用本站自制无商标声波图。原选择包 `freemium` 会显示为“Freemium”，可能误导为永久免费层；已修为 `paid`，正文及 `pricingSummary` 继续明确 free trial，最终公开 QA 已核对。
- [固定选择包](./DAILY_OPERATIONS_2026-10-16_WELLSAID_SELECTION.json) ID `dc5b66bb-e69b-472e-8566-3e4a6608ea04`，`selectionHash=45d43b43393ac22db235304800e0b3113354cd21bdf7bcb89612db033e0677cd`。独立 QA 对固定 SHA `910da846` 返回 `QA_PASS_CATALOG_ENQUEUE`；通用 enqueue commit 写入 1，postcheck 为候选 `new`、后像 `a227a988b11075ed08d6cff54c6e35ae5e40e2028f6b7164e6fb635051639b76`，相同授权重放 0 写。candidate→draft preflight 前像 `35edc23fd382c7fab12084d02db8222efa0c3cfd50600b850983fe4cfc34de2b`；rollback 拟 Tool ID `cff99f66-26bc-4030-9384-5e9277f1e705`、持续写入 0。只读回读确认唯一候选仍为 `new`、`tool_id=null`，拟 Tool ID 不存在。QA 未批准 draft commit 或公开。
- draft 唯一 HOLD 的补充审计：2026-10-16 02:10:36 UTC 重新运行通用 candidate→draft preflight，成功通过可导入检查，因此 `preflightReady=true`（桥输出没有字面 `ready` 字段）；候选前像 `35edc23fd382c7fab12084d02db8222efa0c3cfd50600b850983fe4cfc34de2b`、`productionWrites=0`。02:11:08 UTC 同一前像作为 rollback `--expected-hash` 被通用桥接受并完成事务回滚，故 rollback 候选前像与 preflight 完全一致；本次临时拟 Tool ID `e31e47dd-5b69-44c4-8491-d174c6f6c0ea`，`productionWrites=0`。后续只读回读：候选恰好 1 条，仍为 `new`、`tool_id=null`，该拟 Tool ID 不存在。两次 rollback 的临时 ID 不同，不应视为已固定的实际 Tool ID。未执行 draft commit、公开或索引变更。
- `QA_PASS_DRAFT_BATCH` 后再次确认候选前像 `35edc23fd382c7fab12084d02db8222efa0c3cfd50600b850983fe4cfc34de2b`，通用 candidate→draft commit 产生实际唯一 Tool ID `749640cc-a293-488f-a55e-4d9ff0c3e441`，状态 `draft`、本步写入 3。候选 postcheck 核对 imported 审计、Tool ID 与 draft 状态，写入 0；相同授权幂等重放返回 `alreadyApplied=true`、写入 0。原 rollback 中的两个拟 Tool ID 均只是临时事务产物，不是实际 ID。
- 实际 draft 的通用发布 preflight 返回 `ready=true`、`blockers=[]`、前像 `bb5ff050efe8a4dc351b105c36eab2673b503d6bfaa04a2c096d515c3c88fcd1`、写入 0；同一前像 rollback 拟状态 `published+monitor`、持续写入 0。当时只读回读为 `draft + monitor`、`pricing=paid`、规范官方 URL `https://www.wellsaid.io/`、EN/简中/繁中字段齐全、候选保留 3 条官方来源和平台自制素材证据。本地 SVG SHA-256 `95bf4058e049c2d0b10e087de8d2ad8c9edf6aaf36be5efaf41cbabe1d1d020a` 与选择包一致；此阶段尚未公开。
- **最终收口**：自有媒体部署后生产 URL `/images/tool-media/wellsaid-editorial-cover.svg` 返回 200。独立 QA `codex-thread:01a14238-aa99-7363-8766-bf1d13766c8a` 返回 `QA_PASS_TOOL_PUBLICATION`。通用 tool preflight 再次确认前像 `bb5ff050efe8a4dc351b105c36eab2673b503d6bfaa04a2c096d515c3c88fcd1`、`ready=true`、`blockers=[]`；同一前像按原 rollback/QA reference 执行唯一公开 commit，写入 1。postcheck 零写，同授权幂等重放 `alreadyApplied=true`、零写。EN/CN/TW 真实详情页均返回 200、自指 canonical、`noindex, follow`；媒体 200，sitemap 126 URL 且 WellSaid 0 条。未批准 index/sitemap/关系。

## Freshness：三项公开 Claim

[固定差分包](./FRESHNESS_CLAIM_DUE_BATCH_2026-10-16.json)记录三项官方来源、前像、拟变更与回滚边界：

- Murf：官方 Studio 定价和商用说明继续支持“免费试用不含下载/商用，付费商业旁白不自动覆盖 TV/广播”的现有保守文案。当前套餐选择、账户结账和广播加购保持条件性；不重复核隐私或旧实体门禁。
- Pika：当前[价格页](https://pika.art/pricing)区分 Free/Starter 与 Creator/Fancy 的商用许可，并把加购 credits 限于 Pika Create，不可泛化到 API/MCP/iOS/旧站。EN/ZH/CN 精确替换及日期差分已提交，`detail` 后像为 `7fc90c55f936b9f8552e66f053b725d56816818ceb372ee332bcb59790108c1a`。
- Synthesia：[现行价格页](https://www.synthesia.io/pricing)仍显示月付 Basic 免费、Starter $29/1,250 credits、Pro $89/6,000 credits；[10 月方案变更说明](https://help.synthesia.io/en/articles/17217419-what-s-changing-in-synthesia-plans-on-october-1-2026)明确 Creator 改名 Pro。现有月付数字未发现需修改的差异；只拟更新证据日期，不扩展账户 API 或授权断言。

三项生产全行前像与明细哈希匹配。独立 QA 对固定 SHA `910da846` 批准精确提交；Murf、Pika、Synthesia 各自事务内验证完整 `detail`、`features.maintenanceReview`、适用的 `pricingSnapshot.checkedAt`、`next_review_date` 和非写集受保护字段，随后各提交 1 行。提交后的独立只读回验 3/3 PASS，已应用重放判断均为 0 写；完整后像哈希见[固定差分包](./FRESHNESS_CLAIM_DUE_BATCH_2026-10-16.json)。首次尝试因连接配置和 JSON 键序比较失败，均未写入；修正后才执行成功。

## 安全与偏差

- 生产写入总数：**8**（WellSaid 候选入队 1、draft 导入 3、公开 1、Freshness 3）。新增公开工具：**1**，即 WellSaid；不把候选或 draft 算作收录。
- 生产只读回读：**96 total / 72 published / 17 continue_index / 77 monitor**；sitemap **126 URL**，WellSaid 0 条。`continue_index` 为独立索引状态，不等于已被 Google 收录数。
- `PLAN_DEVIATION`：原媒体 404 导致公开推迟；自有素材上线为 200 且最终独立 QA 通过后，本日已完成发布。Freshness 三项结清；Decision 不到期；Market 有 GSC，但站内事件不可用。
- 未增加工具专属 runtime/release 脚本；未改 index、sitemap、关系、schema/RLS、付费或账户登录。两份受保护 SQL 和 10-15 未跟踪 freshness 文件不在本单写集。

下一步：总控按现有四线账本选择下一个完整交付单元；WellSaid 仅按既定 Claim 复核日期维护，index/sitemap 仍需单独授权。无需 Owner 操作。
