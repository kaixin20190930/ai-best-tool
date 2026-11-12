# 产品增长自动运营执行手册

更新：2026-11-12。上位路线：[产品增长路线](./PRODUCT_GROWTH_ROUTE_AND_ROADMAP_2026-11_CN.md)。本手册覆盖旧复盘中的全局等待解释。

到期观察与日常交付并行：前者负责市场反馈，后者消除当前 Cluster 的真实缺口。单个页面的冷却、GSC 缺行、某个工具索引 HOLD 都不能暂停其他已授权且可独立完成的证据复核、身份查重、对比和有条件推荐。日历决定检查时间，不强制发布。当前唯一 Cluster 是 Automation，处于 R4 repair_monitor；Make 的**索引分发**仍等待 R4 分发决策和至少 14 天有效反馈，站内支持工作不因此停止。

## 一、真实状态

- 监控修复提交 1edbe12f4d90a63ed14e01c68f9f26d11a754686 已推送。[SEO Monitoring](https://github.com/kaixin20190930/ai-best-tool/actions/runs/41995465716) 与 [Production Health Monitor](https://github.com/kaixin20190930/ai-best-tool/actions/runs/41995465820) 实际运行均 Success。
- 生产 sitemap 154 URL，comparison 仅获准的 Automation 英中两条。工作流不再拒绝获准页面；工具证据、技术信号和索引边界继续严格检查。
- 2026-11-09 已完成 GSC 生产态 OAuth 重新授权，本地 Refresh Token 已更新且真实只读拉取成功；11-12 最新成功完整日期为 2026-11-09。增长周报为 `available`，发布后信号仍须按 D+3/7/14/28 同窗验证。密钥没有复制或写入报告/Git。
- 首轮观察 8 URL、技术异常 0、生产写入 0。这不是 Google 发现/抓取/收录证明。
- 11-05 Freshness 只读盘点：150 Tool、69 到期公开工具（56 claim_due、13 entity_due）。Automation 内 Lindy、Make 复核到期；n8n 未进入当日到期工具队列。这是工具级日期队列，不是精确的到期 Claim 数。

## 二、三个调度职责（一个交付负责人）

均回到本聊天，避免新建重复项目任务。每轮先读本手册、上位路线和 reports/seo/product-growth-releases.json。

| 任务 | 上海时间 | 产物 | 修改范围 |
| --- | --- | --- | --- |
| 增长周报 | 周五 16:00 | 新指标与数据窗口/缺口 | 私有快照、汇总文档 |
| Cluster 日常推进与周复盘 | 每日 17:00；周五同轮复盘 | 实际差分、可执行产物、精确阻塞和下一步 | 沿既有授权与通用流程推进；生产及独立 QA 门禁照常 |
| 发布后观察 | 每日 10:00 | 到期 D+3/7/14/28 证据及异常 | 只读生产、观察文档 |

周报先执行 pnpm run gsc:fetch-readonly；失败本轮只试一次，保留快照，记录失败，不冒充当前数据或填零。随后 pnpm run growth:weekly-report --summary。原始查询/URL 行仅保留 .local/gsc/；仓库只保存汇总。

日常推进复用最新成功周报与观察，不重复采集。先读发布清单 delivery 状态与既有候选，选一个改变用户决策或消除阻塞的差分；已完成项不重做，HOLD 项仅在输入变化时重评。没有 manifest 时先完成精确 before/after、保护字段哈希和当前生产 preflight，再进入独立 QA；不能无限重复“缺 manifest”。签署与既有授权齐备后继续通用 rollback/commit/postcheck，不自签、不扩用旧 QA。签署不可用时落账准确阶段，继续完成批次内其他可独立项。

一个主页面、最多两个支持 Tool，只审到期、变化或将被引用的关键 Claim。只有状态未知才运行 bounded freshness 审计，不因周五重审全库或重复 quality inventory。排序沿用真实搜索机会、Cluster 缺口、BOFU 意图、准备度、维护成本，confidence 不计增长。新增输入核对唯一 ID、规范化官网、alias、候选与 Task Fit 意图，低置信不自动合并。月度 autoMerged 抽查维持原规则，无样本 N/A。

观察运行 pnpm run growth:observe。按 release 日期 × 对象 × 节点去重，读取 .local/gsc/operations/product-growth-milestone-*.json；损坏或重复记录报错，不能静默忽略。已记录 waiting_data/等待重抓表示本节点已核查，下一节点再看，不是每日逾期，也不是增长成功。生成区之外的 Google 证据不得覆盖。只有未落账到期节点才补采 GSC/URL Inspection，同日成功快照复用，失败只尝试一次。观察任务保持生产只读，无到期节点/异常/新数据保持安静。

交付落账到 reports/seo/product-growth-releases.json 的 delivery 字段及当轮验收，写清已完成阶段、产物、剩余门禁和下一触发条件。每日推进是机会检查频率，不是每日发版配额。公开推荐需要复核理由、有效日期及合格 published 工具；允许 monitor/noindex 工具作为站内决策去向，不等于索引审批。pending/draft/rejected/archive/merge_candidate、质量不足和过期推荐不得展示。索引、sitemap、合并、删除及归档仍走各自门禁。

## 三、指标口径

- Outcome：可见非站点品牌决策查询 clicks/impressions/CTR；排除裸品牌导航，竞品名加 pricing/vs/limits 等修饰词可以计入。
- Ranking：实体 × 意图聚合，曝光加权；Top 20 当前仅覆盖 Automation 的 n8n/Make/Lindy，未映射查询不拼成泛簇。
- Distribution：页面×查询联合行证明相关；旧快照只有独立 page/query 时 unavailable。不同语言 URL 分别计页面。
- Conversion：Compare next/Evidence/outbound 与可归因自然搜索决策访问尚缺验证报表，使用 unavailable，按路线使用 GSC 代理指标。
- Quality/Freshness：同次生产检查和真实关键 Claim 复核；工具级队列不冒充 Claim 级数目。
- 资产/工具/任务/PASS 数只作运营健康，禁止用于增长结论或补数排期。

API top rows 不穷尽、可能漏匿名查询。已返回查询的 0 点击是事实；缺数据/权限失败不填零；无曝光 CTR unavailable。无可比完整窗口，不作提升/下降因果结论。

## 四、观察与推进

n8n 与 Automation 于 11-05 完成生产技术验收；内容冷却至 11-19。节点：11-08、11-12、11-19、12-03。D+3 发现/技术，D+7 抓取，D+14/28 同窗最终查询、曝光、CTR 与页面价值。数据不成熟标 waiting_data，不提前填完成。观察日期为上海日历，GSC 窗口按 Pacific Time，不能直接混算。

Lindy 尚无**索引分发** release 日期，不启动分发后 D+；它已经是公开 monitor 页。11-12 完成当前官方定价/用量复核、规范化身份查重，两阶段分别取得独立 QA 并按实际生产前像提交，postcheck 均已应用且追加写入 0；next_review_date 为 11-26，indexIdentity 已补齐。剩余是事前 monitor 技术/事实/意图观察记录与站点级 GSC/Coverage 健康评审；不需要等待索引 release，也不能要求 noindex 页先获得正常排名数据。observationComplete 未经证据独立复核前保持 false。Make 不为对称性放开索引，站内对比和推荐可继续。

周五推进轮合并周复盘，每月首次周复盘再合并资产/成本/授权治理，不创建第四条重复采集链。无差分不创建空 QA；遵循任务锁 R/C/H 差分校验，不为候选文档运行构建，不重复已通过的验证。

## 五、验收

分别记录：代码检查、手动首轮、任务创建、ACTIVE 回读、首次调度运行、业务结果。ACTIVE 只证明配置，首次自动运行尚未发生时写待首次调度验收。

任务 ID：发布后观察 ai-best-tool、增长周报 ai-best-tool-2、日常推进与周复盘 ai-best-tool-cluster；沿用 ACTIVE heartbeat 和原实施聊天 01a1a537-2cf3-71c3-b2d7-0f9c2ead6132，不另建重复任务。手动回放与自动首次触发分别落账，不能以 ACTIVE 或手动 PASS 冒充自动运行。当前验收见[11-12 记录](./PRODUCT_GROWTH_OPERATIONS_ACCEPTANCE_2026-11-12_CN.md)。本机及桌面应用须保持运行（[官方说明](https://learn.chatgpt.com/docs/automations)）。
