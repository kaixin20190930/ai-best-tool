'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/app/navigation';
import { Check, X, Edit, Trash2, ExternalLink, CheckCheck } from 'lucide-react';
import {
  approveTool,
  rejectTool,
  deleteTool,
  publishReadyTools,
  markPendingFollowedUp,
} from '@/app/actions/admin/tools';
import type { AdminTool } from '@/app/actions/admin/tools';
import { toast } from 'sonner';
import BaseImage from '@/components/image/BaseImage';
import { getPaidListingPublishGate, getToolQuality } from '@/lib/services/toolQuality';

interface AdminToolsTableProps {
  tools: AdminTool[];
  total: number;
  currentPage: number;
}

export default function AdminToolsTable({
  tools,
  total,
  currentPage,
}: AdminToolsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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
    if (!confirm('Are you sure you want to reject this tool?')) {
      return;
    }

    setLoading(toolId);
    const result = await rejectTool(toolId);
    setLoading(null);

    if (result.success) {
      toast.success('Tool rejected');
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to reject tool');
    }
  };

  const handleDelete = async (toolId: string) => {
    if (!confirm('Are you sure you want to delete this tool? This action cannot be undone.')) {
      return;
    }

    setLoading(toolId);
    const result = await deleteTool(toolId);
    setLoading(null);

    if (result.success) {
      toast.success('Tool deleted');
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to delete tool');
    }
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

  const getContent = (tool: AdminTool) => {
    if (typeof tool.content === 'string') return tool.content;
    if (typeof tool.content === 'object' && tool.content !== null) {
      return tool.content.en || tool.content.zh || Object.values(tool.content)[0] || '';
    }
    return '';
  };

  const getMissingInfo = (tool: AdminTool) => {
    return getToolQuality(tool).missingLabels.map((label) => label.toLowerCase());
  };

  const getFeatureRecord = (tool: AdminTool) => {
    return tool.features && typeof tool.features === 'object'
      ? (tool.features as Record<string, unknown>)
      : {};
  };

  const getNestedRecord = (value: unknown) => {
    return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  };

  const getNumber = (value: unknown) => {
    return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
  };

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

    const plan = commercial.plan;
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
      signals.push({
        label: `AI ${relevanceScore}`,
        className:
          relevanceScore >= 60
            ? 'bg-green-50 text-green-700'
            : relevanceScore >= 50
              ? 'bg-amber-50 text-amber-700'
              : 'bg-red-50 text-red-700',
      });
    }

    if (typeof qualityScore === 'number') {
      signals.push({
        label: `Source ${qualityScore}`,
        className:
          qualityScore >= 80
            ? 'bg-green-50 text-green-700'
            : qualityScore >= 60
              ? 'bg-amber-50 text-amber-700'
              : 'bg-red-50 text-red-700',
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
    const color =
      score >= 80
        ? 'bg-green-50 text-green-700'
        : score >= 55
          ? 'bg-amber-50 text-amber-700'
          : 'bg-red-50 text-red-700';

    return (
      <span className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${color}`}>
        Quality {score}
      </span>
    );
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
    publishableTools.length > 0 &&
    publishableTools.every((tool) => selectedIds.includes(tool.id));

  const toggleTool = (toolId: string) => {
    setSelectedIds((current) =>
      current.includes(toolId)
        ? current.filter((id) => id !== toolId)
        : [...current, toolId]
    );
  };

  const toggleAllPublishable = () => {
    if (allPublishableSelected) {
      setSelectedIds((current) =>
        current.filter((id) => !publishableTools.some((tool) => tool.id === id))
      );
      return;
    }

    setSelectedIds((current) =>
      Array.from(new Set([...current, ...publishableTools.map((tool) => tool.id)]))
    );
  };

  const handleBulkPublish = async () => {
    if (selectedIds.length === 0) {
      toast.error('Select ready draft tools first');
      return;
    }

    if (!confirm(`Publish ${selectedIds.length} selected ready draft tool(s)?`)) {
      return;
    }

    setLoading('bulk-publish');
    const result = await publishReadyTools(selectedIds);
    setLoading(null);

    if (result.success) {
      setSelectedIds([]);
      const skippedText =
        result.skipped > 0 ? ` ${result.skipped} skipped by checklist.` : '';
      toast.success(`Published ${result.published} tool(s).${skippedText}`);
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to publish selected tools');
    }
  };

  const hasFollowedUp = (tool: AdminTool) => {
    const features = getFeatureRecord(tool);
    const followUp = getNestedRecord(features.followUp);
    return followUp.followedUp === true;
  };

  const getFollowedUpAt = (tool: AdminTool) => {
    const features = getFeatureRecord(tool);
    const followUp = getNestedRecord(features.followUp);
    const followedUpAt = followUp.followedUpAt;
    return typeof followedUpAt === 'string' && followedUpAt.trim().length > 0
      ? followedUpAt
      : null;
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

    if (!confirm(`Mark ${overduePendingTools.length} overdue pending tool(s) as followed up?`)) {
      return;
    }

    setLoading('bulk-followup');
    const result = await markPendingFollowedUp(overduePendingTools.map((tool) => tool.id));
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
    <div className="theme-surface rounded-lg border border-slate-200 shadow-sm">
      {publishableTools.length > 0 && (
        <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {publishableTools.length} ready draft(s) on this page
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Select reviewed drafts with complete media and publish them in one batch.
            </p>
          </div>
          <button
            type="button"
            onClick={handleBulkPublish}
            disabled={selectedIds.length === 0 || loading === 'bulk-publish'}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCheck className="h-4 w-4" />
            {loading === 'bulk-publish'
              ? 'Publishing...'
              : `Publish selected (${selectedIds.length})`}
          </button>
        </div>
      )}
      {overduePendingTools.length > 0 && (
        <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {overduePendingTools.length} overdue pending tool(s) on this page
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Mark follow-up after contacting developers to reduce duplicate manual checks.
            </p>
          </div>
          <button
            type="button"
            onClick={handleBulkFollowUp}
            disabled={loading === 'bulk-followup'}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading === 'bulk-followup' ? 'Saving...' : 'Mark followed up'}
          </button>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="w-12 px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allPublishableSelected}
                  onChange={toggleAllPublishable}
                  disabled={publishableTools.length === 0}
                  aria-label="Select all ready draft tools"
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 disabled:opacity-40"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Tool
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Audit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Stats
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {tools.map((tool) => {
              const publishReady = isPublishReady(tool);
              const pendingOverdue = isPendingOverdue(tool);
              const staleFollowUp = isFollowUpStale(tool);

              return (
              <tr
                key={tool.id}
                className={
                  publishReady
                    ? 'bg-emerald-50/50 hover:bg-emerald-50'
                    : pendingOverdue
                    ? 'bg-red-50/60 hover:bg-red-50'
                    : staleFollowUp
                    ? 'bg-amber-50/40 hover:bg-amber-50'
                    : tool.status === 'pending'
                    ? 'bg-amber-50/60 hover:bg-amber-50'
                    : 'hover:bg-slate-50'
                }
              >
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(tool.id)}
                    onChange={() => toggleTool(tool.id)}
                    disabled={!publishReady}
                    aria-label={`Select ${getTitle(tool)} for publishing`}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 disabled:opacity-30"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    {tool.thumbnail_url ? (
                      <BaseImage
                        src={tool.thumbnail_url}
                        alt={`${getTitle(tool)} - AI tool thumbnail`}
                        width={40}
                        height={40}
                        className="mr-3 h-10 w-10 rounded object-cover"
                      />
                    ) : (
                      <div className="mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded bg-slate-100 text-xs font-semibold text-slate-500">
                        {getTitle(tool).slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-slate-900">{getTitle(tool)}</div>
                      <div className="text-sm text-slate-500">{tool.name}</div>
                      {tool.submitted_by && (
                        <div className="mt-1 inline-flex rounded-full bg-cyan-50 px-2 py-0.5 text-xs font-medium text-cyan-700">
                          Developer submission
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>{getQualityBadge(tool)}</div>
                  <div className="mt-2 flex max-w-xs flex-wrap gap-1.5">
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
                    <div className="mt-2 text-xs text-slate-500">
                      Needs: {getMissingInfo(tool).join(', ')}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(tool.status)}
                  {pendingOverdue && (
                    <div className="mt-1 inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                      Overdue &gt; 48h
                    </div>
                  )}
                  {hasFollowedUp(tool) && (
                    <div className="mt-1">
                      <div className="inline-flex rounded-full bg-cyan-100 px-2 py-0.5 text-xs font-semibold text-cyan-700">
                        Followed up
                      </div>
                      {getFollowedUpAt(tool) && (
                        <div className="mt-1 text-xs text-cyan-700">
                          {new Date(getFollowedUpAt(tool) as string).toLocaleString()}
                        </div>
                      )}
                      {staleFollowUp && (
                        <div className="mt-1 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                          Follow-up stale (&gt; 3d)
                        </div>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-slate-900">
                    {tool.view_count} views • {tool.rating_count} ratings
                  </div>
                  <div className="text-sm text-slate-500">
                    ⭐ {tool.average_rating.toFixed(1)}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {new Date(tool.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {tool.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(tool.id)}
                          disabled={loading === tool.id}
                          className="rounded p-1 text-green-600 hover:bg-green-50 disabled:opacity-50"
                          title="Approve"
                        >
                          <Check className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleReject(tool.id)}
                          disabled={loading === tool.id}
                          className="rounded p-1 text-red-600 hover:bg-red-50 disabled:opacity-50"
                          title="Reject"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </>
                    )}
                    <Link
                      href={`/admin/tools/${tool.id}/edit`}
                      className="rounded p-1 text-cyan-700 hover:bg-cyan-50"
                      title="Edit"
                    >
                      <Edit className="h-5 w-5" />
                    </Link>
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded p-1 text-slate-600 hover:bg-slate-50"
                      title="Visit Website"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </a>
                    <button
                      onClick={() => handleDelete(tool.id)}
                      disabled={loading === tool.id}
                      className="rounded p-1 text-red-600 hover:bg-red-50 disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 className="h-5 w-5" />
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
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
          <div className="text-sm text-slate-700">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, total)} of {total} results
          </div>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <Link
                href={getPageHref(currentPage - 1)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Previous
              </Link>
            )}
            {currentPage < totalPages && (
              <Link
                href={getPageHref(currentPage + 1)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
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
