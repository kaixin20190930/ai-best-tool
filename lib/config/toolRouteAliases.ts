const TOOL_ROUTE_ALIASES: Record<string, string> = {
  anthropic: 'claude',
};

export function getCanonicalToolSlug(slug: string): string {
  const normalized = slug.trim().toLowerCase();
  return TOOL_ROUTE_ALIASES[normalized] || normalized;
}

export function getLocalizedToolPath(slug: string, locale: string): string {
  const canonicalSlug = getCanonicalToolSlug(slug);
  return locale === 'en' ? `/ai/${canonicalSlug}` : `/${locale}/ai/${canonicalSlug}`;
}

export function isLegacyToolSlug(slug: string): boolean {
  return getCanonicalToolSlug(slug) !== slug.trim().toLowerCase();
}
