import { CalendarCheck2, ExternalLink, History } from 'lucide-react';

import type { ProductIntelligenceTimelineEvent } from '@/lib/services/intelligence/types';

function formatDate(value: string, locale: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale === 'cn' || locale === 'tw' ? 'zh-CN' : 'en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch {
    return 'Structured value';
  }
}

function getEventLabel(event: ProductIntelligenceTimelineEvent, isChinese: boolean): string {
  if (event.eventType === 'reviewed_no_change') {
    return isChinese ? '已复核 · 无确认变化' : 'Reviewed · no confirmed change';
  }
  return event.eventType.replaceAll('_', ' ');
}

export default function ChangeTimelinePanel({
  events,
  locale,
}: {
  events: ProductIntelligenceTimelineEvent[];
  locale: string;
}) {
  const isChinese = locale === 'cn' || locale === 'tw';

  return (
    <section
      id='change-timeline'
      data-change-timeline
      className='scroll-mt-28 rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:p-8'
    >
      <div className='flex items-center gap-3'>
        <History className='size-6 text-cyan-700' />
        <h2 className='text-2xl font-bold text-slate-950 lg:text-3xl'>
          {isChinese ? '复核与变化时间线' : 'Review & Change Timeline'}
        </h2>
      </div>
      <p className='mt-3 max-w-3xl text-sm leading-6 text-slate-600'>
        {isChinese
          ? '这里只记录编辑确认的事实变化和明确完成的复核。机器发现的候选差异不会自动进入时间线，无变化也不会伪装成产品更新。'
          : 'This timeline only records editorially confirmed fact changes and completed reviews. Machine-detected candidates never enter automatically, and a no-change review is not presented as a product update.'}
      </p>

      <ol className='mt-6 space-y-4'>
        {events.map((event) => {
          const isNoChange = event.eventType === 'reviewed_no_change';
          return (
            <li key={event.id} className='relative rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5'>
              <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
                <div className='min-w-0'>
                  <div className='flex flex-wrap items-center gap-2 text-xs font-semibold'>
                    <span
                      className={`rounded-full px-2.5 py-1 ring-1 ${
                        isNoChange
                          ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
                          : 'bg-cyan-50 text-cyan-800 ring-cyan-200'
                      }`}
                    >
                      {getEventLabel(event, isChinese)}
                    </span>
                    <span className='rounded-full bg-white px-2.5 py-1 text-slate-600 ring-1 ring-slate-200'>
                      {event.reviewScope}
                    </span>
                  </div>
                  <h3 className='mt-3 text-base font-bold text-slate-950'>{event.title}</h3>
                  <p className='mt-2 text-sm leading-6 text-slate-700'>{event.summary}</p>
                </div>
                <div className='flex shrink-0 items-center gap-2 text-xs font-semibold text-slate-500'>
                  <CalendarCheck2 className='size-4' />
                  {formatDate(event.occurredAt, locale)}
                </div>
              </div>

              {!isNoChange ? (
                <div className='mt-4 grid gap-3 sm:grid-cols-2'>
                  <div className='rounded-lg bg-white p-3 text-sm text-slate-700 ring-1 ring-slate-200'>
                    <span className='block text-xs font-semibold uppercase tracking-wide text-slate-500'>
                      {isChinese ? '之前' : 'Before'}
                    </span>
                    <span className='mt-1 block break-words'>{formatValue(event.oldValue)}</span>
                  </div>
                  <div className='rounded-lg bg-cyan-50 p-3 text-sm text-slate-700 ring-1 ring-cyan-100'>
                    <span className='block text-xs font-semibold uppercase tracking-wide text-cyan-700'>
                      {isChinese ? '现在' : 'After'}
                    </span>
                    <span className='mt-1 block break-words'>{formatValue(event.newValue)}</span>
                  </div>
                </div>
              ) : null}

              {event.sourceUrl ? (
                <a
                  href={event.sourceUrl}
                  target='_blank'
                  rel='noreferrer'
                  className='mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-cyan-700 hover:underline'
                >
                  {isChinese ? '查看核验来源' : 'Open verification source'} <ExternalLink className='size-3.5' />
                </a>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
