import { createAdminClient } from '@/lib/supabase/admin';

export type CapabilityGroup =
  | 'creation'
  | 'editing'
  | 'analysis'
  | 'automation'
  | 'collaboration'
  | 'governance'
  | 'delivery'
  | 'other';

export type CapabilitySupportLevel = 'strong' | 'partial' | 'limited' | 'not_supported' | 'unknown';
export type CapabilityAvailability = 'all_plans' | 'paid_only' | 'enterprise_only' | 'add_on' | 'unknown';
export type TaskCapabilityImportance = 'required' | 'preferred' | 'contextual';

export interface PublicEvidenceSummary {
  sourceUrl: string;
  verifiedAt: string | null;
  reviewDueAt: string | null;
}

export interface PublicDecisionCapability {
  id: string;
  slug: string;
  name: Record<string, string>;
  description: Record<string, string>;
  group: CapabilityGroup;
  displayOrder: number;
}

export interface PublicToolCapability {
  id: string;
  toolId: string;
  capabilityId: string;
  supportLevel: CapabilitySupportLevel;
  availability: CapabilityAvailability;
  planRequirement: Record<string, unknown>;
  limitations: unknown[];
  reviewedAt: string;
  reviewDueAt: string;
  evidence: PublicEvidenceSummary[];
}

export interface PublicTaskCapability {
  taskId: string;
  taskSlug: string;
  taskName: Record<string, string>;
  capabilityId: string;
  importance: TaskCapabilityImportance;
  rationale: Record<string, string>;
  reviewedAt: string;
  reviewDueAt: string;
}

export interface PublicDecisionCapabilityReadModel {
  generatedAt: string;
  capabilities: PublicDecisionCapability[];
  toolCapabilities: PublicToolCapability[];
  taskCapabilities: PublicTaskCapability[];
}

export interface PublicToolCapabilitySummary {
  name: Record<string, string>;
  description: Record<string, string>;
  group: CapabilityGroup;
  supportLevel: CapabilitySupportLevel;
  availability: CapabilityAvailability;
  planRequirement: Record<string, unknown>;
  limitations: unknown[];
  evidence: PublicEvidenceSummary[];
}

type Row = Record<string, unknown>;

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function asStringRecord(value: unknown): Record<string, string> {
  return Object.fromEntries(
    Object.entries(asObject(value)).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
  );
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function current(value: unknown, now: Date): value is string {
  if (typeof value !== 'string') return false;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) && timestamp > now.getTime();
}

function reviewedAtCurrent(value: unknown, now: Date): value is string {
  if (typeof value !== 'string') return false;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) && timestamp <= now.getTime();
}

function activeClaimForTool(claim: Row, profile: Row | undefined, toolId: string, now: Date): boolean {
  return Boolean(
    profile &&
      profile.owner_type === 'tool' &&
      profile.owner_id === toolId &&
      claim.verification_status === 'verified' &&
      !claim.invalidated_at &&
      claim.conflict_status === 'none' &&
      (!claim.expires_at || current(claim.expires_at, now)) &&
      (!claim.review_due_at || current(claim.review_due_at, now)) &&
      typeof claim.source_url === 'string' &&
      /^https?:\/\//i.test(claim.source_url),
  );
}

