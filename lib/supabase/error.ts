export function isSupabaseUnavailableError(error: unknown): boolean {
  if (!error) return false;

  const message = error instanceof Error ? error.message : JSON.stringify(error);

  return [
    'fetch failed',
    'failed to fetch',
    'networkerror',
    'enotfound',
    'econnrefused',
    'etimedout',
  ].some((pattern) => message.toLowerCase().includes(pattern));
}

export function getSupabaseUnavailableMessage(feature: string): string {
  return `${feature} are temporarily unavailable. Please try again later.`;
}
