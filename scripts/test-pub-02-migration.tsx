import React from 'react';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';

import { buildComparisonPageData, ComparisonPage } from '../app/[locale]/(with-footer)/guides/comparison-template';
import { web3Comparison, web3ComparisonFaqs } from '../lib/content/web3Comparison';
import { copyViolations } from './lib/public-content-boundary';

Object.assign(globalThis, { React });

async function main() {
  const slugs = process.argv.slice(2);
  assert.ok(slugs.length > 0);
  const results = [];
  for (const slug of slugs) {
    const file = `app/[locale]/(with-footer)/guides/${slug}/page.tsx`;
    const source = readFileSync(file, 'utf8');
    const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    let expression = '';
    function visit(node: ts.Node) {
      if (ts.isCallExpression(node) && node.expression.getText(tree) === 'buildComparisonPageData')
        expression = node.arguments[1].getText(tree);
      ts.forEachChild(node, visit);
    }
    visit(tree);
    const config = vm.runInNewContext(`(${expression})`, { web3Comparison, web3ComparisonFaqs });
    for (const locale of ['cn', 'en']) {
      const data = await buildComparisonPageData(locale, config);
      const document = new JSDOM(renderToStaticMarkup(ComparisonPage({ ...data, locale }))).window.document;
      assert.equal(document.querySelectorAll('h1').length, 1);
      assert.equal(document.querySelectorAll('[data-comparison-next]').length, 1);
      assert.equal(document.querySelectorAll('[data-comparison-primary-cta]').length, 1);
      if (config.content.kind === 'unavailable') {
        assert.equal(document.querySelectorAll('table, [data-comparison-evidence], details').length, 0);
        assert.equal(data.faqSchema, null);
        assert.equal(data.itemListSchema, null);
      } else {
        assert.equal(document.querySelectorAll('[data-comparison-section]').length, 6);
        assert.ok(data.faqSchema);
        assert.ok(data.itemListSchema);
      }
      document.querySelectorAll('script').forEach((el) => el.remove());
      assert.deepEqual(copyViolations(document.body.textContent || ''), []);
      results.push({ slug, locale, state: config.content.kind, pass: true });
    }
  }
  console.log(JSON.stringify({ results, pass: true }, null, 2));
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
