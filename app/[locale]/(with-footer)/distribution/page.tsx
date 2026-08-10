import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CalendarClock, CircleAlert, CircleCheckBig, Clock, Sparkles, Target } from 'lucide-react';

import { deriveDistributionPresentationState, type DistributionPresentationPhase, type DistributionPresentationState } from '@/lib/services/distribution/presentationState';
import { getDistributionDashboard } from '@/app/actions/distribution';
import { getDistributionPriceId } from '@/lib/services/stripe';

type DistributionPageSearchParams = {
  project?: string | string[];
};

type DistributionActionItem = {
  taskId: string;
  targetName: string;
  channelName: string | null;
  status: DistributionPresentationState['status'];
  dueDate: string | null;
  phase: DistributionPresentationPhase;
  blocked: boolean;
  actionHint: string;
  toneClass: string;
  dueLabel: string;
};

type DistributionReminder = {
  id: string;
  type: string;
  title: string;
  message: string;
  href: string | null;
  urgent: boolean;
};

function pickValue(value: undefined | string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function parseDateForSort(value: string | null) {
  if (!value) return Number.MAX_SAFE_INTEGER;
  const n = Date.parse(value);
  return Number.isNaN(n) ? Number.MAX_SAFE_INTEGER : n;
}

function formatDateLabel(value: string | null) {
  if (!value) return '--';
  return value.slice(0, 10);
}

function buildActionCandidates(tasks: Array<{ id: string; title: string; status: string; taskType?: string; dueDate: string | null; targetName?: string | null; channelName?: string | null; blockedReason?: string | null; linkStatus?: string | null; packageStatus?: string | null; liveUrl?: string | null; }>): DistributionActionItem[] {
  return tasks
    .filter((task) => !['done', 'skipped'].includes(task.status))
    .map((task) => {
      const state = deriveDistributionPresentationState({
        status: task.status,
        liveUrl: task.liveUrl || null,
        linkStatus: task.linkStatus || null,
        packageStatus: task.packageStatus || null,
        blockedReason: task.blockedReason || null,
        dueDate: task.dueDate,
      });

      const target = task.targetName || task.title;
      return {
        taskId: task.id,
        targetName: target,
        channelName: task.channelName || task.taskType || null,
        status: state.status,
        phase: state.phase,
        dueDate: task.dueDate,
        blocked: state.blocked,
        actionHint: state.actionHint,
        toneClass: state.toneClass,
        dueLabel: formatDateLabel(task.dueDate),
      };
    });
}

function buildTodayList(tasks: DistributionActionItem[], blockedCount: number) {
  const active = tasks
    .filter((item) => item.status !== 'done' && item.phase !== 'completed')
    .filter((item) => item.phase === 'execution' || item.phase === 'onboarding' || item.phase === 'opportunity')
    .sort((a, b) => {
      if (a.blocked !== b.blocked) return a.blocked ? -1 : 1;
      return parseDateForSort(a.dueDate) - parseDateForSort(b.dueDate);
    })
    .slice(0, 3);

  if (active.length > 0) return active;

  if (blockedCount > 0) {
    return tasks
      .filter((item) => item.blocked)
      .sort((a, b) => parseDateForSort(a.dueDate) - parseDateForSort(b.dueDate))
      .slice(0, 3);
  }

  return tasks
    .filter((item) => item.phase === 'monitoring')
    .sort((a, b) => parseDateForSort(a.dueDate) - parseDateForSort(b.dueDate))
    .slice(0, 1);
}

function buildMonitoringSummary(tasks: DistributionActionItem[]) {
  const upcoming = tasks
    .filter((item) => item.phase === 'monitoring' && !item.blocked)
    .sort((a, b) => parseDateForSort(a.dueDate) - parseDateForSort(b.dueDate));
  return upcoming.slice(0, 2);
}

function localize(locale: string, zh: string, en: string) {
  return locale === 'cn' ? zh : en;
}

export default async function DistributionPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams?: DistributionPageSearchParams;
}) {
  const locale = params.locale;
  const projectId = pickValue(searchParams?.project);
  const result = await getDistributionDashboard(projectId);

  if (!result.success) {
    if (result.error === 'Unauthorized') {
      redirect(`/${locale}/login?redirect=/${locale}/distribution${projectId ? `?project=${encodeURIComponent(projectId)}` : ''}`);
    }
    return <div className='mx-auto w-full max-w-5xl px-5 py-16 text-center text-slate-700'>{result.error}</div>;
  }

  if (!result.access || !result.data) {
    const upgradeUrl = `/${locale}/distribution${projectId ? `?project=${encodeURIComponent(projectId)}` : ''}`;
    return (
      <div className='mx-auto w-full max-w-4xl px-5 py-16'>
        <div className='rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12'>
          <div className='text-xs font-bold uppercase tracking-[0.2em] text-cyan-700'>Distribution workspace</div>
          <h1 className='mt-4 text-3xl font-bold tracking-tight text-slate-950'>Build complete distribution profile first</h1>
          <p className='mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-600'>
            Activate a plan to manage products, targets, execution, and monitoring in one workspace.
          </p>
          <div className='mx-auto mt-8 grid max-w-2xl gap-3 text-left sm:grid-cols-2'>
            {[
              { plan: 'pro', label: 'Pro', monthly: '$19/mo', yearly: '$190/yr', detail: 'Up to 5 active projects' },
              { plan: 'agency', label: 'Agency', monthly: '$49/mo', yearly: '$490/yr', detail: 'Up to 25 active projects' },
            ].map((item) => {
              const monthlyAvailable = Boolean(getDistributionPriceId(item.plan as 'pro' | 'agency', 'monthly'));
              const yearlyAvailable = Boolean(getDistributionPriceId(item.plan as 'pro' | 'agency', 'yearly'));
              return (
                <div key={item.plan} className='rounded-2xl border border-slate-200 bg-slate-50 p-4'>
                  <div className='flex items-center justify-between'>
                    <span className='font-bold text-slate-900'>{item.label}</span>
                    <span className='text-sm font-bold text-cyan-700'>{item.monthly} · {item.yearly}</span>
                  </div>
                  <p className='mt-2 text-xs text-slate-600'>{item.detail}</p>
                  <div className='mt-4 flex flex-wrap gap-2'>
                    {monthlyAvailable ? (
                      <a href={`/api/payments/stripe/distribution/checkout?plan=${item.plan}&interval=monthly`} className='inline-flex rounded-lg bg-cyan-700 px-3 py-2 text-xs font-bold text-white hover:bg-cyan-800'>
                        {localize(locale, '月付', 'Monthly')}
                      </a>
                    ) : null}
                    {yearlyAvailable ? (
                      <a href={`/api/payments/stripe/distribution/checkout?plan=${item.plan}&interval=yearly`} className='inline-flex rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800'>
                        {localize(locale, '年付', 'Yearly')}
                      </a>
                    ) : null}
                    {!monthlyAvailable && !yearlyAvailable ? (
                      <div className='text-xs font-semibold text-slate-400'>Coming soon</div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
          <p className='mt-4 text-xs text-slate-500'>{localize(locale, '支付完成并 webhook 成功后可开始使用。', 'Start once Stripe checkout is confirmed.')}</p>
        </div>
      </div>
    );
  }

  const data = result.data;
  if (!data.project) {
    return <div className='mx-auto max-w-4xl px-5 py-16 text-slate-700'>{localize(locale, '工作区当前无可用项目。', 'No active project in workspace.')}</div>;
  }

  const tasks = data.tasks || [];
  const actionItems = buildActionCandidates(tasks);
  const blockedItems = actionItems.filter((item) => item.blocked);
  const todayActionItems = buildTodayList(actionItems, blockedItems.length);
  const monitoringItems = buildMonitoringSummary(actionItems);
  const criticalNotifications = (data.notifications || []) as DistributionReminder[];

  return (
    <div className='w-full px-4 py-6 sm:px-6 lg:px-8'>
      <section className='mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div>
            <div className='text-xs font-bold uppercase tracking-[0.18em] text-cyan-700'>
              {localize(locale, '分发工作台', 'Distribution Workspace')}
            </div>
            <h1 className='mt-1 text-xl font-bold text-slate-950'>
              {localize(
                locale,
                `今天工作要务 · ${data.project.name || '默认项目'}`,
                `Today's distribution actions · ${data.project.name || 'Default project'}`,
              )}
            </h1>
            <p className='mt-1 text-sm text-slate-600'>{localize(locale, '先做一条有明确动作的任务，再按顺序推进。', 'Prioritize one clear action first, then continue by sequence.')}</p>
          </div>
          <Link href={`/${locale}/distribution/products${projectId ? `?project=${encodeURIComponent(projectId)}` : ''}`} className='inline-flex items-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700'>
            {localize(locale, '打开产品资料', 'Open product profile')}
          </Link>
        </div>
      </section>

      <section className='mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
        <div className='rounded-xl border border-slate-200 bg-white p-4'>
          <div className='flex items-center gap-2 text-xs text-slate-500'>
            <Target className='h-4 w-4' />
            {localize(locale, '待处理项目', 'Open actions')}
          </div>
          <div className='mt-2 text-2xl font-bold text-slate-900'>{tasks.filter((task) => !['done', 'skipped'].includes(task.status)).length}</div>
        </div>
        <div className='rounded-xl border border-slate-200 bg-white p-4'>
          <div className='flex items-center gap-2 text-xs text-slate-500'>
            <CircleAlert className='h-4 w-4' />
            {localize(locale, '阻塞项', 'Blocked')}
          </div>
          <div className='mt-2 text-2xl font-bold text-rose-700'>{blockedItems.length}</div>
        </div>
        <div className='rounded-xl border border-slate-200 bg-white p-4'>
          <div className='flex items-center gap-2 text-xs text-slate-500'>
            <Clock className='h-4 w-4' />
            {localize(locale, '今日需处理', 'Due today')}
          </div>
          <div className='mt-2 text-2xl font-bold text-amber-700'>{data.metrics.dueToday}</div>
        </div>
        <div className='rounded-xl border border-slate-200 bg-white p-4'>
          <div className='flex items-center gap-2 text-xs text-slate-500'>
            <CircleCheckBig className='h-4 w-4' />
            {localize(locale, '本周处理', 'Done this week')}
          </div>
          <div className='mt-2 text-2xl font-bold text-emerald-700'>{data.metrics.submitted + data.metrics.waitingReview + data.metrics.followUp + data.metrics.live}</div>
        </div>
      </section>

      <section className='mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
        <div className='flex items-center justify-between'>
          <h2 className='text-sm font-bold text-slate-900'>{localize(locale, '今日第一优先（1–3 项）', 'Top priorities today (1-3)')}</h2>
          <Link href={`/${locale}/distribution/tasks${projectId ? `?project=${encodeURIComponent(projectId)}` : ''}`} className='rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-slate-700'>
            {localize(locale, '查看全部任务', 'Open task list')}
          </Link>
        </div>
        {todayActionItems.length === 0 ? (
          <div className='mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500'>
            {localize(locale, '暂无今天待执行动作。可到机会页继续选择新目标。', 'No priority tasks now. Open opportunities to add new channels.')}
          </div>
        ) : (
          <div className='mt-4 space-y-3'>
            {todayActionItems.map((task) => (
              <Link
                href={`/${locale}/distribution/tasks/${task.taskId}`}
                key={task.taskId}
                className='block rounded-xl border border-slate-200 bg-slate-50 p-3 transition hover:border-cyan-300 hover:bg-white'
              >
                <div className='flex flex-wrap items-center justify-between gap-2'>
                  <div>
                    <div className='text-sm font-bold text-slate-900'>{task.targetName}</div>
                    <div className='mt-1 text-xs text-slate-600'>
                      {(task.channelName || '')}
                      {task.channelName ? ' · ' : ''}
                      {localize(locale, '到期', 'Due')} {task.dueLabel}
                    </div>
                    <div className='mt-2 text-xs text-slate-500'>{task.actionHint}</div>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs ${task.toneClass}`}>{task.status}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className='mb-6 grid gap-3 lg:grid-cols-2'>
        <div className='rounded-2xl border border-slate-200 bg-white p-5'>
          <h2 className='text-sm font-bold text-slate-900'>
            <span className='inline-flex items-center gap-2'>
              <Sparkles className='h-4 w-4 text-cyan-700' />
              {localize(locale, '阻塞收件箱', 'Blocked inbox')}
            </span>
          </h2>
          <div className='mt-3 space-y-2'>
            {blockedItems.length === 0 ? (
              <div className='rounded-xl bg-slate-50 p-3 text-xs text-slate-500'>{localize(locale, '目前无阻塞任务', 'No blocked items currently.')}</div>
            ) : null}
            {blockedItems.slice(0, 3).map((task) => (
              <Link
                href={`/${locale}/distribution/tasks/${task.taskId}`}
                key={`blocked-${task.taskId}`}
                className='flex items-center justify-between rounded-xl border border-rose-100 bg-rose-50 p-3 text-sm text-rose-900 hover:bg-rose-100'
              >
                <div className='font-semibold'>{task.targetName}</div>
                <div className='text-xs'>{localize(locale, '修复原因', 'Resolve blocker')}</div>
              </Link>
            ))}
          </div>
        </div>

        <div className='rounded-2xl border border-slate-200 bg-white p-5'>
          <h2 className='text-sm font-bold text-slate-900'>
            <span className='inline-flex items-center gap-2'>
              <CalendarClock className='h-4 w-4 text-cyan-700' />
              {localize(locale, '复查提醒', 'Recheck reminders')}
            </span>
          </h2>
          <div className='mt-3 space-y-2 text-sm'>
            {monitoringItems.length === 0 ? (
              <div className='rounded-xl bg-slate-50 p-3 text-xs text-slate-500'>
                {localize(locale, '暂无需复查任务。完成后可回到任务里继续推进。', 'No reminders now. Create/update tasks and return to track.')}
              </div>
            ) : null}
            {monitoringItems.map((task) => (
              <Link
                href={`/${locale}/distribution/tasks/${task.taskId}`}
                key={`monitor-${task.taskId}`}
                className='block rounded-xl border border-slate-200 bg-slate-50 p-3'
              >
                <div className='flex items-center justify-between'>
                  <div className='font-semibold text-slate-900'>{task.targetName}</div>
                  <span className='text-xs text-slate-500'>
                    {localize(locale, '复查', 'Review')} · {task.dueLabel}
                  </span>
                </div>
                <div className='mt-1 text-xs text-slate-600'>{task.actionHint}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className='grid gap-3 lg:grid-cols-2'>
        <div className='rounded-2xl border border-slate-200 bg-white p-5'>
          <div className='flex items-center justify-between'>
            <div className='text-sm font-bold text-slate-900'>{localize(locale, '工作提醒', 'Critical reminders')}</div>
            <Link href={`/${locale}/distribution/monitoring${projectId ? `?project=${encodeURIComponent(projectId)}` : ''}`} className='text-xs font-semibold text-cyan-700'>
              {localize(locale, '去监控', 'Monitor')}
            </Link>
          </div>
          <div className='mt-3 space-y-2'>
            {(criticalNotifications.length === 0 ? [] : criticalNotifications).map((notice) => (
              <div key={notice.id} className='rounded-xl border border-slate-200 bg-slate-50 p-3'>
                <div className='text-sm font-semibold text-slate-900'>{notice.title}</div>
                <div className='mt-1 text-xs text-slate-600'>{notice.message}</div>
                {notice.href ? <Link href={notice.href} className='mt-2 inline-flex text-xs font-bold text-cyan-700'>{localize(locale, '立即处理', 'Take action')}</Link> : null}
              </div>
            ))}
            {criticalNotifications.length === 0 ? <div className='rounded-xl bg-slate-50 p-3 text-xs text-slate-500'>{localize(locale, '最近无紧急提醒', 'No urgent reminders right now.')}</div> : null}
          </div>
        </div>

        <div className='rounded-2xl border border-slate-200 bg-white p-5'>
          <div className='flex items-center justify-between'>
            <div className='text-sm font-bold text-slate-900'>{localize(locale, '本周建议', 'Weekly suggestion')}</div>
            <Link href={`/${locale}/distribution/reports${projectId ? `?project=${encodeURIComponent(projectId)}` : ''}`} className='text-xs font-semibold text-cyan-700'>
              {localize(locale, '看复盘', 'Reports')}
            </Link>
          </div>
          <div className='mt-3 rounded-xl bg-cyan-50 p-3 text-sm text-slate-700'>
            <div className='font-semibold'>{localize(locale, '优先顺序', 'Recommended next step')}</div>
            <div className='mt-2 text-sm leading-6'>
              {localize(locale, '先完成今天的阻塞项，再补齐1-2个可提交任务，之后进入复查。', 'Resolve blockers first, then finish 1-2 ready-to-submit tasks, then move to monitoring.')}
            </div>
            <div className='mt-3 flex flex-wrap gap-2'>
              <Link href={`/${locale}/distribution/opportunities${projectId ? `?project=${encodeURIComponent(projectId)}` : ''}`} className='inline-flex rounded-lg bg-cyan-700 px-3 py-2 text-xs font-bold text-white'>
                {localize(locale, '新增目标站', 'Add opportunities')}
              </Link>
              <Link href={`/${locale}/distribution/products${projectId ? `?project=${encodeURIComponent(projectId)}` : ''}`} className='inline-flex rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700'>
                {localize(locale, '补齐资料', 'Complete profile')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
