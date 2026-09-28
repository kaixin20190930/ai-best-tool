import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { assertAdminReviewer, parseArgs, validateManifest, validateResponse } from './execute-decision-cl04-fit-withdrawal';

const reviewer = '11111111-1111-4111-8111-111111111111';
assert.deepEqual(parseArgs([`--reviewer=${reviewer}`]), { execute: false, reviewer });
assert.deepEqual(parseArgs(['--', `--reviewer=${reviewer}`]), { execute: false, reviewer });
assert.deepEqual(parseArgs(['--execute', `--reviewer=${reviewer}`]), { execute: true, reviewer });
assert.throws(() => parseArgs([]));
assert.throws(() => parseArgs(['--reviewer=bad']));
assert.throws(() => parseArgs([`--reviewer=${reviewer}`, '--other']));

const priorAdminEmails = process.env.ADMIN_EMAILS;
delete process.env.ADMIN_EMAILS;
const adminUser = (user_metadata: Record<string, unknown>, email = 'reviewer@example.com') =>
  ({ id: reviewer, app_metadata: {}, user_metadata, aud: 'authenticated', created_at: '', email } as any);
assert.doesNotThrow(() => assertAdminReviewer(adminUser({ role: 'admin' })));
assert.doesNotThrow(() => assertAdminReviewer(adminUser({ role: 'moderator' })));
assert.throws(() => assertAdminReviewer(adminUser({ role: 'user' })));
process.env.ADMIN_EMAILS = 'approved@example.com';
assert.doesNotThrow(() => assertAdminReviewer(adminUser({}, 'APPROVED@example.com')));
assert.throws(() => assertAdminReviewer(null));
if (priorAdminEmails === undefined) delete process.env.ADMIN_EMAILS;
else process.env.ADMIN_EMAILS = priorAdminEmails;

const manifest = JSON.parse(
  readFileSync('docs/DECISION_GRAPH_CL04_FIT_WITHDRAWAL_MANIFEST_2026-09-28_CN.json', 'utf8'),
);
validateManifest(manifest);
assert.throws(() => validateManifest({ ...manifest, fits: [manifest.fits[0], manifest.fits[0]] }));
assert.throws(() => validateManifest({ ...manifest, qaReference: '' }));
assert.throws(() =>
  validateManifest({ ...manifest, fits: manifest.fits.map((fit: object) => ({ ...fit, status: 'stale' })) }),
);

const preflight = {
  ok: true,
  operation: 'withdraw',
  taskId: manifest.taskId,
  fitIds: manifest.fits.map((fit: { id: string }) => fit.id),
  fitUpdates: 0,
  taskCapabilityUpdates: 0,
  toolCapabilityUpdates: 0,
};
validateResponse(preflight, true);
assert.throws(() => validateResponse({ ...preflight, fitIds: [preflight.fitIds[0], preflight.fitIds[0]] }, true));
assert.throws(() => validateResponse({ ...preflight, toolCapabilityUpdates: 1 }, true));
validateResponse({ ...preflight, fitUpdates: 2 }, false);
console.log('PASS CL-04 Fit withdrawal CLI guardrails');
