import { getCanonicalToolSlug } from '@/lib/config/toolRouteAliases';

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export type ToolEntryIntent = 'ownership_update' | 'profile_correction';
export type ToolEntryContext = { intent: ToolEntryIntent; toolId: string; slug: string; listingName: string; website: string; sourcePath: string };

export function officialHost(value: string): string {
  try {
    const url = new URL(value);
    return /^https?:$/.test(url.protocol) && !url.username && !url.password
      ? url.hostname.toLowerCase().replace(/^www\./, '') : '';
  } catch { return ''; }
}

export function toolSourcePath(locale: string, slug: string): string {
  return `${locale === 'en' ? '' : `/${locale}`}/ai/${slug}`;
}

export function buildToolEntryHref(input: Omit<ToolEntryContext, 'sourcePath'>, locale: string): string {
  const sourcePath = toolSourcePath(locale, input.slug);
  const params = new URLSearchParams({ intent: input.intent, toolId: input.toolId, slug: input.slug, listingName: input.listingName, website: input.website, sourcePath });
  return `${locale === 'en' ? '' : `/${locale}`}/developer/listing?${params.toString()}#claim-form`;
}

export function parseToolEntryContext(params: Record<string, string | string[] | undefined>, locale: string): ToolEntryContext | null {
  const allowedKeys = new Set(['intent', 'toolId', 'slug', 'listingName', 'website', 'sourcePath']);
  if (Object.keys(params).some((key) => !allowedKeys.has(key))) return null;
  const get = (key: string, max: number) => {
    const value = params[key];
    return typeof value === 'string' && value.length <= max ? value.trim() : '';
  };
  const intent = get('intent', 32);
  const toolId = get('toolId', 36);
  const slug = get('slug', 100).toLowerCase();
  const listingName = get('listingName', 120);
  const website = get('website', 500);
  const sourcePath = get('sourcePath', 160);
  if ((intent !== 'ownership_update' && intent !== 'profile_correction') || !uuidPattern.test(toolId) ||
      !slugPattern.test(slug) || getCanonicalToolSlug(slug) !== slug || !listingName || !officialHost(website) ||
      sourcePath !== toolSourcePath(locale, slug)) return null;
  return { intent, toolId, slug, listingName, website, sourcePath };
}

export function normalizeClaimSourcePath(value: string, locale: string): string {
  const match = value.match(/^\/(?:([a-z]{2})\/)?ai\/([a-z0-9]+(?:-[a-z0-9]+)*)$/);
  if (!match || (match[1] || 'en') !== locale || getCanonicalToolSlug(match[2]) !== match[2] || value !== toolSourcePath(locale, match[2])) {
    return `${locale === 'en' ? '' : `/${locale}`}/developer/listing`;
  }
  return toolSourcePath(locale, match[2]);
}

export function matchesToolEntry(input: { toolId?: string; slug: string; website: string }, tool: { id: string; name: string; url: string } | undefined): boolean {
  return Boolean(tool && input.toolId === tool.id && input.slug === tool.name &&
    officialHost(input.website) && officialHost(input.website) === officialHost(tool.url));
}
