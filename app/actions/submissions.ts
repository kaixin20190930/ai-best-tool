'use server';

import { requireAuth } from '@/lib/auth/middleware';
import { getPool } from '@/db/neon/client';

export interface SubmittedTool {
  id: string;
  name: string;
  title: Record<string, string> | string;
  url: string;
  status: 'draft' | 'pending' | 'published' | 'rejected';
  pricing: string | null;
  created_at: Date;
  updated_at: Date;
}

export async function getMySubmittedTools(): Promise<{
  success: boolean;
  tools: SubmittedTool[];
  error?: string;
}> {
  try {
    const user = await requireAuth();
    const pool = getPool();
    const result = await pool.query(
      `
        SELECT id, name, title, url, status, pricing, created_at, updated_at
        FROM tools
        WHERE submitted_by = $1
        ORDER BY created_at DESC
      `,
      [user.id]
    );

    return {
      success: true,
      tools: result.rows,
    };
  } catch (error) {
    console.error('Error fetching submitted tools:', error);

    return {
      success: false,
      tools: [],
      error:
        error instanceof Error
          ? error.message
          : 'Failed to fetch submitted tools',
    };
  }
}
