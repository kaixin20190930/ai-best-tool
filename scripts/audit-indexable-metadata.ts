import fs from 'node:fs';
import path from 'node:path';

type PageType = 'home' | 'explore' | 'category' | 'guide' | 'best-root' | 'best-topic' | 'tool' | 'other';

type PageAudit = {
  url: string;
  pathname: string;
  pageType: PageType;
  status: number | null;
  title: string | null;
  description: string | null;
  canonical: string | null;
  robots: string | null;
  h1: string | null;
  issues: string[];
};

const baseUrl = (process.env.SEO_BASE_URL || 'https://aibesttool.com').replace(/\/$/, '');
const outputArg = process.argv.find((arg) => arg.startsWith('--output='))?.slice('--output='.length);

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/');
}

function cleanText(value: string | undefined) {
  if (!value) return null;
  return (
    decodeHtml(
      value
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim(),
    ) || null
  );
}

function getTagAttribute(tag: string, name: string) {
  const match = tag.match(new RegExp(`${name}=["']([^"']*)["']`, 'i'));
  return match ? decodeHtml(match[1].trim()) : null;
}

function getMetaContent(html: string, name: string) {
  const tags = html.match(/<meta\s+[^>]*>/gi) || [];
  const tag = tags.find((candidate) => getTagAttribute(candidate, 'name')?.toLowerCase() === name.toLowerCase());
  return tag ? getTagAttribute(tag, 'content') : null;
}

function getCanonical(html: string) {
  const tags = html.match(/<link\s+[^>]*>/gi) || [];
  const tag = tags.find((candidate) => getTagAttribute(candidate, 'rel')?.toLowerCase() === 'canonical');
  return tag ? getTagAttribute(tag, 'href') : null;
}

function classifyPath(pathname: string): PageType {
  const normalized = pathname.replace(/^\/cn(?=\/|$)/, '') || '/';
  if (normalized === '/') return 'home';
  if (normalized === '/explore') return 'explore';
  if (normalized === '/best-ai-tools') return 'best-root';
  if (normalized.startsWith('/best-ai-tools/')) return 'best-topic';
  if (normalized === '/guides' || normalized.startsWith('/guides/')) return 'guide';
  if (normalized.startsWith('/categories/')) return 'category';
  if (normalized.startsWith('/ai/')) return 'tool';
  return 'other';
}

function expectedIntent(pageType: PageType) {
  switch (pageType) {
    case 'home':
      return 'Discover and compare a curated AI tools directory';
    case 'explore':
      return 'Filter AI tools by task, category, and pricing';
    case 'category':
      return 'Compare tools within one stable category';
    case 'guide':
      return 'Solve one task or learn one selection method';
    case 'best-root':
      return 'Choose a use-case shortlist and understand the ranking method';
    case 'best-topic':
      return 'Compare a maintained shortlist for one concrete use case';
    case 'tool':
      return 'Decide whether one product fits, based on evidence and limitations';
    default:
      return 'Unclassified indexable search intent';
  }
}

async function mapConcurrent<T, R>(items: T[], limit: number, mapper: (item: T) => Promise<R>) {
  const results = new Array<R>(items.length);
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (cursor < items.length) {
        const index = cursor++;
        results[index] = await mapper(items[index]);
      }
    }),
  );
  return results;
}

