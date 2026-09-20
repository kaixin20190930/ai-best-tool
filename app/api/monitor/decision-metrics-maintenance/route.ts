import { NextRequest, NextResponse } from 'next/server';

import { getDecisionEventRuntimeConfig } from '@/lib/analytics/decisionEvents/ingest';
import {
  readDecisionMetricMaintenanceStatus,
  runDecisionMetricMaintenance,
} from '@/lib/analytics/decisionEvents/maintenance';
import { isMonitorRequestAuthorized } from '@/lib/monitor/auth';

export const dynamic = 'force-dynamic';

function isAuthorized(request: NextRequest) {
  return Boolean(process.env.MONITOR_API_TOKEN?.trim()) && isMonitorRequestAuthorized(request);
}

function responseBody(status: Awaited<ReturnType<typeof readDecisionMetricMaintenanceStatus>>) {
  const config = getDecisionEventRuntimeConfig();
  return {
    ok: status.freshnessStatus === 'fresh',
    status,
    gates: {
      collectionEnabled: config.collectionEnabled,
      internalTrafficExclusionReady: config.internalTokenHashes.length > 0,
      retentionApproved: config.retentionApproved,
      retentionDays: config.retentionDays,
    },
  };
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  try {
    const status = await readDecisionMetricMaintenanceStatus();
    return NextResponse.json(responseBody(status), {
      status: status.freshnessStatus === 'fresh' ? 200 : 503,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'Maintenance status unavailable' }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  try {
    const operation = await runDecisionMetricMaintenance();
    const status = await readDecisionMetricMaintenanceStatus();
    return NextResponse.json({ ...responseBody(status), operation }, {
      status: status.freshnessStatus === 'fresh' ? 200 : 503,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'Maintenance operation failed' }, { status: 500 });
  }
}
