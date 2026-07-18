import { Metadata } from 'next';
import { BadgeDollarSign, ExternalLink, Search, Wallet } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { getNoindexMetadata } from '@/lib/seo/indexing';
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
        ? 'AI Crypto 研究工具推荐 | AI Best Tool'
        : `AI tools for crypto research | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '面向加密研究、链上跟踪和市场分析的 AI 工具选型指南。'
        : 'A practical guide to AI tools for crypto research, on-chain tracking, and market analysis.',
    ...getNoindexMetadata(),
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
    { name: isChinese ? '选型指南' : 'Guides', url: `${siteUrl}/${locale}/guides/how-to-choose-ai-tools` },
    {
      name: isChinese ? '加密研究工具' : 'Crypto research tools',
      url: `${siteUrl}/${locale}/guides/ai-tools-for-crypto-research`,
    },
  ]);

  const faqs = [
    {
      question: isChinese ? 'Crypto 研究工具最适合用来做什么？' : 'What are crypto research tools best used for?',
      answer: isChinese
        ? '通常用于价格监控、代币研究、链上数据分析、地址追踪、项目筛选和市场情报整理。'
        : 'They are commonly used for price monitoring, token research, on-chain analysis, address tracking, project screening, and market intelligence.',
    },
    {
      question: isChinese ? '我应该先看什么？' : 'What should I check first?',
      answer: isChinese
        ? '先看它是否支持你关注的链、交易所、数据源和导出方式。'
        : 'Start with supported chains, exchanges, data sources, and export options.',
    },
    {
      question: isChinese ? '免费版够用吗？' : 'Is a free tier enough?',
      answer: isChinese
        ? '适合做基础观察；如果你需要更长历史、更多监控指标或 API，通常需要升级。'
        : 'Good for basic observation. Longer history, more monitoring signals, and API access usually require paid plans.',
    },
    {
      question: isChinese ? '我可以直接从这里找到 Crypto 工具吗？' : 'Can I find crypto tools directly from here?',
      answer: isChinese
        ? '可以。你可以先从搜索和分类页开始，再结合评论、截图和更新频率判断。'
        : 'Yes. Start from search and categories, then judge with comments, screenshots, and update frequency.',
    },
  ];

  const tips = isChinese
    ? [
        '先分清你是在看代币、钱包、链上活动还是市场情报。',
        '看它支持的数据源是否覆盖你常用的平台。',
        '如果要给团队使用，优先看 API、导出和监控能力。',
      ]
    : [
        'Separate the use case first: tokens, wallets, on-chain activity, or market intelligence.',
        'Check whether the data sources cover the platforms you actually use.',
        'For team use, prioritize API access, exports, and monitoring.',
      ];

  return (
    <>
      <StructuredDataServer data={breadcrumbSchema} />
      <StructuredDataServer data={generateFAQSchema(faqs)} />
      <div className='theme-page mx-auto max-w-6xl px-4 py-8 lg:px-6 lg:py-12'>
        <section className='rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm lg:p-10'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700'>
              <BadgeDollarSign className='size-4' />
              {isChinese ? 'Crypto 研究工具推荐' : 'Crypto research tools'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <Wallet className='size-4' />
              {isChinese ? '市场与链上结合' : 'Market plus on-chain'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese
              ? 'AI Crypto 研究工具推荐：从代币观察到链上跟踪，怎么选更合适'
              : 'AI tools for crypto research: how to choose for token watching and on-chain tracking'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? 'Crypto 研究工具重点不是“信息多”，而是能不能稳定连接你关注的数据源，并且方便你做观察、筛选和追踪。'
              : 'Crypto research tools are not just about having lots of info. They need reliable access to the data sources you care about and make observation, filtering, and tracking easy.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href='/explore?search=crypto&sort=popular'
              ctaId='crypto_research_guide_browse_tools'
              ctaLabel='Crypto research guide browse tools'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看 Crypto 工具' : 'Browse crypto tools'}
              <ExternalLink className='size-4' />
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/best-ai-tools/ai-web3-tools'
              ctaId='crypto_research_guide_top_list'
              ctaLabel='Crypto research guide Web3 top list'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
            >
              {isChinese ? '看 Web3 榜单' : 'Open Web3 ranking'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-tools-for-web3'
              ctaId='crypto_research_guide_web3'
              ctaLabel='Crypto research guide Web3 guide'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '回到 Web3 指南' : 'Back to Web3 guide'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-tools-for-crypto-research-comparison'
              ctaId='crypto_research_guide_comparison'
              ctaLabel='Crypto research guide comparison'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看 Crypto 对比页' : 'Crypto comparison'}
            </TrackableCtaLink>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '判断顺序' : 'How to judge'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '先看数据源，再看追踪和提醒' : 'Start with data sources, then tracking and alerts'}
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
              {isChinese ? 'Crypto 工具通常在这些分类里' : 'Crypto tools often sit in these categories'}
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
            {isChinese ? '高意图榜单' : 'High-intent ranking'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese ? '先用榜单缩小 crypto shortlist' : 'Use the ranking to narrow your crypto shortlist first'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经知道自己在找代币研究、链上跟踪或市场情报工具，榜单页会比泛目录更快进入决策。'
              : 'If the decision is already about token research, on-chain tracking, or market intelligence, the ranking page gets to a decision faster than a broad directory.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-web3-tools',
                title: isChinese ? 'Web3 榜单' : 'Web3 ranking',
                desc: isChinese ? '先从更高相关的候选开始。' : 'Start with the highest-fit shortlist first.',
              },
              {
                href: '/guides/ai-tools-for-crypto-research-comparison',
                title: isChinese ? 'Crypto 研究对比' : 'Crypto research comparison',
                desc: isChinese ? '市场研究、链上跟踪和框架判断。' : 'Market research, on-chain tracking, and framing.',
              },
              {
                href: '/guides/ai-tools-for-token-research-comparison',
                title: isChinese ? '代币研究对比' : 'Token research comparison',
                desc: isChinese ? '当目标收窄到具体 token。' : 'Best when the target narrows to specific tokens.',
              },
              {
                href: '/guides/ai-tools-for-wallet-research-comparison',
                title: isChinese ? '钱包研究对比' : 'Wallet research comparison',
                desc: isChinese
                  ? '当重点转向地址画像和资金路径。'
                  : 'Best when the focus shifts to address profiles and fund paths.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`crypto_research_guide_${item.href.split('/').pop()}`}
                ctaLabel={item.title}
                pageType='guide'
                className='rounded-xl border border-white bg-white p-4 shadow-sm hover:bg-slate-50'
              >
                <p className='text-sm font-semibold text-slate-950'>{item.title}</p>
                <p className='mt-2 text-sm leading-6 text-slate-600'>{item.desc}</p>
              </TrackableCtaLink>
            ))}
          </div>
          <div className='mt-5 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href='/best-ai-tools/ai-web3-tools'
              ctaId='crypto_research_guide_top_list'
              ctaLabel='Crypto research guide top list'
              pageType='guide'
              className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '进入 Web3 榜单' : 'Open the Web3 ranking'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/submit'
              ctaId='crypto_research_guide_submit'
              ctaLabel='Crypto research guide submit'
              pageType='guide'
              className='inline-flex items-center justify-center rounded-lg border border-cyan-200 bg-white px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-50'
            >
              {isChinese ? '提交你的工具' : 'Submit your tool'}
            </TrackableCtaLink>
          </div>
        </section>

        <GuideEvidencePanel
          locale={locale}
          checkedAt={checkedAt}
          scope={
            isChinese
              ? '这页优先检查页面是否能帮助用户完成真实 crypto 研究判断：数据源、链上追踪、市场情报和导出能力，而不是只看信息量。'
              : 'This page prioritizes whether the guide helps with a real crypto-research decision: data sources, on-chain tracking, market intelligence, and export ability rather than raw information volume.'
          }
          items={[
            {
              label: isChinese ? '判断维度' : 'Decision signals',
              value: isChinese ? '数据源、链上、情报、导出' : 'Sources, on-chain, intelligence, exports',
              note: isChinese
                ? `重点看它是否能支撑持续研究，而不只是一次性浏览。当前可用分类数：${categoryCount}。`
                : `We care about whether it supports ongoing research, not just one-time browsing. Current category count: ${categoryCount}.`,
            },
            {
              label: isChinese ? '索引策略' : 'Indexing strategy',
              value: isChinese ? '核心页保留索引' : 'Keep the core page indexable',
              note: isChinese
                ? '把研究意图写清楚，减少与代币页的相互竞争。'
                : 'Make the research intent explicit so it overlaps less with token-specific pages.',
            },
            {
              label: isChinese ? '下一步补强' : 'Next enrichment',
              value: isChinese ? '补真实研究案例' : 'Add real research cases',
              note: isChinese
                ? `后续优先补研究笔记、链上样例和监控清单，并保持 ${checkedAt} 的核对记录。`
                : `Next, priority additions are research notes, on-chain examples, and monitoring checklists while keeping the ${checkedAt} verification record.`,
            },
          ]}
          signalCards={[
            {
              label: isChinese ? '价格信号' : 'Pricing signal',
              value: isChinese ? '先看免费研究量和 API 限额' : 'Check free research volume and API limits first',
              note: isChinese
                ? '研究工具往往把深度功能放进更高价层。'
                : 'Research tools often reserve deep features for higher tiers.',
            },
            {
              label: isChinese ? '更新信号' : 'Freshness signal',
              value: isChinese
                ? '看研究源和链上情报是否持续更新'
                : 'Check whether research sources and on-chain intelligence are updated',
              note: isChinese
                ? '研究结论会被更新频率直接影响。'
                : 'Research quality is directly affected by update frequency.',
            },
            {
              label: isChinese ? '风险信号' : 'Risk signal',
              value: isChinese ? '没有可追溯来源就先别放前排' : 'Do not rank it highly without traceable sources',
              note: isChinese
                ? '研究页最怕“看起来很对”但证据不够。'
                : 'The biggest risk is something that looks right but lacks evidence.',
            },
          ]}
          decisionSteps={[
            isChinese
              ? '先判断你要的是市场研究、链上追踪，还是赛道情报。'
              : 'First decide whether you need market research, on-chain tracking, or sector intelligence.',
            isChinese
              ? '如果目标已经很明确，就先去更窄的榜单和对比页。'
              : 'If the target is already clear, go to the narrower ranking and comparison pages first.',
            isChinese
              ? '如果还要留给团队协作，再回到研究页补案例、来源和导出证据。'
              : 'If team collaboration still matters, come back to the research page for cases, sources, and export evidence.',
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
                ? `这页已按真实 Crypto 研究决策重新核对，优先保留项目资料、链上跟踪和情报入口，目前覆盖 ${categoryCount} 个分类。`
                : `This page has been rechecked against a real crypto-research decision and keeps project materials, on-chain tracking, and intelligence entry points visible across ${categoryCount} categories.`}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '当前判断' : 'Current judgment'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>
              {isChinese ? '保留索引，强化研究信号' : 'Keep it indexable and strengthen research signals'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '用市场研究、链上跟踪和赛道判断来和泛 Web3 页区分。'
                : 'Use market research, on-chain tracking, and sector judgment to distinguish it from broad Web3 pages.'}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '下一步' : 'Next step'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>
              {isChinese ? '补真实研究案例和验证' : 'Add real research cases and verification'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '后续优先补真实研究笔记、链上样例和结论复盘。'
                : 'Next, prioritize real research notes, on-chain examples, and retrospective conclusions.'}
            </p>
          </div>
        </section>

        <GuideActionSection
          locale={locale}
          eyebrow={isChinese ? '先看这些工具' : 'Recommended tools'}
          title={isChinese ? '更贴近 Crypto 研究工作的入口' : 'Real entry points for crypto research workflows'}
          description={
            isChinese
              ? '如果你更关心项目资料、链上跟踪、市场情报和赛道判断，这几款工具会比泛 Web3 页更快把范围收窄。'
              : 'If project materials, on-chain tracking, market intelligence, and sector judgment matter most, these tools narrow the field faster than a broad Web3 page.'
          }
          toolNames={['messari', 'defillama', 'dune', 'nansen']}
          compareEyebrow={isChinese ? '继续比较' : 'Compare next'}
          compareTitle={
            isChinese ? 'Crypto 研究意图更强的下一步入口' : 'Next paths for stronger crypto-research intent'
          }
          compareDescription={
            isChinese
              ? '当你已经明确自己是在做 Crypto 研究，而不是泛浏览，继续进入更窄的比较页会更有效。'
              : 'Once the real job is crypto research rather than broad browsing, narrower comparison pages work better.'
          }
          compareLinks={[
            {
              href: '/best-ai-tools/ai-web3-tools',
              title: isChinese ? 'Web3 工具榜单' : 'Web3 tools ranking',
              description: isChinese
                ? '先收窄到更高相关的 Web3 候选，再进入更细的研究对比。'
                : 'Start with the highest-fit Web3 candidates, then move into the narrower research comparison paths.',
            },
            {
              href: '/guides/ai-tools-for-crypto-research-comparison',
              title: isChinese ? 'Crypto 研究工具对比' : 'Crypto research comparison',
              description: isChinese
                ? '适合直接横向看市场研究、链上跟踪和研究框架。'
                : 'A direct side-by-side path for market research, on-chain tracking, and research framing.',
            },
            {
              href: '/guides/ai-tools-for-token-research-comparison',
              title: isChinese ? '代币研究工具对比' : 'Token research comparison',
              description: isChinese
                ? '如果问题开始收窄到具体 token、项目比较和基本面判断，这页更合适。'
                : 'More useful when the decision narrows into specific tokens, project comparison, and fundamentals judgment.',
            },
            {
              href: '/guides/ai-tools-for-wallet-research-comparison',
              title: isChinese ? '钱包研究工具对比' : 'Wallet research comparison',
              description: isChinese
                ? '如果研究重点开始转向地址画像、资金路径和钱包行为，这页更贴近目标。'
                : 'A better fit when research shifts into address profiles, fund paths, and wallet behavior.',
            },
          ]}
          nextEyebrow={isChinese ? '下一步入口' : 'Where to go next'}
          nextTitle={
            isChinese
              ? '研究方向明确后，继续这样收窄'
              : 'How to narrow the space once crypto research is clearly the lane'
          }
          nextDescription={
            isChinese
              ? '如果你已经明确在找 Crypto 研究工具，下一步就看 Web3 榜单、分类和搜索结果继续筛。'
              : 'Once crypto research is clearly the lane, the next step is to use the Web3 ranking, category, and search results to compare real candidates.'
          }
          nextLinks={[
            {
              href: '/best-ai-tools/ai-web3-tools',
              title: isChinese ? '进入 Web3 榜单' : 'Open the Web3 ranking',
              description: isChinese
                ? '先从更高相关的 Web3 候选集合开始。'
                : 'Start with the highest-fit Web3 shortlist.',
            },
            {
              href: '/categories/web3?sort=popular',
              title: isChinese ? '进入 Web3 分类' : 'Open the Web3 category',
              description: isChinese
                ? '回到 Web3 目录继续看真实研究条目。'
                : 'Return to the Web3 directory for real research-oriented listings.',
            },
            {
              href: '/explore?search=crypto&sort=popular',
              title: isChinese ? '搜索更多 Crypto 工具' : 'Search more crypto tools',
              description: isChinese
                ? '回到 Explore，用更窄的 crypto 关键词扩大 shortlist。'
                : 'Return to Explore and widen the shortlist with crypto-specific search.',
            },
          ]}
        />

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_1fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? 'Crypto 工具看什么' : 'What matters for crypto tools'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '能不能稳定帮你做研究和监控' : 'Can it reliably help with research and monitoring?'}
            </h2>
            <div className='mt-4 space-y-3 text-sm leading-6 text-slate-700'>
              <p>
                {isChinese
                  ? 'Crypto 研究工具最重要的是数据源稳定、提醒清晰、过滤能力强。'
                  : 'Stability of data sources, clear alerts, and strong filtering matter most.'}
              </p>
              <p>
                {isChinese
                  ? '如果你做研究或监控，优先看历史查询、导出、API 和告警能力。'
                  : 'If you do research or monitoring, prioritize historical queries, exports, API access, and alerts.'}
              </p>
            </div>
          </div>

          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '常见问题' : 'FAQ'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? 'Crypto 工具最常见的问题' : 'Common questions about crypto tools'}
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
        <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_crypto_research' />
      </div>
    </>
  );
}
