import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadEnvConfig } from '@next/env';

import {
  buildIntelligenceReviewSchedule,
  getLatestReviewAt,
  getLatestTimelineReviewAt,
  isIntelligenceReviewApplicable,
  type IntelligenceReviewState,
  type IntelligenceReviewType,
} from '@/lib/services/intelligence/reviewSchedule';
import { createAdminClient } from '@/lib/supabase/admin';

loadEnvConfig(process.cwd());

type ProfileRow = {
  id: string;
  owner_type: string;
  product_name: string;
  last_verified_at: string | null;
  next_review_at: string | null;
  metadata: Record<string, unknown> | null;
};

type TimelineRow = {
  profile_id: string;
  review_scope: 'fact' | 'decision' | 'full';
  occurred_at: string;
  verified_at: string | null;
};

function countStates(items: Array<{ reviewType: IntelligenceReviewType; state: IntelligenceReviewState }>) {
  const result = {
    fact: { overdue: 0, dueSoon: 0, scheduled: 0, unscheduled: 0 },
    decision: { overdue: 0, dueSoon: 0, scheduled: 0, unscheduled: 0 },
  };
  for (const item of items) {
    const key = item.state === 'due_soon' ? 'dueSoon' : item.state;
    result[item.reviewType][key] += 1;
  }
  return result;
}

function hasAutomaticIntelligenceWorkflow(): boolean {
  const workflowDirectory = join(process.cwd(), '.github', 'workflows');
  return readdirSync(workflowDirectory)
    .filter((name) => name.endsWith('.yml') || name.endsWith('.yaml'))
    .some((name) => {
      const source = readFileSync(join(workflowDirectory, name), 'utf8');
      return /intelligence:sync|sync-product-intelligence|audit:intelligence-monitor/.test(source);
    });
}

async function auditIntelligenceMonitorRuntime() {
  const supabase = createAdminClient();
  const [profilesResult, timelineResult, changesResult] = await Promise.all([
    supabase
      .from('product_intelligence_profiles')
      .select('id, owner_type, product_name, last_verified_at, next_review_at, metadata')
      .order('updated_at', { ascending: false }),
    supabase
      .from('product_intelligence_timeline_events')
      .select('profile_id, review_scope, occurred_at, verified_at')
      .order('occurred_at', { ascending: false }),
    supabase.from('product_intelligence_changes').select('id, review_status', { count: 'exact' }),
  ]);
  const error = profilesResult.error || timelineResult.error || changesResult.error;
  if (error) throw new Error(`MON runtime audit failed: ${error.message}`);

  const profiles = (profilesResult.data || []) as ProfileRow[];
  const timeline = (timelineResult.data || []) as TimelineRow[];
  const schedule = profiles.flatMap((profile) => {
    const events = timeline
      .filter((event) => event.profile_id === profile.id)
      .map((event) => ({
        reviewScope: event.review_scope,
        occurredAt: event.occurred_at,
        verifiedAt: event.verified_at,
      }));
    const metadata = profile.metadata || {};
    return buildIntelligenceReviewSchedule({
      lastVerifiedAt: getLatestReviewAt(profile.last_verified_at, getLatestTimelineReviewAt(events, 'fact')),
      nextFactReviewAt: profile.next_review_at,
      lastDecisionReviewedAt: getLatestReviewAt(
        typeof metadata.decisionReviewedAt === 'string' ? metadata.decisionReviewedAt : null,
        getLatestTimelineReviewAt(events, 'decision'),
      ),
      nextDecisionReviewAt: typeof metadata.nextDecisionReviewAt === 'string' ? metadata.nextDecisionReviewAt : null,
    })
      .filter((item) => isIntelligenceReviewApplicable(item.reviewType, profile.owner_type))
      .map((item) => ({ ...item, ownerType: profile.owner_type }));
  });
  const automaticWorkflowConfigured = hasAutomaticIntelligenceWorkflow();
  const pendingChanges = (changesResult.data || []).filter((change) => change.review_status === 'pending').length;
  const stateCounts = countStates(schedule);
  const profileCountsByOwnerType = Object.fromEntries(
    [...new Set(profiles.map((profile) => profile.owner_type))]
      .sort()
      .map((ownerType) => [ownerType, profiles.filter((profile) => profile.owner_type === ownerType).length]),
  );
  const reviewCalendarByOwnerType = Object.fromEntries(
    Object.keys(profileCountsByOwnerType).map((ownerType) => [
      ownerType,
      countStates(schedule.filter((item) => item.ownerType === ownerType)),
    ]),
  );
  const toolDecisionCalendar = reviewCalendarByOwnerType.tool?.decision || {
    overdue: 0,
    dueSoon: 0,
    scheduled: 0,
    unscheduled: 0,
  };

  console.log(
    JSON.stringify(
      {
        success: true,
        generatedAt: new Date().toISOString(),
        profileCount: profiles.length,
        profileCountsByOwnerType,
        reviewCalendar: stateCounts,
        reviewCalendarByOwnerType,
        timelineReviewEvents: timeline.length,
        pendingDetectedChanges: pendingChanges,
        automaticWorkflowConfigured,
        autonomousRunLogAvailable: false,
        verdict: {
          editorialCalendarReady: profiles.length > 0 && stateCounts.fact.unscheduled === 0,
          decisionBaselineComplete: stateCounts.decision.unscheduled === 0,
          toolDecisionBaselineComplete: toolDecisionCalendar.unscheduled === 0,
          autonomousMonitoringVerified: false,
        },
        note: automaticWorkflowConfigured
          ? 'Owner-type counts separate tool decision coverage from site or distribution profiles. A repository workflow invokes the intelligence monitor, but there is no dedicated run log to prove scheduler delivery.'
          : 'Owner-type counts separate tool decision coverage from site or distribution profiles. The admin queue is a computed editorial calendar; no repository workflow currently proves autonomous crawling or recurring sync.',
      },
      null,
      2,
    ),
  );
}

auditIntelligenceMonitorRuntime().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
