import { createHash } from 'node:crypto';

import { createAdminClient } from '@/lib/supabase/admin';

import { analyzeDistributionTarget, buildDistributionTargetRequirementRecords } from './targetAnalyzer';
import { discoverDistributionTargetPages } from './targetDiscovery';
import type {
  DistributionTargetAnalysisResult,
  DistributionTargetDiscoveryResult,
} from './types';

export interface PersistDistributionTargetReviewInput {
  targetId: string;
  homepageUrl?: string;
  observedAt?: string;
  dryRun?: boolean;
}

export interface PersistDistributionTargetReviewResult {
  targetId: string;
  snapshotId: string | null;
  ruleVersion: number;
  snapshotHash: string;
  versionChanged: boolean;
  obstacleStatus: DistributionTargetAnalysisResult['obstacleStatus'];
  nextReviewAt: string | null;
  targetStatus: DistributionTargetDiscoveryResult['targetStatus'];
  dryRun: boolean;
}

function normalizeText(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed || null;
}

function stableHash(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function deriveNextReviewAt(analysis: DistributionTargetAnalysisResult): string | null {
  if (analysis.obstacleStatus === 'blocked') {
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  }
  if (analysis.obstacleStatus === 'needs_review') {
    return new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
  }
  return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
}

function deriveTargetStatus(analysis: DistributionTargetAnalysisResult, currentStatus: string | null): string {
  if (currentStatus === 'retired') return 'retired';
  if (analysis.obstacleStatus === 'blocked') return 'blocked';
  if (analysis.obstacleStatus === 'needs_review') return 'stale';
  return 'active';
}

function buildSnapshotPayload(input: {
  targetId: string;
  discovery: DistributionTargetDiscoveryResult;
  analysis: DistributionTargetAnalysisResult;
  observedAt: string;
  ruleVersion: number;
}) {
  return {
    targetId: input.targetId,
    homepageUrl: input.discovery.homepageUrl,
    finalUrl: input.discovery.finalUrl,
    targetStatus: input.discovery.targetStatus,
    matchScore: input.analysis.matchScore,
    obstacleStatus: input.analysis.obstacleStatus,
    blockedReasons: input.analysis.blockedReasons,
    nextAction: input.analysis.nextAction,
    summary: input.analysis.summary,
    visibleRules: input.analysis.snapshot.visibleRules,
    pricingInfo: input.analysis.snapshot.pricingInfo,
    formFields: input.analysis.snapshot.formFields,
    notes: input.analysis.snapshot.notes,
    rules: input.analysis.rules,
    obstacles: input.analysis.obstacles,
    fieldRequirements: input.analysis.fieldRequirements,
    pages: input.discovery.pages.map((page) => ({
      url: page.url,
      finalUrl: page.finalUrl,
      pageType: page.pageType,
      discoveryMethod: page.discoveryMethod,
      score: page.score,
      httpStatus: page.httpStatus,
      title: page.title,
      excerpt: page.excerpt,
      signals: page.signals,
    })),
    requirements: input.discovery.requirements,
    observedAt: input.observedAt,
    ruleVersion: input.ruleVersion,
  };
}

export async function persistDistributionTargetReview(
  input: PersistDistributionTargetReviewInput,
): Promise<PersistDistributionTargetReviewResult> {
  const supabase = createAdminClient();
  const observedAt = input.observedAt || new Date().toISOString();
  const targetId = normalizeText(input.targetId);
  if (!targetId) throw new Error('targetId is required.');

  const { data: target, error: targetError } = await supabase
    .from('distribution_targets')
    .select('id, homepage_url, target_status, current_rule_version')
    .eq('id', targetId)
    .maybeSingle();
  if (targetError) throw new Error(targetError.message);
  if (!target) throw new Error('Target not found.');

  const homepageUrl = normalizeText(input.homepageUrl) || target.homepage_url;
  if (!homepageUrl) throw new Error('A homepage URL is required to review a target.');

  const discovery = await discoverDistributionTargetPages(homepageUrl);
  const analysis = analyzeDistributionTarget(discovery);
  const snapshotPayload = buildSnapshotPayload({
    targetId,
    discovery,
    analysis,
    observedAt,
    ruleVersion: Number(target.current_rule_version || 0) + 1,
  });
  const snapshotHash = stableHash(snapshotPayload);

  const { data: latestSnapshot, error: latestSnapshotError } = await supabase
    .from('distribution_target_snapshots')
    .select('id, rule_version, snapshot_hash')
    .eq('target_id', targetId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (latestSnapshotError) throw new Error(latestSnapshotError.message);

  const nextRuleVersion =
    latestSnapshot && latestSnapshot.snapshot_hash === snapshotHash
      ? Number(latestSnapshot.rule_version || 1)
      : Number(latestSnapshot?.rule_version || 0) + 1;
  const versionChanged = !latestSnapshot || latestSnapshot.snapshot_hash !== snapshotHash;
  const nextReviewAt = deriveNextReviewAt(analysis);
  const targetStatus = deriveTargetStatus(analysis, String(target.target_status || 'active')) as DistributionTargetDiscoveryResult['targetStatus'];
  const snapshotRow = {
    target_id: targetId,
    page_url: discovery.finalUrl,
    http_status: null,
    content_hash: snapshotHash,
    page_title: discovery.signals.homepageTitle || discovery.pages[0]?.title || null,
    rule_version: nextRuleVersion,
    analysis_json: snapshotPayload,
    obstacle_status: analysis.obstacleStatus,
    next_review_at: nextReviewAt,
    review_reason: analysis.summary,
    discovered_page_count: discovery.pages.length,
    visible_rules: analysis.snapshot.visibleRules,
    pricing_info: analysis.snapshot.pricingInfo,
    form_fields: analysis.snapshot.formFields,
    requires_account: discovery.requirements.requiresAccount,
    requires_captcha: discovery.requirements.requiresCaptcha,
    notes: analysis.snapshot.notes.join(' · '),
    metadata: {
      source: 'distribution-target-review',
      homepageUrl,
      blockedReasons: analysis.blockedReasons,
      nextAction: analysis.nextAction,
    },
    fetched_at: observedAt,
  };

  if (input.dryRun) {
    return {
      targetId,
      snapshotId: null,
      ruleVersion: nextRuleVersion,
      snapshotHash,
      versionChanged,
      obstacleStatus: analysis.obstacleStatus,
      nextReviewAt,
      targetStatus,
      dryRun: true,
    };
  }

  const { data: insertedSnapshot, error: snapshotError } = await supabase
    .from('distribution_target_snapshots')
    .insert(snapshotRow)
    .select('id')
    .single();
  if (snapshotError) throw new Error(snapshotError.message);

  const requirementRows = buildDistributionTargetRequirementRecords(analysis, targetId, insertedSnapshot.id);
  const { error: deleteError } = await supabase.from('distribution_target_requirements').delete().eq('target_id', targetId);
  if (deleteError) throw new Error(deleteError.message);

  if (requirementRows.length > 0) {
    const { error: requirementError } = await supabase.from('distribution_target_requirements').insert(requirementRows);
    if (requirementError) throw new Error(requirementError.message);
  }

  const { error: targetUpdateError } = await supabase
    .from('distribution_targets')
    .update({
      homepage_url: discovery.homepageUrl,
      submission_url: discovery.submissionUrl,
      registration_url: discovery.registrationUrl,
      pricing_url: discovery.pricingUrl,
      target_status: targetStatus,
      requires_account: discovery.requirements.requiresAccount,
      requires_payment: discovery.requirements.requiresPayment,
      requires_captcha: discovery.requirements.requiresCaptcha,
      requires_backlink: discovery.requirements.requiresBacklink,
      editorial_review: discovery.requirements.editorialReview,
      expected_review_days: discovery.requirements.expectedReviewDays,
      last_checked_at: observedAt,
      next_check_at: nextReviewAt,
      confidence: Math.max(analysis.rules[0]?.confidence || 50, discovery.pages[0]?.score || 50),
      notes: analysis.summary,
      metadata: {
        ...(target as Record<string, unknown>),
        lastSnapshotHash: snapshotHash,
        lastSnapshotId: insertedSnapshot.id,
        ruleVersion: nextRuleVersion,
        obstacleStatus: analysis.obstacleStatus,
        nextAction: analysis.nextAction,
      },
      current_snapshot_id: insertedSnapshot.id,
      current_rule_version: nextRuleVersion,
      last_review_reason: analysis.summary,
      updated_at: observedAt,
    })
    .eq('id', targetId);
  if (targetUpdateError) throw new Error(targetUpdateError.message);

  return {
    targetId,
    snapshotId: insertedSnapshot.id,
    ruleVersion: nextRuleVersion,
    snapshotHash,
    versionChanged,
    obstacleStatus: analysis.obstacleStatus,
    nextReviewAt,
    targetStatus,
    dryRun: false,
  };
}
