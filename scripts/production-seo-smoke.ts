const requestBaseUrl = (process.env.SEO_BASE_URL || 'https://aibesttool.com').replace(/\/$/, '');
const canonicalBaseUrl = (process.env.SEO_CANONICAL_BASE_URL || 'https://aibesttool.com').replace(/\/$/, '');
const isCanonicalHostCheck = new URL(requestBaseUrl).hostname === new URL(canonicalBaseUrl).hostname;
const corePaths = [
  '/ai/claude',
  '/cn',
  '/cn/explore',
  '/cn/guides',
  '/cn/best-ai-tools',
  '/cn/best-ai-tools/ai-writing-tools',
  '/cn/categories/developer-tools',
  '/cn/ai/fathom',
  '/cn/ai/pipedream',
  '/cn/ai/claude',
];
const breadcrumbPaths = new Set(corePaths.filter((path) => path !== '/cn'));

function getExpectedAlternates(path: string) {
  const englishPath = path === '/cn' ? '/' : path.replace(/^\/cn(?=\/|$)/, '') || '/';
  const chinesePath = englishPath === '/' ? '/cn' : `/cn${englishPath}`;

  return {
    canonical: `${canonicalBaseUrl}${path === '/' ? '' : path}`,
    cn: `${canonicalBaseUrl}${chinesePath}`,
    en: `${canonicalBaseUrl}${englishPath === '/' ? '' : englishPath}`,
    xDefault: `${canonicalBaseUrl}${englishPath === '/' ? '' : englishPath}`,
  };
}

function getLinkHref(body: string, rel: 'canonical' | 'alternate', hrefLang?: string) {
  const tags = body.match(/<link\s+[^>]*>/g) || [];
  const tag = tags.find(
    (candidate) => candidate.includes(`rel="${rel}"`) && (!hrefLang || candidate.includes(`hrefLang="${hrefLang}"`)),
  );
  return tag?.match(/href="([^"]+)"/)?.[1] || null;
}

function hasExpectedMetadata(body: string, path: string) {
  const expected = getExpectedAlternates(path);
  return (
    getLinkHref(body, 'canonical') === expected.canonical &&
    getLinkHref(body, 'alternate', 'en') === expected.en &&
    getLinkHref(body, 'alternate', 'cn') === expected.cn &&
    getLinkHref(body, 'alternate', 'x-default') === expected.xDefault
  );
}

function hasExpectedCanonical(body: string, path: string) {
  return getLinkHref(body, 'canonical') === getExpectedAlternates(path).canonical;
}

function isNoindexResponse(response: Response, body: string) {
  const header = response.headers.get('x-robots-tag') || '';
  const robotsMeta = body.match(/<meta name="robots" content="([^"]+)"/)?.[1] || '';
  return `${header},${robotsMeta}`.toLowerCase().includes('noindex');
}

