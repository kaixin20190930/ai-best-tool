# 下周成熟 AI 工具收录候选与发布节奏（2026-09-07）

## 目的

本批不是为了增加页面数量，而是为 2026-09-08 起的持续运营准备成熟、需求明确、能形成真实选择判断的 AI 核心工具。候选审核可
以并行进行，本周成熟候选每天至少公开 1 个；公开后先保持 `monitor / noindex`，是否进入 sitemap 继续执行独立索引门禁。若候选
在发布日不能通过事实、市场、素材或重复意图门槛，不得降级标准凑数，必须记录 SLA 异常并从候选缓冲池顺延替补。

当前环境没有配置 DataForSEO 凭证，因此不能把精确关键词搜索量写成已验证事实。本轮以独立评论量、公开采用规模、融资或收入信
号、产品持续性、官方文档完整度和站内分类缺口作为需求代理。精确搜索量在数据源恢复后补充，但不阻塞证据充分的内容预审。

## 候选优先级

| 顺序 | 候选 | AI 核心性与站内价值 | 当前状态 | 最早处理日 | 放行前缺口 |
| --- | --- | --- | --- | --- | --- |
| 1 | Synthesia | AI 原生商务视频生成；可补“演示型商务视频”而非泛视频生成的决策边界 | 已于 09-08 按 `monitor/noindex` 发布 | 09-08 | 10-08 复核证据与页面表现；索引仍需独立批准 |
| 2 | Replit | AI 原生软件构建与 Agent 工作流；可比较托管便利、成本、可控性和生产责任 | 已于 09-09 按 `monitor/noindex` 发布 | 09-09 | 10-09 复核证据与页面表现；索引仍需独立批准 |
| 3 | Otter.ai | AI 原生会议转录与会议助手；高评论量且有清晰免费/团队决策 | alias 已部署验收，发布前材料与日期门禁完成，待 09-10 发布日复核 | 09-10 | 当日区分月付/年付/促销/地区价格，并复核额度与隐私后迁移 `otter-ai` |
| 4 | Lovable | AI 原生全栈应用构建；用户需求强，须拆分原型速度与生产就绪 | 已完成完整预审，待发布槽 | 09-11 | 当日复核统一 credits、账户过渡状态、安全、RLS 与官方素材 |
| 5 | Midjourney | AI 原生图像与短视频创作；品牌成熟且用户决策边界明显 | 已完成完整预审，待发布槽 | 09-12 | 当日复核 GPU 计费、隐私/Stealth、商业权利、Web/Discord 与官方素材 |
| 6 | ElevenLabs | AI 原生语音与音频平台；成熟采用信号强，适合比较质量、credits、克隆同意与商业权利 | 已完成完整预审，进入缓冲池 | 09-13 | 当日复核 credits 换算、促销、rollover、商业使用、克隆与 API 边界 |
| 7 | HeyGen | AI 原生数字人商务视频平台；可补演示、翻译与 API 视频的决策边界 | 已完成完整预审，进入缓冲池 | 09-14 | 当日复核 Web/API 分账、credits、时长、同意、训练数据与素材 |
| 8 | Glean | AI 原生企业搜索与工作助手；独立企业采用信号强，补组织级知识检索判断 | 已完成完整预审，进入缓冲池 | 09-15 | 当日复核 connectors、权限、部署、企业合同与公开价格缺失边界 |
| 9 | Fireflies.ai | AI 原生会议助手与会话智能；与 Otter 形成真实选择场景 | 已完成完整预审，进入缓冲池 | 09-16 | 当日复核套餐额度、自动入会、同意、集成、留存和素材 |

截至 2026-09-09，连续发布缓冲池已从 3 个补足为 7 个（Otter.ai、Lovable、Midjourney、ElevenLabs、HeyGen、Glean、
Fireflies.ai），满足至少 7 天不中断的运营要求。Glean 的公开价格和实施范围不透明已被明确写为决策边界，不再用推测价格弥补资料
缺口。Windsurf 暂不入池：其官网当前正在把产品身份迁移为 Devin Desktop，待名称、canonical、旧用户迁移和市场认知稳定后重新
核验，避免发布后立即出现实体身份冲突。

