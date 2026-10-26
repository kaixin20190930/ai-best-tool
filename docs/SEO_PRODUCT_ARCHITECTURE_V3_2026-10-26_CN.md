# AI Best Tool SEO 产品架构 V3

生效日期：2026-10-26

状态：**已批准，作为产品、SEO 与自动运营的当前执行基线**

关联文件：

- [Evidence-backed AI Tool Decision Platform 执行基线](./EVIDENCE_BACKED_DECISION_PLATFORM_EXECUTION_2026-10-12_CN.md)
- [自动运营 V2 全面执行方案](./AUTOMATED_OPERATIONS_V2_IMPLEMENTATION_2026-10-12_CN.md)
- [工具页索引发布政策](./TOOL_INDEX_RELEASE_POLICY_CN.md)

本文件统一产品定位、搜索意图、页面职责、Cluster 生产方式、证据等级和 12 周执行顺序。若旧文档中的页面数量、排期、关键词优先级或交付拆分与本文件冲突，以本文件为准；数据库安全、事实真实性、索引授权、法律和不可逆操作边界不因本文件放宽。

## 1. 结论

AI Best Tool 不再把“AI 工具目录”作为主要产品身份，而是：

> **用可追溯证据、真实限制和场景化比较，帮助用户选择合适 AI 工具的决策平台。**

工具收录是决策内容的供给，不是独立增长目标。一个新工具只有在能够服务真实决策任务、比较关系或已有搜索机会时，才进入优先生产队列。工具数量、页面数量、测试次数和审核轮数都不是 KPI。

## 2. 当前事实与问题

截至 2026-10-26：

- 生产共有 119 个 Tool ID，其中 83 个 `published`。
- `published` 中 28 个为 `continue_index`、53 个为 `monitor/noindex`、2 个为 `archive`。
- sitemap 共有 148 个 URL。
- 最近可用 GSC 完整数据截止 2026-10-14；刷新凭据仍失效，因此数据驱动扩张不得假装使用最新数据。
- 最近 7 天为 2 clicks / 996 impressions / CTR 0.20% / 平均排名 13.60；28 天为 7 / 1,881 / 0.37% / 14.32。
- `/ai/n8n` 已有真实曝光信号；Coding、n8n 和 DeepL 相关页面存在可以整合的页面资产，但部分搜索意图被多个 URL 分散。
- 首页 Title 仍带有 `AI Tools Directory`，与“证据驱动决策平台”的产品定位不完全一致。

核心问题不是工具太少，而是站点仍存在目录型定位、孤立工具页、重复意图和缺乏主从关系的页面结构。继续批量增加浅页面只会扩大低价值库存。

## 3. 唯一生产单位：Decision Cluster

后续内容生产以一个真实用户决策问题为单位，而不是以单个工具或单篇文章为单位。一个 Cluster 至少包含：

1. 一个明确决策任务和唯一主搜索意图。
2. 一个承担主答案的 canonical 页面。
3. 3-6 个角色不同的真实候选工具。
4. 关键结论的 Claim 级证据、限制和复查日期。
5. Tool、Task、Comparison、Guide 之间清楚的内链和下一步。
6. 可观察的 GSC 查询、页面行为或 outbound 行为。

Cluster 不是要求一次批量创建全部页面。它只要求每个页面有明确职责和下游消费位置；没有消费位置的工具保留在候选池，不发布孤立薄页。

## 4. 页面职责与唯一搜索意图

| 页面类型 | 唯一职责 | 默认索引策略 |
| --- | --- | --- |
| `/` | 决策平台入口和 Cluster 导航 | index，需单独 SEO 验证 |
| `/ai/{tool}` | 单一产品实体、证据、限制和适用边界 | 满足独立需求才 index，否则 monitor/noindex |
| `/best-ai-tools/{topic}` | 品类 shortlist、best-for 和购买决策 | 一个主题一个 canonical 主页面 |
| `/tasks/{slug}` | 围绕真实任务给出选择路径 | 证据和关系完整前 noindex |
| `/compare/{slug}` | 明确的 X vs Y 或小组结构化比较 | 默认 noindex，独立需求通过后再申请 index |
| `/guides/{slug}` | 设置、部署、要求和操作路径 | 与 best/compare 意图分离后可 index |
| Explore / Category | 浏览和发现 | 不承担主决策关键词 |

强制规则：**一个搜索意图只允许一个主 canonical 页面。** 发现多个页面争夺同一查询时，先做意图映射、合并或重定向评估，禁止新增同义 URL。删除、合并和重定向仍需 Owner 单独授权。

## 5. 工具三态模型

1. **核心评测 / 索引候选**：有独立品牌或长尾需求，被 Cluster 真实使用，内容和证据具有独立价值，可进入 A/B/C 索引分层。
2. **比较候选**：实体可公开且可被主决策页消费，但没有独立搜索价值，保持 `published + monitor/noindex`。
3. **后台候选**：身份、内容价值或下游消费位置不足，只进入候选池，不生成占位公开页。

