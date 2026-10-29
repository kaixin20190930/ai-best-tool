import fs from 'node:fs';
import path from 'node:path';
import { config } from 'dotenv';
import { Client } from 'pg';

import { getCanonicalToolSlug } from '../lib/config/toolRouteAliases';
import { GUIDE_PAGES } from '../lib/content/guides';
import { topListTopics } from '../lib/data/topLists';
import { getDatabaseConnectionString } from '../lib/database/connection';
import { getToolIndexDecision } from '../lib/seo/toolIndexing';

type AssetState = 'KEEP_INDEX' | 'IMPROVE' | 'INTERNAL_NOINDEX' | 'MERGE_CANDIDATE' | 'ARCHIVE_CANDIDATE';
type PageType = 'Core' | 'Guide' | 'Comparison' | 'Best' | 'Tool';

type ToolRow = {
  id: string;
  name: string;
  status: string;
  page_quality_status: string | null;
  category_id: string | null;
  image_url: string | null;
  thumbnail_url: string | null;
  content: unknown;
  detail: unknown;
  pricing: string | null;
  tags: string[] | null;
};

type GscMetric = { clicks: number; impressions: number; ctr: number; position: number };

type AssetRow = {
  url: string;
  pageType: PageType;
  primaryIntent: string;
  cluster: string;
  lifecycle: string;
  pageQualityStatus: string;
  sitemap: boolean;
  gsc28d: GscMetric | null;
  downstreamConsumer: string;
  assetState: AssetState;
  conflictTarget: string | null;
  nextAction: string;
};

const baseUrl = (process.env.SEO_BASE_URL || 'https://aibesttool.com').replace(/\/$/, '');
const outputArg = process.argv.find((arg) => arg.startsWith('--output='))?.slice('--output='.length);
const markdownOutput = path.join(process.cwd(), 'docs', 'SEO_PAGE_ASSET_LEDGER_CN.md');
const guidesRoot = path.join(process.cwd(), 'app', '[locale]', '(with-footer)', 'guides');

function latestGscSnapshot(): { date: string; pages: Map<string, GscMetric> } | null {
  const root = path.join(process.cwd(), '.local', 'gsc');
  if (!fs.existsSync(root)) return null;
  const files = fs
    .readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) => {
      const directory = path.join(root, entry.name);
      return fs
        .readdirSync(directory)
        .filter((name) => /^search-analytics-\d{4}-\d{2}-\d{2}\.json$/.test(name))
        .map((name) => path.join(directory, name));
    })
    .sort();
  const latest = files.at(-1);
  if (!latest) return null;
  const snapshot = JSON.parse(fs.readFileSync(latest, 'utf8')) as {
    latestCompleteDate?: string;
    periods?: { days28?: { breakdowns?: { page?: { rows?: Array<GscMetric & { keys?: string[] }> } } } };
  };
  const pages = new Map<string, GscMetric>();
  for (const row of snapshot.periods?.days28?.breakdowns?.page?.rows || []) {
    const rawUrl = row.keys?.[0];
    if (!rawUrl) continue;
    const pathname = new URL(rawUrl).pathname.replace(/^\/cn(?=\/|$)/, '') || '/';
    const current = pages.get(pathname);
    if (!current) {
      pages.set(pathname, {
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr,
        position: row.position,
      });
      continue;
    }
    const impressions = current.impressions + row.impressions;
    pages.set(pathname, {
      clicks: current.clicks + row.clicks,
      impressions,
      ctr: impressions ? (current.clicks + row.clicks) / impressions : 0,
      position: impressions
        ? (current.position * current.impressions + row.position * row.impressions) / impressions
        : 0,
    });
  }
  return { date: snapshot.latestCompleteDate || path.basename(latest).slice(17, 27), pages };
}

function filesystemGuideRoutes() {
  if (!fs.existsSync(guidesRoot)) return [];
  return fs
    .readdirSync(guidesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(guidesRoot, entry.name, 'page.tsx')))
    .map((entry) => `/guides/${entry.name}`);
}

function readableSlug(url: string) {
  return url.split('/').filter(Boolean).at(-1)?.replace(/-/g, ' ') || 'AI tool decisions';
}

function chooseState(sitemap: boolean, metric: GscMetric | null, fallback: AssetState): AssetState {
  if (!sitemap) return fallback;
  if (
    metric &&
    metric.impressions >= 50 &&
    (metric.clicks === 0 || metric.position > 20 || (metric.impressions >= 100 && metric.ctr < 0.005))
  ) {
    return 'IMPROVE';
  }
  return 'KEEP_INDEX';
}

function nextAction(state: AssetState) {
  switch (state) {
    case 'KEEP_INDEX':
      return '保持唯一意图；仅在来源变化、到期或生产异常时重开';
    case 'IMPROVE':
      return '按稳定 14/28 天查询簇改善摘要、首屏判断或内部消费；完成后冷却 14 天';
    case 'INTERNAL_NOINDEX':
      return '保留用户与内链价值；没有独立需求和决策价值时不申请索引';
    case 'MERGE_CANDIDATE':
      return '进入集中 Owner 授权包；授权前不自动合并、删除或重定向';
    case 'ARCHIVE_CANDIDATE':
      return '进入集中 Owner 授权包；继续保留审计前像';
    default:
      return '保持当前状态并等待明确差分';
  }
}

