import { z } from 'zod';

const text = z.string().trim().min(1);
const id = z.string().regex(/^[a-z][a-z0-9-]*$/);
const pageType = z.enum(['home', 'explore', 'new', 'category', 'best', 'guide', 'comparison', 'alternative', 'tool']);
const placement = z.enum(['after-decision', 'after-evidence', 'page-end']);
const path = z.string().regex(/^\/(?:[a-z0-9_-]+(?:\/[a-z0-9_-]+)*)?$/);
const timestamp = z.string().datetime();
const unique = (values: readonly string[]) => new Set(values).size === values.length;
const day = 86_400_000;

const pageSchema = z.object({ path, pageType }).strict().readonly();
const registrationSchema = z
  .object({
    id,
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    pageTypes: z.array(pageType).min(1).refine(unique).readonly(),
    userQuestion: text,
    publicValue: text,
    requiredEvidence: z
      .array(
        z
          .object({ id, maxAgeDays: z.number().int().min(1).max(365) })
          .strict()
          .readonly(),
      )
      .min(1)
      .refine((items) => unique(items.map((item) => item.id)))
      .readonly(),
    placement,
    maxInstances: z.number().int().min(1).max(3),
    indexImpact: z.literal('none').default('none'),
    experimentId: id,
    enabled: z.boolean().default(false),
    rolloutPercent: z.number().min(0).max(100).default(0),
    pilotPages: z.array(path).max(5).refine(unique).readonly(),
    successMetrics: z
      .array(
        z
          .object({
            id,
            description: text,
            baselineRef: text.nullable(),
            target: text,
          })
          .strict()
          .readonly(),
      )
      .min(1)
      .refine((items) => unique(items.map((item) => item.id)))
      .readonly(),
    stopRule: z
      .object({
        onSeoRegression: z.literal(true),
        onEvidenceFailure: z.literal(true),
        onExperienceAndBehaviorDecline: z.literal(true),
        firstReviewDays: z.literal(14),
        fullReviewDays: z.literal(28),
        healthMaxAgeHours: z.number().int().min(1).max(24),
      })
      .strict()
      .readonly(),
    rollbackMode: z.literal('hide-preserve-data'),
  })
  .strict()
  .superRefine((module, ctx) => {
    if ((module.enabled || module.pilotPages.length > 0) && module.pilotPages.length < 3) {
      ctx.addIssue({ code: 'custom', message: 'A pilot requires 3–5 explicit existing pages.' });
    }
  })
  .readonly();

const evidenceSchema = z
  .object({
    id,
    claim: text,
    sourceUrl: z.string().url().startsWith('https://'),
    checkedAt: timestamp,
    status: z.literal('verified'),
  })
  .strict()
  .readonly();

const requestSchema = z
  .object({
    instanceId: id,
    moduleId: id,
    placement,
    evidence: z
      .array(evidenceSchema)
      .refine((items) => unique(items.map((item) => item.id)))
      .readonly(),
  })
  .strict()
  .readonly();

const reviewSchema = z
  .object({
    day: z.union([z.literal(14), z.literal(28)]),
    reviewedAt: timestamp,
    decision: z.enum(['continue-pilot', 'stop']),
    reportRef: text,
  })
  .strict()
  .readonly();

const experimentSchema = z
  .object({
    version: text,
    mode: z.enum(['off', 'pilot', 'stopped', 'rollback']),
    startedAt: timestamp,
    checkedAt: timestamp,
    seoRegression: z.boolean(),
    evidenceFailure: z.boolean(),
    experienceDeclined: z.boolean(),
    behaviorDeclined: z.boolean(),
    reviews: z
      .array(reviewSchema)
      .refine((items) => unique(items.map((item) => String(item.day))))
      .readonly(),
  })
  .strict()
  .readonly();

const controlsSchema = z
  .object({
    mode: z.enum(['off', 'pilot', 'rollback']),
    experiments: z.record(experimentSchema).readonly(),
  })
  .strict()
  .readonly();

