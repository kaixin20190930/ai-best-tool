import Link from 'next/link';

import AdminClaimsTable from '@/components/admin/AdminClaimsTable';
import type { AdminToolClaim } from '@/app/actions/admin/claims';
import { getAdminToolClaims, getAdminToolClaimsSummary } from '@/app/actions/admin/claims';

function getToneClass(tone: string): string {
  if (tone === 'emerald') return 'text-emerald-700';
  if (tone === 'cyan') return 'text-cyan-700';
  if (tone === 'blue') return 'text-blue-700';
  if (tone === 'rose') return 'text-rose-700';
  if (tone === 'amber') return 'text-amber-700';
  return 'text-slate-900';
}

function buildClaimsHref(status: string, search: string): string {
  const params = new URLSearchParams();
  if (status !== 'all') params.set('status', status);
  if (search) params.set('search', search);
  const query = params.toString();
  return query ? `/admin/claims?${query}` : '/admin/claims';
}

function isOlderThanHours(value: string | null, hours: number) {
  if (!value) return false;

  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return false;

  return Date.now() - timestamp >= hours * 60 * 60 * 1000;
}

function getClaimPriorityScore(claim: AdminToolClaim): number {
  let score = 0;

  if (claim.status === 'new') score += 40;
  if (claim.status === 'contacted') score += 20;
  if (claim.status === 'new' && isOlderThanHours(claim.createdAt, 48)) score += 40;
  if (!claim.toolId) score += 15;
  if ((claim.sourcePath || '').includes('/pricing')) score += 15;
  if ((claim.sourcePath || '').includes('/submit')) score += 10;
  if (claim.note) score += 5;

  return score;
}

function getPriorityReason(claim: AdminToolClaim): string {
  if (claim.status === 'new' && isOlderThanHours(claim.createdAt, 48)) {
    return 'New lead overdue for more than 48 hours.';
  }
  if (claim.status === 'new' && !claim.toolId) {
    return 'New lead still needs the matching tool to be confirmed.';
  }
  if ((claim.sourcePath || '').includes('/pricing')) {
    return 'Lead came from pricing, so commercial intent is likely stronger.';
  }
  if ((claim.sourcePath || '').includes('/submit')) {
    return 'Lead came from submit, so the user may be choosing between claim and new submission.';
  }
  if (claim.status === 'contacted') {
    return 'Already contacted, worth closing the loop quickly.';
  }

  return 'Worth reviewing soon to keep the queue moving.';
}

function getSourceLabel(sourcePath: string | null): string {
  if (!sourcePath) return 'Unknown';
  if (sourcePath.includes('/pricing')) return 'Pricing';
  if (sourcePath.includes('/submit')) return 'Submit';
  if (sourcePath.includes('/developer/listing')) return 'Claim listing';
  if (sourcePath === '/') return 'Home';
  return sourcePath;
}

function getSourceAction(sourcePath: string | null): string {
  if (!sourcePath) return 'Inspect the lead manually and confirm where users are entering from.';
  if (sourcePath.includes('/pricing'))
    return 'These leads likely have paid intent, so respond quickly and route toward claim resolution.';
  if (sourcePath.includes('/submit'))
    return 'Clarify whether the user should claim an existing listing or create a new one.';
  if (sourcePath.includes('/developer/listing'))
    return 'Keep this path focused on owner confirmation and fast follow-up.';
  return 'Watch whether this source keeps producing qualified owner requests.';
}

type ClaimSourceAggregate = {
  sourcePath: string | null;
  total: number;
  newCount: number;
  overdueNewCount: number;
  claimedCount: number;
};

