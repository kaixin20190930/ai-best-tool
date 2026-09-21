# Coverage URL 审计：已抓取但未编入索引

日期：2026-09-21  
范围：用户提供的 45 个 URL  
验证：生产首跳、最终状态、canonical、robots、sitemap 与当前索引门禁

## 结论

45 条 URL 中只有 `/cn` 和 `/guides/how-to-choose-ai-tools` 是当前仍在 sitemap、允许索引且需要 Google 继续评估的页面。其
余 43 条不是“应该立刻请求索引的优质页面”：30 条是旧主机、旧英文前缀、alias 或历史路径重定向；12 条是明确 noindex；1 条是
favicon 静态资源。

没有发现 monitor 工具或 comparison 页面泄漏进 sitemap。唯一需要代码收口的是带筛选/搜索参数的 Explore 页面：它已有干净
canonical，但此前未显式 noindex。本次将所有带 query 的 Explore 结果统一为 `noindex,follow`，无参数 `/explore` 继续可索
引。

## 分类结果

| 分类                   | 数量 | URL / 说明                                                                                             | 决策                                                            |
| ---------------------- | ---: | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| 历史重定向             |   30 | `www` 主机、`/en/` 前缀、Anthropic alias、旧语言路径等                                                 | 保持 307/308 与最终 canonical；等待 Google 重抓，不加入 sitemap |
| 直接符合预期的 noindex |    3 | `/fr/explore?search=...`、中文 comparison、`/login`                                                    | 保持 noindex                                                    |
| 主动暂停/收口          |    9 | Make、Anime Girl Studio、Copy.ai、crypto portfolio Guide、Read AI、Lemlist、Canva、Reply.io、Apollo.io | 保持 monitor/noindex 或 Guide 收口，不因本清单批准索引          |
| 静态资源               |    1 | `/favicon.ico`                                                                                         | 忽略，不属于 HTML 索引问题                                      |
| 当前可索引             |    2 | `/cn`、`/guides/how-to-choose-ai-tools`                                                                | 保持 sitemap；观察 Google 重抓与真实 query，不复制新页面        |

## 30 条历史重定向的主要构成

- `/en/...` 自动去除默认语言前缀：Explore 筛选、Best Free Guide、Register、Outreach、Character AI、Granola、Motion。
- `www` 统一 308 到 apex：ElevenLabs、Snov.io、Notta、Speechify、Cartesia、Consensus、Phind、Zapper、Salesloft 等。
- 未开放索引的历史语言：法语、俄语、日语、葡萄牙语、德语、繁中和西语路径，最终继续 noindex。
- `/ai/anthropic` 最终重定向到唯一 canonical `/ai/claude`，符合实体合并策略。

这些 URL 继续出现在 GSC 不代表当前重定向失效。生产在线检查已经确认首跳和最终 canonical；不得为了让报表数字下降而恢复旧
URL。

## 两个可索引页面

### `/cn`

- 200、self-canonical、在 sitemap。
- 生产 hreflang、结构化数据与导航检查通过。
- 保持中文目录首页定位，不再创建同义中文首页。

### `/guides/how-to-choose-ai-tools`

- 200、self-canonical、在 sitemap。
- 旧 `/en/` canonical 口径已经修复。
- 保持为选型方法入口；只有出现真实 query/页面数据后才做内容增强，不做无依据重写。

## 后续判断

1. 已完成生产验证：`/explore?pricing=freemium&sort=popular` 输出 `noindex,follow`，canonical 仍为 `/explore`；无参数 `/explore` 保持可索引。
2. 7–14 天后看 45 条是否逐步从 Crawled-not-indexed 迁移到 noindex、redirect 或 canonical 分类；GSC 分类存在滞后，不以立
   即归零为验收。
3. `/cn` 和选型 Guide 若仍长期未索引，使用 URL Inspection 查看 Google 选定 canonical 与最近抓取，不直接新建替代 URL。
4. 索引策略继续暂停；本次修复不会批准任何工具进入 sitemap。
