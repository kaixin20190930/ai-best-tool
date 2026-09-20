# ElevenLabs 延期补发交付（2026-09-14）

状态：2026-09-20 已完成官方事实复核、生产事务发布、数据库回读和线上独立验收。当前为 `published + monitor/noindex`，未批准
索引或 sitemap 扩张。

本轮基线：`origin/main` 的 `6db15474`。候选在当前主线工作区完成复核；生产写入仍由发布器事务门禁控制。

## 发布边界

| 项目             | 值                                         |
| ---------------- | ------------------------------------------ |
| 原计划发布槽     | 2026-09-13                                 |
| 当日事实复核     | 2026-09-20（9 月 14 日候选于本日重新核验） |
| 当前状态         | 已发布；进入 48–72 小时技术观察            |
| 允许的生产状态   | `published + monitor`                      |
| robots / sitemap | `noindex,follow` / 排除                    |
| 下次事实复核     | 2026-10-20                                 |

预审仍保留历史 `reviewedAt=2026-09-09`。正式 payload、editorial、pricingSnapshot 与 evidence 的核验日期统一为
2026-09-20。只有生产事务 commit、数据库回读和完整线上审计全部成功后，才可更新预审为 `released` 并写入真实
`releasedAt/actualPublishedAt`；材料准备日不能冒充实际发布日期。

## 当日事实结论

