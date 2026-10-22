import { isDeepStrictEqual } from 'node:util';

/* eslint-disable no-restricted-syntax, no-continue -- Evidence merging relies on ordered mutation. */

type JsonRecord = Record<string, any>;
const decisionLocales = ['en', 'cn', 'zh', 'tw'] as const;

function record(value: unknown): JsonRecord {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as JsonRecord) : {};
}

function validateDecisionPatch(value: unknown): JsonRecord {
  const decision = record(value);
  const fields = ['compareAxes', 'limitations'];
  if (Object.keys(decision).length !== fields.length || fields.some((field) => !(field in decision)))
    throw new Error('Decision evidence patch must contain exactly compareAxes and limitations');
  for (const field of fields) {
    const localized = record(decision[field]);
    if (
      Object.keys(localized).length !== decisionLocales.length ||
      decisionLocales.some((locale) => !Object.prototype.hasOwnProperty.call(localized, locale))
    )
      throw new Error(`Decision ${field} must contain exactly en, cn, zh and tw locales`);
    for (const locale of decisionLocales) {
      const entries = localized[locale];
      if (
        !Array.isArray(entries) ||
        entries.length === 0 ||
        entries.some((entry) => typeof entry !== 'string' || entry.trim().length === 0)
      )
        throw new Error(`Decision ${field}.${locale} must be a non-empty array of non-empty strings`);
    }
  }
  return decision;
}

export function normalizeEvidenceUrl(value: string): string {
  const url = new URL(value);
  url.hostname = url.hostname.toLowerCase().replace(/^www\./, '');
  url.hash = '';
  for (const key of Array.from(url.searchParams.keys())) {
    if (/^(utm_|fbclid$|gclid$)/i.test(key)) url.searchParams.delete(key);
  }
  url.searchParams.sort();
  url.pathname = url.pathname.replace(/\/$/, '') || '/';
  return url.toString();
}

export function mergeIndexEvidence(existingValue: unknown, patchValue: unknown): JsonRecord {
  const existing = record(existingValue);
  const patch = record(patchValue);
  const merged = { ...existing };
  for (const [key, value] of Object.entries(patch)) {
    if (key === 'evidence') {
      const oldEvidence = record(existing.evidence);
      const newEvidence = record(value);
      const evidence = { ...oldEvidence, ...newEvidence };
      for (const kind of ['official', 'independent']) {
        const seen = new Set<string>();
        const retained: unknown[] = [];
        const oldItems = Array.isArray(oldEvidence[kind]) ? oldEvidence[kind] : [];
        const newItems = Array.isArray(newEvidence[kind]) ? newEvidence[kind] : [];
        for (const entry of oldItems) {
          if (typeof entry?.url !== 'string') {
            retained.push(entry);
            continue;
          }
          let normalized: string;
          try {
            normalized = normalizeEvidenceUrl(entry.url);
          } catch {
            retained.push(entry);
            continue;
          }
          if (!seen.has(normalized)) {
            seen.add(normalized);
            retained.push(entry);
          }
        }
        for (const entry of newItems) {
          if (typeof entry?.url !== 'string') throw new Error(`New ${kind} evidence requires a URL`);
          const normalized = normalizeEvidenceUrl(entry.url);
          if (!seen.has(normalized)) {
            seen.add(normalized);
            retained.push(entry);
          }
        }
        evidence[kind] = retained;
      }
      merged.evidence = evidence;
    } else if (key === 'decision') {
      const decision = validateDecisionPatch(value);
      merged.decision = { ...record(existing.decision), ...decision };
    } else {
      merged[key] = { ...record(existing[key]), ...record(value) };
    }
  }
  return merged;
}

export function indexEvidencePostimageMatches(actual: unknown, expected: unknown): boolean {
  return isDeepStrictEqual(actual, expected);
}

const validDate = (value: unknown, asOf: string) =>
  typeof value === 'string' &&
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  Number.isFinite(Date.parse(`${value}T00:00:00Z`)) &&
  value <= asOf;

const decisionIntentTypes = new Set([
  'api',
  'pricing',
  'vs',
  'alternatives',
  'review',
  'best_for',
  'integrations',
  'commercial_use',
]);
const independentSignalTypes = new Set([
  'independent_benchmark',
  'editorial_buyer_coverage',
  'public_adoption_market_signal',
]);

function evidenceDomain(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || !url.hostname || url.username || url.password) return null;
    const labels = url.hostname
      .toLowerCase()
      .replace(/^www\./, '')
      .split('.');
    if (labels.length < 2) return null;
    const suffixLength =
      labels.length >= 3 && ['co.uk', 'org.uk', 'com.au', 'co.jp'].includes(labels.slice(-2).join('.')) ? 3 : 2;
    return labels.slice(-suffixLength).join('.');
  } catch {
    return null;
  }
}

