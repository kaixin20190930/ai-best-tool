'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import {
  linkReviewedGeminiEvidence,
  linkReviewedPerplexityEvidence,
  submitEvidenceDecision,
} from '@/app/actions/admin/evidenceReview';

export function EvidenceReviewControls({
  claim,
}: {
  claim: {
    id: string;
    sourceExcerpt: string | null;
    verificationNote: string | null;
    validityScope: Record<string, unknown>;
    reviewDueAt: string | null;
  };
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [feedback, setFeedback] = useState('');
  const submit = (decision: 'PASS' | 'HOLD', form: HTMLFormElement) => {
    const fields = new FormData(form);
    start(async () => {
      const result = await submitEvidenceDecision({
        claimId: claim.id,
        decision,
        excerpt: String(fields.get('excerpt') || ''),
        note: String(fields.get('note') || ''),
        scope: String(fields.get('scope') || '{}'),
        reviewDueAt: String(fields.get('due') || ''),
      });
      setFeedback(result.success ? result.message || 'Saved.' : result.error || 'Review failed.');
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else toast.error(result.error);
    });
  };
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit('PASS', event.currentTarget);
      }}
      className='mt-3 space-y-3'
    >
      <label className='block text-xs font-semibold'>
        Verified source excerpt
        <textarea
          name='excerpt'
          defaultValue={claim.sourceExcerpt || ''}
          rows={3}
          disabled={pending}
          className='mt-1 w-full rounded-lg border p-2 text-sm'
          placeholder='Paste the exact passage you checked on the source page.'
        />
      </label>
      <label className='block text-xs font-semibold'>
        Scope (JSON)
        <textarea
          name='scope'
          defaultValue={JSON.stringify(claim.validityScope || {}, null, 2)}
          rows={2}
          disabled={pending}
          className='mt-1 w-full rounded-lg border p-2 font-mono text-xs'
        />
      </label>
      <label className='block text-xs font-semibold'>
        Review note
        <textarea
          name='note'
          defaultValue={claim.verificationNote || ''}
          rows={2}
          disabled={pending}
          className='mt-1 w-full rounded-lg border p-2 text-sm'
          placeholder='Explain what you checked or why this remains on HOLD.'
        />
      </label>
      <label className='block text-xs font-semibold'>
        Next review
        <input
          type='date'
          name='due'
          defaultValue={
            claim.reviewDueAt?.slice(0, 10) || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
          }
          disabled={pending}
          className='mt-1 block rounded-lg border p-2 text-sm'
        />
      </label>
      <div className='flex gap-2'>
        <button
          disabled={pending}
          type='submit'
          className='rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-50'
        >
          {pending ? 'Saving…' : 'PASS claim'}
        </button>
        <button
          disabled={pending}
          type='button'
          onClick={(event) => submit('HOLD', event.currentTarget.form!)}
          className='rounded-lg bg-amber-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-50'
        >
          {pending ? 'Saving…' : 'HOLD claim'}
        </button>
      </div>
      {feedback && (
        <p role='status' className='text-xs text-slate-700'>
          {feedback}
        </p>
      )}
    </form>
  );
}

export function GeminiLinkReviewButton() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [feedback, setFeedback] = useState('');
  return (
    <div className='space-y-2'>
      <button
        type='button'
        disabled={pending}
        onClick={() =>
          start(async () => {
            const result = await linkReviewedGeminiEvidence();
            setFeedback(result.success ? result.message || 'Links reviewed.' : result.error || 'Link review failed.');
            if (result.success) {
              toast.success(result.message);
              router.refresh();
            } else toast.error(result.error);
          })
        }
        className='rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white disabled:opacity-50'
      >
        {pending ? 'Reviewing and linking…' : '审核并建立关系 · Review and link'}
      </button>
      {feedback && (
        <p role='status' className='text-xs text-slate-700'>
          {feedback}
        </p>
      )}
    </div>
  );
}

export function PerplexityLinkReviewButton() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [feedback, setFeedback] = useState('');
  return (
    <div className='space-y-2'>
      <button
        type='button'
        disabled={pending}
        onClick={() =>
          start(async () => {
            const result = await linkReviewedPerplexityEvidence();
            setFeedback(result.success ? result.message || 'Links reviewed.' : result.error || 'Link review failed.');
            if (result.success) {
              toast.success(result.message);
              router.refresh();
            } else toast.error(result.error);
          })
        }
        className='rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white disabled:opacity-50'
      >
        {pending ? 'Reviewing and linking…' : '审核并建立关系 · Review and link'}
      </button>
      {feedback && (
        <p role='status' className='text-xs text-slate-700'>
          {feedback}
        </p>
      )}
    </div>
  );
}
