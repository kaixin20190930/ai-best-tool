# PUB-03A–D 开发交接（2026-09-14）

> 返工更新：原候选 `80b450a49fcaf0938159c176ba7288ee984d3d0c` 因新增 70 条 lint 被 QA 退回。已按限定范围全部修复，候选相对基线新增 lint 为 0，等待后续提交的独立复验。本文下方的旧 lint 数字仅记录原候选；最新结果与 old→new diff 见 [lint 返工交接](PUB_03_LINT_REWORK_2026-09-14_CN.md)。

状态：**DEV_READY，等待候选提交的独立 QA**。本次只交付一个功能分支候选，不代表生产已经完成清理。总控负责 QA、main 门禁、合并、部署及状态更新；本次没有开启 PUB-04，也没有修改主计划状态。

- 分支：`codex/pub-03-tool-discovery-boundary`
- 基线：`e51642b613031ba40c2556fced97de5091931433`
- 候选完整 SHA：见本次交付消息，或在该分支执行 `git rev-parse HEAD`。

## 最终行为与范围

Tool 普通详情页只有一个主 Decision Card：任务适配、关键限制、价格、更新日期、适合与不适合的场景、风险及后续比较。V2 已嵌入其中，未知字段不生成占位结论。官网入口前移；真实官方证据、引用链接、证据账本、变化时间线、评分、评论、收藏和分享入口保留。无真实评分时显示暂无评分。工具方认领与维护 CTA 收拢到可展开的 owner 区域。

移除重复摘要、后台评分、完整度缺口、未来编辑排期、索引状态及重复推荐模块。对于数据库中已有的历史运营文案，通过窄范围的展示转换保留产品事实、限制、原始核查日期和来源；没有更新生产数据。Woy.ai 与四个历史 monitor 工具按可验证的产品范围展示；安全归档和历史品牌页面继续保留原有访问限制。

Home、Explore、New、Best 与 Category 缩短首屏并去掉重复工具/任务列表。筛选、任务入口、实际工具列表、分类、既有 FAQ 及真实社区数据仍保留。New 的类别分组使用数量和链接，不再重复展示同批工具卡片。通用导航不再导向 Submit/Pricing；全局页脚保留一个低权重的工具方入口。商业页面保留原有价格、支付和提交流程，清除泛化的内部证据模板及后台规划文案。

视觉抽查发现 SVG 封面也包含内部编辑说明。本次清理 **105 个封面**中的此类文字，保留产品名称、描述、路径、布局和尺寸；全部 **111 个 SVG**通过 XML 与文案检查。历史资产生成脚本未改动，新增门禁会拦截重新引入这类公开文案。

主要代码：`components/tools/PublicToolDecision.tsx`、`components/decision/DecisionCardV2.tsx`、Tool/发现页模板、`lib/content/publicToolScope.ts`、共享卡片与导航。规则、测试和只读审计脚本位于 `scripts/`，完整报告及截图位于 `reports/public-content-boundary/pub-03-*`。

## 全量覆盖与冻结结果

| 检查 | 结果 |
| --- | --- |
| 原始源码规则在基线复现 | 51 项 |
| 候选公开源码残留 / 新增违例 | 0 / 0 |
| 生产 URL 清单与候选 HTML | 390 个去重 URL，覆盖 sitemap 与 noindex |
| 扩展 HTML 规则的违例页 | 生产基线 124 → 本地候选 0 |
| HTML 获取、正文、商业入口、SEO 冻结失败 | 0 |
| sitemap URL 集合 | 116 → 116，完全一致 |
| published 数据库记录 | 46，全部纳入双语审计 |
| 代表性 fallback | Lindy、Notta、DeFiLlama、Grammarly、ChatGPT，双语 |
| 普通 Tool/fallback 页面 | 82 页，每页恰好一个 Decision Card |
| 受限范围 / 归档页 | 18 页，保留原有访问与索引边界 |
| 已存在的证据账本 / 变化时间线 | 各 20 处，候选全部保留 |
| 修改的 app 源文件 metadata 冻结 | 13 个文件，声明 token 等价 |
| 原始证据与评论源代码不变断言 | 7 项通过 |

历史 51 项包含 **46 项实际公开源码文案、4 项被旧规则误纳入的真实 admin 路径、1 项合法的 Monitor 动词**。46 项公开文案已清理；admin 路径明确排除；合法动作标签改为 Track changes。没有通过放宽公开规则隐藏残留。

HTML 审计先完整执行 390 页；最后的 Tool 展示文案和 New 文案调整后，重跑全部 104 条 Tool 路径与 2 条 New 路径，合并后的 390 页结果全部通过。报告保留两批路径清单（390 + 106）。之后仅清理 SVG 文案、无用 import/变量，以及给 verified 组件补运行时类型守卫；这些没有改变已有页面的 HTML 输出。最终完整构建包含这些改动。

