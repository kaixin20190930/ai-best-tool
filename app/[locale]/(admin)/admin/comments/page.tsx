import Link from 'next/link';

import AdminCommentsModerationTable from '@/components/admin/AdminCommentsModerationTable';
import {
  getAdminComments,
  getCommentModerationSummary,
  getRecentCommentModerationLogs,
  sendCommentModerationDailyReport,
} from '@/app/actions/admin/comments';

export default async function AdminCommentsPage({
  searchParams,
}: {
  searchParams?: {
    status?: 'all' | 'visible' | 'hidden';
    reportState?: 'all' | 'unresolved';
    sort?: 'latest' | 'reports';
    logAction?: string;
  };
}) {
  try {
    const status =
      searchParams?.status === 'visible' || searchParams?.status === 'hidden' ? searchParams.status : 'all';
    const sort = searchParams?.sort === 'latest' ? 'latest' : 'reports';
    const reportState = searchParams?.reportState === 'unresolved' ? 'unresolved' : 'all';
    const logAction = (searchParams?.logAction || '').trim();
    const summary = await getCommentModerationSummary();
    const comments = await getAdminComments({ status, reportState, sort, limit: 120 });
    const logs = await getRecentCommentModerationLogs({ limit: 200, action: logAction || undefined });
    let priorityLabel = 'Moderation queue is in good shape';
    if (summary.unresolvedReportedComments > 0) {
      priorityLabel = 'Resolve unresolved reports first';
    } else if (summary.autoHiddenComments > 0) {
      priorityLabel = 'Review auto-hidden comments';
    }

    const csvRows = [
      ['id', 'action', 'target_count', 'created_at'],
      ...logs.map((log) => [log.id, log.action, String(log.targetCount), log.createdAt]),
    ];
    const csvContent = csvRows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
    const csvHref = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;

    return (
      <div>
        <div className='mb-6'>
          <div className='flex flex-wrap items-start justify-between gap-3'>
            <div>
              <h1 className='text-3xl font-bold text-slate-900'>Comments Moderation</h1>
              <p className='mt-2 text-slate-600'>Review user comments and hide spam or low-quality content.</p>
            </div>
            <form
              action={async () => {
                'use server';

                await sendCommentModerationDailyReport();
              }}
            >
              <button
                type='submit'
                className='rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50'
              >
                Send Daily Report
              </button>
            </form>
          </div>
        </div>

        <div className='mb-6 grid gap-4 md:grid-cols-3'>
          <div className='theme-surface rounded-lg border border-slate-200 p-4 shadow-sm'>
            <p className='text-sm font-medium text-slate-600'>Unresolved reported comments</p>
            <p className='mt-2 text-3xl font-semibold text-rose-700'>{summary.unresolvedReportedComments}</p>
          </div>
          <div className='theme-surface rounded-lg border border-slate-200 p-4 shadow-sm'>
            <p className='text-sm font-medium text-slate-600'>Auto-hidden comments</p>
            <p className='mt-2 text-3xl font-semibold text-amber-700'>{summary.autoHiddenComments}</p>
          </div>
          <div className='rounded-lg border border-cyan-200 bg-cyan-50 p-4 shadow-sm'>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>Priority</p>
            <p className='mt-2 text-sm font-medium text-slate-900'>{priorityLabel}</p>
            <p className='mt-1 text-sm leading-6 text-slate-600'>
              Use the filters below to jump straight into the queue that needs attention.
            </p>
          </div>
        </div>

        <div className='mb-4 flex flex-wrap items-center gap-2'>
          {[
            { key: 'all', label: 'All' },
            { key: 'visible', label: 'Visible' },
            { key: 'hidden', label: 'Hidden' },
          ].map((item) => (
            <Link
              key={item.key}
              href={item.key === 'all' ? '/admin/comments' : `/admin/comments?status=${item.key}`}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                status === item.key ? 'bg-cyan-700 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <div className='ml-2 h-6 w-px bg-slate-200' />
          {[
            { key: 'reports', label: 'Most Reported' },
            { key: 'latest', label: 'Latest' },
          ].map((item) => (
            <Link
              key={item.key}
              href={
                status === 'all'
                  ? `/admin/comments?sort=${item.key}`
                  : `/admin/comments?status=${status}&sort=${item.key}`
              }
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                sort === item.key ? 'bg-violet-700 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <div className='ml-2 h-6 w-px bg-slate-200' />
          {[
            { key: 'all', label: 'All Reports' },
            { key: 'unresolved', label: 'Unresolved Only' },
          ].map((item) => {
            let href = `/admin/comments?status=${status}&sort=${sort}&reportState=unresolved`;
            if (item.key === 'all') {
              href =
                status === 'all' ? `/admin/comments?sort=${sort}` : `/admin/comments?status=${status}&sort=${sort}`;
            } else if (status === 'all') {
              href = `/admin/comments?sort=${sort}&reportState=unresolved`;
            }

            return (
              <Link
                key={item.key}
                href={href}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                  reportState === item.key ? 'bg-rose-700 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <AdminCommentsModerationTable comments={comments} />

        <div className='theme-surface mt-6 rounded-lg border border-slate-200 p-4 shadow-sm'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <h2 className='text-base font-semibold text-slate-900'>Recent Moderation Actions</h2>
            <a
              href={csvHref}
              download={`comment-moderation-logs${logAction ? `-${logAction}` : ''}.csv`}
              className='rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50'
            >
              Download CSV
            </a>
          </div>
          <div className='mt-3 flex flex-wrap gap-2'>
            {[
              { key: '', label: 'All Actions' },
              { key: 'bulk_hide_comments', label: 'Bulk Hide' },
              { key: 'bulk_show_comments', label: 'Bulk Show' },
              { key: 'bulk_resolve_reports', label: 'Bulk Resolve' },
              { key: 'bulk_reopen_reports', label: 'Bulk Reopen' },
              { key: 'hide_comment', label: 'Single Hide' },
              { key: 'show_comment', label: 'Single Show' },
            ].map((item) => (
              <Link
                key={item.label}
                href={
                  item.key
                    ? `/admin/comments?status=${status}&sort=${sort}&reportState=${reportState}&logAction=${item.key}`
                    : `/admin/comments?status=${status}&sort=${sort}&reportState=${reportState}`
                }
                className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                  logAction === item.key ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          {logs.length === 0 ? (
            <p className='mt-3 text-sm text-slate-500'>No moderation actions yet.</p>
          ) : (
            <div className='mt-3 space-y-2'>
              {logs.map((log) => (
                <div
                  key={log.id}
                  className='flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2'
                >
                  <div className='text-sm text-slate-700'>
                    <span className='font-medium text-slate-900'>{log.action}</span>
                    <span className='ml-2 text-slate-500'>x{log.targetCount}</span>
                  </div>
                  <div className='text-xs text-slate-500'>{new Date(log.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Admin comments page failed to load:', error);
    return (
      <div className='rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-900'>
        <h1 className='text-2xl font-bold'>Comments moderation unavailable</h1>
        <p className='mt-2 text-sm leading-6'>
          The moderation queue could not finish loading right now. Refresh the page or try again later.
        </p>
        <div className='mt-4 flex flex-wrap gap-3'>
          <Link
            href='/admin'
            className='inline-flex items-center justify-center rounded-lg bg-rose-700 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-800'
          >
            Back to admin home
          </Link>
          <Link
            href='/admin/comments'
            className='inline-flex items-center justify-center rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-800 hover:bg-rose-100'
          >
            Retry comments
          </Link>
        </div>
      </div>
    );
  }
}
