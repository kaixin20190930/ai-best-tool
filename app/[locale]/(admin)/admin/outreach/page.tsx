import Link from 'next/link';
import { ArrowRight, Filter, Mail, Users } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { requireAdmin } from '@/lib/auth/middleware';
import AdminOutreachClassificationTable from '@/components/admin/AdminOutreachClassificationTable';
import AdminOutreachQueueTable from '@/components/admin/AdminOutreachQueueTable';
import {
  getDeveloperOutreachQueue,
  getOutreachCommercialBridgeSummary,
  getOutreachExecutorSummary,
  getOutreachHistorySummary,
  getOutreachNeedsClassification,
} from '@/app/actions/admin/tools';

type OutreachFocus = 'all' | 'due_today' | 'featured' | 'claim' | 'collab';

function getOutreachFocusLabel(focus: OutreachFocus, isChinese: boolean): string {
  if (focus === 'due_today') return isChinese ? '今日到期' : 'Due today';
  if (focus === 'featured') return isChinese ? '前排展示' : 'Featured';
  if (focus === 'claim') return isChinese ? '认领邀约' : 'Claim';
  if (focus === 'collab') return isChinese ? '合作线索' : 'Collab';
  return isChinese ? '全部' : 'All';
}

function getOutreachFocusHint(focus: OutreachFocus, isChinese: boolean): string {
  if (focus === 'due_today') {
    return isChinese
      ? '先处理已经到期的跟进，避免最热的线索冷掉。'
      : 'Handle overdue follow-ups first so warm leads do not cool off.';
  }
  if (focus === 'featured') {
    return isChinese
      ? '先看有流量基础的条目，再决定是否值得推前排。'
      : 'Review traffic-backed listings first before pitching featured placement.';
  }
  if (focus === 'claim') {
    return isChinese
      ? '先把能认领的条目拉回到 owner 关系里。'
      : 'Pull claimable listings back into the owner relationship first.';
  }
  if (focus === 'collab') {
    return isChinese
      ? '先看有互动信号的条目，再判断要不要谈合作。'
      : 'Check engagement-backed listings first before starting collaboration talks.';
  }
  return isChinese
    ? '先看整体队列，再切到最该优先处理的子集。'
    : 'Review the full queue first, then narrow into the most urgent subset.';
}

function buildOutreachHref(focus: OutreachFocus) {
  if (focus === 'all') return '/admin/outreach';
  return `/admin/outreach?focus=${focus}`;
}

function formatRelativeCount(value: number, singular: string, plural?: string) {
  return `${value} ${value === 1 ? singular : plural || `${singular}s`}`;
}

export async function generateMetadata({ params }: { params: { locale: string } }) {
  try {
    const t = await getTranslations({ locale: params.locale, namespace: 'admin' });

    return {
      title: `${t('title')} - Outreach`,
    };
  } catch (error) {
    console.error('Admin outreach metadata failed to load:', error);
    return {
      title: 'Outreach',
    };
  }
}

