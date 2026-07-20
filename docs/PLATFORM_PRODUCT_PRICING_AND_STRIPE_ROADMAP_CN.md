# AI Best Tool 平台产品、定价与 Stripe 实施总方案

更新时间：2026-07-20

状态：活跃执行文档。后续产品定义、价格、Stripe 对接、权限和验收均以本文件为准。

## 一、最终产品定义

AI Best Tool 不是单一目录站，而是由三层产品组成：

1. **Discover：免费发现平台**
   - 面向寻找和比较 AI 工具的访客。
   - 提供目录、分类、榜单、详情、指南、评论、收藏和比较。
   - 主要通过广告、联盟和 Owner 付费服务变现。
2. **List & Launch：入驻与发布期曝光服务**
   - 面向新工具、已收录工具 Owner 和时间敏感的发布活动。
   - 按次出售优先审核和固定 Featured 窗口。
   - 不保证审核通过、流量、排名或永久曝光。
3. **Distribution Workspace：持续分发运营工作台**
   - 面向独立开发者、增长团队和 Agency。
   - 按月或按年订阅。
   - 管理“渠道选择 → 准备 → 人工提交 → 结果 → 归因 → 复盘”的完整链路。

三层产品的收费逻辑必须保持独立：

- 免费发现平台不向普通访客收费。
- 入驻与 Featured 是一次性交易。
- 分发工作台是持续订阅。
- 购买 Featured 不自动获得分发订阅。
- 购买分发订阅不保证审核通过或 Featured 展示。

## 二、平台为用户解决的问题

### 普通访客

- 找到适合任务的工具。
- 看清价格、限制、更新时间和用户反馈。
- 比较候选工具并做决策。

### 工具 Owner

- 免费提交或认领工具。
- 在发布期获得更快审核和固定曝光窗口。
- 持续管理外部渠道、任务、上线链接和后续跟进。

### Growth / Agency

- 管理多个产品或客户项目。
- 看清哪些渠道已经执行、哪些失败、哪些需要复查。
- 追踪访问、注册、提交、认领、checkout 和付款。
- 形成客户周报和渠道 ROI 复盘。

## 三、正式价格架构

### A. Discover

| 产品 | 价格 | 说明 |
| --- | ---: | --- |
| 浏览、搜索、比较、评论、收藏 | $0 | 面向普通访客，保持免费 |

### B. List & Launch

现阶段保持已有价格，不在流量和真实付费尚未稳定前提价。

| 产品 | 价格 | 类型 | 交付边界 |
| --- | ---: | --- | --- |
| Free Listing | $0 | 免费 | 标准审核队列，无 Featured |
| Priority Review | $9 | 一次性 | 更短审核窗口，不保证通过 |
| Featured 3 Days | +$9 | 一次性附加项 | 3 天固定窗口；含 Priority Review 时总计 $18 |
| Featured 7 Days | +$19 | 一次性附加项 | 7 天固定窗口；含 Priority Review 时总计 $28 |
| Featured 14 Days | +$29 | 一次性附加项 | 14 天固定窗口；含 Priority Review 时总计 $38 |
| Launch Bundle | $39 | 一次性 | Priority Review + 14 天 Featured |

### C. Distribution Workspace

#### Pilot

价格：`$0`

目标：让用户完成一次真实闭环，而不是停留在功能演示。

建议权益：

- 1 个用户。
- 1 个项目。
- 8 类基础渠道。
- 最多 10 个开放任务。
- 每月最多 3 条追踪链接。
- 30 天归因历史。
- 基础渠道模板。
- 不提供周报导出、团队和白标能力。

#### Pro

当前价格：`$19/月` 或 `$190/年`。

建议权益：

- 1 个用户。
- 最多 5 个项目。
- 无限任务，追踪链接采用合理使用限制。
- 12 个月归因历史。
- 渠道模板和复查提醒。
- 访问、注册、提交、认领、checkout、付款归因。
- 周报和 CSV 导出。
- 邮件支持。

价格策略：

- 当前价格按 Stripe Price 目录执行。
- 年付价格为 `$190/年`，由 Stripe 以 yearly recurring Price 扣款。

#### Founding Agency

当前价格：`$49/月` 或 `$490/年`，仍建议仅邀请制。

测试期建议限制：

- 最多 10 个项目。
- 多客户任务管理。
- 项目级归因。
- 基础客户报告。
- 暂不公开承诺团队席位、白标和完整权限隔离。

