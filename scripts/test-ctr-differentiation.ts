import fs from 'node:fs';
import path from 'node:path';

import { getToolDecisionMetadataPilot, TOOL_DECISION_METADATA_PILOT_SLUGS } from '../lib/seo/toolDecisionMetadata';

const root = process.cwd();
const homeSource = fs.readFileSync(path.join(root, 'app/[locale]/(with-footer)/(home)/page.tsx'), 'utf8');
const bestSource = fs.readFileSync(path.join(root, 'app/[locale]/(with-footer)/best-ai-tools/page.tsx'), 'utf8');
const toolSource = fs.readFileSync(path.join(root, 'app/[locale]/(with-footer)/ai/[websiteName]/page.tsx'), 'utf8');

if (TOOL_DECISION_METADATA_PILOT_SLUGS.length !== 4) {
  throw new Error('CTR metadata changes must remain limited to the four reviewed pilot tools.');
}

for (const slug of TOOL_DECISION_METADATA_PILOT_SLUGS) {
  for (const locale of ['en', 'cn']) {
    const metadata = getToolDecisionMetadataPilot(slug, locale);
    if (!metadata) throw new Error(`Missing ${locale} decision metadata for ${slug}.`);
    if (/ - (?:.+ )?AI Tool(?: \| AI Best Tool)?$/i.test(metadata.title)) {
      throw new Error(`${slug} still uses the generic AI Tool title template.`);
    }
    const minimumDescriptionLength = locale === 'cn' ? 45 : 80;
    if (!metadata.primaryTask || !metadata.decisionAngle || metadata.description.length < minimumDescriptionLength) {
      throw new Error(`${slug} metadata lacks a usable task, trade-off, or page-specific description.`);
    }
    if (/\b(best|#1|number one|latest)\b/i.test(metadata.description)) {
      throw new Error(`${slug} metadata contains an unsupported superiority or freshness claim.`);
    }
  }
}

if (!homeSource.includes("label: isChinese ? '公开工具' : 'Published tools'")) {
  throw new Error('Homepage must describe the visible count as published tools, not Google-indexed tools.');
}

for (const forbidden of ['paid upgrades', 'Front-load the lists most likely to convert', 'Conversion-friendly']) {
  if (bestSource.includes(forbidden)) throw new Error(`Best hub contains internal operator language: ${forbidden}`);
}
if (bestSource.includes('href={`/${locale}/pricing`}')) {
  throw new Error('Best hub must not restore Pricing as its primary selection CTA.');
}

for (const required of [
  'data-above-fold-decision-summary',
  'Decision first, features second',
  'Task fit',
  'Key trade-off',
  'Evidence coverage',
  "href='#decision-card'",
]) {
  if (!toolSource.includes(required))
    throw new Error(`Tool page is missing the above-fold decision signal: ${required}`);
}

const guideSlugs = [
  'best-free-ai-tools',
  'ai-video-tools',
  'ai-image-tools',
  'ai-chatbot-tools',
  'ai-productivity-tools',
  'ai-tools-for-developers',
  'ai-tools-for-automation',
  'ai-tools-for-marketing',
  'ai-tools-for-voice',
];
for (const slug of guideSlugs) {
  const source = fs.readFileSync(path.join(root, `app/[locale]/(with-footer)/guides/${slug}/page.tsx`), 'utf8');
  if (!source.includes('buildLocalizedPageMetadata({') || !source.includes(`path: '/guides/${slug}'`)) {
    throw new Error(`${slug} must keep canonical, hreflang, and robots in the shared metadata builder.`);
  }
}

console.log(
  `✅ CTR differentiation guard passed: ${TOOL_DECISION_METADATA_PILOT_SLUGS.length} tool pilots, accurate public copy, above-fold decisions, and ${guideSlugs.length} canonical guide routes.`,
);
