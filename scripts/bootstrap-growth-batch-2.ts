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
    name: 'jasper',
    title: 'Jasper',
    url: 'https://www.jasper.ai',
    categorySlug: 'text-writing',
    tags: ['writing', 'marketing', 'copy'],
    summary: 'An AI writing assistant for marketing copy, brand content, and campaign workflows.',
    detail:
      'Jasper is a familiar writing benchmark for teams that want AI help across marketing copy, campaign messaging, and repeatable content production.',
  },
  {
    name: 'copy-ai',
    title: 'Copy.ai',
    url: 'https://www.copy.ai',
    categorySlug: 'text-writing',
    tags: ['writing', 'sales', 'content'],
    summary: 'An AI content platform for sales, marketing, and outbound workflows.',
    detail:
      'Copy.ai is useful for teams that need repeatable writing assistance for outbound messaging, marketing content, and workflow automation.',
  },
  {
    name: 'wordtune',
    title: 'Wordtune',
    url: 'https://www.wordtune.com',
    categorySlug: 'text-writing',
    tags: ['writing', 'editing', 'rewrite'],
    summary: 'A writing companion for rewrites, clarity, and tone improvements.',
    detail:
      'Wordtune is a strong fit for writing and editing workflows when users want faster rewrites, cleaner phrasing, and tone adjustments.',
  },
  {
    name: 'quillbot',
    title: 'QuillBot',
    url: 'https://quillbot.com',
    categorySlug: 'text-writing',
    tags: ['writing', 'paraphrase', 'grammar'],
    summary: 'A writing tool for paraphrasing, grammar, and content polishing.',
    detail:
      'QuillBot gives the directory a well-known writing and paraphrasing option for students, marketers, and everyday editors.',
  },
  {
    name: 'pika',
    title: 'Pika',
    url: 'https://pika.art',
    categorySlug: 'design-art',
    tags: ['video', 'generation', 'creative'],
    summary: 'An AI video generation tool for fast creative motion content.',
    detail:
      'Pika is a useful addition for users comparing modern AI video generation tools and creative motion workflows.',
  },
  {
    name: 'heygen',
    title: 'HeyGen',
    url: 'https://www.heygen.com',
    categorySlug: 'design-art',
    tags: ['video', 'avatar', 'generation'],
    summary: 'An AI avatar and video creation platform for presentations and marketing.',
    detail:
      'HeyGen is strong for avatar-led video, marketing explainers, and quick presentation-style content creation.',
  },
  {
    name: 'synthesia',
    title: 'Synthesia',
    url: 'https://www.synthesia.io',
    categorySlug: 'design-art',
    tags: ['video', 'avatar', 'presentation'],
    summary: 'An AI video creation platform for training, presentations, and internal communication.',
    detail:
      'Synthesia belongs in the directory because it is often used by teams that need scalable video creation without a production team.',
  },
  {
    name: 'luma-ai',
    title: 'Luma AI',
    url: 'https://lumalabs.ai',
    categorySlug: 'design-art',
    tags: ['video', 'generation', '3d'],
    summary: 'An AI creative platform for video generation and 3D-style visual workflows.',
    detail:
      'Luma AI expands the creative generation side of the directory and gives users another video-centric benchmark to compare.',
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
    en: `${tool.detail}\n\nThis entry was added as a published seed so the directory can keep growing around real usage patterns.`,
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
      JSON.stringify(['Writing', 'Video', 'Creative workflows', 'Daily production']),
    ],
  );
}

async function main() {
  const categoryMap = await getCategoryIdMap();
  const missingCategories = ['text-writing', 'design-art'].filter((slug) => !categoryMap.has(slug));
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
