/* eslint-disable no-console, no-restricted-syntax, no-continue, no-await-in-loop, @typescript-eslint/no-unused-vars */
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
  features?: string[];
  useCases?: string[];
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
    name: 'elicit',
    title: 'Elicit',
    url: 'https://elicit.com',
    categorySlug: 'research',
    tags: ['research', 'writing', 'llm'],
    summary: 'An AI research assistant for literature review, question framing, and evidence gathering.',
    detail:
      'Elicit belongs in the research category because many users rely on it to structure early-stage analysis, pull evidence together, and explore a topic before writing.',
    pricing: 'freemium',
    features: ['Literature review support', 'Evidence gathering', 'Research synthesis'],
    useCases: ['Research discovery', 'Question framing', 'Source comparison', 'Evidence review'],
  },
  {
    name: 'papers-with-code',
    title: 'Papers with Code',
    url: 'https://paperswithcode.com',
    categorySlug: 'research',
    tags: ['research', 'open-source', 'models'],
    summary: 'A research discovery platform that connects papers, benchmarks, and open implementations.',
    detail:
      'Papers with Code is a strong research listing for builders who want to explore new papers while keeping one foot in practical implementation.',
    pricing: 'free',
    features: ['Papers and benchmarks', 'Implementation links', 'Research tracking'],
    useCases: ['Model discovery', 'Benchmark comparison', 'Implementation research', 'Technical exploration'],
  },
  {
    name: 'kaggle',
    title: 'Kaggle',
    url: 'https://www.kaggle.com',
    categorySlug: 'research',
    tags: ['research', 'community', 'models'],
    summary: 'A community platform for datasets, experiments, model exploration, and practical AI benchmarking.',
    detail:
      'Kaggle gives the research category a broader data and experimentation angle, especially for people exploring datasets and practical evaluation work.',
    pricing: 'free',
    features: ['Dataset discovery', 'Experiment notebooks', 'Community benchmarks'],
    useCases: ['Dataset research', 'Model evaluation', 'Practical benchmarking', 'Learning workflows'],
  },
  {
    name: 'langsmith',
    title: 'LangSmith',
    url: 'https://www.langchain.com/langsmith',
    categorySlug: 'developer-tools',
    tags: ['developer-tools', 'api', 'llm'],
    summary: 'A developer platform for tracing, evaluating, and improving LLM applications.',
    detail:
      'LangSmith fits the developer tools category because it helps teams inspect prompts, trace agent behavior, and tighten reliability before shipping.',
    pricing: 'paid',
    features: ['Tracing and evaluation', 'Prompt inspection', 'LLM app debugging'],
    useCases: ['Agent debugging', 'Prompt evaluation', 'LLM quality control', 'Dev workflows'],
  },
  {
    name: 'pinecone',
    title: 'Pinecone',
    url: 'https://www.pinecone.io',
    categorySlug: 'developer-tools',
    tags: ['developer-tools', 'api', 'infrastructure'],
    summary: 'A vector database platform used to power retrieval, memory, and production AI search workflows.',
    detail:
      'Pinecone belongs in developer tools because it is a common foundation when teams move from prototype chat to production retrieval and search.',
    pricing: 'paid',
    features: ['Vector database', 'Retrieval infrastructure', 'Production-scale search'],
    useCases: ['RAG pipelines', 'Semantic search', 'Agent memory', 'Production AI backends'],
  },
  {
    name: 'openrouter',
    title: 'OpenRouter',
    url: 'https://openrouter.ai',
    categorySlug: 'developer-tools',
    tags: ['developer-tools', 'api', 'llm'],
    summary: 'A unified API layer for accessing multiple AI models through one developer-friendly endpoint.',
    detail:
      'OpenRouter strengthens the developer tools category because it helps builders compare models and swap providers without constantly rewriting integrations.',
    pricing: 'freemium',
    features: ['Unified model API', 'Multi-provider access', 'Routing flexibility'],
    useCases: ['Model comparison', 'API experimentation', 'Provider fallback', 'Builder workflows'],
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
    en: `${tool.detail}\n\nThis entry was added as a published seed so the directory can keep deepening research and developer workflows.`,
    zh: `${tool.detail}\n\n此条目已作为正式种子收录，方便目录围绕研究与开发者工作流继续加深。`,
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
      JSON.stringify(tool.features || ['Published seed entry', `Official site: ${normalizedUrl}`]),
      JSON.stringify(tool.useCases || ['Research workflows', 'Developer workflows']),
    ],
  );
}

async function main() {
  const categoryMap = await getCategoryIdMap();
  const missingCategories = ['research', 'developer-tools'].filter((slug) => !categoryMap.has(slug));
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
