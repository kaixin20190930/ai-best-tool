import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import ts from 'typescript';

import { getPublicToolDetail, getPublicToolSummary, publicToolNarrative } from '../lib/content/publicToolScope';
import { copyViolations, scanRepository, scanSource } from './lib/public-content-boundary';

const base = 'e51642b6';
const files = execFileSync('git', ['diff', '--name-only', base], { encoding: 'utf8' }).trim().split('\n');
const frozen =
  /^(?:app\/(?:sitemap|robots)\.|app\/api\/|app\/actions\/|lib\/(?:config|data|seo|services|database)\/|db\/|migrations\/)/;
assert.deepEqual(
  files.filter((file) => frozen.test(file)),
  [],
  'Routing, metadata data, eligibility and database code are frozen.',
);
function tokens(source: string) {
  const scanner = ts.createScanner(ts.ScriptTarget.Latest, true, ts.LanguageVariant.Standard, source);
  const result: string[] = [];
  while (scanner.scan() !== ts.SyntaxKind.EndOfFileToken) result.push(scanner.getTokenText());
  return result.join(' ');
}
function metadata(source: string, file: string) {
  const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  return tree.statements
    .filter(
      (node) =>
        (ts.isFunctionDeclaration(node) && node.name?.text === 'generateMetadata') ||
        (ts.isVariableStatement(node) &&
          node.declarationList.declarations.some((d) => d.name.getText(tree) === 'metadata')),
    )
    .map((node) => tokens(node.getText(tree)));
}
const checked: string[] = [];
for (const file of files.filter((f) => /^app\/.+\.tsx$/.test(f))) {
  const old = execFileSync('git', ['show', `${base}:${file}`], { encoding: 'utf8' });
  const current = readFileSync(file, 'utf8');
  assert.deepEqual(metadata(current, file), metadata(old, file), `${file}: metadata source changed`);
  checked.push(file);
}
const toolPath = 'app/[locale]/(with-footer)/ai/[websiteName]/page.tsx';
function retainedEvidence(source: string) {
  const tree = ts.createSourceFile(toolPath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const result: Record<string, string> = {};
  function walk(node: ts.Node) {
    if (
      ts.isFunctionDeclaration(node) &&
      ['getPriorityToolOfficialEvidence', 'getPriorityToolFallbackDetail'].includes(node.name?.text || '')
    )
      result[node.name!.text] = tokens(node.getText(tree));
    if (
      ts.isJsxSelfClosingElement(node) &&
      ['CommentList', 'EvidenceLedgerPanel', 'ChangeTimelinePanel'].includes(node.tagName.getText(tree))
    )
      result[node.tagName.getText(tree)] = tokens(node.getText(tree));
    if (ts.isJsxElement(node))
      for (const attribute of node.openingElement.attributes.properties) {
        if (
          ts.isJsxAttribute(attribute) &&
          ['data-official-evidence', 'data-priority-tool-evidence'].includes(attribute.name.getText(tree))
        )
          result[attribute.name.getText(tree)] = tokens(node.getText(tree));
      }
    ts.forEachChild(node, walk);
  }
  walk(tree);
  return result;
}
const evidenceBefore = retainedEvidence(execFileSync('git', ['show', `${base}:${toolPath}`], { encoding: 'utf8' }));
const evidenceAfter = retainedEvidence(readFileSync(toolPath, 'utf8'));
assert.equal(Object.keys(evidenceBefore).length, 7);
assert.deepEqual(
  evidenceAfter,
  evidenceBefore,
  'Official facts, sources, dates, comments, ledger and timeline must be retained.',
);
assert.equal(
  publicToolNarrative('官方资料核查于 2026-09-04，下次事实复查为 2026-09-18。限制不变。'),
  '官方资料核查于 2026-09-04。限制不变。',
);
assert.equal(
  publicToolNarrative('Official documentation checked 2026-09-04; next fact review 2026-09-18. Limits apply.'),
  'Official documentation checked 2026-09-04. Limits apply.',
);
assert.equal(
  publicToolNarrative(
    'Source-based review, not a hands-on benchmark. Index release remains gated after directory reconciliation.',
  ),
  'Source-based review, not a hands-on benchmark.',
);
for (const locale of ['en', 'cn']) {
  for (const slug of ['woy-ai', 'adobe', 'salesforce_einstein', 'chatgpt-mac', 'gpt_4o', 'openai', 'sora'])
    assert(!/index scope|隔离|索引|next enrichment/i.test(getPublicToolSummary(slug, locale, 'index scope')));
  const detail = getPublicToolDetail('woy-ai', locale, 'Why it is monitored');
  assert(detail.includes('2026-09-06') && detail.includes('https://woy.ai/tags'));
}
assert.equal(
  publicToolNarrative(
    'Reviewed September 14, 2026. Next fact review: October 14, 2026; changes or conflicts trigger earlier review.',
  ),
  'Reviewed September 14, 2026.',
);
assert.equal(
  publicToolNarrative('核验于 2026-09-14；下次事实复核为 2026-10-14，变化或冲突会触发提前复核。'),
  '核验于 2026-09-14。',
);
const baselineHtml = JSON.parse(readFileSync('reports/public-content-boundary/pub-03-html-before.json', 'utf8'));
for (const locale of ['en', 'cn'])
  for (const slug of ['artiversehub-ai', 'fastimage-ai-sketch-to-image', 'honeydo', 'tattooai-design']) {
    const page = baselineHtml.results.find(
      (p: { path: string }) => p.path === `${locale === 'cn' ? '/cn' : ''}/ai/${slug}`,
    );
    const original = page.seo.schema[0].abstract;
    const visible = getPublicToolDetail(slug, locale, original);
    const urls = [...original.matchAll(/\]\((https:[^)]+)\)/g)].map((m: RegExpMatchArray) => m[1]);
    assert(visible.includes('2026-09-06'));
    assert(!/monitored|index approval|index reconsideration|为什么观察|重新评估索引|市场评分|Best 排名/.test(visible));
    for (const url of urls) assert(visible.includes(url), `${slug}: source was lost`);
    if (slug === 'tattooai-design') assert(visible.includes(locale === 'cn' ? '合格纹身师' : 'qualified artist'));
  }
const svgFiles = readdirSync('public/images/tool-media').filter((file) => file.endsWith('.svg'));
for (const file of svgFiles) {
  const xml = readFileSync(`public/images/tool-media/${file}`, 'utf8');
  const text = xml.replace(/<[^>]*>/g, ' ');
  assert.deepEqual(copyViolations(text), [], `${file}: internal copy in a visible cover`);
}
const findings = scanRepository(process.cwd());
assert.equal(findings.length, 0);
assert.deepEqual(
  scanSource('lib/content/publicToolScope.ts', readFileSync('lib/content/publicToolScope.ts', 'utf8')),
  [],
);
const report = {
  base,
  checkedAt: new Date().toISOString(),
  metadataFiles: checked,
  frozenDirectoriesChanged: [],
  sourceFindings: findings.length,
  svgAssetsScanned: svgFiles.length,
  assetFindings: 0,
  retainedEvidence: Object.keys(evidenceAfter),
  pass: true,
};
writeFileSync('reports/public-content-boundary/pub-03-source-freeze.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report));
