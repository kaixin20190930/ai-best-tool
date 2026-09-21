import { getIndexReviewOverview } from '@/lib/services/admin/indexReviews';

export default async function AdminIndexReviewsPage() {
  const overview = await getIndexReviewOverview();

  return (
    <div className='space-y-6'>
      <header>
        <p className='text-xs font-bold uppercase tracking-[0.18em] text-cyan-700'>Search governance</p>
        <h1 className='mt-2 text-3xl font-bold text-slate-950'>Index reviews</h1>
        <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
          A review records why a monitored tool is approved, held, repaired, permanently excluded, or merged. Recording
          a review never changes the tool index state by itself.
        </p>
      </header>

      {!overview.schemaReady ? (
        <section className='rounded-xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-950'>
          Apply <strong>db/neon/20260921_tool_index_review_runs.sql</strong> to enable the audit ledger. The page
          remains read-only and safe until the migration is present.
        </section>
      ) : (
        <>
          <section className='grid gap-3 md:grid-cols-3'>
            <div className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm'>
              <p className='text-xs font-semibold uppercase text-slate-500'>Monitor queue</p>
              <p className='mt-2 text-3xl font-bold text-slate-950'>{overview.monitorCount}</p>
            </div>
            <div className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm'>
              <p className='text-xs font-semibold uppercase text-slate-500'>Release policy</p>
              <p
                className={`mt-2 text-lg font-bold ${overview.policy?.paused ? 'text-amber-700' : 'text-emerald-700'}`}
              >
                {overview.policy?.paused ? 'Paused' : 'Active'}
              </p>
              {overview.policy?.pauseReason ? (
                <p className='mt-1 text-xs text-slate-600'>{overview.policy.pauseReason}</p>
              ) : null}
            </div>
            <div className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm'>
              <p className='text-xs font-semibold uppercase text-slate-500'>Hard limits</p>
              <p className='mt-2 text-lg font-bold text-slate-950'>
                {overview.policy?.dailyLimit || 0}/day · {overview.policy?.weeklyLimit || 0}/week
              </p>
            </div>
          </section>

          <section className='overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm'>
            <div className='border-b border-slate-200 px-5 py-4'>
              <h2 className='font-bold text-slate-950'>Recent review runs</h2>
            </div>
            {overview.runs.length === 0 ? (
              <p className='p-5 text-sm text-slate-600'>No review run has been recorded yet.</p>
            ) : (
              <div className='divide-y divide-slate-100'>
                {overview.runs.map((run) => (
                  <article key={run.id} className='grid gap-2 p-5 md:grid-cols-[1fr_220px]'>
                    <div>
                      <p className='font-semibold text-slate-950'>{run.toolSlug}</p>
                      <p className='mt-1 text-sm text-slate-600'>
                        {run.blockers.join(' · ') || 'All recorded gates passed'}
                      </p>
                    </div>
                    <div className='text-sm text-slate-600 md:text-right'>
                      <p className='font-semibold text-cyan-800'>{run.decision}</p>
                      <p>
                        {run.createdAt.toLocaleString()} · {run.reviewedBy}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
