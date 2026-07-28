import { Pool } from 'pg';

let pool: Pool | null = null;

function getConnectionString() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL_UNPOOLED;
  if (!connectionString) {
    throw new Error('DATABASE_URL, POSTGRES_URL, or DATABASE_URL_UNPOOLED is not configured.');
  }
  return connectionString;
}

export function getDatabasePool() {
  if (pool) return pool;

  const connectionString = getConnectionString();
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
