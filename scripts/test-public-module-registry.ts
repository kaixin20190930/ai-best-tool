import React from 'react';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';

import PublicModuleArea, { createPublicModuleArea } from '../components/public-modules/PublicModuleArea';
import {
  createPublicModuleRegistry,
  evaluatePublicModules,
  parsePublicModuleRegistry,
  publicModuleControls,
  publicModulePilotPages,
  publicModuleRegistrations,
  publicModuleRegistry,
  publicModuleRolloutBucket,
  type PublicModuleControls,
  type PublicModulePage,
  type PublicModuleRegistration,
  type PublicModuleRegistry,
  type PublicModuleRequest,
} from '../lib/content/publicModuleRegistry';

const pages: PublicModulePage[] = ['ai-coding-tools', 'ai-chatbot-tools', 'ai-tools-for-web3'].map((slug) => ({
  path: `/guides/${slug}`,
  pageType: 'guide',
}));
const now = new Date('2026-09-19T12:00:00.000Z');
const moduleDefinition: PublicModuleRegistration = {
  id: 'verified-limit',
  version: '1.0.0',
  pageTypes: ['guide'],
  userQuestion: 'Which verified limit changes my choice?',
  publicValue: 'Connect an existing source to a concrete selection constraint.',
  requiredEvidence: [{ id: 'official-limit', maxAgeDays: 30 }],
  placement: 'after-evidence',
  maxInstances: 1,
  experimentId: 'verified-limit-pilot',
  enabled: true,
  rolloutPercent: 100,
  pilotPages: pages.map((page) => page.path),
  successMetrics: [
    {
      id: 'decision-link-clicks',
      description: 'Clicks from the decision to a tool.',
      baselineRef: null,
      target: 'Establish the baseline before claiming an improvement.',
    },
  ],
  stopRule: {
    onSeoRegression: true,
    onEvidenceFailure: true,
    onExperienceAndBehaviorDecline: true,
    firstReviewDays: 14,
    fullReviewDays: 28,
    healthMaxAgeHours: 24,
  },
  rollbackMode: 'hide-preserve-data',
};
const request: PublicModuleRequest = {
  instanceId: 'limit-instance',
  moduleId: moduleDefinition.id,
  placement: 'after-evidence',
  evidence: [
    {
      id: 'official-limit',
      claim: 'Test fixture only; not a public product fact.',
      sourceUrl: 'https://example.com/official-limit',
      checkedAt: '2026-09-18T12:00:00.000Z',
      status: 'verified',
    },
  ],
};
const controls: PublicModuleControls = {
  mode: 'pilot',
  experiments: {
    'verified-limit-pilot': {
      version: '1.0.0',
      mode: 'pilot',
      startedAt: '2026-09-10T12:00:00.000Z',
      checkedAt: now.toISOString(),
      seoRegression: false,
      evidenceFailure: false,
      experienceDeclined: false,
      behaviorDeclined: false,
      reviews: [],
    },
  },
};
const registry = createPublicModuleRegistry([moduleDefinition], pages);
assert(registry);
const evaluate = (
  options: {
    definition?: PublicModuleRegistration;
    page?: PublicModulePage;
    requests?: PublicModuleRequest[];
    switches?: PublicModuleControls;
    date?: Date;
  } = {},
) =>
  evaluatePublicModules(
    options.definition ? createPublicModuleRegistry([options.definition], pages) : registry,
    options.page || pages[0],
    options.requests || [request],
    options.switches || controls,
    options.date || now,
  );
type Mutable<T> = { -readonly [K in keyof T]: Mutable<T[K]> };
const experiment = () => structuredClone(controls) as Mutable<PublicModuleControls>;

test('legal registration is immutable, existing-page-only and defaults indexImpact to none', () => {
  assert.equal(registry.modules[0].indexImpact, 'none');
  assert(Object.isFrozen(registry) && Object.isFrozen(registry.modules[0].stopRule));
  assert(Object.isFrozen(registry.modules[0].requiredEvidence));
  assert.deepEqual(evaluate(), [
    { instanceId: request.instanceId, show: true, reason: 'allowed', dataPolicy: 'retain' },
  ]);
  pages.forEach((page) => assert(existsSync(`app/[locale]/(with-footer)${page.path}/page.tsx`)));
});

