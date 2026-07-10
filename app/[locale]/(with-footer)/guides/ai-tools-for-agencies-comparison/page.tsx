import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
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
    highIntentPaths: [
      {
        href: '/best-ai-tools/ai-agency-tools',
        title: { cn: '先看代理榜单', en: 'Start with the agency ranking' },
        description: {
          cn: '如果代理交付已经是明确目标，先用榜单缩小 shortlist。',
          en: 'If agency delivery is clearly the goal, narrow the shortlist with the ranking first.',
        },
      },
      {
        href: '/guides/ai-tools-for-agencies',
        title: { cn: '回到代理指南', en: 'Back to the agency guide' },
        description: {
          cn: '如果你还想先理清交付、协作和客户隔离，可以回到指南页。',
          en: 'Go back if you still need to clarify delivery, collaboration, and client separation first.',
        },
      },
      {
        href: '/guides/ai-tools-for-small-business-comparison',
        title: { cn: '转去小企业工具对比', en: 'Go to small-business comparison' },
        description: {
          cn: '如果你的需求更偏老板视角的经营与运营，而不是代理交付，这页更贴近。',
          en: 'Move there if the need is more owner-led operations than agency delivery.',
        },
      },
      {
        href: '/guides/ai-tools-for-creators-comparison',
        title: { cn: '转去创作者工具对比', en: 'Go to creator tools comparison' },
        description: {
          cn: '如果你其实在做内容工作室式生产，这页更顺。',
          en: 'A better fit if your workflow is really more like content-studio production.',
        },
      },
    ],
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
      <GuideEvidencePanel
        locale={locale}
        scope={
          locale === 'cn' || locale === 'tw'
            ? '代理与服务团队页要围绕交付、协作和客户隔离来判断，而不是单纯看产出功能。'
            : 'Agency and service-team comparison should be judged around delivery, collaboration, and client separation rather than output features alone.'
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? '交付流程' : 'Delivery workflow',
            value: locale === 'cn' || locale === 'tw' ? '看能否稳定交付' : 'See whether it can deliver consistently',
            note:
              locale === 'cn' || locale === 'tw'
                ? '交付稳定性比单点功能更重要。'
                : 'Delivery stability matters more than isolated features.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '客户隔离' : 'Client separation',
            value: locale === 'cn' || locale === 'tw' ? '看能否分客户管理' : 'Check whether clients can be separated cleanly',
            note:
              locale === 'cn' || locale === 'tw'
                ? '代理场景里这是硬需求。'
                : 'This is a hard requirement in agency workflows.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '协作与审计' : 'Collaboration and audit',
            value: locale === 'cn' || locale === 'tw' ? '看多人能否顺手接力' : 'See whether multiple people can hand off smoothly',
            note:
              locale === 'cn' || locale === 'tw'
                ? '多人协作和留痕决定能不能长期用。'
                : 'Collaboration and traceability decide long-term adoption.',
          },
        ]}
      />
      <section className='mx-auto mt-8 max-w-6xl px-4 lg:px-6'>
        <div className='rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '高意图榜单' : 'High-intent ranking'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw'
              ? '先看榜单，再决定是继续看代理工具还是切到相邻入口'
              : 'Start with the ranking, then decide whether to keep comparing agency tools or switch to an adjacent path'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '如果代理交付已经是明确目标，先收紧 shortlist 往往比继续横向浏览更多页面更有效。'
              : 'If agency delivery is already the goal, narrowing the shortlist first is usually better than continuing to browse more pages horizontally.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-agency-tools',
                title: locale === 'cn' || locale === 'tw' ? '代理榜单' : 'Agency ranking',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '先收窄到更高相关的候选。'
                    : 'Start with the most relevant candidates first.',
              },
              {
                href: '/guides/ai-tools-for-agencies',
                title: locale === 'cn' || locale === 'tw' ? '代理指南' : 'Agency guide',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '重新确认是交付、协作还是客户隔离。'
                    : 'Re-check whether the need is delivery, collaboration, or client separation.',
              },
              {
                href: '/guides/ai-tools-for-small-business-comparison',
                title: locale === 'cn' || locale === 'tw' ? '小企业对比' : 'Small-business comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你更偏老板视角的运营与经营。'
                    : 'Useful when the workflow is more owner-led operations than agency delivery.',
              },
              {
                href: '/guides/ai-tools-for-creators-comparison',
                title: locale === 'cn' || locale === 'tw' ? '创作者对比' : 'Creator comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你实际更像内容工作室式生产。'
                    : 'Better when the workflow is really closer to content-studio production.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`agency_ranking_${item.href.split('/').pop()}`}
                ctaLabel={item.title}
                pageType='guide'
                className='rounded-xl border border-white bg-white p-4 shadow-sm hover:bg-slate-50'
              >
                <p className='text-sm font-semibold text-slate-950'>{item.title}</p>
                <p className='mt-2 text-sm leading-6 text-slate-600'>{item.desc}</p>
              </TrackableCtaLink>
            ))}
          </div>
        </div>
      </section>
      <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_agencies_comparison' />
    </>
  );
}
