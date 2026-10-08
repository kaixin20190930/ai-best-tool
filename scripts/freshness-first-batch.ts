export type ReviewCandidate = {
  slug: string; id: string; outcome: 'reviewed_no_change' | 'fact_updated';
  checkedAt: string; nextReviewDate: string; scope: string; changeSummary: string;
  sources: string[]; unresolved: string[];
  replacements?: { field: 'detail'; locale: 'en' | 'zh' | 'cn'; from: string; to: string }[];
  pricingSnapshot?: Record<string, string>;
  claims?: { id: string; status: 'conditional' | 'conflict' | 'unknown'; category: 'price' | 'account_rights' | 'core_capability'; nextReviewDate: string; limitation: string }[];
};

const consensusApi = {
  en: ['250 API or MCP calls per month', '500 API or MCP calls per month', 'API or MCP calls to 1,000 per month', 'API or MCP calls to 2,000 per month'],
  zh: ['250 次 API/MCP 调用', '500 次 API/MCP 调用', '1,000 次', '2,000 次'],
} as const;
const synthOld = {
  en: ['Current commercial boundary, reviewed September 8, 2026:', '\n\nTeam-cost warning:'],
  zh: ['截至 2026 年 9 月 8 日的商业边界：', '\n\n团队成本提醒：'],
} as const;

export const FIRST_BATCH: ReviewCandidate[] = [
  { slug: 'consensus', id: 'f15873ae-c6ef-4f0a-b811-b40c2aba76ab', outcome: 'fact_updated', checkedAt: '2026-10-08', nextReviewDate: '2026-10-22',
    scope: 'Official plan/API allowances, corpus and full-text boundary since 2026-09-06; no account or independent accuracy test.',
    changeSummary: 'Official Pro and Deep API/MCP monthly allowances changed from 250/1,000 to 500/2,000; other checked public boundaries remain aligned.',
    sources: ['https://help.consensus.app/en/articles/10087865-subscription-plans','https://help.consensus.app/en/articles/10055108-consensus-research-database','https://help.consensus.app/en/articles/11740827-how-to-use-deep-review'],
    unresolved: ['Account-specific reset and independent accuracy remain untested.'],
    replacements: [
      { field: 'detail', locale: 'en', from: consensusApi.en[0], to: consensusApi.en[1] },
      { field: 'detail', locale: 'en', from: consensusApi.en[2], to: consensusApi.en[3] },
      ...(['zh','cn'] as const).flatMap(locale => [
        { field: 'detail' as const, locale, from: consensusApi.zh[0], to: consensusApi.zh[1] },
        { field: 'detail' as const, locale, from: consensusApi.zh[2], to: consensusApi.zh[3] },
      ]),
    ] },
  { slug: 'gamma', id: '6512aa61-8663-49f8-809d-2a2ab4e529ad', outcome: 'reviewed_no_change', checkedAt: '2026-10-08', nextReviewDate: '2026-10-22',
    scope: 'Official plan credits, import/export and training controls since 2026-09-06; no paid checkout or export test.',
    changeSummary: 'Decision-relevant public claims still align; official article now also lists Business, which the existing page does not claim to enumerate.',
    sources: ['https://help.gamma.app/en/articles/8077107-how-can-i-upgrade-my-gamma-subscription','https://help.gamma.app/en/articles/8022861-what-s-the-easiest-way-to-export-my-gamma','https://help.gamma.app/en/articles/12281928-does-gamma-use-my-content-to-train-its-ai-features'],
    unresolved: ['Exact checkout amount and paid export fidelity require account testing.'],
    claims: [{ id: 'checkout-price', status: 'unknown', category: 'price', nextReviewDate: '2026-10-15', limitation: 'Exact amount needs account checkout.' }] },
  { slug: 'perplexity', id: '3d018623-85f9-4df4-bd55-9a4a0e7a2d93', outcome: 'fact_updated', checkedAt: '2026-10-08', nextReviewDate: '2026-10-15',
    scope: 'Official consumer allowance and Computer usage change since 2026-09-06; no signed-in account test.',
    changeSummary: 'Remove exact Free Pro Search count while official help conflicts; paid Consumer Pro now has rolling weekly Computer usage for eligible accounts before credits.',
    sources: ['https://www.perplexity.ai/help-center/en/articles/11187416-which-perplexity-subscription-plan-is-right-for-you','https://www.perplexity.ai/help-center/en/articles/13838041-how-credits-work-on-perplexity'],
    unresolved: ['Free Pro Search daily number remains conflict/conditional; account meter is authoritative.', 'Weekly Computer inclusion rolls out gradually and was not verified in an account.'],
    claims: [
      { id: 'free-pro-search-allowance', status: 'conflict', category: 'account_rights', nextReviewDate: '2026-10-15', limitation: 'Official help pages disagree; use signed-in usage meter.' },
      { id: 'weekly-computer-inclusion', status: 'conditional', category: 'account_rights', nextReviewDate: '2026-10-15', limitation: 'Gradual rollout, not verified for an account.' },
    ],
    replacements: (['en','zh','cn'] as const).map(locale => ({ field: 'detail' as const, locale,
      from: locale === 'en' ? 'Free currently includes three Pro Searches per day and one Research query per month.' : 'Free 当前每天包含 3 次 Pro Search、每月 1 次 Research。',
      to: locale === 'en' ? 'Free Pro Search and Research allowances vary across official help pages; check the signed-in usage meter before relying on an exact count.' : '官方帮助页的 Free Pro Search 与 Research 额度口径可能冲突；准确次数应以登录后的用量页为准。' })) },
  { slug: 'make', id: 'c0bb3aba-33be-4e14-903e-5f1d036eec4a', outcome: 'reviewed_no_change', checkedAt: '2026-10-08', nextReviewDate: '2026-10-22',
    scope: 'Official credit mechanics, provider cost split and fixed data region since 2026-09-06; not a scenario run.',
    changeSummary: 'Reviewed decision boundaries remain aligned with current official credit and organization documentation.',
    sources: ['https://help.make.com/credits','https://help.make.com/organizations','https://help.make.com/webhooks'],
    unresolved: ['Actual scenario credit burn, queue behavior and failure recovery require a live representative workflow.'] },
  { slug: 'synthesia', id: '87a0f886-1472-4111-a09a-6a6c781dcf42', outcome: 'fact_updated', checkedAt: '2026-10-08', nextReviewDate: '2026-10-15',
    scope: 'Official pricing, credits and avatar consent since 2026-09-08; no checkout, API account or video generation.',
    changeSummary: 'Basic/Starter/Pro credits and packaging changed materially; replace stale plan paragraph with bounded current public summary. API entitlement remains conditional pending account verification.',
    sources: ['https://www.synthesia.io/pricing','https://docs.synthesia.io/docs/user-licenses','https://docs.synthesia.io/docs/personal-avatars','https://docs.synthesia.io/reference/introduction'],
    unresolved: ['API entitlement and rate limits must be confirmed in the target account; legacy Creator claims are suppressed.', 'Checkout and add-on prices may depend on billing selection.'],
    claims: [
      { id: 'api-entitlement', status: 'conditional', category: 'account_rights', nextReviewDate: '2026-10-15', limitation: 'Verify target-account API access and rate limits.' },
      { id: 'checkout-addons', status: 'unknown', category: 'price', nextReviewDate: '2026-10-15', limitation: 'Verify target checkout and add-on pricing.' },
    ],
    pricingSnapshot: { checkedAt: '2026-10-08', basic: '$0/mo; 500 credits/mo plus separate 10-minute video/dubbing allowance', starter: '$29/mo billed monthly; 1,250 credits/mo', pro: '$89/mo billed monthly; 6,000 credits/mo', enterprise: 'Custom pricing', warning: 'Public pricing only; checkout, API access, seats and add-ons require account verification.' },
    replacements: (['en','zh','cn'] as const).map(locale => ({ field: 'detail' as const, locale,
      from: synthOld[locale === 'en' ? 'en' : 'zh'][0], to: locale === 'en'
        ? 'Current public pricing boundary, checked October 8, 2026: Basic is $0 with 500 credits per month plus a separate 10-minute video or dubbing allowance. Starter is shown at $29 per month with 1,250 credits per month; Pro is shown at $89 per month with 6,000 credits per month. Credits cover several AI activities, and billed usage depends on the workflow. Verify checkout, seats, API entitlement and add-ons in the target account before purchase.'
        : '截至 2026 年 10 月 8 日的公开商业边界：Basic 为每月 $0、500 credits，另有 10 分钟视频或配音额度；Starter 页面显示每月 $29、1,250 credits；Pro 页面显示每月 $89、6,000 credits。多项 AI 功能共用 credits，实际消耗取决于工作流。购买前在目标账号核对结账价、席位、API 权益和附加项。' })) },
];

