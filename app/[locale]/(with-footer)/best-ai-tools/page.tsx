import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { topListTopics } from '@/lib/data/topLists';
import { BASE_URL } from '@/lib/env';
import { getEditorialReviewRecord } from '@/lib/seo/contentReviewDates';
import { buildLocalizedPageMetadata, generateLocalizedPath } from '@/lib/seo/metadata';
import SeoBreadcrumbs from '@/components/seo/SeoBreadcrumbs';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const isChinese = locale === 'cn' || locale === 'tw';

  return buildLocalizedPageMetadata({
    locale,
    path: '/best-ai-tools',
    title: isChinese ? 'Best AI Tools by Use Case | AI Best Tool' : 'Best AI Tools by Use Case | AI Best Tool',
    description: isChinese
      ? '按用途整理的 AI 工具榜单：Agent、可观测、写作、开发、模型路由、研究和视频，并明确下一步该看什么。'
      : 'Purpose-driven AI tool rankings for agents, observability, coding, model routing, research, writing, and video with clear next-step guidance.',
    baseUrl: BASE_URL,
  });
}

export default function BestAiToolsPage({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const priorityTopicKeys = [
    'ai-coding-tools',
    'ai-agent-tools',
    'ai-chatbot-tools',
    'ai-image-tools',
    'ai-api-observability-tools',
    'ai-model-routing-tools',
    'ai-research-tools',
    'ai-content-creation-tools',
    'ai-video-tools',
    'ai-writing-tools',
  ];
  const priorityTopics = priorityTopicKeys
    .map((key) => topListTopics.find((topic) => topic.key === key))
    .filter((topic): topic is (typeof topListTopics)[number] => Boolean(topic));
  const checkedAt = getEditorialReviewRecord('best-index').reviewedAt;
  const checkedAtLabel = new Intl.DateTimeFormat(isChinese ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${checkedAt}T00:00:00Z`));

  return (
    <div className='theme-page mx-auto max-w-pc px-4 py-8 lg:px-0'>
      <SeoBreadcrumbs
        locale={locale}
        items={[
          { name: isChinese ? '首页' : 'Home', path: '/' },
          { name: isChinese ? 'AI 工具榜单' : 'Best AI Tools', path: '/best-ai-tools' },
        ]}
        className='mb-5'
      />
      <section className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8'>
        <p className='text-sm font-semibold text-cyan-700'>{isChinese ? '按任务选择' : 'Choose by task'}</p>
        <h1 className='mt-2 text-3xl font-bold text-slate-950 lg:text-5xl'>
          {isChinese ? '按真实使用场景挑 AI 工具，而不是按名气挑' : 'Pick AI tools by use case, not by hype'}
        </h1>
        <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600'>
          {isChinese
            ? '每个榜单只回答一个选择问题，并把候选工具的适用场景、限制和核查依据放在同一条决策路径上。'
            : 'Each list answers one selection question and connects candidate tools with their fit, limits, and reviewed evidence.'}
        </p>
        <p className='mt-3 text-sm text-slate-500'>
          {isChinese ? '目录导航核查于' : 'Directory navigation checked'} {checkedAtLabel}
        </p>
        <Link
          href={generateLocalizedPath('/guides/how-to-choose-ai-tools', locale)}
          className='mt-4 inline-block text-sm font-semibold text-cyan-800 underline'
        >
          {isChinese ? '查看选型方法' : 'See the selection method'}
        </Link>
      </section>
      <section
        className='mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'
        aria-label={isChinese ? '工具榜单' : 'Tool lists'}
      >
        {[...priorityTopics, ...topListTopics.filter((topic) => !priorityTopicKeys.includes(topic.key))].map(
          (topic) => (
            <Link
              key={topic.key}
              href={generateLocalizedPath(`/best-ai-tools/${topic.key}`, locale)}
              className='rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-cyan-300'
            >
              <h2 className='text-lg font-semibold text-slate-950'>{topic.title}</h2>
              <p className='mt-3 text-sm leading-6 text-slate-600'>{topic.summary}</p>
              <span className='mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-800'>
                {isChinese ? '查看候选与限制' : 'See candidates and limits'}
                <ArrowRight className='size-4' />
              </span>
            </Link>
          ),
        )}
      </section>
    </div>
  );
}
