# 候选工具统一发布流水线与索引一致性审计

日期：2026-09-07。范围：Synthesia、Replit、Otter.ai、Lovable、Midjourney，以及全站公开工具 URL。

## 目标

1. 将五个候选从各写一套数据库脚本，改成同一套可回滚、可查重、带日期门禁的发布流程。
2. 工具公开与索引批准彻底分离。首次发布只能写成 `published + monitor`，不得自动进入 sitemap。
3. 用只读审计核对数据库索引决策、页面 robots、canonical 与生产 sitemap，发现漂移即失败。

## 发布流水线

### 输入

- 预审：`data/collection/<slug>-preaudit-2026-09-07.json`，记录证据、边界和最早发布日。
- 发布载荷：`data/collection/<slug>-release.json`，只在发布日复核后创建，包含双语正文、素材、分类、核验日和下次复查日。
- 生产环境：`.env.local` 中的数据库连接；密钥不写入报告或日志。

### 阶段

| 阶段 | 动作 | 是否写生产 |
| --- | --- | --- |
| `validate` | 校验五个预审文件、slug、日期、来源和关闭的生产/sitemap 门禁 | 否 |
| `preflight` | 校验发布窗口；可选检查生产查重、fallback 状态、canonical 与 noindex | 否 |
| `release` | 校验 release payload、分类、媒体和重复实体；事务插入后默认回滚 | 默认否，显式 `--commit` 才写入 |
| `verify` | 回读唯一数据库实体，确认 `published + monitor`；检查双语页面 noindex、自 canonical 和 sitemap 排除 | 否 |

### 不可回退规则

- `release` 一次只处理一个候选，禁止 `--all --commit`。
- 发布窗口未到、预审证据不完整、payload 未完成、媒体缺失、分类不存在或发现同名/同域实体时直接阻断。
- 通用发布器固定写入 `monitor`；`continue_index` 只能走已有独立索引准入流程。
- Otter.ai 的 `/ai/otter` alias 必须在正式发布前单独完成，不能由通用插入器猜测重定向。
- release payload 只接受仓库内 `/public` 素材路径，不接受临时或来源不明的远程图片。
- 数据库写入成功不等于 Vercel 部署或页面验收成功；`verify` 和生产 smoke 必须单独完成。

## 全站索引一致性审计

### 四层事实

1. 数据库：`status`、`page_quality_status` 与内容质量共同生成真实 index decision。
2. 页面：英文和中文 canonical 必须指向唯一 slug；index decision 为 false 时必须输出 noindex。
3. sitemap：只允许出现 index decision 为 true 的数据库工具，且仅包含当前可索引语言。
4. alias：多个数据库名称不得折叠到同一个 canonical；历史 alias 不得作为第二个 sitemap URL。

### 报告字段

- 数据库工具总数、published 数、indexable/noindex 原因分布。
- sitemap 总数、工具 URL 数、重复 URL、遗漏与越界工具 URL。
- canonical 冲突、robots 冲突、HTTP 异常和重复 canonical 实体。
- 审计时间、目标站与最终 `pass/fail`；不包含凭证或正文。

## Review 结论

原始设想有三项风险，已在最终方案中修正：

1. 旧迁移脚本把发布和 `continue_index` 捆绑，已改为通用发布固定 `monitor`。
2. 把本地门禁和生产网络检查串成单一不可区分步骤，会把网络波动误认为内容错误；现拆成离线 `validate` 与显式在线阶段。
3. 自动拼装发布文案会把预审快照冒充发布日事实；现要求发布日生成独立 payload，并重新核对所有波动字段。

方案不会提前发布五个候选，不改变当前 sitemap，也不提高四周计划比例。完成标准是代码与测试可重复执行，并产出一次真实生产只读一致性报告。

## 实施结果（2026-09-07）

- 五个预审文件均通过统一 `validate`；命令级测试确认发布日期前的 preflight 和缺少 release payload 的发布都会失败。
- 通用发布器固定归一化中英文键，核对 payload 的人工核验日期、用途、媒体、分类、官网域名和数据库回读。
- 生产只读审计成功：数据库 52 条、published 41 条、允许索引 15 条；sitemap 138 条，其中工具 URL 30 条。
- 15 个允许索引工具恰好对应英文/中文 30 条 URL；遗漏、越界、重复 URL、重复 canonical 实体均为 0。
- 已检查 41 个 published 工具的 82 个语言页面，HTTP、canonical 与 robots 冲突均为 0。
- 报告：`reports/seo/index-consistency-2026-09-07.json`。本轮没有数据库写入或 sitemap 变更。
