import type { DistributionTaskStatus } from './taskStateMachine';

export interface DistributionTaskScheduleItem {
  id: string;
  title: string;
  status: DistributionTaskStatus;
  priority: string;
  dueDate: string | null;
  channelName: string;
  channelType: string;
  score: number;
  reason: string;
}

export function buildDistributionChannelPriorityFeedback(
  tasks: Array<{
    channelType: string;
    status: DistributionTaskStatus;
    liveUrl: string | null;
    linkStatus: string | null;
  }>,
): Record<string, number> {
  const feedback: Record<string, number> = {};
  const stats = new Map<string, { live: number; issue: number; blocked: number }>();

  for (const task of tasks) {
    const current = stats.get(task.channelType) || { live: 0, issue: 0, blocked: 0 };
    if (task.linkStatus === 'live' || Boolean(task.liveUrl) || task.status === 'live') current.live += 1;
    if (['removed', 'rejected', 'nofollow'].includes(task.linkStatus || '')) current.issue += 1;
    if (task.status === 'blocked') current.blocked += 1;
    stats.set(task.channelType, current);
  }

  for (const [channelType, stat] of Array.from(stats.entries())) {
    feedback[channelType] = Math.max(-12, Math.min(12, stat.live * 4 - stat.issue * 3 - stat.blocked * 2));
  }

  return feedback;
}

function priorityScore(priority: string): number {
  if (priority === 'p0') return 30;
  if (priority === 'p1') return 18;
  return 8;
}

function statusScore(status: DistributionTaskStatus): number {
  if (status === 'blocked') return -30;
  if (status === 'needs_assets') return 25;
  if (status === 'ready_to_submit') return 35;
  if (status === 'submitted') return 18;
  if (status === 'waiting_review') return 15;
  if (status === 'follow_up') return 20;
  if (status === 'in_progress') return 24;
  if (status === 'planned') return 12;
  if (status === 'live') return 10;
  if (status === 'done') return -10;
  if (status === 'skipped') return -20;
  return 0;
}

function dueDateScore(dueDate: string | null): number {
  if (!dueDate) return 0;
  const diffDays = Math.ceil((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (Number.isNaN(diffDays)) return 0;
  if (diffDays < 0) return 24;
  if (diffDays === 0) return 22;
  if (diffDays <= 2) return 18;
  if (diffDays <= 7) return 10;
  return 2;
}

export function scheduleDistributionTasks(
  tasks: Array<{
    id: string;
    title: string;
    status: DistributionTaskStatus;
    priority: string;
    dueDate: string | null;
    channelName: string;
    channelType: string;
  }>,
  channelAdjustments: Record<string, number> = {},
): DistributionTaskScheduleItem[] {
  return tasks
    .map((task) => {
      const channelAdjustment = channelAdjustments[task.channelType] || 0;
      const score = priorityScore(task.priority) + statusScore(task.status) + dueDateScore(task.dueDate) + channelAdjustment;
      const reason =
        task.status === 'blocked'
          ? 'Blocked tasks are deprioritized until the blocker is removed.'
          : task.status === 'needs_assets'
            ? 'Missing assets make this a high-priority preparation item.'
            : task.status === 'ready_to_submit'
              ? 'Ready-to-submit items should be handled first.'
              : task.dueDate && new Date(task.dueDate).getTime() < Date.now()
                  ? 'Overdue tasks are pulled toward the top.'
                  : task.priority === 'p0'
                  ? channelAdjustment !== 0
                    ? 'P0 priority is combined with recent channel feedback.'
                    : 'P0 priority gets a stronger weight in the daily queue.'
                  : 'Regular queue item.';
      return { ...task, score, reason };
    })
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
}
