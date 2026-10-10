import type {
  GoogleSearchConsoleProperty,
  SearchAnalyticsDimension,
  SearchAnalyticsRequest,
  SearchAnalyticsResponse,
  SearchAnalyticsRow,
} from './google-search-console';

const PAGE_SIZE = 25_000;
const MAX_BREAKDOWN_ROWS = 50_000;

export type ReadonlySearchAnalyticsClient = {
  getProperty(): Promise<GoogleSearchConsoleProperty>;
  querySearchAnalytics(request: SearchAnalyticsRequest): Promise<SearchAnalyticsResponse>;
};

export type GscPeriod = {
  startDate: string;
  endDate: string;
  totals: SearchAnalyticsRow | null;
  breakdowns: Record<
    SearchAnalyticsDimension,
    {
      rows: SearchAnalyticsRow[];
      capped: boolean;
      topRowsOnly: boolean;
    }
  >;
};

export type GscSearchAnalyticsSnapshot = {
  schemaVersion: 1;
  propertyUrl: string;
  permissionLevel: string;
  searchType: 'web';
  latestCompleteDate: string;
  firstIncompleteDate: string | null;
  source: 'Google Search Console Search Analytics API';
  caveats: string[];
  periods: { days7: GscPeriod; days28: GscPeriod };
};

function shiftDate(date: string, days: number): string {
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    throw new Error(`Invalid date: ${date}`);
  }
  parsed.setUTCDate(parsed.getUTCDate() + days);
  return parsed.toISOString().slice(0, 10);
}

export function pacificToday(now: Date): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const value = (type: string) => parts.find((part) => part.type === type)?.value;
  return `${value('year')}-${value('month')}-${value('day')}`;
}

function ensureRows(response: SearchAnalyticsResponse): SearchAnalyticsRow[] {
  const rows = response.rows || [];
  rows.forEach((row) => {
    if (
      !Number.isFinite(row.clicks) ||
      !Number.isFinite(row.impressions) ||
      !Number.isFinite(row.ctr) ||
      !Number.isFinite(row.position)
    ) {
      throw new Error('Search Analytics returned an invalid metric row.');
    }
  });
  return rows;
}

async function breakdown(
  client: ReadonlySearchAnalyticsClient,
  startDate: string,
  endDate: string,
  dimension: SearchAnalyticsDimension,
): Promise<GscPeriod['breakdowns'][SearchAnalyticsDimension]> {
  async function fetchPage(
    startRow: number,
    rows: SearchAnalyticsRow[],
  ): Promise<GscPeriod['breakdowns'][SearchAnalyticsDimension]> {
    const response = await client.querySearchAnalytics({
      startDate,
      endDate,
      type: 'web',
      dimensions: [dimension],
      dataState: 'final',
      rowLimit: PAGE_SIZE,
      startRow,
    });
    const page = ensureRows(response);
    const nextRows = rows.concat(page);
    if (page.length < PAGE_SIZE) {
      return { rows: nextRows, capped: false, topRowsOnly: dimension !== 'date' };
    }
    if (startRow + PAGE_SIZE >= MAX_BREAKDOWN_ROWS) {
      return { rows: nextRows, capped: true, topRowsOnly: dimension !== 'date' };
    }
    return fetchPage(startRow + PAGE_SIZE, nextRows);
  }
  return fetchPage(0, []);
}

async function collectPeriod(client: ReadonlySearchAnalyticsClient, endDate: string, days: number): Promise<GscPeriod> {
  const startDate = shiftDate(endDate, 1 - days);
  const totalsResponse = await client.querySearchAnalytics({
    startDate,
    endDate,
    type: 'web',
    dataState: 'final',
  });
  const totalsRows = ensureRows(totalsResponse);
  if (totalsRows.length > 1) {
    throw new Error('Search Analytics returned multiple rows for property totals.');
  }
  return {
    startDate,
    endDate,
    totals: totalsRows[0] || null,
    breakdowns: {
      date: await breakdown(client, startDate, endDate, 'date'),
      page: await breakdown(client, startDate, endDate, 'page'),
      query: await breakdown(client, startDate, endDate, 'query'),
    },
  };
}

