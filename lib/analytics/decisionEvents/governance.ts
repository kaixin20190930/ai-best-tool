export const DECISION_EVENT_RAW_RETENTION_DAYS = 35 as const;
export const DECISION_EVENT_ROLLUP_RETENTION_DAYS = 400 as const;
export const DECISION_EVENT_OPERATION_AUDIT_RETENTION_DAYS = 90 as const;
export const DECISION_EVENT_MIN_HUMAN_FLOWS = 20 as const;
export const DECISION_EVENT_INTERNAL_TOKEN_ROTATION_DAYS = 30 as const;
export const DECISION_EVENT_INTERNAL_TOKEN_OVERLAP_HOURS = 24 as const;

export const DECISION_EVENT_PILOT_ID = 'meeting-follow-up-v1' as const;
export const DECISION_EVENT_PILOT_TASK_SLUG = 'meeting-notes' as const;

export type DecisionEventPilotPageKind = 'finder' | 'tool' | 'guide';

export interface DecisionEventPilotPage {
  path: string;
  kind: DecisionEventPilotPageKind;
  toolSlug?: string;
  requiresPublishedEntity: boolean;
  requiresVerifiedEvidence: boolean;
}

export const decisionEventPilotPages: readonly DecisionEventPilotPage[] = [
  {
    path: '/find-tools',
    kind: 'finder',
    requiresPublishedEntity: false,
    requiresVerifiedEvidence: false,
  },
  {
    path: '/ai/fathom',
    kind: 'tool',
    toolSlug: 'fathom',
    requiresPublishedEntity: true,
    requiresVerifiedEvidence: true,
  },
  {
    path: '/ai/otter-ai',
    kind: 'tool',
    toolSlug: 'otter-ai',
    requiresPublishedEntity: true,
    requiresVerifiedEvidence: true,
  },
  {
    path: '/ai/fireflies',
    kind: 'tool',
    toolSlug: 'fireflies',
    requiresPublishedEntity: true,
    requiresVerifiedEvidence: true,
  },
  {
    path: '/guides/ai-tools-for-meeting-notes',
    kind: 'guide',
    requiresPublishedEntity: false,
    requiresVerifiedEvidence: true,
  },
] as const;

export interface DecisionEventPilotPageEvidence {
  routeExists: boolean;
  publishedEntity: boolean;
  verifiedEvidenceCount: number;
}

export interface DecisionEventPilotPreflightInput {
  collectionEnabled: boolean;
  foundationMigrationApplied: boolean;
  governanceMigrationApplied: boolean;
  retentionOperationConfigured: boolean;
  aggregateReaderConfigured: boolean;
  internalTrafficExclusionReady: boolean;
  activeTaskSlugs: readonly string[];
  pages: Readonly<Record<string, DecisionEventPilotPageEvidence | undefined>>;
}

export type DecisionEventPilotBlockerCode =
  | 'collection_not_enabled'
  | 'foundation_migration_missing'
  | 'governance_migration_missing'
  | 'retention_operation_missing'
  | 'aggregate_reader_missing'
  | 'internal_traffic_exclusion_missing'
  | 'task_cluster_missing'
  | 'route_missing'
  | 'published_entity_missing'
  | 'verified_evidence_missing';

export interface DecisionEventPilotBlocker {
  code: DecisionEventPilotBlockerCode;
  path?: string;
}

export interface DecisionEventPilotPreflightResult {
  ready: boolean;
  pilotId: typeof DECISION_EVENT_PILOT_ID;
  taskSlug: typeof DECISION_EVENT_PILOT_TASK_SLUG;
  blockers: DecisionEventPilotBlocker[];
}

export function evaluateDecisionEventPilot(input: DecisionEventPilotPreflightInput): DecisionEventPilotPreflightResult {
  const blockers: DecisionEventPilotBlocker[] = [];

  if (!input.collectionEnabled) blockers.push({ code: 'collection_not_enabled' });
  if (!input.foundationMigrationApplied) blockers.push({ code: 'foundation_migration_missing' });
  if (!input.governanceMigrationApplied) blockers.push({ code: 'governance_migration_missing' });
  if (!input.retentionOperationConfigured) blockers.push({ code: 'retention_operation_missing' });
  if (!input.aggregateReaderConfigured) blockers.push({ code: 'aggregate_reader_missing' });
  if (!input.internalTrafficExclusionReady) blockers.push({ code: 'internal_traffic_exclusion_missing' });
  if (!input.activeTaskSlugs.includes(DECISION_EVENT_PILOT_TASK_SLUG)) {
    blockers.push({ code: 'task_cluster_missing' });
  }

  blockers.push(
    ...decisionEventPilotPages.flatMap((page): DecisionEventPilotBlocker[] => {
      const evidence = input.pages[page.path];
      if (!evidence?.routeExists) {
        return [{ code: 'route_missing', path: page.path }];
      }
      const pageBlockers: DecisionEventPilotBlocker[] = [];
      if (page.requiresPublishedEntity && !evidence.publishedEntity) {
        pageBlockers.push({ code: 'published_entity_missing', path: page.path });
      }
      if (page.requiresVerifiedEvidence && evidence.verifiedEvidenceCount < 1) {
        pageBlockers.push({ code: 'verified_evidence_missing', path: page.path });
      }
      return pageBlockers;
    }),
  );

  return {
    ready: blockers.length === 0,
    pilotId: DECISION_EVENT_PILOT_ID,
    taskSlug: DECISION_EVENT_PILOT_TASK_SLUG,
    blockers,
  };
}
