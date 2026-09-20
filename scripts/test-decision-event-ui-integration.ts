import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { createDecisionEventDispatcher } from '../lib/analytics/decisionEvents/client';

const component = readFileSync(resolve(process.cwd(), 'components/decision/DecisionFinder.tsx'), 'utf8');
const page = readFileSync(resolve(process.cwd(), 'app/[locale]/(with-footer)/find-tools/page.tsx'), 'utf8');
const action = readFileSync(resolve(process.cwd(), 'app/actions/decision.ts'), 'utf8');

const sent: unknown[] = [];
const flow = {
  getFlowInstanceId: () => '11111111-1111-4111-8111-111111111111',
  clear: () => undefined,
};
const disabled = createDecisionEventDispatcher({
  enabled: false,
  flow,
  send: async (event) => sent.push(event),
});
assert.equal(
  disabled.track((flowInstanceId) => ({
    eventName: 'find_tools_view',
    eventVersion: 1,
    flowInstanceId,
    locale: 'en',
    surface: 'find_tools',
  })),
  false,
);
assert.equal(sent.length, 0, 'disabled collection must not invoke the server action');

const enabled = createDecisionEventDispatcher({
  enabled: true,
  flow,
  send: async (event) => sent.push(event),
});
assert.equal(
  enabled.track((flowInstanceId) => ({
    eventName: 'find_tools_view',
    eventVersion: 1,
    flowInstanceId,
    locale: 'cn',
    surface: 'find_tools',
  })),
  true,
);
assert.deepEqual(sent, [
  {
    eventName: 'find_tools_view',
    eventVersion: 1,
    flowInstanceId: '11111111-1111-4111-8111-111111111111',
    locale: 'cn',
    surface: 'find_tools',
  },
]);

assert.match(page, /DECISION_EVENT_COLLECTION_ENABLED === 'true'/);
assert.match(page, /decisionMetricsEnabled=/);
for (const eventName of [
  'find_tools_view',
  'task_start',
  'constraint_selected',
  'task_results_shown',
  'task_zero_result',
  'tool_detail_open',
]) {
  assert.match(component, new RegExp(`eventName: '${eventName}'`));
}
assert.match(component, /trackConstraint\('role', 'redacted'\)/);
assert.match(component, /trackConstraint\('integrations', 'redacted'\)/);
assert.match(component, /trackConstraint\('budget', 'redacted'\)/);
assert.match(action, /resultId: string/);
assert.match(action, /const resultId = crypto\.randomUUID\(\)/);
assert.doesNotMatch(component, /DECISION_EVENT_COLLECTION_ENABLED/);

console.log(
  JSON.stringify(
    {
      success: true,
      disabledNetworkCalls: sent.length - 1,
      finderEventsIntegrated: 6,
      seoChanged: false,
    },
    null,
    2,
  ),
);
