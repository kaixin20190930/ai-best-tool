import { Metadata } from 'next';
import { CheckCircle2, ExternalLink, FileText, Sparkles } from 'lucide-react';
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
      locale === 'cn' || locale === 'tw' ? '如何选择 AI 工具 | AI Best Tool' : `How to choose AI tools | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '一个实用的 AI 工具选型指南：先看场景，再看价格、更新、截图和评论。'
        : 'A practical guide to choosing AI tools: start with use case, then check pricing, freshness, screenshots, and comments.',
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const categories = await getAllCategories(true).catch(() => []);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${siteUrl}/${locale}` },
    { name: isChinese ? '选型指南' : 'Guides', url: `${siteUrl}/${locale}/guides/how-to-choose-ai-tools` },
  ]);
  const faqs = [
    {
      question: isChinese ? '选 AI 工具时最先看什么？' : 'What should I check first when choosing an AI tool?',
      answer: isChinese
        ? '先看它是不是解决你的核心场景。能不能帮你省时间、提高质量，通常比功能数量更重要。'
        : 'Start with the core use case. Whether it saves time or improves quality usually matters more than the raw number of features.',
    },
    {
      question: isChinese ? '免费工具够用吗？' : 'Are free AI tools enough?',
      answer: isChinese
        ? '很多场景够用，但如果你很在意稳定性、限制、团队协作或支持，付费工具会更完整。'
        : 'For many tasks, yes. But if you care about stability, limits, team workflows, or support, paid tools often feel more complete.',
    },
    {
      question: isChinese ? '怎么判断工具是不是“新”且值得试？' : 'How do I know if a tool is fresh and worth trying?',
      answer: isChinese
        ? '看最近更新时间、评论、截图和是否还在活跃更新。越能看到真实使用痕迹，越值得试。'
        : 'Check the latest update, comments, screenshots, and whether it still looks actively maintained. Real usage signals are a good sign.',
    },
    {
      question: isChinese ? '我可以直接从这里找到适合我的分类吗？' : 'Can I find the right category from here?',
      answer: isChinese
        ? '可以。你可以先从分类页开始，再结合搜索、筛选和评论做进一步判断。'
        : 'Yes. Start with category pages, then refine with search, filters, and comments.',
    },
  ];
  const faqSchema = generateFAQSchema(faqs);
  const tips = isChinese
    ? [
        '先锁定一个真实场景，不要先看功能清单。',
        '优先看最近更新、截图和评论，而不是只看首页文案。',
        '如果你在比较多个工具，先从分类页和搜索结果缩小范围。',
      ]
    : [
        'Start from a real use case, not a feature checklist.',
        'Prefer fresh updates, screenshots, and comments over homepage claims.',
        'If you are comparing tools, narrow the field with category pages and search.',
      ];

  return (
    <>
      <StructuredDataServer data={breadcrumbSchema} />
      <StructuredDataServer data={faqSchema} />
      <div className='theme-page mx-auto max-w-6xl px-4 py-8 lg:px-6 lg:py-12'>
        <section className='rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm lg:p-10'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700'>
              <Sparkles className='size-4' />
              {isChinese ? '选型指南' : 'Selection guide'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <FileText className='size-4' />
              {isChinese ? '更适合先读再选' : 'Read before you choose'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese
              ? '如何选择一个真正适合你的 AI 工具'
              : 'How to choose an AI tool that actually fits your workflow'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? '别先被功能数量带跑，先确认它是不是能解决你的真实场景。这个指南帮你从场景、价格、更新、截图和评论几个维度做判断。'
              : 'Do not get distracted by feature count first. Start from the real problem you want to solve, then check use case fit, pricing, freshness, screenshots, and comments.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href='/explore'
              ctaId='choose_tools_guide_browse_tools'
              ctaLabel='Choose tools guide browse tools'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '去浏览工具' : 'Browse tools'}
              <ExternalLink className='size-4' />
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/best-ai-tools/'
              ctaId='choose_tools_guide_rankings_hub'
              ctaLabel='Choose tools guide rankings hub'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
            >
              {isChinese ? '看榜单总页' : 'Open rankings hub'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides'
              ctaId='choose_tools_guide_all_guides'
              ctaLabel='Choose tools guide all guides'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '查看全部指南' : 'See all guides'}
            </TrackableCtaLink>
          </div>

          <div className='mt-6 grid gap-3 md:grid-cols-3'>
            <div className='rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm'>
              <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
                {isChinese ? '先看什么' : 'What to check first'}
              </p>
              <p className='mt-2 text-sm font-semibold text-slate-950'>
                {isChinese ? '场景是否真的对上' : 'Whether the use case truly fits'}
              </p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '先确认这工具是不是正好解决你的工作流，而不是只是在功能列表里看起来很强。'
                  : 'First confirm the tool solves the workflow you actually care about, not just a strong-looking feature list.'}
              </p>
            </div>
            <div className='rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm'>
              <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
                {isChinese ? '再看什么' : 'What to check next'}
              </p>
              <p className='mt-2 text-sm font-semibold text-slate-950'>
                {isChinese ? '价格、限制和更新频率' : 'Pricing, limits, and freshness'}
              </p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '免费额度、升级门槛和是否持续更新，通常比宣传语更能决定你会不会继续用。'
                  : 'Free tier limits, upgrade thresholds, and freshness usually matter more than marketing lines.'}
              </p>
            </div>
            <div className='rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm'>
              <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
                {isChinese ? '最后看什么' : 'What to confirm last'}
              </p>
              <p className='mt-2 text-sm font-semibold text-slate-950'>
                {isChinese ? '评论、截图和下一步入口' : 'Comments, screenshots, and next steps'}
              </p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '这些信号会告诉你它是不是值得继续比较，还是应该直接换到别的工具或分类。'
                  : 'These signals tell you whether it is worth a deeper comparison or whether you should move on to another tool or category.'}
              </p>
            </div>
          </div>
        </section>

        <GuideEvidencePanel
          locale={locale}
          scope={
            isChinese
              ? '这页优先检查页面是否能帮用户完成真实选型：是否有明确场景、价格或限制、最近更新、截图/评论，以及能否继续进入分类、榜单或工具详情。'
              : 'This page prioritizes whether a tool can support a real selection decision: use case fit, pricing or limits, freshness, screenshots or comments, and clear next steps into categories, rankings, or tool pages.'
          }
          signalCards={[
            {
              label: isChinese ? '价格信号' : 'Pricing signal',
              value: isChinese ? '先看免费限制再看升级门槛' : 'Check free limits before upgrade thresholds',
              note: isChinese
                ? '如果免费版已经很吃紧，后面用起来通常会更快撞墙。'
                : 'If the free tier is already tight, you will usually hit the wall sooner in real use.',
            },
            {
              label: isChinese ? '更新信号' : 'Freshness signal',
              value: isChinese ? '优先看最近更新时间' : 'Prioritize the latest update date',
              note: isChinese
                ? '更新越近，越适合继续往下比较。'
                : 'The fresher the page, the safer it is to keep comparing it.',
            },
            {
              label: isChinese ? '风险信号' : 'Risk signal',
              value: isChinese ? '薄页和旧截图要谨慎' : 'Be careful with thin pages and stale screenshots',
              note: isChinese
                ? '如果没有评论、截图或真实反馈，先别急着下结论。'
                : 'If there are no comments, screenshots, or real feedback, hold off on the conclusion.',
            },
          ]}
          items={[
            {
              label: isChinese ? '判断维度' : 'Decision signals',
              value: isChinese ? '场景、价格、更新、截图、评论' : 'Use case, pricing, freshness, media, feedback',
              note: isChinese
                ? '不只看官网宣传，优先看能帮助用户做选择的可验证信号。'
                : 'We look beyond homepage claims and prioritize signals that help people make a decision.',
            },
            {
              label: isChinese ? '索引策略' : 'Indexing strategy',
              value: isChinese ? '核心指南保留索引' : 'Core guide kept indexable',
              note: isChinese
                ? '同义或较薄的 guide 已进入 noindex / 合并候选，避免互相竞争。'
                : 'Thin or overlapping guides are kept as noindex / merge candidates to reduce internal competition.',
            },
            {
              label: isChinese ? '下一步补强' : 'Next enrichment',
              value: isChinese ? '接入真实评论与 owner 信号' : 'Add reviews and owner signals',
              note: isChinese
                ? '后续优先把评论、收藏、认领和最近验证日期补到核心详情页。'
                : 'Next, priority detail pages will receive review, save, claim, and verification-date signals.',
            },
          ]}
        />

        <section className='mt-8 rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '高意图入口' : 'High-intent path'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese
              ? '如果你已经知道要比哪一类，直接进榜单或类目'
              : 'If you already know the lane, jump straight into rankings or categories'}
          </h2>
          <div className='mt-4 grid gap-3 md:grid-cols-3'>
            <Link
              href='/best-ai-tools/'
              className='rounded-xl border border-white bg-white p-4 shadow-sm hover:bg-slate-50'
            >
              <p className='text-sm font-semibold text-slate-950'>{isChinese ? '榜单总页' : 'Rankings hub'}</p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '如果你要快速进入 shortlist，榜单页通常比泛浏览更快。'
                  : 'If the goal is a shortlist fast, the rankings hub is usually quicker than broad browsing.'}
              </p>
            </Link>
            <Link href='/guides' className='rounded-xl border border-white bg-white p-4 shadow-sm hover:bg-slate-50'>
              <p className='text-sm font-semibold text-slate-950'>{isChinese ? '指南总览' : 'Guides hub'}</p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '如果你还没想清楚方向，就先从专题指南里继续缩小范围。'
                  : 'If the direction is still fuzzy, keep narrowing through the topic guides first.'}
              </p>
            </Link>
            <Link href='/explore' className='rounded-xl border border-white bg-white p-4 shadow-sm hover:bg-slate-50'>
              <p className='text-sm font-semibold text-slate-950'>{isChinese ? 'Explore' : 'Explore'}</p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '如果你更想从真实条目和筛选开始，就直接进 Explore。'
                  : 'If you prefer starting from real listings and filters, go straight into Explore.'}
              </p>
            </Link>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '判断顺序' : 'A simple order'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '先看场景，再看内容细节' : 'Start with the use case, then check details'}
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
              {isChinese ? '快速筛选' : 'Quick filter'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '适合先看的分类' : 'Categories worth starting with'}
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
              {isChinese ? '免费 vs 付费' : 'Free vs paid'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '不是越贵越好，而是越贴近你的需求越好' : 'Not always about price, but fit'}
            </h2>
            <div className='mt-4 space-y-3 text-sm leading-6 text-slate-700'>
              <p>
                {isChinese
                  ? '免费工具适合先试用、先验证；付费工具适合你已经明确需要稳定性、支持或更高限制。'
                  : 'Free tools are great for trying ideas. Paid tools matter when you need stability, support, or fewer limits.'}
              </p>
              <p>
                {isChinese
                  ? '如果你的目标是团队协作、持续内容输出或商业使用，优先把“支持、权限、更新频率”放在第一位。'
                  : 'If your goal is team workflows, ongoing output, or commercial use, put support, permissions, and update frequency first.'}
              </p>
            </div>
          </div>

          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '常见问题' : 'FAQ'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '你可能会问的几个问题' : 'Questions you may ask'}
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

        <section className='mt-8 rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '高意图榜单' : 'High-intent ranking'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese
              ? '先看榜单，再回到选型指南继续缩小范围'
              : 'Start with the ranking, then come back here to narrow the field'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经确定要找 AI 工具，但还没锁定具体方向，先看榜单会比只读概览更快进入决策。'
              : 'If you already know you need an AI tool but have not narrowed the lane yet, the ranking gets you to a decision faster than the overview alone.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/',
                title: isChinese ? '榜单总页' : 'Rankings hub',
                desc: isChinese ? '先缩小 shortlist。' : 'Start with the shortlist first.',
              },
              {
                href: '/guides/ai-tools-for-automation',
                title: isChinese ? '自动化工具指南' : 'Automation guide',
                desc: isChinese ? '如果你更在意流程串联。' : 'Best when workflows and triggers matter more.',
              },
              {
                href: '/guides/ai-tools-for-developers',
                title: isChinese ? '开发者工具指南' : 'Developer guide',
                desc: isChinese ? '如果你更在意模型和工程接入。' : 'Better when model and engineering fit is key.',
              },
              {
                href: '/guides/ai-tools-for-marketing',
                title: isChinese ? '营销工具指南' : 'Marketing guide',
                desc: isChinese ? '如果你在找增长和内容方向。' : 'Useful when growth and content are the target.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`choose_tools_ranking_${item.href.split('/').pop()}`}
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

        <GuideSubmissionPath locale={locale} ctaPrefix='how_to_choose_ai_tools' />
      </div>
    </>
  );
}
