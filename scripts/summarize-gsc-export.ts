import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

type CsvRow = string[];

type CsvTable = {
  headers: string[];
  rows: CsvRow[];
};

type MetricSummary = {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  rows: number;
  startDate?: string;
  endDate?: string;
};

type InventoryCounts = {
  total: number | null;
  sitemap: number | null;
  internal: number | null;
  noindex: number | null;
};

const DEFAULT_FILENAMES = {
  chart: ['图表.csv', 'chart.csv', 'overview.csv'],
  queries: ['查询数.csv', 'queries.csv', 'search-queries.csv'],
  pages: ['网页.csv', 'pages.csv'],
  countries: ['国家_地区.csv', 'countries.csv'],
  devices: ['设备.csv', 'devices.csv'],
  appearances: ['搜索结果呈现.csv', 'search-result-appearance.csv', 'appearances.csv'],
  filters: ['过滤器.csv', 'filters.csv'],
};

function parseArgs(argv: string[]) {
  const args = new Map<string, string | boolean>();

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      args.set(key, true);
      continue;
    }
    args.set(key, next);
    i += 1;
  }

  return {
    dir: typeof args.get('dir') === 'string' ? String(args.get('dir')) : process.cwd(),
    out: typeof args.get('out') === 'string' ? String(args.get('out')) : null,
    write: args.get('write') === true,
  };
}

function parseCsv(text: string): CsvTable {
  const rows: CsvRow[] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  const pushCell = () => {
    row.push(cell);
    cell = '';
  };

  const pushRow = () => {
    if (row.length > 0 || cell.length > 0) {
      pushCell();
      rows.push(row);
    }
    row = [];
  };

  const normalized = text
    .replace(/^\uFEFF/, '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');

  for (let i = 0; i < normalized.length; i += 1) {
    const ch = normalized[i];
    const next = normalized[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      continue;
    }

    if (ch === ',') {
      pushCell();
      continue;
    }

    if (ch === '\n') {
      pushRow();
      continue;
    }

    cell += ch;
  }

  if (cell.length > 0 || row.length > 0) {
    pushRow();
  }

  const headers = rows.shift() || [];
  return {
    headers: headers.map((header) => header.trim()),
    rows: rows.filter((entry) => entry.some((value) => value.trim().length > 0)),
  };
}

function findIndex(headers: string[], candidates: string[]) {
  const lowered = headers.map((header) => header.toLowerCase());
  for (const candidate of candidates) {
    const index = lowered.findIndex((header) => header.includes(candidate.toLowerCase()));
    if (index !== -1) return index;
  }
  return -1;
}

