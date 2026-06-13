import { Metadata } from 'next';
import Link from 'next/link';
import { BarChart3, ExternalLink, Layers3, ShieldCheck } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';
import { getAllCategories, getLocalizedField } from '@/lib/services/categories';
import GuideActionSection from '@/components/guides/GuideActionSection';
import { StructuredDataServer } from '@/components/seo/StructuredData';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Metadata.home' });

  return {
    title:
      locale === 'cn' || locale === 'tw'
        ? 'AI 协议分析工具推荐 | AI Best Tool'
        : `AI tools for protocol analytics | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '面向协议健康观察、使用量分析和研究的 AI 工具选型指南。'
        : 'A practical guide to AI tools for protocol analytics, protocol health monitoring, and usage analysis.',
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const categories = await getAllCategories(true).catch(() => []);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const faqs = [
    {
      question: isChinese ? '协议分析工具最适合用来做什么？' : 'What are protocol analytics tools best used for?',
      answer: isChinese
        ? '通常用于协议健康监测、使用量分析、趋势观察和研究。'
        : 'They are commonly used for protocol health monitoring, usage analysis, trend watching, and research.',
    },
    {
      question: isChinese ? '我应该先看什么？' : 'What should I check first?',
      answer: isChinese
        ? '先看它支持的协议、链和数据源，以及是否便于长期观察。'
        : 'Start with supported protocols, chains, and data sources, and whether it works well for long-term observation.',
    },
    {
      question: isChinese ? '免费版够用吗？' : 'Is a free tier enough?',
      answer: isChinese
        ? '适合基础观察；如果你需要更长历史、更多维度和团队协作，通常要升级。'
        : 'Good for basic observation; longer history, more dimensions, and team collaboration usually require a paid plan.',
    },
    {
      question: isChinese ? '我可以直接从这里找到协议工具吗？' : 'Can I find protocol tools directly from here?',
      answer: isChinese
        ? '可以。你可以先从搜索和分类页开始，再结合评论、截图和更新频率判断。'
        : 'Yes. Start from search and categories, then judge with comments, screenshots, and update frequency.',
    },
  ];
  const tips = isChinese
    ? [
        '先分清你是在看协议健康、使用量，还是研究趋势。',
        '看它是否支持你关心的链和数据源。',
        '如果给团队使用，优先看 API、导出、告警和历史追踪能力。',
      ]
    : [
        'Separate the use case first: protocol health, usage, or trend research.',
        'Check whether it supports the chains and data sources you actually care about.',
        'For team use, prioritize API access, exports, alerts, and historical tracking.',
      ];

  return (
    <>
      <StructuredDataServer
        data={generateBreadcrumbSchema([
          { name: 'Home', url: `${siteUrl}/${locale}` },
          { name: isChinese ? '指南' : 'Guides', url: `${siteUrl}/${locale}/guides` },
          {
            name: isChinese ? '协议工具' : 'Protocol tools',
            url: `${siteUrl}/${locale}/guides/ai-tools-for-protocol-analytics`,
          },
        ])}
      />
      <StructuredDataServer data={generateFAQSchema(faqs)} />
      <div className='theme-page mx-auto max-w-6xl px-4 py-8 lg:px-6 lg:py-12'>
        <section className='rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm lg:p-10'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700'>
              <Layers3 className='size-4' />
              {isChinese ? '协议分析工具推荐' : 'Protocol analytics tools'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <ShieldCheck className='size-4' />
              {isChinese ? '健康与趋势优先' : 'Health and trends first'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese
              ? 'AI 协议分析工具推荐：从协议健康到使用量分析，怎么选更合适'
              : 'AI tools for protocol analytics: how to choose for health monitoring and usage analysis'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? '协议分析工具重点不是“数据多”，而是能不能稳定连接协议数据，并且方便你做观察、对比和追踪。'
              : 'Protocol analytics tools are not just about having lots of data. They need reliable access to protocol data and a smooth way to observe, compare, and track what matters.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <Link
              href='/explore?search=protocol&sort=popular'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看协议工具' : 'Browse protocol tools'}
              <ExternalLink className='size-4' />
            </Link>
            <Link
              href='/guides/ai-tools-for-defi-analytics'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '回到 DeFi 指南' : 'Back to DeFi guide'}
            </Link>
            <Link
              href='/guides/ai-tools-for-protocol-analytics-comparison'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看协议对比页' : 'Protocol comparison'}
            </Link>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '判断顺序' : 'How to judge'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '先看协议覆盖，再看使用量与趋势' : 'Start with protocol coverage, then usage and trends'}
            </h2>
            <div className='mt-4 space-y-3'>
              {tips.map((tip) => (
                <div key={tip} className='rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700'>
                  <div className='flex items-start gap-3'>
                    <BarChart3 className='mt-0.5 size-4 shrink-0 text-emerald-600' />
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
              {isChinese ? '协议工具通常在这些分类里' : 'Protocol tools often sit in these categories'}
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

        <GuideActionSection
          locale={locale}
          eyebrow={isChinese ? '先看这些工具' : 'Recommended tools'}
          title={
            isChinese ? '更贴近协议健康与使用量研究的入口' : 'Real entry points for protocol health and usage research'
          }
          description={
            isChinese
              ? '如果你关心的是协议覆盖、历史数据、趋势观察和对比研究，这几款工具会比泛 Web3 页更快把范围收窄。'
              : 'If protocol coverage, historical data, trend watching, and comparative research matter most, these tools narrow the field faster than a broad Web3 page.'
          }
          toolNames={['messari', 'token-terminal', 'dune', 'defillama']}
          compareEyebrow={isChinese ? '继续比较' : 'Compare next'}
          compareTitle={
            isChinese ? '协议分析意图更强的下一步入口' : 'Next paths for stronger protocol-analytics intent'
          }
          compareDescription={
            isChinese
              ? '当你已经明确自己是在找协议分析工具，而不是钱包监控或泛研究工具，继续进入更窄的比较页会更有效。'
              : 'Once the real job is protocol analytics rather than wallet monitoring or broad research, narrower comparison pages work better.'
          }
          compareLinks={[
            {
              href: '/guides/ai-tools-for-protocol-analytics-comparison',
              title: isChinese ? '协议分析工具对比' : 'Protocol analytics comparison',
              description: isChinese
                ? '适合直接横向看协议覆盖、历史深度和研究贴合度。'
                : 'A direct side-by-side path for protocol coverage, history depth, and research fit.',
            },
            {
              href: '/guides/ai-tools-for-defi-analytics-comparison',
              title: isChinese ? 'DeFi 分析工具对比' : 'DeFi analytics comparison',
              description: isChinese
                ? '如果你发现问题更偏 DeFi 资金和协议细分，这页更合适。'
                : 'More useful if the real decision is shifting toward DeFi-specific protocol and fund analysis.',
            },
            {
              href: '/guides/ai-tools-for-web3-comparison',
              title: isChinese ? 'Web3 工具总对比' : 'Web3 tools comparison',
              description: isChinese
                ? '适合还没完全确定自己在选协议、钱包还是研究工具。'
                : 'Good when you are not yet fully narrowed into protocol, wallet, or research tooling.',
            },
          ]}
        />

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_1fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '协议工具看什么' : 'What matters for protocol tools'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '能不能稳定帮你看协议和趋势' : 'Can it reliably support protocol and trend work?'}
            </h2>
            <div className='mt-4 space-y-3 text-sm leading-6 text-slate-700'>
              <p>
                {isChinese
                  ? '协议工具最重要的是协议覆盖、历史数据和告警能力。'
                  : 'Protocol coverage, historical data, and alerting matter most.'}
              </p>
              <p>
                {isChinese
                  ? '如果你做研究或运营，优先看导出、API、监控和对多协议的支持。'
                  : 'If you do research or operations, prioritize exports, API access, monitoring, and multi-protocol support.'}
              </p>
            </div>
          </div>

          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '常见问题' : 'FAQ'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '协议工具最常见的问题' : 'Common questions about protocol tools'}
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
