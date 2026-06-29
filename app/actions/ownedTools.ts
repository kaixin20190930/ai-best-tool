'use server';

import { getPool } from '@/db/neon/client';

import { requireAuth } from '@/lib/auth/middleware';

export interface OwnedToolOverview {
  id: string;
  name: string;
  title: Record<string, string> | string;
  url: string;
  status: 'draft' | 'pending' | 'published' | 'rejected';
  ownerEmail: string | null;
  claimStatus: string | null;
  claimedAt: string | null;
  pricing: string | null;
  isSponsoredPlacement: boolean;
  featuredActiveFrom: string | null;
  featuredUntil: string | null;
  viewCount: number;
  clickCount: number;
  favoriteCount: number;
  ratingCount: number;
  commentCount: number;
  updatedAt: string;
}

export async function getMyOwnedTools(): Promise<{
  success: boolean;
  tools: OwnedToolOverview[];
  error?: string;
}> {
  try {
    const user = await requireAuth();
    const email = user.email?.trim().toLowerCase();

    if (!email) {
      return {
        success: true,
        tools: [],
      };
    }

    const pool = getPool();
    const result = await pool.query(
      `
        WITH comment_counts AS (
          SELECT
            c.tool_id,
            COUNT(DISTINCT c.id)::int AS comment_count
          FROM comments c
          WHERE COALESCE(c.is_hidden, false) = false
          GROUP BY c.tool_id
        )
        SELECT
          t.id,
          t.name,
          t.title,
          t.url,
          t.status,
          t.owner_email AS "ownerEmail",
          t.claim_status AS "claimStatus",
          t.claimed_at AS "claimedAt",
          t.pricing,
          COALESCE(t.features->'submission'->'commercial'->>'isSponsoredPlacement', 'false') = 'true' AS "isSponsoredPlacement",
          NULLIF(t.features->'submission'->'commercial'->>'featuredActiveFrom', '')::timestamptz AS "featuredActiveFrom",
          NULLIF(t.features->'submission'->'commercial'->>'featuredUntil', '')::timestamptz AS "featuredUntil",
          t.view_count AS "viewCount",
          t.click_count AS "clickCount",
          t.favorite_count AS "favoriteCount",
          t.rating_count AS "ratingCount",
          COALESCE(cc.comment_count, 0)::int AS "commentCount",
          t.updated_at AS "updatedAt"
        FROM tools t
        LEFT JOIN comment_counts cc ON cc.tool_id = t.id
        WHERE LOWER(COALESCE(t.owner_email, '')) = $1
        ORDER BY COALESCE(t.claimed_at, t.updated_at, t.created_at) DESC
      `,
      [email],
    );

    return {
      success: true,
      tools: result.rows,
    };
  } catch (error) {
    console.error('Error fetching owned tools:', error);
    return {
      success: false,
      tools: [],
      error: error instanceof Error ? error.message : 'Failed to fetch owned tools',
    };
  }
}
