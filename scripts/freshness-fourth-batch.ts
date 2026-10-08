import type { ReviewCandidate } from './freshness-first-batch';

export const FOURTH_BATCH_PUBLISH_NOT_BEFORE = '2026-10-10';
export const FOURTH_BATCH_OWNER_TIME_OVERRIDE = Object.freeze({
  batch: 'fourth',
  originalPublishNotBefore: FOURTH_BATCH_PUBLISH_NOT_BEFORE,
  ownerAuthorizedOn: '2026-10-08',
  effectiveReleaseDate: '2026-10-08',
  reason: 'Owner authorized sequential execution without calendar delay',
});
export function fourthBatchReleaseAllowed(asOfShanghai: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(asOfShanghai) && asOfShanghai >= FOURTH_BATCH_OWNER_TIME_OVERRIDE.effectiveReleaseDate
  );
}
export function assertFourthBatchReleaseManifest(manifest: Record<string, any>) {
  if (
    manifest?.publishNotBefore !== FOURTH_BATCH_PUBLISH_NOT_BEFORE ||
    JSON.stringify(manifest?.ownerTimeOverride) !== JSON.stringify(FOURTH_BATCH_OWNER_TIME_OVERRIDE) ||
    manifest?.mode !== 'preflight' ||
    manifest?.productionWrites !== 0
  )
    throw new Error('Fourth batch reviewed manifest owner time override mismatch');
}
export function assertFourthBatchReviewedResult(
  candidate: ReviewCandidate,
  approved: Record<string, any>,
  changedFields: string[],
) {
  if (
    !approved ||
    approved.status !== 'ready' ||
    approved.slug !== candidate.slug ||
    approved.outcome !== candidate.outcome ||
    approved.expectedDetailSha256 !== candidate.expectedDetailSha256 ||
    approved.nextReviewDate !== candidate.nextReviewDate ||
    JSON.stringify(approved.changedFields) !== JSON.stringify(changedFields) ||
    JSON.stringify(approved.sources) !== JSON.stringify(candidate.sources) ||
    JSON.stringify(approved.unresolved) !== JSON.stringify(candidate.unresolved)
  )
    throw new Error(`${candidate.slug}: reviewed manifest candidate mismatch`);
}
const source = 'docs/FRESHNESS_BACKLOG_AFTER_BATCH3_2026-10-08.json';
const sha256 = 'c1a80678e7103e8ac0a335e93024c461991ad6c59181de12632d98a6336c519f';
const pass = (slug: string, reviewedAt: string, due: string) => ({
  id: `editorial-${reviewedAt}:${slug}`,
  source,
  sha256,
  reviewedAt,
  validThrough: new Date(Date.parse(`${reviewedAt}T00:00:00Z`) + 90 * 86400000).toISOString().slice(0, 10),
  claimDueAt: due,
  scope: 'entity_baseline_only' as const,
});

const githubOld = {
  en: 'Pricing checked 2026-09-06: Free includes 2,000 completions per month and limited chat/agent usage. Pro is $10 per user/month and Pro+ is $39 per user/month. GitHub now meters chat, agents, code review, CLI, Spaces and Spark with AI Credits; code completion and next-edit suggestions remain unlimited on paid plans. Included credits and model multipliers can change, so confirm the live plan before purchase.',
  zh: '2026-09-06 核验：Free 每月包含 2,000 次补全和有限聊天/智能体用量；Pro 为每用户每月 $10，Pro+ 为 $39。聊天、智能体、代码审查、CLI、Spaces 和 Spark 使用 AI Credits；付费版代码补全和 next-edit suggestions 仍为不限量。credits 与模型倍率可能变化，购买时应复核实时套餐。',
};
const githubNew = {
  en: 'Pricing checked 2026-10-08: Free includes 2,000 completions per month and limited chat/agent usage. The public individual plans list Pro at $10/month, Pro+ at $39/month, and the new Max tier at $100/month. GitHub AI Credits meter chat, agents, code review, CLI and Copilot Apps; code completion and next-edit suggestions remain unlimited on paid plans. Included credits and model costs vary, so verify the selected account and current billing before purchase.',
  zh: '2026-10-08 核验：Free 每月包含 2,000 次补全和有限聊天/智能体用量。公开个人套餐列出 Pro 每月 $10、Pro+ 每月 $39，以及新增 Max 每月 $100。聊天、智能体、代码审查、CLI 和 Copilot Apps 使用 GitHub AI Credits；付费版代码补全和 next-edit suggestions 仍为不限量。包含额度与模型消耗可能变化，购买前须核对目标账号和当前账单。',
};

