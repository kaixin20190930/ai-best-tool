'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import type { DecisionReviewItem, DecisionReviewStatus } from '@/lib/services/admin/decision';
import { transitionDecisionReview } from '@/app/actions/admin/decision';

function actions(item: DecisionReviewItem): DecisionReviewStatus[] {
  if (item.entity === 'task') {
    if (item.status === 'draft') return ['active', 'archived'];
    if (item.status === 'active') return ['archived'];
    return ['draft'];
  }
  if (item.status === 'draft') return ['reviewed'];
  if (item.status === 'reviewed') return ['published', 'draft'];
  if (item.status === 'published') return ['stale'];
  return ['reviewed'];
}

export default function DecisionReviewBoard({ items }: { items: DecisionReviewItem[] }) {
  const [pending, startTransition] = useTransition();
  const [activeId, setActiveId] = useState<string | null>(null);

  const run = (item: DecisionReviewItem, nextStatus: DecisionReviewStatus) => {
    setActiveId(`${item.entity}:${item.id}:${nextStatus}`);
    startTransition(async () => {
      const result = await transitionDecisionReview({ entity: item.entity, id: item.id, nextStatus });
      if (result.success) toast.success(`Status changed to ${nextStatus}.`);
      else toast.error(result.error || 'Unable to update review status.');
      setActiveId(null);
    });
  };

  return (
    <div className='space-y-3'>
      {items.map((item) => (
        <article
          key={`${item.entity}:${item.id}`}
          className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm'
        >
          <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
            <div className='min-w-0'>
              <div className='flex flex-wrap items-center gap-2'>
                <span className='rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold uppercase text-slate-600'>
                  {item.entity}
                </span>
                <span className='rounded-full bg-cyan-50 px-2 py-1 text-xs font-semibold text-cyan-800'>
                  {item.status}
                </span>
                {item.entity !== 'task' ? (
                  <span className='text-xs text-slate-500'>{item.evidenceCount} evidence links</span>
                ) : null}
              </div>
              <h3 className='mt-2 text-base font-bold text-slate-950'>{item.title}</h3>
              <p className='mt-1 text-sm text-slate-600'>{item.context}</p>
              <p className='mt-2 text-xs text-slate-500'>
                Reviewed: {item.reviewedAt ? new Date(item.reviewedAt).toLocaleDateString() : 'not yet'} · Due:{' '}
                {item.reviewDueAt ? new Date(item.reviewDueAt).toLocaleDateString() : 'not scheduled'}
              </p>
            </div>
            <div className='flex flex-wrap gap-2'>
              {actions(item).map((nextStatus) => {
                const key = `${item.entity}:${item.id}:${nextStatus}`;
                const isPending = pending && activeId === key;
                const publishBlocked = nextStatus === 'published' && (item.evidenceCount < 1 || !item.reviewedAt);
                return (
                  <button
                    key={nextStatus}
                    type='button'
                    disabled={pending || publishBlocked}
                    onClick={() => run(item, nextStatus)}
                    title={publishBlocked ? 'Publishing requires human review and verified evidence.' : undefined}
                    className='rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-cyan-400 hover:text-cyan-800 disabled:cursor-not-allowed disabled:opacity-50'
                  >
                    {isPending ? 'Updating...' : nextStatus}
                  </button>
                );
              })}
            </div>
          </div>
        </article>
      ))}
      {items.length === 0 ? (
        <div className='rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600'>
          No decision records match this filter.
        </div>
      ) : null}
    </div>
  );
}
