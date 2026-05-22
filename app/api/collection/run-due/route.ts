import { NextRequest, NextResponse } from 'next/server';

import {
  listDueCollectionSources,
  runCollectionSourceNow,
} from '@/lib/services/admin/collection';

const DEFAULT_LIMIT = 10;

function isAuthorized(request: NextRequest) {
  const secret = process.env.COLLECTION_CRON_SECRET;

  if (!secret) {
    return process.env.NODE_ENV !== 'production';
  }

  return request.headers.get('authorization') === `Bearer ${secret}`;
}

async function handleRunDue(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const limitParam = request.nextUrl.searchParams.get('limit');
  const limit = limitParam
    ? Math.min(Math.max(Number.parseInt(limitParam, 10) || DEFAULT_LIMIT, 1), 50)
    : DEFAULT_LIMIT;

  const sources = await listDueCollectionSources(limit);
  const runs = [];

  for (const source of sources) {
    const run = await runCollectionSourceNow(source.id, 'scheduled');
    runs.push({
      id: run.id,
      sourceId: source.id,
      sourceName: source.name,
      status: run.status,
      foundCount: run.found_count,
      importedCount: run.imported_count,
      skippedCount: run.skipped_count,
    });
  }

  return NextResponse.json({
    success: true,
    checkedAt: new Date().toISOString(),
    dueSources: sources.length,
    runs,
  });
}

export async function GET(request: NextRequest) {
  return handleRunDue(request);
}

export async function POST(request: NextRequest) {
  return handleRunDue(request);
}
