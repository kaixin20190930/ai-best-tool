# Pika 受控预发布深审：PIKA-PRERELEASE-01

核查日：2026-10-07（Asia/Shanghai）。基线 `21cf633fcfe7c2e9d3e4194776de12932a2213eb`。结论 **HOLD_EVIDENCE：6 PASS / 2
HOLD（official、content）**，独立 QA 待执行。不是发布批准，也不是发布器输入。

[完整候选包](../data/collection/pika-prerelease-2026-10-07.json)包含三语 Tool Intelligence / Decision Card、事实、冲突、
来源日期、生产回读和研究关系假设。遵
循[收录宪法](./BEST_DIRECTORY_POSITIONING_AND_INTAKE_CN.md)、[索引政策](./TOOL_INDEX_RELEASE_POLICY_CN.md)、[当前运营台账](./OPS_RESET_CANDIDATE_BUFFER_2026-10-06_CN.md)，
参照 [Murf](./MURF_PRERELEASE_2026-10-07_CN.md) 与 [Elicit](./ELICIT_PRERELEASE_2026-10-07_CN.md) 包。唯一下一发布候选仍
为 Elicit，Pika 顺位仍为 3。

## 八项门禁

| 门禁           | 结论 | 依据与精确边界                                                                                                               |
| -------------- | ---- | ---------------------------------------------------------------------------------------------------------------------------- |
| 对象明确       | PASS | Mellis, Inc. 运营的 pika.art / create.pika.art 浏览器应用；模型、Product Ad、Studio 不拆实体；API/MCP/iOS/旧界面不混权益。   |
| AI 价值明确    | PASS | 参考图/提示词生成可审查的短动态，是任务实质能力；不宣称商品保真。                                                            |
| 实际可用       | PASS | 官方账号/购买入口可追溯，限合法地区成年用户；未登录、购买、生成，Free 注册不等于免费生成。                                   |
| 官方证据完整   | HOLD | 新旧权益、迁移映射、水印路径及加购到期冲突；Pika 2.5/Product Ad 实际 credits、失败返还、导出格式与当前视频隐私范围未核。     |
| 独立市场依据   | PASS | 两位不同作者的历史真实输入/输出记录；不证明当前套餐、广告可用或商品文字准确。                                                |
| 决策价值       | PASS | 明确保密/精确包装拒绝条件，先试非保密清权商品样图，比较 Runway/Luma 的参考控制和返工量。                                     |
| 内容真实完整   | HOLD | EN/CN/TW 编辑稿完整，但官方素材复用/处理/署名、真实当前预览、独立内容/视觉 QA、本站纠错/owner 展示验收未完成。               |
| 不重复且可维护 | PASS | 本次实体/profile/上下文无匹配，唯一拟用 pika；记录壳路由而不批准 alias。复核责任为编辑研究、下次 10-14，发布日另做完整查重。 |

维护门槛 PASS 只覆盖已核查的数据库字段与仓库意图，不认证任意未解析壳路由为 canonical alias。证据冲突由 official 阻断；素
材与真实纠错入口由 content 阻断，不能靠市场成熟抵消。

## 产品、额度和导出

