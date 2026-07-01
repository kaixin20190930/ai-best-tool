'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

import { updateToolClaimStatus, type AdminToolClaim } from '@/app/actions/admin/claims';

type AdminToolClaimWithReason = AdminToolClaim & {
  claimReason?: string | null;
};

type AdminClaimsTableProps = {
  claims: AdminToolClaimWithReason[];
};

const statusLabelMap: Record<AdminToolClaimWithReason['status'], string> = {
  new: 'New',
  contacted: 'Contacted',
  claimed: 'Claimed',
  invalid: 'Invalid',
};

function getStatusBadgeClasses(status: AdminToolClaimWithReason['status']): string {
  if (status === 'claimed') return 'bg-emerald-100 text-emerald-700';
  if (status === 'contacted') return 'bg-cyan-100 text-cyan-700';
  if (status === 'invalid') return 'bg-rose-100 text-rose-700';
  return 'bg-slate-100 text-slate-700';
}

function getActionButtonClasses(status: 'contacted' | 'claimed' | 'invalid'): string {
  if (status === 'claimed') return 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100';
  if (status === 'contacted') return 'border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100';
  return 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100';
}

function formatDate(value: string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleString();
}

function formatClaimReason(reason: string | null) {
  if (!reason) return 'No reason';
  if (reason === 'ownership_update') return 'Ownership update';
  if (reason === 'profile_correction') return 'Profile correction';
  if (reason === 'duplicate_merge') return 'Duplicate merge';
  if (reason === 'agency_client') return 'Agency / client';
  if (reason === 'other') return 'Other';
  return reason;
}

function getClaimReasonTone(reason: string | null) {
  if (reason === 'ownership_update') return 'bg-emerald-100 text-emerald-700';
  if (reason === 'profile_correction') return 'bg-cyan-100 text-cyan-700';
  if (reason === 'duplicate_merge') return 'bg-amber-100 text-amber-700';
  if (reason === 'agency_client') return 'bg-violet-100 text-violet-700';
  if (reason === 'other') return 'bg-slate-100 text-slate-700';
  if (!reason) return 'bg-slate-100 text-slate-600';
  return 'bg-slate-100 text-slate-700';
}

function isOlderThanHours(value: string | null, hours: number) {
  if (!value) return false;

  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) {
    return false;
  }

  return Date.now() - timestamp >= hours * 60 * 60 * 1000;
}

function getNextStepLabel(claim: AdminToolClaimWithReason): string {
  if (claim.status === 'claimed') {
    return 'Confirm the owner link and move on to cleanup.';
  }

  if (claim.status === 'contacted') {
    return 'Wait for a reply or send a short follow-up.';
  }

  if (claim.status === 'invalid') {
    return 'Close the loop and keep the note for history.';
  }

  if (claim.claimReason === 'ownership_update') {
    return 'Open the linked tool and treat this as a priority owner lead.';
  }

  if (claim.claimReason === 'agency_client') {
    return 'Check the company contact and follow up fast.';
  }

  if (claim.claimReason === 'duplicate_merge') {
    return 'Verify whether this maps to an existing listing.';
  }

  if (isOlderThanHours(claim.createdAt, 48)) {
    return 'Handle this overdue lead first.';
  }

  return 'Copy a draft and respond while the lead is still fresh.';
}

