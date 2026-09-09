# 收录与搜索质量主计划

更新时间：2026-09-08

执行状态：进行中；索引保护及本周可证实历史补账完成，本周至少 12 次放行、剩余额度 0，新增索引批准保持暂停。

当前范围：SEO 收录、搜索可见性、核心页面质量与真实编辑信号。产品分发/外链工作台暂不作为本轮执行目标，保留代码与数据，并
已隐藏公开导航、价格页和后台侧栏入口；相关历史方案已移至 `docs/archive/`。

四周实施排期见 [证据驱动目录优化计划](./FOUR_WEEK_EVIDENCE_LED_DIRECTORY_PLAN_CN.md)。

当前收尾执行见 [质量收尾与状态校正子方案](./QUALITY_CLOSEOUT_IMPLEMENTATION_2026-09-04_CN.md)，不是新主线。四周一级任务
10/13完成（76.9%）；持续运营、内容覆盖、生产验收与效果验证分别统计。

2026-09-06 RC-07 第一组完成 4/17：OpenAI 家族历史记录已按公司、API 模型、桌面入口和停服产品分别纠偏，移除非官方安装包及
无依据旧声明，统一官方入口并设为 `monitor`。数据库回读与缺排期 19 -> 15 已确认，专项测试、类型检查、完整 build 及中英文
生产 smoke 通过，部署提交 `b0dac6aa`。详见 [专项记录](./OPENAI_FAMILY_LEGACY_SCOPE_CLOSEOUT_2026-09-06_CN.md)。

RC-07 第二组完成后进度 8/17：Character.AI、Shutterstock GenAI、Suno、Viggle 已完成官方事实范围、双语决策正文、静态
fallback 和数据库同步，均保留原索引批准并于 2026-09-20 复查；没有伪造独立实测或市场评分。数据库回读确认缺排期 15 ->
11；Suno 大小写 slug 已安全归一为 `suno_ai`，专项测试、类型检查和完整 build 通过，代码待提交部署。

RC-07 第三组完成后进度 14/17：ArtiverseHub AI、FastImage、HoneyDo、Shop、Tattoo AI Design、Woy.ai 已纠正对象/旧文案并转
`monitor`，缺排期 11 -> 5；只剩3条安全/合规对象，Adobe/Salesforce 2条另属RC-05C。完整 build 与数据库幂等回读通过。

RC-07 已于 2026-09-06 完成 17/17：最后三条安全/合规对象不做流量或转化增强。`aigirl-best` 与 `undressing_ai` 归
档，`anime-girl-studio` 纠正旧范围后转 `monitor`；三条统一绕过普通工具评分、推荐、CTA 和 `SoftwareApplication` schema，
并退出 sitemap。生产数据库固定记录保护、dry-run、正式事务、独立回读、专项测试、TypeScript 检查与完整 build 均通过。缺排
期 5 -> 2，余下仅 Adobe/Salesforce Einstein，转回 RC-05C 处理。该段记录 09-06 阶段快照；两条随后补齐排期，并已于 09-08
完成范围、证据与索引处置，当前状态以本页后文的 RC-05 完成记录为准。

RC-08 已完成分类事实边界和 MON 运行审计：分类页不再把框架复核日期表达成全分类工具事实核验，代表工具卡只承担导航理由；价
格、功能、限制、证据日期和判断状态统一回到工具详情页。生产 MON 审计确认事实日历 1 个到期、11 个已排期；Gamma 已用当前官
方文档建立首条证据型判断基线；Luma Dream Machine 随后根据官方授权、credits、订阅/API 分离与 Modify 文档完成同类基线；n8n
再依据官方执行计费、Community Edition、Sustainable Use License 与 queue mode 文档完成同类基线；OpenRouter 又依据官方路
由、供应商日志、ZDR 和定价页完成同类基线；Runway 再根据官方 credits、商业使用权、Creative/API 分离与 Studio 编辑文档完成
同类基线。Dune在修复Supabase情报档案与Neon目录孤立后，保持`monitor/noindex`并依据官方产品边界、SQL工作流、新鲜度与成本模
型完成判断基线；The Graph最后依据官方产品边界、网络支持、API key安全与查询计费完成同类基线。这些证据型记录均明确不是亲手
试用。工具判断范围现为10/10并已收口；站点和分发项目保留30天事实复核，但不适用工具专属的90天选型判断。后台默认Tools范围，
并保留Site evidence、Distribution history和All profiles历史入口，不删除证据。MON 被明确为页面加载时计算的人工编辑日历，
仓库没有自动情报同步 workflow，不能宣称自主抓取持续运行。历史 Stack/Trial 空表基线已由 2026-09-06 的首个真实 Codex Stack
与 7 天 Trial 打破；RC-08 已进入真实观察期，仍需完成全部检查项和最终决策后才能关闭。

