import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, Star } from 'lucide-react';
import { unstable_setRequestLocale } from 'next-intl/server';

import { getPublicToolSummary } from '@/lib/content/publicToolScope';
import { getTopListTopic } from '@/lib/data/topLists';
import { BASE_URL } from '@/lib/env';
import { getEditorialReviewRecord } from '@/lib/seo/contentReviewDates';
import { buildLocalizedPageMetadata } from '@/lib/seo/metadata';
import { generateFAQSchema } from '@/lib/seo/schema';
import { getTopicCatalog } from '@/lib/services/topicTools';
import SeoBreadcrumbs from '@/components/seo/SeoBreadcrumbs';
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

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: {
    locale: string;
    topic: string;
  };
}): Promise<Metadata> {
  unstable_setRequestLocale(params.locale);

  try {
    const topic = getTopListTopic(params.topic);
    const isChinese = params.locale === 'cn' || params.locale === 'tw';
    const topicData = topic ? (await getTopicCatalog()).topics.get(topic.key) : null;
    const title = topic?.title || (isChinese ? 'AI 工具榜单' : 'Best AI tools');
    let description = topic?.description;
    if (topic?.key === 'ai-automation-tools') {
      description = isChinese
        ? 'AI 自动化工具榜单，覆盖工作流编排、触发器、跨工具连接和可维护的重复流程。'
        : 'AI automation tools ranking for workflow orchestration, triggers, cross-tool connections, and maintainable repeatable processes.';
    } else if (topic?.key === 'ai-research-tools') {
      description = isChinese
        ? 'AI 研究工具榜单，覆盖资料发现、证据核对、快速概览和更深的研究工作流。'
        : 'AI research tools ranking for discovery, evidence-checking, quick overviews, and deeper analysis workflows.';
    } else if (topic?.key === 'ai-chatbot-tools') {
      description = isChinese
        ? 'AI 聊天机器人榜单，覆盖问答、写作辅助、知识检索和日常协作入口。'
        : 'AI chatbot tools ranking for Q&A, writing assistance, knowledge retrieval, and daily collaboration entry points.';
    } else if (topic?.key === 'ai-web3-tools') {
      description = isChinese
        ? 'AI Web3 工具榜单，覆盖链上数据、钱包监控、协议研究、告警和 Crypto 工作流。'
        : 'AI Web3 tools ranking for on-chain data, wallet monitoring, protocol research, alerts, and crypto workflows.';
    } else if (topic?.key === 'ai-coding-tools') {
      description = isChinese
        ? 'AI 编程工具榜单，覆盖编码辅助、调试、重构、编辑器体验和开发工作流。'
        : 'AI coding tools ranking for coding assistance, debugging, refactoring, editor experience, and development workflows.';
    } else if (!description) {
      description = isChinese
        ? '按用途整理的 AI 工具榜单，帮助你更快缩小候选。'
        : 'A focused shortlist of useful AI tools, organized by use case.';
    }

    return buildLocalizedPageMetadata({
      locale: params.locale,
      path: `/best-ai-tools/${params.topic}`,
      title,
      description,
      baseUrl: BASE_URL,
      indexable: Boolean(topicData?.indexable),
    });
  } catch (error) {
    console.error('Best AI tools topic metadata failed to render:', error);
    return buildLocalizedPageMetadata({
      locale: params.locale,
      path: `/best-ai-tools/${params.topic}`,
      title: 'Best AI tools',
      description: 'A focused shortlist of useful AI tools, organized by use case.',
      baseUrl: BASE_URL,
      indexable: false,
    });
  }
}

