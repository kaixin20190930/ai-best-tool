import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { getAdminTools, getToolsStats } from '@/app/actions/admin/tools';
import AdminToolsTable from '@/components/admin/AdminToolsTable';
import AdminToolsFilters from '@/components/admin/AdminToolsFilters';

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
    search?: string;
    collected?: string;
    needsMedia?: string;
    quality?: string;
    ready?: string;
    overdue?: string;
    followedUp?: string;
    staleFollowUp?: string;
    page?: string;
  };
}) {
  const page = Math.max(Number.parseInt(searchParams.page || '1', 10) || 1, 1);
  const status = searchParams.status;
  const search = searchParams.search;
  const collected = searchParams.collected === '1';
  const needsMedia = searchParams.needsMedia === '1';
  const ready = searchParams.ready === '1';
  const overdue = searchParams.overdue === '1';
  const followedUp =
    searchParams.followedUp === '1'
      ? true
      : searchParams.followedUp === '0'
      ? false
      : undefined;
  const staleFollowUp = searchParams.staleFollowUp === '1';
  const quality =
    searchParams.quality === 'low' ||
    searchParams.quality === 'medium' ||
    searchParams.quality === 'high'
      ? searchParams.quality
      : undefined;

  const { tools, total } = await getAdminTools({
    status,
    search,
    collected,
    needsMedia,
    quality,
    ready,
    overdue,
    followedUp,
    staleFollowUp,
    page,
    pageSize: 20,
  });

  const stats = await getToolsStats();

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tool Management</h1>
          <p className="mt-2 text-slate-600">
            Review, approve, and manage tool submissions
          </p>
        </div>
        <Link
          href="/admin/tools?status=pending"
          className="inline-flex items-center justify-center rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600"
        >
          Review pending ({stats.pending})
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="theme-surface rounded-lg border border-slate-200 p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Total</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{stats.total}</p>
        </div>
        <div className="theme-surface rounded-lg border border-slate-200 p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Published</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-600">
            {stats.published}
          </p>
        </div>
        <div className="theme-surface rounded-lg border border-slate-200 p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Pending</p>
          <p className="mt-2 text-2xl font-semibold text-amber-600">
            {stats.pending}
          </p>
        </div>
        <div className="theme-surface rounded-lg border border-slate-200 p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Rejected</p>
          <p className="mt-2 text-2xl font-semibold text-red-600">
            {stats.rejected}
          </p>
        </div>
        <div className="theme-surface rounded-lg border border-slate-200 p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Draft</p>
          <p className="mt-2 text-2xl font-semibold text-slate-600">{stats.draft}</p>
        </div>
      </div>

      {/* Filters */}
      <AdminToolsFilters
        currentStatus={status}
        currentSearch={search}
        currentCollected={collected}
        currentNeedsMedia={needsMedia}
        currentQuality={quality}
        currentReady={ready}
        currentOverdue={overdue}
        currentFollowedUp={
          followedUp === true ? '1' : followedUp === false ? '0' : undefined
        }
        currentStaleFollowUp={staleFollowUp}
      />

      {/* Tools Table */}
      <AdminToolsTable tools={tools} total={total} currentPage={page} />
    </div>
  );
}
