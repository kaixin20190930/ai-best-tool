import type { ReviewCandidate } from './freshness-first-batch';

export const THIRD_BATCH_PUBLISH_NOT_BEFORE = '2026-10-09';
export const THIRD_BATCH_OWNER_TIME_OVERRIDE = Object.freeze({
  batch: 'third',
  originalPublishNotBefore: THIRD_BATCH_PUBLISH_NOT_BEFORE,
  ownerAuthorizedOn: '2026-10-08',
  effectiveReleaseDate: '2026-10-08',
  reason: 'Owner authorized sequential execution without calendar delay',
});
export function thirdBatchReleaseAllowed(asOfShanghai: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(asOfShanghai) &&
    asOfShanghai >= THIRD_BATCH_OWNER_TIME_OVERRIDE.effectiveReleaseDate;
}
export function assertThirdBatchReleaseManifest(manifest: Record<string, any>) {
  if (manifest?.publishNotBefore !== THIRD_BATCH_PUBLISH_NOT_BEFORE ||
      JSON.stringify(manifest?.ownerTimeOverride) !== JSON.stringify(THIRD_BATCH_OWNER_TIME_OVERRIDE))
    throw new Error('Third batch reviewed manifest owner time override mismatch');
}
const source = 'docs/FRESHNESS_BACKLOG_AFTER_BATCH2_2026-10-08.json';
const sha256 = '8c8f4bf6780adc2d11c6eef4d40e25df66c6bded0f4fc74a6b8bc69d6a994557';
const pass = (slug: string, due: string, iso = false) => ({
  id: `editorial-2026-09-01:${slug}`, source, sha256,
  reviewedAt: iso ? '2026-09-01T00:00:00.000Z' : '2026-09-01',
  validThrough: '2026-11-30', claimDueAt: due, scope: 'entity_baseline_only' as const,
});
const fathomPatches = (['en', 'zh', 'cn'] as const).flatMap(locale => locale === 'en' ? [
  { field: 'detail' as const, locale, from: 'Chromebooks, Linux, mobile devices, webinars, breakout rooms, and calls without a standard meeting link are not supported in the standard workflow.', to: 'The standard desktop workflow does not support Chromebooks, Linux, webinars, breakout rooms, or calls without a standard meeting link. The Fathom iOS app can record in-person conversations; verify its availability and consent setup in the target account.' },
  { field: 'detail' as const, locale, from: 'native in-person capture, Linux or mobile support', to: 'desktop support for Linux or mobile online-meeting capture' },
] : [
  { field: 'detail' as const, locale, from: '标准流程不支持 Chromebook、Linux、移动设备、Webinar、分组讨论室和没有标准会议链接的通话。', to: '标准桌面会议流程不支持 Chromebook、Linux、Webinar、分组讨论室和没有标准会议链接的通话。Fathom iOS 应用现可录制线下对话；实际可用性与同意设置仍须在目标账号核对。' },
  { field: 'detail' as const, locale, from: '原生线下录音、Linux 或移动端支持', to: 'Linux 桌面支持或移动端线上会议采集' },
]);

