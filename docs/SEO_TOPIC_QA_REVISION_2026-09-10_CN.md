# 独立 QA 阻断项修复

起点：`68f9338d`；分支仍为 `codex/seo-topic-consistency-2026-09-10`。
独立 QA 对初版判定 FAIL。本说明取代初版中“保留宽分类兜底”“一个候选即可索引”及
“共享组件改动登记为 09-10 内容复核”的策略。初版报告仅保留为历史记录。

## 1. 全部主题采用显式用途清单

`TOPIC_TOOL_NAMES` 改为完整 `Record<TopListTopicKey, ...>`，编译和测试均要求覆盖全部 28 个主题。
选择函数不再读取分类：即使所有无关工具都在同一个 productivity 分类，也不能成为候选。
未知/漏登记键失败关闭。清单为空表示等待专门工具证据，不会自动用分类补齐。
正文里的旧“常见入口”示例链接也必须属于本次实际候选集，不另设未登记工具入口。

依据是已维护工具记录的明确任务范围：

| 主题 | 实际候选与用途边界 |
| --- | --- |
| Agency | Notion、Gamma、Make：项目文档、客户交付材料、重复交付流程 |
| API observability | 无已确认专用候选；不以模型网关充当完整日志/追踪套件 |
| Agent | n8n、Codex、Emdash：构建/运行多步代理，包含代码代理环境 |
| Automation | n8n、Make、Pipedream：触发器、集成和流程编排 |
| Chatbot | Gemini、Claude、Poe：通用对话；排除 Otter 会议转录 |
| Coding | Cursor、Emdash、Replit、Codex、GitHub Copilot：代码工作流 |
| Code review | Cursor、Codex、GitHub Copilot：记录明确覆盖代码审查 |
| Content creation | Claude、Gamma、Synthesia：文稿、视觉文档、讲解视频 |
| Creator | Viggle、Gamma、Runway：创作者视觉材料、动画、视频 |
| Ecommerce | 无已确认电商专用候选；不把购物应用或通用助手替代商家工具 |
| Evals | 无已确认专用候选 |
| Image | Shutterstock GenAI、Fast Image AI Sketch to Image：明确生成静态图像 |
| Lead generation | 无已确认专用候选；排除通用助手、笔记和会议工具 |
| Marketing | 无已确认专用候选；Salesforce Einstein 是未完成产品范围核验的家族记录 |
| Meeting notes | Otter、Fathom：会议捕获、转录、摘要和行动项 |
| Model routing | 只有 OpenRouter，保留可读，但不足以形成比较清单 |
| Note taking | Notion、NotebookLM：文档/笔记与来源资料整理 |
| Productivity | Notion、n8n、Gamma、Make：工作知识、自动化和交付材料 |
| Prompt testing | 无已确认专用候选 |
| Sales prospecting | 无已确认专用候选；不把生产力分类替代线索获取工具 |
| Small business | Notion、Fathom、Gamma、Make：小团队协作、会后整理、材料和自动化 |
| Student | Gemini、NotebookLM、Consensus：学习、来源资料和文献发现 |
| Web3 | Dune、The Graph：链上分析与数据查询基础设施 |
| Voice | Otter、Fathom：语音转录与会议捕获；不暗示其具备所有配音能力 |
| Video | Viggle、Synthesia、Runway、Luma Dream Machine；排除已停用的 Sora |
| Research | Perplexity、NotebookLM、Consensus：来源发现、资料分析和学术检索 |
| SEO | 无已确认专用候选；DeepL Write 不等于 SEO 工具套件 |
| Writing | Gemini、DeepL Write、Claude：起草、编辑与语言改进 |

准确用途不等于已证明性能优越。保留已有“目录排序并非独立测评得分”的说明；工具详情的 monitor/noindex
门禁不改，截图、采纳证据或价格限制不足也不因此宣称已核验。尤其图片清单只证明静态图像任务匹配。

