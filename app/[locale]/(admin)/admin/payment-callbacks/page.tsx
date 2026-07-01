import Link from 'next/link';

import { getPaymentCallbackLogs } from '@/app/actions/admin/paymentCallbacks';

async function PaymentCallbackLogs({
  logsPromise,
  status,
  recent,
}: {
  logsPromise: ReturnType<typeof getPaymentCallbackLogs>;
  status: 'all' | 'success' | 'failed';
  recent: 'all' | '24h';
}) {
  try {
    const logs = await logsPromise;

    return (
      <section className='theme-surface mt-6 rounded-lg border border-slate-200 p-6 shadow-sm'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <h2 className='text-lg font-semibold text-slate-900'>Recent Callback Logs</h2>
          <div className='flex flex-wrap gap-2'>
            {[
              { key: 'all', label: 'All time' },
              { key: '24h', label: 'Last 24h' },
            ].map((item) => {
              let href = `/admin/payment-callbacks?status=${status}&recent=24h`;
              if (item.key === 'all') {
                href = status === 'all' ? '/admin/payment-callbacks' : `/admin/payment-callbacks?status=${status}`;
              } else if (status === 'all') {
                href = '/admin/payment-callbacks?recent=24h';
              }

              return (
                <Link
                  key={item.key}
                  href={href}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    recent === item.key ? 'bg-violet-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
          <div className='flex flex-wrap gap-2'>
            {[
              { key: 'all', label: 'All' },
              { key: 'success', label: 'Success' },
              { key: 'failed', label: 'Failed' },
            ].map((item) => {
              let href = `/admin/payment-callbacks?status=${item.key}`;
              if (item.key === 'all') {
                href = recent === '24h' ? '/admin/payment-callbacks?recent=24h' : '/admin/payment-callbacks';
              } else if (recent === '24h') {
                href = `/admin/payment-callbacks?status=${item.key}&recent=24h`;
              }

              return (
                <Link
                  key={item.key}
                  href={href}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    status === item.key ? 'bg-cyan-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {logs.length === 0 ? (
          <p className='mt-3 text-sm text-slate-500'>No callback logs yet.</p>
        ) : (
          <div className='mt-4 overflow-x-auto'>
            <table className='min-w-full divide-y divide-slate-200 text-sm'>
              <thead className='bg-slate-50'>
                <tr>
                  <th className='px-3 py-2 text-left font-medium text-slate-600'>Time</th>
                  <th className='px-3 py-2 text-left font-medium text-slate-600'>Tool ID</th>
                  <th className='px-3 py-2 text-left font-medium text-slate-600'>Transaction ID</th>
                  <th className='px-3 py-2 text-left font-medium text-slate-600'>Status</th>
                  <th className='px-3 py-2 text-left font-medium text-slate-600'>Source</th>
                  <th className='px-3 py-2 text-left font-medium text-slate-600'>Message</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-200'>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className='px-3 py-2 text-slate-600'>{new Date(log.createdAt).toLocaleString()}</td>
                    <td className='px-3 py-2 text-slate-900'>{log.toolId || '-'}</td>
                    <td className='px-3 py-2 text-slate-900'>{log.transactionId || '-'}</td>
                    <td className='px-3 py-2'>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          log.status === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {log.status === 'success' ? 'Success' : 'Failed'}
                      </span>
                    </td>
                    <td className='px-3 py-2 text-slate-600'>{log.source || '-'}</td>
                    <td className='px-3 py-2 text-slate-600'>{log.errorMessage || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    );
  } catch (error) {
    console.error('Payment callback logs failed to load:', error);
    return (
      <section className='theme-surface mt-6 rounded-lg border border-rose-200 p-6 shadow-sm'>
        <h2 className='text-lg font-semibold text-rose-900'>Recent Callback Logs</h2>
        <p className='mt-3 text-sm leading-6 text-rose-800'>
          The log table could not be loaded right now. Please refresh the page or try again later.
        </p>
      </section>
    );
  }
}

export default function AdminPaymentCallbacksPage({
  searchParams,
}: {
  searchParams?: {
    status?: string;
    recent?: string;
  };
}) {
  try {
    const status =
      searchParams?.status === 'success' || searchParams?.status === 'failed' ? searchParams.status : 'all';
    const recentHours = searchParams?.recent === '24h' ? 24 : undefined;
    const logsPromise = getPaymentCallbackLogs(50, status, recentHours);

    return (
      <div className='theme-page min-h-screen'>
        <div className='mb-6'>
          <h1 className='text-3xl font-bold text-slate-900'>Payment Callback Logs</h1>
          <p className='mt-2 text-slate-600'>Inspect payment callback outcomes from monitor endpoint integrations.</p>
        </div>
        <PaymentCallbackLogs logsPromise={logsPromise} status={status} recent={recentHours ? '24h' : 'all'} />
      </div>
    );
  } catch (error) {
    console.error('Admin payment callbacks page failed to load:', error);
    return (
      <div className='rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-900'>
        <h1 className='text-2xl font-bold'>Payment callback logs unavailable</h1>
        <p className='mt-2 text-sm leading-6'>
          The callback log viewer could not finish loading right now. Please try again later, or return to the admin
          home.
        </p>
        <div className='mt-4 flex flex-wrap gap-3'>
          <Link
            href='/admin'
            className='inline-flex items-center justify-center rounded-lg bg-rose-700 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-800'
          >
            Back to admin home
          </Link>
          <Link
            href='/admin/payment-callbacks'
            className='inline-flex items-center justify-center rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-800 hover:bg-rose-100'
          >
            Retry logs
          </Link>
        </div>
      </div>
    );
  }
}
