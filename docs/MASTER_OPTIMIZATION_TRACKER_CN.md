# 优化总控任务表

更新时间：2026-08-10

这份文档把当前所有优化内容合并成一份可追踪、可监测、可复盘的总任务表。

保留原有三份子计划作为执行说明：

- [60 天商业主线](./AI_TOOL_SITE_60_DAY_EXECUTION_PLAN_CN.md)
- [SEO 质量恢复与真实内容增长](./SEO_QUALITY_RECOVERY_TASKS_CN.md)
- [竞品研究与下一步优化方案](./COMPETITOR_RESEARCH_AND_NEXT_OPTIMIZATION_CN.md)
- [平台产品、定价与 Stripe 实施总方案](./PLATFORM_PRODUCT_PRICING_AND_STRIPE_ROADMAP_CN.md)
- [产品证据引擎、高质量内容与智能分发实施总方案](./PRODUCT_INTELLIGENCE_CONTENT_DISTRIBUTION_IMPLEMENTATION_PLAN_CN.md)
- [分发工作台完整收口方案与执行计划](./DISTRIBUTION_WORKSPACE_CLOSURE_PLAN_CN.md)
- [分发工作台 UI 重构最终方案与实施任务表](./DISTRIBUTION_UI_REDESIGN_PLAN_CN.md)

- 2026-08-10：完成分发用户端 UI 重构方案审计并冻结最终执行口径。采用固定 Distribution Layout 与“今天、产品资料、目标机会、执行任务、跟进与监控、结果报告”六项导航；阻塞改为跨阶段覆盖状态，所有页面统一消费 presentation-state selector；短操作统一 pending/success/error，长操作分阶段接入持久化 Action Center。新增 `DUI-001` 至 `DUI-034` 带权重任务表，当前 UI 重构完成度约 94%，`DUI-032`、`DUI-034` 已完成，`DUI-033` 继续执行三产品真实验收。

- 2026-08-04：分发工作台 P1 任务进入执行：`DC-020`（跨产品今日队列）与 `DC-021`（筛选、搜索和阻塞收件箱）功能已在代码面完成，完成分发页筛选面板、跨项目 Top1–3 排序队列和阻塞任务分组；本地 `pnpm run build`、`pnpm run distribution:production-smoke`、`pnpm run seo:production-smoke` 已通过，待生产验收与用户连续运行数据验证。
- 2026-08-04：分发工作台 DC-023「站内通知和邮件摘要」进入实现。已完成站内提醒中心接入任务到期、素材缺失、链接异常与 follow-up 通知，更新文档状态并同步 `pnpm run build`、`pnpm run distribution:production-smoke`、`pnpm run test:distribution-closure` 通过；已进入生产部署前复核。
- 2026-08-04：分发工作台 DC-024「自动 live URL 和链接属性复查接入用户端」功能已完成接入。任务卡片加入 link_status 可视化徽标与用户端「Recheck live URL」入口，支持在输入 live URL 后自动回填、重检并回写状态；同步 `pnpm run build`、`pnpm run distribution:production-smoke`、`pnpm run test:distribution-closure`。
- 2026-08-04：分发工作台 DC-025「用户项目周报」完成前端周报接入。工作台新增站内提醒页与“分发工作空间周报”（完成率、24h/7d排期建议、阻塞优先级），`pnpm run build`、`pnpm run distribution:production-smoke`、`pnpm run test:distribution-closure` 均通过；已待用户验收。  
- 2026-08-04：分发工作台 DC-026「用户反馈反哺目标站规则」在管理员目标页完成阻塞反馈收口。目标页面新增 `Workspace feedback` 块，展示执行端分发记录中的处理原因与来源任务，便于管理员先验后回填规则；`pnpm run build`、`pnpm run distribution:production-smoke`、`pnpm run test:distribution-closure` 均通过。 

说明：

- 2026-08-03：导入最新 GSC 7/28 天数据。28 天曝光由 135 增至 147（+8.9%），点击由 1 降为 0，页面行数仍为 24；新增曝光主要集中在首页，尚不能判断为全站恢复。线上核心信号审计由 20 页扩到 27 页，新增 Research、Voice、Automation、Lindy、Fathom、The Graph、Dune；Explore 已补分类到代表工具的明确路径。新增索引页必须通过 `SEO_CONTENT_CHECKLIST.md` 的准入硬门槛，分发结果必须按 `DISTRIBUTION_PRODUCT_ACCEPTANCE_GUIDE_CN.md` 区分 submitted、live mention 和 verified backlink。
- 2026-08-03：完成首批 GSC 机会工具的官方证据增强。Lindy 页面新增官方套餐、credits 消耗和暂停边界；Fathom 页面新增免费层、会议平台和录制同意边界，均显示 2026-08-03 核查日期和直接官方来源。`seo:priority-page-signals -- --strict` 新增机会页官方来源块检查，防止后续页面调整时退回无来源的 AI 描述。当前仍不新增全新索引 URL，下一批优先继续增强已经有曝光或分类锚点的 canonical 页面。
- 2026-08-03：完成第二批 GSC 机会工具的官方证据增强。The Graph 页面补充 100,000 次免费月查询、超额查询价格、API key 与 `_meta` 新鲜度检查；Dune 页面补充 credits 套餐、成本上限和 raw / decoded / curated 数据刷新差异。严格审计的官方来源门禁由 2 页扩到 4 页；仍坚持先增强已有 canonical 页面，GSC 未满足扩页触发条件前不批量新增 URL。
- 2026-08-03：完成第三批 GSC 机会工具的官方证据增强。Notta 页面补转录分钟、语言覆盖和翻译配额；Runway 页面补 credits、模型成本、商业权利和 Web/API 账户边界；DefiLlama 页面补开源 adapter、TVL 纳入规则与价格波动误读风险。官方证据严格门禁由 4 页扩到 7 页，继续以增强已有页面替代无数据支撑的批量扩页。
- 2026-08-03：完成第四批核心工具官方证据增强。ChatGPT 页面补个人与组织套餐边界、训练开关和 Temporary Chat；Claude 页面补个人套餐价格、动态用量因素和数据导出；Cursor 页面补套餐内 API usage、按量超额与 Privacy Mode 例外。官方证据严格门禁由 7 页扩到 10 页，继续禁止无可靠官方来源的 AI 推断式事实。
- 2026-08-03：完成第五批核心工具官方证据增强。Pipedream 页面补 credits、预算上限、降级停用和数据保留；Perplexity 页面补搜索额度、消费者训练退出与 Enterprise 数据边界；n8n 页面补 execution 计费、Cloud/自托管选择与数据位置。严格审计新增 Pipedream、Perplexity、n8n 路径，官方证据门禁由 10 页扩到 13 页。
- 2026-08-03：完成第六批核心工具官方证据增强。Make 页面补 credits 新计费、AI 双重成本和不可变数据区域；OpenRouter 页面补模型透传价、充值/BYOK 费用和 provider 日志边界；Grammarly 页面补 Pro 价格、生成式提示额度和训练退出。严格审计扩到 33 个核心页面、16 个官方证据页。
- 2026-08-03：根据 Moxion 首次真实验收重构分发工作台的信息层级。首屏现在明确当前步骤、精确缺项、唯一下一动作和完成后的结果；未到阶段的空统计、任务、UTM、归因和渠道手册不再提前展示，已完成素材压缩为摘要。Moxion 当前 `1/5` 会直接提示核对资料、勾选事实确认并保存，完成后才解锁目标网站推荐。
- 2026-08-03：Moxion 完成前两步后发现目标站推荐为空，已确认根因是生产 `DATABASE_URL` 不可解析且异常被静默降级；数据库客户端改为从现有 Postgres/Neon 变量中选择首个有效连接，并在页面区分 registry 故障与无候选。按官方页面重新核验并恢复 SaaSHub、AlternativeTo、Futurepedia，Moxion 实际推荐排序为 100/98/91，下一步进入 SaaSHub 真实提交验收。

- 2026-08-02：确认分发数据边界：具体目标站 registry、规则和快照继续保存在 Neon，用户项目机会、任务、材料包、提醒和归因保存在 Supabase；两边通过稳定 target UUID 和 channel key 映射，禁止创建跨数据库外键。Neon 暂时不可用时推荐区降级为空，不阻断原有项目和任务工作台。

- 上面三个旧文档都已经标记为归档说明
- 当前活跃计划只有这一份总控表
- 后续所有执行、排期、复盘都以本文件为准
- 2026-08-02：完成分发模块用户闭环专项审计。现有目标站情报、渠道任务、文案、归因和复盘组件可以支撑内部试运行，但具体目标
  站尚未接入用户任务，产品事实、素材、目标站专属材料、提醒和用户周报仍未形成无外部工具闭环；新增
  `DISTRIBUTION_WORKSPACE_CLOSURE_PLAN_CN.md`，以 `DC-010` 至 `DC-035` 追踪 P0 数据正确性与真实多产品闭环、P1 无外部管理
  工具体验和 P2 付费团队差异化。历史 `DP/RM` 的已完成状态保留为组件级完成，不再等同于用户旅程已验收。
- 2026-08-02：分发收口第一批代码完成：`DC-010` 修复当前项目任务归属、初始化队列归属以及任务状态/结果写入 owner 边
  界；`DC-011` 新增 project-target、asset、package、event、reminder 兼容迁移与 RLS，并修复迁移 helper 不应覆盖 Supabase
  auth 函数的风险；`DC-012` 完成产品描述、目标、容量、预算和事实确认的基础档案；`DC-014/015` 已把具体目标站推荐、成本与
  人工障碍展示、接受机会和 target-bound task 接入用户工作区；`DC-016` 已先把具体目标站上下文接入任务详情和
  UTM。主迁移已由用户执行并通过 17 项表/字段校验。
- 2026-08-02：分发收口第二批完成：`DC-013` 产品素材中心支持手工保存和导入 Product Intelligence 素材；`DC-016`
  目标站专属材料包已接入目标规则、字段长度、素材缺口、持久化和重新生成；`DC-017` Execution Cockpit 已提供逐字段复制、
  提交入口、阻塞项和执行历史；`DC-018` 已实现提交后 3/7 天、上线后 7/30/90 天复查提醒。新增 execution history RLS
  增量补丁，执行后进入 `DC-019` 三个真实产品端到端验收。
- 2026-08-02：启动 `DC-019`，以 Moxion 作为第一个真实产品验收。新增五步首屏向导、项目切换前置、完成进度、唯一下一动作、
  目标接受前事实确认约束、材料包状态识别和接受后的继续任务入口；UX-01 至 UX-07 已记录在
  `DISTRIBUTION_PRODUCT_ACCEPTANCE_GUIDE_CN.md`，后续验收问题继续在同一文档收口。
- 2026-08-02：完成目录入驻与分发桥接代码：Step 1 对普通用户按提交账号或提交邮箱匹配，对平台管理员按项目与条目官网精确同域
  匹配；可带入待确认资料和候选素材、建立 Product Intelligence 档案关联。新增八类产品类型，动态调整素材
  要求和目标站渠道加分。`20260802_distribution_listing_bridge.sql` 已执行并通过 17 项结构校验，部署后继续 Moxion 验收。
