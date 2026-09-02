# 决策平台自动化测试与发布验收方案

创建日期：2026-09-02  
状态：最终方案  
实施规格：[AI 工具决策平台三阶段实施方案](./DECISION_PLATFORM_THREE_PHASE_IMPLEMENTATION_CN.md)

## 一、质量门禁

每个阶段使用同一发布顺序：

```text
迁移静态检查
-> 数据库幂等/RLS 测试
-> 单元测试
-> 服务契约测试
-> 组件与状态测试
-> SEO 架构测试
-> TypeScript
-> production build
-> 本地生产 smoke
-> 部署
-> 生产 smoke
```

任一 P0 用例失败即禁止 push/deploy。测试不能依赖“浏览器里看起来正常”作为唯一结论。

## 二、测试分层

### 1. 数据库迁移测试

每份迁移必须验证：

- 在空测试库执行成功。
- 连续执行两次不报 duplicate table/policy/index/constraint。
- FK、CHECK、UNIQUE 和时间范围约束确实拒绝非法数据。
- 新建 public 表全部启用 RLS。
- 匿名用户无法读取用户私有表。
- 用户 A 无法读写用户 B 的 session、stack、audit、trial、watch 或 report。
- 删除用户私有父记录后子记录按设计 CASCADE；删除 tool 时不留下孤儿记录。
- service role 可以执行审核，但普通用户不能写 `published/reviewed_by/moderation_status` 等管理字段。

建议脚本：

- `scripts/verify-decision-platform-migrations.ts`
- `scripts/test-decision-platform-rls.ts`
- package scripts：`verify:decision-migrations`、`test:decision-rls`

### 2. 规则引擎单元测试

固定 fixtures 使用 Claude、Fathom、Gamma、Cursor、Consensus 等已有证据工具。

| 编号    | 场景                         | 预期                         |
| ------- | ---------------------------- | ---------------------------- |
| RULE-01 | 要求 self-host，工具明确 no  | 被硬排除，理由可见           |
| RULE-02 | 要求 self-host，证据 unknown | 不做肯定推荐，进入未知项     |
| RULE-03 | 预算低于已验证最低成本       | 被排除或只出现在超预算说明   |
| RULE-04 | 价格 claim 已过期/冲突       | 不参与硬判断                 |
| RULE-05 | 相同输入 + rules_version     | 工具角色与顺序完全一致       |
| RULE-06 | 候选不足 3 个                | 返回真实数量，不用弱工具补位 |
| RULE-07 | 商业 Featured 工具           | 不因付费提高推荐角色         |
| RULE-08 | relationship 形成自环        | 数据层拒绝                   |
| RULE-09 | stale fit                    | 不产生绝对性推荐             |
| RULE-10 | 年付折月成本                 | 显示换算公式和原始周期       |

建议脚本：`scripts/test-decision-finder-rules.ts`。

### 3. Evidence 契约测试

- 只有 `verification_status=verified`、未 invalidated、未 expired、无 confirmed conflict 的 claim 能支撑公开判断。
- `review_due_at` 过期不删除事实，但把决策状态标为需复核。
- 每条公开判断至少能反查一个 source URL。
- 删除/替换 claim 后，引用它的 profile/fit 自动进入 stale 队列，不静默保留旧结论。
- AI 摘要缺少 claim IDs 时只能保存为 draft。

建议脚本：`scripts/test-decision-evidence-contract.ts`。

### 4. Server Action / API 契约测试

每个 action 返回统一结构：

```ts
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; code: string; message: string; retryable: boolean };
```

验收：

- 未登录保存返回 `AUTH_REQUIRED`，不产生部分写入。
- 连续点击使用 idempotency key，只创建一个 recommendation/audit。
- 数据校验失败返回字段级错误，不返回 Supabase 原始错误。
- 服务端异常记录 request ID，客户端只显示安全错误码。
- 重试成功后清除 loading 和旧错误状态。

### 5. UI 与可访问性测试

关键按钮全部验证四态：idle、pending、success、error。

- pending 出现于 100ms 内，按钮禁用并显示具体动词，如“正在生成建议”。
- success 有 toast 或页面内确认，数据随即更新。
- error 显示可操作下一步，不只显示 `Unable to...`。
- 键盘可完成 Finder、Stack、Trial 和 Watch 操作。
- 表单 label、错误提示、focus 顺序和颜色对比符合基础可访问性要求。
- 移动端不横向溢出，三张推荐卡按顺序纵向展示。

当前项目没有 Playwright 依赖。阶段一先用 `jsdom + React DOM` 做组件状态测试；需要真实浏览器 E2E 时再固定版本引入
Playwright，不能在 Vercel 构建阶段临时下载浏览器。

### 6. 用户旅程 E2E

#### Finder

