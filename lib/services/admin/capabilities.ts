import { requireAdmin } from '@/lib/auth/middleware';
import type {
  CapabilityAvailability,
  CapabilityGroup,
  CapabilitySupportLevel,
  TaskCapabilityImportance,
} from '@/lib/services/decision/capabilityReadModel';
import { createAdminClient } from '@/lib/supabase/admin';

export type CapabilityEditorialStatus = 'draft' | 'reviewed' | 'published' | 'stale';
export type CapabilityLifecycleStatus = 'draft' | 'active' | 'archived';

export interface AdminCapability {
  id: string;
  slug: string;
  name: Record<string, string>;
  description: Record<string, string>;
  group: CapabilityGroup;
  status: CapabilityLifecycleStatus;
  displayOrder: number;
}

export interface AdminToolCapability {
  id: string;
  toolId: string;
  capabilityId: string;
  supportLevel: CapabilitySupportLevel;
  availability: CapabilityAvailability;
  status: CapabilityEditorialStatus;
  evidenceCount: number;
  reviewedAt: string | null;
  reviewDueAt: string | null;
}

export interface AdminTaskCapability {
  taskId: string;
  taskSlug: string;
  capabilityId: string;
  importance: TaskCapabilityImportance;
  status: CapabilityEditorialStatus;
  reviewedAt: string | null;
  reviewDueAt: string | null;
}

export interface CapabilityAdminOverview {
  capabilities: AdminCapability[];
  toolCapabilities: AdminToolCapability[];
  taskCapabilities: AdminTaskCapability[];
  taskOptions: Array<{ id: string; slug: string }>;
}

type Row = Record<string, unknown>;

function stringRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).filter(
      (entry): entry is [string, string] => typeof entry[1] === 'string',
    ),
  );
}

export async function getCapabilityAdminOverview(): Promise<CapabilityAdminOverview> {
  await requireAdmin();
  const supabase = createAdminClient();
  const [capabilitiesResult, toolCapabilitiesResult, taskCapabilitiesResult, tasksResult, linksResult] =
    await Promise.all([
      supabase
        .from('decision_capabilities')
        .select('id, slug, name, description, capability_group, status, display_order')
        .order('capability_group')
        .order('display_order')
        .order('slug'),
      supabase
        .from('tool_capabilities')
        .select('id, tool_id, capability_id, support_level, availability, status, reviewed_at, review_due_at')
        .order('updated_at', { ascending: false })
        .limit(100),
      supabase
        .from('task_capabilities')
        .select('task_id, capability_id, importance, status, reviewed_at, review_due_at')
        .order('updated_at', { ascending: false })
        .limit(100),
      supabase.from('decision_tasks').select('id, slug').order('display_order').order('slug'),
      supabase.from('tool_capability_claims').select('tool_capability_id'),
    ]);
  const error =
    capabilitiesResult.error ||
    toolCapabilitiesResult.error ||
    taskCapabilitiesResult.error ||
    tasksResult.error ||
    linksResult.error;
  if (error) throw new Error('CAPABILITY_ADMIN_UNAVAILABLE');

  const evidenceCount = new Map<string, number>();
  ((linksResult.data || []) as Row[]).forEach((row) => {
    const id = String(row.tool_capability_id);
    evidenceCount.set(id, (evidenceCount.get(id) || 0) + 1);
  });
  const taskOptions = ((tasksResult.data || []) as Row[]).map((row) => ({
    id: String(row.id),
    slug: String(row.slug),
  }));
  const taskSlugById = new Map(taskOptions.map((task) => [task.id, task.slug]));

  return {
    capabilities: ((capabilitiesResult.data || []) as Row[]).map((row) => ({
      id: String(row.id),
      slug: String(row.slug),
      name: stringRecord(row.name),
      description: stringRecord(row.description),
      group: row.capability_group as CapabilityGroup,
      status: row.status as CapabilityLifecycleStatus,
      displayOrder: Number(row.display_order || 0),
    })),
    toolCapabilities: ((toolCapabilitiesResult.data || []) as Row[]).map((row) => ({
      id: String(row.id),
      toolId: String(row.tool_id),
      capabilityId: String(row.capability_id),
      supportLevel: row.support_level as CapabilitySupportLevel,
      availability: row.availability as CapabilityAvailability,
      status: row.status as CapabilityEditorialStatus,
      evidenceCount: evidenceCount.get(String(row.id)) || 0,
      reviewedAt: typeof row.reviewed_at === 'string' ? row.reviewed_at : null,
      reviewDueAt: typeof row.review_due_at === 'string' ? row.review_due_at : null,
    })),
    taskCapabilities: ((taskCapabilitiesResult.data || []) as Row[]).map((row) => ({
      taskId: String(row.task_id),
      taskSlug: taskSlugById.get(String(row.task_id)) || 'unknown-task',
      capabilityId: String(row.capability_id),
      importance: row.importance as TaskCapabilityImportance,
      status: row.status as CapabilityEditorialStatus,
      reviewedAt: typeof row.reviewed_at === 'string' ? row.reviewed_at : null,
      reviewDueAt: typeof row.review_due_at === 'string' ? row.review_due_at : null,
    })),
    taskOptions,
  };
}
