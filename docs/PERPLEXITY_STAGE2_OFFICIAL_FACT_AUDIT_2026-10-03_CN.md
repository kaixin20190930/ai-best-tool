# Perplexity · CL-02 Stage 2 官方事实字段审计

核查日期：2026-10-03。对象仅为既有 Perplexity 工具 `3d018623-85f9-4df4-bd55-9a4a0e7a2d93` 的 `research-with-citations` 候选。以下均为 Perplexity 官方一手网页；候选 SQL 只保存待核的摘要及 URL，不保存 verified 状态或人工摘录。审核人执行前须重新打开原文，核对页面更新时间、适用账户及实际界面。

| 候选 claim / 字段 | 官方来源与可核事实 | 适用范围和不得外推之处 |
| --- | --- | --- |
| `web-synthesis` / `research-discovery.support` | [What is Pro Search?](https://www.perplexity.ai/help-center/en/articles/10352903-what-is-pro-search) 的 *step-by-step process*：多次检索网页，来源可有文章、论文、论坛、视频，再综合成回答。 | Pro Search 的开放网页流程；并非穷尽、可复现的系统性文献检索。开放网页来源质量混杂。 |
| `direct-links` / `citation-traceability.support` | 同一 [Pro Search 帮助页](https://www.perplexity.ai/help-center/en/articles/10352903-what-is-pro-search) 的 *citation and transparency* 与 *validating information*：回答带原始来源的直接链接，同时提醒参照来源验证。 | 链接是回查入口，不证明引用段落与答案一致，更不证明结论正确；本站没有做引文准确性实测。审核时须打开原文、检查上下文和研究方法。 |
| `focus` / `research-discovery.availability` | [Pro Search 帮助页](https://www.perplexity.ai/help-center/en/articles/10352903-what-is-pro-search) 列举 Web、Academic、Finance、Files 等搜索焦点。 | 不同焦点有不同来源范围；Files 不是开放网页。不能把 Academic 焦点当作全面论文数据库。按目标账户、地区和套餐核对可用性。 |
| `plans` / `plan_requirement` | [当前套餐对比](https://www.perplexity.ai/help-center/en/articles/11187416-which-perplexity-subscription-plan-is-right-for-you)明确列出 Free 的 Pro Searches 为 `3/day`；Pro、Max、Enterprise 访问量及功能分层。 | 本次候选只陈述当前官方表列出的 Free `3/day`，不能外推到其他套餐或 API。旧 FAQ 的 `5/day`、`5/4 hours` 与过时的“官方冲突、额度未知”表述不再用于本 claim。独立审核时仍须重开现行页面、确认账户/地区和更新时间。 |
| `api-boundary` / `required_conditions` | [Enterprise billing FAQ](https://www.perplexity.ai/help-center/en/articles/10352986-enterprise-pricing-and-billing-frequently-asked-questions) 明说 Enterprise 席位不含 API 访问或 credits；[套餐对比](https://www.perplexity.ai/help-center/en/articles/11187416-which-perplexity-subscription-plan-is-right-for-you) 也将 API Platform 列为独立按量产品。 | Web/app 订阅权益不能推断为 API 权益或相同模型/限额；API 数据政策需按 API 合同另核，不能用 Enterprise Web 声明覆盖。 |
| `data-boundary` / `data_training_use` | [Data Collection at Perplexity](https://www.perplexity.ai/help-center/en/articles/11564572-data-collection-at-perplexity)：Free、Pro、Max 默认开启 AI Data Retention，可退出；退出仅影响之后的数据；Enterprise 数据不用于 AI 训练。 | `opt_out` 只描述消费套餐有退出选项，不代表默认关闭训练；Enterprise 保证限其合格组织环境。数据收集、模型训练、日志、删除期限是不同命题，不互相推导。 |
| `labels-limitation` / `watch_outs` | [Understanding source labels](https://www.perplexity.ai/help-center/en/articles/20260806-understanding-source-labels)：标签评价整个网站，不逐页评价。 | 域名标签不能当作单篇文章、某个引用或单条主张准确性认证。仍须阅读原文。 |

字段结论：可建立两个 **draft** Tool Capability（开放网页发现、来源回查）与一个 **draft/conditional** Fit；可建立 pending profile、pending official source 和 candidate claim。额度 claim 的修正文案仍是 candidate/HOLD，不能由候选修正直接推出 `verified`、`reviewed`、`published` 或任何 evidence link。分享/导出权限没有纳入本批候选字段；Enterprise 演示中的导出展示不代表消费套餐权益。用户任务页和索引仍单独受发布门禁控制。

后台关系审核固定 manifest 与 gate 见[候选交付的关系审核章节](./PERPLEXITY_STAGE2_CANDIDATE_DELIVERY_2026-10-03_CN.md#后台关系审核与链接路径2026-10-04)。关系写入须在全部七条 claim verified/current 后由真实 admin reviewer 明确操作；claim 审核状态本身不自动建立链接或发布任何对象。
