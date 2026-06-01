import { Metadata } from 'next';
import Link from 'next/link';
import { BellRing, ExternalLink, Layers3, Search } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';
import { getAllCategories, getLocalizedField } from '@/lib/services/categories';
import { StructuredDataServer } from '@/components/seo/StructuredData';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Metadata.home' });

  return {
    title:
      locale === 'cn' || locale === 'tw'
        ? 'AI 钱包监控工具推荐 | AI Best Tool'
        : `AI tools for wallet monitoring | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '面向钱包监控、地址提醒和异常观察的 AI 工具选型指南。'
        : 'A practical guide to AI tools for wallet monitoring, address alerts, and anomaly watching.',
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const categories = await getAllCategories(true).catch(() => []);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${siteUrl}/${locale}` },
    { name: isChinese ? '选型指南' : 'Guides', url: `${siteUrl}/${locale}/guides/how-to-choose-ai-tools` },
    {
      name: isChinese ? '钱包监控工具' : 'Wallet monitoring tools',
      url: `${siteUrl}/${locale}/guides/ai-tools-for-wallet-monitoring`,
    },
  ]);
  const faqs = [
    {
      question: isChinese ? '钱包监控工具最适合做什么？' : 'What are wallet monitoring tools best used for?',
      answer: isChinese
        ? '适合地址提醒、资金流监控、异常交易追踪、黑名单观察和资产变动通知。'
        : 'They are ideal for address alerts, fund-flow monitoring, anomaly tracking, blacklist watching, and asset movement notifications.',
    },
    {
      question: isChinese ? '我应该先看什么？' : 'What should I check first?',
      answer: isChinese
        ? '先看提醒延迟、支持的链、阈值设置和通知渠道。'
        : 'Start with alert latency, supported chains, threshold controls, and notification channels.',
    },
    {
      question: isChinese ? '免费版够用吗？' : 'Is a free tier enough?',
      answer: isChinese
        ? '轻量观察常常够用，但如果你需要多地址监控、团队协作或更快提醒，通常要升级。'
        : 'Free tiers can work for light observation, but multi-address monitoring, team collaboration, and faster alerts usually require paid plans.',
    },
    {
      question: isChinese
        ? '我可以直接从这里找到钱包监控工具吗？'
        : 'Can I find wallet monitoring tools directly from here?',
      answer: isChinese
        ? '可以。你可以先从搜索和分类页开始，再结合评论、截图和更新频率判断。'
        : 'Yes. Start from search and categories, then judge with comments, screenshots, and update frequency.',
    },
  ];
  const tips = isChinese
    ? [
        '先分清你需要的是提醒、监控还是风控观察。',
        '看它支持的链和通知渠道是否覆盖你的实际使用场景。',
        '如果要给团队使用，优先看多地址、标签和导出能力。',
      ]
    : [
        'Separate the need first: alerts, monitoring, or risk observation.',
        'Check whether supported chains and notification channels match your workflow.',
        'For team use, prioritize multi-address support, tagging, and export capabilities.',
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
              {isChinese ? '钱包监控工具推荐' : 'Wallet monitoring tools'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <BellRing className='size-4' />
              {isChinese ? '提醒和异常优先' : 'Alerts and anomalies first'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese
              ? 'AI 钱包监控工具推荐：从地址提醒到异常观察，怎么选更合适'
              : 'AI tools for wallet monitoring: how to choose for alerts and anomaly watching'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? '钱包监控工具的重点不是“监控很多地址”，而是能不能快速提醒、清晰分类、并且支持你真正要看的链和通知方式。'
              : 'Wallet monitoring tools are not just about watching many addresses. They need fast alerts, clear categorization, and support for the chains and notification methods you actually use.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <Link
              href='/explore?search=wallet&sort=popular'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看钱包监控工具' : 'Browse wallet tools'}
              <ExternalLink className='size-4' />
            </Link>
            <Link
              href='/guides/ai-tools-for-web3'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '回到 Web3 指南' : 'Back to Web3 guide'}
            </Link>
            <Link
              href='/guides/ai-tools-for-wallet-monitoring-comparison'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看钱包监控对比页' : 'Wallet comparison'}
            </Link>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '判断顺序' : 'How to judge'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '先看提醒速度，再看通知渠道' : 'Start with alert speed, then notification channels'}
            </h2>
            <div className='mt-4 space-y-3'>
              {tips.map((tip) => (
                <div key={tip} className='rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700'>
                  <div className='flex items-start gap-3'>
                    <Search className='mt-0.5 size-4 shrink-0 text-emerald-600' />
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
              {isChinese ? '钱包监控工具通常在这些分类里' : 'Wallet tools often sit in these categories'}
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
              {isChinese ? '钱包监控工具看什么' : 'What matters for wallet tools'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '能不能稳定帮你做提醒和观察' : 'Can it reliably support alerts and observation?'}
            </h2>
            <div className='mt-4 space-y-3 text-sm leading-6 text-slate-700'>
              <p>
                {isChinese
                  ? '钱包监控工具最重要的是提醒延迟、分类清晰和通知方式稳定。'
                  : 'Alert latency, clear categorization, and stable notification delivery matter most.'}
              </p>
              <p>
                {isChinese
                  ? '如果你做风控或监控，优先看多地址、标签、导出和历史记录。'
                  : 'If you do risk or monitoring work, prioritize multi-address support, tags, exports, and history.'}
              </p>
            </div>
          </div>

          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '常见问题' : 'FAQ'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '钱包监控工具最常见的问题' : 'Common questions about wallet tools'}
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