2026-09-06 RC-08 真实 Trial 前置已完成：Codex 已按“AI 编码代理”而非 OpenAI 公司或单一模型建立受控目录记录，附官方来源、
双语边界和 5 项 7 天试用模板。该记录保持 `published + monitor + noindex`，不进入 sitemap，也不计作新的索引放行；Trial 页面选择
Codex 后会自动载入可编辑的目标与检查项。生产事务写入、独立回读、专项测试、TypeScript 与完整 build 均通过。剩余动作必须由
真实登录用户开始并完成 7 天 Trial，记录实际检查结果及 Keep/Compare/Cancel 决策；真实 Trial 已于北京时间 2026-09-06
16:26 启动，预计 2026-09-13 16:26 到期，当前 5/5 检查项待观察。在最终决策写入前 RC-08 不标完成；其本身不改变四周一级
任务统计，后续 W2-02 首批 14 条收口完成后四周比例已更新为 10/13。

2026-09-06 真实验收发现 Trial 曾允许在观察期第 1 天提前写入 5/5 结果和 `keep`，因此该记录只能证明流程可用，不能作为完整
7 天使用证据，RC-08 继续保持观察中。完成动作现增加三层约束：服务端校验 `ends_at`、更新语句再次限定到期时间、页面在到期前
禁用最终决定并显示开放时间；检查项仍可在观察期内持续记录。专项边界测试覆盖到期前、精确到期和到期后三种情况。现有提前完成
记录不被静默改写，需单独校正后在 2026-09-13 16:26 或之后提交最终决定。

用户确认后，提前完成记录已恢复为 `active + undecided`，5 项 `pass` 结果完整保留。同期完成 LNK-01 全量收口：线上24个分类代表
工具入口均为200，现统一直达工具页 `#decision-card`；18个可索引Guide、8个人工关系源和分类易变事实禁复制规则通过自动验收。
这不会新增页面、修改 sitemap 或放开索引；RC-08 当前只等待9月13日到期后的真实最终决定。

RC-01至RC-04首轮治理已完成：状态校正、结构化内链测试与计划一致性守卫、生产只读19项缺排期回查均已执行；专项测试及完整
build通过。该段是首轮阶段快照，当时没有完成新的工具核验、四周比例不增加；其后 RC-05 已按事实纠偏并完成索引处置，不直接迁
移到不同产品身份。

2026-09-04 日常收录更新：W2-02B 累计处理 12/7-14，今日完成 OpenRouter 与 n8n 两条既有 fallback 的生产实体迁移，均保留原
canonical。两者线上验收均已通过；n8n 提交 `37ceb6d2` 已获 Vercel 部署成功确认，双语 index/canonical/新正文和 sitemap 生
产验收通过。今日达到 2 条上限，不再新增第 3 条。累计处理数不是每日公开数。

2026-09-06 日常收录更新：W2-02B 累计处理 13/7-14。四个开发者入口此前指向 `/ai/github-copilot`，但该路径只有自动 fallback，
而既有 `copilot` 实体实际代表 Microsoft Copilot，形成产品身份冲突。现已将 GitHub Copilot 建为独立生产实体，补齐当前套餐与
AI Credits、IDE/Agent 工作流、内容排除边界、Stack Overflow 调查和独立评价证据，市场验证为 `97/100 / Validated`。生产回读
确认 `published + monitor + noindex`，下次复查 2026-09-20；本周索引额度仍为 0，不进入 sitemap。专项内容、身份链接、
TypeScript、数据库 rollback/commit/status 与完整 build 均通过，提交 `33f831ca` 已部署并完成双语生产验收。

