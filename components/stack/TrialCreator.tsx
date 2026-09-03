'use client';

import { Loader2, Plus, X } from 'lucide-react';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { createTrialScorecard } from '@/app/actions/trials';
import { useRouter } from '@/app/navigation';
import type { StackToolOption } from '@/components/stack/StackWorkspace';

const initialChecks = ['', '', ''];

export default function TrialCreator({ locale, tools }: { locale: string; tools: StackToolOption[] }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [toolId, setToolId] = useState('');
  const [targetOutcome, setTargetOutcome] = useState('');
  const [renewalAt, setRenewalAt] = useState('');
  const [checks, setChecks] = useState(initialChecks);
  const [idempotencyKey, setIdempotencyKey] = useState(() => globalThis.crypto?.randomUUID?.() || `trial-${Date.now()}`);

  const updateCheck = (index: number, value: string) => {
    setChecks((current) => current.map((check, checkIndex) => checkIndex === index ? value : check));
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      const result = await createTrialScorecard({ locale, toolId, targetOutcome, renewalAt, checkLabels: checks, idempotencyKey });
      if (!result.success) {
        toast.error(`${result.message} (${result.code})`);
        return;
      }
      toast.success(isChinese ? '7 日试用已创建。' : result.message);
      setIdempotencyKey(globalThis.crypto?.randomUUID?.() || `trial-${Date.now()}`);
      router.push(`/profile/trials/${result.scorecardId}`);
    });
  };

  const inputClass = 'mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900';

  return (
    <form onSubmit={submit} className='rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7'>
      <p className='text-xs font-bold uppercase tracking-[0.16em] text-cyan-700'>7-Day Trial Scorecard</p>
      <h2 className='mt-2 text-2xl font-bold text-slate-950'>{isChinese ? '先定义成功，再开始试用' : 'Define success before starting the trial'}</h2>
      <p className='mt-2 text-sm leading-6 text-slate-600'>{isChinese ? '结束日期固定为创建后的第 7 天。检查项必须来自真实工作，不使用泛泛的“感觉不错”。' : 'The trial ends seven days after creation. Checks should reflect real work, not a vague good impression.'}</p>

      <div className='mt-5 grid gap-4 md:grid-cols-2'>
        <label className='text-xs font-semibold text-slate-700 md:col-span-2'>
          {isChinese ? '试用工具' : 'Tool to trial'}
          <select value={toolId} onChange={(event) => setToolId(event.target.value)} className={inputClass} required disabled={isPending}>
            <option value=''>{isChinese ? '选择一个目录工具' : 'Choose a listed tool'}</option>
            {tools.map((tool) => <option key={tool.id} value={tool.id}>{tool.title}</option>)}
          </select>
        </label>
        <label className='text-xs font-semibold text-slate-700 md:col-span-2'>
          {isChinese ? '7 天后希望验证什么结果？' : 'What outcome should be proven in seven days?'}
          <textarea value={targetOutcome} onChange={(event) => setTargetOutcome(event.target.value)} className={inputClass} rows={3} maxLength={1000} required disabled={isPending} placeholder={isChinese ? '例如：每周会议纪要整理时间减少一半，并且关键信息没有明显遗漏。' : 'Example: Cut weekly meeting-note cleanup time in half without losing key decisions.'} />
        </label>
        <label className='text-xs font-semibold text-slate-700'>
          {isChinese ? '可能续费日期（可选）' : 'Possible renewal date (optional)'}
          <input type='date' value={renewalAt} onChange={(event) => setRenewalAt(event.target.value)} className={inputClass} disabled={isPending} />
        </label>
        <div className='rounded-xl border border-cyan-100 bg-cyan-50 p-3 text-sm text-cyan-900'>
          <strong>{isChinese ? '提醒：' : 'Reminder: '}</strong>
          {isChinese ? '到期前 24 小时发送一次站内提醒；不会自动发邮件。' : 'One in-app reminder is sent within 24 hours of expiry. Email stays off.'}
        </div>
      </div>

      <div className='mt-6'>
        <div className='flex items-center justify-between gap-3'>
          <h3 className='font-bold text-slate-950'>{isChinese ? '真实检查项（3–5 项）' : 'Real trial checks (3–5)'}</h3>
          {checks.length < 5 ? <button type='button' onClick={() => setChecks((current) => [...current, ''])} disabled={isPending} className='inline-flex items-center gap-1 text-xs font-semibold text-cyan-700'><Plus className='size-3.5' />{isChinese ? '增加一项' : 'Add check'}</button> : null}
        </div>
        <div className='mt-3 space-y-3'>
          {checks.map((check, index) => (
            <div key={index} className='flex items-center gap-2'>
              <span className='w-6 text-center text-xs font-bold text-slate-400'>{index + 1}</span>
              <input value={check} onChange={(event) => updateCheck(index, event.target.value)} className='min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm' maxLength={300} required disabled={isPending} placeholder={isChinese ? '写一个可以明确通过或失败的真实任务' : 'Add a real task that can clearly pass or fail'} />
              {checks.length > 3 ? <button type='button' onClick={() => setChecks((current) => current.filter((_, checkIndex) => checkIndex !== index))} disabled={isPending} aria-label={isChinese ? '删除检查项' : 'Remove check'} className='rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600'><X className='size-4' /></button> : null}
            </div>
          ))}
        </div>
      </div>

      <button type='submit' disabled={isPending} className='mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-700 px-5 py-3 text-sm font-semibold text-white hover:bg-cyan-800 disabled:opacity-60'>
        {isPending ? <Loader2 className='size-4 animate-spin' /> : <Plus className='size-4' />}
        {isPending ? (isChinese ? '正在创建试用…' : 'Creating trial...') : (isChinese ? '开始 7 日试用' : 'Start 7-day trial')}
      </button>
    </form>
  );
}
