const baseUrl = (process.env.SEO_BASE_URL || 'https://aibesttool.com').replace(/\/$/, '');
const privatePaths = [
  '/cn/profile/stack',
  '/cn/profile/trials',
  '/cn/profile/trials/00000000-0000-4000-8000-000000000000',
];

function hasNoindex(response: Response, body: string) {
  const header = response.headers.get('x-robots-tag') || '';
  const meta = body.match(/<meta name="robots" content="([^"]+)"/)?.[1] || '';
  return `${header},${meta}`.toLowerCase().includes('noindex');
}

async function fetchText(path: string) {
  const response = await fetch(`${baseUrl}${path}`, {
    redirect: 'follow',
    headers: { 'user-agent': 'ai-best-tool-stack-privacy-smoke/1.0' },
  });
  return { response, body: await response.text() };
}

async function run() {
  let failures = 0;
  for (const path of privatePaths) {
    try {
      const { response, body } = await fetchText(path);
      const statusOk = response.status >= 200 && response.status < 400;
      const privateMetadata = hasNoindex(response, body);
      const authBoundary = /login|登录/i.test(body);
      if (statusOk && privateMetadata && authBoundary) {
        console.log(`✅ ${path}: ${response.status}, noindex, anonymous login boundary`);
      } else {
        failures += 1;
        console.error(`❌ ${path}: status=${response.status}, noindex=${privateMetadata}, authBoundary=${authBoundary}`);
      }
    } catch (error) {
      failures += 1;
      console.error(`❌ ${path}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  try {
    const { response, body } = await fetchText('/sitemap.xml');
    const privateUrls = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)]
      .map((match) => match[1])
      .filter((url) => /\/profile\/(?:stack|trials)(?:\/|$)/.test(new URL(url).pathname));
    if (response.ok && privateUrls.length === 0) {
      console.log('✅ /sitemap.xml: no Stack or Trial private URLs');
    } else {
      failures += 1;
      console.error(`❌ /sitemap.xml: found ${privateUrls.length} private URL(s)`);
    }
  } catch (error) {
    failures += 1;
    console.error(`❌ /sitemap.xml: ${error instanceof Error ? error.message : String(error)}`);
  }

  if (failures) throw new Error(`STK production privacy smoke failed with ${failures} issue(s).`);
  console.log(`\n✅ STK production privacy smoke passed for ${baseUrl}`);
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
