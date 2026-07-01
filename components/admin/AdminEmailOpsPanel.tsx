'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Mail, RefreshCcw } from 'lucide-react';

import { sendClaimInvitesBySystem, sendFeaturedRenewalRemindersBySystem } from '@/app/actions/admin/tools';

type JobState = {
  status: 'idle' | 'running' | 'success' | 'error';
  message: string;
};

type EmailOpsSummary = {
  success: boolean;
  claimInvitesSent24h: number;
  claimInvitesLastSentAt: string | null;
  featuredRenewalsSent24h: number;
  featuredRenewalsLastSentAt: string | null;
  error?: string;
};

const initialJobState: JobState = {
  status: 'idle',
  message: '',
};

function formatLastSent(value: string | null) {
  if (!value) return 'never';

  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function getRecencyLabel(value: string | null) {
  if (!value) return 'Due now';

  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return 'Due now';

  const hoursSince = (Date.now() - timestamp) / (60 * 60 * 1000);
  if (hoursSince >= 24) return 'Due now';
  if (hoursSince >= 12) return 'Soon';
  return 'Recent';
}

function getClaimInviteNextStep(summary: EmailOpsSummary) {
  if (!summary.success) return 'Summary unavailable. Check the system health first.';
  if (summary.claimInvitesSent24h === 0) return 'Send claim invites now to reactivate warm owners.';
  if (summary.claimInvitesSent24h < 10) return 'Low volume today. Consider one more invite run.';
  return 'Claim invites are moving. Check the queue for new replies.';
}

function getRenewalNextStep(summary: EmailOpsSummary) {
  if (!summary.success) return 'Summary unavailable. Check the system health first.';
  if (summary.featuredRenewalsSent24h === 0) return 'Send renewal reminders for expiring featured windows.';
  if (summary.featuredRenewalsSent24h < 10) return 'Low renewal volume today. Recheck expiring placements.';
  return 'Renewal reminders are moving. Review response follow-up.';
}

export default function AdminEmailOpsPanel({ summary }: { summary: EmailOpsSummary }) {
  const [isPending, startTransition] = useTransition();
  const [claimInviteState, setClaimInviteState] = useState<JobState>(initialJobState);
  const [renewalState, setRenewalState] = useState<JobState>(initialJobState);

  const runClaimInvites = () => {
    startTransition(async () => {
      setClaimInviteState({ status: 'running', message: 'Sending claim invites...' });
      const result = await sendClaimInvitesBySystem();

      if (result.success) {
        setClaimInviteState({
          status: 'success',
          message: `Sent ${result.sent} invite${result.sent === 1 ? '' : 's'} and skipped ${result.skipped}.`,
        });
        return;
      }

      setClaimInviteState({
        status: 'error',
        message: result.error || 'Failed to send claim invites.',
      });
    });
  };

  const runRenewalReminders = () => {
    startTransition(async () => {
      setRenewalState({ status: 'running', message: 'Sending featured renewal reminders...' });
      const result = await sendFeaturedRenewalRemindersBySystem();

      if (result.success) {
        setRenewalState({
          status: 'success',
          message: `Sent ${result.sent} reminder${result.sent === 1 ? '' : 's'} and skipped ${result.skipped}.`,
        });
        return;
      }

      setRenewalState({
        status: 'error',
        message: result.error || 'Failed to send featured renewal reminders.',
      });
    });
  };

  return (
    <div className='space-y-4'>
      {!summary.success && (
        <div className='rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800'>
          {summary.error || 'Email ops summary is currently unavailable.'}
        </div>
      )}
      <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>Email ops snapshot</p>
            <p className='mt-1 text-sm leading-6 text-slate-600'>
              Keep the two recurring jobs visible so claim follow-up and featured renewals stay on schedule.
            </p>
          </div>
          <div className='flex flex-wrap gap-2 text-xs font-semibold text-slate-600'>
            <span className='rounded-full bg-cyan-50 px-3 py-1 ring-1 ring-cyan-100'>
              {summary.claimInvitesSent24h} claim invites in 24h
            </span>
            <span className='rounded-full bg-amber-50 px-3 py-1 ring-1 ring-amber-100'>
              {summary.featuredRenewalsSent24h} renewal reminders in 24h
            </span>
            <span className='rounded-full bg-slate-100 px-3 py-1'>
              Claim last sent: {formatLastSent(summary.claimInvitesLastSentAt)}
            </span>
            <span className='rounded-full bg-slate-100 px-3 py-1'>
              Renewal last sent: {formatLastSent(summary.featuredRenewalsLastSentAt)}
            </span>
          </div>
        </div>
      </div>
      <div className='grid gap-4 lg:grid-cols-2'>
        <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
          <div className='flex items-start justify-between gap-3'>
            <div>
              <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>Claim invites</p>
              <h3 className='mt-1 text-lg font-bold text-slate-950'>Re-activate warm owners</h3>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                Send claim follow-ups to tools that already have a contact but are still unclaimed.
              </p>
            </div>
            <Mail className='size-5 text-cyan-700' />
          </div>
          <div className='mt-4 grid gap-3 sm:grid-cols-2'>
            <div className='rounded-xl border border-slate-200 bg-slate-50 p-3'>
              <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Last 24h</p>
              <p className='mt-1 text-lg font-bold text-slate-950'>{summary.claimInvitesSent24h}</p>
              <p className='text-xs text-slate-500'>Sent claim invites</p>
            </div>
            <div className='rounded-xl border border-slate-200 bg-slate-50 p-3'>
              <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Last sent</p>
              <p className='mt-1 text-xs font-semibold text-slate-950'>
                {formatLastSent(summary.claimInvitesLastSentAt)}
              </p>
              <p className='text-xs text-slate-500'>Claim invite job</p>
            </div>
          </div>
          <div className='mt-3 inline-flex rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-cyan-700 ring-1 ring-cyan-100'>
            {getRecencyLabel(summary.claimInvitesLastSentAt)}
          </div>
          <div className='mt-4 rounded-xl bg-cyan-50 px-4 py-3 text-sm leading-6 text-slate-700'>
            <span className='font-semibold text-cyan-900'>Next step: </span>
            {getClaimInviteNextStep(summary)}
          </div>
          <button
            type='button'
            onClick={runClaimInvites}
            disabled={isPending || claimInviteState.status === 'running'}
            className='mt-4 inline-flex items-center justify-center rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-2.5 text-sm font-semibold text-cyan-700 hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-60'
          >
            {claimInviteState.status === 'running' ? 'Sending...' : 'Send claim invites now'}
          </button>
          {claimInviteState.message && (
            <div className='mt-3 space-y-2' aria-live='polite'>
              <p
                className={`text-sm leading-6 ${
                  claimInviteState.status === 'error' ? 'text-rose-700' : 'text-slate-600'
                }`}
              >
                {claimInviteState.message}
              </p>
              <div className='flex flex-wrap gap-2 text-xs font-semibold'>
                <Link
                  href='/admin/claims'
                  className='rounded-full bg-slate-100 px-3 py-1.5 text-slate-700 hover:bg-slate-200'
                >
                  Open claim queue
                </Link>
                <Link
                  href='/admin/email-ops'
                  className='rounded-full bg-cyan-50 px-3 py-1.5 text-cyan-700 ring-1 ring-cyan-100 hover:bg-cyan-100'
                >
                  Stay on email ops
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
          <div className='flex items-start justify-between gap-3'>
            <div>
              <p className='text-sm font-semibold uppercase tracking-wide text-amber-700'>Featured renewals</p>
              <h3 className='mt-1 text-lg font-bold text-slate-950'>Prompt expiring featured windows</h3>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                Reach tools whose featured window is about to end and remind them to renew from My Submissions.
              </p>
            </div>
            <RefreshCcw className='size-5 text-amber-700' />
          </div>
          <div className='mt-4 grid gap-3 sm:grid-cols-2'>
            <div className='rounded-xl border border-slate-200 bg-slate-50 p-3'>
              <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Last 24h</p>
              <p className='mt-1 text-lg font-bold text-slate-950'>{summary.featuredRenewalsSent24h}</p>
              <p className='text-xs text-slate-500'>Sent renewal reminders</p>
            </div>
            <div className='rounded-xl border border-slate-200 bg-slate-50 p-3'>
              <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Last sent</p>
              <p className='mt-1 text-xs font-semibold text-slate-950'>
                {formatLastSent(summary.featuredRenewalsLastSentAt)}
              </p>
              <p className='text-xs text-slate-500'>Renewal reminder job</p>
            </div>
          </div>
          <div className='mt-3 inline-flex rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-100'>
            {getRecencyLabel(summary.featuredRenewalsLastSentAt)}
          </div>
          <div className='mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm leading-6 text-slate-700'>
            <span className='font-semibold text-amber-900'>Next step: </span>
            {getRenewalNextStep(summary)}
          </div>
          <button
            type='button'
            onClick={runRenewalReminders}
            disabled={isPending || renewalState.status === 'running'}
            className='mt-4 inline-flex items-center justify-center rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-700 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60'
          >
            {renewalState.status === 'running' ? 'Sending...' : 'Send renewal reminders now'}
          </button>
          {renewalState.message && (
            <div className='mt-3 space-y-2' aria-live='polite'>
              <p
                className={`text-sm leading-6 ${renewalState.status === 'error' ? 'text-rose-700' : 'text-slate-600'}`}
              >
                {renewalState.message}
              </p>
              <div className='flex flex-wrap gap-2 text-xs font-semibold'>
                <Link
                  href='/profile/submissions'
                  className='rounded-full bg-slate-100 px-3 py-1.5 text-slate-700 hover:bg-slate-200'
                >
                  Open submissions
                </Link>
                <Link
                  href='/admin/email-ops'
                  className='rounded-full bg-amber-50 px-3 py-1.5 text-amber-700 ring-1 ring-amber-100 hover:bg-amber-100'
                >
                  Stay on email ops
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
