# AI 工具决策平台差异化与商业化实施路线图

创建日期：2026-09-01  
状态：执行中  
上位计划：[收录与搜索质量主计划](./MASTER_OPTIMIZATION_TRACKER_CN.md)  
关联计划：[四周证据驱动目录优化计划](./FOUR_WEEK_EVIDENCE_LED_DIRECTORY_PLAN_CN.md)

字段级三阶段实施规格：[AI 工具决策平台三阶段实施方案](./DECISION_PLATFORM_THREE_PHASE_IMPLEMENTATION_CN.md)

自动验收规格：[决策平台自动化测试与发布验收](./DECISION_PLATFORM_AUTOMATED_ACCEPTANCE_CN.md)

SEO 架构护栏：[SEO 信息架构与不可回退规则](./SEO_INFORMATION_ARCHITECTURE_GUARDRAILS_CN.md)

## 一、最终定位

### 搜索主题

AI Best Tool 对 Google 和普通访客的基础身份保持不变：

> **AI 工具目录 / AI tools directory**

首页 title、H1、正文、可抓取分类/工具链接、canonical、`WebSite` schema 和 sitemap 均继续围绕这个主题，不改成抽象的咨询、
采购或“decision intelligence”网站。

### 用户价值

在目录主题之上增加可感知的差异：

> **选 AI 工具，不只看推荐，还要看证据、限制和变化。**
>
> **Compare AI tools with evidence, limits, and changes you can verify.**

`Best` 保留为品牌和具备明确方法的任务型搜索语言，不承诺存在适合所有人的唯一第一名。

## 二、SEO 安全结论

结论：本路线不会削弱 Google 对站点的理解，且在以下约束下有利于内容质量。

### 必须保持

- 首页 title 和唯一 H1 明确包含 `AI tools / AI 工具` 与目录、发现或比较语义。
- 首页继续输出真实工具、分类、Guide 和详情页的可抓取文本链接。
- `AI Best Tool`、canonical、hreflang、`WebSite` / `Organization` schema 保持一致。
- 工具页仍以具体产品与任务为主，不把同一定位文案批量铺到每个 URL。
- 来源、限制、核查日期和变化记录必须对应真实数据，不批量伪造“最近更新”。
- 赞助、优先审核和 Featured 与编辑结论明确分离，付款不影响 `Best for`、限制或公开资格。

### 禁止事项

- 不把首页主标题改成只有 `decision intelligence`、`evidence platform` 等抽象词。
- 不删除目录库存、分类和内部链接来换取品牌化视觉。
- 不为每种关键词组合生成新的 comparison / alternatives 页面。
- 不用统一 AI 文案替换真实产品差异，不因无变化而刷新日期。
- 不把 Featured、付费提交或 owner 自报信息写成独立编辑背书。

### 自动回归要求

- 首页 metadata 保留中英文目录主题。
- 首页只有一个明确主 H1，且包含 AI 工具语义。
- 首页可见“证据 / 限制 / 变化”和英文对应表达。
- 首页首屏不出现付费曝光主卡；商业入口位于 owner 区域且明确不影响编辑判断。
- `WebSite` schema、搜索入口、Explore、Guide、分类和工具链接保持。
- 每批变更通过专项脚本、TypeScript、完整 build 和生产 SEO smoke。

## 三、产品护城河

不继续横向堆“精选、每日更新、更多分类”等竞品已有卖点。只做深三条相互联动的数据能力：

1. **Decision Card**：明确任务、`Best for`、`Watch outs`、`Compare next` 和首要核验建议。
2. **Evidence Ledger**：每条重要判断标记来源类型、核查日期、状态、冲突和失效边界。
3. **Change Timeline**：记录价格、额度、隐私、兼容性和产品定位发生了什么变化，以及判断为何调整。

数据飞轮：AI 发现变化 -> 创建待审差异 -> 编辑或 owner 核实 -> 更新证据账本 -> Decision Card 调整 -> Guide / 分类消费同一
判断 -> 用户纠错继续补证据。

## 四、实施计划