2026-09-06 W2-02 首批收口完成：NotebookLM 作为第 14 条，将站内已有 `/ai/notebooklm` 空壳 fallback 转为独立生产实体。旧种子
的“完全免费”口径已纠正为 Standard 与 Google AI Plus/Pro/Ultra 并存的 freemium 边界；补齐来源额度、账号级数据处理、引用准确
性、资料质量和开放网页发现边界，市场验证为 `90/100 / Validated`。生产回读为 `published + monitor + noindex`，复查日
2026-09-20，不进入 sitemap。W2-02B 达到 14/14 并完成，四周一级任务更新为 10/13（76.9%）；后续候选处理转为持续运营。

差异化、证据账本、变化追踪与商业化触发条件见
[AI 工具决策平台差异化与商业化实施路线图](./EVIDENCE_DECISION_PLATFORM_ROADMAP_CN.md)。

### 当前维护优先级（更新至 2026-09-09）

2026-09-07 持续收录准备：已建立 [下周成熟工具候选与发布节奏](./NEXT_WEEK_MATURE_TOOL_INTAKE_2026-09-07_CN.md)。候选顺序为
Synthesia、Replit、Otter.ai、Lovable 与 Midjourney；五个候选均已完成结构化预审与生产查重。Synthesia 与 Replit 已分别在
09-08、09-09 通过当日门禁并以 `monitor/noindex` 发布。下一槽为 Otter.ai，已完成查重、双 fallback 风险审计和结构化预审，最
早排在 2026-09-10；发布前必须把 `/ai/otter` 收口到唯一 `/ai/otter-ai` canonical。当前
Lovable 的旧双余额冲突也已通过实时官方文档解决：当前为 Build/Cloud/AI 统一 credits，旧口径仅作历史或过渡账户提示；其预审
最早排在 2026-09-11。Midjourney 的价格、GPU 计费、Web/Discord、编辑、视频、默认公开、Stealth 与商业权利边界已补齐，最早
排在 2026-09-12。当前没有配置 DataForSEO，因
此不伪造搜索量；审核可以并行，但公开默认每天 1 个，全部先
`monitor / noindex`，索引仍需单独批准。准备阶段没有写生产；后续 Synthesia/Replit 的独立发布也没有改变 sitemap，四周一级
进度仍为 10/13（76.9%）。

2026-09-07 发布与索引防回退：已完成五候选统一发布流水线和首轮全站索引一致性审计。流水线将预审、生产查重、发布载荷、事务
回滚/提交和发布后页面验收统一，但首次发布固定为 `published + monitor`，不能自动批准索引；命令级测试确认日期和缺失载荷会
阻断。生产只读审计覆盖 52 条数据库记录、41 个 published 工具及其 82 个中英文页面：15 个允许索引工具与 sitemap 30 个工具
URL 完全一致，遗漏、越界、重复、canonical 和 robots 冲突均为 0；sitemap 总数仍为 138。本项不依赖 GSC、没有生产写入，四周
一级进度保持 10/13。

2026-09-08 持续收录执行：Synthesia 已完成发布日事实复核，价格更新为 Basic `$0/月`、Starter `$29/月`、Creator `$89/月`，并
补齐共享 credits、license 自动升级、数字人同意及 API 账号/限额边界。生产发布先通过事务 rollback 演练，再显式 commit 并回读为
`published + monitor`；索引审批保持关闭，双语页面继续 noindex 且不进入 sitemap。统一流水线同时补齐 released/monitor 状态契约，
避免数据库发布成功后验证器仍按未发布状态运行。该项属于 W2-02F 持续运营，不提高四周一级进度，仍为 10/13（76.9%）。

2026-09-09 持续收录执行：Replit 已重新核对当天官方价格、Starter/Core/Pro 权益、effort-based Agent 计费、共享云 credits、
Starter 发布限制和用量延迟。生产查重、在线 fallback、事务 rollback、完整 build 和显式 commit 通过，固定实体发布为
`published + monitor`，复查日 2026-10-09；不批准索引、不进入 sitemap。09-08 的准备快照保留为发布前证据，不冒充发布日事实。

