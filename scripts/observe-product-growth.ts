import { readdir, readFile } from 'node:fs/promises';
import { loadEnvConfig } from '@next/env';

import writeGscOutput from '../lib/integrations/gsc-output-safety';
import {
  reconcileGrowthMilestones,
  updateGrowthObservationDocument,
  type GrowthRelease,
} from '../lib/seo/productGrowthMilestones';

loadEnvConfig(process.cwd());
async function main() {
  if (process.argv.length > 2) throw new Error('Observation takes no arguments and never changes indexing.');
  const root = process.cwd();
  const manifest = JSON.parse(await readFile('reports/seo/product-growth-releases.json', 'utf8')) as {
    releases: GrowthRelease[];
    milestoneDays: number[];
  };
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  const directory = '.local/gsc/operations';
  const files = await readdir(directory).catch((error: NodeJS.ErrnoException) => {
    if (error.code === 'ENOENT') return [];
    throw error;
  });
  const ledgers = await Promise.all(
    files
      .filter((f) => /^product-growth-milestone-.*\.json$/.test(f))
      .sort()
      .map(async (file) => ({
        file: directory + '/' + file,
        data: JSON.parse(await readFile(directory + '/' + file, 'utf8')),
      })),
  );
  const milestones = reconcileGrowthMilestones(manifest.releases, manifest.milestoneDays, today, ledgers);
  const documentPath = 'docs/PRODUCT_GROWTH_OBSERVATION_CN.md';
  const previous = await readFile(documentPath, 'utf8').catch((error: NodeJS.ErrnoException) => {
    if (error.code === 'ENOENT') return '';
    throw error;
  });
  const base = 'https://aibesttool.com';
  const sitemapResponse = await fetch(base + '/sitemap.xml', { signal: AbortSignal.timeout(20000) });
  if (!sitemapResponse.ok) throw new Error('Sitemap HTTP ' + sitemapResponse.status);
  const sitemap = await sitemapResponse.text();
  const checks: {
    path: string;
    status: number;
    noindex: boolean;
    canonical: string | null;
    sitemap: boolean;
    englishPrefixLinks: boolean;
  }[] = [];
  const releasedPaths = new Set(manifest.releases.flatMap((r) => r.paths));
  const paths = Array.from(
    new Set([...Array.from(releasedPaths), '/ai/lindy', '/cn/ai/lindy', '/ai/make', '/cn/ai/make']),
  );
  for (const route of paths) {
    const response = await fetch(base + route, { signal: AbortSignal.timeout(20000), redirect: 'manual' });
    const html = await response.text();
    const canonical = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1] || null;
    const meta = html.match(/<meta[^>]*name="robots"[^>]*content="([^"]+)"/)?.[1] || '';
    checks.push({
      path: route,
      status: response.status,
      canonical,
      noindex: /noindex/i.test(meta + ',' + (response.headers.get('x-robots-tag') || '')),
      sitemap: sitemap.includes('<loc>' + base + route + '</loc>'),
      englishPrefixLinks: /href="\/en\//.test(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')),
    });
  }
  const anomalies = checks.filter(
    (c) =>
      c.status !== 200 ||
      c.canonical !== base + c.path ||
      c.englishPrefixLinks ||
      (releasedPaths.has(c.path) ? c.noindex || !c.sitemap : !c.noindex || c.sitemap),
  );
  const report = {
    generatedAt: new Date().toISOString(),
    readOnly: true,
    productionWrites: 0,
    checks,
    anomalies,
    milestones,
    note: 'HTTP/index metadata and sitemap are technical distribution evidence, never proof of Google discovery, crawl or indexing.',
  };
  await writeGscOutput(
    root,
    '.local/gsc/operations/product-growth-observation-latest.json',
    JSON.stringify(report, null, 2) + '\n',
    'private',
  );
  await writeGscOutput(
    root,
    '.local/gsc/operations/product-growth-observation-' + today + '.json',
    JSON.stringify(report, null, 2) + '\n',
    'private',
  );
  const lines = [
    '# 产品发布后观察',
    '',
    '核查时间：' + report.generatedAt,
    '生产写入：0。技术异常：' + anomalies.length + '。Google 发现/抓取/收录与搜索效果未由 HTTP 验收代替。',
    '',
    '| 页面 | HTTP | canonical | robots | sitemap |',
    '| --- | ---: | --- | --- | --- |',
    ...checks.map(
      (c) =>
        '| ' +
        [
          c.path,
          c.status,
          c.canonical === base + c.path ? 'self' : '异常',
          c.noindex ? 'noindex' : 'index',
          c.sitemap ? 'included' : 'excluded',
        ].join(' | ') +
        ' |',
    ),
    '',
    '| 对象 | 节点 | 到期日（上海） | 状态 |',
    '| --- | --- | --- | --- |',
    ...milestones.map((m) => '| ' + [m.release, 'D+' + m.day, m.dueOn, m.status].join(' | ') + ' |'),
    '',
    '未落账到期节点：' +
      milestones.filter((m) => m.needsObservation).length +
      '。已观察的 waiting_data/等待重抓不计成功，也不每日重复到期；后续在下一节点复查。账本位于 .local/gsc/operations/product-growth-milestone-*.json。',
    'D+3 记录发现/技术，D+7 记录抓取，D+14/28 使用同窗最终查询与页面数据。内容冷却只约束对应已发布页面，不暂停其他工具的证据、去重、对比及有条件推荐准备。',
    '',
  ];
  await writeGscOutput(root, documentPath, updateGrowthObservationDocument(previous, lines.join('\n')), 'summary');
  console.log(
    JSON.stringify({
      productionWrites: 0,
      checks: checks.length,
      anomalies: anomalies.length,
      milestonesDue: milestones.filter((m) => m.needsObservation).length,
      milestonesObserved: milestones.filter((m) => m.evidenceFile).length,
      nextMilestone:
        milestones
          .filter((m) => m.status === 'not_due')
          .map((m) => m.dueOn)
          .sort()[0] || null,
    }),
  );
  if (anomalies.length) process.exitCode = 1;
}
main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Observation failed');
  process.exitCode = 1;
});
