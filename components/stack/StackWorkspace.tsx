'use client';

import { Loader2, Pencil, Plus, Trash2, WalletCards } from 'lucide-react';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { deleteStackItem, saveStackItem, type StackItemInput } from '@/app/actions/stack';
import { useRouter } from '@/app/navigation';
import { normalizeStackCost, type StackBillingPeriod } from '@/lib/services/stack/cost';

export type StackToolOption = { id: string; title: string; slug: string };
export type StackTaskOption = { id: string; name: string };
export type StackItemView = {
  id: string;
  toolId: string | null;
  title: string;
  customToolName: string | null;
  customToolUrl: string | null;
  subscriptionStatus: string;
  billingAmount: number | null;
  monthlyCost: number | null;
  currency: string;
  billingPeriod: StackBillingPeriod;
  usageFrequency: string;
  dataSensitivity: string | null;
  startedAt: string | null;
  renewsAt: string | null;
  cancelReminderAt: string | null;
  notes: string | null;
  taskId: string | null;
  taskName: string | null;
};

const emptyForm: StackItemInput = {
  subscriptionStatus: 'free',
  billingAmount: '',
  currency: 'USD',
  billingPeriod: 'unknown',
  usageFrequency: 'rarely',
  dataSensitivity: 'low',
};

function toDateInput(value: string | null) {
  return value ? value.slice(0, 10) : '';
}

