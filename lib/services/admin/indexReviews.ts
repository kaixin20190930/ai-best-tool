import { getPool } from '@/db/neon/client';

export interface IndexReviewOverview {
  schemaReady: boolean;
  policy: { paused: boolean; dailyLimit: number; weeklyLimit: number; pauseReason: string } | null;
  monitorCount: number;
  runs: Array<{
    id: string;
    toolSlug: string;
    decision: string;
    siteSearchHealth: string;
    blockers: string[];
    reviewedBy: string;
    createdAt: Date;
  }>;
}

function missingTable(error: unknown): boolean {
  return Boolean(error && typeof error === 'object' && 'code' in error && error.code === '42P01');
}

export async function getIndexReviewOverview(): Promise<IndexReviewOverview> {
  const pool = getPool();
  try {
    const [policy, monitor, runs] = await Promise.all([
      pool.query(
        `SELECT paused, daily_limit, weekly_limit, pause_reason FROM tool_index_release_policy WHERE singleton=true`,
      ),
      pool.query(
        `SELECT count(*)::int AS count FROM tools WHERE status='published' AND COALESCE(page_quality_status,'monitor')='monitor'`,
      ),
      pool.query(`SELECT id, tool_slug, decision, site_search_health, blockers, reviewed_by, created_at
                    FROM tool_index_review_runs ORDER BY created_at DESC LIMIT 50`),
    ]);
    const policyRow = policy.rows[0];
    return {
      schemaReady: true,
      policy: policyRow
        ? {
            paused: policyRow.paused,
            dailyLimit: policyRow.daily_limit,
            weeklyLimit: policyRow.weekly_limit,
            pauseReason: policyRow.pause_reason,
          }
        : null,
      monitorCount: monitor.rows[0]?.count || 0,
      runs: runs.rows.map((row) => ({
        id: row.id,
        toolSlug: row.tool_slug,
        decision: row.decision,
        siteSearchHealth: row.site_search_health,
        blockers: row.blockers || [],
        reviewedBy: row.reviewed_by,
        createdAt: row.created_at,
      })),
    };
  } catch (error) {
    if (missingTable(error)) return { schemaReady: false, policy: null, monitorCount: 0, runs: [] };
    throw error;
  }
}
