import Link from 'next/link';
import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, CheckCircle2, Clock3, Send, Sparkles, AlertTriangle } from 'lucide-react';

import {
  getDistributionTaskStatusChoices,
  getDistributionTaskStatusDescription,
  getDistributionTaskStatusLabel,
  type DistributionTaskStatus,
} from '@/lib/services/distribution/taskStateMachine';
import { deriveDistributionPresentationState } from '@/lib/services/distribution/presentationState';
import CopyField from '@/components/distribution/CopyField';
import DistributionActionButton from '@/components/distribution/DistributionActionButton';
import { DistributionActionForm, DistributionSubmitButton } from '@/components/distribution/DistributionActionForm';
import {
  createDistributionFollowUpTask,
  generateDistributionPackage,
  getDistributionTaskDetail,
  recordDistributionResult,
  recheckDistributionTaskResult,
  updateDistributionTaskStatus,
} from '@/app/actions/distribution';



type DistributionPrimaryActionType =
  | 'generate'
  | 'ready'
  | 'submit'
  | 'check-result'
  | 'follow-up'
  | 'done'
  | 'queue'
  | 'unblock'
  | 'recheck';

function getPrimaryActionType(
  status: DistributionTaskStatus,
  packageReady: boolean,
  isBlocked: boolean,
  hasPackage: boolean,
): DistributionPrimaryActionType {
  if (!hasPackage) {
    return 'generate';
  }

  if (isBlocked) {
    return 'unblock';
  }

  if (status === 'in_progress' || status === 'needs_assets') {
    return packageReady ? 'ready' : 'generate';
  }

  if (status === 'ready_to_submit') {
    return 'submit';
  }

  if (status === 'submitted' || status === 'waiting_review') {
    return 'check-result';
  }

  if (status === 'live') {
    return 'follow-up';
  }

  if (status === 'follow_up') {
    return 'done';
  }

  if (status === 'done' || status === 'skipped') {
    return 'queue';
  }

  if (status === 'planned') {
    return 'ready';
  }

  return 'check-result';
}

function pickValue(value: string | string[] | undefined): string {
  if (!value) return '';
  return Array.isArray(value) ? value[0] : value;
}

const blockedReasonTypes = [
  { value: '', label: 'Select reason type' },
  { value: 'account', label: 'Account required' },
  { value: 'payment', label: 'Payment required' },
  { value: 'captcha', label: 'CAPTCHA or anti-bot limit' },
  { value: 'editorial', label: 'Editorial / manual review' },
  { value: 'quality', label: 'Quality or content mismatch' },
  { value: 'removed', label: 'Listing removed' },
  { value: 'nofollow', label: 'Nofollow / indexing issue' },
  { value: 'other', label: 'Other reason' },
];

