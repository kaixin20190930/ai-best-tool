import { NextRequest, NextResponse } from 'next/server';
import { sendClaimInvitesBySystem } from '@/app/actions/admin/tools';
import { isMonitorRequestAuthorized } from '@/lib/monitor/auth';

export async function GET(request: NextRequest) {
  if (!isMonitorRequestAuthorized(request)) {
    return NextResponse.json(
      { ok: false, error: 'Unauthorized: missing or invalid MONITOR_API_TOKEN' },
      { status: 401 }
    );
  }

  const result = await sendClaimInvitesBySystem();
  if (!result.success) {
    return NextResponse.json(
      { ok: false, error: result.error || 'Claim invite job failed', sent: 0, skipped: 0 },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, sent: result.sent, skipped: result.skipped });
}
