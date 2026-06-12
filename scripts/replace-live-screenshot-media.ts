/* eslint-disable no-console */
import fs from 'node:fs';
import path from 'node:path';

import { closePool, query } from '@/db/neon/client';

type MediaSeed = {
  name: string;
  title: string;
  category: string;
  accent: string;
  accentSoft: string;
  accentStrong: string;
  surface: string;
  badge: string;
  summary: string;
  logoText: string;
};

const ROOT = '/Users/liukai/web/ai-best-tool';
const COVER_DIR = path.join(ROOT, 'public/images/tool-media');

const TOOLS: MediaSeed[] = [
  {
    name: 'chatgpt',
    title: 'ChatGPT',
    category: 'Chatbot',
    accent: '#10a37f',
    accentSoft: '#d1fae5',
    accentStrong: '#047857',
    surface: '#f3fffb',
    badge: 'General AI workspace',
    summary: 'Writing, brainstorming, coding, and research in one flexible assistant.',
    logoText: 'Cg',
  },
  {
    name: 'gamma',
    title: 'Gamma',
    category: 'Design & Art',
    accent: '#7c3aed',
    accentSoft: '#ede9fe',
    accentStrong: '#6d28d9',
    surface: '#faf7ff',
    badge: 'Presentation drafting',
    summary: 'Create decks, docs, and polished visual narratives with AI assistance.',
    logoText: 'Ga',
  },
  {
    name: 'midjourney',
    title: 'Midjourney',
    category: 'Design & Art',
    accent: '#2563eb',
    accentSoft: '#dbeafe',
    accentStrong: '#1d4ed8',
    surface: '#f7fbff',
    badge: 'Image generation',
    summary: 'Generate stylized visual concepts and mood-rich artwork from prompts.',
    logoText: 'Mj',
  },
  {
    name: 'defillama',
    title: 'DefiLlama',
    category: 'Web3',
    accent: '#0f766e',
    accentSoft: '#ccfbf1',
    accentStrong: '#0f766e',
    surface: '#f2fffc',
    badge: 'DeFi market intelligence',
    summary: 'Track protocols, chains, yields, and on-chain flows across the crypto stack.',
    logoText: 'DL',
  },
  {
    name: 'perplexity',
    title: 'Perplexity',
    category: 'Research',
    accent: '#0f172a',
    accentSoft: '#e2e8f0',
    accentStrong: '#0f172a',
    surface: '#f8fafc',
    badge: 'Answer + sources',
    summary: 'Move from question to answer to cited sources with a research-first workflow.',
    logoText: 'Pe',
  },
  {
    name: 'phind',
    title: 'Phind',
    category: 'Developer Tools',
    accent: '#0ea5e9',
    accentSoft: '#e0f2fe',
    accentStrong: '#0369a1',
    surface: '#f5fbff',
    badge: 'Developer search',
    summary: 'Find explanations, code context, and technical answers faster inside dev workflows.',
    logoText: 'Ph',
  },
];

