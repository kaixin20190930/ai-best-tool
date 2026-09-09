import assert from 'node:assert/strict';
import fs from 'node:fs';

import { EDITORIAL_REVIEW_RECORDS } from '../lib/seo/contentReviewDates';

const protectedPages = [
  'app/[locale]/(with-footer)/explore/page.tsx',
  'app/[locale]/(with-footer)/best-ai-tools/page.tsx',
  'app/[locale]/(with-footer)/best-ai-tools/[topic]/page.tsx',
];
const today = '2026-09-09';

for (const [key, record] of Object.entries(EDITORIAL_REVIEW_RECORDS)) {
  assert.match(record.reviewedAt, /^\d{4}-\d{2}-\d{2}$/, `${key}: reviewedAt must be an ISO date`);
  assert(record.reviewedAt <= today, `${key}: reviewedAt cannot be in the future`);
  assert(record.scope.length >= 40, `${key}: review scope is too vague`);
  assert(record.evidence.length >= 40, `${key}: review evidence is too vague`);
}

for (const pagePath of protectedPages) {
  const source = fs.readFileSync(pagePath, 'utf8');
  assert(source.includes('getEditorialReviewRecord'), `${pagePath}: must read from the editorial registry`);
  assert(!/const checkedAt = ['"]\d{4}-\d{2}-\d{2}['"]/.test(source), `${pagePath}: date is hardcoded`);
  assert(!/checkedAt\s*=\s*new Date\(/.test(source), `${pagePath}: date must not refresh at build or request time`);
  assert(!/更容易转化|Higher conversion|提交和付费路径|submit and pricing/.test(source), `${pagePath}: internal conversion copy leaked`);
}

console.log('✅ Core editorial review dates are explicit, evidenced, and build-time independent.');
