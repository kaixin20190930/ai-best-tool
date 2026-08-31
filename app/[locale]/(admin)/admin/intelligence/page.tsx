import Link from 'next/link';
import { AlertTriangle, ArrowUpRight, Layers3, ListChecks, ShieldCheck, Sparkles } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import {
  getAdminIntelligenceDailyQueue,
  getAdminIntelligenceOverview,
  getAdminIntelligenceReviewQueue,
} from '@/lib/services/admin/intelligence';

const QUALITY_DIMENSIONS = [
  { key: 'evidence', label: 'Evidence', maximum: 20 },
  { key: 'factualConsistency', label: 'Factual consistency', maximum: 20 },
  { key: 'decisionValue', label: 'Decision value', maximum: 20 },
  { key: 'uniqueness', label: 'Uniqueness proxy', maximum: 15 },
  { key: 'searchAndCategoryFit', label: 'Search and category fit', maximum: 10 },
  { key: 'freshness', label: 'Freshness', maximum: 10 },
  { key: 'mediaIntegrity', label: 'Media integrity', maximum: 5 },
] as const;

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'admin' });

  return {
    title: `${t('title')} - Intelligence`,
  };
}

function formatDate(value: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString();
}

function badgeClass(status: string) {
  if (status === 'ready') return 'bg-emerald-50 text-emerald-700';
  if (status === 'conflict') return 'bg-rose-50 text-rose-700';
  if (status === 'stale') return 'bg-orange-50 text-orange-700';
  return 'bg-amber-50 text-amber-700';
}

function decisionClass(decision: string) {
  if (decision === 'publish_ready') return 'bg-emerald-50 text-emerald-700';
  if (decision === 'review_required') return 'bg-cyan-50 text-cyan-700';
  if (decision === 'enrich') return 'bg-amber-50 text-amber-700';
  return 'bg-rose-50 text-rose-700';
}

