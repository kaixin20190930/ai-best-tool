import { Metadata } from 'next';
import Link from 'next/link';
import { BarChart4, ExternalLink, Layers3, TrendingUp } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';
import { getAllCategories, getLocalizedField } from '@/lib/services/categories';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';
import { StructuredDataServer } from '@/components/seo/StructuredData';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Metadata.home' });

  return {
    title:
      locale === 'cn' || locale === 'tw'
        ? 'AI DEX 分析工具推荐 | AI Best Tool'
        : `AI tools for DEX analytics | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '面向交易对分析、流动性观察和 DEX 研究的 AI 工具选型指南。'
        : 'A practical guide to AI tools for DEX analytics, pair analysis, and liquidity observation.',
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const categories = await getAllCategories(true).catch(() => []);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const faqs = [
    {
      question: isChinese ? 'DEX 分析工具最适合用来做什么？' : 'What are DEX analytics tools best used for?',
      answer: isChinese
        ? '通常用于交易对观察、流动性监测、池子对比、价格追踪和 DEX 研究。'
        : 'They are commonly used for pair observation, liquidity monitoring, pool comparison, price tracking, and DEX research.',
    },
    {
      question: isChinese ? '我应该先看什么？' : 'What should I check first?',
      answer: isChinese
        ? '先看它支持的链、DEX、数据源和是否有足够清晰的历史数据。'
        : 'Start with supported chains, DEXes, data sources, and whether it has clear historical data.',
    },
    {
      question: isChinese ? '免费版够用吗？' : 'Is a free tier enough?',
      answer: isChinese
        ? '适合做轻量查看，但如果你要更深的历史、更多对比维度和导出，通常需要升级。'
        : 'Good for lightweight viewing, but deeper history, more comparison dimensions, and exports usually require a paid plan.',
    },
    {
      question: isChinese ? '我可以直接从这里找到 DEX 工具吗？' : 'Can I find DEX tools directly from here?',
      answer: isChinese
        ? '可以。你可以先从搜索和分类页开始，再结合评论、截图和更新频率判断。'
        : 'Yes. Start from search and categories, then judge with comments, screenshots, and update frequency.',
    },
  ];
  const tips = isChinese
    ? [
        '先分清你是在看交易对、池子，还是整体流动性。',
        '看它是否支持你常用的链和 DEX 数据。',
        '如果给团队使用，优先看 API、导出、告警和历史追踪能力。',
      ]
    : [
        'Separate the use case first: pairs, pools, or overall liquidity.',
        'Check whether it supports the chains and DEX data you actually use.',
        'For team use, prioritize API access, exports, alerts, and historical tracking.',
      ];

  return (
    <>
      <StructuredDataServer
        data={generateBreadcrumbSchema([
          { name: 'Home', url: `${siteUrl}/${locale}` },
          { name: isChinese ? '指南' : 'Guides', url: `${siteUrl}/${locale}/guides` },
          { name: isChinese ? 'DEX 工具' : 'DEX tools', url: `${siteUrl}/${locale}/guides/ai-tools-for-dex-analytics` },
        ])}
      />
      <StructuredDataServer data={generateFAQSchema(faqs)} />
      <div className='theme-page mx-auto max-w-6xl px-4 py-8 lg:px-6 lg:py-12'>
        <section className='rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm lg:p-10'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700'>
              <Layers3 className='size-4' />
              {isChinese ? 'DEX 分析工具推荐' : 'DEX analytics tools'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <TrendingUp className='size-4' />
              {isChinese ? '交易对与流动性优先' : 'Pairs and liquidity first'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese
              ? 'AI DEX 分析工具推荐：从交易对到流动性观察，怎么选更合适'
              : 'AI tools for DEX analytics: how to choose for pairs and liquidity observation'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? 'DEX 分析工具重点不是“图表多”，而是能不能稳定连接交易对和池子数据，并且方便你做观察、对比和追踪。'
              : 'DEX analytics tools are not just about charts. They need reliable access to pair and pool data and a smooth way to observe, compare, and track what matters.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <Link
              href='/explore?search=dex&sort=popular'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看 DEX 工具' : 'Browse DEX tools'}
              <ExternalLink className='size-4' />
            </Link>
            <Link
              href='/guides/ai-tools-for-defi-analytics'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '回到 DeFi 指南' : 'Back to DeFi guide'}
            </Link>
            <Link
              href='/guides/ai-tools-for-dex-analytics-comparison'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看 DEX 对比页' : 'DEX comparison'}
            </Link>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '判断顺序' : 'How to judge'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '先看交易对覆盖，再看流动性与追踪' : 'Start with pair coverage, then liquidity and tracking'}
            </h2>
            <div className='mt-4 space-y-3'>
              {tips.map((tip) => (
                <div key={tip} className='rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700'>
                  <div className='flex items-start gap-3'>
                    <BarChart4 className='mt-0.5 size-4 shrink-0 text-emerald-600' />
                    <span>{tip}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className='rounded-[18px] border border-slate-200 bg-slate-50 p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '先看这些分类' : 'Start here'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? 'DEX 工具通常在这些分类里' : 'DEX tools often sit in these categories'}
            </h2>
            <div className='mt-4 grid gap-2'>
              {categories
                .filter(
                  (category) =>
                    String(category.slug).includes('web3') ||
                    String(getLocalizedField(category.name, 'en')).toLowerCase().includes('web3'),
                )
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

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_1fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? 'DEX 工具看什么' : 'What matters for DEX tools'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '能不能稳定帮你看交易对和池子' : 'Can it reliably support pair and pool analysis?'}
            </h2>
            <div className='mt-4 space-y-3 text-sm leading-6 text-slate-700'>
              <p>
                {isChinese
                  ? 'DEX 工具最重要的是交易对覆盖、历史数据和告警能力。'
                  : 'Pair coverage, historical data, and alerting matter most.'}
              </p>
              <p>
                {isChinese
                  ? '如果你做研究或运营，优先看导出、API、监控和对多 DEX 的支持。'
                  : 'If you do research or operations, prioritize exports, API access, monitoring, and multi-DEX support.'}
              </p>
            </div>
          </div>

          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '常见问题' : 'FAQ'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? 'DEX 工具最常见的问题' : 'Common questions about DEX tools'}
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
        <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_dex_analytics' />
      </div>
    </>
  );
}
