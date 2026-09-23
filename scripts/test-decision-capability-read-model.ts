import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { derivePublicDecisionCapabilityReadModel } from '@/lib/services/decision/capabilityReadModel';

const now = new Date('2026-09-23T00:00:00.000Z');
const future = '2026-10-23T00:00:00.000Z';
const validToolId = '11111111-1111-4111-8111-111111111111';
const otherToolId = '22222222-2222-4222-8222-222222222222';
const validClaimId = '33333333-3333-4333-8333-333333333333';

const model = derivePublicDecisionCapabilityReadModel(
  {
    capabilities: [
      {
        id: 'cap-video',
        slug: 'video-generation',
        name: { en: 'Video generation' },
        description: { en: 'Create video output.' },
        capability_group: 'creation',
        display_order: 1,
        status: 'active',
      },
      {
        id: 'cap-archived',
        slug: 'hidden',
        name: { en: 'Hidden' },
        description: {},
        capability_group: 'other',
        status: 'archived',
      },
    ],
    tasks: [
      { id: 'task-video', slug: 'product-image-to-video', name: { en: 'Product image to video' }, status: 'active' },
    ],
    toolCapabilities: [
      {
        id: 'tool-cap-valid',
        tool_id: validToolId,
        capability_id: 'cap-video',
        support_level: 'unknown',
        availability: 'unknown',
        plan_requirement: {},
        limitations: [],
        status: 'published',
        reviewed_at: '2026-09-01T00:00:00.000Z',
        review_due_at: future,
      },
      {
        id: 'tool-cap-wrong-owner',
        tool_id: validToolId,
        capability_id: 'cap-video',
        support_level: 'strong',
        availability: 'all_plans',
        plan_requirement: {},
        limitations: [],
        status: 'published',
        reviewed_at: '2026-09-01T00:00:00.000Z',
        review_due_at: future,
      },
    ],
    taskCapabilities: [
      {
        task_id: 'task-video',
        capability_id: 'cap-video',
        importance: 'required',
        rationale: { en: 'Required for the task.' },
        status: 'published',
        reviewed_at: '2026-09-01T00:00:00.000Z',
        review_due_at: future,
      },
    ],
    claimLinks: [
      { tool_capability_id: 'tool-cap-valid', claim_id: validClaimId },
      { tool_capability_id: 'tool-cap-wrong-owner', claim_id: 'claim-wrong-owner' },
    ],
    claims: [
      {
        id: validClaimId,
        profile_id: 'profile-valid',
        source_url: 'https://example.com/pricing',
        verified_at: '2026-09-01T00:00:00.000Z',
        verification_status: 'verified',
        conflict_status: 'none',
        invalidated_at: null,
        expires_at: null,
        review_due_at: future,
        claim_value: { secret: 'must not leave server' },
      },
      {
        id: 'claim-wrong-owner',
        profile_id: 'profile-wrong-owner',
        source_url: 'https://example.com/features',
        verification_status: 'verified',
        conflict_status: 'none',
        invalidated_at: null,
        expires_at: null,
        review_due_at: future,
      },
    ],
    profiles: [
      { id: 'profile-valid', owner_type: 'tool', owner_id: validToolId },
      { id: 'profile-wrong-owner', owner_type: 'tool', owner_id: otherToolId },
    ],
  },
  now,
);

assert.equal(model.capabilities.length, 1, 'only active capabilities are public');
assert.equal(model.toolCapabilities.length, 1, 'wrong-owner evidence cannot support a public Tool Capability');
assert.equal(model.toolCapabilities[0]?.supportLevel, 'unknown', 'unknown remains unknown and is never inferred');
assert.deepEqual(model.toolCapabilities[0]?.evidence, [
  { sourceUrl: 'https://example.com/pricing', verifiedAt: '2026-09-01T00:00:00.000Z', reviewDueAt: future },
]);
assert.equal(model.taskCapabilities.length, 1, 'current published Task Capability is retained');
assert.equal(JSON.stringify(model).includes('claim_value'), false, 'raw claim values are never returned');
assert.equal(JSON.stringify(model).includes(validClaimId), false, 'raw claim IDs are never returned');

const readSource = fs.readFileSync(path.join(process.cwd(), 'lib/services/decision/capabilityReadModel.ts'), 'utf8');
assert.match(readSource, /createAdminClient/);
assert.match(readSource, /verification_status.*verified/);
assert.match(readSource, /profile\.owner_id === toolId/);
assert.doesNotMatch(readSource, /claim_value, source_excerpt/);

console.log(
  JSON.stringify({ success: true, publicRowsFiltered: true, rawClaimsExcluded: true, unknownPreserved: true }, null, 2),
);
