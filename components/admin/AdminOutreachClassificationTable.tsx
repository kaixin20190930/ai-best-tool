'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';

import {
  updateOutreachStatus,
  type AdminOutreachClassificationItem,
  type OutreachClosedReason,
} from '@/app/actions/admin/tools';
import { useRouter } from '@/app/navigation';

type AdminOutreachClassificationTableProps = {
  items: AdminOutreachClassificationItem[];
  locale: string;
};

const closedReasonLabelMap: Record<OutreachClosedReason, string> = {
  claimed: 'Claimed listing',
  no_reply: 'No reply',
  invalid_contact: 'Invalid contact',
  not_interested: 'Not interested',
};

function formatUpdatedAt(value: string | null) {
  if (!value) return 'No outreach update recorded';
  return new Date(value).toLocaleString();
}

function getClaimStatusTone(status: string | null) {
  if (status === 'claimed') return 'bg-emerald-100 text-emerald-700';
  if (status === 'pending') return 'bg-amber-100 text-amber-700';
  if (status === 'rejected') return 'bg-rose-100 text-rose-700';
  return 'bg-slate-100 text-slate-700';
}

export default function AdminOutreachClassificationTable({
  items,
  locale,
}: AdminOutreachClassificationTableProps) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [closedReasonById, setClosedReasonById] = useState<Record<string, string>>(() =>
    Object.fromEntries(items.map((item) => [item.id, item.claimStatus === 'claimed' ? 'claimed' : ''])),
  );

  const handleSave = async (item: AdminOutreachClassificationItem) => {
    const closedReason = closedReasonById[item.id] || '';
    if (!closedReason) {
      toast.error('Choose the close outcome before saving.');
      return;
    }

    setPendingId(item.id);
    const result = await updateOutreachStatus({
      toolId: item.id,
      status: 'closed',
      note: item.outreachNote || '',
      closedReason: closedReason as OutreachClosedReason,
      nextFollowUpAt: null,
    });
    setPendingId(null);

    if (result.success) {
      toast.success('Close outcome classified.');
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to classify close outcome.');
    }
  };

  return (
    <div className='overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm'>
      <table className='min-w-full divide-y divide-slate-200'>
        <thead className='bg-slate-50'>
          <tr>
            <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500'>Tool</th>
            <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500'>Claim</th>
            <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500'>Last note</th>
            <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500'>Close outcome</th>
            <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500'>Actions</th>
          </tr>
        </thead>
        <tbody className='divide-y divide-slate-100 bg-white'>
          {items.map((item) => {
            const isPending = pendingId === item.id;

            return (
              <tr key={item.id}>
                <td className='px-4 py-4 align-top'>
                  <div>
                    <p className='text-sm font-medium text-slate-900'>{item.title}</p>
                    <p className='mt-1 text-xs text-slate-500'>{item.name}</p>
                    <p className='mt-2 text-xs text-slate-500'>{formatUpdatedAt(item.outreachUpdatedAt)}</p>
                    {item.outreachUpdatedByEmail && (
                      <p className='mt-1 text-xs text-slate-500'>Updated by {item.outreachUpdatedByEmail}</p>
                    )}
                  </div>
                </td>
                <td className='px-4 py-4 align-top'>
                  <div className='space-y-2'>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getClaimStatusTone(item.claimStatus)}`}>
                      {item.claimStatus || 'unclaimed'}
                    </span>
                    <p className='text-xs text-slate-500'>{item.contactEmail || 'No contact email recorded'}</p>
                  </div>
                </td>
                <td className='px-4 py-4 align-top text-sm text-slate-600'>
                  {item.outreachNote ? item.outreachNote : 'No outreach note saved.'}
                </td>
                <td className='px-4 py-4 align-top'>
                  <select
                    value={closedReasonById[item.id] || ''}
                    onChange={(event) =>
                      setClosedReasonById((current) => ({
                        ...current,
                        [item.id]: event.target.value,
                      }))}
                    className='rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700'
                  >
                    <option value=''>Choose result</option>
                    {Object.entries(closedReasonLabelMap).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className='px-4 py-4 align-top'>
                  <div className='flex min-w-[180px] flex-col items-start gap-2 text-xs font-medium'>
                    <button
                      type='button'
                      onClick={() => handleSave(item)}
                      disabled={isPending}
                      className='rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60'
                    >
                      {isPending ? 'Saving...' : 'Save result'}
                    </button>
                    <Link
                      href={`/admin/tools/${item.id}/edit`}
                      className='inline-flex items-center gap-1 text-cyan-700 hover:text-cyan-800'
                    >
                      Review tool
                      <ArrowUpRight className='h-3.5 w-3.5' />
                    </Link>
                    <Link
                      href={`/${locale}/ai/${item.name}`}
                      className='inline-flex items-center gap-1 text-slate-700 hover:text-slate-900'
                    >
                      Open public page
                      <ArrowUpRight className='h-3.5 w-3.5' />
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
