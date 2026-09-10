import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, CheckCircle2, Sparkles, Star, Target } from 'lucide-react';
import { unstable_setRequestLocale } from 'next-intl/server';

import { getTopListTopic } from '@/lib/data/topLists';
import { BASE_URL } from '@/lib/env';
import { getEditorialReviewRecord } from '@/lib/seo/contentReviewDates';
import { buildLocalizedPageMetadata } from '@/lib/seo/metadata';
import { generateFAQSchema } from '@/lib/seo/schema';
import { getLocalizedField } from '@/lib/services/tools';
import { getTopicCatalog } from '@/lib/services/topicTools';
import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
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
    const { category, tools, toolCount } = topicData;
    const checkedAt = getEditorialReviewRecord('best-topic-template').reviewedAt;
    const checkedAtLabel = new Intl.DateTimeFormat(isChinese ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(`${checkedAt}T00:00:00Z`));

    const categoryName = category ? getLocalizedField(category.name, locale) : topic.title;
    const faqSchema = generateFAQSchema([
      {
        question: isChinese ? '这个榜单是怎么选出来的？' : 'How is this ranking selected?',
        answer: isChinese
          ? '候选来自站内已发布工具，按主题用途或所属分类筛选。顺序沿用目录的热门排序，可能包含推广优先项，并不代表独立测评得分。'
          : 'Candidates are published directory tools selected for the topic or its category. Order follows directory popularity, which can prioritize sponsored placements; it is not an independent review score.',
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
    ]);
    let nextStepCardValue = 'Compare fit and limits';
    if (topic.key === 'ai-agent-tools') {
      nextStepCardValue = isChinese ? '先对比 Agent，再进详情' : 'Compare agents, then inspect details';
    } else if (isChinese) {
      nextStepCardValue = '对比适用场景和限制';
    }

    let nextStepDescription = topic.nextStep;
    if (isChinese) {
      nextStepDescription =
        topic.key === 'ai-agent-tools'
          ? '先比较 Agent 的权限、集成和人工确认要求，再用自己的任务验证候选。'
          : '先比较候选的适用场景与限制，再查阅详情和官方来源。';
    }
    const isAutomationTopic = topic.key === 'ai-automation-tools';
    const automationExamples = [
      {
        name: 'n8n',
        href: `/${locale}/ai/n8n`,
        hint: isChinese ? '更适合自托管和可视化编排' : 'Best when you want self-hosted, visual orchestration',
      },
      {
        name: 'Zapier',
        href: `/${locale}/ai/zapier`,
        hint: isChinese ? '更适合快速连接常见 SaaS' : 'Best for quickly connecting common SaaS apps',
      },
      {
        name: 'Make',
        href: `/${locale}/ai/make`,
        hint: isChinese ? '适合复杂的多步流程' : 'Useful for more complex multi-step flows',
      },
      {
        name: 'Pipedream',
        href: `/${locale}/ai/pipedream`,
        hint: isChinese ? '适合 API 驱动和开发者工作流' : 'Good for API-driven and developer workflows',
      },
    ];
    const researchExamples = [
      {
        name: 'Perplexity',
        href: `/${locale}/ai/perplexity`,
        hint: isChinese ? '适合快速发现来源和做起点研究' : 'Best for source-friendly discovery and starting research',
      },
      {
        name: 'Elicit',
        href: `/${locale}/ai/elicit`,
        hint: isChinese ? '适合证据驱动和文献梳理' : 'Good for evidence-driven literature review',
      },
      {
        name: 'Hugging Face',
        href: `/${locale}/ai/hugging-face`,
        hint: isChinese ? '适合模型、数据集和生态探索' : 'Useful for models, datasets, and ecosystem exploration',
      },
      {
        name: 'Papers with Code',
        href: `/${locale}/ai/papers-with-code`,
        hint: isChinese ? '适合论文与实现一起看' : 'Best when papers and implementations should be reviewed together',
      },
    ];
    const chatbotExamples = [
      {
        name: 'ChatGPT',
        href: `/${locale}/ai/chatgpt`,
        hint: isChinese ? '通用问答和写作入口' : 'General Q&A and writing entry point',
      },
      {
        name: 'Claude',
        href: `/${locale}/ai/claude`,
        hint: isChinese ? '适合长文档和协作写作' : 'Good for long documents and collaborative writing',
      },
      {
        name: 'Gemini',
        href: `/${locale}/ai/gemini`,
        hint: isChinese ? '适合多模态和日常问答' : 'Useful for multimodal and daily Q&A',
      },
      {
        name: 'Perplexity',
        href: `/${locale}/ai/perplexity`,
        hint: isChinese ? '适合带来源的检索和研究' : 'Useful for source-backed retrieval and research',
      },
    ];
    const web3Examples = [
      {
        name: 'DefiLlama',
        href: `/${locale}/ai/defillama`,
        hint: isChinese ? '适合协议和市场覆盖' : 'Best for protocol and market coverage',
      },
      {
        name: 'Dune',
        href: `/${locale}/ai/dune`,
        hint: isChinese ? '适合查询驱动的链上分析' : 'Good for query-driven on-chain analysis',
      },
      {
        name: 'Nansen',
        href: `/${locale}/ai/nansen`,
        hint: isChinese ? '适合地址和资金流研究' : 'Useful for wallet and flow intelligence',
      },
      {
        name: 'The Graph',
        href: `/${locale}/ai/the-graph`,
        hint: isChinese ? '适合数据基础设施和检索层' : 'Best for data infrastructure and query layers',
      },
    ];
    const codingExamples = [
      {
        name: 'Cursor',
        href: `/${locale}/ai/cursor`,
        hint: isChinese ? '适合编辑器内编码和重构' : 'Great for editor-based coding and refactoring',
      },
      {
        name: 'Bolt.new',
        href: `/${locale}/ai/bolt-new`,
        hint: isChinese ? '适合快速原型和浏览器内构建' : 'Useful for rapid prototyping in the browser',
      },
      {
        name: 'GitHub Copilot',
        href: `/${locale}/ai/github-copilot`,
        hint: isChinese ? '适合补全、解释和日常编码' : 'Useful for completion, explanation, and daily coding',
      },
      {
        name: 'Phind',
        href: `/${locale}/ai/phind`,
        hint: isChinese ? '适合技术问答和代码检索' : 'Good for technical Q&A and code retrieval',
      },
    ];
    const observabilityExamples = [
      {
        name: 'Langfuse',
        href: `/${locale}/ai/langfuse`,
        hint: isChinese ? '适合日志、追踪和质量闭环' : 'Best for logs, traces, and quality loops',
      },
      {
        name: 'Helicone',
        href: `/${locale}/ai/helicone`,
        hint: isChinese ? '适合成本可见性和请求分析' : 'Good for cost visibility and request analysis',
      },
      {
        name: 'Portkey',
        href: `/${locale}/ai/portkey`,
        hint: isChinese ? '适合网关治理和模型路由' : 'Useful for gateway governance and model routing',
      },
      {
        name: 'LangSmith',
        href: `/${locale}/ai/langsmith`,
        hint: isChinese ? '适合回放、评估和调试' : 'Great for replay, evals, and debugging',
      },
    ];
    const seoExamples = [
      {
        name: 'Surfer',
        href: `/${locale}/ai/surfer`,
        hint: isChinese ? '适合内容优化和 brief 执行' : 'Good for content optimization and brief execution',
      },
      {
        name: 'Frase',
        href: `/${locale}/ai/frase`,
        hint: isChinese ? '适合研究到写作的衔接' : 'Useful for research-to-writing workflows',
      },
      {
        name: 'Clearscope',
        href: `/${locale}/ai/clearscope`,
        hint: isChinese ? '适合页面优化和稳定迭代' : 'Great for on-page optimization and repeatable iteration',
      },
      {
        name: 'MarketMuse',
        href: `/${locale}/ai/marketmuse`,
        hint: isChinese ? '适合主题规划和内容策略' : 'Best for topic planning and content strategy',
      },
    ];

    return (
      <div className='theme-page mx-auto max-w-pc px-4 py-8 lg:px-0'>
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

              <div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
                <p className='text-xs font-semibold uppercase tracking-wide text-cyan-100/80'>
                  {isChinese ? '模板复核' : 'Template reviewed'}
                </p>
                <p className='mt-2 text-xl font-bold text-white'>{checkedAtLabel}</p>
                <p className='mt-2 text-sm leading-6 text-slate-200'>
                  {isChinese
                    ? '此日期记录共享模板的复核。各工具的价格、限制和来源日期请到详情页分别核对。'
                    : 'This date records the shared template review. Check each tool detail page for pricing, limits, and source review dates.'}
                </p>
              </div>

              {isAutomationTopic && (
                <div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
                  <p className='text-xs font-semibold uppercase tracking-wide text-cyan-100/80'>
                    {isChinese ? '常见自动化入口' : 'Common automation starting points'}
                  </p>
                  <div className='mt-3 grid gap-3 sm:grid-cols-2'>
                    {automationExamples.map((tool) => (
                      <Link
                        key={tool.name}
                        href={tool.href}
                        className='rounded-xl border border-white/10 bg-slate-950/30 p-3 transition hover:border-cyan-300/40 hover:bg-slate-950/50'
                      >
                        <p className='text-sm font-semibold text-white'>{tool.name}</p>
                        <p className='mt-1 text-xs leading-5 text-slate-300'>{tool.hint}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {topic.key === 'ai-research-tools' && (
                <div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
                  <p className='text-xs font-semibold uppercase tracking-wide text-cyan-100/80'>
                    {isChinese ? '常见研究入口' : 'Common research starting points'}
                  </p>
                  <div className='mt-3 grid gap-3 sm:grid-cols-2'>
                    {researchExamples.map((tool) => (
                      <Link
                        key={tool.name}
                        href={tool.href}
                        className='rounded-xl border border-white/10 bg-slate-950/30 p-3 transition hover:border-cyan-300/40 hover:bg-slate-950/50'
                      >
                        <p className='text-sm font-semibold text-white'>{tool.name}</p>
                        <p className='mt-1 text-xs leading-5 text-slate-300'>{tool.hint}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {topic.key === 'ai-chatbot-tools' && (
                <div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
                  <p className='text-xs font-semibold uppercase tracking-wide text-cyan-100/80'>
                    {isChinese ? '常见聊天机器人入口' : 'Common chatbot starting points'}
                  </p>
                  <div className='mt-3 grid gap-3 sm:grid-cols-2'>
                    {chatbotExamples.map((tool) => (
                      <Link
                        key={tool.name}
                        href={tool.href}
                        className='rounded-xl border border-white/10 bg-slate-950/30 p-3 transition hover:border-cyan-300/40 hover:bg-slate-950/50'
                      >
                        <p className='text-sm font-semibold text-white'>{tool.name}</p>
                        <p className='mt-1 text-xs leading-5 text-slate-300'>{tool.hint}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {topic.key === 'ai-web3-tools' && (
                <div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
                  <p className='text-xs font-semibold uppercase tracking-wide text-cyan-100/80'>
                    {isChinese ? '常见 Web3 入口' : 'Common Web3 starting points'}
                  </p>
                  <div className='mt-3 grid gap-3 sm:grid-cols-2'>
                    {web3Examples.map((tool) => (
                      <Link
                        key={tool.name}
                        href={tool.href}
                        className='rounded-xl border border-white/10 bg-slate-950/30 p-3 transition hover:border-cyan-300/40 hover:bg-slate-950/50'
                      >
                        <p className='text-sm font-semibold text-white'>{tool.name}</p>
                        <p className='mt-1 text-xs leading-5 text-slate-300'>{tool.hint}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {topic.key === 'ai-coding-tools' && (
                <div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
                  <p className='text-xs font-semibold uppercase tracking-wide text-cyan-100/80'>
                    {isChinese ? '常见编程入口' : 'Common coding starting points'}
                  </p>
                  <div className='mt-3 grid gap-3 sm:grid-cols-2'>
                    {codingExamples.map((tool) => (
                      <Link
                        key={tool.name}
                        href={tool.href}
                        className='rounded-xl border border-white/10 bg-slate-950/30 p-3 transition hover:border-cyan-300/40 hover:bg-slate-950/50'
                      >
                        <p className='text-sm font-semibold text-white'>{tool.name}</p>
                        <p className='mt-1 text-xs leading-5 text-slate-300'>{tool.hint}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {topic.key === 'ai-api-observability-tools' && (
                <div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
                  <p className='text-xs font-semibold uppercase tracking-wide text-cyan-100/80'>
                    {isChinese ? '常见可观测入口' : 'Common observability starting points'}
                  </p>
                  <div className='mt-3 grid gap-3 sm:grid-cols-2'>
                    {observabilityExamples.map((tool) => (
                      <Link
                        key={tool.name}
                        href={tool.href}
                        className='rounded-xl border border-white/10 bg-slate-950/30 p-3 transition hover:border-cyan-300/40 hover:bg-slate-950/50'
                      >
                        <p className='text-sm font-semibold text-white'>{tool.name}</p>
                        <p className='mt-1 text-xs leading-5 text-slate-300'>{tool.hint}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {topic.key === 'ai-seo-tools' && (
                <div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
                  <p className='text-xs font-semibold uppercase tracking-wide text-cyan-100/80'>
                    {isChinese ? '常见 SEO 入口' : 'Common SEO starting points'}
                  </p>
                  <div className='mt-3 grid gap-3 sm:grid-cols-2'>
                    {seoExamples.map((tool) => (
                      <Link
                        key={tool.name}
                        href={tool.href}
                        className='rounded-xl border border-white/10 bg-slate-950/30 p-3 transition hover:border-cyan-300/40 hover:bg-slate-950/50'
                      >
                        <p className='text-sm font-semibold text-white'>{tool.name}</p>
                        <p className='mt-1 text-xs leading-5 text-slate-300'>{tool.hint}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className='grid gap-3 sm:grid-cols-3'>
                {[
                  {
                    label: isChinese ? '分类' : 'Category',
                    value: categoryName,
                  },
                  {
                    label: isChinese ? '匹配工具数' : 'Matching tools',
                    value: toolCount.toString(),
                  },
                  {
                    label: isChinese ? '下一步' : 'Next step',
                    value: nextStepCardValue,
                  },
                  {
                    label: isChinese ? '模板复核' : 'Template reviewed',
                    value: checkedAtLabel,
                  },
                ].map((item) => (
                  <div key={item.label} className='rounded-xl border border-white/10 bg-white/5 p-4'>
                    <p className='text-xs font-semibold uppercase tracking-wide text-cyan-100/80'>{item.label}</p>
                    <p className='mt-2 text-sm font-semibold text-white'>{item.value}</p>
                  </div>
                ))}
              </div>

              <div className='grid gap-3 sm:grid-cols-3'>
                {[
                  {
                    title: isChinese ? '为什么看这页' : 'Why this list matters',
                    text: isChinese
                      ? '先帮你把这个主题的候选范围缩窄，再去详情页和官网做判断。'
                      : 'It narrows the topic first so detail pages and official sites are faster to judge.',
                  },
                  {
                    title: isChinese ? '比较什么' : 'What to compare',
                    text: isChinese
                      ? '重点看场景适配、更新状态、定价门槛和真实反馈。'
                      : 'Focus on use-case fit, freshness, pricing thresholds, and real feedback.',
                  },
                  {
                    title: isChinese ? '下一步去哪' : 'Where to go next',
                    text: isChinese
                      ? '到详情页和官网核对价格、限制、来源与适用场景。'
                      : 'Check pricing, limits, sources, and task fit on detail pages and official sites.',
                  },
                ].map((item) => (
                  <div key={item.title} className='rounded-2xl border border-white/10 bg-white/5 p-4'>
                    <p className='text-sm font-semibold text-white'>{item.title}</p>
                    <p className='mt-1 text-sm leading-6 text-slate-200'>{item.text}</p>
                  </div>
                ))}
              </div>

              <div className='flex flex-wrap gap-3'>
                <TrackableCtaLink
                  href={`/${locale}/submit`}
                  ctaId={`${topic.key}_submit`}
                  ctaLabel='Submit a tool'
                  pageType='best_ai_tools_topic'
                  className='inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10'
                >
                  {isChinese ? '提交工具' : 'Submit a tool'}
                  <ArrowRight className='ml-2 size-4' />
                </TrackableCtaLink>
                <TrackableCtaLink
                  href={`/${locale}${topic.comparisonHref}`}
                  ctaId={`${topic.key}_comparison`}
                  ctaLabel='Open comparison'
                  pageType='best_ai_tools_topic'
                  className='inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10'
                >
                  {isChinese ? '进入对比页' : topic.comparisonLabel}
                </TrackableCtaLink>
                <TrackableCtaLink
                  href={`/${locale}${topic.guideHref}`}
                  ctaId={`${topic.key}_guide`}
                  ctaLabel='Back to guide'
                  pageType='best_ai_tools_topic'
                  className='inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10'
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
                        ? '按主题用途或所属分类筛选已发布工具，沿用目录热门排序（含推广优先项）；次序不是独立测评评分。'
                        : 'Published tools are selected by use case or category, then use directory popularity order, including sponsored priority. Order is not an independent review score.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className='mt-4 grid gap-3 sm:grid-cols-3'>
                {[
                  {
                    title: isChinese ? '为什么先看这页' : 'Why this list first',
                    text: isChinese
                      ? '先把主题收窄，再进详情页和官网，能少走很多弯路。'
                      : 'Narrow the topic first, then use detail pages and official sites to avoid wasting time.',
                  },
                  {
                    title: isChinese ? '比较什么' : 'What to compare',
                    text: isChinese
                      ? '重点看场景适配、定价门槛、更新状态和真实反馈。'
                      : 'Focus on use-case fit, pricing thresholds, freshness, and real feedback.',
                  },
                  {
                    title: isChinese ? '要留意什么' : 'What to watch out for',
                    text: isChinese
                      ? '如果候选看起来太像，就立刻下钻到详情页和评论区。'
                      : 'If candidates look too similar, jump into detail pages and comments immediately.',
                  },
                ].map((item) => (
                  <div key={item.title} className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
                    <p className='text-sm font-semibold text-slate-950'>{item.title}</p>
                    <p className='mt-2 text-sm leading-6 text-slate-600'>{item.text}</p>
                  </div>
                ))}
              </div>

              <div className='mt-4 grid gap-3 sm:grid-cols-2'>
                {tools.map((tool, index) => {
                  const title = getLocalizedText(tool.title, locale);
                  const content = getLocalizedText(tool.content, locale);
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
            </div>
          </div>
        </section>

        <GuideEvidencePanel
          locale={locale}
          checkedAt={checkedAt}
          checkedAtLabel={isChinese ? '模板复核' : 'Template reviewed'}
          scope={
            isChinese
              ? '复核范围是共享榜单模板的筛选说明、用途边界和比较步骤；此日期不代表每个工具的事实均已重新核验。'
              : 'The review covers the shared ranking template, selection explanation, use-case boundaries, and comparison steps. It does not reverify every tool fact.'
          }
          items={[
            {
              label: isChinese ? '验证范围' : 'Checked scope',
              value: isChinese ? '排序、边界、下一步' : 'Ranking, boundaries, next step',
              note: isChinese
                ? '了解候选来源和排序含义，再判断是否适合自己的任务。'
                : 'Understand candidate selection and ordering before judging fit for your task.',
            },
            {
              label: isChinese ? '候选来源' : 'Candidate source',
              value: isChinese ? '已发布的工具记录' : 'Published tool records',
              note: isChinese
                ? '候选须匹配主题，并提供可读的名称、简介和官网。'
                : 'Candidates must match the topic and provide a readable name, summary, and official website.',
            },
            {
              label: isChinese ? '使用前核对' : 'Before trying a tool',
              value: isChinese ? '核对价格、限制和来源' : 'Check pricing, limits, and sources',
              note: isChinese
                ? '用自己的任务测试候选能否满足需求。'
                : 'Try your own task to see whether a candidate meets your needs.',
            },
          ]}
          decisionSteps={[
            isChinese ? '先看这个榜单为什么存在。' : 'First understand why this list exists.',
            isChinese
              ? '再筛掉价格、更新或场景不合适的。'
              : 'Then filter out mismatches in price, freshness, or use case.',
            isChinese
              ? '最后在详情页和官网核对条件，再决定是否试用。'
              : 'Finally confirm the terms on detail pages and official sites before deciding to try a tool.',
          ]}
          signalCards={[
            {
              label: isChinese ? '排序信号' : 'Ranking signal',
              value: isChinese ? '先看最接近任务的候选' : 'Start with the closest match to the task',
              note: isChinese
                ? '先排除不能完成核心任务的工具。'
                : 'First remove tools that cannot complete your core task.',
            },
            {
              label: isChinese ? '更新信号' : 'Freshness signal',
              value: isChinese ? '分别核对每个工具的来源日期' : 'Check source dates for each tool',
              note: isChinese
                ? '模板复核日期与工具事实核验日期不同；价格和限制以相关来源为准。'
                : 'Template review and tool fact verification have separate dates; check the relevant sources for pricing and limits.',
            },
            {
              label: isChinese ? '风险信号' : 'Risk signal',
              value: isChinese ? '不适合的条目要尽早踢掉' : 'Drop mismatched entries early',
              note: isChinese
                ? '尽早排除权限、预算或集成不合适的选项，减少试错成本。'
                : 'Rule out mismatches in permissions, budget, or integrations early to reduce wasted trials.',
            },
          ]}
        />

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_360px]'>
          <div className='rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '为什么这页有用' : 'Why this page matters'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '缩小候选范围，核对适用场景和限制' : 'Narrow your options and check fit and limits'}
            </h2>
            <div className='mt-4 grid gap-3 md:grid-cols-3'>
              {[
                {
                  title: isChinese ? '更好比较' : 'Better comparison',
                  text: isChinese ? '让用户先看同类里最相关的几个' : 'Shows the most relevant peers first',
                },
                {
                  title: isChinese ? '更快决策' : 'Faster decisions',
                  text: isChinese
                    ? '对照详情与官方来源确认限制'
                    : 'Confirm limits against details and official sources',
                },
                {
                  title: isChinese ? '下一步明确' : 'Clear next step',
                  text: isChinese
                    ? '继续核对详情、限制和官方来源'
                    : 'Continue with details, limits, and official sources',
                },
              ].map((item) => (
                <div key={item.title} className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
                  <p className='text-sm font-semibold text-slate-950'>{item.title}</p>
                  <p className='mt-1 text-sm leading-6 text-slate-600'>{item.text}</p>
                </div>
              ))}
            </div>
            <p className='mt-4 text-sm leading-6 text-slate-600'>
              {isChinese
                ? `共享模板复核日期为 ${checkedAtLabel}。选择工具时仍需分别核对其价格、限制与来源日期。`
                : `The shared template was reviewed on ${checkedAtLabel}. Check each tool’s pricing, limits, and source dates separately.`}
            </p>
          </div>

          <div className='rounded-[20px] border border-cyan-100 bg-cyan-50 p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-800'>
              {isChinese ? '下一步' : 'Next step'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '对照详情与官方来源，确定试用候选' : 'Check details and official sources before a trial'}
            </h2>
            <p className='mt-2 text-sm leading-6 text-slate-700'>{nextStepDescription}</p>
            <div className='mt-4 flex flex-wrap gap-3'>
              <TrackableCtaLink
                href={`/${locale}${topic.comparisonHref}`}
                ctaId={`${topic.key}_comparison_sidebar`}
                ctaLabel='Open comparison sidebar'
                pageType='best_ai_tools_topic'
                className='inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
              >
                {isChinese ? '先看对比' : topic.comparisonLabel}
              </TrackableCtaLink>
              <TrackableCtaLink
                href={`/${locale}${topic.guideHref}`}
                ctaId={`${topic.key}_guide_sidebar`}
                ctaLabel='Open guide sidebar'
                pageType='best_ai_tools_topic'
                className='inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
              >
                {isChinese ? '回到指南' : topic.guideLabel}
              </TrackableCtaLink>
              <TrackableCtaLink
                href={`/${locale}/submit`}
                ctaId={`${topic.key}_submit_sidebar`}
                ctaLabel='Open submit sidebar'
                pageType='best_ai_tools_topic'
                className='inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
              >
                {isChinese ? '提交工具' : 'Submit a tool'}
              </TrackableCtaLink>
            </div>
          </div>
        </section>
      </div>
    );
  } catch (error) {
    console.error('Best AI tools topic page failed to render:', error);
    throw error;
  }
}
