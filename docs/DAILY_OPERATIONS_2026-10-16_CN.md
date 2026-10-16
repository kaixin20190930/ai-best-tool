# AI Best Tool 每日运营记录：2026-10-16

日期：2026-10-16（Asia/Shanghai）
状态：独立 QA 已通过限定范围；WellSaid 仅入队，三项 freshness 已提交；未发布新工具，未 push。

## 四线账本

| 线 | 状态 | 本次实际结果 |
| --- | --- | --- |
| Catalog | partial | 成熟队列没有现成 READY；WellSaid Studio 经独立 QA 批准后以通用路径入队，唯一候选保持 `new`。candidate→draft preflight/rollback 通过，未导入 draft、未公开；本线写入 1。 |
| Freshness | completed | 全量只读 selector 原基线：95 total / 71 published / 22 due；分类 `schedule_sync=0 / claim_due=10 / entity_due=5 / manual_archive_review=7`。Murf、Pika、Synthesia 三项经独立 QA 后逐项提交，完整后像只读回验 PASS、幂等重放各 0 写；本线写入 3。 |
| Decision | not_due | 本周 2026-10-12 至 10-18 已有 2/2 个用户可见单元；本日不建页面或关系。 |
| Market | completed with limitation | 私有 GSC 只读快照相对标识 `.local/gsc/a2847bc96613/search-analytics-2026-10-13.json`，文件 SHA-256 `c290b9f76fac1ea0bbd1963300ce34e3d7850c11be48e10445f0b4be30d220bf`；`latestCompleteDate=2026-10-13`，7 天 3 clicks / 956 impressions，28 天 7 / 1,813。原始私有文件不提交。站内事件 unavailable，不把缺失记为零。 |

## Catalog：WellSaid

- 单一对象为 WellSaid Studio；API 只是单独核对权益的使用路径，不另建实体。`https://wellsaid.io/` 301 到 `https://www.wellsaid.io/`，选择包只使用后者。
- [官方首页](https://www.wellsaid.io/)与[AI 配音功能页](https://www.wellsaid.io/ai-voice-generator)支持脚本转语音、选音色、编辑和发音控制。[现行定价页](https://www.wellsaid.io/ai-voice-pricing)区分试用、付费下载分钟、商用范围和套餐权益。
- 试用不被描述为可商用；付费也不泛化成广播、API、多语言或任意账户的固定权益。本站没有登录、结账、音质测试或官方品牌素材授权，因此采用本站自制无商标声波图。原选择包 `freemium` 会显示为“Freemium”，可能误导为永久免费层；已仅修为 `paid`，正文及 `pricingSummary` 继续明确 free trial，需增量 QA。
- [固定选择包](./DAILY_OPERATIONS_2026-10-16_WELLSAID_SELECTION.json) ID `dc5b66bb-e69b-472e-8566-3e4a6608ea04`，`selectionHash=45d43b43393ac22db235304800e0b3113354cd21bdf7bcb89612db033e0677cd`。独立 QA 对固定 SHA `910da846` 返回 `QA_PASS_CATALOG_ENQUEUE`；通用 enqueue commit 写入 1，postcheck 为候选 `new`、后像 `a227a988b11075ed08d6cff54c6e35ae5e40e2028f6b7164e6fb635051639b76`，相同授权重放 0 写。candidate→draft preflight 前像 `35edc23fd382c7fab12084d02db8222efa0c3cfd50600b850983fe4cfc34de2b`；rollback 拟 Tool ID `cff99f66-26bc-4030-9384-5e9277f1e705`、持续写入 0。只读回读确认唯一候选仍为 `new`、`tool_id=null`，拟 Tool ID 不存在。QA 未批准 draft commit 或公开。

## Freshness：三项公开 Claim

[固定差分包](./FRESHNESS_CLAIM_DUE_BATCH_2026-10-16.json)记录三项官方来源、前像、拟变更与回滚边界：

- Murf：官方 Studio 定价和商用说明继续支持“免费试用不含下载/商用，付费商业旁白不自动覆盖 TV/广播”的现有保守文案。当前套餐选择、账户结账和广播加购保持条件性；不重复核隐私或旧实体门禁。
- Pika：当前[价格页](https://pika.art/pricing)区分 Free/Starter 与 Creator/Fancy 的商用许可，并把加购 credits 限于 Pika Create，不可泛化到 API/MCP/iOS/旧站。EN/ZH/CN 精确替换及日期差分已提交，`detail` 后像为 `7fc90c55f936b9f8552e66f053b725d56816818ceb372ee332bcb59790108c1a`。
- Synthesia：[现行价格页](https://www.synthesia.io/pricing)仍显示月付 Basic 免费、Starter $29/1,250 credits、Pro $89/6,000 credits；[10 月方案变更说明](https://help.synthesia.io/en/articles/17217419-what-s-changing-in-synthesia-plans-on-october-1-2026)明确 Creator 改名 Pro。现有月付数字未发现需修改的差异；只拟更新证据日期，不扩展账户 API 或授权断言。

三项生产全行前像与明细哈希匹配。独立 QA 对固定 SHA `910da846` 批准精确提交；Murf、Pika、Synthesia 各自事务内验证完整 `detail`、`features.maintenanceReview`、适用的 `pricingSnapshot.checkedAt`、`next_review_date` 和非写集受保护字段，随后各提交 1 行。提交后的独立只读回验 3/3 PASS，已应用重放判断均为 0 写；完整后像哈希见[固定差分包](./FRESHNESS_CLAIM_DUE_BATCH_2026-10-16.json)。首次尝试因连接配置和 JSON 键序比较失败，均未写入；修正后才执行成功。

## 安全与偏差

- 生产写入总数：**4**（WellSaid 候选入队 1、Freshness 3）。新增公开工具：**0**。不把候选入队算作收录。
- 最近生产统计基于本日只读 selector 为 95 total / 71 published；没有本日 `continue_index`、`monitor` 和 sitemap 实时回读，不沿用昨日数字冒充实时值。
- `PLAN_DEVIATION`：Catalog 尚未完成公开；当前 QA 只批准候选入队，draft commit 和发布不在本单授权内。Freshness 三项已结清；Decision 不到期；Market 有 GSC，但站内事件不可用。
- 未增加工具专属 runtime/release 脚本；未改 index、sitemap、关系、schema/RLS、付费或账户登录。两份受保护 SQL 和 10-15 未跟踪 freshness 文件不在本单写集。

下一步：总控回收本单固定 SHA，并决定 WellSaid draft→公开的下一独立 QA/发布边界；不得把本次 rollback 当成 draft commit。无需 Owner 操作。
