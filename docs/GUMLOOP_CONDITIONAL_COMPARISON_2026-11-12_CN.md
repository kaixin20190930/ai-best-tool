# Gumloop 有条件对比与推荐交付

日期：2026-11-12（上海）。本轮为更新后日常任务的明确手动执行：选择 Automation 下一个未完成的比较去向，不重复 Activepieces 已完成的两条推荐。

## 实际差分

主页面为已公开 Gumloop，仅以 Make、Lindy 为两个支持 Tool。既有 Gumloop 正文已提及比较维度，但编辑关系清单没有 Gumloop 入口；本次新增两条方向性 `overlaps`，通过现有 Decision Card 的“接下来比较 / Compare next”提供可操作的比较去向，不新建页面、引擎或关系表。

| 新入口 | 何时比较 | 先核对什么 |
| --- | --- | --- |
| Gumloop → Make | 预先确定步骤、可视化跨应用 scenario 和执行历史；与按任务选择连接器工具的方式对照 | 两者都有 AI；用同一任务核对写入权限、失败恢复、实际用量，不作成本或可靠性优胜断言 |
| Gumloop → Lindy | 团队频道/私聊中的研究、跟进、例行委派；与 Agent 连接器及逐工具审批配置对照 | 两者都有 Agent/审批；核对连接账号、写入权限和任务用量，并计入 Lindy 活跃席位与共享 credits，不以试用推断长期费用 |

Activepieces 两条推荐及其原日期/内容保持不变；Make/Lindy 旧有关系、冷却中的 n8n 和主 Automation comparison 正文均不重做。不调用工具入队、导入、Tool 公开或 Research 关系发布器，不借等待 Google 收录暂停本项站内交付。

## 依据与边界

本轮精确回读 Gumloop、Make、Lindy 三个真实生产 Tool，均 `published + monitor`、质量分 100、非 market rejected。Gumloop 官方事实复核为 11-12；Make/Lindy 的原编辑日期未改，其 11-12 实际维护后像支持本轮引用范围，不把局部维护称为全工具事实重审。

Gumloop 连接器工具选择、账号和审批及 Make scenario/执行历史复用今天已实读并落账的官方依据：[Gumloop Agents](https://docs.gumloop.com/core-concepts/agents)、[Make 平台](https://www.make.com/product)。本轮另读取 [Lindy 当前定价及团队入口](https://www.lindy.ai/pricing)、[Lindy 用量文档](https://docs.lindy.ai/account-billing/usage)，支持频道/私聊任务、例行工作、活跃席位及共享用量取舍。条件选择是编辑判断，不是性能排名；不新增精确价格或账户权益断言，未实测工作流、账号权限、费用或可靠性。

新关系 reviewedAt=11-12、reviewDueAt=**11-19**，与 Gumloop 到期维护合并交既有日常 owner；原到期隐藏逻辑保留，实际复核后才可续期。站点仍 warning；三工具继续 noindex/sitemap 排除，不扩大索引、Task/Fit 或市场验证权限，不新增 release/D+ 时钟。

## 审核、发布与验收

状态：**独立 QA_PASS，待部署及线上验收**。复用原唯一 QA，报告绑定当前配置指纹 `92edfe4cfc4680deebd7715e264e7ba2b868862fa59fc3278dd68f7e13eeeb9a`；精确移除本轮新增块后与原 HEAD 逐字节相同，Activepieces 两条及全部已有关系未变。生产消费者与已审版本相同，无 blocker；配置通过不冒充线上完成。

只核对来源、内容结构、方向去重、当前资格、复核日期及格式；无运行时组件/逻辑变化，不跑本地 build、TypeScript 或全量测试。独立 QA 通过后沿普通 Git 推送及现有生产部署，实际受影响 EN/CN/TW 页面各做一次定向验收。按当前原生 Compare next 链接核对完整理由、语言路径及目标锚点，不使用旧 article 卡片假设；页面事实日期与配置中的关系日期分别记录，TW 理由沿现有英文 fallback。

私有证据保留 `.local/gsc/operations/gumloop-conditional-comparison-*`；目标证据未变化则复用同日成功验收及其原时间，公开仅保存本汇总。11-19 Coverage/D+14 和其他已承诺维护节点保持，不新增定时任务。
