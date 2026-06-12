/* eslint-disable no-console */
import fs from 'node:fs';

import { closePool, query } from '@/db/neon/client';

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
  {
    name: 'thirdweb',
    imageUrl: 'https://framerusercontent.com/images/6UCnwoW4U3z16zLNLf31n4ZkyY.png',
    thumbnailUrl: 'https://framerusercontent.com/assets/l14UODga5UI2k9FWo5BV8mjT2k.png',
    mediaReason: 'Official icon and og preview added from public thirdweb pages.',
  },
  {
    name: 'quillbot',
    imageUrl: 'https://quillbot.com/rebrand/favicon-32x32.png',
    thumbnailUrl: 'https://assets.quillbot.com/images/og-quillbot.png',
    mediaReason: 'Official favicon and og preview added from public QuillBot pages.',
  },
  {
    name: 'claude',
    imageUrl: 'https://cdn.prod.website-files.com/6889473510b50328dbb70ae6/689f4a9aff1f63fde75cf733_favicon.png',
    thumbnailUrl:
      'https://cdn.prod.website-files.com/6889473510b50328dbb70ae6/68c469d23594abeb9ab6ee48_70ed020ecf8fa028b9bc95fa819720b6_og_claude-generic.jpg',
    mediaReason: 'Official favicon and og preview added from public Claude by Anthropic pages.',
  },
  {
    name: 'wordtune',
    imageUrl: 'https://cdn.prod.website-files.com/5f7e0f9d75fee6f6f546df46/64edbd73b743162bd24f64bc_favicon.png',
    thumbnailUrl:
      'https://cdn.prod.website-files.com/5f7e0f9d75fee6f6f546df46/66bc50ae0f2962888d8e06a2_OG%20-%20HOME%20PAGE%20.png',
    mediaReason: 'Official favicon and og preview added from public Wordtune pages.',
  },
  {
    name: 'jasper',
    imageUrl: 'https://cdn.prod.website-files.com/6807ee8d73c233fb82842313/681e121b52f97ed0b2098aab_Favicon.png',
    thumbnailUrl:
      'https://cdn.prod.website-files.com/6807ee8d73c233fb82842313/6846454bda26628fcf51d54c_9650916b48ce089735bcc21cc8e43f2f_OpenGraph%20-%20Home.png',
    mediaReason: 'Official favicon and og preview added from public Jasper pages.',
  },
  {
    name: 'copy-ai',
    imageUrl: 'https://cdn.prod.website-files.com/628288c5cd3e8411b90a36a4/6793eea386b5ac27242bb8eb_favicon_32x32px%20(1).png',
    thumbnailUrl:
      'https://cdn.prod.website-files.com/628288c5cd3e8411b90a36a4/67111b6951504ebf1467be96_6708d064807b31c351b41284_share-og-image%20(1)-min.png',
    mediaReason: 'Official favicon and og preview added from public Copy.ai pages.',
  },
  {
    name: 'chatgpt',
    imageUrl: 'https://chatgpt.com/favicon.ico',
    thumbnailUrl: 'https://image.thum.io/get/width/1200/noanimate/https://chatgpt.com',
    mediaReason: 'Official favicon and a live homepage screenshot were added for ChatGPT.',
  },
  {
    name: 'defillama',
    imageUrl: 'https://defillama.com/favicon.ico',
    thumbnailUrl: 'https://image.thum.io/get/width/1200/noanimate/https://defillama.com',
    mediaReason: 'Official favicon and a live homepage screenshot were added for DefiLlama.',
  },
  {
    name: 'grammarly',
    imageUrl: 'https://static-web.grammarly.com/cms/master/public/favicon-32x32.png',
    thumbnailUrl: 'https://static-web.grammarly.com/1e6ajr2k4140/1kGiUxfxoLhCPH7wGcvknN/c218a7bbcdfc24301fbbfb6ae9892ec6/default_social_share.png',
    mediaReason: 'Official favicon and social preview added from public Grammarly pages.',
  },
  {
    name: 'bolt-new',
    imageUrl: 'https://bolt.new/static/favicon-96x96.png',
    thumbnailUrl: 'https://bolt.new/static/social_preview_index.jpg',
    mediaReason: 'Official favicon and social preview added from public Bolt pages.',
  },
  {
    name: 'phind',
    imageUrl: 'https://www.phind.com/favicon.ico',
    thumbnailUrl: 'https://image.thum.io/get/width/1200/noanimate/https://www.phind.com',
    mediaReason: 'Official favicon and a live homepage screenshot were added for Phind.',
  },
  {
    name: 'runway',
    imageUrl: 'https://runwayml.com/icon.png?icon.0jyqwm2y10pec.png',
    thumbnailUrl: 'https://runwayml.com/opengraph-image.png?opengraph-image.0bt75ga2._tb4.png',
    mediaReason: 'Official favicon and social preview added from public Runway pages.',
  },
  {
    name: 'lovable',
    imageUrl: 'https://lovable.dev/favicon-96x96.png',
    thumbnailUrl: 'https://lovable.dev/img/opengraph-image.png',
    mediaReason: 'Official favicon and social preview added from public Lovable pages.',
  },
  {
    name: 'gemini',
    imageUrl: 'https://www.gstatic.com/lamda/images/gemini_sparkle_4g_512_lt_f94943af3be039176192d.png',
    thumbnailUrl: 'https://www.gstatic.com/lamda/images/gemini_aurora_thumbnail_4g_e74822ff0ca4259beb718.png',
    mediaReason: 'Official favicon and social preview added from public Gemini pages.',
  },
  {
    name: 'gamma',
    imageUrl: 'https://gamma.app/favicon.ico',
    thumbnailUrl: 'https://image.thum.io/get/width/1200/noanimate/https://gamma.app',
    mediaReason: 'Official favicon and a live homepage screenshot were added for Gamma.',
  },
  {
    name: 'midjourney',
    imageUrl: 'https://www.midjourney.com/favicon.ico',
    thumbnailUrl: 'https://image.thum.io/get/width/1200/noanimate/https://www.midjourney.com',
    mediaReason: 'Official favicon and a live homepage screenshot were added for Midjourney.',
  },
  {
    name: 'copilot',
    imageUrl: 'https://copilot.microsoft.com/static/cmc/favicon.ico',
    thumbnailUrl: 'https://copilot.microsoft.com/static/cmc/images/meta-image.jpg',
    mediaReason: 'Official favicon and social preview added from public Microsoft Copilot pages.',
  },
  {
    name: 'notion-ai',
    imageUrl: 'https://www.notion.so/front-static/favicon.ico',
    thumbnailUrl: 'https://www.notion.com/front-static/meta/custom-agents-og.png',
    mediaReason: 'Official favicon and social preview added from public Notion AI pages.',
  },
  {
    name: 'v0',
    imageUrl: 'https://v0.dev/assets/icon-light-32x32.png',
    thumbnailUrl: 'https://v0.app/chat/api/og',
    mediaReason: 'Official favicon and social preview added from public v0 pages.',
  },
  {
    name: 'grok',
    imageUrl: 'https://grok.com/images/favicon.ico',
    thumbnailUrl: 'https://grok.com/icon-512x512.png',
    mediaReason: 'Official favicon and social preview added from public Grok pages.',
  },
  {
    name: 'cursor',
    imageUrl: 'https://cursor.com/marketing-static/favicon.ico',
    thumbnailUrl: 'https://cursor.com/marketing-static/og/opengraph-default.png',
    mediaReason: 'Official favicon and social preview added from public Cursor pages.',
  },
  {
    name: 'elevenlabs',
    imageUrl: 'https://elevenlabs.io/favicon.ico?9c55860cee08706b',
    thumbnailUrl: 'https://elevenlabs.io/cover.png',
    mediaReason: 'Official favicon and social preview added from public ElevenLabs pages.',
  },
  {
    name: 'perplexity',
    imageUrl: 'https://www.perplexity.ai/favicon.ico',
    thumbnailUrl: 'https://image.thum.io/get/width/1200/noanimate/https://www.perplexity.ai',
    mediaReason: 'Official favicon and a live homepage screenshot were added for Perplexity.',
  },
  {
    name: 'sigoo',
    imageUrl: '/icons/tool-logos/sigoo.svg',
    thumbnailUrl: '/images/tool-media/sigoo-cover.svg',
    mediaReason: 'Locally hosted editorial media kit added for Sigoo while the public product site is still being finalized.',
  },
];

async function main() {
  loadLocalEnv();

  for (const item of updates) {
    const existing = await query('SELECT id, features FROM tools WHERE name = $1 LIMIT 1', [item.name]);

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

    await query(
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

  const result = await query(
    `
      SELECT
        name,
        image_url,
        thumbnail_url,
        features->'mediaReview' as media_review
      FROM tools
      WHERE name IN (
        'dune',
        'moralis',
        'alchemy',
        'the-graph',
        'thirdweb',
        'quillbot',
        'claude',
        'wordtune',
        'jasper',
        'copy-ai',
        'chatgpt',
        'defillama',
        'grammarly',
        'bolt-new',
        'phind',
        'runway',
        'lovable',
        'gemini',
        'gamma',
        'midjourney',
        'copilot',
        'notion-ai',
        'v0',
        'grok',
        'cursor',
        'elevenlabs',
        'perplexity',
        'sigoo'
      )
      ORDER BY name
    `,
  );

  console.log(JSON.stringify(result.rows, null, 2));
  await closePool();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