- 2026-07-27：完成高质量内容与智能分发下一阶段的统一需求和技术设计，确定以共享产品证据引擎为底层，先建立可追溯事实，再分
  别驱动工具内容与目标站分发材料；完整任务拆分为 PI/QC/DT/DP/RM/REL 六组，后续执行和验收以
  `PRODUCT_INTELLIGENCE_CONTENT_DISTRIBUTION_IMPLEMENTATION_PLAN_CN.md` 为准。
- 2026-07-27：完成产品证据引擎 Phase 0 及 PI-011：统一证据类型、10 个产品校准集、10 个目标站校准集、七维质量门槛和安全抓
  取器已落地；PI-010 数据迁移脚本已完成但尚未在 Supabase 执行。基础测试、TypeScript 检查和完整生产构建均通过，下一项为
  PI-012 页面发现。
- 2026-07-27：PI-012 页面发现实现完成，可从首页链接、robots/sitemap 和受限常见路径识别关键产品页面，并记录发现来源、页面
  类型和评分；默认限制 sitemap 和候选规模，不遍历整站、不写数据库。下一项为真实站校准及 PI-013 页面类型识别。
- 2026-07-27：PI-012 已用 `aibesttool.com` 完成真实只读校准，首页、定价、更新、开发者入口和 sitemap 均可发现且无抓取警
  告；校准发现链接文案会造成初步类型误判，已明确由 PI-013 结合 URL、metadata 和正文复判，当前结果未写生产库。
- 2026-07-27：用户确认 PI-010 证据表迁移已在 Supabase 执行；PI-013 页面分类器完成并通过线上定价、指南、新增页校
  准，PI-014 确定性证据提取基础完成。真实定价页仅保留可追溯的 Pro `$19/mo` 和 Agency `$49/mo`，校准过程中发现的错误候选
  均未写入数据库。
- 2026-07-27：PI-015 冲突检测与 PI-016 归一化产品档案已完成基础实现，支持对同一 profile 的多来源事实做冲突标记、生成归一
  化快照，并提供同步脚本 `pnpm run intelligence:sync` 作为后续人工验收入口；完整生产构建已通过。
- 2026-07-27：PI-017 后台证据档案页已完成，新增 `/admin/intelligence` 管理页，可按 owner/status 查看 profile、来源、事
  实、资产、冲突与复查时间，并已接入后台导航；当前用于证据审阅与后续人工校准。
- 2026-07-28：PI-018 完成真实站证据防污染校准：同步任务保留失败来源记录但不从非 2xx、非 HTML 或抓取异常页面提取事实；产
  品名优先读取 `og:site_name` / `application-name`，普通内页标题不再被误判为品牌名，500 错误页不会进入冲突。站点全局统一
  输出 `AI Best Tool` 品牌元数据，并补充回归测试。
- 2026-07-28：产品证据真实同步链路完成收口：修复失效 Supabase URL、secret key 兼容、置信度百分制和数据库字段映
  射；`aibesttool.com` 已写入 39 个来源、37 条验证声明和 2 个资产，profile 为 `ready` 且 0 冲突。随后完成 QC-010 七维证
  据质量评分，后台 `/admin/intelligence` 已显示总分、每维依据、发布决策、阻断项和建议动作；随后完成 QC-011
  evidence-bound composer，后台已可查看每个内容块对应的 claim 和来源；接着完成 QC-012 factual gate，已可对无来源或未命中
  成功 source 的事实进行阻断；随后完成 QC-013 uniqueness gate，已可对块间重复与模板化短语进行阻断；随后完成 QC-014 index
  gate，已可输出 draft / noindex / publish 的最终发布门槛；随后完成 QC-015 Collection Queue 增强，队列页已显示本周优先动
  作、导入优先项和分类回填建议；随后完成 QC-016 每日内容队列，`/admin/intelligence` 已显示今日 1–3 项调度计划；随后完成
  QC-017 发布后复查任务，`/admin/intelligence` 已显示 7/30/60 天复查队列，QC 段落闭环完成，下一项转入 DT-010。
- 2026-07-28：DT-011 目标站页面发现器已落地为独立服务与命令行入口，能够从主页链接、robots/sitemap 和常见路径识别
  submission / registration / pricing / contact / community 页面，并输出目标站状态、阻断信号和基础需求摘要；下一项转入
  DT-012 规则提取。
- 2026-07-28：DT-012 目标站规则提取已完成，新增规则分析器可把发现结果转成结构化的提交入口、注册要求、收费、验证码、反向
  链接、人工审核和字段需求，并生成 snapshot / requirement 记录草案；TypeScript 类型检查已通过，下一项转入 DT-013 障碍识
  别与状态细化。
- 2026-07-28：DT-013 障碍识别已完成，目标站分析器现在会输出 account / payment / captcha / missing_asset /
  manual_verification / rule_conflict 等明确障碍，并给出 clear / needs_review / blocked 状态；TypeScript 类型检查已通
  过，下一项转入 DT-014 规则版本与复查快照。
- 2026-07-28：DT-014 规则版本与复查快照已完成，新增版本化快照持久化服务和 `distribution:review-target` 命令，可将发现、
  分析、阻断项、字段需求和下次复查时间写入 `distribution_target_snapshots`，并同步刷新当前目标站规则记录；TypeScript 类
  型检查已通过，下一项转入 DT-015 目标站管理后台。
- 2026-07-28：DT-015 目标站管理后台已完成，新增 `/admin/targets` registry 页面、后台侧边栏入口、筛选器和逐条编辑/刷新操
  作，可查看 target 状态、快照版本、字段需求和下次复查时间；TypeScript 类型检查已通过，下一项转入 DT-016 适配度评分。
- 2026-07-28：DT-016 适配度评分已完成，目标站快照现在记录可解释 match score、grade、summary 和加减分理
  由，`/admin/targets` 已直接展示评分与理由；本地 `./node_modules/.bin/tsc --noEmit` 和 `pnpm run build` 均通过，下一项
  转入 DP-010 分发状态机扩展。
- 2026-07-28：DP-010 分发状态机扩展已完成，新增共享 task state machine、任务卡标签、统计维度和结果回写转态映射，并补充数
  据库状态约束迁移；本地 `./node_modules/.bin/tsc --noEmit` 和 `pnpm run build` 均通过，下一项转入 DP-011 分发文案包。
- 2026-07-28：DP-011 分发文案包已完成，新增分发文案生成器并把每个渠道的标题、描述、披露、证明点、必填字段和跟进提示展示
  到 `/distribution` 工作台；本地 `./node_modules/.bin/tsc --noEmit` 和 `pnpm run build` 均通过，下一项转入 DP-012 字段
  和素材预检。
- 2026-07-28：DP-012 到 DP-017 已完成，分发工作台现在具备预检、目的地建议、任务排序、任务详情页、一键状态更新和自动
  follow-up 创建能力；本地 `./node_modules/.bin/tsc --noEmit` 和 `pnpm run build` 均通过，分发主线进入收口和观察阶段。
- 2026-07-28：RM-010 到 RM-015 已完成，分发后台现在可做 live URL 检查、链接属性核验、30/90 天保留率、拒绝/障碍学习、渠道
  优先级回写和周报导出；本地 `./node_modules/.bin/tsc --noEmit` 和 `pnpm run build` 均通过，分发结果复查线进入收口和观察
  阶段。
- 2026-07-28：REL-011 迁移演练脚本已完成并通过本地验证，`pnpm verify:distribution-migrations` 现在会检查分发工作区、项
  目、任务、结果、目标站和状态机相关表结构；`distribution:production-smoke` 也已通过，证明
  `/distribution`、`/admin/distribution`、`/admin/targets` 和分发报表 API 在线上没有 5xx。
- 2026-07-28：补齐分发 registry 的数据库迁移与种子脚本，并把目标站相关读写切换为直连 Postgres，绕开 Supabase schema
  cache 对 `distribution_targets` 的可见性问题；`distribution_targets` 已种入 10 条
  fixture，`distribution_target_snapshots` 已累积到 12 条，批量 review 走通 10 个目标站，其中 6 个写入 snapshot、4 个归
  类为站点级 blocked，REL-014 已拿到真实验证结果。
- 2026-07-28：批量 review 现在会把站点级 blocked 的人工处理原因回写到 `distribution_targets.last_review_reason`，并在
  `/admin/targets` 里直接显示；同时新增 `REL_015_7_DAY_REVIEW_STRUCTURE_CN.md`，把 7 天游标复盘的输入、维度、流程和输出
  固定下来，方便下一轮扩量或收口。
- 2026-07-28：SEO 主线继续保持不扩量策略，当前下一步仍是按周维护 GSC 台账、继续弱页 noindex / canonical / 合并收口，并优
  先观察首页、榜单、分类与少量高排名工具页的真实信号变化。
- 2026-07-28：继续收口剩余弱页与别名页，`/guides/*comparison` 和同义 guide 仍按 noindex / canonical / 合并优先级处理，不
  再扩大索引面；下一步只在质量盘点和 GSC 反馈证明有效时才考虑新增索引入口。
- 2026-07-28：进一步收口销售拓客比较页，`/guides/ai-tools-for-sales-prospecting-comparison` 已转为 noindex 并 canonical
  回主 guide，继续减少比较页索引噪音；后台 targets 页也新增了 blocked reason 快捷筛选。
- 2026-07-28：修复 comparison 页面多顶层模块被公共横向 flex 布局挤成超窄列的样式问题，公共 with-footer 主容器已统一改为
  纵向排列；同时将 agencies、creators、designers 三个角色型 comparison 页转为 noindex，并 canonical 回各自主 guide，继续
  收口重复索引入口。
- 2026-07-28：继续完成 agents、code review、automation 三个工作流型 comparison 页的 canonical 收口，分别回到对应主
  guide；共享 comparison 模板继续统一提供 noindex，避免重复索引入口与主指南竞争。
- 2026-07-28：继续完成 comparison 收口下一批，`meeting-notes`、`customer-support`、`ecommerce` 三个 comparison 页已追加
  `alternates.canonical` 回主 guide（`noindex` 仍由模板统一返回），用于继续降低别名比较页索引噪音。
- 2026-07-28：导入最新 GSC 28 天数据：135 展示 / 1 点击 / 0.74% CTR / 59.92 平均排名，Coverage 为 154 已索引 / 690 未索
  引。执行重心从“继续批量 comparison 收口”切换为“规范 URL + 少量机会页增长”：新增统一本地化 canonical 生成器，英文规范页
  不再带 `/en` 前缀；首页、Explore、榜单、分类、工具详情的关键 canonical / schema URL 已对齐。首批增强首
  页、Research、Lindy、Fathom、ChatGPT，后续 14/28 天观察数据。
- 2026-07-28：索引策略代码对账发现并修复 `/guides/ai-tools-for-research`、`/guides/ai-tools-for-sales` 同时存在于
  sitemap 白名单却在页面 metadata 返回 `noindex` 的冲突；两页已恢复为规范可索引页，并为 sitemap 回归新增“白名单 Guide 不
  得显式 noindex”自动检查，防止同类问题再次出现。
