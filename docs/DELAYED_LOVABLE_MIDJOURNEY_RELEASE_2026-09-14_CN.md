# Lovable / Midjourney 延期补发交付（2026-09-14）

状态：Lovable 已于 09-14 独立生产提交；完整 DOM 验收发现 Decision Card 限制列表被截为前两条，修复待总控部署。Midjourney 尚未提交，按停止条件暂停；不得关闭交付单元。

基线：GitHub `main` 的 `62604cb5c9f411fe0aad59f59d7bfa92dc206aca`（本次已 fetch 核实）。
功能分支：`codex/lovable-midjourney-delayed-release-20260914`。唯一候选以该分支最终交付 SHA 为准；禁止本开发任务推 main 或部署。

## 日期与授权

| 工具 | 原计划发布槽 | 本次事实复核 | 实际发布日 | 下次事实复核 |
| --- | --- | --- | --- | --- |
| Lovable | 2026-09-11 | 2026-09-14 | 2026-09-14 | 2026-10-14 |
| Midjourney | 2026-09-12 | 2026-09-14 | 未发布，留空 | 2026-10-14 |

两槽均为 SLA 逾期补做，记录为“延期补发”；不得把 09-07 预审或 09-14 核验日写作已经发生的生产发布日期。
预审文件保留历史 `reviewedAt=2026-09-07`，正式 payload 的 `reviewedAt`、editorial、pricingSnapshot、evidence 均为 09-14。
Lovable 预审已据真实提交更新为 `released`、`releasedAt/actualPublishedAt=2026-09-14`、`productionWriteApproved=true`、`releaseIndexState=monitor`。Midjourney 仍未发布，实际发布日留空；两者 `sitemapChangeApproved=false`。
总控已合并并部署首轮候选（main `61eec3101f8e0f7f59d7e80de85b32b55f71fe0f`），四项生产媒体门禁已通过。下文基线与首轮验证保留为历史记录，当前状态以末尾生产执行记录为准。

## 首轮生产基线（发布前历史）

只读报告：`reports/releases/2026-09-14/production-baseline.json`。

- 按 slug、同义名称、官网域名和双语标题查询，两个工具均为 0 条实体。
- `/ai/lovable`、`/cn/ai/lovable`、`/ai/midjourney`、`/cn/ai/midjourney` 都是 200、自 canonical、noindex，但正文是“工具页暂不可用”。这是保留路由的错误占位，不能称为完整 fallback 已验收。
- `lovable-dev`、`mid-journey` 对应中英文路径也是无工具内容的 noindex 占位；没有可迁移的重复实体，也没有新增 alias 配置。
- 沿用唯一 canonical `lovable`、`midjourney`，不创建同义工具 URL。索引预算没有消耗，sitemap 仍为 116 条，上述路径均未出现。
- 四个新素材的生产 URL 均返回 404 HTML；完整明细和本地 SHA256 见 `production-media.json`。正文可用性与素材是否存在是独立门禁，HTTP 200 不能替代正文验收。

## 9 月 14 日事实复核结论

正式双语正文、逐条官方/独立来源、适合/不适合、比较维度、限制与试用建议分别位于 `data/collection/lovable-release.json`、`data/collection/midjourney-release.json`。
本次是公开文档复核，没有声称已登录供应商账户或完成产品实测。没有写入精确搜索量、实时评论数量、未核验的市场排名或收入数字。

### Lovable

- 当前以 Build、Cloud、应用 AI 共用 credits 为主口径；6 月公告是迁移历史，现行用量文档仍保留渐进迁移提示，不能断言所有账户已迁移。
- 官方订阅表可核验 Pro/Business 的 100 credits 档月付与年付总额。不同档、地区、税费、赠送和 Enterprise 条件必须分别理解。
- 价格 FAQ 把 Plan mode 简写为 1 credit，详细用量文档另计子代理研究；正式内容采用更完整的规则。付费 AI 赠送和地区 daily cap 表述存在差异，正文说明差异而不承诺普遍适用的赠送额度。
- 工作区成员限制只管构建，不限制项目 Cloud/AI 支出。credits 失效、取消后冻结、自动充值需账户级复核。
- Basic/Deep 扫描辅助检查，仍可在未强制发布保护时带严重问题发布；Supabase/RLS 必须逐表验证匿名及跨用户读写隔离，服务密钥、支付授权、备份、回滚和维护需要责任人。
- 代码归属不等于数据库、文件、域名、密钥和托管服务已完整迁移。

