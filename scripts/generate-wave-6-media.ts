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
const LOGO_DIR = path.join(ROOT, 'public/icons/tool-logos');

const TOOLS: MediaSeed[] = [
  {
    name: 'n8n',
    title: 'n8n',
    category: 'Automation',
    accent: '#ef6c39',
    accentSoft: '#ffe7dc',
    accentStrong: '#d14f1d',
    surface: '#fff9f6',
    badge: 'Workflow automation',
    summary: 'Connect apps, orchestrate steps, and build repeatable internal operations.',
    logoText: 'n8',
  },
  {
    name: 'make',
    title: 'Make',
    category: 'Automation',
    accent: '#6d5dfc',
    accentSoft: '#ebe8ff',
    accentStrong: '#5547dd',
    surface: '#faf9ff',
    badge: 'Visual scenarios',
    summary: 'Design multi-step automations visually and connect business tools faster.',
    logoText: 'Mk',
  },
  {
    name: 'openrouter',
    title: 'OpenRouter',
    category: 'Developer Tools',
    accent: '#0f172a',
    accentSoft: '#e2e8f0',
    accentStrong: '#111827',
    surface: '#f8fafc',
    badge: 'Model routing',
    summary: 'Access and route multiple models through one developer-friendly layer.',
    logoText: 'Or',
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
    const value = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
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

function createLogoSvg(seed: MediaSeed) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="256" height="256" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg-${seed.name}" x1="24" y1="24" x2="224" y2="228" gradientUnits="userSpaceOnUse">
      <stop stop-color="${seed.accentSoft}"/>
      <stop offset="1" stop-color="${seed.accent}"/>
    </linearGradient>
  </defs>
  <rect width="256" height="256" rx="56" fill="url(#bg-${seed.name})"/>
  <rect x="24" y="24" width="208" height="208" rx="42" fill="rgba(255,255,255,0.84)"/>
  <rect x="46" y="46" width="164" height="164" rx="38" fill="${seed.accentStrong}"/>
  <circle cx="78" cy="78" r="10" fill="rgba(255,255,255,0.24)"/>
  <circle cx="180" cy="182" r="12" fill="rgba(255,255,255,0.18)"/>
  <text x="128" y="146" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="66" font-weight="800" fill="white">${escapeXml(seed.logoText)}</text>
</svg>
`;
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

  <rect x="118" y="126" width="236" height="46" rx="23" fill="${seed.accentSoft}"/>
  <text x="236" y="155" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="700" fill="${seed.accentStrong}">${category}</text>

  <text x="118" y="252" font-family="Inter, Arial, sans-serif" font-size="82" font-weight="800" fill="#0f172a">${title}</text>
  <text x="118" y="320" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="600" fill="${seed.accentStrong}">${badge}</text>
  <text x="118" y="394" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="500" fill="#475569">${summary}</text>

  <rect x="118" y="470" width="548" height="176" rx="30" fill="${seed.surface}" stroke="${seed.accentSoft}" stroke-width="2"/>
  <text x="160" y="532" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="700" fill="#0f172a">Stable editorial preview</text>
  <text x="160" y="580" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="500" fill="#475569">Local media avoids broken external previews</text>
  <text x="160" y="614" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="500" fill="#475569">and keeps decision pages consistent across deploys.</text>

  <rect x="874" y="142" width="360" height="360" rx="42" fill="url(#panel-${seed.name})"/>
  <rect x="914" y="182" width="280" height="280" rx="34" fill="rgba(255,255,255,0.9)"/>
  <text x="1054" y="344" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="108" font-weight="800" fill="${seed.accentStrong}">${escapeXml(seed.logoText)}</text>

  <rect x="874" y="548" width="360" height="86" rx="28" fill="${seed.accentSoft}"/>
  <text x="1054" y="602" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="700" fill="${seed.accentStrong}">Editorial media ready</text>
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
        image_url = $2,
        thumbnail_url = $3,
        features = $4::jsonb,
        updated_at = NOW()
      WHERE id = $1
    `,
    [
      row.id,
      `/icons/tool-logos/${seed.name}.svg`,
      `/images/tool-media/${seed.name}-cover.svg`,
      JSON.stringify({
        ...features,
        mediaReview: {
          ...mediaReview,
          needed: false,
          reason: 'Locally hosted editorial media kit added for stable logo and preview coverage.',
          resolvedAt: new Date().toISOString(),
          source: 'local-editorial-media',
        },
      }),
    ],
  );

  console.log(`- updated media for ${seed.name}`);
  return true;
}

async function main() {
  loadLocalEnv();
  fs.mkdirSync(COVER_DIR, { recursive: true });
  fs.mkdirSync(LOGO_DIR, { recursive: true });

  for (const seed of TOOLS) {
    fs.writeFileSync(path.join(COVER_DIR, `${seed.name}-cover.svg`), createCoverSvg(seed), 'utf8');
    fs.writeFileSync(path.join(LOGO_DIR, `${seed.name}.svg`), createLogoSvg(seed), 'utf8');
  }

  let updatedCount = 0;
  for (const seed of TOOLS) {
    const updated = await updateDatabase(seed);
    if (updated) updatedCount += 1;
  }

  console.log(`\nDone. Updated media for ${updatedCount} tools.`);
  await closePool();
}

main().catch((error) => {
  console.error('\nFailed to generate wave 6 media:', error);
  process.exit(1);
});
