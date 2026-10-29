# Catalog 候选包审计：Codebase Memory MCP 与 DeepSeek Harness

日期：2026-10-28（Asia/Shanghai）。范围为一个合并的 R 级研究/候选包：官方一手来源、全库只读生产查重、既有 OPS2 schema、平台自有素材和三语言内容。**本次 productionWrites=0；没有 enqueue、发布、Task/关系、索引/sitemap、运行时代码、专用脚本/测试、TypeScript/build/smoke、commit 或 push。**

机器选择包：[OPS2 selection JSON](DAILY_OPERATIONS_2026-10-28_CODEBASE_MEMORY_DEEPSEEK_HARNESS_SELECTION.json)。它是现有通用 `ops2:enqueue` 接受的 selection 对象外包一层批次元数据；执行通用 CLI 时按对象单独传入 `.selections[n]`。没有增加下游 schema 字段或新 intake。

## 结论

| 产品 | 实体边界 | 本次生产查重 | 编辑建议 |
|---|---|---|---|
| Codebase Memory MCP | DeusData 的本地 MCP 代码知识图谱产品；不是 Graphify，也不是模型版本。可选 CBM Lens 是同一项目的配套界面，不另建 Tool。 | `tools` 125 行、`collection_candidates` 94 行全量字段扫描：名称、官方 host、canonical、标题及 payload 均无匹配。通用 OPS2 preflight `ready=true`、零写。 | **READY_MONITOR**。通过通用入队后只能继续既有 QA/发布桥；如后续发布，默认 `published + monitor/noindex`，不代表已索引。独立 QA 尚未执行。 |
| DeepSeek Harness | DeepSeek 的开源代理工作台/运行框架；不是某一个 DeepSeek 模型或模型版本。插件、默认模型名称和模型版本作为该产品的可变 Claim。 | 同样全量扫描：名称、官方 host、canonical、标题及 payload 均无匹配。通用 OPS2 preflight `ready=true`、零写。 | **READY_MONITOR（带醒目安全限制）**。任何公开稿必须把“未经过安全审计、预览阶段、可能执行代码/命令并访问进程可用文件/网络/凭据”作为显著限制；不得写成 production-ready。独立 QA 尚未执行。 |

这里的 `READY_MONITOR` 是候选内容建议，不是已经入队、发布或批准索引。搜索需求和当期 GSC 页面/查询表现不可用，未虚构流量、搜索量或机会评分。

## 官方一手来源复核

所有来源于 2026-10-28 复核；只使用产品方页面、官方 GitHub 仓库、发行页、许可、条款、隐私政策和安全说明。

### Codebase Memory MCP