function getDecisionCardLinks(body: string) {
  return Array.from(new Set([...body.matchAll(/href="([^"]+?#decision-card)"/g)].map((match) => match[1])));
}

function hasSingleBreadcrumbPair(body: string) {
  const visibleCount = (body.match(/<nav aria-label="Breadcrumb"/g) || []).length;
  const breadcrumbSchemaCount = [
    ...body.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g),
  ].filter((match) => match[1].includes('BreadcrumbList')).length;

  return visibleCount === 1 && breadcrumbSchemaCount === 1;
}

async function fetchText(path: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);

  try {
    const response = await fetch(`${requestBaseUrl}${path}`, {
      headers: { 'user-agent': 'ai-best-tool-seo-smoke/1.0' },
      redirect: 'follow',
      signal: controller.signal,
    });
    return { response, body: await response.text() };
  } finally {
    clearTimeout(timeout);
  }
}

async function checkCanonicalRedirect(sourceUrl: string, expectedPath: string) {
  const response = await fetch(sourceUrl, {
    headers: { 'user-agent': 'ai-best-tool-seo-smoke/1.0' },
    redirect: 'manual',
  });
  const location = response.headers.get('location');
  const expectedUrl = new URL(expectedPath, canonicalBaseUrl).toString();
  const redirectedUrl = location ? new URL(location, sourceUrl).toString() : null;

  return {
    status: response.status,
    location: redirectedUrl,
    passes: [301, 302, 307, 308].includes(response.status) && redirectedUrl === expectedUrl,
  };
}

async function runSmokeCheck() {
  let failures = 0;

  for (const path of corePaths) {
    try {
      const { response, body } = await fetchText(path);
      if (response.status >= 200 && response.status < 400) {
        console.log(`✅ ${path}: ${response.status}`);
      } else {
        failures++;
        console.error(`❌ ${path}: ${response.status}`);
        continue;
      }

      if (breadcrumbPaths.has(path)) {
        if (hasSingleBreadcrumbPair(body)) {
          console.log(`✅ ${path}: visible breadcrumb and JSON-LD are aligned`);
        } else {
          failures++;
          console.error(`❌ ${path}: expected one visible breadcrumb and one BreadcrumbList JSON-LD`);
        }
      }

      if (!hasExpectedCanonical(body, path)) {
        failures++;
        console.error(`❌ ${path}: canonical is not aligned`);
      } else if (isNoindexResponse(response, body)) {
        console.log(`✅ ${path}: canonical aligned and noindex boundary explicit`);
      } else if (hasExpectedMetadata(body, path)) {
        console.log(`✅ ${path}: canonical and en/cn/x-default alternates are aligned`);
      } else {
        failures++;
        console.error(`❌ ${path}: indexable page hreflang alternates are not aligned`);
      }

      if (path === '/ai/claude' || path === '/cn/ai/claude') {
        const decisionLinks = getDecisionCardLinks(body);
        const expectedPrefix = path.startsWith('/cn/') ? '/cn/ai/' : '/ai/';
        const localeSafe = decisionLinks.every(
          (href) => href.startsWith(expectedPrefix) && !href.startsWith('/en/') && !href.includes('/cn/cn/'),
        );
        if (body.includes('data-reviewed-tool-relationships') && decisionLinks.length >= 2 && localeSafe) {
          console.log(`✅ ${path}: ${decisionLinks.length} reviewed relationship links are locale-safe`);
        } else {
          failures++;
          console.error(
            `❌ ${path}: reviewed relationship module missing or links invalid (${decisionLinks.join(', ') || 'none'})`,
          );
        }
      }
    } catch (error) {
      failures++;
      console.error(`❌ ${path}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  try {
    const { response } = await fetchText('/cn/guides/ai-coding-tools-comparison');
    const robotsTag = response.headers.get('x-robots-tag') || '';
    if (response.ok && robotsTag.toLowerCase().includes('noindex')) {
      console.log('✅ comparison guide: 200 with X-Robots-Tag noindex');
    } else {
      failures++;
      console.error(`❌ comparison guide: status ${response.status}, X-Robots-Tag ${robotsTag || 'missing'}`);
    }
  } catch (error) {
    failures++;
    console.error(`❌ comparison guide: ${error instanceof Error ? error.message : String(error)}`);
  }

  if (isCanonicalHostCheck) {
    for (const [label, sourceUrl, expectedPath] of [
      ['www', 'https://www.aibesttool.com/cn', '/cn'],
      ['http', 'http://aibesttool.com/cn', '/cn'],
    ] as const) {
      try {
        const redirect = await checkCanonicalRedirect(sourceUrl, expectedPath);
        if (redirect.passes) {
          console.log(`✅ ${label} canonical redirect: ${redirect.status} -> ${redirect.location}`);
        } else {
          failures++;
          console.error(
            `❌ ${label} canonical redirect: ${redirect.status} -> ${redirect.location || 'missing location'}`,
          );
        }
      } catch (error) {
        failures++;
        console.error(`❌ ${label} canonical redirect: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  } else {
    console.log('✅ canonical host redirects: skipped for local request base');
  }

  try {
    const { response: robotsResponse, body: robots } = await fetchText('/robots.txt');
    if (robotsResponse.ok && robots.includes(`Sitemap: ${canonicalBaseUrl}/sitemap.xml`)) {
      console.log('✅ /robots.txt: sitemap directive present');
    } else {
      failures++;
      console.error(`❌ /robots.txt: status ${robotsResponse.status} or sitemap directive missing`);
    }
  } catch (error) {
    failures++;
    console.error(`❌ /robots.txt: ${error instanceof Error ? error.message : String(error)}`);
  }

  try {
    const { response: sitemapResponse, body: sitemap } = await fetchText('/sitemap.xml');
    const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
    const internalUrls = urls.filter((url) =>
      /\/(admin|login|register|profile|pricing|submit|developer\/listing|new|startup)(\/|$)/.test(
        new URL(url).pathname,
      ),
    );
    const comparisonUrls = urls.filter((url) => url.includes('comparison'));

    if (sitemapResponse.ok && urls.length > 0 && internalUrls.length === 0 && comparisonUrls.length === 0) {
      console.log(`✅ /sitemap.xml: ${urls.length} URLs, no internal or comparison paths`);
    } else {
      failures++;
      console.error(
        `❌ /sitemap.xml: status ${sitemapResponse.status}, URLs ${urls.length}, internal ${internalUrls.length}, comparison ${comparisonUrls.length}`,
      );
    }
  } catch (error) {
    failures++;
    console.error(`❌ /sitemap.xml: ${error instanceof Error ? error.message : String(error)}`);
  }

  if (failures > 0) {
    throw new Error(`Production SEO smoke check failed with ${failures} issue(s).`);
  }

  console.log(`\n✅ Production SEO smoke check passed for ${requestBaseUrl}`);
}

runSmokeCheck().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
