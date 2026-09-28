# N2 候选深审：Zapier Agents 与 Ideogram 官方证据审计

核查日：2026-09-28。结论：两项均为 `HOLD_EVIDENCE`。本文件是候选发布包，只记录产品方一手资料、可证明的适用范围、冲突与后续门禁；没有登录账户、结账、执行工作流或生成图片，也没有完成独立市场验证。官方页面的宣传示例与质量形容词不视为实测结果。价格、权益、隐私和产品身份在未来发布 preflight 必须重核。

## 生产身份与重复意图只读检查

使用 `.env.local` 的生产连接对 `tools` 执行 `BEGIN READ ONLY`，读取 `name`、`title`、`url` 中的 `zapier|ideogram`，随后 `ROLLBACK`：当时共 67 条工具，匹配 **0 条**。数据库没有 alias/redirect 表；仓库 `lib/config/toolRouteAliases.ts` 没有 `zapier`、`zapier-agents`、`ideogram` 或 `ai-by-zapier` 的工具别名。线上 `/ai/zapier`、`/ai/zapier-agents`、`/cn/ai/zapier-agents`、`/ai/ideogram`、`/cn/ai/ideogram` 均为 `200 + self-canonical + noindex`，H1 是暂不可用工具壳；sitemap 两项匹配 0。这些不是已发布实体。既有自动化分类指向 `/ai/zapier#decision-card`，也有 Zapier alternatives Guide；这是已有宽泛 Zapier 意图，不能将它当作已核实的 Agents 实体，也不能为同一意图另造页面。Ideogram 未发现对应工具实体或 alias。此检查只覆盖当时生产库、线上只读响应与仓库路由，不授予新建权；正式 preflight 应再查实体、别名、canonical、Guide/Comparison 意图。若后续存在同产品实体或别名，改走更新/合并候选，不新建。

## Zapier Agents：`HOLD_EVIDENCE`

