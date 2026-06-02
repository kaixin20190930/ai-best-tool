import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 记笔记工具对比' : 'AI note taking tools comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的记笔记 AI 工具，帮你更快选出适合会议和知识整理的一个。'
      : 'Compare common note taking AI tools to choose the one that fits your meetings and knowledge workflow best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '记笔记工具', en: 'Note taking tools' },
    comparisonLabel: { cn: 'AI 记笔记工具对比', en: 'AI note taking tools comparison' },
    description: {
      cn: '如果你已经知道自己要做会议、灵感记录或知识整理，这一页会帮你把几款常见工具放在一起看。',
      en: 'If you already know you need meeting capture, idea logging, or knowledge organization, this page helps you compare a few common tools side by side.',
    },
    searchQuery: 'note',
    guideHref: '/guides/ai-note-taking-tools',
    backGuideLabel: { cn: '回到记笔记指南', en: 'Back to note taking guide' },
    altBrowseHref: '/explore?search=note&sort=popular',
    altBrowseLabel: { cn: '浏览更多记笔记工具', en: 'Browse more note taking tools' },
    breadcrumbLabel: { cn: '记笔记工具对比', en: 'Note taking tools comparison' },
    compareTitle: { cn: '几款常见记笔记工具的快速对照', en: 'A quick side-by-side look at common note taking tools' },
    compareSubtitle: { cn: 'Note taking', en: 'Note taking' },
    tips: {
      cn: [
        '先看记录入口和整理能力，再看搜索与导出。',
        '如果你要团队使用，关注协作、权限和历史记录。',
        '更看重长期使用时，关注更新频率、评分和实际评论。',
      ],
      en: [
        'Start with capture and organization, then check search and exports.',
        'For team use, look at collaboration, permissions, and history.',
        'For long-term use, pay attention to freshness, ratings, and real comments.',
      ],
    },
    faqs: [
      {
        question: { cn: '你们比较的依据是什么？', en: 'What do you compare?' },
        answer: {
          cn: '我们主要看免费可用性、评分、更新情况、内容完整度和实际使用感。',
          en: 'We compare free usability, ratings, freshness, content completeness, and practical usefulness.',
        },
      },
      {
        question: { cn: '为什么只看记笔记工具？', en: 'Why only note taking tools?' },
        answer: {
          cn: '因为记笔记和会议记录的意图很明确，通常就是记录、整理和检索，对比更直接。',
          en: 'Because note taking and meeting capture have clear intent around recording, organizing, and retrieval, making comparison more direct.',
        },
      },
    ],
  });

  return ComparisonPage({ ...data, locale });
}