export function derivePublicDecisionCapabilityReadModel(
  input: {
    capabilities: Row[];
    toolCapabilities: Row[];
    taskCapabilities: Row[];
    tasks: Row[];
    claimLinks: Row[];
    claims: Row[];
    profiles: Row[];
  },
  now: Date = new Date(),
): PublicDecisionCapabilityReadModel {
  const activeCapabilities = input.capabilities.filter((row) => row.status === 'active');
  const activeCapabilityIds = new Set(activeCapabilities.map((row) => String(row.id)));
  const activeTasks = input.tasks.filter((row) => row.status === 'active');
  const activeTasksById = new Map(activeTasks.map((row) => [String(row.id), row]));
  const claimsById = new Map(input.claims.map((row) => [String(row.id), row]));
  const profilesById = new Map(input.profiles.map((row) => [String(row.id), row]));
  const linksByCapability = new Map<string, string[]>();

  input.claimLinks.forEach((link) => {
    const capabilityId = String(link.tool_capability_id || '');
    const claimId = String(link.claim_id || '');
    if (!capabilityId || !claimId) return;
    linksByCapability.set(capabilityId, [...(linksByCapability.get(capabilityId) || []), claimId]);
  });

  const toolCapabilities = input.toolCapabilities.flatMap((row): PublicToolCapability[] => {
    const id = String(row.id || '');
    const toolId = String(row.tool_id || '');
    const capabilityId = String(row.capability_id || '');
    if (
      row.status !== 'published' ||
      !id ||
      !toolId ||
      !activeCapabilityIds.has(capabilityId) ||
      !current(row.review_due_at, now) ||
      !reviewedAtCurrent(row.reviewed_at, now)
    ) {
      return [];
    }
    const evidence = (linksByCapability.get(id) || []).flatMap((claimId): PublicEvidenceSummary[] => {
      const claim = claimsById.get(claimId);
      const profile = claim ? profilesById.get(String(claim.profile_id)) : undefined;
      if (!claim || !activeClaimForTool(claim, profile, toolId, now)) return [];
      return [
        {
          sourceUrl: String(claim.source_url),
          verifiedAt: typeof claim.verified_at === 'string' ? claim.verified_at : null,
          reviewDueAt: typeof claim.review_due_at === 'string' ? claim.review_due_at : null,
        },
      ];
    });
    if (evidence.length === 0) return [];
    return [
      {
        id,
        toolId,
        capabilityId,
        supportLevel: row.support_level as CapabilitySupportLevel,
        availability: row.availability as CapabilityAvailability,
        planRequirement: asObject(row.plan_requirement),
        limitations: asArray(row.limitations),
        reviewedAt: row.reviewed_at,
        reviewDueAt: row.review_due_at,
        evidence,
      },
    ];
  });

  return {
    generatedAt: now.toISOString(),
    capabilities: activeCapabilities.map((row) => ({
      id: String(row.id),
      slug: String(row.slug),
      name: asStringRecord(row.name),
      description: asStringRecord(row.description),
      group: row.capability_group as CapabilityGroup,
      displayOrder: Number(row.display_order || 0),
    })),
    toolCapabilities,
    taskCapabilities: input.taskCapabilities.flatMap((row): PublicTaskCapability[] => {
      const taskId = String(row.task_id || '');
      const task = activeTasksById.get(taskId);
      if (
        row.status !== 'published' ||
        !task ||
        !activeCapabilityIds.has(String(row.capability_id || '')) ||
        !current(row.review_due_at, now) ||
        !reviewedAtCurrent(row.reviewed_at, now)
      ) {
        return [];
      }
      return [
        {
          taskId,
          taskSlug: String(task.slug),
          taskName: asStringRecord(task.name),
          capabilityId: String(row.capability_id),
          importance: row.importance as TaskCapabilityImportance,
          rationale: asStringRecord(row.rationale),
          reviewedAt: row.reviewed_at,
          reviewDueAt: row.review_due_at,
        },
      ];
    }),
  };
}

/**
 * Server-only data access for future Tool Intelligence, Task and Comparison
 * views. It deliberately returns summaries, never raw claim rows or link IDs.
 */
