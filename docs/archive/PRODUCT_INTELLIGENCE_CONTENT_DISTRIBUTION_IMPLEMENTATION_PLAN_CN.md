# 产品证据引擎、高质量内容与智能分发实施总方案

更新时间：2026-07-28

状态：活跃实施文档

## 当前实施状态

截至 2026-07-28：

| ID     | 状态                   | 已完成内容                                                | 上线条件                                      |
| ------ | ---------------------- | --------------------------------------------------------- | --------------------------------------------- |
| PI-001 | 已完成                 | 统一 profile/source/claim/asset TypeScript 类型           | 无                                            |
| PI-002 | 已完成                 | 固定 10 个产品校准测试集                                  | 后续抓取仍须读取实时官网事实                  |
| DT-001 | 已完成                 | 固定 10 个目标站校准测试集                                | 后续分析仍须重新验证目标站规则                |
| QA-001 | 已完成                 | 固定七维质量权重、发布门槛和阻断规则                      | 无                                            |
| PI-010 | 已完成                 | 四张证据表、索引、约束和 RLS 迁移                         | 已在 Supabase 执行                            |
| PI-011 | 已完成                 | 安全抓取器、robots、超时、大小、重定向和私网拦截          | 无                                            |
| PI-012 | 已完成 | sitemap、导航和常见路径发现，带来源、初步类型、评分和抓取上限 | 已用 aibesttool.com 只读校准；初步类型误判样本转入 PI-013 |
| PI-013 | 已完成 | URL、metadata、H1/H2、结构化数据和正文组合分类 | 定价页正确；指南页和新增页不再误判 |
| PI-014 | 基础提取完成 | 产品名、定位、价格计划、免费试用和官方素材候选均带来源 | 定价页真实校准只保留 Pro `$19/mo`、Agency `$49/mo` |
| PI-015 | 已完成 | 多来源事实冲突检测和严重性标记 | 无 |
| PI-016 | 已完成 | 归一化产品档案和版本快照 | 无 |
| PI-017 | 已完成 | 后台证据档案、来源、冲突与复查界面 | 无 |
| PI-018 | 已完成 | 真实站证据防污染、品牌名校准和失败来源隔离 | 实测产品名统一、冲突数为 0 |
| QC-010 | 已完成 | 七维证据质量评分、决策、阻断项和建议动作 | 后台证据档案可查看每维得分与依据 |

本轮验证：

- `pnpm run test:intelligence-foundation` 通过。
- `./node_modules/.bin/tsc --noEmit` 通过。
- `pnpm run build` 通过，包含 AdSense 防回归检查、类型检查和静态页面生成。
- `pnpm run intelligence:discover-pages -- <官网 URL>` 可执行只读真实站页面发现。
- `aibesttool.com` 真实校准成功，发现首页、定价、更新、开发者入口和 sitemap，无抓取警告；链接文案造成的初步类型误判不写库，由 PI-013 结合 URL、metadata 和正文重新分类。
- PI-013 已用线上定价、指南和新增页校准；PI-014 已用线上定价页迭代校准，错误产品名、页面描述和共享容器价格均在写库前被阻断。
- 已对 `aibesttool.com` 完成真实证据同步：39 个来源、37 条已验证声明、2 个资产、0 冲突，profile 状态为 `ready`。
- 当前没有自动发布内容；评分只提供决策与建议，仍保留人工发布门槛。

本文档是以下三部分后续开发的唯一需求、设计和验收依据：

1. 产品证据引擎（Product Intelligence）
2. 高质量内容自动化（Quality Content Pipeline）
3. 智能分发操作系统（Distribution Operating System）

现有文档的职责：

- `MASTER_OPTIMIZATION_TRACKER_CN.md`：只跟踪总进度和里程碑。
- `DISTRIBUTION_MODULE_PLAN_CN.md`：保留现有分发 MVP 的历史范围和已实现能力。
- `TOOL_LIFECYCLE_POLICY.md`：继续定义工具的候选、发布、归档和删除规则。
- 本文档：定义新一阶段的完整产品需求、技术方案、任务顺序和验收标准。

---

## 一、背景与问题

### 1. 当前内容系统的问题

现有采集系统已经可以：

- 从 RSS、HTML、API 和人工来源发现候选工具。
- 抓取标题、摘要、canonical 和 OG image。
- 按关键词判断 AI 相关性。
- 推断分类、标签和使用场景。
- 导入工具草稿。
- 按分类、Logo、截图、描述、详情、价格和标签计算完整度。

但当前质量分主要衡量“字段是否存在”，还不能证明：

- 内容真实。
- 功能和价格仍然有效。
- 页面提供了独特的用户决策价值。
- 描述不是对官方营销文案的简单改写。
- 截图是真实产品截图。
- 多来源信息之间没有冲突。
- 页面值得进入 Google 索引。

