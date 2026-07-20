import Link from 'next/link';
import { AlertTriangle, ArrowUpRight, BarChart3, CheckCircle2, CircleDollarSign, ListChecks, type LucideIcon } from 'lucide-react';

import { getAdminDistributionOverview } from '@/lib/services/admin/distribution';

export default async function AdminDistributionPage() {
  try {
    const data = await getAdminDistributionOverview();
    const totals = data.projects.reduce((summary, project) => ({
      tasks: summary.tasks + project.taskTotal,
      open: summary.open + project.taskOpen,
      live: summary.live + project.liveResults,
      visits: summary.visits + project.attribution.visits,
      payments: summary.payments + project.attribution.payments,
    }), { tasks: 0, open: 0, live: 0, visits: 0, payments: 0 });
    const metricCards: Array<[string, number, LucideIcon]> = [
      ['Projects', data.projects.length, ListChecks],
      ['Open tasks', totals.open, BarChart3],
      ['Live results', totals.live, CheckCircle2],
      ['30d visits', totals.visits, BarChart3],
      ['Payments', totals.payments, CircleDollarSign],
    ];

    return (
      <div className='space-y-6'>
        <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-end'>
          <div>
            <p className='text-xs font-bold uppercase tracking-[0.18em] text-cyan-700'>Distribution operations</p>
            <h1 className='mt-2 text-3xl font-bold text-slate-950'>Distribution overview</h1>
            <p className='mt-2 max-w-2xl text-sm leading-6 text-slate-600'>Monitor customer workspaces, live mentions, failed placements, and the last 30 days of attributed outcomes.</p>
          </div>
          <Link href='/distribution' className='inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-cyan-300 hover:text-cyan-700'>Open workspace <ArrowUpRight className='h-4 w-4' /></Link>
        </div>

        <section className='grid gap-3 sm:grid-cols-2 lg:grid-cols-5'>
          {metricCards.map(([label, value, Icon]) => (
            <div key={String(label)} className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
              <Icon className='h-5 w-5 text-cyan-700' />
              <div className='mt-3 text-2xl font-bold text-slate-950'>{value as number}</div>
              <div className='mt-1 text-xs text-slate-500'>{label}</div>
            </div>
          ))}
        </section>

        <section className='grid gap-4 lg:grid-cols-[1.4fr_1fr]'>
          <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
            <div className='flex items-center justify-between gap-3'><h2 className='text-lg font-bold text-slate-950'>Customer projects</h2><span className='text-xs text-slate-500'>{data.projects.length} total</span></div>
            <div className='mt-4 overflow-x-auto'>
              <table className='w-full min-w-[760px] text-left text-sm'>
                <thead className='border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500'><tr><th className='px-3 py-3'>Project</th><th className='px-3 py-3'>Tasks</th><th className='px-3 py-3'>Live</th><th className='px-3 py-3'>30d attribution</th><th className='px-3 py-3'>Status</th></tr></thead>
                <tbody className='divide-y divide-slate-100'>
                  {data.projects.map((project) => <tr key={project.id} className='align-top'><td className='px-3 py-4'><div className='font-bold text-slate-900'>{project.name}</div><div className='mt-1 text-xs text-slate-500'>{project.workspaceName} · {project.workspaceKind}</div>{project.websiteUrl ? <a className='mt-1 block max-w-[240px] truncate text-xs text-cyan-700 hover:underline' href={project.websiteUrl} target='_blank' rel='noreferrer'>{project.websiteUrl}</a> : null}</td><td className='px-3 py-4 text-slate-700'>{project.taskOpen} open / {project.taskTotal} total</td><td className='px-3 py-4 text-slate-700'>{project.liveResults}{project.problematicResults ? <span className='ml-2 text-xs text-rose-700'>({project.problematicResults} issue)</span> : null}</td><td className='px-3 py-4 text-xs leading-5 text-slate-600'>Visits {project.attribution.visits}<br />Signups {project.attribution.signups} · Claims {project.attribution.claims}<br />Payments {project.attribution.payments}</td><td className='px-3 py-4'><span className={`rounded-full px-2 py-1 text-xs font-bold ${project.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{project.status}</span></td></tr>)}
                </tbody>
              </table>
              {data.projects.length === 0 ? <p className='py-10 text-center text-sm text-slate-500'>No distribution projects yet.</p> : null}
            </div>
          </div>

          <div className='space-y-4'>
            <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'><h2 className='text-lg font-bold text-slate-950'>Entitlements</h2><div className='mt-4 grid grid-cols-2 gap-3 text-sm'>{[['Active', data.entitlements.active], ['Pilot', data.entitlements.pilot], ['Pro', data.entitlements.pro], ['Agency', data.entitlements.agency]].map(([label, value]) => <div key={String(label)} className='rounded-xl bg-slate-50 p-3'><div className='text-xl font-bold text-slate-950'>{value}</div><div className='mt-1 text-xs text-slate-500'>{label}</div></div>)}</div></div>
            <div className='rounded-2xl border border-amber-200 bg-amber-50/60 p-5'><div className='flex items-center gap-2 text-lg font-bold text-slate-950'><AlertTriangle className='h-5 w-5 text-amber-700' /> Recent result issues</div>{data.recentIssues.length ? <div className='mt-4 space-y-3'>{data.recentIssues.slice(0, 8).map((issue, index) => <div key={`${issue.projectName}-${issue.title}-${index}`} className='rounded-xl border border-amber-100 bg-white p-3'><div className='font-semibold text-slate-900'>{issue.projectName}</div><div className='mt-1 text-sm text-slate-600'>{issue.title}</div><div className='mt-2 text-xs font-bold uppercase text-rose-700'>{issue.status}</div>{issue.liveUrl ? <a href={issue.liveUrl} target='_blank' rel='noreferrer' className='mt-1 block truncate text-xs text-cyan-700 hover:underline'>{issue.liveUrl}</a> : null}</div>)}</div> : <p className='mt-3 text-sm text-slate-600'>No rejected or removed results recorded.</p>}</div>
          </div>
        </section>
      </div>
    );
  } catch (error) {
    console.error('Admin distribution overview failed:', error);
    return <div className='rounded-2xl border border-rose-200 bg-rose-50 p-6'><h1 className='text-2xl font-bold text-rose-950'>Distribution overview unavailable</h1><p className='mt-2 text-sm text-rose-800'>Run the distribution Supabase migration, then refresh this page.</p><Link href='/admin' className='mt-4 inline-block font-bold text-rose-900 underline'>Back to admin</Link></div>;
  }
}
