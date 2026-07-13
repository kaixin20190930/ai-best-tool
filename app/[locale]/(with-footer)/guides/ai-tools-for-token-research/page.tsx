import { Metadata } from 'next';
import { Coins, ExternalLink, SearchCheck, TrendingUp } from 'lucide-react';
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
        ? 'AI 代币研究工具推荐 | AI Best Tool'
        : `AI tools for token research | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '面向代币观察、叙事跟踪、项目比较和链上信息整理的 AI 工具选型指南。'
        : 'A practical guide to AI tools for token research, narrative tracking, project comparison, and on-chain intelligence workflows.',
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const categories = await getAllCategories(true).catch(() => []);
  const checkedAt = '2026-07-14';
  const categoryCount = categories.length;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${siteUrl}/${locale}` },
    { name: isChinese ? '指南' : 'Guides', url: `${siteUrl}/${locale}/guides` },
    {
      name: isChinese ? '代币研究工具' : 'Token research tools',
      url: `${siteUrl}/${locale}/guides/ai-tools-for-token-research`,
    },
  ]);
  const faqs = [
    {
      question: isChinese ? '代币研究工具最适合做什么？' : 'What are token research tools best for?',
      answer: isChinese
        ? '适合做代币观察、叙事整理、基本面对比、链上行为参考和项目跟踪。'
        : 'They are best for token watching, narrative synthesis, fundamentals comparison, on-chain context, and project tracking.',
    },
    {
      question: isChinese ? '它和泛 Crypto 研究有什么区别？' : 'How is this different from broad crypto research?',
      answer: isChinese
        ? 'Crypto 研究更宽，可能包括协议、钱包、市场和新闻；代币研究更聚焦于具体项目与 token 本身。'
        : 'Crypto research is broader and may include protocols, wallets, markets, and news. Token research is narrower and more focused on specific tokens and projects.',
    },
    {
      question: isChinese ? '我应该先看哪些维度？' : 'What should I check first?',
      answer: isChinese
        ? '先看你更重视代币叙事、基本面、链上持有人结构，还是价格与流动性周边信息。'
        : 'Start by deciding whether the priority is narrative, fundamentals, holder structure, or surrounding price and liquidity context.',
    },
    {
      question: isChinese ? '适合长期跟踪吗？' : 'Is this useful for long-term tracking?',
      answer: isChinese
        ? '很适合，尤其当你要持续比较同赛道项目、跟踪指标变化和观察市场预期时。'
        : 'Yes, especially when you need to compare projects over time, watch metric changes, and follow how market expectations shift.',
    },
  ];
  const tips = isChinese
    ? [
        '先分清你在做的是叙事研究、代币基本面比较，还是链上持有人结构判断。',
        '看它是否能把市场信息、协议指标和链上行为放在一个更可用的视角里。',
        '如果你会持续跟踪一个赛道，优先看历史数据、导出和对比效率。',
      ]
    : [
        'Separate narrative research, token-fundamental comparison, and holder-structure analysis before comparing tools.',
        'Look for tools that connect market context, protocol metrics, and on-chain behavior into one usable view.',
        'If you track a sector over time, prioritize history depth, exports, and comparison efficiency.',
      ];
  const highIntentPaths = [
    {
      href: '/best-ai-tools/ai-web3-tools',
      title: isChinese ? '先看 Web3 榜单' : 'Start with Web3 ranking',
      desc: isChinese ? '先用 shortlist 缩小范围。' : 'Use the shortlist to narrow the field first.',
    },
    {
      href: '/guides/ai-tools-for-token-research-comparison',
      title: isChinese ? '代币研究对比' : 'Token research comparison',
      desc: isChinese ? '项目、指标和研究深度一起看。' : 'Compare projects, metrics, and research depth together.',
    },
    {
      href: '/guides/ai-tools-for-crypto-research-comparison',
      title: isChinese ? 'Crypto 研究对比' : 'Crypto research comparison',
      desc: isChinese
        ? '如果问题更宽，叙事和情报整合也要看。'
        : 'Use this when the question broadens to narratives and synthesis.',
    },
    {
      href: '/guides/ai-tools-for-protocol-analytics-comparison',
      title: isChinese ? '协议分析对比' : 'Protocol analytics comparison',
      desc: isChinese ? '如果重点转向协议健康和使用趋势。' : 'Best when protocol health and usage trends matter more.',
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
              <Coins className='size-4' />
              {isChinese ? '代币研究工具推荐' : 'Token research tools'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <TrendingUp className='size-4' />
              {isChinese ? '代币与项目判断优先' : 'Token and project judgment first'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese
              ? 'AI 代币研究工具推荐：从叙事判断到项目比较，怎么选更合适'
              : 'AI tools for token research: how to choose from narratives to project comparison'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? '代币研究工具真正要解决的，不是给你更多图表，而是帮助你更快把“这个 token 值不值得继续看”判断清楚。'
              : 'Token-research tools are not mainly about showing more charts. The real job is helping you judge faster whether a token or project deserves more of your attention.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href='/explore?search=token&sort=popular'
              ctaId='token_research_guide_browse_tools'
              ctaLabel='Token research guide browse tools'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看代币研究相关工具' : 'Browse token-research tools'}
              <ExternalLink className='size-4' />
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/best-ai-tools/ai-web3-tools'
              ctaId='token_research_guide_top_list'
              ctaLabel='Token research guide Web3 top list'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
            >
              {isChinese ? '看 Web3 榜单' : 'Open Web3 ranking'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-tools-for-crypto-research'
              ctaId='token_research_guide_crypto_research'
              ctaLabel='Token research guide crypto research guide'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '回到 Crypto 研究指南' : 'Back to crypto research guide'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-tools-for-token-research-comparison'
              ctaId='token_research_guide_comparison'
              ctaLabel='Token research guide comparison'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看代币研究对比页' : 'Token research comparison'}
            </TrackableCtaLink>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '判断顺序' : 'How to judge'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '先看研究视角，再看数据深度' : 'Start with the research angle, then data depth'}
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
              {isChinese ? '代币研究工具通常会落在这些分类里' : 'Token-research tools often sit in these categories'}
            </h2>
            <div className='mt-4 grid gap-2'>
              {categories
                .filter((category) => ['web3', 'research', 'developer-tools'].includes(String(category.slug)))
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
            {isChinese ? '先看榜单和对比，再回到代币研究页' : 'Compare first, then come back to token research pages'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经知道自己在看 token 叙事、项目对比或持有人结构，就直接去更窄的榜单和对比页。'
              : 'If the real job is token narratives, project comparison, or holder structure, move straight into the narrower ranking and comparison pages.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {highIntentPaths.map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`token_research_guide_${item.href.split('/').pop()}`}
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
              ? '先用榜单缩小 token research shortlist'
              : 'Use the ranking to narrow your token research shortlist first'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经明确是在做代币研究、项目比较或叙事判断，先看榜单会比只看总览更快进入决策。'
              : 'If the decision is already about token research, project comparison, or narrative judgment, the ranking gets you to a decision faster than an overview alone.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-web3-tools',
                title: isChinese ? 'Web3 榜单' : 'Web3 ranking',
                desc: isChinese ? '先看最值得试的候选。' : 'Start with the most relevant candidates first.',
              },
              {
                href: '/guides/ai-tools-for-token-research-comparison',
                title: isChinese ? '代币研究对比' : 'Token research comparison',
                desc: isChinese
                  ? '项目、指标和研究深度一起看。'
                  : 'Compare projects, metrics, and research depth together.',
              },
              {
                href: '/guides/ai-tools-for-crypto-research-comparison',
                title: isChinese ? 'Crypto 研究对比' : 'Crypto research comparison',
                desc: isChinese
                  ? '如果问题更宽，情报和叙事也要看。'
                  : 'Useful when the question broadens into narratives and synthesis.',
              },
              {
                href: '/guides/ai-tools-for-protocol-analytics-comparison',
                title: isChinese ? '协议分析对比' : 'Protocol analytics comparison',
                desc: isChinese
                  ? '如果重点转向协议健康和趋势。'
                  : 'Useful when protocol health and trends matter more.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`token_research_guide_ranking_${item.href.split('/').pop()}`}
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

        <GuideEvidencePanel
          locale={locale}
          scope={
            isChinese
              ? '这页优先检查页面是否能帮助用户完成真实代币研究判断：数据源、链上追踪、市场情报和导出能力，而不是只看信息量。'
              : 'This page prioritizes whether the guide helps with a real token-research decision: data sources, on-chain tracking, market intelligence, and export ability rather than raw information volume.'
          }
          checkedAt={checkedAt}
          items={[
            {
              label: isChinese ? '判断维度' : 'Decision signals',
              value: isChinese ? '数据源、链上、情报、导出' : 'Sources, on-chain, intelligence, exports',
              note: isChinese
                ? `重点看它是否能支撑持续研究，而不只是一次性浏览；当前分类数 ${categoryCount} 个。`
                : `We care about whether it supports ongoing research, not just one-time browsing; current category count is ${categoryCount}.`,
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
                ? `后续优先补研究笔记、链上样例和监控清单，并保持 ${checkedAt} 的验证记录。`
                : `Next, priority additions are research notes, on-chain examples, and monitoring checklists while keeping the ${checkedAt} verification record.`,
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
                ? `这页已按真实代币研究决策重新核对，优先保留数据源、链上追踪和情报入口；当前分类数 ${categoryCount} 个。`
                : `This page has been rechecked against a real token-research decision and keeps data sources, on-chain tracking, and intelligence entry points visible; current category count is ${categoryCount}.`}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '当前判断' : 'Current judgment'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>
              {isChinese ? '保留索引，强化代币研究证据' : 'Keep it indexable and strengthen token-research evidence'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '用数据源、研究笔记和监控清单来区分它与泛看板页。'
                : 'Use data sources, research notes, and monitoring checklists to distinguish it from broad dashboard pages.'}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '下一步' : 'Next step'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>
              {isChinese ? '补真实研究案例和监控清单' : 'Add real research cases and monitoring checklists'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? `后续优先补真实研究笔记、链上样例和清单，并持续保留 ${checkedAt} 的核对记录。`
                : `Next, prioritize real research notes, on-chain examples, and checklists while keeping the ${checkedAt} check record up to date.`}
            </p>
          </div>
        </section>

        <GuideActionSection
          locale={locale}
          eyebrow={isChinese ? '先看这些工具' : 'Recommended tools'}
          title={isChinese ? '更贴近代币研究的真实入口' : 'Real entry points for token research'}
          description={
            isChinese
              ? '如果你关心的是 token 的基本面、项目比较和市场语境，而不是泛看板浏览，这几款工具会更快把范围收窄。'
              : 'If the real job is token fundamentals, project comparison, and market context rather than broad dashboard browsing, these tools narrow the field faster.'
          }
          toolNames={['messari', 'token-terminal', 'defillama', 'nansen']}
          compareEyebrow={isChinese ? '继续比较' : 'Compare next'}
          compareTitle={isChinese ? '代币研究意图更强的下一步入口' : 'Next paths for stronger token-research intent'}
          compareDescription={
            isChinese
              ? '当你已经明确自己在看 token，而不是泛链上分析或钱包监控，继续进入更窄的比较页会更有效。'
              : 'Once the real job is token research rather than broad on-chain analysis or wallet monitoring, narrower comparison pages work better.'
          }
          compareLinks={[
            {
              href: '/best-ai-tools/ai-web3-tools',
              title: isChinese ? 'Web3 工具榜单' : 'Web3 tools ranking',
              description: isChinese
                ? '先从更高相关的 Web3 候选开始，再继续下钻到代币研究对比。'
                : 'Start with the highest-fit Web3 candidates, then move deeper into token-research comparisons.',
            },
            {
              href: '/guides/ai-tools-for-token-research-comparison',
              title: isChinese ? '代币研究工具对比' : 'Token research comparison',
              description: isChinese
                ? '适合直接横向看项目比较、指标框架和研究深度。'
                : 'A direct side-by-side path for project comparison, metric framing, and research depth.',
            },
            {
              href: '/guides/ai-tools-for-crypto-research-comparison',
              title: isChinese ? 'Crypto 研究工具对比' : 'Crypto research comparison',
              description: isChinese
                ? '如果你发现问题更宽，开始涉及市场叙事和情报整合，这页更合适。'
                : 'More useful if the question broadens into market narratives and research synthesis.',
            },
            {
              href: '/guides/ai-tools-for-protocol-analytics-comparison',
              title: isChinese ? '协议分析工具对比' : 'Protocol analytics comparison',
              description: isChinese
                ? '如果真实研究点更偏协议健康和使用趋势，这页更贴近目标。'
                : 'Move there if the real research question is more about protocol health and usage trends.',
            },
          ]}
        />
        <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_token_research' />
      </div>
    </>
  );
}
