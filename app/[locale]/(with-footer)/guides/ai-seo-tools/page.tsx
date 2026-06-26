import { Metadata } from 'next';
import { ArrowRight, CheckCircle2, ExternalLink, Search, Sparkles } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { Link } from '@/app/navigation';
import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';
import { getAllCategories, getLocalizedField } from '@/lib/services/categories';
import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideActionSection from '@/components/guides/GuideActionSection';
import { StructuredDataServer } from '@/components/seo/StructuredData';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({
    locale,
    namespace: 'Metadata.home',
  });

  return {
    title: locale === 'cn' || locale === 'tw' ? 'AI SEO 工具推荐 | AI Best Tool' : `AI SEO tools | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '适合关键词研究、内容优化和排名跟踪的 AI 工具推荐与选型指南。'
        : 'A practical guide to AI SEO tools for keyword research, content optimization, and rank tracking.',
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const categories = await getAllCategories(true).catch(() => []);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${siteUrl}/${locale}` },
    { name: isChinese ? '指南总览' : 'Guides', url: `${siteUrl}/${locale}/guides` },
    { name: isChinese ? 'SEO 工具' : 'SEO tools', url: `${siteUrl}/${locale}/guides/ai-seo-tools` },
  ]);
  const faqs = [
    {
      question: isChinese ? 'AI SEO 工具最适合什么任务？' : 'What tasks are AI SEO tools best for?',
      answer: isChinese
        ? '最适合关键词研究、内容规划、标题优化、摘要、内部链接建议和排名跟踪。'
        : 'They are best for keyword research, content planning, headline optimization, summaries, internal linking suggestions, and rank tracking.',
    },
    {
      question: isChinese ? '我应该先看什么？' : 'What should I check first?',
      answer: isChinese
        ? '先看它是否支持你真正要做的 SEO 工作流，比如关键词、内容、站内优化或 SERP 追踪。'
        : 'Start with the SEO workflow you actually need, such as keywords, content, on-page optimization, or SERP tracking.',
    },
    {
      question: isChinese ? '免费版够用吗？' : 'Are free SEO tools enough?',
      answer: isChinese
        ? '如果只是做基础研究，很多免费工具可以先用；如果你要批量分析、持续监控或团队协作，通常会更快碰到限制。'
        : 'For basic research, many free tools are enough to start. If you need bulk analysis, ongoing monitoring, or team collaboration, you will likely hit limits sooner.',
    },
    {
      question: isChinese ? '我可以直接从这里找到 SEO 工具吗？' : 'Can I find SEO tools directly from here?',
      answer: isChinese
        ? '可以。你可以先从 SEO 相关分类和搜索结果开始，再结合评论和截图判断。'
        : 'Yes. Start from SEO-related categories and search results, then use comments and screenshots to decide.',
    },
  ];
  const tips = isChinese
    ? [
      '先确认你是做关键词、内容优化、技术 SEO 还是排名监控。',
      '看它是否支持中文、是否有模板、是否能保持建议稳定。',
      '如果你要长期做内容增长，优先看导出、协作和数据更新频率。',
    ]
    : [
      'Start with the workflow: keywords, content optimization, technical SEO, or rank monitoring.',
      'Check whether it supports Chinese, has templates, and keeps recommendations stable.',
      'If you plan to grow content long term, look at exports, collaboration, and data freshness.',
    ];

  return (
    <>
      <StructuredDataServer data={breadcrumbSchema} />
      <StructuredDataServer data={generateFAQSchema(faqs)} />
      <div className='theme-page mx-auto max-w-6xl px-4 py-8 lg:px-6 lg:py-12'>
        <section className='rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm lg:p-10'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700'>
              <Sparkles className='size-4' />
              {isChinese ? 'SEO 工具推荐' : 'SEO tools recommendations'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <Search className='size-4' />
              {isChinese ? '流量增长优先' : 'Growth first'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese
              ? 'AI SEO 工具推荐：从关键词到排名跟踪，怎么选更合适'
              : 'AI SEO tools: how to choose for keywords and rank tracking'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? 'SEO 工具重点不是“报告多”，而是能不能稳定帮你做关键词研究、内容优化和排名跟踪。'
              : 'SEO tools are not just about reports. They need to reliably support keyword research, content optimization, and rank tracking.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href='/explore?search=seo&sort=popular'
              ctaId='seo_guide_browse_tools'
              ctaLabel='SEO guide browse tools'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看 SEO 工具' : 'Browse SEO tools'}
              <ExternalLink className='size-4' />
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-writing-tools'
              ctaId='seo_guide_writing'
              ctaLabel='SEO guide writing'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '回到写作指南' : 'Back to writing guide'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-seo-tools-comparison'
              ctaId='seo_guide_compare'
              ctaLabel='SEO guide compare'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看 SEO 对比页' : 'SEO comparison'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/best-ai-tools/ai-seo-tools'
              ctaId='seo_guide_top_list'
              ctaLabel='SEO guide top list'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
            >
              {isChinese ? '看 SEO 榜单' : 'Open SEO ranking'}
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
                ? '先看场景，再看关键词和内容功能'
                : 'Start with the use case, then keywords and content features'}
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
              {isChinese ? 'SEO 工具通常在这些分类里' : 'SEO tools often sit in these categories'}
            </h2>
            <div className='mt-4 grid gap-2'>
              {categories
                .filter(
                  (category) =>
                    ['text-writing', 'research', 'productivity'].includes(String(category.slug)) ||
                    String(getLocalizedField(category.name, 'en')).toLowerCase().includes('seo'),
                )
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
              ? '把 SEO 入口接到榜单、比较页和真实条目'
              : 'Move from the SEO guide into rankings, comparisons, and real listings'}
          </h2>
          <div className='mt-4 grid gap-4 lg:grid-cols-3'>
            <TrackableCtaLink
              href='/best-ai-tools/ai-seo-tools'
              ctaId='seo_guide_ranking_next'
              ctaLabel='SEO guide ranking next'
              pageType='guide'
              className='group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-white hover:shadow-sm'
            >
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='text-base font-semibold text-slate-950 group-hover:text-cyan-700'>
                    {isChinese ? '看 SEO 榜单' : 'Open SEO ranking'}
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
              href='/guides/ai-seo-tools-comparison'
              ctaId='seo_guide_compare_next'
              ctaLabel='SEO guide compare next'
              pageType='guide'
              className='group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-white hover:shadow-sm'
            >
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='text-base font-semibold text-slate-950 group-hover:text-cyan-700'>
                    {isChinese ? '看 SEO 工具对比' : 'Compare SEO tools'}
                  </p>
                  <p className='mt-2 text-sm leading-6 text-slate-600'>
                    {isChinese
                      ? '当关键词和内容方向清楚后，就进入横向对比。'
                      : 'Once the keyword and content direction is clear, move into side-by-side comparison.'}
                  </p>
                </div>
                <ArrowRight className='mt-1 size-4 shrink-0 text-slate-400 group-hover:text-cyan-700' />
              </div>
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/categories/text-writing?sort=popular'
              ctaId='seo_guide_category'
              ctaLabel='SEO guide category'
              pageType='guide'
              className='group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-white hover:shadow-sm'
            >
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='text-base font-semibold text-slate-950 group-hover:text-cyan-700'>
                    {isChinese ? '进入写作分类' : 'Open the writing category'}
                  </p>
                  <p className='mt-2 text-sm leading-6 text-slate-600'>
                    {isChinese
                      ? '如果你想先看更接近内容生产的真实条目，这里更顺手。'
                      : 'If you want to inspect real listings closer to content work first, this is a cleaner stop.'}
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
          title={isChinese ? '更贴近真实 SEO 内容工作的入口' : 'Real entry points for SEO content workflows'}
          description={
            isChinese
              ? '如果你更关心关键词、内容 brief、页面优化和主题规划，这几款工具会比泛写作页更快进入正题。'
              : 'If keywords, content briefs, page optimization, and topic planning matter most, these tools get you to the real work faster than a general writing page.'
          }
          toolNames={['surfer', 'frase', 'clearscope', 'marketmuse']}
          compareEyebrow={isChinese ? '继续比较' : 'Compare next'}
          compareTitle={isChinese ? '继续缩小 SEO 候选范围' : 'Next SEO comparison paths'}
          compareDescription={
            isChinese
              ? '当你已经知道自己更偏内容优化、brief 生成还是主题规划时，继续进入对比页会更有效。'
              : 'Once you know whether content optimization, brief generation, or topic planning matters most, narrower compare pages work better.'
          }
          compareLinks={[
            {
              href: '/best-ai-tools/ai-seo-tools',
              title: isChinese ? 'SEO 榜单' : 'SEO ranking',
              description: isChinese
                ? '直接进高意图 shortlist，再决定要不要细比。'
                : 'Jump into the high-intent shortlist before deciding whether to compare deeper.',
            },
            {
              href: '/guides/ai-seo-tools-comparison',
              title: isChinese ? 'SEO 工具总对比' : 'SEO tools comparison',
              description: isChinese
                ? '适合快速横向看常见 SEO 工具。'
                : 'A fast side-by-side view of common SEO tools.',
            },
            {
              href: '/guides/ai-writing-tools-comparison',
              title: isChinese ? '写作工具对比' : 'Writing tools comparison',
              description: isChinese
                ? '如果你还在 SEO 与通用写作工具之间犹豫，这里更有参考价值。'
                : 'Useful if you are still deciding between SEO-first and broader writing tools.',
            },
            {
              href: '/guides/ai-tools-for-research-comparison',
              title: isChinese ? '研究工具对比' : 'Research tools comparison',
              description: isChinese
                ? '更适合先做调研、再决定内容方向的人。'
                : 'Better for teams that start with research before content production.',
            },
          ]}
          nextEyebrow={isChinese ? '下一步入口' : 'Where to go next'}
          nextTitle={isChinese ? '确定 SEO 方向后，下一步看这里' : 'Where to go once SEO is clearly the right lane'}
          nextDescription={
            isChinese
              ? '如果你已经明确自己在做搜索流量和内容增长，下一步就去榜单、写作分类和搜索结果看真实条目。'
              : 'If search traffic and content growth are clearly the focus, the next step is to use the ranking, writing category, and targeted search.'
          }
          nextLinks={[
            {
              href: '/best-ai-tools/ai-seo-tools',
              title: isChinese ? '打开 SEO 榜单' : 'Open SEO ranking',
              description: isChinese
                ? '先看 shortlist，再回到分类或对比页收敛。'
                : 'Start with the shortlist, then return to category or comparison pages to narrow further.',
            },
            {
              href: '/categories/text-writing?sort=popular',
              title: isChinese ? '进入写作分类' : 'Open the writing category',
              description: isChinese
                ? '从最接近 SEO 内容工作的分类页继续筛选。'
                : 'Keep filtering inside the category that maps most closely to SEO content workflows.',
            },
            {
              href: '/explore?search=seo&sort=popular',
              title: isChinese ? '搜索更多 SEO 工具' : 'Search more SEO tools',
              description: isChinese
                ? '回到 Explore，用 SEO 关键词扩大候选范围。'
                : 'Return to Explore and widen the shortlist with an SEO-focused search.',
            },
          ]}
        />

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_1fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? 'SEO 工具看什么' : 'What matters for SEO tools'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '能不能稳定帮你做增长' : 'Can it reliably support growth work?'}
            </h2>
            <div className='mt-4 space-y-3 text-sm leading-6 text-slate-700'>
              <p>
                {isChinese
                  ? 'SEO 工具最重要的是关键词、内容建议、排名和数据更新。'
                  : 'Keywords, content guidance, rankings, and data freshness matter most.'}
              </p>
              <p>
                {isChinese
                  ? '如果你做内容增长，优先看导出、协作、监控和重复使用的工作流。'
                  : 'If you do content growth, prioritize exports, collaboration, monitoring, and reusable workflows.'}
              </p>
            </div>
          </div>

          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '常见问题' : 'FAQ'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? 'SEO 工具最常见的问题' : 'Common questions about SEO tools'}
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
                ctaId='seo_guide_submit'
                ctaLabel='SEO guide submit'
                pageType='guide'
                className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
              >
                {isChinese ? '提交你的工具' : 'Submit your tool'}
              </TrackableCtaLink>
              <TrackableCtaLink
                href='/developer/listing'
                ctaId='seo_guide_claim'
                ctaLabel='SEO guide claim'
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
