# 每日运营研究包：2026-10-11

日期：2026-10-11（Asia/Shanghai）
级别：R（只读研究与编辑候选）
范围：Bolt 候选推进；五个到期实体只读审计；差异化内容额度核对。
执行边界：未查询或写入生产数据库；未改索引、sitemap、路由、页面或实体；未执行归档、合并、重定向、push、部署或完整 build。

## 结论摘要

- **A / Bolt：部分通过，仍为 `HOLD_EVIDENCE`。** 唯一产品身份、产品入口和核心 AI 应用构建能力得到官方来源支持。组织账户 Claim 需按 Terms §3.5(g) 窄化理解：涉及 personal information 的冲突由 Privacy Policy 控制；目前未解决的仅是 §3.5(g) 是否覆盖 Bolt Model Development Content 中的非个人信息/内容及其许可范围。因此，组织账户对这部分内容的精确用途 Claim 保持 `conditional`/HOLD；不得扩大表述为所有组织账户用途都未解决。这不构成实体级 HOLD。市场验证、独立采用信号和素材授权等原有缺口未在本单元处理，不能升级为 `READY_MONITOR`。
- **B / Freshness：五项均完成只读实体分类，未执行任何动作。** ChatGPT Mac 保留独立兼容/安装说明候选；GPT-4o 保留为 noindex 模型历史说明、退出工具推荐；OpenAI 旧工具实体可评估迁往现有品牌页；Adobe 与 Salesforce Einstein 都是范围过宽的品牌/产品家族记录，不能直接映射到单一 AI 产品。
- **C / 差异化：本周两项用户可见交付额度已用完。** 10 月 7 日 Meeting Notes UX 内容整改与 10 月 10 日 Research Structured Comparison 收口已交付；10 月 11 日不新增第三项页面或公开单元。
- **需要 Owner 授权：** 后续若决定更改五条旧记录的数据库状态、执行重定向/归档/合并，或改变索引/sitemap，须另行单项授权。本研究包不请求这些动作的预先授权。

## A. Bolt 新工具候选

### 本次差分

仅推进候选的一项实体与关键 Claim 证据缺口：确认 Bolt 与 StackBlitz、bolt.diy 的产品边界；核验 Bolt 的核心应用构建能力；核验当前官方服务条款及隐私政策对 Bolt AI 内容的用途边界。既有独立市场采用和素材授权缺口没有被本轮重验或标记通过。

### 身份、Canonical 与核心能力

| 项目 | 结果 | 证据与范围 |
| --- | --- | --- |
| 产品身份 | PASS（候选层） | 官方服务条款将 Bolt 定义为 StackBlitz 提供的 AI-powered application builder；官方帮助说明 Bolt 使用 StackBlitz WebContainers，并由 StackBlitz 作为母公司/服务提供方。Bolt 是产品，StackBlitz 是公司与底层技术/账号体系；不与 bolt.diy 社区分叉合并。 |
| 官方产品入口 | PASS | `https://bolt.new/`。这是厂商产品入口，不等同于本站 canonical。 |
| 建议本站 canonical | 候选 `/ai/bolt` | 沿用目录单一产品详情 URL 约定；10 月 6 日候选预查记录曾在 Neon 69 行内查无匹配，但该预查不是当前生产查重或发布日 preflight。不得据此声称现在生产无重复实体。 |
| 核心能力 | PASS（官方能力描述） | 官方说明支持通过提示生成并迭代网站/应用，包含前端、后端、数据库、登录/支付等应用构件，并可在浏览器运行和发布；官方也说明可获取生成代码。此项只证明厂商陈述的产品范围，不是本站实测或特定复杂度保证。 |
| 市场成熟度 | HOLD | 10 月 6 日候选快照中的 TechRadar 独立实用全文仍为 `search_snapshot_only`，GitHub 外部采用信号未完成核实。官方博客/官方客户名单不替代独立采用证据。 |
| 素材授权 | HOLD | 候选快照没有登记可复用截图/品牌资产的明确授权。本单元没有把官方页面可见图像视为可复制素材。 |

### 关键可变 Claim：AI 输入/输出与模型开发用途

**状态建议：`conditional`（组织账户的非个人信息/内容许可范围未决），保持该精确 Claim HOLD。** Terms §3.5(g) 明确涉及 personal information 的冲突由 Privacy Policy 控制；因此不能笼统称 Terms 与 Privacy Policy 对所有组织账户用途相互冲突。当前未决范围仅为 §3.5(g) 是否覆盖 Bolt Model Development Content 中的非个人信息/内容及其许可范围。一般个人账户的主要用途、退出机制和地区范围另按适用的时间、地区、同意及账户条件限定，不作无条件 `verified_public` 断言。

