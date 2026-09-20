# MEASURE-03：默认休眠的 Finder 事件接入

日期：2026-09-20

状态：`LOCAL_VERIFIED / DORMANT / COLLECTION_DISABLED`

上位契约：[MEASURE-01 决策事件隐私基础层](./MEASURE_01_DECISION_EVENT_FOUNDATION_CN.md)、[MEASURE-02 数据治理与 Pilot 边界](./MEASURE_02_DATA_GOVERNANCE_AND_PILOT_CN.md)。

## Owner 决策

Owner 明确选择暂不配置 `DECISION_EVENT_INTERNAL_TOKEN_HASHES`、`DECISION_EVENT_RETENTION_DAYS`、
`DECISION_EVENT_RETENTION_APPROVED` 和 `DECISION_EVENT_COLLECTION_ENABLED`。代码必须继续按未配置即关闭处理；不得把数据库迁移、保留作业、UI 接入或测试通过表述为 Pilot 已启动。

## 本单元范围

- `/find-tools` 的服务端页面只读取 `DECISION_EVENT_COLLECTION_ENABLED === 'true'`，把布尔值传给客户端。未配置时客户端调度器在创建事件前立即返回，不调用 server action，不产生数据库请求。
- Finder 仅接入六类既有 allowlist 事件：页面查看、任务开始、受控条件、结果显示、零结果、从结果打开工具详情。
- 每次成功 Finder 运行由服务端创建匿名 UUID `resultId`，用于同一内存 flow 内关联结果与工具详情；它不是用户、会话、cookie 或设备标识。
- role、budget 和 integrations 只发送固定值 `redacted`；不发送输入文本、金额、集成名称、URL、query、IP、UA、referrer 或用户身份。
- 客户端发送失败静默降级，不影响 Finder 成功、错误和页面跳转。服务端仍执行 MEASURE-01 的二次校验和 fail-closed 门禁。

## 明确未做

- 未开启采集，未配置任何环境变量，未写生产事件。
- 未接入工具页 Evidence、comparison、保存决策或官网点击事件。
- 未修改 URL、metadata、canonical、hreflang、robots、schema、sitemap、页面文案或索引状态。
- 未把 10 个事件全部接入，也未声称获得真实用户行为数据。

## 验收

- `pnpm run test:decision-event-ui`：未开启时 server action 调用数必须为 0；开启测试夹具时事件使用易失 flow ID；六类 Finder 事件和三类敏感条件脱敏接入存在。
- `pnpm run test:decision-events`：事件契约、PII 拒绝、流量排除、HMAC、保留期和默认关闭继续通过。
- `pnpm run test:decision-finder-ui`：Finder noindex、浏览器本地状态、pending/success/error 和无匿名业务写入边界不回退。
- TypeScript、SEO 架构、计划一致性和完整 build 必须通过后才可进入主分支。

## 后续门禁

本单元完成后仍不启动 Pilot。只有 Owner 将来重新批准环境配置、内部流量排除、独立 QA 和生产 preflight 全部通过，才允许讨论开启采集。其余四类事件必须分独立任务接入，不能借本单元扩大范围。
