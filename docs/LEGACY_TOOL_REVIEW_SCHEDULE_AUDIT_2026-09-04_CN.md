# 历史工具复查排期审计

日期：2026-09-04。归属：[主计划](./MASTER_OPTIMIZATION_TRACKER_CN.md)、[维护审计](./MAINTENANCE_AUDIT_2026-09-04_CN.md) MAINT-04 / MAINT-05。

## 初始范围（Emdash阶段历史记录）

只补已有核验依据对应的缺失排期，不重新验证产品事实，不修改正文、市场分数、核验时间或索引批准。不把今日执行维护当成今日完成产品核验。

后续对象审计及实质内容维护为独立阶段，见下文；当前缺排期19，本轮RC-04只读回查再次确认，未执行任何日期写入。

数据库初始快照：37 个 published 工具，23 个缺少 next_review_date。其中只有 Emdash 同时具有可用的数据库 editorial.reviewedAt、sourceUrl 与市场验证记录；其余 22 个缺少这些数据库字段。这不代表页面没有静态官方事实、历史来源或其他证据，需要逐页核对。

## Emdash

- 固定生产 ID：`6f62a262-3cb3-4201-9127-b1c4eda6438f`。
- 已有编辑核验日期：2026-09-01；已有来源 `https://emdash.com/`；市场验证日期同为 2026-09-01。
- Decision Card 的默认事实复查周期是 30 天，决策复查为 90 天。对应 `lib/services/toolDecisionCard.ts` 与 `lib/services/intelligence/reviewSchedule.ts`。
- 本轮将缺失的数据库事实复查日期补为 **2026-10-01**；不从今天重新起算，也不改动未来可能存在的人工排期。公开页面原先可能已显示推导出的日期，本次是补齐数据库明确字段，不宣称新增页面功能。
- 更新只允许 next_review_date 与 updated_at；数据库原正文、features、index 状态等全部保持不变。

## 剩余项分类（初始 22，当前 19）

最新：Notion、Poe 完成官方事实维护及真实双语内容，9 月 18 日复查。当前缺排期 19，以下 21/22 为历史快照；详见 [Notion/Poe 维护](./NOTION_POE_MAINTENANCE_2026-09-04_CN.md)。

历史快照（Gemini阶段）：真实官方事实维护完成，补齐中英文正文、来源和9月18日复查日期；非独立市场验证。当时缺排期21，当前19，详细验收见 [Gemini 维护](./GEMINI_MAINTENANCE_2026-09-04_CN.md)。本文件原Emdash只补排期的范围仍保留，Gemini是另一次实质内容维护。

执行结果：生产补齐已完成并经独立连接回读，Emdash 为 2026-10-01；只读 inventory 确认缺排期为 22。专项测试、Decision Card 回归、完整 build 均退出 0。无新增工具或索引批准，其他历史条目未被写入。

以下是维护执行顺序，不是已核验结论或上线批准；未完成核对前不修改其状态。

| 顺序 | 工具 | 下一动作 | 状态 |
| --- | --- | --- | --- |
| 1a | gemini | 官方访问、额度、隐私及双语内容维护，保留索引与身份 | 本轮完成；9 月 18 日复查，市场验证未赋值 |
| 1b | notion、poe | 官方用量、权限/隐私及双语内容维护，保留索引与身份 | 本轮完成；9 月 18 日复查，市场验证未赋值 |
| 1c | adobe、salesforce_einstein | 对象/重复检查及线上链接审计已完成；按下方处置分支补 URL 级数据 | 当前条目未通过准入；GSC 明细和最终处置未完成，生产未改 |
| 2 | openai、gpt_4o、chatgpt-mac、sora | 先确认品牌、模型、客户端与独立产品实体关系；本轮不重命名、不合并 URL | 待执行 |
| 3 | character_ai、artiversehub-ai、fastimage-ai-sketch-to-image、honeydo、shutterstock、suno_aI、tattooai-design、viggle、woy-ai、shop_your_ai_powered_Shopping_assistant | 核对官网可用性、实际产品范围、原有证据和市场信号；按证据决定是否补录或另行复核 | 待执行 |
| 4 | aigirl-best、anime-girl-studio、undressing_ai | 先确认实际服务类型、安全与合规边界，不自动推广或补“已验证” | 待执行 |

