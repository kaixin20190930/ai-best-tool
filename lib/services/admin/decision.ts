import { requireAdmin } from '@/lib/auth/middleware';
import { getDecisionToolIdentities } from '@/lib/services/decision/repository';
import { createAdminClient } from '@/lib/supabase/admin';

export type DecisionReviewEntity = 'task' | 'profile' | 'fit' | 'relationship';
export type DecisionReviewStatus = 'draft' | 'reviewed' | 'published' | 'stale' | 'active' | 'archived';

export interface DecisionReviewItem {
  entity: DecisionReviewEntity;
  id: string;
  title: string;
  context: string;
  status: DecisionReviewStatus;
  evidenceCount: number;
  reviewedAt: string | null;
  reviewDueAt: string | null;
  updatedAt: string;
}

export interface DecisionReviewOverview {
  items: DecisionReviewItem[];
  totals: { draft: number; reviewed: number; published: number; stale: number; activeTasks: number };
}

type Row = Record<string, unknown>;

function localized(value: unknown): string {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object' || Array.isArray(value)) return '';
  const record = value as Record<string, unknown>;
  const candidate = record.en || record.cn || record.zh;
  return typeof candidate === 'string' ? candidate : '';
}

function evidenceCounts(rows: Row[], key: string): Map<string, number> {
  const counts = new Map<string, number>();
  rows.forEach((row) => {
    const id = String(row[key]);
    counts.set(id, (counts.get(id) || 0) + 1);
  });
  return counts;
}

export async function getDecisionReviewOverview(): Promise<DecisionReviewOverview> {
  await requireAdmin();
  const supabase = createAdminClient();
  const [tasksResult, profilesResult, fitsResult, relationshipsResult, profileLinks, fitLinks, relationshipLinks] =
    await Promise.all([
      supabase
        .from('decision_tasks')
        .select('id, slug, name, status, display_order, updated_at')
        .order('display_order'),
      supabase
        .from('tool_decision_profiles')
        .select('tool_id, editorial_status, reviewed_at, review_due_at, updated_at')
        .order('updated_at', { ascending: false }),
      supabase
        .from('tool_task_fits')
        .select('id, tool_id, task_id, fit_level, status, reviewed_at, review_due_at, updated_at')
        .order('updated_at', { ascending: false }),
      supabase
        .from('tool_relationships')
        .select('id, tool_id, related_tool_id, relationship_type, status, reviewed_at, review_due_at, updated_at')
        .order('updated_at', { ascending: false }),
      supabase.from('tool_decision_profile_claims').select('tool_id'),
      supabase.from('tool_task_fit_claims').select('fit_id'),
      supabase.from('tool_relationship_claims').select('relationship_id'),
    ]);
  const error =
    tasksResult.error ||
    profilesResult.error ||
    fitsResult.error ||
    relationshipsResult.error ||
    profileLinks.error ||
    fitLinks.error ||
    relationshipLinks.error;
  if (error) throw new Error(error.message);

  const tasks = (tasksResult.data || []) as Row[];
  const profiles = (profilesResult.data || []) as Row[];
  const fits = (fitsResult.data || []) as Row[];
  const relationships = (relationshipsResult.data || []) as Row[];
  const taskNames = new Map(tasks.map((row) => [String(row.id), localized(row.name) || String(row.slug)]));
  const toolIds = Array.from(
    new Set(
      [...profiles, ...fits, ...relationships]
        .flatMap((row) => [row.tool_id, row.related_tool_id])
        .filter(Boolean)
        .map(String),
    ),
  );
  const identities = await getDecisionToolIdentities(toolIds, 'en');
  const toolNames = new Map(identities.map((tool) => [tool.id, tool.title]));
  const profileEvidence = evidenceCounts((profileLinks.data || []) as Row[], 'tool_id');
  const fitEvidence = evidenceCounts((fitLinks.data || []) as Row[], 'fit_id');
  const relationshipEvidence = evidenceCounts((relationshipLinks.data || []) as Row[], 'relationship_id');
  const items: DecisionReviewItem[] = [
    ...tasks.map((row) => ({
      entity: 'task' as const,
      id: String(row.id),
      title: localized(row.name) || String(row.slug),
      context: String(row.slug),
      status: row.status as DecisionReviewStatus,
      evidenceCount: 0,
      reviewedAt: null,
      reviewDueAt: null,
      updatedAt: String(row.updated_at),
    })),
    ...profiles.map((row) => ({
      entity: 'profile' as const,
      id: String(row.tool_id),
      title: toolNames.get(String(row.tool_id)) || 'Unknown tool',
      context: 'Decision Card profile',
      status: row.editorial_status as DecisionReviewStatus,
      evidenceCount: profileEvidence.get(String(row.tool_id)) || 0,
      reviewedAt: (row.reviewed_at as string | null) || null,
      reviewDueAt: (row.review_due_at as string | null) || null,
      updatedAt: String(row.updated_at),
    })),
    ...fits.map((row) => ({
      entity: 'fit' as const,
      id: String(row.id),
      title: toolNames.get(String(row.tool_id)) || 'Unknown tool',
      context: `${taskNames.get(String(row.task_id)) || 'Unknown task'} · ${String(row.fit_level)}`,
      status: row.status as DecisionReviewStatus,
      evidenceCount: fitEvidence.get(String(row.id)) || 0,
      reviewedAt: (row.reviewed_at as string | null) || null,
      reviewDueAt: (row.review_due_at as string | null) || null,
      updatedAt: String(row.updated_at),
    })),
    ...relationships.map((row) => ({
      entity: 'relationship' as const,
      id: String(row.id),
      title: toolNames.get(String(row.tool_id)) || 'Unknown tool',
      context: `${String(row.relationship_type)} → ${toolNames.get(String(row.related_tool_id)) || 'Unknown tool'}`,
      status: row.status as DecisionReviewStatus,
      evidenceCount: relationshipEvidence.get(String(row.id)) || 0,
      reviewedAt: (row.reviewed_at as string | null) || null,
      reviewDueAt: (row.review_due_at as string | null) || null,
      updatedAt: String(row.updated_at),
    })),
  ];

  return {
    items,
    totals: {
      draft: items.filter((item) => item.status === 'draft').length,
      reviewed: items.filter((item) => item.status === 'reviewed').length,
      published: items.filter((item) => item.status === 'published').length,
      stale: items.filter((item) => item.status === 'stale').length,
      activeTasks: items.filter((item) => item.entity === 'task' && item.status === 'active').length,
    },
  };
}

export function getDecisionTransitionError(
  entity: DecisionReviewEntity,
  current: DecisionReviewStatus,
  next: DecisionReviewStatus,
  evidenceCount: number,
  reviewedAt: string | null,
): string | null {
  if (entity === 'task') {
    const allowed: Record<string, DecisionReviewStatus[]> = {
      draft: ['active', 'archived'],
      active: ['archived'],
      archived: ['draft'],
    };
    return allowed[current]?.includes(next) ? null : `Task transition ${current} → ${next} is not allowed.`;
  }
  const allowed: Record<string, DecisionReviewStatus[]> = {
    draft: ['reviewed'],
    reviewed: ['draft', 'published'],
    published: ['stale'],
    stale: ['reviewed'],
  };
  if (!allowed[current]?.includes(next)) return `Editorial transition ${current} → ${next} is not allowed.`;
  if (next === 'published' && evidenceCount < 1) return 'Publishing requires at least one verified evidence link.';
  if (next === 'published' && !reviewedAt) return 'Publishing requires a completed human review.';
  return null;
}
