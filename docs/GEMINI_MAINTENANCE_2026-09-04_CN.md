# Gemini 官方事实维护

日期：2026-09-04。归属主计划 MAINT-04；本轮已完成，不代表全部历史工具维护完成。

## 问题与修正

- 固定既有工具：`ccddfbaa-b7eb-4192-b9d6-aafc40488719` / `gemini`。
- 原正文误导为主要手机使用场景，中文正文实际复制英文；features 和 next_review_date 为空。
- 已更新真实中英文摘要和正文，明确评估对象是 Gemini Apps，不混同开发者 API 或所有 Gemini 品牌产品。
- 补充账号资格、个人账号用量与隐私边界、同任务对照试用建议、官方来源和核验范围。
- 官方事实核查日 2026-09-04，下次事实复查 2026-09-18。日期是维护排期，不代表新建定时任务。
- 不填写 marketValidation，不声称亲自实测、独立采用评分或用户账号资格已经验证。

## 官方证据

1. [网页与账号访问](https://support.google.com/gemini/answer/13278668?hl=en)：支持网页入口，部分功能不要求登录；账号、地区与管理权限影响访问。
2. [用量与升级](https://support.google.com/gemini/answer/16275805?hl=en)：个人账号用量与计算消耗有关，付费不等于无限使用。复查时重新确认刷新周期和周限额，不硬编码价格或模型配额。
3. [隐私说明](https://support.google.com/gemini/answer/13594961?hl=en)：关闭活动记录不等于零留存，反馈另有使用边界；工作/学校账号不直接套用个人账号条款。

## 数据与 SEO 边界

- 只更新 content、detail、features、next_review_date、updated_at；数据库随摘要变动自动更新 search_vector。
- ID、slug、URL、媒体、标签、定价字段、published 与 continue_index 均通过更新前后等值断言。
- 未新增工具或索引批准；批准保护保持 paused=true，历史可证实放行仍为 12。
- 中英文 canonical 不变，未出现 noindex，hreflang 存在，两条 URL 仍在 sitemap；总量仍为 162。
- 缺明确复查日期的 published 工具由 22 降为 21，不等于其余工具全部未验证或本轮获得市场验证。

## 自动验收与运行

```sh
pnpm exec tsx scripts/refresh-gemini-review.ts --check
pnpm exec tsx scripts/refresh-gemini-review.ts
pnpm run test:tool-decision-card
pnpm run build
pnpm exec tsx scripts/refresh-gemini-review.ts --commit
pnpm exec tsx scripts/refresh-gemini-review.ts --status
SEO_BASE_URL=http://localhost:3017 pnpm exec tsx scripts/refresh-gemini-review.ts --pages
SEO_BASE_URL=https://aibesttool.com pnpm exec tsx scripts/refresh-gemini-review.ts --pages
pnpm exec tsx scripts/maintain-tool-review-schedules.ts --inventory
pnpm run index-release:guard -- --status
```

- 默认执行事务回滚；--commit 才写入固定 Gemini 行，--status 为只读验收。
- 未知参数、旧数据基线改变、已有人工编辑、索引或身份字段意外变化均失败；重复执行不再次更新。
- 首次预演因搜索派生字段变化被断言回滚，修正字段范围后预演、正式应用、独立回读及幂等检查通过。
- 页面验收剔除 script 后检查实际正文，避免只有序列化数据包含新内容的假阳性。索引页按现有 metadata 默认索引行为检查，不强求显式 robots=index。
- 本地完整 build、Decision Card 回归、双语本地及线上 HTML 验收通过。生产数据库内容已经生效；脚本和文档随本次代码提交归档。

## 下一步

继续 Notion、Poe 的既有页面证据与身份核对，不用批量新增工具代替维护；Gemini 下次检查额度、访问和隐私政策是否变化，真实试用与市场证据仍需另行核验。
