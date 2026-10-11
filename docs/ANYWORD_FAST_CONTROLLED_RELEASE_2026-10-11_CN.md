# Anyword 单项受控发布与语言修正交付

核验日：2026-10-11（Asia/Shanghai）。状态：**RELEASED_PRODUCTION_VERIFIED**。Anyword 初次受控提交后为唯一 `published + monitor/noindex` 实体；针对性回读发现 `/cn/ai/anyword` 显示繁体、`/tw/ai/anyword` 回退英文，随后完成单项受控语言修正。固定 ID 为 `4555627d-2de9-4614-a850-fa073388f869`，canonical 为 `/ai/anyword`。最终两页均 200、自指 canonical、`noindex, follow`：CN 显示简体，TW 显示繁体。完整 production SEO smoke PASS；sitemap 共 126 条、Anyword 0 条。索引与 Task/Capability/Fit 关系未批准。本次 closeout 只改仓库记录，不再写生产、push 或部署。

## 生产语言异常与修复

根因：原载荷将简体放在 `zh`、繁体放在 `cn` 且缺少 `tw`，而运行时 `toolPresenter` 对 CN 优先选 `cn`、对 TW 优先选 `tw/zh-TW/zh`。现将 `title/content/detail/useCases` 和 `features.audience.bestFit/notIdealFor`、`features.editorial.trustNote` 统一为 `en/cn(简体)/tw(繁体)`；其他事实和页面代码不变。

[一次性修正器](../scripts/correct-anyword-locales.ts)锁定固定 ID、原始整行前像 `c28bd4dda38fdfb6eeb7965512b47a7d` 和受保护字段哈希 `d4d319fccdc5545755043504b8fe5a14`，仅更新 `title/content/detail/use_cases/features` 中指定本地化值。先执行生产只读 preflight 和事务 rollback（持久写入 0），再经授权显式 COMMIT：整行哈希从 `c28bd4dda38fdfb6eeb7965512b47a7d` 变为 `9283fee0c6acc144162f49e7c81db67b`，受保护字段哈希不变。随后只读 postcheck 返回 `alreadyApplied=true`、`productionWrites=0`。未删除重建实体，也未重复写入。

## 证据与范围

