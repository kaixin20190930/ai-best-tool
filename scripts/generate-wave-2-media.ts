/* eslint-disable no-console */
import fs from 'node:fs';
import path from 'node:path';

import { getPool } from '@/db/neon/client';

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

const TOOLS: MediaSeed[] = [
  {
    name: 'consensus',
    title: 'Consensus',
    category: 'Research',
    accent: '#2563eb',
    accentSoft: '#dbeafe',
    accentStrong: '#1d4ed8',
    surface: '#f8fbff',
    badge: 'Evidence-first',
    summary: 'Paper-backed answers and scientific support',
    logoText: 'Co',
  },
  {
    name: 'scite',
    title: 'Scite',
    category: 'Research',
    accent: '#7c3aed',
    accentSoft: '#ede9fe',
    accentStrong: '#6d28d9',
    surface: '#faf7ff',
    badge: 'Citation context',
    summary: 'Track support, challenge, and citation quality',
    logoText: 'Sc',
  },
  {
    name: 'notebooklm',
    title: 'NotebookLM',
    category: 'Research',
    accent: '#0f766e',
    accentSoft: '#ccfbf1',
    accentStrong: '#0f766e',
    surface: '#f4fffd',
    badge: 'Source-grounded',
    summary: 'Reason over your own docs, notes, and sources',
    logoText: 'NL',
  },
  {
    name: 'langfuse',
    title: 'Langfuse',
    category: 'Developer Tools',
    accent: '#ea580c',
    accentSoft: '#ffedd5',
    accentStrong: '#c2410c',
    surface: '#fff8f3',
    badge: 'LLM observability',
    summary: 'Trace, evaluate, and improve production AI apps',
    logoText: 'Lf',
  },
  {
    name: 'helicone',
    title: 'Helicone',
    category: 'Developer Tools',
    accent: '#db2777',
    accentSoft: '#fce7f3',
    accentStrong: '#be185d',
    surface: '#fff8fc',
    badge: 'Cost + latency',
    summary: 'Monitor requests, spend, and prompt behavior',
    logoText: 'He',
  },
  {
    name: 'portkey',
    title: 'Portkey',
    category: 'Developer Tools',
    accent: '#7c2d12',
    accentSoft: '#ffedd5',
    accentStrong: '#9a3412',
    surface: '#fffaf6',
    badge: 'Gateway control',
    summary: 'Route models, fail over providers, and apply policy',
    logoText: 'Pk',
  },
  {
    name: 'zapier',
    title: 'Zapier',
    category: 'Automation',
    accent: '#f97316',
    accentSoft: '#ffedd5',
    accentStrong: '#ea580c',
    surface: '#fff9f5',
    badge: 'No-code automation',
    summary: 'Connect apps and run repeatable business workflows',
    logoText: 'Za',
  },
  {
    name: 'pipedream',
    title: 'Pipedream',
    category: 'Automation',
    accent: '#0369a1',
    accentSoft: '#e0f2fe',
    accentStrong: '#075985',
    surface: '#f6fbff',
    badge: 'API workflows',
    summary: 'Build event-driven automations with custom logic',
    logoText: 'Pi',
  },
  {
    name: 'lindy',
    title: 'Lindy',
    category: 'Automation',
    accent: '#4f46e5',
    accentSoft: '#e0e7ff',
    accentStrong: '#4338ca',
    surface: '#f8f9ff',
    badge: 'Agent workflows',
    summary: 'Delegate inbox and operational follow-up tasks',
    logoText: 'Li',
  },
];

const ROOT = '/Users/liukai/web/ai-best-tool';
const COVER_DIR = path.join(ROOT, 'public/images/tool-media');
const LOGO_DIR = path.join(ROOT, 'public/icons/tool-logos');

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