### 2. 当前分发系统的问题

现有分发模块已经可以：

- 创建工作区和项目。
- 按八类渠道创建任务。
- 保存优先级、截止日期、状态和结果。
- 生成 UTM 链接。
- 记录访问、注册、提交、认领、checkout 和付款归因。
- 保存 live URL、nofollow、rejected 和 removed 等结果。

但当前系统管理的是“渠道类型”，不是“具体目标网站”，因此不能自动回答：

- 今天应该提交到哪个具体网站。
- 目标站的提交入口在哪里。
- 是否收费、是否需要账号、是否有验证码。
- 需要哪些字段和素材。
- 应该使用哪种文案。
- 为什么这个目标站适合当前产品。
- 提交后什么时候复查和跟进。

### 3. 新阶段的核心判断

内容自动化和分发自动化不应建设成两套独立系统。

两者必须共用一套产品事实与证据：

```text
产品官网
  -> 产品页面发现
  -> 产品事实与证据
  -> 高质量工具内容
  -> 针对目标站的分发材料

目标分发网站
  -> 提交入口与规则发现
  -> 目标站规则快照
  -> 适配度判断
  -> 每日人工提交任务
```

---

## 二、产品目标与非目标

### 1. 产品目标

#### 产品证据引擎

只输入产品官网，系统自动形成可追溯的产品事实库，包括：

- 产品定位
- 目标用户
- 使用场景
- 功能
- 价格
- 限制
- 支持平台
- 官方文档
- 更新日志
- Logo 和截图候选
- 信息来源、抓取日期和置信度

#### 高质量内容自动化

基于证据生成工具页面草稿、更新建议和索引决策，不基于空白提示词批量扩写。

#### 智能分发操作系统

只输入产品官网和目标网站，系统负责：

- 研究目标站
- 识别规则和障碍
- 判断相关性
- 生成唯一文案
- 准备素材清单
- 生成追踪链接
- 安排每日任务
- 提醒跟进
- 检查 live URL
- 汇总归因结果

用户只负责：

- 外站账号注册和登录
- 验证码
- 最终提交或发送
- 目标站页面无法公开抓取时补充实际规则
- 对无法从官网验证的事实进行确认

### 2. 明确非目标

本阶段不建设：

- 自动批量发帖机器人。
- 自动绕过验证码或登录。
- 自动向 Reddit、GitHub、社区批量发推广内容。
- 保证 dofollow 外链数量。
- 保证 Google 排名或索引。
- 基于不存在的事实生成用户数、收入、客户评价或测试结论。
- 为了达到每日数量而自动发布低质量页面。

---

## 三、用户角色与权限

| 角色        | 主要能力                                             |
| ----------- | ---------------------------------------------------- |
| 平台管理员  | 管理采集源、证据规则、目标站规则、质量门槛和全局任务 |
| Pilot 用户  | 维护 1 个产品、使用基础分发任务和有限目标站          |
| Pro 用户    | 维护最多 5 个产品、完整文案包、跟进、归因和周报      |
| Agency 用户 | 多客户项目、共享目标站知识、团队任务和客户报告       |
| 系统任务    | 抓取、提取、质量检查、定时复查、排期和结果监测       |

权限原则：

- 产品和任务按 owner/workspace 隔离。
- 全局目标站规则只保存公开事实和匿名统计。
- 客户私有文案、提交记录和结果不得跨 workspace 暴露。
- 系统管理员不能通过公开 API 暴露内部评分理由和敏感运行日志。

---

## 四、总体架构

### 1. 逻辑模块

```text
Source Discovery
  -> Web Fetcher
  -> Page Classifier
  -> Evidence Extractor
  -> Evidence Store
  -> Conflict Resolver
  -> Product Profile
  -> Content Generator
  -> Distribution Generator
  -> Quality Gates
  -> Human Action Queue
  -> Result Monitor
  -> Analytics and Learning
```

### 2. 数据存储边界

当前项目存在两套数据访问：

- 工具和采集使用现有 Neon/Postgres 服务。
- 登录、分发权益和分发工作区使用 Supabase。

本阶段不强制一次性迁移数据库。

实施原则：

- 抓取、证据提取和评分逻辑放在共享 service 层。
- 工具目录证据继续关联现有 `tools` 和 collection 数据。
- 用户分发项目证据关联 Supabase 中的 distribution project。
- 使用统一 TypeScript 类型，避免 Neon 和 Supabase 出现两套字段定义。
- 跨数据库只通过明确的 service 接口传递产品档案，不做隐式双写。

### 3. 推荐代码结构