- [DeusData 官方仓库](https://github.com/DeusData/codebase-memory-mcp)：将产品描述为本地运行的 MCP server，关联源码、文档、配置与基础设施并生成持久代码知识图谱；提供 MCP 和 CLI 工作流。仓库称索引/图查询不依赖托管服务或 API key；这不等于所有可选集成或第三方模型免费。
- [官方 Releases](https://github.com/DeusData/codebase-memory-mcp/releases)：核验时最新列出 `v0.12.1`（2026-10-16）。只记录为复核日版本快照，不将版本建成独立 Tool；版本变化进入同一工具的定期更新。
- [官方 MIT License](https://github.com/DeusData/codebase-memory-mcp/blob/main/LICENSE)：文件为 MIT。此结论仅指仓库声明的项目许可，不自动涵盖用户项目内容、依赖或其他组件。
- 仓库要求/安装说明提及本机原生构建、C/C++ 编译器、zlib、Git；带 Lens 的构建还需 Node.js。CBM Lens 标为 open beta；仓库描述可选浏览器 AI 为 opt-in、本机推理。以上是厂商自述，未在本机独立安装或测试。
- 与 Graphify 的区分：Codebase Memory MCP 的身份源是 `DeusData/codebase-memory-mcp`，核心用户入口是本地 MCP server/CLI；Graphify 是另外的产品实体。本候选把 Graphify 与 Sourcegraph Cody 放在比较范围，不声称二者功能等同，也不通过共享“代码图谱”词汇合并实体。

### DeepSeek Harness

- [DeepSeek 官方产品页](https://www.deepseek.com/en/harness/)：标明 Preview、全球公开预览、开源、桌面应用或代码启动 Web UI，以及插件架构；列出日常工作、编程、研究、后台任务与插件用途。部分功能在页面上明确标注 Experimental。
- [DeepSeek Harness 官方条款](https://www.deepseek.com/en/harness/terms-of-use/)：标注 2026-09-20 更新，并将运营方识别为 Hangzhou DeepSeek Artificial Intelligence Co., Ltd.；具体功能可能受专门协议约束。
- [DeepSeek Harness 官方隐私政策](https://www.deepseek.com/en/harness/privacy/)：同为 2026-09-20 更新。区分官方模型和自定义模型服务；同时列出账户资料、会话日志/用户输入、上传内容和工具调用等信息。政策还说明自定义模型输入会发送给用户选择的提供方。不同服务模式下实际收集、服务器处理和保留行为没有实测，因此本候选不作“本地部署即不收集数据”等笼统保证。
- [DeepSeek AI 官方 GitHub 仓库](https://github.com/deepseek-ai/deepseek-harness)：明确称该项目由 DeepSeek AI 开发；README 标记 Developer preview 并提示会有兼容性破坏变化。其 [安全说明](https://github.com/deepseek-ai/deepseek-harness/blob/master/SAFETY.md) 表示尚未经过安全审计，软件可执行模型生成代码/命令、加载第三方插件并访问运行进程可用的文件、网络、进程和凭据；沙箱/审批不保证隔离。仓库建议最小权限和一次性 VM/container。[LICENSE](https://github.com/deepseek-ai/deepseek-harness/blob/master/LICENSE) 是 MIT；第三方组件/插件仍可能有各自许可。
- 定位边界：这是 agent workspace/harness，不是 DeepSeek 单一模型发布。OpenHands、Claude Code 作为比较对象用于后续分析“桌面/本地工作区、模型提供方、插件生态、权限/安全、兼容性”等维度，不宣称同类能力已经实测或可互换。

## 实体与编辑字段

- 两个 selection 均是 `new_tool`，各有独立 UUID、官方 canonical、`developer-tools` 类别、`gap_filler` Cluster 角色、四个带官方来源 ID 的实体信号、Entity Gate 三项检查和 Claim 边界。
- 对比对象：Codebase Memory MCP 对比 Graphify、Sourcegraph Cody；DeepSeek Harness 对比 OpenHands、Claude Code。下游消费：AI coding assistant / codebase context Cluster；观察信号限定为对比入口点击、官方来源外链点击，以及页面发布后可用的 GSC 查询/页面数据。
- JSON 有 `en/cn/tw` 三种完整编辑内容（简中和繁中分开），含摘要、详情、Best for、Not ideal、限制、比较维度及价格/托管成本边界。现有 selection 类型没有比较对象和 `downstreamConsumer` 字段，因此这些值保存在 wrapper 的 `opportunityContext`，未伪造 schema 属性；选包依旧是可从 `selections[]` 取出的原生 selection。
- Codebase Memory MCP 定价分类为 `free`，仅对应 MIT 软件和本地索引/图查询自述；本机资源、维护和可选第三方模型/服务不作免费保证。DeepSeek Harness 以 `freemium` 表示开源应用与可能单独计费的模型服务并存；没有核实统一订阅价、额度或账户级权利，具体价格 Claim 是 `unknown`。
- 两款素材均为 AI Best Tool 编辑原创的中性 SVG，无厂商商标、产品截图、远程资源或暗示背书；SHA-256 记录在选择包中。媒体不是官方授权 Logo。
- 版本/实体规则：Codebase Memory v0.x 与 CBM Lens 版本作为同一产品的版本/功能更新；DeepSeek 模型、默认模型名称、插件与兼容性变化均作为 Harness 的更新 Claim。只有未来出现独立官方身份、单独用户入口和自主生命周期，才重新评估独立 Tool。

## 生产重复检查

1. 使用项目现有 Neon 连接配置，在 `BEGIN READ ONLY` 中确认 `transaction_read_only=on`；全量读取 `tools` 125 行和 `collection_candidates` 94 行的全部列，并在内存中匹配 `Codebase Memory`、`codebase-memory-mcp`、`DeusData`、`DeepSeek Harness`、`deepseek-harness`、`deepseek`、`Graphify` 及相关官方 host。两个目标均零匹配；Graphify 作为区分对象也未发现生产文本命中。事务执行 `ROLLBACK`，没有写入。
2. 对两个 selection 分别调用现有 `scripts/run-ops2-candidate-enqueue.ts --mode=preflight`。Codebase Memory MCP 返回 `ready=true`、`productionWrites=0`，preimage `8af496cbb1c33920981096ae47f10b5fc74b46f45dbdc205e54a31d69ba11380`；DeepSeek Harness 返回 `ready=true`、`productionWrites=0`，preimage `c5ce4cab149aa5c4a77b845ba68e27d5fdfb88f97f233843202c6fa072479109`。此 generic preflight 再核候选精确 URL/UUID、现存 Tool 名称/EN 标题/canonical、类别与媒体，不执行事务写入。
3. 这证明当前生产表中未见文字/身份字段匹配，不是语义上绝无重叠的证明；Graphify、Sourcegraph Cody、OpenHands、Claude Code 仍是下游决策比较对象。将来若绑定 Task，必须另用该 Task 真实 Fit 全集重新做意图重复检查；本包不绑定 Task，`checkedToolIds=[]` 符合通用 Catalog 契约。

## R 级校验与范围

- selection 结构：`pnpm exec tsx -e '…parseOps2Selection / assertNewToolEntityProfile…'` —— 两个 selection 均通过；`en/cn/tw` 齐全；Codebase 3 个官方来源/5 项 Claim，DeepSeek 6 个官方来源/6 项 Claim；独立实体画像及普通 Catalog 空 Task 关系通过。
- 媒体路径及 SHA：同一结构命令调用既有 `verifyPlatformOwnedMedia` —— 两张 SVG 均通过路径、sha256 和自包含检查。媒体哈希分别为 `33198d6d61ea449ba3d67e47ee04b73022291cab997b90a44ac13777528e8316` 与 `4590a45cef9008ab318621e5af572c786cbd6b4fc7bbaae44c3c3df8267fd8e8`。
- JSON 解析：`node -e 'JSON.parse(...)'` —— wrapper 可解析；没有缺省/占位哈希。
- 通用 production preflight：两个各自执行一次，如上，均 ready 且零写。
- 不运行 TypeScript、应用测试、build、production smoke；本次无运行时代码、页面路由或生产数据差分，符合 R 级范围。

## QA 与后续边界

这是开发/研究槽交付，不代表独立 QA PASS。任务锁为 QA 保留一个独立 `gpt-6-luna` low/medium 槽；只有其对固定 JSON 和素材差分给出 QA PASS 后，才可继续现有通用入队流程。入队和公开仍是后续交付动作；本次没有生产写入、发布或 index/sitemap 批准。保护中的两个 SQL 修改及 `docs/FRESHNESS_CLAIM_DUE_BATCH_2026-10-15.json` 均未读取或触碰。

## 2026-10-29 生产收口

- 唯一独立 QA 槽 `01a18529-f035-7001-aac3-e9a52b3b506c` 对 Codebase Memory MCP 返回 `QA_PASS`；对 DeepSeek Harness 首次只发现本审计中的一处 preimage 转录错误。总控只修正该哈希，复用同一 QA 槽定点复核后返回 `QA_PASS`，没有重做已通过的来源、内容、媒体或 Codebase Memory 检查。
- 两个固定 selection 均依次通过通用 enqueue 的 preflight、rollback、commit、幂等 postcheck，再通过通用 candidate-to-draft 与 tool-to-published 的同一门禁。没有新增运行时代码、专属脚本、数据库表、TypeScript、build 或重复 smoke。
- Codebase Memory MCP：候选 `fbb19a69-8ee0-48e0-8b3c-17b4c6e51a22` 生成 Tool `0c1e9160-8f70-4250-9eda-aab2b74883c8`，最终为 `published + monitor/noindex`。enqueue postimage 为 `83e0632045098f1ba8e887b1629b1cfc54cb7f86d26e6e771fdc4364a5d13c79`，draft preimage 为 `cd09c58212955660c0d725af6fc77a3c95dd0c05e4359fc7e9c48cecf49ceee4`，tool preimage 为 `5e8741910799f689c7de7a6daad3202dd655f8ccc9dd5e8f59a1c843b9bad93b`。
- DeepSeek Harness：候选 `6b31eac4-2dca-466b-a587-26471de2a778` 生成 Tool `78ab6d01-ebf1-4575-882f-adaff8a1a83c`，最终为 `published + monitor/noindex`。enqueue postimage 为 `db12e7693a89aa08affefc54888181b923e4997383d73147e757287acf681829`，draft preimage 为 `6aa31ea75c3785268e5d8bb35d4fdafb1c4aa14bb15fd383ee6c2f73e157e8de`，tool preimage 为 `88fbb428c75dae8165a8d0caf2533ac48e7dcd9b3d15e9f36306db26f393a530`。
- 两个最终 tool postcheck 均为 `productionWrites=0`；索引、sitemap、关系、Task Page 和付费状态均未改变。DeepSeek Harness 继续醒目标注公开预览、未安全审计和代码/命令/插件访问风险。