- 2026-07-28：完成 GSC 第二批机会页增强：Explore 对齐“按任务、价格和分类筛选 AI 工具目录”意
  图；Web3、Productivity、Automation、Voice 分类页补专属 Title / Description 和决策顺序；Cursor、The Graph、Dune 工具页
  补代码编辑、Web3 数据基础设施和链上 SQL 仪表盘的专属判断块。两批机会页均已完成代码落地，下一阶段进入部署后 14/28 天观
  察。
- 2026-07-29：执行确
  认：`/ai/chatgpt`、`/ai/pipedream`、`/ai/fathom`、`/ai/lindy`、`/categories/productivity`、`/categories/web3`、`/categories/automation`、`/categories/voice`、`/ai/cursor`、`/ai/the-graph`、`/ai/dune`
  与 `Explore` / `/guides/ai-tools-for-research` 的技术信号与 noindex / canonical / sitemap 约束均保持稳定；本地
  `pnpm run build` 通过。当前不继续扩量，进入 14/28 周期观察。
- 2026-07-29：补齐 `seo:priority-source-audit` 高曝光保护网：为 `fathom`、`pipedream` 追加 `lib/data.ts` 的静态
  `detailList` 兜底来源后，`node --import tsx scripts/audit-priority-tool-sources.ts -- --strict` 在无生产 DB 连接场景下
  通过，确保后续构建与发布流程不中断。
- 2026-07-29：生产复核通过：执行 `node --import tsx scripts/production-seo-smoke.ts` 与
  `node --import tsx scripts/production-distribution-smoke.ts` 均通过（sitemap、robots、`/admin` 重定向、API 防
  护、`/distribution` 可用）；主线继续按 7d/28d 观察窗口推进，不扩量。
- 2026-07-15：`GuideEvidencePanel` 已补齐到全部 guide / comparison 页面，并通过本地 `pnpm run build`
- 2026-07-15：`pnpm run seo:quality-inventory` 已生成最新质量盘点，当前总页面 157、可进 sitemap 27、内部流量页
  3、noindex / 合并候选 127，详见
  [`docs/SEO_QUALITY_INVENTORY_CN.md`](/Users/liukai/web/ai-best-tool/docs/SEO_QUALITY_INVENTORY_CN.md)
- 2026-07-15：`gsc:weekly-report` 的导出汇总脚本已增强为更深层递归扫描，并支持部分 CSV 导入时写回周报基线，减少等待完整
  导出时的卡点；Week 1 GSC 性能与覆盖率基线已录入周报
- 2026-07-16：最新 28 天 GSC 导出再次确认仍处低曝光、低点击、低排名基线；近 7 天曝光几乎归零，当前继续以收口弱页、强化核
  心页真实信号、观察索引恢复为主。
- 2026-07-16：新增 sitemap 回归测试，自动确认 noindex / alias 页面不会重新混入 sitemap，并通过本地
  `pnpm exec tsx scripts/test-sitemap.ts`。
- 2026-07-17：`ai/[websiteName]` 工具详情页补齐决策顺序信号，让高曝光工具页先说明工作流匹配、价格更新和评论/认领判断，再
  进入更窄候选，并通过本地 `pnpm run build`。
- 2026-07-18：继续把首页、榜单页、`ai/[websiteName]` 与剩余 guide / comparison 页面上的 freshness 信号统一推进到
  `2026-07-18`，本轮只做内容时效收口，不改结构逻辑，并通过本地 `pnpm run build`。
- 2026-07-18：完成一轮更广的页面 freshness 复核，把 remaining guide / comparison / conversion 页的最近检查日期统一到
  `2026-07-18`，确保站内收口页面与总控表时间一致，并通过本地 `pnpm run build`。
- 2026-07-18：继续收口 `seo-tools` 与 `agent-tools` 指南页的最近验证文案，把底部检查日期统一到 `2026-07-18`，并通过本地
  `pnpm run build`。
- 2026-07-18：继续收口写作、Gemini 替代、资产追踪和模型路由等 comparison 页的最近验证文案，把底部检查日期统一到
  `2026-07-18`，并通过本地 `pnpm run build`。
- 2026-07-18：`ai-web3-tools` 已收口为 `noindex` 并 canonical 到 `ai-tools-for-web3`，主 Web3 指南页保持可索引入口，减少
  同义入口的索引重复，并通过本地 `pnpm run build`。
- 2026-07-18：`how-to-choose-ai-tools` 已补齐最近验证日期，让总选型入口也带上同样的 freshness 信号，并通过本地
  `pnpm run build`。
- 2026-07-18：统一站点主 URL 规范化逻辑，强制去掉 `www` 后缀，并把首页、Explore、指南总览、comparison template 与核心
  Web3 / Chatbot 指南页切到统一 canonical / breadcrumb 基址，并通过本地 `pnpm run build`。
- 2026-07-19：开始实现独立的产品分发模块，目标是把 AI
  Directory、Alternative、Startup、Community、Newsletter、Blog、GitHub、Reddit 等渠道纳入可收费的任务、提交结果和外链复
  查工作台；当前先完成数据库迁移、权益边界和管理员可用的 MVP 页面，详见
  [`docs/DISTRIBUTION_MODULE_PLAN_CN.md`](/Users/liukai/web/ai-best-tool/docs/DISTRIBUTION_MODULE_PLAN_CN.md)。
- 2026-07-19：分发模块继续完成 P0 的 UTM 链接和渠道模板能力，按项目保存渠道链接、推广活动参数和人工提交规则；本轮仍不自
  动发帖，先为后续访问/注册/认领转化追踪打基础，并通过本地 `pnpm run build`。
- 2026-07-19：分发模块完成访问、注册、提交、认领、checkout、Stripe 付款归因闭环；新增独立 Supabase 归因表和 30 天项目级
  快照，归因失败静默降级，不阻断核心业务流程；本地 `pnpm run build` 通过。上线前需重新执行分发模块迁移并完成一次真实链路
  验收。
- 2026-07-20：分发模块新增管理员总览，集中查看客户项目、权益、开放任务、live / rejected / removed 结果及 30 天归因；本地
  `pnpm run build` 通过并推送 `main`，待 Supabase 迁移后做线上验收。
- 2026-07-20：统一平台产品和商业定义：Discover 免费发现、List & Launch 一次性交易、Distribution Workspace 持续订阅；确定
  Pilot `$0`、Pro Founding `$19/月`、Founding Agency `$49/月` 的验证价格，并新增 Stripe/Pilot/幂等/月付年付/真实项目验证
  路线图。后续商业实施以 `PLATFORM_PRODUCT_PRICING_AND_STRIPE_ROADMAP_CN.md` 为准。
- 2026-07-15：根据最近 28 天 GSC 基线，开始优先强化首页、榜单页和分类页的判断信号，新增价格 / 更新 / 风险信号层，帮助核
  心入口更像可决策页面
- 2026-07-15：继续把曝光较高的工具详情页做成更强答案页，先补 `Fathom` / `Pipedream` 这类高曝光条目的定制信号层，降低“看
  到了但点不出来”的损耗
- 2026-07-15：`robots.txt` 已回退为 `public/robots.txt` 静态文件，避免 metadata route 500；本地预览 `seo:validate` 已跑
  通 27/27，工具页非数据库工具的提示已改为通过
- 2026-07-15：主页、榜单页和指南页已把 Submit / Claim 从第一层入口降级为次级 owner 路径，避免商业入口打断先看内容、再做
  比较的决策流，并通过本地 `pnpm run build`
- 2026-07-15：comparison template 已补入价格 / 更新 / 风险显式化，所有套用该模板的比较页都会显示统一的风险信号与
  freshness 提示，并通过本地 `pnpm run build`
- 2026-07-15：comparison template 已统一补入 `decisionSteps`，让所有套用该模板的比较页默认都带有一致的决策顺序模块，并通
  过本地 `pnpm run build`
- 2026-07-15：`GuideEvidencePanel` 新增可复用的价格 / 更新 / 风险信号条，已接入
  `how-to-choose-ai-tools`、`best-free-ai-tools`、`ai-seo-tools` 等核心指南页，并通过本地 `pnpm run build`
- 2026-07-15：`GuideEvidencePanel` 的价格 / 更新 / 风险信号条继续接入
  `ai-tools-for-developers`、`ai-tools-for-research`、`ai-tools-for-marketing` 等核心指南页，并通过本地 `pnpm run build`
- 2026-07-15：`GuideEvidencePanel` 的价格 / 更新 / 风险信号条继续接入
  `ai-tools-for-agents`、`ai-tools-for-api-observability`、`ai-tools-for-automation` 等高意图指南页，并通过本地
  `pnpm run build`
- 2026-07-15：`GuideEvidencePanel` 的价格 / 更新 / 风险信号条继续接入
  `ai-tools-for-content-creation`、`ai-chatbot-tools`、`ai-tools-for-designers` 等内容 / 聊天 / 设计高意图页，并通过本地
  `pnpm run build`
- 2026-07-15：`GuideEvidencePanel` 的价格 / 更新 / 风险信号条继续接入
  `ai-tools-for-sales`、`ai-productivity-tools`、`ai-tools-for-web3` 及其 comparison 页面，并通过本地 `pnpm run build`
- 2026-07-15：`GuideEvidencePanel` 增加默认的价格 / 更新 / 风险信号条回退，未单独传 `signalCards` 的指南 / 对比页也会自
  动获得同一层真实信号，并通过本地 `pnpm run build`
- 2026-07-15：`GuideEvidencePanel` 的定制信号继续补到
  `ai-tools-for-customer-support`、`ai-tools-for-lead-generation`、`ai-tools-for-model-routing` 和
  `ai-marketing-tools`，进一步强化高意图主页面的真实判断口径，并通过本地 `pnpm run build`
- 2026-07-15：`GuideEvidencePanel` 的定制信号继续补到
  `ai-tools-for-on-chain-analysis`、`ai-tools-for-crypto-research`、`ai-tools-for-wallet-monitoring`、`ai-tools-for-protocol-analytics`
  和 `ai-tools-for-ecommerce`，进一步强化数据 / 交易 / 运营场景判断口径，并通过本地 `pnpm run build`
- 2026-07-15：`GuideEvidencePanel` 的定制信号继续补到 `ai-api-observability-tools`，把请求 / 告警 / 追踪 / 事故复盘的判
  断口径写得更具体，并通过本地 `pnpm run build`
- 2026-07-15：`GuideEvidencePanel` 的定制信号继续补到
  `ai-agent-tools`、`ai-tools-for-prompt-testing`、`ai-tools-for-code-review`，进一步强化自动化深度、评估样本、diff / 风
  险 / 可执行性口径，并通过本地 `pnpm run build`
- 2026-07-15：`GuideEvidencePanel` 的定制信号继续补到
  `ai-image-tools-comparison`、`ai-writing-tools-comparison`、`ai-evals-tools`，进一步强化视觉一致性、写作语气 / 改写、
  评测稳定性与协作口径，并通过本地 `pnpm run build`
- 2026-07-15：`GuideEvidencePanel` 的定制信号继续补到
  `ai-tools-for-crypto-portfolio-tracking-comparison`、`ai-tools-for-meeting-notes-comparison`、`ai-tools-for-token-research`，
  进一步强化组合视图、转写 / 整理 / 协作、叙事 / 数据深度 / 导出口径，并通过本地 `pnpm run build`
