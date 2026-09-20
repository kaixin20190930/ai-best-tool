# MEASURE-01：决策事件隐私基础层

日期：2026-09-20

状态：`DEV_READY`（仅代码候选；默认关闭、迁移未执行、未接入 UI、未采集真实数据、未启动 Pilot）

基线：`bb8c6b57faf69727d8672c92914bc859172c112f`。上位契
约：[PH0-01 产品假设、能力与指标审计](./PH0_01_PRODUCT_HYPOTHESES_METRICS_AUDIT_CN.md)。本单元不新增 URL，不修改
metadata、canonical、hreflang、robots、schema 或 sitemap。

## 1. 实现范围

- `lib/analytics/decisionEvents/contract.ts` 固定 PH0 的十个事件（含漏斗分母 `find_tools_view`），逐事件声明唯一字段白名
  单和受控值。未知事件、未知字段、客户端 `trafficQuality`、PII、自由文本、预算/角色/集成原值、完整 URL/query、user
  ID、IP、UA、referrer、session/cookie/device/fingerprint 均拒绝。
- `lib/analytics/decisionEvents/flow.ts` 提供只在当前浏览器内存存活的 30 分钟滚动 `flow_instance_id`。没有
  localStorage、sessionStorage、cookie 或跨刷新恢复；精确达到 30 分钟无活动时换新，调用方卸载或刷新即可丢弃。
- `lib/analytics/decisionEvents/ingest.ts` 在服务端分类流量、生成站点密钥 HMAC、计算 30 分钟 bucket 幂等键，并将原始
  flow ID 从存储记录移除。bot、preview、local、health 和匹配内部 token 哈希的流量直接丢弃；正常浏览器标为 `human`，无法
  可靠判断的流量标为 `unknown`，后者不得进入主指标。
- `app/actions/decisionMetrics.ts` 是唯一接收边界；它是 server action，不创建 Route Handler 或公开 URL。它只读取 UA 做瞬
  时 bot 分类，不把 UA、IP、referrer 或请求 URL 传给存储层。通用接收边界默认拒绝 `decision_saved`（必须由成功事务所在的
  服务端调用显式确认）和没有服务器域名映射验证器的 `official_site_click`。
- `db/supabase/migrations/20260920_decision_metric_events.sql` 是**未执行**迁移。新表不复用 legacy `analytics`，列级约束
  再次限制事件形状；RLS 与 FORCE RLS 开启，anon/authenticated 无策略且被撤销全部权限，service role 仅获 insert 与
  identity sequence 的最小权限。原始行读取、报表和删除没有在本单元授权。

## 2. Fail-closed 配置

生产默认拒收。只有同时满足以下条件，接收层才会尝试写入：

1. `DECISION_EVENT_COLLECTION_ENABLED=true`；任何其他值（含未配置）均关闭。
2. `DECISION_EVENT_HASH_SECRET` 已设置且至少 32 字符，用于 HMAC；原始 flow ID 不入库。
3. `DECISION_EVENT_RETENTION_APPROVED=true`，且 `DECISION_EVENT_RETENTION_DAYS` 是 Owner 已批准的正整数。
4. 未命中 bot/preview/local/health/internal 排除规则，且 payload 通过完整契约校验。

内部流量使用 `DECISION_EVENT_INTERNAL_TOKEN_HASHES` 中的 SHA-256 哈希匹配瞬时请求 token；不维护或存储 IP allowlist。该机
制只负责丢弃匹配流量，不为访问者建立身份。

保留期没有默认值，也没有擅自加入删除计划或后台任务。迁移只保存逐行 `retention_days` 与 `expires_at` 审计边界；Owner 批准
期限、删除执行方式与审计责任后，才允许实现并验证清理作业。没有上述批准时即使误开主开关也会 `configuration_invalid`，不写
数据。

## 3. 事件和字段边界

