'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';

import {
  updateOutreachStatus,
  type AdminOutreachQueueItem,
  type OutreachStatus,
} from '@/app/actions/admin/tools';
import { useRouter } from '@/app/navigation';

type AdminOutreachQueueTableProps = {
  items: AdminOutreachQueueItem[];
  locale: string;
};

const statusLabelMap: Record<OutreachStatus, string> = {
  not_started: 'Not started',
  contacted: 'Contacted',
  waiting_reply: 'Waiting reply',
  follow_up_due: 'Follow-up due',
  closed: 'Closed',
};

function getStatusBadgeClasses(status: OutreachStatus): string {
  if (status === 'contacted') return 'bg-cyan-100 text-cyan-700';
  if (status === 'waiting_reply') return 'bg-blue-100 text-blue-700';
  if (status === 'follow_up_due') return 'bg-amber-100 text-amber-700';
  if (status === 'closed') return 'bg-emerald-100 text-emerald-700';
  return 'bg-slate-100 text-slate-700';
}

function formatUpdatedAt(value: string | null) {
  if (!value) return 'No outreach update yet';
  return new Date(value).toLocaleString();
}

function getSuggestionLabel(suggestion: AdminOutreachQueueItem['suggestion']) {
  if (suggestion === 'featured_pitch') return 'Featured pitch';
  if (suggestion === 'content_collab') return 'Content collab';
  return 'Claim listing';
}

export default function AdminOutreachQueueTable({ items, locale }: AdminOutreachQueueTableProps) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [notesById, setNotesById] = useState<Record<string, string>>(() =>
    Object.fromEntries(items.map((item) => [item.id, item.outreachNote || ''])),
  );
  const [followUpById, setFollowUpById] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      items.map((item) => [item.id, item.outreachNextFollowUpAt ? item.outreachNextFollowUpAt.slice(0, 10) : '']),
    ),
  );

  const handleStatusChange = async (toolId: string, status: OutreachStatus) => {
    setPendingId(toolId);
    const result = await updateOutreachStatus({
      toolId,
      status,
      note: notesById[toolId] || '',
      nextFollowUpAt: followUpById[toolId] || null,
    });
    setPendingId(null);

    if (result.success) {
      toast.success(`Outreach marked as ${statusLabelMap[status].toLowerCase()}.`);
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to update outreach status.');
    }
  };

  const handleSaveDetails = async (toolId: string, currentStatus: OutreachStatus) => {
    setPendingId(toolId);
    const result = await updateOutreachStatus({
      toolId,
      status: currentStatus,
      note: notesById[toolId] || '',
      nextFollowUpAt: followUpById[toolId] || null,
    });
    setPendingId(null);

    if (result.success) {
      toast.success('Outreach details saved.');
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to save outreach details.');
    }
  };

  return (
    <div className='overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm'>
      <table className='min-w-full divide-y divide-slate-200'>
        <thead className='bg-slate-50'>
          <tr>
            <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500'>Tool</th>
            <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500'>
              Contact
            </th>
            <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500'>
              Suggestion
            </th>
            <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500'>
              Outreach
            </th>
            <th className='px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500'>
              Signals
            </th>
            <th className='px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500'>
              Priority
            </th>
            <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500'>
              Actions
            </th>
          </tr>
        </thead>
        <tbody className='divide-y divide-slate-100 bg-white'>
          {items.length > 0 ? (
            items.map((item) => {
              const isPending = pendingId === item.id;

              return (
                <tr key={item.id}>
                  <td className='px-4 py-4 align-top'>
                    <div>
                      <p className='text-sm font-medium text-slate-900'>{item.title}</p>
                      <p className='mt-1 text-xs text-slate-500'>{item.name}</p>
                      <p className='mt-2 text-xs leading-5 text-slate-500'>{item.reason}</p>
                    </div>
                  </td>
                  <td className='px-4 py-4 align-top text-sm text-slate-700'>{item.contactEmail}</td>
                  <td className='px-4 py-4 align-top'>
                    <span className='rounded-full px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-700'>
                      {getSuggestionLabel(item.suggestion)}
                    </span>
                  </td>
                  <td className='px-4 py-4 align-top'>
                    <div className='min-w-[240px]'>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadgeClasses(item.outreachStatus)}`}
                      >
                        {statusLabelMap[item.outreachStatus]}
                      </span>
                      <p className='mt-2 text-xs text-slate-500'>{formatUpdatedAt(item.outreachUpdatedAt)}</p>
                      <div className='mt-3 flex flex-wrap gap-2'>
                        {(['contacted', 'waiting_reply', 'follow_up_due', 'closed'] as const).map((status) => (
                          <button
                            key={status}
                            type='button'
                            onClick={() => handleStatusChange(item.id, status)}
                            disabled={isPending}
                            className='rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60'
                          >
                            {isPending ? 'Saving...' : statusLabelMap[status]}
                          </button>
                        ))}
                      </div>
                      <div className='mt-3 space-y-2'>
                        <textarea
                          value={notesById[item.id] || ''}
                          onChange={(event) =>
                            setNotesById((current) => ({
                              ...current,
                              [item.id]: event.target.value,
                            }))}
                          rows={3}
                          placeholder='Add a short outreach note...'
                          className='w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700'
                        />
                        <div className='flex items-center gap-2'>
                          <input
                            type='date'
                            value={followUpById[item.id] || ''}
                            onChange={(event) =>
                              setFollowUpById((current) => ({
                                ...current,
                                [item.id]: event.target.value,
                              }))}
                            className='rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700'
                          />
                          <button
                            type='button'
                            onClick={() => handleSaveDetails(item.id, item.outreachStatus)}
                            disabled={isPending}
                            className='rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60'
                          >
                            {isPending ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className='px-4 py-4 text-right align-top text-sm text-slate-700'>
                    <div>{item.views.toLocaleString()} views</div>
                    <div className='text-xs text-slate-500'>
                      {item.clicks} clicks · {item.favorites} favs · {item.comments} comments
                    </div>
                  </td>
                  <td className='px-4 py-4 text-right align-top'>
                    <div className='inline-flex flex-col items-end gap-1'>
                      <span className='rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700'>
                        {item.priorityScore}
                      </span>
                      <span className='text-xs text-slate-500'>{item.daysSinceUpdate}d since update</span>
                    </div>
                  </td>
                  <td className='px-4 py-4 align-top'>
                    <div className='flex min-w-[160px] flex-col items-start gap-2 text-xs font-medium'>
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
                      <a
                        href={`mailto:${item.contactEmail}`}
                        className='inline-flex items-center gap-1 text-slate-500 hover:text-slate-900'
                      >
                        Draft email
                        <ArrowUpRight className='h-3.5 w-3.5' />
                      </a>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={7} className='px-4 py-8 text-sm text-slate-500'>
                No outreach candidates right now.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