function markdownTable(rows: AssetRow[]) {
  const header =
    '| URL | 类型 | 状态 | Sitemap | GSC 28d 点击/展示/排名 | 下游消费 | 下一步 |\n| --- | --- | --- | --- | --- | --- | --- |';
  const body = rows
    .map((row) => {
      const gsc = row.gsc28d
        ? `${row.gsc28d.clicks}/${row.gsc28d.impressions}/${row.gsc28d.position.toFixed(1)}`
        : '无可见数据';
      return `| ${row.url} | ${row.pageType} | ${row.assetState} | ${row.sitemap ? 'yes' : 'no'} | ${gsc} | ${row.downstreamConsumer} | ${row.nextAction} |`;
    })
    .join('\n');
  return `${header}\n${body}`;
}

async function readTools() {
  const client = new Client({ connectionString: getDatabaseConnectionString() });
  await client.connect();
  try {
    const result = await client.query<ToolRow>(
      `SELECT id,name,status,page_quality_status,category_id,image_url,thumbnail_url,content,detail,pricing,tags
         FROM tools ORDER BY name`,
    );
    return result.rows;
  } finally {
    await client.end();
  }
}

async function main() {
  config({ path: '.env.local', quiet: true });
  const [sitemapResponse, toolRows] = await Promise.all([
    fetch(`${baseUrl}/sitemap.xml`, {
      headers: { 'user-agent': 'ai-best-tool-page-asset-ledger/1.0' },
      signal: AbortSignal.timeout(20_000),
    }),
    readTools(),
  ]);
  if (!sitemapResponse.ok) throw new Error(`sitemap returned ${sitemapResponse.status}`);
  const sitemapXml = await sitemapResponse.text();
  const sitemapPaths = new Set(
    Array.from(sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g), (match) => {
      const pathname = new URL(match[1]).pathname.replace(/^\/cn(?=\/|$)/, '') || '/';
      return pathname;
    }),
  );
  const gsc = latestGscSnapshot();
  const guideUrls = Array.from(new Set([...GUIDE_PAGES.map((page) => page.href), ...filesystemGuideRoutes()])).sort();
  const guideSet = new Set(guideUrls);
  const rows: AssetRow[] = [];

  for (const url of ['/', '/explore', '/guides', '/best-ai-tools']) {
    const metric = gsc?.pages.get(url) || null;
    const state = chooseState(sitemapPaths.has(url), metric, 'INTERNAL_NOINDEX');
    rows.push({
      url,
      pageType: 'Core',
      primaryIntent: url === '/' ? 'Compare AI tools by task, price, limits, and evidence' : readableSlug(url),
      cluster: 'sitewide',
      lifecycle: 'public',
      pageQualityStatus: sitemapPaths.has(url) ? 'continue_index' : 'monitor',
      sitemap: sitemapPaths.has(url),
      gsc28d: metric,
      downstreamConsumer: 'site navigation and cluster discovery',
      assetState: state,
      conflictTarget: null,
      nextAction: nextAction(state),
    });
  }

  for (const url of guideUrls) {
    const comparison = url.endsWith('-comparison');
    const conflictTarget =
      comparison && guideSet.has(url.replace(/-comparison$/, '')) ? url.replace(/-comparison$/, '') : null;
    const fallback: AssetState = conflictTarget ? 'MERGE_CANDIDATE' : 'INTERNAL_NOINDEX';
    const metric = gsc?.pages.get(url) || null;
    const state = chooseState(sitemapPaths.has(url), metric, fallback);
    rows.push({
      url,
      pageType: comparison ? 'Comparison' : 'Guide',
      primaryIntent: readableSlug(url),
      cluster: readableSlug(url),
      lifecycle: 'public',
      pageQualityStatus: sitemapPaths.has(url) ? 'continue_index' : 'monitor',
      sitemap: sitemapPaths.has(url),
      gsc28d: metric,
      downstreamConsumer: comparison ? 'cluster comparison and tool decisions' : 'task guidance and tool decisions',
      assetState: state,
      conflictTarget,
      nextAction: nextAction(state),
    });
  }

  for (const topic of topListTopics) {
    const url = `/best-ai-tools/${topic.key}`;
    const metric = gsc?.pages.get(url) || null;
    const state = chooseState(sitemapPaths.has(url), metric, 'INTERNAL_NOINDEX');
    rows.push({
      url,
      pageType: 'Best',
      primaryIntent: `Best ${topic.key.replace(/-/g, ' ')}`,
      cluster: topic.key,
      lifecycle: 'public',
      pageQualityStatus: sitemapPaths.has(url) ? 'continue_index' : 'monitor',
      sitemap: sitemapPaths.has(url),
      gsc28d: metric,
      downstreamConsumer: 'cluster shortlist and tool decision cards',
      assetState: state,
      conflictTarget: null,
      nextAction: nextAction(state),
    });
  }

  for (const tool of toolRows) {
    const url = `/ai/${getCanonicalToolSlug(tool.name)}`;
    const decision = getToolIndexDecision({
      status: tool.status,
      pageQualityStatus: tool.page_quality_status,
      categoryId: tool.category_id,
      imageUrl: tool.image_url,
      thumbnailUrl: tool.thumbnail_url,
      content: tool.content,
      detail: tool.detail,
      pricing: tool.pricing,
      tags: tool.tags,
    });
    const metric = gsc?.pages.get(url) || null;
    const fallback: AssetState =
      tool.page_quality_status === 'archive' || tool.status === 'rejected' ? 'ARCHIVE_CANDIDATE' : 'INTERNAL_NOINDEX';
    const state = chooseState(decision.indexable && sitemapPaths.has(url), metric, fallback);
    rows.push({
      url,
      pageType: 'Tool',
      primaryIntent: `Decide whether ${tool.name} fits the task`,
      cluster: 'derived from downstream content',
      lifecycle: tool.status,
      pageQualityStatus: tool.page_quality_status || 'monitor',
      sitemap: sitemapPaths.has(url),
      gsc28d: metric,
      downstreamConsumer: 'tool decision, best pages, guides, and comparisons',
      assetState: state,
      conflictTarget: null,
      nextAction: nextAction(state),
    });
  }

  const deduped = Array.from(new Map(rows.map((row) => [row.url, row])).values()).sort((a, b) =>
    a.url.localeCompare(b.url),
  );
  const stateCounts = deduped.reduce<Record<AssetState, number>>(
    (counts, row) => ({ ...counts, [row.assetState]: counts[row.assetState] + 1 }),
    { KEEP_INDEX: 0, IMPROVE: 0, INTERNAL_NOINDEX: 0, MERGE_CANDIDATE: 0, ARCHIVE_CANDIDATE: 0 },
  );
  const prioritized = deduped
    .filter((row) => row.assetState === 'IMPROVE' || row.assetState === 'MERGE_CANDIDATE')
    .sort((a, b) => (b.gsc28d?.impressions || 0) - (a.gsc28d?.impressions || 0))
    .slice(0, 30);
  const report = {
    generatedAt: new Date().toISOString(),
    productionBaseUrl: baseUrl,
    gscLatestCompleteDate: gsc?.date || null,
    sitemapUrlCount: Array.from(sitemapXml.matchAll(/<loc>/g)).length,
    assetCount: deduped.length,
    stateCounts,
    policy: {
      source: 'route registry + production tools + production sitemap + latest private GSC snapshot',
      noAutomaticMutation: true,
      ownerApprovalRequired: ['merge', 'redirect', 'archive', 'delete'],
    },
    assets: deduped,
  };
  const jsonOutput = path.resolve(
    outputArg || path.join('reports', 'seo', `page-asset-ledger-${new Date().toISOString().slice(0, 10)}.json`),
  );
  fs.mkdirSync(path.dirname(jsonOutput), { recursive: true });
  fs.writeFileSync(jsonOutput, `${JSON.stringify(report, null, 2)}\n`);
  const markdown = `# SEO 页面资产账本\n\n更新时间：${new Date().toISOString().slice(0, 10)}\n\n本账本由现有路由注册、生产 Tool 数据、生产 sitemap 和最近私有 GSC 快照派生，不是新的数据库或 Dashboard。合并、重定向、归档和删除仅形成候选，不自动执行。完整逐页数据见 \`${path.relative(process.cwd(), jsonOutput)}\`。\n\n## 汇总\n\n- 页面资产：${deduped.length}\n- 生产 sitemap URL：${report.sitemapUrlCount}\n- GSC 最新完整日：${gsc?.date || 'unavailable'}\n- KEEP_INDEX：${stateCounts.KEEP_INDEX}\n- IMPROVE：${stateCounts.IMPROVE}\n- INTERNAL_NOINDEX：${stateCounts.INTERNAL_NOINDEX}\n- MERGE_CANDIDATE：${stateCounts.MERGE_CANDIDATE}\n- ARCHIVE_CANDIDATE：${stateCounts.ARCHIVE_CANDIDATE}\n\n## 当前优先资产\n\n${markdownTable(prioritized)}\n\n## 解释\n\n- \`IMPROVE\` 只根据稳定的 28 天页面信号形成候选，不以单日平均排名触发修改。\n- 完成页面修改后进入 14 天冷却；技术异常、来源变化或到期除外。\n- \`INTERNAL_NOINDEX\` 可以继续服务用户和内链，不等于失败。\n- \`MERGE_CANDIDATE\` 与 \`ARCHIVE_CANDIDATE\` 必须进入集中 Owner 授权包。\n`;
  fs.writeFileSync(markdownOutput, markdown);
  console.log(JSON.stringify({ ...report, assets: undefined, jsonOutput, markdownOutput }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
