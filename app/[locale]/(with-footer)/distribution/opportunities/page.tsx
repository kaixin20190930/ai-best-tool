import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  BellRing,
  CheckCircle2,
  CircleAlert,
  CircleDollarSign,
  CirclePlus,
  Clock3,
  ExternalLink,
  ListChecks,
  PackageOpen,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import { DistributionActionForm, DistributionSubmitButton } from '@/components/distribution/DistributionActionForm';
import {
  acceptDistributionTarget,
  getDistributionDashboard,
  type DistributionDashboard,
} from '@/app/actions/distribution';
import { getDistributionPriceId } from '@/lib/services/stripe';

type DistributionWorkspaceSearchParams = {
  project?: string | string[];
};

function pickValue(value: undefined | string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function toChineseBoolean(value: boolean, locale: string) {
  return locale === 'cn' ? (value ? '是' : '否') : value ? 'Yes' : 'No';
}

function deriveOpportunityStatus(status: string | null | undefined) {
  if (!status) return 'recommended';
  if (
    status === 'accepted' ||
    status === 'in_progress' ||
    status === 'submitted' ||
    status === 'live' ||
    status === 'blocked' ||
    status === 'follow_up'
  ) {
    return 'selected';
  }
  if (status === 'skipped') return 'skipped';
  return 'other';
}

function buildOpportunitySection(
  data: DistributionDashboard,
  status: 'recommended' | 'selected' | 'skipped' | 'other',
  locale: string,
  projectId: string,
) {
  const allCards = data.targetRecommendations || [];
  const taskByTargetId = (() => {
    const map = new Map<string, { id: string; updatedAt: string | null }>();
    for (const task of data.tasks || []) {
      if (!task.targetId) continue;
      const key = String(task.targetId);
      const existing = map.get(key);
      if (!existing || (task.updatedAt && existing.updatedAt && task.updatedAt > existing.updatedAt) || (!existing.updatedAt && task.updatedAt)) {
        map.set(key, { id: String(task.id), updatedAt: task.updatedAt || null });
      }
    }
    return map;
  })();

  const cards = allCards.filter((item) => deriveOpportunityStatus(item.opportunityStatus || null) === status);
  const titleMap = {
    recommended: locale === 'cn' ? '推荐机会' : 'Recommended opportunities',
    selected: locale === 'cn' ? '已选择' : 'Selected',
    skipped: locale === 'cn' ? '已跳过' : 'Skipped',
    other: locale === 'cn' ? '历史状态' : 'Other state',
  };
  const emptyMap = {
    recommended: locale === 'cn' ? '暂无新建议，先确认资料后再试。' : 'No new recommendations yet. Confirm profile first and refresh.',
    selected: locale === 'cn' ? '尚未选择任何目标。' : 'No selected opportunities yet.',
    skipped: locale === 'cn' ? '暂无已跳过记录。' : 'No skipped opportunities.',
    other: locale === 'cn' ? '暂无其他状态。' : 'No historical opportunities.',
  };

  const renderStatusLabel = (value: string | null | undefined) => {
    if (!value) return locale === 'cn' ? '待开启' : 'Pending';
    if (
      value === 'accepted' ||
      value === 'in_progress' ||
      value === 'submitted' ||
      value === 'live' ||
      value === 'blocked' ||
      value === 'follow_up'
    ) {
      return locale === 'cn' ? '执行中' : 'In progress';
    }
    if (value === 'skipped') return locale === 'cn' ? '已跳过' : 'Skipped';
    if (value === 'rejected') return locale === 'cn' ? '已拒绝' : 'Rejected';
    return value;
  };

  return (
    <section className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
      <div className='mb-3 flex items-center justify-between'>
        <div className='text-sm font-bold text-slate-900'>{titleMap[status]}</div>
        <span className='rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600'>
          {cards.length}
        </span>
      </div>
      {cards.length === 0 ? <div className='rounded-xl bg-slate-50 p-3 text-sm text-slate-600'>{emptyMap[status]}</div> : null}

      <div className='space-y-3'>
            {cards.map((item) => {
              const taskInfo = taskByTargetId.get(item.id);
              const taskId = taskInfo?.id || '';
              const opportunityUpdatedAt = item.opportunityUpdatedAt ? item.opportunityUpdatedAt.slice(0, 10) : '';
              const targetReady = !!item.submissionUrl;
          const reasonCount = item.reasons.length;
          const detailTitle = item.name || item.channelName;
          const hasAccount = toChineseBoolean(item.requiresAccount, locale);
          const hasPayment = toChineseBoolean(item.requiresPayment, locale);
          const hasCaptcha = toChineseBoolean(item.requiresCaptcha, locale);
          return (
            <div
              key={item.id}
              className='rounded-xl border border-slate-200 bg-slate-50 p-3 transition hover:border-cyan-300 hover:bg-cyan-50/40'
            >
              <div className='flex flex-wrap items-start justify-between gap-2'>
                <div>
                  <div className='text-sm font-bold text-slate-900'>{detailTitle}</div>
                  <div className='mt-1 text-xs text-slate-500'>
                    {item.channelName} · {item.channelType} · Score {item.score}
                  </div>
                </div>
                <div className='flex items-center gap-2 text-xs'>
                  <span className='rounded-full bg-cyan-100 px-2.5 py-1 text-cyan-800'>{
                    locale === 'cn' ? '置信度' : 'Confidence'
                  }</span>
                  <span className='rounded-full bg-slate-900 px-2.5 py-1 text-xs text-white'>{item.confidence}%</span>
                </div>
              </div>
                <div className='mt-2 flex flex-wrap gap-2 text-[11px] text-slate-700'>
                  <span className='inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-slate-700'>
                    {renderStatusLabel(item.opportunityStatus || null)}
                  </span>
                  <span className='inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-slate-700'>
                    {locale === 'cn' ? '更新' : 'Updated'}：{opportunityUpdatedAt || '--'}
                  </span>
                  <span className='inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-emerald-700'>
                    <ShieldCheck className='h-3 w-3' />
                    {locale === 'cn' ? '人工审核' : 'Editorial'}：{item.editorialReview ? 'required' : 'none'}
                </span>
                <span className='inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-amber-700'>
                  <CircleDollarSign className='h-3 w-3' />
                  {locale === 'cn' ? '付费' : 'Paid'}：{hasPayment}
                </span>
                <span className='inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-1 text-violet-700'>
                  <CircleAlert className='h-3 w-3' />
                  {locale === 'cn' ? '账号' : 'Account'}：{hasAccount}
                </span>
                <span className='inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-1 text-rose-700'>
                  <Clock3 className='h-3 w-3' />
                  {locale === 'cn' ? '预计' : 'Est. minutes'}：{item.estimatedMinutes}
                </span>
              </div>
              {item.reasons.length > 0 ? (
                <ul className='mt-2 list-disc pl-5 text-xs text-slate-600'>
                  {item.reasons
                    .slice(0, 2)
                    .map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  {reasonCount > 2 ? (
                    <li>
                      {locale === 'cn'
                        ? `还有 ${reasonCount - 2} 条原因略缩` :
                          `${reasonCount - 2} more reasons`}
                    </li>
                  ) : null}
                </ul>
              ) : null}
              <div className='mt-3 flex flex-wrap gap-2'>
                {item.submissionUrl ? (
                  <a
                    href={item.submissionUrl}
                    target='_blank'
                    rel='noreferrer'
                    className='inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700'
                  >
                    {locale === 'cn' ? '打开站点' : 'Open target'}
                    <ExternalLink className='h-3.5 w-3.5' />
                  </a>
                ) : null}
                {item.homepageUrl ? (
                  <a
                    href={item.homepageUrl}
                    target='_blank'
                    rel='noreferrer'
                    className='inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700'
                  >
                    {locale === 'cn' ? '官网' : 'Homepage'}
                    <ExternalLink className='h-3.5 w-3.5' />
                  </a>
                ) : null}
                {item.registrationUrl ? (
                  <a
                    href={item.registrationUrl}
                    target='_blank'
                    rel='noreferrer'
                    className='inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700'
                  >
                    {locale === 'cn' ? '注册页' : 'Register'}
                    <ExternalLink className='h-3.5 w-3.5' />
                  </a>
                ) : null}

                {status === 'recommended' ? (
                  <DistributionActionForm
                    action={acceptDistributionTarget}
                    successMessage={
                      locale === 'cn'
                        ? '已记录到执行任务，正在跳转任务页…'
                        : 'Accepted to execution queue, opening task page…'
                    }
                  >
                    <input type='hidden' name='projectId' value={projectId} />
                    <input type='hidden' name='targetId' value={item.id} />
                    <input type='hidden' name='score' value={String(item.score)} />
                    <input type='hidden' name='estimatedMinutes' value={String(item.estimatedMinutes || 15)} />
                    <DistributionSubmitButton
                      pendingLabel={locale === 'cn' ? '接受中…' : 'Adding…'}
                      className='inline-flex items-center gap-1 rounded-lg bg-cyan-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-cyan-800 disabled:cursor-not-allowed disabled:bg-cyan-300'
                    >
                      <CirclePlus className='h-3.5 w-3.5' />
                      {locale === 'cn' ? '接受并准备提交' : 'Accept and prepare'}
                    </DistributionSubmitButton>
                  </DistributionActionForm>
                ) : null}
                {taskId ? (
                  <Link
                    href={`/${locale}/distribution/tasks/${taskId}?project=${encodeURIComponent(projectId)}&focusTarget=${encodeURIComponent(item.id)}`}
                    className='inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800'
                  >
                    {targetReady
                      ? locale === 'cn'
                        ? '进入任务'
                        : 'Open task'
                      : locale === 'cn'
                        ? '先补齐资料'
                        : 'Complete profile first'}
                    <ListChecks className='h-3.5 w-3.5' />
                  </Link>
                ) : null}
                {status === 'skipped' || status === 'other' ? null : (
                  <span
                    className={`rounded-full px-2.5 py-1.5 text-[11px] font-semibold ${
                      status === 'recommended'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-cyan-50 text-cyan-700'
                    }`}
                  >
                    {locale === 'cn'
                      ? status === 'selected'
                        ? '执行中'
                        : status
                      : status === 'selected'
                        ? 'In progress'
                        : status}
                  </span>
                )}
              </div>
              {hasCaptcha ? (
                <div className='mt-2 inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-xs text-amber-800'>
                  <CircleAlert className='h-3.5 w-3.5' />
                  {locale === 'cn' ? '该站点可能触发 CAPTCHA/反机器人步骤。' : 'CAPTCHA or anti-bot step may be required.'}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default async function DistributionOpportunitiesPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams?: DistributionWorkspaceSearchParams;
}) {
  const locale = params.locale;
  const result = await getDistributionDashboard(pickValue(searchParams?.project));
  const redirectUrl = `/${locale}/distribution/opportunities${searchParams ? `?project=${pickValue(searchParams.project) || ''}` : ''}`;
  const isChinese = locale === 'cn';

  if (!result.success) {
    if (result.error === 'Unauthorized') {
      redirect(`/${locale}/login?redirect=${encodeURIComponent(redirectUrl)}`);
    }
    return <div className='mx-auto max-w-5xl px-5 py-16 text-center text-slate-700'>{result.error}</div>;
  }

  if (!result.access || !result.data) {
    return (
      <div className='mx-auto w-full max-w-4xl px-5 py-16'>
        <div className='rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12'>
          <div className='text-xs font-bold uppercase tracking-[0.2em] text-cyan-700'>Distribution workspace</div>
          <h1 className='mt-4 text-3xl font-bold tracking-tight text-slate-950'>{isChinese ? '目标站机会' : 'Target opportunities'}</h1>
          <p className='mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '请先开通分发权限，才能看到目标站推荐与接收流程。'
              : 'Activate distribution access to see target recommendations and add targets to execution.'}
          </p>
          <div className='mx-auto mt-8 grid max-w-2xl gap-3 text-left sm:grid-cols-2'>
            {[{ plan: 'pro', label: 'Pro', monthly: '$19/mo', yearly: '$190/yr', detail: isChinese ? '最多 5 个项目' : 'Up to 5 projects' }].map((item) => {
              const monthlyAvailable = Boolean(getDistributionPriceId(item.plan as 'pro' | 'agency', 'monthly'));
              const yearlyAvailable = Boolean(getDistributionPriceId(item.plan as 'pro' | 'agency', 'yearly'));
              return (
                <div key={item.plan} className='rounded-2xl border border-slate-200 bg-slate-50 p-4'>
                  <div className='flex items-center justify-between'>
                    <span className='font-bold text-slate-900'>{item.label}</span>
                    <span className='text-sm font-bold text-cyan-700'>{item.monthly}</span>
                  </div>
                  <p className='mt-2 text-xs text-slate-600'>{item.detail}</p>
                  <div className='mt-4 flex flex-wrap gap-2'>
                    {monthlyAvailable ? (
                      <a
                        href={`/api/payments/stripe/distribution/checkout?plan=${item.plan}&interval=monthly`}
                        className='inline-flex rounded-lg bg-cyan-700 px-3 py-2 text-xs font-bold text-white hover:bg-cyan-800'
                      >
                        {isChinese ? '月付' : 'Monthly'}
                      </a>
                    ) : null}
                    {yearlyAvailable ? (
                      <a
                        href={`/api/payments/stripe/distribution/checkout?plan=${item.plan}&interval=yearly`}
                        className='inline-flex rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800'
                      >
                        {isChinese ? '年付' : 'Yearly'}
                      </a>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const data = result.data;
  if (!data.project) {
    return <div className='mx-auto max-w-4xl px-5 py-16 text-slate-700'>Workspace is not ready.</div>;
  }

  const projectId = data.project.id;
  const canAccept = Boolean(data.project.factsConfirmedAt);
  const headerTitle = isChinese ? '目标机会' : 'Opportunities';

  if (!canAccept) {
    return (
      <div className='w-full space-y-4 px-4 py-6 sm:px-6 lg:px-10'>
        <div className='rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900'>
          {isChinese
            ? '请先回到产品资料页补齐并确认资料，才可以接受目标站并开始执行任务。'
            : 'Please complete and confirm product profile first before accepting any opportunity.'}
        </div>
        <Link
          href={`/${locale}/distribution/products${searchParams?.project ? `?project=${pickValue(searchParams.project) || ''}` : ''}`}
          className='inline-flex items-center gap-1 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800'
        >
          <PackageOpen className='h-4 w-4' />
          {isChinese ? '去完成产品资料' : 'Complete product profile'}
        </Link>
        {buildOpportunitySection(data, 'recommended', locale, projectId)}
      </div>
    );
  }

  return (
    <div className='w-full space-y-4 px-4 py-6 sm:px-6 lg:px-10'>
      <div className='rounded-2xl border border-cyan-200 bg-gradient-to-r from-cyan-50 to-white p-5'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div>
            <div className='text-xs font-bold uppercase tracking-[0.16em] text-cyan-700'>{headerTitle}</div>
            <h1 className='mt-1 text-xl font-bold text-slate-950'>{
              isChinese ? `当前项目：${data.project.name}` : `Project: ${data.project.name}`
            }</h1>
            <p className='mt-2 text-sm text-slate-600'>
              {isChinese
                ? '从“推荐”里选择目标后生成任务；每个目标默认只显示一个关键操作。'
                : 'Accept one target to generate a task. Each item shows one main action only.'}
            </p>
          </div>
          <div className='text-xs text-slate-500 flex items-center gap-2'>
            <Sparkles className='h-3.5 w-3.5' />
            {isChinese ? '目标总数' : 'Total opportunities'}: {data.targetRecommendations.length}
          </div>
        </div>
        <div className='mt-3 flex flex-wrap gap-2'>
          <span className='inline-flex items-center gap-1 rounded-full bg-cyan-100 px-2.5 py-1 text-xs text-cyan-800'>
            <CheckCircle2 className='h-3.5 w-3.5' />
            {isChinese ? '已确认资料' : 'Profile confirmed'}
          </span>
          <span className='inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700'>
            <BellRing className='h-3.5 w-3.5' />
            {isChinese ? '只显示当前项目' : 'Current project only'}
          </span>
        </div>
      </div>

      {buildOpportunitySection(data, 'selected', locale, projectId)}
      {buildOpportunitySection(data, 'recommended', locale, projectId)}
      {buildOpportunitySection(data, 'skipped', locale, projectId)}
    </div>
  );
}
