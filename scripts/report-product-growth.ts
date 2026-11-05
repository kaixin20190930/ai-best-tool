import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { loadEnvConfig } from '@next/env';

import writeGscOutput from '../lib/integrations/gsc-output-safety';
import type { GscSearchAnalyticsSnapshot } from '../lib/integrations/gsc-search-analytics-report';
import { buildGrowthScoreboard } from '../lib/seo/productGrowthScoreboard';

loadEnvConfig(process.cwd());
async function main() {
  if (process.argv.slice(2).some((a) => a !== '--summary' && a !== '--'))
    throw new Error('Only --summary is supported.');
  const property = process.env.GSC_PROPERTY_URL?.trim();
  if (!property) throw new Error('GSC_PROPERTY_URL is required; never choose another project snapshot.');
  const key = createHash('sha256').update(property).digest('hex').slice(0, 12);
  const directory = path.join('.local', 'gsc', key);
  const files = (await readdir(directory)).filter((f) => /^search-analytics-\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort();
  const file = files.at(-1);
  if (!file) throw new Error('No successful GSC snapshot exists.');
  const snapshot = JSON.parse(await readFile(path.join(directory, file), 'utf8')) as GscSearchAnalyticsSnapshot;
  if (snapshot.propertyUrl !== property) throw new Error('Snapshot property mismatch.');
  const releaseState = JSON.parse(await readFile('reports/seo/product-growth-releases.json', 'utf8')) as {
    activeCluster: string;
    stage: string;
    lindy: { status: string };
    make: { status: string };
    releases: { releasedOn: string; contentCooldownUntil: string }[];
  };
  const publicationDate = releaseState.releases
    .map((r) => r.releasedOn)
    .sort()
    .at(-1)!;
  const generatedAt = new Date().toISOString();
  const ageDays = Math.floor((Date.now() - Date.parse(snapshot.latestCompleteDate + 'T00:00:00Z')) / 86400000);
  const report = {
    generatedAt,
    source: file,
    latestCompleteDate: snapshot.latestCompleteDate,
    firstIncompleteDate: snapshot.firstIncompleteDate,
    dataStatus: ageDays > 3 ? 'stale' : 'available',
    publicationDate,
    stage: releaseState.stage,
    postReleaseEvidence:
      snapshot.latestCompleteDate >= publicationDate
        ? 'requires release-window verification'
        : 'unavailable; pre-release snapshot only',
    days7: buildGrowthScoreboard(snapshot.periods.days7),
    days28: buildGrowthScoreboard(snapshot.periods.days28),
  };
  const target = await writeGscOutput(
    process.cwd(),
    path.join(directory, 'product-growth-latest.json'),
    JSON.stringify(report, null, 2) + '\n',
    'private',
  );
  const value = (n: number | null) => (n === null ? 'unavailable' : String(n));
  const percent = (n: number | null) => (n === null ? 'unavailable' : (n * 100).toFixed(2) + '%');
  const lines = [
    '# 产品增长周报',
    '',
    '生成时间：' + generatedAt,
    'GSC 最新最终日期：' + snapshot.latestCompleteDate + '（Pacific Time）',
    '数据状态：' + report.dataStatus + '。发布后证据：' + report.postReleaseEvidence + '。',
    '',
    '结果只基于可见查询行；不能当作全站非品牌总量。匿名查询和 API 截断不填零。',
    '',
    '| 窗口 | 合格点击 | 合格曝光 | CTR | Top 20 决策簇（Automation） | 相关曝光页面（Automation） |',
    '| --- | ---: | ---: | ---: | ---: | ---: |',
  ];
  for (const s of [report.days7, report.days28])
    lines.push(
      '| ' +
        [
          s.window.startDate + ' 至 ' + s.window.endDate,
          s.outcome.clicks,
          s.outcome.impressions,
          percent(s.outcome.ctr),
          s.top20DecisionClusters,
          value(s.relevantExposedPages),
        ].join(' | ') +
        ' |',
    );
  lines.push(
    '',
    'n8n pricing/cost/plans 28 天：' +
      report.days28.n8nPricing.clicks +
      ' 点击 / ' +
      report.days28.n8nPricing.impressions +
      ' 曝光 / CTR ' +
      percent(report.days28.n8nPricing.ctr) +
      '。',
    '',
    'Compare next / Evidence / outbound / 可归因自然搜索决策访问：unavailable。已有事件采集能力不等于完成可归因报表。',
    '页面×查询缺失时，相关曝光页/查询簇标为 unavailable；页面总曝光不能证明相关查询。',
    'Top 20 仅统计 Automation 映射的 n8n/Make/Lindy 决策簇；其余查询未完成实体映射，不混成一个簇。',
    'Quality / Freshness 以同次生产检查和关键 Claim 审计为准，不能用历史账本代替。',
    '',
    '当前唯一 Cluster：' +
      releaseState.activeCluster +
      '；阶段：' +
      releaseState.stage +
      '；Lindy：' +
      releaseState.lindy.status +
      '；Make：' +
      releaseState.make.status +
      '。',
    '内容冷却以发布清单为准。下一步依据最新数据和阶段门禁，由 Cluster 复盘确定；数据过期先恢复读取。报告不触发新页、索引切换或标题修改。',
    '',
  );
  await writeGscOutput(process.cwd(), path.join(directory, 'product-growth-latest.md'), lines.join('\n'), 'private');
  if (process.argv.includes('--summary'))
    await writeGscOutput(process.cwd(), 'docs/PRODUCT_GROWTH_WEEKLY_REPORT_CN.md', lines.join('\n'), 'summary');
  console.log(
    JSON.stringify({
      privateReport: target,
      latestCompleteDate: report.latestCompleteDate,
      dataStatus: report.dataStatus,
      postReleaseEvidence: report.postReleaseEvidence,
    }),
  );
}
main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Growth report failed');
  process.exitCode = 1;
});
