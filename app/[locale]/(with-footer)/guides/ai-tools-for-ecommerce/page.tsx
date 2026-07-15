import { Metadata } from 'next';
import { CheckCircle2, ExternalLink, ShoppingBag, Sparkles } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';
import { getAllCategories, getLocalizedField } from '@/lib/services/categories';
import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
import { StructuredDataServer } from '@/components/seo/StructuredData';
import { Link } from '@/app/navigation';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Metadata.home' });

  return {
    title:
      locale === 'cn' || locale === 'tw' ? 'AI 电商工具推荐 | AI Best Tool' : `AI tools for ecommerce | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '面向电商、独立站和商品营销的 AI 工具选型指南。'
        : 'A practical guide to AI tools for ecommerce, stores, and product marketing.',
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
    { name: isChinese ? '电商工具' : 'Ecommerce tools', url: `${siteUrl}/${locale}/guides/ai-tools-for-ecommerce` },
  ]);
  const faqs = [
    {
      question: isChinese ? '电商最适合用 AI 做什么？' : 'What are ecommerce teams best using AI for?',
      answer: isChinese
        ? '最适合商品文案、标题、图片处理、客服回复、评论总结和活动素材。'
        : 'They are great for product copy, titles, image handling, customer replies, review summaries, and campaign assets.',
    },
    {
      question: isChinese ? '我应该先看什么？' : 'What should I check first?',
      answer: isChinese
        ? '先看它是否适合商品、库存、营销和客服这几个环节。'
        : 'Start with product, inventory, marketing, and support workflows.',
    },
    {
      question: isChinese ? '免费电商工具够用吗？' : 'Are free ecommerce tools enough?',
      answer: isChinese
        ? '轻量试用常常够用；但如果你要批量处理、品牌一致性和稳定输出，限制会更快出现。'
        : 'Free tiers are often enough for testing. If you need batch processing, brand consistency, and reliable output, limits show up sooner.',
    },
    {
      question: isChinese ? '我可以直接从这里找到电商工具吗？' : 'Can I find ecommerce tools directly from here?',
      answer: isChinese
        ? '可以。你可以先从搜索和分类页开始，再结合评论、截图和更新频率判断。'
        : 'Yes. Start from search and categories, then judge with comments, screenshots, and update frequency.',
    },
  ];
  const faqSchema = generateFAQSchema(faqs);
  const tips = isChinese
    ? [
        '先分清你要处理的是商品、客服、营销还是运营。',
        '看它是否能支持批量和品牌一致性。',
        '如果你在独立站或多渠道销售，优先看导出、自动化和协作。',
      ]
    : [
        'Separate the job first: products, support, marketing, or operations.',
        'Check whether it supports batch workflows and brand consistency.',
        'If you sell through stores or multiple channels, prioritize exports, automation, and collaboration.',
      ];

  return (
    <>
      <StructuredDataServer data={breadcrumbSchema} />
      <StructuredDataServer data={faqSchema} />
      <div className='theme-page mx-auto max-w-6xl px-4 py-8 lg:px-6 lg:py-12'>
        <section className='rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm lg:p-10'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700'>
              <ShoppingBag className='size-4' />
              {isChinese ? '电商工具推荐' : 'Ecommerce tools'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <Sparkles className='size-4' />
              {isChinese ? '商品与转化优先' : 'Products and conversion'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese
              ? 'AI 电商工具推荐：怎么选更适合商品和转化流程'
              : 'AI tools for ecommerce: how to choose one that fits product and conversion workflows'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? '电商最需要的是把商品、客服、营销和运营串起来。这个页面会帮你从批量、品牌一致性和转化效率两个角度判断。'
              : 'Ecommerce needs tools that connect product, support, marketing, and operations. This page helps you judge by batch workflows, brand consistency, and conversion efficiency.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href='/explore?search=ecommerce&sort=popular'
              ctaId='ecommerce_guide_browse_tools'
              ctaLabel='Ecommerce guide browse tools'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看电商工具' : 'Browse ecommerce tools'}
              <ExternalLink className='size-4' />
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/how-to-choose-ai-tools'
              ctaId='ecommerce_guide_choose'
              ctaLabel='Ecommerce guide choose'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '回到选型指南' : 'Back to selection guide'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-productivity-tools'
              ctaId='ecommerce_guide_productivity'
              ctaLabel='Ecommerce guide productivity'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看生产力工具' : 'Productivity tools'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-tools-for-ecommerce-comparison'
              ctaId='ecommerce_guide_comparison'
              ctaLabel='Ecommerce guide comparison'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看电商工具对比' : 'Compare ecommerce tools'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/best-ai-tools/ai-ecommerce-tools'
              ctaId='ecommerce_guide_top_list'
              ctaLabel='Ecommerce guide top list'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
            >
              {isChinese ? '看电商榜单' : 'Open ecommerce ranking'}
            </TrackableCtaLink>
          </div>
        </section>

        <GuideEvidencePanel
          locale={locale}
          checkedAt={checkedAt}
          scope={
            isChinese
              ? '电商页要围绕商品、客服、营销和运营的真实工作流来做，不是单纯堆工具。这个页继续可索引，但会把营销、自动化、客服和榜单入口分层处理，避免和生产力页互相抢词。'
              : 'This ecommerce page should stay centered on real product, support, marketing, and operations workflows rather than merely stacking tools. Keep it indexable, but layer the marketing, automation, support, and ranking paths to avoid competing with productivity pages.'
          }
          items={[
            {
              label: isChinese ? '验证重点' : 'Validation focus',
              value: isChinese ? '商品、客服、活动' : 'Products, support, campaigns',
              note: isChinese
                ? `先确认它是不是在服务电商真实工作流。当前可用分类数：${categoryCount}。`
                : `Confirm it serves actual ecommerce workflows. Current category count: ${categoryCount}.`,
            },
            {
              label: isChinese ? '合并策略' : 'Merge strategy',
              value: isChinese ? '分流到营销/自动化' : 'Route to marketing/automation',
              note: isChinese
                ? '如果目标更偏增长或流程，转去更窄的页。'
                : 'If the goal leans toward growth or workflow automation, move to narrower pages.',
            },
            {
              label: isChinese ? '后续增量' : 'Next increments',
              value: isChinese ? '商品案例、渠道截图' : 'Product cases, channel screenshots',
              note: isChinese
                ? `补真实商品、渠道和运营例子，并保持 ${checkedAt} 的核对记录。`
                : `Add real product, channel, and operations examples while keeping the ${checkedAt} verification record.`,
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
                ? `这页已按真实电商工作流重新核对，优先保留商品、客服、营销和运营入口，目前覆盖 ${categoryCount} 个分类。`
                : `This page has been rechecked against a real ecommerce workflow and keeps product, support, marketing, and operations entry points visible across ${categoryCount} categories.`}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '当前判断' : 'Current judgment'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>
              {isChinese ? '保留索引，强化转化与运营证据' : 'Keep it indexable and strengthen conversion/ops evidence'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '用商品描述、客服自动化和营销流程区分电商页。'
                : 'Use product workflows, support automation, and marketing operations to differentiate ecommerce pages.'}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '下一步' : 'Next step'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>
              {isChinese ? '补真实店铺与运营案例' : 'Add real store and ops cases'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '后续优先补真实店铺流程、客服记录和营销复盘。'
                : 'Next, prioritize real store workflows, support records, and marketing retros.'}
            </p>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '判断顺序' : 'How to judge'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '先看商品与渠道，再看自动化' : 'Start with products and channels, then automation'}
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
              {isChinese ? '电商工具通常在这些分类里' : 'Ecommerce tools often sit in these categories'}
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
            {isChinese ? '高意图榜单' : 'High-intent ranking'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese
              ? '先用榜单缩小 ecommerce shortlist'
              : 'Use the ranking to narrow your ecommerce shortlist first'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经知道自己要比的是商品内容、客服、运营和转化流程，榜单页会比泛目录更快进入决策。'
              : 'If the decision is already about product content, support, store operations, and conversion workflows, the ranking page gets to a decision faster than a broad directory.'}
          </p>
          <div className='mt-5 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href='/best-ai-tools/ai-ecommerce-tools'
              ctaId='ecommerce_guide_ranking_primary'
              ctaLabel='Ecommerce guide ranking primary'
              pageType='guide'
              className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '进入电商榜单' : 'Open ecommerce ranking'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-tools-for-ecommerce-comparison'
              ctaId='ecommerce_guide_ranking_secondary'
              ctaLabel='Ecommerce guide ranking secondary'
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
              {isChinese ? '电商工具看什么' : 'What matters for ecommerce tools'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '能不能帮你稳定推动商品转化' : 'Can it reliably help product conversion?'}
            </h2>
            <div className='mt-4 space-y-3 text-sm leading-6 text-slate-700'>
              <p>
                {isChinese
                  ? '电商工具最重要的是商品和营销流程。你要看它是否能支持商品文案、客服、活动和运营。'
                  : 'Ecommerce tools need to support product and marketing workflows. Check product copy, support, promotions, and operations.'}
              </p>
              <p>
                {isChinese
                  ? '如果你做独立站或多渠道销售，优先看批量、导出、自动化和团队协作。'
                  : 'If you run a store or multiple channels, prioritize batch workflows, exports, automation, and collaboration.'}
              </p>
            </div>
          </div>

          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '常见问题' : 'FAQ'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '电商工具最常见的问题' : 'Common questions about ecommerce tools'}
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
                ctaId='ecommerce_guide_submit'
                ctaLabel='Ecommerce guide submit'
                pageType='guide'
                className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
              >
                {isChinese ? '提交你的工具' : 'Submit your tool'}
              </TrackableCtaLink>
              <TrackableCtaLink
                href='/developer/listing'
                ctaId='ecommerce_guide_claim'
                ctaLabel='Ecommerce guide claim'
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
