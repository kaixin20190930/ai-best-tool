import { NextRequest, NextResponse } from 'next/server';

import {
  listDueCollectionSources,
  runCollectionSourceNow,
} from '@/lib/services/admin/collection';
import { sendTransactionalEmail } from '@/lib/services/mailer';

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
  const failures: Array<{
    sourceId: string;
    sourceName: string;
    error: string;
  }> = [];

  for (const source of sources) {
    try {
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
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown collection run error';
      failures.push({
        sourceId: source.id,
        sourceName: source.name,
        error: message,
      });
      runs.push({
        id: null,
        sourceId: source.id,
        sourceName: source.name,
        status: 'failed',
        foundCount: 0,
        importedCount: 0,
        skippedCount: 0,
        error: message,
      });
    }
  }

  if (failures.length > 0) {
    await sendCollectionFailureAlert({
      checkedAt: new Date().toISOString(),
      failures,
    });
  }

  return NextResponse.json({
    success: true,
    checkedAt: new Date().toISOString(),
    dueSources: sources.length,
    failedSources: failures.length,
    runs,
  });
}

function getAlertRecipients(): string[] {
  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  const contactEmail = process.env.CONTACT_US_EMAIL?.trim();

  return Array.from(new Set([...adminEmails, ...(contactEmail ? [contactEmail] : [])]));
}

async function sendCollectionFailureAlert(input: {
  checkedAt: string;
  failures: Array<{
    sourceId: string;
    sourceName: string;
    error: string;
  }>;
}) {
  const recipients = getAlertRecipients();
  if (recipients.length === 0) {
    return;
  }

  const lines = input.failures.map(
    (item) => `- ${item.sourceName} (${item.sourceId}): ${item.error}`
  );
  const text = [
    `[AI Best Tool] Collection run failures detected`,
    `Checked at: ${input.checkedAt}`,
    `Failed sources: ${input.failures.length}`,
    '',
    ...lines,
  ].join('\n');
  const html = `
    <p><strong>[AI Best Tool] Collection run failures detected</strong></p>
    <p>Checked at: ${input.checkedAt}</p>
    <p>Failed sources: ${input.failures.length}</p>
    <ul>
      ${input.failures
        .map((item) => `<li>${item.sourceName} (${item.sourceId}): ${item.error}</li>`)
        .join('')}
    </ul>
  `;

  for (const to of recipients) {
    await sendTransactionalEmail({
      to,
      subject: `[AI Best Tool] Collection failures (${input.failures.length})`,
      text,
      html,
    });
  }
}

export async function GET(request: NextRequest) {
  return handleRunDue(request);
}

export async function POST(request: NextRequest) {
  return handleRunDue(request);
}
