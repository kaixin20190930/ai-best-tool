'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Check, CheckCheck, Edit, ExternalLink, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

import { getPaidListingPublishGate, getToolQuality } from '@/lib/services/toolQuality';
import BaseImage from '@/components/image/BaseImage';
import {
  approveTool,
  deleteTool,
  markPendingFollowedUp,
  publishReadyTools,
  rejectTool,
} from '@/app/actions/admin/tools';
import type { AdminTool } from '@/app/actions/admin/tools';
import { useRouter } from '@/app/navigation';

interface AdminToolsTableProps {
  tools: AdminTool[];
  total: number;
  currentPage: number;
}

type PendingAction =
  | { kind: 'reject'; toolId: string }
  | { kind: 'delete'; toolId: string }
  | { kind: 'bulk-publish'; toolIds: string[] }
  | { kind: 'bulk-followup'; toolIds: string[] }
  | null;

export default function AdminToolsTable({ tools, total, currentPage }: AdminToolsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [actionReason, setActionReason] = useState('');

  const handleApprove = async (toolId: string) => {
    setLoading(toolId);
    const result = await approveTool(toolId);
    setLoading(null);

    if (result.success) {
      toast.success('Tool approved successfully');
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to approve tool');
    }
  };

  const handleReject = async (toolId: string) => {
    setActionReason('');
    setPendingAction({ kind: 'reject', toolId });
  };

  const handleDelete = async (toolId: string) => {
    setPendingAction({ kind: 'delete', toolId });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      published: 'bg-emerald-100 text-emerald-800',
      pending: 'bg-amber-100 text-amber-800',
      rejected: 'bg-red-100 text-red-800',
      draft: 'bg-slate-100 text-slate-800',
    };

    return (
      <span
        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
          styles[status as keyof typeof styles] || styles.draft
        }`}
      >
        {status}
      </span>
    );
  };

  const getTitle = (tool: AdminTool) => {
    if (typeof tool.title === 'string') return tool.title;
    if (typeof tool.title === 'object' && tool.title !== null) {
      return tool.title.en || tool.title.zh || Object.values(tool.title)[0] || tool.name;
    }
    return tool.name;
  };

  const getClaimStatusLabel = (claimStatus: string | null | undefined) => {
    if (claimStatus === 'claimed') return 'Claimed';
    if (claimStatus === 'pending') return 'Pending claim';
    if (claimStatus === 'rejected') return 'Claim rejected';
    return 'Unclaimed';
  };

  const getClaimStatusTone = (claimStatus: string | null | undefined) => {
    if (claimStatus === 'claimed') return 'bg-emerald-50 text-emerald-700';
    if (claimStatus === 'pending') return 'bg-amber-50 text-amber-700';
    if (claimStatus === 'rejected') return 'bg-rose-50 text-rose-700';
    return 'bg-slate-100 text-slate-600';
  };

  const getOwnerLabel = (tool: AdminTool) => tool.ownerEmail || 'No owner';

  const getClaimStatusHref = (claimStatus: string | null | undefined) => {
    const params = new URLSearchParams(searchParams.toString());

    if (!claimStatus || claimStatus === 'unclaimed') {
      params.set('claimStatus', 'unclaimed');
    } else {
      params.set('claimStatus', claimStatus);
    }

    params.delete('page');
    const query = params.toString();
    return `/admin/tools${query ? `?${query}` : ''}`;
  };

  const getMissingInfo = (tool: AdminTool) => getToolQuality(tool).missingLabels.map((label) => label.toLowerCase());

  const getFeatureRecord = (tool: AdminTool) =>
    tool.features && typeof tool.features === 'object' ? (tool.features as Record<string, unknown>) : {};

  const getNestedRecord = (value: unknown) =>
    value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

  const getSubmissionReview = (tool: AdminTool) => {
    const features = getFeatureRecord(tool);
    const submission = getNestedRecord(features.submission);
    return getNestedRecord(submission.review);
  };

  const hasEditorialVerification = (tool: AdminTool) => {
    const editorial = getNestedRecord(getFeatureRecord(tool).editorial);
    const reviewedAt = typeof editorial.reviewedAt === 'string' ? editorial.reviewedAt.trim() : '';
    const reviewedBy = typeof editorial.reviewedBy === 'string' ? editorial.reviewedBy.trim() : '';
    const sourceUrl = typeof editorial.sourceUrl === 'string' ? editorial.sourceUrl.trim() : '';
    const summary = getNestedRecord(editorial.summary);
    const summaryEn = typeof summary.en === 'string' ? summary.en.trim() : '';
    const summaryZh = typeof summary.zh === 'string' ? summary.zh.trim() : '';
    return Boolean(reviewedAt && reviewedBy && /^https?:\/\//i.test(sourceUrl) && (summaryEn || summaryZh));
  };

  const getRejectionReason = (tool: AdminTool) => {
    const review = getSubmissionReview(tool);
    return typeof review.rejectionReason === 'string' && review.rejectionReason.trim().length > 0
      ? review.rejectionReason.trim()
      : null;
  };

  const getNumber = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : undefined);

  const getAuditSignals = (tool: AdminTool) => {
    const features = getFeatureRecord(tool);
    const collection = getNestedRecord(features.collection);
    const submission = getNestedRecord(features.submission);
    const commercial = getNestedRecord(submission.commercial);
    const mediaReview = getNestedRecord(features.mediaReview);
    const relevanceScore = getNumber(collection.relevanceScore);
    const qualityScore = getNumber(collection.qualityScore);
    const missing = getMissingInfo(tool);
    const signals: Array<{ label: string; className: string }> = [];

    if (Object.keys(collection).length > 0) {
      signals.push({
        label: 'Collected',
        className: 'bg-cyan-50 text-cyan-700',
      });
    }

    const { plan } = commercial;
    if (plan === 'standard_paid') {
      signals.push({
        label: 'Paid intent',
        className: 'bg-indigo-50 text-indigo-700',
      });

      const paidGate = getPaidListingPublishGate(tool);
      if (!paidGate.ready) {
        signals.push({
          label: `Paid blockers: ${paidGate.blockers.length}`,
          className: 'bg-rose-50 text-rose-700',
        });
      }
    }

    const claimStatus = tool.claimStatus || 'unclaimed';
    if (claimStatus === 'claimed') {
      signals.push({
        label: 'Owner claimed',
        className: 'bg-emerald-50 text-emerald-700',
      });
    } else if (claimStatus === 'pending') {
      signals.push({
        label: 'Claim pending',
        className: 'bg-amber-50 text-amber-700',
      });
    } else if (claimStatus === 'rejected') {
      signals.push({
        label: 'Claim rejected',
        className: 'bg-rose-50 text-rose-700',
      });
    } else {
      signals.push({
        label: 'Owner missing',
        className: 'bg-slate-100 text-slate-600',
      });
    }

    signals.push(
      hasEditorialVerification(tool)
        ? { label: 'Editorial verified', className: 'bg-emerald-50 text-emerald-700' }
        : { label: 'Editorial pending', className: 'bg-amber-50 text-amber-700' },
    );

    if (commercial.fastTrackRequested === true) {
      signals.push({
        label: 'Fast track',
        className: 'bg-blue-50 text-blue-700',
      });
    }

    const featuredDaysRequested = getNumber(commercial.featuredDaysRequested);
    if (typeof featuredDaysRequested === 'number' && featuredDaysRequested > 0) {
      signals.push({
        label: `Featured ${featuredDaysRequested}d`,
        className: 'bg-fuchsia-50 text-fuchsia-700',
      });
    }

    if (typeof relevanceScore === 'number') {
      let relevanceTone = 'bg-red-50 text-red-700';
      if (relevanceScore >= 60) {
        relevanceTone = 'bg-green-50 text-green-700';
      } else if (relevanceScore >= 50) {
        relevanceTone = 'bg-amber-50 text-amber-700';
      }

      signals.push({
        label: `AI ${relevanceScore}`,
        className: relevanceTone,
      });
    }

    if (typeof qualityScore === 'number') {
      let qualityTone = 'bg-red-50 text-red-700';
      if (qualityScore >= 80) {
        qualityTone = 'bg-green-50 text-green-700';
      } else if (qualityScore >= 60) {
        qualityTone = 'bg-amber-50 text-amber-700';
      }

      signals.push({
        label: `Source ${qualityScore}`,
        className: qualityTone,
      });
    }

    if (mediaReview.needed === true) {
      signals.push({
        label: 'Media needed',
        className: 'bg-violet-50 text-violet-700',
      });
    }

    if (missing.includes('logo')) {
      signals.push({
        label: 'Logo missing',
        className: 'bg-red-50 text-red-700',
      });
    }

    if (missing.includes('screenshot')) {
      signals.push({
        label: 'Thumbnail missing',
        className: 'bg-red-50 text-red-700',
      });
    }

    return signals;
  };

  const isPublishReady = (tool: AdminTool) => {
    const features = getFeatureRecord(tool);
    const mediaReview = getNestedRecord(features.mediaReview);

    return (
      tool.status === 'draft' &&
      getToolQuality(tool).score >= 80 &&
      Boolean(tool.image_url) &&
      Boolean(tool.thumbnail_url) &&
      mediaReview.needed !== true
    );
  };

  const getQualityBadge = (tool: AdminTool) => {
    const { score } = getToolQuality(tool);
    let color = 'bg-red-50 text-red-700';
    if (score >= 80) {
      color = 'bg-green-50 text-green-700';
    } else if (score >= 55) {
      color = 'bg-amber-50 text-amber-700';
    }

    return (
      <span className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${color}`}>
        Quality {score}
      </span>
    );
  };

  const getQualityState = (tool: AdminTool) => {
    const stored = tool.page_quality_status || 'continue_index';

    if (stored === 'noindex') {
      return { label: 'Noindex', tone: 'bg-rose-50 text-rose-700', reviewDays: 14 };
    }

    if (stored === 'merge_candidate') {
      return { label: 'Merge candidate', tone: 'bg-violet-50 text-violet-700', reviewDays: 7 };
    }

    if (stored === 'monitor') {
      return { label: 'Monitor', tone: 'bg-amber-50 text-amber-700', reviewDays: 30 };
    }

    if (stored === 'archive') {
      return { label: 'Archive', tone: 'bg-slate-100 text-slate-600', reviewDays: 0 };
    }

    const { score } = getToolQuality(tool);

    if (score >= 80) {
      return { label: 'Continue index', tone: 'bg-emerald-50 text-emerald-700', reviewDays: 90 };
    }

    if (score >= 60) {
      return { label: 'Monitor', tone: 'bg-amber-50 text-amber-700', reviewDays: 30 };
    }

    return { label: 'Noindex', tone: 'bg-rose-50 text-rose-700', reviewDays: 7 };
  };

  const getNextReviewDate = (tool: AdminTool) => {
    if (tool.next_review_date) {
      const storedDate = new Date(tool.next_review_date);
      if (!Number.isNaN(storedDate.getTime())) {
        return storedDate;
      }
    }

    const base = new Date(tool.updated_at || tool.created_at);
    if (Number.isNaN(base.getTime())) {
      return null;
    }

    const { reviewDays } = getQualityState(tool);
    const nextReview = new Date(base);
    nextReview.setDate(nextReview.getDate() + reviewDays);
    return nextReview;
  };

  const getRowClassName = (tool: AdminTool, publishReady: boolean, pendingOverdue: boolean, staleFollowUp: boolean) => {
    if (publishReady) {
      return 'bg-emerald-50/50 hover:bg-emerald-50';
    }

    if (pendingOverdue) {
      return 'bg-red-50/60 hover:bg-red-50';
    }

    if (staleFollowUp) {
      return 'bg-amber-50/40 hover:bg-amber-50';
    }

    if (tool.status === 'pending') {
      return 'bg-amber-50/60 hover:bg-amber-50';
    }

    return 'hover:bg-slate-50';
  };

  const isPendingOverdue = (tool: AdminTool) => {
    if (tool.status !== 'pending') {
      return false;
    }

    const createdAt = new Date(tool.created_at).getTime();
    if (!Number.isFinite(createdAt)) {
      return false;
    }

    return Date.now() - createdAt >= 48 * 60 * 60 * 1000;
  };

  const pageSize = 20;
  const totalPages = Math.ceil(total / pageSize);
  const publishableTools = tools.filter(isPublishReady);
  const allPublishableSelected =
    publishableTools.length > 0 && publishableTools.every((tool) => selectedIds.includes(tool.id));

  const toggleTool = (toolId: string) => {
    setSelectedIds((current) =>
      current.includes(toolId) ? current.filter((id) => id !== toolId) : [...current, toolId],
    );
  };

  const toggleAllPublishable = () => {
    if (allPublishableSelected) {
      setSelectedIds((current) => current.filter((id) => !publishableTools.some((tool) => tool.id === id)));
      return;
    }

    setSelectedIds((current) => Array.from(new Set([...current, ...publishableTools.map((tool) => tool.id)])));
  };

  const handleBulkPublish = async () => {
    if (selectedIds.length === 0) {
      toast.error('Select ready draft tools first');
      return;
    }

    setPendingAction({ kind: 'bulk-publish', toolIds: selectedIds });
  };

  const hasFollowedUp = (tool: AdminTool) => {
    const features = getFeatureRecord(tool);
    const followUp = getNestedRecord(features.followUp);
    return followUp.followedUp === true;
  };

  const getFollowedUpAt = (tool: AdminTool) => {
    const features = getFeatureRecord(tool);
    const followUp = getNestedRecord(features.followUp);
    const { followedUpAt } = followUp;
    return typeof followedUpAt === 'string' && followedUpAt.trim().length > 0 ? followedUpAt : null;
  };

  const isFollowUpStale = (tool: AdminTool) => {
    const followedUpAt = getFollowedUpAt(tool);
    if (!followedUpAt) {
      return false;
    }

    const followUpTime = new Date(followedUpAt).getTime();
    if (!Number.isFinite(followUpTime)) {
      return false;
    }

    return Date.now() - followUpTime >= 3 * 24 * 60 * 60 * 1000;
  };

  const overduePendingTools = tools.filter((tool) => isPendingOverdue(tool));

  const handleBulkFollowUp = async () => {
    if (overduePendingTools.length === 0) {
      toast.error('No overdue pending tools on this page');
      return;
    }

    setPendingAction({
      kind: 'bulk-followup',
      toolIds: overduePendingTools.map((tool) => tool.id),
    });
  };

  const closePendingAction = () => {
    setPendingAction(null);
    setActionReason('');
  };

  const runPendingAction = async () => {
    if (!pendingAction) {
      return;
    }

    const action = pendingAction;
    closePendingAction();

    if (action.kind === 'reject') {
      setLoading(action.toolId);
      const result = await rejectTool(action.toolId, actionReason.trim());
      setLoading(null);

      if (result.success) {
        toast.success('Tool rejected');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to reject tool');
      }
      return;
    }

    if (action.kind === 'delete') {
      setLoading(action.toolId);
      const result = await deleteTool(action.toolId);
      setLoading(null);

      if (result.success) {
        toast.success('Tool deleted');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to delete tool');
      }
      return;
    }

    if (action.kind === 'bulk-publish') {
      setLoading('bulk-publish');
      const result = await publishReadyTools(action.toolIds);
      setLoading(null);

      if (result.success) {
        setSelectedIds([]);
        const skippedText = result.skipped > 0 ? ` ${result.skipped} skipped by checklist.` : '';
        toast.success(`Published ${result.published} tool(s).${skippedText}`);
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to publish selected tools');
      }
      return;
    }

    setLoading('bulk-followup');
    const result = await markPendingFollowedUp(action.toolIds);
    setLoading(null);

    if (result.success) {
      toast.success(`Follow-up marked for ${result.updated} tool(s).`);
      router.refresh();
      return;
    }

    toast.error(result.error || 'Failed to mark follow-up');
  };

  const getPageHref = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());

    if (page > 1) {
      params.set('page', String(page));
    } else {
      params.delete('page');
    }

    const queryString = params.toString();
    return `/admin/tools${queryString ? `?${queryString}` : ''}`;
  };

  return (
    <div className='theme-surface rounded-lg border border-slate-200 shadow-sm'>
      {publishableTools.length > 0 && (
        <div className='flex flex-col gap-3 border-b border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <p className='text-sm font-semibold text-slate-900'>
              {publishableTools.length} ready draft(s) on this page
            </p>
            <p className='mt-1 text-sm text-slate-500'>
              Select reviewed drafts with complete media and publish them in one batch.
            </p>
          </div>
          <button
            type='button'
            onClick={handleBulkPublish}
            disabled={selectedIds.length === 0 || loading === 'bulk-publish'}
            className='inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50'
          >
            <CheckCheck className='h-4 w-4' />
            {loading === 'bulk-publish' ? 'Publishing...' : `Publish selected (${selectedIds.length})`}
          </button>
        </div>
      )}
      {overduePendingTools.length > 0 && (
        <div className='flex flex-col gap-3 border-b border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <p className='text-sm font-semibold text-slate-900'>
              {overduePendingTools.length} overdue pending tool(s) on this page
            </p>
            <p className='mt-1 text-sm text-slate-500'>
              Mark follow-up after contacting developers to reduce duplicate manual checks.
            </p>
          </div>
          <button
            type='button'
            onClick={handleBulkFollowUp}
            disabled={loading === 'bulk-followup'}
            className='inline-flex items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50'
          >
            {loading === 'bulk-followup' ? 'Saving...' : 'Mark followed up'}
          </button>
        </div>
      )}
      {pendingAction && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4'>
          <div className='w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl'>
            <h3 className='text-lg font-semibold text-slate-900'>Confirm action</h3>
            <p className='mt-2 text-sm text-slate-600'>
              {pendingAction.kind === 'reject' && 'Reject this tool and send an optional reason to the submitter.'}
              {pendingAction.kind === 'delete' && 'Delete this tool permanently. This cannot be undone.'}
              {pendingAction.kind === 'bulk-publish' &&
                `Publish ${pendingAction.toolIds.length} selected ready draft tool(s)?`}
              {pendingAction.kind === 'bulk-followup' &&
                `Mark ${pendingAction.toolIds.length} overdue pending tool(s) as followed up?`}
            </p>
            {pendingAction.kind === 'reject' && (
              <div className='mt-4 block'>
                <span id='rejection-reason-label' className='text-sm font-medium text-slate-700'>
                  Optional rejection reason
                </span>
                <textarea
                  id='rejection-reason'
                  aria-labelledby='rejection-reason-label'
                  value={actionReason}
                  onChange={(event) => setActionReason(event.target.value)}
                  rows={4}
                  className='mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-0 focus:border-emerald-500'
                  placeholder='Add a short note for the submitter'
                />
              </div>
            )}
            <div className='mt-6 flex justify-end gap-3'>
              <button
                type='button'
                onClick={closePendingAction}
                className='rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50'
              >
                Cancel
              </button>
              <button
                type='button'
                onClick={runPendingAction}
                className='rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800'
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-slate-200'>
          <thead className='bg-slate-50'>
            <tr>
              <th className='w-12 px-6 py-3 text-left'>
                <input
                  type='checkbox'
                  checked={allPublishableSelected}
                  onChange={toggleAllPublishable}
                  disabled={publishableTools.length === 0}
                  aria-label='Select all ready draft tools'
                  className='h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 disabled:opacity-40'
                />
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500'>Tool</th>
              <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500'>Owner</th>
              <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500'>Audit</th>
              <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500'>
                Status
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500'>Stats</th>
              <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500'>
                Created
              </th>
              <th className='px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-slate-200 bg-white'>
            {tools.map((tool) => {
              const publishReady = isPublishReady(tool);
              const pendingOverdue = isPendingOverdue(tool);
              const staleFollowUp = isFollowUpStale(tool);
              const rowClassName = getRowClassName(tool, publishReady, pendingOverdue, staleFollowUp);
              const qualityState = getQualityState(tool);
              const nextReviewDate = getNextReviewDate(tool);
              const rejectionReason = getRejectionReason(tool);
              const followedUpAt = getFollowedUpAt(tool);

              return (
                <tr key={tool.id} className={rowClassName}>
                  <td className='px-6 py-4'>
                    <input
                      type='checkbox'
                      checked={selectedIds.includes(tool.id)}
                      onChange={() => toggleTool(tool.id)}
                      disabled={!publishReady}
                      aria-label={`Select ${getTitle(tool)} for publishing`}
                      className='h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 disabled:opacity-30'
                    />
                  </td>
                  <td className='px-6 py-4'>
                    <div className='flex items-center'>
                      {tool.thumbnail_url ? (
                        <BaseImage
                          src={tool.thumbnail_url}
                          alt={`${getTitle(tool)} - AI tool thumbnail`}
                          width={40}
                          height={40}
                          className='mr-3 h-10 w-10 rounded object-cover'
                        />
                      ) : (
                        <div className='mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded bg-slate-100 text-xs font-semibold text-slate-500'>
                          {getTitle(tool).slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className='font-medium text-slate-900'>{getTitle(tool)}</div>
                        <div className='text-sm text-slate-500'>{tool.name}</div>
                        {tool.submitted_by && (
                          <div className='mt-1 inline-flex rounded-full bg-cyan-50 px-2 py-0.5 text-xs font-medium text-cyan-700'>
                            Developer submission
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4'>
                    <div className='flex flex-wrap gap-2'>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${getClaimStatusTone(tool.claimStatus)}`}
                      >
                        {getClaimStatusLabel(tool.claimStatus)}
                      </span>
                      <span className='inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700'>
                        {getOwnerLabel(tool)}
                      </span>
                    </div>
                    {tool.claimedAt && (
                      <div className='mt-2 text-xs text-slate-500'>
                        Claimed: {new Date(tool.claimedAt).toLocaleDateString()}
                      </div>
                    )}
                    <div className='mt-2'>
                      <Link
                        href={getClaimStatusHref(tool.claimStatus)}
                        className='inline-flex rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50'
                      >
                        View claim filter
                      </Link>
                    </div>
                  </td>
                  <td className='px-6 py-4'>
                    <div>{getQualityBadge(tool)}</div>
                    <div className='mt-2 flex max-w-xs flex-wrap gap-1.5'>
                      {getAuditSignals(tool).map((signal) => (
                        <span
                          key={signal.label}
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${signal.className}`}
                        >
                          {signal.label}
                        </span>
                      ))}
                    </div>
                    {getMissingInfo(tool).length > 0 && (
                      <div className='mt-2 text-xs text-slate-500'>Needs: {getMissingInfo(tool).join(', ')}</div>
                    )}
                  </td>
                  <td className='px-6 py-4'>
                    {getStatusBadge(tool.status)}
                    <div className='mt-2'>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${qualityState.tone}`}
                      >
                        {qualityState.label}
                      </span>
                    </div>
                    <div className='mt-2 text-xs text-slate-500'>
                      Next review: {nextReviewDate ? nextReviewDate.toLocaleDateString() : 'Unknown'}
                    </div>
                    {tool.page_quality_status && (
                      <div className='mt-1 text-xs text-slate-500'>
                        Stored status: {tool.page_quality_status}
                      </div>
                    )}
                    {tool.status === 'rejected' && rejectionReason && (
                      <div className='mt-2 max-w-xs rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs leading-5 text-red-800'>
                        <p className='font-semibold'>Reason</p>
                        <p className='mt-1 break-words'>{rejectionReason}</p>
                      </div>
                    )}
                    {pendingOverdue && (
                      <div className='mt-1 inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700'>
                        Overdue &gt; 48h
                      </div>
                    )}
                    {hasFollowedUp(tool) && (
                      <div className='mt-1'>
                        <div className='inline-flex rounded-full bg-cyan-100 px-2 py-0.5 text-xs font-semibold text-cyan-700'>
                          Followed up
                        </div>
                        {followedUpAt && (
                          <div className='mt-1 text-xs text-cyan-700'>{new Date(followedUpAt).toLocaleString()}</div>
                        )}
                        {staleFollowUp && (
                          <div className='mt-1 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700'>
                            Follow-up stale (&gt; 3d)
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className='px-6 py-4'>
                    <div className='text-sm text-slate-900'>
                      {tool.view_count} views • {tool.rating_count} ratings
                    </div>
                    <div className='text-sm text-slate-500'>⭐ {tool.average_rating.toFixed(1)}</div>
                  </td>
                  <td className='px-6 py-4 text-sm text-slate-500'>{new Date(tool.created_at).toLocaleDateString()}</td>
                  <td className='px-6 py-4 text-right'>
                    <div className='flex items-center justify-end gap-2'>
                      {tool.status === 'pending' && (
                        <>
                          <button
                            type='button'
                            onClick={() => handleApprove(tool.id)}
                            disabled={loading === tool.id}
                            aria-label={`Approve ${getTitle(tool)}`}
                            className='rounded border border-emerald-200 bg-emerald-50 p-1 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50'
                            title='Approve'
                          >
                            <Check className='h-5 w-5' />
                          </button>
                          <button
                            type='button'
                            onClick={() => handleReject(tool.id)}
                            disabled={loading === tool.id}
                            aria-label={`Reject ${getTitle(tool)}`}
                            className='rounded border border-rose-200 bg-rose-50 p-1 text-rose-700 hover:bg-rose-100 disabled:opacity-50'
                            title='Reject'
                          >
                            <X className='h-5 w-5' />
                          </button>
                        </>
                      )}
                      <Link
                        href={`/admin/tools/${tool.id}/edit`}
                        aria-label={`Edit ${getTitle(tool)}`}
                        className='rounded border border-slate-200 bg-slate-50 p-1 text-slate-700 hover:bg-slate-100'
                        title='Edit'
                      >
                        <Edit className='h-5 w-5' />
                      </Link>
                      <a
                        href={tool.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        aria-label={`Open official site for ${getTitle(tool)}`}
                        className='rounded border border-slate-200 bg-white p-1 text-slate-600 hover:bg-slate-50'
                        title='Visit Website'
                      >
                        <ExternalLink className='h-5 w-5' />
                      </a>
                      <button
                        type='button'
                        onClick={() => handleDelete(tool.id)}
                        disabled={loading === tool.id}
                        aria-label={`Delete ${getTitle(tool)}`}
                        className='rounded border border-rose-200 bg-rose-50 p-1 text-rose-700 hover:bg-rose-100 disabled:opacity-50'
                        title='Delete'
                      >
                        <Trash2 className='h-5 w-5' />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex items-center justify-between border-t border-slate-200 px-6 py-4'>
          <div className='text-sm text-slate-700'>
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, total)} of {total} results
          </div>
          <div className='flex gap-2'>
            {currentPage > 1 && (
              <Link
                href={getPageHref(currentPage - 1)}
                className='rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100'
              >
                Previous
              </Link>
            )}
            {currentPage < totalPages && (
              <Link
                href={getPageHref(currentPage + 1)}
                className='rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100'
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
