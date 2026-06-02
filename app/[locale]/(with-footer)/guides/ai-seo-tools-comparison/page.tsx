import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI SEO 工具对比' : 'AI SEO tools comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的 SEO AI 工具，帮你更快选出适合关键词和排名跟踪的一个。'
      : 'Compare common SEO AI tools to choose the one that fits your keyword and rank tracking workflow best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: 'SEO 工具', en: 'SEO tools' },
    comparisonLabel: { cn: 'AI SEO 工具对比', en: 'AI SEO tools comparison' },
    description: {
      cn: '如果你已经知道自己要做关键词研究、内容优化或排名跟踪，这一页会帮你把几款常见工具放在一起看。',
      en: 'If you already know you need keyword research, content optimization, or rank tracking, this page helps you compare a few common tools side by side.',
    },
    searchQuery: 'seo',
    guideHref: '/guides/ai-seo-tools',
    backGuideLabel: { cn: '回到 SEO 指南', en: 'Back to SEO guide' },
    altBrowseHref: '/explore?search=seo&sort=popular',
    altBrowseLabel: { cn: '浏览更多 SEO 工具', en: 'Browse more SEO tools' },
    breadcrumbLabel: { cn: 'SEO 工具对比', en: 'SEO tools comparison' },
    compareTitle: { cn: '几款常见 SEO 工具的快速对照', en: 'A quick side-by-side look at common SEO tools' },
    compareSubtitle: { cn: 'SEO', en: 'SEO' },
    tips: {
      cn: [
        '先看关键词和排名功能，再看内容优化和历史数据。',
        '如果你要团队使用，关注 API、导出、权限和协作能力。',
        '更看重长期使用时，关注更新频率、评分和实际评论。',
      ],
      en: [
        'Start with keyword and ranking features, then check content optimization and historical data.',
        'For team use, look at API access, exports, permissions, and collaboration.',
        'For long-term use, pay attention to freshness, ratings, and real comments.',
      ],
    },
    faqs: [
      {
        question: { cn: '你们比较的依据是什么？', en: 'What do you compare?' },
        answer: {
          cn: '我们主要看数据覆盖、免费可用性、评分、更新情况和实际使用感。',
          en: 'We compare data coverage, free usability, ratings, freshness, and practical usefulness.',
        },
      },
      {
        question: { cn: '为什么只看 SEO 工具？', en: 'Why only SEO tools?' },
        answer: {
          cn: '因为 SEO 工具的意图比较明确，通常围绕关键词、内容和排名，对比也更直接。',
          en: 'Because SEO tools usually map to clear needs around keywords, content, and rankings, making comparison more direct.',
        },
      },
    ],
  });

  return ComparisonPage({ ...data, locale });
}
