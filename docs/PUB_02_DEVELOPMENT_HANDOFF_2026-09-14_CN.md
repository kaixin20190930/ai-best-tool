# PUB-02 开发交付与验收说明

状态：DEV_READY；独立 QA、合并、部署和生产验收由总控执行。

分支：`codex/pub-02-guide-comparison-cleanup`。基线：开始时最新
`origin/main`，`8500684567561675697b6814bff8e376d5944320`。最终唯一候选 SHA 随开发回传，不为补写自身 SHA 再产生一个提
交。

## 交付范围

仅 PUB-02A–E。未实施 PUB-03/04，未推 main、部署、执行 redirect、放开索引或写生产数据库。

- 18 个白名单 Guide 保留任务方法和原有 FAQ，移除内部索引/编辑计划、无来源的默认 Evidence、工具方 CTA 与重复导航。每页加
  入三个可执行检查、一条具体官方来源及其核查日期、两个后续入口。检查步骤明确不是本站产品实测；引用日期只适用于该条官方说
  明，不刷新整个页面或工具的复核状态。
- Research、Automation、Web3 保留任务到工具的 `GuideDecisionPath`，撤下重复候选网格。Guide 不再调用旧
  Evidence/Submission 契约；其他页面仍使用的旧组件分支保持原样，留待 PUB-03。
- 62 个共享调用方全部改为显式 `content.kind`。只有原 Web3 使用 `verified`；其余 61 个是 `unavailable`，不请求搜索或热门
  候选，不展示无依据的比较矩阵、排名、评分或默认风险。旧配置中的每个属性都有原值和处置理由，类型契约不再接受旧属性；两处
  手写 JSX 传参也已迁移。
- 4 个独立 comparison 同样撤下无证据的比较结果，保留原 head/Breadcrumb 和一个相关 Guide 入口。10 个包装 comparison 移除
  追加的重复 Evidence/编辑模块，继续调用原目标，未重定向。
- 76 路由分类为：**1 keep-noindex、10 merge-redirect 候选、65 repair**。后两类不是已完成的真实比较内容；本轮完成的是边界
  治理和安全退化，产品比较修复仍需要明确对象与真实证据。详见 [逐页分类](./PUB_02_COMPARISON_DISPOSITION_CN.md)。

## 获批 schema 例外

总控在开发过程中明确批准：旧 FAQ/ItemList 与正文不符、宣称无依据的评分/实测/完整度，或候选来自搜索/热门补位时，允许
fail-closed 撤下。不得新增评分、Review、价格结论或扩大候选；有来源者必须与可见内容一致。

实际变更：152 个 comparison 语言页面中，148 个撤下 FAQPage 和 ItemList；4 个 Web3 主页面/包装语言页面保留原 schema。所有
Breadcrumb schema、Guide schema、title、description、canonical、hreflang、robots、URL 与 sitemap 均未改变。逐页删除前完
整对象、原因与无新增断言见 [schema diff](../reports/public-content-boundary/pub-02-schema-diff.json)。

## 证据与门禁

- 精确历史预算以 PUB-01 的 **1,502** 为上限，仍逐文件、文本、规则、出现次数校验，未放宽或刷新旧预算。本轮扫描降至
  **51**，新增 **0**；全部 Guide/comparison 源码命中 **0**。51 是未治理的历史扫描项，包含 PUB-03 页面以及既有
  admin/action 范围误报，不能写成全站已清零。
- `test:pub-02-content`：18 Guide 双语渲染、具体来源完整性、两个下一步、全部 Guide 路由/模板 metadata token 冻结、62 个
  旧属性完整映射、76 分类覆盖、路由/索引文件逐字冻结通过。
- `test:public-content-boundary`：精确历史预算、Web3 六段与引用、FAQ/schema 一致、缺候选/事实/引用/日期等失败探针通过。
- 先迁移 Web3、Sales、Note taking 三个代表页，双语验证通过后才扩至全部调用方，见
  [sample-first](../reports/public-content-boundary/pub-02-sample-first.json)。
- `test:pub-02-html`：从生产采集 188 个原始语言页作为基线，对最终本地 production build 的 18 Guide + 76 comparison 双语
  逐页比对，全部 200、一个 H1、正文禁用词 0。head/Breadcrumb 冻结、可选 schema 例外、FAQ 可见一致和 sitemap 集合 116 条
  均通过。
- 既有回归 11/11：SEO architecture、localized metadata、Guide link boundaries、tool indexing、sitemap、CTR
  differentiation、Guide decision paths、localized navigation、editorial review dates、category fact boundaries、Tool
  Decision Card structure。另通过 PUB-01 HTML 门禁与本地 production SEO smoke。
