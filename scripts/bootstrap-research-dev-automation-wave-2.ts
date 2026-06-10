/* eslint-disable no-console, no-restricted-syntax, no-continue, no-await-in-loop */
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

const TOOLS: ToolSeed[] = [
  {
    name: 'consensus',
    title: 'Consensus',
    url: 'https://consensus.app',
    categorySlug: 'research',
    tags: ['research', 'search', 'evidence', 'academic'],
    summary: 'An AI research engine for finding evidence-backed answers from scientific papers and research sources.',
    detail:
      'Consensus is a strong research entry because it emphasizes source-backed discovery and is useful when users care about evidence rather than broad conversational output alone.',
    pricing: 'freemium',
    features: ['Evidence-backed search', 'Paper discovery', 'Research summaries'],
    useCases: ['Academic discovery', 'Evidence checking', 'Research synthesis', 'Topic exploration'],
  },
  {
    name: 'scite',
    title: 'Scite',
    url: 'https://scite.ai',
    categorySlug: 'research',
    tags: ['research', 'citations', 'academic', 'evidence'],
    summary:
      'A research platform for tracking citations, understanding how papers are referenced, and checking evidence quality.',
    detail:
      'Scite gives the research category more citation-aware depth, which helps users judge whether a source is influential, supported, or contradicted.',
    pricing: 'freemium',
    features: ['Citation analysis', 'Smart citation context', 'Research validation'],
    useCases: ['Paper validation', 'Citation review', 'Evidence quality checks', 'Literature research'],
  },
  {
    name: 'notebooklm',
    title: 'NotebookLM',
    url: 'https://notebooklm.google.com',
    categorySlug: 'research',
    tags: ['research', 'notes', 'summarization', 'knowledge'],
    summary:
      'A source-grounded AI notebook for summarizing, organizing, and reasoning over your own research material.',
    detail:
      'NotebookLM fits the research category because it helps users work through their own sources instead of only browsing public answers, which is a different and valuable workflow.',
    pricing: 'free',
    features: ['Source-grounded summaries', 'Notebook workflow', 'Document reasoning'],
    useCases: ['Research note organization', 'Source summarization', 'Knowledge synthesis', 'Study workflows'],
  },
  {
    name: 'langfuse',
    title: 'Langfuse',
    url: 'https://langfuse.com',
    categorySlug: 'developer-tools',
    tags: ['developer-tools', 'observability', 'llm', 'api'],
    summary:
      'An open-source LLM engineering platform for tracing, evaluating, and observing production AI applications.',
    detail:
      'Langfuse strengthens the developer tools category with a clear observability angle for teams shipping prompts, agents, and model-powered product flows.',
    pricing: 'freemium',
    features: ['LLM tracing', 'Evaluations', 'Open-source observability'],
    useCases: ['Prompt observability', 'LLM app debugging', 'Agent monitoring', 'Production quality review'],
  },
  {
    name: 'helicone',
    title: 'Helicone',
    url: 'https://www.helicone.ai',
    categorySlug: 'developer-tools',
    tags: ['developer-tools', 'observability', 'api', 'llm'],
    summary: 'An LLM observability platform for monitoring requests, costs, latency, and quality across AI workloads.',
    detail:
      'Helicone belongs in developer tools because it helps builders measure AI usage and cost with a strong operations and debugging perspective.',
    pricing: 'freemium',
    features: ['Request monitoring', 'Cost visibility', 'Latency analytics'],
    useCases: ['LLM ops monitoring', 'Cost analysis', 'Prompt debugging', 'Production AI analytics'],
  },
  {
    name: 'portkey',
    title: 'Portkey',
    url: 'https://portkey.ai',
    categorySlug: 'developer-tools',
    tags: ['developer-tools', 'gateway', 'api', 'llm'],
    summary:
      'An AI gateway and control layer for routing models, managing reliability, and standardizing production AI traffic.',
    detail:
      'Portkey gives the developer tools category a useful production-gateway angle for teams that need model routing, fallback logic, and governance.',
    pricing: 'freemium',
    features: ['AI gateway', 'Model routing', 'Reliability controls'],
    useCases: ['Provider fallback', 'Traffic control', 'Model governance', 'Production AI routing'],
  },
  {
    name: 'zapier',
    title: 'Zapier',
    url: 'https://zapier.com',
    categorySlug: 'automation',
    tags: ['automation', 'workflow-automation', 'no-code', 'integrations'],
    summary: 'A widely used automation platform for connecting apps, triggers, and repeatable business workflows.',
    detail:
      'Zapier is an important automation benchmark because many users compare it first when deciding how much complexity and flexibility they actually need.',
    pricing: 'freemium',
    features: ['App integrations', 'Trigger-based workflows', 'No-code automations'],
    useCases: ['Lead routing', 'CRM sync', 'Content workflows', 'Ops automation'],
  },
  {
    name: 'pipedream',
    title: 'Pipedream',
    url: 'https://pipedream.com',
    categorySlug: 'automation',
    tags: ['automation', 'workflow-automation', 'developer-tools', 'api'],
    summary: 'A developer-friendly automation platform for event-driven workflows, APIs, and custom integration logic.',
    detail:
      'Pipedream fits the automation category especially well for users who want more code flexibility than basic no-code connectors can offer.',
    pricing: 'freemium',
    features: ['Event-driven workflows', 'API integrations', 'Code-friendly automations'],
    useCases: ['Webhook workflows', 'API orchestration', 'Backend automations', 'Custom integrations'],
  },
  {
    name: 'lindy',
    title: 'Lindy',
    url: 'https://www.lindy.ai',
    categorySlug: 'automation',
    tags: ['automation', 'ai-agent', 'workflow-automation', 'operations'],
    summary:
      'An AI assistant and workflow automation tool for handling repeatable operational tasks across apps and communication channels.',
    detail:
      'Lindy adds a more agent-shaped automation option, which is useful for users comparing classic workflow automation against AI-first operators.',
    pricing: 'freemium',
    features: ['AI assistants', 'Task automation', 'Cross-app workflows'],
    useCases: ['Executive support', 'Follow-up automations', 'Ops workflows', 'AI task handling'],
  },
];

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

async function getCategoryIdMap() {
  const rows = await pool.query('SELECT id, slug FROM categories');
  return new Map<string, string>(rows.rows.map((row) => [String(row.slug), String(row.id)]));
}

async function upsertTool(tool: ToolSeed, categoryId: string | null) {
  const normalizedUrl = new URL(tool.url).toString();
  const title = { en: tool.title, zh: tool.title };
  const summary = { en: tool.summary, zh: tool.summary };
  const detail = {
    en: `${tool.detail}\n\nThis entry was added as a published seed so the directory can keep deepening real research, developer, and automation workflows.`,
    zh: `${tool.detail}\n\n此条目已作为正式种子收录，方便目录围绕真实研究、开发者与自动化工作流继续补强。`,
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
      JSON.stringify(tool.useCases || ['Research workflows', 'Developer workflows', 'Automation workflows']),
    ],
  );
}

async function main() {
  const categoryMap = await getCategoryIdMap();
  const missingCategories = ['research', 'developer-tools', 'automation'].filter((slug) => !categoryMap.has(slug));
  if (missingCategories.length > 0) {
    throw new Error(`Missing categories: ${missingCategories.join(', ')}`);
  }

  for (const tool of TOOLS) {
    await upsertTool(tool, categoryMap.get(tool.categorySlug) || null);
  }

  const counts = await pool.query(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status = 'published')::int AS published
    FROM tools
  `);

  console.log(
    JSON.stringify(
      {
        insertedNames: TOOLS.map((tool) => tool.name),
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