export default async function AdminClaimsPage({
  searchParams,
}: {
  searchParams?: {
    status?: string;
    search?: string;
  };
}) {
  const status =
    searchParams?.status === 'new' ||
    searchParams?.status === 'contacted' ||
    searchParams?.status === 'claimed' ||
    searchParams?.status === 'invalid'
      ? searchParams.status
      : 'all';
  const search = searchParams?.search?.trim() || '';
  const summary = await getAdminToolClaimsSummary();
  const { claims } = await getAdminToolClaims({
    status,
    search,
    limit: 100,
  });
  const priorityClaims = [...claims].sort((a, b) => getClaimPriorityScore(b) - getClaimPriorityScore(a)).slice(0, 6);
  const sourceMap = new Map<string, ClaimSourceAggregate>();

  claims.forEach((claim) => {
    const key = claim.sourcePath || 'unknown';
    const current = sourceMap.get(key) || {
      sourcePath: claim.sourcePath,
      total: 0,
      newCount: 0,
      overdueNewCount: 0,
      claimedCount: 0,
    };

    current.total += 1;
    if (claim.status === 'new') current.newCount += 1;
    if (claim.status === 'new' && isOlderThanHours(claim.createdAt, 48)) current.overdueNewCount += 1;
    if (claim.status === 'claimed') current.claimedCount += 1;
    sourceMap.set(key, current);
  });

  const topSources = Array.from(sourceMap.values())
    .sort((a, b) => b.total - a.total || b.newCount - a.newCount || b.overdueNewCount - a.overdueNewCount)
    .slice(0, 6);

  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div>
          <h1 className='text-3xl font-bold text-slate-900'>Claim Leads</h1>
          <p className='mt-2 max-w-2xl text-slate-600'>
            Track owner requests, move leads through the queue, and link confirmed owners back to tools.
          </p>
        </div>
        <Link
          href='/admin/claims'
          className='inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50'
        >
          Refresh
        </Link>
      </div>

      <form
        action='/admin/claims'
        className='flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'
      >
        <input type='hidden' name='status' value={status === 'all' ? '' : status} />
        <input
          type='text'
          name='search'
          defaultValue={search}
          placeholder='Search listing, email, company, website, source path...'
          className='h-11 min-w-[280px] flex-1 rounded-lg border border-slate-300 px-4 text-sm text-slate-900'
        />
        <button
          type='submit'
          className='inline-flex h-11 items-center justify-center rounded-lg bg-cyan-700 px-4 text-sm font-semibold text-white hover:bg-cyan-800'
        >
          Search
        </button>
        {search && (
          <Link
            href={buildClaimsHref(status, '')}
            className='inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50'
          >
            Clear
          </Link>
        )}
      </form>

      <div className='grid gap-4 md:grid-cols-3 xl:grid-cols-6'>
        {[
          { label: 'All leads', value: summary.total, tone: 'slate' },
          { label: 'New', value: summary.newCount, tone: 'cyan' },
          { label: 'Fresh new', value: summary.freshNewCount, tone: 'blue' },
          { label: 'Overdue new', value: summary.overdueNewCount, tone: 'rose' },
          { label: 'Contacted', value: summary.contactedCount, tone: 'blue' },
          { label: 'Claimed', value: summary.claimedCount, tone: 'emerald' },
          { label: 'Invalid', value: summary.invalidCount, tone: 'rose' },
          { label: 'Linked', value: summary.linkedCount, tone: 'amber' },
        ].map((item) => (
          <div key={item.label} className='theme-surface rounded-2xl border border-slate-200 p-4 shadow-sm'>
            <p className='text-sm font-medium text-slate-600'>{item.label}</p>
            <p className={`mt-2 text-3xl font-semibold ${getToneClass(item.tone)}`}>{item.value}</p>
          </div>
        ))}
      </div>

      <div className='grid gap-6 xl:grid-cols-[1.1fr_0.9fr]'>
        <section className='theme-surface rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
          <div className='flex items-center justify-between gap-3'>
            <div>
              <h2 className='text-base font-semibold text-slate-950'>Priority Follow-up</h2>
              <p className='mt-1 text-sm text-slate-600'>
                The claims most worth touching next, based on freshness, backlog risk, and commercial intent.
              </p>
            </div>
          </div>
          <div className='mt-4 space-y-3'>
            {priorityClaims.length > 0 ? (
              priorityClaims.map((claim) =>
                (() => {
                  let tone = 'cyan';
                  if (claim.status === 'claimed') {
                    tone = 'emerald';
                  } else if (claim.status === 'contacted') {
                    tone = 'blue';
                  } else if (claim.status === 'invalid') {
                    tone = 'rose';
                  }

                  return (
                    <div key={claim.id} className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
                      <div className='flex flex-wrap items-start justify-between gap-3'>
                        <div>
                          <p className='text-sm font-semibold text-slate-950'>{claim.listingName}</p>
                          <p className='mt-1 text-xs text-slate-500'>
                            {claim.email}
                            {claim.company ? ` · ${claim.company}` : ''}
                          </p>
                        </div>
                        <span
                          className={`inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold ${getToneClass(tone)}`}
                        >
                          {claim.status}
                        </span>
                      </div>
                      <p className='mt-3 text-sm leading-6 text-slate-600'>{getPriorityReason(claim)}</p>
                      <div className='mt-3 flex flex-wrap gap-3 text-xs text-slate-500'>
                        <span>Source: {getSourceLabel(claim.sourcePath)}</span>
                        <span>Created: {new Date(claim.createdAt).toLocaleDateString()}</span>
                        <span>{claim.toolId ? 'Linked tool ready' : 'Tool still unlinked'}</span>
                      </div>
                    </div>
                  );
                })(),
              )
            ) : (
              <div className='rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500'>
                No claims in the queue right now.
              </div>
            )}
          </div>
        </section>

        <section className='theme-surface rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
          <h2 className='text-base font-semibold text-slate-950'>Top Source Pages</h2>
          <p className='mt-1 text-sm text-slate-600'>
            Where claim leads are entering from, so we can see which paths deserve faster follow-up or cleaner routing.
          </p>
          <div className='mt-4 space-y-3'>
            {topSources.length > 0 ? (
              topSources.map((source) => (
                <div
                  key={source.sourcePath || 'unknown'}
                  className='rounded-xl border border-slate-200 bg-slate-50 p-4'
                >
                  <div className='flex items-start justify-between gap-3'>
                    <div>
                      <p className='text-sm font-semibold text-slate-950'>{getSourceLabel(source.sourcePath)}</p>
                      <p className='mt-1 text-xs text-slate-500'>{source.sourcePath || 'unknown'}</p>
                    </div>
                    <p className='text-sm font-semibold text-slate-900'>{source.total} leads</p>
                  </div>
                  <div className='mt-3 flex flex-wrap gap-3 text-xs text-slate-500'>
                    <span>{source.newCount} new</span>
                    <span>{source.overdueNewCount} overdue</span>
                    <span>{source.claimedCount} claimed</span>
                  </div>
                  <p className='mt-3 text-sm leading-6 text-slate-600'>{getSourceAction(source.sourcePath)}</p>
                </div>
              ))
            ) : (
              <div className='rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500'>
                No source data yet.
              </div>
            )}
          </div>
        </section>
      </div>

      <div className='flex flex-wrap gap-2'>
        {[
          { key: 'all', label: 'All' },
          { key: 'new', label: 'New' },
          { key: 'contacted', label: 'Contacted' },
          { key: 'claimed', label: 'Claimed' },
          { key: 'invalid', label: 'Invalid' },
        ].map((item) => (
          <Link
            key={item.key}
            href={buildClaimsHref(item.key, search)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              status === item.key ? 'bg-cyan-700 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <AdminClaimsTable claims={claims} />
    </div>
  );
}
