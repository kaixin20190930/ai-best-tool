import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/db/neon/client';
import { isMonitorRequestAuthorized } from '@/lib/monitor/auth';

export async function GET(request: NextRequest) {
  if (!isMonitorRequestAuthorized(request)) {
    return NextResponse.json(
      { ok: false, error: 'Unauthorized: missing or invalid MONITOR_API_TOKEN' },
      { status: 401 }
    );
  }

  const checkedAt = new Date().toISOString();

  try {
    await query('SELECT 1');
    return NextResponse.json(
      {
        ok: true,
        status: 'ok',
        checkedAt,
        services: {
          app: 'ok',
          database: 'ok',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        status: 'degraded',
        checkedAt,
        services: {
          app: 'ok',
          database: 'error',
        },
        error: error instanceof Error ? error.message : 'Monitor check failed',
      },
      { status: 503 }
    );
  }
}
