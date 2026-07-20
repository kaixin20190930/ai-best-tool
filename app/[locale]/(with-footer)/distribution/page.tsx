import Link from 'next/link';
import { redirect } from 'next/navigation';

import DistributionDashboard from '@/components/distribution/DistributionDashboard';
import { getDistributionDashboard } from '@/app/actions/distribution';
import { getDistributionPriceId } from '@/lib/services/stripe';

export default async function DistributionPage({ params, searchParams }: { params: { locale: string }; searchParams: { project?: string } }) {
  const result = await getDistributionDashboard(searchParams.project);

  if (!result.success) {
    if (result.error === 'Unauthorized') {
      redirect(`/${params.locale}/login?redirect=/${params.locale}/distribution`);
    }
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
          <div className='mx-auto mt-8 grid max-w-2xl gap-3 text-left sm:grid-cols-2'>
            {[
              { plan: 'pro', label: 'Pro', monthly: '$19/mo', yearly: '$190/yr', detail: 'Up to 5 product projects' },
              { plan: 'agency', label: 'Agency', monthly: '$49/mo', yearly: '$490/yr', detail: 'Up to 25 product projects' },
            ].map((item) => {
              const monthlyAvailable = Boolean(getDistributionPriceId(item.plan as 'pro' | 'agency', 'monthly'));
              const yearlyAvailable = Boolean(getDistributionPriceId(item.plan as 'pro' | 'agency', 'yearly'));
              return (
                <div key={item.plan} className='rounded-2xl border border-slate-200 bg-slate-50 p-4'>
                  <div className='flex items-center justify-between'><span className='font-bold text-slate-900'>{item.label}</span><span className='text-sm font-bold text-cyan-700'>{item.monthly} · {item.yearly}</span></div>
                  <p className='mt-2 text-xs text-slate-600'>{item.detail}</p>
                  <div className='mt-4 flex flex-wrap gap-2'>
                    {monthlyAvailable && <a href={`/api/payments/stripe/distribution/checkout?plan=${item.plan}&interval=monthly`} className='inline-flex rounded-lg bg-cyan-700 px-3 py-2 text-xs font-bold text-white hover:bg-cyan-800'>Monthly</a>}
                    {yearlyAvailable && <a href={`/api/payments/stripe/distribution/checkout?plan=${item.plan}&interval=yearly`} className='inline-flex rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800'>Yearly</a>}
                    {!monthlyAvailable && !yearlyAvailable && <div className='text-xs font-semibold text-slate-400'>Coming soon</div>}
                  </div>
                </div>
              );
            })}
          </div>
          <p className='mt-4 text-xs text-slate-500'>Access is enabled after Stripe checkout and webhook confirmation.</p>
        </div>
      </div>
    );
  }

  return <div className='w-full px-5 py-10 sm:px-8 lg:px-12'><DistributionDashboard data={result.data} locale={params.locale} /></div>;
}
