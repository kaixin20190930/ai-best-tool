'use client';

import { useState } from 'react';
import Link from 'next/link';

import { resendVerificationEmail } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function VerifyEmailPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleResend() {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError(null);
    setMessage(null);

    const result = await resendVerificationEmail(email);

    if (result.error) {
      setError(result.error);
    } else {
      setMessage(result.message || 'Verification email sent!');
    }

    setIsLoading(false);
  }

  return (
    <div className="theme-page container flex min-h-[calc(100vh-200px)] items-center justify-center py-10">
      <div className="theme-surface w-full max-w-md space-y-6 rounded-lg p-6 lg:p-8">
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cyan-100">
            <svg
              className="h-8 w-8 text-cyan-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-950">Check your email</h1>
          <p className="text-slate-500">
            We&apos;ve sent you a verification link. Please check your email and click the link to
            verify your account.
          </p>
        </div>

        {message && (
          <div className="rounded-md bg-green-50 p-4 text-sm text-green-800">
            {message}
          </div>
        )}

        {error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-700">
              Didn&apos;t receive the email?
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <Button onClick={handleResend} className="w-full bg-cyan-700 text-white hover:bg-cyan-800" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Resend verification email'}
          </Button>
        </div>

        <div className="text-center">
          <Link href="/login" className="text-sm text-cyan-700 hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
