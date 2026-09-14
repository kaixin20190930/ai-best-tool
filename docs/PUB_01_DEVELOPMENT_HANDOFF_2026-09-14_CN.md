# PUB-01 开发交付与验收说明

日期：2026-09-14。状态：DEV_READY，等待总控指定候选提交的独立 QA；未部署，不能标记 PROD_VERIFIED / CLOSED。

分支：`codex/pub-01-web3-content-boundary`。基线：`00dcbff8e8b9e8c6a12712de7cb5b1a8c914746c`（开始时最新 origin/main）。候选完整 SHA 由开发最终回传，本文不产生第二个文档补账提交。

## 交付范围

仅 PUB-01A–F 的开发部分。总控已确认 sample-first：`verifiedComparison` 显式 opt-in，仅 Web3 comparison 的中英文页面启用；旧 Comparison、Evidence 和 Submission 分支保持原有渲染，不批量迁移其他 Guide。PUB-02/03/04 未实施。

- A：公开 TS/TSX 字符串、JSX 与模板片段扫描；按页面类型、规则和组件记录基线，另保存 5 个生产代表页的正文命中、head 和 schema。
- B：`test:public-content-boundary` 拒绝新文件、新文案或新增重复命中；只有精确文件 + 文本 + 规则指纹 + 既有出现次数可沿用历史预算。admin/docs/reports/scripts/非渲染配置按显式目录排除，公开文件无法用注释申请豁免。样板不再享有历史预算。
- C：共享 ComparisonPage 新增严格比较分支与 `comparisonRows`。只读取明确候选，禁止搜索和热门补位；候选未发布、缺候选、缺值、无差异、缺结论或缺来源时整组停止比较，返回主 Guide 入口，继续 noindex。无效比较同时不输出比较 FAQ/ItemList，避免空数据时仍宣称有效比较；正常数据下 schema 保持原契约。
- D：GuideEvidencePanel 新增 `variant='verified'`，仅接受具体 claim/source/checkedAt/impact，无默认价格/更新/风险卡；GuideSubmissionPath 提供 `audience='reader'` 不渲染契约，样板本身已移除其调用。旧调用方及默认分支冻结待 PUB-02。
- E：Web3 样板变为六段、Dune vs The Graph、4 维矩阵、2 张候选卡、7 个官方文档来源；产品事实与编辑选择理由分开。候选卡链接唯一 Tool 路径的 `#decision-card`，仅一个主 CTA；正文移除重复入口、内部规划、目录分类与空评分。
- F：开发已完成专项回归、实际 HTML、双语桌面/移动视觉、TypeScript、完整 build、生产只读索引审计和现有 production smoke。独立 QA 与部署后新版生产 HTML 验证由总控继续，开发不自行宣称完成。

## 基线变化

| 指标 | 原基线 | 候选 |
| --- | ---: | ---: |
| 扫描公开源码文件 | 356 | 357 |
| 历史内部文案命中 | 1,512 | 1,502 |
| 新增命中 | — | 0 |
| Web3 样板源码命中 | 10 | 0 |
| 双语样板 HTML 命中规则种类 | 各 6 | 各 0 |
| 样板正文 H2 | 17 | 5（对应 H1 范围段后的五段） |
| 样板 Evidence / next / 主 CTA | 重复 | 各 1 |

**1,502 条是待治理历史问题，不是本轮清零成果。** 源码计数包含两个语言分支，不能当成页面数。其他代表页保留原基线命中已通过实际 HTML 对照，未在本单元偷偷改变全站默认行为。

机器证据：

- [原始基线](../reports/public-content-boundary/pub-01-baseline.json)
- [候选扫描摘要](../reports/public-content-boundary/pub-01-result-summary.json)
- [构建后 HTML 与 SEO 冻结验收](../reports/public-content-boundary/pub-01-html-verification.json)
- [生产索引一致性](../reports/public-content-boundary/pub-01-index-consistency.json)
- [视觉核验及本地截图路径/哈希](../reports/public-content-boundary/pub-01-visual-verification.json)

## 已批准的最小 FAQ 例外

总控批准仅修正样板两个可见 FAQ 答案及对应 FAQPage acceptedAnswer.text，准确说明 Dune / The Graph Subgraphs 的范围、官方资料核查和没有独立实测评分；问题、schema 类型不变。可见 FAQ 与 schema 共用 `web3ComparisonFaqs`，组件测试逐字比对，实际 HTTP 验收仅允许该两个答案变化。