- 2026-07-15：`GuideEvidencePanel` 的定制信号继续补到
  `ai-tools-for-token-research-comparison`、`ai-tools-for-web3-analysis-comparison`、`ai-tools-for-protocol-analytics-comparison`，
  进一步强化叙事 / 数据深度 / 导出、覆盖 / 历史 / 团队、协议覆盖 / 趋势 / 输出口径，并通过本地 `pnpm run build`
- 2026-07-15：`GuideEvidencePanel` 的定制信号继续补到
  `ai-tools-for-customer-support-comparison`、`ai-tools-for-ecommerce-comparison`、`ai-tools-for-lead-generation-comparison`，
  进一步强化回复 / 分流 / 知识库、商品 / 营销 / 真实增量、名单 / 下游 / 真人信号口径，并通过本地 `pnpm run build`
- 2026-07-15：工具详情页已新增“当前处理状态”面板，把最近更新、讨论数量、认领状态和下一步动作串成更清晰的 owner / 评论 /
  更新请求闭环，并通过本地 `pnpm run build`
- 2026-07-15：`ai-tools-for-small-business` 已补入价格 / 更新 / 风险信号层，继续强化小企业场景的团队席位、权限、导出和支
  持判断口径，并通过本地 `pnpm run build`
- 2026-07-15：`ai-tools-for-students` 和 `ai-tools-for-voice` 已补入价格 / 更新 / 风险信号层，继续强化学习 / 引用 / 转写
  / 商用导出的真实判断口径，并通过本地 `pnpm run build`
- 2026-07-15：`developer-tools` 和 `productivity-tools` 已补入价格 / 更新 / 风险信号层，继续强化开发协作、可维护性、搜
  索、导出和自动化的真实判断口径，并通过本地 `pnpm run build`
- 2026-07-15：`research-tools` 和 `sales-tools` 已补入价格 / 更新 / 风险信号层，继续强化来源追溯、研究复盘、线索管理和跟
  进协作的真实判断口径，并通过本地 `pnpm run build`
- 2026-07-15：`ai-tools-for-creators` 已补入价格 / 更新 / 风险信号层，继续强化批量创作、品牌一致性、导出和复用的真实判断
  口径，并通过本地 `pnpm run build`
- 2026-07-15：`seo-tools` 和 `ai-tools-for-wallet-research` 已补入价格 / 更新 / 风险信号层，继续强化 SEO 诊断、技术校
  验、地址画像和链上研究的真实判断口径，并通过本地 `pnpm run build`
- 2026-07-15：`agent-tools` 和 `ai-model-routing-tools` 已补入价格 / 更新 / 风险信号层，继续强化 agent 落地、任务路由、
  切换稳定性和成本判断口径，并通过本地 `pnpm run build`
- 2026-07-15：`free-ai-tools` 和 `ai-sales-tools` 已补入价格 / 更新 / 风险信号层，继续强化免费额度、更新频率、线索管理和
  跟进协作的真实判断口径，并通过本地 `pnpm run build`

## 一、当前有几个计划

现在实际有 3 条主线：

1. **60 天商业主线**
   - 目标：验证付费、认领、留资、回头付费和工具方回复
2. **SEO 质量恢复主线**
   - 目标：收口索引面，强化核心页真实信号，恢复 GSC 曝光和索引质量
3. **竞品研究与产品优化主线**
   - 目标：把前排竞品的有效设计转化成可执行的产品改造

## 二、各计划完成度

以下是按“文档 + 代码落地 + 可验证结果”综合后的粗略估计，不是单一功能数量统计。

| 计划                   | 当前完成度                     | 已完成的核心内容                                                                                                                         | 主要未完成内容                                                         |
| ---------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 60 天商业主线          | 55%                            | 工具库、分类、Guide、Comparison、Submit、Stripe、Featured、Admin 基础完整；Pricing/Submit/Claim 页面收口，漏斗埋点已接通                 | 真正的付费验证、Claim 留资转化、后台持续跟踪和优化                     |
| SEO 质量恢复主线       | 80%                            | robots/sitemap/noindex 策略、质量盘点、GSC 台账、核心页真实证据模块、多个 hub/detail/compare 页增强、robots 静态化、索引收口方向已经落地 | 继续观察 GSC、补齐剩余核心页真实信号、合并/ noindex 弱页、按周复盘     |
| 竞品研究与产品优化主线 | 20%（执行） / 100%（研究文档） | 已完成竞品研究文档，明确 10 条可借鉴设计和 10 类用户痛点                                                                                 | 还需要把研究结论真正落到首页、Explore、分类页、对比页、评论/认领闭环里 |

## 三、三条线是否冲突

结论：**不冲突，但要分层执行。**

### 相交点

- **SEO 质量恢复** 提供可被 Google 索引、可被用户信任的核心页
- **商业主线** 依赖这些核心页去承接提交、认领和付费
- **竞品研究** 提供这些页面应该怎么设计，才能更像高质量目录站而不是薄页集合

### 不该做的事

- 为了商业化继续大规模新增薄页
- 为了 SEO 继续堆低价值比较页
- 为了竞品追赶同时开三四条新功能线

### 正确的交汇方式

- 先保证核心页质量
- 再把商业入口嵌进核心页
- 再用真实用户信号反向验证页面是否值得继续索引

当前对比页的落地状态已经从“列表型比较”推进到“可决策型比较”：

- 对比模板里已经有比较依据、最近核查和下一步入口
- 详情页已经补齐 `why compare this one`、`best for`、`what to compare` 和 `next step`
- 首页、Explore、分类页和工具详情页也开始对齐同一套决策叙事，避免各页各说各话
- 现有 `*-alternatives-comparison` 与 `*comparison` 页面已统一补上 `Decision order / 决策顺序` 模块，并且已通过本地
  `pnpm run build`

## 四、为什么建议合并成一份总计划

原因很简单：

1. **现在的任务已经从“写功能”变成“验证价值”**
2. **多个计划之间的执行对象高度重叠**
3. **如果不合并，很容易出现“每条线都做了一点，但没有一条真正闭环”**

合并之后的好处：

- 你只需要看一张总表
- 每个任务都能对应具体页面、具体埋点、具体验收标准
- 周报只看一份，不会分散

## 五、总任务结构

### P0: 先稳住质量和索引

| 任务                             | 目标                 | 验收标准                                                                                  | 状态     |
| -------------------------------- | -------------------- | ----------------------------------------------------------------------------------------- | -------- |
| 停止新增低价值 programmatic 页面 | 防止索引面继续膨胀   | 作为持续准入规则；新工具页必须先过质量门槛再进入 sitemap                                  | 持续规则 |
| 继续收口弱页 / alias 页          | 降低重复和稀薄内容   | 批量技术收口已完成；后续只处理 GSC 暴露的异常 URL，不再把 comparison 批量修改当作主要产出 | 维护中   |
| 保持 GSC 周度观察                | 看恢复是否有效       | 2026-08-03 Week 6 已导入；28 天 147 展示 / 0 点击，下一轮同时观察非首页曝光与已核验外链      | 进行中   |
| 维护核心页真实信号               | 给 Google 和用户证据 | 核心页持续补验证日期、价格、评论、owner 信号                                              | 进行中   |
| 后台页面质量状态 / 下次复查日期  | 让质量决策可跟踪     | 管理后台可编辑并落库，列表页可查看                                                        | 已完成   |

### P1: 提升核心页的决策质量

| 任务                      | 目标                   | 验收标准                                                                                                                                                | 状态   |
| ------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 首页 / Explore 任务型搜索 | 先问用户想解决什么问题 | 搜索和入口不只按分类组织                                                                                                                                | 已完成 |
| 分类页增强                | 让分类页成为可决策 hub | 首屏、代表工具、对比入口、最近验证块齐全                                                                                                                | 已完成 |
| 对比页 / 替代页增强       | 承接高意图搜索         | 比较维度、why-this-one、CTA 明确，已补齐 compare template、best-for / why-pick-it / watch-out 和高意图路径；2026-07-15 已统一加上真实信号与验证口径面板 | 已完成 |
| Tool detail 真实信号      | 增强信任和转化         | 评论、owner、verified、价格、限制清晰                                                                                                                   | 已完成 |
| 评论 / 认领闭环           | 形成非 AI 增量内容     | 能留资、能评论、能跟进更新请求                                                                                                                          | 已完成 |

### P2: 商业验证

| 任务               | 目标                    | 验收标准                                         | 状态   |
| ------------------ | ----------------------- | ------------------------------------------------ | ------ |
| Pricing 页面重构   | 让付费理由 3 秒内能看懂 | 套餐、交付、时效、边界清晰                       | 已完成 |
| Submit 页面重构    | 提交前教育用户          | 审核标准、拒绝规则、付款说明齐全                 | 已完成 |
| Claim Landing Page | 提前验证认领意愿        | 能直接留资，不依赖复杂后台                       | 已完成 |
| 漏斗埋点           | 找到流失点              | Pricing → Submit → Checkout → Success 全链路可读 | 已完成 |

### P3: 竞品研究落地

| 任务                        | 目标                           | 验收标准                                                | 状态   |
| --------------------------- | ------------------------------ | ------------------------------------------------------- | ------ |
| 任务型搜索入口强化          | 先问用户“要做什么”             | 首页、Explore、分类页都能按任务/场景导航                | 已完成 |
| 对比 / 替代页统一决策框架   | 把高意图入口做成可比较页面     | 有比较维度、why-this-one、适合谁 / 不适合谁、下一步动作 | 已完成 |
| 价格 / 更新 / 风险显式化    | 提升可信度和转化率             | 核心页统一展示价格、最近验证、限制和风险提示            | 已完成 |
| 评论 / owner / 更新请求闭环 | 把非 AI 增量内容做起来         | 用户能评论、认领、提交更新请求并看到处理状态            | 已完成 |
| 商业入口分层                | 让付费入口服务判断而不干扰判断 | Submit / Claim / Sponsor 入口清晰，但不压过内容判断     | 已完成 |

## 六、推荐的执行顺序

### 1. 先做质量控制

- 继续把核心页做成真实、可验证、可比较的页面
- 继续控制索引面
- 继续减少薄页噪音

### 2. 再做商业化验证

- 先重构 Pricing
- 再重构 Submit
- 再做 Claim Landing Page
- 再串埋点

### 3. 最后才扩展新功能

- 等付费和留资有反馈之后，再决定要不要补更复杂的后台或推荐系统
- 如果竞品信号继续验证有效，再逐步把搜索、对比、评论和认领再往前台前置

## 七、监测指标

### SEO 指标

- GSC 总曝光
- GSC 总点击
- CTR
- 平均排名
- 已索引页面数
- 未索引原因 Top 5
- Top 20 query
- Top 20 page
- GSC CSV 汇总摘要（可由 `pnpm run gsc:weekly-report -- --dir <export-folder>` 生成）

### 商业指标

- Pricing 访问
- Submit 访问
- Checkout 创建
- Payment Success
- Publish Success
- Claim 留资
- 回复数

### 内容信号指标

- 评论数
- 收藏数
- 分享数
- owner 认领数
- 更新请求数
- 核心页最近验证日期覆盖率

## 八、周度节奏

每周只做三件事：

1. 填 GSC 台账
2. 复盘商业漏斗
3. 推进一轮核心页增强

