# CHATGPT-CANONICAL-TOOL-01：主工具实体候选

日期：2026-10-09（上海）。状态：**已受控发布；生产验证通过**。总控在独立 QA 后执行线上只读 preflight、事务 rollback、唯一一次显式 `--commit` 和最终 `verify --online`；固定实体 `c6a77a90-0bce-4f37-a124-7600e81475a1` 为 `published + monitor/noindex`。本单元没有启用 Mac alias/redirect、修改 GPT-4o/OpenAI 状态、创建 Task/Capability/Fit 或批准索引。依据 [身份治理门禁](./OPENAI_FAMILY_IDENTITY_GOVERNANCE_2026-10-09_CN.md)及 [只读审计](./OPENAI_FAMILY_IDENTITY_AUDIT_2026-10-09.json)。

## 候选及证据边界

- 固定工具 ID：`c6a77a90-0bce-4f37-a124-7600e81475a1`；slug `chatgpt`，官网 `https://chatgpt.com/`，分类 `chatbot`，发布目标仅 `published + monitor/noindex`，sitemap 零项。内容在 `data/collection/chatgpt-release.json`，包含 EN/ZH/CN 的产品身份、Best for、Not ideal、能力、套餐、数据控制、平台、限制、Mac 下载入口和来源日期。候选只创建一条工具行，不创建 Task、Capability、Fit。
- 官方产品资料：[ChatGPT Quickstart](https://learn.chatgpt.com/docs/quickstart)、[桌面应用](https://learn.chatgpt.com/docs/app)、[定价](https://chatgpt.com/pricing/)、[Data controls](https://help.openai.com/en/articles/7730893-data-controls-in-chatgpt)、[个人与组织训练边界](https://help.openai.com/en/articles/8983130-what-if-i-want-to-keep-my-history-on-but-disable-model-training)。公开页于 2026-10-09 读取。未登录账号、购买或实测功能。套餐、型号额度、地区、连接器、记忆和训练设置按 claim 记录为 conditional/unknown；不做精确购买建议。首次套餐复查日为 2026-10-16。
- 图像使用本站已有编辑封面和新制中性聊天图块，不使用 OpenAI 标志或截图；两文件 SHA-256 固定于 preaudit，发布前须与部署文件一致。
- 发布前生产只读复查确认 `chatgpt` 主行零条、固定 ID 未占用；`chatgpt-mac` 与 `codex` 是同一厂商下不同产品层级的既有行。事务预演完成插入及字段回读后 `ROLLBACK`，新连接确认主行仍为零、四条受保护旧行和相关账本不变。显式提交后 fresh connection 精确回读唯一主行、三语言正文、Claim 边界、复查日期与两项素材；`/ai/chatgpt`、`/cn/ai/chatgpt` 均为 200、自指 canonical、`noindex`，Decision Card 与数据库优先展示素材可见，sitemap ChatGPT 条目为 0。

## 发布与回滚操作

统一发布器仅选 `--candidate=chatgpt`。本次发布实际完成 `preflight --online`、默认 rollback、显式 `release --commit` 与 `verify --online`。verify 精确检查 DB 行内容、素材部署 hash、实际 hero 素材、无 Task/Capability/Fit、旧行不变、英文中文 200、自指 canonical、noindex 和 sitemap 零项。过程中修复两项发布门禁本身的问题：受保护线上读取改为只允许精确 `https://aibesttool.com` origin 的 GET/HEAD，非默认端口、跨源、写请求和 RPC 均在网络前拒绝；素材断言改为核对页面实际优先渲染的 `thumbnailUrl` hero 图片，而不是要求未被详情页选用的 logo。两项均经原开发任务增量修复和原 QA 任务独立验证。

如需回滚，先运行 `pnpm run tools:rollback-chatgpt-canonical` 预演；确认固定 ID 的正文仍等于本候选、所有外键表没有依赖行、四条旧行不变后，才显式加 `--commit` 删除**仅本次新建**的 ChatGPT 行，再重跑 preflight。旧 Mac/模型/品牌/Codex 行和 URL 不参与回滚，不得用通用 upsert 覆写旧行。

Mac 合并继续 HOLD。`assertChatgptMacRedirectTarget` 仅预留目标完整性测试：已支持 locale 的源必须单跳 308 到同 locale `/ai/chatgpt`，目标 200 且自指 canonical。当前没有加入任何 alias；仍须复核 Mac 安装意图、页面落点、HTTP GET/HEAD 及流量证据，才能另案启用。

索引继续 HOLD。`monitor` 下不准生成 indexable hreflang 或 sitemap 条目；后续单独通过索引审查账本门禁，不从本候选批准 `continue_index`。

## QA 结论

专项负例覆盖固定 ID 被占、重复产品/根域名、素材 hash 错误、claim 状态被提升、受保护行变化、非默认端口/跨源读取和跨 locale Mac 目标。候选内容 QA、只读保护器 QA 与最终素材门禁 QA 均通过；最终生产 `verify --online` 通过。套餐、型号额度、地区、连接器、记忆和训练设置仍按各 Claim 的 `nextReviewDate` 单独复核，不影响当前实体公开状态，也不构成索引批准。
