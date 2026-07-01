'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';

import {
  updateOutreachStatus,
  type AdminOutreachQueueItem,
  type OutreachClosedReason,
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
const closedReasonLabelMap: Record<OutreachClosedReason, string> = {
  claimed: 'Claimed listing',
  no_reply: 'No reply',
  invalid_contact: 'Invalid contact',
  not_interested: 'Not interested',
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

function getFollowUpTiming(value: string | null): { label: string; className: string } | null {
  if (!value) return null;

  const target = new Date(value);
  if (Number.isNaN(target.getTime())) return null;

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const diffDays = Math.round((startOfTarget.getTime() - startOfToday.getTime()) / (24 * 60 * 60 * 1000));

  if (diffDays < 0) {
    return {
      label: `Overdue since ${startOfTarget.toLocaleDateString()}`,
      className: 'bg-rose-100 text-rose-700',
    };
  }

  if (diffDays === 0) {
    return {
      label: 'Follow up today',
      className: 'bg-amber-100 text-amber-700',
    };
  }

  return {
    label: `Next follow-up ${startOfTarget.toLocaleDateString()}`,
    className: 'bg-slate-100 text-slate-700',
  };
}

function getSuggestionLabel(suggestion: AdminOutreachQueueItem['suggestion']) {
  if (suggestion === 'featured_pitch') return 'Featured pitch';
  if (suggestion === 'content_collab') return 'Content collab';
  return 'Claim listing';
}

function getNextStepLabel(item: AdminOutreachQueueItem) {
  if (item.outreachStatus === 'closed' && item.outreachClosedReason === 'claimed') {
    return 'Owner confirmed. Move to claim cleanup.';
  }

  if (item.outreachStatus === 'closed') {
    return 'Closed out. Keep for future reactivation only.';
  }

  if (item.outreachStatus === 'follow_up_due') {
    return 'Follow up now and update the note.';
  }

  if (item.suggestion === 'featured_pitch') {
    return 'Pitch featured placement while traffic is already present.';
  }

  if (item.suggestion === 'content_collab') {
    return 'Use engagement signals to start a collaboration conversation.';
  }

  return 'Send a claim invite and confirm the owner email.';
}

export default function AdminOutreachQueueTable({ items, locale }: AdminOutreachQueueTableProps) {
  const router = useRouter();
  const isChinese = locale === 'cn' || locale === 'tw';
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [notesById, setNotesById] = useState<Record<string, string>>(() =>
    Object.fromEntries(items.map((item) => [item.id, item.outreachNote || ''])),
  );
  const [followUpById, setFollowUpById] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      items.map((item) => [item.id, item.outreachNextFollowUpAt ? item.outreachNextFollowUpAt.slice(0, 10) : '']),
    ),
  );
  const [closedReasonById, setClosedReasonById] = useState<Record<string, string>>(() =>
    Object.fromEntries(items.map((item) => [item.id, item.outreachClosedReason || ''])),
  );

  useEffect(() => {
    setPendingId(null);
    setNotesById(Object.fromEntries(items.map((item) => [item.id, item.outreachNote || ''])));
    setFollowUpById(
      Object.fromEntries(
        items.map((item) => [item.id, item.outreachNextFollowUpAt ? item.outreachNextFollowUpAt.slice(0, 10) : '']),
      ),
    );
    setClosedReasonById(Object.fromEntries(items.map((item) => [item.id, item.outreachClosedReason || ''])));
  }, [items]);

  const copyText = async (text: string, successMessage: string, errorMessage: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(successMessage);
    } catch {
      toast.error(errorMessage);
    }
  };

  const copyContactBatch = async () => {
    if (items.length === 0) {
      toast.error('No outreach items in the current batch.');
      return;
    }

    const text = items
      .map(
        (item, index) => `${index + 1}. ${item.contactEmail} — ${item.title} (${getSuggestionLabel(item.suggestion)})`,
      )
      .join('\n');
    await copyText(text, `Copied ${items.length} contact${items.length === 1 ? '' : 's'}.`, 'Failed to copy contacts.');
  };

  const copyBatchDraft = async () => {
    if (items.length === 0) {
      toast.error('No outreach items in the current batch.');
      return;
    }

    const topItems = items.slice(0, 8);
    const text = [
      isChinese
        ? `Subject: [AI Best Tool] 外联批次跟进（${topItems.length} 条）`
        : `Subject: [AI Best Tool] Outreach batch follow-up (${topItems.length} lead${topItems.length === 1 ? '' : 's'})`,
      '',
      isChinese ? '你好,' : 'Hi,',
      '',
      isChinese
        ? '我们正在跟进一批看起来适合认领、前排展示或合作联系的条目。'
        : 'We are reaching out about a few listings that look like a strong fit for claim, featured, or collaboration follow-up.',
      isChinese ? '当前批次如下：' : 'Here is the current batch:',
      '',
      ...topItems.map((item) =>
        [
          `${isChinese ? '•' : '-'} ${item.title}`,
          `  ${isChinese ? '邮箱' : 'Email'}: ${item.contactEmail}`,
          `  ${isChinese ? '建议' : 'Suggestion'}: ${getSuggestionLabel(item.suggestion)}`,
          `  ${isChinese ? '下一步' : 'Next step'}: ${getNextStepLabel(item)}`,
          '',
        ].join('\n'),
      ),
      isChinese ? '谢谢，' : 'Best,',
      'AI Best Tool',
    ].join('\n');

    await copyText(text, 'Copied batch outreach draft.', 'Failed to copy batch draft.');
  };

  const copyClaimBatchDraft = async () => {
    const claimItems = items.filter((item) => item.suggestion === 'claim_listing');
    if (claimItems.length === 0) {
      toast.error('No claim invite leads in the current batch.');
      return;
    }

    const topItems = claimItems.slice(0, 8);
    const text = [
      isChinese
        ? `Subject: [AI Best Tool] 认领跟进（${topItems.length} 条）`
        : `Subject: [AI Best Tool] Claim follow-up (${topItems.length} lead${topItems.length === 1 ? '' : 's'})`,
      '',
      isChinese ? '你好,' : 'Hi,',
      '',
      isChinese
        ? '我们找到几条看起来还未认领的条目，想确认一下正确的 owner 联系方式。'
        : 'We found a few listings that still look unclaimed, and we wanted to confirm the right owner contact.',
      isChinese
        ? '如果其中有一条属于你，请回复这封邮件，我们会继续处理：'
        : 'If one of these belongs to you, reply and we will continue from there:',
      '',
      ...topItems.map((item) =>
        [
          `${isChinese ? '•' : '-'} ${item.title}`,
          `  ${isChinese ? '邮箱' : 'Email'}: ${item.contactEmail}`,
          `  ${isChinese ? '下一步' : 'Next step'}: ${getNextStepLabel(item)}`,
          '',
        ].join('\n'),
      ),
      isChinese ? '谢谢，' : 'Best,',
      'AI Best Tool',
    ].join('\n');

    await copyText(text, 'Copied claim batch draft.', 'Failed to copy claim draft.');
  };

  const copyFeaturedBatchDraft = async () => {
    const featuredItems = items.filter((item) => item.suggestion === 'featured_pitch');
    if (featuredItems.length === 0) {
      toast.error('No featured pitch leads in the current batch.');
      return;
    }

    const topItems = featuredItems.slice(0, 8);
    const text = [
      isChinese
        ? `Subject: [AI Best Tool] 前排展示跟进（${topItems.length} 条）`
        : `Subject: [AI Best Tool] Featured placement follow-up (${topItems.length} lead${topItems.length === 1 ? '' : 's'})`,
      '',
      isChinese ? '你好,' : 'Hi,',
      '',
      isChinese
        ? '这些条目已经开始有流量，前排展示会是一个比较顺手的下一步。'
        : 'These listings are already getting traffic, so a featured placement could be a straightforward next step.',
      isChinese ? '当前批次里信号最强的条目如下：' : 'Here are the highest-signal entries in this batch:',
      '',
      ...topItems.map((item) =>
        [
          `${isChinese ? '•' : '-'} ${item.title}`,
          `  ${isChinese ? '邮箱' : 'Email'}: ${item.contactEmail}`,
          `  ${isChinese ? '下一步' : 'Next step'}: ${getNextStepLabel(item)}`,
          '',
        ].join('\n'),
      ),
      isChinese ? '谢谢，' : 'Best,',
      'AI Best Tool',
    ].join('\n');

    await copyText(text, 'Copied featured pitch draft.', 'Failed to copy featured pitch draft.');
  };

  const copyShortClaimDraft = async () => {
    const claimItems = items.filter((item) => item.suggestion === 'claim_listing');
    if (claimItems.length === 0) {
      toast.error('No claim invite leads in the current batch.');
      return;
    }

    const topItems = claimItems.slice(0, 5);
    const text = [
      isChinese ? '认领短版：' : 'Short claim draft:',
      isChinese
        ? '你好，我们在确认这几条列表的 owner：'
        : 'Hi, we are confirming the owner contact for a few listings:',
      '',
      ...topItems.map((item) => `${isChinese ? '•' : '-'} ${item.title} · ${item.contactEmail}`),
      '',
      isChinese
        ? '如果其中一条属于你，请回复我。'
        : 'If one of these belongs to you, please reply and we will continue.',
    ].join('\n');

    await copyText(text, 'Copied short claim draft.', 'Failed to copy short claim draft.');
  };

  const copyShortFeaturedDraft = async () => {
    const featuredItems = items.filter((item) => item.suggestion === 'featured_pitch');
    if (featuredItems.length === 0) {
      toast.error('No featured pitch leads in the current batch.');
      return;
    }

    const topItems = featuredItems.slice(0, 5);
    const text = [
      isChinese ? '前排短版：' : 'Short featured draft:',
      isChinese
        ? '你好，这几条已经有流量，前排可能是顺手的下一步：'
        : 'Hi, these listings already have traffic and featured placement may be the next step:',
      '',
      ...topItems.map((item) => `${isChinese ? '•' : '-'} ${item.title} · ${item.contactEmail}`),
      '',
      isChinese ? '如果你愿意，我们可以一起推进。' : 'If you are interested, we can move this forward.',
    ].join('\n');

    await copyText(text, 'Copied short featured draft.', 'Failed to copy short featured draft.');
  };

  const copyDmClaimDraft = async () => {
    const claimItems = items.filter((item) => item.suggestion === 'claim_listing');
    if (claimItems.length === 0) {
      toast.error('No claim invite leads in the current batch.');
      return;
    }

    const topItems = claimItems.slice(0, 3);
    const text = [
      isChinese ? '认领私信：' : 'Claim DM:',
      isChinese ? '你好，想确认一下这几条是否属于你：' : 'Hi, checking whether these listings belong to you:',
      '',
      ...topItems.map((item) => `${isChinese ? '•' : '-'} ${item.title}`),
      '',
      isChinese ? '如果是的话，回我一下就行。' : 'If so, just reply here and I will continue.',
    ].join('\n');

    await copyText(text, 'Copied claim DM.', 'Failed to copy claim DM.');
  };

  const copyDmFeaturedDraft = async () => {
    const featuredItems = items.filter((item) => item.suggestion === 'featured_pitch');
    if (featuredItems.length === 0) {
      toast.error('No featured pitch leads in the current batch.');
      return;
    }

    const topItems = featuredItems.slice(0, 3);
    const text = [
      isChinese ? '前排私信：' : 'Featured DM:',
      isChinese
        ? '你好，这几条已经开始有流量，前排可能是个合适的下一步：'
        : 'Hi, these listings already have traffic and featured could be a good next step:',
      '',
      ...topItems.map((item) => `${isChinese ? '•' : '-'} ${item.title}`),
      '',
      isChinese ? '如果你愿意，我们可以继续聊。' : 'If you are interested, we can keep going.',
    ].join('\n');

    await copyText(text, 'Copied featured DM.', 'Failed to copy featured DM.');
  };

  const handleStatusChange = async (toolId: string, status: OutreachStatus) => {
    const closedReason = closedReasonById[toolId] || '';
    if (status === 'closed' && !closedReason) {
      toast.error('Choose a closed result before marking this outreach as closed.');
      return;
    }

    setPendingId(toolId);
    const result = await updateOutreachStatus({
      toolId,
      status,
      note: notesById[toolId] || '',
      nextFollowUpAt: followUpById[toolId] || null,
      closedReason: status === 'closed' ? (closedReason as OutreachClosedReason) : null,
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
    const closedReason = closedReasonById[toolId] || '';
    if (currentStatus === 'closed' && !closedReason) {
      toast.error('Add a closed result so we know how this outreach ended.');
      return;
    }

    setPendingId(toolId);
    const result = await updateOutreachStatus({
      toolId,
      status: currentStatus,
      note: notesById[toolId] || '',
      nextFollowUpAt: followUpById[toolId] || null,
      closedReason: currentStatus === 'closed' ? (closedReason as OutreachClosedReason) : null,
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
      <div className='flex flex-col gap-3 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <p className='text-sm font-semibold text-slate-900'>Batch actions</p>
          <p className='mt-1 text-sm text-slate-500'>
            Copy the current batch contacts or a short draft for fast outreach.
          </p>
        </div>
        <div className='flex flex-col gap-2'>
          <div className='flex flex-wrap gap-2'>
            <button
              type='button'
              onClick={copyContactBatch}
              className='rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50'
            >
              Copy contacts
            </button>
            <button
              type='button'
              onClick={copyBatchDraft}
              className='rounded-lg bg-cyan-700 px-3 py-2 text-xs font-semibold text-white hover:bg-cyan-800'
            >
              Copy batch draft
            </button>
          </div>
          <div className='flex flex-wrap gap-2'>
            <button
              type='button'
              onClick={copyClaimBatchDraft}
              className='rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100'
            >
              Copy claim draft
            </button>
            <button
              type='button'
              onClick={copyShortClaimDraft}
              className='rounded-lg border border-emerald-100 bg-white px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50'
            >
              Copy short claim
            </button>
            <button
              type='button'
              onClick={copyDmClaimDraft}
              className='rounded-lg border border-emerald-100 bg-white px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50'
            >
              Copy claim DM
            </button>
          </div>
          <div className='flex flex-wrap gap-2'>
            <button
              type='button'
              onClick={copyFeaturedBatchDraft}
              className='rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-800 hover:bg-violet-100'
            >
              Copy featured draft
            </button>
            <button
              type='button'
              onClick={copyShortFeaturedDraft}
              className='rounded-lg border border-violet-100 bg-white px-3 py-2 text-xs font-semibold text-violet-700 hover:bg-violet-50'
            >
              Copy short featured
            </button>
            <button
              type='button'
              onClick={copyDmFeaturedDraft}
              className='rounded-lg border border-violet-100 bg-white px-3 py-2 text-xs font-semibold text-violet-700 hover:bg-violet-50'
            >
              Copy featured DM
            </button>
          </div>
        </div>
      </div>
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
              const followUpTiming = getFollowUpTiming(item.outreachNextFollowUpAt);

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
                    <span className='rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700'>
                      {getSuggestionLabel(item.suggestion)}
                    </span>
                    <p className='mt-2 text-xs leading-5 text-slate-500'>{getNextStepLabel(item)}</p>
                  </td>
                  <td className='px-4 py-4 align-top'>
                    <div className='min-w-[240px]'>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadgeClasses(item.outreachStatus)}`}
                      >
                        {statusLabelMap[item.outreachStatus]}
                      </span>
                      <p className='mt-2 text-xs text-slate-500'>{formatUpdatedAt(item.outreachUpdatedAt)}</p>
                      {item.outreachUpdatedByEmail && (
                        <p className='mt-1 text-xs text-slate-500'>Updated by {item.outreachUpdatedByEmail}</p>
                      )}
                      {followUpTiming && (
                        <div
                          className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${followUpTiming.className}`}
                        >
                          {followUpTiming.label}
                        </div>
                      )}
                      {item.outreachStatus === 'closed' && item.outreachClosedReason && (
                        <div className='mt-2 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700'>
                          {closedReasonLabelMap[item.outreachClosedReason]}
                        </div>
                      )}
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
                            }))
                          }
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
                              }))
                            }
                            className='rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700'
                          />
                          <select
                            value={closedReasonById[item.id] || ''}
                            onChange={(event) =>
                              setClosedReasonById((current) => ({
                                ...current,
                                [item.id]: event.target.value,
                              }))
                            }
                            className='rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700'
                          >
                            <option value=''>Closed result</option>
                            {Object.entries(closedReasonLabelMap).map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
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
