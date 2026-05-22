import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import EmailTestForm from './EmailTestForm';
import { getEmailTestLogs } from '@/app/actions/admin/email';

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'admin' });

  return {
    title: `${t('title')} - Email Test`,
  };
}

export default function AdminEmailTestPage({
  searchParams,
}: {
  searchParams?: {
    status?: string;
    recent?: string;
  };
}) {
  const status =
    searchParams?.status === 'success' ||
    searchParams?.status === 'failed' ||
    searchParams?.status === 'skipped'
      ? searchParams.status
      : 'all';
  const recentHours = searchParams?.recent === '24h' ? 24 : undefined;
  const logsPromise = getEmailTestLogs(20, status, recentHours);

  return (
    <div className="theme-page min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Email Test</h1>
        <p className="mt-2 text-slate-600">
          Send a test message to verify transactional email delivery.
        </p>
      </div>
      <EmailTestForm />
      <EmailTestLogs
        logsPromise={logsPromise}
        status={status}
        recent={recentHours ? '24h' : 'all'}
      />
    </div>
  );
}

async function EmailTestLogs({
  logsPromise,
  status,
  recent,
}: {
  logsPromise: ReturnType<typeof getEmailTestLogs>;
  status: 'all' | 'success' | 'failed' | 'skipped';
  recent: 'all' | '24h';
}) {
  const logs = await logsPromise;

  return (
    <section className="theme-surface mt-6 rounded-lg border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Recent Test Logs</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All time' },
            { key: '24h', label: 'Last 24h' },
          ].map((item) => (
            <Link
              key={item.key}
              href={
                item.key === 'all'
                  ? status === 'all'
                    ? '/admin/email-test'
                    : `/admin/email-test?status=${status}`
                  : status === 'all'
                  ? '/admin/email-test?recent=24h'
                  : `/admin/email-test?status=${status}&recent=24h`
              }
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                recent === item.key
                  ? 'bg-violet-700 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All' },
            { key: 'success', label: 'Success' },
            { key: 'failed', label: 'Failed' },
            { key: 'skipped', label: 'Skipped' },
          ].map((item) => (
            <Link
              key={item.key}
              href={
                item.key === 'all'
                  ? recent === '24h'
                    ? '/admin/email-test?recent=24h'
                    : '/admin/email-test'
                  : recent === '24h'
                  ? `/admin/email-test?status=${item.key}&recent=24h`
                  : `/admin/email-test?status=${item.key}`
              }
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                status === item.key
                  ? 'bg-cyan-700 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
      {logs.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">No logs yet.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-slate-600">Time</th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">Recipient</th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">Status</th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-3 py-2 text-slate-600">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-slate-900">{log.toEmail}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                        log.success
                          ? 'bg-emerald-100 text-emerald-700'
                          : log.skipped
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {log.success ? 'Success' : log.skipped ? 'Skipped' : 'Failed'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-slate-600">
                    {log.errorMessage || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