每个候选至少记录：`clusterRole`、`comparisonTargets`、`downstreamConsumer`、`indexIntent` 和 Claim 级证据状态。模型名、版本名、功能表面和 API surface 默认归入父产品更新，不创建新的 Tool ID。

## 6. Claim 级证据等级

证据等级属于单条 Claim，不属于整页：

| 等级 | 定义 | 允许的表达 |
| --- | --- | --- |
| E0 | 官方公开来源核验 | “官方说明”“公开价格/能力” |
| E1 | 真实账户或结账界面核验 | 仅适用于该账户、地区和时间，不得泛化 |
| E2 | 有步骤、输入、时间和结果的受控实测 | 可以写“我们测试”，必须披露方法和边界 |
| E3 | 可复现、多样本或第三方可复核基准 | 可以做相对性能结论，必须公开方法和样本 |

页面可以混合 E0、E1、E2、conditional、unknown 和 conflict。没有 E2/E3 时，禁止使用“Real Tests”“我们测试了”或虚构样本规模。未核验的价格、额度、隐私、权利和账户权益只限制精确 Claim，不自动阻止成熟实体公开。

## 7. 第一阶段页面与关键词冻结

### 7.1 Coding Cluster

| 页面 | 目标意图 | 状态与动作 |
| --- | --- | --- |
| `/best-ai-tools/ai-coding-tools` | `best ai coding assistant`，KD 31.4，US 720/月 | P0 主决策页；升级现有页面，不新建同义页 |
| `/best-ai-tools/free-ai-coding-tools` | `free ai coding tools`，KD 25.8，US 170/月 | P0；先完成现有 free 意图查重 |
| `/best-ai-tools/ai-coding-tools` 内独立章节 | `best ai code editor`，KD 38.8，US 320/月 | 先做章节；只有 GSC 证明独立意图且至少 5 个真实 editor 候选时才拆页 |
| `/guides/ai-coding-tools` | 如何选择、工作流和实施指南 | 保持 Guide 职责，不争夺 best 意图 |
| `/guides/ai-coding-tools-comparison` | 与现有主页面重复 | 维持 noindex；后续合并/重定向另行授权 |

首批核心 Tool 升级候选为 Cursor、GitHub Copilot、Claude Code、Augment Code。只有内容、证据和 Cluster 角色完成的对象才升级，不以“凑够工具数”为目标。

### 7.2 Automation Cluster

| 页面 | 目标意图 | 状态与动作 |
| --- | --- | --- |
| `/ai/n8n` | 已有 n8n 实际曝光与实体意图 | P0 Harvest，优先改善 CTR、首屏结论和内部消费 |
| `/guides/n8n-self-hosted-requirements` | `n8n self hosted requirements`，KD 30.4 | P0 新 Guide；先回答部署要求、责任和成本结构 |
| `/ai/make`、`/ai/lindy` | 互补候选实体 | P1 深度升级，不强制同时完成 |
| `/compare/n8n-vs-make-vs-lindy` | 小组比较 | 保持 noindex，先补证据和真实差异；不作为开局主战词 |

Automation 的正确顺序是自托管、部署要求和成本责任，再考虑 pricing/vs 竞争词。`n8n pricing plans`（KD 45.5）和 `n8n vs zapier pricing`（KD 51.5）暂不作为开局主页面。

### 7.3 DeepL Cluster

| 页面 | 目标意图 | 状态与动作 |
| --- | --- | --- |
| `/ai/deepl` | DeepL 实体、价格和限制 | 保持实体 canonical，优先利用已有长尾基础 |
| `/compare/deepl-vs-google-translate` | `deepl vs google translate accuracy`，KD 29.3 | P1 条件候选；确认需求和证据后建立，不伪造准确率测试 |

`ai tools comparison`（KD 22.6，US 140/月）和 `ai coding tools comparison`（KD 25，US 50/月）为 P2；`compare ai writing tools`（KD 23.1，US 10/月且最新月归零）不进入当前产能。

## 8. 首页定位

建议目标文案：

- Title：`Compare AI Tools by Task, Price & Limits (2026) | AI Best Tool`
- H1：`Choose the Right AI Tool with Evidence, Limits and Side-by-Side Comparisons`

首页从“工具列表入口”改为“决策入口”：展示核心 Cluster、热门决策、证据方法和最近更新。当前证据结构尚不足以使用 `Real Tests` 作为全站承诺，待至少一个 E2 方法公开并稳定执行后再评估。

## 9. 12 周结果型执行顺序

### 第 0-2 周：修正定位与第一个可验证 Cluster

