import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const read = (relativePath: string) => fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
const page = read('app/[locale]/(with-footer)/profile/stack/page.tsx');
const workspace = read('components/stack/StackWorkspace.tsx');
const action = read('app/actions/stack.ts');
const cost = read('lib/services/stack/cost.ts');

assert.match(page, /getNoindexMetadata\(\)/);
assert.match(page, /supabase\.auth\.getUser\(\)/);
assert.match(page, /login\?redirect=\/profile\/stack/);
assert.match(page, /user_tool_stack_items/);
assert.match(workspace, /useTransition\(\)/);
assert.match(workspace, /animate-spin/);
assert.match(workspace, /router\.refresh\(\)/);
assert.match(workspace, /Original bill/);
assert.match(workspace, /Monthly cost preview/);
assert.match(action, /\.eq\('user_id', user\.id\)/);
assert.match(action, /TOOL_NOT_AVAILABLE/);
assert.match(action, /STACK_UNAVAILABLE/);
assert.match(action, /cost_normalization: normalized\.normalization/);
assert.doesNotMatch(action, /pricing/i);
assert.doesNotMatch(cost, /pricing/i);

console.log(
  JSON.stringify(
    {
      success: true,
      noindex: true,
      authRequired: true,
      ownershipScoped: true,
      pendingState: true,
      stableFailureCode: true,
      publicPricingInference: false,
    },
    null,
    2,
  ),
);
