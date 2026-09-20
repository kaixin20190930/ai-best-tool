import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

import {
  decisionEventNames,
  validateDecisionEvent,
  type DecisionEvent,
} from '../lib/analytics/decisionEvents/contract';
import { createDecisionFlowController, DECISION_FLOW_WINDOW_MS } from '../lib/analytics/decisionEvents/flow';
import {
  buildDecisionEventHashes,
  classifyDecisionEventTraffic,
  getDecisionEventRuntimeConfig,
  ingestDecisionEvent,
  type DecisionEventRepository,
  type DecisionEventRuntimeConfig,
  type DecisionMetricEventRecord,
} from '../lib/analytics/decisionEvents/ingest';

async function main() {
  const flowId = '11111111-1111-4111-8111-111111111111';
  const taskId = '22222222-2222-4222-8222-222222222222';
  const resultId = '33333333-3333-4333-8333-333333333333';
  const toolId = '44444444-4444-4444-8444-444444444444';
  const sourceToolId = '55555555-5555-4555-8555-555555555555';
  const base = { eventVersion: 1 as const, flowInstanceId: flowId, locale: 'en' as const };
  const legalEvents: DecisionEvent[] = [
    { ...base, eventName: 'find_tools_view', surface: 'find_tools' },
    { ...base, eventName: 'task_start', surface: 'find_tools', taskId },
    {
      ...base,
      eventName: 'constraint_selected',
      surface: 'find_tools',
      constraintKey: 'team_size',
      constraintValueCode: '2_10',
    },
    {
      ...base,
      eventName: 'task_results_shown',
      surface: 'find_tools',
      taskId,
      rulesVersion: 'decision-v1',
      resultId,
      resultCount: 3,
      hasUnknown: true,
    },
    {
      ...base,
      eventName: 'task_zero_result',
      surface: 'find_tools',
      taskId,
      rulesVersion: 'decision-v1',
      resultId,
      zeroReasonCode: 'no_published_fit',
    },
    {
      ...base,
      eventName: 'tool_detail_open',
      surface: 'tool_detail',
      resultId,
      toolId,
      entryPoint: 'finder_result',
    },
    {
      ...base,
      eventName: 'comparison_open',
      surface: 'comparison',
      comparisonKey: 'ai_coding_comparison',
      entryPoint: 'finder_result',
      resultId,
    },
    {
      ...base,
      eventName: 'evidence_open',
      surface: 'tool_detail',
      toolId,
      evidenceSurface: 'ledger',
      claimType: 'pricing_plan',
    },
    {
      ...base,
      eventName: 'decision_saved',
      surface: 'find_tools',
      taskId,
      resultId,
      saveMode: 'create',
      rulesVersion: 'decision-v1',
    },
    {
      ...base,
      eventName: 'official_site_click',
      surface: 'tool_detail',
      toolId,
      entryPoint: 'tool_detail',
      officialDomainCode: 'primary_website',
    },
  ];

  assert.deepEqual(
    legalEvents.map((event) => event.eventName),
    decisionEventNames,
    'Every PH0 event, including the required find_tools_view denominator, needs a legal fixture.',
  );
  for (const event of legalEvents) assert.deepEqual(validateDecisionEvent(event), { ok: true, event });

  const validTaskStart = legalEvents[1];
  assert.equal(validateDecisionEvent({ ...validTaskStart, eventName: 'made_up_event' }).ok, false);
  assert.deepEqual(validateDecisionEvent({ ...validTaskStart, extra: 'x' }), {
    ok: false,
    code: 'unknown_field',
    field: 'extra',
  });

  for (const field of [
    'userId',
    'email',
    'phone',
    'ip',
    'userAgent',
    'referrer',
    'url',
    'query',
    'freeText',
    'roleText',
    'budgetValue',
    'integrationValue',
    'sessionId',
    'deviceId',
    'fingerprint',
    'trafficQuality',
  ]) {
    assert.deepEqual(validateDecisionEvent({ ...validTaskStart, [field]: 'sensitive-value' }), {
      ok: false,
      code: 'forbidden_field',
      field,
    });
  }

  assert.equal(
    validateDecisionEvent({
      ...legalEvents[2],
      constraintKey: 'budget',
      constraintValueCode: 'My budget is $200',
    }).ok,
    false,
    'Budget numbers/free text must be reduced to the redacted code.',
  );
  assert.equal(
    validateDecisionEvent({ ...legalEvents[6], comparisonKey: 'https://example.com/compare?user=1' }).ok,
    false,
    'Complete URLs and queries cannot pass as comparison identifiers.',
  );
  assert.equal(
    validateDecisionEvent({ ...legalEvents[9], officialDomainCode: 'example.com?campaign=x' }).ok,
    false,
    'Official destinations use opaque codes, never domains, URLs, or queries.',
  );
  assert.equal(
    validateDecisionEvent({ ...legalEvents[6], entryPoint: 'tool_detail', resultId, sourceToolId }).ok,
    false,
    'Comparison attribution accepts exactly one source identifier.',
  );
  assert.equal(
    validateDecisionEvent({ ...legalEvents[6], entryPoint: 'tool_detail', resultId: undefined, sourceToolId }).ok,
    false,
    'Undefined properties are still unknown wire fields rather than silently removed.',
  );
  assert.equal(
    validateDecisionEvent({
      ...base,
      eventName: 'comparison_open',
      surface: 'comparison',
      comparisonKey: 'ai_coding_comparison',
      entryPoint: 'tool_detail',
      sourceToolId,
    }).ok,
    true,
  );
  assert.equal(
    validateDecisionEvent({ ...legalEvents[2], constraintKey: '__proto__', constraintValueCode: 'redacted' }).ok,
    false,
  );

  let time = 0;
  let idSequence = 0;
  const flow = createDecisionFlowController(
    () => time,
    () => `flow-${++idSequence}`,
  );
  assert.equal(flow.getFlowInstanceId(), 'flow-1');
  time = DECISION_FLOW_WINDOW_MS - 1;
  assert.equal(flow.getFlowInstanceId(), 'flow-1', 'Activity before 30 minutes must roll the memory-only window.');
  time += DECISION_FLOW_WINDOW_MS - 1;
  assert.equal(flow.getFlowInstanceId(), 'flow-1');
  time += DECISION_FLOW_WINDOW_MS;
  assert.equal(flow.getFlowInstanceId(), 'flow-2', 'The exact 30-minute inactivity boundary starts a new flow.');
  flow.clear();
  assert.equal(flow.getFlowInstanceId(), 'flow-3', 'A refresh/unmount can discard the flow without persistence.');

  const internalToken = 'internal-test-token';
  const internalTokenHash = createHash('sha256').update(internalToken).digest('hex');
  const internalConfig = { internalTokenHashes: [internalTokenHash] };
  assert.deepEqual(
    classifyDecisionEventTraffic({ host: 'aibesttool.com', userAgent: 'Googlebot/2.1' }, internalConfig),
    {
      accepted: false,
      reason: 'bot',
    },
  );
  assert.deepEqual(
    classifyDecisionEventTraffic(
      { host: 'feature-123.vercel.app', deploymentEnvironment: 'preview', userAgent: 'Mozilla/5.0' },
      internalConfig,
    ),
    { accepted: false, reason: 'preview' },
  );
  assert.deepEqual(
    classifyDecisionEventTraffic(
      { host: 'localhost:3000', deploymentEnvironment: 'production', userAgent: 'Mozilla/5.0' },
      internalConfig,
    ),
    { accepted: false, reason: 'local' },
  );
  assert.deepEqual(
    classifyDecisionEventTraffic(
      { host: 'aibesttool.com', requestPurpose: 'health', userAgent: 'Mozilla/5.0' },
      internalConfig,
    ),
    { accepted: false, reason: 'health' },
  );
  assert.deepEqual(
    classifyDecisionEventTraffic(
      { host: 'aibesttool.com', internalTrafficToken: internalToken, userAgent: 'Mozilla/5.0' },
      internalConfig,
    ),
    { accepted: false, reason: 'internal' },
  );
  assert.deepEqual(
    classifyDecisionEventTraffic({ host: 'aibesttool.com', userAgent: 'Mozilla/5.0 Chrome/126.0' }, internalConfig),
    { accepted: true, trafficQuality: 'human' },
  );
  assert.deepEqual(classifyDecisionEventTraffic({ host: 'aibesttool.com', userAgent: '' }, internalConfig), {
    accepted: true,
    trafficQuality: 'unknown',
  });

  const defaultConfig = getDecisionEventRuntimeConfig({});
  assert.equal(defaultConfig.collectionEnabled, false);
  assert.equal(defaultConfig.retentionDays, null);
  assert.equal(defaultConfig.retentionApproved, false);
  assert.equal(defaultConfig.hashSecret, null);

  const enabledConfig: DecisionEventRuntimeConfig = {
    collectionEnabled: true,
    hashSecret: 'test-only-hash-secret-with-at-least-32-characters',
    retentionDays: 14,
    retentionApproved: true,
    internalTokenHashes: [internalTokenHash],
  };
  const productionHuman = {
    host: 'aibesttool.com',
    deploymentEnvironment: 'production',
    userAgent: 'Mozilla/5.0 Chrome/126.0',
  };

  let disabledWrites = 0;
  const disabled = await ingestDecisionEvent({
    payload: validTaskStart,
    context: productionHuman,
    config: defaultConfig,
    repository: {
      insert: async () => {
        disabledWrites += 1;
        return 'inserted';
      },
    },
  });
  assert.deepEqual(disabled, { accepted: false, code: 'collection_disabled' });
  assert.equal(disabledWrites, 0);

  for (const partialConfig of [
    { ...enabledConfig, hashSecret: null },
    { ...enabledConfig, hashSecret: 'too-short' },
    { ...enabledConfig, retentionDays: null },
    { ...enabledConfig, retentionApproved: false },
  ]) {
    const result = await ingestDecisionEvent({
      payload: validTaskStart,
      context: productionHuman,
      config: partialConfig,
      repository: { insert: async () => 'inserted' },
    });
    assert.deepEqual(result, { accepted: false, code: 'configuration_invalid' });
  }

  const inserted = new Map<string, DecisionMetricEventRecord>();
  const repository: DecisionEventRepository = {
    async insert(record) {
      if (inserted.has(record.idempotencyKey)) return 'duplicate';
      inserted.set(record.idempotencyKey, record);
      return 'inserted';
    },
  };
  const receivedAt = new Date('2026-09-20T00:05:00.000Z');
  const first = await ingestDecisionEvent({
    payload: validTaskStart,
    context: productionHuman,
    config: enabledConfig,
    repository,
    receivedAt,
  });
  const duplicate = await ingestDecisionEvent({
    payload: validTaskStart,
    context: productionHuman,
    config: enabledConfig,
    repository,
    receivedAt: new Date('2026-09-20T00:25:00.000Z'),
  });
  assert.deepEqual(first, { accepted: true, duplicate: false, trafficQuality: 'human' });
  assert.deepEqual(duplicate, { accepted: true, duplicate: true, trafficQuality: 'human' });
  assert.equal(inserted.size, 1);
  const stored = Array.from(inserted.values())[0];
  assert.notEqual(stored.flowInstanceHash, flowId);
  assert.equal(JSON.stringify(stored).includes(flowId), false, 'Raw flow IDs must not enter storage records.');
  for (const forbidden of ['userId', 'ip', 'userAgent', 'referrer', 'url', 'query', 'metadata']) {
    assert.equal(forbidden in stored, false, `${forbidden} must not exist in the storage contract.`);
  }

  const nextBucketHashes = buildDecisionEventHashes(
    validTaskStart,
    new Date('2026-09-20T00:35:00.000Z'),
    enabledConfig.hashSecret as string,
  );
  assert.notEqual(stored.idempotencyKey, nextBucketHashes.idempotencyKey);
  assert.equal(stored.flowInstanceHash, nextBucketHashes.flowInstanceHash);

  for (const [context, reason] of [
    [{ ...productionHuman, userAgent: 'Googlebot/2.1' }, 'bot'],
    [{ ...productionHuman, deploymentEnvironment: 'preview' }, 'preview'],
    [{ ...productionHuman, host: '127.0.0.1:3000' }, 'local'],
    [{ ...productionHuman, requestPurpose: 'health' }, 'health'],
    [{ ...productionHuman, internalTrafficToken: internalToken }, 'internal'],
  ] as const) {
    const result = await ingestDecisionEvent({
      payload: validTaskStart,
      context,
      config: enabledConfig,
      repository,
      receivedAt,
    });
    assert.deepEqual(result, { accepted: false, code: 'excluded_traffic', detail: reason });
  }

  const invalidEvent = await ingestDecisionEvent({
    payload: { ...validTaskStart, email: 'person@example.com' },
    context: productionHuman,
    config: enabledConfig,
    repository,
    receivedAt,
  });
  assert.deepEqual(invalidEvent, { accepted: false, code: 'invalid_payload', detail: 'forbidden_field' });

  const unconfirmedSave = await ingestDecisionEvent({
    payload: legalEvents[8],
    context: productionHuman,
    config: enabledConfig,
    repository,
    receivedAt,
  });
  assert.deepEqual(unconfirmedSave, {
    accepted: false,
    code: 'invalid_payload',
    detail: 'server_confirmation_required',
  });
  const unverifiedOfficial = await ingestDecisionEvent({
    payload: legalEvents[9],
    context: productionHuman,
    config: enabledConfig,
    repository,
    receivedAt,
  });
  assert.deepEqual(unverifiedOfficial, {
    accepted: false,
    code: 'invalid_payload',
    detail: 'official_domain_unverified',
  });
  const verifiedOfficial = await ingestDecisionEvent({
    payload: legalEvents[9],
    context: productionHuman,
    config: enabledConfig,
    repository,
    receivedAt,
    verifyOfficialDomain: async (candidateToolId, domainCode) =>
      candidateToolId === toolId && domainCode === 'primary_website',
  });
  assert.deepEqual(verifiedOfficial, { accepted: true, duplicate: false, trafficQuality: 'human' });

  const migration = readFileSync('db/supabase/migrations/20260920_decision_metric_events.sql', 'utf8');
  for (const eventName of decisionEventNames) assert(migration.includes(`'${eventName}'`));
  for (const forbiddenColumn of ['user_id', 'ip_address', 'user_agent', 'referrer', 'source_url', 'query_string']) {
    assert.doesNotMatch(migration, new RegExp(`\\b${forbiddenColumn}\\s+(?:TEXT|UUID|VARCHAR|INET)\\b`, 'i'));
  }
  assert.match(migration, /ENABLE ROW LEVEL SECURITY/);
  assert.match(migration, /FORCE ROW LEVEL SECURITY/);
  assert.match(migration, /REVOKE ALL ON TABLE public\.decision_metric_events FROM PUBLIC, anon, authenticated/);
  assert.match(migration, /GRANT INSERT ON TABLE public\.decision_metric_events TO service_role/);
  assert.doesNotMatch(migration, /CREATE POLICY/);
  assert.match(migration, /No retention duration or deletion job is approved/);

  console.log(
    JSON.stringify(
      {
        success: true,
        legalEvents: legalEvents.length,
        forbiddenFieldsChecked: 17,
        trafficExclusions: 5,
        collectionDefault: 'off',
        rawIdentifiersStored: false,
        migrationExecuted: false,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
