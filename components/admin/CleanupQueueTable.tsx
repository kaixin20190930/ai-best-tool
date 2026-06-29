'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';

type CleanupQueueItem = {
  id: string;
  name: string;
  title: string;
  updatedAt: string;
  blockers: string[];
};

type CleanupQueueTableProps = {
  items: CleanupQueueItem[];
  locale: string;
  isChinese: boolean;
  forceHideProcessed?: boolean;
};

const storageKey = 'cleanup-processed-items-v1';

function readStoredIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((value) => typeof value === 'string'));
  } catch {
    return new Set();
  }
}

function getHideCompletedLabel(forceHideProcessed: boolean, isChinese: boolean): string {
  if (forceHideProcessed) {
    return isChinese ? '超级聚焦中已锁定隐藏已处理' : 'Completed items hidden in super focus';
  }

  return isChinese ? '隐藏已处理' : 'Hide completed';
}

function getProcessedButtonLabel(isDone: boolean, isChinese: boolean): string {
  if (isChinese) {
    return isDone ? '已处理' : '标记已处理';
  }

  return isDone ? 'Done' : 'Mark done';
}

export default function CleanupQueueTable({
  items,
  locale,
  isChinese,
  forceHideProcessed = false,
}: CleanupQueueTableProps) {
  const [processedIds, setProcessedIds] = useState<Set<string>>(() => new Set());
  const [hideProcessed, setHideProcessed] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProcessedIds(readStoredIds());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !hydrated) return;
    window.localStorage.setItem(storageKey, JSON.stringify(Array.from(processedIds)));
  }, [hydrated, processedIds]);

  useEffect(() => {
    if (typeof window === 'undefined') return () => {};
    const handleProcessedUpdate = () => {
      setProcessedIds(readStoredIds());
    };

    window.addEventListener('cleanup-processed-updated', handleProcessedUpdate);
    return () => {
      window.removeEventListener('cleanup-processed-updated', handleProcessedUpdate);
    };
  }, []);

  const visibleItems = useMemo(
    () => items.filter((item) => !((forceHideProcessed || hideProcessed) && processedIds.has(item.id))),
    [items, forceHideProcessed, hideProcessed, processedIds],
  );

  const persistProcessedIds = (next: Set<string>) => {
    setProcessedIds(next);
    window.localStorage.setItem(storageKey, JSON.stringify(Array.from(next)));
    window.dispatchEvent(new Event('cleanup-processed-updated'));
  };

  const toggleProcessed = (id: string) => {
    const next = new Set(processedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    persistProcessedIds(next);
  };

  const markVisibleDone = () => {
    const next = new Set(processedIds);
    visibleItems.forEach((item) => next.add(item.id));
    persistProcessedIds(next);
  };

  const clearCompleted = () => {
    persistProcessedIds(new Set());
  };

  if (visibleItems.length === 0) {
    return (
      <div className='px-5 py-10 text-center'>
        <div className='mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700'>
          <CheckCircle2 className='size-6' />
        </div>
        <p className='mt-4 text-base font-semibold text-slate-950'>
          {isChinese ? '当前没有待补资料条目。' : 'No cleanup items right now.'}
        </p>
        <p className='mt-2 text-sm leading-6 text-slate-600'>
          {isChinese
            ? '你可以去工具页继续检查其他状态，或者回到分析页看整体漏斗。'
            : 'You can continue in the tools page or return to analytics to review the broader funnel.'}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className='flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-3'>
        <label htmlFor='cleanup-hide-processed' className='flex items-center gap-2 text-sm font-medium text-slate-700'>
          <input
            id='cleanup-hide-processed'
            type='checkbox'
            checked={forceHideProcessed || hideProcessed}
            onChange={(event) => setHideProcessed(event.target.checked)}
            disabled={forceHideProcessed}
            className='rounded border-slate-300 text-rose-700 focus:ring-rose-200'
          />
          {getHideCompletedLabel(forceHideProcessed, isChinese)}
        </label>
        <div className='flex items-center gap-2'>
          <p className='text-xs font-medium text-slate-500'>
            {isChinese
              ? `显示 ${visibleItems.length} 条 / 共 ${items.length} 条`
              : `${visibleItems.length} shown / ${items.length} total`}
          </p>
          <button
            type='button'
            onClick={markVisibleDone}
            disabled={visibleItems.length === 0}
            className='rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50'
          >
            {isChinese ? '标记当前可见为已处理' : 'Mark visible done'}
          </button>
          <button
            type='button'
            onClick={clearCompleted}
            className='rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50'
          >
            {isChinese ? '清空已处理' : 'Clear completed'}
          </button>
        </div>
      </div>

      <table className='min-w-full divide-y divide-slate-200'>
        <thead className='bg-slate-50'>
          <tr>
            <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500'>
              {isChinese ? '条目' : 'Tool'}
            </th>
            <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500'>
              {isChinese ? '阻塞项' : 'Blockers'}
            </th>
            <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500'>
              {isChinese ? '更新时间' : 'Updated'}
            </th>
            <th className='px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500'>
              {isChinese ? '操作' : 'Action'}
            </th>
          </tr>
        </thead>
        <tbody className='divide-y divide-slate-100 bg-white'>
          {visibleItems.map((item) => {
            const isDone = processedIds.has(item.id);

            return (
              <tr key={item.id} className={isDone ? 'bg-emerald-50/40' : ''}>
                <td className='px-4 py-4 align-top'>
                  <div className={isDone ? 'opacity-70' : ''}>
                    <p className='text-sm font-semibold text-slate-950'>{item.title}</p>
                    <p className='mt-1 text-xs text-slate-500'>{item.name}</p>
                  </div>
                </td>
                <td className='px-4 py-4 align-top'>
                  <div className='flex flex-wrap gap-2'>
                    {item.blockers.map((blocker) => (
                      <span
                        key={blocker}
                        className='inline-flex rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700'
                      >
                        {blocker}
                      </span>
                    ))}
                  </div>
                </td>
                <td className='px-4 py-4 align-top text-sm text-slate-600'>
                  {new Date(item.updatedAt).toLocaleString()}
                </td>
                <td className='px-4 py-4 text-right align-top'>
                  <div className='inline-flex flex-col items-end gap-2 text-sm font-medium'>
                    <button
                      type='button'
                      onClick={() => toggleProcessed(item.id)}
                      className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 ${
                        isDone
                          ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {getProcessedButtonLabel(isDone, isChinese)}
                    </button>
                    <Link
                      href={`/admin/tools/${item.id}/edit`}
                      className='inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-rose-700 hover:bg-rose-100'
                    >
                      {isChinese ? '去修复' : 'Fix in editor'}
                      <ArrowUpRight className='size-4' />
                    </Link>
                    <Link
                      href={`/${locale}/ai/${item.name}`}
                      className='inline-flex items-center gap-1 text-slate-700 hover:text-slate-900'
                    >
                      {isChinese ? '打开前台' : 'Open listing'}
                      <ArrowUpRight className='size-4' />
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