1. StackBlitz 当前 Terms of Service 将 Bolt 的 prompts、提交或处理的代码/文件、AI 输出、交互数据等定义为 `Bolt Model Development Content`；其第 3.5 节规定，除非退出且受地区与同意条件约束，符合时间条件的内容可能用于模型训练/改进，也可能形成去标识数据集并授权给第三方研究者/模型开发者。
2. 用户可以通过账户设置或联系隐私邮箱免费退出，适用时不限套餐；退出会阻止选择该账户内容用于新的训练/数据集流程，但不自动撤销退出前已经完成的处理、已训练模型或已经交付第三方的数据集。退出不影响为提供、维护、安全、排障和运营服务所需的处理。
3. EEA、英国、瑞士账户不适用上述 5.C 一般用途。组织账户的解读必须遵循 Terms §3.5(g) 的优先规则：涉及 personal information 的不一致由 Privacy Policy 控制。Terms §3.5(h) 对 organization-managed accounts 的排除，以及 Privacy Policy 第 5.C 中管理员启用相关用途并提供所需通知/选择的例外，不能据此概括为所有组织账户用途均未解决。仍需澄清的窄范围是：§3.5(g) 是否覆盖 Bolt Model Development Content 中的非个人信息/内容及其许可范围；另有覆盖该用途的书面协议时，Terms 指定协议优先。
4. 一般 Bolt Model Development Content 的前瞻性适用不得早于 2026-10-07 或该账户条款生效日中的较晚者；Forge 内容存在 2026-09-14 起并基于单独明确启用同意的例外。Forge 启用期间的内容不能直接套用一般 opt-out 说明。
5. StackBlitz Terms 的发布日期为 2026-09-14、更新日为 2026-09-22；现有账户适用日为 2026-10-07 或其后首次通知满 15 日（以较晚者为准），新账户在接受时生效。因此对具体账户和历史内容的结论仍属账户级/时间条件 Claim。

**建议公开呈现边界：**若后续实体发布，涉及组织账户中非个人信息/内容的精确许可用途应省略，或明确说明 Terms §3.5(g) 规定 personal information 由 Privacy Policy 控制，而非个人信息/内容是否落入该优先规则及其许可范围仍需按组织协议和管理员设置核验。不得声称所有组织账户用途都未解决，也不得用单一条文替代另一条文。其余个人账户描述须限定时间、地区与同意规则；退出不等于停止服务所需的运营/安全处理，也不追溯撤销已完成处理或已交付数据集。发布日应重新核对 Terms、Privacy Policy、Forge 设置说明及生效日；不宣称本站验证账户设置或数据流。

**复核日建议：2026-10-25（14 天）**；若 Terms、Privacy Policy 或 Forge 条款提前变更，则立即提前复核。该建议仅记录在本地候选审计，不写生产 `nextReviewDate`。

**未在本次核验的 Claim：**当前套餐实际结账价、Free/Pro token 额度和最新套餐表。官方 Pricing 页当前给出 Free 300K/day、1M/month；官方 Token 帮助页的搜索结果快照仍出现 150K/day 等旧数值，但该旧快照未在本单直接打开核实。金额/额度不是本次 Claim 核验范围，不在候选稿固化精确值；需要时应重新打开两份官方页面并对冲突做单独记录。此待办不改变本次隐私 Claim 状态。

### A 结论与剩余 HOLD

- 本次核验允许把“唯一身份/官方入口/核心 AI 应用构建”记录为候选证据通过；涉及组织账户中非个人信息/内容许可范围的精确 Claim 依据 Terms §3.5(g) 保持 `conditional`/HOLD。涉及 personal information 的冲突由 Privacy Policy 控制；不得将未决范围扩大为所有组织账户用途。
- 实体身份不再是当前主要 blocker，但这不等于生产查重、素材准入或整体市场门禁已通过。
- 保持 `HOLD_EVIDENCE`：至少需要独立实际采用信号直接回读、第二项互补采用信号、可复用素材授权方案、完整 EN/CN/TW 内容与真实限制编辑审查；正式发布日还须重新执行生产查重和页面/canonical/noindex/sitemap preflight。
- 不批准创建工具记录、关系、Task Page、索引、sitemap 或其他生产变更。

## B. Freshness 实体只读审计