**身份与近期维护信号。** [官方 AI 产品边界](https://help.zapier.com/hc/en-us/articles/26583719914381-Use-of-AI-within-Zapier)将 Zap workflows、Chatbots、Agents、AI Actions 分列：Zaps 是触发器与动作的自动化，Chatbots 是可嵌入网站的对话产品，AI Actions 是供第三方应用使用的 Zapier 动作基础设施；这些都不能无条件归给独立 Agents。[2026-09-07 迁移指南](https://help.zapier.com/hc/en-us/articles/47402591569805-Migrating-from-Agents-to-AI-by-Zapier)明确独立 `agents.zapier.com` 正迁入 Zap 编辑器内的 **AI by Zapier** 步骤。这是产品方近期维护信号，也让原候选的长期 canonical/产品范围成为阻塞；指南没有给出所有账户的统一停用日期，故独立 Agents 最终存续日为 `unknown`。

| 核查项 | 官方事实与真实边界 |
| --- | --- |
| 独立 Agents 的动作与平台 | [Agents 定价 FAQ](https://zapier.com/pricing)只承诺在已连接的应用中、按已配置触发器和动作行事；可接知识源、网页浏览/搜索、Chrome 扩展交互。[独立版 activity 说明](https://help.zapier.com/hc/en-us/articles/26559132765325-How-is-Zapier-Agents-usage-measured)列触发、知识源回答、动作、浏览/搜索和扩展消息的计量。Zapier 平台宣称的全部应用/触发器、SDK、MCP 或 Chatbots 嵌入能力，不等于这个独立产品的无条件能力。 |
| 两套计费与免费门槛 | 独立 Agents [定价页](https://zapier.com/pricing)显示 Free 400 activities/月、Pro 年付 $400（折合 $33.33/月）含 1,500 activities/月、Enterprise 议价；[计量指南](https://help.zapier.com/hc/en-us/articles/26559132765325-How-is-Zapier-Agents-usage-measured)说明 Free 测试计量、单次 10 activities，Pro 单次 40、测试不计量，Team/Enterprise 共享池；activity 不消耗 Zap tasks。相反，[迁移指南](https://help.zapier.com/hc/en-us/articles/47402591569805-Migrating-from-Agents-to-AI-by-Zapier)说迁入 AI by Zapier 后改按 Zap tasks 计量，不再管理单独 Agents 订阅；[新步骤价格说明](https://help.zapier.com/hc/en-us/articles/46425475442829-AI-by-Zapier-model-tier-pricing)给出 Standard 1x（无工具）、Advanced 3x、Premium 5x，每次成功工具调用追加同倍率 task，单步达 75 tasks 暂停待审，新步骤默认 Premium。AI by Zapier 工具步骤标为 Professional/Team/Enterprise，Free 不可用。两条路径同时仍见于官方资料；账户的迁移状态、独立版是否还可新购及实际报价为 `unknown`，不可发布单一“Agents 免费/付费”采购建议。 |
| 人审、权限和企业依赖 | [独立版共享指南](https://help.zapier.com/hc/en-us/articles/39268320740749-Give-other-Zapier-users-access-to-your-agent)把 Owner/Editor/Viewer、同一 Team/Enterprise 账户共享分开。[旧版审批指南](https://help.zapier.com/hc/en-us/articles/41776074420493-Add-approval-steps-to-your-agent-s-instructions)要求在指令中接消息应用请求审批，或在 Zap 中另加 Human in the Loop 步骤；不能说独立 Agents 的每次写操作默认人审。迁入后的 [AI by Zapier 工具设置](https://help.zapier.com/hc/en-us/articles/45863491098893-Add-tools-to-your-AI-by-Zapier-step)提供逐工具 `Require approval before running`，但默认关闭。[迁移指南](https://help.zapier.com/hc/en-us/articles/47402591569805-Migrating-from-Agents-to-AI-by-Zapier)还列管理员发布审批、模型/工具调用控制。[Enterprise 应用策略](https://help.zapier.com/hc/en-us/articles/8496307974541-App-access-policies-in-Zapier)描述可限应用/动作；与此同时独立 Agents [定价 FAQ](https://zapier.com/pricing)仍称不支持 Enterprise 既有应用/动作限制。该差异必须按 **独立版或迁入版、账户配置** 分开核，不能混成统一企业保证。 |
| 数据边界、可靠性与权利 | [应用连接说明](https://help.zapier.com/hc/en-us/articles/36818633398157-App-connections-on-Zapier)表明访问受连接账户所授权的数据与权限限制，连接的第三方服务另受其协议约束。[Zapier AI 数据说明](https://zapier.com/legal/automation-platform-information)称 Enterprise 客户内容默认不用于 Zapier 模型训练改进，其余客户可退出；AI 子处理商不得用客户内容训练，BYOK 时还应看自带供应商协议。不能把子处理商禁训泛化为 Zapier 对所有账户的默认禁训。[服务条款](https://zapier.com/legal/terms-of-service)将 AI Input/Output 计入 Customer Content 并保留客户对该内容的所有权，同时要求客户负责其合法性、第三方权利与触发动作；这不等于保证输出可注册版权或下游商业素材已清权。[独立 Agents FAQ](https://zapier.com/pricing)承认非确定性；迁入版虽可查 Zap 历史，未提供特定流程成功率或零误操作保证。Agents 专属商用权例外、逐计划保留期限、各连接器具体权限和失败率均为 `unknown`。 |

**Best for：**正在使用独立 Agents、能确认自身迁移状态与连接权限，并愿意小规模审核活动/任务消耗及写入结果的业务自动化团队。若已迁入，应按“AI by Zapier 中的 agentic 步骤”另定对象、套餐和比较基准。

**Not ideal：**要求按固定独立 Agents 价格长期采购、无管理员/连接授权、必须每次写操作默认人工批准、或将非确定性输出直接用于不可逆高风险操作的团队。迁入版的聊天触发 Agent [尚无直接对应触发器](https://help.zapier.com/hc/en-us/articles/47402591569805-Migrating-from-Agents-to-AI-by-Zapier)；迁移后若原 Agent 和新 Zap 同时运行还可能重复执行。

**Cluster 与映射建议。** 相对现有 n8n 的可自管工作流编排，独立 Agents 的候选差异是托管式、可按已授权动作与知识源执行任务的 Agent；迁入后与 Zaps 的差异收窄，必须重新确认是否足以拥有独立工具 canonical。业务 Agent 工作流仍是**未注册 Task**，不得借 `build-app-with-ai` 或 n8n 的既有 Fit 建关系。现有 12 个 Capability 无精确对应，`Capability=—`；不要把“9,000+ 应用”当 Agents Capability。Constraint 候选分别记录版本/迁移状态、账户与应用动作权限、人审开关默认值、activity 对 task 的分轨、共享池/单次上限、第三方协议与非确定性。Evidence 候选 claim 按产品身份、旧版动作、旧版额度、新版 task 算式、人审/企业控制、数据使用拆分，每条标明 **独立版/迁入版**、来源及核查日。

**进入下一门禁尚缺：**① 以真实新账户和既有账户确认独立 Agents 是否可新开、迁移后 canonical、计费/免费计划和企业限制，消除官方页面冲突；② 两条相互独立的 **Agents 产品级**市场信号，至少一条强采用，不借 Zapier 品牌或 Zaps 评论；原池 G2/Product Hunt 链接只是线索；③ 账户内动作、审批、数据设置与账单实核，以及素材、三语言内容、八项准入；④ 发布前再次查重并评估既有 `/ai/zapier` 意图，必要时改为更新/合并。当前仅保留候选，不进入发布 preflight。

## Ideogram：`HOLD_EVIDENCE`

**身份与近期维护信号。** Ideogram 是图像生成与编辑应用，不是 Canva 式完整品牌设计工作区。[2026-06-03 官方 4.0 技术发布](https://ideogram.ai/blog/ideogram-4.0/)及 [模型页](https://ideogram.ai/models/4.0)证明图像内文字、版面控制与 2K 输出是研发方向；“正确拼字”“生产级质量”属于厂商描述，不能替代本站质量测试。官方当前同时提供网页应用、[开发者 API](https://developer.ideogram.ai/ideogram-api/api-overview)及单独的[模型部署许可](https://ideogram.ai/licensing/)；自托管模型许可不能从网页订阅或 API 权益推导。

| 核查项 | 官方事实与真实边界 |
| --- | --- |
| 创作、编辑与批量 | [开发者概览](https://developer.ideogram.ai/ideogram-api/api-overview)列文字生成图像、Remix、局部 Edit、Reframe、背景处理等；[Canvas 指南](https://docs.ideogram.ai/canvas-and-editing/canvas/canvas-overview)提供生成窗口与 Magic Fill/Extend 等网页编辑路径，但其示例基于较早模型，不代表 4.0 各编辑工具同等可用。[批量指南](https://docs.ideogram.ai/using-ideogram/features-and-tools/batch-generation)列 CSV 批量、Pro/Team 权益与文件行数约束；不能把 API 批量交付、网页 Batch 与 4.0 每个端点视为同一能力。文字准确率、特定语言表现及逐图可编辑图层保证为 `unknown`。 |
| 当前套餐与免费额度 | [当前定价页](https://ideogram.ai/pricing/)展示 Free $0，**仅符合条件账户**每周获 slow credits，金额可能不同；不应沿用旧文档“免费 10 credits/周”。Plus 月付 $20 或年付折合 $15/月，1,000 priority credits/月；Pro 月付 $60 或年付折合 $42/月，3,500；Team 月付 $30/席或年付折合 $20/席/月，至少两席，每席 1,500；Enterprise 议价。图像消耗随模型/渲染设置不同，credits 不等于固定成品张数。订阅 priority credits 期末过期；[较新的计划文档](https://docs.ideogram.ai/plans-and-pricing/available-plans)称 top-up 可结转但购后一年过期。免费资格、实际到账量和 checkout 总价仍为 `unknown`。 |
| 隐私、公开与输出 | [定价 FAQ](https://ideogram.ai/pricing/)说生成默认公开；Plus/Pro 可私密生成和取消既有公开。[服务条款](https://ideogram.ai/legal/tos/)说明公开内容可被其他用户使用或 Remix；Private Content 有不同传播边界。条款不主张用户输入/输出所有权，也不限制输出用于商业目的，但不保证唯一性、可注册版权或不侵害第三方权利，用户须自行取得上传素材和商标/肖像许可。[隐私政策](https://ideogram.ai/legal/privacy/)允许为服务改进及模型训练使用所收集信息；“私密生成”不能推为默认不训练。 |
| 导出、水印与 API | [下载指南](https://docs.ideogram.ai/using-ideogram/getting-started/downloading-images)称格式/尺寸按账户、图片类型与透明度变化，下载菜单是当前单图事实源；定价页列 Pro `Quality export`，但未核得每档明确文件矩阵。[条款](https://ideogram.ai/legal/tos/)禁止移除输出中若存在的水印，**各套餐是否默认带可见水印为 `unknown`**。[API 设置](https://developer.ideogram.ai/ideogram-api/api-setup)说免费账户也可开 API dashboard，但有效请求需要付款方式和正余额；网页订阅不含 API credits，API 图像链接会过期。API 另有[开发者协议](https://ideogram.ai/legal/api-tos/)及费率/并发限制；协议要求应用标明 Ideogram 来源，API 输入/输出原则上不用于模型训练但违规标记例外，不能扩成网页应用的统一禁训。 |

**Best for：**需要从提示词快速探索含标题、标牌或包装文案的图像方向，能逐图核字、核授权并接受公开/私密与 credit 约束的创作者。需要 API 的团队应单独预算预付余额、版权审核、临时 URL 存储和开发者署名。

**Not ideal：**要求免费账户保证固定周额度或私密生成、要求一次生成即可交付无错文字/清权商标、要求稳定的可编辑品牌设计工作区，或误以为订阅 credits 可用于 API 的团队。

**Cluster 与映射建议。** 相对站内 Canva 的模板/品牌协作工作区，Ideogram 候选补位在**生成含文字图像**及局部图像编辑；这两个编辑 Cluster 尚未注册 Task，不能借 Canva 的分类或某个设计页面产生 Fit。现有 12 个 Capability 无精确对应，`Capability=—`。Constraint 候选按免费资格和变动额度、模型/渲染消耗、优先与慢速队列、私密/公开默认值、网页版与 API 分账、下载/水印、第三方权利及训练用途拆分。Evidence 候选 claim 按 4.0 生成、Canvas/批量的各自版本、套餐快照、条款第 2.1 节、公开/私密、API 开通/协议、下载规则记录来源和日期；文字质量要待独立或实测证据，不能使用社区图例下结论。

**进入下一门禁尚缺：**① 用当前账户/结账核实 Free 资格与实际周额度、编辑能否使用 slow credits（[定价 FAQ](https://ideogram.ai/pricing/)与[计划文档](https://docs.ideogram.ai/plans-and-pricing/available-plans)表述不同）、每档下载格式和可见水印；② 至少两条相互独立的产品级市场信号，其中至少一条强采用；原池 Product Hunt/G2 URL 未在本轮验证；③ 真实图像文字准确率、商用素材/版权与三语言编辑、八项准入；④ 发布日再查重和 URL 意图。当前只保留候选。

## N2 治理结论

Zapier Agents 的关键风险是**官方产品身份正在迁移且计费/企业控制存在版本分叉**，Ideogram 的关键风险是**免费额度资格、编辑权益、导出/水印和网页/API 数据边界需按账户核实**。两者都有官方维护信号和可研究的决策差异，但均未通过独立市场验证；因此 `HOLD_EVIDENCE`，不是 `READY_FOR_RELEASE_PREFLIGHT`，更不是公开发布或索引批准。建议 2026-10-05 或厂商消歧/独立信号到齐时复核；发布前仍必须重新执行身份、意图、来源、内容与只读生产门禁。