export default async function AdminOutreachPage({
  params,
  searchParams,
}: {
  params: {
    locale: string;
  };
  searchParams?: {
    focus?: string;
  };
}) {
  const { locale } = params;
  const isChinese = locale === 'cn' || locale === 'tw';
  const focus =
    searchParams?.focus === 'due_today' ||
    searchParams?.focus === 'featured' ||
    searchParams?.focus === 'claim' ||
    searchParams?.focus === 'collab'
      ? (searchParams.focus as OutreachFocus)
      : 'all';

  try {
    await requireAdmin();

    const [outreachQueue, historySummary, classificationItems, bridgeSummary, executorSummary] = await Promise.all([
      getDeveloperOutreachQueue(20),
      getOutreachHistorySummary(),
      getOutreachNeedsClassification(12),
      getOutreachCommercialBridgeSummary(),
      getOutreachExecutorSummary(5),
    ]);

    const focusItems = outreachQueue.filter((item) => {
      if (focus === 'all') return true;
      if (focus === 'due_today') return item.outreachStatus === 'follow_up_due';
      if (focus === 'featured') return item.suggestion === 'featured_pitch';
      if (focus === 'claim') return item.suggestion === 'claim_listing';
      if (focus === 'collab') return item.suggestion === 'content_collab';
      return true;
    });

    const dueTodayCount = outreachQueue.filter((item) => item.outreachStatus === 'follow_up_due').length;
    const featuredCount = outreachQueue.filter((item) => item.suggestion === 'featured_pitch').length;
    const claimCount = outreachQueue.filter((item) => item.suggestion === 'claim_listing').length;
    const collabCount = outreachQueue.filter((item) => item.suggestion === 'content_collab').length;
    const startedCount = outreachQueue.filter((item) => item.outreachStatus !== 'not_started').length;
    const activeCount = outreachQueue.filter(
      (item) =>
        item.outreachStatus === 'contacted' ||
        item.outreachStatus === 'waiting_reply' ||
        item.outreachStatus === 'follow_up_due',
    ).length;
    const startedRate = outreachQueue.length > 0 ? Math.round((startedCount / outreachQueue.length) * 100) : 0;
    const activeRate = outreachQueue.length > 0 ? Math.round((activeCount / outreachQueue.length) * 100) : 0;
    const closeRate =
      historySummary.totalTracked > 0
        ? Math.round((historySummary.closedCount / historySummary.totalTracked) * 100)
        : 0;
    const paidRate =
      bridgeSummary.claimedFromOutreachCount > 0
        ? Math.round((bridgeSummary.paidPlanCount / bridgeSummary.claimedFromOutreachCount) * 100)
        : 0;
    const paymentRate =
      bridgeSummary.claimedFromOutreachCount > 0
        ? Math.round((bridgeSummary.paymentConfirmedCount / bridgeSummary.claimedFromOutreachCount) * 100)
        : 0;

    return (
      <div className='theme-page container mx-auto px-4 py-8'>
        <div className='mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
          <div className='max-w-3xl'>
            <div className='inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100'>
              <Mail className='size-3.5' />
              {isChinese ? '外联工作台' : 'Outreach workspace'}
            </div>
            <h1 className='mt-3 text-3xl font-bold text-slate-950 lg:text-4xl'>
              {isChinese
                ? '把认领、前排和协作外联放到同一处'
                : 'Keep claim, featured, and collab outreach in one place'}
            </h1>
            <p className='mt-3 text-sm leading-6 text-slate-600 lg:text-base'>
              {isChinese
                ? '这页用于每天处理可联系的工具线索：先筛选，再复制批次文案，再把进度写回去。'
                : 'Use this page to handle reachable tool leads every day: filter first, copy a batch draft, and write progress back into the queue.'}
            </p>
          </div>

          <div className='flex flex-wrap gap-3'>
            <Link
              href='/admin/claims'
              className='inline-flex items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-100'
            >
              {isChinese ? '认领队列' : 'Claim queue'}
            </Link>
            <Link
              href='/admin/email-ops'
              className='inline-flex items-center justify-center rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
            >
              {isChinese ? '邮件运营' : 'Email ops'}
            </Link>
          </div>
        </div>

        <section className='mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
          <div className='theme-surface rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
            <p className='text-sm font-medium text-slate-600'>{isChinese ? '待处理线索' : 'Leads in queue'}</p>
            <p className='mt-2 text-3xl font-semibold text-slate-950'>{outreachQueue.length}</p>
            <p className='mt-2 text-sm text-slate-500'>
              {isChinese ? '当前可联系的外联条目' : 'Reachable outreach leads right now'}
            </p>
          </div>
          <div className='theme-surface rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
            <p className='text-sm font-medium text-slate-600'>{isChinese ? '今日到期' : 'Due today'}</p>
            <p className='mt-2 text-3xl font-semibold text-amber-700'>{dueTodayCount}</p>
            <p className='mt-2 text-sm text-slate-500'>
              {isChinese ? '需要优先跟进' : 'Needs the first follow-up pass'}
            </p>
          </div>
          <div className='theme-surface rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
            <p className='text-sm font-medium text-slate-600'>{isChinese ? '已开始外联' : 'Started outreach'}</p>
            <p className='mt-2 text-3xl font-semibold text-cyan-700'>{startedRate}%</p>
            <p className='mt-2 text-sm text-slate-500'>
              {isChinese ? `已触达 ${startedCount} 条` : formatRelativeCount(startedCount, 'lead', 'leads')}
            </p>
          </div>
          <div className='theme-surface rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
            <p className='text-sm font-medium text-slate-600'>{isChinese ? '历史关闭率' : 'Historical close rate'}</p>
            <p className='mt-2 text-3xl font-semibold text-emerald-700'>{closeRate}%</p>
            <p className='mt-2 text-sm text-slate-500'>
              {isChinese
                ? `${historySummary.closedCount} / ${historySummary.totalTracked} 条已关闭`
                : `${historySummary.closedCount} of ${historySummary.totalTracked} tracked leads closed`}
            </p>
          </div>
        </section>

        <section className='mb-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm'>
          <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
            <div className='max-w-3xl'>
              <p className='text-sm font-semibold uppercase tracking-wide text-emerald-700'>
                {isChinese ? '当前焦点' : 'Current focus'}
              </p>
              <h2 className='mt-2 text-2xl font-bold text-slate-950'>{getOutreachFocusLabel(focus, isChinese)}</h2>
              <p className='mt-2 text-sm leading-6 text-slate-600'>{getOutreachFocusHint(focus, isChinese)}</p>
            </div>
            <div className='flex flex-wrap gap-2 text-xs font-semibold'>
              {(['all', 'due_today', 'featured', 'claim', 'collab'] as OutreachFocus[]).map((item) => (
                <Link
                  key={item}
                  href={buildOutreachHref(item)}
                  className={`rounded-full px-3 py-1.5 ring-1 ${
                    focus === item
                      ? 'bg-white text-emerald-800 ring-emerald-200'
                      : 'bg-white/60 text-slate-600 ring-white'
                  }`}
                >
                  {getOutreachFocusLabel(item, isChinese)}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className='mb-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-4'>
          <div className='theme-surface rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
            <p className='text-sm font-medium text-slate-600'>{isChinese ? '前排线索' : 'Featured-ready'}</p>
            <p className='mt-2 text-3xl font-semibold text-amber-700'>{featuredCount}</p>
          </div>
          <div className='theme-surface rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
            <p className='text-sm font-medium text-slate-600'>{isChinese ? '认领线索' : 'Claim leads'}</p>
            <p className='mt-2 text-3xl font-semibold text-emerald-700'>{claimCount}</p>
          </div>
          <div className='theme-surface rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
            <p className='text-sm font-medium text-slate-600'>{isChinese ? '协作线索' : 'Collab leads'}</p>
            <p className='mt-2 text-3xl font-semibold text-violet-700'>{collabCount}</p>
          </div>
          <div className='theme-surface rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
            <p className='text-sm font-medium text-slate-600'>{isChinese ? '活跃外联率' : 'Active outreach rate'}</p>
            <p className='mt-2 text-3xl font-semibold text-cyan-700'>{Math.max(activeRate, 0)}%</p>
          </div>
        </section>

        <section className='mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <p className='text-sm font-semibold uppercase tracking-wide text-slate-500'>
                {isChinese ? '批量操作' : 'Batch actions'}
              </p>
              <p className='mt-1 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '先复制 batch 文案，再逐个更新状态，避免线索堆在队列里。'
                  : 'Copy a batch draft first, then update statuses one by one so the queue does not stall.'}
              </p>
            </div>
            <Link
              href='/admin/analytics#outreach-queue'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800'
            >
              {isChinese ? '查看完整分析' : 'View full analytics'}
              <ArrowRight className='size-4' />
            </Link>
          </div>
        </section>

        <section className='mb-8'>
          <div className='mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
            <div>
              <h2 className='text-lg font-semibold text-slate-900'>{isChinese ? '外联队列' : 'Outreach queue'}</h2>
              <p className='mt-1 text-sm text-slate-600'>
                {isChinese
                  ? `当前显示 ${focusItems.length} / ${outreachQueue.length} 条`
                  : `Showing ${focusItems.length} / ${outreachQueue.length} leads`}
              </p>
            </div>
            <Link
              href={buildOutreachHref(focus)}
              className='inline-flex items-center gap-2 text-sm font-medium text-cyan-700 hover:underline'
            >
              <Filter className='size-4' />
              {isChinese ? '保留当前焦点' : 'Keep current focus'}
            </Link>
          </div>
          <AdminOutreachQueueTable items={focusItems} locale={locale} />
        </section>

        <section className='mb-8'>
          <div className='mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
            <div>
              <h2 className='text-lg font-semibold text-slate-900'>
                {isChinese ? '待分类关闭项' : 'Closed items needing classification'}
              </h2>
              <p className='mt-1 text-sm text-slate-600'>
                {isChinese
                  ? '把已经关闭但原因缺失的外联记录补齐，方便后面看转化。'
                  : 'Fill in closed outreach records that are still missing a reason so conversion tracking stays useful.'}
              </p>
            </div>
            <div className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600'>
              <Users className='size-3.5' />
              {historySummary.unclassifiedClosedCount} unclassified
            </div>
          </div>
          {classificationItems.length > 0 ? (
            <AdminOutreachClassificationTable items={classificationItems} locale={locale} />
          ) : (
            <div className='rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm leading-6 text-slate-600'>
              {isChinese ? '当前没有需要补分类的关闭项。' : 'No closed items need classification right now.'}
            </div>
          )}
        </section>

        <section className='grid gap-4 lg:grid-cols-2'>
          <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-slate-500'>
              {isChinese ? '外联到收入桥' : 'Outreach to revenue bridge'}
            </p>
            <div className='mt-4 grid gap-3 sm:grid-cols-2'>
              <div className='rounded-xl border border-cyan-100 bg-cyan-50 p-4'>
                <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
                  {isChinese ? '认领转化' : 'Claimed from outreach'}
                </p>
                <p className='mt-2 text-2xl font-bold text-cyan-800'>{bridgeSummary.claimedFromOutreachCount}</p>
              </div>
              <div className='rounded-xl border border-emerald-100 bg-emerald-50 p-4'>
                <p className='text-xs font-semibold uppercase tracking-wide text-emerald-700'>
                  {isChinese ? '已确认付款' : 'Payment confirmed'}
                </p>
                <p className='mt-2 text-2xl font-bold text-emerald-800'>{bridgeSummary.paymentConfirmedCount}</p>
              </div>
              <div className='rounded-xl border border-amber-100 bg-amber-50 p-4'>
                <p className='text-xs font-semibold uppercase tracking-wide text-amber-700'>
                  {isChinese ? '已保留前排' : 'Featured reserved'}
                </p>
                <p className='mt-2 text-2xl font-bold text-amber-800'>{bridgeSummary.featuredReservedCount}</p>
              </div>
              <div className='rounded-xl border border-violet-100 bg-violet-50 p-4'>
                <p className='text-xs font-semibold uppercase tracking-wide text-violet-700'>
                  {isChinese ? '已上线前排' : 'Featured live'}
                </p>
                <p className='mt-2 text-2xl font-bold text-violet-800'>{bridgeSummary.featuredLiveCount}</p>
              </div>
            </div>
            <p className='mt-4 text-sm leading-6 text-slate-600'>
              {isChinese
                ? `付费路径转化率 ${paidRate}% · 付款确认率 ${paymentRate}%`
                : `Paid-path rate ${paidRate}% · payment-confirmed rate ${paymentRate}%`}
            </p>
          </div>

          <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-slate-500'>
              {isChinese ? '最近执行者' : 'Recent executors'}
            </p>
            <div className='mt-4 space-y-3'>
              {executorSummary.length > 0 ? (
                executorSummary.map((item) => (
                  <div key={item.executorEmail} className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
                    <div className='flex items-start justify-between gap-3'>
                      <div>
                        <p className='text-sm font-semibold text-slate-950'>{item.executorEmail}</p>
                        <p className='mt-1 text-xs text-slate-500'>
                          {item.totalUpdates} updates · {item.recentUpdates} recent
                        </p>
                      </div>
                      <span className='rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200'>
                        {item.claimToFeaturedLiveRate}% featured
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className='rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600'>
                  {isChinese ? '暂时没有可见的执行者数据。' : 'No executor data is visible yet.'}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    );
  } catch (error) {
    console.error('Admin outreach page failed to load:', error);

    return (
      <div className='theme-page container mx-auto px-4 py-8'>
        <section className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
          <h1 className='text-2xl font-bold text-slate-950'>
            {isChinese ? '外联工作台暂时不可用' : 'Outreach workspace temporarily unavailable'}
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
              className='inline-flex items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-100'
            >
              {isChinese ? '去认领队列' : 'Open claim queue'}
            </Link>
          </div>
        </section>
      </div>
    );
  }
}
