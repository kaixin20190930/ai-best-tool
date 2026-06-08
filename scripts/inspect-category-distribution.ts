/* eslint-disable no-console */
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

  const categories = await pool.query(`
    SELECT
      c.slug,
      COALESCE(c.name->>'en', c.slug) AS name,
      COUNT(t.id)::int AS tool_count
    FROM categories c
    LEFT JOIN tools t
      ON t.category_id = c.id
     AND t.status = 'published'
    GROUP BY c.id, c.slug, c.name
    ORDER BY tool_count ASC, c.slug ASC
  `);

  const uncategorized = await pool.query(`
    SELECT COUNT(*)::int AS count
    FROM tools
    WHERE status = 'published'
      AND category_id IS NULL
  `);

  console.log(
    JSON.stringify(
      {
        categories: categories.rows,
        uncategorized: uncategorized.rows[0]?.count ?? 0,
      },
      null,
      2,
    ),
  );

  await pool.end();
}

main().catch(async (error) => {
  console.error(error);
  process.exitCode = 1;
});
