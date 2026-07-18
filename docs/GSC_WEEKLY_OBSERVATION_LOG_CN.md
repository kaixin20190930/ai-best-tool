# GSC 每周观察台账

更新时间：2026-07-18

这份台账只做一件事：把 Google Search Console 的变化按周记录下来，方便判断当前的“收口 + 质量增强”策略到底有没有起效。

## 使用方式

1. 每周固定同一时间填写一次，优先用最近 28 天数据。
2. 先填总览，再填 Top queries 和 Top pages。
3. 只记录事实，不在这里写策略讨论。
4. 如果出现连续两周下滑，再回到恢复任务文档调整方向。
5. 如果你导出了 Search Console CSV，可以直接运行 `pnpm run gsc:weekly-report -- --dir <export-folder> --out docs/gsc-weekly-report.md` 先生成摘要，再把关键数值贴回本表。脚本会在传入目录下递归查找常见的导出文件名，不要求 CSV 必须放在根目录。
6. 如果只有部分 CSV 导出，脚本也会生成部分基线摘要；等拿到图表文件后，再回填 Week 1 的曝光、点击、CTR 和平均排名。

## 周度总览

| 周次 | 记录日期 | 28 天曝光 | 28 天点击 | CTR | 平均排名 | 已索引页面数 | 未索引页面数 | 备注 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Week 1 | 2026-07-15 | 876 | 2 | 0.23% | 70.09 | 27 | 127 | 从 `aibesttool.com-Performance-on-Search-2026-07-15.xlsx` 导入；当前本地 SEO 校验已通过 27/27 |
| Week 2 | 2026-07-18 | 876 | 2 | 0.23% | 70.09 | 27 | 127 | 最新 28 天导出再次确认仍处低曝光、低点击、低排名基线；top queries 仍以品牌 / 目录词为主，top pages 仍集中在首页、automation 分类和少数工具详情页 |
| Week 3 |  |  |  |  |  |  |  |  |
| Week 4 |  |  |  |  |  |  |  |  |

## 站内收口基线

这是当前站点结构层面的 baseline，不是 GSC 数据。

| 日期 | 可进 sitemap | 内部流量页 | noindex / 合并候选 | 备注 |
| --- | --- | --- | --- | --- |
| 2026-07-15 | 27 | 3 | 127 | 来自最新页面质量盘点 |

## 覆盖率基线

来自 `aibesttool.com-Coverage-2026-07-15.xlsx` 的关键问题分布：

| 问题 | 网页数 | 备注 |
| --- | --- | --- |
| 被 `noindex` 标记排除 | 583 | 主要是我们主动收口的弱页 / 非索引页 |
| 已抓取 - 尚未编入索引 | 14 | 需要继续观察是否是质量或抓取优先级问题 |
| 网页会自动重定向 | 22 | 多半是规范化 / 域名跳转带来的结果 |
| 备用网页（有适当的规范标记） | 22 | 说明规范化正在生效，但仍要避免重复页过多 |
| 重复网页，用户未选定规范网页 | 5 | 需要继续收口同义页和 alias 页 |

## Top Queries

| 周次 | Query | Clicks | Impressions | CTR | Position | 变化判断 |
| --- | --- | --- | --- | --- | --- | --- |
| Week 1 | toolbloom ai tools directory best ai tools | 0 | 91 | 0.00% | 89.24 | 目录品牌词开始出现，但排名还很靠后 |
| Week 1 | ai tools directory toolbloom ai tools | 0 | 77 | 0.00% | 112.13 | 品牌相关长尾有曝光，但仍未形成点击 |
| Week 1 | fathom | 0 | 71 | 0.00% | 81.85 | 工具页已被部分检索到，但排名不足以出点击 |
| Week 1 | automation tools | 0 | 65 | 0.00% | 73.34 | 目录型词有曝光，需要继续增强分类页 |
| Week 1 | ai automation tools | 0 | 64 | 0.00% | 70.25 | 高意图词开始进入观察范围 |
| Week 2 | toolbloom ai tools directory best ai tools | 0 | 91 | 0.00% | 89.24 | 品牌 / 目录词 | 是 |
| Week 2 | ai tools directory toolbloom ai tools | 0 | 77 | 0.00% | 112.13 | 品牌 / 目录词 | 是 |
| Week 2 | fathom | 0 | 71 | 0.00% | 81.85 | 工具名词 | 是 |
| Week 2 | automation tools | 0 | 65 | 0.00% | 73.34 | 类目词 | 是 |
| Week 2 | ai automation tools | 0 | 64 | 0.00% | 70.25 | 类目词 | 是 |

## Top Pages

