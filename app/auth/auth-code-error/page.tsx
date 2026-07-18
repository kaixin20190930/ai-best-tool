import Link from 'next/link';

import { getNoindexMetadata } from '@/lib/seo/indexing';
import { Button } from '@/components/ui/button';

export const metadata = {
  ...getNoindexMetadata(),
};

export default function AuthCodeErrorPage() {
  return (
    <div className='theme-page container flex min-h-screen items-center justify-center py-10'>
      <div className='w-full max-w-md space-y-6 text-center'>
        <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100'>
          <svg className='h-8 w-8 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
          </svg>
        </div>

        <div className='space-y-2'>
          <h1 className='text-3xl font-bold text-slate-900'>Authentication Error</h1>
          <p className='text-slate-500'>
            Sorry, we couldn&apos;t complete your authentication. The link may have expired or is invalid.
          </p>
        </div>

        <div className='space-y-2'>
          <Button asChild className='w-full'>
            <Link href='/login'>Try logging in again</Link>
          </Button>
          <Button asChild variant='outline' className='w-full'>
            <Link href='/'>Go to homepage</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
