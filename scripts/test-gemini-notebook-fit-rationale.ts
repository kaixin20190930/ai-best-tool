import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const action = readFileSync('app/actions/admin/evidenceReview.ts', 'utf8');
const migration = readFileSync('db/supabase/migrations/20261005_admin_gemini_fit_rationale_recovery.sql', 'utf8');
const controls = readFileSync('components/admin/EvidenceReviewControls.tsx', 'utf8');
const queue = readFileSync('app/[locale]/(admin)/admin/intelligence/review/page.tsx', 'utf8');
const fitAction = action.match(
  /export async function applyGeminiNotebookFitRationale\(\): Promise<Result> \{([\s\S]*?)\n\}/,
)?.[1];

assert.ok(fitAction, 'Dedicated Fit rationale action must exist.');
assert.match(fitAction, /await requireAdmin\(\)/);
assert.match(fitAction, /\.rpc\('admin_apply_gemini_notebook_fit_rationale'/);
assert.doesNotMatch(fitAction, /\.from\(/, 'The action must not implement its own preflight reads or writes.');
assert.match(migration, /CREATE OR REPLACE FUNCTION public\.admin_apply_gemini_notebook_fit_rationale/);
assert.match(migration, /SECURITY DEFINER/);
assert.match(migration, /auth\.role\(\) IS DISTINCT FROM 'service_role'/);
assert.match(migration, /FOR UPDATE/);
assert.match(migration, /IN SHARE ROW EXCLUSIVE MODE/);
assert.match(migration, /updated_at = v_fit_row\.updated_at/);
assert.match(migration, /status = 'reviewed'/);
assert.match(migration, /last_edited_by = p_reviewer/);
assert.match(
  migration,
  /Five exact current Google official Gemini sources are required|Seven exact current Google official Gemini sources are required/,
);
assert.match(migration, /Ten exact current verified Gemini official claims are required/);
assert.match(migration, /evidence relationships must exactly match 5\/10\/6/);
assert.match(migration, /status', 'unchanged'/);
for (const preservedField of ['fit_level', 'required_conditions', 'disqualifiers']) {
  const update = migration.match(/UPDATE public\.tool_task_fits SET([\s\S]*?)WHERE id = v_fit/)?.[1] || '';
  assert.ok(!update.includes(`${preservedField} =`), `${preservedField} must remain untouched.`);
}
assert.doesNotMatch(migration, /UPDATE public\.(?:decision_tasks|task_pages|tools|index_reviews)|sitemap|robots/i);
assert.match(controls, /pending \? 'Updating Fit rationale…'/);
assert.match(controls, /Checking reviewed evidence and updating the Fit…/);
assert.match(controls, /aria-busy=\{pending\}/);
assert.match(controls, /role='status' aria-live='polite'/);
assert.match(queue, /<GeminiNotebookFitRationaleButton \/>/);

console.log('Gemini Notebook Fit rationale action, transactional RPC and UI contract: PASS');
