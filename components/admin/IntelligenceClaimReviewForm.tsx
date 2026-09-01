'use client';

import { useState, useTransition } from 'react';
import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { reviewIntelligenceClaim } from '@/app/actions/admin/intelligence';
import type {
  IntelligenceConflictStatus,
  IntelligenceSourceType,
  IntelligenceVerificationStatus,
} from '@/lib/services/intelligence/types';

interface IntelligenceClaimReviewFormProps {
  claim: {
    id: string;
    sourceType?: IntelligenceSourceType;
    verificationStatus?: IntelligenceVerificationStatus;
    conflictStatus: IntelligenceConflictStatus;
    verifiedAt?: string | null;
    verificationNote?: string | null;
    reviewDueAt?: string | null;
    expiresAt: string | null;
    invalidationReason?: string | null;
    validityScope?: Record<string, unknown>;
  };
}

function toDateTimeLocal(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export default function IntelligenceClaimReviewForm({ claim }: IntelligenceClaimReviewFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [nextStatus, setNextStatus] = useState<IntelligenceVerificationStatus>(
    claim.verificationStatus || 'candidate',
  );
  const hasConflict = claim.conflictStatus !== 'none';
  const currentStatus = claim.verificationStatus || 'candidate';
  const allowedNextStatuses: Record<IntelligenceVerificationStatus, IntelligenceVerificationStatus[]> = {
    candidate: ['candidate', 'verified', 'rejected'],
    verified: ['verified', 'superseded'],
    rejected: ['rejected', 'candidate'],
    superseded: ['superseded', 'candidate'],
  };

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await reviewIntelligenceClaim({
        claimId: claim.id,
        nextStatus,
        sourceType: String(formData.get('sourceType') || 'official') as IntelligenceSourceType,
        verificationNote: String(formData.get('verificationNote') || ''),
        reviewDueAt: String(formData.get('reviewDueAt') || ''),
        expiresAt: String(formData.get('expiresAt') || ''),
        invalidationReason: String(formData.get('invalidationReason') || ''),
        validityScope: String(formData.get('validityScope') || ''),
      });

      if (!result.success) {
        toast.error(result.error || 'Unable to save the evidence review.');
        return;
      }

      toast.success(`Evidence marked ${nextStatus}.`);
      router.refresh();
    });
  };

  return (
    <form action={handleSubmit} className='mt-4 space-y-4 border-t border-slate-200 pt-4'>
      {hasConflict ? (
        <div className='flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900'>
          <AlertTriangle className='mt-0.5 h-4 w-4 shrink-0' />
          Resolve the <strong>{claim.conflictStatus}</strong> conflict before verification. Saving this form never
          clears conflicts automatically.
        </div>
      ) : null}

      <div className='grid gap-3 md:grid-cols-2'>
        <label htmlFor={`claim-status-${claim.id}`} className='text-xs font-semibold text-slate-700'>
          Review status
          <select
            id={`claim-status-${claim.id}`}
            value={nextStatus}
            onChange={(event) => setNextStatus(event.target.value as IntelligenceVerificationStatus)}
            disabled={isPending}
            className='mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm'
          >
            {allowedNextStatuses[currentStatus].map((status) => (
              <option key={status} value={status} disabled={status === 'verified' && hasConflict}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor={`claim-source-type-${claim.id}`} className='text-xs font-semibold text-slate-700'>
          Source type
          <select
            id={`claim-source-type-${claim.id}`}
            name='sourceType'
            defaultValue={claim.sourceType || 'official'}
            disabled={isPending}
            className='mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm'
          >
            <option value='official'>Official</option>
            <option value='independent'>Independent</option>
            <option value='owner'>Owner supplied</option>
            <option value='user'>User supplied</option>
            <option value='editorial'>Editorial</option>
          </select>
        </label>
        <label htmlFor={`claim-review-due-${claim.id}`} className='text-xs font-semibold text-slate-700'>
          Review due
          <input
            id={`claim-review-due-${claim.id}`}
            name='reviewDueAt'
            type='datetime-local'
            defaultValue={toDateTimeLocal(claim.reviewDueAt)}
            disabled={isPending}
            className='mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm'
          />
        </label>
        <label htmlFor={`claim-expiry-${claim.id}`} className='text-xs font-semibold text-slate-700'>
          Known expiry
          <input
            id={`claim-expiry-${claim.id}`}
            name='expiresAt'
            type='datetime-local'
            defaultValue={toDateTimeLocal(claim.expiresAt)}
            disabled={isPending}
            className='mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm'
          />
        </label>
      </div>

      <label htmlFor={`claim-note-${claim.id}`} className='block text-xs font-semibold text-slate-700'>
        Verification or rejection note
        <textarea
          id={`claim-note-${claim.id}`}
          name='verificationNote'
          defaultValue={claim.verificationNote || ''}
          disabled={isPending}
          rows={2}
          placeholder='What was checked, on which source, and what the evidence supports.'
          className='mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm'
        />
      </label>

      <label htmlFor={`claim-scope-${claim.id}`} className='block text-xs font-semibold text-slate-700'>
        Validity scope (JSON)
        <textarea
          id={`claim-scope-${claim.id}`}
          name='validityScope'
          defaultValue={JSON.stringify(claim.validityScope || {}, null, 2)}
          disabled={isPending}
          rows={3}
          className='mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-xs'
        />
      </label>

      {nextStatus === 'superseded' ? (
        <label htmlFor={`claim-invalidation-${claim.id}`} className='block text-xs font-semibold text-slate-700'>
          Invalidation reason
          <textarea
            id={`claim-invalidation-${claim.id}`}
            name='invalidationReason'
            defaultValue={claim.invalidationReason || ''}
            disabled={isPending}
            rows={2}
            className='mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm'
          />
        </label>
      ) : (
        <input type='hidden' name='invalidationReason' value='' />
      )}

      <div className='flex flex-wrap items-center justify-between gap-3'>
        <p className='text-xs text-slate-500'>
          {claim.verifiedAt ? `Last verified ${new Date(claim.verifiedAt).toLocaleString()}` : 'Not yet verified'}
        </p>
        <button
          type='submit'
          disabled={isPending || (nextStatus === 'verified' && hasConflict)}
          className='inline-flex min-w-36 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-55'
        >
          {isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : <CheckCircle2 className='h-4 w-4' />}
          {isPending ? 'Saving review...' : 'Save review'}
        </button>
      </div>
    </form>
  );
}
