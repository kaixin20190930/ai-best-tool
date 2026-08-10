import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CreditCard, LifeBuoy, Settings2, Sparkles } from 'lucide-react';

import { getDistributionDashboard } from '@/app/actions/distribution';
import { getDistributionPriceId } from '@/lib/services/stripe';

type DistributionWorkspaceSearchParams = {
  project?: string | string[];
};

function pickValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function DistributionSettingsPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams?: DistributionWorkspaceSearchParams;
}) {
  const locale = params.locale;
  const result = await getDistributionDashboard(pickValue(searchParams?.project));
  const redirectUrl = `/${locale}/distribution/settings${searchParams ? `?project=${pickValue(searchParams.project) || ''}` : ''}`;
  const isChinese = locale === 'cn';

  if (!result.success) {
    if (result.error === 'Unauthorized') {
      redirect(`/${locale}/login?redirect=${encodeURIComponent(redirectUrl)}`);
    }
    return <div className='mx-auto max-w-5xl px-5 py-16 text-center text-slate-700'>{result.error}</div>;
  }

  const data = result.data;
  if (!data) {
    return <div className='mx-auto max-w-4xl px-5 py-16 text-slate-700'>Workspace data unavailable.</div>;
  }

  const planRows = [
    {
      plan: 'pro',
      label: 'Pro',
      monthly: '$19/mo',
      yearly: '$190/yr',
      detail: isChinese ? '最多管理 5 个项目' : 'Manage up to 5 projects',
      active: data.plan === 'pro',
    },
    {
      plan: 'agency',
      label: 'Agency',
      monthly: '$49/mo',
      yearly: '$490/yr',
      detail: isChinese ? '最多管理 25 个项目' : 'Manage up to 25 projects',
      active: data.plan === 'agency',
    },
  ];

  const planCount =
    data.plan === 'agency'
      ? data.projectLimit
      : data.plan === 'pro'
        ? data.projectLimit
        : 1;

  return (
    <div className='space-y-6'>
      <section className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700'>
              {isChinese ? '套餐与配置' : 'Billing & Settings'}
            </p>
            <h1 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '分发工作台套餐与偏好' : 'Distribution plan and preferences'}
            </h1>
            <p className='mt-1 max-w-2xl text-sm text-slate-600'>
              {isChinese
                ? '当前是工作台订阅能力设置页。付费状态变化后，目标站任务不会丢失，会保留已生成的数据。'
                : 'This is the workspace entitlement and preference page. Payment status changes preserve generated targets and task data.'}
            </p>
          </div>
          <Link
            href={`/${locale}/distribution`}
            className='rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:border-cyan-300 hover:text-cyan-700'
          >
            {isChinese ? '返回今日工作台' : 'Back to Today'}
          </Link>
        </div>
      </section>

      <section className='rounded-2xl border border-cyan-200 bg-white p-5 shadow-sm'>
        <div className='text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700'>
          {isChinese ? '当前订阅能力' : 'Current entitlement'}
        </div>
        <div className='mt-4 grid gap-3 sm:grid-cols-2'>
          <div className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
            <div className='flex items-center gap-2 text-sm font-bold text-slate-900'>
              <Sparkles className='h-4 w-4 text-cyan-700' />
              {isChinese ? '当前计划' : 'Current plan'}
            </div>
            <div className='mt-3 text-2xl font-extrabold text-slate-900'>
              {isChinese ? 'Pro' : 'Pro'}{' '}
              <span className='text-sm font-semibold text-cyan-700'>({data.plan.toUpperCase()})</span>
            </div>
            <div className='mt-1 text-xs text-slate-600'>{isChinese ? '项目上限' : 'Project limit'}</div>
            <div className='text-sm font-bold text-slate-900'>{planCount}</div>
          </div>
          <div className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
            <div className='flex items-center gap-2 text-sm font-bold text-slate-900'>
              <LifeBuoy className='h-4 w-4 text-cyan-700' />
              {isChinese ? '产品条目' : 'Current products'}
            </div>
            <div className='mt-3 text-sm text-slate-700'>{data.projects.length}</div>
            <div className='mt-1 text-xs text-slate-500'>
              {isChinese
                ? `可用配额 ${data.projects.length}/${planCount}`
                : `Used / total: ${data.projects.length}/${planCount}`}
            </div>
            <Link href={`/${locale}/distribution/products`} className='mt-3 inline-flex items-center rounded-lg text-xs font-bold text-cyan-700'>
              {isChinese ? '管理项目设置' : 'Manage products'}
            </Link>
          </div>
        </div>
      </section>

      <section className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
        <div className='flex items-center gap-2 text-sm font-bold text-slate-900'>
          <CreditCard className='h-4 w-4 text-slate-700' />
          {isChinese ? '升级方案' : 'Upgrade options'}
        </div>
        <p className='mt-1 text-sm text-slate-600'>
          {isChinese
            ? '可在升级后立刻增加项目容量和多产品管理能力，历史数据可继续使用。'
            : 'After upgrade you can increase capacity and unlock multi-product operations; historical data remains available.'}
        </p>
        <div className='mt-4 grid gap-3 sm:grid-cols-2'>
          {planRows.map((plan) => {
            const monthlyAvailable = Boolean(getDistributionPriceId(plan.plan as 'pro' | 'agency', 'monthly'));
            const yearlyAvailable = Boolean(getDistributionPriceId(plan.plan as 'pro' | 'agency', 'yearly'));
            return (
              <div
                key={plan.plan}
                className={`rounded-xl border p-4 ${
                  plan.active
                    ? 'border-cyan-300 bg-cyan-50'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className='flex items-center justify-between'>
                  <div className='font-bold text-slate-900'>{plan.label}</div>
                  <span className='text-xs font-bold text-slate-700'>{plan.monthly}</span>
                </div>
                <p className='mt-1 text-xs text-slate-600'>{plan.detail}</p>
                <p className='mt-1 text-xs text-slate-500'>
                  {isChinese ? `年付 ${plan.yearly}` : `Yearly ${plan.yearly}`}
                </p>
                <div className='mt-3 flex flex-wrap gap-2'>
                  {monthlyAvailable ? (
                    <a
                      href={`/api/payments/stripe/distribution/checkout?plan=${plan.plan}&interval=monthly`}
                      className='inline-flex rounded-lg bg-cyan-700 px-3 py-2 text-xs font-bold text-white hover:bg-cyan-800'
                    >
                      {isChinese ? '月付' : 'Monthly'}
                    </a>
                  ) : null}
                  {yearlyAvailable ? (
                    <a
                      href={`/api/payments/stripe/distribution/checkout?plan=${plan.plan}&interval=yearly`}
                      className='inline-flex rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800'
                    >
                      {isChinese ? '年付' : 'Yearly'}
                    </a>
                  ) : null}
                  {!monthlyAvailable && !yearlyAvailable ? (
                    <span className='text-xs text-slate-500'>{isChinese ? '暂未配置' : 'Not configured yet'}</span>
                  ) : null}
                </div>
                <div className='mt-2 text-[11px] text-slate-500'>{plan.active ? (isChinese ? '当前使用中' : 'Current') : ''}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
        <div className='flex items-center gap-2 text-sm font-bold text-slate-900'>
          <Settings2 className='h-4 w-4 text-slate-700' />
          {isChinese ? '工作流建议' : 'Workflow recommendations'}
        </div>
        <ol className='mt-3 space-y-2 text-sm text-slate-700'>
          <li>1. {isChinese ? '完成 3 个项目目标资料，避免第一周阻塞。' : 'Finish materials for three key projects to reduce onboarding delays.'}</li>
          <li>2. {isChinese ? '每次只打开一个任务去完成提交，形成可追踪闭环。' : 'Work one task at a time and keep each action logged.'}</li>
          <li>3. {isChinese ? '记录上线异常并建立 7/30/90 复查。' : 'Record URL issues and run 7/30/90 day checks.'}</li>
        </ol>
      </section>
    </div>
  );
}
