# 历史工具复查排期审计

日期：2026-09-04。归属：[主计划](./MASTER_OPTIMIZATION_TRACKER_CN.md)、[维护审计](./MAINTENANCE_AUDIT_2026-09-04_CN.md) MAINT-04 / MAINT-05。

## 本轮范围

只补已有核验依据对应的缺失排期，不重新验证产品事实，不修改正文、市场分数、核验时间或索引批准。不把今日执行维护当成今日完成产品核验。

数据库初始快照：37 个 published 工具，23 个缺少 next_review_date。其中只有 Emdash 同时具有可用的数据库 editorial.reviewedAt、sourceUrl 与市场验证记录；其余 22 个缺少这些数据库字段。这不代表页面没有静态官方事实、历史来源或其他证据，需要逐页核对。

## Emdash

- 固定生产 ID：`6f62a262-3cb3-4201-9127-b1c4eda6438f`。
- 已有编辑核验日期：2026-09-01；已有来源 `https://emdash.com/`；市场验证日期同为 2026-09-01。
- Decision Card 的默认事实复查周期是 30 天，决策复查为 90 天。对应 `lib/services/toolDecisionCard.ts` 与 `lib/services/intelligence/reviewSchedule.ts`。
- 本轮将缺失的数据库事实复查日期补为 **2026-10-01**；不从今天重新起算，也不改动未来可能存在的人工排期。公开页面原先可能已显示推导出的日期，本次是补齐数据库明确字段，不宣称新增页面功能。
- 更新只允许 next_review_date 与 updated_at；数据库原正文、features、index 状态等全部保持不变。

## 剩余项分类（初始 22，当前 21）

后续 Gemini 真实官方事实维护已完成，补齐中英文正文、来源和 9 月 18 日复查日期；非独立市场验证。缺排期现为 21，详细验收见 [Gemini 维护](./GEMINI_MAINTENANCE_2026-09-04_CN.md)。本文件原 Emdash 只补排期的范围仍保留，Gemini 是另一次实质内容维护。

执行结果：生产补齐已完成并经独立连接回读，Emdash 为 2026-10-01；只读 inventory 确认缺排期为 22。专项测试、Decision Card 回归、完整 build 均退出 0。无新增工具或索引批准，其他历史条目未被写入。

以下是维护执行顺序，不是已核验结论或上线批准；未完成核对前不修改其状态。

| 顺序 | 工具 | 下一动作 | 状态 |
| --- | --- | --- | --- |
| 1a | gemini | 官方访问、额度、隐私及双语内容维护，保留索引与身份 | 本轮完成；9 月 18 日复查，市场验证未赋值 |
| 1b | notion、poe、adobe、salesforce_einstein | 核对页面静态证据与数据库字段，确认同一产品和真实检查日期后再补录 | 待执行 |
| 2 | openai、gpt_4o、chatgpt-mac、sora | 先确认品牌、模型、客户端与独立产品实体关系；本轮不重命名、不合并 URL | 待执行 |
| 3 | character_ai、artiversehub-ai、fastimage-ai-sketch-to-image、honeydo、shutterstock、suno_aI、tattooai-design、viggle、woy-ai、shop_your_ai_powered_Shopping_assistant | 核对官网可用性、实际产品范围、原有证据和市场信号；按证据决定是否补录或另行复核 | 待执行 |
| 4 | aigirl-best、anime-girl-studio、undressing_ai | 先确认实际服务类型、安全与合规边界，不自动推广或补“已验证” | 待执行 |

没有充分核验依据的条目可以进入人工维护队列，但不能统一填今日 reviewedAt、虚构 sourceUrl 或提升市场分数。缺日期本身不触发本轮批量 noindex；索引仍遵循独立政策和暂停规则。

## 可重复执行的验证

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