#### 正式 Agency

当前 Stripe 目录价格为 `$49/月` 或 `$490/年`。

只有以下能力完成后才正式发布：

- 最多 25 个项目。
- 至少 5 个团队成员。
- 客户只读报告。
- 自定义渠道模板。
- 白标周报。
- CSV/PDF 导出。
- 客户和成员权限隔离。
- 优先支持。

## 四、后续组合产品

### Launch Operating Pack

建议价格：`$59 一次性`，暂不实施，待 Pro 验证后再开发。

建议包含：

- Priority Review。
- 14 天 Featured。
- 30 天非自动续费 Pro 权益。
- 一套启动分发任务。
- UTM 归因。
- 30 天项目复盘。

约束：

- 必须明确为非自动续费。
- 不得将一次性购买默认转换成订阅。
- 需要独立实现 30 天到期权益，不能直接复用 recurring subscription。

## 五、用户升级路径

### 新工具 Owner

`免费提交 → Priority Review / Launch Bundle → Pilot → Pro`

### 多产品创始人

`Pilot → 创建第 2 个项目触发 Pro → 项目继续增加后进入 Agency`

### Agency

`申请 Founding Agency → 导入 3-5 个真实客户 → 验证报告和协作 → 正式 Agency`

## 六、价格页信息架构

统一价格页首屏不直接堆套餐，而是先问：**你今天想完成什么？**

### 路径 1：Get Listed

- Free Listing。
- Priority Review。

### 路径 2：Promote a Launch

- Featured 3 / 7 / 14 Days。
- Launch Bundle。

### 路径 3：Run Distribution

- Pilot。
- Pro。
- Agency。

价格页必须明确：

- 分发订阅不包含审核通过或 Featured。
- Featured 不包含持续分发工作台。
- 付费审核不保证审核通过。
- Featured 不保证点击或排名。
- Pilot 不需要信用卡。

## 七、Stripe 产品和 Price 设计

### 一次性 Stripe Products

- `AI Best Tool - Priority Review`
- `AI Best Tool - Featured 3 Days`
- `AI Best Tool - Featured 7 Days`
- `AI Best Tool - Featured 14 Days`
- `AI Best Tool - Launch Bundle`

这些产品继续使用 `mode=payment`。

当前代码已经支持一次性 checkout，但金额来自
`lib/config/listing.ts` 的 `listingConfig`，并通过 `price_data` 在创建 Checkout
Session 时动态生成 Stripe Price。这条路径可以继续工作，但还没有形成可审计的
Stripe Product/Price 目录，也没有固定 Price ID 映射。

因此，一次性模块必须和 Distribution 一起完成以下配置：

1. 以 `listingConfig` 作为产品名称、金额和权益的唯一业务配置源。
2. 在 Stripe Test Mode 创建上述 5 个 Product，其中 Free Listing 不创建 Stripe Price。
3. 为 5 个付费权益建立固定 Price ID 映射，服务端只允许使用白名单 Price ID。
4. 在迁移期间保留动态 `price_data` 作为回滚方案；Test Mode 全链路通过后再切换生产。
5. 统一 metadata：`tool_id`、`featured_days`、`fast_track`、产品键和金额。
6. 对一次性 webhook 做事件幂等、金额校验、权益激活和重复投递测试。

建议环境变量：

```text
STRIPE_LISTING_PRICE_ID_PRIORITY_REVIEW
STRIPE_LISTING_PRICE_ID_FEATURED_3D
STRIPE_LISTING_PRICE_ID_FEATURED_7D
STRIPE_LISTING_PRICE_ID_FEATURED_14D
STRIPE_LISTING_PRICE_ID_LAUNCH_BUNDLE
```

这 5 个变量必须分别配置 Test 和 Live 值，不能把 Distribution 的订阅 Price ID
混用于一次性 checkout。未完成 Test Mode 验收前，不切换线上一次性支付。

### 订阅 Stripe Products

- `AI Best Tool Distribution Pro`
- `AI Best Tool Distribution Agency`

每个订阅产品创建 Monthly 和 Yearly Price，使用 `mode=subscription`。

Pilot 不进入 Stripe。

### 建议环境变量

