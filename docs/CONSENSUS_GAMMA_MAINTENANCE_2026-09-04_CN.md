# Consensus 与 Gamma 到期维护

日期：2026-09-04。归属：[主计划](./MASTER_OPTIMIZATION_TRACKER_CN.md)、[维护审计](./MAINTENANCE_AUDIT_2026-09-04_CN.md) MAINT-03。

## 本轮范围

生产两页均为 published / monitor。复核官方套餐规则、主要功能与决策边界，补可操作的试用检查，并安排下一次复查。不新增 URL，不放开索引，不声称做过登录后的亲自试用，也不重置既有市场验证。

| 项目 | 已核对内容 | 更新 | 仍有边界 |
| --- | --- | --- | --- |
| Consensus | 套餐、论文覆盖、全文权限、Deep Review | 免费 Deep 同时消耗 Pro 消息；先查熟悉问题、核对原文、保留检索词 | 独立论文目前返回验证码页，未绕过；不更新市场验证日期 |
| Gamma | 席位/credits、导入/导出、数据训练设置 | 用旧演示稿检查导入与最终 PPTX；免费 credits 不定期刷新；敏感上传前检查设置 | 定价页面未获取可靠金额，不发布推测价格；没有做付费或导出实操 |

## 来源与结论

### Consensus

当前官方套餐帮助中心的 Pro $20/月或 $144/年、Deep $65/月或 $540/年与生产正文一致，因此不改价格。官方数据库说明支持原有论文规模及“分析全文不等于用户取得下载权限”的区分。Deep 文档进一步解释免费额度的联动消耗，以及全文标记的含义。本轮补充试用方法属于编辑建议，不是对准确率的实测保证。

- [官方套餐](https://help.consensus.app/en/articles/10087865-subscription-plans)
- [数据库与全文访问](https://help.consensus.app/en/articles/10055108-consensus-research-database)
- [Deep Review 使用说明](https://help.consensus.app/en/articles/11740827-how-to-use-deep-review)
- [原独立论文来源](https://pmc.ncbi.nlm.nih.gov/articles/PMC12318603/)：本轮返回验证码页，仅保留旧引用，不刷新其验证结论。

### Gamma

官网和帮助中心支持按用户计费、免费 credits 不定期补充、普通导入主要保留文本、导出仍须复核的边界。个人工作区数据训练默认开启但可退出，Team/Business 自动排除。产品页面没有具体价格数字，本轮也不凭页面未读到金额推测价格。

- [套餐规则](https://help.gamma.app/en/articles/8077107-how-can-i-upgrade-my-gamma-subscription)
- [导入规则](https://help.gamma.app/en/articles/11047840-how-can-i-import-slides-or-documents-into-gamma)
- [导出规则](https://help.gamma.app/en/articles/8022861-what-s-the-easiest-way-to-export-my-gamma)
- [数据训练设置](https://help.gamma.app/en/articles/12281928-does-gamma-use-my-content-to-train-its-ai-features)
- [定价页](https://gamma.app/pricing)：可读能力说明不等于金额和最终账单已验证。

## 实现与记录

- `lib/config/toolMaintenanceReviews.ts` 保存本次范围、日期、缺口、来源和双语试用提示。
- 实际官方事实快照直接引用这些提示，新增来源链接，不增加独立重复模块。
- `features.maintenanceReview` 保存有明确范围的维护记录；不覆盖 `features.editorial` 或 `features.marketValidation`。正文不自动改写，避免将试用建议误装成实测结果。
- 两条 `next_review_date` 定为 2026-09-07；这是待复查日期，不是自动发布或自动恢复索引日期。

## 验收命令

```sh
pnpm exec tsx scripts/test-tool-maintenance-reviews.ts
pnpm run test:priority-tool-evidence
pnpm exec tsx scripts/apply-tool-maintenance-reviews.ts
pnpm run build
SEO_BASE_URL=http://localhost:3017 pnpm exec tsx scripts/test-tool-maintenance-reviews.ts --pages
pnpm exec tsx scripts/apply-tool-maintenance-reviews.ts --commit
pnpm exec tsx scripts/apply-tool-maintenance-reviews.ts --status
SEO_BASE_URL=https://aibesttool.com pnpm exec tsx scripts/test-tool-maintenance-reviews.ts --pages
```

数据库脚本默认事务回滚，`--commit` 才写入，`--status` 只读验证。断言除维护记录、下次复查日期和更新时间外，所有字段均保持不变；同一记录重复应用不重复更新日期。页面测试剔除 script/RSC 后检查真实可见提示、来源、canonical、noindex 和 sitemap 排除。

## 后续

本轮数据库预演、正式应用及独立连接回读通过；本地生产四页面可见提示、来源、canonical、noindex 与 sitemap 排除通过。整页编辑与市场日期保持 9 月 1 日；维护记录明确为官方资料核查，9 月 7 日继续复查缺口。

9 月 7 日复查来源可读性和未解决的价格核对项；若仍不可验证，记录原因而不是伪造完成。市场评价、实操试用、索引批准与 CHG-02 变化账本是独立任务，不因本轮维护自动完成。无需用户重新执行数据库迁移；真实试用结果仍应由实际体验提供。
