import fs from 'node:fs';

const pageSource = fs.readFileSync('app/[locale]/(with-footer)/categories/[slug]/page.tsx', 'utf8');
const contentSource = fs.readFileSync('app/[locale]/(with-footer)/categories/[slug]/CategoryContent.tsx', 'utf8');
const expectedSlugs = ['research', 'voice', 'automation', 'web3', 'developer-tools'];

for (const slug of expectedSlugs) {
  if (!pageSource.includes(`${slug}: {`) && !pageSource.includes(`'${slug}': {`)) {
    throw new Error(`${slug}: metadata profile is missing.`);
  }
  if (!contentSource.includes(`${slug}: {`) && !contentSource.includes(`'${slug}': {`)) {
    throw new Error(`${slug}: virtual decision category is missing.`);
  }
}

if (!contentSource.includes('!isVirtualCategory ? (')) {
  throw new Error('Virtual category hubs must not render an empty database-backed ExploreList.');
}

console.log('Virtual category hub checks passed.');
