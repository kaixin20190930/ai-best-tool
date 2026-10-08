import type { ReviewCandidate } from './freshness-first-batch';

// The post-commit audit is the immutable entity-baseline record for these five
// already-published rows. Its dated editorial evidence does not refresh Claims.
const source = 'docs/FRESHNESS_BACKLOG_POSTCOMMIT_2026-10-08.json';
const sha256 = '9363aef0427fad07ad4fbda25e1b753e76aa3b0b9dcb8d9f4050c77e28ba10d1';
const pass = (slug: string) => ({
  id: `editorial-2026-09-04:${slug}`,
  source,
  sha256,
  reviewedAt: '2026-09-04',
  validThrough: '2026-12-03',
  claimDueAt: '2026-09-18',
  scope: 'entity_baseline_only' as const,
});
const datePatches = (slug: string, english: string, chinese: string) =>
  (['en', 'zh', 'cn'] as const).map((locale) => ({
    field: 'detail' as const,
    locale,
    from: locale === 'en' ? english : chinese,
    to:
      locale === 'en'
        ? english.replace('2026-09-04', '2026-10-08').replace('2026-09-18', '2026-10-22')
        : chinese.replace('2026-09-04', '2026-10-08').replace('2026-09-18', '2026-10-22'),
  }));

const SECOND_BATCH: ReviewCandidate[] = [
  {
    slug: 'gemini',
    id: 'ccddfbaa-b7eb-4192-b9d6-aafc40488719',
    expectedUrl: 'https://gemini.google.com/',
    passSnapshot: pass('gemini'),
    expectedDetailSha256: '7ffec7d12f1ae37650818d0f6410c909a0c2459f7e57207da5fd6bc747784b00',
    outcome: 'reviewed_no_change',
    checkedAt: '2026-10-08',
    nextReviewDate: '2026-10-22',
    scope:
      'Personal Gemini Apps usage and Privacy Hub Claims only; work/school entitlements and account meter excluded.',
    changeSummary:
      'No public-fact change: five-hour refresh subject to weekly limits and Keep Activity-off 72-hour retention remain supported.',
    sources: [
      'https://support.google.com/gemini/answer/16275805?hl=en',
      'https://support.google.com/gemini/answer/13594961?hl=en',
      'https://support.google.com/gemini/answer/13278668?hl=en',
    ],
    unresolved: ['Account-specific limits, region and work/school administration are not publicly verifiable.'],
    claims: [
      {
        id: 'account-usage-entitlement',
        status: 'conditional',
        category: 'account_rights',
        nextReviewDate: '2026-10-22',
        limitation: 'Check signed-in Usage Limits and account type.',
      },
    ],
    replacements: datePatches(
      'gemini',
      'Official access, usage and privacy documentation checked 2026-09-04; next fact review 2026-09-18.',
      '官方访问、额度和隐私文档核查于 2026-09-04，下次事实复查为 2026-09-18。',
    ),
  },
  {
    slug: 'notion',
    id: 'fffb8714-bf45-4e61-bbee-fde1c6f97fd8',
    expectedUrl: 'https://www.notion.so/',
    passSnapshot: pass('notion'),
    expectedDetailSha256: '79c5f08241f41253f10d5257e967b67c7ab3240dde645875f904fe4c542d5f2c',
    outcome: 'fact_updated',
    checkedAt: '2026-10-08',
    nextReviewDate: '2026-10-22',
    scope:
      'Public Notion AI entitlement, premium-model credit and provider-retention Claims; workspace settings excluded.',
    changeSummary:
      'Clarify that premium AI models spend Notion credits and require owner/admin enablement; base plan and retention boundaries remain aligned.',
    sources: ['https://www.notion.com/help/notion-ai-faqs', 'https://www.notion.com/help/notion-ai-security-practices'],
    unresolved: [
      'Workspace premium-model enablement, actual credits and enabled data-retaining LLMs require admin/account inspection.',
    ],
    claims: [
      {
        id: 'premium-model-entitlement',
        status: 'conditional',
        category: 'account_rights',
        nextReviewDate: '2026-10-22',
        limitation: 'Admin enablement and workspace credit balance are account-specific.',
      },
    ],
    replacements: [
      ...datePatches(
        'notion',
        'Official documentation checked 2026-09-04; next fact review 2026-09-18.',
        '官方资料核查于 2026-09-04，下次事实复查 2026-09-18。',
      ),
      ...(['en', 'zh', 'cn'] as const).map((locale) => ({
        field: 'detail' as const,
        locale,
        from:
          locale === 'en'
            ? 'Some AI features have usage allowances, so included access is not unlimited.'
            : '部分 AI 功能存在用量额度，包含 AI 不等于无限使用；',
        to:
          locale === 'en'
            ? 'Some AI features have usage allowances. Premium models consume Notion credits and require workspace owner or admin enablement, so included access is not unlimited.'
            : '部分 AI 功能存在用量额度；高级模型使用 Notion credits，且须由工作区所有者或管理员开启，包含 AI 不等于无限使用；',
      })),
    ],
  },
  {
    slug: 'n8n',
    id: '23bb3601-a5ac-42c3-bff3-64b06a063959',
    expectedUrl: 'https://n8n.io/',
    passSnapshot: pass('n8n'),
    expectedDetailSha256: '3529734b7374bb520c5c4f2890453e708b6171a8311d048b716167d017f298cb',
    outcome: 'fact_updated',
    checkedAt: '2026-10-08',
    nextReviewDate: '2026-10-22',
    scope:
      'Public annual plan pricing, workflow executions and Cloud AI-credit boundaries; account billing and BYOK usage excluded.',
    changeSummary:
      'Plan prices and execution quantities remain aligned; clarify current Cloud Assistant credits and keyless AI model availability.',
    sources: [
      'https://n8n.io/pricing/',
      'https://docs.n8n.io/deploy/host-n8n/community-edition-features/',
      'https://docs.n8n.io/privacy-and-security/sustainable-use-license',
    ],
    unresolved: [
      'Selected account billing, AI model consumption and external provider charges require workflow/account inspection.',
    ],
    claims: [
      {
        id: 'ai-workflow-cost',
        status: 'conditional',
        category: 'price',
        nextReviewDate: '2026-10-22',
        limitation:
          'Assistant credits and keyless models vary by plan; BYOK provider costs and actual workflow usage require account verification.',
      },
    ],
    replacements: [
      ...(['en', 'zh', 'cn'] as const).map((locale) => ({
        field: 'detail' as const,
        locale,
        from:
          locale === 'en'
            ? 'AI Assistant credits are separate from model-provider API charges within workflows.'
            : 'AI Assistant credits 不等于工作流内部模型商 API 费用。',
        to:
          locale === 'en'
            ? 'Cloud plans list Assistant credits and AI models without API keys; confirm the selected model and plan allowance, while separately budgeting any external provider API keys used in workflows.'
            : 'Cloud 套餐列出 Assistant credits 和无需 API key 的 AI 模型；须按所选模型与套餐核对额度，并单独预算工作流中外部模型商 API key 的费用。',
      })),
      ...(['en', 'zh', 'cn'] as const).map((locale) => ({
        field: 'detail' as const,
        locale,
        from: locale === 'en' ? 'Pricing checked 2026-09-04:' : '2026-09-04 核验：',
        to: locale === 'en' ? 'Pricing checked 2026-10-08:' : '2026-10-08 核验：',
      })),
    ],
  },
  {
    slug: 'openrouter',
    id: 'f77fb817-e8dc-4c22-b7cd-8edc2e5b0a5e',
    expectedUrl: 'https://openrouter.ai/',
    passSnapshot: pass('openrouter'),
    expectedDetailSha256: '688e283f363233ebe6cfd0594430dfdd2a8b3e8a30bdf6ca79f349d5fb3eba38',
    outcome: 'fact_updated',
    checkedAt: '2026-10-08',
    nextReviewDate: '2026-10-15',
    scope: 'Public Free, Standard, Business and BYOK plan claims; provider passthrough and account invoice excluded.',
    changeSummary:
      'Remove stale fixed Enterprise BYOK threshold and distinguish Standard 5.5% from Business 8% platform fee.',
    sources: [
      'https://openrouter.ai/pricing',
      'https://openrouter.ai/docs/guides/routing/provider-selection',
      'https://openrouter.ai/docs/guides/privacy/provider-logging',
    ],
    unresolved: ['Enterprise BYOK terms are custom and exact endpoint/provider costs require account verification.'],
    claims: [
      {
        id: 'enterprise-byok-terms',
        status: 'unknown',
        category: 'price',
        nextReviewDate: '2026-10-15',
        limitation: 'Public pricing says custom; obtain target-account quote.',
      },
    ],
    replacements: [
      ...(['en', 'zh', 'cn'] as const).map((locale) => ({
        field: 'detail' as const,
        locale,
        from: locale === 'en' ? 'Pricing checked 2026-09-04:' : '2026-09-04 核验的',
        to: locale === 'en' ? 'Pricing checked 2026-10-08:' : '2026-10-08 核验的',
      })),
      ...(['en', 'zh', 'cn'] as const).map((locale) => ({
        field: 'detail' as const,
        locale,
        from:
          locale === 'en'
            ? 'Pay-as-you-go has a 5.5% platform fee and no minimum spend. BYOK has no platform fee on the first $25,000 of list-price inference per month, then 5%; Enterprise has a separate $200,000 threshold.'
            : '按量付费平台费为 5.5%，无最低消费。BYOK 每月前 $25,000 标价推理免平台费，之后为 5%；Enterprise 阈值为 $200,000。',
        to:
          locale === 'en'
            ? 'Standard pay-as-you-go lists a 5.5% platform fee; Business lists 8%. Standard and Business BYOK list no fee on the first $25,000 of list-price inference per month, then 5%; Enterprise terms are custom. Verify the selected plan and invoice.'
            : 'Standard 按量付费平台费为 5.5%，Business 为 8%。Standard 和 Business 的 BYOK 每月前 $25,000 标价推理免平台费，之后为 5%；Enterprise 条款需定制询价。应核对所选套餐与账单。',
      })),
    ],
  },
  {
    slug: 'poe',
    id: '0dfc49cb-f226-41fe-896a-8a881f5c2761',
    expectedUrl: 'https://poe.com/',
    passSnapshot: pass('poe'),
    expectedDetailSha256: 'eb8206298cdd9e5ff2200de3063557ab4619e8ec1cf3a95f23e25a20c3fce75f',
    outcome: 'reviewed_no_change',
    checkedAt: '2026-10-08',
    nextReviewDate: '2026-10-22',
    scope:
      'Public compute-point, purchase-channel and privacy-shield Claims; region checkout and account balances excluded.',
    changeSummary: 'Current official purchase FAQ and Privacy Center still support the published bounded claims.',
    sources: [
      'https://help.poe.com/hc/en-us/articles/19945140063636-Poe-Purchases-FAQs',
      'https://poe.com/pages/privacy-center',
    ],
    unresolved: [
      'Regional checkout, plan points, selected bot cost and actual shield permissions require account inspection.',
    ],
    claims: [
      {
        id: 'regional-checkout-and-points',
        status: 'conditional',
        category: 'account_rights',
        nextReviewDate: '2026-10-22',
        limitation: 'Check purchase channel, point balance and selected bot in target account.',
      },
    ],
    replacements: datePatches(
      'poe',
      'Official documentation checked 2026-09-04; next fact review 2026-09-18.',
      '官方资料核查于 2026-09-04，下次事实复查 2026-09-18。',
    ),
  },
];

export default SECOND_BATCH;
