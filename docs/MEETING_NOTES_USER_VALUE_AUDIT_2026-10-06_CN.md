# meeting-notes：生产用户价值与内容结构只读审计

日期：2026-10-06（Asia/Shanghai）。基线：`e938d1c6`。范
围：[英文生产页](https://aibesttool.com/tasks/meeting-notes)、[中文生产页](https://aibesttool.com/cn/tasks/meeting-notes)。
结论：**技术边界通过；Task-first 基础已具备，用户决策内容尚不完整，需要五项最小整改。** 本轮只记录，不编辑页面或生产内
容。

采用生产 HTTP GET HTML（JSDOM 提取 `[data-decision-task-page]`）与同基线源码静态核对。浏览器首次只读文本观察与 HTML 一
致；随后停止 UI 操作。**移动端视觉 N/A**：没有取得手机视口截图/真实点击验证，下方仅为结构性判断，不标视觉 PASS。

## 生产边界

| 项目           | 英文                                          | 中文                             |
| -------------- | --------------------------------------------- | -------------------------------- |
| HTTP           | 200                                           | 200                              |
| self canonical | `/tasks/meeting-notes`                        | `/cn/tasks/meeting-notes`        |
| robots meta    | `noindex, follow`                             | `noindex, follow`                |
| X-Robots-Tag   | 未返回；不能虚报存在                          | 未返回；以 meta 为依据           |
| H1             | Capture meetings and turn them into follow-up | 记录会议并形成后续行动           |
| 候选           | Fathom / Otter.ai / Fireflies                 | 同三项                           |
| 详情下一步     | `/ai/fathom` 等三个同语言详情                 | `/cn/ai/fathom` 等三个同语言详情 |

两页均不在 sitemap；生产 sitemap 126 URL、0 Task URL。SEO production smoke PASS。这些是访问与索引边界检查，不代表用户价
值已通过。

## 用户问题与最小整改

| 检查维度         | 实际可见内容 / 影响                                                                                                                                                                                 | 最小必要整改与验收                                                                                                                                                    |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Task-first       | H1 和说明聚焦会议采集、转录复核、摘要、行动项，符合任务入口；候选之前先出现任务约束/能力。约束框仅提示“核对自己的硬性条件”，没有具体约束。                                                          | **P1**：补少量可由已核证据支持的会议平台/录音同意、隐私/留存、语言或导出选择条件。应直接帮助排除选项，不能展示空框或后台字段名；不扩建交互系统。                      |
| 候选差异         | Fathom 理由强调快速采集和跟进；Otter 强调搜索历史和协作；Fireflies 强调团队会议记忆/credits/auto-join/治理。前两项强适配、第三项有条件适配，但缺具体条件帮助选择。中文三项 rationale **均为英文**。 | **P1**：完成真实中文三条任务理由；每项一句“什么情况下优先考虑”，与下面的排除条件一致。不是把同一句泛描述翻译三遍。                                                    |
| 限制             | 两种语言的 **3/3 卡片**均显示“尚无已发布的具体限制；选择前请核对官方条款”对应 fallback；读者无法知道强适配为什么成立、何时不适合。                                                                  | **P1**：逐候选补一条真实适用前提与一条明确排除/重要限制，经受控编辑、审核后再展示；套餐/录音/保留等事实必须回查来源。不能根据“强适配”反推权益，也不在本轮直接改数据。 |
| 证据             | 每卡有官网链接、核验与复查日期；页面显示 8 个外链实例但仅 **6 个唯一 URL**。Otter Basic limits、Fireflies Free plan 各重复一次，日期不同；锚文本只显示域名，读者不知每个来源支持哪项判断。          | **P2**：显示简短来源用途（如套餐/摘要/免费限制），按同 URL 合并呈现、保留真实核验范围；不得将旧日期无依据刷新成最新。保持各产品的证据就近，不新增第二个证据区块。     |
| 下一步与内部语言 | 每卡详情入口明确，底部一个 Finder 下一步；但“仅展示当前已发布…适配关系”“尚无已发布…”暴露编辑状态，“Decision Finder”对中文读者缺直观任务语义。底部链接是普通 `/find-tools`，没有携带当前任务。       | **P2**：将编辑状态句改为用户能理解的证据边界；中文用“按预算和隐私继续筛选”等动作语言。保持一个下一步，明确需要再次选择会议任务；不承诺当前不存在的任务预选/预算能力。 |

“meeting-notes 已完整”限定为既有三候选图谱/发布结构；不能据此宣布限制、本地化或移动端用户体验完整。本审计不推翻历史关系
发布记录，只补当前可见用户价值缺口。

## 源码解释与移动端结构风险

源码：[Task 页面](<../app/[locale]/(with-footer)/tasks/[slug]/page.tsx>)。

- 候选理由使用 `text(tool.rationale, locale)`，当中文缺值时 fallback 到英文；生产中文确实显示英文，但本轮不通过源码推断
  数据库是否完全没有中文值，需后续编辑核查。
- 条件区只展示 `requiredConditions` / `disqualifiers`；为空时输出上述 fallback。**可见为空不等于底层 Tool Capability 没
  有任何限制证据**，应先审查映射与编辑字段，不重建证据系统。
- 约束只渲染已知 key 且值为 `true` 的字段。当前空提示可能来自 schema/key/value 或读模型，未单独证明数据库缺失，后续按最
  小范围定位。
- 主体 `max-w-6xl px-4`；上方两块 `md:grid-cols-2`、候选 `lg:grid-cols-3`，小视口在结构上为单列；来源链接 `break-all` 可
  换行，没有固定宽表格。这些降低横向溢出风险，但不证明 360/390px 实际无溢出。
- H1 `text-4xl`、卡片长英文与多行日期在窄屏有明显阅读/滚动成本，先修文本和来源重复。字号对比度、CTA 触摸区、实际溢出及键
  盘/读屏操作均 **N/A（未实测）**，不据此提出重做布局。

## 后续最小验收

另案只处理上述内容与必要映射，保持当前 noindex/sitemap 边界。验收要求：中英各三条具体理由、各有真实限制/条件；任务约束不
为空泛提示；来源可区分用途且同 URL 不重复占行；三个详情链接和一个下一步均同语言有效。实施后才做 360/390px 真实视觉检查。
无需新增页面类型、候选数量或基础设施。

## MTN-UX-01 交付收口（2026-10-07，已部署 / owner SQL 已应用 / 最终 QA_PASS）

本节记录最新交付状态，保留上方 2026-10-06 原始审计及下方开发阶段复现记录。**根据总控最终 QA 确认，`origin/main ca9867d0` 已部署，owner SQL 已应用，生产只读 verifier 三条 Fit 均为 `candidate_applied`，最终 QA_PASS。** 2026-10-07 本轮仅做两份文档收口，未执行部署或生产写入。

### 开发阶段复现与根因（2026-10-06）

再次 GET 英中生产页，复现中文三条英文理由、3/3 限制 fallback、8 个来源链接 / 6 个唯一 URL，以及空泛任务约束。Supabase 通过 `pub-03-readonly-run.mjs` 的 GET/HEAD 限制回读：

- 三条理由均有 `en` / `zh`，没有 `cn`；会议页读取只认 `cn`，不是数据库完全没有中文。
- `required_conditions` 与 `disqualifiers` 各有两条英文字符串，读模型只接受本地化对象，因而全部丢弃。原有录音告知、人工复核、自动入会、共享、保留/删除前提不能在补文案时删除。
- `constraint_schema` 实际是 role/export/team_size/data_sensitivity 的枚举；页面原先只读取布尔 key。会议 Finder **没有 budget 配置**，所以 CTA 不再承诺预算输入，也不承诺任务预选。
- 9 个 Fit evidence links 中 Fathom 旧首页 claim 已过复查期，现有读模型正确排除；8 个当前可见来源来自 6 个唯一 URL。本轮未刷新或删除旧 claim。

### 最小实现

1. 仅 meeting-notes 兼容 `zh → cn`，其他 cluster 的本地化行为不变。
2. [受控内容 SQL 候选](../db/supabase/manual/20261006_meeting_notes_user_value_candidate.sql)只更新现有三条 Fit 的双语理由、条件与排除项。每条增加具体套餐前提/限制，并将原有两条条件和两条排除要求转成 `en/cn/zh` 对象完整保留。Fathom 聚焦个人摘要及 Premium 跟进；Otter 聚焦日历摘要邮件及近期记录；Fireflies 聚焦自动入会及额度/存储管理。
3. 会议页约束显示摘要需求、会议长度/历史查阅、自动入会/存储/下载、共享接收者四个选择条件。每项仅在相应当前来源仍存在时展示；来源仍就近放在候选卡片，不新增证据区。事实来自本轮再次核对的官方 [Fathom 免费/Premium](https://help.fathom.video/en/articles/5290881)、[Otter Basic 限制](https://help.otter.ai/hc/en-us/articles/360047538094-Conversation-import-and-app-limits-on-the-Basic-free-plan)、[Otter 摘要邮件](https://help.otter.ai/hc/en-us/articles/9156381229079-Meeting-Summary-Overview)、[Fireflies Free](https://guide.fireflies.ai/articles/4027724828-learn-about-the-fireflies-free-plan)。本次浏览未改数据库核验日期。
4. 仅会议页按精确 URL 合并，显示来源用途，保留每个不同的真实核验/复查时间组合；不把较新日期扩展到旧 claim。
5. 内部发布措辞改成来源与套餐边界说明。三个详情入口和底部一个后续筛选入口保留同语言路径；明确下一页需再次选择会议任务，CTA 为“按隐私和导出要求继续筛选”。

### Owner 操作完成与安全边界

**Owner 已完成受控 SQL 应用，无待执行的一次性操作，不应重复执行。** 仓库保留手动候选及其审核人占位符作为交付记录，不将其改成自动 migration。应用后只读验证命令：

```sh
PUB03_ENV_FILE=/path/to/owner.env node scripts/pub-03-readonly-run.mjs pnpm exec tsx scripts/verify-meeting-notes-user-value-readonly.ts
```

2026-10-07 生产只读 verifier 结果：3/3 `candidate_applied`，替代开发阶段的 `owner_action_pending`；最终 QA_PASS。开发阶段已验证 6/6 指定证据为当前 verified / official / same-owner。SQL 要求精确原始 Fit 快照（含 `updated_at`）、同 owner 的原始事实/URL/核验日期及当前证据；加锁后任何漂移即整块失败。保留 fit_level/status/review_due_at、原有证据链接和数据库编辑历史触发器；新文案记录真实审核人及审核时刻，**不延长复查期限**。重复执行会安全拒绝。其他 Task、Tool Capability、任务配置、工具索引均不写入。

代码与内容均已应用；三条差异化双语理由、真实条件与限制、具体约束、来源用途/去重及单一下一步已通过最终 QA。

### 最终生产验收（2026-10-07）

根据总控最终 QA 回传记录：

- 英文 `/tasks/meeting-notes` 与中文 `/cn/tasks/meeting-notes` 均为 **200**，各保留 **三候选 / 6 unique sources**。
- 两页均为 **`noindex, follow` / self-canonical**；sitemap **126 URL / 0 Task URL**，工具索引和其他 Task cluster 不变。
- 生产只读 verifier 三条 Fit 均为 **`candidate_applied`**；代码已部署、owner SQL 已应用，**最终 QA_PASS**。
- **完整 360/390px 视觉仍为 N/A**；最终 QA_PASS 不代表移动端视觉已通过。

### 开发阶段验证结果（2026-10-06）

- `pnpm exec tsx scripts/test-meeting-notes-user-value.ts`：PASS（中英候选、治理要求保留、同 URL 合并且保留旧日期、来源用途、无来源不显示对应约束、其他 cluster 不变）。
- `pnpm exec tsx scripts/test-meeting-notes-user-value-sql.ts`：PASS（空白本地 PostgreSQL，实际执行后回滚；审核人、漂移、过期、跨 owner、重复执行门禁；三行双语结果、原有状态/期限、编辑历史；不同时区执行）。
- `pnpm exec tsc --noEmit`：PASS。首轮 Map 迭代器兼容错误已修复；三个运行时代码文件 ESLint PASS。
- `test:decision-task-page`、`test:decision-rules`、`test:decision-seo-release`、`test:tool-indexing`：全部 PASS。
- 完整 `pnpm run build`（经生产只读包装器）：PASS。仅已有 Browserslist 数据过旧提示，无编译错误。
- 本地 `next start` 以只读包装器连接现有数据，英中实际响应 HTML（JSDOM）检查 PASS：各 3 候选 / 6 唯一来源 / 中文理由可见 / 3 同语言详情 / 1 下一步，均 self-canonical + `noindex, follow`。这是 SQL 应用前的真实页面，不把候选限制文案冒充生产已生效。
- `git diff --check`：PASS。

### 残余风险 / 不能宣称完成的项目

- 部署、owner SQL 应用及最终 QA 已完成，无待执行 owner 操作。后续证据或内容变更仍需重新审核，不能重复应用旧快照或跳过 drift guard。
- 360/390px 真机/浏览器视觉、键盘/读屏验证仍为 **N/A**，不把结构测试或 HTML 检查冒充视觉 PASS。
- Fathom 旧首页 claim 过期是已存在的范围外数据状态；现有 freshness 过滤保留，不延伸为证据清理任务。
- 主工作区未提交的 `20261003_perplexity_plans_claim_correction.sql` 与 `20261005_admin_gemini_fit_rationale_recovery.sql` 未修改。
