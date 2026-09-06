# 下周成熟 AI 工具收录候选与发布节奏（2026-09-07）

## 目的

本批不是为了增加页面数量，而是为 2026-09-08 起的持续运营准备成熟、需求明确、能形成真实选择判断的 AI 核心工具。候选审核可
以并行进行，但默认每天只公开 1 个工具；公开后先保持 `monitor / noindex`，是否进入 sitemap 继续执行独立索引门禁。

当前环境没有配置 DataForSEO 凭证，因此不能把精确关键词搜索量写成已验证事实。本轮以独立评论量、公开采用规模、融资或收入信
号、产品持续性、官方文档完整度和站内分类缺口作为需求代理。精确搜索量在数据源恢复后补充，但不阻塞证据充分的内容预审。

## 候选优先级

| 顺序 | 候选 | AI 核心性与站内价值 | 当前状态 | 最早处理日 | 放行前缺口 |
| --- | --- | --- | --- | --- | --- |
| 1 | Synthesia | AI 原生商务视频生成；可补“演示型商务视频”而非泛视频生成的决策边界 | 已完成完整预审，待发布槽 | 09-08 | 当日复核价格、credits、avatar、license 与 API；补官方素材 |
| 2 | Replit | AI 原生软件构建与 Agent 工作流；可比较托管便利、成本、可控性和生产责任 | 证据池充足，待结构化预审 | 09-09 | 固化官方计费单位、安全边界和生产可靠性判断 |
| 3 | Otter.ai | AI 原生会议转录与会议助手；高评论量且有清晰免费/团队决策 | 证据池充足，待结构化预审 | 09-10 | 选择唯一 canonical `otter-ai`，将 `/ai/otter` 作为 alias 处理 |
| 4 | Lovable | AI 原生全栈应用构建；用户需求强，但计费体系近期变化 | 待补证据 | 不早于 09-11 | 解决统一 credits 新口径与旧 workspace 文档双余额口径冲突 |
| 5 | Midjourney | AI 原生图像生成；品牌成熟且用户决策边界明显 | 待补证据 | 不早于 09-12 | 补官方价格、当前使用入口、生成/编辑边界及商业权利文档 |

Glean 作为企业搜索储备候选，不进入本周五条主队列。它的独立市场信号较强，但公开价格和企业实施边界不够透明，当前不优先于
Otter.ai。

## 发布与索引控制

1. 每天可以预审 1-2 个，但默认只公开 1 个；不得为了补日更把 `待补证据` 改成 `validated`。
2. 优先迁移已有 `/ai/<slug>` fallback，不新建同义 canonical URL。Synthesia、Replit、Lovable、Midjourney 均沿用现有 fallback。
3. Otter.ai 预审时必须选择 `/ai/otter-ai` 为唯一 canonical，并明确 `/ai/otter` 的 alias/redirect 处置后才能写生产。
4. 每个新实体先写为 `monitor / noindex`，不因公开而自动加入 sitemap。
5. 索引批准必须另行通过资料完整度、市场验证、独立意图和当周索引预算；每天最多 1 个、每周最多 5 个只是上限，不是配额。
6. 本文建立候选次序，不构成生产写入或 sitemap 扩张授权。

## 每个候选的验收顺序

1. 查重：按 slug、官网域名、产品名和 alias 检查生产数据。
2. 身份：确认是 AI 核心产品，而不是传统产品附加一个 AI 功能。
3. 证据：至少 5 个官方来源、2 个独立来源；公司自报采用数据必须标记为 self-reported。
4. 决策：至少 5 个比较维度、5 个限制、1 个政策或许可边界，并明确适合与不适合人群。
5. 波动：发布当天复核价格、额度、套餐、API、权限和政策，不能照搬预审快照。
6. 媒体：只使用来源可解释的 logo 和 thumbnail，双语页面都必须正常渲染。
7. 发布：只迁移既有 fallback；先 `monitor / noindex`，记录复查日。
8. 验收：运行预审门禁、详情页信号、alias/canonical、sitemap、TypeScript、完整 build 与生产 smoke。

## Synthesia 本轮结论

Synthesia 达到成熟工具预审门槛，完整机器可验收记录见
`data/collection/synthesia-preaudit-2026-09-07.json`。它的独特价值是商务演示、培训、内部沟通与本地化视频工作流，不能泛化为
“最好的所有类型 AI 视频工具”。主要风险是 credits 与 add-on 总成本、paid license 自动变化、avatar 同意与肖像权、输出质量人
审，以及 account-level API key 的治理。

当前状态只到 `ready_for_next_slot`：`productionWriteApproved=false`、`sitemapChangeApproved=false`，最早 2026-09-08。今天不
写生产工具表、不新增 sitemap URL。

## 状态追踪

| 日期 | 动作 | 结果 |
| --- | --- | --- |
| 2026-09-07 | 五个成熟候选排序与重复路由检查 | 全部已有 fallback；没有新增 canonical URL |
| 2026-09-07 | Synthesia 完整预审 | 待自动门禁与完整 build；不写生产、不改 sitemap |

