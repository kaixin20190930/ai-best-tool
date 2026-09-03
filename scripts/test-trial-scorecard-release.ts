import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const read = (relativePath: string) => fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
const migration = read('db/supabase/migrations/20260903_trial_scorecard_reminder_state.sql');
const actions = read('app/actions/trials.ts');
const listPage = read('app/[locale]/(with-footer)/profile/trials/page.tsx');
const detailPage = read('app/[locale]/(with-footer)/profile/trials/[id]/page.tsx');
const creator = read('components/stack/TrialCreator.tsx');
const scorecard = read('components/stack/TrialScorecard.tsx');
const route = read('app/api/monitor/trial-reminders/route.ts');
const workflow = read('.github/workflows/trial-reminders.yml');

assert.match(migration, /ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ/);
assert.match(migration, /WHERE reminder_sent_at IS NULL/);
assert.match(actions, /checkLabels\.length < 3 \|\| checkLabels\.length > 5/);
assert.match(actions, /7 \* 24 \* 60 \* 60 \* 1000/);
assert.match(actions, /idempotency_key/);
assert.match(actions, /TRIAL_CHECKS_PENDING/);
assert.match(actions, /\.in\('status', \['planned', 'active'\]\)/);
assert.match(actions, /\.is\('reminder_sent_at', null\)/);
assert.match(actions, /createNotification/);
assert.match(actions, /reminder_sent_at: null/);
assert.doesNotMatch(actions, /sendEmail|resend|email_notifications/i);
assert.match(listPage, /getNoindexMetadata\(\)/);
assert.match(detailPage, /getNoindexMetadata\(\)/);
assert.match(listPage, /\.eq\('user_id', user\.id\)/);
assert.match(detailPage, /\.eq\('user_id', user\.id\)/);
assert.match(creator, /Creating trial/);
assert.match(scorecard, /Saving final decision/);
assert.match(scorecard, /pendingCount > 0/);
assert.match(route, /isMonitorRequestAuthorized/);
assert.match(workflow, /api\/monitor\/trial-reminders/);
assert.match(workflow, /MONITOR_API_TOKEN/);

console.log(
  JSON.stringify(
    {
      success: true,
      checksRequired: '3-5',
      trialDays: 7,
      privateNoindexRoutes: 2,
      completionGuard: true,
      reminderIdempotency: true,
      emailOptInRespected: true,
    },
    null,
    2,
  ),
);
