# CHATGPT-CANONICAL-TOOL-01：主工具实体候选

日期：2026-10-09（上海）。状态：**READY_MONITOR 候选；生产写入 HOLD**。本单元没有执行 `--commit`、push、Mac alias/redirect、GPT-4o/OpenAI 状态修改或索引批准。依据 [身份治理门禁](./OPENAI_FAMILY_IDENTITY_GOVERNANCE_2026-10-09_CN.md)及 [只读审计](./OPENAI_FAMILY_IDENTITY_AUDIT_2026-10-09.json)。

## 候选及证据边界

- 固定工具 ID：`c6a77a90-0bce-4f37-a124-7600e81475a1`；slug `chatgpt`，官网 `https://chatgpt.com/`，分类 `chatbot`，发布目标仅 `published + monitor/noindex`，sitemap 零项。内容在 `data/collection/chatgpt-release.json`，包含 EN/ZH/CN 的产品身份、Best for、Not ideal、能力、套餐、数据控制、平台、限制、Mac 下载入口和来源日期。候选只创建一条工具行，不创建 Task、Capability、Fit。
- 官方产品资料：[ChatGPT Quickstart](https://learn.chatgpt.com/docs/quickstart)、[桌面应用](https://learn.chatgpt.com/docs/app)、[定价](https://chatgpt.com/pricing/)、[Data controls](https://help.openai.com/en/articles/7730893-data-controls-in-chatgpt)、[个人与组织训练边界](https://help.openai.com/en/articles/8983130-what-if-i-want-to-keep-my-history-on-but-disable-model-training)。公开页于 2026-10-09 读取。未登录账号、购买或实测功能。套餐、型号额度、地区、连接器、记忆和训练设置按 claim 记录为 conditional/unknown；不做精确购买建议。首次套餐复查日为 2026-10-16。
- 图像使用本站已有编辑封面和新制中性聊天图块，不使用 OpenAI 标志或截图；两文件 SHA-256 固定于 preaudit，发布前须与部署文件一致。
- 生产只读复查：`chatgpt` 主行零条；`chatgpt-mac` 与 `codex` 是 `chatgpt.com` 下不同路径的现有行；固定 ID 未占用。`/ai/chatgpt` 与 `/cn/ai/chatgpt` 仍是 200、自指 canonical、noindex，sitemap 无条目。事务预演完成插入及字段回读后 `ROLLBACK`，新连接确认主行仍为零、四条受保护旧行和相关账本不变。

## 发布与回滚操作

统一发布器仅选 `--candidate=chatgpt`。`validate` 检查文本与发布政策；`preflight --online` 在只读事务内检查唯一性、固定 ID、旧行、素材 hash 和线上保留页；`release` 默认执行真实插入再回滚，新连接回读。生产部署素材并经总控批准后才可显式执行 `release --commit`，随即执行 `verify --online`。verify 要求精确 DB 行内容、素材部署 hash、无 Task/Capability/Fit、旧行不变、英文中文 200、自指 canonical、noindex、sitemap 零项。若验收失败，先运行 `pnpm run tools:rollback-chatgpt-canonical` 预演；确认固定 ID 的正文仍等于本候选、所有外键表没有依赖行、四条旧行不变后，才显式加 `--commit` 删除**仅本次新建**的 ChatGPT 行，再重跑 preflight；旧 Mac/模型/品牌/Codex 行和 URL 不参与回滚。不得用通用 upsert 覆写旧行。

Mac 合并继续 HOLD。`assertChatgptMacRedirectTarget` 仅预留目标完整性测试：已支持 locale 的源必须单跳 308 到同 locale `/ai/chatgpt`，目标 200 且自指 canonical。当前没有加入任何 alias；仍须复核 Mac 安装意图、页面落点、HTTP GET/HEAD 及流量证据，才能另案启用。

索引继续 HOLD。`monitor` 下不准生成 indexable hreflang 或 sitemap 条目；后续单独通过索引审查账本门禁，不从本候选批准 `continue_index`。

## QA 重点

专项负例涵盖固定 ID 被占、重复产品/根域名、素材 hash 错误、claim 状态被提升、受保护行变化和跨 locale Mac 目标。上线前还需人工核对 EN/ZH/CN 正文在真实 DB 页面渲染、官方 Mac 下载入口、不同套餐的账号边界及媒体部署；`verify --online` 应在实际 commit 后运行。本地开发不把 fallback 200 当作实体已建立。