export default function StackWorkspace({
  locale,
  tools,
  tasks,
  items,
}: {
  locale: string;
  tools: StackToolOption[];
  tasks: StackTaskOption[];
  items: StackItemView[];
}) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const router = useRouter();
  const [form, setForm] = useState<StackItemInput>(emptyForm);
  const [mode, setMode] = useState<'listed' | 'custom'>('listed');
  const [isPending, startTransition] = useTransition();
  const amount = form.billingAmount?.trim() ? Number(form.billingAmount) : null;
  const preview = normalizeStackCost(amount !== null && Number.isFinite(amount) ? amount : null, form.billingPeriod);

  const update = (key: keyof StackItemInput, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const reset = () => {
    setForm(emptyForm);
    setMode('listed');
  };
  const edit = (item: StackItemView) => {
    setMode(item.toolId ? 'listed' : 'custom');
    setForm({
      id: item.id,
      toolId: item.toolId || '',
      customToolName: item.customToolName || '',
      customToolUrl: item.customToolUrl || '',
      subscriptionStatus: item.subscriptionStatus,
      billingAmount: item.billingAmount === null ? '' : String(item.billingAmount),
      currency: item.currency,
      billingPeriod: item.billingPeriod,
      usageFrequency: item.usageFrequency,
      dataSensitivity: item.dataSensitivity || 'low',
      startedAt: toDateInput(item.startedAt),
      renewsAt: toDateInput(item.renewsAt),
      cancelReminderAt: toDateInput(item.cancelReminderAt),
      notes: item.notes || '',
      taskId: item.taskId || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      const result = await saveStackItem(
        {
          ...form,
          toolId: mode === 'listed' ? form.toolId : '',
          customToolName: mode === 'custom' ? form.customToolName : '',
          customToolUrl: mode === 'custom' ? form.customToolUrl : '',
        },
        locale,
      );
      if (!result.success) {
        toast.error(`${result.message} (${result.code})`);
        return;
      }
      toast.success(isChinese ? 'AI Stack 已保存。' : result.message);
      reset();
      router.refresh();
    });
  };

  const remove = (itemId: string) => {
    startTransition(async () => {
      const result = await deleteStackItem(itemId, locale);
      if (!result.success) {
        toast.error(`${result.message} (${result.code})`);
        return;
      }
      toast.success(isChinese ? '已从 Stack 移除。' : result.message);
      if (form.id === itemId) reset();
      router.refresh();
    });
  };

  const inputClass = 'mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900';
  const labelClass = 'text-xs font-semibold text-slate-700';

  return (
    <div className='grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]'>
      <form onSubmit={submit} className='rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6'>
        <div className='flex items-start justify-between gap-4'>
          <div>
            <p className='text-xs font-bold uppercase tracking-[0.16em] text-cyan-700'>
              {form.id ? (isChinese ? '编辑工具' : 'Edit tool') : isChinese ? '添加工具' : 'Add tool'}
            </p>
            <h2 className='mt-2 text-xl font-bold text-slate-950'>
              {isChinese ? '记录你真实在用和付费的工具' : 'Record tools you actually use and pay for'}
            </h2>
          </div>
          <WalletCards className='size-6 text-cyan-700' />
        </div>

        <div className='mt-5 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1'>
          {(['listed', 'custom'] as const).map((value) => (
            <button
              key={value}
              type='button'
              disabled={isPending}
              onClick={() => setMode(value)}
              className={`rounded-lg px-3 py-2 text-sm font-semibold ${mode === value ? 'bg-white text-cyan-800 shadow-sm' : 'text-slate-600'}`}
            >
              {value === 'listed'
                ? isChinese
                  ? '目录已有工具'
                  : 'Listed tool'
                : isChinese
                  ? '自定义工具'
                  : 'Custom tool'}
            </button>
          ))}
        </div>

        <div className='mt-4 grid gap-4 md:grid-cols-2'>
          {mode === 'listed' ? (
            <label className={`${labelClass} md:col-span-2`}>
              {isChinese ? '选择工具' : 'Choose tool'}
              <select value={form.toolId || ''} onChange={(event) => update('toolId', event.target.value)} className={inputClass} required>
                <option value=''>{isChinese ? '请选择目录工具' : 'Select a listed tool'}</option>
                {tools.map((tool) => (
                  <option key={tool.id} value={tool.id}>{tool.title}</option>
                ))}
              </select>
            </label>
          ) : (
            <>
              <label className={labelClass}>
                {isChinese ? '工具名称' : 'Tool name'}
                <input value={form.customToolName || ''} onChange={(event) => update('customToolName', event.target.value)} className={inputClass} maxLength={200} required />
              </label>
              <label className={labelClass}>
                {isChinese ? '官网 URL（可选）' : 'Website URL (optional)'}
                <input type='url' value={form.customToolUrl || ''} onChange={(event) => update('customToolUrl', event.target.value)} className={inputClass} />
              </label>
            </>
          )}

          <label className={labelClass}>
            {isChinese ? '订阅状态' : 'Subscription status'}
            <select value={form.subscriptionStatus} onChange={(event) => update('subscriptionStatus', event.target.value)} className={inputClass}>
              <option value='free'>{isChinese ? '免费使用' : 'Free'}</option>
              <option value='trial'>{isChinese ? '试用中' : 'Trial'}</option>
              <option value='paid'>{isChinese ? '付费中' : 'Paid'}</option>
              <option value='cancelled'>{isChinese ? '已取消' : 'Cancelled'}</option>
            </select>
          </label>
          <label className={labelClass}>
            {isChinese ? '使用频率' : 'Usage frequency'}
            <select value={form.usageFrequency} onChange={(event) => update('usageFrequency', event.target.value)} className={inputClass}>
              <option value='daily'>{isChinese ? '每天' : 'Daily'}</option>
              <option value='weekly'>{isChinese ? '每周' : 'Weekly'}</option>
              <option value='monthly'>{isChinese ? '每月' : 'Monthly'}</option>
              <option value='rarely'>{isChinese ? '很少' : 'Rarely'}</option>
              <option value='never'>{isChinese ? '从不' : 'Never'}</option>
            </select>
          </label>
          <label className={labelClass}>
            {isChinese ? '真实账单金额' : 'Actual billed amount'}
            <input type='number' min='0' step='0.01' value={form.billingAmount || ''} onChange={(event) => update('billingAmount', event.target.value)} className={inputClass} placeholder='0.00' />
          </label>
          <label className={labelClass}>
            {isChinese ? '账单周期' : 'Billing period'}
            <select value={form.billingPeriod} onChange={(event) => update('billingPeriod', event.target.value as StackBillingPeriod)} className={inputClass}>
              <option value='unknown'>{isChinese ? '未知 / 不填写' : 'Unknown'}</option>
              <option value='month'>{isChinese ? '每月' : 'Monthly'}</option>
              <option value='year'>{isChinese ? '每年' : 'Yearly'}</option>
              <option value='usage'>{isChinese ? '按量（典型月账单）' : 'Usage (typical month)'}</option>
              <option value='one_time'>{isChinese ? '一次性' : 'One time'}</option>
            </select>
          </label>
          <label className={labelClass}>
            {isChinese ? '货币' : 'Currency'}
            <input value={form.currency} onChange={(event) => update('currency', event.target.value.toUpperCase())} className={inputClass} maxLength={3} />
          </label>
          <label className={labelClass}>
            {isChinese ? '主要任务' : 'Primary task'}
            <select value={form.taskId || ''} onChange={(event) => update('taskId', event.target.value)} className={inputClass}>
              <option value=''>{isChinese ? '暂不选择' : 'Not selected'}</option>
              {tasks.map((task) => <option key={task.id} value={task.id}>{task.name}</option>)}
            </select>
          </label>
          <label className={labelClass}>
            {isChinese ? '数据敏感度' : 'Data sensitivity'}
            <select value={form.dataSensitivity || 'low'} onChange={(event) => update('dataSensitivity', event.target.value)} className={inputClass}>
              <option value='low'>{isChinese ? '低' : 'Low'}</option>
              <option value='medium'>{isChinese ? '中' : 'Medium'}</option>
              <option value='high'>{isChinese ? '高' : 'High'}</option>
              <option value='regulated'>{isChinese ? '受监管数据' : 'Regulated'}</option>
            </select>
          </label>
          <label className={labelClass}>
            {isChinese ? '续费日期' : 'Renewal date'}
            <input type='date' value={form.renewsAt || ''} onChange={(event) => update('renewsAt', event.target.value)} className={inputClass} />
          </label>
          <label className={labelClass}>
            {isChinese ? '取消提醒日期' : 'Cancel reminder'}
            <input type='date' value={form.cancelReminderAt || ''} onChange={(event) => update('cancelReminderAt', event.target.value)} className={inputClass} />
          </label>
          <label className={`${labelClass} md:col-span-2`}>
            {isChinese ? '私有备注' : 'Private notes'}
            <textarea value={form.notes || ''} onChange={(event) => update('notes', event.target.value)} className={inputClass} rows={3} maxLength={2000} />
          </label>
        </div>

        <div className='mt-4 rounded-xl border border-cyan-100 bg-cyan-50 p-3 text-sm text-cyan-950'>
          <strong>{isChinese ? '月成本预览：' : 'Monthly cost preview: '}</strong>
          {preview.monthlyCost === null ? (isChinese ? '不做推测' : 'Not normalized') : `${form.currency} ${preview.monthlyCost.toFixed(2)}`}
          <p className='mt-1 text-xs leading-5 text-cyan-800'>
            {isChinese ? '只根据你输入的账单折算，不读取官网标价。一次性或未知周期不会伪造月成本。' : 'Calculated only from your bill, never public list pricing. One-time and unknown periods stay unnormalized.'}
          </p>
        </div>

        <div className='mt-5 flex flex-wrap gap-3'>
          <button type='submit' disabled={isPending} className='inline-flex items-center gap-2 rounded-xl bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-800 disabled:opacity-60'>
            {isPending ? <Loader2 className='size-4 animate-spin' /> : form.id ? <Pencil className='size-4' /> : <Plus className='size-4' />}
            {isPending ? (isChinese ? '正在保存…' : 'Saving...') : form.id ? (isChinese ? '保存修改' : 'Save changes') : (isChinese ? '加入 AI Stack' : 'Add to AI Stack')}
          </button>
          {form.id ? <button type='button' disabled={isPending} onClick={reset} className='rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700'>{isChinese ? '取消编辑' : 'Cancel edit'}</button> : null}
        </div>
      </form>

      <section className='space-y-4'>
        <div className='rounded-3xl border border-slate-200 bg-slate-950 p-5 text-white shadow-sm md:p-6'>
          <p className='text-xs font-bold uppercase tracking-[0.16em] text-cyan-300'>{isChinese ? '当前 Stack' : 'Current Stack'}</p>
          <div className='mt-3 flex items-end justify-between gap-4'>
            <div><p className='text-4xl font-bold'>{items.length}</p><p className='mt-1 text-sm text-slate-300'>{isChinese ? '个真实记录的工具' : 'tools recorded'}</p></div>
            <p className='max-w-xs text-right text-xs leading-5 text-slate-400'>{isChinese ? '这些数据仅用于你的审计和试用决策，不会写回公开工具页。' : 'This private data is used only for your audits and trial decisions.'}</p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className='rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center'>
            <h2 className='text-lg font-bold text-slate-950'>{isChinese ? '先加入一个你正在使用的工具' : 'Add the first tool you actually use'}</h2>
            <p className='mt-2 text-sm text-slate-600'>{isChinese ? '有了真实成本、频率和任务，下一阶段的 Keep / Replace / Remove 才有依据。' : 'Real cost, frequency, and task data make the later Keep / Replace / Remove audit meaningful.'}</p>
          </div>
        ) : items.map((item) => (
          <article key={item.id} className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
            <div className='flex items-start justify-between gap-4'>
              <div>
                <div className='flex flex-wrap gap-2 text-xs font-semibold'>
                  <span className='rounded-full bg-cyan-50 px-2.5 py-1 text-cyan-800'>{item.subscriptionStatus}</span>
                  <span className='rounded-full bg-slate-100 px-2.5 py-1 text-slate-700'>{item.usageFrequency}</span>
                  {item.taskName ? <span className='rounded-full bg-amber-50 px-2.5 py-1 text-amber-800'>{item.taskName}</span> : null}
                </div>
                <h2 className='mt-3 text-xl font-bold text-slate-950'>{item.title}</h2>
                <p className='mt-1 text-sm text-slate-500'>{item.toolId ? (isChinese ? '目录工具' : 'Listed tool') : item.customToolUrl || (isChinese ? '自定义工具' : 'Custom tool')}</p>
              </div>
              <div className='flex gap-2'>
                <button type='button' disabled={isPending} onClick={() => edit(item)} aria-label={isChinese ? '编辑' : 'Edit'} className='rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50'><Pencil className='size-4' /></button>
                <button type='button' disabled={isPending} onClick={() => remove(item.id)} aria-label={isChinese ? '删除' : 'Delete'} className='rounded-lg border border-rose-200 p-2 text-rose-600 hover:bg-rose-50'><Trash2 className='size-4' /></button>
              </div>
            </div>
            <div className='mt-4 grid gap-3 sm:grid-cols-3'>
              <div className='rounded-xl bg-slate-50 p-3'><p className='text-xs text-slate-500'>{isChinese ? '原始账单' : 'Original bill'}</p><p className='mt-1 font-bold text-slate-950'>{item.billingAmount === null ? '—' : `${item.currency} ${item.billingAmount.toFixed(2)} / ${item.billingPeriod}`}</p></div>
              <div className='rounded-xl bg-cyan-50 p-3'><p className='text-xs text-cyan-700'>{isChinese ? '折算月成本' : 'Monthly estimate'}</p><p className='mt-1 font-bold text-cyan-950'>{item.monthlyCost === null ? '—' : `${item.currency} ${item.monthlyCost.toFixed(2)}`}</p></div>
              <div className='rounded-xl bg-slate-50 p-3'><p className='text-xs text-slate-500'>{isChinese ? '下次续费' : 'Next renewal'}</p><p className='mt-1 font-bold text-slate-950'>{item.renewsAt ? item.renewsAt.slice(0, 10) : '—'}</p></div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
