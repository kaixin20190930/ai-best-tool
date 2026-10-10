import { createHash } from 'node:crypto';
import path from 'node:path';

import {
  createGoogleSearchConsoleClient,
  createRefreshTokenAccessTokenProvider,
} from '../lib/integrations/google-search-console';
import writeGscOutput from '../lib/integrations/gsc-output-safety';
import {
  collectGscSearchAnalytics,
  renderGscSearchAnalyticsReport,
} from '../lib/integrations/gsc-search-analytics-report';

function summaryOutputPath(argv: string[]): string | null {
  if (argv.length === 0) return null;
  if (argv.length !== 2 || argv[0] !== '--summary-out') {
    throw new Error('Usage: pnpm run gsc:fetch-readonly [--summary-out docs/REPORT.md]');
  }
  const root = path.resolve(process.cwd(), 'docs');
  const target = path.resolve(process.cwd(), argv[1]);
  if (!target.startsWith(`${root}${path.sep}`) || path.extname(target) !== '.md') {
    throw new Error('--summary-out must be a Markdown file inside docs/.');
  }
  return target;
}

async function main() {
  const summaryPath = summaryOutputPath(process.argv.slice(2));
  const required = ['GSC_CLIENT_ID', 'GSC_CLIENT_SECRET', 'GSC_REFRESH_TOKEN', 'GSC_PROPERTY_URL'] as const;
  const missing = required.filter((key) => !process.env[key]?.trim());
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
  const propertyUrl = process.env.GSC_PROPERTY_URL!.trim();
  if (!propertyUrl.startsWith('sc-domain:') && !/^https?:\/\//.test(propertyUrl)) {
    throw new Error('GSC_PROPERTY_URL must be sc-domain:example.com or an exact URL-prefix property.');
  }
  const client = createGoogleSearchConsoleClient({
    propertyUrl,
    accessTokenProvider: createRefreshTokenAccessTokenProvider({
      clientId: process.env.GSC_CLIENT_ID!,
      clientSecret: process.env.GSC_CLIENT_SECRET!,
      refreshToken: process.env.GSC_REFRESH_TOKEN!,
    }),
  });
  const snapshot = await collectGscSearchAnalytics(client, propertyUrl);
  const propertyKey = createHash('sha256').update(propertyUrl).digest('hex').slice(0, 12);
  const outputDir = path.join('.local', 'gsc', propertyKey);
  const baseName = `search-analytics-${snapshot.latestCompleteDate}`;
  const snapshotPath = await writeGscOutput(
    process.cwd(),
    path.join(outputDir, `${baseName}.json`),
    `${JSON.stringify(snapshot, null, 2)}\n`,
    'private',
  );
  const localReportPath = await writeGscOutput(
    process.cwd(),
    path.join(outputDir, `${baseName}.md`),
    renderGscSearchAnalyticsReport(snapshot, true),
    'private',
  );
  if (summaryPath) {
    await writeGscOutput(process.cwd(), summaryPath, renderGscSearchAnalyticsReport(snapshot, false), 'summary');
  }
  process.stdout.write(`GSC read-only snapshot: ${snapshotPath}\n`);
  process.stdout.write(`GSC local report: ${localReportPath}\n`);
  process.stdout.write(`Latest complete date: ${snapshot.latestCompleteDate}\n`);
  if (summaryPath) process.stdout.write(`Aggregate docs summary: ${summaryPath}\n`);
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : 'GSC read-only fetch failed.'}\n`);
  process.exitCode = 1;
});
