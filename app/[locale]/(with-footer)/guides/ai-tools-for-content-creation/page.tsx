import { Metadata } from 'next';
import { CheckCircle2, ExternalLink, Film, Sparkles } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';
import { getAllCategories, getLocalizedField } from '@/lib/services/categories';
import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';
import { StructuredDataServer } from '@/components/seo/StructuredData';
import { Link } from '@/app/navigation';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({
    locale,
    namespace: 'Metadata.home',
  });

  return {
    title:
      locale === 'cn' || locale === 'tw'
        ? 'AI 内容创作工具推荐 | AI Best Tool'
        : `AI tools for content creation | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '面向脚本、封面、改写、批量发布和多渠道内容的 AI 工具选型指南。'
        : 'A practical guide to AI tools for scripts, thumbnails, rewriting, batch publishing, and multi-channel content.',
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
      name: isChinese ? '内容创作工具' : 'Content creation tools',
      url: `${siteUrl}/${locale}/guides/ai-tools-for-content-creation`,
    },
  ]);
  const faqs = [
    {
      question: isChinese ? '内容创作工具最适合做什么？' : 'What are content creation tools best for?',
      answer: isChinese
        ? '最适合脚本、封面、改写、批量发布和多渠道内容再包装。它们更像内容生产流程的一部分，而不是单纯聊天工具。'
        : 'They are great for scripts, thumbnails, rewriting, batch publishing, and repurposing content across channels. Think workflow, not just chat.',
    },
    {
      question: isChinese ? '我应该先看什么？' : 'What should I check first?',
      answer: isChinese
        ? '先看你的内容类型：短视频、图文、长文、播客或社媒。不同内容类型会决定你要优先看什么能力。'
        : 'Start with your format: short video, graphics, long-form writing, podcasts, or social posts. Different formats demand different capabilities.',
    },
    {
      question: isChinese
        ? '写作工具和内容创作工具有什么区别？'
        : 'How are writing and content creation tools different?',
      answer: isChinese
        ? '写作工具更偏文字起草和改写；内容创作工具更强调脚本、封面、批量和跨渠道发布。'
        : 'Writing tools focus more on drafting and rewriting. Content creation tools lean toward scripts, thumbnails, batch work, and cross-channel publishing.',
    },
    {
      question: isChinese ? '我可以直接从这里找到工具吗？' : 'Can I find tools directly from here?',
      answer: isChinese
        ? '可以。你可以先从搜索和分类页开始，再结合评论、截图和更新频率判断。'
        : 'Yes. Start from search and categories, then use comments, screenshots, and update frequency to decide.',
    },
  ];
  const faqSchema = generateFAQSchema(faqs);
  const tips = isChinese
    ? [
        '先分清你的内容类型：短视频、图文、长文、播客或社媒。',
        '看它是否能帮你省掉脚本、封面、剪辑或再包装的时间。',
        '如果你会持续输出，优先看批量、模板、品牌一致性和导出限制。',
      ]
    : [
        'Separate your format first: short video, graphics, long-form writing, podcast, or social posts.',
        'Check whether it saves time on scripts, thumbnails, editing, or repurposing.',
        'If you publish regularly, prioritize batch workflows, templates, brand consistency, and export limits.',
      ];
  const highIntentPaths = [
    {
      href: '/best-ai-tools/ai-content-creation-tools',
      title: isChinese ? '先看内容创作榜单' : 'Start with content ranking',
      desc: isChinese ? '先用 shortlist 缩小范围。' : 'Use the shortlist to narrow the field first.',
    },
    {
      href: '/guides/ai-tools-for-content-creation-comparison',
      title: isChinese ? '内容创作对比页' : 'Content creation comparison',
      desc: isChinese ? '脚本、封面和发布一起看。' : 'Compare scripts, thumbnails, and publishing together.',
    },
    {
      href: '/guides/ai-writing-tools-comparison',
      title: isChinese ? '写作工具对比' : 'Writing tools comparison',
      desc: isChinese ? '如果你的核心是文案和脚本。' : 'Best when copy and scripting are the focus.',
    },
    {
      href: '/guides/ai-video-tools-comparison',
      title: isChinese ? '视频工具对比' : 'Video tools comparison',
      desc: isChinese ? '如果重点转向剪辑和视频生产。' : 'Use this when editing and video production matter more.',
    },
  ];

  return (
    <>
      <StructuredDataServer data={breadcrumbSchema} />
      <StructuredDataServer data={faqSchema} />
      <div className='theme-page mx-auto max-w-6xl px-4 py-8 lg:px-6 lg:py-12'>
        <section className='rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm lg:p-10'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700'>
              <Film className='size-4' />
              {isChinese ? '内容创作工具推荐' : 'Content creation tools'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <Sparkles className='size-4' />
              {isChinese ? '内容工作流优先' : 'Workflow first'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese
              ? 'AI 内容创作工具推荐：怎么选才适合你的生产流程'
              : 'AI tools for content creation: how to choose one that fits your production workflow'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? '真正能帮上忙的内容创作工具，不只是会写字，而是能把脚本、封面、改写和多渠道发布串成一个更稳定的流程。'
              : 'The useful tools do more than write. They connect scripts, thumbnails, rewriting, and multi-channel publishing into a stable workflow.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href='/explore?search=content&sort=popular'
              ctaId='content_creation_guide_browse_tools'
              ctaLabel='Content creation guide browse tools'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看内容创作工具' : 'Browse content creation tools'}
              <ExternalLink className='size-4' />
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-writing-tools'
              ctaId='content_creation_guide_writing'
              ctaLabel='Content creation guide writing'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看写作工具' : 'Writing tools'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-tools-for-content-creation-comparison'
              ctaId='content_creation_guide_comparison'
              ctaLabel='Content creation guide comparison'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看内容创作工具对比' : 'Compare content creation tools'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/best-ai-tools/ai-content-creation-tools'
              ctaId='content_creation_guide_top_list'
              ctaLabel='Content creation guide top list'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
            >
              {isChinese ? '看内容创作榜单' : 'Open content creation ranking'}
            </TrackableCtaLink>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '判断顺序' : 'How to judge'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '先看内容类型，再看省时点' : 'Start with content type, then time saved'}
            </h2>
            <div className='mt-4 space-y-3'>
              {tips.map((tip) => (
                <div key={tip} className='rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700'>
                  <div className='flex items-start gap-3'>
                    <CheckCircle2 className='mt-0.5 size-4 shrink-0 text-emerald-600' />
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
              {isChinese ? '内容创作工具通常在这些分类里' : 'Content creation tools often sit in these categories'}
            </h2>
            <div className='mt-4 grid gap-2'>
              {categories.slice(0, 6).map((category) => (
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

        <GuideEvidencePanel
          locale={locale}
          checkedAt={checkedAt}
          scope={
            isChinese
              ? '这页优先检查页面是否能帮助用户完成真实内容创作决策：是否有明确内容格式、批量发布、品牌一致性、导出限制和后续进入对比页的路径。'
              : 'This page prioritizes whether the guide helps with a real content-creation decision: content format, batch publishing, brand consistency, export limits, and next steps into comparison pages.'
          }
          items={[
            {
              label: isChinese ? '判断维度' : 'Decision signals',
              value: isChinese ? '格式、批量、品牌、导出' : 'Format, batch, brand, export',
              note: isChinese
                ? `重点看工具是否能把脚本、封面和发布串成稳定流程。当前可用分类数：${categoryCount}。`
                : `We care about whether the tool turns scripts, thumbnails, and publishing into a stable workflow. Current category count: ${categoryCount}.`,
            },
            {
              label: isChinese ? '索引策略' : 'Indexing strategy',
              value: isChinese ? '保持可索引' : 'Keep it indexable',
              note: isChinese
                ? '让内容创作意图清晰，减少和写作、视频页的重复。'
                : 'Keep the content-creation intent clear and reduce overlap with writing or video pages.',
            },
            {
              label: isChinese ? '下一步补强' : 'Next enrichment',
              value: isChinese ? '补真实工作流' : 'Add real workflows',
              note: isChinese
                ? `后续优先补真实案例、品牌模板和批量发布经验，并保持 ${checkedAt} 的核对记录。`
                : `Next, priority additions are real use cases, brand templates, and batch-publishing notes while keeping the ${checkedAt} verification record.`,
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
                ? `这页已按真实内容创作决策重新核对，优先保留高意图入口和可索引主体，目前覆盖 ${categoryCount} 个分类。`
                : `This page has been rechecked against a real content-creation decision and keeps the high-intent entry points indexable across ${categoryCount} categories.`}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '当前判断' : 'Current judgment'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>
              {isChinese ? '保留索引，强化真实工作流证据' : 'Keep it indexable and strengthen workflow evidence'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '用批量发布、品牌模板和导出限制来区分这页与写作页、视频页。'
                : 'Use batch publishing, brand templates, and export limits to distinguish this page from writing and video pages.'}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '下一步' : 'Next step'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>
              {isChinese ? '补真实案例和发布经验' : 'Add real cases and publishing notes'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '后续优先补真实创作流程、模板示例和多渠道发布经验。'
                : 'Next, prioritize real production workflows, template examples, and multi-channel publishing notes.'}
            </p>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_1fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '内容创作看什么' : 'What matters for content creation'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '能不能帮你稳定地产出内容' : 'Can it help you ship content consistently?'}
            </h2>
            <div className='mt-4 space-y-3 text-sm leading-6 text-slate-700'>
              <p>
                {isChinese
                  ? '内容创作最重要的是节奏。你要看它是不是能帮你省掉脚本、封面、剪辑或再包装的时间。'
                  : 'For content creation, cadence matters most. Check whether it saves time on scripts, thumbnails, editing, or repurposing.'}
              </p>
              <p>
                {isChinese
                  ? '如果你会持续发布，优先看批量、模板、品牌一致性和导出限制。'
                  : 'If you publish regularly, prioritize batch workflows, templates, brand consistency, and export limits.'}
              </p>
            </div>
          </div>

          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '常见问题' : 'FAQ'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '内容创作最常见的问题' : 'Common questions about content creation tools'}
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

        <section className='mt-8 rounded-[18px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '高意图路径' : 'High-intent path'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese ? '先看榜单和对比，再回到内容创作页' : 'Compare first, then come back to content creation pages'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经知道自己在找脚本、封面、批量发布或视频生产工具，就直接去更窄的榜单和对比页。'
              : 'If you already know you are looking for scripts, thumbnails, batch publishing, or video production tools, move straight into the narrower ranking and comparison pages.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {highIntentPaths.map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`content_creation_guide_${item.href.split('/').pop()}`}
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

        <section className='mt-8 rounded-[18px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '高意图榜单' : 'High-intent ranking'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese
              ? '先用榜单缩小 content creation shortlist'
              : 'Use the ranking to narrow your content creation shortlist first'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经知道自己在比脚本、封面、改写和多渠道发布，榜单页会比泛目录更快进入决策。'
              : 'If the decision is already about scripts, thumbnails, rewriting, and multi-channel publishing, the ranking page gets to a decision faster than a broad directory.'}
          </p>
          <div className='mt-5 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href='/best-ai-tools/ai-creator-tools'
              ctaId='content_creation_guide_ranking_primary'
              ctaLabel='Content creation guide ranking primary'
              pageType='guide'
              className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '进入创作者榜单' : 'Open creator ranking'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-tools-for-content-creation-comparison'
              ctaId='content_creation_guide_ranking_secondary'
              ctaLabel='Content creation guide ranking secondary'
              pageType='guide'
              className='inline-flex items-center justify-center rounded-lg border border-cyan-200 bg-white px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-50'
            >
              {isChinese ? '继续看对比页' : 'Continue to comparison'}
            </TrackableCtaLink>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-3'>
          <Link
            href='/guides/ai-writing-tools'
            className='group rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md'
          >
            <div className='flex items-start justify-between gap-3'>
              <div>
                <p className='text-lg font-semibold text-slate-950 group-hover:text-cyan-700'>
                  {isChinese ? '看写作工具推荐' : 'Open writing tools'}
                </p>
                <p className='mt-2 text-sm leading-6 text-slate-600'>
                  {isChinese
                    ? '如果你的重点还是长文、文案和改写，这条路更窄更快。'
                    : 'A tighter path when drafting, copy, and rewriting are the real need.'}
                </p>
              </div>
              <Sparkles className='mt-1 size-5 shrink-0 text-slate-400 transition group-hover:text-cyan-700' />
            </div>
          </Link>
          <Link
            href='/guides/ai-tools-for-content-creation-comparison'
            className='group rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md'
          >
            <div className='flex items-start justify-between gap-3'>
              <div>
                <p className='text-lg font-semibold text-slate-950 group-hover:text-cyan-700'>
                  {isChinese ? '看内容创作对比' : 'Open content creation comparison'}
                </p>
                <p className='mt-2 text-sm leading-6 text-slate-600'>
                  {isChinese
                    ? '把脚本、封面、批量和多渠道发布放在一起看。'
                    : 'Compare scripts, thumbnails, batch work, and publishing cadence side by side.'}
                </p>
              </div>
              <Sparkles className='mt-1 size-5 shrink-0 text-slate-400 transition group-hover:text-cyan-700' />
            </div>
          </Link>
          <Link
            href='/guides/ai-tools-for-creators'
            className='group rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md'
          >
            <div className='flex items-start justify-between gap-3'>
              <div>
                <p className='text-lg font-semibold text-slate-950 group-hover:text-cyan-700'>
                  {isChinese ? '看创作者工具推荐' : 'Open creator tools'}
                </p>
                <p className='mt-2 text-sm leading-6 text-slate-600'>
                  {isChinese
                    ? '如果你做的内容更偏创作者工作流，这页会更宽一点。'
                    : 'A broader path when your work spans ideation, scripting, editing, and repurposing.'}
                </p>
              </div>
              <Sparkles className='mt-1 size-5 shrink-0 text-slate-400 transition group-hover:text-cyan-700' />
            </div>
          </Link>
        </section>

        <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_content_creation' />
      </div>
    </>
  );
}
