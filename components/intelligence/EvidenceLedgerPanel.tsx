import { AlertTriangle, ExternalLink, ShieldCheck } from 'lucide-react';

import type { ProductEvidenceLedgerEntry } from '@/lib/services/intelligence/evidenceLedger';
import type { PublicToolEvidenceLedger } from '@/lib/services/intelligence/publicEvidence';

function formatDate(value: string | null, locale: string): string {
  if (!value) return locale === 'cn' || locale === 'tw' ? '待补' : 'Pending';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale === 'cn' || locale === 'tw' ? 'zh-CN' : 'en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function humanize(value: string): string {
  return value
    .replace(/[:_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^\w/, (character) => character.toUpperCase());
}

function formatClaimValue(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);

  try {
    return JSON.stringify(value);
  } catch {
    return 'Structured evidence';
  }
}

function getSourceTypeLabel(entry: ProductEvidenceLedgerEntry, isChinese: boolean): string {
  const labels = {
    official: isChinese ? '官方来源' : 'Official',
    independent: isChinese ? '独立来源' : 'Independent',
    owner: isChinese ? 'Owner 提供' : 'Owner supplied',
    user: isChinese ? '用户反馈' : 'User supplied',
    editorial: isChinese ? '编辑核验' : 'Editorial',
  };
  return labels[entry.sourceType];
}

function getFreshnessPresentation(entry: ProductEvidenceLedgerEntry, isChinese: boolean) {
  if (entry.freshness === 'review_due') {
    return {
      label: isChinese ? '到期复查' : 'Review due',
      tone: 'bg-amber-50 text-amber-800 ring-amber-200',
    };
  }
  if (entry.freshness === 'expired') {
    return {
      label: isChinese ? '已过期' : 'Expired',
      tone: 'bg-rose-50 text-rose-800 ring-rose-200',
    };
  }
  if (entry.freshness === 'invalidated') {
    return {
      label: isChinese ? '已失效' : 'Invalidated',
      tone: 'bg-rose-50 text-rose-800 ring-rose-200',
    };
  }
  return {
    label: isChinese ? '核验有效' : 'Verified',
    tone: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  };
}

