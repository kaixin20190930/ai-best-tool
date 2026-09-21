# Character.AI 索引页维护交付

日期：2026-09-21  
状态：生产数据已提交，完整 build 与索引审计通过；等待代码部署与线上回读  
范围：既有 `/ai/character_ai` canonical 对应实体；不新增 URL，不修改 sitemap 或索引批准

## 为什么优先维护

- 生产条目已是 `published + continue_index`，但复核日期已到期。
- 最新 GSC 窗口中该页有 10 次展示、平均排名约 9.1，但没有点击，属于已有搜索机会而决策信息不足的页面。
- 数据库原记录没有 `features`、`use_cases`，标签只有 `website`；页面依赖旧历史兜底，未形成统一 Evidence / Decision 结构。

## 本轮更新

1. 保留固定 id、slug、canonical、媒体、分类、价格类型和 `continue_index`。
2. 更新中英文定位、适用与不适用人群、比较维度、限制、用例和标签。
3. 核验 Reading Mode：经验证未满 18 岁用户不能聊天，不再使用“受限聊天”的旧表述。
4. 核验 c.ai+：免费消息仍不限量；付费权益描述为排队、速度、支持、徽章和早期功能，并明确官方 FAQ 表示回复质量相同。
5. 训练数据退出权限只表述为官方文档明确覆盖 EEA / UK，不外推到所有地区。
6. Evidence Ledger 分开保存官方来源与独立来源；市场成熟度不等于完成真实使用基准测试。
7. 下次事实复核设为 `2026-10-21`。

## 架构修复

旧的 `historicalToolFactReviews` 只作为缺少结构化 editorial 数据时的安全兜底。只要数据库存在 `features.editorial.reviewedAt`，公开列表和详情正文就使用当前数据库版本，避免旧兜底覆盖新维护结果。

## 验收门禁

- 专项事实与结构契约测试。
- 历史兜底兼容测试。
- 数据库默认回滚演练，并断言所有受保护字段不变。
- TypeScript、完整生产 build、索引一致性和生产 SEO smoke。
- commit 后回读数据库与中英文生产页；确认 canonical、index 状态与 sitemap 边界不变。