## 九、执行开关（2026-07-29 起）

当前进入“观察 + 高质量分发”周期，不扩张索引页数量。

- **先执行**：
  - 每日复核 production smoke（已通过快照作为基线）
  - 7d / 28d 看 GSC 关键指标：`impressions`、`clicks`、`CTR`、`avgPosition`
  - 单独看非首页曝光、产生曝光的页面数、Top 20 query 和 `www` 历史变体
  - 每个产品每周完成 3-5 个高相关目标；分别统计 submitted、live mention 和 verified backlink
  - 观察 core 页（`/`, `/best-ai-tools`, `/explore`, `/categories/*`, `/ai/*`）是否出现“有点击回升 + 位次改善”
- **触发扩量条件**（任一满足才执行下一批）：
  - 最近 14 天 `clicks >= 2`，且与前 14 天相比不下降；且
  - 最近 14 天出现至少 1 个核心页点击率提升趋势（同页对比上升，或排名提升 ≥ 2 位）
- **触发后动作**：
  - 从你已定义的下一批列表中选 1-2 批工具/分类页，继续补充真实证据（价格/更新/评论/owner）与标题意图，而不是再新增页面或
    大规模 comparison。
- **风险提醒**：
  - 如果指标再次持续下滑（连续两周点击与 CTR 下滑），先回退为只做质量清单，不做新的页面实验。

## 十、下一步执行明细（本周）

### 本周任务（可直接执行）

1. 将本次 08-03 的 7/28 天指标更新入 `docs/GSC_WEEKLY_OBSERVATION_LOG_CN.md`（已完成）。
2. 将核心页面线上审计从 20 页扩到 27 页，覆盖最新 GSC 信号页（已完成）。
3. 用 Explore 把 Research、Voice、Automation、Web3 与代表工具连接起来（已完成）。
4. 维持站内收口与规则不变；任何新增索引页必须通过 `docs/SEO_CONTENT_CHECKLIST.md` 的准入门槛。
5. 分发只推进高相关、可核验目标，并按 `docs/DISTRIBUTION_PRODUCT_ACCEPTANCE_GUIDE_CN.md` 的状态口径复查。
6. 只做“微调”：
   - 复核 `/guides/*`, `/ai/*`, `/categories/*` 页面标题与 snippet 是否匹配高意图搜索词
   - 仅在发现 mismatch 时改文案，不改页面结构

### 预计下一个动作（等待触发后）

- 按周级更新后，如果触发扩量条件成立，则执行：
  - 在现有 2-4 个高意图页内补充第一方评论/更新记录 + owner 补全（不超过 1 次内容迭代批）
  - 重新跑 `pnpm run seo:priority-page-signals` 和 `pnpm run seo:priority-source-audit -- --strict`
  - 更新 `Week 7` 台账和结论栏

## 九、当前建议结论

建议把所有优化内容合并成这份总控表。

原因不是为了多一份文档，而是为了：

- 把商业主线、SEO 主线、竞品研究主线统一到同一张看板
- 避免“做了很多，但彼此不相连”
- 让下一步每个任务都能落到页面、指标和验收标准

## 十、近期进展记录

- 2026-07-18：继续下调首页里 `Explore all tools / Open guide / Open ranking / Compare / Submit tool` 的视觉优先级，把首
  页的主路径都收成中性导航样式，同时保留分流、搜索和提交能力。
- 2026-07-18：继续下调 `Explore` 页 `sort / pricing / active filters` 的视觉优先级，把探索筛选区也收成更中性的目录控件，
  同时保留筛选、排序和清除条件能力，并通过本地 `pnpm run build`
- 2026-07-18：继续强化 `best-ai-tools` 榜单页的排序方法和选择标准，把榜单页补成更完整的决策入口，而不是只展示主题卡片
- 2026-07-18：`login / register / forgot-password / verify-email / profile / favorites / submissions / settings` 等认证
  和账号页已统一补 noindex，继续把非内容页收回内部流量面
- 2026-07-18：`/auth/reset-password` 也已统一补 noindex，继续把账号恢复流程收回内部流量面
- 2026-07-18：`/auth/auth-code-error` 也已统一补 noindex，继续把认证错误页收回内部流量面
- 2026-07-18：`startup` 目录页也已统一补 noindex，继续把目录型入口收回内部流量面，避免和核心内容页争索引预算
- 2026-07-18：`/new` 最近新增页已保持 noindex，继续把新内容入口限制在内部流量面，避免把首页和核心榜单的索引预算分散出去
- 2026-07-18：继续下调 `ai/[websiteName]` 详情页里 `Claim listing / Open official site / View detail / Log in` 等入口的
  视觉优先级，把详情页从强转化流转页收成中性判断页，同时保留官网、认领、收藏和评论能力。
- 2026-07-18：继续下调 `best-ai-tools/[topic]` 榜单页里 `Submit a tool / Open comparison / Back to guide` 的视觉优先级，
  把高意图榜单页也统一成更中性的分流页，同时保留继续比较和提交的入口。
- 2026-07-18：继续下调 `profile/submissions` 页里“Submit another tool / Take action / Renew”这类入口的视觉优先级，把提交
  后跟进页也统一成中性分流页，同时保留付款、审核和续期动作。
- 2026-07-18：继续下调 `submit` 页里“先去认领页 / 查看价格页 / 联系付费入驻”的视觉优先级，把提交页的辅助入口收成中性按
  钮，同时保留表单本身的提交能力。
- 2026-07-18：继续把一批薄指南页收回内部流量
  面，`ai-tools-for-content-creation / customer-support / defi-analytics / designers / meeting-notes / on-chain-analysis / prompt-testing / protocol-analytics / sales-prospecting / small-business`
  已补 noindex，继续压缩低价值索引面。
- 2026-07-18：继续把 `ai-tools-for-research / model-routing / api-observability / evals / sales` 这批薄指南页补
  noindex，继续压缩研究、路由、观测和销售类内部决策页的索引面。
- 2026-07-18：继续把
  `ai-tools-for-agencies / crypto-research / web3-analysis / wallet-monitoring / dex-analytics / token-research` 这批薄
  指南页补 noindex，继续压缩代理、加密研究和链上分析类内部决策页的索引面。
- 2026-07-18：继续把
  `ai-tools-for-ecommerce / lead-generation / students / wallet-research / crypto-portfolio-tracking / code-review` 这批
  薄指南页补 noindex，继续压缩电商、获客、学生、钱包研究、组合跟踪和代码审查类内部决策页的索引面。
- 2026-07-18：补齐 `ai-tools-for-agents` 和 `ai-tools-for-creators` 两个 direct guide 页的 `noindex`，并对账确认
  comparison 模板页已由 `comparison-template` 统一带上 `noindex`，避免重复补丁。
- 2026-07-18：对 `SEO_QUALITY_INVENTORY_CN.md` 里的 `noindex / 合并候选` direct guide 进行代码对账，当前已确认 0 个遗漏
  项，说明本轮索引收口已对齐到实现层。
- 2026-07-17：继续下调 `developer/listing` 页里“去填写认领表单 / 去提交页 / 发邮件认领”的视觉优先级，把认领页从强 CTA 页
  收成中性分流页，同时保持 owner 确认与提交流程可用。
- 2026-07-17：继续下调 `pricing` 页里 `Submit` / `Claim` / `Contact paid options` 的视觉优先级，把价格页从强转化页再往中
  性分流页收一层，同时保持跳转链路可用。
- 2026-07-16：继续强化 `best-ai-tools/[topic]` 榜单页的决策顺序信号，让高意图主题榜单更像可继续比较的入口。
- 2026-07-16：继续强化 `best-ai-tools/[topic]` 榜单页的排序 / 更新 / 风险信号，让高意图主题榜单更像可决策入口。
- 2026-07-16：继续强化 `ai/[websiteName]` 详情页的价格 / 更新 / 风险判断信号，尤其补强 Fathom 和 Pipedream 这类高意图工
  具页的可执行判断口径。
- 2026-07-16：继续补齐 `developer/listing` 的可验证信号层，把认领页也纳入统一的商业闭环与决策顺序。
- 2026-07-16：继续补齐 `profile/submissions` 的可验证信号层，新增付款、审核和前排续期的跟进面板，把提交后的动作页改成更
  清楚的商业闭环。
- 2026-07-16：继续补齐 `pricing` 和 `submit` 两个商业转化页的可验证信号层，新增页面定位、决策顺序、风险边界和后续动作，
  确保这两页从“说明页”收口成“可执行分流页”。
- 2026-07-15：继续补齐
  `poe-alternatives-comparison`、`salesforce-einstein-alternatives-comparison`、`sora-alternatives-comparison` 的
  `signalCards`，把 Poe、Salesforce Einstein 和 Sora 页的可验证信号层补齐后再做 build 验证。
- 2026-07-15：继续补齐
  `adobe-alternatives-comparison`、`ai-tools-for-content-creation-comparison`、`notta-alternatives-comparison` 的
  `signalCards`，把 Adobe、内容创作和 Notta 页的可验证信号层补齐后再做 build 验证。
- 2026-07-15：继续补齐
  `grammarly-alternatives-comparison`、`jasper-alternatives-comparison`、`mailchimp-alternatives-comparison` 的
  `signalCards`，把语法润色、品牌文案和邮件营销页的可验证信号层补齐后再做 build 验证。
- 2026-07-15：继续补齐
  `character-ai-alternatives-comparison`、`copy-ai-alternatives-comparison`、`gemini-alternatives-comparison` 的
  `signalCards`，把角色聊天、起稿营销和 Gemini 替代页的可验证信号层补齐后再做 build 验证。
- 2026-07-15：继续补齐
  `ai-tools-for-voice-comparison`、`best-free-ai-tools-comparison`、`claude-alternatives-comparison` 的 `signalCards`，
  把语音、免费工具和 Claude 替代页的可验证信号层补齐后再做 build 验证。
- 2026-07-15：继续补齐
  `ai-tools-for-evals-comparison`、`ai-tools-for-model-routing-comparison`、`ai-tools-for-students-comparison` 的
  `signalCards`，把 Evals、模型路由和学生页的可验证信号层补齐后再做 build 验证。
- 2026-07-16：`ai-tools-for-students-comparison` 对比页补齐学习总结 / 作业辅助 / 笔记整理的决策顺序信号，让学生工具对比
  页更像先判断学习任务再去比对的入口，并通过本地 `pnpm run build`。
- 2026-07-15：继续补齐 `ai-note-taking-tools-comparison`、`ai-seo-tools-comparison`、`chatgpt-alternatives-comparison`
  的 `signalCards`，把记笔记、SEO 和 ChatGPT 替代页的可验证信号层补齐后再做 build 验证。
- 2026-07-15：继续补齐
  `ai-video-tools-comparison`、`adobe-alternatives-comparison`、`ai-tools-for-content-creation-comparison` 的
  `signalCards`，把视频、创作套件和内容生产页的可验证信号层补齐后再做 build 验证。
- 2026-07-15：继续补齐
  `suno-alternatives-comparison`、`elevenlabs-alternatives-comparison`、`descript-alternatives-comparison` 的
  `signalCards`，把音乐生成、语音合成和音频编辑页的可验证信号层补齐后再做 build 验证。
