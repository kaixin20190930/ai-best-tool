import { query } from '@/db/neon/client';
import TrialCreator from '@/components/stack/TrialCreator';
import type { StackToolOption } from '@/components/stack/StackWorkspace';
import { Link } from '@/app/navigation';
import { getNoindexMetadata } from '@/lib/seo/indexing';
import { getLocalizedField } from '@/lib/services/tools';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'My 7-Day AI Tool Trials',
  description: 'Run private, task-based AI tool trials and record a final decision.',
  ...getNoindexMetadata(),
};

type DatabaseRow = Record<string, unknown>;

export default async function TrialsPage({ params }: { params: { locale: string } }) {
  const isChinese = params.locale === 'cn' || params.locale === 'tw';
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return <main className='container mx-auto px-4 py-16 text-center'><h1 className='text-3xl font-bold'>{isChinese ? '登录后管理 7 日试用' : 'Log in to manage 7-day trials'}</h1><Link href='/login?redirect=/profile/trials' className='mt-6 inline-flex rounded-xl bg-cyan-700 px-5 py-3 font-semibold text-white'>{isChinese ? '登录' : 'Log in'}</Link></main>;
  }

  const [{ rows: neonTools }, trialsResult] = await Promise.all([
    query<{ id: string; name: string; title: Record<string, string> }>(`SELECT id, name, title FROM tools WHERE status = 'published' ORDER BY name ASC LIMIT 500`),
    supabase.from('trial_scorecards').select('id, tool_id, status, target_outcome, started_at, ends_at, renewal_at, final_decision').eq('user_id', user.id).order('created_at', { ascending: false }),
  ]);
  const tools: StackToolOption[] = neonTools.map((tool) => ({ id: tool.id, slug: tool.name, title: getLocalizedField(tool.title, params.locale, isChinese ? 'cn' : 'en') }));
  const toolNames = new Map(tools.map((tool) => [tool.id, tool.title]));
  const trials = (trialsResult.data || []) as DatabaseRow[];

  return (
    <main className='theme-page min-h-screen bg-[radial-gradient(circle_at_top_right,_#ecfeff,_transparent_32%),linear-gradient(180deg,#f8fafc,#ffffff)] py-10'>
      <div className='container mx-auto px-4'>
        <div className='mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
          <div className='max-w-3xl'><p className='text-xs font-bold uppercase tracking-[0.18em] text-cyan-700'>Trial workspace</p><h1 className='mt-3 text-3xl font-bold tracking-tight text-slate-950 md:text-5xl'>{isChinese ? '用 7 天真实任务代替第一印象' : 'Replace first impressions with seven days of real work'}</h1><p className='mt-4 text-base leading-7 text-slate-600'>{isChinese ? '每次试用先定义结果和检查项，到期后明确选择保留、取消或继续比较。' : 'Define outcomes and checks first, then choose keep, cancel, or compare at the end.'}</p></div>
          <Link href='/profile/stack' className='inline-flex rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700'>{isChinese ? '返回 AI Stack' : 'Back to AI Stack'}</Link>
        </div>
        <div className='grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.7fr)]'>
          <TrialCreator locale={params.locale} tools={tools} />
          <section className='space-y-3'>
            <div className='rounded-3xl bg-slate-950 p-5 text-white'><p className='text-xs font-bold uppercase tracking-[0.16em] text-cyan-300'>{isChinese ? '试用记录' : 'Trial history'}</p><p className='mt-2 text-4xl font-bold'>{trials.length}</p></div>
            {trialsResult.error ? <div className='rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-900'>{isChinese ? '试用记录暂时无法读取，请刷新重试。这里不会把读取失败显示成“还没有试用”。' : 'Trial history is temporarily unavailable. Refresh to retry; this error is not presented as an empty history.'}</div> : null}
            {trials.map((trial) => {
              const toolId = String(trial.tool_id);
              return <Link key={String(trial.id)} href={`/profile/trials/${trial.id}`} className='block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-cyan-300'>
                <div className='flex items-start justify-between gap-3'><div><p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>{String(trial.status)}</p><h2 className='mt-2 text-lg font-bold text-slate-950'>{toolNames.get(toolId) || toolId}</h2></div><span className='rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600'>{String(trial.final_decision)}</span></div>
                <p className='mt-3 line-clamp-2 text-sm leading-6 text-slate-600'>{String(trial.target_outcome)}</p><p className='mt-3 text-xs text-slate-500'>{String(trial.started_at).slice(0, 10)} → {String(trial.ends_at).slice(0, 10)}</p>
              </Link>;
            })}
            {!trialsResult.error && trials.length === 0 ? <div className='rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600'>{isChinese ? '还没有试用记录。先从左侧定义一次真实试用。' : 'No trial yet. Define the first real trial on the left.'}</div> : null}
          </section>
        </div>
      </div>
    </main>
  );
}
