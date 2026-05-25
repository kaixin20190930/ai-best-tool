'use client';

import { useMemo, useState, useTransition } from 'react';
import { Eye, EyeOff, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import type { AdminCommentItem } from '@/app/actions/admin/comments';
import {
  bulkSetCommentsHidden,
  bulkSetReportsResolved,
  setCommentHidden,
  setCommentReportsResolved,
} from '@/app/actions/admin/comments';

export default function AdminCommentsModerationTable({
  comments,
}: {
  comments: AdminCommentItem[];
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const allSelected = useMemo(
    () => comments.length > 0 && selectedIds.length === comments.length,
    [comments.length, selectedIds.length]
  );
  const unresolvedTotal = useMemo(
    () => comments.reduce((sum, item) => sum + (item.unresolvedReportCount || 0), 0),
    [comments]
  );
  const hiddenTotal = useMemo(
    () => comments.reduce((sum, item) => sum + (item.isHidden ? 1 : 0), 0),
    [comments]
  );

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleAll = () => {
    setSelectedIds(allSelected ? [] : comments.map((c) => c.id));
  };

  const runBulk = (fn: () => Promise<{ success: boolean; error?: string }>, okMsg: string) => {
    startTransition(async () => {
      const result = await fn();
      if (result.success) {
        toast.success(okMsg);
        setSelectedIds([]);
      } else {
        toast.error(result.error || 'Action failed');
      }
    });
  };

  return (
    <div className="theme-surface overflow-hidden rounded-lg border border-slate-200 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
        <button
          type="button"
          disabled={isPending || selectedIds.length === 0}
          onClick={() =>
            runBulk(() => bulkSetCommentsHidden(selectedIds, true), 'Selected comments hidden')
          }
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 disabled:opacity-50"
        >
          Bulk Hide
        </button>
        <button
          type="button"
          disabled={isPending || selectedIds.length === 0}
          onClick={() =>
            runBulk(() => bulkSetCommentsHidden(selectedIds, false), 'Selected comments shown')
          }
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 disabled:opacity-50"
        >
          Bulk Show
        </button>
        <button
          type="button"
          disabled={isPending || selectedIds.length === 0}
          onClick={() =>
            runBulk(() => bulkSetReportsResolved(selectedIds, true), 'Selected reports resolved')
          }
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 disabled:opacity-50"
        >
          Bulk Resolve Reports
        </button>
        <button
          type="button"
          disabled={isPending || selectedIds.length === 0}
          onClick={() =>
            runBulk(() => bulkSetReportsResolved(selectedIds, false), 'Selected reports reopened')
          }
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 disabled:opacity-50"
        >
          Bulk Reopen Reports
        </button>
        <span className="ml-auto text-xs text-slate-500">{selectedIds.length} selected</span>
      </div>
      <div className="flex flex-wrap items-center gap-4 border-b border-slate-200 bg-white px-4 py-2 text-xs text-slate-600">
        <span>{comments.length} comments in current view</span>
        <span>{unresolvedTotal} unresolved reports</span>
        <span>{hiddenTotal} hidden comments</span>
      </div>

      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left">
              <input type="checkbox" checked={allSelected} onChange={toggleAll} />
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Tool / Comment
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Signals
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Status
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {comments.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                No comments found for this filter.
              </td>
            </tr>
          ) : (
            comments.map((comment) => (
              <tr key={comment.id}>
                <td className="px-4 py-4 align-top">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(comment.id)}
                    onChange={() => toggleOne(comment.id)}
                  />
                </td>
                <td className="px-4 py-4 align-top">
                  <p className="text-sm font-semibold text-slate-900">{comment.toolName}</p>
                  <p className="mt-1 line-clamp-3 text-sm text-slate-700">{comment.content}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(comment.createdAt).toLocaleString()}
                  </p>
                </td>
                <td className="px-4 py-4 align-top text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-slate-400" />
                    <span>{comment.likes} likes</span>
                  </div>
                  <div className="mt-1 text-xs text-rose-600">
                    {comment.reportCount} reports ({comment.unresolvedReportCount} unresolved)
                  </div>
                </td>
                <td className="px-4 py-4 align-top">
                  {comment.isHidden ? (
                    <div className="space-y-1">
                      <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">
                        Hidden
                      </span>
                    </div>
                  ) : (
                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                      Visible
                    </span>
                  )}
                </td>
                <td className="px-4 py-4 align-top text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() =>
                        runBulk(
                          () => setCommentHidden(comment.id, !comment.isHidden),
                          comment.isHidden ? 'Comment shown' : 'Comment hidden'
                        )
                      }
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      {comment.isHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      {comment.isHidden ? 'Show' : 'Hide'}
                    </button>
                    {comment.reportCount > 0 && (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() =>
                          runBulk(
                            () => setCommentReportsResolved(comment.id, comment.unresolvedReportCount > 0),
                            comment.unresolvedReportCount > 0 ? 'Reports resolved' : 'Reports reopened'
                          )
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        {comment.unresolvedReportCount > 0 ? 'Mark resolved' : 'Reopen reports'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
