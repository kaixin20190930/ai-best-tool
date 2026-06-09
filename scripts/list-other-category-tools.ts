/* eslint-disable no-console, no-restricted-syntax, no-continue */
import fs from 'node:fs';
import { getPool } from '@/db/neon/client';

function loadLocalEnv() {
  const envPath = '/Users/liukai/web/ai-best-tool/.env.local';
  const envText = fs.readFileSync(envPath, 'utf8');

  for (const line of envText.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    const value = trimmed
      .slice(eq + 1)
      .trim()
      .replace(/^['"]|['"]$/g, '');

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

async function main() {
  loadLocalEnv();
  const pool = getPool();

  const result = await pool.query(`
    SELECT
      t.id,
      t.name,
      COALESCE(t.title->>'en', t.name) AS title,
      c.slug AS category_slug,
      t.tags,
      t.pricing,
      t.status
    FROM tools t
    LEFT JOIN categories c ON c.id = t.category_id
    WHERE t.status = 'published'
      AND c.slug = 'other'
    ORDER BY t.name ASC
  `);

  console.log(JSON.stringify(result.rows, null, 2));
  await pool.end();
}

main().catch(async (error) => {
  console.error(error);
  process.exitCode = 1;
});
