#!/usr/bin/env tsx
/**
 * Apply the distribution schema migrations in order.
 *
 * This is a small recovery helper for environments that have the app code
 * but have not yet received the distribution workspace / target migrations.
 */

import fs from 'node:fs';
import path from 'node:path';

import { config } from 'dotenv';
import { Pool } from 'pg';

config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL_UNPOOLED;

if (!connectionString) {
  console.error('❌ Missing DATABASE_URL / POSTGRES_URL / DATABASE_URL_UNPOOLED');
  process.exit(1);
}

const migrationFiles = [
  '20260719_product_distribution_module.sql',
  '20260728_distribution_targets.sql',
  '20260728_distribution_targets_versioning.sql',
  '20260728_distribution_task_state_machine.sql',
];

const pool = new Pool({
  connectionString,
  ssl: connectionString.includes('supabase.com') || connectionString.includes('sslmode=require')
    ? { rejectUnauthorized: false }
    : false,
  max: 1,
  idleTimeoutMillis: 5_000,
  connectionTimeoutMillis: 30_000,
  allowExitOnIdle: true,
});

async function main() {
  console.log('🔧 Applying distribution migrations...');

  await pool.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
  await pool.query('CREATE SCHEMA IF NOT EXISTS auth;');
  await pool.query(`
    CREATE OR REPLACE FUNCTION auth.uid()
    RETURNS uuid
    LANGUAGE sql
    STABLE
    AS $$ SELECT NULL::uuid $$;
  `);
  await pool.query(`
    CREATE OR REPLACE FUNCTION auth.role()
    RETURNS text
    LANGUAGE sql
    STABLE
    AS $$ SELECT 'authenticated'::text $$;
  `);
  console.log('→ Bootstrapped pgcrypto + auth compatibility');

  for (const fileName of migrationFiles) {
    const filePath = path.join(process.cwd(), 'db', 'supabase', 'migrations', fileName);
    const sql = fs.readFileSync(filePath, 'utf8');
    console.log(`\n→ ${fileName}`);
    await pool.query(sql);
    console.log('  ✅ Applied');
  }

  console.log('\n✅ Distribution migrations applied successfully.');
}

main()
  .catch((error) => {
    console.error('❌ Failed to apply distribution migrations:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