```text
lib/services/intelligence/
  fetcher.ts
  pageClassifier.ts
  evidenceExtractor.ts
  evidenceScoring.ts
  conflictResolver.ts
  productProfile.ts
  contentComposer.ts
  distributionComposer.ts
  targetAnalyzer.ts
  qualityGates.ts

app/actions/intelligence.ts
app/actions/distribution.ts

scripts/
  intelligence-run-due.ts
  content-run-due.ts
  distribution-run-due.ts
  distribution-recheck.ts
```

---

## 五、产品证据引擎需求

### 1. 产品页面发现

输入：

- 产品官网 URL
- 可选产品名称

自动发现候选页面：

- 首页
- Pricing
- Features
- Product
- Use cases
- Documentation
- Changelog
- About
- Security
- Terms
- License
- GitHub
- Help center

发现方式：

- 首页链接
- sitemap
- canonical
- 导航语义
- 常见路径
- structured data

限制：

- 默认同域名。
- 每次最多抓取固定页面数。
- 遵守 robots 和合理抓取频率。
- 不绕过登录、付费墙和验证码。
- 超时、重定向循环和超大响应必须停止。

### 2. 证据数据模型

建议新增统一逻辑模型：

#### `product_intelligence_profiles`

| 字段             | 说明                               |
| ---------------- | ---------------------------------- |
| id               | 档案 ID                            |
| owner_type       | tool / distribution_project        |
| owner_id         | 工具或项目 ID                      |
| canonical_domain | 主域名                             |
| product_name     | 产品名                             |
| profile_status   | pending / ready / conflict / stale |
| profile_version  | 档案版本                           |
| last_crawled_at  | 最近抓取                           |
| last_verified_at | 最近通过质量检查                   |
| next_review_at   | 下次复查                           |

#### `product_intelligence_sources`

| 字段          | 说明                          |
| ------------- | ----------------------------- |
| profile_id    | 所属产品                      |
| url           | 来源 URL                      |
| page_type     | pricing / docs / changelog 等 |
| http_status   | HTTP 状态                     |
| canonical_url | canonical                     |
| content_hash  | 内容摘要                      |
| fetched_at    | 抓取时间                      |
| fetch_status  | success / blocked / failed    |
| metadata      | 抓取元数据                    |

#### `product_intelligence_claims`

| 字段            | 说明                                         |
| --------------- | -------------------------------------------- |
| profile_id      | 所属产品                                     |
| claim_type      | pricing / feature / audience / limitation 等 |
| claim_key       | 规范化字段名                                 |
| claim_value     | 结构化值                                     |
| source_url      | 证据 URL                                     |
| source_excerpt  | 最小必要证据摘要                             |
| observed_at     | 观察时间                                     |
| confidence      | 0–100                                        |
| conflict_status | none / possible / confirmed                  |
| expires_at      | 事实过期时间                                 |

#### `product_intelligence_assets`

| 字段            | 说明                               |
| --------------- | ---------------------------------- |
| profile_id      | 所属产品                           |
| asset_type      | logo / screenshot / social / video |
| source_url      | 来源                               |
| stored_url      | 本地或对象存储地址                 |
| width / height  | 尺寸                               |
| is_placeholder  | 是否占位                           |
| evidence_status | verified / candidate / rejected    |

### 3. 事实类型

第一版必须支持：

- product_name
- one_line_positioning
- target_audience
- use_case
- feature
- integration
- supported_platform
- pricing_model
- pricing_plan
- free_trial
- free_limit
- export_limit
- license_limit
- security_claim
- official_social
- official_repository
- changelog_update
- limitation

### 4. 冲突处理

以下情况必须标记冲突：

- 首页和价格页价格不同。
- 旧文档和新文档功能描述不同。
- structured data 与可见正文不同。
- www 和非 www 指向不同产品。
- 官方页面与第三方来源不一致。

处理规则：

- 官方价格页优先于首页营销区。
- 新的官方 changelog 优先于旧文档。
- 第三方来源不能覆盖官方事实。
- 冲突未解决时禁止生成确定性陈述。
- 文案可使用“官网当前未明确披露”等保守表达。

---

## 六、高质量内容自动化需求

### 1. 候选来源

候选机会按以下顺序进入：

1. GSC 已有曝光但内容薄弱的页面。
2. 核心分类缺少代表工具。
3. 用户付费提交和 owner 认领。
4. 可信采集源发现的新工具。
5. 已有页面的价格、功能和状态更新。
6. 竞品对比和用户搜索需求。

### 2. 内容输出

每个工具页面草稿至少生成：

- 双语标题
- 一句话定位
- 简短描述
- 详细介绍
- Best for
- Not ideal for
- 主要使用场景
- 核心能力
- 限制与注意事项
- 价格说明和核查日期
- 对比维度
- FAQ
- 证据 URL
- 最近核查日期
- 下一次复查日期