export default function AdminClaimsTable({ claims }: AdminClaimsTableProps) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const selectedClaims = useMemo(() => claims.filter((claim) => selectedIds.includes(claim.id)), [claims, selectedIds]);
  const allSelected = claims.length > 0 && selectedIds.length === claims.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

  const handleStatusChange = async (claim: AdminToolClaimWithReason, status: AdminToolClaimWithReason['status']) => {
    setPendingId(claim.id);
    const result = await updateToolClaimStatus({
      claimId: claim.id,
      status,
      toolId: claim.toolId,
      ownerEmail: claim.email,
    });

    setPendingId(null);

    if (result.success) {
      toast.success(`Marked ${claim.listingName} as ${statusLabelMap[status].toLowerCase()}.`);
    } else {
      toast.error(result.error || 'Failed to update claim status.');
    }
  };

  const toggleSelected = (claimId: string) => {
    setSelectedIds((current) =>
      current.includes(claimId) ? current.filter((id) => id !== claimId) : [...current, claimId],
    );
  };

  const toggleAll = () => {
    setSelectedIds((current) => (current.length === claims.length ? [] : claims.map((claim) => claim.id)));
  };

  const copyClaimDraft = async (claim: AdminToolClaimWithReason) => {
    const title = claim.listingName || 'Unnamed listing';
    const text = [
      `Follow up: ${title}`,
      `Email: ${claim.email}`,
      `Company: ${claim.company || '-'}`,
      `Website: ${claim.website || '-'}`,
      `Reason: ${formatClaimReason(claim.claimReason)}`,
      `Source: ${claim.sourcePath || '-'}`,
      '',
      `Hi ${claim.company || title},`,
      `We reviewed your claim request for ${title}.`,
      'If you need to update ownership or listing details, please reply here and we will continue from there.',
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      toast.success(`Copied follow-up draft for ${title}.`);
    } catch {
      toast.error('Failed to copy follow-up draft.');
    }
  };

  const buildClaimMailto = (claim: AdminToolClaimWithReason) => {
    const title = claim.listingName || 'Unnamed listing';
    const subject = encodeURIComponent(`[AI Best Tool] Follow-up on ${title}`);
    const body = encodeURIComponent(
      [
        `Hi ${claim.company || title},`,
        '',
        `We reviewed your claim request for ${title}.`,
        `Reason: ${formatClaimReason(claim.claimReason)}`,
        `Source: ${claim.sourcePath || '-'}`,
        '',
        'If you need to update ownership or listing details, reply here and we will continue from there.',
      ].join('\n'),
    );

    return `mailto:${encodeURIComponent(claim.email)}?subject=${subject}&body=${body}`;
  };

  const handleBulkStatusChange = async (status: 'contacted' | 'claimed' | 'invalid') => {
    if (selectedClaims.length === 0) return;

    setPendingId('bulk');
    const results = await Promise.all(
      selectedClaims.map((claim) =>
        updateToolClaimStatus({
          claimId: claim.id,
          status,
          toolId: claim.toolId,
          ownerEmail: claim.email,
        }),
      ),
    );
    const updatedCount = results.filter((result) => result.success).length;
    const failedCount = results.length - updatedCount;

    setPendingId(null);

    if (failedCount === 0) {
      toast.success(`Updated ${updatedCount} claims to ${statusLabelMap[status].toLowerCase()}.`);
      setSelectedIds([]);
    } else {
      toast.error(`Updated ${updatedCount} claims, ${failedCount} failed.`);
    }
  };

  return (
    <div className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
      <div className='border-b border-slate-200 px-5 py-4'>
        <h2 className='text-base font-semibold text-slate-950'>Claim Leads</h2>
        <p className='mt-1 text-sm text-slate-600'>Review incoming owner requests and move them through the queue.</p>
      </div>
      <div className='flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4'>
        <div className='text-sm text-slate-600'>
          {selectedIds.length > 0 ? `${selectedIds.length} selected` : 'Select claims to bulk update'}
        </div>
        <div className='flex flex-wrap gap-2'>
          <button
            type='button'
            onClick={() => handleBulkStatusChange('contacted')}
            disabled={!someSelected || pendingId === 'bulk'}
            className='rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-700 hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-60'
          >
            Mark contacted
          </button>
          <button
            type='button'
            onClick={() => handleBulkStatusChange('claimed')}
            disabled={!someSelected || pendingId === 'bulk'}
            className='rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60'
          >
            Mark claimed
          </button>
          <button
            type='button'
            onClick={() => handleBulkStatusChange('invalid')}
            disabled={!someSelected || pendingId === 'bulk'}
            className='rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60'
          >
            Mark invalid
          </button>
        </div>
      </div>
      {selectedIds.length > 0 && (
        <div className='border-b border-cyan-100 bg-cyan-50 px-5 py-3 text-sm text-cyan-900'>
          <span className='font-semibold'>{selectedClaims.length} selected.</span>{' '}
          {selectedClaims.some((claim) => claim.status === 'new')
            ? 'Use bulk contact first if these are still new.'
            : 'Use the bulk action that matches the current claim state.'}
        </div>
      )}
      {claims.length === 0 ? (
        <div className='px-5 py-8 text-sm text-slate-500'>No claims found.</div>
      ) : (
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-slate-200 text-sm'>
            <thead className='bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500'>
              <tr>
                <th className='px-4 py-3 font-semibold'>
                  <input
                    type='checkbox'
                    checked={allSelected}
                    onChange={toggleAll}
                    className='size-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500'
                    aria-label='Select all claims'
                  />
                </th>
                <th className='px-4 py-3 font-semibold'>Listing</th>
                <th className='px-4 py-3 font-semibold'>Contact</th>
                <th className='px-4 py-3 font-semibold'>Source</th>
                <th className='px-4 py-3 font-semibold'>Status</th>
                <th className='px-4 py-3 font-semibold'>Updated</th>
                <th className='px-4 py-3 font-semibold'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-200'>
              {claims.map((claim) => {
                const isPending = pendingId === claim.id;
                const overdueNew = claim.status === 'new' && isOlderThanHours(claim.createdAt, 48);
                const freshNew = claim.status === 'new' && !isOlderThanHours(claim.createdAt, 24);

                return (
                  <tr key={claim.id} className='align-top'>
                    <td className='px-4 py-4'>
                      <input
                        type='checkbox'
                        checked={selectedIds.includes(claim.id)}
                        onChange={() => toggleSelected(claim.id)}
                        className='mt-1 size-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500'
                        aria-label={`Select ${claim.listingName}`}
                      />
                    </td>
                    <td className='px-4 py-4'>
                      <div className='font-semibold text-slate-950'>{claim.listingName}</div>
                      <div className='mt-1 text-xs text-slate-500'>
                        {claim.toolName ? (
                          <Link
                            href={`/admin/tools?search=${encodeURIComponent(claim.toolName)}`}
                            className='text-cyan-700 hover:underline'
                          >
                            Linked tool: {claim.toolName}
                          </Link>
                        ) : (
                          'No linked tool'
                        )}
                      </div>
                      {claim.toolId && (
                        <div className='mt-1 text-xs text-slate-500'>
                          <Link href={`/admin/tools/${claim.toolId}/edit`} className='text-cyan-700 hover:underline'>
                            Open linked tool
                          </Link>
                        </div>
                      )}
                    </td>
                    <td className='px-4 py-4 text-slate-700'>
                      <div>{claim.email}</div>
                      {claim.company && <div className='mt-1 text-xs text-slate-500'>{claim.company}</div>}
                      {claim.website && (
                        <a
                          className='mt-1 block text-xs text-cyan-700 hover:underline'
                          href={claim.website}
                          target='_blank'
                          rel='noreferrer'
                        >
                          {claim.website}
                        </a>
                      )}
                    </td>
                    <td className='px-4 py-4 text-slate-600'>
                      <div className='text-xs'>{claim.sourceLocale || '-'}</div>
                      <div className='mt-1 text-xs'>{claim.sourcePath || '-'}</div>
                      <div className='mt-2'>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getClaimReasonTone(claim.claimReason)}`}
                        >
                          {formatClaimReason(claim.claimReason)}
                        </span>
                      </div>
                      <div className='mt-2 text-xs text-slate-500'>
                        {claim.claimReason ? 'Recorded claim reason' : 'No reason recorded'}
                      </div>
                      <div className='mt-2 text-xs text-slate-500'>{claim.note || 'No note'}</div>
                      <div className='mt-3 rounded-lg bg-white px-3 py-2 text-xs text-slate-600 ring-1 ring-slate-200'>
                        <span className='font-semibold text-slate-700'>Next step:</span> {getNextStepLabel(claim)}
                      </div>
                    </td>
                    <td className='px-4 py-4'>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadgeClasses(claim.status)}`}
                      >
                        {statusLabelMap[claim.status]}
                      </span>
                      {overdueNew && (
                        <div className='mt-2 inline-flex rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700'>
                          Overdue &gt; 48h
                        </div>
                      )}
                      {freshNew && (
                        <div className='mt-2 inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700'>
                          Fresh &lt; 24h
                        </div>
                      )}
                      <div className='mt-2 text-xs text-slate-500'>Claimed at: {formatDate(claim.claimedAt)}</div>
                      <div className='mt-1 text-xs text-slate-500'>Reviewed at: {formatDate(claim.reviewedAt)}</div>
                      {claim.reviewedBy && (
                        <div className='mt-1 text-xs text-slate-500'>
                          Reviewed by: <span className='font-mono'>{claim.reviewedBy.slice(0, 8)}</span>
                        </div>
                      )}
                    </td>
                    <td className='px-4 py-4 text-xs text-slate-500'>{formatDate(claim.updatedAt)}</td>
                    <td className='px-4 py-4'>
                      <div className='flex flex-wrap gap-2'>
                        {(['contacted', 'claimed', 'invalid'] as const).map((status) => (
                          <button
                            key={status}
                            type='button'
                            onClick={() => handleStatusChange(claim, status)}
                            disabled={isPending}
                            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${getActionButtonClasses(status)} disabled:cursor-not-allowed disabled:opacity-60`}
                          >
                            {isPending ? 'Saving...' : statusLabelMap[status]}
                          </button>
                        ))}
                        <button
                          type='button'
                          onClick={() => copyClaimDraft(claim)}
                          className='rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50'
                        >
                          Copy draft
                        </button>
                        <a
                          href={buildClaimMailto(claim)}
                          className='rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-700 hover:bg-cyan-100'
                        >
                          Email draft
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
