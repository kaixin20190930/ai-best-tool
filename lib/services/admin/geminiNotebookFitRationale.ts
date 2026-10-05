export const GEMINI_NOTEBOOK_FIT_RATIONALE_GATE = {
  profileId: 'c7890701-0000-4000-8000-000000000001',
  fitId: 'c7890701-0000-4000-8000-000000000301',
  taskId: '527fe8b7-c171-4c50-ab1f-9404d7536e7c',
  toolId: 'cec78907-e2a1-4eb7-853a-a58334026280',
  capabilityIds: [
    'c7890701-0000-4000-8000-000000000201',
    'c7890701-0000-4000-8000-000000000202',
  ],
  claimIds: Array.from({ length: 10 }, (_, index) =>
    `c7890701-0000-4000-8000-0000000004${String(index + 1).padStart(2, '0')}`,
  ),
  decisionLinks: [
    'c7890701-0000-4000-8000-000000000402|fit',
    'c7890701-0000-4000-8000-000000000404|limitation',
    'c7890701-0000-4000-8000-000000000407|cost',
    'c7890701-0000-4000-8000-000000000409|privacy',
    'c7890701-0000-4000-8000-000000000406|export',
  ],
  capabilityLinks: [
    'c7890701-0000-4000-8000-000000000201|c7890701-0000-4000-8000-000000000403|support',
    'c7890701-0000-4000-8000-000000000201|c7890701-0000-4000-8000-000000000407|availability',
    'c7890701-0000-4000-8000-000000000201|c7890701-0000-4000-8000-000000000408|plan',
    'c7890701-0000-4000-8000-000000000201|c7890701-0000-4000-8000-000000000404|limitation',
    'c7890701-0000-4000-8000-000000000201|c7890701-0000-4000-8000-000000000405|limitation',
    'c7890701-0000-4000-8000-000000000202|c7890701-0000-4000-8000-000000000402|support',
    'c7890701-0000-4000-8000-000000000202|c7890701-0000-4000-8000-000000000407|availability',
    'c7890701-0000-4000-8000-000000000202|c7890701-0000-4000-8000-000000000407|plan',
    'c7890701-0000-4000-8000-000000000202|c7890701-0000-4000-8000-000000000404|limitation',
    'c7890701-0000-4000-8000-000000000202|c7890701-0000-4000-8000-000000000405|limitation',
  ],
  fitLinks: [
    'c7890701-0000-4000-8000-000000000402|fit',
    'c7890701-0000-4000-8000-000000000403|fit',
    'c7890701-0000-4000-8000-000000000404|limitation',
    'c7890701-0000-4000-8000-000000000405|limitation',
    'c7890701-0000-4000-8000-000000000409|privacy',
    'c7890701-0000-4000-8000-000000000410|privacy',
  ],
} as const;

export const GEMINI_NOTEBOOK_APPROVED_FIT_RATIONALE = {
  en: 'Use Gemini Notebook to synthesize sources the user selects or supplies and imports into a notebook; it can discover some Web or Drive sources for selection, but it is not open-web search.',
  cn: '用于综合用户选择/提供并导入 notebook 的资料；也可发现部分网页或云端硬盘来源供选择，不等同于开放网页检索。',
} as const;

type Row = Record<string, unknown>;

export type GeminiNotebookFitRationaleSnapshot = {
  fit: Row | null;
  fitsForTool: Row[];
  profile: Row | null;
  decisions: Row[];
  capabilities: Row[];
  claims: Row[];
  sources: Row[];
  decisionLinks: Row[];
  capabilityLinks: Row[];
  fitLinks: Row[];
};

const idSet = (values: readonly unknown[]) => [...values].map(String).sort();
const sameSet = (actual: readonly unknown[], expected: readonly string[]) =>
  actual.length === expected.length && idSet(actual).every((value, index) => value === [...expected].sort()[index]);
const dateIsCurrent = (value: unknown, now: number) => {
  if (typeof value !== 'string') return false;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) && timestamp <= now;
};
const dueDateIsCurrent = (value: unknown, now: number) => {
  if (typeof value !== 'string') return false;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) && timestamp > now;
};

function exactRows(rows: Row[], expectedIds: readonly string[], idKey = 'id') {
  return rows.length === expectedIds.length && sameSet(rows.map((row) => row[idKey]), expectedIds);
}

function exactCompositeRows(rows: Row[], expected: readonly string[], fields: readonly string[]) {
  const actual = rows.map((row) => fields.map((field) => String(row[field])).join('|'));
  return rows.length === expected.length && sameSet(actual, expected);
}

