# Jasper 受控发布交付（2026-09-21）

状态：已受控发布并完成独立 QA 的线上 verify。总控已完成生产只读 preflight、默认 rollback 与一次显式 `--commit`；本交付不执行新的生产写入、推送或部署。

## 一次性日期授权

Jasper 的原始 `publishNotBefore` 保持为 `2026-09-22`，不改写历史门禁。Owner 于 2026-09-21 明确授权仅 Jasper 在当天执行，因此预审包中的 `ownerEarlyReleaseOverride` 记录了原日期、授权日期、有效日期、候选范围和必须保留的门禁。统一发布器会拒绝把该例外用于其他候选，也会继续要求显式 `--commit` 才能写生产。

该授权没有改变以下约束：首次状态只能是 `published + monitor/noindex`；Jasper 不进入 sitemap；索引批准仍关闭；生产身份查重、回滚演练、线上 canonical/noindex/sitemap 验证和独立索引评审仍是必经步骤。

## 2026-09-21 当日核验

本次重新打开官方价格、credits、Brand Voice、EULA、DPA、sub-processors 和 ethics 页面。未发现足以改写 2026-09-20 实质 payload 的变化，因此不把一次“复核无变化”伪装成产品变更。

- Pro 仍显示月付每席位 `$69`、年付月均 `$59`、一个席位、两条 Brand Voices、五个 Knowledge assets 和三个 Audiences；Business 仍为定制价格。 [官方价格](https://www.jasper.ai/pricing)
- Business 仍是平台费加共享 credits 的混合模型；Chat、Agents、Studio 和 IQ 是包含的核心能力，API/MCP、Grid 输出行和部分高级 Agent/GEO 动作另消耗 credits。默认用户可用 credits，PAYG/overage 设置变更尚未进入 audit log。 [Credits 文档](https://help.jasper.ai/hc/en-us/articles/46644376016923-Credits-Based-Pricing)
- Brand Voice 可使用最多八个文本、文件或 URL 示例；管理员可设默认 voice，但用户可覆盖，Style Guide 仍是 Business 限定。因此品牌控制不能代替事实、合规或发布前人工复核。 [Brand Voice 文档](https://help.jasper.ai/hc/en-us/articles/18618693085339-Brand-Voice) · [Ethics](https://www.jasper.ai/ethics)
- EULA 仍规定 Customer Property 不得用于训练服务所用 AI 模型，同时允许授权服务商为提供、保护和改进服务而处理 Customer Property；个人数据处理须先走 DPA，默认托管/处理地点及实际 sub-processor 配置须按合同核验。 [EULA](https://www.jasper.ai/legal/eula) · [DPA](https://www.jasper.ai/legal/dpa) · [Sub-processors](https://www.jasper.ai/legal/sub-processors)

独立市场证据仅保留为选择/试用边界，不作功能或效果证明：Trustpilot 当日页面显示 4,144 条评论和 3.2 分，且页面自身提示近期邀评不足，不能当作代表性或亲测结论。 [Trustpilot](https://www.trustpilot.com/review/www.jasper.ai)

## 固定身份与发布方式

- 唯一产品：`Jasper`；不拆分 Jasper IQ、Canvas、Agents、Studio 或 Grid。
- 唯一路由：`/ai/jasper`（中文 `/cn/ai/jasper`）；两者须自 canonical、`noindex, follow` 且 sitemap 排除。
- 固定候选 ID：`5a0c7e91-9a5c-4f84-923a-d8345edaa918`；任何名称、域名或标题查重命中均阻断，不能自动合并。
- 执行顺序：`preflight --online` → 默认 `release` 回滚 → 完整本地校验。只有另一项明确生产授权才允许单独运行 `release --commit`，随后将真实发布日期写入预审并运行 online verify；本交付不做这些写操作。

## 自动验收与后续风险

专项测试覆盖提前授权的候选限定、原日期保留、显式 commit、身份、价格/credits、数据边界、素材、Decision Card 和 noindex。完整 build、索引一致性、sitemap 与 SEO 门禁结果会附在本页的执行更新中。

### 本次执行结果

| 检查 | 结果 |
| --- | --- |
| Jasper production preflight、默认 rollback、显式 `--commit` | 总控已通过；唯一 ID `5a0c7e91-9a5c-4f84-923a-d8345edaa918` 回读为 `published + monitor`，`reviewedAt=2026-09-20`、`nextReviewDate=2026-10-20` |
| `test:jasper-preaudit`、`test:candidate-release` | 通过 |
| Jasper `validate` | 通过；显示有效窗口 `2026-09-21` 与原始日期 `2026-09-22` |
| TypeScript、索引一致性契约、工具索引门禁、SEO 架构 | 通过 |
| 完整 Next.js build | 通过；仅为构建图使用进程内无功能 Supabase secret 占位值，未写配置或访问生产数据 |
| 生产唯一性与 online verify | 独立 QA 已通过：生产仅一条 Jasper 实体，状态为 `published + monitor`；`/ai/jasper` 与 `/cn/ai/jasper` 均为 200、自 canonical、`noindex, follow`，均有 Decision Card，且不在 sitemap。 |
| 生产索引与 sitemap 门禁 | 独立 QA 已通过：索引一致性、生产 SEO smoke 均为 PASS；sitemap 页面级检查 `120/120` PASS。 |

残余风险：Business 合同、包含 credits、费率、PAYG 上限、地区/税费、DPA 与托管/子处理商选择均依客户合同和配置；本站没有付费 workspace、Business 合同或性能/输出准确性实测。提前授权也不构成索引批准。
