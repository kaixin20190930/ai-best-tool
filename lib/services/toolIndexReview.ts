export type IndexReviewDecision =
  | 'approve_continue_index'
  | 'hold_monitor'
  | 'repair_monitor'
  | 'permanent_noindex'
  | 'merge_or_archive';

export type SiteSearchHealth = 'healthy' | 'warning' | 'blocked' | 'unknown';

export interface IndexReviewCheck {
  key: string;
  label: string;
  passed: boolean;
  kind: 'quality' | 'hold';
}

export interface IndexReviewInput {
  published: boolean;
  monitor: boolean;
  qualityScore: number;
  mediaComplete: boolean;
  marketValidated: boolean;
  officialSourceCount: number;
  independentSignalCount: number;
  decisionContentComplete: boolean;
  editorialDatesComplete: boolean;
  canonicalUnique: boolean;
  intentUnique: boolean;
  automatedSeoPassed: boolean;
  observationComplete: boolean;
  gscSnapshotDate: string | null;
  asOfDate: string;
  siteSearchHealth: SiteSearchHealth;
  policyPaused: boolean;
  quotaAvailable: boolean;
  permanentNoindex?: boolean;
  mergeOrArchive?: boolean;
}

export interface IndexReviewResult {
  decision: IndexReviewDecision;
  checks: IndexReviewCheck[];
  blockers: string[];
  gscSnapshotAgeDays: number | null;
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function localizedList(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  const localized = record(value);
  for (const locale of ['en', 'zh', 'cn']) {
    const items = localized[locale];
    if (Array.isArray(items) && items.length > 0) return items;
  }
  return [];
}

export function deriveIndexReviewEvidence(featuresValue: unknown): {
  officialSourceCount: number;
  independentSignalCount: number;
  decisionContentComplete: boolean;
  marketValidated: boolean;
  editorialReviewed: boolean;
} {
  const features = record(featuresValue);
  const evidence = record(features.evidence);
  const market = record(features.marketValidation);
  const audience = record(features.audience);
  const decision = record(features.decision);
  const editorial = record(features.editorial);
  const officialUrls = (Array.isArray(evidence.official) ? evidence.official : [])
    .map((item) => record(item).url)
    .filter((url): url is string => typeof url === 'string' && url.length > 0);
  const independentUrls = (Array.isArray(evidence.independent) ? evidence.independent : [])
    .map((item) => record(item).url)
    .filter((url): url is string => typeof url === 'string' && url.length > 0);
  const marketUrls = Array.isArray(market.evidenceUrls)
    ? market.evidenceUrls.filter((url): url is string => typeof url === 'string' && url.length > 0)
    : [];
  const strongSignals = Array.isArray(market.strongSignals) ? market.strongSignals : [];
  const supportingSignals = Array.isArray(market.supportingSignals) ? market.supportingSignals : [];

  return {
    officialSourceCount: new Set(officialUrls).size,
    independentSignalCount: Math.max(
      new Set([...independentUrls, ...marketUrls]).size,
      strongSignals.length + supportingSignals.length,
    ),
    decisionContentComplete:
      localizedList(audience.bestFit).length > 0 &&
      localizedList(audience.notIdealFor).length > 0 &&
      localizedList(decision.compareAxes).length > 0 &&
      localizedList(decision.limitations).length > 0,
    marketValidated: market.verdict === 'validated',
    editorialReviewed: typeof editorial.reviewedAt === 'string' && editorial.reviewedAt.length > 0,
  };
}

function dateAgeDays(asOfDate: string, snapshotDate: string | null): number | null {
  if (!snapshotDate) return null;
  const age = Math.floor((Date.parse(`${asOfDate}T00:00:00Z`) - Date.parse(`${snapshotDate}T00:00:00Z`)) / 86400000);
  return Number.isFinite(age) && age >= 0 ? age : null;
}

export function evaluateToolIndexReview(input: IndexReviewInput): IndexReviewResult {
  const gscSnapshotAgeDays = dateAgeDays(input.asOfDate, input.gscSnapshotDate);
  const checks: IndexReviewCheck[] = [
    { key: 'published', label: 'Tool is published', passed: input.published, kind: 'quality' },
    { key: 'monitor', label: 'Tool remains in monitor', passed: input.monitor, kind: 'quality' },
    { key: 'quality', label: 'Quality score is at least 80', passed: input.qualityScore >= 80, kind: 'quality' },
    { key: 'media', label: 'Logo and screenshot are complete', passed: input.mediaComplete, kind: 'quality' },
    { key: 'market', label: 'Market validation is complete', passed: input.marketValidated, kind: 'quality' },
    {
      key: 'official_sources',
      label: 'At least two official sources',
      passed: input.officialSourceCount >= 2,
      kind: 'quality',
    },
    {
      key: 'independent_signals',
      label: 'At least two independent durability signals',
      passed: input.independentSignalCount >= 2,
      kind: 'quality',
    },
    {
      key: 'decision_content',
      label: 'Decision content is complete',
      passed: input.decisionContentComplete,
      kind: 'quality',
    },
    {
      key: 'editorial_dates',
      label: 'Review dates are complete',
      passed: input.editorialDatesComplete,
      kind: 'quality',
    },
    { key: 'canonical', label: 'Canonical identity is unique', passed: input.canonicalUnique, kind: 'quality' },
    { key: 'intent', label: 'Search intent is unique', passed: input.intentUnique, kind: 'quality' },
    { key: 'seo', label: 'Automated SEO checks passed', passed: input.automatedSeoPassed, kind: 'quality' },
    {
      key: 'observation',
      label: 'Minimum observation period is complete',
      passed: input.observationComplete,
      kind: 'hold',
    },
    {
      key: 'gsc',
      label: 'Site-level GSC snapshot is no more than 14 days old',
      passed: gscSnapshotAgeDays !== null && gscSnapshotAgeDays <= 14,
      kind: 'hold',
    },
    {
      key: 'site_health',
      label: 'Site-level search health is healthy',
      passed: input.siteSearchHealth === 'healthy',
      kind: 'hold',
    },
    { key: 'policy', label: 'Index release policy is active', passed: !input.policyPaused, kind: 'hold' },
    { key: 'quota', label: 'Daily and weekly quota is available', passed: input.quotaAvailable, kind: 'hold' },
  ];
  const blockers = checks.filter((check) => !check.passed).map((check) => check.label);
  let decision: IndexReviewDecision = 'approve_continue_index';
  if (input.mergeOrArchive) decision = 'merge_or_archive';
  else if (input.permanentNoindex) decision = 'permanent_noindex';
  else if (checks.some((check) => check.kind === 'quality' && !check.passed)) decision = 'repair_monitor';
  else if (blockers.length > 0) decision = 'hold_monitor';

  return { decision, checks, blockers, gscSnapshotAgeDays };
}
