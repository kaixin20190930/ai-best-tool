# Glean 与 Fireflies 快速索引证据差分

日期：2026-10-20  
范围：只为现有 `published + monitor` 工具补充 `indexIdentity` 与 `marketValidation.fastTrackEligibility`。不重审已通过的实体、官方来源、页面、Decision 内容或素材；不改变索引状态或 sitemap。

## Glean

- 生产实体：`fd861409-8228-4deb-9802-a9f807d66256`；官方身份使用 `https://www.glean.com/`。当前官方主页仍将 Glean 定位为企业 AI 平台，包含 enterprise search、assistant、agents、连接器、API 和客户案例。官方 `/pricing` 在本次访问时重定向回主页，故不声称存在公开固定价格；意图记录为 `review` 与 `vs`，不是已测搜索量。
- 纳入：G2 Glean Technologies 评论页（独立评论平台；页面显示 336 条评论及近期验证用户反馈），作为公开采用/买方反馈信号；Reddit 的 SaaS 买方评估讨论，发帖者自述代表约 400 人公司评估 Glean、60x、Guru 并选择 Glean，作为未经独立核实的采用/比较信号。
- 边界：G2 评分不证明产品效果；Reddit 叙述是单一自报案例，不视为审计客户、基准测试或价格证据。供应商官网、公司自报 ARR、供应商案例和转载内容均未计入两条独立信号。
- 重复意图：生产只读精确查询结果为其他 Tool `0`、collection candidate `0`、相关 published Task Fit `0`；`checkedToolIds=[]`、`relatedTaskFitToolIds=[]`、`productionMatchCount=0`。Task Fit 查询仍执行，结果为空。
- 结论：满足 `brand_decision_signals` 的证据格式，可提交共享 selector；不代表测得搜索量，也不单独批准索引。

## Fireflies

- 生产实体：`57b270b9-78cf-41f8-8b74-dec46400cd65`；官方身份使用 `https://fireflies.ai/`。本次可访问官方主页与公开 `/pricing`，支持产品身份和 pricing 决策意图；没有把套餐或价格加入本差分。
- 纳入：G2 Fireflies.ai 评论页（独立评论平台；本次页显示超过 750 条评论及近期用户反馈），作为采用/买方反馈信号；TechRadar 2026 AI 工具指南中的 Fireflies 实际会议工作流体验和局限，作为编辑买方评测信号。
- 边界：G2 评论数不是性能测试；TechRadar 的单一编辑体验不是受控 benchmark。供应商宣传、聚合目录、同一评论数据的转载均未计入第二信号。
- 重复意图：生产只读精确查询结果为其他 Tool `0`、collection candidate `0`、相关 published Task Fit `2`；后两者 ID 为 `7ae4bbb2-847f-45cc-9294-e96663fa02a3`、`b8d6a9bd-d9cd-4690-b801-15b1c1fe0a49`。它们是同一 Task 下的比较对象而非重复实体，故 `checkedToolIds=[]`、`productionMatchCount=0`，并如实列入 `relatedTaskFitToolIds`。
- 结论：满足 `brand_decision_signals` 的证据格式，可提交共享 selector；不代表测得搜索量，也不单独批准索引。

## 只读 Selector

- GSC 快照日期：2026-10-14；运行日 2026-10-20，快照仍在 14 天有效窗口内。站点健康为 `warning`；成熟高需求轨道接受该级别，但不把它描述为 `healthy`。
- 当前索引策略：`paused=false`，上限 `5/day, 25/week`；当日已用 `0`、本周已用 `3`。额度不是目标。
- 共享 selector：Glean、Fireflies 均为 `mature_high_demand` 且 `eligible`；阻塞项为空；批次 hash：`b04af10261f617bb8903a80e33b5ac8804f7fd44e49e0243d8bc98b173c243a7`；`productionWrites=0`。
- 本文档与 manifest 只提供候选证据，不是 QA 批准或索引事务。任何后续状态/sitemap 改动仍须沿统一批次 QA、rollback、commit 和 postcheck 执行。

## 生产结果

- 独立 QA：`QA_PASS`，最终生产前像 batch hash 为 `751746cb6b93fa9b9b816728cd2b225272eb32343310c736e3f879b710273aa2`。
- 证据事务：rollback 通过；commit 写入 2 条；幂等 postcheck 写入 0 条。
- 索引事务：rollback 通过；commit 写入 2 条；幂等 postcheck 通过。Glean 与 Fireflies 均从 `published + monitor/noindex` 变为 `published + continue_index`。
- 生产页面：英文与简中页面返回唯一 self-canonical，已移除 `noindex`；繁中仍为 `noindex, follow`。
- sitemap：新增 Glean 与 Fireflies 的英文、简中 URL 共 4 条，总 URL 数由 134 增至 138。Google 实际抓取与收录仍按第 3、7、14、28 天观察，不作收录保证。
- 额度：2026-10-20 当日使用 2/5，本周使用 5/25。
- 验证预算：没有运行 TypeScript、完整 build 或重复 smoke；只执行证据事务、精确索引事务和一次生产页面/sitemap 回读。