RC-05 已完成：Adobe/Salesforce 的范围正文、列表/静态兜底、metadata、数据库原文及生产页面已统一，通用价格/评分/比较卡、单
软件 schema 和等价替代暗示均已撤下。2026-09-08 RC-05C 又确认两个 canonical 未进入最近 GSC Top Pages，但未把缺行写成 0
流量；结合对象身份与独立证据，两条固定记录已从 `continue_index` 转为 `monitor/noindex`，复查日 2026-10-08。历史 URL 保留，
不错误重定向到 Firefly/Agentforce；comparison 继续 noindex。见 [本轮范围澄清](./LEGACY_PRODUCT_SCOPE_CLARIFICATION_2026-09-04_CN.md)，
本项是质量子方案收口，四周一级比例仍为 10/13（76.9%）。

全站导航修复：已确认重复语言前缀不限于工具页，个人中心和提交表单同类入口也受影响；共享 Link、旧地址修复及安全登录回跳已
实现，77 个源码文件检查、182 页/5,406 处内部链接扫描、完整 build 和中文正文登录点击通过。实现提交 `4c3e01a1`；验收边界见
[全站导航审计](./LOCALIZED_NAVIGATION_AUDIT_2026-09-04_CN.md)，未修改生产数据或索引策略。

对象复核最终状态：Adobe/Salesforce 的数据库查重、静态引用、线上页面、GSC Top Pages 口径和独立证据均已复核；未建立
Firefly/Agentforce 独立 tools 记录，也未错误迁移身份。两条历史范围页现为 `monitor/noindex`，已退出 sitemap，2026-10-08
复查；完整决策见 [范围澄清实施](./LEGACY_PRODUCT_SCOPE_CLARIFICATION_2026-09-04_CN.md)。附带发现的重复语言前缀已由独立修复
`373d2336` 部署及生产验收关闭，不再列作待修项。

最新准入口径：以 [唯一收录规范](./BEST_DIRECTORY_POSITIONING_AND_INTAKE_CN.md) 的对象类型及八项门槛为准，品牌/流量/付费/
完整度分数不能替代准入；公开、索引与推荐分开。Adobe、Salesforce Einstein 未通过独立产品身份准入，已按历史范围页隔离；
未来 Firefly/Agentforce 必须以独立实体重新走资料、市场和索引门禁，不能继承旧页批准或信号。

维护审计、数据库字段缺口和排期明细见 [本轮维护审计](./MAINTENANCE_AUDIT_2026-09-04_CN.md)。

Gamma 验收补充：`33e65beb` 部署成功后发现新简版提示被官方快照去重逻辑隐藏，随后已修复实际展示分支，复用统一文案并新增
双语实际 HTML 验收。官方事实复核与 CHG-02 基线均已完成；未做的仅是账户结账和导出实操，不能把该实操缺口表述为整页事实
复核仍在进行。具体说明见 [历史核对及维护记录](./INDEX_HISTORY_RECONCILIATION_2026-09-04_CN.md)。

- P0：统一数据库保护已应用生产，提交 `9fa46afc` 的 Vercel 部署已确认成功。已补记 9 月 1 日十次可证实迁移，与 9 月 4 日两
  次合计至少 12 次，本周剩余额度 0；完整旧历史仍有未知部分，不伪造日期、不自动恢复批准。补账幂等/事务回滚及工具行不变断
  言通过。详见
  [历史核对](./INDEX_HISTORY_RECONCILIATION_2026-09-04_CN.md)、[保护运行说明](./INDEX_RELEASE_GUARD_RUNBOOK_CN.md)。
- P0：本轮生产 SEO、health 和 ads.txt 只读审计通过；sitemap 162 URLs。另修复 SEO smoke 重定向请求无超时/未释放响应体的问
  题，重跑断言全部通过且退出 0。
- P1：Consensus、Gamma 到期复核已于 9 月 6 日提前完成。Consensus 当前套餐、语料、全文与 Deep Review 事实和生产正文一致，
  记录为 `reviewed_no_change`；Gamma 根据新版官方导出文档纠正 PPTX 字体归因，并补默认可编辑表格与圆角回退边界。两页继续
  `monitor/noindex`，下次事实复查为 10 月 6 日；独立论文验证码与 Gamma 实际结账金额缺口保留，不重置市场验证。详见
  [本轮维护](./CONSENSUS_GAMMA_MAINTENANCE_2026-09-04_CN.md)。