export function applyCandidateDetail(detail: Record<string, string>, candidate: ReviewCandidate) {
  const result = { ...detail };
  for (const patch of candidate.replacements || []) {
    const before = result[patch.locale];
    if (typeof before !== 'string' || !before.includes(patch.from)) throw new Error(`${candidate.slug}: missing exact preimage ${patch.locale}`);
    if (candidate.slug === 'synthesia') {
      const end = synthOld[patch.locale === 'en' ? 'en' : 'zh'][1];
      const startAt = before.indexOf(patch.from); const endAt = before.indexOf(end, startAt);
      if (endAt < 0) throw new Error('Synthesia paragraph end missing');
      result[patch.locale] = before.slice(0, startAt) + patch.to + before.slice(endAt);
      // The old Creator API assertion cannot be retained after the plan rename.
      result[patch.locale] = result[patch.locale].replace(
        patch.locale === 'en' ? /API access is shown on Creator and Enterprise[^\n]*/ : /API 目前显示在 Creator 和 Enterprise 方案中[^\n]*/,
        patch.locale === 'en' ? 'API availability, account ownership and rate limits require confirmation in the target account before production use.' : 'API 是否可用、密钥归属和限额须在目标账号内确认后才能用于生产。');
    } else result[patch.locale] = before.replace(patch.from, patch.to);
  }
  return result;
}
