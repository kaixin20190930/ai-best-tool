/* eslint-disable no-restricted-syntax, no-continue, no-nested-ternary, no-await-in-loop, @typescript-eslint/no-unused-vars */
import fs from 'node:fs';
import { getPool } from '@/db/neon/client';

type ToolSeed = {
  name: string;
  title: string;
  url: string;
  categorySlug: string;
  tags: string[];
  summary: string;
  detail: string;
  pricing?: 'free' | 'freemium' | 'paid';
};

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

const tools: ToolSeed[] = [
  {
    name: 'fireflies',
    title: 'Fireflies',
    url: 'https://fireflies.ai',
    categorySlug: 'productivity',
    tags: ['meeting-notes', 'transcription', 'summary'],
    summary: 'An AI meeting assistant that records, transcribes, and summarizes conversations.',
    detail:
      'Fireflies is a strong note taking reference for teams that want searchable meeting notes, automated summaries, and follow-up capture without extra manual work.',
  },
  {
    name: 'otter',
    title: 'Otter',
    url: 'https://otter.ai',
    categorySlug: 'productivity',
    tags: ['meeting-notes', 'transcription', 'collaboration'],
    summary: 'A meeting note tool for live transcription, summaries, and team sharing.',
    detail:
      'Otter is a familiar note taking and meeting transcription tool that fits well for teams documenting calls, interviews, and internal discussions.',
  },
  {
    name: 'fathom',
    title: 'Fathom',
    url: 'https://fathom.video',
    categorySlug: 'productivity',
    tags: ['meeting-notes', 'transcription', 'summary'],
    summary: 'A lightweight AI meeting assistant for notes, highlights, and follow-ups.',
    detail:
      'Fathom works well for users who want quick meeting summaries, key moments, and a cleaner follow-up workflow without having to manage notes manually.',
  },
  {
    name: 'tldv',
    title: 'tl;dv',
    url: 'https://tldv.io',
    categorySlug: 'productivity',
    tags: ['meeting-notes', 'recording', 'summary'],
    summary: 'A meeting recorder and note assistant for capturing and sharing key moments.',
    detail:
      'tl;dv is a practical fit for teams that need to capture meeting highlights, clip key segments, and share notes across the organization.',
  },
  {
    name: 'read-ai',
    title: 'Read AI',
    url: 'https://www.read.ai',
    categorySlug: 'productivity',
    tags: ['meeting-notes', 'analytics', 'summary'],
    summary: 'An AI meeting assistant that summarizes calls and surfaces participation signals.',
    detail:
      'Read AI adds meeting summaries and engagement signals, which makes it a strong entry for teams that care about follow-through and call quality.',
  },
  {
    name: 'granola',
    title: 'Granola',
    url: 'https://www.granola.ai',
    categorySlug: 'productivity',
    tags: ['note-taking', 'meeting-notes', 'workflow'],
    summary: 'A note taking app that helps turn meetings into clean, usable notes.',
    detail:
      'Granola is useful for people who want a lower-friction note taking workflow during meetings and conversations, with a focus on clean outputs.',
  },
  {
    name: 'supernormal',
    title: 'Supernormal',
    url: 'https://supernormal.com',
    categorySlug: 'productivity',
    tags: ['meeting-notes', 'summary', 'workflow'],
    summary: 'An AI assistant for meeting notes, action items, and follow-up summaries.',
    detail:
      'Supernormal is a good fit for teams that want generated meeting notes, action items, and a lightweight workflow for keeping conversations moving.',
  },
  {
    name: 'mem-ai',
    title: 'Mem',
    url: 'https://mem.ai',
    categorySlug: 'life-assistant',
    tags: ['note-taking', 'knowledge-base', 'workflow'],
    summary: 'An AI-powered note organizer for personal knowledge and knowledge capture.',
    detail:
      'Mem is a natural companion to the note taking category because it helps users capture, connect, and revisit ideas in a more organized way.',
  },
];

async function getCategoryIdMap() {
  const rows = await pool.query('SELECT id, slug FROM categories');
  return new Map<string, string>(rows.rows.map((row) => [row.slug as string, row.id as string]));
}

async function upsertTool(tool: ToolSeed, categoryId: string | null) {
  const normalizedUrl = new URL(tool.url).toString();
  const title = { en: tool.title, zh: tool.title };
  const summary = { en: tool.summary, zh: tool.summary };
  const detail = {
    en: `${tool.detail}\n\nThis entry was added as a published seed so the directory can keep growing around real workflows.`,
    zh: `${tool.detail}\n\n此条目已作为正式种子收录，方便目录围绕真实工作流继续扩展。`,
  };
  const thumb = faviconUrl(normalizedUrl);

  await pool.query(
    `
      INSERT INTO tools (
        name, title, content, detail, url, image_url, thumbnail_url, category_id, tags, pricing, status, features, use_cases
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'published', $11, $12)
      ON CONFLICT (name)
      DO UPDATE SET
        title = EXCLUDED.title,
        content = EXCLUDED.content,
        detail = EXCLUDED.detail,
        url = EXCLUDED.url,
        image_url = EXCLUDED.image_url,
        thumbnail_url = EXCLUDED.thumbnail_url,
        category_id = EXCLUDED.category_id,
        tags = EXCLUDED.tags,
        pricing = EXCLUDED.pricing,
        status = 'published',
        features = EXCLUDED.features,
        use_cases = EXCLUDED.use_cases,
        updated_at = NOW()
    `,
    [
      tool.name,
      JSON.stringify(title),
      JSON.stringify(summary),
      JSON.stringify(detail),
      normalizedUrl,
      thumb,
      thumb,
      categoryId,
      tool.tags,
      tool.pricing || 'freemium',
      JSON.stringify(['Published seed entry', `Official site: ${normalizedUrl}`]),
      JSON.stringify(['Meeting notes', 'Summaries', 'Action items', 'Knowledge capture']),
    ],
  );
}

async function main() {
  const categoryMap = await getCategoryIdMap();
  const missingCategories = ['productivity', 'life-assistant'].filter((slug) => !categoryMap.has(slug));
  if (missingCategories.length > 0) {
    throw new Error(`Missing categories: ${missingCategories.join(', ')}`);
  }

  for (const tool of tools) {
    await upsertTool(tool, categoryMap.get(tool.categorySlug) || null);
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
        insertedNames: tools.map((tool) => tool.name),
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
