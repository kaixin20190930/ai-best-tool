/* eslint-disable no-restricted-syntax, no-continue, no-nested-ternary, no-await-in-loop, @typescript-eslint/no-unused-vars */
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

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function domainFromUrl(url: string) {
  const parsed = new URL(url);
  return parsed.hostname.replace(/^www\./, '');
}

function faviconUrl(url: string) {
  const domain = domainFromUrl(url);
  return `https://www.google.com/s2/favicons?sz=128&domain_url=${encodeURIComponent(`https://${domain}`)}`;
}

loadLocalEnv();

const pool = getPool();

const publishNames = ['chatgpt', 'claude', 'cursor', 'midjourney', 'dune'];

async function main() {
  const result = await pool.query(
    `
      SELECT id, name, url
      FROM tools
      WHERE name = ANY($1::text[])
      ORDER BY created_at ASC
    `,
    [publishNames],
  );

  if (result.rowCount !== publishNames.length) {
    throw new Error(`Expected ${publishNames.length} tools, found ${result.rowCount || 0}.`);
  }

  for (const row of result.rows) {
    const thumb = faviconUrl(row.url as string);
    await pool.query(
      `
        UPDATE tools
        SET image_url = $1,
            thumbnail_url = $1,
            status = 'published',
            updated_at = NOW()
        WHERE id = $2
      `,
      [thumb, row.id],
    );
  }

  const counts = await pool.query(
    `
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status = 'published')::int AS published,
        COUNT(*) FILTER (WHERE status = 'draft')::int AS draft
      FROM tools
    `,
  );

  console.log(
    JSON.stringify(
      {
        publishedNames: publishNames,
        summary: counts.rows[0],
      },
      null,
      2,
    ),
  );

  await pool.end();
}

main().catch(async (error) => {
  console.error(error);
  try {
    await pool.end();
  } catch {
    // ignore
  }
  process.exit(1);
});
