import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  isFactChangeTimelineEvent,
  mapIntelligenceTimelineRow,
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

const publicReader = readFileSync(
  resolve(process.cwd(), 'lib/services/intelligence/publicChangeTimeline.ts'),
  'utf8',
);
assert.equal(publicReader.includes(".eq('visibility', 'public')"), true);
assert.equal(publicReader.includes(".eq('owner_type', 'tool')"), true);

console.log('Intelligence Change Timeline checks passed.');
