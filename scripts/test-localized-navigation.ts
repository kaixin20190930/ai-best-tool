/* eslint curly: ["error", "all"] */
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

import {
  buildLoginHref,
  normalizeLocalizedHref,
  repairRepeatedLocalePath,
  safeLocalizedReturnPath,
} from '../lib/navigation/localizedPaths';

const locales = ['en', 'cn', 'jp', 'de', 'es', 'fr', 'pt', 'ru', 'tw'];
const duplicate = /^\/(?:en|cn|jp|de|es|fr|pt|ru|tw)\/(?:en|cn|jp|de|es|fr|pt|ru|tw)(?:\/|$)/;

function unitTests() {
  const configuredLocales = [...readFileSync('i18n.ts', 'utf8').matchAll(/lang: '([^']+)'/g)].map((match) => match[1]);
  assert.deepEqual(
    [...locales].sort(),
    configuredLocales.sort(),
    'Navigation guards must cover every configured locale',
  );
  for (const locale of locales) {
    const target = locale === 'en' ? '/ai/adobe' : `/${locale}/ai/adobe`;
    assert.deepEqual(normalizeLocalizedHref(`/${locale}/login?redirect=%2Fcn%2Fai%2Fadobe#sign-in`), {
      href: '/login?redirect=%2Fcn%2Fai%2Fadobe#sign-in',
      locale,
    });
    assert.deepEqual(normalizeLocalizedHref(`/${locale}/${locale}/pricing`), { href: '/pricing', locale });
    assert.equal(repairRepeatedLocalePath(`/${locale}/${locale}/ai/adobe`), target);
    assert.equal(safeLocalizedReturnPath('/ai/adobe?view=reviews#comments', locale), `${target}?view=reviews#comments`);
    const login = new URL(buildLoginHref('/ai/adobe?view=reviews&sort=new#comments', locale), 'https://example.test');
    assert.equal(login.pathname, '/login');
    assert.equal(login.searchParams.get('redirect'), `${target}?view=reviews&sort=new#comments`);
  }
  assert.deepEqual(normalizeLocalizedHref('/cn/pricing', 'de'), { href: '/pricing', locale: 'de' });
  assert.deepEqual(normalizeLocalizedHref('/en/cn/login'), { href: '/login', locale: 'cn' });
  assert.deepEqual(
    normalizeLocalizedHref({ pathname: '/cn/profile', query: { redirect: '/cn/a?x=1&y=2' }, hash: 'x' }),
    {
      href: { pathname: '/profile', query: { redirect: '/cn/a?x=1&y=2' }, hash: 'x' },
      locale: 'cn',
    },
  );
  for (const href of [
    'https://other.test/cn/login',
    '//other.test/cn/login',
    'mailto:a@example.test',
    '#comments',
    '?project=abc',
    '/cnn/tools',
    '/api/cn/test',
  ]) {
    assert.equal(normalizeLocalizedHref(href).href, href);
  }
  const external = { protocol: 'https:', hostname: 'other.test', pathname: '/cn/login' };
  assert.equal(normalizeLocalizedHref(external).href, external);
  for (const value of [
    'https://evil.test',
    '//evil.test',
    '/\\evil.test',
    '/%2fevil.test',
    '/%5cevil.test',
    '/en//evil.test',
    '/cn/en//evil.test',
    '/\nevil.test',
    null,
  ]) {
    assert.equal(safeLocalizedReturnPath(value, 'cn'), undefined);
  }
  assert.equal(safeLocalizedReturnPath('/cn/cn/profile?status=pending'), '/cn/profile?status=pending');
  assert.equal(safeLocalizedReturnPath('/de/profile', 'cn'), '/de/profile');
  assert.equal(repairRepeatedLocalePath('/cn/login'), '/cn/login');
  assert.equal(repairRepeatedLocalePath('/en/ai/adobe'), '/en/ai/adobe');
  assert.equal(repairRepeatedLocalePath('/api/cn/cn'), '/api/cn/cn');
  assert.match(
    readFileSync('app/navigation.ts', 'utf8'),
    /export \{ default as Link \} from '@\/components\/navigation\/LocalizedLink'/,
  );

  // Resolve the imported JSX binding: next/link and native anchors must not be flagged.
  let filesChecked = 0;
  const errors: string[] = [];
  function walk(dir: string) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(file);
        continue;
      }
      if (!/\.tsx?$/.test(file)) {
        continue;
      }
      const text = readFileSync(file, 'utf8');
      const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
      const bindings = new Set<string>();
      for (const statement of source.statements) {
        if (
          !ts.isImportDeclaration(statement) ||
          !ts.isStringLiteral(statement.moduleSpecifier) ||
          statement.moduleSpecifier.text !== '@/app/navigation'
        ) {
          continue;
        }
        const named = statement.importClause?.namedBindings;
        if (named && ts.isNamedImports(named)) {
          for (const spec of named.elements) {
            if ((spec.propertyName || spec.name).text === 'Link') {
              bindings.add(spec.name.text);
            }
          }
        }
      }
      if (!bindings.size) {
        continue;
      }
      filesChecked += 1;
      const visit = (node: ts.Node) => {
        if (
          (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
          bindings.has(node.tagName.getText(source))
        ) {
          for (const attr of node.attributes.properties) {
            if (!ts.isJsxAttribute(attr) || attr.name.getText(source) !== 'href' || !attr.initializer) {
              continue;
            }
            const value = attr.initializer.getText(source);
            if (
              /^["']\/(?:en|cn|jp|de|es|fr|pt|ru|tw)(?:\/|["'])/.test(value) ||
              /`\/\$\{(?:locale|params\.locale)\}\//.test(value)
            ) {
              errors.push(`${file}: ${value}`);
            }
          }
        }
        ts.forEachChild(node, visit);
      };
      visit(source);
    }
  }
  walk('app');
  walk('components');
  assert.deepEqual(errors, [], 'Localized Link call sites should pass unprefixed routes');
  console.log(
    `PASS locale/query/hash/object/external/return safety cases and ${filesChecked} localized Link source files`,
  );
}

async function smoke() {
  const base = process.env.SEO_BASE_URL || 'http://localhost:3017';
  const origin = new URL(base).origin;
  const get = (url: string, redirect: RequestRedirect = 'follow') =>
    fetch(url, { redirect, signal: AbortSignal.timeout(20000) });
  const sitemapResponse = await get(`${base}/sitemap.xml`);
  assert.equal(sitemapResponse.status, 200);
  const xml = await sitemapResponse.text();
  const paths = new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname));
  for (const prefix of ['', '/cn']) {
    for (const suffix of [
      '/login',
      '/register',
      '/forgot-password',
      '/submit',
      '/profile',
      '/profile/stack',
      '/profile/trials',
      '/pricing',
      '/developer/listing',
      '/guides/salesforce-einstein-alternatives-comparison',
    ]) {
      paths.add(`${prefix}${suffix}`);
    }
  }
  const failures: string[] = [];
  let checked = 0;
  let anchors = 0;
  for (const page of paths) {
    try {
      const response = await get(`${base}${page}`);
      assert.equal(response.status, 200, `${page}: HTTP status`);
      assert(!duplicate.test(new URL(response.url).pathname), `${page}: final URL`);
      const html = (await response.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
      for (const match of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/gi)) {
        const href = match[1].replace(/&amp;/g, '&');
        const url = new URL(href, response.url);
        if (![origin, 'https://aibesttool.com'].includes(url.origin)) {
          continue;
        }
        anchors += 1;
        assert(!duplicate.test(url.pathname), `${page}: ${href}`);
      }
      if (/\/ai\/(adobe|salesforce_einstein)$/.test(page)) {
        assert(html.includes(`href="https://aibesttool.com${page}"`), `${page}: canonical`);
        const hrefs = [...html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/gi)].map((m) => m[1].replace(/&amp;/g, '&'));
        if (page.startsWith('/cn/')) {
          assert(
            hrefs.some((href) => href.startsWith('/cn/explore?search=')),
            `${page}: localized similar-tool search`,
          );
        }
        const login = hrefs
          .map((href) => new URL(href, response.url))
          .find((url) => /\/login$/.test(url.pathname) && url.searchParams.has('redirect'));
        assert(login, `${page}: login CTA missing`);
        assert.equal(login.searchParams.get('redirect'), page);
        const result = await get(`${origin}${login.pathname}${login.search}`);
        assert.equal(result.status, 200, 'Generated login target must open');
        await result.body?.cancel();
      }
    } catch (error) {
      failures.push(`${page}: ${error instanceof Error ? error.message : error}`);
    }
    checked += 1;
    if (checked % 25 === 0) {
      console.log(`Checked ${checked}/${paths.size} pages`);
    }
  }
  for (const locale of ['cn', 'en', 'de']) {
    const legacy = `/${locale}/${locale}/login?redirect=${encodeURIComponent(`/${locale}/${locale}/ai/adobe?tab=reviews&sort=new`)}`;
    const response = await get(`${base}${legacy}`, 'manual');
    assert.equal(response.status, 308);
    const url = new URL(response.headers.get('location')!, base);
    assert.equal(url.pathname, locale === 'en' ? '/login' : `/${locale}/login`);
    assert.equal(url.searchParams.get('redirect'), `/${locale}/${locale}/ai/adobe?tab=reviews&sort=new`);
    await response.body?.cancel();
  }
  const protectedResponse = await get(`${base}/cn/profile/stack?source=nav&tab=trial`, 'manual');
  assert.equal(protectedResponse.status, 307);
  assert.equal(
    new URL(protectedResponse.headers.get('location')!, base).searchParams.get('redirect'),
    '/cn/profile/stack?source=nav&tab=trial',
  );
  await protectedResponse.body?.cancel();
  assert.deepEqual(failures, []);
  console.log(
    `PASS ${checked} pages, ${anchors} internal anchor occurrences, legacy redirects and auth query preservation`,
  );
}

unitTests();
if (process.argv.includes('--smoke')) {
  smoke().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