- 2026-07-15：继续补齐 `n8n-alternatives-comparison`、`make-alternatives-comparison`、`zapier-alternatives-comparison`
  的 `signalCards`，把自动化底座、可视化编排和连接器页的可验证信号层补齐后再做 build 验证。
- 2026-07-15：继续补齐
  `notion-alternatives-comparison`、`hubspot-alternatives-comparison`、`perplexity-alternatives-comparison` 的
  `signalCards`，把 Notion、HubSpot 和 Perplexity 的可验证信号层补齐后再做 build 验证。
- 2026-07-15：继续补齐 `ai-agent-tools-comparison`、`ai-web3-tools-comparison`、`ai-coding-tools-comparison` 的
  `signalCards`，把 Agent、Web3 和编程入口的可验证信号层补齐后再做 build 验证。
- 2026-07-15：继续补齐
  `ai-tools-for-on-chain-analysis-comparison`、`ai-tools-for-defi-analytics-comparison`、`ai-tools-for-dex-analytics-comparison`
  的 `signalCards`，把链上分析、DeFi 分析和 DEX 分析页的可验证信号层补齐后再做 build 验证。
- 2026-07-15：继续补齐
  `ai-tools-for-wallet-research-comparison`、`ai-tools-for-crypto-research-comparison`、`ai-evals-tools-comparison` 的
  `signalCards`，把钱包研究、Crypto 研究和 Evals 页的可验证信号层补齐后再做 build 验证。
- 2026-07-15：继续补齐比较页的真实信号层，给剩余的对比页增加 `signalCards`，让价格、更新和风险判断在页面层保持一致。
- 2026-07-15：比较页与指南页的 evidence panel 已统一到“可验证信号 + 真实判断”的结构，后续继续按同一模板补到未覆盖页面。
- 2026-07-15：继续补齐
  `ai-tools-for-sales-prospecting-comparison`、`ai-tools-for-marketing-comparison`、`ai-tools-for-small-business-comparison`
  的 `signalCards`，把名单、渠道、品牌、运营等信号层补齐后再做 build 验证。
- 2026-07-15：继续补齐
  `ai-chatbot-tools-comparison`、`ai-marketing-tools-comparison`、`ai-tools-for-developers-comparison` 的
  `signalCards`，把聊天、营销和开发者页的可验证信号层补齐后再做 build 验证。
- 2026-07-18：继续收口 `ai-coding-tools-comparison` 与 `ai-tools-for-developers-comparison` 的 freshness 记录，统一补入
  `checkedAt`，避免核心比较页缺少最近核对时间。
- 2026-07-18：继续把 `developer-tools`、`marketing-tools`、`productivity-tools`、`research-tools` 这批 noindex alias 页
  的 freshness 记录统一成 `checkedAt`，让别名入口也保持一致的最近验证口径，并通过本地 `pnpm run build`。
- 2026-07-18：继续把
  `sales-tools`、`automation-tools`、`chatbot-tools`、`image-tools`、`voice-tools`、`note-taking-tools` 这批 noindex
  alias 页的 freshness 记录统一成 `checkedAt`，继续收口常用内部入口的一致口径，并通过本地 `pnpm run build`。
- 2026-07-18：继续把
  `ai-chatbot-tools-comparison`、`ai-web3-tools-comparison`、`ai-tools-for-research-comparison`、`ai-sales-tools-comparison`
  的 freshness 记录统一成 `checkedAt`，让比较页也保持一致的最近验证口径，并通过本地 `pnpm run build`。
- 2026-07-15：继续补齐
  `ai-model-routing-tools-comparison`、`ai-sales-tools-comparison`、`ai-automation-tools-comparison` 的 `signalCards`，
  把模型路由、销售和自动化页的可验证信号层补齐后再做 build 验证。
- 2026-07-15：继续补齐
  `ai-code-review-tools-comparison`、`ai-tools-for-code-review-comparison`、`cursor-alternatives-comparison` 的
  `signalCards`，把代码审查与 Cursor 替代页的可验证信号层补齐后再做 build 验证。
- 2026-07-15：继续补齐
  `ai-tools-for-agencies-comparison`、`ai-tools-for-designers-comparison`、`ai-tools-for-creators-comparison` 的
  `signalCards`，把代理、设计和创作者页的可验证信号层补齐后再做 build 验证。
- 2026-07-15：继续补齐
  `ai-web3-tools-comparison`、`ai-tools-for-defi-analytics-comparison`、`ai-tools-for-wallet-monitoring-comparison` 的
  `signalCards`，把 Web3 / DeFi / 钱包监控页的可验证信号层补齐后再做 build 验证。
- 2026-07-15：继续补齐
  `ai-research-tools-comparison`、`ai-tools-for-prompt-testing-comparison`、`ai-tools-for-api-observability-comparison`
  的 `signalCards`，把研究、Prompt 测试和 API 可观测页的可验证信号层补齐后再做 build 验证。
- 2026-07-15：补齐
  `ai-chatbot-tools-comparison`、`ai-coding-tools-comparison`、`ai-image-tools-comparison`、`ai-research-tools-comparison`、`ai-video-tools-comparison`
  的 `noindex` 标记，避免独立写 metadata 的 comparison 页漏进索引面。
- 2026-07-15：`Explore` 页补齐价格 / 更新 / 风险信号层，让目录页也能直接承担筛选和决策中枢的角色，并通过本地
  `pnpm run build`。
- 2026-07-15：最新 28 天 GSC 基线已写入周报，近 7 天曝光几乎归零，说明站点仍处在很低的曝光基线，后续优先继续补核心页真实
  信号与索引收口观察。
- 2026-07-15：`CategoryContent` 的 evidence panel 改成按 `productivity / web3 / developer-tools / chatbot` 等核心分类输
  出场景化信号，让 P1 分类页更像真实决策页，并通过本地 `pnpm run build`。
- 2026-07-16：`best-ai-tools` 榜单页补齐选择 / 受众 / 下一步信号层，让总入口更像路径分发中枢，并通过本地
  `pnpm run build`。
- 2026-07-16：首页补齐路线 / 受众 / 下一步信号层，让首屏更明确分流到榜单、分类、详情和认领路径，并通过本地
  `pnpm run build`。
- 2026-07-17：`[locale]` 首页补齐决策顺序信号，让首屏先判断找工具、看榜单还是提交产品，再决定去榜单、分类或详情页，并通
  过本地 `pnpm run build`。
- 2026-07-17：`best-ai-tools` 榜单页补齐决策顺序信号，让主榜单入口先收窄主题、再看价格更新和真实反馈、最后进入详情或提交
  页，并通过本地 `pnpm run build`。
- 2026-07-17：`explore` 探索页补齐决策顺序信号，让目录页先选任务或场景、再按价格 / 更新 / 风险筛选、最后进入详情 / 对比
  / 提交页，并通过本地 `pnpm run build`。
- 2026-07-18：最新 28 天 GSC 复核仍为 876 impressions / 2 clicks / 0.23% CTR / 70.09 平均排名；Top queries 仍以品牌与目
  录词为主，覆盖问题仍集中在 583 noindex、14 crawled not indexed、22 redirects、22 alternate canonicals 和 5
  duplicates。
- 2026-07-18：`best-ai-tools`、`explore`、`ai-seo-tools`、`ai-coding-tools`、`ai-writing-tools`、`free-ai-tools`、`ai-note-taking-tools`、`ai-tools-for-web3`
  的 `checkedAt` 已刷新到 `2026-07-18`，继续把核心入口的 freshness 信号对齐到今天。
- 2026-07-18：`explore`、`startup`、`best-ai-tools/[topic]`、`ai/[websiteName]`、`categories/[slug]` 的结构化数据与导航
  链接统一收口到 `BASE_URL`，进一步避免本地地址混入 canonical / breadcrumb / OG 链接，并通过本地 `pnpm run build`。
- 2026-07-18：剩余 guide / comparison 页面继续统一收口到 `BASE_URL`，并补齐
  `generateBreadcrumbSchema`、`generateFAQSchema`、`generateItemListSchema` 的导入，确保批量收口后本地 `pnpm run build`
  仍然通过。
- 2026-07-18：提交表单邮件、GSC 默认值、支付回跳、后台设置展示和 OAuth 回调继续统一到 `BASE_URL`，把“会生成外链”的后端入
  口也收口到同一站点基准，并通过本地 `pnpm run build`。
- 2026-07-18：`lib/seo/constants.ts` 的默认站点配置改为直接使用统一的 `BASE_URL`，让默认 SEO 元数据与全站 canonical 基准
  保持一致，并通过本地 `pnpm run build`。
- 2026-07-18：Stripe checkout 回跳地址移除 `request.nextUrl.origin` 兜底，统一只使用 canonical `BASE_URL`，避免支付成功
  / 取消回跳在不同域名间漂移，并通过本地 `pnpm run build`。
- 2026-07-18：middleware 继续收紧 host 归一化逻辑，确保 `www` 变体和非 HTTPS 访问都稳定 308 到 canonical 域名，减少 apex
  / www 之间的信号分裂，并通过本地 `pnpm run build`。
- 2026-07-18：将 sitemap 主力 guide 白名单提取为共享策略，并把回归检查扩展到所有 GUIDE_PAGES，自动验证薄
  页、alias、comparison 不会重新进入 sitemap，同时验证主力 guide 全部存在；本地 sitemap 检查通过 `7/7`，并通过本地
  `pnpm run build`。
- 2026-07-18：依据已提供的最新 28 天 GSC 数据，把 8 个核心增强页的真实信号、保留索引判断和下一步缺口回填到
  `GSC_WEEKLY_OBSERVATION_LOG_CN.md`，并将质量盘点日期对齐到 `2026-07-18`；当前仍保持“不扩量、先观察”的策略。
- 2026-07-18：针对 GSC Top Pages 中的 `/categories/automation` 补充触发器、工作流编排、失败重试、日志和权限等类目专属判
  断信号，并将分类页最近核查日期统一到 `2026-07-18`；不新增页面、不改变索引策略。
- 2026-07-18：核对 GSC Top Pages 中的 `/ai/fathom` 与 `/ai/pipedream`，确认详情页已有工具专属的价格、更新和风险判断信
  号，并将两页纳入增强页追踪；后续只补官方数据核查、真实评论和 owner 信号，不重复生成泛化文案。
- 2026-07-18：工具详情页的“最近核查”改为只读取明确的 editorial `reviewedAt`，没有人工复核记录时显示待补状态，不再给所有
  工具统一显示同一天；避免把模板日期误当成真实证据。
- 2026-07-18：后台工具编辑页新增 editorial 复核字段，可记录复核日期、复核人、双语摘要和信任备注，并写入
  `features.editorial` 供详情页读取；补齐“真实复核可记录、可展示、可追踪”的闭环。
- 2026-07-18：后台工具列表审计信号新增 `Editorial verified / Editorial pending` 标识，让核心页真实复核状态可以批量查看和
  跟进，不需要逐条打开详情页。
- 2026-07-18：后台工具列表新增 `Editorial verified / Editorial pending` 筛选，直接按 `features.editorial.reviewedAt` 生
  成复核队列，让真实信号维护可以批量推进。
