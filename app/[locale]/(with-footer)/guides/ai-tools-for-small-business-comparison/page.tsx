import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 小企业工具对比' : 'AI tools for small business comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的 AI 小企业工具，帮你更快选出适合的一个。'
      : 'Compare common AI small-business tools to choose the one that fits you best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '小企业工具', en: 'Small business tools' },
    comparisonLabel: { cn: 'AI 小企业工具对比', en: 'AI tools for small business comparison' },
    description: {
      cn: '如果你已经知道自己是在做小企业或创业团队，这一页会帮你把几款常见的小企业工具放在一起看，减少反复试错。',
      en: 'If you already know you need small-business tools, this page helps you compare a few common ones side by side and reduce trial-and-error.',
    },
    searchQuery: 'business',
    guideHref: '/guides/ai-tools-for-small-business',
    rankingHref: '/best-ai-tools/ai-small-business-tools',
    rankingLabel: { cn: '转去小企业榜单页', en: 'Open the small-business ranking' },
    backGuideLabel: { cn: '回到小企业指南', en: 'Back to small-business guide' },
    altBrowseHref: '/explore?search=business&sort=popular',
    altBrowseLabel: { cn: '浏览更多小企业工具', en: 'Browse more small-business tools' },
    breadcrumbLabel: { cn: '小企业工具对比', en: 'Small business tools comparison' },
    compareTitle: {
      cn: '几款常见小企业工具的快速对照',
      en: 'A quick side-by-side look at common small-business tools',
    },
    compareSubtitle: { cn: '小企业', en: 'small business' },
    highIntentPaths: [
      {
        href: '/best-ai-tools/ai-small-business-tools',
        title: { cn: '先看小企业榜单', en: 'Start with the small-business ranking' },
        description: {
          cn: '如果你已经确定是小企业场景，先用榜单缩小 shortlist。',
          en: 'If small-business use is clear, narrow the shortlist with the ranking first.',
        },
      },
      {
        href: '/guides/ai-tools-for-small-business',
        title: { cn: '回到小企业指南', en: 'Back to the small-business guide' },
        description: {
          cn: '如果你还想先理清营销、客服、内容和运营差异，可以回到指南页。',
          en: 'Go back if you still need to clarify marketing, support, content, and operations differences first.',
        },
      },
      {
        href: '/guides/ai-tools-for-marketing-comparison',
        title: { cn: '转去营销工具对比', en: 'Go to marketing tools comparison' },
        description: {
          cn: '如果你现在最在意获客和内容增长，这条更高意图。',
          en: 'A higher-intent path when acquisition and content growth matter most.',
        },
      },
      {
        href: '/guides/ai-tools-for-ecommerce-comparison',
        title: { cn: '转去电商工具对比', en: 'Go to ecommerce comparison' },
        description: {
          cn: '如果你的业务更偏商品、店铺和客服场景，这页更贴近。',
          en: 'Move there if the workflow is more about products, storefronts, and customer support.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/best-ai-tools/ai-small-business-tools',
        title: { cn: '先看小企业榜单页', en: 'Start with the small-business ranking' },
        description: {
          cn: '如果你想先看这一类里更稳的 shortlist，再回来细比，就先去榜单页。',
          en: 'Start with the ranking if you want the strongest shortlist before returning for a deeper comparison.',
        },
      },
      {
        href: '/guides/ai-tools-for-ecommerce-comparison',
        title: { cn: '转去电商工具对比', en: 'Switch to ecommerce comparison' },
        description: {
          cn: '如果你的业务更偏商品、店铺和客服场景，这页更贴近。',
          en: 'Go there if the workflow is more about products, storefronts, and customer support.',
        },
      },
      {
        href: '/guides/ai-tools-for-marketing-comparison',
        title: { cn: '转去营销工具对比', en: 'Switch to marketing comparison' },
        description: {
          cn: '如果当前核心问题在获客和内容增长，而不是泛运营，这页会更直接。',
          en: 'Move there if acquisition and content growth matter more than broad operations right now.',
        },
      },
    ],
    tips: {
      cn: [
        '先看你是做营销、客服、内容还是流程自动化，不同场景侧重点不一样。',
        '如果你想先试再买，优先看免费版本的限制和协作能力。',
        '更看重长期使用时，关注更新频率、评分和实际评论。',
      ],
      en: [
        'Start with your use case: marketing, support, content, or automation all need different things.',
        'If you want to try before paying, focus on free-tier limits and collaboration depth.',
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
        question: { cn: '为什么只看小企业工具？', en: 'Why only small-business tools?' },
        answer: {
          cn: '因为小企业工具通常有很明确的营销、客服和运营需求，对比意图也更清晰。',
          en: 'Because small-business tools usually map to clear marketing, support, and operations needs, which makes compare intent very clear.',
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
            ? '小企业页的比较重点不是功能最全，而是营销、客服、内容和运营这几个日常动作能不能真的接上。'
            : 'The small-business comparison should judge whether marketing, support, content, and operations actually connect in day-to-day work instead of feature breadth alone.'
        }
        decisionSteps={
          locale === 'cn' || locale === 'tw'
            ? [
                '先确认营销、客服、内容和运营这些日常动作能不能接上。',
                '再看批量、协作和预算是否适合小团队长期使用。',
                '最后回到真实经营案例和反馈，判断是不是能带来生意。',
              ]
            : [
                'First confirm whether marketing, support, content, and operations can connect in daily work.',
                'Then check batch work, collaboration, and budget fit for a small team.',
                'Finally return to real business cases and feedback to judge whether it can drive outcomes.',
              ]
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? '营销覆盖' : 'Marketing coverage',
            value: locale === 'cn' || locale === 'tw' ? '先看获客链路' : 'Start with the acquisition chain',
            note:
              locale === 'cn' || locale === 'tw'
                ? '小企业最先需要的是能带来生意的链路。'
                : 'The first need is a chain that can actually bring in business.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '客服支持' : 'Support fit',
            value:
              locale === 'cn' || locale === 'tw'
                ? '看是否能接住回复和分流'
                : 'Check whether it handles replies and routing',
            note:
              locale === 'cn' || locale === 'tw'
                ? '客户沟通不能只靠通用助手。'
                : 'Customer communication usually needs more than a generic assistant.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '运营落地' : 'Operational fit',
            value:
              locale === 'cn' || locale === 'tw' ? '看是否顺手接入日常流程' : 'See whether it plugs into daily ops',
            note:
              locale === 'cn' || locale === 'tw'
                ? '最终要落到团队每天会不会真的用。'
                : 'The real question is whether the team will actually use it every day.',
          },
        ]}
        signalCards={[
          {
            label: locale === 'cn' || locale === 'tw' ? '生意信号' : 'Business signal',
            value:
              locale === 'cn' || locale === 'tw'
                ? '先看能不能带来实际获客'
                : 'Check whether it can actually bring in customers',
            note:
              locale === 'cn' || locale === 'tw'
                ? '小企业最先看的是能否转化成生意。'
                : 'Small businesses first need signals that convert into business.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '客服信号' : 'Support signal',
            value:
              locale === 'cn' || locale === 'tw'
                ? '看回复和分流是否接得住'
                : 'See whether replies and routing are handled well',
            note:
              locale === 'cn' || locale === 'tw'
                ? '客户沟通不能只靠通用助手。'
                : 'Customer communication usually needs more than a generic assistant.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '运营信号' : 'Ops signal',
            value:
              locale === 'cn' || locale === 'tw'
                ? '看是否顺手接入日常流程'
                : 'Check whether it plugs into daily workflows',
            note:
              locale === 'cn' || locale === 'tw'
                ? '能不能每天用，才是长期价值。'
                : 'Long-term value depends on whether the team uses it every day.',
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
              ? '这页已按真实小企业决策路径重新核对，保留营销、客服和运营入口。'
              : 'This page has been rechecked against a real small-business decision path and keeps marketing, support, and operations entry points visible.'}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '当前判断' : 'Current judgment'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw'
              ? '保留索引，补真实小企业证据'
              : 'Keep it indexable and add real small-business evidence'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '用营销、客服和运营样例把它和泛效率页区分开。'
              : 'Use marketing, support, and ops examples to differentiate it from generic productivity pages.'}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '下一步' : 'Next step'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw'
              ? '补真实小企业场景和反馈'
              : 'Add real small-business scenarios and feedback'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '后续优先补案例、流程和真人评论。'
              : 'Next, prioritize cases, workflows, and real comments.'}
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
              ? '先看榜单，再决定是继续看小企业工具还是切到相邻入口'
              : 'Start with the ranking, then decide whether to keep comparing small-business tools or switch to an adjacent path'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '如果小企业场景已经确定，先收紧 shortlist 往往比继续横向浏览更多页面更有效。'
              : 'If the small-business use case is already clear, narrowing the shortlist first is usually better than continuing to browse more pages horizontally.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-small-business-tools',
                title: locale === 'cn' || locale === 'tw' ? '小企业榜单' : 'Small-business ranking',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '先收窄到更高相关的候选。'
                    : 'Start with the most relevant candidates first.',
              },
              {
                href: '/guides/ai-tools-for-small-business',
                title: locale === 'cn' || locale === 'tw' ? '小企业指南' : 'Small-business guide',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '重新确认是营销、客服还是运营。'
                    : 'Re-check whether the need is marketing, support, or operations.',
              },
              {
                href: '/guides/ai-tools-for-marketing-comparison',
                title: locale === 'cn' || locale === 'tw' ? '营销工具对比' : 'Marketing tools comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果当前核心是获客和内容增长。'
                    : 'Useful when acquisition and content growth are the real focus.',
              },
              {
                href: '/guides/ai-tools-for-ecommerce-comparison',
                title: locale === 'cn' || locale === 'tw' ? '电商工具对比' : 'Ecommerce tools comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果业务更偏商品、店铺和客服。'
                    : 'Better when the workflow is more about products, storefronts, and support.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`small_business_ranking_${item.href.split('/').pop()}`}
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
      <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_small_business_comparison' />
    </>
  );
}
