import type { DecisionToolIdentity } from './repository';

type Row = Record<string, unknown>;
type Localized = Record<string, string>;

export interface TaskPageEvidence {
  sourceUrl: string;
  verifiedAt: string;
  reviewDueAt: string | null;
}

export interface TaskPageCapability {
  name: Localized;
  rationale: Localized;
  importance: 'required' | 'preferred';
  reviewedAt: string;
  reviewDueAt: string;
}

export interface TaskPageTool {
  identity: DecisionToolIdentity;
  fitLevel: 'strong' | 'conditional';
  rationale: Localized;
  requiredConditions: Localized[];
  disqualifiers: Localized[];
  reviewedAt: string;
  reviewDueAt: string;
  evidence: TaskPageEvidence[];
}

export interface TaskPageModel {
  slug: string;
  name: Localized;
  description: Localized;
  constraintSchema: Record<string, unknown>;
  capabilities: TaskPageCapability[];
  tools: TaskPageTool[];
}

const FIRST_WAVE_TASKS = new Set([
  'product-image-to-short-video',
  'meeting-notes',
  'brand-constrained-marketing-content',
  'build-app-with-ai',
  'research-with-citations',
  'ai-voiceover',
]);

function object(value: unknown): Row {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Row) : {};
}

function localized(value: unknown): Localized {
  return Object.fromEntries(
    Object.entries(object(value)).filter(
      (entry): entry is [string, string] => typeof entry[1] === 'string' && entry[1].trim().length > 0,
    ),
  );
}

function localizedList(value: unknown): Localized[] {
  return Array.isArray(value) ? value.map(localized).filter((item) => Object.keys(item).length > 0) : [];
}

function date(value: unknown): string | null {
  return typeof value === 'string' && Number.isFinite(Date.parse(value)) ? value : null;
}

function currentWindow(row: Row, now: Date): boolean {
  const reviewed = date(row.reviewed_at);
  const due = date(row.review_due_at);
  return Boolean(reviewed && due && Date.parse(reviewed) <= now.getTime() && Date.parse(due) > now.getTime());
}

function activeClaim(claim: Row, profile: Row | undefined, toolId: string, now: Date): TaskPageEvidence | null {
  const sourceUrl = claim.source_url;
  const verifiedAt = date(claim.verified_at);
  const reviewDueAt = date(claim.review_due_at);
  const expiresAt = date(claim.expires_at);
  if (
    !profile ||
    profile.owner_type !== 'tool' ||
    profile.owner_id !== toolId ||
    claim.verification_status !== 'verified' ||
    claim.conflict_status !== 'none' ||
    claim.invalidated_at ||
    !verifiedAt ||
    Date.parse(verifiedAt) > now.getTime() ||
    (claim.review_due_at && (!reviewDueAt || Date.parse(reviewDueAt) <= now.getTime())) ||
    (claim.expires_at && (!expiresAt || Date.parse(expiresAt) <= now.getTime())) ||
    typeof sourceUrl !== 'string'
  ) {
    return null;
  }
  try {
    if (!['http:', 'https:'].includes(new URL(sourceUrl).protocol)) return null;
  } catch {
    return null;
  }
  return { sourceUrl, verifiedAt, reviewDueAt };
}

export function deriveTaskPageReadModel(
  input: {
    task: Row | null;
    taskCapabilities: Row[];
    capabilities: Row[];
    fits: Row[];
    fitClaimLinks: Row[];
    claims: Row[];
    profiles: Row[];
    identities: DecisionToolIdentity[];
  },
  now: Date = new Date(),
): TaskPageModel | null {
  const { task } = input;
  if (
    !task ||
    task.status !== 'active' ||
    !FIRST_WAVE_TASKS.has(String(task.slug)) ||
    !localized(task.name).en ||
    !localized(task.description).en
  ) {
    return null;
  }

  const capabilityById = new Map(input.capabilities.map((row) => [String(row.id), row]));
  const planned = input.taskCapabilities.filter(
    (row) => row.importance === 'required' || row.importance === 'preferred',
  );
  if (!planned.some((row) => row.importance === 'required') || !planned.some((row) => row.importance === 'preferred')) {
    return null;
  }
  if (
    !planned.every((row) => {
      const capability = capabilityById.get(String(row.capability_id));
      return !(
        row.task_id !== task.id ||
        row.status !== 'published' ||
        !currentWindow(row, now) ||
        !capability ||
        capability.status !== 'active' ||
        !localized(capability.name).en ||
        !localized(row.rationale).en
      );
    })
  ) {
    return null;
  }
  const capabilities: TaskPageCapability[] = planned.map((row) => ({
    name: localized(capabilityById.get(String(row.capability_id))?.name),
    rationale: localized(row.rationale),
    importance: row.importance as TaskPageCapability['importance'],
    reviewedAt: String(row.reviewed_at),
    reviewDueAt: String(row.review_due_at),
  }));

  const identities = new Map(input.identities.map((identity) => [identity.id, identity]));
  const claims = new Map(input.claims.map((row) => [String(row.id), row]));
  const profiles = new Map(input.profiles.map((row) => [String(row.id), row]));
  const links = new Map<string, string[]>();
  input.fitClaimLinks.forEach((link) => {
    const fitId = String(link.fit_id || '');
    links.set(fitId, [...(links.get(fitId) || []), String(link.claim_id || '')]);
  });
  const usedIds = new Set<string>();
  const usedSlugs = new Set<string>();
  const tools: TaskPageTool[] = input.fits.flatMap((fit): TaskPageTool[] => {
    const toolId = String(fit.tool_id || '');
    const identity = identities.get(toolId);
    if (
      fit.task_id !== task.id ||
      fit.status !== 'published' ||
      !currentWindow(fit, now) ||
      (fit.fit_level !== 'strong' && fit.fit_level !== 'conditional') ||
      !localized(fit.rationale).en ||
      !identity ||
      !identity.slug ||
      !identity.title ||
      usedIds.has(toolId) ||
      usedSlugs.has(identity.slug)
    ) {
      return [];
    }
    const evidence = (links.get(String(fit.id)) || []).flatMap((claimId) => {
      const claim = claims.get(claimId);
      const result = claim && activeClaim(claim, profiles.get(String(claim.profile_id)), toolId, now);
      return result ? [result] : [];
    });
    if (evidence.length === 0) return [];
    usedIds.add(toolId);
    usedSlugs.add(identity.slug);
    return [
      {
        identity,
        fitLevel: fit.fit_level,
        rationale: localized(fit.rationale),
        requiredConditions: localizedList(fit.required_conditions),
        disqualifiers: localizedList(fit.disqualifiers),
        reviewedAt: String(fit.reviewed_at),
        reviewDueAt: String(fit.review_due_at),
        evidence,
      },
    ];
  });
  if (tools.length < 3) return null;
  tools.sort(
    (a, b) =>
      Number(b.fitLevel === 'strong') - Number(a.fitLevel === 'strong') ||
      a.identity.title.localeCompare(b.identity.title, 'en'),
  );
  return {
    slug: String(task.slug),
    name: localized(task.name),
    description: localized(task.description),
    constraintSchema: object(task.constraint_schema),
    capabilities,
    tools: tools.slice(0, 3),
  };
}
