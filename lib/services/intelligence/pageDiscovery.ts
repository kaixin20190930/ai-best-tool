import { safeFetchText, type SafeFetchOptions } from '@/lib/services/intelligence/safeFetch';
import type {
  DiscoveredIntelligencePage,
  IntelligenceDiscoveryMethod,
  IntelligencePageType,
} from '@/lib/services/intelligence/types';

import createIntelligenceDom from './dom';

const DEFAULT_MAX_PAGES = 40;
const DEFAULT_MAX_SITEMAPS = 3;
const DEFAULT_MAX_SITEMAP_URLS = 250;

const commonPathCandidates: Array<{ path: string; pageType: IntelligencePageType }> = [
  { path: '/pricing', pageType: 'pricing' },
  { path: '/features', pageType: 'features' },
  { path: '/product', pageType: 'product' },
  { path: '/docs', pageType: 'documentation' },
  { path: '/documentation', pageType: 'documentation' },
  { path: '/help', pageType: 'help' },
  { path: '/changelog', pageType: 'changelog' },
  { path: '/updates', pageType: 'changelog' },
  { path: '/about', pageType: 'about' },
  { path: '/security', pageType: 'security' },
];

const pageTypeMatchers: Array<{
  pageType: IntelligencePageType;
  patterns: RegExp[];
  score: number;
}> = [
  { pageType: 'pricing', patterns: [/\bpricing\b/i, /\bplans?\b/i], score: 95 },
  { pageType: 'changelog', patterns: [/\bchangelog\b/i, /\brelease[- ]?notes?\b/i, /\bupdates?\b/i], score: 92 },
  {
    pageType: 'documentation',
    patterns: [/\bdocs?\b/i, /\bdocumentation\b/i, /\bdevelopers?\b/i, /\bapi[- ]?reference\b/i],
    score: 90,
  },
  { pageType: 'features', patterns: [/\bfeatures?\b/i, /\bcapabilities\b/i], score: 86 },
  { pageType: 'use_case', patterns: [/\buse[- ]?cases?\b/i, /\bsolutions?\b/i, /\bfor[- /]/i], score: 82 },
  { pageType: 'security', patterns: [/\bsecurity\b/i, /\btrust\b/i, /\bcompliance\b/i], score: 78 },
  { pageType: 'product', patterns: [/\bproduct\b/i, /\bplatform\b/i], score: 74 },
  { pageType: 'help', patterns: [/\bhelp\b/i, /\bsupport\b/i, /\bknowledge[- ]?base\b/i], score: 70 },
  { pageType: 'about', patterns: [/\babout\b/i, /\bcompany\b/i], score: 62 },
  { pageType: 'license', patterns: [/\blicen[cs]e\b/i], score: 58 },
  { pageType: 'terms', patterns: [/\bterms?\b/i, /\blegal\b/i], score: 45 },
];

const ignoredPathPatterns = [
  /\/(?:login|log-in|signin|sign-in|signup|sign-up|register)(?:\/|$)/i,
  /\/(?:dashboard|account|profile|settings|checkout|cart)(?:\/|$)/i,
  /\/(?:privacy|cookie)(?:\/|$)/i,
  /\.(?:png|jpe?g|gif|webp|svg|pdf|zip)$/i,
];

export interface ProductPageDiscoveryOptions {
  maxPages?: number;
  maxSitemaps?: number;
  maxSitemapUrls?: number;
  includeSitemaps?: boolean;
  includeCommonPaths?: boolean;
  allowedPageTypes?: IntelligencePageType[];
  fetchOptions?: SafeFetchOptions;
}

export interface ProductPageDiscoveryResult {
  homepageUrl: string;
  pages: DiscoveredIntelligencePage[];
  sitemapUrls: string[];
  warnings: string[];
}

