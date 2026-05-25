import { NextRequest, NextResponse } from 'next/server';
import { cleanupExpiredSponsoredPlacementsBySystem } from '@/app/actions/admin/tools';

function isAuthorized(request: NextRequest) {
  const token = process.env.MONITOR_API_TOKEN;
  if (!token) return true;
  return request.headers.get('authorization') === `Bearer ${token}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
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
