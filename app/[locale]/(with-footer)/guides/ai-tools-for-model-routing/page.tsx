import { Metadata } from 'next';
import { ExternalLink, GitBranch, Layers3, Route } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';
import { getAllCategories, getLocalizedField } from '@/lib/services/categories';
import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideActionSection from '@/components/guides/GuideActionSection';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';
import { StructuredDataServer } from '@/components/seo/StructuredData';
import { Link } from '@/app/navigation';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Metadata.home' });

  return {
    title:
      locale === 'cn' || locale === 'tw'
        ? 'AI 模型路由工具推荐 | AI Best Tool'
        : `AI tools for model routing | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '面向多模型接入、成本控制、回退策略和路由工作的 AI 工具选型指南。'
        : 'A practical guide to AI tools for model routing, multi-model access, cost control, and fallback strategy.',
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const categories = await getAllCategories(true).catch(() => []);
  const checkedAt = '2026-07-15';
  const categoryCount = categories.length;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${siteUrl}/${locale}` },
    { name: isChinese ? '指南' : 'Guides', url: `${siteUrl}/${locale}/guides` },
    {
      name: isChinese ? '模型路由工具' : 'Model routing tools',
      url: `${siteUrl}/${locale}/guides/ai-tools-for-model-routing`,
    },
  ]);
  const faqs = [
    {
      question: isChinese ? '模型路由工具最适合做什么？' : 'What are model routing tools best for?',
      answer: isChinese
        ? '适合多模型接入、按成本或质量切换模型、设置回退策略，以及统一管理模型出口。'
        : 'They are best for multi-model access, switching models by cost or quality, setting fallbacks, and centralizing model access.',
    },
    {
      question: isChinese ? '我应该先看什么？' : 'What should I check first?',
      answer: isChinese
        ? '先看支持的模型、回退能力、缓存与日志、以及是否方便接进现有 API 层。'
        : 'Start with supported models, fallback controls, caching and logging, and how easily the tool fits your current API layer.',
    },
    {
      question: isChinese ? '免费版够用吗？' : 'Is a free tier enough?',
      answer: isChinese
        ? '试用通常够用，但当你进入生产、多成员或多模型成本优化阶段时，通常会更快碰到限制。'
        : 'Free tiers can be enough for trials, but production use, multi-member access, and deeper cost optimization hit limits faster.',
    },
    {
      question: isChinese ? '它和普通 API 平台有什么区别？' : 'How is this different from a normal API platform?',
      answer: isChinese
        ? '重点不只是“能调模型”，而是能不能稳定做路由、回退、成本治理和可替换策略。'
        : 'The real difference is not only model access, but stable routing, fallbacks, cost governance, and replaceable strategy.',
    },
  ];
  const tips = isChinese
    ? [
        '先分清你要的是统一出口、成本治理，还是模型回退与策略控制。',
        '看它是否支持你真实会用的模型和供应商，而不是只看列表长不长。',
        '如果是团队使用，优先看权限、日志、缓存、回退和接入维护成本。',
      ]
    : [
        'Separate unified access, cost governance, and fallback control before comparing tools.',
        'Check whether it supports the providers and models you will actually use, not just a long list.',
        'For team use, prioritize permissions, logs, caching, fallbacks, and maintenance cost.',
      ];
  const highIntentPaths = [
    {
      href: '/best-ai-tools/ai-model-routing-tools',
      title: isChinese ? '先看模型路由榜单' : 'Start with model routing ranking',
      desc: isChinese ? '先用 shortlist 缩小范围。' : 'Use the shortlist to narrow the field first.',
    },
    {
      href: '/guides/ai-tools-for-model-routing-comparison',
      title: isChinese ? '模型路由对比' : 'Model routing comparison',
      desc: isChinese
        ? '统一出口、回退和成本治理一起看。'
        : 'Compare unified access, fallbacks, and cost governance together.',
    },
    {
      href: '/guides/ai-tools-for-api-observability-comparison',
      title: isChinese ? 'API 可观测对比' : 'API observability comparison',
      desc: isChinese
        ? '如果你同时在看日志和质量追踪。'
        : 'Useful when logs and quality tracking matter alongside routing.',
    },
    {
      href: '/guides/ai-tools-for-developers-comparison',
      title: isChinese ? '开发者工具对比' : 'Developer tools comparison',
      desc: isChinese ? '更广的开发者工作流入口。' : 'A broader developer workflow entry point.',
    },
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
              {isChinese ? '模型路由工具推荐' : 'Model routing tools'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <Route className='size-4' />
              {isChinese ? '多模型与回退优先' : 'Multi-model and fallback first'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese
              ? 'AI 模型路由工具推荐：从统一出口到回退策略，怎么选更合适'
              : 'AI tools for model routing: how to choose for unified access and fallback strategy'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? '模型路由工具真正的价值，不是“能接很多模型”，而是能不能稳定地在成本、质量、延迟和回退之间做取舍。'
              : 'The real value of model routing tools is not just model access, but reliable trade-offs between cost, quality, latency, and fallback behavior.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href='/explore?search=model&sort=popular'
              ctaId='model_routing_guide_browse_tools'
              ctaLabel='Model routing guide browse tools'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看模型路由工具' : 'Browse model routing tools'}
              <ExternalLink className='size-4' />
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-tools-for-developers'
              ctaId='model_routing_guide_developers'
              ctaLabel='Model routing guide developers'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '回到开发者指南' : 'Back to developer guide'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-tools-for-model-routing-comparison'
              ctaId='model_routing_guide_comparison'
              ctaLabel='Model routing guide comparison'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看模型路由对比页' : 'Model routing comparison'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/best-ai-tools/ai-model-routing-tools'
              ctaId='model_routing_guide_top_list'
              ctaLabel='Model routing guide top list'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
            >
              {isChinese ? '看模型路由榜单' : 'Open model routing ranking'}
            </TrackableCtaLink>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '判断顺序' : 'How to judge'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '先看路由策略，再看接入成本' : 'Start with routing strategy, then integration cost'}
            </h2>
            <div className='mt-4 space-y-3'>
              {tips.map((tip) => (
                <div key={tip} className='rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700'>
                  <div className='flex items-start gap-3'>
                    <GitBranch className='mt-0.5 size-4 shrink-0 text-emerald-600' />
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
              {isChinese ? '模型路由工具通常在这些分类里' : 'Model routing tools often sit in these categories'}
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

        <GuideEvidencePanel
          locale={locale}
          checkedAt={checkedAt}
          scope={
            isChinese
              ? '这页优先检查页面是否能帮助用户完成真实模型路由选择：统一出口、回退、成本治理和可替换策略，而不是只看模型列表长度。'
              : 'This page prioritizes whether the guide helps with a real model-routing decision: unified access, fallback, cost governance, and replaceable strategy rather than model list length.'
          }
          items={[
            {
              label: isChinese ? '判断维度' : 'Decision signals',
              value: isChinese ? '路由、回退、成本、接入' : 'Routing, fallback, cost, integration',
              note: isChinese
                ? `重点看能否支撑真实生产治理，而不是只做模型目录。当前可用分类数：${categoryCount}。`
                : `We care about whether the tool supports real production governance, not only a model directory. Current category count: ${categoryCount}.`,
            },
            {
              label: isChinese ? '索引策略' : 'Indexing strategy',
              value: isChinese ? '核心页保留索引' : 'Keep the core page indexable',
              note: isChinese
                ? '把模型路由意图写清楚，减少和开发者页、可观测页重叠。'
                : 'Make the routing intent explicit so it overlaps less with developer and observability pages.',
            },
            {
              label: isChinese ? '下一步补强' : 'Next enrichment',
              value: isChinese ? '补真实路由案例' : 'Add real routing cases',
              note: isChinese
                ? `后续优先补回退链路、成本优化和团队使用记录，并保持 ${checkedAt} 的核对记录。`
                : `Next, priority additions are fallback flows, cost optimization notes, and team usage examples while keeping the ${checkedAt} verification record.`,
            },
          ]}
        />

        <section className='mt-6 grid gap-4 rounded-[18px] border border-cyan-200 bg-cyan-50/70 p-6 shadow-sm md:grid-cols-3'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '最近验证' : 'Last checked'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>{checkedAt}</p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? `这页已按真实模型路由决策重新核对，优先保留回退、成本和接入证据，目前覆盖 ${categoryCount} 个分类。`
                : `This page has been rechecked against a real routing decision and keeps fallback, cost, and integration evidence visible across ${categoryCount} categories.`}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '当前判断' : 'Current judgment'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>
              {isChinese ? '保留索引，写清生产治理' : 'Keep it indexable and spell out production governance'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '把统一出口、回退链路和成本控制写得更具体，避免和开发者页重叠。'
                : 'Make unified access, fallback paths, and cost control concrete so it overlaps less with developer pages.'}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '下一步' : 'Next step'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>
              {isChinese ? '补真实路由案例和复盘' : 'Add real routing cases and retros'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? `后续优先补回退链路、缓存命中和团队成本治理记录，并持续保留 ${checkedAt} 的核对痕迹。`
                : `Next, prioritize fallback flows, cache behavior, and team cost-governance notes while preserving the ${checkedAt} check trail.`}
            </p>
          </div>
        </section>

        <section className='mt-8 rounded-[18px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '高意图路径' : 'High-intent path'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese ? '先看榜单和对比，再回到路由页' : 'Compare first, then come back to routing pages'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经知道自己要做的是模型接入、回退治理或成本优化，就直接去更窄的榜单和对比页。'
              : 'If the real job is model access, fallback governance, or cost optimization, move straight into the narrower ranking and comparison pages.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {highIntentPaths.map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`model_routing_guide_${item.href.split('/').pop()}`}
                ctaLabel={item.title}
                pageType='guide'
                className='rounded-xl border border-white bg-white p-4 shadow-sm hover:bg-slate-50'
              >
                <p className='text-sm font-semibold text-slate-950'>{item.title}</p>
                <p className='mt-2 text-sm leading-6 text-slate-600'>{item.desc}</p>
              </TrackableCtaLink>
            ))}
          </div>
        </section>

        <GuideActionSection
          locale={locale}
          eyebrow={isChinese ? '先看这些工具' : 'Recommended tools'}
          title={isChinese ? '更贴近模型接入工作的真实入口' : 'Real entry points for model access workflows'}
          description={
            isChinese
              ? '如果你最关心统一模型出口、回退策略、缓存和成本控制，这几款工具会比泛开发者页更快进入正题。'
              : 'If unified model access, fallbacks, caching, and cost control matter most, these tools get you to the real decision faster than a broad developer page.'
          }
          toolNames={['openrouter', 'portkey', 'helicone', 'langfuse']}
          compareEyebrow={isChinese ? '继续比较' : 'Compare next'}
          compareTitle={isChinese ? '模型路由意图更强的下一步入口' : 'Next paths for stronger model-routing intent'}
          compareDescription={
            isChinese
              ? '当你已经知道自己在找多模型接入和成本治理，而不是单纯编码辅助，继续进入更窄的比较页更有效。'
              : 'Once the real need is multi-model access and cost governance rather than pure coding assistance, narrower comparison pages work better.'
          }
          compareLinks={[
            {
              href: '/guides/ai-tools-for-model-routing-comparison',
              title: isChinese ? '模型路由工具对比' : 'Model routing comparison',
              description: isChinese
                ? '适合直接横向看路由、回退和出口策略。'
                : 'A direct side-by-side path for routing, fallbacks, and model access strategy.',
            },
            {
              href: '/best-ai-tools/ai-model-routing-tools',
              title: isChinese ? '模型路由榜单' : 'Model routing ranking',
              description: isChinese
                ? '适合已经确认方向、只想更快缩小 shortlist 的用户。'
                : 'Useful when the direction is clear and the goal is to narrow the shortlist faster.',
            },
            {
              href: '/guides/ai-tools-for-api-observability-comparison',
              title: isChinese ? 'API 可观测工具对比' : 'API observability comparison',
              description: isChinese
                ? '如果你更关心日志、成本和质量追踪，这页更贴近目标。'
                : 'More useful when logs, cost, and quality tracking matter most.',
            },
            {
              href: '/guides/ai-tools-for-developers-comparison',
              title: isChinese ? '开发者工具总对比' : 'Developer tools comparison',
              description: isChinese
                ? '适合还没完全确定自己是在选路由还是更广的开发工具。'
                : 'Good when you are not yet fully narrowed into routing versus broader developer tooling.',
            },
          ]}
        />

        <section className='mt-8 rounded-[18px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '高意图榜单' : 'High-intent ranking'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese
              ? '先用榜单缩小模型路由 shortlist'
              : 'Use the ranking to narrow your model routing shortlist first'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经知道自己要比的是模型出口、回退和成本治理，榜单页会比泛目录更快进入决策。'
              : 'If the decision is already about model access, fallbacks, and cost governance, the ranking page gets to a decision faster than a broad directory.'}
          </p>
          <div className='mt-5 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href='/best-ai-tools/ai-model-routing-tools'
              ctaId='model_routing_guide_ranking_primary'
              ctaLabel='Model routing guide ranking primary'
              pageType='guide'
              className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '进入模型路由榜单' : 'Open model routing ranking'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-tools-for-model-routing-comparison'
              ctaId='model_routing_guide_ranking_secondary'
              ctaLabel='Model routing guide ranking secondary'
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
              {isChinese ? '模型路由工具看什么' : 'What matters for model routing tools'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '能不能稳定做路由与回退' : 'Can it reliably handle routing and fallbacks?'}
            </h2>
            <div className='mt-4 space-y-3 text-sm leading-6 text-slate-700'>
              <p>
                {isChinese
                  ? '模型路由工具最重要的是支持的模型是否真实可用，以及路由、缓存、回退和日志是否稳定。'
                  : 'The key is whether the supported models are truly usable and whether routing, caching, fallbacks, and logging are stable.'}
              </p>
              <p>
                {isChinese
                  ? '如果你在做团队产品，优先看权限、成本治理、请求追踪和替换供应商的自由度。'
                  : 'For team products, prioritize permissions, cost governance, request tracing, and the freedom to swap providers later.'}
              </p>
            </div>
          </div>

          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '常见问题' : 'FAQ'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '模型路由工具最常见的问题' : 'Common questions about model routing tools'}
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
        <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_model_routing' />
      </div>
    </>
  );
}
