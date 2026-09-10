# Best topic SEO 一致性修复（2026-09-10，初版历史）

> 本初版已被独立 QA 判定 FAIL；当前策略与修复以 [QA 修订说明](SEO_TOPIC_QA_REVISION_2026-09-10_CN.md) 为准。

基线：`main@f29b7dc3`。开发分支：`codex/seo-topic-consistency-2026-09-10`。
本任务仅修改代码和测试；未部署、未向 main 推送、未更改生产数据库。

## 现状和判断

生产页面 `/best-ai-tools/ai-automation-tools` 的 HTML 已复现 `Tools 0`、空数据占位、
头部 2026-09-09 与证据面板默认 2026-07-15 冲突，以及转化导流文案。
metadata 使用路由代码 `cn` 作 hreflang；next-intl 3.10.0 默认还独立生成全部路由语言的 HTTP alternate。

只读数据库盘点发现实际分类只有 `chatbot`、`design-art`、`life-assistant`、`other`、
`productivity`、`text-writing`。例如 n8n、Make、Pipedream 位于 productivity；Dune 和
The Graph 也位于 productivity；视频工具在 design-art，Otter 在 chatbot。
`automation`、`research`、`web3` 等只是决策主题，不存在对应数据库分类。
旧查询按这些 slug 查 category_id，因此稳定返回空数组。

不能把这些虚拟分类统一映射为 productivity：这会把无关工具变成榜单候选。
本次采用 `lib/data/topicToolSources.ts` 中的明确工具身份映射，跨数据库分类读取真实记录。
映射的用途边界依据既有 topic 定义、指南/对比页和工具记录进行核对；例如自动化对应 n8n/Make/Pipedream，
研究对应 Perplexity/Consensus/NotebookLM，Web3 对应 Dune/The Graph，语音对应 Otter/Fathom，
视频对应 Runway/Luma/Sora/Synthesia/Viggle。映射中没有数据库记录的名字不会生成卡片或增加计数。
其他已有数据库分类的 topic 保持原查询范围，未开展整站榜单重编排。

## 索引策略决定与影响

保留全部 28 个 topic 配置和原 en/cn 索引语言范围。页面、metadata、sitemap 共用同一候选选择规则：
已发布、未归档、未被安全隔离，具备非空名称/简介及 HTTP(S) 官网，并匹配主题映射或真实分类。
数量来自这个候选集；显示最多 8 条，计数为全部匹配记录。保留目录热门顺序，并明确说明含推广优先项、
不代表独立测评评分。未更改工具详情页的质量/索引门禁，monitor 记录的详情 noindex 状态不会因此被放开。

空榜没有资格通过一层通用模板作为可索引榜单。本次明确采用“至少一个真实可展示候选”的最低非空门禁，
并未套用分类页的 3 条阈值。数据可用且候选为零时，保留可访问的主题说明和诚实空态，但 metadata noindex、
不声明 hreflang、sitemap 不收录。数据库查询失败不等于没有候选：失败向上抛出，不能成功发布空榜或空的 topic sitemap。
未知 topic 交回 Next notFound 边界并保持 noindex，避免旧 catch 将其包装成成功的通用榜单。
本地实测共享布局已开始流式传输时 HTTP 状态可能为 200，仍有 Next 的 noindex 错误边界；未为此增加额外路由策略。

只读盘点结果为 24 个非空 topic、4 个空 topic。后者原先虽然进入 sitemap，但没有匹配的已发布记录：

| topic | 暂不收录原因 |
| --- | --- |
| ai-api-observability-tools | Langfuse/Helicone/Portkey/LangSmith 等候选没有匹配的已发布记录 |
| ai-ecommerce-tools | 电商专用候选没有匹配的已发布记录；不把通用生产力工具当作电商候选 |
| ai-evals-tools | Evals 专用候选没有匹配的已发布记录 |
| ai-prompt-testing-tools | Prompt 测试专用候选没有匹配的已发布记录 |

因此本快照中 sitemap 的 topic URL 从 56 个变为 48 个（4 个空主题 × en/cn = 减少 8 个 URL）。
这是有记录的空榜资格判断，不是删除主题，也不是为了通过测试虚填候选。
之后这些主题出现符合上述映射的已发布记录时，原主题可自动重新满足非空门禁。
完整记录见 `reports/seo-topic-consistency-2026-09-10/topic-inventory.json`。

## 日期、文案和 hreflang

Best topic 显式向 GuideEvidencePanel 传递中央 `best-topic-template` 的真实复核日期 2026-09-09，
并将标签标为“模板复核”，说明其不代表逐工具事实核验。
共享面板移除虚构的默认日期；其他调用方若未提供复核日期则不显示日期块，不自动补今天。
Best topic 的转化、流量、点击、提交路径等运营解释改为任务适配、限制、预算、来源和试用判断。
独立的“提交工具”功能按钮仍可正常使用。

metadata 统一将路由 cn 映射到合法 `zh-CN`，URL 仍是 `/cn`；语言集合为 en、zh-CN、x-default。
noindex 页面和历史语言不输出 alternate。共享 SEO helper 也保持同样规则和正确 canonical。
关闭 next-intl 自动 HTTP hreflang，由了解具体内容是否可索引的页面 metadata 作为唯一声明源。
路由中间件不能判断工具质量门禁或空榜；保留其自动 HTTP 声明会在 noindex 页面上重新广告错误 alternate。
实际安装版本的 middleware 测试和本地 HTTP 测试均验证没有竞争的 HTTP hreflang。
此方式也符合 [next-intl alternateLinks 配置说明](https://next-intl.dev/docs/routing/configuration#alternate-links)。

静态 sitemap 的 lastModified 改读 `lib/seo/staticPageDates.ts`：既有页面以 git 最后编辑提交/日期登记，
Explore 使用中央复核记录；本次更改的 Best 页面登记 2026-09-10。登记缺失报错，不能回退构建时间。
语音与视频指南因移除共享面板默认日期也登记本次编辑日期。这些是编辑日期，不冒充工具事实复核日期。
动态工具与分类继续使用各自数据库更新时间，索引边界不变。sitemap 使用 force-dynamic 按请求读取候选资格，
避免构建快照在最后一个候选被移除后仍广告空榜。

## 验证与限制

自动测试覆盖跨分类取数、无关记录排除、归档/未发布/空内容排除、去重、分页计数、真实空榜、数据库异常、
metadata/sitemap 同源判断、无默认日期、中央日期传参、文案、静态日期登记与实际 middleware 输出。
旧 virtual-category 守卫曾在页面源文件内寻找已迁出的 metadata 配置，已修正为检查中央配置及页面引用。
该失败可在基线代码直接复现。

最终退出码、构建与 HTTP 验证结果登记在同目录验证报告和 JSON 中。独立验收应重点确认四个空主题的资格决定、
路由层不再单独输出 HTTP alternate 的设计，以及数据库中原有宽分类 topic 的内容相关性。
本次未重新策划所有宽分类榜单；例如 productivity 子主题之间仍可能共享候选。工具事实质量由现有详情门禁继续管理。

当前目录少于 10,000 条公开记录，目录加载只做一次工具查询和一次分类查询，并在同一服务端渲染请求内复用。
若目录超过当前上限会明确失败，不能静默截断后产生错误的空榜判断；扩大规模时需补分页取数。
