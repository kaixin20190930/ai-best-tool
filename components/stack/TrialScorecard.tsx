'use client';

import { CheckCircle2, Clock3, Loader2 } from 'lucide-react';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { completeTrialScorecard, updateTrialCheck } from '@/app/actions/trials';
import { useRouter } from '@/app/navigation';

export type TrialCheckView = { id: string; sequence: number; label: string; result: string; actualNote: string | null };

export default function TrialScorecard({
  locale,
  scorecardId,
  status,
  checks,
}: {
  locale: string;
  scorecardId: string;
  status: string;
  checks: TrialCheckView[];
}) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>(Object.fromEntries(checks.map((check) => [check.id, check.actualNote || ''])));
  const [finalDecision, setFinalDecision] = useState('keep');
  const [privateNotes, setPrivateNotes] = useState('');
  const editable = status === 'active' || status === 'planned';
  const pendingCount = checks.filter((check) => check.result === 'pending').length;

  const saveCheck = (checkId: string, result: string) => {
    setPendingAction(`check:${checkId}:${result}`);
    startTransition(async () => {
      try {
        const response = await updateTrialCheck({ locale, scorecardId, checkId, result, actualNote: notes[checkId] });
        if (!response.success) {
          toast.error(`${response.message} (${response.code})`);
          return;
        }
        toast.success(isChinese ? '检查结果已保存。' : response.message);
        router.refresh();
      } finally {
        setPendingAction(null);
      }
    });
  };

  const complete = () => {
    setPendingAction('complete');
    startTransition(async () => {
      try {
        const response = await completeTrialScorecard({ locale, scorecardId, finalDecision, privateNotes });
        if (!response.success) {
          toast.error(`${response.message} (${response.code})`);
          return;
        }
        toast.success(isChinese ? '最终试用决定已保存。' : response.message);
        router.refresh();
      } finally {
        setPendingAction(null);
      }
    });
  };

  return (
    <div className='space-y-4'>
      {checks.map((check) => (
        <article key={check.id} className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
          <div className='flex flex-wrap items-start justify-between gap-3'>
            <div className='flex gap-3'>
              <span className='flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600'>{check.sequence}</span>
              <div><h2 className='font-bold text-slate-950'>{check.label}</h2><p className='mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500'>{check.result}</p></div>
            </div>
            {check.result === 'pass' ? <CheckCircle2 className='size-5 text-emerald-600' /> : <Clock3 className='size-5 text-slate-400' />}
          </div>
          <label className='mt-4 block text-xs font-semibold text-slate-700'>
            {isChinese ? '结果备注（可选）' : 'Result note (optional)'}
            <input value={notes[check.id] || ''} onChange={(event) => setNotes((current) => ({ ...current, [check.id]: event.target.value }))} disabled={!editable || isPending} maxLength={500} className='mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm' />
          </label>
          {editable ? <div className='mt-3 flex flex-wrap gap-2'>
            {(['pass', 'fail', 'skipped'] as const).map((result) => (
              <button key={result} type='button' disabled={isPending} onClick={() => saveCheck(check.id, result)} className={`inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold ${check.result === result ? 'border-cyan-300 bg-cyan-50 text-cyan-900' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                {pendingAction === `check:${check.id}:${result}` ? <Loader2 className='size-3.5 animate-spin' /> : null}
                {result}
              </button>
            ))}
          </div> : null}
        </article>
      ))}

      {editable ? <section className='rounded-3xl border border-cyan-200 bg-cyan-50 p-5'>
        <h2 className='text-xl font-bold text-cyan-950'>{isChinese ? '做最终决定' : 'Make the final decision'}</h2>
        <p className='mt-2 text-sm text-cyan-900'>{pendingCount > 0 ? (isChinese ? `还有 ${pendingCount} 项未处理。可以通过、失败或跳过。` : `${pendingCount} checks remain. Pass, fail, or skip each one.`) : (isChinese ? '所有检查已处理，可以保存最终决定。' : 'All checks are resolved. Save the final decision.')}</p>
        <div className='mt-4 grid gap-3 sm:grid-cols-3'>
          {(['keep', 'cancel', 'compare'] as const).map((decision) => <label key={decision} className='flex cursor-pointer items-center gap-2 rounded-xl border border-cyan-200 bg-white p-3 text-sm font-semibold text-slate-800'><input type='radio' name='finalDecision' value={decision} checked={finalDecision === decision} onChange={() => setFinalDecision(decision)} disabled={isPending} className='accent-cyan-700' />{decision}</label>)}
        </div>
        <textarea value={privateNotes} onChange={(event) => setPrivateNotes(event.target.value)} disabled={isPending} rows={3} maxLength={2000} placeholder={isChinese ? '记录最终判断的私有备注（可选）' : 'Private notes for your final decision (optional)'} className='mt-4 w-full rounded-xl border border-cyan-200 bg-white px-3 py-2.5 text-sm' />
        <button type='button' onClick={complete} disabled={isPending || pendingCount > 0} className='mt-3 inline-flex items-center gap-2 rounded-xl bg-cyan-800 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50'>
          {pendingAction === 'complete' ? <Loader2 className='size-4 animate-spin' /> : <CheckCircle2 className='size-4' />}
          {pendingAction === 'complete' ? (isChinese ? '正在保存最终决定…' : 'Saving final decision...') : (isChinese ? '完成试用并保存决定' : 'Complete trial and save decision')}
        </button>
      </section> : null}
    </div>
  );
}