export async function getPublicDecisionCapabilityReadModel(
  toolId?: string,
): Promise<PublicDecisionCapabilityReadModel> {
  const now = new Date();
  const supabase = createAdminClient();
  const [capabilitiesResult, tasksResult] = await Promise.all([
    supabase
      .from('decision_capabilities')
      .select('id, slug, name, description, capability_group, display_order, status')
      .eq('status', 'active')
      .order('capability_group')
      .order('display_order')
      .order('slug'),
    toolId
      ? Promise.resolve({ data: [], error: null })
      : supabase.from('decision_tasks').select('id, slug, name, status').eq('status', 'active').order('display_order'),
  ]);
  if (capabilitiesResult.error || tasksResult.error) throw new Error('CAPABILITY_READ_UNAVAILABLE');

  const capabilities = (capabilitiesResult.data || []) as Row[];
  const capabilityIds = capabilities.map((row) => String(row.id));
  const nowIso = now.toISOString();
  const toolCapabilityQuery = supabase
    .from('tool_capabilities')
    .select(
      'id, tool_id, capability_id, support_level, availability, plan_requirement, limitations, status, reviewed_at, review_due_at',
    )
    .in('capability_id', capabilityIds)
    .eq('status', 'published')
    .not('reviewed_at', 'is', null)
    .gt('review_due_at', nowIso);
  const filteredToolCapabilityQuery = toolId ? toolCapabilityQuery.eq('tool_id', toolId) : toolCapabilityQuery;
  const [toolCapabilitiesResult, taskCapabilitiesResult] = await Promise.all([
    capabilityIds.length ? filteredToolCapabilityQuery : Promise.resolve({ data: [], error: null }),
    capabilityIds.length && !toolId
      ? supabase
          .from('task_capabilities')
          .select('task_id, capability_id, importance, rationale, status, reviewed_at, review_due_at')
          .in('capability_id', capabilityIds)
          .eq('status', 'published')
          .not('reviewed_at', 'is', null)
          .gt('review_due_at', nowIso)
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (toolCapabilitiesResult.error || taskCapabilitiesResult.error) throw new Error('CAPABILITY_READ_UNAVAILABLE');

  const toolCapabilities = (toolCapabilitiesResult.data || []) as Row[];
  const toolCapabilityIds = toolCapabilities.map((row) => String(row.id));
  const linksResult = toolCapabilityIds.length
    ? await supabase
        .from('tool_capability_claims')
        .select('tool_capability_id, claim_id')
        .in('tool_capability_id', toolCapabilityIds)
    : { data: [], error: null };
  if (linksResult.error) throw new Error('CAPABILITY_READ_UNAVAILABLE');
  const claimIds = Array.from(new Set((linksResult.data || []).map((row) => String(row.claim_id))));
  const claimsResult = claimIds.length
    ? await supabase
        .from('product_intelligence_claims')
        .select(
          'id, profile_id, source_url, verified_at, verification_status, conflict_status, invalidated_at, expires_at, review_due_at',
        )
        .in('id', claimIds)
    : { data: [], error: null };
  if (claimsResult.error) throw new Error('CAPABILITY_READ_UNAVAILABLE');
  const profileIds = Array.from(new Set((claimsResult.data || []).map((row) => String(row.profile_id))));
  const profilesResult = profileIds.length
    ? await supabase.from('product_intelligence_profiles').select('id, owner_type, owner_id').in('id', profileIds)
    : { data: [], error: null };
  if (profilesResult.error) throw new Error('CAPABILITY_READ_UNAVAILABLE');

  return derivePublicDecisionCapabilityReadModel(
    {
      capabilities,
      toolCapabilities,
      taskCapabilities: (taskCapabilitiesResult.data || []) as Row[],
      tasks: (tasksResult.data || []) as Row[],
      claimLinks: (linksResult.data || []) as Row[],
      claims: (claimsResult.data || []) as Row[],
      profiles: (profilesResult.data || []) as Row[],
    },
    now,
  );
}

/** A single-tool public projection: no claim, profile, link, or capability IDs leave this function. */
export function derivePublicToolCapabilitySummaries(
  model: PublicDecisionCapabilityReadModel,
  toolId: string,
): PublicToolCapabilitySummary[] {
  const capabilities = new Map(model.capabilities.map((capability) => [capability.id, capability]));
  return model.toolCapabilities
    .filter((relation) => relation.toolId === toolId)
    .sort(
      (left, right) =>
        (capabilities.get(left.capabilityId)?.displayOrder || 0) -
        (capabilities.get(right.capabilityId)?.displayOrder || 0),
    )
    .flatMap((relation): PublicToolCapabilitySummary[] => {
      const capability = capabilities.get(relation.capabilityId);
      if (!capability) return [];
      return [
        {
          name: capability.name,
          description: capability.description,
          group: capability.group,
          supportLevel: relation.supportLevel,
          availability: relation.availability,
          planRequirement: relation.planRequirement,
          limitations: relation.limitations,
          evidence: relation.evidence,
        },
      ];
    });
}

export async function getPublicToolCapabilitySummaries(toolId: string): Promise<PublicToolCapabilitySummary[]> {
  if (!/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(toolId)) return [];
  return derivePublicToolCapabilitySummaries(await getPublicDecisionCapabilityReadModel(toolId), toolId);
}