### 3. 内容生成约束

- 所有事实必须关联 claim 或来源。
- 不允许把官方营销词直接当作编辑结论。
- 不允许生成第一人称测试经历，除非有真实测试记录。
- 不允许生成不存在的评论、客户数、收入或排名。
- 不允许把推测写成确定事实。
- 中文和英文均从同一事实档案生成，不允许两种语言事实不一致。
- 相同模板句式在不同工具页面中的相似度必须受限。

### 4. 新质量评分

#### Evidence Score，20 分

- 至少两个有效官方来源。
- Pricing、docs、homepage 等关键页面可访问。
- 重要事实有来源。

#### Factual Consistency，20 分

- 无未解决冲突。
- 价格与计划一致。
- 不包含无法验证的数字。

#### Decision Value，20 分

- 明确适合谁。
- 明确不适合谁。
- 有真实限制。
- 有可执行比较维度。

#### Uniqueness，15 分

- 与站内其他工具页面不高度重复。
- 不只是替换产品名称。
- 包含该产品独有证据。

#### Search and Category Fit，10 分

- 分类合理。
- 页面意图与目标 query 一致。
- 不与已有 canonical 页面竞争。

#### Freshness，10 分

- 价格和关键功能有核查日期。
- 来源未过期。
- 设置下次复查日期。

#### Media Integrity，5 分

- Logo 与截图分开。
- 非占位素材。
- 图片来源可追溯。

### 5. 状态机

```text
discovered
  -> evidence_pending
  -> evidence_ready
  -> draft_ready
  -> qa_failed / qa_passed
  -> review_required / publish_ready
  -> published
  -> stale
  -> refresh_required
```

### 6. 发布门槛

| 条件                | 动作                        |
| ------------------- | --------------------------- |
| 总分 >= 90 且无冲突 | 进入 publish_ready          |
| 80–89               | 进入 review_required        |
| 70–79               | 继续补证据                  |
| < 70                | 保留候选或拒绝              |
| 新页面无真实截图    | 不得标记媒体完整            |
| 新页面只有单一来源  | 不得标记 editorial verified |
| 存在冲突            | 禁止发布                    |

第一阶段规则：

- 已有页面的事实更新可在 >=90 时自动更新。
- 新工具页面即使 >=90，也先进入发布队列，不直接索引。
- 每日默认最多发布 1–3 个新工具页面。
- 每日可发现和处理更多候选，但不得用数量代替质量。

### 7. 发布后复查

- 发布后 24 小时：HTTP、canonical、metadata、index 指令。
- 发布后 7 天：GSC 是否出现页面或 query 信号。
- 发布后 30 天：曝光、点击、评论、认领和更新信号。
- 发布后 60 天：保留、增强、合并或 noindex 决策。

---

## 七、智能分发操作系统需求

### 1. 产品定位

产品名称建议：

**AI Product Distribution Workspace**

核心承诺：

**系统负责研究、准备、排期、检查和跟进，用户只负责登录和最终提交。**

不使用以下承诺：

- 自动制造 backlinks
- 保证 dofollow
- 保证收录
- 保证排名

### 2. 具体目标站模型

现有 `distribution_channels` 保留为渠道类型。

新增 `distribution_targets` 表示具体网站。

#### `distribution_targets`

| 字段                 | 说明                               |
| -------------------- | ---------------------------------- |
| id                   | 目标站 ID                          |
| channel_id           | 所属渠道类型                       |
| name                 | 网站名称                           |
| homepage_url         | 官网                               |
| submission_url       | 提交入口                           |
| registration_url     | 注册入口                           |
| pricing_url          | 收费说明                           |
| audience             | 受众                               |
| target_status        | active / stale / blocked / retired |
| requires_account     | 是否需要账号                       |
| requires_payment     | 是否收费                           |
| requires_captcha     | 是否存在验证码                     |
| requires_backlink    | 是否要求反向链接                   |
| editorial_review     | 是否人工审核                       |
| expected_review_days | 预计审核时间                       |
| last_checked_at      | 最后核查                           |
| next_check_at        | 下次核查                           |
| confidence           | 规则置信度                         |

#### `distribution_target_snapshots`

保存每次抓取的：

- 页面 URL
- HTTP 状态
- 内容 hash
- 可见规则
- 收费信息
- 表单字段
- 账号和验证码信息
- 抓取时间

#### `distribution_target_requirements`

结构化字段：

- required_field
- field_type
- character_limit
- allowed_values
- required_asset
- rule_text
- source_url
- confidence

### 3. 目标站研究流程

