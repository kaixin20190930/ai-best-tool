// Missing/invalid source timestamps must not acquire a synthetic freshness
// signal. Next's sitemap type permits omitting lastModified in that case.
export function getSourceLastModified(...values: Array<Date | string | null | undefined>): Date | undefined {
  for (const value of values) {
    if (!value) continue;
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isFinite(date.getTime())) return date;
  }
  return undefined;
}
