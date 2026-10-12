# CL02 Availability 修正候选（2026-10-12）

状态：**已于 2026-10-12 完成生产回填并通过只读回读。** 三条目标关系均从 `reviewed/unknown` 更新为 `reviewed/all_plans`；原 support、plan requirement、limitations、身份和发布状态均未改变。完整前像见 [manifest](./CL02_AVAILABILITY_CORRECTION_MANIFEST_2026-10-12.json)，完整后像及回滚依据见 [postimage](./CL02_AVAILABILITY_CORRECTION_POSTIMAGE_2026-10-12.json)。

## 来源及判断

核查日期：2026-10-12。以下 `all_plans` 只指基础 capability 存在于免费及付费套餐，不表示各套餐的模式、深度、额度或账号资格相同。

| 关系 | 官方来源 | Why `all_plans` 及边界 |
| --- | --- | --- |
| Gemini Notebook `...201` research-discovery | [Google: Add or discover new sources](https://support.google.com/gemininotebook/answer/16215270?hl=en) | Google 说明免费用户每个 notebook 可包含最多 50 个 sources；同页给出 Add sources、按问题从 Web/Drive 找资料并选择导入的 Fast Research。故基础来源添加/发现跨套餐成立。Deep Research、较高限额、账号/年龄/地区和移动端限制继续由既有 `plan_requirement` 与 `limitations` 约束；不把它写成开放网页穷尽检索。 |
| Perplexity `...201` research-discovery | [Perplexity: plans](https://www.perplexity.ai/help-center/en/articles/11187416-which-perplexity-subscription-plan-is-right-for-you) | Standard Free 有 practically unlimited basic searches，另有 very limited Pro Searches；基础网页发现跨套餐成立。Pro Search 的深度与额度仍依套餐，Free 的精确额度未消歧，维持原 plan requirement。 |
| Perplexity `...202` citation-traceability | [Perplexity: Pro Search vs. Standard Search](https://www.perplexity.ai/help-center/en/articles/10352903-what-is-pro-search) | 官方对比列明 Standard Search 有 basic citations，Pro Search 有 extensive direct source links。基础来源回查跨套餐成立，但 `all_plans` 不声称免费搜索具有 Pro 的链接范围、深度或额度；链接也不证明单条主张准确。原 plan requirement/limitations 原样保留。 |

## 执行与验证

写入前使用固定前像逐字段核对精确三个 UUID、Owner、`updated_at`、support、availability、plan requirement、limitations、状态和编辑历史。生产通过 Admin 使用的 service-role 数据通道一次更新三个目标，只修改 availability 与复核字段，并由既有数据库 trigger 记录编辑历史。复核人为现有 Owner `2b8177ac-70b3-4475-a1ee-509ff8b4b622`，新 `review_due_at` 为 2027-01-10。

写入后重新运行 `pnpm run decision:cl02-reviewed-relations-preflight`：Gemini Notebook 与 Perplexity 的 reviewed、数量、证据用途、内容和 Fit 检查全部通过，`capabilityContentBlockers` 与总 `blockers` 均为空，`productionWrites=0`。Task Page 仍为 404/noindex，两工具索引决定与 sitemap 资格未改变。本次只是关系内容修正，不等于关系发布、Task Page 发布或索引授权。

原候选 RPC 方案未安装到生产，已从代码库移除，避免保留一次性函数和测试负担。两份用户自有 dirty SQL 未被修改或纳入本次交付。
