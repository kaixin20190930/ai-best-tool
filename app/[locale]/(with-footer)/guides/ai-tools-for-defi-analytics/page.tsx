import { Metadata } from 'next';
import Link from 'next/link';
import { BarChart3, ExternalLink, Layers3, PieChart } from 'lucide-react';
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
        ? 'AI DeFi 分析工具推荐 | AI Best Tool'
        : `AI tools for DeFi analytics | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '面向流动性监测、收益追踪和协议研究的 AI 工具选型指南。'
        : 'A practical guide to AI tools for DeFi analytics, yield tracking, and protocol research.',
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const categories = await getAllCategories(true).catch(() => []);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const faqs = [
    {
      question: isChinese ? 'DeFi 分析工具最适合用来做什么？' : 'What are DeFi analytics tools best used for?',
      answer: isChinese
        ? '通常用于流动性监测、收益跟踪、协议研究、池子观察和资金流分析。'
        : 'They are commonly used for liquidity monitoring, yield tracking, protocol research, pool watching, and fund-flow analysis.',
    },
    {
      question: isChinese ? '我应该先看什么？' : 'What should I check first?',
      answer: isChinese
        ? '先看它支持的协议、链、数据源，以及是否方便你做长期监控。'
        : 'Start with supported protocols, chains, data sources, and whether it works for long-term monitoring.',
    },
    {
      question: isChinese ? '免费版够用吗？' : 'Is a free tier enough?',
      answer: isChinese
        ? '适合基础观察，但如果你要历史数据、更多维度和团队协作，通常需要升级。'
        : 'Good for basic observation, but historical data, more dimensions, and team collaboration often require a paid plan.',
    },
    {
      question: isChinese ? '我可以直接从这里找到 DeFi 工具吗？' : 'Can I find DeFi tools directly from here?',
      answer: isChinese
        ? '可以。你可以先从搜索和分类页开始，再结合评论、截图和更新频率判断。'
        : 'Yes. Start from search and categories, then judge with comments, screenshots, and update frequency.',
    },
  ];
  const tips = isChinese
    ? [
        '先分清你是在看协议、池子、收益，还是整体资金流。',
        '看它是否支持你常用的链和协议数据。',
        '如果给团队使用，优先看 API、导出、告警和历史追踪能力。',
      ]
    : [
        'Separate the use case first: protocols, pools, yields, or overall fund flow.',
        'Check whether it supports the chains and protocol data you actually use.',
        'For team use, prioritize API access, exports, alerts, and historical tracking.',
      ];

  return (
    <>
      <StructuredDataServer
        data={generateBreadcrumbSchema([
          { name: 'Home', url: `${siteUrl}/${locale}` },
          { name: isChinese ? '指南' : 'Guides', url: `${siteUrl}/${locale}/guides` },
          {
            name: isChinese ? 'DeFi 工具' : 'DeFi tools',
            url: `${siteUrl}/${locale}/guides/ai-tools-for-defi-analytics`,
          },
        ])}
      />
      <StructuredDataServer data={generateFAQSchema(faqs)} />
      <div className='theme-page mx-auto max-w-6xl px-4 py-8 lg:px-6 lg:py-12'>
        <section className='rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm lg:p-10'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700'>
              <Layers3 className='size-4' />
              {isChinese ? 'DeFi 分析工具推荐' : 'DeFi analytics tools'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <BarChart3 className='size-4' />
              {isChinese ? '流动性与收益优先' : 'Liquidity and yield first'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese
              ? 'AI DeFi 分析工具推荐：从流动性监测到收益追踪，怎么选更合适'
              : 'AI tools for DeFi analytics: how to choose for liquidity monitoring and yield tracking'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? 'DeFi 分析工具重点不是“报表多”，而是能不能稳定连接协议数据，并且方便你做观察、对比和追踪。'
              : 'DeFi analytics tools are not just about reports. They need reliable protocol data and a smooth way to observe, compare, and track what matters.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <Link
              href='/explore?search=defi&sort=popular'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看 DeFi 工具' : 'Browse DeFi tools'}
              <ExternalLink className='size-4' />
            </Link>
            <Link
              href='/guides/ai-tools-for-web3'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '回到 Web3 指南' : 'Back to Web3 guide'}
            </Link>
            <Link
              href='/guides/ai-tools-for-defi-analytics-comparison'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看 DeFi 对比页' : 'DeFi comparison'}
            </Link>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '判断顺序' : 'How to judge'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '先看协议覆盖，再看追踪和告警' : 'Start with protocol coverage, then tracking and alerts'}
            </h2>
            <div className='mt-4 space-y-3'>
              {tips.map((tip) => (
                <div key={tip} className='rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700'>
                  <div className='flex items-start gap-3'>
                    <PieChart className='mt-0.5 size-4 shrink-0 text-emerald-600' />
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
              {isChinese ? 'DeFi 工具通常在这些分类里' : 'DeFi tools often sit in these categories'}
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
              {isChinese ? 'DeFi 工具看什么' : 'What matters for DeFi tools'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '能不能稳定帮你看协议和收益' : 'Can it reliably support protocol and yield work?'}
            </h2>
            <div className='mt-4 space-y-3 text-sm leading-6 text-slate-700'>
              <p>
                {isChinese
                  ? 'DeFi 工具最重要的是协议覆盖、历史数据和告警能力。'
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
              {isChinese ? 'DeFi 工具最常见的问题' : 'Common questions about DeFi tools'}
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

        <GuideActionSection
          locale={locale}
          eyebrow={isChinese ? '先看这些工具' : 'Recommended tools'}
          title={isChinese ? '更贴近 DeFi 决策的真实入口' : 'Real entry points for DeFi decisions'}
          description={
            isChinese
              ? '如果你已经知道自己关心的是流动性、收益、协议监控或资金流，这几款工具会比泛 Web3 页面更快收窄范围。'
              : 'If your focus is liquidity, yield, protocol monitoring, or fund flow, these tools narrow the field faster than a broad Web3 page.'
          }
          toolNames={['defillama', 'debank', 'dune', 'messari']}
          compareEyebrow={isChinese ? '继续比较' : 'Compare next'}
          compareTitle={isChinese ? 'DeFi 方向更明确后的下一步' : 'Next paths once DeFi is the clear lane'}
          compareDescription={
            isChinese
              ? '当你不是泛泛浏览，而是真的要决定监控、研究还是分析工具时，继续进入更窄的对比页会更有效。'
              : 'Once you are actually choosing between monitoring, research, and analytics tools, narrower comparison pages work better.'
          }
          compareLinks={[
            {
              href: '/guides/ai-tools-for-defi-analytics-comparison',
              title: isChinese ? 'DeFi 工具总对比' : 'DeFi tools comparison',
              description: isChinese
                ? '适合还没完全确定自己更偏协议、收益还是资金流。'
                : 'Best when you still need a broad side-by-side view across protocols, yield, and fund flow.',
            },
            {
              href: '/guides/ai-tools-for-protocol-analytics-comparison',
              title: isChinese ? '协议分析工具对比' : 'Protocol analytics comparison',
              description: isChinese
                ? '如果你已经明确更偏协议健康、指标看板和长期跟踪，这页更高意图。'
                : 'A stronger fit when protocol health, dashboards, and long-term tracking are the real need.',
            },
            {
              href: '/guides/ai-tools-for-crypto-research-comparison',
              title: isChinese ? 'Crypto 研究工具对比' : 'Crypto research comparison',
              description: isChinese
                ? '如果你更偏项目判断、信息整合和链上观察，这页更贴近目标。'
                : 'A better path when project judgment, synthesis, and on-chain observation matter more.',
            },
          ]}
          nextEyebrow={isChinese ? '下一步入口' : 'Where to go next'}
          nextTitle={
            isChinese ? 'DeFi 方向明确后，继续这样收窄' : 'How to narrow the space once DeFi is clearly the lane'
          }
          nextDescription={
            isChinese
              ? '如果你已经确认自己要找的是 DeFi 工具，下一步就进入 Web3 分类、精准搜索和最近新增，开始比较真实候选。'
              : 'Once DeFi is clearly the lane, use the category, focused search, and recent additions to compare real candidates.'
          }
          nextLinks={[
            {
              href: '/categories/web3?sort=popular',
              title: isChinese ? '进入 Web3 分类' : 'Open the Web3 category',
              description: isChinese
                ? '回到 Web3 目录继续看真实条目。'
                : 'Return to the Web3 directory to compare actual listings.',
            },
            {
              href: '/explore?search=defi&sort=popular',
              title: isChinese ? '搜索更多 DeFi 工具' : 'Search more DeFi tools',
              description: isChinese
                ? '回到 Explore，用更窄的 DeFi 关键词继续扩大 shortlist。'
                : 'Return to Explore and widen the shortlist with DeFi-focused search.',
            },
            {
              href: '/new',
              title: isChinese ? '看本周新增' : 'Check new this week',
              description: isChinese
                ? '看看最近补进来的 Web3 和 DeFi 工具里有没有更合适的新候选。'
                : 'See whether recent Web3 and DeFi additions introduced a stronger fit.',
            },
          ]}
        />
      </div>
    </>
  );
}