export default async function BestAiToolsTopicPage({
  params,
}: {
  params: {
    locale: string;
    topic: string;
  };
}) {
  unstable_setRequestLocale(params.locale);

  try {
    const { locale, topic: topicKey } = params;
    const isChinese = locale === 'cn' || locale === 'tw';
    const topic = getTopListTopic(topicKey);

    if (!topic) {
      notFound();
    }

    const topicData = (await getTopicCatalog()).topics.get(topic.key)!;
    const { tools, toolCount } = topicData;

    const checkedAt = getEditorialReviewRecord('best-topic-template').reviewedAt;
    const checkedAtLabel = new Intl.DateTimeFormat(isChinese ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(`${checkedAt}T00:00:00Z`));

    const faqs = [
      {
        question: isChinese ? '这个榜单是怎么选出来的？' : 'How is this ranking selected?',
        answer: isChinese
          ? '候选来自站内已发布工具，按主题用途筛选。顺序沿用目录的热门排序，可能包含推广优先项，并不代表独立测评得分。'
          : 'Candidates are published directory tools selected for the topic. Order follows directory popularity, which can prioritize sponsored placements; it is not an independent review score.',
      },
      {
        question: isChinese
          ? '为什么要先看榜单，再看详情页？'
          : 'Why start with a ranking before opening detail pages?',
        answer: isChinese
          ? '榜单能先帮你缩小范围，详情页再帮你确认适合谁、哪里不适合、以及有哪些替代方案。'
          : 'The ranking narrows the field first, then detail pages help confirm fit, trade-offs, and alternatives.',
      },
      {
        question: isChinese ? '下一步通常该做什么？' : 'What is the usual next step?',
        answer: isChinese
          ? '先比较几个候选，再打开详情页和官网，核对价格、使用限制和适合自己的任务。'
          : 'Compare a few candidates, then check pricing, usage limits, and task fit on detail pages and official sites.',
      },
    ];
    const faqSchema = generateFAQSchema(faqs);

    return (
      <div data-topic={topic.key} className='theme-page mx-auto max-w-pc px-4 py-8 lg:px-0'>
        <StructuredDataServer data={faqSchema} />
        <SeoBreadcrumbs
          locale={locale}
          items={[
            { name: isChinese ? '首页' : 'Home', path: '/' },
            { name: isChinese ? 'AI 工具榜单' : 'Best AI Tools', path: '/best-ai-tools' },
            { name: topic.title, path: `/best-ai-tools/${topic.key}` },
          ]}
          className='mb-5'
        />
        <section className='rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8'>
          <h1 className='text-3xl font-bold text-slate-950 lg:text-5xl'>{topic.title}</h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600'>{topic.description}</p>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>{topic.summary}</p>
          <p className='mt-3 text-sm text-slate-500'>
            {isChinese ? '匹配工具数' : 'Matching tools'}: {toolCount} ·{' '}
            {isChinese ? '目录导航核查于' : 'Directory navigation checked'} {checkedAtLabel}
          </p>
          <div className='mt-4 rounded-2xl border border-cyan-100 bg-cyan-50 p-5'>
            <div className='flex items-start gap-3'>
              <CheckCircle2 className='mt-0.5 size-5 text-cyan-700' />
              <div>
                <p className='text-sm font-semibold text-slate-950'>{isChinese ? '筛选规则' : 'Selection rules'}</p>
                <p className='mt-1 text-sm leading-6 text-slate-600'>
                  {isChinese
                    ? '按主题用途筛选已发布工具，沿用目录热门排序（含推广优先项）；次序不是独立测评评分。'
                    : 'Published tools are selected by use case, then use directory popularity order, including sponsored priority. Order is not an independent review score.'}
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className='mt-6' aria-label={isChinese ? '候选工具' : 'Candidate tools'}>
          <div className='mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            {tools.map((tool, index) => {
              const title = getLocalizedText(tool.title, locale);
              const content = getPublicToolSummary(tool.name, locale, getLocalizedText(tool.content, locale));
              const detailHref = `/${locale}/ai/${encodeURIComponent(tool.name)}`;

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
                  ? '当前尚无符合此主题的已发布候选。可以查看选型指南，了解评估时需要核对的条件。'
                  : 'There are currently no published candidates matching this topic. The guide explains what to check when evaluating options.'}
              </div>
            )}
          </div>
        </section>
        <section className='mt-8 space-y-3' aria-label={isChinese ? '常见问题' : 'Frequently asked questions'}>
          {faqs.map((item) => (
            <details key={item.question} className='rounded-lg border border-slate-200 bg-white p-4'>
              <summary className='cursor-pointer text-sm font-semibold text-slate-950'>{item.question}</summary>
              <p className='mt-3 text-sm leading-6 text-slate-600'>{item.answer}</p>
            </details>
          ))}
        </section>
        <nav
          className='mt-8 flex flex-wrap gap-4 text-sm font-semibold text-cyan-800'
          aria-label={isChinese ? '继续选择' : 'Continue choosing'}
        >
          <Link href={`/${locale}${topic.guideHref}`} className='underline'>
            {isChinese ? '查看选择指南' : topic.guideLabel}
          </Link>
          <Link href={`/${locale}/best-ai-tools`} className='underline'>
            {isChinese ? '查看其他任务榜单' : 'Lists for other tasks'}
          </Link>
        </nav>
      </div>
    );
  } catch (error) {
    console.error('Best AI tools topic page failed to render:', error);
    throw error;
  }
}
