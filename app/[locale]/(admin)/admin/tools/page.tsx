import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import AdminToolsFilters from '@/components/admin/AdminToolsFilters';
import AdminToolsTable from '@/components/admin/AdminToolsTable';
import { getAdminTools, getPaidListingBlockerSummary, getToolsStats } from '@/app/actions/admin/tools';

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'admin' });

  return {
    title: t('tools.title'),
  };
}

export default async function AdminToolsPage({
  searchParams,
}: {
  searchParams: {
    status?: string;
    claimStatus?: string;
    search?: string;
    collected?: string;
    needsMedia?: string;
    needsDecision?: string;
    quality?: string;
    ready?: string;
    overdue?: string;
    followedUp?: string;
    staleFollowUp?: string;
    paidIntent?: string;
    featuredIntent?: string;
    paidBlockers?: string;
    page?: string;
  };
}) {
  const page = Math.max(Number.parseInt(searchParams.page || '1', 10) || 1, 1);
  const { status } = searchParams;
  const claimStatus =
    searchParams.claimStatus && ['claimed', 'pending', 'rejected', 'unclaimed'].includes(searchParams.claimStatus)
      ? searchParams.claimStatus
      : undefined;
  const { search } = searchParams;
  const collected = searchParams.collected === '1';
  const needsMedia = searchParams.needsMedia === '1';
  const needsDecision = searchParams.needsDecision === '1';
  const ready = searchParams.ready === '1';
  const overdue = searchParams.overdue === '1';
  let followedUp: boolean | undefined;
  if (searchParams.followedUp === '1') {
    followedUp = true;
  } else if (searchParams.followedUp === '0') {
    followedUp = false;
  }
  const staleFollowUp = searchParams.staleFollowUp === '1';
  const paidIntent = searchParams.paidIntent === '1';
  const featuredIntent = searchParams.featuredIntent === '1';
  const paidBlockers = searchParams.paidBlockers === '1';
  let currentFollowedUp: string | undefined;
  if (followedUp === true) {
    currentFollowedUp = '1';
  } else if (followedUp === false) {
    currentFollowedUp = '0';
  }
  let quality: string | undefined;
  if (searchParams.quality === 'low' || searchParams.quality === 'medium' || searchParams.quality === 'high') {
    quality = searchParams.quality;
  }

  let tools: Awaited<ReturnType<typeof getAdminTools>>['tools'] = [];
  let total = 0;
  let stats: Awaited<ReturnType<typeof getToolsStats>> = {
    total: 0,
    published: 0,
    pending: 0,
    rejected: 0,
    draft: 0,
    claimed: 0,
    claimPending: 0,
    claimRejected: 0,
    claimUnclaimed: 0,
  };
  let paidBlockerSummary: Awaited<ReturnType<typeof getPaidListingBlockerSummary>> = {
    totalBlocked: 0,
    blockerCounts: [],
    items: [],
  };
  let loadError: string | null = null;

  try {
    const [toolResult, statsResult, blockerResult] = await Promise.all([
      getAdminTools({
        status,
        claimStatus,
        search,
        collected,
        needsMedia,
        needsDecision,
        quality,
        ready,
        overdue,
        followedUp,
        staleFollowUp,
        paidIntent,
        featuredIntent,
        paidBlockers,
        page,
        pageSize: 20,
      }),
      getToolsStats(),
      getPaidListingBlockerSummary(8),
    ]);

    tools = toolResult.tools;
    total = toolResult.total;
    stats = statsResult;
    paidBlockerSummary = blockerResult;
  } catch (error) {
    loadError = error instanceof Error ? error.message : 'Failed to load admin tools.';
  }

  return (
    <div>
      <div className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-slate-900'>Tool Management</h1>
          <p className='mt-2 text-slate-600'>Review, approve, and manage tool submissions</p>
        </div>
        <Link
          href='/admin/tools?status=pending'
          className='inline-flex items-center justify-center rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100'
        >
          Review pending ({stats.pending})
        </Link>
      </div>

      {/* Stats Cards */}
      {loadError && (
        <div className='theme-surface mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800'>
          Admin tools could not be loaded: {loadError}
        </div>
      )}
      <div className='mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-7'>
        <div className='theme-surface rounded-lg border border-slate-200 p-4 shadow-sm'>
          <p className='text-sm font-medium text-slate-600'>Total</p>
          <p className='mt-2 text-2xl font-semibold text-slate-900'>{stats.total}</p>
        </div>
        <div className='theme-surface rounded-lg border border-slate-200 p-4 shadow-sm'>
          <p className='text-sm font-medium text-slate-600'>Published</p>
          <p className='mt-2 text-2xl font-semibold text-emerald-600'>{stats.published}</p>
        </div>
        <div className='theme-surface rounded-lg border border-slate-200 p-4 shadow-sm'>
          <p className='text-sm font-medium text-slate-600'>Pending</p>
          <p className='mt-2 text-2xl font-semibold text-amber-600'>{stats.pending}</p>
        </div>
        <div className='theme-surface rounded-lg border border-slate-200 p-4 shadow-sm'>
          <p className='text-sm font-medium text-slate-600'>Rejected</p>
          <p className='mt-2 text-2xl font-semibold text-red-600'>{stats.rejected}</p>
        </div>
        <div className='theme-surface rounded-lg border border-slate-200 p-4 shadow-sm'>
          <p className='text-sm font-medium text-slate-600'>Draft</p>
          <p className='mt-2 text-2xl font-semibold text-slate-600'>{stats.draft}</p>
        </div>
        <div className='theme-surface rounded-lg border border-slate-200 p-4 shadow-sm'>
          <p className='text-sm font-medium text-slate-600'>Claimed</p>
          <p className='mt-2 text-2xl font-semibold text-cyan-700'>{stats.claimed}</p>
          <p className='mt-2 text-xs text-slate-500'>Tools already connected to an owner flow.</p>
        </div>
        <div className='theme-surface rounded-lg border border-slate-200 p-4 shadow-sm'>
          <p className='text-sm font-medium text-slate-600'>Paid blockers</p>
          <p className='mt-2 text-2xl font-semibold text-rose-600'>{paidBlockerSummary.totalBlocked}</p>
          <p className='mt-2 text-xs text-slate-500'>
            {paidBlockerSummary.blockerCounts.length > 0
              ? `${paidBlockerSummary.blockerCounts[0].label} is the top missing field.`
              : 'No blocker backlog right now.'}
          </p>
        </div>
      </div>

      <div className='mb-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-3'>
        <div className='theme-surface rounded-lg border border-slate-200 p-4 shadow-sm'>
          <p className='text-sm font-medium text-slate-600'>Unclaimed</p>
          <p className='mt-2 text-2xl font-semibold text-slate-900'>{stats.claimUnclaimed}</p>
          <p className='mt-2 text-xs text-slate-500'>No owner details are linked yet.</p>
        </div>
        <div className='theme-surface rounded-lg border border-slate-200 p-4 shadow-sm'>
          <p className='text-sm font-medium text-slate-600'>Claim pending</p>
          <p className='mt-2 text-2xl font-semibold text-amber-600'>{stats.claimPending}</p>
          <p className='mt-2 text-xs text-slate-500'>Waiting for manual confirmation or follow-up.</p>
        </div>
        <div className='theme-surface rounded-lg border border-slate-200 p-4 shadow-sm'>
          <p className='text-sm font-medium text-slate-600'>Claim rejected</p>
          <p className='mt-2 text-2xl font-semibold text-rose-600'>{stats.claimRejected}</p>
          <p className='mt-2 text-xs text-slate-500'>Rejected claims still need cleanup or follow-up.</p>
        </div>
      </div>

      {paidBlockerSummary.blockerCounts.length > 0 && (
        <div className='mb-6 rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-800'>
          Most common paid blockers:{' '}
          {paidBlockerSummary.blockerCounts.map((item) => `${item.label} (${item.count})`).join(' · ')}
        </div>
      )}

      {/* Filters */}
      <AdminToolsFilters
        currentStatus={status}
        currentClaimStatus={claimStatus}
        currentSearch={search}
        currentCollected={collected}
        currentNeedsMedia={needsMedia}
        currentNeedsDecision={needsDecision}
        currentQuality={quality}
        currentReady={ready}
        currentOverdue={overdue}
        currentFollowedUp={currentFollowedUp}
        currentStaleFollowUp={staleFollowUp}
        currentPaidIntent={paidIntent}
        currentFeaturedIntent={featuredIntent}
        currentPaidBlockers={paidBlockers}
      />

      {/* Tools Table */}
      <AdminToolsTable tools={tools} total={total} currentPage={page} />
    </div>
  );
}
