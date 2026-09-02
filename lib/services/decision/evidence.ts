import { createAdminClient } from '@/lib/supabase/admin';

export type DecisionEvidenceExclusionReason =
  | 'not_verified'
  | 'conflict'
  | 'invalidated'
  | 'expired'
  | 'review_due'
  | 'missing_source';

export type DecisionEditorialState = 'supported' | 'review_due' | 'unsupported';

export type DecisionEvidencePurpose =
  | 'fit'
  | 'cost'
  | 'setup'
  | 'privacy'
  | 'export'
  | 'replacement'
  | 'limitation'
  | 'other';

export interface DecisionEvidenceTrace {
  claimId: string;
  claimType: string;
  claimKey: string;
  claimValue: unknown;
  sourceUrl: string;
  sourceExcerpt: string | null;
  observedAt: string;
  verifiedAt: string | null;
  reviewDueAt: string | null;
  expiresAt: string | null;
  validityScope: Record<string, unknown>;
  canSupportDecision: boolean;
  exclusionReason: DecisionEvidenceExclusionReason | null;
}

export interface DecisionEvidenceReference extends DecisionEvidenceTrace {
  purpose: DecisionEvidencePurpose;
}

export interface DerivedToolDecisionProfile {
  toolId: string;
  profileVersion: number;
  setupComplexity: 'low' | 'medium' | 'high' | 'unknown';
  setupMinutesLow: number | null;
  setupMinutesHigh: number | null;
  dataTrainingUse: 'no' | 'opt_in' | 'opt_out' | 'yes' | 'unknown';
  selfHostLevel: 'full' | 'partial' | 'no' | 'unknown';
  exportLevel: 'full' | 'limited' | 'no' | 'unknown';
  decisionSummary: Record<string, unknown>;
  watchOuts: unknown[];
  reviewedAt: string | null;
  reviewDueAt: string | null;
  evidenceState: DecisionEditorialState;
  evidence: DecisionEvidenceReference[];
  excludedEvidence: DecisionEvidenceReference[];
}

export interface DerivedToolTaskFit {
  id: string;
  toolId: string;
  taskId: string;
  fitLevel: 'strong' | 'conditional' | 'weak' | 'not_fit';
  rationale: Record<string, unknown>;
  requiredConditions: unknown[];
  disqualifiers: unknown[];
  reviewedAt: string | null;
  reviewDueAt: string | null;
  evidenceState: DecisionEditorialState;
  evidence: DecisionEvidenceReference[];
  excludedEvidence: DecisionEvidenceReference[];
}

export interface DerivedToolRelationship {
  id: string;
  toolId: string;
  relatedToolId: string;
  relationshipType: 'replaces' | 'complements' | 'overlaps' | 'alternative';
  rationale: Record<string, unknown>;
  reviewedAt: string | null;
  reviewDueAt: string | null;
  evidenceState: DecisionEditorialState;
  evidence: DecisionEvidenceReference[];
  excludedEvidence: DecisionEvidenceReference[];
}

export interface DecisionEvidenceBundle {
  available: true;
  generatedAt: string;
  profiles: DerivedToolDecisionProfile[];
  taskFits: DerivedToolTaskFit[];
  relationships: DerivedToolRelationship[];
}

export interface UnavailableDecisionEvidenceBundle {
  available: false;
  code: 'EVIDENCE_UNAVAILABLE';
  message: string;
  generatedAt: string;
  profiles: [];
  taskFits: [];
  relationships: [];
}

export type DecisionEvidenceReadResult = DecisionEvidenceBundle | UnavailableDecisionEvidenceBundle;

type DatabaseRow = Record<string, unknown>;

