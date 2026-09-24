import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const sql = fs.readFileSync(
  path.join(process.cwd(), 'db/supabase/manual/20260925_remediate_meeting_notes_capabilities.sql'),
  'utf8',
);
const registry = fs.readFileSync(path.join(process.cwd(), 'lib/seo/taskPageApproval.ts'), 'utf8');

assert.equal((sql.match(/\bDO \$meeting_notes_remediation\$/g) || []).length, 1, 'one atomic top-level DO block');
assert.match(sql.trimEnd(), /END\s+\$meeting_notes_remediation\$;$/);
assert.doesNotMatch(sql, /^\s*(?:BEGIN|COMMIT|ROLLBACK)\s*;/gm, 'no separate transaction statements');
assert.match(sql, /RAISE EXCEPTION/g, 'any guard failure must abort the DO transaction');
assert.match(sql, /pg_advisory_xact_lock/, 'duplicate manual execution is serialized');

const targetBlock =
  sql.split('INSERT INTO meeting_remediation_targets VALUES')[1]?.split('IF (SELECT count(*)')[0] || '';
const tools = [...targetBlock.matchAll(/^\s*\(\s*\n\s*'([0-9a-f-]{36})',/gm)].map((match) => match[1]);
assert.deepEqual(
  tools,
  [
    '7ae4bbb2-847f-45cc-9294-e96663fa02a3',
    'b8d6a9bd-d9cd-4690-b801-15b1c1fe0a49',
    '57b270b9-78cf-41f8-8b74-dec46400cd65',
  ],
  'only the three named tools are targeted',
);
assert.match(sql, /slug = 'meeting-notes' AND status = 'active'/);
assert.match(sql, /slug = 'meeting-transcription' AND status = 'active'/);
assert.match(sql, /slug = 'meeting-summary-and-actions' AND status = 'active'/);
assert.match(sql, /auth\.users WHERE id = v_reviewer/);
assert.match(sql, /profile\.owner_id = target\.tool_id/);
assert.match(sql, /profile\.canonical_domain = target\.canonical_domain/);
assert.match(sql, /profile\.product_name = target\.product_name AND profile\.profile_status = 'ready'/);
assert.match(sql, /claim\.verification_status = 'verified'/);
assert.match(sql, /claim\.conflict_status = 'none'/);
assert.match(sql, /claim\.review_due_at > v_now/);

for (const url of [
  'https://help.fathom.video/en/articles/5290881',
  'https://fathom.video/pricing',
  'https://help.otter.ai/hc/en-us/articles/360047538094-Conversation-import-and-app-limits-on-the-Basic-free-plan',
  'https://help.otter.ai/hc/en-us/articles/9156381229079-Meeting-Summary-Overview',
  'https://guide.fireflies.ai/articles/4027724828-learn-about-the-fireflies-free-plan',
  'https://fireflies.ai/pricing',
])
  assert.ok(sql.includes(url), `direct official source missing: ${url}`);
assert.match(sql, /"advanced_summaries_per_month":5/);
assert.match(sql, /"monthly_transcription_minutes":300/);
assert.match(sql, /"accessible_minutes_per_conversation_or_import":30/);
assert.match(sql, /"file_imports_per_account":3/);
assert.match(sql, /"recent_conversations_visible":25/);
assert.match(sql, /"unlimited_transcription_requires_auto_join":true/);
assert.doesNotMatch(sql, /"default_meetings_without_auto_join"/);
assert.match(
  sql,
  /"signup_transcription_credits":\{"website":3,"chrome_extension":5,"mobile_new_user":10,"mobile_existing_user":5\}/,
);
assert.match(sql, /"storage_minutes_per_seat":400/);
assert.match(sql, /"ai_credits_per_month":20/);
assert.match(sql, /Uploaded files and meeting summaries consume transcription credits/);

assert.match(sql, /ON CONFLICT \(profile_id, url\) DO UPDATE/);
assert.match(
  sql,
  /WHERE public\.product_intelligence_sources\.metadata->>'manualReviewBatch' IS DISTINCT FROM v_batch/,
);
assert.match(sql, /Official source % differs from the reviewed batch/);
assert.match(sql, /claim\.metadata->>'manualReviewBatch' = v_batch/);
assert.match(sql, /Existing manual claim % differs or is stale/);
assert.match(sql, /WHERE task_id = v_task AND capability_id IN \(v_transcription, v_summary\) AND status = 'reviewed'/);
assert.match(sql, /capability\.status = 'reviewed'/);
assert.match(sql, /fit\.status = 'published' AND fit\.fit_level = target\.fit_level\s+AND fit\.reviewed_by IS NULL/);
assert.match(sql, /reviewed_at = v_now, review_due_at = v_due, reviewed_by = v_reviewer/);
for (const purpose of ['support', 'availability', 'plan', 'limitation']) {
  assert.match(sql, new RegExp(`'capability', '${purpose}'`));
}
assert.match(sql, /Three exact current Tool Capabilities were not published/);
assert.match(sql, /Three legacy fits did not receive this current manual review/);
assert.match(sql, /Expected capability\/fit evidence links or purpose coverage is incomplete/);

const writtenTables = [...sql.matchAll(/\b(?:INSERT INTO|UPDATE|DELETE FROM)\s+(?:public\.)?([a-z_]+)/g)]
  .map((match) => match[1])
  .filter((name) => name !== 'SET');
assert.deepEqual(
  [...new Set(writtenTables)].sort(),
  [
    'meeting_remediation_claims',
    'meeting_remediation_purposes',
    'meeting_remediation_targets',
    'product_intelligence_claims',
    'product_intelligence_sources',
    'task_capabilities',
    'tool_capabilities',
    'tool_capability_claims',
    'tool_task_fit_claims',
    'tool_task_fits',
  ].sort(),
  'the script writes only its temporary data and named relationship/evidence tables',
);

assert.match(registry, /APPROVED_TASK_PAGE_SLUGS: readonly string\[\] = \[\]/);
assert.doesNotMatch(
  sql,
  /APPROVED_TASK_PAGE_SLUGS|continue_index|sitemap|CREATE\s+(?:TABLE|INDEX|POLICY)|ALTER\s+TABLE/i,
);
console.log('Meeting-notes remediation SQL scope and gate test passed.');