```text
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_DISTRIBUTION_WEBHOOK_SECRET
STRIPE_DISTRIBUTION_PRICE_ID_PRO_MONTHLY
STRIPE_DISTRIBUTION_PRICE_ID_PRO_YEARLY
STRIPE_DISTRIBUTION_PRICE_ID_AGENCY_MONTHLY
STRIPE_DISTRIBUTION_PRICE_ID_AGENCY_YEARLY
```

测试环境和生产环境使用同样的变量名，但分别配置 Test / Live 值。

## 八、订阅生命周期规则

- Pilot 永久免费，不需要 Stripe。
- Pro / Agency 随时可以取消。
- 取消后使用到当前账期结束。
- 账期结束后降级为 Pilot，而不是删除数据。
- 超出 Pilot 限额的项目和历史进入只读状态。
- 升级立即生效。
- 降级下一个账期生效。
- 月付切年付通过 Stripe Customer Portal 完成。
- 不默认提供按比例退款；重复扣款和系统故障单独处理。
- 付款失败进入宽限期，宽限期结束后降级。

## 九、AI 的产品边界

当前核心价值来自任务、渠道、结果、归因和复查，不按 AI Token 收费。

AI 可以参与：

- 根据产品生成分发计划。
- 为不同渠道生成差异化草稿。
- 归纳拒绝原因。
- 推荐下一步动作。
- 总结周报和项目风险。

AI 不执行：

- 自动批量发帖。
- 自动刷评论或评价。
- 虚构产品、访问和用户反馈。
- 无披露的社区推广。
- 保证 Google 排名或 backlink 数量。

在正式接入持续运行的模型 API 前，不把“AI 自动分发”写入付费承诺，也不设计 AI 积分包。

## 十、当前实现状态

### 已完成

- 免费提交、Priority Review、Featured 和 Launch Bundle 产品定义。
- Stripe 一次性 checkout 基础流程。
- Distribution workspace、项目、渠道、任务和结果。
- Pilot / Pro / Agency 权益数据模型。
- Pro / Agency 项目数量限制骨架。
- UTM 链接和渠道模板。
- 访问、注册、提交、认领、checkout 和付款归因。
- 管理员分发总览。
- Distribution subscription checkout 和 webhook 骨架。
- Supabase 真实迁移。

### 未完成或未验收

- 一次性入驻 Stripe Product/固定 Price ID 目录和服务端白名单映射。
- 一次性 checkout 的产品键、金额和权益一致性测试。
- 一次性 webhook 的事件幂等和重复投递验收。
- Pilot 自动开通和功能限额。
- 分发定价统一配置，页面仍有硬编码价格。
- Pro / Agency 月付和年付 Price 支持。
- 独立 Distribution Webhook secret。
- Stripe event / checkout session 幂等处理。
- 取消后保留至账期结束和自动降级。
- Stripe Customer Portal。
- 统一价格页中的 Distribution 套餐。
- 周报和 CSV/PDF 导出。
- Agency 团队、客户权限和白标报告。
- 真实 Stripe Test Mode 全链路验收。
- 第一批真实产品使用验证。

## 十一、详细实施 Roadmap

### P0：计费安全与产品定义收口

目标：创建 Stripe Price 之前先消除重复扣费、签名和权益错误风险。

| 编号 | 任务 | 负责人 | 状态 | 验收标准 |
| --- | --- | --- | --- | --- |
| P0-01 | 建立一次性产品和金额单一配置源 | Codex | 已有基础，待收口 | `listingConfig`、页面、checkout 的金额和权益一致 |
| P0-02 | 创建一次性 Stripe Product/Price 映射 | 用户 + Codex | 未开始 | 5 个付费权益有 Test Price ID，服务端白名单校验 |
| P0-03 | 一次性 checkout 产品键和金额校验 | Codex | 未开始 | 不允许客户端改价，metadata 与实际金额一致 |
| P0-04 | 一次性 webhook 幂等和权益验收 | Codex | 部分已有，待补齐 | 重复 webhook 不重复激活或记账 |
| P0-05 | 建立 Distribution 定价单一配置源 | Codex | 未开始 | 页面和 checkout 不再硬编码价格 |
| P0-06 | 增加 Pilot 自动权益 | Codex | 未开始 | 新用户无信用卡可创建 1 个项目 |
| P0-07 | 实现 Pilot 任务、项目、链接限额 | Codex | 未开始 | 超限时显示升级提示，已有数据不删除 |
| P0-08 | 分离 Distribution Webhook secret | Codex | 未开始 | 两个 Stripe endpoint 分别验证自己的 secret |
| P0-09 | 增加 Stripe event 幂等表/唯一约束 | Codex | 未开始 | 重复 webhook 不重复付款和开通权益 |
| P0-10 | 支持 Pro/Agency 月付和年付 | Codex | 未开始 | 四个 Price ID 均能创建正确 checkout |
| P0-11 | 修正取消、账期结束和降级规则 | Codex | 未开始 | 取消后保留到期，之后自动降为 Pilot |
| P0-12 | 统一价格页三条产品路径 | Codex | 未开始 | Listing、Launch、Distribution 边界清晰 |
| P0-13 | 完整本地 build 和回归 | Codex | 未开始 | `pnpm run build` 成功，既有付款不受影响 |

