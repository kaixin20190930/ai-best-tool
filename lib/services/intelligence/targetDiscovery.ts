import { JSDOM } from 'jsdom';

import {
  extractRobotsSitemaps,
  extractSitemapLocations,
} from '@/lib/services/intelligence/pageDiscovery';
import { safeFetchText, type SafeFetchOptions } from '@/lib/services/intelligence/safeFetch';
import type {
  DistributionTargetDiscoveryResult,
  DistributionTargetPageDiscovery,
  DistributionTargetPageType,
  DistributionTargetRequirements,
  DistributionTargetStatus,
} from '@/lib/services/intelligence/types';

const DEFAULT_MAX_PAGES = 12;
const DEFAULT_MAX_SITEMAPS = 2;
const DEFAULT_MAX_SITEMAP_URLS = 120;

const targetCommonPaths: Array<{ path: string; pageType: DistributionTargetPageType; score: number }> = [
  { path: '/submit', pageType: 'submission', score: 96 },
  { path: '/submit-tool', pageType: 'submission', score: 96 },
  { path: '/submit-your-tool', pageType: 'submission', score: 96 },
  { path: '/add', pageType: 'submission', score: 92 },
  { path: '/add-listing', pageType: 'submission', score: 92 },
  { path: '/add-your-tool', pageType: 'submission', score: 92 },
  { path: '/list', pageType: 'submission', score: 90 },
  { path: '/launch', pageType: 'submission', score: 88 },
  { path: '/new', pageType: 'submission', score: 86 },
  { path: '/register', pageType: 'registration', score: 96 },
  { path: '/signup', pageType: 'registration', score: 95 },
  { path: '/sign-up', pageType: 'registration', score: 95 },
  { path: '/join', pageType: 'registration', score: 92 },
  { path: '/pricing', pageType: 'pricing', score: 94 },
  { path: '/plans', pageType: 'pricing', score: 92 },
  { path: '/pricing-plans', pageType: 'pricing', score: 92 },
  { path: '/contact', pageType: 'contact', score: 80 },
  { path: '/community', pageType: 'community', score: 78 },
  { path: '/forum', pageType: 'community', score: 76 },
  { path: '/discord', pageType: 'community', score: 76 },
  { path: '/docs', pageType: 'documentation', score: 60 },
];

const anchorMatchers: Array<{ pageType: DistributionTargetPageType; patterns: RegExp[] }> = [
  {
    pageType: 'submission',
    patterns: [
      /\bsubmit\b/i,
      /\bsubmit your (?:tool|site|product)\b/i,
      /\badd (?:your )?(?:tool|site|listing)\b/i,
      /\bget listed\b/i,
      /\blist your (?:tool|site|product)\b/i,
      /\blaunch\b/i,
    ],
  },
  {
    pageType: 'registration',
    patterns: [/\bregister\b/i, /\bsign up\b/i, /\bsign[- ]?up\b/i, /\bjoin\b/i, /\bcreate account\b/i],
  },
  {
    pageType: 'pricing',
    patterns: [/\bpricing\b/i, /\bplans?\b/i, /\bsubscription\b/i, /\bmembership\b/i],
  },
  {
    pageType: 'contact',
    patterns: [/\bcontact\b/i, /\bpartner\b/i, /\badvertis(e|ing)\b/i, /\bsponsor\b/i],
  },
  {
    pageType: 'community',
    patterns: [/\bcommunity\b/i, /\bdiscord\b/i, /\bforum\b/i, /\breddit\b/i, /\bslack\b/i],
  },
  {
    pageType: 'documentation',
    patterns: [/\bguidelines?\b/i, /\bfaq\b/i, /\bhelp\b/i, /\bdocs?\b/i],
  },
];

