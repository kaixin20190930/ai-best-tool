# SEO 质量恢复与真实内容增长任务清单

更新时间：2026-07-13

这份清单用于把接下来 2 周、4 周、4-8 周的恢复计划落到可跟踪任务上。当前重点不是继续铺更多 AI 生成页面，而是先收口索引面，再把少量核心页面做成有真实证据、真实判断和真实用户信号的页面。

## 一、当前判断

Google 不会因为内容由 AI 辅助生成就直接惩罚页面，但会压低下面这类页面的价值判断：

- 大量结构相似的页面
- 缺少真实体验、真实数据、真实评论的页面
- 只是工具列表，没有明确判断逻辑的页面
- sitemap 和内部链接把太多低优先级页面一起推给搜索引擎
- 页面数量增长快于质量信号增长

所以接下来要做的是：

- 停止新增 programmatic 页面
- 对现有页面做质量审计
- 保留核心索引面
- 对弱页面执行 noindex、合并或继续内部导流
- 为 20 个核心页面补真实数据、截图、验证记录、评论和 owner 认领信号

## 二、阶段目标

### 第 1 阶段：接下来 2 周

目标：停新增，做质量审计和 noindex / 合并策略。

验收标准：

- 明确哪些页面进 sitemap
- 明确哪些页面只做内部流量
- 明确哪些页面要 noindex 或合并
- 不再新增新的 guide / comparison / alternative 批量页
- robots、sitemap、页面 metadata 三者策略一致

### 第 2 阶段：接下来 4 周

目标：挑 20 个核心页面做真实数据增强。

验收标准：

- 每个核心页面都有明确的选择理由
- 每个核心页面补齐真实证据模块
- 每个核心页面至少补 3-5 条可验证数据
- 每个核心页面增加更新日期或验证日期
- 每个核心页面引导评论、收藏、分享或 owner 认领

### 第 3 阶段：接下来 4-8 周

目标：观察 GSC，不急着继续放量。

验收标准：

- 每周记录索引量、曝光、点击、CTR、平均排名
- 对比增强页面和未增强页面的表现差异
- 只把表现改善且质量达标的页面继续放入优先收录队列
- 对持续无曝光、无点击、无索引价值的页面继续合并或 noindex

## 三、P0 任务：立即执行

| 状态 | 任务 | 作用 | 验收标准 |
| --- | --- | --- | --- |
| 已开始 | 固化本任务清单 | 防止后续优化失焦 | 文档已进入 `docs/` 并可持续更新 |
| 已完成 | 核对 robots / sitemap / noindex 策略 | 避免非 SEO 页面抢抓取预算 | 后台、认证、账号、API 不进入索引面；弱 guide 和 comparison 统一 noindex, follow |
| 已完成 | 输出页面质量盘点表 | 建立 noindex / 合并依据 | 每个核心 URL 都有状态、问题、下一步动作 |
| 待做 | 核对 sitemap URL 数量 | 确保 sitemap 只放主力页面 | sitemap 维持在当前阶段推荐规模内 |
| 已完成 | 标记弱 guide / alias guide | 减少同义页面互相竞争 | 同义页明确主页面、内部页或合并页；别名页已补 noindex |
| 待做 | GSC 基线记录 | 后续判断优化是否有效 | 记录当前 28 天曝光、点击、CTR、Top queries；见 `docs/GSC_WEEKLY_OBSERVATION_LOG_CN.md` |

## 四、P1 任务：20 个核心页面真实数据增强

优先增强这 20 个页面，而不是继续新增页面。

