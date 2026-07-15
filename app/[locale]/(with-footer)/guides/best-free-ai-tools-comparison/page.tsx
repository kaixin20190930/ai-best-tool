import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? '最佳免费 AI 工具对比' : 'Best free AI tools comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的免费 AI 工具，帮你更快找出真正值得长期试用的选项。'
      : 'Compare common free AI tools to find the ones worth keeping in your workflow longer.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '免费 AI 工具', en: 'Free AI tools' },
    comparisonLabel: { cn: '最佳免费 AI 工具对比', en: 'Best free AI tools comparison' },
    description: {
      cn: '如果你正在找可以长期试用的免费 AI 工具，这一页会帮你把常见候选放在一起看。',
      en: 'If you are looking for free AI tools you can actually keep using, this page helps you compare the common candidates side by side.',
    },
    searchQuery: 'free',
    guideHref: '/guides/best-free-ai-tools',
    rankingHref: '/guides/best-free-ai-tools',
    rankingLabel: { cn: '回到免费榜单', en: 'Back to the free ranking' },
    backGuideLabel: { cn: '回到免费指南', en: 'Back to the free tools guide' },
    altBrowseHref: '/explore?pricing=free&sort=popular',
    altBrowseLabel: { cn: '浏览更多免费工具', en: 'Browse more free tools' },
    breadcrumbLabel: { cn: '最佳免费 AI 工具对比', en: 'Best free AI tools comparison' },
    compareTitle: { cn: '免费 AI 工具的快速对照', en: 'A quick side-by-side look at free AI tools' },
    compareSubtitle: { cn: '免费工具', en: 'Free tools' },
    preferredToolNames: ['chatgpt', 'gemini', 'claude', 'perplexity', 'poe', 'copilot'],
    highIntentPaths: [
      {
        href: '/guides/best-free-ai-tools',
        title: { cn: '回到免费工具指南', en: 'Back to the free tools guide' },
        description: {
          cn: '如果你还要先理清要看哪些免费能力，可以回到指南页。',
          en: 'Go back if you still need to clarify which free capabilities matter most.',
        },
      },
      {
        href: '/guides/ai-writing-tools-comparison',
        title: { cn: '转去写作工具对比', en: 'Go to writing tools comparison' },
        description: {
          cn: '如果你其实最在意写作和改写能力，这页更高意图。',
          en: 'A higher-intent path when writing and rewriting are the real priorities.',
        },
      },
      {
        href: '/guides/ai-productivity-tools-comparison',
        title: { cn: '转去生产力工具对比', en: 'Go to productivity tools comparison' },
        description: {
          cn: '如果你想把免费工具放进日常工作流，这页更贴近。',
          en: 'Move there if you want free tools that fit into daily productivity workflows.',
        },
      },
      {
        href: '/explore?pricing=free&sort=popular',
        title: { cn: '继续看更多免费候选', en: 'See more free candidates' },
        description: {
          cn: '当你只想扩大免费 shortlist 时，直接回 Explore 最快。',
          en: 'The fastest next step when you only need a wider free shortlist.',
        },
      },
    ],
    decisionCards: [
      {
        title: { cn: '先看是否真免费', en: 'Check if it is truly free' },
        description: {
          cn: '别只看“能注册”，要看免费额度够不够你做完一轮完整工作。',
          en: 'Do not stop at sign-up; check whether the free tier is enough to complete a real workflow.',
        },
      },
      {
        title: { cn: '再看限制和更新', en: 'Then check limits and freshness' },
        description: {
          cn: '免费工具常常变化快，所以更新频率和限制说明特别重要。',
          en: 'Free tools change quickly, so freshness and limit clarity matter a lot.',
        },
      },
      {
        title: { cn: '最后看是否值得留下', en: 'Decide whether to keep it' },
        description: {
          cn: '如果它不能稳定解决你的场景，就把它放回候选池，不必长期占位。',
          en: 'If it cannot reliably solve the job, put it back in the shortlist rather than keeping it forever.',
        },
      },
    ],
    fitFor: [
      {
        title: { cn: '想先试再付费的人', en: 'People who want to try first' },
        description: {
          cn: '适合先用免费层验证自己的工作流。',
          en: 'A good fit when you want to validate the workflow on a free tier first.',
        },
      },
      {
        title: { cn: '还没决定方向的人', en: 'People still narrowing the use case' },
        description: {
          cn: '适合先粗筛，再进入更窄的比较页。',
          en: 'Useful for broad filtering before moving into narrower comparison pages.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '明确需要商业版的人', en: 'People who already need paid features' },
        description: {
          cn: '如果你知道自己会马上碰到额度或协作限制，直接看付费方案更高效。',
          en: 'If you already know limits or collaboration will matter immediately, compare paid tiers instead.',
        },
      },
      {
        title: { cn: '只想看一个品牌的人', en: 'People who only want one brand' },
        description: {
          cn: '这页的作用是横向比较，不是替你直接做单选。',
          en: 'This page is meant for side-by-side comparison, not a one-brand recommendation.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/guides/free-ai-tools',
        title: { cn: '回到免费工具指南', en: 'Back to the free tools guide' },
        description: {
          cn: '先把判断标准再过一遍，再决定要不要继续试。',
          en: 'Revisit the judging criteria before deciding what to try next.',
        },
      },
      {
        href: '/explore?pricing=free&sort=popular',
        title: { cn: '浏览免费工具', en: 'Browse free tools' },
        description: {
          cn: '继续扩大免费候选列表。',
          en: 'Keep expanding the free shortlist.',
        },
      },
      {
        href: '/guides/best-free-ai-tools',
        title: { cn: '回到免费榜单', en: 'Back to the free ranking' },
        description: {
          cn: '再看一次榜单顺序和高意图条目。',
          en: 'Review the ranking order and top candidates again.',
        },
      },
    ],
    tips: {
      cn: [
        '先看免费层能不能支撑你的一次完整任务。',
        '把免费额度、更新频率和导出能力放在前面看。',
        '如果同类工具很多，先选更新更近、评价更稳的。',
      ],
      en: [
        'First check whether the free tier can support a complete task.',
        'Put limits, freshness, and export options near the top of your checklist.',
        'If there are many similar tools, start with the ones that are fresher and better reviewed.',
      ],
    },
    faqs: [
      {
        question: { cn: '免费工具对比最重要什么？', en: 'What matters most in free tool comparison?' },
        answer: {
          cn: '最重要的是免费层是否真的能完成你的工作，而不是只能打开首页。',
          en: 'The key question is whether the free tier can actually complete your job, not just open the homepage.',
        },
      },
      {
        question: { cn: '为什么这页还要看更新和评论？', en: 'Why include freshness and comments?' },
        answer: {
          cn: '因为免费产品变化很快，更新和评论能帮助你判断它是不是还值得继续试。',
          en: 'Free products change quickly, and freshness plus real comments help you decide whether to keep trying them.',
        },
      },
    ],
  });

  return (
    <>
      {ComparisonPage({ ...data, locale })}
      <GuideEvidencePanel
        locale={locale}
        checkedAt='2026-07-15'
        scope={
          locale === 'cn' || locale === 'tw'
            ? '免费工具对比页现在把重点放在“免费可用性和持续可用性”。'
            : 'This free-tools comparison page now focuses on free usability and whether it stays useful over time.'
        }
        decisionSteps={
          locale === 'cn' || locale === 'tw'
            ? ['先看是不是真的能免费用', '再看限制和可持续性', '最后才决定是否继续对比']
            : [
                'Check whether it is truly free to use',
                'Then review limitations and durability',
                'Only then decide whether to keep comparing',
              ]
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? '免费边界' : 'Free tier',
            value: locale === 'cn' || locale === 'tw' ? '能用多久' : 'How long it stays usable',
            note:
              locale === 'cn' || locale === 'tw'
                ? '免费页最容易失真的地方就是“看上去免费，实际很快卡住”。'
                : 'Free pages often fail by looking free while hitting a wall very quickly.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '可持续性' : 'Sustainability',
            value: locale === 'cn' || locale === 'tw' ? '持续可用' : 'Still usable later',
            note:
              locale === 'cn' || locale === 'tw'
                ? '如果只能短期试用，价值会和宣传差很多。'
                : 'If it only works for a short trial, the value is very different from the marketing.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '下一步' : 'Next step',
            value: locale === 'cn' || locale === 'tw' ? '先 shortlist 再官网' : 'Shortlist before the official site',
            note:
              locale === 'cn' || locale === 'tw'
                ? '先收紧候选，再去验证免费规则和限制。'
                : 'Narrow the shortlist first, then validate the actual free rules and limits.',
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
              ? '先把免费入口收紧，再决定要不要继续横向试用'
              : 'Tighten the free-entry path first, then decide whether to keep trying more tools horizontally'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '如果你就是想找能长期试用的免费工具，先从更高意图入口收口通常更快。'
              : 'If you are looking for free tools you can actually keep using, starting with higher-intent entry points is usually faster.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/guides/best-free-ai-tools',
                title: locale === 'cn' || locale === 'tw' ? '免费工具指南' : 'Free tools guide',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '先确认免费层的判断标准。'
                    : 'First confirm the criteria for judging the free tier.',
              },
              {
                href: '/best-ai-tools/ai-research-tools',
                title: locale === 'cn' || locale === 'tw' ? '研究榜单' : 'Research ranking',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你更关心研究与资料发现。'
                    : 'Useful when research and discovery are the real need.',
              },
              {
                href: '/guides/ai-writing-tools-comparison',
                title: locale === 'cn' || locale === 'tw' ? '写作工具对比' : 'Writing tools comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你更在意输出和改写能力。'
                    : 'Best when output and rewriting are the main priorities.',
              },
              {
                href: '/guides/ai-productivity-tools-comparison',
                title: locale === 'cn' || locale === 'tw' ? '生产力工具对比' : 'Productivity tools comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你要把免费工具放进日常工作流。'
                    : 'Use this when free tools need to fit into daily workflows.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`free_tools_ranking_${item.href.split('/').pop()}`}
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
      <section className='mt-6 grid gap-4 rounded-[18px] border border-cyan-200 bg-cyan-50/70 p-6 shadow-sm md:grid-cols-3'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '最近验证' : 'Last checked'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>2026-07-15</p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '这页已按当前比较页的判断标准重新核对。'
              : 'This page has been rechecked against the current comparison-page decision flow.'}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '当前判断' : 'Current judgment'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw' ? '保留索引，补真实证据' : 'Keep it indexable and add real evidence'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '用评论、案例和 owner 认领把它和泛工具页区分开。'
              : 'Use comments, cases, and owner claims to distinguish it from generic tool pages.'}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '下一步' : 'Next step'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw' ? '补真实用例和反馈' : 'Add real use cases and feedback'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '后续优先补案例、反馈和认领信息。'
              : 'Next, prioritize cases, feedback, and claim information.'}
          </p>
        </div>
      </section>
      <GuideSubmissionPath locale={locale} ctaPrefix='best_free_ai_tools_comparison' />
    </>
  );
}
