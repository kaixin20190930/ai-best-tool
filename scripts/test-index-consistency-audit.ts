import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('scripts/audit-index-consistency.ts', 'utf8');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8')) as { scripts: Record<string, string> };

for (const contract of [
  'getToolIndexDecision',
  'getCanonicalToolSlug',
  'INDEXABLE_LOCALES',
  'missingToolUrls',
  'unexpectedToolUrls',
  'duplicateCanonicalEntities',
  ':canonical',
  ':robots',
]) {
  assert(source.includes(contract), `Missing consistency contract: ${contract}`);
}
assert(source.includes("headers: { 'user-agent': 'ai-best-tool-index-consistency/1.0' }"));
assert(source.includes('AbortSignal.timeout(20_000)'));
assert.equal(packageJson.scripts['seo:index-consistency'], 'tsx scripts/audit-index-consistency.ts');
assert.equal(packageJson.scripts['test:index-consistency'], 'tsx scripts/test-index-consistency-audit.ts');

console.log('✅ Index consistency audit contract passed.');