interface ClaimLinkRow {
  subjectId: string;
  claimId: string;
  purpose: DecisionEvidencePurpose;
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asNullableString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

function isDue(value: unknown, now: Date): boolean {
  const date = asNullableString(value);
  if (!date) return false;
  const timestamp = new Date(date).getTime();
  return !Number.isNaN(timestamp) && timestamp <= now.getTime();
}

function isHttpUrl(value: string | null): value is string {
  return Boolean(value && /^https?:\/\//i.test(value));
}

export function deriveDecisionEvidenceTrace(row: DatabaseRow, now: Date = new Date()): DecisionEvidenceTrace {
  const verificationStatus = String(row.verification_status || 'candidate');
  const conflictStatus = String(row.conflict_status || 'none');
  const sourceUrl = asNullableString(row.source_url);

  let exclusionReason: DecisionEvidenceExclusionReason | null = null;
  if (verificationStatus !== 'verified') exclusionReason = 'not_verified';
  else if (conflictStatus !== 'none') exclusionReason = 'conflict';
  else if (asNullableString(row.invalidated_at)) exclusionReason = 'invalidated';
  else if (isDue(row.expires_at, now)) exclusionReason = 'expired';
  else if (isDue(row.review_due_at, now)) exclusionReason = 'review_due';
  else if (!isHttpUrl(sourceUrl)) exclusionReason = 'missing_source';

  return {
    claimId: String(row.id),
    claimType: String(row.claim_type || ''),
    claimKey: String(row.claim_key || ''),
    claimValue: row.claim_value,
    sourceUrl: sourceUrl || '',
    sourceExcerpt: asNullableString(row.source_excerpt),
    observedAt: String(row.observed_at || ''),
    verifiedAt: asNullableString(row.verified_at),
    reviewDueAt: asNullableString(row.review_due_at),
    expiresAt: asNullableString(row.expires_at),
    validityScope: asObject(row.validity_scope),
    canSupportDecision: exclusionReason === null,
    exclusionReason,
  };
}

function deriveEditorialState(
  reviewedAt: unknown,
  reviewDueAt: unknown,
  evidence: DecisionEvidenceTrace[],
  now: Date,
): DecisionEditorialState {
  if (!asNullableString(reviewedAt) || evidence.length === 0) return 'unsupported';
  if (isDue(reviewDueAt, now)) return 'review_due';
  return 'supported';
}

function groupEvidence(
  links: ClaimLinkRow[],
  claimsById: Map<string, DecisionEvidenceTrace>,
): Map<string, { evidence: DecisionEvidenceReference[]; excludedEvidence: DecisionEvidenceReference[] }> {
  const grouped = new Map<
    string,
    { evidence: DecisionEvidenceReference[]; excludedEvidence: DecisionEvidenceReference[] }
  >();

  for (const link of links) {
    const claim = claimsById.get(link.claimId);
    if (!claim) continue;
    const entry = grouped.get(link.subjectId) || { evidence: [], excludedEvidence: [] };
    const reference = { ...claim, purpose: link.purpose };
    if (claim.canSupportDecision) entry.evidence.push(reference);
    else entry.excludedEvidence.push(reference);
    grouped.set(link.subjectId, entry);
  }

  return grouped;
}

export function getSupportingDecisionEvidence(
  evidence: DecisionEvidenceReference[],
  purpose: DecisionEvidencePurpose,
): DecisionEvidenceReference[] {
  return evidence.filter((reference) => reference.purpose === purpose);
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function normalizeToolIds(toolIds: string[]): string[] {
  return unique(toolIds.map((toolId) => toolId.trim())).slice(0, 50);
}

export function deriveDecisionEvidenceBundle(
  input: {
    profiles: DatabaseRow[];
    taskFits: DatabaseRow[];
    relationships: DatabaseRow[];
    profileClaimLinks: ClaimLinkRow[];
    taskFitClaimLinks: ClaimLinkRow[];
    relationshipClaimLinks: ClaimLinkRow[];
    claims: DatabaseRow[];
  },
  now: Date = new Date(),
): DecisionEvidenceBundle {
  const claimsById = new Map(
    input.claims.map((claim) => {
      const trace = deriveDecisionEvidenceTrace(claim, now);
      return [trace.claimId, trace];
    }),
  );
  const profileEvidence = groupEvidence(input.profileClaimLinks, claimsById);
  const fitEvidence = groupEvidence(input.taskFitClaimLinks, claimsById);
  const relationshipEvidence = groupEvidence(input.relationshipClaimLinks, claimsById);

  return {
    available: true,
    generatedAt: now.toISOString(),
    profiles: input.profiles.map((row) => {
      const toolId = String(row.tool_id);
      const grouped = profileEvidence.get(toolId) || { evidence: [], excludedEvidence: [] };
      return {
        toolId,
        profileVersion: Number(row.profile_version || 1),
        setupComplexity: row.setup_complexity as DerivedToolDecisionProfile['setupComplexity'],
        setupMinutesLow: row.setup_minutes_low === null ? null : Number(row.setup_minutes_low),
        setupMinutesHigh: row.setup_minutes_high === null ? null : Number(row.setup_minutes_high),
        dataTrainingUse: row.data_training_use as DerivedToolDecisionProfile['dataTrainingUse'],
        selfHostLevel: row.self_host_level as DerivedToolDecisionProfile['selfHostLevel'],
        exportLevel: row.export_level as DerivedToolDecisionProfile['exportLevel'],
        decisionSummary: asObject(row.decision_summary),
        watchOuts: asArray(row.watch_outs),
        reviewedAt: asNullableString(row.reviewed_at),
        reviewDueAt: asNullableString(row.review_due_at),
        evidenceState: deriveEditorialState(row.reviewed_at, row.review_due_at, grouped.evidence, now),
        ...grouped,
      };
    }),
    taskFits: input.taskFits.map((row) => {
      const id = String(row.id);
      const grouped = fitEvidence.get(id) || { evidence: [], excludedEvidence: [] };
      return {
        id,
        toolId: String(row.tool_id),
        taskId: String(row.task_id),
        fitLevel: row.fit_level as DerivedToolTaskFit['fitLevel'],
        rationale: asObject(row.rationale),
        requiredConditions: asArray(row.required_conditions),
        disqualifiers: asArray(row.disqualifiers),
        reviewedAt: asNullableString(row.reviewed_at),
        reviewDueAt: asNullableString(row.review_due_at),
        evidenceState: deriveEditorialState(row.reviewed_at, row.review_due_at, grouped.evidence, now),
        ...grouped,
      };
    }),
    relationships: input.relationships.map((row) => {
      const id = String(row.id);
      const grouped = relationshipEvidence.get(id) || { evidence: [], excludedEvidence: [] };
      return {
        id,
        toolId: String(row.tool_id),
        relatedToolId: String(row.related_tool_id),
        relationshipType: row.relationship_type as DerivedToolRelationship['relationshipType'],
        rationale: asObject(row.rationale),
        reviewedAt: asNullableString(row.reviewed_at),
        reviewDueAt: asNullableString(row.review_due_at),
        evidenceState: deriveEditorialState(row.reviewed_at, row.review_due_at, grouped.evidence, now),
        ...grouped,
      };
    }),
  };
}

export async function getDecisionEvidenceBundle(toolIds: string[]): Promise<DecisionEvidenceReadResult> {
  const normalizedToolIds = normalizeToolIds(toolIds);
  const generatedAt = new Date();
  if (normalizedToolIds.length === 0) {
    return deriveDecisionEvidenceBundle(
      {
        profiles: [],
        taskFits: [],
        relationships: [],
        profileClaimLinks: [],
        taskFitClaimLinks: [],
        relationshipClaimLinks: [],
        claims: [],
      },
      generatedAt,
    );
  }

  try {
    const supabase = createAdminClient();
    const [profilesResult, fitsResult, relationshipsResult] = await Promise.all([
      supabase
        .from('tool_decision_profiles')
        .select(
          'tool_id, profile_version, setup_complexity, setup_minutes_low, setup_minutes_high, data_training_use, self_host_level, export_level, decision_summary, watch_outs, reviewed_at, review_due_at',
        )
        .in('tool_id', normalizedToolIds)
        .eq('editorial_status', 'published'),
      supabase
        .from('tool_task_fits')
        .select(
          'id, tool_id, task_id, fit_level, rationale, required_conditions, disqualifiers, reviewed_at, review_due_at',
        )
        .in('tool_id', normalizedToolIds)
        .eq('status', 'published'),
      supabase
        .from('tool_relationships')
        .select('id, tool_id, related_tool_id, relationship_type, rationale, reviewed_at, review_due_at')
        .in('tool_id', normalizedToolIds)
        .eq('status', 'published'),
    ]);

    const primaryError = profilesResult.error || fitsResult.error || relationshipsResult.error;
    if (primaryError) throw primaryError;

    const profiles = (profilesResult.data || []) as DatabaseRow[];
    const taskFits = (fitsResult.data || []) as DatabaseRow[];
    const relationships = (relationshipsResult.data || []) as DatabaseRow[];
    const profileIds = profiles.map((row) => String(row.tool_id));
    const fitIds = taskFits.map((row) => String(row.id));
    const relationshipIds = relationships.map((row) => String(row.id));

    const [profileLinksResult, fitLinksResult, relationshipLinksResult] = await Promise.all([
      profileIds.length
        ? supabase.from('tool_decision_profile_claims').select('tool_id, claim_id, purpose').in('tool_id', profileIds)
        : Promise.resolve({ data: [], error: null }),
      fitIds.length
        ? supabase.from('tool_task_fit_claims').select('fit_id, claim_id, purpose').in('fit_id', fitIds)
        : Promise.resolve({ data: [], error: null }),
      relationshipIds.length
        ? supabase
            .from('tool_relationship_claims')
            .select('relationship_id, claim_id, purpose')
            .in('relationship_id', relationshipIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    const linkError = profileLinksResult.error || fitLinksResult.error || relationshipLinksResult.error;
    if (linkError) throw linkError;

    const profileClaimLinks = (profileLinksResult.data || []).map((row) => ({
      subjectId: String(row.tool_id),
      claimId: String(row.claim_id),
      purpose: row.purpose as DecisionEvidencePurpose,
    }));
    const taskFitClaimLinks = (fitLinksResult.data || []).map((row) => ({
      subjectId: String(row.fit_id),
      claimId: String(row.claim_id),
      purpose: row.purpose as DecisionEvidencePurpose,
    }));
    const relationshipClaimLinks = (relationshipLinksResult.data || []).map((row) => ({
      subjectId: String(row.relationship_id),
      claimId: String(row.claim_id),
      purpose: row.purpose as DecisionEvidencePurpose,
    }));
    const claimIds = unique(
      [...profileClaimLinks, ...taskFitClaimLinks, ...relationshipClaimLinks].map((link) => link.claimId),
    );

    const claimsResult = claimIds.length
      ? await supabase
          .from('product_intelligence_claims')
          .select(
            'id, claim_type, claim_key, claim_value, source_url, source_excerpt, observed_at, verified_at, verification_status, conflict_status, review_due_at, expires_at, invalidated_at, validity_scope',
          )
          .in('id', claimIds)
      : { data: [], error: null };
    if (claimsResult.error) throw claimsResult.error;

    return deriveDecisionEvidenceBundle(
      {
        profiles,
        taskFits,
        relationships,
        profileClaimLinks,
        taskFitClaimLinks,
        relationshipClaimLinks,
        claims: (claimsResult.data || []) as DatabaseRow[],
      },
      generatedAt,
    );
  } catch (error) {
    console.error('Decision evidence read failed:', error);
    return {
      available: false,
      code: 'EVIDENCE_UNAVAILABLE',
      message: 'Verified decision evidence is temporarily unavailable.',
      generatedAt: generatedAt.toISOString(),
      profiles: [],
      taskFits: [],
      relationships: [],
    };
  }
}
