import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, CheckCircle2, Sparkles, Star, Target } from 'lucide-react';

import { getTopListTopic, topListTopics } from '@/lib/data/topLists';
import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';
import { getCategoryBySlug } from '@/lib/services/categories';
import { getLocalizedField, getTools } from '@/lib/services/tools';
import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import { StructuredDataServer } from '@/components/seo/StructuredData';
import TrackableLink from '@/components/TrackableLink';

function getPricingLabel(pricing: string | undefined, isChinese: boolean) {
  if (pricing === 'free') return isChinese ? '免费' : 'Free';
  if (pricing === 'paid') return isChinese ? '付费' : 'Paid';
  if (pricing === 'freemium') return isChinese ? '免费增值' : 'Freemium';
  return isChinese ? '未标注' : 'Unspecified';
}

function getLocalizedText(value: Record<string, string> | null | undefined, locale: string) {
  if (!value) return '';
  return value[locale] || value.en || value.zh || Object.values(value)[0] || '';
}

export async function generateStaticParams() {
  return topListTopics.map((topic) => ({ topic: topic.key }));
}

export async function generateMetadata({
  params,
}: {
  params: {
    locale: string;
    topic: string;
  };
}): Promise<Metadata> {
  const topic = getTopListTopic(params.topic);
  const isChinese = params.locale === 'cn' || params.locale === 'tw';
  const title = topic?.title || (isChinese ? 'AI 工具榜单' : 'Best AI tools');
  const description =
    topic?.description ||
    (isChinese
      ? '按用途整理的 AI 工具榜单，帮助你更快缩小候选。'
      : 'A focused shortlist of useful AI tools, organized by use case.');

  return {
    title,
    description,
  };
}