[官网](https://pika.art/)与 [09-17 迁移公告](https://pika.art/blog/welcome-to-the-new-pika)确认新多模型应用；公告称旧订
阅沿用，旧界面暂存于 old.pika.art，但不能推定旧额度、许可或充值余额如何映射。公告的“套餐只差额度/并发”又与当前定价的商
用、优先队列和抢先使用差异不符，保留冲突。

[定价页](https://pika.art/pricing)本轮观测美元月付：Free 0 / 0 credits、Starter 10 / 900、Creator 35 / 3150、Fancy
95–880 / 从 8550 起；年付月均分别 0、8、28、76–704，Enterprise 定制。仅是日期化观察，不是结账保证；三语稿不承诺数字。周
期额度不结转；充值有效期为 365 天，仅 Create，不适用 API/MCP/iOS/old.pika.art。[旧 FAQ](https://pika.art/faq)仍列
Basic/Standard/Pro/Fancy 的 150/700/2300/6000，并称购买额度不过期。这不是可自行选取有利条款的替代菜单。

[Pika 2.5 专页](https://create.pika.art/apps/pika-2-5)说明文生 5 秒、图生 5/10 秒，720p/1080p；Frames 输入 2–5 张，每段
1–5 秒，恰好两帧可 10 秒；五帧组合限 720p，输出静音。迁移公告的 Studio 多镜头/音频属于另一工作流；旧 FAQ 内 Pikaframes
10/25 秒自相矛盾，不能外推。 [Product Ad](https://create.pika.art/apps/product-ad)只有图片加 brief 的工作流说明，未证明
模型选择、商品文字保真、输入文件限制或交付格式。

当前价格表称各档无水印，但旧 FAQ 将无水印下载限定 Pro/Fancy，并称直接分享各档都有水印；下载与分享必须分别验证。新页商用
为 Creator/Fancy/Enterprise，Free/Starter 不含；旧 FAQ 为 Pro/Fancy。不能写“付费即可商用”。导出容器/编码、Pika 2.5 与
Product Ad 每次消耗、失败返还及重试扣费仍 unknown；不把其他模型的估算成本套用。取消在账期末生效且无按比例退款，不等于删
除账号；降级/终止后的取回期限未知。

## 权利、隐私与素材

[条款](https://pika.art/terms-of-service)的输入/输出权益保留不等于版权、独创或不侵权保证；上传图片、人物和第三方素材须清
权，第三方模型另有条款。普通内容可用于模型改进，AI Self 与企业书面协议例外不能套到浏览器视频。删除账户不保证从已训练模型
移除。

[隐私政策](https://pika.art/privacy-policy)列目的/法定保留及去识别化持续使用；生物信息的期限与条款 AI Self 删除措辞作用
对象不同，不能拼成普通视频及备份删除 SLA。旧 FAQ 的 Templates 可见性声明与当前 Create 私有范围尚未对应，退出训练机制未验
证。条款的家长同意语言与隐私页未满 18 岁限制并存，本稿仅面向成年人。

仅记录官网品牌及 Video Studio 官方媒体的出处，**没有下载、复用、裁剪、翻译图片或嵌入素材**。仓库 `pika.svg` /
`pika-cover.svg` 是历史生成占位，明确排除。需取得官方 logo 和当前真实预览、权利人、目录使用/托管/嵌入及处理范围、署名要
求；公开示例与社区样片本身不构成授权。

厂商纠错线索为 support@pika.art 和[联系/支持入口](https://pika.art/contact)，本轮未发消息。本站真实纠错/owner 更新入口仍
须连接到最终展示并验收；仅写地址不能解除 content HOLD。

## 独立采用及核查边界

- [Tom’s Guide](https://www.tomsguide.com/ai/ai-image-video/i-just-pika-2-to-the-test-and-its-the-best-ai-video-generator-yet-and-better-than-sora)：Ryan
  Morrison，2024-12-18；图生、文生和 ingredients 实际测试，记录衣服被解释为机器人等偏差。包含联盟营销披露；不采用优于其
  他产品的排名结论。
- [MSPoweruser](https://mspoweruser.com/pika-ai-review/)：Deyan Georgiev，页面更新 2025-11-04，实际测试日未知；展示输
  入、重试、缺失笔记本及图像动画偏差。更新日不充当测试日，旧价格和综合评分不作当前事实。

两份各自实际使用记录满足历史产品采用门槛；没有本站实测、当前产品包装成功率、付费规模或无人工返工保证。三语稿明确这一边
界。

## 只读生产与意图

`2026-10-07T01:06:53.661Z`（UTC 时间，上海加 8 小时）在 PostgreSQL 默认只读及 `BEGIN READ ONLY` 事务内 SELECT 后
ROLLBACK；Supabase 仅 GET，外层 GET/HEAD guard。Neon name/title/url/features/tags 对 pika/mellis 搜索为 0；profile
name/domain 为 0。总表 69，published 54（17 continue_index、35 monitor、2 archive），draft 9、rejected 6。

pika、pika-ai、pika-labs 三种路径各三语均 200/self-canonical/noindex，没有产品 h1；sitemap 126，Pika 0。这是通用无实体壳
路由，并非三个已发布产品。仓库 app/lib/components、alias 表无 Pika 引用；历史导入/补全脚本仅使用 pika。未发现具体竞争意
图，唯一候选 canonical 为 /ai/pika，不新增 alias、同义页或 Task。发布日须重核全部入口、实体、消费者和 canonical；本轮不
修改 metadata/index/sitemap。

## 验证与交付

复现命令（环境文件路径由操作环境提供，不输出凭据）：

```sh
python3 -m json.tool data/collection/pika-prerelease-2026-10-07.json > /dev/null
pnpm exec tsx scripts/test-pika-prerelease.ts
pnpm run test:candidate-release
pnpm run test:mature-candidate-buffer
pnpm exec prettier --check data/collection/pika-prerelease-2026-10-07.json data/collection/mature-candidate-buffer-2026-10-06.json docs/PIKA_PRERELEASE_2026-10-07_CN.md docs/OPS_RESET_CANDIDATE_BUFFER_2026-10-06_CN.md scripts/check-pika-prerelease-readonly.ts scripts/test-pika-prerelease.ts scripts/tsconfig.pika-prerelease.json
pnpm exec tsc --noEmit
pnpm exec tsc --noEmit --project scripts/tsconfig.pika-prerelease.json
PUB03_ENV_FILE=<现有生产环境文件> node scripts/pub-03-readonly-run.mjs pnpm exec tsx scripts/check-pika-prerelease-readonly.ts
pnpm run seo:production-smoke
git diff --check
```

JSON、专项、候选流水线、历史缓冲专项、格式与差异检查、主项目及脚本级 TypeScript、生产只读、SEO smoke 均通过。专项检查 17
个审计链接、来源 URL/日期、三语边界、其他候选及缓冲顶层无变更、零批准与只读脚本限制。10 个官方来源与 2 个独立采用来源均
直接回读；Try Free 子链接失败另列，不计为账号生成验证。主追踪仅格式化新增段落，保留历史段落原样。工作树复用主仓已安装依
赖的被忽略软链接，没有安装或修改主仓依赖。无运行时代码变化，不执行完整 build。

`productionWrites=0`。未创建 Tool、关系、Task Page 或可执行 SQL；未 push、部署或批准发布/索引。