- 官方身份与功能：[官网](https://www.anyword.com/)直接展示 Data-driven Editor、Brand Voice、Content Intelligence 和 API；[编辑器](https://www.anyword.com/data-driven-editor)说明文案变体和预测分数；[帮助中心](https://support.anyword.com/)列出产品使用入口。它是 AI 辅助营销文案产品，不是普通不带 AI 的工具，也不是视觉设计套件。
- 官方商业边界：[定价](https://www.anyword.com/pricing)直接列出 Starter、Data-Driven、Business、Enterprise，同时出现月付和年付折算区块；不同展示区块的价格/额度不能混成一个无条件承诺。[集成页](https://www.anyword.com/integrations)列出渠道和导入/导出场景，但目标账户实际可用性未测试。
- 独立实际使用信号一：[G2 Anyword](https://www.g2.com/sellers/anyword)可直接读取 2025-12-27 的 verified current user / organic 评论，描述实际配置和营销平台连接；另有 2026 年具体文案变体使用评论，但其标注 incentivized，不能单独作强信号。G2 的厂商描述、品牌客户名单和总体评分不证明本站实测效果。
- 独立实际使用信号二：[Trustpilot Anyword](https://www.trustpilot.com/review/anyword.com)可直接读取 2025-12-10 的 unprompted 邮件/社交内容使用经历及 2025-05 的付费使用与账户锁定负面经历。此来源是用户自述、非账户审计；页面说明历史资料有合并且最近 12 个月仅一条评论，作为互补辅助信号，不用聚合星级证明当前产品质量。
- 历史不同类型佐证：[TechRadar 动手评测](https://www.techradar.com/pro/anyword-review-is-this-the-ai-writing-solution-for-you)由编辑描述实际登录后使用 Editor/Brand Voice/Blog Wizard 的流程；发表于 2023 年，只支持历史真实使用，不证明今日套餐、连接或效果。
- 厂商的 `76%` 成效、预测准确率及其它营销数字全部不作为本站验证结果。公开稿只说评分可用于比较，不承诺转化改善。账户级结账价、预测次数、渠道连接、隐私/删除均为 Claim 层 `conditional/unknown`，有来源、公开限制和复查日；不推导精确采购建议。

## 身份、素材、内容

发布前只读审计 `2026-10-11T01:14:59Z`：当时 `tools` 的 Anyword/any-word/Keywee 名称、标题、URL 及上下文字段匹配均为 0，固定 ID 匹配 0，`product_intelligence_profiles` 匹配 0。当时 `/ai/anyword`、`/cn/ai/anyword`、`/tw/ai/anyword` 均是 200/self-canonical/noindex 占位壳；`/ai/any-word` 与 `/ai/keywee` 也是单独的 noindex 壳，不是已证同一实体，也未获重定向批准。该记录是发布前历史快照，不代表当前生产实体不存在。

素材为本站原创的[中性文案审阅示意图](../public/images/tool-media/anyword-editorial-cover.svg)，SHA-256 `8e5f033358bb8ff4db35219a68da28e6d0dad27179c8350ed16d41fb11d11e3a`。不是 Anyword logo、截图、官方 UI 或实测结果，不复用厂商媒体。三语言候选内容在[发布载荷](../data/collection/anyword-release.json)，含 Best for、Not ideal、真实限制、Jasper/Grammarly/Canva 比较路径、官方与独立来源、核验日、下次复核和纠错/Owner 入口说明；展示不包含内部门禁状态。

## 执行和回滚边界

[门禁 manifest](../data/collection/anyword-controlled-release-preaudit-2026-10-11.json)的七项实体门禁通过，四条可变 Claim 分别维持限制。初次发布已完成独立 QA、总控单项授权与生产提交。`text-writing` 复用 Jasper/Grammarly 既有存储分类，不建新分类；`pricing=paid` 仅表达存在付费套餐，不承诺具体结账价。

原发布器沿用 `validate → preflight --online → release(默认 ROLLBACK) → verify --online`。该段描述原始受控发布，不用于当前已存在实体的语言修复；本次只使用上面的固定 ID 修正器。

原 manifest 的 `controllerWriteAuthorization` 只批准初次 `published + monitor/noindex` 插入；语言修正另按精确前像执行。index、sitemap、Task/Capability/Fit 均保持 false；本次 closeout 不再启动提交模式。

原发布前开发曾执行 `validate`、生产只读 `preflight --online`、默认 `release` 事务回滚，以及回滚后独立只读身份复核；均通过。初次回滚演练在写入前发现 `marketing` 分类不存在，改为既有 `text-writing` 后重跑通过。末次发布前回读 `2026-10-11T01:17:26Z` 仍为实体/profile/固定 ID 0，sitemap 126 且 Anyword 匹配 0；这些均为历史快照。原专项测试、通用发布器契约、`tsc --noEmit` 和一次完整 build 均通过。

## 已验收边界

1. 复核 G2 有机 verified-current-user 与 Trustpilot 非邀请评论确实属于两种直接可读、互补的实际使用信号；不要把站方/厂商汇总评分当成效果证据。
2. 核对公开稿绝无 `76%`、精确账户价格/额度或“预测必胜”的断言；四条 Claim 限制与日期必须能被读到。
3. 对固定 ID 占用、重复实体、旧行哈希变化、素材 SHA 篡改、实体门禁失败和 Claim 精确曝光做负例；确认 `release` 默认永不持久写入。
4. 本次语言修复重点核对 CN 简体和 TW 繁体的四个顶层字段及 `features` 三处文案；任何修改都不得触及其他工具、状态、索引、素材、复核日或关系。
5. 语言修正的整行前像、受保护字段哈希、后像、回滚独立回读与幂等 postcheck 均已留痕；后续不应重放 `--commit`。
