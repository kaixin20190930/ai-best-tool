import { Metadata } from 'next';
import { CheckCircle2, Clapperboard, ExternalLink, Film } from 'lucide-react';
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
        ? 'AI 视频工具推荐 | AI Best Tool'
        : `AI video tools recommendations | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '面向剪辑、生成、配音和营销视频的 AI 工具选型指南。'
        : 'A practical guide to AI tools for editing, generation, voiceover, and marketing videos.',
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
    { name: isChinese ? '视频工具' : 'Video tools', url: `${siteUrl}/${locale}/guides/ai-video-tools` },
  ]);
  const faqs = [
    {
      question: isChinese ? 'AI 视频工具最适合做什么？' : 'What are AI video tools best for?',
      answer: isChinese
        ? '最适合粗剪、字幕、配音、短视频生成、营销视频和内容再包装。它们能明显省时间，但仍建议保留人工审核。'
        : 'They are best for rough cuts, captions, voiceover, short-form generation, marketing clips, and content repurposing. They save time, but human review is still important.',
    },
    {
      question: isChinese ? '我应该先看剪辑还是生成？' : 'Should I focus on editing or generation first?',
      answer: isChinese
        ? '如果你手里已经有素材，先看剪辑、字幕和配音；如果你更想快速从文本或脚本出片，再重点看生成能力。'
        : 'If you already have footage, start with editing, captions, and voiceover. If you want to turn text or scripts into video quickly, focus on generation.',
    },
    {
      question: isChinese ? '免费的视频工具够用吗？' : 'Are free video tools enough?',
      answer: isChinese
        ? '简单剪辑、字幕和试用通常够用；但如果你要批量出片、导出高质量或团队协作，免费额度通常会比较快见底。'
        : 'Free tiers are often enough for basic edits, captions, and testing. If you need bulk output, higher export quality, or collaboration, you may hit limits quickly.',
    },
    {
      question: isChinese ? '我可以直接从这里找视频类工具吗？' : 'Can I find video tools from here directly?',
      answer: isChinese
        ? '可以。你可以从分类页和搜索结果入手，再结合评论、截图和更新频率判断。'
        : 'Yes. Start from categories and search results, then use comments, screenshots, and freshness to decide.',
    },
  ];
  const faqSchema = generateFAQSchema(faqs);
  const chineseTips = [
    '先分清你的任务：剪辑、字幕、配音、生成视频、营销视频，会影响你看什么功能。',
    '看它是否支持你的素材格式、是否有模板、是否能稳定导出。',
    '如果你要长期用，优先看批量、协作和水印/导出限制，而不只是预览效果。',
  ];
  const englishTips = [
    'Start by separating your task: editing, captions, voiceover, generation, or marketing videos all need different features.',
    'Check supported formats, templates, and whether exports are reliable.',
    'If you will use it regularly, look at bulk workflows, collaboration, and export/watermark limits, not only previews.',
  ];
  const tips = isChinese ? chineseTips : englishTips;

  return (
    <>
      <StructuredDataServer data={breadcrumbSchema} />
      <StructuredDataServer data={faqSchema} />
      <div className='theme-page mx-auto max-w-6xl px-4 py-8 lg:px-6 lg:py-12'>
        <section className='rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm lg:p-10'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700'>
              <Clapperboard className='size-4' />
              {isChinese ? '视频工具推荐' : 'Video tools recommendations'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <Film className='size-4' />
              {isChinese ? '剪辑与生成并重' : 'Editing and generation'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese
              ? 'AI 视频工具推荐：怎么选更适合你的内容流程'
              : 'AI video tools: how to choose one that fits your content workflow'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? '视频工具的关键不只是“能不能生成”，而是能不能帮你更快完成剪辑、字幕、配音和导出。这个页面会从任务、素材、限制和协作四个角度帮你判断。'
              : 'Video tools are not just about generation. They should help you finish editing, captions, voiceover, and export faster. This page helps you judge by task, assets, limits, and collaboration.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href='/explore?search=video&sort=popular'
              ctaId='video_guide_browse_tools'
              ctaLabel='Video guide browse tools'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看视频类工具' : 'Browse video tools'}
              <ExternalLink className='size-4' />
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/how-to-choose-ai-tools'
              ctaId='video_guide_selection_guide'
              ctaLabel='Video guide selection guide'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '回到选型指南' : 'Back to selection guide'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-video-tools-comparison'
              ctaId='video_guide_comparison'
              ctaLabel='Video guide comparison'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看视频工具对比' : 'Compare video tools'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/best-ai-tools/ai-video-tools'
              ctaId='video_guide_top_list'
              ctaLabel='Video guide top list'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
            >
              {isChinese ? '看视频榜单' : 'Open video ranking'}
            </TrackableCtaLink>
          </div>
        </section>

        <section className='mt-8 rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '高意图入口' : 'High-intent path'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese
              ? '如果视频已经是明确方向，先看榜单再进对比'
              : 'If video is already the lane, open the ranking before the comparison'}
          </h2>
          <div className='mt-4 grid gap-3 md:grid-cols-3'>
            <Link
              href='/best-ai-tools/ai-video-tools'
              className='rounded-xl border border-white bg-white p-4 shadow-sm hover:bg-slate-50'
            >
              <p className='text-sm font-semibold text-slate-950'>{isChinese ? '视频榜单' : 'Video ranking'}</p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '先收窄到更高相关的视频候选，再决定具体比剪辑、生成还是配音。'
                  : 'Start with the highest-fit video candidates, then decide whether editing, generation, or voiceover matters most.'}
              </p>
            </Link>
            <Link
              href='/guides/ai-video-tools-comparison'
              className='rounded-xl border border-white bg-white p-4 shadow-sm hover:bg-slate-50'
            >
              <p className='text-sm font-semibold text-slate-950'>{isChinese ? '视频对比页' : 'Video comparison'}</p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '当你已经有几款候选，直接横向比较工作流和导出能力。'
                  : 'Once you already have candidates, compare workflow fit and export capability side by side.'}
              </p>
            </Link>
            <Link
              href='/categories/video?sort=popular'
              className='rounded-xl border border-white bg-white p-4 shadow-sm hover:bg-slate-50'
            >
              <p className='text-sm font-semibold text-slate-950'>{isChinese ? '视频分类' : 'Video category'}</p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '先浏览真实视频条目，再回头收窄到高相关候选。'
                  : 'Browse real video listings first, then come back to narrow into the stronger candidates.'}
              </p>
            </Link>
          </div>
        </section>

        <GuideEvidencePanel
          locale={locale}
          scope={
            isChinese
              ? '这页优先判断视频工具是否真的能让剪辑、生成、字幕、配音和导出更快完成，而不是只看预览效果。'
              : 'This page checks whether video tools truly speed up editing, generation, captions, voiceover, and export instead of only looking good in previews.'
          }
          checkedAt={checkedAt}
          items={[
            {
              label: isChinese ? '验证范围' : 'Checked scope',
              value: isChinese ? '剪辑、生成、字幕、配音、导出' : 'Editing, generation, captions, voiceover, export',
              note: isChinese
                ? `视频页最重要的是能否稳定进入制作流程；当前分类数 ${categoryCount} 个。`
                : `The key question is whether it can reliably fit into production; current category count is ${categoryCount}.`,
            },
            {
              label: isChinese ? '索引策略' : 'Indexing strategy',
              value: isChinese ? '核心视频入口保留索引' : 'Core video entry kept indexable',
              note: isChinese
                ? '与视频榜单、对比页一起，构成高意图内容入口。'
                : 'It works with rankings and comparisons as a high-intent content entry path.',
            },
            {
              label: isChinese ? '下一步补强' : 'Next enrichment',
              value: isChinese ? '补真实案例、模板与限制' : 'Add real cases, templates, and limits',
              note: isChinese
                ? `后续继续补评论、收藏、截图和验证日期，并保留 ${checkedAt} 的核对记录。`
                : `Next, comments, saves, screenshots, and verification dates should be added while keeping the ${checkedAt} verification record.`,
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
                ? `这页已按真实视频决策重新核对，优先保留剪辑、字幕和导出路径；当前分类数 ${categoryCount} 个。`
                : `This page has been rechecked against a real video decision and keeps editing, captions, and export paths visible; current category count is ${categoryCount}.`}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '当前判断' : 'Current judgment'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>
              {isChinese
                ? '保留索引，强化生产流程证据'
                : 'Keep it indexable and strengthen production workflow evidence'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? `用导出限制、批量制作和字幕配音流程来区分视频页，并持续保留 ${checkedAt} 的核对痕迹。`
                : `Use export limits, batch production, and caption/voiceover workflows to distinguish video pages while preserving the ${checkedAt} check trail.`}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '下一步' : 'Next step'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>
              {isChinese
                ? '补真实制作与复用记录，并把 2026-07-15 之后的更新继续记上。'
                : 'Add real production and repurposing notes, then keep logging updates after 2026-07-15.'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '后续优先补真实剪辑案例、字幕工作流和跨渠道复用经验。'
                : 'Next, prioritize real editing cases, caption workflows, and cross-channel repurposing notes.'}
            </p>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '判断顺序' : 'How to judge'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '先看任务，再看素材和输出' : 'Start with the task, then the assets and output'}
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
              {isChinese ? '视频类工具通常在这些分类里' : 'Video tools often sit in these categories'}
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

        <section className='mt-8 rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '高意图榜单' : 'High-intent ranking'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese
              ? '先看榜单，再决定是剪辑、生成还是配音'
              : 'Start with the ranking, then decide whether editing, generation, or voiceover is the lane'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经确定视频是主任务，先看榜单会比直接翻分类更快收窄 shortlist。'
              : 'If video is already the main task, the ranking gets you to a shorter shortlist faster than browsing categories first.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-video-tools',
                title: isChinese ? '视频工具榜单' : 'Video tools ranking',
                desc: isChinese ? '先收窄到更高相关候选。' : 'Start with the most relevant candidates first.',
              },
              {
                href: '/guides/ai-video-tools-comparison',
                title: isChinese ? '视频工具对比' : 'Video tools comparison',
                desc: isChinese ? '剪辑、生成和配音一起看。' : 'Compare editing, generation, and voiceover together.',
              },
              {
                href: '/guides/ai-writing-tools-comparison',
                title: isChinese ? '写作工具对比' : 'Writing tools comparison',
                desc: isChinese
                  ? '如果你的脚本和文案还要一起比。'
                  : 'Useful when scripts and copy are also part of the decision.',
              },
              {
                href: '/guides/ai-tools-for-content-creation-comparison',
                title: isChinese ? '内容创作对比' : 'Content creation comparison',
                desc: isChinese
                  ? '如果还在内容生产和视频生产之间摇摆。'
                  : 'Best when content production and video production overlap.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`video_tools_ranking_${item.href.split('/').pop()}`}
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

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_1fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '视频工具看什么' : 'What matters for video tools'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '能不能稳定帮你出片' : 'Can it reliably help you ship videos?'}
            </h2>
            <div className='mt-4 space-y-3 text-sm leading-6 text-slate-700'>
              <p>
                {isChinese
                  ? '视频工具最重要的是稳定、导出和流程是否顺手。你要特别看它能否支持你的素材类型、字幕流程和最终输出格式。'
                  : 'The key is stability, export, and workflow fit. Check whether it supports your asset types, captioning flow, and output format.'}
              </p>
              <p>
                {isChinese
                  ? '如果你是做短视频、营销视频或内容复用，优先看模板、批量处理、配音和字幕能力。'
                  : 'If you make short-form videos, marketing clips, or content repurposing assets, focus on templates, batch processing, voiceover, and captions.'}
              </p>
            </div>
          </div>

          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '常见问题' : 'FAQ'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '视频工具最常见的问题' : 'Common questions about video tools'}
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
        <GuideSubmissionPath locale={locale} ctaPrefix='ai_video_tools' />
      </div>
    </>
  );
}
