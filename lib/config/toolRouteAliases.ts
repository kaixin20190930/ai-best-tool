const TOOL_ROUTE_ALIASES: Record<string, string> = {
  anthropic: 'claude',
};

const EXPLICIT_ENGLISH_TOOL_ALIASES = new Set(['fathom']);

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

export function shouldRedirectExplicitEnglishToolPath(slug: string): boolean {
  return EXPLICIT_ENGLISH_TOOL_ALIASES.has(getCanonicalToolSlug(slug));
}
