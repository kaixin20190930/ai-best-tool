import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, CheckCircle2, Sparkles, Star, Target } from 'lucide-react';

import { getTopListTopic, topListTopics } from '@/lib/data/topLists';
import { BASE_URL } from '@/lib/env';
import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';
import { getCategoryBySlug } from '@/lib/services/categories';
import { getLocalizedField, getTools } from '@/lib/services/tools';
import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
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

function isValidTopicTool(tool: {
  id?: string;
  name?: string;
  url?: string;
  title?: unknown;
  content?: unknown;
}): boolean {
  return Boolean(tool?.id && tool?.name && tool?.url && tool?.title && tool?.content);
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
  try {
    const topic = getTopListTopic(params.topic);
    const isChinese = params.locale === 'cn' || params.locale === 'tw';
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

    return {
      title,
      description,
    };
  } catch (error) {
    console.error('Best AI tools topic metadata failed to render:', error);
    return {
      title: 'Best AI tools',
      description: 'A focused shortlist of useful AI tools, organized by use case.',
    };
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
  try {
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
    const tools = toolsResult.status === 'fulfilled' ? toolsResult.value.data.filter(isValidTopicTool) : [];
    let toolCount = 0;
    if (category && 'toolCount' in category) {
      toolCount = Number(category.toolCount || 0);
    } else if (toolsResult.status === 'fulfilled') {
      toolCount = Number(toolsResult.value.total || 0);
    }
    const checkedAt = '2026-07-18';
    const checkedAtLabel = new Intl.DateTimeFormat(isChinese ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(checkedAt));

    const categoryName = category ? getLocalizedField(category.name, locale) : topic.title;
    const breadcrumbSchema = generateBreadcrumbSchema([
      { name: 'Home', url: `${BASE_URL}/${locale}` },
      { name: isChinese ? '榜单页' : 'Rankings', url: `${BASE_URL}/${locale}/best-ai-tools` },
      { name: topic.title, url: `${BASE_URL}/${locale}/best-ai-tools/${topic.key}` },
    ]);
    const faqSchema = generateFAQSchema([
      {
        question: isChinese ? '这个榜单是怎么选出来的？' : 'How is this ranking selected?',
        answer: isChinese
          ? '我们优先看分类匹配度、实际使用强度、详情页可读性，以及用户下一步是否容易继续比较或提交。'
          : 'We prioritize category fit, practical usage strength, detail-page clarity, and whether the page naturally leads to comparison or submission.',
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

              <div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
                <p className='text-xs font-semibold uppercase tracking-wide text-cyan-100/80'>
                  {isChinese ? '最近核查' : 'Last checked'}
                </p>
                <p className='mt-2 text-xl font-bold text-white'>{checkedAtLabel}</p>
                <p className='mt-2 text-sm leading-6 text-slate-200'>
                  {isChinese
                    ? '这个榜单页会继续把你导向更窄的比较页、详情页和提交路径，而不是只停在主题列表。'
                    : 'This list keeps routing people into narrower comparison pages, detail pages, and submission paths instead of stopping at the topic list.'}
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
                    label: isChinese ? '工具数' : 'Tools',
                    value: toolCount.toString(),
                  },
                  {
                    label: isChinese ? '下一步' : 'Next step',
                    value: nextStepCardValue,
                  },
                  {
                    label: isChinese ? '最近检查' : 'Last checked',
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
                      ? '看完榜单就进详情页、评论区，或者直接去提交 / 认领。'
                      : 'After the list, go to detail pages, comments, or submit / claim.',
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
                        ? '优先按真实使用强度、分类相关度和可比较性排序。'
                        : 'Ranked by practical usage strength, category fit, and how easy the tools are to compare.'}
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
                      ? '当前没有可展示的工具数据，但这个榜单页仍可正常打开。'
                      : 'No tool data is available right now, but the list page still opens safely.'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <GuideEvidencePanel
          locale={locale}
          scope={
            isChinese
              ? '这个榜单页先说明排序依据、用途边界和下一步怎么继续比较，避免用户把榜单当成纯流量页。'
              : 'This ranking page explains the sorting basis, use-case boundaries, and the next comparison step so users do not treat it as a pure traffic page.'
          }
          items={[
            {
              label: isChinese ? '验证范围' : 'Checked scope',
              value: isChinese ? '排序、边界、下一步' : 'Ranking, boundaries, next step',
              note: isChinese
                ? '先让榜单页说清楚自己为什么这样排。'
                : 'Make the ranking page explain why it is ordered this way.',
            },
            {
              label: isChinese ? '索引策略' : 'Indexing strategy',
              value: isChinese ? '榜单页保留索引' : 'Ranking page kept indexable',
              note: isChinese
                ? '承接高意图主题搜索，不要让它变成空壳页。'
                : 'Capture high-intent topic searches instead of leaving it as a thin shell page.',
            },
            {
              label: isChinese ? '下一步增强' : 'Next enrichment',
              value: isChinese ? '补方法、评论和筛选说明' : 'Add method notes, comments, and filtering notes',
              note: isChinese ? '让榜单更像决策页。' : 'Make the ranking feel like a decision page.',
            },
          ]}
          decisionSteps={[
            isChinese ? '先看这个榜单为什么存在。' : 'First understand why this list exists.',
            isChinese
              ? '再筛掉价格、更新或场景不合适的。'
              : 'Then filter out mismatches in price, freshness, or use case.',
            isChinese
              ? '最后进入详情、官网或提交路径。'
              : 'Finally move into detail, the official site, or submission paths.',
          ]}
          signalCards={[
            {
              label: isChinese ? '排序信号' : 'Ranking signal',
              value: isChinese ? '先看最接近任务的候选' : 'Start with the closest match to the task',
              note: isChinese
                ? '榜单的目标不是制造热度，而是更快缩短 shortlist。'
                : 'The goal is not to create hype, but to shorten the shortlist faster.',
            },
            {
              label: isChinese ? '更新信号' : 'Freshness signal',
              value: isChinese ? '优先保留最近核查过的主题' : 'Prioritize topics checked most recently',
              note: isChinese
                ? '如果榜单本身不更新，后面的详情和官网跳转就会变得不可靠。'
                : 'If the ranking itself is not updated, detail and official-site jumps become less trustworthy.',
            },
            {
              label: isChinese ? '风险信号' : 'Risk signal',
              value: isChinese ? '不适合的条目要尽早踢掉' : 'Drop mismatched entries early',
              note: isChinese
                ? '榜单越快排除错误方向，用户越容易继续点下去。'
                : 'The faster the page removes mismatched options, the more likely users are to keep clicking.',
            },
          ]}
        />

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
            <p className='mt-4 text-sm leading-6 text-slate-600'>
              {isChinese
                ? `这组榜单会按最近检查时间 ${checkedAtLabel} 持续更新，优先保留能接到详情页、官网和提交路径的主题。`
                : `This list was last checked on ${checkedAtLabel}, and we keep prioritizing topics that connect into detail pages, official sites, and submission paths.`}
            </p>
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
    return (
      <div className='theme-page mx-auto max-w-pc px-4 py-8 lg:px-0'>
        <section className='rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>Best AI tools</p>
          <h1 className='mt-2 text-3xl font-bold text-slate-950'>This ranking page is temporarily unavailable</h1>
          <p className='mt-3 max-w-2xl text-sm leading-6 text-slate-600'>
            The topic page could not finish loading right now, but the rest of the site remains available.
          </p>
          <div className='mt-6 flex flex-wrap gap-3'>
            <Link
              href={`/${params.locale || 'en'}/best-ai-tools`}
              className='inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              Back to rankings
            </Link>
            <Link
              href={`/${params.locale || 'en'}/submit`}
              className='inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              Submit a tool
            </Link>
          </div>
        </section>
      </div>
    );
  }
}
