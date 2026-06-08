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
    name: 'sudowrite',
    title: 'Sudowrite',
    url: 'https://www.sudowrite.com',
    categorySlug: 'text-writing',
    tags: ['writing', 'creative-writing', 'storytelling'],
    summary: 'An AI writing tool built for fiction, storytelling, and creative drafting.',
    detail:
      'Sudowrite is a strong writing entry for people who care more about narrative flow, scene building, and creative drafting than generic marketing copy.',
  },
  {
    name: 'anyword',
    title: 'Anyword',
    url: 'https://anyword.com',
    categorySlug: 'text-writing',
    tags: ['writing', 'marketing', 'copywriting'],
    summary: 'A copywriting and content platform for landing pages, ads, and performance-focused writing.',
    detail:
      'Anyword gives the writing category another practical marketing-oriented option, especially for teams comparing copy tools around campaigns and conversion writing.',
  },
  {
    name: 'hyperwrite',
    title: 'HyperWrite',
    url: 'https://www.hyperwriteai.com',
    categorySlug: 'text-writing',
    tags: ['writing', 'assistant', 'productivity'],
    summary: 'An AI writing assistant for drafting, rewriting, and everyday browser-based help.',
    detail:
      'HyperWrite fits well as a general writing helper for users who want drafting, rewriting, and light assistant behavior in day-to-day workflows.',
  },
  {
    name: 'nansen',
    title: 'Nansen',
    url: 'https://www.nansen.ai',
    categorySlug: 'web3',
    tags: ['web3', 'on-chain', 'analytics'],
    summary: 'An on-chain analytics platform for wallet tracking, token flows, and crypto market research.',
    detail:
      'Nansen is one of the clearest benchmark tools for on-chain analysis, making it a high-value addition for the Web3 category and related guide pages.',
    pricing: 'paid',
  },
  {
    name: 'arkham',
    title: 'Arkham',
    url: 'https://arkhamintelligence.com',
    categorySlug: 'web3',
    tags: ['web3', 'on-chain', 'research'],
    summary: 'A blockchain intelligence platform focused on wallet behavior, entity mapping, and market investigation.',
    detail:
      'Arkham adds a more investigation-oriented on-chain workflow, which helps strengthen the research side of the Web3 directory.',
    pricing: 'freemium',
  },
  {
    name: 'token-terminal',
    title: 'Token Terminal',
    url: 'https://tokenterminal.com',
    categorySlug: 'web3',
    tags: ['web3', 'protocol-analytics', 'research'],
    summary: 'A protocol analytics platform for comparing crypto projects using financial and usage metrics.',
    detail:
      'Token Terminal is especially useful for the protocol analytics line because it helps users compare projects with clearer business and valuation metrics.',
    pricing: 'paid',
  },
  {
    name: 'messari',
    title: 'Messari',
    url: 'https://messari.io',
    categorySlug: 'web3',
    tags: ['web3', 'research', 'analytics'],
    summary: 'A crypto research and analytics platform for protocol, market, and ecosystem analysis.',
    detail:
      'Messari belongs in the Web3 category because many users treat it as a research starting point for protocols, sectors, and market narratives.',
    pricing: 'freemium',
  },
  {
    name: 'zapper',
    title: 'Zapper',
    url: 'https://zapper.xyz',
    categorySlug: 'web3',
    tags: ['web3', 'portfolio', 'wallet-monitoring'],
    summary: 'A wallet and portfolio dashboard for tracking on-chain assets, activity, and protocol exposure.',
    detail:
      'Zapper strengthens the wallet monitoring and portfolio tracking side of the Web3 category, especially for users following assets across protocols.',
    pricing: 'freemium',
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
    en: `${tool.detail}\n\nThis entry was added as a published seed so the directory can grow around stronger writing and Web3 workflows.`,
    zh: `${tool.detail}\n\n此条目已作为正式种子收录，方便目录围绕更完整的写作与 Web3 工作流继续扩展。`,
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
      JSON.stringify(['Writing', 'Research', 'Analytics', 'Professional workflows']),
    ],
  );
}

async function main() {
  const categoryMap = await getCategoryIdMap();
  const missingCategories = ['text-writing', 'web3'].filter((slug) => !categoryMap.has(slug));
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
