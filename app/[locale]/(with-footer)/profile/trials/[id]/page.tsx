import { notFound } from 'next/navigation';

import TrialScorecard, { type TrialCheckView } from '@/components/stack/TrialScorecard';
import { Link } from '@/app/navigation';
import { query } from '@/db/neon/client';
import { getNoindexMetadata } from '@/lib/seo/indexing';
import { getLocalizedField } from '@/lib/services/tools';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: '7-Day Trial Scorecard', ...getNoindexMetadata() };

type DatabaseRow = Record<string, unknown>;

export default async function TrialDetailPage({ params }: { params: { locale: string; id: string } }) {
  const isChinese = params.locale === 'cn' || params.locale === 'tw';
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <main className='container mx-auto px-4 py-16 text-center'><h1 className='text-3xl font-bold'>{isChinese ? '请先登录' : 'Please log in'}</h1><Link href={`/login?redirect=/profile/trials/${params.id}`} className='mt-6 inline-flex rounded-xl bg-cyan-700 px-5 py-3 font-semibold text-white'>{isChinese ? '登录' : 'Log in'}</Link></main>;

  const { data: trial } = await supabase.from('trial_scorecards').select('*').eq('id', params.id).eq('user_id', user.id).maybeSingle();
  if (!trial) notFound();
  const [{ data: checkRows }, toolResult] = await Promise.all([
    supabase.from('trial_scorecard_checks').select('id, sequence, label, result, actual_value').eq('scorecard_id', params.id).order('sequence'),
    query<{ name: string; title: Record<string, string> }>(`SELECT name, title FROM tools WHERE id = $1::uuid LIMIT 1`, [trial.tool_id]),
  ]);
  const tool = toolResult.rows[0];
  const toolTitle = tool ? getLocalizedField(tool.title, params.locale, isChinese ? 'cn' : 'en') : String(trial.tool_id);
  const checks: TrialCheckView[] = ((checkRows || []) as DatabaseRow[]).map((check) => {
    const actual = check.actual_value && typeof check.actual_value === 'object' ? check.actual_value as Record<string, unknown> : {};
    return { id: String(check.id), sequence: Number(check.sequence), label: String(check.label), result: String(check.result), actualNote: typeof actual.note === 'string' ? actual.note : null };
  });
  const now = Date.now();
  const endsAt = new Date(String(trial.ends_at));
  const daysLeft = Math.max(0, Math.ceil((endsAt.getTime() - now) / (24 * 60 * 60 * 1000)));

  return (
    <main className='theme-page min-h-screen bg-slate-50 py-10'>
      <div className='container mx-auto max-w-4xl px-4'>
        <Link href='/profile/trials' className='text-sm font-semibold text-cyan-700'>← {isChinese ? '所有试用' : 'All trials'}</Link>
        <section className='mt-5 rounded-3xl bg-slate-950 p-6 text-white md:p-8'>
          <div className='flex flex-wrap items-start justify-between gap-4'><div><p className='text-xs font-bold uppercase tracking-[0.18em] text-cyan-300'>7-Day Trial</p><h1 className='mt-3 text-3xl font-bold'>{toolTitle}</h1></div><span className='rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold'>{String(trial.status)}</span></div>
          <p className='mt-5 text-sm leading-6 text-slate-300'>{String(trial.target_outcome)}</p>
          <div className='mt-5 grid gap-3 sm:grid-cols-3'><div className='rounded-xl bg-white/5 p-3'><p className='text-xs text-slate-400'>{isChinese ? '开始' : 'Started'}</p><p className='mt-1 font-bold'>{String(trial.started_at).slice(0, 10)}</p></div><div className='rounded-xl bg-white/5 p-3'><p className='text-xs text-slate-400'>{isChinese ? '结束' : 'Ends'}</p><p className='mt-1 font-bold'>{String(trial.ends_at).slice(0, 10)}</p></div><div className='rounded-xl bg-white/5 p-3'><p className='text-xs text-slate-400'>{isChinese ? '剩余' : 'Remaining'}</p><p className='mt-1 font-bold'>{daysLeft} {isChinese ? '天' : 'days'}</p></div></div>
          {trial.status === 'completed' ? <div className='mt-5 rounded-xl bg-emerald-400/10 p-4 text-sm text-emerald-200'>{isChinese ? '最终决定：' : 'Final decision: '}<strong>{String(trial.final_decision)}</strong>{trial.private_notes ? <p className='mt-2 text-emerald-100/80'>{String(trial.private_notes)}</p> : null}</div> : null}
        </section>
        <div className='mt-6'><TrialScorecard locale={params.locale} scorecardId={params.id} status={String(trial.status)} checks={checks} /></div>
      </div>
    </main>
  );
}
