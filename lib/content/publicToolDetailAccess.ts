export type PublicToolDetailDisposition = 'published' | 'neutral' | 'fallback' | 'not-found';

export function getPublicToolDetailDisposition(input: {
  hasDatabaseRecord: boolean;
  status: string | null | undefined;
  hasSafetyReview: boolean;
  hasLegacyScope: boolean;
}): PublicToolDetailDisposition {
  if (input.status === 'published') return 'published';
  if (!input.hasDatabaseRecord) return 'fallback';
  if (input.hasSafetyReview || input.hasLegacyScope) return 'neutral';
  return 'not-found';
}

export function isPublicToolMetadataAllowed(status: string | null | undefined): boolean {
  return status === 'published';
}

export function isNextNavigationError(error: unknown): boolean {
  if (!error || typeof error !== 'object' || !('digest' in error)) return false;
  const digest = (error as { digest?: unknown }).digest;
  return typeof digest === 'string' && (digest.startsWith('NEXT_NOT_FOUND') || digest.startsWith('NEXT_REDIRECT;'));
}
