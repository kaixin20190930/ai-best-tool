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
    decisionCards: [
      {
        title: { cn: '做关键词与主题规划', en: 'Keyword and topic planning' },
        description: {
          cn: '优先看关键词覆盖、SERP 意图拆解和内容 brief 是否真能进入你的内容流程。',
          en: 'Focus on keyword coverage, SERP-intent breakdown, and whether the brief can actually move into your content workflow.',
        },
      },
      {
        title: { cn: '做内容优化与更新', en: 'Content optimization and refreshes' },
        description: {
          cn: '更该看页面建议是否稳定、可执行，以及你是否会持续回访这些建议。',
          en: 'Look at whether optimization suggestions are stable, actionable, and worth revisiting over time.',
        },
      },
      {
        title: { cn: '做团队增长工作流', en: 'Team growth workflows' },
        description: {
          cn: 'API、导出、权限和历史数据会比一次性的“生成效果”更重要。',
          en: 'API access, exports, permissions, and historical data matter more than a one-off flashy generation.',
        },
      },
    ],
    fitFor: [
      {
        title: { cn: '内容团队 / 独立站增长', en: 'Content teams and SEO-led growth' },
        description: {
          cn: '适合已经明确要做搜索流量、站点结构和持续内容产出的团队。',
          en: 'Best for teams already committed to search traffic, site structure, and ongoing content output.',
        },
      },
      {
        title: { cn: '需要把调研接进写作的人', en: 'Research that needs to flow into writing' },
        description: {
          cn: '如果你不是单纯查词，而是要把主题研究快速变成内容计划，这类工具更有价值。',
          en: 'Especially useful when topic research needs to become a real publishing plan quickly.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '只想偶尔写两篇内容的人', en: 'Occasional writers' },
        description: {
          cn: '如果你不是持续做内容增长，很多 SEO 套件会显得过重。',
          en: 'If you are not running an ongoing content engine, many SEO suites will feel heavier than needed.',
        },
      },
      {
        title: { cn: '只需要纯文案润色的人', en: 'People who only need copy polishing' },
        description: {
          cn: '如果重点只是改写和润色，通常通用写作工具会更直接。',
          en: 'If the goal is mostly rewriting and polishing, general writing tools are often a cleaner fit.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/guides/ai-seo-tools',
        title: { cn: '回到 SEO 选型指南', en: 'Back to the SEO guide' },
        description: {
          cn: '如果你还没想清楚该比哪些维度，先回到完整的 SEO 选型逻辑。',
          en: 'Go back if you still need the full SEO decision logic before comparing tools.',
        },
      },
      {
        href: '/guides/ai-writing-tools-comparison',
        title: { cn: '转去写作工具对比', en: 'Switch to writing tools comparison' },
        description: {
          cn: '如果你发现自己更偏内容产出，而不是 SEO 套件本身，这里更贴近真实决策。',
          en: 'Move here if the real decision is about content production rather than SEO suites.',
        },
      },
      {
        href: '/explore?search=seo&sort=popular',
        title: { cn: '继续看更多 SEO 候选', en: 'See more SEO candidates' },
        description: {
          cn: '当你已经知道方向，只需要扩大 shortlist 时，直接回 Explore 最快。',
          en: 'The fastest next step once you know the direction and just need a wider shortlist.',
        },
      },
    ],
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
