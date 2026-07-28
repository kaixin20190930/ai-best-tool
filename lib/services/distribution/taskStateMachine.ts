export const DISTRIBUTION_TASK_STATUSES = [
  'planned',
  'in_progress',
  'needs_assets',
  'ready_to_submit',
  'submitted',
  'waiting_review',
  'live',
  'follow_up',
  'blocked',
  'done',
  'skipped',
] as const;

export type DistributionTaskStatus = (typeof DISTRIBUTION_TASK_STATUSES)[number];

export interface DistributionTaskStatusMeta {
  label: string;
  tone: 'neutral' | 'info' | 'warning' | 'success' | 'danger';
  description: string;
  nextStates: DistributionTaskStatus[];
}

export const DISTRIBUTION_TASK_STATUS_META: Record<DistributionTaskStatus, DistributionTaskStatusMeta> = {
  planned: {
    label: 'Planned',
    tone: 'neutral',
    description: 'The task is queued but not started yet.',
    nextStates: ['in_progress', 'needs_assets', 'blocked', 'skipped'],
  },
  in_progress: {
    label: 'Preparing',
    tone: 'info',
    description: 'Copy, assets, or research are being prepared.',
    nextStates: ['needs_assets', 'ready_to_submit', 'blocked', 'done', 'skipped'],
  },
  needs_assets: {
    label: 'Needs assets',
    tone: 'warning',
    description: 'The task is blocked on missing copy, screenshots, or proof points.',
    nextStates: ['in_progress', 'ready_to_submit', 'blocked', 'skipped'],
  },
  ready_to_submit: {
    label: 'Ready to submit',
    tone: 'info',
    description: 'The task is ready for a human to submit or send.',
    nextStates: ['submitted', 'blocked', 'skipped'],
  },
  submitted: {
    label: 'Submitted',
    tone: 'info',
    description: 'The task has been sent and is waiting for the next external step.',
    nextStates: ['waiting_review', 'live', 'blocked', 'follow_up', 'done'],
  },
  waiting_review: {
    label: 'Waiting review',
    tone: 'warning',
    description: 'A reviewer, platform, or payment step still needs to clear the path.',
    nextStates: ['live', 'blocked', 'follow_up', 'done', 'skipped'],
  },
  live: {
    label: 'Live',
    tone: 'success',
    description: 'The mention, listing, or placement is live.',
    nextStates: ['follow_up', 'done', 'blocked'],
  },
  follow_up: {
    label: 'Follow up',
    tone: 'warning',
    description: 'The task is live or submitted, and needs a follow-up action or check.',
    nextStates: ['done', 'blocked', 'live'],
  },
  blocked: {
    label: 'Blocked',
    tone: 'danger',
    description: 'The task cannot move forward until the blocker is removed.',
    nextStates: ['planned', 'in_progress', 'needs_assets', 'ready_to_submit', 'submitted', 'skipped'],
  },
  done: {
    label: 'Done',
    tone: 'success',
    description: 'The task has been completed and no further action is required.',
    nextStates: ['follow_up', 'blocked'],
  },
  skipped: {
    label: 'Skipped',
    tone: 'neutral',
    description: 'The task is intentionally not being pursued.',
    nextStates: ['planned', 'in_progress', 'needs_assets', 'ready_to_submit'],
  },
};

export function isDistributionTaskStatus(value: string): value is DistributionTaskStatus {
  return (DISTRIBUTION_TASK_STATUSES as readonly string[]).includes(value);
}

export function normalizeDistributionTaskStatus(value: string | null | undefined): DistributionTaskStatus | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (trimmed === 'preparing') return 'in_progress';
  if (trimmed === 'review_pending') return 'waiting_review';
  if (trimmed === 'awaiting_review') return 'waiting_review';
  if (trimmed === 'ready') return 'ready_to_submit';
  if (trimmed === 'pending_review') return 'waiting_review';
  if (isDistributionTaskStatus(trimmed)) return trimmed;
  return null;
}

export function getDistributionTaskStatusLabel(status: DistributionTaskStatus): string {
  return DISTRIBUTION_TASK_STATUS_META[status].label;
}

export function getDistributionTaskStatusTone(status: DistributionTaskStatus): DistributionTaskStatusMeta['tone'] {
  return DISTRIBUTION_TASK_STATUS_META[status].tone;
}

export function getDistributionTaskStatusDescription(status: DistributionTaskStatus): string {
  return DISTRIBUTION_TASK_STATUS_META[status].description;
}

export function getDistributionTaskStatusChoices(): Array<{
  value: DistributionTaskStatus;
  label: string;
  description: string;
}> {
  return DISTRIBUTION_TASK_STATUSES.map((status) => ({
    value: status,
    label: DISTRIBUTION_TASK_STATUS_META[status].label,
    description: DISTRIBUTION_TASK_STATUS_META[status].description,
  }));
}

export function deriveTaskStatusFromLinkResult(input: {
  currentStatus: DistributionTaskStatus | string;
  liveUrl: string | null;
  linkStatus: string;
}): DistributionTaskStatus {
  const currentStatus = normalizeDistributionTaskStatus(input.currentStatus) || 'planned';
  const linkStatus = input.linkStatus.trim();

  if (linkStatus === 'live') return 'live';
  if (['removed', 'rejected', 'nofollow'].includes(linkStatus)) return 'blocked';
  if (linkStatus === 'pending') return 'waiting_review';
  if (input.liveUrl) return 'live';
  if (currentStatus === 'submitted' || currentStatus === 'waiting_review') return 'waiting_review';
  return currentStatus;
}