function toNumber(value: string | undefined) {
  if (!value) return 0;
  const normalized = value.replace(/,/g, '').trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function summarizeChart(table: CsvTable): MetricSummary {
  const clicksIndex = findIndex(table.headers, ['click']);
  const impressionsIndex = findIndex(table.headers, ['impression']);
  const ctrIndex = findIndex(table.headers, ['ctr', 'click-through']);
  const positionIndex = findIndex(table.headers, ['position', 'avg position']);
  const dateIndex = findIndex(table.headers, ['date', 'day']);

  let clicks = 0;
  let impressions = 0;
  let weightedPosition = 0;
  let ctrTotal = 0;
  let ctrRows = 0;

  for (const row of table.rows) {
    clicks += toNumber(row[clicksIndex]);
    impressions += toNumber(row[impressionsIndex]);
    if (positionIndex !== -1) {
      weightedPosition += toNumber(row[positionIndex]) * toNumber(row[impressionsIndex]);
    }
    if (ctrIndex !== -1) {
      ctrTotal += toNumber(row[ctrIndex]);
      ctrRows += 1;
    }
  }

  const firstRow = table.rows[0];
  const lastRow = table.rows.at(-1);
  const startDate = dateIndex !== -1 && firstRow ? firstRow[dateIndex] : undefined;
  const endDate = dateIndex !== -1 && lastRow ? lastRow[dateIndex] : undefined;

  let ctr = 0;
  if (impressions > 0) {
    ctr = clicks / impressions;
  } else if (ctrRows > 0) {
    ctr = ctrTotal / ctrRows;
  }

  return {
    clicks,
    impressions,
    ctr,
    position: impressions > 0 ? weightedPosition / impressions : 0,
    rows: table.rows.length,
    startDate,
    endDate,
  };
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(Math.round(value));
}

function formatTableSection(title: string, table: CsvTable, maxRows = 10) {
  if (table.rows.length === 0) {
    return `## ${title}\n\n_No rows found._\n`;
  }

  const headers = table.headers.slice(0, 4);
  const lines = [`## ${title}`, '', `| ${headers.join(' | ')} |`, `| ${headers.map(() => '---').join(' | ')} |`];

  for (const row of table.rows.slice(0, maxRows)) {
    lines.push(`| ${row.slice(0, headers.length).join(' | ')} |`);
  }

  lines.push('');
  return lines.join('\n');
}

async function readInventoryCounts() {
  const inventoryPath = path.join(process.cwd(), 'docs', 'SEO_QUALITY_INVENTORY_CN.md');
  try {
    const text = await readFile(inventoryPath, 'utf8');
    const total = text.match(/总页面数：(\d+)/)?.[1];
    const sitemap = text.match(/可进 sitemap：(\d+)/)?.[1];
    const internal = text.match(/内部流量页：(\d+)/)?.[1];
    const noindex = text.match(/noindex \/ 合并候选：(\d+)/)?.[1];
    return {
      total: total ? Number(total) : null,
      sitemap: sitemap ? Number(sitemap) : null,
      internal: internal ? Number(internal) : null,
      noindex: noindex ? Number(noindex) : null,
    } satisfies InventoryCounts;
  } catch {
    return {
      total: null,
      sitemap: null,
      internal: null,
      noindex: null,
    } satisfies InventoryCounts;
  }
}

async function readCsvIfExists(dir: string, filename: string) {
  const filePath = path.join(dir, filename);
  try {
    const text = await readFile(filePath, 'utf8');
    return parseCsv(text);
  } catch {
    return null;
  }
}

async function findCsvFile(dir: string, filename: string, maxDepth = 4): Promise<string | null> {
  const directPath = path.join(dir, filename);
  try {
    await stat(directPath);
    return directPath;
  } catch {
    // Fall through to recursive search.
  }

  if (maxDepth <= 0) {
    return null;
  }

  let entries: Awaited<ReturnType<typeof readdir>>;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return null;
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const nestedPath = await findCsvFile(path.join(dir, entry.name), filename, maxDepth - 1);
    if (nestedPath) return nestedPath;
  }

  return null;
}

async function readCsvByName(dir: string, filenames: string | string[]) {
  const candidates = Array.isArray(filenames) ? filenames : [filenames];

  for (const filename of candidates) {
    const locatedPath = await findCsvFile(dir, filename);
    if (!locatedPath) continue;
    return readCsvIfExists(path.dirname(locatedPath), path.basename(locatedPath));
  }

  return null;
}

