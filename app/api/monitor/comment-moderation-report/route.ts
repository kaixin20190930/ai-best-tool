import { NextRequest, NextResponse } from 'next/server';
import { sendCommentModerationDailyReportBySystem } from '@/app/actions/admin/comments';

function isAuthorized(request: NextRequest) {
  const token = process.env.MONITOR_API_TOKEN;
  if (!token) return true;
  return request.headers.get('authorization') === `Bearer ${token}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
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
