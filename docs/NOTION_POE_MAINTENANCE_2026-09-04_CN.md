# Notion 与 Poe 官方事实维护

日期：2026-09-04。归属：[主计划](./MASTER_OPTIMIZATION_TRACKER_CN.md) MAINT-04。
状态：两条既有工具本轮内容维护完成，生产数据已应用；不等于独立市场验证完成。

## 修正范围

| 工具 | 原问题 | 本轮修正 | 下次复查 |
| --- | --- | --- | --- |
| Notion | 中文复制英文，AI 只作泛泛描述，缺套餐及数据边界 | 真实中文；保留工作区产品身份，补 AI 权益、额度、权限与按任务试用步骤 | 2026-09-18 |
| Poe | 中文复制英文，错误声称手机应用尚未推出，笼统保证所有对话保密 | 修正网页/iOS/Android，补点数预算、购买渠道管理和隐私盾牌差异，增加双 Bot 对照试用 | 2026-09-18 |

既有 ID：Notion `fffb8714-bf45-4e61-bbee-fde1c6f97fd8`；Poe `0dfc49cb-f226-41fe-896a-8a881f5c2761`。

## 官方证据与编辑边界

- [Notion AI FAQ](https://www.notion.com/help/notion-ai-faqs)：核对套餐与额度，不把“包含 AI”解释为无限使用。
- [Notion AI 数据说明](https://www.notion.com/help/notion-ai-security-practices)：按套餐和功能核对留存，不把 Enterprise 默认设置推广为所有功能的零留存承诺。
- [Poe 购买 FAQ](https://help.poe.com/hc/en-us/articles/19945140063636-Poe-Purchases-FAQs)：移动应用、点数和订阅管理渠道。
- [Poe 隐私中心](https://poe.com/pages/privacy-center)：Bot 权限与盾牌影响数据处理，不能承诺所有对话完全保密。

试用步骤属于编辑建议，未宣称实际操作过用户账号。未核验地区结账金额、实际点数余额或独立采用情况；不填 marketValidation，不赋市场评分。不新建 Notion AI 子页面，不将 Poe 模型接入等同于提供商原生订阅的全部权益。

## 写入保护

脚本 `scripts/refresh-notion-poe-review.ts` 默认在事务中预演后回滚；`--commit` 原子更新两条固定记录，任一基线或断言失败则一起回滚。

- 旧摘要与正文的数据库摘要值必须匹配，features 和排期需为空；已有编辑不得覆盖。
- 只允许修改 content、detail、features、next_review_date、updated_at；数据库自动派生 search_vector。
- ID、slug、官网、媒体、价格字段、标签、published/continue_index 等其余字段前后完全一致。
- 已应用版本只验收，不重复改 updated_at；人工后续修改导致不匹配时停止。
- 下次复查是数据库日期，不代表创建了新的自动化或未来必定执行。

## 验收结果

本轮离线双语检查、事务预演、完整 build、Decision Card 回归、正式应用和独立连接回读已通过。
四个本地生产模式及线上页面检查通过：剔除脚本后正文真实可见，旧错误文案消失，来源/日期存在，canonical/hreflang 保持，无 noindex。
四条既有 URL 仍在 sitemap，总量 162。历史缺排期数 21 → 19；索引保护 paused=true，历史可证实放行数仍 12。

```sh
pnpm exec tsx scripts/refresh-notion-poe-review.ts --check
pnpm exec tsx scripts/refresh-notion-poe-review.ts
pnpm run test:tool-decision-card
pnpm run build
pnpm exec tsx scripts/refresh-notion-poe-review.ts --commit
pnpm exec tsx scripts/refresh-notion-poe-review.ts --status
SEO_BASE_URL=http://localhost:3017 pnpm exec tsx scripts/refresh-notion-poe-review.ts --pages
SEO_BASE_URL=https://aibesttool.com pnpm exec tsx scripts/refresh-notion-poe-review.ts --pages
pnpm exec tsx scripts/maintain-tool-review-schedules.ts --inventory
pnpm run index-release:guard -- --status
```

## 下一项

先核对 Adobe、Salesforce Einstein 的实际产品范围、现有静态内容与官网证据，再决定维护内容；不直接把品牌页当成单一 AI 产品，也不为补齐日期伪造实测或市场结论。
