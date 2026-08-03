import { Pool } from 'pg';

import { getDatabaseConnectionString } from '@/lib/database/connection';

let pool: Pool | null = null;

export function getDatabasePool() {
  if (pool) return pool;

  const connectionString = getDatabaseConnectionString();
  pool = new Pool({
    connectionString,
    ssl: connectionString.includes('supabase.com') || connectionString.includes('sslmode=require')
      ? { rejectUnauthorized: false }
      : false,
    max: 5,
    idleTimeoutMillis: 5_000,
    connectionTimeoutMillis: 30_000,
    allowExitOnIdle: true,
  });

  return pool;
}

export async function queryDatabase<T extends Record<string, unknown>>(
  text: string,
  values: unknown[] = [],
): Promise<T[]> {
  const result = await getDatabasePool().query<T>(text, values);
  return result.rows;
}