- 修复 GSC refresh token；无法修复时明确 `unavailable`，不猜数据。
- 建立 query → canonical 页面映射并消除 Coding 重复意图。
- 更新首页定位和入口，不新增复杂 Finder 或 Dashboard。
- 升级 `best ai coding assistant` 和 `free ai coding tools` 两个 P0 主决策资产。
- 选择 4-6 个 Coding 工具作为候选，但只升级已经满足独立价值的页面。

### 第 3-6 周：Automation 与深度 Tool 支撑

- 发布 `n8n self hosted requirements` Guide。
- 升级 `/ai/n8n`，按需要升级 Make、Lindy。
- 对已有 n8n comparison 补证据，继续 noindex。
- 完成至少一个可复核的 E2 受控实测，不强制每个工具都实测。

### 第 7-12 周：只按信号扩张

- DeepL comparison 只有需求和证据同时通过时才建立。
- 新主决策页必须由 GSC 或站内行为长出来，不按计划凑到 4-6 页。
- 12 周最多形成 8-12 个真正有独立价值的深度 Tool 页；这是质量上限，不是交付配额。

扩张必须同时满足：新鲜 GSC、稳定非品牌曝光或明确用户行为、目标查询进入 Top 20 或持续上升、至少 4 个完整候选、无重复意图/canonical 冲突。任一条件缺失时，只增强现有资产。

## 10. 自动运营输入与周节奏

自动化每周只选择一个主 Cluster 主题，并在一个端到端单元内完成：

- 1 个主决策页面新建或升级；
- 2-4 个必要 Tool 支撑；
- 1 个到期/变化 Claim freshness 批次；
- 1 个基于真实数据的 Market 动作；
- 0-1 个受控实测；
- 1 次最终独立 QA。

Catalog 日常收录继续运行，但候选必须服务 Cluster 或明确独立需求。Harvest 优先，其次 Expand，Discover 只占少量产能。不能因为某周没有合格候选就制造页面或把旧候选补进数量。

## 11. 防止过度设计、过度开发和过度测试

### 11.1 流程预算

普通交付单元只允许：

- 一份机会/证据快照；
- 一个端到端开发槽；
- 一次最终独立 QA；
- 一份最终审计/日报记录；
- 一次必要的生产 smoke。

禁止把 inventory、evidence、candidate、preflight、页面、内链和 SEO 拆成连续子任务；禁止为单一工具建立专属 release JSON、guard、测试、运行时分支、评分服务、Dashboard 或数据库表。

### 11.2 分级验证

- **R 级**：研究、选品、关键词、文案和文档。只核来源、结构、重复意图和格式；不运行 TypeScript、build 或 production smoke。
- **C 级**：运行时代码、页面渲染、路由或通用流水线。只跑受影响专项和 TypeScript；只有渲染、构建、路由或发布路径变化才运行一次完整 build 和一次部署后 smoke。
- **H 级**：数据库/RLS、安全、支付、索引、canonical、sitemap 或不可逆操作。才执行迁移幂等、权限负例、rollback、完整 build 和生产 smoke。

已有 PASS 只有在来源变化、复查到期、受影响代码变化或生产异常时才失效。开发、QA 和总控不得机械重复同一组绿灯。

### 11.3 强制停止与缩范围

出现任一情况立即停止扩张并缩小范围：

- 单项耗时超过 60 分钟；
- 同类流程连续两次 QA FAIL；
- 验收成本明显高于用户可见变化；
- 为了执行方案必须新增专属系统或第二套事实源；
- 页面没有独立意图、下游消费或可观察信号。

记录 `PROCESS_BUDGET_EXCEEDED`，下一步必须复用通用能力或删除非必要门禁，不能再增加审批层。

## 12. 成功指标与非目标

优先指标：

- 非品牌 GSC impressions、Top 20 查询和 CTR；
- 决策页到 Tool 页、comparison 和 outbound 的有效行为；
- 有独立价值并被 Cluster 消费的页面比例；
- Claim 证据覆盖和过期率；
- 单个端到端单元的周期、QA 次数和返工率。

非目标：

- 工具总数、页面总数、每日必须发布数量；
- 为了 DR、流量或配额创建低价值页面；
- 用计划数量替代 GSC/用户信号；
- 以测试数量证明质量；
- 把付费收录、Sponsor 或 Owner 偏好用于自然排名、Decision 结论或索引资格。

## 13. 下一实施单元

下一单元只做一个端到端 V3 基础切换：

1. 首页定位和 metadata；
2. Coding query → canonical 映射与重复意图收敛方案；
3. 两个 P0 Coding 主决策页的内容差分；
4. Claim 级 E0-E3 展示契约；
5. 自动运营输入字段和周账本更新。

该单元不得顺便新建评分系统、Dashboard、专属数据库表或批量 Tool 页面。删除、重定向、index/sitemap 变更和数据库迁移仍单独遵循现有授权边界。
