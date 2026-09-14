# 公开内容边界与页面简化实施方案

创建日期：2026-09-14

状态：方案已复核；PUB-01、PUB-02 已完成开发、独立 QA、部署与生产验证，下一项为 PUB-03

上位计划：[收录与搜索质量主计划](./MASTER_OPTIMIZATION_TRACKER_CN.md)

站点级约束：[SEO 信息架构与不可回退规则](./SEO_INFORMATION_ARCHITECTURE_GUARDRAILS_CN.md)

执行协议：[AI Best Tool 总控协作协议](./AI_PM_ORCHESTRATION_PROTOCOL_CN.md)

## 一、问题定义

用户在 `/cn/guides/ai-tools-for-web3-comparison` 发现大量内部思考、SEO 判断和后续规划直接显示在公开页面。生产核验确认该页实际返回 `X-Robots-Tag: noindex, follow`，不在 sitemap，但正文却显示“保留索引，补真实 Web3 证据”，技术状态与用户可见文案互相矛盾。

该问题不是单页问题。2026-09-14 源码基线为：

| 项目 | 数量 | 风险 |
| --- | ---: | --- |
| Guide 页面文件 | 146 | 页面数量大，逐页打补丁容易漏项 |
| Comparison 路由目录 | 76 | 多数属于弱意图或重复意图，当前统一 noindex |
| 使用共享 comparison 模板的页面 | 62 | 模板问题会批量传播 |
| 使用 `GuideEvidencePanel` 的页面 | 147 | 通用默认文案可能冒充具体证据 |
| 使用 `GuideSubmissionPath` 的页面 | 99 | 提交/认领转化过度侵入普通用户路径 |
| 显示“当前判断”的文件 | 142 | 多数实际表达编辑或 SEO 判断 |
| 显示“索引策略”的文件 | 37 | 内部 SEO 控制错误公开 |
| “保留索引”出现次数 | 187 | 与真实 robots 状态可能冲突 |
| “补真实”出现次数 | 341 | 把未完成 TODO 暴露给用户 |

Web3 comparison 还存在四个语义问题：

1. 页面叠加入口推荐、两套 Evidence、索引判断、下一步增强、高意图路径、提交/认领等十余个区块，主任务不清晰。
2. “回指南、去榜单、下一步路径”重复出现多次，选择成本高于信息价值。
3. 标题声称比较常见 Web3 工具，实际只有 Dune 和 The Graph，且缺少真正的“维度 x 工具 x 结论”矩阵。
4. 工具分类显示为 `Productivity`，页面没有解释目录分类与 Web3 使用场景的关系，削弱专业可信度。

## 二、目标与非目标

### 目标

- 公开页面只展示能帮助用户理解、选择、验证和行动的内容。
- 编辑计划、SEO 状态、索引资格、内容缺口和转化目标只保留在后台、文档或代码控制层。
- 将 comparison 页面压缩为可在 3-5 分钟内完成选择的真实对比页。
- 保留并前置平台已有差异化：任务适配、限制、证据、核查日期、变化和可执行下一步。
- 建立自动门禁，阻止内部语言再次进入公开页面。
- 不改变当前 URL、canonical、hreflang、robots、schema 和 sitemap 契约，除非后续单独审批。

### 非目标

- 本轮不新增 Guide、comparison、alternative 或工具 URL。
- 不批量放开 comparison 索引，不因页面变短就自动进入 sitemap。
- 不改变 AI Best Tool 的“AI tools directory”基础定位。
- 不删除 Evidence Ledger、Change Timeline、Decision Card、评论或 owner 数据。
- 不把本轮变成全站视觉重做、品牌重命名或商业定价调整。
- 不把字数、区块数或关键词密度作为成功指标。

## 三、三层内容边界

### 1. 用户层：可以公开

每个模块必须至少回答一个问题：

- 这是什么？
- 它能帮我完成什么任务？
- 适合谁，不适合谁？
- 有什么会改变选择的限制？
- 判断依据是什么，何时核查？
- 下一步应该打开哪个工具、官网或真实决策入口？

