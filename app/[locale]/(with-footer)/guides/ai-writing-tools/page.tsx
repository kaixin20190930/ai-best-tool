import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, ExternalLink, FileText, PenLine } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';
import { getAllCategories, getLocalizedField } from '@/lib/services/categories';
import GuideActionSection from '@/components/guides/GuideActionSection';
import { StructuredDataServer } from '@/components/seo/StructuredData';

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
            <Link
              href='/explore?search=writing&sort=popular'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看写作类工具' : 'Browse writing tools'}
              <ExternalLink className='size-4' />
            </Link>
            <Link
              href='/guides/free-ai-tools'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '先看免费工具' : 'Start with free tools'}
            </Link>
            <Link
              href='/guides/ai-writing-tools-comparison'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看写作工具对比' : 'Compare writing tools'}
            </Link>
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
              ? '如果你已经确认自己偏写作工作流，下一步就去分类页、搜索页和本周新增页看真实条目。'
              : 'Once you know writing is the right workflow, move into category pages, search results, and weekly additions to compare real listings.'
          }
          nextLinks={[
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
            {
              href: '/new',
              title: isChinese ? '看看本周新增' : 'Check new this week',
              description: isChinese
                ? '顺手看看最近补进来的内容里有没有更适合的新候选。'
                : 'See whether recent additions introduced a stronger fit for your workflow.',
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
      </div>
    </>
  );
}
