import { createDecisionInternalTrafficToken } from '../lib/analytics/decisionEvents/internalTraffic';

const generated = createDecisionInternalTrafficToken();
const createdAt = new Date();
const rotationDueAt = new Date(createdAt.getTime() + 30 * 24 * 60 * 60 * 1000);

console.log(
  JSON.stringify(
    {
      warning: 'Store the raw token securely. Add only sha256Hash to DECISION_EVENT_INTERNAL_TOKEN_HASHES.',
      token: generated.token,
      sha256Hash: generated.sha256Hash,
      createdAt: createdAt.toISOString(),
      rotationDueAt: rotationDueAt.toISOString(),
    },
    null,
    2,
  ),
);
