'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Circle,
  Bell,
  ExternalLink,
  Link2,
  LoaderCircle,
  Plus,
  Radar,
  Send,
  ShieldCheck,
  Clock3,
} from 'lucide-react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { DistributionActionForm, DistributionSubmitButton, useDistributionFormState } from './DistributionActionForm';

import { getDistributionAssetGuidance } from '@/lib/services/distribution/listingBridge';
import { deriveDistributionPresentationState } from '@/lib/services/distribution/presentationState';
import {
  DISTRIBUTION_TASK_STATUS_META,
  getDistributionTaskStatusChoices,
  getDistributionTaskStatusLabel,
  type DistributionTaskStatus,
} from '@/lib/services/distribution/taskStateMachine';
import {
  acceptDistributionTarget,
  createDistributionProject,
  createDistributionProjectAsset,
  createDistributionTask,
  createDistributionUtmLink,
  rescheduleDistributionTasks,
  importDistributionCatalogListing,
  importDistributionIntelligenceAssets,
  recordDistributionResult,
  recheckDistributionTaskResult,
  seedDistributionStarterTasks,
  updateDistributionProjectProfile,
  updateDistributionTaskStatus,
  type DistributionDashboard as DistributionDashboardData,
} from '@/app/actions/distribution';

const statusOptions = getDistributionTaskStatusChoices();

function ImportListingButton({ disabled, linked }: { disabled: boolean; linked: boolean }) {
  const { pending } = useFormStatus();
  const formState = useDistributionFormState();
  const isPending = formState?.submitting ?? pending;
  const [stage, setStage] = useState(0);
  const messages = linked
    ? ['Refreshing listing data...', 'Updating product facts...', 'Syncing reusable assets...']
    : ['Connecting product listing...', 'Filling product facts...', 'Saving reusable assets...'];

  useEffect(() => {
    if (!isPending) {
      setStage(0);
      return;
    }
    const timer = window.setInterval(() => setStage((current) => Math.min(current + 1, messages.length - 1)), 700);
    return () => window.clearInterval(timer);
  }, [isPending, messages.length]);

  return (
    <button
      disabled={disabled || isPending}
      aria-live='polite'
      className='inline-flex min-w-36 items-center justify-center gap-2 rounded-lg bg-cyan-700 px-3 py-2 text-xs font-bold text-white hover:bg-cyan-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500'
    >
      {isPending ? <LoaderCircle className='h-4 w-4 animate-spin' /> : null}
      {isPending
        ? messages[stage]
        : disabled
          ? 'Different project domain'
          : linked
            ? 'Refresh listing data'
            : 'Import and review'}
    </button>
  );
}

function ImportAssetsButton() {
  const { pending } = useFormStatus();
  const formState = useDistributionFormState();
  const isPending = formState?.submitting ?? pending;
  return (
    <button
      disabled={isPending}
      aria-live='polite'
      className='inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-2.5 text-xs font-bold text-cyan-800 hover:bg-cyan-100 disabled:cursor-wait disabled:opacity-70'
    >
      {isPending ? <LoaderCircle className='h-4 w-4 animate-spin' /> : null}
      {isPending ? 'Importing discovered assets...' : 'Import discovered assets'}
    </button>
  );
}

function statusToneClass(status: DistributionTaskStatus) {
  const { tone } = DISTRIBUTION_TASK_STATUS_META[status];
  if (tone === 'success') return 'bg-emerald-100 text-emerald-800';
  if (tone === 'warning') return 'bg-amber-100 text-amber-800';
  if (tone === 'danger') return 'bg-rose-100 text-rose-800';
  if (tone === 'info') return 'bg-cyan-100 text-cyan-800';
  return 'bg-slate-100 text-slate-700';
}

const DASHBOARD_PROGRESSING_TASK_STATUSES: readonly DistributionTaskStatus[] = [
  'in_progress',
  'needs_assets',
  'ready_to_submit',
  'submitted',
  'waiting_review',
  'follow_up',
  'planned',
];

const DASHBOARD_PREFERRED_STATUS_ORDER: readonly DistributionTaskStatus[] = [
  'in_progress',
  'needs_assets',
  'ready_to_submit',
  'submitted',
  'waiting_review',
  'follow_up',
  'planned',
  'blocked',
  'live',
  'done',
  'skipped',
];

const DASHBOARD_STATUS_PRIORITY = new Map(
  DASHBOARD_PREFERRED_STATUS_ORDER.map((status, index) => [status, index] as const),
);

const DASHBOARD_LIVE_TARGET_STATUS: DistributionTaskStatus = 'live';
const DASHBOARD_DONE_TARGET_STATUSES = new Set<DistributionTaskStatus>(['done', 'skipped']);
const DASHBOARD_RECHECKABLE_STATUS = new Set<DistributionTaskStatus>(['submitted', 'waiting_review', 'live', 'follow_up', 'done']);

const linkStatusToneClass = (linkStatus: string | null) => {
  if (linkStatus === 'live') return 'bg-emerald-50 text-emerald-700';
  if (linkStatus === 'nofollow') return 'bg-amber-50 text-amber-800';
  if (linkStatus === 'removed' || linkStatus === 'rejected') return 'bg-rose-50 text-rose-700';
  return 'bg-slate-100 text-slate-700';
};

const linkStatusLabel = (linkStatus: string | null) => {
  if (!linkStatus) return 'No live check';
  if (linkStatus === 'pending') return 'Pending review';
  if (linkStatus === 'live') return 'Live';
  if (linkStatus === 'nofollow') return 'Noindex / Nofollow';
  if (linkStatus === 'removed') return 'Removed';
  if (linkStatus === 'rejected') return 'Rejected';
  return linkStatus;
};

const opportunityStatusLabel = (status: string, isChinese: boolean) => {
  const labels: Record<string, [string, string]> = {
    accepted: ['Accepted', '已选择'],
    in_progress: ['Preparing', '准备中'],
    submitted: ['Submitted', '已提交，待审核'],
    live: ['Live', '已上线'],
    blocked: ['Blocked', '已阻塞'],
    rejected: ['Rejected', '未通过'],
    skipped: ['Skipped', '已跳过'],
  };
  return labels[status]?.[isChinese ? 1 : 0] || status.replaceAll('_', ' ');
};

const opportunityStatusToneClass = (status: string) => {
  if (status === 'live') return 'bg-emerald-50 text-emerald-700';
  if (status === 'submitted') return 'bg-amber-50 text-amber-800';
  if (status === 'blocked') return 'bg-rose-50 text-rose-700';
  if (status === 'rejected') return 'bg-rose-50 text-rose-700';
  if (status === 'skipped') return 'bg-slate-100 text-slate-700';
  return 'bg-cyan-50 text-cyan-800';
};

type DistributionDashboardTask = DistributionDashboardData['tasks'][number];
type DistributionDashboardTaskWithBucket = DistributionDashboardTask & { _dueBucket?: string };

type DistributionDashboardFilters = {
  search?: string;
  status?: string;
  targetId?: string;
  focusTask?: string;
  focusTarget?: string;
  fee?: string;
  dateFrom?: string;
  dateTo?: string;
  view?: string;
};

const FILTER_VIEW_BLOCKED = 'blocked';

const feeFilterLabels = {
  all: 'All',
  free: 'Free',
  paid: 'Paid',
  unknown: 'Unpriced',
} as const;

function getTaskPresentationState(task: DistributionDashboardTask) {
  return deriveDistributionPresentationState({
    status: task.status,
    liveUrl: task.liveUrl,
    linkStatus: task.linkStatus,
    packageStatus: task.packageStatus,
    blockedReason: task.blockedReason,
    dueDate: task.dueDate,
  });
}

function getFeeLabel(value: string | null | undefined) {
  if (value === 'free' || value === 'paid' || value === 'unknown' || value === 'all') return feeFilterLabels[value];
  return feeFilterLabels.all;
}

function normalizeFilterValue(value: unknown) {
  if (typeof value !== 'string') return '';
  return value.trim();
}

function isDateLike(value: string | undefined): value is string {
  return /^\d{4}-\d{2}-\d{2}$/.test(value || '');
}

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function buildWeekSlots(baseDate = new Date()) {
  const start = new Date(baseDate);
  start.setHours(0, 0, 0, 0);
  const day = start.getDay();
  const offsetToMonday = (day + 6) % 7;
  start.setDate(start.getDate() - offsetToMonday);
  const slots: { date: Date; dateKey: string; label: string; weekday: string }[] = [];
  for (let i = 0; i < 7; i += 1) {
    const current = new Date(start);
    current.setDate(start.getDate() + i);
    slots.push({
      date: current,
      dateKey: formatDateKey(current),
      weekday: weekdayLabels[current.getDay()],
      label: `${current.getMonth() + 1}/${current.getDate()}`,
    });
  }
  return slots;
}

function toLocaleDateDisplay(dateKey: string) {
  const [y, m, d] = dateKey.split('-');
  return `${m}/${d}`;
}