没有充分核验依据的条目可以进入人工维护队列，但不能统一填今日 reviewedAt、虚构 sourceUrl 或提升市场分数。缺日期本身不触发本轮批量 noindex；索引仍遵循独立政策和暂停规则。

## Adobe / Salesforce Einstein 收录对象复核

后续RC-05A/B：共享范围提示及Salesforce对比入口之后，已继续统一本地范围正文、列表/静态兜底和metadata，并撤下两页通用评分/比较卡及单软件schema。数据库原文写入、生产验收及最终索引处置仍未完成，详见 [范围澄清](./LEGACY_PRODUCT_SCOPE_CLARIFICATION_2026-09-04_CN.md)，不减少缺排期19项。

2026-09-04 只读数据库及官方资料审计，依据 [唯一准入规范](./BEST_DIRECTORY_POSITIONING_AND_INTAKE_CN.md)。两条是历史公开条目，本轮不等于批准继续推荐，也不直接改 URL 或索引。

| 对象 | 已发现问题 | 准入结论 | 下一步与完成条件 |
| --- | --- | --- | --- |
| adobe | 标题 Adobe、官网品牌首页；正文介绍设计/PDF/营销等公司业务，中文复制英文，未界定 AI 产品 | 当前泛品牌条目不符合单一工具准入；独立采用证据本轮未核验 | 查站内 Firefly 等产品重复情况、GSC/内链与历史关系；提出保留/缩小范围/合并等处置方案，再验收，不直接改名为 Firefly |
| salesforce_einstein | 官网指向 Salesforce 日本站首页；正文混合 Einstein、Einstein 1 Platform 和应用开发概念，中文复制英文，缺明确产品入口及依赖 | 存在真实 AI 能力，但当前记录对象与决策边界不清，完整准入未通过 | 明确具体平台或能力、账号/许可/部署依赖与官方来源；核对更名范围及独立市场证据，再决定页面处置 |