test('every required registration field is enforced and defaults are closed', () => {
  for (const field of Object.keys(moduleDefinition)) {
    if (['enabled', 'rolloutPercent'].includes(field)) continue;
    const broken: Record<string, unknown> = { ...moduleDefinition };
    delete broken[field];
    assert.equal(parsePublicModuleRegistry([broken], pages), null, `missing ${field}`);
  }
  const defaults = { ...moduleDefinition };
  delete defaults.enabled;
  delete defaults.rolloutPercent;
  const parsed = createPublicModuleRegistry([defaults], pages);
  assert(parsed);
  assert.equal(parsed.modules[0].enabled, false);
  assert.equal(parsed.modules[0].rolloutPercent, 0);
  assert.equal(evaluate({ definition: defaults })[0].reason, 'disabled');
});

test('unknown fields, page types, duplicate registrations and index-impact attempts invalidate the registry', () => {
  for (const patch of [
    { pageTypes: ['admin'] },
    { pageTypes: [] },
    { pageTypes: ['guide', 'guide'] },
    { indexImpact: 'index' },
    { indexImpact: null },
    { canonical: '/anything' },
    { metadata: {} },
    { userQuestion: ' ' },
    { publicValue: '' },
    { successMetrics: [] },
    { requiredEvidence: [] },
    { requiredEvidence: [{ id: 'official-limit', maxAgeDays: 0 }] },
    { maxInstances: 0 },
    { maxInstances: 1.5 },
    { maxInstances: 4 },
    { rolloutPercent: -1 },
    { rolloutPercent: 101 },
    { rolloutPercent: NaN },
    { rollbackMode: 'delete-data' },
    { version: '' },
    { placement: 'head' },
  ]) assert.equal(parsePublicModuleRegistry([{ ...moduleDefinition, ...patch }], pages), null, JSON.stringify(patch));
  assert.equal(parsePublicModuleRegistry([moduleDefinition, moduleDefinition], pages), null);
  assert.equal(parsePublicModuleRegistry([moduleDefinition, { ...moduleDefinition, id: 'another' }], pages), null);
  assert.equal(parsePublicModuleRegistry([moduleDefinition], [...pages, pages[0]]), null);
});

test('pilots require 3–5 unique existing pages matching registered types, even at 100% rollout', () => {
  for (const pilotPages of [
    [],
    [pages[0].path],
    pages.slice(0, 2).map((page) => page.path),
    Array(6).fill(pages[0].path),
    [pages[0].path, pages[0].path, pages[1].path],
    [pages[0].path, pages[1].path, '/not-an-existing-page'],
  ]) assert.equal(createPublicModuleRegistry([{ ...moduleDefinition, pilotPages }], pages), null);
  assert.equal(createPublicModuleRegistry([{ ...moduleDefinition, pageTypes: ['tool'] }], pages), null);
  assert.equal(evaluate({ page: { path: '/guides/ai-image-tools', pageType: 'guide' } })[0].reason, 'page-mismatch');
  assert.equal(evaluate({ page: { ...pages[0], pageType: 'tool' } })[0].reason, 'page-mismatch');
  assert.equal(
    evaluate({ page: { ...pages[0], pageType: 'admin' } as unknown as PublicModulePage })[0].reason,
    'invalid-input',
  );
  assert.equal(evaluate({ page: { ...pages[0], path: `${pages[0].path}?pilot=1` } })[0].reason, 'invalid-input');
  assert.equal(evaluate({ page: { ...pages[0], path: `/cn${pages[0].path}` } })[0].reason, 'page-mismatch');
});

test('missing, malformed, unverified, stale or future evidence never renders', () => {
  for (const evidence of [
    [],
    [{ ...request.evidence[0], id: 'unrelated' }],
    [{ ...request.evidence[0], checkedAt: '2026-08-01T00:00:00.000Z' }],
    [{ ...request.evidence[0], checkedAt: '2026-09-20T00:00:00.000Z' }],
    [{ ...request.evidence[0], claim: '' }],
    [{ ...request.evidence[0], sourceUrl: 'http://example.com/unverified' }],
    [{ ...request.evidence[0], sourceUrl: 'not-a-url' }],
    [{ ...request.evidence[0], checkedAt: '2026-02-30T00:00:00.000Z' }],
    [request.evidence[0], request.evidence[0]],
  ]) assert.equal(evaluate({ requests: [{ ...request, evidence }] })[0].show, false);
  assert.equal(
    evaluate({
      requests: [
        { ...request, evidence: [{ ...request.evidence[0], status: 'pending' }] } as unknown as PublicModuleRequest,
      ],
    })[0].show,
    false,
  );
});

