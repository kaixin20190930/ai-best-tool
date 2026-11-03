# AI Best Tool 日报（2026-11-03）

## 今日选择

| 顺序 | 候选 | reason / signalWindow | confidence | expectedOutcome | cooldownUntil | downstreamConsumer | defaultSelected |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | OpenClaw Catalog | 10 月 26 日实体快照已为 READY；11 月 3 日重新核验官网、安装与安全文档，生产 Tool/Candidate 查重为 0，产品入口、生命周期、决策边界和下游 self-hosted assistant 位置完整 | high | 走通用 intake 发布为 `published + monitor/noindex` | - | self-hosted assistant / personal agent Cluster | true |
| 2 | Free AI Coding Tools Cluster | 最近可用 GSC 只有 2 次页面展示，仍低于有效样本 | medium | 继续观察免费、试用、credits、BYOK 决策簇 | - | Coding Cluster | false |
| 3 | Freshness 到期批次 | 149 Tool IDs；89 published；67 due，其中 `claim_due=54`、`entity_due=13` | medium | 只在官方来源证明真实变化时更新 | 按各 Claim 日期 | 已收录 Tool | false |
| 4 | Poe Harvest | 最近完整 28 天快照为 0 clicks / 261 impressions / position 35.20 | low | 继续观察，不追逐低质量波动 | - | Chatbot Cluster | false |
| 5 | 新 pending 输入 | 新输入仍包含父子、版本或重复实体不确定性 | low | 保持 `REVIEW_REQUIRED`，不自动建 Tool | - | 候选池 | false |

OpenClaw 是唯一 high-confidence 默认项，系统按无人值守契约直接执行，没有等待 Owner 说“继续”。

## 主要结果单元：OpenClaw

- 官方来源重新核验：产品页、安装页和安全文档均可访问，分别覆盖身份/核心能力/无托管套餐边界、安装与模型提供商要求、Gateway 信任边界与运营责任。
- Entity Resolution：`resolutionDecision=NEW_TOOL`、`resolutionConfidence=high`、`resolvedParentToolId=null`、`autoMerged=false`。OpenClaw 是独立平台；版本、插件、模型提供商和新增渠道只作为同一 Tool 的 freshness，不创建新 Tool ID。
- 生产只读查重：`tools` 和 `collection_candidates` 对 OpenClaw、`openclaw.ai`、`docs.openclaw.ai` 均为 0。
- 交付复用通用 `collection_candidates -> draft -> published` 流程；未创建工具专属发布代码、测试、表、Dashboard 或运行时分支。
- enqueue 与 candidate-to-draft 均完成 preflight、rollback、internal preparation commit 和零写 postcheck；最终 Tool publication 完成 preflight、rollback、一次独立 `QA_PASS`、commit 和零写 postcheck。
- OpenClaw Tool ID：`cd92da99-d9e5-463c-baf5-745e97aba226`；状态：`published + monitor/noindex`。
- EN/CN/TW 页面均为 200、`noindex, follow`、self-canonical；平台自有中性 SVG 为 200；sitemap 对 `openclaw` 匹配 0。
- 没有关系、index、sitemap、canonical、迁移、RLS 或不可逆动作变更。

## 可选低风险维护

- Freshness 全量 selector 为只读：67 个 published 到期项只表示需要核查，不证明事实已经变化，因此本日维护写入 0。
- 选出的 Midjourney、OpenRouter、ElevenLabs、Fireflies 和 Glean 没有在本单元中被重复复核或写入。

## Market / GSC

- GSC OAuth 刷新连续两次返回 HTTP 400；按失败隔离规则停止重试，不伪造 11 月 3 日指标。
- 最近可用完整快照仍截止 2026-10-30：7 天 `0 clicks / 831 impressions / CTR 0% / position 17.20`；28 天 `4 / 3,192 / 0.13% / 15.21`。
- Market 数据暂为 `unavailable_current`；Catalog 与 Freshness 没有因此冻结。

## 页面资产账本

| 状态 | 数量 |
| --- | ---: |
| KEEP_INDEX | 68 |
| IMPROVE | 3 |
| INTERNAL_NOINDEX | 178 |
| MERGE_CANDIDATE | 53 |
| ARCHIVE_CANDIDATE | 28 |

共 330 个资产，生产 sitemap 152 URLs。OpenClaw 新增为 INTERNAL_NOINDEX；没有自动索引、合并或归档。

## 生产交叉矩阵

| lifecycle(status) | page_quality_status | 数量 |
| --- | --- | ---: |
| draft | monitor | 9 |
| pending | monitor | 25 |
| published | archive | 2 |
| published | continue_index | 28 |
| published | monitor | 60 |
| rejected | monitor | 26 |

总计 150 Tool IDs，90 published。不同维度数字不相加。索引策略未暂停，额度为 5/day、25/week，本日/本周使用 0/0；OpenClaw 没有占用索引额度。

## SHA / 部署 / PLAN_DEVIATION

- OpenClaw 选择快照与平台自有媒体提交：`88a6db7c`，已推送 `origin/main`。
- 生产媒体与 EN/CN/TW 页面已回读成功；本单元为 R 级内容/通用数据发布，没有运行 TypeScript、build、广泛测试或重复 smoke。
- `PLAN_DEVIATION`：Market 因 GSC OAuth 400 无法刷新；其他线按失败隔离继续。没有降低质量门槛或制造第二个主要单元。
- 受保护的 Perplexity/Gemini SQL 与旧 Freshness 草稿保持未触碰。

## 唯一下一项

下一次日运行先重试一次 GSC；凭据恢复后重新读取完整 14/28 天窗口并选择稳定 Harvest/Cluster 缺口。若 GSC 仍不可用，则从已证实真实变化的 Freshness 或证据成熟 Catalog 中选择唯一 high-confidence 默认项，不用 medium/low 项补任务。

## Owner 事项

- 需要更新或重新授权 `GSC_REFRESH_TOKEN`；当前 OAuth token exchange 连续两次返回 400。除此之外无需用户操作。
