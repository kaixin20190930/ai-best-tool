'use client';

import Link from 'next/link';
import { Fragment, useState } from 'react';
import { useRouter } from '@/app/navigation';
import { toast } from 'sonner';

import {
  enrichCollectionCandidatesAction,
  importCollectionCandidateAction,
  importCollectionCandidatesAction,
  rejectCollectionCandidatesAction,
  rejectLowScoreCollectionCandidatesAction,
  rescoreCollectionCandidatesAction,
} from '@/app/actions/admin/collection';
import type {
  CollectionCandidate,
  CollectionCandidateScoreFilter,
  CollectionCandidateStatus,
} from '@/lib/services/admin/collection';

function getStatusClass(status: CollectionCandidate['status']) {
  switch (status) {
    case 'new':
      return 'bg-cyan-50 text-cyan-700';
    case 'imported':
      return 'bg-green-50 text-green-700';
    case 'skipped':
      return 'bg-slate-100 text-slate-600';
    case 'rejected':
      return 'bg-red-50 text-red-700';
    default:
      return 'bg-slate-100 text-slate-600';
  }
}

function getScoreClass(score: number) {
  if (score >= 75) {
    return 'bg-green-50 text-green-700 ring-green-100';
  }

  if (score >= 50) {
    return 'bg-amber-50 text-amber-800 ring-amber-100';
  }

  return 'bg-red-50 text-red-700 ring-red-100';
}

function getPayloadText(
  payload: Record<string, unknown>,
  key:
    | 'canonicalUrl'
    | 'externalUrl'
    | 'imageUrl'
    | 'enrichmentStatus'
    | 'productHuntRedirectUrl'
) {
  if (key === 'enrichmentStatus') {
    return typeof payload.enrichmentStatus === 'string' ? payload.enrichmentStatus : undefined;
  }

  if (key === 'productHuntRedirectUrl') {
    return typeof payload.productHuntRedirectUrl === 'string'
      ? payload.productHuntRedirectUrl
      : undefined;
  }

  const detailMetadata = payload.detailMetadata;

  if (!detailMetadata || typeof detailMetadata !== 'object') {
    return undefined;
  }

  const value = (detailMetadata as Record<string, unknown>)[key];
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function getCandidateChecklist(candidate: CollectionCandidate) {
  const detailMetadata = candidate.raw_payload.detailMetadata;
  const detailRecord =
    detailMetadata && typeof detailMetadata === 'object'
      ? (detailMetadata as Record<string, unknown>)
      : {};
  const tags = Array.isArray(candidate.raw_payload.tags)
    ? candidate.raw_payload.tags.filter((tag) => typeof tag === 'string' && tag.trim())
    : [];
  const description = typeof candidate.summary === 'string' ? candidate.summary.trim() : '';
  const detailText =
    typeof detailRecord.description === 'string'
      ? detailRecord.description.trim()
      : typeof candidate.raw_payload.detail === 'string'
        ? candidate.raw_payload.detail.trim()
        : '';

  return [
    candidate.raw_payload.category_id || candidate.raw_payload.categorySlug ? null : 'Missing category',
    getPayloadText(candidate.raw_payload, 'imageUrl') ? null : 'Missing logo',
    getPayloadText(candidate.raw_payload, 'externalUrl') || getPayloadText(candidate.raw_payload, 'canonicalUrl')
      ? null
      : 'Missing source URL',
    description.length >= 80 ? null : 'Short description',
    detailText.length >= 160 ? null : 'Short detail',
    Array.isArray(tags) && tags.length > 0 ? null : 'Missing tags',
  ].filter(Boolean) as string[];
}

const statusLabels: Array<{ label: string; value: CollectionCandidateStatus | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'New', value: 'new' },
  { label: 'Imported', value: 'imported' },
  { label: 'Skipped', value: 'skipped' },
  { label: 'Rejected', value: 'rejected' },
];

const scoreFilterLabels: Array<{
  label: string;
  value: CollectionCandidateScoreFilter;
}> = [
  { label: 'All scores', value: 'all' },
  { label: 'Promising', value: 'promising' },
  { label: 'Low AI', value: 'low' },
];

