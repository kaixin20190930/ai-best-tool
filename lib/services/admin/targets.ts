import { requireAdmin } from '@/lib/auth/middleware';
import { createAdminClient } from '@/lib/supabase/admin';

export interface AdminDistributionTargetSnapshotItem {
  id: string;
  targetId: string;
  ruleVersion: number;
  snapshotHash: string | null;
  matchScore: number | null;
  matchGrade: string | null;
  matchSummary: string | null;
  matchReasons: Array<{
    label: string;
    impact: number;
    kind: 'bonus' | 'penalty';
    detail: string;
    sourceUrl: string | null;
  }>;
  obstacleStatus: 'clear' | 'needs_review' | 'blocked';
  nextReviewAt: string | null;
  reviewReason: string | null;
  discoveredPageCount: number;
  fetchedAt: string;
}

export interface AdminDistributionTargetItem {
  id: string;
  channelId: string;
  channelName: string;
  channelType: string;
  name: string;
  homepageUrl: string;
  submissionUrl: string | null;
  registrationUrl: string | null;
  pricingUrl: string | null;
  targetStatus: 'active' | 'stale' | 'blocked' | 'retired';
  requiresAccount: boolean;
  requiresPayment: boolean;
  requiresCaptcha: boolean;
  requiresBacklink: boolean;
  editorialReview: boolean;
  expectedReviewDays: number | null;
  lastCheckedAt: string | null;
  nextCheckAt: string | null;
  confidence: number;
  notes: string | null;
  currentRuleVersion: number;
  lastReviewReason: string | null;
  currentSnapshotId: string | null;
  snapshot: AdminDistributionTargetSnapshotItem | null;
  requirements: Array<{
    id: string;
    requiredField: string;
    fieldType: string;
    requiredAsset: string | null;
    confidence: number;
    sourceUrl: string;
    ruleText: string;
  }>;
}

export interface AdminDistributionTargetRegistry {
  totals: {
    total: number;
    active: number;
    stale: number;
    blocked: number;
    retired: number;
    needsReview: number;
    blockedObstacles: number;
  };
  targets: AdminDistributionTargetItem[];
  channels: Array<{ id: string; name: string; channelType: string }>;
}

function normalizeSearch(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed.toLowerCase() : null;
}

