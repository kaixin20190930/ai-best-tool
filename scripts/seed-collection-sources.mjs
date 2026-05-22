import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

async function loadEnvFile(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const separatorIndex = trimmed.indexOf('=');
      if (separatorIndex === -1) continue;

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed
        .slice(separatorIndex + 1)
        .trim()
        .replace(/^['"]|['"]$/g, '');

      if (key && !process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // Optional in CI.
  }
}

await loadEnvFile(path.join(rootDir, '.env.local'));

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set.');
}

const { Pool } = pg;
const needsSSL =
  process.env.DATABASE_URL.includes('sslmode=require') ||
  process.env.DATABASE_URL.includes('neon.tech');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: needsSSL ? { rejectUnauthorized: false } : false,
});

const sources = [
  {
    name: 'Product Hunt Feed',
    url: 'https://www.producthunt.com/feed',
    sourceType: 'rss',
    frequency: 'daily',
    notes: 'Broad startup/tool feed. Use collected candidates as research leads before publishing.',
  },
];

try {
  for (const source of sources) {
    await pool.query(
      `
        INSERT INTO collection_sources (
          name, url, source_type, frequency, enabled, notes, next_run_at
        )
        VALUES ($1, $2, $3, $4, TRUE, $5, NOW())
        ON CONFLICT (url)
        DO UPDATE SET
          name = EXCLUDED.name,
          source_type = EXCLUDED.source_type,
          frequency = EXCLUDED.frequency,
          enabled = TRUE,
          notes = EXCLUDED.notes,
          next_run_at = NOW()
      `,
      [source.name, source.url, source.sourceType, source.frequency, source.notes]
    );
  }

  console.log(`Seeded ${sources.length} collection source.`);
} finally {
  await pool.end();
}
