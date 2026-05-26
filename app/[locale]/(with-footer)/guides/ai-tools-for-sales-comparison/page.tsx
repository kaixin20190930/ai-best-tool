import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 销售工具对比' : 'AI sales tools comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的 AI 销售工具，帮你更快选出适合的一个。'
      : 'Compare common AI sales tools to choose the one that fits you best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '销售工具', en: 'Sales tools' },
    comparisonLabel: { cn: 'AI 销售工具对比', en: 'AI sales tools comparison' },
    description: {
      cn: '如果你已经知道自己是在做销售或线索跟进，这一页会帮你把几款常见的销售工具放在一起看，减少反复试错。',
      en: 'If you already know you need sales tools, this page helps you compare a few common ones side by side and reduce trial-and-error.',
    },
    searchQuery: 'sales',
    guideHref: '/guides/ai-tools-for-sales',
    backGuideLabel: { cn: '回到销售指南', en: 'Back to sales guide' },
    altBrowseHref: '/explore?search=sales&sort=popular',
    altBrowseLabel: { cn: '浏览更多销售工具', en: 'Browse more sales tools' },
    breadcrumbLabel: { cn: '销售工具对比', en: 'Sales tools comparison' },
    compareTitle: { cn: '几款常见销售工具的快速对照', en: 'A quick side-by-side look at common sales tools' },
    compareSubtitle: { cn: '销售', en: 'sales' },
    tips: {
      cn: [
        '先看你是做线索、跟进、成交还是客户维系，不同场景侧重点不一样。',
        '如果你想先试再买，优先看免费版本的限制和集成能力。',
        '更看重长期使用时，关注更新频率、评分和实际评论。',
      ],
      en: [
        'Start with your use case: leads, follow-up, closing, or account management all need different things.',
        'If you want to try before paying, focus on free-tier limits and integration depth.',
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
        question: { cn: '为什么只看销售工具？', en: 'Why only sales tools?' },
        answer: {
          cn: '因为销售工具通常有很明确的线索、跟进和 CRM 需求，对比意图也更清晰。',
          en: 'Because sales tools usually map to clear lead, follow-up, and CRM needs, which makes compare intent very clear.',
        },
      },
    ],
  });

  return ComparisonPage({ ...data, locale });
}
