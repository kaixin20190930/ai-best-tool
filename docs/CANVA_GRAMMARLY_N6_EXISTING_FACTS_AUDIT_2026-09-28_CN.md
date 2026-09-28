# N6：Canva 与 Grammarly 既有事实复核候选

核查日：2026-09-28。下次官方事实复核：2026-10-05；Grammarly 既有工具日历 `next_review_date=2026-10-20` 保持不变。本包仅为事实审计与受控更新候选，不是生产 Evidence Ledger 的 verified claim，也不授权数据库、关系、页面、metadata、canonical、robots、sitemap 或索引写入。未登录 Canva/Grammarly 账户，未购买或实测额度、导出及组织管理。来源仅用厂商官方页面；不把营销示例当成实测质量或权益。

## 治理与只读身份结果

沿用[收录宪法与更新政策](./BEST_DIRECTORY_POSITIONING_AND_INTAKE_CN.md)、[14 项候选台账](./MATURE_CANDIDATE_BUFFER_2026-09-20_CN.md)、[索引政策](./TOOL_INDEX_RELEASE_POLICY_CN.md)、[CL-06 品牌编辑包](./DECISION_GRAPH_CL06_BRAND_EDITORIAL_PACKET_2026-09-27_CN.md)及 N1–N5 官方审计的 `事实 / 限制 / unknown / HOLD` 格式。两者均属于 `existing facts review / duplicate-intent` 研究轨道，不占新工具发布槽；Magic Studio、Canva AI 2.0、Superhuman Go 均不得因本包另建工具身份。Task、Capability、Constraint、Evidence 是编辑映射，不是生产关系。

`.env.local` 的生产 Neon 连接经 `BEGIN READ ONLY → SELECT → ROLLBACK` 回读：`tools` 共 67 行；按 name、title、url、域名及完整清单复查，`grammarly` 唯一命中 ID `4d0bbf38-6b7e-4c44-8e25-9fe73f60bb18`，`published + continue_index`，官网 `https://www.grammarly.com/`，`pricing=freemium`，`next_review_date=2026-10-20`。**Canva 命中 0 行**；因此历史台账“现有 Canva canonical 待增强”的说法与当日生产状态冲突，不能生成 Canva `UPDATE tools WHERE id=...`。`lib/config/toolRouteAliases.ts` 无两者替代 slug。线上回读：`/ai/canva`、`/cn/ai/canva` 及 `/ai/canva-magic-studio` 为 `200 + self-canonical + noindex,follow` 的“temporarily unavailable”壳；Canva sitemap URL 为 0。`/ai/grammarly`、`/cn/ai/grammarly` 为真实 200 页面、自 canonical、无 noindex，sitemap 恰有两个双语 URL。动态壳的 self-canonical 不是已存在 Canva 工具实体或索引批准。

## Canva：官方事实与页面对照，整体 `HOLD-CONFLICT`