1. 匿名选择任务和限制。
2. 得到不超过 3 个结果并看到 unknown。
3. 刷新前会话仍在，换浏览器后服务端无匿名记录。
4. 登录并保存后在 `/profile/decisions` 可见。
5. 点击工具进入既有 canonical 详情页。

#### Stack Audit

1. 添加目录工具和一个 custom 工具。
2. 填写年付价格并正确折算月成本。
3. 运行审计，只生成一个 audit run。
4. Keep/Replace/Remove/Missing 均有理由。
5. 删除 Stack 项不会泄漏或破坏已完成审计快照。

#### Trial

1. 创建 7 日试用和 3 个检查项。
2. 标记 pass/fail，刷新后持久化。
3. 到期前生成一次提醒。
4. 完成后选择 keep/cancel，不能再被重复完成。

#### Usage / Watch

1. 提交报告后状态 pending，公开页不可见。
2. 管理员批准，但不足 3 名独立用户时仍不公开比例。
3. 第三名合格用户批准后聚合出现。
4. owner/affiliate 报告披露且不计入独立聚合。
5. candidate change 不通知；public timeline event 通知一次。

### 7. SEO 自动回归

必须加入统一脚本 `scripts/test-seo-architecture-guardrails.ts`，检查：

- 新工作区路由全部 `noindex,follow`，且不在 sitemap。
- sitemap 仍只包含 `en/cn`、白名单 Guide、Best topics、合格分类和 approved tools。
- 英文 canonical 不出现 `/en/`；中文 canonical 必须出现 `/cn/`。
- 不允许 `canonical: './...'` 或手写 `` `/${locale}` `` 进入 indexable 页面。
- indexable 页面 canonical、hreflang self-reference 和 x-default 一致。
- tool robots 和 sitemap 使用同一个 `getToolIndexDecision`。
- 每种核心页面都有唯一 H1、JSON-LD Breadcrumb，并在要求范围内有可见 Breadcrumb。
- noindex 页面不输出到 sitemap；canonical 到其他页面的 alias 必须同时 noindex 或 redirect。
- 首页和核心导航仍明确使用 AI tools directory 主题。

### 8. 安全与滥用测试

- usage report 每用户/工具/任务唯一，重复请求不可刷计数。
- 文本字段做长度限制、HTML 清理和敏感错误隔离。
- 管理员状态字段不接受客户端透传。
- 聚合查询使用 distinct user，owner/employee/affiliate 不混入独立用户。
- 邮件订阅有 opt-in、暂停和退订；退订后不再发送。
- 删除账户后私有数据按政策删除或匿名化，不留下可识别备注。

### 9. 性能与降级

- Finder 首屏不等待全部 evidence 明细；推荐查询目标 P95 < 800ms。
- Evidence 弹层按需加载；失败时显示“证据暂不可用”，不让详情页 500。
- Stack Audit 使用异步状态时，页面可轮询/刷新恢复，不依赖单个长连接。
- 数据库不可用时公开工具页主体仍可渲染；私有写入明确失败且不假成功。
- 首页、Explore、工具详情 Core Web Vitals 不因新模块引入全局大 JS bundle。

## 三、阶段发布门槛

### 阶段一 Gate

- 10 个核心工具、至少 6 个 task 有 reviewed fit。
- 100% published fit 有 verified claim 引用。
- 规则测试、RLS、SEO、TypeScript、build 全部通过。
- 匿名输入未进入数据库日志或表。
- 生产 smoke 覆盖 `/find-tools` noindex 和工具页不回归。

### 阶段二 Gate

- 至少 3 个真实产品完整走完 Stack -> Audit -> Trial。
- 跨用户访问测试 100% 阻断。
- 重复点击不产生重复 audit/reminder。
- 费用换算与原账单值均可见。

### 阶段三 Gate

- 至少 3 个独立、审核通过的信号才公开聚合。
- 利益关联披露和排除逻辑测试通过。
- candidate/内部 timeline event 绝不触发通知。
- 退订、去重和隐私删除测试通过。

## 四、统一命令与 CI 目标

实施后应形成：

```bash
pnpm run verify:decision-migrations
pnpm run test:decision-rls
pnpm run test:decision-rules
pnpm run test:decision-evidence
pnpm run test:decision-ui
pnpm run test:seo-architecture
pnpm run test:tool-indexing
./node_modules/.bin/tsc --noEmit
pnpm run build
pnpm run seo:production-smoke
```

CI 分为 `fast`（规则、契约、SEO、tsc）和 `release`（迁移、RLS、build、生产 smoke）。Vercel 只能部署已通过本地 release
gate 的 commit。

## 五、验收记录模板

每个任务关闭时记录：任务 ID、commit、迁移文件、执行环境、测试命令、通过数量、失败与处置、生产 URL、验证时间、验证人。不
得只写“已完成”而没有测试证据。
