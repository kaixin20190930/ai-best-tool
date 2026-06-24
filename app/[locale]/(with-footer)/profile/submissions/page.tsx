import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

import { getListingPaymentMailto, listingConfig } from '@/lib/config/listing';
import EmptyState from '@/components/EmptyState';
import { getMySubmittedTools, SubmittedTool } from '@/app/actions/submissions';
import { getMySubmissionEmailPreference } from '@/app/actions/userPreferences';

import SubmissionEmailPreferenceToggle from './SubmissionEmailPreferenceToggle';

export const metadata = {
  title: 'My Submissions - AI Tools',
  description: 'Track your submitted AI tools and review status',
};

function getTitle(tool: SubmittedTool): string {
  if (typeof tool.title === 'string') {
    return tool.title;
  }

  return tool.title.en || tool.title.zh || Object.values(tool.title)[0] || tool.name;
}

function getStatusBadge(status: SubmittedTool['status']) {
  const styles = {
    draft: 'bg-slate-100 text-slate-700',
    pending: 'bg-amber-100 text-amber-800',
    published: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-red-100 text-red-800',
  };

  const labels = {
    draft: 'Draft',
    pending: 'Pending review',
    published: 'Published',
    rejected: 'Rejected',
  };

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function getStatusDescription(status: SubmittedTool['status']) {
  switch (status) {
    case 'published':
      return 'Your tool is live in the public directory.';
    case 'rejected':
      return 'This submission was rejected. You can submit a revised tool later.';
    case 'draft':
      return 'This tool is saved as a draft.';
    case 'pending':
    default:
      return 'Our team is reviewing the tool details before publishing.';
  }
}

function getStatusActionHint(status: SubmittedTool['status']) {
  switch (status) {
    case 'pending':
      return 'Typical review time: 1-3 business days.';
    case 'draft':
      return 'Review your details and resubmit when ready.';
    case 'rejected':
      return 'Improve the description and links, then submit again.';
    case 'published':
    default:
      return 'Your listing is live and discoverable.';
  }
}

type CommercialViewStatus =
  | 'free'
  | 'pending_payment'
  | 'paid_waiting_review'
  | 'paid_published'
  | 'live_featured'
  | 'expired';

type CommercialDetails = {
  plan: string;
  paymentConfirmed: boolean;
  sponsored: boolean;
  featuredDaysRequested: 0 | 3 | 7 | 14;
  featuredUntil: Date | null;
};

function getRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function getCommercialDetails(tool: SubmittedTool): CommercialDetails {
  const features = getRecord(tool.features);
  const submission = getRecord(features.submission);
  const commercial = getRecord(submission.commercial);
  const untilRaw = typeof commercial.featuredUntil === 'string' ? commercial.featuredUntil : '';
  const until = untilRaw ? new Date(untilRaw) : null;
  const featuredDaysRequested = (() => {
    const parsed = Number.parseInt(String(commercial.featuredDaysRequested ?? 0), 10);
    if (parsed === 3 || parsed === 7 || parsed === 14) return parsed;
    return 0;
  })();

  return {
    plan: String(commercial.plan || 'free'),
    paymentConfirmed: commercial.paymentConfirmed === true,
    sponsored: commercial.isSponsoredPlacement === true,
    featuredDaysRequested,
    featuredUntil: until && !Number.isNaN(until.getTime()) ? until : null,
  };
}

function getCommercialStatus(tool: SubmittedTool): CommercialViewStatus {
  const details = getCommercialDetails(tool);
  const now = new Date();

  if (details.plan !== 'standard_paid') return 'free';

  if (!details.paymentConfirmed) return 'pending_payment';
  if (tool.status !== 'published') return 'paid_waiting_review';
  if (
    details.sponsored &&
    details.featuredUntil &&
    !Number.isNaN(details.featuredUntil.getTime()) &&
    details.featuredUntil >= now
  ) {
    return 'live_featured';
  }
  if (
    details.sponsored &&
    details.featuredUntil &&
    !Number.isNaN(details.featuredUntil.getTime()) &&
    details.featuredUntil < now
  ) {
    return 'expired';
  }
  return 'paid_published';
}

function getDaysLeft(until: Date | null): number | null {
  if (!until) return null;
  const diff = until.getTime() - Date.now();
  if (Number.isNaN(diff)) return null;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function getCommercialDetailLine(status: CommercialViewStatus, details: CommercialDetails): string {
  const daysLeft = getDaysLeft(details.featuredUntil);

  switch (status) {
    case 'pending_payment':
      return 'Stripe checkout is ready in your submission record.';
    case 'paid_waiting_review':
      return 'Payment is recorded and the listing is waiting for review.';
    case 'live_featured':
      return daysLeft === null
        ? 'Featured placement is live.'
        : `Featured placement is live and ends in ${daysLeft} day${daysLeft === 1 ? '' : 's'}.`;
    case 'expired':
      return 'The featured window ended. You can renew when needed.';
    case 'paid_published':
      return 'Paid submission published without an active featured window.';
    case 'free':
    default:
      return 'Standard submission with no paid placement.';
  }
}

function getCommercialBadge(status: CommercialViewStatus) {
  const styles: Record<CommercialViewStatus, string> = {
    free: 'bg-slate-100 text-slate-700',
    pending_payment: 'bg-amber-100 text-amber-800',
    paid_waiting_review: 'bg-cyan-100 text-cyan-800',
    paid_published: 'bg-sky-100 text-sky-800',
    live_featured: 'bg-emerald-100 text-emerald-800',
    expired: 'bg-rose-100 text-rose-800',
  };
  const labels: Record<CommercialViewStatus, string> = {
    free: listingConfig.plans.free.label,
    pending_payment: 'Pending payment',
    paid_waiting_review: 'Paid, under review',
    paid_published: 'Paid listing',
    live_featured: listingConfig.plans.standard_paid.featuredLabel,
    expired: 'Featured expired',
  };

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function getCommercialPaymentUrl(tool: SubmittedTool): string | null {
  const features = getRecord(tool.features);
  const submission = getRecord(features.submission);
  const commercial = getRecord(submission.commercial);
  const candidates = ['paymentUrl', 'checkoutUrl', 'paymentLink'] as const;

  const foundKey = candidates.find((key) => {
    const value = commercial[key];
    return typeof value === 'string' && value.trim().length > 0;
  });

  if (foundKey) {
    const value = commercial[foundKey];
    if (typeof value === 'string') {
      return value.trim();
    }
  }

  if (typeof window === 'undefined' && process.env.STRIPE_SECRET_KEY?.trim()) {
    return `/api/payments/stripe/checkout?toolId=${encodeURIComponent(tool.id)}`;
  }

  return null;
}

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams?: {
    payment?: string;
    session_id?: string;
  };
}) {
  const [result, submissionEmailEnabled] = await Promise.all([getMySubmittedTools(), getMySubmissionEmailPreference()]);
  const tools = result.success ? result.tools : [];
  const pendingPaymentTools = tools.filter((tool) => getCommercialStatus(tool) === 'pending_payment');
  const featuredTools = tools.filter((tool) => getCommercialStatus(tool) === 'live_featured');
  const firstPendingPaymentTool = pendingPaymentTools[0] || null;
  const firstPendingPaymentUrl = firstPendingPaymentTool ? getCommercialPaymentUrl(firstPendingPaymentTool) : null;
  const statusStats = tools.reduce(
    (acc, tool) => {
      acc[tool.status] += 1;
      return acc;
    },
    { draft: 0, pending: 0, published: 0, rejected: 0 } as Record<SubmittedTool['status'], number>,
  );
  const pendingPaymentMailto = getListingPaymentMailto('Complete Paid Submission');
  const paymentStatus = searchParams?.payment || '';

  return (
    <div className='theme-page container mx-auto px-4 py-8'>
      <div className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-slate-900 lg:text-4xl'>My Submissions</h1>
          <p className='mt-2 text-slate-600'>Track the review status of tools you submitted to AI Best Tool.</p>
        </div>
        <Link
          href='/submit'
          className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800'
        >
          Submit another tool
        </Link>
      </div>

      {paymentStatus === 'success' && (
        <section className='theme-surface mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-900'>
          <p className='text-sm font-semibold'>Payment completed</p>
          <p className='mt-1 text-sm'>
            Your payment was recorded successfully. Featured placement will start after approval, or immediately if the
            tool is already published.
          </p>
        </section>
      )}

      {paymentStatus === 'cancelled' && (
        <section className='theme-surface mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900'>
          <p className='text-sm font-semibold'>Payment cancelled</p>
          <p className='mt-1 text-sm'>
            You can come back here anytime to complete payment and continue the listing process.
          </p>
        </section>
      )}

      {!result.success && (
        <div className='mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700'>
          {result.error || 'Unable to load your submissions.'}
        </div>
      )}

      <SubmissionEmailPreferenceToggle initialEnabled={submissionEmailEnabled} />

      <section className='theme-surface mb-6 rounded-lg border border-cyan-200 bg-cyan-50 p-4'>
        <div className='flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between'>
          <div className='max-w-2xl'>
            <p className='text-sm font-semibold text-cyan-900'>
              {paymentStatus === 'success' ? 'Payment received' : 'What to do next'}
            </p>
            <p className='mt-1 text-sm leading-6 text-cyan-900/80'>
              {tools.length === 0
                ? 'Once you submit a tool, this page becomes the place to finish payment, watch review status, and renew featured placement.'
                : 'Use this page to complete payment, check review progress, and see when a featured window is active or expired.'}
            </p>
          </div>
          <div className='grid gap-2 text-sm text-cyan-900 lg:min-w-[320px]'>
            <div className='rounded-lg border border-cyan-100 bg-white px-3 py-2'>
              <span className='font-semibold'>1.</span>{' '}
              {pendingPaymentTools.length > 0 ? 'Complete payment' : 'Check review status'}
            </div>
            <div className='rounded-lg border border-cyan-100 bg-white px-3 py-2'>
              <span className='font-semibold'>2.</span>{' '}
              {statusStats.draft > 0 ? 'Improve draft details' : 'Wait for approval or publishing'}
            </div>
            <div className='rounded-lg border border-cyan-100 bg-white px-3 py-2'>
              <span className='font-semibold'>3.</span> Renew featured placement only when you want a new visibility
              window
            </div>
          </div>
        </div>
      </section>

      {pendingPaymentTools.length > 0 && (
        <section className='theme-surface mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4'>
          <div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
            <div>
              <p className='text-sm font-semibold text-amber-900'>Payment required</p>
              <p className='mt-1 text-sm text-amber-900/80'>
                You have {pendingPaymentTools.length} paid submission
                {pendingPaymentTools.length > 1 ? 's' : ''} waiting for payment confirmation. Complete payment to
                continue review and activate paid listing benefits.
              </p>
            </div>
            <div className='flex flex-wrap gap-2'>
              {firstPendingPaymentUrl ? (
                <a
                  href={firstPendingPaymentUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center justify-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700'
                >
                  Complete payment
                </a>
              ) : (
                <a
                  href={pendingPaymentMailto}
                  className='inline-flex items-center justify-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700'
                >
                  Contact to pay
                </a>
              )}
              <Link
                href='/submit'
                className='inline-flex items-center justify-center rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-100'
              >
                Submit another tool
              </Link>
            </div>
          </div>
        </section>
      )}

      {featuredTools.length > 0 && (
        <section className='theme-surface mb-6 rounded-lg border border-cyan-200 bg-cyan-50 p-4'>
          <div className='flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between'>
            <div>
              <p className='text-sm font-semibold text-cyan-900'>
                {featuredTools.length > 1 ? 'Active featured placements' : 'Active featured placement'}
              </p>
              <p className='mt-1 text-sm text-cyan-900/80'>
                {featuredTools.length > 1
                  ? 'Some of your paid listings are currently in a featured window.'
                  : 'One of your paid listings is currently in a featured window.'}
              </p>
            </div>
            <Link
              href='/pricing'
              className='inline-flex items-center justify-center rounded-lg border border-cyan-300 bg-white px-4 py-2 text-sm font-semibold text-cyan-900 hover:bg-cyan-100'
            >
              Review listing options
            </Link>
          </div>
        </section>
      )}

      {result.success && tools.length > 0 && (
        <section className='theme-surface mb-6 rounded-lg border border-slate-200 p-4'>
          <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
            <div className='rounded-lg bg-slate-50 p-3'>
              <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Pending review</p>
              <p className='mt-1 text-2xl font-bold text-amber-700'>{statusStats.pending}</p>
              <p className='mt-1 text-xs text-slate-500'>{listingConfig.plans.standard_paid.reviewWindow}</p>
            </div>
            <div className='rounded-lg bg-slate-50 p-3'>
              <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Published</p>
              <p className='mt-1 text-2xl font-bold text-emerald-700'>{statusStats.published}</p>
              <p className='mt-1 text-xs text-slate-500'>Visible in public directory</p>
            </div>
            <div className='rounded-lg bg-slate-50 p-3'>
              <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Draft</p>
              <p className='mt-1 text-2xl font-bold text-slate-700'>{statusStats.draft}</p>
              <p className='mt-1 text-xs text-slate-500'>{listingConfig.plans.free.highlights[0]}</p>
            </div>
            <div className='rounded-lg bg-slate-50 p-3'>
              <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Rejected</p>
              <p className='mt-1 text-2xl font-bold text-red-700'>{statusStats.rejected}</p>
              <p className='mt-1 text-xs text-slate-500'>Fix details and submit again</p>
            </div>
          </div>
        </section>
      )}

      {result.success && result.tools.length === 0 ? (
        <EmptyState title='No submissions yet' description='Submit your AI tool to start the review process.' />
      ) : (
        <div className='theme-surface overflow-hidden rounded-lg'>
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-slate-200'>
              <thead className='bg-slate-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500'>
                    Tool
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500'>
                    Status
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500'>
                    Commercial
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500'>
                    Submitted
                  </th>
                  <th className='px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-200 bg-white'>
                {result.tools.map((tool) => (
                  <tr key={tool.id} className='hover:bg-slate-50'>
                    {(() => {
                      const commercialStatus = getCommercialStatus(tool);
                      const commercialDetails = getCommercialDetails(tool);
                      const paymentUrl =
                        commercialStatus === 'pending_payment' ||
                        commercialStatus === 'live_featured' ||
                        commercialStatus === 'expired'
                          ? getCommercialPaymentUrl(tool)
                          : null;

                      let actionContent: JSX.Element | null = null;

                      if (tool.status === 'published') {
                        actionContent = (
                          <Link
                            href={`/ai/${tool.name}`}
                            className='text-sm font-medium text-cyan-700 hover:text-cyan-800'
                          >
                            View listing
                          </Link>
                        );
                      } else if (commercialStatus === 'pending_payment') {
                        actionContent = paymentUrl ? (
                          <a
                            href={paymentUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='inline-flex items-center rounded-lg bg-cyan-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-cyan-800'
                          >
                            Complete payment
                          </a>
                        ) : (
                          <a
                            href={pendingPaymentMailto}
                            className='text-sm font-medium text-cyan-700 hover:text-cyan-800'
                          >
                            Contact to pay
                          </a>
                        );
                      } else if (commercialStatus === 'live_featured') {
                        actionContent = paymentUrl ? (
                          <a
                            href={paymentUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='inline-flex items-center rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700'
                          >
                            Renew featured
                          </a>
                        ) : (
                          <a
                            href={pendingPaymentMailto}
                            className='text-sm font-medium text-cyan-700 hover:text-cyan-800'
                          >
                            Contact to renew
                          </a>
                        );
                      } else if (commercialStatus === 'expired') {
                        actionContent = paymentUrl ? (
                          <a
                            href={paymentUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='inline-flex items-center rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-rose-700'
                          >
                            Renew visibility
                          </a>
                        ) : (
                          <a
                            href={pendingPaymentMailto}
                            className='text-sm font-medium text-cyan-700 hover:text-cyan-800'
                          >
                            Contact to renew
                          </a>
                        );
                      } else {
                        actionContent = <span className='text-sm text-slate-400'>Awaiting review</span>;
                      }

                      return (
                        <>
                          <td className='px-6 py-4'>
                            <div className='font-medium text-slate-900'>{getTitle(tool)}</div>
                            <a
                              href={tool.url}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='mt-1 inline-flex items-center gap-1 text-sm text-cyan-700 hover:text-cyan-800'
                            >
                              {tool.url}
                              <ExternalLink className='h-3.5 w-3.5' />
                            </a>
                          </td>
                          <td className='px-6 py-4'>
                            {getStatusBadge(tool.status)}
                            <p className='mt-2 max-w-xs text-sm text-slate-500'>{getStatusDescription(tool.status)}</p>
                            <p className='mt-1 max-w-xs text-xs text-slate-400'>{getStatusActionHint(tool.status)}</p>
                          </td>
                          <td className='px-6 py-4'>
                            <div className='space-y-2'>
                              {getCommercialBadge(getCommercialStatus(tool))}
                              <p className='max-w-xs text-xs leading-5 text-slate-500'>
                                {getCommercialDetailLine(commercialStatus, commercialDetails)}
                              </p>
                              {commercialDetails.featuredDaysRequested > 0 && (
                                <p className='text-xs text-slate-400'>
                                  Featured window: {commercialDetails.featuredDaysRequested} days
                                </p>
                              )}
                            </div>
                          </td>
                          <td className='px-6 py-4 text-sm text-slate-500'>
                            {new Date(tool.created_at).toLocaleDateString()}
                          </td>
                          <td className='px-6 py-4 text-right'>{actionContent}</td>
                        </>
                      );
                    })()}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