export default async function BestAiToolsTopicPage({
  params,
}: {
  params: {
    locale: string;
    topic: string;
  };
}) {
  const { locale, topic: topicKey } = params;
  const isChinese = locale === 'cn' || locale === 'tw';
  const topic = getTopListTopic(topicKey);

  if (!topic) {
    notFound();
  }

  const [categoryResult, toolsResult] = await Promise.allSettled([
    getCategoryBySlug(topic.categorySlug, true),
    getTools({ category: topic.categorySlug, status: 'published' }, { page: 1, pageSize: 8 }, 'popular'),
  ]);

  const category = categoryResult.status === 'fulfilled' ? categoryResult.value : null;
  const tools =
    toolsResult.status === 'fulfilled'
      ? toolsResult.value.data.filter((tool): tool is (typeof toolsResult.value.data)[number] =>
          Boolean(tool?.id && tool?.name && tool?.url && tool?.title && tool?.content),
        )
      : [];
  let toolCount = 0;
  if (category && 'toolCount' in category) {
    toolCount = Number(category.toolCount || 0);
  } else if (toolsResult.status === 'fulfilled') {
    toolCount = Number(toolsResult.value.total || 0);
  }

  const categoryName = category ? getLocalizedField(category.name, locale) : topic.title;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${siteUrl}/${locale}` },
    { name: isChinese ? '榜单页' : 'Rankings', url: `${siteUrl}/${locale}/best-ai-tools` },
    { name: topic.title, url: `${siteUrl}/${locale}/best-ai-tools/${topic.key}` },
  ]);
  const faqSchema = generateFAQSchema([
    {
      question: isChinese ? '这个榜单是怎么选出来的？' : 'How is this ranking selected?',
      answer: isChinese
        ? '我们优先看分类匹配度、实际使用强度、详情页可读性，以及用户下一步是否容易继续比较或提交。'
        : 'We prioritize category fit, practical usage strength, detail-page clarity, and whether the page naturally leads to comparison or submission.',
    },
    {
      question: isChinese ? '为什么要先看榜单，再看详情页？' : 'Why start with a ranking before opening detail pages?',
      answer: isChinese
        ? '榜单能先帮你缩小范围，详情页再帮你确认适合谁、哪里不适合、以及有哪些替代方案。'
        : 'The ranking narrows the field first, then detail pages help confirm fit, trade-offs, and alternatives.',
    },
    {
      question: isChinese ? '下一步通常该做什么？' : 'What is the usual next step?',
      answer: isChinese
        ? '先比较几个候选，再打开详情页和官网；如果你是工具方，则可以继续提交、认领或查看定价。'
        : 'Compare a few candidates, then open detail pages and the official site; if you are the tool owner, continue to submit, claim, or review pricing.',
    },
  ]);
  let nextStepCardValue = 'Compare then submit';
  if (topic.key === 'ai-agent-tools') {
    nextStepCardValue = isChinese ? '先对比 Agent，再进详情' : 'Compare agents, then inspect details';
  } else if (isChinese) {
    nextStepCardValue = '先对比，再提交';
  }

  let nextStepDescription = topic.nextStep;
  if (isChinese) {
    nextStepDescription =
      topic.key === 'ai-agent-tools'
        ? 'Agent 榜单页不是终点，它最适合把你送进 Agent 对比页、详情页和提交页。'
        : '榜单页不是终点，它的作用是把你带到更窄的选择页。';
  }

  return (
    <div className='theme-page mx-auto max-w-pc px-4 py-8 lg:px-0'>
      <StructuredDataServer data={breadcrumbSchema} />
      <StructuredDataServer data={faqSchema} />
      <section className='overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm'>
        <div className='grid gap-0 lg:grid-cols-[1.1fr_0.9fr]'>
          <div className='space-y-6 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 p-6 text-white lg:p-10'>
            <div className='inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-cyan-100 ring-1 ring-white/10'>
              <Target className='size-3.5' />
              {isChinese ? '榜单详情' : 'Ranked list detail'}
            </div>

            <div className='space-y-4'>
              <h1 className='max-w-3xl text-3xl font-bold tracking-tight text-white lg:text-5xl'>{topic.title}</h1>
              <p className='max-w-2xl text-base leading-7 text-slate-200 lg:text-lg'>{topic.description}</p>
              <p className='max-w-2xl text-sm leading-6 text-slate-300'>{topic.summary}</p>
            </div>

            <div className='grid gap-3 sm:grid-cols-3'>
              {[
                {
                  label: isChinese ? '分类' : 'Category',
                  value: categoryName,
                },
                {
                  label: isChinese ? '工具数' : 'Tools',
                  value: toolCount.toString(),
                },
                {
                  label: isChinese ? '下一步' : 'Next step',
                  value: nextStepCardValue,
                },
              ].map((item) => (
                <div key={item.label} className='rounded-xl border border-white/10 bg-white/5 p-4'>
                  <p className='text-xs font-semibold uppercase tracking-wide text-cyan-100/80'>{item.label}</p>
                  <p className='mt-2 text-sm font-semibold text-white'>{item.value}</p>
                </div>
              ))}
            </div>

            <div className='flex flex-wrap gap-3'>
              <TrackableCtaLink
                href={`/${locale}/submit`}
                ctaId={`${topic.key}_submit`}
                ctaLabel='Submit a tool'
                pageType='best_ai_tools_topic'
                className='inline-flex items-center justify-center rounded-lg bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-400'
              >
                {isChinese ? '提交工具' : 'Submit a tool'}
                <ArrowRight className='ml-2 size-4' />
              </TrackableCtaLink>
              <TrackableCtaLink
                href={`/${locale}${topic.comparisonHref}`}
                ctaId={`${topic.key}_comparison`}
                ctaLabel='Open comparison'
                pageType='best_ai_tools_topic'
                className='inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/15'
              >
                {isChinese ? '进入对比页' : topic.comparisonLabel}
              </TrackableCtaLink>
              <TrackableCtaLink
                href={`/${locale}${topic.guideHref}`}
                ctaId={`${topic.key}_guide`}
                ctaLabel='Back to guide'
                pageType='best_ai_tools_topic'
                className='inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10'
              >
                {isChinese ? '返回指南页' : topic.guideLabel}
              </TrackableCtaLink>
            </div>
          </div>

          <div className='bg-slate-50 p-6 lg:p-10'>
            <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
              <div className='flex items-start gap-3'>
                <Sparkles className='mt-0.5 size-5 text-cyan-700' />
                <div>
                  <p className='text-sm font-semibold text-slate-950'>
                    {isChinese ? '这个榜单看什么' : 'What this list is for'}
                  </p>
                  <p className='mt-1 text-sm leading-6 text-slate-600'>{topic.ctaDescription}</p>
                </div>
              </div>
            </div>

            <div className='mt-4 rounded-2xl border border-cyan-100 bg-cyan-50 p-5'>
              <div className='flex items-start gap-3'>
                <CheckCircle2 className='mt-0.5 size-5 text-cyan-700' />
                <div>
                  <p className='text-sm font-semibold text-slate-950'>{isChinese ? '筛选规则' : 'Selection rules'}</p>
                  <p className='mt-1 text-sm leading-6 text-slate-600'>
                    {isChinese
                      ? '优先按真实使用强度、分类相关度和可比较性排序。'
                      : 'Ranked by practical usage strength, category fit, and how easy the tools are to compare.'}
                  </p>
                </div>
              </div>
            </div>

            <div className='mt-4 grid gap-3 sm:grid-cols-2'>
              {tools.map((tool, index) => {
                const title = getLocalizedText(tool.title, locale);
                const content = getLocalizedText(tool.content, locale);
                const detailHref = `/${locale}/ai/${tool.name}`;

                return (
                  <div key={tool.id} className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
                    <div className='flex items-start justify-between gap-3'>
                      <div>
                        <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>#{index + 1}</p>
                        <p className='mt-2 text-base font-semibold text-slate-950'>{title}</p>
                      </div>
                      <div className='rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700'>
                        <Star className='mr-1 inline size-3.5' />
                        {getPricingLabel(tool.pricing, isChinese)}
                      </div>
                    </div>
                    <p className='mt-3 text-sm leading-6 text-slate-600'>{content}</p>
                    <div className='mt-4 flex flex-wrap gap-2'>
                      <Link
                        href={detailHref}
                        className='inline-flex items-center justify-center rounded-lg bg-slate-950 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800'
                      >
                        {isChinese ? '看详情' : 'View detail'}
                      </Link>
                      <TrackableLink
                        href={tool.url}
                        toolId={tool.id}
                        className='inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-cyan-200 hover:text-cyan-700'
                      >
                        {isChinese ? '打开官网' : 'Open official site'}
                      </TrackableLink>
                    </div>
                  </div>
                );
              })}
              {tools.length === 0 && (
                <div className='rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm leading-6 text-slate-600'>
                  {isChinese
                    ? '当前没有可展示的工具数据，但这个榜单页仍可正常打开。'
                    : 'No tool data is available right now, but the list page still opens safely.'}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_360px]'>
        <div className='rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '为什么这页有用' : 'Why this page matters'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese ? '它把流量往更接近转化的地方推' : 'It routes traffic closer to conversion'}
          </h2>
          <div className='mt-4 grid gap-3 md:grid-cols-3'>
            {[
              {
                title: isChinese ? '更好比较' : 'Better comparison',
                text: isChinese ? '让用户先看同类里最相关的几个' : 'Shows the most relevant peers first',
              },
              {
                title: isChinese ? '更快决策' : 'Faster decisions',
                text: isChinese ? '把用户送到详情页和官网' : 'Pushes users toward detail and official site',
              },
              {
                title: isChinese ? '更容易转化' : 'Higher conversion',
                text: isChinese ? '再往下能接提交和付费路径' : 'Naturally leads into submit and pricing',
              },
            ].map((item) => (
              <div key={item.title} className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
                <p className='text-sm font-semibold text-slate-950'>{item.title}</p>
                <p className='mt-1 text-sm leading-6 text-slate-600'>{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className='rounded-[20px] border border-cyan-100 bg-cyan-50 p-6 shadow-sm'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-800'>
            {isChinese ? '下一步' : 'Next step'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese ? '从榜单进到详情，再进到提交' : 'Move from ranking into detail, then into submission'}
          </h2>
          <p className='mt-2 text-sm leading-6 text-slate-700'>{nextStepDescription}</p>
          <div className='mt-4 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href={`/${locale}${topic.comparisonHref}`}
              ctaId={`${topic.key}_comparison_sidebar`}
              ctaLabel='Open comparison sidebar'
              pageType='best_ai_tools_topic'
              className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '先看对比' : topic.comparisonLabel}
            </TrackableCtaLink>
            <TrackableCtaLink
              href={`/${locale}${topic.guideHref}`}
              ctaId={`${topic.key}_guide_sidebar`}
              ctaLabel='Open guide sidebar'
              pageType='best_ai_tools_topic'
              className='inline-flex items-center justify-center rounded-lg border border-cyan-200 bg-white px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-50'
            >
              {isChinese ? '回到指南' : topic.guideLabel}
            </TrackableCtaLink>
          </div>
        </div>
      </section>
    </div>
  );
}