const FOURTH_BATCH: ReviewCandidate[] = [
  {
    slug: 'codex',
    id: '35b7a4ae-1200-41f2-94c5-d5ba4dc98704',
    expectedUrl: 'https://chatgpt.com/codex',
    passSnapshot: pass('codex', '2026-09-06', '2026-09-20'),
    expectedDetailSha256: '7b54b288a8cbb04b467fd9eb76de77ec7770f9052b51998c3f216f689b323377',
    outcome: 'reviewed_no_change',
    checkedAt: '2026-10-08',
    nextReviewDate: '2026-10-22',
    scope: 'Public Codex surfaces, usage and account-bound plan access; no signed-in usage meter or repository trial.',
    changeSummary:
      'The existing bounded availability, usage and review claims remain aligned with official Codex documentation.',
    sources: [
      'https://learn.chatgpt.com/docs/pricing',
      'https://learn.chatgpt.com/docs/cloud',
      'https://learn.chatgpt.com/docs/agent-approvals-security',
    ],
    unresolved: ['Plan, region, model, workspace policy and remaining usage require target-account verification.'],
    claims: [
      {
        id: 'plan-and-usage-access',
        status: 'conditional',
        category: 'account_rights',
        nextReviewDate: '2026-10-22',
        limitation: 'Check the signed-in plan, model availability, usage dashboard and workspace controls.',
      },
    ],
  },
  {
    slug: 'dune',
    id: 'dd8cb6a3-ef78-4747-9075-ebf663290410',
    expectedUrl: 'https://dune.com/',
    passSnapshot: pass('dune', '2026-09-06', '2026-09-20'),
    expectedDetailSha256: '566ee59c8f323469bf60dd924eab833ba6810c00b7b799c5b58aa0cb6b33b6db',
    outcome: 'reviewed_no_change',
    checkedAt: '2026-10-08',
    nextReviewDate: '2026-10-22',
    scope:
      'Public Data Hub versus Datashare, freshness ranges and compute-credit boundaries; no live query or invoice.',
    changeSummary:
      'Official product comparison still distinguishes Data Hub compute credits and Datashare subscription, with differing data refresh ranges.',
    sources: ['https://docs.dune.com/docs/product-comparison', 'https://docs.dune.com/web-app/overview'],
    unresolved: [
      'Actual query freshness, credit burn and Datashare terms depend on the target deployment and account.',
    ],
    claims: [
      {
        id: 'deployment-freshness-and-cost',
        status: 'conditional',
        category: 'account_rights',
        nextReviewDate: '2026-10-22',
        limitation: 'Run a representative query and inspect the target account usage and subscription.',
      },
    ],
  },
  {
    slug: 'github-copilot',
    id: '8f09dc60-e77b-41e8-b2e0-9cefbc228d0d',
    expectedUrl: 'https://github.com/features/copilot',
    passSnapshot: pass('github-copilot', '2026-09-06', '2026-09-20'),
    expectedDetailSha256: '3ae421a49539d60ab886cff9526081dbdc8a325fa6d1d57d8b172c9f7de81d89',
    outcome: 'fact_updated',
    checkedAt: '2026-10-08',
    nextReviewDate: '2026-10-22',
    scope:
      'Public individual plan tiers and GitHub AI Credit boundaries; organization policy, regional checkout and actual usage excluded.',
    changeSummary:
      'Add the new Max $100/month individual tier and refresh the plan and AI Credit paragraph; existing Free, Pro and Pro+ amounts remain aligned.',
    sources: [
      'https://github.com/features/copilot/plans',
      'https://docs.github.com/en/copilot/concepts/context/content-exclusion',
    ],
    unresolved: [
      'Regional checkout, organization policy, model-specific credit consumption and remaining balance require account verification.',
    ],
    claims: [
      {
        id: 'plan-and-credit-entitlement',
        status: 'conditional',
        category: 'account_rights',
        nextReviewDate: '2026-10-22',
        limitation: 'Confirm target plan, regional price, enabled models, budget and usage meter.',
      },
    ],
    replacements: (['en', 'zh', 'cn'] as const).map((locale) => ({
      field: 'detail' as const,
      locale,
      from: githubOld[locale === 'en' ? 'en' : 'zh'],
      to: githubNew[locale === 'en' ? 'en' : 'zh'],
    })),
  },
  {
    slug: 'runway',
    id: 'f39ef025-c2b4-4392-be38-95a377931b5e',
    expectedUrl: 'https://runway.com/',
    passSnapshot: pass('runway', '2026-09-01', '2026-09-05'),
    expectedDetailSha256: '94c6022df2fc301036381dd17e44b9d308795a9754e5b0a1ff0bb73e45b1cdba',
    outcome: 'reviewed_no_change',
    checkedAt: '2026-10-08',
    nextReviewDate: '2026-10-22',
    scope:
      'Public Creative credits, rollover, Gen-4.5 consumption and legacy Unlimited transition; no generated output or account bill.',
    changeSummary:
      'Official pricing and help retain the published 125/625/2,250/9,500 credit amounts, 12-credit Gen-4.5 second and November legacy transition.',
    sources: [
      'https://runway.com/pricing',
      'https://help.runwayml.com/hc/en-us/articles/15124877443219-How-do-credits-work',
      'https://help.runwayml.com/hc/en-us/articles/21664961171475-Which-plan-is-right-for-me',
    ],
    unresolved: [
      'Model access, output costs, legacy migration and Creative/API balances require target-workspace verification.',
    ],
    claims: [
      {
        id: 'workspace-credit-and-legacy-access',
        status: 'conditional',
        category: 'account_rights',
        nextReviewDate: '2026-10-22',
        limitation: 'Check workspace plan, balance, selected model and any legacy transition notice.',
      },
    ],
  },
  {
    slug: 'luma-ai',
    id: '711df152-fdcf-4a19-930c-ab866b67605f',
    expectedUrl: 'https://lumalabs.ai/',
    passSnapshot: pass('luma-ai', '2026-09-25', '2026-09-06'),
    expectedDetailSha256: '522bee5a5b382639988d580b9342ea90b3b9fce4c71afb576f7e12f475002e85',
    outcome: 'reviewed_no_change',
    checkedAt: '2026-10-08',
    nextReviewDate: '2026-10-22',
    scope:
      'Schedule synchronization and public App plan/API billing Claims only; no model or account-level entitlement test.',
    changeSummary:
      'The September 25 source-backed review remains consistent with official Plus/Pro/Ultra App plans and separate usage-based API credits; overdue schedule is synchronized.',
    sources: ['https://lumalabs.ai/llm-info', 'https://lumalabs.ai/api'],
    unresolved: [
      'Selected App plan rights, API model price, region and account credits require signed-in verification.',
    ],
    claims: [
      {
        id: 'app-api-entitlement',
        status: 'conditional',
        category: 'account_rights',
        nextReviewDate: '2026-10-22',
        limitation: 'Check target App subscription and API account separately.',
      },
    ],
  },
];

export default FOURTH_BATCH;