selector 依据：[`FRESHNESS_BACKLOG_AFTER_OTTER_2026-10-10.json`](./FRESHNESS_BACKLOG_AFTER_OTTER_2026-10-10.json)，选择 `chatgpt-mac`、`gpt_4o`、`openai`、`adobe`、`salesforce_einstein` 五个 `entity_due` 项。该文件是 10 月 10 日最新生产只读快照；本单元未重连生产数据库，所以下表的当前状态、canonical 与 ID 均沿用该快照/10 月 9 日 OpenAI 审计，不能当作 10 月 11 日生产后像。

| 记录 / 快照身份 | 官方身份与官方入口 | 重复意图 / 建议分类 | 建议后续动作与授权边界 |
| --- | --- | --- | --- |
| `chatgpt-mac`；ID `22561562-5b7e-4e32-b629-ea8626abeeda`；当前英文本站路径 `/ai/chatgpt-mac`，自指 canonical、noindex | OpenAI 将新 ChatGPT 桌面应用（macOS、Windows）与旧版 `ChatGPT Classic` 明确区分；官方提供 macOS 14、Apple Silicon M1+ 或 Intel 的要求及统一下载入口 `https://chatgpt.com/download/`。 | 与 ChatGPT 主产品相关但有安装、系统兼容、Classic 持续支持的独立需求。不是纯粹重复名称，也不是独立 AI 引擎。分类：**保留独立解释页候选**，不建议现在合并。 | 更新内容以解释新桌面 app、Classic、兼容要求和 Codex 入口为限；检查承接页能否满足 Mac 专属意图后再另案决定。当前生产路径和数据库不变。若以后重定向，须单独取得 Owner 授权并验证同语言单跳目标。 |
| `gpt_4o`；ID `73a3ca28-707c-4460-b769-50ee47ba5e69`；本站 `/ai/gpt_4o` 自指 canonical、noindex | OpenAI Help Center 确认 GPT-4o 于 2026-02-13 从 ChatGPT 退役、Enterprise/Business/Edu Custom GPT 的过渡期于 2026-04-03 结束；当前 API 模型页仍介绍 GPT-4o 的 API 能力、端点与快照。API 可用性与账号权限不得混同。 | 不是目前 ChatGPT 可选的独立助手工具，但仍有当前 API 开发者查询价值。分类：**工具目录退出候选 / 保留 noindex API 模型说明**，不重定向到 ChatGPT、OpenAI 或 Codex。 | 后续可在经 Owner 批准的编辑任务中移除工具比较/推荐关系，并将内容明确为 API 模型说明；系统没有 `archived` 工具状态，不得写入不存在的枚举。数据库状态和 URL 未变。 |
| `openai`；ID `1ac05946-fab2-48bf-9c5d-6188124db8fb`；本站旧 `/ai/openai` 自指 canonical、noindex | OpenAI 官方 About 页面定义公司/研究与部署身份；本站已有 `/brands/openai` 品牌/平台页，10 月 9 日审计确认 EN/CN 为 200、自指 canonical、noindex、sitemap 0。 | OpenAI 是公司/品牌与多产品平台，不是单一工具；将其当 ChatGPT 竞品会产生意图与实体混淆。分类：**可合并到现有品牌/平台目的地的候选**，但不可导向 ChatGPT。 | 可评估 `/ai/openai` 同语言 308 到 `/brands/openai`；这涉及 URL/搜索信号变化，须另行 Owner 授权、确认目标承接度后实施。当前未改路由或页面。 |
| `adobe`；ID `eca3ba76-9e1c-449d-bfa8-43e1a390d681`；本站 `/ai/adobe`；旧审计判为 noindex brand-scope | Adobe 官方首页是公司入口；Firefly 官方独立产品页将 Firefly 作为 Adobe 的生成式 AI 产品/模型家族，Generative Credits、计划和权益需按具体 Firefly/Adobe 产品核验。 | Adobe 是多产品公司，Firefly 才是一个明确 AI 产品身份；将 Adobe 全家族当一件 AI 工具会把 Creative Cloud、Firefly 等不同能力/许可混在一起。分类：**品牌范围待人工复核，不能直接合并到 Firefly**。 | 先决定是否保留 Adobe 品牌解释页，或未来单独评估 Firefly 候选；若选择归档旧工具行或创建品牌/Firefly 实体，均另案审批。现有 noindex 记录不动。 |
| `salesforce_einstein`；ID `44dd71ec-57fb-4d1b-b702-002693fb7c36`；本站 `/ai/salesforce_einstein`；旧审计判为 noindex brand-scope | Salesforce Help 仍有 Einstein Generative AI 跨产品说明，并显示 edition/add-on 与 Data Cloud 等前置条件；其原 `/products/einstein/overview/` 官方入口当前跳转到 `/artificial-intelligence/` 的 AIforce 页面。Salesforce 将 Agentforce 定义为可构建/运行 agents 的产品，将 AIforce 定义为更广的能力呈现方式。 | “Einstein”不代表单一 SKU 或购买入口；Einstein Copilot 的更名不代表全体 Einstein 服务都等价于 Agentforce 或 AIforce。分类：**保留待范围拆解的 umbrella 说明候选**，不整体更名/重定向。 | 后续按具体应用（如 Einstein for Sales / Platform / Service）核对身份、版本与授权；评估旧 umbrella 页面是否应转换为 Salesforce AI 平台说明。明确目标页、内容承接与意图前不重定向。任何归档/重定向/拆分写入都需 Owner 授权。 |