允许公开的数据：产品事实、适用边界、价格/额度/隐私/工作流限制、已核验证据、核查日期、真实变化、真实评论、owner 声明、明确的比较结论。

### 2. 编辑层：只能在后台

- `page_quality_status`
- `monitor / continue_index`
- 内容缺口、待补证据、下一次编辑计划
- 市场验证分、证据完整度、冲突处理状态
- 发布槽位、审核队列、转化目标
- “保留索引”“下一步增强”“承接高意图”等编辑判断

### 3. SEO 控制层：只能在代码、报告和后台

- canonical、hreflang、robots、sitemap eligibility
- index decision、alias、redirect、schema eligibility
- metadata 实验 ID、开始日、14/28 天判定
- rollout、rollback 和发布门禁

这些字段不得通过普通 JSX 文案、通用 Evidence 卡或 FAQ 暴露给访客。

## 四、页面类型与最终模块契约

### A. 首页

保留：目录定位、按任务查找、少量代表工具、最近真实更新、Explore/Best/Guide/Find Tools 主入口、简短差异化承诺。

精简：重复证据卡、重复 CTA、同义目录说明。

禁止：索引数量冒充、SEO 状态、内部转化目标、后续编辑计划。

### B. Explore / New / Category / Best

保留：筛选、排序、任务入口、工具卡、价格类型、最近核查、一个适用场景、一个关键限制、进入详情页。

精简：通用风险教育、重复榜单解释、重复分类入口。

禁止：承接流量、转化、付费路径、索引策略、待补样本。

### C. 可索引主 Guide

保留：用户任务、选择前提、3-5 个关键维度、决策顺序、代表工具、真实风险、来源与核查日期、最多两个下一步入口。

精简：通用价格/更新/风险默认卡、重复 Guide/Best/Category 导航、无实证 FAQ。

禁止：当前 SEO 判断、页面增强计划、提交/认领主 CTA、以“这页为什么值得看”为主题的自我解释。

### D. Comparison / Alternative

最终固定为六段：

1. 比较问题和适用范围。
2. 一屏内的“按需求选谁”结论。
3. `维度 x 工具 x 结论` 比较矩阵。
4. 各候选的优势、限制和证据。
5. 适合谁、不适合谁。
6. 来源、核查日期和一个下一步入口。

规则：

- 两个候选时标题和文案必须明确为 A vs B，不使用“多款/几款”假装样本更大。
- 三个及以上候选才使用 shortlist/榜单式表达。
- 少于两个有效候选时不渲染比较结果，保持 noindex，并回到主 Guide 或进入内容修复队列。
- 每个比较维度必须产生候选差异和选择结论；纯方法教育移到主 Guide。
- 最多一个 Evidence 区块、一个下一步区块、一个主 CTA。
- 不显示 GuideSubmissionPath；工具方 CTA 只出现在工具详情或商业页面。
- 当前全部 comparison 保持 noindex、排除 sitemap；未来索引必须单独走内容质量和搜索意图审批。

### E. Tool 详情

保留：任务定位、核心事实、Decision Card、Best for、Not ideal for、Watch outs、Compare next、Evidence Ledger、Change Timeline、官方来源、核查日期、owner/纠错/评论、官网 CTA。

精简：重复摘要、重复风险卡、空评分、无审核关系推荐、多个官网 CTA。

禁止：后台质量分、索引状态、市场验证后台分、内部收录理由、待补证据。

### F. Find Tools / Stack / Trial / Profile

作为 noindex 用户工作区，保留用户任务、约束、最多三项推荐、排除理由、证据缺口、Trial 检查和 Keep/Compare/Replace/Remove 结论。不得为了 SEO 复制到公开 Guide。

### G. Pricing / Submit / Developer Listing / Submissions

集中承接价格、权益、审核、退款、认领、状态和 Featured。普通 Guide 不重复承担商业转化说明。

### H. Admin / 报告

承接全部内容质量、索引、市场验证、缺口、复核、实验、GSC、转化和发布门禁信息，不进入公开导航或 sitemap。

## 五、共享组件改造

