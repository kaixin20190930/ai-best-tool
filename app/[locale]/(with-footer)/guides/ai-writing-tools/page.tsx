import { Metadata } from 'next';
import { ArrowRight, CheckCircle2, ExternalLink, FileText, PenLine } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';
import { getAllCategories, getLocalizedField } from '@/lib/services/categories';
import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideActionSection from '@/components/guides/GuideActionSection';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
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
        ? 'AI 写作工具推荐 | AI Best Tool'
        : `AI writing tools recommendations | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '适合内容创作、SEO、营销和日常写作的 AI 工具推荐与选型指南。'
        : 'A practical guide to AI writing tools for content creation, SEO, marketing, and everyday writing.',
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const categories = await getAllCategories(true).catch(() => []);
  const checkedAt = '2026-07-13';
  const categoryCount = categories.length;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${siteUrl}/${locale}` },
    { name: isChinese ? '选型指南' : 'Guides', url: `${siteUrl}/${locale}/guides/how-to-choose-ai-tools` },
    { name: isChinese ? '写作工具' : 'Writing tools', url: `${siteUrl}/${locale}/guides/ai-writing-tools` },
  ]);
  const faqs = [
    {
      question: isChinese ? 'AI 写作工具最适合什么任务？' : 'What tasks are AI writing tools best for?',
      answer: isChinese
        ? '最适合初稿、标题、改写、摘要、SEO 文案和脑暴提纲。它们能帮你省时间，但通常还需要你自己做最后把关。'
        : 'They are great for drafts, headlines, rewrites, summaries, SEO copy, and outlines. They save time, but you still want a human final pass.',
    },
    {
      question: isChinese ? '我应该先看什么？' : 'What should I check first?',
      answer: isChinese
        ? '先看它是否支持你真正要写的内容类型，比如博客、广告文案、邮件、社媒或长文。'
        : 'Start with the content type you actually write, such as blogs, ads, emails, social posts, or long-form articles.',
    },
    {
      question: isChinese ? '免费写作工具够吗？' : 'Are free writing tools enough?',
      answer: isChinese
        ? '如果只是日常改写或简单起草，很多免费工具就够了；如果你要批量写作、协作或更高质量，通常会更快碰到限制。'
        : 'For casual rewrites or light drafting, many free tools are enough. If you need bulk writing, collaboration, or better quality, you will likely hit limits sooner.',
    },
    {
      question: isChinese ? '我可以直接从这里找到写作类工具吗？' : 'Can I find writing tools directly from here?',
      answer: isChinese
        ? '可以。你可以先从写作相关分类和搜索结果开始，再结合评论和截图判断。'
        : 'Yes. Start from writing-related categories and search results, then use comments and screenshots to decide.',
    },
  ];
  const faqSchema = generateFAQSchema(faqs);
  const tips = isChinese
    ? [
        '先确认写作任务类型：博客、邮件、社媒、SEO、广告文案，需求会很不一样。',
        '看它是否支持中文、是否有模板、是否能保持语气一致。',
        '如果你要长期写内容，优先看导出、协作和限制，而不是只看生成速度。',
      ]
    : [
        'Start with the content type: blog, email, social, SEO, or ad copy all have different needs.',
        'Check whether it supports Chinese, templates, and consistent tone.',
        'If you plan to write regularly, look at export, collaboration, and limits, not just generation speed.',
      ];
  const highIntentPaths = [
    {
      href: '/best-ai-tools/ai-writing-tools',
      title: isChinese ? '先看写作榜单' : 'Start with writing ranking',
      desc: isChinese ? '先用 shortlist 缩小范围。' : 'Use the shortlist to narrow the field first.',
    },
    {
      href: '/guides/ai-writing-tools-comparison',
      title: isChinese ? '写作工具对比页' : 'Writing tools comparison',
      desc: isChinese ? '博客、邮件和广告文案一起看。' : 'Compare blogs, email, and ad copy together.',
    },
    {
      href: '/guides/ai-tools-for-content-creation-comparison',
      title: isChinese ? '内容创作对比' : 'Content creation comparison',
      desc: isChinese ? '如果写作和内容生产交叉。' : 'Useful when writing and content production overlap.',
    },
    {
      href: '/guides/ai-seo-tools-comparison',
      title: isChinese ? 'SEO 研究对比' : 'SEO research comparison',
      desc: isChinese
        ? '如果写作目标更偏排名和内容优化。'
        : 'Best when the writing job is tied to rankings and optimization.',
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
              <PenLine className='size-4' />
              {isChinese ? '写作工具推荐' : 'Writing tools recommendations'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <FileText className='size-4' />
              {isChinese ? '内容创作优先' : 'Content-first'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese
              ? 'AI 写作工具推荐：怎么选才适合你的内容工作流'
              : 'AI writing tools: how to choose one that fits your content workflow'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? '写作工具不是只看“会不会生成”，而是看它能不能帮你更快写出更稳定的内容。这个页面会从任务类型、语气、限制和协作几个角度帮你判断。'
              : 'Writing tools are not just about "can it generate text?" They should help you produce content faster and more consistently. This page helps you judge by task type, tone, limits, and collaboration.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href='/explore?search=writing&sort=popular'
              ctaId='writing_guide_browse_tools'
              ctaLabel='Writing guide browse tools'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看写作类工具' : 'Browse writing tools'}
              <ExternalLink className='size-4' />
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/free-ai-tools'
              ctaId='writing_guide_free_tools'
              ctaLabel='Writing guide free tools'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '先看免费工具' : 'Start with free tools'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-writing-tools-comparison'
              ctaId='writing_guide_comparison'
              ctaLabel='Writing guide comparison'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看写作工具对比' : 'Compare writing tools'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/best-ai-tools/ai-writing-tools'
              ctaId='writing_guide_top_list'
              ctaLabel='Writing guide top list'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
            >
              {isChinese ? '看写作榜单' : 'Open writing ranking'}
            </TrackableCtaLink>
          </div>
        </section>

        <GuideEvidencePanel
          locale={locale}
          checkedAt={checkedAt}
          scope={
            isChinese
              ? '这页优先检查写作场景、语气稳定性、模板能力、限制和更新信号，避免只看“生成速度”。'
              : 'This page focuses on writing scenarios, tone stability, templates, limits, and freshness so generation speed is not the only factor.'
          }
          items={[
            {
              label: isChinese ? '验证范围' : 'Checked scope',
              value: isChinese ? '场景、语气、模板、限制' : 'Use case, tone, templates, limits',
              note: isChinese
                ? `当前可参考分类信号有 ${categoryCount} 个，写作工具应该按工作流来分，不是只看“会不会写”。`
                : `${categoryCount} category signals are available, so writing tools should be judged by workflow fit, not just whether they can write.`,
            },
            {
              label: isChinese ? '索引策略' : 'Indexing strategy',
              value: isChinese ? '核心写作入口保留索引' : 'Core writing entry kept indexable',
              note: isChinese
                ? '与写作榜单、对比页、内容创作页一起支撑长尾流量。'
                : 'It supports long-tail traffic together with rankings, comparisons, and content-creation pages.',
            },
            {
              label: isChinese ? '下一步补强' : 'Next enrichment',
              value: isChinese ? '补真实案例与反馈' : 'Add real cases and feedback',
              note: isChinese
                ? `这页已于 ${checkedAt} 重新核对，后续会逐步把内容类型、实际限制和评论信号补得更完整。`
                : `This page was rechecked on ${checkedAt}, and next we should add more content types, real limits, and feedback signals.`,
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
                ? `这页已按真实写作决策重新核对，优先保留场景、语气和模板入口。当前可参考分类信号 ${categoryCount} 个。`
                : `This page has been rechecked against a real writing decision and keeps scenarios, tone, and template entry points visible, with ${categoryCount} category signals available.`}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '当前判断' : 'Current judgment'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>
              {isChinese ? '保留索引，强化写作流程证据' : 'Keep it indexable and strengthen writing workflow evidence'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '用内容类型、模板和使用反馈来和内容创作页区分。'
                : 'Use content types, templates, and feedback to distinguish it from content-creation pages.'}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '下一步' : 'Next step'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>
              {isChinese ? '补真实写作样例和限制说明' : 'Add real writing samples and limits'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '后续优先补真实案例、反馈和适用限制。'
                : 'Next, prioritize real cases, feedback, and usage limits.'}
            </p>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '判断顺序' : 'How to judge'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '先看写什么，再看怎么写' : 'Start with what you write, then how it writes'}
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
              {isChinese ? '写作类工具通常在这些分类里' : 'Writing tools often sit in these categories'}
            </h2>
            <div className='mt-4 grid gap-2'>
              {categories
                .filter((category) => ['text-writing', 'productivity', 'research'].includes(String(category.slug)))
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

        <section className='mt-8 rounded-[18px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '高意图路径' : 'High-intent path'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese ? '先看榜单和对比，再回到写作页' : 'Compare first, then come back to writing pages'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经知道自己是在写博客、邮件、社媒或广告文案，就直接去更窄的榜单和对比页。'
              : 'If the real job is blogs, email, social posts, or ad copy, move straight into the narrower ranking and comparison pages.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {highIntentPaths.map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`writing_guide_${item.href.split('/').pop()}`}
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
            {isChinese ? '先用榜单缩小写作 shortlist' : 'Use the ranking to narrow your writing shortlist first'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经明确是在比博客、邮件、长文改写或 SEO 内容，先看更窄的榜单会比泛目录更快做决定。'
              : 'If the decision is already about blogs, emails, long-form rewriting, or SEO content, a narrower ranking gets you to a decision faster than a broad directory.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-writing-tools',
                title: isChinese ? '写作工具榜单' : 'Writing tools ranking',
                desc: isChinese
                  ? '先收窄到更高相关的写作候选。'
                  : 'Start with the highest-fit writing candidates first.',
              },
              {
                href: '/best-ai-tools/ai-marketing-tools',
                title: isChinese ? '营销工具榜单' : 'Marketing tools ranking',
                desc: isChinese
                  ? '如果写作和营销投放一起考虑。'
                  : 'Useful when writing is tied to campaigns and performance copy.',
              },
              {
                href: '/guides/ai-writing-tools-comparison',
                title: isChinese ? '写作工具对比' : 'Writing tools comparison',
                desc: isChinese ? '博客、邮件和广告文案一起看。' : 'Compare blogs, email, and ad copy together.',
              },
              {
                href: '/guides/ai-tools-for-content-creation-comparison',
                title: isChinese ? '内容创作对比' : 'Content creation comparison',
                desc: isChinese
                  ? '如果写作和内容生产交叉，这里更合适。'
                  : 'A better fit when writing and content production overlap.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`writing_guide_ranking_${item.href.split('/').pop()}`}
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

        <section className='mt-8 rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '下一步怎么走' : 'Next step'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese
              ? '把写作入口接到比较页和真实条目'
              : 'Move from the writing guide into comparisons and real listings'}
          </h2>
          <div className='mt-4 grid gap-4 lg:grid-cols-3'>
            <Link
              href='/guides/ai-writing-tools-comparison'
              className='group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-white hover:shadow-sm'
            >
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='text-base font-semibold text-slate-950 group-hover:text-cyan-700'>
                    {isChinese ? '看写作工具对比' : 'Compare writing tools'}
                  </p>
                  <p className='mt-2 text-sm leading-6 text-slate-600'>
                    {isChinese
                      ? '当你已经知道自己要写什么，下一步就去横向看几款常见工具。'
                      : 'Once the writing job is clear, compare a few common tools side by side.'}
                  </p>
                </div>
                <ArrowRight className='mt-1 size-4 shrink-0 text-slate-400 group-hover:text-cyan-700' />
              </div>
            </Link>
            <Link
              href='/categories/text-writing?sort=popular'
              className='group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-white hover:shadow-sm'
            >
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='text-base font-semibold text-slate-950 group-hover:text-cyan-700'>
                    {isChinese ? '进入写作分类' : 'Open the writing category'}
                  </p>
                  <p className='mt-2 text-sm leading-6 text-slate-600'>
                    {isChinese
                      ? '如果你想先看真实条目，再回来做判断，这里更直接。'
                      : 'Browse real listings first, then return when you are ready to compare.'}
                  </p>
                </div>
                <ArrowRight className='mt-1 size-4 shrink-0 text-slate-400 group-hover:text-cyan-700' />
              </div>
            </Link>
            <Link
              href='/explore?search=writing&sort=popular'
              className='group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-white hover:shadow-sm'
            >
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='text-base font-semibold text-slate-950 group-hover:text-cyan-700'>
                    {isChinese ? '搜索更多写作工具' : 'Search more writing tools'}
                  </p>
                  <p className='mt-2 text-sm leading-6 text-slate-600'>
                    {isChinese
                      ? '想把候选范围扩大一点，可以回到探索页继续筛。'
                      : 'Use the search page to widen the shortlist a bit further.'}
                  </p>
                </div>
                <ArrowRight className='mt-1 size-4 shrink-0 text-slate-400 group-hover:text-cyan-700' />
              </div>
            </Link>
          </div>
        </section>

        <GuideActionSection
          locale={locale}
          eyebrow={isChinese ? '先看这些工具' : 'Recommended tools'}
          title={
            isChinese ? '更贴近真实内容工作的写作工具入口' : 'Writing tool entry points that fit real content work'
          }
          description={
            isChinese
              ? '如果你是为了博客、营销文案、日常改写或创意写作而来，先从这些更有代表性的工具开始，判断会更快。'
              : 'If you are here for blogs, marketing copy, daily rewriting, or creative work, these more representative tools are the fastest place to start.'
          }
          toolNames={['jasper', 'copy-ai', 'sudowrite', 'koala-writer']}
          compareEyebrow={isChinese ? '继续比较' : 'Compare next'}
          compareTitle={isChinese ? '接着缩小范围' : 'Narrow the shortlist next'}
          compareDescription={
            isChinese
              ? '写作工具更适合按任务类型继续往下比，而不是只看热门度。'
              : 'Writing tools are easier to choose by task type than by popularity alone.'
          }
          compareLinks={[
            {
              href: '/best-ai-tools/ai-writing-tools',
              title: isChinese ? '写作工具榜单' : 'Writing tools ranking',
              description: isChinese
                ? '先收窄到更高相关的写作候选，再决定进入哪条更细的比较路径。'
                : 'Start with the highest-fit writing candidates, then decide which narrower comparison path fits best.',
            },
            {
              href: '/guides/ai-writing-tools-comparison',
              title: isChinese ? '写作工具总对比' : 'Writing tools comparison',
              description: isChinese
                ? '适合快速横向看常见写作工具。'
                : 'A fast side-by-side view of common writing tools.',
            },
            {
              href: '/guides/ai-seo-tools-comparison',
              title: isChinese ? 'SEO 工具对比' : 'SEO tools comparison',
              description: isChinese
                ? '如果你更关心搜索流量与内容结构，这里更有参考价值。'
                : 'More useful if search traffic and content structure matter most.',
            },
            {
              href: '/guides/best-free-ai-tools',
              title: isChinese ? '最佳免费 AI 工具' : 'Best free AI tools',
              description: isChinese ? '适合想先试再决定的人。' : 'Helpful if you want to try before committing.',
            },
          ]}
          nextEyebrow={isChinese ? '下一步入口' : 'Where to go next'}
          nextTitle={
            isChinese ? '读完写作指南后，继续这样缩小范围' : 'How to narrow the space after this writing guide'
          }
          nextDescription={
            isChinese
              ? '如果你已经确认自己偏写作工作流，下一步就去写作榜单、分类页和搜索页看真实条目。'
              : 'Once you know writing is the right workflow, move into the writing ranking, category page, and search results to compare real listings.'
          }
          nextLinks={[
            {
              href: '/best-ai-tools/ai-writing-tools',
              title: isChinese ? '进入写作榜单' : 'Open the writing ranking',
              description: isChinese
                ? '先从更高相关的写作候选集合开始。'
                : 'Start with the highest-fit writing shortlist.',
            },
            {
              href: '/categories/text-writing?sort=popular',
              title: isChinese ? '进入写作分类' : 'Open the writing category',
              description: isChinese
                ? '从最接近写作场景的分类页继续筛选。'
                : 'Keep filtering inside the category that maps most closely to writing workflows.',
            },
            {
              href: '/explore?search=writing&sort=popular',
              title: isChinese ? '搜索更多写作工具' : 'Search more writing tools',
              description: isChinese
                ? '回到探索页，按关键词继续扩大候选范围。'
                : 'Return to Explore and widen the shortlist with a writing-focused search.',
            },
          ]}
        />

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_1fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '写作工具看什么' : 'What matters for writing tools'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '能不能稳定写出你想要的内容' : 'Can it consistently produce the content you need?'}
            </h2>
            <div className='mt-4 space-y-3 text-sm leading-6 text-slate-700'>
              <p>
                {isChinese
                  ? '写作工具最重要的不是一次输出有多惊艳，而是能不能稳定地输出合格初稿。你要特别看它是否支持你的内容类型、语气和长度要求。'
                  : 'The key is not whether one output looks great, but whether it can consistently produce a usable first draft. Check content type, tone, and length support.'}
              </p>
              <p>
                {isChinese
                  ? '如果你是内容创作者、营销人员或 SEO 编辑，优先看模板、协作、导出和多轮编辑能力。'
                  : 'If you are a content creator, marketer, or SEO editor, focus on templates, collaboration, export, and multi-round editing.'}
              </p>
            </div>
          </div>

          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '常见问题' : 'FAQ'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '写作类工具最常见的问题' : 'Common questions about writing tools'}
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

        <div className='mx-auto mt-8 max-w-6xl px-4 lg:px-6'>
          <section className='rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '高意图路径' : 'High-intent path'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese
                ? '如果这是你的工具，下一步就去提交或认领'
                : 'If this is your tool, the next step is submission or claiming'}
            </h2>
            <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
              {isChinese
                ? '已经比较到这一步，说明你大概率是在认真筛选或准备上架。把工具提交进来，或者先认领条目，后面再决定是否加速审核。'
                : 'If you are this far into comparison, you are likely filtering seriously or preparing a listing. Submit your tool, or claim the listing first and decide later whether faster review is needed.'}
            </p>
            <div className='mt-5 flex flex-wrap gap-3'>
              <TrackableCtaLink
                href='/submit'
                ctaId='writing_guide_submit'
                ctaLabel='Writing guide submit'
                pageType='guide'
                className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
              >
                {isChinese ? '提交你的工具' : 'Submit your tool'}
              </TrackableCtaLink>
              <TrackableCtaLink
                href='/developer/listing'
                ctaId='writing_guide_claim'
                ctaLabel='Writing guide claim'
                pageType='guide'
                className='inline-flex items-center justify-center rounded-lg border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-800 hover:bg-emerald-50'
              >
                {isChinese ? '认领条目' : 'Claim listing'}
              </TrackableCtaLink>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
