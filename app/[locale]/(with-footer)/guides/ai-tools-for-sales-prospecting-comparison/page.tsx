import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 销售拓客工具对比' : 'AI sales prospecting tools comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比 AI 销售拓客工具，帮助你更快判断个性化触达、外联准备和 prospecting 适配度。'
      : 'Compare AI sales-prospecting tools to judge outreach personalization, contact prep, and prospecting fit faster.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '销售拓客工具', en: 'Sales prospecting tools' },
    comparisonLabel: { cn: 'AI 销售拓客工具对比', en: 'AI sales prospecting tools comparison' },
    description: {
      cn: '如果你已经明确自己要做主动触达、外联准备和 prospecting，这一页会帮你把判断重点放回“回应率和上下文匹配”，而不只是自动化程度。',
      en: 'If the job is clearly outbound prospecting, this page brings the decision back to response quality and contextual fit instead of raw automation alone.',
    },
    searchQuery: 'sales',
    guideHref: '/guides/ai-tools-for-sales-prospecting',
    rankingHref: '/best-ai-tools/ai-sales-prospecting-tools',
    rankingLabel: { cn: '转去销售拓客榜单页', en: 'Open the sales prospecting ranking' },
    backGuideLabel: { cn: '回到销售拓客指南', en: 'Back to sales prospecting guide' },
    altBrowseHref: '/explore?search=sales&sort=popular',
    altBrowseLabel: { cn: '浏览更多销售相关工具', en: 'Browse more sales-related tools' },
    breadcrumbLabel: { cn: '销售拓客工具对比', en: 'Sales prospecting tools comparison' },
    compareTitle: { cn: '销售拓客工具的快速对照', en: 'A quick side-by-side look at sales-prospecting tools' },
    compareSubtitle: { cn: 'Prospecting', en: 'Prospecting' },
    allowPopularFallback: false,
    preferredToolNames: ['outreach', 'salesloft', 'lemlist', 'smartlead'],
    decisionCards: [
      {
        title: { cn: '写第一封外联', en: 'Write the first-touch message' },
        description: {
          cn: '重点看它能否利用目标客户上下文，而不是只会写更长的模板。',
          en: 'Focus on whether it uses buyer context, not whether it simply writes longer templates.',
        },
      },
      {
        title: { cn: '安排跟进节奏', en: 'Plan the follow-up cadence' },
        description: {
          cn: '看它是否能支持不同类型对象的触达节奏，而不是一套流程打所有人。',
          en: 'Check whether it supports different cadences for different buyer types instead of forcing one sequence onto everyone.',
        },
      },
      {
        title: { cn: '提高回应率', en: 'Improve response quality' },
        description: {
          cn: '更该看个性化粒度、名单质量和触达角度，而不是单次生成速度。',
          en: 'Pay more attention to personalization depth, list quality, and outreach angle than to generation speed alone.',
        },
      },
    ],
    fitFor: [
      {
        title: { cn: '已经开始主动触达的团队', en: 'Teams already doing outbound' },
        description: {
          cn: '当你已经在联系潜在客户时，prospecting 工具更容易体现真实价值。',
          en: 'Prospecting tools become much more valuable once the team is already reaching out to buyers.',
        },
      },
      {
        title: { cn: '需要个性化但没时间手工做的人', en: 'People who need personalization without fully manual work' },
        description: {
          cn: '如果你想提高每条触达的上下文质量，但不想每次都从头写，这类工具很贴合。',
          en: 'A good fit when you want more contextual outreach without writing every message from scratch.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '还没确定要联系谁的人', en: 'People who still do not know who to contact' },
        description: {
          cn: '如果目标名单本身还没建立，先去看获客工具会更合适。',
          en: 'If the target list is still unclear, lead-generation tools are the better first step.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/guides/ai-tools-for-lead-generation-comparison',
        title: { cn: '转去获客工具对比', en: 'Go to lead-generation comparison' },
        description: {
          cn: '更适合名单来源、线索补全和初筛判断。',
          en: 'A better fit for list sourcing, enrichment, and early qualification.',
        },
      },
      {
        href: '/guides/ai-tools-for-sales-comparison',
        title: { cn: '转去销售工具对比', en: 'Go to sales tools comparison' },
        description: {
          cn: '当决策点已经进入跟进、记录和 pipeline 管理时，就走这里。',
          en: 'Use this path once the decision has moved into follow-up, record keeping, and pipeline flow.',
        },
      },
      {
        href: '/guides/ai-writing-tools-comparison',
        title: { cn: '转去写作工具对比', en: 'Go to AI writing tools comparison' },
        description: {
          cn: '如果你发现真正需要的是更强的内容表达和改写，而不是 prospecting 流程本身，这页更合适。',
          en: 'This is better when the real need is stronger writing quality and rewriting rather than the prospecting workflow itself.',
        },
      },
    ],
    tips: {
      cn: [
        '先判断你要优化的是名单优先级、触达开场，还是跟进节奏。',
        '不要只看自动化，回应率往往更受上下文质量影响。',
        '如果后续要进 CRM 或邮箱系统，确认集成成本和工作流摩擦。',
      ],
      en: [
        'Decide whether you are optimizing prioritization, message openers, or follow-up cadence.',
        'Do not overvalue automation alone. Response quality usually depends more on context.',
        'If the workflow will continue in CRM or email systems, check integration cost and friction.',
      ],
    },
    faqs: [
      {
        question: { cn: '你们主要比较什么？', en: 'What do you compare?' },
        answer: {
          cn: '主要比较上下文利用、个性化深度、触达准备效率，以及和后续销售流程的衔接。',
          en: 'We mainly compare contextual use, personalization depth, outreach-prep efficiency, and fit with downstream sales flow.',
        },
      },
      {
        question: { cn: '为什么把 prospecting 单独拿出来？', en: 'Why compare prospecting tools separately?' },
        answer: {
          cn: '因为 prospecting 的核心不是泛销售管理，而是如何更聪明地联系对的人。',
          en: 'Because the core of prospecting is not broad sales management. It is how to contact the right people more intelligently.',
        },
      },
    ],
  });

  return (
    <>
      {ComparisonPage({ ...data, locale })}
      <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_sales_prospecting_comparison' />
    </>
  );
}