| URL | 类型 | 优先级 | 增强重点 | 目标 |
| --- | --- | --- | --- | --- |
| `/` | Home | P1 | 站点定位、精选入口、真实更新信号 | 让 Google 明白站点主题 |
| `/explore` | Directory | P1 | 筛选说明、热门分类入口、质量规则 | 目录主入口 |
| `/best-ai-tools` | Ranking | P1 | 排名方法、更新时间、选择标准 | 承接高意图搜索 |
| `/categories/productivity` | Category | P1 | 分类解释、代表工具、使用场景 | 稳住核心分类页 |
| `/categories/web3` | Category | P1 | Web3 数据与工具判断逻辑 | 差异化方向 |
| `/categories/developer-tools` | Category | P1 | 开发者工具选择维度 | 强商业意图 |
| `/categories/chatbot` | Category | P1 | 聊天工具细分场景 | 大需求入口 |
| `/guides/how-to-choose-ai-tools` | Guide | P1 | 选型方法论、评分规则、真实信号模块 | 建立编辑可信度 |
| `/guides/free-ai-tools` | Guide | P1 | 免费限制、适合人群、风险提示、真实信号模块 | 承接免费工具需求 |
| `/guides/ai-writing-tools` | Guide | P1 | 写作场景、价格、输出质量、真实信号模块 | 高搜索需求 |
| `/guides/ai-seo-tools` | Guide | P1 | SEO 流程、数据验证、真实信号模块 | 与 GSC 问题强相关 |
| `/guides/ai-coding-tools` | Guide | P1 | IDE、代码补全、Agent 区分、真实信号模块 | 高商业意图 |
| `/guides/ai-tools-for-web3` | Guide | P1 | 链上研究、协议分析、钱包监控、真实信号模块 | 差异化主题 |
| `/guides/ai-note-taking-tools` | Guide | P1 | 会议、转写、总结准确性、真实信号模块 | 场景清晰 |
| `/ai/chatgpt` | Tool | P1 | 真实用途、限制、替代品、评论 | 代表性详情页 |
| `/ai/claude` | Tool | P1 | 写作/分析/代码场景 | 代表性详情页 |
| `/ai/cursor` | Tool | P1 | 开发工作流、价格、适合团队 | 代表性详情页 |
| `/ai/runway` | Tool | P1 | 视频生成场景、限制 | 代表性详情页 |
| `/ai/defillama` | Tool | P1 | Web3 数据可信度、使用场景 | 差异化详情页 |
| `/ai/notta` | Tool | P1 | 会议记录、转写语言、使用限制 | 场景详情页 |

## 五、每个核心页面必须补的“非 AI 信号”

每个 P1 页面至少补齐 5 类中的 3 类：

- 最近验证日期：例如 `Last checked: 2026-07-10`
- 真实数据：价格、免费额度、支持平台、官方链接状态、截图状态
- 编辑判断：适合谁、不适合谁、为什么推荐或不推荐
- 用户信号：评论、评分、收藏、分享、点击官方站
- owner 信号：是否已认领、是否可联系、是否有更新请求

## 六、页面处理规则

### 继续索引

适合：

- 主题明确
- 内容够厚
- 不是同义重复页
- 有真实证据或真实互动信号

动作：

- 保持 sitemap
- 保持 index
- 增强内容和内链

### 内部流量

适合：

- 对用户有帮助
- 但内容不够独立
- 暂时主要用于导流和转化

动作：

- 不进 sitemap
- 可以 noindex
- 保持内部链接

### 合并或 noindex

适合：

- 同义 alias guide
- 结构重复的 comparison 页
- 长期无点击、无曝光、无转化的薄页

动作：

- 保留用户访问价值时用 noindex
- 完全重复时合并到主页面
- 合并后保持必要跳转或内部链接

## 七、每周跟踪指标

每周固定记录一次：

- GSC 总曝光
- GSC 总点击
- CTR
- 平均排名
- 已索引页面数
- 未索引原因 Top 5
- Top 20 query
- Top 20 page
- 增强页面曝光变化
- 增强页面点击变化
- 评论数
- owner 认领数
- 提交数
- 付费或询盘数

记录入口：

- `docs/GSC_WEEKLY_OBSERVATION_LOG_CN.md`
- `docs/SEO_MONTHLY_REPORT_TEMPLATE.md`

## 八、暂停事项

在第 1 阶段完成前，暂停：

- 新增大批 guide 页
- 新增大批 comparison 页
- 新增大批 alternative 页
- 把所有页面重新推入 sitemap
- 为了广告收入增加低价值页面

