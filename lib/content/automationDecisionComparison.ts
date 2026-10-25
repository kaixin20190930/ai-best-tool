import type { VerifiedComparison } from './verifiedComparison';

// Official-source editorial comparison. Account entitlements and real workload costs are not tested.
export const automationDecisionComparison: VerifiedComparison = {
  title: { cn: 'n8n vs Make vs Lindy：自动化工作该选谁？', en: 'n8n vs Make vs Lindy: which fits your automation work?' },
  scope: {
    cn: '三者都能连接工具，但选择点不同：n8n 适合需要部署与流程控制的技术团队；Make 适合可视化跨应用 scenario；Lindy 适合把开放式任务交给 AI 队友。下表依据官方公开资料，未实测你的账号、工作流可靠性或最终费用。',
    en: 'All three connect tools, but solve different jobs: n8n favors technical teams needing deployment and flow control; Make favors visual cross-app scenarios; Lindy favors delegating open-ended work to an AI teammate. This uses official public information, not tests of your account, workflow reliability, or final bill.',
  },
  candidates: [
    {
      slug: 'n8n', name: 'n8n',
      chooseWhen: { cn: '要自己控制部署、代码步骤、AI 节点和复杂流程时选 n8n。', en: 'Choose n8n when you need deployment choice, code steps, AI nodes, and complex flow control.' },
      strength: { cn: 'Cloud 按完整工作流执行次数计费，不按步骤数；另有免费自托管 Community。', en: 'Cloud bills complete workflow executions rather than steps; a free self-hosted Community edition also exists.' },
      limitation: { cn: '自托管要承担升级、备份和监控；Community 的治理能力与商业用途受套餐和 Sustainable Use License 约束。', en: 'Self-hosting needs upgrade, backup, and monitoring ownership; Community governance and commercial use have plan and Sustainable Use License boundaries.' },
      fit: { cn: 'Best for：有工程负责人、需要可控部署和可审计流程的团队。', en: 'Best for: teams with engineering ownership that need deployment control and auditable flows.' },
      notFor: { cn: 'Not ideal：没有运维责任人，或要让外部客户自行配置基于 n8n 的自动化而不核对许可。', en: 'Not ideal: no operations owner, or letting outside customers configure n8n-based automations without checking licensing.' },
      evidenceRefs: ['n8n-pricing', 'n8n-editions', 'n8n-license'],
    },
    {
      slug: 'make', name: 'Make',
      chooseWhen: { cn: '需要团队快速搭建跨 SaaS 的可视化 scenario，且能逐次核算模块用量时选 Make。', en: 'Choose Make for quickly building visual cross-SaaS scenarios when you can track module usage.' },
      strength: { cn: 'Scenario、模块与 AI Agent 可在同一托管平台组合；官方提供按运行查看 credits 的记录。', en: 'Scenarios, modules, and AI agents share a managed platform; Make offers per-run credit history.' },
      limitation: { cn: 'Credits 会随操作、token 与连接方式变化；自有模型连接还可能产生独立模型商费用。组织的数据区域创建后不可更改。', en: 'Credits vary with operations, tokens, and connection type; a custom model connection can add provider charges. The organization data region cannot be changed later.' },
      fit: { cn: 'Best for：业务运营团队要把确定的触发、分支和 SaaS 操作串成 scenario。', en: 'Best for: operations teams linking defined triggers, branches, and SaaS actions into scenarios.' },
      notFor: { cn: 'Not ideal：必须自己托管运行环境，或在未试算 AI scenario 前要求固定每任务成本。', en: 'Not ideal: teams requiring self-hosting or a fixed per-task AI cost before piloting a scenario.' },
      evidenceRefs: ['make-credits', 'make-history', 'make-region'],
    },
    {
      slug: 'lindy', name: 'Lindy',
      chooseWhen: { cn: '工作是跨工具的研究、跟进或协作任务，希望向 AI 队友交办并保留人工检查时选 Lindy。', en: 'Choose Lindy to delegate cross-tool research, follow-up, or collaborative work to an AI teammate with human review.' },
      strength: { cn: '官方将其定位为团队 AI 队友；团队共享 credits 池，重任务触及用量保护时会暂停询问。', en: 'Lindy positions itself as a team AI teammate; credits are pooled and unusually heavy tasks pause for confirmation.' },
      limitation: { cn: '每位活跃用户按席位计费，credits 进入团队共享池；任务类型和深度影响消耗，动作权限需在目标工作区核查。', en: 'Each active user is billed for a seat whose credits enter a shared pool; task depth affects usage, and action permissions need a workspace check.' },
      fit: { cn: 'Best for：愿意审核 AI 结果、想委派不完全固定步骤的团队工作。', en: 'Best for: teams willing to review AI output while delegating work without fully fixed steps.' },
      notFor: { cn: 'Not ideal：需要可预测的逐模块执行清单、自己托管或无需人工监督的高风险动作。', en: 'Not ideal: work requiring a predictable module-by-module trace, self-hosting, or unattended high-impact actions.' },
      evidenceRefs: ['lindy-pricing', 'lindy-usage'],
    },
  ],
  comparisonRows: [
    {
      dimension: { cn: '部署与责任', en: 'Deployment and ownership' },
      values: {
        n8n: { cn: 'Cloud 或自托管；自托管负责运维', en: 'Cloud or self-hosted; self-hosting needs operations' },
        make: { cn: '托管的组织与 scenario', en: 'Managed organizations and scenarios' },
        lindy: { cn: '托管的团队 AI 队友', en: 'Managed team AI teammate' },
      },
      fit: { cn: '要部署控制选 n8n', en: 'For deployment control, choose n8n' },
      reason: { cn: 'Make 与 Lindy 的官方公开路径是托管服务；自行托管 n8n 要计入维护成本。', en: 'Make and Lindy describe managed services; count maintenance when self-hosting n8n.' },
      evidenceRefs: ['n8n-editions', 'make-region', 'lindy-pricing'],
    },
    {
      dimension: { cn: '工作模型与 AI', en: 'Workflow and AI model' },
      values: {
        n8n: { cn: '节点式工作流、代码与 Agent/AI 节点', en: 'Node workflows, code, and agent/AI nodes' },
        make: { cn: 'Scenario 模块及 AI Agent', en: 'Scenario modules and AI agents' },
        lindy: { cn: '向 AI 队友委派任务', en: 'Delegate tasks to an AI teammate' },
      },
      fit: { cn: '按工作可定义程度选', en: 'Match how defined the work is' },
      reason: { cn: '固定步骤先试 n8n/Make；开放式任务先试 Lindy，并审核输出。', en: 'Pilot n8n/Make for defined steps; pilot Lindy for open-ended work and review its output.' },
      evidenceRefs: ['n8n-pricing', 'make-credits', 'lindy-pricing'],
    },
    {
      dimension: { cn: '计费单位', en: 'Billing unit' },
      values: {
        n8n: { cn: 'Cloud 以完整 workflow execution 计', en: 'Cloud: complete workflow executions' },
        make: { cn: 'Credits；AI 可含操作与 token', en: 'Credits; AI can include operations and tokens' },
        lindy: { cn: '活跃席位费用加团队共享 credits', en: 'Active-user seats plus shared team credits' },
      },
      fit: { cn: '用同一个真实任务试算', en: 'Cost one real task across tools' },
      reason: { cn: '三种单位不可直接比单价；记录触发频率、失败重试、模型费用及人工检查时间。', en: 'Unit prices are not directly comparable; include trigger frequency, retries, model charges, and human review time.' },
      evidenceRefs: ['n8n-pricing', 'make-credits', 'lindy-usage'],
    },
    {
      dimension: { cn: '人工确认与治理', en: 'Human review and governance' },
      values: {
        n8n: { cn: '可设计审批步骤；团队治理依版本/套餐', en: 'Approval steps can be designed; team governance varies by edition' },
        make: { cn: '在 scenario 中设计检查与异常路径', en: 'Design checks and exception routes in scenarios' },
        lindy: { cn: '重任务用量保护会暂停确认', en: 'Heavy usage can pause for confirmation' },
      },
      fit: { cn: '关键动作须在目标账号验证', en: 'Verify critical actions in your account' },
      reason: { cn: '公开能力不等于当前套餐、连接和权限配置都已启用。', en: 'Public capability does not prove your plan, connection, or permission setup supports it.' },
      evidenceRefs: ['n8n-editions', 'make-region', 'lindy-usage'],
    },
  ],
  evidence: [
    { id: 'n8n-pricing', claim: { cn: 'Cloud 套餐按完整执行计，包含 Agent/AI 节点。', en: 'Cloud plans count complete executions and include agent/AI nodes.' }, impact: { cn: '按实际触发频率估算，而非按节点直接换算。', en: 'Estimate actual trigger frequency, not node count.' }, source: { label: 'n8n pricing', url: 'https://n8n.io/pricing/' }, checkedAt: '2026-10-25' },
    { id: 'n8n-editions', claim: { cn: 'Community 可免费自托管，治理功能依版本不同。', en: 'Community can be self-hosted free; governance differs by edition.' }, impact: { cn: '先确定谁负责运行，再检查需要的权限。', en: 'Assign operations ownership and verify needed permissions.' }, source: { label: 'n8n editions', url: 'https://docs.n8n.io/deploy/host-n8n/community-edition-features/' }, checkedAt: '2026-10-25' },
    { id: 'n8n-license', claim: { cn: '外部客户配置工作流等用途可能需要商业许可。', en: 'Outside-customer workflow configuration can require a commercial license.' }, impact: { cn: '客户可编辑的产品场景先核许可。', en: 'Check licensing before customer-editable product use.' }, source: { label: 'n8n license FAQ', url: 'https://support.n8n.io/article/can-i-use-your-license-for-my-use-case' }, checkedAt: '2026-10-25' },
    { id: 'make-credits', claim: { cn: '非 AI 操作通常为一 credit；AI 消耗依连接和 token 变化。', en: 'Non-AI operations usually cost one credit; AI use varies with connection and tokens.' }, impact: { cn: '模型商费用与 Make credits 分开算。', en: 'Cost provider charges separately from Make credits.' }, source: { label: 'Make credits', url: 'https://help.make.com/credits' }, checkedAt: '2026-10-25' },
    { id: 'make-history', claim: { cn: '官方提供 scenario 运行级 credit 用量记录。', en: 'Make offers run-level credit usage history.' }, impact: { cn: '用试运行记录估算扩容成本。', en: 'Use pilot run records to estimate scaling cost.' }, source: { label: 'Make credit usage history', url: 'https://help.make.com/introducing-credit-usage-history' }, checkedAt: '2026-10-25' },
    { id: 'make-region', claim: { cn: '组织可选 US/EU 数据区，创建后不可修改。', en: 'An organization selects a US/EU data region that cannot be changed later.' }, impact: { cn: '建组织前确认数据要求。', en: 'Confirm data requirements before creating an organization.' }, source: { label: 'Make organizations', url: 'https://help.make.com/organizations' }, checkedAt: '2026-10-25' },
    { id: 'lindy-pricing', claim: { cn: 'Lindy 提供短期试用；活跃用户按席位计费并共享 credits。', en: 'Lindy offers a short trial; active users are billed per seat and share credits.' }, impact: { cn: '试用额度不能代表持续任务与席位成本。', en: 'Trial credits do not establish ongoing task and seat cost.' }, source: { label: 'Lindy pricing', url: 'https://www.lindy.ai/pricing' }, checkedAt: '2026-10-25' },
    { id: 'lindy-usage', claim: { cn: '团队共享 credits；高消耗任务会暂停询问。', en: 'The team shares credits; unusually heavy tasks pause for confirmation.' }, impact: { cn: '评估任务深度、暂停与人工审核。', en: 'Evaluate task depth, pauses, and human review.' }, source: { label: 'Lindy usage', url: 'https://docs.lindy.ai/account-billing/usage' }, checkedAt: '2026-10-25' },
  ],
  next: {
    href: '/guides/ai-tools-for-automation',
    label: { cn: '回到自动化选型指南', en: 'Open the automation selection guide' },
    description: { cn: '先写下一个真实任务及需要的人审、失败恢复和数据边界，再打开三款工具卡核对当前套餐。', en: 'Write down one real task, human-review and recovery needs, and data boundaries; then inspect the current plans on each tool card.' },
  },
};
