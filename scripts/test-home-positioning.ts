import fs from 'node:fs';
import path from 'node:path';

const homePath = path.join(process.cwd(), 'app', '[locale]', '(with-footer)', '(home)', 'page.tsx');
const source = fs.readFileSync(homePath, 'utf8');
const faqPath = path.join(process.cwd(), 'components', 'Faq.tsx');
const faqSource = fs.readFileSync(faqPath, 'utf8');
const footerPath = path.join(process.cwd(), 'components', 'home', 'Footer.tsx');
const footerSource = fs.readFileSync(footerPath, 'utf8');

const requiredSignals = [
  'AI 工具目录：按场景比较精选 AI 工具 | AI Best Tool',
  'AI Tools Directory: Compare Curated AI Tools | AI Best Tool',
  '用证据、限制和真实变化比较 AI 工具',
  'Compare AI tools with evidence, limits, and real changes',
  '重要事实带来源和核查日期',
  'Important claims carry sources and review dates',
  '推荐之前先说明不适合谁',
  'Know who should not choose it before the recommendation',
  '有变化才更新判断，不伪造新鲜度',
  'Update decisions when facts change, not to fake freshness',
  'generateWebSiteSchema',
  "href='/explore'",
  "href='/guides/how-to-choose-ai-tools'",
  "href='/ai/chatgpt'",
];

for (const signal of requiredSignals) {
  if (!source.includes(signal)) {
    throw new Error(`Homepage positioning is missing required signal: ${signal}`);
  }
}

if ((source.match(/<h1\b/g) || []).length !== 1) {
  throw new Error('Homepage must keep exactly one explicit H1.');
}

if ((faqSource.match(/<h1\b/g) || []).length > 0) {
  throw new Error('Homepage FAQ must not introduce another H1.');
}

if ((footerSource.match(/<h1\b/g) || []).length > 0) {
  throw new Error('Shared footer must not introduce a second page-level H1.');
}

if (
  source.includes("label: isChinese ? '持续更新' : 'Fresh updates'") ||
  source.includes("value: isChinese ? '每日' : 'Daily'")
) {
  throw new Error('Homepage must not claim a generic daily update cadence.');
}

if (
  faqSource.includes('updated daily') ||
  faqSource.includes('每天更新') ||
  faqSource.includes('contact@6677.ai') ||
  faqSource.includes('6677-ai/tap4-ai-webui')
) {
  throw new Error('Homepage FAQ contains an outdated cadence, contact, or open-source promise.');
}

const latestInventoryIndex = source.indexOf("title={t('latestTools')}");
const commercialBoundaryIndex = source.indexOf(
  'Paid options only affect review timing or clearly labeled visibility, never the editorial conclusion',
);

if (latestInventoryIndex === -1 || commercialBoundaryIndex < latestInventoryIndex) {
  throw new Error('Paid visibility must stay below the main discovery and inventory experience.');
}

console.log('✅ Homepage positioning passed: directory topic, evidence method, and commercial boundary are intact.');
