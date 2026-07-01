import Link from 'next/link';
import { toast } from 'sonner';

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

function buildClaimsHrefWithReason(status: string, search: string, reason: string): string {
  const params = new URLSearchParams();
  if (status !== 'all') params.set('status', status);
  if (search) params.set('search', search);
  if (reason !== 'all') params.set('reason', reason);
  const query = params.toString();
  return query ? `/admin/claims?${query}` : '/admin/claims';
}

function isOlderThanHours(value: string | null, hours: number) {
  if (!value) return false;

  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return false;

  return Date.now() - timestamp >= hours * 60 * 60 * 1000;
}

function isOverdueNewClaim(claim: AdminToolClaim): boolean {
  return claim.status === 'new' && isOlderThanHours(claim.createdAt, 48);
}

function getClaimPriorityScore(claim: AdminToolClaim): number {
  let score = 0;

  if (claim.status === 'new') score += 40;
  if (claim.status === 'contacted') score += 20;
  if (claim.status === 'new' && isOlderThanHours(claim.createdAt, 48)) score += 40;
  if (!claim.toolId) score += 15;
  if ((claim.sourcePath || '').includes('/pricing')) score += 15;
  if ((claim.sourcePath || '').includes('/submit')) score += 10;
  if (claim.claimReason === 'ownership_update') score += 20;
  if (claim.claimReason === 'agency_client') score += 12;
  if (claim.claimReason === 'duplicate_merge') score += 8;
  if (claim.note) score += 5;

  return score;
}

