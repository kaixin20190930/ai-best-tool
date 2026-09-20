# HeyGen 延期补发交付（2026-09-20）

状态：`PRODUCTION_VERIFIED / PUBLISHED_MONITOR / NOINDEX`

## 发布结论

HeyGen 原 2026-09-14 发布槽已于 2026-09-20 完成补发。唯一生产实体为 `4f26ce1c-08fd-4f99-97c9-21864c35bf94`，状态为 `published + monitor`，下次事实复核日为 2026-10-20。

本次公开不构成索引批准：英文 `/ai/heygen` 与简体中文 `/cn/ai/heygen` 均保持 `noindex`，没有进入 sitemap。页面采用英中双语内容；数据库中的 `zh/cn` 是同一简体中文内容的兼容键，不是第三种语言。

## 已核验边界

- 网页套餐：Free、Creator、Pro、Business 和 Enterprise 当前价格与 credits。
- 计费边界：网页订阅 credits 与 API-key PAYG / Enterprise API 计费分离，OAuth 可能消耗网页订阅额度。
- 运行边界：PAYG 与 Enterprise 并发、429、输入大小、脚本和场景时长。
- 权利边界：Digital Twin 同意流程不替代站外授权；照片和提示词数字人没有同一 API 步骤也不代表获得许可。
- 数据边界：Enterprise 默认不训练，非 Enterprise 需要主动退出；不能泛化套餐默认值。
- 输出边界：Free 输出当前只限个人、非商业和内部评估；付费输出仍需清除底层素材和肖像权。
- 素材边界：现有蓝色 Hg 图与封面是 AI Best Tool 编辑识别图，不是官方 Logo、产品截图或实测输出。

## 分类纠偏

预审曾把存储分类写为不存在的 `video`。事务发布器在正式写入前阻断，生产未产生脏数据。只读核对确认 Synthesia、Runway 与 Midjourney 均使用 `design-art`，因此 HeyGen 沿用该正式分类，并通过 `video-generation`、`ai-avatar` 等标签保留发现语义；没有临时创建新分类。

## 验收结果

- `pnpm run test:heygen-release`：通过。
- `pnpm exec tsc --noEmit`：通过。
- `pnpm run test:seo-architecture`：通过。
- `pnpm run test:index-consistency`：通过。
- `pnpm run build`：通过。
- 发布 preflight：生产无重复实体，fallback 为 self-canonical/noindex 且不在 sitemap。
- 事务 rollback：完整写入、分类和 `en/zh/cn` 兼容回读通过。
- 正式 commit：成功写为 `published + monitor`。
- 独立生产审计：`0 failure(s)`。
- 生产 SEO smoke：通过，sitemap 保持 118 条。
- 全站索引一致性：62 条工具、49 条公开、13 条索引、36 条暂停索引；49 个公开工具页面检查 0 问题。

## 后续动作

1. HeyGen 最早在成熟工具 48-72 小时观察期后进入独立索引评审，但不自动批准。
2. 2026-10-20 或价格、credits、同意、训练或 API 政策变化时提前复核。
3. 主线转入 Glean 发布日事实复核与受控发布，继续保持公开与索引解耦。
