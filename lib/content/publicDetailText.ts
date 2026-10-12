const localeMarker = /(?:^|[\s;])(EN|CN|TW|ZH)\s*:\s*/gi;

function localePreference(locale: string): string[] {
  if (locale === 'tw') return ['tw', 'cn', 'zh', 'en'];
  if (locale === 'cn') return ['cn', 'zh', 'tw', 'en'];
  return ['en', 'cn', 'zh', 'tw'];
}

function localizedString(value: string, locale: string): string {
  const markers = Array.from(value.matchAll(localeMarker));
  if (!markers.length || (markers[0].index ?? 0) !== 0) return value.trim();

  const segments = new Map<string, string>();
  markers.forEach((match, index) => {
    const start = (match.index ?? 0) + match[0].length;
    const end = markers[index + 1]?.index ?? value.length;
    segments.set(match[1].toLowerCase(), value.slice(start, end).trim().replace(/[;\s]+$/, ''));
  });
  return localePreference(locale).map((key) => segments.get(key)).find(Boolean) || '';
}

export default function publicDetailText(value: unknown, locale: string): string {
  if (typeof value === 'string') return localizedString(value, locale);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map((item) => publicDetailText(item, locale)).filter(Boolean).join('; ');
  if (!value || typeof value !== 'object') return '';

  const record = value as Record<string, unknown>;
  const localeKeys = ['en', 'cn', 'zh', 'tw'];
  const keys = Object.keys(record).map((key) => key.toLowerCase());
  if (keys.length > 0 && keys.every((key) => localeKeys.includes(key))) {
    const normalized = Object.fromEntries(Object.entries(record).map(([key, item]) => [key.toLowerCase(), item]));
    return localePreference(locale).map((key) => publicDetailText(normalized[key], locale)).find(Boolean) || '';
  }
  return Object.entries(record)
    .map(([key, item]) => {
      const detail = publicDetailText(item, locale);
      return detail ? `${key.replace(/[_-]/g, ' ')}: ${detail}` : '';
    })
    .filter(Boolean)
    .join('; ');
}
