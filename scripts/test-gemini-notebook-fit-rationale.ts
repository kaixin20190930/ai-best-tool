import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  GEMINI_NOTEBOOK_APPROVED_FIT_RATIONALE,
  fitConditionalUpdateSucceeded,
  GEMINI_NOTEBOOK_FIT_RATIONALE_GATE as gate,
  validateGeminiNotebookFitRationaleSnapshot,
  type GeminiNotebookFitRationaleSnapshot,
} from '../lib/services/admin/geminiNotebookFitRationale';

const now = Date.parse('2026-10-05T00:00:00.000Z');
const future = '2027-01-03T00:00:00.000Z';
const past = '2026-10-01T00:00:00.000Z';
const capabilities = gate.capabilityIds.map((id) => ({
  id,
  tool_id: gate.toolId,
  status: 'reviewed',
  reviewed_by: 'reviewer-id',
  reviewed_at: past,
  review_due_at: future,
}));
const sources = Array.from({ length: 7 }, (_, index) => ({
  id: `source-${index + 1}`,
  profile_id: gate.profileId,
  source_type: 'official',
  fetch_status: 'success',
  last_verified_at: past,
  url: `https://official.example/${index + 1}`,
}));
const claims = gate.claimIds.map((id, index) => ({
  id,
  profile_id: gate.profileId,
  source_id: sources[index % sources.length].id,
  source_type: 'official',
  source_url: sources[index % sources.length].url,
  verification_status: 'verified',
  conflict_status: 'none',
  invalidated_at: null,
  verified_by: 'reviewer-id',
  verified_at: past,
  review_due_at: future,
  expires_at: null,
}));
const rowFor = (entry: string, fields: string[]) => {
  const values = entry.split('|');
  return Object.fromEntries(fields.map((field, index) => [field, values[index]]));
};
const makeSnapshot = (): GeminiNotebookFitRationaleSnapshot => ({
  fit: {
    id: gate.fitId,
    task_id: gate.taskId,
    tool_id: gate.toolId,
    status: 'draft',
    updated_at: past,
  },
  fitsForTool: [{ id: gate.fitId }],
  profile: {
    id: gate.profileId,
    owner_type: 'tool',
    owner_id: gate.toolId,
    profile_status: 'ready',
    next_review_at: future,
  },
  decisions: [{
    tool_id: gate.toolId,
    editorial_status: 'reviewed',
    reviewed_by: 'reviewer-id',
    reviewed_at: past,
    review_due_at: future,
  }],
  capabilities,
  claims,
  sources,
  decisionLinks: gate.decisionLinks.map((item) => rowFor(item, ['claim_id', 'purpose'])),
  capabilityLinks: gate.capabilityLinks.map((item) =>
    rowFor(item, ['tool_capability_id', 'claim_id', 'purpose']),
  ),
  fitLinks: gate.fitLinks.map((item) => rowFor(item, ['claim_id', 'purpose'])),
});

assert.equal(validateGeminiNotebookFitRationaleSnapshot(makeSnapshot(), now), null, 'valid draft gate passes');

const idempotentReviewed = makeSnapshot();
idempotentReviewed.fit = {
  ...idempotentReviewed.fit,
  status: 'reviewed',
  rationale: GEMINI_NOTEBOOK_APPROVED_FIT_RATIONALE,
};
assert.equal(validateGeminiNotebookFitRationaleSnapshot(idempotentReviewed, now), null, 'approved reviewed replay passes');

const wrongIdentity = makeSnapshot();
wrongIdentity.fit = { ...wrongIdentity.fit, tool_id: 'other-tool' };
assert.match(validateGeminiNotebookFitRationaleSnapshot(wrongIdentity, now) || '', /identity or status drifted/);

const missingClaim = makeSnapshot();
missingClaim.claims = missingClaim.claims.slice(1);
assert.match(validateGeminiNotebookFitRationaleSnapshot(missingClaim, now) || '', /ten current official.*verified/);

