# GSC 每周观察台账

更新时间：2026-07-29

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
| Week 3 | 2026-07-19 | 525 | 2 | 0.38% | 68.57 | 157 | 646 | 28 天实际覆盖 2026-06-20 至 2026-07-17；7 天窗口为 35 展示、0 点击、67.78 平均排名，短期尚未出现恢复信号 |
| Week 4 | 2026-07-28 | 135 | 1 | 0.74% | 59.92 | 154 | 690 | 曝光继续下降，但平均排名较 Week 3 改善约 8.65 位；首页承接 102 次展示，新的页面级机会集中在 Research、Lindy、Fathom、ChatGPT 和少量分类页 |
| Week 5 | 2026-07-29 | 待补充 | 待补充 | 待补充 | 待补充 | 待补充 | 待补充 | 当前环境无法直接抓取 aibesttool.com；本周先补齐线上可达性检查后更新 |

## 站内收口基线

这是当前站点结构层面的 baseline，不是 GSC 数据。

| 日期 | 可进 sitemap | 内部流量页 | noindex / 合并候选 | 备注 |
| --- | --- | --- | --- | --- |
| 2026-07-15 | 27 | 3 | 127 | 来自最新页面质量盘点 |
| 2026-07-19 | 27 | 3 | 127 | 质量盘点稳定；Coverage 另显示 157 已索引、646 个未索引状态，其中 583 个为主动 noindex |

## 覆盖率基线

来自 `aibesttool.com-Coverage-2026-07-28.xlsx` 的关键问题分布：

| 问题 | 网页数 | 备注 |
| --- | --- | --- |
| 被 `noindex` 标记排除 | 603 | 主要是我们主动收口的弱页 / 非索引页 |
| 已抓取 - 尚未编入索引 | 19 | 需要继续观察是否是质量或抓取优先级问题 |
| 网页会自动重定向 | 29 | 多半是规范化 / 域名跳转带来的结果 |
| 备用网页（有适当的规范标记） | 31 | 说明规范化正在生效，但仍要避免重复页过多 |
| 重复网页，用户未选定规范网页 | 5 | 需要继续收口同义页和 alias 页 |
| 重复网页，Google 选择的规范网页与用户指定的不同 | 3 | 关注主模板页与规范化一致性 |
| 已发现 - 尚未编入索引 | 0 | 目前无明显“已发现未编入索引”问题 |

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
| Week 3 | fathom | 0 | 59 | 0.00% | 82.37 | 工具名词；28 天 Top query | 是 |
| Week 3 | ai tools directory toolbloom ai tools | 0 | 59 | 0.00% | 106.47 | 品牌 / 目录词；排名偏后 | 是 |
| Week 3 | toolbloom browse ai tools directory | 0 | 40 | 0.00% | 74.05 | 品牌 / 目录词 | 是 |
| Week 3 | toolbloom ai tools directory best ai tools | 0 | 36 | 0.00% | 80.28 | 品牌 / 目录词 | 是 |
| Week 3 | fathom about | 0 | 24 | 0.00% | 93.88 | 工具相关长尾；排名偏后 | 是 |
| Week 4 | ai tools directory | 0 | 19 | 0.00% | 100.32 | 目录主词；方向正确但权威度不足 | 是 |
| Week 4 | ai tool directory | 0 | 13 | 0.00% | 78.92 | 目录主词；继续由首页承接 | 是 |
| Week 4 | top ai tools directory | 0 | 7 | 0.00% | 73.71 | 榜单 / 目录意图 | 是 |
| Week 4 | ai tool index | 0 | 6 | 0.00% | 70.67 | 明确目录检索意图 | 是 |
| Week 4 | best ai tools directory | 0 | 5 | 0.00% | 59.40 | 当前目录词里相对更接近的机会 | 是 |

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
| Week 3 | https://aibesttool.com/ | 1 | 210 | 0.48% | 66.64 | Core | 是 |
| Week 3 | https://www.aibesttool.com/ | 1 | 33 | 3.03% | 77.91 | Core；历史 www 变体 | 是 |
| Week 3 | https://aibesttool.com/ai/fathom | 0 | 129 | 0.00% | 81.13 | Tool | 是 |
| Week 3 | https://www.aibesttool.com/categories/automation | 0 | 33 | 0.00% | 61.12 | Category；历史 www 变体 | 是 |
| Week 3 | https://aibesttool.com/ai/pipedream | 0 | 30 | 0.00% | 55.67 | Tool | 是 |
| Week 4 | https://aibesttool.com/ | 1 | 102 | 0.98% | 69.35 | Core；曝光高度集中 | 是 |
| Week 4 | https://aibesttool.com/ai/lindy | 0 | 7 | 0.00% | 9.71 | Tool；首批机会页 | 是 |
| Week 4 | https://aibesttool.com/ai/fathom | 0 | 7 | 0.00% | 33.14 | Tool；具体功能 query 已进入前 10 | 是 |
| Week 4 | https://aibesttool.com/categories/research | 0 | 5 | 0.00% | 5.00 | Category；首批机会页 | 是 |
| Week 4 | https://www.aibesttool.com/guides/ai-tools-for-research | 0 | 5 | 0.00% | 46.00 | Guide；需确认无重复模板干扰 | 是 |
| Week 4 | https://aibesttool.com/ai/the-graph | 0 | 4 | 0.00% | 25.50 | Tool；高排名样本 | 是 |
| Week 4 | https://aibesttool.com/en/explore | 0 | 3 | 0.00% | 4.00 | Core Hub | 是 |
| Week 4 | https://www.aibesttool.com/ai/the-graph | 0 | 3 | 0.00% | 53.33 | Guide / 工具页变体 | 是 |
| Week 4 | https://aibesttool.com/ai/chatgpt | 0 | 2 | 0.00% | 7.50 | Tool；样本小但属于核心入口 | 是 |
| Week 4 | https://www.aibesttool.com/categories/web3 | 0 | 2 | 0.00% | 8.50 | Category；历史变体 | 是 |

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
| `/ai/fathom` | 会议额度、团队席位、转写/跟进更新、会后整理风险 | 153 | 0 | 是 | GSC 已出现工具名词曝光；下一轮补官方价格核查、评论和 owner 信号；无 editorial 复核记录前不显示虚假日期 |
| `/ai/pipedream` | 任务次数、workflow 限制、触发器/集成更新、失败重试 | 39 | 0 | 是 | 排名相对更靠前；下一轮优先补真实工作流案例和评论；无 editorial 复核记录前不显示虚假日期 |

