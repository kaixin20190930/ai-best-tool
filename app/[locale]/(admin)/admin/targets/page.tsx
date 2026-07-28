import Link from 'next/link';
import { ArrowUpRight, RefreshCw, ShieldAlert, ShieldCheck, Sparkles } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { reviewDistributionTarget, updateDistributionTarget } from '@/app/actions/admin/targets';
import { getAdminDistributionTargetRegistry } from '@/lib/services/admin/targets';

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'admin' });

  return {
    title: `${t('title')} - Targets`,
  };
}

function formatDate(value: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString();
}

function badgeClass(status: string) {
  if (status === 'active') return 'bg-emerald-50 text-emerald-700';
  if (status === 'blocked') return 'bg-rose-50 text-rose-700';
  if (status === 'stale') return 'bg-amber-50 text-amber-700';
  if (status === 'retired') return 'bg-slate-100 text-slate-600';
  return 'bg-slate-100 text-slate-600';
}

function obstacleClass(status: string) {
  if (status === 'blocked') return 'bg-rose-50 text-rose-700';
  if (status === 'needs_review') return 'bg-amber-50 text-amber-700';
  return 'bg-emerald-50 text-emerald-700';
}

function scoreClass(grade: string | null | undefined) {
  if (grade === 'excellent') return 'bg-emerald-50 text-emerald-700';
  if (grade === 'good') return 'bg-cyan-50 text-cyan-700';
  if (grade === 'moderate') return 'bg-amber-50 text-amber-700';
  if (grade === 'hard') return 'bg-orange-50 text-orange-700';
  if (grade === 'blocked') return 'bg-rose-50 text-rose-700';
  return 'bg-slate-100 text-slate-600';
}

