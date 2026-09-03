import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const read = (relativePath: string) => fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
const migration = read('db/supabase/migrations/20260902_stack_audit_trial_foundation.sql');
const sitemap = read('app/sitemap.ts');
const stackPage = read('app/[locale]/(with-footer)/profile/stack/page.tsx');
const trialList = read('app/[locale]/(with-footer)/profile/trials/page.tsx');
const trialDetail = read('app/[locale]/(with-footer)/profile/trials/[id]/page.tsx');
const isolation = read('scripts/verify-stack-privacy-isolation.ts');
const smoke = read('scripts/production-stack-privacy-smoke.ts');
const healthWorkflow = read('.github/workflows/production-health-monitor.yml');

const privateTables = [
  'user_tool_stack_items',
  'user_tool_stack_item_tasks',
  'stack_audit_runs',
  'stack_audit_findings',
  'stack_audit_finding_claims',
  'trial_scorecards',
  'trial_scorecard_checks',
];

for (const table of privateTables) {
  assert.match(migration, new RegExp(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`));
}
assert.match(migration, /Anonymous users receive no policy on any STK table/);
assert.doesNotMatch(migration, /Public can (?:view|manage).*?(?:stack|trial)/i);
assert.doesNotMatch(migration, /Users can (?:create|update|manage) own stack audit findings/i);
assert.match(migration, /stack_audit_item_owner_mismatch/);
assert.match(migration, /trial_decision_session_owner_mismatch/);

for (const page of [stackPage, trialList, trialDetail]) {
  assert.match(page, /getNoindexMetadata\(\)/);
  assert.match(page, /auth\.getUser\(\)/);
}
assert.doesNotMatch(sitemap, /profile\/stack|profile\/trials/);
assert.match(isolation, /crossUserReadBlocked/);
assert.match(isolation, /crossUserUpdateBlocked/);
assert.match(isolation, /crossUserDeleteBlocked/);
assert.match(isolation, /anonymousReadBlocked/);
assert.match(isolation, /deleteUser/);
assert.match(smoke, /profile\/stack/);
assert.match(smoke, /profile\/trials/);
assert.match(smoke, /noindex/i);
assert.match(smoke, /sitemap/i);
assert.match(healthWorkflow, /Check Stack and Trial privacy surface/);
assert.match(healthWorkflow, /Check Stack and Trial privacy surface\s+if: always\(\)/);
assert.match(healthWorkflow, /profile\/\(stack\|trials\)/);
assert.match(healthWorkflow, /CANONICAL_URL="https:\/\/aibesttool\.com\/cn"/);
assert.match(healthWorkflow, /stack-privacy-sitemap\.xml/);
assert.match(
  healthWorkflow,
  /for ROUTE in \/cn \/cn\/explore[\s\S]*?test "\$HTTP_CODE" -lt 400\s+done/,
  'The existing SEO route loop must close before privacy monitoring can run.',
);

console.log(
  JSON.stringify(
    {
      success: true,
      privateTablesChecked: privateTables.length,
      privateRoutesNoindex: 3,
      sitemapExpansion: false,
      auditOutputClientWrites: false,
      liveIsolationVerifierPresent: true,
      productionSmokePresent: true,
    },
    null,
    2,
  ),
);
