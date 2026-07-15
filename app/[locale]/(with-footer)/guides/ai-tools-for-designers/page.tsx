import { Metadata } from 'next';
import { CheckCircle2, ExternalLink, Paintbrush, Sparkles } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';
import { getAllCategories, getLocalizedField } from '@/lib/services/categories';
import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';
import { StructuredDataServer } from '@/components/seo/StructuredData';
import { Link } from '@/app/navigation';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Metadata.home' });

  return {
    title:
      locale === 'cn' || locale === 'tw'
        ? 'AI 设计师工具推荐 | AI Best Tool'
        : `AI tools for designers | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '面向设计师、品牌和视觉工作流的 AI 工具选型指南。'
        : 'A practical guide to AI tools for designers, brands, and visual workflows.',
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
    { name: isChinese ? '设计工具' : 'Design tools', url: `${siteUrl}/${locale}/guides/ai-tools-for-designers` },
  ]);
  const faqs = [
    {
      question: isChinese ? '设计师最适合用 AI 做什么？' : 'What are designers best using AI for?',
      answer: isChinese
        ? '最适合灵感草图、版式提案、文案辅助、抠图、风格探索和品牌素材的快速变体。'
        : 'They are great for concept sketches, layout ideas, copy help, background removal, style exploration, and quick brand variations.',
    },
    {
      question: isChinese ? '我应该先看什么？' : 'What should I check first?',
      answer: isChinese
        ? '先看它是否适合你的输出类型，比如海报、社媒、UI、品牌图或营销视觉。'
        : 'Start with the output type: posters, social assets, UI, brand visuals, or marketing imagery.',
    },
    {
      question: isChinese ? '免费设计工具够用吗？' : 'Are free design tools enough?',
      answer: isChinese
        ? '轻量试用常常够用；但如果你需要分辨率、商用授权、品牌一致性和批量处理，限制会很快出现。'
        : 'Free tiers are often fine for testing. If you need resolution, commercial licensing, brand consistency, and batch workflows, limits appear quickly.',
    },
    {
      question: isChinese ? '我可以直接从这里找到设计工具吗？' : 'Can I find design tools directly from here?',
      answer: isChinese
        ? '可以。你可以先从搜索和分类页开始，再结合评论、截图和更新频率判断。'
        : 'Yes. Start from search and categories, then judge with comments, screenshots, and update frequency.',
    },
  ];
  const faqSchema = generateFAQSchema(faqs);
  const tips = isChinese
    ? [
        '先分清你是在做品牌、营销图、海报、UI 还是社媒素材。',
        '看它能不能稳定输出风格一致的视觉。',
        '如果要商业使用，优先看授权、分辨率和批量能力。',
      ]
    : [
        'Separate the use case first: brand, marketing assets, posters, UI, or social visuals.',
        'Check whether it can keep styles consistent.',
        'If you use it commercially, prioritize licensing, resolution, and batch workflows.',
      ];
  const highIntentPaths = [
    {
      href: '/best-ai-tools/ai-image-tools',
      title: isChinese ? '先看图像榜单' : 'Start with image ranking',
      desc: isChinese ? '先用 shortlist 缩小范围。' : 'Use the shortlist to narrow the field first.',
    },
    {
      href: '/guides/ai-image-tools',
      title: isChinese ? '图像工具指南' : 'Image tools guide',
      desc: isChinese ? '生成、编辑和素材处理一起看。' : 'Compare generation, editing, and asset workflows together.',
    },
    {
      href: '/guides/ai-tools-for-content-creation-comparison',
      title: isChinese ? '内容创作对比' : 'Content creation comparison',
      desc: isChinese ? '如果设计和内容生产交叉。' : 'Useful when design and content production overlap.',
    },
    {
      href: '/guides/ai-video-tools-comparison',
      title: isChinese ? '视频工具对比' : 'Video tools comparison',
      desc: isChinese ? '如果重点转向视频素材和剪辑。' : 'Use this when video assets and editing matter more.',
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
              <Paintbrush className='size-4' />
              {isChinese ? '设计工具推荐' : 'Design tools'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <Sparkles className='size-4' />
              {isChinese ? '视觉与品牌优先' : 'Visual and brand first'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese
              ? 'AI 设计师工具推荐：怎么选更适合你的视觉工作流'
              : 'AI tools for designers: how to choose one that fits your visual workflow'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? '设计工作看重的不只是“能出图”，而是能不能保持品牌一致性、输出质量和商业授权。这个页面会帮你从输出类型和视觉控制两个角度判断。'
              : 'Design work is not only about making images. It is about brand consistency, quality, and commercial rights. This page helps you judge by output type and visual control.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href='/explore?search=design&sort=popular'
              ctaId='designers_guide_browse_tools'
              ctaLabel='Designers guide browse tools'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看设计工具' : 'Browse design tools'}
              <ExternalLink className='size-4' />
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/best-ai-tools/ai-image-tools'
              ctaId='designers_guide_top_list'
              ctaLabel='Designers guide image top list'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
            >
              {isChinese ? '看图像榜单' : 'Open image ranking'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/how-to-choose-ai-tools'
              ctaId='designers_guide_selection_guide'
              ctaLabel='Designers guide selection guide'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '回到选型指南' : 'Back to selection guide'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-image-tools'
              ctaId='designers_guide_image_guide'
              ctaLabel='Designers guide image guide'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看图像工具' : 'Image tools'}
            </TrackableCtaLink>
          </div>
        </section>

        <GuideEvidencePanel
          locale={locale}
          checkedAt={checkedAt}
          scope={
            isChinese
              ? '设计页要围绕品牌、视觉控制、输出类型和商业授权来做，不要只看“能不能出图”。这个页继续可索引，但会把图像、视频和内容创作路径优先分层。'
              : 'This design page should stay centered on brand, visual control, output type, and commercial rights rather than only asking whether it can make images. Keep it indexable, but layer image, video, and content-creation paths separately.'
          }
          signalCards={[
            {
              label: isChinese ? '价格信号' : 'Pricing signal',
              value: isChinese ? '先看商用版和团队席位' : 'Check commercial tiers and team seats',
              note: isChinese
                ? '设计工具常在高清导出、授权和协作能力上分层。'
                : 'Design tools often tier high-res export, licensing, and collaboration.',
            },
            {
              label: isChinese ? '更新信号' : 'Freshness signal',
              value: isChinese ? '看样式库和工作流是否常更新' : 'Watch style libraries and workflows',
              note: isChinese
                ? '样式库停更，设计输出就很容易落后。'
                : 'Stalled style libraries make output feel outdated quickly.',
            },
            {
              label: isChinese ? '风险信号' : 'Risk signal',
              value: isChinese ? '只会出图不够' : 'Making images alone is not enough',
              note: isChinese
                ? '如果没有授权、品牌案例和样片，先别当成首选。'
                : 'If there is no licensing, brand case, or sample evidence, do not treat it as the first choice yet.',
            },
          ]}
          items={[
            {
              label: isChinese ? '验证重点' : 'Validation focus',
              value: isChinese ? '品牌、视觉、授权' : 'Brand, visuals, licensing',
              note: isChinese
                ? `确认它是不是能稳定输出可商用视觉。当前可用分类数：${categoryCount}。`
                : `Confirm it can reliably produce commercially usable visuals. Current category count: ${categoryCount}.`,
            },
            {
              label: isChinese ? '合并策略' : 'Merge strategy',
              value: isChinese ? '分流到图像/视频' : 'Route to image/video',
              note: isChinese
                ? '如果目标更偏生成和编辑，就去更窄页。'
                : 'If the goal is mostly generation and editing, move to narrower pages.',
            },
            {
              label: isChinese ? '后续增量' : 'Next increments',
              value: isChinese ? '品牌案例、样片、授权' : 'Brand cases, samples, licensing',
              note: isChinese
                ? `补真实品牌和设计交付样例，并保持 ${checkedAt} 的核对记录。`
                : `Add real brand and delivery examples while keeping the ${checkedAt} verification record.`,
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
                ? `这页已按真实设计决策重新核对，优先保留品牌、视觉和授权入口，目前覆盖 ${categoryCount} 个分类。`
                : `This page has been rechecked against a real design decision and keeps brand, visual, and licensing entry points visible across ${categoryCount} categories.`}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '当前判断' : 'Current judgment'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>
              {isChinese ? '保留索引，强化设计交付证据' : 'Keep it indexable and strengthen design-delivery evidence'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '用品牌案例、样片和授权说明区分它与图像页。'
                : 'Use brand cases, samples, and licensing notes to distinguish it from image pages.'}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '下一步' : 'Next step'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>
              {isChinese ? '补真实品牌与交付案例' : 'Add real brand and delivery cases'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '后续优先补真实品牌素材、授权说明和交付样例。'
                : 'Next, prioritize real brand assets, licensing notes, and delivery examples.'}
            </p>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '判断顺序' : 'How to judge'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '先看输出类型，再看视觉控制' : 'Start with output type, then visual control'}
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
              {isChinese ? '设计工具通常在这些分类里' : 'Design tools often sit in these categories'}
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

        <section className='mt-8 rounded-[18px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '高意图路径' : 'High-intent path'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese ? '先看榜单和对比，再回到设计页' : 'Compare first, then come back to design pages'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经知道自己要做品牌、海报、UI 或社媒视觉，就直接去更窄的榜单和对比页。'
              : 'If the real need is brand visuals, posters, UI, or social assets, move straight into the narrower ranking and comparison pages.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {highIntentPaths.map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`designers_guide_${item.href.split('/').pop()}`}
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
            {isChinese ? '先用榜单缩小设计 shortlist' : 'Use the ranking to narrow your design shortlist first'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经明确是在比品牌、海报、UI 或社媒视觉，先看榜单会比泛目录更快进入决策。'
              : 'If the decision is already about brand work, posters, UI, or social visuals, the ranking gets you to a decision faster than a broad directory.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-image-tools',
                title: isChinese ? '图像工具榜单' : 'Image ranking',
                desc: isChinese
                  ? '先收窄到更高相关的视觉候选。'
                  : 'Start with the highest-fit visual candidates first.',
              },
              {
                href: '/guides/ai-image-tools',
                title: isChinese ? '图像工具指南' : 'Image tools guide',
                desc: isChinese ? '生成、编辑和素材处理一起看。' : 'Compare generation, editing, and assets together.',
              },
              {
                href: '/guides/ai-tools-for-content-creation-comparison',
                title: isChinese ? '内容创作对比' : 'Content creation comparison',
                desc: isChinese ? '如果设计和内容生产交叉。' : 'Useful when design and content production overlap.',
              },
              {
                href: '/guides/ai-video-tools-comparison',
                title: isChinese ? '视频工具对比' : 'Video tools comparison',
                desc: isChinese
                  ? '如果重点转向视频素材和剪辑。'
                  : 'Use this when video assets and editing matter more.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`designers_guide_ranking_${item.href.split('/').pop()}`}
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
            {isChinese ? '高意图入口' : 'High-intent path'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese
              ? '如果你已经知道自己在找设计工具，先看图像榜单'
              : 'If design is already the lane, open the image ranking first'}
          </h2>
          <div className='mt-4 grid gap-3 md:grid-cols-3'>
            <Link
              href='/best-ai-tools/ai-image-tools'
              className='rounded-xl border border-white bg-white p-4 shadow-sm hover:bg-slate-50'
            >
              <p className='text-sm font-semibold text-slate-950'>{isChinese ? '图像榜单' : 'Image ranking'}</p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '先收窄到更高相关的视觉候选，再决定具体走品牌、海报还是素材流程。'
                  : 'Start with the highest-fit visual candidates, then decide whether your workflow is more about brand, posters, or assets.'}
              </p>
            </Link>
            <Link
              href='/guides/ai-image-tools'
              className='rounded-xl border border-white bg-white p-4 shadow-sm hover:bg-slate-50'
            >
              <p className='text-sm font-semibold text-slate-950'>{isChinese ? '图像工具指南' : 'Image tools guide'}</p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '如果你更偏生成、编辑和素材处理，这条路径更直接。'
                  : 'A better path if generation, editing, and asset production are the real needs.'}
              </p>
            </Link>
            <Link
              href='/categories/design-art?sort=popular'
              className='rounded-xl border border-white bg-white p-4 shadow-sm hover:bg-slate-50'
            >
              <p className='text-sm font-semibold text-slate-950'>{isChinese ? '设计分类' : 'Design category'}</p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '直接浏览真实设计条目，再回头比较高相关候选。'
                  : 'Browse real design listings first, then come back to compare the stronger candidates.'}
              </p>
            </Link>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_1fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '设计工具看什么' : 'What matters for design tools'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '能不能稳定帮你做出可用视觉' : 'Can it reliably produce usable visuals?'}
            </h2>
            <div className='mt-4 space-y-3 text-sm leading-6 text-slate-700'>
              <p>
                {isChinese
                  ? '设计工具最重要的是视觉一致性和可控性。你要看它是否支持你实际要交付的素材类型。'
                  : 'Consistency and control matter most. Check whether it supports the exact assets you need to deliver.'}
              </p>
              <p>
                {isChinese
                  ? '如果你做品牌或商业设计，优先看授权、分辨率和批量能力。'
                  : 'If you work in brand or commercial design, prioritize licensing, resolution, and batch workflows.'}
              </p>
            </div>
          </div>

          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '常见问题' : 'FAQ'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '设计工具最常见的问题' : 'Common questions about design tools'}
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
        <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_designers' />
      </div>
    </>
  );
}