| ID        | 优先级 | 任务                            | 验收标准                                                        |     预计 | 状态                                                  |
| --------- | ------ | ------------------------------- | --------------------------------------------------------------- | -------: | ----------------------------------------------------- |
| POS-01    | P0     | 首页 SEO 安全定位收口           | 保留目录 title/H1/schema；首屏明确证据、限制、变化              |   0.5 天 | 已完成；专项测试、tsc、完整 build 通过                |
| POS-02    | P0     | 首页可信方法模块                | 用 3 个可理解步骤替代内部化、冗长的通用信号面板                 |   0.5 天 | 已完成；净减少重复首页内容                            |
| POS-03    | P0     | 商业与编辑边界                  | 首屏移除付费曝光卡，owner 区域保留次级入口并披露不影响结论      |  0.25 天 | 已完成；付费入口已下移                                |
| POS-04    | P0     | 首页定位自动回归                | 目录主题、差异表达、商业边界和核心链接可自动校验                |  0.25 天 | 已完成；`test:home-positioning` 通过                  |
| EVD-01    | P1     | Evidence Ledger 数据模型        | claim 级来源、来源类型、核查日、状态、冲突、失效边界统一        |     1 天 | 已完成；Supabase 迁移与只读验收通过                   |
| EVD-02    | P1     | 工具页 Evidence Ledger UI       | 核心判断可以展开查看证据，不以单一分数替代解释                  |     1 天 | 已完成；有效工具身份产生 verified 数据后自动展示      |
| EVD-03    | P1     | 后台证据编辑与冲突处理          | 官方、独立、owner、用户来源分开；冲突不自动覆盖                 | 1-1.5 天 | 已完成；首条人工核验、状态保护、处理中反馈已落地      |
| EVD-04    | P1     | 情报档案身份映射收口            | tool 档案 owner_id 必须对应真实目录工具；错误身份不可继续同步   |   0.5 天 | 已完成；站点迁移、缓存修复、Fathom 公开闭环均通过     |
| CHG-01    | P1     | Change Timeline 模型与读取      | 真实事实变化和“仅复核、无变化”可区分                            |     1 天 | 已完成；迁移、读写边界、后台/前台读取与测试均通过     |
| CHG-02    | P1     | 首批 10-20 个核心工具变化时间线 | 每页至少有基线核查；无变化不伪造更新事件                        |   1-2 天 | 进行中；Fathom、Claude、Consensus 已完成，当前 3/10   |
| LNK-01    | P1     | Guide / 分类消费统一判断        | 不复制工具事实；链接到对应 Decision Card 和证据                 |     1 天 | 已纳入 DCF 与 SEO-IA 实施规格，待执行                 |
| MON-01    | P1     | 30/90 天监测闭环                | 事实到期、判断到期和变化待审可筛选                              |   0.5 天 | 待执行                                                |
| DCF-01~07 | P1     | Finder + Decision Card 2.0      | 字段级模型、规则、后台、前台、SEO 与自动验收完整闭环            |   6.5 天 | 已完成；统一 release gate 与本地 production smoke 通过 |
| STK-01~06 | P1     | Stack Audit + 7-Day Trial       | 私有 Stack、审计、试用、提醒与 RLS 闭环                         |   5.5 天 | 进行中（5/6）；STK-01~05 已完成，生产迁移与恢复态验收通过，仅剩 STK-06 隐私、SEO 与生产发布验收 |
| SIG/WAT   | P1     | Verified Usage + Change Watch   | 审核聚合、利益披露、变化通知与去重                              |   5.5 天 | 等待阶段二真实使用门槛                                |
| COM-01    | P2     | 保持一次性 Priority / Featured  | 付款不保证通过、排名、流量或编辑背书                            |     持续 | 已有，需持续审计                                      |
| COM-02    | P2     | Verified Profile 付费验证       | 先完成 owner 变更、页面引用、到期提醒和基础数据，再决定是否收费 |   2-3 天 | 条件触发                                              |
| COM-03    | P2     | Buyer Decision Brief 试点       | 先用 3 个真实需求验证是否有人为 shortlist 与证据报告付费        |   2-3 天 | 条件触发                                              |
| COM-04    | P2     | 结构化数据/API 商业验证         | 证据与变化数据覆盖和稳定性达到门槛后才开放                      | 后续周期 | 条件触发                                              |

