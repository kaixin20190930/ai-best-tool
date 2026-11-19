# Automation 到期事实与条件推荐复核

日期：2026-11-19，上海时间。触发：实际 `ai-best-tool-cluster` heartbeat `2026-11-19T08:57:05.393Z`。主页面为既有 Activepieces，支持 Tool 最多 Make、Gumloop；不新增工具或凑每日页面数。

## 当前阶段

已完成当前三个 Tool 的只读前像、已承诺到期队列及有界未完成候选核查，均为 published + monitor、质量 100、非 market rejected；Activepieces/Gumloop 整体事实今日到期，Make 整体日期为 11-26。本轮选择到期维护优先于新工具，不能把有界候选为空描述成全市场无合格工具。

**production_verified。**本轮实际 heartbeat 已完成当前对象独立 QA、受控数据提交、配置生产发布及一次三语言验收；不是手动回放、全队列完成或增长证明。

## 实际事实复核

读取并保存 8 份当前互补官方证据：Activepieces pricing、workflow builder、agent builder、入门文档；Gumloop pricing、agents；Make product、Credit usage history。每份保留采样时间、原始 HTML 和哈希，后续 QA/验收只复用，不重复采集。

- Activepieces：社区核心与付费治理、Agent/Chat 范围仍须分开；自托管有部署责任；BYOK 不代表平台免费。当前价格页的免费积分次日／每月刷新冲突，以及价格页与产品页的 API/MCP 资格冲突仍存在。保留原三语限制及未知边界，不强行选择一条、不新增精确权益报价。
- Gumloop：现价页仍为付费 Pro 的试用及 Enterprise 询价，不当永久免费。文档确认连接账号、读取与写入/删除审批预设及逐工具允许/询问/拒绝。模型、工具、计算及编排费用随任务变化；Agent 与 legacy workflows 及 Enterprise 可选部署不能混为普遍自托管承诺。
- Make：当前产品页同时描述明确流程和 Agent，运行级 credits 历史仍有官方依据。不把 AI、Agent、画布或执行记录写成某一方独有；未重新发布 Make 或将其全部旧事实改称今日验证。

现有主体、价格摘要和全部三语限制已如实覆盖本次证据，因此不重写正文；仅更新两个到期 Tool 的受控 maintenanceReview、next_review_date 和已有 en/zh freshnessSummary，记录实际复核和仍未解决的问题。原 editorial/market/source 日期及所有其他字段受保护，不以新的维护日期冒充新市场验证。下一复核日 11-26，不只是顺延日期。

## 条件推荐差分

只复核 Activepieces → Make/Gumloop 原两条 overlaps，不新增关系、不重复此前公开。Make 理由明确双方共有流程/AI/Agent/执行记录，选型是管理体验偏好与自托管责任；Gumloop 理由具体到连接器读写审批预设，对照 Activepieces 显式流程及关键审批点。两条均保留同任务试用、权限和费用条件，无成本、可靠性、安全或无人监督优胜承诺。

reviewedAt=11-19、reviewDueAt=11-26；沿原编辑配置和资格服务，默认到期隐藏不变。TW 理由继续既有英文 fallback，不声称新增繁中翻译或每条链接显示日期。

## 范围与接续

今日 Coverage 原 10 目标复核、D+14、中文首页修复和四个所有者产品公开已有独立证据，全部复用；GSC/Inspection、新建 Tool、入队/导入、Tool 重发、索引/sitemap、Task/Fit、关系 RPC 写入为 0。只沿既有 freshness 通用前像/回滚/提交/回查及 Git 配置发布，不新增运行时、迁移、框架或定时任务，不跑本地 build、TypeScript 或全量测试。

Gumloop 自身两条、Zapier 两条、Bardeen 两条关系也在今日到期，但不是本轮主页面范围；保留原到期并隐藏，不静默延长。下一有界日常轮按原到期与维护紧迫度接续，Zapier 整体 11-20 节点不变。不能把支持 Tool 的事实复核当作这些方向性推荐也已复核。

实际证据私有保存在 `.local/gsc/operations/daily-automation-*-2026-11-19.*` 与 `automation-due-*-2026-11-19.*`。公开只存汇总，不计增长，不改变 Lindy/Make 索引 HOLD 或站点 warning。

## 实际发布与验收

同一独立 QA 绑定当前 manifest、两个真实 Tool 前像、8 份来源及完整配置差分，`QA_PASS`。沿原通用 freshness writer 完成 preflight 0、实际事务 rollback 0、commit **2**、postcheck 0；两个 Tool 均 alreadyApplied，完整保护字段后像匹配。没有重走 Tool 入队、导入或公开。

配置提交 `402606883610a9cbb57ef6f9dfbfca7b0c80101d` 已推送，Vercel 生产部署 `dpl_DPX3mupm3n7PWKqnhzsiwcEXqqzf` 为 READY，正式域名匹配。部署技能仅用于核对精确提交、项目、环境和别名，不新增部署方式或 CI。

2026-11-19 **09:37:51—09:37:59 UTC** 一次采样 Activepieces、Gumloop、Make 各 EN/CN/TW，共 9 页：

- 变化的 Activepieces/Gumloop 6 页完整摘要、正文、价格边界、全部限制及本次维护提示可见；原事实/市场日期没有被改称今日验证。
- Activepieces 三语言页的原两条关系均显示完整条件理由和正确本地化目标锚点；TW 理由保留英文 fallback。Gumloop 自身到期关系仍隐藏。
- 3 个 Make 目标页身份、完整实际摘要和决策锚点可用；全部 9 页真实 200、无流式 not-found、官网去向、self-canonical、noindex-follow 通过。素材未改，不重新采集素材。
- sitemap 复用今日 03:30:33 UTC 的原 154 URL 文件和指纹，三个 monitor 对象均排除；没有再次请求 sitemap 或 GSC。

初始验收仅 Make TW 摘要断言失败，原 FAIL 和 9 份 HTML、时间及指纹保留。验收器误用 `getLocalizedField` 的 TW→EN 回退，而页面实际使用 `toolToDetailData/getLocalizedToolValue` 的 TW→zh-TW→zh→EN：Make 没有 TW 值，实际显示原中文 zh 摘要。用真实消费者对同 9 份 HTML 重新核对**完整摘要**，其他断言不变，离线更正 PASS，并由原独立 QA 审查附录；没有新采样、生产修补或重复发布。Make TW 仍是既有中文摘要回退与英文正文，不声称补齐繁中翻译。

私有原验收、更正和独立 QA 附录分别为 `automation-due-production-acceptance-2026-11-19.json`、`automation-due-production-acceptance-correction-2026-11-19.json`、`automation-due-review-qa-acceptance-appendix-2026-11-19.json`。两工具维护及 Activepieces 两关系下一实际复核 **11-26**；其他六条关系保持 **11-19 已到期、隐藏、待下一有界 owner 轮**，不是全部到期任务都已完成。
