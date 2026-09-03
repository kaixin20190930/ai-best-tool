import { NextRequest, NextResponse } from 'next/server';

import { sendTrialRemindersBySystem } from '@/app/actions/trials';
import { isMonitorRequestAuthorized } from '@/lib/monitor/auth';

export async function GET(request: NextRequest) {
  if (!isMonitorRequestAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  const result = await sendTrialRemindersBySystem();
  return NextResponse.json(
    { ok: result.success, sent: result.sent, skipped: result.skipped, error: result.error },
    { status: result.success ? 200 : 500 },
  );
}
