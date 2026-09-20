'use server';

/* eslint-disable import/prefer-default-export */
import { headers } from 'next/headers';

import { ingestDecisionEvent } from '@/lib/analytics/decisionEvents/ingest';
import { createDecisionEventRepository } from '@/lib/analytics/decisionEvents/repository';

export async function collectDecisionMetricEvent(payload: unknown) {
  const requestHeaders = await headers();
  return ingestDecisionEvent({
    payload,
    context: {
      host: requestHeaders.get('host'),
      userAgent: requestHeaders.get('user-agent'),
      deploymentEnvironment: process.env.VERCEL_ENV || process.env.NODE_ENV,
      requestPurpose: requestHeaders.get('x-abt-request-purpose'),
      internalTrafficToken: requestHeaders.get('x-abt-internal-traffic'),
      path: requestHeaders.get('x-matched-path'),
    },
    repository: createDecisionEventRepository(),
  });
}