### `GuideEvidencePanel`

- 移除“这页不是只按功能堆列表”等自我辩护标题。
- 禁止自动生成通用价格、更新、风险默认卡；调用方没有具体事实时不显示。
- 新接口只接收具体 `claim + source/checkedAt + impact`，不能接收索引或编辑状态。
- 同一页面最多实例化一次。

### `GuideSubmissionPath`

- 从 Guide 和 comparison 模板移除。
- 工具方转化集中到 `/submit`、`/developer/listing` 和具体 Tool 页。
- 若 Guide 页确有商业入口，只允许页尾一个低视觉权重文本链接，且不得使用“高意图”内部标签。

### `ComparisonPage`

- 删除首屏工具方说明、重复 next/high-intent 区块和内部验证卡。
- 增加 `comparisonRows` 契约：`dimension`、每个工具的 `value`、`winner/fit`、`reason`、`evidenceRefs`。
- 增加候选数、缺失事实和来源完整度 fail-closed 校验。
- 所有工具卡继续链接唯一 canonical Tool 页面，不复制易变长正文。

## 六、自动验收方案

### 静态门禁

新增 `test:public-content-boundary`，扫描公开路由和共享组件，阻止以下用户可见文本重新出现：

- 索引策略 / Indexing strategy
- 保留索引 / Keep it indexable
- 下一步增强 / Next enrichment
- 补真实证据 / Add real evidence
- 承接流量、高意图路径、转化路径
- 页面质量、monitor、continue_index、sitemap eligibility

允许这些词继续存在于 `admin`、`docs`、`reports`、测试夹具和非渲染配置，但必须通过明确目录白名单，不使用全局忽略。

### 结构门禁

- Comparison 页面只有一个 H1、一个 Evidence 区块、一个 next 区块和一个主 CTA。
- Comparison 至少两个有效候选；两个候选使用 A vs B 语义。
- 每个 comparison row 至少有两个候选值、一个差异结论和证据引用。
- Guide 主体最多两个后续路径。
- Guide 不渲染 `GuideSubmissionPath`。
- Tool 详情保持 Decision Card、Evidence Ledger、Change Timeline 的既有条件渲染，不重复实例化。

### SEO 回归

- `test:seo-architecture`
- `test:localized-metadata`
- `test:guide-link-boundaries`
- `test:tool-indexing`
- `test:sitemap`
- `test:ctr-differentiation`
- TypeScript `--noEmit`
- 完整 `pnpm run build`
- `seo:index-consistency`
- `seo:production-smoke`

比较页代表路径必须继续返回 `X-Robots-Tag: noindex, follow`，且不进入 sitemap。主 Guide、Best、Category 和 Tool 的既有 canonical/hreflang 不得改变。

### 内容与视觉验收

- 桌面和移动端截图检查首屏、矩阵、卡片高度、CTA 层级和长文本换行。
- Web3 样板页由 QA 按用户任务走一遍，必须在 60 秒内回答“我该选 Dune 还是 The Graph，以及为什么”。
- 随机抽查 5 个可索引 Guide、5 个 noindex comparison、5 个 Tool 页面，确认没有内部文案和重复模块。
- 生产 HTML 再次扫描禁用词，不能只检查源码。

## 七、实施计划

### 交付单元 PUB-01：边界门禁与 Web3 样板（P0，预计 1-2 天）

| ID | 任务 | 实施范围 | 验收 | 状态 |
| --- | --- | --- | --- | --- |
| PUB-01A | 建立公开内容基线报告 | 扫描公开 TSX、共享组件和生产代表页 | 输出按页面类型、词汇、组件的基线 JSON | 已完成 |
| PUB-01B | 新增公开内容边界测试 | `scripts/`、`package.json` | 禁用词在前台失败，在 admin/docs 允许 | 已完成 |
| PUB-01C | 简化 comparison 共享模板 | `comparison-template.tsx` | 去除内部说明和重复路径，保留 SEO 契约 | 已完成（样板显式启用） |
| PUB-01D | 收口 Evidence/Submission 组件 | 两个共享组件及调用方 | 无通用默认证据；Guide 不再批量提交/认领 | 已完成（新契约，旧调用方冻结） |
| PUB-01E | 重构 Web3 comparison 样板 | 指定 Web3 页面 | 真实 A vs B 矩阵、六段结构、一个 CTA | 已完成 |
| PUB-01F | 独立 QA 与生产验证 | 测试、build、DOM、robots、sitemap | QA PASS、生产 smoke PASS | 已完成 |