function normalizeCandidateUrl(value: string, baseUrl: URL): URL | null {
  let url: URL;
  try {
    url = new URL(value, baseUrl);
  } catch {
    return null;
  }

  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return null;
  const candidateHost = url.hostname.toLowerCase().replace(/^www\./, '');
  const baseHost = baseUrl.hostname.toLowerCase().replace(/^www\./, '');
  if (candidateHost !== baseHost) return null;
  if (ignoredPathPatterns.some((pattern) => pattern.test(url.pathname))) return null;

  url.hash = '';
  for (const key of Array.from(url.searchParams.keys())) {
    if (/^(?:utm_|gclid|fbclid|ref|source)/i.test(key)) url.searchParams.delete(key);
  }
  if (url.pathname !== '/') url.pathname = url.pathname.replace(/\/+$/, '');
  return url;
}

export function classifyDiscoveredPage(
  url: URL,
  anchorText = '',
): {
    pageType: IntelligencePageType;
    score: number;
  } {
  if (url.pathname === '/' || url.pathname === '') return { pageType: 'homepage', score: 100 };
  const signal = `${url.pathname.replace(/[-_/]+/g, ' ')} ${anchorText}`.trim();

  for (const matcher of pageTypeMatchers) {
    if (matcher.patterns.some((pattern) => pattern.test(signal))) {
      return { pageType: matcher.pageType, score: matcher.score };
    }
  }

  return { pageType: 'other', score: 20 };
}

function candidatePriority(method: IntelligenceDiscoveryMethod): number {
  if (method === 'homepage_link') return 8;
  if (method === 'sitemap') return 4;
  return 0;
}

function upsertCandidate(
  candidates: Map<string, DiscoveredIntelligencePage>,
  url: URL,
  method: IntelligenceDiscoveryMethod,
  anchorText: string | null,
  forcedType?: IntelligencePageType,
) {
  const classification = forcedType
    ? { pageType: forcedType, score: forcedType === 'homepage' ? 100 : 60 }
    : classifyDiscoveredPage(url, anchorText || '');
  const next: DiscoveredIntelligencePage = {
    url: url.toString(),
    pageType: classification.pageType,
    discoveryMethod: method,
    score: Math.min(100, classification.score + candidatePriority(method)),
    anchorText: anchorText?.trim() || null,
  };
  const current = candidates.get(next.url);
  if (!current || next.score > current.score) candidates.set(next.url, next);
}

export function extractHomepageCandidates(html: string, homepageUrl: string): DiscoveredIntelligencePage[] {
  const baseUrl = new URL(homepageUrl);
  const { document } = createIntelligenceDom(html, baseUrl.toString()).window;
  const candidates = new Map<string, DiscoveredIntelligencePage>();
  upsertCandidate(candidates, baseUrl, 'homepage_link', null, 'homepage');

  for (const anchor of Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href]'))) {
    const url = normalizeCandidateUrl(anchor.getAttribute('href') || '', baseUrl);
    if (!url) continue;
    const text = anchor.textContent?.replace(/\s+/g, ' ').trim() || anchor.getAttribute('aria-label') || '';
    const classification = classifyDiscoveredPage(url, text);
    if (classification.pageType === 'other') continue;
    upsertCandidate(candidates, url, 'homepage_link', text);
  }

  return Array.from(candidates.values()).sort(
    (left, right) => right.score - left.score || left.url.localeCompare(right.url),
  );
}

export function extractSitemapLocations(xml: string, sitemapUrl: string): string[] {
  const baseUrl = new URL(sitemapUrl);
  const locations = Array.from(xml.matchAll(/<loc\b[^>]*>([\s\S]*?)<\/loc>/gi))
    .map((match) =>
      match[1]
        .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
        .replace(/&amp;/g, '&')
        .trim(),
    )
    .map((value) => normalizeCandidateUrl(value, baseUrl))
    .filter((value): value is URL => Boolean(value))
    .map((value) => value.toString());
  return Array.from(new Set(locations));
}

export function extractRobotsSitemaps(robots: string, origin: string): string[] {
  const baseUrl = new URL(origin);
  return Array.from(
    new Set(
      robots
        .split(/\r?\n/)
        .map((line) => line.match(/^\s*sitemap\s*:\s*(.+?)\s*$/i)?.[1])
        .filter((value): value is string => Boolean(value))
        .map((value) => normalizeCandidateUrl(value, baseUrl))
        .filter((value): value is URL => Boolean(value))
        .map((value) => value.toString()),
    ),
  );
}

