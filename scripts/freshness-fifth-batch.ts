import type { ReviewCandidate } from './freshness-first-batch';

const source = 'docs/FRESHNESS_BACKLOG_AFTER_BATCH4_2026-10-08.json';
const sha256 = '86b65d3ef19ff7933014d7475b2563df4f924e560b3e38c6cd1df7a787d2d2cc';
const pass = (slug: string, due: string) => ({
  id: `editorial-2026-09-01:${slug}`,
  source,
  sha256,
  reviewedAt: '2026-09-01',
  validThrough: '2026-11-30',
  claimDueAt: due,
  scope: 'entity_baseline_only' as const,
});

const FIFTH_BATCH: ReviewCandidate[] = [
  {
    slug: 'pipedream',
    id: '2b5a4ac9-16a2-48f2-b53e-38fc6467aab0',
    expectedUrl: 'https://pipedream.com/',
    passSnapshot: pass('pipedream', '2026-09-07'),
    expectedDetailSha256: 'f4953b2d6d9164be6583da44b3dba7851873565d2c23dd15ef36a8873ebfb32d',
    outcome: 'reviewed_no_change',
    checkedAt: '2026-10-09',
    nextReviewDate: '2026-10-23',
    scope:
      'Public Workflows and Connect credit units, external-user billing, and product boundary; target workspace and production workload excluded.',
    changeSummary:
      'Official Workflows and Connect pricing still supports the existing distinct credit and external-user boundaries; no detail change.',
    sources: ['https://pipedream.com/docs/pricing', 'https://pipedream.com/pricing', 'https://pipedream.com/workflows'],
    unresolved: [
      'Actual production credit burn, external-user count, retention settings, and trigger ordering require target-workspace tests.',
    ],
    claims: [
      {
        id: 'workload-billing-and-reliability',
        status: 'conditional',
        category: 'account_rights',
        nextReviewDate: '2026-10-23',
        limitation: 'Measure one representative workflow and Connect user cohort in the target workspace.',
      },
    ],
  },
  {
    slug: 'cursor',
    id: 'ef1cc4b5-98be-474b-b422-7b6f79ca6c3d',
    expectedUrl: 'https://cursor.com/',
    passSnapshot: pass('cursor', '2026-09-08'),
    expectedDetailSha256: '8c86db6802be285bbb5db2d60ce8da3ce9b4b9f222bcfaf4397cd0236f4830f6',
    outcome: 'reviewed_no_change',
    checkedAt: '2026-10-09',
    nextReviewDate: '2026-10-23',
    scope:
      'Public plan prices, model-usage billing, Privacy Mode and SpaceX ownership; signed-in billing, selected models and future supply excluded.',
    changeSummary:
      'Official Cursor plan and privacy documentation still supports the published bounded claims; future model-supply transition remains conditional.',
    sources: [
      'https://cursor.com/pricing',
      'https://prod.cursor.com/help/account-and-billing/pricing',
      'https://cursor.com/data-use',
      'https://cursor.com/blog/joining-spacex',
      'https://openai.com/index/our-decision-on-cursor-following-its-acquisition-by-spacex/',
    ],
    unresolved: [
      'Regional checkout, actual model spend, workspace Privacy Mode, and future third-party model availability require target-account verification.',
    ],
    claims: [
      {
        id: 'model-availability-and-usage',
        status: 'conditional',
        category: 'account_rights',
        nextReviewDate: '2026-10-23',
        limitation: 'Check model picker, usage dashboard and privacy configuration in the target workspace.',
      },
    ],
  },
];

export default FIFTH_BATCH;