## 九、下一轮代码优化优先级

1. 补齐 robots 对后台、认证、账号、API 的明确屏蔽。已完成。
2. 生成页面质量盘点脚本，输出 guide / comparison / tool 的索引建议。已完成。
3. 给弱 guide / alias guide 分批加 noindex 或 canonical 合并策略。已通过中间件统一加 `X-Robots-Tag: noindex, follow`，后续再做合并。
4. 给 20 个核心页面增加真实证据模块。已完成 20 个核心 page：`how-to-choose-ai-tools`、`ai-seo-tools`、`ai-coding-tools`、`free-ai-tools`、`best-free-ai-tools`、`ai-writing-tools`、`ai-productivity-tools`、`ai-tools-for-research`、`ai-note-taking-tools`、`ai-tools-for-web3`、`ai-video-tools`、`ai-tools-for-meeting-notes`、`ai-tools-for-automation`、`ai-tools-for-developers`、`ai-chatbot-tools`、`ai-tools-for-agents`、`ai-tools-for-sales`、`ai-tools-for-marketing`、`ai-tools-for-customer-support`、`ai-tools-for-creators`。并继续补齐了 `ai-tools-for-evals`、`ai-tools-for-code-review`、`ai-tools-for-content-creation`、`ai-tools-for-students`、`ai-tools-for-prompt-testing`、`ai-tools-for-model-routing`、`ai-image-tools`、`ai-tools-for-api-observability`、`ai-tools-for-lead-generation`、`ai-tools-for-crypto-research`、`ai-tools-for-token-research`、`ai-tools-for-voice`、`ai-tools-for-web3-analysis`、`ai-tools-for-dex-analytics` 等独立高意图页。
5. 在管理后台增加“页面质量状态”和“下次复查日期”字段。
6. 在详情页强化评论、owner 认领和最近验证日期。

### 当前执行状态

- 索引面收口：已完成主策略
- 质量盘点：已完成自动盘点，可继续每周刷新
- GSC 观察模板：已补齐，后续只填数
- 弱 guide / alias guide：已补 noindex
- 20 个核心页增强：已完成首批落地，继续做第二批真实数据增强
- 核心入口 freshness：营销、销售、生产力页已补最近验证块
- 核心入口 freshness：SEO、编程、研究入口也已补最近验证块
- 核心入口 freshness：自动化、语音、Agent 入口也已补最近验证块
- 核心入口 freshness：内容创作、客服、模型路由、API 可观测入口也已补最近验证块
- 核心入口 freshness：聊天、创作者、视频、会议纪要、电商入口也已补最近验证块
- 核心入口 freshness：prompt 测试、获客、小企业、协议分析、链上分析、钱包监控入口也已补最近验证块
- 核心入口 freshness：写作、设计、资产追踪、DEX 分析、evals、代码审查入口也已补最近验证块
- 核心入口 freshness：补齐代理、图像、记事、crypto/token/web3/wallet 研究入口的最近验证块，并已通过 `pnpm run build`

## 十、首批真实证据模块落地记录

更新时间：2026-07-10

已新增复用组件：

- `components/guides/GuideEvidencePanel.tsx`

已接入页面：

