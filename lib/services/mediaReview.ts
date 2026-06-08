export const PLACEHOLDER_MEDIA_REASON =
  'Placeholder favicon is being used until a real logo or screenshot is added.';

const placeholderMediaPatterns = ['google.com/s2/favicons', 'favicon?sz='];

export function isPlaceholderMediaUrl(url?: string | null): boolean {
  if (!url) {
    return false;
  }

  return placeholderMediaPatterns.some((pattern) => url.includes(pattern));
}
