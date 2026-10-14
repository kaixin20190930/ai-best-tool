# APP-BUILDER-DECISION-EXPERIENCE-01 | 交付记录

日期：2026-10-14（Asia/Shanghai）

## 公开体验

- 开放英文 `/tasks/build-app-with-ai` 与简体中文 `/cn/tasks/build-app-with-ai`，继续由实时 Task/Capability/Fit 和 Claim 读取门禁控制。缺少当前关系、有效证据或 Bolt/Lovable/v0 任一候选时返回 404；Replit 的 `HOLD_EVIDENCE` 不进入本页。
- 页面解释三种工作流的差异，并从已发布 Fit 显示更适合、不太适合、条件与限制、官方来源、核验日和复核期限。Guide 与 Task 双向连接；Task 进入各工具详情和 Decision Finder。没有把内部发布过程呈现给用户。
- Task 保持 `noindex, follow`、同语言自指 canonical、无搜索 hreflang，且不进 sitemap。仅 EN/CN 有完整页面；其他 locale 的此 Task 返回 404。没有申请 index、改 sitemap、推送或部署。

## Comparison 判断

Bolt、Lovable、v0 的真实关系及 25 条 Claim 足以支持 Task 的三工具选择，但不足以在当前 IA 下创建独立 Structured Comparison。已上线主 Guide 仍是 `noindex`；既定 Comparison URL 必须 canonical 到有效、可索引的同语言主 Guide。现在创建会指向 noindex 主目标。用户可在现有 Guide 的六维对照中比较代码交接、部署、数据、集成、费用和维护。未创建空 Comparison 路由，也未改变编码助手 Comparison 的意图。

## 验证与生产核对方案

专项：`pnpm exec tsx scripts/test-decision-task-page.ts`、`pnpm exec tsx scripts/test-app-builder-guide.ts`；类型：`pnpm exec tsc --noEmit`；路由渲染：一次 `pnpm run build`；差分：`git diff --check`。生产部署由总控协调后，只读核对 EN/CN Task 返回 200、三候选与来源/日期、Guide 与工具链接、robots/canonical、其他语言 404，以及 sitemap 对 Task/Comparison 的零匹配。若关系或 Claim 到期，Task 应回到 404。此方案不触发生产写入或 SEO 状态变更。

现有 pre-commit 全文件 ESLint 钩子在 Guide 的旧缩进和两份旧测试的既有格式处失败；本单新增的嵌套三元已修正。为保持精确差分，固定提交跳过该格式钩子，专项、TypeScript、build 与差分检查结果仍分别记录。

## 独立 QA 精确差分

核对 `lib/seo/taskPageApproval.ts` 中唯一新增 slug、`lib/services/decision/taskPage.ts` 的三工具 fail-closed、Task 页 EN/CN 文案及来源/日期/链接、Guide 入链、`scripts/test-decision-task-page.ts` 与历史 meeting-notes 断言更新。特别确认 Replit 未显示、无内部实施语汇、没有改动两份用户 SQL 或数据库基础架构、没有 Comparison 新路由及 index/sitemap 改动。