- 5 Tool 的 10 个语言页面随机回归（Claude、Notion、n8n、Dune、Runway）：200、一个 H1、一个主 Decision Card。未借此修改
  Tool 正文。
- 5 Guide + 5 comparison 完成开发语义抽样；同一组页面完成中文移动端 390×844 与英文桌面端 1440×1000 共 20 张截图并逐张检
  查，无遮挡和整页横向溢出。Web3 680px 表格在 316px 容器内可滚到最右端；矩阵引用可跳到对应来源。截图随候选保存在
  `reports/public-content-boundary/pub-02-visuals/`，逐页尺寸、SHA-256 和判定见
  `pub-02-visual-verification.json`、`pub-02-semantic-review.json`。
- TypeScript `--noEmit` 与完整 `pnpm run build` 通过。Next 编译、类型检查、43 个静态页生成及 trace 全部完成；仓库既有
  build 跳过 lint 配置未改变。
- 生产只读索引审计：58 实体、46 published、13 indexable；26 Tool sitemap URL，遗漏、重复、越界、canonical/robots 冲突均
  0。该审计验证的是当前生产数据与索引，不表示候选已部署。

主要机器报告位于 `reports/public-content-boundary/pub-02-*.json`：原始 head/schema、候选 HTML、分类、候选只读可用性、旧
属性迁移、移除区块位置/哈希、回归、语义与视觉证据、汇总。源码变动主要位于 `app/[locale]/(with-footer)/guides/`，新增两个
reader 组件和 `lib/content/guideTaskChecks.ts`；未改 Tool、Home、Explore、Best、Category 生产实现。

## 本地只读验证

使用 `scripts/pub-02-readonly-run.mjs` 加载本地环境。所有 Postgres URL 和 `PGOPTIONS` 强制
`default_transaction_read_only=on`；实际数据库 `SHOW` 已确认开启。runner 不加载 Supabase service key，并设置本地 monitor
token，使构建和预览中的提醒 GET 无法触发系统发送。

初次受限构建暴露了既有 `/api/monitor/trial-reminders` 在缺 monitor token 时允许进入系统动作的行为；本地没有 service
key，因此在创建管理客户端时就失败，未发起提醒或数据写入。随后仅在 QA runner 设置本地拒绝 token，完整构建通过；未修改生产
鉴权逻辑。

```sh
node scripts/pub-02-readonly-run.mjs pnpm run build
node scripts/pub-02-readonly-run.mjs pnpm start -p 3026
node scripts/pub-02-preview-proxy.mjs
pnpm run test:pub-02-content
pnpm run test:public-content-boundary
pnpm run test:pub-02-html
```

浏览器只访问 `http://127.0.0.1:3027`。代理在到达上游之前拦截 `/api/analytics/*`、`/api/monitor/*` 和所有非 GET/HEAD 请
求；实测 `/api/analytics/page-view` 返回 `204 + x-pub02-blocked:true`，阻断日志在 `/tmp/pub-02-blocked-requests.jsonl`。
最终英文桌面检查前，代理还增加仅本地生效的 CSP，阻止第三方脚本与外部连接。此前移动端检查仅保证内部 analytics/monitor 和
写请求被拦截，浏览器中观察到 GA cookie，因此不能声称第三方统计事件为零；生产数据库写入仍被只读连接与请求代理阻止。直接
HTTP HTML 审计不会执行 PageViewTracker。复现时不得把浏览器直接打开到未隔离的数据环境。

完整 build 日志 `/tmp/pub-02-build.log`，TypeScript `/tmp/pub-02-typescript.log`，本地 SEO smoke
`/tmp/pub-02-local-smoke.log`，全量 HTML `/tmp/pub-02-html.log`。视觉截图、尺寸、哈希和语义判定以交付视觉报告为准。

## 剩余风险与后续边界

1. 65 个 repair 页面目前诚实显示比较不可用，不能宣传为已提供真实比较。恢复时必须补明确候选、差异矩阵、来源和可执行选择；
   索引放行仍独立审批。
2. 冻结的旧 metadata 仍可能使用“比较常见工具”等描述；部分既有 Breadcrumb/包装页 metadata 技术债也被保留。本轮不以内容治
   理名义修改这些信号。
3. 10 个包装 comparison 仅记录合并候选，不执行 redirect；其余弱意图 Guide 的 noindex 状态不变。
4. 新增引用是官方文档核查，不是性能、费用、产品执行或商业效果测试。Guide 中其余产品事实仍以 canonical Tool 页维护为准。
5. 全站 51 个历史扫描项与其他页面的旧 Evidence/Submission 分支留待 PUB-03；本轮不得标记全站公开边界完成。
6. QA 尚未对唯一候选 SHA 作独立 PASS；总控 main build、合并、部署、新版生产验证都是后续门禁。
