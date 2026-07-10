import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI Evals 工具对比' : 'AI tools for evals comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的 evals 工具，帮你更快选出适合输出质量验证、评分体系和验收流程的一款。'
      : 'Compare common evals tools to choose the one that fits output validation, scoring systems, and acceptance workflows best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: 'Evals 工具', en: 'Evals tools' },
    comparisonLabel: { cn: 'AI Evals 工具对比', en: 'AI tools for evals comparison' },
    description: {
      cn: '如果你已经知道自己要解决输出质量验证、评分逻辑、验收标准和版本对比，这一页会帮你把常见候选放在一起看。',
      en: 'If you already know you need output validation, scoring logic, acceptance standards, and version comparison, this page helps you compare common options side by side.',
    },
    searchQuery: 'eval',
    guideHref: '/guides/ai-tools-for-evals',
    rankingHref: '/best-ai-tools/ai-evals-tools',
    rankingLabel: { cn: '转去 Evals 榜单页', en: 'Open the evals ranking' },
    backGuideLabel: { cn: '回到 Evals 指南', en: 'Back to evals guide' },
    altBrowseHref: '/explore?search=eval&sort=popular',
    altBrowseLabel: { cn: '浏览更多 evals 工具', en: 'Browse more evals tools' },
    breadcrumbLabel: { cn: 'Evals 工具对比', en: 'Evals tools comparison' },
    compareTitle: {
      cn: '几款常见 evals 工具的快速对照',
      en: 'A quick side-by-side look at common evals tools',
    },
    compareSubtitle: { cn: 'Evals', en: 'Evals' },
    preferredToolNames: ['langfuse', 'langsmith', 'helicone', 'portkey'],
    decisionCards: [
      {
        title: { cn: '看评分逻辑', en: 'Scoring logic' },
        description: {
          cn: '优先看它是否支持你真正需要的质量判断方式，而不是只有表面指标。',
          en: 'Prioritize whether it supports the quality judgments you actually need instead of only shallow metrics.',
        },
      },
      {
        title: { cn: '看数据集与样本管理', en: 'Dataset and sample management' },
        description: {
          cn: '更该看样本、结果和规则能不能放在一起稳定复盘。',
          en: 'Focus more on whether samples, outputs, and rules can be reviewed together in a stable way.',
        },
      },
      {
        title: { cn: '看验收流程贴合度', en: 'Acceptance workflow fit' },
        description: {
          cn: '如果会进入团队流程，就要看分享、签收和回归检查是否顺手。',
          en: 'If the tool feeds team process, judge whether sharing, signoff, and regression checks feel natural.',
        },
      },
    ],
    fitFor: [
      {
        title: { cn: '需要稳定验收 AI 输出的团队', en: 'Teams needing stable acceptance for AI output' },
        description: {
          cn: '适合已经把 AI 功能放进产品里，希望上线更稳的团队。',
          en: 'Best for teams that already ship AI features and want a steadier release process.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '只想看 prompt 单次结果的人', en: 'People only checking one-off prompt outputs' },
        description: {
          cn: '如果重点只是临时对比几个 prompt，这类对比会显得更重。',
          en: 'If the job is only to compare a few prompts casually, this comparison may feel heavier than needed.',
        },
      },
    ],
    highIntentPaths: [
      {
        href: '/best-ai-tools/ai-evals-tools',
        title: { cn: '先看 Evals 榜单', en: 'Start with the evals ranking' },
        description: {
          cn: '如果 evals 已经是明确目标，先用榜单缩小 shortlist。',
          en: 'If evals are clearly the goal, narrow the shortlist with the ranking first.',
        },
      },
      {
        href: '/guides/ai-tools-for-evals',
        title: { cn: '回到 Evals 指南', en: 'Back to the evals guide' },
        description: {
          cn: '如果你还想先理清评分逻辑、数据集和验收流程，可以回到指南页。',
          en: 'Go back if you still need to clarify scoring logic, datasets, and acceptance workflows first.',
        },
      },
      {
        href: '/guides/ai-tools-for-prompt-testing-comparison',
        title: { cn: '转去 Prompt 测试对比', en: 'Go to prompt testing comparison' },
        description: {
          cn: '如果你现在更关心 prompt 版本和 A/B 比较，这页更高意图。',
          en: 'A higher-intent path when prompt versions and A/B comparisons become the real focus.',
        },
      },
      {
        href: '/guides/ai-tools-for-api-observability-comparison',
        title: { cn: '转去 API 可观测对比', en: 'Go to API observability comparison' },
        description: {
          cn: '如果你更关心上线后的请求与质量观察，这页更贴近。',
          en: 'Move there if post-deploy request and quality visibility are the real priority.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/best-ai-tools/ai-evals-tools',
        title: { cn: '先看 Evals 榜单页', en: 'Start with the evals ranking' },
        description: {
          cn: '如果你想先确认值得进 shortlist 的候选，再回来细比评分逻辑，就先走榜单页。',
          en: 'Start with the ranking if you want the most likely shortlist candidates before comparing scoring logic in detail.',
        },
      },
      {
        href: '/guides/ai-tools-for-prompt-testing-comparison',
        title: { cn: '转去 Prompt 测试工具对比', en: 'Switch to prompt testing comparison' },
        description: {
          cn: '如果你发现真正决策点更偏提示词版本和 A/B 对比，这页更合适。',
          en: 'Move there if the real decision is shifting toward prompt versions and A/B comparisons.',
        },
      },
      {
        href: '/guides/ai-tools-for-api-observability-comparison',
        title: { cn: '转去 API 可观测工具对比', en: 'Switch to API observability comparison' },
        description: {
          cn: '如果你更关心上线后请求与质量观察，这页更贴近目标。',
          en: 'More useful if the real job is post-deploy requests and quality visibility.',
        },
      },
      {
        href: '/explore?search=eval&sort=popular',
        title: { cn: '继续看更多 evals 候选', en: 'See more evals candidates' },
        description: {
          cn: '当你只需要扩大 shortlist 时，直接回 Explore 最快。',
          en: 'The fastest next step once you only need a wider shortlist.',
        },
      },
    ],
    tips: {
      cn: [
        '先看评分逻辑，再看样本和数据集管理。',
        '如果会进入团队流程，重点看分享、签收和回归检查。',
        '比“能不能跑分”更重要的是能不能让发布判断更稳。',
      ],
      en: [
        'Start with scoring logic, then move to sample and dataset management.',
        'If the tool feeds team process, focus on sharing, signoff, and regression checks.',
        'More important than generating a score is whether release decisions become steadier.',
      ],
    },
    faqs: [
      {
        question: { cn: '你们比较的依据是什么？', en: 'What do you compare?' },
        answer: {
          cn: '我们主要看评分逻辑、数据集支持、结果复盘、验收流程和团队协作。',
          en: 'We compare scoring logic, dataset support, result review, acceptance workflows, and team collaboration.',
        },
      },
      {
        question: { cn: '为什么单独做 evals 对比？', en: 'Why compare evals tools separately?' },
        answer: {
          cn: '因为这类决策重点通常不是“能不能调模型”，而是能不能稳定判断输出质量与上线风险。',
          en: 'Because the decision is usually less about model access and more about whether output quality and release risk can be judged reliably.',
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
            ? '先确认输出质量验证和验收流程的真实覆盖，再继续看对比。'
            : 'Check whether output validation and acceptance workflows are covered in practice before continuing.'
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? '评分逻辑' : 'Scoring logic',
            value: locale === 'cn' || locale === 'tw' ? '质量判断方式' : 'Quality judgment method',
            note:
              locale === 'cn' || locale === 'tw'
                ? '不是只看跑不跑得起来。'
                : 'This is not only about whether it runs.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '流程贴合' : 'Workflow fit',
            value: locale === 'cn' || locale === 'tw' ? '样本、结果、规则' : 'Samples, outputs, rules',
            note:
              locale === 'cn' || locale === 'tw'
                ? '把复盘和验收连起来。'
                : 'Connect review and signoff in one flow.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '真实增量' : 'Real increments',
            value: locale === 'cn' || locale === 'tw' ? '评论、场景、案例' : 'Comments, context, cases',
            note:
              locale === 'cn' || locale === 'tw'
                ? '补足 AI 内容的可信度。'
                : 'Use them to strengthen page credibility.',
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
              ? '先看榜单，再决定是继续做 evals 还是切到相邻入口'
              : 'Start with the ranking, then decide whether to keep working on evals or switch to an adjacent path'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '如果你已经明确要做输出质量验证和上线前判断，先收紧 shortlist 往往比继续横向浏览更有效。'
              : 'If output validation and pre-release judgment are already the goal, narrowing the shortlist first is usually better than continuing to browse horizontally.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-evals-tools',
                title: locale === 'cn' || locale === 'tw' ? 'Evals 榜单' : 'Evals ranking',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '先收窄到更值得细看的候选。'
                    : 'Narrow to the candidates most worth reviewing first.',
              },
              {
                href: '/guides/ai-tools-for-prompt-testing-comparison',
                title: locale === 'cn' || locale === 'tw' ? 'Prompt 测试对比' : 'Prompt testing comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你更关注 prompt 版本和 A/B 对比。'
                    : 'Useful when the real decision is prompt versions and A/B comparisons.',
              },
              {
                href: '/guides/ai-tools-for-api-observability-comparison',
                title: locale === 'cn' || locale === 'tw' ? 'API 可观测对比' : 'API observability comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你更关心上线后的请求与质量观察。'
                    : 'Useful when post-deploy request and quality visibility matter more.',
              },
              {
                href: '/guides/ai-tools-for-agents-comparison',
                title: locale === 'cn' || locale === 'tw' ? 'Agent 工具对比' : 'Agent tools comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '当验证不只是分数，而是多步骤工作流。'
                    : 'A better path when validation expands from scores into multi-step workflows.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`evals_ranking_${item.href.split('/').pop()}`}
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
      <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_evals_comparison' />
    </>
  );
}
