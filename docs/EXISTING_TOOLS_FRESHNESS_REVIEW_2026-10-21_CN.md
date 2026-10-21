# 已收录工具 Freshness 只读复核（2026-10-21）

## 范围与状态

本次按 selector 选中的五个 `published + continue_index` 工具，仅使用官方公开页面复核指定事实。以下生产行身份、状态、日期与 SHA-256 来自本次交付单元此前已完成的只读快照；本次 QA 修订没有重新连接或访问生产。

本文件是只读审计，不是可执行 change set。生产写入：**0**。未运行 TypeScript、build、smoke；未改运行时代码、索引或 sitemap；未 commit/push。

| 工具 | Tool ID | 状态 | `next_review_date` | 结果 | 生产行 SHA-256 |
|---|---|---|---|---|---|
| Midjourney | `f008c10a-7f0d-4b21-827e-724b305c1b73` | `published + continue_index` | 2026-10-14 | 本轮范围内公开套餐与商用边界未发现变化 | `9f001a468c38f21e6f89fcebd9ef6e77eae95898848a6510f415ad3c952ec278` |
| OpenRouter | `f77fb817-e8dc-4c22-b7cd-8edc2e5b0a5e` | `published + continue_index` | 2026-10-15 | 当前公开定价仍与页面表述一致；Enterprise 仍为 custom/unknown | `537e47083a3b97dfab73c1537e08c4736d1c10d2ab571205e8d477a517fa5944` |
| ElevenLabs | `d7b63bf2-63c8-4015-b59d-2f627450813f` | `published + continue_index` | 2026-10-20 | 公开套餐价格与额度未发现变化；v4 分档可用性无法从公开比较页可靠确定 | `dadf9d022dd0e4759e5260dd4387b6317eba2f62f4a5286b3d0648f4d95fa328` |
| Fireflies | `57b270b9-78cf-41f8-8b74-dec46400cd65` | `published + continue_index` | 2026-10-20 | 存在需修订的高风险计费 Claim；本次不生成可写 manifest | `e8062de755c598b614b473ba65e17929d62a59702116750bd6885bdcf4040ca8` |
| Glean | `fd861409-8228-4deb-9802-a9f807d66256` | `published + continue_index` | 2026-10-20 | 公开路径仍未提供稳定自助价目表，与现有 custom enterprise quote 边界一致 | `8ebc0d32369ed6c2c7f309ba55dd3c86c34cf7b8d3264c51d2b00ed260671d6f` |

## 官方来源与观察

### Midjourney

- [官方套餐比较](https://docs.midjourney.com/hc/en-us/articles/27870484040333-Comparing-Midjourney-Plans)：仍列 Basic、Standard、Pro、Mega；月价分别为 $10/$30/$60/$120，年付总价为 $96/$288/$576/$1,152；Fast GPU 时间、Relax 和 Stealth 资格与当前页面描述相符。
- [官方商业使用说明](https://docs.midjourney.com/hc/en-us/articles/27870375276557-Using-Images-Videos-Commercially)：年收入超过 $1 million 的公司及其员工需 Pro 或 Mega 才能为公司商业使用。未发现本轮页面 Claim 变化。

### OpenRouter

- [官方定价](https://openrouter.ai/pricing)：Free 仍列 25+ 模型、4 个供应商、50 requests/day；Standard 5.5%、Business 8% 平台费；Standard 与 Business BYOK 仍列每月 $25,000 标价推理免平台费、超出后 5%。Enterprise 费用/条款仍为 custom，不能推断具体报价。
- [供应商选择](https://openrouter.ai/docs/guides/routing/provider-selection)、[供应商日志政策](https://openrouter.ai/docs/guides/privacy/provider-logging)：本轮未发现现有公开边界需要改写。

### ElevenLabs

- [官方定价](https://elevenlabs.io/pricing)：当前月价和包含额度仍与现有页面相符：Free $0/10,000 credits、Starter $6/30,000、Creator $22/121,000（页面另显示首月 $11 促销）、Pro $99/600,000、Scale $299/1.8M/3 seats、Business $990/6M/10 seats、Enterprise custom。
- 当前价目比较页出现 Eleven v4 与 v3 模型行，但公开抓取内容没有可靠呈现逐套餐可用性。现有文案没有断言 v4 不可用，因此本次不改写；不得从模型行推断某一套餐的 v4 权益。

### Fireflies：高风险 Claim 待更新

- [官方账单条款](https://guide.fireflies.ai/articles/9606045468-fireflies-billing-terms)（页面标示更新于 2026-10-16）说明：付费套餐账户在尚未订阅 AI Credits 前用完一次性注册 credits，会自动加入最低的 $5/月、50-credit 档，并显示 dashboard disclaimer。Free 用户用完额度则看到付费墙；除非主动升级，否则不会收费。7 天 AI Credits 试用转换为付费订阅是另一条独立规则；现有订阅用户的后续升级取决于 Auto-Upgrade。
- [AI credits 价格说明](https://guide.fireflies.ai/articles/2114151875-learn-about-ai-credits)与[Pro 套餐说明](https://guide.fireflies.ai/articles/1092250300-learn-about-fireflies-pro-tier-features)：核心套餐公开价格与现有说明一致；AI Credits 是独立付费附加项。
- 必须修正的边界：**官方公开文档没有说明存在一个通用设置，可以阻止付费套餐用户首次因用完注册 credits 而自动加入 $5/50-credit 订阅。**不要暗示关闭 Auto-Upgrade 就能阻止这次初始自动加入。用户应在使用前检查 Billing 中的订阅与 Auto-Upgrade 状态；但是否存在能阻止首次自动加入的 opt-out，公开来源未说明。
- 该事实会影响意外收费风险，是已索引页面的高风险 freshness 更新。当前通用 executor 将 `page_quality_status` 硬编码为 `monitor`，而 Fireflies 是 `continue_index`，所以此前生成的 manifest 不兼容并已删除。**后续须由支持 `continue_index`、保护索引字段且有精确前像/回滚的通用 executor/change set 处理；本次不绕过门禁，不写生产。**

### Glean

- [官方定价路径](https://www.glean.com/pricing)当前重定向至 Glean 主站，没有稳定公开的自助套餐表或每席位价格。
- [官方平台页](https://www.glean.com/platform)维持企业产品定位。现有页面以定制企业报价描述，并未承诺精确席位价格；本轮未发现公开价格 Claim 变化。

## 下一步

为 Fireflies 的已索引 freshness 建立兼容 `continue_index` 的通用受控更新能力后，再提交精确三语言 Claim 差分；在该能力具备并通过相应独立 QA 前，保持生产原样。此报告不授权任何写入。
