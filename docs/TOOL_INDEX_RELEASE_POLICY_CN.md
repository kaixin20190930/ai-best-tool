# 工具页索引发布与节奏控制

更新时间：2026-09-02
状态：已实施，进入逐日复核
上位计划：[收录与搜索质量主计划](./MASTER_OPTIMIZATION_TRACKER_CN.md)

## 当前线上快照

2026-09-02 部署前，生产 `sitemap.xml` 共 176 条 URL：

| 页面类型 | 英文 + 中文 URL 数 | 独立页面数 |
| --- | ---: | ---: |
| 首页、Explore、Guides 根页、Best 根页 | 8 | 4 |
| 白名单 Guide | 36 | 18 |
| Best topic | 56 | 28 |
| 工具详情 | 68 | 34 |
| 分类页 | 8 | 4 |
| 合计 | 176 | 88 |

数据库共有 35 个 `published` 工具。34 个因资料质量分不低于 80 进入 sitemap；`woy-ai` 质量分 65，没有进入 sitemap。2026-09-01 一次创建了 11 个成熟工具实体，它们此前全部使用 `continue_index`，因此同时进入了 sitemap。这不符合当前小批量观察策略。

本次控制实施后，本地生产数据生成结果为 158 条 URL，其中 25 个工具、50 条双语工具 URL。9 个暂缓工具均已退出 sitemap 并在详情页输出 `noindex,follow`；Emdash 与 Fathom 继续允许索引。生产线上 sitemap 会在本次代码部署后从 176 条更新为 158 条。

## 统一状态含义

| 数据状态 | 页面是否可访问 | robots | sitemap | 用途 |
| --- | --- | --- | --- | --- |
| `continue_index` 且质量分 >=80 | 是 | `index,follow` | 是 | 已人工批准进入搜索索引面 |
| `monitor` | 是 | `noindex,follow` | 否 | 已公开给用户，等待索引复核 |
| `noindex` | 是 | `noindex,follow` | 否 | 有站内价值但不参与搜索 |
| `merge_candidate` | 暂时是 | `noindex,follow` | 否 | 等待合并、canonical 或重定向 |
| `archive` | 视后续处置 | `noindex,follow` | 否 | 准备下线或归档 |
| 非 `published` | 不作为公开索引页 | `noindex,follow` | 否 | 草稿、待审或拒绝状态 |

“不在 sitemap”不再作为 noindex 的替代品。工具详情元数据与 sitemap 必须共同使用同一索引门禁。

## 2026-09-02 首批节奏调整

当前保留 `Emdash` 与 `Fathom` 为首批索引页。其余 9 个 2026-09-01 新增工具改为 `monitor`，按每天最多一个复核：

| 复核日期 | 工具 | 当前动作 |
| --- | --- | --- |
| 2026-09-03 | Consensus | 检查页面、证据、市场验证与重复意图后决定是否放开 |
| 2026-09-04 | Gamma | 同上 |
| 2026-09-05 | Runway | 同上 |
| 2026-09-06 | Luma AI | 同上 |
| 2026-09-07 | Pipedream | 同上 |
| 2026-09-08 | Cursor | 同上 |
| 2026-09-09 | The Graph | 同上 |
| 2026-09-10 | Perplexity | 同上 |
| 2026-09-11 | Make | 同上 |

复核日期不是自动索引日期。到期后仍需人工确认并将状态改为 `continue_index`；未达标则继续 `monitor` 或转为 `noindex`。

## 后续固定节奏

- 每天新增并公开 1-2 个合格工具，但新工具数据库默认状态为 `monitor`。
- 每天最多批准 1 个新工具进入索引，每周最多 5 个。
- 当天没有合格页面时允许批准 0 个，额度不累计，也不在次日补发。
- 新增页面进入索引后至少观察 14 天；若 GSC 出现新增页大量“已抓取未编入索引”、非品牌展示明显下降或重复意图，立即暂停下一批。
- 只有连续两个 28 天窗口满足新增页索引率 >=70%、非品牌展示未恶化、无批量 Crawled/Discovered currently not indexed，才评估提高索引上限。

## 从 `monitor` 升级为 `continue_index` 的硬门槛

必须同时满足：

1. 状态为 `published`，质量分不低于 80，且无占位 logo、截图或明显空字段。
2. 市场验证结论为 `validated`；至少一项强信号和另一项强/辅助信号可追溯。
3. 至少两个互补官方来源、一个会影响选择的真实限制、最近核查日期和下次复查日期。
4. `Best for`、`Not ideal for`、比较维度和替代路径不是模板化空话。
5. canonical 唯一，不与现有工具、Guide、comparison 或 alias 抢同一意图。
6. 页面构建、metadata、canonical、结构化数据与工具索引门禁测试通过。
7. 当日及本周索引放行额度未超限。

付费提交、owner 认领和品牌知名度不能绕过上述门槛。

## 继续保持 noindex 的页面类型

- 后台、账户、登录、Profile、API 和内部运营页面。
- Pricing、Submit、developer listing 等转化或操作页面。
- comparison 模板、未进入白名单的弱 Guide、同义 alias 和合并候选。
- 非英文/中文的历史语言变体，除非有真实本地化内容并单独通过准入。
- 质量不足、市场验证不足、来源冲突、重复意图或待补素材的工具页。

核心首页、Explore、18 个白名单 Guide、28 个 Best topic、合格分类页和逐个批准的工具页继续作为索引面。
