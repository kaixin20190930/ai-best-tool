# Anyword 单项受控发布候选

核验日：2026-10-11（Asia/Shanghai）。状态：**QA_PASS；总控已授权单项 READY_MONITOR 写入，但尚未生产提交**。本单元 `productionWrites=0`，不含 commit、push、部署、索引、sitemap 或 Task/Capability/Fit 关系批准。固定 ID 为 `4555627d-2de9-4614-a850-fa073388f869`，唯一拟用 canonical 为 `/ai/anyword`，CN/TW 保持各自语言路径。

## 证据与范围

- 官方身份与功能：[官网](https://www.anyword.com/)直接展示 Data-driven Editor、Brand Voice、Content Intelligence 和 API；[编辑器](https://www.anyword.com/data-driven-editor)说明文案变体和预测分数；[帮助中心](https://support.anyword.com/)列出产品使用入口。它是 AI 辅助营销文案产品，不是普通不带 AI 的工具，也不是视觉设计套件。
- 官方商业边界：[定价](https://www.anyword.com/pricing)直接列出 Starter、Data-Driven、Business、Enterprise，同时出现月付和年付折算区块；不同展示区块的价格/额度不能混成一个无条件承诺。[集成页](https://www.anyword.com/integrations)列出渠道和导入/导出场景，但目标账户实际可用性未测试。
- 独立实际使用信号一：[G2 Anyword](https://www.g2.com/sellers/anyword)可直接读取 2025-12-27 的 verified current user / organic 评论，描述实际配置和营销平台连接；另有 2026 年具体文案变体使用评论，但其标注 incentivized，不能单独作强信号。G2 的厂商描述、品牌客户名单和总体评分不证明本站实测效果。
- 独立实际使用信号二：[Trustpilot Anyword](https://www.trustpilot.com/review/anyword.com)可直接读取 2025-12-10 的 unprompted 邮件/社交内容使用经历及 2025-05 的付费使用与账户锁定负面经历。此来源是用户自述、非账户审计；页面说明历史资料有合并且最近 12 个月仅一条评论，作为互补辅助信号，不用聚合星级证明当前产品质量。
- 历史不同类型佐证：[TechRadar 动手评测](https://www.techradar.com/pro/anyword-review-is-this-the-ai-writing-solution-for-you)由编辑描述实际登录后使用 Editor/Brand Voice/Blog Wizard 的流程；发表于 2023 年，只支持历史真实使用，不证明今日套餐、连接或效果。
- 厂商的 `76%` 成效、预测准确率及其它营销数字全部不作为本站验证结果。公开稿只说评分可用于比较，不承诺转化改善。账户级结账价、预测次数、渠道连接、隐私/删除均为 Claim 层 `conditional/unknown`，有来源、公开限制和复查日；不推导精确采购建议。

## 身份、素材、内容

生产只读审计 `2026-10-11T01:14:59Z`：`tools` 的 Anyword/any-word/Keywee 名称、标题、URL 及上下文字段匹配均为 0，固定 ID 匹配 0，`product_intelligence_profiles` 匹配 0。`/ai/anyword`、`/cn/ai/anyword`、`/tw/ai/anyword` 均是 200/self-canonical/noindex 占位壳；`/ai/any-word` 与 `/ai/keywee` 也是单独的 noindex 壳，不是已证同一实体，也未获重定向批准。sitemap 共 126 loc，Anyword/Keywee 匹配 0。Guide 提及或旧别名壳不在本单元合并。

素材为本站原创的[中性文案审阅示意图](../public/images/tool-media/anyword-editorial-cover.svg)，SHA-256 `8e5f033358bb8ff4db35219a68da28e6d0dad27179c8350ed16d41fb11d11e3a`。不是 Anyword logo、截图、官方 UI 或实测结果，不复用厂商媒体。三语言候选内容在[发布载荷](../data/collection/anyword-release.json)，含 Best for、Not ideal、真实限制、Jasper/Grammarly/Canva 比较路径、官方与独立来源、核验日、下次复核和纠错/Owner 入口说明；展示不包含内部门禁状态。

## 执行和回滚边界

[门禁 manifest](../data/collection/anyword-controlled-release-preaudit-2026-10-11.json)的七项实体门禁通过，四条可变 Claim 分别维持限制。最早发布日为 2026-10-11；现已取得独立 QA PASS 和总控单项生产写入授权，但授权不等于已经执行。`text-writing` 复用 Jasper/Grammarly 既有存储分类，不建新分类；`pricing=paid` 仅表达存在付费套餐，不承诺具体结账价。

发布器沿用 `validate → preflight --online → release(默认 ROLLBACK) → verify --online`。固定 ID、产品名称/官网域名/别名、既有实体空前像、全部旧 `tools` 行哈希、唯一插入数、三语正文与素材、nextReviewDate、monitor 状态由代码断言。没有 `--commit` 时事务内插入并读回后回滚；回滚后独立只读连接再次断言产品匹配 0、固定 ID 0。显式 `--commit` 前还会要求已部署自有素材的 HTTP、MIME 和 SHA-256 与本地一致。提交后的只读 verify 要求唯一固定 ID、完整三语后像、零关系、三语 200/self-canonical/noindex、sitemap 0；这是后续总控步骤，不是开发已执行的步骤。

当前 manifest 已记录候选专属 `controllerWriteAuthorization`：总控于 2026-10-11 确认独立 QA PASS，只批准一次 `published + monitor/noindex` 插入，index、sitemap、Task/Capability/Fit 均保持 false。专项测试覆盖当前授权正例及缺授权、QA 未通过、候选不匹配和高风险门禁开启负例；本次不启动提交模式、不写生产。

开发执行了 `validate`、生产只读 `preflight --online`、默认 `release` 事务回滚，以及回滚后独立只读身份复核；均通过。初次回滚演练在写入前发现 `marketing` 分类不存在，改为既有 `text-writing` 后重跑通过。末次回读 `2026-10-11T01:17:26Z` 仍为实体/profile/固定 ID 0，sitemap 126 且 Anyword 匹配 0，持久 `productionWrites=0`。专项测试、通用发布器契约、`tsc --noEmit` 和一次完整 build 均通过。若未来提交后需撤销，先按固定 ID、slug 与受保护字段只读核验，再经单独授权做受控撤稿；本开发分支不提供自动删除或重定向。

## QA 重点

1. 复核 G2 有机 verified-current-user 与 Trustpilot 非邀请评论确实属于两种直接可读、互补的实际使用信号；不要把站方/厂商汇总评分当成效果证据。
2. 核对公开稿绝无 `76%`、精确账户价格/额度或“预测必胜”的断言；四条 Claim 限制与日期必须能被读到。
3. 对固定 ID 占用、重复实体、旧行哈希变化、素材 SHA 篡改、实体门禁失败和 Claim 精确曝光做负例；确认 `release` 默认永不持久写入。
4. 后续总控若准备发布，先部署 SVG 再运行新的生产只读 preflight；QA PASS 前不得使用 `--commit`、push 或部署。
