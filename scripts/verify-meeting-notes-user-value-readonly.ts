// GET-only Supabase reads. Run through pub-03-readonly-run.mjs for an additional transport guard.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { createAdminClient } from '../lib/supabase/admin';

async function main() {
  const sql = readFileSync('db/supabase/manual/20261006_meeting_notes_user_value_candidate.sql', 'utf8');
  const manifest = JSON.parse(sql.split('$payload$')[1]);
  const db = createAdminClient();
  const taskResult = await db
    .from('decision_tasks')
    .select('id,slug,status,constraint_schema')
    .eq('slug', 'meeting-notes')
    .single();
  if (taskResult.error) throw taskResult.error;
  assert.equal(taskResult.data.status, 'active');
  const fitsResult = await db.from('tool_task_fits').select('*').eq('task_id', taskResult.data.id);
  if (fitsResult.error) throw fitsResult.error;
  assert.equal(fitsResult.data.length, 3);
  const linksResult = await db
    .from('tool_task_fit_claims')
    .select('fit_id,claim_id')
    .in(
      'fit_id',
      fitsResult.data.map((f) => f.id),
    );
  if (linksResult.error) throw linksResult.error;
  const claimsResult = await db
    .from('product_intelligence_claims')
    .select('*')
    .in(
      'id',
      manifest.flatMap((entry: any) => entry.claims.map((claim: any) => claim.id)),
    );
  if (claimsResult.error) throw claimsResult.error;
  const profilesResult = await db
    .from('product_intelligence_profiles')
    .select('id,owner_type,owner_id')
    .in(
      'id',
      claimsResult.data.map((c) => c.profile_id),
    );
  if (profilesResult.error) throw profilesResult.error;
  const now = Date.now();
  const stages = [];
  for (const entry of manifest) {
    const fit = fitsResult.data.find((f) => f.id === entry.before.id)!;
    assert.ok(fit);
    for (const key of ['tool_id', 'task_id', 'fit_level', 'status', 'review_due_at'])
      assert.deepEqual(fit[key], entry.before[key]);
    // JSONB key ordering is not significant.
    const equal = (expected: any) => {
      try {
        for (const key of ['rationale', 'required_conditions', 'disqualifiers'])
          assert.deepEqual(fit[key], expected[key]);
        return true;
      } catch {
        return false;
      }
    };
    assert.ok(equal(entry.before) || equal(entry.after), 'Unreviewed content drift');
    const stage = equal(entry.after) ? 'candidate_applied' : 'owner_action_pending';
    if (stage === 'owner_action_pending') assert.equal(fit.updated_at, entry.before.updated_at, 'Snapshot drift');
    assert.ok(Date.parse(fit.reviewed_at) <= now && Date.parse(fit.review_due_at) > now);
    for (const expected of entry.claims) {
      const claim = claimsResult.data.find((c) => c.id === expected.id)!;
      assert.ok(claim);
      for (const [key, value] of Object.entries(expected)) assert.deepEqual(claim[key], value);
      assert.equal(claim.source_type, 'official');
      assert.equal(claim.verification_status, 'verified');
      assert.equal(claim.conflict_status, 'none');
      assert.equal(claim.invalidated_at, null);
      assert.ok(Date.parse(claim.verified_at) <= now && Date.parse(claim.review_due_at) > now);
      assert.ok(!claim.expires_at || Date.parse(claim.expires_at) > now);
      assert.ok(linksResult.data.some((l) => l.fit_id === fit.id && l.claim_id === claim.id));
      assert.ok(
        profilesResult.data.some(
          (p) => p.id === claim.profile_id && p.owner_type === 'tool' && p.owner_id === fit.tool_id,
        ),
      );
    }
    stages.push({ fitId: fit.id, stage });
  }
  console.log(
    JSON.stringify(
      {
        success: true,
        readOnly: true,
        fits: stages,
        currentSameOwnerClaims: claimsResult.data.length,
        constraintSchema: taskResult.data.constraint_schema,
      },
      null,
      2,
    ),
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
