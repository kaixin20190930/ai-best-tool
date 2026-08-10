import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight, Clock3, CheckCircle2, CircleDashed, PackageOpen } from 'lucide-react';

import { DistributionActionForm, DistributionSubmitButton } from '@/components/distribution/DistributionActionForm';
import { deriveDistributionPresentationState, type DistributionPresentationState } from '@/lib/services/distribution/presentationState';
import {
  getDistributionDashboard,
  updateDistributionTaskStatus,
} from '@/app/actions/distribution';
import { getDistributionPriceId } from '@/lib/services/stripe';

type DistributionWorkspaceSearchParams = {
  project?: string | string[];
  status?: string | string[];
};

function pickValue(value: undefined | string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

const taskSections = [
  { key: 'execution', labelCn: '执行中', labelEn: 'Execution', statuses: ['in_progress', 'needs_assets', 'ready_to_submit', 'blocked'] },
  { key: 'review', labelCn: '待复查 / 待审核', labelEn: 'Review / Submitted', statuses: ['submitted', 'waiting_review', 'follow_up', 'live'] },
  { key: 'closed', labelCn: '已完成', labelEn: 'Closed', statuses: ['done', 'skipped'] },
] as const;

function buildTaskRows(tasks: any[]) {
  const grouped: Record<string, any[]> = {
    execution: [],
    review: [],
    closed: [],
  };
  for (const task of tasks) {
    const presentation = deriveDistributionPresentationState({
      status: task.status,
      liveUrl: task.liveUrl,
      linkStatus: task.linkStatus,
      packageStatus: task.packageStatus,
      blockedReason: task.blockedReason,
      dueDate: task.dueDate,
    });
    const item = { ...task, presentation, actionLabel: getTaskActionLabel(task.status, presentation, task.phase as DistributionPresentationState['phase']) };
    if (presentation.phase === 'monitoring') {
      grouped.review.push(item);
    } else if (presentation.status === 'done' || presentation.status === 'skipped') {
      grouped.closed.push(item);
    } else {
      grouped.execution.push(item);
    }
  }
  for (const section of Object.values(grouped)) {
    section.sort((a, b) => {
      const weight: Record<string, number> = { blocked: 2, needs_assets: 1, in_progress: 0, ready_to_submit: 3, submitted: 4, waiting_review: 5, follow_up: 6, live: 7, done: 8, skipped: 9 };
      const wa = weight[a.status] || 20;
      const wb = weight[b.status] || 20;
      if (wa !== wb) return wa - wb;
      return String(a.dueDate || '9999-99-99').localeCompare(String(b.dueDate || '9999-99-99'));
    });
  }
  return grouped;
}

function getTaskActionLabel(status: string, presentation: DistributionPresentationState, phase: DistributionPresentationState['phase']) {
  if (status === 'blocked') return phase === 'monitoring' ? '处理异常并更新状态' : '补齐阻塞项';
  if (status === 'needs_assets') return '补充素材';
  if (status === 'ready_to_submit') return '生成材料并提交';
  if (status === 'in_progress') return '进入任务详情';
  if (status === 'submitted' || status === 'waiting_review') return '记录审核结果';
  if (status === 'follow_up') return '检查变更并复查';
  if (status === 'live') return '安排下次复查';
  return '打开任务';
}

function pickLabel(section: (typeof taskSections)[number], locale: string) {
  return locale === 'cn' ? section.labelCn : section.labelEn;
}

function formatDate(value: string | null) {
  if (!value) return '--';
  return value.slice(0, 10);
}

function renderQuickStatusForm(task: any, locale: string) {
  const optionsByStatus = {
    in_progress: ['needs_assets', 'blocked'],
    needs_assets: ['ready_to_submit', 'blocked'],
    ready_to_submit: ['submitted', 'blocked'],
    submitted: ['waiting_review', 'blocked'],
    waiting_review: ['live', 'blocked'],
    follow_up: ['live', 'done', 'blocked'],
    live: ['follow_up', 'done'],
  } as const;

  const targetStatus = task.status as keyof typeof optionsByStatus;
  const options = optionsByStatus[targetStatus];
  if (!options || task.status === 'blocked') return null;

  return (
    <DistributionActionForm
      key={`quick-${task.id}`}
      action={updateDistributionTaskStatus}
      successMessage={locale === 'cn' ? '状态已更新。任务列表已刷新。' : 'Status updated. Task list refreshed.'}
    >
      <div className='mt-2 flex flex-wrap gap-2'>
        {options.map((status) => (
          <div key={status} className='inline-flex'>
            <input type='hidden' name='taskId' value={task.id} />
            <input type='hidden' name='status' value={status} />
            <DistributionSubmitButton
              pendingLabel={locale === 'cn' ? '更新中…' : 'Updating…'}
              className='rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:border-cyan-300 disabled:cursor-wait'
            >
              {status}
            </DistributionSubmitButton>
          </div>
        ))}
      </div>
    </DistributionActionForm>
  );
}

function renderTaskCard(task: any, locale: string, localePrefix: string, projectParam: string) {
  const isChinese = locale === 'cn';
  const blockedLabel = task.presentation.blocked ? (isChinese ? '阻塞中' : 'Blocked') : null;
  const statusLabel = task.presentation.label;
  return (
    <div key={task.id} className='rounded-xl border border-slate-200 bg-white p-4'>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div>
          <div className='text-sm font-bold text-slate-950'>{task.title}</div>
          <div className='mt-1 text-xs text-slate-500'>
            {task.channelName} · {task.taskType || 'task'} · {isChinese ? '优先级' : 'Priority'}: {task.priority}
          </div>
          <div className='mt-2 flex flex-wrap gap-2 text-[11px]'>
            <span className={`rounded-full px-2 py-1 ${task.presentation.toneClass}`}>{statusLabel}</span>
            {blockedLabel ? <span className='rounded-full bg-rose-100 px-2 py-1 text-rose-700'>{blockedLabel}</span> : null}
            <span className='rounded-full bg-slate-100 px-2 py-1 text-slate-700'>
              {isChinese ? '到期' : 'Due'}: {formatDate(task.dueDate)}
            </span>
            {task.estimatedMinutes ? (
              <span className='rounded-full bg-slate-100 px-2 py-1 text-slate-700'>{task.estimatedMinutes} {isChinese ? '分钟' : 'min'}</span>
            ) : null}
            {task.estimatedCost ? <span className='rounded-full bg-slate-100 px-2 py-1 text-slate-700'>${task.estimatedCost}</span> : null}
          </div>
        </div>
        <div className='text-xs text-slate-500'>{task.presentation.actionHint}</div>
      </div>

      <div className='mt-3 flex flex-wrap gap-2'>
        <Link
          href={`/${localePrefix}/distribution/tasks/${task.id}?focusTask=${encodeURIComponent(task.id)}${projectParam ? `&focusTarget=${encodeURIComponent(task.targetName || task.targetId || '')}` : ''}`}
          className='inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800'
        >
          <ArrowRight className='h-3.5 w-3.5' />
          {isChinese ? '进入任务' : 'Open task'}
        </Link>
        {task.presentation.status === 'ready' ? (
          <span className='inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-800'>
            <CheckCircle2 className='h-3.5 w-3.5' />
            {isChinese ? '可提交' : 'Ready'}
          </span>
        ) : null}
        {task.presentation.status === 'preparing' ? (
          <span className='inline-flex items-center gap-1 rounded-lg bg-cyan-100 px-3 py-2 text-xs font-semibold text-cyan-800'>
            <CircleDashed className='h-3.5 w-3.5' />
            {isChinese ? '准备中' : 'Preparing'}
          </span>
        ) : null}
      </div>

      <p className='mt-3 text-xs text-slate-600'>{task.presentation.actionHint}</p>
    </div>
  );
}

export default async function DistributionTasksPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams?: DistributionWorkspaceSearchParams;
}) {
  const locale = params.locale;
  const result = await getDistributionDashboard(pickValue(searchParams?.project));
  const redirectUrl = `/${locale}/distribution/tasks${searchParams ? `?project=${pickValue(searchParams.project) || ''}` : ''}`;
  const isChinese = locale === 'cn';
  const selectedStatus = pickValue(searchParams?.status) || '';

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
          <h1 className='mt-4 text-3xl font-bold tracking-tight text-slate-950'>{isChinese ? '执行任务' : 'Tasks'}</h1>
          <p className='mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '开通分发权限后才能看到任务队列。'
              : 'Activate distribution access to load your execution tasks.'}
          </p>
          <div className='mx-auto mt-8 grid max-w-2xl gap-3 text-left sm:grid-cols-2'>
            {[{ plan: 'pro', label: 'Pro', monthly: '$19/mo', yearly: '$190/yr' }].map((item) => {
              const monthlyAvailable = Boolean(getDistributionPriceId(item.plan as 'pro' | 'agency', 'monthly'));
              const yearlyAvailable = Boolean(getDistributionPriceId(item.plan as 'pro' | 'agency', 'yearly'));
              return (
                <div key={item.plan} className='rounded-2xl border border-slate-200 bg-slate-50 p-4'>
                  <div className='flex items-center justify-between'>
                    <span className='font-bold text-slate-900'>{item.label}</span>
                    <span className='text-sm font-bold text-cyan-700'>{item.monthly}</span>
                  </div>
                  <div className='mt-4 flex flex-wrap gap-2'>
                    {monthlyAvailable ? (
                      <a
                        href={`/api/payments/stripe/distribution/checkout?plan=${item.plan}&interval=monthly`}
                        className='rounded-lg bg-cyan-700 px-3 py-2 text-xs font-bold text-white'
                      >
                        {isChinese ? '月付' : 'Monthly'}
                      </a>
                    ) : null}
                    {yearlyAvailable ? (
                      <a
                        href={`/api/payments/stripe/distribution/checkout?plan=${item.plan}&interval=yearly`}
                        className='rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white'
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
  const projectParam = pickValue(searchParams?.project) || data?.project?.id || '';
  if (!data.project) {
    return <div className='mx-auto w-full max-w-4xl px-5 py-16 text-center text-slate-700'>Workspace is empty.</div>;
  }

  const allTasks = data.tasks || [];
  const filteredTasks = selectedStatus
    ? allTasks.filter((task) => task.status === selectedStatus)
    : allTasks.filter((task) => task.status !== 'done' && task.status !== 'skipped');
  const grouped = buildTaskRows(filteredTasks);

  return (
    <div className='w-full space-y-5 px-4 py-6 sm:px-6 lg:px-10'>
      <section className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
        <div className='flex items-center justify-between gap-3'>
          <div>
            <h1 className='text-xl font-bold text-slate-950'>{isChinese ? '执行任务队列' : 'Execution Queue'}</h1>
            <p className='mt-1 text-sm text-slate-600'>
              {isChinese
                ? `为 ${data.project.name} 管理当前可执行任务。当前项目共 ${data.tasks.length} 条任务。`
                : `Execution queue for ${data.project.name}. Total ${data.tasks.length} tasks.`}
            </p>
          </div>
          <Link
            href={`/${locale}/distribution/opportunities${projectParam ? `?project=${projectParam}` : ''}`}
            className='inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:border-cyan-300 hover:text-cyan-700'
          >
            <PackageOpen className='h-3.5 w-3.5' />
            {isChinese ? '去选目标站' : 'Choose target'}
          </Link>
        </div>

        <div className='mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
          <div className='rounded-xl border border-slate-200 bg-slate-50 p-3'>
            <div className='text-xs text-slate-500'>{isChinese ? '待处理' : 'Pending'}</div>
            <div className='mt-2 text-xl font-bold'>{(allTasks || []).filter((task) => !['done', 'skipped'].includes(task.status)).length}</div>
          </div>
          <div className='rounded-xl border border-slate-200 bg-slate-50 p-3'>
            <div className='text-xs text-slate-500'>{isChinese ? '阻塞项' : 'Blocked'}</div>
            <div className='mt-2 text-xl font-bold'>{(allTasks || []).filter((task) => task.status === 'blocked').length}</div>
          </div>
          <div className='rounded-xl border border-slate-200 bg-slate-50 p-3'>
            <div className='text-xs text-slate-500'>{isChinese ? '已上线/复查' : 'Live/Review'}</div>
            <div className='mt-2 text-xl font-bold'>
              {(allTasks || []).filter((task) => ['live', 'follow_up', 'waiting_review'].includes(task.status)).length}
            </div>
          </div>
        </div>
      </section>

      {taskSections.map((section) => {
        const tasks = grouped[section.key];
        if (!tasks || tasks.length === 0) return null;
        return (
          <section key={section.key} className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
            <div className='mb-3 flex items-center justify-between'>
              <h2 className='text-sm font-bold text-slate-900'>{pickLabel(section, locale)} ({tasks.length})</h2>
              <span className='text-xs text-slate-500'>
                {isChinese ? '拖到最后' : 'Latest actions shown'}
              </span>
            </div>
            <div className='space-y-3'>{tasks.map((task) => renderTaskCard(task, locale, locale, projectParam))}</div>
          </section>
        );
      })}

      {allTasks.length === 0 ? (
        <div className='rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center'>
          <Clock3 className='mx-auto h-8 w-8 text-slate-400' />
          <h3 className='mt-2 text-sm font-bold text-slate-700'>
            {isChinese ? '暂无任务。先从机会页接受目标' : 'No tasks yet. Accept an opportunity first.'}
          </h3>
          <Link
            href={`/${locale}/distribution/opportunities${projectParam ? `?project=${projectParam}` : ''}`}
            className='mt-3 inline-flex items-center rounded-lg bg-cyan-700 px-3 py-2 text-xs font-bold text-white hover:bg-cyan-800'
          >
            {isChinese ? '去机会页' : 'Go to opportunities'}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
