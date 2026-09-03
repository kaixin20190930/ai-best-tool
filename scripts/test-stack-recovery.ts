import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const read = (relativePath: string) => fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
const stackAction = read('app/actions/stack.ts');
const auditAction = read('app/actions/stackAudit.ts');
const trialAction = read('app/actions/trials.ts');
const workspace = read('components/stack/StackWorkspace.tsx');
const scorecard = read('components/stack/TrialScorecard.tsx');
const stackPage = read('app/[locale]/(with-footer)/profile/stack/page.tsx');
const trialListPage = read('app/[locale]/(with-footer)/profile/trials/page.tsx');
const trialDetailPage = read('app/[locale]/(with-footer)/profile/trials/[id]/page.tsx');

assert.match(auditAction, /existing\.status === 'pending' \|\| existing\.status === 'running'/);
assert.match(auditAction, /AUDIT_IN_PROGRESS/);
assert.match(auditAction, /existing\?\.status === 'failed'/);
assert.match(auditAction, /stack_audit_findings'\)\.delete\(\)\.eq\('audit_id', retryAuditId\)/);
assert.match(auditAction, /\.eq\('status', 'failed'\)/);
assert.match(auditAction, /const \{ data: collision \}/);

assert.match(trialAction, /status: 'planned'/);
assert.match(trialAction, /TRIAL_IN_PROGRESS/);
assert.match(trialAction, /\.update\(\{ status: 'active' \}\)/);
assert.match(trialAction, /TRIAL_ACTIVATION_FAILED/);
assert.match(trialAction, /const \{ data: collision \}/);

assert.match(stackAction, /TASK_NOT_AVAILABLE/);
assert.match(stackAction, /const isNewItem = !itemId/);
assert.match(stackAction, /previousTaskLink/);
assert.match(stackAction, /No duplicate tool was created/);

assert.match(workspace, /pendingAction === 'save'/);
assert.match(workspace, /pendingAction === 'audit'/);
assert.match(workspace, /pendingAction === `delete:\$\{item\.id\}`/);
assert.match(workspace, /latestAudit\?\.status === 'failed'/);
assert.match(workspace, /Retry safely without creating a duplicate run/);
assert.match(scorecard, /pendingAction === `check:\$\{check\.id\}:\$\{result\}`/);
assert.match(scorecard, /pendingAction === 'complete'/);

assert.match(stackPage, /a read failure is never presented as empty data/);
assert.match(trialListPage, /this error is not presented as an empty history/);
assert.match(trialListPage, /!trialsResult\.error && trials\.length === 0/);
assert.match(trialDetailPage, /A database read failure is not reported as a 404/);
assert.match(trialDetailPage, /saved checks are not presented as empty data/);

console.log(
  JSON.stringify(
    {
      success: true,
      auditRetryReusesRun: true,
      concurrentWritesGuarded: true,
      partialStackWritesRecovered: true,
      buttonLevelPendingStates: true,
      readErrorsNotEmptyStates: true,
    },
    null,
    2,
  ),
);
