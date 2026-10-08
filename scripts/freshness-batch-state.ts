import type { ReviewCandidate } from './freshness-first-batch';
import { applyCandidateDetail } from './freshness-first-batch';
import { applyCandidateFeatures } from './freshness-third-batch';
import { verifyFreshnessPassSnapshot } from './verify-freshness-pass-snapshot';

export type FreshnessMode = 'preflight' | 'rollback' | 'commit';
export type FreshnessResultStatus = 'already_applied' | 'ready' | 'rolled_back' | 'committed';

export function inspectFreshnessState(candidate: ReviewCandidate, row: Record<string, any>, asOf: string) {
  const alreadyApplied = row.features?.maintenanceReview?.checkedAt === candidate.checkedAt;
  const passSnapshot = verifyFreshnessPassSnapshot(candidate, row, asOf, alreadyApplied ? 'after' : 'before');
  return { alreadyApplied, passSnapshot };
}

export function buildFreshnessNext(candidate: ReviewCandidate, before: Record<string, any>, alreadyApplied: boolean) {
  const next = structuredClone(before);
  if (alreadyApplied) return next;
  next.detail = applyCandidateDetail(before.detail, candidate);
  next.features = { ...applyCandidateFeatures(before.features, candidate), maintenanceReview: {
    ...(before.features.maintenanceReview || {}),
    checkedAt: candidate.checkedAt, nextReviewDate: candidate.nextReviewDate,
    outcome: candidate.outcome, changeSummary: candidate.changeSummary,
    scope: candidate.scope, sources: candidate.sources, unresolved: candidate.unresolved,
    claims: candidate.claims || [],
  } };
  if (candidate.pricingSnapshot) next.features.pricingSnapshot = candidate.pricingSnapshot;
  next.next_review_date = candidate.nextReviewDate;
  return next;
}

export function freshnessResultStatus(mode: FreshnessMode, alreadyApplied: boolean): FreshnessResultStatus {
  if (alreadyApplied) return 'already_applied';
  if (mode === 'commit') return 'committed';
  return mode === 'rollback' ? 'rolled_back' : 'ready';
}

export function freshnessProductionWrites(mode: FreshnessMode, results: { status: FreshnessResultStatus }[]) {
  return mode === 'commit' ? results.filter((row) => row.status === 'committed').length : 0;
}
