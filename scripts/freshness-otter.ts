import type { ReviewCandidate } from './freshness-first-batch';

const OTTER: ReviewCandidate[] = [
  {
    slug: 'otter-ai',
    id: 'b8d6a9bd-d9cd-4690-b801-15b1c1fe0a49',
    expectedUrl: 'https://otter.ai/',
    passSnapshot: {
      id: 'release-2026-09-10:otter-ai',
      source: 'data/collection/otter-ai-release.json',
      sha256: '771fa3416a09e8205775f179185edf969154728965b6030f665b9958e9548170',
      reviewedAt: '2026-09-10',
      validThrough: '2026-12-09',
      claimDueAt: '2026-10-10',
      scope: 'entity_baseline_only',
    },
    expectedDetailSha256: 'd90fffffb03cc8f3eb830bb858ec4cff5fcaf6081bc9c561ca40395fed91f658',
    outcome: 'reviewed_no_change',
    checkedAt: '2026-10-10',
    nextReviewDate: '2026-10-24',
    scope:
      'Existing public Basic, Pro and Business price, transcription, import, duration and history claims; no account checkout or usage test.',
    changeSummary:
      'Official pricing and Basic-plan help still support the existing public commercial claims; monthly minutes remain non-rollover.',
    sources: [
      'https://otter.ai/pricing',
      'https://help.otter.ai/hc/en-us/articles/360047538094-Conversation-import-and-app-limits-on-the-Basic-free-plan',
      'https://help.otter.ai/hc/en-us/articles/25205539848343-When-will-my-monthly-minutes-reset',
    ],
    unresolved: [
      'Checkout, taxes, regional pricing, promotional eligibility and target-account minute meter were not tested.',
    ],
    claims: [
      {
        id: 'checkout-and-account-entitlements',
        status: 'conditional',
        category: 'price',
        nextReviewDate: '2026-10-24',
        limitation:
          'Confirm actual billing interval, price, tax, promotion and limits in the target account before purchase.',
      },
    ],
  },
];

export default OTTER;
