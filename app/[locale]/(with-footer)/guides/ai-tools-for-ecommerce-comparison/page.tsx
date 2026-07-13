import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 电商工具对比' : 'AI ecommerce tools comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的 AI 电商工具，帮你更快选出适合的一个。'
      : 'Compare common AI ecommerce tools to choose the one that fits you best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '电商工具', en: 'Ecommerce tools' },
    comparisonLabel: { cn: 'AI 电商工具对比', en: 'AI ecommerce tools comparison' },
    description: {
      cn: '如果你已经知道自己是在做电商或商品营销，这一页会帮你把几款常见的电商工具放在一起看，减少反复试错。',
      en: 'If you already know you need ecommerce tools, this page helps you compare a few common ones side by side and reduce trial-and-error.',
    },
    searchQuery: 'ecommerce',
    guideHref: '/guides/ai-tools-for-ecommerce',
    rankingHref: '/best-ai-tools/ai-ecommerce-tools',
    rankingLabel: { cn: '转去电商榜单页', en: 'Open the ecommerce ranking' },
    backGuideLabel: { cn: '回到电商指南', en: 'Back to ecommerce guide' },
    altBrowseHref: '/explore?search=ecommerce&sort=popular',
    altBrowseLabel: { cn: '浏览更多电商工具', en: 'Browse more ecommerce tools' },
    breadcrumbLabel: { cn: '电商工具对比', en: 'Ecommerce tools comparison' },
    compareTitle: { cn: '几款常见电商工具的快速对照', en: 'A quick side-by-side look at common ecommerce tools' },
    compareSubtitle: { cn: '电商', en: 'ecommerce' },
    highIntentPaths: [
      {
        href: '/best-ai-tools/ai-ecommerce-tools',
        title: { cn: '先看电商榜单', en: 'Start with the ecommerce ranking' },
        description: {
          cn: '如果电商已经是明确目标，先用榜单缩小 shortlist。',
          en: 'If ecommerce is clearly the goal, narrow the shortlist with the ranking first.',
        },
      },
      {
        href: '/guides/ai-tools-for-ecommerce',
        title: { cn: '回到电商指南', en: 'Back to the ecommerce guide' },
        description: {
          cn: '如果你还想先理清商品、营销和客服差异，可以回到指南页。',
          en: 'Go back if you still need to clarify products, marketing, and support differences first.',
        },
      },
      {
        href: '/guides/ai-tools-for-small-business-comparison',
        title: { cn: '转去小企业工具对比', en: 'Go to small-business comparison' },
        description: {
          cn: '如果你的视角更偏整体经营而不是纯电商，这页更自然。',
          en: 'Move there if the decision is broader business operations rather than pure ecommerce.',
        },
      },
      {
        href: '/guides/ai-tools-for-marketing-comparison',
        title: { cn: '转去营销工具对比', en: 'Go to marketing tools comparison' },
        description: {
          cn: '如果你现在最在意流量获取和广告内容，这页更贴近。',
          en: 'A better fit when acquisition and campaign content are the real priorities.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/best-ai-tools/ai-ecommerce-tools',
        title: { cn: '先看电商榜单页', en: 'Start with the ecommerce ranking' },
        description: {
          cn: '如果你想先把 shortlist 收紧，再回来比商品、营销和客服能力，就先去榜单页。',
          en: 'Open the ranking first if you want a tighter shortlist before comparing product, marketing, and support workflows.',
        },
      },
      {
        href: '/guides/ai-tools-for-marketing-comparison',
        title: { cn: '转去营销工具对比', en: 'Switch to marketing comparison' },
        description: {
          cn: '如果你现在更偏流量获取和广告内容，而不是店铺执行，这页更贴近。',
          en: 'Go there if the bottleneck is more about acquisition and campaign content than store execution.',
        },
      },
      {
        href: '/guides/ai-tools-for-small-business-comparison',
        title: { cn: '转去小企业工具对比', en: 'Switch to small-business comparison' },
        description: {
          cn: '如果你是更广义的经营视角，而不是纯电商，这页会更自然。',
          en: 'Move there if the decision is broader business operations rather than pure ecommerce.',
        },
      },
    ],
    tips: {
      cn: [
        '先看你要处理的是商品、客服、营销还是运营，不同场景侧重点不一样。',
        '如果你想先试再买，优先看免费版本的限制和批量能力。',
        '更看重长期使用时，关注更新频率、评分和实际评论。',
      ],
      en: [
        'Start with your use case: products, support, marketing, or operations all need different things.',
        'If you want to try before paying, focus on free-tier limits and batch capabilities.',
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
        question: { cn: '为什么只看电商工具？', en: 'Why only ecommerce tools?' },
        answer: {
          cn: '因为电商工具通常有很明确的商品、客服和营销需求，对比意图也更清晰。',
          en: 'Because ecommerce tools usually map to clear product, support, and marketing needs, which makes compare intent very clear.',
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
            ? '先确认电商、商品和营销工作流的真实覆盖，再继续看对比。'
            : 'Check whether ecommerce, product, and marketing workflows are actually covered before continuing the comparison.'
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? '工作流连贯性' : 'Workflow continuity',
            value: locale === 'cn' || locale === 'tw' ? '商品、客服、营销' : 'Products, support, marketing',
            note:
              locale === 'cn' || locale === 'tw' ? '别让关键流程断开。' : 'Do not let the core workflow break apart.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '长期使用' : 'Long-term use',
            value: locale === 'cn' || locale === 'tw' ? '更新频率、评分、评论' : 'Freshness, ratings, comments',
            note: locale === 'cn' || locale === 'tw' ? '比标题更重要。' : 'More important than labels.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '真实增量' : 'Real increments',
            value: locale === 'cn' || locale === 'tw' ? '场景、案例、owner 认领' : 'Cases, use cases, owner claims',
            note:
              locale === 'cn' || locale === 'tw'
                ? '把 AI 页面补成更可信的实体信号。'
                : 'Add entity-level signals to make the page more credible.',
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
              ? '这页已按真实电商路径重新核对，保留商品、客服和营销入口。'
              : 'This page has been rechecked against a real ecommerce workflow and keeps product, support, and marketing entry points visible.'}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '当前判断' : 'Current judgment'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw'
              ? '保留索引，补真实电商证据'
              : 'Keep it indexable and add real ecommerce evidence'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '用商品、客服和营销信号把它和泛工具页区分开。'
              : 'Use product, support, and marketing signals to differentiate it from generic tool pages.'}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '下一步' : 'Next step'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw' ? '补真实电商场景和反馈' : 'Add real ecommerce scenarios and feedback'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '后续优先补案例、商品样例和真人评论。'
              : 'Next, prioritize cases, product examples, and real comments.'}
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
              ? '先看榜单，再决定是继续看电商工具还是切到相邻入口'
              : 'Start with the ranking, then decide whether to keep comparing ecommerce tools or switch to an adjacent path'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '如果电商已经是明确目标，先收紧 shortlist 往往比继续横向浏览更多页面更有效。'
              : 'If ecommerce is already the goal, narrowing the shortlist first is usually better than continuing to browse more pages horizontally.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-ecommerce-tools',
                title: locale === 'cn' || locale === 'tw' ? '电商工具榜单' : 'Ecommerce tools ranking',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '先看更高意图候选。'
                    : 'Start with the highest-intent candidates first.',
              },
              {
                href: '/guides/ai-tools-for-ecommerce',
                title: locale === 'cn' || locale === 'tw' ? '电商指南' : 'Ecommerce guide',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '重新确认商品、客服还是营销。'
                    : 'Re-check whether the need is products, support, or marketing.',
              },
              {
                href: '/guides/ai-tools-for-marketing-comparison',
                title: locale === 'cn' || locale === 'tw' ? '营销工具对比' : 'Marketing tools comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '当你的重点转向流量和广告内容。'
                    : 'Useful when acquisition and campaign content are the main priorities.',
              },
              {
                href: '/guides/ai-tools-for-small-business-comparison',
                title: locale === 'cn' || locale === 'tw' ? '小企业工具对比' : 'Small-business comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你更看整体经营而非纯电商。'
                    : 'Better when the decision is broader business operations rather than pure ecommerce.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`ecommerce_ranking_${item.href.split('/').pop()}`}
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
      <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_ecommerce_comparison' />
    </>
  );
}
