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

type TagSeed = {
  slug: string;
  en: string;
  zh: string;
};

const EXTRA_TAGS: TagSeed[] = [
  { slug: 'seo', en: 'SEO', zh: 'SEO' },
  { slug: 'keyword-research', en: 'Keyword Research', zh: '关键词研究' },
  { slug: 'competitive-analysis', en: 'Competitive Analysis', zh: '竞品分析' },
  { slug: 'website-planning', en: 'Website Planning', zh: '网站规划' },
  { slug: 'transcription', en: 'Transcription', zh: '转录' },
  { slug: 'speech-to-text', en: 'Speech to Text', zh: '语音转文字' },
  { slug: 'text-to-speech', en: 'Text to Speech', zh: '文字转语音' },
  { slug: 'workflow-automation', en: 'Workflow Automation', zh: '工作流自动化' },
  { slug: 'voice', en: 'Voice', zh: '语音' },
  { slug: 'automation', en: 'Automation', zh: '自动化' },
  { slug: 'research', en: 'Research', zh: '研究' },
  { slug: 'developer-tools', en: 'Developer Tools', zh: '开发者工具' },
];

const VOICE_AND_AUTOMATION_TOOLS: ToolSeed[] = [
  {
    name: 'deepgram',
    title: 'Deepgram',
    url: 'https://deepgram.com',
    categorySlug: 'voice',
    tags: ['voice', 'speech-to-text', 'transcription', 'api'],
    summary: 'A speech AI platform for transcription, speech understanding, and voice-first product workflows.',
    detail:
      'Deepgram is a solid voice category entry for teams building transcription, speech analytics, and voice-native product experiences.',
    pricing: 'freemium',
    features: ['Speech-to-text APIs', 'Voice intelligence', 'Developer-friendly integration'],
    useCases: ['Meeting transcription', 'Voice product workflows', 'Speech analytics', 'Audio search'],
  },
  {
    name: 'assemblyai',
    title: 'AssemblyAI',
    url: 'https://www.assemblyai.com',
    categorySlug: 'voice',
    tags: ['voice', 'speech-to-text', 'transcription', 'developer-tools'],
    summary: 'A speech AI platform for transcription, summarization, and production-ready voice intelligence APIs.',
    detail:
      'AssemblyAI fits the voice category well for builders who need reliable speech APIs and post-processing around real audio input.',
    pricing: 'freemium',
    features: ['Transcription APIs', 'Audio intelligence', 'Developer tooling'],
    useCases: ['Podcast transcription', 'Voice interfaces', 'Call analytics', 'Speech summarization'],
  },
  {
    name: 'murf',
    title: 'Murf',
    url: 'https://murf.ai',
    categorySlug: 'voice',
    tags: ['voice', 'text-to-speech', 'audio'],
    summary: 'An AI voice generation platform for narration, explainers, and polished audio output.',
    detail: 'Murf gives the voice category a clear text-to-speech and narration angle for creators and product teams.',
    pricing: 'freemium',
    features: ['AI voiceovers', 'Text-to-speech', 'Narration workflows'],
    useCases: ['Marketing narration', 'Explainer audio', 'Product demos', 'Voice content production'],
  },
  {
    name: 'n8n',
    title: 'n8n',
    url: 'https://n8n.io',
    categorySlug: 'automation',
    tags: ['automation', 'workflow-automation', 'no-code', 'developer-tools'],
    summary:
      'A workflow automation platform for connecting apps, orchestrating steps, and building repeatable internal flows.',
    detail:
      'n8n is a strong automation category benchmark because users often compare it when they want more control than lightweight no-code triggers.',
    pricing: 'freemium',
    features: ['Workflow builder', 'App integrations', 'Flexible automation logic'],
    useCases: ['Internal automations', 'Lead routing', 'Ops workflows', 'Agent orchestration'],
  },
  {
    name: 'make',
    title: 'Make',
    url: 'https://www.make.com',
    categorySlug: 'automation',
    tags: ['automation', 'workflow-automation', 'no-code'],
    summary: 'A visual automation platform for connecting services and running repeatable business workflows.',
    detail:
      'Make belongs in the automation category because it is a common choice for founders and operators building repeatable cross-tool workflows.',
    pricing: 'freemium',
    features: ['Visual automations', 'Cross-tool workflows', 'No-code scenarios'],
    useCases: ['Marketing automations', 'CRM sync', 'Back-office workflows', 'Data routing'],
  },
  {
    name: 'gumloop',
    title: 'Gumloop',
    url: 'https://www.gumloop.com',
    categorySlug: 'automation',
    tags: ['automation', 'workflow-automation', 'ai-agent', 'no-code'],
    summary:
      'An AI automation builder for assembling workflows, agents, and repeatable operations without heavy engineering overhead.',
    detail:
      'Gumloop strengthens the automation category with a more AI-native workflow builder angle, which fits your current directory direction well.',
    pricing: 'freemium',
    features: ['AI workflow builder', 'Agent-style automations', 'Low-code operations'],
    useCases: ['Research workflows', 'Lead enrichment', 'Agent pipelines', 'Operational automations'],
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

async function upsertTags() {
  const pool = getPool();
  for (const tag of EXTRA_TAGS) {
    await pool.query(
      `
        INSERT INTO tags (name, slug)
        VALUES ($1::jsonb, $2)
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name
      `,
      [JSON.stringify({ en: tag.en, zh: tag.zh }), tag.slug],
    );
  }
}

async function getCategoryIdMap() {
  const pool = getPool();
  const rows = await pool.query('SELECT id, slug FROM categories');
  return new Map<string, string>(rows.rows.map((row) => [String(row.slug), String(row.id)]));
}

async function updateSigoo(categoryIdMap: Map<string, string>) {
  const pool = getPool();
  const researchCategoryId = categoryIdMap.get('research');
  if (!researchCategoryId) {
    throw new Error('Missing research category');
  }

  const result = await pool.query(
    `
      UPDATE tools
      SET
        title = $1::jsonb,
        content = $2::jsonb,
        detail = $3::jsonb,
        category_id = $4,
        tags = $5,
        features = $6::jsonb,
        use_cases = $7::jsonb,
        updated_at = NOW()
      WHERE name = 'sigoo'
      RETURNING id, name
    `,
    [
      JSON.stringify({ en: 'Sigoo.ai', zh: 'Sigoo.ai' }),
      JSON.stringify({
        en: 'An SEO intelligence platform for discovering keyword opportunities, planning website structures, and understanding competitive landscapes.',
        zh: '一个面向独立开发者、AI 构建者与 SaaS 创始人的 SEO Intelligence 平台，用于发现关键词机会、规划网站结构并理解竞争格局。',
      }),
      JSON.stringify({
        en: 'Sigoo.ai is an SEO intelligence platform designed for indie hackers, AI builders, and SaaS founders. The current MVP focuses on discovery rather than execution, with a workflow that moves from keyword discovery to website planning and competitive landscape analysis. The goal is to ship within 30 days, validate product-market fit through retention, and learn whether recurring revenue can be sustained from a focused planning workflow.',
        zh: 'Sigoo.ai 是一个面向独立开发者、AI 构建者和 SaaS 创始人的 SEO Intelligence 平台。当前 MVP 重点放在“发现与判断”，而不是内容执行本身，核心流程从关键词发现延伸到网站结构规划，再到竞争格局理解。目标是在 30 天内完成上线，通过用户留存与经常性收入验证产品是否有真实市场需求。',
      }),
      researchCategoryId,
      ['seo', 'keyword-research', 'competitive-analysis', 'website-planning', 'research'],
      JSON.stringify({
        'Core focus': 'SEO intelligence and discovery',
        'Built for': 'Indie hackers, AI builders, and SaaS founders',
        Workflow: 'Keyword discovery → website planning → competitive landscape analysis',
        Stage: 'MVP in progress, focused on validation within 30 days',
      }),
      JSON.stringify([
        'Keyword opportunity discovery',
        'Website structure planning',
        'Competitive landscape analysis',
        'Early-stage SaaS content strategy',
      ]),
    ],
  );

  return result.rows[0] || null;
}

async function upsertTool(tool: ToolSeed, categoryId: string | null) {
  const pool = getPool();
  const normalizedUrl = new URL(tool.url).toString();
  const title = { en: tool.title, zh: tool.title };
  const summary = { en: tool.summary, zh: tool.summary };
  const detail = {
    en: `${tool.detail}\n\nThis entry was added as a published seed so the directory can keep improving around voice and automation workflows.`,
    zh: `${tool.detail}\n\n此条目已作为正式种子收录，方便目录围绕语音与自动化工作流继续补齐。`,
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
      JSON.stringify(tool.useCases || ['Voice workflows', 'Automation workflows']),
    ],
  );
}

async function main() {
  loadLocalEnv();
  await upsertTags();
  const categoryIdMap = await getCategoryIdMap();

  const missingCategories = ['research', 'voice', 'automation'].filter((slug) => !categoryIdMap.has(slug));
  if (missingCategories.length > 0) {
    throw new Error(`Missing categories: ${missingCategories.join(', ')}`);
  }

  const sigoo = await updateSigoo(categoryIdMap);

  for (const tool of VOICE_AND_AUTOMATION_TOOLS) {
    await upsertTool(tool, categoryIdMap.get(tool.categorySlug) || null);
  }

  const counts = await getPool().query(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status = 'published')::int AS published,
      COUNT(*) FILTER (WHERE status = 'draft')::int AS draft
    FROM tools
  `);

  console.log(
    JSON.stringify(
      {
        updatedSigoo: sigoo,
        insertedNames: VOICE_AND_AUTOMATION_TOOLS.map((tool) => tool.name),
        summary: counts.rows[0],
      },
      null,
      2,
    ),
  );

  await getPool().end();
}

main().catch(async (error) => {
  console.error(error);
  process.exitCode = 1;
});
