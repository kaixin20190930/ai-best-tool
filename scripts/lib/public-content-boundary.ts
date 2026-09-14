import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

// Deliberately directory-scoped. A public file cannot opt itself out with a comment.
export const INTERNAL_DIRECTORIES = [
  'docs/',
  'reports/',
  'scripts/',
  'tests/',
  'lib/config/',
  'lib/seo/',
  'components/admin/',
  'app/[locale]/(with-footer)/admin/',
  'app/[locale]/(no-footer)/admin/',
  'app/api/',
  'app/[locale]/(admin)/admin/',
  'app/actions/admin/',
];
export const FORBIDDEN_PUBLIC_COPY = [
  [
    'indexing-strategy',
    /索引策略|indexing strategy|优先收录入口|Priority indexing paths|推给搜索引擎|excluded from indexing|不参与索引|停止索引|开放索引|index release|monitor-only|single-tool index scope|why it is monitored|为什么观察|directory-comparison policy|目录对比政策/gi,
  ],
  ['keep-indexable', /保留索引|keep (?:it |the page )?indexable|kept indexable/gi],
  ['enrichment', /下一步增强|next enrichment/gi],
  ['editorial-evidence', /补真实|add real (?:\w+ ){0,3}(?:evidence|samples|scenarios)/gi],
  ['traffic', /承接流量|承接高意图|capture high-intent/gi],
  ['high-intent', /高意图|high[- ]intent/gi],
  ['conversion', /转化路径|转化目标|conversion path|conversion goal|最容易转化|highest-converting|承接大盘流量/gi],
  [
    'editorial-planning',
    /证据准备度|Evidence readiness|产品价值分|Product value.*?\/100|Next fact check|Next decision review|公开判断仍需补齐|Still needed for a complete decision|Next enrichment|下次事实复查|下次事实复核|下次判断复核|next fact review/gi,
  ],
  [
    'implementation-copy',
    /Stable editorial preview|Local media avoids broken external previews|consistent across deploys|Editorial media ready|Local media (?:avoids|keeps)|Static media ready|Editorial preview|Editorial media|stable local media|guide-driven traffic|Richer visual media|Editorial (?:coverage|research) ready|Decision page ready|Localized (?:detail copy|summary)|Monitor before index|Published seed|research wave|category-aligned tool positioning/gi,
  ],
  ['quality-state', /页面质量|page_quality_status|continue_index|sitemap eligibility|^monitor$/gi],
] as const;

export type Finding = { file: string; line: number; rule: string; text: string; fingerprint: string };

export function isInternalFile(file: string) {
  return INTERNAL_DIRECTORIES.some((directory) => file.startsWith(directory));
}

export function copyViolations(text: string) {
  return FORBIDDEN_PUBLIC_COPY.filter(([, pattern]) => {
    pattern.lastIndex = 0;
    return pattern.test(text);
  }).map(([rule]) => rule);
}

export function scanSource(file: string, source: string): Finding[] {
  if (isInternalFile(file)) return [];
  const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const findings: Finding[] = [];
  function visit(node: ts.Node) {
    // Strings, JSX text and template pieces, including copy supplied through config objects.
    // Comments, identifiers, imports and implementation-only JSX attributes are not prose.
    if (
      ts.isStringLiteralLike(node) ||
      ts.isJsxText(node) ||
      ts.isTemplateHead(node) ||
      ts.isTemplateMiddle(node) ||
      ts.isTemplateTail(node)
    ) {
      const parent = node.parent;
      const implementationAttribute =
        ts.isJsxAttribute(parent) &&
        /^(className|href|src|id|key|ctaId|ctaLabel|pageType|data-.+)$/.test(parent.name.getText(tree));
      if (!ts.isImportDeclaration(parent) && !ts.isExportDeclaration(parent) && !implementationAttribute) {
        const value = node.text.replace(/\s+/g, ' ').trim();
        for (const rule of copyViolations(value)) {
          findings.push({
            file,
            line: tree.getLineAndCharacterOfPosition(node.getStart(tree)).line + 1,
            rule,
            text: value,
            fingerprint: createHash('sha256').update(`${file}\n${rule}\n${value}`).digest('hex'),
          });
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(tree);
  return findings;
}

export function publicSourceFiles(root: string): string[] {
  function walk(directory: string): string[] {
    return readdirSync(path.join(root, directory), { withFileTypes: true }).flatMap((entry) => {
      const file = `${directory}/${entry.name}`;
      if (isInternalFile(`${file}/`)) return [];
      if (entry.isDirectory()) return walk(file);
      return /\.tsx?$/.test(file) ? [file] : [];
    });
  }
  return ['app', 'components'].flatMap(walk).sort();
}

export function scanRepository(root: string) {
  return publicSourceFiles(root).flatMap((file) => scanSource(file, readFileSync(path.join(root, file), 'utf8')));
}

export function pageType(file: string) {
  if (file.startsWith('components/')) return 'shared-component';
  if (file.includes('-comparison/')) return 'comparison';
  if (file.includes('/guides/')) return 'guide';
  if (file.includes('/ai/')) return 'tool';
  if (/\/(submit|pricing|developer|submissions)\//.test(file)) return 'commercial';
  return 'other-public';
}
