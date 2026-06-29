'use client';

import { useState } from 'react';

import { sendTestEmail } from '@/app/actions/admin/email';
import { useRouter } from '@/app/navigation';

export default function EmailTestForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setResult(null);

    const response = await sendTestEmail({ to: email });

    setLoading(false);
    if (response.success) {
      setResult({ type: 'success', message: 'Test email sent successfully.' });
      router.refresh();
      return;
    }

    setResult({
      type: 'error',
      message:
        response.error ||
        (response.skipped ? 'Email skipped because mailer is not configured.' : 'Failed to send test email.'),
    });
  };

  return (
    <div className='theme-surface max-w-xl rounded-lg border border-slate-200 p-6 shadow-sm'>
      <h2 className='text-lg font-semibold text-slate-900'>Send Test Email</h2>
      <p className='mt-1 text-sm text-slate-600'>
        Use this page to verify your `RESEND_API_KEY` and `MAIL_FROM` configuration.
      </p>

      <form onSubmit={handleSubmit} className='mt-4 space-y-4'>
        <div>
          <p className='mb-1 text-sm font-medium text-slate-700'>Recipient Email</p>
          <input
            id='test-email'
            type='email'
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder='you@example.com'
            aria-label='Recipient Email'
            required
            className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-200'
          />
        </div>

        <button
          type='submit'
          disabled={loading}
          className='rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700 hover:bg-cyan-100 disabled:opacity-50'
        >
          {loading ? 'Sending...' : 'Send Test Email'}
        </button>
      </form>

      {result && (
        <div
          className={`mt-4 rounded-lg px-3 py-2 text-sm ${
            result.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {result.message}
        </div>
      )}
    </div>
  );
}
