# 四周：证据驱动 AI 工具目录优化计划

计划周期：2026-09-01 至 2026-09-28
状态：执行中
唯一上位计划：[主计划](./MASTER_OPTIMIZATION_TRACKER_CN.md)

## 北极星

把 AI Best Tool 从“工具列表”推进为“有证据、可复查的 AI 工具决策库”。品牌保留 `AI Best Tool`；“Best”只用于有明确方法和边界的任务页，不作为无依据的全站承诺。

## 四周工作流与状态

| ID | 周期 | 任务 | 验收标准 | 状态 | 负责人 |
| --- | --- | --- | --- | --- | --- |
| W1-01 | 第 1 周 | 收口唯一主 Decision Card | 任务、适合/不适合、限制、比较路径、首要核验建议只在一个主模块中表达 | 已完成 | Codex |
| W1-02 | 第 1 周 | 详情页证据完整度与复查字段 | 前台可读来源、最后核查、下次复查/待补状态 | 已完成 | Codex |
| W1-03 | 第 1 周 | 候选与发布准入台账 | 每日 1-2 条处理、缺失原因可追踪、未通过不公开 | 已完成 | Codex + 用户 |
| W1-04 | 第 1 周 | 自动回归 | build、详情页信号、生产 smoke 可重复执行 | 已完成 | Codex |
| W2-01 | 第 2 周 | 后台资料完整度 / 审核队列 | 管理员能知道可否公开、缺什么、何时复查 | 已完成 | Codex |
| W2-02 | 第 2 周 | 日常收录与候选池 | 成熟工具优先队列已建立；每日处理 1-2 条，未来 3 天候选已核验 | 进行中 | Codex + 用户 |
| W2-03 | 第 2 周 | Guide 联动 | Web3、Automation、Research 从任务入口进入相应 Decision Card | 已完成 | Codex |
| W3-01 | 第 3 周 | 变化监测与复查队列 | AI 发现变化，人工/owner 确认后更新事实 | 已完成 | Codex + 用户 |
| W3-02 | 第 3 周 | 真实信号闭环 | owner、纠错、评论能更新对应工具判断 | 已完成（W3-02A） | Codex + 用户 |
| W3-03 | 第 3 周 | 既有高曝光页增强 | 5 个已有曝光详情页补齐证据与限制 | 已完成（W3-03A） | Codex |
| W4-01 | 第 4 周 | GSC 与索引复盘 | 比较非首页展示、CTR、索引质量及新页独立意图 | 需要数据 | 共同 |
| W4-02 | 第 4 周 | 淘汰与扩大决策 | 无意图页合并/noindex；符合触发条件才扩大收录 | 待执行 | Codex |
| W4-03 | 第 4 周 | 定位验证 | 首页/核心页信息表达与用户行为数据支持“证据驱动决策” | 待执行 | Codex + 用户 |

## 详细实施排期

### 第 1 周：统一详情页与质量门槛（09-01 至 09-07，预计 4-5 个开发日）

| 子任务 | 实施细节 | 主要范围 | 预计时间 | 依赖 | 自动验收 | 状态 |
| --- | --- | --- | ---: | --- | --- | --- |
| W1-01A | 移除首屏重复摘要，确定唯一 Decision Card 标题和说明 | `ai/[websiteName]/page.tsx` | 0.5 天 | 无 | build | 已完成，提交 `65a46ab8` |
| W1-01B | 收口正文“快速决策”和侧栏重复字段；保留一个主卡 + 一个纯信任摘要 | 详情页 JSX | 1 天 | W1-01A | build + 页面结构断言 | 已完成，提交 `48257121`；2026-08-31 build/断言通过 |
| W1-01C | 提取统一 Decision Card 数据结构，避免页面区块各自推断 | 详情 presenter / helper | 1 天 | W1-01B | 单元脚本 + build | 已完成，提交 `930c9bcc`；模型单测/tsc/build 通过 |
| W1-02A | 定义证据完整度：来源、核查日、限制、素材、适合/不适合、比较路径 | service / admin types | 0.5 天 | W1-01C | 类型检查 | 已完成，提交 `703cef22`；模型单测/tsc 通过 |
| W1-02B | 前台展示最后核查、下次事实复查、下次判断复核及待补项 | 详情页 | 1 天 | W1-02A | 页面结构断言 | 已完成，提交 `d549b577`；模型测试/结构断言/build 通过 |
| W1-03A | 建立候选/准入台账，记录处理结果和缺失原因 | admin action / page | 1 天 | W1-02A | 回归脚本 | 已完成，提交 `b3e0bc39`；准入测试/tsc/build 通过 |
| W1-04A | 新增本地详情页 Decision Card 自动测试 | `scripts/`、`package.json` | 0.5 天 | W1-01C | 脚本自身通过 | 已完成，提交 `6099adbf`；结构/模型/准入测试及 tsc 通过 |
| W1-04B | 部署后生产 smoke 与严格信号审计 | 生产页面 / 审计文档 | 0.5 天 | W1-04A | smoke + strict audit | 已完成：生产严格审计 33/33，指定机会页官方事实块 16/16 |

