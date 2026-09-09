import assert from 'node:assert/strict';
import fs from 'node:fs';

import { getToolDecisionMetadataPilot, TOOL_DECISION_METADATA_PILOT_SLUGS } from '../lib/seo/toolDecisionMetadata';

type Experiment = {
  slug: string;
  changedAt: string;
  intent: string;
  routes: { en: string; cn: string };
  before: Record<string, string>;
  after: { enTitle: string; enDescription: string; cnTitle: string; cnDescription: string };
  baselineMetrics: unknown;
  result: unknown;
};

const registry = JSON.parse(
  fs.readFileSync('reports/seo/ctr-snippet-experiments-2026-09-09.json', 'utf8'),
) as {
  minimumObservationDays: number;
  firstDecisionDate: string;
  fullDecisionDate: string;
  status: string;
  rules: string[];
  experiments: Experiment[];
  nextCohort: Array<{ path: string; week7Impressions: number; decision: string; reason: string }>;
};

assert.equal(registry.experiments.length, 4, 'The first experiment must remain a 3-5 entity batch.');
assert.equal(registry.minimumObservationDays, 14, 'The first decision must wait at least 14 days.');
assert.equal(registry.status, 'collecting_data');
assert(registry.rules.some((rule) => /position|query mix/i.test(rule)), 'CTR attribution must control for rank and query mix.');
assert.deepEqual(
  registry.experiments.map((item) => item.slug).sort(),
  [...TOOL_DECISION_METADATA_PILOT_SLUGS].sort(),
  'The registry and code allowlist must describe the same cohort.',
);

for (const experiment of registry.experiments) {
  assert.match(experiment.changedAt, /^\d{4}-\d{2}-\d{2}$/);
  assert(experiment.intent.length >= 50, `${experiment.slug}: search intent is too vague`);
  assert(experiment.routes.en === `/ai/${experiment.slug}`);
  assert(experiment.routes.cn === `/cn/ai/${experiment.slug}`);
  assert(Object.values(experiment.before).every((value) => value.length >= 20), `${experiment.slug}: missing old snippet`);
  for (const locale of ['en', 'cn']) {
    const current = getToolDecisionMetadataPilot(experiment.slug, locale);
    assert(current, `${experiment.slug}: current metadata is missing`);
    assert.equal(experiment.after[`${locale}Title` as 'enTitle'], current.title);
    assert.equal(experiment.after[`${locale}Description` as 'enDescription'], current.description);
  }
  assert.equal(experiment.baselineMetrics, null, `${experiment.slug}: do not fabricate missing GSC route metrics`);
  assert.equal(experiment.result, null, `${experiment.slug}: result must remain empty during observation`);
}

assert.equal(registry.nextCohort.length, 4);
assert(registry.nextCohort.every((item) => item.decision === 'hold_existing_specific_copy'));
assert(registry.nextCohort.every((item) => item.week7Impressions > 0 && item.reason.length >= 60));
assert(registry.firstDecisionDate >= '2026-09-23');
assert(registry.fullDecisionDate >= '2026-10-07');

console.log('✅ CTR snippet cohort is fixed, attributable, and protected from premature expansion.');
