import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/db/neon/client';

function isAuthorized(request: NextRequest) {
  const token = process.env.MONITOR_API_TOKEN;

  if (!token) {
    return true;
  }

  return request.headers.get('authorization') === `Bearer ${token}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
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