- 2026-07-18：editorial 保存接口增加质量门槛，复核日期必须同时有复核人和至少一份摘要，防止后台把不完整记录误标为已验证。
- 2026-07-18：统一 editorial 复核读取规则，后台列表、复核筛选和工具详情页都要求“日期 + 复核人 + 摘要”齐全，历史不完整记
  录自动回到 pending，不再展示为公开验证证据。
- 2026-07-18：只读核对生产 `tools` 表，当前共 25 条工具记录、完整 editorial 复核 0 条、部分记录 0 条；后续按 pending 队
  列逐条补真实证据，不用模板文本伪造复核信号，基线同步写入 GSC 周报。
- 2026-07-18：新增 [`EDITORIAL_REVIEW_QUEUE_CN.md`](/Users/liukai/web/ai-best-tool/docs/EDITORIAL_REVIEW_QUEUE_CN.md)，
  记录生产 25 条工具的真实复核队列，并标记 GSC 高曝光的 Fathom / Pipedream 与当前数据库不一致，下一步先审计数据源再补证
  据。
- 2026-07-18：新增 `seo:priority-source-audit`，默认警告、`--strict` 阻断，用于检查 GSC 高曝光工具是否存在已发布数据库记
  录或 legacy 静态来源，防止复核状态与实际发布数据源脱节。
- 2026-07-18：线上核对 `/cn/ai/fathom` 与 `/cn/ai/pipedream` 均为 200 且 canonical 正确，但评分、讨论和收藏仍为 0；确认
  当前不应因本地数据库样本差异直接 noindex，后续优先补真实互动和 owner 信号。
- 2026-07-18：修正 sitemap 回归脚本对 `POSTGRES_URL` / `DATABASE_URL_UNPOOLED` 的兼容，避免环境变量命名差异导致动态工具
  和分类检查被跳过；后续 sitemap 结果更接近真实数据库状态。
- 2026-07-18：重新运行页面质量盘点，结果稳定为总页面 157、可进 sitemap 27、内部流量页 3、noindex / 合并候选 127；未发现
  新的索引收口遗漏，本轮继续以 GSC 趋势和真实用户信号为下一步依据。
- 2026-07-19：生产 smoke check 确认 sitemap 与 robots 均为 200，线上 sitemap 无内部路径和 comparison 路径，首页 /
  Explore / 榜单页正常；索引收口暂无线上回归，P0 后续重点转向 GSC 观察与真实互动信号。
- 2026-07-19：新增 `seo:production-smoke`，自动检查核心入口、robots sitemap 指令及 sitemap 内部 / comparison URL 混入，
  减少每次部署后依赖手工巡检。
- 2026-07-19：将 SEO 核心页与 sitemap 检查接入既有 `production-health-monitor`，每 5 分钟复用 `MONITOR_BASE_URL` 检查 5
  个核心页面、robots sitemap 指令及内部 / comparison URL 混入。
- 2026-07-19：修正 `seo-monitoring.yml` 使用错误包管理器的问题，统一改用 pnpm 9.15.9、冻结 lockfile 安装和 `pnpm run`，
  避免定时 SEO 监控因 `npm ci` 找不到 package-lock 而失效。
- 2026-07-19：为 `production-health-monitor` 增加 `main` push 触发器，部署后立即执行生产 API 与 SEO surface 检查，不再依
  赖 5 分钟定时窗口才能验证监控修复。
- 2026-07-19：修复 `production-health-monitor` 的 GitHub Actions 工作流级 Secret 表达式错误，并将 SEO 检查拆分为核心页
  面、robots、sitemap 三步；最新运行 `749` 已成功，确认生产健康接口、5 个核心 SEO 页面、robots sitemap 指令和 sitemap 索
  引面检查均通过。
- 2026-07-19：重新生成 SEO 页面质量盘点，结果稳定为 157 个页面，其中 27 个 sitemap 候选、3 个内部流量页、127 个 noindex
  / 合并候选；确认 P0 索引收口没有回归，下一步只保留 GSC 周度复盘和真实用户 / owner 信号积累。
- 2026-07-19：新增 `seo:priority-page-signals`，读取线上 20 个核心页面的公开 HTML，审计
  HTTP、canonical、description、evidence/freshness 和评论/认领/官网/比较动作入口；报告写入
  `docs/PRIORITY_PAGE_SIGNAL_AUDIT_CN.md`，明确区分“页面有入口”和“已经产生真实互动”。
- 2026-07-19：修复核心榜单、分类、guide 和详情页的 canonical metadata，并为数据库异常 fallback 保留 canonical；本地
  `pnpm run build` 通过，线上串行审计确认 20/20 核心页 HTTP、canonical、description、evidence/freshness 和 action signal
  全部存在。
- 2026-07-19：将 `seo:priority-page-signals -- --strict` 接入每日 SEO Monitoring，并上传核心页审计报告；后续
  canonical、description、evidence/freshness 或 action signal 回归会直接让监控任务失败并留下 artifact。
- 2026-07-19：修正 SEO Monitoring 的调度缺口，补上周一周度审计和每月 1 日性能审计对应的 cron；此前 workflow 只有每日
  cron，周/月 job 条件虽存在但不会自动触发。
- 2026-07-19：为 SEO Monitoring 增加 `main` push 触发，代码或 SEO 策略更新后立即执行 daily health 与核心页信号检查，避免
  等待下一个日程窗口。
- 2026-07-19：扩展 priority source audit，分别检查生产页面可用性与 editorial 管理源；确认 Fathom/Pipedream 线上可访问，
  但项目 `.env.production` 未配置数据库连接，本次不对生产 DB 记录做推断，暂不把它们标记为已复核。
- 2026-07-19：修正 priority source audit 默认环境加载范围，默认只读取 `.env.production`，仅在显式设置
  `SEO_AUDIT_ENV=local` 时读取 `.env.local`，避免把本地库误判为生产数据源。
- 2026-07-19：为每日 SEO Monitoring 增加可选 `PRODUCTION_DATABASE_URL` 只读 Secret 接口；配置后自动 strict 检查
  Fathom/Pipedream 的 editorial 数据源，未配置时明确跳过 DB 检查，不阻断现有部署。
- 2026-07-19：最新回归通过：`seo:production-smoke` 检查 5 个核心页面均为 200，robots/sitemap 正常，线上 sitemap 360 条且
  无内部或 comparison URL；production monitor 运行 `771`、SEO monitor 运行 `63` 均成功。
- 2026-07-19：复核 60 天计划周度验收项：8 项中 6 项已有代码或线上验证依据，剩余 2 项为真实外部商业行为（至少 20 个工具团
  队外联、至少 1 个 Claim 留资进入跟进），仍保持未完成，不用代码结果替代商业结果。
- 2026-07-19：editorial 复核新增证据来源 URL 门槛，后台保存、复核筛选、列表状态和详情页展示统一要求“日期 + 复核人 + 摘
  要 + HTTP(S) 证据来源”，避免把没有可追溯来源的模板记录当作真实 SEO 信号；本地 `pnpm run build` 已通过。
- 2026-07-19：进一步统一 editorial 状态判定，后台 verified/pending 查询和列表徽标现在也只认可 `http://` 或 `https://` 证
  据来源，避免后台显示已验证但详情页因来源协议不安全而不展示。
- 2026-07-19：扩展 `seo:priority-source-audit`，对高曝光工具同时检查 published 数据源和 editorial 完整证据（日期、复核
  人、摘要、HTTP(S) 来源 URL）；没有生产只读数据库 Secret 时仍只检查页面可用性，不对线上数据做猜测。
- 2026-07-19：后台工具列表的 editorial pending 状态新增具体缺口提示（复核日期、复核人、摘要、证据 URL），让真实复核队列
  可以直接按字段收口，不再只显示笼统的 pending。
- 2026-07-19：后台 editorial 队列新增 `Editorial stale (90d+)` 筛选和列表状态，区分“从未完成复核”和“证据已过期”，支持按
  复查周期维护核心页真实信号。
- 2026-07-19：工具详情页对超过 90 天的 editorial 复核增加公开提示，保留旧证据但明确建议重新核查，避免把过期事实呈现为当
  前状态。
- 2026-07-19：工具详情页补充公开复核人信息，与复核日期和证据来源一起展示，进一步区分人工复核与模板化页面内容。
- 2026-07-19：editorial 复核日期增加有效性和未来日期校验，后台拒绝脏日期，详情页也不会展示无效或未来复核记录。
- 2026-07-19：重新运行页面质量盘点，结果保持为 27 个 sitemap 候选、3 个内部流量页、127 个 noindex / 合并候选；本地
  sitemap 回归 7/7 通过，继续维持“不扩量、先观察”策略。
- 2026-07-19：重新执行线上 `seo:priority-page-signals -- --strict`，20/20 核心页的
  HTTP、canonical、description、evidence/freshness 和 action signal 全部通过，未发现连续 editorial 改动导致的公开页回
  归。
- 2026-07-19：导入最新 GSC 28 天与 7 天数据：28 天 525 展示 / 2 点击 / 0.38% CTR / 68.57 平均排名，7 天 35 展示 / 0 点击
  / 67.78 平均排名；短期没有恢复证据，继续保持 noindex / canonical 收口和“不扩量”策略。
- 2026-07-19：依据 GSC 仍存在的 `www` 历史变体信号，把 `www` 与非 HTTPS 到 canonical host 的重定向检查加入生产 SEO smoke
  和健康监控，防止域名规范化回归后再次积累重复信号。
- 2026-07-17：最新 28 天 GSC 再核对仍只有 876 impressions / 2 clicks，Top queries 仍以品牌和目录词为主，排名大多在
  70-110 之外；当前继续按“收口弱页 + 强化核心页真实信号 + 观察索引恢复”主线推进。
- 2026-07-17：`guides` 总览页底部的 Submit / Claim CTA 进一步降权，避免商业入口在总入口页抢走“先看指南、再做比较”的主路
  径注意力，并通过本地 `pnpm run build`。
- 2026-07-17：首页里的 `Submit` / `Developer listing` 入口进一步降权，避免工具方入口压过“探索 / 榜单 / 分类”主路径，并通
  过本地 `pnpm run build`。
- 2026-07-17：`best-ai-tools/[topic]` 榜单页里的 `Submit` 入口进一步降权，并在侧栏补了更克制的提交入口，确保榜单页仍然先
  把用户导向对比和指南，并通过本地 `pnpm run build`。
- 2026-07-17：`new` 本周新增页里的 `Submit` 入口进一步降权，避免“最近新增”入口把用户过早带去提交页，并通过本地
  `pnpm run build`。
- 2026-07-16：`categories/[slug]` 分类页补齐决策顺序信号，让分类页先承担筛选、再承担缩小 shortlist、最后承接到具体工具页
  的入口职责，并通过本地 `pnpm run build`。
- 2026-07-16：`guides` 总入口补齐任务优先、比较优先和后补背景的决策顺序信号，让指南 hub 更像先分流再深入的入口，并通过本
  地 `pnpm run build`。
- 2026-07-16：`ai-tools-for-developers` 指南页补齐编辑器 / API / 自动化层的决策顺序信号，让开发者高意图页更像先判断工作
  层再去比对的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`ai-tools-for-marketing` 指南页补齐广告 / 邮件 / 社媒的决策顺序信号，让营销高意图页更像先判断渠道再去比对
  的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`ai-seo-tools` 指南页补齐关键词 / 内容 / 排名监控的决策顺序信号，让 SEO 高意图页更像先判断工作流再去比对的
  入口，并通过本地 `pnpm run build`。
