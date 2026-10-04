import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Client } from 'pg';

const candidateSql = readFileSync('db/supabase/manual/20261003_perplexity_stage2_candidate.sql', 'utf8');
const correctionSql = readFileSync('db/supabase/manual/20261003_perplexity_plans_claim_correction.sql', 'utf8');
assert.match(correctionSql, /^SELECT \* FROM pg_temp\.perplexity_plans_claim_correction\('ROLLBACK'\);\s*$/m);
assert.doesNotMatch(correctionSql, /^\s*(?:COMMIT|DELETE)\s+/im);
assert.match(correctionSql, /Latest target HOLD audit does not match the approved reviewer/);
assert.match(correctionSql, /14-day freshness window/);
assert.match(correctionSql, /auth\.users WHERE id=v_expected_reviewer/);
assert.match(
  correctionSql,
  /UPDATE public\.product_intelligence_claims\s+SET claim_value=v_new_value, validity_scope=v_new_scope/,
);
const mutation = correctionSql.match(/UPDATE public\.product_intelligence_claims([\s\S]*?);/)?.[1] || '';
const setClause = mutation.match(/SET([\s\S]*?)WHERE/i)?.[1] || '';
assert.match(setClause, /claim_value=v_new_value, validity_scope=v_new_scope/);
assert.doesNotMatch(
  setClause,
  /\b(?:verification_status|verified_by|verified_at|source_excerpt|review_due_at|metadata|source_id|profile_status|editorial_status|status)\s*=/i,
);
assert.match(correctionSql, /3 Pro Searches per day for Free/);

const sourceTest = readFileSync('scripts/test-gemini-notebook-stage2-sql.ts', 'utf8');
const fixture = sourceTest.match(/await db\.query\(`CREATE SCHEMA auth;([\s\S]*?)\n {4}`\);/)?.[1];
assert.ok(fixture, 'Shared Stage 2 test schema fixture missing');
const schema = `CREATE SCHEMA auth;${fixture}`
  .replaceAll(/\$\{reviewer\}/g, 'd7890701-0000-4000-8000-000000000001')
  .replaceAll(/\$\{reviewerEmail\}/g, 'reviewer@example.test')
  .replaceAll(/\$\{taskId\}/g, '527fe8b7-c171-4c50-ab1f-9404d7536e7c');
const candidateCommit = candidateSql.replace(
  /perplexity_stage2_candidate\('ROLLBACK'\);\s*$/,
  "perplexity_stage2_candidate('COMMIT');",
);
const toolId = '3d018623-85f9-4df4-bd55-9a4a0e7a2d93';
const profileId = 'd0186230-0000-4000-8000-000000000001';
const targetId = 'd0186230-0000-4000-8000-000000000404';
const reviewerId = 'd7890701-0000-4000-8000-000000000001';
const reviewerEmail = 'reviewer@example.test';
const wrongReviewerId = 'd7890701-0000-4000-8000-000000000002';
const wrongReviewerEmail = 'notadmin@example.test';

function withReviewer(id: string, email: string) {
  const approval = `APPROVE_PERPLEXITY_PLANS_CORRECTION:${id}:${email}:USER_METADATA_ROLE`;
  return correctionSql
    .replace(
      "SET perplexity.plans_correction.reviewer_id = '00000000-0000-0000-0000-000000000000';",
      `SET perplexity.plans_correction.reviewer_id = '${id}';`,
    )
    .replace(
      "SET perplexity.plans_correction.reviewer_email = 'REPLACE_WITH_EXACT_REVIEWER_EMAIL';",
      `SET perplexity.plans_correction.reviewer_email = '${email}';`,
    )
    .replace(
      "SET perplexity.plans_correction.owner_approval = 'REPLACE_WITH_EXACT_OWNER_APPROVAL';",
      `SET perplexity.plans_correction.owner_approval = '${approval}';`,
    );
}

