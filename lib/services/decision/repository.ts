import { query } from '@/db/neon/client';

import { getLocalizedField } from '@/lib/services/tools';
import { createAdminClient } from '@/lib/supabase/admin';

export interface DecisionTaskOption {
  id: string;
  slug: string;
  name: Record<string, string>;
  description: Record<string, string>;
  constraintSchema: Record<string, unknown>;
}

export interface DecisionToolIdentity {
  id: string;
  slug: string;
  title: string;
}

type DatabaseRow = Record<string, unknown>;

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

export async function getActiveDecisionTasks(): Promise<DecisionTaskOption[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('decision_tasks')
    .select('id, slug, name, description, constraint_schema')
    .eq('status', 'active')
    .order('display_order', { ascending: true })
    .order('slug', { ascending: true });

  if (error) throw new Error('DECISION_TASKS_UNAVAILABLE');
  return ((data || []) as DatabaseRow[]).map((row) => ({
    id: String(row.id),
    slug: String(row.slug),
    name: asObject(row.name) as Record<string, string>,
    description: asObject(row.description) as Record<string, string>,
    constraintSchema: asObject(row.constraint_schema),
  }));
}

export async function getPublishedDecisionCandidateToolIds(taskId: string): Promise<string[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('tool_task_fits')
    .select('tool_id')
    .eq('task_id', taskId)
    .eq('status', 'published')
    .limit(50);

  if (error) throw new Error('DECISION_CANDIDATES_UNAVAILABLE');
  return Array.from(new Set((data || []).map((row) => String(row.tool_id)).filter(Boolean)));
}

export async function getDecisionToolIdentities(toolIds: string[], locale: string): Promise<DecisionToolIdentity[]> {
  if (toolIds.length === 0) return [];
  const result = await query<{ id: string; name: string; title: Record<string, string> }>(
    `SELECT id, name, title
     FROM tools
     WHERE id = ANY($1::uuid[])
       AND status = 'published'`,
    [toolIds],
  );

  return result.rows.map((tool) => ({
    id: tool.id,
    slug: tool.name,
    title: getLocalizedField(tool.title, locale, locale === 'cn' || locale === 'tw' ? 'cn' : 'en'),
  }));
}
