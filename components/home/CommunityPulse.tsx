'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Clock3, Heart, MessageSquare, Share2, Sparkles, TrendingUp } from 'lucide-react';

import { CommunityHighlight, RecentDiscussion } from '@/lib/services/community';

import TrackableCompareLink from '../TrackableCompareLink';

type ViewMode = 'hot' | 'recent' | 'rising';

interface CommunityPulseProps {
  locale: string;
  highlights: CommunityHighlight[];
  discussions: RecentDiscussion[];
  risingTools: CommunityHighlight[];
  isChinese: boolean;
}

function SectionTitle({ title, description }: { title: string; description: string }) {
  return (
    <div className='mb-5 flex flex-col gap-2 lg:mb-6'>
      <h2 className='text-2xl font-bold text-slate-950 lg:text-3xl'>{title}</h2>
      <p className='max-w-2xl text-sm leading-6 text-slate-600'>{description}</p>
    </div>
  );
}

function getActiveContent(
  mode: ViewMode,
  hotLabel: string,
  recentLabel: string,
  risingLabel: string,
  hotDescription: string,
  recentDescription: string,
  risingDescription: string,
) {
  if (mode === 'hot') {
    return { title: hotLabel, description: hotDescription };
  }

  if (mode === 'recent') {
    return { title: recentLabel, description: recentDescription };
  }

  return { title: risingLabel, description: risingDescription };
}

function CardActions({
  toolId,
  detailHref,
  detailLabel,
  compareHref,
  compareLabel,
  compareFallbackLabel,
}: {
  toolId: string;
  detailHref: string;
  detailLabel: string;
  compareHref?: string;
  compareLabel?: string;
  compareFallbackLabel: string;
}) {
  return (
    <div className='mt-4 flex flex-wrap items-center gap-2'>
      <Link
        href={detailHref}
        className='inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800'
      >
        {detailLabel}
        <ArrowRight className='size-3.5' />
      </Link>
      {compareHref && compareLabel && (
        <TrackableCompareLink
          href={compareHref}
          toolId={toolId}
          className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 hover:text-slate-950'
        >
          <Sparkles className='size-3.5 text-cyan-700' />
          {compareLabel || compareFallbackLabel}
        </TrackableCompareLink>
      )}
    </div>
  );
}