const THIRD_BATCH: ReviewCandidate[] = [
  {
    slug: 'claude', id: '149cf3e0-5f5c-4bdf-ac02-80ec5064fb92', expectedUrl: 'https://claude.ai/',
    passSnapshot: pass('claude', '2026-10-01'), expectedDetailSha256: '009f93b55abbc345e2f2f44693950e5f82a6d40dc7b99943360519a7bfb9d70b',
    outcome: 'fact_updated', checkedAt: '2026-10-08', nextReviewDate: '2026-10-22',
    scope: 'Public individual plan prices, variable usage and new Max/Team API-credit entitlement; linked Console, signed-in meters and checkout excluded.',
    changeSummary: 'Correct blanket no-API-in-subscription claim: Max and Team now offer monthly API credits after linking an eligible Console organization; API billing remains separate beyond credits.',
    sources: ['https://claude.com/pricing', 'https://support.claude.com/en/articles/17154008-monthly-api-credits-for-max-and-team-plans', 'https://support.claude.com/en/articles/9876003-i-have-a-paid-claude-subscription-pro-max-team-or-enterprise-plans-why-is-claude-api-usage-billed-separately-from-my-paid-claude-plan'],
    unresolved: ['Regional checkout, Max/Team eligibility, linked Console organization, credit balance and account capacity require signed-in verification.'],
    claims: [{ id: 'max-team-api-credits', status: 'conditional', category: 'account_rights', nextReviewDate: '2026-10-22', limitation: 'Confirm eligible plan, tenure, Console role, linked organization and credit balance.' }],
    replacements: (['en', 'zh', 'cn'] as const).map(locale => ({ field: 'detail' as const, locale,
      from: locale === 'en' ? 'A Claude subscription does not include Anthropic API usage; API billing is configured separately.' : 'Claude 订阅不包含 Anthropic API 用量，API 需要单独开通和计费。',
      to: locale === 'en' ? 'Pro does not include API credits. Eligible Max and Team subscribers can claim monthly API credits after linking a Claude Console organization; usage beyond those credits is billed separately. Verify eligibility and balance in the target account.' : 'Pro 不包含 API credits。符合资格的 Max 与 Team 订阅者关联 Claude Console 组织后可领取每月 API credits；超出 credits 的用量仍单独计费。应在目标账号核对资格和余额。',
    })),
    featureReplacements: (['en', 'zh', 'cn'] as const).map(locale => ({ path: ['audience', 'notIdealFor', locale, '1'],
      from: locale === 'en' ? 'Buyers who assume a chat subscription includes API usage' : '认为聊天订阅包含 API 用量的购买者',
      to: locale === 'en' ? 'Buyers who assume every chat plan includes API credits without Console setup' : '认为所有聊天套餐无需配置 Console 即包含 API credits 的购买者',
    })),
  },
  {
    slug: 'deepl', id: '344e9732-ef03-4c23-993d-a35a65f4d41b', expectedUrl: 'https://www.deepl.com/',
    passSnapshot: pass('deepl', '2026-10-01'), expectedDetailSha256: '90b3fa8d05e00f801400cd46fd585b5e1a5fad25aeaa4efefd1899185b5557d3',
    outcome: 'reviewed_no_change', checkedAt: '2026-10-08', nextReviewDate: '2026-10-22',
    scope: 'Public Translator, Write and API product/allowance boundaries; selected seat, file and key entitlements excluded.',
    changeSummary: 'No public-fact change to the published 1,500/2,000 Write character and API Developer lifetime allowance boundaries.',
    sources: ['https://support.deepl.com/hc/en-us/articles/6318834492700-About-DeepL-Write', 'https://support.deepl.com/hc/en-us/articles/360021200939-DeepL-API-plans', 'https://support.deepl.com/hc/en-us/articles/360020582359-File-formats'],
    unresolved: ['Selected subscription, file limits, API quota and security settings require account/workflow verification.'],
    claims: [{ id: 'selected-plan-entitlements', status: 'conditional', category: 'account_rights', nextReviewDate: '2026-10-22', limitation: 'Verify plan, file format and API key in the target account.' }],
  },
  {
    slug: 'emdash', id: '6f62a262-3cb3-4201-9127-b1c4eda6438f', expectedUrl: 'https://emdash.com/',
    passSnapshot: pass('emdash', '2026-10-01', true), expectedDetailSha256: 'c59b1bf411cca9f03720f1f620c9c7556c299da0e3772e9dedf441c3749af0ee',
    outcome: 'fact_updated', checkedAt: '2026-10-08', nextReviewDate: '2026-10-22',
    scope: 'Official current release and open-source/agent-provider boundaries only; historical community metrics excluded.',
    changeSummary: 'Replace stale latest-release claim v1.2.2 with official latest v1.2.7; core workflow unchanged.',
    sources: ['https://emdash.com/', 'https://emdash.com/changelog', 'https://github.com/generalaction/emdash/releases'],
    unresolved: ['Provider authentication, billing and compatibility differ by selected agent and account.'],
    claims: [{ id: 'provider-access', status: 'conditional', category: 'account_rights', nextReviewDate: '2026-10-22', limitation: 'Test selected agent provider and account.' }],
    featureReplacements: [
      { path: ['decision', 'freshnessSummary', 'en'], from: 'Official and independent market evidence reviewed 2026-09-01; latest stable release v1.2.2 was published the same day.', to: 'Official release list checked 2026-10-08: latest stable release v1.2.7. The independent market evidence remains dated 2026-09-01.' },
      { path: ['decision', 'freshnessSummary', 'zh'], from: '官方资料与独立市场证据复核于 2026-09-01；最新稳定版 v1.2.2 于同日发布。', to: '官方版本列表核查于 2026-10-08：最新稳定版为 v1.2.7；独立市场证据仍截至 2026-09-01。' },
    ],
  },
  {
    slug: 'fathom', id: '7ae4bbb2-847f-45cc-9294-e96663fa02a3', expectedUrl: 'https://fathom.video/',
    passSnapshot: pass('fathom', '2026-10-01'), expectedDetailSha256: '533f9b6fdd33e641929a02318520b3f7e0665386c2bc8c81dced2d321c6e8022',
    outcome: 'fact_updated', checkedAt: '2026-10-08', nextReviewDate: '2026-10-22',
    scope: 'Public Free/Premium allowances and supported capture devices; target-account rollout and consent configuration excluded.',
    changeSummary: 'Correct stale blanket mobile/in-person exclusion: official device guide now supports iOS in-person recording.',
    sources: ['https://help.fathom.video/en/articles/5290881', 'https://help.fathom.video/en/articles/296576', 'https://help.fathom.video/en/articles/11577345'],
    unresolved: ['iOS access, bot-free rollout, platform compatibility and recording consent require target-account testing.'],
    claims: [{ id: 'ios-and-bot-free-availability', status: 'conditional', category: 'core_capability', nextReviewDate: '2026-10-22', limitation: 'Verify iOS app and Mac bot-free eligibility with a representative meeting.' }],
    replacements: fathomPatches,
    featureReplacements: [
      { path: ['audience', 'notIdealFor', 'en', '0'], from: 'Linux, Chromebook, or mobile-first capture', to: 'Linux or Chromebook desktop capture, or mobile online-meeting capture' },
      { path: ['audience', 'notIdealFor', 'zh', '0'], from: 'Linux、Chromebook 或移动端优先采集', to: 'Linux 或 Chromebook 桌面采集，以及移动端线上会议采集' },
      { path: ['audience', 'notIdealFor', 'cn', '0'], from: 'Linux、Chromebook 或移动端优先采集', to: 'Linux 或 Chromebook 桌面采集，以及移动端线上会议采集' },
    ],
  },
  {
    slug: 'the-graph', id: 'b189f440-f5d7-44ca-9b10-5906c6eedb62', expectedUrl: 'https://thegraph.com/',
    passSnapshot: pass('the-graph', '2026-09-09'), expectedDetailSha256: 'ab4d9ac2d3ef3bb71951ebc983b6a6822a0cc37a9850d3b7e34cb42846ac9510',
    outcome: 'reviewed_no_change', checkedAt: '2026-10-08', nextReviewDate: '2026-10-22',
    scope: 'Public Subgraph Studio query price and product boundaries; deployment-level indexing freshness excluded.',
    changeSummary: 'No public-fact change to 100,000 free monthly queries, $2 per following 100,000, or query/indexing distinction.',
    sources: ['https://thegraph.com/studio-pricing/', 'https://thegraph.com/docs/en/subgraphs/querying/introduction/', 'https://thegraph.com/docs/en/gateways/subgraphs/consumer-side/pricing-payments/'],
    unresolved: ['Specific Subgraph lag, indexer support, key restriction and billing need deployment/account checks.'],
    claims: [{ id: 'deployment-freshness-and-billing', status: 'conditional', category: 'account_rights', nextReviewDate: '2026-10-22', limitation: 'Check target deployment and account before production use.' }],
  },
];

export function applyCandidateFeatures(features: Record<string, any>, candidate: ReviewCandidate) {
  const result = structuredClone(features);
  for (const patch of candidate.featureReplacements || []) {
    if (!patch.path.length || patch.path.some((part) => ['editorial', 'collection', 'marketValidation', 'maintenanceReview'].includes(part)))
      throw new Error(`${candidate.slug}: unsupported feature patch path`);
    const parent = patch.path.slice(0, -1).reduce((value: any, key) => value?.[key], result);
    const key = patch.path.at(-1)!;
    if (parent?.[key] !== patch.from) throw new Error(`${candidate.slug}: missing exact feature preimage ${patch.path.join('.')}`);
    parent[key] = patch.to;
  }
  return result;
}

export default THIRD_BATCH;