### 第 2 周：后台工作流与日常收录（09-08 至 09-14，预计 5 个开发日）

| 子任务 | 实施细节 | 预计时间 | 依赖 | 验收 | 状态 |
| --- | --- | ---: | --- | --- | --- |
| W2-01A | 后台列表增加完整度、准入状态、下次复查、缺失项筛选 | 1.5 天 | W1-02 | 管理员一屏识别能否发布 | 已完成，提交 `9f780aa0`；tsc/build 通过 |
| W2-01B | 编辑页增加证据来源、限制和 Decision Card 字段校验 | 1.5 天 | W2-01A | 缺字段无法误标可发布 | 已完成，提交 `4e3df958`；部署 `b48753cd`、production smoke 通过 |
| W2-01C | 市场验证编辑器与前台成熟度状态 | 1 天 | W2-01B | 五维评分、独立证据和信号可编辑；收集型工具未验证不能发布；详情页展示验证依据 | 已完成；专项准入测试、tsc 与完整 build 通过 |
| W2-02A | 生成未来 3 天候选池，每日处理 1-2 条 | 每日 1 小时 | W2-01 | 每条有发布/待补结论 | 已完成，提交 `d7ea18b5`；6 条生产候选按 3 天每天 2 条排期 |
| W2-02B | 首批 7-14 条处理台账；只发布通过资料与市场双重准入的条目 | 每日 1 小时 | W2-02A | 无低质量例外放行 | 进行中，已处理 9/7-14；Perplexity 通过市场与资料准入并迁移既有 fallback，Owlish 保持 draft，ArcRift 不因数量目标放行 |
| W2-02D | 下一公开时段成熟工具预审；证据齐全但不提前发布 | 0.5 天 | W2-02B | 证据、边界和发布闸门自动校验；不改生产数据或 sitemap | 已完成 n8n 预审；状态 `ready_for_next_slot`，最早 2026-09-02 复核后迁移 |
| W2-03A | Web3、Automation、Research Guide 统一任务入口 | 1 天 | W1-01C | 指向对应工具 Decision Card | 已完成，提交 `de1504e6`；专项结构测试、Decision Card 回归、tsc、完整 build 通过 |

### 第 3 周：变化监测与真实信号（09-15 至 09-21，预计 4-5 个开发日）

| 子任务 | 实施细节 | 预计时间 | 依赖 | 验收 | 状态 |
| --- | --- | ---: | --- | --- | --- |
| W3-01A | AI 检测官网、定价、文档变化，只创建待审差异 | 1.5 天 | W1-02 | 不自动覆盖已核验事实 | 已完成；提交 `fdf1c1f6`，专项测试、tsc、完整 build 通过；生产迁移已验收 |
| W3-01B | 30 天事实复查与 90 天判断复核队列 | 1 天 | W3-01A | 到期状态可筛选 | 已完成；提交 `7f743fc4`，专项测试、tsc、完整 build 通过 |
| W3-02A | owner 更新、纠错、评论映射到具体工具证据与判断 | 1 天 | W2-01B | 变更可追溯，不自动发布 | 已完成：signal 与 claim-source 迁移已执行；owner/纠错、评论来源均可用；两轮真实幂等同步结果一致（当前 0 条符合映射条件的信号） |
| W3-03A | 增强 5 个已有曝光详情页 | 1-1.5 天 | W1-02 | 每页 2 个官方来源 + 1 个限制 | 已完成：Fathom、Anthropic、DeepL、Gamma、Lindy 已加入官方证据快照；专项测试、严格来源审计、tsc、完整 build 通过 |

