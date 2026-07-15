import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

import { getListingPaymentMailto, listingConfig } from '@/lib/config/listing';
import EmptyState from '@/components/EmptyState';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
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
  featuredActiveFrom: Date | null;
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
  const activeFromRaw = typeof commercial.featuredActiveFrom === 'string' ? commercial.featuredActiveFrom : '';
  const activeFrom = activeFromRaw ? new Date(activeFromRaw) : null;

  return {
    plan: String(commercial.plan || 'free'),
    paymentConfirmed: commercial.paymentConfirmed === true,
    sponsored: commercial.isSponsoredPlacement === true,
    featuredDaysRequested,
    featuredActiveFrom: activeFrom && !Number.isNaN(activeFrom.getTime()) ? activeFrom : null,
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
      return details.featuredDaysRequested > 0
        ? `Stripe checkout is ready. Featured placement will start after approval and run for ${details.featuredDaysRequested} days.`
        : 'Stripe checkout is ready in your submission record.';
    case 'paid_waiting_review':
      return details.featuredDaysRequested > 0
        ? 'Payment is recorded. The listing is waiting for review before the featured window starts.'
        : 'Payment is recorded and the listing is waiting for review.';
    case 'live_featured':
      if (daysLeft === null) {
        return 'Featured placement is live.';
      }
      return details.featuredActiveFrom
        ? `Featured placement runs from ${details.featuredActiveFrom.toLocaleDateString()} to ${details.featuredUntil?.toLocaleDateString() || 'unknown'}.`
        : `Featured placement is live and ends in ${daysLeft} day${daysLeft === 1 ? '' : 's'}.`;
    case 'expired':
      return details.featuredUntil
        ? `The featured window ended on ${details.featuredUntil.toLocaleDateString()}. You can renew when needed.`
        : 'The featured window ended. You can renew when needed.';
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
  params,
  searchParams,
}: {
  params?: {
    locale?: string;
  };
  searchParams?: {
    payment?: string;
    session_id?: string;
    focus?: string;
  };
}) {
  const locale = params?.locale || 'en';
  const isChinese = locale === 'cn' || locale === 'tw';
  const [resultPromise, submissionEmailEnabledPromise] = await Promise.allSettled([
    getMySubmittedTools(),
    getMySubmissionEmailPreference(),
  ]);
  const result =
    resultPromise.status === 'fulfilled'
      ? resultPromise.value
      : { success: false, tools: [], error: 'Unable to load your submissions.' };
  const submissionEmailEnabled =
    submissionEmailEnabledPromise.status === 'fulfilled' ? submissionEmailEnabledPromise.value : true;
  const tools = result.success ? result.tools : [];
  const pendingPaymentTools = tools.filter((tool) => getCommercialStatus(tool) === 'pending_payment');
  const featuredTools = tools.filter((tool) => getCommercialStatus(tool) === 'live_featured');
  const firstPendingPaymentTool = pendingPaymentTools[0] || null;
  const firstPendingPaymentUrl = firstPendingPaymentTool ? getCommercialPaymentUrl(firstPendingPaymentTool) : null;
  const focusedSection = searchParams?.focus === 'payment' ? 'payment' : '';
  const statusStats = tools.reduce(
    (acc, tool) => {
      acc[tool.status] += 1;
      return acc;
    },
    { draft: 0, pending: 0, published: 0, rejected: 0 } as Record<SubmittedTool['status'], number>,
  );
  const pendingPaymentMailto = getListingPaymentMailto('Complete Paid Submission');
  const paymentStatus = searchParams?.payment || '';
  const featuredOverview = featuredTools
    .map((tool) => ({
      tool,
      details: getCommercialDetails(tool),
    }))
    .sort((a, b) => {
      const aTime = a.details.featuredUntil?.getTime() ?? Number.POSITIVE_INFINITY;
      const bTime = b.details.featuredUntil?.getTime() ?? Number.POSITIVE_INFINITY;
      return aTime - bTime;
    });
  const nextFeaturedRenewal = featuredOverview[0] || null;
  const nextFeaturedDaysLeft = nextFeaturedRenewal ? getDaysLeft(nextFeaturedRenewal.details.featuredUntil) : null;
  const expiredFeaturedCount = tools.filter((tool) => getCommercialStatus(tool) === 'expired').length;
  const featuredNeedsAttention = Boolean(
    expiredFeaturedCount > 0 || (typeof nextFeaturedDaysLeft === 'number' && nextFeaturedDaysLeft <= 3),
  );
  const activeFeaturedCount = featuredTools.length;
  let nextAction = {
    label: 'Keep an eye on review',
    text: 'Your queue is moving, so the main job is to watch for review updates and follow-up messages.',
    href: '/profile',
  };
  if (pendingPaymentTools.length > 0) {
    nextAction = {
      label: 'Complete payment',
      text: `You have ${pendingPaymentTools.length} paid submission${pendingPaymentTools.length > 1 ? 's' : ''} waiting for payment confirmation.`,
      href: firstPendingPaymentUrl || pendingPaymentMailto,
    };
  } else if (featuredTools.length > 0) {
    nextAction = {
      label: 'Review featured timing',
      text: `You currently have ${featuredTools.length} active featured placement${featuredTools.length > 1 ? 's' : ''}.`,
      href: '/pricing',
    };
  } else if (statusStats.draft > 0) {
    nextAction = {
      label: 'Finish draft details',
      text: `You still have ${statusStats.draft} draft submission${statusStats.draft > 1 ? 's' : ''} that can be refined and resubmitted.`,
      href: '/submit',
    };
  }

  let featuredAttentionText = '';
  if (expiredFeaturedCount > 0) {
    if (isChinese) {
      featuredAttentionText = `${expiredFeaturedCount} 个前排展示已过期，建议尽快续期。`;
    } else {
      featuredAttentionText = `${expiredFeaturedCount} featured placement${expiredFeaturedCount > 1 ? 's are' : ' is'} expired. Renew soon.`;
    }
  } else if (nextFeaturedDaysLeft !== null) {
    if (isChinese) {
      featuredAttentionText = `距离到期还剩 ${nextFeaturedDaysLeft} 天，建议提前准备续期。`;
    } else {
      featuredAttentionText = `This featured window ends in ${nextFeaturedDaysLeft} day${nextFeaturedDaysLeft === 1 ? '' : 's'}.`;
    }
  } else if (isChinese) {
    featuredAttentionText = '当前展示时间接近结束，请检查续期设置。';
  } else {
    featuredAttentionText = 'This featured window is close to ending. Please review renewal settings.';
  }

  let featuredWindowEndText = 'No end date set';
  if (nextFeaturedRenewal.details.featuredUntil) {
    featuredWindowEndText = nextFeaturedRenewal.details.featuredUntil.toLocaleDateString();
  } else if (isChinese) {
    featuredWindowEndText = '暂无结束时间';
  }

  let featuredButtonText = 'Review renewal options';
  if (featuredNeedsAttention) {
    featuredButtonText = isChinese ? '立即续期' : 'Renew now';
  } else if (isChinese) {
    featuredButtonText = '查看续期方案';
  }

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

      <GuideEvidencePanel
        locale={locale}
        checkedAt='2026-07-15'
        scope={
          isChinese
            ? '我的提交页要把付款、审核、前排窗口和续期状态放在同一屏里，方便用户知道下一步到底该做什么。'
            : 'The My Submissions page should keep payment, review, featured windows, and renewal status on one screen so users know the next step immediately.'
        }
        items={[
          {
            label: isChinese ? '页面定位' : 'Page role',
            value: isChinese ? '追踪审核和付费状态' : 'Track review and payment status',
            note: isChinese
              ? '这里是提交后的主要跟进页，不是纯列表页。'
              : 'This is the primary follow-up page after submission, not just a list view.',
          },
          {
            label: isChinese ? '执行信号' : 'Execution signal',
            value: isChinese ? '先处理待付费和待审核' : 'Handle pending payment and review first',
            note: isChinese
              ? '让用户先补齐最容易卡住的步骤。'
              : 'Helps users clear the steps most likely to block progress.',
          },
          {
            label: isChinese ? '续期信号' : 'Renewal signal',
            value: isChinese ? '前排快到期就要提醒' : 'Warn when featured time is almost over',
            note: isChinese
              ? '避免用户错过窗口，延迟续费。'
              : 'Prevents users from missing the window and delaying renewal.',
          },
        ]}
        decisionSteps={[
          isChinese ? '先看是否有待付款项目。' : 'Check whether any payment is still pending.',
          isChinese ? '再确认审核和发布状态。' : 'Then confirm review and publish status.',
          isChinese ? '最后看前排窗口是否需要续期。' : 'Finally check whether the featured window needs renewal.',
        ]}
        signalCards={[
          {
            label: isChinese ? '跟进信号' : 'Follow-up signal',
            value: isChinese ? '付款未完成就先补付款' : 'Complete payment before anything else',
            note: isChinese ? '这是最容易阻塞进度的状态。' : 'This is usually the easiest blocker to clear.',
          },
          {
            label: isChinese ? '发布信号' : 'Publish signal',
            value: isChinese ? '已发布就继续看更新请求' : 'If published, keep watching for update requests',
            note: isChinese ? '把已发布条目维持在可运营状态。' : 'Keeps published listings operational.',
          },
          {
            label: isChinese ? '风险信号' : 'Risk signal',
            value: isChinese ? '前排过期要及时续' : 'Renew expired featured windows quickly',
            note: isChinese ? '避免曝光窗口自然断掉。' : 'Avoids losing the visibility window.',
          },
        ]}
      />

      <section className='mb-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]'>
        <div className='theme-surface rounded-lg border border-slate-200 bg-white p-5 shadow-sm'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>Next action</p>
          <h2 className='mt-2 text-2xl font-bold text-slate-950'>{nextAction.label}</h2>
          <p className='mt-2 text-sm leading-6 text-slate-600'>{nextAction.text}</p>
          <div className='mt-4 flex flex-wrap gap-3'>
            <a
              href={nextAction.href}
              className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              Take action
            </a>
            <Link
              href='/profile'
              className='inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              Back to profile
            </Link>
          </div>
        </div>

        <div className='theme-surface rounded-lg border border-slate-200 bg-white p-5 shadow-sm'>
          <p className='text-sm font-semibold uppercase tracking-wide text-slate-500'>Current focus</p>
          <div className='mt-3 grid gap-3 text-sm'>
            <div className='rounded-xl border border-slate-200 bg-slate-50 p-3'>
              <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Pending payment</p>
              <p className='mt-1 text-2xl font-bold text-amber-700'>{pendingPaymentTools.length}</p>
            </div>
            <div className='rounded-xl border border-slate-200 bg-slate-50 p-3'>
              <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Featured live</p>
              <p className='mt-1 text-2xl font-bold text-emerald-700'>{activeFeaturedCount}</p>
            </div>
            <div className='rounded-xl border border-slate-200 bg-slate-50 p-3'>
              <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Draft / rejected</p>
              <p className='mt-1 text-2xl font-bold text-rose-700'>{statusStats.draft + statusStats.rejected}</p>
            </div>
          </div>
        </div>
      </section>

      {(nextFeaturedRenewal || expiredFeaturedCount > 0) && (
        <section className='mb-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]'>
          <div
            className={`theme-surface rounded-lg p-5 shadow-sm ${
              featuredNeedsAttention ? 'border border-amber-300 bg-amber-50' : 'border border-emerald-200 bg-emerald-50'
            }`}
          >
            <p
              className={`text-sm font-semibold uppercase tracking-wide ${
                featuredNeedsAttention ? 'text-amber-700' : 'text-emerald-700'
              }`}
            >
              Featured timing
            </p>
            {nextFeaturedRenewal ? (
              <>
                <h2 className='mt-2 text-2xl font-bold text-slate-950'>{getTitle(nextFeaturedRenewal.tool)}</h2>
                <p className='mt-2 text-sm leading-6 text-emerald-950/80'>
                  {getCommercialDetailLine(getCommercialStatus(nextFeaturedRenewal.tool), nextFeaturedRenewal.details)}
                </p>
                {featuredNeedsAttention && (
                  <p className='mt-2 rounded-lg bg-white/80 px-3 py-2 text-sm font-semibold text-amber-900 ring-1 ring-amber-200'>
                    {featuredAttentionText}
                  </p>
                )}
                <p className='mt-2 text-sm text-emerald-950/80'>Featured window: {featuredWindowEndText}</p>
                <div className='mt-4 flex flex-wrap gap-3'>
                  <Link
                    href='/pricing'
                    className='inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700'
                  >
                    {featuredButtonText}
                  </Link>
                  <Link
                    href='/profile'
                    className='inline-flex items-center justify-center rounded-lg border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-100'
                  >
                    {isChinese ? '回到个人中心' : 'Back to profile'}
                  </Link>
                </div>
              </>
            ) : (
              <p className='mt-2 text-sm leading-6 text-emerald-950/80'>
                {isChinese ? '当前没有正在生效的前排展示。' : 'You do not currently have an active featured placement.'}
              </p>
            )}
          </div>

          <div className='theme-surface rounded-lg border border-slate-200 bg-white p-5 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-slate-500'>Renewal focus</p>
            <div className='mt-3 grid gap-3 text-sm'>
              <div className='rounded-xl border border-slate-200 bg-slate-50 p-3'>
                <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Active featured</p>
                <p className='mt-1 text-2xl font-bold text-emerald-700'>{featuredTools.length}</p>
              </div>
              <div className='rounded-xl border border-slate-200 bg-slate-50 p-3'>
                <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Expired featured</p>
                <p className='mt-1 text-2xl font-bold text-rose-700'>{expiredFeaturedCount}</p>
              </div>
              <div className='rounded-xl border border-slate-200 bg-slate-50 p-3'>
                <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Pending payment</p>
                <p className='mt-1 text-2xl font-bold text-amber-700'>{pendingPaymentTools.length}</p>
              </div>
            </div>
          </div>
        </section>
      )}

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
        <section
          className={`theme-surface mb-6 rounded-lg border p-4 ${
            focusedSection === 'payment' ? 'border-amber-300 bg-amber-100' : 'border-amber-200 bg-amber-50'
          }`}
        >
          <div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
            <div>
              <p className='text-sm font-semibold text-amber-900'>Payment required</p>
              <p className='mt-1 text-sm text-amber-900/80'>
                You have {pendingPaymentTools.length} paid submission
                {pendingPaymentTools.length > 1 ? 's' : ''} waiting for payment confirmation. Complete payment to
                continue review and activate paid listing benefits.
              </p>
              {firstPendingPaymentTool && (
                <p className='mt-2 text-sm font-medium text-amber-950'>
                  Next payment target: {getTitle(firstPendingPaymentTool)}
                </p>
              )}
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
                  <tr
                    key={tool.id}
                    className={`hover:bg-slate-50 ${
                      focusedSection === 'payment' && firstPendingPaymentTool?.id === tool.id ? 'bg-amber-50/70' : ''
                    }`}
                  >
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
                              {commercialDetails.featuredActiveFrom && (
                                <p className='text-xs text-slate-400'>
                                  Starts: {commercialDetails.featuredActiveFrom.toLocaleDateString()}
                                </p>
                              )}
                              {commercialDetails.featuredUntil && (
                                <p className='text-xs text-slate-400'>
                                  Ends: {commercialDetails.featuredUntil.toLocaleDateString()}
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
