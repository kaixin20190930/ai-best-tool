import type {
  IntelligenceConflictStatus,
  IntelligenceSourceType,
  IntelligenceVerificationStatus,
} from './types';

const REVIEW_CADENCE_DAYS = 30;

const allowedTransitions: Record<IntelligenceVerificationStatus, IntelligenceVerificationStatus[]> = {
  candidate: ['candidate', 'verified', 'rejected'],
  verified: ['verified', 'superseded'],
  rejected: ['rejected', 'candidate'],
  superseded: ['superseded', 'candidate'],
};

export interface EvidenceReviewInput {
  currentStatus: IntelligenceVerificationStatus;
  nextStatus: IntelligenceVerificationStatus;
  conflictStatus: IntelligenceConflictStatus;
  sourceUrl: string;
  sourceType: IntelligenceSourceType;
  verificationNote?: string | null;
  reviewDueAt?: string | null;
  expiresAt?: string | null;
  invalidationReason?: string | null;
  validityScope?: string | Record<string, unknown> | null;
}

export interface EvidenceReviewUpdate {
  source_type: IntelligenceSourceType;
  verification_status: IntelligenceVerificationStatus;
  verified_at: string | null;
  verified_by: string | null;
  verification_note: string | null;
  review_due_at: string | null;
  expires_at: string | null;
  invalidated_at: string | null;
  invalidation_reason: string | null;
  validity_scope: Record<string, unknown>;
}

function normalizeDate(value: string | null | undefined, label: string): string | null {
  if (!value?.trim()) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error(`${label} is not a valid date.`);
  return date.toISOString();
}

function parseValidityScope(value: EvidenceReviewInput['validityScope']): Record<string, unknown> {
  if (!value) return {};
  if (typeof value !== 'string') return value;
  if (!value.trim()) return {};

  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error('Validity scope must be valid JSON.');
  }

  if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
    throw new Error('Validity scope must be a JSON object.');
  }
  return parsed as Record<string, unknown>;
}

export function prepareEvidenceReviewUpdate(
  input: EvidenceReviewInput,
  reviewerId: string,
  now = new Date(),
): EvidenceReviewUpdate {
  if (!allowedTransitions[input.currentStatus].includes(input.nextStatus)) {
    throw new Error(`Move ${input.currentStatus} claims back to candidate before choosing ${input.nextStatus}.`);
  }

  const note = input.verificationNote?.trim() || null;
  const invalidationReason = input.invalidationReason?.trim() || null;
  const expiresAt = normalizeDate(input.expiresAt, 'Expiry date');
  let reviewDueAt = normalizeDate(input.reviewDueAt, 'Review due date');
  const nowIso = now.toISOString();

  if (input.nextStatus === 'verified') {
    if (input.conflictStatus !== 'none') {
      throw new Error('Resolve the evidence conflict before marking this claim as verified.');
    }
    if (!/^https?:\/\/\S+$/i.test(input.sourceUrl.trim())) {
      throw new Error('A valid HTTP(S) source is required before verification.');
    }
    if (!note || note.length < 10) {
      throw new Error('Add a verification note of at least 10 characters.');
    }
    if (!reviewDueAt) {
      const defaultDue = new Date(now);
      defaultDue.setUTCDate(defaultDue.getUTCDate() + REVIEW_CADENCE_DAYS);
      reviewDueAt = defaultDue.toISOString();
    }
    if (new Date(reviewDueAt).getTime() <= now.getTime()) {
      throw new Error('Review due date must be later than the verification time.');
    }
    if (expiresAt && new Date(expiresAt).getTime() <= now.getTime()) {
      throw new Error('A newly verified claim cannot already be expired.');
    }
  }

  if (input.nextStatus === 'rejected' && (!note || note.length < 10)) {
    throw new Error('Add a rejection note of at least 10 characters.');
  }

  if (input.nextStatus === 'superseded' && !invalidationReason) {
    throw new Error('Explain why this evidence was superseded.');
  }

  return {
    source_type: input.sourceType,
    verification_status: input.nextStatus,
    verified_at: input.nextStatus === 'verified' ? nowIso : null,
    verified_by: input.nextStatus === 'verified' ? reviewerId : null,
    verification_note: note,
    review_due_at: input.nextStatus === 'verified' ? reviewDueAt : null,
    expires_at: expiresAt,
    invalidated_at: input.nextStatus === 'superseded' ? nowIso : null,
    invalidation_reason: input.nextStatus === 'superseded' ? invalidationReason : null,
    validity_scope: parseValidityScope(input.validityScope),
  };
}
