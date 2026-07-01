import Link from 'next/link';
import { ArrowRight, Mail, Sparkles } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { requireAdmin } from '@/lib/auth/middleware';
import { getEmailOpsSummaryBySystem } from '@/lib/services/admin/emailOps';
import AdminEmailOpsPanel from '@/components/admin/AdminEmailOpsPanel';

export async function generateMetadata({ params }: { params: { locale: string } }) {
  try {
    const t = await getTranslations({ locale: params.locale, namespace: 'admin' });

    return {
      title: `${t('title')} - Email Ops`,
    };
  } catch (error) {
    console.error('Admin email ops metadata failed to load:', error);
    return {
      title: 'Email Ops',
    };
  }
}

export default async function AdminEmailOpsPage({
  params,
}: {
  params: {
    locale: string;
  };
}) {
  const { locale } = params;
  const isChinese = locale === 'cn' || locale === 'tw';

  try {
    await requireAdmin();
    const emailOpsSummary = await getEmailOpsSummaryBySystem();

    return (
      <div className='theme-page container mx-auto px-4 py-8'>
        <div className='mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
          <div className='max-w-3xl'>
            <div className='inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700 ring-1 ring-cyan-100'>
              <Mail className='size-3.5' />
              {isChinese ? '邮件运营工作台' : 'Email ops workspace'}
            </div>
            <h1 className='mt-3 text-3xl font-bold text-slate-950 lg:text-4xl'>
              {isChinese ? '把认领和续期邮件单独盯起来' : 'Keep claim and renewal emails in one place'}
            </h1>
            <p className='mt-3 text-sm leading-6 text-slate-600 lg:text-base'>
              {isChinese
                ? '这里是 60 天游标里的邮件运营中心：认领邀约、前排续期提醒、以及它们最近 24 小时的发送状态。'
                : 'This is the email operations center for the 60-day plan: claim invites, featured renewal reminders, and their last-24h sending status.'}
            </p>
          </div>

          <div className='flex flex-wrap gap-3'>
            <Link
              href='/admin/claims'
              className='inline-flex items-center justify-center rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
            >
              {isChinese ? '认领队列' : 'Claim queue'}
            </Link>
            <Link
              href='/admin/analytics'
              className='inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '回到分析页' : 'Back to analytics'}
            </Link>
          </div>
        </div>

        <section className='mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
          <div className='theme-surface rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
            <p className='text-sm font-medium text-slate-600'>{isChinese ? '认领邀约' : 'Claim invites'}</p>
            <p className='mt-2 text-3xl font-semibold text-cyan-700'>{emailOpsSummary.claimInvitesSent24h}</p>
            <p className='mt-2 text-sm text-slate-500'>
              {isChinese ? '过去 24 小时发送' : 'Sent in the last 24 hours'}
            </p>
          </div>
          <div className='theme-surface rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
            <p className='text-sm font-medium text-slate-600'>{isChinese ? '续期提醒' : 'Renewal reminders'}</p>
            <p className='mt-2 text-3xl font-semibold text-amber-700'>{emailOpsSummary.featuredRenewalsSent24h}</p>
            <p className='mt-2 text-sm text-slate-500'>
              {isChinese ? '过去 24 小时发送' : 'Sent in the last 24 hours'}
            </p>
          </div>
          <div className='theme-surface rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
            <p className='text-sm font-medium text-slate-600'>{isChinese ? '认领最后发送' : 'Claims last sent'}</p>
            <p className='mt-2 text-lg font-semibold text-slate-950'>
              {emailOpsSummary.claimInvitesLastSentAt
                ? new Date(emailOpsSummary.claimInvitesLastSentAt).toLocaleString()
                : 'never'}
            </p>
          </div>
          <div className='theme-surface rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
            <p className='text-sm font-medium text-slate-600'>{isChinese ? '续期最后发送' : 'Renewals last sent'}</p>
            <p className='mt-2 text-lg font-semibold text-slate-950'>
              {emailOpsSummary.featuredRenewalsLastSentAt
                ? new Date(emailOpsSummary.featuredRenewalsLastSentAt).toLocaleString()
                : 'never'}
            </p>
          </div>
        </section>

        <section className='mb-6 rounded-2xl border border-cyan-100 bg-cyan-50 p-5 shadow-sm'>
          <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
            <div className='max-w-3xl'>
              <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
                {isChinese ? '工作重点' : 'Operating focus'}
              </p>
              <h2 className='mt-2 text-2xl font-bold text-slate-950'>
                {isChinese ? '优先把这两类邮件跑稳' : 'Keep these two email loops running'}
              </h2>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '认领邀约负责把工具方拉回到留资和回复里，续期提醒负责把前排窗口变成回头付费。'
                  : 'Claim invites bring tool owners back into lead capture and replies, while renewal reminders turn featured windows into repeat revenue.'}
              </p>
            </div>
            <div className='inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-cyan-800 ring-1 ring-cyan-100'>
              <Sparkles className='size-3.5' />
              {isChinese ? '独立工作台' : 'Dedicated workspace'}
            </div>
          </div>
        </section>

        <AdminEmailOpsPanel summary={emailOpsSummary} />

        <section className='mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <p className='text-sm font-semibold uppercase tracking-wide text-slate-500'>
                {isChinese ? '下一步' : 'Next step'}
              </p>
              <p className='mt-1 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '如果邮件开始出量，就去认领队列检查新回复；如果续期变少，就回到 submissions 看哪些前排窗口快到期。'
                  : 'When sends start moving, check the claim queue for fresh replies; when renewals slow down, review My Submissions for expiring featured windows.'}
              </p>
            </div>
            <Link
              href='/admin/analytics#email-ops'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800'
            >
              {isChinese ? '查看完整分析' : 'View full analytics'}
              <ArrowRight className='size-4' />
            </Link>
          </div>
        </section>
      </div>
    );
  } catch (error) {
    console.error('Admin email ops page failed to load:', error);

    return (
      <div className='theme-page container mx-auto px-4 py-8'>
        <section className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
          <h1 className='text-2xl font-bold text-slate-950'>
            {isChinese ? '邮件运营暂时不可用' : 'Email ops is temporarily unavailable'}
          </h1>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {isChinese
              ? '这页现在没能完成加载。你可以先回到分析页或认领队列。'
              : 'This page could not finish loading right now. You can return to analytics or the claim queue.'}
          </p>
          <div className='mt-5 flex flex-wrap gap-3'>
            <Link
              href='/admin/analytics'
              className='inline-flex items-center justify-center rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800'
            >
              {isChinese ? '回到分析页' : 'Back to analytics'}
            </Link>
            <Link
              href='/admin/claims'
              className='inline-flex items-center justify-center rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
            >
              {isChinese ? '去认领队列' : 'Open claim queue'}
            </Link>
          </div>
        </section>
      </div>
    );
  }
}
