import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 生产力工具对比' : 'AI productivity tools comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的 AI 生产力工具，帮你更快选出适合的一个。'
      : 'Compare common AI productivity tools to choose the one that fits you best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '生产力工具', en: 'Productivity tools' },
    comparisonLabel: { cn: 'AI 生产力工具对比', en: 'AI productivity tools comparison' },
    description: {
      cn: '如果你已经知道自己是要做效率提升，这一页会帮你把几款常见的生产力工具放在一起看，减少反复试错。',
      en: 'If you already know you need productivity tools, this page helps you compare a few common ones side by side and reduce trial-and-error.',
    },
    searchQuery: 'productivity',
    guideHref: '/guides/ai-productivity-tools',
    backGuideLabel: { cn: '回到生产力指南', en: 'Back to productivity guide' },
    altBrowseHref: '/explore?search=productivity&sort=popular',
    altBrowseLabel: { cn: '浏览更多生产力工具', en: 'Browse more productivity tools' },
    breadcrumbLabel: { cn: '生产力工具对比', en: 'Productivity tools comparison' },
    compareTitle: { cn: '几款常见生产力工具的快速对照', en: 'A quick side-by-side look at common productivity tools' },
    compareSubtitle: { cn: '生产力', en: 'productivity' },
    tips: {
      cn: [
        '先看你是做任务管理、笔记整理、知识管理还是协作，不同场景侧重点不一样。',
        '如果你想先试再买，优先看免费版本的限制和协作能力。',
        '更看重长期使用时，关注更新频率、评分和实际评论。',
      ],
      en: [
        'Start with your use case: task management, notes, knowledge management, or collaboration all need different things.',
        'If you want to try before paying, focus on free-tier limits and collaboration depth.',
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
        question: { cn: '为什么只看生产力工具？', en: 'Why only productivity tools?' },
        answer: {
          cn: '因为生产力工具的意图很清晰，通常就是效率、协作和信息整理，对比也更直接。',
          en: 'Because productivity tools usually map to clear efficiency, collaboration, and organization needs, making comparison much more direct.',
        },
      },
    ],
  });

  return ComparisonPage({ ...data, locale });
}