export type PublicModulePage = z.input<typeof pageSchema>;
export type PublicModuleRegistration = z.input<typeof registrationSchema>;
export type PublicModuleRequest = z.input<typeof requestSchema>;
export type PublicModuleControls = z.input<typeof controlsSchema>;
type ModuleDefinition = z.output<typeof registrationSchema>;
type Experiment = z.output<typeof experimentSchema>;
export type PublicModuleRegistry = Readonly<{
  modules: readonly ModuleDefinition[];
  pages: readonly z.output<typeof pageSchema>[];
}>;

// Runtime validation is strict as well as typed: unknown fields cannot smuggle SEO controls into a module.
export function parsePublicModuleRegistry(definitions: unknown, existingPages: unknown): PublicModuleRegistry | null {
  const modules = z.array(registrationSchema).readonly().safeParse(definitions);
  const pages = z.array(pageSchema).readonly().safeParse(existingPages);
  if (!modules.success || !pages.success) return null;
  if (!unique(modules.data.map((item) => item.id)) || !unique(modules.data.map((item) => item.experimentId))) return null;
  if (!unique(pages.data.map((item) => item.path))) return null;
  if (
    !modules.data.every((module) =>
      module.pilotPages.every((pilot) =>
        pages.data.some((page) => page.path === pilot && module.pageTypes.includes(page.pageType)),
      ),
    )
  ) return null;
  return Object.freeze({ modules: modules.data, pages: pages.data });
}

export function createPublicModuleRegistry(
  definitions: readonly PublicModuleRegistration[],
  existingPages: readonly PublicModulePage[],
) {
  return parsePublicModuleRegistry(definitions, existingPages);
}

export type PublicModuleDecision = Readonly<{
  instanceId: string;
  show: boolean;
  reason:
  | 'allowed'
  | 'invalid-input'
  | 'disabled'
  | 'rollback'
  | 'unregistered'
  | 'page-mismatch'
  | 'placement-mismatch'
  | 'instance-limit'
  | 'missing-evidence'
  | 'stopped'
  | 'review-required'
  | 'rollout';
  dataPolicy: 'retain';
}>;

// Page-based allocation is stable across requests, locales explicitly listed in the pilot, and crawlers.
// It needs no cookie, visitor ID, random number or request order. Percentages never expand the pilot list.
export function publicModuleRolloutBucket(experimentId: string, version: string, pagePath: string): number {
  const hash = Array.from(`${experimentId}:${version}:${pagePath}`).reduce(
    (value, character) => (value * 31 + character.charCodeAt(0)) % 4_294_967_296,
    0,
  );
  return hash % 10_000;
}

function stopReason(
  module: ModuleDefinition,
  experiment: Experiment,
  now: number,
): PublicModuleDecision['reason'] | null {
  if (experiment.mode === 'rollback') return 'rollback';
  if (experiment.mode !== 'pilot') return 'stopped';
  const started = Date.parse(experiment.startedAt);
  const checked = Date.parse(experiment.checkedAt);
  if (
    experiment.version !== module.version ||
    started > now ||
    checked < started ||
    checked > now ||
    now - checked > module.stopRule.healthMaxAgeHours * 3_600_000
  ) return 'stopped';
  if (
    experiment.seoRegression ||
    experiment.evidenceFailure ||
    (experiment.experienceDeclined && experiment.behaviorDeclined) ||
    experiment.reviews.some((review) => review.decision === 'stop')
  ) return 'stopped';
  if (
    experiment.reviews.some(
      (review) => Date.parse(review.reviewedAt) < started + review.day * day || Date.parse(review.reviewedAt) > now,
    )
  ) return 'review-required';
  if (
    [module.stopRule.firstReviewDays, module.stopRule.fullReviewDays].some(
      (reviewDay) => now >= started + reviewDay * day && !experiment.reviews.some((review) => review.day === reviewDay),
    )
  ) return 'review-required';
  return null;
}

