const baseUrl = (process.env.SEO_BASE_URL || 'https://aibesttool.com').replace(/\/$/, '');
const corePaths = ['/cn', '/cn/explore', '/cn/best-ai-tools', '/cn/ai/fathom', '/cn/ai/pipedream'];

async function fetchText(path: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      headers: { 'user-agent': 'ai-best-tool-seo-smoke/1.0' },
      redirect: 'follow',
      signal: controller.signal,
    });
    return { response, body: await response.text() };
  } finally {
    clearTimeout(timeout);
  }
}

async function runSmokeCheck() {
  let failures = 0;

  for (const path of corePaths) {
    try {
      const { response } = await fetchText(path);
      if (response.status >= 200 && response.status < 400) {
        console.log(`✅ ${path}: ${response.status}`);
      } else {
        failures++;
        console.error(`❌ ${path}: ${response.status}`);
      }
    } catch (error) {
      failures++;
      console.error(`❌ ${path}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  try {
    const { response: robotsResponse, body: robots } = await fetchText('/robots.txt');
    if (robotsResponse.ok && robots.includes(`Sitemap: ${baseUrl}/sitemap.xml`)) {
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
    const internalUrls = urls.filter((url) => /\/(admin|login|register|profile|pricing|submit|developer\/listing|new|startup)(\/|$)/.test(new URL(url).pathname));
    const comparisonUrls = urls.filter((url) => url.includes('comparison'));

    if (sitemapResponse.ok && urls.length > 0 && internalUrls.length === 0 && comparisonUrls.length === 0) {
      console.log(`✅ /sitemap.xml: ${urls.length} URLs, no internal or comparison paths`);
    } else {
      failures++;
      console.error(`❌ /sitemap.xml: status ${sitemapResponse.status}, URLs ${urls.length}, internal ${internalUrls.length}, comparison ${comparisonUrls.length}`);
    }
  } catch (error) {
    failures++;
    console.error(`❌ /sitemap.xml: ${error instanceof Error ? error.message : String(error)}`);
  }

  if (failures > 0) {
    throw new Error(`Production SEO smoke check failed with ${failures} issue(s).`);
  }

  console.log(`\n✅ Production SEO smoke check passed for ${baseUrl}`);
}

runSmokeCheck().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