PUB-01 完成前，不批量修改其余 145 个 Guide。

PUB-01 于 2026-09-14 关闭：开发候选 `4c262fe8be109bad1beffbd88cfd3cda2a463a64` 经独立 QA PASS 后合入并以 `834e1295` 推送 main。生产 HTML 边界测试、SEO smoke、索引一致性与 116 条 sitemap 均通过；Web3 comparison 继续 `noindex, follow` 且不进入 sitemap。历史基线由 1512 条降至 1502 条，PUB-02 只能继续减少，不得新增。

### 交付单元 PUB-02：Guide 与 comparison 批量治理（P0/P1，预计 2-3 天）

| ID | 任务 | 实施范围 | 验收 | 状态 |
| --- | --- | --- | --- | --- |
| PUB-02A | 18 个主 Guide 清理 | indexable Guide 白名单 | 删除内部语言，保留任务方法和真实证据 | 已完成 |
| PUB-02B | 其余 comparison 分类 | keep-noindex / merge-redirect / repair | 每页有明确处置，不批量放开索引 | 已完成 |
| PUB-02C | 共享模板调用方迁移 | 62 个模板页面 | 新结构可构建，无旧属性静默丢失 | 已完成 |
| PUB-02D | 非共享页面清理 | 独立 comparison/guide | 禁用词归零，重复模块归零 | 已完成 |
| PUB-02E | 抽样语义 QA | 5 Guide + 5 comparison | 页面目的、结论、下一步清晰 | 已完成 |

PUB-02 于 2026-09-14 关闭：开发候选 `15e16ec34f081688420516149c0adc278db5f24b` 经独立 QA PASS 后以 `f73fcef5` 合入并推送 main。18 个主 Guide、76 个 comparison 路由和 188 个双语生产页面完成核验；历史公开边界命中由 1502 降至 51，Guide/comparison 范围归零且无新增。处置分类为 1 个 keep-noindex、10 个 merge-redirect 候选和 65 个 repair；redirect 与索引均未放行。148 个无依据 comparison 语言页撤下 FAQPage/ItemList，4 个 Web3 页面保留真实 schema；Breadcrumb、head、robots 与 116 条 sitemap 保持稳定。65 个 repair 页面仍需未来补真实候选和证据，不能视为已完成真实比较。

### 交付单元 PUB-03：Tool、发现页与商业边界（P1，预计 2 天）

| ID | 任务 | 实施范围 | 验收 | 状态 |
| --- | --- | --- | --- | --- |
| PUB-03A | Tool 模块重复审计 | 所有已发布 Tool + 代表 fallback | 一个主 Decision Card，无内部状态 |
| PUB-03B | Home/Explore/Best/Category 清理 | 五类模板 | 用户任务优先，无运营目标语言 |
| PUB-03C | CTA 归位 | Guide、Tool、商业页 | 提交/认领/付费不打断普通选择路径 |
| PUB-03D | 全站生产 HTML 扫描 | sitemap + noindex 代表页 | 禁用词 0，SEO 边界 0 回归 |

### 交付单元 PUB-04：差异化模块注册与实验机制（P1，预计 1-2 天）

为防止未来再次批量堆模块，建立 `publicModuleRegistry` 或等价配置。每个新模块必须记录：

- `id`、`version`、`pageTypes`
- `userQuestion`、`publicValue`
- `requiredEvidence`
- `placement`、`maxInstances`
- `indexImpact`（默认 none）
- `experimentId`、`rolloutPercent`
- `successMetrics`、`stopRule`
- `rollbackMode`