## Editorial 复核队列基线

2026-07-18 只读核对生产数据库 `tools` 表：共 25 条工具记录，完整 editorial 复核 0 条，部分填写 0 条。当前队列不是“修补旧记录”，而是等待人工逐条补充真实复核证据；在没有官方核查、实际使用记录或用户反馈前，不写入复核日期、复核人或摘要。

同日线上核对 `/cn/ai/fathom` 与 `/cn/ai/pipedream`：两页均返回 `200`，canonical 均为 `https://aibesttool.com/cn/ai/...`，页面显示已有复核日期；但两页当前均为 0 条评分、0 条讨论、0 次收藏。因此两页暂不因本地数据库样本缺失而 noindex，下一步应优先获得真实评论、收藏、点击和 owner 更新信号。

2026-07-19 生产 smoke check：`/sitemap.xml` 返回 `200`，线上共发现 360 个 `<loc>`，其中内部路径 0 个、comparison 路径 0 个；`/robots.txt` 返回 `200` 且包含 canonical sitemap。首页、Explore、榜单页及 robots/sitemap 均正常返回，当前索引收口没有发现线上回归。

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
| Week 3 | 28 天为 525 展示、2 点击、0.38% CTR、68.57 平均排名；7 天仅 35 展示、0 点击，曝光较低但平均排名未明显恶化。Coverage 的 583 个 noindex 与主动收口一致，真正需要观察的是 14 个已抓取未索引、22 个备用 canonical 和 5 个重复页面。当前不能判断整体恢复，也没有证据支持扩量。 | 保持 noindex / canonical 收口；继续观察下一周 GSC，优先维护首页、Fathom、Pipedream、自动化/研究分类和少量高排名页面；等待真实评论、收藏和 owner 认领，不用模板数据替代。 |
| Week 4 | 28 天降到 135 展示、1 点击，平均排名改善到 59.92；当前不是全站 CTR 优化阶段，而是少量机会页和规范 URL 集中阶段。Coverage 为 154 已索引、690 未索引，其中 603 个 noindex 基本符合主动收口；需精准处理 19 个已抓取未索引、5 个未明确 canonical 的重复页和 3 个 Google canonical 不一致页。 | 停止继续批量收口 comparison；统一英文无前缀 canonical，先增强首页、Research、Lindy、Fathom、ChatGPT，再处理 Explore、Web3、Productivity、Automation、Voice、Cursor、The Graph、Dune；14/28 天后复盘。 |
| Week 5 | 观测中：完成 14/28 天后第一阶段优化与收口后进入观察阶段；线上可达性暂不可验证，待你补录最新 28 天数据后再下是否继续扩量。 | 先完成线上 smoke 与 28 天补录，再决定是否把机会页补量到下一批。 |

## Week 4 执行队列

| 批次 | 页面 | 当前信号 | 本轮动作 | 状态 |
| --- | --- | --- | --- | --- |
| P0-A | `/` | 102 展示 / 1 点击 / 69.35 | 对齐 AI tools directory 意图、规范 canonical、更新首屏定位与最近核查日期 | 已完成 |
| P0-A | `/categories/research` | 5 展示 / 排名 5.00 | 强化搜索、引用、证据整理意图；更新 metadata 与结构化数据 URL | 已完成 |
| P0-A | `/ai/lindy` | 7 展示 / 排名 9.71 | 增加 Agent 工作流、权限、失败处理和额度判断块 | 已完成 |
| P0-A | `/ai/fathom` | 7 展示；具体功能 query 排名 4.00 | 增加会议转录、摘要、行动项、协作与限制判断块 | 已完成 |
| P0-A | `/ai/chatgpt` | 2 展示 / 排名 7.50 | 增加通用任务、工具能力、套餐和数据边界判断块 | 已完成 |
| P0-A | `/guides/ai-tools-for-research`、`/guides/ai-tools-for-sales` | sitemap 白名单与页面 `noindex` 冲突 | 移除错误 noindex，统一英文无前缀 canonical，并新增 sitemap/noindex 自动回归 | 已完成 |
| P0-B | `/explore`、`/categories/web3`、`/categories/productivity`、`/categories/automation` | 已出现少量前 10 信号 | 已补任务/价格/分类目录意图、专属 metadata 与决策顺序 | 已完成 |
| P0-B | `/categories/voice`、`/ai/cursor`、`/ai/the-graph`、`/ai/dune` | 样本极小但排名靠前 | Voice 补专属 metadata；三个工具页补专属搜索意图、判断维度与 canonical | 已完成 |