- [Adobe Firefly 官方页](https://www.adobe.com/products/firefly.html) 可证明具体 AI 产品存在，不代表其市场准入已完成或可以继承 Adobe 泛品牌记录。
- [Salesforce 官方服务范围](https://compliance.salesforce.com/en/services/agentforce-einstein-platform) 表明 Einstein/Agentforce 涉及多项服务；[Agentforce Assistant 说明](https://www.salesforce.com/agentforce/einstein-copilot/) 的更名关系只针对相应产品，不能推广到整个 Einstein 体系。
- 负责人：Codex。待完成：对象与重复意图核对、必要的 GSC 判断、处置方案、实施及验收。缺数据需明确标为未知，不由品牌知名度推断。
- 本轮仅完善规范和记录初步结论；数据库 status/page_quality_status、工具正文、排期、canonical 与 sitemap 均未改。缺排期仍为 19。

## 可重复执行的验证

### 2026-09-04 对象与影响面核对结果

本节追加只读核查结果，不代表下方 Emdash 写入脚本适用于 Adobe/Salesforce。

| 检查 | 结果 | 范围与限制 |
| --- | --- | --- |
| 数据库产品查重 | 按 name/title/url 搜索 adobe、firefly、salesforce、einstein、agentforce、photoshop、acrobat，只匹配两条历史记录 | 覆盖 tools 表所有状态；未发现这些关键词对应的具体产品，不等于排除一切别名或外部候选池 |
| 静态数据 | lib/data.ts 同时存在 Adobe 和 Salesforce Einstein 的列表/详情兜底数据 | 后续身份或正文处置须同步，不能仅改单条数据库记录 |
| 已知代码引用 | Salesforce 专属 comparison guide 的 preferredToolNames 与工具说明引用 salesforce_einstein | 不能仅改 slug 而遗漏指南；未发现 Firefly/Agentforce 独立工具配置 |
| 生产工具页 | /ai/adobe、/cn/ai/adobe、/ai/salesforce_einstein、/cn/ai/salesforce_einstein 均 200，self-canonical，未输出 noindex | 这是允许索引的技术状态，不代表 Google 已收录 |
| 生产内链抽查 | 中英文 Salesforce comparison guide 均 200/noindex，均有指向原工具页的实际链接 | noindex 指南仍可被用户使用，处置不能制造断链 |
| Explore 抽查 | 中英文首屏 HTML 未提取到两条目标工具路径 | 不是全站无内链的证明，未穷举分页/筛选/动态推荐 |
| sitemap | 总数 162，包含两条工具的四个语言 URL，未匹配到 Firefly/Agentforce URL | 未改 sitemap 或批准索引 |
| GSC 原始数据 | 当前 Downloads 未找到历史 2026-08-31 文件，仓库仅有汇总；当前本地配置也缺少完整 GSC API 读取凭据 | 两页点击、展示、query、Google 选定 canonical 为未知，不填写 0，不推断没有价值 |

固定 ID：Adobe `eca3ba76-9e1c-449d-bfa8-43e1a390d681`；Salesforce Einstein `44dd71ec-57fb-4d1b-b702-002693fb7c36`。

### 处置结论与下一步

- Adobe：当前泛品牌条目不应作为已完成核验的单一 AI 工具继续推广；Firefly 只进入具体产品候选复核，不直接改名或 301 到 Firefly。若旧 URL 有明确任务意图且可忠实满足，可评估范围修正；若无合适独立意图或补足路径，建议保留可访问历史说明并 noindex、移出 sitemap。具体变更尚未执行。
- Salesforce Einstein：优先保留原产品体系身份做范围厘清，不把整个 Einstein 改为 Agentforce。只有能明确 AI 任务、依赖、许可和独立证据才进入内容修正；若无法形成有决策价值的工具页，再评估 noindex。其 comparison guide、静态兜底和数据库须作为同一影响面验收。
- 不创建新的品牌 hub 来绕过准入，不把流量多少当作事实正确性或准入豁免。GSC 用于选择迁移路径、保护已有搜索意图，而不是证明泛品牌页面已经合格。
- 需要的数据最小范围：四个原工具 URL 最近 28 天表现（页面及其 query，注明日期与筛选条件）；如已有 URL Inspection，补 Google 选定 canonical/收录状态。只有 7 天数据可先参考但不用于直接迁移；没有 Inspection 时明确未知，不阻止独立事实纠错。

| 项目 | 状态 | 后续责任 |
| --- | --- | --- |
| 对象关系与重复初筛 | 已完成 | Codex；新具体产品仍需独立准入 |
| 已知静态引用及 8 个生产页面抽查 | 已完成 | Codex；不是全站穷举内链 |
| URL 级 GSC 机会与迁移风险 | 待数据 | 用户重新提供文件或上述四页明细，Codex 分析 |
| 最终页面/索引处置及验收 | 未实施 | Codex；先补决策依据，禁止误标完成 |
| 登录入口重复语言前缀 | 已修复并生产验收 | Codex；373d2336，182页/5406处内部链接通过；真实账号OAuth未代测 |

历史发现：四个工具页实际href曾出现`/en/en/login?redirect=/en/ai/...`或`/cn/cn/login?redirect=/cn/ai/...`。后续已完成全站共享链接修复、浏览器点击登录入口及生产扫描，详见 [导航验收](./LOCALIZED_NAVIGATION_AUDIT_2026-09-04_CN.md)。只验证入口与返回路径，没有代替用户完成真实账号OAuth；不将导航完成计作对象核验完成。

### 原 Emdash 排期运行命令

```sh
pnpm exec tsx scripts/maintain-tool-review-schedules.ts --test
pnpm exec tsx scripts/maintain-tool-review-schedules.ts --inventory
pnpm exec tsx scripts/maintain-tool-review-schedules.ts
pnpm run build
pnpm exec tsx scripts/maintain-tool-review-schedules.ts --commit
pnpm exec tsx scripts/maintain-tool-review-schedules.ts --status
```

- `--test` 无数据库写入，覆盖 30 天规则、人工日期优先、空/非法日期和闰年。
- `--inventory` 只读列出当前缺失项；默认模式事务回滚，`--commit` 才更新固定 Emdash 条目，`--status` 只读验收。
- 锁等待 5 秒、语句超时 30 秒；证据日期或来源改变则失败，已有排期不覆盖。
- 回读断言排期正确、其他业务字段完全不变，重复执行更新 0 行。

本轮不要求用户执行新 SQL，也没有创建新的定时自动化；October 1 是排期字段，不意味着届时必定有自动执行任务。
