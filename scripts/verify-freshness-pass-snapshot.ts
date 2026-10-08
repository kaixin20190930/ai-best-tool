import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import TOOL_MAINTENANCE_REVIEWS from '../lib/config/toolMaintenanceReviews';
import type { ReviewCandidate } from './freshness-first-batch';

const allowedSources = new Set([
  'lib/config/toolMaintenanceReviews.ts',
  'data/collection/synthesia-release.json',
]);

export function verifyFreshnessPassSnapshot(candidate: ReviewCandidate, row: Record<string, any>, asOf: string) {
  const snapshot = candidate.passSnapshot;
  if (!snapshot?.id || !snapshot.source || !snapshot.sha256 || !snapshot.validThrough || !snapshot.reviewedAt || !snapshot.claimDueAt)
    throw new Error(`${candidate.slug}: missing PASS snapshot metadata`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(asOf) || snapshot.reviewedAt > asOf || snapshot.validThrough < asOf)
    throw new Error(`${candidate.slug}: PASS entity baseline expired or invalid`);
  const derivedValidThrough = new Date(Date.parse(`${snapshot.reviewedAt}T00:00:00Z`) + 90 * 86400000).toISOString().slice(0, 10);
  if (snapshot.validThrough !== derivedValidThrough) throw new Error(`${candidate.slug}: PASS validThrough does not match entity cadence`);
  if (snapshot.scope !== 'entity_baseline_only' || snapshot.claimDueAt > asOf)
    throw new Error(`${candidate.slug}: PASS scope or claim-due mismatch`);
  if (!allowedSources.has(snapshot.source)) throw new Error(`${candidate.slug}: unsupported PASS source`);
  const sourceBytes = fs.readFileSync(path.resolve(snapshot.source));
  const digest = crypto.createHash('sha256').update(sourceBytes).digest('hex');
  if (digest !== snapshot.sha256) throw new Error(`${candidate.slug}: PASS source digest mismatch`);
  if (row.id !== candidate.id || row.name !== candidate.slug || row.status !== 'published' || !/^https:\/\//.test(row.url || ''))
    throw new Error(`${candidate.slug}: production entity does not match PASS identity`);
  if (snapshot.source === 'lib/config/toolMaintenanceReviews.ts') {
    const source = TOOL_MAINTENANCE_REVIEWS[candidate.slug as keyof typeof TOOL_MAINTENANCE_REVIEWS];
    if (snapshot.id !== `maintenance-${source?.checkedAt}:${candidate.slug}` || source?.id !== candidate.id ||
        source?.checkedAt !== snapshot.reviewedAt || source?.nextReviewDate !== snapshot.claimDueAt ||
        row.features?.maintenanceReview?.checkedAt !== snapshot.reviewedAt ||
        row.features?.maintenanceReview?.nextReviewDate !== snapshot.claimDueAt)
      throw new Error(`${candidate.slug}: PASS maintenance snapshot mismatch`);
  } else {
    const source = JSON.parse(sourceBytes.toString('utf8'));
    if (snapshot.id !== `release-${source.reviewedAt}:${candidate.slug}` || source.id !== candidate.id ||
        source.slug !== candidate.slug || source.reviewedAt !== snapshot.reviewedAt ||
        source.nextReviewDate !== snapshot.claimDueAt || source.officialUrl !== row.url ||
        row.features?.editorial?.reviewedAt !== snapshot.reviewedAt)
      throw new Error(`${candidate.slug}: PASS release snapshot mismatch`);
  }
  return snapshot;
}
