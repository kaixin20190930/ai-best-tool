import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  buildAllowedUpdateSql,
  replaceApprovedAtPath,
  replaceApprovedText,
  validateApprovedWritablePaths,
} from './existing-tools-freshness-write-policy';

const manifest = JSON.parse(fs.readFileSync('docs/EXISTING_TOOLS_FRESHNESS_BATCH_2026-10-16_A.json', 'utf8'));
validateApprovedWritablePaths(manifest.items, manifest.approvedWritablePaths);

for (const sql of [
  buildAllowedUpdateSql([], false),
  buildAllowedUpdateSql([['decision', 'freshnessSummary', 'en']], true),
]) {
  const assignments = sql.split(' SET ')[1].split(' WHERE ')[0];
  assert(!/\bupdated_at\s*=/.test(assignments), 'updated_at must not be written');
  assert(assignments.includes("jsonb_set(t.features, '{maintenanceReview}'"));
  assert(!/\bfeatures\s*=\s*\$\d+::jsonb/.test(assignments), 'Do not replace the whole features object');
}
assert(buildAllowedUpdateSql([], false).includes("'{maintenanceReview}', $2::jsonb"));
assert(buildAllowedUpdateSql([], false).includes('name=$4'));
assert(buildAllowedUpdateSql([['decision', 'freshnessSummary', 'en']], true).includes('name=$5'));

const unauthorized = structuredClone(manifest.items);
unauthorized[2].featureReplacements[0].path = ['marketValidation', 'verdict'];
assert.throws(
  () => validateApprovedWritablePaths(unauthorized, manifest.approvedWritablePaths),
  /Unauthorized writable path/,
);
assert.throws(() => buildAllowedUpdateSql([['marketValidation', 'verdict']], false), /Unauthorized feature path/);

const unapprovedValue = structuredClone(manifest.items);
unapprovedValue[0].detailReplacements.en.to = 'Different next review date';
assert.throws(
  () => validateApprovedWritablePaths(unapprovedValue, manifest.approvedWritablePaths),
  /not exactly approved/,
);
assert.throws(
  () => replaceApprovedText('Unrelated source paragraph', 'Expected old date', 'Approved new date'),
  /Old value does not match/,
);
assert.throws(
  () =>
    replaceApprovedAtPath(
      { decision: { freshnessSummary: { en: 'Unrelated old value' } } },
      ['decision', 'freshnessSummary', 'en'],
      'Approved old value',
      'Approved new value',
    ),
  /Old value does not match/,
);

console.log('PASS no updated_at write, exact path/value approval, old-value mismatch rejection');