export function buildCommonPathCandidates(homepageUrl: string): DiscoveredIntelligencePage[] {
  const baseUrl = new URL(homepageUrl);
  return commonPathCandidates.map(({ path, pageType }) => {
    const url = new URL(path, baseUrl);
    return {
      url: url.toString(),
      pageType,
      discoveryMethod: 'common_path',
      score: 60,
      anchorText: null,
    };
  });
}

export function selectDiscoveredPages(
  candidates: DiscoveredIntelligencePage[],
  maxPages: number,
  allowedPageTypes?: IntelligencePageType[],
): DiscoveredIntelligencePage[] {
  return candidates
    .filter((candidate) => !allowedPageTypes || allowedPageTypes.includes(candidate.pageType))
    .sort((left, right) => right.score - left.score || left.url.localeCompare(right.url))
    .slice(0, maxPages);
}

export async function discoverProductPages(
  websiteUrl: string,
  input: ProductPageDiscoveryOptions = {},
): Promise<ProductPageDiscoveryResult> {
  const maxPages = input.maxPages ?? DEFAULT_MAX_PAGES;
  const maxSitemaps = input.maxSitemaps ?? DEFAULT_MAX_SITEMAPS;
  const maxSitemapUrls = input.maxSitemapUrls ?? DEFAULT_MAX_SITEMAP_URLS;
  const homepage = await safeFetchText(websiteUrl, input.fetchOptions);
  const homepageUrl = new URL(homepage.finalUrl);
  const candidates = new Map<string, DiscoveredIntelligencePage>();
  const warnings: string[] = [];

  for (const candidate of extractHomepageCandidates(homepage.body, homepageUrl.toString())) {
    candidates.set(candidate.url, candidate);
  }

  let sitemapUrls: string[] = [];
  if (input.includeSitemaps !== false) {
    try {
      const robotsUrl = new URL('/robots.txt', homepageUrl).toString();
      const robots = await safeFetchText(robotsUrl, { ...input.fetchOptions, respectRobots: false });
      sitemapUrls = extractRobotsSitemaps(robots.body, homepageUrl.origin);
    } catch (error) {
      warnings.push(`robots: ${error instanceof Error ? error.message : 'unavailable'}`);
    }
    if (sitemapUrls.length === 0) sitemapUrls = [new URL('/sitemap.xml', homepageUrl).toString()];
  }

  const sitemapQueue = sitemapUrls.slice(0, maxSitemaps);
  const visitedSitemaps = new Set<string>();
  let inspectedUrls = 0;

  while (sitemapQueue.length > 0 && visitedSitemaps.size < maxSitemaps && inspectedUrls < maxSitemapUrls) {
    const sitemapUrl = sitemapQueue.shift();
    if (!sitemapUrl || visitedSitemaps.has(sitemapUrl)) continue;
    visitedSitemaps.add(sitemapUrl);

    try {
      const sitemap = await safeFetchText(sitemapUrl, input.fetchOptions);
      for (const location of extractSitemapLocations(sitemap.body, sitemap.finalUrl)) {
        if (inspectedUrls >= maxSitemapUrls) break;
        inspectedUrls += 1;
        if (/\.xml(?:$|\?)/i.test(location)) {
          if (sitemapQueue.length + visitedSitemaps.size < maxSitemaps) sitemapQueue.push(location);
          continue;
        }
        const url = normalizeCandidateUrl(location, homepageUrl);
        if (!url) continue;
        const classification = classifyDiscoveredPage(url);
        if (classification.pageType === 'other') continue;
        upsertCandidate(candidates, url, 'sitemap', null);
      }
    } catch (error) {
      warnings.push(`sitemap ${sitemapUrl}: ${error instanceof Error ? error.message : 'unavailable'}`);
    }
  }

  if (input.includeCommonPaths !== false) {
    for (const candidate of buildCommonPathCandidates(homepageUrl.toString())) {
      if (!candidates.has(candidate.url)) candidates.set(candidate.url, candidate);
    }
  }

  return {
    homepageUrl: homepageUrl.toString(),
    pages: selectDiscoveredPages(Array.from(candidates.values()), maxPages, input.allowedPageTypes),
    sitemapUrls: Array.from(visitedSitemaps),
    warnings,
  };
}