| 核查项 | 官方一手事实与限制（2026-09-28） | 当前 DB/页面；候选处置 |
| --- | --- | --- |
| 主产品和 AI 能力 | [Magic Studio](https://www.canva.com/magic-studio/)是 Canva 内的 AI 工具集合；[Magic Design](https://www.canva.com/help/use-magic-design/)提供设计模板生成，[Magic Media](https://www.canva.com/help/using-magic-media/)生成图像、图形及视频。[2026 Canva AI 2.0 公告](https://www.canva.com/newsroom/news/canva-create-2026-ai/)称对话式、分层可编辑设计为 research preview；这不是所有账户已普遍可用的证明。普通模板、Brand Kit、协作及手动编辑不能直接记作 AI 生成功能。 | 无 DB 实体，页面为不可用壳；`HOLD-CONFLICT`。保留唯一 Canva 产品身份研究，不建 Magic Studio/AI 2.0 子页。 |
| 套餐、额度和可用性 | [定价页](https://www.canva.com/pricing/)及[AI 使用说明](https://www.canva.com/help/ai-access-variantb/)按 Standard/Premium/Ultra 和共享月额度区分，次数取决于任务复杂度，不能把 `up to 200` 写成固定 200 次。帮助页同时写 Free 可用“至多 20 次 Standard **或 Premium**”，又写 Premium/Ultra 适用于付费及特定非营利账户；Free 的 Premium 资格存在同页冲突。[管理控制](https://www.canva.com/help/magic-features-admin-controls/)称 Teams 不再开放新注册，团队管理员可控制 AI 入口，语言/地区可影响可用性。 | 无现有价格字段可比较；Free Premium 资格、AI Pass/top-up、实际套餐/地区额度为 `HOLD-conflict / needs account-or-plan validation`，不写定额或“所有 Pro 功能无限”。 |
| 商用、输出与水印 | [AI Product Terms（2026-06-26）](https://www.canva.com/policies/ai-product-terms/)允许合法用途，输入权利保留、输出原则上归用户，但修改或包含 Canva 授权素材的部分仍受素材许可，输出可能不独特且 Canva 不保证准确性或法律适用性。[商用说明](https://www.canva.com/help/using-canva-to-create-products-for-sale/)区分 AI 生成图与原素材再售，Magic Edit 底图许可仍有效。[授权说明](https://www.canva.com/licensing-explained/)中的水印针对 Free 账户使用 Pro 素材，付费许可/订阅可移除；不能概括成“Canva AI 输出均有/均无水印”。 | `safe factual update candidate` 仅限上述分层描述；具体下载格式、单项资产和客户用途需账户与素材许可证检查。因无目标实体，仍不可执行。 |
| 隐私与训练 | [Trust Center](https://www.canva.com/trust/privacy/)称用户内容用于改善 AI 取决于 Privacy Settings；[隐私设置帮助](https://www.canva.com/help/manage-privacy-settings/)显示个人开关及受托管账户锁定。[AI 条款](https://www.canva.com/policies/ai-product-terms/)允许技术合作方为提供功能处理输入，设置还控制是否用于改善服务。不能把“不参与训练”解释成“不经第三方处理”。 | `safe factual update candidate` 是设置与处理边界；具体团队默认值、模型/地区及合同需 `needs account-or-plan validation`。无 DB patch。 |
| Apps、API、导出 | [Canva Developers SDK](https://www.canva.dev/docs/apps/)区分编辑器内 Apps、外部平台 REST API、AI 助手 MCP 三种表面；[导出 API](https://www.canva.dev/docs/apps/rest-apis/reference/designs/)按设计查询可用格式。Marketplace 第三方 AI 应用有自己的额度与支持路径，[官方 AI 使用说明](https://www.canva.com/help/ai-access-variantb/)明确不计入 Canva 自有 AI allowance。 | `safe factual update candidate` 仅限集成表面的区分；API/Apps 权益、导出格式、第三方账单和水印均按实际账号/设计核，不能据文档推断所有方案可用。 |
| 近期变化 | [2026 Canva AI 2.0 公告](https://www.canva.com/newsroom/news/canva-create-2026-ai/)为 research preview；[Magic Layers 公告](https://www.canva.com/newsroom/news/magic-layers/)称部分国家 public beta。 | 只能标为 preview/beta 维护信号；普遍可用性与质量为 `unknown`，不得升级成已验证能力。 |

Canva 编辑 Cluster 仍是“AI 辅助视觉设计（未注册 Task）”的 Anchor 研究对象；与 Ideogram 的候选差异是 Canva 设计工作区、品牌/团队流程相对单图生成与局部编辑。由于生产实体缺失，`Tool Intelligence` 无可更新 owner，任何 Capability/Fit/Evidence link 均 HOLD。先由主线核对历史记录与预期实体身份，再另案决定是补齐原实体还是撤回“既有页面”假设；本任务禁止创建实体或改变页面/索引。

## Grammarly：逐字段对照与分类

| 核查项 | 官方一手事实（2026-09-28） | 生产 DB/页面；候选处置 |
| --- | --- | --- |
| 身份、套餐和额度 | [现行计划](https://www.grammarly.com/plans)展示 Free、Pro、Enterprise；Free 100 AI prompts/月、Pro 每成员 2,000/月、Enterprise 每成员 unlimited。Pro 年付折算 `$12/月`；[Pro 支持页](https://support.grammarly.com/hc/en-us/articles/115000090011-How-much-does-Grammarly-Pro-cost)列月付 `$30`、季付 `$60`、年付 `$144`，称 Pro 替代 Business，但现行计划页 FAQ 仍有 Business 发票措辞。 | `title`、`pricing`、`detail` 的数字/账期、Go 范围与 `features.pricingSnapshot` 均 `NO_CHANGE`；Business/Plus 老账户权益与具体结账 `needs account-or-plan validation`，不能从官网 FAQ 推断新售 Business 方案。 |
| AI 起草、改写与审阅 | [计划页](https://www.grammarly.com/plans)支持全文句改写、语气调整及 AI prompts；[生成式 AI 指南](https://support.grammarly.com/hc/en-us/articles/14528857014285-Introducing-generative-AI-assistance)分别列 Go、桌面 AI Chat、Editor 起草和移动端功能。这些入口不同，不能合并为一个全端一致的“AI review”权益；AI 检测/抄袭提示不是权威证明。 | 现有 `content`/`detail` 已表达行内语法、清晰度、改写和人工复核，`NO_CHANGE`；品牌审阅的具体条件可补到 `detail`，见 manifest。 |
| 品牌语调、规则和组织控制 | [Brand tones](https://support.grammarly.com/hc/en-us/articles/4403544890253-Set-brand-tones)给组织/组语调反馈；[Style rules](https://support.grammarly.com/hc/en-us/articles/360043832652-Create-style-rules)给术语/格式建议、组/全组织分配、viewed/accepted/dismissed 统计，Pro 1 个规则集，旧 Business 文档 50 个。建议可被接受/忽略，网站允许列表和开关影响覆盖；Keyboard 无规则建议。[现行计划](https://www.grammarly.com/plans)列 Pro 1 组 style guide/brand tones、Enterprise 更宽的组织控制。 | 页面未覆盖品牌规则的作用面。`safe factual update candidate`：仅补“已配置规则对已有草稿给建议、由人审”的双语说明及官方来源。旧 Business 50 组与现行 Pro 替代 Business 的账户映射 `needs account-or-plan validation`；不写成所有新账户 entitlement。 |
| AI 初稿是否自动继承组织规则 | [Business Style Guide](https://www.grammarly.com/business/styleguide)把生成式起草与品牌指导并列，但未直接证明某个 AI 首稿入口自动附上已分配的组织 brand tones/style rules。个人 Voice Profile 也不能替代组织规则。 | `HOLD-conflict/unknown`，沿用 CL-06 `brand-guided-content-generation` 的 `supportLevel=null, availability=unknown`，仅保留已有草稿审阅的 `conditional` 候选；不建关系、不宣称强制品牌合规或审批。 |
| 支持端、隐私与安全 | [生成式 AI 指南](https://support.grammarly.com/hc/en-us/articles/14528857014285-Introducing-generative-AI-assistance)分别标注浏览器/Docs/Windows/Mac/移动端入口；[style rules](https://support.grammarly.com/hc/en-us/articles/360043832652-Create-style-rules)明确 Keyboard 缺口。[训练控制](https://support.grammarly.com/hc/en-us/articles/25555503115277-Product-Improvement-and-Training-Control)区分个人/官网直购团队默认开且可 opt out 与 Sales 管理团队默认关闭；[隐私 FAQ](https://support.grammarly.com/hc/en-us/articles/20916119474829-Privacy-and-security-FAQs)区分服务商处理与训练，并说明 Editor 文档留存。 | 已有 `detail` 对训练默认、服务商处理、Editor 留存和 Go 桌面重叠的说法 `NO_CHANGE`；只补品牌规则的客户端限制。企业合同、DPA、地域、实际租户设置 `needs account-or-plan validation`。 |

对应的[字段级 candidate patch manifest](./CANVA_GRAMMARLY_N6_CANDIDATE_PATCH_2026-09-28_CN.json)固定 Grammarly ID 与只读状态前提，列出每个 `NO_CHANGE`、候选增量、HOLD 和不可执行的 Canva 事实。它是人工审阅输入，不是可运行 SQL/发布 manifest。`features.release.indexState=monitor` 是 09-21 发布历史快照；当下资格由 `page_quality_status=continue_index` 决定，故不改历史 JSON 代替状态字段。CL-06 现有 Grammarly profile/source/claim/link 与 Tool Capability/Fit 均为 0；本包来源不自动变成 verified claim。该 Task 仍缺第三条真实已发布 Fit，Task Page 继续 404。

## 门禁与剩余风险

- 生产读回仅使用只读事务；线上五个工具 URL 和 sitemap 已按上述状态检查。发布前须再次回读唯一身份、目标字段旧值及真实页面，并让独立 QA 审核补充文本、来源和双语一致性。
- Canva 缺失生产实体与历史“既有 canonical”说法冲突是独立阻塞项；Free Premium 资格同页冲突、AI 2.0/新功能预览范围、实际套餐额度、第三方 App/素材许可均保留 `HOLD/unknown`。
- Grammarly 的新售计划与旧 Business/Plus 帮助文档交叉、账号训练设置和组织规则在 AI 首稿中的作用均需真实账户/合同验证；不能把“已有草稿的建议式审阅”升级为初稿品牌约束或不可绕过的审批。
- 本次未更新生产工具、Tool Intelligence、Evidence Ledger、Decision Graph、页面、canonical、robots、sitemap、索引、自动化，也未 push/deploy。

## 本地验证

- `pnpm run test:mature-candidate-buffer`：PASS，14 项候选唯一且发布/索引门禁未变。
- `pnpm exec tsx scripts/verify-decision-cl06-brand-readonly.ts`：PASS，生产写入 0；Grammarly published，CL-06 两条 Task Capability 仍 reviewed，Tool Capability/Fit 均为 0，Grammarly 无 profile/source/claim/link。
- 候选 JSON 经 `python3 -m json.tool` 解析；`git diff --check` 通过。纯文档/候选 manifest 无页面代码改动，不运行无关完整 build。
