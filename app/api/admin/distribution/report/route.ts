import { NextResponse } from 'next/server';

import { requireAdmin } from '@/lib/auth/middleware';
import { getAdminDistributionOverview } from '@/lib/services/admin/distribution';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const data = await getAdminDistributionOverview();
    const format = new URL(request.url).searchParams.get('format') || 'json';

    if (format === 'csv') {
      return new NextResponse(data.review?.csv || 'section,label,value\n', {
        headers: {
          'content-type': 'text/csv; charset=utf-8',
          'content-disposition': 'attachment; filename="distribution-review.csv"',
        },
      });
    }

    if (format === 'markdown' || format === 'md') {
      return new NextResponse(data.review?.markdown || '# Distribution weekly review\n', {
        headers: {
          'content-type': 'text/markdown; charset=utf-8',
          'content-disposition': 'attachment; filename="distribution-review.md"',
        },
      });
    }

    return NextResponse.json({
      summary: data.review?.summary || null,
      retention: data.review?.retention || null,
      outcomeLearning: data.review?.outcomeLearning || [],
      channelFeedback: data.review?.channelFeedback || [],
      liveChecks: data.review?.liveChecks || [],
      attributeChecks: data.review?.attributeChecks || [],
      projects: data.projects,
      recentIssues: data.recentIssues,
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Unable to generate distribution report.' }, { status: 403 });
  }
}