- P1：Emdash 已依既有 9 月 1 日核验 +30 天补齐生产复查日期 10 月 1 日；未改正文、验证日期或索引状态。缺排期从 23 降为
  22 是该阶段历史快照；后续对象复核与安全收口已将缺排期降至 0，未用补日期冒充事实核验。分类与完整执行记录见
  [历史工具排期审计](./LEGACY_TOOL_REVIEW_SCHEDULE_AUDIT_2026-09-04_CN.md)。MAINT-04 与 MAINT-05 均已完成；Adobe、Salesforce
  Einstein 的 URL/索引处置也已由 RC-05C 于 09-08 关闭，不再归入排期补齐任务。
- P1：CHG-02 已完成10/10。Fathom、Claude、Consensus、Gamma、Luma Dream Machine、n8n、OpenRouter、Runway、Dune、The Graph
  均有真实幂等`fact`基线；The Graph以官网产品名和定位完成最后一条。基线主锚点固定按产品名、官网定位、其他事实排序，同步
  脚本统一从Supabase验证工具owner，提取器限制站点身份只取首页并拦截假套餐。ElevenLabs/Descript/Perplexity/Make按robots停
  止，QuillBot证据为空、Poe证据过薄，均未用于凑数。
- P1：Gemini 既有页面官方事实维护完成，修正手机入口误导及中文复制英文，补访问/额度/隐私边界与来源；下次复查9月18日。当时
  缺排期22→21，本地与线上双语验收通过，sitemap仍162，无新增索引批准或市场评分。详见
  [Gemini维护](./GEMINI_MAINTENANCE_2026-09-04_CN.md)。其后的Notion、Poe维护也已完成，不再重复排入待办。
- P1 最新：Notion、Poe 本轮官方事实维护完成2/2，修复中文复制英文及Poe移动端/保密错误，补使用边界与试用检查；下次均为9月
  18日。四个语言页本地及生产验收通过，缺排期21→19，sitemap仍162；未新增索引批准或市场评分。详见
  [Notion/Poe维护](./NOTION_POE_MAINTENANCE_2026-09-04_CN.md)。这里的缺排期数字是当批历史快照；Adobe/Salesforce 后续范围、
  独立证据和索引决策均已在 RC-05C 关闭。
- P1 最新：Perplexity 与 Make 的到期前官方事实维护已完成本地核验。Perplexity 明确展示官方 Free Pro Search 3次/5次冲突，
  并补网页订阅、API 与 Computer credits 的独立边界；Make 的 credits、AI 双重成本、数据区域与 webhook 队列事实无变化。两条
  均保留 `monitor/noindex`，下次复查 10 月 6 日，不刷新市场验证或冒充实测。提交 `b75b1637` 已部署，8 个中英文维护页与
  全站 SEO smoke 均通过，sitemap 保持 138。执行记录见
  [Perplexity/Make维护](./PERPLEXITY_MAKE_MAINTENANCE_2026-09-06_CN.md)。
- 数据依赖：下一次同期 GSC 7 天、28 天与 Coverage；真实 owner/评论/Stack/Trial 信号需用户实际使用，不能由 AI 编造。

新决策能力的字段级实施、自动验收和 SEO 架构边界分别见：
[三阶段实施方案](./DECISION_PLATFORM_THREE_PHASE_IMPLEMENTATION_CN.md)、
[自动化测试与发布验收](./DECISION_PLATFORM_AUTOMATED_ACCEPTANCE_CN.md)、
[SEO 信息架构与不可回退规则](./SEO_INFORMATION_ARCHITECTURE_GUARDRAILS_CN.md)。

## 目标与边界

目标不是增加页面数量，而是在 6 周内验证以下链路：Google 能稳定理解 `AI Best Tool` 是一个可信的 AI 工具目录；目录意图从首
页逐步扩展到少量分类、指南和详情页；有展示的页面能获得更好的排名和点击。

以下行为在本轮冻结：

- 不批量新增同义 guide、comparison 或 alternatives URL。每天新增并公开 1-2 个合格工具，但新工具默认
  `monitor / noindex`；每天最多批准 1 个、每周最多 5 个进入索引。只有同时通过资料完整度、独立市场验证和索引复核的条目才
  进入 sitemap，详见 [工具页索引发布与节奏控制](./TOOL_INDEX_RELEASE_POLICY_CN.md)。
