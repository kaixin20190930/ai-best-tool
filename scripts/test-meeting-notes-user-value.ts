import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { meetingNotesConstraints, meetingNotesSources } from '../lib/services/decision/meetingNotesPresentation';
import { deriveTaskPageReadModel } from '../lib/services/decision/taskPageReadModel';

const sql = readFileSync('db/supabase/manual/20261006_meeting_notes_user_value_candidate.sql', 'utf8');
const manifest = JSON.parse(sql.split('$payload$')[1]);
const now = new Date('2026-10-06T00:00:00Z');
const reviewed = '2026-09-24T22:57:26.200145+00:00';
const due = '2026-10-24T22:57:26.200145+00:00';
function fixture(after = false, slug = 'meeting-notes') {
  return {
    task: {
      id: manifest[0].before.task_id,
      slug,
      status: 'active',
      name: { en: 'Meeting notes' },
      description: { en: 'Meeting notes' },
      constraint_schema: { export: ['required', 'not_required'] },
    },
    taskCapabilities: [
      {
        task_id: manifest[0].before.task_id,
        capability_id: 'summary',
        importance: 'required',
        status: 'published',
        rationale: { en: 'Review summary' },
        reviewed_at: reviewed,
        review_due_at: due,
      },
    ],
    capabilities: [{ id: 'summary', status: 'active', name: { en: 'Summary' } }],
    fits: manifest.map((entry: any) => ({ ...entry.before, ...(after ? entry.after : {}) })),
    fitClaimLinks: manifest.flatMap((entry: any) =>
      entry.claims.map((c: any) => ({ fit_id: entry.before.id, claim_id: c.id })),
    ),
    claims: manifest.flatMap((entry: any) =>
      entry.claims.map((c: any) => ({ ...c, verification_status: 'verified', conflict_status: 'none' })),
    ),
    profiles: manifest.map((entry: any) => ({
      id: entry.claims[0].profile_id,
      owner_type: 'tool',
      owner_id: entry.before.tool_id,
    })),
    identities: manifest.map((entry: any, index: number) => ({
      id: entry.before.tool_id,
      slug: `tool-${index}`,
      title: `Tool ${index}`,
    })),
  };
}
const before = deriveTaskPageReadModel(fixture(), now)!;
assert.equal(before.tools.length, 3);
assert.ok(
  before.tools.every((t) => t.rationale.cn === t.rationale.zh),
  'legacy zh reasons work in Chinese',
);
assert.ok(
  before.tools.every((t) => t.requiredConditions.length === 0),
  'reproduce legacy string-array mismatch; candidate fixes stored structure',
);
const model = deriveTaskPageReadModel(fixture(true), now)!;
assert.equal(model.tools.length, 3);
assert.equal(new Set(model.tools.map((t) => t.rationale.cn)).size, 3);
assert.ok(model.tools.every((t) => t.requiredConditions.length === 3 && t.disqualifiers.length === 3));
for (const tool of model.tools)
  for (const row of [tool.rationale, ...tool.requiredConditions, ...tool.disqualifiers]) {
    assert.ok(row.en && /[\u4e00-\u9fff]/.test(row.cn), 'real bilingual content');
  }
const duplicate = {
  ...model.tools[0].evidence[0],
  verifiedAt: '2026-09-20T00:00:00+00:00',
  reviewDueAt: '2026-10-20T00:00:00+00:00',
};
const groups = meetingNotesSources([...model.tools[0].evidence, duplicate, duplicate], true);
assert.equal(groups.length, 2);
assert.equal(groups[0].windows.length, 2);
assert.equal(groups[0].windows[1].verifiedAt, duplicate.verifiedAt, 'older verification survives grouping');
assert.equal(groups[0].windows[1].reviewDueAt, duplicate.reviewDueAt);
assert.notEqual(groups[0].label, new URL(groups[0].sourceUrl).hostname, 'source purpose is visible');
assert.equal(meetingNotesConstraints(model, true).length, 4);
assert.equal(
  meetingNotesConstraints({ ...model, tools: [] }, true).length,
  0,
  'no unsupported source-backed constraints',
);
const other = deriveTaskPageReadModel(fixture(false, 'build-app-with-ai'), now)!;
assert.ok(
  other.tools.every((t) => !t.rationale.cn),
  'other cluster locale behavior unchanged',
);
const stale = fixture(true);
stale.claims[0].review_due_at = '2026-09-01T00:00:00Z';
assert.equal(deriveTaskPageReadModel(stale, now)!.tools.flatMap((t) => t.evidence).length, 5);
assert.match(sql, /v_reviewer uuid := NULL/);
assert.match(sql, /to_jsonb\(v_fit\) @>/);
assert.match(sql, /FOR SHARE OF c, p, l/);
assert.match(sql, /p.owner_id = v_fit.tool_id/);
assert.match(sql, /last_edited_by = v_reviewer/);
assert.deepEqual(
  [...sql.matchAll(/UPDATE public\.(\w+) SET/g)].map((m) => m[1]),
  ['tool_task_fits'],
);
assert.doesNotMatch(sql, /INSERT INTO|DELETE FROM|ALTER TABLE|CREATE TABLE|DISABLE TRIGGER/);
assert.doesNotMatch(sql, /review_due_at\s*=/, 'do not extend freshness');
const route = readFileSync('app/[locale]/(with-footer)/tasks/[slug]/page.tsx', 'utf8');
assert.match(route, /model.slug === 'meeting-notes'/);
assert.match(route, /isMeetingNotes && isChinese \? '会议工具选择指南' : 'Task decision guide'/, 'other clusters keep their heading');
assert.match(route, /请再次选择会议纪要任务/);
assert.match(route, /按隐私和导出要求继续筛选/);
assert.match(route, /indexable: false/);
console.log(
  'MTN-UX-01 PASS: bilingual candidate, preserved governance conditions, source purposes/windows, scoped rendering, guarded SQL.',
);