const bodyMatchers: Array<{ pageType: DistributionTargetPageType; patterns: RegExp[] }> = [
  {
    pageType: 'submission',
    patterns: [
      /\bsubmit(?: your)? (?:tool|site|product)\b/i,
      /\badd(?: your)? (?:tool|site|listing)\b/i,
      /\bget listed\b/i,
      /\blisting review\b/i,
    ],
  },
  {
    pageType: 'registration',
    patterns: [/\bcreate an account\b/i, /\blog in\b/i, /\bsign in\b/i, /\bregister\b/i],
  },
  {
    pageType: 'pricing',
    patterns: [
      /[$€£]\s?\d+(?:[.,]\d+)?/i,
      /\bper (?:month|year|user|seat)\b/i,
      /\bmonthly\b/i,
      /\byearly\b/i,
      /\bpaid\b/i,
    ],
  },
  {
    pageType: 'contact',
    patterns: [/\bcontact us\b/i, /\bemail us\b/i, /\bsend us a message\b/i],
  },
  {
    pageType: 'community',
    patterns: [/\bdiscord\b/i, /\bslack\b/i, /\bforum\b/i, /\bcommunity\b/i, /\breddit\b/i],
  },
];

function normalizeText(value: string | null | undefined, maxLength = 600): string {
  return (value || '').replace(/\s+/g, ' ').trim().slice(0, maxLength);
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

  url.hash = '';
  for (const key of Array.from(url.searchParams.keys())) {
    if (/^(?:utm_|gclid|fbclid|ref|source)/i.test(key)) url.searchParams.delete(key);
  }

  if (url.pathname !== '/') url.pathname = url.pathname.replace(/\/+$/, '');
  return url;
}

function classifyTargetPage(page: {
  url: URL;
  title: string;
  description: string;
  bodyText: string;
  anchorText: string | null;
}): { pageType: DistributionTargetPageType; score: number; signals: string[] } {
  const signals: string[] = [];
  const signalText = [page.url.pathname, page.anchorText || '', page.title, page.description, page.bodyText]
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (page.url.pathname === '/' || page.url.pathname === '') {
    return { pageType: 'homepage', score: 100, signals: ['homepage'] };
  }

  let pageType: DistributionTargetPageType = 'other';
  let score = 20;

  for (const matcher of anchorMatchers) {
    if (matcher.patterns.some((pattern) => pattern.test(signalText))) {
      signals.push(`anchor:${matcher.pageType}`);
      if (
        matcher.pageType === 'submission' ||
        (matcher.pageType === 'registration' && pageType !== 'submission') ||
        (matcher.pageType === 'pricing' && pageType === 'other') ||
        (matcher.pageType === 'contact' && pageType === 'other')
      ) {
        pageType = matcher.pageType;
        score = Math.max(score, matcher.pageType === 'submission' ? 96 : matcher.pageType === 'registration' ? 94 : 84);
      }
    }
  }

  for (const matcher of bodyMatchers) {
    if (matcher.patterns.some((pattern) => pattern.test(signalText))) {
      signals.push(`body:${matcher.pageType}`);
      if (matcher.pageType === 'submission' && pageType !== 'submission') {
        pageType = 'submission';
        score = Math.max(score, 90);
      } else if (matcher.pageType === 'registration' && pageType === 'other') {
        pageType = 'registration';
        score = Math.max(score, 84);
      } else if (matcher.pageType === 'pricing' && pageType === 'other') {
        pageType = 'pricing';
        score = Math.max(score, 82);
      } else if (matcher.pageType === 'contact' && pageType === 'other') {
        pageType = 'contact';
        score = Math.max(score, 72);
      } else if (matcher.pageType === 'community' && pageType === 'other') {
        pageType = 'community';
        score = Math.max(score, 70);
      }
    }
  }

  if (pageType === 'other') {
    if (/\bsubmit\b|\badd\b|\blist\b|\blaunch\b/i.test(signalText)) {
      pageType = 'submission';
      score = 70;
    } else if (/\bregister\b|\bsign up\b|\bjoin\b/i.test(signalText)) {
      pageType = 'registration';
      score = 68;
    } else if (/\bpricing\b|\bplans?\b|\bsubscription\b/i.test(signalText)) {
      pageType = 'pricing';
      score = 66;
    }
  }

  return { pageType, score, signals };
}

