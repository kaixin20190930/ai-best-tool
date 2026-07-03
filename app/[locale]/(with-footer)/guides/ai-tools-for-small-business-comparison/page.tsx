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
    rankingHref: '/best-ai-tools/ai-small-business-tools',
    rankingLabel: { cn: '转去小企业榜单页', en: 'Open the small-business ranking' },
    backGuideLabel: { cn: '回到小企业指南', en: 'Back to small-business guide' },
    altBrowseHref: '/explore?search=business&sort=popular',
    altBrowseLabel: { cn: '浏览更多小企业工具', en: 'Browse more small-business tools' },
    breadcrumbLabel: { cn: '小企业工具对比', en: 'Small business tools comparison' },
    compareTitle: {
      cn: '几款常见小企业工具的快速对照',
      en: 'A quick side-by-side look at common small-business tools',
    },
    compareSubtitle: { cn: '小企业', en: 'small business' },
    highIntentPaths: [
      {
        href: '/best-ai-tools/ai-small-business-tools',
        title: { cn: '先看小企业榜单', en: 'Start with the small-business ranking' },
        description: {
          cn: '如果你已经确定是小企业场景，先用榜单缩小 shortlist。',
          en: 'If small-business use is clear, narrow the shortlist with the ranking first.',
        },
      },
      {
        href: '/guides/ai-tools-for-small-business',
        title: { cn: '回到小企业指南', en: 'Back to the small-business guide' },
        description: {
          cn: '如果你还想先理清营销、客服、内容和运营差异，可以回到指南页。',
          en: 'Go back if you still need to clarify marketing, support, content, and operations differences first.',
        },
      },
      {
        href: '/guides/ai-tools-for-marketing-comparison',
        title: { cn: '转去营销工具对比', en: 'Go to marketing tools comparison' },
        description: {
          cn: '如果你现在最在意获客和内容增长，这条更高意图。',
          en: 'A higher-intent path when acquisition and content growth matter most.',
        },
      },
      {
        href: '/guides/ai-tools-for-ecommerce-comparison',
        title: { cn: '转去电商工具对比', en: 'Go to ecommerce comparison' },
        description: {
          cn: '如果你的业务更偏商品、店铺和客服场景，这页更贴近。',
          en: 'Move there if the workflow is more about products, storefronts, and customer support.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/best-ai-tools/ai-small-business-tools',
        title: { cn: '先看小企业榜单页', en: 'Start with the small-business ranking' },
        description: {
          cn: '如果你想先看这一类里更稳的 shortlist，再回来细比，就先去榜单页。',
          en: 'Start with the ranking if you want the strongest shortlist before returning for a deeper comparison.',
        },
      },
      {
        href: '/guides/ai-tools-for-ecommerce-comparison',
        title: { cn: '转去电商工具对比', en: 'Switch to ecommerce comparison' },
        description: {
          cn: '如果你的业务更偏商品、店铺和客服场景，这页更贴近。',
          en: 'Go there if the workflow is more about products, storefronts, and customer support.',
        },
      },
      {
        href: '/guides/ai-tools-for-marketing-comparison',
        title: { cn: '转去营销工具对比', en: 'Switch to marketing comparison' },
        description: {
          cn: '如果当前核心问题在获客和内容增长，而不是泛运营，这页会更直接。',
          en: 'Move there if acquisition and content growth matter more than broad operations right now.',
        },
      },
    ],
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
