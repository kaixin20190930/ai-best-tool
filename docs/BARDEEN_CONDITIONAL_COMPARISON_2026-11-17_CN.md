# Bardeen 有条件对比与推荐

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

当前状态：来源、结构、资格及日期检查通过，待独立 QA、现有 Git 部署和一次定向线上验收，尚不标 production_verified。
发布后核对主页面EN/CN/TW的真实标题/摘要、原事实日期、完整条件理由和本地化原生链接，及两个目标三语言的真实内容/锚点；
核对无流式not-found、self-canonical/noindex和sitemap排除。逐关系日期在配置与资格门禁中验证，不要求模板显示不存在的逐链接日期。

本轮不调用候选、Tool公开或Research关系RPC，不写生产数据库、Task/Fit、索引或sitemap，不创建索引release/D+时钟。
只进行来源/结构/资格/格式核对，纯编辑配置没有本地build、TypeScript或全量测试；复用今日只读观察，不重复GSC/Coverage。
详细当前对象、差分指纹、独立QA、部署及实际HTML留在 `.local/gsc/operations/bardeen-conditional-comparison-*2026-11-17.*`。
