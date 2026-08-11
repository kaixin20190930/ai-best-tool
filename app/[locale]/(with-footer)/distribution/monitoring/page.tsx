import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Clock4, RefreshCcw, SearchCheck, AlertTriangle, CheckCircle2, Globe2 } from 'lucide-react';

import { DistributionActionForm, DistributionSubmitButton } from '@/components/distribution/DistributionActionForm';
import { deriveDistributionPresentationState } from '@/lib/services/distribution/presentationState';
import { getDistributionDashboard, recheckDistributionTaskResult } from '@/app/actions/distribution';

type DistributionWorkspaceSearchParams = {
  project?: string | string[];
  status?: string | string[];
};

function pickValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

const sectionOrder = ['submitted', 'waiting_review', 'live', 'follow_up', 'blocked'];

function sectionTitle(status: string, isChinese: boolean) {
  const map: Record<string, string> = {
    submitted: isChinese ? '待审核' : 'Submitted',
    waiting_review: isChinese ? '待复查' : 'Waiting review',
    live: isChinese ? '已上线' : 'Live',
    follow_up: isChinese ? '复查中' : 'Follow-up',
    blocked: isChinese ? '阻塞' : 'Blocked',
  };
  return map[status] || status;
}

export default async function DistributionMonitoringPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams?: DistributionWorkspaceSearchParams;
}) {
  const locale = params.locale;
  const result = await getDistributionDashboard(pickValue(searchParams?.project));
  const redirectUrl = `/${locale}/distribution/monitoring${searchParams ? `?project=${pickValue(searchParams.project) || ''}` : ''}`;
  const isChinese = locale === 'cn';

  if (!result.success) {
    if (result.error === 'Unauthorized') {
      redirect(`/${locale}/login?redirect=${encodeURIComponent(redirectUrl)}`);
    }
    return <div className='mx-auto max-w-5xl px-5 py-16 text-center text-slate-700'>{result.error}</div>;
  }

  if (!result.data) {
    return <div className='mx-auto max-w-4xl px-5 py-16 text-slate-700'>Workspace data unavailable.</div>;
  }

  const data = result.data;
  const selectedStatus = pickValue(searchParams?.status);
  const sourceTasks = data.tasks || [];
  const monitoringTasks = sourceTasks.filter((task) =>
    ['submitted', 'waiting_review', 'live', 'follow_up', 'blocked'].includes(task.status),
  );
  const projectQuery = pickValue(searchParams?.project) ? `?project=${encodeURIComponent(pickValue(searchParams?.project)!)}`
    : '';

  const grouped = monitoringTasks.reduce<Record<string, typeof monitoringTasks>>((acc, task) => {
    const status = ['submitted', 'waiting_review', 'live', 'follow_up'].includes(task.status)
      ? task.status
      : task.status === 'blocked'
        ? 'blocked'
        : 'follow_up';
    if (!acc[status]) acc[status] = [];
    acc[status].push(task);
    return acc;
  }, {});

  sectionOrder.forEach((key) => {
    if (!grouped[key]) grouped[key] = [];
  });

  return (
    <div className='space-y-6'>
      <section className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div>
            <h1 className='text-xl font-bold text-slate-950'>{isChinese ? '跟进与监控' : 'Monitoring & follow-up'}</h1>
            <p className='mt-1 text-sm text-slate-600'>
              {isChinese
                ? '集中处理提交后、复查前和链接异常的任务，记录结果后会自动回到正确的流程状态。'
                : 'Handle submitted, review, live, and link anomaly tasks in one place and record results to drive state updates.'}
            </p>
          </div>
          <div className='flex flex-wrap gap-2 text-sm'>
            <Link
              href={`/${locale}/distribution/tasks`}
              className='rounded-lg border border-slate-200 px-3 py-2 font-bold text-slate-700 hover:border-cyan-300'
            >
              {isChinese ? '查看执行任务' : 'Execution queue'}
            </Link>
            <Link
              href={`/${locale}/distribution/opportunities`}
              className='rounded-lg border border-slate-200 px-3 py-2 font-bold text-slate-700 hover:border-cyan-300'
            >
              {isChinese ? '继续选目标' : 'Choose targets'}
            </Link>
          </div>
        </div>
      </section>

      <section className='grid gap-3 sm:grid-cols-3'>
        <div className='rounded-xl border border-slate-200 bg-white p-4'>
          <div className='flex items-center gap-2 text-xs text-slate-500'>
            <Clock4 className='h-4 w-4' />
            {isChinese ? '待审核与复查' : 'Pending checks'}
          </div>
          <div className='mt-2 text-2xl font-bold text-slate-900'>{grouped.submitted.length + grouped.waiting_review.length}</div>
        </div>
        <div className='rounded-xl border border-slate-200 bg-white p-4'>
          <div className='flex items-center gap-2 text-xs text-slate-500'>
            <SearchCheck className='h-4 w-4' />
            {isChinese ? '已上线' : 'Live'}
          </div>
          <div className='mt-2 text-2xl font-bold text-slate-900'>{grouped.live.length}</div>
        </div>
        <div className='rounded-xl border border-slate-200 bg-white p-4'>
          <div className='flex items-center gap-2 text-xs text-slate-500'>
            <AlertTriangle className='h-4 w-4' />
            {isChinese ? '待处理异常' : 'Issues'}
          </div>
          <div className='mt-2 text-2xl font-bold text-slate-900'>{grouped.blocked.length}</div>
        </div>
      </section>

      <section className='space-y-4'>
        {sectionOrder.map((status) => {
          const list = grouped[status] || [];
          return (
            <div key={status} className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
              <div className='mb-3 flex items-center justify-between'>
                <h2 className='text-sm font-bold text-slate-900'>{sectionTitle(status, isChinese)} · {list.length}</h2>
                {selectedStatus && selectedStatus !== status ? null : null}
              </div>
              {list.length === 0 ? (
                <div className='rounded-xl bg-slate-50 p-4 text-xs text-slate-500'>
                  {isChinese ? '暂无该状态任务。' : 'No tasks for this state.'}
                </div>
              ) : null}

              <div className='space-y-3'>
                {list.map((task) => {
                  const presentation = deriveDistributionPresentationState({
                    status: task.status,
                    liveUrl: task.liveUrl,
                    linkStatus: task.linkStatus,
                    packageStatus: task.packageStatus,
                    blockedReason: task.blockedReason,
                    dueDate: task.dueDate,
                  });
                  return (
                    <div key={task.id} className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
                      <div className='flex flex-wrap items-start justify-between gap-2'>
                        <div>
                          <div className='text-sm font-bold text-slate-900'>{task.title}</div>
                          <div className='mt-1 text-xs text-slate-600'>
                            {task.channelName} · {task.taskType} · {task.priority}
                          </div>
                        </div>
                        <span className={`rounded-full px-2 py-1 text-xs ${presentation.toneClass}`}>{presentation.label}</span>
                      </div>
                      <div className='mt-2 text-xs text-slate-600'>
                        {isChinese ? '到期' : 'Due'}：{task.dueDate || (isChinese ? '未安排' : 'Not set')}
                      </div>
                      {task.targetName ? <div className='mt-1 text-xs text-slate-600'>{task.targetName}</div> : null}
                      <div className='mt-3 flex flex-wrap gap-2'>
                        <Link
                          href={`/${locale}/distribution/tasks/${task.id}${projectQuery}${projectQuery ? '&' : '?'}focusTask=${encodeURIComponent(task.id)}${task.targetId ? `&focusTarget=${encodeURIComponent(task.targetId)}` : ''}`}
                          className='inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:border-cyan-300'
                        >
                          {isChinese ? '打开任务' : 'Open task'}
                        </Link>
                        <DistributionActionForm
                          action={recheckDistributionTaskResult}
                          successMessage={isChinese ? '复查完成，已刷新。' : 'Rechecked and refreshed.'}
                        >
                          <input type='hidden' name='taskId' value={task.id} />
                          <input
                            type='hidden'
                            name='liveUrl'
                            defaultValue={task.liveUrl || ''}
                          />
                          <DistributionSubmitButton
                            pendingLabel={isChinese ? '检测中…' : 'Checking…'}
                            className='inline-flex items-center gap-1 rounded-lg bg-cyan-700 px-3 py-2 text-xs font-bold text-white hover:bg-cyan-800 disabled:cursor-wait'
                          >
                            {isChinese ? '复查状态' : 'Recheck'}
                          </DistributionSubmitButton>
                        </DistributionActionForm>
                        <a
                          href={task.liveUrl || `/${locale}/distribution/tasks/${task.id}${projectQuery}`}
                          target='_blank'
                          rel='noreferrer'
                          className='inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:border-cyan-300'
                        >
                          <Globe2 className='h-3.5 w-3.5' />
                          {isChinese ? '打开链接' : 'Open link'}
                        </a>
                        {task.linkStatus === 'nofollow' ? <span className='inline-flex items-center gap-1 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700'><RefreshCcw className='h-3.5 w-3.5' />{isChinese ? '有 index 风险' : 'Index risk'}</span> : null}
                        {task.packageStatus ? <span className='inline-flex rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-700'>{task.packageStatus}</span> : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      <section className='rounded-2xl border border-slate-200 bg-cyan-50 p-4 text-xs text-slate-700'>
        <div className='flex items-center gap-2 text-sm font-bold'>
          <CheckCircle2 className='h-4 w-4' />
          {isChinese ? '复查策略' : 'Review policy'}
        </div>
        <div className='mt-2 leading-6'>
          {isChinese
            ? '提交后建议至少 24h 内再次复查一次；Live 任务建议 7/30/90 天复查，未出现上线则建议标记为阻塞并记录阻塞原因。'
            : 'For submitted tasks, rerun checks within 24h first; then schedule 7/30/90 day checks for live listings. If listing disappears, mark blocked and record the reason.'}
        </div>
      </section>
    </div>
  );
}
