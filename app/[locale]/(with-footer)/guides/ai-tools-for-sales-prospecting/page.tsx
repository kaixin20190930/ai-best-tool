import { Metadata } from 'next';
import Link from 'next/link';
import { ExternalLink, Mail, SearchCheck, Send } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';
import { getAllCategories, getLocalizedField } from '@/lib/services/categories';
import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideActionSection from '@/components/guides/GuideActionSection';
import { StructuredDataServer } from '@/components/seo/StructuredData';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Metadata.home' });

  return {
    title:
      locale === 'cn' || locale === 'tw'
        ? 'AI 销售拓客工具推荐 | AI Best Tool'
        : `AI tools for sales prospecting | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '面向销售触达准备、个性化外联和 prospecting 工作流的 AI 工具选型指南。'
        : 'A practical guide to AI tools for sales prospecting, personalized outreach prep, and outbound workflow support.',
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
      name: isChinese ? '销售拓客工具' : 'Sales prospecting tools',
      url: `${siteUrl}/${locale}/guides/ai-tools-for-sales-prospecting`,
    },
  ]);
  const faqs = [
    {
      question: isChinese ? '销售拓客工具最适合做什么？' : 'What are sales prospecting tools best for?',
      answer: isChinese
        ? '更适合做联系对象筛选、外联准备、个性化开场和外呼前的信息整理。'
        : 'They are best for choosing who to contact, preparing outreach, personalizing openers, and organizing context before outbound work.',
    },
    {
      question: isChinese ? '它和获客工具有什么区别？' : 'How is this different from lead-generation tools?',
      answer: isChinese
        ? '获客更偏“找谁”，拓客更偏“怎么联系、怎么提高回应率”。'
        : 'Lead generation is more about who to find. Prospecting is more about how to reach out and improve response quality.',
    },
    {
      question: isChinese ? '应该先看什么？' : 'What should I check first?',
      answer: isChinese
        ? '先看它是否能帮助你写出更像真人、和上下文一致的触达内容，而不是只会批量生成模板。'
        : 'Start with whether it helps you write outreach that feels contextual and human, rather than only generating generic bulk templates.',
    },
    {
      question: isChinese ? '适合冷启动阶段吗？' : 'Is this useful in an early-stage go-to-market motion?',
      answer: isChinese
        ? '很适合，尤其是在你还没有成熟销售团队、但已经开始尝试主动接触潜在客户时。'
        : 'Yes, especially when you do not yet have a mature sales team but have started contacting potential customers directly.',
    },
  ];
  const tips = isChinese
    ? [
        '先分清你是在写第一封触达、做名单优先级，还是准备跟进节奏。',
        '看它是否真的利用了目标客户上下文，而不只是批量拼模板。',
        '如果你后面还要追踪回复和转化，优先看和 CRM、邮箱或序列工具的衔接。',
      ]
    : [
        'Separate first-touch outreach, list prioritization, and follow-up sequencing before comparing tools.',
        'Check whether the tool actually uses buyer context instead of mass-producing generic templates.',
        'If replies and conversions will be tracked later, prioritize fit with CRM, email, or sequencing tools.',
      ];

  return (
    <>
      <StructuredDataServer data={breadcrumbSchema} />
      <StructuredDataServer data={generateFAQSchema(faqs)} />
      <div className='theme-page mx-auto max-w-6xl px-4 py-8 lg:px-6 lg:py-12'>
        <section className='rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm lg:p-10'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700'>
              <Send className='size-4' />
              {isChinese ? '销售拓客工具推荐' : 'Sales prospecting tools'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <Mail className='size-4' />
              {isChinese ? '触达准备优先' : 'Outreach prep first'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese
              ? 'AI 销售拓客工具推荐：从外联准备到个性化触达，怎么选更合适'
              : 'AI tools for sales prospecting: how to choose for outreach prep and personalization'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? '销售拓客工具真正要解决的，不是帮你发出更多消息，而是帮助你在联系前更快判断谁值得触达、用什么角度切入更合理。'
              : 'Sales-prospecting tools are not mainly about sending more messages. The real job is deciding who is worth contacting and what angle gives the outreach a better chance of landing.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <Link
              href='/explore?search=sales&sort=popular'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看销售相关工具' : 'Browse sales-related tools'}
              <ExternalLink className='size-4' />
            </Link>
            <Link
              href='/guides/ai-tools-for-sales'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '回到销售工具指南' : 'Back to sales guide'}
            </Link>
            <Link
              href='/guides/ai-tools-for-sales-prospecting-comparison'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看销售拓客对比页' : 'Prospecting comparison'}
            </Link>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '判断顺序' : 'How to judge'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '先看触达上下文，再看自动化' : 'Start with outreach context, then automation'}
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
              {isChinese ? '销售拓客工具通常会落在这些分类里' : 'Prospecting tools often sit in these categories'}
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
          title={
            isChinese
              ? '销售拓客的决策点，通常比“销售工具”更窄'
              : 'Prospecting decisions are usually narrower than “sales tools”'
          }
          description={
            isChinese
              ? '当你已经走到主动联系潜在客户这一步，真正的判断点往往是上下文、个性化和触达节奏，而不是泛功能面板。'
              : 'Once the workflow has reached outbound contact, the real decision points are usually context, personalization, and cadence rather than broad feature catalogs.'
          }
          toolNames={['lemlist', 'outreach', 'salesloft', 'smartlead']}
          compareEyebrow={isChinese ? '高意图入口' : 'High-intent paths'}
          compareTitle={isChinese ? '下一步更值得开的 comparison 页面' : 'The comparison pages worth opening next'}
          compareDescription={
            isChinese
              ? '如果你已经进入触达准备、邮件开场或联系人优先级这类任务，直接进入这些页会更有效。'
              : 'If the work is already about outreach prep, message openers, or contact prioritization, these pages will be more useful immediately.'
          }
          compareLinks={[
            {
              href: '/guides/ai-tools-for-sales-prospecting-comparison',
              title: isChinese ? '销售拓客工具对比' : 'Sales prospecting comparison',
              description: isChinese
                ? '适合横向看外联准备、个性化和触达前判断。'
                : 'Best for comparing outreach prep, personalization, and pre-contact judgment.',
            },
            {
              href: '/guides/ai-tools-for-lead-generation-comparison',
              title: isChinese ? '获客工具对比' : 'Lead generation comparison',
              description: isChinese
                ? '如果真实问题更偏名单来源和线索补全，回到这页更合适。'
                : 'More useful if the real issue is list sourcing and lead enrichment.',
            },
            {
              href: '/guides/ai-tools-for-sales-comparison',
              title: isChinese ? '销售工具对比' : 'Sales tools comparison',
              description: isChinese
                ? '如果流程已经进入跟进和成交，就继续走这里。'
                : 'Continue here once the work has moved into follow-up and pipeline management.',
            },
          ]}
          nextEyebrow={isChinese ? '先看这些条目' : 'Start with these listings'}
          nextTitle={
            isChinese ? '当前更贴近 prospecting 的真实候选' : 'Current listings closer to real prospecting work'
          }
          nextDescription={
            isChinese
              ? '这一组工具更偏触达准备、个性化开场和外联执行，适合从“怎么联系”这个问题开始。'
              : 'These tools lean more toward outreach prep, personalized openers, and execution when the real question is how to contact buyers.'
          }
          nextLinks={[
            {
              href: '/ai/outreach',
              title: 'Outreach',
              description: isChinese
                ? '更适合结构化序列、团队协作和更正式的 prospecting 流程。'
                : 'A stronger fit for structured sequences, team coordination, and formal prospecting flow.',
            },
            {
              href: '/ai/salesloft',
              title: 'Salesloft',
              description: isChinese
                ? '更贴近 cadence 管理、序列维护和团队级 outbound 运营。'
                : 'Closer to cadence management, sequence upkeep, and team-level outbound operations.',
            },
            {
              href: '/ai/lemlist',
              title: 'Lemlist',
              description: isChinese
                ? '如果你更在意个性化外联和回应率，这个入口更自然。'
                : 'A more natural path when reply quality and personalized outreach matter more.',
            },
          ]}
        />

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
                ctaId='sales_prospecting_submit'
                ctaLabel='Sales prospecting submit'
                pageType='guide'
                className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
              >
                {isChinese ? '提交你的工具' : 'Submit your tool'}
              </TrackableCtaLink>
              <TrackableCtaLink
                href='/developer/listing'
                ctaId='sales_prospecting_claim'
                ctaLabel='Sales prospecting claim'
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