### B 总结

五项不应被合成同一批自动“清理”：ChatGPT Mac 具有可保留的客户端安装/兼容意图；GPT-4o 是模型页而非工具推荐；OpenAI 是可指向现有品牌页的明确迁移候选；Adobe 与 Salesforce Einstein 是复杂产品家族，需要先定实体范围，不能以单个热门子产品替换母品牌。

本次没有完成生产实体存在性、10 月 11 日行哈希、HTTP 或关系表复核，也没有改 nextReviewDate。下一次若准备实施任何 B 项，先根据当前生产只读快照生成对应的最小 change set；重定向、归档、合并、数据库写入须独立 Owner 授权。

## C. 差异化内容周额度

按 2026-10-05 至 2026-10-11 周期计数：

1. 2026-10-07：`MTN-UX-01` Meeting Notes 用户可见内容整改已部署，见[`MEETING_NOTES_USER_VALUE_AUDIT_2026-10-06_CN.md`](./MEETING_NOTES_USER_VALUE_AUDIT_2026-10-06_CN.md)。
2. 2026-10-10：Research Structured Comparison 收口已部署，三语言 Comparison 保持 noindex，见[`RESEARCH_COMPARISON_CONSOLIDATION_2026-10-10_CN.md`](./RESEARCH_COMPARISON_CONSOLIDATION_2026-10-10_CN.md)。

**结论：2/2 周额度已用完。** 本日不创建 Task Page、Tool Intelligence 新模块或 Comparison 新页面；仅保留未来内容候选队列。

## 官方来源目录（2026-10-11 回读）

### Bolt

- [Bolt 官方产品入口](https://bolt.new/)
- [Bolt 官方定价页](https://bolt.new/pricing)
- [Bolt 官方帮助：产品介绍](https://support.bolt.new/get-started/intro-bolt)
- [Bolt 官方产品介绍文章](https://bolt.new/blog/introducing-connectors)
- [StackBlitz 官方 Terms of Service](https://stackblitz.com/terms-of-service)
- [StackBlitz 官方 Privacy Policy](https://stackblitz.com/privacy-policy)

### Freshness 实体

- [OpenAI：ChatGPT macOS 下载、系统要求与新桌面版/Classic 区别](https://help.openai.com/en/articles/9275200-downloading-the-chatgpt-macos-app)
- [OpenAI：GPT-4o 与其他模型从 ChatGPT 退役说明](https://help.openai.com/en/articles/20001051-retiring-gpt-4o-and-other-chatgpt-models)
- [OpenAI API：GPT-4o 模型说明](https://developers.openai.com/api/docs/models/gpt-4o)
- [OpenAI 官方 About](https://openai.com/about/)
- [Adobe 官方公司入口](https://www.adobe.com/)
- [Adobe Firefly 官方产品页](https://www.adobe.com/products/firefly.html)
- [Adobe Firefly Generative Credits 官方说明](https://helpx.adobe.com/firefly/web/get-started/learn-the-basics/generative-credits-overview.html)
- [Salesforce 官方 Einstein Generative AI 配置与 edition/add-on 要求](https://help.salesforce.com/s/articleView?id=ai.generative_ai_enable.htm&language=en_US&type=5)
- [Salesforce 官方 Einstein Generative AI 范围说明](https://help.salesforce.com/s/articleView?id=ai.generative_ai_about.htm&language=en_US&type=5)
- [Salesforce AIforce 官方页面（原 Einstein overview 当前重定向目标）](https://www.salesforce.com/artificial-intelligence/)

## 验证与变更记录

- 级别 R：验证官方来源、记录结构与引用范围；未运行 TypeScript、完整 build、生产 smoke 或数据库查询。
- 本单唯一新增文件：`docs/DAILY_OPERATIONS_RESEARCH_2026-10-11_CN.md`。
- 未修改候选 JSON、主追踪、生产数据、代码、索引、sitemap、路径或下次复核日期。
- 两个用户已有 SQL 修改文件未触碰。
- 不创建 commit，不 push，不部署。