export function validateGeminiNotebookFitRationaleSnapshot(
  snapshot: GeminiNotebookFitRationaleSnapshot,
  now = Date.now(),
): string | null {
  const { fit, profile } = snapshot;
  if (
    !fit ||
    fit.id !== GEMINI_NOTEBOOK_FIT_RATIONALE_GATE.fitId ||
    fit.task_id !== GEMINI_NOTEBOOK_FIT_RATIONALE_GATE.taskId ||
    fit.tool_id !== GEMINI_NOTEBOOK_FIT_RATIONALE_GATE.toolId ||
    !['draft', 'reviewed'].includes(String(fit.status)) ||
    (fit.status === 'reviewed' &&
      (!fit.rationale ||
        typeof fit.rationale !== 'object' ||
        (fit.rationale as Row).en !== GEMINI_NOTEBOOK_APPROVED_FIT_RATIONALE.en ||
        (fit.rationale as Row).cn !== GEMINI_NOTEBOOK_APPROVED_FIT_RATIONALE.cn))
  ) {
    return 'Gemini Notebook Fit identity or status drifted; no changes were made.';
  }
  if (!fit.updated_at || !dateIsCurrent(fit.updated_at, now)) {
    return 'Gemini Notebook Fit has no valid concurrency version; no changes were made.';
  }
  if (!exactRows(snapshot.fitsForTool, [GEMINI_NOTEBOOK_FIT_RATIONALE_GATE.fitId])) {
    return 'Gemini Notebook must have exactly its expected Fit; no changes were made.';
  }
  if (
    !profile ||
    profile.id !== GEMINI_NOTEBOOK_FIT_RATIONALE_GATE.profileId ||
    profile.owner_type !== 'tool' ||
    profile.owner_id !== GEMINI_NOTEBOOK_FIT_RATIONALE_GATE.toolId ||
    profile.profile_status !== 'ready' ||
    !dueDateIsCurrent(profile.next_review_at, now)
  ) {
    return 'Gemini Notebook evidence profile identity drifted; no changes were made.';
  }
  if (
    !exactRows(snapshot.decisions, [GEMINI_NOTEBOOK_FIT_RATIONALE_GATE.toolId], 'tool_id') ||
    snapshot.decisions.some(
      (row) =>
        row.editorial_status !== 'reviewed' ||
        !row.reviewed_by ||
        !dateIsCurrent(row.reviewed_at, now) ||
        !dueDateIsCurrent(row.review_due_at, now),
    )
  ) {
    return 'Gemini Notebook Decision must have a current reviewed status; no changes were made.';
  }
  if (
    !exactRows(snapshot.capabilities, GEMINI_NOTEBOOK_FIT_RATIONALE_GATE.capabilityIds) ||
    snapshot.capabilities.some(
      (row) =>
        row.tool_id !== GEMINI_NOTEBOOK_FIT_RATIONALE_GATE.toolId ||
        row.status !== 'reviewed' ||
        !row.reviewed_by ||
        !dateIsCurrent(row.reviewed_at, now) ||
        !dueDateIsCurrent(row.review_due_at, now),
    )
  ) {
    return 'Both Gemini Notebook Tool Capabilities must have a current reviewed status; no changes were made.';
  }
  if (
    !exactRows(snapshot.claims, GEMINI_NOTEBOOK_FIT_RATIONALE_GATE.claimIds) ||
    snapshot.claims.some(
      (claim) =>
        claim.profile_id !== GEMINI_NOTEBOOK_FIT_RATIONALE_GATE.profileId ||
        claim.source_type !== 'official' ||
        claim.verification_status !== 'verified' ||
        claim.conflict_status !== 'none' ||
        claim.invalidated_at !== null ||
        !claim.verified_by ||
        !dateIsCurrent(claim.verified_at, now) ||
        !dueDateIsCurrent(claim.review_due_at, now) ||
        (claim.expires_at !== null && !dueDateIsCurrent(claim.expires_at, now)),
    )
  ) {
    return 'All ten current official Gemini Notebook claims must be verified; no changes were made.';
  }
  const sourcesById = new Map(snapshot.sources.map((source) => [String(source.id), source]));
  if (
    snapshot.sources.length !== 7 ||
    snapshot.sources.some(
      (source) =>
        source.profile_id !== GEMINI_NOTEBOOK_FIT_RATIONALE_GATE.profileId ||
        source.source_type !== 'official' ||
        source.fetch_status !== 'success' ||
        !dateIsCurrent(source.last_verified_at, now),
    ) ||
    snapshot.claims.some((claim) => {
      const source = sourcesById.get(String(claim.source_id));
      return !source || claim.source_url !== source.url || claim.source_type !== source.source_type;
    })
  ) {
    return 'Official Gemini Notebook source verification is incomplete; no changes were made.';
  }
  if (
    !exactCompositeRows(snapshot.decisionLinks, GEMINI_NOTEBOOK_FIT_RATIONALE_GATE.decisionLinks, ['claim_id', 'purpose']) ||
    !exactCompositeRows(
      snapshot.capabilityLinks,
      GEMINI_NOTEBOOK_FIT_RATIONALE_GATE.capabilityLinks,
      ['tool_capability_id', 'claim_id', 'purpose'],
    ) ||
    !exactCompositeRows(snapshot.fitLinks, GEMINI_NOTEBOOK_FIT_RATIONALE_GATE.fitLinks, ['claim_id', 'purpose'])
  ) {
    return 'Gemini Notebook evidence relationships must match the exact 5/10/6 package; no changes were made.';
  }
  return null;
}

export function fitConditionalUpdateSucceeded(updated: unknown) {
  return Boolean(updated && typeof updated === 'object');
}