| 事件                  | 接受的业务字段（共同字段为 version、内存 flow ID、locale、固定 surface） | 关键约束                                                       |
| --------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------- |
| `find_tools_view`     | 无                                                                       | Finder 成功显示才可由后续 UI 接入；本单元未接入。              |
| `task_start`          | `taskId`                                                                 | UUID；不发送任务文案。                                         |
| `constraint_selected` | `constraintKey`、`constraintValueCode`                                   | role/budget/integrations 只允许 `redacted`；其他值是固定枚举。 |
| `task_results_shown`  | task/result UUID、`decision-v1`、0–3 计数、unknown 布尔值                | 只收聚合计数，不收推荐内容。                                   |
| `task_zero_result`    | task/result UUID、`decision-v1`、固定 zero reason                        | 不收错误文本。                                                 |
| `tool_detail_open`    | result/tool UUID、固定 finder entry point                                | 直接访问不能伪装 Finder 来源。                                 |
| `comparison_open`     | comparison ID、固定 entry point、二选一来源 UUID                         | comparison key 是受限 opaque ID，不是 URL。                    |
| `evidence_open`       | tool UUID、ledger/card 枚举、固定 claim type                             | 不收来源 URL、摘录、claim key/value。                          |
| `decision_saved`      | task/result UUID、create/update、`decision-v1`                           | 不收 session UUID 或 user ID；没有服务端成功事务确认即拒绝。   |
| `official_site_click` | tool UUID、固定 surface/entry point、official domain opaque ID           | 不收域名、href 或 query；没有服务器映射验证器或验证失败即拒绝。 |

## 4. 自动验证

- `pnpm run test:decision-events`：十个合法事件；未知事件/字段；逐类 PII/身份/自由文本字段；URL/query；约束脱敏；服务端
  HMAC/幂等；30 分钟滚动边界；bot/preview/local/health/internal 排除；`human/unknown` 枚举；开关、密钥和保留期默认关闭；
  迁移事件、RLS 与权限边界。
- `pnpm run test:measure-01-freeze`：从固定基线限制精确文件范围；阻止
  page/layout/route、metadata/canonical/hreflang/robots/schema/sitemap 变化；保证 package 只新增专项命令。
- `pnpm run typecheck:decision-events`、站点 TypeScript、目标
  ESLint、`pnpm run test:seo-architecture`、`pnpm run test:plan-consistency` 和完整 build 作为 DEV_READY 门禁。

## 5. Owner 尚未批准 / 不得推断为已批准

1. 真实保留天数、到期删除机制、删除作业身份、失败告警与删除审计。
2. 内部流量 token 的签发/轮换流程，以及 bot 规则维护责任；UA spoofing 无法被本基础层完全消除。
3. 迁移执行、service-role 运行环境、原始表读取主体、聚合视图和最小样本阈值。
4. 事件 UI 接入、3–5 个既有 Pilot 页面、首个任务簇、官方域名 code 的服务器映射和 Pilot 启动时间。
5. `unknown` 流量的质量复核。主指标只能使用 `human`，不能把 unknown 重新解释为人类流量。

本状态只表示实现候选已经具备独立 QA 条件。它不表示迁移已执行、生产开关已开启、真实数据存在、Pilot 已上线或任何产品假设得
到验证。

## 6. 开发验证记录（2026-09-20）

- 目标 ESLint：新 action、四个事件基础文件和两个专项测试脚本以 `--max-warnings=0` 退出 0。
- `pnpm run typecheck:decision-events` 与全仓 `pnpm exec tsc --noEmit` 均退出 0。
- `pnpm run test:decision-events`：10 个合法事件、17 类禁止字段、5 类流量排除、默认关闭、HMAC/幂等、30 分钟滚动边界、保存事务确认、官网映射确认和迁移权限检查全部通过。
- `pnpm run test:measure-01-freeze`：13 个限定文件，route/page/layout 与全部 SEO 冻结项零差分。
- `pnpm run test:seo-architecture`：296 个 app 源文件通过；`pnpm run test:plan-consistency` 通过，既有四周计划仍为 10/13。
- `MONITOR_API_TOKEN=measure01-build-only pnpm run build`：退出 0，AdSense、编译、类型检查和 43/43 静态页面生成通过。占位 token 仅用于让既有 monitor 路由在 build 预执行时保持 fail-closed，没有提供数据库管理密钥、执行迁移或写入数据。
- 构建仅出现既有 Browserslist `caniuse-lite` 过期提示；本单元未修改依赖或借机处理该基线提醒。