URL、title、description、canonical、hreflang、robots、其余 schema、sitemap 均冻结。样板此前没有 canonical/hreflang 标签，英文 Breadcrumb/ItemList 仍含既有 `/en` URL；本轮按冻结要求保留这些现状，不借内容改造修 SEO。comparison 继续 `X-Robots-Tag: noindex, follow`，不进入 sitemap。

## 验证结果

以下均退出 0：

1. `pnpm run test:public-content-boundary`：双语渲染、六段结构、引用可解析、FAQ/schema 一致、缺候选/值/结论/来源/日期/精确 A vs B 语义的失败探针、目录白名单和唯一 opt-in 路由。
2. `pnpm run test:public-content-boundary:html`：构建产物上 5 个代表页返回 200；两种语言样板正文零命中；head 逐字段冻结；schema 仅批准的 FAQ 答案差异；三个旧代表页内部命中保持基线；sitemap 与生产 URL 集合相同。
3. `test:seo-architecture`、`test:localized-metadata`、`test:guide-link-boundaries`、`test:tool-indexing`、`test:sitemap`、`test:ctr-differentiation`。
4. `./node_modules/.bin/tsc --noEmit` 与完整 `pnpm run build`。Next build 编译、类型检查、43 个静态页生成和 trace 均完成；仓库既有配置跳过 build 内 lint。新组件/证据模型通过定向 ESLint；旧 comparison-template 存在既有缩进风格规则冲突，不扩大修复范围。
5. `pnpm run seo:production-smoke`：通过，sitemap 116 URL，无 comparison/内部路径。
6. `pnpm run seo:index-consistency`：生产只读 58 实体、46 published、13 indexable，46 工具的 92 个语言页面；26 个 Tool sitemap URL，遗漏/越界/重复/canonical/robots 冲突均 0。

视觉核验使用 1440×1000 与 390×844，覆盖 cn/en 首屏、矩阵、卡片、来源、锚点及文本换行。修复过移动端表格导致整页撑宽的问题：现在 documentWidth=390，表格在 316px 容器内部滚动 680px 内容。英文移动首屏决策区底部为 812px；两条选择可在首屏读完。来源锚点实际点击通过。截图留在本机 `/tmp/pub-01-visuals/`，清单中记录完整路径与 SHA256，未将二进制截图加入源码。

完整 build 日志：`/tmp/pub-01-build.log`。生产 smoke 日志：`/tmp/pub-01-production-smoke.log`。后续复现本地运行应强制 `PGOPTIONS='-c default_transaction_read_only=on'`，HTTP GET 检查无需浏览器；视觉检查须先隔离统计端点。

## 已知测试污染与风险

**验证过程中发生过未授权的统计写入，不能声称“零生产写入”。** 本地浏览器使用既有项目 `.env.local`，现有 PageViewTracker 自动请求 `/api/analytics/page-view` 并 INSERT analytics。发现后已停止 dev 和浏览器访问；只读核对 2026-09-14、referrer `http://localhost:3017/%` 可确认 **6 条**样板 page-view，UTC **07:43:54.331–07:50:38.569**（北京时间 15:43:54–15:50:38），路径 `/guides/ai-tools-for-web3-comparison`，全部 `tool_id` 为空，未触发该接口的 Tool view_count/updated_at 更新分支。

总控已裁决不删除、不改写这些统计记录，避免扩大风险。记录见 [只读事件证据](../reports/public-content-boundary/pub-01-analytics-side-effect.json)。后续构建产物的 HTTP 验收使用数据库只读配置且没有浏览器访问。隔离本地分析统计属于后续改进项，未越界修改生产统计逻辑。未执行迁移、业务数据写入、main 推送或部署。

其他剩余风险：

- 本单元仅样板先行；旧组件和其他页面仍有基线内内部文案、重复模块与默认卡，待 PUB-02/03。
- 内容基于 2026-09-14 的官方文档，不是产品执行、性能或费用实测；目录/数据库候选暂不可读取时按关闭比较处理。
- metadata 的旧通用描述和既有 schema URL 技术债本轮冻结，后续调整需要单独范围。
- 当前生产 smoke 验证的是现有生产站；新版尚未部署。独立 QA、总控 main build、部署和新版生产验收是后续门禁。