async function fetchPage(url: string): Promise<PageAudit> {
  const pathname = new URL(url).pathname;
  const pageType = classifyPath(pathname);
  const fetchUrl = `${baseUrl}${pathname}`;
  try {
    const response = await fetch(fetchUrl, {
      headers: { 'user-agent': 'ai-best-tool-metadata-inventory/1.0' },
      redirect: 'follow',
      signal: AbortSignal.timeout(20_000),
    });
    const html = await response.text();
    const title = cleanText(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]);
    const description = getMetaContent(html, 'description');
    const canonical = getCanonical(html);
    const robots = getMetaContent(html, 'robots');
    const h1 = cleanText(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]);
    const issues: string[] = [];
    if (!response.ok) issues.push(`http_${response.status}`);
    if (!title) issues.push('missing_title');
    if (!description) issues.push('missing_description');
    if (!canonical) issues.push('missing_canonical');
    if (canonical && canonical !== url) issues.push('canonical_mismatch');
    if ((robots || '').toLowerCase().includes('noindex')) issues.push('sitemap_noindex_conflict');
    if (!h1) issues.push('missing_h1');
    if (title && title.length > 65) issues.push('long_title_review');
    if (description && description.length > 170) issues.push('long_description_review');
    if (pageType === 'tool' && title && / - (?:.+ )?AI Tool(?: \| AI Best Tool)?$/i.test(title)) {
      issues.push('generic_tool_title');
    }
    return { url, pathname, pageType, status: response.status, title, description, canonical, robots, h1, issues };
  } catch (error) {
    return {
      url,
      pathname,
      pageType,
      status: null,
      title: null,
      description: null,
      canonical: null,
      robots: null,
      h1: null,
      issues: [`fetch_${error instanceof Error ? error.name : 'error'}`],
    };
  }
}

async function main() {
  const sitemapResponse = await fetch(`${baseUrl}/sitemap.xml`, {
    headers: { 'user-agent': 'ai-best-tool-metadata-inventory/1.0' },
    signal: AbortSignal.timeout(20_000),
  });
  if (!sitemapResponse.ok) throw new Error(`sitemap returned ${sitemapResponse.status}`);
  const sitemap = await sitemapResponse.text();
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => decodeHtml(match[1].trim()));
  const pages = await mapConcurrent(urls, 6, fetchPage);

  const duplicateTitles = new Map<string, string[]>();
  const duplicateDescriptions = new Map<string, string[]>();
  for (const page of pages) {
    if (page.title) duplicateTitles.set(page.title, [...(duplicateTitles.get(page.title) || []), page.url]);
    if (page.description) {
      duplicateDescriptions.set(page.description, [...(duplicateDescriptions.get(page.description) || []), page.url]);
    }
  }
  for (const page of pages) {
    if (page.title && (duplicateTitles.get(page.title)?.length || 0) > 1) page.issues.push('duplicate_title');
    if (page.description && (duplicateDescriptions.get(page.description)?.length || 0) > 1) {
      page.issues.push('duplicate_description');
    }
  }

  const byType = Object.fromEntries(
    [...new Set(pages.map((page) => page.pageType))].sort().map((pageType) => {
      const typedPages = pages.filter((page) => page.pageType === pageType);
      return [
        pageType,
        {
          intent: expectedIntent(pageType),
          count: typedPages.length,
          issuePages: typedPages.filter((page) => page.issues.length > 0).length,
        },
      ];
    }),
  );
  const issueCounts = pages
    .flatMap((page) => page.issues)
    .reduce<Record<string, number>>((counts, issue) => {
      counts[issue] = (counts[issue] || 0) + 1;
      return counts;
    }, {});
  const structuralIssues = pages.filter((page) =>
    page.issues.some((issue) =>
      [
        'missing_title',
        'missing_description',
        'missing_canonical',
        'canonical_mismatch',
        'sitemap_noindex_conflict',
        'missing_h1',
      ].includes(issue),
    ),
  );
  const report = {
    auditedAt: new Date().toISOString(),
    baseUrl,
    sitemapUrlCount: urls.length,
    success: structuralIssues.length === 0,
    summary: { byType, issueCounts, structuralIssuePages: structuralIssues.length },
    pages,
  };

  const outputPath = path.resolve(
    outputArg ||
      path.join('reports', 'seo', `indexable-metadata-inventory-${new Date().toISOString().slice(0, 10)}.json`),
  );
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ ...report, pages: undefined, outputPath }, null, 2));
  if (!report.success) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