- 不为了“更新日期”批量改写内容；每次更新必须对应真实来源、编辑核查或用户反馈。
- 不把外链数量作为 SEO 成功指标；分发模块只保留维护，不继续扩功能或执行站外投放。

## 2026-08-31 GSC 基线

数据窗口：性能报告 2026-08-01 至 2026-08-28；Coverage 图表最新可见点为 2026-08-21。

| 指标                 |    当前值 |           相比 2026-08-03 | 解读                                             |
| -------------------- | --------: | ------------------------: | ------------------------------------------------ |
| 28 天展示            |     2,243 |              147 -> 2,243 | 明显恢复，但不能等同于全站恢复                   |
| 28 天点击            |        13 |                   0 -> 13 | 已出现真实点击                                   |
| CTR                  |     0.58% |               0% -> 0.58% | 仍偏低，优先做 snippet 与意图匹配                |
| 加权平均排名         |     32.07 |            62.59 -> 32.07 | 可见性质量显著改善                               |
| 最近 14 天展示       |     2,155 |                         - | 占 28 天约 96%，增长发生在窗口后半段             |
| 最近 7 天展示 / 点击 | 1,340 / 8 |                         - | 已不是纯观察阶段                                 |
| 已索引 URL           |       167 | 约 140（8 月中旬） -> 167 | 有回升，但仍需小规模、强质量索引面               |
| `noindex` 排除       |     1,115 |              603 -> 1,115 | 主要是主动收口；禁止因为该数值而批量取消 noindex |
| 已抓取未编入索引     |        24 |                  19 -> 24 | 小规模质量/重复排查对象                          |

核心判断：增长高度集中在首页。首页占 1,838 / 2,243 展示（约 82%）；主要 query 仍是
`ai tools directory`、`ai tool directory`、`ai top tools` 等目录意图。因此下一轮以“首页承接、站内分流、少数机会页做深”为
主，不扩张 URL 总量。

## 已完成能力

| 优先级 | 已完成项                                                   | 当前价值                                 |
| ------ | ---------------------------------------------------------- | ---------------------------------------- |
| P0     | robots、sitemap、canonical、www/http 重定向与 noindex 收口 | 搜索引擎只看到明确的公开 URL 集合        |
| P0     | comparison / alias 弱页批量收口                            | 减少重复与模板化索引噪音                 |
| P0     | 页面质量状态、下次复查、GSC 台账                           | 能追踪每个索引决策，不依赖记忆           |
| P1     | 首页、Explore、主要分类、Guide、核心详情页的任务与决策信息 | 从纯列表转为可帮助用户选择的入口         |
| P1     | 33 个核心页技术/真实信号审计，16 个机会工具官方证据块      | 页面可展示来源、核查日期、价格或限制边界 |
| P1     | 评论、认领、更新请求入口                                   | 为非 AI 增量内容留出入口                 |
| P2     | Pricing、Submit、Claim、漏斗埋点                           | 商业承接基础仍可用，但本轮不扩展         |

## 当前执行队列

### P0：保护索引面并修复异常（第 1-2 周）

