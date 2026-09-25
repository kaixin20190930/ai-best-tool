import Link from 'next/link';

import { getCapabilityAdminOverview } from '@/lib/services/admin/capabilities';
import { getDecisionReviewOverview, type DecisionReviewEntity } from '@/lib/services/admin/decision';
import CapabilityManager from '@/components/admin/CapabilityManager';
import DecisionClusterClosure from '@/components/admin/DecisionClusterClosure';
import DecisionReviewBoard from '@/components/admin/DecisionReviewBoard';

export default async function AdminDecisionPage({
  searchParams,
}: {
  searchParams: { entity?: string; status?: string };
}) {
  const [overview, capabilityOverview] = await Promise.all([getDecisionReviewOverview(), getCapabilityAdminOverview()]);
  const entity = searchParams.entity || 'all';
  const status = searchParams.status || 'all';
  const items = overview.items.filter(
    (item) => (entity === 'all' || item.entity === entity) && (status === 'all' || item.status === status),
  );
  const entities: Array<'all' | DecisionReviewEntity> = ['all', 'task', 'profile', 'fit', 'relationship'];

  return (
    <div className='space-y-6'>
      <header>
        <p className='text-xs font-bold uppercase tracking-[0.18em] text-cyan-700'>Decision platform</p>
        <h1 className='mt-2 text-3xl font-bold text-slate-950'>Decision review</h1>
        <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
          Review tasks, profiles, task fit, and directional relationships. Draft machine output must pass human review
          before publication, and publication requires verified evidence.
        </p>
      </header>

      <section className='grid gap-3 sm:grid-cols-2 lg:grid-cols-5'>
        {Object.entries(overview.totals).map(([label, value]) => (
          <div key={label} className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm'>
            <p className='text-xs font-semibold uppercase text-slate-500'>{label}</p>
            <p className='mt-2 text-2xl font-bold text-slate-950'>{value}</p>
          </div>
        ))}
      </section>

      <div className='flex flex-wrap gap-2'>
        {entities.map((value) => (
          <Link
            key={value}
            href={`/admin/decision?entity=${value}&status=${status}`}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              entity === value ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {value}
          </Link>
        ))}
        {['all', 'draft', 'reviewed', 'published', 'stale', 'active'].map((value) => (
          <Link
            key={value}
            href={`/admin/decision?entity=${entity}&status=${value}`}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              status === value ? 'bg-cyan-700 text-white' : 'bg-cyan-50 text-cyan-800 hover:bg-cyan-100'
            }`}
          >
            {value}
          </Link>
        ))}
      </div>

      <DecisionReviewBoard items={items} />

      <section className='border-t border-slate-200 pt-8'>
        <div className='mb-5'>
          <p className='text-xs font-bold uppercase tracking-[0.18em] text-cyan-700'>Decision graph</p>
          <h2 className='mt-2 text-2xl font-bold text-slate-950'>Capability management</h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            Maintain the Capability taxonomy and draft/reviewed Tool and Task relationships. Raw evidence remains
            server-side; the database is the final publication gate.
          </p>
        </div>
        <CapabilityManager overview={capabilityOverview} />
        <DecisionClusterClosure overview={capabilityOverview} />
      </section>
    </div>
  );
}