- 月付套餐：Free `$0/10k credits`、Starter `$6/30k`、Creator 标准 `$22/121k`（页面当前首月 50% 促销为 `$11`）、Pro
  `$99/600k`、Scale `$299/1.8M + 3 seats`、Business `$990/6M + 10 seats`、Enterprise 议价；价格不含税。年付按十个月月价
  一次性支付。促销与标准价已分开，不把 `$11` 写成长期月价。[官方 Pricing](https://elevenlabs.io/pricing)
- 所有产品共用 credits 池。当前公开换算依产品、模型、网页/API、工作流及水印不同；TTS 约每字符 1 credit，Flash/Turbo API
  可能为 0.5–1，STT、Music、Sound Effects、Voice Changer/Isolator 与 dubbing 各有不同分钟或生成计量。换算不是固定的“成品
  分钟”。免费重生成有限，且网页规则不适用于 API。[Billing](https://elevenlabs.io/docs/overview/administration/billing)
- 未用付费 credits 在维持合格套餐时最多结转两个月；取消或降级后不再结转，当前周期结束后未用付费额度失效。
- Free 不含商业许可且公开需署名；合格付费套餐的商业使用仍受底层脚本、录音、声音、音乐、肖像等权利、禁止使用政策、专项条
  款与适用法律约束。Beta 输出不得用于商业或生产环
  境。[商业使用说明](https://help.elevenlabs.io/hc/en-us/articles/13313564601361-Can-I-publish-the-content-I-generate-on-the-platform)
  · [Terms](https://elevenlabs.io/terms-of-use)
- IVC 与 PVC 的样本、稳定性、套餐及验证要求不同。官方文档说明验证无法保证录音一定属于申请人，授权责任仍在创建者；成功克
  隆不能代替书面同意、访问控制、披露与事件响
  应。[Voice cloning](https://elevenlabs.io/docs/eleven-api/concepts/voice-cloning) ·
  [Safety](https://elevenlabs.io/safety)
- 2026-05-20 隐私政策说明，内容和 Voice Data 可用于服务、安全和模型改进，训练 opt-out 只向前生效；除法律另有要求，声音衍
  生数据最长保留至最后互动后三年。默认不是零留存。[Privacy](https://elevenlabs.io/privacy-policy)
- ZRM 仅向部分 Enterprise 客户及符合条件的 API 产品开放；网页 UI、声音克隆样本、dubbing、Music、Studio 等不覆盖，且会减
  少故障排查证据。[Zero Retention Mode](https://elevenlabs.io/docs/eleven-api/resources/zero-retention-mode)
- HTTP、TTS WebSocket 与 Text to Dialogue WebSocket 的并发计法不同；套餐并发数字不能当作同时通话数或延迟承诺。生产必须测
  试 429、超时、重试、密钥轮换、用量告警、缓存、观测及备用路
  径。[Models and concurrency](https://elevenlabs.io/docs/overview/models)

本次没有登录 ElevenLabs 账户、克隆声音、购买套餐或做生产负载测试，因此正文只写公开文档事实和可执行试用协议，不声称本站亲
测。没有沿用预审中的 `$500M ARR`、G2 实时评论数或精确搜索量。

## 独立依据

- [Zapier hands-on review](https://zapier.com/blog/elevenlabs/)：支持多类音频与 agent 工作流的决策价值，同时记录提示学习
  成本和输出不稳定。
- [Consumer Reports safeguards assessment](https://www.consumerreports.org/media-room/press-releases/2025/03/consumer-reports-assessment-of-ai-voice-cloning-products/)：2025
  测试记录未授权克隆和仅自我声明的不足；用于风险边界，不冒充 2026 当前功能快照。
- [Axios safety scrutiny](https://www.axios.com/2026/04/16/hassan-congress-scams-audio-deepfakes)：记录 2026-04 美国国会
  继续追问同意、诈骗防护和违规检测。

独立依据支持“值得建立决策页”和风险解释，不替代官方当日价格、条款或账户级实测。

## 媒体、三语言与 Decision Card

- Logo 采用 [ElevenLabs 官方 press 页面](https://elevenlabs.io/press)提供的黑色 SVG 字标，原始路径为
  `/icons/tool-logos/elevenlabs.svg`，SHA256 `7a41b7f26b6286f607d34c80a658ef06e5cb6c094a1b087b563c8508e15f2178`。
- Thumbnail 在 1400x800 白色画布中完整内嵌相同官方路径，仅调整画布与留白，路径为
  `/images/tool-media/elevenlabs-release-cover.svg`，SHA256
  `4fb6529e6bf2b7057f310a5ac2daf66003cc696d2a14c3c7c976c471e0bb23f4`。它不是产品截图或效果证明；已按原始画布视觉核验，字
  标完整、比例和留白正常。
- `data/collection/elevenlabs-release.json` 显式包含 en/zh/cn title、summary、长文与 use cases；Decision Card 包含 3 条
  best fit、3 条 not ideal、6 个比较维度及 8 条限制。
- 完整正文分别呈现价格/促销、credit 换算/rollover、商业权利、克隆同意、安全、隐私/ZRM、API 并发/错误处理及来源日期。

## 生产基线与 rollback

只读报告：`reports/releases/2026-09-14/elevenlabs/production-baseline.json`。

- 按 `elevenlabs`、`eleven-labs`、`elevenlabs.io` 及本地化标题查重，生产实体为 0。
- `/ai/elevenlabs` 与 `/cn/ai/elevenlabs` 均为 200、自 canonical、`noindex,follow`，且不在 sitemap；正文仍是“temporarily
  unavailable”，因此只是保留路由，不是完整工具页。
- sitemap 为 116 条，SHA256 `542b83ce429181dd19327324e4897c05b04f7348ca6ca9aba096fa5ed7d673cb`；本候选没有消耗索引额度。
- 两个素材已部署并通过线上 MIME 与 SHA256 校验，生产事务不再被媒体门禁阻断。
- `validate` 与 `preflight --online` 通过；事务 release 首次因预审错误的 `text-to-speech` storage slug 不存在而失败并回
  滚。只读生产分类确认既有 voice discovery 映射应存入 `chatbot`；纠正后第二次事务完整回读 en/zh/cn、features、媒体与
  `nextReviewDate=2026-10-20`，随后 `ROLLBACK` 成功。未新增实体。

## 下一步（必须由总控推进）

1. 2026-09-20 生产事务已提交，唯一实体 ID 为 `d7b63bf2-63c8-4015-b59d-2f627450813f`；en/zh/cn 回读完整。
2. 双语言 canonical 页面均为 200，展示完整正文、Decision Card、比较维度和官方素材；数据库质量状态为 `monitor`。
3. 全站索引一致性审计通过：48 个 published 工具中 13 个可索引、35 个暂停索引，页面检查 0 个问题；ElevenLabs 不在 sitemap。
4. 独立发布报告为 [production-release.json](../reports/releases/2026-09-20/elevenlabs/production-release.json)，0 个失败且无生产写入。
5. 继续保持 `published + monitor/noindex`。最短 48–72 小时后只能进入独立索引评审，不能自动放开索引；下次事实复核为
   2026-10-20。