function formatSimpleDateTime(dateValue: string | null) {
  if (!dateValue) return '';
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleString(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function DistributionDashboard({
  data,
  locale,
  filters: dashboardFilters = {},
}: {
  data: DistributionDashboardData;
  locale: string;
  filters?: DistributionDashboardFilters;
}) {
  const [showForm, setShowForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [selectedScheduleTaskIds, setSelectedScheduleTaskIds] = useState<Set<string>>(new Set());
  const [batchDueDate, setBatchDueDate] = useState(formatDateKey(new Date()));
  const [clearScheduleDate, setClearScheduleDate] = useState(false);
  const activeProjectId = data.project?.id || '';
  const activeProjectWebsiteUrl = data.project?.websiteUrl || null;
  const activeProjectSourceToolId = data.project?.sourceToolId || null;
  const isChinese = locale === 'cn' || locale.startsWith('zh');
  const profileComplete = Boolean(
    data.project?.factsConfirmedAt && data.project.websiteUrl && (data.project.description?.length || 0) >= 20,
  );
  const productType = data.project?.productType || 'other';
  const assetGuidance = getDistributionAssetGuidance(productType);
  const hasLogo = data.assets.some((asset) => ['logo', 'icon'].includes(asset.assetType));
  const globalQueue = data.globalQueue || [];
  const searchFilter = normalizeFilterValue(dashboardFilters.search).toLowerCase();
  const statusFilter = normalizeFilterValue(dashboardFilters.status);
  const targetFilter = normalizeFilterValue(dashboardFilters.targetId);
  const focusedTaskFilter = normalizeFilterValue(dashboardFilters.focusTask);
  const focusedTargetFilter = normalizeFilterValue(dashboardFilters.focusTarget);
  const feeFilter = normalizeFilterValue(dashboardFilters.fee) as 'all' | 'free' | 'paid' | 'unknown' | '';
  const dateFromFilter = normalizeFilterValue(dashboardFilters.dateFrom);
  const dateToFilter = normalizeFilterValue(dashboardFilters.dateTo);
  const activeView = normalizeFilterValue(dashboardFilters.view);
  const hasAnyFilters =
    Boolean(searchFilter) ||
    Boolean(statusFilter) ||
    Boolean(targetFilter) ||
    feeFilter === 'free' ||
    feeFilter === 'paid' ||
    feeFilter === 'unknown' ||
    isDateLike(dateFromFilter) ||
    isDateLike(dateToFilter) ||
    activeView === FILTER_VIEW_BLOCKED;
  const allTasks = data.tasks;
  const filteredTasks = useMemo(() => {
    return allTasks.filter((task) => {
      if (statusFilter && task.status !== statusFilter) return false;
      if (targetFilter && task.targetId !== targetFilter) return false;
      if (searchFilter) {
        const searchSource = `${task.title} ${task.channelName} ${task.targetName || ''} ${task.taskType}`.toLowerCase();
        if (!searchSource.includes(searchFilter)) return false;
      }
      if (isDateLike(dateFromFilter) && (!task.dueDate || task.dueDate < dateFromFilter)) return false;
      if (isDateLike(dateToFilter) && (!task.dueDate || task.dueDate > dateToFilter)) return false;
      if (feeFilter === 'free') {
        if (task.estimatedCost === null || task.estimatedCost > 0) return false;
      }
      if (feeFilter === 'paid') {
        if (task.estimatedCost === null || task.estimatedCost <= 0) return false;
      }
      if (feeFilter === 'unknown' && task.estimatedCost !== null) return false;
      if (activeView === FILTER_VIEW_BLOCKED && task.status !== 'blocked') return false;
      return true;
    });
  }, [allTasks, statusFilter, targetFilter, searchFilter, dateFromFilter, dateToFilter, feeFilter, activeView]);
  const filteredTargetTasks = useMemo(() => filteredTasks.filter((task) => Boolean(task.targetId)), [filteredTasks]);
  const targetTaskByTargetId = useMemo(
    () => {
      const map = new Map<string, DistributionDashboardTask>();
      for (const task of filteredTargetTasks) {
        const targetId = String(task.targetId || '');
        if (!targetId) continue;
        const existing = map.get(targetId);
        if (!existing || !existing.updatedAt || (task.updatedAt && task.updatedAt > existing.updatedAt)) {
          map.set(targetId, task);
        }
      }
      return map;
    },
    [filteredTargetTasks],
  );
  const priorityAwareSort = (tasks: DistributionDashboardTask[]) =>
    [...tasks].sort((a, b) => {
      const aPriority = DASHBOARD_STATUS_PRIORITY.get(a.status) ?? 999;
      const bPriority = DASHBOARD_STATUS_PRIORITY.get(b.status) ?? 999;
      if (aPriority !== bPriority) return aPriority - bPriority;
      return a.title.localeCompare(b.title);
    });
  const router = useRouter();
  const buildTaskHref = (taskId: string, targetId?: string | null) => {
    if (typeof window === 'undefined') return `/${locale}/distribution/tasks/${taskId}`;
    const query = new URLSearchParams(window.location.search);
    query.set('focusTask', taskId);
    if (activeProjectId) {
      query.set('project', activeProjectId);
    }
    if (targetId) {
      query.set('focusTarget', targetId);
    } else {
      query.delete('focusTarget');
    }
    const nextSearch = query.toString();
    return `/${locale}/distribution/tasks/${taskId}${nextSearch ? `?${nextSearch}` : ''}`;
  };
  const openTaskWorkspace = (taskId: string, targetId?: string | null) => {
    const nextSearch = new URLSearchParams();
    if (activeProjectId) {
      nextSearch.set('project', activeProjectId);
    }
    nextSearch.set('focusTask', taskId);
    if (targetId) nextSearch.set('focusTarget', targetId);
    router.push(`/${locale}/distribution/tasks/${taskId}?${nextSearch.toString()}`);
  };
  const focusedTaskId =
    focusedTaskFilter ||
    (typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('focusTask'));
  const focusedTargetId =
    focusedTargetFilter ||
    (typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('focusTarget'));
  const focusTargetContext = focusedTargetId || targetFilter;
  const workspaceUrl = (nextSearch: URLSearchParams) =>
    `/${locale}/distribution${nextSearch.toString() ? `?${nextSearch.toString()}` : ''}`;
  const filteredInProgressTasks = useMemo(
    () =>
      filteredTasks.filter(
        (task) =>
          task.targetId &&
          !DASHBOARD_DONE_TARGET_STATUSES.has(task.status) &&
          task.status !== DASHBOARD_LIVE_TARGET_STATUS &&
          task.status !== 'blocked',
      ),
    [filteredTasks],
  );
  const filteredActiveTasks = useMemo(() => {
    return filteredInProgressTasks.filter((task) => DASHBOARD_PROGRESSING_TASK_STATUSES.includes(task.status));
  }, [filteredInProgressTasks]);
  const filteredBlockedTasks = useMemo(() => filteredTasks.filter((task) => task.status === 'blocked'), [filteredTasks]);
  const filteredLiveTasks = useMemo(() => filteredTasks.filter((task) => task.status === DASHBOARD_LIVE_TARGET_STATUS), [filteredTasks]);
  const filteredCompletedTasks = useMemo(
    () => filteredTasks.filter((task) => DASHBOARD_DONE_TARGET_STATUSES.has(task.status)),
    [filteredTasks],
  );
  const upcomingWeekSlots = useMemo(() => buildWeekSlots(), []);
  const upcomingWeekMap = useMemo(() => {
    const map = new Map<string, DistributionDashboardTask[]>();
    for (const slot of upcomingWeekSlots) {
      map.set(slot.dateKey, []);
    }
    filteredTasks.forEach((task) => {
      if (!task.dueDate || DASHBOARD_DONE_TARGET_STATUSES.has(task.status)) return;
      const bucket = map.get(task.dueDate);
      if (bucket) bucket.push(task);
    });
    for (const slot of upcomingWeekSlots) {
      const tasks = map.get(slot.dateKey);
      if (!tasks) continue;
      tasks.sort((a, b) => a.priority.localeCompare(b.priority));
    }
    return map;
  }, [filteredTasks, upcomingWeekSlots]);
  const blockedInboxTasks = useMemo(() => filteredTasks.filter((task) => task.status === 'blocked'), [filteredTasks]);
  const upcomingWeekSnapshot = useMemo(() => {
    const tasks: DistributionDashboardTaskWithBucket[] = [];
    for (const slot of upcomingWeekSlots) {
      const bucket = upcomingWeekMap.get(slot.dateKey) || [];
      if (bucket.length === 0) continue;
      tasks.push(
        ...bucket
          .filter((task) => !DASHBOARD_DONE_TARGET_STATUSES.has(task.status))
          .slice(0, 3)
          .map((task) => ({ ...task, _dueBucket: slot.dateKey } as DistributionDashboardTaskWithBucket)),
      );
    }
    return tasks.slice(0, 8);
  }, [upcomingWeekSlots, upcomingWeekMap]);
  const schedulingCandidates = useMemo(
    () =>
      priorityAwareSort(
        filteredTasks.filter(
          (task) =>
            task.targetId &&
            !DASHBOARD_DONE_TARGET_STATUSES.has(task.status) &&
            task.status !== DASHBOARD_LIVE_TARGET_STATUS &&
            task.status !== 'blocked',
        ),
      ),
    [filteredTasks, DASHBOARD_DONE_TARGET_STATUSES],
  );
  const targetTask = useMemo(() => {
    const byFocus = focusedTaskId ? filteredTargetTasks.find((task) => task.id === focusedTaskId) : null;
    if (byFocus) return byFocus;

    const targetScopedTasks = focusTargetContext
      ? filteredTargetTasks.filter((task) => task.targetId === focusTargetContext)
      : filteredTargetTasks;
    const targetScopedActive = priorityAwareSort(targetScopedTasks.filter((task) => !DASHBOARD_DONE_TARGET_STATUSES.has(task.status)));
    if (targetScopedActive.length > 0) return targetScopedActive[0];
    if (targetScopedTasks.length > 0) return priorityAwareSort(targetScopedTasks)[0];

    const targetScopedFallback = targetFilter
      ? filteredTargetTasks.filter((task) => task.targetId === targetFilter)
      : filteredTargetTasks;
    const targetScopedFallbackActive = priorityAwareSort(
      targetScopedFallback.filter((task) => !DASHBOARD_DONE_TARGET_STATUSES.has(task.status)),
    );
    if (targetScopedFallbackActive.length > 0) return targetScopedFallbackActive[0];
    if (targetScopedTasks.length > 0) return targetScopedTasks[0];

    const activeOrdered = [...filteredInProgressTasks, ...filteredBlockedTasks, ...filteredLiveTasks];
    if (activeOrdered.length > 0) return activeOrdered[0];
    return null;
  }, [
    filteredTargetTasks,
    filteredInProgressTasks,
    filteredBlockedTasks,
    filteredLiveTasks,
    focusedTaskId,
    focusTargetContext,
    targetFilter,
  ]);
  const allTaskCount = allTasks.length;
  const filteredTaskCount = filteredTasks.length;

  const targetOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const task of allTasks) {
      if (!task.targetId || !task.targetName) continue;
      map.set(task.targetId, task.targetName);
    }
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allTasks]);

  const taskGroups: Array<{ id: string; title: string; tasks: DistributionDashboardTask[] }> = [
    { id: 'active', title: isChinese ? '进行中' : 'In progress', tasks: filteredActiveTasks },
    { id: 'blocked', title: isChinese ? '阻塞' : 'Blocked', tasks: filteredBlockedTasks },
    { id: 'live', title: isChinese ? '已上线监控中' : 'Live (monitoring)', tasks: filteredLiveTasks },
    { id: 'done', title: isChinese ? '已完成/已跳过' : 'Completed or skipped', tasks: filteredCompletedTasks },
  ];

  const packageGenerated = Boolean(targetTask?.packageStatus);
  const targetTaskName = targetTask?.targetName || (isChinese ? '当前目标站' : 'the current target site');
  const targetTaskPresentationState = targetTask ? getTaskPresentationState(targetTask) : null;
  const targetTaskBlocked = Boolean(targetTaskPresentationState?.blocked);
  const submitted = Boolean(
    targetTask && ['submitted', 'waiting_review', 'live', 'follow_up', 'done'].includes(targetTask.status),
  );
  const notifications = data.notifications || [];
  const actionableNotifications = notifications.slice(0, 6);
  const completionRate = data.metrics.total > 0 ? Math.round((data.metrics.live / data.metrics.total) * 100) : 0;
  const profileMissingItems = [
    !data.project?.name ? (isChinese ? '产品名称' : 'product name') : null,
    !data.project?.websiteUrl ? (isChinese ? '官网地址' : 'website URL') : null,
    (data.project?.description?.length || 0) < 20
      ? isChinese
        ? '具体产品描述'
        : 'specific product description'
      : null,
    !data.project?.factsConfirmedAt
      ? isChinese
        ? '勾选“资料已核对并确认”'
        : 'check “Facts reviewed and confirmed”'
      : null,
  ].filter(Boolean) as string[];
  const onboardingSteps = [
    {
      number: 1,
      title: isChinese ? '确认产品资料' : 'Confirm product facts',
      description: isChinese
        ? '核对名称、官网、描述、目标、预算，然后确认资料真实。'
        : 'Review the name, website, description, goal, and budget, then confirm the facts.',
      complete: profileComplete,
      href: '#distribution-profile',
      action: isChinese ? '现在核对并确认' : 'Review and confirm now',
    },
    {
      number: 2,
      title: isChinese ? '准备通用素材' : 'Add reusable assets',
      description: isChinese
        ? '准备官方 Logo 和产品截图，后续重复使用。'
        : 'Prepare an official logo and product screenshot for reuse.',
      complete: hasLogo,
      href: '#distribution-assets',
      action: isChinese ? '准备素材' : 'Prepare assets',
    },
    {
      number: 3,
      title: isChinese ? '选择目标网站' : 'Choose one target site',
      description: isChinese
        ? `查看 ${targetTaskName} 的匹配度、费用、账号要求和提交规则。`
        : 'Review fit, cost, account requirements, and submission rules.',
      complete: Boolean(targetTask),
      href: '#distribution-targets',
      action: isChinese ? '查看推荐网站' : 'Review target sites',
    },
    {
      number: 4,
      title: isChinese ? '生成专属材料包' : 'Generate the target package',
      description: isChinese
        ? `根据 ${targetTaskName} 的规则生成文案、字段、素材和追踪链接。`
        : 'Generate copy, fields, assets, and a tracked link for the target.',
      complete: packageGenerated,
      href: targetTask ? buildTaskHref(targetTask.id, targetTask.targetId) : '#distribution-targets',
      action: isChinese ? '打开目标任务' : 'Open target task',
    },
    {
      number: 5,
      title: targetTaskBlocked
        ? isChinese
          ? '处理目标站阻塞原因'
          : 'Resolve the target blocker'
        : isChinese
          ? '人工提交并记录结果'
          : 'Submit manually and record evidence',
      description: isChinese
        ? targetTaskBlocked
          ? `${targetTaskName} 当前无法继续提交。请打开任务查看付款、账号或其他阻塞原因，再决定继续或跳过。`
          : `到 ${targetTaskName} 完成提交，再记录审核状态或上线地址。`
        : targetTaskBlocked
          ? `${targetTaskName} cannot proceed yet. Review the payment, account, or other blocker, then continue or skip it.`
          : 'Submit on the target site, then record its review state or live URL.',
      complete: submitted,
      href: targetTask ? buildTaskHref(targetTask.id, targetTask.targetId) : '#distribution-targets',
      action: targetTaskBlocked
        ? isChinese
          ? '查看阻塞原因'
          : 'View blocker'
        : isChinese
          ? '提交并记录结果'
          : 'Submit and record result',
    },
  ];

  const notificationToneClass = (type: (typeof data.notifications)[number]['type']) => {
    if (type === 'overdue' || type === 'link_issue') return 'bg-rose-50 text-rose-700';
    if (type === 'missing_assets') return 'bg-amber-50 text-amber-700';
    if (type === 'followup_reminder') return 'bg-violet-50 text-violet-700';
    return 'bg-cyan-50 text-cyan-700';
  };

  const canRecheckResult = (task: DistributionDashboardTask) =>
    DASHBOARD_RECHECKABLE_STATUS.has(task.status) && Boolean(task.liveUrl || task.linkStatus);

  const nextWeekSuggestion = useMemo(() => {
    if (blockedInboxTasks.length > 0) {
      return isChinese
        ? '优先处理阻塞项：先补齐素材、更新可提交渠道，再继续推进后续任务。'
        : 'Prioritize blocked items first: complete missing assets/requirements, then continue with the queued tasks.';
    }
    if (upcomingWeekSnapshot.length > 0) {
      return isChinese
        ? '先执行本周到期的待提交或审核任务，完成后再补充新的推荐目标以保持节奏。'
        : 'Execute this week’s due-to-submit and waiting-review tasks first, then add new recommended targets to keep momentum.';
    }
    return isChinese
      ? '补全产品资料与目标站规则后，继续生成更多任务并保持 1–3 项日排期。'
      : 'After completing profile and target prep, add more recommendations and keep your weekly queue to 1–3 high priority tasks.';
  }, [blockedInboxTasks.length, upcomingWeekSnapshot.length, isChinese]);

  const renderTaskCard = (task: DistributionDashboardTask) => (
    (() => {
      const presentation = getTaskPresentationState(task);
      return (
    <article key={task.id} className='rounded-2xl border border-slate-200 p-4 transition hover:border-cyan-300 hover:shadow-sm'>
      <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
        <div className='min-w-0'>
          <div className='flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide'>
            <span className='rounded-full bg-slate-100 px-2.5 py-1 text-slate-600'>{task.channelName}</span>
            <span
              className={`rounded-full px-2.5 py-1 ${task.priority === 'p0' ? 'bg-rose-50 text-rose-700' : 'bg-cyan-50 text-cyan-700'}`}
            >
              {task.priority}
            </span>
            <span className={`rounded-full px-2.5 py-1 ${presentation.toneClass}`}>
              {presentation.label}
            </span>
            {presentation.blocked ? (
              <span className='rounded-full bg-slate-900 px-2.5 py-1 text-white'>
                {isChinese ? '阻塞态' : 'Blocked'}
              </span>
            ) : null}
          </div>
          <h3 className='mt-3 text-base font-bold text-slate-950'>{task.title}</h3>
          {task.instructions ? <p className='mt-1 text-sm leading-5 text-slate-600'>{task.instructions}</p> : null}
          <div className='mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500'>
            <span>Due: {task.dueDate || 'not scheduled'}</span>
            {task.liveUrl ? (
              <a
                href={task.liveUrl}
                target='_blank'
                rel='noreferrer'
                className='inline-flex items-center gap-1 font-semibold text-cyan-700 hover:underline'
              >
                <ExternalLink className='h-3 w-3' /> Live result
              </a>
            ) : null}
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${linkStatusToneClass(task.linkStatus)}`}>
              <Link2 className='h-3 w-3' /> {linkStatusLabel(task.linkStatus)}
            </span>
            <Link
              href={buildTaskHref(task.id, task.targetId)}
              className='inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-cyan-700 hover:underline'
            >
              Open task
              <ArrowUpRight className='h-3 w-3' />
            </Link>
          </div>
        </div>
        <div className='flex flex-wrap gap-2 lg:justify-end'>
          <DistributionActionForm
            action={updateDistributionTaskStatus}
            className='flex items-center'
            successMessage='Task status updated. Refreshing the queue…'
          >
            <input type='hidden' name='taskId' value={task.id} />
            <select
              name='status'
              defaultValue={task.status}
              className='rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700'
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <DistributionSubmitButton
              pendingLabel='Updating…'
              className='ml-2 inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 disabled:cursor-wait disabled:opacity-70'
            >
              Update
            </DistributionSubmitButton>
            </DistributionActionForm>
          {canRecheckResult(task) ? (
            <details className='rounded-lg border border-slate-200 px-2.5 py-2 text-xs'>
              <summary className='cursor-pointer font-bold text-slate-700'>Recheck live URL</summary>
              <DistributionActionForm
                action={recheckDistributionTaskResult}
                className='mt-3 w-64 space-y-2'
                successMessage='Live URL rechecked. Refreshing the queue…'
              >
                <input type='hidden' name='taskId' value={task.id} />
                <input
                  name='liveUrl'
                  type='url'
                  defaultValue={task.liveUrl || ''}
                  placeholder='https://...'
                  className='w-full rounded-lg border border-slate-200 px-2.5 py-2 outline-none focus:ring-2 focus:ring-cyan-400'
                />
                <DistributionSubmitButton
                  pendingLabel='Rechecking…'
                  className='inline-flex w-full items-center justify-center gap-1 rounded-lg bg-emerald-700 px-2.5 py-2 font-bold text-white hover:bg-emerald-800 disabled:cursor-wait disabled:bg-emerald-500'
                >
                  Run recheck
                </DistributionSubmitButton>
              </DistributionActionForm>
            </details>
          ) : null}
          <details className='rounded-lg border border-slate-200 px-2.5 py-2 text-xs'>
            <summary className='cursor-pointer font-bold text-slate-700'>Record result</summary>
            <DistributionActionForm
              action={recordDistributionResult}
              className='mt-3 w-64 space-y-2'
              successMessage='Result recorded. Refreshing the queue…'
            >
              <input type='hidden' name='taskId' value={task.id} />
                <input
                  name='liveUrl'
                  type='url'
                  defaultValue={task.liveUrl || ''}
                  placeholder='https://...'
                  className='w-full rounded-lg border border-slate-200 px-2.5 py-2 outline-none focus:ring-2 focus:ring-cyan-400'
                />
              <select name='linkStatus' defaultValue='pending' className='w-full rounded-lg border border-slate-200 px-2.5 py-2'>
                <option value='pending'>Pending review</option>
                <option value='live'>Live</option>
                <option value='nofollow'>Nofollow</option>
                <option value='rejected'>Rejected</option>
                <option value='removed'>Removed</option>
              </select>
              <input
                name='notes'
                placeholder='Evidence or next follow-up'
                className='w-full rounded-lg border border-slate-200 px-2.5 py-2 outline-none focus:ring-2 focus:ring-cyan-400'
              />
              <DistributionSubmitButton
                pendingLabel='Saving…'
                className='inline-flex w-full items-center justify-center gap-1 rounded-lg bg-cyan-700 px-2.5 py-2 font-bold text-white hover:bg-cyan-800 disabled:cursor-wait disabled:bg-cyan-500'
              >
                Save result
              </DistributionSubmitButton>
            </DistributionActionForm>
          </details>
        </div>
      </div>
    </article>
      );
    })()
  );
  const nextStep = onboardingSteps.find((step) => !step.complete) || null;
  const completedStepCount = onboardingSteps.filter((step) => step.complete).length;
  const listingAssetCount = data.assets.filter(
    (asset) => asset.source === 'aibesttool_listing' && asset.sourceToolId === activeProjectSourceToolId,
  ).length;
  const reviewReport = data.reviewReport;
  const onFilterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (typeof window === 'undefined') return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const params = new URLSearchParams(window.location.search);
    const nextProject = String(params.get('project') || activeProjectId);

    const search = String(formData.get('search') || '').trim();
    const status = String(formData.get('status') || '').trim();
    const target = String(formData.get('target') || '').trim();
    const fee = String(formData.get('fee') || '').trim();
    const dateFrom = String(formData.get('dateFrom') || '').trim();
    const dateTo = String(formData.get('dateTo') || '').trim();
    const view = String(formData.get('view') || '').trim();

    if (search) params.set('search', search);
    else params.delete('search');

    if (status && status !== 'all') params.set('status', status);
    else params.delete('status');

    if (target) params.set('target', target);
    else params.delete('target');

    if (fee && fee !== 'all') params.set('fee', fee);
    else params.delete('fee');

    if (dateFrom && isDateLike(dateFrom)) params.set('dateFrom', dateFrom);
    else params.delete('dateFrom');

    if (dateTo && isDateLike(dateTo)) params.set('dateTo', dateTo);
    else params.delete('dateTo');

    if (view && view !== 'all') params.set('view', view);
    else params.delete('view');

    if (focusedTaskFilter) params.set('focusTask', focusedTaskFilter);
    if (focusedTargetFilter) params.set('focusTarget', focusedTargetFilter);

    if (nextProject) params.set('project', nextProject);
    router.push(workspaceUrl(params));
  };

  useEffect(() => {
    setSelectedScheduleTaskIds((current) => {
      const activeTaskIds = new Set(schedulingCandidates.map((task) => task.id));
      const next = new Set<string>();
      Array.from(current).forEach((taskId) => {
        if (activeTaskIds.has(taskId)) next.add(taskId);
      });
      return next;
    });
  }, [schedulingCandidates]);

  const handleScheduleTaskToggle = (taskId: string) => {
    setSelectedScheduleTaskIds((current) => {
      const next = new Set(current);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  };

  const handleSelectAllScheduleTasks = () => {
    setSelectedScheduleTaskIds((current) => {
      if (current.size === schedulingCandidates.length) return new Set<string>();
      return new Set(schedulingCandidates.map((task) => task.id));
    });
  };

  const scheduledPayload = JSON.stringify(Array.from(selectedScheduleTaskIds));

  return (
    <div className='flex flex-col gap-6'>
      <section className='order-1 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between'>
        <label className='block min-w-0 flex-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-500'>
          Product being distributed
          <select
            value={data.project?.id || ''}
            onChange={(event) => {
              const params = new URLSearchParams(window.location.search);
              params.set('project', event.target.value);
              router.push(workspaceUrl(params));
            }}
            className='mt-2 block w-full max-w-xl rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold normal-case tracking-normal text-slate-800 outline-none ring-cyan-400 focus:ring-2'
          >
            {data.projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
                {project.websiteUrl ? ` · ${project.websiteUrl}` : ''}
              </option>
            ))}
          </select>
        </label>
        <button
          type='button'
          onClick={() => setShowProjectForm((visible) => !visible)}
          className='rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-cyan-300 hover:text-cyan-700'
        >
          + New project
        </button>
      </section>

      <section className='order-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
        <div className='flex flex-wrap items-end justify-between gap-3'>
          <div>
            <div className='text-xs font-bold uppercase tracking-[0.16em] text-cyan-700'>Task filter</div>
            <div className='mt-1 text-sm font-bold text-slate-950'>
              {isChinese ? '任务队列筛选' : 'Filter distribution tasks'}
            </div>
            <p className='mt-1 text-xs text-slate-500'>
              {isChinese ? '可先筛选阻塞项、按渠道或预算查看，减少干扰。' : 'Filter blocked tasks, channels, and budget status before taking action.'}
            </p>
          </div>
          <div className='text-xs text-slate-500'>{allTaskCount === 0 ? 0 : filteredTaskCount} / {allTaskCount} tasks</div>
        </div>
        <form onSubmit={onFilterSubmit} className='mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'>
          <label className='text-xs font-semibold text-slate-700'>
            {isChinese ? '搜索' : 'Search'}
            <input
              type='text'
              name='search'
              defaultValue={searchFilter}
              placeholder={isChinese ? '标题/站点/渠道' : 'title/channel/target'}
              className='mt-1 block w-full rounded-xl border border-slate-200 px-2.5 py-2 text-sm'
            />
          </label>
          <label className='text-xs font-semibold text-slate-700'>
            {isChinese ? '状态' : 'Status'}
            <select name='status' defaultValue={statusFilter || 'all'} className='mt-1 block w-full rounded-xl border border-slate-200 px-2.5 py-2 text-sm'>
              <option value='all'>{isChinese ? '全部' : 'All'}</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className='text-xs font-semibold text-slate-700'>
            {isChinese ? '目标站' : 'Target'}
            <select name='target' defaultValue={targetFilter} className='mt-1 block w-full rounded-xl border border-slate-200 px-2.5 py-2 text-sm'>
              <option value=''>{isChinese ? '全部目标' : 'All targets'}</option>
              {targetOptions.map((target) => (
                <option key={target.id} value={target.id}>
                  {target.name}
                </option>
              ))}
            </select>
          </label>
          <label className='text-xs font-semibold text-slate-700'>
            {isChinese ? '费用' : 'Fee'}
            <select name='fee' defaultValue={feeFilter || 'all'} className='mt-1 block w-full rounded-xl border border-slate-200 px-2.5 py-2 text-sm'>
              <option value='all'>{getFeeLabel('all')}</option>
              <option value='free'>{getFeeLabel('free')}</option>
              <option value='paid'>{getFeeLabel('paid')}</option>
              <option value='unknown'>{getFeeLabel('unknown')}</option>
            </select>
          </label>
          <label className='text-xs font-semibold text-slate-700'>
            {isChinese ? '开始日期' : 'From'}
            <input
              type='date'
              name='dateFrom'
              defaultValue={dateFromFilter}
              className='mt-1 block w-full rounded-xl border border-slate-200 px-2.5 py-2 text-sm'
            />
          </label>
          <label className='text-xs font-semibold text-slate-700'>
            {isChinese ? '结束日期' : 'To'}
            <input
              type='date'
              name='dateTo'
              defaultValue={dateToFilter}
              className='mt-1 block w-full rounded-xl border border-slate-200 px-2.5 py-2 text-sm'
            />
          </label>
          <label className='text-xs font-semibold text-slate-700 sm:col-span-2 lg:col-span-3'>
            {isChinese ? '视图' : 'View'}
            <select name='view' defaultValue={activeView || 'all'} className='mt-1 block w-full rounded-xl border border-slate-200 px-2.5 py-2 text-sm'>
              <option value='all'>{isChinese ? '全部' : 'All'}</option>
              <option value='blocked'>{isChinese ? '仅阻塞收件箱' : 'Blocked inbox only'}</option>
            </select>
          </label>
          <div className='sm:col-span-2 lg:col-span-3 flex flex-wrap gap-2'>
            <button
              type='submit'
              className='inline-flex items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white disabled:cursor-wait disabled:opacity-70'
            >
              {isChinese ? '应用筛选' : 'Apply filters'}
            </button>
            <button
              type='button'
              onClick={() => {
                const params = new URLSearchParams(window.location.search);
                params.delete('search');
                params.delete('status');
                params.delete('target');
                params.delete('fee');
                params.delete('dateFrom');
                params.delete('dateTo');
                params.delete('view');
                const project = params.get('project') || activeProjectId;
                if (project) params.set('project', project);
                router.push(workspaceUrl(params));
              }}
              className='inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:border-cyan-300 hover:text-cyan-700'
            >
              {isChinese ? '清除筛选' : 'Clear filters'}
            </button>
            {hasAnyFilters ? (
              <span className='inline-flex items-center rounded-full bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-800'>
                {isChinese ? '筛选已生效' : 'Filters are active'}
              </span>
            ) : null}
          </div>
        </form>
      </section>

      <section className='order-3 rounded-2xl border border-amber-200 bg-white p-5 shadow-sm'>
        <div className='flex items-center justify-between gap-3'>
          <div>
            <div className='flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-amber-700'>
              <Bell className='h-4 w-4' />
              {isChinese ? '站内通知' : 'Inbox notifications'}
            </div>
            <h2 className='mt-1 text-lg font-bold text-slate-950'>{isChinese ? '今天要做什么' : 'What to do today'}</h2>
            <p className='mt-1 text-sm text-slate-600'>
              {isChinese
                ? '提醒会基于任务截止、素材缺失、到期复查、结果异常和人工回访节点自动生成。'
                : 'Alerts are generated from deadlines, missing assets, follow-up reminders, and link anomalies.'}
            </p>
          </div>
          <span className='rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600'>
            {actionableNotifications.length} {isChinese ? '条提醒' : 'alerts'}
          </span>
        </div>
        {actionableNotifications.length > 0 ? (
          <div className='mt-4 grid gap-2'>
            {actionableNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-xl border px-4 py-3 text-sm ${notificationToneClass(notification.type)} ${notification.urgent ? 'border-rose-200' : 'border-transparent'}`}
              >
                <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
                  <div>
                    <div className='text-xs font-bold uppercase tracking-[0.16em]'>
                      {notification.title}
                    </div>
                    <div className='mt-1 text-xs text-slate-700'>{notification.message}</div>
                  </div>
                  {notification.ctaLabel && notification.href ? (
                    <Link
                      href={notification.href}
                      className='inline-flex items-center gap-1 self-start rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800'
                    >
                      {notification.ctaLabel} <ArrowRight className='h-3 w-3' />
                    </Link>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500'>
            {isChinese ? '暂无待处理提醒，继续执行当前排期即可。' : 'No pending alerts. Follow your scheduled plan.'}
          </div>
        )}
      </section>

      <section className='order-4 overflow-hidden rounded-3xl border border-cyan-200 bg-white shadow-sm'>
        <div className='bg-gradient-to-r from-cyan-50 via-white to-amber-50 p-6 sm:p-8'>
          <div className='flex flex-col justify-between gap-5 lg:flex-row lg:items-start'>
            <div>
              <div className='text-xs font-bold uppercase tracking-[0.18em] text-cyan-700'>
                {isChinese ? '从这里开始' : 'Start here'}
              </div>
              <h1 className='mt-2 text-2xl font-bold tracking-tight text-slate-950'>
                {isChinese
                  ? `分 5 步完成 ${data.project?.name || '这个产品'} 的首次分发`
                  : `Launch ${data.project?.name || 'this product'} in five guided steps`}
              </h1>
              <p className='mt-2 max-w-2xl text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '平台负责准备资料、推荐目标、生成文案和追踪进度；你只需要核对事实，并在目标网站完成最终提交。'
                  : 'The workspace prepares the material, recommends targets, generates copy, and tracks progress. You verify the facts and complete the final submission.'}
              </p>
            </div>
            <div className='min-w-52 rounded-2xl border border-white bg-white/90 p-4 shadow-sm'>
              <div className='flex items-end justify-between gap-4'>
                <span className='text-sm font-bold text-slate-900'>
                  {isChinese ? '首次分发进度' : 'First-run progress'}
                </span>
                <span className='text-2xl font-bold text-cyan-700'>{completedStepCount}/5</span>
              </div>
              <div className='mt-3 h-2 overflow-hidden rounded-full bg-slate-100'>
                <div
                  className='h-full rounded-full bg-cyan-600 transition-all'
                  style={{ width: `${completedStepCount * 20}%` }}
                />
              </div>
            </div>
          </div>
          {nextStep ? (
            <div className='mt-6 grid gap-4 rounded-2xl border border-cyan-200 bg-white p-5 shadow-sm lg:grid-cols-[1fr_auto] lg:items-center'>
              <div>
                <div className='flex flex-wrap items-center gap-2'>
                  <span className='rounded-full bg-cyan-100 px-2.5 py-1 text-xs font-bold text-cyan-800'>
                    {isChinese ? `当前：第 ${nextStep.number} 步` : `Current: step ${nextStep.number}`}
                  </span>
                  {hasLogo && !profileComplete ? (
                    <span className='rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700'>
                      {isChinese ? 'Logo 和截图已准备' : 'Logo and screenshot ready'}
                    </span>
                  ) : null}
                </div>
                <h2 className='mt-3 text-xl font-bold text-slate-950'>{nextStep.title}</h2>
                {nextStep.number === 1 ? (
                  <div className='mt-2 text-sm leading-6 text-slate-600'>
                    {profileMissingItems.length === 1 && !data.project?.factsConfirmedAt
                      ? isChinese
                        ? 'Moxion 的名称、官网、描述和素材已经导入。现在只需核对这些内容，勾选“资料已核对并确认”，然后保存。'
                        : 'The product name, website, description, and assets are already imported. Review them, check “Facts reviewed and confirmed,” and save.'
                      : `${isChinese ? '还需要完成：' : 'Still needed: '}${profileMissingItems.join(isChinese ? '、' : ', ')}。`}
                  </div>
                ) : (
                  <p className='mt-2 text-sm leading-6 text-slate-600'>{nextStep.description}</p>
                )}
                <p className='mt-2 text-xs font-semibold text-slate-500'>
                  {isChinese
                    ? '完成后：系统会自动进入下一步，并只展示当时需要操作的模块。'
                    : 'After completion, the workspace advances and reveals only the controls needed for the next step.'}
                </p>
              </div>
              <a
                href={nextStep.href}
                className='inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800'
              >
                {nextStep.action} <ArrowRight className='h-4 w-4' />
              </a>
            </div>
          ) : null}
          <div className='mt-5 grid gap-2 sm:grid-cols-5'>
            {onboardingSteps.map((step) => (
              <a
                key={step.number}
                href={step.href}
                className={`rounded-xl border p-3 transition hover:border-cyan-300 ${
                  step.complete
                    ? 'border-emerald-200 bg-emerald-50/70'
                    : nextStep?.number === step.number
                      ? 'border-cyan-300 bg-white ring-2 ring-cyan-100'
                      : 'border-slate-200 bg-white/70'
                }`}
              >
                <div className='flex items-center justify-between gap-2'>
                  <span className='text-xs font-bold uppercase tracking-wide text-slate-500'>Step {step.number}</span>
                  {step.complete ? (
                    <CheckCircle2 className='h-5 w-5 text-emerald-600' />
                  ) : (
                    <Circle className='h-5 w-5 text-slate-300' />
                  )}
                </div>
                <div className='mt-2 text-xs font-bold leading-5 text-slate-950'>{step.title}</div>
              </a>
            ))}
          </div>
          {!nextStep ? (
            <div className='mt-5 rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-900'>
              {isChinese
                ? '首次分发流程已完成。接下来继续处理新的推荐目标和已排期的复查任务。'
                : 'First distribution cycle complete. Continue with the next recommended target and scheduled follow-ups.'}
            </div>
          ) : null}
          {targetTask ? (
            <div className='mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-cyan-100 bg-cyan-50/70 px-4 py-3 text-sm text-cyan-950'>
              <span className='font-bold'>{isChinese ? '当前目标站：' : 'Current target: '}</span>
              <span>{targetTaskName}</span>
              {targetTaskPresentationState ? (
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-bold ${targetTaskPresentationState.toneClass}`}
                >
                  {isChinese ? targetTaskPresentationState.label : targetTaskPresentationState.label}
                </span>
              ) : null}
              <span className={`rounded-full px-2.5 py-1 ${targetTaskPresentationState?.blocked ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}>
                {isChinese ? getDistributionTaskStatusLabel(targetTask.status) : getDistributionTaskStatusLabel(targetTask.status)}
              </span>
              <Link
                href={buildTaskHref(targetTask.id, targetTask.targetId)}
                className='ml-auto text-xs font-bold text-cyan-800 underline underline-offset-2'
              >
                {isChinese ? '打开这个任务' : 'Open this task'}
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      {profileComplete && targetTask ? (
        <section className='order-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
          <div className='mb-4 flex items-center justify-between gap-3'>
            <div>
              <div className='text-xs font-bold uppercase tracking-[0.16em] text-cyan-700'>Cross-product today queue</div>
              <h2 className='mt-1 text-lg font-bold text-slate-950'>Top 1–3 actions across all projects</h2>
            </div>
            <span className='text-xs text-slate-500'>Score is based on urgency, status and channel readiness.</span>
          </div>
          {globalQueue.length > 0 ? (
            <div className='space-y-3'>
              {globalQueue.map((item, index) => (
                <div
                  key={item.id}
                  className='rounded-xl border border-slate-200 bg-slate-50 p-4'
                >
                  <div className='flex flex-wrap items-center justify-between gap-3'>
                    <div>
                      <div className='flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500'>
                        <span>#{index + 1}</span>
                        <span className='rounded-full bg-white px-2 py-1 text-slate-700'>{item.projectName}</span>
                        <span className='rounded-full bg-white px-2 py-1'>{item.channelName}</span>
                        <span className='rounded-full bg-white px-2 py-1'>{item.priority}</span>
                        <span className='rounded-full bg-white px-2 py-1'>{item.readiness}</span>
                      </div>
                      <div className='mt-2 text-sm font-bold text-slate-950'>{item.title}</div>
                      {item.targetName ? (
                        <div className='mt-1 text-xs text-slate-600'>Target: {item.targetName}</div>
                      ) : null}
                      <p className='mt-2 text-xs leading-5 text-slate-600'>{item.reason}</p>
                      <div className='mt-2 text-xs text-slate-600'>
                        Prepare time: {typeof item.estimatedMinutes === 'number' ? `${item.estimatedMinutes} min` : 'TBD'} ·
                        Fee: {item.estimatedCost === null ? 'TBD' : `$${item.estimatedCost}`}
                      </div>
                    </div>
                    <Link
                      href={buildTaskHref(item.id, item.targetId)}
                      className='inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:border-cyan-300 hover:text-cyan-700'
                    >
                      Open task <ArrowUpRight className='h-3.5 w-3.5' />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-xs text-slate-500'>
              No active target tasks yet. Start with a product and choose targets to build the queue.
            </div>
          )}
        </section>
      ) : null}

      {profileComplete && targetTask ? (
        <section className='order-7 rounded-3xl bg-slate-950 p-6 text-white shadow-xl shadow-slate-200/60 sm:p-8'>
          <div className='flex flex-col justify-between gap-6 lg:flex-row lg:items-end'>
            <div className='max-w-2xl'>
              <div className='mb-4 flex items-center gap-2 text-sm font-semibold text-cyan-300'>
                <Radar className='h-4 w-4' /> Distribution control room
              </div>
              <h1 className='text-3xl font-bold tracking-tight sm:text-4xl'>Know where to promote today.</h1>
              <p className='mt-3 text-sm leading-6 text-slate-300 sm:text-base'>
                Plan human-led distribution across directories, communities, content, and launch channels. Record the
                evidence, next follow-up, and link quality in one place.
              </p>
              {data.project?.description ? (
                <p className='mt-3 max-w-2xl text-sm leading-6 text-cyan-100'>{data.project.description}</p>
              ) : null}
            </div>
            <button
              type='button'
              onClick={() => setShowForm((visible) => !visible)}
              className='inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200'
            >
              <Plus className='h-4 w-4' /> Add custom task
            </button>
          </div>
          <div className='mt-8 grid gap-3 sm:grid-cols-4'>
            {[
              ['Tasks tracked', data.metrics.total],
              ['Due today', data.metrics.dueToday],
              ['Ready to submit', data.metrics.readyToSubmit],
              ['Waiting review', data.metrics.waitingReview],
            ].map(([label, value]) => (
              <div key={String(label)} className='rounded-2xl border border-white/10 bg-white/5 p-4'>
                <div className='text-2xl font-bold'>{value}</div>
                <div className='mt-1 text-xs text-slate-400'>{label}</div>
              </div>
            ))}
            <div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
              <div className='text-2xl font-bold'>{data.metrics.live}</div>
              <div className='mt-1 text-xs text-slate-400'>Live mentions</div>
            </div>
            <div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
              <div className='text-2xl font-bold'>{data.metrics.blocked}</div>
              <div className='mt-1 text-xs text-slate-400'>Blocked tasks</div>
            </div>
          </div>
        </section>
      ) : null}

      {filteredTasks.length > 0 ? (
        <section className='order-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
          <div className='flex items-center justify-between gap-3'>
            <div>
              <div className='text-xs font-bold uppercase tracking-[0.16em] text-cyan-700'>7-day planning view</div>
              <h2 className='mt-1 text-lg font-bold text-slate-950'>本周/下周排期速览</h2>
            </div>
            <span className='text-xs text-slate-500'>只读周排期视图，不依赖外部日历</span>
          </div>
          <div className='mt-4 rounded-2xl border border-cyan-100 bg-cyan-50 p-4'>
            <div className='flex flex-wrap items-end justify-between gap-3'>
              <div>
                <h3 className='text-sm font-bold text-slate-900'>批量排期</h3>
                <p className='mt-1 text-xs text-slate-600'>选中要执行的任务，一次性改到同一天，不用跳转日历</p>
              </div>
              <div className='text-xs text-cyan-700'>已选 {selectedScheduleTaskIds.size} / {schedulingCandidates.length} 项</div>
            </div>
            <div className='mt-3 grid gap-3 sm:grid-cols-[auto_1fr_auto] sm:items-end'>
              <label className='text-xs font-semibold text-slate-700'>
                目标日期
                <input
                  type='date'
                  value={batchDueDate}
                  onChange={(event) => {
                    setBatchDueDate(event.target.value);
                    setClearScheduleDate(false);
                  }}
                  className='mt-1 block rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs'
                />
              </label>
              <div className='self-end text-xs text-slate-600'>
                <label className='inline-flex items-center gap-2'>
                  <input
                    type='checkbox'
                    onChange={(event) => {
                      setClearScheduleDate(event.target.checked);
                      if (!event.target.checked) setBatchDueDate(formatDateKey(new Date()));
                    }}
                  />
                  清空排期（设为无截止日）
                </label>
              </div>
              <DistributionActionForm
                action={rescheduleDistributionTasks}
                className='contents'
                successMessage='Tasks rescheduled. Refreshing workspace…'
              >
                <input type='hidden' name='taskIds' value={scheduledPayload} />
                {clearScheduleDate ? (
                  <input type='hidden' name='clearDate' value='1' />
                ) : (
                  <input type='hidden' name='dueDate' value={batchDueDate} />
                )}
                <DistributionSubmitButton
                  pendingLabel='Rescheduling…'
                  className='inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:cursor-wait disabled:opacity-70'
                  disabled={selectedScheduleTaskIds.size === 0 || (!batchDueDate && !clearScheduleDate)}
                >
                  执行批量排期
                </DistributionSubmitButton>
              </DistributionActionForm>
            </div>
            <div className='mt-3 flex flex-wrap gap-2'>
              <button
                type='button'
                onClick={handleSelectAllScheduleTasks}
                className='rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-bold text-cyan-700'
              >
                {selectedScheduleTaskIds.size === schedulingCandidates.length ? '取消全选' : '全选可执行任务'}
              </button>
            </div>
            <div className='mt-3 space-y-2 rounded-lg bg-white p-3'>
              {schedulingCandidates.length === 0 ? (
                <div className='text-xs text-slate-500'>暂无可调度任务。</div>
              ) : (
                schedulingCandidates.slice(0, 10).map((task) => (
                  <label
                    key={task.id}
                    className='flex items-center justify-between gap-2 text-xs text-slate-700 border-b border-slate-100 py-2 last:border-0'
                  >
                    <span className='inline-flex items-center gap-2'>
                      <input
                        type='checkbox'
                        checked={selectedScheduleTaskIds.has(task.id)}
                        onChange={() => handleScheduleTaskToggle(task.id)}
                      />
                      <span>{task.title}</span>
                    </span>
                    <span className='text-slate-500'>当前截止：{task.dueDate || '未排期'}</span>
                  </label>
                ))
              )}
            </div>
          </div>
          <div className='mt-4 grid gap-3 lg:grid-cols-7'>
            {upcomingWeekSlots.map((slot) => {
              const tasks = upcomingWeekMap.get(slot.dateKey) || [];
              return (
                <div key={slot.dateKey} className='rounded-xl border border-slate-200 bg-slate-50 p-3'>
                  <div className='text-xs font-bold text-slate-700'>
                    {slot.weekday} {slot.label}
                  </div>
                  <div className='text-[11px] text-slate-500'>{toLocaleDateDisplay(slot.dateKey)}</div>
                  {tasks.length === 0 ? (
                    <div className='mt-2 rounded-lg border border-dashed border-slate-300 p-2 text-xs text-slate-400'>
                      无计划任务
                    </div>
                  ) : (
                    <div className='mt-2 space-y-2'>
                      {tasks.map((task) => (
                        <div key={task.id} className='rounded-lg border border-white bg-white p-2 text-xs text-slate-700'>
                          <div className='flex cursor-pointer items-start justify-between gap-2'>
                            <span className='flex items-center gap-2'>
                              <input
                                type='checkbox'
                                checked={selectedScheduleTaskIds.has(task.id)}
                                onChange={(event) => {
                                  event.preventDefault();
                                  handleScheduleTaskToggle(task.id);
                                }}
                              />
                              <span className='font-semibold'>{task.title}</span>
                            </span>
                            <Link
                              href={buildTaskHref(task.id, task.targetId)}
                              className='inline-flex items-center rounded-md border border-cyan-100 bg-white px-2 py-1 text-[11px] text-slate-500 hover:text-cyan-700'
                            >
                              Open
                            </Link>
                          </div>
                            <span className='text-[11px] text-slate-500'>
                              {task.targetName || task.channelName}
                            </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <p className='mt-3 text-xs text-slate-500'>
            DC-022 目标：一眼看懂一周优先级任务，并支持批量重排到目标日期。
          </p>
        </section>
      ) : null}

      {data.tasks.length > 0 ? (
        <section className='order-8 grid gap-4 lg:grid-cols-3'>
          <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2'>
            <div className='flex items-center justify-between gap-3'>
              <div>
                <div className='text-xs font-bold uppercase tracking-[0.16em] text-cyan-700'>Today&apos;s queue</div>
                <h2 className='mt-1 text-xl font-bold text-slate-950'>Top priorities</h2>
              </div>
              <span className='text-xs text-slate-500'>Sorted by leverage and urgency</span>
            </div>
            <div className='mt-4 space-y-3'>
              {data.recommendations.length > 0 ? (
                data.recommendations.map((item, index) => (
                  <div key={item.id} className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
                    <div className='flex items-start justify-between gap-3'>
                      <div>
                        <div className='flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500'>
                          <span>#{index + 1}</span>
                          <span className='rounded-full bg-white px-2 py-1 text-slate-600'>{item.channelName}</span>
                          <span className='rounded-full bg-white px-2 py-1 text-slate-600'>
                            {item.priority || 'p1'}
                          </span>
                        </div>
                        <div className='mt-2 text-sm font-bold text-slate-950'>{item.title}</div>
                        <p className='mt-1 text-xs leading-5 text-slate-600'>{item.reason}</p>
                      </div>
                      <Link
                        href={buildTaskHref(item.id)}
                        className='inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-cyan-300 hover:text-cyan-700'
                      >
                        Open <ArrowUpRight className='h-3.5 w-3.5' />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className='rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500'>
                  No ranked tasks yet.
                </div>
              )}
            </div>
          </div>
          <div className='space-y-4'>
            <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
              <div className='text-xs font-bold uppercase tracking-[0.16em] text-cyan-700'>Preflight</div>
              <h2 className='mt-1 text-lg font-bold text-slate-950'>Copy readiness</h2>
              <p className='mt-2 text-sm text-slate-600'>{data.preflight.summary}</p>
              <div className='mt-3 space-y-2 text-xs text-slate-600'>
                <div>
                  Title: {data.preflight.titleLength}
                  {data.preflight.titleLimit ? ` / ${data.preflight.titleLimit}` : ''}
                </div>
                <div>
                  Description: {data.preflight.descriptionLength}
                  {data.preflight.descriptionLimit ? ` / ${data.preflight.descriptionLimit}` : ''}
                </div>
                <div>Required fields: {data.preflight.requiredFields.join(', ') || '—'}</div>
                <div>Missing fields: {data.preflight.missingFields.join(', ') || '—'}</div>
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
              <div className='text-xs font-bold uppercase tracking-[0.16em] text-cyan-700'>Tracked destination</div>
              <h2 className='mt-1 text-lg font-bold text-slate-950'>UTM suggestion</h2>
              <p className='mt-2 text-sm text-slate-600'>{data.destinationSuggestion.summary}</p>
              <div className='mt-3 space-y-2 text-xs text-slate-600'>
                <div className='break-all'>Destination: {data.destinationSuggestion.destinationUrl}</div>
                <div>Source: {data.destinationSuggestion.utmSource}</div>
                <div>Campaign: {data.destinationSuggestion.utmCampaign}</div>
                <div>Content: {data.destinationSuggestion.utmContent || '—'}</div>
              </div>
            </div>
            {reviewReport ? (
              <div className='rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm'>
                <div className='text-xs font-bold uppercase tracking-[0.16em] text-cyan-700'>Distribution review report</div>
                <h2 className='mt-1 text-lg font-bold text-slate-950'>Weekly checks for this workspace</h2>
                <div className='mt-3 grid gap-2 text-xs sm:grid-cols-2'>
                  <div>Live checks: {reviewReport.summary.liveCount}</div>
                  <div>Issue links: {reviewReport.summary.issueCount}</div>
                  <div>Blocked: {reviewReport.summary.blockedCount}</div>
                  <div>Checked total: {reviewReport.summary.checkedCount}</div>
                  <div>30d retention: {reviewReport.retention.retention30dRate}%</div>
                  <div>90d retention: {reviewReport.retention.retention90dRate}%</div>
                </div>
                {reviewReport.channelFeedback.length > 0 ? (
                  <div className='mt-3'>
                    <div className='text-xs font-bold uppercase tracking-[0.14em] text-slate-500'>Channel-level feedback</div>
                    <ul className='mt-2 space-y-1 text-xs text-slate-600'>
                      {reviewReport.channelFeedback.slice(0, 3).map((item) => (
                        <li key={`${item.channelType}-${item.channelName}`}>
                          {item.channelName}: live {item.liveCount} / issue {item.issueCount} / blocked {item.blockedCount}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {reviewReport.outcomeLearning.length > 0 ? (
                  <div className='mt-3'>
                    <div className='text-xs font-bold uppercase tracking-[0.14em] text-slate-500'>Top obstacles</div>
                    <ul className='mt-2 space-y-1 text-xs text-slate-600'>
                      {reviewReport.outcomeLearning.slice(0, 4).map((item) => (
                        <li key={item.label}>
                          {item.label}: {item.count}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
          <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
            <div className='text-xs font-bold uppercase tracking-[0.16em] text-cyan-700'>Distribution weekly snapshot</div>
            <h2 className='mt-1 text-lg font-bold text-slate-950'>Workspace digest</h2>
            <div className='mt-3 grid gap-2 sm:grid-cols-3 text-xs'>
              <div>Completion ratio: {completionRate}%</div>
              <div>Live links: {data.metrics.live}</div>
              <div>Blocked tasks: {data.metrics.blocked}</div>
              <div>Visits: {data.metrics.attribution.visits}</div>
              <div>Submissions: {data.metrics.attribution.submissions}</div>
              <div>Payments: {data.metrics.attribution.payments}</div>
            </div>
            <div className='mt-4 rounded-xl bg-cyan-50 p-3 text-sm text-slate-700'>
              <div className='font-bold text-slate-900'>Next 7-day action list</div>
              <div className='mt-1 text-xs'>{nextWeekSuggestion}</div>
              {upcomingWeekSnapshot.length > 0 ? (
                <ul className='mt-3 space-y-2 text-xs text-slate-600'>
                  {upcomingWeekSnapshot.slice(0, 5).map((task) => (
                    <li key={`week-${task.id}`}>
                      {task._dueBucket ? `${task._dueBucket} · ` : ''}
                      {task.title} · {task.channelName}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className='mt-3 rounded-xl border border-cyan-100 bg-white p-3 text-xs text-slate-600'>
                  No scheduled tasks for next 7 days. Seed targets and reschedule follow-ups to keep execution rhythm.
                </div>
              )}
            </div>
          </div>
        </section>
      ) : null}

      {profileComplete ? (
        <section
          id='distribution-targets'
          className='order-5 scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'
        >
          <div className='flex flex-col justify-between gap-2 sm:flex-row sm:items-end'>
            <div>
              <div className='text-xs font-bold uppercase tracking-[0.16em] text-cyan-700'>Concrete target sites</div>
              <h2 className='mt-1 text-xl font-bold text-slate-950'>Recommended next opportunities</h2>
              <p className='mt-1 text-sm text-slate-600'>
                Recommendations account for the project goal, budget preference, verified entry points, and manual
                obstacles.
              </p>
            </div>
            <span className='text-xs text-slate-500'>Accepting a target creates one target-bound task.</span>
          </div>
        {data.targetRegistryUnavailable ? (
          <div className='mt-5 rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm leading-6 text-rose-900'>
            <div className='font-bold'>
              {isChinese ? '目标网站服务暂时不可用' : 'The target-site registry is temporarily unavailable'}
            </div>
            <div className='mt-1'>
              {isChinese
                ? '你的产品资料和素材已经保存，不需要重复填写。请稍后刷新；管理员需要检查生产数据库连接。'
                : 'Your product facts and assets are saved. Refresh later while an administrator checks the production database connection.'}
            </div>
          </div>
        ) : data.targetRecommendations.length ? (
            <div className='mt-5 grid gap-4 lg:grid-cols-2 xl:grid-cols-3'>
              {data.targetRecommendations.map((target) => {
                const acceptedTask = targetTaskByTargetId.get(target.id);
                return (
                  <article key={target.id} className='rounded-2xl border border-slate-200 bg-slate-50 p-4'>
                    <div className='flex items-start justify-between gap-3'>
                      <div>
                        <div className='text-xs font-bold uppercase tracking-wide text-cyan-700'>
                          {target.channelName}
                        </div>
                        <h3 className='mt-1 text-lg font-bold text-slate-950'>{target.name}</h3>
                      </div>
                      <span className='rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-700'>
                        Score {target.score}
                      </span>
                    </div>
                    <div className='mt-3 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-600'>
                      <span className='rounded-full bg-white px-2 py-1'>{target.estimatedMinutes} min</span>
                      <span className='rounded-full bg-white px-2 py-1'>
                        {target.requiresPayment ? 'Paid' : 'No public payment requirement'}
                      </span>
                      {target.requiresAccount ? <span className='rounded-full bg-white px-2 py-1'>Account</span> : null}
                      {target.requiresCaptcha ? <span className='rounded-full bg-white px-2 py-1'>CAPTCHA</span> : null}
                      {target.editorialReview ? (
                        <span className='rounded-full bg-white px-2 py-1'>Editorial review</span>
                      ) : null}
                    </div>
                    <ul className='mt-3 space-y-1 text-xs leading-5 text-slate-600'>
                      {target.reasons.slice(0, 3).map((reason) => (
                        <li key={reason}>• {reason}</li>
                      ))}
                    </ul>
                    <div className='mt-4 flex flex-wrap items-center gap-2'>
                      <a
                        href={target.submissionUrl || target.homepageUrl}
                        target='_blank'
                        rel='noreferrer'
                        className='inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:border-cyan-300 hover:text-cyan-700'
                      >
                        Inspect site <ExternalLink className='h-3.5 w-3.5' />
                      </a>
                      {target.opportunityStatus ? (
                        <>
                          <span className={`rounded-lg px-3 py-2 text-xs font-bold ${opportunityStatusToneClass(target.opportunityStatus)}`}>
                            {opportunityStatusLabel(target.opportunityStatus, isChinese)}
                          </span>
                          {target.opportunityUpdatedAt ? (
                            <span className='inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-[11px] text-slate-500'>
                              <Clock3 className='h-3 w-3' />
                              {isChinese ? '状态更新时间' : 'Updated'}: {formatSimpleDateTime(target.opportunityUpdatedAt)}
                            </span>
                          ) : null}
                          {acceptedTask ? (
                    <Link
                      href={buildTaskHref(acceptedTask.id, acceptedTask.targetId)}
                              className='inline-flex items-center gap-1 rounded-lg bg-cyan-700 px-3 py-2 text-xs font-bold text-white hover:bg-cyan-800'
                            >
                              {target.opportunityStatus === 'live'
                                ? isChinese
                                  ? '查看上线结果'
                                  : 'View live result'
                                : target.opportunityStatus === 'blocked'
                                  ? isChinese
                                    ? '处理阻塞原因'
                                    : 'Resolve blocker'
                                : isChinese
                                  ? '继续任务'
                                  : 'Continue task'}{' '}
                              <ArrowRight className='h-3.5 w-3.5' />
                            </Link>
                          ) : null}
                        </>
                      ) : (
                        <DistributionActionForm
                          action={acceptDistributionTarget}
                          successMessage='Target accepted. Opening the target task…'
                          refresh={false}
                          onSuccess={(result) => {
                            if (result && typeof result === 'object' && 'success' in result && result.success && result.taskId) {
                              openTaskWorkspace(result.taskId, target.id);
                            }
                          }}
                        >
                          <input type='hidden' name='projectId' value={data.project?.id || ''} />
                          <input type='hidden' name='targetId' value={target.id} />
                          <input type='hidden' name='score' value={target.score} />
                          <input type='hidden' name='estimatedMinutes' value={target.estimatedMinutes} />
                          <DistributionSubmitButton
                            pendingLabel='Accepting target…'
                            className='inline-flex items-center gap-1 rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:cursor-wait disabled:opacity-70'
                          >
                            Choose this target
                          </DistributionSubmitButton>
                        </DistributionActionForm>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className='mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500'>
              No eligible target sites match the current project and budget settings.
            </div>
          )}
        </section>
      ) : null}

      {data.tasks.length > 0 ? (
        <section className='order-10 rounded-2xl border border-cyan-100 bg-cyan-50/60 p-5'>
          <div className='flex flex-col justify-between gap-2 sm:flex-row sm:items-end'>
            <div>
              <div className='text-xs font-bold uppercase tracking-[0.16em] text-cyan-700'>Last 30 days</div>
              <h2 className='mt-1 text-xl font-bold text-slate-950'>Attribution snapshot</h2>
              <p className='mt-1 text-sm text-slate-600'>
                See whether distribution activity produces visits, signups, claims, and paid workspaces.
              </p>
            </div>
            <span className='text-xs text-slate-500'>Tracked links only</span>
          </div>
          <div className='mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-6'>
            {[
              ['Visits', data.metrics.attribution.visits],
              ['Signups', data.metrics.attribution.signups],
              ['Submissions', data.metrics.attribution.submissions],
              ['Claims', data.metrics.attribution.claims],
              ['Checkouts', data.metrics.attribution.checkouts],
              ['Payments', data.metrics.attribution.payments],
            ].map(([label, value]) => (
              <div key={String(label)} className='rounded-xl border border-cyan-100 bg-white p-3'>
                <div className='text-xl font-bold text-slate-950'>{value}</div>
                <div className='mt-1 text-xs text-slate-500'>{label}</div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {showProjectForm ? (
        <DistributionActionForm
          action={createDistributionProject}
          className='order-2 rounded-2xl border border-cyan-200 bg-cyan-50/60 p-5'
          successMessage='Project created. Refreshing your workspace…'
        >
          <div className='grid gap-4 sm:grid-cols-2'>
            <label className='text-sm font-semibold text-slate-700'>
              Project name
              <input
                required
                name='name'
                placeholder='Client or product name'
                className='mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none focus:ring-2 focus:ring-cyan-400'
              />
            </label>
            <label className='text-sm font-semibold text-slate-700'>
              Website URL
              <input
                name='websiteUrl'
                type='url'
                placeholder='https://example.com'
                className='mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none focus:ring-2 focus:ring-cyan-400'
              />
            </label>
            <label className='text-sm font-semibold text-slate-700 sm:col-span-2'>
              Specific product description
              <textarea
                name='description'
                rows={3}
                placeholder='What it does, for whom, and the clearest verified difference.'
                className='mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none focus:ring-2 focus:ring-cyan-400'
              />
            </label>
            <label className='text-sm font-semibold text-slate-700'>
              Primary goal
              <select
                name='primaryGoal'
                defaultValue='directory_coverage'
                className='mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal'
              >
                <option value='directory_coverage'>Directory coverage</option>
                <option value='launch'>Product launch</option>
                <option value='referral_traffic'>Referral traffic</option>
                <option value='community_feedback'>Community feedback</option>
                <option value='editorial_mentions'>Editorial mentions</option>
              </select>
            </label>
            <label className='text-sm font-semibold text-slate-700'>
              Weekly task capacity
              <input
                name='weeklyCapacity'
                type='number'
                min='1'
                max='50'
                defaultValue='3'
                className='mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none focus:ring-2 focus:ring-cyan-400'
              />
            </label>
            <label className='text-sm font-semibold text-slate-700'>
              Budget preference
              <select
                name='budgetPreference'
                defaultValue='free_first'
                className='mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal'
              >
                <option value='free_only'>Free only</option>
                <option value='free_first'>Free first</option>
                <option value='paid_selective'>Selective paid placements</option>
              </select>
            </label>
          </div>
          <input type='hidden' name='locale' value={locale} />
          <DistributionSubmitButton
            pendingLabel='Creating project…'
            className='mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 disabled:cursor-wait disabled:opacity-70'
          >
            Create project
          </DistributionSubmitButton>
        </DistributionActionForm>
      ) : null}

      {data.project ? (
        <details
          id='distribution-profile'
          className='order-3 scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'
          open={!profileComplete}
        >
          <summary className='cursor-pointer text-sm font-bold text-slate-950'>
            {isChinese ? '第 1 步：核对并确认产品资料' : 'Step 1: review and confirm product facts'}{' '}
            <span className='ml-2 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600'>
              {data.project.onboardingStatus.replaceAll('_', ' ')}
            </span>
          </summary>
          <p className='mt-2 text-sm text-slate-600'>
            {isChinese
              ? '这些资料只需要确认一次，之后每个目标网站的专属材料包都会复用。'
              : 'Confirm these facts once so every target-specific package can reuse them.'}
          </p>
          {!profileComplete ? (
            <div className='mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950'>
              <div className='font-bold'>
                {isChinese ? '完成本步骤后才会推荐目标网站' : 'Target recommendations unlock after this step'}
              </div>
              <div className='mt-1'>
                {profileMissingItems.length === 1 && !data.project?.factsConfirmedAt
                  ? isChinese
                    ? '当前字段已填写，向下核对内容，然后勾选“资料已核对并确认”并保存。'
                    : 'The fields are filled. Review them, check “Facts reviewed and confirmed,” and save.'
                  : `${isChinese ? '待完成：' : 'Still needed: '}${profileMissingItems.join(isChinese ? '、' : ', ')}`}
              </div>
            </div>
          ) : null}
          {data.listingCandidates.length > 0 ? (
            <div className='mt-4 rounded-2xl border border-cyan-200 bg-cyan-50/60 p-4'>
              <div className='flex flex-col justify-between gap-2 sm:flex-row sm:items-start'>
                <div>
                  <div className='text-xs font-bold uppercase tracking-[0.16em] text-cyan-700'>
                    AI Best Tool connection
                  </div>
                  <h3 className='mt-1 text-base font-bold text-slate-950'>Reuse a linked AI Best Tool listing</h3>
                  <p className='mt-1 text-xs leading-5 text-slate-600'>
                    Import name, website, description, category, pricing context, logo, and screenshots. Imported facts
                    remain unconfirmed until you review and save this profile.
                  </p>
                </div>
                {data.project.sourceToolId ? (
                  <span className='rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700'>
                    Listing linked
                  </span>
                ) : null}
              </div>
              {data.project.sourceToolId ? (
                <div className='mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs leading-5 text-emerald-800'>
                  The linked {data.project.name} listing has populated the product fields below. {listingAssetCount}{' '}
                  reusable {listingAssetCount === 1 ? 'asset is' : 'assets are'} saved in the Product media and proof
                  assets section.
                </div>
              ) : null}
              <div className='mt-3 grid gap-3 lg:grid-cols-2'>
                {data.listingCandidates.map((listing) => (
                  <div key={listing.id} className='rounded-xl border border-cyan-100 bg-white p-3'>
                    <div className='flex items-start justify-between gap-3'>
                      <div>
                        <div className='text-sm font-bold text-slate-950'>{listing.name}</div>
                        <div className='mt-1 break-all text-xs text-slate-500'>{listing.websiteUrl}</div>
                      </div>
                      {listing.exactDomainMatch ? (
                        <span className='rounded-full bg-cyan-100 px-2 py-1 text-[10px] font-bold text-cyan-700'>
                          Domain match
                        </span>
                      ) : null}
                    </div>
                    <div className='mt-2 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500'>
                      <span>{listing.productType.replaceAll('_', ' ')}</span>
                      <span>{listing.ownershipSource.replaceAll('_', ' ')}</span>
                      {listing.categoryName ? <span>{listing.categoryName}</span> : null}
                    </div>
                    <p className='mt-2 line-clamp-2 text-xs leading-5 text-slate-600'>
                      {listing.description || 'No reusable listing description is available.'}
                    </p>
                    <DistributionActionForm
                      action={importDistributionCatalogListing}
                      className='mt-3'
                      successMessage='Listing imported. Refreshing the product profile…'
                    >
                      <input type='hidden' name='projectId' value={activeProjectId} />
                      <input type='hidden' name='toolId' value={listing.id} />
                      <ImportListingButton
                        disabled={Boolean(activeProjectWebsiteUrl) && !listing.exactDomainMatch}
                        linked={activeProjectSourceToolId === listing.id}
                      />
                    </DistributionActionForm>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className='mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-xs leading-5 text-slate-600'>
              No reusable AI Best Tool listing matches this project. Submitted listings are matched to their account;
              platform admins can also connect an exact-domain listing. You can continue manually.
            </div>
          )}
          <DistributionActionForm
            action={updateDistributionProjectProfile}
            className='mt-4 grid gap-4 sm:grid-cols-2'
            successMessage='Product facts saved. Refreshing the workspace…'
            feedbackClassName='sm:col-span-2'
          >
            <input type='hidden' name='projectId' value={data.project.id} />
            <label className='text-sm font-semibold text-slate-700'>
              Product name
              <input
                required
                name='name'
                defaultValue={data.project.name}
                className='mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:ring-2 focus:ring-cyan-400'
              />
            </label>
            <label className='text-sm font-semibold text-slate-700'>
              Website URL
              <input
                required
                name='websiteUrl'
                defaultValue={data.project.websiteUrl || ''}
                className='mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:ring-2 focus:ring-cyan-400'
              />
            </label>
            <label className='text-sm font-semibold text-slate-700 sm:col-span-2'>
              Verified description
              <textarea
                required
                minLength={20}
                name='description'
                rows={3}
                defaultValue={data.project.description || ''}
                className='mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:ring-2 focus:ring-cyan-400'
              />
              <span className='mt-2 block text-xs font-normal leading-5 text-slate-500'>
                Use: “For [audience], [product] helps [job] by [specific capability].” Avoid rankings, invented usage
                numbers, and unverified superlatives.
              </span>
            </label>
            <label className='text-sm font-semibold text-slate-700'>
              Product type
              <select
                name='productType'
                defaultValue={productType}
                className='mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal'
              >
                <option value='ai_saas'>AI SaaS</option>
                <option value='developer_api'>Developer tool or API</option>
                <option value='open_source'>Open-source product</option>
                <option value='mobile_app'>Mobile app</option>
                <option value='content_newsletter'>Content or newsletter</option>
                <option value='agency_service'>Agency or service</option>
                <option value='web3'>Web3 product</option>
                <option value='other'>Other</option>
              </select>
            </label>
            <label className='text-sm font-semibold text-slate-700'>
              Primary goal
              <select
                name='primaryGoal'
                defaultValue={data.project.primaryGoal || 'directory_coverage'}
                className='mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal'
              >
                <option value='directory_coverage'>Directory coverage</option>
                <option value='launch'>Product launch</option>
                <option value='referral_traffic'>Referral traffic</option>
                <option value='community_feedback'>Community feedback</option>
                <option value='editorial_mentions'>Editorial mentions</option>
              </select>
            </label>
            <label className='text-sm font-semibold text-slate-700'>
              Weekly capacity
              <input
                name='weeklyCapacity'
                type='number'
                min='1'
                max='50'
                defaultValue={data.project.weeklyCapacity || 3}
                className='mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:ring-2 focus:ring-cyan-400'
              />
            </label>
            <label className='text-sm font-semibold text-slate-700'>
              Budget preference
              <select
                name='budgetPreference'
                defaultValue={data.project.budgetPreference || 'free_first'}
                className='mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal'
              >
                <option value='free_only'>Free only</option>
                <option value='free_first'>Free first</option>
                <option value='paid_selective'>Selective paid placements</option>
              </select>
            </label>
            <label className='flex items-center gap-2 self-end rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700'>
              <input type='checkbox' name='factsConfirmed' defaultChecked={Boolean(data.project.factsConfirmedAt)} />{' '}
              {isChinese ? '我已核对以上资料，并确认其真实准确' : 'Facts reviewed and confirmed'}
            </label>
            <DistributionSubmitButton
              pendingLabel={isChinese ? '正在保存…' : 'Saving…'}
              className='inline-flex w-fit items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white disabled:cursor-wait disabled:opacity-70 sm:col-span-2'
            >
              {isChinese ? '保存并进入下一步' : 'Save and continue'}
            </DistributionSubmitButton>
          </DistributionActionForm>
        </details>
      ) : null}

      <details
        id='distribution-assets'
        className='order-4 scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'
        open={profileComplete && !hasLogo}
      >
        <summary className='cursor-pointer text-sm font-bold text-slate-950'>
          {isChinese ? '第 2 步：通用产品素材' : 'Step 2: reusable product assets'}
          <span
            className={`ml-2 rounded-full px-2 py-1 text-xs font-semibold ${
              hasLogo ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}
          >
            {hasLogo ? (isChinese ? '已准备' : 'ready') : isChinese ? '需要 Logo' : 'logo needed'}
          </span>
        </summary>
        <div className='mt-4'>
          <div className='flex flex-col justify-between gap-3 sm:flex-row sm:items-end'>
            <div>
              <div className='text-xs font-bold uppercase tracking-[0.16em] text-cyan-700'>Reusable asset center</div>
              <h2 className='mt-1 text-xl font-bold text-slate-950'>Product media and proof assets</h2>
              <p className='mt-1 text-sm text-slate-600'>
                Maintain assets once, then reuse them in every target-specific submission package.
              </p>
              <div className='mt-3 flex flex-wrap gap-2 text-xs font-semibold'>
                {assetGuidance.map((requirement) => {
                  const ready =
                    requirement.key === 'logo'
                      ? data.assets.some((asset) => ['logo', 'icon'].includes(asset.assetType))
                      : data.assets.some((asset) => asset.assetType === requirement.key);
                  return (
                    <span
                      key={requirement.key}
                      className={`rounded-full px-2.5 py-1 ${
                        ready
                          ? 'bg-emerald-100 text-emerald-700'
                          : requirement.required
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {ready
                        ? `${requirement.label} ready`
                        : `${requirement.label} ${requirement.required ? 'required' : 'recommended'}`}
                    </span>
                  );
                })}
              </div>
            </div>
            <DistributionActionForm
              action={importDistributionIntelligenceAssets}
              successMessage='Assets imported. Refreshing the asset center…'
            >
              <input type='hidden' name='projectId' value={data.project?.id || ''} />
              <ImportAssetsButton />
            </DistributionActionForm>
          </div>
          {data.assets.length ? (
            <div className='mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
              {data.assets.map((asset) => (
                <a
                  key={asset.id}
                  href={asset.url}
                  target='_blank'
                  rel='noreferrer'
                  className='overflow-hidden rounded-xl border border-slate-200 bg-white hover:border-cyan-300 hover:shadow-sm'
                >
                  <div className='flex h-36 items-center justify-center border-b border-slate-100 bg-[linear-gradient(45deg,#f1f5f9_25%,transparent_25%),linear-gradient(-45deg,#f1f5f9_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f1f5f9_75%),linear-gradient(-45deg,transparent_75%,#f1f5f9_75%)] bg-[length:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0px] p-3'>
                    <img
                      src={asset.url}
                      alt={`${data.project?.name || 'Product'} ${asset.assetType}`}
                      className='h-full w-full object-contain'
                      loading='lazy'
                    />
                  </div>
                  <div className='p-3'>
                    <div className='flex items-center justify-between gap-2'>
                      <span className='text-xs font-bold uppercase text-cyan-700'>
                        {asset.assetType.replaceAll('_', ' ')}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${asset.status === 'verified' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}
                      >
                        {asset.status}
                      </span>
                    </div>
                    <div className='mt-2 truncate text-sm font-bold text-slate-900'>
                      {asset.source === 'aibesttool_listing'
                        ? `${data.project?.name || 'Product'} imported ${asset.assetType}`
                        : asset.name}
                    </div>
                    {asset.source === 'aibesttool_listing' ? (
                      <div className='mt-1 text-[11px] font-semibold text-emerald-700'>
                        From the linked product listing
                      </div>
                    ) : null}
                    <div className='mt-1 text-xs text-slate-500'>
                      {asset.width && asset.height ? `${asset.width} × ${asset.height}` : 'Dimensions not recorded'}
                    </div>
                    <div className='mt-2 truncate text-[10px] text-slate-400'>{asset.url}</div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className='mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500'>
              No reusable assets yet. Import discovered assets or add a public asset URL below.
            </div>
          )}
          <details className='mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4'>
            <summary className='cursor-pointer text-sm font-bold text-slate-800'>+ Add asset by URL</summary>
            <DistributionActionForm
              action={createDistributionProjectAsset}
              className='mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4'
              successMessage='Asset saved. Refreshing the asset center…'
              feedbackClassName='sm:col-span-2 lg:col-span-4'
            >
              <input type='hidden' name='projectId' value={data.project?.id || ''} />
              <label className='text-xs font-bold text-slate-600'>
                Type
                <select
                  name='assetType'
                  defaultValue='logo'
                  className='mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal'
                >
                  <option value='logo'>Logo</option>
                  <option value='icon'>Icon</option>
                  <option value='screenshot'>Screenshot</option>
                  <option value='video'>Video</option>
                  <option value='founder_photo'>Founder photo</option>
                  <option value='social'>Social image</option>
                </select>
              </label>
              <label className='text-xs font-bold text-slate-600'>
                Name
                <input
                  required
                  name='name'
                  placeholder='Square logo'
                  className='mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal'
                />
              </label>
              <label className='text-xs font-bold text-slate-600 sm:col-span-2'>
                Public URL
                <input
                  required
                  name='sourceUrl'
                  type='url'
                  placeholder='https://...'
                  className='mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal'
                />
                <span className='mt-1 block font-normal leading-5 text-slate-500'>
                  Use the direct HTTPS URL of an official image that a target site can open without login.
                </span>
              </label>
              <label className='text-xs font-bold text-slate-600'>
                Width
                <input
                  name='width'
                  type='number'
                  min='1'
                  className='mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal'
                />
              </label>
              <label className='text-xs font-bold text-slate-600'>
                Height
                <input
                  name='height'
                  type='number'
                  min='1'
                  className='mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal'
                />
              </label>
              <label className='flex items-center gap-2 self-end rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600'>
                <input type='checkbox' name='verified' /> Verified first-party asset
              </label>
              <DistributionSubmitButton
                pendingLabel='Saving asset…'
                className='inline-flex items-center gap-2 self-end rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-bold text-white disabled:cursor-wait disabled:opacity-70'
              >
                Save asset
              </DistributionSubmitButton>
            </DistributionActionForm>
          </details>
        </div>
      </details>

      {targetTask ? (
        <section className='order-9 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
          <div className='flex flex-col justify-between gap-3 sm:flex-row sm:items-center'>
            <div>
              <div className='text-xs font-bold uppercase tracking-[0.16em] text-cyan-700'>Attribution layer</div>
              <h2 className='mt-1 text-xl font-bold text-slate-950'>Tracked distribution links</h2>
              <p className='mt-1 text-sm text-slate-500'>
                Create one UTM link per channel so visits and conversions can be compared later.
              </p>
            </div>
            <button
              type='button'
              onClick={() => setShowLinkForm((visible) => !visible)}
              className='rounded-xl bg-cyan-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-cyan-800'
            >
              + Create UTM link
            </button>
          </div>
          {showLinkForm ? (
            <DistributionActionForm
              action={createDistributionUtmLink}
              className='mt-5 grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-2'
              successMessage='Tracked link generated. Refreshing the attribution layer…'
              feedbackClassName='sm:col-span-2'
            >
              <input type='hidden' name='projectId' value={data.project?.id || ''} />
              <label className='text-sm font-semibold text-slate-700'>
                Link name
                <input
                  required
                  name='name'
                  placeholder='Product Hunt launch'
                  className='mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none focus:ring-2 focus:ring-cyan-400'
                />
              </label>
              <label className='text-sm font-semibold text-slate-700'>
                Channel
                <select
                  required
                  name='channelId'
                  className='mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-normal'
                >
                  <option value=''>Choose a channel</option>
                  {data.channels.map((channel) => (
                    <option key={channel.id} value={channel.id}>
                      {channel.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className='text-sm font-semibold text-slate-700'>
                Campaign
                <input
                  required
                  name='campaign'
                  defaultValue='launch'
                  placeholder='launch-2026'
                  className='mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none focus:ring-2 focus:ring-cyan-400'
                />
              </label>
              <label className='text-sm font-semibold text-slate-700'>
                Content variant
                <input
                  name='content'
                  placeholder='founder-post-a'
                  className='mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none focus:ring-2 focus:ring-cyan-400'
                />
              </label>
              <DistributionSubmitButton
                pendingLabel='Generating link…'
                className='inline-flex w-fit items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 disabled:cursor-wait disabled:opacity-70 sm:col-span-2'
              >
                Generate tracked link
              </DistributionSubmitButton>
            </DistributionActionForm>
          ) : null}
          {data.links.length > 0 ? (
            <div className='mt-5 space-y-2'>
              {data.links.map((link) => (
                <div
                  key={link.id}
                  className='flex flex-col gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs sm:flex-row sm:items-center sm:justify-between'
                >
                  <div>
                    <span className='font-bold text-slate-800'>{link.name}</span>
                    <span className='ml-2 rounded-full bg-slate-100 px-2 py-1 text-slate-500'>{link.channelName}</span>
                  </div>
                  <a
                    href={link.fullUrl}
                    target='_blank'
                    rel='noreferrer'
                    className='max-w-full truncate font-mono text-cyan-700 hover:underline'
                  >
                    {link.fullUrl}
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className='mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500'>
              No tracked links yet. Start with one channel and one campaign.
            </div>
          )}
        </section>
      ) : null}

      {showForm ? (
        <DistributionActionForm
          action={createDistributionTask}
          className='order-8 rounded-2xl border border-cyan-200 bg-cyan-50/60 p-5'
          successMessage='Task saved. Refreshing today’s queue…'
        >
          <input type='hidden' name='projectId' value={data.project?.id || ''} />
          <div className='mb-4 flex items-center gap-2 text-sm font-bold text-slate-900'>
            <Send className='h-4 w-4 text-cyan-700' /> Create a focused next action
          </div>
          <div className='grid gap-4 md:grid-cols-2'>
            <label className='text-sm font-semibold text-slate-700 md:col-span-2'>
              Task title
              <input
                name='title'
                required
                placeholder='Pitch the product to a relevant newsletter'
                className='mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none ring-cyan-400 focus:ring-2'
              />
            </label>
            <label className='text-sm font-semibold text-slate-700'>
              Channel
              <select
                name='channelId'
                required
                className='mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none ring-cyan-400 focus:ring-2'
              >
                <option value=''>Choose a channel</option>
                {data.channels.map((channel) => (
                  <option key={channel.id} value={channel.id}>
                    {channel.name}
                  </option>
                ))}
              </select>
            </label>
            <label className='text-sm font-semibold text-slate-700'>
              Priority
              <select
                name='priority'
                defaultValue='p1'
                className='mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none ring-cyan-400 focus:ring-2'
              >
                <option value='p0'>P0: high leverage</option>
                <option value='p1'>P1: important</option>
                <option value='p2'>P2: experiment</option>
              </select>
            </label>
            <label className='text-sm font-semibold text-slate-700'>
              Due date
              <input
                name='dueDate'
                type='date'
                className='mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none ring-cyan-400 focus:ring-2'
              />
            </label>
            <label className='text-sm font-semibold text-slate-700'>
              Preparation note
              <input
                name='instructions'
                placeholder='What proof or copy is needed?'
                className='mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none ring-cyan-400 focus:ring-2'
              />
            </label>
          </div>
          <p className='mt-4 text-xs leading-5 text-slate-500'>
            No automatic posting. The workspace keeps the human decision and evidence trail visible.
          </p>
          <DistributionSubmitButton
            pendingLabel='Saving task…'
            className='mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 disabled:cursor-wait disabled:opacity-70'
          >
            Save task
          </DistributionSubmitButton>
        </DistributionActionForm>
      ) : null}

      {blockedInboxTasks.length > 0 ? (
        <section className='order-7 rounded-2xl border border-rose-200 bg-rose-50/70 p-5 shadow-sm'>
          <div className='flex items-start justify-between gap-3'>
            <div>
              <div className='text-xs font-bold uppercase tracking-[0.18em] text-rose-700'>
                {isChinese ? '阻塞收件箱' : 'Blocked inbox'}
              </div>
              <h2 className='mt-1 text-lg font-bold text-slate-950'>
                {isChinese ? '先处理阻塞项' : 'Handle blocked items first'}
              </h2>
            </div>
            <span className='text-xs text-rose-800'>{blockedInboxTasks.length} {isChinese ? '项' : 'item(s)'}</span>
          </div>
          <div className='mt-4 space-y-2'>
            {blockedInboxTasks.map((task) => (
              <div
                key={`blocked-${task.id}`}
                className='flex flex-wrap items-center justify-between gap-2 rounded-xl border border-rose-200 bg-white p-3'
              >
                <div>
                  <div className='text-sm font-bold text-slate-900'>{task.title}</div>
                  <div className='text-xs text-slate-600'>
                    {task.channelName}
                    {task.targetName ? ` · ${task.targetName}` : ''}
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                    <Link
                    href={buildTaskHref(task.id, task.targetId)}
                    className='inline-flex items-center gap-1 rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:text-cyan-700'
                  >
                    {isChinese ? '立即处理' : 'Handle now'} <ArrowRight className='h-3 w-3' />
                  </Link>
                  <span className='rounded-full bg-rose-100 px-2 py-1 text-xs font-bold text-rose-800'>
                    {getDistributionTaskStatusLabel(task.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {data.tasks.length > 0 ? (
        <section className='order-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
          <div className='flex flex-col justify-between gap-2 sm:flex-row sm:items-center'>
            <div>
              <div className='text-xs font-bold uppercase tracking-[0.18em] text-cyan-700'>
                Today&apos;s operating board
              </div>
              <h2 className='mt-1 text-xl font-bold text-slate-950'>
                {data.project?.name || 'Product'}{' '}
                <span className='font-normal text-slate-400'>/ {data.workspace?.name || 'Workspace'}</span>
              </h2>
            </div>
            <div className='flex flex-wrap items-center gap-3 text-xs text-slate-500'>
              <span>Keep one task tied to one channel and one next action.</span>
              {data.tasks.length === 0 ? (
                <DistributionActionForm
                  action={seedDistributionStarterTasks}
                  successMessage='Starter queue created. Refreshing your workspace…'
                >
                  <input type='hidden' name='projectId' value={data.project?.id || ''} />
                  <DistributionSubmitButton
                    pendingLabel='Creating queue…'
                    className='inline-flex items-center gap-1 rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 font-bold text-cyan-800 hover:bg-cyan-100 disabled:cursor-wait disabled:opacity-70'
                  >
                    Initialize project queue
                  </DistributionSubmitButton>
                </DistributionActionForm>
              ) : null}
            </div>
          </div>

          {data.tasks.length === 0 ? (
            <div className='mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500'>
              Add the first promotion task to start the daily queue.
            </div>
          ) : (
            <div className='mt-6 space-y-3'>
              {taskGroups.map((group) => (
                <div key={group.id}>
                  <div className='mb-2 flex items-center justify-between gap-2 text-xs font-bold uppercase tracking-wide text-slate-500'>
                    <span>{group.title}</span>
                    <span>{group.tasks.length}</span>
                  </div>
                  {group.tasks.length > 0 ? (
                    <div className='space-y-3'>
                      {group.tasks.map((task) => renderTaskCard(task))}
                    </div>
                  ) : (
                    <div className='mb-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-xs text-slate-500'>
                      {isChinese ? `暂无${group.title}任务` : `No ${group.title.toLowerCase()} tasks.`}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      ) : null}

      {targetTask ? (
        <section className='order-11 grid gap-4 md:grid-cols-2'>
          <div className='rounded-2xl border border-slate-200 bg-white p-5'>
            <div className='flex items-center gap-2 text-sm font-bold text-slate-900'>
              <ShieldCheck className='h-4 w-4 text-emerald-600' /> Quality guardrails
            </div>
            <ul className='mt-3 space-y-2 text-sm leading-5 text-slate-600'>
              <li>Use the right channel for the right audience.</li>
              <li>Record disclosure and link status.</li>
              <li>Do not duplicate promotional copy or automate community posting.</li>
            </ul>
          </div>
          <div className='rounded-2xl border border-slate-200 bg-white p-5'>
            <div className='text-sm font-bold text-slate-900'>Channel playbook</div>
            <div className='mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
              {data.channels.map((channel) => {
                const template = data.templates.find((item) => item.channelId === channel.id);
                return (
                  <details key={channel.id} className='rounded-xl border border-slate-200 bg-slate-50 p-3'>
                    <summary className='cursor-pointer text-xs font-semibold text-slate-900'>
                      {channel.name}
                      <span className='ml-2 rounded-full bg-white px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-500'>
                        {channel.channelType}
                      </span>
                    </summary>
                    <div className='mt-3 space-y-2 text-xs text-slate-600'>
                      <div className='rounded-lg bg-white p-2'>
                        <div className='font-semibold text-slate-700'>Title</div>
                        <div className='mt-1 text-slate-900'>{channel.copyPackage.title}</div>
                      </div>
                      <div className='rounded-lg bg-white p-2'>
                        <div className='font-semibold text-slate-700'>Description</div>
                        <div className='mt-1 leading-5 text-slate-700'>{channel.copyPackage.description}</div>
                      </div>
                      <div className='rounded-lg bg-white p-2'>
                        <div className='font-semibold text-slate-700'>Disclosure</div>
                        <div className='mt-1 text-slate-700'>{channel.copyPackage.disclosure}</div>
                      </div>
                      <div className='rounded-lg bg-white p-2'>
                        <div className='font-semibold text-slate-700'>Proof points</div>
                        <ul className='mt-1 list-disc space-y-1 pl-4 text-slate-700'>
                          {channel.copyPackage.proofPoints.slice(0, 3).map((point) => (
                            <li key={point}>{point}</li>
                          ))}
                        </ul>
                      </div>
                      <div className='rounded-lg bg-white p-2'>
                        <div className='font-semibold text-slate-700'>Required fields</div>
                        <div className='mt-1 flex flex-wrap gap-1'>
                          {channel.copyPackage.requiredFields.map((field) => (
                            <span
                              key={field}
                              className='rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600'
                            >
                              {field}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className='rounded-lg bg-white p-2'>
                        <div className='font-semibold text-slate-700'>Follow up</div>
                        <div className='mt-1 leading-5 text-slate-700'>{channel.copyPackage.followUpPrompt}</div>
                      </div>
                      <div
                        className='text-[11px] text-slate-500'
                        title={template?.descriptionTemplate || channel.instructions || ''}
                      >
                        {channel.copyPackage.handoffNotes[0]}
                      </div>
                    </div>
                  </details>
                );
              })}
            </div>
            <p className='mt-3 text-xs text-slate-500'>
              Open a channel to review the generated copy package. Templates guide human editing; they do not
              auto-publish.
            </p>
          </div>
        </section>
      ) : null}
    </div>
  );
}