function loadLocalEnv() {
  const envPath = path.join(ROOT, '.env.local');
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
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

function escapeXml(input: string) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function createCoverSvg(seed: MediaSeed) {
  const title = escapeXml(seed.title);
  const category = escapeXml(seed.category);
  const badge = escapeXml(seed.badge);
  const summary = escapeXml(seed.summary);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1400" height="800" viewBox="0 0 1400 800" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="canvas-${seed.name}" x1="80" y1="56" x2="1286" y2="748" gradientUnits="userSpaceOnUse">
      <stop stop-color="${seed.surface}"/>
      <stop offset="1" stop-color="#ffffff"/>
    </linearGradient>
    <linearGradient id="panel-${seed.name}" x1="886" y1="148" x2="1238" y2="512" gradientUnits="userSpaceOnUse">
      <stop stop-color="${seed.accentSoft}"/>
      <stop offset="1" stop-color="${seed.accent}"/>
    </linearGradient>
  </defs>
  <rect width="1400" height="800" rx="44" fill="url(#canvas-${seed.name})"/>
  <circle cx="1246" cy="122" r="132" fill="${seed.accentSoft}" fill-opacity="0.78"/>
  <circle cx="1134" cy="640" r="176" fill="${seed.accentSoft}" fill-opacity="0.52"/>
  <rect x="64" y="64" width="1272" height="672" rx="34" fill="white" stroke="#e2e8f0" stroke-width="2"/>

  <rect x="118" y="126" width="220" height="46" rx="23" fill="${seed.accentSoft}"/>
  <text x="228" y="155" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="700" fill="${seed.accentStrong}">${category}</text>

  <text x="118" y="254" font-family="Inter, Arial, sans-serif" font-size="84" font-weight="800" fill="#0f172a">${title}</text>
  <text x="118" y="322" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="600" fill="${seed.accentStrong}">${badge}</text>
  <text x="118" y="396" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="500" fill="#475569">${summary}</text>

  <rect x="118" y="468" width="540" height="174" rx="30" fill="${seed.surface}" stroke="${seed.accentSoft}" stroke-width="2"/>
  <text x="158" y="530" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="700" fill="#0f172a">Stable editorial preview</text>
  <text x="158" y="578" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="500" fill="#475569">Local media avoids flaky live screenshots</text>
  <text x="158" y="612" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="500" fill="#475569">and keeps this card consistent across deploys.</text>

  <rect x="874" y="142" width="360" height="360" rx="42" fill="url(#panel-${seed.name})"/>
  <rect x="914" y="182" width="280" height="280" rx="34" fill="rgba(255,255,255,0.9)"/>
  <text x="1054" y="344" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="108" font-weight="800" fill="${seed.accentStrong}">${escapeXml(seed.logoText)}</text>

  <rect x="874" y="548" width="360" height="86" rx="28" fill="${seed.accentSoft}"/>
  <text x="1054" y="602" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="700" fill="${seed.accentStrong}">Static media ready</text>
</svg>
`;
}

async function updateDatabase(seed: MediaSeed) {
  const result = await query('SELECT id, features FROM tools WHERE name = $1 LIMIT 1', [seed.name]);
  if (result.rowCount === 0) {
    console.log(`- skipped ${seed.name}: not found`);
    return false;
  }

  const row = result.rows[0];
  const features = row.features && typeof row.features === 'object' ? (row.features as Record<string, unknown>) : {};
  const mediaReview =
    features.mediaReview && typeof features.mediaReview === 'object'
      ? (features.mediaReview as Record<string, unknown>)
      : {};

  await query(
    `
      UPDATE tools
      SET
        thumbnail_url = $2,
        features = $3::jsonb,
        updated_at = NOW()
      WHERE id = $1
    `,
    [
      row.id,
      `/images/tool-media/${seed.name}-editorial-cover.svg`,
      JSON.stringify({
        ...features,
        mediaReview: {
          ...mediaReview,
          needed: false,
          reason: 'Locally hosted editorial preview replaced the temporary live screenshot fallback.',
          resolvedAt: new Date().toISOString(),
          source: 'local-editorial-cover',
        },
      }),
    ],
  );

  console.log(`- replaced live screenshot for ${seed.name}`);
  return true;
}

async function main() {
  loadLocalEnv();
  fs.mkdirSync(COVER_DIR, { recursive: true });

  for (const seed of TOOLS) {
    fs.writeFileSync(path.join(COVER_DIR, `${seed.name}-editorial-cover.svg`), createCoverSvg(seed), 'utf8');
  }

  let updatedCount = 0;
  for (const seed of TOOLS) {
    const updated = await updateDatabase(seed);
    if (updated) updatedCount += 1;
  }

  console.log(`\nDone. Replaced live screenshots for ${updatedCount} tools.`);
  await closePool();
}

main().catch((error) => {
  console.error('\nFailed to replace live screenshot media:', error);
  process.exit(1);
});