export default function AdminCollectionCandidatesTable({
  candidates,
  stats,
  pagination,
  activeStatus = 'new',
  activeScoreFilter = 'all',
}: {
  candidates: CollectionCandidate[];
  stats: Record<CollectionCandidateStatus, number>;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  activeStatus?: CollectionCandidateStatus | 'all';
  activeScoreFilter?: CollectionCandidateScoreFilter;
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState<'import' | 'reject' | null>(null);
  const [isRejectingLowScore, setIsRejectingLowScore] = useState(false);
  const [isRescoring, setIsRescoring] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const selectableCandidates = candidates.filter((candidate) => candidate.status === 'new');
  const allSelectableSelected =
    selectableCandidates.length > 0 &&
    selectableCandidates.every((candidate) => selectedIds.includes(candidate.id));

  const importCandidate = async (id: string) => {
    setLoadingId(id);
    const result = await importCollectionCandidateAction(id);
    setLoadingId(null);

    if (result.success) {
      toast.success('Candidate imported as draft');
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to import candidate');
    }
  };

  const toggleCandidate = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((candidateId) => candidateId !== id)
        : [...current, id]
    );
  };

  const toggleAllSelectable = () => {
    setSelectedIds((current) => {
      if (allSelectableSelected) {
        return current.filter(
          (id) => !selectableCandidates.some((candidate) => candidate.id === id)
        );
      }

      return Array.from(
        new Set([...current, ...selectableCandidates.map((candidate) => candidate.id)])
      );
    });
  };

  const importSelected = async () => {
    if (selectedIds.length === 0) {
      return;
    }

    setBulkLoading('import');
    const result = await importCollectionCandidatesAction(selectedIds);
    setBulkLoading(null);

    if (result.success) {
      toast.success(`Imported ${result.importedCount || 0} candidates`);
      setSelectedIds([]);
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to import candidates');
    }
  };

  const rejectSelected = async () => {
    if (selectedIds.length === 0) {
      return;
    }

    setBulkLoading('reject');
    const result = await rejectCollectionCandidatesAction(selectedIds);
    setBulkLoading(null);

    if (result.success) {
      toast.success(`Rejected ${result.updatedCount || 0} candidates`);
      setSelectedIds([]);
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to reject candidates');
    }
  };

  const rejectLowScoreCandidates = async () => {
    setIsRejectingLowScore(true);
    const result = await rejectLowScoreCollectionCandidatesAction();
    setIsRejectingLowScore(false);

    if (result.success) {
      toast.success(`Rejected ${result.updatedCount || 0} low-AI candidates`);
      setSelectedIds([]);
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to reject low-AI candidates');
    }
  };

  const rescoreCandidates = async () => {
    setIsRescoring(true);
    const result = await rescoreCollectionCandidatesAction();
    setIsRescoring(false);

    if (result.success) {
      toast.success(`Rescored ${result.updatedCount || 0} candidates`);
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to rescore candidates');
    }
  };

  const enrichCandidates = async () => {
    setIsEnriching(true);
    const result = await enrichCollectionCandidatesAction();
    setIsEnriching(false);

    if (result.success) {
      toast.success(
        `Enriched ${result.enrichedCount || 0} of ${result.checkedCount || 0} checked candidates`
      );
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to enrich candidates');
    }
  };

  const goToPage = (page: number) => {
    const nextPage = Math.min(Math.max(page, 1), pagination.totalPages);
    router.push(
      `/admin/collection?candidateStatus=${activeStatus}&candidateScore=${activeScoreFilter}&candidatePage=${nextPage}`
    );
  };

  const goToStatus = (status: CollectionCandidateStatus | 'all') => {
    router.push(
      `/admin/collection?candidateStatus=${status}&candidateScore=${activeScoreFilter}&candidatePage=1`
    );
  };

  const goToScoreFilter = (scoreFilter: CollectionCandidateScoreFilter) => {
    router.push(
      `/admin/collection?candidateStatus=${activeStatus}&candidateScore=${scoreFilter}&candidatePage=1`
    );
  };

  return (
    <div className="theme-surface overflow-hidden rounded-lg border border-slate-200 shadow-sm">
      <div className="border-b border-slate-200 px-6 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Collected candidates</h2>
            <p className="mt-1 text-sm text-slate-600">
              Newly discovered tools from RSS and HTML sources, ready for editorial review.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {statusLabels.map((status) => {
              const count =
                status.value === 'all'
                  ? stats.new + stats.imported + stats.skipped + stats.rejected
                  : stats[status.value];

              return (
                <button
                  key={status.value}
                  type="button"
                  onClick={() => goToStatus(status.value)}
                  className={
                    activeStatus === status.value
                      ? 'rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white'
                      : 'rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50'
                  }
                >
                  {status.label} {count}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-600">
              {selectedIds.length} selected from {selectableCandidates.length} actionable candidates
              <span className="ml-2 text-slate-400">
                Showing {candidates.length} of {pagination.total}
              </span>
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {scoreFilterLabels.map((scoreFilter) => (
                <button
                  key={scoreFilter.value}
                  type="button"
                  onClick={() => goToScoreFilter(scoreFilter.value)}
                  className={
                    activeScoreFilter === scoreFilter.value
                      ? 'rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white'
                      : 'rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50'
                  }
                >
                  {scoreFilter.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={isEnriching || isRescoring || Boolean(bulkLoading)}
              onClick={enrichCandidates}
              className="rounded-lg border border-cyan-200 px-3 py-2 text-sm font-semibold text-cyan-700 hover:bg-cyan-50 disabled:opacity-50"
            >
              {isEnriching ? 'Enriching...' : 'Enrich details'}
            </button>
            <button
              type="button"
              disabled={isRescoring || isEnriching || Boolean(bulkLoading)}
              onClick={rescoreCandidates}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              {isRescoring ? 'Scoring...' : 'Rescore'}
            </button>
            <button
              type="button"
              disabled={selectedIds.length === 0 || Boolean(bulkLoading)}
              onClick={importSelected}
              className="rounded-lg bg-cyan-600 px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-50"
            >
              {bulkLoading === 'import' ? 'Importing...' : 'Create drafts'}
            </button>
            <button
              type="button"
              disabled={
                isRejectingLowScore ||
                selectedIds.length === 0 ||
                Boolean(bulkLoading)
              }
              onClick={rejectSelected}
              className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              {bulkLoading === 'reject' ? 'Rejecting...' : 'Reject'}
            </button>
            <button
              type="button"
              disabled={isRejectingLowScore || Boolean(bulkLoading)}
              onClick={rejectLowScoreCandidates}
              className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              {isRejectingLowScore ? 'Rejecting...' : 'Reject low AI'}
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="w-12 px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelectableSelected}
                  disabled={selectableCandidates.length === 0}
                  onChange={toggleAllSelectable}
                  aria-label="Select all new candidates"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Candidate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Source
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {candidates.map((candidate) => (
              <Fragment key={candidate.id}>
                <tr className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(candidate.id)}
                      disabled={candidate.status !== 'new'}
                      onChange={() => toggleCandidate(candidate.id)}
                      aria-label={`Select ${candidate.title || candidate.normalized_url}`}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <p className="max-w-xl font-medium text-slate-900">
                      {candidate.title || candidate.normalized_url}
                    </p>
                    {candidate.summary && (
                      <p className="mt-1 max-w-xl text-sm text-slate-500">
                        {candidate.summary}
                      </p>
                    )}
                    <a
                      href={candidate.normalized_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block max-w-xl truncate text-sm text-cyan-700 hover:text-cyan-800"
                    >
                      {candidate.normalized_url}
                    </a>
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedId(expandedId === candidate.id ? null : candidate.id)
                      }
                      className="mt-2 text-xs font-semibold text-slate-500 hover:text-slate-900"
                    >
                      {expandedId === candidate.id ? 'Hide details' : 'View details'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <p>{candidate.source_name || 'Unknown source'}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {new Date(candidate.created_at).toLocaleString()}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    {(() => {
                      const isReadyToImport = candidate.status === 'new' && candidate.relevance_score >= 50 && candidate.quality_score >= 80;
                      const checklist = getCandidateChecklist(candidate);

                      return (
                        <div className="mb-2">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-semibold ${
                              isReadyToImport
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {isReadyToImport ? 'Ready to import' : 'Needs enrichment'}
                          </span>
                          {!isReadyToImport && checklist.length > 0 ? (
                            <p className="mt-2 max-w-48 text-xs text-amber-700">
                              Needs: {checklist.slice(0, 3).join(', ')}
                              {checklist.length > 3 ? '…' : ''}
                            </p>
                          ) : null}
                        </div>
                      );
                    })()}
                    <div className="flex flex-col gap-1">
                      <span
                        className={`w-fit rounded-full px-2 py-1 text-xs font-semibold ring-1 ${getScoreClass(
                          candidate.relevance_score
                        )}`}
                      >
                        AI {candidate.relevance_score}/100
                      </span>
                      <span
                        className={`w-fit rounded-full px-2 py-1 text-xs font-semibold ring-1 ${getScoreClass(
                          candidate.quality_score
                        )}`}
                      >
                        Quality {candidate.quality_score}/100
                      </span>
                    </div>
                    {candidate.score_reason && (
                      <p className="mt-2 max-w-48 text-xs text-slate-500">
                        {candidate.score_reason}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${getStatusClass(
                        candidate.status
                      )}`}
                    >
                      {candidate.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {candidate.status === 'imported' && candidate.tool_id ? (
                      <Link
                        href={`/admin/tools/${candidate.tool_id}/edit`}
                        className="text-sm font-medium text-cyan-700 hover:text-cyan-800"
                      >
                        Edit draft
                      </Link>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          disabled={loadingId === candidate.id || candidate.status !== 'new'}
                          onClick={() => importCandidate(candidate.id)}
                          className="rounded-lg bg-cyan-600 px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-50"
                        >
                          {loadingId === candidate.id ? 'Importing...' : 'Create draft'}
                        </button>
                        <button
                          type="button"
                          disabled={candidate.status !== 'new' || Boolean(bulkLoading)}
                          onClick={async () => {
                            setBulkLoading('reject');
                            const result = await rejectCollectionCandidatesAction([candidate.id]);
                            setBulkLoading(null);

                            if (result.success) {
                              toast.success('Candidate rejected');
                              setSelectedIds((current) =>
                                current.filter((id) => id !== candidate.id)
                              );
                              router.refresh();
                            } else {
                              toast.error(result.error || 'Failed to reject candidate');
                            }
                          }}
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
                {expandedId === candidate.id && (
                  <tr>
                    <td className="bg-slate-50 px-6 py-4" />
                    <td colSpan={5} className="bg-slate-50 px-6 py-4">
                      <div className="grid gap-4 text-sm md:grid-cols-4">
                        <div>
                          <p className="font-semibold text-slate-900">Normalized URL</p>
                          <a
                            href={candidate.normalized_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 block break-all text-cyan-700 hover:text-cyan-800"
                          >
                            {candidate.normalized_url}
                          </a>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">Imported tool</p>
                          {candidate.tool_id ? (
                            <Link
                              href={`/admin/tools/${candidate.tool_id}/edit`}
                              className="mt-1 block break-all text-cyan-700 hover:text-cyan-800"
                            >
                              {candidate.tool_id}
                            </Link>
                          ) : (
                            <p className="mt-1 text-slate-500">Not imported</p>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">Score reason</p>
                          <p className="mt-1 text-slate-600">
                            {candidate.score_reason || 'No score reason available'}
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">Enrichment</p>
                          <p className="mt-1 text-slate-600">
                            {getPayloadText(candidate.raw_payload, 'enrichmentStatus') ||
                              'Not enriched'}
                          </p>
                          {getCandidateChecklist(candidate).length > 0 && (
                            <div className="mt-2">
                              <p className="font-semibold text-slate-900">Checklist</p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {getCandidateChecklist(candidate).map((item) => (
                                  <span
                                    key={item}
                                    className="rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700"
                                  >
                                    {item}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {getPayloadText(candidate.raw_payload, 'externalUrl') && (
                            <a
                              href={getPayloadText(candidate.raw_payload, 'externalUrl')}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1 block break-all text-cyan-700 hover:text-cyan-800"
                            >
                              Official URL
                            </a>
                          )}
                          {getPayloadText(candidate.raw_payload, 'productHuntRedirectUrl') && (
                            <a
                              href={
                                getPayloadText(
                                  candidate.raw_payload,
                                  'productHuntRedirectUrl'
                                ) || '#'
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1 block break-all text-cyan-700 hover:text-cyan-800"
                            >
                              Product Hunt redirect
                            </a>
                          )}
                          {getPayloadText(candidate.raw_payload, 'imageUrl') && (
                            <a
                              href={getPayloadText(candidate.raw_payload, 'imageUrl')}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1 block break-all text-cyan-700 hover:text-cyan-800"
                            >
                              Preview image
                            </a>
                          )}
                        </div>
                      </div>

                      <p className="mt-3 text-xs text-slate-500">
                        Updated {new Date(candidate.updated_at).toLocaleString()}
                      </p>

                      <pre className="mt-4 max-h-72 overflow-auto rounded-lg bg-slate-900 p-4 text-xs text-slate-100">
                        {JSON.stringify(candidate.raw_payload || {}, null, 2)}
                      </pre>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {candidates.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-500">
                  No candidates collected yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-slate-600">
          Page {pagination.page} of {pagination.totalPages}, {pagination.total} total
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={pagination.page <= 1}
            onClick={() => goToPage(pagination.page - 1)}
            className="rounded-lg border border-slate-300 px-3 py-2 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Previous
          </button>
          {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, index) => {
            const start = Math.max(
              Math.min(pagination.page - 2, pagination.totalPages - 4),
              1
            );
            const page = start + index;

            if (page > pagination.totalPages) {
              return null;
            }

            return (
              <button
                key={page}
                type="button"
                onClick={() => goToPage(page)}
                className={
                  page === pagination.page
                    ? 'rounded-lg bg-slate-900 px-3 py-2 font-semibold text-white'
                    : 'rounded-lg border border-slate-300 px-3 py-2 font-semibold text-slate-700 hover:bg-slate-50'
                }
              >
                {page}
              </button>
            );
          })}
          <button
            type="button"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => goToPage(pagination.page + 1)}
            className="rounded-lg border border-slate-300 px-3 py-2 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
