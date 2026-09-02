import type {
  IntelligenceClaimType,
  IntelligenceTimelineEventType,
  IntelligenceTimelineReviewScope,
  IntelligenceTimelineVisibility,
  ProductIntelligenceTimelineEvent,
} from './types';

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
