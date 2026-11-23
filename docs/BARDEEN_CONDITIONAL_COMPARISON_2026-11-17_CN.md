# Bardeen 有条件对比与推荐

## 2026-11-23 到期推荐接续

昨天仅完成准备，今天实际复核并更新原两条理由：Make 运行级积分归因与 Bardeen 多步输出行积分累积/到期的差别；Gumloop 逐工具审批与模型、工具、计算、编排用量边界。复用 11-22 Bardeen 三源及 11-19 支持工具四源的原时间、指纹，不称为今日新采；不承诺免费刷新、实测成本或无人值守可靠性。

唯一独立 QA 绑定当前配置及三个精确生产前像，通过后内容提交 `7f5baa2bb6b91270eec1725aa0b54220584088e6` 已部署生产 READY。一次实际九语言 URL 验收通过：Bardeen 三页完整新理由和本地化原生链接、原正文/六限制/费用说明/11-16 页面事实日期，以及 Make/Gumloop 六个目标锚点；标题、实际摘要回退、官方链接、无流式404、canonical/noindex 与 sitemap154 排除保持正确。TW 理由仍是英文回退。生产数据库写入0，无重复收录/公开、GSC、构建、TypeScript或全量测试。

两条关系 reviewedAt=11-23、reviewDueAt/nextReviewDate=11-26，由现有 owner 实际复核；Bardeen 工具整体维护仍到期11-23，**本轮未完成也未顺延**，作为下一同主页面维护项接续。私有主记录沿用 `.local/gsc/operations/bardeen-due-review-2026-11-22.json`。以下为初次交付历史，不代表本次签署或新增增长。

2026-11-17（上海），原 `ai-best-tool-cluster` 于 `2026-11-17T09:06:31.708Z` 实际触发。
本轮主页面是昨日已公开的 Bardeen，Make、Gumloop 仅作两个支持 Tool；补齐原先没有的选型去向，不重复收录或公开 Tool。

## 差分与依据

| 新入口 | 何时比较 | 限制与取舍 |
| --- | --- | --- |
| Bardeen → Make | 线索研究后还需在可视化 scenario 编排跨应用步骤、追查执行历史 | 重点是网页线索采集、AI筛选及补全导出时仍评估 Bardeen；两者都有AI，用同一任务核对动作、访问权限、失败处理及用量。未实测成本、可靠性或关浏览器执行。 |
| Bardeen → Gumloop | 研究和后续操作跨越多个应用，需要 Agent 选择连接器工具及逐工具审批设置 | 重点是网页线索采集、筛选和补全导出时仍评估 Bardeen；两者都有AI及Agent，核对来源权限、连接账号、写入审批及实际用量。没有准确率或无人值守可靠性保证。 |

本轮实际读取四个官方来源：[Bardeen 产品](https://www.bardeen.ai/)、[Bardeen 采集与运行描述](https://www.bardeen.ai/scraper)、
[Make 平台](https://www.make.com/product)、[Gumloop Agents 及账号/工具审批](https://docs.gumloop.com/core-concepts/agents)。
选型理由是基于文档的编辑判断，不是实测胜负；不把共有能力写成某一方独有，也不新增精确费用、免费额度或权限权益承诺。
Bardeen 所述独立浏览器窗口/本机采集不等于已验证关浏览器执行；没有试用账号、运行工作流或测试数据权限。

当前精确回读三个生产 Tool 均 published + monitor、质量100、非 rejected；Bardeen 的实际编辑复核为11-16，
Gumloop为11-12，Make引用范围由11-12实际维护记录支持，原编辑日期保持。八个已知维护日期均未到期，
有界未完成 Automation 候选查询为空、delivery 无待续交付；选择现有页面的具体决策缺口，不宣称全市场没有合格新工具。

只在现有 `lib/config/reviewedToolRelationships.ts` 增加两条方向性 overlaps；移除新增块后原配置逐字节不变。
不改冷却中的 n8n/Automation 主对比正文，不新建对比页、算法或发布器。Bardeen三语言原内容及素材不重做；
新理由为EN/CN，TW沿既有英文回退，不声称新增繁中理由。

关系 reviewedAt=11-17、reviewDueAt=11-19，交原日常 owner 与 Gumloop/相关关系节点合并实际复核，过期隐藏继续生效。
Bardeen 工具整体事实复核11-23、其他既有节点和Coverage/D+14计划保持；未核实证据不得只改日期续期。

## 发布与验收

状态：**独立 QA_PASS、实际部署及线上验收通过，delivery 已记 production_verified**。
复用原唯一独立 QA `/root/operations_qa`，报告绑定本次配置、生产前像、来源核查及消费者指纹；没有沿用旧对象签署。
内容提交 `bdb5e53f61b9caef9253bb69aab23e4c241efbb5` 已推送并确认 Vercel 部署成功。提交钩子仅运行该配置原有 eslint/prettier，提交后配置哈希仍与 QA 精确一致。

`2026-11-17T09:18:01.014Z` 完成一次定向线上验收：Bardeen EN/CN/TW 三页均200，真实标题/摘要、原11-16事实日期、
两条本地化原生链接及完整条件理由可见，共六个新增入口；Make、Gumloop六条语言目标页均有真实标题/摘要及 `#decision-card` 锚点。
九页均无流式not-found、self-canonical/noindex正确，sitemap仍154条且三工具均排除。没有初始失败、重复采样或重复发布。
所有九页为本轮实际采样；没有把历史PASS称作新采样。逐关系日期在配置与原资格门禁中核验，不声称模板显示逐链接日期。

这完成本次真实调度的有条件推荐交付，不是新增Tool或新建三份页面代码，也不代表Google收录或增长。
实际QA、部署与验收留在私有目录，公开只保留本汇总。11-19原日常owner需实际复核两条理由再续期，Bardeen整体11-23不变。

本轮不调用候选、Tool公开或Research关系RPC，不写生产数据库、Task/Fit、索引或sitemap，不创建索引release/D+时钟。
只进行来源/结构/资格/格式核对，纯编辑配置没有本地build、TypeScript或全量测试；复用今日只读观察，不重复GSC/Coverage。
详细当前对象、差分指纹、独立QA、部署及实际HTML留在 `.local/gsc/operations/bardeen-conditional-comparison-*2026-11-17.*`。