新差异化先在 3-5 个已有页面试点，不新增 URL、不修改 canonical；14 天初判、28 天完整复盘。效果差时关闭模块展示但保留底层数据，确保可逆。

## 八、状态机与角色

每个交付单元严格执行：

`SCOPED -> DEV_ACTIVE -> DEV_READY -> QA_ACTIVE -> QA_FAIL | QA_PASS -> MAIN_BUILD -> DEPLOYED -> PROD_VERIFIED -> CLOSED`

- 总控：冻结范围、选择模型、授权、传递唯一 SHA、合并、部署、生产验证和状态更新。
- 开发：唯一写入者，只推 feature branch，不推 main。
- QA：只读独立验收，不修改代码和数据库。
- 用户：只有定位变化、不可逆删除、生产权限或真实业务数据缺失时介入。

当前先创建 PUB-01 的一对任务。PUB-01 生产验证关闭后，归档原任务，再创建 PUB-02 的一对任务，禁止四个单元同时开发。

## 九、成功指标与停止规则

### 发布即验收

- 公开源码和生产 HTML 禁用内部词 0 命中。
- Web3 comparison 在 60 秒内可得出 A vs B 选择。
- 页面主体模块数显著下降，Evidence 和下一步各不超过 1 个。
- noindex、canonical、hreflang、sitemap 和 schema 零回归。
- 完整 build、索引一致性和生产 smoke 通过。

### 14/28 天观察

- indexable Guide 的 CTR、排名和展示分开观察，不能把排名变化冒充内容收益。
- Guide -> Tool、Comparison -> Tool/官网、Decision Card 锚点点击率不低于改版前；无基线时先建立基线，不伪造提升。
- 页面快速退出、返回搜索和主 CTA 点击用于判断是否真正降低选择成本。

### 停止/回滚

- canonical、robots、sitemap 或结构化数据回归：立即停止并回滚。
- 真实比较事实缺失：保持 noindex，不用通用 AI 文案补齐。
- 模块未回答明确用户问题或与已有模块重复：不扩大 rollout。
- 14/28 天数据无改善但体验测试明显改善：保留小范围，不以 SEO 数据单独否决。
- 体验和行为数据均恶化：关闭新模块展示，保留证据数据和报告。

## 十、方案复核记录

复核日期：2026-09-14

### 发现并修正的问题

1. **原设想若直接全站删除，可能误删真实 Evidence。** 已调整为先建立内容边界测试，再拆除通用默认文案；Evidence 数据和具体事实继续保留。
2. **共享组件一次修改会影响可索引与 noindex 页面。** 已拆成 PUB-01 样板验证和 PUB-02 扩展，PUB-01 未生产通过前禁止批量迁移。
3. **Comparison 全部 noindex 容易被误认为无需维护。** 已明确 noindex 只降低搜索风险，不降低用户体验、品牌和内链质量要求。
4. **只按禁用词扫描可能误报管理员页面和文档。** 已采用目录白名单，并要求检查实际渲染文本，不能简单全局忽略。
5. **只减少模块可能让页面变成薄内容。** 已要求比较矩阵、具体差异、证据引用和选择结论替换内部说明，而不是机械删字。
6. **两个候选不一定构成质量问题。** 已修正为两个候选使用 A vs B 精确语义；真正的阻断条件是少于两个有效候选或没有可验证差异。
7. **批量更改 metadata 会破坏 CTR 实验归因。** 已冻结 metadata、URL、canonical、robots 和 sitemap；需要调整时另建小批实验。
8. **提交/认领完全消失会伤害商业入口。** 已改为从 Guide/comparison 主路径移除，保留 Tool 页和专门商业页面承接。
9. **一次并行四组开发会造成共享模板和主计划冲突。** 已规定严格串行交付单元，每次仅一个开发和一个 QA。

### 最终评审结论

方案通过。优先级、回滚路径、SEO 边界和自动验收完整；没有数据库迁移、生产写入或不可逆删除。最大风险是共享模板影响面广，已通过样板先行、独立 QA、完整 build、生产 HTML 扫描和串行 rollout 控制。实施从 PUB-01 开始。
