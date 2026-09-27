# Descript 单项受控发布（2026-09-27）

状态：生产已提交；`published + monitor/noindex`。固定 ID：`a8c41d20-6b48-4f75-9f17-7e34c84619d2`。原最早槽位 `2026-09-23` 保留，不改写为实际发布日期。

## 当日事实复核

- [官方价格](https://www.descript.com/pricing)仍显示 Free 的每月 1 media hour 与一次性 100 AI credits；Hobbyist、Creator、Business 的年付折算每人每月分别为 16、24、50 美元，月付分别为 24、35、65 美元，对应每月 10/30/40 media hours 与 400/800/1,500 AI credits。Enterprise 为定制。
- [现行用量说明](https://help.descript.com/billing-payments-plans/track-and-understand-your-media-minutes-and-ai-credits)将 media minutes 与 AI credits 分开计量；合资格 Editor 席位增加共享 Drive 额度，未用额度不结转。手动效果可能随任务规模计费，Underlord 消耗随模型和实际执行工作变化。发布包原有的“avatar 每分钟约 67 credits”来自旧版说明，现行页面不再列出，因此已移除，避免把历史示例当作当前费率。
- [AI Speakers 条款](https://www.descript.com/terms)要求说话人授权，禁止用未同意者的音频创建声音模型；[AI Speakers 说明](https://help.descript.com/script-editing/speakers)允许合规的自定义与 stock 声音用于商业内容。[条款](https://www.descript.com/terms)同时提示输出可能不唯一、不准确或侵犯第三方权利，用户须自行审核。
- [隐私政策](https://www.descript.com/privacy)区分项目服务处理、关闭 Share Data with Descript 后的产品改进用途，以及 AI Speaker 训练音频去标识研究和员工/承包商质量复核。Enterprise 的训练退出、留存与治理能力须按套餐和合同确认。
- 唯一产品仍是 Descript 文本式音视频编辑工作区。Underlord、AI Speakers、voice clone、avatars 和 dubbing 仅是其功能，不建立独立 canonical。

## 发布执行与验证

1. 生产只读 preflight：Descript 实体 0；英文和中文保留路由均为 HTTP 200、自 canonical、noindex；sitemap 匹配 0。
2. 统一发布器先执行默认事务 `ROLLBACK`，完整三语言字段回读通过；后执行 Descript 专项测试、候选发布契约、工具索引、索引一致性契约、SEO 架构、TypeScript 与完整 Next.js build，均通过。
3. 生产索引一致性审计在提交前通过：65 条工具、17 个可索引工具、126 条 sitemap URL、0 个重复 canonical、0 个页面问题。
4. 显式 `--commit` 成功；数据库回读唯一 ID 的英中简三语言字段、素材、`reviewedAt=2026-09-27`、`nextReviewDate=2026-10-27`，状态为 `published + monitor`。
5. 提交后 online verify 通过：唯一实体，英中页面 HTTP 200、自 canonical、noindex、Decision Card 存在，sitemap 仍排除 Descript。

## 发布边界

本次仅公开单一 Descript 实体；不批准 `continue_index`，不修改索引政策或 sitemap 范围。页面素材是 AI Best Tool 自制编辑标识，不是 Descript 官方 Logo 或产品截图。公开文档核验不等于付费 Drive、Enterprise 合同、实际 credit 消耗或成片质量实测；下次事实复核为 2026-10-27。
