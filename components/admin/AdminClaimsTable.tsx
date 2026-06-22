'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

import { updateToolClaimStatus, type AdminToolClaim } from '@/app/actions/admin/claims';

type AdminClaimsTableProps = {
  claims: AdminToolClaim[];
};

const statusLabelMap: Record<AdminToolClaim['status'], string> = {
  new: 'New',
  contacted: 'Contacted',
  claimed: 'Claimed',
  invalid: 'Invalid',
};

function getStatusBadgeClasses(status: AdminToolClaim['status']): string {
  if (status === 'claimed') return 'bg-emerald-100 text-emerald-700';
  if (status === 'contacted') return 'bg-cyan-100 text-cyan-700';
  if (status === 'invalid') return 'bg-rose-100 text-rose-700';
  return 'bg-slate-100 text-slate-700';
}

function getActionButtonClasses(status: 'contacted' | 'claimed' | 'invalid'): string {
  if (status === 'claimed') return 'bg-emerald-600 text-white hover:bg-emerald-700';
  if (status === 'contacted') return 'bg-cyan-600 text-white hover:bg-cyan-700';
  return 'bg-rose-600 text-white hover:bg-rose-700';
}

function formatDate(value: string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleString();
}

export default function AdminClaimsTable({ claims }: AdminClaimsTableProps) {
  const [pendingId, setPendingId] = useState<string | null>(null);

  const handleStatusChange = async (claim: AdminToolClaim, status: AdminToolClaim['status']) => {
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

  return (
    <div className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
      <div className='border-b border-slate-200 px-5 py-4'>
        <h2 className='text-base font-semibold text-slate-950'>Claim Leads</h2>
        <p className='mt-1 text-sm text-slate-600'>Review incoming owner requests and move them through the queue.</p>
      </div>
      {claims.length === 0 ? (
        <div className='px-5 py-8 text-sm text-slate-500'>No claims found.</div>
      ) : (
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-slate-200 text-sm'>
            <thead className='bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500'>
              <tr>
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

                return (
                  <tr key={claim.id} className='align-top'>
                    <td className='px-4 py-4'>
                      <div className='font-semibold text-slate-950'>{claim.listingName}</div>
                      <div className='mt-1 text-xs text-slate-500'>
                        {claim.toolName ? (
                          <Link href={`/admin/tools?search=${encodeURIComponent(claim.toolName)}`} className='text-cyan-700 hover:underline'>
                            Linked tool: {claim.toolName}
                          </Link>
                        ) : (
                          'No linked tool'
                        )}
                      </div>
                    </td>
                    <td className='px-4 py-4 text-slate-700'>
                      <div>{claim.email}</div>
                      {claim.company && <div className='mt-1 text-xs text-slate-500'>{claim.company}</div>}
                      {claim.website && (
                        <a className='mt-1 block text-xs text-cyan-700 hover:underline' href={claim.website} target='_blank' rel='noreferrer'>
                          {claim.website}
                        </a>
                      )}
                    </td>
                    <td className='px-4 py-4 text-slate-600'>
                      <div className='text-xs'>{claim.sourceLocale || '-'}</div>
                      <div className='mt-1 text-xs'>{claim.sourcePath || '-'}</div>
                      <div className='mt-2 text-xs text-slate-500'>
                        {claim.note || 'No note'}
                      </div>
                    </td>
                    <td className='px-4 py-4'>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadgeClasses(claim.status)}`}
                      >
                        {statusLabelMap[claim.status]}
                      </span>
                      <div className='mt-2 text-xs text-slate-500'>
                        Claimed at: {formatDate(claim.claimedAt)}
                      </div>
                      <div className='mt-1 text-xs text-slate-500'>
                        Reviewed at: {formatDate(claim.reviewedAt)}
                      </div>
                    </td>
                    <td className='px-4 py-4 text-xs text-slate-500'>
                      {formatDate(claim.updatedAt)}
                    </td>
                    <td className='px-4 py-4'>
                      <div className='flex flex-wrap gap-2'>
                        {(['contacted', 'claimed', 'invalid'] as const).map((status) => (
                          <button
                            key={status}
                            type='button'
                            onClick={() => handleStatusChange(claim, status)}
                            disabled={isPending}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${getActionButtonClasses(status)} disabled:cursor-not-allowed disabled:opacity-60`}
                          >
                            {isPending ? 'Saving...' : statusLabelMap[status]}
                          </button>
                        ))}
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
