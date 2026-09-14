import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

import {
  copyViolations,
  INTERNAL_DIRECTORIES,
  pageType,
  publicSourceFiles,
  scanRepository,
} from './lib/public-content-boundary';

async function main() {
  const root = process.cwd();
  const findings = scanRepository(root);
  const files = publicSourceFiles(root);
  const byPageType: Record<string, number> = {};
  const byRule: Record<string, number> = {};
  for (const finding of findings) {
    byPageType[pageType(finding.file)] = (byPageType[pageType(finding.file)] || 0) + 1;
    byRule[finding.rule] = (byRule[finding.rule] || 0) + 1;
  }
  const components = files.flatMap((file) => {
    const source = readFileSync(file, 'utf8');
    const instances = Object.fromEntries(
      ['GuideEvidencePanel', 'GuideSubmissionPath', 'ComparisonPage'].map((name) => [
        name,
        (source.match(new RegExp(`<${name}\\b|\\b${name}\\(\\{`, 'g')) || []).length,
      ]),
    );
    return Object.values(instances).some(Boolean) ? [{ file, pageType: pageType(file), ...instances }] : [];
  });
  const baseUrl = process.env.SEO_BASE_URL || 'https://aibesttool.com';
  const production = process.argv.includes('--html')
    ? await Promise.all(
        [
          '/guides/ai-tools-for-web3-comparison',
          '/cn/guides/ai-tools-for-web3-comparison',
          '/cn/guides/ai-tools-for-web3',
          '/cn/guides/ai-automation-tools-comparison',
          '/cn/ai/dune',
        ].map(async (pathname) => {
          const response = await fetch(`${baseUrl}${pathname}`, { signal: AbortSignal.timeout(30_000) });
          const document = new JSDOM(await response.text()).window.document;
          const schema = Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map((el) =>
            JSON.parse(el.textContent || '{}'),
          );
          const seo = {
            title: document.title,
            description: document.querySelector('meta[name="description"]')?.getAttribute('content'),
            canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
            alternates: Array.from(document.querySelectorAll('link[rel="alternate"][hreflang]')).map((el) => [
              el.getAttribute('hreflang'),
              el.getAttribute('href'),
            ]),
            robots: document.querySelector('meta[name="robots"]')?.getAttribute('content'),
            xRobotsTag: response.headers.get('x-robots-tag'),
            schema,
          };
          document.querySelectorAll('script,style,noscript').forEach((el) => el.remove());
          const visibleText = document.body.textContent?.replace(/\s+/g, ' ').trim() || '';
          return {
            url: `${baseUrl}${pathname}`,
            status: response.status,
            seo,
            headings: Array.from(document.querySelectorAll('h1,h2')).map((el) => el.textContent),
            violations: copyViolations(visibleText),
          };
        }),
      )
    : [];
  const output =
    process.argv.find((arg) => arg.startsWith('--output='))?.slice(9) || '/tmp/public-content-boundary-current.json';
  mkdirSync(output.slice(0, output.lastIndexOf('/')), { recursive: true });
  writeFileSync(
    output,
    `${JSON.stringify(
      {
        version: 1,
        checkedAt: new Date().toISOString(),
        baselineSha: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
        scope: 'PUB-01 sample-first; unchanged exact legacy findings remain debt for PUB-02/03.',
        internalDirectories: INTERNAL_DIRECTORIES,
        scannedFiles: files.length,
        byPageType,
        byRule,
        components,
        findings,
        production,
      },
      null,
      2,
    )}\n`,
  );
  console.log(
    JSON.stringify({
      output,
      scannedFiles: files.length,
      findings: findings.length,
      byPageType,
      byRule,
      htmlPages: production.length,
    }),
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