## 发布与索引控制

1. 每天可以预审 1-2 个，但默认只公开 1 个；不得为了补日更把 `待补证据` 改成 `validated`。
2. 优先迁移已有 `/ai/<slug>` fallback，不新建同义 canonical URL。Synthesia、Replit、Lovable、Midjourney 均沿用现有 fallback。
3. Otter.ai 预审时必须选择 `/ai/otter-ai` 为唯一 canonical，并明确 `/ai/otter` 的 alias/redirect 处置后才能写生产。
4. 每个新实体先写为 `monitor / noindex`，不因公开而自动加入 sitemap。
5. 索引批准必须另行通过资料完整度、市场验证、独立意图和当周索引预算；成熟工具最快 48-72 小时进入评审，当前每天最多 1 个、
   每周最多 3 个，数据库每周 5 个只作硬保护，不是配额。
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

2026-09-08 已完成发布日复核：Basic 为 `$0/月`，Starter 为 `$29/月`，Creator 为 `$89/月`；补充共享 credits、Free license
自动升级、个人数字人实时同意和 account-level API key 边界。生产事务先完成强制 rollback，再显式 commit，回读为
`published + monitor`。`productionWriteApproved=true` 仅代表工具实体允许公开，`sitemapChangeApproved=false`，因此双语页面继续
`noindex` 且不进入 sitemap；下次内容复核日为 2026-10-08。

## 状态追踪

| 日期 | 动作 | 结果 |
| --- | --- | --- |
| 2026-09-07 | 五个成熟候选排序与重复路由检查 | 全部已有 fallback；没有新增 canonical URL |
| 2026-09-07 | Synthesia 完整预审 | 待自动门禁与完整 build；不写生产、不改 sitemap |
| 2026-09-08 | Synthesia 发布日复核与生产迁移 | 当日价格、credits、license、consent、API 已复核；rollback/commit 回读通过，保持 monitor/noindex，不改 sitemap |
| 2026-09-08 | Replit 发布前准备 | 定位、适合/不适合、试用协议、媒体和当前计费快照已结构化；正式 reviewedAt、生产写入与 sitemap 门禁保持关闭至 09-09 |
| 2026-09-09 | Replit 发布日复核与生产迁移 | 当日套餐、effort-based Agent 计费、共享 credits、Starter 限制与发布边界已复核；rollback/commit 回读通过，保持 monitor/noindex，不改 sitemap |
| 2026-09-07 | Replit 生产查重与完整预审 | 名称、标题、官网域名均无实体记录；最早 09-09，不写生产、不改 sitemap |
| 2026-09-07 | Otter.ai 查重、双 fallback 与完整预审 | 无实体记录；两路由均为 noindex self-canonical，发布前必须统一到 `otter-ai` |
| 2026-09-09 | Otter.ai alias 前置收口 | 通用 alias 机制增加 `otter -> otter-ai`；部署后双语旧路径均为 308，唯一 canonical 页面为 200/noindex 且不在 sitemap |
| 2026-09-09 | Otter.ai 发布前材料与门禁 | 稳定产品边界、试用协议、本地素材和 09-10 清单已结构化；测试确认 09-09 的 preflight/release 均被日期门禁阻断 |
| 2026-09-07 | Lovable 计费冲突复核、查重与完整预审 | 实时官方页面已统一；旧双余额为历史/过渡口径，无实体重复，最早 09-11 |
| 2026-09-07 | Midjourney 查重、fallback 与完整预审 | 无实体记录；fallback 为 noindex self-canonical；价格、GPU、隐私、商业权利与视频边界已补齐，最早 09-12 |
| 2026-09-09 | 连续发布候选池补充 | ElevenLabs、HeyGen、Glean、Fireflies.ai 完成完整预审；缓冲池由 3 个增至 7 个，均不写生产、不改 sitemap |
| 2026-09-09 | Windsurf 身份风险复核 | 官网正将 Windsurf 更名为 Devin Desktop；暂缓收录，待 canonical 与市场身份稳定后重审 |