export default async function DistributionTaskDetailPage({
  params,
  searchParams,
}: {
  params: { locale: string; taskId: string };
  searchParams?: { focusTask?: string | string[]; focusTarget?: string | string[]; project?: string | string[] };
}) {
  const focusTask = pickValue(searchParams?.focusTask).trim();
  const focusTarget = pickValue(searchParams?.focusTarget).trim();
  const focusProject = pickValue(searchParams?.project).trim();
  const result = await getDistributionTaskDetail(params.taskId);
  const taskRedirectUrl = focusTask
    ? `/${params.locale}/distribution/tasks/${params.taskId}?focusTask=${encodeURIComponent(focusTask)}${
        focusTarget ? `&focusTarget=${encodeURIComponent(focusTarget)}` : ''
      }${focusProject ? `&project=${encodeURIComponent(focusProject)}` : ''}`
    : `/${params.locale}/distribution/tasks/${params.taskId}${
      focusProject ? `?project=${encodeURIComponent(focusProject)}` : ''
    }`;
  if (!result.success) {
    if (result.error === 'Unauthorized')
      redirect(`/${params.locale}/login?redirect=${encodeURIComponent(taskRedirectUrl)}`);
    return <div className='mx-auto max-w-4xl px-5 py-16 text-slate-700'>{result.error}</div>;
  }
  if (!result.access || !result.data) {
    redirect(`/${params.locale}/login?redirect=${encodeURIComponent(taskRedirectUrl)}`);
  }

  const data = result.data;
  const workspaceProjectId = focusProject || data.project?.id;
  const workspaceFocusTarget = focusTarget || data.target?.id || '';
  const workspaceRedirectParams = new URLSearchParams();
  if (workspaceProjectId) workspaceRedirectParams.set('project', workspaceProjectId);
  if (focusTask) workspaceRedirectParams.set('focusTask', focusTask);
  if (workspaceFocusTarget) workspaceRedirectParams.set('focusTarget', workspaceFocusTarget);
  const workspaceRedirectUrl = `/${params.locale}/distribution${
    workspaceRedirectParams.toString() ? `?${workspaceRedirectParams.toString()}` : ''
  }`;
  const isChinese = params.locale === 'cn';
  const targetName = data.target?.name || (isChinese ? '目标网站' : 'the target site');
  const taskPresentation = deriveDistributionPresentationState({
    status: data.task.status,
    liveUrl: data.task.liveUrl || data.recentResult?.liveUrl,
    linkStatus: data.task.linkStatus || data.recentResult?.linkStatus,
    packageStatus: data.package?.status || null,
    blockedReason: data.task.blockedReason,
    dueDate: data.task.dueDate,
  });
  const statusChoices = getDistributionTaskStatusChoices();
  const statusActions: Partial<Record<DistributionTaskStatus, readonly DistributionTaskStatus[]>> = {
    needs_assets: ['in_progress', 'blocked'],
    ready_to_submit: ['submitted', 'blocked'],
    submitted: ['waiting_review', 'live', 'blocked'],
    waiting_review: ['live', 'blocked'],
    live: ['follow_up', 'done', 'blocked'],
    follow_up: ['live', 'done', 'blocked'],
    blocked: ['in_progress', 'skipped'],
  };
  const quickStatuses = statusActions[data.task.status] || [];
  const canRecordResult = ['submitted', 'waiting_review', 'live', 'follow_up'].includes(data.task.status);
  const canRecheckResult = ['submitted', 'waiting_review', 'live', 'follow_up', 'done'].includes(data.task.status);
  const latestUrl = data.recentResult?.liveUrl || '';
  const isLive = data.task.status === 'live' && Boolean(latestUrl);
  const hasPackage = Boolean(data.package);
  const packageReady = Boolean(data.package?.ready);
  const hasActiveTargetLink = Boolean(data.target?.submissionUrl || data.target?.homepageUrl);
  const submissionLink = data.target?.submissionUrl || data.target?.homepageUrl || '';
  const primaryActionType = getPrimaryActionType(data.task.status, packageReady, taskPresentation.blocked, hasPackage);
  const primaryActionLabel =
    primaryActionType === 'generate'
      ? isChinese
        ? '生成并完善材料包'
        : 'Generate package'
      : primaryActionType === 'ready'
        ? isChinese
          ? '准备完成，进入待提交'
          : 'Mark ready to submit'
        : primaryActionType === 'submit'
          ? isChinese
            ? '标记已提交'
            : 'Mark as submitted'
          : primaryActionType === 'check-result' || primaryActionType === 'recheck'
            ? isChinese
              ? '记录审核结果'
              : 'Record review result'
            : primaryActionType === 'follow-up'
              ? isChinese
                ? '打开高级动作创建复查任务'
                : 'Open advanced actions for follow-up'
              : primaryActionType === 'done'
                ? isChinese
                  ? '任务完成'
                  : 'Complete this task'
                : primaryActionType === 'unblock'
                  ? isChinese
                    ? '解除阻塞并继续'
                    : 'Unblock and continue'
                  : isChinese
                    ? '返回执行任务列表'
                    : 'Return to execution list';
  const primaryActionDescription =
    primaryActionType === 'generate'
      ? (isChinese ? '生成材料包后才可以进入提交动作。' : 'Generate package before moving on.')
      : primaryActionType === 'ready'
        ? (isChinese ? '任务具备提交条件，先推进到可提交状态。' : 'Move task to ready-to-submit state.')
        : primaryActionType === 'submit'
          ? (isChinese ? '手动完成目标站提交后，在此标记状态。' : 'Submit manually on target site, then mark this task as submitted.')
          : primaryActionType === 'check-result' || primaryActionType === 'recheck'
            ? (isChinese ? '先在目标站确认最新状态，再记录结果。' : 'Verify the target status first, then record result.')
            : primaryActionType === 'follow-up'
              ? (isChinese ? '已上线后重点检查是否需要复查与跟进。' : 'After launch, use follow-up actions below.')
              : primaryActionType === 'done'
      ? (isChinese ? '可直接结束本任务，返回队列处理下一项。' : 'You can finish this task and continue with the next one.')
    : (isChinese ? '进入下一步处理。' : 'Proceed to the next step.');

  const unblockStatus = packageReady ? 'ready_to_submit' : 'in_progress';
  let primaryActionPanel: ReactNode = null;
  const secondaryActions: Array<{ label: string; href: string; target?: string; rel?: string }> = [];

  if (submissionLink) {
    secondaryActions.push({
      label: isLive ? (isChinese ? '打开上线页面' : 'Open live listing') : isChinese ? '打开目标站提交页' : 'Open target submission',
      href: isLive ? latestUrl : submissionLink,
      target: '_blank',
      rel: 'noreferrer',
    });
  }

  if (primaryActionType === 'generate') {
    primaryActionPanel = (
      <DistributionActionForm action={generateDistributionPackage} successMessage='Package generated. Refreshing your task…'>
        <input type='hidden' name='taskId' value={data.task.id} />
        <DistributionActionButton
          label={isChinese ? '生成专属材料包' : 'Generate target package'}
          pendingLabel={isChinese ? '正在生成，请稍候…' : 'Generating package…'}
          className='inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white hover:bg-cyan-800 disabled:cursor-wait disabled:bg-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cyan-500'
        />
      </DistributionActionForm>
    );
  } else if (primaryActionType === 'ready') {
    primaryActionPanel = (
      <DistributionActionForm
        action={updateDistributionTaskStatus}
        successMessage={isChinese ? '任务已准备就绪。请继续下一步。' : 'Task is ready to submit. Please continue.'}
      >
        <input type='hidden' name='taskId' value={data.task.id} />
        <input type='hidden' name='status' value='ready_to_submit' />
        <DistributionSubmitButton
          pendingLabel={isChinese ? '更新中…' : 'Updating…'}
          className='inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-800 disabled:cursor-wait disabled:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500'
        >
          {isChinese ? '确认资料已准备' : 'Mark package ready'}
        </DistributionSubmitButton>
      </DistributionActionForm>
    );
  } else if (primaryActionType === 'submit') {
    primaryActionPanel = (
      <DistributionActionForm
        action={updateDistributionTaskStatus}
        successMessage={isChinese ? '状态已更新：已提交。' : 'Task status set to submitted.'}
      >
        <input type='hidden' name='taskId' value={data.task.id} />
        <input type='hidden' name='status' value='submitted' />
        <DistributionSubmitButton
          pendingLabel={isChinese ? '更新中…' : 'Updating…'}
          className='inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-700 px-4 py-3 text-sm font-bold text-white hover:bg-cyan-800 disabled:cursor-wait disabled:bg-cyan-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cyan-500'
        >
          {isChinese ? '我已提交到目标站' : 'I submitted on target site'}
        </DistributionSubmitButton>
      </DistributionActionForm>
    );
  } else if (primaryActionType === 'check-result' || primaryActionType === 'recheck') {
    primaryActionPanel = (
      <DistributionActionForm action={recordDistributionResult} successMessage={isChinese ? '结果已记录。请刷新查看更新。' : 'Result recorded. Refreshing task…'}>
        <input type='hidden' name='taskId' value={data.task.id} />
        <div className='grid gap-3'>
          <input
            name='liveUrl'
            type='url'
            defaultValue={latestUrl}
            placeholder='https://live-url.example'
            className='rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-400'
          />
          <select
            name='linkStatus'
            defaultValue='pending'
            className='rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm'
          >
            <option value='pending'>Pending review</option>
            <option value='live'>Live</option>
            <option value='nofollow'>Nofollow</option>
            <option value='rejected'>Rejected</option>
            <option value='removed'>Removed</option>
          </select>
          <select name='blockedReasonType' defaultValue='' className='rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs'>
            {blockedReasonTypes.map((reasonType) => (
              <option key={reasonType.value || 'empty'} value={reasonType.value}>
                {reasonType.label}
              </option>
            ))}
          </select>
          <textarea
            name='notes'
            rows={2}
            placeholder={isChinese ? '补充复查情况（建议包含截图/时间）' : 'Add evidence or notes (screenshot/time).'}
            className='rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-400'
          />
          <DistributionSubmitButton
            pendingLabel={isChinese ? '保存中…' : 'Saving…'}
            className='inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white hover:bg-cyan-800 disabled:cursor-wait disabled:bg-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-500'
          >
            {isChinese ? '保存审核结果' : 'Save review result'}
          </DistributionSubmitButton>
        </div>
      </DistributionActionForm>
    );
  } else if (primaryActionType === 'follow-up') {
    primaryActionPanel = (
      <DistributionActionForm
        action={createDistributionFollowUpTask}
        successMessage={isChinese ? '复查任务已创建。' : 'Follow-up task created.'}
      >
        <input type='hidden' name='taskId' value={data.task.id} />
        <div className='grid gap-3 md:grid-cols-[1fr_auto] md:items-end'>
          <input
            name='days'
            type='number'
            min='1'
            defaultValue='7'
            className='rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-400'
          />
          <DistributionSubmitButton
            pendingLabel={isChinese ? '创建中…' : 'Creating…'}
            className='inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-amber-700 disabled:cursor-wait disabled:bg-amber-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-500'
          >
            {isChinese ? '创建7天复查任务' : 'Create 7-day follow-up'}
          </DistributionSubmitButton>
        </div>
      </DistributionActionForm>
    );
  } else if (primaryActionType === 'done') {
    primaryActionPanel = (
      <DistributionActionForm
        action={updateDistributionTaskStatus}
        successMessage={isChinese ? '任务已完成。返回队列继续下一项。' : 'Task marked done. You can continue with the next one.'}
      >
        <input type='hidden' name='taskId' value={data.task.id} />
        <input type='hidden' name='status' value='done' />
        <DistributionSubmitButton
          pendingLabel={isChinese ? '更新中…' : 'Updating…'}
          className='inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-800 disabled:cursor-wait disabled:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500'
        >
          {isChinese ? '确认任务完成' : 'Mark task completed'}
        </DistributionSubmitButton>
      </DistributionActionForm>
    );
  } else if (primaryActionType === 'unblock') {
    primaryActionPanel = (
      <DistributionActionForm
        action={updateDistributionTaskStatus}
        successMessage={isChinese ? '阻塞已清理，任务恢复执行。' : 'Block cleared. Continuing in execution flow.'}
      >
        <input type='hidden' name='taskId' value={data.task.id} />
        <input type='hidden' name='status' value={unblockStatus} />
        <DistributionSubmitButton
          pendingLabel={isChinese ? '更新中…' : 'Updating…'}
          className='inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white hover:bg-cyan-800 disabled:cursor-wait disabled:bg-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-500'
        >
          {isChinese ? '已处理完阻塞，恢复执行' : 'Resume task execution'}
        </DistributionSubmitButton>
      </DistributionActionForm>
    );
  } else {
    primaryActionPanel = (
      <Link
        href={`/${params.locale}/distribution/tasks`}
        className='inline-flex w-full items-center justify-center rounded-xl bg-cyan-700 px-4 py-3 text-sm font-bold text-white hover:bg-cyan-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cyan-500'
      >
        {isChinese ? '返回执行任务列表' : 'Back to execution queue'}
      </Link>
    );
  }

  return (
    <div className='mx-auto w-full max-w-6xl px-5 py-10 pb-28 sm:px-8 lg:px-12'>
      <div className='mb-6 flex items-center justify-between gap-4'>
        <Link
          href={workspaceRedirectUrl.replace('/aibesttool.com', '')}
          className='inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-cyan-300 hover:text-cyan-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cyan-500'
        >
          <ArrowLeft className='h-4 w-4' /> {isChinese ? '返回分发工作台' : 'Back to workspace'}
        </Link>
        <div className='text-xs text-slate-500'>{isChinese ? '人工执行页面' : 'Human-led action page'}</div>
      </div>

      <section className='mb-6 rounded-3xl border border-cyan-200 bg-gradient-to-r from-cyan-50 to-amber-50 p-6 shadow-sm'>
        <div className='text-xs font-bold uppercase tracking-[0.16em] text-cyan-700'>
          {isChinese ? '你现在只需要做这一件事' : 'Your single next action'}
        </div>
        <div className='mt-2'>
          <h2 className='text-2xl font-bold text-slate-950'>{primaryActionLabel}</h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>{primaryActionDescription}</p>
        </div>

        <div className='mt-4'>
          <div className='rounded-xl border border-cyan-200 bg-white/80 p-4'>{primaryActionPanel}</div>
        </div>
        {secondaryActions.length > 0 ? (
          <div className='mt-4 flex flex-wrap gap-2'>
            {secondaryActions.map((action) => (
              <a
                key={action.href}
                href={action.href}
                target={action.target || '_self'}
                rel={action.rel}
                className='inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:border-cyan-300 hover:text-cyan-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cyan-500'
              >
                {action.label}
                <ArrowUpRight className='h-3.5 w-3.5' />
              </a>
            ))}
            <a
              href='#task-submission-package'
              className='inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:border-cyan-300 hover:text-cyan-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cyan-500'
            >
              {isChinese ? '查看并补充材料' : 'Open submission package'}
              <ArrowUpRight className='h-3.5 w-3.5' />
            </a>
          </div>
        ) : null}
      </section>

      <div className='md:hidden fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 p-3' style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
        <div className='mx-auto flex max-w-6xl gap-2'>
          <div className='w-full'>{primaryActionPanel}</div>
        </div>
      </div>

      <section className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
          <div className='space-y-3'>
            <div className='flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500'>
              <span className='rounded-full bg-slate-100 px-2.5 py-1'>{data.channel.name}</span>
              <span className={`rounded-full px-2.5 py-1 ${taskPresentation.toneClass}`}>
                {taskPresentation.label}
              </span>
              {taskPresentation.blocked ? <span className='rounded-full bg-slate-900 px-2.5 py-1 text-white'>Blocked</span> : null}
              <span className='rounded-full bg-amber-50 px-2.5 py-1 text-amber-700'>{data.task.priority}</span>
            </div>
            <h1 className='text-3xl font-bold tracking-tight text-slate-950'>{data.task.title}</h1>
            <p className='max-w-3xl text-sm leading-6 text-slate-600'>
              {getDistributionTaskStatusDescription(data.task.status)}
            </p>
            <div className='flex flex-wrap gap-3 text-sm text-slate-600'>
              <span>Due: {data.task.dueDate || 'not scheduled'}</span>
              <span>Type: {data.task.taskType}</span>
              <span>Updated: {data.task.updatedAt || '—'}</span>
            </div>
          </div>
          <div className='rounded-2xl border border-slate-200 bg-slate-50 p-4'>
            <div className='text-xs font-bold uppercase tracking-wide text-slate-500'>Current status</div>
            <div className='mt-2 text-lg font-bold text-slate-950'>
              {taskPresentation.label}
            </div>
            <p className='mt-1 text-sm text-slate-600'>{getDistributionTaskStatusDescription(data.task.status)}</p>
            <p className='mt-2 text-xs text-slate-500'>Next action: {taskPresentation.actionHint}</p>
            {taskPresentation.nextReviewAt ? <p className='mt-1 text-xs text-slate-500'>Review by: {taskPresentation.nextReviewAt}</p> : null}
          </div>
        </div>
      </section>
      <section
        id='task-submission-package'
        className='mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'
      >
        <div className='text-xs font-bold uppercase tracking-[0.16em] text-cyan-700'>Latest result snapshot</div>
        <div className='mt-2 flex flex-wrap items-center justify-between gap-3'>
          <div>
            <h2 className='text-xl font-bold text-slate-950'>{isChinese ? '记录状态' : 'Recorded status'}</h2>
            <p className='mt-1 text-sm text-slate-600'>
              {data.recentResult
                ? isChinese
                  ? `当前状态：${data.recentResult.linkStatus || 'unknown'}`
                  : `Latest status: ${data.recentResult.linkStatus || 'unknown'}`
                : isChinese
                  ? '尚未记录 URL/结果。请先完成提交后回来录入。'
                  : 'No live URL or result recorded yet. Submit on the target site first, then record here.'}
            </p>
          </div>
          {data.recentResult ? (
            <div className='text-xs text-slate-500'>
              <div>{data.recentResult.checkedAt || '—'}</div>
              <div className='mt-1 break-all'>{data.recentResult.notes || '—'}</div>
            </div>
          ) : null}
        </div>
      </section>

      {data.target ? (
        <section className='mt-6 rounded-2xl border border-cyan-200 bg-cyan-50/60 p-5'>
          <div className='flex flex-col justify-between gap-4 lg:flex-row lg:items-start'>
            <div>
              <div className='text-xs font-bold uppercase tracking-[0.16em] text-cyan-700'>Concrete target site</div>
              <h2 className='mt-1 text-xl font-bold text-slate-950'>{data.target.name}</h2>
              <div className='mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-600'>
                <span className='rounded-full bg-white px-2.5 py-1'>Rule confidence {data.target.confidence}%</span>
                {data.target.requiresAccount ? (
                  <span className='rounded-full bg-white px-2.5 py-1'>Account required</span>
                ) : null}
                {data.target.requiresPayment ? (
                  <span className='rounded-full bg-white px-2.5 py-1'>Payment required</span>
                ) : null}
                {data.target.requiresCaptcha ? (
                  <span className='rounded-full bg-white px-2.5 py-1'>CAPTCHA</span>
                ) : null}
                {data.target.requiresBacklink ? (
                  <span className='rounded-full bg-white px-2.5 py-1'>Reciprocal link requested</span>
                ) : null}
                {data.target.editorialReview ? (
                  <span className='rounded-full bg-white px-2.5 py-1'>
                    Editorial review
                    {data.target.expectedReviewDays ? ` · about ${data.target.expectedReviewDays}d` : ''}
                  </span>
                ) : null}
              </div>
            </div>
            <div className='flex flex-wrap gap-2'>
              {data.target.registrationUrl ? (
                <a
                  href={data.target.registrationUrl}
                  target='_blank'
                  rel='noreferrer'
                  className='rounded-xl border border-cyan-200 bg-white px-4 py-2.5 text-sm font-bold text-cyan-800'
                >
                  Registration
                </a>
              ) : null}
              {data.target.pricingUrl ? (
                <a
                  href={data.target.pricingUrl}
                  target='_blank'
                  rel='noreferrer'
                  className='rounded-xl border border-cyan-200 bg-white px-4 py-2.5 text-sm font-bold text-cyan-800'
                >
                  Pricing rules
                </a>
              ) : null}
              <a
                href={isLive ? latestUrl : data.target.submissionUrl || data.target.homepageUrl}
                target='_blank'
                rel='noreferrer'
                className='inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white'
              >
                {isLive ? (isChinese ? '打开上线页面' : 'Open live listing') : 'Open submission page'}{' '}
                <ArrowUpRight className='h-4 w-4' />
              </a>
            </div>
          </div>
        </section>
      ) : (
        <section className='mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900'>
          This legacy task is channel-level only. Bind a concrete target site before moving it to ready to submit.
        </section>
      )}

      <section className='mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
        <div className='flex flex-col justify-between gap-4 lg:flex-row lg:items-start'>
          <div>
            <div className='text-xs font-bold uppercase tracking-[0.16em] text-cyan-700'>Target submission package</div>
            <h2 className='mt-1 text-xl font-bold text-slate-950'>Everything needed for this target in one place</h2>
            <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
              Generate from confirmed product facts, reusable assets, and the target site's known rules. You keep final
              review and submit manually on the target site.
            </p>
          </div>
          {data.package ? (
            <DistributionActionForm action={generateDistributionPackage} successMessage='Package regenerated. Refreshing your task…'>
              <input type='hidden' name='taskId' value={data.task.id} />
              <DistributionActionButton
                label={isChinese ? '重新生成材料包' : 'Regenerate package'}
                pendingLabel={isChinese ? '正在重新生成…' : 'Regenerating…'}
                className='inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-cyan-800 disabled:cursor-wait disabled:bg-slate-400'
              />
            </DistributionActionForm>
          ) : null}
        </div>

        {data.package ? (
          <div className='mt-5'>
            <div
              className={`rounded-xl p-4 text-sm ${
                data.package.ready ? 'bg-emerald-50 text-emerald-900' : 'bg-amber-50 text-amber-900'
              }`}
            >
              <div className='font-bold'>
                {data.package.ready ? 'Ready for human submission' : 'Not ready yet: complete the items below'}
              </div>
              <div className='mt-1 text-xs'>
                Package status: {data.package.status} · Updated {data.package.updatedAt || 'just now'}
              </div>
            </div>
            {data.package.blockers.length > 0 ? (
              <div className='mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4'>
                <div className='text-sm font-bold text-rose-900'>Blocking items</div>
                <ul className='mt-2 space-y-1 text-sm text-rose-800'>
                  {data.package.blockers.map((blocker) => (
                    <li key={blocker}>• {blocker}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {data.package.assetRequirements.length > 0 ? (
              <div className='mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-600'>
                <span className='py-1'>Required assets:</span>
                {data.package.assetRequirements.map((asset) => (
                  <span
                    key={asset}
                    className={`rounded-full px-2.5 py-1 ${
                      data.package?.missingAssets.includes(asset)
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {asset.replaceAll('_', ' ')}
                  </span>
                ))}
              </div>
            ) : null}
            <div className='mt-4 grid gap-4 lg:grid-cols-2'>
              {data.package.fields.map((field) => (
                <CopyField
                  key={field.key}
                  label={`${field.label}${field.required ? ' *' : ''}`}
                  value={field.value}
                  characterLimit={field.characterLimit}
                  manual={field.manual}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className='mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600'>
            No saved package yet. Generate one after confirming the project profile and adding reusable assets.
          </div>
        )}
      </section>

      {data.package ? (
        <details className='mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
          <summary className='cursor-pointer text-sm font-bold text-slate-900'>
            {isChinese ? '查看辅助文案、预检和跟踪参数' : 'View supporting copy, preflight, and tracking details'}
          </summary>
          <section className='mt-5 grid gap-4 lg:grid-cols-3'>
            <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2'>
              <div className='flex items-center gap-2 text-sm font-bold text-slate-900'>
                <Sparkles className='h-4 w-4 text-cyan-700' /> Copy package
              </div>
              <div className='mt-4 grid gap-4 md:grid-cols-2'>
                <div className='rounded-xl bg-slate-50 p-4'>
                  <div className='text-xs font-bold uppercase tracking-wide text-slate-500'>Title</div>
                  <div className='mt-2 text-base font-semibold text-slate-950'>{data.copyPackage.title}</div>
                  <div className='mt-3 text-xs text-slate-500'>Alternatives</div>
                  <ul className='mt-1 space-y-1 text-sm text-slate-700'>
                    {data.copyPackage.titleAlternatives.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div className='rounded-xl bg-slate-50 p-4'>
                  <div className='text-xs font-bold uppercase tracking-wide text-slate-500'>Description</div>
                  <div className='mt-2 text-sm leading-6 text-slate-700'>{data.copyPackage.description}</div>
                </div>
                <div className='rounded-xl bg-slate-50 p-4'>
                  <div className='text-xs font-bold uppercase tracking-wide text-slate-500'>Disclosure</div>
                  <div className='mt-2 text-sm text-slate-700'>{data.copyPackage.disclosure}</div>
                  <div className='mt-3 text-xs text-slate-500'>Proof points</div>
                  <ul className='mt-1 space-y-1 text-sm text-slate-700'>
                    {data.copyPackage.proofPoints.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div className='rounded-xl bg-slate-50 p-4'>
                  <div className='text-xs font-bold uppercase tracking-wide text-slate-500'>Follow-up prompt</div>
                  <div className='mt-2 text-sm leading-6 text-slate-700'>{data.copyPackage.followUpPrompt}</div>
                  <div className='mt-3 text-xs text-slate-500'>Required fields</div>
                  <div className='mt-1 flex flex-wrap gap-2'>
                    {data.copyPackage.requiredFields.map((field) => (
                      <span
                        key={field}
                        className='rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-600'
                      >
                        {field}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className='space-y-4'>
              <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
                <div className='flex items-center gap-2 text-sm font-bold text-slate-900'>
                  <CheckCircle2 className='h-4 w-4 text-emerald-600' /> Preflight
                </div>
                <p className='mt-3 text-sm text-slate-600'>{data.preflight.summary}</p>
                <div className='mt-3 space-y-2 text-xs text-slate-600'>
                  <div>
                    Title length: {data.preflight.titleLength}
                    {data.preflight.titleLimit ? ` / ${data.preflight.titleLimit}` : ''}
                  </div>
                  <div>
                    Description length: {data.preflight.descriptionLength}
                    {data.preflight.descriptionLimit ? ` / ${data.preflight.descriptionLimit}` : ''}
                  </div>
                  <div>Missing: {data.preflight.missingFields.join(', ') || '—'}</div>
                </div>
                {data.preflight.blockers.length > 0 ? (
                  <div className='mt-3 rounded-xl bg-rose-50 p-3 text-xs text-rose-800'>
                    {data.preflight.blockers.join(' · ')}
                  </div>
                ) : null}
                {data.preflight.warnings.length > 0 ? (
                  <div className='mt-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800'>
                    {data.preflight.warnings.join(' · ')}
                  </div>
                ) : null}
              </div>
              <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
                <div className='flex items-center gap-2 text-sm font-bold text-slate-900'>
                  <ArrowUpRight className='h-4 w-4 text-cyan-700' /> Tracked destination
                </div>
                <p className='mt-3 text-sm text-slate-600'>{data.destination.summary}</p>
                <div className='mt-3 space-y-1 rounded-xl bg-slate-50 p-3 text-xs text-slate-700'>
                  <div className='break-all'>Destination: {data.destination.destinationUrl}</div>
                  <div>Source: {data.destination.utmSource}</div>
                  <div>Campaign: {data.destination.utmCampaign}</div>
                  <div>Content: {data.destination.utmContent || '—'}</div>
                </div>
              </div>
              <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
                <div className='flex items-center gap-2 text-sm font-bold text-slate-900'>
                  <Clock3 className='h-4 w-4 text-cyan-700' /> Suggested next tasks
                </div>
                <div className='mt-3 space-y-3'>
                  {data.nextSuggestions.map((item, index) => (
                    <div key={item.id} className='rounded-xl bg-slate-50 p-3'>
                      <div className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                        #{index + 1} · {item.channelName}
                      </div>
                      <div className='mt-1 text-sm font-semibold text-slate-900'>{item.title}</div>
                      <div className='mt-1 text-xs text-slate-600'>{item.reason}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </details>
      ) : null}

      {data.package ? (
        <section className='mt-6 grid gap-4 lg:grid-cols-2'>
          {canRecheckResult ? (
            <DistributionActionForm
              action={recheckDistributionTaskResult}
              className='rounded-xl bg-slate-50 p-4'
              successMessage='Live URL rechecked. Task status refreshed automatically.'
            >
              <div className='flex items-center gap-2 text-sm font-bold text-slate-900'>
                <CheckCircle2 className='h-4 w-4 text-emerald-700' /> Recheck live URL
              </div>
              <input type='hidden' name='taskId' value={data.task.id} />
              <input
                name='liveUrl'
                type='url'
                defaultValue={latestUrl}
                placeholder='https://live-url.example'
                className='mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-400'
              />
              <DistributionSubmitButton
                pendingLabel='Rechecking…'
                className='mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-800 disabled:cursor-wait disabled:bg-emerald-500'
              >
                {isChinese ? '重新检测' : 'Recheck now'}
              </DistributionSubmitButton>
            </DistributionActionForm>
          ) : null}
          <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
            <div className='text-xs font-bold uppercase tracking-[0.16em] text-cyan-700'>Execution history</div>
            <h2 className='mt-1 text-lg font-bold text-slate-950'>What happened and when</h2>
            <div className='mt-4 space-y-3'>
              {data.events.length > 0 ? (
                data.events.map((event) => (
                  <div key={event.id} className='rounded-xl bg-slate-50 p-3'>
                    <div className='flex flex-wrap items-center justify-between gap-2'>
                      <div className='text-sm font-bold text-slate-900'>{event.eventType.replaceAll('_', ' ')}</div>
                      <div className='text-xs text-slate-500'>{event.createdAt}</div>
                    </div>
                    {event.fromStatus || event.toStatus ? (
                      <div className='mt-1 text-xs font-semibold text-cyan-700'>
                        {event.fromStatus || '—'} → {event.toStatus || '—'}
                      </div>
                    ) : null}
                    {event.reason ? <p className='mt-1 text-xs leading-5 text-slate-600'>{event.reason}</p> : null}
                  </div>
                ))
              ) : (
                <div className='rounded-xl bg-slate-50 p-4 text-sm text-slate-600'>
                  History starts when a package is generated or the task status changes.
                </div>
              )}
            </div>
          </div>
          <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
            <div className='text-xs font-bold uppercase tracking-[0.16em] text-cyan-700'>Automatic follow-up</div>
            <h2 className='mt-1 text-lg font-bold text-slate-950'>Scheduled checks</h2>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              Submitted tasks get 3- and 7-day checks. Live links get 7-, 30-, and 90-day retention checks.
            </p>
            <div className='mt-4 space-y-3'>
              {data.reminders.length > 0 ? (
                data.reminders.map((reminder) => (
                  <div key={reminder.id} className='flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3'>
                    <div>
                      <div className='text-sm font-bold text-slate-900'>
                        {reminder.reminderType.replaceAll('_', ' ')}
                      </div>
                      <div className='mt-1 text-xs text-slate-500'>{reminder.scheduledAt}</div>
                    </div>
                    <span className='rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-600'>
                      {reminder.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className='rounded-xl bg-slate-50 p-4 text-sm text-slate-600'>
                  No checks scheduled yet. Mark the task submitted or live to create them automatically.
                </div>
              )}
            </div>
          </div>
        </section>
      ) : null}

      {data.package ? (
        <section className='mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
          <div className='mb-2 flex flex-wrap justify-between gap-3'>
            <div>
              <div className='text-xs font-bold uppercase tracking-[0.16em] text-cyan-700'>
                {isChinese ? '高级动作（可选）' : 'Advanced actions (optional)'}
              </div>
              <h2 className='mt-1 text-lg font-bold text-slate-950'>
                {isChinese ? '状态更新、结果记录与复查动作' : 'Status updates, result records, and follow-up actions'}
              </h2>
            </div>
            <p className='text-xs text-slate-500'>{isChinese ? '仅在主流程完成后使用高级动作。' : 'Use after completing the main action.'}</p>
          </div>

          <details className='mt-2 rounded-xl border border-slate-200 bg-slate-50 p-4'>
            <summary className='cursor-pointer text-sm font-bold text-slate-900'>{isChinese ? '展开高级动作' : 'Open advanced actions'}</summary>
            <div className='mt-4 flex flex-wrap gap-2'>
              {quickStatuses.map((status) => (
                <DistributionActionForm
                  key={status}
                  action={updateDistributionTaskStatus}
                  successMessage={`Status updated to ${getDistributionTaskStatusLabel(status)}. Refreshing your task…`}
                >
                  <input type='hidden' name='taskId' value={data.task.id} />
                  <input type='hidden' name='status' value={status} />
                  {status === 'blocked' ? (
                    <div className='space-y-2'>
                      <select
                        name='blockedReasonType'
                        defaultValue=''
                        className='w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700'
                      >
                        {blockedReasonTypes.map((reasonType) => (
                          <option key={reasonType.value || 'empty'} value={reasonType.value}>
                            {reasonType.label}
                          </option>
                        ))}
                      </select>
                      <textarea
                        name='blockedReason'
                        rows={2}
                        placeholder='Add quick notes: why it was blocked and next action'
                        className='w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs outline-none focus:ring-2 focus:ring-cyan-400'
                      />
                      <DistributionSubmitButton
                        pendingLabel='Updating…'
                        className='inline-flex w-full items-center gap-1 rounded-xl border border-slate-200 bg-rose-600 px-3 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:cursor-wait disabled:opacity-70'
                      >
                        {getDistributionTaskStatusLabel(status)}
                      </DistributionSubmitButton>
                    </div>
                  ) : (
                    <DistributionSubmitButton
                      pendingLabel='Updating…'
                      className='inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:border-cyan-300 hover:text-cyan-700 disabled:cursor-wait disabled:opacity-70'
                    >
                      {getDistributionTaskStatusLabel(status)}
                    </DistributionSubmitButton>
                  )}
                </DistributionActionForm>
              ))}
            </div>

            <div className='mt-5 grid gap-4 md:grid-cols-2'>
              {canRecordResult && primaryActionType !== 'check-result' ? (
                <DistributionActionForm
                  action={recordDistributionResult}
                  className='rounded-xl bg-white p-4'
                  successMessage='Result recorded. Updating status and follow-up checks…'
                >
                  <div className='flex items-center gap-2 text-sm font-bold text-slate-900'>
                    <Send className='h-4 w-4 text-cyan-700' /> Record live result
                  </div>
                  <input type='hidden' name='taskId' value={data.task.id} />
                  <div className='mt-3 grid gap-3'>
                    <input
                      name='liveUrl'
                      type='url'
                      placeholder='https://live-url.example'
                      defaultValue={latestUrl}
                      className='rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-400'
                    />
                    <select
                      name='linkStatus'
                      defaultValue='pending'
                      className='rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm'
                    >
                      <option value='pending'>Pending review</option>
                      <option value='live'>Live</option>
                      <option value='nofollow'>Nofollow</option>
                      <option value='rejected'>Rejected</option>
                      <option value='removed'>Removed</option>
                    </select>
                    <select
                      name='blockedReasonType'
                      defaultValue=''
                      className='rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs'
                    >
                      {blockedReasonTypes.map((reasonType) => (
                        <option key={reasonType.value || 'empty'} value={reasonType.value}>
                          {reasonType.label}
                        </option>
                      ))}
                    </select>
                    <textarea
                      name='blockedReason'
                      rows={2}
                      placeholder='Blocking reason details (for removed/nofollow/rejected cases)'
                      className='rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-400'
                    />
                    <textarea
                      name='notes'
                      rows={3}
                      placeholder='Evidence or next follow-up note'
                      className='rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-400'
                    />
                    <DistributionSubmitButton
                      pendingLabel='Saving result…'
                      className='inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-700 px-4 py-2 text-sm font-bold text-white hover:bg-cyan-800 disabled:cursor-wait disabled:bg-cyan-500'
                    >
                      {isChinese ? '保存审核结果' : 'Save review result'}
                    </DistributionSubmitButton>
                  </div>
                </DistributionActionForm>
              ) : null}

              <DistributionActionForm
                action={createDistributionFollowUpTask}
                className='rounded-xl bg-white p-4'
                successMessage='Follow-up task created. Refreshing your task…'
              >
                <div className='flex items-center gap-2 text-sm font-bold text-slate-900'>
                  <Clock3 className='h-4 w-4 text-amber-600' /> Auto create follow-up
                </div>
                <input type='hidden' name='taskId' value={data.task.id} />
                <div className='mt-3 grid gap-3'>
                  <input
                    name='days'
                    type='number'
                    min='1'
                    defaultValue='3'
                    className='rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-400'
                  />
                  <input
                    name='reason'
                    defaultValue='Follow up on the live listing and capture any updates.'
                    className='rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-400'
                  />
                  <DistributionSubmitButton
                    pendingLabel='Creating follow-up…'
                    className='inline-flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-800 hover:bg-amber-100 disabled:cursor-wait disabled:opacity-70'
                  >
                    {isChinese ? '创建复查任务' : 'Create follow-up task'}
                  </DistributionSubmitButton>
                </div>
              </DistributionActionForm>
            </div>
          </details>
        </section>
      ) : null}

      {data.task.blockedReason ? (
        <section className='mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-5'>
          <div className='flex items-start gap-2 text-sm font-bold text-rose-700'>
            <AlertTriangle className='mt-0.5 h-4 w-4' />
            <span>{isChinese ? '当前阻塞原因' : 'Current blocked reason'}</span>
          </div>
          <p className='mt-2 text-sm text-rose-900'>{data.task.blockedReason}</p>
        </section>
      ) : null}

      <details className='mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
        <summary className='cursor-pointer text-xs font-bold uppercase tracking-[0.16em] text-cyan-700'>
          {isChinese ? '状态说明（需要时展开）' : 'Status guide (expand when needed)'}
        </summary>
        <div className='mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3'>
          {statusChoices.map((choice) => (
            <div key={choice.value} className='rounded-xl bg-slate-50 p-3'>
              <div className='text-sm font-bold text-slate-900'>{choice.label}</div>
              <p className='mt-1 text-xs leading-5 text-slate-600'>{choice.description}</p>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