function buildCommonPathCandidates(homepageUrl: string): DistributionTargetPageDiscovery[] {
  const baseUrl = new URL(homepageUrl);
  return targetCommonPaths.map(({ path, pageType, score }) => ({
    url: new URL(path, baseUrl).toString(),
    pageType,
    discoveryMethod: 'common_path',
    score,
    anchorText: null,
    title: null,
    excerpt: null,
    httpStatus: null,
    finalUrl: new URL(path, baseUrl).toString(),
    signals: [`common_path:${path}`],
  }));
}

function upsertPage(
  pages: Map<string, DistributionTargetPageDiscovery>,
  page: DistributionTargetPageDiscovery,
) {
  const current = pages.get(page.url);
  if (!current || page.score > current.score) pages.set(page.url, page);
}

function extractHomepageCandidates(html: string, homepageUrl: string): DistributionTargetPageDiscovery[] {
  const baseUrl = new URL(homepageUrl);
  const { document } = new JSDOM(html, { url: baseUrl.toString() }).window;
  const pages = new Map<string, DistributionTargetPageDiscovery>();

  upsertPage(pages, {
    url: baseUrl.toString(),
    pageType: 'homepage',
    discoveryMethod: 'homepage_link',
    score: 100,
    anchorText: null,
    title: normalizeText(document.title, 180) || null,
    excerpt: normalizeText(document.body?.textContent || '', 360) || null,
    httpStatus: null,
    finalUrl: baseUrl.toString(),
    signals: ['homepage'],
  });

  for (const anchor of Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href]'))) {
    const url = normalizeCandidateUrl(anchor.getAttribute('href') || '', baseUrl);
    if (!url) continue;
    const anchorText = normalizeText(anchor.textContent || anchor.getAttribute('aria-label') || '', 180) || null;
    const classification = classifyTargetPage({
      url,
      title: anchorText || '',
      description: '',
      bodyText: '',
      anchorText,
    });
    if (classification.pageType === 'other') continue;
    upsertPage(pages, {
      url: url.toString(),
      pageType: classification.pageType,
      discoveryMethod: 'homepage_link',
      score: Math.min(100, classification.score + 4),
      anchorText,
      title: null,
      excerpt: null,
      httpStatus: null,
      finalUrl: url.toString(),
      signals: classification.signals,
    });
  }

  return Array.from(pages.values()).sort((left, right) => right.score - left.score || left.url.localeCompare(right.url));
}

function parseExpectedReviewDays(bodyText: string): number | null {
  const rangeMatch = bodyText.match(/(\d{1,2})\s*(?:to|[-–])\s*(\d{1,2})\s*(?:business\s*)?days?/i);
  if (rangeMatch) {
    return Math.round((Number(rangeMatch[1]) + Number(rangeMatch[2])) / 2);
  }

  const firstMatch = bodyText.match(/\b(?:within|in|after)\s*(\d{1,2})\s*(?:business\s*)?days?\b/i);
  if (firstMatch) return Number(firstMatch[1]);

  return null;
}

function deriveRequirements(input: {
  pages: DistributionTargetPageDiscovery[];
  pageTextByUrl: Map<string, string>;
  titleByUrl: Map<string, string>;
}): DistributionTargetRequirements {
  const combinedText = Array.from(input.pageTextByUrl.values()).join(' ').toLowerCase();
  const titleText = Array.from(input.titleByUrl.values()).join(' ').toLowerCase();
  const text = `${combinedText} ${titleText}`;
  const pricingText = Array.from(input.pages.filter((page) => page.pageType === 'pricing').map((page) => input.pageTextByUrl.get(page.url) || '')).join(' ');
  const reviewText = text;

  return {
    requiresAccount: /\b(log in|login|sign in|account|register|sign up)\b/i.test(text),
    requiresPayment: /\b(paid|payment|price|pricing|plan|subscription|membership)\b/i.test(pricingText || text),
    requiresCaptcha: /\b(captcha|cloudflare|verify you are human|human verification)\b/i.test(text),
    requiresBacklink: /\b(backlink|link back|reciprocal link|add our badge|featured badge)\b/i.test(text),
    editorialReview: /\b(review|approval|moderation|manual review|pending review|editorial)\b/i.test(text),
    expectedReviewDays: parseExpectedReviewDays(reviewText),
  };
}

