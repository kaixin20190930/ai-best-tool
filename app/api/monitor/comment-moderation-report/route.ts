import { NextRequest, NextResponse } from 'next/server';
import { sendCommentModerationDailyReportBySystem } from '@/app/actions/admin/comments';
import { isMonitorRequestAuthorized } from '@/lib/monitor/auth';

export async function GET(request: NextRequest) {
  if (!isMonitorRequestAuthorized(request)) {
    return NextResponse.json(
      { ok: false, error: 'Unauthorized: missing or invalid MONITOR_API_TOKEN' },
      { status: 401 }
    );
  }

  const result = await sendCommentModerationDailyReportBySystem();
  if (!result.success) {
    return NextResponse.json(
      { ok: false, error: result.error || 'Failed to send report', skipped: result.skipped || false },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, status: 'sent' });
}