比较榜单至少需要 **两个**真实、可展示、符合用途的产品。9 个未达标主题 noindex 且退出 sitemap：
API observability、Ecommerce、Evals、Lead generation、Marketing、Model routing、Prompt testing、
Sales prospecting、SEO。其余 19 个 topic 在 en/cn 共 38 个 URL。相对初版 48 个 topic URL 减少 10 个；
相对最初 main 的 56 个减少 18 个。保留全部主题配置和可访问页面，未更改数据库或其它页面的索引准入规则。

测试遍历全部 28 个主题，包括原先遗漏的 productivity/design-art/chatbot/text-writing；构造同分类无关工具，
测试明确的交叉错配、零/单候选、未登记键、状态/内容门禁及去重。HTTP 测试还核对正文所有内部工具链接属于清单。

## 2. 完整 sitemap 的 HTML 信号

将 QA 点名的 9 个 Guide 迁到 `buildLocalizedPageMetadata`，保留原题名和描述：free-ai-tools、
how-to-choose-ai-tools、ai-writing-tools、ai-seo-tools、ai-coding-tools、ai-tools-for-research、
ai-note-taking-tools、ai-tools-for-sales、ai-tools-for-web3。

新增 `pnpm run test:sitemap-pages`，读取构建后服务的完整 XML，遍历每一个 URL，检查 HTTP 200、无 noindex、
单一且正确的 canonical、HTML 精确包含 en/zh-CN/x-default 三个 alternate，以及没有竞争的 HTTP hreflang。
同时强制所有允许索引的 Guide（两种语言）都实际出现在 sitemap，而不只检查已出现的部分页面。

## 3. Regression 的真实失败

初版基线复现：13 项中 9 项通过，hreflang、图片、懒加载、数据访问失败，总退出码 1。

- `verify-hreflang.ts` 改为当前两种索引语言契约，保留默认项、双向关系、各路径、canonical、URL 格式等有效检查，
  并验证历史语言不输出 alternate。
- 数据访问已经在超时前完成所有查询并关闭连接池；实际问题是 `lib/cache.ts` 的周期清理定时器持有 CLI 进程。
  对该后台定时器调用 `unref`，保留原 60 秒回归超时门槛，未延长超时、未忽略退出码。
- DistributionDashboard 的原生图片改为 BaseImage，有明确尺寸和 lazy，外部私有素材预览保持 unoptimized，
  避免依赖站点图片代理域名单。未改变素材保存或上传逻辑。
- 图片使用守卫确认 WebNavCard → ToolCardMedia → BaseImage 的真实委托链；仍检查所有原生 img 与关键组件。
  文档路径修正到已有的 docs/archive/WEBP_IMAGE_OPTIMIZATION.md。
- 懒加载/占位检查新增真实服务端渲染断言：raster blur、SVG empty 且不代理、lazy 默认、priority/eager、明确覆盖值。
  不再把正确的 SVG 分支误判为缺少固定 blur 字符串。
- Regression 任何已注册子项失败均退出 1，包括之前仅告警的图片和懒加载检查。

## 4. 有依据的稳定日期

视频与语音指南使用各自已存在的 `checkedAt = 2026-07-18`；Best 索引页与共享 topic 模板使用中央既有
2026-09-09 记录。修复代码或删除错误默认日期不视为新的一次内容/工具事实复核，因此本次未登记新的 09-10 复核日期。

工具/分类按有效 updatedAt → createdAt 读取；两者缺失或无效时不输出 lastModified，这是 Next sitemap
类型允许的字段缺省。不得回退 `new Date()`。专项测试在同一进程内两次生成完整 sitemap 并做深比较，
fixture 明确包含可索引但缺时间戳的工具及分类，两种语言都必须省略日期；另覆盖无效日期和有效 createdAt 回退。
静态日期仍必须来自登记，缺登记报错，不默认为今天。

## 验证与交付

最终原始退出码、Regression 13 项原始结果、完整 sitemap 逐 URL 结果，以及 28 个主题真实盘点见
`reports/seo-topic-consistency-2026-09-10/qa-revision/`。原始日志在同目录保留，*.log 不入库。

本轮未推 main、未部署、未修改数据库。代码完成后仅推现有 feature branch，交由总控安排独立复验。
