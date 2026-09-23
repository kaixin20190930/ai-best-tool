/**
 * Task Pages need explicit editorial release in addition to their live data gate.
 * Add a slug here only after editorial approval and a current evidence check.
 * Remove it in the same release when freshness monitoring or review withdraws approval.
 * The empty registry keeps every Task Page closed while the first release awaits review.
 */
export const APPROVED_TASK_PAGE_SLUGS: readonly string[] = [];

export type TaskPageRouteDecision = 'other' | 'approved' | 'closed';

const supportedLocalePrefix = /^\/(?:en|cn|jp|de|es|fr|pt|ru|tw)(?=\/|$)/;
const taskSlugPath = /^\/tasks\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/;

/** Unprefixed /tasks/:slug follows next-intl's default English locale. */
export function getTaskPageRouteDecision(
  pathname: string,
  approvedSlugs: readonly string[] = APPROVED_TASK_PAGE_SLUGS,
): TaskPageRouteDecision {
  const pathWithoutLocale = pathname.replace(supportedLocalePrefix, '') || '/';
  if (pathWithoutLocale !== '/tasks' && !pathWithoutLocale.startsWith('/tasks/')) return 'other';
  const slug = pathWithoutLocale.match(taskSlugPath)?.[1];
  return slug && approvedSlugs.includes(slug) ? 'approved' : 'closed';
}