官方来源：[套餐](https://docs.lovable.dev/introduction/subscription-plans)、[用量](https://docs.lovable.dev/introduction/credits-and-usage)、[价格 FAQ](https://lovable.dev/pricing)、[管理员设置](https://docs.lovable.dev/features/workspace-admin-settings)、[安全](https://docs.lovable.dev/features/security)、[Supabase](https://docs.lovable.dev/integrations/supabase)、[迁移公告](https://lovable.dev/blog/simplifying-billing)、[条款](https://lovable.dev/terms)。
独立依据：[TechRadar 产品测试](https://www.techradar.com/pro/software-services/lovable-review)、[TechCrunch 采用报道](https://techcrunch.com/2026/06/09/lovable-says-it-has-hit-500m-in-annualized-revenue-with-1-million-new-projects-a-week/)；后者的厂商采用信号标记为 self-reported，不当作审计数据。G2 本次返回反爬页面，未复用其旧评论量。

### Midjourney

- 官方套餐表核验 Basic/Standard/Pro/Mega 月费、年付总额、Fast 时间及额外 GPU 单价；Fast 不结转，不承诺每小时固定成品数。
- Relax 图像为 Standard 及以上，Relax 视频仅 Pro/Mega 的 SD；HD 视频需 Standard 及以上且用 Fast。
- Web、Discord、图库关联、编辑器及参数兼容性分别说明。现行 Editor 是 V8.X Edit Model；Omni Reference 有独立编辑入口与参数去除要求。GPU 文档的 V8.1/Turbo 限制不泛化为所有版本。
- 默认公开及可混编。Stealth 仅 Pro/Mega，不能隐藏共享 Discord 频道里的作品，改默认设置不自动隐藏旧内容。
- 商业资格与输入权利、版权成立、商标、肖像、独占及客户许可分开；现行收入门槛及厂商保留许可均说明。
- 视频是起始图像短动画，5 秒、逐次延长至 21 秒；SD/HD 批次成本、延长费用和参数范围已核验，不表述为完整时间线或音频制作套件。

官方来源：[套餐](https://docs.midjourney.com/hc/en-us/articles/27870484040333-Comparing-Midjourney-Plans)、[GPU](https://docs.midjourney.com/hc/en-us/articles/32016412137741-GPU-Speed-Fast-Relax-Turbo)、[Web](https://docs.midjourney.com/hc/en-us/articles/33390732264589-Creating-on-Web)、[Editor](https://docs.midjourney.com/hc/en-us/articles/32764383466893-Editor)、[Video](https://docs.midjourney.com/hc/en-us/articles/37460773864589-Video)、[Stealth](https://docs.midjourney.com/hc/en-us/articles/32019750070669-Stealth-Mode)、[商用](https://docs.midjourney.com/hc/en-us/articles/27870375276557-Using-Images-Videos-Commercially)、[条款](https://docs.midjourney.com/hc/en-us/articles/32083055291277-Terms-of-Service)。
独立依据：[Forbes 公司资料](https://www.forbes.com/companies/midjourney/)、[Tom’s Guide 比较](https://www.tomsguide.com/best-picks/best-ai-image-generators)。旧预审的精确收入、评价量及旧模型版本没有迁入正式事实。

## 媒体和实现

- Lovable logo/lockup 来自 [官网品牌入口](https://lovable.dev/brand) 指向的 [Brand Hub](https://lovablebrand.lovable.app/brand/logo)，遵循原色、比例及留白规范。
- Midjourney 的船形标志和文字图来自 [官方商标政策](https://docs.midjourney.com/hc/en-us/articles/32084281102349-Midjourney-Trademark-Policy)，只作如实描述性识别，正文含商标及无关联声明；不宣称取得一般再许可。
- 原图保留；cover 仅把未改动的品牌图置于白色 SVG 画布，避免页面 object-cover 裁掉宽字标。每份资产包含来源 URL、原文件、本地 SHA256 和使用说明。没有伪造 UI 截图或生成效果。
- 页面读取 `features.decision.limitations`，让两份 payload 的双语限制进入 Decision Card。比较维度由既有 `compareAxes` 契约消费，进一步比较路径放在正文；未伪造数据库的 reviewed relationship。
- 发布器查重增加标题匹配；rollback 回读完整 `en/zh/cn` 正文、features、媒体与复查日。commit 前确认生产图片内容类型及字节哈希，verify 检查实际标题/Decision Card。
- 新增只读审计支持 baseline、media、released 三种模式，released 还核对生产数据库全文与 payload 一致；不会把空页或缺图当作发布完成。

## 验证和后续顺序

当前专项测试、TypeScript、完整 `pnpm build`、全站索引一致性与生产 SEO smoke 均通过。全站数据库 56 条、published 44 条、可索引 13 条；sitemap 116 条，其中工具 URL 26 条；遗漏、越界、重复 canonical 与页面索引冲突均为 0。

额外直接 lint 检查发现原工具详情页基线已有 1,515 个 error / 6 个 warning；对 `62604cb5` 与当前页面逐规则比较，数量及分布完全一致，新增为 0。新增/修改发布脚本的 scoped ESLint 退出 0。Next 配置沿用基线的 build 跳过 lint 行为，因此不把 build 通过冒充全仓 lint 干净。证据为 `page-lint-baseline.json`。

测试退出码、完整 build 和门禁结果见 `reports/releases/2026-09-14/checks.json`；生产基线、媒体及全站索引报告同目录。

1. 总控指定本分支唯一候选 SHA 交原只读验收任务核验。
2. QA 通过后由总控按协议合并、完整 build 并部署素材和页面限制展示修复。本开发任务不部署。
3. 同一开发任务重新运行只读 media 门禁，必须四个素材都为真实图片且 SHA256 一致。若跨日，先重新核验所有波动事实并更新 reviewedAt、复查日及实际日期，不能沿用 09-14 冒充新发布日。
4. 重新逐个 validate/preflight/rollback，确认候选 SHA 对应测试、TypeScript 与完整 build 均通过；随后才可逐个执行既有 release `--commit`。
5. 每次 commit 后更新预审 released 状态并运行 `--phase=verify --online`；两个都完成后运行 `audit-delayed-candidate-release.ts --phase=released`，核对唯一实体、完整双语正文、真实媒体、noindex、自 canonical 与 sitemap 排除。
6. Lovable 至少观察 7–14 天，Midjourney 成熟工具观察不少于 48–72 小时；仅代表可进入独立索引评审，不批准 `continue_index`，不自动增加 sitemap。

扩展回读时曾出现一次日期断言失败（退出 1）：pg 将 DATE 转为本地 Date 后，再按 UTC 格式化导致显示前一天。已改为 SQL `next_review_date::text`，最终两个 rollback 均退出 0，完整 `en/zh/cn` 与 2026-10-14 回读通过；事后只读查询确认两者仍为 0 条实体，sitemap 字节哈希与基线一致。该失败已保留在测试记录，不是一次生产提交。

本地 production server 的四个图片响应均为 200、正确图片类型且与源文件哈希一致，见 `local-media.json`；它不能替代生产素材门禁或未发布工具的真实页面验收。

首轮交付时生产 commit 数为 0；该历史记录不等于当前执行状态。


## 生产执行与阻断修复（09-14）

- 四项线上媒体图片类型及 SHA256 与本地一致，见 `publication/production-media.json`。
- Lovable 重新逐项 validate、preflight、rollback 均退出 0；独立 `--commit` 于 `2026-09-14T03:14:21.572Z` 成功，唯一实体 ID `8fee5c8b-f284-41d4-b691-c099e5bb230b`。事务回读完整 en/zh/cn、features、媒体和 `nextReviewDate=2026-10-14`；实际发布日期记录为 09-14，索引状态保持 monitor。
- 统一发布器 online verify 退出 0。增强 released audit 去除 script/style/noscript 后比较真实 DOM，确认双语完整 Markdown、简介和图片均正确；同时发现 Card 的 7 条限制仅前 2 条可见。`publication/lovable-released.json` 保留退出 1 的真实报告，不能当作最终通过。
- 根因是详情页 `visibleDecisionRisks` 固定 `.slice(0, 2)`。本候选移除截断，完整展示已复核限制。审计保留每一条 audience、比较维度和限制的断言，并增强唯一 ID、完整 features、三语言标题正文、媒体字段和复查日比较；支持逐候选核验，避免先发布第二项才发现第一项的问题。
- 发布测试改用独立临时未发布样本验证日期/媒体阻断，不修改真实预审文件，不读取生产环境文件，数据库地址固定为无效本地地址；另对真实 released 记录检查实际日期、monitor/sitemap 状态和重复提交拦截。
- Lovable 提交后全站索引一致性及 production SEO smoke 均退出 0：57 条实体、45 条 published、13 条可索引；sitemap 116 条/26 个工具 URL；重复、遗漏、越界和 45 项页面检查问题均为 0。
- 已按总控“任一门禁失败立即停止第二个提交”执行，Midjourney 未写入。待总控部署本次页面修复后，先重跑 Lovable 全量线上审计；通过后再重新逐个执行 Midjourney validate/preflight/rollback、独立 commit 与完整回读，最后更新两项实际发布状态及最终全站验收。

本阶段证据位于 `reports/releases/2026-09-14/publication/`，每条命令记录独立退出码、时间和原始日志。本开发任务未推 main、未部署。

修复候选验证：专项测试、脚本 scoped ESLint、串行 TypeScript 和完整 build 已通过；构建后本地 `http://127.0.0.1:3108` 的 Lovable 中英文全量审计退出 0，完整正文、所有 Card 项目及媒体匹配，见 `publication/lovable-local-fixed.json`。此本地证明不替代尚待部署后的生产全量验收。

额外构建后 sitemap 全页验证退出 0：116/116 URL 的状态、robots、自 canonical 和精确三项 hreflang 全通过，含全部 36 个 guide URL。首次调用因本地服务未启动出现连接拒绝，启动服务后完整重跑通过；历史失败未删除。汇总见 `publication/checks.json`。
