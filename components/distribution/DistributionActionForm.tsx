'use client';

import type { FormEvent, ReactNode } from 'react';
import { createContext, useContext, useRef, useState } from 'react';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type DistributionActionResult = {
  success?: boolean;
  error?: string;
  taskId?: string;
} | void;
type DistributionAction = (formData: FormData) => Promise<DistributionActionResult>;

type DistributionActionCenterStatus = 'running' | 'success' | 'error';
type DistributionActionCenterPayload = {
  id: string;
  label: string;
  status: DistributionActionCenterStatus;
  message?: string;
  updatedAt: number;
};

const DISTRIBUTION_ACTION_CENTER_EVENT = 'distribution:action-center';
const DISTRIBUTION_ACTION_STORAGE_KEY = 'distribution-action-center-state';

const DistributionFormStateContext = createContext<{ submitting: boolean; succeeded: boolean } | null>(null);

const actionLabelFallback = 'distribution operation';

function createActionId(label: string) {
  const safeLabel = (label || actionLabelFallback).trim().replace(/\s+/g, '-').slice(0, 20);
  const randomId = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Math.random()).slice(2);
  return `${safeLabel}-${randomId}`;
}

function pruneActionCenterState(entries: DistributionActionCenterPayload[]) {
  const now = Date.now();
  return entries.filter((entry) => {
    if (entry.status === 'running') return true;
    return now - entry.updatedAt < 12 * 60 * 60 * 1000;
  });
}

function loadActionCenterState(): DistributionActionCenterPayload[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(DISTRIBUTION_ACTION_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as DistributionActionCenterPayload[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeActionCenterState(entries: DistributionActionCenterPayload[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DISTRIBUTION_ACTION_STORAGE_KEY, JSON.stringify(entries));
}

function withActionState(
  entries: DistributionActionCenterPayload[],
  actionId: string,
  status: DistributionActionCenterStatus,
  message: string | undefined,
): DistributionActionCenterPayload[] {
  return pruneActionCenterState(entries).map((entry): DistributionActionCenterPayload => {
    if (entry.id !== actionId) return entry;

    return {
      ...entry,
      status,
      message,
      updatedAt: Date.now(),
    };
  });
}

function announceActionCenter(payload: Omit<DistributionActionCenterPayload, 'updatedAt'>) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(DISTRIBUTION_ACTION_CENTER_EVENT, { detail: payload }));
}

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
  onSuccess,
  refresh = true,
  operationLabel,
}: {
  action: DistributionAction;
  children: ReactNode;
  className?: string;
  successMessage?: string;
  feedbackClassName?: string;
  onSuccess?: (result: DistributionActionResult) => void;
  refresh?: boolean;
  operationLabel?: string;
}) {
  const router = useRouter();
  const refreshTimer = useRef<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const operationName = operationLabel || actionLabelFallback;
    const operationId = createActionId(operationName);

    setSubmitting(true);
    setFeedback(null);

    const startPayload: DistributionActionCenterPayload = {
      id: operationId,
      label: operationName,
      status: 'running',
      message: 'processing',
      updatedAt: Date.now(),
    };

    if (typeof window !== 'undefined') {
      const next = pruneActionCenterState(loadActionCenterState());
      next.push(startPayload);
      writeActionCenterState(next);
      announceActionCenter({
        id: operationId,
        label: operationName,
        status: 'running',
        message: 'processing',
      });
    }

    try {
      const result = await action(new FormData(event.currentTarget));
        if (result && result.success === false) {
        const message = result.error || 'The update could not be completed. Please try again.';
        setFeedback({ type: 'error', message });
        toast.error(message);

        if (typeof window !== 'undefined') {
          const next = withActionState(pruneActionCenterState(loadActionCenterState()), operationId, 'error', message);
          writeActionCenterState(next);
          announceActionCenter({ id: operationId, label: operationName, status: 'error', message });
        }
        return;
      }

      setFeedback({ type: 'success', message: successMessage });
      toast.success(successMessage);
      onSuccess?.(result);

      if (typeof window !== 'undefined') {
        const next = withActionState(pruneActionCenterState(loadActionCenterState()), operationId, 'success', successMessage)
          .filter((entry) => !(entry.id === operationId && entry.status === 'success'));
        writeActionCenterState(next);
        announceActionCenter({ id: operationId, label: operationName, status: 'success', message: successMessage });
      }

      if (refresh) {
        refreshTimer.current = window.setTimeout(() => router.refresh(), 700);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'The update could not be completed. Please try again.';
      setFeedback({
        type: 'error',
        message,
      });
      toast.error(message);

      if (typeof window !== 'undefined') {
        const next = withActionState(pruneActionCenterState(loadActionCenterState()), operationId, 'error', message);
        writeActionCenterState(next);
        announceActionCenter({ id: operationId, label: operationName, status: 'error', message });
      }
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
              feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
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
