import { normalizeDistributionTaskStatus, type DistributionTaskStatus } from './taskStateMachine';
import { getDistributionTaskStatusLabel } from './taskStateMachine';

export type DistributionPresentationPhase = 'onboarding' | 'opportunity' | 'execution' | 'monitoring' | 'completed';
export type DistributionPresentationStatus = 'preparing' | 'ready' | 'submitted' | 'waiting' | 'live' | 'done' | 'skipped';
export type DistributionBlockerType =
  | 'payment'
  | 'account'
  | 'captcha'
  | 'assets'
  | 'editorial'
  | 'link'
  | 'other'
  | null;

export interface DistributionPresentationState {
  phase: DistributionPresentationPhase;
  status: DistributionPresentationStatus;
  blocked: boolean;
  blockedPhase: DistributionPresentationPhase | null;
  blockerType: DistributionBlockerType;
  label: string;
  toneClass: string;
  actionHint: string;
  nextReviewAt: string | null;
}

export interface DistributionTaskPresentationInput {
  status: string;
  liveUrl?: string | null;
  linkStatus?: string | null;
  packageStatus?: string | null;
  blockedReason?: string | null;
  dueDate?: string | null;
}

function mapStatus(status: DistributionTaskStatus): DistributionPresentationStatus {
  if (status === 'planned') return 'preparing';
  if (status === 'in_progress') return 'preparing';
  if (status === 'needs_assets') return 'ready';
  if (status === 'ready_to_submit') return 'ready';
  if (status === 'submitted') return 'submitted';
  if (status === 'waiting_review') return 'waiting';
  if (status === 'live') return 'live';
  if (status === 'follow_up') return 'waiting';
  if (status === 'blocked') return 'waiting';
  if (status === 'done') return 'done';
  return 'skipped';
}

function statusToToneClass(status: DistributionTaskStatus, blocked: boolean) {
  if (blocked) return 'bg-rose-100 text-rose-800';
  if (status === 'live' || status === 'done') return 'bg-emerald-100 text-emerald-800';
  if (status === 'waiting_review' || status === 'needs_assets' || status === 'follow_up') return 'bg-amber-100 text-amber-800';
  if (status === 'ready_to_submit' || status === 'in_progress') return 'bg-cyan-100 text-cyan-800';
  if (status === 'blocked') return 'bg-rose-100 text-rose-800';
  return 'bg-slate-100 text-slate-700';
}

function mapPhase(status: DistributionTaskStatus, input: DistributionTaskPresentationInput): DistributionPresentationPhase {
  if (status === 'planned') return 'onboarding';
  if (status === 'in_progress' || status === 'needs_assets' || status === 'ready_to_submit') return 'execution';
  if (status === 'submitted' || status === 'waiting_review' || status === 'live' || status === 'follow_up') return 'monitoring';
  if (status === 'done' || status === 'skipped') return 'completed';
  if (status === 'blocked') {
    if (detectBlockedReasonType(input.blockedReason || '') === 'link' || ['live', 'follow_up'].includes(input.packageStatus || '')) {
      return 'monitoring';
    }
    return 'execution';
  }
  return 'execution';
}

export function detectBlockedReasonType(reason: string | null | undefined): DistributionBlockerType {
  if (!reason) return null;
  const normalized = reason.toLowerCase();
  if (normalized.includes('payment') || normalized.includes('fee') || normalized.includes('cost')) return 'payment';
  if (normalized.includes('account') || normalized.includes('signup') || normalized.includes('login')) return 'account';
  if (normalized.includes('captcha') || normalized.includes('bot') || normalized.includes('anti-bot')) return 'captcha';
  if (normalized.includes('asset') || normalized.includes('logo') || normalized.includes('screenshot') || normalized.includes('proof')) return 'assets';
  if (normalized.includes('editorial') || normalized.includes('review') || normalized.includes('manual')) return 'editorial';
  if (normalized.includes('link') || normalized.includes('nofollow') || normalized.includes('removed') || normalized.includes('rejected')) return 'link';
  return 'other';
}

export function deriveDistributionPresentationState(input: DistributionTaskPresentationInput): DistributionPresentationState {
  const status = normalizeDistributionTaskStatus(input.status) || 'planned';
  const blocked = status === 'blocked';
  const basePhase = mapPhase(status, input);
  const phase = blocked && basePhase === 'monitoring' ? 'monitoring' : blocked ? basePhase : basePhase;
  const blockedType = blocked ? detectBlockedReasonType(input.blockedReason) : null;
  const blockedPhase = blocked ? phase : null;

  const label = blocked
    ? `Blocked · ${getDistributionTaskStatusLabel(status)}`
    : getDistributionTaskStatusLabel(status);

  const actionHintMap: Record<DistributionPresentationStatus, string> = {
    preparing: 'prepare assets and package',
    ready: 'submit or generate materials',
    submitted: 'track review and wait for publish',
    waiting: 'keep checking and record updates',
    live: 'schedule follow-up checks',
    done: 'review outcome and move to next target',
    skipped: 'select another target',
  };

  return {
    phase,
    status: mapStatus(status),
    blocked,
    blockedPhase,
    blockerType: blockedType,
    label,
    toneClass: statusToToneClass(status, blocked),
    actionHint: actionHintMap[mapStatus(status)],
    nextReviewAt: input.dueDate || null,
  };
}