- 2026-07-16：`ai-tools-for-agents` 指南页补齐单步回答 / 多步骤执行 / 团队落地的决策顺序信号，让 Agent 高意图页更像先判
  断执行复杂度再去比对的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`ai-tools-for-automation` 指南页补齐简单连线 / 可维护流程 / 团队交接的决策顺序信号，让自动化高意图页更像先
  判断流程复杂度再去比对的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`ai-tools-for-content-creation` 指南页补齐脚本 / 封面 / 批量发布的决策顺序信号，让内容创作高意图页更像先判
  断内容类型再去比对的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`ai-tools-for-sales` 指南页补齐线索 / 跟进 / CRM 的决策顺序信号，让销售高意图页更像先判断销售流程再去比对
  的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`ai-productivity-tools` 指南页补齐省时 / 协作 / 自动化的决策顺序信号，让生产力高意图页更像先判断工作目标再
  去比对的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`ai-chatbot-tools` 指南页补齐通用问答 / 知识库 / 团队协作的决策顺序信号，让聊天机器人高意图页更像先判断使
  用场景再去比对的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`ai-tools-for-ecommerce` 指南页补齐商品 / 客服 / 营销的决策顺序信号，让电商高意图页更像先判断业务重点再去
  比对的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`ai-tools-for-designers` 指南页补齐品牌视觉 / 样片 / 授权交付的决策顺序信号，让设计高意图页更像先判断交付
  类型再去比对的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`ai-tools-for-api-observability` 指南页补齐日志 / 追踪 / 成本 / 质量的决策顺序信号，让 API 可观测高意图页
  更像先判断信号再去比对的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`ai-tools-for-code-review` 指南页补齐 PR 解释 / 风险检查 / 团队反馈的决策顺序信号，让代码审查高意图页更像
  先判断使用场景再去比对的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`ai-tools-for-meeting-notes` 指南页补齐转写 / 纪要整理 / 行动项提取的决策顺序信号，让会议纪要高意图页更像
  先判断会议工作流再去比对的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`ai-tools-for-protocol-analytics` 指南页补齐健康 / 使用量 / 趋势的决策顺序信号，让协议分析高意图页更像先判
  断观察目标再去比对的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`ai-tools-for-model-routing` 指南页补齐统一出口 / 成本治理 / 回退控制的决策顺序信号，让模型路由高意图页更
  像先判断治理目标再去比对的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`ai-tools-for-customer-support` 指南页补齐回复草稿 / 知识库问答 / 首轮分流 / 自动化的决策顺序信号，让客服
  高意图页更像先判断支持工作流再去比对的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`ai-tools-for-small-business` 指南页补齐营销 / 客服 / 自动化 / 团队协作的决策顺序信号，让小企业高意图页更
  像先判断业务场景再去比对的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`ai-tools-for-voice` 指南页补齐转写 / 配音 / 语音对话的决策顺序信号，让语音高意图页更像先判断音频工作流再
  去比对的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`ai-note-taking-tools` 指南页补齐会议记录 / 灵感记录 / 知识整理的决策顺序信号，让笔记高意图页更像先判断记
  录场景再去比对的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`ai-tools-for-agencies` 指南页补齐代理商 / 服务团队 / 内容工作室 / 顾问的决策顺序信号，让代理高意图页更像
  先判断交付模型再去比对的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`ai-tools-for-students` 指南页补齐查资料 / 做笔记 / 写作业 / 整理知识的决策顺序信号，让学生高意图页更像先
  判断学习场景再去比对的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`ai-tools-for-crypto-portfolio-tracking` 指南页补齐组合 / 持仓 / 异动提醒的决策顺序信号，让资产追踪高意图
  页更像先判断工作目标再去比对的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`ai-tools-for-crypto-research` 指南页补齐市场研究 / 链上追踪 / 赛道情报的决策顺序信号，让 Crypto 研究高意
  图页更像先判断研究目标再去比对的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`ai-tools-for-wallet-research` 指南页补齐地址画像 / 资金线索 / 历史轨迹的决策顺序信号，让钱包研究高意图页
  更像先判断研究对象再去比对的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`ai-tools-for-dex-analytics` 指南页补齐交易对 / 池子 / 流动性的决策顺序信号，让 DEX 分析高意图页更像先判断
  观察目标再去比对的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`ai-tools-for-token-research` 指南页补齐数据源 / 链上追踪 / 市场情报的决策顺序信号，让代币研究高意图页更像
  先判断研究目标再去比对的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`ai-tools-for-on-chain-analysis` 指南页补齐地址追踪 / 资金流 / 行为复盘的决策顺序信号，让链上分析高意图页
  更像先判断分析对象再去比对的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`ai-tools-for-wallet-monitoring` 指南页补齐钱包提醒 / 阈值监控 / 异常告警的决策顺序信号，让钱包监控高意图
  页更像先判断告警对象再去比对的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`ai-tools-for-web3-analysis` 指南页补齐链上变化 / 协议状态 / 风险观察的决策顺序信号，让 Web3 分析高意图页
  更像先判断分析目标再去比对的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`ai-tools-for-lead-generation` 指南页补齐名单来源 / 筛选深度 / 导出衔接的决策顺序信号，让获客高意图页更像
  先判断线索来源再去比对的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`ai-tools-for-evals-comparison` 对比页补齐评分逻辑 / 结果复盘 / 验收流程的决策顺序信号，让 Evals 对比页更
  像先判断验证目标再去比对的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`ai-tools-for-creators` 指南页补齐选题 / 脚本 / 封面 / 剪辑 / 再包装的决策顺序信号，让创作者高意图页更像先
  判断创作阶段再去比对的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`ai-tools-for-defi-analytics` 指南页补齐流动性 / 收益 / 协议行为的决策顺序信号，让 DeFi 分析高意图页更像先
  判断分析目标再去比对的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`ai-writing-tools-comparison` 对比页补齐起稿 / 改写 / 长文生产的决策顺序信号，让写作工具对比页更像先判断写
  作阶段再去比对的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`ai-tools-for-prompt-testing` 指南页补齐 prompt 版本 / 评估集 / 回归验证的决策顺序信号，让 prompt 测试页更
  像先判断验证目标再去比对的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`ai-tools-for-dex-analytics-comparison` 对比页补齐交易对 / 流动性 / 研究输出的决策顺序信号，让 DEX 分析对
  比页更像先判断观察目标再去比对的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`ai-tools-for-model-routing-comparison` 对比页补齐统一入口 / 回退策略 / 成本治理的决策顺序信号，让模型路由
  对比页更像先判断治理目标再去比对的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`ai-tools-for-evals` 指南页补齐评分标准 / 数据集 / 上线验收的决策顺序信号，让 Evals 指南页更像先判断验证目
  标再去比对的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`ai-tools-for-creators-comparison` 对比页补齐脚本 / 再包装 / 发布的决策顺序信号，让创作者对比页更像先判断
  产出阶段再去比对的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`ai-tools-for-designers-comparison` 对比页补齐品牌视觉 / 单张设计 / 团队交付的决策顺序信号，让设计对比页更
  像先判断交付阶段再去比对的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`ai-tools-for-web3-analysis-comparison` 对比页补齐协议 / 钱包 / 资金流的决策顺序信号，让 Web3 分析对比页更
  像先判断研究目标再去比对的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`ai-tools-for-api-observability-comparison` 对比页补齐日志 / 成本 / 评估闭环的决策顺序信号，让 API 可观测
  对比页更像先判断生产判断目标再去比对的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`ai-tools-for-customer-support-comparison` 对比页补齐回复 / 分流 / 知识库的决策顺序信号，让客服对比页更像
  先判断支持工作流再去比对的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`n8n-alternatives-comparison` 对比页补齐控制力 / 可维护性 / 开发者适配的决策顺序信号，让自动化对比页更像先
  判断工作流复杂度再去比对的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`ai-video-tools` 指南页补齐剪辑 / 生成 / 字幕 / 配音 / 导出的决策顺序信号，让视频工具页更像先判断制作阶段
  再去比对的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`ai-tools-for-code-review-comparison` 对比页补齐 diff / 风险 / PR 流程的决策顺序信号，让代码审查对比页更像
  先判断 review 目标再去比对的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`ai-tools-for-crypto-research-comparison` 对比页补齐项目研究 / 钱包研究 / 协议分析的决策顺序信号，让
  Crypto 研究对比页更像先判断研究目标再去比对的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`how-to-choose-ai-tools` 指南页补齐场景 / 价格限制 / 最近更新的决策顺序信号，让全站选型入口更像先判断选择
  维度再去比对的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`best-free-ai-tools` 指南页补齐真正免费 / 试用 / 候选筛选的决策顺序信号，让免费入口更像先判断选择维度再去
  比对的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`free-ai-tools` 指南页补齐长期免费 / 试用 / 团队对齐的决策顺序信号，让免费总入口更像先判断使用期限再去比对
  的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`ai-image-tools` 指南页补齐生成 / 修图 / 抠图 / 品牌素材的决策顺序信号，让图像高意图页更像先判断创作任务再
  去比对的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`ai-coding-tools` 指南页补齐补全 / 聊天式方案 / 仓库上下文的决策顺序信号，让编程高意图页更像先判断开发方式
  再去比对的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`ai-tools-for-meeting-notes-comparison` 对比页补齐转写 / 整理 / 行动项提取的决策顺序信号，让会议纪要对比页
  更像先判断会议输出再去比对的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`ai-writing-tools` 指南页补齐博客 / 邮件 / 社媒 / SEO 的决策顺序信号，让写作高意图页更像先判断内容类型再去
  比对的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`ai-tools-for-sales-prospecting` 指南页补齐线索筛选 / 个性化外联 / 销售对齐的决策顺序信号，让销售拓客页更
  像先判断触达类型再去比对的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`poe-alternatives-comparison` 对比页补齐多模型聚合 / 模型切换 / 对话流畅度的决策顺序信号，让 Poe 对比页更
  像先判断入口类型再去比对的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`zapier-alternatives-comparison` 对比页补齐简单连接器 / 复杂编排 / 长期维护的决策顺序信号，让 Zapier 对比
  页更像先判断流程复杂度再去比对的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`salesforce-einstein-alternatives-comparison` 对比页补齐企业级 CRM AI / 销售辅助 / 集成治理的决策顺序信
  号，让 Salesforce Einstein 对比页更像先判断企业落地层再去比对的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`ai-web3-tools-comparison` 对比页补齐协议 / 链上 / 钱包研究的决策顺序信号，让 Web3 对比页更像先判断研究层
  级再去比对的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`ai-agent-tools-comparison` 对比页补齐单步回答 / 多步骤执行 / 生产治理的决策顺序信号，让 Agent 对比页更像
  先判断执行层级再去比对的入口，并通过本地 `pnpm run build`。
- 2026-07-16：`ai-tools-for-web3` 指南页补齐链上分析 / 钱包监控 / 协议研究的决策顺序信号，让 Web3 指南页更像先判断研究层
  级再去比对的入口，并通过本地 `pnpm run build`。
