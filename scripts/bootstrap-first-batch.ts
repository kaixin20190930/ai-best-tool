/* eslint-disable no-restricted-syntax, no-continue, no-nested-ternary, no-await-in-loop, @typescript-eslint/no-unused-vars */
import fs from 'node:fs';
import { getPool } from '@/db/neon/client';

type SourceSeed = {
  name: string;
  url: string;
  sourceType: 'rss' | 'html' | 'api' | 'manual';
  frequency: 'manual' | 'daily' | 'weekly';
  notes: string;
};

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

function normalizeUrl(url: string) {
  const trimmed = url.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return new URL(withProtocol).toString();
}

function addDays(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

loadLocalEnv();

const pool = getPool();

const sources: SourceSeed[] = [
  {
    name: 'Product Hunt AI',
    url: 'https://www.producthunt.com/topics/artificial-intelligence',
    sourceType: 'html',
    frequency: 'daily',
    notes: 'Primary AI discovery source for trending product pages and fresh launches.',
  },
  {
    name: 'Product Hunt Web3',
    url: 'https://www.producthunt.com/topics/web3',
    sourceType: 'html',
    frequency: 'weekly',
    notes: 'Web3 discovery source for crypto, on-chain, and agent-adjacent tooling.',
  },
  {
    name: 'FutureTools',
    url: 'https://www.futuretools.io/',
    sourceType: 'html',
    frequency: 'weekly',
    notes: 'Curated AI tools directory with broad tool coverage.',
  },
  {
    name: "There's An AI For That",
    url: 'https://theresanaiforthat.com/',
    sourceType: 'html',
    frequency: 'weekly',
    notes: 'Large AI directory useful for breadth and category backfilling.',
  },
  {
    name: 'Futurepedia',
    url: 'https://www.futurepedia.io/',
    sourceType: 'html',
    frequency: 'weekly',
    notes: 'General AI tools directory with recurring category signals.',
  },
  {
    name: 'Toolify',
    url: 'https://www.toolify.ai/',
    sourceType: 'html',
    frequency: 'weekly',
    notes: 'AI tool directory with strong discovery overlap.',
  },
];

const tools: ToolSeed[] = [
  {
    name: 'chatgpt',
    title: 'ChatGPT',
    url: 'https://chatgpt.com',
    categorySlug: 'chatbot',
    tags: ['chatbot', 'writing', 'search'],
    summary: 'A general-purpose conversational AI for drafting, answering, and workflow assistance.',
    detail:
      'ChatGPT is the default conversational AI for many users. It is best used for brainstorming, drafting, summarizing, and quick knowledge retrieval before deeper review.',
  },
  {
    name: 'claude',
    title: 'Claude',
    url: 'https://claude.ai',
    categorySlug: 'chatbot',
    tags: ['chatbot', 'writing', 'analysis'],
    summary: 'A strong writing and reasoning assistant for long-form work and analysis.',
    detail:
      'Claude is especially good for structured writing, analysis, and working through long context. It is a strong fit for teams that want a careful AI assistant for product work and research.',
  },
  {
    name: 'perplexity',
    title: 'Perplexity',
    url: 'https://www.perplexity.ai',
    categorySlug: 'chatbot',
    tags: ['chatbot', 'search', 'research'],
    summary: 'A search-first AI assistant for research and cited answers.',
    detail:
      'Perplexity is useful when the user wants quick answers with source grounding. It works well as a research front end before deeper manual verification.',
  },
  {
    name: 'cursor',
    title: 'Cursor',
    url: 'https://www.cursor.com',
    categorySlug: 'productivity',
    tags: ['coding', 'productivity', 'workflow'],
    summary: 'An AI coding editor designed to speed up software development workflows.',
    detail:
      'Cursor is one of the most visible AI coding tools. It is a good benchmark for the coding and productivity category because it combines code editing with AI assistance in a clear workflow.',
  },
  {
    name: 'notion-ai',
    title: 'Notion AI',
    url: 'https://www.notion.so/product/ai',
    categorySlug: 'productivity',
    tags: ['productivity', 'workflow', 'writing'],
    summary: 'AI inside Notion for notes, docs, and team workflows.',
    detail:
      'Notion AI helps turn note-taking and documentation into a more useful workflow. It is a practical fit for teams that already live inside Notion.',
  },
  {
    name: 'midjourney',
    title: 'Midjourney',
    url: 'https://www.midjourney.com',
    categorySlug: 'design-art',
    tags: ['design', 'image', 'generation'],
    summary: 'A popular image generation tool for high-quality creative visuals.',
    detail:
      'Midjourney remains one of the most recognizable image-generation products. It belongs in the design and art track because of its creative output and strong visual appeal.',
  },
  {
    name: 'runway',
    title: 'Runway',
    url: 'https://runwayml.com',
    categorySlug: 'design-art',
    tags: ['video', 'design', 'generation'],
    summary: 'A creative AI platform for image and video generation and editing.',
    detail:
      'Runway is a good benchmark for AI video and creative editing. It gives the directory a stronger media-generation angle.',
  },
  {
    name: 'gamma',
    title: 'Gamma',
    url: 'https://gamma.app',
    categorySlug: 'design-art',
    tags: ['presentation', 'design', 'productivity'],
    summary: 'An AI presentation and document builder for fast visual storytelling.',
    detail:
      'Gamma is useful for decks, polished docs, and presentation-first workflows. It sits between design and productivity.',
  },
  {
    name: 'elevenlabs',
    title: 'ElevenLabs',
    url: 'https://elevenlabs.io',
    categorySlug: 'life-assistant',
    tags: ['audio', 'voice', 'generation'],
    summary: 'A leading voice and audio generation tool with natural sounding outputs.',
    detail:
      'ElevenLabs is a strong addition to the directory because it covers voice generation and audio workflows that users often search for separately from writing or design.',
  },
  {
    name: 'phind',
    title: 'Phind',
    url: 'https://www.phind.com',
    categorySlug: 'chatbot',
    tags: ['search', 'coding', 'chatbot'],
    summary: 'A search-driven AI assistant focused on developer and technical questions.',
    detail:
      'Phind is useful for developers who want quick technical answers with search support. It also gives the chatbot category a more practical coding angle.',
  },
  {
    name: 'lovable',
    title: 'Lovable',
    url: 'https://lovable.dev',
    categorySlug: 'productivity',
    tags: ['productivity', 'coding', 'workflow'],
    summary: 'A fast product-building tool for turning ideas into app prototypes.',
    detail:
      'Lovable fits the productivity category because it helps founders and product teams move from idea to working product quickly.',
  },
  {
    name: 'bolt-new',
    title: 'Bolt.new',
    url: 'https://bolt.new',
    categorySlug: 'productivity',
    tags: ['coding', 'productivity', 'workflow'],
    summary: 'A browser-based AI builder for quick app and prototype generation.',
    detail:
      'Bolt.new is useful for rapid app generation and hands-on prototyping, especially for users who want to move from concept to code quickly.',
  },
  {
    name: 'v0',
    title: 'v0',
    url: 'https://v0.dev',
    categorySlug: 'design-art',
    tags: ['design', 'coding', 'ui'],
    summary: 'An AI UI generator for creating interface ideas and frontend patterns.',
    detail:
      'v0 is a natural fit for design and frontend workflows. It helps teams generate interface ideas and iterate on product UI quickly.',
  },
  {
    name: 'grammarly',
    title: 'Grammarly',
    url: 'https://www.grammarly.com',
    categorySlug: 'text-writing',
    tags: ['writing', 'editing', 'productivity'],
    summary: 'A writing assistant for grammar, clarity, and style improvements.',
    detail:
      'Grammarly belongs in the writing category as a steady, well-known tool for editing, polishing, and improving text quality.',
  },
  {
    name: 'alchemy',
    title: 'Alchemy',
    url: 'https://www.alchemy.com',
    categorySlug: 'web3',
    tags: ['web3', 'crypto', 'api'],
    summary: 'A Web3 infrastructure and developer platform for blockchain apps.',
    detail:
      'Alchemy is a strong anchor item for the Web3 category. It gives the directory a real infrastructure product and a serious developer audience.',
  },
  {
    name: 'thirdweb',
    title: 'thirdweb',
    url: 'https://thirdweb.com',
    categorySlug: 'web3',
    tags: ['web3', 'smart-contracts', 'developer-tools'],
    summary: 'A Web3 development platform for building blockchain apps faster.',
    detail:
      'thirdweb is useful for teams building on-chain products. It is a good fit for the Web3 category because it helps turn blockchain ideas into shipped products.',
  },
  {
    name: 'moralis',
    title: 'Moralis',
    url: 'https://moralis.com',
    categorySlug: 'web3',
    tags: ['web3', 'api', 'data'],
    summary: 'A Web3 data platform for blockchain APIs and app infrastructure.',
    detail:
      'Moralis gives the Web3 section a strong data and API angle, which is useful for developers who need chain data and infrastructure tools.',
  },
  {
    name: 'the-graph',
    title: 'The Graph',
    url: 'https://thegraph.com',
    categorySlug: 'web3',
    tags: ['web3', 'indexing', 'data'],
    summary: 'A decentralized indexing protocol used across many blockchain apps.',
    detail: 'The Graph is a foundational Web3 product and a useful anchor for the on-chain data category.',
  },
  {
    name: 'dune',
    title: 'Dune',
    url: 'https://dune.com',
    categorySlug: 'web3',
    tags: ['web3', 'analytics', 'data'],
    summary: 'A blockchain analytics platform for dashboards and data exploration.',
    detail:
      'Dune is one of the most recognizable analytics products in crypto and Web3. It helps the directory cover real analytical workflows.',
  },
  {
    name: 'defillama',
    title: 'DefiLlama',
    url: 'https://defillama.com',
    categorySlug: 'web3',
    tags: ['web3', 'analytics', 'defi'],
    summary: 'A DeFi analytics and market tracking platform.',
    detail:
      'DefiLlama is a strong Web3 analytics reference point. It belongs in the directory because many users actively search for DeFi data and comparison tools.',
  },
];

async function ensureCategory(
  slug: string,
  nameEn: string,
  nameZh: string,
  descriptionEn: string,
  descriptionZh: string,
  orderIndex: number,
) {
  await pool.query(
    `
      INSERT INTO categories (name, slug, description, order_index)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (slug)
      DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        order_index = LEAST(categories.order_index, EXCLUDED.order_index)
    `,
    [
      JSON.stringify({ en: nameEn, zh: nameZh }),
      slug,
      JSON.stringify({ en: descriptionEn, zh: descriptionZh }),
      orderIndex,
    ],
  );
}

async function getCategoryIdMap() {
  const rows = await pool.query('SELECT id, slug FROM categories');
  return new Map<string, string>(rows.rows.map((row) => [row.slug as string, row.id as string]));
}

async function upsertSource(source: SourceSeed) {
  const normalizedUrl = normalizeUrl(source.url);
  const nextRunAt = source.frequency === 'daily' ? addDays(1) : source.frequency === 'weekly' ? addDays(7) : null;

  await pool.query(
    `
      INSERT INTO collection_sources (
        name, url, source_type, frequency, enabled, notes, next_run_at
      )
      VALUES ($1, $2, $3, $4, TRUE, $5, $6)
      ON CONFLICT (url)
      DO UPDATE SET
        name = EXCLUDED.name,
        source_type = EXCLUDED.source_type,
        frequency = EXCLUDED.frequency,
        enabled = TRUE,
        notes = EXCLUDED.notes,
        next_run_at = EXCLUDED.next_run_at
    `,
    [source.name, normalizedUrl, source.sourceType, source.frequency, source.notes, nextRunAt],
  );
}

async function upsertTool(tool: ToolSeed, categoryId: string | null) {
  const normalizedUrl = normalizeUrl(tool.url);
  const title = { en: tool.title, zh: tool.title };
  const summary = {
    en: tool.summary,
    zh: tool.summary,
  };
  const detail = {
    en: `${tool.detail}\n\nInitial draft imported by bootstrap so the editorial team can enrich it.`,
    zh: `${tool.detail}\n\n此条目由 bootstrap 导入为草稿，后续可继续补全分类、截图、价格与文案。`,
  };

  await pool.query(
    `
      INSERT INTO tools (
        name, title, content, detail, url, category_id, tags, pricing, status, features, use_cases
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'draft', $9, $10)
      ON CONFLICT (name)
      DO UPDATE SET
        title = EXCLUDED.title,
        content = EXCLUDED.content,
        detail = EXCLUDED.detail,
        url = EXCLUDED.url,
        category_id = EXCLUDED.category_id,
        tags = EXCLUDED.tags,
        pricing = EXCLUDED.pricing,
        status = 'draft',
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
      categoryId,
      tool.tags,
      tool.pricing || 'freemium',
      JSON.stringify([`Official site: ${normalizedUrl}`, 'Initial draft only; enrich before publishing.']),
      JSON.stringify(['Review product positioning', 'Check pricing and screenshots', 'Enrich category and tags']),
    ],
  );
}

async function main() {
  await ensureCategory(
    'web3',
    'Web3',
    'Web3',
    'Blockchain, on-chain, DeFi, and crypto infrastructure tools.',
    '区块链、链上、DeFi 和加密基础设施工具。',
    99,
  );

  const categoryMap = await getCategoryIdMap();

  for (const source of sources) {
    await upsertSource(source);
  }

  for (const tool of tools) {
    const categoryId = categoryMap.get(tool.categorySlug) || null;
    await upsertTool(tool, categoryId);
  }

  const counts = {
    sources: (await pool.query('SELECT COUNT(*)::int AS count FROM collection_sources')).rows[0].count,
    tools: (await pool.query('SELECT COUNT(*)::int AS count FROM tools')).rows[0].count,
    web3Category: categoryMap.get('web3') || null,
  };

  console.log(JSON.stringify(counts, null, 2));
  await pool.end();
}

main().catch(async (error) => {
  console.error(error);
  try {
    await pool.end();
  } catch {
    // ignore close failures
  }
  process.exit(1);
});
