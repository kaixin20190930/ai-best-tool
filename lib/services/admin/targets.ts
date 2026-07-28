import { requireAdmin } from '@/lib/auth/middleware';
import { queryDatabase } from '@/lib/services/database';

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
  const limit = Math.max(1, Math.min(input?.limit || 100, 300));
  const status = input?.status && ['active', 'stale', 'blocked', 'retired'].includes(input.status) ? input.status : null;
  const channelId = input?.channelId?.trim() || null;
  const search = normalizeSearch(input?.search);

  const targets = await queryDatabase<{
    id: string;
    channel_id: string;
    name: string;
    homepage_url: string;
    submission_url: string | null;
    registration_url: string | null;
    pricing_url: string | null;
    target_status: 'active' | 'stale' | 'blocked' | 'retired';
    requires_account: boolean;
    requires_payment: boolean;
    requires_captcha: boolean;
    requires_backlink: boolean;
    editorial_review: boolean;
    expected_review_days: number | null;
    last_checked_at: string | null;
    next_check_at: string | null;
    confidence: number;
    notes: string | null;
    current_rule_version: number | null;
    last_review_reason: string | null;
    current_snapshot_id: string | null;
    channel_name: string;
    channel_type: string;
  }>(
    `
      select
        t.id,
        t.channel_id,
        t.name,
        t.homepage_url,
        t.submission_url,
        t.registration_url,
        t.pricing_url,
        t.target_status,
        t.requires_account,
        t.requires_payment,
        t.requires_captcha,
        t.requires_backlink,
        t.editorial_review,
        t.expected_review_days,
        t.last_checked_at,
        t.next_check_at,
        t.confidence,
        t.notes,
        t.current_rule_version,
        t.last_review_reason,
        t.current_snapshot_id,
        c.name as channel_name,
        c.channel_type as channel_type
      from distribution_targets t
      join distribution_channels c on c.id = t.channel_id
      where ($1::text is null or t.target_status = $1::text)
        and ($2::uuid is null or t.channel_id = $2::uuid)
      order by t.next_check_at asc nulls last, t.confidence desc
      limit $3
    `,
    [status, channelId, limit],
  );

  const snapshots = await queryDatabase<{
    id: string;
    target_id: string;
    rule_version: number;
    snapshot_hash: string | null;
    analysis_json: Record<string, unknown> | null;
    obstacle_status: 'clear' | 'needs_review' | 'blocked';
    next_review_at: string | null;
    review_reason: string | null;
    discovered_page_count: number;
    fetched_at: string;
  }>(
    `
      select id, target_id, rule_version, snapshot_hash, analysis_json, obstacle_status, next_review_at, review_reason, discovered_page_count, fetched_at
      from distribution_target_snapshots
      order by fetched_at desc
    `,
  );

  const requirements = await queryDatabase<{
    id: string;
    target_id: string;
    required_field: string;
    field_type: string;
    required_asset: string | null;
    confidence: number;
    source_url: string;
    rule_text: string;
  }>(
    `
      select id, target_id, required_field, field_type, required_asset, confidence, source_url, rule_text
      from distribution_target_requirements
      order by confidence desc
    `,
  );

  const channels = await queryDatabase<{
    id: string;
    name: string;
    channel_type: string;
  }>(
    `
      select id, name, channel_type
      from distribution_channels
      where is_active = true
      order by sort_order asc
    `,
  );

  const snapshotByTarget = new Map<string, AdminDistributionTargetSnapshotItem>();
  for (const snapshot of snapshots || []) {
    const targetId = String(snapshot.target_id || '');
    if (!targetId || snapshotByTarget.has(targetId)) continue;
    snapshotByTarget.set(targetId, {
      id: String(snapshot.id),
      targetId,
      ruleVersion: Number(snapshot.rule_version || 0),
      snapshotHash: snapshot.snapshot_hash,
      matchScore: (() => {
        const analysis = snapshot.analysis_json;
        const score = analysis?.matchScore as Record<string, unknown> | null | undefined;
        const value = score?.score;
        return typeof value === 'number' ? value : Number(value || 0) || null;
      })(),
      matchGrade: (() => {
        const analysis = snapshot.analysis_json;
        const score = analysis?.matchScore as Record<string, unknown> | null | undefined;
        return typeof score?.grade === 'string' ? String(score.grade) : null;
      })(),
      matchSummary: (() => {
        const analysis = snapshot.analysis_json;
        const score = analysis?.matchScore as Record<string, unknown> | null | undefined;
        return typeof score?.summary === 'string' ? String(score.summary) : null;
      })(),
      matchReasons: (() => {
        const analysis = snapshot.analysis_json;
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
      obstacleStatus: snapshot.obstacle_status || 'clear',
      nextReviewAt: snapshot.next_review_at,
      reviewReason: snapshot.review_reason,
      discoveredPageCount: Number(snapshot.discovered_page_count || 0),
      fetchedAt: String(snapshot.fetched_at || ''),
    });
  }

  const requirementsByTarget = new Map<string, AdminDistributionTargetItem['requirements']>();
  for (const requirement of requirements || []) {
    const targetId = String(requirement.target_id || '');
    if (!targetId) continue;
    const current = requirementsByTarget.get(targetId) || [];
    current.push({
      id: String(requirement.id),
      requiredField: String(requirement.required_field || ''),
      fieldType: String(requirement.field_type || 'unknown'),
      requiredAsset: requirement.required_asset || null,
      confidence: Number(requirement.confidence || 0),
      sourceUrl: String(requirement.source_url || ''),
      ruleText: String(requirement.rule_text || ''),
    });
    requirementsByTarget.set(targetId, current);
  }

  const filteredTargets = (targets || []).filter((target) => {
    if (!search) return true;
    const haystack = [
      target.name,
      target.homepage_url,
      target.submission_url,
      target.registration_url,
      target.pricing_url,
      target.notes,
      target.channel_name,
    ]
      .map((value) => String(value || '').toLowerCase())
      .join(' ');
    return haystack.includes(search);
  });

  const mappedTargets = filteredTargets.map((target) => {
    const targetId = String(target.id);
    return {
      id: targetId,
      channelId: String(target.channel_id || ''),
      channelName: String(target.channel_name || 'Unknown channel'),
      channelType: String(target.channel_type || 'other'),
      name: String(target.name || ''),
      homepageUrl: String(target.homepage_url || ''),
      submissionUrl: target.submission_url || null,
      registrationUrl: target.registration_url || null,
      pricingUrl: target.pricing_url || null,
      targetStatus: target.target_status || 'active',
      requiresAccount: Boolean(target.requires_account),
      requiresPayment: Boolean(target.requires_payment),
      requiresCaptcha: Boolean(target.requires_captcha),
      requiresBacklink: Boolean(target.requires_backlink),
      editorialReview: Boolean(target.editorial_review),
      expectedReviewDays: target.expected_review_days === null || target.expected_review_days === undefined ? null : Number(target.expected_review_days),
      lastCheckedAt: target.last_checked_at || null,
      nextCheckAt: target.next_check_at || null,
      confidence: Number(target.confidence || 0),
      notes: target.notes || null,
      currentRuleVersion: Number(target.current_rule_version || 0),
      lastReviewReason: target.last_review_reason || null,
      currentSnapshotId: target.current_snapshot_id || null,
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
    channels: (channels || []).map((channel) => ({
      id: String(channel.id),
      name: String(channel.name || ''),
      channelType: String(channel.channel_type || 'other'),
    })),
  };
}
