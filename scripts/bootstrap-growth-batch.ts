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
    name: 'gemini',
    title: 'Gemini',
    url: 'https://gemini.google.com',
    categorySlug: 'chatbot',
    tags: ['chatbot', 'research', 'multimodal'],
    summary: 'Google’s AI assistant for chat, search-style workflows, and multimodal tasks.',
    detail:
      'Gemini is a strong mainstream assistant for users who want a broadly capable AI product with search, writing, and multimodal support.',
  },
  {
    name: 'copilot',
    title: 'Microsoft Copilot',
    url: 'https://copilot.microsoft.com',
    categorySlug: 'productivity',
    tags: ['chatbot', 'productivity', 'workflow'],
    summary: 'Microsoft’s AI assistant for everyday productivity and general-purpose tasks.',
    detail:
      'Copilot is useful for users who live in Microsoft’s ecosystem or want a broadly available assistant that fits into daily work workflows.',
  },
  {
    name: 'deepseek',
    title: 'DeepSeek',
    url: 'https://www.deepseek.com',
    categorySlug: 'chatbot',
    tags: ['chatbot', 'coding', 'reasoning'],
    summary: 'A widely discussed AI assistant known for coding and reasoning tasks.',
    detail:
      'DeepSeek is a relevant chatbot entry because users often compare it with other general-purpose and coding-oriented assistants.',
  },
  {
    name: 'canva',
    title: 'Canva',
    url: 'https://www.canva.com',
    categorySlug: 'design-art',
    tags: ['design', 'presentation', 'image'],
    summary: 'A popular design platform with AI-assisted creative workflows.',
    detail:
      'Canva belongs in the directory because many users search for AI design workflows, social visuals, and quick creative production.',
  },
  {
    name: 'adobe-firefly',
    title: 'Adobe Firefly',
    url: 'https://firefly.adobe.com',
    categorySlug: 'design-art',
    tags: ['design', 'image', 'generation'],
    summary: 'Adobe’s generative AI suite for image and creative content generation.',
    detail:
      'Adobe Firefly gives the design category a more enterprise-friendly creative AI option and complements the image-generation tools already in the directory.',
  },
  {
    name: 'notta',
    title: 'Notta',
    url: 'https://www.notta.ai',
    categorySlug: 'productivity',
    tags: ['meeting-notes', 'transcription', 'summary'],
    summary: 'An AI transcription and note tool for meetings, interviews, and recordings.',
    detail:
      'Notta is a strong fit for note taking and meeting assistant workflows because it helps convert conversations into usable transcripts and summaries.',
  },
  {
    name: 'descript',
    title: 'Descript',
    url: 'https://www.descript.com',
    categorySlug: 'productivity',
    tags: ['audio', 'transcription', 'editing'],
    summary: 'A collaborative audio and video editor with AI transcription and cleanup tools.',
    detail:
      'Descript is a useful productivity entry for teams and creators who want editing, transcription, and content reuse in one workflow.',
  },
  {
    name: 'writesonic',
    title: 'Writesonic',
    url: 'https://writesonic.com',
    categorySlug: 'text-writing',
    tags: ['writing', 'marketing', 'content'],
    summary: 'An AI writing platform for marketing copy, long-form writing, and content generation.',
    detail:
      'Writesonic is a good addition to the writing category because it covers a broad content-generation use case and serves common SEO and marketing workflows.',
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
    en: `${tool.detail}\n\nThis entry was added as a published seed so the directory can keep expanding around real usage patterns.`,
    zh: `${tool.detail}\n\n此条目已作为正式种子收录，方便目录围绕真实使用场景继续扩展。`,
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
      JSON.stringify(['Daily tasks', 'Writing', 'Notes', 'Creative workflows']),
    ],
  );
}

async function main() {
  const categoryMap = await getCategoryIdMap();
  const missingCategories = ['chatbot', 'productivity', 'design-art', 'text-writing'].filter(
    (slug) => !categoryMap.has(slug),
  );
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
