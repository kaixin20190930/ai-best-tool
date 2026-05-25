import { NextResponse } from 'next/server';
import { query } from '@/db/neon/client';

export async function GET() {
  const checkedAt = new Date().toISOString();

  try {
    await query('SELECT 1');

    return NextResponse.json(
      {
        ok: true,
        status: 'healthy',
        checkedAt,
        services: {
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
          database: 'error',
        },
        error: error instanceof Error ? error.message : 'Health check failed',
      },
      { status: 503 }
    );
  }
}
