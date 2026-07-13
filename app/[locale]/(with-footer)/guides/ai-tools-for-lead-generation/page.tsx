import { Metadata } from 'next';
import { ExternalLink, Filter, SearchCheck, Users } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';
import { getAllCategories, getLocalizedField } from '@/lib/services/categories';
import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideActionSection from '@/components/guides/GuideActionSection';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
import { StructuredDataServer } from '@/components/seo/StructuredData';
import { Link } from '@/app/navigation';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Metadata.home' });

  return {
    title:
      locale === 'cn' || locale === 'tw'
        ? 'AI 获客工具推荐 | AI Best Tool'
        : `AI tools for lead generation | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '面向线索发现、名单整理、补全和初步筛选的 AI 工具选型指南。'
        : 'A practical guide to AI tools for lead discovery, list building, enrichment, and early qualification.',
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const categories = await getAllCategories(true).catch(() => []);
  const checkedAt = '2026-07-14';
  const categoryCount = categories.length;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${siteUrl}/${locale}` },
    { name: isChinese ? '指南' : 'Guides', url: `${siteUrl}/${locale}/guides` },
    {
      name: isChinese ? '获客工具' : 'Lead generation tools',
      url: `${siteUrl}/${locale}/guides/ai-tools-for-lead-generation`,
    },
  ]);
  const faqs = [
    {
      question: isChinese ? '获客工具最适合做什么？' : 'What are lead generation tools best for?',
      answer: isChinese
        ? '更适合找目标客户、整理名单、筛掉低价值线索，以及为后续触达做好准备。'
        : 'They are best for finding target accounts, building cleaner lists, filtering weak leads, and preparing for outreach.',
    },
    {
      question: isChinese ? '它和销售工具有什么区别？' : 'How is this different from general sales tools?',
      answer: isChinese
        ? '销售工具更偏 CRM、跟进和成交流程；获客工具更偏在线索进入漏斗之前的发现和筛选。'
        : 'Sales tools lean more toward CRM, follow-up, and pipeline work. Lead-gen tools matter earlier, around discovery and qualification before leads enter the funnel.',
    },
    {
      question: isChinese ? '应该先看哪些维度？' : 'What should I check first?',
      answer: isChinese
        ? '先看数据来源、筛选能力、名单导出方式，以及是否能衔接你后面的跟进工具。'
        : 'Start with data sources, filtering depth, export options, and whether the tool fits the follow-up stack you already use.',
    },
    {
      question: isChinese ? '适合独立开发者或小团队吗？' : 'Is this useful for indie founders or small teams?',
      answer: isChinese
        ? '很适合，尤其当你自己既要找客户又要做内容和产品时，效率差异会很明显。'
        : 'Yes, especially when the same person is handling customer discovery, product work, and content. The efficiency difference shows up quickly.',
    },
  ];
  const tips = isChinese
    ? [
        '先分清你要的是找新名单、补全信息，还是给已有名单做优先级排序。',
        '看它的数据源是不是覆盖你真正要接触的人群，而不是泛泛给出一堆名字。',
        '如果后面还要进销售流程，优先看导出、去重和 CRM 或邮件工具的衔接。',
      ]
    : [
        'Separate list discovery, enrichment, and prioritization before comparing tools.',
        'Check whether the data sources really cover the audience you sell to, not just a generic pile of names.',
        'If leads will move into a sales workflow next, prioritize export quality, deduplication, and CRM or email fit.',
      ];
  const highIntentLanes = [
    {
      href: '/guides/ai-tools-for-lead-generation-comparison',
      title: isChinese ? '先看获客对比页' : 'Start with lead-gen comparison',
      desc: isChinese
        ? '先看名单来源、筛选深度和导出质量。'
        : 'Compare list sources, filtering depth, and export quality first.',
    },
    {
      href: '/best-ai-tools/ai-lead-generation-tools',
      title: isChinese ? '再看获客榜单' : 'Open the lead-gen ranking',
      desc: isChinese
        ? '如果方向已经确定，先用榜单快速收敛 shortlist。'
        : 'Use the ranking to narrow the shortlist once the direction is clear.',
    },
    {
      href: '/guides/ai-tools-for-sales-prospecting-comparison',
      title: isChinese ? '销售拓客对比页' : 'Sales prospecting comparison',
      desc: isChinese
        ? '如果真实任务已经接近外联准备，这页更贴近。'
        : 'A better fit once the work shifts toward outbound prep.',
    },
    {
      href: '/guides/ai-tools-for-sales-comparison',
      title: isChinese ? '销售工具对比页' : 'Sales tools comparison',
      desc: isChinese
        ? '如果你在做跟进、管道和 CRM，这页更合适。'
        : 'More useful if the job has moved into follow-up, pipeline, and CRM work.',
    },
  ];

  return (
    <>
      <StructuredDataServer data={breadcrumbSchema} />
      <StructuredDataServer data={generateFAQSchema(faqs)} />
      <div className='theme-page mx-auto max-w-6xl px-4 py-8 lg:px-6 lg:py-12'>
        <section className='rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm lg:p-10'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700'>
              <Filter className='size-4' />
              {isChinese ? '获客工具推荐' : 'Lead generation tools'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <Users className='size-4' />
              {isChinese ? '发现与筛选优先' : 'Discovery and qualification first'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese
              ? 'AI 获客工具推荐：从找名单到线索初筛，怎么选更合适'
              : 'AI tools for lead generation: how to choose from list discovery to qualification'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? '获客工具真正要解决的，不是“给你更多联系人”，而是帮助你更快找到更像目标客户的人，并把低质量线索尽早筛掉。'
              : 'Lead-generation tools are not just about handing you more contacts. The real job is finding people who look more like your target customer and filtering out weak leads earlier.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href='/explore?search=lead&sort=popular'
              ctaId='lead_generation_guide_browse_tools'
              ctaLabel='Lead generation guide browse tools'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看获客相关工具' : 'Browse lead-gen tools'}
              <ExternalLink className='size-4' />
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-tools-for-sales'
              ctaId='lead_generation_guide_sales'
              ctaLabel='Lead generation guide sales'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '回到销售工具指南' : 'Back to sales guide'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-tools-for-lead-generation-comparison'
              ctaId='lead_generation_guide_comparison'
              ctaLabel='Lead generation guide comparison'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看获客对比页' : 'Lead-gen comparison'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/best-ai-tools/ai-lead-generation-tools'
              ctaId='lead_generation_guide_top_list'
              ctaLabel='Lead generation guide top list'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
            >
              {isChinese ? '看获客榜单' : 'Open lead-gen ranking'}
            </TrackableCtaLink>
          </div>
        </section>

        <section className='mt-8 rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '高意图入口' : 'High-intent paths'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese
              ? '先走最短路径，再决定要不要继续细比'
              : 'Take the shortest path first, then decide whether to compare deeper'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '获客页最适合承接已经很明确的需求：名单发现、信息补全、初筛，或者已经要往销售流程走。'
              : 'This page is best for users with a clear job already: list discovery, enrichment, early qualification, or a move into sales workflows.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {highIntentLanes.map((item) => (
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

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '判断顺序' : 'How to judge'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '先看线索来源，再看筛选效率' : 'Start with lead sources, then filtering efficiency'}
            </h2>
            <div className='mt-4 space-y-3'>
              {tips.map((tip) => (
                <div key={tip} className='rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700'>
                  <div className='flex items-start gap-3'>
                    <SearchCheck className='mt-0.5 size-4 shrink-0 text-emerald-600' />
                    <span>{tip}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className='rounded-[18px] border border-slate-200 bg-slate-50 p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '相关分类' : 'Start here'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '获客工具通常会落在这些分类里' : 'Lead-gen tools often sit in these categories'}
            </h2>
            <div className='mt-4 grid gap-2'>
              {categories
                .filter((category) =>
                  ['productivity', 'automation', 'research', 'developer-tools'].includes(String(category.slug)),
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

        <GuideEvidencePanel
          locale={locale}
          checkedAt={checkedAt}
          scope={
            isChinese
              ? '这页优先检查页面是否能帮助用户完成真实获客判断：名单来源、筛选深度、导出质量和后续销售衔接，而不是只看联系人数量。'
              : 'This page prioritizes whether the guide helps with a real lead-gen decision: list sources, filtering depth, export quality, and sales workflow fit rather than raw contact count.'
          }
          items={[
            {
              label: isChinese ? '判断维度' : 'Decision signals',
              value: isChinese ? '来源、筛选、导出、衔接' : 'Sources, filtering, exports, workflow fit',
              note: isChinese
                ? `重点看它能否把线索变成可用名单。当前可用分类数：${categoryCount}。`
                : `We care about whether it turns leads into usable lists. Current category count: ${categoryCount}.`,
            },
            {
              label: isChinese ? '索引策略' : 'Indexing strategy',
              value: isChinese ? '核心页保留索引' : 'Keep the core page indexable',
              note: isChinese
                ? '让获客意图清楚，减少和销售页的重复。'
                : 'Make the lead-gen intent explicit so it overlaps less with sales pages.',
            },
            {
              label: isChinese ? '下一步补强' : 'Next enrichment',
              value: isChinese ? '补真实获客案例' : 'Add real lead-gen cases',
              note: isChinese
                ? `后续优先补名单样例、筛选规则和外联前流程，并保持 ${checkedAt} 的核对记录。`
                : `Next, priority additions are list examples, filtering rules, and pre-outreach workflow notes while keeping the ${checkedAt} verification record.`,
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
                ? `这页已按真实获客决策重新核对，优先保留名单、筛选和导出入口，目前覆盖 ${categoryCount} 个分类。`
                : `This page has been rechecked against a real lead-gen decision and keeps list, filtering, and export entry points visible across ${categoryCount} categories.`}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '当前判断' : 'Current judgment'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>
              {isChinese ? '保留索引，强化名单工作流证据' : 'Keep it indexable and strengthen list-building evidence'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '用来源、筛选、导出和外联前流程来和销售页区分。'
                : 'Use sources, filtering, exports, and pre-outreach workflow notes to differentiate it from sales pages.'}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '下一步' : 'Next step'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>
              {isChinese ? '补真实名单和筛选案例' : 'Add real list and filtering cases'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '后续优先补名单样例、筛选规则和外联前流程。'
                : 'Next, prioritize list examples, filtering rules, and pre-outreach workflow notes.'}
            </p>
          </div>
        </section>

        <GuideActionSection
          locale={locale}
          eyebrow={isChinese ? '继续缩小范围' : 'Narrow next'}
          title={isChinese ? '把获客需求继续拆细会更容易选' : 'Lead-gen decisions get easier once the job is narrower'}
          description={
            isChinese
              ? '很多人以为自己在找“销售工具”，其实更准确的任务是找名单、补全信息或做触达前的初筛。继续拆细后，决策会更清楚。'
              : 'Many people think they need a broad sales tool when the real job is list building, enrichment, or pre-outreach qualification. Narrowing the job makes the decision much clearer.'
          }
          toolNames={['hunter-io', 'apollo-io', 'zoominfo', 'clay']}
          compareEyebrow={isChinese ? '高意图入口' : 'High-intent paths'}
          compareTitle={isChinese ? '下一步更值得去的 comparison 页面' : 'The next comparison pages worth opening'}
          compareDescription={
            isChinese
              ? '如果你的真实任务已经更接近名单构建或外呼准备，直接走这些页会比停留在泛销售页更有效。'
              : 'If the real job is already closer to list building or outbound prep, these pages are more useful than staying in a broad sales bucket.'
          }
          compareLinks={[
            {
              href: '/guides/ai-tools-for-lead-generation-comparison',
              title: isChinese ? '获客工具对比' : 'Lead generation comparison',
              description: isChinese
                ? '适合横向看名单来源、筛选方式和导出能力。'
                : 'Best for comparing list sources, filtering depth, and export quality.',
            },
            {
              href: '/best-ai-tools/ai-lead-generation-tools',
              title: isChinese ? '获客榜单' : 'Lead-gen ranking',
              description: isChinese
                ? '适合已经确认方向、只想快速缩小 shortlist 的用户。'
                : 'Useful when the direction is clear and the goal is to narrow the shortlist faster.',
            },
            {
              href: '/guides/ai-tools-for-sales-prospecting-comparison',
              title: isChinese ? '销售拓客工具对比' : 'Sales prospecting comparison',
              description: isChinese
                ? '如果你已经要进入触达准备，这页更贴近目标。'
                : 'A better fit once the job has shifted toward outbound preparation and contact strategy.',
            },
            {
              href: '/guides/ai-tools-for-sales-comparison',
              title: isChinese ? '销售工具对比' : 'Sales tools comparison',
              description: isChinese
                ? '如果你发现真实需求已进入跟进和 CRM 流程，回到这页更合适。'
                : 'More useful if the real need has moved into follow-up, pipeline, and CRM work.',
            },
          ]}
          nextEyebrow={isChinese ? '先看这些条目' : 'Start with these listings'}
          nextTitle={
            isChinese ? '当前更贴近获客工作的真实候选' : 'Current listings closer to real lead-generation work'
          }
          nextDescription={
            isChinese
              ? '这一组工具更偏名单发现、信息补全和线索初筛，适合从“找谁”这个问题开始。'
              : 'These tools lean more toward list discovery, enrichment, and early qualification when the real question is who to target first.'
          }
          nextLinks={[
            {
              href: '/ai/hunter-io',
              title: 'Hunter',
              description: isChinese
                ? '更适合快速查邮箱、验证联系人和跑轻量获客。'
                : 'A lighter fit for email finding, contact validation, and quick lead prep.',
            },
            {
              href: '/ai/zoominfo',
              title: 'ZoomInfo',
              description: isChinese
                ? '更偏账户研究、联系人覆盖和更系统的销售情报。'
                : 'Stronger for account depth, contact coverage, and broader sales intelligence.',
            },
            {
              href: '/ai/clay',
              title: 'Clay',
              description: isChinese
                ? '如果你已经进入 enrichment、打标签和 GTM 工作流，这个入口更顺。'
                : 'A better next step once the job has moved into enrichment, scoring, and GTM workflow design.',
            },
          ]}
        />

        <GuideEvidencePanel
          locale={locale}
          scope={
            isChinese
              ? '这页优先检查页面是否能帮助用户完成真实获客判断：名单来源、筛选深度、导出质量和后续销售衔接，而不是只看联系人数量。'
              : 'This page prioritizes whether the guide helps with a real lead-gen decision: list sources, filtering depth, export quality, and sales workflow fit rather than raw contact count.'
          }
          items={[
            {
              label: isChinese ? '判断维度' : 'Decision signals',
              value: isChinese ? '来源、筛选、导出、衔接' : 'Sources, filtering, exports, workflow fit',
              note: isChinese
                ? '重点看它能否把线索变成可用名单。'
                : 'We care about whether it turns leads into usable lists.',
            },
            {
              label: isChinese ? '索引策略' : 'Indexing strategy',
              value: isChinese ? '核心页保留索引' : 'Keep the core page indexable',
              note: isChinese
                ? '让获客意图清楚，减少和销售页的重复。'
                : 'Make the lead-gen intent explicit so it overlaps less with sales pages.',
            },
            {
              label: isChinese ? '下一步补强' : 'Next enrichment',
              value: isChinese ? '补真实获客案例' : 'Add real lead-gen cases',
              note: isChinese
                ? '后续优先补名单样例、筛选规则和外联前流程。'
                : 'Next, priority additions are list examples, filtering rules, and pre-outreach workflow notes.',
            },
          ]}
        />

        <div className='mx-auto mt-8 max-w-6xl px-4 lg:px-6'>
          <section className='rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '高意图榜单' : 'High-intent ranking'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese
                ? '先用榜单缩小 lead-gen shortlist'
                : 'Use the ranking to narrow your lead-gen shortlist first'}
            </h2>
            <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
              {isChinese
                ? '如果你已经知道自己要比的是名单来源、线索筛选和信息补全，榜单页会比泛销售目录更快进入决策。'
                : 'If the decision is already about list sources, qualification, and enrichment, the ranking page gets to a decision faster than a broad sales directory.'}
            </p>
            <div className='mt-5 flex flex-wrap gap-3'>
              <TrackableCtaLink
                href='/best-ai-tools/ai-lead-generation-tools'
                ctaId='lead_generation_guide_ranking_primary'
                ctaLabel='Lead generation guide ranking primary'
                pageType='guide'
                className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
              >
                {isChinese ? '进入获客榜单' : 'Open lead-gen ranking'}
              </TrackableCtaLink>
              <TrackableCtaLink
                href='/guides/ai-tools-for-lead-generation-comparison'
                ctaId='lead_generation_guide_ranking_secondary'
                ctaLabel='Lead generation guide ranking secondary'
                pageType='guide'
                className='inline-flex items-center justify-center rounded-lg border border-cyan-200 bg-white px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-50'
              >
                {isChinese ? '继续看对比页' : 'Continue to comparison'}
              </TrackableCtaLink>
            </div>
          </section>
        </div>

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
                ctaId='lead_gen_submit'
                ctaLabel='Lead generation submit'
                pageType='guide'
                className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
              >
                {isChinese ? '提交你的工具' : 'Submit your tool'}
              </TrackableCtaLink>
              <TrackableCtaLink
                href='/developer/listing'
                ctaId='lead_gen_claim'
                ctaLabel='Lead generation claim'
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
