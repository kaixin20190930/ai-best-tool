import { Metadata } from 'next';
import { CheckCircle2, ExternalLink, Layers3, Workflow } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { getNoindexMetadata } from '@/lib/seo/indexing';
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
        ? 'AI 代理与服务团队工具推荐 | AI Best Tool'
        : `AI tools for agencies | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '面向代理商、服务团队和内容工作室的 AI 工具选型指南。'
        : 'A practical guide to AI tools for agencies, service teams, and content studios.',
    ...getNoindexMetadata(),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const categories = await getAllCategories(true).catch(() => []);
  const checkedAt = '2026-07-18';
  const categoryCount = categories.length;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${siteUrl}/${locale}` },
    { name: isChinese ? '选型指南' : 'Guides', url: `${siteUrl}/${locale}/guides/how-to-choose-ai-tools` },
    { name: isChinese ? '代理与服务团队' : 'Agency tools', url: `${siteUrl}/${locale}/guides/ai-tools-for-agencies` },
  ]);
  const faqs = [
    {
      question: isChinese ? '代理团队最适合用 AI 做什么？' : 'What are agencies best using AI for?',
      answer: isChinese
        ? '最适合提案、研究、文案、批量内容、客户汇报和内部协作。代理团队通常最在意的是交付效率和流程一致性。'
        : 'They are great for proposals, research, copywriting, bulk content, reporting, and internal collaboration. Agencies usually care most about delivery efficiency and process consistency.',
    },
    {
      question: isChinese ? '我应该先看什么？' : 'What should I check first?',
      answer: isChinese
        ? '先看它是否适合多人协作、权限管理、客户隔离和项目交付。'
        : 'Start with collaboration, permissions, client separation, and delivery workflows.',
    },
    {
      question: isChinese ? '免费版够用吗？' : 'Is the free tier enough?',
      answer: isChinese
        ? '个人试用可能够用，但服务团队通常会更快遇到权限、数量、导出和协作限制。'
        : 'A free tier may work for testing, but service teams usually hit limits faster on permissions, volume, exports, and collaboration.',
    },
    {
      question: isChinese ? '我可以直接从这里找到代理工具吗？' : 'Can I find agency tools directly from here?',
      answer: isChinese
        ? '可以。你可以先从搜索和分类页开始，再结合评论、截图和更新频率判断。'
        : 'Yes. Start from search and categories, then judge with comments, screenshots, and update frequency.',
    },
  ];
  const faqSchema = generateFAQSchema(faqs);
  const tips = isChinese
    ? [
        '先分清你是代理商、服务团队、内容工作室还是顾问。',
        '看它能不能支持项目分工、客户隔离、批量交付和版本控制。',
        '如果你多人协作，优先看权限、共享、审计和导出能力。',
      ]
    : [
        'Separate the operating model first: agency, service team, content studio, or consultancy.',
        'Check whether it supports project breakdown, client separation, bulk delivery, and versioning.',
        'If multiple people collaborate, prioritize permissions, sharing, auditability, and export flows.',
      ];
  const highIntentPaths = [
    {
      href: '/guides/ai-tools-for-content-creation-comparison',
      title: isChinese ? '内容创作对比' : 'Content creation comparison',
      desc: isChinese ? '如果你交付里有大量内容产出。' : 'Useful when content production is a big part of delivery.',
    },
    {
      href: '/guides/ai-tools-for-marketing-comparison',
      title: isChinese ? '营销工具对比' : 'Marketing tools comparison',
      desc: isChinese ? '如果你需要更强的获客和文案工作流。' : 'Best when acquisition and copy workflows matter more.',
    },
    {
      href: '/guides/ai-tools-for-automation-comparison',
      title: isChinese ? '自动化工具对比' : 'Automation tools comparison',
      desc: isChinese
        ? '如果你想把批量交付和流程串起来。'
        : 'Helpful for connecting bulk delivery and repeatable workflows.',
    },
    {
      href: '/best-ai-tools/ai-agency-tools',
      title: isChinese ? '代理榜单' : 'Agency ranking',
      desc: isChinese ? '先用榜单缩小 shortlist。' : 'Use the shortlist to narrow the field first.',
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
              <Layers3 className='size-4' />
              {isChinese ? '代理与服务团队工具推荐' : 'Agency tools'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <Workflow className='size-4' />
              {isChinese ? '交付与协作优先' : 'Delivery and collaboration'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese
              ? 'AI 代理与服务团队工具推荐：怎么选更适合交付流程'
              : 'AI tools for agencies: how to choose one that fits delivery workflows'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? '代理商和服务团队真正关心的不是“能不能生成”，而是能不能帮你更稳定地交付项目、分工、客户隔离和批量输出。这个页面会帮你从协作和交付效率两个角度判断。'
              : 'Agencies and service teams care less about whether a tool can generate something and more about whether it helps you deliver projects consistently, split work, separate clients, and produce in volume. This page helps you judge by collaboration and delivery efficiency.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href='/explore?search=agency&sort=popular'
              ctaId='agencies_guide_browse_tools'
              ctaLabel='Agencies guide browse tools'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看代理工具' : 'Browse agency tools'}
              <ExternalLink className='size-4' />
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/how-to-choose-ai-tools'
              ctaId='agencies_guide_choose'
              ctaLabel='Agencies guide choose'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '回到选型指南' : 'Back to selection guide'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-productivity-tools'
              ctaId='agencies_guide_productivity'
              ctaLabel='Agencies guide productivity'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看生产力工具' : 'Productivity tools'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-tools-for-agencies-comparison'
              ctaId='agencies_guide_comparison'
              ctaLabel='Agencies guide comparison'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看代理工具对比' : 'Compare agency tools'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/best-ai-tools/ai-agency-tools'
              ctaId='agencies_guide_top_list'
              ctaLabel='Agencies guide top list'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
            >
              {isChinese ? '看代理榜单' : 'Open agency ranking'}
            </TrackableCtaLink>
          </div>
        </section>

        <GuideEvidencePanel
          locale={locale}
          checkedAt={checkedAt}
          scope={
            isChinese
              ? '代理页要围绕交付、分工、客户隔离和批量输出来做，不要和泛生产力页混在一起。这个页继续可索引，但会把内容创作、营销和自动化路径优先分层。'
              : 'This agency page should stay centered on delivery, role splitting, client separation, and bulk output rather than blending into generic productivity. Keep it indexable, but layer content creation, marketing, and automation paths first.'
          }
          decisionSteps={[
            isChinese
              ? '先判断你是代理商、服务团队、内容工作室还是顾问。'
              : 'First decide whether you are an agency, service team, content studio, or consultancy.',
            isChinese
              ? '如果方向清楚，就先去对应的代理对比页。'
              : 'If the direction is clear, go to the matching agency comparison page first.',
            isChinese
              ? '如果要长期用，再回来补真实项目和权限流程。'
              : 'If you will use it long term, come back for real project cases and permissions workflows.',
          ]}
          items={[
            {
              label: isChinese ? '验证重点' : 'Validation focus',
              value: isChinese ? '交付、分工、隔离' : 'Delivery, roles, separation',
              note: isChinese
                ? `确认它是不是能支撑团队交付。目前可用分类数：${categoryCount}。`
                : `Confirm it supports team delivery. Current category count: ${categoryCount}.`,
            },
            {
              label: isChinese ? '合并策略' : 'Merge strategy',
              value: isChinese ? '分流到内容/营销' : 'Route to content/marketing',
              note: isChinese
                ? '如果需求更偏生产内容，就转到更窄页。'
                : 'If the need is mostly content production, move to a narrower page.',
            },
            {
              label: isChinese ? '后续增量' : 'Next increments',
              value: isChinese ? '项目案例、权限、流程' : 'Project cases, permissions, workflows',
              note: isChinese
                ? `补真实交付案例和团队流程，并保持 ${checkedAt} 的核对记录。`
                : `Add real delivery cases and team workflows while keeping the ${checkedAt} verification record.`,
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
                ? `这页已按真实代理交付决策重新核对，优先保留分工、客户隔离和批量输出入口，目前覆盖 ${categoryCount} 个分类。`
                : `This page has been rechecked against a real agency-delivery decision and keeps role splitting, client separation, and bulk-output entry points visible across ${categoryCount} categories.`}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '当前判断' : 'Current judgment'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>
              {isChinese ? '保留索引，强化交付流程证据' : 'Keep it indexable and strengthen delivery workflow evidence'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '用项目案例、权限和团队流程来区分它和泛生产力页。'
                : 'Use project cases, permissions, and team workflows to distinguish it from generic productivity pages.'}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '下一步' : 'Next step'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>
              {isChinese
                ? `补真实项目和流程案例，并持续保留 ${checkedAt} 的核对记录。`
                : `Add real project and workflow cases while keeping the ${checkedAt} verification record.`}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '后续优先补真实交付案例、权限和团队工作流记录。'
                : 'Next, prioritize real delivery cases, permissions, and team workflow notes.'}
            </p>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '判断顺序' : 'How to judge'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '先看交付方式，再看功能范围' : 'Start with delivery model, then feature scope'}
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
              {isChinese ? '代理工具通常在这些分类里' : 'Agency tools often sit in these categories'}
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
              {isChinese ? '代理工具看什么' : 'What matters for agency tools'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '能不能稳定支撑你的项目交付' : 'Can it reliably support your delivery pipeline?'}
            </h2>
            <div className='mt-4 space-y-3 text-sm leading-6 text-slate-700'>
              <p>
                {isChinese
                  ? '代理和服务团队最重要的是流程与协作。你要看它能不能支持项目分工、客户隔离、版本管理和批量输出。'
                  : 'For agencies, process and collaboration matter most. Check whether it supports project splitting, client separation, versioning, and bulk output.'}
              </p>
              <p>
                {isChinese
                  ? '如果你需要多人交付，优先看权限、共享、审计和导出能力。'
                  : 'If multiple people deliver work together, prioritize permissions, sharing, auditability, and export workflows.'}
              </p>
            </div>
          </div>

          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '常见问题' : 'FAQ'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '代理与服务团队最常见的问题' : 'Common questions about agency tools'}
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
            {isChinese ? '高意图榜单' : 'High-intent ranking'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese ? '先用榜单缩小 agency shortlist' : 'Use the ranking to narrow your agency shortlist first'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经知道自己在比交付、协作、客户隔离和批量输出，榜单页会比泛目录更快进入决策。'
              : 'If the decision is already about delivery, collaboration, client separation, and bulk output, the ranking page gets to a decision faster than a broad directory.'}
          </p>
          <div className='mt-5 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href='/best-ai-tools/ai-agency-tools'
              ctaId='agencies_guide_ranking_primary'
              ctaLabel='Agencies guide ranking primary'
              pageType='guide'
              className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '进入代理榜单' : 'Open agency ranking'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-tools-for-agencies-comparison'
              ctaId='agencies_guide_ranking_secondary'
              ctaLabel='Agencies guide ranking secondary'
              pageType='guide'
              className='inline-flex items-center justify-center rounded-lg border border-cyan-200 bg-white px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-50'
            >
              {isChinese ? '继续看对比页' : 'Continue to comparison'}
            </TrackableCtaLink>
          </div>
        </section>

        <section className='mt-8 rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '高意图路径' : 'High-intent paths'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese
              ? '先走最短路径，再决定要不要继续细比'
              : 'Take the shortest path first, then decide whether to compare deeper'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经知道自己的工作主要是内容、营销、自动化或客户交付，就直接去更窄的页。'
              : 'If your work is mainly content, marketing, automation, or client delivery, move directly into the narrower pages.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {highIntentPaths.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className='rounded-xl border border-white bg-white p-4 shadow-sm transition hover:border-cyan-200 hover:bg-cyan-50/60'
              >
                <p className='text-sm font-semibold text-slate-950'>{item.title}</p>
                <p className='mt-2 text-sm leading-6 text-slate-600'>{item.desc}</p>
              </Link>
            ))}
          </div>
        </section>
        <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_agencies' />
      </div>
    </>
  );
}
