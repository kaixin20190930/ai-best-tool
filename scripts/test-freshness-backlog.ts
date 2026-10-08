import assert from 'node:assert/strict';
import fs from 'node:fs';
import { classifyBacklog, selectBacklogBatch, type BacklogRow } from './freshness-backlog';
import { claimReviewIntervalDays } from './claim-publication-policy';
import { FIRST_BATCH, applyCandidateDetail } from './freshness-first-batch';
import { verifyFreshnessPassSnapshot } from './verify-freshness-pass-snapshot';

const base: BacklogRow = { id: 'a', name: 'claude', status: 'published', page_quality_status: 'continue_index',
  next_review_date: '2026-10-01', updated_at: '2026-10-08', url: 'https://claude.ai',
  features: { editorial: { reviewedAt: '2026-09-01', sourceUrl: 'https://support.claude.com' } } };
assert.equal(classifyBacklog(base, '2026-10-08')?.classification, 'claim_due');
assert.equal(classifyBacklog({ ...base, features: {}, updated_at: '2026-10-08' }, '2026-10-08')?.classification, 'entity_due');
assert.equal(classifyBacklog({ ...base, features: { editorial: { reviewedAt: '2026-10-07', sourceUrl: 'https://example.com' } } }, '2026-10-08')?.classification, 'schedule_sync');
assert.equal(classifyBacklog({ ...base, name: 'woy-ai' }, '2026-10-08')?.classification, 'manual_archive_review');
assert.equal(classifyBacklog({ ...base, status: 'draft' }, '2026-10-08'), null);
const items = Array.from({ length: 9 }, (_, index) => classifyBacklog({ ...base, id: String(index), name: `tool-${index}` }, '2026-10-08')!);
assert.equal(selectBacklogBatch(items).length, 5);
assert.throws(() => selectBacklogBatch(items, 6));
assert.deepEqual(selectBacklogBatch([
  { ...items[0], slug: 'z', priority: 1 }, { ...items[1], slug: 'a', priority: 1 },
], 2).map(item => item.slug), ['a', 'z']);
assert.equal(claimReviewIntervalDays('price', 'routine'), 14);
assert.equal(claimReviewIntervalDays('account_rights', 'first'), 14);
assert.equal(claimReviewIntervalDays('account_rights', 'routine', 2), 30);
assert.equal(claimReviewIntervalDays('privacy_rights', 'routine'), 30);
assert.equal(claimReviewIntervalDays('core_capability', 'routine'), 60);
assert.equal(claimReviewIntervalDays('identity_canonical', 'routine'), 90);
assert.equal(FIRST_BATCH.length, 5);
const consensus = FIRST_BATCH[0];
const detail = { en: '250 API or MCP calls per month; API or MCP calls to 1,000 per month', zh: '250 次 API/MCP 调用; 1,000 次', cn: '250 次 API/MCP 调用; 1,000 次' };
const changed = applyCandidateDetail(detail, consensus);
assert(changed.en.includes('500 API or MCP calls'));
assert(changed.en.includes('2,000 per month'));
assert.equal(detail.en.includes('250 API'), true);
assert.throws(() => applyCandidateDetail({ ...detail, en: 'unexpected' }, consensus), /missing exact preimage/);
const passRow = { id: consensus.id, name: consensus.slug, status: 'published', url: 'https://consensus.app/',
  features: { maintenanceReview: { checkedAt: '2026-09-06', nextReviewDate: '2026-10-06' } } };
assert.equal(verifyFreshnessPassSnapshot(consensus, passRow, '2026-10-08').id, consensus.passSnapshot.id);
assert.throws(() => verifyFreshnessPassSnapshot({ ...consensus, passSnapshot: { ...consensus.passSnapshot, id: '' } }, passRow, '2026-10-08'), /missing PASS/);
assert.throws(() => verifyFreshnessPassSnapshot(consensus, passRow, '2026-12-06'), /expired/);
assert.throws(() => verifyFreshnessPassSnapshot(consensus, { ...passRow, id: 'wrong' }, '2026-10-08'), /does not match PASS identity/);
assert.throws(() => verifyFreshnessPassSnapshot({ ...consensus, passSnapshot: { ...consensus.passSnapshot, sha256: '0'.repeat(64) } }, passRow, '2026-10-08'), /digest mismatch/);
assert.throws(() => verifyFreshnessPassSnapshot({ ...consensus, passSnapshot: { ...consensus.passSnapshot, validThrough: '2027-01-01' } }, passRow, '2026-10-08'), /cadence/);
const synthesia = FIRST_BATCH[4];
assert.equal(verifyFreshnessPassSnapshot(synthesia, { id: synthesia.id, name: synthesia.slug, status: 'published',
  url: 'https://www.synthesia.io/', features: { editorial: { reviewedAt: '2026-09-08' } } }, '2026-10-08').id,
  synthesia.passSnapshot.id);
const runner = fs.readFileSync('scripts/run-freshness-first-batch.ts', 'utf8');
assert(runner.includes("'BEGIN READ ONLY'"));
assert(runner.includes("'ROLLBACK'"));
assert(runner.includes('preimage or PASS snapshot drift'));
assert(runner.includes('alreadyApplied'));
assert(runner.includes('protectedKeys'));
assert(!/UPDATE public\.tools SET[^`]*page_quality_status/s.test(runner));
console.log('PASS freshness classification, cap, cadence, exact patches, preimage, rollback and protected fields');