function getPriorityReason(claim: AdminToolClaim): string {
  if (claim.status === 'new' && isOlderThanHours(claim.createdAt, 48)) {
    return 'New lead overdue for more than 48 hours.';
  }
  if (claim.claimReason === 'ownership_update') {
    return 'Owner update request. Treat as a high-confidence claim lead.';
  }
  if (claim.claimReason === 'agency_client') {
    return 'Agency or client handoff. Often worth fast follow-up.';
  }
  if (claim.claimReason === 'duplicate_merge') {
    return 'Duplicate merge request. Useful to resolve quickly and reduce clutter.';
  }
  if (claim.claimReason === 'profile_correction') {
    return 'Profile correction request. Confirm details, then close the loop.';
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

function getClaimPlaybook(status: string, reason: string): string[] {
  if (status === 'overdue_new') {
    return [
      'Open the overdue lead first and check whether the owner email is already known.',
      'Copy or send the follow-up draft before touching lower-priority items.',
      'After sending, update the claim status so the queue stays trustworthy.',
    ];
  }

  if (reason === 'ownership_update') {
    return [
      'Treat this as a high-confidence owner lead and move it to the top.',
      'Confirm the linked tool, then send the follow-up draft or mailto.',
      'Mark the result immediately so the claim funnel stays clean.',
    ];
  }

  if (reason === 'agency_client') {
    return [
      'Check whether this is a client handoff or agency-managed listing.',
      'Use the company name and website to confirm the right owner contact.',
      'Close the loop fast so agency leads do not linger in the queue.',
    ];
  }

  if (reason === 'duplicate_merge') {
    return [
      'Confirm whether the duplicate should map to an existing listing.',
      'Resolve the tool link and clean up any duplicate metadata.',
      'Mark the claim as handled once the mapping is stable.',
    ];
  }

  if (reason === 'profile_correction') {
    return [
      'Treat this as a data correction request, not a commercial lead.',
      'Verify the profile details before responding to the owner.',
      'Keep the note short and move the record out of the hot queue once fixed.',
    ];
  }

  return [
    'Start with the newest unclaimed or contacted leads in the current filter.',
    'Use source path and reason to decide whether this is a fast follow-up or a cleanup task.',
    'Update the status as soon as you finish to keep the queue current.',
  ];
}

type ClaimSourceAggregate = {
  sourcePath: string | null;
  total: number;
  newCount: number;
  overdueNewCount: number;
  claimedCount: number;
};

type ClaimReasonAggregate = {
  claimReason: string | null;
  total: number;
  newCount: number;
  contactedCount: number;
  claimedCount: number;
  invalidCount: number;
  overdueNewCount: number;
};

function getClaimReasonLabel(reason: string | null): string {
  if (!reason) return 'Unknown';
  if (reason === 'ownership_update') return 'Ownership update';
  if (reason === 'profile_correction') return 'Profile correction';
  if (reason === 'duplicate_merge') return 'Duplicate merge';
  if (reason === 'agency_client') return 'Agency / client';
  if (reason === 'other') return 'Other';
  return reason;
}

function getClaimReasonTone(reason: string | null): string {
  if (reason === 'ownership_update') return 'bg-emerald-100 text-emerald-700';
  if (reason === 'profile_correction') return 'bg-cyan-100 text-cyan-700';
  if (reason === 'duplicate_merge') return 'bg-amber-100 text-amber-700';
  if (reason === 'agency_client') return 'bg-violet-100 text-violet-700';
  if (reason === 'other') return 'bg-slate-100 text-slate-700';
  return 'bg-slate-100 text-slate-600';
}

function buildClaimFollowUpText(claim: AdminToolClaim): string {
  const title = claim.listingName || 'Unnamed listing';
  return [
    `Follow up: ${title}`,
    `Email: ${claim.email}`,
    `Company: ${claim.company || '-'}`,
    `Website: ${claim.website || '-'}`,
    `Reason: ${getClaimReasonLabel(claim.claimReason)}`,
    `Source: ${claim.sourcePath || '-'}`,
    '',
    `Hi ${claim.company || title},`,
    `We reviewed your claim request for ${title}.`,
    'If you need to update ownership or listing details, please reply here and we will continue from there.',
  ].join('\n');
}

function buildClaimMailto(claim: AdminToolClaim): string {
  const title = claim.listingName || 'Unnamed listing';
  const subject = encodeURIComponent(`[AI Best Tool] Follow-up on ${title}`);
  const body = encodeURIComponent(buildClaimFollowUpText(claim));

  return `mailto:${encodeURIComponent(claim.email)}?subject=${subject}&body=${body}`;
}

export default async function AdminClaimsPage({
  searchParams,
  params,
}: {
  searchParams?: {
    status?: string;
    search?: string;
    reason?: string;
  };
  params: { locale: string };
}) {
  const { locale } = params;
  const status =
    searchParams?.status === 'new' ||
    searchParams?.status === 'overdue_new' ||
    searchParams?.status === 'contacted' ||
    searchParams?.status === 'claimed' ||
    searchParams?.status === 'invalid'
      ? searchParams.status
      : 'all';
  const search = searchParams?.search?.trim() || '';
  const reason =
    searchParams?.reason === 'ownership_update' ||
    searchParams?.reason === 'profile_correction' ||
    searchParams?.reason === 'duplicate_merge' ||
    searchParams?.reason === 'agency_client' ||
    searchParams?.reason === 'other'
      ? searchParams.reason
      : 'all';
  let summary = {
    total: 0,
    newCount: 0,
    contactedCount: 0,
    claimedCount: 0,
    invalidCount: 0,
    overdueNewCount: 0,
    freshNewCount: 0,
    linkedCount: 0,
  };
  let claims: AdminToolClaim[] = [];
  let loadError: string | null = null;

  try {
    summary = await getAdminToolClaimsSummary();
    const queryStatus = status === 'overdue_new' ? 'all' : status;
    const result = await getAdminToolClaims({
      status: queryStatus,
      search,
      reason,
      limit: 100,
    });
    claims = result.claims;
  } catch (error) {
    loadError = error instanceof Error ? error.message : 'Failed to load claims queue.';
  }

  const claimsForView = status === 'overdue_new' ? claims.filter(isOverdueNewClaim) : claims;
  const priorityClaims = [...claimsForView]
    .sort((a, b) => getClaimPriorityScore(b) - getClaimPriorityScore(a))
    .slice(0, 6);
  const sourceMap = new Map<string, ClaimSourceAggregate>();
  const reasonMap = new Map<string, ClaimReasonAggregate>();

  claimsForView.forEach((claim) => {
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

    const reasonKey = claim.claimReason || 'unknown';
    const reasonCurrent = reasonMap.get(reasonKey) || {
      claimReason: claim.claimReason,
      total: 0,
      newCount: 0,
      contactedCount: 0,
      claimedCount: 0,
      invalidCount: 0,
      overdueNewCount: 0,
    };
    reasonCurrent.total += 1;
    if (claim.status === 'new') reasonCurrent.newCount += 1;
    if (claim.status === 'new' && isOlderThanHours(claim.createdAt, 48)) reasonCurrent.overdueNewCount += 1;
    if (claim.status === 'contacted') reasonCurrent.contactedCount += 1;
    if (claim.status === 'claimed') reasonCurrent.claimedCount += 1;
    if (claim.status === 'invalid') reasonCurrent.invalidCount += 1;
    reasonMap.set(reasonKey, reasonCurrent);
  });

  const topSources = Array.from(sourceMap.values())
    .sort((a, b) => b.total - a.total || b.newCount - a.newCount || b.overdueNewCount - a.overdueNewCount)
    .slice(0, 6);
  const topReasons = Array.from(reasonMap.values())
    .sort((a, b) => b.total - a.total || b.newCount - a.newCount)
    .slice(0, 6);
  const claimRate = summary.total > 0 ? Math.round((summary.claimedCount / summary.total) * 100) : 0;
  const activeQueue = summary.newCount + summary.contactedCount;
  const overdueRate = summary.newCount > 0 ? Math.round((summary.overdueNewCount / summary.newCount) * 100) : 0;
  const nextClaim = priorityClaims[0] || null;
  const claimPlaybook = getClaimPlaybook(status, reason);

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

      {loadError && (
        <div className='rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900'>
          Claims data could not load completely: {loadError}
        </div>
      )}

      <form
        action={`/${locale}/admin/claims`}
        method='get'
        className='flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'
      >
        <input type='hidden' name='status' value={status === 'all' ? '' : status} />
        <input type='hidden' name='reason' value={reason === 'all' ? '' : reason} />
        <input
          type='text'
          name='search'
          defaultValue={search}
          placeholder='Search listing, email, company, website, source path...'
          className='h-11 min-w-[280px] flex-1 rounded-lg border border-slate-300 px-4 text-sm text-slate-900'
        />
        <button
          type='submit'
          className='inline-flex h-11 items-center justify-center rounded-lg border border-cyan-200 bg-cyan-50 px-4 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
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

      <section className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
        <div className='flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between'>
          <div>
            <h2 className='text-base font-semibold text-slate-950'>Claim funnel</h2>
            <p className='mt-1 text-sm text-slate-600'>
              A quick read on how many leads are entering, moving, and getting resolved.
            </p>
          </div>
          <div className='flex flex-wrap gap-2 text-xs font-medium text-slate-500'>
            <span className='rounded-full bg-slate-100 px-2.5 py-1'>{activeQueue} active queue</span>
            <span className='rounded-full bg-slate-100 px-2.5 py-1'>{claimRate}% claimed rate</span>
            <span className='rounded-full bg-slate-100 px-2.5 py-1'>{overdueRate}% overdue new</span>
          </div>
        </div>
        <div className='mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
          {[
            {
              label: 'New leads',
              value: summary.newCount,
              note: `${summary.freshNewCount} fresh, ${summary.overdueNewCount} overdue`,
              tone: 'cyan',
            },
            {
              label: 'In progress',
              value: summary.contactedCount,
              note: 'Already touched but not closed',
              tone: 'blue',
            },
            {
              label: 'Resolved',
              value: summary.claimedCount,
              note: `${claimRate}% of all leads are claimed`,
              tone: 'emerald',
            },
            {
              label: 'Needs cleanup',
              value: summary.invalidCount,
              note: 'Rejected or not usable right now',
              tone: 'rose',
            },
          ].map((item) => (
            <div key={item.label} className='rounded-2xl border border-slate-200 bg-slate-50 p-4'>
              <p className='text-sm font-medium text-slate-600'>{item.label}</p>
              <p className={`mt-2 text-3xl font-semibold ${getToneClass(item.tone)}`}>{item.value}</p>
              <p className='mt-2 text-sm leading-6 text-slate-500'>{item.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className='rounded-2xl border border-cyan-100 bg-cyan-50 p-5 shadow-sm'>
        <div className='flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between'>
          <div>
            <h2 className='text-base font-semibold text-slate-950'>Today&apos;s claim playbook</h2>
            <p className='mt-1 text-sm text-slate-600'>
              Use the current filter as a short action plan so the queue turns into follow-up, not just a dashboard.
            </p>
          </div>
          <Link
            href={buildClaimsHref(status, search)}
            className='inline-flex items-center justify-center rounded-lg border border-cyan-200 bg-white px-3 py-1.5 text-xs font-semibold text-cyan-800 hover:bg-cyan-100'
          >
            Jump to table
          </Link>
        </div>
        <div className='mt-4 grid gap-3 md:grid-cols-3'>
          {claimPlaybook.map((step, index) => (
            <div key={step} className='rounded-xl border border-white bg-white p-4 shadow-sm'>
              <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>Step {index + 1}</p>
              <p className='mt-2 text-sm leading-6 text-slate-700'>{step}</p>
            </div>
          ))}
        </div>
      </section>

      <div className='grid gap-4 md:grid-cols-3 xl:grid-cols-4'>
        {[
          { label: 'All leads', value: summary.total, tone: 'slate' },
          { label: 'Linked', value: summary.linkedCount, tone: 'amber' },
          { label: 'Fresh new', value: summary.freshNewCount, tone: 'blue' },
          { label: 'Overdue new', value: summary.overdueNewCount, tone: 'rose' },
        ].map((item) => (
          <div key={item.label} className='theme-surface rounded-2xl border border-slate-200 p-4 shadow-sm'>
            <p className='text-sm font-medium text-slate-600'>{item.label}</p>
            <p className={`mt-2 text-3xl font-semibold ${getToneClass(item.tone)}`}>{item.value}</p>
          </div>
        ))}
      </div>

      {summary.overdueNewCount > 0 && (
        <section className='rounded-2xl border border-rose-200 bg-rose-50 p-5 shadow-sm'>
          <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
            <div className='max-w-3xl'>
              <p className='text-sm font-semibold uppercase tracking-wide text-rose-700'>Urgent follow-up</p>
              <h2 className='mt-2 text-2xl font-bold text-slate-950'>
                {summary.overdueNewCount} new claim lead{summary.overdueNewCount === 1 ? '' : 's'} are overdue
              </h2>
              <p className='mt-2 text-sm leading-6 text-rose-900/80'>
                New owner requests older than 48 hours should be handled first so the queue does not stall.
              </p>
            </div>
            <div className='flex flex-wrap gap-3'>
              <Link
                href={buildClaimsHref('overdue_new', search)}
                className='inline-flex items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-800 hover:bg-rose-100'
              >
                Open overdue new
              </Link>
              <Link
                href={buildClaimsHref('all', search)}
                className='inline-flex items-center justify-center rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-800 hover:bg-rose-100'
              >
                Review all claims
              </Link>
            </div>
          </div>
        </section>
      )}

      {nextClaim && (
        <section className='rounded-2xl border border-cyan-200 bg-cyan-50 p-5 shadow-sm'>
          <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
            <div className='max-w-3xl'>
              <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>Next follow-up</p>
              <h2 className='mt-2 text-2xl font-bold text-slate-950'>{nextClaim.listingName}</h2>
              <p className='mt-2 text-sm leading-6 text-cyan-900/80'>{getPriorityReason(nextClaim)}</p>
              <p className='mt-2 text-sm text-cyan-900/80'>
                {nextClaim.email}
                {nextClaim.company ? ` · ${nextClaim.company}` : ''}
                {nextClaim.toolId ? ` · linked to ${nextClaim.toolName || 'a tool'}` : ' · no linked tool yet'}
              </p>
            </div>
            <div className='flex flex-wrap gap-3'>
              <Link
                href={buildClaimsHref(nextClaim.status, search)}
                className='inline-flex items-center justify-center rounded-lg border border-cyan-200 bg-white px-4 py-2 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
              >
                Open current filter
              </Link>
              <button
                type='button'
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(buildClaimFollowUpText(nextClaim));
                    toast.success(`Copied follow-up draft for ${nextClaim.listingName}.`);
                  } catch {
                    toast.error('Failed to copy follow-up draft.');
                  }
                }}
                className='inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50'
              >
                Copy draft
              </button>
              <a
                href={buildClaimMailto(nextClaim)}
                className='inline-flex items-center justify-center rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
              >
                Email draft
              </a>
              {nextClaim.toolId ? (
                <Link
                  href={`/admin/tools/${nextClaim.toolId}/edit`}
                  className='inline-flex items-center justify-center rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
                >
                  Open linked tool
                </Link>
              ) : null}
            </div>
          </div>
        </section>
      )}

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
                          <p className='mt-1 text-xs font-medium text-cyan-700'>
                            {claim.claimReason || 'No reason recorded'}
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
          <div className='space-y-6'>
            <div>
              <h2 className='text-base font-semibold text-slate-950'>Top Claim Reasons</h2>
              <p className='mt-1 text-sm text-slate-600'>
                Why people are claiming listings, so the queue can focus on the highest-confidence owner leads first.
              </p>
              <div className='mt-4 space-y-3'>
                {topReasons.length > 0 ? (
                  topReasons.map((reasonItem) => (
                    <div
                      key={reasonItem.claimReason || 'unknown'}
                      className='rounded-xl border border-slate-200 bg-slate-50 p-4'
                    >
                      <div className='flex items-start justify-between gap-3'>
                        <div>
                          <div className='flex flex-wrap items-center gap-2'>
                            <p className='text-sm font-semibold text-slate-950'>
                              {getClaimReasonLabel(reasonItem.claimReason)}
                            </p>
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${getClaimReasonTone(reasonItem.claimReason)}`}
                            >
                              {reasonItem.claimReason || 'unknown'}
                            </span>
                          </div>
                          <p className='mt-1 text-xs text-slate-500'>
                            {reasonItem.total} total leads, {reasonItem.overdueNewCount} overdue
                          </p>
                        </div>
                        <p className='text-sm font-semibold text-slate-900'>{reasonItem.total} leads</p>
                      </div>
                      <div className='mt-3 flex flex-wrap gap-2 text-xs font-medium text-slate-500'>
                        <span className='rounded-full bg-white px-2.5 py-1'>{reasonItem.newCount} new</span>
                        <span className='rounded-full bg-white px-2.5 py-1'>{reasonItem.contactedCount} contacted</span>
                        <span className='rounded-full bg-white px-2.5 py-1'>{reasonItem.claimedCount} claimed</span>
                        <span className='rounded-full bg-white px-2.5 py-1'>{reasonItem.invalidCount} invalid</span>
                      </div>
                      {reasonItem.claimReason && (
                        <div className='mt-3'>
                          <Link
                            href={buildClaimsHrefWithReason(status, search, reasonItem.claimReason)}
                            className='inline-flex rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-800 hover:bg-cyan-100'
                          >
                            View this reason
                          </Link>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className='rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500'>
                    No reason data yet.
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className='text-base font-semibold text-slate-950'>Top Source Pages</h2>
              <p className='mt-1 text-sm text-slate-600'>
                Where claim leads are entering from, so we can see which paths deserve faster follow-up or cleaner
                routing.
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
            </div>
          </div>
        </section>
      </div>

      <div className='flex flex-wrap gap-2'>
        {[
          { key: 'all', label: 'All' },
          { key: 'new', label: 'New' },
          { key: 'overdue_new', label: 'Overdue new' },
          { key: 'contacted', label: 'Contacted' },
          { key: 'claimed', label: 'Claimed' },
          { key: 'invalid', label: 'Invalid' },
        ].map((item) => (
          <Link
            key={item.key}
            href={buildClaimsHref(item.key, search)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              status === item.key
                ? 'border border-cyan-200 bg-cyan-50 text-cyan-800'
                : 'border border-slate-200 bg-slate-50 text-slate-700'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className='flex flex-wrap gap-2'>
        {[
          { key: 'all', label: 'All reasons' },
          { key: 'ownership_update', label: 'Ownership update' },
          { key: 'profile_correction', label: 'Profile correction' },
          { key: 'duplicate_merge', label: 'Duplicate merge' },
          { key: 'agency_client', label: 'Agency / client' },
          { key: 'other', label: 'Other' },
        ].map((item) => (
          <Link
            key={item.key}
            href={buildClaimsHrefWithReason(status, search, item.key)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              reason === item.key
                ? 'border border-cyan-200 bg-cyan-50 text-cyan-800'
                : 'border border-slate-200 bg-slate-50 text-slate-700'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div id='claim-table'>
        <AdminClaimsTable claims={claimsForView} />
      </div>
    </div>
  );
}