## 五、发布与收录节奏

- 2026-09-02：同日复核 n8n 实时价格和关键边界后，迁移既有 fallback；不创建第二条 canonical。
- 2026-09-03：同日复核 OpenRouter 价格、provider 数、隐私与 ZDR 边界后，迁移既有 fallback。
- 日常可审核多个候选，但每天只新增并公开 1-2 个合格工具；新工具默认 `monitor/noindex`。每天最多批准 1 个、每周最多 5 个
  进入索引；不合格时允许新增或批准 0 个。唯一口径见 [工具页索引发布与节奏控制](./TOOL_INDEX_RELEASE_POLICY_CN.md)。
- 首页、Evidence Ledger 和 Change Timeline 可以并行开发，但任何代码任务仍独立完成测试、build 和状态更新。

## 六、商业化路线

### 阶段 A：当前

- 免费提交继续开放。
- Priority Review `$9`、Featured 3/7/14 天 `$9/$19/$29`、Launch Bundle `$39` 保留。
- 这部分只提供处理时效和标注清楚的曝光窗口，不出售编辑结论。

### 阶段 B：可信资料维护

只有在 owner 可以完成认领、提交变化、查看引用、收到到期提醒并看到基础效果后，才测试 `Verified Profile`：

- Pro 候选价：`$19/月`、`$190/年`。
- Agency 候选价：`$49/月`、`$490/年`。
- 未达到功能门槛前不重新开放订阅，不沿用已暂停的分发工作台作为收费理由。

### 阶段 C：买家决策

- 单次 Decision Brief 候选价：`$29-$99`。
- 团队变化监控候选价：`$49-$149/月`。
- 先用人工增强方式验证三个真实需求，再产品化，不先做复杂工作台。

### 阶段 D：数据/API

当至少 100 个核心工具拥有稳定的 claim 级来源、变化历史和复查记录后，再验证面向 AI Agent、研究团队或软件采购系统的 API /
数据许可。

## 七、阶段指标与停止规则

### 产品指标

- 首页进入工具详情、Guide 或比较页的点击率。
- Decision Card 到 Evidence Ledger 的展开率。
- `Compare next` 点击率。
- 7/28 天回访用户和 owner 更新数。
- 至少 20 个核心工具有真实核查基线，随后产生可解释的变化历史。

### 搜索指标

- 首页继续承接 `AI tools directory` 主题。
- 非首页展示占比、获得展示的详情页数和长尾 query 增长。
- 新工具索引率不低于现有准入阈值。
- 不因定位改造增加 URL，也不引发 title、canonical、schema 或 sitemap 回退。

### 商业触发条件

- Featured 继续有真实购买且披露清楚，可保留。
- Verified Profile 必须先有至少 10 个真实 owner 使用维护能力，再决定订阅。
- Decision Brief 必须先完成 3 个真实交付并获得至少 1 次付费意愿验证。
- API 必须先有数据覆盖和外部需求，不以“未来可能需要”为由提前开发。

## 八、方案 Review（2026-09-01）

| 风险                           | 结论   | 控制                                                          |
| ------------------------------ | ------ | ------------------------------------------------------------- |
| Google 不再理解为 AI 工具目录  | 可控   | title、H1、库存、内链、schema 均保留目录语义                  |
| 首页品牌化导致关键词和点击损失 | 可控   | 差异表达作为副主张，不替换目录搜索语言                        |
| “Evidence”沦为另一句营销话术   | 中风险 | 必须连接真实来源、日期、限制和变化，不使用空标签              |
| AI 批量内容被视为低价值        | 已控制 | AI 只生成待审差异；公开仍需市场与资料双重准入                 |
| 赞助破坏编辑独立性             | 中风险 | 商业入口下移、明确披露、收费不影响判断和公开资格              |
| 过早开发复杂订阅/API           | 高风险 | 设 owner、交付和数据覆盖触发条件，未触发不开发                |
| 首页继续堆叠模块导致体验变差   | 中风险 | POS-02 用紧凑方法模块替换既有冗长通用面板，不新增一层重复模块 |

Review 结论：方案可实施。P0 不改变 URL 和索引面，先增强主题清晰度与用户可信度；P1 构建数据护城河；P2 只有在真实需求和功
能门槛满足后触发。