function createLogoSvg(seed: MediaSeed) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="256" height="256" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg-${seed.name}" x1="28" y1="24" x2="226" y2="228" gradientUnits="userSpaceOnUse">
      <stop stop-color="${seed.accentSoft}"/>
      <stop offset="1" stop-color="${seed.accent}"/>
    </linearGradient>
  </defs>
  <rect width="256" height="256" rx="56" fill="url(#bg-${seed.name})"/>
  <rect x="24" y="24" width="208" height="208" rx="42" fill="rgba(255,255,255,0.78)"/>
  <rect x="48" y="48" width="160" height="160" rx="36" fill="${seed.accentStrong}"/>
  <circle cx="74" cy="74" r="10" fill="rgba(255,255,255,0.28)"/>
  <circle cx="186" cy="182" r="12" fill="rgba(255,255,255,0.18)"/>
  <text x="128" y="144" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="70" font-weight="800" fill="white">${escapeXml(seed.logoText)}</text>
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
    <linearGradient id="canvas-${seed.name}" x1="64" y1="48" x2="1288" y2="748" gradientUnits="userSpaceOnUse">
      <stop stop-color="${seed.surface}"/>
      <stop offset="1" stop-color="#ffffff"/>
    </linearGradient>
    <linearGradient id="panel-${seed.name}" x1="910" y1="148" x2="1248" y2="520" gradientUnits="userSpaceOnUse">
      <stop stop-color="${seed.accentSoft}"/>
      <stop offset="1" stop-color="${seed.accent}"/>
    </linearGradient>
  </defs>
  <rect width="1400" height="800" rx="44" fill="url(#canvas-${seed.name})"/>
  <circle cx="1238" cy="128" r="132" fill="${seed.accentSoft}" fill-opacity="0.78"/>
  <circle cx="1140" cy="632" r="172" fill="${seed.accentSoft}" fill-opacity="0.55"/>
  <rect x="64" y="64" width="1272" height="672" rx="34" fill="white" stroke="#e2e8f0" stroke-width="2"/>

  <rect x="118" y="126" width="188" height="44" rx="22" fill="${seed.accentSoft}"/>
  <text x="212" y="154" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="700" fill="${seed.accentStrong}">${category}</text>

  <text x="118" y="258" font-family="Inter, Arial, sans-serif" font-size="84" font-weight="800" fill="#0f172a">${title}</text>
  <text x="118" y="324" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="600" fill="${seed.accentStrong}">${badge}</text>
  <text x="118" y="400" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="500" fill="#475569">${summary}</text>

  <rect x="118" y="468" width="478" height="164" rx="28" fill="${seed.surface}" stroke="${seed.accentSoft}" stroke-width="2"/>
  <text x="160" y="534" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="700" fill="#0f172a">Decision page ready</text>
  <text x="160" y="582" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="500" fill="#475569">Localized summary, fit signals,</text>
  <text x="160" y="616" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="500" fill="#475569">and editorial review are now available.</text>

  <rect x="874" y="142" width="360" height="360" rx="42" fill="url(#panel-${seed.name})"/>
  <rect x="914" y="182" width="280" height="280" rx="34" fill="rgba(255,255,255,0.88)"/>
  <text x="1054" y="344" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="108" font-weight="800" fill="${seed.accentStrong}">${escapeXml(seed.logoText)}</text>

  <rect x="874" y="546" width="360" height="86" rx="28" fill="${seed.accentSoft}"/>
  <text x="1054" y="600" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="700" fill="${seed.accentStrong}">Editorial media</text>
</svg>
`;
}

async function updateDatabase(seed: MediaSeed) {
  const pool = getPool();
  const result = await pool.query('SELECT id, features FROM tools WHERE name = $1 LIMIT 1', [seed.name]);
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

  await pool.query(
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

  console.log(`\nDone. Generated local media and updated ${updatedCount} tools.`);
  await getPool().end();
}

main().catch((error) => {
  console.error('\nFailed to generate wave 2 media:', error);
  process.exit(1);
});
