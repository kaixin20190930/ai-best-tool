import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const base = '8038cae93198f3ad6437a7542bc3ec20394d0f1f';
const allowed = new Set([
  'lib/content/publicModuleRegistry.ts',
  'components/public-modules/PublicModuleArea.tsx',
  'components/tools/PublicToolDecision.tsx',
  'scripts/test-public-module-registry.ts',
  'scripts/test-pub-04-freeze.ts',
  'scripts/tsconfig.public-modules.json',
  'docs/PUB_04_PUBLIC_MODULE_REGISTRY_CN.md',
  'docs/PUBLIC_CONTENT_BOUNDARY_AND_PAGE_SIMPLIFICATION_PLAN_CN.md',
  'docs/MASTER_OPTIMIZATION_TRACKER_CN.md',
  'package.json',
]);
const tracked = execFileSync('git', ['diff', '--name-only', base, '--'], { encoding: 'utf8' });
const untracked = execFileSync('git', ['ls-files', '--others', '--exclude-standard'], { encoding: 'utf8' });
const changed = Array.from(new Set(`${tracked}\n${untracked}`.split('\n').filter(Boolean)));
assert.deepEqual(
  changed.filter((file) => !allowed.has(file)),
  [],
  'PUB-04 must not modify routes, SEO, data, schemas, configs or unrelated scope.',
);

const before = (file: string) => execFileSync('git', ['show', `${base}:${file}`], { encoding: 'utf8' });
const originalPackage = JSON.parse(before('package.json'));
const currentPackage = JSON.parse(readFileSync('package.json', 'utf8'));
for (const name of ['test:public-module-registry', 'test:pub-04-freeze', 'typecheck:public-modules'])
  delete currentPackage.scripts[name];
assert.deepEqual(currentPackage, originalPackage, 'No dependencies, build or lint exemptions may change.');

// The sole existing component edit is an optional area. Its complete original body is retained.
const component = 'components/tools/PublicToolDecision.tsx';
const current = readFileSync(component, 'utf8')
  .replace(/^import PublicModuleArea[^\n]*\n/m, '')
  .replace(/^ {2}experimentalModules,\n/m, '')
  .replace(/^ {2}experimentalModules\?:[^\n]*\n/m, '')
  .replace(
    /^ {6}\{experimentalModules && <PublicModuleArea page=\{experimentalModules\.page\} placement='after-decision' modules=\{experimentalModules\.modules\} \/>\}\n/m,
    '',
  );
assert.equal(
  current,
  before(component),
  'Core decision card, relationships, sources and evidence must remain unchanged.',
);
for (const file of ['lib/content/publicModuleRegistry.ts', 'components/public-modules/PublicModuleArea.tsx']) {
  const source = readFileSync(file, 'utf8');
  assert(
    !/from ['"][^'"]*(?:\/seo\/|\/services\/|\/database|\/db\/|next\/headers)/.test(source),
    `${file}: registry cannot own SEO, database or request identity.`,
  );
  assert(
    !/^['"]use client['"]/m.test(source),
    `${file}: internal module configuration must stay out of client components.`,
  );
}
console.log(
  `PUB-04 freeze PASS: ${changed.length} scoped files; all routes, metadata, canonical, hreflang, robots, schema, sitemap, database and existing content unchanged.`,
);
