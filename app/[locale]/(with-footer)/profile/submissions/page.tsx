import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

import { getMySubmittedTools, SubmittedTool } from '@/app/actions/submissions';
import { getMySubmissionEmailPreference } from '@/app/actions/userPreferences';
import EmptyState from '@/components/EmptyState';
import { getListingPaymentMailto, listingConfig } from '@/lib/config/listing';
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
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}
    >
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
  | 'live_featured'
  | 'expired';

function getRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function getCommercialStatus(tool: SubmittedTool): CommercialViewStatus {
  const features = getRecord(tool.features);
  const submission = getRecord(features.submission);
  const commercial = getRecord(submission.commercial);
  const plan = String(commercial.plan || 'free');

  if (plan !== 'standard_paid') return 'free';

  const paymentConfirmed = commercial.paymentConfirmed === true;
  const sponsored = commercial.isSponsoredPlacement === true;
  const untilRaw = typeof commercial.featuredUntil === 'string' ? commercial.featuredUntil : '';
  const until = untilRaw ? new Date(untilRaw) : null;
  const now = new Date();

  if (!paymentConfirmed) return 'pending_payment';
  if (sponsored && until && !Number.isNaN(until.getTime()) && until >= now) return 'live_featured';
  if (sponsored && until && !Number.isNaN(until.getTime()) && until < now) return 'expired';
  return 'paid_waiting_review';
}

function getCommercialBadge(status: CommercialViewStatus) {
  const styles: Record<CommercialViewStatus, string> = {
    free: 'bg-slate-100 text-slate-700',
    pending_payment: 'bg-amber-100 text-amber-800',
    paid_waiting_review: 'bg-cyan-100 text-cyan-800',
    live_featured: 'bg-emerald-100 text-emerald-800',
    expired: 'bg-rose-100 text-rose-800',
  };
  const labels: Record<CommercialViewStatus, string> = {
    free: listingConfig.plans.free.label,
    pending_payment: 'Pending payment',
    paid_waiting_review: 'Paid, under review',
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

  for (const key of candidates) {
    const value = commercial[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
}

export default async function SubmissionsPage() {
  const [result, submissionEmailEnabled] = await Promise.all([
    getMySubmittedTools(),
    getMySubmissionEmailPreference(),
  ]);
  const tools = result.success ? result.tools : [];
  const statusStats = tools.reduce(
    (acc, tool) => {
      acc[tool.status] += 1;
      return acc;
    },
    { draft: 0, pending: 0, published: 0, rejected: 0 } as Record<SubmittedTool['status'], number>,
  );
  const pendingPaymentMailto = getListingPaymentMailto('Complete Paid Submission');

  return (
    <div className="theme-page container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 lg:text-4xl">
            My Submissions
          </h1>
          <p className="mt-2 text-slate-600">
            Track the review status of tools you submitted to AI Best Tool.
          </p>
        </div>
        <Link
          href="/submit"
          className="inline-flex items-center justify-center rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800"
        >
          Submit another tool
        </Link>
      </div>

      {!result.success && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {result.error || 'Unable to load your submissions.'}
        </div>
      )}

      <SubmissionEmailPreferenceToggle initialEnabled={submissionEmailEnabled} />

      {result.success && tools.length > 0 && (
        <section className="theme-surface mb-6 rounded-lg border border-slate-200 p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pending review</p>
              <p className="mt-1 text-2xl font-bold text-amber-700">{statusStats.pending}</p>
              <p className="mt-1 text-xs text-slate-500">
                {listingConfig.plans.standard_paid.reviewWindow}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Published</p>
              <p className="mt-1 text-2xl font-bold text-emerald-700">{statusStats.published}</p>
              <p className="mt-1 text-xs text-slate-500">Visible in public directory</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Draft</p>
              <p className="mt-1 text-2xl font-bold text-slate-700">{statusStats.draft}</p>
              <p className="mt-1 text-xs text-slate-500">
                {listingConfig.plans.free.highlights[0]}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Rejected</p>
              <p className="mt-1 text-2xl font-bold text-red-700">{statusStats.rejected}</p>
              <p className="mt-1 text-xs text-slate-500">Fix details and submit again</p>
            </div>
          </div>
        </section>
      )}

      {result.success && result.tools.length === 0 ? (
        <EmptyState
          title="No submissions yet"
          description="Submit your AI tool to start the review process."
        />
      ) : (
        <div className="theme-surface overflow-hidden rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Tool
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Commercial
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {result.tools.map((tool) => (
                  <tr key={tool.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{getTitle(tool)}</div>
                      <a
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-sm text-cyan-700 hover:text-cyan-800"
                      >
                        {tool.url}
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(tool.status)}
                      <p className="mt-2 max-w-xs text-sm text-slate-500">
                        {getStatusDescription(tool.status)}
                      </p>
                      <p className="mt-1 max-w-xs text-xs text-slate-400">
                        {getStatusActionHint(tool.status)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {getCommercialBadge(getCommercialStatus(tool))}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(tool.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {tool.status === 'published' ? (
                        <Link
                          href={`/ai/${tool.name}`}
                          className="text-sm font-medium text-cyan-700 hover:text-cyan-800"
                        >
                          View listing
                        </Link>
                      ) : getCommercialStatus(tool) === 'pending_payment' ? (
                        getCommercialPaymentUrl(tool) ? (
                          <a
                            href={getCommercialPaymentUrl(tool)!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center rounded-lg bg-cyan-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-cyan-800"
                          >
                            Complete payment
                          </a>
                        ) : (
                          <a
                            href={pendingPaymentMailto}
                            className="text-sm font-medium text-cyan-700 hover:text-cyan-800"
                          >
                            Contact to pay
                          </a>
                        )
                      ) : (
                        <span className="text-sm text-slate-400">Awaiting review</span>
                      )}
                    </td>
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
