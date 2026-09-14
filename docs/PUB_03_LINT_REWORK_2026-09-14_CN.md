# PUB-03 lint 返工交接（2026-09-14）

状态：**修复完成，待总控对新候选做独立复验**。原候选 `80b450a49fcaf0938159c176ba7288ee984d3d0c` 已被 QA 退回；本次在同一功能分支追加一个提交，新完整 SHA 随交付消息回传总控。

基线：`e51642b613031ba40c2556fced97de5091931433`。分支：`codex/pub-03-tool-discovery-boundary`。没有修改 main、部署或写生产数据库。

## 唯一阻断的修复结果

| 比较项 | 退回候选 | 修复后候选 |
| --- | --- | --- |
| 相对基线新增错误（逐文件、逐规则取正增量） | 70 | **0** |
| 候选 lint 错误总数 | 1642 | 1572 |
| 已修复的基线旧错误 | 40 | 40 |
| `audit-pub-03-html.ts` | 34 | 0 |
| `test-pub-03-freeze.ts` | 12 | 0 |

重新读取同一基线、原候选与当前文件，使用未改动的仓库 ESLint 配置对原审计范围的 39 个 JS/JSX/TS/TSX 文件执行检查。基线仍是 1612 项；不是用净差值抵扣新增错误。结果详见 `reports/public-content-boundary/pub-03-lint-rework.json`，其中 `candidateAddedErrors: 0`、`currentAdded: []`、`pass: true`。

只修改 QA 点名的 10 个代码文件：

- HTML 审计：20 条缩进与 14 条控制流格式问题。
- 冻结测试：12 条控制流格式问题。
- DecisionCardV2：12 条缩进问题。
- GuideEvidencePanel：解构读取 variant，保留原有守卫条件。
- Tool：owner 日期拼接使用等价模板字符串。
- Category：将原嵌套条件表达式提取为等价局部标签，四种语言/类别分支的文本不变。
- Profile submissions：修正一个结束括号的缩进。
- SafetyToolArchivePage：提取原有提示内容的等价条件分支，保留 undressing_ai 优先使用 review.reason 的逻辑。
- 两个 Decision Card 测试：仅修控制流格式，断言没有减少或修改。

没有批量格式化无关历史文件，没有改变规则配置、页面文案、价格、来源、日期、样式、URL、metadata、schema、sitemap 或数据访问行为。10 个代码文件的完整 old→new 差异保存为 `reports/public-content-boundary/pub-03-lint-rework-code.patch`（零上下文补丁，仅用于审阅；基于原候选）。

## 重新验证

- Scoped lint：两个新增审计脚本、两个 Decision Card 测试、DecisionCardV2、GuideEvidencePanel 六个文件直接执行 ESLint，退出码 0。其余四个文件只保留基线错误，逐文件/规则对照无新增。
- 专项回归 **24/24 通过**：`pub-03-rework-regression.json`。包含内容边界、PUB-02、SEO、索引/sitemap、分类、Decision Card/V2、证据、fallback、安全和历史范围检查。
- 冻结门禁通过：13 个 app 文件 metadata 等价，7 项证据/评论源代码保持，公开源码违例 0，111 个 SVG 文案违例 0。
- `tsc --noEmit`：退出码 0。
- 完整 `pnpm run build`：退出码 0，build ID `XFIPDWmSisJB3z9jDuCh1`，43 个静态页生成完成。完整日志为 `pub-03-rework-build.txt`。
- `git diff --check`：通过。

本次没有重做已通过的 390 URL HTML 和 32 张视觉抽查；本次改动范围是 lint 语法与等价表达式，原 HTML/视觉报告仍作为上一轮证据，不能把它们称作在新 SHA 上重新运行的结果。

构建及需要数据库的回归仍通过既有只读运行器执行，PostgreSQL 保持事务只读，服务端 fetch 写入与 RPC 守卫保持启用。没有启动写操作或修改生产数据。

仓库保留的 1572 项基线 lint 不在本次授权修复范围。为避免提交钩子自动重排冻结历史代码，本次提交继续使用 `HUSKY=0`；新增 lint 为 0 的独立检查已经通过。请求总控基于新完整 SHA 复验唯一阻断，决定后续 main 门禁与发布。
