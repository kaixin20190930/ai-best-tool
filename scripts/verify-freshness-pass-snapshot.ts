import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import TOOL_MAINTENANCE_REVIEWS from '../lib/config/toolMaintenanceReviews';
import type { ReviewCandidate } from './freshness-first-batch';

const allowedSources = new Set([
  'lib/config/toolMaintenanceReviews.ts',
  'data/collection/synthesia-release.json',
  'docs/FRESHNESS_BACKLOG_POSTCOMMIT_2026-10-08.json',
]);

export function verifyFreshnessPassSnapshot(candidate: ReviewCandidate, row: Record<string, any>, asOf: string, phase: 'before' | 'after' = 'before') {
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
  if (candidate.expectedUrl && row.url !== candidate.expectedUrl)
    throw new Error(`${candidate.slug}: production entity URL does not match PASS identity`);
  let originalMaintenance: Record<string, unknown> = {};
  if (snapshot.source === 'lib/config/toolMaintenanceReviews.ts') {
    const source = TOOL_MAINTENANCE_REVIEWS[candidate.slug as keyof typeof TOOL_MAINTENANCE_REVIEWS];
    if (snapshot.id !== `maintenance-${source?.checkedAt}:${candidate.slug}` || source?.id !== candidate.id ||
        source?.checkedAt !== snapshot.reviewedAt || source?.nextReviewDate !== snapshot.claimDueAt)
      throw new Error(`${candidate.slug}: PASS maintenance snapshot mismatch`);
    const { id: _id, ...record } = source;
    originalMaintenance = record;
    if (phase === 'before' && (row.features?.maintenanceReview?.checkedAt !== snapshot.reviewedAt ||
        row.features?.maintenanceReview?.nextReviewDate !== snapshot.claimDueAt ||
        row.next_review_date !== snapshot.claimDueAt))
      throw new Error(`${candidate.slug}: PASS maintenance snapshot mismatch`);
  } else if (snapshot.source === 'docs/FRESHNESS_BACKLOG_POSTCOMMIT_2026-10-08.json') {
    const audit = JSON.parse(sourceBytes.toString('utf8'));
    const item = audit.items?.find((entry: Record<string, unknown>) => entry.slug === candidate.slug);
    if (snapshot.id !== `editorial-${snapshot.reviewedAt}:${candidate.slug}` ||
        item?.id !== candidate.id || item?.classification !== 'claim_due' ||
        item?.basisDates?.editorialReviewedAt !== snapshot.reviewedAt ||
        item?.basisDates?.nextReviewDate !== snapshot.claimDueAt ||
        row.features?.editorial?.reviewedAt !== snapshot.reviewedAt ||
        row.features?.editorial?.sourceUrl !== item?.sourceUrl)
      throw new Error(`${candidate.slug}: PASS editorial snapshot mismatch`);
    if (phase === 'before' && row.next_review_date !== snapshot.claimDueAt)
      throw new Error(`${candidate.slug}: PASS editorial schedule mismatch`);
    if (phase === 'before' && item?.basisDates?.maintenanceCheckedAt &&
        row.features?.maintenanceReview?.checkedAt !== item.basisDates.maintenanceCheckedAt)
      throw new Error(`${candidate.slug}: PASS maintenance date mismatch`);
  } else {
    const source = JSON.parse(sourceBytes.toString('utf8'));
    if (snapshot.id !== `release-${source.reviewedAt}:${candidate.slug}` || source.id !== candidate.id ||
        source.slug !== candidate.slug || source.reviewedAt !== snapshot.reviewedAt ||
        source.nextReviewDate !== snapshot.claimDueAt || source.officialUrl !== row.url ||
        row.features?.editorial?.reviewedAt !== snapshot.reviewedAt)
      throw new Error(`${candidate.slug}: PASS release snapshot mismatch`);
    if (phase === 'before' && row.next_review_date !== snapshot.claimDueAt)
      throw new Error(`${candidate.slug}: PASS release schedule mismatch`);
  }
  if (phase === 'after') {
    const preflightManifestPath = snapshot.source === 'docs/FRESHNESS_BACKLOG_POSTCOMMIT_2026-10-08.json' ?
      'docs/FRESHNESS_SECOND_BATCH_PREFLIGHT_2026-10-08.json' : 'docs/FRESHNESS_FIRST_BATCH_PREFLIGHT_2026-10-08.json';
    const manifest = JSON.parse(fs.readFileSync(path.resolve(preflightManifestPath), 'utf8'));
    const inherited = manifest?.results?.find((entry: Record<string, unknown>) => entry.slug === candidate.slug);
    if (manifest?.mode !== 'preflight' || !inherited || inherited.status !== 'ready' ||
        !/^[0-9a-f]{64}$/.test(inherited.preimageSha256 || '') ||
        JSON.stringify(inherited.passSnapshot) !== JSON.stringify(snapshot))
      throw new Error(`${candidate.slug}: original PASS preflight manifest mismatch`);
    const expectedReview = {
      ...originalMaintenance,
      checkedAt: candidate.checkedAt, nextReviewDate: candidate.nextReviewDate,
      outcome: candidate.outcome, changeSummary: candidate.changeSummary,
      scope: candidate.scope, sources: candidate.sources, unresolved: candidate.unresolved,
      claims: candidate.claims || [],
    };
    try {
      const actualDetailHash = crypto.createHash('sha256').update(JSON.stringify(row.detail)).digest('hex');
      assert.match(candidate.expectedDetailSha256, /^[0-9a-f]{64}$/);
      assert.equal(actualDetailHash, candidate.expectedDetailSha256);
      if (snapshot.source === 'docs/FRESHNESS_BACKLOG_POSTCOMMIT_2026-10-08.json') {
        for (const [key, value] of Object.entries(expectedReview))
          assert.deepEqual(row.features?.maintenanceReview?.[key], value);
      } else assert.deepEqual(row.features?.maintenanceReview, expectedReview);
      assert.equal(row.next_review_date, candidate.nextReviewDate);
      if (candidate.pricingSnapshot) assert.deepEqual(row.features?.pricingSnapshot, candidate.pricingSnapshot);
    } catch {
      throw new Error(`${candidate.slug}: applied maintenance snapshot mismatch`);
    }
  }
  return snapshot;
}
