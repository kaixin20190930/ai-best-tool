export type GscCsvTable = {
  headers: string[];
  rows: string[][];
};

export type GscPageMetric = {
  url: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type GscPageSnapshot = {
  pages: GscPageMetric[];
  homepageImpressions: number;
  nonHomepageImpressions: number;
  nonHomepageShare: number;
  visibleNonHomepagePages: number;
  qualifiedNonHomepagePages: GscPageMetric[];
};

export type GscDecisionReport = {
  current: GscPageSnapshot;
  previous: GscPageSnapshot | null;
  baseline: GscPageSnapshot | null;
  expansionTriggered: boolean;
  expansionReasons: string[];
  enhanceCandidates: GscPageMetric[];
  observeCandidates: GscPageMetric[];
  manualClosureCandidates: string[];
};

function findIndex(headers: string[], candidates: string[]) {
  const normalizedHeaders = headers.map((header) => header.trim().toLowerCase());
  return normalizedHeaders.findIndex((header) =>
    candidates.some((candidate) => header.includes(candidate.toLowerCase())),
  );
}

function toNumber(value: string | undefined) {
  if (!value) return 0;
  const parsed = Number(value.replace(/,/g, '').replace(/%/g, '').trim());
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeUrl(value: string) {
  try {
    const url = new URL(value.trim());
    url.hash = '';
    url.search = '';
    return url.toString().replace(/\/$/, '') || url.origin;
  } catch {
    return value.trim().replace(/\/$/, '');
  }
}

function isHomepage(value: string) {
  try {
    const pathname = new URL(value).pathname.replace(/\/$/, '') || '/';
    return pathname === '/' || /^\/[a-z]{2}(?:-[a-z]{2})?$/i.test(pathname);
  } catch {
    return value === '' || value === '/';
  }
}

export function parseGscPageTable(table: GscCsvTable): GscPageMetric[] {
  const urlIndex = findIndex(table.headers, ['top pages', 'page', '网页', 'url']);
  const clicksIndex = findIndex(table.headers, ['clicks', 'click', '点击次数', '点击']);
  const impressionsIndex = findIndex(table.headers, ['impressions', 'impression', '展示']);
  const ctrIndex = findIndex(table.headers, ['ctr', '点击率']);
  const positionIndex = findIndex(table.headers, ['position', '排名']);

  if (urlIndex === -1 || impressionsIndex === -1) return [];

  return table.rows
    .map((row) => {
      const impressions = toNumber(row[impressionsIndex]);
      const clicks = toNumber(row[clicksIndex]);
      const rawCtr = toNumber(row[ctrIndex]);
      return {
        url: normalizeUrl(row[urlIndex] || ''),
        clicks,
        impressions,
        ctr: rawCtr > 1 ? rawCtr / 100 : impressions > 0 ? clicks / impressions : 0,
        position: toNumber(row[positionIndex]),
      };
    })
    .filter((page) => page.url.length > 0 && page.impressions > 0)
    .sort((a, b) => b.impressions - a.impressions);
}

export function buildGscPageSnapshot(table: GscCsvTable): GscPageSnapshot {
  const pages = parseGscPageTable(table);
  const homepageImpressions = pages
    .filter((page) => isHomepage(page.url))
    .reduce((total, page) => total + page.impressions, 0);
  const nonHomepagePages = pages.filter((page) => !isHomepage(page.url));
  const nonHomepageImpressions = nonHomepagePages.reduce((total, page) => total + page.impressions, 0);
  const totalImpressions = homepageImpressions + nonHomepageImpressions;

  return {
    pages,
    homepageImpressions,
    nonHomepageImpressions,
    nonHomepageShare: totalImpressions > 0 ? nonHomepageImpressions / totalImpressions : 0,
    visibleNonHomepagePages: nonHomepagePages.length,
    qualifiedNonHomepagePages: nonHomepagePages.filter((page) => page.impressions >= 20),
  };
}

export function buildGscDecisionReport(input: {
  current: GscCsvTable;
  previous?: GscCsvTable | null;
  baseline?: GscCsvTable | null;
}): GscDecisionReport {
  const current = buildGscPageSnapshot(input.current);
  const previous = input.previous ? buildGscPageSnapshot(input.previous) : null;
  const baseline = input.baseline ? buildGscPageSnapshot(input.baseline) : null;
  const expansionReasons: string[] = [];

  if (!previous || !baseline) {
    expansionReasons.push('需要当前、上一轮和基线三期数据，才能验证连续两轮提升');
  } else if (
    !(current.nonHomepageShare > previous.nonHomepageShare && previous.nonHomepageShare > baseline.nonHomepageShare)
  ) {
    expansionReasons.push('非首页展示占比尚未连续两轮提升');
  }

  if (current.qualifiedNonHomepagePages.length < 3) {
    expansionReasons.push('当前达到 20 展示的非首页页面不足 3 个');
  }

  const currentUrls = new Set(current.pages.map((page) => page.url));
  const previousUrls = new Set(previous?.pages.map((page) => page.url) || []);
  const baselineUrls = new Set(baseline?.pages.map((page) => page.url) || []);
  const manualClosureCandidates = Array.from(baselineUrls)
    .filter((url) => !previousUrls.has(url) && !currentUrls.has(url) && !isHomepage(url))
    .sort();
  const nonHomepagePages = current.pages.filter((page) => !isHomepage(page.url));

  return {
    current,
    previous,
    baseline,
    expansionTriggered: expansionReasons.length === 0,
    expansionReasons,
    enhanceCandidates: nonHomepagePages.filter((page) => page.impressions >= 20),
    observeCandidates: nonHomepagePages.filter((page) => page.impressions < 20),
    manualClosureCandidates,
  };
}
