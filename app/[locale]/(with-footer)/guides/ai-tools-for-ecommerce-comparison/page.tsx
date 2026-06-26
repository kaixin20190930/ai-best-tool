import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 电商工具对比' : 'AI ecommerce tools comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的 AI 电商工具，帮你更快选出适合的一个。'
      : 'Compare common AI ecommerce tools to choose the one that fits you best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '电商工具', en: 'Ecommerce tools' },
    comparisonLabel: { cn: 'AI 电商工具对比', en: 'AI ecommerce tools comparison' },
    description: {
      cn: '如果你已经知道自己是在做电商或商品营销，这一页会帮你把几款常见的电商工具放在一起看，减少反复试错。',
      en: 'If you already know you need ecommerce tools, this page helps you compare a few common ones side by side and reduce trial-and-error.',
    },
    searchQuery: 'ecommerce',
    guideHref: '/guides/ai-tools-for-ecommerce',
    rankingHref: '/best-ai-tools/ai-ecommerce-tools',
    rankingLabel: { cn: '转去电商榜单页', en: 'Open the ecommerce ranking' },
    backGuideLabel: { cn: '回到电商指南', en: 'Back to ecommerce guide' },
    altBrowseHref: '/explore?search=ecommerce&sort=popular',
    altBrowseLabel: { cn: '浏览更多电商工具', en: 'Browse more ecommerce tools' },
    breadcrumbLabel: { cn: '电商工具对比', en: 'Ecommerce tools comparison' },
    compareTitle: { cn: '几款常见电商工具的快速对照', en: 'A quick side-by-side look at common ecommerce tools' },
    compareSubtitle: { cn: '电商', en: 'ecommerce' },
    nextPaths: [
      {
        href: '/best-ai-tools/ai-ecommerce-tools',
        title: { cn: '先看电商榜单页', en: 'Start with the ecommerce ranking' },
        description: {
          cn: '如果你想先把 shortlist 收紧，再回来比商品、营销和客服能力，就先去榜单页。',
          en: 'Open the ranking first if you want a tighter shortlist before comparing product, marketing, and support workflows.',
        },
      },
      {
        href: '/guides/ai-tools-for-marketing-comparison',
        title: { cn: '转去营销工具对比', en: 'Switch to marketing comparison' },
        description: {
          cn: '如果你现在更偏流量获取和广告内容，而不是店铺执行，这页更贴近。',
          en: 'Go there if the bottleneck is more about acquisition and campaign content than store execution.',
        },
      },
      {
        href: '/guides/ai-tools-for-small-business-comparison',
        title: { cn: '转去小企业工具对比', en: 'Switch to small-business comparison' },
        description: {
          cn: '如果你是更广义的经营视角，而不是纯电商，这页会更自然。',
          en: 'Move there if the decision is broader business operations rather than pure ecommerce.',
        },
      },
    ],
    tips: {
      cn: [
        '先看你要处理的是商品、客服、营销还是运营，不同场景侧重点不一样。',
        '如果你想先试再买，优先看免费版本的限制和批量能力。',
        '更看重长期使用时，关注更新频率、评分和实际评论。',
      ],
      en: [
        'Start with your use case: products, support, marketing, or operations all need different things.',
        'If you want to try before paying, focus on free-tier limits and batch capabilities.',
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
        question: { cn: '为什么只看电商工具？', en: 'Why only ecommerce tools?' },
        answer: {
          cn: '因为电商工具通常有很明确的商品、客服和营销需求，对比意图也更清晰。',
          en: 'Because ecommerce tools usually map to clear product, support, and marketing needs, which makes compare intent very clear.',
        },
      },
    ],
  });

  return (
    <>
      {ComparisonPage({ ...data, locale })}
      <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_ecommerce_comparison' />
    </>
  );
}
