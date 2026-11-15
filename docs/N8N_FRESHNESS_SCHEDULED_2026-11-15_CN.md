# n8n 11-15 到期维护与线上验收

2026-11-15（上海），原 `ai-best-tool-cluster` 日常任务实际触发并完成 n8n 到期维护，状态 `production_verified`。
本轮优先履行已承诺的11-15节点，没有为每日配额新增工具或改写冷却中的主对比页。另行接续昨日的 Zapier 部署阻塞，
[两条有条件推荐已上线验收](./ZAPIER_CONDITIONAL_COMPARISON_2026-11-14_CN.md)，没有重复收录或公开 Tool。

实际读取并由原唯一独立 QA 核对四个互补官方来源：[定价](https://n8n.io/pricing/)、
[Community及付费版本](https://docs.n8n.io/deploy/host-n8n/community-edition-features/)、
[许可FAQ](https://support.n8n.io/article/can-i-use-your-license-for-my-use-case)、
[queue mode](https://docs.n8n.io/deploy/host-n8n/configure-n8n/scaling/enable-queue-mode/)。
原年付公开报价未变化，完整流程execution、AI额度与外部模型费用、免费/付费治理及自托管责任仍须分别判断。
本次实际复核后更新报价核查日期，并修正正文许可边界及旧来源链接：组织内部人员编辑、为客户运行流程并连接其账号，
与允许外部客户配置流程是不同用途；不能仅凭客户凭证判断是否需要商业许可。具体部署仍须向 n8n 核对。
这是到期事实澄清，不是只顺延日期，也不是账号或性能实测。

唯一独立 QA `/root/operations_qa` 绑定当前精确前像与三语言差分后 PASS；沿既有通用 Freshness 执行器完成新鲜前检、
真实事务回滚、提交与回查，持久写入分别0/0/1/0。仅修改 `detail.en/cn/zh`、`features.maintenanceReview` 和
`next_review_date`；实际后像逐字段吻合，其他字段及原市场、编辑、静态事实卡日期保持。无运行时代码改动或新发布器，
无需新素材部署、本地build、TypeScript或全量测试。

`2026-11-15T12:29:09.830Z` 一次实际检查 [EN](https://aibesttool.com/ai/n8n)、[CN](https://aibesttool.com/cn/ai/n8n)、
[TW](https://aibesttool.com/tw/ai/n8n)：200、真实标题和摘要、完整更新后的报价与许可段、4个正文官方链接及官网去向可见，
无流式not-found，自指canonical正确。旧许可链接仅核对本轮更新的正文，历史市场证据不删除。
EN/CN保留原可索引状态，TW保留noindex及既有英文正文fallback，不声称新增繁中翻译。
复用同日12:24Z保存的成功sitemap154及原指纹：n8n仍只有EN/CN在内；未重复采样sitemap。
HTTP、canonical和sitemap不作Google抓取或收录证明。

下次同范围复核为11-29，由原日常owner承接；真实变化可提前复核。静态11-01事实卡、09-01市场证据和09-04编辑日期
未被本轮维护重新认证。未实测结账、账号AI账单、工作流、基础设施、性能或特定客户许可。
本轮GSC采集0，无候选入队、Tool重新公开、Task/Fit、推荐关系表、索引或sitemap写入，无新release/D+时钟和重复定时任务。
11-19原D+14、原未决Coverage及相关工具/推荐实际复核，Zapier整体11-20节点均保留；不把页面维护或PASS计作增长。

实际前后像、精确差分、独立QA、四阶段执行及三语言HTML/验收证据仅保存在 `.local/gsc/operations/n8n-freshness-*2026-11-15.*`。
