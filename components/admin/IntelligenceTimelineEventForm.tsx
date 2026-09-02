'use client';

import { useState, useTransition } from 'react';
import { CalendarCheck2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { createIntelligenceTimelineEvent } from '@/app/actions/admin/intelligence';
import type {
  IntelligenceTimelineEventType,
  IntelligenceTimelineReviewScope,
  IntelligenceTimelineVisibility,
} from '@/lib/services/intelligence/types';

interface VerifiedClaimOption {
  id: string;
  claimType: string;
  claimKey: string;
  sourceUrl: string;
  label: string;
}

interface IntelligenceTimelineEventFormProps {
  profileId: string;
  ownerType: 'tool' | 'distribution_project' | 'site';
  verifiedClaims: VerifiedClaimOption[];
}

function localNow() {
  const date = new Date();
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

export default function IntelligenceTimelineEventForm({
  profileId,
  ownerType,
  verifiedClaims,
}: IntelligenceTimelineEventFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [eventType, setEventType] = useState<IntelligenceTimelineEventType>('reviewed_no_change');
  const [visibility, setVisibility] = useState<IntelligenceTimelineVisibility>(
    ownerType === 'tool' ? 'public' : 'internal',
  );
  const [claimId, setClaimId] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const isFactChange = eventType !== 'reviewed_no_change';

  const handleClaimChange = (nextClaimId: string) => {
    setClaimId(nextClaimId);
    const claim = verifiedClaims.find((item) => item.id === nextClaimId);
    if (claim?.sourceUrl) setSourceUrl(claim.sourceUrl);
  };

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await createIntelligenceTimelineEvent({
        profileId,
        eventType,
        reviewScope: String(formData.get('reviewScope') || 'full') as IntelligenceTimelineReviewScope,
        claimId: isFactChange ? claimId : null,
        title: String(formData.get('title') || ''),
        summary: String(formData.get('summary') || ''),
        oldValue: String(formData.get('oldValue') || ''),
        newValue: String(formData.get('newValue') || ''),
        sourceUrl,
        sourceExcerpt: String(formData.get('sourceExcerpt') || ''),
        visibility,
        occurredAt: String(formData.get('occurredAt') || ''),
        reviewNote: String(formData.get('reviewNote') || ''),
      });

      if (!result.success) {
        toast.error(result.error || 'Unable to save the timeline event.');
        return;
      }

      toast.success(eventType === 'reviewed_no_change' ? 'Review checkpoint recorded.' : 'Confirmed change recorded.');
      router.refresh();
    });
  };

  return (
    <details className='mt-4 rounded-xl border border-cyan-200 bg-white p-4'>
      <summary className='cursor-pointer text-sm font-bold text-cyan-800'>Record a confirmed review</summary>
      <form action={handleSubmit} className='mt-4 space-y-4 border-t border-cyan-100 pt-4'>
        <div className='grid gap-3 md:grid-cols-2'>
          <label htmlFor={`timeline-event-type-${profileId}`} className='text-xs font-semibold text-slate-700'>
            Event type
            <select
              id={`timeline-event-type-${profileId}`}
              value={eventType}
              onChange={(event) => setEventType(event.target.value as IntelligenceTimelineEventType)}
              disabled={isPending}
              className='mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm'
            >
              <option value='reviewed_no_change'>Reviewed, no confirmed change</option>
              <option value='fact_added'>Confirmed fact added</option>
              <option value='fact_changed'>Confirmed fact changed</option>
              <option value='fact_removed'>Confirmed fact removed</option>
            </select>
          </label>
          <label htmlFor={`timeline-review-scope-${profileId}`} className='text-xs font-semibold text-slate-700'>
            Review scope
            <select
              id={`timeline-review-scope-${profileId}`}
              name='reviewScope'
              defaultValue='full'
              disabled={isPending}
              className='mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm'
            >
              <option value='full'>Full product review</option>
              <option value='decision'>Decision guidance</option>
              <option value='fact'>Single fact</option>
            </select>
          </label>
          <label htmlFor={`timeline-visibility-${profileId}`} className='text-xs font-semibold text-slate-700'>
            Visibility
            <select
              id={`timeline-visibility-${profileId}`}
              value={visibility}
              onChange={(event) => setVisibility(event.target.value as IntelligenceTimelineVisibility)}
              disabled={isPending}
              className='mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm'
            >
              <option value='internal'>Internal review record</option>
              <option value='public' disabled={ownerType !== 'tool'}>
                Public tool timeline
              </option>
            </select>
          </label>
          <label htmlFor={`timeline-occurred-at-${profileId}`} className='text-xs font-semibold text-slate-700'>
            Review/change date
            <input
              id={`timeline-occurred-at-${profileId}`}
              name='occurredAt'
              type='datetime-local'
              defaultValue={localNow()}
              disabled={isPending}
              required
              className='mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm'
            />
          </label>
        </div>

        {isFactChange ? (
          <label htmlFor={`timeline-claim-${profileId}`} className='block text-xs font-semibold text-slate-700'>
            Verified claim
            <select
              id={`timeline-claim-${profileId}`}
              value={claimId}
              onChange={(event) => handleClaimChange(event.target.value)}
              disabled={isPending}
              required
              className='mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm'
            >
              <option value=''>Select a verified, conflict-free claim</option>
              {verifiedClaims.map((claim) => (
                <option key={claim.id} value={claim.id}>
                  {claim.claimType} · {claim.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <div className='grid gap-3 md:grid-cols-2'>
          <label htmlFor={`timeline-title-${profileId}`} className='text-xs font-semibold text-slate-700'>
            Title
            <input id={`timeline-title-${profileId}`} name='title' required disabled={isPending} className='mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm' />
          </label>
          <label htmlFor={`timeline-source-url-${profileId}`} className='text-xs font-semibold text-slate-700'>
            Evidence URL
            <input
              id={`timeline-source-url-${profileId}`}
              name='sourceUrl'
              type='url'
              value={sourceUrl}
              onChange={(event) => setSourceUrl(event.target.value)}
              required={visibility === 'public'}
              disabled={isPending}
              className='mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm'
            />
          </label>
        </div>

        <label htmlFor={`timeline-summary-${profileId}`} className='block text-xs font-semibold text-slate-700'>
          Review summary
          <textarea id={`timeline-summary-${profileId}`} name='summary' required rows={2} disabled={isPending} className='mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm' />
        </label>

        {isFactChange ? (
          <div className='grid gap-3 md:grid-cols-2'>
            <label htmlFor={`timeline-old-value-${profileId}`} className='text-xs font-semibold text-slate-700'>
              Previous value (JSON)
              <textarea id={`timeline-old-value-${profileId}`} name='oldValue' rows={3} disabled={isPending} placeholder='null or {"price":"$19"}' className='mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-xs' />
            </label>
            <label htmlFor={`timeline-new-value-${profileId}`} className='text-xs font-semibold text-slate-700'>
              New value (JSON)
              <textarea id={`timeline-new-value-${profileId}`} name='newValue' rows={3} disabled={isPending} placeholder='{"price":"$29"}' className='mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-xs' />
            </label>
          </div>
        ) : null}

        <div className='grid gap-3 md:grid-cols-2'>
          <label htmlFor={`timeline-source-excerpt-${profileId}`} className='text-xs font-semibold text-slate-700'>
            Source excerpt
            <textarea id={`timeline-source-excerpt-${profileId}`} name='sourceExcerpt' rows={2} disabled={isPending} className='mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm' />
          </label>
          <label htmlFor={`timeline-review-note-${profileId}`} className='text-xs font-semibold text-slate-700'>
            Editorial note
            <textarea id={`timeline-review-note-${profileId}`} name='reviewNote' rows={2} disabled={isPending} className='mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm' />
          </label>
        </div>

        <div className='flex flex-wrap items-center justify-between gap-3'>
          <p className='text-xs text-slate-500'>Machine differences cannot submit this form automatically.</p>
          <button
            type='submit'
            disabled={isPending || (isFactChange && !claimId)}
            className='inline-flex min-w-44 items-center justify-center gap-2 rounded-lg bg-cyan-800 px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-55'
          >
            {isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : <CalendarCheck2 className='h-4 w-4' />}
            {isPending ? 'Recording review...' : 'Record timeline event'}
          </button>
        </div>
      </form>
    </details>
  );
}
