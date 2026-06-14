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
    preferredToolNames: ['apollo-io', 'clay', 'outreach', 'lemlist'],
    comparisonDimensions: [
      {
        title: { cn: '线索来源', en: 'Lead sourcing' },
        description: {
          cn: '先看名单从哪里来、覆盖够不够准，不要只看线索数量。',
          en: 'Check where leads come from and whether the coverage is actually relevant, not just how many prospects it finds.',
        },
      },
      {
        title: { cn: '外联个性化', en: 'Outreach personalization' },
        description: {
          cn: '如果核心在触达和回复，个性化、序列和上下文会比“自动发多少”更重要。',
          en: 'If the job is outreach and replies, personalization, sequencing, and context matter more than raw send volume.',
        },
      },
      {
        title: { cn: '流程协作', en: 'Workflow coordination' },
        description: {
          cn: '多人一起用时，权限、记录、分工和交接顺不顺手会直接影响采用率。',
          en: 'When multiple people share the workflow, permissions, records, handoff, and division of labor directly affect adoption.',
        },
      },
      {
        title: { cn: '集成与可扩展性', en: 'Integrations and extensibility' },
        description: {
          cn: '如果它要接 CRM、邮箱、表格或内部系统，集成深度决定后续能不能长期用。',
          en: 'If it needs to connect to CRM, email, spreadsheets, or internal systems, integration depth decides whether it will last.',
        },
      },
    ],
    decisionCards: [
      {
        title: { cn: '偏获客与名单', en: 'Lead discovery and list building' },
        description: {
          cn: '重点看名单来源、补全能力和线索初筛，而不是只看 CRM 或发送能力。',
          en: 'Focus on list sourcing, enrichment, and qualification instead of only CRM or sending features.',
        },
      },
      {
        title: { cn: '偏外联与跟进', en: 'Outreach and follow-up' },
        description: {
          cn: '更该看触达上下文、序列逻辑和回应率，而不只是自动化多少。',
          en: 'Pay more attention to context, sequencing logic, and reply quality than to automation volume alone.',
        },
      },
      {
        title: { cn: '偏流程与协作', en: 'Workflow and team coordination' },
        description: {
          cn: '如果多人协作是重点，权限、记录、集成和交接会更重要。',
          en: 'If multiple people touch the workflow, permissions, records, integrations, and handoff matter more.',
        },
      },
    ],
    fitFor: [
      {
        title: { cn: '已经开始做主动获客的团队', en: 'Teams already doing active go-to-market work' },
        description: {
          cn: '这类页最适合已经在找客户、发外联或管理销售流程的人。',
          en: 'This page is most useful once the team is already finding buyers, sending outreach, or running a sales process.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '只想找通用 AI 助手的人', en: 'People who only want a broad AI assistant' },
        description: {
          cn: '如果目标还只是通用写作或问答，这类销售工具会显得过窄。',
          en: 'If the goal is still generic writing or Q&A, sales tools will likely feel too specialized.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/guides/ai-tools-for-lead-generation-comparison',
        title: { cn: '转去获客工具对比', en: 'Go to lead generation comparison' },
        description: {
          cn: '更适合名单来源、补全和早期筛选场景。',
          en: 'A better fit for list sourcing, enrichment, and early qualification work.',
        },
      },
      {
        href: '/guides/ai-tools-for-sales-prospecting-comparison',
        title: { cn: '转去销售拓客工具对比', en: 'Go to sales prospecting comparison' },
        description: {
          cn: '更适合个性化外联、联系策略和触达执行场景。',
          en: 'Better for personalized outreach, contact strategy, and prospecting execution.',
        },
      },
    ],
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
