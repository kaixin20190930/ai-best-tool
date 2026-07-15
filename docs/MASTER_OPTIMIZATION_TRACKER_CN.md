# 优化总控任务表

更新时间：2026-07-15

这份文档把当前所有优化内容合并成一份可追踪、可监测、可复盘的总任务表。

保留原有三份子计划作为执行说明：

- [60 天商业主线](./AI_TOOL_SITE_60_DAY_EXECUTION_PLAN_CN.md)
- [SEO 质量恢复与真实内容增长](./SEO_QUALITY_RECOVERY_TASKS_CN.md)
- [竞品研究与下一步优化方案](./COMPETITOR_RESEARCH_AND_NEXT_OPTIMIZATION_CN.md)

说明：

- 上面三个旧文档都已经标记为归档说明
- 当前活跃计划只有这一份总控表
- 后续所有执行、排期、复盘都以本文件为准
- 2026-07-15：`GuideEvidencePanel` 已补齐到全部 guide / comparison 页面，并通过本地 `pnpm run build`
- 2026-07-15：`pnpm run seo:quality-inventory` 已生成最新质量盘点，当前总页面 157、可进 sitemap 27、内部流量页 3、noindex / 合并候选 127，详见 [`docs/SEO_QUALITY_INVENTORY_CN.md`](/Users/liukai/web/ai-best-tool/docs/SEO_QUALITY_INVENTORY_CN.md)
  - 2026-07-15：`gsc:weekly-report` 的导出汇总脚本已增强为更深层递归扫描，并支持部分 CSV 导入时写回周报基线，减少等待完整导出时的卡点；Week 1 GSC 性能与覆盖率基线已录入周报
- 2026-07-15：`robots.txt` 已回退为 `public/robots.txt` 静态文件，避免 metadata route 500；本地预览 `seo:validate` 已跑通 27/27，工具页非数据库工具的提示已改为通过
- 2026-07-15：主页、榜单页和指南页已把 Submit / Claim 从第一层入口降级为次级 owner 路径，避免商业入口打断先看内容、再做比较的决策流，并通过本地 `pnpm run build`
- 2026-07-15：comparison template 已补入价格 / 更新 / 风险显式化，所有套用该模板的比较页都会显示统一的风险信号与 freshness 提示，并通过本地 `pnpm run build`
- 2026-07-15：comparison template 已统一补入 `decisionSteps`，让所有套用该模板的比较页默认都带有一致的决策顺序模块，并通过本地 `pnpm run build`
- 2026-07-15：`GuideEvidencePanel` 新增可复用的价格 / 更新 / 风险信号条，已接入 `how-to-choose-ai-tools`、`best-free-ai-tools`、`ai-seo-tools` 等核心指南页，并通过本地 `pnpm run build`
- 2026-07-15：`GuideEvidencePanel` 的价格 / 更新 / 风险信号条继续接入 `ai-tools-for-developers`、`ai-tools-for-research`、`ai-tools-for-marketing` 等核心指南页，并通过本地 `pnpm run build`
- 2026-07-15：`GuideEvidencePanel` 的价格 / 更新 / 风险信号条继续接入 `ai-tools-for-agents`、`ai-tools-for-api-observability`、`ai-tools-for-automation` 等高意图指南页，并通过本地 `pnpm run build`
- 2026-07-15：`GuideEvidencePanel` 的价格 / 更新 / 风险信号条继续接入 `ai-tools-for-content-creation`、`ai-chatbot-tools`、`ai-tools-for-designers` 等内容 / 聊天 / 设计高意图页，并通过本地 `pnpm run build`
- 2026-07-15：`GuideEvidencePanel` 的价格 / 更新 / 风险信号条继续接入 `ai-tools-for-sales`、`ai-productivity-tools`、`ai-tools-for-web3` 及其 comparison 页面，并通过本地 `pnpm run build`
- 2026-07-15：`GuideEvidencePanel` 增加默认的价格 / 更新 / 风险信号条回退，未单独传 `signalCards` 的指南 / 对比页也会自动获得同一层真实信号，并通过本地 `pnpm run build`
- 2026-07-15：`GuideEvidencePanel` 的定制信号继续补到 `ai-tools-for-customer-support`、`ai-tools-for-lead-generation`、`ai-tools-for-model-routing` 和 `ai-marketing-tools`，进一步强化高意图主页面的真实判断口径，并通过本地 `pnpm run build`
- 2026-07-15：`GuideEvidencePanel` 的定制信号继续补到 `ai-tools-for-on-chain-analysis`、`ai-tools-for-crypto-research`、`ai-tools-for-wallet-monitoring`、`ai-tools-for-protocol-analytics` 和 `ai-tools-for-ecommerce`，进一步强化数据 / 交易 / 运营场景判断口径，并通过本地 `pnpm run build`
- 2026-07-15：`GuideEvidencePanel` 的定制信号继续补到 `ai-api-observability-tools`，把请求 / 告警 / 追踪 / 事故复盘的判断口径写得更具体，并通过本地 `pnpm run build`
- 2026-07-15：工具详情页已新增“当前处理状态”面板，把最近更新、讨论数量、认领状态和下一步动作串成更清晰的 owner / 评论 / 更新请求闭环，并通过本地 `pnpm run build`

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