### 第 4 周：数据验证与收口（09-22 至 09-28，预计 3-4 个开发日 + 数据观察）

| 子任务 | 实施细节 | 预计时间 | 依赖 | 验收 | 状态 |
| --- | --- | ---: | --- | --- | --- |
| W4-00A | 建立三期 GSC 页面趋势与扩张/收口决策报告 | 0.5 天 | 无 | 规则测试通过；不自动改变索引状态 | 已完成；等待同期数据运行 |
| W4-01A | 导入同期 7 天/28 天 GSC 与 Coverage | 0.5 天 | 用户数据 | 台账口径一致 | 需要数据 |
| W4-01B | 比较首页/非首页展示、CTR、页面数和新页 query | 0.5 天 | W4-01A | 给出保留/增强/收口清单 | 待执行 |
| W4-02A | 连续两轮无独立意图页面合并或 noindex | 1 天 | W4-01B | sitemap/canonical 无回退 | 待执行 |
| W4-03A | 验证首页“证据驱动决策”表达与行为路径 | 1 天 | W4-01B | 定位有数据支持或明确否决 | 待执行 |
| W4-03B | 四周总结、下一周期任务和归档 | 0.5 天 | 全部 | 主/子文档状态一致 | 待执行 |

## 日常运行节奏

- 并行原则：W2-02 日常收录作为运营节奏持续执行，不阻塞 W2-03 及后续平台代码优化；同一时间仍只允许一个代码实现子任务处于进行中。
- 每日上午：发现 6-10 个候选或变化信号，进入待审池。
- 每日下午：处理 3-5 个候选，常态公开 2-3 个、单周最多 15 个；通过资料与市场双重准入才公开。
- 公开额度按 `70% 成熟高需求工具 / 20% 快速增长且证据充分 / 10% 差异化早期项目` 分配；“成熟”需由搜索意图、用户/评论量、开源采用或稳定客户证据支持，不能只看品牌知名度。
- 对已经收录的成熟工具优先升级原工具页的价格、限制、真实评价和替代决策，不创建重复页面；新页面只有在站内不存在且能补充明确搜索/决策缺口时才进入发布流程。
- 首批成熟工具缺口队列只升级、迁移或合并已有 canonical URL，不新增页面；机器可校验数据见 `data/collection/mature-tool-gap-priority-2026-09-01.json`。
- 每日结束：更新候选结果、缺失原因、来源和下次复查日期。
- 每周末：执行 build、详情页信号测试、生产 smoke，并核对主/子计划状态。

## W2-02A 候选池执行记录（2026-08-31）

| 计划日 | 候选 | 当前结论 | 公开状态 | 主要待补 |
| --- | --- | --- | --- | --- |
| 2026-09-01 | Contextberg、Re_gent | `ready_for_draft` | 已创建 draft，未公开 | 工具级最终编辑复核与发布审批 |
| 2026-09-02 | Invenio、Thinnest AI | `ready_for_draft` | 已创建 draft，未公开 | 工具级最终编辑复核与发布审批 |
| 2026-09-03 | Motion、PollyReach | `ready_for_draft` | 已创建 draft，未公开 | 工具级最终编辑复核与发布审批 |

- 来源：现有生产 `collection_candidates`，没有为完成数量目标盲目增加 URL。
- 核验：每条有 2-3 个官方或 maker 证据入口、明确排期、结论和 3 个待补项。
- 防重复：执行前按官方域名与 `tools` 表比对；本批 6 条未发现已收录域名冲突。
- 自动验收：`pnpm run test:collection-planning`、`pnpm run test:collection-admission`、`tsc --noEmit`、`pnpm run build` 全部通过。
- 下一步：W2-02B 按计划日逐条补限制、素材、比较路径和事实确认；只有准入结果为 `publishReady` 才允许公开。