### P1：Stripe Test Mode 验收

目标：使用真实项目和测试支付验证完整订阅生命周期。

| 编号 | 任务 | 负责人 | 状态 | 验收标准 |
| --- | --- | --- | --- | --- |
| P1-01 | Stripe Test 创建 Pro Monthly/Yearly | 用户 | 未开始 | 获得两个 Test Price ID |
| P1-02 | Stripe Test 创建 Agency Monthly/Yearly | 用户 | 未开始 | 获得两个 Test Price ID |
| P1-03 | 创建 Distribution Test Webhook | 用户 | 未开始 | Endpoint 指向生产测试部署并获得 `whsec_` |
| P1-04 | 配置 Vercel Preview/Test 环境变量 | 用户 | 未开始 | Test key、Price 和 secret 完整 |
| P1-05 | Pro 月付 checkout | 用户 + Codex | 未开始 | entitlement 为 active/pro，仅一条 payment |
| P1-06 | Pro 年付 checkout | 用户 + Codex | 未开始 | 周期和 Price 正确 |
| P1-07 | Agency checkout | 用户 + Codex | 未开始 | entitlement 为 active/agency |
| P1-08 | 重放同一 webhook | Codex | 未开始 | 不重复计数、不重复开通 |
| P1-09 | 取消订阅 | 用户 + Codex | 未开始 | 当前周期保留，结束后降为 Pilot |
| P1-10 | 支付失败/过期测试 | 用户 + Codex | 未开始 | 不错误保留高级权益 |

### P2：第一批真实产品验证

目标：验证用户是否真正完成任务并看到分发结果，而不只是验证页面可用。

建议选择 3 个产品：AI Best Tool、用户自有产品、一个外部客户/朋友产品。

| 编号 | 任务 | 负责人 | 状态 | 验收标准 |
| --- | --- | --- | --- | --- |
| P2-01 | 创建 3 个真实项目 | 用户 | 未开始 | 名称、官网、描述和目标真实 |
| P2-02 | 每项目生成至少 5 个任务 | 用户 + AI | 未开始 | 渠道、优先级、截止日和下一步完整 |
| P2-03 | 每项目生成至少 2 条 UTM | 用户 | 未开始 | 项目、渠道和 campaign 可区分 |
| P2-04 | 新会话打开 UTM | 用户 + Codex | 未开始 | visit 正确归属 link/channel/project |
| P2-05 | 完成注册/提交/认领测试 | 用户 + Codex | 未开始 | 对应 attribution 事件增加一次 |
| P2-06 | 完成至少 2 次真实渠道提交 | 用户 | 未开始 | 保存真实目标、结果和证据 |
| P2-07 | 记录 live/rejected/removed | 用户 | 未开始 | 管理端能正确汇总问题结果 |
| P2-08 | 形成首轮复盘 | Codex | 未开始 | 输出渠道效果、问题和下一轮任务 |

### P3：报告与留存

目标：让用户每周回来，并能向团队或客户交付结果。

| 编号 | 任务 | 负责人 | 状态 | 验收标准 |
| --- | --- | --- | --- | --- |
| P3-01 | 周报页面 | Codex | 未开始 | 汇总完成任务、live 结果和归因 |
| P3-02 | CSV 导出 | Codex | 未开始 | 可导出任务、结果和事件 |
| P3-03 | 邮件提醒 | Codex | 未开始 | 到期任务和复查任务可提醒 |
| P3-04 | Stripe Customer Portal | Codex + 用户 | 未开始 | 用户可更新付款方式和取消订阅 |
| P3-05 | 项目健康度 | Codex | 未开始 | 展示停滞、异常和待复查项目 |

### P4：Agency 正式版