/** Evaluate ALL proposed instances on a page together. Excess instances deny the whole module on that page. */
export function evaluatePublicModules(
  registry: PublicModuleRegistry | null,
  page: PublicModulePage,
  requests: readonly PublicModuleRequest[],
  controls: PublicModuleControls,
  now = new Date(),
): readonly PublicModuleDecision[] {
  const parsedPage = pageSchema.safeParse(page);
  const parsedControls = controlsSchema.safeParse(controls);
  const parsedRequests = z.array(requestSchema).safeParse(requests);
  const validatedRegistry = parsePublicModuleRegistry(registry?.modules, registry?.pages);
  // The schema can be bypassed by JS callers; malformed input must never render or throw.
  if (!Array.isArray(requests)) return [];
  const denyAll = (reason: PublicModuleDecision['reason']) =>
    requests.map((request) => ({
      instanceId: request?.instanceId || '',
      show: false,
      reason,
      dataPolicy: 'retain' as const,
    }));
  if (
    !validatedRegistry ||
    !parsedPage.success ||
    !parsedControls.success ||
    !parsedRequests.success ||
    !(now instanceof Date) ||
    !Number.isFinite(now.getTime())
  ) return denyAll('invalid-input');
  if (parsedControls.data.mode === 'rollback') return denyAll('rollback');
  if (parsedControls.data.mode !== 'pilot') return denyAll('disabled');
  const currentPage = parsedPage.data;
  const pageAllowed = validatedRegistry.pages.some(
    (item) => item.path === currentPage.path && item.pageType === currentPage.pageType,
  );
  const instances = parsedRequests.data;
  return instances.map((request): PublicModuleDecision => {
    const result = (reason: PublicModuleDecision['reason']): PublicModuleDecision => ({
      instanceId: request.instanceId,
      show: reason === 'allowed',
      reason,
      dataPolicy: 'retain',
    });
    const definition = validatedRegistry.modules.find((item) => item.id === request.moduleId);
    if (!definition) return result('unregistered');
    if (!definition.enabled) return result('disabled');
    if (
      !pageAllowed ||
      !definition.pageTypes.includes(currentPage.pageType) ||
      !definition.pilotPages.includes(currentPage.path)
    ) return result('page-mismatch');
    if (definition.placement !== request.placement) return result('placement-mismatch');
    if (
      instances.filter((item) => item.moduleId === definition.id).length > definition.maxInstances ||
      instances.filter((item) => item.instanceId === request.instanceId).length !== 1
    ) return result('instance-limit');
    const experiment = parsedControls.data.experiments[definition.experimentId];
    if (!experiment) return result('stopped');
    const stopped = stopReason(definition, experiment, now.getTime());
    if (stopped) return result(stopped);
    if (
      !definition.requiredEvidence.every((requirement) =>
        request.evidence.some(
          (evidence) =>
            evidence.id === requirement.id &&
            Date.parse(evidence.checkedAt) <= now.getTime() &&
            now.getTime() - Date.parse(evidence.checkedAt) <= requirement.maxAgeDays * day,
        ),
      )
    ) return result('missing-evidence');
    if (
      publicModuleRolloutBucket(definition.experimentId, definition.version, currentPage.path) >=
      definition.rolloutPercent * 100
    ) return result('rollout');
    return result('allowed');
  });
}

// PUB-04 ships the mechanism only. Activating a module requires a reviewed registration, an explicit
// inventory of existing pages, healthy experiment state, and the reversible global switch below.
export const publicModuleRegistrations: readonly PublicModuleRegistration[] = Object.freeze([]);
export const publicModulePilotPages: readonly PublicModulePage[] = Object.freeze([]);
export const publicModuleRegistry = createPublicModuleRegistry(publicModuleRegistrations, publicModulePilotPages);
export const publicModuleControls: PublicModuleControls = Object.freeze({
  mode: 'off',
  experiments: Object.freeze({}),
});
