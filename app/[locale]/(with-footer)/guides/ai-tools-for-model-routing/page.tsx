import { Metadata } from 'next';
import { GitBranch, Layers3, Route } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { BASE_URL } from '@/lib/env';
import { getNoindexMetadata } from '@/lib/seo/indexing';
import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';
import { getAllCategories, getLocalizedField } from '@/lib/services/categories';
import GuideActionSection from '@/components/guides/GuideActionSection';
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
    ...getNoindexMetadata(),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const categories = await getAllCategories(true).catch(() => []);

  const siteUrl = BASE_URL;
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
        />

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
      </div>
    </>
  );
}
