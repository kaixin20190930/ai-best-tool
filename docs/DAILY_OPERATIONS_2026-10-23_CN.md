# AI Best Tool 每日运营审计：2026-10-23

日期：2026-10-23（Asia/Shanghai）。本日按一个合并 Catalog + Freshness 单元执行。未拆分工具或阶段；Hailuo AI 已通过通用流水线发布，Freshness 保持零写；没有 index、sitemap 或关系发布。

## 结果摘要

| 线 | 结果 | 说明 |
| --- | --- | --- |
| Catalog | `COMPLETED / PUBLISHED_MONITOR_NOINDEX` | Hailuo AI 选择包通过独立 QA。通用 enqueue、candidate-to-draft、tool-to-published 三段均完成 rollback、commit 与幂等 postcheck；最终 Tool ID `aa07de1d-3be3-41bb-afe0-ecce27158b37`，`published + monitor/noindex`。 |
| Freshness | `SELECTOR_PASS / CHANGE_SET_EMPTY / WRITER_HOLD` | 全量 selector 选中 Midjourney、OpenRouter、ElevenLabs、Fireflies、Glean。只核到期 Claim。发现 OpenRouter 官方免费模型速率限制差分；目标行为 `continue_index`，共享 Freshness 写入器仅接受 `monitor`，未绕过。其他四项没有证实新事实，不更新复核日期。 |
| Candidate overlay | `PASS` | 共享 overlay 已排除已发布的 Kling AI 和 Hailuo AI；历史候选快照未修改。 |
| Index / Market | `HOLD / UNAVAILABLE` | 2026-10-23 全量索引选择记录为 50 个 published monitor、0 个 A 级候选；配额 0/5（日）、10/25（周）。GSC 最新可用快照截至 2026-10-14，OAuth refresh 仍为 HTTP 400；未推断流量或放宽准入。 |

## Catalog：Hailuo AI

