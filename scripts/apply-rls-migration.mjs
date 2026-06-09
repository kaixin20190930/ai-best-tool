import fs from 'node:fs';
import path from 'node:path';
import { Pool } from 'pg';

const cwd = process.cwd();
const envPath = path.join(cwd, '.env.local');

if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf('=');
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '');
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const needsSSL = connectionString.includes('sslmode=require') || connectionString.includes('supabase.com');
const migrationPath = path.join(cwd, 'db', 'supabase', 'migrations', '20260609_enable_rls_and_lock_sensitive_tables.sql');
const sql = fs.readFileSync(migrationPath, 'utf8');

const pool = new Pool({
  connectionString,
  ssl: needsSSL ? { rejectUnauthorized: false } : false,
  max: 1,
  idleTimeoutMillis: 5000,
  connectionTimeoutMillis: 30000,
  allowExitOnIdle: true,
});

try {
  await pool.query(sql);
  console.log('RLS migration applied successfully.');
} finally {
  await pool.end();
}
