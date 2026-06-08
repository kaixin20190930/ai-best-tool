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
    name: 'poe',
    title: 'Poe',
    url: 'https://poe.com',
    categorySlug: 'chatbot',
    tags: ['chatbot', 'multi-model', 'assistant'],
    summary: 'A multi-model chat app that lets users switch between different AI assistants in one place.',
    detail:
      'Poe is useful for people who want one interface for comparing different assistants, everyday chat, and lightweight research workflows.',
  },
  {
    name: 'character-ai',
    title: 'Character.AI',
    url: 'https://character.ai',
    categorySlug: 'chatbot',
    tags: ['chatbot', 'conversation', 'consumer'],
    summary: 'A conversational AI platform focused on character-style interactions and casual chat experiences.',
    detail:
      'Character.AI adds a more consumer and conversation-led chatbot use case, which broadens the directory beyond productivity-only assistants.',
  },
  {
    name: 'grok',
    title: 'Grok',
    url: 'https://grok.com',
    categorySlug: 'chatbot',
    tags: ['chatbot', 'assistant', 'search'],
    summary: 'A general-purpose AI assistant often used for chat, current topics, and quick research.',
    detail:
      'Grok is a relevant mainstream assistant because users often compare it with other general chat products when deciding which assistant to keep using.',
  },
  {
    name: 'goblin-tools',
    title: 'Goblin Tools',
    url: 'https://goblin.tools',
    categorySlug: 'life-assistant',
    tags: ['life-assistant', 'planning', 'task-breakdown'],
    summary: 'A practical helper for breaking tasks down, estimating effort, and making daily work feel more manageable.',
    detail:
      'Goblin Tools fits the life assistant category well because it helps with day-to-day planning, task breakdown, and reducing the friction of getting started.',
  },
  {
    name: 'personal-ai',
    title: 'Personal AI',
    url: 'https://www.personal.ai',
    categorySlug: 'life-assistant',
    tags: ['life-assistant', 'memory', 'personal-assistant'],
    summary: 'A personal AI platform focused on memory, private knowledge, and individualized assistant behavior.',
    detail:
      'Personal AI gives the directory a stronger personal-assistant angle, especially for users who want memory and private context rather than generic chat.',
  },
  {
    name: 'rewind',
    title: 'Rewind',
    url: 'https://www.rewind.ai',
    categorySlug: 'life-assistant',
    tags: ['life-assistant', 'memory', 'search'],
    summary: 'A personal memory assistant that helps users search past work, meetings, and on-screen activity.',
    detail:
      'Rewind strengthens the life assistant category by focusing on personal recall, searchable memory, and daily knowledge retrieval.',
  },
  {
    name: 'hugging-face',
    title: 'Hugging Face',
    url: 'https://huggingface.co',
    categorySlug: 'other',
    tags: ['models', 'community', 'platform'],
    summary: 'A model hub and AI platform for exploring, testing, and building with open models and datasets.',
    detail:
      'Hugging Face belongs in the directory because many users and builders start there when evaluating open models, demos, and AI infrastructure.',
  },
  {
    name: 'replicate',
    title: 'Replicate',
    url: 'https://replicate.com',
    categorySlug: 'other',
    tags: ['models', 'api', 'infrastructure'],
    summary: 'A platform for running and integrating machine learning models through APIs and hosted infrastructure.',
    detail:
      'Replicate is a useful “other” entry for teams that need practical model access, inference APIs, and an easier path from experimentation to integration.',
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
    en: `${tool.detail}\n\nThis entry was added as a published seed so the directory can keep improving category coverage around real user needs.`,
    zh: `${tool.detail}\n\n此条目已作为正式种子收录，方便目录围绕真实用户需求继续补齐分类覆盖。`,
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
      JSON.stringify(['Daily use', 'Research', 'Personal workflows', 'Assistant tools']),
    ],
  );
}

async function main() {
  const categoryMap = await getCategoryIdMap();
  const missingCategories = ['chatbot', 'life-assistant', 'other'].filter((slug) => !categoryMap.has(slug));
  if (missingCategories.length > 0) {
    throw new Error(`Missing categories: ${missingCategories.join(', ')}`);
  }

  for (const tool of tools) {
    await upsertTool(tool, categoryMap.get(tool.categorySlug) || null);
  }

  const counts = await pool.query(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status = 'published')::int AS published,
      COUNT(*) FILTER (WHERE status = 'draft')::int AS draft
    FROM tools
  `);

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
