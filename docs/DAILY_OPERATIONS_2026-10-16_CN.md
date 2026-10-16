# AI Best Tool 每日运营草稿：2026-10-16

日期：2026-10-16（Asia/Shanghai）
状态：开发候选包固定中，等待独立 QA；本草稿不构成生产发布确认。

## 四线账本

| 线 | 状态 | 本次实际结果 |
| --- | --- | --- |
| Catalog | partial | 成熟队列没有现成 READY；首位 WellSaid Studio 已核 `www.wellsaid.io` 单一规范域、AI 配音与发音工作流、官方产品/定价互补来源、EN/CN/TW 决策内容及本站自制中性素材。通用入队 preflight 和事务 rollback 通过，生产写入 0。候选尚未入队、导入 draft 或公开。 |
| Freshness | partial | 全量只读 selector：95 total / 71 published / 22 due；分类 `schedule_sync=0 / claim_due=10 / entity_due=5 / manual_archive_review=7`。仅处理 Murf、Pika、Synthesia 三项到期公开可变 Claim，逐项前像与目标明细哈希匹配；完整事务预演后全部 rollback，写入 0。仍须独立 QA，故不得提交整批。 |
| Decision | not_due | 本周 2026-10-12 至 10-18 已有 2/2 个用户可见单元；本日不建页面或关系。 |
| Market | completed with limitation | 私有 GSC 只读快照相对标识 `.local/gsc/a2847bc96613/search-analytics-2026-10-13.json`，文件 SHA-256 `c290b9f76fac1ea0bbd1963300ce34e3d7850c11be48e10445f0b4be30d220bf`；`latestCompleteDate=2026-10-13`，7 天 3 clicks / 956 impressions，28 天 7 / 1,813。原始私有文件不提交。站内事件 unavailable，不把缺失记为零。 |

## Catalog：WellSaid

- 单一对象为 WellSaid Studio；API 只是单独核对权益的使用路径，不另建实体。`https://wellsaid.io/` 301 到 `https://www.wellsaid.io/`，选择包只使用后者。
- [官方首页](https://www.wellsaid.io/)与[AI 配音功能页](https://www.wellsaid.io/ai-voice-generator)支持脚本转语音、选音色、编辑和发音控制。[现行定价页](https://www.wellsaid.io/ai-voice-pricing)区分试用、付费下载分钟、商用范围和套餐权益。
- 试用不被描述为可商用；付费也不泛化成广播、API、多语言或任意账户的固定权益。本站没有登录、结账、音质测试或官方品牌素材授权，因此采用本站自制无商标声波图。原选择包 `freemium` 会显示为“Freemium”，可能误导为永久免费层；已仅修为 `paid`，正文及 `pricingSummary` 继续明确 free trial，需增量 QA。
- [固定选择包](./DAILY_OPERATIONS_2026-10-16_WELLSAID_SELECTION.json) ID `dc5b66bb-e69b-472e-8566-3e4a6608ea04`，修正后 `preimageHash=4d7a7dbe012c35c985510c367e1ce0f05a8670fbe1ef9b1f14894a6fc27a69bc`，`selectionHash=45d43b43393ac22db235304800e0b3113354cd21bdf7bcb89612db033e0677cd`。通用 enqueue `preflight` 返回 `ready=true, productionWrites=0`；同一前像 `rollback` 返回 `productionWrites=0`。原 QA PASS 仅覆盖旧 selectionHash；修正后的入队须增量 QA 才能 commit。

## Freshness：三项公开 Claim

[固定差分包](./FRESHNESS_CLAIM_DUE_BATCH_2026-10-16.json)记录三项官方来源、前像、拟变更与回滚边界：

- Murf：官方 Studio 定价和商用说明继续支持“免费试用不含下载/商用，付费商业旁白不自动覆盖 TV/广播”的现有保守文案。当前套餐选择、账户结账和广播加购保持条件性；不重复核隐私或旧实体门禁。
- Pika：当前[价格页](https://pika.art/pricing)已清楚区分 Free/Starter 与 Creator/Fancy 的商用许可，并把加购 credits 限于 Pika Create，不可泛化到 API/MCP/iOS/旧站。旧公开文案仍以“现行页与旧 FAQ 冲突”概括；本次已把 EN/ZH/CN 精确替换及日期差分固定到批次包，目标 `detail` 哈希为 `7fc90c55f936b9f8552e66f053b725d56816818ceb372ee332bcb59790108c1a`，仍待独立 QA。
- Synthesia：[现行价格页](https://www.synthesia.io/pricing)仍显示月付 Basic 免费、Starter $29/1,250 credits、Pro $89/6,000 credits；[10 月方案变更说明](https://help.synthesia.io/en/articles/17217419-what-s-changing-in-synthesia-plans-on-october-1-2026)明确 Creator 改名 Pro。现有月付数字未发现需修改的差异；只拟更新证据日期，不扩展账户 API 或授权断言。

三项生产全行前像与明细哈希均已只读匹配；对精确 `detail` 替换、`features.maintenanceReview`、适用的 `pricingSnapshot.checkedAt` 和 `next_review_date` 做同一事务内 UPDATE 预演，校验目标明细哈希后立即 ROLLBACK，结果 3/3、持续写入 0。该结果是可回滚候选，不是独立 QA 或 commit；本日报不把日期推进或页面变更计为完成。

## 安全与偏差

- 生产写入总数：**0**。新增公开工具：**0**。Freshness 已提交更新：**0**。不把 WellSaid 的入队预演算作收录。
- 最近生产统计基于本日只读 selector 为 95 total / 71 published；没有本日 `continue_index`、`monitor` 和 sitemap 实时回读，不沿用昨日数字冒充实时值。
- `PLAN_DEVIATION`：Catalog 尚未完成公开，因为 QA 前按边界不得 commit；Freshness 已形成完整受控候选，但 QA 前没有提交。Decision 不到期；Market 有 GSC，但站内事件不可用。
- 未增加工具专属 runtime/release 脚本；未改 index、sitemap、关系、schema/RLS、付费或账户登录。两份受保护 SQL 和 10-15 未跟踪 freshness 文件不在本单写集。

下一步：把固定 SHA 的 WellSaid 选择包、三项 freshness 精确差分和本日报交给唯一独立 QA；QA PASS 后才允许通用路径的生产 commit。无需 Owner 操作。
