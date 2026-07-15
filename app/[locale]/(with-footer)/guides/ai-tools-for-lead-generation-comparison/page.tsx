import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

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
    rankingHref: '/best-ai-tools/ai-lead-generation-tools',
    rankingLabel: { cn: '转去获客榜单页', en: 'Open the lead-gen ranking' },
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
    highIntentPaths: [
      {
        href: '/best-ai-tools/ai-lead-generation-tools',
        title: { cn: '先看获客榜单', en: 'Start with the lead-gen ranking' },
        description: {
          cn: '如果获客已经是明确目标，先用榜单缩小 shortlist。',
          en: 'If lead generation is clearly the goal, narrow the shortlist with the ranking first.',
        },
      },
      {
        href: '/guides/ai-tools-for-lead-generation',
        title: { cn: '回到获客指南', en: 'Back to the lead-gen guide' },
        description: {
          cn: '如果你还想先把名单、筛选和线索质量理清，可以回到指南页。',
          en: 'Go back if you still need to clarify lists, filtering, and lead quality first.',
        },
      },
      {
        href: '/guides/ai-tools-for-sales-prospecting-comparison',
        title: { cn: '转去销售拓客对比', en: 'Go to sales prospecting comparison' },
        description: {
          cn: '如果你已经从找名单走到找人和触达，这条更高意图。',
          en: 'A higher-intent path once the work shifts from list building to targeting and outreach.',
        },
      },
      {
        href: '/guides/ai-tools-for-sales-comparison',
        title: { cn: '转去销售工具对比', en: 'Go to sales tools comparison' },
        description: {
          cn: '如果流程已经进入 CRM、跟进和成交阶段，这页更贴近。',
          en: 'Move there once the workflow has moved into CRM, follow-up, and closing.',
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

  return (
    <>
      {ComparisonPage({ ...data, locale })}
      <GuideEvidencePanel
        locale={locale}
        scope={
          locale === 'cn' || locale === 'tw'
            ? '先确认获客、名单和线索质量的真实覆盖，再继续看对比页。'
            : 'Check whether acquisition, list building, and lead quality are actually covered before continuing.'
        }
        decisionSteps={
          locale === 'cn' || locale === 'tw'
            ? [
                '先确认名单质量和命中率，不要只看数量。',
                '再看导出、清洗和 CRM 接入是否顺手。',
                '最后回到真实获客案例和反馈，判断能不能长期用。',
              ]
            : [
                'First confirm list quality and match rate instead of focusing on count.',
                'Then check export, cleanup, and CRM fit.',
                'Finally return to real acquisition cases and feedback to judge long-term use.',
              ]
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? '名单质量' : 'List quality',
            value: locale === 'cn' || locale === 'tw' ? '命中率、可用性' : 'Match rate, usability',
            note: locale === 'cn' || locale === 'tw' ? '不要只看数量。' : 'Do not focus on count alone.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '下游成本' : 'Downstream cost',
            value: locale === 'cn' || locale === 'tw' ? '导出、清洗、CRM' : 'Export, cleanup, CRM',
            note: locale === 'cn' || locale === 'tw' ? '真正费用常在后面。' : 'The real cost often appears later.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '真人信号' : 'Human signals',
            value: locale === 'cn' || locale === 'tw' ? '评论、案例、场景' : 'Comments, cases, use cases',
            note:
              locale === 'cn' || locale === 'tw'
                ? '比功能列表更能判断是否贴合。'
                : 'Often a better fit signal than feature lists.',
          },
        ]}
        signalCards={[
          {
            label: locale === 'cn' || locale === 'tw' ? '名单信号' : 'List signal',
            value: locale === 'cn' || locale === 'tw' ? '先看命中率和可用性' : 'Check match rate and usability first',
            note:
              locale === 'cn' || locale === 'tw'
                ? '名单质量差，后面所有销售动作都会受影响。'
                : 'If list quality is poor, every downstream sales motion suffers.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '下游信号' : 'Downstream signal',
            value: locale === 'cn' || locale === 'tw' ? '导出、清洗、CRM' : 'Export, cleanup, CRM',
            note:
              locale === 'cn' || locale === 'tw'
                ? '真正成本往往在名单进入 CRM 之后。'
                : 'The real cost often appears after the leads enter CRM.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '真人信号' : 'Human signal',
            value: locale === 'cn' || locale === 'tw' ? '评论、案例、场景' : 'Comments, cases, use cases',
            note:
              locale === 'cn' || locale === 'tw'
                ? '比功能列表更能判断是否贴合。'
                : 'Often a better fit signal than feature lists.',
          },
        ]}
      />
      <section className='mt-6 grid gap-4 rounded-[18px] border border-cyan-200 bg-cyan-50/70 p-6 shadow-sm md:grid-cols-3'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '最近验证' : 'Last checked'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>2026-07-15</p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '这页已按真实获客路径重新核对，保留名单、线索和质量入口。'
              : 'This page has been rechecked against a real lead-generation workflow and keeps list, lead, and quality entry points visible.'}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '当前判断' : 'Current judgment'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw'
              ? '保留索引，补真实获客证据'
              : 'Keep it indexable and add real lead-gen evidence'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '用名单质量、导出流程和真人评论把它和泛销售页区分开。'
              : 'Use list quality, export workflow, and real comments to differentiate it from generic sales pages.'}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '下一步' : 'Next step'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw' ? '补真实获客场景和反馈' : 'Add real lead-gen scenarios and feedback'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '后续优先补案例、导出样例和真人评论。'
              : 'Next, prioritize cases, export examples, and real comments.'}
          </p>
        </div>
      </section>
      <section className='mx-auto mt-8 max-w-6xl px-4 lg:px-6'>
        <div className='rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '高意图榜单' : 'High-intent ranking'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw'
              ? '先看榜单，再决定是继续看获客工具还是切到相邻入口'
              : 'Start with the ranking, then decide whether to keep comparing lead-generation tools or switch to an adjacent path'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '如果获客已经是明确目标，先收紧 shortlist 往往比继续横向浏览更多页面更有效。'
              : 'If lead generation is already the goal, narrowing the shortlist first is usually better than continuing to browse more pages horizontally.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-lead-generation-tools',
                title: locale === 'cn' || locale === 'tw' ? '获客榜单' : 'Lead-gen ranking',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '先收窄到更高相关的候选。'
                    : 'Start with the most relevant candidates first.',
              },
              {
                href: '/guides/ai-tools-for-lead-generation',
                title: locale === 'cn' || locale === 'tw' ? '获客指南' : 'Lead-gen guide',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '重新确认是找名单、补全还是排序。'
                    : 'Re-check whether the need is list building, enrichment, or prioritization.',
              },
              {
                href: '/guides/ai-tools-for-sales-prospecting-comparison',
                title: locale === 'cn' || locale === 'tw' ? '销售拓客对比' : 'Sales prospecting comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '当你已经开始找人和触达。'
                    : 'Useful when you are already moving into targeting and outreach.',
              },
              {
                href: '/guides/ai-tools-for-sales-comparison',
                title: locale === 'cn' || locale === 'tw' ? '销售工具对比' : 'Sales tools comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果流程已经进入 CRM 和成交阶段。'
                    : 'Better when the workflow has moved into CRM and closing.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`lead_generation_ranking_${item.href.split('/').pop()}`}
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
      <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_lead_generation_comparison' />
    </>
  );
}