test('all instances share one page budget; overflow, duplicate IDs and placement mismatches are rejected', () => {
  const double = [request, { ...request, instanceId: 'second-instance' }];
  assert(evaluate({ requests: double }).every((decision) => decision.reason === 'instance-limit'));
  assert(
    evaluate({ definition: { ...moduleDefinition, maxInstances: 2 }, requests: double }).every(
      (decision) => decision.show,
    ),
  );
  assert(
    evaluate({ definition: { ...moduleDefinition, maxInstances: 2 }, requests: [request, request] }).every(
      (decision) => !decision.show,
    ),
  );
  assert.equal(evaluate({ requests: [{ ...request, placement: 'page-end' }] })[0].reason, 'placement-mismatch');
  assert.equal(evaluate({ requests: [{ ...request, moduleId: 'unknown-module' }] })[0].reason, 'unregistered');
  assert.equal(evaluate()[0].show, true, 'One page evaluation cannot consume another request’s budget.');
});

test('rollout is deterministic at zero, boundary and 100%, without request or visitor state', () => {
  const bucket = publicModuleRolloutBucket(moduleDefinition.experimentId, moduleDefinition.version, pages[0].path);
  assert.equal(
    publicModuleRolloutBucket(moduleDefinition.experimentId, moduleDefinition.version, pages[0].path),
    bucket,
  );
  assert.equal(evaluate({ definition: { ...moduleDefinition, rolloutPercent: 0 } })[0].reason, 'rollout');
  assert.equal(evaluate({ definition: { ...moduleDefinition, rolloutPercent: bucket / 100 } })[0].show, false);
  assert.equal(evaluate({ definition: { ...moduleDefinition, rolloutPercent: (bucket + 1) / 100 } })[0].show, true);
  assert.equal(evaluate({ definition: { ...moduleDefinition, rolloutPercent: 100 } })[0].show, true);
});

test('missing or weakened stop rules cannot register', () => {
  for (const field of Object.keys(moduleDefinition.stopRule)) {
    const stopRule: Record<string, unknown> = { ...moduleDefinition.stopRule };
    delete stopRule[field];
    assert.equal(parsePublicModuleRegistry([{ ...moduleDefinition, stopRule }], pages), null, field);
    assert.equal(
      parsePublicModuleRegistry(
        [{ ...moduleDefinition, stopRule: { ...moduleDefinition.stopRule, [field]: false } }],
        pages,
      ),
      null,
      field,
    );
  }
});

test('SEO/evidence incidents, joint decline, explicit stop, missing or stale health stop display', () => {
  for (const patch of [
    { seoRegression: true },
    { evidenceFailure: true },
    { experienceDeclined: true, behaviorDeclined: true },
    { mode: 'stopped' },
    { mode: 'off' },
    { version: '2.0.0' },
    { checkedAt: '2026-09-17T12:00:00.000Z' },
    { checkedAt: '2026-09-20T12:00:00.000Z' },
    { startedAt: '2026-09-20T12:00:00.000Z' },
  ]) {
    const switches = experiment();
    Object.assign(switches.experiments[moduleDefinition.experimentId], patch);
    assert.equal(evaluate({ switches })[0].reason, 'stopped', JSON.stringify(patch));
  }
  assert.equal(evaluate({ switches: { mode: 'pilot', experiments: {} } })[0].reason, 'stopped');
  const switches = experiment();
  switches.experiments[moduleDefinition.experimentId].behaviorDeclined = true;
  assert.equal(
    evaluate({ switches })[0].show,
    true,
    'Behavior alone does not automatically negate an experience improvement.',
  );
});

test('14/28 day review deadlines fail closed and reports cannot be future-dated or pre-approved', () => {
  const switches = experiment();
  const state = switches.experiments[moduleDefinition.experimentId];
  state.startedAt = '2026-08-22T12:00:00.000Z';
  const firstReviewRequests = [{
    ...request,
    evidence: [{ ...request.evidence[0], checkedAt: '2026-09-01T12:00:00.000Z' }],
  }];
  state.checkedAt = '2026-09-05T11:59:59.999Z';
  assert.equal(evaluate({ switches, requests: firstReviewRequests, date: new Date(state.checkedAt) })[0].show, true);
  state.checkedAt = '2026-09-05T12:00:00.000Z';
  assert.equal(evaluate({ switches, requests: firstReviewRequests, date: new Date(state.checkedAt) })[0].reason, 'review-required');
  state.checkedAt = now.toISOString();
  assert.equal(evaluate({ switches })[0].reason, 'review-required');
  state.reviews.push({
    day: 14,
    decision: 'continue-pilot',
    reviewedAt: '2026-09-05T12:00:00.000Z',
    reportRef: 'reports/day-14.md',
  });
  assert.equal(evaluate({ switches })[0].reason, 'review-required', 'Day 14 cannot stand in for day 28.');
  state.reviews.push({
    day: 28,
    decision: 'continue-pilot',
    reviewedAt: now.toISOString(),
    reportRef: 'reports/day-28.md',
  });
  assert.equal(evaluate({ switches })[0].show, true);
  state.reviews[0].reviewedAt = '2026-09-04T12:00:00.000Z';
  assert.equal(evaluate({ switches })[0].reason, 'review-required');
  state.reviews[0].reviewedAt = '2026-09-20T12:00:00.000Z';
  assert.equal(evaluate({ switches })[0].reason, 'review-required');
  state.reviews[0].reviewedAt = '2026-09-05T12:00:00.000Z';
  state.reviews[1].decision = 'stop';
  assert.equal(evaluate({ switches })[0].reason, 'stopped');
});

