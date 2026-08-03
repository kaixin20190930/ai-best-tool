'use client';

import type { FormEvent, ReactNode } from 'react';
import { createContext, useContext, useRef, useState } from 'react';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

type DistributionActionResult = { success?: boolean; error?: string } | void;
type DistributionAction = (formData: FormData) => Promise<DistributionActionResult>;

const DistributionFormStateContext = createContext<{ submitting: boolean; succeeded: boolean } | null>(null);

/**
 * Gives every manual distribution write a visible lifecycle instead of relying on
 * the browser's silent server-action redirect.
 */
export function DistributionActionForm({
  action,
  children,
  className,
  successMessage = 'Saved successfully. Refreshing the workspace…',
  feedbackClassName,
}: {
  action: DistributionAction;
  children: ReactNode;
  className?: string;
  successMessage?: string;
  feedbackClassName?: string;
}) {
  const router = useRouter();
  const refreshTimer = useRef<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setFeedback(null);
    try {
      const result = await action(new FormData(event.currentTarget));
      if (result && result.success === false) {
        setFeedback({ type: 'error', message: result.error || 'The update could not be completed. Please try again.' });
        return;
      }

      setFeedback({ type: 'success', message: successMessage });
      refreshTimer.current = window.setTimeout(() => router.refresh(), 700);
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'The update could not be completed. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DistributionFormStateContext.Provider value={{ submitting, succeeded: feedback?.type === 'success' }}>
      <form onSubmit={handleSubmit} className={className} aria-busy={submitting}>
        {children}
        {feedback ? (
          <div
            role={feedback.type === 'error' ? 'alert' : 'status'}
            aria-live='polite'
            className={`mt-3 flex items-start gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800'
                : 'bg-rose-50 text-rose-800'
            } ${feedbackClassName || ''}`}
          >
            {feedback.type === 'success' ? <CheckCircle2 className='mt-0.5 h-4 w-4 shrink-0' /> : <XCircle className='mt-0.5 h-4 w-4 shrink-0' />}
            <span>{feedback.message}</span>
          </div>
        ) : null}
      </form>
    </DistributionFormStateContext.Provider>
  );
}

export function useDistributionFormState() {
  return useContext(DistributionFormStateContext);
}

export function DistributionSubmitButton({
  children,
  pendingLabel,
  className,
  disabled = false,
}: {
  children: ReactNode;
  pendingLabel: string;
  className: string;
  disabled?: boolean;
}) {
  const formState = useDistributionFormState();
  const submitting = formState?.submitting || false;
  return (
    <button type='submit' disabled={disabled || submitting} className={className}>
      {submitting ? <Loader2 className='h-4 w-4 animate-spin' /> : null}
      {submitting ? pendingLabel : children}
    </button>
  );
}