export function hasVerifiedFastTrackEligibility(value: unknown, asOf: string): boolean {
  const eligibility = record(value);
  if (
    eligibility.status !== 'PASS' ||
    !validDate(eligibility.checkedAt, asOf) ||
    typeof eligibility.nonDuplication !== 'string' ||
    eligibility.nonDuplication.length < 30
  )
    return false;
  const age = (Date.parse(`${asOf}T00:00:00Z`) - Date.parse(`${eligibility.checkedAt}T00:00:00Z`)) / 86400000;
  if (age > 14) return false;
  if (eligibility.basis === 'measured_search_demand') {
    const signal = record(eligibility.searchDemand);
    return (
      ['external_search_volume', 'gsc_page_impressions'].includes(signal.type) &&
      Number.isFinite(signal.value) &&
      signal.value > 0 &&
      typeof signal.url === 'string' &&
      signal.url.startsWith('https://') &&
      validDate(signal.checkedAt, asOf)
    );
  }
  if (eligibility.basis !== 'brand_decision_signals') return false;
  const brand = record(eligibility.brand);
  const intents = Array.isArray(eligibility.decisionIntents) ? eligibility.decisionIntents : [];
  const signals = Array.isArray(eligibility.independentSignals) ? eligibility.independentSignals : [];
  const brandDomain = typeof brand.url === 'string' ? evidenceDomain(brand.url) : null;
  if (
    brand.established !== true ||
    !brandDomain ||
    !validDate(brand.checkedAt, asOf) ||
    intents.length < 2 ||
    intents.some((intent) => !decisionIntentTypes.has(intent)) ||
    new Set(intents).size < 2 ||
    signals.length < 2
  )
    return false;
  const domains = new Set<string>();
  const signalsValid = signals.every((item) => {
    const signal = record(item);
    if (
      !independentSignalTypes.has(signal.type) ||
      typeof signal.url !== 'string' ||
      !validDate(signal.checkedAt, asOf) ||
      typeof signal.scope !== 'string' ||
      signal.scope.length < 20 ||
      typeof signal.nonDuplication !== 'string' ||
      signal.nonDuplication.length < 20
    )
      return false;
    const domain = evidenceDomain(signal.url);
    if (!domain || domain === brandDomain || domains.has(domain)) return false;
    domains.add(domain);
    return true;
  });
  return signalsValid && domains.size >= 2;
}

export function selectIndexReleaseTrack(
  marketValidation: unknown,
  asOf: string,
): {
  releaseTrack: 'standard' | 'mature_high_demand';
  observationComplete: boolean;
} {
  const market = record(marketValidation);
  return {
    releaseTrack: hasVerifiedFastTrackEligibility(market.fastTrackEligibility, asOf)
      ? 'mature_high_demand'
      : 'standard',
    observationComplete: market.observationComplete === true,
  };
}

export function validateDuplicateIntentSnapshot(
  value: unknown,
  expectedScope: { nameQuery: string; officialUrl: string; taskMode: string },
  actual: { toolIds: string[]; candidateIds: string[]; taskFitToolIds: string[] },
  asOf: string,
): boolean {
  const check = record(value);
  const scope = record(check.checkedScope);
  if (
    check.status !== 'PASS' ||
    !validDate(check.checkedAt, asOf) ||
    (Date.parse(`${asOf}T00:00:00Z`) - Date.parse(`${check.checkedAt}T00:00:00Z`)) / 86400000 > 14 ||
    scope.nameQuery !== expectedScope.nameQuery ||
    scope.officialUrl !== expectedScope.officialUrl ||
    scope.taskMode !== expectedScope.taskMode ||
    !Number.isInteger(check.productionMatchCount) ||
    !Array.isArray(check.checkedToolIds)
  )
    return false;
  const exactMatches = Array.from(new Set([...actual.toolIds, ...actual.candidateIds]));
  const relatedFits = Array.from(new Set(actual.taskFitToolIds)).sort();
  const auditedFits = check.relatedTaskFitToolIds;
  if (
    auditedFits !== undefined &&
    (!Array.isArray(auditedFits) || !isDeepStrictEqual([...auditedFits].sort(), relatedFits))
  )
    return false;
  if (relatedFits.length > 0 && auditedFits === undefined) return false;
  return (
    check.productionMatchCount === exactMatches.length && exactMatches.length === 0 && check.checkedToolIds.length === 0
  );
}
