import { getEditorialReviewRecord } from './contentReviewDates';

type ContentEditRecord = { modifiedAt: string; evidence: string };

// Checked-in edit dates, not build timestamps. Update the record when the page
// changes; the baseline entries cite the last source edit at f29b7dc3.
export const STATIC_PAGE_EDITS: Record<string, ContentEditRecord> = {
  '/': { modifiedAt: '2026-09-09', evidence: '3e40bb5f: app/[locale]/(with-footer)/(home)/page.tsx' },
  '/guides': { modifiedAt: '2026-09-02', evidence: 'e05d25ea: app/[locale]/(with-footer)/guides/page.tsx' },
  '/guides/how-to-choose-ai-tools': {
    modifiedAt: '2026-08-31',
    evidence: '382de135: app/[locale]/(with-footer)/guides/how-to-choose-ai-tools/page.tsx',
  },
  '/guides/free-ai-tools': {
    modifiedAt: '2026-09-02',
    evidence: 'e05d25ea: app/[locale]/(with-footer)/guides/free-ai-tools/page.tsx',
  },
  '/guides/best-free-ai-tools': {
    modifiedAt: '2026-09-09',
    evidence: '3e40bb5f: app/[locale]/(with-footer)/guides/best-free-ai-tools/page.tsx',
  },
  '/guides/ai-writing-tools': {
    modifiedAt: '2026-09-02',
    evidence: 'e05d25ea: app/[locale]/(with-footer)/guides/ai-writing-tools/page.tsx',
  },
  '/guides/ai-seo-tools': {
    modifiedAt: '2026-09-02',
    evidence: 'e05d25ea: app/[locale]/(with-footer)/guides/ai-seo-tools/page.tsx',
  },
  '/guides/ai-video-tools': {
    modifiedAt: '2026-09-10',
    evidence: 'Shared evidence panel default-date removal; docs/SEO_TOPIC_CONSISTENCY_2026-09-10_CN.md',
  },
  '/guides/ai-image-tools': {
    modifiedAt: '2026-09-09',
    evidence: '3e40bb5f: app/[locale]/(with-footer)/guides/ai-image-tools/page.tsx',
  },
  '/guides/ai-coding-tools': {
    modifiedAt: '2026-09-02',
    evidence: 'e05d25ea: app/[locale]/(with-footer)/guides/ai-coding-tools/page.tsx',
  },
  '/guides/ai-chatbot-tools': {
    modifiedAt: '2026-09-09',
    evidence: '3e40bb5f: app/[locale]/(with-footer)/guides/ai-chatbot-tools/page.tsx',
  },
  '/guides/ai-productivity-tools': {
    modifiedAt: '2026-09-09',
    evidence: '3e40bb5f: app/[locale]/(with-footer)/guides/ai-productivity-tools/page.tsx',
  },
  '/guides/ai-tools-for-research': {
    modifiedAt: '2026-08-31',
    evidence: 'de1504e6: app/[locale]/(with-footer)/guides/ai-tools-for-research/page.tsx',
  },
  '/guides/ai-tools-for-developers': {
    modifiedAt: '2026-09-09',
    evidence: '3e40bb5f: app/[locale]/(with-footer)/guides/ai-tools-for-developers/page.tsx',
  },
  '/guides/ai-tools-for-automation': {
    modifiedAt: '2026-09-09',
    evidence: '3e40bb5f: app/[locale]/(with-footer)/guides/ai-tools-for-automation/page.tsx',
  },
  '/guides/ai-tools-for-marketing': {
    modifiedAt: '2026-09-09',
    evidence: '3e40bb5f: app/[locale]/(with-footer)/guides/ai-tools-for-marketing/page.tsx',
  },
  '/guides/ai-tools-for-sales': {
    modifiedAt: '2026-07-28',
    evidence: 'dff1354f: app/[locale]/(with-footer)/guides/ai-tools-for-sales/page.tsx',
  },
  '/guides/ai-tools-for-web3': {
    modifiedAt: '2026-09-02',
    evidence: 'e05d25ea: app/[locale]/(with-footer)/guides/ai-tools-for-web3/page.tsx',
  },
  '/guides/ai-note-taking-tools': {
    modifiedAt: '2026-09-02',
    evidence: 'e05d25ea: app/[locale]/(with-footer)/guides/ai-note-taking-tools/page.tsx',
  },
  '/guides/ai-tools-for-voice': {
    modifiedAt: '2026-09-10',
    evidence: 'Shared evidence panel default-date removal; docs/SEO_TOPIC_CONSISTENCY_2026-09-10_CN.md',
  },
  '/explore': {
    modifiedAt: getEditorialReviewRecord('explore').reviewedAt,
    evidence: 'CTR-DIFF-05; lib/seo/contentReviewDates.ts',
  },
  '/best-ai-tools': {
    modifiedAt: '2026-09-10',
    evidence: 'Shared topic next-step copy edit; docs/SEO_TOPIC_CONSISTENCY_2026-09-10_CN.md',
  },
};

export const BEST_TOPIC_EDIT: ContentEditRecord = {
  modifiedAt: '2026-09-10',
  evidence: 'Topic data mapping and shared template correction; docs/SEO_TOPIC_CONSISTENCY_2026-09-10_CN.md',
};

export function getStaticPageLastModified(path: string): Date {
  const record = path.startsWith('/best-ai-tools/') ? BEST_TOPIC_EDIT : STATIC_PAGE_EDITS[path];
  if (!record) throw new Error(`Missing sitemap edit record: ${path}`);
  return new Date(`${record.modifiedAt}T00:00:00Z`);
}
