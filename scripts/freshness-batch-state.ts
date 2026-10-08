import type { ReviewCandidate } from './freshness-first-batch';
import { verifyFreshnessPassSnapshot } from './verify-freshness-pass-snapshot';

export type FreshnessMode = 'preflight' | 'rollback' | 'commit';
export type FreshnessResultStatus = 'already_applied' | 'ready' | 'rolled_back' | 'committed';

export function inspectFreshnessState(candidate: ReviewCandidate, row: Record<string, any>, asOf: string) {
  const alreadyApplied = row.features?.maintenanceReview?.checkedAt === candidate.checkedAt;
  const passSnapshot = verifyFreshnessPassSnapshot(candidate, row, asOf, alreadyApplied ? 'after' : 'before');
  return { alreadyApplied, passSnapshot };
}

export function freshnessResultStatus(mode: FreshnessMode, alreadyApplied: boolean): FreshnessResultStatus {
  if (alreadyApplied) return 'already_applied';
  if (mode === 'commit') return 'committed';
  return mode === 'rollback' ? 'rolled_back' : 'ready';
}

export function freshnessProductionWrites(mode: FreshnessMode, results: { status: FreshnessResultStatus }[]) {
  return mode === 'commit' ? results.filter((row) => row.status === 'committed').length : 0;
}