| ID     | 任务                                            | 验收标准                                                                                                        | 状态                                   | 负责人       |
| ------ | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ------------ |
| IDX-01 | 更新 GSC 周度台账与基线                         | 已写入本次 28 天、7 天、Coverage 和结论                                                                         | 已完成                                 | Codex        |
| IDX-02 | 核对 24 个“已抓取未编入索引”URL                 | 已完成逐条分类，详见 [Coverage URL 审计](./COVERAGE_URL_AUDIT_2026-08-31_CN.md)；不做盲目 Request Indexing      | 已完成                                 | Codex        |
| IDX-03 | 核对 22 个软 404 与 4 个未指定 canonical 重复页 | `how-to-choose-ai-tools` 的英文 canonical 已统一；软 404 URL 明细尚未导出，收到后逐条决定 404、合并或补实质内容 | 进行中                                 | Codex        |
| IDX-04 | 每周生产 SEO smoke                              | 首页、Explore、核心详情、robots、sitemap、canonical 均通过                                                      | 持续                                   | Codex        |
| IDX-05 | 索引准入门槛持续执行                            | 所有新 URL 均通过 [SEO 内容准入清单](./SEO_CONTENT_CHECKLIST.md)                                                | 持续                                   | 共同         |
| IDX-06 | 高质量收录候选池与 "Best Decision Card"         | 首批 10 个成熟工具缺口全部完成实体迁移、合并或决策信号收口；未新增 canonical URL，下一批必须等待 W4 数据触发    | 已完成（成熟工具队列 10/10）           | Codex + 用户 |
| IDX-07 | 四周证据驱动目录计划                            | 第 1-3 周开发项已完成；W4 三期 GSC 决策报告已实现，等待同期数据验证后执行扩大或收口                             | 进行中（W4）                           | Codex + 用户 |
| IDX-08 | 工具页发布与索引解耦                            | `page_quality_status` 同时控制 robots 与 sitemap；新工具默认 monitor；每天最多放开 1 个、每周 5 个              | 已完成；首批逐日复核队列执行中         | Codex        |
| POS-01 | SEO 安全的差异化表达                            | 保留 AI 工具目录主题、索引与结构化数据；首页突出证据、限制和变化，商业入口不干扰编辑判断                        | 已完成；专项测试、tsc、完整 build 通过 | Codex        |

### P1：让已获得展示的页面变成更可点击的答案（第 2-4 周）

| ID     | 任务                               | 优先页面 / 查询意图                                                                                | 验收标准                                                                                                                                         | 状态            | 负责人       |
| ------ | ---------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | --------------- | ------------ |
| CTR-01 | 首页标题、描述、首屏与 schema 复核 | `ai tools directory`、`ai tool directory`、`ai top tools`                                          | 文案已与目录词和可见内容一致；英文 canonical 首页已补 WebSite/SearchAction schema                                                                | 已完成          | Codex        |
| CTR-02 | 首页 -> Explore -> 分类的分流审计  | 目录通用词                                                                                         | 14 个机会详情页已补证据驱动 fallback，5 个无数据库记录的分类入口已改为虚拟决策中心；生产严格审计 33/33、官方事实块 16/16 通过                    | 已完成          | Codex        |
| CTR-03 | 强化已有展示的 Guide               | Web3、Automation、Research                                                                         | 三页均已补 3 条任务、适用边界、核验风险和直达工具 Decision Card 的路径；提交 `de1504e6`                                                          | 已完成          | Codex        |
| CTR-04 | 强化已有展示的详情页               | Fathom、Anthropic、DeepL、Gamma、Lindy、Cursor、The Graph                                          | 每页保留至少两个官方来源和一个真实选择限制；禁止通用 AI 改写                                                                                     | 已完成          | Codex        |
| CTR-05 | 真实编辑/owner 信号回填            | 本轮先选 5 页                                                                                      | 每页至少一条有来源的更新、纠错、owner 补充或真实使用记录                                                                                         | 需要数据        | 用户 + Codex |
| CTR-06 | 首批成熟工具内容缺口               | Claude/Anthropic、Fathom、Gamma、Consensus、DeepL、Runway、Luma AI、Pipedream、Cursor、The Graph   | 10 个既有 canonical URL 已完成合并、数据库迁移或决策内容增强，全程未新增 canonical URL                                                           | 已完成（10/10） | Codex        |
| EVD-01 | Evidence Ledger 数据模型           | 所有 claim 统一来源类型、核查状态、复查日、冲突和失效边界；机器提取不自动成为已核验事实            | 已完成；Supabase 迁移、只读验收、专项测试和 build 通过                                                                                           | Codex + 用户    |
| EVD-02 | 工具页 Evidence Ledger UI          | Decision Card 后可展开核对已验证 claim；候选证据不公开，不以单一分数代替解释                       | 已完成；有效工具身份产生 verified 数据后自动展示                                                                                                 | Codex           |
| EVD-03 | 后台证据编辑与冲突处理             | 状态受控流转；冲突不自动覆盖；核验人、日期、复查、失效和适用范围可追踪；所有保存操作有中间态       | 已完成；首条真实人工核验已回读确认，专项测试、tsc、完整 build 通过                                                                               | Codex           |
| EVD-04 | 情报档案身份映射收口               | `tool` 类型 owner_id 必须对应目录真实工具；存量错误身份重新归类后再公开                            | 已完成；site 迁移、3 个档案缓存重算、Fathom 真实 UUID -> verified -> 生产公开链路全部通过                                                        | Codex + 用户    |
| CHG-01 | Change Timeline 模型与读取         | 正式历史与机器待审差异分离；事实变化与“复核无变化”分开；公开只读数据仅来自真实 tool 和 public 事件 | 已完成；迁移可读，受控写入、后台/工具页读取、专项测试和类型检查均通过                                                                            | Codex + 用户    |
| CHG-02 | 首批核心工具变化基线               | 10-20 个核心工具拥有真实基线复核；没有变化时只记录 `reviewed_no_change`，禁止伪造变化              | 已完成（10/10）；Fathom、Claude、Consensus、Gamma、Luma Dream Machine、n8n、OpenRouter、Runway、Dune、The Graph 均完成真实基线                   | Codex + 用户    |
| SEO-IA | SEO 信息架构统一与门禁             | 修复历史 canonical/hreflang，统一 Breadcrumb，并让工具关系内链只消费 reviewed 数据                 | SEO-IA-01~08 已完成；本地/生产 smoke、完整 build 和 reviewed 关系验收全部通过                                                                    | Codex           |
| DCF    | Finder + Decision Card 2.0         | 10 个核心工具和 6-8 个任务形成证据可追溯、最多三项的可解释推荐                                     | DCF-01~07 已完成：数据、证据、规则、前台、后台审核、SEO 与自动发布门禁全部闭环                                                                   | Codex           |
| STK    | Stack Audit + 7-Day Trial          | 私有工具栈、Keep/Replace/Remove/Missing 与试用到期决策闭环                                         | 已完成（6/6）；双用户真实 RLS、匿名边界、service-only 审计输出、私有路由 noindex/sitemap 排除、生产 smoke、持续监控、类型检查与完整 build 均通过 | Codex           |
| SIG    | Verified Usage + Change Watch      | 审核后的结构化使用信号和已确认变化通知，不公开低样本或利益相关数据                                 | 等待阶段二真实使用门槛；SIG/WAT 未开始                                                                                                           | Codex + 用户    |

