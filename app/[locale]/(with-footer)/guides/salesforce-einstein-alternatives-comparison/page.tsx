import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw'
      ? 'Salesforce Einstein 替代方案对比'
      : 'Salesforce Einstein alternatives comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款更常被拿来替代 Salesforce Einstein 的 AI 工具，帮你更快判断 CRM、销售自动化和企业工作流该怎么选。'
      : 'Compare AI tools that are commonly used as Salesforce Einstein alternatives so you can choose the right fit for CRM, sales automation, and enterprise workflows.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '销售工具', en: 'Sales tools' },
    comparisonLabel: {
      cn: 'Salesforce Einstein 替代方案对比',
      en: 'Salesforce Einstein alternatives comparison',
    },
    description: {
      cn: '如果你已经在比较 Salesforce Einstein 这类 CRM 与销售智能入口，这一页会把常见替代项放在一起看，帮助你判断是要企业级 CRM、营销自动化，还是更轻量的销售工作流。',
      en: 'If you are already comparing Salesforce Einstein-style CRM and sales-intelligence entry points, this page puts the common alternatives side by side so you can decide whether you need enterprise CRM, marketing automation, or a lighter sales workflow.',
    },
    searchQuery: 'sales',
    guideHref: '/guides/ai-tools-for-sales',
    rankingHref: '/best-ai-tools/ai-sales-prospecting-tools',
    rankingLabel: { cn: '转去销售榜单页', en: 'Open the sales ranking' },
    backGuideLabel: { cn: '回到销售指南', en: 'Back to sales guide' },
    altBrowseHref: '/explore?search=sales&sort=popular',
    altBrowseLabel: { cn: '浏览更多销售相关工具', en: 'Browse more sales-related tools' },
    breadcrumbLabel: { cn: 'Salesforce Einstein 替代方案对比', en: 'Salesforce Einstein alternatives comparison' },
    compareTitle: {
      cn: '几款常见 Salesforce Einstein 替代项的快速对照',
      en: 'A quick side-by-side look at common Salesforce Einstein alternatives',
    },
    compareSubtitle: { cn: 'Salesforce', en: 'Salesforce' },
    preferredToolNames: ['salesforce_einstein', 'hubspot', 'apollo-io', 'clay'],
    decisionCards: [
      {
        title: { cn: '先看是不是企业级 CRM', en: 'Enterprise CRM first' },
        description: {
          cn: 'Salesforce Einstein 的重点通常不是单点 AI，而是 AI 叠在 CRM、数据和流程之上。',
          en: 'Salesforce Einstein is usually about adding AI on top of CRM, data, and processes rather than one-off AI features.',
        },
      },
      {
        title: { cn: '再看是不是要自动化编排', en: 'Automation orchestration' },
        description: {
          cn: '如果你需要把销售、服务、营销和运营串起来，系统级自动化会比单一助手重要得多。',
          en: 'If you need sales, service, marketing, and operations connected, system-level automation matters much more than a single assistant.',
        },
      },
      {
        title: { cn: '最后看是否适合长期企业落地', en: 'Enterprise adoption' },
        description: {
          cn: '权限、数据治理、可扩展性和集成深度，往往决定它能不能真的落进企业流程。',
          en: 'Permissions, data governance, extensibility, and integration depth often decide whether it can actually land in enterprise workflows.',
        },
      },
    ],
    fitFor: [
      {
        title: { cn: '有成熟销售/CRM 团队的公司', en: 'Companies with mature sales or CRM teams' },
        description: {
          cn: '适合已经在做 CRM 管理、销售流程和跨团队协作的组织。',
          en: 'A good fit for organizations already managing CRM, sales processes, and cross-team collaboration.',
        },
      },
      {
        title: { cn: '需要企业级工作流的人', en: 'People who need enterprise workflows' },
        description: {
          cn: '如果你的 AI 不是单点工具，而是要进入更大的系统，这类页会很有帮助。',
          en: 'Useful when the AI tool is not standalone but needs to fit into a larger system.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '只想做轻量销售外联的人', en: 'People who only need lightweight outreach' },
        description: {
          cn: '如果你只是在做外联或线索补全，销售拓客页通常更轻。',
          en: 'If you only need outreach or lead enrichment, the prospecting or lead-gen pages are lighter.',
        },
      },
      {
        title: { cn: '没有 CRM 规模需求的人', en: 'People without CRM scale needs' },
        description: {
          cn: '如果你的流程还很早期，企业级系统通常会显得过重。',
          en: 'If your process is still early, an enterprise system will usually feel too heavy.',
        },
      },
    ],
    highIntentPaths: [
      {
        href: '/best-ai-tools/ai-sales-tools',
        title: { cn: '先看销售榜单', en: 'Start with the sales ranking' },
        description: {
          cn: '如果你已经明确在找销售/CRM 系统，先用榜单收窄候选。',
          en: 'If sales or CRM systems are already the goal, use the ranking first to narrow candidates.',
        },
      },
      {
        href: '/guides/ai-tools-for-sales-comparison',
        title: { cn: '转去销售工具总对比', en: 'Go to sales tools comparison' },
        description: {
          cn: '如果你要把候选范围再拉宽一点，这页更适合。',
          en: 'Use this when you want a broader shortlist.',
        },
      },
      {
        href: '/guides/hubspot-alternatives-comparison',
        title: { cn: '转去 HubSpot 替代方案对比', en: 'Go to HubSpot alternatives comparison' },
        description: {
          cn: '如果你更关注 CRM 加营销自动化，这条路径更高意图。',
          en: 'A higher-intent path when CRM plus marketing automation is the real need.',
        },
      },
      {
        href: '/guides/ai-tools-for-sales-prospecting-comparison',
        title: { cn: '转去销售拓客对比', en: 'Go to sales prospecting comparison' },
        description: {
          cn: '如果你更偏外联和线索编排，这页也值得继续看。',
          en: 'Move here if outbound and lead orchestration are part of the decision.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/guides/ai-tools-for-sales-comparison',
        title: { cn: '转去销售工具总对比', en: 'Go to sales tools comparison' },
        description: {
          cn: '如果你要把候选范围再拉宽一点，这页更适合。',
          en: 'Use this when you want a broader shortlist.',
        },
      },
      {
        href: '/guides/hubspot-alternatives-comparison',
        title: { cn: '转去 HubSpot 替代方案对比', en: 'Go to HubSpot alternatives comparison' },
        description: {
          cn: '如果你更关注 CRM 加营销自动化，这条路径很顺。',
          en: 'A good next stop when CRM plus marketing automation is the real need.',
        },
      },
      {
        href: '/guides/ai-tools-for-sales-prospecting-comparison',
        title: { cn: '转去销售拓客工具对比', en: 'Go to sales prospecting comparison' },
        description: {
          cn: '如果你更偏外联执行和个性化触达，这页更贴近。',
          en: 'Move here if the real need is outbound execution and personalized outreach.',
        },
      },
    ],
    toolSelectionNotes: {
      salesforce_einstein: {
        bestFor: {
          cn: '需要把 AI 放进成熟 CRM、销售和企业流程里的团队。',
          en: 'Teams that need AI inside a mature CRM, sales, and enterprise process stack.',
        },
        whyPickIt: {
          cn: '它的价值更多在系统级联动，而不是单个 AI 功能点。',
          en: 'Its value lies more in system-level coordination than in a single AI feature.',
        },
        watchOut: {
          cn: '如果你只是想要轻量销售辅助，它通常会显得过重。',
          en: 'If you only want lightweight sales assistance, it will likely feel too heavy.',
        },
      },
      hubspot: {
        bestFor: {
          cn: '需要 CRM、营销和流程串起来的团队。',
          en: 'Teams that want CRM, marketing, and workflows connected together.',
        },
        whyPickIt: {
          cn: '它更接近营销系统而不是单点生成器。',
          en: 'It is closer to a marketing system than a single-purpose generator.',
        },
        watchOut: {
          cn: '如果你需要更成熟的企业级数据治理，Salesforce 路线更强。',
          en: 'If you need more mature enterprise data governance, Salesforce is stronger.',
        },
      },
      'apollo-io': {
        bestFor: {
          cn: '需要线索发现、名单补全和外联准备的人。',
          en: 'People who need lead discovery, enrichment, and outreach prep.',
        },
        whyPickIt: {
          cn: '它更偏前段获客和拓客，而不是完整 CRM 系统。',
          en: 'It is more focused on top-of-funnel acquisition and prospecting than a full CRM.',
        },
        watchOut: {
          cn: '如果你的需求已经进入企业级流程治理，它不一定覆盖到位。',
          en: 'If you have moved into enterprise workflow governance, it may not go far enough.',
        },
      },
      clay: {
        bestFor: {
          cn: '需要数据拼接、线索编排和灵活流程的人。',
          en: 'People who need data stitching, lead orchestration, and flexible workflows.',
        },
        whyPickIt: {
          cn: '它更像把数据和流程拉在一起的工作台。',
          en: 'It behaves more like a workbench for stitching data and workflows together.',
        },
        watchOut: {
          cn: '如果你要的是企业 CRM 的完整平台能力，可能还要继续看。',
          en: 'If you need full enterprise CRM platform capabilities, keep looking further.',
        },
      },
    },
    tips: {
      cn: [
        '先分清你是在补 AI 能力，还是在选 CRM 平台。',
        '如果有多个团队一起用，权限、治理和集成深度很关键。',
        '如果只是前段获客，别直接上企业级系统。',
      ],
      en: [
        'First separate adding AI capability from choosing a CRM platform.',
        'If multiple teams will use it, permissions, governance, and integration depth matter a lot.',
        'If you only need top-of-funnel acquisition, do not jump straight to an enterprise system.',
      ],
    },
    faqs: [
      {
        question: {
          cn: '为什么单独做 Salesforce Einstein 替代方案页？',
          en: 'Why make a separate Salesforce Einstein alternatives page?',
        },
        answer: {
          cn: '因为很多用户已经明确在找企业级 CRM AI，这比泛销售工具对比更接近真实决策。',
          en: 'Because many users are explicitly looking for enterprise CRM AI, which is closer to a real decision than a broad sales-tool comparison.',
        },
      },
      {
        question: { cn: '你们比较的依据是什么？', en: 'What do you compare?' },
        answer: {
          cn: '我们主要看 CRM、自动化、协作、治理、集成和真实反馈。',
          en: 'We compare CRM, automation, collaboration, governance, integration, and real feedback.',
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
            ? '这页先看真实可验证的 Salesforce Einstein 信号，再继续判断是否真的需要 CRM、销售自动化和企业工作流。'
            : 'This page looks at verifiable Salesforce Einstein alternative signals first, then helps you decide whether CRM, sales automation, and enterprise workflows are truly needed.'
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? 'CRM 适配' : 'CRM fit',
            value: locale === 'cn' || locale === 'tw' ? '是否能进销售体系' : 'Can it fit the sales stack',
            note:
              locale === 'cn' || locale === 'tw'
                ? '如果不是 CRM 层的需求，就别把它当成普通 AI 工具比。'
                : 'If CRM is not the job, do not compare it like a generic AI tool.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '自动化编排' : 'Automation orchestration',
            value: locale === 'cn' || locale === 'tw' ? '销售和流程是否能连起来' : 'Can sales and workflows connect',
            note:
              locale === 'cn' || locale === 'tw'
                ? '企业工具的关键是流程能不能真的跑通。'
                : 'Enterprise tools live or die by whether the process actually runs.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '企业落地' : 'Enterprise adoption',
            value: locale === 'cn' || locale === 'tw' ? '权限、数据和扩展性' : 'Permissions, data, and extensibility',
            note:
              locale === 'cn' || locale === 'tw'
                ? '能不能落进企业流程，通常比单点功能更重要。'
                : 'Landing in enterprise workflow matters more than individual features.',
          },
        ]}
      />
      <section className='mt-6 grid gap-4 rounded-[18px] border border-cyan-200 bg-cyan-50/70 p-6 shadow-sm md:grid-cols-3'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '最近验证' : 'Last checked'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>2026-07-13</p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '这页已按真实 CRM / 企业替代路径重新核对，保留销售、自动化和企业入口。'
              : 'This page has been rechecked against a real CRM/enterprise-alternative workflow and keeps sales, automation, and enterprise entry points visible.'}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '当前判断' : 'Current judgment'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw'
              ? '保留索引，补真实企业证据'
              : 'Keep it indexable and add real enterprise evidence'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '用 CRM 适配、自动化和真人评论把它和泛销售页区分开。'
              : 'Use CRM fit, automation, and real comments to differentiate it from generic sales pages.'}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '下一步' : 'Next step'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw' ? '补真实企业场景和反馈' : 'Add real enterprise scenarios and feedback'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '后续优先补案例、CRM 样例和真人评论。'
              : 'Next, prioritize cases, CRM examples, and real comments.'}
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
              ? '先看榜单，再决定是继续看 CRM 类工具还是切到相邻入口'
              : 'Start with the ranking, then decide whether to keep comparing CRM-style tools or switch to an adjacent path'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '如果你已经明确在找企业级 CRM 或销售智能工具，先收紧 shortlist 往往比继续横向浏览更多页面更有效。'
              : 'If enterprise CRM or sales-intelligence tools are already the goal, narrowing the shortlist first is usually better than continuing to browse more pages horizontally.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-sales-prospecting-tools',
                title: locale === 'cn' || locale === 'tw' ? '销售榜单' : 'Sales ranking',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '先收窄到更高相关的候选。'
                    : 'Start with the most relevant candidates first.',
              },
              {
                href: '/guides/ai-tools-for-sales-comparison',
                title: locale === 'cn' || locale === 'tw' ? '销售工具对比' : 'Sales tools comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你要把候选范围再拉宽一点。'
                    : 'Useful when you want a broader shortlist.',
              },
              {
                href: '/guides/hubspot-alternatives-comparison',
                title: locale === 'cn' || locale === 'tw' ? 'HubSpot 替代对比' : 'HubSpot alternatives comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果 CRM 加营销自动化更重要。'
                    : 'Better when CRM plus marketing automation is the real need.',
              },
              {
                href: '/guides/ai-tools-for-sales-prospecting-comparison',
                title: locale === 'cn' || locale === 'tw' ? '销售拓客对比' : 'Sales prospecting comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果重点其实是外联与线索编排。'
                    : 'Useful when outbound execution and lead orchestration are the priority.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`salesforce_einstein_ranking_${item.href.split('/').pop()}`}
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
      <GuideSubmissionPath locale={locale} ctaPrefix='salesforce_einstein_alternatives_comparison' />
    </>
  );
}
