import Link from 'next/link';

import AdminClaimsTable from '@/components/admin/AdminClaimsTable';
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
