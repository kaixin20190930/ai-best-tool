/* eslint curly: ["error", "all"] */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (name: string) => readFileSync(`docs/${name}`, 'utf8');
const main = read('MASTER_OPTIMIZATION_TRACKER_CN.md');
const weekly = read('FOUR_WEEK_EVIDENCE_LED_DIRECTORY_PLAN_CN.md');
const planName = 'QUALITY_CLOSEOUT_IMPLEMENTATION_2026-09-04_CN.md';
const expected = [
  'W1-01',
  'W1-02',
  'W1-03',
  'W1-04',
  'W2-01',
  'W2-02',
  'W2-03',
  'W3-01',
  'W3-02',
  'W3-03',
  'W4-01',
  'W4-02',
  'W4-03',
];

function countTasks(document: string) {
  const rows = document.split('\n').filter((line) => /^\| W[1-4]-\d{2} \|/.test(line));
  const cells = rows.map((row) => row.split('|').map((cell) => cell.trim()));
  assert.deepEqual(
    cells.map((row) => row[1]),
    expected,
    'Keep all 13 unique parent tasks; exclude subtasks',
  );
  const counts = { complete: 0, ongoing: 0, data: 0, pending: 0 };
  for (const row of cells) {
    assert.equal(row.length, 8, `Unexpected task table schema: ${row[1]}`);
    const status = row[5];
    if (status.startsWith('已完成')) {
      counts.complete += 1;
    } else if (status === '进行中') {
      counts.ongoing += 1;
    } else if (status === '需要数据') {
      counts.data += 1;
    } else {
      assert.equal(status, '待执行', `Unrecognized status: ${status}`);
      counts.pending += 1;
    }
  }
  return { ...counts, total: rows.length };
}

function assertProgress(document: string, counts: ReturnType<typeof countTasks>) {
  const percent = ((counts.complete / counts.total) * 100).toFixed(1);
  assert(
    document.includes(`${counts.complete}/${counts.total}完成（${percent}%）`),
    'Progress summary must match parent task table',
  );
}

function assertCurrentNavigation(document: string) {
  for (const stale of [
    '列为下一项不依赖 GSC 的修复',
    '下一项独立修复为已发现的工具页登录',
    '新增待修：工具页登录',
    '新发现，待定位修复',
  ]) {
    assert(!document.includes(stale), `Obsolete current navigation status: ${stale}`);
  }
}

const counts = countTasks(weekly);
assertProgress(main, counts);
assertProgress(weekly, counts);
for (const document of [
  main,
  weekly,
  read('MAINTENANCE_AUDIT_2026-09-04_CN.md'),
  read('LEGACY_TOOL_REVIEW_SCHEDULE_AUDIT_2026-09-04_CN.md'),
]) {
  assertCurrentNavigation(document);
  assert(document.includes('373d2336'), 'Navigation closure must retain release evidence');
}
for (const document of [main, weekly]) {
  assert(document.includes(`./${planName}`), 'Closeout work must link back to the existing main plan');
}
const roadmap = read('EVIDENCE_DECISION_PLATFORM_ROADMAP_CN.md');
const mon = roadmap.split('\n').find((line) => line.startsWith('| MON-01')) || '';
const lnk = roadmap.split('\n').find((line) => line.startsWith('| LNK-01')) || '';
assert(mon.includes('技术实现完成') && mon.includes('RC-08'), 'Separate monitoring implementation from real operation');
assert(
  lnk.includes('SEO-IA-06/07') && lnk.includes('尚未验收'),
  'Keep existing link work and unverified scope distinct',
);
assert(read(planName).includes('Review结论'), 'Implementation plan must retain its review record');
assert(
  read('LOCALIZED_NAVIGATION_AUDIT_2026-09-04_CN.md').includes('发布后补记'),
  'Retain actual post-release results',
);

// Negative fixtures: a checker that never rejects drift is not an acceptance gate.
assert.throws(() => countTasks(weekly.replace('| W4-03 |', '| W4-02 |')));
assert.throws(() => countTasks(weekly.replace(/^\| W4-03 \|.*$/m, '')));
assert.throws(() => countTasks(weekly.replace('| 需要数据 |', '| 完成啦 |')));
assert.throws(() => assertProgress('一级任务13/13完成（100.0%）', { ...counts, complete: 9 }));
assert.throws(() => assertCurrentNavigation('新发现，待定位修复'));
console.log(
  JSON.stringify(
    { success: true, scope: 'Known active-plan contracts, not a semantic audit of every historical document', counts },
    null,
    2,
  ),
);