test('global and experiment rollback preserve inputs, evidence and reports and can be reversed', () => {
  const original = structuredClone({ moduleDefinition, request, controls });
  for (const mode of ['off', 'rollback'] as const) {
    const switches = experiment();
    switches.mode = mode;
    assert(evaluate({ switches }).every((decision) => !decision.show && decision.dataPolicy === 'retain'));
    switches.mode = 'pilot';
    switches.experiments[moduleDefinition.experimentId].mode = mode;
    assert(evaluate({ switches }).every((decision) => !decision.show && decision.dataPolicy === 'retain'));
    switches.experiments[moduleDefinition.experimentId].mode = 'pilot';
    assert.equal(evaluate({ switches })[0].show, true);
  }
  assert.deepEqual({ moduleDefinition, request, controls }, original);
});

test('malformed runtime data fails closed and production renders nothing without executing content', () => {
  assert.equal(evaluate({ date: new Date(NaN) })[0].show, false);
  assert.equal(evaluatePublicModules(null, pages[0], [request], controls, now)[0].show, false);
  assert.equal(evaluatePublicModules(registry, pages[0], [request], controls, null as unknown as Date)[0].show, false);
  assert.equal(
    evaluatePublicModules(
      { ...registry, modules: [{ ...registry.modules[0], indexImpact: 'index' }] } as unknown as PublicModuleRegistry,
      pages[0],
      [request],
      controls,
      now,
    )[0].show,
    false,
  );
  assert.equal(
    evaluatePublicModules(registry, pages[0], [request], null as unknown as PublicModuleControls, now)[0].show,
    false,
  );
  assert.equal(
    evaluatePublicModules(registry, pages[0], [null] as unknown as PublicModuleRequest[], controls, now)[0].show,
    false,
  );
  assert.deepEqual(publicModuleRegistrations, []);
  assert.deepEqual(publicModulePilotPages, []);
  assert.equal(publicModuleControls.mode, 'off');
  assert.equal(
    evaluatePublicModules(publicModuleRegistry, pages[0], [request], publicModuleControls, now)[0].show,
    false,
  );
  let called = false;
  const html = renderToStaticMarkup(
    React.createElement(PublicModuleArea, {
      page: pages[0],
      placement: request.placement,
      modules: [
        {
          request,
          render: () => {
            called = true;
            return 'Should not be rendered';
          },
        },
      ],
    }),
  );
  assert.equal(html, '');
  assert.equal(called, false);
});

test('the production renderer executes only admitted content and exposes no experiment diagnostics', () => {
  let calls = 0;
  const props = {
    page: pages[0],
    placement: request.placement,
    modules: [
      {
        request,
        render: () => {
          calls += 1;
          return React.createElement('p', null, 'Verified limit');
        },
      },
    ],
  };
  const Area = createPublicModuleArea(registry, controls, now);
  assert.equal(renderToStaticMarkup(React.createElement(Area, props)), '<p>Verified limit</p>');
  assert.equal(calls, 1);
  assert.equal(renderToStaticMarkup(React.createElement(Area, { ...props, placement: 'page-end' })), '');
  for (const patch of [{ mode: 'rollback' }, { mode: 'off' }, { experiments: {} }] as const) {
    const DisabledArea = createPublicModuleArea(registry, { ...controls, ...patch }, now);
    assert.equal(renderToStaticMarkup(React.createElement(DisabledArea, props)), '');
  }
  assert.equal(
    renderToStaticMarkup(
      React.createElement(Area, {
        ...props,
        modules: [...props.modules, { ...props.modules[0], request: { ...request, instanceId: 'another-instance' } }],
      }),
    ),
    '',
  );
  assert.equal(calls, 1, 'Rejected render callbacks cannot execute or emit side effects.');
});
