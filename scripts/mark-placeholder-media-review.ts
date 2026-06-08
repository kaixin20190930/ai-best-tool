/* eslint-disable no-restricted-syntax, no-continue, no-await-in-loop */
import fs from 'node:fs';
import { getPool } from '@/db/neon/client';
import {
  isPlaceholderMediaUrl,
  PLACEHOLDER_MEDIA_REASON,
} from '@/lib/services/mediaReview';

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

loadLocalEnv();

const pool = getPool();

async function main() {
  const result = await pool.query(
    `
      SELECT id, name, image_url, thumbnail_url, features
      FROM tools
      WHERE status = 'published'
    `
  );

  let updated = 0;

  for (const row of result.rows) {
    const imageUrl = typeof row.image_url === 'string' ? row.image_url : '';
    const thumbnailUrl = typeof row.thumbnail_url === 'string' ? row.thumbnail_url : '';

    if (!isPlaceholderMediaUrl(imageUrl) && !isPlaceholderMediaUrl(thumbnailUrl)) {
      continue;
    }

    const features =
      row.features && typeof row.features === 'object'
        ? (row.features as Record<string, unknown>)
        : {};
    const mediaReview =
      features.mediaReview && typeof features.mediaReview === 'object'
        ? (features.mediaReview as Record<string, unknown>)
        : {};

    await pool.query(
      `
        UPDATE tools
        SET features = $2,
            updated_at = NOW()
        WHERE id = $1
      `,
      [
        row.id,
        JSON.stringify({
          ...features,
          mediaReview: {
            ...mediaReview,
            needed: true,
            markedAt:
              typeof mediaReview.markedAt === 'string' && mediaReview.markedAt
                ? mediaReview.markedAt
                : new Date().toISOString(),
            reason: PLACEHOLDER_MEDIA_REASON,
          },
        }),
      ]
    );

    updated += 1;
  }

  console.log(
    JSON.stringify(
      {
        updated,
        checked: result.rows.length,
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