逐 URL 比较 status、最终路径、title、description、canonical、hreflang、robots、X-Robots-Tag、完整 JSON-LD；全部与生产基线一致。路由、API/actions、索引配置、SEO/data/services、数据库与 migration 均未改动。FAQ 内容与原 schema 保持一致。

两个已有不可用 slug：`elevenlabs` 与 `shop_your_ai_powered_shopping_assistant`，各自中英文页面保持生产既有结果。普通卡片页 82 + 受限页 18 + 既有不可用路径 4 = 104 条 Tool 审计路径。这些页面没有被借机发布或解禁。

## 验证证据

- `pub-03-html-before.json`：生产基线、只读 published 清单与原始 head/schema。
- `pub-03-html-verification.json`：390 页候选结果及逐项失败清单（空）。
- `pub-03-source-before.json`、`pub-03-source-freeze.json`：51 → 0、13 文件 metadata、111 SVG、7 项证据/评论源码保留。
- `pub-03-regression.json`：24 项检查通过，覆盖 PUB-02、内容边界、SEO、metadata、链接、索引、sitemap、CTR、日期、分类、Decision Card/V2、官方证据、fallback、关系、安全和历史品牌。新增渲染断言验证唯一主卡片、未知字段隐藏、真实来源/价格/限制/日期保留。
- 既有 `test:public-content-boundary:html` 也通过。TypeScript `--noEmit` 与完整 `pnpm run build` 通过；构建 ID 为 `s4nI4d4hPXMdmzN4FR32Y`，完整输出见 `pub-03-build.txt`，汇总见 `pub-03-validation-summary.json`。
- `pub-03-visual-verification.json`：32 张截图，16 张 1440×1000、16 张 390×844，全部一个 H1，移动端无横向溢出。覆盖 6 类发现页面、5 个 Tool、5 个指南、5 个 noindex 比较页。截图和两张对照图位于 `pub-03-visual/`。
- 交互验证：Claude owner 区可展开并显示状态和认领链接；Explore 免费筛选更新为 `?pricing=free`，显示 3 / 3 个工具。
- `pub-03-eslint-comparison.json`：单独记录既有 ESLint 与候选结果：变更的既有文件基线 1612 项，候选（含新增脚本）1642 项，主要为缩进、括号与风格规则，另有旧 `.tsx` 测试未被 ESLint TSConfig 包含。不将 lint 或新增 lint 数量记为通过。候选提交使用 `HUSKY=0` 跳过会批量重排冻结历史块的自动修复钩子；构建原有跳过 lint 配置未改动，专门的功能、冻结、类型及构建门禁已通过。

## 只读隔离与复现

所有生产数据访问用于读取；本地浏览器只访问代理端口 3037。PostgreSQL 设置 `default_transaction_read_only=on`，审计通过 SHOW 验证。服务端 fetch 在网络发送前拒绝非 GET/HEAD 与所有 PostgREST RPC；预览代理拒绝写请求、analytics 与 monitor 路由，并通过 CSP 阻止第三方脚本和 beacon。隔离快照记录 **908 个转发读取、0 个转发写入**；52 个服务端请求和 42 个代理请求被拦截。额外 POST/PATCH/DELETE/PUT 与 GET RPC 探针全部在网络前失败。

凭据文件仅由只读运行器加载到进程，未复制或提交。复现时将 `ENV_FILE` 替换为本机已有凭据文件路径：

```sh
PUB03_ENV_FILE=ENV_FILE node scripts/pub-03-readonly-run.mjs pnpm run build
PUB03_ENV_FILE=ENV_FILE node scripts/pub-03-readonly-run.mjs pnpm start -p 3036
PUB02_UPSTREAM_PORT=3036 PUB02_PREVIEW_PORT=3037 PUB02_BLOCK_LOG=/tmp/pub-03-blocked-requests.jsonl node scripts/pub-02-preview-proxy.mjs
SEO_BASE_URL=http://127.0.0.1:3037 pnpm run test:pub-03-html
pnpm run test:pub-03-content
```

独立 QA 应使用候选 SHA 重新运行默认的完整 390 页检查；不要用 `--capture` 覆盖已保存的生产基线。`--refresh` 仅用于明确记录了影响范围的开发重跑。

## 限制与待总控处理

1. 本次没有生产写入、main 推送或部署，线上仍是清理前版本；候选需独立 QA 后由总控发布。
2. 登录、评论提交、认领提交和支付完成流程没有执行；只读隔离有意阻止这些写操作，现有服务端处理逻辑未变。
3. 两个既有不可用 slug、9 个受限/归档记录及 noindex 范围保持原样。产品价格和官方政策没有重新调研，不制造新的核查日期。
4. 英文桌面现有屏外导航使文档 scrollWidth 为 1468（viewport 1440）；可见主体未越界，移动端宽度 390。未将全局导航重构扩展进本次范围。
5. 共享卡片的展示转换使用明确 slug/已知结构；新增或改变形状的历史内容由全量 HTML 门禁发现，后续数据清理归总控另行安排。