export default async function AdminTargetsPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: {
    status?: string;
    channelId?: string;
    search?: string;
  };
}) {
  const registry = await getAdminDistributionTargetRegistry({
    status: searchParams.status,
    channelId: searchParams.channelId,
    search: searchParams.search,
    limit: 200,
  });

  const statusCountLabel = `${registry.totals.active} active · ${registry.totals.stale} stale · ${registry.totals.blocked} blocked · ${registry.totals.retired} retired`;

  return (
    <div className='space-y-6'>
      <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-end'>
        <div>
          <p className='text-xs font-bold uppercase tracking-[0.18em] text-cyan-700'>Distribution targets</p>
          <h1 className='mt-2 text-3xl font-bold text-slate-950'>Target registry</h1>
          <p className='mt-2 max-w-2xl text-sm leading-6 text-slate-600'>
            Review target-site rules, snapshot history, obstacle states, and next review timing in one place.
          </p>
        </div>
        <div className='flex flex-wrap gap-2'>
          <Link
            href='/admin/intelligence'
            className='inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-cyan-300 hover:text-cyan-700'
          >
            Open evidence archive <ArrowUpRight className='h-4 w-4' />
          </Link>
          <Link
            href='/admin/distribution'
            className='inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-cyan-300 hover:text-cyan-700'
          >
            Open distribution ops <ArrowUpRight className='h-4 w-4' />
          </Link>
        </div>
      </div>

      <section className='grid gap-3 sm:grid-cols-2 lg:grid-cols-6'>
        <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
          <Sparkles className='h-5 w-5 text-cyan-700' />
          <div className='mt-3 text-2xl font-bold text-slate-950'>{registry.totals.total}</div>
          <div className='mt-1 text-xs text-slate-500'>Targets</div>
        </div>
        <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
          <ShieldCheck className='h-5 w-5 text-emerald-700' />
          <div className='mt-3 text-2xl font-bold text-slate-950'>{registry.totals.active}</div>
          <div className='mt-1 text-xs text-slate-500'>Active</div>
        </div>
        <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
          <ShieldAlert className='h-5 w-5 text-amber-700' />
          <div className='mt-3 text-2xl font-bold text-slate-950'>{registry.totals.needsReview}</div>
          <div className='mt-1 text-xs text-slate-500'>Needs review</div>
        </div>
        <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
          <ShieldAlert className='h-5 w-5 text-rose-700' />
          <div className='mt-3 text-2xl font-bold text-slate-950'>{registry.totals.blocked}</div>
          <div className='mt-1 text-xs text-slate-500'>Blocked</div>
        </div>
        <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
          <div className='mt-1 text-xs uppercase tracking-wide text-slate-500'>Obstacle count</div>
          <div className='mt-3 text-2xl font-bold text-slate-950'>{registry.totals.blockedObstacles}</div>
          <div className='mt-1 text-xs text-slate-500'>Blocked snapshots</div>
        </div>
        <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
          <div className='mt-1 text-xs uppercase tracking-wide text-slate-500'>Status mix</div>
          <div className='mt-3 text-sm font-semibold text-slate-900'>{statusCountLabel}</div>
          <div className='mt-1 text-xs text-slate-500'>Latest registry state</div>
        </div>
      </section>

      <section className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
        <div className='flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between'>
          <div>
            <p className='text-xs font-bold uppercase tracking-[0.18em] text-cyan-700'>Filters</p>
            <h2 className='mt-1 text-lg font-bold text-slate-950'>Search and narrow the registry</h2>
          </div>
          <form className='flex w-full flex-col gap-3 lg:w-auto lg:flex-row' method='get'>
            <input
              name='search'
              defaultValue={searchParams.search || ''}
              placeholder='Search by name, URL, note...'
              className='min-w-[260px] rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-cyan-300'
            />
            <select
              name='status'
              defaultValue={searchParams.status || ''}
              className='rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-cyan-300'
            >
              <option value=''>All statuses</option>
              <option value='active'>Active</option>
              <option value='stale'>Stale</option>
              <option value='blocked'>Blocked</option>
              <option value='retired'>Retired</option>
            </select>
            <select
              name='channelId'
              defaultValue={searchParams.channelId || ''}
              className='rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-cyan-300'
            >
              <option value=''>All channels</option>
              {registry.channels.map((channel) => (
                <option key={channel.id} value={channel.id}>
                  {channel.name}
                </option>
              ))}
            </select>
            <button
              type='submit'
              className='inline-flex items-center justify-center rounded-xl bg-cyan-600 px-4 py-2 text-sm font-bold text-white hover:bg-cyan-700'
            >
              Apply
            </button>
          </form>
        </div>
      </section>

      <section className='space-y-4'>
        {registry.targets.length > 0 ? (
          registry.targets.map((target) => (
            <div key={target.id} className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
              <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
                <div className='min-w-0 space-y-2'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <h3 className='text-lg font-bold text-slate-950'>{target.name}</h3>
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${badgeClass(target.targetStatus)}`}>
                      {target.targetStatus}
                    </span>
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${obstacleClass(target.snapshot?.obstacleStatus || 'clear')}`}>
                      {target.snapshot?.obstacleStatus || 'clear'}
                    </span>
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${scoreClass(target.snapshot?.matchGrade || null)}`}>
                      {target.snapshot?.matchScore ?? '—'}
                      {target.snapshot?.matchGrade ? ` ${target.snapshot.matchGrade}` : ''}
                    </span>
                  </div>
                  <div className='text-sm text-slate-600'>
                    {target.channelName} · {target.channelType} · rule v{target.currentRuleVersion}
                  </div>
                  {target.snapshot?.matchSummary ? <p className='max-w-2xl text-sm text-slate-700'>{target.snapshot.matchSummary}</p> : null}
                  <a
                    href={target.homepageUrl}
                    target='_blank'
                    rel='noreferrer'
                    className='block max-w-2xl truncate text-sm text-cyan-700 hover:underline'
                  >
                    {target.homepageUrl}
                  </a>
                  <div className='flex flex-wrap gap-2 pt-1 text-xs text-slate-600'>
                    <span className='rounded-full bg-slate-50 px-2 py-1'>Account {target.requiresAccount ? 'yes' : 'no'}</span>
                    <span className='rounded-full bg-slate-50 px-2 py-1'>Payment {target.requiresPayment ? 'yes' : 'no'}</span>
                    <span className='rounded-full bg-slate-50 px-2 py-1'>Captcha {target.requiresCaptcha ? 'yes' : 'no'}</span>
                    <span className='rounded-full bg-slate-50 px-2 py-1'>Backlink {target.requiresBacklink ? 'yes' : 'no'}</span>
                    <span className='rounded-full bg-slate-50 px-2 py-1'>Editorial {target.editorialReview ? 'yes' : 'no'}</span>
                  </div>
                  <p className='text-sm text-slate-700'>
                    Snapshot: {target.snapshot ? `v${target.snapshot.ruleVersion} · ${formatDate(target.snapshot.fetchedAt)} · ${target.snapshot.discoveredPageCount} pages` : 'No snapshot yet'}
                  </p>
                  <p className='text-sm text-slate-700'>
                    Next review: {formatDate(target.nextCheckAt)} · Last checked: {formatDate(target.lastCheckedAt)}
                  </p>
                  {target.notes ? <p className='rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700'>{target.notes}</p> : null}
                </div>

                <div className='w-full max-w-[420px] rounded-2xl border border-slate-200 bg-slate-50 p-4'>
                  <div className='flex items-center justify-between gap-3'>
                    <div>
                      <p className='text-xs font-bold uppercase tracking-wide text-slate-500'>Quick refresh</p>
                      <p className='text-sm font-semibold text-slate-900'>Re-run discovery and snapshot</p>
                    </div>
                    <RefreshCw className='h-4 w-4 text-cyan-700' />
                  </div>

                  <form action={reviewDistributionTarget} className='mt-3 flex flex-col gap-3'>
                    <input type='hidden' name='targetId' value={target.id} />
                    <input type='hidden' name='homepageUrl' value={target.homepageUrl} />
                    <input type='hidden' name='locale' value={params.locale} />
                    <button
                      type='submit'
                      className='inline-flex items-center justify-center rounded-xl border border-cyan-200 bg-cyan-600 px-4 py-2 text-sm font-bold text-white hover:bg-cyan-700'
                    >
                      Refresh snapshot
                    </button>
                  </form>

                  <form action={updateDistributionTarget} className='mt-4 grid gap-3'>
                    <input type='hidden' name='targetId' value={target.id} />
                    <input type='hidden' name='homepageUrl' value={target.homepageUrl} />
                    <input type='hidden' name='submissionUrl' value={target.submissionUrl || ''} />
                    <input type='hidden' name='registrationUrl' value={target.registrationUrl || ''} />
                    <input type='hidden' name='pricingUrl' value={target.pricingUrl || ''} />
                    <input type='hidden' name='locale' value={params.locale} />
                    <div className='grid grid-cols-2 gap-3'>
                      <label className='grid gap-1 text-xs font-semibold text-slate-600'>
                        Status
                        <select name='targetStatus' defaultValue={target.targetStatus} className='rounded-lg border border-slate-200 px-3 py-2 text-sm'>
                          <option value='active'>active</option>
                          <option value='stale'>stale</option>
                          <option value='blocked'>blocked</option>
                          <option value='retired'>retired</option>
                        </select>
                      </label>
                      <label className='grid gap-1 text-xs font-semibold text-slate-600'>
                        Confidence
                        <input
                          name='confidence'
                          type='number'
                          min='0'
                          max='100'
                          defaultValue={target.confidence}
                          className='rounded-lg border border-slate-200 px-3 py-2 text-sm'
                        />
                      </label>
                    </div>
                    <label className='grid gap-1 text-xs font-semibold text-slate-600'>
                      Next review
                      <input
                        name='nextCheckAt'
                        type='datetime-local'
                        defaultValue={target.nextCheckAt ? new Date(target.nextCheckAt).toISOString().slice(0, 16) : ''}
                        className='rounded-lg border border-slate-200 px-3 py-2 text-sm'
                      />
                    </label>
                    <label className='grid gap-1 text-xs font-semibold text-slate-600'>
                      Notes
                      <textarea
                        name='notes'
                        defaultValue={target.notes || ''}
                        rows={3}
                        className='rounded-lg border border-slate-200 px-3 py-2 text-sm'
                      />
                    </label>
                    <div className='grid grid-cols-2 gap-2 text-xs text-slate-600'>
                      {[
                        ['requiresAccount', 'Account required', target.requiresAccount],
                        ['requiresPayment', 'Payment required', target.requiresPayment],
                        ['requiresCaptcha', 'Captcha required', target.requiresCaptcha],
                        ['requiresBacklink', 'Backlink required', target.requiresBacklink],
                        ['editorialReview', 'Editorial review', target.editorialReview],
                      ].map(([name, label, checked]) => (
                        <label key={String(name)} className='flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2'>
                          <input name={String(name)} type='checkbox' value='1' defaultChecked={Boolean(checked)} />
                          {label}
                        </label>
                      ))}
                    </div>
                    <label className='grid gap-1 text-xs font-semibold text-slate-600'>
                      Expected review days
                      <input
                        name='expectedReviewDays'
                        type='number'
                        min='1'
                        defaultValue={target.expectedReviewDays || ''}
                        className='rounded-lg border border-slate-200 px-3 py-2 text-sm'
                      />
                    </label>
                    <button
                      type='submit'
                      className='inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800'
                    >
                      Save target
                    </button>
                  </form>
                </div>
              </div>

              <div className='mt-4 grid gap-4 lg:grid-cols-3'>
                <div className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
                  <div className='text-xs font-bold uppercase tracking-wide text-slate-500'>Field requirements</div>
                  <ul className='mt-2 space-y-1 text-sm text-slate-700'>
                    {target.requirements.slice(0, 4).map((rule) => (
                      <li key={rule.id}>
                        {rule.requiredField} · {rule.fieldType}
                      </li>
                    ))}
                    {target.requirements.length === 0 ? <li>No structured requirements yet.</li> : null}
                  </ul>
                </div>

                <div className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
                  <div className='text-xs font-bold uppercase tracking-wide text-slate-500'>Snapshot details</div>
                  {target.snapshot ? (
                    <ul className='mt-2 space-y-1 text-sm text-slate-700'>
                      <li>Hash: {target.snapshot.snapshotHash || '—'}</li>
                      <li>
                        Match score: {target.snapshot.matchScore ?? '—'} {target.snapshot.matchGrade ? `(${target.snapshot.matchGrade})` : ''}
                      </li>
                      <li>Obstacle status: {target.snapshot.obstacleStatus}</li>
                      <li>Next review: {formatDate(target.snapshot.nextReviewAt)}</li>
                    </ul>
                  ) : (
                    <p className='mt-2 text-sm text-slate-600'>No snapshot stored yet.</p>
                  )}
                </div>

                <div className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
                  <div className='text-xs font-bold uppercase tracking-wide text-slate-500'>Why this score</div>
                  <ul className='mt-2 space-y-1 text-sm text-slate-700'>
                    {(target.snapshot?.matchReasons || []).slice(0, 4).map((reason, index) => (
                      <li key={`${reason.label}-${index}`} className={reason.kind === 'penalty' ? 'text-rose-700' : 'text-emerald-700'}>
                        {reason.kind === 'penalty' ? '−' : '+'}
                        {Math.abs(reason.impact)} {reason.label}
                      </li>
                    ))}
                    {(target.snapshot?.matchReasons || []).length === 0 ? <li>No score reasons yet.</li> : null}
                  </ul>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className='rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-sm text-slate-500'>
            No targets found for the current filters.
          </div>
        )}
      </section>
    </div>
  );
}