export async function getAdminDistributionTargetRegistry(input?: {
  status?: string;
  channelId?: string;
  search?: string;
  limit?: number;
}): Promise<AdminDistributionTargetRegistry> {
  await requireAdmin();
  const supabase = createAdminClient();
  const limit = Math.max(1, Math.min(input?.limit || 100, 300));
  const status = input?.status && ['active', 'stale', 'blocked', 'retired'].includes(input.status) ? input.status : null;
  const channelId = input?.channelId?.trim() || null;
  const search = normalizeSearch(input?.search);

  let targetQuery = supabase
    .from('distribution_targets')
    .select(
      'id, channel_id, name, homepage_url, submission_url, registration_url, pricing_url, target_status, requires_account, requires_payment, requires_captcha, requires_backlink, editorial_review, expected_review_days, last_checked_at, next_check_at, confidence, notes, current_rule_version, last_review_reason, current_snapshot_id, distribution_channels(id, name, channel_type)',
    )
    .order('next_check_at', { ascending: true, nullsFirst: false })
    .order('confidence', { ascending: false })
    .limit(limit);

  if (status) targetQuery = targetQuery.eq('target_status', status);
  if (channelId) targetQuery = targetQuery.eq('channel_id', channelId);

  const [{ data: targets, error: targetError }, { data: snapshots, error: snapshotError }, { data: requirements, error: requirementError }, { data: channels, error: channelError }, { count, error: countError }] =
    await Promise.all([
      targetQuery,
      supabase
        .from('distribution_target_snapshots')
        .select('id, target_id, rule_version, snapshot_hash, analysis_json, obstacle_status, next_review_at, review_reason, discovered_page_count, fetched_at')
        .order('fetched_at', { ascending: false }),
      supabase
        .from('distribution_target_requirements')
        .select('id, target_id, required_field, field_type, required_asset, confidence, source_url, rule_text')
        .order('confidence', { ascending: false }),
      supabase.from('distribution_channels').select('id, name, channel_type').eq('is_active', true).order('sort_order', { ascending: true }),
      supabase.from('distribution_targets').select('id', { count: 'exact', head: true }),
    ]);

  if (targetError || snapshotError || requirementError || channelError || countError) {
    throw new Error(targetError?.message || snapshotError?.message || requirementError?.message || channelError?.message || countError?.message || 'Unable to load target registry.');
  }

  const snapshotByTarget = new Map<string, AdminDistributionTargetSnapshotItem>();
  for (const snapshot of snapshots || []) {
    const targetId = String((snapshot as Record<string, unknown>).target_id || '');
    if (!targetId || snapshotByTarget.has(targetId)) continue;
    snapshotByTarget.set(targetId, {
      id: String((snapshot as Record<string, unknown>).id),
      targetId,
      ruleVersion: Number((snapshot as Record<string, unknown>).rule_version || 0),
      snapshotHash: (snapshot as Record<string, unknown>).snapshot_hash as string | null,
      matchScore: (() => {
        const analysis = (snapshot as Record<string, unknown>).analysis_json as Record<string, unknown> | null | undefined;
        const score = analysis?.matchScore as Record<string, unknown> | null | undefined;
        const value = score?.score;
        return typeof value === 'number' ? value : Number(value || 0) || null;
      })(),
      matchGrade: (() => {
        const analysis = (snapshot as Record<string, unknown>).analysis_json as Record<string, unknown> | null | undefined;
        const score = analysis?.matchScore as Record<string, unknown> | null | undefined;
        return typeof score?.grade === 'string' ? String(score.grade) : null;
      })(),
      matchSummary: (() => {
        const analysis = (snapshot as Record<string, unknown>).analysis_json as Record<string, unknown> | null | undefined;
        const score = analysis?.matchScore as Record<string, unknown> | null | undefined;
        return typeof score?.summary === 'string' ? String(score.summary) : null;
      })(),
      matchReasons: (() => {
        const analysis = (snapshot as Record<string, unknown>).analysis_json as Record<string, unknown> | null | undefined;
        const score = analysis?.matchScore as Record<string, unknown> | null | undefined;
        const reasons = Array.isArray(score?.reasons) ? score.reasons : [];
        return reasons.map((reason) => {
          const row = reason as Record<string, unknown>;
          return {
            label: String(row.label || ''),
            impact: Number(row.impact || 0),
            kind: row.kind === 'penalty' ? 'penalty' : 'bonus',
            detail: String(row.detail || ''),
            sourceUrl: (row.sourceUrl as string | null | undefined) || null,
          };
        });
      })(),
      obstacleStatus: ((snapshot as Record<string, unknown>).obstacle_status as 'clear' | 'needs_review' | 'blocked') || 'clear',
      nextReviewAt: (snapshot as Record<string, unknown>).next_review_at as string | null,
      reviewReason: (snapshot as Record<string, unknown>).review_reason as string | null,
      discoveredPageCount: Number((snapshot as Record<string, unknown>).discovered_page_count || 0),
      fetchedAt: String((snapshot as Record<string, unknown>).fetched_at || ''),
    });
  }

  const requirementsByTarget = new Map<string, AdminDistributionTargetItem['requirements']>();
  for (const requirement of requirements || []) {
    const row = requirement as Record<string, unknown>;
    const targetId = String(row.target_id || '');
    if (!targetId) continue;
    const current = requirementsByTarget.get(targetId) || [];
    current.push({
      id: String(row.id),
      requiredField: String(row.required_field || ''),
      fieldType: String(row.field_type || 'unknown'),
      requiredAsset: (row.required_asset as string | null | undefined) || null,
      confidence: Number(row.confidence || 0),
      sourceUrl: String(row.source_url || ''),
      ruleText: String(row.rule_text || ''),
    });
    requirementsByTarget.set(targetId, current);
  }

  const filteredTargets = (targets || []).filter((target) => {
    const row = target as Record<string, unknown>;
    if (!search) return true;
    const haystack = [
      row.name,
      row.homepage_url,
      row.submission_url,
      row.registration_url,
      row.pricing_url,
      row.notes,
      (row.distribution_channels as Record<string, unknown> | undefined)?.name,
    ]
      .map((value) => String(value || '').toLowerCase())
      .join(' ');
    return haystack.includes(search);
  });

  const mappedTargets = filteredTargets.map((target) => {
    const row = target as Record<string, unknown>;
    const targetId = String(row.id);
    const channel = (row.distribution_channels as Record<string, unknown>) || {};
    return {
      id: targetId,
      channelId: String(row.channel_id || ''),
      channelName: String(channel.name || 'Unknown channel'),
      channelType: String(channel.channel_type || 'other'),
      name: String(row.name || ''),
      homepageUrl: String(row.homepage_url || ''),
      submissionUrl: (row.submission_url as string | null | undefined) || null,
      registrationUrl: (row.registration_url as string | null | undefined) || null,
      pricingUrl: (row.pricing_url as string | null | undefined) || null,
      targetStatus: (row.target_status as AdminDistributionTargetItem['targetStatus']) || 'active',
      requiresAccount: Boolean(row.requires_account),
      requiresPayment: Boolean(row.requires_payment),
      requiresCaptcha: Boolean(row.requires_captcha),
      requiresBacklink: Boolean(row.requires_backlink),
      editorialReview: Boolean(row.editorial_review),
      expectedReviewDays: row.expected_review_days === null || row.expected_review_days === undefined ? null : Number(row.expected_review_days),
      lastCheckedAt: (row.last_checked_at as string | null | undefined) || null,
      nextCheckAt: (row.next_check_at as string | null | undefined) || null,
      confidence: Number(row.confidence || 0),
      notes: (row.notes as string | null | undefined) || null,
      currentRuleVersion: Number(row.current_rule_version || 0),
      lastReviewReason: (row.last_review_reason as string | null | undefined) || null,
      currentSnapshotId: (row.current_snapshot_id as string | null | undefined) || null,
      snapshot: snapshotByTarget.get(targetId) || null,
      requirements: requirementsByTarget.get(targetId) || [],
    };
  });

  const totals = mappedTargets.reduce(
    (summary, target) => {
      summary.total += 1;
      summary[target.targetStatus] += 1;
      if (target.snapshot?.obstacleStatus === 'blocked') summary.blockedObstacles += 1;
      if (target.snapshot?.obstacleStatus === 'needs_review') summary.needsReview += 1;
      return summary;
    },
    { total: 0, active: 0, stale: 0, blocked: 0, retired: 0, needsReview: 0, blockedObstacles: 0 },
  );

  return {
    totals,
    targets: mappedTargets,
    channels: (channels || []).map((channel: Record<string, unknown>) => ({
      id: String(channel.id),
      name: String(channel.name || ''),
      channelType: String(channel.channel_type || 'other'),
    })),
  };
}
