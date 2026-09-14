import type { ReactNode } from 'react';

import { publicToolNarrative } from '@/lib/content/publicToolScope';
import type { DecisionCardV2Model } from '@/lib/services/decision/card';
import type { ToolDecisionCardModel } from '@/lib/services/toolDecisionCard';
import DecisionCardV2 from '@/components/decision/DecisionCardV2';

export default function PublicToolDecision({
  card,
  model,
  locale,
  task,
  tradeOff,
  checkedAt,
  children,
}: {
  card: ToolDecisionCardModel;
  model: DecisionCardV2Model | null;
  locale: string;
  task: string;
  tradeOff: string;
  checkedAt: string | null;
  children?: ReactNode;
}) {
  const cn = locale === 'cn' || locale === 'tw';
  return (
    <section
      id='decision-card'
      data-tool-decision-card
      data-above-fold-decision-summary
      className='scroll-mt-28 rounded-xl border border-cyan-200 bg-white p-5 shadow-sm sm:p-6'
    >
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {cn ? '先看结论，再看功能' : 'Decision first, features second'}
          </p>
          <h2 className='mt-2 text-2xl font-bold text-slate-950'>{cn ? '选择判断卡' : 'Decision Card'}</h2>
        </div>
        {checkedAt && (
          <p className='text-xs text-slate-500'>
            {cn ? '最近核查' : 'Last checked'} {checkedAt}
          </p>
        )}
      </div>
      <dl className='mt-4 grid gap-4 sm:grid-cols-2'>
        {[
          { label: cn ? '适合的任务' : 'Task fit', value: task },
          { label: cn ? '选择前要权衡' : 'Key trade-off', value: tradeOff },
          { label: cn ? '定价' : 'Pricing', value: `${card.pricing.label} · ${card.pricing.summary}` },
          {
            label: cn ? '最近更新' : 'Last update',
            value: `${card.freshness.label} · ${publicToolNarrative(card.freshness.summary)}`,
          },
        ].map((item) => (
          <div key={item.label} className='min-w-0 rounded-lg bg-slate-50 p-4'>
            <dt className='text-xs font-semibold text-slate-500'>{item.label}</dt>
            <dd className='mt-2 text-sm leading-6 text-slate-800'>{item.value}</dd>
          </div>
        ))}
      </dl>
      <div className='mt-4 grid gap-4 sm:grid-cols-2'>
        {[
          { label: cn ? '适合谁' : 'Best for', items: card.audience.bestFit },
          { label: cn ? '不太适合' : 'Not ideal for', items: card.audience.notIdealFor },
          { label: cn ? '风险与限制' : 'Watch outs', items: card.risks },
        ]
          .filter((group) => group.items.length)
          .map((group) => (
            <div key={group.label} className='min-w-0 rounded-lg border border-slate-200 p-4'>
              <h3 className='text-sm font-semibold text-slate-950'>{group.label}</h3>
              <ul className='mt-2 list-disc space-y-2 pl-4 text-sm leading-6 text-slate-700'>
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
      </div>
      {model && <DecisionCardV2 model={model} locale={locale} embedded />}
      {children}
      {card.editorial.sourceUrl && (
        <details className='mt-4 rounded-lg border border-slate-200 p-4 text-sm leading-6 text-slate-700'>
          <summary className='cursor-pointer font-semibold text-cyan-800'>
            {cn ? '来源与复核记录' : 'Source and review record'}
            {card.editorial.reviewedLabel ? ` · ${card.editorial.reviewedLabel}` : ''}
          </summary>
          <p className='mt-2'>{card.editorial.reviewerLabel}</p>
          {card.editorial.summary && <p className='mt-2'>{publicToolNarrative(card.editorial.summary)}</p>}
          {card.editorial.trustNote && <p className='mt-2'>{publicToolNarrative(card.editorial.trustNote)}</p>}
          {card.editorial.stale && (
            <p className='mt-2 text-amber-800'>
              {cn
                ? '此复核已超过 90 天，选择前请重新核对来源。'
                : 'This review is over 90 days old; recheck the source before choosing.'}
            </p>
          )}
          <a
            className='mt-2 inline-block font-semibold text-cyan-800 underline'
            href={card.editorial.sourceUrl}
            target='_blank'
            rel='noreferrer'
          >
            {cn ? '查看证据来源' : 'View evidence source'}
          </a>
        </details>
      )}
      {card.comparison.alternatives.length > 0 && (
        <div data-reviewed-tool-relationships className='mt-4 border-t border-slate-200 pt-4'>
          <h3 className='text-sm font-semibold text-slate-950'>{cn ? '接下来比较' : 'Compare next'}</h3>
          <p className='mt-2 text-sm leading-6 text-slate-600'>{card.comparison.summary}</p>
          <div className='mt-3 grid gap-3 sm:grid-cols-2'>
            {card.comparison.alternatives.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className='rounded-lg border border-slate-200 p-3 text-sm hover:bg-cyan-50'
              >
                <span className='font-semibold text-cyan-800'>{item.title}</span>
                <p className='mt-1 leading-6 text-slate-600'>{item.description}</p>
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
