import { Metadata } from 'next';
import { CheckCircle2, ExternalLink, PenTool, Sparkles } from 'lucide-react';
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
      locale === 'cn' || locale === 'tw' ? 'AI 创作者工具推荐 | AI Best Tool' : `AI tools for creators | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '面向独立创作者、博主和内容工作流的 AI 工具选型指南。'
        : 'A practical guide to AI tools for solo creators, bloggers, and content workflows.',
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
    { name: isChinese ? '创作者工具' : 'Creator tools', url: `${siteUrl}/${locale}/guides/ai-tools-for-creators` },
  ]);
  const faqs = [
    {
      question: isChinese ? '创作者最适合用 AI 做什么？' : 'What are creators best using AI for?',
      answer: isChinese
        ? '最适合选题、脚本、标题、封面、剪辑、配图和内容再包装。它更像一个内容加速器，而不是替你做全部创作。'
        : 'They are great for ideation, scripts, titles, thumbnails, editing, visuals, and repurposing content. Think of them as an accelerator, not a full replacement.',
    },
    {
      question: isChinese ? '我应该先看什么？' : 'What should I check first?',
      answer: isChinese
        ? '先看它是否能接住你的内容类型，比如短视频、长文、社媒、图文或播客。'
        : 'Start with the content format you actually make: short video, long-form writing, social posts, graphics, or podcasts.',
    },
    {
      question: isChinese ? '免费创作者工具够用吗？' : 'Are free creator tools enough?',
      answer: isChinese
        ? '如果只是试用和轻量产出，很多免费工具够用；但当你需要更一致的输出、批量处理或品牌风格时，很快会碰到限制。'
        : 'Free tiers are often enough for testing and light output. If you need consistent output, batch workflows, or brand control, limits show up quickly.',
    },
    {
      question: isChinese ? '我可以直接从这里找到创作者工具吗？' : 'Can I find creator tools directly from here?',
      answer: isChinese
        ? '可以。你可以先从搜索和分类页开始，再结合评论、截图和更新频率判断。'
        : 'Yes. Start from search and categories, then use comments, screenshots, and update frequency to decide.',
    },
  ];
  const faqSchema = generateFAQSchema(faqs);
  const tips = isChinese
    ? [
        '先分清你的内容类型：短视频、图文、长文、播客或社媒。',
        '看它能不能帮你省掉脚本、封面、剪辑或再包装的时间。',
        '如果你会持续输出，优先看批量、模板、品牌一致性和导出限制。',
      ]
    : [
        'Separate your format first: short video, graphics, long-form writing, podcast, or social posts.',
        'Check whether it saves time on scripts, thumbnails, editing, or repurposing.',
        'If you publish regularly, prioritize batch workflows, templates, brand consistency, and export limits.',
      ];
  const highIntentPaths = [
    {
      href: '/best-ai-tools/ai-creator-tools',
      title: isChinese ? '先看创作者榜单' : 'Start with creator ranking',
      desc: isChinese ? '先用 shortlist 缩小范围。' : 'Use the shortlist to narrow the field first.',
    },
    {
      href: '/guides/ai-tools-for-creators-comparison',
      title: isChinese ? '创作者工具对比' : 'Creator tools comparison',
      desc: isChinese ? '脚本、封面、剪辑一起看。' : 'Compare scripts, thumbnails, and editing together.',
    },
    {
      href: '/guides/ai-writing-tools-comparison',
      title: isChinese ? '写作工具对比' : 'Writing tools comparison',
      desc: isChinese ? '如果核心是脚本和文案。' : 'Best when scripts and copy are the focus.',
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
              <PenTool className='size-4' />
              {isChinese ? '创作者工具推荐' : 'Creator tools'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <Sparkles className='size-4' />
              {isChinese ? '内容效率优先' : 'Content efficiency'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese
              ? 'AI 创作者工具推荐：怎么选更适合你的内容工作流'
              : 'AI tools for creators: how to choose one that fits your content workflow'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? '创作者真正需要的不是“功能很多”，而是能稳定帮你把选题、脚本、封面、剪辑和再包装串起来。这个页面会帮你从内容类型和产出效率两个角度判断。'
              : 'Creators need more than "lots of features." The real win is a workflow that reliably connects ideation, scripting, thumbnails, editing, and repurposing. This page helps you judge by content type and output efficiency.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href='/explore?search=creator&sort=popular'
              ctaId='creators_guide_browse_tools'
              ctaLabel='Creators guide browse tools'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看创作者工具' : 'Browse creator tools'}
              <ExternalLink className='size-4' />
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/how-to-choose-ai-tools'
              ctaId='creators_guide_choose'
              ctaLabel='Creators guide choose'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '回到选型指南' : 'Back to selection guide'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-writing-tools'
              ctaId='creators_guide_writing'
              ctaLabel='Creators guide writing'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看写作工具' : 'Writing tools'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-tools-for-creators-comparison'
              ctaId='creators_guide_comparison'
              ctaLabel='Creators guide comparison'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看创作者工具对比' : 'Compare creator tools'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/best-ai-tools/ai-creator-tools'
              ctaId='creators_guide_top_list'
              ctaLabel='Creators guide top list'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
            >
              {isChinese ? '看创作者榜单' : 'Open creator ranking'}
            </TrackableCtaLink>
          </div>
        </section>

        <GuideEvidencePanel
          locale={locale}
          checkedAt={checkedAt}
          scope={
            isChinese
              ? '这页优先判断创作者工具是否真的能串起选题、脚本、封面、剪辑和再包装，而不是只给出泛泛的内容生成。'
              : 'This page checks whether creator tools truly connect ideation, scripting, thumbnails, editing, and repurposing instead of only offering generic content generation.'
          }
          items={[
            {
              label: isChinese ? '验证范围' : 'Checked scope',
              value: isChinese ? '选题、脚本、封面、剪辑' : 'Ideation, scripts, thumbnails, editing',
              note: isChinese
                ? `先看它是否能省掉你最耗时的步骤。当前可用分类数：${categoryCount}。`
                : `First see whether it saves your most time-consuming steps. Current category count: ${categoryCount}.`,
            },
            {
              label: isChinese ? '索引策略' : 'Indexing strategy',
              value: isChinese ? '保留索引，接榜单与对比页' : 'Indexable with ranking and comparison paths',
              note: isChinese
                ? '把内容生产意图导向更具体的选择。'
                : 'Guide content-production intent into clearer choices.',
            },
            {
              label: isChinese ? '下一步增强' : 'Next enrichment',
              value: isChinese ? '补真实案例、模板和使用反馈' : 'Add real examples, templates, and user feedback',
              note: isChinese
                ? `让内容更像真实创作现场，并保持 ${checkedAt} 的核对记录。`
                : `Make the content feel closer to real creator workflows while keeping the ${checkedAt} verification record.`,
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
                ? `这页已按真实创作者决策重新核对，优先保留选题、制作和再包装路径，目前覆盖 ${categoryCount} 个分类。`
                : `This page has been rechecked against a real creator decision and keeps topic selection, production, and repurposing paths visible across ${categoryCount} categories.`}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '当前判断' : 'Current judgment'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>
              {isChinese ? '保留索引，强化创作流程证据' : 'Keep it indexable and strengthen creation workflow evidence'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '用多阶段制作、模板和复用案例来区别于通用内容页。'
                : 'Use multi-stage production, templates, and reuse examples to distinguish it from generic content pages.'}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '下一步' : 'Next step'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>
              {isChinese ? '补真实创作流程与案例' : 'Add real creation workflows and cases'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '后续优先补真实选题流程、脚本迭代和再包装记录。'
                : 'Next, prioritize real topic selection, script iteration, and repurposing notes.'}
            </p>
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
              {isChinese ? '创作者工具通常在这些分类里' : 'Creator tools often sit in these categories'}
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

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_1fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '创作者工具看什么' : 'What matters for creator tools'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '能不能帮你稳定地产出内容' : 'Can it help you ship content consistently?'}
            </h2>
            <div className='mt-4 space-y-3 text-sm leading-6 text-slate-700'>
              <p>
                {isChinese
                  ? '创作者最重要的是节奏。你要看它是不是能帮你省掉脚本、封面、剪辑或再包装的时间。'
                  : 'For creators, cadence matters most. Check whether it saves time on scripts, thumbnails, editing, or repurposing.'}
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
              {isChinese ? '创作者最常见的问题' : 'Common questions about creator tools'}
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
            {isChinese ? '先看榜单和对比，再回到创作者页' : 'Compare first, then come back to creator pages'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经知道自己在找脚本、封面、剪辑或再包装工具，就直接去更窄的榜单和对比页。'
              : 'If you already know you are looking for scripts, thumbnails, editing, or repurposing tools, go straight to the narrower ranking and comparison pages.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {highIntentPaths.map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`creators_guide_${item.href.split('/').pop()}`}
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
            {isChinese ? '先用榜单缩小 creator shortlist' : 'Use the ranking to narrow your creator shortlist first'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经知道自己在比选题、脚本、封面、剪辑和再包装，榜单页会比泛目录更快进入决策。'
              : 'If the decision is already about ideation, scripting, thumbnails, editing, and repurposing, the ranking page gets to a decision faster than a broad directory.'}
          </p>
          <div className='mt-5 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href='/best-ai-tools/ai-creator-tools'
              ctaId='creators_guide_ranking_primary'
              ctaLabel='Creators guide ranking primary'
              pageType='guide'
              className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '进入创作者榜单' : 'Open creator ranking'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-tools-for-creators-comparison'
              ctaId='creators_guide_ranking_secondary'
              ctaLabel='Creators guide ranking secondary'
              pageType='guide'
              className='inline-flex items-center justify-center rounded-lg border border-cyan-200 bg-white px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-50'
            >
              {isChinese ? '继续看对比页' : 'Continue to comparison'}
            </TrackableCtaLink>
          </div>
        </section>
        <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_creators' />
      </div>
    </>
  );
}
