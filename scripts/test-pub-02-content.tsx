import React from 'react';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';

import GuideTaskChecks from '../components/guides/GuideTaskChecks';
import { guideTaskChecks } from '../lib/content/guideTaskChecks';
import { validComparisonEvidence } from '../lib/content/verifiedComparison';
import { INDEXABLE_GUIDE_PATHS } from '../lib/seo/guideIndexing';
import { copyViolations, publicSourceFiles, scanRepository, scanSource } from './lib/public-content-boundary';

Object.assign(globalThis, { React });
const base = '8500684567561675697b6814bff8e376d5944320';
const manifest = JSON.parse(readFileSync('reports/public-content-boundary/pub-02-comparison-disposition.json', 'utf8'));
const migration = JSON.parse(readFileSync('reports/public-content-boundary/pub-02-template-migration.json', 'utf8'));
assert.equal(manifest.pages.length, 76);
assert.equal(new Set(manifest.pages.map((x: any) => x.path)).size, 76);
assert.equal(migration.pages.length, 62);
assert.ok(manifest.pages.every((page: any) => page.redirectApproved === false && page.indexReleaseApproved === false));
assert.deepEqual(
  Object.keys(guideTaskChecks).sort(),
  [...INDEXABLE_GUIDE_PATHS].map((path) => path.split('/').pop()).sort(),
);
function tokens(source: string) {
  const scanner = ts.createScanner(ts.ScriptTarget.Latest, true, ts.LanguageVariant.JSX, source);
  const result = [];
  while (scanner.scan() !== ts.SyntaxKind.EndOfFileToken) result.push(scanner.getTokenText());
  return result;
}
function extract(file: string, source: string) {
  const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const metadata = tree.statements.find(
    (node) => ts.isFunctionDeclaration(node) && node.name?.text === 'generateMetadata',
  );
  let config: ts.ObjectLiteralExpression | undefined;
  function visit(node: ts.Node) {
    if (ts.isCallExpression(node) && node.expression.getText(tree) === 'buildComparisonPageData')
      config = node.arguments[1] as ts.ObjectLiteralExpression;
    ts.forEachChild(node, visit);
  }
  visit(tree);
  return {
    metadata: metadata?.getText(tree),
    fields: config
      ? Object.fromEntries(
          config.properties.map((prop) => [
            prop.name?.getText(tree),
            (prop as ts.PropertyAssignment).initializer.getText(tree),
          ]),
        )
      : null,
  };
}
for (const file of publicSourceFiles(process.cwd()).filter(
  (file) => file.startsWith('app/') && file.includes('/guides/'),
)) {
  const current = readFileSync(file, 'utf8');
  assert.equal(scanSource(file, current).length, 0, `${file}: no historical allowance for Guides`);
  assert.ok(!current.includes('GuideSubmissionPath'));
  assert.ok(
    !current.includes('GuideEvidencePanel'),
    `${file}: source-backed evidence is owned by GuideTaskChecks/VerifiedComparisonPage`,
  );
  const previous = execFileSync('git', ['show', `${base}:${file}`], { encoding: 'utf8' });
  assert.deepEqual(
    tokens(extract(file, current).metadata || ''),
    tokens(extract(file, previous).metadata || ''),
    `${file}: metadata contract changed`,
  );
}
for (const page of migration.pages) {
  const file = `app/[locale]/(with-footer)${page.path}/page.tsx`;
  const previous = extract(file, execFileSync('git', ['show', `${base}:${file}`], { encoding: 'utf8' }));
  const current = extract(file, readFileSync(file, 'utf8'));
  assert.ok(previous.fields && current.fields);
  assert.deepEqual(Object.keys(current.fields).sort(), ['breadcrumbLabel', 'comparisonLabel', 'content', 'guideHref']);
  assert.deepEqual(
    Object.keys(page.oldFields).sort(),
    Object.keys(previous.fields).sort(),
    `${file}: an old field was silently lost`,
  );
  for (const [name, value] of Object.entries(previous.fields)) {
    assert.equal(page.oldFields[name].source, value);
    assert.ok(page.oldFields[name].disposition);
  }
  for (const name of ['breadcrumbLabel', 'comparisonLabel', 'guideHref'])
    assert.deepEqual(tokens(current.fields[name]), tokens(previous.fields[name]));
  assert.ok(readFileSync(file, 'utf8').includes('return ComparisonPage({ ...data, locale })'));
}
for (const [slug, content] of Object.entries(guideTaskChecks)) {
  assert.equal(content.checks.length, 3);
  assert.equal(content.next.length, 2);
  assert.ok(content.evidence.every(validComparisonEvidence));
  for (const locale of ['cn', 'en']) {
    const document = new JSDOM(renderToStaticMarkup(<GuideTaskChecks slug={slug} locale={locale} />)).window.document;
    assert.deepEqual(copyViolations(document.body.textContent || ''), []);
    assert.equal(document.querySelectorAll('[data-comparison-evidence]').length, 1);
    assert.equal(document.querySelectorAll('[data-guide-next] a').length, 2);
    assert.ok(
      [...document.querySelectorAll('[data-guide-next] a')].every(
        (node) => !node.getAttribute('href')?.includes('-comparison'),
      ),
    );
  }
}
for (const file of [
  'lib/content/guideTaskChecks.ts',
  'components/guides/UnavailableComparisonPage.tsx',
  'components/guides/GuideTaskChecks.tsx',
])
  assert.equal(scanSource(file, readFileSync(file, 'utf8')).length, 0);
for (const file of [
  'middleware.ts',
  'app/sitemap.ts',
  'next.config.mjs',
  'lib/seo/guideIndexing.ts',
  'lib/content/guides.ts',
])
  assert.equal(
    readFileSync(file, 'utf8'),
    execFileSync('git', ['show', `${base}:${file}`], { encoding: 'utf8' }),
    `${file}: frozen routing/index contract`,
  );
const template = readFileSync('app/[locale]/(with-footer)/guides/comparison-template.tsx', 'utf8');
assert.ok(!/getPopularTools|getTools\(|searchQuery|highIntentPaths|comparisonDimensions/.test(template));
console.log(
  `PUB-02 content PASS: 18 bilingual Guides, 62 exhaustive property migrations, 76 dispositions; ${scanRepository(process.cwd()).length} exact remaining out-of-scope legacy findings.`,
);
