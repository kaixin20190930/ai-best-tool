# Catalog 开发准备审计：MossImage 与 Pixform

日期：2026-10-24（Asia/Shanghai）

机器字段按实际抓取时的 UTC 日期 2026-10-23 记录，以符合现有 OPS2 schema 的 UTC 日期门禁。

范围：R 级来源核验、OPS2 选择包结构、平台自有 SVG 与 SHA-256、Neon 生产只读查重。没有执行 TypeScript、build、smoke、生产写入、入队、发布、关系/index/sitemap 变更或 Git 操作。

## 结论摘要

| 对象 | 实体结论 | 生产查重 | 发布建议 |
| --- | --- | --- | --- |
| MossImage (`mossimage.run`) | 独立托管图像创作工作室；Moxion Labs LLC 运营；明确声明不隶属 OpenMOSS 或 fal.ai。现有 OpenMOSS MOSS-Image 是独立模型/仓库实体 | 未发现该产品域的工具或候选。发现既有 OpenMOSS 模型工具 `96ea73cc-904d-46bc-8206-78d905b4d521`，及其已导入候选 `0402f14b-539f-4477-9f2c-253a5723441f`；两者必须保留且不得合并、覆盖、改 canonical 或重定向 | 可进入通用 preflight；独立最终 QA 通过后建议 `published + monitor/noindex`。页面名称与介绍应持续写明“独立托管工作室”，以区别模型实体。未授权入队或发布 |
| Pixform (`pixform.ai`) | 面向静态照片的风格转换，另有独立双照片静态换脸工具。公开页面未说明法律运营主体 | 未发现名称、域名、canonical 或候选碰撞 | 可进入通用 preflight；独立最终 QA 通过后建议 `published + monitor/noindex`。GIF、多脸选择和视频换脸均明确是计划/考虑功能，不得写成上线能力。未授权入队或发布 |

本目录近期 OPS2 基线要求普通 Catalog 使用通用流程、默认 `published + monitor/noindex` 且索引资格独立审核。主优化 tracker 最近更新为 2026-10-19，当前可读文件中未找到 2026-10-24 专属 task lock；本交付遵守用户固定对象和范围指令，不推断额外的队列/发布授权。搜索需求数据不可用，不声称流量或搜索量。

## 来源与事实边界

### MossImage