- 唯一实体：`hailuoai.video` 上的 Hailuo AI 创作者视频/图像应用；canonical 提案 `/ai/hailuo-ai`。当前服务条款（2026-08-19）称签约公司为 Nanonoble Pte. Ltd.；MiniMax 官方公告把 Hailuo AI 网站作为消费者产品入口并介绍 Hailuo 视频模型。MiniMax Open Platform API、中国市场服务、单个模型和第三方托管均排除在本实体之外。
- Cluster：`product-image-to-short-video`，`alternative`；与已发布 Kling AI Anchor、Pika、Runway 比较参考图控制、编辑流程、credits、导出水印和权利边界。仅指向 Tool Intelligence，不创建 Task Fit 或 Task Page。
- 能力证据：官方页面描述图像/文字转视频；MiniMax 公告描述图生视频、文生视频及 Media Agent。只记录厂商能力描述，不声称商品/Logo 保真、效果质量或本站实测。
- 价格和权益：订阅条款（2025-07-14）列有免费/付费方案、额度、优先生成与下载差异；公开套餐表已过时且对应 Hailuo 02，因此没有把旧价格或额度写作当前权益。条款称免费导出带水印，付费方案可无水印；付费生成并下载内容的权利附带服务方为运营、改进和推广服务使用内容的广泛许可。具体账户、模型、地区和结账权益仍须核验。
- 隐私：隐私政策（2025-12-09）适用于 hailuoai.video，并列出账户/联系方式、设备、IP、Cookie 与使用数据。面部特征处理和删除陈述仅覆盖特定移动端功能，不能外推成所有上传、产品表面或地区的统一留存保证。未登录账户、未测试输出、未核媒体授权。
- 来源： [Hailuo AI 官网](https://hailuoai.video/)、[官方图生视频页](https://hailuoai.video/tools/image-to-video)、[订阅条款](https://hailuoai.video/doc/payment-policy.html)、[服务条款](https://hailuoai.video/doc/terms-of-service.html)、[隐私政策](https://hailuoai.video/doc/privacy-policy.html)、[MiniMax Hailuo 公告](https://www.minimax.io/news/minimax-hailuo-23)。官方图生视频页的 live reader 在核验时返回 HTTP 500；该页仅作辅助证据，能力结论另由可读官网和 MiniMax 公告支持。
- 实体重复查重：2026-10-23 生产只读查询匹配 Tool `0`、候选 `0`。通用 preflight 核对活跃 Task 与其全部 reviewed/published Fit，要求集合包含 Kling Fit ID `711df152-fdcf-4a19-930c-ab866b67605f`，后已写入选择包作为比较上下文。
- 页面资产：平台自有中性 SVG，非厂商素材：[hailuo-ai-editorial-cover.svg](/Users/liukai/web/ai-best-tool/public/images/tool-media/hailuo-ai-editorial-cover.svg)，SHA-256 `f6a76672acbb3b86b65a769dd27e2c66ae99796e589a64d0da7913155497f5a3`。
- 通用 enqueue preflight PASS：candidate ID `b814b5d2-4a57-4c53-b02b-10cfc76a7da8`；`preimageHash=e724075fa4cbeb4356be7d245be1a1446395ef289797e45f99b521b3f290959c`；`selectionHash=8b1f2d35a04aeb489125f65aaa0ecf58994626cea2415949a91b2841e3895802`；`ready=true`、`productionWrites=0`。
- 独立 QA：`docs/DAILY_OPERATIONS_2026-10-23_QA.json` 为 `QA_PASS`，明确批准固定 selection 通过通用门禁发布为 `published + monitor/noindex`，不批准 index、sitemap 或关系。
- Enqueue：rollback `productionWrites=0`；commit 写入候选 1 条；postcheck 后像 `4ae105e7e378e88bdfe24261e73371cf2fe3565883e88246c85319505c62a0b8`，`productionWrites=0`。
- Candidate bridge：preimage `3c7ffbd349dfe4e88f673ad45d7f6e211d9977605328a2941b27ed4912ac0dd2`；rollback 零写，commit 创建 draft Tool `aa07de1d-3be3-41bb-afe0-ecce27158b37`，postcheck 零写。
- Tool publication：preimage `4573f1e82387b2f95ce4d63e74a4246a551f21c197befa0719c40d7d2ffc00a2`；rollback 零写，commit 将唯一 Tool 发布为 `published + monitor/noindex`，postcheck 零写。

## Freshness：五项增量复核

发布前生产只读 selector 命令 `pnpm exec tsx scripts/audit-freshness-backlog.ts --date=2026-10-23` 返回 `totalTools=113`、`published=80`、`duePublished=53`、`claim_due=41`、`entity_due=12`，入选恰为下表五项。

| 工具 | 到期 Claim 核对 | 结果 |
| --- | --- | --- |
| Midjourney | 官方套餐比较与视频/GPU 文档当前仍支持已记录的套餐、视频分辨率和 GPU 消耗范围；没有确认本次范围内的事实变化。 | `HOLD_NO_WRITABLE_DELTA`；不因到期单独刷新日期。 |
| OpenRouter | 当前官方 Pricing 页面新增/明确免费模型 20 次/分钟；默认 50 次/日；账户累计购买至少 $10 credits 后日上限可升至 1,000；失败的免费模型尝试仍计入日上限。既有正文只写 50 次/日。 | `HOLD_WRITER_SCOPE`；真实差分但生产行是 `continue_index`。通用 Freshness preflight 明确拒绝（脚本断言要求 `monitor`）。因此 manifest 的 `items=[]`，无 rollback/postcheck 输入、无生产写入。 |
| ElevenLabs | 当前官方价格与计费资料仍显示 Free 10,000 credits、Starter $6/30,000、Creator $22/121,000（首月促销 $11）、以及已记录的 rollover/产品额度边界；账户级结账未核。 | `HOLD_NO_WRITABLE_DELTA`；不刷新日期。 |
| Fireflies | 当前官方 Billing FAQ 支持已记录的席位账单、AI Credits 独立附加项及试用/续费边界；账户工作区权益未核。 | `HOLD_NO_WRITABLE_DELTA`；不刷新日期。 |
| Glean | 当前官方 Enterprise Search 和产品页仍支持已记录的企业搜索/Assistant、权限与连接器范围（正文已记录 275+ connectors）；没有新增公开价格或账户权益。 | `HOLD_NO_WRITABLE_DELTA`；不刷新日期。 |

OpenRouter 变化的执行器命令 `pnpm exec tsx scripts/run-existing-tools-freshness-change-set.ts --mode=preflight --manifest=docs/DAILY_OPERATIONS_2026-10-23_FRESHNESS_CHANGE_SET.json` 返回 HOLD：目标行 `continue_index`，预期 `monitor`。因此没有生成一项无法由现有共享路径执行的写入，也没有更改 detail、维护日期或 SEO 字段。Freshness `productionWrites=0`。

## Kling overlay 修正

Kling AI Tool `8396b409-05e0-4c2c-97e4-bcf4a18db40f` 已于 2026-10-22 发布，Hailuo AI Tool `aa07de1d-3be3-41bb-afe0-ecce27158b37` 于本日发布。本次只在现有共享 JSON 的 `released` map 增加两项与对应日报证据引用；不改历史快照、不增服务、表、Dashboard 或工具专属代码。

## 验证记录

- PASS — Hailuo 选择包解析：6 个官方来源、EN/CN/TW、`alternative` Cluster 角色、自有 SVG SHA 校验及 Claim-to-source 对照通过 `parseOps2Selection`。
- PASS — `pnpm run collection:current-mature-queue`：共享 overlay 被正常读取；Kling 已不在候选输出，下一开发候选仍为 `null`，Hailuo 保持历史 `HOLD_EVIDENCE`。
- HOLD — `pnpm exec tsx scripts/test-mature-candidate-current-state.ts`：现有静态断言仍要求 `queue.length=8`，当前 historical snapshot 与 overlay 实际得到 5 条；脚本在该基线断言处失败（`5 !== 8`）。本单仅修共享 overlay 数据，不修改既有测试。
- PASS — 生产只读重复查询：Hailuo matching tools/candidates 均为 0。
- PASS — Hailuo generic enqueue preflight：`ready=true`、`productionWrites=0`。
- PASS — Hailuo generic enqueue、candidate bridge、tool publication 的 rollback/commit/postcheck；最终为 `published + monitor/noindex`。
- HOLD — Freshness OpenRouter preflight：共享执行器只允许 monitor 行；此行为 continue_index。
- PASS — `git diff --check`。
- 未运行 TypeScript 或完整 build；本单仅有内容选择、SVG、运营 overlay 与审计文件变更，未涉及路由、渲染或运行时发布路径。部署后仅做一次生产页面/素材 smoke。

## 生产交叉矩阵

| lifecycle `status` | `page_quality_status` | 数量 |
| --- | --- | ---: |
| draft | monitor | 9 |
| pending | monitor | 13 |
| published | archive | 2 |
| published | continue_index | 28 |
| published | monitor | 51 |
| rejected | monitor | 11 |

- Tool ID 总数：**114**；published：**81**。
- page quality：`continue_index=28`、`monitor=84`、`archive=2`。不同维度不可相加。
- 索引日额度 0/5、周额度 10/25；sitemap 在本次 noindex 发布中不扩张。

## 固定交付文件

- Catalog selection：[`DAILY_OPERATIONS_2026-10-23_HAILUO_AI_SELECTION.json`](/Users/liukai/web/ai-best-tool/docs/DAILY_OPERATIONS_2026-10-23_HAILUO_AI_SELECTION.json)
- Freshness change-set：[`DAILY_OPERATIONS_2026-10-23_FRESHNESS_CHANGE_SET.json`](/Users/liukai/web/ai-best-tool/docs/DAILY_OPERATIONS_2026-10-23_FRESHNESS_CHANGE_SET.json)，空集；含五项处置与空集原因。
- 合并审计：本文件。

受保护的两份 SQL 修改和 `docs/FRESHNESS_CLAIM_DUE_BATCH_2026-10-15.json` 未纳入本单。

## 交付收口

- 主提交：`fa0062b1`，已推送至 `origin/main`；本地与远端 SHA 一致。
- 自动部署后，平台自有 Hailuo SVG 返回 200；EN/CN/TW 页面均返回 200、自 canonical、`noindex, follow`。
- sitemap 仍为 **148 URLs**，Hailuo 匹配 0；本次没有自动批准索引。
- `PLAN_DEVIATION`：Freshness 的 OpenRouter 真实差分因 `continue_index` 安全写入路径缺失而未提交；没有绕过或工具专属 SQL。索引 selector 无 A 级对象，因此本日索引批准 0。
- 需要 Owner：替换有效的 `GSC_REFRESH_TOKEN`。其余无需 Owner 操作。
- 下一步：下一次运行选择一个新的成熟组合候选，并把 `continue_index` 的低风险 Freshness 支持作为共享执行器缺口处理；不得重复今日 Hailuo 或五项复核。
