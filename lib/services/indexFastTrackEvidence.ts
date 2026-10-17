import { isDeepStrictEqual } from 'node:util';

type JsonRecord = Record<string, any>;

function record(value: unknown): JsonRecord {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as JsonRecord : {};
}

export function normalizeEvidenceUrl(value: string): string {
  const url = new URL(value);
  url.hostname = url.hostname.toLowerCase().replace(/^www\./, '');
  url.hash = '';
  for (const key of [...url.searchParams.keys()]) {
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
          if (typeof entry?.url !== 'string') { retained.push(entry); continue; }
          let normalized: string;
          try { normalized = normalizeEvidenceUrl(entry.url); }
          catch { retained.push(entry); continue; }
          if (!seen.has(normalized)) { seen.add(normalized); retained.push(entry); }
        }
        for (const entry of newItems) {
          if (typeof entry?.url !== 'string') throw new Error(`New ${kind} evidence requires a URL`);
          const normalized = normalizeEvidenceUrl(entry.url);
          if (!seen.has(normalized)) { seen.add(normalized); retained.push(entry); }
        }
        evidence[kind] = retained;
      }
      merged.evidence = evidence;
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
  typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  Number.isFinite(Date.parse(`${value}T00:00:00Z`)) && value <= asOf;

export function hasVerifiedFastTrackEligibility(value: unknown, asOf: string): boolean {
  const eligibility = record(value);
  if (eligibility.status !== 'PASS' || !validDate(eligibility.checkedAt, asOf) ||
      typeof eligibility.nonDuplication !== 'string' || eligibility.nonDuplication.length < 30) return false;
  const age = (Date.parse(`${asOf}T00:00:00Z`) - Date.parse(`${eligibility.checkedAt}T00:00:00Z`)) / 86400000;
  if (age > 14) return false;
  if (eligibility.basis === 'measured_search_demand') {
    const signal = record(eligibility.searchDemand);
    return ['external_search_volume', 'gsc_page_impressions'].includes(signal.type) &&
      Number.isFinite(signal.value) && signal.value > 0 &&
      typeof signal.url === 'string' && signal.url.startsWith('https://') &&
      validDate(signal.checkedAt, asOf);
  }
  if (eligibility.basis !== 'brand_decision_signals') return false;
  const brand = record(eligibility.brand);
  const intents = Array.isArray(eligibility.decisionIntents) ? eligibility.decisionIntents : [];
  const signals = Array.isArray(eligibility.independentSignals) ? eligibility.independentSignals : [];
  if (brand.established !== true || typeof brand.url !== 'string' || !brand.url.startsWith('https://') ||
      !validDate(brand.checkedAt, asOf) ||
      !intents.includes('api') || !intents.includes('pricing') || signals.length < 2) return false;
  const domains = new Set<string>();
  const kinds = new Set<string>();
  let editorialPublishers = 0;
  for (const item of signals) {
    const signal = record(item);
    if (!['independent_benchmark', 'editorial_buyer_coverage'].includes(signal.type) ||
        typeof signal.url !== 'string' || !validDate(signal.checkedAt, asOf) ||
        typeof signal.scope !== 'string' || signal.scope.length < 20 ||
        typeof signal.nonDuplication !== 'string' || signal.nonDuplication.length < 20) return false;
    try { domains.add(new URL(signal.url).hostname.replace(/^www\./, '').toLowerCase()); }
    catch { return false; }
    if (signal.type === 'editorial_buyer_coverage') {
      if (signal.independentRetest !== false) return false;
      editorialPublishers += 1;
    }
    kinds.add(signal.type);
  }
  return kinds.has('independent_benchmark') && kinds.has('editorial_buyer_coverage') &&
    editorialPublishers >= 2 && domains.size >= 3 &&
    ![...domains].some((domain) => domain === 'x.ai' || domain.endsWith('.x.ai'));
}

export function selectIndexReleaseTrack(marketValidation: unknown, asOf: string): {
  releaseTrack: 'standard' | 'mature_high_demand'; observationComplete: boolean;
} {
  const market = record(marketValidation);
  return {
    releaseTrack: hasVerifiedFastTrackEligibility(market.fastTrackEligibility, asOf)
      ? 'mature_high_demand' : 'standard',
    observationComplete: market.observationComplete === true,
  };
}

export function validateDuplicateIntentSnapshot(
  value: unknown, expectedScope: { nameQuery: string; officialUrl: string; taskMode: string },
  actual: { toolIds: string[]; candidateIds: string[]; taskFitToolIds: string[] }, asOf: string,
): boolean {
  const check = record(value);
  const scope = record(check.checkedScope);
  if (check.status !== 'PASS' || !validDate(check.checkedAt, asOf) ||
      (Date.parse(`${asOf}T00:00:00Z`) - Date.parse(`${check.checkedAt}T00:00:00Z`)) / 86400000 > 14 ||
      scope.nameQuery !== expectedScope.nameQuery ||
      scope.officialUrl !== expectedScope.officialUrl ||
      scope.taskMode !== expectedScope.taskMode ||
      !Number.isInteger(check.productionMatchCount) ||
      !Array.isArray(check.checkedToolIds)) return false;
  const count = actual.toolIds.length + actual.candidateIds.length + actual.taskFitToolIds.length;
  return check.productionMatchCount === count && count === 0 && check.checkedToolIds.length === 0;
}
