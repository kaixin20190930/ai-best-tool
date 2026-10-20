# v0、SciSpace、WRITER 快速索引证据差分

日期：2026-10-20。范围仅限既有 `published + monitor` 工具的官方来源、快速资格和重复实体快照；不重审工具实体、页面、市场验证分数、Decision、素材或本地化内容，也不改变索引状态。

## v0 by Vercel

- 官方来源：当前 v0 FAQ 说明产品、数据与输出边界；官方 pricing 页面说明方案及模型计费，两者覆盖不同事实面。[FAQ](https://v0.app/docs/faqs) · [Pricing](https://api2.v0.dev/pricing)
- 独立信号：HostAdvice 2026-09-08 的数据库应用实测；SoftCrit 2026-09-30 更新的三周实测，覆盖免费/付费 workspace、UI 生成、导入、GitHub 同步、部署、credit 与后端接线边界。[HostAdvice](https://hostadvice.com/ai-app-builders/v0-review/) · [SoftCrit](https://softcrit.com/review/v0-review/)
- 边界：两篇编辑评测来自不同域名和测试流程；SoftCrit 披露联盟关系。它们不是基准测试、采用规模或本站搜索量证据。QA 指出的 TechRadar 历史介绍已排除。
- 生产查重：按 selector 使用 `nameQuery=v0 by`，其他 Tool `0`、collection candidate `0`；2 个相关 Task Fit 仅是比较对象，非重复实体。

## SciSpace

- 官方来源：官方 About 页确认产品身份；官方搜索帮助说明搜索方法与数据来源；pricing 页作为单独的方案入口。[About](https://scispace.com/t/about/) · [Search help](https://scispace.com/help/en/articles/10706821-how-scispace-search-works) · [Pricing](https://scispace.com/pricing)
- 独立信号：2026 年发表于 *Education for Information* 的比较应用研究以预定义加权标准比较 7 个科学综述工具并报告 SciSpace 结果；Educators Technology 研究者于 2026-09-27 更新的评测讨论文献发现、阅读、提取和人工核验边界。[SAGE](https://journals.sagepub.com/doi/10.1177/01678329261425828) · [Educators Technology](https://www.educatorstechnology.com/2026/09/scispace-review.html)
- 边界：独立研究与编辑评测不证明引文准确、活跃用户规模或当前账户权益。QA 指出的低评论量 G2 页面已排除；原有 `marketValidation` 其他字段均保留。
- 生产查重：`nameQuery=scispace`，其他 Tool `0`、collection candidate `0`、相关 published Task Fit `0`。

## WRITER

- 官方来源：当前官方 plans 页说明方案/席位边界；WRITER Agent 官方发布说明其 workflow、Playbook、Routine 与治理定位。[Plans](https://writer.com/plans/) · [WRITER Agent](https://writer.com/blog/writer-agent/)
- 独立信号：Agent Finder 的 2026 评测披露四周测试范围，覆盖内容、RFP 与内部知识流程；ComputerTech 的 2026 编辑评测从企业内容治理、Agent 组件和实施成本角度提供另一套判断。[Agent Finder](https://agent-finder.co/reviews/writer) · [ComputerTech](https://computertech.co/writer-com-review/)
- 边界：两者都是不同域名的编辑评测，不是客户采用审计或官方权益证明；前者披露 AI 辅助准备，后者披露联盟关系。QA 指出的 G2 Agent 工作流泛化与旧 TrustRadius 写作反馈均已排除。
- 生产查重：`nameQuery=writer`，其他 Tool `0`、collection candidate `0`、相关 published Task Fit `0`。

三个工具均按 `brand_decision_signals` 记录 `pricing + review` 两类决策意图；快速资格只免除固定观察期，不等于索引批准。QA 指出的四处来源问题已仅以来源差分返工：v0 排除原 TechRadar 描述，SciSpace 排除低评论量 G2，WRITER 排除 G2 Agent 泛化和旧 TrustRadius 写作反馈。更新后的 manifest semantic SHA 为 `2a4d2e3b19d88582b2caca11e206ad95e16d38719806eba4e7db92dab9972aaf`。证据 executor preflight 对三项全部通过，`productionWrites=0`。指定 GSC 快照为 2026-10-14，站点健康 `warning`；三项均由快速资格进入 `mature_high_demand`，统一 staged selector 全部 eligible、`blocked=[]`、`productionWrites=0`，batch hash：`e21283152f7eb28c762df11aaa870d82e78e81f75ac9a05b898bebb9dca86cca`。

## 生产结果

- 独立 QA：首轮因四条来源描述不准确或不足而拒绝；原开发与原 QA 槽完成增量返工后，三项均为 `QA_PASS`，没有创建重复任务。
- 证据事务：rollback 通过；commit 写入 3 条；幂等 postcheck 写入 0 条。
- 最终生产前像 batch hash：`b45d8873f986e57c16c09b355711d25399ea5f4c6797cbdd061f1c01d11c0cc9`。索引 rollback 通过；commit 写入 3 条；postcheck 通过。
- v0 by Vercel、SciSpace、WRITER 均已从 `published + monitor/noindex` 变为 `published + continue_index`。
- 英文与简中页面返回 self-canonical 且不再包含 `noindex`；繁中仍为 `noindex, follow`。
- sitemap 新增 6 条英文/简中 URL，总数由 138 增至 144。Google 实际抓取与收录仍按第 3、7、14、28 天观察，不作收录保证。
- 2026-10-20 索引额度累计 5/5，本周累计 8/25；当天不再提交其他索引对象。
- 验证预算：未运行 TypeScript 或完整 build；只执行来源差分 QA、证据事务、精确索引事务和一次生产页面/sitemap 回读。
