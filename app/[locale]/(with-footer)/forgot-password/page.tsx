'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';

import { resetPassword } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    setIsLoading(true);
    setError(null);
    setMessage(null);

    const formData = new FormData();
    formData.append('email', values.email);

    const result = await resetPassword(formData);

    if (result.error) {
      setError(result.error);
    } else {
      setMessage(result.message || 'Password reset email sent!');
    }

    setIsLoading(false);
  }

  return (
    <div className="theme-page container flex min-h-[calc(100vh-200px)] items-center justify-center py-10">
      <div className="theme-surface w-full max-w-md space-y-6 rounded-lg p-6 lg:p-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-slate-950">Forgot password?</h1>
          <p className="text-slate-500">
            Enter your email address and we&apos;ll send you a link to reset your password.
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john@example.com" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full bg-cyan-700 text-white hover:bg-cyan-800" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send reset link'}
            </Button>
          </form>
        </Form>

        <div className="text-center">
          <Link href="/login" className="text-sm text-cyan-700 hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
