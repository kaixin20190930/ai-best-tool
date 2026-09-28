import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// The committed CL-04 operator manifest is the source of the exact withdrawal scope.
const manifest = JSON.parse(
  readFileSync(
    new URL('../docs/DECISION_GRAPH_CL04_FIT_WITHDRAWAL_MANIFEST_2026-09-28_CN.json', import.meta.url),
    'utf8',
  ),
) as {
  taskId: string;
  operation: string;
  qaReference: string;
  fits: { id: string; status: string; updated_at: string }[];
};

// Tool and old claim identities are from the CL-04 read-only verifier and Fit-only RPC.
const withdrawnFits = [
  {
    id: '692f9115-2d1d-487b-b02b-392fa55d2d34',
    toolId: '23bb3601-a5ac-42c3-bff3-64b06a063959',
    claimId: '806bedca-c1e4-4fd1-ae57-e4db06567e47',
    toolCapabilityId: '4ebad72c-d03e-4a54-9a2c-f5024f7da9ac',
  },
  {
    id: 'bb6bb5aa-df5e-4113-bb76-8d4910911b28',
    toolId: 'f77fb817-e8dc-4c22-b7cd-8edc2e5b0a5e',
    claimId: '76cf5413-ce8c-424d-9a6b-21584758cf72',
    toolCapabilityId: 'ac4c1009-feaf-4544-bbaf-086e56089bdc',
  },
] as const;

export type SeedFit = {
  id: string;
  tool_id: string;
  task_id: string;
  status: string;
  last_edited_by: string | null;
  updated_at: string;
};

export type WithdrawalAudit = {
  profile_id: string;
  event_type: string;
  review_scope: string;
  claim_type: string;
  claim_key: string;
  old_value: { status?: string } | null;
  new_value: { status?: string } | null;
  visibility: string;
  occurred_at: string;
  verified_at: string;
  verified_by: string;
  metadata: { taskId?: string; operation?: string; qaReference?: string; fits?: unknown } | null;
};

type WithdrawalEvidence = {
  profiles: { id: string; owner_type: string; owner_id: string }[];
  fitLinks: { fit_id: string; claim_id: string; purpose: string }[];
  audits: WithdrawalAudit[];
  capabilities: { id: string; slug: string }[];
  taskCapabilities: { task_id: string; capability_id: string; status: string }[];
  toolCapabilities: { id: string; tool_id: string; capability_id: string; status: string }[];
};

