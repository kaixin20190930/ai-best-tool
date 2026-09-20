import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const fallbackBase = 'bb8c6b57faf69727d8672c92914bc859172c112f';
const scopeAnchor = 'docs/MEASURE_01_DECISION_EVENT_FOUNDATION_CN.md';

function resolveMeasureBase(): string {
  const introduction = execFileSync('git', ['log', '--diff-filter=A', '--reverse', '--format=%H', '--', scopeAnchor], {
    encoding: 'utf8',
  })
    .trim()
    .split('\n')
    .find(Boolean);
  if (!introduction) return fallbackBase;

  try {
    return execFileSync('git', ['rev-parse', `${introduction}^`], { encoding: 'utf8' }).trim();
  } catch {
    return fallbackBase;
  }
}

const base = resolveMeasureBase();
const allowed = new Set([
  'app/actions/decisionMetrics.ts',
  'db/supabase/migrations/20260920_decision_metric_events.sql',
  'docs/MASTER_OPTIMIZATION_TRACKER_CN.md',
  'docs/MEASURE_01_DECISION_EVENT_FOUNDATION_CN.md',
  'docs/PH0_01_PRODUCT_HYPOTHESES_METRICS_AUDIT_CN.md',
  'lib/analytics/decisionEvents/contract.ts',
  'lib/analytics/decisionEvents/flow.ts',
  'lib/analytics/decisionEvents/ingest.ts',
  'lib/analytics/decisionEvents/repository.ts',
  'package.json',
  'scripts/test-decision-event-foundation.ts',
  'scripts/test-measure-01-freeze.ts',
  'scripts/tsconfig.decision-events.json',
]);
const tracked = execFileSync('git', ['diff', '--name-only', base, '--'], { encoding: 'utf8' });
const untracked = execFileSync('git', ['ls-files', '--others', '--exclude-standard'], { encoding: 'utf8' });
const changed = Array.from(new Set(`${tracked}\n${untracked}`.split('\n').filter(Boolean)));
assert.deepEqual(
  changed.filter((file) => !allowed.has(file)),
  [],
  'MEASURE-01 must stay inside the reviewed event foundation, migration, tests, and status documentation.',
);

for (const file of changed) {
  assert(!/\/page\.(?:ts|tsx)$|\/layout\.(?:ts|tsx)$|\/route\.(?:ts|tsx)$/.test(file), `${file}: no URL surface`);
  assert(!/(?:^|\/)(?:robots|sitemap)\.(?:ts|tsx)$/.test(file), `${file}: robots/sitemap frozen`);
  assert(!/metadata|canonical|hreflang|schema/i.test(file), `${file}: SEO contract files frozen`);
}
for (const frozen of ['app/sitemap.ts', 'middleware.ts', 'lib/seo']) {
  const diff = execFileSync('git', ['diff', '--name-only', base, '--', frozen], { encoding: 'utf8' }).trim();
  assert.equal(diff, '', `${frozen} must have zero diff.`);
}

const originalPackage = JSON.parse(execFileSync('git', ['show', `${base}:package.json`], { encoding: 'utf8' }));
const currentPackage = JSON.parse(readFileSync('package.json', 'utf8'));
for (const name of ['test:decision-events', 'test:measure-01-freeze', 'typecheck:decision-events']) {
  delete currentPackage.scripts[name];
}
assert.deepEqual(currentPackage, originalPackage, 'Only MEASURE-01 verification scripts may change package.json.');

const action = readFileSync('app/actions/decisionMetrics.ts', 'utf8');
assert.doesNotMatch(action, /cookies\(|NextResponse|route\.ts/);
const doc = readFileSync('docs/MEASURE_01_DECISION_EVENT_FOUNDATION_CN.md', 'utf8');
assert.match(doc, /DEV_READY/);
assert.match(doc, /默认关闭/);
assert.match(doc, /未执行/);
assert.match(doc, /Owner/);

console.log(
  `MEASURE-01 freeze PASS: ${changed.length} scoped files; zero route, metadata, canonical, hreflang, robots, schema, or sitemap changes.`,
);