### W2-02B 第一批处理记录（2026-08-31）

- Contextberg：已核验官方首页、Pricing 和 Download；记录 `$0 Free / $8 Lite / Pro coming soon`、180 天免费版留存、模型路由的数据边界、平台与使用限制；草稿 `0afff0d2-3d47-42ea-bf05-748bd8f6e1d8`。
- Re_gent：已核验官方站与 GitHub；记录 Public Alpha、当前支持 Claude Code/Codex/OpenCode、其他 agent 为计划项、Apache-2.0 免费许可及“不替代 Git”边界；草稿 `f34ca62d-d1aa-46df-8e22-366618c1125f`。
- 两条候选级准入均为 `coreGaps=0 / decisionGaps=0`；工具状态仍为 `draft`，工具级发布 SQL 会继续要求最终编辑复核，未进入 sitemap。
- 本批自动验收：collection planning 测试、TypeScript、完整 `pnpm run build` 通过。

### W2-02B 第二批处理记录（2026-08-31）

- Invenio：已核验 Apple Silicon 限制、完全本地处理、Free/Pro/Lifetime 定价和付费语音转录边界；草稿 `b5207528-b91f-439f-ae3a-b3af239ef02a`。
- Thinnest AI：已核验 BYOK、印度语言/电话工作流、provider pass-through、GST 与企业部署；明确记录 Pricing 页 `₹2/min` 与首页/About `₹1.5/min` 的官方口径冲突；草稿 `99548aee-f320-48ee-a8fc-7d901f65ff56`。
- 修复幂等重复检测：候选重跑时，已关联到同一草稿的官方域名不再被误判为既有重复工具。
- 两条候选级准入均为 `coreGaps=0 / decisionGaps=0`，生产回读确认工具状态仍为 `draft`；完整 build 通过。

### W2-02B 第三批处理记录（2026-09-01）

- Motion（`motion.so`）：已核验官方产品页、发布说明和 Credits 文档；记录可编辑场景、Web/API/MCP 入口、`$5/200 credits` 及长视频/高级模型/配音/后续编辑的浮动消耗；草稿 `fdc58c1d-2cba-4792-9171-c147ba40d8cc`。
- 修复草稿导入优先级：人工核验的分类、标签、用途和价格优先于通用关键词推断；重复运行只刷新仍为 `draft` 的条目，不覆盖已发布工具。
- 生产回读确认 Motion 为 `design-art / paid`，用途为 launch video、product explainer 和可编辑 motion scene，状态仍为 `draft`；PollyReach 未达到准入门槛，保持 `new` 且未创建工具页。
- 本批自动验收：collection planning、collection admission、TypeScript 和完整 `pnpm run build` 全部通过。

### W2-02B 第四批处理记录（2026-09-01）

- PollyReach：已核验官方首页、Pricing 与 Terms；记录 `50+` 国家宣传、Star/Pro/Max 的 credits 与国家数限制、免费额度周/月口径冲突、credits 不保证固定工作量，以及 consent、AI disclosure、DNC、当地拨打时段和记录保存责任；草稿 `8d9934d7-d6de-42da-b60a-71330e3f7e3c`。
- 补齐虚拟发现分类与实体存储分类映射：`voice → chatbot`、`developer-tools → productivity`；保留 `suggestedCategorySlug` 和标签用于 Voice/Developer 发现入口，修复 PollyReach、Thinnest AI、Re_gent 的空分类。
- 本批 6 条候选均显式记录 `free / freemium / paid`，避免默认价格误判；生产幂等回读确认全部仍为 `draft`，没有自动发布。

### W2-02B 第五批处理记录（2026-09-01）