```text
输入目标 URL
  -> 判断渠道类型
  -> 查找 submit/add/list/launch/contact 页面
  -> 提取公开规则
  -> 识别收费、注册、验证码和素材要求
  -> 识别无法自动验证的部分
  -> 计算目标站适配度
  -> 生成研究报告
```

失败降级：

- 登录墙：标记 account_required。
- 验证码：标记 captcha_blocked。
- JS 无法抓取：标记 manual_verification_required。
- 规则不明确：不得自动推断为免费或 dofollow。
- 网站失效：标记 blocked 或 retired。

### 4. 产品与目标站适配评分

| 维度             | 权重 |
| ---------------- | ---: |
| 产品与受众相关性 |   30 |
| 分类匹配         |   20 |
| 目标站公开可信度 |   15 |
| 预计时间与成本   |   15 |
| 历史 live 保留率 |   10 |
| 垃圾和拒绝风险   |   10 |

动作：

- > =80：推荐进入近期队列。
- 65–79：实验任务。
- 50–64：需要人工判断。
- <50：不推荐。

### 5. 分发材料包

每个 `project + target` 自动生成：

- 推荐落地页
- UTM 链接
- 标题多个长度版本
- 一句话介绍
- 短描述
- 长描述
- 主要功能
- 目标用户
- 分类和标签建议
- Alternative 定位
- Founder/launch story
- Newsletter pitch
- 社区回答草稿
- Reddit 披露版本
- GitHub 文档版本
- 邮件主题和正文
- Logo、截图和尺寸清单
- 提交前检查清单
- 可能拒绝原因
- 建议跟进日期

文案规则：

- 同一产品在不同目标站必须使用不同结构。
- 文案必须遵守目标站长度和字段限制。
- 不生成不存在的 proof point。
- 社区和 Reddit 必须包含身份披露。
- 目录提交可直接描述产品，但不得夸大。
- GitHub 不得生成无关 issue 或垃圾链接任务。

### 6. 分发状态机

主流程：

```text
discovered
  -> researching
  -> eligible
  -> copy_ready
  -> waiting_human
  -> submitted
  -> under_review
  -> live
  -> follow_up
  -> retained
```

异常状态：

```text
paid_required
account_required
captcha_blocked
missing_asset
manual_verification_required
rule_conflict
rejected
removed
not_relevant
```

### 7. 每日任务调度

默认每日只展示 1–3 个最高价值人工任务。

排序输入：

- 适配分
- 任务准备度
- 是否已生成全部文案
- 是否缺素材
- 截止日期
- 上次提交日期
- 预计耗时
- 费用
- 历史成功率
- 当前增长目标

每天的任务必须包含：

- 为什么现在做
- 打开哪个目标网站
- 使用哪个落地页
- 复制哪套文案
- 需要哪些素材
- 完成后点击哪个状态
- 什么时候跟进

### 8. 人工动作边界

系统允许自动执行：

- 研究公开页面
- 生成文案
- 生成 UTM
- 准备素材清单
- 排期
- 提醒
- live URL 检查
- 链接属性检查
- 归因统计

用户必须执行：

- 注册和登录
- CAPTCHA
- 最终提交
- 付费确认
- 社区发帖和邮件发送
- 无法公开抓取规则的确认

### 9. 结果复查

自动复查周期：

- submitted + 3 天
- submitted + 7 天
- live + 7 天
- live + 30 天
- live + 90 天

检查项：

- live URL 是否可访问
- 产品名称是否仍然存在
- 指向产品的链接是否仍然存在
- rel 属性
- 重定向
- 页面是否删除
- UTM 访问
- 下游注册、提交、认领、checkout 和付款

第三方页面是否被 Google 索引只能作为观察信号，不能作为绝对结论。

---

## 八、共享 AI 生成与安全规则

### 1. AI 的角色

AI 可以：

- 页面分类
- 事实提取
- 冲突提示
- 分类建议
- 内容组织
- 文案生成
- 重复度检查
- 风险检查
- 任务优先级建议
- 复盘总结

AI 不可以：

- 创建虚假事实
- 把推测升级为确定结论
- 假装实际使用过产品
- 自动发布社区内容
- 隐藏与产品的关联身份
- 绕过目标站规则

### 2. Evidence-bound generation

所有生成任务必须接收：

- 允许使用的 claims
- 每条 claim 的来源
- 禁止使用的冲突字段
- 目标页面的规则
- 最大长度
- 语气和披露要求

输出同时保存：

- 生成版本
- 使用的 claim IDs
- 生成时间
- 模型或生成器版本
- QA 结果
- 人工修改

### 3. Fail closed

无法确认时：

- 显示 unknown。
- 请求补证据。
- 保留 draft。
- 不进入自动发布。

