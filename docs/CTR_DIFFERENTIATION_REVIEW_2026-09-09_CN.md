# CTR 与差异化复核（2026-09-09）

上位计划：[收录与搜索质量主计划](./MASTER_OPTIMIZATION_TRACKER_CN.md)

站点级约
束：[SEO 信息架构与不可回退规则](./SEO_INFORMATION_ARCHITECTURE_GUARDRAILS_CN.md#metadata-稳定契约2026-09-09-冻结)

## 结论

现有差异化方向足够清楚，且与 Google 已识别的 `AI tools directory` 主题不冲突：AI Best Tool 不以数量取胜，而以任务适配、
可追溯证据、会改变选择的限制、核查日期和真实变化帮助用户排除不适合的工具。现在不需要重新发明定位，也不应把首页改成另一类
SaaS。

真正的缺口是“能力已经存在，但点击理由没有稳定出现在 SERP 和首屏”。2026-08-31 基线为 2,243 展示、13 点击、0.58% CTR、平均
排名 32.07；首页占 1,838 次展示，约 82%。低 CTR 同时受到排名较低和摘要表达不足影响，不能只通过改标题解释或解决。

## 已经成立的差异点

1. 每个合格工具围绕具体任务提供 `Best for`、`Watch outs` 和 `Compare next`，不是营销功能表。
2. 重要事实可连接官方或独立来源，并区分 candidate、verified 和 conflict。
3. 价格、额度、隐私、兼容性和产品边界按真实复查更新，不通过批量改日期伪造新鲜度。
4. Change Timeline、owner 更新、用户纠错和真实评论可以形成非 AI 的长期增量。
5. 公开、编辑推荐、付费 Featured 和索引资格彼此分离，商业付款不能购买“最佳”结论。

这些能力比普通目录更有长期价值，应继续保留。`Best` 的含义仍是“对明确任务和约束给出更适合的选择”，不是宣称存在唯一第一
名。

## 当前表达断点

| 问题                    | 当前表现                                                                           | 影响                                   |
| ----------------------- | ---------------------------------------------------------------------------------- | -------------------------------------- |
| 工具页 snippet 不稳定   | 非优先工具仍可能使用 `<产品名> - <分类> AI Tool` 与普通产品简介                    | 搜索结果看起来与其他目录相同           |
| 差异点出现太晚          | Decision Card、Evidence Ledger 和 Change Timeline 位于正文后部，首屏先展示常规简介 | 用户进入后不能立即确认本站多提供了什么 |
| 证据承诺覆盖不一致      | Evidence Ledger 只在存在 verified claim 时出现，但首页使用全站级证据承诺           | 部分工具页无法立即兑现首页承诺         |
| 首页指标命名不严谨      | 可见工具数量被标为 `Indexed tools`，实际不等于 Google 已索引工具                   | 削弱可信度，也混淆公开与索引           |
| Best 总入口存在运营视角 | 文案出现“转化”“付费升级”等内部目标，并把 Pricing CTA 放在强决策入口                | 用户价值被平台商业目标稀释             |
| 核查日期陈旧            | Explore 和 Best 总入口仍展示 7-8 月固定日期                                        | “持续复查”主张缺少一致的可见证明       |
| CTR 数据粒度不足        | 当前主要看全站 CTR，首页占大多数展示                                               | 无法判断哪个 snippet 修改真正有效      |

## 下一轮实施顺序

| ID          | 优先级 | 任务                             | 验收标准                                                                                   | 状态               |
| ----------- | ------ | -------------------------------- | ------------------------------------------------------------------------------------------ | ------------------ |
| CTR-DIFF-01 | P0     | 建立 indexable 页面 snippet 清单 | 输出当前 title、description、页面类型、建议意图和异常；不改 noindex 页                     | 已完成             |
| CTR-DIFF-02 | P0     | 工具页决策型 metadata 规则       | 标题保留产品名与核心任务；描述优先写适合谁、关键限制和核查价值，不杜撰价格或评分           | 已完成（4 个试点） |
| CTR-DIFF-03 | P0     | 首屏差异信号前移                 | 首屏可见任务结论、一个关键限制、核查状态和“查看依据”；没有 verified 证据时诚实显示覆盖状态 | 已完成             |
| CTR-DIFF-04 | P0     | 修正可信度文案                   | `Indexed tools` 改为准确的公开工具口径；移除 Best 页内部转化语言和首层 Pricing CTA         | 已完成             |
| CTR-DIFF-05 | P1     | 核查日期统一来源                 | 日期来自真实编辑/事实复核，不在 build 时自动刷新，不再长期硬编码旧日期                     | 已完成             |
| CTR-DIFF-06 | P1     | 高展示页面小批量实验             | 每周只改 3-5 个有展示页面；记录旧/新 snippet、query 意图和变更日                           | 已启动（4 个实体） |
| CTR-DIFF-07 | P1     | 14/28 天效果复盘                 | 同页比较 CTR、排名、展示和 query；排名变化与文案变化分开解释                               | 需要数据           |

并行前置项：`INTAKE-BUF-01` 需要把当前仅剩 3 条的成熟发布队列补到至少 7 条，否则“每天至少公开 1 个”的 SLA 无法持续。补池
只做候选发现和预审，不自动发布，也不改变索引预算。

## Metadata 规则草案

- 首页继续保留 `AI Tools Directory` 主题，不用纯品牌口号替换目录词。
- Tool title 采用“产品名 + 核心任务/决策角度”，避免所有页面重复 `AI Tool`。
- Description 的顺序为：解决的任务 -> 最适合谁或与同类的关键区别 -> 一个真实限制/需要核对的成本 -> 最近核查价值。
- 未核实的价格、使用量、评分、隐私或“最佳”结论不得进入 snippet。
- 不批量同时修改所有 indexable 页面；先选择已有展示的 3-5 页，避免无法归因。

## 风险复核

- 不新增 URL，不改变 canonical、hreflang、schema 主体或 sitemap 结构，因此不会改变 Google 对站点基础类型的理解。
- 不把同一句差异化口号复制到每个工具页；每页必须围绕自己的任务和限制生成摘要，避免新的模板化问题。
- CTR 低不能全部归因于标题。平均排名约 32 时，大量展示本身不在首屏；复盘必须同时看 position，不能把排名提升冒充文案效
  果。
- Evidence 覆盖不足时显示“已核查范围/待核查项”，不能隐藏缺口或伪造 verified 数量。
- 成熟工具每日公开 SLA 与索引实验分离；新增公开页不会自动扩大 Google 索引面。

## 竞品与 Google 规则复核

本轮只吸收竞品的信息组织优点，不复制其批量页面策略：

- Futurepedia 把任务类别、热门工具、教程和编辑标准放在同一发现路径，优点是用户先知道“从哪里开始”。
- Toolify 对“最新、最常使用、分类、地区”等发现入口标识清楚，优点是不同探索意图不会混在一个列表。
- G2 的类别页依靠真实评论、适用对象和比较维度建立决策信任，说明详情页不能只重复产品官网介绍。
- AI Best Tool 继续选择更窄的差异点：不争最大目录，而是把任务适配、关键限制、来源、核查日期和变化放在选择之前。

Google 官方规则要求 title 简洁、独特并与主标题一致；snippet 主要可能来自可见正文，程序化 description 只有在准确、逐页具
体和可读时才有价值；结构化数据必须对应可见内容。由此确定：本轮必须同时改 metadata 与首屏可见判断，不能只改 `<head>`，也
不能把同一句差异口号复制到每个工具页。

## CTR-DIFF-01 基线清单

2026-09-09 从生产 sitemap 审计 134 个可索引 URL，完整逐页结果保存在
`reports/seo/indexable-metadata-inventory-2026-09-09.json`：

| 页面类型        | URL 数 | 主要问题                                                              |
| --------------- | -----: | --------------------------------------------------------------------- |
| Home            |      2 | 无结构异常，目录主题与差异主张已一致                                  |
| Explore         |      2 | 无结构异常                                                            |
| Category        |      8 | 3 组中英文 title 重复，留待小批量本地化复核                           |
| Guide           |     38 | 9 组历史页面缺 canonical；另有 alias/主 Guide 重复需要单独合并判断    |
| Best root/topic |     58 | 中英文 title 多为同一英文值，不在本轮批量改写                         |
| Tool            |     26 | 20 个页面仍命中通用 `AI Tool` 标题模板；本轮仅选 4 个证据完整实体试行 |

清单发现的 9 组 Guide canonical 回退已在本轮改回统一 metadata builder。生产报告保留上线前原始结果，部署后重新运行同一命
令，结构性异常必须从 18 页降为 0；重复 title/description 和长度提示属于编辑复核项，不作为自动批量改写理由。

## 首批实施记录

- 首页公开数量改为 `Published tools / 公开工具`，不再把站内公开数冒充 Google 已索引数。
- Best 总入口移除“转化、付费升级、最容易转化”等内部话术，首层 Pricing CTA 改为选型方法，英文链接不再生成 `/en`。
- n8n、OpenRouter、Poe、Gemini 作为 4 个 metadata 试点；标题围绕核心任务和决策角度，description 只使用页面已有的成本、隐
  私、限制和工作流事实。
- 所有工具页首屏新增“任务适配、关键权衡、证据覆盖”摘要和 Decision Card 锚点；没有 V2 证据时显示缺口，不伪造 verified。
- 新增 `seo:metadata-inventory` 与 `test:ctr-differentiation`，并让门禁保护 4 个试点范围、可信文案、首屏摘要和 9 个
  Guide canonical。
- `CTR-DIFF-05` 新增 `lib/seo/contentReviewDates.ts` 作为核心入口的编辑复核登记表。Explore、Best 总入口和动态 Best 主题模板不再
  各自写死日期，也不会在 build 时自动刷新；每条记录同时保存复核范围和证据。2026-09-09 的复核只覆盖筛选、主题库存、榜单解释、
  工具资格与决策路径，不冒充所有榜单内工具的事实都在当天重验。其他 Guide 保留各自历史事实日期，后续只能在对应页面真实复核后
  逐页迁移。
- 动态 Best 模板最后一处“更容易转化 / 付费路径”内部运营话术已改为“下一步明确 / 核对详情、限制和官方来源”。
- `CTR-DIFF-06` 已建立可执行登记表 `reports/seo/ctr-snippet-experiments-2026-09-09.json`。首批固定为 n8n、OpenRouter、Poe、
  Gemini 四个实体，完整保存改前/改后双语 snippet、意图、变更日、14 天首次判断日和 28 天完整判断日；当前导出没有这四条的稳定
  URL 指标，因此 baseline 明确为 `null`，禁止伪造。Fathom、Web3 Guide、Automation Guide、DeepL 虽有 Week 7 展示，但现有摘要
  已经具体，暂列 hold 候选，不为了完成任务重复改写。

## 发布前验收

- `test:ctr-differentiation`、`test:home-positioning`、`test:localized-metadata`、`test:seo-architecture`、
  `test:tool-indexing`、`test:sitemap`、`test:editorial-review-dates` 与 `test:plan-consistency` 全部通过。
- TypeScript `--noEmit` 通过；完整 `pnpm run build` 明确完成，44/44 静态页生成，AdSense 标准组件校验继续通过。
- 本地 production server 对 sitemap 134 个 URL 逐页审计通过：结构性异常 18 -> 0；通用工具标题 20 -> 12，减少的 8 个 URL
  对应 n8n、OpenRouter、Poe、Gemini 四个实体的中英文试点。
- 本地真实 HTML 确认四个试点 title、工具页首屏判断摘要、Guide canonical 和 Best 选型 CTA 均已生效；未修改
  robots、sitemap 准入、实体 URL 或 schema 内容。