function buildReport(dir: string, sources: Record<string, CsvTable | null>) {
  const chart = sources.chart ? summarizeChart(sources.chart) : null;
  const foundAny = Object.values(sources).some(Boolean);

  const lines: string[] = [];
  lines.push('# GSC Export Summary');
  lines.push('');
  lines.push(`Source directory: \`${dir}\``);
  lines.push(`Generated at: ${new Date().toISOString()}`);
  lines.push('');

  if (!foundAny) {
    lines.push('## No CSV files found');
    lines.push('');
    lines.push(
      '_No Search Console CSV files were detected under the provided directory. Expected filenames include 图表.csv, 查询数.csv, 网页.csv, 国家_地区.csv, 设备.csv, 搜索结果呈现.csv, and 过滤器.csv._',
    );
    lines.push('');
    lines.push('## Notes');
    lines.push('');
    lines.push('- Double-check the export folder path.');
    lines.push('- If the export is nested, pass the parent folder and let the script search recursively.');
    lines.push('');
    return lines.join('\n');
  }

  if (chart) {
    lines.push('## 28-day Overview');
    lines.push('');
    lines.push(`- Clicks: ${formatNumber(chart.clicks)}`);
    lines.push(`- Impressions: ${formatNumber(chart.impressions)}`);
    lines.push(`- CTR: ${formatPercent(chart.ctr)}`);
    lines.push(`- Avg position: ${chart.position.toFixed(2)}`);
    lines.push(`- Rows: ${chart.rows}`);
    if (chart.startDate || chart.endDate) {
      lines.push(`- Date range: ${chart.startDate || 'n/a'} → ${chart.endDate || 'n/a'}`);
    }
    lines.push('');
  } else {
    lines.push('## 28-day Overview');
    lines.push('');
    lines.push('_No chart CSV found._');
    lines.push('');
  }

  if (sources.queries) lines.push(formatTableSection('Top Queries', sources.queries));
  if (sources.pages) lines.push(formatTableSection('Top Pages', sources.pages));
  if (sources.countries) lines.push(formatTableSection('Countries / Regions', sources.countries));
  if (sources.devices) lines.push(formatTableSection('Devices', sources.devices));
  if (sources.appearances) lines.push(formatTableSection('Search Result Appearance', sources.appearances));
  if (sources.filters) lines.push(formatTableSection('Filters', sources.filters));

  lines.push('## Notes');
  lines.push('');
  lines.push('- This report is generated from exported Search Console CSV files.');
  lines.push('- Use it as a weekly baseline or paste the overview into `docs/GSC_WEEKLY_OBSERVATION_LOG_CN.md`.');
  lines.push('');

  return lines.join('\n');
}

function findOverviewRowIndex(log: string) {
  return log.split('\n').findIndex((line) => line.includes('| Week 1 |'));
}

function updateWeeklyOverview(log: string, summaryLine: string) {
  const lines = log.split('\n');
  const rowIndex = findOverviewRowIndex(log);
  if (rowIndex === -1) return log;

  const existing = lines[rowIndex];
  if (existing.includes('待填')) {
    lines[rowIndex] = summaryLine;
    return lines.join('\n');
  }

  if (existing.includes('| Week 1 |')) {
    lines[rowIndex] = summaryLine;
  }

  return lines.join('\n');
}

async function main() {
  const { dir, out, write } = parseArgs(process.argv.slice(2));
  const inventoryCounts = await readInventoryCounts();

  const sources = {
    chart: await readCsvByName(dir, DEFAULT_FILENAMES.chart),
    queries: await readCsvByName(dir, DEFAULT_FILENAMES.queries),
    pages: await readCsvByName(dir, DEFAULT_FILENAMES.pages),
    countries: await readCsvByName(dir, DEFAULT_FILENAMES.countries),
    devices: await readCsvByName(dir, DEFAULT_FILENAMES.devices),
    appearances: await readCsvByName(dir, DEFAULT_FILENAMES.appearances),
    filters: await readCsvByName(dir, DEFAULT_FILENAMES.filters),
  };

  const report = buildReport(dir, sources);

  if (out) {
    await mkdir(path.dirname(out), { recursive: true });
    await writeFile(out, `${report}\n`, 'utf8');
  }

  if (write) {
    const docsPath = path.join(process.cwd(), 'docs', 'GSC_WEEKLY_OBSERVATION_LOG_CN.md');
    const log = await readFile(docsPath, 'utf8');
    const chartSummary = sources.chart ? summarizeChart(sources.chart) : null;
    const summaryLine = chartSummary
      ? `| Week 1 | ${new Date().toISOString().slice(0, 10)} | ${formatNumber(chartSummary.impressions)} | ${formatNumber(chartSummary.clicks)} | ${formatPercent(chartSummary.ctr)} | ${chartSummary.position.toFixed(2)} | ${inventoryCounts.sitemap ?? '待填'} | ${inventoryCounts.noindex ?? '待填'} | 从 GSC CSV 导入`
      : null;
    if (summaryLine) {
      const updated = updateWeeklyOverview(log, summaryLine);
      if (updated !== log) {
        await writeFile(docsPath, updated, 'utf8');
      }
    }
  }

  process.stdout.write(`${report}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
