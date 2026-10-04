type Row = Record<string, unknown>;

export type TaskPageGateBlocker = {
  code: string;
  subject: string;
  detail: string;
  nextStep: string;
};

export type TaskPageEditorialGateResult = {
  decision: 'PASS' | 'HOLD';
  taskSlug: string;
  checkedAt: string;
  eligibleFitCount: number;
  roles: Array<{ toolSlug: string; role: string; fitStatus: string | null; eligible: boolean }>;
  blockers: TaskPageGateBlocker[];
};

const TASK_ID = '527fe8b7-c171-4c50-ab1f-9404d7536e7c';
const EXPECTED_TOOLS = [
  {
    id: 'f15873ae-c6ef-4f0a-b811-b40c2aba76ab',
    slug: 'consensus',
    role: 'Academic paper discovery and evidence summaries',
    en: /\b(scholarly papers?|academic papers?|research papers?|peer-reviewed papers?)\b/i,
    zh: /学术论文|同行评审论文/,
  },
  {
    id: 'cec78907-e2a1-4eb7-853a-a58334026280',
    slug: 'notebooklm',
    role: 'Synthesis of user-selected notebook materials',
    en: /\b(user[- ]selected|user[- ]provided|selected) (sources?|materials?|documents?)\b|\bnotebook sources?\b/i,
    zh: /用户选择|用户选定|用户提供|导入资料|笔记本资料/,
  },
  {
    id: '3d018623-85f9-4df4-bd55-9a4a0e7a2d93',
    slug: 'perplexity',
    role: 'Open-web search and cited answers',
    en: /\bopen[- ]web\b|\bweb search\b|\bweb sources?\b/i,
    zh: /开放网页|网页检索|网页来源/,
  },
] as const;

function obj(value: unknown): Row {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Row) : {};
}

function validDate(value: unknown): number | null {
  if (typeof value !== 'string') return null;
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : null;
}

function currentReview(row: Row, now: number): boolean {
  const reviewedAt = validDate(row.reviewed_at);
  const dueAt = validDate(row.review_due_at);
  return reviewedAt !== null && dueAt !== null && reviewedAt <= now && dueAt > now;
}

function add(
  blockers: TaskPageGateBlocker[],
  code: string,
  subject: string,
  detail: string,
  nextStep: string,
) {
  blockers.push({ code, subject, detail, nextStep });
}

