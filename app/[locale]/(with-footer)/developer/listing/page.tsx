import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Mail, ShieldCheck, Sparkles } from 'lucide-react';

import { getListingPaymentMailto } from '@/lib/config/listing';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const isChinese = locale === 'cn' || locale === 'tw';

  return {
    title: isChinese ? 'Claim Listing | AI Best Tool' : 'Claim Listing | AI Best Tool',
    description: isChinese
      ? '认领你的工具条目，先留资，再决定是否需要更快审核或前排展示。'
      : 'Claim your tool listing, leave your details first, then decide whether you need faster review or featured placement.',
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default function DeveloperListingPage({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const mailtoHref = getListingPaymentMailto('Claim listing interest');

  const points = isChinese
    ? [
        '先确认这条 listing 是不是你的。',
        '留下邮箱、公司和官网，方便后续人工跟进。',
        '需要时再讨论更快审核或前排窗口。',
      ]
    : [
        'Confirm whether this listing is yours.',
        'Leave your email, company, and website so we can follow up.',
        'Decide later whether you want faster review or a featured window.',
      ];

  return (
    <div className='theme-page mx-auto max-w-pc px-4 py-8 lg:px-0'>
      <section className='rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm lg:p-10'>
        <div className='inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800'>
          <Sparkles className='size-3.5' />
          {isChinese ? '认领条目' : 'Claim listing'}
        </div>

        <div className='mt-5 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center'>
          <div className='space-y-5'>
            <h1 className='text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
              {isChinese ? '先认领，再决定要不要加速' : 'Claim first, then decide whether to speed things up'}
            </h1>
            <p className='max-w-2xl text-base leading-7 text-slate-600 lg:text-lg'>
              {isChinese
                ? '如果这个工具是你的，我们先把认领留资跑起来。后续要不要优先审核、前排展示，等信息确认清楚再谈。'
                : 'If this tool is yours, we start with a simple claim flow. Faster review and featured placement can come later once the details are clear.'}
            </p>

            <div className='grid gap-3 sm:grid-cols-3'>
              {points.map((point) => (
                <div
                  key={point}
                  className='rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700'
                >
                  {point}
                </div>
              ))}
            </div>

            <div className='flex flex-wrap gap-3'>
              <Link
                href={`/${locale}/submit`}
                className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-5 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
              >
                {isChinese ? '去提交页' : 'Go to submit'}
                <ArrowRight className='ml-2 size-4' />
              </Link>
              <a
                href={mailtoHref}
                className='inline-flex items-center justify-center rounded-lg border border-cyan-200 bg-cyan-50 px-5 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
              >
                <Mail className='mr-2 size-4' />
                {isChinese ? '发邮件认领' : 'Claim by email'}
              </a>
            </div>
          </div>

          <div className='rounded-2xl border border-cyan-100 bg-cyan-50 p-5'>
            <div className='flex items-start gap-3'>
              <ShieldCheck className='mt-0.5 size-5 text-cyan-700' />
              <div>
                <p className='text-sm font-semibold text-slate-950'>
                  {isChinese ? '当前流程很轻' : 'The flow stays lightweight'}
                </p>
                <p className='mt-1 text-sm leading-6 text-slate-600'>
                  {isChinese
                    ? '现在先不做复杂 owner dashboard。只要确认邮箱和身份，后面人工就能继续处理。'
                    : 'We are not building a heavy owner dashboard yet. Email and identity are enough for a human follow-up.'}
                </p>
              </div>
            </div>

            <div className='mt-5 space-y-3 rounded-xl border border-white bg-white p-4 text-sm leading-6 text-slate-700'>
              <div className='flex items-start gap-2'>
                <CheckCircle2 className='mt-0.5 size-4 shrink-0 text-emerald-600' />
                <span>
                  {isChinese
                    ? '人工确认认领，不依赖复杂权限系统。'
                    : 'Claim is confirmed manually, not through a heavy permission system.'}
                </span>
              </div>
              <div className='flex items-start gap-2'>
                <CheckCircle2 className='mt-0.5 size-4 shrink-0 text-emerald-600' />
                <span>
                  {isChinese
                    ? '有需要时再升级到优先审核或前排。'
                    : 'Upgrade to priority review or featured placement only when needed.'}
                </span>
              </div>
              <div className='flex items-start gap-2'>
                <CheckCircle2 className='mt-0.5 size-4 shrink-0 text-emerald-600' />
                <span>
                  {isChinese ? '先验证留资，再验证付费。' : 'Validate lead capture before validating paid conversion.'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
