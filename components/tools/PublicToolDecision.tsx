import type { ReactNode } from 'react';

import { publicToolNarrative } from '@/lib/content/publicToolScope';
import type { PublicToolCapabilitySummary } from '@/lib/services/decision/capabilityReadModel';
import type { DecisionCardV2Model } from '@/lib/services/decision/card';
import type { PublicToolEvidenceSummary } from '@/lib/services/intelligence/publicEvidence';
import type { ToolDecisionCardModel } from '@/lib/services/toolDecisionCard';
import DecisionCardV2 from '@/components/decision/DecisionCardV2';
import PublicModuleArea, { type PublicModuleAreaProps } from '@/components/public-modules/PublicModuleArea';

function localText(value: Record<string, string>, locale: string): string {
  return value[locale] || value[locale === 'tw' ? 'cn' : 'en'] || value.en || '';
}

function detailText(value: unknown, locale: string): string {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    return value
      .map((item) => detailText(item, locale))
      .filter(Boolean)
      .join('; ');
  }
  if (!value || typeof value !== 'object') return '';
  const record = value as Record<string, unknown>;
  const localized = record[locale] || record[locale === 'tw' ? 'cn' : 'en'] || record.en;
  if (typeof localized === 'string') return localized.trim();
  return Object.entries(record)
    .map(([key, item]) => `${key.replace(/[_-]/g, ' ')}: ${detailText(item, locale)}`)
    .filter((item) => !item.endsWith(': '))
    .join('; ');
}

function dateLabel(value: string, locale: string): string {
  return new Intl.DateTimeFormat(locale === 'cn' || locale === 'tw' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(value));
}

function supportLabel(value: PublicToolCapabilitySummary['supportLevel'], cn: boolean): string {
  const labels = {
    strong: cn ? '强支持' : 'Strong',
    partial: cn ? '部分支持' : 'Partial',
    limited: cn ? '有限支持' : 'Limited',
    not_supported: cn ? '不支持' : 'Not supported',
    unknown: cn ? '未知' : 'Unknown',
  };
  return labels[value];
}

function availabilityLabel(value: PublicToolCapabilitySummary['availability'], cn: boolean): string {
  const labels = {
    all_plans: cn ? '所有套餐' : 'All plans',
    paid_only: cn ? '付费套餐' : 'Paid only',
    enterprise_only: cn ? '企业套餐' : 'Enterprise only',
    add_on: cn ? '附加购买' : 'Add-on',
    unknown: cn ? '未知' : 'Unknown',
  };
  return labels[value];
}

export default function PublicToolDecision({
  card,
  model,
  locale,
  task,
  tradeOff,
  checkedAt,
  capabilities = [],
  evidenceSummary,
  children,
  experimentalModules,
}: {
  card: ToolDecisionCardModel;
  model: DecisionCardV2Model | null;
  locale: string;
  task: string;
  tradeOff: string;
  checkedAt: string | null;
  capabilities?: PublicToolCapabilitySummary[];
  evidenceSummary?: PublicToolEvidenceSummary | null;
  children?: ReactNode;
  experimentalModules?: Omit<PublicModuleAreaProps, 'page' | 'placement'> & {
    page: { path: string; pageType: 'tool' };
  };
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
          <h2 className='mt-2 text-2xl font-bold text-slate-950'>
            {cn ? '工具决策情报 / 选择判断卡' : 'Tool Intelligence / Decision Card'}
          </h2>
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
      {card.comparison.axes.length > 0 && (
        <div className='mt-4 rounded-lg border border-slate-200 p-4'>
          <h3 className='text-sm font-semibold text-slate-950'>{cn ? '横向比较时重点看' : 'What to compare'}</h3>
          <ul className='mt-2 grid list-disc gap-x-6 gap-y-2 pl-4 text-sm leading-6 text-slate-700 sm:grid-cols-2'>
            {card.comparison.axes.map((axis) => (
              <li key={axis}>{axis}</li>
            ))}
          </ul>
        </div>
      )}
      {evidenceSummary && (
        <div
          data-tool-evidence-summary
          className='mt-4 rounded-lg border border-cyan-100 bg-cyan-50/50 p-4 text-sm text-slate-700'
        >
          <h3 className='font-semibold text-slate-950'>{cn ? '证据概览' : 'Evidence at a glance'}</h3>
          <p className='mt-2'>
            {evidenceSummary.verified} {cn ? '条已核验' : 'verified'} · {evidenceSummary.decisionReady}{' '}
            {cn ? '条可支撑判断' : 'decision-ready'}
          </p>
          {evidenceSummary.latestVerifiedAt && (
            <p className='mt-1'>
              {cn ? '最近核验' : 'Last verified'} {dateLabel(evidenceSummary.latestVerifiedAt, locale)}
            </p>
          )}
          {evidenceSummary.nextReviewDueAt && (
            <p className='mt-1'>
              {cn ? '下次复查' : 'Next review due'} {dateLabel(evidenceSummary.nextReviewDueAt, locale)}
            </p>
          )}
          <a className='mt-2 inline-block font-semibold text-cyan-800 underline' href='#evidence-ledger'>
            {cn ? '查看证据账本' : 'View Evidence Ledger'}
          </a>
        </div>
      )}
      {capabilities.length > 0 && (
        <section data-tool-verified-capabilities className='mt-4 rounded-lg border border-slate-200 p-4'>
          <h3 className='text-base font-semibold text-slate-950'>{cn ? '已核验能力' : 'Verified capabilities'}</h3>
          <div className='mt-3 grid gap-3 sm:grid-cols-2'>
            {capabilities.map((capability) => (
              <article key={capability.name.en} className='rounded-lg bg-slate-50 p-3 text-sm text-slate-700'>
                <p className='text-xs font-semibold uppercase text-cyan-700'>{capability.group.replace(/_/g, ' ')}</p>
                <h4 className='mt-1 font-semibold text-slate-950'>{localText(capability.name, locale)}</h4>
                {localText(capability.description, locale) && (
                  <p className='mt-1'>{localText(capability.description, locale)}</p>
                )}
                <p className='mt-2'>
                  {cn ? '支持程度' : 'Support'}: {supportLabel(capability.supportLevel, cn)} ·{' '}
                  {cn ? '可用范围' : 'Availability'}: {availabilityLabel(capability.availability, cn)}
                </p>
                {Object.keys(capability.planRequirement).length > 0 && (
                  <p className='mt-1'>
                    {cn ? '套餐要求' : 'Plan requirement'}: {detailText(capability.planRequirement, locale)}
                  </p>
                )}
                {capability.limitations.length > 0 && (
                  <p className='mt-1'>
                    {cn ? '限制' : 'Limitations'}: {detailText(capability.limitations, locale)}
                  </p>
                )}
                <ul className='mt-3 space-y-1 border-t border-slate-200 pt-2 text-xs'>
                  {capability.evidence.map((item) => (
                    <li key={`${item.sourceUrl}:${item.verifiedAt}`}>
                      <a
                        href={item.sourceUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='break-all font-medium text-cyan-800 underline'
                      >
                        {item.sourceUrl}
                      </a>
                      {item.verifiedAt ? ` · ${cn ? '核验' : 'Verified'} ${dateLabel(item.verifiedAt, locale)}` : ''}
                      {item.reviewDueAt
                        ? ` · ${cn ? '复查期限' : 'Review due'} ${dateLabel(item.reviewDueAt, locale)}`
                        : ''}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      )}
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
      {experimentalModules && (
        <PublicModuleArea
          page={experimentalModules.page}
          placement='after-decision'
          modules={experimentalModules.modules}
        />
      )}
    </section>
  );
}
