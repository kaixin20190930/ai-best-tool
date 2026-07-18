import { Metadata } from 'next';
import { CircleDollarSign, ExternalLink, Globe, Layers3 } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { BASE_URL } from '@/lib/env';
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
    title: locale === 'cn' || locale === 'tw' ? 'AI Web3 工具推荐 | AI Best Tool' : `AI tools for Web3 | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '面向 Web3、链上数据、钱包和 Crypto 工作流的 AI 工具选型指南，先看榜单再进对比页。'
        : 'A practical guide to AI tools for Web3, on-chain data, wallets, and crypto workflows, with a path from guide to ranking and comparison.',
    alternates: { canonical: `${BASE_URL}/${locale}/guides/ai-tools-for-web3` },
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const categories = await getAllCategories(true).catch(() => []);
  const checkedAt = '2026-07-18';
  const siteUrl = BASE_URL;
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
  const quickStarts = [
    {
      href: '/best-ai-tools/ai-web3-tools',
      title: isChinese ? 'Web3 榜单' : 'Web3 ranking',
      desc: isChinese ? '先看 shortlist，再进更细对比。' : 'Start with the shortlist before deeper comparison.',
    },
    {
      href: '/guides/ai-tools-for-web3-comparison',
      title: isChinese ? 'Web3 对比页' : 'Web3 comparison',
      desc: isChinese ? '链上数据、钱包和协议能力。' : 'On-chain data, wallets, and protocol capabilities.',
    },
    {
      href: '/ai/defillama',
      title: 'DefiLlama',
      desc: isChinese ? '适合协议和市场覆盖。' : 'Good for protocol and market coverage.',
    },
    {
      href: '/ai/dune',
      title: 'Dune',
      desc: isChinese ? '适合查询驱动的链上分析。' : 'Useful for query-driven on-chain analysis.',
    },
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
            <TrackableCtaLink
              href='/explore?search=web3&sort=popular'
              ctaId='web3_guide_browse_tools'
              ctaLabel='Web3 guide browse tools'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看 Web3 工具' : 'Browse Web3 tools'}
              <ExternalLink className='size-4' />
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/best-ai-tools/ai-web3-tools'
              ctaId='web3_guide_top_list'
              ctaLabel='Web3 guide top list'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
            >
              {isChinese ? '看 Web3 榜单' : 'Open Web3 ranking'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/how-to-choose-ai-tools'
              ctaId='web3_guide_selection_guide'
              ctaLabel='Web3 guide selection guide'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '回到选型指南' : 'Back to selection guide'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-tools-for-web3-comparison'
              ctaId='web3_guide_comparison'
              ctaLabel='Web3 guide comparison'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看 Web3 对比页' : 'Web3 comparison'}
            </TrackableCtaLink>
          </div>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {quickStarts.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className='rounded-xl border border-white bg-white p-4 shadow-sm transition hover:bg-slate-50'
              >
                <p className='text-sm font-semibold text-slate-950'>{item.title}</p>
                <p className='mt-2 text-sm leading-6 text-slate-600'>{item.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        <GuideEvidencePanel
          locale={locale}
          checkedAt={checkedAt}
          scope={
            isChinese
              ? '这页优先判断 Web3 工具是否真的能接入链上数据、钱包、协议研究和团队工作流，而不是只看概念。'
              : 'This page checks whether a Web3 tool truly fits on-chain data, wallets, protocol research, and team workflows instead of just sounding promising.'
          }
          decisionSteps={
            isChinese
              ? [
                  '先判断你要的是链上分析、钱包监控，还是协议研究。',
                  '如果方向已经清楚，先去更窄的 Web3 榜单或对比页收缩 shortlist。',
                  '如果还要和团队确认数据源和使用方式，再回到这里看导出、历史和价格层。',
                ]
              : [
                  'First decide whether you need on-chain analysis, wallet monitoring, or protocol research.',
                  'If the direction is already clear, move to a narrower Web3 ranking or comparison page to shrink the shortlist.',
                  'If you still need team sign-off on data sources and usage, come back here for exports, history, and pricing tiers.',
                ]
          }
          items={[
            {
              label: isChinese ? '验证范围' : 'Checked scope',
              value: isChinese
                ? '链上数据、钱包、协议、API + 榜单'
                : 'On-chain data, wallets, protocols, APIs + rankings',
              note: isChinese
                ? `当前可参考分类信号有 ${categories.length} 个，继续把真实链上流程放前面。`
                : `${categories.length} category signals are available, and real on-chain workflow should stay up front.`,
            },
            {
              label: isChinese ? '索引策略' : 'Indexing strategy',
              value: isChinese ? '核心 Web3 入口保留索引' : 'Core Web3 entry kept indexable',
              note: isChinese
                ? '它和 Web3 榜单、对比页一起，组成差异化搜索入口。'
                : 'It works with rankings and comparisons as a differentiated search entry path.',
            },
            {
              label: isChinese ? '下一步补强' : 'Next enrichment',
              value: isChinese
                ? '补真实链上场景、验证、最近检查'
                : 'Add real on-chain scenarios, verification, and recent checks',
              note: isChinese
                ? '后续会继续补评论、收藏和 owner 认领信号。'
                : 'Next, comments, saves, and owner-claim signals should be added.',
            },
          ]}
          signalCards={[
            {
              label: isChinese ? '价格信号' : 'Pricing signal',
              value: isChinese
                ? '先看 API、历史数据和导出是否单独收费'
                : 'Check whether API, history, and exports are separately billed',
              note: isChinese
                ? 'Web3 工具最容易把关键能力放在更高价层。'
                : 'Web3 tools often place the most important capabilities in higher tiers.',
            },
            {
              label: isChinese ? '更新信号' : 'Freshness signal',
              value: isChinese
                ? '看链支持、研究模板和告警是否持续更新'
                : 'Check whether chain support, research templates, and alerts are actively updated',
              note: isChinese
                ? '链上数据和协议变化快，过期很容易误导。'
                : 'On-chain data and protocols move fast, so stale tools can mislead quickly.',
            },
            {
              label: isChinese ? '风险信号' : 'Risk signal',
              value: isChinese
                ? '来源不清、覆盖不稳就先降级'
                : 'If sources are unclear or coverage is unstable, downgrade it',
              note: isChinese ? '数据可信度比界面更重要。' : 'Data trust matters more than the interface.',
            },
          ]}
        />
        <section className='mt-6 grid gap-4 rounded-[18px] border border-cyan-200 bg-cyan-50/70 p-6 shadow-sm md:grid-cols-3'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '最近验证' : 'Last checked'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>2026-07-18</p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? `Web3 入口已按真实链上数据、钱包和协议工作流重新核对，当前可参考分类信号 ${categories.length} 个。`
                : `The Web3 entry has been rechecked against real on-chain data, wallet, and protocol workflows, with ${categories.length} category signals available.`}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '当前判断' : 'Current judgment'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-700'>
              {isChinese
                ? '保留索引，继续强调链上数据和团队工作流。'
                : 'Keep it indexable and keep emphasizing on-chain data and team workflows.'}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '下一步' : 'Next step'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-700'>
              {isChinese
                ? '补一个真实链上研究或钱包监控案例。'
                : 'Add one real on-chain research or wallet monitoring case.'}
            </p>
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

        <section className='mt-8 rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '高意图入口' : 'High-intent path'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese
              ? '如果你已经确认要找 Web3 工具，先走榜单再进对比'
              : 'If Web3 is already the lane, open the ranking before the comparison'}
          </h2>
          <div className='mt-4 grid gap-3 md:grid-cols-3'>
            <Link
              href='/best-ai-tools/ai-web3-tools'
              className='rounded-xl border border-white bg-white p-4 shadow-sm hover:bg-slate-50'
            >
              <p className='text-sm font-semibold text-slate-950'>{isChinese ? 'Web3 榜单' : 'Web3 ranking'}</p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '先看高相关候选，再决定要不要进入更细的研究、监控和分析对比。'
                  : 'Start with the highest-fit candidates, then decide whether you need narrower research, monitoring, or analytics comparisons.'}
              </p>
            </Link>
            <Link
              href='/guides/ai-tools-for-web3-comparison'
              className='rounded-xl border border-white bg-white p-4 shadow-sm hover:bg-slate-50'
            >
              <p className='text-sm font-semibold text-slate-950'>{isChinese ? 'Web3 对比页' : 'Web3 comparison'}</p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '当你已经有几款候选，直接横向比较研究、钱包和协议相关能力。'
                  : 'Once you already have a few candidates, compare research, wallet, and protocol capabilities side by side.'}
              </p>
            </Link>
            <Link
              href='/categories/web3?sort=popular'
              className='rounded-xl border border-white bg-white p-4 shadow-sm hover:bg-slate-50'
            >
              <p className='text-sm font-semibold text-slate-950'>{isChinese ? 'Web3 分类' : 'Web3 category'}</p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '如果你更想直接刷真实条目，就从分类页继续扩 shortlist。'
                  : 'If you prefer browsing real listings first, use the category page to widen the shortlist.'}
              </p>
            </Link>
          </div>
        </section>

        <section className='mt-8 rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '高意图榜单' : 'High-intent ranking'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese
              ? '先看榜单，再决定是链上分析、钱包还是研究'
              : 'Start with the ranking, then decide whether analytics, wallets, or research is the lane'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经知道 Web3 是主方向，先看榜单会比直接翻分类更快收窄 shortlist。'
              : 'If Web3 is already the main direction, the ranking gets you to a shorter shortlist faster than browsing categories first.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-web3-tools',
                title: isChinese ? 'Web3 工具榜单' : 'Web3 tools ranking',
                desc: isChinese ? '先收窄到更高相关候选。' : 'Start with the most relevant candidates first.',
              },
              {
                href: '/guides/ai-tools-for-web3-comparison',
                title: isChinese ? 'Web3 工具对比' : 'Web3 tools comparison',
                desc: isChinese
                  ? '链上数据、钱包和协议一起看。'
                  : 'Compare on-chain data, wallets, and protocols together.',
              },
              {
                href: '/guides/ai-tools-for-on-chain-analysis-comparison',
                title: isChinese ? '链上分析对比' : 'On-chain analysis comparison',
                desc: isChinese
                  ? '如果重点是地址、资金流和协议行为。'
                  : 'Best when addresses, fund flow, and protocol behavior matter.',
              },
              {
                href: '/guides/ai-tools-for-crypto-research-comparison',
                title: isChinese ? 'Crypto 研究对比' : 'Crypto research comparison',
                desc: isChinese
                  ? '如果重点偏项目判断和研究整合。'
                  : 'Useful when project analysis and synthesis are the real need.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`web3_tools_ranking_${item.href.split('/').pop()}`}
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

        <section className='mt-8 rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '直接进入对比' : 'Jump into comparison'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese
              ? '如果你已经知道自己要比什么，就直接进下一页'
              : 'If you already know what to compare, go straight to the next page'}
          </h2>
          <div className='mt-4 grid gap-3 md:grid-cols-3'>
            <Link
              href='/best-ai-tools/ai-web3-tools'
              className='rounded-xl border border-white bg-white p-4 shadow-sm hover:bg-slate-50'
            >
              <p className='text-sm font-semibold text-slate-950'>{isChinese ? 'Web3 榜单' : 'Web3 ranking'}</p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '先把高相关候选看一遍，再决定进入哪种更窄的 Web3 对比。'
                  : 'Review the highest-fit candidates first, then decide which narrower Web3 comparison to open.'}
              </p>
            </Link>
            <Link
              href='/guides/ai-tools-for-web3-comparison'
              className='rounded-xl border border-white bg-white p-4 shadow-sm hover:bg-slate-50'
            >
              <p className='text-sm font-semibold text-slate-950'>{isChinese ? 'Web3 总对比' : 'Web3 comparison'}</p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '适合还没完全确定自己更偏链上分析、钱包监控还是研究。'
                  : 'Best if you still need a broad side-by-side view across research, wallet, and protocol workflows.'}
              </p>
            </Link>
            <Link
              href='/guides/ai-tools-for-on-chain-analysis-comparison'
              className='rounded-xl border border-white bg-white p-4 shadow-sm hover:bg-slate-50'
            >
              <p className='text-sm font-semibold text-slate-950'>
                {isChinese ? '链上分析对比' : 'On-chain analysis comparison'}
              </p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '当你的核心问题已经是地址、流向和协议行为时，这页更高意图。'
                  : 'A better fit once the real need is addresses, fund flow, and protocol behavior.'}
              </p>
            </Link>
          </div>
        </section>

        <section className='mt-8 rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '先看这些决策点' : 'Start with these decision points'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese ? '先判断你真正要解决的 Web3 工作' : 'First decide what Web3 job you are really solving'}
          </h2>
          <div className='mt-4 grid gap-3 lg:grid-cols-3'>
            <div className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
              <p className='text-sm font-semibold text-slate-950'>
                {isChinese ? '链上研究与分析' : 'On-chain research and analysis'}
              </p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '如果你在看地址、资金流、协议行为，先走研究和链上分析入口。'
                  : 'If your work is about addresses, fund flow, or protocol behavior, go through research and on-chain analysis first.'}
              </p>
            </div>
            <div className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
              <p className='text-sm font-semibold text-slate-950'>
                {isChinese ? '钱包监控与资产变化' : 'Wallet monitoring and asset changes'}
              </p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '如果你更关心资产波动、持仓和提醒，就继续看钱包监控相关对比。'
                  : 'If asset changes, holdings, and alerts matter more, move into wallet monitoring comparisons.'}
              </p>
            </div>
            <div className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
              <p className='text-sm font-semibold text-slate-950'>
                {isChinese ? '开发接入与自动化' : 'Developer integration and automation'}
              </p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '如果你要把 Web3 数据接进产品或脚本，优先看 API、导出和自动化能力。'
                  : 'If you need to plug Web3 data into products or scripts, prioritize APIs, exports, and automation.'}
              </p>
            </div>
          </div>
          <div className='mt-5 flex flex-wrap gap-3'>
            <Link
              href='/guides/ai-tools-for-web3-comparison'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '进入 Web3 对比页' : 'Open Web3 comparison'}
              <ExternalLink className='size-4' />
            </Link>
            <Link
              href='/guides/ai-tools-for-on-chain-analysis-comparison'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看链上分析对比' : 'On-chain analysis comparison'}
            </Link>
            <Link
              href='/guides/ai-tools-for-wallet-monitoring-comparison'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看钱包监控对比' : 'Wallet monitoring comparison'}
            </Link>
          </div>
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
              href: '/best-ai-tools/ai-web3-tools',
              title: isChinese ? 'Web3 工具榜单' : 'Web3 tools ranking',
              description: isChinese
                ? '先快速收窄到更高相关的候选，再决定进入哪条对比路径。'
                : 'Narrow to the most relevant candidates first, then choose the comparison path that fits.',
            },
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
              ? '如果你已经确认自己要找的是 Web3 工具，下一步就进入榜单、分类和精准搜索，开始比较真实候选。'
              : 'Once Web3 is clearly the lane, the next step is to use the ranking, category, and focused search to compare real candidates.'
          }
          nextLinks={[
            {
              href: '/best-ai-tools/ai-web3-tools',
              title: isChinese ? '进入 Web3 榜单' : 'Open the Web3 ranking',
              description: isChinese
                ? '直接看更高相关的 Web3 候选集合。'
                : 'Start with the highest-fit Web3 shortlist.',
            },
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
        <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_web3' />
      </div>
    </>
  );
}
