# PUB-04：公开差异化模块注册与实验门禁

日期：2026-09-20

状态：`PROD_VERIFIED / CLOSED`（机制已部署且默认关闭；未启动真实 Pilot、未新增分析事件）

基线：`8038cae93198f3ad6437a7542bc3ec20394d0f1f`。仅实现 PUB-04，不启动试点、不新增页面或工具，不调整任何 SEO 契约。

## 最小接入点

`lib/content/publicModuleRegistry.ts` 提供强类型注册和运行时严格校验。`PublicModuleArea` 批量评估页面上的新模块后才执行
内容渲染回调。现有 `PublicToolDecision` 仅增加可选的 `experimentalModules` 插槽，已有调用方不传该参数，所以输出保持不
变。Decision Card、Evidence Ledger、Change Timeline、评论、官方来源和关系模块均不受此开关控制。

生产注册列表、已审查页面目录和实验状态均为空，总开关 `publicModuleControls.mode` 为 `off`。不存在默认启用的样例模块。测
试中的来源和指标只是夹具，不进入公开页面，也不代表实际实验结果。

## 新模块准入

1. 在 `publicModuleRegistrations` 中填写 `PublicModuleRegistration` 全部必需字段，包括用户问题、公开价值、证据要求、位
   置、实例上限、成功指标、停止规则和回滚方式。`enabled` 默认 `false`、`rolloutPercent` 默认 `0`、`indexImpact` 默认且只
   能为 `none`；不允许附带 metadata 等额外字段。
2. 审查后在 `publicModulePilotPages` 明确列出已有路径及其页面类型；每个模块只能引用其中 3–5 条唯一、类型匹配的路径。路径
   精确匹配，语言前缀视为不同页面，不自动扩展到其他语言、query、alias 或新 URL。目录是代码审查边界，注册器不访问数据库或
   探测网络；新增目录项必须在该模块的测试中证明路由和页面已存在。
3. 每次页面渲染统一提供全部新模块请求，每项包含唯一 `instanceId`、注册 ID、位置以及具有 HTTPS 来源、具体 claim、核查时间
   和 `verified` 状态的证据。一个页面只能有一个 `PublicModuleArea`，不得拆开调用以规避实例预算。任何模块超额时，该模块在
   本页的所有实例均拒绝展示；重复实例 ID 也拒绝。已存在模块继续位于插槽之外。
4. 增加对应实验状态，并明确启动日、核查时间、当前版本、SEO/证据事件及体验和行为信号。打开模块及总开关后仍须通过所有门
   禁。缺少状态、版本不匹配、未来时间或超过 24 小时未更新的健康核查均关闭展示。

`requiredEvidence` 至少一项，逐项检查 ID 和有效期；缺少、未核验、过期、未来日期或格式错误均不展示。声明证据为 verified
仍需人工事实核验，注册器只验证结构与有效期，不会自行把来源内容判定为真实。

## rollout 与观察

抽样单位为明确列出的页面，使用 `experimentId + version + path` 的稳定散列。相同页面对访客和爬虫一致，不依赖 cookie、用户
身份或随机数；0% 全关，100% 也仅限已批准试点。由于只有 3–5 个页面，百分比不代表精确的流量比例；更改版本会重新分配，必须
重新审查实验状态。

`successMetrics` 记录指标说明、目标及 `baselineRef`。无真实基线时允许 `null`，只能先采集基线，不声称提升。此单元不新增埋
点或自动采集指标，健康判断和复核报告由维护者提供。

第 14 天必须有首次复核，第 28 天必须有完整复核；到期缺报告、报告日期早于对应窗口或晚于当前时间时关闭。继续仅允许
`continue-pilot`，不会扩大页面白名单。SEO/证据事件、体验与行为同时恶化或任何复核决定 `stop` 都立即关闭；行为单项恶化不直
接否定体验改善，交由真实复核决定。

## 可逆关闭与数据保留

总开关 `off` 关闭所有新模块；模块 `enabled: false` 或 `rolloutPercent: 0` 可单独关闭；全局或实验 `mode: rollback` 表示回
滚展示。唯一允许的 `rollbackMode` 为 `hide-preserve-data`，所有决策带有内部 `dataPolicy: retain`。实现是纯读取和渲染过
滤，没有数据库依赖、写入、删除、迁移或数据清空回调；注册、来源、报告和底层业务数据均保留。

恢复时重新设置开关与健康状态，重新通过证据和复核门禁即可。当前开关由服务端代码配置，变更需要按既有发布流程交付；此单元不
提供后台操作界面、生产热更新或部署。注册配置、停止原因、内部实验状态均不渲染到 DOM。

## 验证

- `pnpm run test:public-module-registry`：合法及非法注册、字段、证据、页面、位置、实例、rollout、停止、14/28 天复核、回
  滚、默认关闭与空 DOM。
