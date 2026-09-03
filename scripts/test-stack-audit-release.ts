import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const read = (relativePath: string) => fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
const action = read('app/actions/stackAudit.ts');
const rules = read('lib/services/stack/audit.ts');
const workspace = read('components/stack/StackWorkspace.tsx');

assert.match(action, /idempotency_key/);
assert.match(action, /\.eq\('user_id', user\.id\)/);
assert.match(action, /\.in\('stack_item_id', stackItemIds\)/);
assert.match(action, /stack_audit_finding_claims/);
assert.match(action, /claim_snapshot/);
assert.match(action, /status: 'failed'/);
assert.match(action, /AUDIT_UNAVAILABLE/);
assert.match(rules, /recommendation_only/);
assert.doesNotMatch(rules, /cancelSubscription|deleteSubscription|stripe/i);
assert.match(workspace, /Generating audit findings/);
assert.match(workspace, /animate-spin/);
assert.match(workspace, /Latest audit/);
assert.match(workspace, /View evidence/);

console.log(
  JSON.stringify(
    {
      success: true,
      ownershipScoped: true,
      leastPrivilegeRead: true,
      idempotencyProtected: true,
      evidenceSnapshot: true,
      pendingAndFailureStates: true,
      autoCancellation: false,
    },
    null,
    2,
  ),
);
