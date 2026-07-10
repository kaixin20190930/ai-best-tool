import { Metadata } from 'next';
import { ArrowRight, CheckCircle2, ExternalLink, Megaphone, TrendingUp } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';
import { getAllCategories, getLocalizedField } from '@/lib/services/categories';
import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
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
      locale === 'cn' || locale === 'tw' ? 'AI 营销工具推荐 | AI Best Tool' : `AI tools for marketing | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '面向广告、增长、社媒和营销团队的 AI 工具选型指南。'
        : 'A practical guide to AI tools for ads, growth, social, and marketing teams.',
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const categories = await getAllCategories(true).catch(() => []);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${siteUrl}/${locale}` },
    { name: isChinese ? '选型指南' : 'Guides', url: `${siteUrl}/${locale}/guides/how-to-choose-ai-tools` },
    { name: isChinese ? '营销工具' : 'Marketing tools', url: `${siteUrl}/${locale}/guides/ai-tools-for-marketing` },
  ]);
  const faqs = [
    {
      question: isChinese ? '营销团队最适合用 AI 做什么？' : 'What are marketing teams best using AI for?',
      answer: isChinese
        ? '最适合广告文案、邮件、社媒内容、活动素材、A/B 测试文案和营销报告整理。它更像增长和执行助手。'
        : 'They are great for ad copy, email, social content, campaign assets, A/B testing copy, and reporting. Think of them as growth and execution helpers.',
    },
    {
      question: isChinese ? '我应该先看什么？' : 'What should I check first?',
      answer: isChinese
        ? '先看它是否支持你的渠道，比如广告、邮件、社媒、落地页和 CRM。'
        : 'Start with channel fit: ads, email, social, landing pages, and CRM matter most.',
    },
    {
      question: isChinese ? '免费营销工具够吗？' : 'Are free marketing tools enough?',
      answer: isChinese
        ? '轻量内容和测试通常够用；如果你需要协作、批量生产、品牌控制和更稳定的导出，通常会更快碰到限制。'
        : 'Free tiers can work for light content and testing. If you need collaboration, bulk production, brand control, and more reliable exports, limits show up quickly.',
    },
    {
      question: isChinese ? '我可以直接从这里找到营销工具吗？' : 'Can I find marketing tools directly from here?',
      answer: isChinese
        ? '可以。你可以先从搜索和分类页开始，再结合评论、截图和更新频率判断。'
        : 'Yes. Start from search and categories, then judge with comments, screenshots, and update frequency.',
    },
  ];
  const faqSchema = generateFAQSchema(faqs);
  const tips = isChinese
    ? [
        '先分清你做的是投放、增长、社媒、邮件还是内容营销。',
        '看它是否能接到你已有的广告、邮件和 CRM 工具。',
        '如果你要持续迭代，优先看模板、批量、权限和品牌一致性。',
      ]
    : [
        'Separate the work first: ads, growth, social, email, or content marketing all need different tools.',
        'Check whether it plugs into your ad, email, and CRM stack.',
        'If you will iterate often, prioritize templates, batch workflows, permissions, and brand consistency.',
      ];
  const highIntentPaths = [
    {
      href: '/best-ai-tools/ai-marketing-tools',
      title: isChinese ? '先看营销榜单' : 'Start with marketing ranking',
      desc: isChinese ? '先用 shortlist 缩小范围。' : 'Use the shortlist to narrow the field first.',
    },
    {
      href: '/guides/ai-tools-for-marketing-comparison',
      title: isChinese ? '营销工具对比' : 'Marketing tools comparison',
      desc: isChinese ? '广告、邮件、社媒一起看。' : 'Compare ads, email, and social together.',
    },
    {
      href: '/guides/ai-writing-tools-comparison',
      title: isChinese ? '写作工具对比' : 'Writing tools comparison',
      desc: isChinese ? '如果核心是文案和内容产出。' : 'Best when copy and content production are the focus.',
    },
    {
      href: '/guides/ai-tools-for-lead-generation-comparison',
      title: isChinese ? '获客工具对比' : 'Lead generation comparison',
      desc: isChinese ? '如果重点转向线索捕获和补全。' : 'Use this when lead capture and enrichment matter more.',
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
              <Megaphone className='size-4' />
              {isChinese ? '营销工具推荐' : 'Marketing tools'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <TrendingUp className='size-4' />
              {isChinese ? '增长和转化优先' : 'Growth and conversion'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese
              ? 'AI 营销工具推荐：怎么选更适合你的增长工作流'
              : 'AI tools for marketing: how to choose one that fits your growth workflow'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? '营销团队需要的不只是“能写文案”，而是能把广告、邮件、社媒、落地页和报告串起来。这个页面会帮你从渠道和产出效率两个角度判断。'
              : 'Marketing teams need more than "it can write copy." The real value is connecting ads, email, social, landing pages, and reporting. This page helps you judge by channel and output efficiency.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href='/explore?search=marketing&sort=popular'
              ctaId='marketing_guide_browse_tools'
              ctaLabel='Marketing guide browse tools'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看营销工具' : 'Browse marketing tools'}
              <ExternalLink className='size-4' />
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/how-to-choose-ai-tools'
              ctaId='marketing_guide_choose'
              ctaLabel='Marketing guide choose'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '回到选型指南' : 'Back to selection guide'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-writing-tools'
              ctaId='marketing_guide_writing'
              ctaLabel='Marketing guide writing'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看写作工具' : 'Writing tools'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-tools-for-marketing-comparison'
              ctaId='marketing_guide_comparison'
              ctaLabel='Marketing guide comparison'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看营销工具对比' : 'Compare marketing tools'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/best-ai-tools/ai-marketing-tools'
              ctaId='marketing_guide_top_list'
              ctaLabel='Marketing guide top list'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
            >
              {isChinese ? '看营销榜单' : 'Open marketing ranking'}
            </TrackableCtaLink>
          </div>
        </section>

        <GuideEvidencePanel
          locale={locale}
          scope={
            isChinese
              ? '这页优先判断营销工具是否真的能串起广告、邮件、社媒和落地页，而不是只生成看起来不错的文案。'
              : 'This page checks whether marketing tools truly connect ads, email, social, and landing pages instead of only generating copy that looks good.'
          }
          items={[
            {
              label: isChinese ? '验证范围' : 'Checked scope',
              value: isChinese ? '广告、邮件、社媒、落地页' : 'Ads, email, social, landing pages',
              note: isChinese
                ? '先看它是否能嵌入你的渠道栈。'
                : 'First check whether it fits your channel stack.',
            },
            {
              label: isChinese ? '索引策略' : 'Indexing strategy',
              value: isChinese ? '保留索引，接榜单与对比页' : 'Indexable with ranking and comparison paths',
              note: isChinese
                ? '把增长意图导向更具体的选择。'
                : 'Guide growth intent into more specific choices.',
            },
            {
              label: isChinese ? '下一步增强' : 'Next enrichment',
              value: isChinese ? '补真实投放、内容和报告样例' : 'Add real campaign, content, and reporting examples',
              note: isChinese
                ? '减少空泛的营销话术。'
                : 'Reduce generic marketing talk.',
            },
          ]}
        />

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '判断顺序' : 'How to judge'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '先看渠道，再看节省的时间' : 'Start with the channel, then time saved'}
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
              {isChinese ? '营销工具通常在这些分类里' : 'Marketing tools often sit in these categories'}
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
            {isChinese ? '先看榜单和对比，再回到分类页' : 'Compare first, then come back to categories'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经知道自己在找广告、邮件、社媒或内容工具，不要在这里停太久，直接去更窄的榜单和对比页。'
              : 'If you already know you are looking for ads, email, social, or content tools, do not linger here. Move into the narrower ranking and comparison pages.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {highIntentPaths.map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`marketing_guide_${item.href.split('/').pop()}`}
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
              ? '把营销入口接到比较页和真实条目'
              : 'Move from the marketing guide into comparisons and real listings'}
          </h2>
          <div className='mt-4 grid gap-4 lg:grid-cols-3'>
            <Link
              href='/guides/ai-tools-for-marketing-comparison'
              className='group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-white hover:shadow-sm'
            >
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='text-base font-semibold text-slate-950 group-hover:text-cyan-700'>
                    {isChinese ? '看营销工具对比' : 'Compare marketing tools'}
                  </p>
                  <p className='mt-2 text-sm leading-6 text-slate-600'>
                    {isChinese
                      ? '如果你已经知道自己做广告、邮件或社媒，就直接横向比较。'
                      : 'If ads, email, or social is already clear, move straight into comparison.'}
                  </p>
                </div>
                <ArrowRight className='mt-1 size-4 shrink-0 text-slate-400 group-hover:text-cyan-700' />
              </div>
            </Link>
            <Link
              href='/categories/marketing?sort=popular'
              className='group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-white hover:shadow-sm'
            >
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='text-base font-semibold text-slate-950 group-hover:text-cyan-700'>
                    {isChinese ? '进入营销分类' : 'Open the marketing category'}
                  </p>
                  <p className='mt-2 text-sm leading-6 text-slate-600'>
                    {isChinese
                      ? '先看真实条目，再回来收敛到更窄的候选。'
                      : 'Browse real listings first, then come back to narrow the shortlist.'}
                  </p>
                </div>
                <ArrowRight className='mt-1 size-4 shrink-0 text-slate-400 group-hover:text-cyan-700' />
              </div>
            </Link>
            <Link
              href='/explore?search=marketing&sort=popular'
              className='group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-white hover:shadow-sm'
            >
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='text-base font-semibold text-slate-950 group-hover:text-cyan-700'>
                    {isChinese ? '搜索更多营销工具' : 'Search more marketing tools'}
                  </p>
                  <p className='mt-2 text-sm leading-6 text-slate-600'>
                    {isChinese
                      ? '如果你想扩大候选范围，可以回到探索页继续筛。'
                      : 'Use Explore to widen the shortlist a little further.'}
                  </p>
                </div>
                <ArrowRight className='mt-1 size-4 shrink-0 text-slate-400 group-hover:text-cyan-700' />
              </div>
            </Link>
          </div>
        </section>

        <section className='mt-8 rounded-[18px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '高意图榜单' : 'High-intent ranking'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese
              ? '先用榜单缩小 marketing shortlist'
              : 'Use the ranking to narrow your marketing shortlist first'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经知道自己要比的是广告、邮件、社媒和增长工作流，榜单页会比泛目录更快进入决策。'
              : 'If the decision is already about ads, email, social, and growth workflows, the ranking page gets to a decision faster than a broad directory.'}
          </p>
          <div className='mt-5 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href='/best-ai-tools/ai-marketing-tools'
              ctaId='marketing_guide_ranking_primary'
              ctaLabel='Marketing guide ranking primary'
              pageType='guide'
              className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '进入营销榜单' : 'Open marketing ranking'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-tools-for-marketing-comparison'
              ctaId='marketing_guide_ranking_secondary'
              ctaLabel='Marketing guide ranking secondary'
              pageType='guide'
              className='inline-flex items-center justify-center rounded-lg border border-cyan-200 bg-white px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-50'
            >
              {isChinese ? '继续看对比页' : 'Continue to comparison'}
            </TrackableCtaLink>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_1fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '营销工具看什么' : 'What matters for marketing tools'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '能不能稳定支持你的渠道和产出' : 'Can it reliably support your channels and output?'}
            </h2>
            <div className='mt-4 space-y-3 text-sm leading-6 text-slate-700'>
              <p>
                {isChinese
                  ? '营销工具最重要的是渠道适配。你要看它是否能覆盖你正在做的广告、邮件、社媒、落地页和报告。'
                  : 'Channel fit is the key. Check whether it covers the ads, email, social, landing pages, and reports you actually work on.'}
              </p>
              <p>
                {isChinese
                  ? '如果你是增长、内容或投放团队，优先看批量、模板、协作和品牌一致性。'
                  : 'If you work in growth, content, or performance marketing, prioritize batch workflows, templates, collaboration, and brand consistency.'}
              </p>
            </div>
          </div>

          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '常见问题' : 'FAQ'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '营销工具最常见的问题' : 'Common questions about marketing tools'}
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
                ctaId='marketing_guide_submit'
                ctaLabel='Marketing guide submit'
                pageType='guide'
                className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
              >
                {isChinese ? '提交你的工具' : 'Submit your tool'}
              </TrackableCtaLink>
              <TrackableCtaLink
                href='/developer/listing'
                ctaId='marketing_guide_claim'
                ctaLabel='Marketing guide claim'
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
