import { loadEnvConfig } from '@next/env';

import { createAdminClient } from '@/lib/supabase/admin';

loadEnvConfig(process.cwd());

const trialId = process.argv.find((argument) => argument.startsWith('--trial-id='))?.split('=')[1];
const commit = process.argv.includes('--commit');

async function main() {
  if (!trialId) throw new Error('Pass --trial-id=<uuid>.');

  const admin = createAdminClient();
  const { data: trial, error: trialError } = await admin
    .from('trial_scorecards')
    .select('id, status, final_decision, started_at, ends_at')
    .eq('id', trialId)
    .maybeSingle();
  if (trialError || !trial) throw new Error(trialError?.message || 'Trial not found.');

  const endsAt = new Date(String(trial.ends_at));
  if (String(trial.status) !== 'completed' || String(trial.final_decision) === 'undecided') {
    throw new Error('Only a completed trial with a final decision can be reopened.');
  }
  if (Number.isNaN(endsAt.getTime()) || endsAt.getTime() <= Date.now()) {
    throw new Error('Only a prematurely completed trial with a future ends_at can be reopened.');
  }

  const { data: checks, error: checksError } = await admin
    .from('trial_scorecard_checks')
    .select('id, sequence, result, actual_value, completed_at')
    .eq('scorecard_id', trialId)
    .order('sequence');
  if (checksError || !checks?.length) throw new Error(checksError?.message || 'Trial checks are unavailable.');

  const before = {
    trialId,
    status: trial.status,
    finalDecision: trial.final_decision,
    startedAt: trial.started_at,
    endsAt: trial.ends_at,
    checkResults: checks.map((check) => ({ sequence: check.sequence, result: check.result })),
  };
  if (!commit) {
    console.log(JSON.stringify({ success: true, mode: 'dry-run', before, next: 'Run again with --commit.' }, null, 2));
    return;
  }

  const { data: updated, error: updateError } = await admin
    .from('trial_scorecards')
    .update({ status: 'active', final_decision: 'undecided' })
    .eq('id', trialId)
    .eq('status', 'completed')
    .gt('ends_at', new Date().toISOString())
    .select('id, status, final_decision, ends_at')
    .maybeSingle();
  if (updateError || !updated) throw new Error(updateError?.message || 'Trial was not reopened.');

  const { data: checksAfter, error: verifyError } = await admin
    .from('trial_scorecard_checks')
    .select('id, sequence, result, actual_value, completed_at')
    .eq('scorecard_id', trialId)
    .order('sequence');
  if (verifyError || checksAfter?.length !== checks.length) {
    throw new Error(verifyError?.message || 'Check preservation verification failed.');
  }

  console.log(
    JSON.stringify(
      {
        success: true,
        mode: 'commit',
        before,
        after: updated,
        checksPreserved: checksAfter.every(
          (check, index) =>
            check.id === checks[index].id &&
            check.result === checks[index].result &&
            JSON.stringify(check.actual_value) === JSON.stringify(checks[index].actual_value) &&
            check.completed_at === checks[index].completed_at,
        ),
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