export function assertSeedFitStatuses(
  fits: SeedFit[],
  appBuildTask: { id: string; slug: string; status: string } | undefined,
  evidence?: WithdrawalEvidence,
) {
  assert.equal(fits.length, 7, 'All seven planned Tool Task Fit seed records must remain present.');
  const staleFits = fits.filter((fit) => fit.status === 'stale');
  assert.ok(
    fits.every((fit) => fit.status === 'reviewed' || fit.status === 'published' || fit.status === 'stale'),
    'Tool Task Fit seed must resolve to reviewed records or compatible pre-existing published records.',
  );
  for (const expected of withdrawnFits) {
    const fit = fits.find((row) => row.id === expected.id);
    assert.ok(fit, 'The CL-04 seed Fit must remain present');
    assert.equal(fit.task_id, manifest.taskId);
    assert.equal(fit.tool_id, expected.toolId);
  }
  if (staleFits.length === 0) return;

  assert.equal(manifest.operation, 'withdraw');
  assert.equal(manifest.fits.length, 2);
  assert.ok(manifest.fits.every((fit) => fit.status === 'reviewed'));
  assert.deepEqual(manifest.fits.map((fit) => fit.id).sort(), withdrawnFits.map((fit) => fit.id).sort());
  assert.equal(appBuildTask?.id, manifest.taskId, 'CL-04 stale Fits require the exact active Task');
  assert.equal(appBuildTask?.slug, 'build-app-with-ai');
  assert.equal(appBuildTask?.status, 'active');
  assert.deepEqual(
    staleFits.map((fit) => fit.id).sort(),
    withdrawnFits.map((fit) => fit.id).sort(),
    'Only the exact pair of CL-04 withdrawn Fits may be stale',
  );
  assert.ok(evidence, 'CL-04 stale Fits require retained evidence and withdrawal audit');
  const taskCapabilityIds = ['ai-assisted-app-development', 'developer-workflow-integration'].map(
    (slug) => evidence.capabilities.find((capability) => capability.slug === slug)?.id,
  );
  assert.ok(taskCapabilityIds.every(Boolean), 'CL-04 Capabilities must exist');
  assert.deepEqual(
    evidence.taskCapabilities
      .filter((row) => row.task_id === manifest.taskId)
      .map((row) => ({ capabilityId: row.capability_id, status: row.status }))
      .sort((a, b) => a.capabilityId.localeCompare(b.capabilityId)),
    taskCapabilityIds
      .map((capabilityId) => ({ capabilityId, status: 'reviewed' }))
      .sort((a, b) => a.capabilityId!.localeCompare(b.capabilityId!)),
    'CL-04 Task Capability relations must remain reviewed',
  );

  for (const expected of withdrawnFits) {
    const fit = staleFits.find((row) => row.id === expected.id)!;
    assert.equal(fit.task_id, manifest.taskId);
    assert.equal(fit.tool_id, expected.toolId);
    assert.ok(fit.last_edited_by, 'Withdrawn Fit must record its reviewer');
    assert.deepEqual(
      evidence.toolCapabilities.filter((row) => row.tool_id === expected.toolId),
      [
        {
          id: expected.toolCapabilityId,
          tool_id: expected.toolId,
          capability_id: taskCapabilityIds[1]!,
          status: 'reviewed',
        },
      ],
      'CL-04 Tool Capability relation must remain reviewed',
    );
    const profile = evidence.profiles.find((row) => row.owner_type === 'tool' && row.owner_id === expected.toolId);
    assert.ok(profile, 'Withdrawn Fit must retain its tool intelligence profile');
    assert.deepEqual(
      evidence.fitLinks.filter((link) => link.fit_id === fit.id),
      [{ fit_id: fit.id, claim_id: expected.claimId, purpose: 'fit' }],
      'Withdrawn Fit must retain its exact old evidence link',
    );
    const latest = evidence.audits
      .filter((row) => row.profile_id === profile.id)
      .sort((a, b) => Date.parse(b.occurred_at) - Date.parse(a.occurred_at))[0];
    assert.ok(latest, 'Withdrawn Fit must have a timeline audit');
    assert.equal(latest.event_type, 'decision_withdrawal');
    assert.equal(latest.review_scope, 'decision');
    assert.equal(latest.claim_type, 'decision_cluster');
    assert.equal(latest.claim_key, manifest.taskId);
    assert.equal(latest.visibility, 'internal');
    assert.equal(latest.old_value?.status, 'reviewed');
    assert.equal(latest.new_value?.status, 'stale');
    assert.equal(latest.verified_by, fit.last_edited_by);
    // Table triggers can timestamp the Fit and timeline row a few milliseconds apart.
    assert.ok(
      Math.abs(Date.parse(fit.updated_at) - Date.parse(latest.occurred_at)) <= 1000,
      'Fit update and withdrawal audit must occur within one second',
    );
    assert.ok(
      Math.abs(Date.parse(latest.verified_at) - Date.parse(latest.occurred_at)) <= 1000,
      'Withdrawal audit verification must occur within one second',
    );
    assert.equal(latest.metadata?.taskId, manifest.taskId);
    assert.equal(latest.metadata?.operation, 'withdraw');
    assert.equal(latest.metadata?.qaReference, manifest.qaReference);
    assert.deepEqual(latest.metadata?.fits, manifest.fits);
  }
}

export const cl04WithdrawalScope = {
  taskId: manifest.taskId,
  fitIds: withdrawnFits.map((fit) => fit.id),
  toolIds: withdrawnFits.map((fit) => fit.toolId),
};