- Emdash：已核验官方首页、Providers 文档和 Apache-2.0 仓库；记录并行 agent、Git worktree 隔离、本地/SSH 项目、issue/PR/CI 工作流，以及 provider 账号、数据边界和能力差异；草稿 `6f62a262-3cb3-4201-9127-b1c4eda6438f`。
- 新增第二个三日候选池 `data/collection/candidate-pool-2026-09-04.json`：Emdash 首轮通过准入；Owlish 与 ArcRift 首轮保留为待补证据，后续核验结果分别记录在第六批及下一处理批次。
- 修复候选导入器遗漏规范 `tools.use_cases` 的问题；幂等回填首批 7 条草稿，每条生产回读均为 3 项用途，分类、价格和 `draft` 状态不变。
- 当批候选级结果：Emdash `coreGaps=0 / decisionGaps=0`；Owlish 与 ArcRift 当时均未达到草稿准入门槛。W2-02B 达到最低验收数量 7 条，后续继续向 14 条上限推进。

### W2-02B 第六批处理记录（2026-09-01）

- Owlish：核验官方产品、Pricing、Knowledge Base 和 Developer 文档，记录四档价格、会话/知识库/席位/渠道/留存限制、Growth 起开放的人机交接与 API，以及无独立 sandbox 和 API 未覆盖的管理动作。
- 修复候选准入证据未映射到工具级发布字段的问题；8 条新草稿均通过工具级发布门槛，旧 Voker/Runtime 仍被正确拦截。
- Owlish 工具 `7a9339c6-36d2-491b-8307-cdc7589a650d` 曾按旧资料完整度闸门发布；2026-09-01 复盘确认其缺少独立评价、持续性与采用证据，退回 draft。其余 7 条不得沿用 `Ready to publish` 结论，需先完成市场验证。
- 市场验证编辑器部署后完成首条真实记录：Owlish `51/100`、结论 `Emerging`；工具和候选数据均已回读确认，Product Hunt 与 PeerPush 作为独立来源，但没有强市场信号，因此保持 draft。
- 完成 Emdash 真实市场核验：`87/100`、结论 `Validated`；GitHub `5,564 stars / 573 forks / 154 releases` 与核验当天仍有正式发布构成强信号，Product Hunt、Reddit 实测反馈和跨平台下载构成辅助信号。已同步候选和工具级记录并允许公开发布，同时保留资源占用、安装兼容性、provider 账号与单 agent 场景不适配等限制。
- 完成 Motion（`motion.so`）真实市场核验：`68/100`、结论 `Emerging`；独立完成生成的测试验证了速度和元素级编辑，也记录了高 credits 消耗与精细控制限制。Product Hunt 有发布热度但仍无正式 review，近期两次实测均在未付费时止于渲染前；Mosaic 的 YC W25 active 状态只能支持持续性，不能替代 Motion 自身的采用证据，因此保持 draft。
- 完成 Re_gent 真实市场核验：`72/100`、结论 `Emerging`；Show HN `129 points / 67 comments` 构成强讨论信号，GitHub `787 stars / 57 forks / 7 contributors / 5 releases` 和 Product Hunt `189 points / 298 followers` 构成辅助信号。但项目仅约四个月、最后代码推送为 2026-07-02、release 下载仍为数百且官网仍标记 Public Alpha，缺少重复使用与生产采用证据，因此保持 draft。
- 纠正执行口径：每日收录目标按“公开可见”计数，候选处理和 draft 不再计入日更完成量。

### W2-02B 第七批处理记录（2026-09-01）

- Perplexity：选择成熟高需求产品替代证据不足的 ArcRift 硬放行；保留既有 `/ai/perplexity` fallback 路径并迁移为唯一生产数据库实体，新增 sitemap 中英文 URL 但不创造重复 canonical。
- 资料核验覆盖 Search、Pro Search、Research、套餐与额度、模型访问、消费者训练退出、Enterprise 数据保护、文件留存和来源标签边界；明确“有引用不等于单项结论准确”，高风险判断仍需打开原文。
- 市场验证为 `96/100 / Validated`：G2 `276 reviews / 4.5`、Capterra `35 reviews / 4.2` 和多年付费使用构成强独立信号；评价中的额度、答案深度和不准确数据问题保留为选择限制。
- ArcRift 保持 `needs_evidence`，不创建工具页；这轮证明日常收录可以由成熟工具的既有 URL 迁移承接，而不依赖批量新增陌生早期产品。

