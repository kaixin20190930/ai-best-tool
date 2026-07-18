import { Metadata } from 'next';
import { ArrowRight, ExternalLink, FileSearch, Search, ShieldCheck } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { getNoindexMetadata } from '@/lib/seo/indexing';
import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';
import { getAllCategories, getLocalizedField } from '@/lib/services/categories';
import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideActionSection from '@/components/guides/GuideActionSection';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
import { StructuredDataServer } from '@/components/seo/StructuredData';
import { Link } from '@/app/navigation';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Metadata.home' });

  return {
    title:
      locale === 'cn' || locale === 'tw' ? 'AI 研究工具推荐 | AI Best Tool' : `AI tools for research | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '面向资料检索、信息核对、证据整理和研究工作流的 AI 工具指南，先看榜单再进对比页。'
        : 'A practical guide to AI tools for research, evidence-checking, analysis, and information discovery, with a path from guide to ranking and comparison.',
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
    { name: isChinese ? '指南' : 'Guides', url: `${siteUrl}/${locale}/guides` },
    { name: isChinese ? '研究工具' : 'Research tools', url: `${siteUrl}/${locale}/guides/ai-tools-for-research` },
  ]);
  const faqs = [
    {
      question: isChinese ? 'AI 研究工具最适合做什么？' : 'What are AI research tools best for?',
      answer: isChinese
        ? '它们最适合做资料发现、快速概览、信息核对、竞品扫描、主题理解和建立研究起点。'
        : 'They are best for discovery, quick overviews, evidence-checking, competitive scanning, topic understanding, and building a research starting point.',
    },
    {
      question: isChinese ? '研究工具和聊天工具有什么区别？' : 'How are research tools different from chat tools?',
      answer: isChinese
        ? '研究工具更强调来源、证据、检索效率和信息发现；聊天工具更强调生成、对话和综合输出。'
        : 'Research tools emphasize sources, evidence, discovery, and retrieval speed, while chat tools focus more on generation, conversation, and synthesis.',
    },
    {
      question: isChinese ? '我应该先看什么？' : 'What should I check first?',
      answer: isChinese
        ? '先看它是否能帮你更快找到可靠信息，再看输出是否带来源、是否适合你的研究深度和工作流。'
        : 'Start with whether it helps you find reliable information faster, then check source visibility, depth, and workflow fit.',
    },
    {
      question: isChinese ? '免费版够用吗？' : 'Is a free tier enough?',
      answer: isChinese
        ? '轻量调研通常够用，但如果你做高频跟踪、深度分析或团队协作，通常会更快遇到限制。'
        : 'Free tiers can be enough for light research, but deeper analysis, frequent tracking, and team workflows usually hit limits faster.',
    },
  ];
  const tips = isChinese
    ? [
        '先分清你是做资料发现、证据核对，还是深度分析。',
        '优先看来源是否透明、信息是否能回溯，而不只是回答是否“像真的”。',
        '如果你会反复做研究，重点看收藏、导出、历史记录和后续整理能力。',
      ]
    : [
        'Separate discovery, evidence-checking, and deeper analysis before comparing tools.',
        'Prioritize source transparency and traceability, not only whether the answer sounds convincing.',
        'If research is repeatable work, focus on exports, saved history, and downstream organization.',
      ];
  const quickStarts = [
    {
      href: '/best-ai-tools/ai-research-tools',
      title: isChinese ? '研究榜单' : 'Research ranking',
      desc: isChinese ? '先看 shortlist，再决定要不要深比。' : 'Start with the shortlist before comparing deeper.',
    },
    {
      href: '/guides/ai-tools-for-research-comparison',
      title: isChinese ? '研究对比页' : 'Research comparison',
      desc: isChinese ? '资料发现、来源和证据核对。' : 'Discovery, sources, and evidence-checking.',
    },
    {
      href: '/ai/perplexity',
      title: 'Perplexity',
      desc: isChinese ? '更适合带来源的起点研究。' : 'A source-friendly starting point for research.',
    },
    {
      href: '/ai/elicit',
      title: 'Elicit',
      desc: isChinese ? '更适合证据驱动和文献梳理。' : 'Good for evidence-driven literature review.',
    },
  ];
  const highIntentPaths = [
    {
      href: '/best-ai-tools/ai-research-tools',
      title: isChinese ? '先看研究榜单' : 'Start with research ranking',
      desc: isChinese ? '先从更高相关的 shortlist 开始。' : 'Start with the highest-fit shortlist first.',
    },
    {
      href: '/guides/ai-tools-for-research-comparison',
      title: isChinese ? '再看研究对比页' : 'Open research comparison',
      desc: isChinese
        ? '资料发现、证据核对和分析路径一页收敛。'
        : 'Narrow discovery, evidence-checking, and analysis paths in one place.',
    },
    {
      href: '/guides/ai-seo-tools-comparison',
      title: isChinese ? 'SEO 研究对比' : 'SEO research comparison',
      desc: isChinese
        ? '适合关键词、SERP 和内容结构研究。'
        : 'Best for keywords, SERP, and content structure research.',
    },
    {
      href: '/guides/ai-tools-for-crypto-research-comparison',
      title: isChinese ? 'Crypto 研究对比' : 'Crypto research comparison',
      desc: isChinese ? '项目、协议和 narrative 跟踪更顺。' : 'Better for project, protocol, and narrative tracking.',
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
              <Search className='size-4' />
              {isChinese ? '研究工具推荐' : 'Research tools'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <ShieldCheck className='size-4' />
              {isChinese ? '来源与证据优先' : 'Evidence-first'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese
              ? 'AI 研究工具推荐：怎么选更适合资料发现和证据核对'
              : 'AI tools for research: how to choose for discovery and evidence-checking'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? '研究工具的价值不只是“能回答问题”，而是能不能帮你更快发现信息、核对来源，并建立可继续深入的研究路径。'
              : 'The value of research tools is not only that they answer questions. It is whether they help you discover information faster, verify sources, and build a path for deeper analysis.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href='/explore?search=research&sort=popular'
              ctaId='research_guide_browse_tools'
              ctaLabel='Research guide browse tools'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看研究类工具' : 'Browse research tools'}
              <ExternalLink className='size-4' />
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-seo-tools'
              ctaId='research_guide_seo'
              ctaLabel='Research guide SEO'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看 SEO 研究工具' : 'SEO research tools'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-tools-for-crypto-research'
              ctaId='research_guide_crypto'
              ctaLabel='Research guide crypto'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看 Crypto 研究工具' : 'Crypto research tools'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/best-ai-tools/ai-research-tools'
              ctaId='research_guide_top_list'
              ctaLabel='Research guide top list'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
            >
              {isChinese ? '看研究榜单' : 'Open research ranking'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/submit'
              ctaId='research_guide_submit'
              ctaLabel='Research guide submit'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
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
              ? '这页优先判断研究工具是否真的能帮助发现资料、核对证据和追溯来源，而不是只会生成看起来正确的答案。'
              : 'This page checks whether a research tool truly helps discover material, verify evidence, and trace sources instead of merely producing plausible answers.'
          }
          signalCards={[
            {
              label: isChinese ? '价格信号' : 'Pricing signal',
              value: isChinese ? '先看免费能否覆盖日常研究' : 'Check whether free use covers daily research',
              note: isChinese
                ? '如果基础查询都开始收费，研究流程很容易被打断。'
                : 'If basic queries already cost money, the research workflow gets interrupted quickly.',
            },
            {
              label: isChinese ? '更新信号' : 'Freshness signal',
              value: isChinese ? '来源和证据要保持新鲜' : 'Sources and evidence need to stay fresh',
              note: isChinese
                ? '研究工具一旦失去追溯性，可信度会掉得很快。'
                : 'Once traceability weakens, trust drops very quickly in research tools.',
            },
            {
              label: isChinese ? '风险信号' : 'Risk signal',
              value: isChinese ? '别被“看起来正确”骗到' : 'Do not trust "looks right" alone',
              note: isChinese
                ? '如果无法回到来源链，先当作高风险。'
                : 'If you cannot trace back to the source chain, treat it as high risk first.',
            },
          ]}
          items={[
            {
              label: isChinese ? '验证范围' : 'Checked scope',
              value: isChinese
                ? '来源、证据、发现、回溯 + 榜单'
                : 'Sources, evidence, discovery, traceability + rankings',
              note: isChinese
                ? `当前能参考的分类信号有 ${categoryCount} 个，研究页继续把来源和证据线索放在前面。`
                : `${categoryCount} category signals are available, and the page keeps source and evidence clues up front.`,
            },
            {
              label: isChinese ? '索引策略' : 'Indexing strategy',
              value: isChinese ? '核心研究入口保留索引' : 'Core research entry kept indexable',
              note: isChinese
                ? '它和研究榜单、对比页一起构成高意图研究入口。'
                : 'It works with rankings and comparisons as a high-intent research entry path.',
            },
            {
              label: isChinese ? '下一步补强' : 'Next enrichment',
              value: isChinese
                ? '补真实案例、来源说明、最近验证'
                : 'Add real cases, source notes, and recent verification',
              note: isChinese
                ? `这页已于 ${checkedAt} 重新核对，后续会把评论、收藏和 owner 信号继续接到这页。`
                : `This page was rechecked on ${checkedAt}, and next comments, saves, and owner signals should be connected to this page.`,
            },
          ]}
          decisionSteps={
            isChinese
              ? ['先确认来源和证据链', '再把 shortlist 缩到更窄的对比页', '最后回到真实条目和评论区做最终判断']
              : [
                  'First check sources and traceability',
                  'Then narrow into a shorter comparison list',
                  'Finally move back to real listings and comments',
                ]
          }
        />

        <section className='mt-6 grid gap-4 rounded-[18px] border border-cyan-200 bg-cyan-50/70 p-6 shadow-sm md:grid-cols-3'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '最近验证' : 'Last checked'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>{checkedAt}</p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? `研究入口已和榜单、对比页和提交路径收口，当前可参考分类信号 ${categoryCount} 个。`
                : `The research entry now aligns with ranking, comparison, and submission paths, with ${categoryCount} category signals in view.`}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '当前判断' : 'Current judgment'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>
              {isChinese ? '保留索引，继续补真实研究证据' : 'Keep it indexable and keep adding real research evidence'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '用来源、证据和回溯记录把它从泛研究页里拉出来。'
                : 'Use sources, evidence, and traceability notes to separate it from generic research pages.'}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '下一步' : 'Next step'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>
              {isChinese ? '补真实证据核对案例' : 'Add a real evidence-checking case'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese ? '先补来源、证据和回溯。' : 'Start with source, evidence, and traceability.'}
            </p>
          </div>
        </section>

        <section className='mt-8 rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '高意图路径' : 'High-intent path'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese ? '先看对比，再回到工具页和提交页' : 'Compare first, then move into tool pages and submission'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经知道自己是要找资料发现、证据核对还是深度分析工具，就不要在总览页停太久，直接去更窄的对比页。'
              : 'If you already know whether you need discovery, evidence-checking, or deeper analysis, do not stay on the overview for long. Move straight into the narrower comparison pages.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/guides/ai-tools-for-research-comparison',
                title: isChinese ? '研究工具对比' : 'Research tools comparison',
                desc: isChinese ? '资料发现与证据核对优先。' : 'Prioritize discovery and evidence-checking.',
              },
              {
                href: '/guides/ai-seo-tools-comparison',
                title: isChinese ? 'SEO 研究对比' : 'SEO research comparison',
                desc: isChinese ? '关键词、SERP 和内容结构。' : 'Keywords, SERP, and content structure.',
              },
              {
                href: '/guides/ai-tools-for-crypto-research-comparison',
                title: isChinese ? 'Crypto 研究对比' : 'Crypto research comparison',
                desc: isChinese ? '项目、协议和 narrative。' : 'Projects, protocols, and narratives.',
              },
              {
                href: '/guides/ai-writing-tools-comparison',
                title: isChinese ? '写作工具对比' : 'Writing tools comparison',
                desc: isChinese ? '研究后快速输出和整理。' : 'Turn research into output faster.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`research_guide_${item.href.split('/').pop()}`}
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
              href='/submit'
              ctaId='research_guide_submit_secondary'
              ctaLabel='Research guide submit secondary'
              pageType='guide'
              className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '提交你的工具' : 'Submit your tool'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/developer/listing'
              ctaId='research_guide_claim'
              ctaLabel='Research guide claim'
              pageType='guide'
              className='inline-flex items-center justify-center rounded-lg border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-800 hover:bg-emerald-50'
            >
              {isChinese ? '认领条目' : 'Claim listing'}
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

        <section className='mt-8 rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '先看这些入口' : 'Start here first'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese
              ? '先走最短路径，再决定要不要继续深比'
              : 'Take the shortest path first, then decide whether to compare deeper'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经知道自己在找资料发现或证据核对工具，这一块会更快把你带回榜单、对比页和相邻研究入口。'
              : 'If you already know you need discovery or evidence-checking tools, this section gets you back to the ranking, comparison, and adjacent research paths faster.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {highIntentPaths.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className='rounded-xl border border-white bg-white p-4 shadow-sm transition hover:border-cyan-200 hover:bg-cyan-50/60'
              >
                <p className='text-sm font-semibold text-slate-950'>{item.title}</p>
                <p className='mt-2 text-sm leading-6 text-slate-600'>{item.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className='mt-8 rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '高意图榜单' : 'High-intent ranking'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese ? '先用榜单缩小 research shortlist' : 'Use the ranking to narrow your research shortlist first'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经知道自己更偏资料发现、证据核对或竞品分析，榜单页会比泛目录更快进入决策。'
              : 'If the decision is already about discovery, evidence-checking, or competitor analysis, the ranking page gets to a decision faster than a broad directory.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-research-tools',
                title: isChinese ? '研究工具榜单' : 'Research tools ranking',
                desc: isChinese ? '直接看高意图 shortlist。' : 'Go straight to the high-intent shortlist.',
              },
              {
                href: '/best-ai-tools/ai-seo-tools',
                title: isChinese ? 'SEO 研究榜单' : 'SEO research ranking',
                desc: isChinese ? '如果关键词和 SERP 是重点。' : 'Best when keywords and SERP are the focus.',
              },
              {
                href: '/guides/ai-tools-for-research-comparison',
                title: isChinese ? '研究工具对比' : 'Research tools comparison',
                desc: isChinese
                  ? '横向看来源、证据和工作流。'
                  : 'Compare sources, evidence, and workflow side by side.',
              },
              {
                href: '/guides/ai-tools-for-crypto-research-comparison',
                title: isChinese ? 'Crypto 研究对比' : 'Crypto research comparison',
                desc: isChinese ? '如果重点偏链上和项目跟踪。' : 'Better for on-chain and project-tracking workflows.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`research_guide_${item.href.split('/').pop()}`}
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

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '判断顺序' : 'How to judge'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '先看来源，再看输出' : 'Start with sources, then the output'}
            </h2>
            <div className='mt-4 space-y-3'>
              {tips.map((tip) => (
                <div key={tip} className='rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700'>
                  <div className='flex items-start gap-3'>
                    <FileSearch className='mt-0.5 size-4 shrink-0 text-emerald-600' />
                    <span>{tip}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className='rounded-[18px] border border-slate-200 bg-slate-50 p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '相关入口' : 'Start here'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '研究类工具通常在这些分类里' : 'Research tools often sit in these categories'}
            </h2>
            <div className='mt-4 grid gap-2'>
              {categories
                .filter((category) => ['research', 'web3', 'text-writing'].includes(String(category.slug)))
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

        <section className='mt-8 rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '下一步怎么走' : 'Next step'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese
              ? '把研究入口接到比较页和真实条目'
              : 'Move from the research guide into comparisons and real listings'}
          </h2>
          <div className='mt-4 grid gap-4 lg:grid-cols-3'>
            <TrackableCtaLink
              href='/guides/ai-tools-for-research-comparison'
              className='group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-white hover:shadow-sm'
              ctaId='research_guide_compare'
              ctaLabel='Research guide compare'
              pageType='guide'
            >
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='text-base font-semibold text-slate-950 group-hover:text-cyan-700'>
                    {isChinese ? '看研究工具对比' : 'Compare research tools'}
                  </p>
                  <p className='mt-2 text-sm leading-6 text-slate-600'>
                    {isChinese
                      ? '如果你已经知道自己在找资料发现或证据核对工具，就直接进对比。'
                      : 'If discovery or evidence-checking is clear already, move straight into comparison.'}
                  </p>
                </div>
                <ArrowRight className='mt-1 size-4 shrink-0 text-slate-400 group-hover:text-cyan-700' />
              </div>
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/categories/research?sort=popular'
              className='group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-white hover:shadow-sm'
              ctaId='research_guide_category'
              ctaLabel='Research guide category'
              pageType='guide'
            >
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='text-base font-semibold text-slate-950 group-hover:text-cyan-700'>
                    {isChinese ? '进入 Research 分类' : 'Open the research category'}
                  </p>
                  <p className='mt-2 text-sm leading-6 text-slate-600'>
                    {isChinese
                      ? '先看真实条目，再回来收敛到更窄的候选集。'
                      : 'Inspect real listings first, then come back to narrow the shortlist.'}
                  </p>
                </div>
                <ArrowRight className='mt-1 size-4 shrink-0 text-slate-400 group-hover:text-cyan-700' />
              </div>
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/explore?search=research&sort=popular'
              className='group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-white hover:shadow-sm'
              ctaId='research_guide_search'
              ctaLabel='Research guide search'
              pageType='guide'
            >
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='text-base font-semibold text-slate-950 group-hover:text-cyan-700'>
                    {isChinese ? '搜索更多研究工具' : 'Search more research tools'}
                  </p>
                  <p className='mt-2 text-sm leading-6 text-slate-600'>
                    {isChinese
                      ? '如果你要扩大候选池，可以回到探索页继续找。'
                      : 'Use Explore to widen the shortlist a little further.'}
                  </p>
                </div>
                <ArrowRight className='mt-1 size-4 shrink-0 text-slate-400 group-hover:text-cyan-700' />
              </div>
            </TrackableCtaLink>
          </div>
        </section>

        <GuideActionSection
          locale={locale}
          eyebrow={isChinese ? '先看这些工具' : 'Recommended tools'}
          title={isChinese ? '更适合研究型工作的工具入口' : 'Tool entry points that fit research-heavy work'}
          description={
            isChinese
              ? '如果你现在是为了资料发现、证据核对、竞品分析或信息整理而来，先从这几类真实工具开始更容易建立判断。'
              : 'If you are here for discovery, evidence-checking, competitor analysis, or information synthesis, these tools are the fastest way to build context.'
          }
          toolNames={['perplexity', 'consensus', 'scite', 'notebooklm']}
          compareEyebrow={isChinese ? '继续比较' : 'Compare next'}
          compareTitle={isChinese ? '再往下走的对比入口' : 'Next comparison paths'}
          compareDescription={
            isChinese
              ? '当你已经明确研究方向后，继续进入更窄的对比页，会比泛泛浏览更快。'
              : 'Once your research direction is clearer, narrower comparison pages are usually more useful than broad browsing.'
          }
          compareLinks={[
            {
              href: '/best-ai-tools/ai-research-tools',
              title: isChinese ? '研究工具榜单' : 'Research tools ranking',
              description: isChinese
                ? '先收窄到更高相关的研究候选，再决定进入哪条更窄的对比路径。'
                : 'Start with the highest-fit research candidates, then choose the narrower comparison path that fits.',
            },
            {
              href: '/guides/ai-tools-for-research-comparison',
              title: isChinese ? '研究工具总对比' : 'Research tools comparison',
              description: isChinese
                ? '适合先快速横向看几款常见研究工具。'
                : 'A fast side-by-side entry for common research tools.',
            },
            {
              href: '/guides/ai-seo-tools-comparison',
              title: isChinese ? 'SEO 研究工具对比' : 'SEO research tools comparison',
              description: isChinese
                ? '适合关键词、SERP 和网站结构研究。'
                : 'Best for keywords, SERP analysis, and site structure research.',
            },
            {
              href: '/guides/ai-tools-for-crypto-research-comparison',
              title: isChinese ? 'Crypto 研究工具对比' : 'Crypto research tools comparison',
              description: isChinese
                ? '适合链上信息、项目和 narrative 跟踪。'
                : 'Best for on-chain, project, and narrative-driven research.',
            },
          ]}
          nextEyebrow={isChinese ? '下一步入口' : 'Where to go next'}
          nextTitle={isChinese ? '读完研究指南后，继续这样往下走' : 'How to continue after the research guide'}
          nextDescription={
            isChinese
              ? '如果你已经确认自己更偏资料发现和证据核对，下一步就看研究榜单、分类和搜索页。'
              : 'If discovery and evidence-checking are clearly your use case, move next into the research ranking, category, and search results.'
          }
          nextLinks={[
            {
              href: '/best-ai-tools/ai-research-tools',
              title: isChinese ? '进入研究榜单' : 'Open the research ranking',
              description: isChinese
                ? '先从更高相关的研究候选集合开始。'
                : 'Start with the highest-fit research shortlist.',
            },
            {
              href: '/categories/research?sort=popular',
              title: isChinese ? '进入 Research 分类' : 'Open the research category',
              description: isChinese
                ? '直接进入研究类目录，继续看更贴合的真实工具。'
                : 'Open the research category to keep comparing better-matched tools.',
            },
            {
              href: '/explore?search=research&sort=popular',
              title: isChinese ? '搜索研究工具' : 'Search research tools',
              description: isChinese
                ? '用关键词回到 Explore 扩大候选范围。'
                : 'Use a research-focused query in Explore to widen the shortlist.',
            },
          ]}
        />

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_1fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '研究工具看什么' : 'What matters for research tools'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '能不能帮你更快得到可信结论' : 'Can it help you reach trustworthy conclusions faster?'}
            </h2>
            <div className='mt-4 space-y-3 text-sm leading-6 text-slate-700'>
              <p>
                {isChinese
                  ? '研究型工具最重要的不是回答“像不像”，而是信息来源是否清楚、范围是否够广，以及后续能不能继续追下去。'
                  : 'The key is not whether the answer sounds convincing, but whether the source is clear, the coverage is broad enough, and the workflow lets you keep digging.'}
              </p>
              <p>
                {isChinese
                  ? '如果你做竞品、SEO、市场、Crypto 或知识型调研，优先看来源可回溯、收藏整理和导出能力。'
                  : 'For SEO, competitive, market, crypto, or knowledge-heavy research, prioritize traceable sources, saved context, and export paths.'}
              </p>
            </div>
          </div>

          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '常见问题' : 'FAQ'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '研究工具最常见的问题' : 'Common questions about research tools'}
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