## 九、首批实施记录（2026-09-01）

- 首页 metadata 保留 `AI Tools Directory / AI 工具目录`，描述增加来源、限制、核查日期和真实变化，不改变 canonical 或
  schema。
- 唯一 H1 调整为“用证据、限制和真实变化比较 AI 工具”，中英文均保留 AI 工具主题。
- 删除首屏泛化的“每日更新”承诺，改为可验证的“来源 + 限制”和 30/90 天复查框架。
- 用三步可信方法替换原首页冗长的通用信号面板，减少重复模块和内部 SEO 术语。
- Priority / Featured 入口从首屏下移到工具方区域，并明确付款只影响审核时效或标注展示，不影响编辑结论和公开资格。
- 新增 `pnpm run test:home-positioning`，自动保护 title、唯一 H1、核心差异、可抓取入口和商业边界。
- 生产模式 DOM 复核发现并修正共享 Footer 使用 H1 的历史语义问题；FAQ 标题同步收口为 `h2/h3/p`，公开页主标题不再被页尾品
  牌名干扰。
- 验收：首页专项测试、全部候选预审门禁、TypeScript 和完整 `pnpm run build` 均通过；AdSense 验证通过，43/43 静态页生成完
  成。最终本地生产模式 DOM 显示中英文首页各只有一个 H1，目录 title、三项差异信号与商业披露均可见，旧“每日更新”和旧联系方
  式不再出现在可见正文。

## 十、Evidence Ledger 数据模型实施记录（2026-09-01）

- 复用 `product_intelligence_profiles / sources / claims`，不创建第二套证据实体，signals 和 changes 后续仍汇入同一
  profile 与 claim 流程。
- claim 新增 `source_id / source_type`、显式核验状态与日期、复查期限、已知失效时间、实际失效原因和结构化适用边界；历史
  `expires_at` 保留为已知事实失效边界。
- 机器提取和历史未明确审核的 claim 默认保持 `candidate`，不会因为来源是官网或 profile 为 ready 就自动成为 `verified`。
- `review_due` 只触发复查队列，不静默删除事实；`expired / invalidated / confirmed conflict` 不允许支撑公开 Decision
  Card。
- 新增统一读取模型 `ProductEvidenceLedgerEntry`，兼容迁移前历史 claim 的 URL 关联，并为 EVD-02 前台展示提供稳定字段。
- 新增 `pnpm run test:evidence-ledger` 和 `pnpm run verify:evidence-ledger-migration`。前者已通过；后者当前按预期报告
  Supabase 尚缺新字段，需执行迁移后复验。
- 待执行迁移：`db/supabase/migrations/20260901_evidence_ledger_model.sql`。该迁移幂等，不重写既有 claim 内容，不把候选批
  量升级为已核验。

迁移验收（2026-09-02）：`pnpm run verify:evidence-ledger-migration` 返回成功；37 条历史 claim 均保持 `candidate`，source
与 claim 新字段可读，EVD-01 正式关闭。

## 十一、工具页 Evidence Ledger UI 实施记录（2026-09-02）

- 工具页唯一 Decision Card 后增加条件式 Evidence Ledger，形成“先看判断，再展开核对依据”的阅读顺序；市场信号模块继续位于
  其后。
- 公开查询只读取 `verification_status = verified` 的 claim；candidate、rejected 和 superseded 内容不会出现在公开页。
- 每条证据使用原生可展开项展示 claim 值、来源类型、短摘录、核查日期、下次复查、已知失效时间、适用范围、核验备注和来源链
  接。
- 到期复查、冲突、过期和失效状态显式提示；过期、失效或确认冲突内容不会被计入“可支撑判断”。
- UI 不新增证据评分，避免把不同来源和边界压缩成一个缺乏解释的数字。
- Supabase 查询失败时该增强模块安全隐藏，不影响工具详情页主体、Decision Card、SEO metadata 或结构化数据渲染。
- 公开模块仍只读取 verified 数据；2026-09-02 已对 AI Best Tool 首页定位完成首条人工核验，其余 36 条仍为 candidate。
- 本次审计确认现有 AI Best Tool 情报档案的 `owner_id` 不对应当前目录工具记录，因此不虚报为“公开工具页已展示”。新同步命令
  已增加目录工具 ID 校验；EVD-04 将先修复存量身份映射，再为真实工具建立公开证据基线。

