import { Metadata } from 'next';
import { ExternalLink, Layers3, SearchCheck, Wallet } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';
import { getAllCategories, getLocalizedField } from '@/lib/services/categories';
import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideActionSection from '@/components/guides/GuideActionSection';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';
import { StructuredDataServer } from '@/components/seo/StructuredData';
import { Link } from '@/app/navigation';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Metadata.home' });

  return {
    title:
      locale === 'cn' || locale === 'tw'
        ? 'AI 钱包研究工具推荐 | AI Best Tool'
        : `AI tools for wallet research | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '面向地址研究、钱包画像、链上行为判断和线索发现的 AI 工具选型指南。'
        : 'A practical guide to AI tools for address research, wallet profiling, behavior analysis, and on-chain clue discovery.',
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
      name: isChinese ? '钱包研究工具' : 'Wallet research tools',
      url: `${siteUrl}/${locale}/guides/ai-tools-for-wallet-research`,
    },
  ]);
  const faqs = [
    {
      question: isChinese ? '钱包研究工具最适合做什么？' : 'What are wallet research tools best for?',
      answer: isChinese
        ? '适合做地址画像、行为跟踪、资金来往判断、链上线索发现和研究笔记整理。'
        : 'They are best for address profiling, behavior tracking, fund-flow interpretation, on-chain clue discovery, and research note gathering.',
    },
    {
      question: isChinese ? '它和钱包监控有什么区别？' : 'How is this different from wallet monitoring?',
      answer: isChinese
        ? '钱包监控更偏提醒和异动，钱包研究更偏理解这个地址“是谁、在做什么、和谁有关”。'
        : 'Wallet monitoring leans more toward alerts and anomalies, while wallet research is more about understanding who the address is, what it is doing, and who it connects to.',
    },
    {
      question: isChinese ? '我先看什么维度？' : 'What should I check first?',
      answer: isChinese
        ? '先看地址画像能力、标签和关系线索，再看历史行为和多链支持。'
        : 'Start with address profiling, labels, and relationship clues, then move to historical behavior and multichain support.',
    },
    {
      question: isChinese ? '适合内容研究和投研吗？' : 'Is this useful for research and analysis work?',
      answer: isChinese
        ? '适合，尤其当你需要把地址行为和项目、叙事或资金流联系起来时。'
        : 'Yes, especially when you need to connect address behavior with projects, narratives, or capital flows.',
    },
  ];
  const tips = isChinese
    ? [
        '先分清你要的是地址画像、关系线索，还是资金路径研究。',
        '看它是否有足够好的标签体系，而不是只有裸交易数据。',
        '如果你会长期跟踪某类钱包，优先看历史、搜索和笔记整理效率。',
      ]
    : [
        'Separate address profiling, relationship clues, and fund-path research before comparing tools.',
        'Look for strong labeling systems rather than only raw transaction data.',
        'If you track wallet clusters over time, prioritize history depth, search, and note-taking efficiency.',
      ];
  const highIntentPaths = [
    {
      href: '/best-ai-tools/ai-web3-tools',
      title: isChinese ? '先看 Web3 榜单' : 'Start with Web3 ranking',
      desc: isChinese ? '先用 shortlist 缩小范围。' : 'Use the shortlist to narrow the field first.',
    },
    {
      href: '/guides/ai-tools-for-wallet-research-comparison',
      title: isChinese ? '钱包研究对比' : 'Wallet research comparison',
      desc: isChinese ? '画像、标签和关系线索一起看。' : 'Compare profiling, labels, and clues together.',
    },
    {
      href: '/guides/ai-tools-for-wallet-monitoring-comparison',
      title: isChinese ? '钱包监控对比' : 'Wallet monitoring comparison',
      desc: isChinese ? '如果重点转向提醒和异动。' : 'Best when alerts and anomalies matter more.',
    },
    {
      href: '/guides/ai-tools-for-crypto-portfolio-tracking-comparison',
      title: isChinese ? '资产追踪对比' : 'Portfolio tracking comparison',
      desc: isChinese ? '如果重点转向组合和持仓视图。' : 'Useful when the real job is portfolio and holdings views.',
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
              {isChinese ? '钱包研究工具推荐' : 'Wallet research tools'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <Wallet className='size-4' />
              {isChinese ? '画像与线索优先' : 'Profiling and clues first'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese
              ? 'AI 钱包研究工具推荐：从地址画像到链上线索，怎么选更合适'
              : 'AI tools for wallet research: how to choose for address profiles and on-chain clues'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? '钱包研究工具真正要解决的，不是“看到了哪些交易”，而是能不能把地址行为、关系和上下文慢慢拼成一个更可靠的判断。'
              : 'Wallet research tools are not mainly about seeing transactions. The real job is turning behavior, relationships, and context into a more reliable interpretation.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href='/explore?search=wallet&sort=popular'
              ctaId='wallet_research_guide_browse_tools'
              ctaLabel='Wallet research guide browse tools'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看钱包研究工具' : 'Browse wallet research tools'}
              <ExternalLink className='size-4' />
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/best-ai-tools/ai-web3-tools'
              ctaId='wallet_research_guide_top_list'
              ctaLabel='Wallet research guide Web3 top list'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
            >
              {isChinese ? '看 Web3 榜单' : 'Open Web3 ranking'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-tools-for-web3'
              ctaId='wallet_research_guide_web3'
              ctaLabel='Wallet research guide Web3 guide'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '回到 Web3 指南' : 'Back to Web3 guide'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-tools-for-wallet-research-comparison'
              ctaId='wallet_research_guide_comparison'
              ctaLabel='Wallet research guide comparison'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看钱包研究对比页' : 'Wallet research comparison'}
            </TrackableCtaLink>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '判断顺序' : 'How to judge'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese
                ? '先看地址画像，再看关系和行为'
                : 'Start with address profiles, then relationships and behavior'}
            </h2>
            <div className='mt-4 space-y-3'>
              {tips.map((tip) => (
                <div key={tip} className='rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700'>
                  <div className='flex items-start gap-3'>
                    <SearchCheck className='mt-0.5 size-4 shrink-0 text-emerald-600' />
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
              {isChinese ? '钱包研究工具通常在这些分类里' : 'Wallet research tools often sit in these categories'}
            </h2>
            <div className='mt-4 grid gap-2'>
              {categories
                .filter((category) => ['web3', 'research', 'life-assistant'].includes(String(category.slug)))
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
            {isChinese ? '高意图路径' : 'High-intent path'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese ? '先看榜单和对比，再回到钱包研究页' : 'Compare first, then come back to wallet research pages'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经知道自己是在做地址研究，就别在总览页停太久，直接去更窄的榜单和对比页。'
              : 'If wallet research is already the real task, move straight into the narrower ranking and comparison pages.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {highIntentPaths.map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`wallet_research_guide_${item.href.split('/').pop()}`}
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
            {isChinese ? '高意图榜单' : 'High-intent ranking'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese
              ? '先用榜单缩小钱包研究 shortlist'
              : 'Use the ranking to narrow your wallet research shortlist first'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经明确是在比地址画像、关系线索和行为判断，先看榜单会比泛 Web3 目录更快进入决策。'
              : 'If the decision is already about address profiling, relationship clues, and behavior interpretation, the ranking gets you to a decision faster than a broad Web3 directory.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-web3-tools',
                title: isChinese ? 'Web3 工具榜单' : 'Web3 tools ranking',
                desc: isChinese
                  ? '先从更高相关的 Web3 候选开始。'
                  : 'Start with the highest-fit Web3 candidates first.',
              },
              {
                href: '/guides/ai-tools-for-wallet-research-comparison',
                title: isChinese ? '钱包研究对比' : 'Wallet research comparison',
                desc: isChinese ? '画像、标签和线索一起看。' : 'Compare profiling, labels, and clues together.',
              },
              {
                href: '/guides/ai-tools-for-wallet-monitoring-comparison',
                title: isChinese ? '钱包监控对比' : 'Wallet monitoring comparison',
                desc: isChinese ? '如果你开始更关心提醒和异动。' : 'Useful when alerts and anomalies matter more.',
              },
              {
                href: '/guides/ai-tools-for-crypto-portfolio-tracking-comparison',
                title: isChinese ? '资产追踪对比' : 'Portfolio tracking comparison',
                desc: isChinese
                  ? '如果你想把研究和组合看板一起看。'
                  : 'Helpful when research and portfolio views overlap.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`wallet_research_guide_ranking_${item.href.split('/').pop()}`}
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
          title={
            isChinese ? '更贴近地址研究与钱包画像的入口' : 'Real entry points for address research and wallet profiling'
          }
          description={
            isChinese
              ? '如果你更关心地址画像、链上关系和行为判断，这几款工具会比泛 Web3 页更快把范围收窄。'
              : 'If address profiles, on-chain relationships, and behavioral interpretation matter most, these tools narrow the field faster than a broad Web3 page.'
          }
          toolNames={['arkham', 'nansen', 'debank', 'bubblemaps']}
          compareEyebrow={isChinese ? '继续比较' : 'Compare next'}
          compareTitle={isChinese ? '钱包研究意图更强的下一步入口' : 'Next paths for stronger wallet-research intent'}
          compareDescription={
            isChinese
              ? '当你已经明确自己是在做地址研究，而不是异动提醒或组合看板，继续进入更窄的比较页会更有效。'
              : 'Once the real job is address research rather than alerts or portfolio dashboards, narrower comparison pages work better.'
          }
          compareLinks={[
            {
              href: '/best-ai-tools/ai-web3-tools',
              title: isChinese ? 'Web3 工具榜单' : 'Web3 tools ranking',
              description: isChinese
                ? '先看更高相关的 Web3 候选，再决定是否进入钱包研究的窄对比。'
                : 'Start with the highest-fit Web3 candidates, then decide whether you need the narrower wallet-research comparison.',
            },
            {
              href: '/guides/ai-tools-for-wallet-research-comparison',
              title: isChinese ? '钱包研究工具对比' : 'Wallet research comparison',
              description: isChinese
                ? '适合直接横向看画像、标签和链上线索能力。'
                : 'A direct side-by-side path for profiling, labeling, and on-chain clue discovery.',
            },
            {
              href: '/guides/ai-tools-for-wallet-monitoring-comparison',
              title: isChinese ? '钱包监控工具对比' : 'Wallet monitoring comparison',
              description: isChinese
                ? '如果你发现真正需求更偏提醒和异动，这页更合适。'
                : 'More useful if the real decision shifts toward alerts and anomalies.',
            },
            {
              href: '/guides/ai-tools-for-crypto-portfolio-tracking-comparison',
              title: isChinese ? '资产追踪工具对比' : 'Portfolio tracking comparison',
              description: isChinese
                ? '如果你更关心组合和持仓看板，这页更贴近目标。'
                : 'Move there if the real decision is more about holdings and portfolio views.',
            },
          ]}
          nextEyebrow={isChinese ? '下一步入口' : 'Where to go next'}
          nextTitle={
            isChinese
              ? '钱包研究方向明确后，继续这样收窄'
              : 'How to narrow the space once wallet research is clearly the lane'
          }
          nextDescription={
            isChinese
              ? '如果你已经确认自己要找的是钱包研究工具，下一步就看 Web3 榜单、分类和精准搜索继续筛。'
              : 'Once wallet research is clearly the lane, the next step is to use the Web3 ranking, category, and focused search to compare real candidates.'
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
                ? '回到 Web3 目录继续看真实钱包研究条目。'
                : 'Return to the Web3 directory for real wallet-research candidates.',
            },
            {
              href: '/explore?search=wallet&sort=popular',
              title: isChinese ? '搜索更多钱包工具' : 'Search more wallet tools',
              description: isChinese
                ? '回到 Explore，用更窄的钱包关键词扩大 shortlist。'
                : 'Return to Explore and widen the shortlist with wallet-specific search.',
            },
          ]}
        />
        <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_wallet_research' />
      </div>
    </>
  );
}