### W2-02D 下一公开时段预审（2026-09-01）

- n8n：完成官网、Pricing、官方文档、许可证、Community/Business/Enterprise 版本、queue mode、GitHub、G2、Capterra 与融资信号预审，市场验证结论为 `98/100 / Validated`。
- 差异化判断：它适合需要可视化工作流、代码控制、广泛集成、AI 节点及 Cloud/自托管选择的技术团队；页面不能把“源代码可见”误写为 OSI 开源，也不能把“可自托管”描述成低运维成本。
- 决策边界：明确 workflow execution 计费、模型 provider 费用、Community 版协作/治理缺口、Sustainable Use License 商业限制，以及 Redis、数据库、worker、密钥、备份和监控责任。
- 发布控制：本轮只新增 `data/collection/n8n-preaudit-2026-09-01.json`，状态为 `ready_for_next_slot`；`productionWriteApproved=false`、`sitemapChangeApproved=false`，不会提前写入生产工具表或扩大 sitemap。
- 下一时段迁移前必须重新核对实时 Pricing，尤其是不稳定的 AI credits 和套餐权益；随后复用现有 `/ai/n8n` canonical，禁止创建重复 URL。
- 自动验收：`pnpm run test:next-tool-preaudit` 负责验证官方/独立来源数量、许可证边界、计费单位、限制深度及生产发布闸门。

### W2-02C 首批成熟工具内容缺口（2026-09-01）

- 已将 8 月 31 日 GSC 查询、页面和 Coverage 与生产 `tools` 表、fallback 页及历史网络数据交叉匹配，形成 10 项队列：Claude/Anthropic、Fathom、Gamma、Consensus、DeepL、Runway、Luma AI、Pipedream、Cursor、The Graph。
- 队列中 `0` 个新增 URL：2 项需要合并或明确实体，6 项需要把 fallback 页迁移为数据库可维护记录，2 项需要把历史网络页迁移并解决未收录问题。
- P0 顺序为 Claude/Anthropic、Fathom、Gamma、Consensus；P1 顺序为 DeepL、Runway、Luma AI、Pipedream、Cursor、The Graph。排序综合 GSC 需求、索引机会、市场成熟度和独立决策内容空间。
- `Fathom` 是当前最强非首页工具页信号（两个 locale 路径合计 65 次展示）；`Gamma` 已接近第一页（12 次展示，平均排名 10.83）；`Consensus` 与 `Luma AI` 返回 200 但仍在“已抓取未编入索引”清单。
- 自动门槛：`pnpm run test:mature-tool-priority` 必须保证恰好 10 项、slug 不重复、每项有 GSC 信号和决策角度，并禁止队列悄然变成新增 URL 扩张。
- Rank 1 Claude/Anthropic 已完成：保留原数据库 ID，将产品 slug、标题、正文、用途和官网更新为 Claude；`/ai/anthropic` 及本地化旧路径返回真实 308，sitemap 只保留 Claude；本地生产模式已验证标题、canonical、双语内容和跳转。
- Rank 2 Fathom 已完成：建立唯一的生产数据库实体，补齐双语决策内容、官方素材、兼容性、录制同意、免费额度边界及 G2/Capterra 独立市场证据；显式英文重复路径 `/en/ai/fathom` 统一 308 到 canonical `/ai/fathom`。
- Rank 3 Gamma 已完成：在不增加 URL 的前提下迁移为生产数据库实体，补齐双语决策内容、当前官方品牌素材、演示/文档/网站能力、按用户计费、credits、导入导出、数据训练设置，以及 Product Hunt、G2、Capterra、TechCrunch 市场证据。
- Rank 4 Consensus 已完成：保留 `/ai/consensus`，将通用历史网络页替换为生产数据库实体，补齐双语学术搜索决策内容、论文覆盖、套餐、全文访问和系统综述边界；证据严格限定为 `consensus.app`，排除了同名销售演示产品的 G2 数据污染。
- Rank 5 DeepL 已完成：保留 `/ai/deepl` 和既有生产记录，重构双语标题与正文，明确 Translator、Write、API 的订阅隔离、字符与文档额度、数据安全和团队管理边界，并补齐官方媒体与正确归属的 G2/融资成熟度证据。
- Rank 6 Runway 已完成：保留 `/ai/runway` 并将 fallback 迁移为生产数据库实体，补齐生成与编辑分工、Free/Standard/Pro/Max credits、旧 Unlimited 迁移、工作区共享额度、API 隔离、商业权利和外部后期边界。
- Rank 7 Luma AI 已完成：保留 `/ai/luma-ai`，将不可用的 legacy-network 页面替换为生产数据库实体，并明确页面只评估 Dream Machine；补齐 Web 套餐、模型 credits、水印与商用授权、API 隔离及“公司信号强但独立产品评价薄”的证据边界。
- Rank 8 Pipedream 已完成：保留 `/ai/pipedream` 并将 fallback 迁移为生产数据库实体；区分 Workflows 与 Connect，按当前官方口径记录 compute/memory credits、Connect 外部用户计费、并发和队列适用范围、数据保留、Workday 收购与有限独立评价样本。
- Rank 9 Cursor 已完成：保留 `/ai/cursor` 并将 fallback 迁移为生产数据库实体；补齐当前套餐和 Agent 用量、Privacy Mode 的后端路由及留存例外、人工审查与编辑器迁移边界，并将 SpaceX 收购和 OpenAI 拟于 11 月 12 日停止直供模型记录为待复核的连续性风险。
- Rank 10 The Graph 已完成：保留 `/ai/the-graph` 并将 fallback 迁移为唯一生产数据库实体；区分 Subgraphs、Substreams、Graph Node 与 Gateway，补齐 100,000 次免费月查询和超额价格、API key 控制、查询与索引独立、网络支持、自托管和部署级新鲜度边界。
- 当前进度：`10/10`，首批成熟工具内容缺口队列已全部完成，且没有新增 canonical URL。下一阶段进入 W4 数据验证：等待同期 GSC / Coverage 数据，判断这些既有 URL 应继续增强、保持观察还是收口，不自动扩大页面数量。

