import type {
  IntelligenceConflictStatus,
  IntelligenceClaimType,
  IntelligenceTimelineEventType,
  IntelligenceTimelineReviewScope,
  IntelligenceTimelineVisibility,
  IntelligenceVerificationStatus,
  ProductIntelligenceTimelineEvent,
} from './types';

export interface PrepareTimelineEventInput {
  profileId: string;
  profileOwnerType: 'tool' | 'distribution_project' | 'site';
  eventType: IntelligenceTimelineEventType;
  reviewScope: IntelligenceTimelineReviewScope;
  claim?: {
    id: string;
    profileId: string;
    claimType: IntelligenceClaimType;
    claimKey: string;
    verificationStatus: IntelligenceVerificationStatus;
    conflictStatus: IntelligenceConflictStatus;
    sourceUrl: string;
  } | null;
  title: string;
  summary: string;
  oldValue?: string | null;
  newValue?: string | null;
  sourceUrl?: string | null;
  sourceExcerpt?: string | null;
  visibility: IntelligenceTimelineVisibility;
  occurredAt: string;
  reviewNote?: string | null;
}

function parseOptionalJson(value: string | null | undefined, label: string): unknown | null {
  if (!value?.trim()) return null;
  try {
    return JSON.parse(value);
  } catch {
    throw new Error(`${label} must be valid JSON.`);
  }
}

function normalizeHttpUrl(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error();
    return url.toString();
  } catch {
    throw new Error('Evidence URL must use HTTP or HTTPS.');
  }
}

export function prepareTimelineEventInsert(input: PrepareTimelineEventInput, reviewerId: string | null) {
  const title = input.title.trim();
  const summary = input.summary.trim();
  if (title.length < 4 || title.length > 240) throw new Error('Timeline title must be 4-240 characters.');
  if (summary.length < 12) throw new Error('Timeline summary must explain what was reviewed.');

  const occurredAt = new Date(input.occurredAt);
  if (Number.isNaN(occurredAt.getTime())) throw new Error('A valid review or change date is required.');
  if (occurredAt.getTime() > Date.now() + 5 * 60_000) throw new Error('Timeline events cannot be dated in the future.');

  const isFactChange = input.eventType !== 'reviewed_no_change';
  if (isFactChange) {
    if (!input.claim) throw new Error('Confirmed fact changes must reference a reviewed claim.');
    if (input.claim.profileId !== input.profileId) throw new Error('The selected claim belongs to another profile.');
    if (input.claim.verificationStatus !== 'verified' || input.claim.conflictStatus !== 'none') {
      throw new Error('Only verified, conflict-free claims can create confirmed fact changes.');
    }
  }

  if (input.visibility === 'public' && input.profileOwnerType !== 'tool') {
    throw new Error('Only directory tool profiles can publish public timeline events.');
  }

  const sourceUrl = normalizeHttpUrl(input.sourceUrl) || (input.claim ? normalizeHttpUrl(input.claim.sourceUrl) : null);
  if (input.visibility === 'public' && !sourceUrl) {
    throw new Error('Public timeline events require an evidence URL.');
  }

  return {
    profile_id: input.profileId,
    source_change_id: null,
    event_type: input.eventType,
    review_scope: input.reviewScope,
    claim_type: isFactChange && input.claim ? input.claim.claimType : null,
    claim_key: isFactChange && input.claim ? input.claim.claimKey : null,
    title,
    summary,
    old_value: isFactChange ? parseOptionalJson(input.oldValue, 'Previous value') : null,
    new_value: isFactChange ? parseOptionalJson(input.newValue, 'New value') : null,
    source_url: sourceUrl,
    source_excerpt: input.sourceExcerpt?.trim() || null,
    visibility: input.visibility,
    occurred_at: occurredAt.toISOString(),
    verified_at: new Date().toISOString(),
    verified_by: reviewerId,
    review_note: input.reviewNote?.trim() || null,
    metadata: {
      entryMethod: 'admin_editorial_review',
      claimId: isFactChange && input.claim ? input.claim.id : null,
    },
  };
}

function normalizeDate(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function mapIntelligenceTimelineRow(row: Record<string, unknown>): ProductIntelligenceTimelineEvent {
  return {
    id: String(row.id),
    profileId: String(row.profile_id),
    sourceChangeId: typeof row.source_change_id === 'string' ? row.source_change_id : null,
    eventType: row.event_type as IntelligenceTimelineEventType,
    reviewScope: row.review_scope as IntelligenceTimelineReviewScope,
    claimType: typeof row.claim_type === 'string' ? (row.claim_type as IntelligenceClaimType) : null,
    claimKey: typeof row.claim_key === 'string' ? row.claim_key : null,
    title: String(row.title || ''),
    summary: String(row.summary || ''),
    oldValue: row.old_value ?? null,
    newValue: row.new_value ?? null,
    sourceUrl: typeof row.source_url === 'string' ? row.source_url : null,
    sourceExcerpt: typeof row.source_excerpt === 'string' ? row.source_excerpt : null,
    visibility: row.visibility as IntelligenceTimelineVisibility,
    occurredAt: normalizeDate(row.occurred_at) || String(row.occurred_at || ''),
    verifiedAt: normalizeDate(row.verified_at) || String(row.verified_at || ''),
    verifiedBy: typeof row.verified_by === 'string' ? row.verified_by : null,
    reviewNote: typeof row.review_note === 'string' ? row.review_note : null,
    metadata: (row.metadata as Record<string, unknown>) || {},
  };
}

export function isFactChangeTimelineEvent(event: ProductIntelligenceTimelineEvent): boolean {
  return event.eventType !== 'reviewed_no_change';
}
