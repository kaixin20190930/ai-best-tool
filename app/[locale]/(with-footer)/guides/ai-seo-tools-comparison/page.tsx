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
    preferredToolNames: ['surfer', 'frase', 'clearscope', 'marketmuse'],
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
    comparisonDimensions: [
      {
        title: { cn: '关键词覆盖', en: 'Keyword coverage' },
        description: {
          cn: '先看它能不能把相关词、长尾词和主题集群一起铺开，而不是只给你一个单点建议。',
          en: 'Check whether it covers primary terms, long-tail variants, and topic clusters instead of single-point advice.',
        },
      },
      {
        title: { cn: '内容 brief 质量', en: 'Content brief quality' },
        description: {
          cn: '好的 SEO 工具要能把 intent、结构和可执行建议一起给出来。',
          en: 'A strong SEO tool should give you intent, structure, and actionable guidance together.',
        },
      },
      {
        title: { cn: '页面优化动作', en: 'On-page optimization' },
        description: {
          cn: '如果你要持续优化现有内容，就要看建议是否稳定、清楚、能重复使用。',
          en: 'If you are refreshing existing content, check whether recommendations are stable, clear, and reusable.',
        },
      },
      {
        title: { cn: '团队可用性', en: 'Team usability' },
        description: {
          cn: '导出、权限、协作和历史数据会直接影响团队能不能把它用进日常流程。',
          en: 'Exports, permissions, collaboration, and historical data affect whether the team can actually adopt it.',
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
        href: '/guides/ai-tools-for-research-comparison',
        title: { cn: '转去研究工具对比', en: 'Switch to research tools comparison' },
        description: {
          cn: '如果你现在更需要做 SERP 调研、竞品观察和资料发现，而不是直接写内容，这页更贴近真实工作流。',
          en: 'Move here if discovery, SERP research, and competitor analysis matter more than direct content production right now.',
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
    ],
    toolSelectionNotes: {
      surfer: {
        bestFor: {
          cn: '已经在稳定产出 SEO 内容、希望把 brief 和页面优化接到日常写作流程的团队。',
          en: 'Teams already publishing SEO content regularly and wanting briefs plus on-page optimization inside a repeatable workflow.',
        },
        whyPickIt: {
          cn: '它更像内容执行层工具，适合把关键词意图直接接到写作和更新动作里。',
          en: 'It behaves more like an execution-layer tool that turns keyword intent directly into writing and refresh actions.',
        },
        watchOut: {
          cn: '如果你现在还停留在纯关键词调研阶段，它可能会显得比你当前需要更重。',
          en: 'It can feel heavier than necessary if you are still mostly doing early-stage keyword research.',
        },
      },
      frase: {
        bestFor: {
          cn: '既要做主题调研，又要快速产出 brief 和首稿的小团队或个人站长。',
          en: 'Small teams and solo operators who need both topic research and fast brief-to-draft execution.',
        },
        whyPickIt: {
          cn: '调研和写作之间衔接很顺，适合内容节奏快、需要快速试题的工作流。',
          en: 'It connects research and writing smoothly, which fits faster publishing cycles well.',
        },
        watchOut: {
          cn: '如果你更看重企业级协作、权限和更深的数据治理，可能还要继续比较。',
          en: 'You may want to keep comparing if enterprise collaboration, permissions, or deeper data governance matter more.',
        },
      },
      clearscope: {
        bestFor: {
          cn: '已经有内容流程，只想把现有页面和文章做得更稳、更一致的团队。',
          en: 'Teams that already have a content engine and mainly want steadier, more consistent optimization on existing work.',
        },
        whyPickIt: {
          cn: '它更偏质量控制和内容优化，适合把已有内容往更高标准打磨。',
          en: 'It leans toward quality control and optimization, making it strong for refining existing content.',
        },
        watchOut: {
          cn: '如果你更需要从零开始找题、做主题地图，它不一定是最先上的那个。',
          en: 'It may not be the first tool to pick if topic discovery and planning from scratch are the real bottlenecks.',
        },
      },
      marketmuse: {
        bestFor: {
          cn: '更重视站点结构、主题覆盖和内容资产规划的内容团队。',
          en: 'Content teams that care more about site structure, topic coverage, and long-range content planning.',
        },
        whyPickIt: {
          cn: '它更接近内容策略层，而不是单篇文章层，适合做体系化内容布局。',
          en: 'It sits closer to strategy than single-article execution, which helps with system-level content planning.',
        },
        watchOut: {
          cn: '如果你只想尽快优化几篇页面，它可能不如更轻量的执行型工具直接。',
          en: 'It can feel less direct than lighter execution tools when the goal is simply to improve a handful of pages quickly.',
        },
      },
    },
    tips: {
      cn: [
        '先分清你在选调研工具、内容执行工具，还是站点策略工具。',
        '再看关键词和排名功能，最后才看历史数据和协作能力。',
        '如果你要团队使用，关注 API、导出、权限和协作能力。',
        '更看重长期使用时，关注更新频率、评分和实际评论。',
      ],
      en: [
        'First separate research tools, execution tools, and strategy-layer tools.',
        'Then compare keyword and ranking features before worrying about history and collaboration.',
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