目标：具备按 `$79-$99/月` 收费的完整客户交付能力。

| 编号 | 任务 | 负责人 | 状态 | 验收标准 |
| --- | --- | --- | --- | --- |
| P4-01 | 团队成员和角色 | Codex | 未开始 | Owner/Member/Viewer 权限隔离 |
| P4-02 | 客户只读报告 | Codex | 未开始 | 客户无需后台管理权限可查看报告 |
| P4-03 | 自定义渠道模板 | Codex | 未开始 | Agency 可维护自己的 playbook |
| P4-04 | 白标报告 | Codex | 未开始 | 可配置 Agency 品牌 |
| P4-05 | 25 项目上限和公平使用规则 | Codex | 未开始 | 限额与升级路径可解释 |

### P5：AI 分发副驾驶

目标：用 AI 降低准备和复盘成本，不自动替用户发布。

| 编号 | 任务 | 负责人 | 状态 | 验收标准 |
| --- | --- | --- | --- | --- |
| P5-01 | 产品到渠道推荐 | Codex + AI | 未开始 | 推荐有依据，可人工调整 |
| P5-02 | 渠道差异化草稿 | Codex + AI | 未开始 | 不同渠道不复制同一文案 |
| P5-03 | 拒绝原因总结 | Codex + AI | 未开始 | 输出可执行修正建议 |
| P5-04 | 周报自动总结 | Codex + AI | 未开始 | 不虚构数据，引用真实任务和事件 |

## 十二、首轮实施顺序

严格按以下顺序执行：

1. 完成 P0-01 至 P0-13。
2. 本地 build 成功并部署。
3. 用户在 Stripe Test Mode 创建四个 recurring Price。
4. 用户创建独立 Distribution Webhook 并配置 Vercel Test 环境。
5. 完成 P1 Stripe 全链路测试。
6. 导入 3 个真实产品并完成 P2。
7. 根据真实使用决定 Pro `$19` 和 Agency `$49` 是否继续，以及是否扩大 Agency 开放范围。
8. 再进入 P3 报告和留存，不提前开发 P4/P5。

## 十三、首轮成功指标

### 激活

- 用户在 24 小时内创建项目、5 个任务和 1 条追踪链接。
- Pilot 用户至少完成 1 个任务。

### 使用价值

- 14 天内至少产生 1 个真实 live/rejected/removed 结果。
- 至少一个渠道产生可归属访问。
- 用户可以明确说出下一步应该做什么。

### 商业验证

- 第一阶段至少 5 个 Pilot 用户。
- 至少 3 个 Pro 测试付款。
- Pilot → Pro 转化目标初步设为 5%-10%。
- 付费用户连续 4 周至少每周使用一次。

### 风险控制

- 重复 Stripe webhook 不重复记账。
- 支付失败不错误开启权益。
- 取消后按规则降级，数据不删除。
- AI 不生成虚构结果或自动发帖。

## 十四、职责分工

### 用户负责

- 确认最终美元价格。
- 创建 Stripe Test/Live Product 和 Price。
- 配置 Vercel 环境变量。
- 使用测试卡完成 checkout、取消和失败场景。
- 提供 3 个真实产品。
- 完成真实渠道提交并确认实际结果。

### Codex 负责

- 完成 P0 技术改造。
- 保证既有一次性付款不受影响。
- 本地 build、回归、提交和部署。
- 配合读取 Stripe webhook 结果和数据库状态。
- 修复测试发现的问题。
- 输出首轮真实项目复盘。
- 按本计划更新总控任务状态。

### AI 负责

- 协助产品和渠道匹配。
- 生成可人工编辑的任务和草稿。
- 总结真实数据、拒绝原因和下一步。
- 不代表用户自动发帖，不虚构证据，不替代人工判断。

## 十五、当前下一步

下一步先完成一次性模块的 Stripe 配置收口，再完成 Distribution 的定价和订阅配置：

1. `P0-01` 至 `P0-04`：一次性入驻 Product/Price、金额校验、webhook 幂等。
2. `P0-05` 至 `P0-11`：Distribution 定价、Pilot、订阅生命周期和独立 webhook。
3. `P0-12` 至 `P0-13`：统一价格页、完整 build 和回归。

在一次性和 Distribution 两条支付链路都通过 Test Mode、重复 webhook、失败支付和
取消场景验收前，不切换正式 Live Price，不开放新的真实扣款路径。