export default function EvidenceLedgerPanel({ ledger, locale }: { ledger: PublicToolEvidenceLedger; locale: string }) {
  const isChinese = locale === 'cn' || locale === 'tw';

  return (
    <section
      id='evidence-ledger'
      data-evidence-ledger
      className='scroll-mt-28 rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:p-8'
    >
      <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <div>
          <div className='flex items-center gap-3'>
            <ShieldCheck className='size-6 text-cyan-700' />
            <h2 className='text-2xl font-bold text-slate-950 lg:text-3xl'>
              {isChinese ? '可核查证据账本' : 'Evidence Ledger'}
            </h2>
          </div>
          <p className='mt-3 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '这里只展示经过明确核验的 claim。展开每一项查看来源、核查日期、适用范围和失效边界；机器候选不会自动出现在这里。'
              : 'Only explicitly verified claims appear here. Expand an item to inspect its source, review date, scope, and validity boundary; machine candidates are never published automatically.'}
          </p>
        </div>
        <div className='flex shrink-0 flex-wrap gap-2 text-xs font-semibold'>
          <span className='rounded-full bg-cyan-50 px-3 py-1.5 text-cyan-800 ring-1 ring-cyan-200'>
            {ledger.summary.verified} {isChinese ? '条已核验证据' : 'verified claims'}
          </span>
          <span className='rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-800 ring-1 ring-emerald-200'>
            {ledger.summary.decisionReady} {isChinese ? '条可支撑判断' : 'decision-ready'}
          </span>
        </div>
      </div>

      {(ledger.summary.reviewDue > 0 || ledger.summary.conflicts > 0 || ledger.summary.expiredOrInvalidated > 0) && (
        <div className='mt-5 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900'>
          <AlertTriangle className='mt-1 size-4 shrink-0' />
          <p>
            {isChinese
              ? `${ledger.summary.reviewDue} 条到期复查，${ledger.summary.conflicts} 条存在冲突，${ledger.summary.expiredOrInvalidated} 条已过期或失效；这些状态不会被当作有效推荐依据。`
              : `${ledger.summary.reviewDue} due for review, ${ledger.summary.conflicts} conflicted, and ${ledger.summary.expiredOrInvalidated} expired or invalidated; these states are not treated as current recommendation evidence.`}
          </p>
        </div>
      )}

      <div className='mt-6 space-y-3'>
        {ledger.entries.map((entry) => {
          const freshness = getFreshnessPresentation(entry, isChinese);
          const scopeEntries = Object.entries(entry.validityScope).filter(
            ([, value]) => value !== null && value !== '',
          );

          return (
            <details key={entry.claimId} className='group rounded-lg border border-slate-200 bg-slate-50 open:bg-white'>
              <summary className='cursor-pointer list-none p-4 marker:hidden sm:p-5'>
                <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                  <div className='min-w-0'>
                    <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                      {humanize(entry.claimType)}
                    </p>
                    <p className='mt-1 break-words text-sm font-semibold text-slate-950 sm:text-base'>
                      {formatClaimValue(entry.claimValue)}
                    </p>
                  </div>
                  <div className='flex shrink-0 flex-wrap gap-2'>
                    <span className='rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200'>
                      {getSourceTypeLabel(entry, isChinese)}
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${freshness.tone}`}>
                      {freshness.label}
                    </span>
                  </div>
                </div>
              </summary>

              <div className='border-t border-slate-200 px-4 pb-5 pt-4 sm:px-5'>
                {entry.sourceExcerpt ? (
                  <p className='rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-700'>{entry.sourceExcerpt}</p>
                ) : null}

                <dl className='mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3'>
                  <div>
                    <dt className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                      {isChinese ? '核查日期' : 'Verified'}
                    </dt>
                    <dd className='mt-1 font-medium text-slate-800'>{formatDate(entry.verifiedAt, locale)}</dd>
                  </div>
                  <div>
                    <dt className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                      {isChinese ? '下次复查' : 'Review due'}
                    </dt>
                    <dd className='mt-1 font-medium text-slate-800'>{formatDate(entry.reviewDueAt, locale)}</dd>
                  </div>
                  <div>
                    <dt className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                      {isChinese ? '已知失效时间' : 'Known expiry'}
                    </dt>
                    <dd className='mt-1 font-medium text-slate-800'>{formatDate(entry.expiresAt, locale)}</dd>
                  </div>
                </dl>

                {scopeEntries.length > 0 ? (
                  <div className='mt-4'>
                    <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                      {isChinese ? '适用范围' : 'Applies within'}
                    </p>
                    <div className='mt-2 flex flex-wrap gap-2'>
                      {scopeEntries.map(([key, value]) => (
                        <span key={key} className='rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700'>
                          {humanize(key)}: {formatClaimValue(value)}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {entry.verificationNote ? (
                  <p className='mt-4 text-sm leading-6 text-slate-600'>{entry.verificationNote}</p>
                ) : null}
                {entry.invalidationReason ? (
                  <p className='mt-4 text-sm font-medium leading-6 text-rose-700'>{entry.invalidationReason}</p>
                ) : null}

                <a
                  href={entry.sourceUrl}
                  target='_blank'
                  rel='noreferrer'
                  className='mt-4 inline-flex items-center gap-1 text-sm font-semibold text-cyan-700 hover:text-cyan-900'
                >
                  {entry.sourceLabel || entry.publisherName || (isChinese ? '打开证据来源' : 'Open evidence source')}
                  <ExternalLink className='size-3.5' />
                </a>
              </div>
            </details>
          );
        })}
      </div>
    </section>
  );
}
