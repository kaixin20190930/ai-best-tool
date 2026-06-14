import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 获客工具对比' : 'AI lead generation tools comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比 AI 获客工具，帮助你更快判断名单来源、筛选方式和线索质量。'
      : 'Compare AI lead-generation tools to judge list sources, filtering logic, and lead quality faster.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '获客工具', en: 'Lead generation tools' },
    comparisonLabel: { cn: 'AI 获客工具对比', en: 'AI lead generation tools comparison' },
    description: {
      cn: '如果你已经知道自己要做找名单、补全线索或初步筛选，这一页会帮你把决策重点放回“线索质量”而不是泛功能数量。',
      en: 'If you already know the work is list building, enrichment, or early qualification, this page puts the decision back on lead quality instead of generic feature counts.',
    },
    searchQuery: 'lead',
    guideHref: '/guides/ai-tools-for-lead-generation',
    backGuideLabel: { cn: '回到获客指南', en: 'Back to lead-gen guide' },
    altBrowseHref: '/explore?search=lead&sort=popular',
    altBrowseLabel: { cn: '浏览更多获客相关工具', en: 'Browse more lead-gen tools' },
    breadcrumbLabel: { cn: '获客工具对比', en: 'Lead generation tools comparison' },
    compareTitle: { cn: '获客工具的快速对照', en: 'A quick side-by-side look at lead-generation tools' },
    compareSubtitle: { cn: 'Lead gen', en: 'Lead gen' },
    allowPopularFallback: false,
    preferredToolNames: ['hunter-io', 'apollo-io', 'zoominfo', 'clay'],
    decisionCards: [
      {
        title: { cn: '找新名单', en: 'Find new lists' },
        description: {
          cn: '重点看覆盖范围、定位精度，以及能否把模糊目标变成可操作名单。',
          en: 'Focus on coverage, targeting precision, and whether vague ICP ideas become workable lists.',
        },
      },
      {
        title: { cn: '补全已有线索', en: 'Enrich existing leads' },
        description: {
          cn: '重点看公司信息、职位、联系方式和去重能力。',
          en: 'Focus on company context, role data, contact fields, and deduplication.',
        },
      },
      {
        title: { cn: '给线索排序', en: 'Prioritize leads' },
        description: {
          cn: '更该看筛选规则、标签和后续触达工作流的衔接。',
          en: 'Pay more attention to filtering logic, labeling, and fit with downstream outreach workflows.',
        },
      },
    ],
    fitFor: [
      {
        title: { cn: '独立开发者与小团队', en: 'Indie founders and small teams' },
        description: {
          cn: '很适合没有专门销售运营、需要自己把找客户这一步做轻的人。',
          en: 'A strong fit when there is no dedicated sales-ops layer and the founder needs a lighter way to find customers.',
        },
      },
      {
        title: { cn: '已经有明确 ICP 的团队', en: 'Teams with a clear ICP' },
        description: {
          cn: '如果你已经知道要找谁，这类工具更容易体现价值。',
          en: 'These tools become more effective once you already know who the target buyer is.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '仍在找产品方向的人', en: 'People still discovering the product direction' },
        description: {
          cn: '如果连目标客户轮廓都不清楚，获客工具不会替你完成定位。',
          en: 'If the buyer profile is still blurry, lead-gen tools will not solve the positioning problem for you.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/guides/ai-tools-for-sales-prospecting-comparison',
        title: { cn: '转去销售拓客对比', en: 'Go to sales prospecting comparison' },
        description: {
          cn: '当决策点从“找谁”转到“怎么联系”，这页更贴近高意图。',
          en: 'A better fit once the decision shifts from who to target toward how to approach them.',
        },
      },
      {
        href: '/guides/ai-tools-for-sales-comparison',
        title: { cn: '转去销售工具对比', en: 'Go to sales tools comparison' },
        description: {
          cn: '如果流程已经进入跟进、CRM 和成交阶段，就继续走这里。',
          en: 'Continue here once the work has moved into follow-up, CRM, and pipeline stages.',
        },
      },
      {
        href: '/guides/ai-seo-tools-comparison',
        title: { cn: '转去 SEO 工具对比', en: 'Go to AI SEO tools comparison' },
        description: {
          cn: '如果你发现真实获客方式更偏内容和搜索流量，这页更合适。',
          en: 'This is the better path when acquisition is leaning more toward content and search traffic.',
        },
      },
    ],
    tips: {
      cn: [
        '先判断你更缺名单、联系人信息，还是线索优先级判断。',
        '不要只看数量，名单命中率和后续可用性更重要。',
        '如果线索最终还要进入 CRM 或外呼，导出和清洗成本要提前考虑。',
      ],
      en: [
        'Decide whether the real gap is lists, contact data, or prioritization.',
        'Do not optimize for quantity alone. Match rate and downstream usability matter more.',
        'If leads will move into CRM or outbound tools, think about export and cleanup cost early.',
      ],
    },
    faqs: [
      {
        question: { cn: '你们主要比较什么？', en: 'What do you compare?' },
        answer: {
          cn: '主要比较线索来源、筛选逻辑、导出可用性，以及它和后续销售流程的衔接程度。',
          en: 'We mainly compare lead sources, filtering logic, export usability, and fit with downstream sales workflows.',
        },
      },
      {
        question: { cn: '为什么单独做获客对比？', en: 'Why compare lead-gen tools separately?' },
        answer: {
          cn: '因为名单发现和线索筛选的判断逻辑，和 CRM、成交、客户成功这类销售后段工具并不一样。',
          en: 'Because the judgment logic for lead discovery and qualification is different from CRM, closing, or customer-success tools later in the sales process.',
        },
      },
    ],
  });

  return ComparisonPage({ ...data, locale });
}
