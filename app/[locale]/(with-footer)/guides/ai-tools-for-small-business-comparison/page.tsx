import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 小企业工具对比' : 'AI tools for small business comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的 AI 小企业工具，帮你更快选出适合的一个。'
      : 'Compare common AI small-business tools to choose the one that fits you best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '小企业工具', en: 'Small business tools' },
    comparisonLabel: { cn: 'AI 小企业工具对比', en: 'AI tools for small business comparison' },
    description: {
      cn: '如果你已经知道自己是在做小企业或创业团队，这一页会帮你把几款常见的小企业工具放在一起看，减少反复试错。',
      en: 'If you already know you need small-business tools, this page helps you compare a few common ones side by side and reduce trial-and-error.',
    },
    searchQuery: 'business',
    guideHref: '/guides/ai-tools-for-small-business',
    backGuideLabel: { cn: '回到小企业指南', en: 'Back to small-business guide' },
    altBrowseHref: '/explore?search=business&sort=popular',
    altBrowseLabel: { cn: '浏览更多小企业工具', en: 'Browse more small-business tools' },
    breadcrumbLabel: { cn: '小企业工具对比', en: 'Small business tools comparison' },
    compareTitle: {
      cn: '几款常见小企业工具的快速对照',
      en: 'A quick side-by-side look at common small-business tools',
    },
    compareSubtitle: { cn: '小企业', en: 'small business' },
    tips: {
      cn: [
        '先看你是做营销、客服、内容还是流程自动化，不同场景侧重点不一样。',
        '如果你想先试再买，优先看免费版本的限制和协作能力。',
        '更看重长期使用时，关注更新频率、评分和实际评论。',
      ],
      en: [
        'Start with your use case: marketing, support, content, or automation all need different things.',
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
        question: { cn: '为什么只看小企业工具？', en: 'Why only small-business tools?' },
        answer: {
          cn: '因为小企业工具通常有很明确的营销、客服和运营需求，对比意图也更清晰。',
          en: 'Because small-business tools usually map to clear marketing, support, and operations needs, which makes compare intent very clear.',
        },
      },
    ],
  });

  return (
    <>
      {ComparisonPage({ ...data, locale })}
      <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_small_business_comparison' />
    </>
  );
}
