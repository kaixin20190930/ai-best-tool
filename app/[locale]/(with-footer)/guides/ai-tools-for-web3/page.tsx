import { Metadata } from 'next';
import Link from 'next/link';
import { CircleDollarSign, ExternalLink, Globe, Layers3 } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';
import { getAllCategories, getLocalizedField } from '@/lib/services/categories';
import GuideActionSection from '@/components/guides/GuideActionSection';
import { StructuredDataServer } from '@/components/seo/StructuredData';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Metadata.home' });

  return {
    title: locale === 'cn' || locale === 'tw' ? 'AI Web3 工具推荐 | AI Best Tool' : `AI tools for Web3 | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '面向 Web3、链上数据、钱包和 Crypto 工作流的 AI 工具选型指南。'
        : 'A practical guide to AI tools for Web3, on-chain data, wallets, and crypto workflows.',
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const categories = await getAllCategories(true).catch(() => []);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const faqs = [
    {
      question: isChinese ? 'Web3 工具最适合用来做什么？' : 'What are Web3 tools best used for?',
      answer: isChinese
        ? '通常用于链上数据分析、钱包监控、DeFi 研究、项目情报、地址追踪和工作流自动化。'
        : 'They are commonly used for on-chain analysis, wallet monitoring, DeFi research, project intelligence, address tracking, and workflow automation.',
    },
    {
      question: isChinese ? '我应该先看什么？' : 'What should I check first?',
      answer: isChinese
        ? '先看它支持的链、数据源、价格模型，以及是否适合你的团队工作流。'
        : 'Start with supported chains, data sources, pricing model, and whether it fits your team workflow.',
    },
    {
      question: isChinese ? '免费版够用吗？' : 'Is a free tier enough?',
      answer: isChinese
        ? '适合试用和轻量查询，但如果你需要更深的数据、API 限额、团队协作或历史数据，通常要升级。'
        : 'Free tiers are good for testing and light queries, but deeper data, API limits, team collaboration, and history usually require paid plans.',
    },
    {
      question: isChinese ? '我可以直接从这里找到 Web3 工具吗？' : 'Can I find Web3 tools directly from here?',
      answer: isChinese
        ? '可以。你可以先从搜索和分类页开始，再结合评论、截图和更新频率判断。'
        : 'Yes. Start from search and categories, then judge with comments, screenshots, and update frequency.',
    },
  ];
  const tips = isChinese
    ? [
        '先分清你需要的是链上分析、钱包、数据 API 还是自动化工作流。',
        '看它有没有稳定的数据源和足够清楚的定价。',
        '如果要给团队使用，优先看 API、导出和历史查询能力。',
      ]
    : [
        'Separate the need first: on-chain analytics, wallets, data APIs, or automation workflows.',
        'Check whether it has stable data sources and clear pricing.',
        'For team use, prioritize API access, exports, and historical queries.',
      ];

  return (
    <>
      <StructuredDataServer
        data={generateBreadcrumbSchema([
          { name: 'Home', url: `${siteUrl}/${locale}` },
          { name: isChinese ? '指南' : 'Guides', url: `${siteUrl}/${locale}/guides` },
          { name: isChinese ? 'Web3 工具' : 'Web3 tools', url: `${siteUrl}/${locale}/guides/ai-tools-for-web3` },
        ])}
      />
      <StructuredDataServer data={generateFAQSchema(faqs)} />
      <div className='theme-page mx-auto max-w-6xl px-4 py-8 lg:px-6 lg:py-12'>
        <section className='rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm lg:p-10'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700'>
              <Layers3 className='size-4' />
              {isChinese ? 'Web3 工具推荐' : 'Web3 tools'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <Globe className='size-4' />
              {isChinese ? '链上与数据优先' : 'On-chain first'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese
              ? 'AI Web3 工具推荐：从链上数据到钱包工作流，怎么选更合适'
              : 'AI tools for Web3: how to choose for on-chain data, wallets, and workflows'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? 'Web3 工具的重点不是“功能多”，而是能不能稳定连接链上数据、支持你的交易/研究流程，并且价格和权限清晰。'
              : 'Web3 tools are not only about features. They need reliable on-chain data, a fit for your research or trading workflow, and clear pricing and permissions.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <Link
              href='/explore?search=web3&sort=popular'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看 Web3 工具' : 'Browse Web3 tools'}
              <ExternalLink className='size-4' />
            </Link>
            <Link
              href='/guides/how-to-choose-ai-tools'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '回到选型指南' : 'Back to selection guide'}
            </Link>
            <Link
              href='/guides/ai-tools-for-web3-comparison'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看 Web3 对比页' : 'Web3 comparison'}
            </Link>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '判断顺序' : 'How to judge'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '先看数据源，再看工作流' : 'Start with the data source, then the workflow'}
            </h2>
            <div className='mt-4 space-y-3'>
              {tips.map((tip) => (
                <div key={tip} className='rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700'>
                  <div className='flex items-start gap-3'>
                    <CircleDollarSign className='mt-0.5 size-4 shrink-0 text-emerald-600' />
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
              {isChinese ? 'Web3 工具通常在这些分类里' : 'Web3 tools often sit in these categories'}
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
          title={isChinese ? '更贴近 Web3 决策的真实入口' : 'Real entry points for Web3 decisions'}
          description={
            isChinese
              ? '如果你已经知道自己关心的是链上数据、协议研究、钱包监控或资产变化，这几款工具会比泛 AI 列表更快把范围收窄。'
              : 'If you already know the work is about on-chain data, protocol research, wallet monitoring, or asset movement, these tools narrow the space much faster than a broad AI list.'
          }
          toolNames={['dune', 'defillama', 'debank', 'messari']}
          compareEyebrow={isChinese ? '继续比较' : 'Compare next'}
          compareTitle={isChinese ? 'Web3 方向更明确后的下一步' : 'Next paths once the Web3 direction is clearer'}
          compareDescription={
            isChinese
              ? '当你已经不是在泛泛看榜单，而是真的要决定研究、监控或分析工具时，继续进入更窄的对比页会更有效。'
              : 'Once you are not just browsing but actually choosing research, monitoring, or analytics tooling, narrower comparison pages become much more useful.'
          }
          compareLinks={[
            {
              href: '/guides/ai-tools-for-web3-comparison',
              title: isChinese ? 'Web3 工具总对比' : 'Web3 tools comparison',
              description: isChinese
                ? '适合还没完全确定自己更偏协议、钱包还是研究。'
                : 'Best when you still need a broad side-by-side look across research, wallet, and protocol workflows.',
            },
            {
              href: '/guides/ai-tools-for-on-chain-analysis-comparison',
              title: isChinese ? '链上分析工具对比' : 'On-chain analysis comparison',
              description: isChinese
                ? '如果你已经明确要看地址、资金流和链上行为，这页更高意图。'
                : 'A stronger fit when the real decision is about addresses, fund flow, and on-chain behavior.',
            },
            {
              href: '/guides/ai-tools-for-crypto-research-comparison',
              title: isChinese ? 'Crypto 研究工具对比' : 'Crypto research comparison',
              description: isChinese
                ? '如果你更偏项目判断、叙事追踪和资料整合，这页更贴近目标。'
                : 'A better path when project analysis, narrative tracking, and information synthesis matter more.',
            },
          ]}
          nextEyebrow={isChinese ? '下一步入口' : 'Where to go next'}
          nextTitle={
            isChinese ? '确定是 Web3 之后，继续这样收窄' : 'How to narrow the space once Web3 is clearly the lane'
          }
          nextDescription={
            isChinese
              ? '如果你已经确认自己要找的是 Web3 工具，下一步就进入 Web3 分类、精准搜索和最近新增，开始比较真实候选。'
              : 'Once Web3 is clearly the lane, the next step is to use the category, focused search, and recent additions to compare real candidates.'
          }
          nextLinks={[
            {
              href: '/categories/web3?sort=popular',
              title: isChinese ? '进入 Web3 分类' : 'Open the Web3 category',
              description: isChinese
                ? '直接进入 Web3 目录，继续看真实条目。'
                : 'Jump into the Web3 category and compare actual listings.',
            },
            {
              href: '/explore?search=web3&sort=popular',
              title: isChinese ? '搜索更多 Web3 工具' : 'Search more Web3 tools',
              description: isChinese
                ? '回到 Explore，用更窄的 Web3 关键词继续扩大 shortlist。'
                : 'Return to Explore and widen the shortlist with tighter Web3 queries.',
            },
            {
              href: '/new',
              title: isChinese ? '看本周新增' : 'Check new this week',
              description: isChinese
                ? '顺手看最近补进来的 Web3 和开发者工具。'
                : 'See which newly added Web3 and developer tools might be more current.',
            },
          ]}
        />

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_1fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? 'Web3 工具看什么' : 'What matters for Web3 tools'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '能不能稳定帮你做链上工作' : 'Can it reliably support on-chain work?'}
            </h2>
            <div className='mt-4 space-y-3 text-sm leading-6 text-slate-700'>
              <p>
                {isChinese
                  ? 'Web3 工具最重要的是数据源稳定、历史查询清晰、团队使用成本可控。'
                  : 'Stability of data sources, clear historical queries, and predictable team costs matter most.'}
              </p>
              <p>
                {isChinese
                  ? '如果你做研究或运维，优先看 API、导出、监控、地址跟踪和权限配置。'
                  : 'If you do research or operations, prioritize API access, exports, monitoring, address tracking, and permission settings.'}
              </p>
            </div>
          </div>

          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '常见问题' : 'FAQ'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? 'Web3 工具最常见的问题' : 'Common questions about Web3 tools'}
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