function computeTargetStatus(input: {
  discoveredPages: DistributionTargetPageDiscovery[];
  requirements: DistributionTargetRequirements;
  blockedSignals: string[];
}): DistributionTargetStatus {
  if (input.blockedSignals.some((signal) => signal.includes('captcha') || signal.includes('login'))) {
    return 'blocked';
  }
  if (input.discoveredPages.length === 0) {
    return 'stale';
  }
  if (
    input.requirements.requiresCaptcha ||
    input.requirements.requiresAccount ||
    input.requirements.requiresPayment ||
    input.requirements.editorialReview
  ) {
    return 'stale';
  }
  return 'active';
}

async function inspectCandidatePage(
  page: DistributionTargetPageDiscovery,
  fetchOptions: SafeFetchOptions | undefined,
) {
  const result = await safeFetchText(page.url, fetchOptions);
  const { document } = new JSDOM(result.body, { url: result.finalUrl }).window;
  const title = normalizeText(document.title, 220);
  const description = normalizeText(
    document.querySelector<HTMLMetaElement>('meta[name="description"]')?.content ||
      document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.content,
    360,
  );
  const main = document.querySelector('main, article, [role="main"]') || document.body;
  const bodyText = normalizeText(main?.textContent || document.body.textContent || '', 3_500);
  const classification = classifyTargetPage({
    url: new URL(result.finalUrl),
    title,
    description,
    bodyText,
    anchorText: page.anchorText,
  });

  const blockers: string[] = [];
  if ([401, 403].includes(result.status)) blockers.push('login_wall');
  if (result.status === 429) blockers.push('rate_limited');
  if (result.status >= 500) blockers.push('server_error');
  if (/\b(captcha|cloudflare|verify you are human|access denied)\b/i.test(bodyText)) blockers.push('captcha');
  if (/404|not found/i.test(title) || /404|not found/i.test(bodyText)) blockers.push('missing_page');

  return {
    finalUrl: result.finalUrl,
    httpStatus: result.status,
    title,
    description,
    bodyText,
    classification,
    blockers,
    excerpt: bodyText.slice(0, 500) || null,
  };
}

function collapsePageList(
  pages: DistributionTargetPageDiscovery[],
): {
  submissionUrl: string | null;
  registrationUrl: string | null;
  pricingUrl: string | null;
  contactUrl: string | null;
  communityUrl: string | null;
} {
  const pick = (pageType: DistributionTargetPageType) => pages.find((page) => page.pageType === pageType)?.finalUrl || null;
  return {
    submissionUrl: pick('submission'),
    registrationUrl: pick('registration'),
    pricingUrl: pick('pricing'),
    contactUrl: pick('contact'),
    communityUrl: pick('community'),
  };
}

