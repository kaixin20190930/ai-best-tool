import assert from 'node:assert/strict';

import { reconcileGrowthMilestones, updateGrowthObservationDocument } from '../lib/seo/productGrowthMilestones';

const release = { id: 'test', releasedOn: '2026-11-05', paths: ['/ai/test'] };
const record = {
  key: '2026-11-08:test:D+3',
  release: 'test',
  releasedOn: release.releasedOn,
  day: 3,
  dueOn: '2026-11-08',
  paths: release.paths,
  milestoneStatus: 'waiting_data',
};
const ledger = { file: 'D3.json', data: { schemaVersion: 1, records: [record] } };
const milestones = reconcileGrowthMilestones([release], [3, 7, 14], '2026-11-12', [ledger]);
assert.equal(milestones[0].status, 'waiting_data');
assert.equal(milestones[0].needsObservation, false, 'Recorded missing data is not a daily overdue task');
assert.equal(milestones[1].needsObservation, true, 'An unrecorded due node still needs evidence');
assert.equal(milestones[2].status, 'not_due');
assert.throws(() => reconcileGrowthMilestones([release], [3], '2026-11-12', [ledger, ledger]), /Duplicate/);
assert.throws(() => reconcileGrowthMilestones([release], [3], '2026-11-12', [{ file: 'bad', data: {} }]), /Invalid/);
assert.throws(
  () =>
    reconcileGrowthMilestones([release], [3], '2026-11-12', [
      { file: 'bad', data: { schemaVersion: 1, records: [{ ...record, paths: ['/wrong'] }] } },
    ]),
  /Invalid/,
);
const priorRelease = { ...record, releasedOn: '2026-10-01' };
assert.equal(
  reconcileGrowthMilestones([release], [3], '2026-11-12', [
    { file: 'history', data: { schemaVersion: 1, records: [priorRelease] } },
  ])[0].needsObservation,
  true,
);
const first = updateGrowthObservationDocument(
  '# Old technical report\n\n## Google evidence\nKeep this.\n',
  '# New technical report',
);
const second = updateGrowthObservationDocument(first, '# New technical report');
assert.equal(first, second, 'Repeating a run must not duplicate or remove recorded evidence');
assert(first.includes('## Google evidence\nKeep this.'));
assert(!first.includes('Old technical report'));
assert.throws(() => updateGrowthObservationDocument('<!-- growth-observation:start -->', 'new'), /Unclosed/);
console.log(
  'PASS milestone reconciliation, pending data, duplicate/corrupt ledger protection and evidence preservation',
);