## 十二、后台证据审核实施记录（2026-09-02）

- 后台 Claims 支持 candidate、verified、rejected、superseded 的受控流转，并区分 official、independent、owner、user、
  editorial 来源。
- possible 或 confirmed 冲突禁止直接核验，保存审核不会自动清除冲突；verified 转 superseded 必须填写失效原因。
- verified 与 rejected 必须填写人工备注；核验时记录管理员、核验时间、30 天默认复查日、已知失效日和结构化适用范围。
- 每条 claim 的保存按钮提供 spinner、禁用态和成功/失败 toast，避免点击后无反馈。
- 后台 verified 统计已改为仅统计 `verification_status = verified` 且无冲突的 claim，不再把所有无冲突候选误算为已核验。
- 首条真实核验为 AI Best Tool 首页定位原文；线上原文、来源 URL 和无冲突状态均已人工确认。旧的分发订阅价格 claim 与当前产
  品状态不一致，继续保持 candidate，不得进入公开证据。

## 十三、情报身份映射实施记录（2026-09-02）

- 数据模型新增 `site` owner 类型，平台自身证据不再伪装成目录工具；幂等迁移位于
  `db/supabase/migrations/20260902_intelligence_owner_identity.sql`。
- 迁移只原位修改 AI Best Tool 档案的 owner 类型并写入重分类原因，sources、claims、assets、verified 状态和审核历史不会重
  建或丢失。
- `tool` 同步在抓取前通过 Neon 目录校验 UUID；无效 ID 会直接失败并提示从 `/admin/tools/<uuid>/edit` 获取正确 ID。
- CLI 明确接受 tool、distribution_project、site 三种类型；第三方 CSS 解析错误被隔离，抓取结束后主动关闭连接与进程，避免
  假性卡住。
- 已使用真实目录工具 Fathom（目录 UUID `7ae4bbb2-847f-45cc-9294-e96663fa02a3`）完成抓取、candidate 写入、人工核验和公开
  读取闭环。生产 `/cn/ai/fathom` 已出现 Evidence Ledger，线上逐字确认的定位 claim 为唯一 verified 内容。
- Fathom 自动提取中混入页面结构文案的 pricing claims 全部保持 candidate，证明机器候选不会为了填充页面而被批量放行。
- verified 口径已在后台统计、snapshot、quality scorer、factual gate 和 evidence composer 中统一为“显式 verified 且无冲突
  ”；不再把 conflict-free candidate 当作已验证内容或发布加分项。
- 迁移执行后 `pnpm run verify:intelligence-owner-migration` 已返回 `ownerType: site`、`verifiedClaims: 1`，EVD-04 正式关
  闭。
- 存量 metadata 快照已通过 `pnpm run repair:intelligence-verification-summaries` 全量重算：AI Best Tool 为 1 verified /
  36 candidate，Fathom 为 1 / 10，MOXION.AI 为 0 / 0。
- 旧快照中的机器提取内容由容易误解的 `facts` 无损迁移为 `candidateFacts`，并标记
  `factsSemantics: machine_extracted_candidates`；后续同步持续使用这一语义。

## 十四、Change Timeline 模型与读取实施记录（2026-09-02）

- 新增独立的 `product_intelligence_timeline_events` 正式时间线，不复用机器差异队列 `product_intelligence_changes`；机器
  发现的变化不会自动成为历史事实。
- 事件明确区分 `fact_added / fact_changed / fact_removed` 与 `reviewed_no_change`。完成复核但事实未变化时记录审核检查
  点，不伪造“产品更新”。
- 每条事件保留复核范围、claim 身份、前后值、来源、发生时间、核验时间、核验人、备注和 `internal / public` 可见性。
- 数据库约束要求事实变化必须绑定 claim；公开事件必须包含 HTTP(S) 来源。表已启用 RLS，不向匿名客户端开放直接写入能力。
- 后台 Intelligence 详情页新增独立 Change Timeline 区域，与待审核机器差异并列但不混合；空状态也明确说明“无变化复核”和“事
  实变化”的区别。
