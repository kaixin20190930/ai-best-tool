import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  isFactChangeTimelineEvent,
  mapIntelligenceTimelineRow,
  prepareTimelineEventInsert,
} from '@/lib/services/intelligence/changeTimeline';

const factChange = mapIntelligenceTimelineRow({
  id: 'event-change',
  profile_id: 'profile-example',
  source_change_id: 'change-example',
  event_type: 'fact_changed',
  review_scope: 'fact',
  claim_type: 'pricing_plan',
  claim_key: 'pricing_plan:pro',
  title: 'Pro price changed',
  summary: 'The official monthly price changed from $19 to $29.',
  old_value: { price: 19 },
  new_value: { price: 29 },
  source_url: 'https://example.com/pricing',
  visibility: 'public',
  occurred_at: '2026-09-01T00:00:00.000Z',
  verified_at: '2026-09-02T00:00:00.000Z',
  metadata: {},
});
assert.equal(isFactChangeTimelineEvent(factChange), true);
assert.equal(factChange.sourceChangeId, 'change-example');

const noChangeReview = mapIntelligenceTimelineRow({
  id: 'event-review',
  profile_id: 'profile-example',
  event_type: 'reviewed_no_change',
  review_scope: 'full',
  title: 'Quarterly review completed',
  summary: 'Pricing, limits, and positioning were reviewed with no confirmed change.',
  visibility: 'public',
  occurred_at: '2026-09-02T00:00:00.000Z',
  verified_at: '2026-09-02T00:05:00.000Z',
  metadata: {},
});
assert.equal(isFactChangeTimelineEvent(noChangeReview), false);
assert.equal(noChangeReview.claimType, null);

const reviewedNoChangeInsert = prepareTimelineEventInsert(
  {
    profileId: 'profile-example',
    profileOwnerType: 'tool',
    eventType: 'reviewed_no_change',
    reviewScope: 'full',
    title: 'Official product review completed',
    summary: 'The verified positioning and product boundary were reviewed with no confirmed change.',
    sourceUrl: 'https://example.com/',
    visibility: 'public',
    occurredAt: '2026-09-02T00:00:00.000Z',
  },
  'reviewer-example',
);
assert.equal(reviewedNoChangeInsert.claim_type, null);
assert.equal(reviewedNoChangeInsert.metadata.entryMethod, 'admin_editorial_review');

const verifiedClaim = {
  id: 'claim-example',
  profileId: 'profile-example',
  claimType: 'pricing_plan' as const,
  claimKey: 'pricing_plan:pro',
  verificationStatus: 'verified' as const,
  conflictStatus: 'none' as const,
  sourceUrl: 'https://example.com/pricing',
};
const factChangeInsert = prepareTimelineEventInsert(
  {
    profileId: 'profile-example',
    profileOwnerType: 'tool',
    eventType: 'fact_changed',
    reviewScope: 'fact',
    claim: verifiedClaim,
    title: 'Pro monthly price changed',
    summary: 'The official pricing page now lists the Pro monthly plan at $29 instead of $19.',
    oldValue: '{"price":"$19"}',
    newValue: '{"price":"$29"}',
    visibility: 'public',
    occurredAt: '2026-09-02T00:00:00.000Z',
  },
  'reviewer-example',
);
assert.deepEqual(factChangeInsert.old_value, { price: '$19' });
assert.equal(factChangeInsert.source_url, 'https://example.com/pricing');

assert.throws(
  () =>
    prepareTimelineEventInsert(
      {
        profileId: 'profile-example',
        profileOwnerType: 'site',
        eventType: 'reviewed_no_change',
        reviewScope: 'full',
        title: 'Platform review completed',
        summary: 'The platform facts were reviewed with no confirmed change.',
        sourceUrl: 'https://example.com/',
        visibility: 'public',
        occurredAt: '2026-09-02T00:00:00.000Z',
      },
      'reviewer-example',
    ),
  /Only directory tool profiles/,
);
assert.throws(
  () =>
    prepareTimelineEventInsert(
      {
        profileId: 'profile-example',
        profileOwnerType: 'tool',
        eventType: 'fact_changed',
        reviewScope: 'fact',
        claim: { ...verifiedClaim, verificationStatus: 'candidate' },
        title: 'Unverified price change',
        summary: 'A machine candidate attempted to enter the confirmed timeline.',
        visibility: 'internal',
        occurredAt: '2026-09-02T00:00:00.000Z',
      },
      'reviewer-example',
    ),
  /Only verified, conflict-free claims/,
);

const migration = readFileSync(
  resolve(process.cwd(), 'db/supabase/migrations/20260902_product_intelligence_timeline.sql'),
  'utf8',
);
[
  'product_intelligence_timeline_events',
  "'fact_added', 'fact_changed', 'fact_removed', 'reviewed_no_change'",
  'intelligence_timeline_fact_fields_check',
  'intelligence_timeline_public_source_check',
  'ENABLE ROW LEVEL SECURITY',
].forEach((fragment) => {
  assert.equal(migration.includes(fragment), true, `timeline migration is missing ${fragment}`);
});

const migrationVerifier = readFileSync(
  resolve(process.cwd(), 'scripts/verify-intelligence-timeline-migration.ts'),
  'utf8',
);
assert.equal(migrationVerifier.includes("count: 'exact', head: true"), true);

const baselineSeeder = readFileSync(resolve(process.cwd(), 'scripts/seed-intelligence-timeline-baseline.ts'), 'utf8');
assert.equal(baselineSeeder.includes("reviewScope: 'fact'"), true);
assert.equal(baselineSeeder.includes("claim.claim_type === 'product_name'"), true);
assert.equal(baselineSeeder.includes('editor-reviewed, conflict-free claim'), true);
assert.equal(baselineSeeder.includes('--repair-existing'), true);
assert.equal(baselineSeeder.includes("reviewScope: 'full'"), false);

const publicReader = readFileSync(
  resolve(process.cwd(), 'lib/services/intelligence/publicChangeTimeline.ts'),
  'utf8',
);
assert.equal(publicReader.includes(".eq('visibility', 'public')"), true);
assert.equal(publicReader.includes(".eq('owner_type', 'tool')"), true);

const toolDetailPage = readFileSync(
  resolve(process.cwd(), 'app/[locale]/(with-footer)/ai/[websiteName]/page.tsx'),
  'utf8',
);
assert.equal(toolDetailPage.includes('getPublicToolChangeTimeline(toolId)'), true);
assert.equal(toolDetailPage.includes('publicChangeTimeline.length > 0'), true);

const publicPanel = readFileSync(
  resolve(process.cwd(), 'components/intelligence/ChangeTimelinePanel.tsx'),
  'utf8',
);
assert.equal(publicPanel.includes('data-change-timeline'), true);
assert.equal(publicPanel.includes('Machine-detected candidates never enter automatically'), true);

console.log('Intelligence Change Timeline checks passed.');
