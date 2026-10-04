import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const action = readFileSync('app/actions/admin/evidenceReview.ts', 'utf8');
const controls = readFileSync('components/admin/EvidenceReviewControls.tsx', 'utf8');
const queue = readFileSync('app/[locale]/(admin)/admin/intelligence/review/page.tsx', 'utf8');

assert.match(action, /export async function applyGeminiNotebookFitRationale\(\): Promise<Result>/);
assert.match(action, /await requireAdmin\(\)/);
assert.match(action, /id: 'c7890701-0000-4000-8000-000000000301'/);
assert.match(action, /taskId: '527fe8b7-c171-4c50-ab1f-9404d7536e7c'/);
assert.match(action, /toolId: 'cec78907-e2a1-4eb7-853a-a58334026280'/);
assert.match(
  action,
  /Use Gemini Notebook to synthesize sources the user selects or supplies and imports into a notebook; it can discover some Web or Drive sources for selection, but it is not open-web search\./,
);
assert.match(action, /用于综合用户选择\/提供并导入 notebook 的资料；也可发现部分网页或云端硬盘来源供选择，不等同于开放网页检索。/);
assert.match(action, /fit\.status !== 'reviewed'/);
assert.match(action, /already current; unchanged/);
assert.match(action, /\.eq\('updated_at', fit\.updated_at\)/);
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

console.log('Gemini Notebook Fit rationale admin action contract: PASS');
