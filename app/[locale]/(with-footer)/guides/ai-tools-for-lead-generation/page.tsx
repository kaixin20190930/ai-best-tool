import { Metadata } from 'next';
import Link from 'next/link';
import { ExternalLink, Filter, SearchCheck, Users } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';
import { getAllCategories, getLocalizedField } from '@/lib/services/categories';
import GuideActionSection from '@/components/guides/GuideActionSection';
import { StructuredDataServer } from '@/components/seo/StructuredData';

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
            <Link
              href='/explore?search=lead&sort=popular'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看获客相关工具' : 'Browse lead-gen tools'}
              <ExternalLink className='size-4' />
            </Link>
            <Link
              href='/guides/ai-tools-for-sales'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '回到销售工具指南' : 'Back to sales guide'}
            </Link>
            <Link
              href='/guides/ai-tools-for-lead-generation-comparison'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看获客对比页' : 'Lead-gen comparison'}
            </Link>
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
      </div>
    </>
  );
}
