export const PLACEHOLDER_MEDIA_REASON =
  'Placeholder favicon is being used until a real logo or screenshot is added.';

const placeholderMediaPatterns = ['google.com/s2/favicons', 'favicon?sz='];

export function isPlaceholderMediaUrl(url?: string | null): boolean {
  if (!url) {
    return false;
  }

  return placeholderMediaPatterns.some((pattern) => url.includes(pattern));
}

export function getMediaIssueLabels(input: {
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  mediaReviewNeeded?: boolean;
}): string[] {
  const issues: string[] = [];

  if (!input.imageUrl) {
    issues.push('Missing logo');
  } else if (isPlaceholderMediaUrl(input.imageUrl)) {
    issues.push('Placeholder logo');
  }

  if (!input.thumbnailUrl) {
    issues.push('Missing screenshot');
  } else if (isPlaceholderMediaUrl(input.thumbnailUrl)) {
    issues.push('Placeholder screenshot');
  }

  if (input.mediaReviewNeeded && issues.length === 0) {
    issues.push('Media review needed');
  }

  return issues;
}