for (const [key, expected, label] of [
  ['decisionLinks', gate.decisionLinks, '5 decision links'],
  ['capabilityLinks', gate.capabilityLinks, '10 capability links'],
  ['fitLinks', gate.fitLinks, '6 fit links'],
] as const) {
  const wrongLinks = makeSnapshot();
  wrongLinks[key] = wrongLinks[key].slice(1) as never;
  assert.match(
    validateGeminiNotebookFitRationaleSnapshot(wrongLinks, now) || '',
    /exact 5\/10\/6 package/,
    `${label} rejects missing relationship`,
  );
}

const staleDecision = makeSnapshot();
staleDecision.decisions[0] = { ...staleDecision.decisions[0], review_due_at: past };
assert.match(validateGeminiNotebookFitRationaleSnapshot(staleDecision, now) || '', /Decision must have a current reviewed/);

const staleCapability = makeSnapshot();
staleCapability.capabilities[0] = { ...staleCapability.capabilities[0], status: 'draft' };
assert.match(validateGeminiNotebookFitRationaleSnapshot(staleCapability, now) || '', /Both Gemini Notebook Tool Capabilities/);

const unexpectedStatus = makeSnapshot();
unexpectedStatus.fit = { ...unexpectedStatus.fit, status: 'published' };
assert.match(validateGeminiNotebookFitRationaleSnapshot(unexpectedStatus, now) || '', /identity or status drifted/);

const unexpectedReviewedState = makeSnapshot();
unexpectedReviewedState.fit = {
  ...unexpectedReviewedState.fit,
  status: 'reviewed',
  rationale: { en: 'old rationale', cn: '旧理由' },
};
assert.match(
  validateGeminiNotebookFitRationaleSnapshot(unexpectedReviewedState, now) || '',
  /identity or status drifted/,
  'reviewed Fit with a different rationale is not an idempotent target state',
);

assert.equal(fitConditionalUpdateSucceeded({ id: gate.fitId }), true);
assert.equal(fitConditionalUpdateSucceeded(null), false, 'optimistic update miss rejects concurrent drift');

const action = readFileSync('app/actions/admin/evidenceReview.ts', 'utf8');
const controls = readFileSync('components/admin/EvidenceReviewControls.tsx', 'utf8');
const queue = readFileSync('app/[locale]/(admin)/admin/intelligence/review/page.tsx', 'utf8');
assert.match(action, /export async function applyGeminiNotebookFitRationale\(\): Promise<Result>/);
assert.match(action, /await requireAdmin\(\)/);
assert.match(action, /\.eq\('updated_at', fit\.updated_at\)/);
assert.match(action, /\.in\('status', \['draft', 'reviewed'\]\)/);
assert.match(action, /reviewed_at: reviewedAt\.toISOString\(\)/);
assert.match(action, /review_due_at: reviewDueAt\.toISOString\(\)/);
assert.match(action, /reviewed_by: reviewer\.id/);
assert.match(action, /last_edited_by: reviewer\.id/);
const mutation = action.match(/\.update\(\{([\s\S]*?)\}\)\s*\.eq\('id', GEMINI_NOTEBOOK_FIT\.id\)/)?.[1];
assert.ok(mutation, 'Fit action must use a narrowly scoped conditional update.');
for (const preservedField of ['fit_level', 'required_conditions', 'disqualifiers']) {
  assert.ok(!mutation.includes(`${preservedField}:`), `${preservedField} must remain untouched.`);
}
assert.match(controls, /export function GeminiNotebookFitRationaleButton\(\)/);
assert.match(controls, /pending \? 'Updating Fit rationale…'/);
assert.match(controls, /role='status'/);
assert.match(queue, /<GeminiNotebookFitRationaleButton \/>/);

console.log('Gemini Notebook Fit rationale guarded update and rejection cases: PASS');
