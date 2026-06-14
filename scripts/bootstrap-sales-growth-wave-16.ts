/* eslint-disable no-restricted-syntax, no-continue, no-nested-ternary, no-await-in-loop */
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
    name: 'apollo-io',
    title: 'Apollo.io',
    url: 'https://www.apollo.io',
    categorySlug: 'productivity',
    tags: ['sales', 'lead-generation', 'prospecting', 'crm', 'outbound'],
    summary:
      'A sales intelligence and outbound platform for prospect data, enrichment, sequencing, and pipeline support.',
    detail:
      'Apollo.io matters when the job is not only finding names but turning account research into workable outreach. It is usually shortlisted when teams want prospect data, contact enrichment, list building, and outbound execution in one place.',
    pricing: 'freemium',
    features: ['Prospect database', 'Contact enrichment', 'Outbound sequencing'],
    useCases: ['Lead discovery', 'Account research', 'Outbound workflow prep', 'Sales pipeline support'],
  },
  {
    name: 'clay',
    title: 'Clay',
    url: 'https://www.clay.com',
    categorySlug: 'automation',
    tags: ['sales', 'lead-generation', 'enrichment', 'automation', 'go-to-market'],
    summary:
      'A workflow-driven enrichment platform for turning fragmented lead data into richer outbound and research workflows.',
    detail:
      'Clay becomes relevant when the real problem is not just collecting leads but enriching, scoring, and routing them into a more intelligent go-to-market workflow. It is strongest for operators who want flexible enrichment and workflow composition.',
    pricing: 'paid',
    features: ['Lead enrichment', 'Workflow tables', 'Flexible data composition'],
    useCases: ['List enrichment', 'Lead scoring', 'Prospect prioritization', 'GTM workflow operations'],
  },
  {
    name: 'instantly',
    title: 'Instantly',
    url: 'https://instantly.ai',
    categorySlug: 'productivity',
    tags: ['sales', 'prospecting', 'outbound', 'email', 'lead-generation'],
    summary:
      'An outbound platform for email prospecting, campaign scaling, inbox rotation, and early-stage sales outreach.',
    detail:
      'Instantly is most relevant when the decision has already moved into sending outreach at scale. It is less about broad CRM process and more about prospecting throughput, email operations, and outbound momentum.',
    pricing: 'paid',
    features: ['Email outreach', 'Inbox rotation', 'Campaign scaling'],
    useCases: ['Cold outbound', 'Prospecting campaigns', 'Reply tracking', 'Outbound testing'],
  },
  {
    name: 'lemlist',
    title: 'Lemlist',
    url: 'https://www.lemlist.com',
    categorySlug: 'productivity',
    tags: ['sales', 'prospecting', 'outbound', 'personalization', 'email'],
    summary: 'A sales engagement tool for personalized outbound messaging, sequencing, and prospecting workflows.',
    detail:
      'Lemlist matters when the team cares about outreach quality and personalization rather than only sending volume. It fits best when response rate and message context matter as much as automation.',
    pricing: 'paid',
    features: ['Personalized outreach', 'Sales sequences', 'Outbound engagement'],
    useCases: ['Cold outreach', 'Prospecting personalization', 'Follow-up sequences', 'Sales experiments'],
  },
  {
    name: 'smartlead',
    title: 'Smartlead',
    url: 'https://www.smartlead.ai',
    categorySlug: 'automation',
    tags: ['sales', 'prospecting', 'outbound', 'email', 'automation'],
    summary:
      'An outbound automation platform for scaling cold email campaigns, inbox infrastructure, and reply operations.',
    detail:
      'Smartlead is useful when cold email has become an operating system rather than a side experiment. It usually enters the shortlist when teams want more sending control, inbox management, and scaled prospecting workflows.',
    pricing: 'paid',
    features: ['Cold email scaling', 'Inbox management', 'Reply operations'],
    useCases: ['Outbound infrastructure', 'Prospecting at scale', 'Campaign operations', 'Inbox orchestration'],
  },
  {
    name: 'reply-io',
    title: 'Reply.io',
    url: 'https://reply.io',
    categorySlug: 'automation',
    tags: ['sales', 'prospecting', 'outbound', 'email', 'sales-engagement'],
    summary: 'A sales engagement platform for outreach automation, prospecting workflows, and multi-step follow-up.',
    detail:
      'Reply.io fits when a team needs a more structured outreach workflow with sequencing, contact handling, and follow-up logic. It is especially relevant for teams comparing prospecting execution rather than just lead discovery.',
    pricing: 'paid',
    features: ['Sales engagement', 'Multi-step sequences', 'Follow-up automation'],
    useCases: ['Outbound sequencing', 'Prospecting execution', 'Follow-up workflows', 'Sales engagement operations'],
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
    en: `${tool.detail}\n\nThis entry was added as a published seed so the directory can deepen around real lead generation and sales prospecting workflows.`,
    zh: `${tool.detail}\n\n此条目已作为正式种子收录，方便目录围绕真实获客与销售拓客工作流继续补强。`,
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
      JSON.stringify(tool.useCases || ['Lead generation', 'Prospecting', 'Sales workflows']),
    ],
  );
}

async function main() {
  const categoryMap = await getCategoryIdMap();
  const missingCategories = ['productivity', 'automation'].filter((slug) => !categoryMap.has(slug));
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