禁止为了完成任务数量而降级为猜测。

---

## 九、后台与用户界面

### 1. 管理后台

新增：

- Product Intelligence Profiles
- Evidence conflicts
- Stale facts
- Content QA queue
- Publish-ready queue
- Distribution target registry
- Target rule conflicts
- Failed crawler runs

### 2. Collection Queue 增强

显示：

- Evidence score
- Factual consistency
- Decision value
- Uniqueness
- Freshness
- Media integrity
- 冲突数量
- 缺少的证据
- 推荐动作

### 3. Distribution Workspace 增强

页面结构：

1. 今日任务
2. 产品事实完整度
3. 推荐目标站
4. 等待人工提交
5. 审核中
6. 已上线和待复查
7. 被拒和障碍
8. 归因与周报

### 4. 任务详情

必须包含：

- 目标站说明
- 适配理由
- 提交入口
- 收费和账号要求
- 文案包
- 素材包
- 一键复制
- 提交检查清单
- 人工操作按钮
- 跟进时间
- 历史状态

---

## 十、API 与定时任务

### 1. 推荐 Server Actions/API

- `createIntelligenceProfile`
- `runProductDiscovery`
- `runEvidenceExtraction`
- `resolveEvidenceConflict`
- `generateToolDraft`
- `runContentQualityGate`
- `approvePublishCandidate`
- `createDistributionTarget`
- `analyzeDistributionTarget`
- `generateDistributionPackage`
- `scheduleDistributionTasks`
- `markHumanSubmission`
- `recordDistributionObstacle`
- `recheckDistributionResult`

### 2. 定时任务

#### Daily

- 运行到期采集源。
- 抓取高优先级产品。
- 补齐证据。
- 生成内容草稿。
- 运行质量门槛。
- 生成每日分发队列。
- 检查到期 live URL。

#### Weekly

- 重新计算内容机会。
- 重新计算目标站适配分。
- 汇总拒绝原因。
- 生成分发周报。
- 生成内容发布与 GSC 复盘。

#### Monthly

- 价格和产品事实复查。
- 目标站收费和账号要求复查。
- live 链接保留率。
- 内容合并/noindex 候选。

---

## 十一、监控、日志与告警

必须记录：

- 抓取成功率
- 抓取延迟
- 证据数量
- 冲突数量
- 草稿生成数量
- QA 通过率
- 自动更新数量
- 人工退回率
- 目标站研究成功率
- 文案包生成成功率
- waiting_human 数量
- submitted -> live 转化率
- live 30/90 天保留率

告警条件：

- 连续抓取失败。
- 同域名产生大量重复产品。
- QA 通过率突然异常升高或降低。
- 自动生成内容相似度异常。
- 价格证据过期。
- 目标站规则变化。
- live URL 大量失效。
- 分发任务长期积压。

---

## 十二、测试方案

### 1. 固定测试集

准备：

- 10 个真实产品。
- 10 个不同类型的目标分发网站。
- 至少 2 个收费目标站。
- 至少 2 个需要账号或验证码的目标站。
- 至少 2 个社区/Reddit/GitHub 类型目标。
- 至少 1 个规则不清晰或无法自动抓取的目标。

### 2. 内容测试

每个产品验证：

- 页面发现是否正确。
- 价格是否来自正确页面。
- 功能是否有来源。
- 是否识别限制。
- 是否识别冲突。
- 是否生成独特文案。
- 中英文事实是否一致。
- 质量分是否符合人工判断。

### 3. 分发测试

每个目标站验证：

- 是否找到提交入口。
- 是否识别收费。
- 是否识别账号。
- 是否识别验证码或手动障碍。
- 字段长度是否正确。
- 文案是否适配目标站。
- UTM 是否可用。
- 状态是否完整。
- 跟进是否自动产生。
- live URL 是否能自动复查。

### 4. 回归测试

必须新增：

- 证据解析单元测试。
- 冲突解析测试。
- 质量评分测试。
- 禁止虚构事实测试。
- 重复内容测试。
- 目标站规则解析测试。
- 状态机测试。
- 权限/RLS 测试。
- cron 幂等测试。
- production smoke test。

---

## 十三、验收指标

### 1. 产品证据引擎

- 10 个测试产品均建立证据档案。
- 关键事实来源覆盖率 >= 90%。
- 已知冲突识别率 >= 90%。
- 不允许出现无来源价格。
- 抓取失败不阻断其他产品。

### 2. 高质量内容

- 10 个草稿全部通过来源追溯检查。
- 站内高相似内容比例低于设定阈值。
- 自动 QA 与人工判断的一致率 >= 85%。
- 无证据事实数量为 0。
- 新页面不会绕过索引门槛。

### 3. 智能分发

