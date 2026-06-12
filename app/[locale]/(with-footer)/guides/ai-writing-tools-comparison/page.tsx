import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 写作工具对比' : 'AI writing tools comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款更有代表性的 AI 写作工具，帮你更快选出适合内容工作流的一个。'
      : 'Compare representative AI writing tools to choose the one that fits your content workflow best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '写作工具', en: 'Writing tools' },
    comparisonLabel: { cn: 'AI 写作工具对比', en: 'AI writing tools comparison' },
    description: {
      cn: '如果你已经知道自己要处理博客、营销文案、改写或创意写作，这一页会帮你把几款更有代表性的写作工具放在一起看。',
      en: 'If you already know you need help with blogs, marketing copy, rewriting, or creative drafting, this page helps you compare a few more representative writing tools side by side.',
    },
    searchQuery: 'writing',
    guideHref: '/guides/ai-writing-tools',
    backGuideLabel: { cn: '回到写作指南', en: 'Back to writing guide' },
    altBrowseHref: '/explore?search=writing&sort=popular',
    altBrowseLabel: { cn: '浏览更多写作工具', en: 'Browse more writing tools' },
    breadcrumbLabel: { cn: '写作工具对比', en: 'Writing tools comparison' },
    compareTitle: { cn: '几款代表性写作工具的快速对照', en: 'A quick side-by-side look at representative writing tools' },
    compareSubtitle: { cn: '写作', en: 'Writing' },
    preferredToolNames: ['grammarly', 'frase', 'rytr', 'sudowrite'],
    tips: {
      cn: [
        '先分清你是在做博客、营销文案、改写，还是创意写作。',
        '如果你想先试再买，优先看免费版本的限制和输出是否稳定。',
        '长期使用时，更应该看任务适配度，而不是只看一次生成效果。',
      ],
      en: [
        'Separate blogs, marketing copy, rewriting, and creative writing before comparing tools.',
        'If you want to try before paying, focus on free-tier limits and output stability.',
        'For long-term use, fit to the task matters more than one impressive generation.',
      ],
    },
    faqs: [
      {
        question: { cn: '你们比较的依据是什么？', en: 'What do you compare?' },
        answer: {
          cn: '我们主要看任务匹配度、免费可用性、评分、更新情况和实际使用感。',
          en: 'We compare task fit, free usability, ratings, freshness, and practical usefulness.',
        },
      },
      {
        question: { cn: '为什么只看这些写作工具？', en: 'Why only these writing tools?' },
        answer: {
          cn: '因为它们分别覆盖了日常编辑、搜索内容规划、轻量文案和创意写作这几类最常见的写作需求。',
          en: 'Because together they cover common writing jobs like editing, search-led content planning, lightweight copywriting, and creative drafting.',
        },
      },
    ],
  });

  return ComparisonPage({ ...data, locale });
}