- `pnpm run test:pub-04-freeze`：从固定基线检查精确文件范围，保留原组件全部内容，冻结路由/SEO/数据库及 lint/build 配置。
- `pnpm run typecheck:public-modules`：额外覆盖默认 TypeScript 配置不包含的两个新脚本。
- 对全部变更 TS/TSX 单独运行 ESLint；再运行站点 TypeScript、相关回归和完整 `pnpm run build`。不以既有 build 跳过全仓
  lint 的设置代替目标 lint。

## 开发验证记录（2026-09-20）

- 目标 lint：`pnpm exec eslint lib/content/publicModuleRegistry.ts components/public-modules/PublicModuleArea.tsx components/tools/PublicToolDecision.tsx scripts/test-public-module-registry.ts scripts/test-pub-04-freeze.ts --max-warnings=0`，退出 0，错误/警告均为 0。
- `pnpm exec tsc --noEmit`、`pnpm run typecheck:public-modules` 均退出 0。
- `pnpm run test:public-module-registry`：13/13 测试组通过，包括允许内容的真实 SSR、关闭时不执行回调和实际插槽位置校验。
- `pnpm run test:pub-04-freeze`：通过，限定 10 个文件（8 个机制/测试文件与本任务要求的 2 个计划状态文件）；现有路由、SEO、数据库及 build/lint 配置均保持冻结。
- 19 项现有回归通过：`test:public-content-boundary`、`test:pub-02-content`、`test:pub-03-content`、`test:seo-architecture`、`test:localized-metadata`、`test:guide-link-boundaries`、`test:tool-indexing`、`test:ctr-differentiation`、`test:ctr-snippet-experiments`、`test:home-positioning`、`test:seo-breadcrumbs`、`test:reviewed-tool-relationships`、`test:tool-decision-card`、`test:tool-decision-card-structure`、`test:decision-card-v2`、`test:intelligence-change-timeline`、`test:guide-decision-paths`、`test:priority-tool-evidence`、`test:index-consistency`。
- `MONITOR_API_TOKEN=pub04-build-only pnpm run build`：退出 0，AdSense、编译、类型检查和 43/43 静态页面生成通过。首次不带该构建期占位 token 时，基线的 trial-reminders GET 路由被 Next 预执行并因缺少 Supabase 管理密钥失败；占位 token 只让无授权构建请求在路由入口 fail closed，未提供 Supabase 密钥、未连接或写入生产数据库。既有 Browserslist 数据过期提醒未涉及本次修改。

基线遗留失败：`pnpm run test:decision-seo-release` 在第 27 行失败，因为旧测试仍要求 Tool 路由源码直接包含 `decisionCardV2 ?`，当前 main 已通过 `PublicToolDecision` 封装渲染；该测试及被断言路由本任务均未修改。`pnpm run test:evidence-ledger` 在第 272 行同样仍从 Tool 路由源码寻找 `id='decision-card'`，而该标记已位于 `PublicToolDecision`。`pnpm run test:sitemap` 因此 worktree 未配置 Postgres URL 而无法执行数据型检查；静态 `test:seo-architecture`、`test:tool-indexing`、`test:index-consistency` 和完整 build 均已通过。上述结果未在 PUB-04 中掩盖或扩展修复。

## 独立验收与发布记录（2026-09-20）

- 首次独立 QA 对候选 `fa1952a546680020fecf46c7cacc1f110f87a572` 判定 `QA_FAIL`，唯一候选回归为 `scripts/test-pub-04-freeze.ts` 的两处 ESLint 花括号错误；核心机制、13 项专项测试和 SEO 冻结边界均已通过。
- 原开发任务仅修复该 lint，形成候选 `448d342f8e721bfcbf2111f14aaceb5b5490d87e`；同一 QA 复验确认差分只有该测试脚本，目标 ESLint、冻结测试、13/13 注册测试、专项类型检查和 SEO 架构均通过，最终结论 `QA_PASS`。
- 总控以 `4edcc369`、`c88c625d` 合入 `main`。清理并发构建产物后，主分支完整 `pnpm run build` 退出 0，AdSense 校验、编译、类型检查和 43/43 静态页面生成通过。
- GitHub `main` 已推送至 `c88c625d`；生产 SEO smoke 通过核心页面、canonical、hreflang、Breadcrumb、noindex、robots 和 116 条 sitemap URL。由于生产注册、Pilot 页面和实验状态仍为空/关闭，本次部署不改变公开模块输出。

剩余范围：未启用真实试点，未采集或声称指标改善；启用前仍需提供真实模块、3–5 个现有页面、证据、健康判断与复核报告。日常开关调整仍按代码发布流程执行。本单元不包含后台热开关或新埋点。
