import { createHash } from 'node:crypto';

import { queryDatabase } from '@/lib/services/database';

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
  const observedAt = input.observedAt || new Date().toISOString();
  const targetId = normalizeText(input.targetId);
  if (!targetId) throw new Error('targetId is required.');

  const [target] = await queryDatabase<{
    id: string;
    homepage_url: string;
    target_status: string | null;
    current_rule_version: number | null;
  }>(
    'select id, homepage_url, target_status, current_rule_version from distribution_targets where id = $1 limit 1',
    [targetId],
  );
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

  const [latestSnapshot] = await queryDatabase<{
    id: string;
    rule_version: number | null;
    snapshot_hash: string | null;
  }>(
    'select id, rule_version, snapshot_hash from distribution_target_snapshots where target_id = $1 order by created_at desc limit 1',
    [targetId],
  );

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

  const [insertedSnapshot] = await queryDatabase<{ id: string }>(
    `
      insert into distribution_target_snapshots (
        target_id,
        page_url,
        http_status,
        content_hash,
        page_title,
        rule_version,
        analysis_json,
        obstacle_status,
        next_review_at,
        review_reason,
        discovered_page_count,
        visible_rules,
        pricing_info,
        form_fields,
        requires_account,
        requires_captcha,
        notes,
        metadata,
        fetched_at
      ) values (
        $1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10, $11, $12::jsonb, $13::jsonb, $14::jsonb, $15, $16, $17, $18::jsonb, $19
      )
      returning id
    `,
    [
      targetId,
      snapshotRow.page_url,
      snapshotRow.http_status,
      snapshotRow.content_hash,
      snapshotRow.page_title,
      snapshotRow.rule_version,
      JSON.stringify(snapshotRow.analysis_json),
      snapshotRow.obstacle_status,
      snapshotRow.next_review_at,
      snapshotRow.review_reason,
      snapshotRow.discovered_page_count,
      JSON.stringify(snapshotRow.visible_rules),
      JSON.stringify(snapshotRow.pricing_info),
      JSON.stringify(snapshotRow.form_fields),
      snapshotRow.requires_account,
      snapshotRow.requires_captcha,
      snapshotRow.notes,
      JSON.stringify(snapshotRow.metadata),
      snapshotRow.fetched_at,
    ],
  );

  const requirementRows = buildDistributionTargetRequirementRecords(analysis, targetId, insertedSnapshot.id);

  await queryDatabase('delete from distribution_target_requirements where target_id = $1', [targetId]);

  if (requirementRows.length > 0) {
    for (const requirement of requirementRows) {
      await queryDatabase(
        `
          insert into distribution_target_requirements (
            target_id,
            source_snapshot_id,
            required_field,
            field_type,
            character_limit,
            allowed_values,
            required_asset,
            rule_text,
            source_url,
            confidence,
            notes,
            metadata
          ) values (
            $1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9, $10, $11, $12::jsonb
          )
          on conflict (target_id, required_field, source_url)
          do update set
            source_snapshot_id = excluded.source_snapshot_id,
            field_type = excluded.field_type,
            character_limit = excluded.character_limit,
            allowed_values = excluded.allowed_values,
            required_asset = excluded.required_asset,
            rule_text = excluded.rule_text,
            confidence = excluded.confidence,
            notes = excluded.notes,
            metadata = excluded.metadata,
            updated_at = now()
        `,
        [
          requirement.target_id,
          requirement.source_snapshot_id,
          requirement.required_field,
          requirement.field_type,
          requirement.character_limit,
          JSON.stringify(requirement.allowed_values),
          requirement.required_asset,
          requirement.rule_text,
          requirement.source_url,
          requirement.confidence,
          requirement.notes,
          JSON.stringify(requirement.metadata),
        ],
      );
    }
  }

  await queryDatabase(
    `
      update distribution_targets
      set
        homepage_url = $2,
        submission_url = $3,
        registration_url = $4,
        pricing_url = $5,
        target_status = $6,
        requires_account = $7,
        requires_payment = $8,
        requires_captcha = $9,
        requires_backlink = $10,
        editorial_review = $11,
        expected_review_days = $12,
        last_checked_at = $13,
        next_check_at = $14,
        confidence = $15,
        notes = $16,
        metadata = $17::jsonb,
        current_snapshot_id = $18,
        current_rule_version = $19,
        last_review_reason = $20,
        updated_at = $21
      where id = $1
    `,
    [
      targetId,
      discovery.homepageUrl,
      discovery.submissionUrl,
      discovery.registrationUrl,
      discovery.pricingUrl,
      targetStatus,
      discovery.requirements.requiresAccount,
      discovery.requirements.requiresPayment,
      discovery.requirements.requiresCaptcha,
      discovery.requirements.requiresBacklink,
      discovery.requirements.editorialReview,
      discovery.requirements.expectedReviewDays,
      observedAt,
      nextReviewAt,
      Math.max(analysis.rules[0]?.confidence || 50, discovery.pages[0]?.score || 50),
      analysis.summary,
      JSON.stringify({
        ...(target as Record<string, unknown>),
        lastSnapshotHash: snapshotHash,
        lastSnapshotId: insertedSnapshot.id,
        ruleVersion: nextRuleVersion,
        obstacleStatus: analysis.obstacleStatus,
        nextAction: analysis.nextAction,
      }),
      insertedSnapshot.id,
      nextRuleVersion,
      analysis.summary,
      observedAt,
    ],
  );

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
