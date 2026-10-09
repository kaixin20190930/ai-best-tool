import type { ReviewCandidate } from './freshness-first-batch';

const sources = [
  'https://replit.com/pricing',
  'https://docs.replit.com/billing/plans/starter-plan',
  'https://docs.replit.com/billing/plans/replit-core',
  'https://docs.replit.com/billing/plans/replit-pro',
  'https://docs.replit.com/billing/ai-billing',
  'https://docs.replit.com/billing/deployment-pricing',
  'https://docs.replit.com/billing/managing-spend',
];

const REPLIT: ReviewCandidate[] = [
  {
    slug: 'replit',
    id: 'b14c8fe0-3dc5-47ed-8dd8-9d16c9892f85',
    expectedUrl: 'https://replit.com/',
    passSnapshot: {
      id: 'release-2026-09-09:replit',
      source: 'data/collection/replit-release.json',
      sha256: '152fe4c059f6b3d386a152fc6254c33a55eefca03c28d042c39ad8a3a623b6e6',
      reviewedAt: '2026-09-09',
      validThrough: '2026-12-08',
      claimDueAt: '2026-10-09',
      scope: 'entity_baseline_only',
    },
    expectedDetailSha256: '41db2b61fba39801c69fba05e70e8965816600c991ce6d1a79c8a49adec0fb5a',
    outcome: 'fact_updated',
    checkedAt: '2026-10-09',
    nextReviewDate: '2026-10-16',
    scope:
      'Public Starter/Core/Pro capabilities, AI and deployment billing, and spend controls; no signed-in checkout, regional tax, Enterprise quote, or measured credit burn.',
    changeSummary:
      'Replace unverified exact Core/Pro price and credit assertions with official plan capability boundaries; clarify that usage limits cap spending beyond monthly credits and account checkout controls the actual amount.',
    sources,
    unresolved: [
      'The current public pricing page did not expose plan amounts in the retrieved page; exact monthly/annual checkout, included credits, regional tax and Enterprise terms require target-account verification.',
      'Actual Agent, deployment and managed-service credit burn, and the effective budget or shutdown settings, require a representative account and workload.',
    ],
    claims: [
      {
        id: 'core-pro-checkout-and-credits',
        status: 'unknown',
        category: 'price',
        nextReviewDate: '2026-10-16',
        limitation: 'Confirm plan, billing interval, included credits and tax in target-account checkout.',
      },
      {
        id: 'usage-burn-and-spend-controls',
        status: 'conditional',
        category: 'account_rights',
        nextReviewDate: '2026-10-23',
        limitation: 'Inspect target account usage, credit packs, usage limit and service shutdown limit.',
      },
    ],
    pricingSnapshot: {
      checkedAt: '2026-10-09',
      starter: 'Free; daily Agent credits; Lite build; one published app for 30 days',
      core: 'Paid; up to 5 collaborators, one active background task and unlimited published apps; exact checkout and monthly credits unverified',
      pro: 'Paid; up to 15 collaborators, 10 parallel tasks, premium support and database restore up to 28 days; exact checkout and credit tier unverified',
      enterprise: 'Custom quote and controls; target contract required',
      warning:
        'Paid Agent work uses effort-based pricing; monthly credits also cover publishing and cloud services. Usage limits cap spending beyond included credits; inspect account-specific controls and actual burn.',
    },
    replacements: [
      {
        field: 'detail',
        locale: 'en',
        from: 'Current commercial boundary, reviewed September 9, 2026: Starter is free and provides daily Agent credits, Free Mode within its allowance, Lite build, and one published app that expires after 30 days. Full build, Plan Mode, connectors, Replit AI Integrations, additional published apps, and badge removal require a paid plan. The live pricing page shows Core at a $20 monthly reference price or $17 per month when billed annually, with $20 toward the most powerful models, up to five collaborators, one active background task, and unlimited workspaces and published apps. Pro is shown at a $100 monthly reference price or $95 per month when billed annually, with $100 toward the most powerful models, up to 15 collaborators, 10 parallel agents, premium support, and database rollback up to 28 days. Enterprise uses custom terms. Taxes and current checkout terms can vary, so confirm the official page before purchase.',
        to: 'Commercial boundary, checked October 9, 2026: Starter is free with daily Agent credits, limited Free Mode, Lite build, and one published app that expires after 30 days. Full build, Plan Mode, connectors, Replit AI Integrations, additional published apps, and badge removal require a paid plan. Core supports up to five collaborators, one active background task, and unlimited workspaces and published apps. Pro supports up to 15 collaborators, 10 parallel tasks, premium support, and database restore up to 28 days; longer database retention can add storage cost. Enterprise terms are custom. The public pricing page did not expose a verifiable current price and credit table in this review, so confirm the plan, billing interval, included credits, taxes, and checkout amount in the target account before purchase.',
      },
      {
        field: 'detail',
        locale: 'en',
        from: 'Set alerts and hard budget limits before a substantial build.',
        to: 'Set usage alerts and inspect both usage and service shutdown limits before a substantial build. Usage limits cap spending beyond monthly credits, while credit packs and auto-reload can change the effective spending path.',
      },
      ...(['zh', 'cn'] as const).flatMap((locale) => [
        {
          field: 'detail' as const,
          locale,
          from: '截至 2026 年 9 月 9 日的商业边界：Starter 免费，提供每日 Agent credits、额度内的 Free Mode、Lite build，以及一个 30 天后到期的已发布应用。Full build、Plan Mode、连接器、Replit AI Integrations、更多发布应用和移除品牌需要付费方案。当前价格页显示 Core 的月付参考价为 20 美元，年付折算为每月 17 美元，包含 20 美元的高能力模型额度、最多 5 名协作者、1 个活动后台任务，以及不限数量的 workspace 和已发布应用。Pro 的月付参考价为 100 美元，年付折算为每月 95 美元，包含 100 美元的高能力模型额度、最多 15 名协作者、10 个并行 Agent、优先支持和最长 28 天数据库回滚。Enterprise 为定制条款。税费和结账条件可能因地区变化，购买前仍应核对官网。',
          to: '截至 2026 年 10 月 9 日的商业边界：Starter 免费，提供每日 Agent credits、额度内的 Free Mode、Lite build，以及一个 30 天后到期的已发布应用。Full build、Plan Mode、连接器、Replit AI Integrations、更多发布应用和移除品牌需要付费方案。Core 支持最多 5 名协作者、1 个活动后台任务，以及不限数量的 workspace 和已发布应用。Pro 支持最多 15 名协作者、10 个并行任务、优先支持和最长 28 天数据库恢复；延长保留时间可能增加存储成本。Enterprise 为定制条款。本次公开价格页未提供可核实的完整实时价格与额度表，购买前须在目标账号核对套餐、付款周期、包含的 credits、税费和结账金额。',
        },
        {
          field: 'detail' as const,
          locale,
          from: '正式构建前应设置提醒和硬预算上限。',
          to: '正式构建前应设置用量提醒，并核对用量上限与服务停用上限。用量上限约束的是月度 credits 之外的支出；额外 credit packs 与自动充值也会影响实际消费路径。',
        },
      ]),
    ],
  },
];

export default REPLIT;
