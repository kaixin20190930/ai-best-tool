import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 代理与服务团队工具对比' : 'AI tools for agencies comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的代理与服务团队 AI 工具，帮你更快判断交付、协作和客户隔离能力。'
      : 'Compare common AI tools for agencies to judge delivery workflow, collaboration, and client separation faster.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '代理与服务团队工具', en: 'Agency tools' },
    comparisonLabel: { cn: 'AI 代理与服务团队工具对比', en: 'AI tools for agencies comparison' },
    description: {
      cn: '如果你已经知道自己是在做代理交付、客户服务或内容工作室，这一页会帮你把常见候选放在一起看，减少反复试错。',
      en: 'If you already know the work is agency delivery, client service, or studio-style production, this page helps you compare common options side by side and reduce trial-and-error.',
    },
    searchQuery: 'agency',
    guideHref: '/guides/ai-tools-for-agencies',
    rankingHref: '/best-ai-tools/ai-agency-tools',
    rankingLabel: { cn: '转去代理榜单页', en: 'Open the agency ranking' },
    backGuideLabel: { cn: '回到代理指南', en: 'Back to agency guide' },
    altBrowseHref: '/explore?search=agency&sort=popular',
    altBrowseLabel: { cn: '浏览更多代理工具', en: 'Browse more agency tools' },
    breadcrumbLabel: { cn: '代理工具对比', en: 'Agency tools comparison' },
    compareTitle: { cn: '几款常见代理工具的快速对照', en: 'A quick side-by-side look at common agency tools' },
    compareSubtitle: { cn: '代理', en: 'Agency' },
    nextPaths: [
      {
        href: '/best-ai-tools/ai-agency-tools',
        title: { cn: '先看代理榜单页', en: 'Start with the agency ranking' },
        description: {
          cn: '如果你想先看更稳的 shortlist，再回来比交付和协作，就先去榜单页。',
          en: 'Start with the ranking if you want a tighter shortlist before comparing delivery and collaboration fit.',
        },
      },
      {
        href: '/guides/ai-tools-for-small-business-comparison',
        title: { cn: '转去小企业工具对比', en: 'Switch to small-business comparison' },
        description: {
          cn: '如果你的需求更偏老板视角的营销与运营，而不是代理交付，这页更贴近。',
          en: 'Go there if the need is closer to owner-led marketing and operations than client delivery.',
        },
      },
      {
        href: '/guides/ai-tools-for-creators-comparison',
        title: { cn: '转去创作者工具对比', en: 'Switch to creator tools comparison' },
        description: {
          cn: '如果你主要在做内容工作室式生产，这页会更直接。',
          en: 'Move there if the real workflow is closer to content-studio production.',
        },
      },
    ],
    tips: {
      cn: [
        '先看你的交付模式：代理商、服务团队、内容工作室或顾问。',
        '优先比较客户隔离、项目分工、批量输出和导出能力。',
        '如果多人协作，权限、共享和审计通常比单点功能更重要。',
      ],
      en: [
        'Start with your delivery model: agency, service team, content studio, or consultancy.',
        'Prioritize client separation, project splitting, bulk output, and export workflows.',
        'If multiple people collaborate, permissions, sharing, and auditability often matter more than single features.',
      ],
    },
    faqs: [
      {
        question: { cn: '你们主要比较什么？', en: 'What do you compare?' },
        answer: {
          cn: '我们主要比较交付流程、客户隔离、协作能力、导出与批量产出，以及真实使用感。',
          en: 'We mainly compare delivery workflow, client separation, collaboration depth, export and bulk-output support, and practical usefulness.',
        },
      },
      {
        question: { cn: '为什么单独看代理工具？', en: 'Why compare agency tools separately?' },
        answer: {
          cn: '因为代理团队更关心项目交付、客户隔离和多人协作，这和普通单人使用场景并不一样。',
          en: 'Because agencies care more about project delivery, client separation, and multi-person collaboration than a normal solo workflow.',
        },
      },
    ],
  });

  return (
    <>
      {ComparisonPage({ ...data, locale })}
      <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_agencies_comparison' />
    </>
  );
}