- 新增公开只读服务，仅允许读取真实 `tool` 档案且 `visibility = public` 的事件；站点级档案、内部记录和待审差异不会进入公
  开工具页数据。
- 专项测试 `pnpm run test:intelligence-change-timeline`、Evidence Ledger 回归、intelligence foundation 回归和 TypeScript
  全量检查均已通过。
- 待执行幂等迁移：`db/supabase/migrations/20260902_product_intelligence_timeline.sql`。执行后运行
  `pnpm run verify:intelligence-timeline-migration`；返回 `timelineSchemaReadable: true` 后关闭 CHG-01。
- CHG-02 不自动补造历史变化。首批核心工具应先写入真实的基线复核或 `reviewed_no_change`，后续只有人工确认的变化才能写入
  `fact_*` 事件。

## 十五、首批工具变化基线实施记录（2026-09-02）

- Change Timeline 迁移验收返回 `timelineSchemaReadable: true`，CHG-01 正式关闭。
- 后台新增受控的时间线编辑器，所有提交均有处理中、成功和失败反馈；公开事件仅允许真实目录 `tool` 档案。
- `fact_added / fact_changed / fact_removed` 必须绑定当前档案中显式 verified 且无冲突的 claim；candidate、冲突 claim、其
  他档案 claim 和无来源公开事件均在 Server Action 层拒绝。
- 工具详情页在 Evidence Ledger 后条件式展示 `Review & Change Timeline`；无 public 事件时不渲染空模块，不批量增加模板正
  文。
- 新增幂等命令 `pnpm run intelligence:seed-timeline-baseline -- --owner-id=<tool-uuid>`。它只接受真实工具 UUID、已完成核
  验日期和至少一条 verified 且无冲突证据，重复执行不会重复插入。
- Fathom（UUID `7ae4bbb2-847f-45cc-9294-e96663fa02a3`）已建立首条公开 `reviewed_no_change` 基线，来源为官方首页，发生时
  间沿用真实人工核验时间；公开读取回查成功，重复执行返回 `baseline_already_exists`。
- 当前 CHG-02 真实进度为 3/10。其余核心工具必须先完成 intelligence 抓取和至少一条人工 claim 核验，再建立基线；不会直接把
  既有页面文案或机器提取结果批量包装为变化历史。
- Gamma 官网 dry-run 发现 11 个来源但未提取出 claim，暂不写入空档案，后续改用定向官方帮助/定价页采集。
- Claude 首次默认 dry-run 扩散到大型 Docs 站，产生 67 条候选和 42 个伪冲突；数据库写入前已拦截。同步命令新增
  `--max-pages`、`--no-sitemap`、`--no-common-paths` 和 `--page-types`，用于大型产品站的定向证据采集，默认行为保持不变。
- Claude 使用 `homepage,pricing,product` 范围重新同步后收口为 16 条 candidate 和 2 条真实定位冲突；只对官方首页的无冲突
  `product_name = Claude` 完成人工核验，价格和两种定位文案继续保持 candidate / conflict。
- Claude（UUID `149cf3e0-5f5c-4bdf-ac02-80ec5064fb92`）已建立第二条公开 `reviewed_no_change` 基线，来源、核验人、核验时
  间和 30 天复查日均可追踪。
- DeepL 产品页、Pipedream 首页和 Cursor 首页均被各自 robots 明确禁止当前抓取；系统按规则停止且未写入。这三项不得通过关闭
  robots 检查绕过，后续进入受控的人工官方证据录入队列。
- DeepL Help Center 允许访问，但模板只提取到错误身份 `DeepL Help Center`，因此未创建工具档案或基线。
- Consensus 定向 dry-run 只产生 2 条 candidate、0 冲突；官方首页原始 HTML description 已逐字确认其“面向同行评审文献的 AI
  学术搜索引擎”定位。仅该定位 claim 被人工核验，产品名仍保持 candidate。
- Consensus（UUID `f15873ae-c6ef-4f0a-b811-b40c2aba76ab`）已建立第三条公开 `reviewed_no_change` 基线，下次复查日为
  2026-10-02。