export default async function AdminIntelligencePage({
  searchParams,
}: {
  searchParams: {
    ownerType?: 'tool' | 'distribution_project' | 'all';
    status?: 'pending' | 'ready' | 'conflict' | 'stale' | 'all';
    profileId?: string;
    reviewType?: 'fact' | 'decision' | 'all';
    reviewState?: 'overdue' | 'due_soon' | 'scheduled' | 'unscheduled' | 'all';
  };
}) {
  const ownerType =
    searchParams.ownerType === 'tool' || searchParams.ownerType === 'distribution_project'
      ? searchParams.ownerType
      : 'all';
  const status =
    searchParams.status === 'pending' ||
    searchParams.status === 'ready' ||
    searchParams.status === 'conflict' ||
    searchParams.status === 'stale'
      ? searchParams.status
      : 'all';
  const overview = await getAdminIntelligenceOverview({
    ownerType,
    status,
    profileId: searchParams.profileId,
    limit: 30,
  });
  const dailyQueue = await getAdminIntelligenceDailyQueue({
    ownerType,
    status,
    limit: 3,
  });
  const reviewQueue = await getAdminIntelligenceReviewQueue({
    ownerType,
    status,
    limit: 6,
    reviewType: searchParams.reviewType || 'all',
    state: searchParams.reviewState || 'all',
  });

  const selected = overview.selectedProfile;

  return (
    <div className='space-y-6'>
      <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-end'>
        <div>
          <p className='text-xs font-bold uppercase tracking-[0.18em] text-cyan-700'>Product intelligence</p>
          <h1 className='mt-2 text-3xl font-bold text-slate-950'>Evidence archive</h1>
          <p className='mt-2 max-w-2xl text-sm leading-6 text-slate-600'>
            Review the shared product facts that drive content, conflict detection, and distribution planning.
          </p>
        </div>
        <Link
          href='/admin/tools'
          className='inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-cyan-300 hover:text-cyan-700'
        >
          Back to tools <ArrowUpRight className='h-4 w-4' />
        </Link>
      </div>

      <section className='grid gap-3 sm:grid-cols-2 lg:grid-cols-6'>
        <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
          <Sparkles className='h-5 w-5 text-cyan-700' />
          <div className='mt-3 text-2xl font-bold text-slate-950'>{overview.totals.profiles}</div>
          <div className='mt-1 text-xs text-slate-500'>Profiles</div>
        </div>
        <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
          <ShieldCheck className='h-5 w-5 text-emerald-700' />
          <div className='mt-3 text-2xl font-bold text-slate-950'>{overview.totals.ready}</div>
          <div className='mt-1 text-xs text-slate-500'>Ready</div>
        </div>
        <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
          <AlertTriangle className='h-5 w-5 text-amber-700' />
          <div className='mt-3 text-2xl font-bold text-slate-950'>{overview.totals.pending}</div>
          <div className='mt-1 text-xs text-slate-500'>Pending</div>
        </div>
        <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
          <Layers3 className='h-5 w-5 text-rose-700' />
          <div className='mt-3 text-2xl font-bold text-slate-950'>{overview.totals.conflict}</div>
          <div className='mt-1 text-xs text-slate-500'>Conflict</div>
        </div>
        <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
          <ListChecks className='h-5 w-5 text-slate-700' />
          <div className='mt-3 text-2xl font-bold text-slate-950'>{overview.totals.verifiedClaims}</div>
          <div className='mt-1 text-xs text-slate-500'>Verified claims</div>
        </div>
        <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
          <AlertTriangle className='h-5 w-5 text-orange-700' />
          <div className='mt-3 text-2xl font-bold text-slate-950'>{overview.totals.conflicts}</div>
          <div className='mt-1 text-xs text-slate-500'>Conflict flags</div>
        </div>
      </section>

      <section className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
        <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
          <div>
            <p className='text-xs font-bold uppercase tracking-[0.18em] text-cyan-700'>Daily queue</p>
            <h2 className='mt-1 text-lg font-bold text-slate-950'>Today&apos;s content schedule</h2>
            <p className='mt-1 text-sm text-slate-600'>
              The queue defaults to {dailyQueue.limit} items so we keep the publication rhythm controlled.
            </p>
          </div>
          <div className='rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700'>
            {dailyQueue.counts.publish} publish · {dailyQueue.counts.review} review · {dailyQueue.counts.enrich} enrich
          </div>
        </div>

        <div className='mt-4 grid gap-3 md:grid-cols-3'>
          {dailyQueue.items.length > 0 ? (
            dailyQueue.items.map((item, index) => (
              <div
                key={item.id}
                className={`rounded-xl border p-4 ${
                  item.lane === 'publish'
                    ? 'border-emerald-200 bg-emerald-50'
                    : item.lane === 'review'
                      ? 'border-amber-200 bg-amber-50'
                      : item.lane === 'enrich'
                        ? 'border-cyan-200 bg-cyan-50'
                        : 'border-rose-200 bg-rose-50'
                }`}
              >
                <div className='flex items-center justify-between gap-3'>
                  <div>
                    <p className='text-xs font-bold uppercase tracking-wide text-slate-500'>Slot #{index + 1}</p>
                    <h3 className='mt-1 text-base font-bold text-slate-950'>{item.productName}</h3>
                    <p className='text-xs text-slate-500'>{item.canonicalDomain}</p>
                  </div>
                  <span className='rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-700'>
                    {item.lane} · {item.score}
                  </span>
                </div>

                <p className='mt-3 text-sm leading-6 text-slate-700'>{item.summary}</p>
                <p className='mt-2 text-sm font-semibold text-slate-900'>{item.scheduledAction}</p>
                <p className='mt-1 text-xs text-slate-500'>
                  {item.blockers.length > 0 ? `Blockers: ${item.blockers.join(' · ')}` : 'No blocking issues'}
                </p>
                <div className='mt-3 flex flex-wrap gap-2 text-xs text-slate-600'>
                  <span className='rounded-full bg-white px-2 py-1'>Owner: {item.ownerType}</span>
                  <span className='rounded-full bg-white px-2 py-1'>Status: {item.status}</span>
                  <span className='rounded-full bg-white px-2 py-1'>
                    Review: {item.nextReviewAt ? formatDate(item.nextReviewAt) : '—'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className='rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 md:col-span-3'>
              No queue items are ready yet. Once profiles reach publish or review readiness, they will show here.
            </div>
          )}
        </div>
      </section>

      <section className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
        <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
          <div>
            <p className='text-xs font-bold uppercase tracking-[0.18em] text-cyan-700'>Review queue</p>
            <h2 className='mt-1 text-lg font-bold text-slate-950'>30-day facts · 90-day decisions</h2>
            <p className='mt-1 text-sm text-slate-600'>
              Published profiles automatically stay visible here so review work does not get lost.
            </p>
          </div>
          <div className='rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700'>
            {reviewQueue.counts.overdue} overdue · {reviewQueue.counts.dueSoon} due soon ·{' '}
            {reviewQueue.counts.scheduled} scheduled · {reviewQueue.counts.unscheduled} unscheduled
          </div>
        </div>

        <div className='mt-4 flex flex-wrap gap-2'>
          {[
            { label: 'All reviews', type: 'all' },
            { label: '30-day facts', type: 'fact' },
            { label: '90-day decisions', type: 'decision' },
          ].map((filter) => (
            <Link
              key={filter.type}
              href={`/admin/intelligence?reviewType=${filter.type}`}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                (searchParams.reviewType || 'all') === filter.type
                  ? 'bg-slate-950 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {filter.label}
            </Link>
          ))}
        </div>
        <div className='mt-2 flex flex-wrap gap-2'>
          {[
            { label: 'Any state', state: 'all' },
            { label: 'Overdue', state: 'overdue' },
            { label: 'Due soon', state: 'due_soon' },
            { label: 'Scheduled', state: 'scheduled' },
            { label: 'Needs baseline', state: 'unscheduled' },
          ].map((filter) => (
            <Link
              key={filter.state}
              href={`/admin/intelligence?reviewType=${searchParams.reviewType || 'all'}&reviewState=${filter.state}`}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                (searchParams.reviewState || 'all') === filter.state
                  ? 'bg-cyan-700 text-white'
                  : 'bg-cyan-50 text-cyan-800 hover:bg-cyan-100'
              }`}
            >
              {filter.label}
            </Link>
          ))}
        </div>

        <div className='mt-4 grid gap-3 md:grid-cols-3'>
          {reviewQueue.items.length > 0 ? (
            reviewQueue.items.map((item, index) => (
              <div
                key={`${item.id}-${item.reviewType}`}
                className={`rounded-xl border p-4 ${
                  item.state === 'overdue'
                    ? 'border-rose-200 bg-rose-50'
                    : item.state === 'due_soon'
                      ? 'border-amber-200 bg-amber-50'
                      : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className='flex items-center justify-between gap-3'>
                  <div>
                    <p className='text-xs font-bold uppercase tracking-wide text-slate-500'>Review #{index + 1}</p>
                    <h3 className='mt-1 text-base font-bold text-slate-950'>{item.productName}</h3>
                    <p className='text-xs text-slate-500'>{item.canonicalDomain}</p>
                  </div>
                  <span className='rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-700'>
                    {item.reviewType} · {item.cadenceDays}d
                  </span>
                </div>

                <p className='mt-3 text-sm leading-6 text-slate-700'>{item.reason}</p>
                <p className='mt-2 text-sm font-semibold text-slate-900'>{item.action}</p>
                <div className='mt-3 flex flex-wrap gap-2 text-xs text-slate-600'>
                  <span className='rounded-full bg-white px-2 py-1'>Owner: {item.ownerType}</span>
                  <span className='rounded-full bg-white px-2 py-1'>Status: {item.status}</span>
                  <span className='rounded-full bg-white px-2 py-1'>
                    Due: {item.dueAt ? formatDate(item.dueAt) : '—'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className='rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 md:col-span-3'>
              No review items are ready yet. Profiles with next review dates will appear here automatically.
            </div>
          )}
        </div>
      </section>

      <section className='grid gap-4 lg:grid-cols-[1.1fr_1.4fr]'>
        <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
          <div className='flex items-center justify-between gap-3'>
            <h2 className='text-lg font-bold text-slate-950'>Profiles</h2>
            <span className='text-xs text-slate-500'>{overview.profiles.length} shown</span>
          </div>
          <div className='mt-4 space-y-3'>
            {overview.profiles.map((profile) => {
              const params = new URLSearchParams();
              if (ownerType !== 'all') params.set('ownerType', ownerType);
              if (status !== 'all') params.set('status', status);
              params.set('profileId', profile.id);
              return (
                <Link
                  key={profile.id}
                  href={`/admin/intelligence?${params.toString()}`}
                  className={`block rounded-xl border p-4 transition ${
                    selected?.id === profile.id
                      ? 'border-cyan-300 bg-cyan-50/60'
                      : 'border-slate-200 hover:border-cyan-200 hover:bg-slate-50'
                  }`}
                >
                  <div className='flex items-center justify-between gap-3'>
                    <div>
                      <div className='text-sm font-semibold text-slate-950'>{profile.productName}</div>
                      <div className='mt-1 text-xs text-slate-500'>
                        {profile.canonicalDomain} · {profile.ownerType}
                      </div>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${badgeClass(profile.status)}`}>
                      {profile.status}
                    </span>
                  </div>
                  <div className='mt-3 grid grid-cols-4 gap-2 text-xs text-slate-500'>
                    <div>
                      <span className='block font-semibold text-slate-900'>{profile.sourceCount}</span>
                      sources
                    </div>
                    <div>
                      <span className='block font-semibold text-slate-900'>{profile.claimCount}</span>
                      claims
                    </div>
                    <div>
                      <span className='block font-semibold text-slate-900'>{profile.assetCount}</span>
                      assets
                    </div>
                    <div>
                      <span className='block font-semibold text-slate-900'>{profile.conflictCount}</span>
                      conflicts
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
          {selected ? (
            <div className='space-y-5'>
              <div className='flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between'>
                <div>
                  <div className='inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700'>
                    {selected.ownerType}
                  </div>
                  <h2 className='mt-3 text-2xl font-bold text-slate-950'>{selected.productName}</h2>
                  <p className='mt-2 text-sm text-slate-600'>{selected.canonicalDomain}</p>
                </div>
                <div className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass(selected.status)}`}>
                  {selected.status}
                </div>
              </div>

              <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
                <div className='rounded-xl bg-slate-50 p-3'>
                  <div className='text-xs uppercase tracking-wide text-slate-500'>Version</div>
                  <div className='mt-1 text-lg font-semibold text-slate-950'>{selected.version}</div>
                </div>
                <div className='rounded-xl bg-slate-50 p-3'>
                  <div className='text-xs uppercase tracking-wide text-slate-500'>Last crawled</div>
                  <div className='mt-1 text-lg font-semibold text-slate-950'>{formatDate(selected.lastCrawledAt)}</div>
                </div>
                <div className='rounded-xl bg-slate-50 p-3'>
                  <div className='text-xs uppercase tracking-wide text-slate-500'>Last verified</div>
                  <div className='mt-1 text-lg font-semibold text-slate-950'>{formatDate(selected.lastVerifiedAt)}</div>
                </div>
                <div className='rounded-xl bg-slate-50 p-3'>
                  <div className='text-xs uppercase tracking-wide text-slate-500'>Next review</div>
                  <div className='mt-1 text-lg font-semibold text-slate-950'>{formatDate(selected.nextReviewAt)}</div>
                </div>
              </div>

              <div className='rounded-2xl border border-slate-200 bg-slate-50/70 p-4'>
                <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
                  <div>
                    <p className='text-xs font-bold uppercase tracking-[0.16em] text-slate-500'>
                      Evidence-backed quality
                    </p>
                    <div className='mt-2 flex items-baseline gap-2'>
                      <span className='text-3xl font-bold text-slate-950'>{selected.qualityAssessment.total}</span>
                      <span className='text-sm text-slate-500'>/ 100</span>
                    </div>
                  </div>
                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${decisionClass(
                      selected.qualityAssessment.decision,
                    )}`}
                  >
                    {selected.qualityAssessment.decision.replaceAll('_', ' ')}
                  </span>
                </div>

                <div className='mt-5 grid gap-3 sm:grid-cols-2'>
                  {QUALITY_DIMENSIONS.map((dimension) => {
                    const score = selected.qualityAssessment.breakdown[dimension.key];
                    const percentage = Math.round((score / dimension.maximum) * 100);
                    return (
                      <div key={dimension.key} className='rounded-xl border border-slate-200 bg-white p-3'>
                        <div className='flex items-center justify-between gap-3 text-xs'>
                          <span className='font-semibold text-slate-700'>{dimension.label}</span>
                          <span className='text-slate-500'>
                            {score}/{dimension.maximum}
                          </span>
                        </div>
                        <div className='mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100'>
                          <div className='h-full rounded-full bg-cyan-500' style={{ width: `${percentage}%` }} />
                        </div>
                        <p className='mt-2 text-xs leading-5 text-slate-500'>
                          {selected.qualityAssessment.signals[dimension.key].join(' · ')}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {selected.qualityAssessment.blockers.length > 0 ? (
                  <div className='mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3'>
                    <div className='text-xs font-bold uppercase tracking-wide text-rose-700'>Publish blockers</div>
                    <div className='mt-2 text-sm text-rose-800'>{selected.qualityAssessment.blockers.join(' · ')}</div>
                  </div>
                ) : null}

                {selected.qualityAssessment.recommendations.length > 0 ? (
                  <div className='mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3'>
                    <div className='text-xs font-bold uppercase tracking-wide text-amber-800'>
                      Recommended next actions
                    </div>
                    <ul className='mt-2 space-y-1 text-sm text-amber-950'>
                      {selected.qualityAssessment.recommendations.map((recommendation: string) => (
                        <li key={recommendation}>• {recommendation}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>

              <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
                <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
                  <div>
                    <p className='text-xs font-bold uppercase tracking-[0.16em] text-cyan-700'>
                      Evidence-bound composer
                    </p>
                    <h3 className='mt-1 text-lg font-bold text-slate-950'>Traceable content blocks</h3>
                    <p className='mt-1 text-sm text-slate-600'>
                      Each block is composed only from verified claims and keeps its claim and source trail attached.
                    </p>
                  </div>
                  <div className='rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700'>
                    {selected.contentComposer.traceability.blockCount} blocks
                  </div>
                </div>

                <div className='mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
                  <div className='rounded-xl bg-slate-50 p-3'>
                    <div className='text-xs uppercase tracking-wide text-slate-500'>Verified claims</div>
                    <div className='mt-1 text-lg font-semibold text-slate-950'>
                      {selected.contentComposer.traceability.verifiedClaimCount}
                    </div>
                  </div>
                  <div className='rounded-xl bg-slate-50 p-3'>
                    <div className='text-xs uppercase tracking-wide text-slate-500'>Sources</div>
                    <div className='mt-1 text-lg font-semibold text-slate-950'>
                      {selected.contentComposer.traceability.sourceCount}
                    </div>
                  </div>
                  <div className='rounded-xl bg-slate-50 p-3'>
                    <div className='text-xs uppercase tracking-wide text-slate-500'>Assets</div>
                    <div className='mt-1 text-lg font-semibold text-slate-950'>
                      {selected.contentComposer.traceability.assetCount}
                    </div>
                  </div>
                  <div className='rounded-xl bg-slate-50 p-3'>
                    <div className='text-xs uppercase tracking-wide text-slate-500'>Generated at</div>
                    <div className='mt-1 text-sm font-semibold text-slate-950'>
                      {formatDate(selected.contentComposer.generatedAt)}
                    </div>
                  </div>
                </div>

                {selected.contentComposer.warnings.length > 0 ? (
                  <div className='mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3'>
                    <div className='text-xs font-bold uppercase tracking-wide text-amber-800'>Composer warnings</div>
                    <ul className='mt-2 space-y-1 text-sm text-amber-950'>
                      {selected.contentComposer.warnings.map((warning) => (
                        <li key={warning}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div
                  className={`mt-4 rounded-xl border p-3 ${
                    selected.factualGate.passed ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'
                  }`}
                >
                  <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
                    <div>
                      <div
                        className={`text-xs font-bold uppercase tracking-wide ${
                          selected.factualGate.passed ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        Factual gate
                      </div>
                      <p
                        className={`mt-2 text-sm ${selected.factualGate.passed ? 'text-emerald-950' : 'text-rose-950'}`}
                      >
                        {selected.factualGate.summary}
                      </p>
                    </div>
                    <div className='rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700'>
                      {selected.factualGate.verifiedClaimCount} verified claims
                    </div>
                  </div>

                  {selected.factualGate.findings.length > 0 ? (
                    <div className='mt-3 space-y-2'>
                      {selected.factualGate.findings.map((finding) => (
                        <div
                          key={finding.id}
                          className={`rounded-lg border bg-white p-3 text-sm ${
                            finding.severity === 'block'
                              ? 'border-rose-200 text-rose-900'
                              : 'border-amber-200 text-amber-900'
                          }`}
                        >
                          <div className='flex flex-wrap items-center gap-2'>
                            <span className='rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700'>
                              {finding.severity}
                            </span>
                            <span>{finding.message}</span>
                          </div>
                          {finding.sourceUrls.length > 0 ? (
                            <div className='mt-2 space-y-1 text-xs text-slate-500'>
                              {finding.sourceUrls.map((sourceUrl) => (
                                <a
                                  key={sourceUrl}
                                  href={sourceUrl}
                                  target='_blank'
                                  rel='noreferrer'
                                  className='block truncate text-cyan-700 hover:underline'
                                >
                                  {sourceUrl}
                                </a>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div
                  className={`mt-4 rounded-xl border p-3 ${
                    selected.uniquenessGate.passed ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'
                  }`}
                >
                  <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
                    <div>
                      <div
                        className={`text-xs font-bold uppercase tracking-wide ${
                          selected.uniquenessGate.passed ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        Uniqueness gate
                      </div>
                      <p
                        className={`mt-2 text-sm ${selected.uniquenessGate.passed ? 'text-emerald-950' : 'text-rose-950'}`}
                      >
                        {selected.uniquenessGate.summary}
                      </p>
                    </div>
                    <div className='rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700'>
                      max similarity {selected.uniquenessGate.maxSimilarity}
                    </div>
                  </div>

                  {selected.uniquenessGate.findings.length > 0 ? (
                    <div className='mt-3 space-y-2'>
                      {selected.uniquenessGate.findings.map((finding) => (
                        <div
                          key={finding.id}
                          className={`rounded-lg border bg-white p-3 text-sm ${
                            finding.severity === 'block'
                              ? 'border-rose-200 text-rose-900'
                              : 'border-amber-200 text-amber-900'
                          }`}
                        >
                          <div className='flex flex-wrap items-center gap-2'>
                            <span className='rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700'>
                              {finding.severity}
                            </span>
                            <span>{finding.message}</span>
                            {finding.similarity !== null ? (
                              <span className='rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600'>
                                similarity {finding.similarity}
                              </span>
                            ) : null}
                          </div>
                          {finding.matchedText.length > 0 ? (
                            <div className='mt-2 space-y-1 text-xs text-slate-500'>
                              {finding.matchedText.map((text) => (
                                <div key={text} className='line-clamp-2 rounded bg-slate-50 px-2 py-1'>
                                  {text}
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div
                  className={`mt-4 rounded-xl border p-3 ${
                    selected.indexGate.decision === 'publish'
                      ? 'border-emerald-200 bg-emerald-50'
                      : selected.indexGate.decision === 'noindex'
                        ? 'border-amber-200 bg-amber-50'
                        : 'border-rose-200 bg-rose-50'
                  }`}
                >
                  <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
                    <div>
                      <div
                        className={`text-xs font-bold uppercase tracking-wide ${
                          selected.indexGate.decision === 'publish'
                            ? 'text-emerald-700'
                            : selected.indexGate.decision === 'noindex'
                              ? 'text-amber-700'
                              : 'text-rose-700'
                        }`}
                      >
                        Index gate
                      </div>
                      <p
                        className={`mt-2 text-sm ${
                          selected.indexGate.decision === 'publish'
                            ? 'text-emerald-950'
                            : selected.indexGate.decision === 'noindex'
                              ? 'text-amber-950'
                              : 'text-rose-950'
                        }`}
                      >
                        {selected.indexGate.summary}
                      </p>
                    </div>
                    <div className='rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700'>
                      {selected.indexGate.decision} · score {selected.indexGate.score}
                    </div>
                  </div>

                  <div className='mt-3 grid gap-3 sm:grid-cols-3'>
                    <div className='rounded-lg bg-white p-3'>
                      <div className='text-xs uppercase tracking-wide text-slate-500'>Should index</div>
                      <div className='mt-1 text-lg font-semibold text-slate-950'>
                        {selected.indexGate.shouldIndex ? 'Yes' : 'No'}
                      </div>
                    </div>
                    <div className='rounded-lg bg-white p-3'>
                      <div className='text-xs uppercase tracking-wide text-slate-500'>Should publish</div>
                      <div className='mt-1 text-lg font-semibold text-slate-950'>
                        {selected.indexGate.shouldPublish ? 'Yes' : 'No'}
                      </div>
                    </div>
                    <div className='rounded-lg bg-white p-3'>
                      <div className='text-xs uppercase tracking-wide text-slate-500'>Findings</div>
                      <div className='mt-1 text-lg font-semibold text-slate-950'>
                        {selected.indexGate.findings.length}
                      </div>
                    </div>
                  </div>

                  {selected.indexGate.findings.length > 0 ? (
                    <div className='mt-3 space-y-2'>
                      {selected.indexGate.findings.map((finding) => (
                        <div
                          key={finding.id}
                          className={`rounded-lg border bg-white p-3 text-sm ${
                            finding.severity === 'block'
                              ? 'border-rose-200 text-rose-900'
                              : 'border-amber-200 text-amber-900'
                          }`}
                        >
                          <span className='rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700'>
                            {finding.severity}
                          </span>
                          <span className='ml-2'>{finding.message}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className='mt-4 space-y-3'>
                  {selected.contentComposer.blocks.map((block) => (
                    <div key={block.id} className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
                      <div className='flex flex-wrap items-center justify-between gap-3'>
                        <h4 className='text-sm font-bold text-slate-950'>{block.title}</h4>
                        <span className='text-xs text-slate-500'>{block.claimIds.length} claims</span>
                      </div>
                      <p className='mt-2 text-sm leading-6 text-slate-700'>{block.paragraph}</p>
                      {block.notes.length > 0 ? (
                        <ul className='mt-2 space-y-1 text-xs text-slate-500'>
                          {block.notes.map((note) => (
                            <li key={note}>• {note}</li>
                          ))}
                        </ul>
                      ) : null}
                      <div className='mt-3 flex flex-wrap gap-2'>
                        {block.claimIds.map((claimId) => (
                          <span key={claimId} className='rounded-full bg-white px-2 py-1 text-[11px] text-slate-600'>
                            claim:{claimId.slice(0, 8)}
                          </span>
                        ))}
                      </div>
                      {block.sourceUrls.length > 0 ? (
                        <div className='mt-3 space-y-1 text-xs text-slate-500'>
                          {block.sourceUrls.map((sourceUrl) => (
                            <a
                              key={sourceUrl}
                              href={sourceUrl}
                              target='_blank'
                              rel='noreferrer'
                              className='block truncate text-cyan-700 hover:underline'
                            >
                              {sourceUrl}
                            </a>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>

              <div className='grid gap-4 xl:grid-cols-3'>
                <div className='rounded-xl border border-amber-200 bg-amber-50 p-4 xl:col-span-3'>
                  <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
                    <div>
                      <p className='text-xs font-bold uppercase tracking-[0.16em] text-amber-700'>Change review</p>
                      <h3 className='mt-1 text-lg font-bold text-slate-950'>Detected facts waiting for review</h3>
                      <p className='mt-1 text-sm text-slate-600'>
                        Automated scans never overwrite the verified baseline. Accept or reject these differences in a
                        later review step.
                      </p>
                    </div>
                    <span className='rounded-full bg-white px-3 py-1 text-xs font-semibold text-amber-800'>
                      {selected.changes.filter((change) => change.reviewStatus === 'pending').length} pending
                    </span>
                  </div>

                  <div className='mt-4 space-y-3'>
                    {selected.changes.length > 0 ? (
                      selected.changes.map((change) => (
                        <div key={change.id} className='rounded-xl border border-amber-100 bg-white p-4'>
                          <div className='flex flex-wrap items-center gap-2 text-xs font-semibold'>
                            <span className='rounded-full bg-slate-100 px-2 py-1 text-slate-700'>
                              {change.claimType}
                            </span>
                            <span className='rounded-full bg-amber-100 px-2 py-1 text-amber-800'>
                              {change.changeType}
                            </span>
                            <span className='rounded-full bg-slate-100 px-2 py-1 text-slate-700'>
                              {change.reviewStatus}
                            </span>
                            <span className='text-slate-500'>{formatDate(change.detectedAt)}</span>
                          </div>
                          <div className='mt-3 grid gap-3 md:grid-cols-2'>
                            <div className='rounded-lg bg-slate-50 p-3'>
                              <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                                Verified baseline
                              </p>
                              <p className='mt-2 break-words text-sm text-slate-800'>
                                {change.oldValue === null
                                  ? '—'
                                  : typeof change.oldValue === 'string'
                                    ? change.oldValue
                                    : JSON.stringify(change.oldValue)}
                              </p>
                            </div>
                            <div className='rounded-lg bg-cyan-50 p-3'>
                              <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
                                New observation
                              </p>
                              <p className='mt-2 break-words text-sm text-slate-800'>
                                {change.newValue === null
                                  ? '—'
                                  : typeof change.newValue === 'string'
                                    ? change.newValue
                                    : JSON.stringify(change.newValue)}
                              </p>
                            </div>
                          </div>
                          <a
                            href={change.sourceUrl}
                            target='_blank'
                            rel='noreferrer'
                            className='mt-3 block truncate text-xs text-cyan-700 hover:underline'
                          >
                            {change.sourceUrl}
                          </a>
                        </div>
                      ))
                    ) : (
                      <p className='rounded-lg bg-white p-3 text-sm text-slate-500'>No detected changes are waiting.</p>
                    )}
                  </div>
                </div>

                <div className='rounded-xl border border-slate-200 p-4'>
                  <h3 className='text-sm font-bold text-slate-950'>Facts</h3>
                  <dl className='mt-3 space-y-3 text-sm'>
                    <div>
                      <dt className='text-slate-500'>Metadata</dt>
                      <dd className='mt-1 text-slate-900'>
                        {Object.keys(selected.metadata).length > 0 ? 'Present' : 'Empty'}
                      </dd>
                    </div>
                    <div>
                      <dt className='text-slate-500'>Source count</dt>
                      <dd className='mt-1 text-slate-900'>{selected.sourceCount}</dd>
                    </div>
                    <div>
                      <dt className='text-slate-500'>Claim count</dt>
                      <dd className='mt-1 text-slate-900'>{selected.claimCount}</dd>
                    </div>
                    <div>
                      <dt className='text-slate-500'>Asset count</dt>
                      <dd className='mt-1 text-slate-900'>{selected.assetCount}</dd>
                    </div>
                    <div>
                      <dt className='text-slate-500'>Conflict flags</dt>
                      <dd className='mt-1 text-slate-900'>{selected.conflictCount}</dd>
                    </div>
                  </dl>
                </div>

                <div className='rounded-xl border border-slate-200 p-4 xl:col-span-2'>
                  <h3 className='text-sm font-bold text-slate-950'>Claims</h3>
                  <div className='mt-3 space-y-3'>
                    {selected.claims.length > 0 ? (
                      selected.claims.map((claim) => (
                        <div key={claim.id} className='rounded-lg bg-slate-50 p-3'>
                          <div className='flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500'>
                            <span className='rounded-full bg-white px-2 py-1 text-slate-700'>{claim.claimType}</span>
                            <span className='rounded-full bg-white px-2 py-1 text-slate-700'>
                              {claim.conflictStatus}
                            </span>
                            <span className='rounded-full bg-white px-2 py-1 text-slate-700'>
                              conf:{claim.confidence}
                            </span>
                          </div>
                          <div className='mt-2 text-sm text-slate-900'>
                            {typeof claim.claimValue === 'string' ? claim.claimValue : JSON.stringify(claim.claimValue)}
                          </div>
                          <div className='mt-2 text-xs text-slate-500'>
                            {claim.sourceUrl}
                            {claim.sourceExcerpt ? (
                              <span className='mt-1 block text-slate-400'>{claim.sourceExcerpt}</span>
                            ) : null}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className='text-sm text-slate-500'>No claims recorded.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className='grid gap-4 xl:grid-cols-2'>
                <div className='rounded-xl border border-slate-200 p-4'>
                  <h3 className='text-sm font-bold text-slate-950'>Sources</h3>
                  <div className='mt-3 space-y-3'>
                    {selected.sources.length > 0 ? (
                      selected.sources.map((source) => (
                        <div key={source.id} className='rounded-lg bg-slate-50 p-3 text-sm'>
                          <div className='flex items-center justify-between gap-3'>
                            <span className='font-semibold text-slate-900'>{source.pageType}</span>
                            <span className='rounded-full bg-white px-2 py-1 text-xs text-slate-600'>
                              {source.fetchStatus}
                            </span>
                          </div>
                          <a
                            href={source.url}
                            target='_blank'
                            rel='noreferrer'
                            className='mt-2 block truncate text-cyan-700 hover:underline'
                          >
                            {source.url}
                          </a>
                          <div className='mt-2 text-xs text-slate-500'>
                            status {source.httpStatus ?? '—'} · fetched {formatDate(source.fetchedAt)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className='text-sm text-slate-500'>No sources recorded.</p>
                    )}
                  </div>
                </div>

                <div className='rounded-xl border border-slate-200 p-4'>
                  <h3 className='text-sm font-bold text-slate-950'>Assets</h3>
                  <div className='mt-3 space-y-3'>
                    {selected.assets.length > 0 ? (
                      selected.assets.map((asset) => (
                        <div key={asset.id} className='rounded-lg bg-slate-50 p-3 text-sm'>
                          <div className='flex items-center justify-between gap-3'>
                            <span className='font-semibold text-slate-900'>{asset.assetType}</span>
                            <span className='rounded-full bg-white px-2 py-1 text-xs text-slate-600'>
                              {asset.evidenceStatus}
                            </span>
                          </div>
                          <a
                            href={asset.sourceUrl}
                            target='_blank'
                            rel='noreferrer'
                            className='mt-2 block truncate text-cyan-700 hover:underline'
                          >
                            {asset.sourceUrl}
                          </a>
                          <div className='mt-2 text-xs text-slate-500'>
                            {asset.isPlaceholder ? 'placeholder' : 'real asset'}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className='text-sm text-slate-500'>No assets recorded.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className='flex min-h-[420px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500'>
              Select a profile to inspect its evidence, conflicts, and review timing.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
