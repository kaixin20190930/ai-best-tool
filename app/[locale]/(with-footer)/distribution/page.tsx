import Link from 'next/link';

import DistributionDashboard from '@/components/distribution/DistributionDashboard';
import { getDistributionDashboard } from '@/app/actions/distribution';

export default async function DistributionPage() {
  const result = await getDistributionDashboard();

  if (!result.success) {
    return <div className='mx-auto w-full max-w-5xl px-5 py-16 text-center text-slate-700'>{result.error}</div>;
  }

  if (!result.access) {
    return (
      <div className='mx-auto w-full max-w-4xl px-5 py-16'>
        <div className='rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12'>
          <div className='text-xs font-bold uppercase tracking-[0.2em] text-cyan-700'>Distribution workspace</div>
          <h1 className='mt-4 text-3xl font-bold tracking-tight text-slate-950'>Turn promotion into an operating system.</h1>
          <p className='mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-600'>Track where to submit, what to prepare, which mentions are live, and when to follow up. This is a paid workspace feature for product owners and small growth teams.</p>
          <Link href='/pricing' className='mt-7 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800'>View plans</Link>
          <p className='mt-4 text-xs text-slate-500'>Access is enabled after an active distribution entitlement is granted.</p>
        </div>
      </div>
    );
  }

  return <div className='w-full px-5 py-10 sm:px-8 lg:px-12'><DistributionDashboard data={result.data} /></div>;
}
