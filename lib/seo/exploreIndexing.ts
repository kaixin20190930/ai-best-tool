export function hasActiveExploreFilters(searchParams?: Record<string, string | string[] | undefined>): boolean {
  return Object.values(searchParams || {}).some((value) =>
    Array.isArray(value)
      ? value.some((item) => item.trim().length > 0)
      : typeof value === 'string' && value.trim().length > 0,
  );
}
