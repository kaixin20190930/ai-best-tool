# 产品增长自动运营执行手册

日期：2026-11-05。上位路线：[产品增长路线](./PRODUCT_GROWTH_ROUTE_AND_ROADMAP_2026-11_CN.md)。

执行顺序由实际状态决定：监控健康 → 可核对周报 → 当前 Cluster 复盘 → 到期观察 → 门禁允许后下一阶段。日历只决定何时检查，不强制发布或推进阶段。当前唯一 Cluster 是 Automation，处于 R4 repair_monitor；Make 等待 R4 分发决策和至少 14 天有效反馈。

## 一、真实状态

- 监控修复提交 1edbe12f4d90a63ed14e01c68f9f26d11a754686 已推送。[SEO Monitoring](https://github.com/kaixin20190930/ai-best-tool/actions/runs/41995465716) 与 [Production Health Monitor](https://github.com/kaixin20190930/ai-best-tool/actions/runs/41995465820) 实际运行均 Success。
- 生产 sitemap 154 URL，comparison 仅获准的 Automation 英中两条。工作流不再拒绝获准页面；工具证据、技术信号和索引边界继续严格检查。
- 首份新周报已生成，GSC 最终日期 2026-10-30，明确为过期发布前基线。实时 OAuth 400；Moss 服务账号可签发 token，但 aibesttool 两种 property 均 404，无可验证权限。密钥没有复制或写入报告/Git。
- 首轮观察 8 URL、技术异常 0、生产写入 0。这不是 Google 发现/抓取/收录证明。
- 11-05 Freshness 只读盘点：150 Tool、69 到期公开工具（56 claim_due、13 entity_due）。Automation 内 Lindy、Make 复核到期；n8n 未进入当日到期工具队列。这是工具级日期队列，不是精确的到期 Claim 数。

## 二、三个调度职责

均回到本聊天，避免新建重复项目任务。每轮先读本手册、上位路线和 reports/seo/product-growth-releases.json。

| 任务 | 上海时间 | 产物 | 修改范围 |
| --- | --- | --- | --- |
| 增长周报 | 周五 16:00 | 新指标与数据窗口/缺口 | 私有快照、汇总文档 |
| 唯一 Cluster 复盘 | 周五 17:00 | 唯一下一步、必要维护、QA 条件 | 内部候选/审计，不自动发布 |
| 发布后观察 | 每日 10:00 | 到期 D+3/7/14/28 证据及异常 | 只读生产、观察文档 |

周报先执行 pnpm run gsc:fetch-readonly；失败本轮只试一次，保留快照，记录失败，不冒充当前数据或填零。随后 pnpm run growth:weekly-report --summary。原始查询/URL 行仅保留 .local/gsc/；仓库只保存汇总。

Cluster 复盘复用周报，不重复采集。必要时运行 pnpm exec tsx scripts/audit-freshness-backlog.ts --out=.local/gsc/operations/freshness-backlog-latest.json 和 pnpm run seo:quality-inventory；账本只作去重/索引护栏。一个主页面、最多两个 Tool，只审到期、变化或将被引用的关键 Claim。排序为真实搜索机会、Cluster 缺口、BOFU 意图、准备度、维护成本；confidence 只控制执行资格，不计增长。新增输入先查唯一 ID、官网、alias 与意图；低置信不自动合并。前四周如有 autoMerged 样本抽查 20%、至少 5 条，不足 5 条全查；无样本 N/A。

观察运行 pnpm run growth:observe。同日同对象同节点最多一条记录。无到期节点/异常/新数据保持安静，仅真实变化、完成、失败或用户操作需求通知。不得自动修改公开页面、标题、索引、sitemap、数据库、生产配置、合并、删除、归档、重定向或部署。

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

Lindy 尚无 release 日期，不启动 D+；证据 QA/commit 已完成，index review repair_monitor。真实补齐复核日期、独立意图与观察证据，再评审、独立 QA 和受控提交。不得自签或用 evidence QA 代替索引 QA。Make 不为对称性放开；到了新一周也不产生发布资格。

月度资产/成本/授权候选治理合并进每月首次 Cluster 复盘，不创建第四条重复采集链。没有公开差分时不创建空 QA，先有完整候选和哈希，再按门禁取得独立签署。

## 五、验收

分别记录：代码检查、手动首轮、任务创建、ACTIVE 回读、首次调度运行、业务结果。ACTIVE 只证明配置，首次自动运行尚未发生时写待首次调度验收。

三项任务已经创建并回读：增长周报 ai-best-tool、Cluster 复盘 ai-best-tool-cluster、发布后观察 ai-best-tool-2；均 ACTIVE、heartbeat，绑定本聊天 01a1a537-2cf3-71c3-b2d7-0f9c2ead6132。手动周报、8 URL 观察、工具级 Freshness 盘点已完成，首次自动调度运行待验收。首个日检为 11-06 10:00，周报与复盘为 11-06 16:00/17:00（上海）；首个发布里程碑为 11-08。定时任务依赖本机及 Codex app 保持运行。
