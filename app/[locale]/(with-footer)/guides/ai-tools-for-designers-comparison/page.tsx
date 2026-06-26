import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 设计工具对比' : 'AI design tools comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的 AI 设计工具，帮你更快选出适合的一个。'
      : 'Compare common AI design tools to choose the one that fits you best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '设计工具', en: 'Design tools' },
    comparisonLabel: { cn: 'AI 设计工具对比', en: 'AI design tools comparison' },
    description: {
      cn: '如果你已经知道自己是要做视觉设计，这一页会帮你把几款常见的设计工具放在一起看，减少反复试错。',
      en: 'If you already know you need design tools, this page helps you compare a few common ones side by side and reduce trial-and-error.',
    },
    searchQuery: 'design',
    guideHref: '/guides/ai-tools-for-designers',
    rankingHref: '/best-ai-tools/ai-image-tools',
    rankingLabel: { cn: '转去设计榜单页', en: 'Open the design ranking' },
    backGuideLabel: { cn: '回到设计指南', en: 'Back to design guide' },
    altBrowseHref: '/explore?search=design&sort=popular',
    altBrowseLabel: { cn: '浏览更多设计工具', en: 'Browse more design tools' },
    breadcrumbLabel: { cn: '设计工具对比', en: 'Design tools comparison' },
    compareTitle: { cn: '几款常见设计工具的快速对照', en: 'A quick side-by-side look at common design tools' },
    compareSubtitle: { cn: '设计', en: 'design' },
    tips: {
      cn: [
        '先看你是做品牌、海报、社媒素材还是 UI 视觉，不同场景侧重点不一样。',
        '如果你想先试再买，优先看免费版本的限制和输出质量。',
        '更看重长期使用时，关注更新频率、评分和实际评论。',
      ],
      en: [
        'Start with your use case: brand visuals, posters, social assets, or UI all need different things.',
        'If you want to try before paying, focus on free-tier limits and output quality.',
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
        question: { cn: '为什么只看设计工具？', en: 'Why only design tools?' },
        answer: {
          cn: '因为设计工具的意图很清晰，通常就是生成、编辑或品牌视觉，对比也更直接。',
          en: 'Because design tools usually map to clear generation, editing, or brand visual needs, making comparison much more direct.',
        },
      },
    ],
  });

  return (
    <>
      {ComparisonPage({ ...data, locale })}
      <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_designers_comparison' />
    </>
  );
}