export function evaluateTaskPageEditorialGate(
  input: {
    task: Row | null;
    taskCapabilities: Row[];
    capabilities: Row[];
    fits: Row[];
    fitClaimLinks: Row[];
    claims: Row[];
    profiles: Row[];
    identities: Array<{ id: string; slug: string; title: string }>;
  },
  now: Date = new Date(),
): TaskPageEditorialGateResult {
  const blockers: TaskPageGateBlocker[] = [];
  const timestamp = now.toISOString();
  const task = input.task;
  if (!task || task.id !== TASK_ID || task.slug !== 'research-with-citations' || task.status !== 'active') {
    add(blockers, 'TASK_NOT_ACTIVE', 'research-with-citations', 'Expected the existing active Task row.', 'Confirm the Task identity and active status in the existing Decision graph.');
  }

  const capabilityById = new Map(input.capabilities.map((row) => [String(row.id), row]));
  const planned = input.taskCapabilities;
  if (planned.length !== 2) {
    add(blockers, 'TASK_CAPABILITY_COUNT', 'Task Capabilities', `Expected exactly 2 existing rows; found ${planned.length}.`, 'Review the two existing required Task Capability rows; do not create rows to satisfy the gate.');
  }
  for (const row of planned) {
    const subject = String(row.capability_id || 'unknown capability');
    const definition = capabilityById.get(subject);
    if (row.task_id !== TASK_ID) add(blockers, 'TASK_CAPABILITY_TASK_MISMATCH', subject, 'Relation points to a different Task.', 'Correct the existing relation through the approved Admin workflow.');
    if (row.status !== 'published') add(blockers, 'TASK_CAPABILITY_NOT_PUBLISHED', subject, `Status is ${String(row.status)}.`, 'Complete editorial review and publish this existing Task Capability using the approved workflow.');
    if (!currentReview(row, now.getTime())) add(blockers, 'TASK_CAPABILITY_NOT_CURRENT', subject, 'Review timestamps are missing, future-dated, invalid, or past due.', 'Re-review the existing Task Capability and record a valid current review window.');
    if (row.importance !== 'required' && row.importance !== 'preferred') add(blockers, 'TASK_CAPABILITY_IMPORTANCE', subject, `Importance is ${String(row.importance)}.`, 'Have the Task owner confirm the importance through editorial review.');
    if (!definition || definition.status !== 'active') add(blockers, 'TASK_CAPABILITY_DEFINITION_INACTIVE', subject, 'Capability definition is missing or inactive.', 'Restore or resolve the existing active Capability definition before page review.');
    if (!obj(row.rationale).en || typeof obj(row.rationale).en !== 'string') add(blockers, 'TASK_CAPABILITY_RATIONALE_MISSING', subject, 'English editorial rationale is missing.', 'Write and review a task-specific user value rationale in the existing relation.');
  }
  const expectedSlugs = ['research-discovery', 'citation-traceability'];
  const actualSlugs = planned.map((row) => String(capabilityById.get(String(row.capability_id))?.slug || ''));
  for (const slug of expectedSlugs) {
    if (!actualSlugs.includes(slug)) add(blockers, 'TASK_CAPABILITY_MISSING', slug, 'The expected existing research capability is absent.', 'Resolve the existing Task Capability relation with the owner; do not add a substitute capability for this gate.');
  }
  if (!planned.some((row) => row.importance === 'required')) add(blockers, 'TASK_REQUIRED_CAPABILITY_MISSING', 'Task Capabilities', 'The public Task Page requires at least one required capability.', 'Resolve importance with the Task owner before independent page QA.');
  if (!planned.some((row) => row.importance === 'preferred')) add(blockers, 'TASK_PREFERRED_CAPABILITY_MISSING', 'Task Capabilities', 'The existing public read model requires at least one preferred capability, but none is present.', 'Ask the Task owner to decide whether an existing capability is preferred; update only through the approved editorial workflow, then rerun preflight.');

  const identityById = new Map(input.identities.map((identity) => [identity.id, identity]));
  const fitsByTool = new Map<string, Row[]>();
  const expectedToolIds: Set<string> = new Set(EXPECTED_TOOLS.map((tool) => tool.id));
  for (const fit of input.fits) {
    if (fit.task_id !== TASK_ID) continue;
    const toolId = String(fit.tool_id || '');
    if (!expectedToolIds.has(toolId) && fit.status === 'published' && currentReview(fit, now.getTime())) {
      add(blockers, 'UNEXPECTED_CURRENT_PUBLISHED_FIT', String(fit.id), 'An additional current published Fit could affect which three tools the public read model renders.', 'Resolve the extra existing Fit in the relationship review before this Task Page enters independent QA.');
    }
    fitsByTool.set(toolId, [...(fitsByTool.get(toolId) || []), fit]);
  }
  const claimById = new Map(input.claims.map((claim) => [String(claim.id), claim]));
  const profileById = new Map(input.profiles.map((profile) => [String(profile.id), profile]));
  const linksByFit = new Map<string, Row[]>();
  for (const link of input.fitClaimLinks) {
    const fitId = String(link.fit_id || '');
    linksByFit.set(fitId, [...(linksByFit.get(fitId) || []), link]);
  }

  const roles: TaskPageEditorialGateResult['roles'] = [];
  let eligibleFitCount = 0;
  const seenToolIds = new Set<string>();
  for (const expected of EXPECTED_TOOLS) {
    const identity = identityById.get(expected.id);
    const candidateFits = fitsByTool.get(expected.id) || [];
    const fit = candidateFits.length === 1 ? candidateFits[0] : undefined;
    let eligible = true;
    const fail = (code: string, detail: string, nextStep: string) => {
      eligible = false;
      add(blockers, code, expected.slug, detail, nextStep);
    };
    if (!identity || identity.slug !== expected.slug) fail('TOOL_IDENTITY_MISMATCH', 'Existing published tool identity is missing or differs from the expected CL-02 product.', 'Resolve product identity with the owner before any Task Page review.');
    if (candidateFits.length !== 1) fail('FIT_COUNT_FOR_ROLE', `Expected exactly one existing Fit for this role; found ${candidateFits.length}.`, 'Review the existing relation set; do not create or duplicate a Fit to meet the three-tool threshold.');
    if (fit) {
      if (fit.task_id !== TASK_ID) fail('FIT_TASK_MISMATCH', 'Fit belongs to a different Task.', 'Correct the existing relation through the approved Admin workflow.');
      if (fit.status !== 'published') fail('FIT_NOT_PUBLISHED', `Fit status is ${String(fit.status)}.`, 'Complete independent evidence and relationship review, then use the approved relationship publication process.');
      if (!currentReview(fit, now.getTime())) fail('FIT_NOT_CURRENT', 'Fit review timestamps are missing, invalid, future-dated, or past due.', 'Re-review the existing Fit and record a valid current review window.');
      if (fit.fit_level !== 'strong' && fit.fit_level !== 'conditional') fail('FIT_LEVEL_INELIGIBLE', `Fit level is ${String(fit.fit_level)}.`, 'Have the owner review suitability; do not raise the fit level to pass the gate.');
      const rationale = obj(fit.rationale);
      const en = typeof rationale.en === 'string' ? rationale.en : '';
      const zh = typeof rationale.cn === 'string' ? rationale.cn : '';
      if (!expected.en.test(en) || !expected.zh.test(zh)) fail('ROLE_RATIONALE_NOT_DISTINCT', `Fit rationale does not explicitly ground the role in the expected source boundary: ${expected.role}.`, 'Edit the existing Fit rationale to describe the verified product role and its source boundary in English and Chinese; marketing adjectives do not satisfy this check.');

      const linkedClaims = (linksByFit.get(String(fit.id)) || []).map((link) => claimById.get(String(link.claim_id))).filter((claim): claim is Row => Boolean(claim));
      const isCurrentSameOwner = (claim: Row) => {
        const profile = profileById.get(String(claim.profile_id));
        const verified = validDate(claim.verified_at);
        const due = validDate(claim.review_due_at);
        const expiry = validDate(claim.expires_at);
        let validSourceUrl = false;
        try {
          validSourceUrl = typeof claim.source_url === 'string' && ['http:', 'https:'].includes(new URL(claim.source_url).protocol);
        } catch {
          validSourceUrl = false;
        }
        return profile?.owner_type === 'tool' && profile.owner_id === expected.id &&
          claim.verification_status === 'verified' && claim.conflict_status === 'none' && !claim.invalidated_at &&
          Boolean(claim.verified_by) && verified !== null && verified <= now.getTime() && due !== null && due > now.getTime() &&
          (!claim.expires_at || (expiry !== null && expiry > now.getTime())) &&
          validSourceUrl;
      };
      const currentSameOwner = linkedClaims.some(isCurrentSameOwner);
      const currentOfficialSameOwner = linkedClaims.some((claim) => claim.source_type === 'official' && isCurrentSameOwner(claim));
      if (!currentSameOwner) fail('FIT_EVIDENCE_NOT_CURRENT_SAME_OWNER', 'No linked claim is verified/current, conflict-free, unexpired, and owned by this tool through its own tool profile.', 'Use the existing Evidence Review workflow to verify current official evidence and link it to this Fit under the same tool owner; do not borrow another tool’s claims.');
      else if (!currentOfficialSameOwner) fail('FIT_EVIDENCE_NOT_OFFICIAL', 'Current same-owner evidence exists, but no linked claim is classified as official.', 'Link a verified/current official claim from this tool’s own evidence profile; independent, owner, user, and editorial sources do not satisfy this gate.');
      if (eligible) {
        eligibleFitCount += 1;
        seenToolIds.add(expected.id);
      }
    }
    roles.push({ toolSlug: expected.slug, role: expected.role, fitStatus: fit ? String(fit.status) : null, eligible });
  }
  if (seenToolIds.size !== 3) add(blockers, 'THREE_DISTINCT_ELIGIBLE_TOOLS_REQUIRED', 'Three-tool page threshold', `Only ${seenToolIds.size} of the three specified tool roles are eligible.`, 'Clear all role-specific blockers with real reviewed relations and evidence; never manufacture a third Fit.');

  return {
    decision: blockers.length === 0 ? 'PASS' : 'HOLD',
    taskSlug: 'research-with-citations',
    checkedAt: timestamp,
    eligibleFitCount,
    roles,
    blockers,
  };
}
