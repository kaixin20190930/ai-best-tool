import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const page = readFileSync(resolve(process.cwd(), 'app/[locale]/(with-footer)/find-tools/page.tsx'), 'utf8');
const component = readFileSync(resolve(process.cwd(), 'components/decision/DecisionFinder.tsx'), 'utf8');
const action = readFileSync(resolve(process.cwd(), 'app/actions/decision.ts'), 'utf8');

assert.equal(page.includes('getNoindexMetadata()'), true, 'Finder must remain noindex,follow');
assert.equal(page.includes("dynamic = 'force-dynamic'"), true, 'task availability must not be frozen at build time');
assert.equal(component.includes("'use client'"), true);
assert.equal(component.includes('window.localStorage'), true, 'anonymous Finder state must stay in the browser');
assert.equal(component.includes('STORAGE_TTL_MS'), true, 'local state needs an explicit retention boundary');
assert.equal(component.includes('constraintSchema.fields'), true, 'each task must control its relevant form fields');
assert.equal(component.includes('budgetPeriod'), true, 'budget must retain its original period');
assert.equal(component.includes('useTransition'), true, 'generation must expose an immediate pending state');
assert.equal(component.includes('Loader2'), true, 'pending state needs a visible progress indicator');
assert.equal(component.includes("role={feedback.tone === 'error' ? 'alert' : 'status'}"), true);
assert.equal(component.includes('No recommendation clears the bar yet'), true, 'honest short-result state is required');
assert.equal(action.includes("'use server'"), true);
assert.equal(action.includes('normalizeConstraints'), true, 'server input must be normalized independently of the UI');
assert.equal(action.includes('constraintSchema.fields'), true, 'server must enforce the task field allowlist');
assert.equal(action.includes('runDecisionRules'), true);
assert.equal(action.includes('.insert('), false, 'anonymous Finder execution must not write database rows');
assert.equal(action.includes('.upsert('), false, 'anonymous Finder execution must not persist inputs');

console.log(
  JSON.stringify(
    {
      success: true,
      noindex: true,
      anonymousStateLocalOnly: true,
      pendingSuccessErrorStates: true,
      noAnonymousDatabaseWrites: true,
    },
    null,
    2,
  ),
);
