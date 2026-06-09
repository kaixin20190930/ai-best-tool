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

type MediaUpdate = {
  name: string;
  imageUrl: string;
  thumbnailUrl: string;
  mediaReason: string;
};

const updates: MediaUpdate[] = [
  {
    name: 'dune',
    imageUrl: 'https://dune.com/favicon.ico',
    thumbnailUrl:
      'https://cdn.sanity.io/images/fox336rh/production/f97da0a09bce49b102a24310e58b2bcd366bc08b-1201x675.webp',
    mediaReason: 'Official favicon and product preview added from public Dune pages.',
  },
  {
    name: 'moralis',
    imageUrl: 'https://moralis.com/favicon.ico',
    thumbnailUrl: 'https://moralis.com/wp-content/uploads/2025/10/moralis-chain-animation-2x-scaled.webp',
    mediaReason: 'Official favicon and product preview added from public Moralis pages.',
  },
  {
    name: 'alchemy',
    imageUrl: 'https://media.alchemy.com/1699253173-alchemy-logo.svg',
    thumbnailUrl: 'https://media.alchemy.com/1765911254-home-og.png',
    mediaReason: 'Official logo and og preview added from public Alchemy pages.',
  },
  {
    name: 'the-graph',
    imageUrl: 'https://storage.thegraph.com/favicons/256x256.png',
    thumbnailUrl: 'https://storage.googleapis.com/graph-website/seo/graph-website.jpg',
    mediaReason: 'Official icon and og preview added from public The Graph pages.',
  },
];

async function main() {
  loadLocalEnv();
  const pool = getPool();

  for (const item of updates) {
    const existing = await pool.query('SELECT id, features FROM tools WHERE name = $1 LIMIT 1', [item.name]);

    if (existing.rows.length === 0) {
      continue;
    }

    const features =
      existing.rows[0].features && typeof existing.rows[0].features === 'object'
        ? (existing.rows[0].features as Record<string, unknown>)
        : {};
    const mediaReview =
      features.mediaReview && typeof features.mediaReview === 'object'
        ? (features.mediaReview as Record<string, unknown>)
        : {};

    await pool.query(
      `
        UPDATE tools
        SET image_url = $2,
            thumbnail_url = $3,
            features = $4,
            updated_at = NOW()
        WHERE id = $1
      `,
      [
        existing.rows[0].id,
        item.imageUrl,
        item.thumbnailUrl,
        JSON.stringify({
          ...features,
          mediaReview: {
            ...mediaReview,
            needed: false,
            reason: item.mediaReason,
            resolvedAt: new Date().toISOString(),
          },
        }),
      ],
    );
  }

  const result = await pool.query(
    `
      SELECT
        name,
        image_url,
        thumbnail_url,
        features->'mediaReview' as media_review
      FROM tools
      WHERE name IN ('dune', 'moralis')
         OR name IN ('alchemy', 'the-graph')
      ORDER BY name
    `,
  );

  console.log(JSON.stringify(result.rows, null, 2));
  await pool.end();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
