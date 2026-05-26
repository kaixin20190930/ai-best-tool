import { NextRequest, NextResponse } from 'next/server';
import { cleanupExpiredSponsoredPlacementsBySystem } from '@/app/actions/admin/tools';
import { isMonitorRequestAuthorized } from '@/lib/monitor/auth';

export async function GET(request: NextRequest) {
  if (!isMonitorRequestAuthorized(request)) {
    return NextResponse.json(
      { ok: false, error: 'Unauthorized: missing or invalid MONITOR_API_TOKEN' },
      { status: 401 }
    );
  }

  const result = await cleanupExpiredSponsoredPlacementsBySystem();
  if (!result.success) {
    return NextResponse.json(
      { ok: false, error: result.error || 'Cleanup failed', updated: 0 },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, updated: result.updated });
}