export default function CommunityPulse({
  locale,
  highlights,
  discussions,
  risingTools,
  isChinese,
}: CommunityPulseProps) {
  const [mode, setMode] = useState<ViewMode>('hot');

  const hotLabel = isChinese ? '本周热度' : 'Trending now';
  const recentLabel = isChinese ? '最近讨论' : 'Recent discussions';
  const risingLabel = isChinese ? '上升最快' : 'Rising fast';
  const hotDescription = isChinese
    ? '收藏、评论和分享最高的工具，看看大家最近在关注什么。'
    : 'Tools getting the most saves, comments, and shares right now.';
  const recentDescription = isChinese
    ? '看一看工具页里最新的真实讨论，快速找到值得跟进的产品。'
    : 'Read the latest real discussion on tool pages and spot tools worth a closer look.';
  const risingDescription = isChinese
    ? '近 7 天内正在被更多人关注、收藏或讨论的工具。'
    : 'Tools seeing the most new attention from the last 7 days.';

  const activeContent = getActiveContent(
    mode,
    hotLabel,
    recentLabel,
    risingLabel,
    hotDescription,
    recentDescription,
    risingDescription,
  );

  let contentBlock: JSX.Element;
  if (mode === 'hot') {
    contentBlock =
      highlights.length > 0 ? (
        <div className='grid gap-4 md:grid-cols-3'>
          {highlights.map((tool) => {
            const title = tool.title[locale] || tool.title.en || tool.title.zh || tool.name;
            const content = tool.content[locale] || tool.content.en || tool.content.zh || '';

            return (
              <div
                key={tool.id}
                className='rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md'
              >
                <div className='flex items-start justify-between gap-3'>
                  <div className='min-w-0'>
                    <p className='line-clamp-1 text-sm font-semibold text-slate-950'>{title}</p>
                    <p className='mt-1 line-clamp-2 text-sm leading-6 text-slate-600'>{content}</p>
                  </div>
                  <span className='rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700'>
                    {isChinese ? '热度' : 'Hot'}
                  </span>
                </div>
                <div className='mt-4 flex flex-wrap gap-2 text-xs font-medium text-slate-600'>
                  <span className='rounded-full bg-rose-50 px-2.5 py-1 text-rose-700'>
                    <Heart className='mr-1 inline size-3.5' />
                    {tool.favoriteCount} {isChinese ? '收藏' : 'saves'}
                  </span>
                  <span className='rounded-full bg-cyan-50 px-2.5 py-1 text-cyan-700'>
                    <MessageSquare className='mr-1 inline size-3.5' />
                    {tool.commentCount} {isChinese ? '评论' : 'comments'}
                  </span>
                  <span className='rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700'>
                    <Share2 className='mr-1 inline size-3.5' />
                    {tool.shareCount} {isChinese ? '分享' : 'shares'}
                  </span>
                </div>
                <CardActions
                  toolId={tool.id}
                  detailHref={`/ai/${tool.name}`}
                  detailLabel={isChinese ? '看工具详情' : 'View tool'}
                  compareHref={tool.compareHref}
                  compareLabel={tool.compareLabel}
                  compareFallbackLabel={isChinese ? '去比较' : 'Compare'}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className='rounded-lg bg-white p-6 text-sm text-slate-500 ring-1 ring-slate-200'>
          {isChinese ? '暂无热度数据。' : 'No trending data yet.'}
        </div>
      );
  } else if (mode === 'recent') {
    contentBlock =
      discussions.length > 0 ? (
        <div className='grid gap-4 md:grid-cols-3'>
          {discussions.map((item) => {
            const { toolTitle, toolName, commentCount, compareHref, compareLabel, excerpt } = item;
            const title = toolTitle[locale] || toolTitle.en || toolTitle.zh || toolName;
            let displayExcerpt = excerpt;
            if (displayExcerpt.length === 0) {
              displayExcerpt = isChinese ? '暂无评论摘要' : 'No comment excerpt yet';
            }

            return (
              <div
                key={item.id}
                className='rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md'
              >
                <div className='flex items-center justify-between gap-3'>
                  <p className='line-clamp-1 text-sm font-semibold text-slate-950'>{title}</p>
                  <span className='rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600'>
                    {commentCount} {isChinese ? '条讨论' : 'comments'}
                  </span>
                </div>
                <p className='mt-3 line-clamp-3 text-sm leading-6 text-slate-600'>{displayExcerpt}</p>
                <div className='mt-3 flex items-center justify-between gap-3'>
                  <p className='inline-flex items-center gap-1 text-xs font-medium text-cyan-700'>
                    {isChinese ? '查看讨论' : 'Read discussion'}
                    <Clock3 className='size-3.5' />
                  </p>
                  <span className='rounded-full bg-cyan-50 px-2.5 py-1 text-[11px] font-semibold text-cyan-700'>
                    {isChinese ? '跳到评论' : 'Jump to comments'}
                  </span>
                </div>
                <CardActions
                  toolId={item.id}
                  detailHref={`/ai/${toolName}#comments`}
                  detailLabel={isChinese ? '看讨论' : 'Read discussion'}
                  compareHref={compareHref}
                  compareLabel={compareLabel}
                  compareFallbackLabel={isChinese ? '去比较' : 'Compare'}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className='rounded-lg bg-white p-6 text-sm text-slate-500 ring-1 ring-slate-200'>
          {isChinese ? '暂无讨论数据。' : 'No discussion data yet.'}
        </div>
      );
  } else {
    contentBlock =
      risingTools.length > 0 ? (
        <div className='grid gap-4 md:grid-cols-3'>
          {risingTools.map((tool) => {
            const title = tool.title[locale] || tool.title.en || tool.title.zh || tool.name;
            const content = tool.content[locale] || tool.content.en || tool.content.zh || '';

            return (
              <div
                key={tool.id}
                className='rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md'
              >
                <div className='flex items-start justify-between gap-3'>
                  <div className='min-w-0'>
                    <p className='line-clamp-1 text-sm font-semibold text-slate-950'>{title}</p>
                    <p className='mt-1 line-clamp-2 text-sm leading-6 text-slate-600'>{content}</p>
                  </div>
                  <span className='rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700'>
                    {isChinese ? '上升' : 'Rising'}
                  </span>
                </div>
                <div className='mt-4 flex flex-wrap gap-2 text-xs font-medium text-slate-600'>
                  <span className='rounded-full bg-amber-50 px-2.5 py-1 text-amber-700'>
                    {tool.commentCount} {isChinese ? '新讨论' : 'new comments'}
                  </span>
                  <span className='rounded-full bg-rose-50 px-2.5 py-1 text-rose-700'>
                    {tool.favoriteCount} {isChinese ? '新收藏' : 'new saves'}
                  </span>
                  <span className='rounded-full bg-cyan-50 px-2.5 py-1 text-cyan-700'>
                    {tool.shareCount} {isChinese ? '总分享' : 'shares'}
                  </span>
                </div>
                <CardActions
                  toolId={tool.id}
                  detailHref={`/ai/${tool.name}`}
                  detailLabel={isChinese ? '看工具详情' : 'View tool'}
                  compareHref={tool.compareHref}
                  compareLabel={tool.compareLabel}
                  compareFallbackLabel={isChinese ? '去比较' : 'Compare'}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className='rounded-lg bg-white p-6 text-sm text-slate-500 ring-1 ring-slate-200'>
          {isChinese ? '暂无上升中的工具。' : 'No rising tools yet.'}
        </div>
      );
  }

  return (
    <section className='mx-auto w-full max-w-7xl px-4 py-8 lg:px-6 lg:py-10'>
      <SectionTitle title={activeContent.title} description={activeContent.description} />

      <div className='mb-5 inline-flex rounded-full bg-slate-100 p-1 text-sm shadow-sm ring-1 ring-slate-200'>
        <button
          type='button'
          onClick={() => setMode('hot')}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-semibold transition-colors ${
            mode === 'hot' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <TrendingUp className='size-4' />
          {hotLabel}
        </button>
        <button
          type='button'
          onClick={() => setMode('recent')}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-semibold transition-colors ${
            mode === 'recent' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MessageSquare className='size-4' />
          {recentLabel}
        </button>
        <button
          type='button'
          onClick={() => setMode('rising')}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-semibold transition-colors ${
            mode === 'rising' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock3 className='size-4' />
          {risingLabel}
        </button>
      </div>

      {contentBlock}
    </section>
  );
}