| 计划 | 当前完成度 | 已完成的核心内容 | 主要未完成内容 |
| --- | --- | --- | --- |
| 60 天商业主线 | 55% | 工具库、分类、Guide、Comparison、Submit、Stripe、Featured、Admin 基础完整；Pricing/Submit/Claim 页面收口，漏斗埋点已接通 | 真正的付费验证、Claim 留资转化、后台持续跟踪和优化 |
| SEO 质量恢复主线 | 75% | robots/sitemap/noindex 策略、质量盘点、GSC 台账、核心页真实证据模块、多个 hub/detail/compare 页增强、robots 静态化、索引收口方向已经落地 | 继续观察 GSC、补齐剩余核心页真实信号、合并/ noindex 弱页、按周复盘 |
| 竞品研究与产品优化主线 | 20%（执行） / 100%（研究文档） | 已完成竞品研究文档，明确 10 条可借鉴设计和 10 类用户痛点 | 还需要把研究结论真正落到首页、Explore、分类页、对比页、评论/认领闭环里 |

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
- 现有 `*-alternatives-comparison` 与 `*comparison` 页面已统一补上 `Decision order / 决策顺序` 模块，并且已通过本地 `pnpm run build`

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

| 任务 | 目标 | 验收标准 | 状态 |
| --- | --- | --- | --- |
| 停止新增低价值 programmatic 页面 | 防止索引面继续膨胀 | 新增页暂停，弱页不再推 sitemap | 进行中 |
| 继续收口弱页 / alias 页 | 降低重复和稀薄内容 | 弱页 noindex / 合并策略已加固，别名页 canonical/noindex 已统一 | 进行中 |
| 保持 GSC 周度观察 | 看恢复是否有效 | 周台账每周更新一次，模板已建立，待导入最新 GSC CSV | 进行中 |
| 维护核心页真实信号 | 给 Google 和用户证据 | 核心页持续补验证日期、价格、评论、owner 信号 | 进行中 |
| 后台页面质量状态 / 下次复查日期 | 让质量决策可跟踪 | 管理后台可编辑并落库，列表页可查看 | 已完成 |

### P1: 提升核心页的决策质量

| 任务 | 目标 | 验收标准 | 状态 |
| --- | --- | --- | --- |
| 首页 / Explore 任务型搜索 | 先问用户想解决什么问题 | 搜索和入口不只按分类组织 | 已完成 |
| 分类页增强 | 让分类页成为可决策 hub | 首屏、代表工具、对比入口、最近验证块齐全 | 已完成 |
| 对比页 / 替代页增强 | 承接高意图搜索 | 比较维度、why-this-one、CTA 明确，已补齐 compare template、best-for / why-pick-it / watch-out 和高意图路径；2026-07-15 已统一加上真实信号与验证口径面板 | 已完成 |
| Tool detail 真实信号 | 增强信任和转化 | 评论、owner、verified、价格、限制清晰 | 已完成 |
| 评论 / 认领闭环 | 形成非 AI 增量内容 | 能留资、能评论、能跟进更新请求 | 已完成 |

### P2: 商业验证

| 任务 | 目标 | 验收标准 | 状态 |
| --- | --- | --- | --- |
| Pricing 页面重构 | 让付费理由 3 秒内能看懂 | 套餐、交付、时效、边界清晰 | 已完成 |
| Submit 页面重构 | 提交前教育用户 | 审核标准、拒绝规则、付款说明齐全 | 已完成 |
| Claim Landing Page | 提前验证认领意愿 | 能直接留资，不依赖复杂后台 | 已完成 |
| 漏斗埋点 | 找到流失点 | Pricing → Submit → Checkout → Success 全链路可读 | 已完成 |

### P3: 竞品研究落地

| 任务 | 目标 | 验收标准 | 状态 |
| --- | --- | --- | --- |
| 任务型搜索入口强化 | 先问用户“要做什么” | 首页、Explore、分类页都能按任务/场景导航 | 已完成 |
| 对比 / 替代页统一决策框架 | 把高意图入口做成可比较页面 | 有比较维度、why-this-one、适合谁 / 不适合谁、下一步动作 | 已完成 |
| 价格 / 更新 / 风险显式化 | 提升可信度和转化率 | 核心页统一展示价格、最近验证、限制和风险提示 | 进行中 |
| 评论 / owner / 更新请求闭环 | 把非 AI 增量内容做起来 | 用户能评论、认领、提交更新请求并看到处理状态 | 进行中 |
| 商业入口分层 | 让付费入口服务判断而不干扰判断 | Submit / Claim / Sponsor 入口清晰，但不压过内容判断 | 进行中 |

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

## 九、当前建议结论

建议把所有优化内容合并成这份总控表。

原因不是为了多一份文档，而是为了：

- 把商业主线、SEO 主线、竞品研究主线统一到同一张看板
- 避免“做了很多，但彼此不相连”
- 让下一步每个任务都能落到页面、指标和验收标准

## 十、近期进展记录

- 2026-07-15：继续补齐比较页的真实信号层，给剩余的对比页增加 `signalCards`，让价格、更新和风险判断在页面层保持一致。
- 2026-07-15：比较页与指南页的 evidence panel 已统一到“可验证信号 + 真实判断”的结构，后续继续按同一模板补到未覆盖页面。
