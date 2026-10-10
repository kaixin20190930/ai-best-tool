import assert from 'node:assert/strict';

import {
  createGoogleSearchConsoleClient,
  createRefreshTokenAccessTokenProvider,
  type SearchAnalyticsRequest,
  type SearchAnalyticsRow,
} from '../lib/integrations/google-search-console';
import {
  collectGscSearchAnalytics,
  pacificToday,
  renderGscSearchAnalyticsReport,
} from '../lib/integrations/gsc-search-analytics-report';

const originalFetch = globalThis.fetch;
const propertyUrl = 'sc-domain:aibesttool.com';
const requests: Array<{ url: string; method: string; body: SearchAnalyticsRequest | null }> = [];

function row(key: string, clicks = 2): SearchAnalyticsRow {
  return { keys: [key], clicks, impressions: 10, ctr: clicks / 10, position: 4 };
}

globalThis.fetch = async (input, init) => {
  const url = String(input);
  const method = init?.method || 'GET';
  if (url === 'https://oauth2.googleapis.com/token') {
    assert.equal(method, 'POST');
    assert.match(String(init?.body), /grant_type=refresh_token/);
    return Response.json({ access_token: 'test-token' });
  }
  const body = init?.body ? (JSON.parse(String(init.body)) as SearchAnalyticsRequest) : null;
  requests.push({ url, method, body });
  assert.equal((init?.headers as Record<string, string>).Authorization, 'Bearer test-token');
  assert.ok(url.includes(encodeURIComponent(propertyUrl)));
  if (url.endsWith(encodeURIComponent(propertyUrl))) {
    assert.equal(method, 'GET');
    return Response.json({ siteUrl: propertyUrl, permissionLevel: 'siteRestrictedUser' });
  }
  assert.equal(method, 'POST');
  assert.ok(url.endsWith('/searchAnalytics/query'));
  if (body?.dataState === 'all') {
    return Response.json({
      rows: [row('2026-10-07'), row('2026-10-08')],
      metadata: { first_incomplete_date: '2026-10-08' },
    });
  }
  if (body?.dimensions?.[0] === 'date' && body.startDate === '2026-09-05') {
    return Response.json({ rows: [row('2026-10-07'), row('2026-10-08')] });
  }
  if (!body?.dimensions) return Response.json({ rows: [{ clicks: 10, impressions: 100, ctr: 0.1, position: 5 }] });
  if (body.dimensions[0] === 'page' && body.startDate === '2026-10-01' && body.startRow === 0) {
    return Response.json({ rows: Array.from({ length: 25_000 }, (_, index) => row(`https://example.com/${index}`)) });
  }
  if (body.dimensions[0] === 'page' && body.startDate === '2026-10-01' && body.startRow === 25_000) {
    return Response.json({ rows: [row('https://example.com/last')] });
  }
  return Response.json({ rows: [row(body.dimensions[0] === 'query' ? 'private search query' : '2026-10-07')] });
};

async function main() {
  try {
    assert.equal(pacificToday(new Date('2026-10-10T01:00:00Z')), '2026-10-09');
    const client = createGoogleSearchConsoleClient({
      propertyUrl,
      accessTokenProvider: createRefreshTokenAccessTokenProvider({
        clientId: 'id',
        clientSecret: 'secret',
        refreshToken: 'refresh',
      }),
    });
    const snapshot = await collectGscSearchAnalytics(client, propertyUrl, new Date('2026-10-10T12:00:00Z'));
    assert.equal(snapshot.latestCompleteDate, '2026-10-07');
    assert.equal(snapshot.firstIncompleteDate, '2026-10-08');
    assert.equal(snapshot.periods.days7.startDate, '2026-10-01');
    assert.equal(snapshot.periods.days28.startDate, '2026-09-10');
    assert.equal(snapshot.periods.days7.breakdowns.page.rows.length, 25_001);
    assert.equal(snapshot.periods.days7.breakdowns.page.capped, false);
    assert.equal(snapshot.periods.days7.breakdowns.query.topRowsOnly, true);
    assert.equal(snapshot.periods.days7.totals?.clicks, 10);
    const publicReport = renderGscSearchAnalyticsReport(snapshot, false);
    const localReport = renderGscSearchAnalyticsReport(snapshot, true);
    assert.ok(!publicReport.includes('private search query'));
    assert.ok(localReport.includes('private search query'));
    assert.ok(requests.every((request) => request.method === 'GET' || request.method === 'POST'));
    assert.ok(
      requests
        .filter((request) => request.url.endsWith('/searchAnalytics/query'))
        .every((request) => !request.body?.rowLimit || request.body.rowLimit <= 25_000),
    );
    assert.ok(
      requests
        .filter((request) => request.url.endsWith('/searchAnalytics/query'))
        .every((request) => request.body?.type === 'web'),
    );
    await assert.rejects(
      client.querySearchAnalytics({ startDate: '2026-10-01', endDate: '2026-10-07', rowLimit: 25_001 }),
    );
    globalThis.fetch = async (input) =>
      String(input).includes('/token')
        ? Response.json({ access_token: 'test-token' })
        : new Response('forbidden', { status: 403 });
    await assert.rejects(client.getProperty(), /property access check failed \(403\)/);
    await assert.rejects(
      collectGscSearchAnalytics(
        {
          getProperty: async () => ({ siteUrl: propertyUrl, permissionLevel: 'siteRestrictedUser' }),
          querySearchAnalytics: async () => ({ rows: [], metadata: { first_incomplete_date: '2026-10-08' } }),
        },
        propertyUrl,
        new Date('2026-10-10T12:00:00Z'),
      ),
      /No complete Search Analytics date/,
    );
    process.stdout.write('GSC read-only collection, boundary, pagination, and report tests passed.\n');
  } finally {
    globalThis.fetch = originalFetch;
  }
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
  process.exitCode = 1;
});