已直连核对 [官网](https://mossimage.run/)、[价格](https://mossimage.run/pricing/)、[隐私](https://mossimage.run/privacy/) 和[条款](https://mossimage.run/terms/)。官网 HTTP 200，robots.txt 允许公开页面抓取并列出 sitemap；官网声明 `https://mossimage.run/` self-canonical、`index, follow`。价格页、隐私页和条款页也提供 self-canonical。官网将产品称为独立 studio；条款称运营方是 Moxion Labs LLC，且与 OpenMOSS 和 fal.ai 无关联。

官网描述 MOSS-Image-SFT 文生图、中英文文字、JSON 布局提示，并称通过 fal.ai 托管；其他编辑工作流使用其他模型。定价页当前列出 3 张免费入门图片、USD 9.99/30 张一次性包、USD 14.99/月/80 张、USD 119/年/800 张，并提示可能另加税。隐私页称提示词和设置送往 fal.ai、输出由供应商托管、Stripe 处理账单；供应商自己的保存/删除规则不由该页保证。未实测结账、账户权益、输出、模型路由或服务可靠性。

实体区分：OpenMOSS MOSS-Image 是公开开放权重模型系列及仓库；mossimage.run 是独立运营、使用该模型之一并集合其他模型/编辑流程的托管产品。fal.ai 是处理供应商。三者不能因共享“MOSS-Image”字符串而合并。生产中现有实体 ID 与候选 ID 均在选择包中显式记录。

### Pixform

已直连核对 [官网](https://pixform.ai/)、[About](https://pixform.ai/about)、[隐私](https://pixform.ai/privacy)、[条款](https://pixform.ai/terms/) 和 [Face Swap 路线图页](https://pixform.ai/face-swap)。官网、robots.txt 和内容页均可访问；官网根页声明 `https://pixform.ai` self-canonical、`index, follow`，robots.txt 允许公开抓取并列出 sitemap。

官网称主流程接受不超过 10 MB 的 JPG/PNG/WEBP 静态图，提供六种风格转换。Terms 描述初期版本免费、免注册，每个 IP 每小时最多 10 次尝试，受容量影响；没有描述付费订阅。隐私页称照片发送至 Replicate，处理完成后一小时后不可访问、下一次清理时删除，未完成任务两小时后过期；Replicate/Cloudflare 各自处理数据。条款将商用权利限定于源图权限、模型许可与第三方权利。About/条款未指出法律运营实体，故 selection 未猜测运营方。

Face Swap 页另外描述两张静态照片换脸，并明确 GIF、可选择的多脸换脸及视频换脸为 planned/under consideration，当前仅支持静态图片。Selection 将其写为未上线限制；未将 GIF/多脸/视频作为现有功能。未上传图片或测试生成。

## 生产只读查重

通过 `.env.local` 中已有直连配置连接 `neondb`，执行 `BEGIN READ ONLY`，并回读 `transaction_read_only=on`；只查 `tools` 与 `collection_candidates`，最后 `ROLLBACK`。工具匹配包含 name/title/URL/content/detail/features，候选匹配包含 title/url/normalized_url/raw_payload：

- Pixform / `pixform.ai`：工具 0，候选 0。
- MossImage / `mossimage.run`：目标工作室 URL/名称候选 0；另发现 OpenMOSS MOSS-Image 模型实体和已导入候选各 1（上文 IDs）。未修改任何行。
- 选择包 `checkedToolIds` 为空，因为这是不绑定 Task 的 Catalog；既有模型仅作为明确的身份/合并边界记录，不冒充 Task Fit 查重。通用 enqueue preflight 尚未执行，最终实体/名称/标题/canonical 与媒体验证仍需由正式通用流程复查。

## 交付文件与校验

- `docs/DAILY_OPERATIONS_2026-10-24_MOSSIMAGE_RUN_SELECTION.json`：OPS2 通用 selection、三语言完整内容、官方来源、Claim 边界和 OpenMOSS 实体分隔。
- `docs/DAILY_OPERATIONS_2026-10-24_PIXFORM_SELECTION.json`：OPS2 通用 selection、三语言完整内容、来源和明确的 roadmap 限制。
- `public/images/tool-media/mossimage-run-editorial-cover.svg`：原创中性 studio/图像画布视觉，无厂商 Logo、截图、嵌入图片、脚本或外部引用；SHA-256 `454ce93d37c50279482696428caa692e8ceb007ff2f03c02991b543fbb1f7eca`。
- `public/images/tool-media/pixform-editorial-cover.svg`：原创中性静态图像转换视觉，无厂商 Logo、截图、嵌入图片、脚本或外部引用；SHA-256 `3e7a25e8b9cda10458f011a1c21697a24a8bafc0116cad3153de4eabf793830a`。
- 本审计：来源、查重结果、差分、发布建议与限制的合并记录。

格式复核：两个 JSON 均可解析；必需的 `en/cn/tw` 均存在；每包有至少两个互补官方来源；均为无 `taskSlug` 的普通 Catalog，`checkedToolIds=[]`；SVG SHA 已重算并写回选择包。没有运行 OPS2 TypeScript preflight 或测试。

## 差分与限制

这是新增的两个数据选择包、两张平台自有素材和一份审计，不改运行时、脚本、测试、数据库 schema/数据、Task/关系、SEO 索引或 sitemap。工作区中原有的 `db/supabase/manual/20261003_perplexity_plans_claim_correction.sql`、`db/supabase/migrations/20261005_admin_gemini_fit_rationale_recovery.sql` 修改和未跟踪文件 `docs/FRESHNESS_CLAIM_DUE_BATCH_2026-10-15.json` 均为执行前已存在，本次未触碰。

真实待办：最终入队前须运行通用 enqueue preflight 并以其生产前像与媒体校验结果为准；最终公开前须独立 QA。Pixform 的法律运营主体没有从所核对的公开页得到证实；MossImage 的价格/账户权益和 Pixform 的即时容量、账户生成结果均未实测。当前没有生产写入或发布授权。
