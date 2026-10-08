# Pika Claim 分层受控发布候选

日期：2026-10-08（Asia/Shanghai）。结论：`READY_MONITOR`，**待独立发布 QA 与总控批准**；尚未生产提交、部署或批准索引。日
历等待已由 Owner 取消，证据与质量门禁不变。

## 继承范围与实体门禁

沿用 [PIKA-PRERELEASE-01](./PIKA_PRERELEASE_2026-10-07_CN.md) 的身份、核心价值、历史独立使用和三语决策稿。唯一实体是
Mellis, Inc. 的 Pika 浏览器应用，canonical 拟为 `/ai/pika` 及对应中文路径。Pika 2.5、Product Ad、Studio 不拆实
体；API、MCP、iOS、old.pika.art 与 AI Self 权益不合并。Owner 指明 prerelease 已 `QA_PASS`；本次只重审到期或冲突 Claim、
素材和发布路径。

七项实体门禁在[发布 manifest](../data/collection/pika-controlled-release-preaudit-2026-10-08.json)中均为 `pass`：身份、
唯一 canonical、重复意图、核心能力、素材权利与法律安全、无明显误导、页面内容充分。本站自
绘[中性编辑封面](../public/images/tool-media/pika-editorial-cover.svg)以抽象画面表示参考图到短动态构想，不是 Pika logo、
产品截图或真实预览；未复制、热链、裁剪或托管官方/社区素材，也不声称本站生成过视频。真实使用界面由官方应用链接访问，不将
未经授权的预览当成发布前提。公开三语内容含适合/不适合、限制、Decision Card、来源和复查日；工具详情页现有
`ToolFeedbackBar` 连接纠错及 owner 更新表单，提交进入人工审核。

## Claim 级边界

当前[新定价](https://pika.art/pricing)与[旧 FAQ](https://pika.art/faq)继续冲
突；[迁移公告](https://pika.art/blog/welcome-to-the-new-pika)没有给出旧账户完整权益映射。八条 Claim 保持限定：套餐价格与
额度 `conflict`、credit expiry `conflict`、商用档位 `conflict`、下载/分享水印 `conflict`、导出格式 `unknown`、生成失败和
重试成本 `unknown`、商品文字/形状保真 `unknown`、当前视频隐私 `conditional`。每条记录官方来源和下次复查日；三语公开稿省
略精确套餐金额、额度和生成次数，不承诺商用许可、无水印、商品保真、私有工作区、无训练或导出格式。Pika 2.5 的参考图和静音
能力仅按[该模型专页](https://create.pika.art/apps/pika-2-5)表述；[Product Ad](https://create.pika.art/apps/product-ad)仅
证明图片加 brief 工作流。本次未登录、购买、生成或导出。

## 生产只读与回滚

`2026-10-08T15:11:58.504Z` 的 read-only 事务和 GET/HEAD guard 返回 Neon 实体及上下文匹配 0、Supabase profile
0；`pika`、`pika-ai`、`pika-labs` 三组路径三语言均为通用无 H1 壳页、200/self-canonical/noindex，不能把它们认定为已发布实
体或批准 alias。sitemap 126 URL，Pika 0。发布器 `--phase=preflight --online` 再确认数据库 0 行和英/简中
canonical/noindex/sitemap 排除。固定实体 ID 为 `23d1e226-15f1-568a-9906-57726d982780`；发布事务锁、名称/标题/域名及固定
ID 查重，必须恰好插入 1 行，拒绝覆盖现有受保护行。默认 `--phase=release` 写入事务后完整读回三语内容、features、媒体和
`published + monitor`，随即 `ROLLBACK`，已通过；再次 preflight 仍须为零实体。这些步骤只能证明候选可回滚且无残留，不能当
作生产上线后的页面或关系验收。

正式提交仅由总控在独立 QA 通过、素材已部署且 hash 一致后执行显式 `--commit`。提交后必须执行
`pnpm exec tsx scripts/candidate-release-pipeline.ts --candidate=pika --phase=verify --online --as-of=2026-10-08`；只有
它通过才可 close。该路径只读核验唯一固定 ID 实体为 `published + monitor`、英/简中/繁中页面 200/self-canonical/noindex 与
Decision Card、sitemap 中 Pika 为 0、Supabase 同名 Task 及对应 Tool Capability/Fit 均为 0。任一读取失败或值不符即失败；
不创建关系、不批准 `continue_index`。未部署的本地素材会让提交 fail-closed。

## 变更与验收

差分为 Pika 发布 manifest、三语 payload、自有封面、发布器候选注册/受保护行门禁和专项测试。源码与发布路径改动须执行 Pika
专项、Claim policy、candidate-release 回归、TypeScript 和一次完整 build；生产只读查重与事务 rollback 已执行。独立 QA 重
点检查：来源冲突没有变成绝对价格/权益承诺；三语正文复查日期和隐私边界；SVG 原创且不误认截图；固定 ID/重复实体负
例；`pika-ai`/`pika-labs` 壳路由不是新增别名；实际详情页纠错入口及 noindex/sitemap 边界。`productionWrites=0`，未 push。

执行结果：Pika 专项、Claim policy、统一发布器回归、`tsc --noEmit` 与一次 `pnpm run build` 均通过；生产
preflight/online、事务 ROLLBACK、回滚后的再次 preflight 均通过。格式检查只覆盖新增与改动文件，主追踪历史段落不做全篇整
理。

QA_FAIL 最小修复：三语稿将 Pika 2.5 与 Product Ad 能力明确限定为公开页面描述、未经账号及输出验证；八条 Claim 在三语稿均
有对应限制的专项断言。发布器新增 Pika 专属只读 `verify --online` 后检，当前未提交生产时按预期因零实体失败；随后事务
ROLLBACK 与再次 preflight 通过，证明 `productionWrites=0`。本次改动只涉及发布脚本与候选文案，不改变 Next.js 页面、路由或
构建配置，沿用本交付已通过的一次完整 build，不重复构建。