async function main() {
  const dir = mkdtempSync(join(tmpdir(), 'perplexity-plans-correction-pg-'));
  const port = 54000 + Math.floor(Math.random() * 9000);
  const db = new Client({ host: dir, port, user: 'postgres', database: 'postgres' });
  let started = false;
  try {
    execFileSync('initdb', ['-A', 'trust', '-U', 'postgres', '-D', dir], { stdio: 'ignore' });
    execFileSync('pg_ctl', ['-D', dir, '-o', `-F -p ${port} -k ${dir}`, '-w', 'start'], { stdio: 'ignore' });
    started = true;
    await db.connect();
    await db.query(schema);
    await db.query(candidateCommit);
    await db.query(`CREATE TABLE admin_evidence_review_audit(
      id bigserial PRIMARY KEY,profile_id uuid,claim_id uuid,action text,reviewer_id uuid,review_due_at timestamptz,note text,created_at timestamptz DEFAULT now());
      ALTER TABLE admin_evidence_review_audit ENABLE ROW LEVEL SECURITY;
      INSERT INTO admin_evidence_review_audit(profile_id,claim_id,action,reviewer_id,note)
        VALUES('${profileId}','${targetId}','hold','d7890701-0000-4000-8000-000000000001','Official plan page now lists 3/day; candidate correction required.');
      UPDATE product_intelligence_claims SET
        validity_scope='{"scope":"Web/app subscription","requires":"editorial rewrite and target-account recheck","currentOfficialTable":"3/day"}',
        source_excerpt='Pro Searches | 3/day',
        verification_note='Current official comparison states Free Pro Searches are 3/day; rewrite the stale unknown/conflict premise before PASS.'
        WHERE id='${targetId}';
      UPDATE product_intelligence_claims SET verification_status='verified',verified_by='d7890701-0000-4000-8000-000000000001',
        verified_at=now(),review_due_at=now()+interval '30 days',source_excerpt='Officially reviewed excerpt',verification_note='Verified against official source.'
        WHERE profile_id='${profileId}' AND id<>'${targetId}';
      INSERT INTO auth.users VALUES ('${wrongReviewerId}','${wrongReviewerEmail}','{"role":"user"}','{}');`);
    const initialTarget = (
      await db.query(`SELECT claim_value,validity_scope FROM product_intelligence_claims WHERE id='${targetId}'`)
    ).rows[0];
    assert.match(
      initialTarget.claim_value.summary,
      /remains unknown because official pages conflict/,
      'Candidate fixture should be stale preimage',
    );
    const result = (value: any) => (Array.isArray(value) ? value.at(-1) : value).rows[0];
    const counts = async () =>
      (
        await db.query(`SELECT
      (SELECT count(*) FROM product_intelligence_claims WHERE profile_id='${profileId}' AND verification_status='verified')::int AS verified,
      (SELECT count(*) FROM tool_decision_profile_claims WHERE tool_id='${toolId}')::int +
      (SELECT count(*) FROM tool_capability_claims l JOIN tool_capabilities c ON c.id=l.tool_capability_id WHERE c.tool_id='${toolId}')::int +
      (SELECT count(*) FROM tool_task_fit_claims l JOIN tool_task_fits f ON f.id=l.fit_id WHERE f.tool_id='${toolId}')::int AS links`)
      ).rows[0];
    const protectedState = async () =>
      (
        await db.query(`SELECT
      (SELECT to_jsonb(p) FROM product_intelligence_profiles p WHERE id='${profileId}') AS profile,
      (SELECT coalesce(jsonb_agg(to_jsonb(c) ORDER BY c.id),'[]') FROM product_intelligence_claims c WHERE profile_id='${profileId}' AND id<>'${targetId}') AS other_claims,
      (SELECT to_jsonb(d) FROM tool_decision_profiles d WHERE tool_id='${toolId}') AS decision,
      (SELECT coalesce(jsonb_agg(to_jsonb(c) ORDER BY c.id),'[]') FROM tool_capabilities c WHERE tool_id='${toolId}') AS capabilities,
      (SELECT to_jsonb(f) FROM tool_task_fits f WHERE tool_id='${toolId}') AS fit`)
      ).rows[0];
    const before = await protectedState();
    const validCorrection = withReviewer(reviewerId, reviewerEmail);
    await assert.rejects(
      db.query(withReviewer('00000000-0000-0000-0000-000000000000', 'REPLACE_WITH_EXACT_REVIEWER_EMAIL')),
      /Exact expected reviewer identity and Owner approval required/,
      'Missing reviewer identity must fail closed',
    );
    await assert.rejects(
      db.query(withReviewer(wrongReviewerId, wrongReviewerEmail)),
      /Reviewer UUID\/email mismatch or app admin basis missing/,
      'Non-admin reviewer must fail closed',
    );
    await db.query(
      `UPDATE admin_evidence_review_audit SET reviewer_id='${wrongReviewerId}' WHERE claim_id='${targetId}'`,
    );
    await assert.rejects(
      db.query(validCorrection),
      /Latest target HOLD audit does not match the approved reviewer/,
      'HOLD audit from a different reviewer must fail closed',
    );
    await db.query(
      `UPDATE admin_evidence_review_audit SET reviewer_id='${reviewerId}',created_at=now()-interval '15 days' WHERE claim_id='${targetId}'`,
    );
    await assert.rejects(db.query(validCorrection), /14-day freshness window/, 'Expired HOLD audit must fail closed');
    await db.query(`UPDATE admin_evidence_review_audit SET created_at=now() WHERE claim_id='${targetId}'`);
    const preflight = result(await db.query(validCorrection));
    assert.deepEqual(
      [
        preflight.mode,
        preflight.preflight,
        preflight.corrected_claims,
        preflight.verified_claims,
        preflight.decision,
        preflight.capabilities,
        preflight.fit,
        preflight.links,
      ],
      ['preflight', true, 1, 6, 1, 2, 1, 0],
    );
    assert.equal(preflight.reviewer_id, reviewerId);
    assert.ok(Date.parse(preflight.hold_audit_at) > Date.now() - 14 * 24 * 60 * 60 * 1000);
    assert.deepEqual(await protectedState(), before, 'Default rollback changed protected state');
    assert.deepEqual(await counts(), { verified: 6, links: 0 });
    const committed = result(
      await db.query(
        validCorrection.replace(
          /perplexity_plans_claim_correction\('ROLLBACK'\);\s*$/,
          "perplexity_plans_claim_correction('COMMIT');",
        ),
      ),
    );
    assert.equal(committed.mode, 'committed');
    assert.equal(committed.pre_md5, preflight.pre_md5, 'Correction preimage hash changed between preview and commit');
    assert.notEqual(
      committed.post_md5,
      committed.pre_md5,
      'Correction postimage hash should reflect the candidate edit',
    );
    assert.deepEqual(
      await protectedState(),
      before,
      'Correction changed claims or graph objects outside target fields',
    );
    const target = (
      await db.query(`SELECT claim_value,validity_scope,verification_status,verified_by,source_excerpt
      FROM product_intelligence_claims WHERE id='${targetId}'`)
    ).rows[0];
    assert.deepEqual(target.claim_value, {
      summary:
        'The current official plan comparison lists 3 Pro Searches per day for Free; Pro, Max and Enterprise have differentiated access.',
    });
    assert.deepEqual(target.validity_scope, {
      scope: 'Web/app subscription',
      freePlanProSearchQuota: '3/day per current official plan comparison',
      requires: 'recheck target account at review',
    });
    assert.equal(target.verification_status, 'candidate');
    assert.equal(target.verified_by, null);
    assert.equal(target.source_excerpt, 'Pro Searches | 3/day');
    assert.deepEqual(await counts(), { verified: 6, links: 0 });
    const committedCorrection = validCorrection.replace(
      /perplexity_plans_claim_correction\('ROLLBACK'\);\s*$/,
      "perplexity_plans_claim_correction('COMMIT');",
    );
    await assert.rejects(
      db.query(committedCorrection),
      /exact stale candidate\/HOLD preimage/,
      'Correction replay must fail closed once preimage changed',
    );
    await db.query(
      `UPDATE product_intelligence_claims SET claim_value='${JSON.stringify({ summary: 'stale drift' })}' WHERE id='${targetId}'`,
    );
    await assert.rejects(db.query(committedCorrection), /exact stale candidate\/HOLD preimage/);
    console.log(
      'Perplexity plans correction: reviewer authorization/match, 14-day HOLD freshness, rollback, one-claim update, six verified claims, protected graph, zero links, and drift rejection PASS',
    );
  } finally {
    await db.end().catch(() => undefined);
    if (started) execFileSync('pg_ctl', ['-D', dir, '-m', 'immediate', '-w', 'stop'], { stdio: 'ignore' });
    rmSync(dir, { recursive: true, force: true });
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