- 10 个目标站均有规则档案或明确人工障碍。
- 目标站收费/账号/验证码状态可见。
- 每个目标站均生成唯一文案包。
- 人工操作可在一个任务详情中完成准备。
- 提交后自动生成跟进。
- live URL 可复查。
- 归因链接可追踪。

---

## 十四、执行任务计划

### Phase 0：基线和设计冻结，2 个工作日

| ID     | 任务                     | 依赖   | 交付                            | 验收                          |
| ------ | ------------------------ | ------ | ------------------------------- | ----------------------------- |
| PI-001 | 冻结统一 TypeScript 类型 | 无     | profile/source/claim/asset 类型 | Neon 与 Supabase service 共用 |
| PI-002 | 确认 10 产品测试集       | 无     | 固定测试数据                    | 覆盖不同产品类型              |
| DT-001 | 确认 10 目标站测试集     | 无     | 固定目标站列表                  | 覆盖收费、账号、验证码和社区  |
| QA-001 | 固定质量评分和发布门槛   | PI-001 | 评分配置                        | 与本文档一致                  |

### Phase 1：产品证据引擎 P0，5–7 个工作日

| ID     | 任务               | 依赖   | 交付                          | 验收                             |
| ------ | ------------------ | ------ | ----------------------------- | -------------------------------- |
| PI-010 | 新增证据数据迁移   | PI-001 | profile/source/claim/asset 表 | 可重复执行、RLS/索引正确         |
| PI-011 | 实现安全抓取器     | PI-010 | fetcher service               | 超时、大小、重定向和 robots 受控 |
| PI-012 | 实现页面发现       | PI-011 | sitemap/导航/常见路径发现     | 测试产品发现关键页面             |
| PI-013 | 实现页面类型识别   | PI-012 | page classifier               | pricing/docs/changelog 可区分    |
| PI-014 | 实现结构化事实提取 | PI-013 | evidence extractor            | 关键事实带来源                   |
| PI-015 | 已完成             | PI-014 | conflict resolver             | 测试冲突可复现，已可标记冲突      |
| PI-016 | 已完成             | PI-015 | normalized profile            | 可被两个模块读取，已形成快照      |
| PI-017 | 已完成             | PI-016 | admin UI                      | 可查看来源、冲突和过期状态       |
| PI-018 | 已完成             | PI-017 | 真实站证据校准与防污染规则     | 非 2xx、非 HTML、错误页和普通页面标题不再制造产品名冲突 |

### Phase 2：高质量内容流水线 P1，5–7 个工作日

| ID     | 任务                         | 依赖         | 交付             | 验收                         |
| ------ | ---------------------------- | ------------ | ---------------- | ---------------------------- |
| QC-010 | 已完成：拆分现有质量分       | PI-016       | 多维质量评分     | 七维得分、依据、阻断和建议已可见 |
| QC-011 | 已完成：实现 evidence-bound composer | PI-016       | 内容生成 service | 每段可追溯 claim             |
| QC-012 | 已完成：实现事实检查         | QC-011       | factual gate     | 无来源事实阻断               |
| QC-013 | 已完成：实现站内重复度检查   | QC-011       | uniqueness gate  | 模板替换内容阻断             |
| QC-014 | 已完成：实现索引门槛         | QC-010/12/13 | publish decision | draft/noindex/publish 可区分 |
| QC-015 | 已完成：增强 Collection Queue | QC-014       | 多维评分 UI      | 缺口和推荐动作可见           |
| QC-016 | 已完成：实现每日内容队列     | QC-014       | scheduled queue  | 默认最多发布 1–3 个          |
| QC-017 | 已完成：发布后复查任务       | QC-016       | 7/30/60 天复查   | 自动进入复盘队列             |

### Phase 3：具体目标站情报 P1，5–7 个工作日

| ID     | 任务                 | 依赖          | 交付                           | 验收                       |
| ------ | -------------------- | ------------- | ------------------------------ | -------------------------- |
| DT-010 | 新增 target 数据迁移 | DT-001        | targets/snapshots/requirements | RLS 和索引正确             |
| DT-011 | 实现目标站页面发现   | PI-011/DT-010 | submit/register/pricing 发现   | 测试站入口识别             |
| DT-012 | 实现规则提取         | DT-011        | target analyzer                | 收费、账号、字段和素材可见 |
| DT-013 | 实现障碍识别         | DT-012        | blocked states                 | CAPTCHA/登录墙不误判       |
| DT-014 | 实现规则版本与复查   | DT-012        | snapshots                      | 规则变化可追踪             |
| DT-015 | 实现目标站管理后台   | DT-014        | registry UI                    | 可纠错和停用               |
| DT-016 | 已完成               | PI-016/DT-014 | match score + reasons          | 评分理由可解释，后台可见   |

