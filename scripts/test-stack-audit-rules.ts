import assert from 'node:assert/strict';

import type {
  DecisionEvidenceBundle,
  DecisionEvidenceReference,
  DerivedToolDecisionProfile,
  DerivedToolTaskFit,
} from '@/lib/services/decision/evidence';
import { buildStackAuditFindings, type StackAuditItemInput } from '@/lib/services/stack/audit';

const reference = (claimId: string): DecisionEvidenceReference => ({
  claimId,
  claimType: 'feature',
  claimKey: `feature:${claimId}`,
  claimValue: { supported: true },
  sourceUrl: `https://example.com/${claimId}`,
  sourceExcerpt: 'Verified product evidence.',
  observedAt: '2026-09-01T00:00:00.000Z',
  verifiedAt: '2026-09-01T00:00:00.000Z',
  reviewDueAt: '2026-12-01T00:00:00.000Z',
  expiresAt: null,
  validityScope: {},
  canSupportDecision: true,
  exclusionReason: null,
  purpose: 'fit',
});

const profile = (toolId: string): DerivedToolDecisionProfile => ({
  toolId,
  profileVersion: 1,
  setupComplexity: 'unknown',
  setupMinutesLow: null,
  setupMinutesHigh: null,
  dataTrainingUse: 'unknown',
  selfHostLevel: 'unknown',
  exportLevel: 'unknown',
  decisionSummary: {},
  watchOuts: [],
  reviewedAt: '2026-09-01T00:00:00.000Z',
  reviewDueAt: '2026-12-01T00:00:00.000Z',
  evidenceState: 'supported',
  evidence: [reference(`profile-${toolId}`)],
  excludedEvidence: [],
});

const fit = (id: string, toolId: string, taskId: string, fitLevel: DerivedToolTaskFit['fitLevel']): DerivedToolTaskFit => ({
  id,
  toolId,
  taskId,
  fitLevel,
  rationale: {},
  requiredConditions: [],
  disqualifiers: [],
  reviewedAt: '2026-09-01T00:00:00.000Z',
  reviewDueAt: '2026-12-01T00:00:00.000Z',
  evidenceState: 'supported',
  evidence: [reference(`fit-${id}`)],
  excludedEvidence: [],
});

const evidence: DecisionEvidenceBundle = {
  available: true,
  generatedAt: '2026-09-03T00:00:00.000Z',
  profiles: ['tool-a', 'tool-b', 'tool-c', 'tool-d'].map(profile),
  taskFits: [
    fit('fit-a', 'tool-a', 'task-1', 'strong'),
    fit('fit-b', 'tool-b', 'task-1', 'weak'),
    fit('fit-c', 'tool-c', 'task-1', 'strong'),
    fit('fit-d', 'tool-d', 'task-2', 'strong'),
  ],
  relationships: [],
};

const items: StackAuditItemInput[] = [
  {
    id: 'item-a', toolId: 'tool-a', title: 'Tool A', subscriptionStatus: 'paid', monthlyCost: 20,
    currency: 'USD', usageFrequency: 'daily', dataSensitivity: 'low', taskId: 'task-1',
  },
  {
    id: 'item-b', toolId: 'tool-b', title: 'Tool B', subscriptionStatus: 'paid', monthlyCost: 30,
    currency: 'USD', usageFrequency: 'weekly', dataSensitivity: 'low', taskId: 'task-1',
  },
  {
    id: 'item-c', toolId: null, title: 'Old Custom Tool', subscriptionStatus: 'cancelled', monthlyCost: 9,
    currency: 'USD', usageFrequency: 'never', dataSensitivity: 'low', taskId: null,
  },
];

const findings = buildStackAuditFindings({
  items,
  targetTaskIds: ['task-1', 'task-2'],
  evidence,
  toolNames: { 'tool-a': 'Tool A', 'tool-b': 'Tool B', 'tool-c': 'Tool C', 'tool-d': 'Tool D' },
});

assert.deepEqual(new Set(findings.map((finding) => finding.findingType)), new Set(['keep', 'replace', 'remove', 'missing']));
assert.equal(findings.filter((finding) => finding.stackItemId === 'item-b').length, 1);
assert.equal(findings.find((finding) => finding.findingType === 'replace')?.relatedToolId, 'tool-a');
assert.equal(findings.find((finding) => finding.findingType === 'missing')?.relatedToolId, 'tool-d');
assert.equal(findings.find((finding) => finding.findingType === 'remove')?.estimatedMonthlySavings, 9);
assert.ok(findings.every((finding) => finding.rationale.reasonCodes.length > 0));
assert.ok(findings.every((finding) => finding.rationale.actionBoundary === 'recommendation_only'));
assert.ok(findings.find((finding) => finding.findingType === 'keep')?.evidence.length);

console.log(JSON.stringify({ success: true, findingTypes: 4, deterministic: true, autoCancellation: false }, null, 2));