export async function collectGscSearchAnalytics(
  client: ReadonlySearchAnalyticsClient,
  propertyUrl: string,
  now = new Date(),
): Promise<GscSearchAnalyticsSnapshot> {
  const property = await client.getProperty();
  if (property.siteUrl !== propertyUrl) {
    throw new Error('GSC returned a different property from the requested property.');
  }
  const yesterday = shiftDate(pacificToday(now), -1);
  const discoveryStart = shiftDate(yesterday, -34);
  const discoveryRequest = {
    startDate: discoveryStart,
    endDate: yesterday,
    type: 'web' as const,
    dimensions: ['date' as const],
  };
  const [fresh, final] = await Promise.all([
    client.querySearchAnalytics({ ...discoveryRequest, dataState: 'all' }),
    client.querySearchAnalytics({ ...discoveryRequest, dataState: 'final' }),
  ]);
  const firstIncompleteDate = fresh.metadata?.first_incomplete_date || null;
  const finalDates = ensureRows(final)
    .map((row) => row.keys?.[0])
    .filter((date): date is string => Boolean(date && /^\d{4}-\d{2}-\d{2}$/.test(date)))
    .filter((date) => date <= yesterday && (!firstIncompleteDate || date < firstIncompleteDate))
    .sort();
  const latestCompleteDate = finalDates.at(-1);
  if (!latestCompleteDate) {
    throw new Error('No complete Search Analytics date found in the last 35 days.');
  }

  return {
    schemaVersion: 1,
    propertyUrl,
    permissionLevel: property.permissionLevel,
    searchType: 'web',
    latestCompleteDate,
    firstIncompleteDate,
    source: 'Google Search Console Search Analytics API',
    caveats: [
      'Dates are Google Search Console Pacific Time; date groups omit days with no data.',
      'Page and query breakdowns contain top rows only; pagination does not guarantee completeness or recover anonymized queries.',
      'Search Analytics does not provide aggregate Coverage/indexing counts. Continue the manual Coverage XLSX workflow.',
    ],
    periods: {
      days7: await collectPeriod(client, latestCompleteDate, 7),
      days28: await collectPeriod(client, latestCompleteDate, 28),
    },
  };
}

function formatTotals(period: GscPeriod): string {
  const { clicks = 0, impressions = 0, ctr = 0, position = 0 } = period.totals || {};
  return `| ${period.startDate} to ${period.endDate} | ${clicks} | ${impressions} | ${(ctr * 100).toFixed(2)}% | ${position.toFixed(2)} |`;
}

export function renderGscSearchAnalyticsReport(
  snapshot: GscSearchAnalyticsSnapshot,
  includePrivateRows: boolean,
): string {
  const lines = [
    '# GSC Search Analytics read-only report',
    '',
    `Property: ${snapshot.propertyUrl}`,
    `Latest complete date (Pacific Time): ${snapshot.latestCompleteDate}`,
    `First incomplete date: ${snapshot.firstIncompleteDate || 'not returned'}`,
    '',
    '| Period | Clicks | Impressions | CTR | Average position |',
    '| --- | ---: | ---: | ---: | ---: |',
    formatTotals(snapshot.periods.days7),
    formatTotals(snapshot.periods.days28),
    '',
    'Page/query rows are top rows, not exhaustive. Aggregate Coverage is unavailable through this API.',
  ];
  if (includePrivateRows) {
    Object.entries(snapshot.periods).forEach(([name, period]) => {
      lines.push('', `## ${name} breakdown`);
      (['page', 'query', 'date'] as const).forEach((dimension) => {
        const detail = period.breakdowns[dimension];
        lines.push(
          `- ${dimension}: ${detail.rows.length} rows${detail.capped ? ' (local row cap reached)' : ''}${detail.topRowsOnly ? '; top rows only' : ''}`,
        );
        detail.rows.slice(0, 10).forEach((row) => {
          lines.push(
            `  - ${JSON.stringify(row.keys?.[0] || '')}: ${row.clicks} clicks / ${row.impressions} impressions`,
          );
        });
      });
    });
  }
  return `${lines.join('\n')}\n`;
}