### Phase 4：分发材料与每日任务 P1，5–7 个工作日

| ID     | 任务                  | 依赖          | 交付                       | 验收                   |
| ------ | --------------------- | ------------- | -------------------------- | ---------------------- |
| DP-010 | 已完成               | DT-010        | 新状态与迁移               | 旧任务兼容             |
| DP-011 | 已完成               | PI-016/DT-012 | distribution composer      | 目标站唯一文案         |
| DP-012 | 已完成               | DP-011        | preflight gate             | 长度和缺失素材可见     |
| DP-013 | 已完成               | DP-011        | tracked destination        | 可归因                 |
| DP-014 | 已完成               | DT-016/DP-012 | scheduler                  | 每天 1–3 项            |
| DP-015 | 已完成               | DP-011/12/13  | human action UI            | 不离开平台即可完成准备 |
| DP-016 | 已完成               | DP-015        | waiting/submitted/blockers | 操作不超过两步         |
| DP-017 | 已完成               | DP-016        | follow-up job              | 提交后自动排期         |

### Phase 5：结果复查与学习 P2，5–7 个工作日

| ID     | 任务            | 依赖      | 交付                 | 验收                    |
| ------ | --------------- | --------- | -------------------- | ----------------------- |
| RM-010 | 已完成           | DP-016    | availability monitor | 状态变化可记录          |
| RM-011 | 已完成           | RM-010    | rel/redirect checker | nofollow/removed 可识别 |
| RM-012 | 已完成           | RM-010    | retention metrics    | 项目和目标站可汇总      |
| RM-013 | 已完成           | DP-016    | outcome aggregation  | 不泄露私有数据          |
| RM-014 | 已完成           | RM-012/13 | scoring feedback     | 历史结果影响排序        |
| RM-015 | 已完成           | RM-012    | project report       | Pro/Agency 可用         |

### Phase 6：上线和真实验证，3–5 个工作日

| ID      | 任务                  | 依赖       | 交付               | 验收                        |
| ------- | --------------------- | ---------- | ------------------ | --------------------------- |
| REL-010 | 全量本地 build 和测试 | 全部       | 通过报告           | build、type、核心测试无错误 |
| REL-011 | 数据迁移演练          | migrations | 演练记录           | 可重复、可回滚              |
| REL-012 | 小流量上线            | REL-010/11 | production release | 不影响现有目录和付款        |
| REL-013 | 10 产品内容验证       | REL-012    | 验收报告           | 符合内容指标                |
| REL-014 | 10 目标站人工提交验证 | REL-012    | 验收报告           | 完整走通状态机              |
| REL-015 | 7 天复盘              | REL-013/14 | 结论与修正         | 决定是否扩大                |

---

## 十五、里程碑与预计周期

| 周次    | 里程碑                                  |
| ------- | --------------------------------------- |
| 第 1 周 | 产品证据引擎可抓取、提取和显示证据      |
| 第 2 周 | 10 个产品生成可追溯草稿，质量门槛可运行 |
| 第 3 周 | 10 个目标站形成规则档案和障碍状态       |
| 第 4 周 | 文案包、素材预检和每日任务可用          |
| 第 5 周 | live URL、跟进和保留率闭环              |
| 第 6 周 | 生产小流量验证和 7 天复盘               |

预计：

- 第一个可用版本：约 2 周。
- 完整第一版：约 4–6 周。
- 是否扩大自动发布和目标站数量：必须由真实验收数据决定。

---

## 十六、职责分工

### Codex 负责

- 数据模型和迁移。
- 抓取、提取、评分和生成服务。
- 后台和用户页面。
- 定时任务。
- 质量门槛。
- 测试和 production smoke。
- 文档和任务状态更新。
- 每个阶段的本地 build。
- 按确认流程推送生产。

### 用户负责

- 确认 10 个真实测试产品。
- 确认或实际操作 10 个目标站。
- 外站账号、登录、CAPTCHA 和付款。
- 提交后的真实状态反馈。
- 对官网没有公开的第一方事实进行确认。
- 决定是否扩大自动发布范围。

---

## 十七、Definition of Done

一个阶段只有同时满足以下条件才算完成：

- 代码完成。
- 数据迁移完成。
- 类型检查和 build 通过。
- 单元/集成测试通过。
- 后台可观察。
- 失败可降级。
- 权限和 RLS 正确。
- 文档状态更新。
- 真实测试集验证。
- 没有绕过质量门槛。

“生成了页面”不等于内容阶段完成。

“创建了任务”不等于分发阶段完成。

最终完成标准是：

> 产品事实可追溯，内容可验证，人工提交足够简单，提交结果可持续复查，真实效果可归因。
