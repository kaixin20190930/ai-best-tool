import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const detailPath = path.join(root, 'app/[locale]/(with-footer)/ai/[websiteName]/page.tsx');
const componentPath = path.join(root, 'components/guides/GuideDecisionPath.tsx');
const guides = ['web3', 'automation', 'research'];

const detailSource = fs.readFileSync(detailPath, 'utf8');
const componentSource = fs.readFileSync(componentPath, 'utf8');

if (!detailSource.includes("id='decision-card'")) {
  throw new Error('Tool detail Decision Card is missing the decision-card anchor.');
}

const anchoredSection = detailSource.slice(
  detailSource.indexOf("id='decision-card'"),
  detailSource.indexOf("id='decision-card'") + 700,
);
if (!anchoredSection.includes("'Decision Card'")) {
  throw new Error('The decision-card anchor is not attached to the main Decision Card section.');
}
if (anchoredSection.includes("t('introduction')")) {
  throw new Error('The decision-card anchor was attached to the Introduction section.');
}

if (!componentSource.includes('href={`/ai/${item.toolName}#decision-card`}')) {
  throw new Error('Guide decision links do not target the tool Decision Card anchor.');
}

for (const guide of guides) {
  const guidePath = path.join(root, `app/[locale]/(with-footer)/guides/ai-tools-for-${guide}/page.tsx`);
  const source = fs.readFileSync(guidePath, 'utf8');
  const taskCount = (source.match(/toolName:/g) || []).length;

  if (!source.includes("import GuideDecisionPath from '@/components/guides/GuideDecisionPath';")) {
    throw new Error(`${guide} guide does not import GuideDecisionPath.`);
  }
  if (!source.includes('<GuideDecisionPath')) {
    throw new Error(`${guide} guide does not render GuideDecisionPath.`);
  }
  if (taskCount < 3) {
    throw new Error(`${guide} guide needs at least three task-to-tool decision paths.`);
  }
}

console.log('Guide Decision Card paths verified for Web3, Automation, and Research.');
