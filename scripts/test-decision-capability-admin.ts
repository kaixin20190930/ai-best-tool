import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const actions = fs.readFileSync(path.join(process.cwd(), 'app/actions/admin/decision.ts'), 'utf8');
const component = fs.readFileSync(path.join(process.cwd(), 'components/admin/CapabilityManager.tsx'), 'utf8');
const adminService = fs.readFileSync(path.join(process.cwd(), 'lib/services/admin/capabilities.ts'), 'utf8');

for (const action of [
  'saveDecisionCapability',
  'saveToolCapability',
  'saveTaskCapability',
  'addToolCapabilityEvidenceLink',
  'removeToolCapabilityEvidenceLink',
]) {
  assert.match(actions, new RegExp(`export async function ${action}`));
}
assert.match(actions, /await requireAdmin\(\)/);
assert.match(actions, /function isUuid/);
assert.match(actions, /function parseObject/);
assert.match(actions, /function parseArray/);
assert.match(actions, /getDecisionToolIdentities\(\[input\.toolId\], 'en'\)/);
assert.match(actions, /Directory tool not found/);
assert.match(actions, /Published evidence links are locked/);
assert.match(actions, /Evidence link was rejected by the verification gate/);
assert.doesNotMatch(component, /\.from\('/, 'browser component must not query Supabase directly');
assert.doesNotMatch(component, /claim_value|source_excerpt/, 'browser component must not receive raw claim content');
assert.match(component, /useTransition/);
assert.match(component, /Saving\.\.\./);
assert.match(component, /Error:/);
assert.match(component, /router\.refresh\(\)/);
assert.match(adminService, /await requireAdmin\(\)/);
assert.match(adminService, /evidenceCount/);
assert.doesNotMatch(adminService, /claim_value|source_excerpt/);

console.log(
  JSON.stringify({ success: true, adminAuthGuarded: true, inputValidated: true, uiStatesPresent: true }, null, 2),
);