| 周次 | Page | Clicks | Impressions | CTR | Position | 页面类型 | 是否增强页 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Week 1 | https://aibesttool.com/ | 1 | 214 | 0.47% | 66.78 | Core | 是 |
| Week 1 | https://www.aibesttool.com/ | 1 | 134 | 0.75% | 78.19 | Core | 是 |
| Week 1 | https://www.aibesttool.com/categories/automation | 0 | 178 | 0.00% | 70.64 | Category | 是 |
| Week 1 | https://aibesttool.com/ai/fathom | 0 | 153 | 0.00% | 78.89 | Tool | 是 |
| Week 1 | https://aibesttool.com/ai/pipedream | 0 | 39 | 0.00% | 55.05 | Tool | 是 |
| Week 2 | https://aibesttool.com/ | 1 | 214 | 0.47% | 66.78 | Core | 是 |
| Week 2 | https://www.aibesttool.com/ | 1 | 134 | 0.75% | 78.19 | Core | 是 |
| Week 2 | https://www.aibesttool.com/categories/automation | 0 | 178 | 0.00% | 70.64 | Category | 是 |
| Week 2 | https://aibesttool.com/ai/fathom | 0 | 153 | 0.00% | 78.89 | Tool | 是 |
| Week 2 | https://aibesttool.com/ai/pipedream | 0 | 39 | 0.00% | 55.05 | Tool | 是 |

## 增强页追踪

优先记录已经做了真实数据增强的页面。

| 页面 | 增强内容 | 本周曝光 | 本周点击 | 是否继续保留索引 | 备注 |
| --- | --- | --- | --- | --- | --- |
| `/guides/how-to-choose-ai-tools` | 选型方法、价格/限制、更新、截图/评论判断、最近验证日期 | 暂无单页拆分 | 暂无单页拆分 | 是 | 保留为方法论入口；下一轮补真实案例和用户反馈 |
| `/guides/ai-seo-tools` | SEO 场景、价格/更新/评论信号、最近验证日期 | 暂无单页拆分 | 暂无单页拆分 | 是 | 与当前 GSC 恢复主线直接相关；继续补真实案例 |
| `/guides/ai-coding-tools` | IDE / 补全 / Agent 选择维度、价格与限制、最近验证日期 | 暂无单页拆分 | 暂无单页拆分 | 是 | 继续补多文件修改案例和真实评论 |
| `/guides/free-ai-tools` | 免费额度、限制、更新、评论、截图判断、最近验证日期 | 暂无单页拆分 | 暂无单页拆分 | 是 | 继续补免费额度核查和用户反馈 |
| `/guides/ai-writing-tools` | 写作场景、价格/限制、更新与评论信号、最近验证日期 | 暂无单页拆分 | 暂无单页拆分 | 是 | 继续补真实写作样例和限制说明 |
| `/best-ai-tools` | 排名方法、选择标准、价格/更新/风险信号、决策顺序 | 暂无单页拆分 | 暂无单页拆分 | 是 | 继续观察榜单词曝光和点击 |
| `/categories/productivity` | 分类解释、场景筛选、代表工具、更新与风险信号 | 暂无单页拆分 | 暂无单页拆分 | 是 | 继续补分类级真实工具信号 |
| `/categories/developer-tools` | 开发者选择维度、筛选与比较路径、更新和风险信号 | 暂无单页拆分 | 暂无单页拆分 | 是 | 继续补开发者工作流案例 |
| `/categories/automation` | 触发器、编排、失败重试、日志和权限判断 | 178（automation 分类页，含 www 变体） | 0 | 是 | GSC 已出现该页曝光；下一轮补真实工作流案例和工具级数据 |
| `/ai/fathom` | 会议额度、团队席位、转写/跟进更新、会后整理风险 | 153 | 0 | 是 | GSC 已出现工具名词曝光；下一轮补官方价格核查、评论和 owner 信号 |
| `/ai/pipedream` | 任务次数、workflow 限制、触发器/集成更新、失败重试 | 39 | 0 | 是 | 排名相对更靠前；下一轮优先补真实工作流案例和评论 |

## 处理规则

- 如果增强页连续两周没有曝光提升，先看标题、摘要和内链是否足够明确。
- 如果增强页有曝光但无点击，优先检查搜索意图和标题表达。
- 如果薄页出现曝光回升但页面仍缺少真实信号，先不要扩量。
- 如果核心页开始稳定获得点击，再把同类页面逐批放入观察队列。

## 结论栏

| 周次 | 结论 | 下一步 |
| --- | --- | --- |
| Week 1 | 已导入 28 天性能基线，曝光总量不高，而且近 7 天曝光几乎归零，说明当前仍在非常低的基线；query / page 方向已经能看见，但还没形成稳定点击。覆盖率问题主要集中在 noindex 收口、少量抓取未入索引，以及少量重复规范化痕迹 | 继续观察下周 GSC 变化，同时优先补核心页真实信号，并留意首页 / www 变体是否还在 GSC 中重复出现 |
| Week 2 | 28 天内只有 2 次点击，主要来自首页；Top queries 仍以品牌/目录词为主，排名大多在 70-110 之外，说明现阶段的问题不是“缺页面”，而是“页面还没足够像可被点击的答案页” | 继续保持收口节奏，不扩量，优先看首页、榜单、分类、工具详情的真实信号是否继续改善 |
| Week 3 |  |  |
| Week 4 |  |  |