- `/guides/how-to-choose-ai-tools`
- `/guides/ai-seo-tools`
- `/guides/ai-coding-tools`
- `/guides/free-ai-tools`
- `/guides/best-free-ai-tools`
- `/guides/ai-writing-tools`
- `/guides/ai-productivity-tools`
- `/guides/ai-tools-for-research`
- `/guides/ai-note-taking-tools`
- `/guides/ai-tools-for-web3`
- `/guides/ai-video-tools`
- `/guides/ai-tools-for-meeting-notes`
- `/guides/ai-tools-for-automation`
- `/guides/ai-tools-for-developers`
- `/guides/ai-tools-for-evals`
- `/guides/ai-tools-for-code-review`
- `/guides/ai-tools-for-content-creation`
- `/guides/ai-tools-for-students`
- `/guides/ai-tools-for-prompt-testing`
- `/guides/ai-tools-for-model-routing`
- `/guides/ai-image-tools`
- `/guides/ai-tools-for-api-observability`
- `/guides/ai-tools-for-lead-generation`
- `/guides/ai-tools-for-crypto-research`
- `/guides/ai-tools-for-token-research`
- `/guides/ai-tools-for-voice`
- `/guides/ai-tools-for-web3-analysis`
- `/guides/ai-tools-for-dex-analytics`
- `/guides/ai-tools-for-wallet-research`
- `/guides/ai-tools-for-wallet-monitoring`
- `/guides/ai-tools-for-ecommerce`
- `/guides/ai-tools-for-small-business`
- `/guides/ai-tools-for-crypto-portfolio-tracking`
- `/guides/ai-tools-for-defi-analytics`
- `/guides/ai-tools-for-agencies`
- `/guides/ai-tools-for-designers`
- `/guides/ai-tools-for-sales-prospecting`
- `/guides/ai-tools-for-sales-comparison`
- `/guides/ai-tools-for-designers-comparison`
- `/guides/ai-coding-tools-comparison`
- `/guides/ai-tools-for-code-review-comparison`
- `/guides/ai-seo-tools-comparison`
- `/guides/ai-writing-tools-comparison`
- `/guides/ai-image-tools-comparison`
- `/guides/ai-tools-for-web3-comparison`
- `/guides/ai-tools-for-developers-comparison`
- `/guides/ai-tools-for-evals-comparison`
- `/guides/ai-tools-for-small-business-comparison`
- `/guides/ai-tools-for-agencies-comparison`
- `/guides/ai-tools-for-customer-support-comparison`
- `/guides/ai-tools-for-marketing-comparison`
- `/guides/ai-tools-for-wallet-monitoring-comparison`
- `/guides/ai-tools-for-wallet-research-comparison`
- `/guides/ai-tools-for-content-creation-comparison`
- `/guides/ai-tools-for-creators-comparison`
- `/guides/ai-tools-for-ecommerce-comparison`
- `/guides/ai-tools-for-lead-generation-comparison`
- `/guides/ai-tools-for-evals-comparison`
- `/guides/ai-tools-for-agents-comparison`
- `/guides/ai-tools-for-dex-analytics-comparison`
- `/guides/ai-tools-for-web3-analysis-comparison`
- `/guides/ai-tools-for-protocol-analytics-comparison`
- `/guides/ai-video-tools-comparison`
- `/guides/ai-productivity-tools-comparison`
- `/guides/ai-note-taking-tools-comparison`
- `/guides/ai-chatbot-tools-comparison`
- `/guides/ai-tools-for-research-comparison`
- `/guides/ai-tools-for-api-observability-comparison`
- `/guides/ai-tools-for-automation-comparison`
- `/guides/ai-tools-for-students-comparison`
- `/guides/ai-tools-for-token-research-comparison`
- `/guides/ai-tools-for-sales-prospecting-comparison`

这轮模块重点解决：

- 页面不再只是泛泛工具推荐，而是明确说明“检查了什么”
- 增加最近检查日期
- 增加索引策略、判断维度、下一步补强方向
- 为后续更多高意图页面复用同一套真实信号结构

## 十一、第二梯队真实信号扩展记录

更新时间：2026-07-10

已新增复用组件：

- `components/guides/GuideEvidencePanel.tsx`

已接入页面：

- `/ai/[websiteName]` 详情页模板
- `/categories/[slug]` 分类页模板
- `/best-ai-tools/[topic]` 榜单页模板
- `/explore` 探索页
- `/` 首页
- `/guides/*-comparison` 共享比较模板

这轮模块重点解决：

- 工具详情页从“简介页”变成“真实用途和信号页”
- 分类页从“列表页”变成“场景入口和决策页”
- 榜单页从“排名页”变成“有筛选依据的决策页”
- 首页从“泛目录”变成“站点信号总入口”
- 探索页从“搜索表”变成“筛选与更新中枢”
- 比较页从“单纯对照页”变成“有边界、有方法的决策页”
- 为后续 owner 认领、评论、截图和近期验证提供统一位置
