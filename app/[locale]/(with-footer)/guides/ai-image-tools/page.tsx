import { Metadata } from 'next';
import { ArrowRight, CheckCircle2, ExternalLink, Image as ImageIcon, Palette } from 'lucide-react';
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
        ? 'AI 图像工具推荐 | AI Best Tool'
        : `AI image tools recommendations | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '面向生成、修图、设计和创意工作的 AI 图像工具选型指南。'
        : 'A practical guide to AI tools for generation, editing, design, and creative image workflows.',
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const categories = await getAllCategories(true).catch(() => []);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${siteUrl}/${locale}` },
    { name: isChinese ? '选型指南' : 'Guides', url: `${siteUrl}/${locale}/guides/how-to-choose-ai-tools` },
    { name: isChinese ? '图像工具' : 'Image tools', url: `${siteUrl}/${locale}/guides/ai-image-tools` },
  ]);
  const faqs = [
    {
      question: isChinese ? 'AI 图像工具最适合做什么？' : 'What are AI image tools best for?',
      answer: isChinese
        ? '最适合灵感图、修图、抠图、风格化、海报设计和营销素材。它们能帮你加速创作，但最好保留人工挑选和微调。'
        : 'They are best for concept art, editing, background removal, stylization, poster design, and marketing assets. They speed things up, but human selection and tweaking still matter.',
    },
    {
      question: isChinese ? '我应该先看生成还是编辑？' : 'Should I focus on generation or editing first?',
      answer: isChinese
        ? '如果你从零做创意图，先看生成；如果你已有素材要调整，先看修图、抠图和风格迁移。'
        : 'If you are creating from scratch, start with generation. If you already have assets to refine, focus on editing, background removal, and style transfer.',
    },
    {
      question: isChinese ? '免费图像工具够用吗？' : 'Are free image tools enough?',
      answer: isChinese
        ? '简单试用、基础编辑和少量生成通常够用；但如果你要高分辨率、商用授权或批量输出，往往会更快碰到限制。'
        : 'Basic editing and light generation are often enough for testing. If you need higher resolution, commercial use, or bulk output, you may hit limits sooner.',
    },
    {
      question: isChinese ? '我可以直接从这里找到图像类工具吗？' : 'Can I find image tools directly from here?',
      answer: isChinese
        ? '可以。你可以先从分类和搜索结果开始，再结合截图、评论和更新频率判断。'
        : 'Yes. Start from categories and search results, then judge with screenshots, comments, and update frequency.',
    },
  ];
  const faqSchema = generateFAQSchema(faqs);
  const chineseTips = [
    '先分清你的任务：生成、修图、抠图、海报、营销图，会影响你看什么功能。',
    '看它是否支持高分辨率、风格控制和商用导出。',
    '如果你长期要用，优先看批量、模板和授权限制，而不只是出图效果。',
  ];
  const englishTips = [
    'Start by separating your task: generation, editing, background removal, posters, or marketing assets all need different features.',
    'Check high-resolution support, style control, and commercial exports.',
    'If you will use it regularly, look at batch workflows, templates, and license limits, not only output quality.',
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
              <ImageIcon className='size-4' />
              {isChinese ? '图像工具推荐' : 'Image tools recommendations'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <Palette className='size-4' />
              {isChinese ? '设计与生成并重' : 'Design and generation'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese
              ? 'AI 图像工具推荐：怎么选更适合你的创作流程'
              : 'AI image tools: how to choose one that fits your creative workflow'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? '图像工具不只是“出图”，还要看它是否适合修图、设计、品牌素材和商用工作流。这个页面会从任务、输出和限制三个角度帮你判断。'
              : 'Image tools are not just about generating images. They also need to fit editing, design, brand assets, and commercial workflows. This page helps you judge by task, output, and limits.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href='/explore?search=image&sort=popular'
              ctaId='image_guide_browse_tools'
              ctaLabel='Image guide browse tools'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看图像类工具' : 'Browse image tools'}
              <ExternalLink className='size-4' />
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/how-to-choose-ai-tools'
              ctaId='image_guide_selection'
              ctaLabel='Image guide selection'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '回到选型指南' : 'Back to selection guide'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-image-tools-comparison'
              ctaId='image_guide_compare'
              ctaLabel='Image guide compare'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看图像工具对比' : 'Compare image tools'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/best-ai-tools/ai-image-tools'
              ctaId='image_guide_top_list'
              ctaLabel='Image guide top list'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
            >
              {isChinese ? '看图像榜单' : 'Open image ranking'}
            </TrackableCtaLink>
          </div>
        </section>

        <section className='mt-8 rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '高意图路径' : 'High-intent path'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese
              ? '先看榜单，再进入对比页和真实条目'
              : 'Start with the ranking, then move into comparison and real listings'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经知道自己是做生成、修图、抠图还是品牌素材，就不要停在总览页，直接进入更窄的筛选路径。'
              : 'If generation, editing, cutouts, or brand assets are already the job to solve, move straight into narrower selection paths.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-image-tools',
                title: isChinese ? '图像工具榜单' : 'Image tools ranking',
                desc: isChinese ? '直接看高意图 shortlist。' : 'Go straight to the high-intent shortlist.',
              },
              {
                href: '/guides/ai-image-tools-comparison',
                title: isChinese ? '图像工具对比' : 'Image tools comparison',
                desc: isChinese
                  ? '横向看生成、修图和设计能力。'
                  : 'Compare generation, editing, and design side by side.',
              },
              {
                href: '/guides/ai-video-tools-comparison',
                title: isChinese ? '视频工具对比' : 'Video tools comparison',
                desc: isChinese
                  ? '如果素材会进视频工作流，这里更贴近。'
                  : 'Useful when image assets feed into video workflows.',
              },
              {
                href: '/guides/ai-tools-for-marketing-comparison',
                title: isChinese ? '营销工具对比' : 'Marketing tools comparison',
                desc: isChinese
                  ? '如果重点是营销素材和 campaign 输出。'
                  : 'Better for campaign assets and marketing output.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`image_guide_${item.href.split('/').pop()}`}
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
              href='/best-ai-tools/ai-image-tools'
              ctaId='image_guide_top_list_secondary'
              ctaLabel='Image guide top list secondary'
              pageType='guide'
              className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '打开图像榜单' : 'Open image ranking'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/submit'
              ctaId='image_guide_submit'
              ctaLabel='Image guide submit'
              pageType='guide'
              className='inline-flex items-center justify-center rounded-lg border border-cyan-200 bg-white px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-50'
            >
              {isChinese ? '提交你的工具' : 'Submit your tool'}
            </TrackableCtaLink>
          </div>
        </section>

        <section className='mt-8 rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '高意图榜单' : 'High-intent ranking'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese ? '先用榜单缩小图像 shortlist' : 'Use the ranking to narrow your image shortlist first'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经知道自己更偏生成、修图、品牌素材或商用输出，榜单页会比泛目录更快进入决策。'
              : 'If the decision is already about generation, editing, brand assets, or commercial output, the ranking page gets to a decision faster than a broad directory.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-image-tools',
                title: isChinese ? '图像工具榜单' : 'Image tools ranking',
                desc: isChinese ? '直接看高意图 shortlist。' : 'Go straight to the high-intent shortlist.',
              },
              {
                href: '/best-ai-tools/ai-design-tools',
                title: isChinese ? '设计工具榜单' : 'Design tools ranking',
                desc: isChinese ? '如果你也要看品牌和版式。' : 'Useful when branding and layout also matter.',
              },
              {
                href: '/guides/ai-image-tools-comparison',
                title: isChinese ? '图像工具对比' : 'Image tools comparison',
                desc: isChinese
                  ? '横向看生成、修图和设计能力。'
                  : 'Compare generation, editing, and design side by side.',
              },
              {
                href: '/guides/ai-video-tools-comparison',
                title: isChinese ? '视频工具对比' : 'Video tools comparison',
                desc: isChinese ? '如果素材会进视频工作流。' : 'Useful when image assets feed into video workflows.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`image_guide_${item.href.split('/').pop()}`}
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
              ? '这页优先检查页面是否能帮助用户完成真实图像决策：生成、修图、商用授权和品牌素材，而不是只看出图效果。'
              : 'This page prioritizes whether the guide helps with a real image decision: generation, editing, commercial licensing, and brand assets rather than just output quality.'
          }
          items={[
            {
              label: isChinese ? '判断维度' : 'Decision signals',
              value: isChinese ? '生成、修图、授权、品牌' : 'Generation, editing, licensing, brand',
              note: isChinese
                ? '重点看是否能支撑创作与商用两种场景。'
                : 'We care about whether the tool supports both creative and commercial use.',
            },
            {
              label: isChinese ? '索引策略' : 'Indexing strategy',
              value: isChinese ? '核心页保留索引' : 'Keep the core page indexable',
              note: isChinese
                ? '让图像意图更清楚，减少和视频、设计页重复。'
                : 'Make the image intent explicit so it overlaps less with video and design pages.',
            },
            {
              label: isChinese ? '下一步补强' : 'Next enrichment',
              value: isChinese ? '补真实创作案例' : 'Add real creative cases',
              note: isChinese
                ? '后续优先补真实图片样本、商用限制和品牌模板。'
                : 'Next, priority additions are real image samples, commercial limits, and brand templates.',
            },
          ]}
        />

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '判断顺序' : 'How to judge'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '先看任务，再看输出和授权' : 'Start with the task, then output and licensing'}
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
              {isChinese ? '图像类工具通常在这些分类里' : 'Image tools often sit in these categories'}
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
              {isChinese ? '图像工具看什么' : 'What matters for image tools'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '能不能稳定帮你做出可用素材' : 'Can it reliably produce usable visuals?'}
            </h2>
            <div className='mt-4 space-y-3 text-sm leading-6 text-slate-700'>
              <p>
                {isChinese
                  ? '图像工具最重要的是是否能稳定输出你要的风格、尺寸和用途。你要特别看它是否支持编辑、商用导出和高分辨率。'
                  : 'The key is whether it can reliably produce the style, size, and use case you need. Check editing, commercial export, and high-resolution support.'}
              </p>
              <p>
                {isChinese
                  ? '如果你是品牌、设计师或内容团队，优先看批量、模板、风格一致性和授权说明。'
                  : 'If you are a brand, designer, or content team, focus on batch workflows, templates, style consistency, and licensing details.'}
              </p>
            </div>
          </div>

          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '常见问题' : 'FAQ'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '图像工具最常见的问题' : 'Common questions about image tools'}
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

        <section className='mt-8 rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '下一步怎么走' : 'Next step'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese
              ? '把图像入口接到榜单、比较页和真实条目'
              : 'Move from the image guide into rankings, comparisons, and real listings'}
          </h2>
          <div className='mt-4 grid gap-4 lg:grid-cols-3'>
            <TrackableCtaLink
              href='/best-ai-tools/ai-image-tools'
              className='group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-white hover:shadow-sm'
              ctaId='image_guide_ranking_next'
              ctaLabel='Image guide ranking next'
              pageType='guide'
            >
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='text-base font-semibold text-slate-950 group-hover:text-cyan-700'>
                    {isChinese ? '看图像工具榜单' : 'Open image ranking'}
                  </p>
                  <p className='mt-2 text-sm leading-6 text-slate-600'>
                    {isChinese
                      ? '如果你已经是高意图筛选，直接看 shortlist 会更快。'
                      : 'If intent is already high, the shortlist is the fastest next step.'}
                  </p>
                </div>
                <ArrowRight className='mt-1 size-4 shrink-0 text-slate-400 group-hover:text-cyan-700' />
              </div>
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-image-tools-comparison'
              className='group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-white hover:shadow-sm'
              ctaId='image_guide_compare_next'
              ctaLabel='Image guide compare next'
              pageType='guide'
            >
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='text-base font-semibold text-slate-950 group-hover:text-cyan-700'>
                    {isChinese ? '看图像工具对比' : 'Compare image tools'}
                  </p>
                  <p className='mt-2 text-sm leading-6 text-slate-600'>
                    {isChinese
                      ? '当创作任务已经清楚，就进入横向对比。'
                      : 'Once the creative task is clear, move into side-by-side comparison.'}
                  </p>
                </div>
                <ArrowRight className='mt-1 size-4 shrink-0 text-slate-400 group-hover:text-cyan-700' />
              </div>
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/categories/design-art?sort=popular'
              className='group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-white hover:shadow-sm'
              ctaId='image_guide_category'
              ctaLabel='Image guide category'
              pageType='guide'
            >
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='text-base font-semibold text-slate-950 group-hover:text-cyan-700'>
                    {isChinese ? '进入 Design 分类' : 'Open the design category'}
                  </p>
                  <p className='mt-2 text-sm leading-6 text-slate-600'>
                    {isChinese
                      ? '先看真实条目，再回来缩窄候选。'
                      : 'Browse real listings first, then come back to narrow the shortlist.'}
                  </p>
                </div>
                <ArrowRight className='mt-1 size-4 shrink-0 text-slate-400 group-hover:text-cyan-700' />
              </div>
            </TrackableCtaLink>
          </div>
        </section>
        <GuideSubmissionPath locale={locale} ctaPrefix='ai_image_tools' />
      </div>
    </>
  );
}