export async function discoverDistributionTargetPages(
  homepageUrl: string,
  input: {
    maxPages?: number;
    maxSitemaps?: number;
    maxSitemapUrls?: number;
    includeCommonPaths?: boolean;
    fetchOptions?: SafeFetchOptions;
  } = {},
): Promise<DistributionTargetDiscoveryResult> {
  const maxPages = input.maxPages ?? DEFAULT_MAX_PAGES;
  const maxSitemaps = input.maxSitemaps ?? DEFAULT_MAX_SITEMAPS;
  const maxSitemapUrls = input.maxSitemapUrls ?? DEFAULT_MAX_SITEMAP_URLS;
  const homepage = await safeFetchText(homepageUrl, input.fetchOptions);
  const finalHomepageUrl = new URL(homepage.finalUrl);
  const pagesByUrl = new Map<string, DistributionTargetPageDiscovery>();
  const pageTextByUrl = new Map<string, string>();
  const titleByUrl = new Map<string, string>();
  const warnings: string[] = [];
  const blockedSignals: string[] = [];

  for (const candidate of extractHomepageCandidates(homepage.body, finalHomepageUrl.toString())) {
    pagesByUrl.set(candidate.url, candidate);
  }

  let sitemapUrls: string[] = [];
  try {
    const robotsUrl = new URL('/robots.txt', finalHomepageUrl).toString();
    const robots = await safeFetchText(robotsUrl, { ...input.fetchOptions, respectRobots: false });
    sitemapUrls = extractRobotsSitemaps(robots.body, finalHomepageUrl.origin);
  } catch (error) {
    warnings.push(`robots: ${error instanceof Error ? error.message : 'unavailable'}`);
  }
  if (sitemapUrls.length === 0) sitemapUrls = [new URL('/sitemap.xml', finalHomepageUrl).toString()];

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
        const url = normalizeCandidateUrl(location, finalHomepageUrl);
        if (!url) continue;
        const classification = classifyTargetPage({
          url,
          title: '',
          description: '',
          bodyText: '',
          anchorText: null,
        });
        if (classification.pageType === 'other') continue;
        upsertPage(pagesByUrl, {
          url: url.toString(),
          pageType: classification.pageType,
          discoveryMethod: 'sitemap',
          score: classification.score,
          anchorText: null,
          title: null,
          excerpt: null,
          httpStatus: null,
          finalUrl: url.toString(),
          signals: classification.signals,
        });
      }
    } catch (error) {
      warnings.push(`sitemap ${sitemapUrl}: ${error instanceof Error ? error.message : 'unavailable'}`);
    }
  }

  if (input.includeCommonPaths !== false) {
    for (const candidate of buildCommonPathCandidates(finalHomepageUrl.toString())) {
      if (!pagesByUrl.has(candidate.url)) pagesByUrl.set(candidate.url, candidate);
    }
  }

  const discoveredCandidates = Array.from(pagesByUrl.values()).sort(
    (left, right) => right.score - left.score || left.url.localeCompare(right.url),
  );

  const inspectedPages: DistributionTargetPageDiscovery[] = [];
  for (const candidate of discoveredCandidates.slice(0, maxPages)) {
    try {
      const inspected = await inspectCandidatePage(candidate, input.fetchOptions);
      const merged: DistributionTargetPageDiscovery = {
        ...candidate,
        url: candidate.url,
        finalUrl: inspected.finalUrl,
        httpStatus: inspected.httpStatus,
        title: inspected.title || candidate.title || null,
        excerpt: inspected.excerpt || candidate.excerpt || null,
        score: Math.max(candidate.score, inspected.classification.score),
        pageType: inspected.classification.pageType,
        signals: Array.from(new Set([...candidate.signals, ...inspected.classification.signals])),
      };
      inspectedPages.push(merged);
      pageTextByUrl.set(merged.url, inspected.bodyText);
      titleByUrl.set(merged.url, merged.title || '');
      if (inspected.blockers.includes('login_wall')) blockedSignals.push(`login_wall:${merged.url}`);
      if (inspected.blockers.includes('captcha')) blockedSignals.push(`captcha:${merged.url}`);
      if (inspected.blockers.includes('server_error')) blockedSignals.push(`server_error:${merged.url}`);
      if (inspected.blockers.includes('missing_page')) blockedSignals.push(`missing_page:${merged.url}`);
    } catch (error) {
      warnings.push(`${candidate.url}: ${error instanceof Error ? error.message : 'unavailable'}`);
    }
  }

  const requirements = deriveRequirements({
    pages: inspectedPages,
    pageTextByUrl,
    titleByUrl,
  });

  const targetStatus = computeTargetStatus({
    discoveredPages: inspectedPages,
    requirements,
    blockedSignals,
  });

  const collapsed = collapsePageList(inspectedPages);
  const signals = {
    homepageTitle: normalizeText(homepage.body ? new JSDOM(homepage.body, { url: homepage.finalUrl }).window.document.title : '', 220) || null,
    inspectedCount: inspectedPages.length,
    blockedSignals,
  };

  return {
    homepageUrl: finalHomepageUrl.toString(),
    finalUrl: homepage.finalUrl,
    targetStatus,
    pages: inspectedPages,
    sitemapUrls: Array.from(visitedSitemaps),
    warnings,
    signals,
    requirements,
    ...collapsed,
  };
}