### P2：只在数据证明后扩展（第 4-6 周）

| ID     | 触发条件                                                         | 动作                                       | 状态     |
| ------ | ---------------------------------------------------------------- | ------------------------------------------ | -------- |
| EXP-01 | 非首页展示占比连续两周提升，且至少 3 个非首页页面各有 >= 20 展示 | 从同一意图簇增加 1 个高质量 hub 或深度页面 | 未触发   |
| EXP-02 | 既有页面连续两轮无展示，且审计确认无独立意图                     | 合并、canonical 或 noindex，不新增替代页面 | 条件触发 |
| EXP-03 | 有真实评论/owner 更新/产品事实且页面已出现 query 信号            | 将该页列入下一批证据增强，不超过 5 页      | 条件触发 |

## 每周复盘指标

每周同一时间导出 7 天和 28 天 GSC 数据，记录：总展示/点击/CTR/排名、首页与非首页展示占比、产生展示的页面数、Top 20
query、Top 20 page、已抓取未编入索引与软 404 数量。

成功不只看总展示。第一个阶段的合格信号是：非首页展示从约 18% 上升、至少 3 个非首页页各获得 20+ 展示、首页目录词 CTR 稳定
提升；第二阶段才看点击和转化。

## 历史方案

- 2026-08-10 及之前的总控、60 天商业、竞品研究、分发与产品证据方案均在 `docs/archive/` 保留，供追溯，不再作为本轮排期依
  据。
- 本轮唯一的执行依据是本文
  件、[四周证据驱动目录计划](./FOUR_WEEK_EVIDENCE_LED_DIRECTORY_PLAN_CN.md)、[GSC 周度观察台账](./GSC_WEEKLY_OBSERVATION_LOG_CN.md)、[Coverage URL 审计](./COVERAGE_URL_AUDIT_2026-08-31_CN.md)、[SEO 内容准入清单](./SEO_CONTENT_CHECKLIST.md)、[核心页面信号审计](./PRIORITY_PAGE_SIGNAL_AUDIT_CN.md)
  与 [重点工具详情说明](./PRIORITY_TOOL_DETAIL_PLAYBOOK_CN.md)。