## 状态更新协议

1. 开始编码前将当前子任务设为“进行中”，同一时间只允许一个实现子任务进行中。
2. 完成代码后执行该项自动验收；失败保持“进行中”，记录失败原因。
3. 验收通过后记录提交 SHA、测试命令和日期，再设为“已完成”。
4. 同步更新本文件、周计划和主计划对应 item；三处状态不一致视为任务未完成。
5. 外部数据或用户确认缺失时标记“需要数据/受阻”，继续不依赖该条件的下一项。

## Review 结论

- 范围可控：前两周先完成数据模型和后台门槛，再提高日常收录量，避免先扩页后补质量。
- 时间可行：AI 承担候选、提取和差异草稿；每天 1-2 条最终核验仍保留质量检查。
- SEO 风险可控：新增 URL 不是硬性数量目标，未达标条目保持 draft / `noindex`。
- 技术风险可控：数据库变更必须先提供 migration 和兼容读取；页面改动先 build 后部署。
- 数据依赖明确：第 4 周 GSC 需要用户导出；此前任务均可独立推进。

## 风险审查

- 不做品牌或域名重命名：先在首页与页面文案验证定位，避免无数据重构品牌资产。
- 不自动公开 AI 生成内容：AI 只能生成候选和待审材料。
- 不以发布量取代质量：每日目标是处理 1-2 条流程；公开必须通过准入。
- 不扩大 URL 总量：优先补既有 canonical 页，新增页必须有独立任务意图。
- 每个代码任务先本地 build，随后运行对应自动测试；测试通过后才更新状态。

## 自动验收顺序

1. `pnpm run build`
2. 本地 Decision Card 结构测试（W1-04A 新增）
3. `pnpm run seo:priority-page-signals -- --strict`
4. 部署后 `pnpm run seo:production-smoke`
5. 在计划表中记录实际结果、提交和复查日期。
