import { Metadata } from 'next';
import { Activity, ExternalLink, Layers3, ScrollText } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';
import { getAllCategories, getLocalizedField } from '@/lib/services/categories';
import GuideActionSection from '@/components/guides/GuideActionSection';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';
import { StructuredDataServer } from '@/components/seo/StructuredData';
import { Link } from '@/app/navigation';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Metadata.home' });

  return {
    title:
      locale === 'cn' || locale === 'tw'
        ? 'AI API 可观测工具推荐 | AI Best Tool'
        : `AI tools for API observability | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '面向日志、调用监控、成本分析和质量追踪的 AI 工具选型指南。'
        : 'A practical guide to AI tools for logs, request monitoring, cost analysis, and quality tracking.',
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const categories = await getAllCategories(true).catch(() => []);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${siteUrl}/${locale}` },
    { name: isChinese ? '指南' : 'Guides', url: `${siteUrl}/${locale}/guides` },
    {
      name: isChinese ? 'API 可观测工具' : 'API observability tools',
      url: `${siteUrl}/${locale}/guides/ai-tools-for-api-observability`,
    },
  ]);
  const faqs = [
    {
      question: isChinese ? 'API 可观测工具最适合做什么？' : 'What are API observability tools best for?',
      answer: isChinese
        ? '适合看请求日志、延迟、失败率、成本分布、提示词质量和模型表现。'
        : 'They are best for request logs, latency, error rates, cost distribution, prompt quality, and model performance tracking.',
    },
    {
      question: isChinese ? '我应该先看什么？' : 'What should I check first?',
      answer: isChinese
        ? '先看日志可读性、调用追踪、成本视图，以及是否能接进你现有 API 层和团队流程。'
        : 'Start with log readability, request tracing, cost visibility, and how well the tool fits your API layer and team workflow.',
    },
    {
      question: isChinese ? '免费版够用吗？' : 'Is a free tier enough?',
      answer: isChinese
        ? '轻量试用通常够用，但生产日志保留、团队权限和更深的分析能力通常会更快碰到限制。'
        : 'Free tiers are usually enough for light trials, but production retention, team permissions, and deeper analysis hit limits faster.',
    },
    {
      question: isChinese ? '它和普通监控工具有什么区别？' : 'How is this different from normal monitoring tools?',
      answer: isChinese
        ? '重点不只是系统性能，而是请求级别的模型调用、成本、提示词质量和输出表现。'
        : 'The emphasis is not only system health, but request-level model calls, cost, prompt quality, and output behavior.',
    },
  ];
  const tips = isChinese
    ? [
      '先分清你更关心的是日志、成本、质量，还是提示词与模型表现。',
      '看它是否能方便地接进现有 API、网关和生产环境。',
      '如果是团队使用，优先看权限、追踪、保留周期和告警能力。',
    ]
    : [
      'Separate whether logs, cost, quality, or prompt and model behavior matter most.',
      'Check how easily it fits your API, gateway, and production environment.',
      'For team use, prioritize permissions, tracing, retention, and alerting.',
    ];

  return (
    <>
      <StructuredDataServer data={breadcrumbSchema} />
      <StructuredDataServer data={generateFAQSchema(faqs)} />
      <div className='theme-page mx-auto max-w-6xl px-4 py-8 lg:px-6 lg:py-12'>
        <section className='rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm lg:p-10'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700'>
              <Layers3 className='size-4' />
              {isChinese ? 'API 可观测工具推荐' : 'API observability tools'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <Activity className='size-4' />
              {isChinese ? '日志与成本优先' : 'Logs and cost first'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese
              ? 'AI API 可观测工具推荐：从日志到成本追踪，怎么选更合适'
              : 'AI tools for API observability: how to choose for logs and cost tracking'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? 'API 可观测工具真正的价值，不是“图多”，而是能不能帮你看清调用、成本、错误和质量，支撑生产决策。'
              : 'The real value of API observability tools is not more charts, but clearer visibility into requests, cost, errors, and quality for production decisions.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href='/explore?search=observability&sort=popular'
              ctaId='api_observability_guide_browse_tools'
              ctaLabel='API observability guide browse tools'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看可观测工具' : 'Browse observability tools'}
              <ExternalLink className='size-4' />
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-tools-for-developers'
              ctaId='api_observability_guide_developers'
              ctaLabel='API observability guide developers'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '回到开发者指南' : 'Back to developer guide'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-tools-for-api-observability-comparison'
              ctaId='api_observability_guide_comparison'
              ctaLabel='API observability guide comparison'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看 API 可观测对比页' : 'API observability comparison'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/best-ai-tools/ai-api-observability-tools'
              ctaId='api_observability_guide_top_list'
              ctaLabel='API observability guide top list'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
            >
              {isChinese ? '看可观测榜单' : 'Open observability ranking'}
            </TrackableCtaLink>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '判断顺序' : 'How to judge'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '先看日志和追踪，再看成本分析' : 'Start with logs and tracing, then cost visibility'}
            </h2>
            <div className='mt-4 space-y-3'>
              {tips.map((tip) => (
                <div key={tip} className='rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700'>
                  <div className='flex items-start gap-3'>
                    <ScrollText className='mt-0.5 size-4 shrink-0 text-emerald-600' />
                    <span>{tip}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className='rounded-[18px] border border-slate-200 bg-slate-50 p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '相关分类' : 'Start here'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? 'API 可观测工具通常在这些分类里' : 'API observability tools often sit in these categories'}
            </h2>
            <div className='mt-4 grid gap-2'>
              {categories
                .filter((category) => ['developer-tools', 'automation', 'research'].includes(String(category.slug)))
                .slice(0, 6)
                .map((category) => (
                  <Link
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    className='flex items-center justify-between rounded-lg border border-white bg-white px-4 py-3 text-sm text-slate-700 shadow-sm hover:bg-slate-100'
                  >
                    <span>{getLocalizedField(category.name, locale)}</span>
                    <span className='text-xs text-slate-500'>
                      {'toolCount' in category && typeof category.toolCount === 'number' ? category.toolCount : ''}
                    </span>
                  </Link>
                ))}
            </div>
          </aside>
        </section>

        <GuideActionSection
          locale={locale}
          eyebrow={isChinese ? '先看这些工具' : 'Recommended tools'}
          title={
            isChinese ? '更贴近生产日志与质量追踪的入口' : 'Real entry points for production logs and quality tracking'
          }
          description={
            isChinese
              ? '如果你最关心请求日志、成本、质量和问题排查，这些工具会比泛开发者页更快进入真实选型。'
              : 'If request logs, cost, quality, and debugging matter most, these tools get you to the real decision faster than a broad developer page.'
          }
          toolNames={['langfuse', 'helicone', 'portkey', 'langsmith']}
          compareEyebrow={isChinese ? '继续比较' : 'Compare next'}
          compareTitle={isChinese ? '可观测意图更强的下一步入口' : 'Next paths for stronger observability intent'}
          compareDescription={
            isChinese
              ? '当你已经知道自己在找日志、追踪和成本分析，而不是单纯模型接入，继续进入更窄的比较页会更有效。'
              : 'Once the real need is logs, tracing, and cost analysis rather than pure model access, narrower comparison pages work better.'
          }
          compareLinks={[
            {
              href: '/guides/ai-tools-for-api-observability-comparison',
              title: isChinese ? 'API 可观测工具对比' : 'API observability comparison',
              description: isChinese
                ? '适合直接横向看日志、成本和质量追踪能力。'
                : 'A direct side-by-side path for logs, cost, and quality tracking.',
            },
            {
              href: '/best-ai-tools/ai-api-observability-tools',
              title: isChinese ? 'API 可观测榜单' : 'Observability ranking',
              description: isChinese
                ? '适合已经确认方向、只想快速缩小 shortlist 的用户。'
                : 'Useful when the direction is clear and the goal is to narrow the shortlist faster.',
            },
            {
              href: '/guides/ai-tools-for-model-routing-comparison',
              title: isChinese ? '模型路由工具对比' : 'Model routing comparison',
              description: isChinese
                ? '如果你也在看统一出口和回退策略，这页更相关。'
                : 'More useful when unified access and fallback strategy are also in scope.',
            },
            {
              href: '/guides/ai-tools-for-developers-comparison',
              title: isChinese ? '开发者工具总对比' : 'Developer tools comparison',
              description: isChinese
                ? '适合还没完全确定自己在选可观测还是更广的开发工具。'
                : 'Good when you are not yet fully narrowed into observability versus broader developer tooling.',
            },
          ]}
        />

        <section className='mt-8 rounded-[18px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '高意图榜单' : 'High-intent ranking'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese ? '先用榜单缩小可观测 shortlist' : 'Use the ranking to narrow your observability shortlist first'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经知道自己要比的是日志、追踪和成本治理，榜单页会比泛目录更快进入决策。'
              : 'If the decision is already about logs, tracing, and cost governance, the ranking page gets to a decision faster than a broad directory.'}
          </p>
          <div className='mt-5 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href='/best-ai-tools/ai-api-observability-tools'
              ctaId='api_observability_guide_ranking_primary'
              ctaLabel='API observability guide ranking primary'
              pageType='guide'
              className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '进入可观测榜单' : 'Open observability ranking'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-tools-for-api-observability-comparison'
              ctaId='api_observability_guide_ranking_secondary'
              ctaLabel='API observability guide ranking secondary'
              pageType='guide'
              className='inline-flex items-center justify-center rounded-lg border border-cyan-200 bg-white px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-50'
            >
              {isChinese ? '继续看对比页' : 'Continue to comparison'}
            </TrackableCtaLink>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_1fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '可观测工具看什么' : 'What matters for observability tools'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '能不能稳定看清请求、成本和质量' : 'Can it clearly expose requests, cost, and quality?'}
            </h2>
            <div className='mt-4 space-y-3 text-sm leading-6 text-slate-700'>
              <p>
                {isChinese
                  ? '可观测工具最重要的是日志是否可读、追踪是否完整，以及成本和质量指标能不能真正支撑决策。'
                  : 'The most important things are readable logs, complete tracing, and whether cost and quality metrics truly support decisions.'}
              </p>
              <p>
                {isChinese
                  ? '如果你在做生产产品，优先看保留周期、权限、告警和与现有 API 层的接入难度。'
                  : 'For production products, prioritize retention, permissions, alerting, and how hard it is to integrate with the current API layer.'}
              </p>
            </div>
          </div>

          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '常见问题' : 'FAQ'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? 'API 可观测工具最常见的问题' : 'Common questions about API observability tools'}
            </h2>
            <div className='mt-4 space-y-4'>
              {faqs.map((faq) => (
                <div key={faq.question} className='rounded-lg border border-slate-200 bg-slate-50 p-4'>
                  <p className='text-sm font-semibold text-slate-900'>{faq.question}</p>
                  <p className='mt-2 text-sm leading-6 text-slate-600'>{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_api_observability' />
      </div>
    </>
  );
}
